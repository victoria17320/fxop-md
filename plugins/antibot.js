const { Module } = require("../lib");
const { parsedJid } = require("../lib/functions");
const { banUser, unbanUser, isBanned } = require("../lib/db/ban");

Module(
	{
		on: "message",
		fromMe: true,
		dontAddCommandList: true,
	},
	async (message, match) => {
		if (!message.isBaileys) return;
		const isban = await isBanned(message.jid);
		if (!isban) return;
		await message.reply("_Bot is banned in this chat_");
		const jid = parsedJid(message.participant);
		return await message.client.groupParticipantsUpdate(message.jid, jid, "remove");
	},
);

Module(
	{
		pattern: "antibot ?(.*)",
		fromMe: true,
		desc: "Turn antibot on or off",
		type: "group",
	},
	async (message, match) => {
		if (!message.isGroup) return await message.reply("_This command is for groups_");
		const isUserAdmin = await isAdmin(message.jid, message.participant, client);
		if (!isUserAdmin) return await message.reply("_You need to be an admin to use this command_");
		const chatid = message.jid;
		const command = match.trim().toLowerCase();
		if (command !== "on" && command !== "off") return await message.reply("Usage: .antibot on/off");
		const isban = await isBanned(chatid);
		if (command === "on") {
			if (isban) return await message.reply("Antibot is already active in this chat");
			await banUser(chatid);
			return await message.reply("Antibot activated. Bot will not respond in this chat.");
		} else if (command === "off") {
			if (!isban) return await message.reply("Antibot is not active in this chat");
			await unbanUser(chatid);
			return await message.reply("Antibot deactivated. Bot will now respond in this chat.");
		}
	},
);

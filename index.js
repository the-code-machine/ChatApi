const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

app.use(cors());

// Connect to MongoDB
const MONGO_URL = "mongodb+srv://1811duggu:f2zmOipSW4Rp1x4i@cluster0.ah2anor.mongodb.net/IDA"; // Replace with your Atlas URL
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Chat Schema
const chatSchema = new mongoose.Schema({
  room: String,
  author: String,
  message: String,
  image: String,
  time: String,
});

const Chat = mongoose.model("Chat", chatSchema);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://this-is-4-u.web.app",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", async (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);

    // Retrieve chat history from MongoDB
    const chatHistory = await Chat.find({ room: data }).exec();
    socket.emit("load_chat_history", chatHistory);
  });

  socket.on("send_message", async (data) => {
    socket.to(data.room).emit("receive_message", data);

    // Save message to MongoDB
    const newChatMessage = new Chat(data);
    await newChatMessage.save();
  });

  socket.on("send_image", async (data) => {
    socket.to(data.room).emit("receive_image", data);

    // Save image data to MongoDB
    const newImageMessage = new Chat(data);
    await newImageMessage.save();
  });

  socket.on("disconnect", async () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});

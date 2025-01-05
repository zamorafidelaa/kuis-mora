import express from "express";
import pool from "./db.js";

const app = express();

app.use(express.json());

// PROFILE
const validateProfile = (data) => {
    const { full_name, tanggal_lahir, nomor_telepon, alamat, sosial_media } = data;
  
    if (!full_name || full_name.trim() === "") {
      return "Nama lengkap wajib diisi.";
    }
    if (!tanggal_lahir) {
      return "Tanggal lahir wajib diisi.";
    }
    if (nomor_telepon && (isNaN(nomor_telepon) || nomor_telepon.length < 10 || nomor_telepon.length > 15)) {
      return "Nomor telepon harus berupa angka dan memiliki panjang 10-15 karakter.";
    }
    if (sosial_media && sosial_media.trim().length > 100) {
      return "Sosial media tidak boleh lebih dari 100 karakter.";
    }
    return null;
  };
  
  app.get("/profiles", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM profile");
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Terjadi kesalahan saat mengambil data." });
    }
  });
  
  app.post("/profiles", async (req, res) => {
    const { full_name, tanggal_lahir, nomor_telepon, alamat, sosial_media } = req.body;
  
    const error = validateProfile(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
  
    try {
      await pool.query(
        "INSERT INTO profile (full_name, tanggal_lahir, nomor_telepon, alamat, sosial_media) VALUES ($1, $2, $3, $4, $5)",
        [full_name, tanggal_lahir, nomor_telepon, alamat, sosial_media]
      );
      res.status(201).json({ message: "Profile berhasil ditambahkan." });
    } catch (err) {
      res.status(500).json({ error: "Terjadi kesalahan saat menambahkan data." });
    }
  });
  
  app.put("/profiles/:id", async (req, res) => {
    const { id } = req.params;
    const { full_name, tanggal_lahir, nomor_telepon, alamat, sosial_media } = req.body;
  
    const error = validateProfile(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
  
    try {
      const result = await pool.query(
        "UPDATE profile SET full_name = $1, tanggal_lahir = $2, nomor_telepon = $3, alamat = $4, sosial_media = $5 WHERE id = $6 RETURNING *",
        [full_name, tanggal_lahir, nomor_telepon, alamat, sosial_media, id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: `Profile dengan ID ${id} tidak ditemukan.` });
      }
  
      res.status(200).json({ message: "Profile berhasil diperbarui.", data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: "Terjadi kesalahan saat memperbarui data." });
    }
  });
  
  app.delete("/profiles/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query("DELETE FROM profile WHERE id = $1", [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: `Profile dengan ID ${id} tidak ditemukan.` });
      }
  
      res.status(200).json({ message: `Profile dengan ID ${id} berhasil dihapus.` });
    } catch (err) {
      res.status(500).json({ error: "Terjadi kesalahan saat menghapus data." });
    }
  });


// BUKU
const validateBook = (data) => {
    const { judul, penulis, stok, harga } = data;
  
    if (!judul || judul.trim() === "") {
      return "Judul buku wajib diisi.";
    }
    if (!penulis || penulis.trim() === "") {
      return "Penulis buku wajib diisi.";
    }
    if (stok !== undefined && (isNaN(stok) || stok < 0)) {
      return "Stok harus berupa angka positif atau nol.";
    }
    if (!harga || isNaN(harga) || harga <= 0) {
      return "Harga harus berupa angka positif.";
    }
    return null;
  };
  
  // GET semua buku
  app.get("/buku", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM buku");
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Terjadi kesalahan saat mengambil data buku." });
    }
  });
  
  // POST buku baru
  app.post("/buku", async (req, res) => {
    const { judul, penulis, penerbit, kategori, stok, harga, sinopsis } = req.body;
  
    // Validasi data
    const error = validateBook(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
  
    try {
      await pool.query(
        "INSERT INTO buku (judul, penulis, penerbit, kategori, stok, harga, sinopsis) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [judul, penulis, penerbit, kategori, stok || 0, harga, sinopsis]
      );
      res.status(201).json({ message: "Buku berhasil ditambahkan." });
    } catch (err) {
      res.status(500).json({ error: "Terjadi kesalahan saat menambahkan buku." });
    }
  });
  
  // PUT (update) buku
  app.put("/buku/:id", async (req, res) => {
    const { id } = req.params;
    const { judul, penulis, penerbit, kategori, stok, harga, sinopsis } = req.body;
  
    // Validasi data
    const error = validateBook(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
  
    try {
      const result = await pool.query(
        "UPDATE buku SET judul = $1, penulis = $2, penerbit = $3, kategori = $4, stok = $5, harga = $6, sinopsis = $7 WHERE id = $8 RETURNING *",
        [judul, penulis, penerbit, kategori, stok || 0, harga, sinopsis, id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: `Buku dengan ID ${id} tidak ditemukan.` });
      }
  
      res.status(200).json({ message: "Buku berhasil diperbarui.", data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: "Terjadi kesalahan saat memperbarui buku." });
    }
  });
  
  // DELETE buku
  app.delete("/buku/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query("DELETE FROM buku WHERE id = $1", [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: `Buku dengan ID ${id} tidak ditemukan.` });
      }
  
      res.status(200).json({ message: `Buku dengan ID ${id} berhasil dihapus.` });
    } catch (err) {
      res.status(500).json({ error: "Terjadi kesalahan saat menghapus buku." });
    }
  });
  
app.listen(3000, () => {
    console.log("Server telah berjalan");
  });
  
# Changelog

Cambios de formato, de documentación y de la publicación. Los cambios de
datos de cada pasada están en los commits (`data: +nuevos ~modificados
-eliminados`) y en las releases numeradas.

## 2026-11-14 — schema v2 y tablas Parquet

Todo son añadidos: nada de lo que había cambia de nombre ni de sitio.

- **Tablas Parquet**: `models`, `metrics` (serie diaria de likes y
  descargas desde el 15 de septiembre de 2026), `fichas_es`, `fichas_en`,
  `tombstones` y `renames`, con su `manifest.json` (filas, tamaño y
  SHA-256). Se publican en
  [Hugging Face](https://huggingface.co/datasets/686f6c61/radar-huggingface-dataset)
  y en la release `latest`.
- **Schema v2** del documento por modelo, con cinco campos nuevos:
  `context_length`, `disabled`, `removal_pattern`, `renamed_to` y
  `renamed_at`. El campo `schema` pasa de 1 a 2.
- `index.json`: cada entrada lleva además `id` y `path`.
- Fichas en inglés: se publican por primera vez (tabla `fichas_en`).
- JSON Schema del documento por modelo en `schema/model.schema.json` y
  `CITATION.cff` para citar el dataset.
- README reescrito (ES y EN): qué hay, cómo usarlo, de dónde sale cada dato
  y sus límites. Las rutas de ejemplo estaban mal (`qwen3.8-27b.json`); la
  correcta es `data/qwen/qwen3-8-27b.json`.

## 2026-11-14 — correcciones de documentación

- README (ES y EN) corregido: el dataset no contiene solo modelos con
  licencia abierta. De 129.885 modelos, 90.148 son `oss`, 37.439 `unknown`
  y 2.298 `non-commercial`; se filtra por `license_family`.
- README corregido: cada fichero lleva la foto actual de likes y descargas,
  no series por ventanas de tiempo. La evolución sale de comparar releases.
- `LICENSE` pasa a contener el texto legal completo de CC-BY-4.0 (antes,
  un resumen). La atribución sugerida se mueve al README.

## 2026-09-22

- CI con control de frescura: falla si el dataset lleva más de 20 h sin
  publicarse.
- El bulk `models.jsonl.gz` se construye en streaming.
- El repositorio pasa a contener solo datos, documentación y los scripts de
  su CI.
- Las releases de las franjas del 17 al 22 de septiembre, en las que el
  worker estuvo caído, se reconstruyeron desde la base del radar y lo
  indican en sus notas.

## 2026-08-18

- Primera publicación: **9.534 modelos** (export completo desde HF//RADAR).
- Schema v1.

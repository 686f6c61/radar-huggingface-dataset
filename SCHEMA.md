# Schema v1

Un documento por modelo en `data/{autor}/{modelo}.json`.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `schema` | number | Versión del schema (actual: 1) |
| `id` | string | ID completo en HF (`autor/modelo`) |
| `slug` | string | Slug URL-safe usado por el radar |
| `author` | string | Organización o usuario |
| `url` | string | URL pública en HF |
| `created_at` | string\|null | Alta en HF (ISO 8601) |
| `updated_at` | string\|null | Última modificación en HF |
| `license` | string\|null | Licencia declarada (cruda) |
| `license_family` | string | `oss` · `non-commercial` · `unknown` (clasificación propia) |
| `pipeline_tag` | string\|null | Tarea principal (`text-generation`, ...) |
| `library` | string\|null | Librería (`transformers`, `gguf`, `diffusers`...) |
| `languages` | string[] | Idiomas declarados en la card |
| `tags` | string[] | Tags crudos de HF |
| `likes` | number | Likes totales |
| `downloads_30d` | number | Descargas de los últimos 30 días (así lo publica HF) |
| `trending_score` | number | Última puntuación de tendencia conocida (0 si nunca apareció en trending) |
| `parameters` | number\|null | Parámetros reales (safetensors o GGUF); null si HF no lo calcula |
| `parameters_human` | string\|null | Formato legible (`29.78B`) |
| `storage_bytes` | number\|null | Tamaño del repo en bytes |
| `storage_human` | string\|null | Formato legible (`59.6 GB`) |
| `base_model` | string\|null | Modelo(s) base declarados en la card |
| `formats` | string[] | Formatos de distribución derivados: `gguf`, `mlx`, `onnx`, `safetensors`, `diffusers` |
| `is_conversational` | boolean | Tag `conversational` de HF (chat/instrucción) |
| `gated` | boolean | Acceso restringido en HF |
| `removed` | boolean | Retirado de HF (detectado por 404 real) |
| `removed_at` | string\|null | Cuándo se detectó la retirada |
| `benchmarks` | object[] | Métricas del model-index: `{task, dataset, metric, value}`. Vacío = no capturados, **no** "sin benchmarks" |
| `sources` | object[] | Fuentes web usadas al documentar: `{title, url, snippet}`. Best effort, puede estar vacío |

## Notas

- Los nulls son explícitos: un campo ausente de HF aparece como `null`, nunca se omite la clave.
- `readme` no se publica: se usa para generar la ficha y se descarta.
- La ficha vive en el `.md` hermano; en el bulk (`models.jsonl.gz`) además va embebida como campo `ficha`.

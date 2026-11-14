# Schema v2

Dos formas del mismo dato: un documento JSON por modelo en
`data/{autor}/{modelo}.json` y las tablas Parquet. Los cambios entre versiones
están en [CHANGELOG.md](CHANGELOG.md).

## Documento por modelo (`data/{autor}/{modelo}.json`)

También en formato JSON Schema: [`schema/model.schema.json`](schema/model.schema.json).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `schema` | number | Versión del schema (actual: 2) |
| `id` | string | Id completo en Hugging Face (`autor/modelo`) |
| `slug` | string | Slug apto para URL que usa el radar; único |
| `author` | string | Organización o usuario |
| `url` | string | Página del modelo en Hugging Face |
| `created_at` | string\|null | Alta en Hugging Face (ISO 8601) |
| `updated_at` | string\|null | Última modificación en Hugging Face |
| `license` | string\|null | Licencia declarada (tal cual) |
| `license_family` | string | `oss` · `non-commercial` · `unknown` (clasificación propia) |
| `pipeline_tag` | string\|null | Tarea principal (`text-generation`, ...) |
| `library` | string\|null | Librería (`transformers`, `gguf`, `diffusers`...) |
| `languages` | string[] | Idiomas declarados en la card |
| `tags` | string[] | Tags de Hugging Face, tal cual |
| `likes` | number | Likes totales |
| `downloads_30d` | number | Descargas de los últimos 30 días (así lo publica Hugging Face) |
| `trending_score` | number | Última puntuación de tendencia conocida (0 si nunca estuvo en tendencia) |
| `parameters` | number\|null | Parámetros (safetensors o GGUF); null si Hugging Face no lo calcula |
| `parameters_human` | string\|null | Formato legible (`29.78B`) |
| `storage_bytes` | number\|null | Tamaño del repositorio en bytes |
| `storage_human` | string\|null | Formato legible (`59.6 GB`) |
| `context_length` | number\|null | Longitud de contexto de los metadatos GGUF; null si no hay. **Nuevo en v2** |
| `base_model` | string\|null | Modelo o modelos base declarados en la card, tal cual |
| `formats` | string[] | Formatos derivados de tags y librería: `gguf`, `mlx`, `onnx`, `safetensors`, `diffusers` |
| `is_conversational` | boolean | Tag `conversational` de Hugging Face |
| `gated` | boolean | Acceso restringido en Hugging Face |
| `disabled` | boolean | Hugging Face da el repositorio por deshabilitado. **Nuevo en v2** |
| `removed` | boolean | Retirado de Hugging Face (404 real) |
| `removed_at` | string\|null | Cuándo se detectó la retirada |
| `removal_pattern` | string\|null | Patrón observado de la retirada (ver abajo); null si no está retirado. **Nuevo en v2** |
| `renamed_to` | string\|null | Id nuevo si el repositorio cambió de nombre. **Nuevo en v2** |
| `renamed_at` | string\|null | Cuándo se detectó el cambio de nombre. **Nuevo en v2** |
| `benchmarks` | object[] | Métricas del `model-index`: `{task, dataset, metric, value}`. Vacío = no declarados, **no** «sin benchmarks» |
| `sources` | object[] | Fuentes web usadas al redactar la ficha: `{title, url, snippet}`. Puede estar vacío |

Notas:

- Los nulos son explícitos: una clave nunca se omite.
- El README del modelo no se publica: se usa para redactar la ficha y se descarta.
- La ficha vive en el `.md` hermano; en el bulk (`models.jsonl.gz`) va además embebida como campo `ficha`.

### Patrón de retirada (`removal_pattern`)

Hugging Face no publica por qué desaparece un modelo. El patrón es lo que
dejan los datos del catálogo, **no una causa confirmada**. Cada modelo
retirado recibe el primero que cumple, en este orden:

| Valor | Significado |
|---|---|
| `account_gone` | El autor no conserva ningún modelo vivo en el catálogo (y tenía al menos 2) |
| `author_purge` | El autor retiró 5 o más modelos el mismo día y conserva otros |
| `reupload` | Hay un modelo vivo con el mismo nombre de repositorio en otra cuenta, creado después |
| `short_lived` | Vivió 7 días o menos |
| `had_traction` | Tenía uso real (1.000 descargas o más, o 10 likes o más) |
| `isolated` | Ninguna de las anteriores |

`removed_at` es la fecha del pase diario que detectó la retirada, no la real.

## `index.json`

`{dataset, schema, models, updated_at, entries[]}`. Cada entrada:
`id`, `slug`, `path` (ruta del JSON del modelo), `author`, `pipeline_tag`,
`license_family`, `likes`, `downloads_30d`, `updated_at`, `removed`.
`id` y `path` son nuevos en v2.

## Tablas Parquet

Publicadas en [Hugging Face](https://huggingface.co/datasets/686f6c61/radar-huggingface-dataset)
y en la release `latest`. Compresión ZSTD. Todas se cruzan por el id del
modelo. Las fechas son `timestamp` en UTC; las listas, listas nativas de
texto. Cada fichero lleva en sus metadatos `schema`, `exported_at` y `license`.

### `models.parquet`

Una fila por modelo, con los mismos campos que el documento JSON salvo
`schema`, `parameters_human` y `storage_human`, y con estas diferencias:

| Columna | Tipo | Descripción |
|---|---|---|
| `created_at`, `updated_at`, `removed_at`, `renamed_at` | timestamp | En vez de texto ISO |
| `languages`, `tags`, `formats` | list\<string\> | Nunca nulas; vacías si no hay |
| `likes` | int32 | |
| `downloads_30d`, `parameters`, `storage_bytes`, `context_length` | int64 | |
| `trending_score` | double | |
| `benchmarks`, `sources` | string | El array en texto JSON |
| `has_ficha_en` | boolean | Hay ficha en inglés vigente en `fichas_en` |
| `path` | string | Ruta del JSON del modelo en el repositorio de GitHub |

### `metrics.parquet`

| Columna | Tipo | Descripción |
|---|---|---|
| `model_id` | string | Id del modelo |
| `ts` | timestamp | Momento de la lectura (pase diario, hacia las 02:00 UTC) |
| `likes` | int32 | Likes totales en ese momento |
| `downloads_30d` | int64 | Descargas de 30 días en ese momento |
| `trending_score` | double | Puntuación de tendencia en ese momento |

Ordenada por modelo y fecha. Empieza el 15 de septiembre de 2026. Los modelos
con uso real (50 descargas o más, 2 likes o más, o creados en los últimos 21
días) tienen un punto diario; el resto, uno por semana aproximadamente.

### `fichas_es.parquet` y `fichas_en.parquet`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | string | Id del modelo |
| `slug` | string | Slug del modelo |
| `summary` | string | Resumen de un párrafo (solo en `fichas_en`) |
| `ficha` | string | La ficha, en Markdown |
| `translated_at` | timestamp | Cuándo se tradujo (solo en `fichas_en`) |

Las fichas las redacta un modelo de lenguaje; las inglesas son traducciones
automáticas y solo se publican mientras corresponden a la ficha actual.

### `tombstones.parquet`

Una fila por modelo retirado: `id`, `author`, `pipeline_tag`,
`license_family`, `base_model`, `parameters`, `created_at`, `removed_at`,
`lifetime_days` (días entre el alta en Hugging Face y la retirada detectada),
`removal_pattern`, `likes` y `downloads_30d` (últimas cifras conocidas).

### `renames.parquet`

`from_id` (id antiguo), `to_id` (id nuevo), `renamed_at`.

### `manifest.json`

`{dataset, schema, exported_at, models, tables}`. De cada tabla: `file`,
`rows`, `bytes` y `sha256`. Es lo último que se escribe en cada export: si su
`exported_at` coincide con el `updated_at` de `index.json`, las tablas y los
ficheros por modelo son de la misma pasada.

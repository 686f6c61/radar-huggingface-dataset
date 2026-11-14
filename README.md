# Radar Hugging Face Dataset

![CI](https://github.com/686f6c61/radar-huggingface-dataset/actions/workflows/validate.yml/badge.svg)
![actualización](https://img.shields.io/badge/actualizaci%C3%B3n-3%20veces%20al%20d%C3%ADa-e61919)
![licencia](https://img.shields.io/badge/licencia-CC--BY--4.0-blue)
![estrellas](https://img.shields.io/github/stars/686f6c61/radar-huggingface-dataset?style=social)

> [English version](README.en.md)

Dataset abierto y versionado sobre los modelos que se publican en Hugging
Face: metadatos normalizados, licencia clasificada, serie diaria de likes y
descargas, los modelos que desaparecen del hub, los que cambian de nombre y
una ficha técnica en castellano de cada uno (y en inglés de una parte cada
vez mayor).

Lo genera **[HF//RADAR](https://radar-huggingface.686f6c61.dev)**, un radar
que sigue el hub y redacta una ficha de cada modelo que indexa. Este
repositorio es su salida de datos y se actualiza tres veces al día.

**Si te es útil, una estrella en GitHub ayuda a que lo encuentre más gente.**

## Qué hay dentro

Cifras del 14 de noviembre de 2026 (las actuales están en `index.json` y en
`manifest.json`):

| | |
|---|---|
| Modelos | 130.647, de 42.119 autores |
| Con licencia abierta (`oss`) | 90.724 |
| Sin licencia declarada o no reconocida (`unknown`) | 37.610 |
| Con licencia no comercial (`non-commercial`) | 2.313 |
| Retirados del hub (se conservan, marcados) | 10.263 |
| Renombrados | 2.992 |
| Puntos de la serie de métricas | 3.424.740, desde el 15 de septiembre de 2026 |
| Fichas en castellano | 130.647 |
| Fichas en inglés | 23.544 |

**No todos los modelos tienen licencia abierta.** Cada uno lleva su licencia
clasificada en `license_family`; si solo quieres los abiertos, filtra por
`license_family = "oss"`.

## Para qué sirve

La API de Hugging Face responde cómo está un modelo hoy. Este dataset permite
preguntar otras cosas:

- **Qué se publica y quién lo publica**: organizaciones, licencias, tamaños,
  tareas y formatos (GGUF, MLX, safetensors, ONNX, diffusers).
- **Qué gana tracción**: la tabla `metrics` guarda likes, descargas de 30 días
  y puntuación de tendencia de cada modelo, día a día.
- **Qué desaparece**: el hub no anuncia las bajas. Aquí cada modelo retirado
  queda con su fecha, lo que vivió y el patrón que dejó su retirada.
- **Qué cambia de nombre**: el id antiguo, el nuevo y la fecha.
- **Qué es cada modelo**: una ficha técnica en castellano (qué hace, para qué
  sirve, requisitos, limitaciones).

## Cuatro formas de usarlo

| Forma | Dónde | Para qué |
|---|---|---|
| **Tablas Parquet** | [Hugging Face](https://huggingface.co/datasets/686f6c61/radar-huggingface-dataset) y release [`latest`](https://github.com/686f6c61/radar-huggingface-dataset/releases/tag/latest) | Análisis con pandas, DuckDB, Polars o `datasets`. Lo recomendado |
| **Un fichero por modelo** | `data/{autor}/{modelo}.json` y `.md` | Consultar un modelo suelto o seguir sus cambios en el historial de git |
| **Bulk JSONL** | `models.jsonl.gz` en cada release | Todo en un fichero, con la ficha embebida |
| **Manifiesto** | `index.json` | Lista de todos los modelos con sus campos clave y la ruta de su fichero |

## Qué encontrarás en el Parquet

Seis tablas que se cruzan por el id del modelo en Hugging Face (`id`, o
`model_id` en `metrics`). El detalle de cada columna está en
[SCHEMA.md](SCHEMA.md).

| Tabla | Filas | Qué es |
|---|---|---|
| `models.parquet` | 130.647 | Una fila por modelo: metadatos, licencia, tamaño, formatos, avisos |
| `metrics.parquet` | 3.424.740 | Serie temporal: likes, descargas de 30 días y tendencia por modelo y día |
| `fichas_es.parquet` | 130.647 | La ficha técnica de cada modelo en castellano (Markdown) |
| `fichas_en.parquet` | 23.544 | La traducción de la ficha al inglés, donde la hay |
| `tombstones.parquet` | 10.263 | Modelos retirados del hub, con lo que vivieron y el patrón de su retirada |
| `renames.parquet` | 2.992 | Repositorios renombrados: id antiguo, id nuevo y fecha |

En `models` encontrarás, entre otras columnas:

- **Identidad**: `id`, `author`, `url`, `created_at`, `updated_at`.
- **Licencia**: `license` (tal como la declara el autor) y `license_family`.
- **Qué es**: `pipeline_tag`, `library`, `languages`, `tags`, `base_model`,
  `formats`, `is_conversational`.
- **Tamaño**: `parameters`, `storage_bytes`, `context_length`.
- **Uso**: `likes`, `downloads_30d`, `trending_score` (última lectura).
- **Avisos**: `gated`, `disabled`, `removed`, `removed_at`, `removal_pattern`,
  `renamed_to`, `renamed_at`.
- **Extras**: `benchmarks` (los que declara la model card), `sources` (fuentes
  web usadas al redactar la ficha), `has_ficha_en` y `path` (ruta del JSON de
  ese modelo en este repositorio).

Las listas (`tags`, `languages`, `formats`) son listas nativas de Parquet, no
texto: se filtran con `list_contains` en DuckDB o `explode` en pandas.

```python
# pandas, desde Hugging Face
import pandas as pd
models = pd.read_parquet("hf://datasets/686f6c61/radar-huggingface-dataset/models.parquet")
metrics = pd.read_parquet("hf://datasets/686f6c61/radar-huggingface-dataset/metrics.parquet")
```

```python
# datasets
from datasets import load_dataset
models = load_dataset("686f6c61/radar-huggingface-dataset", "models", split="train")
```

```sql
-- DuckDB: los GGUF que más descargas han ganado en los últimos 7 días
SELECT m.id, max(x.downloads_30d) - min(x.downloads_30d) AS ganadas
FROM 'hf://datasets/686f6c61/radar-huggingface-dataset/metrics.parquet' x
JOIN 'hf://datasets/686f6c61/radar-huggingface-dataset/models.parquet' m ON m.id = x.model_id
WHERE x.ts >= now() - INTERVAL 7 DAY AND list_contains(m.formats, 'gguf')
GROUP BY 1 ORDER BY ganadas DESC LIMIT 20;
```

```sql
-- DuckDB: cuánto viven los modelos retirados, según el patrón de su retirada
SELECT removal_pattern, count(*) AS modelos, median(lifetime_days) AS dias
FROM 'https://github.com/686f6c61/radar-huggingface-dataset/releases/download/latest/tombstones.parquet'
GROUP BY 1 ORDER BY modelos DESC;
```

`manifest.json` acompaña a las tablas con la fecha del export, las filas, el
tamaño y el SHA-256 de cada una, para comprobar una descarga.

## Un fichero por modelo: `data/`

Una carpeta por autor y, dentro, dos ficheros por modelo: el `.json` con los
metadatos y el `.md` con la ficha.

```
data/
├── qwen/
│   ├── qwen3-8-27b.json          # metadatos (SCHEMA.md)
│   ├── qwen3-8-27b.md            # ficha técnica en castellano
│   ├── qwen3-8-27b-fp8.json
│   └── qwen3-8-27b-fp8.md
├── sentence-transformers/
│   ├── all-minilm-l6-v2.json
│   └── all-minilm-l6-v2.md
└── ... (miles de autores)
```

- La ruta sale del `slug` del modelo: minúsculas, y los puntos y demás
  símbolos pasan a guiones (`Qwen/Qwen3.8-27B` está en
  `data/qwen/qwen3-8-27b.json`). No hace falta deducirla: `index.json` y la
  columna `path` de `models.parquet` dan la ruta de cada modelo.
- Si dos modelos distintos acaban con el mismo slug (resubidas que solo
  cambian mayúsculas), el más reciente lleva sufijo `-2`, `-3`...
- El `.json` sigue el [SCHEMA.md](SCHEMA.md), versión 2. Los nulos son
  explícitos: una clave nunca se omite.

```bash
# Un modelo suelto
curl -s https://raw.githubusercontent.com/686f6c61/radar-huggingface-dataset/main/data/qwen/qwen3-8-27b.json
```

```python
# Todo el dataset con la ficha embebida (bulk JSONL)
import pandas as pd
url = "https://github.com/686f6c61/radar-huggingface-dataset/releases/download/latest/models.jsonl.gz"
df = pd.read_json(url, lines=True)
```

## De dónde sale cada dato

- **Qué modelos entran.** El radar lee las listas de tendencia, de recién
  creados y de recién actualizados del hub, e indexa lo que aparece en ellas.
  Empezó en agosto de 2026. No es un espejo del hub: un modelo que nunca pasó
  por esas listas no está aquí.
- **Metadatos.** Vienen de la API de Hugging Face. Los textos libres de las
  model cards (licencia, librería, tarea, modelo base) se sanean al entrar.
- **Licencia.** `license` es lo que declara el autor; `license_family` es una
  clasificación propia en tres grupos.
- **Parámetros y contexto.** `parameters` es el recuento que calcula el hub a
  partir de los ficheros safetensors o GGUF; `context_length` sale de los
  metadatos GGUF. Si el hub no los calcula, van a `null`.
- **Métricas.** Un pase diario, hacia las 02:00 UTC, lee likes y descargas de
  cada modelo. Los que tienen uso real (50 descargas o más, 2 likes o más, o
  creados en los últimos 21 días) se leen a diario; el resto, más o menos una
  vez por semana. Por eso el número de puntos por modelo varía (mediana de 27
  y máximo de 61 a 14 de noviembre de 2026).
- **Retirados.** Un modelo se marca como retirado cuando el hub responde 404
  de verdad. `removed_at` es la fecha del pase que lo detectó, no la real.
- **Patrón de retirada.** El hub no publica motivos. `removal_pattern` es el
  patrón que dejan los datos, no una causa confirmada (ver
  [SCHEMA.md](SCHEMA.md)).
- **Renombrados.** El hub redirige el id antiguo al nuevo y el pase diario lo
  anota. El id antiguo conserva su fichero, con `renamed_to`.
- **Fichas.** Las redacta un modelo de lenguaje a partir de la model card y
  de fuentes web (`sources`). Las inglesas son traducciones automáticas de las
  castellanas, y solo se publican mientras corresponden a la ficha actual.
- **Benchmarks.** Son los que el autor declara en el `model-index` de su
  card. Una lista vacía significa que no declaró ninguno, no que no existan.

## Límites que conviene conocer

- `downloads_30d` ya es una ventana móvil de 30 días, tal como la publica el
  hub. La diferencia entre dos días de la serie es la diferencia de esa
  ventana, no las descargas de un día.
- La serie de métricas empieza el 15 de septiembre de 2026. Antes de esa
  fecha solo hay fotos del dataset completo en las releases.
- `base_model` va tal como lo escribe el autor y puede nombrar varios modelos.
- Las fichas pueden contener errores: contrasta con la model card original
  antes de usar un modelo en producción.
- Los ids con pinta de credencial no se publican, y cualquier cosa parecida a
  un token dentro de los datos se sustituye por `[REDACTED]`.

## Cómo se actualiza

Un worker en el servidor del radar corre tres veces al día, a las 06:00,
14:00 y 22:00 (hora peninsular):

1. Exporta desde la base de datos del radar los ficheros por modelo y las
   tablas Parquet.
2. Sube las tablas Parquet a Hugging Face.
3. Hace un commit en este repositorio solo con lo que cambió
   (`data: +nuevos ~modificados -eliminados`) y lo sube.
4. La CI valida el dataset, construye el bulk, adjunta las tablas Parquet a
   la release `latest` y crea la release numerada de esa pasada.

Los ficheros de un modelo se reescriben en su sitio: el árbol refleja siempre
el estado más reciente. El valor anterior queda en el historial de git, en
las releases numeradas y, para likes y descargas, en `metrics.parquet`.

Los modelos retirados no se borran: se quedan con `removed: true`. Solo se
borra un fichero si el modelo se elimina de la base del radar.

## Versionado

Una release por cada pasada con datos nuevos, con la franja en la versión:

| Pasada (hora peninsular) | Franja | Sube | Ejemplo |
|---|---|---|---|
| 06:00 | Mañana | mayor | `v3.0.0` |
| 14:00 | Tarde | menor | `v3.1.0` |
| 22:00 | Noche | parche | `v3.1.1` |

`v14.2.1` es la exportación de la noche del día 14 desde el inicio del
dataset. Las releases numeradas no cambian: para reproducir un análisis, fija
una versión concreta. Los cambios de formato se anuncian subiendo `schema` y
se anotan en [CHANGELOG.md](CHANGELOG.md).

- **Release `latest`**: apunta siempre a la exportación más reciente y las
  direcciones de sus ficheros no cambian. Es la adecuada para un consumo
  recurrente. Lleva el bulk y las tablas Parquet.
- **Releases numeradas**: llevan el bulk `models.jsonl.gz` de esa pasada.

## Comprobaciones

Cada push pasa por la CI: JSON válidos y conformes al esquema, cada `.json`
con su `.md`, `index.json` coherente con el árbol y documentación presente.
Cada 6 horas, además, la CI falla si el dataset lleva más de 20 horas sin
publicarse. El esquema de los ficheros por modelo está también en formato
JSON Schema en [`schema/model.schema.json`](schema/model.schema.json).

## Licencia y cita

[CC-BY-4.0](LICENSE) (texto legal completo en el fichero). Atribución
sugerida: «radar-huggingface-dataset — HF//RADAR
(https://radar-huggingface.686f6c61.dev), datos de Hugging Face Hub,
CC-BY-4.0». Para citarlo en un trabajo, usa [CITATION.cff](CITATION.cff)
(GitHub ofrece el botón «Cite this repository»).

Fuente de los metadatos: [Hugging Face Hub](https://huggingface.co). Fichas
generadas por HF//RADAR. Los datos se ofrecen tal cual.

¿Un dato mal o una ficha desfasada? Abre una
[incidencia](https://github.com/686f6c61/radar-huggingface-dataset/issues).

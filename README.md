# Radar HuggingFace Dataset

![CI](https://github.com/686f6c61/radar-huggingface-dataset/actions/workflows/validate.yml/badge.svg)
![actualización](https://img.shields.io/badge/actualizaci%C3%B3n-3%20veces%20al%20d%C3%ADa-e61919)
![licencia](https://img.shields.io/badge/licencia-CC--BY--4.0-blue)
![estrellas](https://img.shields.io/github/stars/686f6c61/radar-huggingface-dataset?style=social)

> 🇬🇧 [English version](README.en.md)

**Si te es útil, una ⭐ en GitHub ayuda a que lo encuentre más gente.**

**Radar HuggingFace Dataset** es un dataset abierto, vivo y versionado del
ecosistema open source de HuggingFace. Cada día se publican miles de modelos
en el hub y su API solo sabe responder cómo está un modelo *hoy*; aquí
encontrarás, tres veces al día, una foto curada y enriquecida de todo lo que
merece atención: qué se publica, quién lo publica, qué licencia tiene, qué
tracción real consigue, en qué formatos se distribuye, cuántos parámetros
tiene de verdad — y qué modelos desaparecen sin que nadie lo anuncie.

Lo genera **[HF//RADAR](https://radar-huggingface.686f6c61.dev)**, un radar
que analiza los modelos en tendencia y redacta para cada uno una ficha
técnica en castellano. Este repo es su salida de datos: metadatos
normalizados por modelo + su ficha, con histórico auditable.

## El fin de la investigación

HuggingFace publica miles de modelos al día y su API solo responde preguntas
del presente: *cómo está este modelo **hoy***. Este dataset existe para poder
responder preguntas mejores:

- **Qué se publica y quién lo publica** — qué organizaciones dominan el hub,
  con qué licencias, qué tamaños y qué formatos (GGUF, MLX, safetensors...).
- **Qué tiene tracción de verdad** — descargas y likes por ventanas de tiempo,
  no solo el acumulado histórico que favorece a los modelos viejos.
- **Qué desaparece** — el hub no anuncia las bajas. Cada modelo retirado queda
  aquí marcado (`removed`, `removed_at`): son las lápidas del ecosistema.
- **Cómo evoluciona todo** — al actualizarse cada 12 horas y quedar cada
  versión numerada, el historial de releases es una serie temporal del
  ecosistema OSS que no se puede reconstruir a posteriori desde la API.

Y encima, cada modelo lleva una **ficha técnica en castellano** (qué hace,
para qué sirve, requisitos, limitaciones), porque la documentación del hub
es mayoritariamente en inglés y desigual en calidad.

No es un espejo del hub: es una **capa curada** — solo modelos verificados
como open source y con un mínimo de información útil.

## Cómo se estructura `data/`

Una carpeta por autor (organización o usuario de HF) y, dentro, **dos
ficheros por modelo**: el `.json` con los metadatos y el `.md` con la ficha.

```
data/
├── qwen/
│   ├── qwen3.8-27b.json          # metadatos estructurados (SCHEMA.md)
│   ├── qwen3.8-27b.md            # ficha técnica en castellano
│   ├── qwen3.8-27b-fp8.json
│   └── qwen3.8-27b-fp8.md
├── meta-models/
│   ├── muse-glimmer-30b.json
│   └── muse-glimmer-30b.md
└── ... (miles de autores)
```

- El nombre de carpeta es el autor en minúsculas; el nombre de fichero es el
  modelo. Juntos forman el `slug` único del modelo (`autor-nombre`).
- Si dos modelos distintos colisionan de nombre (pasa: re-subidas que solo
  cambian mayúsculas), el más reciente lleva sufijo `-2`, `-3`...
- El `.json` sigue el [SCHEMA.md](SCHEMA.md) (versión 1): licencia clasificada,
  parámetros reales, formatos, benchmarks, KPIs, flags de acceso y retirada.
- El `.md` es la ficha generada por el radar a partir de la model card y
  fuentes web.
- `index.json` (raíz del repo) es el manifiesto ligero: todas las entradas
  con sus campos clave, para descubrir sin descargar el árbol entero.

## Cómo se actualiza

Un worker en el servidor del radar corre **tres veces al día** — 06:00, 14:00
y 22:00 (hora peninsular) — y hace: export
desde la base de datos → escritura incremental (solo se reescribe lo que
cambió) → commit estructurado → push. La CI valida cada push, publica el bulk
actualizado y crea la release numerada correspondiente.

**Si una carpeta hoy tiene unos KPIs y mañana han subido, ¿eso se actualiza?**
**Sí, en el mismo fichero.** El `data/autor/modelo.json` de ese modelo se
reescribe con los nuevos `likes`, `downloads_30d`, `trending_score`... y el
commit del worker lo registra como modificado (`~`). No se crea un fichero
nuevo ni una carpeta nueva: el árbol siempre refleja **el estado más reciente**.

¿Y el valor de ayer? No se pierde:

1. En el **historial de git** (cada commit es un diff auditable), y
2. en las **releases numeradas** (`v1.0.0`, `v2.0.0`...), que son snapshots
   inmutables del dataset completo en ese momento.

Los modelos retirados de HF **no se borran**: su fichero se queda con
`removed: true` y la fecha de retirada. Solo se borra un fichero si el modelo
se elimina de la base del radar (caso excepcional).

## Quickstart

```bash
# Un modelo suelto (metadatos)
curl -s https://raw.githubusercontent.com/686f6c61/radar-huggingface-dataset/main/data/qwen/qwen3.8-27b.json
```

```python
# Todo el dataset con pandas (bulk, ficha incluida)
import pandas as pd
url = "https://github.com/686f6c61/radar-huggingface-dataset/releases/download/latest/models.jsonl.gz"
df = pd.read_json(url, lines=True)
```

```sql
-- DuckDB directo sobre el bulk (sin descargar)
SELECT author, COUNT(*) AS modelos
FROM read_json('https://github.com/686f6c61/radar-huggingface-dataset/releases/download/latest/models.jsonl.gz', format='newline_delimited')
GROUP BY author ORDER BY modelos DESC LIMIT 10;
```

## Versionado

Una release por cada actualización con datos nuevos, con la franja horaria
codificada en la propia versión:

| Pasada (hora peninsular) | Franja | Bump | Ejemplo |
|---|---|---|---|
| 06:00 | Mañana | major | `v3.0.0` |
| 14:00 | Tarde | minor | `v3.1.0` |
| 22:00 | Noche | patch | `v3.1.1` |

Así, al ver `v14.2.1` sabes que es la exportación de la **noche del día 14**
desde el inicio del dataset. Las releases son **inmutables**: para reproducir
un análisis, pinea a una versión concreta. Los cambios de *formato* se
anuncian aparte subiendo `schema` y documentándolo en CHANGELOG.md.

- **Release `latest`** (flotante): siempre apunta a la exportación más
  reciente. Las URLs de sus assets no cambian nunca — es la que quieres para
  consumo recurrente.
- **Commits estructurados** (`data: +12 ~140 -1`): nuevos, modificados y
  eliminados en cada pasada.

## Licencia y atribución

[CC-BY-4.0](LICENSE). Fuente de los metadatos:
[HuggingFace Hub](https://huggingface.co). Fichas generadas por HF//RADAR.
Si usas el dataset, enlaza al repo o al radar.

Los datos se ofrecen "tal cual"; las fichas las redacta un LLM y pueden
contener errores — contrasta con la model card original antes de usar un
modelo en producción.

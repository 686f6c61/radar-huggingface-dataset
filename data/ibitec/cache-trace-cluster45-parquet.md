# ibitec/cache-trace-cluster45-parquet

## Resumen

`ibitec/cache-trace-cluster45-parquet` no es un modelo de lenguaje, sino un conjunto de datos derivado del *cache-trace* público de Twitter, publicado por el usuario `ibitec` en Hugging Face. Contiene el shard completo `cluster45` del espejo oficial de trazas de caché de Twitter, convertido del CSV original a formato Parquet con compresión zstd. El resultado son 227.773.739 peticiones almacenadas en un único fichero Parquet de 1.751.865.039 bytes, con grupos de filas de 5.000.000 de registros.

La relevancia del recurso es práctica: el formato Parquet con zstd reduce el espacio y acelera la lectura columnar frente al CSV comprimido original, lo que facilita el entrenamiento y la evaluación de políticas de *caching* (por ejemplo, algoritmos de *Miss Ratio Curve* o MRC) y el análisis de distancias de reutilización (*reuse distance*). El autor indica que las columnas y el orden de filas coinciden con el CSV de origen y que las primeras 5.000.000 de filas se verificaron columna a columna contra dicho CSV.

No hay información sobre arquitectura, parámetros ni contexto porque el artefacto no es un modelo entrenado. La ficha se adapta a esa naturaleza: se documentan especificaciones del dataset, estructura, capacidades de uso y limitaciones, marcando como "no disponible" todo aquello que no figura en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es un dataset tabular de trazas de caché) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (compresión zstd del Parquet, no cuantización de pesos) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY 4.0 |
| Formato de pesos | no disponible; formato de datos: Parquet con compresión zstd |

Especificaciones adicionales del dataset, según la model card:

| Propiedad | Valor |
|---|---|
| Peticiones totales | 227.773.739 |
| Partes | 1 |
| Bytes del Parquet | 1.751.865.039 |
| Tamaño de row group | 5.000.000 de peticiones |
| Compresión | zstd |
| Origen | `cluster45.sort.zst` |
| SHA-256 del origen | `710e77b2d50ce4b5db6fc89e565a139c4228a75b5aaa5c4db7b4d1b64fe49209` |
| Fichero auxiliar | `manifest.json` (mapea cada parte a su rango de peticiones para `mrc train --store`) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no existe una arquitectura neuronal ni un proceso de entrenamiento. El artefacto es una transformación de formato de un *trace* de caché de producción de Twitter, descrito en el paper *A large scale analysis of hundreds of in-memory cache clusters at Twitter* (Yang, Yue, Vinayak; OSDI 2020). El pipeline declarado es una conversión del fichero `cluster45.sort.zst` a Parquet con zstd, preservando columnas y orden de filas del CSV de origen, con verificación de las primeras 5.000.000 de filas en todas las columnas.

La innovación técnica del recurso es de ingeniería de datos: el particionado en grupos de filas de 5.000.000 de peticiones y la inclusión de un `manifest.json` que asocia cada parte con su rango de peticiones, pensado para alimentar la herramienta `mrc train --store`. No se documentan en la información disponible detalles sobre el esquema exacto de columnas, la distribución de claves ni el rango temporal cubierto.

## Capacidades

- Almacenamiento columnar de 227.773.739 peticiones de caché en un único fichero Parquet comprimido con zstd.
- Lectura selectiva por columnas, adecuada para análisis de trazas y cálculo de métricas de caché.
- Soporte declarado para entrenamiento de curvas de ratio de fallos (MRC) mediante `mrc train --store`, usando el `manifest.json` para localizar rangos de peticiones.
- Análisis de *reuse distance* a partir de las trazas, según las etiquetas del repositorio.
- Verificación de integridad parcial: las primeras 5.000.000 de filas se comprobaron contra el CSV de origen en todas las columnas.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües: no es un modelo.

## Casos de uso

- Evaluación de algoritmos de caché: cargar el Parquet con PyArrow o DuckDB y simular políticas (LRU, LFU, ARC, etc.) sobre las 227,7 millones de peticiones para comparar ratios de acierto.
- Cálculo de curvas MRC: usar `manifest.json` junto con `mrc train --store` para entrenar curvas de ratio de fallos sobre el shard completo sin manipular el CSV original.
- Análisis de reuse distance: derivar la distribución de distancias de reutilización por clave para dimensionar cachés y estimar el impacto de distintos tamaños de almacenamiento.
- Investigación reproducible en sistemas: el SHA-256 del origen y la verificación de las primeras 5.000.000 de filas permiten citar y reproducir experimentos con trazabilidad.
- Docencia y formación en sistemas distribuidos: el volumen y el formato columnar permiten construir prácticas de simulación de caché con datos reales de producción.
- Benchmarks de motores analíticos: comparar el rendimiento de DuckDB, Polars, Spark o PyArrow al agregar métricas sobre un Parquet de 1,75 GB con grupos de filas de 5.000.000 de registros.
- Ingesta en pipelines de datos: el formato Parquet con zstd encaja en lagos de datos y herramientas de consulta que no toleran bien CSV de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; no requiere GPU para su uso previsto. El dataset ocupa 1.751.865.039 bytes comprimidos en disco.
- GPU recomendadas: no disponibles; el procesamiento es de CPU y disco (análisis columnar y simulación de caché).
- Cabe en GPU de consumo: no aplica como modelo; para experimentos de agregación en memoria conviene disponer de RAM suficiente para los grupos de filas que se carguen (cada row group son 5.000.000 de peticiones).
- Opciones de despliegue: lectura mediante PyArrow, DuckDB, Polars, Spark o pandas; no procede vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Recurso | Tipo | Volumen | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ibitec/cache-trace-cluster45-parquet` | Dataset de trazas de caché | 227.773.739 peticiones; 1,75 GB | Parquet + zstd | CC-BY 4.0 | Hugging Face |
| `cluster45.sort.zst` (espejo oficial CMU) | Dataset de trazas de caché | mismo shard de origen | zstd (CSV comprimido) | CC-BY 4.0 | ftp.pdl.cmu.edu |
| Otros shards del espejo de Twitter | Dataset de trazas de caché | no disponible | zstd (CSV comprimido) | CC-BY 4.0 | ftp.pdl.cmu.edu |

No se dispone de información sobre otros datasets comparables convertidos a Parquet ni sobre métricas de rendimiento relativas entre ellos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni admite prompts; cualquier uso como modelo sería un error de categoría.
- El esquema de columnas no se detalla en la información disponible; hay que inspeccionar el Parquet antes de construir pipelines.
- La verificación de integridad es parcial: solo se comprobaron las primeras 5.000.000 de filas contra el CSV, no la totalidad de las 227.773.739 peticiones.
- El dataset refleja cargas de producción de Twitter en un periodo y contexto concretos; generalizar conclusiones a otros sistemas requiere validación adicional.
- La licencia CC-BY 4.0 exige atribución; conviene citar el paper de OSDI 2020 y el origen del espejo de CMU.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no aplican a un dataset tabular.
- El fichero único de 1,75 GB puede requerir gestión cuidadosa de memoria si se carga completo en un DataFrame; es preferible el acceso por row groups.

## Enlaces

- Hugging Face: https://huggingface.co/ibitec/cache-trace-cluster45-parquet
- Origen del shard: https://ftp.pdl.cmu.edu/pub/datasets/twemcacheWorkload/open_source/cluster45.sort.zst
- Paper de referencia: Yang, Yue, Vinayak. *A large scale analysis of hundreds of in-memory cache clusters at Twitter.* OSDI 2020.

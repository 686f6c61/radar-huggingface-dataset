# endomorphosis/ipfs_azerbaijan_laws

## Resumen

`ipfs_azerbaijan_laws` es un dataset de investigación, no un modelo de IA, publicado por el usuario `endomorphosis` en Hugging Face. Contiene una instantánea de legislación oficial de Azerbaiyán recopilada del portal e-qanun.az, con 685 instrumentos legales y 1126 artículos en azerbaiyano. El corpus se distribuye en dos archivos Parquet: `laws.parquet`, con una fila por instrumento, y `articles.parquet`, con una fila por artículo o sección. Incluye scripts de recopilación en Python que usan la URL oficial en vivo con respaldo de Wayback Machine. Este dataset está pensado para investigación jurídica y procesamiento de lenguaje natural, no como recurso legal vinculante. La licencia es `az-eqanun` y el autor advierte explícitamente que no es consejo legal y que la fuente oficial prevalece.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (dataset de texto, no modelo) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Azerbaiyano (az) |
| Licencia | az-eqanun |
| Formato de pesos | No disponible (datos en formato Parquet) |
| Formato de datos | Parquet |
| Numero de instrumentos | 685 |
| Numero de articulos | 1126 |
| Fuente | e-qanun.az (downloadDetailPdf) |
| Fecha de captura | 2026-09-04 |
| Jurisdiccion | Azerbaiyan |

## Arquitectura y entrenamiento

No hay arquitectura de modelo ni proceso de entrenamiento, ya que se trata de un corpus de datos. El dataset se construyó mediante un scraper en Python (`scrapers/collect_az.py`) que descarga los PDF oficiales del portal e-qanun.az, con un mecanismo de respaldo en Wayback Machine y Common Crawl. La recopilación se basa en un catálogo que el propio autor describe como incompleto. No se aplicó ningún modelo de lenguaje ni ajuste fino; los datos se almacenan tal cual se extrajeron de las fuentes oficiales.

## Capacidades

- Recuperación de texto legal: permite buscar y consultar el texto completo de leyes y artículos de Azerbaiyán.
- Estructuración de legislación: separa instrumentos y artículos en dos tablas relacionadas por `law_id`.
- Metadatos de instrumentos: incluye identificadores, títulos, fechas, estado y URL de origen.
- Soporte multilingüe: el corpus está en azerbaiyano, por lo que sirve para tareas de NLP en ese idioma.
- Trazabilidad: cada fila incluye la URL de la fuente, lo que permite verificar la información.
- Uso en pipelines de investigación: los scripts incluidos permiten reproducir la recopilación o ampliarla.

## Casos de uso

1. Investigación jurídica comparada: investigadores pueden analizar la evolución legislativa de Azerbaiyán consultando los textos completos de 685 instrumentos y sus artículos.
2. Entrenamiento de modelos de lenguaje jurídico: el corpus en azerbaiyano puede usarse para fine-tuning de modelos de NLP especializados en derecho.
3. Búsqueda semántica en legislación: al disponer de los textos en Parquet, se puede indexar con sistemas de recuperación (por ejemplo, RAG) para responder consultas sobre leyes concretas.
4. Análisis de datos legales: las columnas de metadatos permiten estudiar la distribución de leyes por fecha, estado o tipo de instrumento.
5. Verificación de citas legales: los artículos con su URL de origen facilitan comprobar la exactitud de referencias en trabajos académicos o periodísticos.
6. Creación de bases de conocimiento para agentes jurídicos: los pares de preguntas y respuestas extraídos de los artículos pueden alimentar asistentes legales, siempre que se indique que no es consejo legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un dataset y no de un modelo, no procede evaluar métricas de razonamiento o generación.

## Requisitos de hardware

- Al ser un dataset, no requiere VRAM ni GPU para su uso.
- Se puede procesar en CPU con librerías como pandas o Polars, ya que los archivos Parquet son ligeros (el repositorio ocupa 0.0 GB según Hugging Face).
- Para tareas de indexación o entrenamiento de modelos sobre estos datos, la GPU recomendada dependerá del modelo que se entrene, no del dataset.
- El despliegue típico consiste en leer los Parquet desde Python, o cargarlos en sistemas como Elasticsearch para búsqueda full-text.
- No hay datos de latencia o throughput porque no hay inferencia.

## Comparativa con modelos similares

No disponible. No se ha proporcionado información sobre datasets comparables de legislación azerbaiyana.

## Limitaciones y advertencias

- El dataset no es una consolidación oficial y no constituye consejo legal.
- La cobertura es incompleta, según el propio autor ("catalog-backed incomplete").
- El contenido se extrajo de descargas PDF; las páginas SPA HTML se omitieron, por lo que puede haber lagunas.
- La licencia `az-eqanun` es una licencia personalizada que puede imponer restricciones de uso; conviene revisarla antes de un uso comercial.
- Los datos pueden contener errores de scraping o de codificación, y la fuente oficial prevalece.
- No se incluyen etiquetas de sentencia ni interpretación jurídica, solo texto legal en bruto.

## Enlaces

- Hugging Face: https://huggingface.co/endomorphosis/ipfs_azerbaijan_laws
- Documentación de la plataforma de datasets del autor: https://github.com/endomorphosis/ipfs_datasets_py/blob/main/docs/README.md
- Portal de origen: e-qanun.az (mencionado en la model card)

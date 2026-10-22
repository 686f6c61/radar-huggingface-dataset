# hherb/snowflake-arctic-embed-l-v2.0-gguf

## Resumen

Este repositorio contiene conversiones a formato GGUF del modelo de embeddings `Snowflake/snowflake-arctic-embed-l-v2.0`, publicado por el usuario hherb (no por Snowflake) a partir de la revisión `ac6544c8a46e00af67e330e85a9028c66b8cfd9a` del modelo original. Se trata de un encoder de 566.703.104 parámetros (≈566,7 M) pensado para similitud semántica y extracción de características vectoriales, no para generación de texto. La conversión se realizó con `convert_hf_to_gguf.py` de llama.cpp en el commit `26394b4e...` y se publican dos únicas variantes: F16 (1.157.672.160 bytes) y Q8_0 (634.554.720 bytes).

El interés práctico del repositorio es que permite ejecutar un modelo de embeddings multilingüe con contexto de 8192 tokens dentro del ecosistema llama.cpp, sin necesidad de PyTorch ni de sentence-transformers, lo que facilita su despliegue en CPU, en GPUs de gama baja o en servicios ligeros de vectorización. La model card documenta el protocolo de uso exacto del modelo original: pooling CLS, prefijo `"query: "` en las consultas (los documentos no llevan prefijo), truncamiento Matryoshka a las primeras 256 dimensiones y renormalización L2.

La licencia se mantiene en Apache-2.0, igual que el modelo base. El autor aporta además una verificación de fidelidad frente a los embeddings de referencia en fp32 (similitud coseno mínima de 0,99999 para F16 y 0,99944 para Q8_0, medida sobre 256 dimensiones renormalizadas), lo que da una idea del error introducido por la cuantización. No se han publicado resultados de benchmarks de recuperación o clasificación en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder para embeddings (familia concreta no especificada en la información disponible) |
| Parámetros totales | 566.703.104 (≈566,7 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | F16 y Q8_0 (únicas variantes publicadas en el repositorio) |
| Idiomas soportados | No disponible (la model card describe el modelo base como multilingüe, sin enumerar idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (generado con llama.cpp) |
| Pooling | CLS |
| Dimensiones de embedding | No disponible la dimensión completa; se documenta truncamiento Matryoshka a 256 dimensiones con renormalización L2 |
| Prefijos | `"query: "` en consultas; sin prefijo en documentos |
| Tamaño de ficheros | F16: 1.157.672.160 bytes; Q8_0: 634.554.720 bytes |
| Tamaño del repositorio | 1,8 GB |
| Pipeline declarado | sentence-similarity, feature-extraction |
| Modelo base | Snowflake/snowflake-arctic-embed-l-v2.0 (relación: quantized) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza de encoder de embeddings con pooling CLS, contexto de 8192 tokens y representaciones compatibles con truncamiento Matryoshka. Tampoco se especifican el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron fases de ajuste como RLHF, DPO o entrenamiento contrastivo con hard negatives; esos datos corresponden a la model card de Snowflake y no se reproducen en este repositorio. El trabajo de hherb se limita a la conversión de formato: no hay entrenamiento ni fine-tuning adicional.

La innovación técnica del repositorio es la reproducibilidad de la conversión y su verificación numérica. El proceso parte del modelo en precisión original, se convierte a GGUF F16 con `convert_hf_to_gguf.py` y se cuantiza a Q8_0 con `llama-quantize`, usando el commit `26394b4e6749a41c3633db040e0987500a5f7013`. La fidelidad se mide comparando los embeddings generados con los de referencia en fp32, truncados a 256 dimensiones y renormalizados: 0,99999 de similitud coseno mínima en F16 y 0,99944 en Q8_0. Los ficheros incluyen sus hashes SHA-256 para verificación de integridad.

## Capacidades

- Generación de embeddings de frase para similitud semántica (`sentence-similarity`) y extracción de características vectoriales (`feature-extraction`).
- Codificación de pasajes largos de hasta 8192 tokens en una sola pasada, sin troceado agresivo.
- Truncamiento Matryoshka: permite recortar el vector a 256 dimensiones (y renormalizar) para reducir memoria en bases de datos vectoriales, a costa de cierta pérdida de precisión.
- Uso multilingüe según la model card del modelo base; la lista concreta de idiomas y su calidad relativa no están documentadas en la información disponible.
- Búsqueda densa, recuperación semántica, clustering, deduplicación y clasificación por similitud con prototipos.
- Ejecución sobre llama.cpp, con soporte de CPU y de GPUs de gama baja gracias a los tamaños de 1,16 GB (F16) y 634,6 MB (Q8_0).
- No soporta generación de texto, tool calling ni function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento: es exclusivamente un encoder de representaciones.

## Casos de uso

- Búsqueda semántica y RAG sobre documentación técnica: con 8192 tokens de contexto se pueden indexar secciones completas o artículos enteros sin fragmentarlos, reduciendo la pérdida de contexto típica del chunking corto.
- RAG multilingüe: si se confirma la cobertura del modelo base, permite lanzar consultas en castellano contra un corpus indexado en otros idiomas dentro del mismo espacio vectorial, evitando pipelines de traducción intermedios.
- Deduplicación de corpus y detección de near-duplicates: vectorizar cada documento y aplicar umbrales de similitud coseno sobre los embeddings truncados a 256 dimensiones, lo que abarata el índice en bases de datos vectoriales.
- Clasificación y enrutado de tickets de soporte: comparar el embedding de la consulta con prototipos por categoría (facturación, incidencias, cuenta) y asignar la etiqueta del prototipo más cercano, sin entrenar un clasificador supervisado.
- Clustering y análisis de temáticas en feedback de usuarios: agrupar reseñas o encuestas por similitud para descubrir temas recurrentes antes de una lectura manual.
- Despliegue en entornos sin GPU: con la variante Q8_0 (634,6 MB) el modelo cabe en un contenedor pequeño y puede servirse desde CPU con llama.cpp, útil para preprocesado por lotes o servicios internos de baja concurrencia.
- Recomendación y matching semántico: emparejar ofertas de empleo con currículos, o artículos con perfiles de usuario, mediante similitud entre embeddings de documento y de consulta.
- Filtrado y moderación por similitud: comparar contenido entrante contra un conjunto de ejemplos etiquetados y marcar los que superan un umbral de cercanía para revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente aporta métricas de verificación de la conversión, que no son benchmarks de calidad de recuperación sino una comprobación de fidelidad frente a los embeddings de referencia del modelo original (256 dimensiones, renormalizadas):

| Artefacto | Similitud coseno mínima frente a la referencia fp32 |
|---|---|
| snowflake-arctic-embed-l-v2.0-F16.gguf | 0,99999 |
| snowflake-arctic-embed-l-v2.0-Q8_0.gguf | 0,99944 |

No hay datos de MMLU, HumanEval, GSM8K ni de métricas de recuperación (nDCG, Recall@k, MTEB) en la información proporcionada, y no procede inventarlos.

## Requisitos de hardware

- VRAM estimada para inferencia: en F16, los pesos ocupan 1,08 GiB (1.157.672.160 bytes), por lo que se puede estimar un consumo de aproximadamente 1,3-1,8 GB incluyendo contexto y buffers de llama.cpp; en Q8_0, los pesos son 605 MiB (634.554.720 bytes), con un consumo estimado de 0,8-1,3 GB. Son estimaciones, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria puede alojar el modelo; no requiere A100 ni H100. Una RTX 3060, RTX 4060 o similar queda muy por encima de lo necesario y permitirá lotes grandes.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en iGPU con memoria compartida suficiente; también funciona en CPU.
- Opciones de despliegue: llama.cpp (`llama-embedding`, `llama-server` en modo embeddings), `llama-cpp-python` y entornos compatibles con GGUF. Para vLLM o Text Embeddings Inference no se documenta soporte de este GGUF en la información disponible; en esos casos lo razonable es servir el modelo base en safetensors.
- Latencia y throughput: no disponibles. Dependerán fuertemente de la longitud de secuencia, ya que 8192 tokens incrementan el coste de atención frente a secuencias cortas.
- Nota de memoria: el contexto máximo de 8192 tokens exige reservar buffers proporcionales al tamaño de lote y de secuencia; conviene fijar `n_ctx` al valor real necesario en lugar del máximo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| hherb/snowflake-arctic-embed-l-v2.0-gguf (F16) | 566,7 M | 8192 | Apache-2.0 | GGUF F16, 1,16 GB | Coseno mínimo 0,99999 frente a la referencia fp32 |
| hherb/snowflake-arctic-embed-l-v2.0-gguf (Q8_0) | 566,7 M | 8192 | Apache-2.0 | GGUF Q8_0, 634,6 MB | Coseno mínimo 0,99944; opción para CPU y GPUs pequeñas |
| Snowflake/snowflake-arctic-embed-l-v2.0 | 566,7 M | 8192 | Apache-2.0 | Safetensors | Modelo original; ecosistema sentence-transformers, sin cuantización |
| Alternativas de la misma categoría (por ejemplo, modelos de embeddings multilingües de ~0,5-0,6 B como bge-m3 o multilingual-e5-large) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No se aportaron datos comparativos de rendimiento, contexto ni licencia en la búsqueda realizada |

La comparación con alternativas de terceros no puede sostenerse con datos verificados a partir de la información disponible; para una evaluación rigurosa habría que medir MTEB o un conjunto propio de recuperación sobre este GGUF y sobre los modelos candidatos con el mismo protocolo (prefijo de consulta, pooling y normalización equivalentes).

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni admite instrucciones, tool calling, agentes o razonamiento multi-paso. Cualquier uso conversacional requiere un LLM adicional.
- No hay benchmarks de calidad publicados en la información disponible: la similitud coseno de 0,99999/0,99944 solo demuestra fidelidad de la conversión, no calidad de recuperación.
- El protocolo de uso es estricto: pooling CLS, prefijo `"query: "` solo en consultas y normalización L2. Omitir cualquiera de estos pasos degrada la similitud de forma apreciable en modelos de este tipo.
- El truncamiento Matryoshka a 256 dimensiones es una recomendación, no un requisito; introduce pérdida de información que conviene validar sobre el corpus propio antes de adoptarlo en producción.
- Idiomas no enumerados en la información disponible: la cobertura multilingüe debe verificarse empíricamente, especialmente en castellano y en dominios técnicos.
- Conversión de terceros: el repositorio lo mantiene hherb, no Snowflake. Solo hay dos cuantizaciones (F16 y Q8_0), sin alternativas Q4_K_M o Q5_K_M para entornos con menos memoria.
- El repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, sin validación por parte de la comunidad; conviene comprobar los hashes SHA-256 publicados antes de usarlo en producción.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y la atribución correspondiente a Snowflake como autor del modelo original.
- Sesgos: la composición del corpus de entrenamiento no está documentada en la información disponible, por lo que no se pueden enumerar sesgos concretos; deben evaluarse con datos propios.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos en similitud, es decir, recuperar documentos semánticamente cercanos pero irrelevantes para la consulta.
- Integración: los frameworks que esperan safetensors (sentence-transformers, Text Embeddings Inference) no cargan este GGUF directamente; requieren llama.cpp o una capa equivalente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hherb/snowflake-arctic-embed-l-v2.0-gguf
- Modelo base: https://huggingface.co/Snowflake/snowflake-arctic-embed-l-v2.0
- Commit de llama.cpp usado en la conversión: https://github.com/ggml-org/llama.cpp/commit/26394b4e6749a41c3633db040e0987500a5f7013
- Los resultados de la búsqueda web realizada no contenían enlaces relacionados con este modelo (contenido no pertinente), por lo que no se incluyen papers, blogs ni demos adicionales.

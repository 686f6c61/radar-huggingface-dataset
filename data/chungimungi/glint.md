# chungimungi/GLInt

## Resumen

GLInt es un retriever de interacción tardía (late-interaction) de 149 millones de parámetros, desarrollado por Aarush Sinha (chungimungi), estudiante de máster en la Universidad de Copenhague. Está construido sobre el checkpoint no supervisado LateOn-unsupervised de LightOn AI y emplea la arquitectura ModernBERT, manteniendo embeddings de tokens de 128 dimensiones y un esquema de puntuación MaxSim con 32 tokens de consulta y 300 tokens de documento. Su principal innovación es la minería de negativos duros basada en la geometría MaxSim, en lugar de la minería densa convencional, lo que permite capturar coincidencias léxicas, composicionales y localizadas que un retriever de vector único pasa por alto.

El modelo se entrena en dos etapas: primero un fine-tuning supervisado con negativos duros multi-vector, y después una destilación de conocimiento listwise sobre una mezcla de siete fuentes de negativos, utilizando como profesor congelado a jinaai/jina-reranker-v3.5. GLInt alcanza una media de 57,43 nDCG@10 en los 15 datasets de BEIR, superando al propio LateOn (57,22) y convirtiéndose en el retriever de interacción tardía más fuerte bajo 150M de parámetros. Su relevancia actual radica en que demuestra que la minería de negativos específica para la geometría de interacción tardía mejora significativamente el rendimiento de recuperación, un aspecto poco explorado en la literatura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (según tags de HuggingFace) |
| Parametros totales | 149.015.808 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 tokens de consulta, 300 tokens de documento (diseño del modelo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLInt es un modelo de interacción tardía estilo ColBERT, basado en la arquitectura ModernBERT. A diferencia de los retrievers densos que producen un único vector por documento, GLInt genera embeddings por token (128 dimensiones) y calcula la relevancia mediante MaxSim: para cada token de la consulta, se toma la similitud máxima con los tokens del documento y se suman. Este diseño permite capturar coincidencias parciales y composicionales que los vectores únicos pierden.

El entrenamiento se realiza en dos fases. La primera es un fine-tuning supervisado con negativos duros minados bajo la misma geometría MaxSim utilizada en inferencia, en lugar de usar negativos densos. La segunda fase emplea destilación de conocimiento listwise: un profesor congelado (jinaai/jina-reranker-v3.5) puntúa conjuntos de 32 documentos, y GLInt aprende a replicar ese orden mediante una pérdida KL listwise afilada, combinada con un término InfoNCE con enmascaramiento de falsos negativos para preservar la señal directa de recuperación. Esta receta es la principal contribución técnica del modelo, ya que aborda explícitamente el desajuste entre la minería densa y la inferencia multi-vector.

## Capacidades

- Recuperación de documentos con interacción tardía (MaxSim) sobre corpus a gran escala.
- Generación de embeddings multi-vector para consultas y documentos, con 128 dimensiones por token.
- Puntuación de relevancia mediante suma de máximos de similitud token a token.
- Integración con Sentence Transformers mediante la clase `MultiVectorEncoder`.
- Compatibilidad con PyLate y backends de interacción tardía como PLAID para indexación y búsqueda eficiente.
- Soporte para búsqueda semántica en inglés, con buen comportamiento en dominios variados (biomedicina, finanzas, ciencia, etc.) según los resultados de BEIR.
- No es un modelo generativo: no genera texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Recuperación aumentada por generación (RAG): GLInt puede indexar una base de conocimiento corporativa y recuperar los pasajes más relevantes para alimentar a un LLM generativo. Su interacción tardía permite encontrar coincidencias parciales y composicionales que los retrievers densos pasan por alto, mejorando la calidad de las respuestas.
- Búsqueda semántica en motores de búsqueda empresarial: al indexar documentos internos (informes, manuales, correos), GLInt ofrece resultados más precisos que la búsqueda por palabras clave, gracias a su capacidad de entender significado y contexto.
- Sistemas de preguntas y respuestas sobre colecciones de documentos: dado un corpus de artículos científicos o legales, GLInt recupera los fragmentos que contienen la respuesta, reduciendo la carga de procesamiento posterior.
- Deduplicación y agrupación de documentos: los embeddings multi-vector permiten comparar documentos por similitud semántica, útil para detectar duplicados o agrupar contenidos relacionados en grandes repositorios.
- Clasificación de documentos por relevancia temática: usando la puntuación MaxSim, se pueden ordenar documentos según su afinidad con una consulta o tema, facilitando tareas de triaje y priorización.
- Indexación y búsqueda en bibliotecas digitales o archivos históricos: GLInt puede manejar colecciones de millones de documentos con un coste de almacenamiento razonable (0,6 GB) y una latencia de búsqueda aceptable mediante PLAID.

## Benchmarks y rendimiento

Los resultados publicados en la model card cubren los 15 datasets de BEIR (nDCG@10) y una versión decontaminada de 14 datasets. La tabla siguiente muestra la comparativa con otros retrievers de interacción tardía y densos.

| Modelo | Media BEIR (15) | Tamaño (M) | Dim. embed | ArguAna | CQADupstack | ClimateFEVER | DBPedia | FEVER | FiQA2018 | HotpotQA | MSMARCO | NFCorpus | NQ | Quora | SCIDOCS | SciFact | TRECCOVID | Touche2020 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ColBERTv2 | 48,63 | 110 | 128 | 46,50 | 38,30 | 17,60 | 45,20 | 78,50 | 35,40 | 67,50 | 46,00 | 33,70 | 52,40 | 85,50 | 15,40 | 68,90 | 72,60 | 26,00 |
| Jina-ColBERT-v2 | 51,85 | 600 | 128 | 36,60 | 40,80 | 23,90 | 47,10 | 80,50 | 40,80 | 76,60 | **46,90** | 34,60 | 64,00 | 88,70 | 18,60 | 67,80 | 83,40 | 27,40 |
| ColBERT-small | 53,79 | 33 | 96 | 50,09 | 38,75 | 33,07 | 45,58 | 90,96 | 41,15 | 76,11 | 43,50 | 37,30 | 59,10 | 87,72 | 18,42 | 74,77 | 84,59 | 25,69 |
| GTE-ModernColBERT-v1 | 54,75 | 149 | 128 | 47,52 | 41,08 | 31,33 | 47,56 | 87,67 | 45,25 | 77,48 | 45,60 | **37,83** | 61,62 | 86,71 | 19,22 | 76,33 | **84,84** | 31,25 |
| ColBERT-Zero | 55,39 | 149 | 128 | **52,82** | 41,41 | 35,90 | 47,43 | 90,52 | 42,50 | 79,45 | 45,95 | 37,21 | 61,82 | 85,19 | 19,84 | 76,33 | 78,27 | **36,24** |
| LateOn-unsupervised | 50,11 | 149 | 128 | 43,12 | **47,71** | 18,76 | 43,36 | 65,74 | 51,94 | 68,17 | 37,51 | 37,15 | 58,41 | 89,48 | 21,13 | 76,89 | 69,81 | 22,53 |
| LateOn | 57,22 | 149 | 128 | 50,52 | 47,36 | **39,67** | 45,99 | 92,02 | **53,12** | 79,98 | 45,67 | 37,79 | 63,91 | 89,67 | **21,90** | 76,61 | 83,60 | 30,52 |
| **GLInt** | **57,43** | 149 | 128 | 52,38 | 46,49 | 34,17 | **47,68** | **92,45** | 50,85 | **82,54** | 46,38 | 37,51 | **68,03** | **90,08** | 20,65 | **77,13** | 84,78 | 30,26 |

En la versión decontaminada (14 datasets), GLInt alcanza una media de 62,50 nDCG@10, superando a LateOn (61,4), DenseOn (58,8), pplx-embed-v1-0.6b (59,7) y jina-v5-text-nano (58,8). Destaca especialmente en Natural Questions (94,97), Quora (92,06) y SciDocs (22,02).

## Requisitos de hardware

- VRAM estimada: con 149M de parámetros, en FP16 ocupa aproximadamente 300 MB. Con cuantización INT8, unos 150 MB. Cabe en cualquier GPU consumer (incluso en una GTX 1060 de 6 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en lote. Para indexación de corpus grandes, se recomienda una GPU con 8 GB o más (RTX 3060, RTX 4070, etc.).
- Despliegue: compatible con Sentence Transformers (v6.0+), PyLate, y el backend de Text Embeddings Inference (TEI) de Hugging Face, que soporta modelos de interacción tardía.
- Latencia y throughput: no se han publicado cifras oficiales. Al ser un modelo de interacción tardía, la inferencia es más costosa que un retriever denso, pero con PLAID se puede lograr una búsqueda eficiente en corpus de millones de documentos. En una GPU moderna, la codificación de un documento tarda unos pocos milisegundos.

## Comparativa con modelos similares

GLInt se compara directamente con otros retrievers de interacción tardía de tamaño similar. La tabla de benchmarks anterior ya muestra la comparativa en BEIR. En cuanto a características:

| Modelo | Parámetros | Contexto (tokens) | Licencia | Disponibilidad |
|---|---|---|---|---|
| ColBERTv2 | 110M | 128 (tokens de documento) | MIT | Hugging Face |
| Jina-ColBERT-v2 | 600M | 128 | Apache-2.0 | Hugging Face |
| ColBERT-small | 33M | 96 | Apache-2.0 | Hugging Face |
| GTE-ModernColBERT-v1 | 149M | 128 | Apache-2.0 | Hugging Face |
| ColBERT-Zero | 149M | 128 | Apache-2.0 | Hugging Face |
| LateOn | 149M | 128 | Apache-2.0 | Hugging Face |
| **GLInt** | **149M** | **128** | **Apache-2.0** | **Hugging Face** |

GLInt ofrece el mejor rendimiento medio en BEIR entre todos ellos, con un tamaño competitivo y una licencia permisiva.

## Limitaciones y advertencias

- Solo soporta inglés. No hay evidencia de capacidades multilingües.
- El diseño limita la consulta a 32 tokens y el documento a 300 tokens. Para consultas o documentos más largos, es necesario truncar, lo que puede perder información relevante.
- Al ser un modelo de recuperación, no genera texto; no es adecuado para tareas de generación o diálogo.
- Los sesgos presentes en los datos de entrenamiento (procedentes de internet) pueden propagarse a los resultados de recuperación, especialmente en dominios sensibles.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo se distribuye tal cual, sin garantías. Se recomienda validar su rendimiento en el dominio específico antes de desplegarlo en producción.
- La minería de negativos y la destilación requieren un profesor externo (jina-reranker-v3.5) que no está incluido en el modelo; para reproducir el entrenamiento es necesario acceder a ese modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chungimungi/GLInt
- Blog técnico del autor: https://huggingface.co/blog/chungimungi/glint
- Dataset de entrenamiento: https://huggingface.co/datasets/chungimungi/GLINT-data
- Perfil de GitHub del autor: https://github.com/chungimungi

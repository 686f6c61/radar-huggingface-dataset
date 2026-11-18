# bianyh8/bge-small-zh-v1.5

## Resumen

`bianyh8/bge-small-zh-v1.5` es una redistribución del modelo de embeddings `BAAI/bge-small-zh-v1.5`, desarrollado originalmente por el Beijing Academy of Artificial Intelligence (BAAI) dentro de la familia FlagEmbedding. Se trata de un modelo BERT pequeño especializado en generar representaciones densas de texto en chino para tareas de recuperación, clasificación, clustering y búsqueda semántica. El repositorio aquí descrito es una copia publicada por el usuario `bianyh8`, sin descargas ni interacciones registradas.

El modelo cuenta con 23.954.432 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la gama "small" de la familia BGE. La versión 1.5 introduce una corrección de la distribución de similitudes y mejora la capacidad de recuperación sin necesidad de instrucción explícita en la consulta, un problema que afectaba a las versiones anteriores de BGE.

Es relevante porque ofrece un equilibrio entre calidad de recuperación y coste computacional muy bajo, lo que permite desplegarlo en CPU o en GPUs de gama baja para pipelines de RAG y motores de búsqueda semántica en chino. La licencia MIT facilita su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 23.954.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors, pytorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT en configuración small, un encoder transformer bidireccional con 23,95 millones de parámetros. Está diseñado para producir un vector denso de baja dimensionalidad a partir de cualquier texto de entrada, que puede emplearse en recuperación, clasificación, clustering o búsqueda semántica, así como en bases de datos vectoriales para LLMs.

La versión 1.5 se publicó en septiembre de 2023 con el objetivo de mitigar el problema de la distribución de similitudes de las versiones previas y mejorar la recuperación sin instrucción. Según la documentación de FlagEmbedding, el entrenamiento emplea el conjunto masivo de datos publicado por BAAI (BAAI-MTP) y técnicas de minería de negativos duros. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO, por lo que estos datos se consideran no disponibles.

## Capacidades

- Generación de embeddings densos de texto en chino para recuperación y búsqueda semántica.
- Clasificación de texto y clustering semántico mediante similitud coseno entre vectores.
- Recuperación de pasajes relevantes sin necesidad de instrucción en la consulta (mejora introducida en v1.5).
- Integración en bases de datos vectoriales para pipelines de RAG con LLMs.
- Uso como modelo de embedding en frameworks como LangChain (según la documentación de la familia BGE).
- Capacidades multilingües limitadas al chino; no se documenta soporte para otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento multi-paso, dado que es un modelo de embeddings y no un modelo generativo.

## Casos de uso

- Búsqueda semántica en corpus chinos: el modelo convierte documentos y consultas en vectores densos que permiten recuperar pasajes relevantes por similitud, adecuado por su bajo coste y su especialización en chino.
- Generación aumentada por recuperación (RAG): se usa como recuperador en pipelines que alimentan a un LLM con contexto documental en chino, integrándose en bases de datos vectoriales.
- Clasificación de textos: los embeddings pueden alimentar un clasificador ligero (regresión logística, SVM) para categorizar tickets, reseñas o noticias en chino.
- Deduplicación y clustering de documentos: agrupar documentos similares en grandes corpus chinos mediante clustering sobre los vectores generados.
- Moderación de contenido y filtrado semántico: comparar mensajes entrantes con patrones conocidos para detectar contenido similar a casos previamente etiquetados.
- Motor de recomendación basado en contenido: representar ítems y perfiles de usuario como vectores para calcular afinidad semántica en catálogos en chino.
- Búsqueda en atención al cliente: indexar FAQs y documentación de soporte en chino para responder consultas por similitud semántica con baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (23,95 M de parámetros, ~96 MB de pesos) y aún menor en FP16 o int8.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en tarjetas consumer como GTX 1650, RTX 3060, RTX 4090, así como en A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU consumer y también puede ejecutarse en CPU con latencia aceptable para volúmenes moderados.
- Opciones de despliegue: al ser un modelo BERT, puede servirse con Hugging Face Transformers, Text Embeddings Inference (TEI), sentence-transformers, ONNX Runtime o FastEmbed; no se documenta soporte específico de vLLM o llama.cpp para este modelo en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bianyh8/bge-small-zh-v1.5 | 23,95 M | no disponible | zh | MIT | Hugging Face |
| BAAI/bge-small-zh-v1.5 | no disponible en la información | no disponible | zh | MIT | Hugging Face |
| BAAI/bge-base-zh-v1.5 | no disponible en la información | no disponible | zh | MIT | Hugging Face |
| BAAI/bge-large-zh-v1.5 | no disponible en la información | no disponible | zh | MIT | Hugging Face |

La comparativa se limita a la familia BGE en chino documentada en la model card; no se dispone de datos de rendimiento ni de parámetros de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en chino; su rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Al ser un modelo de embeddings y no generativo, no produce texto ni razonamiento; no debe emplearse para tareas de generación.
- Riesgo de sesgos heredados de los datos de entrenamiento de BAAI, no cuantificados en la información disponible.
- La longitud máxima de contexto no está documentada en la información proporcionada, lo que impide garantizar el comportamiento con documentos largos.
- Este repositorio concreto es una redistribución sin descargas ni validación comunitaria; se recomienda verificar la integridad de los pesos frente al repositorio oficial `BAAI/bge-small-zh-v1.5`.
- La licencia MIT permite uso comercial, pero conviene revisar las condiciones del modelo original de BAAI por si hubiera requisitos adicionales de atribución.
- No se documentan resultados de benchmarks para esta copia, por lo que no hay evidencia empírica de que los pesos coincidan exactamente con los del modelo original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bianyh8/bge-small-zh-v1.5
- Modelo original: https://huggingface.co/BAAI/bge-small-zh-v1.5
- Repositorio FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
- Paper técnico de BGE: https://arxiv.org/pdf/2309.07597.pdf
- Paper de LLM-Embedder: https://arxiv.org/pdf/2310.07554.pdf
- Datos de entrenamiento BAAI-MTP: https://data.baai.ac.cn/details/BAAI-MTP
- Leaderboard C-MTEB: https://huggingface.co/spaces/mteb/leaderboard

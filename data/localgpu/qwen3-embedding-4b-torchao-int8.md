# LocalGpu/Qwen3-Embedding-4B-torchao-INT8

## Resumen

Qwen3-Embedding-4B-torchao-INT8 es una conversión cuantizada del modelo de embeddings Qwen/Qwen3-Embedding-4B, publicada por el usuario LocalGpu. Se trata de una versión del modelo original de Qwen (familia Qwen3) transformada de BF16 a INT8 persistente mediante torchao, con el objetivo de reducir el peso en memoria y facilitar su despliegue en entornos de recuperación aumentada (RAG). La conversión afecta a las 252 capas lineales del modelo, todas ellas cuantizadas.

El modelo base Qwen3-Embedding-4B es un modelo dedicado a la generación de representaciones vectoriales (embeddings) de texto, con 4.021.774.336 parámetros totales según los pesos en safetensors. Esta variante INT8 mantiene la licencia Apache 2.0 del original y se distribuye en formato safetensors, pensada para ser cargada directamente por el runtime RAG de LocalGPU.

La relevancia de esta ficha radica en que se trata de una conversión de comunidad con escasa documentación adicional: la model card es mínima y no proporciona detalles sobre el proceso de cuantización más allá del número de capas afectadas, ni sobre el rendimiento, los idiomas o los benchmarks. El modelo está orientado a un uso muy específico (embeddings para RAG dentro de un runtime concreto) y no debe confundirse con un modelo generativo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de embeddings, base Qwen3-Embedding-4B); detalles de arquitectura interna no disponibles |
| Parámetros totales | 4.021.774.336 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT8 persistente (torchao); 252 de 252 capas lineales cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (INT8 torchao) |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint Qwen/Qwen3-Embedding-4B, un modelo de la familia Qwen3 especializado en la producción de embeddings de texto. La arquitectura subyacente es de tipo transformer, con 4.021.774.336 parámetros totales según los tensores publicados. No se dispone de información detallada sobre el número de capas, dimensión oculta, cabezas de atención ni longitud de contexto en la información proporcionada.

El proceso de conversión realizado por LocalGpu consiste en transformar los pesos originales en BF16 a INT8 persistente mediante torchao, cuantizando las 252 capas lineales del modelo. No se documentan en la model card datos sobre el dataset de entrenamiento original, el número de tokens, ni si hubo fases de RLHF o DPO; esa información correspondería al modelo base de Qwen y no se incluye aquí. Tampoco se detallan innovaciones técnicas adicionales más allá de la propia cuantización INT8 con torchao.

## Capacidades

- Generación de embeddings de texto para tareas de similitud semántica y recuperación de información.
- Codificación de documentos y consultas para pipelines de RAG (retrieval-augmented generation).
- Búsqueda semántica y recuperación densa sobre corpus de documentos.
- Agrupamiento y clasificación basados en representaciones vectoriales.
- Integración con el runtime RAG de LocalGPU, para el que los safetensors exportados están pensados para carga directa.
- Capacidades multilingües: no disponibles en la información proporcionada (dependen del modelo base, no documentadas aquí).
- Soporte de tool calling, agentes, visión o audio: no disponible (es un modelo de embeddings, no generativo).

## Casos de uso

- Recuperación de documentos en pipelines RAG: el modelo genera embeddings de fragmentos de documentos y de la consulta del usuario para recuperar los pasajes más relevantes antes de pasarlos a un LLM generador; su formato INT8 reduce el coste de memoria en el servidor de recuperación.
- Búsqueda semántica en bases de conocimiento internas: se indexan documentos de una organización con embeddings y se consultan por similitud, aprovechando la cuantización para desplegar el índice en hardware más modesto.
- Deduplicación y agrupamiento de contenido: se calculan embeddings de artículos, tickets o correos y se agrupan por cercanía vectorial para detectar duplicados o temas recurrentes.
- Clasificación de textos por similitud a prototipos: se comparan embeddings de entradas con embeddings de etiquetas de referencia, útil para enrutado de tickets o moderación básica.
- Sistemas de preguntas frecuentes: se indexan pares pregunta-respuesta y se recupera la respuesta más cercana semánticamente a la consulta del usuario.
- Despliegue en el runtime RAG de LocalGPU: al estar exportado específicamente para esa carga directa, permite sustituir el checkpoint BF16 por la versión INT8 y reducir el consumo de memoria del servicio de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 4,4 GB en safetensors INT8, por lo que el peso de los parámetros ronda ese orden de magnitud y conviene prever memoria adicional para activaciones y buffers.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del checkpoint (4,4 GB) sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos que lo verifiquen.
- Opciones de despliegue: los safetensors están pensados para carga directa por el runtime RAG de LocalGPU; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LocalGpu/Qwen3-Embedding-4B-torchao-INT8 | 4.021.774.336 | No disponible | INT8 (torchao) | Apache 2.0 | Hugging Face (repo de comunidad) |
| Qwen/Qwen3-Embedding-4B (modelo base) | 4.021.774.336 (según conversión) | No disponible | BF16 | Apache 2.0 | Hugging Face (oficial de Qwen) |
| Otras alternativas de embeddings | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La model card es mínima: no documenta idiomas, contexto, rendimiento ni detalles del proceso de cuantización más allá del número de capas.
- Al ser una conversión de comunidad, no existe garantía de equivalencia funcional exacta con el modelo base BF16; la cuantización INT8 puede introducir degradación en la calidad de los embeddings, no cuantificada en la información disponible.
- El modelo está pensado para el runtime RAG de LocalGPU; su uso fuera de ese entorno no está documentado ni verificado.
- Es un modelo de embeddings, no generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de sesgos y alucinaciones: no documentado en la información proporcionada; los sesgos dependerían del entrenamiento del modelo base de Qwen.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base original de Qwen.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por parte de la comunidad.

## Enlaces

- [Hugging Face: LocalGpu/Qwen3-Embedding-4B-torchao-INT8](https://huggingface.co/LocalGpu/Qwen3-Embedding-4B-torchao-INT8)
- [Modelo base: Qwen/Qwen3-Embedding-4B](https://huggingface.co/Qwen/Qwen3-Embedding-4B/tree/5cf2132abc99cad020ac570b19d031efec650f2b)

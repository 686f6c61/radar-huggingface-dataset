# skkut/qwen3-embedding-8b-q4f16_1-MLC

## Resumen

Este repositorio contiene una compilación del modelo Qwen3-Embedding-8B realizada con MLC-LLM y empaquetada en el formato de web-llm 0.2.84 para ejecución en navegador mediante WebGPU. El autor, skkut, ha generado esta versión cuantizada en q4f16_1 con el objetivo de reducir el consumo de memoria (de 16,5 GB en fp16 a aproximadamente 4 GB de pesos) y permitir su uso como generador de embeddings directamente en el cliente, sin necesidad de servidor.

El modelo base, Qwen3-Embedding-8B, es un modelo de embeddings denso desarrollado por Alibaba (QwenLM) para tareas de representación de texto y ranking, disponible en tamaños de 0,6B, 4B y 8B. Esta compilación concreta está pensada para entornos donde se requiere privacidad, baja latencia o despliegue sin infraestructura, como aplicaciones web de búsqueda semántica o recuperación de información en el navegador.

La relevancia de esta ficha radica en que ofrece una alternativa práctica para integrar embeddings de alta calidad (dimensión 4096) en aplicaciones web con WebGPU, aunque con limitaciones importantes de contexto (2048 tokens) y requisitos de VRAM considerables (~6,9 GB) que exigen tarjetas gráficas de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-Embedding-8B) |
| Parametros totales | 8 000 millones (8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | q4f16_1 (única disponible en esta compilación) |
| Idiomas soportados | No disponible (el modelo base Qwen3 es multilingüe, pero la compilación no lo especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLC (binarios shard + biblioteca wasm) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3-Embedding-8B, un modelo de embeddings denso basado en la familia Qwen3-8B. No se dispone de detalles específicos sobre el entrenamiento en esta compilación (número de tokens, composición del dataset o técnicas de alineación como RLHF/DPO), ya que la model card se centra en el proceso de compilación MLC.

La compilación emplea cuantización q4f16_1 (pesos de 4 bits con activaciones en fp16) porque la ruta de 8 bits en fp8 no es compatible con la generación de código wasm de TVM, que solo emite f16/f32. El modelo realiza pooling del último token y normalización L2 integrada en el propio modelo compilado. La dimensión de los embeddings es 4096.

## Capacidades

- Generación de embeddings de texto de alta dimensión (4096) con normalización L2 aplicada automáticamente.
- Recuperación de pasajes relevantes para consultas web, utilizando el prefijo instructivo específico de Qwen3: `Instruct: Given a web search query, retrieve relevant passages that answer the query\nQuery: ...`.
- Ejecución completamente en el navegador mediante WebGPU, sin necesidad de servidor ni envío de datos a terceros.
- Compatibilidad con la API de web-llm 0.2.84, lo que facilita su integración en aplicaciones TypeScript/JavaScript.
- Soporte multilingüe heredado del modelo base Qwen3 (aunque no confirmado en esta compilación).
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso, ya que es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en aplicaciones web privadas: el modelo puede indexar documentos locales y responder a consultas del usuario generando embeddings en el navegador, ideal para herramientas de productividad o gestores de conocimiento que requieren confidencialidad.
- Recuperación aumentada por generación (RAG) en el cliente: al ejecutarse en WebGPU, permite construir pipelines de RAG sin backend, combinando los embeddings con un modelo generativo local para responder preguntas sobre un corpus específico.
- Clasificación de textos y agrupación por similitud: la dimensión de 4096 y la normalización L2 facilitan tareas de clustering o deduplicación de documentos en aplicaciones de análisis de datos.
- Filtrado y ranking de resultados de búsqueda: el modelo puede reordenar resultados de búsqueda web o de base de datos según relevancia semántica, mejorando la precisión frente a métodos basados en palabras clave.
- Sistemas de recomendación basados en contenido: al representar ítems (artículos, productos, noticias) como vectores, se pueden calcular similitudes y sugerir elementos relacionados en tiempo real dentro de una interfaz web.
- Herramientas de anotación y etiquetado automático: los embeddings permiten asignar categorías o etiquetas a textos de forma semántica, útil en plataformas de gestión documental o moderación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, MTEB u otras pruebas estándar para esta compilación específica, ni tampoco para el modelo base Qwen3-Embedding-8B en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: ~6,9 GB (según la model card: 6620 MB de pesos compilados más KV cache). Se recomienda una tarjeta con al menos 16 GB para un funcionamiento cómodo.
- GPUs compatibles: funciona en WebGPU con NVIDIA (controlador Dawn). No se garantiza soporte en AMD o Intel en esta compilación.
- No cabe en GPUs de consumo básico (8 GB o menos); requiere tarjetas de gama alta como RTX 4080/4090 o equivalentes profesionales (A100, H100).
- Opciones de despliegue: exclusivamente a través de web-llm 0.2.84 en navegadores con WebGPU habilitado. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Dependerán de la GPU del cliente y del tamaño del lote (max batch 2 en esta compilación).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión embedding | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-Embedding-8B (compilación MLC, este repo) | 8B | 2048 | 4096 | Apache-2.0 | MLC/WebGPU |
| Qwen3-Embedding-4B (compilación MLC similar) | 4B | 2048 | 2560 | Apache-2.0 | MLC/WebGPU |
| BGE-M3 (referencia habitual) | ~568M | 8192 | 1024 | MIT | Safetensors |

La comparación directa con otros modelos de embedding no es posible sin datos de benchmarks. La versión 4B del mismo compilador (skkut/qwen3-embedding-4b-q4f16_1-MLC-b2) ofrece menor VRAM y dimensión de embedding, siendo más adecuada para GPUs con menos memoria. El contexto de 2048 tokens es limitado frente a alternativas como BGE-M3 (8192) o el propio Qwen3-Embedding en su versión original (que soporta contextos más largos, aunque no se especifican aquí).

## Limitaciones y advertencias

- Contexto muy limitado (2048 tokens), insuficiente para documentos extensos o conversaciones largas; puede requerir truncamiento o chunking.
- Dependencia total de WebGPU y de GPUs NVIDIA; no funcionará en navegadores sin soporte WebGPU ni en GPUs de gama baja (menos de 8 GB de VRAM).
- La cuantización q4f16_1 puede degradar ligeramente la calidad de los embeddings frente a la versión fp16 original, aunque no hay datos cuantitativos para evaluar el impacto.
- No incluye capacidades de generación de texto ni razonamiento; es exclusivamente un modelo de embeddings.
- El autor advierte que el checkpoint base declara `tie_word_embeddings=false` pero no incluye `lm_head.weight`; la compilación enlaza la cabeza al embedding table, lo cual es irrelevante para embeddings pero podría afectar a otros usos.
- No se han publicado resultados de evaluación en benchmarks estándar, por lo que el rendimiento real en tareas de recuperación o clasificación es desconocido.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-Embedding es propietario de Alibaba; se recomienda revisar los términos específicos del modelo original antes de desplegarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/skkut/qwen3-embedding-8b-q4f16_1-MLC
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio oficial Qwen3-Embedding (GitHub): https://github.com/QwenLM/Qwen3-Embedding/blob/main/README.md
- Modelo Qwen3-Embedding-8B en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3-embedding-8b
- Compilación similar para 4B: https://huggingface.co/skkut/qwen3-embedding-4b-q4f16_1-MLC-b2

# Demondiablo/Qwen3-4B-Instruct-2507-FP8

## Resumen

Qwen3-4B-Instruct-2507-FP8 es una versión cuantizada en FP8 del modelo Qwen3-4B-Instruct-2507, desarrollado originalmente por el equipo Qwen (Alibaba). Se trata de un modelo de lenguaje causal de 4.000 millones de parámetros (4.411.424.256 según los pesos en safetensors, incluyendo embeddings), diseñado para generación de texto, razonamiento, código, matemáticas y uso de herramientas, con una ventana de contexto nativa de 262.144 tokens.

La particularidad de esta variante es que elimina el modo "thinking": no genera bloques `<think></think>` y ya no requiere el parámetro `enable_thinking=False`. Está orientada a instrucciones directas (modo no-thinking), lo que la hace más adecuada para despliegues de baja latencia en producción y para integraciones conversacionales convencionales.

El repositorio `Demondiablo/Qwen3-4B-Instruct-2507-FP8` es una réplica del checkpoint FP8 oficial de Qwen (`Qwen/Qwen3-4B-Instruct-2507-FP8`), publicado bajo licencia Apache 2.0. La cuantización FP8 con bloques de 128 reduce el peso en memoria y acelera la inferencia en GPUs con soporte FP8 (H100, H200, L40S, etc.) sin degradar significativamente la calidad respecto al modelo en bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con GQA (32 cabezas Q, 8 cabezas KV), 36 capas |
| Parametros totales | 4.411.424.256 (4.0B según model card; 3.6B excluyendo embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativo |
| Tipos de cuantizacion | FP8 fine-grained con block size 128 (checkpoint publicado); el modelo base admite bfloat16 y otras cuantizaciones derivadas (GGUF, etc.) en el ecosistema |
| Idiomas soportados | no disponible (la model card menciona mejoras en conocimiento multilingüe de cola larga sin listar idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5.2 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer decoder-only de la familia Qwen3, con 36 capas y atención con grouped-query attention (GQA), usando 32 cabezas para las queries y 8 para claves/valores. El checkpoint aquí descrito es la versión FP8 del modelo base Qwen3-4B-Instruct-2507, que a su vez deriva de Qwen3-4B tras una etapa de pretraining y post-training. La model card no detalla el número exacto de tokens de entrenamiento ni la composición del dataset; indica únicamente que hubo fases de pretraining y post-training, con mejoras en instruction following, razonamiento lógico, comprensión de texto, matemáticas, ciencia, código y uso de herramientas, además de ganancias en conocimiento de cola larga multilingüe y alineación con preferencias subjetivas.

La innovación técnica relevante en esta variante es la cuantización FP8 fine-grained con bloques de 128, que permite ejecutar el modelo con menor huella de memoria y mayor throughput en hardware compatible FP8, manteniendo el comportamiento del modelo bfloat16 original. El modelo opera exclusivamente en modo no-thinking, lo que simplifica el pipeline de generación al eliminar la fase de razonamiento explícito previa a la respuesta.

## Capacidades

- Generación de texto conversacional y de instrucciones, con alineación mejorada en tareas abiertas y subjetivas.
- Razonamiento lógico y matemático (AIME25, HMMT25, ZebraLogic reportados en la model card).
- Conocimiento general y científico (MMLU-Pro, MMLU-Redux, GPQA, SuperGPQA).
- Generación de código en múltiples lenguajes (LiveCodeBench v6, MultiPL-E, Aider-Polyglot).
- Uso de herramientas y function calling (BFCL-v3, TAU1/TAU2 en dominios retail, airline y telecom).
- Comprensión de contexto largo hasta 262.144 tokens.
- Capacidades multilingües mejoradas (MultiIF, MMLU-ProX, INCLUDE, PolyMATH en la model card), aunque sin listado explícito de idiomas soportados.
- Modo no-thinking exclusivo: no emite bloques `<think></think>` y no requiere `enable_thinking=False`.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana, manteniendo coherencia en hilos extensos de soporte o reclamaciones.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletado, revisión de parches y generación de tests, con resultados competitivos en LiveCodeBench v6 y MultiPL-E.
- Agentes autónomos y flujos multi-step: las puntuaciones en BFCL-v3 y TAU1/TAU2 indican capacidad para orquestar llamadas a herramientas en dominios como retail, aerolíneas y telecomunicaciones.
- Asistentes de documentación técnica: con contexto de 262K tokens puede resumir, buscar y responder sobre repositorios completos, manuales extensos o bases de conocimiento internas.
- Razonamiento matemático y científico asistido: útil en entornos educativos o de investigación para resolver problemas de competición (AIME, HMMT) y preguntas de nivel GPQA.
- Procesamiento de documentos largos en lote: extracción de información, clasificación y resumen sobre contratos, informes o expedientes que exceden ventanas típicas de 32K-128K.
- Despliegue de bajo coste en GPUs con soporte FP8: la cuantización FP8 permite servir el modelo en una sola GPU moderna con latencia reducida, adecuado para prototipos y servicios internos.

## Benchmarks y rendimiento

Resultados reportados en la model card del modelo base Qwen3-4B-Instruct-2507 (aplicables a esta variante FP8 salvo degradación por cuantización, no medida en la información disponible):

| Benchmark | GPT-4.1-nano-2025-04-14 | Qwen3-30B-A3B Non-Thinking | Qwen3-4B Non-Thinking | Qwen3-4B-Instruct-2507 |
|---|---|---|---|---|
| MMLU-Pro | 62.8 | 69.1 | 58.0 | 69.6 |
| MMLU-Redux | 80.2 | 84.1 | 77.3 | 84.2 |
| GPQA | 50.3 | 54.8 | 41.7 | 62.0 |
| SuperGPQA | 32.2 | 42.2 | 32.0 | 42.8 |
| AIME25 | 22.7 | 21.6 | 19.1 | 47.4 |
| HMMT25 | 9.7 | 12.0 | 12.1 | 31.0 |
| ZebraLogic | 14.8 | 33.2 | 35.2 | 80.2 |
| LiveBench 20241125 | 41.5 | 59.4 | 48.4 | 63.0 |
| LiveCodeBench v6 (25.02-25.05) | 31.5 | 29.0 | 26.4 | 35.1 |
| MultiPL-E | 76.3 | 74.6 | 66.6 | 76.8 |
| Aider-Polyglot | 9.8 | 24.4 | 13.8 | 12.9 |
| IFEval | 74.5 | 83.7 | 81.2 | 83.4 |
| Arena-Hard v2 | 15.9 | 24.8 | 9.5 | 43.4 |
| Creative Writing v3 | 72.7 | 68.1 | 53.6 | 83.5 |
| WritingBench | 66.9 | 72.2 | 68.5 | 83.4 |
| BFCL-v3 | 53.0 | 58.6 | 57.6 | 61.9 |
| TAU1-Retail | 23.5 | 38.3 | 24.3 | 48.7 |
| TAU1-Airline | 14.0 | 18.0 | 16.0 | 32.0 |
| TAU2-Retail | - | 31.6 | 28.1 | 40.4 |
| TAU2-Airline | - | 18.0 | 12.0 | 24.0 |
| TAU2-Telecom | - | 18.4 | 17.5 | 13.2 |
| MultiIF | 60.7 | 70.8 | 61.3 | 69.0 |
| MMLU-ProX | 56.2 | 65.1 | 49.6 | 61.6 |
| INCLUDE | 58.6 | 67.8 | 53.8 | 60.1 |
| PolyMATH | 15.6 | 23.3 | 16.6 | 31.1 |

No se han publicado en la información disponible mediciones específicas del impacto de la cuantización FP8 sobre estos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 5.2 GB en FP8; se requiere al menos ~6 GB de VRAM para cargar los pesos, más overhead de activaciones y caché KV. Para contexto completo de 262.144 tokens la caché KV crece de forma significativa y puede requerir decenas de GB adicionales.
- GPU recomendadas: H100, H200, L40S y otras GPUs con soporte nativo FP8 para aprovechar la cuantización; A100 puede ejecutar el modelo pero sin aceleración FP8 nativa.
- Consumer GPU: cabe en GPUs de consumo con 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080) si se reduce el contexto; la model card sugiere bajar a 32.768 tokens en caso de OOM.
- Opciones de despliegue: transformers (>= 4.51.0), vLLM (>= 0.8.5), SGLang (>= 0.4.6.post1), TGI, además de Ollama, LMStudio, MLX-LM, llama.cpp y KTransformers para uso local (según la model card).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-FP8 (este) | 4.0B (4.41B con embeddings) | 262.144 | Apache 2.0 | Modo no-thinking, cuantización FP8 |
| Qwen3-4B-Instruct-2507 (bfloat16) | 4.0B | 262.144 | Apache 2.0 | Referencia de calidad sin cuantización |
| Qwen3-4B (modo thinking/no-thinking) | 4.0B | 32.768 (según familia Qwen3 original) | Apache 2.0 | Versión previa con modo thinking |
| Qwen3-30B-A3B Non-Thinking | 30B totales (3B activos, MoE) | no disponible | Apache 2.0 | Mayor capacidad, mayor coste de despliegue |
| GPT-4.1-nano-2025-04-14 | no disponible | no disponible | Propietaria | Referencia de comparación en la model card |

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado sobre datos web, es esperable heredar sesgos presentes en dichos datos.
- Riesgo de alucinación: no se reportan métricas específicas de factualidad; en tareas de conocimiento de cola larga y contextos muy extensos el riesgo persiste, especialmente con 262K tokens donde la recuperación de detalles puede degradarse.
- Contexto e idioma: la ventana nativa es de 262.144 tokens, pero la model card advierte que en caso de OOM conviene reducirla (por ejemplo a 32.768); no se listan idiomas soportados explícitamente, solo mejoras multilingües generales.
- Cuantización FP8: la calidad puede diferir ligeramente del modelo bfloat16 original; no se han publicado evaluaciones comparativas del impacto de la cuantización en la información disponible.
- Modo no-thinking exclusivo: el modelo no genera bloques `<think></think>`, por lo que no es adecuado para flujos que dependan de razonamiento explícito paso a paso.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base Qwen y las obligaciones de atribución.
- Repositorio de terceros: este checkpoint es publicado por el usuario `Demondiablo`, no por el equipo oficial Qwen; conviene verificar integridad de los pesos frente al repo oficial `Qwen/Qwen3-4B-Instruct-2507-FP8` antes de usarlo en producción.
- Sin descargas ni likes en el momento de la ficha: indica baja validación comunitaria del repositorio concreto.

## Enlaces

- Repositorio Hugging Face de esta ficha: https://huggingface.co/Demondiablo/Qwen3-4B-Instruct-2507-FP8
- Checkpoint FP8 oficial de Qwen: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507-FP8
- Modelo base en bfloat16: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388

# Gael1125/Qwen3.6-3

## Resumen

Gael1125/Qwen3.6-3 es un fine-tune LoRA del modelo Qwen3.6-27B, con los pesos del adaptador fusionados en los pesos base. El modelo base, desarrollado por Alibaba Qwen, es un modelo causal de lenguaje con codificador visual (image-text-to-text) de 27.356 millones de parámetros, que destaca por su arquitectura híbrida de atención lineal (Gated DeltaNet) y atención clásica, así como por su contexto nativo de 262.144 tokens extensible hasta 1.010.000. Este repo en concreto, publicado por el usuario Gael1125, aplica una modificación sobre la base, pero conserva las capacidades del modelo original: razonamiento agéntico, generación de código a nivel de repositorio y procesamiento multimodal de imágenes y texto.

La relevancia de este lanzamiento radica en que Qwen3.6 es la primera variante de peso abierto de la serie 3.6, diseñada para priorizar estabilidad y utilidad real en entornos de desarrollo. El modelo base obtiene 77.2 en SWE-bench Verified y 53.5 en SWE-bench Pro, superando a su predecesor Qwen3.5-27B (75.0 y 51.2 respectivamente) y acercándose a modelos propietarios de gran tamaño. Este repo en particular no añade información adicional sobre el entrenamiento más allá de la fusión del adaptador, por lo que las especificaciones técnicas corresponden al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; capas con Gated DeltaNet (atención lineal) y Gated Attention; 64 capas, 16 bloques de 3×(Gated DeltaNet → FFN) → 1×(Gated Attention → FFN) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B emplea una arquitectura híbrida que combina atención lineal (Gated DeltaNet) y atención clásica. La configuración interna incluye 64 capas, con un patrón de 16 bloques donde cada bloque contiene tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention. La atención lineal usa 48 cabezas para V y 16 para QK con dimensión de cabeza 128; la atención gated usa 24 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64. La FFN tiene dimensión intermedia 17408. El modelo fue pre-entrenado y post-entrenado por Alibaba, e incluye entrenamiento con MTP (Multi-Token Prediction) en múltiples pasos. El repositorio de Gael1125 indica que es un fine-tune LoRA con los adaptadores fusionados, pero no ofrece detalles adicionales sobre el dataset de entrenamiento o el proceso de post-entrenamiento (si se usó RLHF, DPO, etc.).

## Capacidades

- Generación de texto y razonamiento complejo con contexto largo (hasta 1M tokens) gracias a la arquitectura de atención mixta.
- Codificación agéntica: el modelo maneja flujos de trabajo de frontend y razonamiento a nivel de repositorio, como demuestran sus resultados en SWE-bench.
- Comprensión de imágenes: al ser un modelo image-text-to-text, puede procesar imágenes y generar texto relacionado (análisis visual, descripciones, etc.).
- Preservación del razonamiento: la opción de retener el contexto de razonamiento de mensajes históricos facilita el desarrollo iterativo.
- Capacidad de agentes de código: dado su rendimiento en SWE-bench, el modelo puede ejecutar tareas de ingeniería de software autónomas (editar código, resolver issues).
- Compatibilidad con herramientas de inferencia estándar: Transformers, vLLM, SGLang, KTransformers.

## Casos de uso

- **Asistente de programación en repositorios**: el modelo puede analizar un repositorio completo, comprender la estructura de código y sugerir cambios o resolver issues, gracias a su contexto largo y su rendimiento en SWE-bench.
- **Generación de código frontend**: dada su capacidad para flujos de trabajo frontend, puede generar componentes React, HTML/CSS o Vue a partir de descripciones en lenguaje natural o capturas de pantalla.
- **Análisis de documentación técnica con imágenes**: al combinar visión y texto, puede procesar capturas de pantalla de interfaces, diagramas o esquemas para explicar su funcionamiento o extraer información.
- **Revisión de código automatizada**: integrado en un pipeline CI/CD, puede analizar diffs y detectar errores o sugerir mejoras, aprovechando el contexto largo para considerar el historial del proyecto.
- **Soporte técnico con contexto largo**: en sistemas de atención al cliente, puede gestionar conversaciones multi-turno con historial extenso (hasta 1M tokens) sin perder el hilo.
- **Investigación y resumen de documentos extensos**: puede procesar informes, papers o libros completos (con contexto de 262K tokens) para generar resúmenes o responder preguntas específicas.

## Benchmarks y rendimiento

Los datos de benchmark disponibles provienen de la model card del modelo base Qwen3.6-27B, que se comparan con otros modelos. Se muestran los resultados de SWE-bench (agente de codificación):

| Benchmark | Qwen3.6-27B (este repo) | Qwen3.5-27B | Qwen3.6-35B-A3B | Claude 4.5 Opus |
|---|---|---|---|---|
| SWE-bench Verified | 77.2 | 75.0 | 73.4 | 80.9 |
| SWE-bench Pro | 53.5 | 51.2 | 49.5 | 57.1 |

No se han publicado más resultados de benchmarks en la información disponible. Los valores de SWE-bench Multilingual no están disponibles para este modelo en los datos proporcionados.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 27.4B parámetros. En FP16/BF16 ocupa aproximadamente 54 GB, por lo que se necesitan 2× GPU de 32 GB (por ejemplo, 2× A100 40GB) o una GPU de 80 GB (A100/H100) para inferencia sin cuantizar. Con cuantización 8-bit se reduce a ~28 GB, y con 4-bit a ~14 GB (aunque no se indican cuantizaciones disponibles).
- **GPU recomendadas**: A100 80GB, H100 80GB, o 2× RTX 4090 (24GB) si se usa cuantización. No se recomienda para GPUs consumer de menos de 24GB sin cuantización.
- **Despliegue**: compatible con vLLM, SGLang, KTransformers y Transformers. No hay mención de soporte GGUF/llama.cpp en la información, pero es posible que se pueda convertir.
- **Latencia/throughput**: no disponible; depende de la configuración y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | SWE-bench Pro | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-27B (este repo) | 27B denso | 262K (ext. 1M) | 77.2 | 53.5 | Apache 2.0 |
| Qwen3.5-27B | 27B denso | no disponible | 75.0 | 51.2 | Apache 2.0 |
| Qwen3.6-35B-A3B (MoE) | 35B totales, 3B activos | no disponible | 73.4 | 49.5 | Apache 2.0 |
| Gemma4-31B | 31B | no disponible | 52.0 | 35.7 | no disponible |

Nota: los datos de Qwen3.5-27B y Qwen3.6-35B-A3B provienen de la tabla de benchmark de la model card. No se dispone de más detalles de contexto para esos modelos.

## Limitaciones y advertencias

- El repositorio es un fine-tune LoRA de un tercero (Gael1125) sobre el modelo base Qwen3.6-27B. La calidad y fiabilidad de este adaptador no está garantizada por Alibaba; se recomienda validar el comportamiento en casos de uso específicos.
- No hay información sobre sesgos o riesgos de alucinación específicos para este fine-tune. El modelo base, al ser un modelo de lenguaje grande, puede presentar sesgos y generar contenido incorrecto.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir el trabajo según los términos de la licencia (ver NOTICE en el repo).
- El contexto de 1M tokens es una extensión teórica; en la práctica, el uso de contextos largos puede requerir mucha memoria y degradar el rendimiento.
- No se especifican los idiomas soportados; el modelo base está entrenado principalmente en inglés y chino, pero puede generalizar a otros idiomas con menor calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Gael1125/Qwen3.6-3
- Modelo base Qwen3.6-27B (blog oficial): https://qwen.ai/blog?id=qwen3.6-27b
- Blog de Qwen3.6-Plus (agentes reales): https://qwen.ai/blog?id=qwen3.6
- Guía de desarrollador de Qwen 3.6: https://lushbinary.com/blog/qwen-3-6-developer-guide-benchmarks-architecture-api-self-hosting/
- Guía de Qwen 3.6 (27B denso vs 35B-A3B): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/</think>## Resumen

Gael1125/Qwen3.6-3 es un fine-tune LoRA del modelo Qwen3.6-27B, con los adaptadores fusionados en los pesos base. El modelo base, desarrollado por Alibaba, es un modelo causal de lenguaje con codificador visual (image-text-to-text) de 27.356 millones de parámetros, que combina atención lineal (Gated DeltaNet) y atención clásica. Su contexto nativo de 262.144 tokens es extensible hasta 1.010.000, lo que lo sitúa como una opción relevante para tareas de razonamiento de largo alcance y procesamiento de repositorios completos. Este repositorio, publicado por el usuario Gael1125, no añade información adicional sobre el entrenamiento más allá de la fusión del adaptador, por lo que sus especificaciones técnicas coinciden con el modelo base.

La relevancia de este lanzamiento radica en que Qwen3.6 es la primera variante de peso abierto de la serie 3.6, orientada a estabilidad y utilidad en entornos de desarrollo reales. El modelo base alcanza 77.2 en SWE-bench Verified y 53.5 en SWE-bench Pro, superando a su predecesor Qwen3.5-27B y acercándose a modelos propietarios de gran tamaño. Además, su arquitectura híbrida de atención lineal y atención clásica permite un equilibrio entre eficiencia y capacidad de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; hybrida Gated DeltaNet (linear attention) + Gated Attention; 64 capas, 16 bloques de 3×(Gated DeltaNet → FFN) → 1×(Gated Attention → FFN) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B emplea una arquitectura híbrida que intercala capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention). La configuración incluye 64 capas organizadas en 16 bloques, cada uno con tres subcapas de Gated DeltaNet seguidas de una subcapa de atención. La atención lineal usa 48 cabezas para V y 16 para QK con dimensión de cabeza 128; la atención gated usa 24 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64. La FFN tiene dimensión intermedia 17408. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que acelera la decodificación.

En cuanto al entrenamiento, la model card indica que el modelo fue pre-entrenado y post-entrenado por Alibaba, pero no se detalla el tamaño del dataset ni el proceso de alineación (RLHF, DPO, etc.). Este repositorio es un fine-tune LoRA del usuario Gael1125, con los adaptadores fusionados en los pesos base. No se especifica el dataset utilizado para el fine-tune ni el número de tokens de entrenamiento.

## Capacidades

- Generación de texto y razonamiento con contexto largo de hasta 1M tokens, gracias a la arquitectura híbrida de atención.
- **Codificación agéntica**: el modelo maneja flujos de trabajo frontend y razonamiento a nivel de repositorio, como demuestran sus resultados en SWE-bench.
- **Comprensión de imágenes**: al ser un modelo image-text-to-text, puede procesar imágenes y generar texto descriptivo, análisis o respuestas basadas en contenido visual.
- **Preservación del pensamiento**: permite conservar el contexto de razonamiento de mensajes históricos para iteraciones de desarrollo más eficientes.
- **Capacidades de agente**: puede ejecutar tareas de ingeniería de software de forma autónoma (edición de código, análisis de repositorios) según los benchmarks.
- **Compatibilidad con herramientas de inferencia**: funciona con Transformers, vLLM, SGLang y KTransformers.

## Casos de uso

- **Asistente de programación en repositorios**: el modelo puede analizar un repositorio completo, identificar errores y sugerir correcciones, gracias a su contexto de hasta 1M tokens y su rendimiento en SWE-bench.
- **Generación de código frontend**: puede crear componentes de interfaz (HTML, CSS, JavaScript) a partir de descripciones en lenguaje natural o capturas de pantalla, gracias a su capacidad de visión y su dominio de flujos frontend.
- **Análisis de documentación técnica con imágenes**: al combinar visión y texto, puede procesar diagramas, esquemas o capturas de pantalla para explicar su funcionamiento o extraer información relevante.
- **Revisión de código automatizada**: integrado en un pipeline de CI/CD, puede analizar diffs y detectar riesgos o sugerencias de mejora, considerando el historial completo del proyecto.
- **Atención al cliente con contexto largo**: en sistemas de conversación, puede gestionar diálogos multi-turno con historial extenso (hasta 1M tokens) sin perder el hilo de la conversación.
- **Análisis de documentos extensos**: puede resumir informes, libros o artículos largos (hasta 262K tokens) y responder preguntas específicas sobre su contenido.
- **Desarrollo de agentes autónomos**: gracias a su capacidad de razonamiento y su rendimiento en tareas de codificación, puede ser el cerebro de agentes que ejecutan tareas de mantenimiento de código.

## Benchmarks y rendimiento

Los datos de benchmark disponibles en la model card corresponden al modelo base Qwen3.6-27B. Se presentan los resultados en tareas de codificación agéntica:

| Modelo | Qwen3.6-27B (este repo) | Qwen3.5-27B | Qwen3.6-35B-A3B | Claude 4.5 Opus |
|---|---|---|---|---|
| SWE-bench Verified | 77.2 | 75.0 | 73.4 | 80.9 |
| SWE-bench Pro | 53.5 | 51.2 | 49.5 | 57.1 |

No se han proporcionado más resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los valores de SWE-bench Multilingual no están disponibles para este modelo en los datos proporcionados.

## Requisitos de hardware

- **VRAM estimada**: con 27.356 millones de parámetros, el modelo en FP16/FP32 ocupa aproximadamente 54 GB (FP16) o 108 GB (FP32). Para inferencia en FP16 se recomienda al menos 2× GPU de 32 GB (A100 40GB) o una GPU de 80 GB (A100/H100). Con cuantización 8-bit se reduce a ~28 GB, y con 4-bit a ~14 GB, aunque no se indican cuantizaciones oficiales.
- **GPU recomendadas**: A100 80GB, H100 80GB, o 2× RTX 4090 (24GB cada una) con cuantización. No es viable en GPU consumer de 16 GB sin cuantización agresiva.
- **Opciones de despliegue**: compatible con vLLM, SGLang, KTransformers y Transformers. No hay evidencia de soporte GGUF/llama.cpp, aunque es posible convertir el modelo.
- **Latencia y throughput**: no disponible; dependen de la configuración de hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | SWE-bench Pro | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-27B (este repo) | 27B | 262K (1M ext.) | 77.2 | 53.5 | Apache 2.0 |
| Qwen3.5-27B | 27B | no disponible | 75.0 | 51.2 | Apache 2.0 |
| Qwen3.6-35B-A3B (MoE) | 35B totales, 3B activos | no disponible | 73.4 | 49.5 | Apache 2.0 |
| Gemma4-31B | 31B | no disponible | 52.0 | 35.7 | no disponible |

Nota: los datos de Qwen3.5-27B y Qwen3.6-35B-A3B provienen de la model card. No se dispone de información sobre el contexto de esos modelos.

## Limitaciones y advertencias

- El repositorio es un fine-tune de terceros (Gael1125) sobre el modelo base Qwen3.6-27B; la calidad y validación de este ajuste no están garantizadas por Alibaba. Se recomienda evaluar el modelo en casos de uso específicos antes de producción.
- No se ha publicado información sobre sesgos o alucinaciones específicas de este fine-tune. Como todo modelo de lenguaje, puede generar contenido incorrecto o sesgado.
- La licencia Apache 2.0 permite uso comercial, pero se debe cumplir con los requisitos de atribución (ver LICENSE y NOTICE).
- El contexto de 1M tokens es una extensión teórica; en la práctica, su uso puede requerir mucha memoria y degradar el rendimiento.
- No se especifican los idiomas soportados; el modelo base está entrenado principalmente en inglés y chino, con posible menor calidad en otros idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Gael1125/Qwen3.6-3
- Blog oficial de Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Blog de Qwen3.6-Plus (agentes reales): https://qwen.ai/blog?id=qwen3.6
- Guía de desarrollador de Qwen 3.6: https://lushbinary.com/blog/qwen-3-6-developer-guide-benchmarks-architecture-api-self-hosting/
- Guía de Qwen 3.6 (27B denso vs 35B-A3B): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/</think>## Resumen

Gael1125/Qwen3.6-3 es un fine-tune LoRA del modelo Qwen3.6-27B, con los adaptadores fusionados en los pesos base. El modelo base, desarrollado por Alibaba, es un modelo causal de lenguaje con codificador de imagen (image-text-to-text) de 27.356 millones de parámetros, que combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention). Su contexto nativo de 262.144 tokens es extensible hasta 1.010.000, lo que lo hace adecuado para tareas de razonamiento de largo alcance y procesamiento de repositorios de código completos. Este repositorio, publicado por el usuario Gael1125, conserva las capacidades del modelo original y no añade información adicional sobre el entrenamiento más allá de la fusión del adaptador.

La relevancia de este lanzamiento radica en que Qwen3.6 es la primera variante de peso abierto de la serie 3.6, orientada a la estabilidad y utilidad en entornos de desarrollo reales. El modelo base alcanza 77.2 en SWE-bench Verified y 53.5 en SWE-bench Pro, superando a su predecesor Qwen3.5-27B (75.0 y 51.2 respectivamente) y acercándose a modelos propietarios de gran tamaño como Claude 4.5 Opus. Además, su arquitectura híbrida permite un equilibrio entre eficiencia computacional y capacidad de contexto, siendo compatible con herramientas de inferencia estándar como vLLM, SGLang y KTransformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; híbrida Gated DeltaNet + Gated Attention; 64 capas, 16 bloques de 3×(Gated DeltaNet → FFN) → 1×(Gated Attention → FFN) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B emplea una arquitectura de transformador híbrida que intercala capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention). La configuración incluye 64 capas organizadas en 16 bloques, cada uno con tres subcapas de Gated DeltaNet seguidas de una capa de atención. La Gated DeltaNet usa 48 cabezas para V y 16 para QK, con dimensión de cabeza 128; la Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión 256 y RoPE de 64. La FFN tiene dimensión intermedia 17408. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que acelera la decodificación.

En cuanto al entrenamiento, la model card indica que el modelo fue pre-entrenado y post-entrenado por Alibaba, pero no se especifican el número de tokens, el dataset utilizado ni el proceso de alineación (RLHF, DPO, etc.). Este repositorio concreto es un fine-tune LoRA del usuario Gael1125, con los adaptadores fusionados en los pesos base. No se detalla el dataset de fine-tuning ni el método de entrenamiento adicional.

## Capacidades

- **Generación de texto y razonamiento**: produce texto coherente y realiza tareas de razonamiento complejo, especialmente en el dominio de la programación.
- **Codificación agéntico**: el modelo maneja flujos de trabajo frontend y razonamiento a nivel de repositorio, como demuestran sus resultados en SWE-bench.
- **Comprensión de imágenes**: al ser un modelo image-text-to-text, puede procesar imágenes y generar texto descriptivo, responder preguntas sobre contenido visual o analizar diagramas técnicos.
- **Preservación del pensamiento**: permite conservar el contexto de razonamiento de mensajes históricos para iteraciones de desarrollo más eficientes.
- **Capacidad de herramientas**: aunque no se menciona explícitamente, su rendimiento en tareas de codificación agéntica sugiere que puede integrar herramientas de edición de código y análisis de repositorios.
- **Contexto largo**: con 262K tokens nativos, puede procesar documentos extensos o conversaciones de múltiples turnos sin perder el hilo.

## Casos de uso

- **Asistente de programación en repositorios**: el modelo puede analizar un repositorio completo, identificar errores y sugerir correcciones, gracias a su contexto de hasta 1M tokens y su rendimiento en SWE-bench.
- **Generación de código frontend**: puede crear componentes de interfaz

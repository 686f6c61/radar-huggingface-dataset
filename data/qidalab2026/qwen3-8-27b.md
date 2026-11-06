# Qidalab2026/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, publicado por el usuario Qidalab2026 en Hugging Face bajo licencia Apache 2.0. Según la model card, se presenta como la generación más capaz de la familia de modelos abiertos Qwen hasta la fecha, construida sobre la base arquitectónica de Qwen3.5 y orientada a tareas de programación, trabajo profesional, investigación y tareas agénticas de largo horizonte. El modelo combina un transformer denso de 27 781 427 952 parámetros (27,8B) con un codificador visual nativo, lo que le permite procesar imágenes y vídeos además de texto.

La arquitectura destaca por un diseño híbrido poco convencional: 64 capas organizadas en 16 bloques que alternan tres subcapas de Gated DeltaNet (atención lineal) con una de Gated Attention (atención completa con RoPE), además de Multi-Token Prediction (MTP) entrenado con múltiples pasos. La longitud de contexto nativa es de 262 144 tokens, extensible hasta 1 000 000, y el modelo incorpora control flexible de "thinking mode" con parámetros como `reasoning_effort` y `preserve_thinking`.

Es relevante ahora porque llega en un momento de consolidación de los modelos abiertos de tamaño medio-grande con capacidades multimodales y agénticas, y porque su licencia Apache 2.0 permite uso comercial sin restricciones adicionales. No obstante, la información pública disponible es limitada: el repositorio tiene 25 descargas y 0 likes, y no se han publicado detalles sobre composición del dataset de entrenamiento ni sobre el proceso de post-entrenamiento (RLHF/DPO).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido de Gated DeltaNet (atención lineal) y Gated Attention; 64 capas en 16 bloques de 3×(Gated DeltaNet → FFN) + 1×(Gated Attention → FFN) |
| Parametros totales | 27 781 427 952 (27,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 55,6 GB); compatible con Transformers, vLLM, SGLang y TokenSpeed |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con codificador de visión, de 64 capas y dimensión oculta 5120. La innovación principal reside en su layout híbrido: 16 bloques compuestos por tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention. La Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; la Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. La FFN tiene dimensión intermedia de 17 408, y el embedding de tokens (248 320, con padding) coincide con la dimensión de salida del LM. Se entrenó con Multi-Token Prediction (MTP) en múltiples pasos, lo que puede habilitar decodificación especulativa.

El modelo ha pasado por pre-entrenamiento y post-entrenamiento, pero la model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla el proceso de alineación ni el corpus multimodal utilizado para el codificador visual. La información sobre el entrenamiento es, por tanto, muy limitada y no permite evaluar la calidad o cobertura de los datos.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable por petición y ajustable mediante `reasoning_effort`.
- Comprensión de imágenes y vídeos de forma nativa, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Programación y tareas de terminal agénticas (según la model card, evaluado en Terminal Bench 2.1).
- Ejecución de agentes autónomos con planificación y manejo de feedback del entorno para tareas de múltiples pasos.
- Retención de contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Compatibilidad con harnesses y herramientas de desarrollo populares (sin detallar cuáles).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia en programación agéntica: el modelo puede operar en terminales y entornos de desarrollo para completar tareas de codificación de múltiples pasos, gracias a su contexto de 262K tokens y a su entrenamiento específico en Terminal Bench 2.1.
- Análisis de documentos técnicos y diagramas STEM: su codificador visual nativo permite extraer información de figuras, esquemas y documentos escaneados en flujos de investigación.
- Procesamiento de vídeo de larga duración: con soporte para vídeos de hasta una hora, puede resumir o extraer información de grabaciones de reuniones, clases o vigilancia.
- Agentes autónomos de investigación: la planificación reforzada y el manejo de feedback del entorno lo hacen adecuado para tareas de búsqueda y síntesis de información en múltiples pasos.
- Automatización de flujos de trabajo profesionales: su contexto extensible a 1M tokens permite procesar grandes volúmenes de documentación contractual o legal en una sola pasada.
- Despliegue en infraestructura propia: al ser un modelo denso de 27,8B con licencia Apache 2.0, puede servirse en clústeres con vLLM o SGLang sin restricciones comerciales, integrándose en pipelines internos de la organización.
- Moderación y análisis de contenido multimodal: puede clasificar y describir imágenes y vídeos en sistemas de revisión automatizada.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos, pero en la información proporcionada solo se muestra la cabecera y la primera fila (Agentic terminal coding – Terminal Bench 2.1), sin los valores numéricos. No se dispone de cifras concretas de MMLU, HumanEval, GSM8K ni de otros benchmarks.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 28-30 GB, viable en GPUs de 32 GB o superiores.
- VRAM estimada en cuantización de 4 bits: alrededor de 14-16 GB, potencialmente viable en GPUs consumer de 16-24 GB (RTX 4080/4090), aunque la información de cuantizaciones no está confirmada por el autor.
- GPUs recomendadas: A100 80GB, H100 80GB, H200 para despliegue en FP16; RTX 4090 (24 GB) solo con cuantización agresiva.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27,8B (denso) | 262K nativo, hasta 1M | Apache 2.0 | Hugging Face (25 descargas) |
| Qwen3.6-27B | No disponible | No disponible | No disponible | Mencionado en la model card |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Mencionado en la model card |
| Muse Glimmer-30B | ~30B (según nombre) | No disponible | No disponible | Mencionado en la model card |

La comparativa se limita a los modelos citados en la propia model card; no se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- La model card no especifica los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas distintos del inglés.
- No se han publicado detalles sobre sesgos conocidos, composición del dataset ni procesos de alineación, por lo que el riesgo de sesgos y alucinaciones no puede evaluarse con rigor.
- El repositorio tiene un volumen muy bajo de descargas (25) y ningún like, lo que sugiere poca validación por parte de la comunidad; conviene tratar los pesos con cautela hasta verificar su procedencia.
- Aunque la licencia es Apache 2.0, que permite uso comercial, la falta de información sobre el entrenamiento impide descartar problemas de procedencia de datos.
- El contexto nativo de 262K tokens puede degradar la calidad en el extremo superior; la extensión a 1M tokens no está validada en la información disponible.
- El modo "thinking" activado por defecto incrementa el consumo de tokens y la latencia; en producción conviene desactivarlo o ajustar `reasoning_effort` según la tarea.
- No se confirma el soporte de tool calling ni de function calling, capacidades críticas para despliegues agénticos.
- El tamaño del repo (55,6 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Qidalab2026/Qwen3.8-27B
- Qwen Cloud (servicio gestionado mencionado en la model card): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b

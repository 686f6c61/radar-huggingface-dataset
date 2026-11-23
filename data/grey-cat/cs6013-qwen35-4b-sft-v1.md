# grey-cat/cs6013-qwen35-4b-sft-v1

## Resumen

`grey-cat/cs6013-qwen35-4b-sft-v1` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-4B-Base`, publicado por el usuario `grey-cat` en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas conjuntas de imagen y texto y genera texto. Con 4.659.865.088 parámetros reales (según los pesos en safetensors) y un repositorio de 9,3 GB, se posiciona en la gama de modelos pequeños dentro de la familia Qwen3.5.

El modelo hereda la arquitectura híbrida de Qwen3.5, que combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention) en un patrón de 8 bloques de repetición, además de una ventana de contexto nativa de 262.144 tokens extensible hasta 1.010.000. Esta arquitectura está diseñada para ofrecer inferencia de alto rendimiento con baja latencia, y el modelo base incorpora entrenamiento multimodal con fusión temprana de tokens de imagen y texto.

La relevancia de esta ficha radica en que se trata de un fine-tuning comunitario con muy poca tracción (2 descargas, 0 likes en el momento de la consulta) y cuya model card es prácticamente una copia de la del modelo base Qwen3.5-4B, sin documentar el proceso de ajuste, los datos utilizados ni los resultados específicos del SFT. Esto limita seriamente la evaluación de su calidad real frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; híbrida Gated DeltaNet + Gated Attention, con FFN y MTP (multi-token prediction) |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE en la información del modelo; la model card menciona "sparse Mixture-of-Experts" como característica de la familia, pero no se confirma para esta variante de 4B) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (no se especifican en la información proporcionada) |
| Idiomas soportados | no disponible para este fine-tuning; la model card del base menciona 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.5-4B es un transformer causal con vision encoder, organizado en 32 capas con un layout híbrido de 8 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La dimensión oculta es de 2560, con embedding de tokens de 248.320 (padded) y salida LM atada al embedding. Las capas Gated DeltaNet usan 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; las capas Gated Attention usan 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. La FFN tiene dimensión intermedia de 9216. El modelo se entrenó con multi-token prediction (MTP) en varios pasos.

El modelo base Qwen3.5-4B fue preentrenado y postentrenado por el equipo Qwen, con entrenamiento de fusión temprana sobre tokens multimodales, RL escalado en entornos multiagente y una infraestructura de entrenamiento asíncrona. Sin embargo, la información proporcionada no detalla el proceso de SFT aplicado por `grey-cat`: no se especifican el número de tokens de ajuste, la composición del dataset, si hubo RLHF/DPO adicional ni las hiperparámetros del fine-tuning. La model card del repositorio es una copia de la del modelo base y no documenta ninguna innovación propia del SFT.

## Capacidades

- Generación de texto y razonamiento: el modelo base reporta resultados en MMLU-Pro y MMLU-Redux, lo que indica capacidad de conocimiento general y STEM.
- Comprensión visual: pipeline image-text-to-text, con vision encoder integrado y fusión temprana de tokens multimodales.
- Razonamiento multimodal: la model card del base afirma paridad cross-generacional con Qwen3 y superioridad sobre Qwen3-VL en razonamiento, código, agentes y comprensión visual.
- Codificación y agentes: la familia Qwen3.5 destaca en benchmarks de código y agentes según la model card del base.
- Capacidades multilingües: el base soporta 201 idiomas y dialectos; no se confirma que el SFT preserve todas.
- Tool calling / function calling: no disponible explícitamente en la información proporcionada para este fine-tuning.
- Modo thinking: no disponible explícitamente para esta variante.
- Soporte de contexto largo: 262.144 tokens nativos, extensible a 1.010.000.

## Casos de uso

- Análisis de documentos técnicos con imágenes: el modelo puede procesar capturas de pantalla, diagramas o figuras junto con texto explicativo, aprovechando su ventana de 262.144 tokens para ingerir manuales completos con ilustraciones.
- Asistencia en tareas de visión por computador de bajo nivel: al ser un modelo pequeño (4,66 B), puede desplegarse en entornos con recursos limitados para tareas de descripción de imágenes, OCR asistido o respuesta a preguntas visuales.
- Prototipado rápido de aplicaciones multimodales: su licencia Apache 2.0 y formato safetensors compatible con transformers, vLLM y SGLang facilitan la integración en pipelines de investigación sin restricciones comerciales.
- Generación de código con contexto visual: en escenarios donde el desarrollador comparte una captura de un error o un diagrama de arquitectura, el modelo puede razonar sobre la imagen y proponer correcciones de código, aunque su tamaño limita la profundidad frente a modelos mayores.
- Evaluación comparativa de fine-tunings comunitarios: sirve como caso de estudio para investigar cómo un SFT no documentado afecta al rendimiento del base en tareas específicas, dado que no hay benchmarks publicados del ajuste.
- Despliegue en entornos con GPU de gama media: con 4,66 B de parámetros, es viable en GPUs consumer de 16-24 GB con cuantización, para tareas de chat multimodal o clasificación image-text.
- Investigación en arquitecturas híbridas: permite estudiar el comportamiento de Gated DeltaNet + Gated Attention en un modelo pequeño con contexto largo, aunque el SFT introduce una variable no controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos del fine-tuning `cs6013-qwen35-4b-sft-v1` en la información disponible. La model card del repositorio reproduce la tabla del modelo base Qwen3.5-4B, que se incluye a continuación como referencia del punto de partida (no del SFT):

| Benchmark | Qwen3.5-4B | Qwen3.5-9B | Qwen3-30BA3B-Thinking-2507 | GPT-OSS-20B | GPT-OSS-120B |
|---|---|---|---|---|---|
| MMLU-Pro | 79,1 | 82,5 | 80,9 | 74,8 | 80,8 |
| MMLU-Redux | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

Nota: la tabla original se truncó en el extracto proporcionado; solo se dispone de los valores de MMLU-Pro completos y de MMLU-Redux parcialmente. No se deben inferir resultados del SFT a partir de estos datos del base.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de 9,3 GB (probablemente bf16/fp16), se requieren al menos ~10 GB de VRAM para cargar el modelo sin cuantizar. Con cuantización a 8 bits se estiman ~5-6 GB; a 4 bits, ~3-4 GB (estimaciones basadas en el número de parámetros, no confirmadas en la información).
- GPU recomendadas: para bf16 sin cuantizar, una RTX 4090 (24 GB) o A100 40 GB; para cuantización 4/8 bits, una RTX 3060 12 GB o RTX 4060 Ti 16 GB podría ser suficiente.
- Cabe en GPU consumer: sí, en GPUs de 16-24 GB con cuantización; en bf16 completo, en GPUs de 16 GB o más con margen ajustado.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (según la model card del base).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| cs6013-qwen35-4b-sft-v1 | 4,66 B | 262.144 (ext. 1.010.000) | Apache 2.0 | Sí (image-text-to-text) | Hugging Face, 2 descargas |
| Qwen3.5-4B (base) | 4 B | 262.144 (ext. 1.010.000) | Apache 2.0 | Sí | Hugging Face, oficial |
| Qwen3.5-9B | 9 B | no disponible | Apache 2.0 (según familia) | Sí | Hugging Face, oficial |
| GPT-OSS-20B | 20 B | no disponible | no disponible | no disponible | no disponible |

La comparativa principal es contra el propio modelo base Qwen3.5-4B, del que este SFT deriva. No hay datos que permitan afirmar que el fine-tuning mejore al base en ninguna tarea; de hecho, la falta de documentación y benchmarks del SFT es una desventaja frente al modelo oficial.

## Limitaciones y advertencias

- Model card no documentada: el README es una copia del modelo base y no describe el dataset de SFT, hiperparámetros ni objetivos del ajuste, lo que impide reproducir o evaluar el fine-tuning.
- Sin benchmarks del SFT: no hay evidencia de que el ajuste mejore al base; podría degradar capacidades por sobreajuste o catastrophic forgetting.
- Tracción mínima: 2 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad.
- Riesgo de alucinación: inherente a los modelos de 4 B; la model card del base no reporta tasas de alucinación.
- Idiomas: no se confirma que el SFT preserve los 201 idiomas del base; la información de idiomas del fine-tuning no está disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el autor del SFT no ofrece garantías sobre el comportamiento del modelo ajustado.
- Contexto largo: aunque el base soporta 262.144 tokens, no se ha verificado que el SFT mantenga esta capacidad; el entrenamiento con contextos cortos podría degradar el rendimiento en ventanas largas.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de SFT no especificado.

## Enlaces

- Hugging Face: https://huggingface.co/grey-cat/cs6013-qwen35-4b-sft-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE

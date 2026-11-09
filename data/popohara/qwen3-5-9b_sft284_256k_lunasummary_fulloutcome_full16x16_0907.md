# Popohara/Qwen3.5-9B_SFT284_256K_LunaSummary_fullOutcome_full16x16_0907

## Resumen

Qwen3.5-9B es un modelo de lenguaje y visión de tipo causal desarrollado por el equipo Qwen (Alibaba). Este repositorio concreto, publicado por el usuario Popohara bajo el identificador `Qwen3.5-9B_SFT284_256K_LunaSummary_fullOutcome_full16x16_0907`, es un fine-tuning supervisado (SFT) del modelo base `Qwen/Qwen3.5-9B-Base`, orientado a tareas de image-text-to-text. El nombre del checkpoint sugiere un ajuste con 284 pasos de entrenamiento y un contexto de 256K tokens, aunque estos detalles no están documentados en la model card del autor.

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina Gated Delta Networks (atención lineal) con atención clásica con compuertas, organizada en 32 capas con un patrón de 8 bloques de 4 capas (3 de Gated DeltaNet + 1 de Gated Attention). Con 9.653.104.368 parámetros totales, 4096 dimensiones ocultas y un contexto nativo de 262.144 tokens extensible hasta 1.010.000, está diseñado para cargas multimodales de largo alcance.

La relevancia de este checkpoint radica en su pipeline image-text-to-text: combina un encoder visual con el LM para tareas que requieren razonamiento sobre imágenes y texto simultáneamente. Al estar bajo licencia Apache 2.0 y ser compatible con transformers, vLLM, SGLang y KTransformers, es un candidato práctico para despliegues de investigación y producción que necesiten multimodalidad con contexto largo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal LM con encoder visual; híbrida de Gated DeltaNet (atención lineal) y Gated Attention; MTP multi-step |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no se especifica que sea MoE en este tamaño) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la model card del base menciona 201 idiomas y dialectos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B usa una arquitectura híbrida con 32 capas dispuestas en 8 bloques de 4 capas cada uno: tres capas de Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidas de una capa de Gated Attention (16 cabezas para Q y 4 para KV, dimensión 256, RoPE de 64 dimensiones). El FFN tiene dimensión intermedia de 12288. La dimensión oculta es 4096 y el embedding de tokens es 248320 (con padding). El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos.

Según la model card del base, el entrenamiento combina pre-entrenamiento y post-entrenamiento con fusión temprana de tokens multimodales, lo que permite paridad con Qwen3 en razonamiento, código, agentes y comprensión visual. Se menciona RL escalado en entornos de millones de agentes y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100% respecto a texto puro. Este checkpoint concreto es un fine-tuning SFT sobre `Qwen3.5-9B-Base`; el autor no documenta la composición del dataset de ajuste, el número de tokens ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text): procesa imágenes junto a instrucciones de texto.
- Razonamiento, código y matemáticas heredados del base Qwen3.5-9B.
- Comprensión visual: el pipeline declarado es image-text-to-text, con encoder visual integrado.
- Contexto largo: ventana nativa de 262.144 tokens, extensible hasta 1.010.000.
- Soporte multilingüe amplio según el base (201 idiomas y dialectos); no verificado específicamente en este checkpoint.
- Compatibilidad con tool calling y agentes: la model card del base menciona RL en entornos multi-agente, aunque este checkpoint SFT no documenta explícitamente el soporte de function calling.
- Despliegue compatible con transformers, vLLM, SGLang y KTransformers.

## Casos de uso

- Análisis de documentos escaneados con contexto largo: el modelo puede recibir varias páginas de un PDF convertidas a imagen junto a instrucciones de extracción, aprovechando la ventana de 262K tokens para mantener coherencia entre páginas.
- Atención al cliente multimodal: gestión de conversaciones multi-turno donde el usuario adjunta capturas de pantalla o fotos de producto; el encoder visual permite interpretar la imagen dentro del hilo conversacional.
- Generación de código asistida por capturas: a partir de una imagen de una interfaz o un diagrama de arquitectura, el modelo puede generar el código correspondiente, útil en prototipado rápido.
- Moderación de contenido visual con razonamiento: clasificación y explicación de imágenes con justificación textual, apoyándose en el contexto largo para aplicar políticas extensas.
- Investigación académica en multimodalidad: al ser Apache 2.0 y estar disponible en safetensors, sirve como base para experimentos de fine-tuning sobre tareas vision-language específicas.
- Extracción de información de tablas e infografías: combinación de OCR implícito con razonamiento numérico para transformar imágenes tabulares en datos estructurados.
- Asistentes de accesibilidad: descripción detallada y contextual de imágenes para usuarios con discapacidad visual, con respuestas multi-turno sobre el contenido.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base Qwen3.5-9B (no específicos de este checkpoint SFT):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible en el extracto | no disponible en el extracto |

No se han publicado resultados de benchmarks específicos para el checkpoint `Qwen3.5-9B_SFT284_256K_LunaSummary_fullOutcome_full16x16_0907` en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 19,3 GB solo para pesos (tamaño del repo), más overhead de activaciones y KV cache; se recomienda 24 GB o más para contexto moderado.
- VRAM en cuantización de 8 bits: alrededor de 10-11 GB para pesos; en 4 bits, aproximadamente 5-6 GB, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado o cuantizado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 con contexto limitado, o en GPUs de 16 GB con cuantización 8 bits.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (según la model card del base).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (este checkpoint SFT) | 9,65B | 262.144 (ext. 1.010.000) | Apache 2.0 | Sí (image-text-to-text) | Hugging Face |
| Qwen3.5-4B | no disponible | no disponible | Apache 2.0 (presumible) | Sí | Hugging Face |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE, 3B activos) | no disponible | no disponible | no disponible | Hugging Face |
| GPT-OSS-20B | 20B | no disponible | no disponible | no disponible | no disponible |

En MMLU-Pro, el Qwen3.5-9B base obtiene 82,5, por encima de GPT-OSS-120B (80,8) y GPT-OSS-20B (74,8), y ligeramente por debajo de Qwen3-Next-80B-A3B-Thinking (82,7). El checkpoint SFT aquí descrito no tiene benchmarks propios publicados.

## Limitaciones y advertencias

- No hay benchmarks publicados para este checkpoint SFT concreto; el rendimiento puede diferir del base.
- El autor no documenta el dataset de fine-tuning, los hiperparámetros ni el proceso de entrenamiento, lo que dificulta evaluar sesgos introducidos.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas visuales con imágenes ambiguas o de baja calidad.
- Idiomas soportados no verificados para este checkpoint; el base declara 201 idiomas pero el ajuste puede haber alterado la cobertura.
- El nombre del checkpoint sugiere un contexto de 256K, pero no se confirma que el fine-tuning preserve la extensibilidad hasta 1M tokens del base.
- Aunque la licencia es Apache 2.0, conviene revisar la licencia del modelo base enlazada en la model card antes de uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes de uso en producción.
- El pipeline image-text-to-text requiere gestionar el encoder visual; no se detallan los requisitos específicos de preprocesado de imagen.

## Enlaces

- Hugging Face: https://huggingface.co/Popohara/Qwen3.5-9B_SFT284_256K_LunaSummary_fullOutcome_full16x16_0907
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE

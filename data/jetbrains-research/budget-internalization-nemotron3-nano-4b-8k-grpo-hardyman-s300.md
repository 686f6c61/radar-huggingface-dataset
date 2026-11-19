# JetBrains-Research/budget-internalization-nemotron3-nano-4b-8k-grpo-hardyman-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) de NVIDIA Nemotron-3-Nano-4B, publicado por JetBrains-Research como artefacto de investigación asociado al paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*. El objetivo no es crear un modelo generalista nuevo, sino demostrar que un modelo pequeño puede interiorizar un presupuesto fijo de generación (8.192 tokens) durante el entrenamiento, de modo que aprenda a razonar y responder dentro de ese límite sin necesidad de técnicas de escalado en tiempo de inferencia.

El modelo parte de los pesos BF16 de NVIDIA Nemotron-3-Nano-4B (3.973.556.832 parámetros, arquitectura `nemotron_h`) y se entrena con GRPO sobre el dataset matemático DeepScaleR durante 300 pasos, usando recompensa binaria de corrección de respuesta extraída de etiquetas `\boxed{}`. Las respuestas que agotan el presupuesto se truncan y se puntúan tal cual, lo que fuerza al modelo a gestionar su propia longitud de razonamiento.

Es relevante para investigadores interesados en RLVR (Reinforcement Learning with Verifiable Rewards), control de longitud de generación y modelos pequeños de razonamiento matemático desplegables en hardware modesto. La licencia es la de NVIDIA Nemotron Open Model License, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (según tag de transformers; detalles internos no disponibles) |
| Parametros totales | 3.973.556.832 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generación entrenado es de 8.192 tokens; el contexto total del modelo base no se especifica) |
| Tipos de cuantizacion | no disponible (pesos publicados en F32; el modelo base es BF16) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (F32), requiere `trust_remote_code` por `custom_code` |

## Arquitectura y entrenamiento

La arquitectura base es la de NVIDIA Nemotron-3-Nano-4B, etiquetada como `nemotron_h` en transformers y con código personalizado (`custom_code`), lo que implica que la implementación exacta de las capas no está estandarizada en la librería y requiere cargar el código del repositorio. No se dispone de detalles sobre si emplea atención lineal, híbrida u otras innovaciones del modelo base en la información proporcionada.

El ajuste se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Se usan 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de warmup, durante 300 pasos. Los datos son DeepScaleR (matemáticas) con un máximo de 3 épocas. La recompensa es binaria según corrección de la respuesta extraída de `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y respuesta en `\boxed{}`. La innovación central es la internalización de un presupuesto fijo de 8.192 tokens de generación, con truncado y puntuación directa de respuestas que agotan el límite.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, orientado a problemas con respuesta final en formato `\boxed{}`.
- Razonamiento bajo presupuesto fijo de generación: el modelo está entrenado para producir respuestas dentro de 8.192 tokens, gestionando su propia longitud.
- Extracción de respuesta final verificable mediante etiquetas `\boxed{}`.
- Conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible (el entrenamiento se limita a matemáticas).
- Capacidades multilingües: no disponibles (idiomas no especificados).
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Investigación en RLVR y control de longitud: sirve como checkpoint reproducible (paso 300, run `hardyman`) para estudiar cómo el entrenamiento con presupuesto fijo afecta la precisión dentro del presupuesto frente al escalado en tiempo de inferencia.
- Evaluación de razonamiento matemático con límite de tokens: útil para medir la degradación de precisión cuando se restringe `max_new_tokens` a 8.192 en benchmarks tipo DeepScaleR o GSM8K.
- Baseline para comparativas de presupuesto: permite comparar modelos entrenados con distintos presupuestos (por ejemplo, 4k frente a 8k) manteniendo el mismo modelo base y algoritmo.
- Fine-tuning posterior sobre dominios matemáticos específicos: al ser un modelo de ~4B en F32, se puede reentrenar o adaptar con recursos moderados en un solo nodo.
- Despliegue en entornos con límite estricto de tokens: adecuado cuando el coste de inferencia debe acotarse por respuesta, ya que el modelo está entrenado para no desbordar el presupuesto.
- Generación de soluciones matemáticas con respuesta verificable automáticamente: la salida en `\boxed{}` facilita pipelines de evaluación automática y filtrado de datos.
- Estudio de truncado como señal de recompensa: útil para analizar cómo penalizar implícitamente respuestas largas afecta el estilo de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 16 GB solo para pesos (3.973.556.832 × 4 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda convertir a BF16 (~8 GB) o cuantizar.
- GPU recomendadas: A100 40/80 GB, H100, L40S para F32/BF16 sin cuantizar; RTX 4090 (24 GB) suficiente en BF16.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en BF16; en GPUs de 12-16 GB probablemente requiere cuantización a 8 o 4 bits (no se publican GGUF oficiales).
- Opciones de despliegue: transformers con `trust_remote_code=True`; vLLM, TGI o llama.cpp solo si se generan conversiones compatibles, ya que la arquitectura `nemotron_h` con `custom_code` puede no estar soportada de forma nativa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JetBrains-Research/budget-internalization-nemotron3-nano-4b-8k-grpo-hardyman-s300 | ~4B | no disponible (presupuesto de generación 8.192) | GRPO sobre DeepScaleR, 300 pasos | nvidia-nemotron-open-model-license | Hugging Face |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4B | no disponible | Modelo base | nvidia-nemotron-open-model-license | Hugging Face |
| Modelos de razonamiento matemático de ~4B (p. ej. Qwen2.5-Math-7B, DeepSeek-R1-Distill-Qwen-1.5B) | 1.5B-7B | variable | SFT/RL sobre datos matemáticos | variable (Apache 2.0 en varios) | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el ajuste por RL con presupuesto fijo; frente a otros modelos matemáticos, la propuesta específica es la internalización del presupuesto más que el rendimiento bruto.

## Limitaciones y advertencias

- Entrenado exclusivamente para matemáticas con recompensa binaria; el rendimiento fuera de ese dominio no está caracterizado y probablemente sea limitado.
- Riesgo de alucinación en razonamientos largos, especialmente cuando el modelo se aproxima al límite de 8.192 tokens y las respuestas se truncan.
- El truncado durante el entrenamiento puede favorecer estilos de respuesta comprimidos que no siempre sean correctos; la recompensa binaria no penaliza explícitamente razonamientos inválidos que aciertan por casualidad.
- Idiomas soportados no especificados; no se garantiza un comportamiento multilingüe consistente.
- Licencia NVIDIA Nemotron Open Model License: revisar términos antes de uso comercial; no es una licencia permisiva tipo Apache 2.0.
- Requiere `trust_remote_code=True` por el código personalizado de la arquitectura `nemotron_h`, lo que implica ejecutar código del repositorio.
- Pesos en F32 (15,9 GB de repo), lo que complica el despliegue directo sin conversión.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la ficha; sin validación comunitaria ni benchmarks publicados.
- No se especifica la longitud de contexto total del modelo base; asumir 8.192 tokens de contexto sería un error, ya que ese es el presupuesto de generación entrenado.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-8k-grpo-hardyman-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: enlace no disponible en la información proporcionada.

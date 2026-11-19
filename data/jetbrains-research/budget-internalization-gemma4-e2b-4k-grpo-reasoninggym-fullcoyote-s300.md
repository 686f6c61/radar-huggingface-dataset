# JetBrains-Research/budget-internalization-gemma4-e2b-4k-grpo-reasoninggym-fullcoyote-s300

## Resumen

El modelo `budget-internalization-gemma4-e2b-4k-grpo-reasoninggym-fullcoyote-s300` es un ajuste fino por aprendizaje por refuerzo (RL) de `google/gemma-4-E2B-it`, desarrollado por JetBrains-Research. El objetivo es la "internalización de presupuesto": entrenar al modelo para que produzca respuestas correctas dentro de un límite fijo de 4.096 tokens de generación, en lugar de depender de un escalado de cómputo en tiempo de inferencia. Se corresponde con el paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

Técnicamente se trata de un fine-tune con GRPO (Group Relative Policy Optimization) sobre tareas de Reasoning Gym, problemas de razonamiento generados proceduralmente con respuestas en formato `\boxed{}`. Las respuestas que agotan el presupuesto de 4.096 tokens reciben recompensa cero, lo que fuerza al modelo a razonar de forma más compacta. El checkpoint publicado corresponde al paso 300 de entrenamiento (run `fullcoyote`).

El modelo es relevante para investigadores interesados en RLVR (Reinforcement Learning with Verifiable Rewards) y en cómo los límites de tokens afectan al comportamiento de razonamiento. Hereda la arquitectura multimodal de Gemma 4 E2B, con 5.123.178.051 parámetros reales en safetensors, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B), fine-tune con GRPO |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (presupuesto de generación de 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer multimodal con pipeline `any-to-any` (entrada y salida de imagen y texto). Sobre esa base se aplica GRPO con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. El entrenamiento usa Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de warmup, durante 300 pasos con batches de 32 prompts × 8 rollouts por paso.

Los datos son tareas de Reasoning Gym, problemas de razonamiento generados proceduralmente con verificación automática de la respuesta en `\boxed{}`. La innovación clave es la penalización por presupuesto: cualquier respuesta que alcanza `max_new_tokens = 4.096` recibe recompensa cero, de modo que el modelo aprende a resolver dentro del límite en lugar de extender la cadena de razonamiento. Se entrenó un máximo de 3 épocas y los pesos se publican en F32.

## Capacidades

- Generación de texto y razonamiento multi-paso sobre problemas de Reasoning Gym.
- Respuestas estructuradas con verificación en formato `\boxed{}`.
- Razonamiento bajo restricción explícita de presupuesto de tokens (4.096).
- Capacidades multimodales heredadas del modelo base Gemma 4 E2B (pipeline `any-to-any`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en RLVR: reproducir y analizar el efecto de la internalización de presupuesto comparando este checkpoint con el modelo base sin fine-tune.
- Evaluación de eficiencia de razonamiento: medir la precisión dentro de 4.096 tokens frente a la precisión con escalado de cómputo en tiempo de inferencia.
- Generación de datos sintéticos de razonamiento: usar el modelo para producir soluciones compactas verificables en formato `\boxed{}`.
- Estudio de dinámicas GRPO: analizar el checkpoint del paso 300 para entender la evolución de la longitud de respuesta durante el entrenamiento.
- Benchmarking de límites de tokens: servir como referencia para comparar estrategias de control de longitud en modelos de razonamiento.
- Fine-tuning posterior: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para experimentos propios de RL con presupuesto fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 20,5 GB solo para pesos (5.123 millones de parámetros × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en BF16/FP16: aproximadamente 10,2 GB para pesos, más overhead.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer con 24 GB o más para cuantizaciones de 8 bits.
- Cabe en consumer GPU: sí, en RTX 3090/4090 (24 GB) con cuantización de 8 bits; en F32 requiere GPUs de 24 GB o más con gestión cuidadosa de memoria.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama y TGI no confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| budget-internalization-gemma4-e2b-4k (este) | 5.123 M | no disponible | Apache 2.0 | GRPO con presupuesto fijo de 4k tokens |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Gemma 4 License | Modelo base multimodal sin RL |
| Alternativas RLVR de razonamiento | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para tareas de Reasoning Gym; su generalización a otros dominios de razonamiento no está verificada.
- La penalización por presupuesto puede degradar la precisión en problemas que requieren cadenas de razonamiento largas.
- Riesgo de alucinación inherente al modelo base; el RL sobre verificadores no elimina este comportamiento fuera de las tareas de entrenamiento.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe.
- Aunque la licencia declarada es Apache 2.0, la model card indica que hereda la licencia del modelo base (`google/gemma-4-E2B-it`), lo que puede imponer términos adicionales de la Gemma 4 License para uso comercial. Verificar antes de desplegar en producción.
- El checkpoint corresponde al paso 300 de un run concreto (`fullcoyote`); no se documentan resultados de otros checkpoints ni de ablaciones.
- Pesos en F32: el despliegue en producción requiere cuantización, cuyos efectos sobre el rendimiento no están documentados.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-4k-grpo-reasoninggym-fullcoyote-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: no disponible (la model card indica cita como TODO)

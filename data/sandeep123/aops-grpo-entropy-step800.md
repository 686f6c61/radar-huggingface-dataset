# sandeep123/aops-grpo-entropy-step800

## Resumen

El modelo `sandeep123/aops-grpo-entropy-step800` es un fine-tune del modelo base `Qwen/Qwen2.5-Math-1.5B` (1.777 millones de parámetros, arquitectura transformer decoder-only) entrenado con el algoritmo GRPO (Group Relative Policy Optimization) sobre el dataset ScienceQA. El autor, `sandeep123`, lo publica como un baseline experimental dentro de una serie de modelos que exploran distintas variantes de GRPO (vanilla, con bonus de entropía, etc.) para tareas de razonamiento en preguntas de opción múltiple.

La particularidad de este checkpoint es que incorpora un término de regularización de entropía en la pérdida de política, con coeficiente `entropy_coeff=0.001`, aplicado solo a los tokens de respuesta. Este enfoque busca fomentar la exploración durante el entrenamiento. El modelo fue seleccionado como el mejor en la métrica pass@1 en validación dentro de su rama experimental (rank 2). Es relevante como referencia para investigadores que trabajan en métodos de RL para razonamiento, ya que documenta de forma transparente los hiperparámetros y el protocolo de evaluación.

El modelo se distribuye con licencia Apache-2.0, en formato safetensors (bfloat16). No se indica idioma específico en la ficha; al estar basado en Qwen2.5-Math, hereda las capacidades multilingües del modelo base, aunque la evaluación se realizó sobre ScienceQA (contenido en inglés).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Math) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 32k tokens; en inferencia se usa `max_model_len=1536`) |
| Tipos de cuantizacion | no disponible (solo safetensors bfloat16) |
| Idiomas soportados | no disponible (heredados del modelo base, probablemente multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del base `Qwen/Qwen2.5-Math-1.5B`: un transformer decoder-only con atención causal, RoPE (rotary position embeddings), y aproximadamente 1.78 mil millones de parámetros. No se trata de un modelo MoE ni híbrido; es un transformer estándar optimizado para tareas matemáticas.

El entrenamiento se realizó con GRPO sobre el dataset ScienceQA (`scienceqa_boxfix`), con un total de 1250 pasos (25 épocas) y un batch de 128 prompts con K=6 rollouts por prompt. La tasa de aprendizaje fue constante de 1e-6, con un coeficiente KL (dentro de la recompensa) de 0.01 y una recompensa de formato fija de 0.03 sin decaimiento. La longitud máxima de prompt y respuesta fue de 512 y 1024 tokens respectivamente. La variante específica de este checkpoint añade un bonus de entropía a la pérdida de política con `entropy_coeff=0.001`, aplicado solo a los tokens de respuesta, con clipping de 0.2/0.2 y temperatura de rollout de 1.0.

Un aspecto crítico documentado por el autor es que el modelo fue entrenado con texto de prompt sin aplicar plantilla de chat (`apply_chat_template=False`). Aplicar la plantilla de chat de Qwen2.5-Math en inferencia provoca una degradación medida en aproximadamente 19 puntos de pass@1 en una tarea relacionada. Por tanto, se debe usar el modelo con el texto de prompt en crudo.

## Capacidades

- Razonamiento matemático y resolución de preguntas de opción múltiple en el dominio científico (ScienceQA).
- Generación de respuestas con formato `\boxed{...}` para la extracción de la respuesta final.
- Soporte de múltiples rollouts (K=6) durante la inferencia para mejorar la precisión mediante muestreo.
- No soporta tool calling, function calling, ni interacción por chat (el modelo se usa sin plantilla de chat).
- No tiene capacidades multimodales (solo texto).
- El modelo es un baseline de investigación para experimentos de RL; no está diseñado como asistente conversacional.

## Casos de uso

- Investigación en métodos de RL para razonamiento: el modelo sirve como referencia para comparar variantes de GRPO (entropy bonus vs. vanilla) en tareas de opción múltiple. Se puede usar para reproducir los resultados publicados o como punto de partida para nuevos experimentos.
- Evaluación de protocolos de extracción de respuestas: dado que el modelo produce respuestas con `\boxed{}`, es útil para validar pipelines de parsing de respuestas en sistemas de QA.
- Estudio de la influencia de la entropía en la exploración durante el entrenamiento RL: investigadores pueden comparar este checkpoint con su contraparte vanilla (`aops-grpo-vanilla-step800`) para analizar el efecto del bonus de entropía.
- Fine-tuning adicional: al ser un modelo pequeño (1.5B), puede servir como base para entrenamientos de bajo coste en entornos con recursos limitados.
- Generación de datos sintéticos de razonamiento: aunque no es su propósito principal, puede generar explicaciones paso a paso (si se le pide) para aumentar datasets de entrenamiento.
- Benchmarking de infraestructura de inferencia: debido a su tamaño reducido, es adecuado para probar frameworks como vLLM o llama.cpp en entornos de desarrollo.

## Benchmarks y rendimiento

El autor reporta métricas de validación en el checkpoint (paso 800) sobre 256 prompts held-out, con K=6 rollouts, temperatura 1.0 y semilla 42. La extracción de respuesta se realiza tomando el contenido del último `\boxed{}`; si no existe, se toma el último token A-E. Las respuestas sin respuesta extraíble se consideran incorrectas.

| Métrica | Valor |
|---|---|
| pass@1 | 0.2298 |
| pass@6 | 0.4023 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La comparación con otros modelos de la misma serie (vanilla, entropy en otros pasos) no se incluye en esta ficha, pero los repositorios relacionados pueden ofrecer datos adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 3.5 GB (1.78B parámetros × 2 bytes). Con overhead de activaciones y KV cache, se recomienda al menos 6-8 GB de VRAM para inferencia con contexto corto.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090, A10, A100, H100). En CPU es posible ejecutar el modelo con llama.cpp si se convierte a GGUF, aunque no se proporciona oficialmente.
- El modelo cabe en GPUs de consumo (gama media-alta) y en GPUs de datacenter.
- Opciones de despliegue: vLLM (el autor muestra un ejemplo de uso con `vllm.LLM`), Transformers + PyTorch, llama.cpp (requiere conversión), Ollama (si se convierte a GGUF), TGI.
- Latencia y throughput: no se dispone de datos publicados. Para un modelo de 1.5B en bfloat16, se puede esperar un throughput de decenas de tokens por segundo en GPUs modernas, pero depende del hardware y del framework.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sandeep123/aops-grpo-entropy-step800` | 1.78B | no especificado | GRPO + entropy bonus | Apache-2.0 | HuggingFace |
| `sandeep123/aops-grpo-vanilla-step800` | 1.78B | no especificado | GRPO vanilla | Apache-2.0 | HuggingFace |
| `Qwen/Qwen2.5-Math-1.5B` (base) | 1.78B | 32k | pre-entrenamiento + SFT | Apache-2.0 | HuggingFace |
| `sandeep123/aops-grpo-entropy-step700` | 1.78B | no especificado | GRPO + entropy bonus (paso 700) | Apache-2.0 | HuggingFace |

No se dispone de comparaciones de rendimiento entre estos modelos en la información proporcionada. El autor publica varios checkpoints de la misma serie (paso 700, paso 800) para análisis de dinámica de entrenamiento.

## Limitaciones y advertencias

- No aplicar plantilla de chat: el modelo fue entrenado con texto de prompt en crudo. Usar la plantilla de chat de Qwen2.5-Math degrada significativamente el rendimiento (≈19 puntos de pass@1 en una tarea relacionada).
- Sesgos y alucinaciones: al ser un modelo pequeño (1.5B) y especializado en razonamiento matemático, puede generar respuestas incorrectas o inventar pasos de razonamiento cuando la pregunta no se ajusta al dominio de entrenamiento.
- Contexto limitado en la práctica: aunque el modelo base soporta 32k tokens, la evaluación se realizó con `max_model_len=1536`. No se ha verificado el comportamiento con contextos más largos.
- No es un asistente conversacional: no está diseñado para diálogo ni para tareas generales de NLP. Su uso fuera de preguntas de opción múltiple de ciencia puede dar resultados pobres.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo se publica como baseline de investigación; el autor no ofrece garantías de robustez en producción.
- Extracción de respuestas: el protocolo de evaluación exige que la respuesta esté en `\boxed{}` o como último token A-E. En producción, se debe implementar una extracción robusta para evitar fallos.
- Datos de validación limitados: solo se evaluó en 256 prompts held-out de ScienceQA; los resultados pueden no generalizar a otros dominios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sandeep123/aops-grpo-entropy-step800
- Variante paso 700: https://huggingface.co/sandeep123/aops-grpo-entropy-step700
- Variante vanilla paso 800: https://huggingface.co/sandeep123/aops-grpo-vanilla-step800
- Referencia sobre GRPO (tutorial): https://abderrahmanskiredj.github.io/the-illustrated-grpo/The%20Illustrated%20GRPO.pdf
- Paper relacionado con entropía en GRPO (E-GRPO): https://arxiv.org/abs/2601.00423
- Guía sobre PPO y GRPO (contexto): https://yugeten.github.io/posts/2025/01/ppogrpo/

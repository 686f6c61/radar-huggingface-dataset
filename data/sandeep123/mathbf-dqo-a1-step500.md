# sandeep123/mathbf-dqo-a1-step500

## Resumen
El modelo `sandeep123/mathbf-dqo-a1-step500` es un checkpoint de 1.777 mil millones de parámetros (1.77B) resultante del fine-tuning del modelo base `Qwen/Qwen2.5-Math-1.5B` mediante aprendizaje por refuerzo (RL) con el algoritmo GRPO (Group Relative Policy Optimization). Desarrollado por sandeep123, está diseñado para responder preguntas de opción múltiple del dataset ScienceQA siguiendo un protocolo estricto de razonamiento denominado "boxfix", que exige una cadena de pasos numerados (Step 1..n) y una respuesta final en formato `\boxed{}`.

La principal innovación técnica es la incorporación del objetivo DQO (alpha=1.0), propuesto por Chen et al. en ICLR 2026, que añade un término de diversidad basado en `alpha*logdet(L+I)` con un estimador leave-one-out. Este checkpoint corresponde al paso 500 de entrenamiento y se publica como referencia para el análisis de diversidad; la model card reporta métricas de validación para este paso. El modelo es relevante para investigadores interesados en objetivos de diversidad en RL y en el efecto de los protocolos de entrenamiento sobre el rendimiento.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen2.5-Math-1.5B) |
| Parámetros totales | 1.777.088.000 (1.77B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura Transformer de `Qwen/Qwen2.5-Math-1.5B`, un modelo de lenguaje denso de 1.5B parámetros. Sobre esta base se ha aplicado un entrenamiento con GRPO sobre el dataset ScienceQA en su versión `scienceqa_boxfix`. El protocolo de entrenamiento incluye 25 épocas y 1250 pasos, con un batch de 128 prompts y K=6 rollouts por prompt. La tasa de aprendizaje es constante en 1e-6, el coeficiente KL es 0.01, y se aplica un reward de formato de 0.03 sin decay. El checkpoint publicado corresponde al paso 500.

La innovación principal es el objetivo DQO (alpha=1.0), que introduce un término de diversidad calculado como `alpha*logdet(L+I)` con un estimador leave-one-out. La función de embedding phi se obtiene de los hidden states de la política de referencia, en lugar del codificador de frases preentrenado del paper original, lo que permite aislar el efecto del objetivo de diversidad. El entrenamiento se realizó bajo el protocolo "boxfix" completo, que obliga al modelo a generar pasos numerados y una respuesta final en `\boxed{}` en una línea propia. La model card advierte explícitamente que no se debe aplicar el chat template de Qwen2.5-Math en inferencia, ya que esto produce una caída de aproximadamente 19 puntos de pass@1 en una tarea hermana.

## Capacidades
- Generación de razonamiento paso a paso en formato numerado (Step 1..n) para preguntas de opción múltiple de ciencias.
- Respuesta final estructurada en `\boxed{}` seguida de la opción correcta (A-E).
- Optimizado para el dataset ScienceQA, con métricas de validación reportadas: pass@1 = 0.7936 y pass@6 = 0.9570 en el checkpoint 500.
- Entrenado con un objetivo de diversidad (DQO) que favorece la generación de respuestas variadas dentro del mismo prompt.
- No se han documentado capacidades de tool calling ni function calling.
- No se han documentado capacidades de visión, audio o multimodales.
- Capacidades multilingües no especificadas; el modelo base Qwen2.5-Math es principalmente para inglés y chino, pero no hay confirmación para este checkpoint.

## Casos de uso
- Evaluación de objetivos de diversidad en RL: el checkpoint permite comparar el impacto del término DQO frente a baselines de GRPO estándar en tareas de opción múltiple, usando las métricas de validación pre-registradas.
- Investigación en protocolos de entrenamiento: sirve como referencia para estudiar el efecto del formato "boxfix" y del reward de formato en la calidad de las respuestas generadas.
- Tutoría automática en ciencias: el modelo puede generar explicaciones paso a paso para preguntas de ciencias, lo que resulta útil en sistemas educativos que requieren razonamientos estructurados.
- Benchmarking de extracción de respuestas: el formato `\boxed{}` facilita el desarrollo y evaluación de parsers automáticos de respuestas en pipelines de evaluación de LLMs.
- Análisis de trade-offs entre accuracy y diversidad: al reportar tanto pass@1 como pass@6, este checkpoint es adecuado para estudiar cómo la diversidad de rollouts afecta a la precisión individual.
- Comparación de checkpoints a lo largo del entrenamiento: junto con otros checkpoints del mismo autor, permite analizar la evolución de pass@1 y pass@6 durante el proceso de RL.

## Benchmarks y rendimiento
La model card reporta las siguientes métricas de validación para este checkpoint (step 500):

| Métrica | Valor |
|---|---|
| pass@1 | 0.7936 |
| pass@6 | 0.9570 |
| Paso de entrenamiento | 500 |

Estas métricas se obtuvieron sobre 256 prompts held-out, con K=6 rollouts, temperatura 1.0 y seed 42. La extracción de respuestas se realizó siguiendo un protocolo pre-registrado: se considera correcta la respuesta dentro del último `\boxed{}`; si no existe, se toma el último token standalone A-E. Las respuestas sin respuesta extraíble se puntúan como incorrectas. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 3.6 GB. Con activaciones y KV cache para una longitud máxima de 1536 tokens (según el ejemplo de la model card), se estima un consumo total de 6-8 GB en configuraciones de batch pequeño.
- GPU recomendadas: no se requiere hardware de gama alta; una GPU consumer con 8 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4060 8GB) es suficiente para inferencia básica.
- Compatibilidad con consumer GPU: sí, el modelo cabe en GPUs de consumo con 8 GB o más, especialmente con cuantización (no se especifican tipos disponibles).
- Opciones de despliegue: vLLM (según el ejemplo de la model card), llama.cpp, Ollama y TGI son opciones viables dado el tamaño del modelo.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Rendimiento (pass@1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sandeep123/mathbf-dqo-a1-step500 | 1.777B | no disponible | 0.7936 (ScienceQA val) | Apache 2.0 | HuggingFace |
| sandeep123/math-dqo-a1-step700 | 1.5B (base) | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Qwen/Qwen2.5-Math-1.5B | 1.5B | no disponible | no disponible | Apache 2.0 | HuggingFace |

El modelo `sandeep123/math-dqo-a1-step700` es un checkpoint hermano del mismo autor, entrenado con el mismo objetivo DQO pero sobre el dataset MATH. El modelo base `Qwen/Qwen2.5-Math-1.5B` es el punto de partida sin fine-tuning. No se dispone de métricas comparables para estos dos últimos en la información disponible.

## Limitaciones y advertencias
- No aplicar el chat template de Qwen2.5-Math en inferencia: la model card indica que hacerlo provoca una caída de aproximadamente 19 puntos de pass@1 en una tarea hermana.
- El modelo está entrenado exclusivamente para el formato "boxfix": respuestas que no sigan la estructura de pasos numerados y `\boxed{}` pueden ser penalizadas o no extraíbles.
- La extracción de respuestas es estricta: si no hay `\boxed{}` ni token A-E, la respuesta se considera incorrecta, lo que puede afectar a la evaluación en otros dominios.
- Al ser un modelo de 1.77B parámetros, su capacidad de razonamiento complejo es limitada y puede incurrir en alucinaciones en preguntas fuera del dominio de ScienceQA.
- No se han documentado sesgos específicos, pero el entrenamiento en un dataset de ciencias puede introducir sesgos relacionados con el contenido y el formato de las preguntas.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar las restricciones del modelo base Qwen2.5-Math-1.5B para confirmar la compatibilidad.
- La model card señala que los checkpoints óptimos para pass@1 y pass@6 difieren; este checkpoint en step 500 puede no ser el mejor en precisión individual.

## Enlaces
- HuggingFace: https://huggingface.co/sandeep123/mathbf-dqo-a1-step500
- Checkpoint hermano (MATH): https://huggingface.co/sandeep123/math-dqo-a1-step700
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Paper de referencia (DQO, Chen et al. ICLR 2026): no disponible en la información proporcionada.

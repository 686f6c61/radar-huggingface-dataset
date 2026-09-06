# sandeep123/sqabf-grpo-vanilla-step1100

## Resumen

El modelo `sandeep123/sqabf-grpo-vanilla-step1100` es un baseline de razonamiento científico desarrollado mediante aprendizaje por refuerzo (RL) con el algoritmo GRPO (Group Relative Policy Optimization). Parte del modelo base `Qwen/Qwen2.5-Math-1.5B` y ha sido entrenado específicamente sobre el conjunto de datos ScienceQA, con el objetivo de resolver preguntas de opción múltiple de ciencias generando razonamientos paso a paso en un formato estructurado.

El autor, `sandeep123`, publica este checkpoint como parte de una serie de experimentos que comparan distintas configuraciones de RL (entropy coefficient, clip, temperatura de rollout). Este modelo en concreto corresponde al paso 1100 de entrenamiento, seleccionado por ser el mejor en validación para la métrica pass@1 dentro de su rama experimental. Es relevante para investigadores que estudian el efecto de los hiperparámetros de GRPO en modelos de lenguaje pequeños, así como para quienes necesitan un baseline reproducible en tareas de razonamiento científico con formato estricto.

Con 1.777.088.000 parámetros y pesos en formato safetensors, el modelo se distribuye bajo licencia Apache-2.0. No se especifica la longitud de contexto en la información disponible, aunque el autor recomienda usar `max_model_len=1536` en vLLM y advierte que no se debe aplicar el chat template de Qwen2.5-Math, ya que ello degrada el rendimiento en aproximadamente 19 puntos de pass@1 en una tarea relacionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-Math) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Qwen/Qwen2.5-Math-1.5B`, un transformer decoder-only de tamaño pequeño. El entrenamiento se realizó con GRPO sobre el dataset ScienceQA en su variante `scienceqa_boxfix`. Según la model card, el protocolo de entrenamiento incluye 25 épocas o 1250 pasos, con un batch de 128 prompts y K=6 rollouts por prompt. La tasa de aprendizaje es constante en 1e-6, el coeficiente KL es 0.01, y el reward de formato es fijo en 0.03 sin decaimiento. La semilla fijada es 42.

La configuración específica de esta rama es `entropy_coeff=0.0`, clip simétrico de PPO 0.2/0.2 y temperatura de rollout 1.0. El protocolo "boxfix" exige que el modelo genere un razonamiento numerado en pasos (Step 1..n) seguido de una respuesta final en el formato `\boxed{X}` en una línea propia, sin contenido posterior. El reward de formato recompensa exactamente esa estructura. El autor indica que este checkpoint sustituye a una suite anterior donde el prompt y el reward no coincidían.

No se menciona uso de RLHF o DPO; el proceso es puramente de RL con GRPO. Tampoco se detalla la composición del dataset de ScienceQA más allá del nombre de la variante. La innovación técnica principal es la alineación estricta entre prompt y reward de formato, y la advertencia explícita de no aplicar chat template en inferencia para evitar un desajuste entrenamiento/inferencia.

## Capacidades

- Generación de razonamientos paso a paso numerados (Step 1..n) para preguntas de ciencias de opción múltiple.
- Respuesta final en formato `\boxed{X}`, donde X es una opción entre A y E.
- Resolución de preguntas de ScienceQA con una precisión de pass@1 de 0.8405 en validación (según el checkpoint publicado).
- Soporte de extracción de respuesta pre-registrada: se toma el contenido del último `\boxed{}`, o en su defecto el último token A-E; las respuestas sin respuesta extraíble se puntúan como incorrectas.
- No se reporta soporte de tool calling, function calling, agentes, visión o audio en la información disponible.
- Capacidades multilingües no especificadas.

## Casos de uso

- Investigación en métodos de RL: el modelo sirve como baseline reproducible para comparar variantes de GRPO. Los investigadores pueden replicar el entrenamiento y evaluar el efecto de cambios en entropy coefficient, clip o temperatura usando este checkpoint como referencia.
- Evaluación de protocolos de formato en razonamiento: gracias al diseño "boxfix", es útil para estudiar cómo el formato de respuesta afecta a la extracción de respuestas y a la precisión final en tareas de opción múltiple.
- Educación en ciencias: puede generar explicaciones paso a paso para preguntas de nivel escolar, lo que permite construir sistemas de tutoría que muestren el razonamiento detrás de cada respuesta.
- Análisis de robustez de inferencia: el modelo es adecuado para experimentos sobre el impacto de aplicar o no chat template, ya que el autor documenta una pérdida de ~19 puntos de pass@1 cuando se aplica.
- Comparación de checkpoints durante el entrenamiento: al existir variantes en los pasos 600 y 1200, este modelo permite analizar la evolución de las métricas de validación a lo largo del entrenamiento.
- Desarrollo de pipelines de razonamiento con verificación de formato: puede integrarse en sistemas que requieran una salida estructurada y validable, como los que usan `\boxed{}` para extraer respuestas de forma determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye métricas de validación propias del checkpoint, obtenidas con 256 prompts de validación, K=6, temperatura 1.0 y semilla 42.

| Metrica | Valor |
|---|---|
| pass@1 | 0.8405 |
| pass@6 | 0.9297 |
| step | 1100 |

El autor también señala que la aplicación del chat template de Qwen2.5-Math en inferencia provoca una caída de aproximadamente 19 puntos de pass@1 en una tarea hermana, aunque no se especifica el valor absoluto de esa tarea.

## Requisitos de hardware

- VRAM estimada: con 1.777.088.000 parámetros en bfloat16, los pesos ocupan aproximadamente 3.6 GB. Sumando overhead de activaciones y KV cache, se estima un mínimo de 5-6 GB de VRAM para inferencia básica. No se han publicado requisitos oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, A10G, A100 o H100.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo de 8 GB o superiores.
- Opciones de despliegue: vLLM (usado en el ejemplo del autor), y otros frameworks compatibles con safetensors como Hugging Face Transformers, llama.cpp o TGI. El autor recomienda usar vLLM con `max_model_len=1536` y `dtype="bfloat16"`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Se conocen otros dos checkpoints del mismo autor y entrenamiento, correspondientes a distintos pasos. No se dispone de sus métricas de validación en la información proporcionada.

| Modelo | Parametros | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sandeep123/sqabf-grpo-vanilla-step1100 | 1.777.088.000 | no disponible | Apache-2.0 | HuggingFace |
| sandeep123/sqa-grpo-vanilla-step600 | no disponible | no disponible | Apache-2.0 | HuggingFace |
| sandeep123/sqa-grpo-vanilla-step1200 | no disponible | no disponible | Apache-2.0 | HuggingFace |

El modelo base `Qwen/Qwen2.5-Math-1.5B` es la referencia arquitectónica, pero no se dispone de datos de comparación directa con él en esta información.

## Limitaciones y advertencias

- No aplicar el chat template de Qwen2.5-Math en inferencia. El modelo fue entrenado con texto plano y el uso del template provoca un desajuste de ~19 puntos de pass@1 en tareas relacionadas.
- El modelo está especializado en ScienceQA y en el formato "boxfix". Fuera de este dominio, su rendimiento no está validado y puede presentar alucinaciones.
- No se reportan sesgos conocidos, pero al estar entrenado en un dataset de ciencias en inglés, su transferencia a otros idiomas o contextos culturales es limitada.
- La longitud de contexto no está documentada; el autor sugiere limitar `max_model_len` a 1536 tokens en vLLM, lo que restringe el tamaño de las entradas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin documentación de seguridad o alineación.
- Las métricas de validación (pass@1 0.8405) se refieren únicamente a este checkpoint y no deben extrapolarse a otros pasos o configuraciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/sqabf-grpo-vanilla-step1100
- Checkpoint del paso 600: https://huggingface.co/sandeep123/sqa-grpo-vanilla-step600
- Checkpoint del paso 1200: https://huggingface.co/sandeep123/sqa-grpo-vanilla-step1200
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B

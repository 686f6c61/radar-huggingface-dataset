# sandeep123/sqa-grpo-vanilla-step300

## Resumen

`sandeep123/sqa-grpo-vanilla-step300` es un modelo de razonamiento científico de 1.5 mil millones de parámetros, resultado de un fine-tuning con aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen2.5-Math-1.5B`. Fue desarrollado por el usuario sandeep123 como parte de un estudio de líneas base de GRPO (Group Relative Policy Optimization) aplicado al conjunto de datos ScienceQA. El modelo está entrenado específicamente para responder preguntas de opción múltiple de ciencias (física, química, biología, etc.) y generar respuestas con razonamiento explícito.

La relevancia de este modelo radica en que sirve como punto de referencia (baseline) para investigaciones sobre RL en razonamiento científico. Se entrenó con una configuración "vanilla" de GRPO: sin coeficiente de entropía, con clip simétrico de 0.2 y temperatura de rollout de 1.0. El checkpoint seleccionado corresponde al paso 300, elegido por ser el mejor en `pass@6` en validación, lo que permite comparar resultados de diversidad sin sesgo de selección por precisión.

El modelo no aplica chat template; se usa con texto sin procesar. Su licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-Math-1.5B base) |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 1536 tokens (max_prompt 512 + max_response 1024) |
| Tipos de cuantización | No disponible (inferencia en bfloat16) |
| Idiomas soportados | No disponible (probablemente inglés, no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen2.5-Math-1.5B`, un transformer decoder-only preentrenado para tareas matemáticas. Sobre esta base se aplicó un fine-tuning mediante GRPO, un algoritmo de optimización de políticas que utiliza recompensas relativas entre un grupo de rollouts para actualizar el modelo. El entrenamiento se realizó con el framework verl y el conjunto de datos ScienceQA (versión `scienceqa_boxfix`).

Los detalles del entrenamiento incluyen 25 épocas (1250 pasos), un batch de 128 prompts con K=6 rollouts por prompt, learning rate constante de 1e-6, coeficiente KL de 0.01 dentro de la recompensa, y una recompensa de formato de 0.03 constante. La configuración "vanilla" desactiva el coeficiente de entropía (entropy_coeff=0.0) y usa clip simétrico de 0.2 con temperatura de rollout de 1.0. El modelo se entrenó sobre texto crudo sin chat template, y la card advierte que aplicar el template de Qwen2.5-Math en inferencia produce una pérdida de ~19 puntos de pass@1.

## Capacidades

- Razonamiento matemático y científico: resuelve preguntas de opción múltiple de ScienceQA con explicaciones paso a paso.
- Generación de respuestas con formato `\boxed{}` para la respuesta final, extraíble para evaluación.
- Soporte para múltiples rollouts (pass@K): el modelo puede generar varias respuestas independientes, útil para técnicas de mayoría simple o verificación.
- No soporta tool calling, ni visión, ni audio. Es exclusivamente un modelo de texto para razonamiento.
- No se recomienda aplicar chat template; la entrada debe ser texto plano.

## Casos de uso

- **Investigación en RL para razonamiento**: sirve como línea base para comparar variantes de GRPO (por ejemplo, con coeficiente de entropía, diferentes temperaturas o clipping). Los investigadores pueden reproducir el entrenamiento y evaluar nuevas técnicas contra este checkpoint.
- **Evaluación de métodos de extracción de respuestas**: dado que la respuesta se define como el contenido del último `\boxed{}` o el último token A-E, este modelo permite probar pipelines de extracción de respuestas en tareas de opción múltiple.
- **Generación de explicaciones en educación científica**: el modelo puede producir razonamientos detallados para preguntas de ciencias, útil para sistemas de tutoría que generan explicaciones automáticas.
- **Pruebas de consistencia de muestreo**: con K=6 rollouts a temperatura 1.0, se puede estudiar la diversidad de las respuestas y la relación entre pass@1 y pass@6.
- **Benchmark de modelos pequeños**: con 1.5B de parámetros, sirve para comparar el rendimiento de modelos de tamaño reducido frente a modelos más grandes en tareas de razonamiento científico.
- **Depuración de pipelines de inferencia**: como ejemplo de modelo que no requiere chat template, es útil para verificar que los sistemas de inferencia (vLLM, etc.) funcionan correctamente con entradas de texto crudo.

## Benchmarks y rendimiento

El autor reporta métricas de validación en un conjunto de 256 prompts retenidos, con K=6 rollouts y temperatura 1.0, seed 42:

| Métrica | Valor |
|---|---|
| pass@1 | 0.7194 |
| pass@6 | 0.9766 |
| Paso de entrenamiento | 300 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Estas métricas corresponden a la precisión de respuesta de opción múltiple (ScienceQA answer-choice accuracy) con extracción de respuesta pre-registrada: la respuesta es el contenido del último `\boxed{}`, o el último token A-E si no hay `\boxed{}`. Respuestas sin extracción se consideran incorrectas.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene ~1.7B parámetros. En bfloat16, los pesos ocupan ~3.5 GB (1.7e9 × 2 bytes). Con overhead de activaciones y KV-cache, se puede ejecutar en GPUs con 8 GB de VRAM o más.
- **GPUs recomendadas**: RTX 3060 (12 GB) o superior, RTX 4090, A10G, A100. También puede funcionar en GPU integrada con cuantización (no probada oficialmente).
- **Cuantización**: no se proporcionan versiones GGUF ni AWQ. La inferencia se realiza en bfloat16 con vLLM.
- **Opciones de despliegue**: vLLM (como en el ejemplo del README), también puede usarse con llama.cpp si se convierte a GGUF (no proporcionado).
- **Latencia y throughput**: no disponibles. Para un modelo de 1.5B en vLLM con bfloat16, se espera un throughput de decenas de requests por segundo en una A100, pero no hay datos medidos.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. El modelo base es `Qwen/Qwen2.5-Math-1.5B`, que sin RL tiene un rendimiento menor en ScienceQA (no se reporta el valor). Se puede considerar comparable a otros modelos de razonamiento de tamaño similar como DeepSeekMath-RL (7B) o Minerva (8B), pero no se aportan datos de comparación. La única referencia es que el checkpoint fue seleccionado como mejor en pass@6 dentro de su propio estudio de baseline.

## Limitaciones y advertencias

- **No usar chat template**: aplicar el template de Qwen2.5-Math en la inferencia causa una degradación de ~19 puntos de pass@1 en una tarea relacionada. Se debe usar texto crudo.
- **Riesgo de alucinación**: al ser un modelo entrenado con RL sobre un conjunto de datos específico, puede generar respuestas plausibles pero incorrectas fuera de su dominio.
- **Contexto limitado**: la longitud máxima de entrada es 512 tokens (prompt) y 1024 de respuesta, lo que limita tareas que requieren contexto largo.
- **Idioma**: no se especifica el soporte de idiomas; probablemente optimizado para inglés (ScienceQA está en inglés).
- **Sesgo**: el modelo hereda sesgos del conjunto de datos ScienceQA y del modelo base Qwen2.5-Math, que pueden afectar a poblaciones subrepresentadas.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero se debe mantener el aviso de licencia.
- **Dependencia del formato de respuesta**: la evaluación asume que la respuesta final está en `\boxed{}` o como último token A-E. Respuestas con otro formato se consideran incorrectas, lo que puede subestimar el rendimiento real.

## Enlaces

- [Hugging Face: sandeep123/sqa-grpo-vanilla-step300](https://huggingface.co/sandeep123/sqa-grpo-vanilla-step300)
- [Modelo base: Qwen/Qwen2.5-Math-1.5B](https://huggingface.co/Qwen/Qwen2.5-Math-1.5B)
- No se encontraron otros enlaces (papers, repos, demos) en la búsqueda web.

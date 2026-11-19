# JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-forced-answer-civilsnake-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-8k-grpo-forced-answer-civilsnake-s300` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Su objetivo concreto es que el modelo aprenda a razonar y resolver problemas de matemáticas operando bajo un presupuesto fijo de generación de 8.192 tokens, de modo que internalice ese límite en lugar de depender de un escalado de cómputo en tiempo de inferencia. El resultado es un modelo que produce respuestas correctas dentro del presupuesto asignado, sin necesidad de cadenas de razonamiento indefinidamente largas.

El modelo se publica junto al artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, y corresponde al checkpoint del paso 300 de un entrenamiento GRPO (Group Relative Policy Optimization) sobre el conjunto de datos matemático DeepScaleR. La técnica clave es el "forced answering": cuando la respuesta alcanza el límite de tokens, se cierra el razonamiento y se fuerza al modelo a emitir una respuesta final en formato `\boxed{}` de hasta 120 tokens, que después se evalúa por corrección binaria.

Con 4.539.265.536 parámetros totales y pesos en BF16, es un modelo de tamaño medio que hereda la arquitectura y las capacidades multimodales (image-text-to-text) del Qwen3.5-4B original. Su relevancia radica en el enfoque de internalización de presupuesto: en lugar de gastar más cómputo en test-time para mejorar la precisión, el modelo aprende a ser eficiente dentro de un límite fijo, lo que resulta atractivo para despliegues con restricciones de latencia y coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B); multimodal image-text-to-text |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generación es de 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con pipeline image-text-to-text, y se ajusta mediante GRPO (una variante de RL con optimización de política relativa por grupos) sobre el dataset matemático agentica-org/DeepScaleR-Preview-Dataset, con un máximo de 3 épocas. La innovación central es el mecanismo de "forced answering": cuando una respuesta alcanza el presupuesto de generación de 8.192 tokens (`max_new_tokens`), el razonamiento se cierra y el modelo es obligado a escribir una respuesta final en el formato `Final Answer: \boxed{`, con un límite de 120 tokens, que luego se puntúa.

La recompensa es binaria, basada en la corrección de la respuesta extraída de `\boxed{}`. El entrenamiento usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule de LR coseno, LR pico de 5e-7 y 10 pasos de warmup, durante 300 pasos. El prompt de entrenamiento (turno de usuario, renderizado con la plantilla de chat del modelo base) es: "Think step-by-step to solve the following problem. Output your answer inside of \\boxed{} tags.: {problem} Let's think step-by-step". Los pesos se publican en BF16.

## Capacidades

- Razonamiento matemático bajo presupuesto fijo de 8.192 tokens de generación.
- Generación de cadenas de razonamiento paso a paso ("step-by-step") con cierre forzado al alcanzar el límite.
- Emisión de respuesta final estructurada en formato `\boxed{}` (hasta 120 tokens).
- Capacidades multimodales heredadas del modelo base (pipeline image-text-to-text).
- Conversacional (etiqueta `conversational`), compatible con endpoints.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el entrenamiento se centra en razonamiento matemático de un solo turno.
- Capacidades multilingües: no disponible.

## Casos de uso

- Resolución de problemas matemáticos con latencia acotada: el modelo está entrenado para producir una respuesta dentro de 8.192 tokens, lo que permite desplegarlo en entornos donde el coste por consulta debe ser predecible y no escalar con la dificultad del problema.
- Evaluación de eficiencia en investigación sobre RLVR: sirve como checkpoint de referencia para estudiar cómo la internalización de presupuesto afecta a la precisión dentro del límite frente al escalado en test-time.
- Generación de soluciones paso a paso para plataformas educativas: el formato de razonamiento explícito más respuesta `\boxed{}` facilita la verificación automática de resultados en ejercicios de matemáticas.
- Integración en pipelines de corrección automática: la extracción binaria de `\boxed{}` permite puntuar respuestas de forma programática sin post-procesado complejo.
- Experimentación con GRPO y recompensas binarias: el modelo y su configuración de entrenamiento documentada sirven de base para reproducir o extender técnicas de RL con presupuesto fijo.
- Prototipado de asistentes multimodales con razonamiento matemático: al heredar el pipeline image-text-to-text, puede emplearse en escenarios que combinen imagen y texto con necesidad de cómputo acotado.
- Benchmarking de eficiencia en inferencia: útil para comparar el rendimiento dentro de presupuesto frente a modelos que dependen de cadenas de razonamiento largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.539.265.536 parámetros en BF16, los pesos ocupan aproximadamente 9,1 GB (coincide con el tamaño del repo), por lo que se requiere al menos esa cantidad más overhead de activaciones y KV cache.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs con 16 GB o más de VRAM en BF16, y en GPUs consumer de 24 GB (p. ej. RTX 4090) con margen; no confirmado por el autor.
- ¿Cabe en consumer GPU?: probablemente sí en BF16 en GPUs de 24 GB; en cuantizaciones menores no se documentan formatos.
- Opciones de despliegue: no disponible explícitamente; la librería indicada es transformers y la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-8k-grpo-forced-answer-civilsnake-s300 | 4.539.265.536 | no disponible (presupuesto de generación 8.192) | Apache 2.0 | Ajuste RL de Qwen3.5-4B para razonamiento matemático con presupuesto fijo |
| Qwen/Qwen3.5-4B (base) | no disponible | no disponible | no disponible | Modelo base multimodal image-text-to-text; sin internalización de presupuesto |
| Alternativas de razonamiento matemático de ~4B | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo está especializado en matemáticas (dataset DeepScaleR); su rendimiento en otras tareas puede degradarse respecto al modelo base.
- El entrenamiento fuerza respuestas dentro de 8.192 tokens; problemas que requieran cadenas de razonamiento más largas pueden verse penalizados por el cierre forzado.
- Riesgo de alucinación inherente a los modelos de lenguaje; la recompensa binaria por corrección no elimina respuestas plausibles pero incorrectas.
- No se documentan sesgos conocidos ni evaluación de sesgos en la información proporcionada.
- Idiomas soportados no disponibles; no se garantiza un comportamiento multilingüe óptimo.
- Licencia Apache 2.0, que permite uso comercial, pero se hereda del modelo base Qwen/Qwen3.5-4B; conviene verificar los términos del modelo base.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; sin validación comunitaria ni resultados de benchmarks publicados.
- La model card incluye una sección de citación marcada como "TODO", por lo que la referencia académica no está completa.
- El checkpoint corresponde al paso 300; no se documenta si es el mejor checkpoint ni su curva de aprendizaje.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-forced-answer-civilsnake-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper (referenciado en la model card): *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (enlace no disponible en la información proporcionada)

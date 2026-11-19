# JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-superworm-s300

## Resumen

El modelo `budget-internalization-gemma4-e2b-2k-grpo-superworm-s300` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base `google/gemma-4-E2B-it`, desarrollado por JetBrains-Research. Su objetivo es internalizar un presupuesto fijo de generación de 2.048 tokens para tareas de razonamiento matemático: en lugar de depender de un escalado en tiempo de inferencia (generar cadenas de razonamiento más largas para mejorar la precisión), el modelo aprende a producir respuestas correctas dentro de ese límite estricto. Se libera junto con el artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

La arquitectura subyacente es la del Gemma-4-E2B-it, un transformer multimodal (pipeline `any-to-any`) con 5.123.178.051 parámetros totales según los pesos en safetensors. El ajuste se realizó con GRPO (Group Relative Policy Optimization) sobre el dataset DeepScaleR (matemáticas) durante 300 pasos, con un batch de 32 prompts y 8 rollouts por paso, y una recompensa binaria basada en la corrección de la respuesta extraída de las etiquetas `\boxed{}`.

El interés actual de este checkpoint reside en su enfoque metodológico: demuestra que es posible desplazar parte del coste computacional del razonamiento desde el tiempo de inferencia hacia el entrenamiento, obteniendo un modelo que responde de forma fiable bajo restricciones de longitud. Es relevante para investigadores que estudian RLVR (Reinforcement Learning with Verifiable Rewards) y para desarrolladores que necesitan controlar el coste de generación en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma-4-E2B-it, pipeline any-to-any) |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la del modelo base, con license_link a la licencia de Gemma 4) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer multimodal con pipeline `any-to-any` (entrada y salida de imagen y texto). Sobre esta base se aplicó un ajuste fino con GRPO, una variante de RL sin crítico que utiliza una línea base leave-one-out, normalización del grupo de recompensas y pérdida a nivel de token. El entrenamiento se realizó con Adam, programación de learning rate coseno con pico de 3e-6 y 10 pasos de calentamiento, durante 300 pasos. El batch fue de 32 prompts con 8 rollouts por paso.

Los datos de entrenamiento provienen de `agentica-org/DeepScaleR-Preview-Dataset`, un corpus de problemas matemáticos, con un máximo de 3 épocas. La recompensa es binaria: se extrae la respuesta delimitada por `\boxed{}` y se compara con la solución correcta. Un detalle técnico destacable es el tratamiento de las respuestas que alcanzan el presupuesto de generación: se truncan y se puntúan tal cual, lo que fuerza al modelo a aprender a terminar dentro del límite de 2.048 tokens en lugar de producir cadenas de razonamiento indefinidas. El prompt de entrenamiento indica explícitamente "Think step-by-step" y solicita la respuesta dentro de `\boxed{}`.

## Capacidades

- Razonamiento matemático con presupuesto fijo de 2.048 tokens de generación.
- Generación de cadenas de razonamiento paso a paso ("Think step-by-step") con autocontención en la longitud.
- Extracción de respuestas en formato `\boxed{}`.
- Capacidades multimodales heredadas del modelo base (pipeline `any-to-any`: imagen-texto a texto).
- Capacidades de conversación multiturno heredadas del modelo base instruction-tuned.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos en producción con coste controlado: el modelo está entrenado para responder dentro de 2.048 tokens, lo que permite presupuestar con precisión el coste por consulta en entornos de alta concurrencia sin sacrificar la precisión en comparación con generaciones más largas.
- Evaluación de pipelines de RLVR: sirve como referencia para estudiar cómo el entrenamiento con recompensas verificables afecta a la precisión dentro de un presupuesto fijo, útil en investigación sobre razonamiento y escalado en tiempo de inferencia.
- Tutoría matemática automatizada: puede generar explicaciones paso a paso acotadas en longitud, adecuadas para interfaces con límites de tokens o requisitos de latencia estrictos.
- Benchmarking de internalización de presupuesto: permite comparar contra el modelo base `gemma-4-E2B-it` para medir la ganancia de precisión in-budget atribuible al ajuste GRPO.
- Generación de soluciones con formato verificable: la salida en `\boxed{}` facilita la extracción automática y la validación en pipelines de evaluación automática de matemáticas.
- Experimentos de destilación o imitación: al ser un checkpoint intermedio (paso 300) de una ejecución de RL, es útil para estudiar la evolución del comportamiento a lo largo del entrenamiento.
- Aplicaciones multimodales acotadas: al heredar el pipeline `any-to-any` del modelo base, puede emplearse en tareas imagen-texto con restricciones de longitud de respuesta, aunque no se han publicado evaluaciones específicas de estas capacidades tras el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, los pesos se publican en F32 y el repositorio ocupa 20,5 GB; en F32, 5.123 millones de parámetros requieren aproximadamente 20,5 GB solo para los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU consumer? No disponible en la información proporcionada; con los pesos en F32 y 20,5 GB, no cabría en GPU consumer de 24 GB sin cuantización, pero no se han publicado variantes cuantizadas.
- Opciones de despliegue: la librería indicada es `transformers`; no se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-gemma4-e2b-2k-grpo-superworm-s300 (este) | 5.123.178.051 | no disponible | GRPO sobre DeepScaleR, presupuesto 2.048 tokens | Apache 2.0 | Hugging Face (JetBrains-Research) |
| google/gemma-4-E2B-it | no disponible | no disponible | Instruction tuning del modelo base | Licencia Gemma 4 | Hugging Face (Google) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este checkpoint y el modelo base ni con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El ajuste está especializado en matemáticas (DeepScaleR); el rendimiento en otras tareas puede degradarse respecto al modelo base.
- El presupuesto de 2.048 tokens es fijo en entrenamiento: problemas que requieran cadenas de razonamiento más largas pueden truncarse y producir respuestas incorrectas.
- Riesgo de alucinación inherente a los modelos de lenguaje; la recompensa binaria por corrección no elimina respuestas plausibles pero erróneas fuera del dominio matemático.
- Sesgos conocidos: no disponible en la información proporcionada; se heredan los del modelo base Gemma-4-E2B-it.
- Idiomas soportados: no disponible; el entrenamiento se realizó presumiblemente en inglés (dataset DeepScaleR y prompt en inglés), lo que puede limitar el rendimiento en castellano.
- Licencia: Apache 2.0 según la model card, pero con `license_link` a la licencia de Gemma 4 de Google; conviene verificar los términos de uso comercial de dicha licencia antes de desplegar en producción.
- Checkpoint intermedio (paso 300): no se indica que sea el mejor checkpoint de la ejecución ni se publican curvas de evaluación.
- La model card marca la sección de citación como "TODO"; no hay referencia bibliográfica completa del artículo asociado.
- No se han publicado datos de benchmarks, latencia ni requisitos de hardware, lo que dificulta la evaluación previa al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-superworm-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license

# JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-luckymarmot-s300

## Resumen

El modelo `budget-internalization-gemma4-e2b-1k-grpo-luckymarmot-s300` es un ajuste fino por aprendizaje por refuerzo de `google/gemma-4-E2B-it`, desarrollado por JetBrains-Research. Su objetivo es internalizar un presupuesto fijo de generación de 1.024 tokens para razonamiento matemático, de modo que el modelo produzca respuestas correctas sin necesidad de cadenas de razonamiento largas. Se publica junto al artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

La propuesta es relevante porque invierte la tendencia habitual de escalar el razonamiento en tiempo de inferencia: en lugar de dejar que el modelo genere secuencias cada vez más largas para mejorar la precisión, se le entrena con GRPO para que rinda bajo un límite estricto de tokens. Esto reduce el coste de inferencia y la latencia, algo crítico en despliegues con restricciones de cómputo o con acuerdos de nivel de servicio ajustados.

El checkpoint corresponde al paso 300 del run interno `luckymarmot`, se distribuye en formato safetensors con pesos en F32 y hereda la licencia Apache 2.0 del modelo base. El repositorio ocupa 20,5 GB y el pipeline declarado es `any-to-any`, coherente con la naturaleza multimodal del Gemma 4 base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Gemma 4 (detalle exacto no disponible) |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de google/gemma-4-E2B-it) |
| Formato de pesos | safetensors |
| Presupuesto de generacion entrenado | 1.024 tokens (`max_new_tokens`) |
| Algoritmo de ajuste | GRPO (leave-one-out, normalizacion de recompensa por grupo, token-level loss) |
| Dataset de entrenamiento | agentica-org/DeepScaleR-Preview-Dataset |
| Paso del checkpoint | 300 |
| Tamano del repositorio | 20,5 GB |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer multimodal de aproximadamente 5.100 millones de parametros. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) usando baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. La recompensa es binaria: se extrae la respuesta del bloque `\boxed{}` y se compara con la solucion correcta. Las respuestas que alcanzan el limite de 1.024 tokens se truncan y se puntuan tal cual, lo que fuerza al modelo a aprender a resolver dentro del presupuesto en lugar de posponer la respuesta.

Los hiperparametros documentados incluyen 300 pasos, batch de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de warmup. El entrenamiento se realizo sobre DeepScaleR (matematicas) durante un maximo de 3 epocas, con el prompt de usuario "Think step-by-step to solve the following problem. Output your answer inside of \boxed{} tags." renderizado con la plantilla de chat del modelo base. No se documentan innovaciones arquitectonicas adicionales mas alla del propio procedimiento de internalizacion de presupuesto.

## Capacidades

- Generacion de texto y razonamiento paso a paso bajo un presupuesto fijo de 1.024 tokens.
- Razonamiento matematico con formato de respuesta `\boxed{}` (heredado del entrenamiento).
- Capacidades multimodales de entrada (image-text-to-text, pipeline `any-to-any`) heredadas del Gemma 4 base.
- Soporte de tool calling y function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente, aunque el modelo base podria soportarlo.
- Capacidades multilingues: no documentadas.
- Modo thinking explicito: no documentado; el prompt de entrenamiento induce razonamiento paso a paso.

## Casos de uso

- Evaluacion de razonamiento matematico con presupuesto acotado: util para experimentos que comparan precision frente a longitud de generacion, ya que el modelo esta entrenado especificamente para responder dentro de 1.024 tokens.
- Despliegue en entornos con latencia estricta: al limitar la generacion, el coste por consulta es predecible y adecuado para servicios interactivos donde cadenas de razonamiento largas romperian el SLA.
- Investigacion en RLVR (Reinforcement Learning with Verifiable Rewards): sirve como punto de comparacion para estudiar como el ajuste con recompensa binaria afecta a la longitud de las respuestas.
- Generacion de soluciones paso a paso en tutoria educativa: el formato `\boxed{}` facilita la extraccion automatica de la respuesta final para sistemas de correccion.
- Pipelines de evaluacion automatizada de modelos: el checkpoint del paso 300 permite analizar la curva de aprendizaje del presupuesto interno frente a modelos base sin ajustar.
- Prototipado de asistentes multimodales con restricciones de coste: al heredar el pipeline `any-to-any` de Gemma 4, puede recibir imagen y texto, aunque su ajuste se centro en matematicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 20,5 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24-32 GB para comodidad.
- En BF16/FP16: alrededor de 10,3 GB para pesos, viable en GPUs de 16-24 GB.
- En cuantizacion de 8 bits: aproximadamente 5,1 GB; en 4 bits: alrededor de 2,6 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para F32; RTX 4090 (24 GB) o RTX 3090 para BF16.
- Cabe en GPUs consumer de gama alta (RTX 4090, 3090) en BF16 o cuantizado; en 4 bits podria caber en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y llama.cpp si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-gemma4-e2b-1k-grpo-luckymarmot-s300 | 5,12 B | no disponible | Razonamiento matematico con presupuesto de 1.024 tokens | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it | no disponible (base) | no disponible | Modelo multimodal generalista | Gemma 4 license | Hugging Face |
| DeepSeek-R1-Distill (variantes pequenas) | variable | no disponible | Razonamiento matematico con cadenas largas | MIT/variable | Hugging Face |
| Qwen2.5-Math (variantes 1.5B-7B) | variable | no disponible | Razonamiento matematico especializado | Apache 2.0 | Hugging Face |

La comparativa directa con alternativas de razonamiento matematico de tamano similar no esta documentada por el autor; los datos de modelos alternativos son orientativos y no proceden de la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste se limita a matematicas (DeepScaleR); el rendimiento en otras tareas puede degradarse respecto al modelo base.
- El presupuesto de 1.024 tokens se impone durante el entrenamiento; generar mas alla de ese limite puede producir respuestas truncadas o de peor calidad.
- Riesgo de alucinacion en problemas fuera de la distribucion de DeepScaleR, especialmente si el modelo intenta forzar una respuesta dentro del presupuesto.
- No se documentan sesgos especificos, pero al heredar Gemma 4 base puede reproducir sesgos del modelo original.
- Idiomas soportados no documentados; el entrenamiento se realizo presumiblemente en ingles.
- Licencia Apache 2.0 heredada, pero el enlace de licencia apunta a los terminos de Gemma 4; conviene revisar las condiciones de uso comercial del modelo base.
- El checkpoint es un paso intermedio (step 300) de un run de investigacion, no un modelo final pulido para produccion.
- No hay benchmarks publicados que permitan validar la afirmacion de "in-budget accuracy" frente al modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-luckymarmot-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: referencia citada en la model card, sin enlace disponible.

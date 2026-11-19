# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-forced-answer-gamegnat-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-4k-grpo-forced-answer-gamegnat-s300` es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Su objetivo es internalizar un presupuesto fijo de generación de 4.096 tokens para razonamiento matemático, de forma que el modelo aprenda a producir respuestas correctas dentro de ese límite en lugar de depender de un escalado de cómputo en tiempo de inferencia. Se publica junto al artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

El modelo parte de una arquitectura Qwen3.5 multimodal (pipeline `image-text-to-text`) con 4.539.265.536 parámetros totales en pesos BF16 (repositorio de 9,1 GB). El entrenamiento emplea GRPO con respuesta forzada: cuando la generación alcanza el presupuesto, se cierra el razonamiento y se obliga al modelo a emitir una respuesta final de hasta 120 tokens en el formato `Final Answer: \boxed{...}`, que luego se puntúa por corrección binaria.

Es relevante porque aborda un problema práctico de producción: el coste y la latencia impredecibles del razonamiento extendido. Al internalizar el presupuesto, el modelo ofrece un compromiso explícito entre precisión dentro del límite y escalado en tiempo de test, con licencia Apache 2.0 y pesos en safetensors compatibles con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (pipeline image-text-to-text); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generación es de 4.096 tokens, no la ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B base, un transformer multimodal capaz de procesar entradas de imagen y texto. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) orientado a razonamiento matemático bajo un presupuesto fijo de 4.096 tokens de generación (`max_new_tokens`). La innovación central es el mecanismo de respuesta forzada: al agotarse el presupuesto, el razonamiento se cierra y el modelo debe escribir `Final Answer: \boxed{`, con hasta 120 tokens adicionales, cuya corrección se evalúa mediante extracción del contenido de `\boxed{}` y recompensa binaria.

Los datos de entrenamiento provienen del dataset DeepScaleR (matemáticas), con un máximo de 3 épocas. La configuración es de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7, 10 pasos de warmup y 300 pasos totales (checkpoint publicado en el paso 300). El prompt de entrenamiento usa la plantilla de chat del modelo base con la instrucción "Think step-by-step to solve the following problem. Output your answer inside of \\boxed{} tags." No se documentan detalles adicionales sobre la composición del dataset, el uso de RLHF/DPO adicional o innovaciones de decodificación.

## Capacidades

- Razonamiento matemático con presupuesto fijo: resuelve problemas emitiendo cadenas de razonamiento acotadas a 4.096 tokens y una respuesta final forzada en formato `\boxed{}`.
- Generación de texto conversacional mediante la plantilla de chat del modelo base.
- Procesamiento de imagen y texto (pipeline `image-text-to-text` heredado del Qwen3.5-4B).
- Internalización de presupuesto: comportamiento entrenado para cerrar el razonamiento y responder dentro del límite en lugar de extenderse.
- Compatibilidad con endpoints (`endpoints_compatible`) y con la librería `transformers`.
- Soporte de tool calling, agentes, multilingüismo o modos de pensamiento explícitos: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de razonamiento matemático con latencia acotada: el modelo permite medir precisión dentro de un presupuesto fijo de 4.096 tokens, útil para comparar la internalización del presupuesto frente a modelos que dependen de escalado en tiempo de test.
- Generación de soluciones matemáticas en pipelines por lotes: al forzar una respuesta final tras el presupuesto, el coste por petición es predecible, lo que facilita la planificación de capacidad en servicios de corrección automática.
- Investigación en RLVR (RL con recompensas verificables): sirve como checkpoint reproducible (paso 300, run `gamegnat`) para estudiar el efecto del presupuesto fijo en la precisión.
- Tutoría matemática automatizada: el formato `\boxed{}` y el razonamiento paso a paso permiten presentar soluciones estructuradas y verificables en entornos educativos.
- Prototipado de asistentes multimodales ligeros: con 4,5 mil millones de parámetros, puede desplegarse en infraestructura moderada para tareas que combinen imagen y texto.
- Base para experimentos de destilación o comparación: al ser un fine-tune sobre Qwen3.5-4B con licencia Apache 2.0, puede usarse como referencia en estudios de presupuesto de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más memoria para activaciones y caché KV; en la práctica, se recomienda al menos 16-24 GB para secuencias de 4.096 tokens.
- Cuantización: no se documentan versiones GGUF ni cuantizaciones oficiales; habría que generarlas a partir de los safetensors BF16.
- GPU recomendadas: A100, H100 o RTX 4090 para BF16; GPUs consumer de 24 GB (RTX 3090/4090) podrían alojar el modelo en BF16 con margen limitado.
- Despliegue: compatible con `transformers` y endpoints; soporte para vLLM, llama.cpp, Ollama o TGI no confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-4k-grpo-forced-answer-gamegnat-s300 | 4,54 B | no disponible (presupuesto de generación 4.096) | RLVR con presupuesto fijo para matemáticas | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | Modelo multimodal generalista | Apache 2.0 (heredada) | Hugging Face |
| Alternativas comparables de 4 B para matemáticas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está especializado en matemáticas con formato `\boxed{}`; su rendimiento fuera de ese dominio no está documentado.
- El presupuesto fijo de 4.096 tokens puede degradar la precisión en problemas que requieran razonamientos más largos, ya que la respuesta se fuerza al agotarse el límite.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en problemas fuera de la distribución de DeepScaleR.
- Sesgos conocidos: no disponibles; se heredan los del modelo base Qwen3.5-4B.
- Idiomas soportados no documentados; el prompt de entrenamiento está en inglés.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.5-4B.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- La model card incluye una cita pendiente ("TODO"), lo que indica documentación incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-forced-answer-gamegnat-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: referencia citada en la model card, sin enlace disponible.

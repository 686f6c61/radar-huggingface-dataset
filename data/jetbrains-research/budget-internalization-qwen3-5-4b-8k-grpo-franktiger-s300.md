# JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-franktiger-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-8k-grpo-franktiger-s300` es un ajuste fino por aprendizaje por refuerzo de Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research, orientado a razonamiento matemático bajo un presupuesto fijo de generación de 8.192 tokens. Forma parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, cuyo objetivo es que el modelo aprenda a resolver problemas dentro de un límite de tokens predefinido, en lugar de depender de un escalado de cómputo en tiempo de inferencia.

El modelo parte de una arquitectura Qwen3.5 de 4B parámetros (4.539.265.536 parámetros reales en safetensors) y se entrena con GRPO sobre el dataset DeepScaleR de matemáticas, con recompensa binaria basada en la corrección de la respuesta extraída de etiquetas `\boxed{}`. El resultado es un checkpoint en el paso 300 que internaliza el presupuesto de 8.192 tokens como parte de su comportamiento de razonamiento.

Es relevante porque aborda un problema práctico de producción: los modelos de razonamiento que escalan test-time compute pueden generar respuestas muy largas y costosas. Este ajuste busca mantener la precisión dentro de un presupuesto acotado, lo que facilita la previsibilidad de latencia y coste en despliegues reales. El modelo se distribuye con licencia Apache 2.0 y pesos en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), ajuste fino con GRPO |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (presupuesto de generación de 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-4B, un transformer de 4B parámetros, y se ajusta mediante GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el límite de presupuesto se truncan y se puntúan tal cual, lo que fuerza al modelo a aprender a operar dentro de los 8.192 tokens de generación (`max_new_tokens`).

El entrenamiento usa el dataset DeepScaleR (matemáticas) durante un máximo de 3 épocas, con lotes de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de warmup. Se ejecutaron 300 pasos. La recompensa es binaria según la corrección de la respuesta extraída de `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y la respuesta dentro de etiquetas `\boxed{}`. Los pesos se publican en BF16.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso.
- Resolución de problemas matemáticos con respuesta final en formato `\boxed{}`.
- Razonamiento bajo presupuesto fijo de 8.192 tokens (budget internalization).
- Entrada image-text-to-text según el pipeline declarado, heredada de la base Qwen3.5-4B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; el razonamiento paso a paso está presente en el prompt de entrenamiento.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible como capacidad separada; el razonamiento se induce por prompt.

## Casos de uso

- Resolución de problemas matemáticos en producción: el modelo genera razonamiento paso a paso y devuelve la respuesta en `\boxed{}`, lo que facilita la extracción automática en pipelines de evaluación y corrección.
- Sistemas de tutoría matemática: puede explicar la resolución de un problema dentro de un presupuesto acotado de tokens, lo que permite estimar coste y latencia por consulta.
- Evaluación comparativa de razonamiento: sirve como checkpoint de referencia para estudiar el efecto de internalizar un presupuesto fijo frente a modelos que escalan test-time compute.
- Generación de soluciones en entornos con límite de tokens: al haber sido entrenado con truncado a 8.192 tokens, es adecuado para APIs con límites estrictos de salida.
- Investigación en RLVR: útil para reproducir o extender experimentos de GRPO con recompensa binaria sobre datasets matemáticos como DeepScaleR.
- Procesamiento image-text-to-text: el pipeline declarado permite experimentar con entradas multimodales heredadas de la base Qwen3.5-4B, aunque no se detallan capacidades específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (4.539.265.536 parámetros × 2 bytes), más memoria para KV cache y activaciones.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5 GB para pesos; en 4 bits, alrededor de 2,3 GB, aunque no se confirman formatos de cuantización publicados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs consumer con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB en BF16), pero no se confirma.
- Despliegue: la librería declarada es transformers; no se especifican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-8k-grpo-franktiger-s300 | 4.539.265.536 | no disponible (presupuesto de 8.192 tokens) | GRPO con presupuesto fijo para matemáticas | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | 4B (aprox.) | no disponible | Modelo base generalista | no disponible en la información | Hugging Face |
| Alternativas de razonamiento matemático de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Entrenado específicamente para matemáticas con DeepScaleR; su rendimiento fuera de ese dominio no está documentado.
- El truncado a 8.192 tokens puede degradar respuestas que requieran razonamientos más largos.
- Riesgo de alucinación inherente a los modelos de lenguaje; la recompensa binaria no elimina errores de razonamiento.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; el prompt de entrenamiento está en inglés.
- La licencia Apache 2.0 permite uso comercial, pero se hereda de la base Qwen3.5-4B; conviene verificar las condiciones de dicha base.
- El checkpoint corresponde al paso 300 de un único run (`franktiger`); no se documentan variantes ni evaluaciones independientes.
- La model card incluye una sección de cita marcada como TODO, sin referencia bibliográfica completa.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-franktiger-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: no disponible enlace en la información proporcionada.

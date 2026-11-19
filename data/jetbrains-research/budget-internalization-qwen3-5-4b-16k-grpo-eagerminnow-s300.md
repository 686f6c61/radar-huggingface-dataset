# JetBrains-Research/budget-internalization-qwen3.5-4b-16k-grpo-eagerminnow-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-16k-grpo-eagerminnow-s300` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Su propósito es el razonamiento matemático bajo un presupuesto de generación fijo de 16.384 tokens, siguiendo la línea de investigación presentada en el artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*. La idea central es que el modelo internalice el límite de tokens durante el entrenamiento, de modo que aprenda a resolver problemas dentro de ese presupuesto en lugar de depender de un escalado en tiempo de inferencia.

El ajuste se realizó con GRPO (Group Relative Policy Optimization) sobre el conjunto de datos DeepScaleR (matemáticas), con recompensa binaria basada en la corrección de la respuesta extraída de las etiquetas `\boxed{}`. El modelo conserva la arquitectura y capacidades del Qwen3.5-4B original, incluyendo la modalidad image-text-to-text, y se distribuye en formato safetensors con pesos en BF16 bajo licencia Apache 2.0.

Con 4.539.265.536 parámetros totales y un tamaño de repositorio de 9,1 GB, es un modelo de escala media pensado para experimentación en razonamiento matemático con control explícito del coste computacional en inferencia. Su relevancia actual radica en la creciente atención a técnicas de RLVR (Reinforcement Learning with Verifiable Rewards) y a la gestión eficiente del presupuesto de tokens en modelos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, familia qwen3_5) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura del Qwen/Qwen3.5-4B, un transformer de 4.539 millones de parámetros con capacidad image-text-to-text. Sobre esa base se aplicó un ajuste fino con GRPO, utilizando una línea base leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el límite de presupuesto se truncan y se puntúan tal cual, lo que fuerza al modelo a aprender a operar dentro de los 16.384 tokens de generación (`max_new_tokens = 16.384`).

El entrenamiento se realizó sobre el conjunto DeepScaleR (matemáticas) durante un máximo de 3 épocas, con lotes de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de warmup. Se completaron 300 pasos (checkpoint `s300`). La recompensa es binaria y se basa en la corrección de la respuesta extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y la respuesta dentro de dichas etiquetas. Los pesos se publican en BF16.

## Capacidades

- Generación de texto y razonamiento paso a paso, con énfasis en problemas matemáticos.
- Razonamiento matemático bajo un presupuesto fijo de 16.384 tokens de generación.
- Capacidad image-text-to-text heredada del modelo base Qwen3.5-4B (pipeline declarado en la model card).
- Extracción de respuestas finales mediante el formato `\boxed{}`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible como funcionalidad separada; el entrenamiento emplea razonamiento paso a paso en el prompt.

## Casos de uso

- Evaluación de técnicas de budget internalization: sirve como checkpoint de referencia para reproducir y comparar experimentos de RLVR con presupuesto fijo de tokens, dado que se publica el paso 300 de un run concreto (`eagerminnow`).
- Resolución de problemas matemáticos con coste acotado: el modelo está entrenado para producir soluciones dentro de 16.384 tokens, lo que permite planificar el coste de inferencia en entornos con límites estrictos de generación.
- Investigación en RL con recompensas verificables: útil para estudiar el efecto de recompensas binarias basadas en `\boxed{}` y de la normalización de recompensa por grupo en modelos de 4B.
- Generación de cadenas de razonamiento para destilación: las trazas paso a paso pueden emplearse como datos de entrenamiento para modelos más pequeños o para análisis de patrones de razonamiento.
- Experimentación en pipelines image-text-to-text: al conservar la modalidad del modelo base, puede emplearse en tareas que combinen imagen y texto, aunque el ajuste RL se centró en matemáticas.
- Reproducción de experimentos académicos: el checkpoint y la configuración de entrenamiento (batch, LR, pasos, dataset) permiten replicar el run y comparar con otras variantes de presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4.539 millones de parámetros × 2 bytes), más memoria para activaciones y KV cache; el tamaño del repositorio es de 9,1 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5 GB para pesos; en 4 bits, alrededor de 2,3 GB (estimaciones teóricas, no verificadas en la información proporcionada).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs consumer con 16 GB o más de VRAM en BF16, y en GPUs de 8 GB con cuantización.
- Cabe en GPU consumer: previsiblemente sí en modelos con 16 GB o más en BF16, y en GPUs de 8 GB con cuantización (no confirmado en la información).
- Opciones de despliegue: transformers (librería declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible en la información proporcionada.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-16k-grpo-eagerminnow-s300 | 4.539.265.536 | no disponible | RLVR con presupuesto fijo de 16k tokens | Apache 2.0 | Hugging Face (JetBrains-Research) |
| Qwen/Qwen3.5-4B (base) | 4B (aproximado) | no disponible | Modelo base image-text-to-text | no disponible en la información | Hugging Face (Qwen) |
| Alternativas de razonamiento matemático de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El ajuste se centró exclusivamente en matemáticas con el dataset DeepScaleR; el rendimiento en otras tareas puede degradarse respecto al modelo base.
- La recompensa binaria basada en extracción de `\boxed{}` puede favorecer formatos concretos y penalizar respuestas correctas mal formateadas.
- Las respuestas que alcanzan el presupuesto se truncan y se puntúan tal cual, lo que puede introducir sesgos hacia soluciones incompletas en problemas largos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; el entrenamiento se realizó con prompts en inglés.
- Licencia Apache 2.0, heredada del modelo base, permite uso comercial; conviene verificar los términos del modelo base Qwen/Qwen3.5-4B.
- Es un checkpoint de investigación (paso 300 de un run concreto), sin resultados de benchmarks publicados; no se recomienda para producción sin evaluación previa.
- Capacidades de tool calling, agentes y multilingüismo no documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-16k-grpo-eagerminnow-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Artículo citado (*Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*): enlace no disponible en la información proporcionada.

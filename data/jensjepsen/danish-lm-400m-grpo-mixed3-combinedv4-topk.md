# jensjepsen/danish-lm-400m-grpo-mixed3-combinedv4-topk

## Resumen

El modelo `jensjepsen/danish-lm-400m-grpo-mixed3-combinedv4-topk` es un ajuste fino de un modelo de lenguaje danés de 400 millones de parámetros, desarrollado por el autor jensjepsen. Se basa en el modelo SFT `jensjepsen/danish-lm-400m-sft-v31-avg-top3` y se entrena con el algoritmo GRPO (Group Relative Policy Optimization) sobre una mezcla de tres tareas: seguimiento de instrucciones, razonamiento matemático (GSM8K) y generación de JSON. El objetivo principal es mejorar la capacidad de seguir instrucciones y el razonamiento en danés, manteniendo un tamaño compacto.

La relevancia de este modelo radica en que demuestra cómo el entrenamiento con GRPO puede mejorar significativamente métricas de instrucciones y matemáticas en modelos pequeños de idiomas menos representados, como el danés. El repositorio contiene los tres mejores checkpoints según una puntuación combinada, pausado al 21% del entrenamiento total (paso 18455 de 89709). El modelo está disponible bajo licencia MIT, lo que facilita su uso comercial y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 400 M (segun nomenclatura del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, posible FP16) |
| Idiomas soportados | danes (da) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se especifica la arquitectura interna del modelo base en la documentacion proporcionada. Sin embargo, por el tamaño (400M de parametros) y el formato safetensors, se trata probablemente de un transformer decoder de tipo causal. El entrenamiento de este modelo es un fine-tuning con GRPO sobre un modelo SFT previo. Se emplea una mezcla de recompensas en proporcion 1:1:1 entre tres objetivos: seguimiento de instrucciones (dataset `jensjepsen/danish-if-grpo-combined-v4` de 10k filas), razonamiento matematico (GSM8K) y generacion de JSON. El proceso usa 1024 rollouts por paso, optimizador `dr_grpo` con LR 1e-6 y beta 0.004, y tecnicas DAPO como resampling de prompts frescos y coincidencia de tareas. La seleccion de checkpoints se basa en una puntuacion compuesta que combina ifeval-da, gsm8k pass@1 y JSON mean-reward.

## Capacidades

- Seguimiento de instrucciones en danes: mejora notable en las metricas `ifeval-da` (prompt-strict 41.7, inst-strict 58.2) comparado con la base SFT.
- Razonamiento matematico: obtiene una precision de 29.76 en gsm8k pass@1 (top-2), superando al modelo base SFT.
- Generacion de JSON estructurado: alcanza una recompensa media de 1.052 en tareas de generacion JSON.
- Comprension lectora y QA: resultados moderados en tareas como sciq, arc-challenge y openbookqa.
- Resumen y reescritura de texto: mantiene un rendimiento estable en metricas ChrF++ (por ejemplo, 41.10 en resumen y 46.71 en reescritura).
- Capacidad multilingue: limitada exclusivamente al danes; no se reportan otros idiomas.
- Soporte de tool calling o function calling: no se menciona en la documentacion.
- Modo de razonamiento especial (thinking mode): no se menciona.

## Casos de uso

- Atencion al cliente automatizada en danes: el modelo puede gestionar conversaciones multi-turno con instrucciones complejas gracias a su mejora en seguimiento de instrucciones, aunque su contexto no esta especificado.
- Generacion de respuestas estructuradas en JSON: util para aplicaciones que requieren salidas en formato JSON (p.ej., APIs de asistentes virtuales), dado su entrenamiento especifico en generacion JSON.
- Asistente de razonamiento matematico en danes: para ejercicios de matematicas basicas o explicaciones, aunque la precision es limitada (29.76 en GSM8K).
- Resumen de textos daneses: para resumir articulos o documentos en danes, con una calidad moderada (ChrF++ de 41).
- Generacion de preguntas y respuestas sobre conocimiento general: para chatbots educativos en danes, aunque no supera el 60% de exactitud en tareas de opcion multiple.
- Prototipos de agentes de IA para tareas simples en danes: dado su tamano reducido, puede desplegarse en entornos con recursos limitados para tareas de generacion de texto basico.

## Benchmarks y rendimiento

El autor proporciona una tabla con resultados de evaluacion comparando la base SFT y los tres checkpoints. Se muestran las metricas para cada tarea.

| Eval | Metric | v31 SFT (base) | step-16625 (top-1) | step-17875 (top-2) | step-17500 (top-3) |
|---|---|---|---|---|---|
| ifeval-da | prompt-strict | 21.2 | 41.7 | 41.6 | 39.1 |
| ifeval-da | inst-strict | 35.2 | 58.2 | 58.0 | 56.3 |
| ifbench-da | prompt-strict | — | 11.7 | 9.3 | 10.0 |
| ifbench-da | inst-strict | — | 13.1 | 11.3 | 11.6 |
| gsm8k (pass@1) | acc | 17.39 | 28.93 | 29.76 | 27.79 |
| json (mean_reward) | — | — | 1.041 | 1.052 | 1.052 |
| sciq-gen (pass@1) | acc | 13.50 | 13.60 | 13.50 | 14.20 |
| sciq-mc | acc | — | 59.60 | 59.30 | 59.70 |
| cit-gen | acc | 29.86 | 27.90 | 27.40 | 27.50 |
| cit-mc | acc | 48.19 | 48.50 | 48.90 | 49.00 |
| arc-easy chat-mc | acc | 44.40 | 40.78 | 40.53 | 40.53 |
| arc-challenge chat-mc | acc | 29.35 | 27.56 | 27.73 | 28.07 |
| openbookqa chat-mc | acc | 35.40 | 36.60 | 35.80 | 36.60 |
| piqa chat-mc | acc | 53.00 | 53.00 | 53.00 | 53.00 |
| textman-summary | ChrF++ | 41.11 | 40.62 | 41.10 | 41.13 |
| textman-rewrite | ChrF++ | 46.51 | 46.43 | 46.38 | 46.71 |

El checkpoint top-1 (step-16625) es el mejor en tareas de formato estricto, mientras que top-3 (step-17500) destaca en razonamiento y lectura. Las diferencias son menores a 1 punto porcentual en la mayoria de las metricas.

## Requisitos de hardware

- El modelo tiene 400M de parametros, lo que en precision FP16 ocupa aproximadamente 800 MB de memoria. Con cuantizacion a 4 bits podria caber en menos de 200 MB.
- Se estima que una GPU con al menos 2 GB de VRAM es suficiente para inferencia sin cuantizacion. GPUs de consumo como una NVIDIA GTX 1060 (6 GB) o RTX 2060 (6 GB) podrian ejecutar el modelo sin problemas.
- Para despliegue se pueden usar frameworks como llama.cpp, Ollama o vLLM, aunque no se especifica compatibilidad explicita.
- El repositorio contiene tres checkpoints (cada uno probablemente alrededor de 1.7 GB en FP16), por lo que se debe seleccionar el checkpoint deseado para el despliegue.
- La latencia esperada en una GPU moderna para un modelo de 400M es de unos pocos milisegundos por token, pero no se proporcionan datos concretos.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables especificos para el dano en la informacion proporcionada. No se puede realizar una comparativa con alternativas como `danish-lm-400m-sft-v31-avg-top3` (base) u otros modelos danos similares, ya que no se han incluido metricas de estos.

## Limitaciones y advertencias

- El entrenamiento se pauso al 21% del total de pasos (18455/89709), lo que puede implicar un rendimiento suboptimo en algunas tareas.
- El modelo solo soporta danes; no es apto para otros idiomas.
- Aunque mejora en seguimiento de instrucciones, su capacidad de razonamiento complejo es limitada (por ejemplo, en GSM8K solo alcanza ~30% de precision).
- Existe riesgo de alucinaciones y errores factuales, como en cualquier modelo de lenguaje de tamano reducido.
- La licencia MIT permite uso comercial, pero no se garantiza la exactitud ni la seguridad de las salidas.
- No se han publicado resultados en benchmarks estandar generales (MMLU, HumanEval, etc.) para este modelo especifico.
- El repositorio contiene varios checkpoints; se debe elegir el adecuado segun la tarea (instrucciones vs razonamiento).

## Enlaces

- [HuggingFace - danish-lm-400m-grpo-mixed3-combinedv4-topk](https://huggingface.co/jensjepsen/danish-lm-400m-grpo-mixed3-combinedv4-topk)
- [Dataset jensjepsen/danish-if-grpo-combined-v4](https://huggingface.co/datasets/jensjepsen/danish-if-grpo-combined-v4)
- [Modelo base danish-lm-400m-sft-v31-avg-top3](https://huggingface.co/jensjepsen/danish-lm-400m-sft-v31-avg-top3)
- [Registro de entrenamiento en Wandb](https://wandb.ai/jepsen/danish-lm-grpo/runs/zo0m286i)

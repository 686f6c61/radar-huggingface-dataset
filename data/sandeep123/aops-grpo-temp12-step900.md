# sandeep123/aops-grpo-temp12-step900

## Resumen

`aops-grpo-temp12-step900` es un modelo de razonamiento entrenado mediante aprendizaje por refuerzo (RL) con el algoritmo GRPO (Group Relative Policy Optimization) sobre el modelo base `Qwen/Qwen2.5-Math-1.5B`. El desarrollador, identificado como sandeep123, lo publica como un baseline de investigacion para estudiar el efecto de la temperatura de rollout (1.2) en el entrenamiento con GRPO sobre el dataset ScienceQA. El checkpoint seleccionado corresponde al paso 900, elegido por ser el que mejor valor de pass@6 obtiene en validacion dentro de su rama experimental.

El modelo tiene 1.777 millones de parametros (1.5B en notacion comercial) y esta pensado exclusivamente para la tarea de respuesta a preguntas de ciencias con opciones multiples (ScienceQA). Su relevancia radica en que documenta de forma transparente un experimento controlado de RL: la validacion se realiza siempre a temperatura 1.0 aunque el entrenamiento use 1.2, y se publican tanto el checkpoint optimo para pass@1 como el optimo para pass@6 para evitar sesgos en la seleccion de checkpoints. Es un modelo de investigacion, no un producto listo para produccion.

Una advertencia critica del autor: el modelo se entreno sin chat template y aplicarlo en inferencia degrada el rendimiento en aproximadamente 19 puntos de pass@1 en una tarea hermana. Debe usarse con texto plano como entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1536 tokens en entrenamiento (512 prompt + 1024 respuesta); el modelo base soporta 32768 |
| Tipos de cuantizacion | no disponible (repo con pesos en safetensors, bfloat16 segun ejemplo de vLLM) |
| Idiomas soportados | no disponible (modelo base Qwen2.5-Math entrenado principalmente en ingles e chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de Qwen2.5-Math-1.5B: un transformer decoder-only con atencion causal, con aproximadamente 1.78B parametros, disenado por Alibaba para tareas matematicas. La capa de RL se implemento con GRPO, una variante de PPO que elimina la red de valor (critic) y estima las ventajas a partir de las recompensas relativas dentro de un grupo de respuestas muestreadas. El entrenamiento se realizo con verl (un framework de RL para LLMs) sobre el dataset ScienceQA, con una variante del dataset denominada `scienceqa_boxfix`.

Los hiperparametros clave del entrenamiento son: 25 epochs (1250 pasos en total), 128 prompts por batch con 6 rollouts cada uno (K=6), learning rate constante de 1e-6, coeficiente KL de 0.01 incluido en la recompensa, y una recompensa de formato fija de 0.03. La temperatura de rollout durante el entrenamiento fue 1.2 (de ahi el nombre del modelo), pero la validacion se hizo siempre a temperatura 1.0 con semilla 42 para mantener comparabilidad con el resto de ramas experimentales. El clipping de PPO se fijo en 0.2/0.2 y el coeficiente de entropia en 0.0.

Una particularidad relevante es que el modelo se entreno con texto plano (raw prompt text) sin aplicar chat template. La extraccion de respuestas se define como el contenido del ultimo `\boxed{}` presente en la respuesta; si no existe, se toma el ultimo token A-E. Respuestas sin respuesta extraible se puntuan como incorrectas.

## Capacidades

- Razonamiento cientifico con opciones multiples: responde preguntas del dataset ScienceQA (nivel escolar, materias de ciencias) con una opcion A-E.
- Generacion de respuestas con formato `\boxed{...}`: el modelo aprende a emitir su respuesta final entre llaves de caja LaTeX, lo que facilita la extraccion automatica.
- Razonamiento paso a paso (chain-of-thought): aunque no se menciona explicitamente, el entrenamiento con RL sobre tareas de razonamiento suele inducir cadenas de pensamiento antes de la respuesta final.
- Capacidad multilingue: no documentada especificamente; hereda las capacidades del modelo base Qwen2.5-Math, que fue entrenado predominantemente en ingles y chino.
- Sin soporte para tool calling, agentes, vision ni audio: es un modelo de texto puro para una tarea especifica.

## Casos de uso

- Investigacion en RL para LLMs: el caso de uso principal es estudiar el efecto de la temperatura de rollout en GRPO. Investigadores pueden reproducir los experimentos o comparar este checkpoint con otros de la misma familia (temperaturas distintas, pasos distintos) para analizar la dinamica del entrenamiento.
- Benchmark de metodos de RL: sirve como baseline para comparar nuevas variantes de GRPO, metodos de exploracion o tecnicas de control de entropia en modelos pequenos.
- Evaluacion de extraccion de respuestas: el modelo es util para probar pipelines de parsing de respuestas con `\boxed{}` y para validar metricas de pass@k en tareas de opcion multiple.
- Estudio de seleccion de checkpoints: el autor publica explicitamente checkpoints optimos para pass@1 y pass@6 por separado, lo que permite estudiar como la seleccion de checkpoint afecta a las metricas reportadas en investigacion de RL.
- Replicacion de experimentos: al ser Apache-2.0 y tener documentados todos los hiperparametros, es un candidato ideal para reproducir el pipeline de entrenamiento y verificar la reproducibilidad de los resultados.
- Educacion sobre GRPO: por su tamano reducido (1.5B) y licencia permisiva, es util como ejemplo practico de entrenamiento GRPO en entornos academicos o de formacion.

## Benchmarks y rendimiento

La informacion disponible solo incluye metricas de validacion sobre ScienceQA (256 prompts held-out, K=6 rollouts, temperatura 1.0, semilla 42):

| Metrica | Valor |
|---|---|
| pass@1 | 0.2298 |
| pass@6 | 0.4258 |
| paso de entrenamiento | 900 |

No se han publicado resultados en benchmarks generales como MMLU, GSM8K o HumanEval en la informacion disponible. El autor menciona que el checkpoint optimo para pass@1 se encuentra cerca del paso 1000-1200, mientras que el optimo para pass@6 esta en el paso 200-500, lo que sugiere una dinamica de entrenamiento donde la diversidad de respuestas mejora antes que la precision individual.

## Requisitos de hardware

- VRAM estimada: con pesos en bfloat16, el modelo ocupa aproximadamente 3.5 GB. Con cuantizacion de 4 bits (si se convirtiese a GGUF o AWQ) cabria en unos 1.5-2 GB.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM es suficiente para inferencia (RTX 3060, RTX 4060, etc.). Para entrenamiento RL completo se necesitarian GPUs con 24 GB o mas (RTX 3090/4090, A10G, A100).
- Inferencia en consumer GPU: si, es viable en GPUs de gama media e incluso en CPU con cuantizacion.
- Opciones de despliegue: vLLM (el autor proporciona un ejemplo de uso), HuggingFace Transformers, llama.cpp si se convierte a GGUF, Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada, pero por su tamano se espera una generacion rapida (decenas de tokens por segundo en GPU consumer).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (ScienceQA pass@1) | Licencia | Notas |
|---|---|---|---|---|---|
| aops-grpo-temp12-step900 (este) | 1.5B | 1536 (entrenamiento) | 0.2298 | Apache-2.0 | Entrenado con GRPO, temperatura rollout 1.2 |
| Qwen2.5-Math-1.5B (base) | 1.5B | 32768 | no disponible | Apache-2.0 | Modelo base sin RL, solo preentrenamiento |
| Qwen2.5-Math-1.5B-Instruct | 1.5B | 32768 | no disponible | Apache-2.0 | Variante con instruction tuning de Alibaba |

No se dispone de datos comparativos de otros modelos entrenados con GRPO sobre ScienceQA en la informacion proporcionada. La comparativa con el modelo base seria la mas relevante para evaluar la ganancia del RL, pero no se publican metricas del base en este dataset.

## Limitaciones y advertencias

- No aplicar chat template: el modelo se entreno con texto plano y usar el chat template de Qwen2.5-Math degrada el rendimiento en aproximadamente 19 puntos de pass@1 en tareas similares. Es imprescindible usar la entrada como raw string.
- Modelo de investigacion: no es un modelo de proposito general ni esta pensado para produccion. Solo responde preguntas de ciencias con opciones multiples.
- Dominio limitado: entrenado exclusivamente en ScienceQA, su capacidad de generalizacion a otras tareas o dominios no esta evaluada.
- Metricas modestas: pass@1 de 0.2298 es un rendimiento moderado, esperable para un modelo de 1.5B entrenado con RL en un dataset academico.
- Sesgos del dataset: ScienceQA es un dataset en ingles mayoritariamente; el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion: como cualquier LLM, puede generar razonamientos plausibles pero incorrectos, especialmente fuera de su dominio de entrenamiento.
- Dependencia del formato `\boxed{}`: si el modelo no produce una respuesta en ese formato, se puntua como incorrecta; en aplicaciones reales esto puede requerir post-procesamiento adicional.
- Sin garantias de produccion: no se documentan pruebas de robustez, seguridad ni sesgos. El autor no ofrece soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/aops-grpo-temp12-step900
- Modelo hermano (misma familia, paso 700): https://huggingface.co/sandeep123/sqa-grpo-temp12-step700
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Articulo de referencia sobre GRPO (en chino): https://zhuanlan.zhihu.com/p/1977856962004791608

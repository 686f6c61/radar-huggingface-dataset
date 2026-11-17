# RL-Forgettting-Exp4/math-q25_3b-nobuf-kl0p01-lr6e-7

## Resumen

Este repositorio contiene una serie de checkpoints de un experimento de aprendizaje por refuerzo (RL) sobre el modelo base Qwen2.5-3B, orientado a mejorar el razonamiento matemático. Lo desarrolla el colectivo RL-Forgettting-Exp4 en el marco de un barrido de tasas de aprendizaje (LR sweep) centrado en el fenómeno del "olvido" durante el RL, es decir, la pérdida de capacidades generales al optimizar una tarea concreta. El modelo no es un modelo final de producción, sino material de investigación: cada carpeta `global_step_N/` es un modelo independiente en formato bf16 safetensors, listo para cargar con Transformers.

La receta emplea GRPO (Group Relative Policy Optimization) implementado con verl, sin normalización de la desviación estándar de ventajas, sin replay buffer y con un término KL de coeficiente 0.01. Se entrena sobre el split completo de 52.309 prompts del dataset Polaris-Dataset-53K, con respuestas de hasta 3.072 tokens y un máximo de 2.000 pasos. El run está en curso en el momento de la última actualización del repositorio: solo están disponibles los checkpoints de los pasos 200, 400 y 600.

Su relevancia es metodológica más que de rendimiento: documenta de forma granular cómo evoluciona el pass@k en matemáticas a lo largo del entrenamiento y permite estudiar el equilibrio entre especialización y olvido. El modelo base Qwen2.5-3B aporta una arquitectura transformer densa de 3.000 millones de parámetros con contexto nativo de 32.768 tokens, aunque el entrenamiento limita el prompt a 1.024 tokens y la respuesta a 3.072.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-3B) |
| Parametros totales | 3.000 millones (aproximado, segun el modelo base Qwen2.5-3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en el modelo base; en entrenamiento prompt <= 1.024 y respuesta <= 3.072 tokens |
| Tipos de cuantizacion | no disponible en el repositorio (pesos en bf16 safetensors) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multiples idiomas, pero no se documenta en esta model card) |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (bf16), con config y tokenizer por checkpoint |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B (revision `3aab1f1954e9cc14eb9509a215f9e5ca08227a9b`), un transformer denso de 3.000 millones de parámetros. Sobre él se aplica GRPO mediante la librería verl, con las siguientes particularidades: sin normalización de la desviación estándar de las ventajas, sin replay buffer, y con un término de pérdida KL (`low_var_kl`) de coeficiente 0.01 que no se incorpora a la recompensa. La tasa de aprendizaje del actor es constante a 6e-7, sin warmup ni decaimiento, con weight decay de 0.01. El batch es de 64 prompts por paso con 8 rollouts por prompt y un mini-batch PPO de 64.

Los datos de entrenamiento son el split completo de 52.309 prompts de POLARIS-Project/Polaris-Dataset-53K (revision `296f8e34132e63f4a1d70e0dcc8bddebb43f03e4`), con 800 prompts reservados para validación nativa. El muestreo durante el rollout usa temperatura 1.0. El entrenamiento se ejecuta en 4 GPU H100 de 80 GB, con semilla 1 y 2.000 pasos previstos, guardando checkpoint cada 200. Los checkpoints que solo existían como shards FSDP se fusionaron con el merger de verl. No se detalla la composición interna del dataset ni si hubo etapas de SFT o DPO previas.

## Capacidades

- Generación de texto y razonamiento matemático: el objetivo del entrenamiento es resolver problemas matemáticos con respuesta final en formato "boxed", evaluados con el scorer nativo del dataset Polaris.
- Razonamiento multi-paso: las respuestas pueden extenderse hasta 3.072 tokens, lo que permite cadenas de razonamiento largas.
- Generación de código y matemáticas: heredadas del modelo base Qwen2.5-3B, aunque no se evalúan específicamente en esta model card.
- Tool calling y function calling: no documentado en esta model card; el modelo base Qwen2.5 lo soporta, pero no hay evidencia de que el entrenamiento RL lo preserve.
- Soporte de agentes: no documentado.
- Capacidades multilingües: no documentadas para este checkpoint; dependen del modelo base.
- Modo "thinking" explícito: no disponible como característica separada; el razonamiento se produce en la propia respuesta.
- Visión y audio: no soportados (modelo de texto).

## Casos de uso

- Investigación sobre olvido catastrófico en RL: el repositorio permite comparar checkpoints (paso 0 frente a 200, 400, 600) para medir cómo evoluciona el pass@k en matemáticas y qué capacidades se degradan, usando la trayectoria de evaluación publicada en el dataset de resultados.
- Reproducción de experimentos de GRPO: al documentarse la receta completa (LR, KL, batch, longitudes, hardware), sirve como referencia para replicar el setup con verl en otros modelos o datasets.
- Estudio de barridos de tasa de aprendizaje: al formar parte de un LR sweep (junto con los runs de 3e-6 y 6e-6), permite analizar el efecto del LR en la estabilidad y el olvido del entrenamiento RL.
- Evaluación de robustez matemática: los 600 prompts held-out con 160 muestras cada uno y estimador pass@k no sesgado permiten medir la varianza de las respuestas y la consistencia del razonamiento.
- Base para fine-tuning posterior: los checkpoints en bf16 safetensors se pueden cargar con `AutoModelForCausalLM.from_pretrained(repo, subfolder="global_step_600")` y continuar el entrenamiento o aplicar SFT/DPO sobre ellos.
- Análisis de formatos de respuesta: útil para estudiar la adherencia al formato "boxed-answer" y la calidad de las cadenas de razonamiento generadas a temperatura 0.6 y top-p 0.95.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a la evaluación held-out sobre 600 preguntas de Polaris, con 160 muestras por pregunta (temperatura 0.6, top-p 0.95, hasta 3.072 tokens nuevos), usando el scorer nativo y el estimador pass@k no sesgado. El paso 0 es el modelo base.

| Paso | Origen | pass@1 | pass@8 | pass@64 | pass@128 |
|---:|---|---:|---:|---:|---:|
| 0 | modelo base | 0.1551 | 0.3940 | 0.6434 | 0.7070 |
| 200 | este run | 0.1780 | 0.4102 | 0.6414 | 0.6993 |

Los pasos 400 y 600 aún no han sido evaluados en el momento de la última actualización. No hay resultados de MMLU, HumanEval, GSM8K ni de otras suites estándar en la información disponible. La mejora en pass@1 (+0.0229) y pass@8 (+0.0162) coexiste con un ligero descenso en pass@64 y pass@128, lo que sugiere una especialización temprana con posible pérdida de diversidad en el muestreo amplio.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6 GB solo para pesos (3.000 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB para contexto corto.
- GPU recomendadas: H100 80 GB o A100 80 GB para entrenamiento (el run usó 4 × H100 80 GB); para inferencia, cualquier GPU con 16 GB o más es suficiente en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 sin problema; en RTX 3090 (24 GB) también; en GPUs de 8-12 GB requeriría cuantización a 8 o 4 bits, no incluida en el repositorio.
- Opciones de despliegue: al ser safetensors bf16, es compatible con vLLM, TGI y Transformers. Para llama.cpp u Ollama habría que convertir los pesos a GGUF, paso no documentado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Qwen2.5-3B + GRPO Polaris) | 3.000 M | 32.768 (base) | RL matemático, investigación sobre olvido | qwen-research | Hugging Face, checkpoints parciales |
| Qwen/Qwen2.5-3B | 3.000 M | 32.768 | Modelo base generalista | qwen-research | Hugging Face |
| Qwen/Qwen2.5-Math-7B | 7.000 M | 4.096 (tipico en la familia Math) | Especializado en matemáticas con SFT/RL | qwen-research | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.500 M | 32.768 | Destilación de razonamiento | MIT | Hugging Face |

La comparación con Qwen2.5-Math-7B y DeepSeek-R1-Distill-Qwen-1.5B es orientativa: no se dispone de resultados de benchmarks comunes en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable de rendimiento.

## Limitaciones y advertencias

- Modelo en curso: solo están subidos los checkpoints 200, 400 y 600 de los 2.000 previstos; no es un modelo final ni validado más allá del paso 200.
- Sin evaluación de capacidades generales: no hay datos sobre MMLU, código, multilingüismo ni tool calling, por lo que se desconoce el alcance del olvido fuera de matemáticas.
- Riesgo de alucinación: inherente a un modelo de 3.000 millones entrenado con RL sobre matemáticas; las cadenas de razonamiento largas pueden contener pasos incorrectos que conduzcan a respuestas erróneas con formato válido.
- Sesgos: no documentados; el dataset Polaris-53K no se describe en detalle y podría introducir sesgos de dominio o de formato.
- Licencia qwen-research: restringe el uso comercial; es imprescindible revisar los términos del modelo base Qwen2.5-3B antes de cualquier despliegue en producción.
- Contexto efectivo limitado en entrenamiento: aunque el modelo base soporta 32.768 tokens, el entrenamiento usa prompts de hasta 1.024 tokens, lo que puede degradar el rendimiento en contextos largos.
- Idiomas: no documentados para este checkpoint; el entrenamiento se centra en un dataset de matemáticas presumiblemente en inglés.
- Sin garantías de producción: es material de investigación con 0 descargas y 0 likes; no hay evidencia de uso en entornos reales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/RL-Forgettting-Exp4/math-q25_3b-nobuf-kl0p01-lr6e-7
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/POLARIS-Project/Polaris-Dataset-53K
- Dataset de resultados de evaluación: https://huggingface.co/datasets/RL-Forgettting-Exp4/rebuttal-results-20261109/tree/main/evaluations
- Librería verl: https://github.com/volcengine/verl

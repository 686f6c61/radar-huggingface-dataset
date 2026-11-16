# RL-Forgettting-Exp4/math-q25_3b-nobuf-kl0p01-lr3e-6

## Resumen

`math-q25_3b-nobuf-kl0p01-lr3e-6` es un conjunto de checkpoints de un experimento de aprendizaje por refuerzo (RL) sobre el modelo base Qwen2.5-3B, publicado por el colectivo RL-Forgettting-Exp4. El objetivo del trabajo es estudiar el fenomeno del olvido catastrófico durante el entrenamiento con GRPO (Group Relative Policy Optimization) sobre tareas matematicas, midiendo como evoluciona el rendimiento en el conjunto de entrenamiento frente a la degradacion de capacidades generales a lo largo de 2000 pasos.

El modelo se entrena sobre el split completo de 52.309 prompts del dataset Polaris-Dataset-53K, usando la implementacion de GRPO de la libreria verl, sin buffer de replay, sin normalizacion de la desviacion tipica de las ventajas y con un termino KL de coeficiente 0.01. El repositorio incluye checkpoints independientes en formato bf16 safetensors cada 200 pasos (`global_step_200` a `global_step_2000`), cada uno cargable de forma autonoma con Transformers.

Es relevante ahora porque documenta de forma cuantitativa el equilibrio entre mejora en la tarea objetivo (pass@1 en matematicas) y perdida de diversidad en la generacion (pass@k alto), un fenomeno central en el debate sobre RL y forgetting. No se trata de un modelo de proposito general para produccion, sino de un artefacto de investigacion reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B) |
| Parametros totales | 3.000 millones (aproximado, segun modelo base Qwen2.5-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (prompt ≤ 1024 y respuesta ≤ 3072 tokens durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | qwen-research (etiquetada como "other" en el repo) |
| Formato de pesos | safetensors (bf16), con config y tokenizer por checkpoint |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B, un transformer decoder-only de 3.000 millones de parametros. Sobre esa base se aplica un ajuste fino con GRPO mediante la libreria verl, sin buffer de replay y sin normalizacion de la desviacion tipica de las ventajas. El entrenamiento usa 64 prompts por paso con 8 rollouts por prompt, mini-batch PPO de 64, temperatura de rollout 1.0, learning rate constante de 3e-6 (sin warmup ni decaimiento) y weight decay de 0.01. Se incluye un termino de perdida KL con coeficiente 0.01 usando la variante `low_var_kl`, sin termino KL en la recompensa.

Los datos provienen del split de entrenamiento completo del dataset Polaris-Dataset-53K (52.309 prompts), con 800 prompts reservados para validacion nativa. El entrenamiento se ejecuto durante 2000 pasos con semilla 1 sobre 4 GPUs H100 de 80 GB. Los checkpoints de los pasos 200 a 1600 se convirtieron a formato Hugging Face durante el entrenamiento con el model merger de verl; los pasos 1800 y 2000 se fusionaron posteriormente a partir de los shards FSDP finales. Cada carpeta `global_step_N/` es un modelo independiente con pesos bf16, config y tokenizer; no se incluyen estados del optimizador ni de FSDP.

## Capacidades

- Generacion de texto y razonamiento matematico, con salida en formato de respuesta encajada (`boxed-answer`) evaluada con el scorer nativo del dataset Polaris.
- Razonamiento multi-paso para problemas matematicos, con hasta 3072 tokens de respuesta generada.
- Capacidades generales heredadas de Qwen2.5-3B (no evaluadas en la model card mas alla del conjunto de matematicas).
- Soporte de tool calling: no documentado en la model card.
- Soporte de agentes: no documentado en la model card.
- Capacidades multilingues: no documentadas.
- Modo thinking explicito: no disponible.

## Casos de uso

- Investigacion sobre olvido catastrófico en RL: el repositorio permite reproducir la trayectoria de pass@1, pass@8, pass@64 y pass@128 a lo largo de 2000 pasos para estudiar la perdida de diversidad en la generacion.
- Analisis de hiperparametros de GRPO: comparar este run (LR 3e-6, KL 0.01, sin replay) con otros brazos del sweep de learning rate para aislar el efecto de cada eleccion.
- Evaluacion de tecnicas de mitigacion de forgetting: usar los checkpoints intermedios como linea base frente a metodos con replay buffer o regularizacion KL distinta.
- Generacion de soluciones matematicas con verificacion por respuesta final: el modelo produce respuestas en formato encajado que pueden validarse automaticamente con el scorer nativo.
- Estudio de la relacion entre pass@1 y pass@k: los datos publicados permiten analizar como la mejora en precision de primer intento coexiste con la caida en cobertura de intentos multiples.
- Docencia y divulgacion sobre RLHF/RLVR: los checkpoints intermedios y las trayectorias de evaluacion sirven como material didactico para explicar el entrenamiento con GRPO en un modelo de 3.000 millones de parametros.

## Benchmarks y rendimiento

Evaluacion sobre 600 preguntas reservadas de Polaris, con 160 muestras por pregunta (temperatura 0.6, top-p 0.95, hasta 3072 tokens nuevos), scorer nativo de respuesta encajada y estimador insesgado de pass@k. El paso 0 corresponde al modelo base.

| Paso | pass@1 | pass@8 | pass@64 | pass@128 |
|---:|---:|---:|---:|---:|
| 0 (base) | 0.1551 | 0.3940 | 0.6434 | 0.7070 |
| 200 | 0.1837 | 0.4174 | 0.6406 | 0.6977 |
| 400 | 0.2018 | 0.4236 | 0.6298 | 0.6844 |
| 600 | 0.2008 | 0.4152 | 0.6259 | 0.6798 |
| 800 | 0.2198 | 0.4234 | 0.6097 | 0.6637 |
| 1000 | 0.2104 | 0.4017 | 0.5989 | 0.6593 |
| 1200 | 0.2077 | 0.3958 | 0.5921 | 0.6439 |

Los pasos 1400, 1600, 1800 y 2000 estan pendientes de evaluacion segun la model card. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 6-7 GB solo para pesos, mas overhead de activaciones y cache KV segun longitud de contexto.
- Cuantizacion: no se publican pesos cuantizados; seria necesario generarlos a partir de los safetensors bf16.
- GPU recomendadas: el entrenamiento se realizo con 4 x H100 80GB. Para inferencia, una RTX 4090 (24 GB) o superior deberia bastar en bf16 para el modelo de 3.000 millones de parametros.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8-12 GB de VRAM en bf16 o fp16, dependiendo de la longitud de contexto.
- Opciones de despliegue: Transformers (carga por subfolder de checkpoint), y previsiblemente vLLM, TGI o llama.cpp tras conversion a los formatos correspondientes; no se documenta soporte explicito en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| math-q25_3b-nobuf-kl0p01-lr3e-6 | 3.000 M | no disponible | GRPO sobre Qwen2.5-3B, experimento de forgetting | qwen-research |
| Qwen2.5-3B (base) | 3.000 M | no disponible en esta ficha | Modelo base preentrenado y ajustado | qwen-research |
| Qwen2.5-Math-1.5B / 7B | 1.500 M / 7.000 M | no disponible en esta ficha | Ajuste especifico para matematicas | qwen-research |

No se dispone de datos comparativos de benchmarks frente a estas alternativas en la informacion proporcionada. La comparacion con Qwen2.5-Math seria la mas directa por tarea, pero no hay resultados publicados en la model card.

## Limitaciones y advertencias

- Artefacto de investigacion: no es un modelo de proposito general ni esta pensado para produccion; su valor esta en la reproducibilidad del experimento.
- Olvido catastrófico documentado: los datos muestran una mejora en pass@1 (de 0.1551 a 0.2198 en el paso 800) acompanada de una caida sostenida en pass@64 y pass@128, lo que indica perdida de diversidad en la generacion.
- Riesgo de alucinacion: no evaluado en la model card; el modelo puede generar razonamientos plausibles con respuestas incorrectas.
- Idiomas: no se documentan los idiomas soportados; el entrenamiento se limita a un dataset de matematicas.
- Licencia qwen-research: restricciones de uso comercial heredadas de Qwen2.5-3B; conviene revisar los terminos enlazados en la model card antes de cualquier uso.
- Checkpoints incompletos: los pasos 1400 a 2000 aun no tienen resultados de evaluacion publicados; el estado del arte del run no esta cerrado.
- Sin estados de optimizador ni FSDP: no es posible reanudar el entrenamiento desde estos checkpoints, solo inferencia o evaluacion.
- Sin datos de benchmarks estandar: no hay resultados de MMLU, HumanEval u otros, lo que limita la comparacion con modelos de proposito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RL-Forgettting-Exp4/math-q25_3b-nobuf-kl0p01-lr3e-6
- Dataset de resultados y evaluaciones: https://huggingface.co/datasets/RL-Forgettting-Exp4/rebuttal-results-20261109/tree/main/evaluations
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
- Dataset Polaris-Dataset-53K: https://huggingface.co/datasets/POLARIS-Project/Polaris-Dataset-53K

# RL-Forgettting-Exp4/math-q25_3b-nobuf-kl0p01-lr6e-6

## Resumen

`math-q25_3b-nobuf-kl0p01-lr6e-6` es un checkpoint de investigación publicado por el colectivo RL-Forgettting-Exp4 dentro de un barrido de tasas de aprendizaje (LR sweep) sobre olvido catastrófico en aprendizaje por refuerzo. Se construye a partir de Qwen2.5-3B, un transformer denso de 3.000 millones de parámetros desarrollado por Alibaba Qwen, y se ajusta con GRPO (Group Relative Policy Optimization) mediante la librería verl sobre el conjunto de datos matemático Polaris-Dataset-53K. El resultado no es un modelo listo para producción, sino un artefacto experimental para estudiar cómo evoluciona —y se degrada— la capacidad matemática a lo largo de 2.000 pasos de entrenamiento con una tasa de aprendizaje constante de 6e-6 y un coeficiente KL de 0,01.

El modelo resuelve un problema de investigación: caracterizar el fenómeno de *RL forgetting*, es decir, la pérdida de capacidades previas (incluida la propia tarea objetivo) durante el ajuste con refuerzo. La model card documenta explícitamente once checkpoints (pasos 200 a 2000, cada 200) con evaluaciones held-out de pass@1, pass@8, pass@64 y pass@128, lo que permite trazar la curva de rendimiento y compararla con el modelo base (paso 0). Los resultados muestran que el mejor checkpoint (paso 200) apenas supera al base en pass@1 (0,1841 frente a 0,1551) y que a partir del paso 400 el rendimiento cae por debajo del base en todas las métricas, con un mínimo en el paso 600 (pass@1 de 0,0788).

La relevancia es metodológica: el repositorio ofrece checkpoints intermedios en formato bf16 safetensors, configuración y tokenizador, además de un dataset de resultados con respuestas crudas y trayectorias de aprendizaje. Es útil para investigadores que estudien estabilidad de RL, elección de hiperparámetros (LR, KL, normalización de ventajas) y dinámica de olvido, no para aplicaciones finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-3B) |
| Parametros totales | 3.000 millones (aproximado, según modelo base Qwen2.5-3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-3B soporta hasta 32.768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (los checkpoints se publican en bf16; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponibles (no se documenta en la model card; hereda los del modelo base) |
| Licencia | qwen-research (etiquetada como `other` con `license_name: qwen-research`) |
| Formato de pesos | safetensors en bf16, con config y tokenizer por subcarpeta (`global_step_N/`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B: un transformer decoder-only denso con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos. Sobre esta base se aplica un ajuste con GRPO implementado en verl, con las siguientes decisiones: sin normalización de la desviación estándar de las ventajas, sin buffer de replay, pérdida KL con coeficiente 0,01 y variante `low_var_kl` (el término KL no se incluye en la recompensa), tasa de aprendizaje del actor constante de 6e-6 sin warmup ni decaimiento, weight decay de 0,01, lote de 64 prompts con 8 rollouts por paso y mini-lote PPO de 64. Las longitudes máximas son 1.024 tokens de prompt y 3.072 de respuesta, con temperatura de rollout 1,0. El entrenamiento se ejecutó durante 2.000 pasos con semilla 1 sobre 4 GPUs H100 de 80 GB.

Los datos provienen del split de entrenamiento completo de Polaris-Dataset-53K (52.309 prompts, revisión `296f8e34132e63f4a1d70e0dcc8bddebb43f03e4`), con 800 prompts reservados para validación nativa. Los checkpoints de los pasos 200 a 1600 se convirtieron a formato Hugging Face durante el entrenamiento mediante el model merger de verl; los pasos 1800 y 2000 se fusionaron a posteriori desde los shards FSDP finales con el mismo código. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento matemático: el modelo está especializado en resolver problemas matemáticos con respuesta en formato *boxed*, evaluado con el scorer nativo del dataset Polaris.
- Razonamiento multi-paso: el entrenamiento con GRPO sobre respuestas de hasta 3.072 tokens favorece cadenas de razonamiento largas, aunque los resultados muestran degradación progresiva con los pasos.
- Capacidades heredadas del base: al derivar de Qwen2.5-3B, conserva potencialmente generación de código, matemáticas generales y multilingüismo, aunque no se documenta ninguna evaluación específica en este checkpoint.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no documentadas; dependen del modelo base.
- Modo *thinking* explícito, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre olvido catastrófico en RL: comparar la curva de pass@k entre los once checkpoints (pasos 200 a 2000) permite medir cómo la tasa de aprendizaje constante de 6e-6 afecta a la retención de capacidad matemática y validar hipótesis sobre *RL forgetting*.
- Barrido de hiperparámetros de LR: el checkpoint forma parte de un sweep más amplio; sirve como punto de referencia para contrastar con otras tasas de aprendizaje y coeficientes KL en experimentos reproducibles sobre 4×H100.
- Estudio de estabilidad de GRPO: la configuración sin normalización de ventajas y sin replay buffer permite aislar el efecto de estas decisiones sobre la varianza del entrenamiento y la degradación del rendimiento.
- Reproducción de pipelines verl: el repositorio documenta los comandos de carga con `AutoModelForCausalLM` y `AutoTokenizer` por subcarpeta, útil para validar flujos de conversión FSDP → Hugging Face.
- Análisis de calibración de pass@k: los resultados held-out con 160 muestras por pregunta y estimador no sesgado de pass@k permiten estudiar la relación entre pass@1 y pass@128 a lo largo del entrenamiento.
- Docencia y divulgación sobre RL: los checkpoints intermedios con rendimiento decreciente son un ejemplo didáctico de cómo un ajuste mal calibrado puede degradar un modelo base en todas las métricas, incluida la tarea objetivo.

## Benchmarks y rendimiento

Evaluación held-out sobre 600 preguntas Polaris, 160 muestras por pregunta (temperatura 0,6, top-p 0,95, hasta 3.072 tokens nuevos), scorer nativo de respuesta *boxed* y estimador no sesgado de pass@k. El paso 0 corresponde al modelo base.

| Paso | pass@1 | pass@8 | pass@64 | pass@128 |
|---:|---:|---:|---:|---:|
| 0 (base) | 0,1551 | 0,3940 | 0,6434 | 0,7070 |
| 200 | 0,1841 | 0,4047 | 0,6266 | 0,6899 |
| 400 | 0,1209 | 0,3268 | 0,5223 | 0,5790 |
| 600 | 0,0788 | 0,2094 | 0,3667 | 0,4169 |
| 800 | 0,1429 | 0,3139 | 0,5159 | 0,5778 |
| 1000 | 0,1511 | 0,3187 | 0,5247 | 0,5884 |
| 1200 | 0,1304 | 0,2846 | 0,4565 | 0,5139 |
| 1400 | 0,1398 | 0,2650 | 0,4094 | 0,4679 |
| 1600 | 0,1472 | 0,2901 | 0,4623 | 0,5242 |
| 1800 | 0,1262 | 0,2607 | 0,4174 | 0,4684 |
| 2000 | 0,1234 | 0,2645 | 0,4194 | 0,4724 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6-7 GB solo para los pesos (3.000 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 8 y 12 GB según longitud de contexto y lote.
- GPU recomendadas: H100 80 GB (usadas en el entrenamiento), A100 40/80 GB, L40S o RTX 4090 para inferencia en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) o RTX 4080 (16 GB) en bf16 con contexto moderado; en GPUs de 8-12 GB requeriría cuantización, no publicada en el repositorio.
- Opciones de despliegue: transformers (documentado en la model card), vLLM y TGI son compatibles con safetensors bf16; llama.cpp y Ollama requerirían conversión a GGUF, no disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | pass@1 (Polaris held-out) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| math-q25_3b-nobuf-kl0p01-lr6e-6 (paso 2000) | ~3.000 M | no disponible | 0,1234 | qwen-research | Hugging Face |
| math-q25_3b-nobuf-kl0p01-lr6e-6 (paso 200) | ~3.000 M | no disponible | 0,1841 | qwen-research | Hugging Face |
| Qwen/Qwen2.5-3B (base, paso 0) | ~3.000 M | no disponible | 0,1551 | qwen-research | Hugging Face |
| Alternativas de la misma categoría (p. ej. Llama-3.2-3B, Gemma-2-2B) | 2.000-3.000 M | no disponible | no disponible | licencias respectivas | Hugging Face |

No se dispone de datos de benchmarks estándar para comparar con modelos de propósito general del mismo tamaño; la comparación se limita al modelo base y a los propios checkpoints del run.

## Limitaciones y advertencias

- Degradación severa: todos los checkpoints a partir del paso 400 rinden por debajo del modelo base en pass@1, pass@8, pass@64 y pass@128; el paso 600 alcanza un pass@1 de 0,0788, aproximadamente la mitad del base (0,1551).
- No apto para producción: es un artefacto de investigación sobre olvido en RL, no un modelo afinado para uso final; su capacidad matemática es inferior a la del base en la mayoría de checkpoints.
- Licencia qwen-research: restringe el uso comercial; es necesario revisar los términos del modelo base Qwen2.5-3B antes de cualquier despliegue.
- Idiomas no documentados: no se especifica qué lenguas conserva tras el ajuste; el entrenamiento se centró en un dataset matemático en inglés presumiblemente, lo que puede degradar el multilingüismo del base.
- Riesgo de alucinación: no evaluado en la información disponible; los checkpoints con rendimiento degradado pueden producir razonamientos plausibles pero incorrectos con mayor frecuencia.
- Sesgos: no documentados; hereda los del modelo base Qwen2.5-3B, no caracterizados en esta model card.
- Tamaño del repositorio: 68 GB, debido a los once checkpoints bf16 completos; requiere espacio de almacenamiento considerable.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de gama baja.
- Contexto no confirmado: la model card no especifica la longitud de contexto efectiva tras el ajuste; el entrenamiento usó prompts de hasta 1.024 tokens y respuestas de hasta 3.072.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RL-Forgettting-Exp4/math-q25_3b-nobuf-kl0p01-lr6e-6
- Dataset de resultados de evaluación: https://huggingface.co/datasets/RL-Forgettting-Exp4/rebuttal-results-20261109/tree/main/evaluations
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
- Dataset Polaris-Dataset-53K: https://huggingface.co/datasets/POLARIS-Project/Polaris-Dataset-53K
- Librería verl (framework de RL): no se proporciona enlace directo en la información disponible
- Paper de GRPO: no se proporciona enlace directo en la información disponible

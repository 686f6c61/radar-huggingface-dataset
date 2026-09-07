# alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_20M_s1_2026-09-06_20-13-06_846976-pt

## Resumen

`kdyck_dose_50Mpt_hfbody_adamwppt_20M_s1_2026-09-06_20-13-06_846976-pt` es un modelo de lenguaje experimental entrenado con la librería `nanochat` de Karpathy. Se trata de un checkpoint intermedio (paso 762 de 1000) de un estudio sobre lo que el autor denomina «token dose», es decir, la cantidad de tokens de preentrenamiento y postentrenamiento necesarios para adaptar el modelo a una tarea o dominio concreto. En este caso, el modelo preentrena con 50 millones de tokens de FineWeb y después postentrena con 20 millones de tokens de un corpus Dyck (lenguaje de paréntesis balanceados con k=128), reduciendo el vocabulario de 65.536 a 256 tokens.

La arquitectura es un transformer decoder-only con 16 capas, 8 cabezas de atención y 1024 dimensiones de embedding, con ventana de contexto de 2048. No se han publicado resultados de benchmarks ni una evaluación de capacidades funcionales; es un modelo de investigación, no un sistema diseñado para producción. La licencia es Apache 2.0 y el repositorio ocupa 2,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), 16 capas, 8 cabezas, 8 KV heads, dim 1024 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (no se proporcionan pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (state_dict) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT estándar de `nanochat`. La configuración define dos variantes: `model_pt` con vocabulario de 65.536 tokens y `model_ppt` con vocabulario de 256 tokens; ambas comparten la misma profundidad y dimensiones (16 capas, 8 cabezas, 1024 embeds). El preentrenamiento se realiza sobre `fineweb-nanochatbpe-100M` (50 millones de tokens de FineWeb), y la fase de postentrenamiento sobre `dyck-k128-seq_len_2048-1B` (20 millones de tokens de Dyck con 128 pares de paréntesis y secuencias de longitud 2048).

Durante la transición entre fases se re-inicializan los embeddings y se resetea el optimizador. El scheduler de aprendizaje es trapezoidal: en preentrenamiento, `warmup_ratio = 0`, `warmdown_ratio = 0.4`, `matrix_lr = 0.02`, `embedding_lr = 0.3`; en postentrenamiento, `ppt_lr = 0.0003` y `warmdown_ratio = 0.1`. El checkpoint guardado se encuentra en el paso 762, con `smooth_train_loss = 4.186` y `min_objective = 1.225`. El entrenamiento consumió `1.0389e17` FLOPs y 121,6 segundos, con `2.08` GFLOPs por token.

## Capacidades

- No se documentan capacidades específicas de razonamiento, generación de código, matemáticas, visión, tool calling o soporte de agentes en la información disponible.
- Generación de texto limitada: el estado final usa un vocabulario de 256 tokens, incompatible con texto libre en lenguaje natural.
- Todas las métricas publicadas se limitan al loss de entrenamiento; no hay evaluaciones funcionales que permitan afirmar rendimiento en tareas concretas.

## Casos de uso

- Investigación en transferencia de conocimiento entre preentrenamiento y postentrenamiento: el modelo permite medir cuánto aportan 50M tokens de FineWeb a la adaptación posterior con 20M tokens de Dyck. Se puede comparar con réplicas sin la fase de preentrenamiento.
- Análisis de optimización con vocabularios cambiantes: la configuración documenta la re-inicialización de embeddings al reducir el vocabulario, lo que resulta útil para estudiar la dinámica del optimizador en esta transición.
- Experimentos en lenguajes formales: el corpus Dyck k=128 permite evaluar si el modelo generaliza correctamente estructuras de paréntesis balanceadas más allá de las longitudes vistas durante el entrenamiento.
- Reproducibilidad científica: el repositorio incluye configuración en JSON y estado de RNG, lo que facilita reproducir el experimento con `nanochat` y la semilla indicada.
- Docencia en arquitecturas transformer: por su tamaño pequeño, el modelo puede ejecutarse en una sola GPU y sirve para ilustrar los efectos del vocabulario y del scheduler en el entrenamiento de un decoder-only.
- Benchmark de eficiencia de entrenamiento: las métricas de FLOPs, tiempo y loss permiten calibrar costes de entrenamiento y comparar configuraciones en hardware similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas documentadas son los valores de entrenamiento: `smooth_train_loss = 4.186` y `min_objective = 1.225`.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamaño del modelo (16 capas, dim 1024), la inferencia con contexto 2048 podría ejecutarse en una GPU de 8-12 GB, pero no hay datos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, aunque el modelo es lo suficientemente pequeño para ser ejecutado en GPUs de consumo modernas con toda probabilidad.
- Opciones de despliegue: no disponible. El estado se distribuye en formato `.pt` para la librería `nanochat`; no hay contenedores ni integraciones listas para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay información suficiente para comparar este modelo con otras alternativas de la misma categoría. No se han publicado resultados de rendimiento ni características comparables.

## Limitaciones y advertencias

- El checkpoint corresponde al paso 762 de un plan de 1000 iteraciones; el entrenamiento no está completado.
- El corpus de entrenamiento es muy reducido (50M + 20M tokens), por lo que el modelo no puede competir con modelos modernos entrenados con billones de tokens.
- El vocabulario final de 256 tokens hace que el modelo solo sea apto para representaciones sobre el alfabeto Dyck, no para texto general.
- No se han evaluado sesgos, riesgos de alucinación ni comportamiento en entornos multilingües.
- No se documenta soporte para tool calling, agentes ni razonamiento multi-step.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de calidad del modelo ni recomendaciones para producción.
- El formato `.pt` y la dependencia de `nanochat` limitan su integración en stacks de despliegue estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_20M_s1_2026-09-06_20-13-06_846976-pt
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/aayo8w12
- Repositorio de `nanochat`: https://github.com/karpathy/nanochat

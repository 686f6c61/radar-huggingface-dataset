# Gospe1/Franka-TestTube-AdaSpeVLA-Expert

## Resumen

AdaSpeVLA Expert es un modelo de visión-lenguaje-acción (VLA) para control robótico de un brazo Franka, especializado en la tarea de insertar un tubo de ensayo en su gradilla. Lo publica el usuario Gospe1 en Hugging Face bajo licencia Apache 2.0. Se construye sobre el backbone PaliGemma de π0.5 y sustituye la cabeza de acción convencional por un "action expert" preentrenado (Gemma-300M con adaRMS, cargado desde `pi05_base`) que genera los puntos de control de una spline cúbica B con nudos aprendidos.

La innovación principal es la representación de acciones: en lugar de predecir comandos densos paso a paso, el modelo emite 11 puntos de control de una B-spline cúbica junto con una cabeza de temporización adaptativa que decide el intervalo de consulta (0,2–1,5 s) y cuántos comandos ejecutar antes de volver a observar. Esto reduce la frecuencia de replanificación y suaviza las trayectorias. El repositorio ocupa 15,8 GB e incluye tres checkpoints de inferencia (20k, 30k y 40k pasos de la etapa de acción, cada uno con 10.000 pasos adicionales de la cabeza de temporización).

El modelo es relevante como ejemplo de integración de un experto de acción preentrenado en un esquema de splines adaptativas, con evaluación en bucle abierto sobre datos held-out. No incluye resultados en robot real ni benchmarks estándar de VLA, y su uso requiere el código de entrenamiento de un repositorio externo (`cognaclee/Frank-Insert-Wipe`) y una versión concreta de OpenPI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA sobre backbone PaliGemma (π0.5) con action expert Gemma-300M + adaRMS; cabeza de spline cúbica B con nudos aprendidos y cabeza de temporización adaptativa |
| Parámetros totales | no disponible (el action expert es de 300M; el total del modelo no se especifica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoints en bfloat16 para backbone, action expert y knot head; float32 para la cabeza de temporización) |
| Idiomas soportados | no disponible (el prompt de la tarea está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint OpenPI/Orbax (`params/` con parámetros EMA) y `norm_stats.json` |

## Arquitectura y entrenamiento

El modelo parte de π0.5 (backbone PaliGemma) y utiliza un action expert de tipo Gemma-300M con adaRMS cargado desde `pi05_base` (`generator="pi05_expert"`). La salida de acción se parametriza como una B-spline cúbica con 11 puntos de control y nudos aprendidos; la información de los nudos entra en cada token de punto de control mediante una proyección `cp_knot_proj` inicializada a cero. La convención de flujo es la de π0.5 (`x_t = t·noise + (1−t)·data`, con `t ~ Beta(1.5,1)`) y se usan 10 pasos de ODE. Una cabeza de temporización separada predice el intervalo de consulta y el número de pasos a ejecutar.

El entrenamiento consta de dos etapas. La etapa de acción se ejecuta durante 40.000 pasos con los valores por defecto de OpenPI (AdamW, warmup coseno de 1k pasos, pico 2,5e-5, decay 30k, EMA 0,99, batch 32, 4 GPUs con FSDP) y fine-tuning completo desde `pi05_base`. La cabeza de temporización se entrena 10.000 pasos adicionales desde los checkpoints de 20k, 30k y 40k, entrenando solo esa cabeza. Los datos provienen del dataset `dddddsds31341/test-tube-lerobot` (commit `29d821a`), usando 89 de 99 episodios; los episodios [1, 3, 7, 17, 25, 28, 47, 57, 76, 80] se reservan para evaluación. La receta usa chunks de 16 pasos (1,5 s a 10 Hz), 11 puntos de control, intervalo de consulta de 0,2–1,5 s y etiquetas de temporización y nudos derivadas del movimiento medido y del estado comandado del gripper.

## Capacidades

- Generación de acciones robóticas de 6 grados de libertad más gripper para la tarea de inserción de tubo de ensayo en gradilla.
- Representación de acciones mediante spline cúbica B con 11 puntos de control, lo que produce trayectorias suaves y compactas.
- Temporización adaptativa: predice el intervalo de consulta y el número de comandos a ejecutar antes de replanificar.
- Condicionamiento por prompt en lenguaje natural: la tarea se especifica con la instrucción `Place the test tube into the test tube rack.`
- Entrada multimodal de visión (observaciones del robot) y lenguaje, integrada en el backbone PaliGemma.
- Inferencia en bucle cerrado con `model.sample_spline(rng, observation)`, que devuelve `dense_actions`, `query_interval` y `execute_steps`.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni audio.

## Casos de uso

- Automatización de manipulación de precisión en laboratorio: el modelo ejecuta la inserción de un tubo de ensayo en una gradilla sobre un brazo Franka, con comandos de delta en el marco del cuerpo a 10 Hz y replanificación adaptativa.
- Investigación en representaciones de acción: sirve como referencia para comparar splines con nudos aprendidos frente a cabezas de flujo densas (159M y 421M) en la misma tarea y partición de datos.
- Estudio de temporización adaptativa en políticas VLA: la cabeza de temporización permite analizar el compromiso entre frecuencia de replanificación y suavidad de trayectoria en tareas de inserción.
- Base para fine-tuning en tareas de ensamblaje similares: al partir de `pi05_base` y usar OpenPI, puede reentrenarse con nuevos datasets LeRobot y una entrada nueva en `tasks.py`.
- Evaluación en bucle abierto de políticas robóticas: los checkpoints y el `norm_stats.json` permiten reproducir las métricas R² publicadas sobre los episodios held-out.
- Prototipado de pipelines de inferencia Orbax/Flax en robótica: el código de carga incluido en la model card sirve para integrar checkpoints Orbax en modelos NNX con mapeo explícito de claves.

## Benchmarks y rendimiento

Evaluación en bucle abierto sobre 1.024 fotogramas, con acciones normalizadas sobre el chunk de 16 pasos. R² relativo a predecir la media por dimensión.

Episodios held-out:

| Modelo | R² x | R² y | R² z | R² rx | R² ry | R² rz | R² grip | Precisión de signo del gripper | MAE / corr. de intervalo |
|---|---|---|---|---|---|---|---|---|---|
| step-20000 | 0,41 | 0,82 | 0,76 | 0,16 | 0,13 | 0,15 | 0,61 | 91,6% | 0,338 s / 0,49 |
| step-30000 | 0,40 | 0,83 | 0,77 | 0,17 | 0,14 | 0,16 | 0,63 | 92,1% | 0,335 s / 0,49 |
| step-40000 | 0,41 | 0,83 | 0,78 | 0,18 | 0,15 | 0,16 | 0,64 | 92,3% | 0,336 s / 0,49 |

Fotogramas de entrenamiento:

| Modelo | R² x | R² y | R² z | R² rx | R² ry | R² rz | R² grip | Precisión de signo del gripper | MAE / corr. de intervalo |
|---|---|---|---|---|---|---|---|---|---|
| step-20000 | 0,95 | 0,99 | 0,97 | 0,92 | 0,94 | 0,93 | 0,96 | 99,1% | 0,244 s / 0,75 |
| step-30000 | 0,97 | 0,99 | 0,99 | 0,96 | 0,97 | 0,97 | 0,98 | 99,7% | 0,240 s / 0,76 |
| step-40000 | 0,98 | 0,99 | 0,99 | 0,97 | 0,98 | 0,97 | 0,99 | 99,8% | 0,241 s / 0,76 |

Mismos fotogramas held-out, otros modelos con la misma receta y partición:

| Modelo | R² x | R² y | R² z | R² rx | R² ry | R² rz | R² grip | Precisión de signo del gripper | MAE / corr. de intervalo |
|---|---|---|---|---|---|---|---|---|---|
| flow head 159M, 20k (single-task) | 0,40 | 0,82 | 0,73 | 0,12 | 0,12 | 0,20 | 0,59 | 92,0% | 0,329 s / 0,52 |
| flow head 421M, 20k (single-task) | 0,38 | 0,81 | 0,72 | 0,11 | 0,09 | 0,16 | 0,57 | 91,2% | 0,329 s / 0,49 |
| expert, co-entrenamiento 5 tareas 40k | 0,43 | 0,84 | 0,77 | 0,16 | 0,13 | 0,20 | 0,64 | 92,1% | 0,343 s / 0,52 |
| expert, co-entrenamiento 5 tareas 60k | 0,45 | 0,84 | 0,77 | 0,16 | 0,14 | 0,23 | 0,64 | 92,2% | 0,338 s / 0,52 |

No se incluyen resultados en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 15,8 GB e incluye tres checkpoints; un único checkpoint en bfloat16 requiere del orden de varios GB, pero el autor no publica cifras de VRAM.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 4 GPUs y FSDP, pero no se especifica el modelo de GPU.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: inferencia mediante OpenPI `215abfb` y el código `code/adaspe_train` de `cognaclee/Frank-Insert-Wipe` @ `037c782`, con JAX/Flax NNX y carga de checkpoints Orbax. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La política emite comandos delta a 10 Hz y replanifica según el intervalo predicho por la cabeza de temporización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (held-out, R² grip / signo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdaSpeVLA Expert (este modelo) | action expert 300M; total no disponible | no disponible | 0,64 / 92,3% (step-40000) | Apache 2.0 | Hugging Face |
| Flow head 159M, 20k (single-task) | 159M (cabeza) | no disponible | 0,59 / 92,0% | no disponible | misma receta, referencia en la model card |
| Flow head 421M, 20k (single-task) | 421M (cabeza) | no disponible | 0,57 / 91,2% | no disponible | misma receta, referencia en la model card |
| Expert, co-entrenamiento 5 tareas 60k | action expert 300M | no disponible | 0,64 / 92,2% | no disponible | misma receta, referencia en la model card |

## Limitaciones y advertencias

- Solo se ha evaluado en bucle abierto; no hay resultados en robot real, por lo que el rendimiento en hardware no está validado.
- Especializado en una única tarea (inserción de tubo de ensayo en gradilla) y en un único robot (Franka); no es un modelo generalista.
- El R² en orientaciones held-out es bajo (0,15–0,18), lo que indica poca capacidad de generalización en componentes rotacionales.
- La precisión de signo del gripper en held-out es del 92,3%, con errores en aproximadamente 1 de cada 13 predicciones.
- El MAE del intervalo de temporización en held-out es de 0,336 s con correlación 0,49, lo que refleja una predicción de temporización moderadamente imprecisa.
- Requiere el código de entrenamiento de un repositorio externo y una versión concreta de OpenPI; la carga de parámetros falla con `cfg.load(restore_params(...))` y exige el mapeo manual documentado.
- Riesgo de alucinación y sesgos: no documentado por el autor.
- Antes de usar en hardware hay que validar el orden de las observaciones, las unidades, la normalización y los límites del espacio de trabajo en un entorno controlado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin revisión comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Gospe1/Franka-TestTube-AdaSpeVLA-Expert
- Dataset: https://huggingface.co/datasets/dddddsds31341/test-tube-lerobot
- Código de entrenamiento: `cognaclee/Frank-Insert-Wipe` @ `037c782` (no se proporciona URL directa)
- OpenPI @ `215abfb` (no se proporciona URL directa)
- Checkpoint base π0.5: `pi05_base` (no se proporciona URL directa)
- Baseline π0.5 de referencia: `dddddsds31341/Franka-Test-Tube-pi05-step-20000` (no se proporciona URL directa)

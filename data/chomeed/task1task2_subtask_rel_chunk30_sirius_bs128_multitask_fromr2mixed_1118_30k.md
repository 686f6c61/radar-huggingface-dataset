# chomeed/task1task2_subtask_rel_chunk30_sirius_bs128_multitask_fromR2mixed_1118_30k

## Resumen

El modelo `chomeed/task1task2_subtask_rel_chunk30_sirius_bs128_multitask_fromR2mixed_1118_30k` es un checkpoint de política robótica basado en pi0.5 (pi05) desarrollado por el usuario chomeed, entrenado con el framework LeRobot 0.6.2 y el plugin `lerobot_policy_pi05_subtask`. Se trata de un fine-tuning multitarea que parte de `lerobot/pi05_base` (vía el checkpoint intermedio `chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_R2_10k`) y que resuelve tres tareas de manipulación sobre el robot Hyundai Duet: inserción de placa en módulo de control, inserción de cable y empuje del módulo al centro de la mesa.

La arquitectura es la de pi0.5: un VLM tipo PaliGemma que predice el subtask actual tras el prompt y un "action expert" que condiciona la generación de acciones sobre esa predicción. El modelo consume tres cámaras (d405_left, d405_right, zed_mini) y un estado de 24 dimensiones, y produce chunks de 30 acciones de 11 dimensiones relativas al estado actual. El entrenamiento se realizó durante 30.000 updates del optimizador (60.000 pasos de bucle con acumulación de gradiente 2) sobre el dataset `chomeed/hyundai_duet_multitask_task1_task2`, con una pérdida final de 0,002.

Es relevante porque demuestra el patrón de predicción explícita de subtasks en políticas VLA (vision-language-action), con enrutado multitarea mediante prompt de tarea, normalización por tarea y muestreo balanceado por grupo. El checkpoint tiene 4.143.404.816 parámetros y ocupa 16,6 GB en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (VLM PaliGemma + action expert flow-matching) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente bf16/fp32) |
| Idiomas soportados | no disponible (modelo de robótica, prompts en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Framework | LeRobot 0.6.2 `pi05_subtask` (plugin `lerobot_policy_pi05_subtask`, rama `multitask`) |
| Modelo base | lerobot/pi05_base (vía checkpoint intermedio R2 10k) |
| Entradas | 3 cámaras (d405_left, d405_right, zed_mini) + estado 24-D |
| Salidas | acción 11-D, chunk de 30 (n_action_steps 30) |
| Espacio de acciones | relativo al estado actual (use_relative_actions=true), excepto gripper_r_closed y joints `*_cable` |
| Tamaño del repo | 16,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5: un backbone VLM (PaliGemma) que recibe el prompt de tarea, el estado y las imágenes, y que primero genera el subtask actual mediante decodificación greedy con la LM head. Después, un action expert condiciona la generación de acciones sobre ese subtask usando flow matching con 10 pasos de flujo. El formato de prompt es `Task: {task}, State: {dims};\nSubtask: {subtask};\nAction:`. La pérdida combina flow matching y entropía cruzada del subtask con peso 0,1.

El entrenamiento se realizó sobre el dataset `chomeed/hyundai_duet_multitask_task1_task2` con AdamW, learning rate pico 1e-05, warmup de 2000 pasos y decaimiento coseno hasta 2,5e-06, en precisión bf16 con pesos maestros fp32 y gradient checkpointing. El muestreo por lotes es estratificado por grupo de tarea con proporciones fijas: board 40 %, cable grasp 30 %, GRC push 20 %, GRC return 10 %. Dentro del grupo board se mantienen las ratios SIRIUS del run base (intervención 40 %, demo 50 %, robot 10 %, con demos GRC de episodios 63-122 sobrerrepresentadas x1,2). La normalización es específica por tarea: las dimensiones de board conservan las estadísticas del checkpoint base y las de cable usan cuantiles sobre ambos datasets de cable, con normalización del estado del brazo por tarea mediante el paso task-space del preprocesador.

## Capacidades

- Predicción explícita de subtask antes de cada acción, con decodificación greedy sobre la LM head de PaliGemma.
- Generación de acciones robóticas en chunks de 30 pasos, con acciones relativas al estado actual para las articulaciones del brazo.
- Multitarea con enrutado por prompt de tarea: tres tareas distintas seleccionables mediante texto (`insert the board into the control module`, `insert the cable into the control module`, `push the control module to the center of the table`).
- Percepción multi-cámara: consume tres vistas (d405_left, d405_right, zed_mini), redimensionadas con padding a 224x224.
- Manejo de estado heterogéneo de 24 dimensiones con subconjuntos distintos por tarea (18 dims para board, 13 dims para cable).
- Soporte de joints de mano con canales separados para board (`right_thumb_joint1`, etc.) y cable (`*_cable`), además de tres taxels (`right_index_tactile_0/1/2`).
- No se documenta soporte de tool calling, agentes multi-paso, capacidades multilingües ni thinking mode.

## Casos de uso

- Inserción de placa en módulo de control en línea de ensamblaje: el modelo recibe el prompt `insert the board into the control module` y ejecuta la secuencia de subtasks (grasp, giro de cabeza, inserción, retorno a pose de reposo) condicionando cada chunk de 30 acciones sobre el subtask predicho.
- Inserción de cable en módulo de control: con el prompt `insert the cable into the control module` y estado de 13 dimensiones (incluyendo joints `*_cable` y taxels), el modelo ejecuta el agarre del cable como subtask único.
- Empuje del módulo al centro de la mesa: con el prompt `push the control module to the center of the table`, el modelo predice los subtasks de empuje y retorno a pose de reposo (este último a velocidad x2 mediante DemoSpeedup).
- Investigación en políticas VLA con predicción de subtasks: sirve como referencia reproducible para estudiar cómo la predicción explícita de subtask condiciona la generación de acciones en flow matching.
- Evaluación de entrenamiento multitarea con enrutado por prompt: el modelo permite comparar el rendimiento por tarea bajo un único conjunto de pesos, útil para estudiar interferencia entre tareas y balanceo de datos.
- Reentrenamiento con DAgger sobre tareas específicas: el checkpoint parte de un run con rondas DAgger 1-2 en board insertion, por lo que es un punto de partida natural para añadir nuevas rondas de corrección humana.
- Benchmark de generalización de políticas robóticas en el robot Hyundai Duet: al estar entrenado con datos de Yonsei y GRC, permite evaluar transferencia entre entornos de recogida de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de entrenamiento en el paso 30.000: 0,002. El autor enlaza un run de Weights & Biases (`pxedjx4b`) que puede contener curvas de entrenamiento, pero no se proporcionan métricas de éxito en tareas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4.143 millones de parámetros en bf16, los pesos ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB (coincide con el tamaño del repo). A ello hay que sumar el estado del optimizer si se reentrena y las activaciones de las tres cámaras.
- GPU de entrenamiento reportada: 1x B200 con batch 64 por GPU y acumulación de gradiente 2 (batch efectivo 128 por update).
- GPU recomendadas para inferencia: no disponibles en la documentación. Por tamaño, cabría en GPUs con 16-24 GB en bf16, aunque no se confirma compatibilidad con consumer.
- ¿Cabe en consumer GPU?: probablemente sí en bf16 en GPUs de 24 GB (RTX 3090/4090) por el tamaño de pesos, pero no se documenta ni se garantiza.
- Opciones de despliegue: LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_subtask` (rama `multitask`) y `lerobot_sirius`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son frameworks de LLM, no de políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chomeed/task1task2_..._30k (este) | 4.143 M | no disponible | Manipulación robótica multitarea (Hyundai Duet) | no disponible | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | Política VLA base (pi0.5) | no disponible | Hugging Face (modelo base) |
| chomeed/board_insertion_merged_pi05_subtask_..._R2_10k | no disponible | no disponible | Inserción de placa (checkpoint intermedio) | no disponible | Hugging Face (checkpoint previo) |

No se dispone de datos de benchmarks ni de parámetros detallados de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre tres tareas concretas sobre el robot Hyundai Duet; no es un modelo de propósito general.
- Dependencia estricta del formato de prompt, del orden y subconjunto de dimensiones del estado, y de las cámaras de entrada. Un prompt o un vector de estado mal formados producirán acciones incorrectas.
- Las dimensiones de estado no usadas por cada tarea deben rellenarse con cualquier valor finito (p. ej. 0); el preprocesador las sustituye y las excluye de la pérdida, pero un uso incorrecto puede degradar el comportamiento.
- Licencia no disponible: no se puede confirmar el uso comercial. Verificar antes de cualquier despliegue en producción.
- Riesgo de alucinación de subtask: la predicción greedy del subtask puede desviarse si la escena difiere de la distribución de entrenamiento (Yonsei + GRC).
- Sin datos publicados de tasa de éxito, robustez ante perturbaciones ni generalización a nuevos objetos o posiciones.
- Sin información sobre sesgos demográficos o culturales (no aplica de forma directa, pero tampoco se documenta nada al respecto).
- El checkpoint se entrenó con gradient checkpointing y bf16; la inferencia en otras precisiones no está validada.
- Fecha de creación del repositorio: 2026-11-19 (posterior a la fecha actual de referencia); tener en cuenta por si se trata de un artefacto con metadatos anómalos.

## Enlaces

- Hugging Face: https://huggingface.co/chomeed/task1task2_subtask_rel_chunk30_sirius_bs128_multitask_fromR2mixed_1118_30k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoint intermedio: https://huggingface.co/chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_R2_10k
- Dataset de entrenamiento: https://huggingface.co/datasets/chomeed/hyundai_duet_multitask_task1_task2
- Plugin LeRobot: https://github.com/HDR-SRL/lerobot_policy_pi05_subtask/tree/multitask
- Run de entrenamiento (Weights & Biases): https://wandb.ai/meeroro56/hyundai_duet/runs/pxedjx4b

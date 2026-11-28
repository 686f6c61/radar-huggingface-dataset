# chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft_bs64_1128_15k

## Resumen

Este repositorio contiene un checkpoint de robótica basado en pi0.5 (pi05), el modelo vision-language-action (VLA) de Physical Intelligence, adaptado con la extensión FoveaVLA y afinado por el usuario chomeed sobre el modelo base `lerobot/pi05_base`. El modelo resuelve una tarea concreta de manipulación robótica bimanual (task2) sobre el robot Hyundai Duet, con predicción de subtareas de alto nivel y mecanismo de foveación (recortes de imagen por cámara). No es un modelo de lenguaje general: es una política de control que mapea observaciones multimodales (6 cámaras más un vector de estado de 18 dimensiones) a acciones de 18 dimensiones.

El checkpoint corresponde al paso 15.000 de 30.000 actualizaciones del optimizador, es decir, está a mitad de entrenamiento. Se ha afinado con datos de demostraciones humanas y cuatro rondas de DAgger (intervenciones humanas correctivas), con una receta de muestreo ponderado por clase (SIRIUS) que prioriza demostraciones (50 %) e intervenciones (40 %) frente a rollouts autónomos (10 %). El entrenamiento se realizó en 2 GPU B200 con batch efectivo de 64 y precisión bf16.

Es relevante porque documenta un pipeline completo de VLA con predicción jerárquica de subtareas y atención foveada, una técnica que reduce el coste computacional al procesar recortes de alta resolución solo donde el robot necesita precisión. El modelo tiene 4.145.521.424 parámetros y un repositorio de 16,6 GB, y su uso está restringido al ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi0.5 con extensión FoveaVLA; transformer con experto de acciones condicionado por subtarea |
| Parametros totales | 4.145.521.424 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | no disponible (modelo de robótica; los prompts de subtarea están en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y aplica el framework LeRobot 0.6.2 con la política `pi05_foveavla_subtask` (repositorio `HDR-SRL/lerobot_foveavla`, rama `stage-views`) más `lerobot_sirius`. La arquitectura combina un VLM que primero genera la subtarea actual en texto (por ejemplo, "grasp the board with the right hand" o "insert the board into the control module") y un experto de acciones que se condiciona sobre esa subtarea. Además, tras la respuesta textual, cuatro slots de caja por cámara (zed_mini, d405_left, d405_right) predicen la caja de cada cámara en t+8 mediante 4 clases sobre 1024 bins; el experto de acciones nunca ve estas cajas. La foveación se implementa con vistas recortadas por cámara: en subtareas de tipo grasp/turn the head el recorte se enmascara en la atención (como una cámara ausente) y solo se usan los fotogramas completos; en insert se usa exactamente la caja de la consulta anterior estirada al tamaño del recorte.

Los datos de entrenamiento provienen de `HDR-AI-tmp/hyundai_duet_task2` y de ocho datasets de DAgger (rondas 1 a 4 para las subtareas 2 y 3). La ronda 4 añade 50 episodios y 189.640 fotogramas para la subtarea 2, y 50 episodios y 153.584 fotogramas para la subtarea 3. El muestreo SIRIUS fija proporciones por clase independientemente de su tamaño: 50 % demostraciones (243.883 fotogramas, 18,7 % del total), 40 % intervenciones (602.299 fotogramas, 46,2 %), 0 % pre-intervención (124.294 fotogramas, 9,5 %) y 10 % rollouts autónomos (334.299 fotogramas, 25,6 %). El optimizador es AdamW con lr pico 1e-5, warmup de 1000 pasos y decaimiento coseno hasta 2,5e-6 en 30.000 pasos; se usa bf16 con pesos maestros en fp32 y gradient checkpointing. La pérdida en el paso 15.000 es 0,118. Las acciones son relativas al estado actual (use_relative_actions=true), salvo cuatro articulaciones que se mantienen absolutas (right_index_joint2, right_index_joint3, left_index_joint2, left_index_joint3); la salida es un chunk de 50 acciones con n_action_steps=30.

## Capacidades

- Predicción de subtareas de alto nivel en texto a partir del prompt y las observaciones visuales.
- Generación de acciones de control de 18 dimensiones en chunks de 50 pasos (30 ejecutados).
- Procesamiento multimodal de 6 cámaras (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right) más estado de 18 dimensiones.
- Foveación selectiva: atención sobre recortes de imagen por cámara con predicción de cajas a t+8.
- Control bimanual con acciones relativas al estado actual y articulaciones absolutas para los dedos índice.
- Aprendizaje por imitación con DAgger: integra correcciones humanas en el entrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo general ni visión fuera del contexto robótico.

## Casos de uso

- Manipulación bimanual de tableros en el robot Hyundai Duet: el modelo ejecuta la tarea task2 (agarrar, girar la cabeza e insertar el tablero en el módulo de control) con política entrenada específicamente para esa secuencia.
- Investigación en aprendizaje por imitación con DAgger: sirve como checkpoint intermedio para estudiar la evolución de la pérdida y el efecto de las rondas de intervención humana en políticas VLA.
- Estudio de foveación en VLA: permite analizar cómo afecta el enmascaramiento de recortes en subtareas de tipo grasp frente al uso de cajas en subtareas de inserción.
- Evaluación de muestreo ponderado SIRIUS: útil para reproducir experimentos sobre el equilibrio entre demostraciones, intervenciones y rollouts autónomos en el entrenamiento de políticas.
- Base para fine-tuning en tareas de inserción de precisión: el mecanismo de cajas por cámara y el chunk de 50 acciones lo hacen adecuado para tareas que requieren alineación fina.
- Reproducción de pipelines LeRobot: integrable con `lerobot_policy_pi05_foveavla` para validar la carga de procesadores de normalización y la inferencia con las estadísticas almacenadas en `policy_preprocessor_*` y `policy_postprocessor_*`.
- Docencia y divulgación sobre VLA: ejemplo real de receta de entrenamiento (batch, lr, precisión, pérdida) para explicar el ciclo completo de un modelo de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es la pérdida de entrenamiento en el paso 15.000: 0,118 (combinación de flow matching y cross-entropy de subtarea, con peso 0,1 para la CE de subtarea y 0,1 para la CE de cajas en subtareas de inserción).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4.145 millones de parámetros, en bf16 los pesos ocupan aproximadamente 8,3 GB, a los que hay que sumar activaciones y los seis flujos de cámara.
- GPU de entrenamiento documentadas: 2 × B200 con batch de 32 por GPU y acumulación de gradiente 1 (DDP).
- GPU recomendadas para inferencia: no disponibles; por tamaño, cabría en GPUs de 24 GB o más en bf16, pero no se confirma en la información.
- ¿Cabe en GPU consumer? Probablemente en RTX 4090 (24 GB) en bf16, aunque no está verificado ni documentado.
- Opciones de despliegue: LeRobot 0.6.2 con `lerobot_policy_pi05_foveavla` (instalable vía `pip install git+https://github.com/HDR-SRL/lerobot_fo...` según el README truncado); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft_bs64_1128_15k) | 4.145 M | no disponible | VLA bimanual con subtareas y foveación | no disponible | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA base pi0.5 | no disponible | Hugging Face |
| chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_30k | no disponible | no disponible | Etapa previa (30k updates, DAgger rondas 1-3) | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 15.000 de 30.000 actualizaciones; el modelo no está terminado y su rendimiento final puede diferir.
- Especialización extrema: entrenado exclusivamente para task2 del robot Hyundai Duet; no es un modelo general y no se espera que funcione en otras tareas o robots.
- Entrada muy específica: requiere exactamente 6 cámaras con los nombres indicados y un estado de 18 dimensiones; cualquier desviación en la configuración de sensores invalida la inferencia.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor antes de cualquier despliegue en producción.
- Idiomas: los prompts de subtarea están en inglés y no se documenta soporte multilingüe.
- Riesgo de alucinación en la subtarea: el VLM puede predecir una subtarea incorrecta, y el experto de acciones se condiciona sobre ella, propagando el error.
- Dependencia de la foveación: en subtareas de inserción, el recorte se basa en la caja de la consulta anterior; una caja mal predicha degrada la precisión.
- Normalización fijada: las estadísticas de normalización provienen del init y están almacenadas en los procesadores del repo; cargar el modelo sin ellos produce resultados incorrectos.
- Sin benchmarks públicos ni métricas de éxito en tarea: no se puede evaluar objetivamente su calidad frente a alternativas.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft_bs64_1128_15k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoint previo (etapa 30k): https://huggingface.co/chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_30k
- Repositorio de código: https://github.com/HDR-SRL/lerobot_foveavla/tree/stage-views
- Dataset principal: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Dataset DAgger subtarea 2 ronda 1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r1
- Dataset DAgger subtarea 2 ronda 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r2
- Dataset DAgger subtarea 2 ronda 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r3
- Dataset DAgger subtarea 2 ronda 4: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r4
- Dataset DAgger subtarea 3 ronda 1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r1
- Dataset DAgger subtarea 3 ronda 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r2
- Dataset DAgger subtarea 3 ronda 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r3
- Dataset DAgger subtarea 3 ronda 4: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r4
- Run de entrenamiento en W&B: https://wandb.ai/meeroro56/hyundai_duet/runs/3qz9lxzh

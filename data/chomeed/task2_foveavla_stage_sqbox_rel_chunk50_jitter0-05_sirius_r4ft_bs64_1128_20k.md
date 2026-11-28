# chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft_bs64_1128_20k

## Resumen

`chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft_bs64_1128_20k` es un checkpoint de política robótica (VLA, vision-language-action) derivado de `lerobot/pi05_base` y aumentado con la técnica FoveaVLA, que añade predicción de subtareas de alto nivel y foveación (recortes de cámara condicionados por la subtarea actual). Lo publica el usuario `chomeed` sobre la librería LeRobot 0.6.2, con una rama específica (`stage-views`) del repositorio `lerobot_foveavla` y el plugin `lerobot_sirius`. El modelo está pensado para ejecutar la tarea 2 de un banco de manipulación bimanual denominado "hyundai_duet", con seis cámaras de entrada y un espacio de acciones de 18 dimensiones.

Se trata de un fine-tune de la ronda 4 de DAgger sobre un checkpoint previo (30k actualizaciones de la etapa de foveación), entrenado hasta 20.000 actualizaciones de optimizador de un total previsto de 30.000. El modelo no es un LLM de propósito general: es una política de control robótico que combina un VLM (que escribe la subtarea actual tras el prompt) con un "action expert" que genera trayectorias en chunks de 50 pasos. La relevancia es acotada al contexto de investigación en el que se publica: no hay model card de benchmarks, ni licencia declarada, ni idiomas, ni descargas.

El checkpoint tiene 4.145.521.424 parámetros (según safetensors) y un repositorio de 16,6 GB. La nomenclatura del nombre resume la receta: `stage` (foveación por etapas), `sqbox` (cajas cuadradas), `rel` (acciones relativas), `chunk50` (chunks de 50), `jitter0.05` (aumento de datos), `sirius` (muestreo por clases), `r4ft` (fine-tune DAgger ronda 4), `bs64` (batch 64), `1128` (fecha) y `20k` (pasos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 (`pi05_foveavla_subtask`): VLM + action expert con flow matching; foveación por recortes de cámara y predicción de subtarea |
| Parametros totales | 4.145.521.424 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5 de LeRobot: un modelo vision-language que procesa seis cámaras (`d405_left`, `d405_right`, `zed_mini`, `fovea_zed_mini`, `fovea_d405_left`, `fovea_d405_right`) y un estado de 18 dimensiones, y un "action expert" que genera acciones mediante flow matching en chunks de 50 pasos (con `n_action_steps` = 30). La variante FoveaVLA introduce dos mecanismos: (1) el VLM escribe primero la subtarea actual (por ejemplo, "grasp the board with the right hand", "turn the head to the center", "insert the board into the control module") y el action expert condiciona sobre ella; (2) cuatro slots de caja por cámara (`zed_mini`, `d405_left`, `d405_right`) predicen la caja de cada cámara en t+8 (4 clases sobre 1024 bins). Las acciones son relativas al estado actual, salvo cuatro articulaciones que se mantienen absolutas (`right_index_joint2`, `right_index_joint3`, `left_index_joint2`, `left_index_joint3`).

El entrenamiento parte de `lerobot/pi05_base` y se estructura en dos etapas: una etapa de foveación de 30k actualizaciones (checkpoint `chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_30k`) entrenada sobre demos de subtareas 2 y 3 más rondas DAgger 1-3, y este fine-tune de ronda 4 que añade 50 episodios de subtarea 2 (189.640 frames) y 50 de subtarea 3 (153.584 frames). Se usa AdamW con lr pico 1e-5, warmup 1000 y decaimiento coseno hasta 2.5e-6 en 30.000 pasos, precisión bf16 con pesos maestros fp32, gradient checkpointing, batch efectivo 64 (32 por GPU en 2× B200, DDP). El muestreo SIRIUS reparte las clases con ratios fijos: 50% demos humanas, 40% frames de intervención, 0% pre-intervención (3 s previos) y 10% rollouts autónomos. La pérdida en el paso 20.000 es 0,104. Las estadísticas de normalización son las del checkpoint inicial y están guardadas en los safetensors `policy_preprocessor_*` y `policy_postprocessor_*`.

## Capacidades

- Control robótico bimanual de manipulación: genera acciones de 18 dimensiones en chunks de 50 pasos (30 ejecutados) a partir de observaciones de seis cámaras y un estado de 18-D.
- Predicción de subtareas de alto nivel: el VLM escribe la subtarea actual tras el prompt, y el action expert condiciona sobre ella.
- Foveación condicionada por subtarea: recortes por cámara (`zed_mini`, `d405_left`, `d405_right`) que se enmascaran o se rellenan según la etapa (en "grasp"/"turn the head" se enmascaran; en "insert" se usa la caja de la consulta anterior estirada al tamaño del recorte).
- Predicción de cajas futuras: cuatro slots por cámara predicen la caja en t+8 (4 clases sobre 1024 bins); el action expert no las ve.
- Acciones relativas al estado actual con cuatro articulaciones absolutas.
- Soporte de inferencia con LeRobot 0.6.2 y el plugin `lerobot_policy_pi05_foveavla`.
- No se documenta soporte de tool calling, agentes multi-paso genéricos, multilingüismo ni modalidades de audio.

## Casos de uso

- Manipulación bimanual de precisión en el banco "hyundai_duet": el modelo está entrenado específicamente para la tarea 2 (subtareas 2 y 3) y genera trayectorias de 50 pasos con acciones relativas, adecuado para tareas de ensamblaje con dos brazos y múltiples cámaras.
- Recogida y colocación de tableros ("grasp the board with the right hand"): la predicción de subtarea permite al policy anticipar la fase de agarre y condicionar el action expert sobre ella, útil en pipelines de pick-and-place con agarre bimanual.
- Inserción en módulo de control ("insert the board into the control module"): la foveación con recorte por cámara y predicción de caja en t+8 ayuda a mantener el objeto de interés en el campo de visión durante inserciones finas.
- Investigación en DAgger y aprendizaje por intervención humana: el modelo está entrenado con ratios SIRIUS (50% demo, 40% intervención, 10% robot) y sirve como punto de partida para nuevas rondas de DAgger sobre el mismo banco.
- Estudio de foveación y atención selectiva en VLAs: la arquitectura enmascara recortes vacíos y condiciona la vista de recorte a la subtarea, lo que permite experimentar con políticas de atención visual en robótica.
- Evaluación de generalización a partir de checkpoints intermedios: al ser un checkpoint de 20k/30k, permite comparar el efecto de continuar el entrenamiento frente a la versión final.
- Reproducción de experimentos con LeRobot: la model card incluye el comando de entrenamiento (`--policy.type=pi05_foveavla_subtask --policy.pretrained_path=lerobot/pi05_base`) y los flags SIRIUS, lo que facilita replicar la receta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia, el entrenamiento usó 2× B200 con 32 muestras por GPU y gradient checkpointing; el repo pesa 16,6 GB en safetensors, lo que da una cota inferior orientativa para cargar los pesos en precisión de entrenamiento.
- GPU recomendadas: el entrenamiento se hizo en NVIDIA B200; no se documentan requisitos mínimos de inferencia.
- ¿Cabe en GPU consumer? No disponible. Con 4.145 millones de parámetros, una carga en bf16 requeriría del orden de 8 GB solo para pesos, más activaciones y buffers de flow matching; no hay confirmación oficial.
- Opciones de despliegue: LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_foveavla` (rama `stage-views` de `lerobot_foveavla`) y `lerobot_sirius`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`task2_foveavla_stage_..._20k`) | 4.145.521.424 | no disponible | VLA bimanual, tarea 2 hyundai_duet | no disponible | Hugging Face, 0 descargas |
| `chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_30k` | no disponible | no disponible | Etapa previa de foveación (30k) | no disponible | Hugging Face |
| `lerobot/pi05_base` | no disponible | no disponible | VLA base pi0.5 | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de parámetros de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado solo para la tarea 2 del banco "hyundai_duet" (subtareas 2 y 3); no es un VLA de propósito general ni un LLM.
- Checkpoint intermedio: 20.000 de 30.000 actualizaciones; el autor lo etiqueta explícitamente como checkpoint parcial, no como versión final.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial queda sin autorización explícita.
- Sin idiomas ni benchmarks publicados: no hay evaluación cuantitativa de éxito en tarea, ni datos de robustez fuera de la distribución de entrenamiento.
- Dependencia de hardware y software muy concretos: seis cámaras específicas (`d405_left`, `d405_right`, `zed_mini`, `fovea_zed_mini`, `fovea_d405_left`, `fovea_d405_right`), estado de 18-D, LeRobot 0.6.2 y ramas concretas de repositorios; la reproducibilidad exige respetar la receta exacta.
- Normalización heredada del checkpoint inicial: las estadísticas de pre/postprocesado están en safetensors del repo; cargar el policy sin sus procesadores produce resultados incorrectos.
- Riesgo de sobreajuste a las condiciones del banco: los ratios SIRIUS y la composición de datos (demos, intervenciones, rollouts) están fijados; cambios en la distribución de escenas o en el hardware pueden degradar el rendimiento.
- Riesgo de alucinación en la subtarea predicha: el VLM puede escribir una subtarea incorrecta y condicionar erróneamente al action expert; no se documenta mecanismo de verificación.
- Sin datos de sesgos: no se han publicado análisis de sesgo, seguridad física ni comportamiento ante fallos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft_bs64_1128_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoint previo (etapa de foveación, 30k): https://huggingface.co/chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_30k
- Repositorio `lerobot_foveavla` (rama `stage-views`): https://github.com/HDR-SRL/lerobot_foveavla/tree/stage-views
- Run de entrenamiento en Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/3qz9lxzh
- Dataset principal: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Dataset DAgger ronda 4, subtarea 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r4
- Dataset DAgger ronda 4, subtarea 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r4
- Dataset DAgger ronda 1, subtarea 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r1
- Dataset DAgger ronda 2, subtarea 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r2
- Dataset DAgger ronda 3, subtarea 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r3
- Dataset DAgger ronda 1, subtarea 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r1
- Dataset DAgger ronda 2, subtarea 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r2
- Dataset DAgger ronda 3, subtarea 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r3

# chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_20k

## Resumen

`chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_20k` es un checkpoint de política robótica (VLA, vision-language-action) construido sobre `lerobot/pi05_base` y fine-tuneado con la extensión FoveaVLA para la tarea 2 (inserción de cable GRC) del entorno Hyundai Duet. No es un modelo de lenguaje general: es un policy que recibe seis cámaras y un estado de 18 dimensiones, predice un subtask en lenguaje natural y emite una secuencia de 18 acciones articulares. Lo publica el usuario `chomeed` como artefacto de investigación, con 0 descargas y 0 likes en el momento de la consulta.

El interés técnico está en la arquitectura híbrida: un VLM que primero escribe el subtask actual y, después, predice cajas de foveación por cámara para el fotograma t+8, mientras un "action expert" separado consume únicamente las vistas completas y los recortes correspondientes a su etapa. El checkpoint corresponde al update 20.000 de 30.000 (loss de entrenamiento 0,157), por lo que es intermedio, no final.

Por tamaño (4.145.521.424 parámetros, repo de 16,6 GB) y por licencia no declarada, debe tratarse como material de laboratorio: útil para reproducir experimentos de foveación en manipulación bimanual, no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA sobre pi0.5 (VLM + action expert) con extensión FoveaVLA y predicción de subtask; framework LeRobot 0.6.2, policy `pi05_foveavla_subtask` |
| Parámetros totales | 4.145.521.424 (según safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de observación definida por el chunk de acciones) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente bf16/fp32; el repo no declara cuantizaciones) |
| Idiomas soportados | no disponible (los subtasks se generan en inglés: "grasp the board with the right hand", "insert the board into the control module") |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

Otros parámetros operativos relevantes:

| Parámetro | Valor |
|---|---|
| Entradas | 6 cámaras (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right) + estado de 18 dimensiones |
| Salida | acción de 18 dimensiones, chunk de 50, `n_action_steps` 30 |
| Espacio de acciones | relativo al estado actual (`use_relative_actions=true`); absolutos: right_index_joint2, right_index_joint3, left_index_joint2, left_index_joint3 |
| Predicción de cajas | 4 slots por cámara (zed_mini, d405_left, d405_right), 4 clases sobre 1024 bins, horizonte t+8, parametrización `center_side` |
| Recorte de foveación | 224x224 píxeles |
| Checkpoint | 20.000 de 30.000 updates (loop step 20.000) |
| Loss de entrenamiento | 0,157 en ese step |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y añade dos cabezas sobre el VLM: predicción de subtask en lenguaje (entropía cruzada, peso 0,1 en la loss) y predicción de cajas de foveación por cámara (CE sobre 1024 bins, peso 0,1, solo en frames de inserción). El action expert condiciona sobre el subtask generado y nunca ve las cajas predichas; las cajas solo determinan qué recorte se pasa como vista en la siguiente consulta. En las etapas de "grasp" y "turn the head" el recorte se enmascara de la atención como si la cámara faltase (`fovea_mask_empty_crops`), de modo que el modelo ve solo los tres frames completos; en las etapas de inserción el recorte es la caja de la consulta anterior estirada al tamaño 224x224. La cámara d435 no es una entrada.

El entrenamiento se hizo con batch efectivo de 64 (32 por GPU en 2 B200, DDP, sin acumulación), AdamW con lr pico 2,5e-05, warmup de 1000 pasos y decaimiento coseno hasta 2,5e-06 en 30.000 pasos, autocast bf16 con pesos maestros fp32 y gradient checkpointing. Los datos son los subtasks 2 y 3 de la tarea 2 (el subtask 1 se eliminó): 103 episodios y 243.883 frames de demostración, más seis rondas DAgger (r1-r3 para cada subtask) que suman 390 episodios y 717.668 frames adicionales. El muestreo SIRIUS usa pesos demo 0,5 / intervención 0,4 / robot ≤ 0,1 y descarta los 3 segundos previos a cada takeover. La configuración incluye jitter de 0,05 y chunk de 50.

## Capacidades

- Predicción de subtask en lenguaje natural antes de actuar ("hand the cable over to the left hand", "insert the cable into the port", "insert the other cable end into the port").
- Generación de acciones de manipulación bimanual de 18 dimensiones en espacio relativo, con cuatro articulaciones de índice mantenidas en absoluto.
- Foveación selectiva por etapa: recorte 224x224 de zed_mini en las etapas de traspaso de cable y de d405_left (y d405_right en la inserción del segundo extremo) en las etapas de inserción.
- Predicción de cajas cuadradas por cámara (centro x, centro y, lado) con decodificación deslizando el cuadrado dentro del frame.
- Enmascaramiento de vistas ausentes: un recorte sin ventana se excluye de la atención en lugar de rellenarse.
- Condicionamiento por escenario en el robot mediante `policy.config.fovea_scenario = "subtask2"` o `"subtask3"` (o `observation.fovea_scenario` = 0/1).
- No soporta tool calling, function calling, agentes multi-paso genéricos, visión general, audio ni modo thinking: es una política de robot específica de tarea.

## Casos de uso

- Investigación en foveación para manipulación: reproducir el experimento comparando atención sobre frame completo frente a recortes por cámara en las etapas de inserción, usando el checkpoint de 20k como punto intermedio de la curva de entrenamiento.
- Inserción de cable GRC en el banco Hyundai Duet: desplegar la política con `fovea_scenario="subtask2"` para la secuencia traspaso-izquierda + inserción, con las seis cámaras y el estado de 18 dimensiones cableados según la model card.
- Traspaso bimanual de objeto: emplear la etapa "hand the cable over to the right hand" con recorte de zed_mini para estudiar cómo la foveación afecta a la coordinación entre brazos.
- Aprendizaje por intervención humana (DAgger): reutilizar el esquema SIRIUS (demo 0,5 / intervención 0,4 / robot ≤ 0,1, descarte de 3 s pre-takeover) como receta para nuevas rondas de recogida de datos sobre este mismo policy.
- Predicción de subtask como módulo de supervisión: registrar el subtask generado por el VLM en cada consulta para auditar la coherencia entre el plan textual y la acción ejecutada en el robot.
- Estudio de robustez de la predicción de cajas: evaluar el error de las cajas t+8 (4 clases sobre 1024 bins, parametrización center_side) frente a las cajas rastreadas de anotación, útil para decidir si merece la pena mantener la cabeza de foveación.
- Baseline para comparativas de VLA en inserción: usar este checkpoint como referencia de "pi0.5 + FoveaVLA con subtask" frente a `lerobot/pi05_base` sin foveación en el mismo conjunto de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta la loss de entrenamiento en el step 20.000 (0,157), que no es una métrica de éxito de tarea ni comparable con MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Entrenamiento declarado: 2 GPU B200 con batch 32 por GPU, bf16 y gradient checkpointing; el repo ocupa 16,6 GB, lo que sugiere pesos en bf16 (4,15e9 parámetros x 2 bytes ≈ 8,3 GB) más optimizer states y artefactos.
- VRAM de inferencia estimada: no disponible en la información proporcionada. Como referencia de orden de magnitud, 4,15e9 parámetros en bf16 requieren unos 8,3 GB solo para pesos, más activaciones de seis cámaras y del action expert; en fp32 serían unos 16,6 GB.
- GPU recomendadas: no disponibles. Por tamaño, cabría en GPUs de 24 GB o más en bf16, pero no hay validación publicada para RTX 4090, A100 o H100.
- Despliegue: LeRobot 0.6.2 con la policy `pi05_foveavla_subtask` del fork `lerobot_foveavla` (rama `stage-views`) y `lerobot_sirius`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política VLA con entradas de cámara.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / chunk | Foveación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`task2_foveavla_stage_..._20k`) | 4.145.521.424 | chunk 50, 30 pasos de acción | Sí (cajas por cámara, recortes 224x224) | no disponible | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible | no disponible | No | no disponible | Hugging Face (modelo base) |
| Otras variantes `pi05_foveavla_subtask` del mismo autor | no disponible | no disponible | Sí | no disponible | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparado entre estas variantes; la comparativa se limita a configuración y disponibilidad.

## Limitaciones y advertencias

- Checkpoint intermedio: 20.000 de 30.000 updates; no es el modelo final de la ejecución y su calidad puede ser inferior a la del checkpoint de 30k.
- Específico de tarea y entorno: entrenado solo para los subtasks 2 y 3 de la tarea 2 de Hyundai Duet; no generaliza a otras tareas, objetos ni robots sin reentrenamiento.
- Dependencia dura del hardware de percepción: seis cámaras con nombres concretos (d405_left, d405_right, zed_mini y sus versiones foveadas) y estado de 18 dimensiones; d435 queda excluida.
- Requiere indicar el escenario en el robot (`fovea_scenario`); un valor incorrecto altera qué recortes recibe el modelo y, por tanto, el comportamiento.
- Licencia no declarada: no hay autorización explícita de uso comercial; debe tratarse como no apta para producción hasta aclararlo con el autor.
- Idiomas: los subtasks se emiten en inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación del subtask: al ser una salida generativa del VLM, puede producir etiquetas incoherentes con el estado real, y el action expert condiciona sobre ellas sin verificación.
- Sesgos: no documentados, pero el dataset procede de demostraciones y DAgger de un operador y un montaje concretos, por lo que hereda sus sesgos de trayectoria.
- Sin métricas de éxito de tarea publicadas: no se puede afirmar tasa de inserción ni robustez ante perturbaciones.
- Reproducibilidad frágil: depende de un fork no estándar (`lerobot_foveavla`, rama `stage-views`) y de `lerobot_sirius`, además de versiones concretas de dataset (`foveavla_stage` con hashes específicos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Fork de LeRobot con FoveaVLA (rama `stage-views`): https://github.com/HDR-SRL/lerobot_foveavla/tree/stage-views
- Run de entrenamiento en Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/fbj3mr5u
- Dataset principal: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- DAgger subtask 2 r1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r1
- DAgger subtask 2 r2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r2
- DAgger subtask 2 r3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r3
- DAgger subtask 3 r1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r1
- DAgger subtask 3 r2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r2
- DAgger subtask 3 r3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r3

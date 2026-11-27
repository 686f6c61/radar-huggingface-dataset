# chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_25k

## Resumen

`chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_25k` es un checkpoint de política robótica (vision-language-action, VLA) construido sobre `lerobot/pi05_base` y fine-tuneado con el framework LeRobot. Lo desarrolla el usuario `chomeed` en el contexto del proyecto FoveaVLA, una variante de pi0.5 que incorpora predicción de subtareas de alto nivel y foveación por recortes guiados por cajas por cámara. El modelo resuelve una tarea concreta de manipulación bimanual (inserción de cable GRC, "task 2") sobre el robot Hyundai Duet.

El checkpoint corresponde al update 25.000 de un total de 30.000 (loop step 25.000), con una pérdida de entrenamiento de 0,127 en ese paso. Tiene 4.145.521.424 parámetros en formato safetensors y un repositorio de 16,6 GB. La arquitectura es la de pi0.5 (VLM más experto de acciones con flow matching), extendida con un módulo de predicción de subtarea y de cajas de foveación por cámara.

Es relevante para quienes trabajan en imitación robótica con datos de demostración más DAgger, porque documenta de forma explícita el esquema de vistas por etapa, el espacio de acciones relativo de 18 dimensiones y el uso de SIRIUS para el muestreo de transiciones. No es un modelo de lenguaje general: su pipeline es `robotics` y su salida son acciones de robot, no texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (VLM + experto de acciones con flow matching) extendida con FoveaVLA: predicción de subtarea y de cajas de foveación por cámara |
| Parametros totales | 4.145.521.424 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Framework | LeRobot 0.6.2, tipo de política `pi05_foveavla_subtask` (rama `stage-views` de `lerobot_foveavla` + `lerobot_sirius`) |
| Modelo base | `lerobot/pi05_base` |
| Entradas | 6 cámaras (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right) y estado de 18 dimensiones |
| Salida | acción de 18 dimensiones, chunk de 50 (n_action_steps 30) |
| Espacio de acciones | relativo al estado actual (`use_relative_actions=true`); absolutos: right_index_joint2, right_index_joint3, left_index_joint2, left_index_joint3 |
| Paso de entrenamiento | 25.000 de 30.000 |
| Loss de entrenamiento en ese paso | 0,127 |
| Tamaño del repo | 16,6 GB |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y añade el esquema FoveaVLA con predicción de subtarea: el VLM escribe primero la subtarea actual tras el prompt (por ejemplo, "grasp the board with the right hand", "turn the head to the center", "insert the board into the control module") y el experto de acciones condiciona sobre ella. Después de la respuesta, cuatro slots de caja por cámara (zed_mini, d405_left, d405_right) predicen la caja de cada cámara en t+8 mediante 4 clases sobre 1024 bins; el experto de acciones nunca ve esas cajas. Las cajas se parametrizan como centro x, centro y y lado (`fovea_box_param=center_side`), con cajas cuadradas en píxeles que se deslizan dentro del marco.

El entrenamiento se realizó con batch efectivo de 64 (32 por GPU en 2 B200, DDP, acumulación 1), optimizador AdamW con lr pico 2,5e-05, warmup de 1000 pasos y decaimiento coseno hasta 2,5e-06 en 30.000 pasos, precisión bf16 con pesos maestros fp32 y gradient checkpointing. Los datos combinan la demo de task 2 y las rondas DAgger 1-3 de las subtareas 2 y 3 (subtarea 1 eliminada), con etiquetas de subtarea derivadas de las marcas de etapa y cajas rastreadas por cámara solo en las etapas que fovean esa cámara. El muestreo SIRIUS usa pesos de 0,5 para demo, 0,4 para intervención y hasta 0,1 para robot, y nunca muestrea los 3 segundos previos a una toma de control.

## Capacidades

- Predicción de subtarea de alto nivel en lenguaje natural antes de generar la acción, que condiciona al experto de acciones.
- Generación de acciones de robot de 18 dimensiones en chunks de 50 pasos (30 acciones efectivas).
- Control bimanual con espacio de acciones relativo al estado actual, manteniendo cuatro articulaciones de índice en coordenadas absolutas.
- Foveación selectiva por cámara: recortes RGB de 224x224 guiados por cajas predichas, con enmascaramiento de atención de vistas de recorte ausentes.
- Predicción de cajas por cámara en t+8 con 4 clases sobre 1024 bins (centro x, centro y, lado).
- Procesamiento de 6 cámaras y estado de 18 dimensiones como entrada.
- Selección de escenario en el robot mediante `policy.config.fovea_scenario = "subtask2"` o `"subtask3"` (o `observation.fovea_scenario` = 0/1).
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Inserción de cable GRC en el robot Hyundai Duet: el modelo ejecuta la tarea 2 encadenando subtareas (entregar el cable a la mano izquierda o derecha e insertarlo en el puerto), usando las vistas completas más los recortes foveados que correspondan a cada etapa.
- Investigación en foveación para VLA: sirve como referencia reproducible de un esquema en el que el recorte de cada cámara sigue la subtarea de la consulta anterior, con enmascaramiento de atención cuando no hay ventana.
- Evaluación de predicción de subtareas: permite medir cómo el texto de subtarea generado por el VLM condiciona el experto de acciones y comparar la pérdida de flow frente a la CE de subtarea (flow + 0,1 × subtask CE).
- Aprendizaje por imitación con DAgger: el checkpoint se entrenó sobre rondas DAgger 1-3 de dos subtareas, por lo que es útil para estudiar la mezcla de demostraciones e intervenciones con el esquema SIRIUS.
- Predicción de cajas temporales: el módulo de 4 slots por cámara que predice la caja en t+8 puede reutilizarse para tareas de seguimiento visual de objetos en manipulación.
- Punto de partida para fine-tuning: al derivar de `lerobot/pi05_base` y usar LeRobot 0.6.2, puede servir como inicialización para otras tareas de inserción con la misma configuración de cámaras y estado.
- Reproducción de experimentos: el run de Weights & Biases y las revisiones de dataset documentadas permiten replicar el entrenamiento hasta el paso 25.000.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado por el autor es la pérdida de entrenamiento de 0,127 en el paso 25.000.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 4.145.521.424 parámetros en bf16, los pesos ocupan aproximadamente 8,3 GB; el resto del consumo depende de las 6 cámaras de entrada y del pipeline de LeRobot, no documentado.
- GPU recomendadas: el autor entrenó con 2 GPU B200 (32 muestras por GPU, DDP). Para inferencia no se especifica hardware.
- Cabe en GPU de consumo: no disponible; con cuantización a 8 bits los pesos rondarían los 4,1 GB, pero el autor no documenta cuantizaciones ni requisitos de memoria.
- Opciones de despliegue: LeRobot 0.6.2 con `pi05_foveavla_subtask` (rama `stage-views` de `lerobot_foveavla` y `lerobot_sirius`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_25k` | 4.145.521.424 | no disponible | VLA de manipulación (inserción de cable, Hyundai Duet) | no disponible | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible | no disponible | VLA base pi0.5 | no disponible | Hugging Face (modelo base) |
| Otros checkpoints FoveaVLA del mismo autor | no disponible | no disponible | Variantes de task 2 / subtareas | no disponible | Hugging Face (no verificados en la información disponible) |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de terceros en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo específico de una tarea: entrenado solo para task 2 (inserción de cable GRC) en subtareas 2 y 3; la subtarea 1 fue eliminada del entrenamiento.
- Dependencia del escenario: en el robot hay que indicar `fovea_scenario` ("subtask2" o "subtask3") antes de construir los procesadores; un valor incorrecto cambia las vistas de recorte esperadas.
- Dependencia de la subtarea previa: los recortes que recibe una consulta dependen de la subtarea decodificada en la consulta anterior, de modo que un error de subtarea puede propagarse a la foveación.
- Checkpoint intermedio: es el paso 25.000 de 30.000, no el modelo final del run.
- Entradas rígidas: requiere exactamente 6 cámaras y estado de 18 dimensiones; d435 no es una entrada válida.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas no disponibles: no se documenta el comportamiento multilingüe del VLM subyacente.
- Riesgo de alucinación en la subtarea: el VLM genera texto de subtarea que condiciona la acción; una subtarea incorrecta puede producir una secuencia de acciones inadecuada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de éxito en robot ni comparación con alternativas.
- Sesgos: no documentados por el autor.
- Repositorio con 0 descargas y 0 likes: sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_25k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio LeRobot FoveaVLA (rama `stage-views`): https://github.com/HDR-SRL/lerobot_foveavla/tree/stage-views
- Run de entrenamiento en Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/fbj3mr5u
- Dataset principal: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Dataset DAgger subtarea 2, ronda 1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r1
- Dataset DAgger subtarea 2, ronda 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r2
- Dataset DAgger subtarea 2, ronda 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r3
- Dataset DAgger subtarea 3, ronda 1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r1
- Dataset DAgger subtarea 3, ronda 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r2
- Dataset DAgger subtarea 3, ronda 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r3

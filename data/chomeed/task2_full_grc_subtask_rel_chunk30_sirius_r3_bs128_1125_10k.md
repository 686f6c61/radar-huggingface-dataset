# chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r3_bs128_1125_10k

## Resumen

El modelo `chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r3_bs128_1125_10k` es un checkpoint de robótica basado en pi0.5 (pi05), desarrollado por el usuario chomeed y publicado en Hugging Face. Se trata de una política visuomotora de tipo vision-language-action (VLA) afinada para una tarea concreta de inserción de cable en un módulo de control (denominada "Task 2, GRC cable insertion") sobre el robot Hyundai Duet, un sistema bimanual. El modelo parte de `lerobot/pi05_base` y ha pasado por varias rondas de ajuste fino con datos de demostración y de DAgger (intervención humana), acumulando tres rondas de recogida de datos correctivos.

El modelo combina un componente VLM que predice el subtask actual (texto) con un "action expert" que genera acciones condicionadas a ese subtask. La salida es un chunk de 30 acciones de 18 dimensiones (7 articulaciones por brazo más 4 articulaciones de los dedos índices), con representación relativa al estado actual para los brazos y absoluta para los dedos. El entrenamiento se realizó con el framework LeRobot 0.6.2 y un plugin específico (`pi05_subtask`), con batch de 128 en dos GPU B200.

Este checkpoint corresponde al paso 10.000 de 20.000 de la ronda 3 de SIRIUS, con una pérdida de entrenamiento de 0,003 en ese punto. Es relevante para quienes trabajan en manipulación bimanual con VLA y quieran evaluar políticas afinadas con DAgger iterativo, aunque su naturaleza de checkpoint intermedio y su especialización extrema limitan su uso fuera del entorno y la tarea para los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en pi0.5: VLM + action expert con flow matching; política `pi05_subtask` de LeRobot |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | no disponible (prompts en inglés en los ejemplos) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una política VLA derivada de pi0.5, compuesta por un modelo de visión-lenguaje que recibe tres cámaras (d405_left, d405_right, zed_mini) y un estado de 18 dimensiones, y un "action expert" que genera acciones mediante flow matching. La innovación principal es la predicción explícita de subtask: el VLM escribe el subtask actual tras el prompt y el action expert condiciona la generación de acciones a ese subtask. El prompt sigue el formato `Task: ...; State: {...};\nSubtask: {...};\nAction:`. La función de pérdida combina la pérdida de flow con 0,1 veces la entropía cruzada del subtask.

El entrenamiento se realizó en tres rondas de SIRIUS (intervención humana con realidad virtual) partiendo de un modelo previamente afinado durante 40.000 actualizaciones sobre la tarea completa. Esta ronda 3 se entrenó durante 20.000 actualizaciones (checkpoint en el paso 10.000) con batch de 128 (64 por GPU en 2 B200, DDP), optimizador AdamW con learning rate pico de 1e-05, warmup de 1.000 pasos y decaimiento coseno hasta 2,5e-06, precisión bf16 con pesos maestros en fp32 y gradient checkpointing. Los datos incluyen demostraciones (40 episodios de subtask 1, 50 de subtask 2, 54 de subtask 3) y tres rondas de DAgger para los subtasks 2 y 3, con entre 30 y 50 episodios por ronda y entre 107.000 y 130.000 frames por conjunto, con proporciones de intervención del operador entre el 42% y el 67%. Las acciones de los brazos son relativas al estado actual, mientras que las cuatro articulaciones de los dedos índices se mantienen absolutas. El subtask 1 es solo de brazo derecho y utiliza máscaras `state_dim_is_pad`/`action_dim_is_pad` para excluir las dimensiones no relevantes.

## Capacidades

- Generación de acciones de control robótico bimanual de 18 dimensiones (7 articulaciones por brazo y 4 articulaciones de dedos índices) en chunks de 30 pasos.
- Predicción de subtask de alto nivel en lenguaje natural, que condiciona la generación de acciones.
- Percepción visual multimodal a partir de tres cámaras (dos d405 y una zed_mini).
- Manejo de estados parcialmente enmascarados para tareas de un solo brazo mediante `state_dim_is_pad`.
- Control con acciones relativas al estado actual para los brazos y absolutas para los dedos.
- Entrenado específicamente para inserción de cable en módulo de control; no se documentan capacidades generales de texto, código, matemáticas ni tool calling.
- No se documenta soporte de agentes multi-paso, audio ni thinking mode.

## Casos de uso

- Inserción de cable en módulo de control con robot bimanual Hyundai Duet: el modelo genera las acciones de ambos brazos y dedos índices para ejecutar la tarea completa, dividida en tres subtasks, condicionando cada chunk de 30 acciones al subtask predicho.
- Evaluación de políticas VLA con DAgger iterativo: sirve como punto de comparación para medir la mejora entre rondas de intervención humana, ya que existen checkpoints de rondas 1, 2 y 3 con los mismos datos base.
- Investigación en predicción de subtasks: permite estudiar cómo el condicionamiento explícito por subtask afecta a la estabilidad y precisión de la manipulación fina, comparando con variantes sin subtask.
- Recolección de datos asistida: al ejecutar el modelo en el robot, un operador puede intervenir en realidad virtual para corregir trayectorias, generando nuevos datos de DAgger para la siguiente ronda.
- Manipulación de precisión con dedos índice: las articulaciones absolutas de los dedos permiten controlar la pinza con precisión independiente del movimiento del brazo, útil en tareas de inserción.
- Prototipado de pipelines LeRobot: el checkpoint es directamente cargable con LeRobot 0.6.2 y el plugin `pi05_subtask`, lo que facilita reproducir el flujo de entrenamiento e inferencia en un entorno controlado.
- Estudio de acciones relativas frente a absolutas: la configuración mixta (brazos relativos, dedos absolutos) permite analizar el efecto de esta elección en la estabilidad del control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es la pérdida de entrenamiento en el paso 10.000 (0,003, combinación de flow y entropía cruzada del subtask), que no es comparable con métricas estándar de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.143 millones de parámetros, en bf16 serían aproximadamente 8,3 GB solo de pesos, más el estado del optimizador si se reanuda el entrenamiento (no necesario para inferencia).
- GPU recomendadas: el entrenamiento se realizó en 2 GPU B200 con 64 muestras por GPU; para inferencia se requiere una GPU con suficiente VRAM para los pesos y las tres cámaras, probablemente una A100 o H100 para margen holgado.
- Cabe en GPU de consumo: no confirmado; una RTX 4090 con 24 GB podría alojar los pesos en bf16, pero no se documenta la viabilidad ni el rendimiento.
- Opciones de despliegue: LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_subtask` y `lerobot_sirius` (`--policy.type=pi05_subtask`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| task2_full_grc_subtask_rel_chunk30_sirius_r3_bs128_1125_10k (este) | 4.143 M | no disponible | Inserción de cable bimanual, subtask prediction | no disponible | Hugging Face (checkpoint paso 10k/20k) |
| chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r2_bs128_1125_20k | no disponible | no disponible | Misma tarea, ronda 2 | no disponible | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | Política VLA base generalista | no disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento entre estos modelos; la comparación se limita a la procedencia y la ronda de entrenamiento.

## Limitaciones y advertencias

- Modelo altamente especializado: solo se ha entrenado para la tarea de inserción de cable en el módulo de control del robot Hyundai Duet; no es un modelo de propósito general.
- Checkpoint intermedio: corresponde al paso 10.000 de 20.000 de la ronda 3, por lo que no es el resultado final de esa ronda.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Dependencia de hardware y entorno específicos: requiere las tres cámaras, el estado de 18 dimensiones y el robot Hyundai Duet; no es portable a otros robots sin reentrenamiento.
- Riesgo de alucinación en la predicción de subtask: el VLM puede predecir un subtask incorrecto, lo que condicionaría erróneamente las acciones; no se documentan métricas de acierto de subtask.
- Sesgos en los datos: las proporciones de intervención del operador varían entre el 42% y el 67% según la ronda, lo que puede introducir sesgos hacia las correcciones humanas de esas sesiones.
- Limitaciones de idioma: los prompts de entrenamiento están en inglés; no se documenta soporte multilingüe.
- Sin benchmarks publicados: no hay evidencia cuantitativa de éxito en la tarea fuera de la pérdida de entrenamiento.
- Requiere mover las manos a posiciones iniciales concretas (0,6922 / 0,2584) antes de la primera llamada de 18 dimensiones, lo que añade fragilidad al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r3_bs128_1125_10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoint de la ronda 2: https://huggingface.co/chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r2_bs128_1125_20k
- Dataset principal: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Dataset DAgger subtask 2 ronda 1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r1
- Dataset DAgger subtask 3 ronda 1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r1
- Dataset DAgger subtask 2 ronda 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r2
- Dataset DAgger subtask 3 ronda 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r2
- Dataset DAgger subtask 2 ronda 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r3
- Dataset DAgger subtask 3 ronda 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r3
- Plugin LeRobot: https://github.com/HDR-SRL/lerobot_policy_pi05_subtask
- Registro de entrenamiento (W&B): https://wandb.ai/meeroro56/hyundai_duet/runs/odi1rvcv

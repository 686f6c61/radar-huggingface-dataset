# chomeed/task2_full_grc_subtask_rel_chunk30_bs128_1120_20k

## Resumen

`chomeed/task2_full_grc_subtask_rel_chunk30_bs128_1120_20k` es un checkpoint de política robótica basado en pi0.5 (pi05), desarrollado por el usuario `chomeed` y publicado en Hugging Face bajo la librería LeRobot. Se trata de un fine-tuning del modelo base `lerobot/pi05_base` sobre el dataset `HDR-AI-tmp/hyundai_duet_task2`, orientado a la tarea de inserción de cables en un módulo de control (GRC) con un robot bimanual Hyundai Duet. El checkpoint corresponde al paso 20.000 de un entrenamiento de 40.000 actualizaciones.

La particularidad del modelo es que incorpora predicción de subtareas de alto nivel: el componente VLM del modelo genera la subtarea actual, que se concatena al prompt, y el experto de acción condiciona su salida sobre esa subtarea. Esto permite cubrir las tres subtareas de la tarea completa (empujar el módulo, agarrar el cable e insertarlo) con una sola política entrenada únicamente con demostraciones de GRC.

El modelo tiene 4.143.404.816 parámetros y un repositorio de 16,6 GB. No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks en la información proporcionada. Es un modelo de uso muy específico en robótica de manipulación, no un modelo de lenguaje general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (pi05): VLM con experto de acción (flow matching), framework LeRobot 0.6.2 con plugin `pi05_subtask` |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenamiento en bf16 con pesos maestros fp32) |
| Idiomas soportados | no disponible (prompts de tarea en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Entradas | 3 cámaras (d405_left, d405_right, zed_mini) + estado de 18 dimensiones |
| Salidas | acción de 18 dimensiones, chunk de 30 pasos (n_action_steps 30) |
| Espacio de acciones | relativo al estado actual, salvo right_index_joint2, right_index_joint3, left_index_joint2, left_index_joint3 (absolutos) |
| Modelo base | lerobot/pi05_base |
| Dataset de entrenamiento | HDR-AI-tmp/hyundai_duet_task2 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5 de LeRobot: un componente VLM que procesa el prompt (tarea, estado y subtarea) y un experto de acción que genera chunks de acciones mediante flow matching. La pérdida total combina el término de flow con 0,1 veces la entropía cruzada de la subtarea. El entrenamiento se realizó con AdamW (lr pico 2,5e-05, warmup de 1000 pasos, decaimiento coseno hasta 2,5e-06 en 40.000 pasos), precisión bf16 con autocast y pesos maestros en fp32, gradient checkpointing, batch de 128 por actualización (64 por GPU en 2 B200 con DDP). La pérdida de entrenamiento en el paso 20.000 era de 0,005.

El dataset combina tres conjuntos de demostraciones: subtarea 1 (empujar el módulo de control, 40 demos, solo brazo derecho), subtarea 2 (primer cable, bimanual, 50 demos) y subtarea 3 (otro extremo del cable, bimanual, 54 demos). El muestreo es uniforme sobre todos los frames, sin SIRIUS, sin reparto por grupos y sin DemoSpeedup. La normalización usa q01/q99 con cada subtarea ponderada por igual y acciones relativas sobre chunks de 30 pasos; las estadísticas reales están almacenadas en los safetensors `policy_preprocessor_*` y `policy_postprocessor_*` del repositorio. Para la subtarea 1, que es solo de brazo derecho, se emplean máscaras `state_dim_is_pad` y `action_dim_is_pad` de 18 dimensiones booleanas: las 11 dimensiones no pertenecientes al brazo derecho se marcan como True, no se escriben en el prompt y quedan fuera de la pérdida (las dimensiones de acción enmascaradas se tratan como ruido puro para el experto de acción).

## Capacidades

- Predicción de subtareas de alto nivel: el VLM genera la subtarea actual tras el prompt y el experto de acción condiciona sobre ella.
- Generación de chunks de acciones de 18 dimensiones con horizonte de 30 pasos.
- Control bimanual con 14 articulaciones de brazo (arm_r_j1..7, arm_l_j1..7) más 4 articulaciones de índice (right_index_joint2/3, left_index_joint2/3).
- Acciones relativas al estado actual para los brazos y absolutas para las articulaciones de índice.
- Fusión de tres cámaras (d405_left, d405_right, zed_mini) sin recorte.
- Manejo de máscaras de dimensiones de estado y acción para subtareas de un solo brazo.
- No se dispone de información sobre tool calling, capacidades multilingües, visión general, audio ni modo thinking más allá de lo descrito.

## Casos de uso

- Inserción de cables en módulo de control (GRC): el modelo está entrenado específicamente para esta tarea con robot Hyundai Duet; se le pasa el prompt `insert the cable into the control module`, el estado de 18 dimensiones y las tres imágenes, y devuelve un chunk de 30 acciones.
- Ejecución de la subtarea 1 (empujar el módulo de control): se envía `state_dim_is_pad` con True en las dimensiones 7-17 mientras la subtarea actual sea "push the control module to the center" o "return both arms back to ready pose", y se ejecutan solo las dimensiones no enmascaradas.
- Ejecución de las subtareas 2 y 3 (agarrar e insertar el cable): se envían las 18 dimensiones sin enmascarar y el modelo genera acciones bimanuales completas.
- Investigación en políticas VLA con predicción de subtareas: sirve como referencia para estudiar cómo condicionar el experto de acción sobre una subtarea generada por el VLM y cómo ponderar la pérdida de flow frente a la de clasificación.
- Reproducción de experimentos de fine-tuning de pi05: el repositorio incluye los procesadores pre/post y las estadísticas de normalización, lo que permite reproducir el pipeline de inferencia con `make_pre_post_processors`.
- Integración en bucles de control robótico con LeRobot: la política se carga con `PI05SubtaskPolicy.from_pretrained` y se integra en el stack de LeRobot 0.6.2 mediante el plugin `lerobot_policy_pi05_subtask`.
- Antes de la primera llamada de 18 dimensiones, es necesario mover las manos a las posiciones 0,6922 / 0,2584 según indica la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de entrenamiento en el paso 20.000 (0,005), que no constituye una evaluación de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4.143.404.816 parámetros, en bf16 se requieren aproximadamente 8,3 GB solo para pesos; en fp32, unos 16,6 GB. A ello hay que sumar el coste del VLM, las tres cámaras y el experto de acción.
- GPU recomendadas: el entrenamiento se realizó en 2 B200 (64 por GPU con DDP). Para inferencia no se especifican GPUs concretas.
- Cabe en GPU de consumo: no confirmado; por tamaño de pesos en bf16 podría caber en GPUs con 16 GB o más, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_subtask` (`pip install git+https://github.com/HDR-SRL/lerobot_policy_pi05_subtask@9b0f897`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| task2_full_grc_subtask_rel_chunk30_bs128_1120_20k | 4.143.404.816 | no disponible | Inserción de cables GRC (Hyundai Duet) | no disponible | Hugging Face |
| lerobot/pi05_base | no disponible en la información | no disponible | Política VLA base pi0.5 | no disponible | Hugging Face |
| Otros checkpoints de chomeed sobre hyundai_duet_task2 | no disponible | no disponible | Variantes de la misma tarea | no disponible | Hugging Face |

No se dispone de información suficiente para comparar con alternativas de la misma categoría más allá del modelo base y de otros checkpoints del mismo autor.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado únicamente para la tarea GRC de inserción de cables con el robot Hyundai Duet; no es un modelo de propósito general.
- Dependencia del prompt exacto: la tarea debe enviarse como `insert the cable into the control module`; otros prompts no están validados.
- Dependencia de las máscaras `state_dim_is_pad`: en la subtarea 1 es obligatorio marcar True en las dimensiones 7-17 y ejecutar solo las dimensiones no enmascaradas; un uso incorrecto de las máscaras produce acciones inválidas.
- Requiere posicionar las manos en 0,6922 / 0,2584 antes de la primera llamada de 18 dimensiones.
- Checkpoint intermedio: corresponde al paso 20.000 de 40.000, por lo que no es el modelo final del entrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: los prompts están en inglés y no se documenta soporte multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en el mundo real más allá de la pérdida de entrenamiento.
- Sin datos de cuantización: no se documentan formatos GGUF ni cuantizaciones para despliegue en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_full_grc_subtask_rel_chunk30_bs128_1120_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Plugin LeRobot: https://github.com/HDR-SRL/lerobot_policy_pi05_subtask
- Run de entrenamiento en Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/k3gw0d3s

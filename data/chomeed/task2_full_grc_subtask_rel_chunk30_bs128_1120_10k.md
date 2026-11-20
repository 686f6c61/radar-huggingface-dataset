# chomeed/task2_full_grc_subtask_rel_chunk30_bs128_1120_10k

## Resumen

`chomeed/task2_full_grc_subtask_rel_chunk30_bs128_1120_10k` es un checkpoint de robótica basado en pi0.5 (pi05) afinado sobre el conjunto de datos `HDR-AI-tmp/hyundai_duet_task2`, que recoge demostraciones de inserción de cable en un módulo de control con un robot bimanual Hyundai Duet. Lo desarrolla el usuario `chomeed` y se publica bajo la librería LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_subtask`, que añade predicción de subtareas de alto nivel: el VLM genera la subtarea actual y el experto de acción condiciona sus predicciones sobre ella.

El modelo resuelve una tarea de manipulación concreta: insertar un cable en el puerto de un módulo de control, descompuesta en tres subtareas (empujar el módulo al centro, agarrar el cable con la mano derecha, insertar ambos extremos). Trabaja con tres cámaras (d405_left, d405_right, zed_mini), un vector de estado de 18 dimensiones y devuelve chunks de 30 acciones de 18 dimensiones, con brazos expresados de forma relativa al estado actual y articulaciones de índice absolutas.

Es relevante para quien investigue políticas visión-lenguaje-acción (VLA) con descomposición jerárquica en subtareas y entrenamiento con dimensiones enmascaradas. Este checkpoint corresponde al paso 10.000 de 40.000 de un entrenamiento con batch 128 en 2× B200, con una pérdida de entrenamiento de 0,008 en ese paso. El repositorio ocupa 16,6 GB y contiene 4.143.404.816 parámetros en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA pi0.5 (pi05) con experto de acción y predicción de subtareas (plugin `lerobot_policy_pi05_subtask`) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | no disponible (el prompt de tarea está en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, un VLA pi0.5 con un componente de visión-lenguaje y un experto de acción que genera chunks de acciones. El plugin `lerobot_policy_pi05_subtask` modifica el flujo para que el VLM escriba la subtarea actual tras el prompt y el experto de acción condicione sobre ella. La pérdida combina el flow matching de acciones con un término de entropía cruzada de subtarea ponderado por 0,1: `Loss = flow + 0.1 × subtask CE`.

El entrenamiento se realizó sobre `HDR-AI-tmp/hyundai_duet_task2`, que agrega 40 demos de la subtarea 1 (brazo derecho solo), 50 demos de la subtarea 2 (bimanual, primer cable) y 54 demos de la subtarea 3 (bimanual, otro extremo del cable). Se usó AdamW con lr pico 2,5e-05, warmup de 1000 pasos y decaimiento coseno hasta 2,5e-06 en 40.000 pasos, precisión bf16 con pesos maestros fp32 y gradient checkpointing, batch de 128 por actualización (64 por GPU en 2× B200, DDP). El muestreo es uniforme sobre todos los fotogramas, sin SIRIUS, sin cuotas por grupo y sin DemoSpeedup. La normalización usa q01/q99 del `stats.json` con cada subtarea ponderada por igual; los estadísticos efectivos se guardan en los safetensors `policy_preprocessor_*` y `policy_postprocessor_*` del repositorio.

Una innovación destacable es el enmascaramiento por dimensiones: los fotogramas de la subtarea 1 (solo brazo derecho) llevan `state_dim_is_pad` / `action_dim_is_pad` con las 11 dimensiones no pertenecientes al brazo derecho marcadas como True. Esas dimensiones de estado no se escriben en el prompt y esas dimensiones de acción quedan fuera de la pérdida, tratándose como ruido puro para el experto de acción (`pad_action_dims_as_noise`).

## Capacidades

- Generación de chunks de acción de 30 pasos con 18 dimensiones por paso (7 articulaciones por brazo más 4 articulaciones de índice).
- Predicción de subtareas de alto nivel: el VLM emite la subtarea actual, expuesta en `policy.last_subtask`, que condiciona el experto de acción.
- Percepción multimodal con tres cámaras sin recorte: d405_left, d405_right y zed_mini.
- Control bimanual con acciones relativas al estado actual para los brazos y absolutas para `right_index_joint2`, `right_index_joint3`, `left_index_joint2` y `left_index_joint3`.
- Manejo de dimensiones enmascaradas mediante `state_dim_is_pad` (tensor bool de 18) para operar en modo mono-brazo durante las subtareas de empuje y retorno.
- Condicionamiento por prompt de tarea en lenguaje natural (`insert the cable into the control module`).
- No se documentan capacidades de tool calling, agentes multi-paso genéricos, matemáticas ni generación de texto libre; el modelo está especializado en control robótico.

## Casos de uso

- Inserción de cable en módulo de control en entorno de laboratorio: el modelo ejecuta la política completa de tres subtareas sobre el robot Hyundai Duet, enviando estado de 18 dimensiones y tres imágenes por paso y recibiendo chunks de 30 acciones.
- Investigación en políticas VLA jerárquicas: sirve como referencia reproducible para estudiar cómo la predicción explícita de subtareas mejora el condicionamiento del experto de acción frente a políticas planas.
- Evaluación de enmascaramiento por dimensiones: permite reproducir el esquema `state_dim_is_pad` / `action_dim_is_pad` para entrenar políticas con brazos parcialmente activos sin contaminar la pérdida con dimensiones irrelevantes.
- Base para fine-tuning en tareas bimanuales similares: al derivar de `lerobot/pi05_base` y usar LeRobot 0.6.2, se puede reutilizar el pipeline de pre/postprocesadores y el formato de observación para nuevos datasets de manipulación.
- Benchmark interno de manipulación de precisión: la tarea de inserción de cable exige control fino de las articulaciones de índice (absolutas), lo que lo hace útil para medir precisión de agarre y alineación.
- Estudio de estabilidad de entrenamiento en VLA: el checkpoint en el paso 10.000 de 40.000 con pérdida 0,008 permite analizar la evolución de la pérdida de flow y de la entropía cruzada de subtarea a lo largo del entrenamiento (run de W&B disponible).
- Reproducción de experimentos con DDP en 2× B200: la configuración documentada (batch 128, bf16, gradient checkpointing) sirve de plantilla para réplicas en clústeres con GPUs de gran memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de entrenamiento en el paso 10.000 (0,008), sin métricas de éxito en robot ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4.143.404.816 parámetros, en bf16 los pesos ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB (coincide con el tamaño del repositorio). A ello hay que sumar el estado de activación del VLM y del experto de acción y las tres cámaras de entrada.
- GPU recomendadas para entrenamiento: 2× B200 con DDP, batch 64 por GPU, bf16 y gradient checkpointing, según la configuración documentada.
- GPU para inferencia: no se especifican. Por tamaño de pesos, una GPU consumer de 24 GB (RTX 4090) podría alojar los pesos en bf16, pero no hay confirmación del autor sobre que la inferencia completa quepa con las activaciones y las tres cámaras.
- Opciones de despliegue: LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_subtask` (commit `9b0f897`), cargando la política con `PI05SubtaskPolicy.from_pretrained` y los pre/postprocesadores con `make_pre_post_processors`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chomeed/task2_full_grc_subtask_rel_chunk30_bs128_1120_10k` | 4.143.404.816 | no disponible | Inserción de cable bimanual con subtareas | no disponible | Hugging Face (0 descargas) |
| `lerobot/pi05_base` | no disponible | no disponible | VLA base pi0.5, fine-tuning general | no disponible | Hugging Face (modelo base) |
| Otras políticas LeRobot pi0.5 | no disponible | no disponible | Manipulación robótica con LeRobot | no disponible | Hugging Face |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada, por lo que la comparación se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado únicamente para la tarea de inserción de cable del dataset `hyundai_duet_task2`; no se espera generalización a otras tareas, objetos o entornos sin fine-tuning.
- Checkpoint intermedio: corresponde al paso 10.000 de 40.000, por lo que no representa el modelo final del entrenamiento.
- Dependencia del plugin: requiere LeRobot 0.6.2 y el plugin `lerobot_policy_pi05_subtask` en el commit `9b0f897`; sin ellos la carga y la inferencia no son reproducibles.
- Protocolo de inferencia frágil: es necesario enviar `state_dim_is_pad` correctamente (True en dimensiones 7-17 solo durante las subtareas de empuje y retorno), ejecutar solo las dimensiones no marcadas y mover las manos a 0,6922 / 0,2584 antes de la primera llamada de 18 dimensiones. Un uso incorrecto produce acciones inválidas.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: el prompt de tarea está en inglés y no se documenta soporte multilingüe.
- Sin métricas de éxito en robot ni benchmarks publicados: no hay evidencia cuantitativa de robustez fuera del conjunto de entrenamiento.
- Riesgo de sobreajuste a las condiciones de captura (posición de cámaras d405_left, d405_right, zed_mini sin recorte y calibración del robot Hyundai Duet).
- Sesgos y alucinaciones: no se documentan sesgos específicos; en políticas VLA el riesgo se manifiesta como predicciones de acción incoherentes ante observaciones fuera de distribución.
- 0 descargas y 0 likes: no hay validación comunitaria ni reportes de terceros sobre su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_full_grc_subtask_rel_chunk30_bs128_1120_10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Plugin LeRobot: https://github.com/HDR-SRL/lerobot_policy_pi05_subtask
- Run de entrenamiento en W&B: https://wandb.ai/meeroro56/hyundai_duet/runs/k3gw0d3s

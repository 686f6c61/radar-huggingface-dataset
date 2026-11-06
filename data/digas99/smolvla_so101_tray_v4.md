# digas99/smolvla_so101_tray_v4

## Resumen

`digas99/smolvla_so101_tray_v4` es un ajuste fino completo (full fine-tune) del modelo base `lerobot/smolvla_base` de SmolVLA, una política visión-lenguaje-acción (VLA) de 450 millones de parámetros orientada al control robótico. Lo desarrolla el usuario digas99 y está especializado en una única tarea de manipulación con el brazo robótico LeRobot SO-101: mover objetos entre una mesa y una bandeja transparente en ambos sentidos. El modelo no es un LLM de propósito general, sino una política de imitación que transforma observaciones multimodales (dos cámaras y el estado articular) en comandos de acción de 6 grados de libertad.

La relevancia de esta versión radica en su proceso de mejora iterativa: parte del conjunto de entrenamiento de la versión v3 (440 episodios) y añade 31 correcciones humanas grabadas el 27 de octubre de 2026 a partir de los propios estados de fallo de v3 (agarres perdidos, deriva del objeto, objeto equivocado). El resultado es un total de 471 episodios y 139.908 fotogramas a 30 fps, recogidos con dos cámaras (una fija cenital y otra en la muñeca del gripper).

La política es deliberadamente agnóstica a la clase de objeto: nunca recibe el nombre del objeto y todos los episodios comienzan con el gripper suspendido unos 10 cm sobre el objetivo, colocado ahí en tiempo de ejecución por un segmentador externo. Está pensada para desplegarse en hardware de borde, como la NVIDIA Jetson AGX Thor usada durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (política visión-lenguaje-acción basada en VLM + experto de acciones con flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (n_obs_steps = 1; horizonte de acción de 50 pasos, 1,67 s a 30 fps) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenamiento en bf16 con master weights fp32) |
| Idiomas soportados | no disponible (las instrucciones de tarea son dos cadenas fijas en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA combina un backbone VLM con un experto de acciones que genera trayectorias mediante flow matching. En este ajuste se realiza un fine-tune completo: `train_expert_only=false` y `freeze_vision_encoder=false`, aunque lerobot mantiene congeladas la última capa del VLM, la `lm_head` y la normalización final. El entrenamiento se ejecutó en bf16 con autocast, elevando el backbone VLM a pesos maestros fp32 para evitar que las actualizaciones de AdamW se perdieran a esa tasa de aprendizaje. Se dieron 30.000 pasos con batch de 16 (unas 3,4 pasadas sobre los 139.908 fotogramas), learning rate de 5e-05 con 1.000 pasos de warm-up y decaimiento coseno hasta 1/20 en el último paso. Se aplicó el aumento de imagen por defecto de LeRobot (brillo, contraste, saturación, tono, nitidez y una pequeña transformación afín).

El conjunto de datos `digas99/so101_tray_train_v4` agrega varios snapshots inmutables con procedencia registrada: `so101_tray_b1_pickA` (135 demostraciones de mesa a bandeja), `so101_tray_b2_placeB` (90 de bandeja a mesa), correcciones `so101_tray_corrA_v1` (73), `so101_tray_corrB_v2` (19), `so101_tray_corrB_wall` (27), `so101_tray_corrB_wall9` (9), `so101_corr_v2corrAB` (46), demostraciones con inicio en hover sobre mesa desordenada `so101_teach_clutter` (41) y las nuevas correcciones de v3 `so101_corr_v3` (31). Los episodios cubren nueve objetos domésticos, con colocaciones sobre una rejilla de 4 x 3 en la zona de trabajo para el sentido mesa-bandeja, y desde la banda alcanzable de la bandeja para el sentido inverso, incluyendo vecinos en contacto, distractores y bandejas parcialmente llenas. El dataset usa formato LeRobot v3.0 con `robot_type: so_follower` y un registro de procedencia por episodio en `meta/provenance.jsonl`.

## Capacidades

- Generación de acciones robóticas de 6 grados de libertad (posición de cinco articulaciones y gripper) a partir de observaciones visuales y estado articular.
- Percepción visual multimodal mediante dos cámaras RGB de 480x640: una cenital fija y otra montada en la muñeca.
- Condicionamiento por instrucción de tarea en lenguaje natural, limitado a dos cadenas fijas: "Pick up the object and put it in the tray" y "Pick up the object from the tray and put it on the table".
- Ejecución de políticas de horizonte largo con `chunk_size = 50` y `n_action_steps = 50`, re-inferencia cada 50 llamadas (1,67 s de acción por inferencia a 30 fps).
- Generalización a objetos no vistos en entrenamiento, reservados explícitamente para medir esta capacidad.
- Política agnóstica a la clase: no requiere nombre ni etiqueta del objeto, solo su posición inicial en hover.
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje ni generación de texto libre.

## Casos de uso

- Clasificación y ordenación de objetos en líneas de montaje ligeras: el modelo mueve piezas entre una superficie y una bandeja en ambos sentidos, con instrucciones de tarea fijas que encajan en un flujo de trabajo repetitivo.
- Recogida automatizada en celdas de pick-and-place: la política arranca desde un hover de 10 cm colocado por un segmentador externo, lo que permite integrarla en un pipeline donde un sistema de visión localiza el objeto y el brazo SO-101 ejecuta el agarre.
- Manipulación en entornos con distractores y objetos en contacto: el entrenamiento incluye vecinos tocándose y bandejas prellenadas, adecuado para escenarios reales donde los objetos no están aislados.
- Investigación en aprendizaje por imitación y corrección humana: las 31 correcciones grabadas desde estados de fallo de v3 sirven como caso de estudio de mejora iterativa de políticas con datos dirigidos.
- Despliegue en robótica de borde: con 450 millones de parámetros y entrenamiento en Jetson AGX Thor, es viable en plataformas embebidas con GPU para tareas de manipulación en tiempo real a 30 Hz.
- Evaluación de generalización a objetos no vistos: al mantener objetos fuera del conjunto de entrenamiento, permite medir la transferencia de la política en pruebas controladas sobre diez layouts fijos.
- Docencia y prototipado con LeRobot: la integración con `lerobot[smolvla]==0.6.1` y el script `verify_policy.py` facilitan reproducir los resultados en una máquina de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye únicamente la pérdida de entrenamiento (flow-matching MSE) y una verificación offline sobre fotogramas del dataset:

| Paso | Pérdida | Learning rate |
|---|---|---|
| 100 | 0,424 | 2,6e-06 |
| 1K | 0,220 | 5,0e-05 |
| 11K | 0,095 | 3,5e-05 |
| 21K | 0,057 | 1,2e-05 |
| 30K | 0,046 | 2,5e-06 |

La evaluación real se realiza sobre el robot con diez layouts fijos, tanto con objetos de entrenamiento como con objetos no vistos, pero los resultados numéricos de esa evaluación no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en bf16 el peso ronda 0,9 GB, más el coste de las dos imágenes de entrada y del experto de acciones.
- GPU recomendadas: el entrenamiento se realizó en NVIDIA Jetson AGX Thor; para inferencia es razonable cualquier GPU con soporte CUDA, aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de parámetros, pero no hay confirmación en la información disponible sobre modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: librería `lerobot` versión 0.6.1 con el extra `smolvla` (`pip install "lerobot[smolvla]==0.6.1"`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: la política re-infiera cada 50 llamadas y genera 1,67 s de acciones por inferencia a 30 fps; no se proporcionan cifras de latencia por inferencia.
- El repositorio ocupa 53,3 GB, principalmente por los checkpoints cada 2.500 pasos y los datos asociados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_so101_tray_v4 | 450 M | no disponible | Manipulación SO-101 mesa-bandeja | apache-2.0 | Hugging Face (digas99) |
| lerobot/smolvla_base | no disponible | no disponible | Política VLA base multi-tarea | no disponible | Hugging Face (lerobot) |
| smolvla_so101_tray_v3 | no disponible | no disponible | Versión previa, 440 episodios sin correcciones de v3 | no disponible | Hugging Face (digas99) |

No se dispone de datos de rendimiento comparativo entre estas versiones en la información proporcionada; la model card indica que la comparación con v3 debe hacerse sobre los mismos layouts, pero no incluye los resultados.

## Limitaciones y advertencias

- La política espera comenzar desde el hover de aproximadamente 10 cm sobre el objeto; desde la pose de reposo nunca ha visto el acercamiento y no funcionará correctamente.
- Solo acepta dos cadenas de tarea fijas en inglés; no es un modelo conversacional ni admite instrucciones libres.
- El entrenamiento no incluyó datos held-out: la evaluación es exclusivamente sobre el robot con diez layouts fijos.
- Es agnóstica a la clase y depende de un segmentador externo que coloque el gripper en la posición inicial; un fallo de ese componente degrada directamente el rendimiento.
- El conjunto de datos cubre nueve objetos domésticos concretos; la generalización a objetos fuera de esa distribución está reservada para medición y no garantizada.
- No hay información sobre sesgos, riesgo de alucinación en el sentido lingüístico (no genera texto libre) ni sobre restricciones adicionales de la licencia apache-2.0 más allá de las habituales.
- El mapeo de cámaras (`observation.images.top` a `camera1`, `observation.images.wrist` a `camera2`) está almacenado en el preprocesador del checkpoint; alimentar claves distintas rompe la inferencia.
- La reproducibilidad de la verificación offline exige la misma versión de lerobot (0.6.1) y el mismo entorno de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/digas99/smolvla_so101_tray_v4
- Dataset de entrenamiento: https://huggingface.co/datasets/digas99/so101_tray_train_v4
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Librería LeRobot: https://github.com/huggingface/lerobot

# mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__wrist_cameras__live__groot__seed_0

## Resumen

Este repositorio contiene una policy de robotica entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment disenado para razonamiento y habilidades en robots humanoides. El modelo combina un backbone de vision-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, que predice acciones condicionadas por vision, lenguaje y propiocepcion. En este caso concreto, la policy esta especializada en una tarea de pick-and-place sobre un robot Franka Panda simulado.

El modelo ha sido desarrollado por el usuario mim-chess-vlas (no por NVIDIA directamente; se trata de un fine-tuning o entrenamiento derivado de la arquitectura GR00T publicado en el Hub) y resuelve el problema de generar trayectorias de accion continuas de 7 dimensiones a partir de observaciones multimodales: una vista de agente y dos vistas de muneca, mas el estado propioceptivo de 9 dimensiones. Es relevante porque ejemplifica el flujo completo de entrenamiento de policies con LeRobot 0.6.0 sobre un modelo fundacional abierto, con licencia Apache 2.0, lo que permite reproducir y adaptar el pipeline.

El checkpoint tiene 3.144.016.000 parametros (aproximadamente 3,14 mil millones) en formato safetensors, ocupa 50,3 GB en el repositorio y fue entrenado durante 60.000 pasos con batch size 16, optimizador AdamW y learning rate 7e-05. La tarea entrenada es un pick-and-place de 40 categorias de objetos distintos hacia una caja, con 787 episodios y 195.184 frames a 20 FPS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot 0.6.0 |
| Tipo de robot | Franka Panda |
| Camaras | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Entrada de estado | observation.state, shape (9,) |
| Entrada visual | 3 imagenes RGB de (3, 224, 224) |
| Salida de accion | action, shape (7,) |
| Pasos de entrenamiento | 60.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 7e-05 |
| Seed | 0 |
| Tamano del repositorio | 50,3 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de GR00T N1.7: un backbone de vision-lenguaje Cosmos-Reason2/Qwen3-VL que procesa las imagenes de camara y la instruccion de tarea en lenguaje natural, y un transformer de acciones que genera acciones continuas mediante flow matching. Las acciones se condicionan conjuntamente por vision, lenguaje y propiocepcion, lo que permite un control visuomotor multimodal. El modelo es cross-embodiment por diseno, aunque esta instancia concreta esta entrenada para el robot Panda con una configuracion especifica de tres camaras.

El entrenamiento se realizo con LeRobot 0.6.0 durante 60.000 pasos, batch size 16, AdamW y learning rate 7e-05 con seed 0. El dataset consta de 787 episodios y 195.184 frames a 20 FPS, con 40 tareas de tipo "Pick the X and place it into the box" sobre objetos cotidianos (jam, cereal, pear, sweet potato, scone, entre otros). No se dispone de informacion sobre el numero total de tokens de entrenamiento del backbone, la composicion del dataset de preentrenamiento de GR00T ni si se aplicaron tecnicas de RLHF o DPO en esta instancia.

## Capacidades

- Generacion de acciones de control roboticas de 7 dimensiones (tipicamente posicion y orientacion del efector final mas apertura del gripper) a partir de observaciones multimodales.
- Percepcion visual multi-camara: procesa simultaneamente una vista de agente y dos vistas de muneca a 224x224.
- Condicionamiento por instruccion en lenguaje natural: la tarea se especifica como texto ("Pick the jam and place it into the box").
- Fusion de vision, lenguaje y propiocepcion en un unico espacio de representacion para la prediccion de acciones.
- Ejecucion de tareas de pick-and-place sobre 40 categorias de objetos.
- Integracion con el ecosistema LeRobot: comandos `lerobot-rollout` y pipelines de entrenamiento estandarizados.
- Soporte de despliegue en robot fisico o simulado mediante la CLI de LeRobot.
- No se ha documentado soporte de tool calling, agentes multi-paso, thinking mode, audio ni otras capacidades de los LLM de proposito general en la informacion disponible.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: la policy puede recoger objetos cotidianos y depositarlos en una caja, usando las tres camaras para localizar el objeto y el estado propioceptivo para controlar el brazo. Es adecuada porque ha sido entrenada especificamente sobre 787 episodios de esta tarea.
- Investigacion en imitation learning: sirve como checkpoint de referencia para comparar variantes de entrenamiento (sparse vs dense, con o sin mascara, con o sin overlay) dentro de la misma familia de experimentos del autor.
- Reproduccion de pipelines LeRobot: permite validar el flujo completo de entrenamiento y rollout con GR00T N1.7 en LeRobot 0.6.0, incluyendo configuracion de camaras y calibracion.
- Benchmarking de modelos fundacionales roboticos: util como baseline para evaluar la transferencia de un backbone VLM a tareas de control visuomotor en un robot concreto.
- Prototipado de automatizacion en almacen simulado: el escenario de recogida y deposito en caja es directamente analogo a tareas de bin picking en entornos simulados.
- Generacion de datos sinteticos y evaluacion en simulacion: al estar entrenado sobre datos simulados ("sim" en el nombre del dataset), puede emplearse para estudiar la brecha sim-to-real antes de desplegar en hardware.
- Educacion y formacion en robotica: como ejemplo completo y abierto (Apache 2.0) de policy entrenada con LeRobot para cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 3,14 mil millones de parametros, en FP16 el peso del modelo ronda los 6,3 GB, pero el repositorio ocupa 50,3 GB, lo que sugiere la presencia de checkpoints u optimizadores adicionales; no se especifica el peso efectivo de inferencia.
- GPU recomendadas: no disponible. Por tamano, una GPU con al menos 16 GB de VRAM seria un punto de partida razonable en FP16, pero no hay confirmacion en la documentacion.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path` apuntando al repositorio; el resto de backends (vLLM, llama.cpp, Ollama, TGI) no estan documentados para este tipo de policy.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T N1.7 fine-tune, seed 0) | 3,14 B | no disponible | Pick-and-place Panda, 40 objetos | Apache 2.0 | Hugging Face |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible en la informacion | GitHub NVIDIA/Isaac-GR00T |
| Otras variantes de la familia mim-chess-vlas | no disponible | no disponible | Variantes de entrenamiento (sparse/dense, mascara, overlay) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para el robot Panda con una configuracion concreta de tres camaras y un estado de 9 dimensiones; no es directamente transferible a otro hardware sin reentrenamiento.
- La tarea esta acotada a pick-and-place de 40 categorias de objetos hacia una caja; fuera de ese dominio el comportamiento no esta garantizado.
- Los datos de entrenamiento son simulados ("sim" en el nombre del dataset), por lo que existe riesgo de brecha sim-to-real al desplegar en un robot fisico.
- No se han documentado evaluaciones de sesgo, robustez ante cambios de iluminacion, oclusiones o variaciones de los objetos.
- Riesgo de alucinacion de acciones: como policy generativa con flow matching, puede producir trayectorias no validas ante observaciones fuera de distribucion.
- Las instrucciones de tarea estan en ingles; no se documenta soporte multilingue.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base GR00T N1.7 y sus dependencias deben verificarse por separado.
- El repositorio ocupa 50,3 GB, lo que puede complicar el despliegue en entornos con almacenamiento limitado.
- Solo 16 descargas y 0 likes en el momento de la consulta: es un checkpoint de investigacion, sin validacion comunitaria extensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__wrist_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__wrist_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__wrist_cameras__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guia LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de policies: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet

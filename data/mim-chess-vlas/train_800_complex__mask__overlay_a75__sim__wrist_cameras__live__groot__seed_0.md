# mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__wrist_cameras__live__groot__seed_0

## Resumen

El modelo `groot` publicado por el usuario `mim-chess-vlas` es una política robótica entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment disenado para razonamiento y habilidades en robots humanoides. El checkpoint concreto corresponde a un experimento de manipulacion sobre un robot `Panda` con tres camaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y una tarea de picking de piezas geometricas complejas para depositarlas en una caja.

La relevancia de este checkpoint es acotada: no es un modelo generalista sino un fine-tuning especifico sobre un dataset de 790 episodios y 157.904 frames a 20 FPS, con nombres de tarea que describen objetos sinteticos de formas irregulares (bolas con brazos curvos, huevos con costillas, estrellas de cuatro puntas, etc.). El backbone declarado es Cosmos-Reason2/Qwen3-VL combinado con un transformer de acciones basado en flow matching, condicionado por vision, lenguaje y propiocepcion.

El modelo tiene 3.144.016.000 parametros segun los safetensors del repositorio (50,3 GB), aunque este dato refleja el checkpoint completo y no necesariamente los parametros activos durante inferencia. La licencia es Apache 2.0 y el formato de pesos es safetensors dentro del ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |
| Tipo de robot | Panda |
| Camaras | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Entrada de estado | observation.state, shape (9,) |
| Entrada visual | 3 imagenes RGB de (3, 224, 224) |
| Salida de accion | action, shape (7,) |
| Dataset de entrenamiento | mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__wrist_cameras__live |
| Episodios | 790 |
| Frames | 157.904 |
| Frame rate | 20 FPS |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA, que combina un backbone vision-lenguaje (Cosmos-Reason2/Qwen3-VL) con un transformer de acciones entrenado mediante flow matching. La politica predice acciones de 7 dimensiones condicionadas por el estado propioceptivo de 9 dimensiones y tres vistas RGB de 224x224 píxeles. Esta separacion entre percepcion semantica y generacion de acciones es la innovacion central de la familia GR00T: el backbone aporta comprension visual y linguistica, mientras que el cabezal de acciones se especializa en la dinamica motora.

El entrenamiento se realizo con LeRobot sobre el dataset `train_800_complex__mask__overlay_a75__sim__wrist_cameras__live`, compuesto por 790 episodios y 157.904 frames a 20 FPS. Las tareas descritas en la model card son instrucciones de picking de objetos sinteticos con geometrias complejas (formas lobuladas, estrellas, huevos con costillas, bloques con protuberancias), lo que sugiere un entorno simulado de manipulacion tipo benchmark. No se especifica el numero total de tokens de entrenamiento, la composicion del dataset mas alla de los episodios, ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Manipulacion robotica de picking and place: el modelo predice acciones de 7 grados de libertad para agarrar objetos y depositarlos en una caja.
- Percepcion multimodal: procesa tres camaras simultaneamente (vista de agente y dos vistas de muneca), lo que permite razonamiento espacial desde multiples angulos.
- Condicionamiento por lenguaje: las tareas se especifican mediante instrucciones textuales detalladas en ingles, lo que permite seleccionar el objeto objetivo entre distractores.
- Integracion con propiocepcion: consume el estado del robot de 9 dimensiones para adaptar las acciones a la configuracion actual del brazo.
- Control a 20 FPS: la frecuencia de entrenamiento permite politicas reactivas adecuadas para tareas de manipulacion dinamica.
- No se documentan capacidades de tool calling, agentes multi-paso ni thinking mode, ya que es una politica motora y no un modelo de lenguaje conversacional.

## Casos de uso

- Manipulacion de picking en linea de montaje: el modelo puede seleccionar piezas geometricas especificas descritas en lenguaje natural y depositarlas en contenedores, usando las tres camaras para desambiguar objetos similares.
- Investigacion en aprendizaje por imitacion: sirve como checkpoint de referencia para reproducir experimentos de GR00T N1.7 sobre el dataset publicado, permitiendo comparar variantes de entrenamiento.
- Benchmark de generalizacion visual: al incluir objetos con geometrias complejas y descripciones textuales detalladas, es util para evaluar la robustez de politicas vision-lenguaje-accion.
- Prototipado de politicas para robot Panda: el checkpoint puede desplegarse en un Franka Emika Panda real o simulado con las mismas tres camaras para validar la transferencia sim-a-real.
- Fine-tuning sobre dominios especificos: al estar bajo Apache 2.0, puede reentrenarse con datasets propios de manipulacion para adaptar el cabezal de acciones a nuevas tareas.
- Educacion en robotica: sirve como ejemplo didactico de como LeRobot integra un backbone VLM con un transformer de acciones para tareas de pick-and-place.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Con 3.144.016.000 parametros en safetensors (50,3 GB), la inferencia en precision completa requeriria del orden de 60-70 GB de VRAM, aunque no se confirma en la documentacion.
- GPU recomendadas: no disponible. Por tamano del checkpoint, GPUs de datacenter como A100 80 GB o H100 son las candidatas naturales, pero el autor no lo especifica.
- Cabe en consumer GPU: no confirmado. Un checkpoint de 50,3 GB no cabe en GPUs consumer de 24 GB (RTX 4090) sin cuantizacion, y no se documentan formatos cuantizados.
- Opciones de despliegue: LeRobot (libreria oficial de entrenamiento e inferencia). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a politicas roboticas.
- Latencia y throughput: no disponible. La frecuencia de entrenamiento es 20 FPS, lo que sugiere que la politica fue disenada para operar a esa cadencia, pero no se reportan mediciones de latencia en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groot (este checkpoint) | 3.144.016.000 | no disponible | Politica de manipulacion Panda | Apache 2.0 | HuggingFace |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible en la informacion | GitHub NVIDIA/Isaac-GR00T |
| Otros checkpoints LeRobot | no disponible | no disponible | Politicas de manipulacion | variable | HuggingFace |

No se dispone de datos de rendimiento comparativo entre este checkpoint y alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint especifico de una tarea y un robot (Panda con tres camaras); no es un modelo generalista y su rendimiento fuera de ese dominio no esta garantizado.
- Las instrucciones de tarea estan en ingles y describen objetos sinteticos; no se documenta soporte multilingue ni generalizacion a objetos del mundo real.
- El dataset parece ser simulado (`__sim__` en el nombre), por lo que existe una brecha sim-a-real no cuantificada.
- No se reportan evaluaciones de sesgo, alucinacion ni robustez; al ser una politica motora, el riesgo principal es de ejecucion incorrecta de acciones, no de generacion de texto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del backbone GR00T N1.7 de NVIDIA, cuyas condiciones de uso deben verificarse por separado.
- El repositorio tiene solo 15 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se documentan procesos de cuantizacion ni formatos alternativos de pesos, lo que limita el despliegue en hardware modesto.

## Enlaces

- HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__wrist_cameras__live__groot__seed_0
- Dataset: https://huggingface.co/datasets/mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__wrist_cameras__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guia LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot

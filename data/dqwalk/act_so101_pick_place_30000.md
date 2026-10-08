# DQwalk/act_so101_pick_place_30000

## Resumen

DQwalk/act_so101_pick_place_30000 es una politica de robotica entrenada mediante aprendizaje por imitacion con el metodo ACT (Action Chunking with Transformers) y publicada en HuggingFace Hub a traves de la libreria LeRobot. No es un modelo de lenguaje ni un modelo multimodal de proposito general: es un controlador visuomotor que, a partir del estado articular de un brazo robotico SO-101 y de una imagen cenital de 480x640, emite comandos de accion de 6 dimensiones para ejecutar una unica tarea: coger un bloque azul y depositarlo en un cuadrado verde.

El modelo tiene 51.668.614 parametros (unos 51,7 M) y ocupa 0,2 GB en el repositorio. Se entreno durante 30.000 pasos sobre un dataset propio de 50 episodios y 24.776 fotogramas grabados a 30 FPS mediante teleoperacion. Está pensado para desplegarse sobre el brazo de bajo coste SO-101 (tipo de robot `so_follower`) con una sola camara cenital, por lo que su interes es practico y acotado: reproducir una politica de pick-and-place en hardware accesible.

Su relevancia radica en que forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluacion y el despliegue de politicas roboticas con pesos en safetensors y comandos de CLI reproducibles. El autor no ha publicado resultados de evaluacion en robot real, por lo que el rendimiento de la politica no puede verificarse a partir de la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT); politica de aprendizaje por imitacion |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; consume una observacion por fotograma (no hay ventana de tokens) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors sin cuantizaciones alternativas |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `top` (una camara cenital) |
| Entradas | `observation.state` (6,) y `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | DQwalk/so101_pick_place_20261007_154943 (50 episodios, 24.776 fotogramas, 30 FPS) |
| Tarea | "Pick up the blue block and put it in the green square" |
| Pasos de entrenamiento | 30.000 |
| Tamano del repositorio | 0,2 GB |
| Version de LeRobot | 0.6.2 |
| Fecha de publicacion | 7 de octubre de 2026 (segun metadatos del Hub) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo implementa el metodo ACT descrito en el paper referenciado (arXiv:2304.13705), una tecnica de aprendizaje por imitacion que predice trozos cortos de acciones (action chunks) en lugar de un unico paso de control. Este enfoque reduce el error de acumulacion en horizontes largos y suaviza la ejecucion en tareas de manipulacion de grano fino. En LeRobot, `act` se materializa como una politica que combina un codificador visual (para el fotograma de la camara cenital) y un modulo transformer que mapea estado y representacion visual a la secuencia de acciones. Los detalles concretos de la implementacion (numero de capas, dimension del chunk, backbone visual) no se especifican en la model card y se marcan como no disponibles.

El entrenamiento se realizo sobre datos de teleoperacion: 50 episodios, 24.776 fotogramas a 30 FPS, una sola tarea y una sola camara. La configuracion reportada es de 30.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni tecnicas de refinamiento posteriores, algo esperable en este tipo de politicas de imitacion. Tampoco se indica ninguna innovacion adicional sobre el metodo ACT estandar (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Control visuomotor de un brazo SO-101 de 6 grados de libertad: mapea estado articular de 6 dimensiones mas imagen cenital a comandos de accion de 6 dimensiones.
- Ejecucion de una tarea unica de pick-and-place: coger un bloque azul y colocarlo en un cuadrado verde.
- Generacion de secuencias de acciones por chunks, lo que permite movimientos mas continuos que el control paso a paso.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de definir recompensas ni un simulador.
- Ejecucion en bucle cerrado a la frecuencia del sistema de control (el dataset se grabo a 30 FPS).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificacion simbolica; la "planificacion" se limita al chunk de acciones.
- No tiene capacidades multilingues: no procesa ni genera texto.
- No dispone de modo de razonamiento (thinking mode), vision general, audio ni ninguna capacidad multimodal fuera del fotograma de entrada.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio o aula: el modelo controla un SO-101 para mover una pieza de una posicion conocida a otra, con una unica camara cenital como unica fuente visual, lo que simplifica el montaje experimental.
- Punto de partida para fine-tuning en LeRobot: al estar publicado con la libreria `lerobot` y licencia Apache 2.0, sirve como inicializacion para reentrenar con un dataset propio mediante `lerobot-train --policy.type=act`, ajustando la politica a nuevas tareas o posiciones de objeto.
- Referencia comparativa en investigacion sobre ACT: permite contrastar arquitecturas o hiperparametros frente a una politica ya entrenada con un protocolo conocido (30.000 pasos, batch 8, lr 1e-5, semilla 1000).
- Docencia en robotica de bajo coste: el SO-101 es un brazo asequible y LeRobot ofrece guias de montaje, calibracion y despliegue, de modo que esta politica puede usarse en practicas de aprendizaje por imitacion sin infraestructura cara.
- Banco de pruebas de robustez: sirve para medir como degrada una politica ACT ante cambios de iluminacion, posicion del objeto, distractores o una camara distinta, ya que la model card no reporta evaluacion alguna.
- Prototipado de celulas de clasificacion sencillas: en una linea educativa o de demostracion, el modelo puede integrarse en un flujo repetitivo de recogida y colocacion de una pieza concreta, siempre que el objeto y el destino coincidan con los de entrenamiento.
- Integracion en pipelines de robotica con `lerobot-rollout`: el comando de despliegue documentado permite lanzar la politica durante una duracion fija (por ejemplo 60 s) y registrar o no los episodios segun la estrategia elegida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la linea "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de exito en robot real, numero de ensayos ni condiciones de evaluacion documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51.668.614 parametros, aproximadamente 207 MB en FP32, 104 MB en FP16/BF16 y 52 MB en INT8 (estimaciones a partir del recuento de parametros, no cifras oficiales).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo es pequeno en comparacion con un transformer de lenguaje. No se especifica una GPU minima en la documentacion.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (por ejemplo RTX 3060, RTX 4090) e incluso en GPUs integradas o CPU, dado el tamano del modelo y de la entrada (480x640).
- Despliegue: la via documentada es LeRobot mediante `lerobot-rollout` con `--policy.path=DQwalk/act_so101_pick_place_30000`; no se documentan rutas de exportacion a ONNX, TensorRT, vLLM, TGI, llama.cpp u Ollama (no aplicables a este tipo de politica).
- Latencia y throughput: no disponibles. El requisito practico lo impone el bucle de control, ya que los datos se grabaron a 30 FPS y el modelo debe producir acciones a esa cadencia para un movimiento fluido.
- Almacenamiento: 0,2 GB de repositorio; los checkpoints de entrenamiento se escriben en `outputs/train/<policy_repo_id>/checkpoints/` si se reentrena.

## Comparativa con modelos similares

| Modelo | Tipo | Robot | Tarea | Parametros | Contexto | Rendimiento publicado | Licencia |
|---|---|---|---|---|---|---|---|
| DQwalk/act_so101_pick_place_30000 | ACT (imitation learning) | SO-101 (`so_follower`) | Pick and place de bloque azul | 51,7 M | no aplica | no disponible | Apache 2.0 |
| AriRyo/so101-pickplace_policy | ACT (imitation learning, LeRobot) | SO-101 | Pick and place | no disponible | no aplica | no disponible | no disponible |
| AM-101/act_so101_pickplace | ACT (imitation learning, LeRobot) | SO-101 | Pick and place | no disponible | no aplica | no disponible | no disponible |
| shiangyu/act_so101_pick_place_v2 | ACT (imitation learning, LeRobot) | SO-101 | Pick and place | no disponible | no aplica | no disponible | no disponible |

Los tres modelos comparables aparecen en los resultados de busqueda como politicas ACT entrenadas con LeRobot para el mismo tipo de robot y tarea, pero no se dispone de sus fichas tecnicas completas (parametros, licencia, contexto o evaluacion), por lo que la comparacion se limita al tipo de metodo y al robot objetivo.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce la tasa de exito real, el numero de ensayos y las condiciones en las que la politica funciona.
- Tarea unica y no generalizable: solo se entreno para "Pick up the blue block and put it in the green square"; no se espera que funcione con otros objetos, colores o destinos sin reentrenar.
- Sesgo de los datos de teleoperacion: 50 episodios grabados por una persona concreta en un entorno concreto pueden introducir sesgos de posicion, iluminacion, fondo y estilo de movimiento.
- Dependencia de la camara: la politica espera una camara cenital de 480x640 y los nombres de las camaras deben coincidir exactamente con las claves de observacion usadas en el entrenamiento (`observation.images.top`).
- Dependencia del hardware: el tipo de robot declarado es `so_follower`; cambios de calibracion, de brazo o de cinematica pueden degradar o invalidar el comportamiento.
- Riesgo de alucinacion en el sentido de acciones incorrectas: como toda politica de imitacion, puede generar comandos plausibles pero erroneos ante observaciones fuera de distribucion.
- Sin capacidades de lenguaje, tool calling ni razonamiento simbolico: no es adecuado para tareas de dialogo, agentes o procesamiento de texto.
- Idiomas soportados: no aplicable, no disponible.
- Licencia Apache 2.0: permite uso comercial y modificacion siempre que se conserven los avisos de licencia y atribucion; conviene citar el metodo ACT y LeRobot segun indica la model card.
- Cero descargas y cero likes en el momento de la consulta: no existe evidencia de uso o validacion por parte de la comunidad.
- Fecha de publicacion inusual en los metadatos (2026-10-07): conviene verificarla antes de referenciar el modelo en un contexto de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DQwalk/act_so101_pick_place_30000
- Dataset de entrenamiento: https://huggingface.co/datasets/DQwalk/so101_pick_place_20261007_154943
- Paper del metodo ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de la politica ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=DQwalk/so101_pick_place_20261007_154943
- Modelo comparable: https://huggingface.co/AriRyo/so101-pickplace_policy
- Modelo comparable: https://huggingface.co/AM-101/act_so101_pickplace
- Modelo comparable: https://huggingface.co/shiangyu/act_so101_pick_place_v2
- Entrada de directorio del modelo comparable: https://essamamdani.com/ai-models/hf-shiangyu-act-so101-pick-place-v2

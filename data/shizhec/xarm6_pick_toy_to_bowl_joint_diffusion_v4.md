# Shizhec/xarm6_pick_toy_to_bowl_joint_diffusion_v4

## Resumen

xarm6_pick_toy_to_bowl_joint_diffusion_v4 es una politica de control visuomotor entrenada mediante imitacion para un brazo robotico UFACTORY (familia xArm6). El modelo resuelve una unica tarea de manipulacion: coger un juguete y depositarlo en un cuenco ("Pick up the toy and place it into the bowl."). Lo desarrolla el usuario Shizhec y se distribuye a traves del Hub de HuggingFace usando la libreria LeRobot.

Se trata de una implementacion de Diffusion Policy (paper arXiv:2303.04137), un enfoque que modela el control visuomotor como un proceso generativo de difusion. En lugar de predecir una accion unica, la politica genera trayectorias de accion suaves y multimodales, lo que resulta especialmente util en tareas de manipulacion con contacto rico. El modelo consume dos flujos de imagen RGB (camaras frontal y de muneca) a 480x640 y el estado propioceptivo del robot, y produce un vector de accion conjunto de 7 dimensiones.

El checkpoint tiene 91.503.927 parametros, ocupa 0,4 GB en el repositorio y se distribuye en formato safetensors bajo licencia Apache 2.0. Fue entrenado con 75 episodios (34.673 fotogramas a 30 FPS) durante 150.000 pasos con LeRobot 0.6.1. Es relevante como ejemplo reproducible de politica de difusion para robotica de bajo coste, aunque su alcance es estrictamente monoTarea y carece de resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusion condicionado para control visuomotor); backbone concreto no disponible |
| Parametros totales | 91.503.927 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: es una politica de control, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robotica sin interfaz de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | UFACTORY Robot (xArm6) |
| Camaras de entrada | front, wrist |
| Entrada de estado | observation.state, forma (7,) |
| Entrada visual | observation.images.front (3, 480, 640) y observation.images.wrist (3, 480, 640) |
| Salida | action, forma (7,) |
| Tamano del repositorio | 0,4 GB |
| Libreria | lerobot |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card cita explicitamente el metodo Diffusion Policy (arXiv:2303.04137), que plantea el control visuomotor como un proceso generativo de difusion: la politica aprende a invertir un proceso de ruido para producir secuencias de acciones coherentes en el tiempo, en lugar de regresar una accion puntual. Esto permite representar distribuciones multimodales de comportamiento y generar trayectorias suaves, una propiedad util en manipulacion con contacto. El detalle exacto del backbone (UNet convolucional, transformer u otra variante) no se especifica en la informacion disponible.

El entrenamiento se realizo con LeRobot 0.6.1 durante 150.000 pasos, con tamano de lote 32, optimizador Adam, tasa de aprendizaje 0,0001 y semilla 0. El conjunto de datos es Shizhec/xarm6_pick_toy_to_bowl_joint_v3, compuesto por 75 episodios y 34.673 fotogramas capturados a 30 FPS sobre la tarea de recoger un juguete y dejarlo en un cuenco. No se documenta composicion adicional del dataset, uso de RLHF/DPO (no aplicable en este dominio) ni innovaciones tecnicas adicionales mas alla del propio metodo de difusion.

## Capacidades

- Control visuomotor de manipulacion: genera comandos de accion de 7 grados de libertad a partir de observaciones visuales y de estado.
- Fusion de dos vistas de camara (frontal y de muneca) mas estado propioceptivo del robot.
- Generacion de trayectorias de accion multimodales y temporalmente coherentes, caracteristica del enfoque de difusion.
- Ejecucion de una tarea concreta de pick-and-place: coger un juguete y depositarlo en un cuenco.
- Integracion con LeRobot para despliegue en robot real mediante el comando `lerobot-rollout`.
- Reentrenamiento y ajuste fino mediante `lerobot-train` con `--policy.type=diffusion`.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje natural.
- No dispone de modo de razonamiento explicito, vision general, audio ni generacion de texto.

## Casos de uso

- Despliegue de pick-and-place en un xArm6 real: la politica se ejecuta con `lerobot-rollout` sobre el robot y las camaras frontal y de muneca, reproduciendo la tarea aprendida sin necesidad de programacion explicita de trayectorias.
- Recogida automatica de objetos en linea de laboratorio: con 34.673 fotogramas de demostracion a 30 FPS, la politica puede trasladar objetos ligeros de una posicion inicial a un contenedor fijo.
- Base para ajuste fino en tareas similares: al ser una politica de difusion entrenada con LeRobot, sirve como punto de partida para reentrenar con nuevos datasets de pick-and-place en el mismo robot.
- Referencia reproducible para investigacion en imitation learning: permite reproducir el flujo completo de grabacion de datos, entrenamiento y evaluacion de Diffusion Policy con hardware UFACTORY.
- Evaluacion de estrategias de control generativo frente a politicas deterministas (por ejemplo, ACT o regresion directa) en tareas con contacto.
- Prototipado en robotica educativa: el bajo numero de parametros y el tamano reducido del repositorio facilitan desplegar el modelo en equipos con GPU modesta para docencia o demostraciones.
- Generacion de datos sinteticos o de comparacion: las trayectorias generadas por difusion pueden analizarse para estudiar multimodalidad del comportamiento.
- Integracion en pipelines de evaluacion automatizada de politicas roboticas dentro del ecosistema LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica y que la tabla de exito por tarea (pruebas, exitos, tasa de exito) permanece vacia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,37 GB solo para los pesos en fp32 (91,5 M de parametros) y unos 0,18 GB en fp16; sumando activaciones de dos imagenes de 480x640 y el proceso de difusion, una estimacion razonable es de 2 a 4 GB en total. Es una estimacion, no un dato oficial.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM. Modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes en memoria; las GPU de gama alta aportan margen para ejecutar el bucle de control a 30 FPS.
- Cabe en GPU de consumo: si. El modelo es lo bastante pequeno para ejecutarse en GPU de gama de entrada y, en principio, incluso en CPU, aunque con latencia mucho mayor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion, `lerobot-train` para entrenamiento) sobre PyTorch con CUDA. No aplican servidores de inferencia de lenguaje como vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de texto.
- Latencia y throughput estimados: no disponibles. El modelo se entrena y ejecuta a 30 FPS en la captura de datos, pero la informacion proporcionada no incluye mediciones de latencia ni de frecuencia de inferencia efectiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xarm6_pick_toy_to_bowl_joint_diffusion_v4 | 91.503.927 | no disponible | sin resultados publicados | apache-2.0 | HuggingFace (LeRobot) |
| Diffusion Policy (implementacion original, arXiv:2303.04137) | no disponible | no disponible | reportado en el paper, no comparable directamente | no disponible | publicacion cientifica |
| ACT (Action Chunking Transformer), disponible en LeRobot | no disponible | no disponible | no disponible para esta tarea | no disponible | HuggingFace (LeRobot) |
| Otras politicas LeRobot de pick-and-place | no disponible | no disponible | no disponible | variable | HuggingFace (LeRobot) |

No se dispone de datos homogeneos de parametros, contexto o rendimiento para los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La comparacion relevante es metodologica: Diffusion Policy frente a politicas deterministas tipo ACT, con la difusion ofreciendo ventajas en distribuciones de accion multimodales y tareas con contacto.

## Limitaciones y advertencias

- Ambito monoTarea: la politica esta entrenada exclusivamente para "Pick up the toy and place it into the bowl." y no generaliza a otras instrucciones.
- Sin resultados de evaluacion: no hay tasas de exito publicadas, por lo que el rendimiento real en robot es desconocido.
- Dataset reducido: 75 episodios y 34.673 fotogramas son un volumen bajo, lo que incrementa el riesgo de sobreajuste a posiciones, iluminacion y objetos concretos de la captura.
- Dependencia de la configuracion de camaras: los nombres y tipos de camara deben coincidir con las claves de observacion del entrenamiento (`front`, `wrist`); un cambio de montaje o de calibracion puede degradar el comportamiento.
- Especifico de hardware: asume un robot UFACTORY (xArm6) con cinematica y espacio de acciones de 7 dimensiones; no es trasladable directamente a otros brazos sin reentrenamiento.
- Riesgo de fallo en contacto: aunque la difusion mejora la coherencia de trayectorias, la ausencia de evaluacion impide descartar fallos en agarre, colision o precision.
- Sesgos: no se documentan analisis de sesgo; en robotica esto se traduce en sesgo hacia las condiciones fisicas y los objetos presentes en el dataset de demostracion.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; no se documentan restricciones adicionales.
- Sin soporte de lenguaje ni de instrucciones en lenguaje natural: no puede interpretar ordenes de texto ni cambiar de tarea dinamicamente.
- Caveat de fecha: el repositorio esta creado y actualizado en 2026-09-14 y registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shizhec/xarm6_pick_toy_to_bowl_joint_diffusion_v4
- Dataset de entrenamiento: https://huggingface.co/datasets/Shizhec/xarm6_pick_toy_to_bowl_joint_v3
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Shizhec/xarm6_pick_toy_to_bowl_joint_v3
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

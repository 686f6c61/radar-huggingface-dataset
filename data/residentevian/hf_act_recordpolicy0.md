# ResidentEvian/hf_act_recordpolicy0

## Resumen

ResidentEvian/hf_act_recordpolicy0 es una política robótica de imitación entrenada con LeRobot y basada en el método Action Chunking with Transformers (ACT). No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un robot y una imagen de cámara, y devuelve directamente comandos de acción. El modelo tiene 51.668.614 parámetros (~51,7 M) y se distribuye en formato safetensors con licencia Apache 2.0.

La política se ha entrenado sobre el dataset ResidentEvian/bottle-cap-pick-up, compuesto por 50 episodios y 31.725 fotogramas grabados a 30 FPS con un robot de tipo so_follower y una única cámara frontal de 640x480. La tarea aprendida es concreta: "Pick up the bottle cap and place it on the O letter". El entrenamiento se realizó durante 20.000 pasos con batch de 8, optimizador AdamW y learning rate de 1e-5.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible y de bajo coste de un pipeline completo de aprendizaje por imitación con LeRobot 0.6.2, desde la teleoperación y grabación hasta el despliegue con `lerobot-rollout`. Es un artefacto de investigación o demo, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador CVAE en entrenamiento y codificadores visuales convolucionales |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política robótica, no LLM); ventana de observación no disponible |
| Tipos de cuantizacion | No disponible (LeRobot ejecuta el modelo en fp32 por defecto) |
| Idiomas soportados | No disponible (no procesa lenguaje; la tarea se especifica como cadena de texto fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Tipo de robot | so_follower |
| Camaras | front, resolucion (3, 480, 640) |
| Entradas | observation.state `(6,)`, observation.images.front `(3, 480, 640)` |
| Salidas | action `(6,)` |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo implementa el método ACT descrito en el articulo arXiv:2304.13705, un enfoque de aprendizaje por imitacion que predice secuencias cortas de acciones (chunks) en lugar de un unico paso. La arquitectura combina un transformer que decodifica el chunk de acciones con codificadores visuales para las imagenes de la camara frontal y un codificador CVAE que solo se usa durante el entrenamiento, aportando una variable latente de estilo. La observacion de estado tiene 6 dimensiones y la accion tambien 6, lo que corresponde a una configuracion de brazo con pinza. Los valores concretos de tamano de chunk, dimension del modelo, capas, cabezas y resolucion de los codificadores visuales no estan publicados en la informacion disponible.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset bottle-cap-pick-up: 50 episodios teleoperados, 31.725 fotogramas a 30 FPS, una sola tarea y una unica camara. Se ejecutaron 20.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni ningun esquema de refinamiento posterior; es aprendizaje supervisado por imitacion puro. Tampoco se detalla si se aplico decodificacion temporal por ensembles (temporal ensembling), una tecnica habitual en ACT pero no confirmada aqui.

## Capacidades

- Generacion de acciones motoras continuas: produce vectores de accion de 6 dimensiones a partir del estado articular y de una imagen.
- Manipulacion visomotora de una tarea especifica: recoger un tapon de botella y colocarlo sobre la letra O.
- Aprendizaje por imitacion: replica la distribucion de comportamientos presente en los 50 episodios teleoperados.
- Control a partir de una unica camara frontal (monocular), sin necesidad de vision estereo o de profundidad.
- Prediccion de chunks de acciones: la politica emite secuencias de acciones en lugar de pasos aislados, lo que reduce la acumulacion de error y suaviza el movimiento.
- Ejecucion en bucle cerrado a 30 FPS sobre el robot so_follower.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingues ni modo de pensamiento. No es un modelo de lenguaje ni un agente.
- No tiene capacidades de vision de proposito general (deteccion, OCR, VQA); su modulo visual esta especializado en la tarea entrenada.

## Casos de uso

- Demostracion de extremo a extremo con LeRobot: sirve como politica de referencia para reproducir el flujo completo (instalacion, calibracion, grabacion, entrenamiento y despliegue) con un coste de computo minimo, al ser un modelo de ~51,7 M de parametros.
- Punto de partida para fine-tuning en una tarea propia: dado su tamano reducido, se puede reentrenar sobre un dataset nuevo de pocas decenas de episodios en una GPU de gama media en horas.
- Automatizacion de pick-and-place de objetos pequenos en linea de laboratorio: el modelo ya aprende a coger un tapon y depositarlo en una posicion concreta, patron extrapolable a tareas de clasificacion o alimentacion de piezas.
- Benchmark interno de infraestructura robotica: al tener entradas y salidas perfectamente definidas (estado `(6,)`, imagen `(3,480,640)`, accion `(6,)`), es util para validar latencias, sincronizacion de camaras y control en bucle cerrado a 30 FPS.
- Docencia e investigacion en aprendizaje por imitacion: permite estudiar el comportamiento de ACT frente a variaciones de posicion, iluminacion o distracciones sin depender de hardware caro.
- Base para experimentos de robustez: evaluar como degrada la politica ante cambios de posicion del objeto, oclusiones o ligera modificacion de la iluminacion, comparando con otros checkpoints ACT publicados.
- Prototipado rapido de politicas para robots de bajo coste tipo SO-100/SO-101 (so_follower), donde no cabe un modelo de difusion o un VLA grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion vacia y declara explicitamente: "No evaluation results have been provided for this policy yet." No existen datos de tasa de exito en robot real, ni numero de intentos, ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- Peso del modelo en fp32: aproximadamente 207 MB (51,7 M de parametros x 4 bytes). En fp16, unos 103 MB. En int8, unos 52 MB.
- VRAM estimada para inferencia: entre 1 y 2 GB en fp32 considerando pesos mas activaciones de los codificadores visuales y del transformer; notablemente menos en fp16.
- GPU recomendadas: cualquier GPU con CUDA y al menos 4 GB de VRAM. Ejemplos practicos: RTX 3060, RTX 4060, RTX 4090, A100, H100. Para despliegue embebido, Jetson Orin Nano o Orin NX.
- Cabe en GPU de consumo: si, con margen amplio, en practicamente cualquier GPU discreta moderna e incluso en iGPU con soporte CUDA/ROCm suficiente.
- Ejecucion en CPU: tecnicamente posible por el tamano del modelo, pero el bucle de control a 30 FPS exige latencias de unos 33 ms por paso, por lo que no es la opcion recomendada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=ResidentEvian/hf_act_recordpolicy0`) sobre PyTorch. No aplican vLLM, TGI, llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. El sistema esta disenado para operar en linea con el robot a 30 FPS, frecuencia de grabacion del dataset de entrenamiento.
- Entrenamiento: la configuracion documentada (20.000 pasos, batch 8) es asumible en una unica GPU de gama media; no se especifica el hardware empleado por el autor.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint ni de los modelos comparables, por lo que la comparacion se limita a caracteristicas estructurales verificables. En el Hub existen copias o variantes con el mismo nombre de repositorio en otras cuentas (thanhnguyen23/hf_act_recordpolicy0, iFaz/hf_act_recordpolicy0), lo que sugiere una plantilla o espejo mas que modelos independientes evaluados.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ResidentEvian/hf_act_recordpolicy0 (ACT) | 51,7 M | No aplica | No disponible | Apache 2.0 | HuggingFace, 0 descargas |
| thanhnguyen23/hf_act_recordpolicy0 (ACT) | No disponible | No aplica | No disponible | No disponible | HuggingFace |
| iFaz/hf_act_recordpolicy0 (ACT) | No disponible | No aplica | No disponible | No disponible | HuggingFace |
| Diffusion Policy | No disponible | No aplica | No disponible | No disponible | Referencia metodologica |

## Limitaciones y advertencias

- Especializacion extrema: la politica solo ha visto una tarea, un robot (so_follower) y una camara frontal. Fuera de esa configuracion su comportamiento es impredecible.
- Sin evaluacion publicada: no hay tasa de exito, numero de intentos ni condiciones de prueba, por lo que no se puede afirmar que la tarea se resuelva de forma fiable.
- Sensibilidad al dominio visual: cambios de iluminacion, posicion del objeto, fondo o distracciones pueden degradar el rendimiento, ya que el dataset es pequeno (50 episodios, 31.725 fotogramas).
- Una sola camara y sin profundidad: tareas que requieran estimacion de distancia fina o resolucion de oclusiones quedan fuera de su alcance.
- Acoplamiento al hardware: las claves de observacion (`observation.images.front`) y la dimension de estado y accion `(6,)` deben coincidir exactamente con las del robot de destino; si no, la inferencia falla o produce acciones invalidas.
- Riesgo de sobreajuste a la configuracion de teleoperacion: pequenas diferencias de calibracion entre robots del mismo tipo pueden provocar derivas.
- Reproducibilidad limitada de los resultados: al no publicarse el checkpoint intermedio, las metricas de entrenamiento ni el hardware, no se puede verificar la convergencia del modelo.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y la atribucion. No impone restricciones de campo de uso, pero tampoco ofrece garantias.
- Caveat de procedencia: el nombre del repositorio y la existencia de copias homonimas en otras cuentas sugieren que puede tratarse de un artefacto generado o espejado de forma automatica; conviene verificar el contenido real de los pesos antes de usarlo en produccion.
- No es un LLM: no procesa instrucciones en lenguaje natural mas alla de la cadena de tarea fija, no razona y no soporta tool calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ResidentEvian/hf_act_recordpolicy0
- Dataset de entrenamiento: https://huggingface.co/datasets/ResidentEvian/bottle-cap-pick-up
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Paper en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento (imitation learning): https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ResidentEvian/bottle-cap-pick-up
- Copia homonima en otra cuenta: https://huggingface.co/thanhnguyen23/hf_act_recordpolicy0
- Copia homonima en otra cuenta: https://huggingface.co/iFaz/hf_act_recordpolicy0

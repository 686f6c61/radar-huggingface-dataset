# arrg-unam/molmoact2_omx_hidroferol

## Resumen

`arrg-unam/molmoact2_omx_hidroferol` es un checkpoint de politica robotica (vision-lenguaje-accion) publicado por el usuario `arrg-unam` y entrenado sobre el modelo fundacional de robotica abierto MolmoAct2, desarrollado por el Allen Institute for AI (Ai2). El modelo consume imagenes de camara e instrucciones en lenguaje natural y produce "chunks" de acciones de robot; en este caso concreto esta ajustado para el robot `omx_follower` con dos camaras (`front` y `wrist`) y una tarea unica: "Pickup the hidroferol and put it in the box".

Se trata de un ajuste fino de imitacion (imitation learning) realizado con la libreria LeRobot 0.5.2 sobre el dataset `arrg-unam/omx_pick_hidroferol` (105 episodios, 104 180 fotogramas a 30 FPS). El repositorio ocupa 10,9 GB y contiene 5 442 196 272 parametros almacenados en safetensors, lo que situa al modelo en la categoria de ~5,4 B de parametros.

Su relevancia es practica mas que de investigacion: demuestra el flujo completo de LeRobot para adaptar un modelo fundacional de robotica a un brazo concreto con un dataset pequeno y 1000 pasos de entrenamiento. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, pero no cuenta con resultados de evaluacion publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en MolmoAct2; detalles internos de la arquitectura base no disponibles |
| Parametros totales | 5 442 196 272 (~5,44 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible (la instruccion de tarea del dataset esta en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | `omx_follower` |
| Camaras | `front`, `wrist` |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 10,9 GB |
| Descargas / likes | 11 / 0 |

## Arquitectura y entrenamiento

MolmoAct2 se describe en la model card como un modelo fundacional de robotica abierto de Ai2 que mapea imagenes de camara e instrucciones de lenguaje a chunks de acciones de robot. La implementacion utilizada es la de LeRobot, que soporta entrenamiento y evaluacion del modelo MolmoAct2 "regular" mediante el tipo de politica `molmoact2`. La informacion proporcionada no detalla el backbone concreto (composicion del codificador visual, el modelo de lenguaje subyacente, el cabezal de acciones ni si emplea decodificacion autorregresiva o flow matching), por lo que esos detalles quedan como no disponibles.

El ajuste fino se realizo por imitacion supervisada sobre el dataset `arrg-unam/omx_pick_hidroferol`, compuesto por 105 episodios y 104 180 fotogramas capturados a 30 FPS para una unica tarea de picking. La configuracion de entrenamiento declarada es: 1000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.5.2. No se documenta el numero total de tokens ni la composicion del dataset mas alla de la tarea, ni se menciona una fase de RLHF o DPO (procedimiento poco habitual en politicas de imitacion robotica).

## Capacidades

- Generacion de acciones de robot a partir de observaciones visuales: convierte dos imagenes RGB de 480x640 y un vector de estado de 6 dimensiones en un vector de accion de 6 dimensiones.
- Seguimiento de instrucciones en lenguaje natural para una tarea concreta: "Pickup the hidroferol and put it in the box".
- Control de un brazo robotico tipo `omx_follower` con efector final, usando estado articular de 6 grados de libertad.
- Fusion multimodal de dos vistas de camara simultaneas (vista frontal y vista de muneca), lo que aporta informacion complementaria para el agarre.
- Ejecucion en bucle cerrado mediante `lerobot-rollout` con estrategia `base`, con duracion configurable.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision general, audio ni modo "thinking". El modelo es una politica robotica, no un asistente conversacional general.
- No se documentan capacidades multilingues; la unica instruccion registrada esta en ingles.

## Casos de uso

- Automatizacion de picking en laboratorio: el modelo esta ajustado especificamente para recoger un objeto concreto (hidroferol) y depositarlo en una caja, con lo que puede integrarse en una celda robotica de laboratorio que repita esa tarea de forma continua.
- Base para reentrenamiento con nuevos objetos: sirve como punto de partida (`--policy.type=molmoact2`) para ajustar el mismo backbone a otras tareas de recogida y colocacion con el mismo robot y el mismo montaje de camaras.
- Referencia de pipeline completo con LeRobot: util para equipos que quieran reproducir el flujo de captura de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout` sin partir de cero.
- Prototipado de manipulacion en investigacion academica: al ser Apache 2.0 y de tamano moderado (~5,4 B), permite experimentar con politicas VLA en un solo servidor con GPU sin licencias restrictivas.
- Validacion de montajes de camaras: el modelo espera exactamente dos vistas (`front`, `wrist`) a 640x480 y 30 FPS, por lo que sirve para verificar la calibracion y la sincronizacion del hardware antes de escalar a otras tareas.
- Docencia y demostraciones de imitation learning: permite mostrar de forma tangible como un dataset pequeno (105 episodios) y 1000 pasos de entrenamiento producen una politica ejecutable en robot real.
- Benchmark interno de infraestructura: util para medir latencia de inferencia y throughput del stack LeRobot + PyTorch en el hardware disponible antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la nota explicita "No evaluation results have been provided for this policy yet", es decir, el autor no ha reportado numero de ensayos, exitos ni tasa de exito en robot real. Tampoco hay resultados de MMLU, HumanEval, GSM8K ni de suites de robotica como LIBERO o SimplerEnv.

## Requisitos de hardware

- VRAM estimada para los pesos: ~10,9 GB en bf16/fp16 (coincide con el tamano del repo) y ~21,8 GB en fp32.
- Cuantizacion: el repositorio solo publica safetensors sin cuantizar; no hay versiones GGUF, AWQ ni GPTQ documentadas. Una conversion manual a int8 (~5,4 GB) o int4 (~2,7 GB) reduciria el uso de VRAM, pero no esta soportada oficialmente por LeRobot.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en bf16 con margen para activaciones.
- Cabe en GPU de consumo: si, en bf16 en RTX 4090 y RTX 3090 (24 GB). En GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) el ajuste es justo y probablemente requiera cuantizacion o reduccion de resolucion de imagen.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=arrg-unam/molmoact2_omx_hidroferol`), PyTorch con CUDA (`--policy.device=cuda`) y entrenamiento con `lerobot-train`. No hay soporte documentado para vLLM, TGI, Ollama o llama.cpp, que no son vias habituales para politicas de robot.
- Latencia y throughput: no disponibles. Como referencia del montaje, la captura de datos y el control se hacen a 30 FPS, lo que implica un presupuesto de ~33 ms por ciclo de inferencia, pero no se ha publicado ninguna medicion real de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `arrg-unam/molmoact2_omx_hidroferol` | ~5,44 B | no disponible | Apache 2.0 | HuggingFace, libreria `lerobot` | Ajuste de MolmoAct2 para `omx_follower`; sin evaluacion publicada |
| MolmoAct2 (base, Ai2) | no disponible en la informacion proporcionada | no disponible | Apache 2.0 (segun el repo derivado) | Blog y pesos de Ai2 | Modelo fundacional de robotica del que deriva este checkpoint |
| OpenVLA (alternativa publica de referencia) | ~7 B | no disponible | Licencia propia de OpenVLA (no Apache 2.0) | HuggingFace | Politica VLA generica; no verificada con los datos de esta ficha |
| SmolVLA (alternativa publica de referencia) | ~0,45 B | no disponible | Apache 2.0 | HuggingFace, integrado en LeRobot | Mucho mas pequeno; disenado para hardware de consumo |

Los datos de OpenVLA y SmolVLA proceden de informacion publica general y no de la busqueda web ni de la model card; conviene verificarlos contra sus repositorios oficiales antes de usarlos en una decision tecnica. No se dispone de comparativas de rendimiento medidas entre estos modelos y el checkpoint aqui descrito.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor no ha publicado tasas de exito ni numero de ensayos, por lo que no hay evidencia cuantitativa de que la politica funcione de forma fiable en robot real.
- Entrenamiento muy corto: 1000 pasos con batch size 8 y learning rate 1e-05 sobre 105 episodios es un regimen de ajuste minimo; es probable que la politica sea sensible a variaciones de posicion del objeto, iluminacion y distractores.
- Tarea unica y dependiente del contexto: el modelo esta especializado en "Pickup the hidroferol and put it in the box"; fuera de esa instruccion y ese objeto no hay garantia de comportamiento coherente.
- Dependencia estricta del hardware: las claves de observacion (`observation.images.front`, `observation.images.wrist`, `observation.state` de 6 dimensiones) deben coincidir exactamente con el montaje usado en el entrenamiento, incluidos nombres de camara, resolucion 640x480 y 30 FPS. Cualquier cambio exige reentrenar.
- Sin informacion sobre sesgos: no se documentan sesgos conocidos, pero tampoco se describe la demografia, los escenarios ni la variabilidad del dataset de captura, mas alla de la lista de episodios y fotogramas.
- Riesgo de alucinacion en el sentido de acciones plausibles pero incorrectas: al ser una politica de imitacion, puede generar trayectorias que parezcan correctas y no culminen la tarea; sin metrica de exito no puede acotarse ese riesgo.
- Limitaciones de idioma: la unica instruccion documentada esta en ingles; no hay evidencia de que el modelo responda a instrucciones en castellano, y el ajuste fino se hizo con una unica cadena de texto de tarea.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene revisar tambien las condiciones del MolmoAct2 base de Ai2 y del dataset `arrg-unam/omx_pick_hidroferol`.
- Contexto y formato: no hay informacion sobre longitud de contexto util ni sobre soporte de historial multi-turno, algo irrelevante para una politica de acciones pero relevante si se pretende reutilizar el backbone como VLM.
- Madurez del repositorio: 11 descargas, 0 likes y actualizacion inmediata tras la creacion apuntan a un artefacto experimental, no a un modelo mantenido.
- Caveat de produccion: al no existir versiones cuantizadas oficiales, el despliegue en GPUs de menos de 16 GB de VRAM requerira trabajo adicional de conversion y validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arrg-unam/molmoact2_omx_hidroferol
- Dataset de entrenamiento: https://huggingface.co/datasets/arrg-unam/omx_pick_hidroferol
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=arrg-unam/omx_pick_hidroferol
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Guia de LeRobot para molmoact2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

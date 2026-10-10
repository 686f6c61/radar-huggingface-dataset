# castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_10_Exec_10_TASK_three_piece_assembly_PIXELS__ID_149733

## Resumen

ACT_UR5e_BS_32_Act_Chunk_10_Exec_10 es una politica de robotica basada en ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales de control. El modelo ha sido desarrollado por el usuario `castanetnicolas` y entrenado con LeRobot, la libreria de Hugging Face para aprendizaje automatico en robotica real. Se distribuye con licencia Apache-2.0 y esta pensado para ejecutarse sobre un robot tipo `panda` (segun la model card) con dos camaras: una vista externa (`agentview`) y una camara en la muneca (`robot0_eye_in_hand`).

El modelo resuelve una tarea concreta de ensamblaje: insertar una primera pieza en una base y despues insertar una segunda pieza encima. Fue entrenado sobre el dataset `mimicgen_three_piece_assembly_d1_image84`, con 200 episodios, 67.101 fotogramas y una frecuencia de captura de 20 FPS. Con 51.580.551 parametros (unos 51,6 millones) es un modelo compacto, muy lejos de los grandes modelos de lenguaje, y esta disenado para inferencia local a baja latencia en un bucle de control robotico.

Su relevancia actual es la de servir como checkpoint reproducible dentro del ecosistema LeRobot: permite desplegar una politica de imitacion entrenada con 300.000 pasos sobre hardware asequible, y sirve como punto de partida para experimentos de ensamblaje de precision, comparacion de metodos (ACT frente a Diffusion Policy) y fine-tuning sobre nuevas tareas de manipulacion.

La informacion disponible es limitada: el repositorio tiene 0 descargas y 0 likes, no se han publicado resultados de evaluacion y no hay datos de benchmarks. Todo lo que sigue se basa en la model card y en los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con latente tipo CVAE |
| Parametros totales | 51.580.551 (~51,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (politica de imitacion con ventana de observacion fija, no documentada) |
| Tipos de cuantizacion | no documentados; pesos distribuidos en safetensors |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | `panda` (segun model card; el nombre del repo indica `UR5e`, discrepancia no aclarada) |
| Camaras | `agentview`, `robot0_eye_in_hand` |
| Entradas | `observation.state` (9,), `observation.images.agentview` (3, 84, 84), `observation.images.robot0_eye_in_hand` (3, 84, 84) |
| Salidas | `action` (7,) |
| Action chunk / horizonte de ejecucion | 10 / 10 (deducido del nombre del repositorio) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion presentado en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). Su arquitectura se basa en un transformer encoder-decoder con un latente de tipo CVAE (autoencoder variacional condicional): el encoder procesa las observaciones (estado del robot e imagenes de las camaras) y el decoder genera un chunk de acciones futuras de una sola vez. El objetivo de entrenamiento combina una perdida de reconstruccion L1 sobre las acciones con un termino de divergencia KL que regulariza el espacio latente. Esta formulacion permite modelar la multimodalidad de las demostraciones humanas (varias formas validas de ejecutar la misma tarea) sin el coste computacional de los metodos de difusion.

En este checkpoint concreto, el nombre del repositorio indica un chunk de 10 acciones y un horizonte de ejecucion de 10, por lo que el modelo predice un bloque de 10 acciones que se ejecutan sin re-inferencia intermedia. El entrenamiento se realizo con LeRobot 0.6.1 durante 300.000 pasos, con batch size 32, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. El dataset de entrenamiento contiene 200 episodios teleoperados (67.101 fotogramas a 20 FPS) sobre la tarea "Insert the first piece into the base, then insert the second piece on top of it". No se documenta el uso de RLHF, DPO ni de tecnicas de refinamiento posteriores; ACT es un metodo puramente supervisado a partir de demostraciones. No se especifica en la model card el backbone visual (habitualmente ResNet en ACT), el numero de capas ni la dimension del modelo, por lo que esos detalles quedan como no disponibles.

## Capacidades

- Control robotico por imitacion: genera comandos de accion de 7 dimensiones a partir de observaciones de estado e imagen.
- Prediccion de action chunks: produce bloques de 10 acciones, lo que reduce la frecuencia de inferencia necesaria en el bucle de control.
- Percepcion visual multimodal: consume simultaneamente una vista externa (`agentview`) y una vista de muneca (`robot0_eye_in_hand`), ambas a 84x84 pixeles.
- Fusion de estado proprioceptivo e imagen: combina un vector de estado de 9 dimensiones con las dos entradas visuales.
- Ejecucion de tareas de ensamblaje: entrenado especificamente para insertar dos piezas en una base.
- Despliegue mediante LeRobot: compatible con el comando `lerobot-rollout` y con el flujo de entrenamiento `lerobot-train`.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico, capacidades multilingues ni modos de pensamiento: es un modelo puramente visomotor, no un modelo de lenguaje.

## Casos de uso

- Ensamblaje de precision en laboratorio: el modelo ejecuta la secuencia de insercion de dos piezas sobre una base, una tarea de tolerancias ajustadas que sirve como banco de pruebas para politicas de manipulacion fina.
- Automatizacion de celdas de montaje con robot Panda: permite sustituir la programacion explicita de trayectorias por una politica aprendida que reacciona a la posicion real de las piezas vista por las camaras.
- Reproduccion de experimentos de MimicGen: al estar entrenado con el dataset `mimicgen_three_piece_assembly_d1_image84`, sirve para reproducir y comparar resultados de generacion automatica de demostraciones.
- Fine-tuning sobre nuevas tareas de insercion (peg-in-hole): el checkpoint puede reentrenarse con `lerobot-train` sobre datasets propios de ensamblaje para adaptar la politica a geometrias distintas.
- Linea base en comparativas de metodos de imitacion: al ser un checkpoint ACT con configuracion conocida (300.000 pasos, batch 32, lr 1e-5), es un punto de referencia util frente a Diffusion Policy u otros metodos de chunking.
- Validacion de pipelines de teleoperacion y captura de datos: la politica permite comprobar que el esquema de observaciones (estado, camara externa, camara de muneca) y la frecuencia de 20 FPS son coherentes antes de escalar la recogida de datos.
- Despliegue en hardware de bajo coste: con 51,6 M de parametros cabe en GPUs de gama de consumo e incluso en CPU, lo que facilita prototipos en laboratorios sin clusters dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion "Evaluation" con la linea explicita "_No evaluation results have been provided for this policy yet_", y no se aportan tasas de exito, numero de ensayos ni condiciones de evaluacion en robot real.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 206 MB en FP32 (51,58 M de parametros x 4 bytes) y unos 103 MB en FP16. El repositorio completo ocupa 0,2 GB.
- VRAM total para inferencia: no documentada. Ademas de los pesos hay que contabilizar los tensores de las dos imagenes de entrada (3x84x84 cada una) y las activaciones del transformer; el consumo conjunto es muy reducido, previsiblemente por debajo de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con CUDA suficiente para PyTorch, incluidas GTX 1060, RTX 3060, RTX 4090, A100 o H100. No se requiere memoria de alta capacidad; una GPU profesional solo aportaria ventaja en latencia o en paralelizacion de entrenamiento.
- Compatibilidad con GPU de consumo: si, el modelo cabe holgadamente en practicamente cualquier GPU de consumo moderna e incluso en modelos integrados; tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion en robot y `lerobot-train` para reentrenamiento), sobre PyTorch. No aplica el despliegue con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La frecuencia del dataset es de 20 FPS (50 ms por fotograma), lo que marca un presupuesto de control de referencia; con un chunk de 10 acciones, la inferencia puede ejecutarse una vez por cada 10 pasos de control, pero no se han publicado mediciones reales de latencia ni de tasa de exito.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ACT, castanetnicolas) | 51,58 M | no disponible | Action chunking con transformer + CVAE | Apache-2.0 | HuggingFace, 0 descargas |
| ACT original (paper arXiv:2304.13705) | no disponible en la informacion | no disponible | Action chunking con transformer + CVAE | no disponible en la informacion | Publicacion y codigo de referencia |
| Diffusion Policy (arXiv:2303.04137) | no disponible en la informacion | no disponible | Generacion de acciones por difusion | no disponible en la informacion | Implementaciones publicas en el ecosistema LeRobot |
| Otros checkpoints ACT del hub de LeRobot | variable | no disponible | Action chunking | variable | HuggingFace |

No se dispone de datos cuantitativos comparativos (tasa de exito, latencia ni parametros de los metodos alternativos) en la informacion proporcionada, por lo que la comparativa es unicamente de categoria y metodo.

## Limitaciones y advertencias

- Sin evaluacion publicada: no hay tasa de exito ni numero de ensayos, por lo que se desconoce la fiabilidad real de la politica, incluso en la tarea para la que fue entrenada.
- Discrepancia en el tipo de robot: el nombre del repositorio menciona `UR5e` mientras que la model card declara `robot type: panda`. Antes de desplegar hay que verificar en que plataforma se generaron los datos y a que robot corresponde la cinematica de las acciones.
- Discrepancia en la tarea: el dataset se llama `three_piece_assembly` (ensamblaje de tres piezas) mientras que el texto de la tarea describe solo dos inserciones. Conviene comprobar el dataset antes de reutilizar la politica.
- Sobreajuste al entorno de recogida: al tratarse de aprendizaje por imitacion con 200 episodios de un unico entorno, es probable que la politica sea sensible a cambios de iluminacion, posicion de objetos, distractores o a una camara distinta.
- Dependencia estricta del esquema de entradas: los nombres de las camaras (`agentview`, `robot0_eye_in_hand`) y las formas de las observaciones (estado de 9 dimensiones, imagenes de 3x84x84) deben coincidir exactamente con los del entrenamiento; cualquier cambio rompe la inferencia.
- Sin capacidades de lenguaje ni generalizacion semantica: no entiende instrucciones en lenguaje natural ni puede transferir conocimiento a tareas no vistas.
- Riesgo de acumulacion de error en el chunk: al ejecutar 10 acciones sin re-inferencia, un error temprano puede propagarse durante todo el bloque.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y citar tanto el metodo ACT como LeRobot segun indica la model card.
- Idiomas: no aplica; no hay datos de soporte multilingue porque no es un modelo de lenguaje.
- Sin informacion sobre sesgos: al ser un modelo visomotor, los sesgos relevantes serian de tipo fisico (posiciones, objetos o entornos sobrerrepresentados en las 200 demostraciones), pero no se documentan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_10_Exec_10_TASK_three_piece_assembly_PIXELS__ID_149733
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

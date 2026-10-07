# fysical/so101ball_pi05expert_S050_seed0

## Resumen

`fysical/so101ball_pi05expert_S050_seed0` es una politica robotica de tipo Vision-Language-Action (VLA) publicada por el usuario `fysical` en HuggingFace. No es un modelo de lenguaje: es un ajuste fino del modelo base `lerobot/pi05_base` (implementacion en LeRobot de π₀.₅, de Physical Intelligence) para una unica tarea de manipulacion sobre un brazo SO-101: recoger una pelota verde y dejarla en una cesta, ignorando dos pelotas rojas de distraccion.

El modelo consume tres imagenes de 224x224 (una vista base y dos vistas de muneca), un vector de estado de 32 dimensiones y una instruccion de tarea en lenguaje natural, y produce un vector de accion de 6 dimensiones a 30 FPS. Cuenta con 4.143.404.816 parametros y se distribuye en safetensors bajo licencia Apache 2.0, con un repositorio de 20 GB.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de ajuste fino de π₀.₅ con LeRobot 0.6.2 sobre un dataset de 225 episodios y 116.164 fotogramas, y como punto de partida para transferencia a tareas similares de picking con distractores. No incluye resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅; implementacion de LeRobot adaptada del repositorio OpenPI. El desglose interno (codificador visual, backbone de lenguaje, experto de accion) no esta detallado en la informacion proporcionada |
| Parametros totales | 4.143.404.816 (dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. No expone ventana de contexto de texto; su "contexto" es la combinacion de 3 imagenes de (3, 224, 224), un vector de estado de (32,) y una instruccion de tarea |
| Tipos de cuantizacion | No disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible. La instruccion de tarea del dataset esta en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo / pipeline | robotics (politica de imitacion entrenada con LeRobot) |
| Modelo base | lerobot/pi05_base |
| Dataset de ajuste fino | fysical/greenball_pool_225_v1 (225 episodios, 116.164 fotogramas, 30 FPS) |
| Robot objetivo | so_follower (SO-101) |
| Entradas visuales | observation.images.base_0_rgb, observation.images.left_wrist_0_rgb, observation.images.right_wrist_0_rgb, todas de forma (3, 224, 224) |
| Entrada de estado | observation.state, forma (32,) |
| Salida | action, forma (6,) |
| Pasos de entrenamiento | 6000 |
| Batch size | 32 |
| Optimizador | adamw |
| Learning rate | 2.5e-05 |
| Semilla | 0 |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 20,0 GB |
| Libreria | lerobot |

## Arquitectura y entrenamiento

El modelo pertenece a la familia π₀.₅ de Physical Intelligence, presentada publicamente como un modelo Vision-Language-Action orientado a generalizacion en entornos abiertos. La implementacion concreta de este repositorio procede de la adaptacion que hace LeRobot del repositorio OpenPI, y se ha ajustado mediante aprendizaje por imitacion supervisado a partir del modelo preentrenado `lerobot/pi05_base`. La informacion proporcionada no detalla el numero de tokens de entrenamiento del preentrenamiento, la composicion del dataset original ni si se emplearon etapas de RLHF o DPO.

El ajuste fino se realizo sobre el dataset `fysical/greenball_pool_225_v1`, compuesto por 225 episodios y 116.164 fotogramas grabados a 30 FPS, con una unica tarea expresada como "Pick up the green ball and place it in the basket, ignoring the two red distractor balls". La configuracion de entrenamiento fue de 6000 pasos con batch de 32, optimizador AdamW, learning rate 2,5e-05 y semilla 0, ejecutada con LeRobot 0.6.2. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o mecanismos de chunking de acciones, ni el desglose de parametros entre los distintos componentes del modelo.

## Capacidades

- Manipulacion visomotora de un brazo SO-101: genera comandos de accion de 6 dimensiones a partir de observaciones visuales y de estado.
- Ejecucion de una tarea especifica de picking and placing: recoger una pelota verde y depositarla en una cesta.
- Discriminacion de distractores: el entrenamiento incluye explicitamente dos pelotas rojas que deben ignorarse, por lo que el modelo esta ajustado para no confundirlas con el objeto objetivo.
- Fusion de multiples vistas de camara: procesa simultaneamente una vista base y dos vistas de muneca (izquierda y derecha).
- Condicionamiento por instruccion en lenguaje natural: acepta un prompt de tarea, aunque en la practica esta especializado en el texto concreto del dataset.
- Generacion de texto: no disponible (no es un modelo de lenguaje).
- Razonamiento, codigo, matematicas, vision general: no disponible.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio): no soportado.

## Casos de uso

- Automatizacion de una celda de picking con distractores: el modelo ejecuta el ciclo completo de recoger la pelota verde e ignorar las rojas sobre un SO-101, integrable en una estacion de laboratorio o linea de montaje a escala reducida.
- Transferencia a tareas de recogida y colocacion similares: al estar ajustado desde `lerobot/pi05_base`, sirve como punto de partida para reentrenar con un dataset propio de otra tarea de pick and place, reduciendo el numero de episodios necesarios.
- Generacion de datos para entrenamiento: usar la politica como profesor para grabar episodios adicionales sobre el mismo hardware y ampliar el dataset de imitacion.
- Benchmark interno de robustez ante distractores: comparar la tasa de exito de esta politica frente a variantes entrenadas sin objetos distractores, variando posiciones, iluminacion y color de los objetos.
- Reproduccion de resultados de π₀.₅ sobre hardware de bajo coste: el SO-101 es una plataforma accesible, lo que permite validar el pipeline OpenPI/LeRobot sin depender de brazos industriales.
- Docencia y formacion en robotica de imitacion: sirve como ejemplo completo y trazable de entrenamiento y despliegue con LeRobot 0.6.2, con comandos de rollout reproducibles.
- Pruebas de integracion de vision multi-camara: permite validar la sincronizacion y calibracion de una camara frontal y dos de muneca en un bucle de control a 30 FPS.
- Evaluacion de latencia de inferencia en GPUs de consumo: al ser un modelo de 4,14 mil millones de parametros, permite medir si el bucle de control es viable en una unica GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("_No evaluation results have been provided for this policy yet._") y deja la tabla de evaluacion vacia. No hay datos de MMLU, HumanEval, GSM8K ni de tasa de exito en tareas roboticas.

En el caso de una politica de imitacion, las metricas aplicables serian tasa de exito por numero de ensayos, numero de intentos y condiciones de dificultad (posiciones nuevas, iluminacion, distractores, robot del mismo tipo), pero estos valores no estan disponibles.

## Requisitos de hardware

- VRAM estimada en precision completa (fp32): aproximadamente 16,6 GB solo para los pesos, segun los 4.143.404.816 parametros.
- VRAM estimada en bf16/fp16: aproximadamente 8,3 GB para los pesos, mas el coste de activaciones de las tres imagenes de 224x224.
- VRAM estimada en int8: aproximadamente 4,1 GB, siempre que se aplique una cuantizacion no documentada por el autor.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como RTX 3090 o RTX 4090 en bf16. En tarjetas de 16 GB el margen es ajustado en bf16 y requeriria cuantizacion.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40/80 GB y H100 para entrenamiento o para entrenamiento y rollout simultaneos. No se documentan pruebas en Jetson u otras plataformas embebidas.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` con `--policy.path=fysical/so101ball_pi05expert_S050_seed0`. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El dataset de entrenamiento esta grabado a 30 FPS, pero no se especifica la frecuencia de inferencia alcanzable en el bucle de control.
- Almacenamiento: el repositorio ocupa 20,0 GB, por lo que se necesita ese espacio en disco para el checkpoint completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fysical/so101ball_pi05expert_S050_seed0 | 4.143.404.816 | No disponible | apache-2.0 | HuggingFace, libreria lerobot | Ajuste fino especializado en una tarea con distractores sobre SO-101 |
| lerobot/pi05_base | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace | Modelo base del que deriva este ajuste; proposito general |
| lerobot/pi0_base (π₀) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace | Generacion anterior de la familia π de Physical Intelligence |
| SmolVLA (LeRobot) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace | Politica VLA de menor tamano de la misma libreria |

La informacion proporcionada no incluye parametros, contexto, licencias ni metricas de los modelos alternativos, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea y un unico objeto. Fuera de "recoger la pelota verde e ignorar las rojas" el comportamiento esperado no esta documentado.
- Sin evaluacion publicada: no hay tasa de exito ni numero de ensayos, por lo que se desconoce su fiabilidad real en produccion.
- Dependencia del hardware: el modelo espera el tipo de robot `so_follower` y unas claves de observacion concretas. Los nombres de camara deben coincidir exactamente con los del entrenamiento.
- Discrepancia en la documentacion: la seccion de detalles indica dos camaras (`front`, `wrist`), mientras que las entradas declaradas son tres vistas (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`). Conviene verificar la configuracion real antes de desplegar.
- Prompt fijo: la instruccion de tarea debe coincidir con el texto usado en el entrenamiento; no hay evidencia de generalizacion a otras formulaciones.
- Sin capacidades de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de modelos de lenguaje.
- Riesgo de fallo silencioso: en lugar de alucinacion textual, el modo de fallo tipico es una accion incorrecta (agarrar la pelota equivocada, colisionar o no completar la colocacion). No hay deteccion de fallo incorporada.
- Sensibilidad a condiciones no vistas: cambios de iluminacion, fondo, posicion de la cesta o tipo de objeto pueden degradar el rendimiento, ya que no se han reportado pruebas de generalizacion.
- Licencia: los pesos se publican como apache-2.0, lo que en principio permite uso comercial, pero la licencia del modelo base `lerobot/pi05_base`, la del dataset y las condiciones de uso de π₀.₅ de Physical Intelligence deben verificarse por separado antes de un despliegue comercial.
- Tiempo de inferencia en el bucle de control: si la latencia supera el periodo de control, la politica puede volverse inestable; no se proporcionan mediciones.
- Consumo de disco elevado: 20,0 GB por checkpoint, lo que complica el despliegue en dispositivos con almacenamiento limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fysical/so101ball_pi05expert_S050_seed0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de ajuste fino: https://huggingface.co/datasets/fysical/greenball_pool_225_v1
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fysical/greenball_pool_225_v1
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: no incluido en la informacion proporcionada
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

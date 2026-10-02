# castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_30_Exec_30_TASK_pick_place_can_PIXELS__ID_146344

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de compounding y permite ejecutar politicas de control roboticas con alta tasa de exito. Este repositorio concreto, publicado por el usuario castanetnicolas, es un checkpoint de una politica ACT entrenada con la libreria LeRobot de Hugging Face sobre el dataset robomimic_can_ph_image84. El modelo cuenta con 51.601.031 parametros y esta orientado a una unica tarea de manipulacion: coger una lata y colocarla en la papelera correspondiente.

La politica consume un vector de estado de 9 dimensiones y dos imagenes RGB de 84x84 pixeles (camara agentview y camara en el efector final robot0_eye_in_hand), y produce un vector de accion de 7 dimensiones. Se entreno durante 120.000 pasos con batch size 64, optimizador AdamW y learning rate 1e-5, a partir de 200 episodios de teleoperacion que suman 23.207 frames a 20 FPS.

Es relevante como ejemplo reproducible de imitation learning aplicado a robotica de bajo coste: el repositorio ocupa solo 0,2 GB, la licencia es Apache 2.0 y todo el flujo de entrenamiento e inferencia se puede replicar con los comandos de LeRobot. Su interes es practico (replicar el pipeline), no de investigacion de frontera. No se han publicado resultados de evaluacion ni benchmarks, y el autor no aporta metricas de exito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con CVAE para imitacion |
| Parametros totales | 51.601.031 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la politica condiciona sobre un horizonte de observaciones y genera un chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin versiones GGUF/INT8 documentadas) |
| Idiomas soportados | no aplica (modelo de robotica; las instrucciones de tarea son texto en ingles en el ejemplo, pero no hay evaluacion multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Tamano del repositorio | 0,2 GB |
| Tipo de robot | panda (segun la model card; el nombre del repo menciona UR5e) |
| Camaras de entrada | agentview, robot0_eye_in_hand |
| Entrada de estado | observation.state, shape (9,) |
| Entradas visuales | observation.images.agentview (3, 84, 84), observation.images.robot0_eye_in_hand (3, 84, 84) |
| Salida | action, shape (7,) |
| Chunk de acciones | 30 (segun el nombre del repositorio) |
| Pasos de ejecucion | 30 (segun el nombre del repositorio) |

## Arquitectura y entrenamiento

ACT es un metodo de imitation learning basado en un transformer que aprende a predecir chunks de acciones (en este caso, 30 pasos por inferencia) en lugar de una accion por paso. La justificacion del metodo, descrita en el paper arXiv:2304.13705, es que predecir secuencias cortas de acciones reduce el error acumulado de las politicas paso a paso, mejora la coherencia temporal y permite un control mas suave. La formulacion habitual de ACT incluye un autoencoder variacional condicional (CVAE) con una variable latente de estilo, que se usa durante el entrenamiento para modelar la variabilidad de las demostraciones humanas y se ignora en inferencia fijando la latente a la media. Esta descripcion corresponde al metodo general; la model card del autor no detalla la configuracion interna exacta de este checkpoint.

El entrenamiento se realizo con LeRobot 0.6.1 sobre el dataset castanetnicolas/robomimic_can_ph_image84, compuesto por 200 episodios y 23.207 frames grabados a 20 FPS correspondientes a la tarea "Pick up the can and place it in the matching bin". La configuracion declarada es de 120.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se especifica en la model card el numero de tokens de entrenamiento (no aplica en el sentido de un LLM), la composicion exacta de las demostraciones, ni si se aplicaron tecnicas adicionales de ajuste como RLHF o DPO, que no son propias de este tipo de politica.

## Capacidades

- Control roboticо por imitacion para una tarea unica de pick-and-place: coger una lata y depositarla en la papelera correspondiente.
- Generacion de chunks de 30 acciones a partir de observaciones visuales y de estado, con 7 dimensiones de salida (tipicamente posicion y orientacion del efector final mas apertura del gripper en robots tipo Franka Panda).
- Percepcion visual desde dos camaras: una vista externa (agentview) y una camara montada en el efector final (robot0_eye_in_hand), ambas a 84x84 pixeles.
- Fusión de estado propioceptivo de 9 dimensiones con las observaciones visuales.
- Inferencia en tiempo de control con LeRobot mediante el comando lerobot-rollout.
- Reentrenamiento reproducible sobre el mismo dataset o sobre datos propios con lerobot-train.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un modelo de lenguaje.
- No dispone de capacidades multilingues, de vision general, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Replicacion de experimentos de imitation learning: sirve como punto de partida para reproducir el pipeline completo de LeRobot (grabacion de datos, entrenamiento ACT, evaluacion en robot) sin necesidad de infraestructura de GPU de gama alta.
- Evaluacion de tecnicas de action chunking: al estar configurado con chunk de 30 y ejecucion de 30, permite comparar frente a variantes con chunk menor o mayor y medir el efecto sobre la suavidad y la tasa de exito.
- Base para fine-tuning en una tarea de pick-and-place propia: se puede reentrenar con lerobot-train sobre un dataset propio de 100-200 episodios y sustituir la tarea original por otra manipulacion de objeto unico.
- Pruebas de integracion con robots de bajo coste: las politicas ACT con entradas de 84x84 son lo bastante ligeras para ejecutarse en un PC con GPU de gama media conectado a un brazo tipo Panda o UR5e, lo que permite validar el stack de control antes de pasar a modelos mayores.
- Educacion y docencia en robotica: el repositorio es un ejemplo autocontenido de 0,2 GB con licencia Apache 2.0, adecuado para cursos que cubran imitation learning, vision para robotica y despliegue con LeRobot.
- Benchmark interno de regresion de infraestructura: al tener una tarea fija y bien definida, se puede usar como prueba de humo para verificar que la instalacion de LeRobot, los drivers de camara y la calibracion del robot funcionan correctamente.
- Generacion de datos sinteticos de evaluacion: la politica se puede ejecutar en simulacion (por ejemplo, con entornos tipo robomimic si se replica la configuracion de observaciones) para estudiar su comportamiento antes de desplegarla en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la linea "No evaluation results have been provided for this policy yet." y no se aportan tasas de exito, numero de ensayos ni comparaciones con otras politicas. Tampoco se han encontrado en la busqueda web datos adicionales sobre este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 210 MB en FP32 (51,6 M de parametros x 4 bytes) y unos 105 MB en FP16, sin contar el overhead de activaciones y buffers de las dos camaras de 84x84. Estas cifras son calculos aritmeticos a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente por tamano de modelo; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque para un modelo de este tamano la GPU no es el cuello de botella.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna e incluso en iGPU con memoria compartida suficiente. Tambien es candidato para NVIDIA Jetson (Orin Nano, Orin NX, AGX Orin) por su tamano reducido.
- Opciones de despliegue: LeRobot es la via oficial (lerobot-rollout para ejecucion en robot y lerobot-train para entrenamiento). No hay confirmacion de soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a politicas de robotica.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de frecuencia de inferencia ni de tiempo de respuesta; el dataset de entrenamiento esta grabado a 20 FPS, pero eso no implica que la politica infiera a esa frecuencia en hardware concreto.
- El checkpoint pesa 0,2 GB en total, por lo que cabe holgadamente en almacenamiento local y en memoria de sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ACT, castanetnicolas) | 51.601.031 | Estado (9,), dos imagenes 3x84x84 | No publicado | Apache 2.0 | Hugging Face, LeRobot |
| ACT de referencia (paper arXiv:2304.13705) | no disponible en la informacion | Observaciones visuales y de estado | Resultados del paper, no aplicables a este checkpoint | no disponible en la informacion | Paper |
| Otras politicas ACT publicadas en el Hub de LeRobot | tipicamente en el rango de decenas de millones | Configuraciones variables | Variable, muchas sin evaluacion publicada | Habitualmente Apache 2.0 | Hugging Face |
| Diffusion Policy | no disponible en la informacion | Observaciones visuales y de estado | no disponible | no disponible en la informacion | Repositorios de investigacion |

No se dispone de datos verificables de modelos comparables entrenados sobre el mismo dataset y la misma tarea, por lo que la comparacion cuantitativa no es posible con la informacion proporcionada. Cualquier cifra de parametros o rendimiento de las alternativas deberia confirmarse en sus respectivas fichas antes de usarse en una decision tecnica.

## Limitaciones y advertencias

- Tarea unica y cerrada: la politica esta entrenada exclusivamente para "Pick up the can and place it in the matching bin". No generaliza a otras tareas ni a otras disposiciones de objetos sin reentrenamiento.
- Sin evaluacion publicada: no hay tasa de exito, numero de ensayos ni condiciones de prueba, por lo que se desconoce su fiabilidad real en robot fisico.
- Discrepancia de robot en el nombre: el identificador del repositorio menciona UR5e mientras que la model card declara robot type panda. Hay que verificar la morfologia y las dimensiones de accion antes de desplegarlo, ya que un vector de accion de 7 dimensiones no implica el mismo espacio de acciones en ambos robots.
- Sensibilidad al entorno: al entrenarse con 200 episodios y dos camaras fijas, es probable que el rendimiento se degrade con cambios de iluminacion, posiciones iniciales de la lata, fondos distintos o distracciones. Esto es una expectativa razonable del metodo, no un dato medido en este checkpoint.
- Riesgo de fallo silencioso y sobreajuste a las demostraciones: como toda politica de imitation learning, puede producir acciones plausibles pero incorrectas sin senal de incertidumbre calibrada. No se documentan mecanismos de deteccion de fallo.
- Dependencia de calibracion y de camaras: las claves de observacion (observation.images.agentview y observation.images.robot0_eye_in_hand) deben coincidir exactamente con las camaras configuradas en el robot en el momento de la inferencia; un desajuste de nombre, resolucion o FPS invalida la politica.
- Sin datos de sesgos: no se ha documentado ningun analisis de sesgo, pero al ser un modelo de robotica el concepto de sesgo social no aplica directamente; si aplican sesgos de distribucion de datos (posiciones, objetos, condiciones de grabacion).
- Licencia permisiva: Apache 2.0 permite uso comercial y modificacion, con la obligacion habitual de conservar el aviso de licencia. Hay que citar tambien el metodo ACT y LeRobot segun indica la model card.
- Cero descargas y cero likes: el repositorio no tiene validacion por parte de la comunidad, lo que refuerza la recomendacion de evaluarlo antes de cualquier uso en produccion.
- Idiomas: no se declaran idiomas soportados y el modelo no procesa lenguaje de forma general; el campo de tarea es texto fijo en el ejemplo de ejecucion.
- Fechas de creacion y actualizacion del repositorio (2026-10-02) posteriores a la fecha actual de referencia habitual, dato a tener en cuenta al citar el recurso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_30_Exec_30_TASK_pick_place_can_PIXELS__ID_146344
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_can_ph_image84
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de imitation learning y grabacion de datos: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de datasets de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_can_ph_image84
- La busqueda web realizada no devolvio enlaces tecnicos relevantes sobre este modelo: los resultados obtenidos eran dominios de contenido para adultos sin relacion con robotica ni con inteligencia artificial open source.

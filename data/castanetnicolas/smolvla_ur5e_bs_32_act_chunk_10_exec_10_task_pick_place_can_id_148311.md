# castanetnicolas/smolvla_UR5e_BS_32_Act_Chunk_10_Exec_10_TASK_pick_place_can_ID_148311

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto orientado a control robótico, desarrollado sobre la base `lerobot/smolvla_base` y publicado por el usuario `castanetnicolas`. El modelo resuelve una única tarea de manipulación: "Pick up the can and place it in the matching bin" (coger la lata y colocarla en el contenedor correspondiente), ejecutada con un robot de tipo `panda` según la model card. Con 450.046.176 parámetros (aproximadamente 450 M) y un repositorio de 0,9 GB en formato safetensors, es lo bastante pequeño para desplegarse en hardware de consumo.

El modelo pertenece a la familia SmolVLA presentada en el paper arXiv:2506.01844, que describe un VLA compacto con rendimiento competitivo a un coste computacional reducido. Este checkpoint concreto se ha entrenado con la librería LeRobot 0.6.1 durante 40.000 pasos, con tamaño de lote 32, optimizador AdamW y tasa de aprendizaje 0,0001, a partir de un dataset de 200 episodios y 23.207 fotogramas capturados a 20 FPS.

Su relevancia es doble: por un lado, demuestra el flujo completo de imitación robótica con LeRobot (grabación de datos, entrenamiento y despliegue con `lerobot-rollout`); por otro, sirve como punto de partida reproducible para quienes quieren ajustar políticas de manipulación en tareas concretas sin necesidad de clústeres de GPU. La licencia Apache 2.0 permite uso comercial. No se han publicado resultados de evaluación ni benchmarks para este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacto; la model card no detalla capas ni cabecera de acciones |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible oficialmente; el repo distribuye safetensors (pesos en precision completa, cargables en bf16/fp16) |
| Idiomas soportados | No disponible; las instrucciones de tarea de los ejemplos estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | Politica robotica (pipeline: robotics) |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Libreria / framework | lerobot 0.6.1 |
| Tipo de robot declarado | panda |
| Camaras declaradas | agentview, robot0_eye_in_hand |
| Entradas | observation.state (6,); observation.images.camera1/2/3 (3, 256, 256) |
| Salidas | action (7,) |
| Tamano del repositorio | 0,9 GB |
| Dataset de entrenamiento | castanetnicolas/robomimic_can_ph_image84 (200 episodios, 23.207 fotogramas, 20 FPS) |
| Pasos de entrenamiento | 40.000 |
| Optimizador / LR | AdamW / 0,0001 |
| Semilla | 1000 |
| Fecha de creacion / actualizacion | 2026-10-07 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

SmolVLA es, segun la model card y el paper referenciado (arXiv:2506.01844), un modelo de vision-lenguaje-accion compacto que combina percepcion visual, comprension de una instruccion en lenguaje natural y generacion de acciones motoras. La model card de este repositorio no especifica el numero de capas, el tipo de cabecera de acciones ni el mecanismo de generacion (por ejemplo, si emplea flow matching o difusion), por lo que esos detalles quedan como no disponibles en esta ficha. El nombre del repositorio indica un troceado de acciones (`Act_Chunk_10`) y una ejecucion de 10 acciones por inferencia (`Exec_10`), ademas de un tamano de lote de 32 (`BS_32`).

El entrenamiento es un ajuste fino supervisado por imitacion desde `lerobot/smolvla_base` sobre el dataset `castanetnicolas/robomimic_can_ph_image84`, derivado de robomimic y compuesto por 200 episodios y 23.207 fotogramas a 20 FPS de la tarea "Pick up the can and place it in the matching bin". Se realizaron 40.000 pasos con AdamW, tasa de aprendizaje 0,0001, semilla 1000 y LeRobot 0.6.1. La model card no menciona RLHF, DPO ni ningun proceso de alineacion posterior, algo esperable en politicas de imitacion. No se documenta aumento de datos, composicion detallada del dataset ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de acciones de robot: produce un vector de accion de 7 dimensiones a partir de un estado de 6 dimensiones, adecuado para control de un manipulador con pinza.
- Percepcion visual multi-camara: consume hasta tres imagenes de 256x256 pixels como observacion.
- Condicionamiento por instruccion en lenguaje natural: la tarea se especifica en texto (por ejemplo, "Pick up the can and place it in the matching bin.").
- Ejecucion por trozos de accion (action chunking): segun el nombre del repositorio, predice 10 acciones y ejecuta 10 por inferencia, lo que reduce la frecuencia de inferencia necesaria en el bucle de control.
- Manipulacion pick-and-place: coger un objeto y depositarlo en el contenedor correspondiente.
- Despliegue en hardware de consumo: la propia model card indica que SmolVLA puede ejecutarse en hardware de gama de consumo.
- Integracion con el ecosistema LeRobot: entrenamiento e inferencia mediante las herramientas `lerobot-train` y `lerobot-rollout`.
- No soporta tool calling, function calling, agentes multi-paso ni generacion de texto conversacional: es una politica robotica, no un modelo de lenguaje de proposito general.
- No se documentan capacidades de audio, razonamiento simbolico ni modo "thinking".

## Casos de uso

- Manipulacion pick-and-place en laboratorio: es exactamente la tarea para la que se entreno; con tres camaras de 256x256 y estado de 6 dimensiones, el modelo genera las 7 acciones de control necesarias para coger una lata y depositarla en el contenedor correspondiente.
- Clasificacion de residuos o piezas en linea: al estar entrenado para colocar el objeto "en el contenedor correspondiente", sirve de base para prototipos de separacion por categoria, reentrenando con el mismo flujo de LeRobot.
- Punto de partida para fine-tuning en tareas de manipulacion similares: al derivar de `lerobot/smolvla_base`, se puede reajustar sobre un dataset propio con `lerobot-train` y pocos miles de fotogramas, reduciendo el coste frente a entrenar desde cero.
- Reproduccion de experimentos robomimic: util para investigacion en aprendizaje por imitacion, ya que el dataset de origen, la configuracion de entrenamiento y la version de LeRobot estan documentados.
- Evaluacion de VLA en hardware de consumo: con 450 M de parametros y 0,9 GB de pesos, permite medir latencias y tasas de exito en GPUs de gama media o en CPU, sin depender de un clúster.
- Docencia y formacion en robotica: sirve como ejemplo completo del ciclo grabar datos, entrenar politica y desplegar con `lerobot-rollout` en un robot real o simulado.
- Banco de pruebas de robustez ante cambios de iluminacion, posicion de objeto o distracciones: al no haber evaluacion publicada, cualquier despliegue en produccion deberia acompanarse de una bateria propia de ensayos de exito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye explicitamente la linea "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de exito en robot real, ni comparaciones con otros checkpoints de SmolVLA u otras politicas. Tampoco se aportan metricas de simulacion ni curvas de entrenamiento (perdida, divergencia, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parametros, los pesos ocupan aproximadamente 0,9 GB en bf16/fp16, 1,8 GB en fp32 y unos 0,45 GB en int8 (estimacion propia a partir del recuento de parametros). Sumando activaciones y buffers de imagen (tres entradas de 3x256x256), un presupuesto practico de 3-6 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU moderna con al menos 6-8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4070 o RTX 4090; tambien A100 o H100 si el modelo se despliega junto a otros servicios. No requiere GPU de centro de datos.
- Cabe en GPU de consumo: si. Es uno de los puntos que destaca la propia model card de SmolVLA. Tambien es viable la inferencia en CPU a velocidad reducida.
- Opciones de despliegue: LeRobot (`lerobot-rollout` es el comando documentado), con carga de pesos safetensors sobre PyTorch. No aplican servidores de inferencia de texto como vLLM, TGI o llama.cpp, ya que el modelo no genera texto.
- Latencia y throughput: no disponibles. Como referencia derivada de la configuracion, si el control se ejecuta a 20 FPS (frecuencia del dataset) y cada inferencia produce 10 acciones, el modelo debe generar un nuevo trozo cada 0,5 segundos como maximo para no interrumpir el bucle de control.
- Almacenamiento: el repositorio completo ocupa 0,9 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este fine-tune (`castanetnicolas/smolvla_UR5e_...`) | 450 M | No disponible | Pick-and-place de una lata (entrenado) | apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| lerobot/smolvla_base | No disponible en esta busqueda | No disponible | Politica VLA generalista preentrenada | No disponible en esta busqueda | HuggingFace (modelo base declarado) |
| Otras familias VLA (OpenVLA, pi0, GR00T N1, etc.) | No disponible en esta busqueda | No disponible | Manipulacion robotica general | No disponible en esta busqueda | No disponible en esta busqueda |

La busqueda web realizada no devolvio informacion tecnica relevante sobre ningun modelo comparable: los resultados obtenidos corresponden a servicios de comprobacion de disponibilidad de sitios web, sin relacion con el modelo. Por tanto, no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de tarea unica: esta entrenado exclusivamente para "Pick up the can and place it in the matching bin". Fuera de esa tarea cabe esperar un comportamiento incorrecto.
- Sin evaluacion publicada: no existen tasas de exito ni pruebas de robustez; cualquier afirmacion sobre su rendimiento en robot real seria una suposicion.
- Riesgo de sobreajuste al dataset: 200 episodios y 23.207 fotogramas son un volumen reducido; el modelo puede fallar ante posiciones nuevas del objeto, cambios de iluminacion, fondos distintos o distracciones.
- Inconsistencia en la documentacion: el nombre del repositorio menciona un robot UR5e, mientras que la model card declara `robot type: panda`. Asimismo, las camaras declaradas en "Model Details" (`agentview`, `robot0_eye_in_hand`) no coinciden con los nombres de las entradas de observacion (`camera1`, `camera2`, `camera3`). Hay que verificar el mapeo real de camaras antes de desplegar.
- Entradas y salidas fijas: estado de 6 dimensiones, tres imagenes de 3x256x256 y accion de 7 dimensiones. Cualquier robot con otra cinematica o numero de camaras requerira reentrenamiento, no solo reconfiguracion.
- Idioma: las instrucciones de tarea de la documentacion estan en ingles; no hay informacion sobre el comportamiento con instrucciones en castellano u otros idiomas.
- Alucinacion: el concepto no aplica igual que en un modelo de lenguaje, pero si existe el riesgo analogo de generar acciones plausibles pero incorrectas cuando la observacion se aleja de la distribucion de entrenamiento.
- Sesgos: no documentados por el autor. En robomimic, los sesgos suelen aparecer asociados a posiciones, colores y condiciones de iluminacion presentes en la recogida de datos.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene revisar la licencia del dataset `castanetnicolas/robomimic_can_ph_image84` y del modelo base antes de un despliegue comercial.
- Sin garantias de produccion: el repositorio tiene 0 descargas y 0 likes, sin evaluacion ni mantenimiento documentado; para uso critico se recomienda validacion propia y un mecanismo de parada segura en el robot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castanetnicolas/smolvla_UR5e_BS_32_Act_Chunk_10_Exec_10_TASK_pick_place_can_ID_148311
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_can_ph_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_can_ph_image84
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

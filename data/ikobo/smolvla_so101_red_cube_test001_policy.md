# IKOBO/smolvla_so101_red_cube_test001_policy

## Resumen

Este repositorio contiene una política de robótica de tipo vision-language-action (VLA) denominada `smolvla_so101_red_cube_test001_policy`, publicada por el usuario IKOBO sobre la librería LeRobot. Se trata de un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base`, la implementación compacta de SmolVLA descrita en el artículo arXiv:2506.01844. El modelo tiene 450.046.176 parámetros (unos 450 millones) y su propósito es convertir observaciones visuales y propioceptivas de un robot en acciones de control de 6 dimensiones.

A diferencia de un modelo de lenguaje, esta política no genera texto ni mantiene conversaciones: consume dos imágenes RGB (cámara cenital y cámara de muñeca) y el estado articular del robot, y produce directamente comandos de acción. Está entrenada específicamente para la tarea "Pick up the red cube and place it inside the yellow target area" sobre un robot SO-101 (`so_follower`), a partir de un conjunto de datos de 54 episodios y 32.346 fotogramas grabados a 30 FPS.

Su relevancia radica en tres factores: demuestra que un VLA de tamaño reducido puede desplegarse en hardware de consumo (según el autor, está pensado para "consumer-grade hardware"), sirve como ejemplo reproducible del flujo de entrenamiento de LeRobot y constituye un punto de partida práctico para quienes quieran replicar o extender tareas de manipulación mediante aprendizaje por imitación. Cabe señalar que el repositorio tiene 0 descargas y 0 "likes" en el momento de redactar esta ficha, y que no se han publicado resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA / SmolVLM (codificador visual + modelo de lenguaje + experto de acción) |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje conversacional (consume una instrucción de tarea textual corta) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors) |
| Idiomas soportados | no disponible (la instrucción de tarea de este checkpoint está en inglés: "Pick up the red cube and place it inside the yellow target area") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so_follower (SO-101) |
| Camaras | overhead, wrist (3, 480, 640) cada una |
| Entrada de estado | observation.state, forma (6,) |
| Salida | action, forma (6,) |
| Modelo base | lerobot/smolvla_base |
| Libreria | lerobot (version 0.6.2) |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

El modelo sigue el diseno de SmolVLA presentado en el articulo arXiv:2506.01844: un modelo de vision-lenguaje-accion compacto construido sobre un backbone de tipo SmolVLM, que combina un codificador visual para procesar las imagenes con un modelo de lenguaje que interpreta la instruccion de tarea, y un modulo experto que genera las acciones de control. La politica consume dos flujos visuales (camara cenital y de munu eca) a 480x640 junto con el vector de estado articular de 6 dimensiones, y emite un vector de accion de 6 dimensiones. Segun la model card, el objetivo de diseno es lograr un rendimiento competitivo con un coste computacional reducido que permita el despliegue en hardware de consumo.

El entrenamiento de este checkpoint concreto es un ajuste fino supervisado sobre el conjunto de datos `IKOBO/so101_red_cube_test003` (54 episodios, 32.346 fotogramas, 30 FPS) para una unica tarea de recogida y colocacion. La configuracion declarada incluye 100.000 pasos de entrenamiento, batch size de 8, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, ejecutado con LeRobot 0.6.2. No se especifica en la informacion disponible si se aplicaron tecnicas de RLHF, DPO ni si se uso decodificacion especulativa o atencion lineal. Tampoco se detalla la composicion completa del dataset ni el numero total de tokens o muestras de pretraining del modelo base.

## Capacidades

- Generacion de acciones de control de 6 grados de libertad para el robot SO-101 (`so_follower`), directamente a partir de observaciones.
- Percepcion visual multimodal mediante dos camaras RGB simultaneas: cenital (`observation.images.overhead`) y de muneca (`observation.images.wrist`), ambas a 480x640.
- Fusion del estado propioceptivo del robot (`observation.state`, 6 dimensiones) con la informacion visual.
- Condicionamiento por instruccion de tarea en lenguaje natural para guiar la politica.
- Ejecucion de una tarea especifica de pick-and-place: recoger un cubo rojo y depositarlo en una zona objetivo amarilla.
- Inferencia a 30 FPS, coherente con la frecuencia de grabacion del dataset de entrenamiento.
- No soporta generacion de texto libre, chat, tool calling, function calling ni razonamiento multi-paso conversacional.
- No dispone de modo "thinking", capacidades de audio ni generacion de codigo.
- Su polivalencia es limitada: esta especializado en la tarea concreta del dataset de entrenamiento.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: la politica puede ejecutar de forma autonoma la secuencia de recoger el cubo rojo y colocarlo en la zona amarilla sobre un SO-101, sustituyendo el control manual en tareas repetitivas de banco de pruebas.
- Reproduccion y validacion de un experimento de aprendizaje por imitacion: al ser un checkpoint publico con configuracion de entrenamiento documentada, permite reproducir el pipeline completo con LeRobot y comprobar la coherencia entre datos, entrenamiento y comportamiento resultante.
- Punto de partida para fine-tuning de nuevas tareas: el modelo hereda el conocimiento del base `lerobot/smolvla_base`, por lo que puede reentrenarse con nuevos datasets para tareas de recogida y colocacion distintas, reduciendo el numero de episodios necesarios frente a entrenar desde cero.
- Investigacion en modelos vision-language-action: sirve como referencia de un VLA de ~450 M de parametros para estudiar compromisos entre tamano, coste computacional y capacidad de generalizacion en manipulacion robotica.
- Evaluacion de despliegue en hardware de consumo: al estar disenado para ejecutarse en GPUs de gama consumer, permite medir latencia, throughput y estabilidad de una politica VLA en equipos asequibles.
- Docencia y formacion en robotica: el flujo `lerobot-rollout` y `lerobot-train` documentado en la model card facilita usarlo como ejemplo didactico de aprendizaje por imitacion de principio a fin.
- Recoleccion de datos e iteracion: la politica puede emplearse como controlador inicial para generar nuevas trayectorias que amplien el dataset y alimenten un ciclo de mejora continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito, numero de ensayos ni metricas comparativas para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,8 GB en precision FP32 y unos 0,9 GB en FP16/BF16 solo para los pesos; sumando activaciones de dos imagenes a 480x640 y el estado, el consumo practico se situa aproximadamente entre 2 y 4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM, incluidas RTX 3060, RTX 4060, RTX 4070 y superiores; en entornos de servidor, A100, H100 o L40S ofrecen margen de sobra para ejecucion por lotes o multi-robot.
- Compatibilidad con GPU de consumo: si, es uno de los puntos fuertes declarados del modelo; esta disenado para desplegarse en hardware de gama consumer.
- Opciones de despliegue: la via soportada de forma nativa es LeRobot, mediante los comandos `lerobot-rollout` (ejecucion) y `lerobot-train` (entrenamiento), con `--policy.device=cuda`. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles de forma numerica; el dataset fue grabado a 30 FPS, lo que sugiere una frecuencia de control objetivo en ese orden, pero no se confirma un rendimiento medido.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tune) | ~450 M | VLA (vision-language-action) | apache-2.0 | HuggingFace, via LeRobot |
| SmolVLA base (`lerobot/smolvla_base`) | ~450 M | VLA | no disponible en la informacion proporcionada | HuggingFace, via LeRobot |
| OpenVLA | ~7 B | VLA | MIT | Publico |
| pi0 (Physical Intelligence) | no disponible con certeza | VLA | no disponible con certeza | Publico |

Nota: los datos de OpenVLA y pi0 se incluyen como referencia general de la categoria y deben verificarse en sus fuentes originales; no proceden de la informacion proporcionada en esta busqueda. La comparativa directa de rendimiento no es posible porque este checkpoint no publica evaluacion, mientras que los modelos alternativos si reportan metricas en sus respectivos articulos.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay tasas de exito, numero de ensayos ni condiciones de prueba, por lo que el rendimiento real es desconocido.
- Dataset de entrenamiento muy reducido (54 episodios) para una unica tarea, lo que aumenta el riesgo de sobreajuste y de baja generalizacion a nuevas posiciones, objetos o iluminaciones.
- Generalizacion limitada: el modelo esta especializado en "recoger el cubo rojo y depositarlo en la zona amarilla"; cambios en el objeto, el color, la zona objetivo o los distractores pueden degradar el comportamiento.
- Sensibilidad a la configuracion del hardware: la politica espera exactamente dos camaras (`overhead` y `wrist`) a 480x640 y 30 FPS, y un robot `so_follower`; cualquier desviacion en puertos, indices de camara o calibracion puede provocar fallos.
- La instruccion de tarea debe proporcionarse en ingles y coincidir con la empleada en el entrenamiento.
- Riesgo de acciones incorrectas o inseguras: al ser un modelo de control fisico, una prediccion erronea puede traducirse en movimientos no deseados del robot; se recomienda supervisar y disponer de parada de emergencia.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de informes independientes de uso.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero no cubre posibles patentes o derechos sobre el hardware o el conjunto de datos asociados.
- No se dispone de informacion sobre sesgos, composicion completa del dataset ni procedencia de los datos de pretraining del modelo base.
- Los resultados de la busqueda web realizada no aportaron informacion relevante sobre este modelo (devolvieron contenidos no relacionados sobre APIs de ChatGPT), por lo que no se han podido contrastar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IKOBO/smolvla_so101_red_cube_test001_policy
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/IKOBO/so101_red_cube_test003
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=IKOBO/so101_red_cube_test003
- Articulo de SmolVLA (arXiv): https://huggingface.co/papers/2506.01844
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

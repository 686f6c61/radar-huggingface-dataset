# heyunzhenwhat/act_so101-single-transfer

## Resumen
El modelo `heyunzhenwhat/act_so101-single-transfer` es una política robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario heyunzhenwhat y publicado en Hugging Face siguiendo el formato de LeRobot, la biblioteca de aprendizaje por refuerzo e imitación para robótica real. El modelo está diseñado para controlar un brazo robótico tipo `so_follower` (basado en el SO-ARM100 de código abierto) y resolver una tarea concreta: mover una cinta hasta un área marcada a la derecha.

La relevancia de este modelo radica en que ejemplifica el flujo completo de entrenamiento y despliegue de políticas ACT con LeRobot sobre un dataset propio, `heyunzhenwhat/so101-single-transfer`, compuesto por 50 episodios teleoperados. Con 51,67 millones de parámetros, el modelo no es un LLM sino una política de control basada en visión y estado, sin capacidades de lenguaje. Fue creado el 1 de septiembre de 2026 y su repositorio ocupa 0,2 GB en formato safetensors, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robotico, no procesa texto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (sin capacidades de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo emplea la arquitectura ACT, un transformer encoder-decoder que recibe observaciones multimodales (imágenes de dos cámaras y estado del robot) y produce un fragmento de acciones de longitud fija. Esta técnica reduce la propagacion de errores en la prediccion secuencial y mejora la estabilidad en tareas de manipulacion. El entrenamiento se realizo con el framework LeRobot (version 0.6.1) sobre el dataset `heyunzhenwhat/so101-single-transfer`, que contiene 50 episodios y 15.743 fotogramas a 30 FPS, capturados con una camara cenital y una camara en la muneca del robot. La tarea registrada es "Move the tape into the taped area on the right".

La configuracion de entrenamiento incluye 20.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-05 y semilla 1000. No se aplicaron tecnicas de RLHF ni DPO; se trata de aprendizaje por imitacion supervisado sobre demostraciones teleoperadas. El modelo consume como entrada un vector de estado de 6 dimensiones y dos imagenes (720x1280 y 360x640), y produce un vector de accion de 6 dimensiones, probablemente correspondiente a posicion y orientacion del efector final.

## Capacidades
- Control de un brazo robotico SO-ARM100 (tipo `so_follower`) mediante observaciones de vision y estado.
- Prediccion de acciones de 6 grados de libertad en forma de fragmentos (chunks) de longitud fija.
- Ejecucion de la tarea especifica de transferencia de una cinta a un area marcada.
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robotica real.
- Soporte de multiples camaras (cenital y de muneca) como entrada visual.
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento simbolico, al ser un modelo de control motor.

## Casos de uso
- Automatizacion de tareas de manipulacion repetitiva en entornos de produccion controlada: el modelo puede ejecutar la transferencia de objetos pequeños (como una cinta) a zonas predefinidas, reduciendo la intervencion manual en lineas de ensamblaje.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar la transferencia de politicas ACT entre distintos robots o variaciones de la misma tarea.
- Pruebas de robustez de politicas robotizadas: al ser un modelo ligero (51,6 M de parametros), permite iterar rapidamente en experimentos de laboratorio con hardware SO-ARM100.
- Desarrollo de soluciones de robotica educativa: puede utilizarse en cursos y talleres para demostrar el ciclo completo de recopilacion de datos, entrenamiento y despliegue con LeRobot.
- Benchmarking de metodos de control basados en transformadores: su arquitectura ACT y su dataset asociado permiten comparar variantes de chunking o estrategias de aumento de datos.
- Prototipado de celdas de trabajo colaborativo: el modelo puede integrarse en un entorno de robotica colaborativa para validar la viabilidad de automatizar la manipulacion de materiales ligeros antes de escalar a soluciones industriales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica. No se dispone de metricas como tasa de exito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible, pero al tratarse de un modelo de 51,6 M de parametros, la carga de memoria es reducida; cabe en cualquier GPU moderna con al menos 2-4 GB de VRAM, y probablemente tambien en CPU.
- GPU recomendadas: cualquier GPU con soporte CUDA (p. ej., NVIDIA RTX 3060 o superior) es suficiente; para entrenamiento se recomienda al menos 8 GB de VRAM.
- Compatibilidad con GPU de consumo: si, el modelo es ligero y puede ejecutarse en tarjetas como RTX 4090, RTX 3080 o incluso en integradas para inferencia basica.
- Opciones de despliegue: LeRobot ofrece comandos CLI como `lerobot-rollout` para ejecutar la politica en un robot real; tambien se puede cargar el modelo desde Hugging Face mediante la libreria `lerobot`.
- Latencia y throughput: no disponibles; dependen del hardware y de la velocidad de captura de camaras (30 FPS en el dataset).

## Comparativa con modelos similares
No se dispone de informacion sobre modelos comparables directamente en la misma categoria (politicas roboticas ACT especificas para SO-ARM100). El metodo ACT es un referente en aprendizaje por imitacion, pero no hay datos publicados de otros modelos entrenados sobre el mismo dataset o tarea. Se puede mencionar la alternativa de usar politicas basadas en Diffusion Policy u otros metodos de LeRobot, pero no se dispone de comparaciones cuantitativas.

## Limitaciones y advertencias
- El modelo esta entrenado exclusivamente para una tarea concreta (transferencia de una cinta a un area marcada) y con un robot especifico (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- El dataset de entrenamiento es pequeno (50 episodios, 15.743 fotogramas), lo que puede limitar la robustez ante variaciones de iluminacion, posicion de objetos o perturbaciones externas.
- No se han proporcionado resultados de evaluacion, por lo que se desconoce la tasa de exito real en el robot fisico.
- Al ser un modelo de control motor, no tiene capacidades de lenguaje ni de razonamiento simbolico; no puede interpretar instrucciones textuales ni adaptarse a contextos no vistos.
- La licencia Apache-2.0 permite uso comercial, pero el robot y las camaras necesarios para el despliegue son hardware especifico que debe adquirirse por separado.
- La dependencia de dos camaras con resoluciones concretas (720x1280 y 360x640) implica que cambios en la configuracion de captura pueden degradar el rendimiento.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/heyunzhenwhat/act_so101-single-transfer
- Dataset de entrenamiento: https://huggingface.co/datasets/heyunzhenwhat/so101-single-transfer
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Proyecto SO-ARM100: https://github.com/TheRobotStudio/SO-ARM100
- Repositorio lerobot-so101: https://github.com/jyang-ca/lerobot-so101

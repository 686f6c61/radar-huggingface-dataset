# s1eepypillow/task12_act_test2

## Resumen

El modelo `task12_act_test2` es una politica de aprendizaje por imitacion basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Desarrollado por el usuario s1eepypillow, el modelo esta disenado para controlar un brazo robotico SO-100 de 6 grados de libertad en tareas de manipulacion de bloques. Con 51,6 millones de parametros, es una politica compacta que aprende a partir de demostraciones teleoperadas.

El modelo se entreno sobre un dataset de 346 episodios (380.956 frames a 30 FPS) que cubre dos tareas distintas ("task1" y "task2") relacionadas con manipulacion de bloques. Utiliza dos camaras (superior y de muneca) como entrada visual, junto con el estado articular del robot, y genera secuencias de acciones (action chunks) en lugar de pasos individuales, lo que permite un control mas suave y preciso.

La relevancia de este modelo radica en su enfoque de aprendizaje por imitacion con chunking de acciones, una tecnica que ha demostrado altas tasas de exito en manipulacion robotica. Al ser un modelo pequeno y entrenado con LeRobot, es accesible para experimentacion en hardware de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con CVAE |
| Parametros totales | 51.629.190 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica robotica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robotica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que utiliza un autoencoder variacional condicional (CVAE) con backbone transformer. A diferencia de los metodos que predicen una sola accion por paso, ACT predice secuencias de acciones (chunks), lo que reduce la acumulacion de errores y produce movimientos mas fluidos. El modelo se entrena con datos teleoperados, aprendiendo la distribucion de acciones condicionada a las observaciones.

El entrenamiento se realizo con 100.000 pasos, batch size de 64, optimizador AdamW y learning rate de 1e-5, con semilla 1000. El dataset de entrenamiento contiene 346 episodios y 380.956 frames a 30 FPS, cubriendo dos tareas de manipulacion de bloques. Se utilizo la version 0.6.1 de LeRobot. El modelo recibe como entrada el estado articular (6 dimensiones), imagenes de dos camaras (superior y muneca) a resolucion 480x640, y un estado del entorno (1 dimension), produciendo acciones de 6 dimensiones.

## Capacidades

- Control robotico por aprendizaje por imitacion: el modelo reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Percepcion visual multimodal: procesa simultaneamente imagenes de dos camaras (superior y de muneca) a resolucion 480x640.
- Prediccion de secuencias de acciones (action chunking): genera chunks de acciones en lugar de pasos individuales, mejorando la suavidad del control.
- Aprendizaje multi-tarea: entrenado en dos tareas distintas de manipulacion de bloques ("task1" y "task2").
- Control de brazo robotico de 6 grados de libertad: compatible con el robot SO-100 follower de LeRobot.
- Inferencia en tiempo real: al ser un modelo de solo 51,6 millones de parametros, es capaz de operar en tiempo real en hardware modesto.

## Casos de uso

- Manipulacion de bloques en entornos de laboratorio: el modelo esta especificamente entrenado para tareas de manipulacion de bloques, lo que lo hace util para experimentos de robotica en investigacion.
- Evaluacion de politicas de aprendizaje por imitacion: sirve como punto de partida para comparar el rendimiento de ACT frente a otros metodos (Diffusion Policy, etc.) en el framework LeRobot.
- Prototipado rapido de soluciones roboticas: al ser un modelo pequeno y entrenado con LeRobot, permite iterar rapidamente en el desarrollo de nuevas tareas de manipulacion.
- Investigacion en action chunking: el modelo permite estudiar el impacto del chunking de acciones en la precision y suavidad del control robotico.
- Benchmarking de hardware robotico: puede utilizarse para validar el rendimiento de brazos roboticos de bajo coste como el SO-100.
- Educacion en robotica y aprendizaje por imitacion: al ser un modelo abierto con licencia Apache 2.0, es adecuado para cursos y talleres de robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,6 millones de parametros, lo que supone aproximadamente 206 MB en FP32 y 103 MB en FP16. Cabe en cualquier GPU moderna, incluso en GPUs integradas.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) es suficiente para inferencia en tiempo real.
- Compatibilidad con GPU de consumo: si, el modelo cabe sin problemas en GPUs de consumo.
- Opciones de despliegue: el modelo se ejecuta mediante el CLI de LeRobot (`lerobot-rollout`), que gestiona la captura de camaras, el control del robot y la inferencia de la politica. Tambien puede integrarse en pipelines personalizados via la API de Python de LeRobot.
- Latencia y throughput: no se han publicado mediciones especificas de latencia. Dado el tamano del modelo, se espera una latencia de inferencia inferior a 10 ms en GPUs modernas, aunque la latencia total del sistema dependera de la captura de camaras y la comunicacion con el robot.

## Comparativa con modelos similares

No se dispone de datos de comparacion directa con otros modelos en la informacion proporcionada. El modelo pertenece a la familia de politicas ACT entrenadas con LeRobot, que comparten la misma arquitectura base pero se diferencian en el dataset, las tareas y la configuracion de entrenamiento. Otro modelo ACT similar es `Kyumeo/ACT_Test2`, tambien entrenado con LeRobot, aunque no se dispone de sus especificaciones tecnicas para una comparacion detallada.

## Limitaciones y advertencias

- Sin resultados de evaluacion: no se han publicado tasas de exito ni metricas de rendimiento en robot real, por lo que se desconoce la fiabilidad del modelo en produccion.
- Especificidad de la tarea: el modelo esta entrenado para tareas concretas de manipulacion de bloques ("task1" y "task2") y puede no generalizar a otras tareas o entornos.
- Dependencia del entorno de entrenamiento: el rendimiento puede degradarse si cambian las condiciones de iluminacion, la posicion de los objetos o la configuracion de las camaras.
- Sin soporte de lenguaje: al ser un modelo de robotica, no procesa texto ni instrucciones verbales.
- Modelo experimental: con 0 descargas y 0 likes, es un modelo reciente y sin validacion por parte de la comunidad.
- Requiere hardware robotico: para su uso practico se necesita un brazo robotico SO-100 follower, camaras y el framework LeRobot instalado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/s1eepypillow/task12_act_test2
- Dataset de entrenamiento: https://huggingface.co/datasets/s1eepypillow/grad_block_merged_task12_test2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act

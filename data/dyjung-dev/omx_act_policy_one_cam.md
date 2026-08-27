# dyjung-dev/omx_act_policy_one_cam

## Resumen

El modelo `dyjung-dev/omx_act_policy_one_cam` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario dyjung-dev y publicada en Hugging Face bajo la licencia Apache 2.0. Está entrenada con el framework LeRobot y el dataset `dyjung-dev/pick_and_place_one_cam`, que contiene demostraciones teleoperadas de tareas de pick and place con una única cámara. El modelo predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación.

Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto diseñado para ejecutarse en hardware robótico embebido o en GPUs de consumo. Su relevancia radica en que demuestra cómo los transformers pueden aplicarse a la robótica de imitación, ofreciendo una alternativa accesible y reproducible para el control de brazos manipuladores como el OpenMANIPULATOR-X (OMX). El modelo se distribuye en formato safetensors y se integra directamente con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de control robotico, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, descrita en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). ACT es un metodo de aprendizaje por imitacion que utiliza un transformer encoder-decoder para procesar observaciones (imagenes de camara y estado del robot) y generar un chunk de acciones futuras de longitud fija. Esta prediccion por lotes reduce la acumulacion de errores y mejora la precision en tareas de manipulacion.

El entrenamiento se realizo con el framework LeRobot, utilizando el dataset `dyjung-dev/pick_and_place_one_cam`, que contiene demostraciones teleoperadas de tareas de pick and place con una unica camara. No se dispone de informacion detallada sobre el numero de episodios, la composicion exacta del dataset ni si se aplicaron tecnicas de refinamiento como RLHF o DPO. El modelo se publico con la configuracion de entrenamiento incluida en el repositorio, lo que permite reproducir el proceso mediante los comandos de LeRobot.

## Capacidades

- Control de robot para tareas de manipulacion: genera secuencias de acciones articulares para un brazo robotico, permitiendo ejecutar tareas de pick and place.
- Procesamiento de vision por camara: utiliza imagenes de una unica camara como entrada para percibir el entorno y localizar objetos.
- Prediccion por chunks: emite bloques de acciones (action chunking) en lugar de pasos individuales, lo que mejora la coherencia temporal del movimiento.
- Integracion con LeRobot: compatible con el pipeline de entrenamiento, evaluacion e inferencia de LeRobot, incluyendo el registro de episodios y la reproduccion de politicas.
- Adaptabilidad a entornos de demostracion: al ser un modelo de imitacion, puede replicar comportamientos aprendidos de teleoperacion, siempre que el entorno de inferencia sea similar al de entrenamiento.
- No incluye capacidades de lenguaje natural, tool calling ni razonamiento simbolico; su funcion es exclusivamente el control motor.

## Casos de uso

- Automatizacion de tareas de pick and place en lineas de montaje: el modelo puede controlar un brazo robotico para recoger piezas de una posicion fija y colocarlas en otra, reduciendo la intervencion humana en procesos repetitivos.
- Prototipado rapido de politicas robotica: gracias a su tamano reducido y a la integracion con LeRobot, permite a investigadores entrenar y evaluar nuevas tareas de manipulacion en pocas horas con una GPU de consumo.
- Educacion en robotica y aprendizaje por imitacion: sirve como ejemplo practico para ensenar a estudiantes como se entrena una politica ACT con datos teleoperados, utilizando el codigo y los comandos publicados.
- Investigacion en generalizacion de politicas: al estar entrenado con una sola camara, puede usarse para estudiar como varia el rendimiento al cambiar el angulo de la camara o la iluminacion, contribuyendo a la robustez de los modelos.
- Despliegue en robots de bajo coste: el modelo es compatible con el robot SO-100 (usado en los ejemplos de LeRobot) y con el OpenMANIPULATOR-X, lo que permite implementar control inteligente en plataformas accesibles.
- Evaluacion comparativa de metodos de imitacion: al ser un checkpoint publico, puede utilizarse como referencia para comparar ACT con otros algoritmos (por ejemplo, Diffusion Policy) en la misma tarea de pick and place.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de exito, tasas de acierto ni comparaciones con otros modelos en tareas estandarizadas. Se recomienda a los usuarios evaluar el modelo en su propio entorno siguiendo el procedimiento de LeRobot (`lerobot-record` con `--policy.path`).

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamano del modelo (51,7 M de parametros), se estima que puede ejecutarse en GPUs con al menos 4 GB de VRAM, pero no se proporcionan datos oficiales.
- GPU recomendadas: no se especifican. Por su tamano, es probable que funcione en GPUs de consumo como RTX 3060, RTX 4060 o superiores, asi como en GPUs de datacenter (T4, A10).
- Compatibilidad con consumer GPU: probablemente si, debido al bajo numero de parametros, pero no hay confirmacion oficial.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia en PyTorch con CUDA. No se mencionan adaptaciones para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependera del hardware y de la longitud del chunk de acciones configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dyjung-dev/omx_act_policy_one_cam | 51,7 M | no disponible | Apache 2.0 | safetensors | Entrenado con LeRobot, tarea pick and place con una camara |
| Jin-01/omx_act_policy | no disponible (repo de 207 MB) | no disponible | no especificada | safetensors | Tambien basado en ACT, mismo tipo de tarea, pero sin datos publicos de parametros |
| cheeunshin/omx-ai-policy (GitHub) | no disponible | no disponible | no especificada | no disponible | Proyecto experimental para OMX, interpreta lenguaje natural y vision, pero no es un modelo ACT puro |

No se dispone de informacion suficiente para comparar rendimiento ni arquitecturas detalladas. Ambos modelos de Hugging Face comparten el enfoque ACT y el uso de LeRobot, pero no hay metricas publicas que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos en los datos de demostracion: el modelo aprende exclusivamente de las demostraciones teleoperadas del dataset `pick_and_place_one_cam`. Si las demostraciones contienen sesgos (por ejemplo, posiciones de camara fijas, iluminacion constante), el modelo puede fallar en entornos diferentes.
- Riesgo de alucinacion de acciones: al ser un modelo generativo, puede producir secuencias de acciones incoherentes o no seguras si las observaciones difieren significativamente de las de entrenamiento. Es necesario implementar mecanismos de seguridad (limites de velocidad, parada de emergencia) en despliegues reales.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al ser un modelo de control robotico, su "contexto" se limita a las observaciones actuales (imagen y estado) y no a historial largo. No es adecuado para tareas que requieran memoria a largo plazo.
- Dependencia del hardware: el rendimiento puede variar segun la camara, el robot y la configuracion del entorno. No hay garantias de generalizacion a otros brazos roboticos sin reentrenamiento.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero se debe mantener el aviso de copyright y atribucion. No hay restricciones adicionales conocidas.
- Estado del modelo: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento reciente o de baja difusion. No hay evidencia de validacion externa ni de uso en produccion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dyjung-dev/omx_act_policy_one_cam)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentacion de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Modelo similar: Jin-01/omx_act_policy](https://huggingface.co/Jin-01/omx_act_policy)
- [Proyecto relacionado: cheeunshin/omx-ai-policy](https://github.com/cheeunshin/omx-ai-policy)

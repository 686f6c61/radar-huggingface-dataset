# peter1111aaaa/my_act

## Resumen

El modelo `peter1111aaaa/my_act` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario peter1111aaaa (kim) utilizando la librería LeRobot de Hugging Face, y está diseñado para operar sobre un robot tipo `omx_follower` con dos cámaras (frontal y de muñeca). El modelo cuenta con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo convierte en una política ligera y desplegable en hardware de bajo coste.

El modelo resuelve el problema de control de manipulación robótica a partir de demostraciones teleoperadas. Su relevancia radica en que ofrece una solución compacta y entrenable para tareas de recogida y colocación de objetos, un caso de uso frecuente en almacenes y entornos domésticos. Al estar integrado en el ecosistema LeRobot, permite reproducir el entrenamiento y el despliegue con comandos estándar, lo que facilita su adopción en proyectos de investigación y desarrollo robótico.

La arquitectura sigue el diseño original de ACT, que combina un codificador de visión basado en ResNet con un transformador que genera acciones continuas de seis dimensiones. El modelo fue entrenado durante 50.000 pasos con un conjunto de datos de 451 episodios y 167.728 fotogramas a 30 FPS, abarcando tareas como recoger objetos y depositarlos en una cesta o limpiar la mesa. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con codificador de vision ResNet y decodificador transformer |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de control robotico, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no aplica (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT descrita en el articulo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arxiv:2304.13705). Se trata de un transformer que recibe como entrada las observaciones del robot: el estado interno (vector de 6 dimensiones) y las imagenes de dos camaras (frontal y de muñeca, cada una de 480x640 píxeles en RGB). El codificador de vision extrae características de las imagenes mediante una red ResNet, y el transformer procesa la secuencia de observaciones para predecir un chunk de acciones continuas de 6 dimensiones (probablemente posicion y orientacion del efector final). Esta predicción por chunks permite al robot ejecutar varios pasos de control sin necesidad de re-planificar en cada instante, lo que mejora la suavidad y la tasa de exito en tareas de manipulacion.

El entrenamiento se realizó con el dataset `peter1111aaaa/omx-smolvla-dataset-merged_20260817_172234`, que contiene 451 episodios y 167.728 fotogramas a 30 FPS. Las tareas incluyen recoger objetos (platanos, galletas, pasteles, helados, etc.) y depositarlos en una cesta o limpiar la mesa. La configuracion de entrenamiento fue: 50.000 pasos, tamaño de lote 8, optimizador AdamW con tasa de aprendizaje 1e-05 y semilla 1000. Se utilizó la version 0.6.2 de LeRobot. No se menciona el uso de tecnicas como RLHF o DPO; el aprendizaje es puramente por imitacion supervisada a partir de datos teleoperados.

## Capacidades

- Control robotico de manipulacion: recoger, levantar y colocar objetos en una cesta o contenedor.
- Ejecucion de tareas de limpieza de mesa (retirar todos los elementos).
- Entrada multimodal: combina dos camaras (frontal y de muñeca) con el estado propioceptivo del robot.
- Salida de acciones continuas de 6 grados de libertad, adecuada para control de efector final.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de ingenieria de recompensas.
- Integracion con el ecosistema LeRobot: permite entrenamiento, evaluacion y despliegue mediante comandos CLI estandarizados.
- No incluye capacidades de lenguaje, vision general, tool calling ni razonamiento simbolico.

## Casos de uso

- Automatizacion de almacen: el modelo puede ejecutar tareas de recogida y empaquetado de productos (por ejemplo, colocar galletas, pasteles o helados en una cesta) en un entorno controlado, reduciendo la intervencion humana en procesos repetitivos.
- Robotica domestica asistencial: en una cocina o comedor, puede encargarse de recoger objetos de una mesa y depositarlos en un contenedor, como parte de un sistema de limpieza autonomo.
- Investigacion en aprendizaje por imitacion: al ser un modelo ligero y entrenable, sirve como punto de partida para estudiar el efecto de la prediccion por chunks en la tasa de exito de tareas de manipulacion.
- Prototipado rapido de politicas robotizadas: gracias a la integracion con LeRobot, un desarrollador puede replicar el entrenamiento con su propio dataset o adaptar el modelo a nuevas tareas con pocos cambios de configuracion.
- Despliegue en robots de bajo coste: el tamaño reducido (51,7 millones de parametros) permite ejecutar la inferencia en hardware modesto, como una GPU de gama media o incluso una CPU, lo que facilita su uso en plataformas educativas o de investigacion.
- Evaluacion de politicas de manipulacion en entornos simulados o reales: el modelo puede utilizarse como referencia para comparar el rendimiento de otros algoritmos de control basados en transformadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB para los pesos del modelo (51,7 millones de parametros en FP32 ocupan aproximadamente 207 MB), aunque el procesamiento de imagenes de 480x640 puede requerir memoria adicional. En la practica, una GPU con 4 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, por ejemplo NVIDIA RTX 3060, RTX 4060, o incluso GPUs integradas con suficiente memoria compartida.
- Cabe en GPU de consumo: si, es un modelo ligero que puede ejecutarse en tarjetas graficas de gama media o baja.
- Opciones de despliegue: la inferencia se realiza mediante el comando `lerobot-rollout` de LeRobot, que gestiona la carga del modelo y la comunicacion con el robot. No se menciona soporte para vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el repositorio de Hugging Face con el mismo tamaño y proposito. El modelo ACT original de la publicacion de referencia (arxiv:2304.13705) no publica pesos oficiales, por lo que esta implementacion de LeRobot es una de las pocas disponibles publicamente. Se podria comparar con otros modelos entrenados con LeRobot para tareas similares, pero no hay datos concretos en la informacion consultada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo ha sido entrenado exclusivamente con las tareas y el robot especificados en el dataset (omx_follower con dos camaras). No generaliza a otras configuraciones de robot, numero de camaras o tareas fuera de su distribucion.
- No se han publicado metricas de rendimiento en el mundo real ni en simulacion, por lo que se desconoce su tasa de exito real.
- El dataset de entrenamiento pertenece a un autor particular y no ha sido auditado externamente; puede contener sesgos en la forma de ejecutar las tareas o en la distribucion de los objetos.
- La dependencia de dos camaras fijas (frontal y de muñeca) implica que el modelo fallara si las camaras se mueven o cambian de posicion.
- No se especifica si el modelo soporta variaciones en la iluminacion, texturas o colores de los objetos mas alla de los presentes en el dataset.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento del modelo en entornos de produccion.
- Para un despliegue seguro en robotica real, es imprescindible validar el modelo en condiciones controladas y con supervisión humana, dado el riesgo de movimientos no deseados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/peter1111aaaa/my_act
- Dataset de entrenamiento: https://huggingface.co/datasets/peter1111aaaa/omx-smolvla-dataset-merged_20260817_172234
- Paper de referencia (ACT): https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index

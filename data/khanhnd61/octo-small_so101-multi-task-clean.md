# khanhnd61/octo-small_so101-multi-task-clean

## Resumen

`khanhnd61/octo-small_so101-multi-task-clean` es un modelo de política robótica (policy) entrenado con la librería LeRobot de Hugging Face, basado en la arquitectura Octo. Se trata de un modelo de aprendizaje por imitación que procesa observaciones visuales de dos cámaras (frontal y de muñeca) y genera acciones de control para un robot manipulador de tipo `so_follower`. El modelo fue desarrollado por el usuario `khanhnd61` y está publicado bajo licencia Apache 2.0.

El modelo tiene un total de 27.040.008 parámetros y está almacenado en formato `safetensors`. Su tamaño es de aproximadamente 0,1 GB, lo que lo convierte en un modelo muy ligero, apto para ejecutarse en hardware modesto. Está entrenado sobre un dataset de 44 episodios y 15.317 fotogramas a 30 FPS, con tres tareas concretas: meter la cinta en la caja, meter la cinta en la taza y meter la taza en la caja. No se trata de un modelo de lenguaje, sino de un modelo de control para robótica, por lo que sus capacidades se limitan a la generación de acciones motoras a partir de entradas visuales.

La relevancia de este modelo radica en que forma parte del ecosistema LeRobot, que permite reproducir, entrenar y evaluar políticas de manipulación robótica de forma estandarizada. Al ser un checkpoint pequeño y específico, resulta útil como referencia para experimentos de aprendizaje por imitación, investigación en robótica de bajo coste y prototipado rápido de tareas de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de política de visión-acción (VLA) basado en Octo, implementado en LeRobot |
| Parametros totales | 27.040.008 |
| Longitud de contexto | No disponible (modelo de política robótica, no aplica) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo multimodal de visión-acción) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Octo, una política generalista de visión-acción originalmente propuesta en el paper *Octo: An Open-Source Generalist Robot Policy*. En esta implementación concreta, la política consume dos entradas visuales: una imagen de cámara frontal de tamaño `(3, 256, 256)` y una imagen de cámara de muñeca de tamaño `(3, 128, 128)`. A partir de estas observaciones, el modelo genera una acción de 6 dimensiones, que corresponde a los grados de libertad del robot manipulador `so_follower`.

El entrenamiento se realizó mediante aprendizaje por imitación sobre el dataset `khanhnd61/so101-multi-task-clean`, que contiene 44 episodios y 15.317 fotogramas a 30 FPS. La configuración de entrenamiento incluye 9.500 pasos, tamaño de lote de 16, optimizador AdamW con tasa de aprendizaje de 0,0003, semilla 1000 y la versión 0.6.1 de LeRobot. No se aplicaron técnicas de RLHF ni DPO, ya que se trata de un modelo de control robótico, no de un modelo de lenguaje. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones de control para un robot manipulador: produce una acción de 6 dimensiones para cada par de imágenes de entrada.
- Procesamiento multimodal de visión: utiliza simultáneamente una cámara frontal y una cámara de muñeca para observar la escena.
- Aprendizaje por imitación: reproduce las tareas del dataset de entrenamiento, como colocar objetos en recipientes.
- Integración con LeRobot: el modelo se puede cargar y ejecutar mediante los comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, razonamiento de lenguaje ni generación de texto, al ser un modelo puramente robótico.
- No dispone de capacidades de visión general (detección de objetos, clasificación, etc.) más allá de la tarea específica para la que fue entrenado.

## Casos de uso

- Manipulación de objetos en laboratorio: el modelo puede ejecutar tareas de recogida y colocación como "meter la cinta en la caja" o "meter la taza en la caja", lo que resulta útil en entornos de investigación robótica donde se necesita repetir movimientos controlados.
- Automatización de tareas repetitivas en entornos controlados: en una línea de montaje o en un banco de pruebas, el modelo puede realizar operaciones de inserción de piezas en contenedores, siempre que la configuración de cámaras y robot coincida con el entrenamiento.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar políticas, estudiar la transferencia entre tareas o analizar el efecto de la cantidad de datos en el rendimiento.
- Prototipado rápido de nuevas tareas: al ser un modelo pequeño y con una API sencilla en LeRobot, permite iterar rápidamente sobre nuevas demostraciones y ajustar el comportamiento sin necesidad de infraestructura pesada.
- Educación en robótica: el modelo puede utilizarse en cursos o talleres para demostrar el ciclo completo de grabación de datos, entrenamiento y despliegue de una política robótica con LeRobot.
- Control de robots de bajo coste: dado su tamaño reducido y su baja demanda de cómputo, es adecuado para robots de tipo `so_follower` con hardware limitado, como en proyectos de robótica DIY o en entornos académicos sin GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 108 MB en FP32 y 54 MB en FP16, calculados a partir de los 27.040.008 parámetros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna, incluida una RTX 3060 o inferior.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout` y `lerobot-train`), con soporte para dispositivos CUDA o CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con datos publicados en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en tres tareas específicas y con un robot concreto (`so_follower`), por lo que su generalización a otros robots, entornos o tareas es muy limitada.
- Depende de la configuración exacta de cámaras (frontal y de muñeca) utilizada durante el entrenamiento; cambios en el hardware o en la posición de las cámaras pueden degradar el rendimiento.
- No es un modelo de lenguaje ni un modelo de visión general; no puede entender instrucciones de texto complejas ni realizar razonamiento simbólico.
- Existe riesgo de ejecución incorrecta o de movimientos inseguros si el entorno de despliegue difiere del de entrenamiento, especialmente en tareas de manipulación física.
- No se han proporcionado resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito en condiciones reales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está pensado para investigación y desarrollo robótico, no como producto final sin una validación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khanhnd61/octo-small_so101-multi-task-clean
- Dataset de entrenamiento: https://huggingface.co/datasets/khanhnd61/so101-multi-task-clean
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot

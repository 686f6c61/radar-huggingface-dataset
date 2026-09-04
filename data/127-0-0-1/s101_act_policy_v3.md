# 127-0-0-1/s101_ACT_Policy_v3

## Resumen

El modelo `127-0-0-1/s101_ACT_Policy_v3` es una política de robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario `127-0-0-1` y publicada en Hugging Face. Se trata de un modelo de aprendizaje por imitación que ha sido entrenado con el framework LeRobot de Hugging Face y con un dataset de teleoperación específico. Su objetivo es controlar un robot de tipo `so_follower` para realizar una tarea concreta: agarrar imanes circulares y colocarlos en un cuenco.

La política tiene 51.668.614 parámetros y está publicada en formato `safetensors` dentro de un repositorio de 0.2 GB. Se compone de un módulo de visión que procesa imágenes de dos cámaras (`top` y `wrist`) y un estado de robot de 6 dimensiones, generando como salida una acción de 6 dimensiones. El modelo está pensado para ejecutarse mediante el CLI de LeRobot y no es un modelo de lenguaje, sino una política de control para manipulación robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política de robótica) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo es ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. Esto permite que la política genere secuencias de acciones coherentes, lo que resulta especialmente útil en tareas de manipulación fina. La implementación está basada en LeRobot, y el modelo se ha entrenado utilizando el dataset `127-0-0-1/s101-ACT_v3_20260903_194632`, que contiene 70 episodios y 26.495 fotogramas a 30 FPS. La tarea registrada es "Grab the circular magnets and put them in the bowl".

El entrenamiento se realizó durante 100.000 pasos, con un tamaño de lote de 8, optimizador AdamW, tasa de aprendizaje de 1e-05, semilla 1000 y la versión 0.6.2 de LeRobot. No se menciona ningún proceso de RLHF ni DPO; se trata de un aprendizaje por imitación supervisado a partir de datos teleoperados. Las observaciones de entrada son el estado del robot (6 dimensiones) y dos imágenes RGB de 480x640 procedentes de las cámaras `top` y `wrist`.

## Capacidades

- Control de robot a partir de observaciones multimodales: combina el estado articular del robot con imágenes de dos cámaras para predecir acciones de 6 dimensiones.
- Predicción de acciones por fragmentos (action chunks): en lugar de generar un único paso, el modelo produce secuencias cortas de acciones, mejorando la estabilidad de la ejecución.
- Aprendizaje por imitación: ejecuta la tarea aprendida de teleoperación, que consiste en agarrar imanes circulares y colocarlos en un cuenco.
- Procesamiento de visión: trabaja con imágenes RGB de 480x640, por lo que tiene capacidad de percepción visual básica.
- No soporta tool calling, razonamiento en lenguaje natural ni generación de texto: es exclusivamente una política de robótica.
- Capacidades multilingües: no aplica.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorios: el modelo puede utilizarse para recoger objetos pequeños y colocarlos en contenedores, como en la tarea de los imanes circulares. Es adecuado porque la predicción por fragmentos mantiene la coherencia del movimiento.
- Robótica de ensamblaje en entornos de fabricación: en líneas de montaje donde se repiten gestos de agarre y colocación, la política puede ejecutar ciclos cortos de manipulación. Su entrenamiento con datos teleoperados facilita la transferencia a movimientos precisos.
- Referencia para investigación en aprendizaje por imitación: sirve como punto de partida para comparar políticas ACT con otras implementaciones del ecosistema LeRobot, como Diffusion Policy. Es útil por su tamaño reducido y su formato safetensors.
- Formación y docencia en robótica: permite a estudiantes y desarrolladores practicar el ciclo completo de entrenamiento e inferencia con LeRobot. El CLI `lerobot-rollout` simplifica la ejecución de la política sobre un robot real.
- Prototipado de tareas domésticas: aunque el modelo está entrenado para una tarea concreta, puede adaptarse para recoger objetos de una mesa y colocarlos en un cuenco, sirviendo como base para desarrollar asistentes robóticos domésticos.
- Pruebas de concepto en robótica de bajo coste: al estar diseñado para el robot `so_follower` y funcionar con cámaras estándar, es adecuado para validar la viabilidad de sistemas de manipulación en plataformas económicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se han proporcionado resultados de evaluación para esta política, por lo que se desconoce la tasa de éxito real en la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. El modelo ocupa 0.2 GB en safetensors, lo que sugiere una huella de memoria baja, pero no hay datos confirmados.
- GPU recomendadas: no disponible. Por el tamaño del modelo, cualquier GPU moderna con soporte CUDA y suficiente memoria para ejecutar LeRobot debería ser válida, pero no se especifican requisitos oficiales.
- Capacidad en GPU de consumo: probablemente sí, dado el peso reducido del modelo, aunque no hay una confirmación explícita.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout` para ejecutar la política sobre el robot. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se incluyen comparativas con otros modelos de la misma categoría ni datos sobre alternativas equivalentes.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea y un robot muy específicos (`so_follower` con cámaras `top` y `wrist`). No generaliza a otros robots, tareas ni configuraciones de cámara sin reentrenamiento.
- El dataset de entrenamiento es pequeño (70 episodios), lo que puede limitar la robustez frente a cambios de iluminación, posición de objetos o presencia de distractores.
- No se han publicado resultados de evaluación, por lo que no hay datos que respalden su rendimiento en producción.
- La inferencia requiere que las observaciones coincidan exactamente con las entradas esperadas: estado de 6 dimensiones e imágenes de 480x640. Un cambio en el número de cámaras o en el estado del robot invalidaría la política.
- La licencia Apache 2.0 permite el uso comercial, pero el modelo depende del framework LeRobot y de la configuración específica del robot, lo que condiciona su despliegue.
- En entornos distintos al dataset, la política puede generar acciones inesperadas o no seguras. Es necesario validar el comportamiento en un entorno controlado antes de cualquier aplicación real.

## Enlaces

- Repositorio del modelo: https://huggingface.co/127-0-0-1/s101_ACT_Policy_v3
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/127-0-0-1/s101-ACT_v3_20260903_194632
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=127-0-0-1/s101-ACT_v3_20260903_194632

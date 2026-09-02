# kiroaiseoul/act_task09_close_refrigerator_60k

## Resumen

El modelo `kiroaiseoul/act_task09_close_refrigerator_60k` es una política de imitación basada en Action Chunking with Transformers (ACT), un método presentado en el paper arXiv:2304.13705 que predice secuencias cortas de acciones en lugar de pasos individuales. Ha sido entrenado y publicado mediante la librería LeRobot de Hugging Face, sobre el dataset `kiroaiseoul/task09_close_refrigerator`, que contiene teleoperaciones de la tarea de cerrar un refrigerador. Está pensado para ser ejecutado en un robot manipulador SO-100 (follower) y demuestra la aplicación práctica de ACT en tareas domésticas de manipulación.

El modelo cuenta con 51.689.104 parámetros en formato safetensors y ocupa aproximadamente 0.2 GB. Su relevancia radica en que ejemplifica un flujo completo de entrenamiento de políticas robóticas con LeRobot, desde la recopilación de datos teleoperados hasta la evaluación en el robot real. La licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.689.104 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer encoder-decoder. La clave del método es la predicción de "chunks" de acciones: en lugar de predecir una sola acción por paso de tiempo, el modelo predice una secuencia de acciones futuras (por ejemplo, 50 pasos) que luego se ejecutan sin re-planificación, lo que reduce la acumulación de errores y mejora la estabilidad en tareas de manipulación. El entrenamiento se realiza sobre datos teleoperados, donde un humano controla el robot para demostrar la tarea.

El modelo fue entrenado con la librería LeRobot, que proporciona la infraestructura para cargar el dataset, entrenar la política y evaluarla. Según la información disponible, el dataset `kiroaiseoul/task09_close_refrigerator` contiene un número de episodios no especificado (el repositorio del dataset indica un tamaño de 579 MB en formato parquet, con modalidades tabular, series temporales y vídeo). No se detallan las condiciones de entrenamiento (número de épocas, tamaño de lote, configuración del optimizador, ni si se aplicaron técnicas como aumentación de datos). Tampoco se especifica el tamaño del chunk de acciones utilizado.

## Capacidades

- Ejecución de la tarea específica de cerrar la puerta de un refrigerador mediante teleoperación y control del robot SO-100.
- Generalización limitada a la tarea y configuración del dataset de entrenamiento.
- Predicción de secuencias de acciones (action chunking) que permiten movimientos suaves y coordinados.
- Integración con LeRobot para entrenamiento, evaluación y registro de episodios.
- No soporta tool calling, generación de texto, razonamiento ni capacidades multimodales fuera del ámbito robótico.
- No incluye modo de pensamiento o razonamiento simbólico.

## Casos de uso

- Automatización doméstica de bajo coste: el modelo puede controlar un robot SO-100 para cerrar la puerta de un refrigerador, demostrando la viabilidad de la robótica de imitación en entornos domésticos con hardware accesible.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del tamaño del dataset (60k muestras) en la tasa de éxito de ACT.
- Benchmark de manipulación: puede utilizarse como referencia para comparar ACT con otras políticas (diffusion policies, etc.) en la misma tarea y con el mismo dataset.
- Prueba de integración de LeRobot: permite validar el flujo completo de entrenamiento y despliegue de una política robótica con la librería LeRobot, desde la carga del dataset hasta la evaluación en el robot real.
- Desarrollo de asistentes robóticos para personas con movilidad reducida: una tarea como cerrar un refrigerador es un componente básico que podría integrarse en un sistema más amplio de asistencia en el hogar.
- Educación en robótica: un modelo pequeño (51M parámetros) y con licencia permisiva es adecuado para laboratorios docentes que necesiten ejemplos prácticos de entrenamiento de políticas con transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito ni métricas de evaluación sobre el robot real o en simulación. No se puede comparar cuantitativamente con otros modelos sin datos adicionales.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7M de parámetros, la inferencia requiere muy poca VRAM. En FP32, los pesos ocupan aproximadamente 207 MB, por lo que cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA (GTX 1060 6GB o superior, RTX 3060, RTX 4090, A100, H100). Para entrenamiento, se recomienda al menos 8 GB de VRAM, aunque LeRobot suele funcionar con 6-8 GB para modelos de este tamaño.
- En consumer GPU: sí, cabe en GPUs de gama media como RTX 3060 o RTX 4060.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación (`lerobot-record`) que requieren un robot físico SO-100. También puede ejecutarse en simulación si se dispone de un entorno compatible.
- Latencia y throughput: no disponibles. Dependen del hardware y de la frecuencia de control del robot.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables para la misma tarea y dataset. ACT es una arquitectura de referencia en aprendizaje por imitación, pero este repositorio concreto no publica comparativas con otras políticas. Se puede mencionar que existen otras políticas en LeRobot como Diffusion Policy o VQ-BeT, pero no hay datos de rendimiento en esta tarea específica.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo puede estar sesgado hacia la configuración específica del robot y el entorno de teleoperación utilizado durante la recopilación de datos. Cambios de iluminación, posición de la cámara o variaciones en la puerta del refrigerador pueden degradar el rendimiento.
- Riesgo de alucinación: en el contexto robótico, esto se traduce en acciones impredecibles o movimientos bruscos si el modelo se enfrenta a estados fuera de la distribución de entrenamiento. No hay garantías de seguridad.
- Limitaciones de contexto: el modelo solo está entrenado para la tarea de cerrar el refrigerador. No es un modelo generalista y no puede adaptarse a otras tareas sin reentrenamiento.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- Caveat para producción: la evaluación requiere un robot físico SO-100 y un entorno controlado. No se recomienda su uso en entornos no supervisados sin medidas de seguridad adicionales (por ejemplo, límites de fuerza o parada de emergencia). El dataset tiene 60k muestras, pero no se especifica el número de episodios ni la variabilidad de los mismos, lo que puede afectar a la generalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiroaiseoul/act_task09_close_refrigerator_60k
- Dataset asociado: https://huggingface.co/datasets/kiroaiseoul/task09_close_refrigerator
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

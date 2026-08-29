# KoukiHagiwara/act_slide_push_red_side80

## Resumen

El modelo `KoukiHagiwara/act_slide_push_red_side80` es una política robótica de imitación basada en Action Chunking with Transformers (ACT), desarrollada por KoukiHagiwara y publicada bajo licencia Apache 2.0. Está entrenada con el framework LeRobot de Hugging Face sobre el dataset `slide_push_pull_red_OneWay_80`, que contiene demostraciones teleoperadas de tareas de deslizamiento, empuje y arrastre de objetos rojos en un entorno robótico. El modelo predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación.

Con 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, es una política compacta y ligera, adecuada para despliegue en hardware de gama media. Su relevancia radica en ser un ejemplo práctico de entrenamiento y publicación de políticas robóticas mediante imitación, siguiendo el flujo de trabajo de LeRobot que permite reproducir, evaluar y compartir modelos de control. Está orientada a la comunidad de robótica e investigación, especialmente a quienes trabajan con brazos manipuladores tipo SO-100 o similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control motor, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que utiliza una arquitectura Transformer para predecir bloques de acciones futuras (action chunks) a partir de observaciones actuales y pasadas. A diferencia de los métodos que predicen un solo paso, ACT genera secuencias de varias decenas de acciones, lo que reduce la acumulación de errores y mejora la suavidad del control. El modelo se entrena mediante comportamiento clonado sobre datos teleoperados, sin necesidad de refuerzo ni ajuste fino con RLHF.

En este caso, el entrenamiento se realizó con el framework LeRobot sobre el dataset `KoukiHagiwara/slide_push_pull_red_OneWay_80`, que contiene demostraciones de manipulación de objetos rojos (deslizar, empujar, arrastrar) en un escenario de una sola dirección. No se dispone de información detallada sobre el número de tokens de entrenamiento, el tamaño exacto del dataset ni el proceso de aumento de datos. La arquitectura concreta (número de capas, heads, dimensión del modelo) no está publicada en la ficha, aunque el número total de parámetros sugiere un modelo de tamaño moderado, similar a los usados en el benchmark de LeRobot para el robot SO-100.

## Capacidades

- Control robótico por imitación: el modelo genera secuencias de acciones (posiciones articulares o comandos de velocidad) para ejecutar tareas de empuje, deslizamiento o arrastre de objetos.
- Predicción de chunks de acción: produce múltiples pasos de control por inferencia, lo que facilita movimientos suaves y coordinados.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- Especialización en una tarea concreta: entrenado específicamente para la tarea `slide_push_pull_red_OneWay`, no es un modelo generalista.
- Sin capacidades de lenguaje, visión o razonamiento simbólico: su entrada son observaciones del estado del robot y del entorno (imágenes o estados propios), no texto.

## Casos de uso

- Automatización de tareas repetitivas de manipulación: el modelo puede controlar un brazo robótico para empujar o deslizar piezas en una línea de montaje, reduciendo la intervención humana.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre entornos o para comparar métodos de predicción de chunks.
- Prototipado rápido de control robótico: gracias a su tamaño compacto, puede desplegarse en estaciones de trabajo con GPU modestas y validarse en pocas horas.
- Evaluación de pipelines de LeRobot: útil para verificar el flujo completo de entrenamiento, registro y evaluación con el framework de Hugging Face.
- Educación en robótica: permite a estudiantes experimentar con políticas de imitación en simuladores o robots de bajo coste como el SO-100.
- Benchmarking de hardware: al ser un modelo ligero, puede utilizarse para medir latencia y throughput en diferentes GPUs o dispositivos embebidos (Jetson, Raspberry Pi con acelerador).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de éxito en tareas, tasas de acierto ni comparaciones cuantitativas con otras políticas. La ficha del autor no incluye ninguna tabla de rendimiento.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~51M de parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32 (aproximadamente 200 MB de pesos). Con cuantización a 8 bits, bajaría a ~50 MB. No se especifican cuantizaciones oficiales, pero es viable en GPUs con 2 GB o menos.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA, desde una GTX 1050 Ti (4 GB) hasta una RTX 4090. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, cabe en prácticamente cualquier GPU de consumo actual.
- Opciones de despliegue: LeRobot ofrece scripts de evaluación e inferencia (`lerobot-record`). También puede integrarse en ROS o en controladores personalizados mediante la carga de los pesos safetensors.
- Latencia y throughput: no se han medido oficialmente. Dado el tamaño del modelo, se espera una inferencia en el rango de milisegundos en GPU moderna (por ejemplo, <5 ms en A100), pero depende del hardware y del número de chunks predichos.

## Comparativa con modelos similares

No se dispone de información pública sobre modelos comparables con el mismo dataset o tarea. En el ecosistema LeRobot existen otras políticas como Diffusion Policy o VQ-BeT, pero no hay datos oficiales de comparación con este modelo concreto. Se recomienda consultar los benchmarks de LeRobot para políticas de imitación (por ejemplo, en el repositorio de LeRobot) para obtener referencias generales.

## Limitaciones y advertencias

- Especialización estrecha: el modelo solo ha sido entrenado para una tarea concreta (`slide_push_pull_red_OneWay`); no generaliza a otras tareas u objetos de diferentes colores o posiciones.
- Dependencia de datos teleoperados: su rendimiento depende de la calidad y diversidad de las demostraciones del dataset; si el dataset es pequeño o sesgado, la política puede fallar en situaciones no vistas.
- Sin capacidad de razonamiento o adaptación: no puede planificar ni corregir errores en tiempo real; se limita a ejecutar la secuencia aprendida.
- Riesgo de sobreexploración en entornos dinámicos: al ser un modelo de imitación, puede colisionar con obstáculos no previstos en los datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías de funcionamiento en entornos de producción.
- Falta de documentación técnica: no se detallan hiperparámetros, arquitectura exacta ni métricas de éxito, lo que dificulta la reproducción o la comparación justa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KoukiHagiwara/act_slide_push_red_side80
- Dataset de entrenamiento: https://huggingface.co/datasets/KoukiHagiwara/slide_push_pull_red_OneWay_80
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (librería y documentación): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index

# alphabot2/19_Aug_Sanjeev_Pick_ACT

## Resumen

El modelo `alphabot2/19_Aug_Sanjeev_Pick_ACT` es una política de aprendizaje por imitación para robótica, basada en el método Action Chunking with Transformers (ACT), presentado en el artículo arXiv:2304.13705. ACT predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más estable y preciso en tareas de manipulación. Este modelo concreto ha sido entrenado sobre el dataset de teleoperación `alphabot2/19_Aug_Sanjeev_Pick` y publicado mediante la librería LeRobot de Hugging Face, que facilita el entrenamiento, evaluación y despliegue de políticas robóticas.

Con aproximadamente 51,6 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en robots de bajo coste, como el brazo SO-100. Su relevancia radica en que demuestra cómo un enfoque de transformadores con chunking de acciones puede lograr altas tasas de éxito en tareas de pick-and-place a partir de datos teleoperados, siendo una alternativa accesible y reproducible frente a métodos de aprendizaje por refuerzo más complejos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - Transformer con codificador y decodificador, con predicción de chunks de acciones |
| Parametros totales | 51.637.904 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende de la configuración de la tarea; típicamente ventanas de observación cortas en robótica) |
| Tipos de cuantizacion | no disponible (los pesos se almacenan en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de robótica, no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT se basa en un transformer que procesa observaciones (imágenes y estados del robot) y genera una secuencia de acciones futuras (chunk) de longitud fija. La arquitectura utiliza un codificador de visión (típicamente ResNet) para extraer características de las imágenes y un decodificador autoregresivo que predice las acciones. Una innovación clave es el uso de un módulo de estilo (style) que condiciona la generación de acciones, lo que mejora la robustez frente a variaciones en las demostraciones.

El entrenamiento se realiza mediante aprendizaje por imitación supervisado sobre demostraciones teleoperadas. En este caso, el dataset `alphabot2/19_Aug_Sanjeev_Pick` contiene episodios de la tarea de recoger un objeto (pick). No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO, ya que el modelo card no las detalla. El entrenamiento se ha llevado a cabo con la librería LeRobot, que gestiona el pipeline completo de datos, entrenamiento y evaluación.

## Capacidades

- Generación de acciones de control para robots manipuladores, específicamente tareas de pick-and-place.
- Predicción de chunks de acciones (varios pasos de control a la vez), lo que reduce la frecuencia de inferencia necesaria y mejora la suavidad del movimiento.
- Aprendizaje a partir de demostraciones teleoperadas sin necesidad de recompensas externas.
- Integración con el ecosistema LeRobot: permite cargar el modelo, evaluarlo y desplegarlo en robots reales como el SO-100.
- Soporte para inferencia en tiempo real gracias a su tamaño compacto (51M parámetros).
- No incluye capacidades de procesamiento de lenguaje natural, visión general ni tool calling; está especializado exclusivamente en control motor robótico.

## Casos de uso

- Automatización de tareas de recogida y colocación en líneas de montaje: el modelo puede controlar un brazo robótico para recoger piezas de una posición y depositarlas en otra, aprendiendo la tarea a partir de demostraciones humanas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del chunking de acciones en la estabilidad del control, comparando con políticas que predicen acciones paso a paso.
- Prototipado rápido de habilidades robóticas: un laboratorio puede teleoperar un robot para recoger objetos, entrenar el modelo con LeRobot y desplegarlo en el mismo robot en cuestión de horas, sin escribir controladores manuales.
- Benchmarking de algoritmos de imitación: al estar disponible en Hugging Face con licencia Apache 2.0, puede utilizarse como referencia para comparar nuevos métodos de aprendizaje por imitación en tareas de manipulación.
- Educación en robótica y IA: permite a estudiantes y desarrolladores experimentar con políticas neuronales en robots de bajo coste (SO-100, etc.) y entender los fundamentos de los transformers aplicados al control.
- Transferencia a tareas similares: aunque está entrenado para una tarea específica (pick), el checkpoint puede servir para fine-tuning en tareas relacionadas (por ejemplo, pick-and-place con diferentes objetos) mediante aprendizaje por imitación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas de éxito, tasas de acierto ni comparaciones con otros métodos. Para evaluar su rendimiento sería necesario ejecutar el pipeline de evaluación de LeRobot sobre el robot físico o en simulación, siguiendo las instrucciones de la documentación.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,6 millones de parámetros, la inferencia en precisión FP32 requiere aproximadamente 206 MB de VRAM (4 bytes por parámetro). Con cuantización a FP16 o int8, el requisito baja a ~103 MB o ~52 MB respectivamente. Cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, GTX 1050 Ti, RTX 2060, RTX 4090) o incluso CPU para inferencia en tiempo real si la latencia no es crítica.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja y media. Un robot con un ordenador equipado con una GPU de 4 GB puede ejecutar la política sin problemas.
- Opciones de despliegue: LeRobot ofrece scripts de evaluación e inferencia (`lerobot-record`), y el modelo puede cargarse con la librería `lerobot` en Python. También es posible exportarlo a otros formatos si se requiere (aunque no se documenta).
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño del modelo, se espera una inferencia en el orden de milisegundos en GPU moderna, suficiente para control en bucle cerrado a 10-30 Hz, pero estos valores deben validarse en el hardware objetivo.

## Comparativa con modelos similares

No se dispone de información pública sobre otros modelos del mismo autor o de la misma tarea con los que comparar directamente. Sin embargo, dentro del ecosistema LeRobot existen otras políticas entrenadas con ACT sobre diferentes datasets y robots. Una comparación genérica con la arquitectura ACT estándar (por ejemplo, la implementación de referencia de LeRobot) sería la siguiente:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| alphabot2/19_Aug_Sanjeev_Pick_ACT | 51,6 M | no disponible | Apache 2.0 | Hugging Face |
| ACT de referencia (LeRobot) | ~50-80 M (según configuración) | no disponible | Apache 2.0 | Hugging Face / GitHub |
| Diffusion Policy (alternativa) | variable (típicamente 50-100 M) | no disponible | MIT | Hugging Face / GitHub |

La comparación exacta en rendimiento no es posible sin benchmarks publicados. Se recomienda al usuario ejecutar evaluaciones propias para determinar la idoneidad del modelo en su tarea específica.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea concreta (pick de un objeto específico) y puede no generalizar a otros objetos, posiciones o condiciones de iluminación sin fine-tuning adicional.
- No hay información sobre la cantidad de demostraciones utilizadas en el entrenamiento, lo que impide evaluar la robustez del modelo frente a variaciones.
- Al ser un modelo de imitación, hereda los sesgos y limitaciones de las demostraciones teleoperadas (por ejemplo, trayectorias subóptimas o movimientos poco naturales).
- Riesgo de alucinación en el contexto robótico: el modelo puede generar acciones inconsistentes si recibe observaciones fuera de la distribución de entrenamiento, lo que podría provocar movimientos erráticos o inseguros. Es necesario implementar salvaguardas (límites de seguridad, parada de emergencia).
- No se proporcionan métricas de seguridad ni validación en entornos reales; el despliegue en robots físicos debe hacerse con supervisión y en entornos controlados.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de cumplir con las normativas de seguridad aplicables a sistemas robóticos.
- No hay soporte para idiomas ni procesamiento de lenguaje; el modelo no interpreta comandos verbales ni texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphabot2/19_Aug_Sanjeev_Pick_ACT
- Dataset asociado: https://huggingface.co/datasets/alphabot2/19_Aug_Sanjeev_Pick
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot

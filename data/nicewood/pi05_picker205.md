# Nicewood/pi05_picker205

## Resumen

El modelo `Nicewood/pi05_picker205` es una implementación de la política π₀.₅ (Pi05), un modelo de visión-lenguaje-acción (VLA) desarrollado originalmente por Physical Intelligence y adaptado al ecosistema LeRobot por el usuario Nicewood. Este modelo está diseñado para control robótico con generalización a entornos no vistos durante el entrenamiento, un paso más allá de los sistemas tradicionales que operan en entornos fijos. La versión publicada en HuggingFace está entrenada sobre el dataset `black-forest-labs/lerobot-picker-camfix`, orientado a tareas de picking (recogida de objetos) con cámara.

El modelo cuenta con 4.143.404.816 parámetros (aproximadamente 4,1 mil millones) y se distribuye en formato safetensors, con un tamaño de repositorio de 9,4 GB. Su licencia es Apache 2.0, lo que permite uso comercial y modificación. La relevancia actual radica en que π₀.₅ representa una de las aproximaciones más recientes a la robótica generalista, combinando comprensión visual, razonamiento lingüístico y generación de acciones motoras en un único modelo. Esta implementación concreta permite a la comunidad LeRobot entrenar y evaluar la política en hardware asequible como el robot SO-100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer (según la arquitectura π₀.₅ de Physical Intelligence) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a procesamiento de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de π₀.₅, según la documentación de Physical Intelligence, es un modelo de visión-lenguaje-acción que integra un codificador visual, un modelo de lenguaje y un decodificador de acciones motoras. El modelo procesa observaciones visuales (imágenes de cámara) y, opcionalmente, instrucciones en lenguaje natural, para generar comandos de actuación directos para el robot. La implementación de LeRobot adapta el código abierto del repositorio OpenPI de Physical Intelligence, manteniendo la esencia del modelo original.

El entrenamiento de esta versión concreta se realizó sobre el dataset `black-forest-labs/lerobot-picker-camfix`, que contiene demostraciones de tareas de picking con corrección de cámara. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el modelo fue entrenado y subido al Hub mediante LeRobot, pero no se especifican hiperparámetros ni configuración de entrenamiento. La innovación principal de π₀.₅ reside en su capacidad de generalización a entornos nuevos, lograda mediante una combinación de datos diversos y una arquitectura que separa la comprensión semántica de la generación de acciones.

## Capacidades

- Control robótico directo: genera acciones motoras (posiciones de articulaciones, velocidades, etc.) a partir de observaciones visuales, sin necesidad de módulos intermedios de planificación.
- Generalización a entornos no vistos: diseñado para operar en escenarios distintos a los del entrenamiento, gracias a la comprensión semántica de la escena.
- Integración con LeRobot: compatible con el framework de HuggingFace para entrenamiento, evaluación y despliegue en robots como SO-100, SO-101, etc.
- Procesamiento de instrucciones en lenguaje natural: aunque no se detalla en esta versión, la arquitectura π₀.₅ soporta comandos verbales para guiar la tarea.
- Visión por computador: interpreta imágenes de cámara para localizar objetos y comprender la geometría de la escena.
- Aprendizaje por imitación: el modelo se entrena mediante demostraciones, lo que permite adaptarlo a tareas específicas con datos relativamente escasos.

## Casos de uso

- Automatización de picking en almacenes: el modelo puede controlar un brazo robótico para recoger objetos de una cinta transportadora o de una bandeja, adaptándose a variaciones de posición, iluminación y tipo de objeto gracias a su generalización visual.
- Robótica educativa e investigación: al estar integrado en LeRobot y ser de código abierto, es adecuado para laboratorios universitarios que estudian aprendizaje por imitación y políticas VLA en hardware de bajo coste como el SO-100.
- Prototipado rápido de tareas de manipulación: los desarrolladores pueden entrenar una política específica con pocas demostraciones (por ejemplo, 50 episodios) y desplegarla en un robot real en cuestión de horas, gracias a la integración con `lerobot-train` y `lerobot-record`.
- Evaluación de generalización en robótica: investigadores pueden usar este modelo como punto de partida para medir la capacidad de un VLA de transferir habilidades entre entornos simulados y reales, o entre distintos robots.
- Asistencia en líneas de montaje flexibles: en entornos de fabricación donde los productos cambian con frecuencia, el modelo puede reconfigurarse con nuevos datos de demostración sin necesidad de reprogramación manual.
- Benchmarking de políticas VLA: la comunidad puede comparar este modelo con otras implementaciones de π₀.₅ o con modelos como OpenVLA en tareas estandarizadas de LeRobot, usando los scripts de evaluación proporcionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito en tareas robóticas, ni comparaciones con otros modelos. El autor no ha proporcionado datos de rendimiento en términos de precisión de picking, tasa de éxito o latencia de inferencia. Se recomienda a los usuarios evaluar el modelo en sus propios entornos utilizando las herramientas de LeRobot.

## Requisitos de hardware

- VRAM estimada: con 4.143 millones de parámetros en precisión FP32, el modelo requiere aproximadamente 16,6 GB de VRAM solo para los pesos. Con cuantización a FP16 o BF16, se reduce a unos 8,3 GB. Para inferencia en tiempo real con imágenes, se recomienda al menos 12 GB de VRAM.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) son adecuadas para entrenamiento y evaluación. Para inferencia en robot, una RTX 3080/3090 (10-24 GB) puede ser suficiente si se usa FP16.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de gama alta como RTX 3090/4090, pero no en tarjetas de 8 GB o menos.
- Opciones de despliegue: al ser un modelo LeRobot, se puede ejecutar con los scripts de inferencia de LeRobot (`lerobot-record`). También es posible exportar a otros formatos (ONNX, TensorRT) para optimización, aunque no se proporcionan instrucciones específicas.
- Latencia y throughput: no disponible. Depende del hardware y de la resolución de imagen. En una RTX 4090, se espera una latencia de decenas de milisegundos por paso de control, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa. Los modelos comparables en la categoría de VLA para robótica incluyen:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| π₀.₅ (este) | 4,1B | no disponible | Apache 2.0 | HuggingFace |
| OpenVLA | 7B | no disponible | Apache 2.0 | HuggingFace |
| RT-2 (Google) | 55B | no disponible | Propietaria | no público |

Sin datos de benchmarks ni especificaciones detalladas de los competidores, no es posible establecer una comparación rigurosa. Se recomienda consultar la documentación de cada modelo para más información.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con demostraciones humanas, puede heredar sesgos en la forma de manipular objetos (por ejemplo, preferencia por ciertos agarres o trayectorias).
- Riesgo de alucinación: en tareas de robótica, el modelo puede generar acciones incorrectas si la escena visual es ambigua o si el objeto no está claramente visible. No hay mecanismo de verificación de la acción.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al ser un modelo de acción, el contexto relevante es la imagen actual y posiblemente un historial corto de observaciones. No está diseñado para razonamiento de largo plazo.
- Limitaciones de idioma: no se indica soporte multilingüe; las instrucciones en lenguaje natural probablemente funcionan mejor en inglés, aunque no está confirmado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías. El usuario es responsable de cumplir con las leyes de seguridad en robótica.
- Caveat para producción: el modelo no incluye mecanismos de seguridad (por ejemplo, detección de colisiones o límites de parada). En entornos reales, debe integrarse con un controlador de seguridad externo.
- Dependencia del dataset: el entrenamiento se realizó sobre un dataset específico de picking con cámara; el rendimiento en otras tareas (por ejemplo, ensamblaje o navegación) no está garantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nicewood/pi05_picker205
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/black-forest-labs/lerobot-picker-camfix

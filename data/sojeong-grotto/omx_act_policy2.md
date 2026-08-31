# sojeong-grotto/omx_act_policy2

## Resumen

El modelo `sojeong-grotto/omx_act_policy2` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de un único paso. Ha sido desarrollado por el usuario sojeong-grotto y entrenado con la librería LeRobot de Hugging Face, utilizando el dataset `sojeong-grotto/record-test`. Este modelo está pensado para ser desplegado en robots manipuladores, como el brazo SO-100, y se distribuye bajo licencia Apache 2.0.

Con 51.668.614 parámetros, es un modelo relativamente compacto (0.2 GB en el repositorio), lo que lo hace adecuado para ejecutarse en hardware de gama media. La arquitectura ACT, propuesta en el paper arXiv:2304.13705, ha demostrado altas tasas de éxito en tareas de manipulación robótica mediante imitación. Su relevancia radica en que ofrece una vía práctica para transferir habilidades demostradas por teleoperación a un robot físico, con un coste computacional bajo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer encoder-decoder |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors con pesos completos) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura de transformer encoder-decoder diseñada para aprendizaje por imitación en robótica. En lugar de predecir una única acción por paso de tiempo, el modelo genera un chunk de acciones futuras (típicamente de 10 a 100 pasos), lo que reduce la propagación de errores durante la ejecución. El entrenamiento se realiza con demostraciones teleoperadas, y el modelo aprende a mapear observaciones (imágenes, estados del robot) a secuencias de acciones. En este caso, el modelo fue entrenado con la librería LeRobot, que proporciona herramientas para el registro de datos, entrenamiento y evaluación. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de refinamiento como RLHF o DPO. El dataset utilizado, `sojeong-grotto/record-test`, sugiere que se trata de un conjunto de demostraciones de prueba, probablemente de tamaño reducido.

## Capacidades

- Control de robots manipuladores: genera comandos de acción para brazos robóticos, como el SO-100, a partir de observaciones sensoriales.
- Aprendizaje por imitación: reproduce comportamientos demostrados por teleoperación, incluyendo tareas de agarre, apilado o ensamblaje.
- Predicción de secuencias de acciones: produce chunks de acciones que permiten una ejecución más suave y robusta que la predicción paso a paso.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No incluye capacidades de lenguaje natural, visión generalista, tool calling ni razonamiento simbólico; su ámbito es exclusivamente el control motor robótico.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo robótico para realizar tareas de pick-and-place, apilado de objetos o inserción de piezas, aprendidas a partir de demostraciones humanas.
- Automatización de procesos repetitivos: en entornos industriales o de investigación, puede sustituir la programación manual de trayectorias por aprendizaje demostrativo, reduciendo el tiempo de configuración.
- Teleoperación asistida: el modelo puede predecir y ejecutar acciones en tiempo real a partir de observaciones del robot, facilitando la operación remota con corrección humana.
- Desarrollo de políticas de control para robots SO-100 y similares: al ser un modelo pequeño, es ideal para experimentar con el pipeline de LeRobot en hardware asequible.
- Investigación en aprendizaje por imitación: sirve como punto de partida para comparar variantes de ACT, probar nuevos datasets o estudiar el efecto del tamaño del chunk en el rendimiento.
- Prototipado rápido de habilidades robóticas: permite validar una tarea nueva en pocas horas, registrando demostraciones y entrenando una política sin necesidad de diseñar controladores analíticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de éxito en tareas específicas, métricas de precisión ni comparaciones con otros modelos en la documentación pública del repositorio.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~52M parámetros, la inferencia en precisión FP32 requiere aproximadamente 200 MB de VRAM; en FP16 se reduce a ~100 MB. Un solo modelo cabe en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM es suficiente para entrenamiento e inferencia. Ejemplos: RTX 3060, RTX 4060, A100 (para entrenamiento más rápido), o incluso una Jetson Orin Nano para despliegue en el robot.
- Compatibilidad con consumer GPU: sí, es totalmente viable en GPUs de consumo, incluso en modelos integrados.
- Opciones de despliegue: LeRobot ofrece integración con PyTorch; se puede ejecutar mediante scripts de Python, o exportar a ONNX si se requiere. También es compatible con la API de LeRobot para evaluación en robots reales.
- Latencia y throughput: no se dispone de datos publicados. Dado el tamaño, se espera una inferencia en el orden de milisegundos en GPU moderna, pero no se puede cuantificar sin pruebas específicas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT) con datos públicos de rendimiento. La arquitectura ACT es común en el ecosistema LeRobot, pero no hay métricas estandarizadas para comparar entre modelos entrenados en distintos datasets. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado para una tarea o conjunto de tareas específicas a partir del dataset `record-test`; no es generalizable a tareas fuera de ese dominio sin reentrenamiento.
- Dependencia de la calidad de las demostraciones: el rendimiento depende directamente de la calidad y cobertura de las teleoperaciones registradas; demostraciones inconsistentes producen políticas poco robustas.
- Sin capacidades de lenguaje o visión semántica: no puede interpretar instrucciones verbales ni entender escenas complejas; solo procesa observaciones de bajo nivel (imágenes, estados articulares).
- Riesgo de alucinación de acciones: como todo modelo generativo, puede producir comandos de acción que no corresponden a la realidad física si las observaciones se desvían del dominio de entrenamiento.
- Sin datos de sesgos: no se han documentado sesgos potenciales, pero al ser un modelo robótico, su comportamiento está acotado al entorno físico y no presenta sesgos sociales o lingüísticos.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial, pero se recomienda verificar que el dataset de entrenamiento no tenga restricciones adicionales.
- Ausencia de mantenimiento: el repositorio no muestra actividad posterior a la fecha de creación, por lo que puede carecer de soporte o actualizaciones.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/sojeong-grotto/omx_act_policy2)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Perfil de GitHub del autor](https://github.com/sojeong-grotto)

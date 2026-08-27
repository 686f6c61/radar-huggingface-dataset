# jaheroth/act_pusht_novae

## Resumen

El modelo `jaheroth/act_pusht_novae` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con la librería LeRobot sobre el dataset `lerobot/pusht`. ACT es un algoritmo de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. Este modelo concreto ha sido entrenado por el usuario jaheroth y publicado en HuggingFace con licencia Apache-2.0, ocupando aproximadamente 0,1 GB en disco.

Con 34,2 millones de parámetros, es un modelo ligero diseñado específicamente para la tarea PushT, que consiste en empujar una pieza con forma de T hasta una posición objetivo. Su relevancia radica en ser un ejemplo práctico de cómo LeRobot permite entrenar y compartir políticas robóticas de forma reproducible, facilitando la experimentación en entornos simulados y reales. No se trata de un modelo de lenguaje ni de visión general, sino de un componente de control para sistemas robóticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con codificador CVAE |
| Parametros totales | 34.239.060 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa observaciones de imagen y estado, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors de precisión completa) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un transformer con un autoencoder variacional condicional (CVAE) para modelar la distribución de acciones futuras. El modelo recibe observaciones (imágenes y estados del robot) y genera un chunk de acciones que el robot ejecuta de forma secuencial. Esta arquitectura reduce la acumulación de errores frente a políticas que predicen un solo paso, y permite aprender comportamientos complejos a partir de demostraciones teleoperadas.

El entrenamiento se realizó con la librería LeRobot sobre el dataset `lerobot/pusht`, que contiene demostraciones de la tarea PushT en un entorno simulado. No se dispone de información detallada sobre el número de épocas, el tamaño del lote ni la composición exacta del dataset en la documentación publicada. Tampoco se especifica si se aplicaron técnicas de refinamiento adicionales como RLHF o DPO, que por otro lado no son habituales en políticas robóticas de este tipo.

## Capacidades

- Control robótico por aprendizaje por imitación: predice secuencias de acciones (chunks) para ejecutar tareas de manipulación.
- Especializado en la tarea PushT: empujar un objeto con forma de T hasta una posición objetivo en un entorno simulado.
- Integración con LeRobot: compatible con el flujo de entrenamiento, evaluación e inferencia de LeRobot, incluyendo robots reales como el SO-100.
- Procesamiento de observaciones multimodales: combina imágenes y estados del robot (posición, velocidad, etc.) para generar acciones.
- Bajo coste computacional: con solo 34 millones de parámetros, es adecuado para inferencia en tiempo real en hardware modesto.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el comportamiento de ACT en tareas de empuje y comparar variantes del algoritmo.
- Desarrollo de políticas robóticas en simulación: permite validar algoritmos de control en el entorno PushT antes de transferirlos a robots físicos.
- Benchmarking de métodos de control: puede utilizarse como referencia para evaluar nuevas arquitecturas o técnicas de regularización en tareas de manipulación.
- Educación en robótica: un ejemplo accesible y reproducible para enseñar conceptos de aprendizaje por imitación y uso de LeRobot.
- Prototipado rápido de sistemas de control: al ser ligero, puede desplegarse en ordenadores de bajo coste para pruebas de concepto en laboratorios.
- Transferencia a tareas similares: aunque está entrenado para PushT, la arquitectura ACT puede adaptarse a otras tareas de empuje o apilamiento con reentrenamiento sobre nuevos datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, precisión ni comparaciones con otros modelos. Para obtener datos de rendimiento sería necesario ejecutar la evaluación en el entorno PushT siguiendo las instrucciones de LeRobot.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en inferencia con precisión completa, dado el reducido número de parámetros (34,2 M).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también puede ejecutarse en CPU para inferencia no en tiempo real.
- Compatibilidad con GPU de consumo: sí, funciona en tarjetas como GTX 1060, RTX 2060, RTX 3060 o superiores.
- Opciones de despliegue: LeRobot (entrenamiento e inferencia), exportación a otros formatos si se requiere, aunque no se documentan conversiones a GGUF u otros.
- Latencia y throughput: no disponibles, pero por el tamaño del modelo se espera una latencia de milisegundos en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| jaheroth/act_pusht_novae | 34,2 M | PushT | Apache-2.0 | HuggingFace |
| MonishBalu/act_pusht_model | no disponible | PushT | no disponible | HuggingFace |
| arclabmit/pusht_act_model | no disponible | PushT | no disponible | HuggingFace |

Los tres modelos comparten la misma arquitectura ACT y el mismo dataset de entrenamiento, por lo que sus capacidades son equivalentes en principio. No se dispone de datos de rendimiento comparativos entre ellos. La principal diferencia es la autoría y la fecha de publicación, sin que se documenten variaciones en la configuración de entrenamiento.

## Limitaciones y advertencias

- Entrenado exclusivamente en el entorno simulado PushT: puede no generalizar a otros entornos, objetos o configuraciones de robot sin reentrenamiento.
- Sin capacidades de lenguaje o razonamiento: no es un modelo multimodal general, solo genera acciones de control.
- Riesgo de sobreajuste al dataset de demostraciones: el rendimiento fuera de la distribución de datos de entrenamiento no está garantizado.
- No se documentan sesgos específicos, pero al ser un modelo de imitación, hereda los sesgos de las demostraciones utilizadas (por ejemplo, variabilidad limitada en las trayectorias).
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del dataset `lerobot/pusht` para cualquier aplicación comercial.
- No se proporcionan métricas de robustez ante perturbaciones o fallos de sensores, por lo que su uso en producción requiere validación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaheroth/act_pusht_novae
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot

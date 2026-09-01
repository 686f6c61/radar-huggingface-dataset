# Greynar/act_ClickTargetPreprocessTestThreeCamera

## Resumen

El modelo `Greynar/act_ClickTargetPreprocessTestThreeCamera` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido entrenado y publicado mediante la librería LeRobot de Hugging Face, y está diseñado para controlar un robot manipulador a partir de datos teleoperados, en este caso con un preprocesado específico de tres cámaras para una tarea de clic en un objetivo.

El modelo cuenta con 51.668.614 parámetros y se distribuye bajo licencia Apache-2.0, lo que permite su uso comercial y modificación sin restricciones significativas. Su relevancia radica en que ACT es uno de los métodos de imitación más utilizados en robótica de manipulación, con altas tasas de éxito en tareas de precisión, y este repositorio ofrece un ejemplo práctico de entrenamiento y despliegue con LeRobot. No se dispone de información sobre la longitud de contexto, cuantizaciones o idiomas soportados, ya que la model card no los especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision-accion, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers que aprende a generar secuencias de acciones de longitud fija (chunks) a partir de observaciones visuales y del estado del robot. A diferencia de los métodos que predicen una sola acción por paso, ACT predice un bloque de acciones futuras, lo que reduce la acumulación de errores y mejora la estabilidad del control. El entrenamiento se realiza mediante aprendizaje por imitación con datos teleoperados, y el modelo se ha entrenado con la librería LeRobot, que gestiona el dataset, el entrenamiento y la evaluación.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de refinamiento como RLHF o DPO. El dataset asociado es `Greynar/ClickTargetPreprocessTestThreeCamera`, que sugiere un preprocesado con tres cámaras para una tarea de clic en un objetivo, pero no se publican más detalles en la model card.

## Capacidades

- Control de robot manipulador mediante aprendizaje por imitación, generando secuencias de acciones (chunks) para tareas de precisión.
- Procesamiento de observaciones visuales de tres cámaras, lo que permite al modelo integrar información de múltiples vistas para localizar y alcanzar objetivos.
- Ejecución de tareas de clic o pulsación sobre un objetivo, probablemente en un entorno de robótica de escritorio (tipo SO-100).
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante comandos CLI estándar.
- No se especifican capacidades de tool calling, agentes, razonamiento simbólico ni procesamiento de lenguaje natural, ya que es un modelo puramente de visión-accion.

## Casos de uso

- Automatización de tareas de precisión en laboratorio: el modelo puede controlar un brazo robótico para pulsar botones o clicar en objetivos visuales, útil en entornos de investigación y pruebas automatizadas.
- Benchmarking de algoritmos de imitación: al estar publicado con LeRobot, sirve como punto de partida para comparar ACT con otras políticas (diffusion policies, etc.) en tareas de manipulación.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede aprender de demostraciones humanas y reproducir comportamientos de clic, reduciendo la carga del operador en tareas repetitivas.
- Educación en robótica: permite a estudiantes e investigadores experimentar con entrenamiento de políticas de imitación sin necesidad de implementar desde cero, usando el flujo de trabajo de LeRobot.
- Prototipado rápido de controladores para robots SO-100: el modelo puede desplegarse en hardware de bajo coste para validar tareas de interacción física.
- Investigación en aprendizaje multimodal: el uso de tres cámaras ofrece un caso de estudio sobre fusión de múltiples vistas en políticas de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparaciones con otros modelos. Se recomienda consultar el paper original de ACT (arxiv:2304.13705) para referencias generales de rendimiento del método, pero no hay datos específicos de este modelo entrenado.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 51,7 millones de parámetros, una cuantización FP32 ocuparía aproximadamente 207 MB, y FP16 unos 103 MB, por lo que cabría en cualquier GPU moderna con más de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA (por ejemplo, RTX 3060 o superior) es suficiente para inferencia; el entrenamiento requeriría al menos 8-12 GB de VRAM dependiendo del batch size y resolución de imagen.
- Compatibilidad con GPU de consumo: sí, el modelo es lo suficientemente pequeño para ejecutarse en GPUs de gama media e incluso en CPU para inferencia puntual.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación e inferencia; también puede exportarse a formatos como ONNX o TensorRT, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles. Dependerán del hardware y del tamaño de los chunks de acción.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para esta tarea. ACT es un método conocido, pero este repositorio concreto no ofrece comparaciones con otras políticas entrenadas en el mismo dataset. Se puede mencionar que existen otras políticas de imitación en LeRobot (como Diffusion Policy o VQ-BeT), pero no hay datos de rendimiento relativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al ser un modelo entrenado con datos teleoperados, puede heredar sesgos del operador humano (por ejemplo, preferencias de trayectoria o velocidad).
- Riesgo de alucinacion: no aplica en el sentido de generación de texto, pero el modelo puede producir acciones incorrectas si las observaciones difieren del dominio de entrenamiento (cambio de iluminación, posición de cámara, etc.).
- Limitaciones de contexto: al ser un modelo de visión-accion, no maneja lenguaje natural ni contextos conversacionales; su ventana de contexto se limita a las observaciones actuales y el historial de estados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y se indiquen cambios.
- Caveat para producción: el modelo está entrenado para una tarea específica (clic en objetivo con tres cámaras) y puede no generalizar a otras tareas o configuraciones de robot sin reentrenamiento. Se recomienda validar en el hardware objetivo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Greynar/act_ClickTargetPreprocessTestThreeCamera
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset asociado: https://huggingface.co/datasets/Greynar/ClickTargetPreprocessTestThreeCamera

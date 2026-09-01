# Greynar/act_ClickTargetPreprocessTestThreeCamera_2

## Resumen

El modelo `Greynar/act_ClickTargetPreprocessTestThreeCamera_2` es una política de aprendizaje por imitación basada en la arquitectura Action Chunking with Transformers (ACT), desarrollada por el autor Greynar y publicada en Hugging Face bajo la librería LeRobot. ACT es un método que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación robótica teleoperada. Este modelo concreto ha sido entrenado sobre un dataset propio llamado `ClickTargetPreprocessTestThreeCamera`, que sugiere el uso de tres cámaras para la percepción visual, aunque no se proporcionan detalles adicionales sobre el dataset.

Con 51,67 millones de parámetros, es un modelo relativamente compacto, adecuado para entornos de investigación y prototipado. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas. La relevancia actual radica en que ACT es una de las arquitecturas de referencia en robótica de imitación, y este modelo ofrece un ejemplo práctico de entrenamiento y despliegue mediante LeRobot, con soporte para evaluación en robots reales como el SO-100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers diseñada para aprendizaje por imitación en robótica. En lugar de predecir una única acción por paso de tiempo, el modelo genera un chunk de acciones futuras, lo que reduce la acumulación de errores y mejora la consistencia del movimiento. El entrenamiento se realiza típicamente con datos teleoperados, y en este caso se ha utilizado el framework LeRobot para el pipeline completo. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El dataset asociado, `ClickTargetPreprocessTestThreeCamera`, sugiere la integración de tres cámaras para la percepción, pero no se especifican detalles de preprocesamiento ni de aumentación.

## Capacidades

- Control de robots manipuladores mediante aprendizaje por imitación, prediciendo secuencias de acciones (chunks) para tareas teleoperadas.
- Percepción visual multicámara (tres cámaras según el nombre del dataset), aunque no se detalla el tipo de entrada (imágenes, coordenadas, etc.).
- Integración con el ecosistema LeRobot, permitiendo entrenamiento, evaluación y despliegue en robots como el SO-100.
- Compatible con inferencia en tiempo real para control de bajo nivel, dado su tamaño compacto.
- No se han documentado capacidades de tool calling, agentes, razonamiento simbólico ni procesamiento de lenguaje natural.

## Casos de uso

- Tareas de pick-and-place en entornos controlados: el modelo puede aprender a mover un brazo robótico para recoger y colocar objetos, gracias a su capacidad de predecir chunks de acciones que mantienen la fluidez del movimiento.
- Manipulación con precisión guiada por visión: al usar tres cámaras, puede integrarse en sistemas donde se requiere localización espacial del objetivo, aunque no se confirma si las cámaras proporcionan imágenes o coordenadas preprocesadas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del chunking en la estabilidad de políticas robóticas, comparando con métodos de predicción paso a paso.
- Prototipado de sistemas de teleoperación: permite validar rápidamente un pipeline de entrenamiento con LeRobot, desde la recolección de datos hasta la evaluación en simulación o hardware real.
- Educación en robótica y IA: por su tamaño reducido y licencia permisiva, es adecuado para cursos y talleres donde se necesite un modelo de imitación funcional sin grandes requisitos de cómputo.
- Benchmarking de arquitecturas de control: puede utilizarse como baseline en experimentos que comparen ACT con otras políticas (diffusion policies, etc.) en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que el modelo no está orientado a tareas de lenguaje o razonamiento general. Tampoco se reportan tasas de éxito en tareas robóticas específicas.

## Requisitos de hardware

- VRAM estimada: con 51,67 millones de parámetros, el modelo es ligero. En precisión FP32, el peso ocupa aproximadamente 207 MB (51,67M × 4 bytes), por lo que cabría en cualquier GPU con al menos 1 GB de VRAM. Con cuantización a FP16 o int8, el requisito sería aún menor.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, desde una NVIDIA GTX 1650 (4 GB) hasta una RTX 4090. También puede ejecutarse en CPU para inferencia, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: sí, es totalmente viable en tarjetas de gama media y baja.
- Opciones de despliegue: LeRobot ofrece integración con PyTorch, y el modelo puede servirse mediante frameworks como vLLM o TGI, aunque al ser un modelo de robótica, el despliegue típico es a través del propio LeRobot en un entorno de control en tiempo real. También es posible exportar a ONNX o TensorRT para optimización.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño, se espera una inferencia en el orden de milisegundos en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos dentro del mismo repositorio o ecosistema. Existen otras políticas de imitación como Diffusion Policy o ACT con diferentes configuraciones, pero no se han encontrado datos públicos de este modelo concreto frente a alternativas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo ha sido entrenado sobre un dataset específico (`ClickTargetPreprocessTestThreeCamera`) y su generalización a otras tareas o entornos no está garantizada.
- No se especifican detalles sobre el preprocesamiento de las cámaras, por lo que la reproducibilidad exacta puede ser difícil.
- Al ser un modelo de imitación, su rendimiento depende críticamente de la calidad y diversidad de los datos de teleoperación; puede fallar ante variaciones no vistas.
- No se han documentado sesgos específicos, pero al ser un modelo de robótica, los sesgos podrían manifestarse en comportamientos no deseados si los datos de entrenamiento contienen movimientos erráticos o incompletos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el funcionamiento en producción.
- No se proporcionan instrucciones detalladas de despliegue más allá de los comandos genéricos de LeRobot, por lo que se requiere conocimiento previo del framework.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Greynar/act_ClickTargetPreprocessTestThreeCamera_2
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot

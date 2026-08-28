# Nourelh/smolvla_so101_real_v1

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para tareas de robótica con requisitos computacionales reducidos, lo que permite su despliegue en hardware de consumo. Este modelo concreto, `Nourelh/smolvla_so101_real_v1`, es un ajuste fino del modelo base `lerobot/smolvla_base` (publicado en el paper arXiv:2506.01844) entrenado con el framework LeRobot para controlar un brazo robótico SO-101 en tareas de pick-and-place (recoger y colocar objetos). El modelo tiene aproximadamente 450 millones de parámetros y se distribuye bajo licencia Apache-2.0, lo que facilita su uso tanto en investigación como en aplicaciones comerciales. Su relevancia radica en ofrecer una alternativa accesible a los VLA de gran escala, permitiendo a desarrolladores e investigadores experimentar con políticas robóticas en entornos reales sin necesidad de infraestructura de alto coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y una cabeza de acción para generar comandos motores a partir de observaciones visuales y instrucciones en lenguaje natural. El modelo base `lerobot/smolvla_base` fue preentrenado con un enfoque de eficiencia computacional, y este ajuste fino se realizó sobre el dataset `Nourelh/so101_pick_place_real_v2`, que contiene demostraciones reales de pick-and-place con el robot SO-101. El entrenamiento se llevó a cabo utilizando el framework LeRobot, que facilita el registro de datos, el entrenamiento y la evaluación de políticas robóticas. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO; la model card solo indica el uso de LeRobot y el dataset mencionado.

## Capacidades

- Control de un brazo robótico SO-101 para tareas de pick-and-place (recoger y colocar objetos) en entornos reales.
- Integración con el ecosistema LeRobot, permitiendo entrenamiento, evaluación e inferencia mediante comandos CLI (`lerobot-train`, `lerobot-record`).
- Procesamiento de observaciones visuales y generación de acciones motoras de forma directa, sin necesidad de módulos separados de percepción y planificación.
- Al ser un modelo compacto (450M parámetros), es adecuado para despliegue en hardware de consumo, aunque no se especifican requisitos exactos.
- Capacidad de ejecutar inferencia en tiempo real para control de robots, como se demuestra en los repositorios de la comunidad que utilizan este modelo.

## Casos de uso

- Automatización de tareas de manipulación en laboratorios: el modelo puede controlar un brazo SO-101 para recoger y colocar viales o muestras en racks, reduciendo la intervención manual en entornos de investigación.
- Prototipado rápido de políticas robóticas: gracias a su integración con LeRobot, los desarrolladores pueden entrenar y evaluar nuevas tareas de pick-and-place con pocos datos y en hardware asequible.
- Educación y formación en robótica: al ser un modelo de tamaño reducido y licencia permisiva, puede utilizarse en cursos universitarios para enseñar aprendizaje por imitación y control de robots.
- Investigación en VLA eficientes: sirve como punto de partida para estudiar la transferencia de modelos de lenguaje-visión a acciones robóticas con recursos limitados.
- Despliegue en entornos de producción con restricciones de coste: su bajo requisito computacional permite ejecutarlo en GPUs de gama media, facilitando su integración en líneas de montaje o almacenes.
- Evaluación de sim-to-real: el modelo puede utilizarse para validar políticas entrenadas en simulación (como las descritas en el tutorial de NVIDIA Isaac) y transferirlas al robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento como tasas de éxito en tareas de pick-and-place, ni comparaciones con otros modelos. Se recomienda consultar el paper de SmolVLA (arXiv:2506.01844) para conocer el rendimiento del modelo base, aunque los resultados específicos de este ajuste fino no están documentados.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPUs recomendadas en la información proporcionada.
- Dado que el modelo tiene 450M parámetros y se distribuye en formato safetensors, es probable que quepa en GPUs de consumo con al menos 8 GB de VRAM, pero esta cifra es una estimación no confirmada.
- El framework LeRobot soporta inferencia en GPU (CUDA) y también en CPU, aunque con menor rendimiento.
- Para despliegue en tiempo real, se recomienda una GPU NVIDIA moderna (por ejemplo, RTX 30xx o superior), pero no hay datos oficiales.
- Opciones de despliegue: LeRobot ofrece scripts de entrenamiento e inferencia; también se pueden usar herramientas como vLLM u Ollama si se convierte el modelo a GGUF, aunque no se ha documentado esa conversión para este modelo.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo es un ajuste fino de `lerobot/smolvla_base`, por lo que su rendimiento debería ser similar al del modelo base en tareas de robótica, pero no hay métricas publicadas para esta variante específica. Otros VLA como OpenVLA o RT-2 son significativamente más grandes (miles de millones de parámetros) y no son directamente comparables en términos de eficiencia. Se recomienda consultar el paper de SmolVLA para una comparativa con otros modelos de la misma categoría.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para tareas de pick-and-place con el robot SO-101; su generalización a otros robots o tareas no está garantizada.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de demostración, puede heredar sesgos del proceso de recogida de datos (por ejemplo, variaciones en iluminación o posiciones de objetos).
- Riesgo de alucinación en la generación de acciones si las observaciones visuales difieren significativamente de los datos de entrenamiento.
- No se especifica la longitud de contexto ni los idiomas soportados; se asume que el modelo procesa instrucciones en inglés, pero no está confirmado.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el dataset de entrenamiento (`so101_pick_place_real_v2`) no tenga restricciones adicionales.
- Para uso en producción, es necesario validar la robustez del modelo ante variaciones del entorno y considerar mecanismos de seguridad en el control del robot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nourelh/smolvla_so101_real_v1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/Nourelh/so101_pick_place_real_v2
- Repositorio de la comunidad (multitask): https://github.com/ktkchh/smolvla-so101-multitask-long-horizon
- Tutorial de NVIDIA Isaac para SO-101: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
- Repositorio de despliegue real (JereoZero): https://github.com/JereoZero/so101-real

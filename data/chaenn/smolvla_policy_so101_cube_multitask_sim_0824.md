# Chaenn/smolvla_policy_so101_cube_multitask_sim_0824

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, que combina un codificador de visión con un modelo de lenguaje para generar acciones de control de robots. Este checkpoint concreto, `Chaenn/smolvla_policy_so101_cube_multitask_sim_0824`, es un fine-tuning de `lerobot/smolvla_base` entrenado sobre el dataset de simulación `Chaenn/so101_cube_sim_place_0824`, que consiste en tareas de pick-and-place de un cubo con el brazo robótico SO-101. El modelo tiene 450 millones de parámetros y está diseñado para ser desplegado en hardware de consumo, lo que lo hace relevante para la robótica de bajo coste y la investigación en aprendizaje por imitación. La licencia Apache-2.0 permite uso comercial y modificación sin restricciones adicionales.

Este checkpoint ha sido creado por el usuario Chaenn y publicado en Hugging Face usando la librería LeRobot. Su propósito es servir como política de control para el brazo SO-101 en entornos simulados, aunque el mismo autor ha publicado variantes entrenadas con datos reales. La arquitectura se basa en el modelo SmolVLA descrito en el artículo arXiv 2506.01844, que combina un codificador de visión (ViT) con un modelo de lenguaje (SmolLM) para generar acciones directamente desde observaciones de imágenes y estados del robot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) basada en transformador con codificador de visión y modelo de lenguaje |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de acción, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SmolVLA, descrita en el paper "SmolVLA: A compact and efficient vision-language-action model" (arXiv:2506.01844). SmolVLA utiliza un codificador de visión (ViT) que procesa imágenes de alta resolución y un modelo de lenguaje (SmolLM) que integra las características visuales con las instrucciones de la tarea y genera acciones de control continuo. El modelo está diseñado para ser eficiente en términos de memoria y computación, permitiendo su despliegue en hardware de consumo como GPUs de gama media.

El entrenamiento se realizó mediante fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `Chaenn/so101_cube_sim_place_0824`, que contiene demostraciones de colocación de un cubo en un entorno simulado con el brazo robótico SO-101. El proceso se llevó a cabo con la librería LeRobot, que facilita el entrenamiento de políticas de imitación. No se han proporcionado detalles sobre el número exacto de pasos de entrenamiento, el tamaño del dataset o si se aplicó RLHF/DPO; solo se sabe que es un fine-tuning supervisado sobre datos de demostración.

## Capacidades

- Control de un brazo robótico SO-101 para tareas de pick-and-place en simulación.
- Procesamiento de imágenes de una cámara para detectar el cubo y el recipiente de destino.
- Generación de acciones de posición y orientación del efector final en cada paso de tiempo.
- Soporte para tareas multitarea dentro del mismo dataset (aunque la tarea principal es la colocación de cubo).
- No tiene capacidades de tool calling, agentes o razonamiento simbólico; es exclusivamente un controlador de acciones.

## Casos de uso

- **Automatización de tareas de manipulación en laboratorios de investigación**: el modelo puede controlar un brazo robótico en simulación para recoger y colocar objetos, útil para validar algoritmos de aprendizaje por imitación antes de transferirlos a hardware real.
- **Entrenamiento y evaluación de políticas de robótica**: como parte del ecosistema LeRobot, permite comparar diferentes arquitecturas de políticas (ACT, Diffusion Policy, VQ-BeT, etc.) en una tarea estandarizada.
- **Desarrollo de sistemas de control para brazos de bajo coste**: el SO-101 es un brazo robótico económico y este modelo puede ejecutarse en GPUs consumer, facilitando prototipado rápido en laboratorios con presupuesto limitado.
- **Simulación de entornos de pick-and-place para pruebas de robustez**: el modelo puede ser usado en entornos de simulación para probar algoritmos de planificación de trayectorias o control en presencia de variaciones en la posición del cubo.
- **Fine-tuning para nuevas tareas**: dado que el modelo está preentrenado en un dataset de colocación, puede ser fine-tuned con pocas demostraciones para adaptarse a objetos o configuraciones diferentes.
- **Benchmarking de modelos VLA en robótica**: sirve como referencia para comparar el rendimiento de SmolVLA con otros modelos de política en términos de precisión, velocidad de inferencia y requisitos de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta métricas de rendimiento en la model card ni en los repositorios asociados. Se recomienda consultar el paper de SmolVLA (arXiv:2506.01844) para conocer los resultados generales de la arquitectura, pero no hay datos específicos para este checkpoint concreto.

## Requisitos de hardware

- **VRAM estimada**: con 450 millones de parámetros y pesos en FP32 (0.9 GB), la inferencia en FP16 requeriría aproximadamente 1 GB de VRAM. Con cuantización a 8 bits, podría reducirse a ~0.5 GB, aunque no se ha confirmado.
- **GPU recomendada**: cualquier GPU con al menos 4 GB de VRAM es suficiente (por ejemplo, RTX 3060, RTX 4060, GTX 1660 Super). En CPU, la inferencia sería lenta pero posible para pruebas puntuales.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de consumo modernas e incluso en algunas integradas de gama alta.
- **Opciones de despliegue**: se utiliza con la librería LeRobot, que permite ejecutar inferencia y evaluación en el robot real o en simulación. No es compatible con vLLM, llama.cpp o Ollama, ya que no es un modelo de lenguaje generativo sino una política de acción.
- **Latencia y throughput**: no se han publicado datos específicos, pero al ser un modelo compacto se espera una inferencia en tiempo real (menos de 50 ms por paso) en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este) | 450 M | Pick-and-place en SO-101 | No aplica | Apache-2.0 | Hugging Face |
| SmolVLA base (lerobot/smolvla_base) | 450 M | Tareas generales de robótica | No aplica | Apache-2.0 | Hugging Face |
| ACT (Action Chunking Transformer) | ~100 M | Tareas de imitación | No aplica | MIT | GitHub |
| Diffusion Policy | ~50 M | Control de robots | No aplica | MIT | GitHub |

La comparación no es directa porque los modelos tienen propósitos distintos: SmolVLA es un VLA que integra visión y lenguaje, mientras que ACT y Diffusion Policy son políticas de imitación puras sin módulo de visión. SmolVLA ofrece una arquitectura más moderna y un mayor número de parámetros, pero su rendimiento específico en esta tarea no ha sido publicado. Los modelos de la misma familia (Chaenn) incluyen variantes con datos reales (multitask_real_0820) que podrían servir para comparar en un entorno físico.

## Limitaciones y advertencias

- **Sesgo de simulación**: el modelo ha sido entrenado exclusivamente en un entorno simulado, por lo que su comportamiento en el mundo real puede degradarse significativamente si no se realiza un fine-tuning adicional con datos reales.
- **Alucinación en acciones**: como cualquier modelo de aprendizaje automático, puede generar acciones erróneas o inconsistentes, especialmente ante configuraciones de objetos no vistas durante el entrenamiento.
- **Limitación de tareas**: solo está diseñado para la tarea de pick-and-place de un cubo en el entorno SO-101. No es un modelo generalista y no puede ejecutar otras tareas sin reentrenamiento.
- **Idiomas**: no es un modelo de lenguaje, no tiene capacidades multilingües ni de procesamiento de texto.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial y modificación, pero se debe mantener el aviso de copyright y la atribución. No hay restricciones específicas de uso.
- **Caveat para producción**: antes de usar en un entorno real, se recomienda validar el modelo con datos del mundo real y aplicar técnicas de seguridad como límites de torque o supervisión humana.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Chaenn/smolvla_policy_so101_cube_multitask_sim_0824)
- [Paper de SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Blog de fine-tuning SmolVLA para SO-101](https://ggando.com/blog/smolvla-so101/)
- [Repositorio de evaluación de políticas SO-101 (GitHub)](https://github.com/Yangjingyuan-HK/lerobot-so101-policy-evaluation/blob/main/examples/tutorial/smolvla/using_smolvla_example.py)
- [Variante con datos reales del mismo autor](https://huggingface.co/Chaenn/smolvla_policy_so101_cube_multitask_real_0820)
- [Otra variante del autor (multitask_0723)](https://huggingface.co/Chaenn/smolvla_policy_so101_cube_multitask_0723)

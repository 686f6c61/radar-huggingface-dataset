# felsager/smolvla_test

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, con 450 millones de parámetros, diseñado para desplegarse en hardware de consumo. Este repositorio contiene un fine-tune específico del modelo base `lerobot/smolvla_base` para la tarea de apilamiento de cubos (StackCube) en el simulador ManiSkill, utilizando el robot Panda. El modelo consume observaciones de estado y múltiples cámaras para generar acciones de control de 8 dimensiones, y se integra con el ecosistema LeRobot para entrenamiento y despliegue. Su relevancia radica en democratizar la robótica de aprendizaje por imitación, permitiendo que investigadores y desarrolladores ejecuten políticas de manipulación sin necesidad de infraestructura de alto coste.

El fine-tune se entrenó sobre un dataset de 1000 episodios y 107.420 frames, con una configuración de entrenamiento de 100 pasos, batch size de 224 y learning rate de 0,0001. Aunque el modelo base es generalista, esta versión está especializada en la tarea StackCube, lo que limita su aplicabilidad fuera de ese dominio. No se han publicado resultados de evaluación en la model card, por lo que el rendimiento real en el robot físico no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada multimodal: estado y 4 cámaras) |
| Tipos de cuantizacion | no disponible (formato original safetensors) |
| Idiomas soportados | no disponible (modelo de accion visual, sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un encoder visual con un decodificador de acciones, basado en la arquitectura transformer. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face para tareas de robótica general, y este repositorio contiene un fine-tune supervisado mediante aprendizaje por imitación (behavior cloning) sobre el dataset `felsager/ManiSkill_StackCube-v1_mp`. El entrenamiento se realizó con el optimizador AdamW, un learning rate de 0,0001, batch size de 224 y 100 pasos de entrenamiento, utilizando la librería LeRobot versión 0.6.1. No se menciona el uso de RLHF o DPO; el proceso es puramente de imitación.

El modelo acepta como entrada un vector de estado de 6 dimensiones y hasta 4 imágenes de cámaras (3 de 256x256 y 1 de 480x640), y produce una acción de 8 dimensiones. La arquitectura exacta (número de capas, heads, etc.) no se detalla en la información disponible, pero se sabe que es un modelo compacto de 450M parámetros, significativamente más pequeño que otros VLA como OpenVLA (7B).

## Capacidades

- Generación de acciones de control para robots manipuladores (8 dimensiones) a partir de observaciones de estado y visión.
- Procesamiento de múltiples cámaras simultáneamente (hasta 4 imágenes), lo que permite percepción multimodal.
- Integración nativa con LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- Soporte para tareas de manipulación como apilamiento de cubos (StackCube) en el simulador ManiSkill.
- Ejecución en tiempo real a 10 FPS (frecuencia de los datos de entrenamiento), adecuada para control de robots.
- No incluye capacidades de generación de texto, tool calling ni razonamiento simbólico; es un modelo puramente de acción.

## Casos de uso

- Control de brazo robótico Panda en simulación: el modelo puede ejecutar la tarea de apilamiento de cubos en ManiSkill, sirviendo como referencia para comparar algoritmos de aprendizaje por refuerzo o imitación.
- Prototipado rápido de políticas de manipulación: gracias a su pequeño tamaño, se puede iterar rápidamente en entornos simulados antes de transferir a hardware real.
- Investigación en robótica de bajo coste: permite a laboratorios con GPUs de consumo (p. ej., RTX 3060) experimentar con VLA sin necesidad de clústeres de alto rendimiento.
- Educación en robótica: adecuado para cursos que enseñan aprendizaje por imitación, ya que el modelo se puede entrenar y desplegar en una máquina de escritorio.
- Benchmarking de métodos de aprendizaje por imitación: al ser un fine-tune específico, puede usarse como baseline para comparar nuevas técnicas de entrenamiento en la tarea StackCube.
- Transferencia a tareas similares: aunque no está verificado, el modelo base generalista podría adaptarse a otras tareas de manipulación con fine-tuning adicional, aprovechando el conocimiento previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se proporcionan métricas como tasa de éxito en la tarea StackCube, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. Dado el tamaño de 450M parámetros, en FP16 los pesos ocupan aproximadamente 0,9 GB, por lo que se estima que cabe en GPUs con 4 GB de VRAM o más, aunque no se confirma oficialmente.
- GPU recomendadas: cualquier GPU de consumo moderna (NVIDIA RTX 3060, RTX 4070, etc.) debería ser suficiente para inferencia. Para entrenamiento, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con consumer GPU: sí, es uno de los objetivos del diseño de SmolVLA.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). También se puede integrar con vLLM o TGI si se convierte a formato adecuado, aunque no es el flujo estándar.
- Latencia y throughput: no se proporcionan datos. Dado el tamaño, se espera una latencia de decenas de milisegundos en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tune) | 450M | no disponible | Apache-2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | MIT | Hugging Face |
| RT-2 (Google) | 55B | no disponible | propietaria | no publico |

SmolVLA es significativamente más pequeño que OpenVLA y RT-2, lo que permite despliegue en hardware de consumo. Sin embargo, no se dispone de datos de rendimiento comparativo en tareas de manipulación. OpenVLA es un modelo generalista de 7B con licencia MIT, mientras que RT-2 es propietario y no está disponible públicamente. La ventaja de SmolVLA radica en su eficiencia computacional, aunque su capacidad de generalización puede ser menor debido al menor número de parámetros.

## Limitaciones y advertencias

- Fine-tune específico para la tarea StackCube: el modelo no ha sido evaluado en otras tareas, por lo que su generalización es incierta.
- No se han reportado resultados de evaluación en robot real o simulado; el rendimiento real no está verificado.
- Dependencia de la configuración de cámaras: el modelo espera exactamente 4 cámaras con las formas especificadas; cambios en la configuración requieren reentrenamiento.
- Posibles sesgos en los datos de entrenamiento: el dataset de ManiSkill puede no representar la variabilidad del mundo real (iluminación, texturas, etc.).
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales; se recomienda revisar las licencias de los componentes.
- Al ser un modelo de acción, no es adecuado para tareas de generación de texto o razonamiento simbólico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/felsager/smolvla_test
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/ManiSkill_StackCube-v1_mp
- LeRobot (librería): https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base

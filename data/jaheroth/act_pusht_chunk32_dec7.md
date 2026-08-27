# jaheroth/act_pusht_chunk32_dec7

## Resumen

El modelo `jaheroth/act_pusht_chunk32_dec7` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. Ha sido entrenado y publicado mediante la librería LeRobot de Hugging Face, sobre el dataset `lerobot/pusht`, un entorno de simulación de empuje de objetos (PushT) ampliamente utilizado para evaluar políticas de manipulación. El modelo cuenta con 83,9 millones de parámetros y se distribuye bajo licencia Apache-2.0 en formato safetensors.

La relevancia de este modelo radica en su aplicación directa al control de robots mediante aprendizaje por imitación, un campo en auge dentro de la robótica embodied. ACT reduce el problema del error acumulativo en políticas autoregresivas al predecir bloques de acciones, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación fina. Este checkpoint concreto, entrenado con un chunk de 32 pasos y una arquitectura con 7 decodificadores, está pensado para ser evaluado y desplegado en el simulador PushT, aunque su arquitectura es generalizable a otros entornos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - Transformer con codificador y decodificador |
| Parametros totales | 83.899.796 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el contexto se define por el chunk de acciones, 32 pasos) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que emplea un transformer con codificador y decodificador. El codificador procesa la observación actual (imagen y estado del robot) y el decodificador genera un chunk de acciones futuras de longitud fija (en este caso, 32 pasos). Esta predicción por bloques reduce la acumulación de errores típica de las políticas que predicen una sola acción por paso, mejorando la robustez frente a perturbaciones y el rendimiento en tareas de manipulación.

El modelo ha sido entrenado con la librería LeRobot sobre el dataset `lerobot/pusht`, que contiene demostraciones teleoperadas de la tarea de empujar un objeto (PushT). No se especifican detalles sobre el número de tokens de entrenamiento, composición exacta del dataset ni el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de robótica y no de lenguaje. El entrenamiento se realizó con el script estándar de LeRobot, que utiliza el optimizador AdamW y una pérdida de regresión sobre las acciones predichas. No se mencionan innovaciones técnicas adicionales más allá de las propias de ACT.

## Capacidades

- Control de robot por aprendizaje por imitación: genera secuencias de acciones de 32 pasos a partir de observaciones visuales y de estado.
- Manipulación fina: adecuado para tareas de empuje y manipulación de objetos en entornos simulados como PushT.
- Generalización a otros entornos: al ser una política entrenada con LeRobot, puede adaptarse a otros robots y tareas con el mismo pipeline de entrenamiento.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo evaluación y registro de episodios.
- Sin capacidades de lenguaje: no procesa texto ni mantiene conversaciones; es exclusivamente un modelo de control motor.
- Sin tool calling ni razonamiento simbólico: su función es puramente perceptivo-motora.

## Casos de uso

- Evaluación de políticas en simulación: el modelo puede ejecutarse en el entorno PushT para medir su tasa de éxito y comparar con otras políticas ACT, usando el script de evaluación de LeRobot.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del tamaño del chunk (32 pasos) y el número de decodificadores (7) en la estabilidad de la política.
- Desarrollo de controladores para robots reales: aunque entrenado en simulación, la arquitectura ACT es transferible a robots físicos como el SO-100, usando el pipeline de LeRobot para teleoperación y despliegue.
- Benchmarking de métodos de imitación: permite comparar ACT con otras arquitecturas (diffusion policies, etc.) en la tarea estándar PushT.
- Educación en robótica: útil como ejemplo práctico de entrenamiento y despliegue de una política de manipulación con herramientas open source.
- Reproducibilidad de experimentos: al estar disponible en el Hub con licencia Apache-2.0, facilita la replicación de resultados y la extensión de trabajos previos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas de éxito en la tarea PushT ni comparaciones con otras políticas en su model card. Para obtener datos de rendimiento, sería necesario ejecutar la evaluación en el entorno PushT siguiendo las instrucciones de LeRobot.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 83,9 millones de parámetros, la inferencia en precisión FP32 requiere aproximadamente 0,34 GB de VRAM solo para los pesos, más el overhead de activaciones y el procesamiento de imágenes. En la práctica, una GPU con 4 GB de VRAM es suficiente para ejecutar la política en tiempo real.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, como una NVIDIA RTX 3060 o superior, es adecuada. Para entrenamiento, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como la RTX 3060, RTX 4060 o incluso en una GTX 1080 Ti.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia en PyTorch. También puede exportarse a ONNX o TensorRT para despliegue en edge, aunque no se documenta en la información disponible.
- Latencia y throughput: no se proporcionan datos específicos. En una GPU moderna, la inferencia de un chunk de 32 acciones debería completarse en menos de 50 ms, pero esto depende del hardware y del preprocesamiento de imágenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jaheroth/act_pusht_chunk32_dec7 | 83,9 M | chunk 32 | PushT | Apache-2.0 | Hugging Face |
| arclabmit/pusht_act_model | no disponible | no disponible | PushT | no disponible | Hugging Face |
| Otros modelos ACT en LeRobot | variable | variable | variable | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos. La comparativa se limita a la arquitectura y la tarea, ya que todos usan ACT sobre el mismo dataset. Para una comparación cuantitativa, sería necesario ejecutar evaluaciones en el entorno PushT.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente en el entorno PushT, la política puede no generalizar a otras tareas o dinámicas de objetos sin reentrenamiento.
- Riesgo de alucinación: en robótica, el equivalente a la alucinación es la generación de acciones fuera de la distribución de entrenamiento, lo que puede provocar movimientos erráticos. ACT mitiga parcialmente este problema con el chunking, pero no lo elimina.
- Limitaciones de contexto: el modelo solo procesa observaciones de un solo paso y genera un chunk de 32 acciones; no mantiene memoria a largo plazo de episodios anteriores.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y se indiquen los cambios.
- Caveat para producción: el modelo está pensado para simulación; su despliegue en robots reales requiere calibración, adaptación del dominio y pruebas de seguridad adicionales.
- Dependencia del ecosistema LeRobot: para reproducir el entrenamiento o la evaluación, es necesario instalar la librería LeRobot y sus dependencias, lo que puede suponer una barrera técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/act_pusht_chunk32_dec7
- Documentación de ACT en LeRobot: https://huggingface.co/docs/lerobot/act
- Paper de ACT (arXiv): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset PushT: https://huggingface.co/datasets/lerobot/pusht
- Perfil de GitHub del autor: https://github.com/JaHeRoth

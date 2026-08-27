# jaheroth/act_pusht_dec7

## Resumen

El modelo `jaheroth/act_pusht_dec7` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Ha sido desarrollado por Jacob H. Rothschild (usuario `jaheroth`) y entrenado con la librería LeRobot de Hugging Face sobre el dataset simulado PushT, donde un agente debe empujar una pieza con forma de T hasta una región objetivo. El modelo tiene 83,97 millones de parámetros y se distribuye en formato safetensors con licencia Apache 2.0.

La relevancia de este modelo radica en que constituye un ejemplo práctico de aplicación de transformers a la robótica de manipulación, demostrando cómo el aprendizaje por imitación puede generar políticas eficaces a partir de demostraciones teleoperadas. Al estar integrado en el ecosistema LeRobot, permite reproducir el flujo completo de entrenamiento, evaluación e inferencia sobre hardware robótico real o simulado, lo que lo convierte en un recurso útil para investigadores y desarrolladores que trabajan en control de robots.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Action Chunking with Transformers) |
| Parametros totales | 83.969.428 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ACT usa ventana de observación y chunk de acción, típicamente 1 observación y 100 acciones, pero no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que emplea una arquitectura transformer encoder-decoder. El encoder procesa la observación actual (imágenes y/o estados del robot) y el decoder genera un chunk de acciones futuras, es decir, una secuencia de comandos de control que se ejecutan de forma abierta durante varios pasos. Esta estrategia reduce el error de acumulación típico de las políticas que predicen una sola acción por paso y mejora la estabilidad del control.

El modelo fue entrenado con la librería LeRobot sobre el dataset `lerobot/pusht`, un entorno simulado en 2D donde se debe empujar una pieza con forma de T hasta una zona objetivo. El entrenamiento se realizó mediante aprendizaje por imitación supervisado a partir de demostraciones generadas por un controlador experto. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El entrenamiento se llevó a cabo siguiendo el flujo estándar de LeRobot, que incluye normalización de observaciones y acciones, y optimización con el algoritmo ACT implementado en la librería.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones (chunks) para tareas de manipulación, específicamente empuje de objetos en el entorno PushT.
- Procesamiento de observaciones visuales y de estado: el encoder acepta imágenes y estados del robot como entrada, aunque no se especifican los detalles de la representación.
- Integración con LeRobot: compatible con el flujo de entrenamiento, evaluación e inferencia de la librería, incluyendo el registro de episodios y la reproducción de políticas.
- No soporta tool calling, razonamiento multi-paso, generación de lenguaje ni capacidades multimodales generales.
- No tiene capacidades multilingües; es un modelo puramente orientado a control motor.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el comportamiento de ACT en tareas de empuje y comparar con otras políticas como Diffusion Policy.
- Desarrollo de políticas para robots reales: el modelo puede transferirse a robots como el SO-100 usando LeRobot, tras adaptar el espacio de observación y acción.
- Benchmarking de algoritmos de control: permite evaluar el rendimiento de ACT frente a otros métodos en el entorno PushT, un estándar en la comunidad de robótica.
- Reproducción de experimentos: al estar publicado en Hugging Face con todos los metadatos, facilita la replicación de entrenamientos y la comparación de resultados.
- Educación y formación: útil para aprender a entrenar políticas de manipulación con LeRobot, ya que el código de entrenamiento e inferencia está documentado en la model card.
- Integración en pipelines de simulación: puede usarse como controlador en entornos de simulación para generar datos o evaluar estrategias de planificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. El paper original de ACT (arxiv:2304.13705) reporta tasas de éxito en el entorno PushT, pero no se dispone de los valores concretos para este checkpoint concreto. Se recomienda consultar la documentación de LeRobot y el paper para obtener referencias generales del método.

## Requisitos de hardware

- Inferencia: al tratarse de un modelo de 84M parámetros (0,3 GB en safetensors), la inferencia puede ejecutarse en CPU con baja latencia, aunque se recomienda una GPU para entornos de simulación con alta frecuencia de control.
- VRAM estimada para inferencia: menos de 1 GB en precisión FP32; con cuantización (no disponible actualmente) podría reducirse aún más.
- Entrenamiento: se recomienda una GPU con al menos 4 GB de VRAM para manejar el batch típico de LeRobot; GPUs como RTX 3060, RTX 4060 o superiores son suficientes.
- Despliegue: compatible con LeRobot (Python), que ofrece scripts de entrenamiento, evaluación e inferencia. No se han documentado integraciones con vLLM, llama.cpp u Ollama, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del hardware y del tamaño del chunk de acción configurado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jaheroth/act_pusht_dec7 | ACT (Transformer) | 83,97M | no disponible | Apache 2.0 | Hugging Face |
| arclabmit/pusht_act_model | ACT (Transformer) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Diffusion Policy (referencia) | U-Net + diffusion | no disponible | no disponible | MIT (según implementación) | Repos oficiales |

Ambos modelos ACT están entrenados sobre el mismo dataset PushT con LeRobot, por lo que son directamente comparables en términos de metodología. Diffusion Policy es un enfoque alternativo que también se ha aplicado a PushT, pero no se dispone de datos de rendimiento específicos para esta comparativa.

## Limitaciones y advertencias

- El modelo está especializado en la tarea PushT y no generaliza a otras tareas de manipulación sin reentrenamiento.
- Depende de la calidad y diversidad de las demostraciones utilizadas durante el entrenamiento; demostraciones subóptimas pueden degradar el rendimiento.
- No tiene capacidades de procesamiento de lenguaje ni de razonamiento simbólico; es exclusivamente un controlador motor.
- La longitud de contexto y el tamaño del chunk de acción no están documentados en la model card, lo que dificulta la configuración precisa en otros entornos.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo está pensado para entornos de investigación y simulación; su despliegue en robots reales requiere validación adicional de seguridad.
- No se han publicado métricas de rendimiento específicas, por lo que no es posible verificar su eficacia sin ejecutar evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/act_pusht_dec7
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de ACT en LeRobot: https://huggingface.co/docs/lerobot/act
- Perfil de GitHub del autor: https://github.com/JaHeRoth
- Ejemplo de configuración de entrenamiento ACT PushT: https://github.com/oshvartz/lerobot-joycon/blob/main/examples/advanced/1_train_act_pusht/act_pusht.yaml

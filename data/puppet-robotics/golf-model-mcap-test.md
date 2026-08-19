# puppet-robotics/golf-model-mcap-test

## Resumen

Este modelo es un fine-tuning del modelo π₀.₅ (Pi05) de Physical Intelligence, adaptado por el equipo de LeRobot de Hugging Face, y entrenado específicamente para la tarea de jugar al golf con un robot tipo `oscar`. Se trata de un modelo de visión-lenguaje-acción (VLA) que recibe imágenes de dos cámaras (muñeca y ego) junto con el estado del robot, y genera comandos de acción de 8 dimensiones. El fine-tuning se realizó sobre el modelo base `lerobot/pi05_base` con un dataset de 24 episodios (1287 frames a 10 FPS) recogidos por el autor `puppet-robotics`.

El modelo tiene 4.143.404.816 parámetros y se distribuye en formato `safetensors` con licencia Apache 2.0. Es un modelo de prueba (su nombre incluye "test") y no se han publicado resultados de evaluación en el mundo real. Su relevancia radica en demostrar el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot, así como en explorar la generalización del modelo π₀.₅ a tareas específicas de manipulación con datos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en π₀.₅, implementación LeRobot |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | Safetensors (FP32/FP16), no se especifican cuantizaciones adicionales |
| Idiomas soportados | No aplica (modelo de acción robótica, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, un modelo de visión-lenguaje-acción desarrollado por Physical Intelligence que evoluciona el π₀ original para generalizar a entornos y situaciones nuevas. La implementación en LeRobot está adaptada del repositorio OpenPI. El modelo procesa observaciones multimodales: el estado del robot (vector de 8 dimensiones) y dos imágenes (cámara de muñeca a 480x640 y cámara ego a 720x1280), y produce una acción de 8 dimensiones.

El entrenamiento se realizó mediante fine-tuning del modelo base `lerobot/pi05_base` con el dataset `puppet-robotics/golf-mcap-test`, que contiene 24 episodios de demostración de la tarea "Play golf" a 10 FPS. Se usaron 10.000 pasos de entrenamiento con batch size 32, optimizador AdamW, learning rate 2.5e-05 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es de imitación supervisada.

## Capacidades

- Control robótico de manipulación: genera acciones de 8 dimensiones (posición, orientación, etc.) para el robot `oscar`.
- Percepción visual multimodal: procesa simultáneamente imágenes de cámara de muñeca y cámara ego para guiar la tarea.
- Ejecución de tareas específicas: entrenado para la tarea "Play golf", que implica golpear una bola con un palo.
- Integración con LeRobot: compatible con el flujo de entrenamiento y despliegue de LeRobot (`lerobot-train`, `lerobot-rollout`).
- No incluye capacidades de lenguaje conversacional, generación de texto ni razonamiento general; es un modelo puramente orientado a acción.

## Casos de uso

- Automatización de tareas de manipulación en entornos controlados: el modelo puede ejecutar la tarea de golf en un robot real, demostrando cómo un VLA puede transferir demostraciones humanas a acciones robóticas.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tuning de un modelo base grande con pocos datos (24 episodios), útil para estudiar la eficiencia de datos en robótica.
- Desarrollo de políticas robóticas personalizadas: el flujo de entrenamiento puede replicarse para otras tareas (recoger objetos, ensamblar piezas) cambiando el dataset.
- Evaluación de la generalización de π₀.₅: permite probar si el modelo base generaliza a tareas específicas con datos limitados, un aspecto clave para la adopción en producción.
- Benchmarking de hardware de robótica: el modelo puede usarse para medir el rendimiento de GPUs y sistemas embebidos en inferencia de políticas VLA.
- Formación y educación: útil para enseñar a estudiantes el pipeline completo de LeRobot, desde la recogida de datos hasta el despliegue en robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay datos de éxito en tareas reales, ni comparaciones con otros modelos VLA.

## Requisitos de hardware

- VRAM estimada: no se especifica oficialmente. Con 4.14B parámetros en FP32 (~16.6 GB) o FP16 (~8.3 GB), se requiere una GPU con al menos 12-16 GB para inferencia en FP16. En cuantización de 8 bits podría caber en 6-8 GB, pero no hay cuantizaciones publicadas.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como RTX 4090, A100 (40 GB), o H100. Para entrenamiento completo (fine-tuning), se recomienda una GPU con 24 GB o más.
- Compatibilidad con consumer GPU: sí, una RTX 4090 o RTX 4080 con 16 GB puede ejecutar la inferencia, pero el entrenamiento puede requerir más memoria o técnicas de gradiente acumulado.
- Opciones de despliegue: LeRobot soporta inferencia con `lerobot-rollout`. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Depende del hardware y de la resolución de las cámaras (480x640 y 720x1280).

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo pertenece a la categoría de VLA (Vision-Language-Action) para robótica, donde existen alternativas como OpenVLA (7B parámetros) o RT-2 de DeepMind, pero no hay datos de rendimiento comparables publicados para este modelo concreto. Se recomienda consultar la documentación de LeRobot y el blog de Physical Intelligence para más contexto.

## Limitaciones y advertencias

- Modelo de prueba: el nombre incluye "test" y tiene 0 descargas y 0 likes; no ha sido validado en entornos reales más allá del conjunto de demostración.
- Datos de entrenamiento muy limitados: 24 episodios y 1287 frames es una cantidad pequeña, lo que puede provocar sobreajuste y poca generalización a variaciones de iluminación, posición de objetos o configuraciones del robot.
- Sin evaluación publicada: no hay métricas de éxito en tareas reales, por lo que no se puede garantizar su fiabilidad en producción.
- Dependencia del hardware específico: entrenado para el robot `oscar` con cámaras concretas; puede no funcionar con otros robots o configuraciones de cámaras sin reentrenamiento.
- Riesgo de alucinación en acciones: como todo modelo de imitación, puede generar acciones erróneas o inseguras si las observaciones se desvían del dominio de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base π₀.₅ puede tener restricciones adicionales; se recomienda revisar la licencia de `lerobot/pi05_base`.
- No es un modelo de lenguaje: no debe usarse para tareas de generación de texto, chat o razonamiento general.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/puppet-robotics/golf-model-mcap-test
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/puppet-robotics/golf-mcap-test

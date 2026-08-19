# lwxmmmmsl/my_policy

## Resumen

El modelo `lwxmmmmsl/my_policy` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido entrenado con el framework LeRobot de HuggingFace sobre un dataset de teleoperación de 5 episodios, con un total de 4778 fotogramas a 30 FPS, para la tarea específica de colocar una cinta en un plato marrón. El modelo consume observaciones de dos cámaras RGB (frontal y lateral) y el estado del robot (6 dimensiones) y produce comandos de acción de 6 dimensiones.

Este modelo es relevante como ejemplo práctico de entrenamiento de políticas de imitación con LeRobot, demostrando el flujo completo desde la captura de datos hasta el despliegue en un robot real. Su arquitectura transformer, combinada con la predicción por chunks, permite ejecutar tareas de manipulación con alta precisión, aunque en este caso el dataset es muy reducido y no se han publicado evaluaciones. La licencia Apache 2.0 facilita su uso y modificación tanto en investigación como en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer encoder-decoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de observacion fija: estado + 2 imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que utiliza un transformer encoder-decoder. El encoder procesa las observaciones (estado del robot y dos imágenes RGB de 480x640 píxeles) y el decoder genera un chunk de acciones futuras, típicamente de 50 pasos, en una sola pasada. Esta predicción por chunks reduce la acumulación de errores y permite movimientos más suaves en comparación con políticas que predicen un solo paso.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre un dataset de teleoperación de 5 episodios (4778 frames) para la tarea "Place the tape into the brown plate". Se usaron 100000 pasos de entrenamiento con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se aplicaron técnicas de RLHF ni DPO; el método es puramente de imitación supervisada. No se dispone de información sobre el número total de parámetros ni sobre innovaciones adicionales en la arquitectura.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea aprendida (colocar una cinta en un plato) a partir de observaciones visuales y de estado.
- Predicción de acciones por chunks: genera secuencias de 6 dimensiones de acción, lo que facilita movimientos coordinados y estables.
- Procesamiento multimodal: combina dos flujos de imagen (frontal y lateral) con el estado propioceptivo del robot.
- Despliegue en tiempo real: integrado con LeRobot, permite ejecutar la política en un robot `so_follower` mediante el comando `lerobot-rollout`.
- No incluye capacidades de lenguaje, tool calling, razonamiento simbólico ni procesamiento de texto.

## Casos de uso

- Prototipado rápido de políticas de imitación: sirve como plantilla para validar el flujo de LeRobot con un dataset pequeño antes de escalar a tareas más complejas.
- Investigación en aprendizaje por imitación: permite estudiar el comportamiento de ACT con pocos episodios y comparar estrategias de aumento de datos o regularización.
- Tareas de pick-and-place en entornos controlados: la política puede desplegarse en un robot real para realizar la tarea específica de manipulación de objetos pequeños, siempre que el entorno coincida con el de entrenamiento.
- Evaluación de robustez visual: al usar dos cámaras, se pueden probar variaciones de iluminación, posición de la cámara o fondos para medir la generalización.
- Base para fine-tuning: sobre este modelo se pueden añadir nuevos episodios de la misma tarea o tareas similares mediante entrenamiento continuado.
- Demostración educativa: en cursos de robótica, muestra cómo entrenar y ejecutar una política de imitación con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se proporcionan métricas de éxito en el robot real ni comparaciones con otros métodos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la model card.
- Al ser un modelo de visión con dos cámaras de 480x640, se requiere una GPU con al menos 8 GB de VRAM para inferencia en tiempo real (estimación razonable, no confirmada por el autor).
- GPUs recomendadas: NVIDIA RTX 3060 o superior, o GPUs de datacenter como A10 o A100.
- Despliegue: se realiza mediante el framework LeRobot, que soporta ejecución en GPU con PyTorch. No se mencionan opciones de cuantización ni optimizaciones como TensorRT.
- Latencia: no disponible; depende del hardware y de la frecuencia de control del robot (30 FPS).

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El modelo está entrenado para una tarea muy específica y no se han publicado resultados comparativos con alternativas como Diffusion Policy o otras variantes de ACT. Se recomienda consultar la documentación de LeRobot para ver ejemplos de otras políticas entrenadas en tareas similares.

## Limitaciones y advertencias

- Dataset extremadamente reducido (5 episodios), lo que provoca un alto riesgo de sobreajuste y baja generalización a variaciones del entorno.
- No se han realizado evaluaciones formales en el robot real; la model card indica que no hay resultados reportados.
- La tarea es muy específica ("colocar la cinta en el plato marrón"); cualquier cambio en la posición de objetos, iluminación o fondo puede degradar el rendimiento.
- No soporta tareas fuera de la manipulación aprendida; no es un modelo de propósito general.
- No hay información sobre sesgos, pero al ser un modelo de visión, puede verse afectado por sesgos en los datos de teleoperación (por ejemplo, posturas del brazo o posiciones de cámara).
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Al ser un modelo de robótica, se requiere hardware físico y calibración adecuada de cámaras y robot para su despliegue.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/lwxmmmmsl/my_policy)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Dataset de entrenamiento](https://huggingface.co/datasets/lwxmmmmsl/record-test_20260819_131548)

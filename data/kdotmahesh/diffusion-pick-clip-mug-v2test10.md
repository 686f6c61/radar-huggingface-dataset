# kdotmahesh/diffusion-pick-clip-mug-v2test10

## Resumen

El modelo `diffusion-pick-clip-mug-v2test10` es una política de control visuomotor basada en Diffusion Policy, desarrollada por kdotmahesh y entrenada con el framework LeRobot. Está diseñada para que un robot manipulador de tipo `so_follower` realice la tarea de recoger un clip y colocarlo en una taza, utilizando dos cámaras (muñeca y vista superior) junto con el estado del robot. El modelo cuenta con 277,8 millones de parámetros y se ha entrenado con un conjunto de datos de solo 10 episodios (5871 fotogramas), lo que lo convierte en un ejemplo de aprendizaje por imitación con pocos datos. Su relevancia radica en demostrar cómo las políticas de difusión pueden generar trayectorias de acción suaves y multi-paso para manipulación con contacto, tal como se describe en el artículo original de Diffusion Policy (arXiv:2303.04137).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (visuomotor) |
| Parametros totales | 277.840.246 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de control, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, un enfoque que trata el control visuomotor como un proceso generativo de difusión. En lugar de predecir una única acción, genera una trayectoria de acciones multi-paso que se denoisa iterativamente, lo que produce movimientos suaves y robustos, especialmente en tareas que requieren contacto físico. La entrada consiste en el estado del robot (6 dimensiones) y dos imágenes RGB de 480x640 píxeles (cámara de muñeca y cámara superior). La salida es una acción de 6 dimensiones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset propio de 10 episodios y 5871 fotogramas a 30 FPS. Se usaron 3000 pasos de entrenamiento, batch size de 32, optimizador Adam con learning rate de 0.0001 y semilla 1000. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento de imitación supervisada pura.

## Capacidades

- Control visuomotor para manipulación robótica: genera acciones de 6 grados de libertad a partir de observaciones visuales y de estado.
- Generación de trayectorias multi-paso: produce secuencias de acciones suaves, adecuadas para tareas con contacto.
- Entrada multimodal: procesa simultáneamente dos imágenes (muñeca y overhead) y el estado del robot.
- Entrenamiento con pocos datos: funciona con solo 10 episodios, lo que demuestra eficiencia en la recogida de datos.
- Integración con LeRobot: se puede ejecutar directamente en un robot `so_follower` mediante el comando `lerobot-rollout`.
- No incluye capacidades de lenguaje, tool calling, ni visión general fuera del contexto de la tarea.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como ejemplo de entrenamiento de una política de difusión con un conjunto de datos mínimo (10 episodios) para estudiar la generalización y el comportamiento en tareas de pick-and-place.
- Despliegue en robots `so_follower`: se puede ejecutar en un robot real usando el comando `lerobot-rollout` con la configuración de cámaras y puerto adecuados, tal como se documenta en la model card.
- Prototipado rápido de políticas robóticas: al ser un modelo pequeño y entrenado con pocos datos, es útil para validar el flujo de trabajo de LeRobot antes de escalar a tareas más complejas.
- Base para experimentos de fine-tuning: aunque no se documenta explícitamente, el modelo puede servir como punto de partida para entrenar nuevas políticas sobre datasets similares usando `lerobot-train`.
- Evaluación de políticas de difusión en manipulación: permite comparar el rendimiento de Diffusion Policy frente a otros métodos de control en entornos controlados.
- Educación en robótica y aprendizaje automático: el repositorio incluye instrucciones completas para instalar LeRobot, configurar hardware y entrenar políticas, lo que lo hace adecuado para cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- Dado el tamaño del modelo (277,8 millones de parámetros), es probable que pueda ejecutarse en GPUs de consumo medio (por ejemplo, RTX 3060 o superior) con al menos 4 GB de VRAM, pero no hay datos oficiales.
- El framework LeRobot requiere PyTorch con soporte CUDA para entrenamiento e inferencia en GPU.
- Para el despliegue en robot, se necesita el hardware del robot `so_follower` y las cámaras configuradas según la documentación.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada, ni se dispone de datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- Entrenado con solo 10 episodios, por lo que la generalización a variaciones de la tarea (nuevas posiciones de objetos, iluminación, distracciones) es limitada.
- Es una política específica para la tarea "recoger el clip y colocarlo en la taza"; no es un modelo general de manipulación ni de visión.
- No se han proporcionado resultados de evaluación en robot real, por lo que su rendimiento en producción no está verificado.
- El modelo no soporta lenguaje natural ni interacción multimodal fuera de su entrada fija (estado + dos imágenes).
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del framework LeRobot y del hardware específico, lo que puede limitar su portabilidad.
- No se documentan sesgos conocidos, pero al ser un modelo de control, los riesgos de alucinación no aplican; en su lugar, el riesgo principal es la ejecución de acciones incorrectas en el robot si las observaciones difieren del dominio de entrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kdotmahesh/diffusion-pick-clip-mug-v2test10)
- [Dataset de entrenamiento](https://huggingface.co/datasets/kdotmahesh/pick-clip-place-mug-v2-test10_20260830_171038)
- [Paper de Diffusion Policy (arXiv:2303.04137)](https://huggingface.co/papers/2303.04137)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)

# latentforce/act_policy5

## Resumen

El modelo `latentforce/act_policy5` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el equipo de Latentforce. Se trata de un modelo de aprendizaje por imitación entrenado con el framework LeRobot de Hugging Face, diseñado para ejecutar la tarea de recoger una bola naranja y colocarla en un cuenco naranja. El modelo procesa imágenes de dos cámaras (superior y de muñeca) junto con el estado del robot (6 dimensiones) y genera acciones de control de 6 dimensiones. Con 51,7 millones de parámetros, es un modelo ligero adecuado para robots de bajo coste tipo SO-100.

Su relevancia radica en que demuestra cómo un transformer con CVAE puede aprender manipulaciones precisas a partir de demostraciones teleoperadas, con una arquitectura eficiente que predice secuencias de acciones (chunks) en lugar de pasos individuales. Al estar publicado bajo licencia Apache 2.0 y ser compatible con el ecosistema LeRobot, resulta accesible para investigadores y desarrolladores que buscan reproducir o adaptar políticas robóticas sin necesidad de grandes infraestructuras.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con CVAE |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) fue propuesto en el paper arXiv:2304.13705. La arquitectura combina un codificador de visión (típicamente ResNet) para procesar las imágenes de las cámaras, un transformer que modela la secuencia de observaciones y un decodificador que genera un chunk de acciones futuras. El modelo incorpora un CVAE (Conditional Variational Autoencoder) que captura la multimodalidad de las demostraciones humanas, permitiendo generar acciones coherentes incluso ante variaciones en la tarea.

En este caso, el modelo fue entrenado con el framework LeRobot (versión 0.6.1) sobre un dataset de 92 episodios (55.093 fotogramas a 30 FPS) de la tarea "Pick the orange ball and put it in the orange bowl". El entrenamiento se realizó durante 150.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5. No se especifica el uso de RLHF u otros métodos de refinamiento; se trata de aprendizaje por imitación puro.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones (posición y orientación del efector final) para un robot tipo `so_follower`.
- Percepción visual multi-cámara: procesa simultáneamente imágenes de una cámara superior (`top`) y una cámara en la muñeca (`wrist`), ambas a 480x640 píxeles.
- Predicción de chunks de acciones: a diferencia de políticas que predicen un solo paso, ACT predice secuencias de acciones, lo que reduce la propagación de errores y mejora la suavidad del movimiento.
- Aprendizaje por imitación: aprende directamente de demostraciones teleoperadas sin necesidad de ingeniería de recompensas.
- Ejecución en tiempo real: diseñado para inferencia en robots físicos con requisitos computacionales modestos.

## Casos de uso

- Automatización de pick-and-place en entornos industriales: el modelo puede integrarse en una celda robótica para recoger objetos de una posición fija y depositarlos en un contenedor, como en líneas de ensamblaje.
- Robots de laboratorio para manipulación de muestras: la tarea de recoger una bola y colocarla en un cuenco es representativa de tareas de transferencia de líquidos o muestras en entornos científicos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre robots o la robustez ante variaciones del entorno.
- Demostraciones educativas de robótica: al ser un modelo pequeño y entrenado con LeRobot, es ideal para cursos y talleres que enseñan a entrenar políticas robóticas con datos teleoperados.
- Prototipado rápido de nuevas tareas: dado que el entrenamiento es relativamente rápido (150k pasos con un dataset pequeño), se puede adaptar a nuevas tareas con pocas demostraciones.
- Evaluación de hardware robótico de bajo coste: el modelo es adecuado para robots tipo SO-100 o similares, permitiendo validar la precisión de actuadores y sensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de tasa de éxito en tareas reales.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~51,7M de parámetros, la inferencia puede realizarse con menos de 2 GB de VRAM en FP32, y menos de 1 GB en FP16. Sin embargo, el procesamiento de imágenes de 480x640 añade carga computacional.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (ej. NVIDIA GTX 1650, RTX 3050) es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que se ejecutan en PyTorch. También se puede exportar a ONNX o TensorRT para optimización, aunque no está documentado en el repo.
- Latencia y throughput: no disponible. Depende del hardware y de la resolución de entrada. En una GPU moderna, la inferencia debería ser inferior a 50 ms por paso.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de políticas robóticas (como Diffusion Policy o ACT con otros tamaños). Sin embargo, se puede comparar cualitativamente:

- ACT (este modelo): 51,7M parámetros, entrenado con LeRobot, tarea específica de pick-and-place.
- Diffusion Policy (Chi et al., 2023): utiliza difusión para generar acciones, suele tener más parámetros y requiere más datos.
- ACT original (Zhao et al., 2023): el paper reporta éxito en tareas de precisión, pero no hay una implementación oficial comparable en tamaño.

No se dispone de tablas de benchmarks comparativas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de control, no genera texto, por lo que no aplica el concepto de alucinación. Sin embargo, puede producir acciones incorrectas si las condiciones de iluminación o posición de los objetos difieren del dataset de entrenamiento.
- Riesgo de sobreajuste: entrenado con solo 92 episodios de una única tarea, el modelo puede no generalizar a variaciones del entorno (nuevas posiciones, objetos de otro color, etc.).
- Limitaciones de contexto: la ventana de observación es fija (dos cámaras y estado) y no hay memoria a largo plazo más allá del chunk de acciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye tal cual, sin garantías.
- Caveat para producción: no se han realizado evaluaciones en robot real; se recomienda validar exhaustivamente antes de desplegar en entornos no controlados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/latentforce/act_policy5
- Dataset de entrenamiento: https://huggingface.co/datasets/latentforce/pick_orange_ball_newfull
- Paper de ACT: https://arxiv.org/abs/2304.13705
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act

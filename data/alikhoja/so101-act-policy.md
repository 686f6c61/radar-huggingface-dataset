# AliKhoja/so101-act-policy

## Resumen

El modelo `AliKhoja/so101-act-policy` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido entrenado con el framework LeRobot de Hugging Face y está diseñado para el brazo robótico SO-101 (modo follower), con una cámara frontal como entrada visual. El modelo resuelve la tarea de recoger una botella desde múltiples ubicaciones y colocarla sobre un mousepad, a partir de 50 episodios de demostración teleoperados.

Con 51,7 millones de parámetros, es un modelo compacto pensado para ejecutarse en tiempo real en hardware robótico. Su relevancia radica en que demuestra el flujo completo de entrenamiento de políticas de imitación con LeRobot, desde la recopilación de datos hasta el despliegue en el robot, y está publicado bajo licencia Apache 2.0, lo que permite su uso y modificación sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer encoder-decoder con backbone de visión |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador de visión (para procesar la imagen de la cámara frontal) con un transformer que predice un chunk de acciones futuras. En lugar de emitir una única acción por paso, el modelo genera una secuencia de acciones (típicamente de 10 a 100 pasos) que el robot ejecuta de forma abierta, reduciendo así el error acumulado típico de las políticas autoregresivas. La entrada al modelo es un vector de estado de 6 dimensiones (posición/orientación del efector) y una imagen RGB de 240x320 píxeles; la salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset de 50 episodios teleoperados (37.819 frames a 30 FPS) de la tarea "pick up bottle from multiple locations and place on mousepad". Se usaron 20.000 pasos de entrenamiento, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF ni DPO, ya que es un método de imitación supervisada. El modelo se publica como un checkpoint de LeRobot, listo para ser cargado con la CLI `lerobot-rollout`.

## Capacidades

- Control robótico de manipulación: el modelo genera comandos de acción de 6 grados de libertad para el brazo SO-101, permitiendo tareas de agarre y colocación de objetos.
- Aprendizaje por imitación: aprende directamente de demostraciones teleoperadas, sin necesidad de ingeniería de recompensas ni simulación.
- Predicción por chunks: emite secuencias de acciones completas, lo que reduce la acumulación de errores y mejora la estabilidad del movimiento.
- Percepción visual: procesa imágenes RGB de una cámara frontal (240x320) para localizar y manipular objetos.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo herramientas de entrenamiento, evaluación y despliegue.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento simbólico; su única salida es el vector de acción robótica.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede recoger objetos (botellas) desde posiciones variables y depositarlos en una ubicación fija, útil en líneas de montaje o laboratorios de investigación.
- Prototipado rápido de políticas robóticas: al estar entrenado con LeRobot, sirve como punto de partida para que desarrolladores aprendan el flujo de trabajo de imitación y lo adapten a nuevas tareas con pocas demostraciones.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del tamaño del dataset, el número de episodios y la arquitectura ACT en el rendimiento de manipulación real.
- Benchmark de control robótico: puede usarse como referencia para comparar otros métodos (p. ej., Diffusion Policy) en la misma tarea y robot.
- Educación en robótica con IA: adecuado para cursos y talleres donde se enseña a entrenar y desplegar políticas de visión-accionamiento con hardware de bajo coste como el SO-101.
- Evaluación de robustez ante variaciones de posición: la tarea incluye "múltiples ubicaciones" de la botella, lo que permite probar la generalización del modelo a nuevas posiciones no vistas en el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas como tasa de éxito, precisión de agarre ni comparaciones con otros métodos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 51,7 M de parámetros, la inferencia requiere muy poca memoria. Con precisión FP32, el peso ocupa unos 207 MB; en FP16, unos 103 MB. Cabe en cualquier GPU con al menos 2 GB de VRAM, incluyendo GPUs integradas o Jetson.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (p. ej., RTX 3060, RTX 4090, A100) o incluso CPU para inferencia a baja frecuencia. No se requieren GPUs de alta gama.
- Compatibilidad con consumer GPU: sí, cualquier GPU moderna es suficiente.
- Opciones de despliegue: LeRobot proporciona la CLI `lerobot-rollout` para ejecutar la política en el robot. También puede cargarse mediante la API de LeRobot en Python. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos. Dado el tamaño del modelo, se espera una latencia de pocos milisegundos por inferencia en GPU, suficiente para control en tiempo real a 30 FPS.

## Comparativa con modelos similares

No se dispone de datos comparativos directos. Existen otros checkpoints de ACT para el mismo robot SO-101 en Hugging Face (p. ej., `18houston2/so101_act_policy`, `AdithyaRajendran/so101_act_policy`), pero no se han publicado métricas comparativas. El método ACT original (paper arXiv:2304.13705) reporta tasas de éxito en tareas de manipulación, pero no se puede extrapolar a este checkpoint concreto sin evaluación. No se dispone de información sobre alternativas como Diffusion Policy o RDT para comparar en esta tarea.

## Limitaciones y advertencias

- Sin evaluación en robot real: la model card no incluye resultados de éxito, por lo que se desconoce la fiabilidad del modelo en condiciones reales.
- Dataset limitado: solo 50 episodios de demostración, lo que puede limitar la generalización a posiciones, iluminación o texturas no vistas.
- Tarea específica: el modelo está entrenado únicamente para "pick up bottle from multiple locations and place on mousepad"; no es transferible a otras tareas sin reentrenamiento.
- Dependencia de la cámara: la política requiere la cámara frontal calibrada y con la misma orientación que en el entrenamiento; cambios en la iluminación o el fondo pueden degradar el rendimiento.
- Sin capacidades de lenguaje: no puede interpretar instrucciones verbales ni interactuar con usuarios; es un sistema de control de bajo nivel.
- Riesgo de sobreajuste: con 20.000 pasos y un dataset pequeño, existe riesgo de memorización de las demostraciones en lugar de aprendizaje de una política generalizable.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el hardware y el dataset asociado no tengan restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AliKhoja/so101-act-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/AliKhoja/so101-demo-50_20260829_234547
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de entrenamiento y despliegue: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=AliKhoja/so101-demo-50_20260829_234547

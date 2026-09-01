# sdadasdaga/act-pick-cube-2cam

## Resumen

El modelo `sdadasdaga/act-pick-cube-2cam` es una política robótica basada en el método Action Chunking with Transformers (ACT), entrenada mediante aprendizaje por imitación con la librería LeRobot de Hugging Face. El autor, sdadasdaga (김민준), ha desarrollado este modelo para ejecutar una tarea de recogida y colocación de un cubo (pick-and-place) utilizando dos cámaras como entrada visual. El modelo se ha entrenado sobre el dataset `sdadasdaga/pick-cube-2cam`, que contiene demostraciones teleoperadas de la tarea.

ACT es una arquitectura transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación. Con aproximadamente 51,7 millones de parámetros, este modelo es relativamente ligero y está diseñado para ejecutarse en tiempo real en robots como el SO-100. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT en un escenario de robótica doméstica o de laboratorio, con un pipeline reproducible gracias a LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un codificador-decodificador transformer para predecir un chunk de acciones futuras (por ejemplo, 50 pasos) a partir de observaciones visuales y del estado del robot. A diferencia de los métodos que predicen una sola acción por paso, ACT reduce la acumulación de errores y produce movimientos más suaves y consistentes.

El modelo fue entrenado con la librería LeRobot sobre el dataset `sdadasdaga/pick-cube-2cam`, que contiene demostraciones teleoperadas de la tarea de recoger un cubo y colocarlo en un destino (probablemente un cuenco o zona designada). No se dispone de información detallada sobre el número de episodios, la composición exacta del dataset ni si se aplicaron técnicas de refinamiento como RLHF o DPO, ya que no es un modelo de lenguaje. El entrenamiento se realizó con el script `lerobot-train` de LeRobot, que gestiona el pipeline completo de datos, entrenamiento y registro de checkpoints.

## Capacidades

- Ejecución de tareas de manipulación robótica pick-and-place: el modelo recibe imágenes de dos cámaras y genera comandos de articulación para el brazo robótico.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Predicción de chunks de acciones: genera secuencias de acciones de longitud fija, lo que mejora la fluidez del movimiento.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots como SO-100.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede controlar un brazo robótico para recoger objetos pequeños (cubos) y colocarlos en una posición objetivo, útil en entornos de investigación robótica.
- Prototipado rápido de políticas robóticas: gracias a LeRobot, se puede entrenar y evaluar este modelo en pocas horas con un dataset de 50 demostraciones, ideal para validar conceptos antes de escalar.
- Benchmarking de algoritmos de imitación: sirve como referencia para comparar ACT con otros métodos (p. ej., SmolVLA) en la misma tarea y hardware.
- Educación en robótica: permite a estudiantes y desarrolladores experimentar con aprendizaje por imitación en robots de bajo coste como el SO-100.
- Integración en sistemas de automatización flexible: el modelo puede adaptarse a variaciones de posición del cubo si el dataset incluye dichas variaciones, como se recomienda en la documentación de LeRobot.
- Investigación en visión por computador aplicada a robótica: al usar dos cámaras, el modelo explora la fusión de múltiples vistas para la toma de decisiones, un área activa de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de tasas de éxito, métricas de precisión ni comparaciones cuantitativas con otros modelos en la tarea pick-cube-2cam.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño de 51,7M parámetros, se estima que la inferencia puede ejecutarse en GPUs con 4-6 GB de VRAM en FP32, y menos si se cuantiza (aunque no se ofrecen cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (p. ej., RTX 3060, RTX 4090, A100) es suficiente. Para despliegue en robot, se suele usar una GPU integrada o un Jetson.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo como la RTX 3060 o superiores.
- Opciones de despliegue: LeRobot ofrece scripts de evaluación e inferencia (`lerobot-record`), y el modelo puede ejecutarse en tiempo real con un robot SO-100. También es posible exportar a otros formatos si se requiere.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una latencia baja (del orden de milisegundos) en hardware moderno, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sdadasdaga/act-pick-cube-2cam | 51,7M | ACT (transformer con action chunking) | Pick-and-place de cubo con 2 cámaras | Apache 2.0 | Hugging Face |
| SmolVLA (fine-tuned para SO-101) | ~500M (solo ~50M entrenables) | VLA (vision-language-action) con SigLIP + SmolLM2 | Pick-and-place de cubo (similar) | Apache 2.0 (según documentación) | Hugging Face / LeRobot |
| ACT original (paper 2304.13705) | ~30-80M según configuración | Transformer con action chunking | Tareas de manipulación variadas | Apache 2.0 (implementación de LeRobot) | Código abierto |

La comparación se basa en información pública de LeRobot y el blog de ggando.com. SmolVLA es un modelo más grande y con capacidades multimodales (lenguaje + visión), mientras que ACT es específico para imitación pura. No hay datos de rendimiento comparativo en la misma tarea.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una tarea muy concreta (pick-cube con dos cámaras) y no es generalizable a otras tareas sin reentrenamiento.
- Dependencia del dataset: el rendimiento depende de la calidad y variedad de las demostraciones. Si el dataset no cubre variaciones de posición, el modelo fallará ante cambios no vistos.
- Sin capacidades de lenguaje: no puede interpretar instrucciones verbales ni razonar sobre la tarea.
- Sin datos de robustez: no se han publicado pruebas de robustez ante cambios de iluminación, oclusiones o fallos del robot.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en entornos de producción.
- Sin soporte de cuantización oficial: no se proporcionan versiones GGUF u otras cuantizaciones, lo que puede limitar el despliegue en hardware muy restringido.
- Riesgo de sobreajuste: al ser un modelo pequeño y entrenado con pocas demostraciones (típico en LeRobot), puede sobreajustarse a las condiciones específicas del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sdadasdaga/act-pick-cube-2cam
- Dataset utilizado: https://huggingface.co/datasets/sdadasdaga/pick-cube-2cam
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Blog sobre fine-tuning de SmolVLA para tarea similar: https://ggando.com/blog/smolvla-so101/
- Repositorio de LeRobot: https://github.com/huggingface/lerobot

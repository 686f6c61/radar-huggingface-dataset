# onnzoo/act_cup_on_plate_v3

## Resumen

El modelo `onnzoo/act_cup_on_plate_v3` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario onnzoo y entrenada con el framework LeRobot de Hugging Face. Está diseñada para una tarea concreta de manipulación: colocar una taza sobre un plato, utilizando un robot de tipo `so_follower` con dos cámaras (muñeca y frontal). El modelo aprende mediante imitación a partir de datos teleoperados, prediciendo secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y precisión del movimiento.

Con 51,7 millones de parámetros, es un modelo compacto que procesa observaciones de estado (6 dimensiones) e imágenes RGB de 480x640 píxeles para generar comandos de acción de 6 dimensiones. Su relevancia radica en ser un ejemplo práctico de aplicación de aprendizaje por imitación en robótica real, con una licencia Apache 2.0 que permite su uso y modificación sin restricciones comerciales. Aunque no se han publicado resultados de evaluación, su arquitectura ACT está validada en la literatura (arxiv:2304.13705) y su integración con LeRobot facilita su despliegue en entornos de investigación y desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponibles (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice bloques de acciones (chunks) de longitud fija en lugar de acciones individuales. Esto permite que el modelo genere trayectorias coherentes y reduzca errores acumulativos durante la ejecución. La política combina un codificador de visión (para procesar las imágenes de las cámaras `wrist` y `front`) con un transformador que integra el estado del robot y las características visuales para producir las acciones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset propio (`onnzoo/cup_on_plate_20260819_172758`) que contiene 45 episodios teleoperados, con un total de 29.678 fotogramas a 30 FPS. La configuración de entrenamiento incluyó 15.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de técnicas como RLHF o DPO, ya que es un modelo de imitación pura. La innovación principal reside en la aplicación de ACT a una tarea de manipulación con dos cámaras, demostrando la viabilidad del método en entornos reales.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones (posición y orientación del efector final) para ejecutar la tarea de colocar una taza en un plato.
- Percepción visual multimodal: procesa simultáneamente imágenes de dos cámaras (muñeca y frontal) a resolución 480x640, extrayendo características relevantes para la tarea.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de programación explícita de movimientos.
- Predicción de secuencias de acciones: genera chunks de acciones que permiten movimientos suaves y coordinados, reduciendo la frecuencia de decisiones del controlador.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo herramientas de entrenamiento, evaluación y despliegue.
- Específico para un robot concreto: diseñado para el robot `so_follower`, con entradas de estado y cámaras calibradas según esa plataforma.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en una celda de trabajo donde un robot debe colocar objetos (tazas) en posiciones definidas (platos), reduciendo la intervención humana en líneas de montaje simples.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre tareas similares, ya que su arquitectura ACT es ampliamente utilizada en la comunidad robótica.
- Prototipado rápido de habilidades robóticas: gracias a LeRobot, se puede entrenar y desplegar una política en pocas horas, lo que facilita la validación de nuevas tareas en laboratorios de robótica.
- Demostraciones educativas: el modelo puede utilizarse en cursos de robótica e IA para ilustrar conceptos de aprendizaje por imitación, control basado en visión y transformers aplicados a datos no lingüísticos.
- Benchmarking de algoritmos de imitación: al estar disponible públicamente con su dataset asociado, permite comparar el rendimiento de ACT frente a otros métodos (por ejemplo, Diffusion Policy) en la misma tarea.
- Desarrollo de sistemas de manipulación asistida: en entornos de asistencia a personas con movilidad reducida, un robot equipado con esta política podría realizar tareas domésticas sencillas como colocar objetos en su lugar, aunque requeriría adaptación a otros robots y entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas como tasa de éxito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado el tamaño del modelo (51,7M parámetros) y la entrada de imágenes 480x640, se estima que la inferencia requiere entre 2 y 4 GB de VRAM en FP32, aunque no hay datos confirmados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) debería ser suficiente para inferencia en tiempo real. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100).
- Compatibilidad con GPU de consumo: sí, el modelo es lo bastante pequeño para ejecutarse en GPUs de gama media y baja.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que proporciona scripts de rollout (`lerobot-rollout`) y soporta ejecución en GPU mediante PyTorch. No se mencionan formatos como GGUF o cuantizaciones para despliegue en CPU.
- Latencia y throughput: no disponibles. Al ser un modelo de robótica, la latencia depende del hardware y de la frecuencia de control del robot (típicamente 30-50 Hz).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para esta tarea (colocar una taza en un plato con el robot `so_follower`). En el ámbito de políticas de imitación para robótica, existen alternativas como Diffusion Policy o ACT con diferentes configuraciones, pero no hay datos públicos de comparación con este modelo concreto. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea "Place the cup on the plate" y no generaliza a otras tareas u objetos sin reentrenamiento.
- Dependencia del hardware: requiere el robot `so_follower` específico y las cámaras calibradas con los mismos nombres y resoluciones que en el entrenamiento. Cambios en la configuración del robot o en la iluminación pueden degradar el rendimiento.
- Sin resultados de evaluación: no hay métricas de éxito en el robot real, por lo que su fiabilidad en producción no está demostrada.
- Riesgo de sobreajuste: con solo 45 episodios de entrenamiento, el modelo puede memorizar las demostraciones y fallar ante variaciones en la posición inicial de la taza o el plato.
- Alucinación y sesgos: al ser un modelo de control motor, no aplican los sesgos lingüísticos, pero sí puede presentar comportamientos erráticos si las observaciones difieren de las del entrenamiento.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario debe asegurarse de cumplir con las condiciones de atribución y de no utilizar marcas registradas.
- Formato de pesos: solo safetensors, sin cuantizaciones alternativas, lo que limita el despliegue en hardware con poca memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onnzoo/act_cup_on_plate_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/onnzoo/cup_on_plate_20260819_172758
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation

# Grigorij/Domino_sum_lingbot_2

## Resumen

El modelo `Grigorij/Domino_sum_lingbot_2` es una política robótica de aprendizaje por imitación basada en la arquitectura LingBot-VA, un world-model de video-acción autoregresivo construido sobre el stack de difusión de video Wan2.2. Desarrollado por el usuario Grigorij y publicado en Hugging Face bajo licencia Apache 2.0, este modelo está diseñado para controlar un robot tipo `so_follower` equipado con dos cámaras (frontal y brazo) en la tarea concreta de manipular fichas de dominó sobre una mesa.

El modelo intercala la predicción de latentes de video futuros y acciones del robot en una única secuencia autoregresiva, realimentando los keyframes observados en su caché KV para lograr un world modeling en bucle cerrado. Fue entrenado con el framework LeRobot (versión 0.6.1) sobre un dataset propio de 49 episodios y 64 960 frames a 30 FPS, con dos variantes de la misma tarea de colocación de fichas. Su relevancia radica en ser un ejemplo práctico de aplicación de la arquitectura LingBot-VA a un escenario de manipulación real, aunque su alcance está limitado a la tarea específica para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LingBot-VA (autoregressive video-action world-model sobre Wan2.2 video-diffusion stack) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision-accion, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via LeRobot) |

## Arquitectura y entrenamiento

LingBot-VA es una política autoregresiva que combina la generación de video y el control de acciones en un mismo flujo. A diferencia de los modelos de difusión clásicos que generan toda la secuencia de una vez, LingBot-VA predice de forma iterativa los latentes de video futuros y las acciones del robot, manteniendo un estado interno (KV cache) que se actualiza con los keyframes observados. Esto permite un modelado del mundo en bucle cerrado, donde el modelo utiliza sus propias predicciones como contexto para las siguientes decisiones.

El entrenamiento se realizó con LeRobot sobre el dataset `Grigorij/Domino_sum`, que contiene 49 episodios de manipulación de fichas de dominó con dos cámaras. Se usaron 15 000 pasos de entrenamiento, batch size 1, optimizador AdamW con learning rate 1e-5 y semilla 1000. No se reporta el uso de RLHF, DPO ni técnicas de post-entrenamiento adicionales; es un entrenamiento de imitación supervisada estándar. El modelo recibe dos imágenes de 256x256 píxeles (cámara frontal y cámara de brazo) y produce una acción de 6 dimensiones (probablemente posición y orientación del efector final).

## Capacidades

- Control robótico de manipulación: el modelo genera acciones de 6 grados de libertad para un robot tipo `so_follower`, basándose en observaciones visuales de dos cámaras.
- World modeling en bucle cerrado: al realimentar keyframes observados en su caché KV, el modelo puede razonar sobre el estado futuro de la escena mientras ejecuta acciones.
- Aprendizaje por imitación de tareas específicas: entrenado para agarrar una ficha de dominó y colocarla junto a otra, con dos variantes de la misma tarea.
- Inferencia a 30 FPS (frecuencia de captura del dataset), aunque la velocidad de inferencia real depende del hardware.
- Sin capacidades de lenguaje, vision general o tool calling: es un modelo puramente motor, especializado en la tarea de manipulación para la que fue entrenado.

## Casos de uso

- Automatización de ensamblaje de piezas pequeñas: el modelo puede colocarse en un robot colaborativo para tareas de precisión como colocar componentes electrónicos o piezas mecánicas en posiciones definidas, aprovechando su capacidad de world modeling para ajustar la trayectoria en tiempo real.
- Investigación en aprendizaje por imitación robótica: sirve como referencia para estudiar el comportamiento de la arquitectura LingBot-VA en tareas de manipulación con pocos datos (49 episodios), permitiendo comparar con otras políticas como ACT o Diffusion Policy.
- Desarrollo de sistemas de control visual servoing: su entrada dual de cámaras (frontal y brazo) lo hace adecuado para experimentos donde se necesita feedback visual desde múltiples perspectivas.
- Pruebas de generalización en robótica: aunque el modelo está limitado a una tarea, puede usarse para evaluar la robustez de LingBot-VA ante variaciones de iluminación, posición de objetos o perturbaciones en el entorno.
- Educación y formación en robótica con LeRobot: al estar integrado con el ecosistema LeRobot, puede servir como ejemplo didáctico de entrenamiento y despliegue de políticas robóticas con datasets pequeños.
- Benchmarking de hardware de inferencia: al ser un modelo de video-diffusion autoregresivo, puede utilizarse para medir el rendimiento de GPUs en cargas de trabajo de world modeling en tiempo real, aunque no se dispone de métricas oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No se dispone de métricas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de VRAM, GPU recomendadas o latencia. Dado que la arquitectura se basa en un stack de video-diffusion (Wan2.2), es previsible que requiera al menos una GPU con 16-24 GB de VRAM para inferencia en tiempo real, pero esto es una estimación no confirmada.
- El entrenamiento se realizó con batch size 1, lo que sugiere que una GPU de gama media-alta (por ejemplo, RTX 3090 o superior) podría ser suficiente para entrenamiento, aunque el tiempo de entrenamiento no se especifica.
- Para despliegue, LeRobot ofrece scripts de rollout que se ejecutan en el robot con cámaras conectadas; no se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- No hay datos de throughput o latencia medidos en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. La arquitectura LingBot-VA es relativamente reciente y no se han publicado comparaciones con políticas clásicas como ACT (Action Chunking with Transformers) o Diffusion Policy en el contexto de este repositorio. Se recomienda consultar el repositorio oficial de LingBot-VA para posibles benchmarks, aunque no se han incluido en la información disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (49 episodios), lo que limita la generalización a variaciones significativas de la tarea, objetos o entornos.
- Sin resultados de evaluación: no hay evidencia de que la política funcione de forma fiable en el robot real; el usuario debe validarla antes de cualquier uso en producción.
- Tarea específica: el modelo solo fue entrenado para dos variantes de una tarea de colocación de fichas de dominó; no es transferible a otras tareas sin reentrenamiento.
- Riesgo de alucinación visual: al ser un modelo generativo de video, puede predecir estados futuros inexactos, lo que podría provocar acciones erróneas si el world model falla.
- Sin soporte de lenguaje: no puede interpretar instrucciones en lenguaje natural ni responder a comandos de voz.
- Dependencia del hardware del robot: las cámaras y el robot deben coincidir con las especificaciones de entrenamiento (tipo `so_follower`, dos cámaras, resolución 256x256) para que la política funcione correctamente.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin soporte oficial.

## Enlaces

- Repositorio del modelo en Hugging Face: [Grigorij/Domino_sum_lingbot_2](https://huggingface.co/Grigorij/Domino_sum_lingbot_2)
- Dataset de entrenamiento: [Grigorij/Domino_sum](https://huggingface.co/datasets/Grigorij/Domino_sum)
- Repositorio oficial de LingBot-VA en GitHub: [Robbyant/lingbot-va](https://github.com/Robbyant/lingbot-va)
- Documentación de LeRobot sobre LingBot-VA: [LeRobot lingbot_va guide](https://huggingface.co/docs/lerobot/main/en/lingbot_va)
- Repositorio de LeRobot: [huggingface/lerobot](https://github.com/huggingface/lerobot)

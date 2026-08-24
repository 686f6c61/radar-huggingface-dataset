# rkdals2779/shin_pick_and_place_260626_1_act_policy

## Resumen

El modelo `rkdals2779/shin_pick_and_place_260626_1_act_policy` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario rkdals2779 y publicada bajo licencia Apache 2.0. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto en tareas de manipulación. Este modelo concreto está entrenado para una tarea de pick and place (recoger y colocar) sobre un robot tipo `so_follower`, utilizando dos cámaras (superior y de muñeca) y el estado del robot como entradas.

Con 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero y adecuado para entornos con recursos limitados. Se ha entrenado con 100 episodios teleoperados (111.310 fotogramas a 30 FPS) y 1.000 pasos de optimización, lo que lo convierte en un ejemplo práctico de entrenamiento rápido con LeRobot. Su relevancia radica en que demuestra cómo aplicar ACT a tareas de manipulación reales con un coste computacional bajo, siendo un punto de partida útil para desarrolladores e investigadores que trabajan en robótica de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, descrita en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). ACT utiliza un transformer que procesa observaciones multimodales (imágenes de dos cámaras y estado del robot) y genera un chunk de acciones futuras, lo que reduce la acumulación de errores en comparación con políticas que predicen un solo paso. El entrenamiento se realizó mediante aprendizaje por imitación a partir de demostraciones teleoperadas, sin etapas de RLHF o DPO.

Los datos de entrenamiento provienen del dataset `rkdals2779/shin_pick_and_place_260626_1`, que contiene 100 episodios y 111.310 fotogramas a 30 FPS. La configuración de entrenamiento incluye 1.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000, todo ello bajo la versión 0.6.0 de LeRobot. No se especifican innovaciones técnicas adicionales más allá de las propias de ACT.

## Capacidades

- Control robótico para tareas de pick and place, prediciendo acciones de 6 dimensiones (probablemente posiciones o velocidades del efector).
- Procesamiento de observaciones multimodales: imágenes de dos cámaras (superior y de muñeca) con resolución 480x640 y estado del robot de 6 dimensiones.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, lo que permite reproducir comportamientos complejos sin programación explícita.
- Inferencia en tiempo real a 30 FPS, compatible con el flujo de trabajo de LeRobot.
- No incluye capacidades de lenguaje natural, tool calling, razonamiento simbólico ni procesamiento de texto.

## Casos de uso

- Automatización de líneas de montaje: el modelo puede controlar un robot para recoger piezas de una cinta y colocarlas en posiciones determinadas, reduciendo la intervención manual en entornos industriales.
- Clasificación de objetos: combinado con un sistema de visión, puede separar objetos según su tipo o color, siempre que la tarea de pick and place esté definida en el dataset de entrenamiento.
- Manipulación en entornos de investigación: sirve como base para estudiar técnicas de aprendizaje por imitación, comparar estrategias de chunking o evaluar la transferencia entre robots.
- Prototipado rápido con LeRobot: al ser un modelo pequeño y entrenado con pocos datos, es ideal para validar pipelines de captura de datos, entrenamiento y despliegue en robots de bajo coste.
- Robótica educativa: puede utilizarse en cursos o talleres para demostrar conceptos de aprendizaje por imitación y control de robots sin necesidad de hardware de gama alta.
- Integración en sistemas de automatización flexible: el modelo puede reentrenarse con nuevos datos para adaptarse a tareas similares, como apilar piezas o insertar componentes, siempre que se mantenga la misma configuración de cámaras y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM. Dado el tamaño del modelo (51,67 millones de parámetros), se estima que la inferencia puede ejecutarse en GPUs con 2-4 GB de VRAM, aunque no hay confirmación oficial.
- El modelo está diseñado para ejecutarse con LeRobot, que requiere un robot `so_follower` y dos cámaras (superior y de muñeca) con resolución 640x480 y 30 FPS.
- Opciones de despliegue: la inferencia se realiza mediante el script `lerobot-rollout` de LeRobot, que gestiona la captura de imágenes, el procesamiento y el envío de acciones al robot. No se mencionan alternativas como vLLM u Ollama, ya que no es un modelo de lenguaje.
- Al ser un modelo pequeño, es probable que funcione en GPUs consumer como RTX 3060 o superiores, pero no hay datos de latencia o throughput publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de robótica con ACT). La búsqueda web solo encontró un modelo similar de otro usuario (Dcadf/shin_pick_and_place_260626_1_act), pero sin datos técnicos adicionales. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea de pick and place con un robot `so_follower` y una configuración de cámaras específica. No generaliza a otros robots, tareas o disposiciones de cámaras sin reentrenamiento.
- No se han proporcionado resultados de evaluación en el mundo real, por lo que se desconoce su tasa de éxito y robustez ante variaciones de iluminación, posición de objetos o distracciones.
- El dataset de entrenamiento tiene una descripción de tarea nula (`TASK_DESCRIPTION: None`), lo que sugiere que la tarea no está formalmente definida y podría haber ambigüedad en las demostraciones.
- Riesgo de sobreajuste: con solo 100 episodios y 1.000 pasos de entrenamiento, el modelo podría memorizar las demostraciones y fallar ante situaciones no vistas.
- No tiene capacidades de procesamiento de lenguaje, por lo que no es adecuado para tareas que requieran comprensión de instrucciones verbales o texto.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la atribución adecuada y las condiciones de la licencia para el código y los datos asociados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/rkdals2779/shin_pick_and_place_260626_1_act_policy)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Dataset de entrenamiento](https://huggingface.co/datasets/rkdals2779/shin_pick_and_place_260626_1)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)

# Mrenaal/act_item_in_box

## Resumen

El modelo `Mrenaal/act_item_in_box` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Ha sido desarrollado por Mrenaal y entrenado con la librería LeRobot de Hugging Face, utilizando un dataset de demostraciones teleoperadas de un robot seguidor. El problema que resuelve es la ejecución autónoma de tareas de manipulación, en concreto recoger un objeto y depositarlo en una caja de plástico, a partir de observaciones de estado y de una cámara frontal.

La arquitectura ACT combina un codificador transformer para las imágenes con un decodificador que genera chunks de acciones de seis dimensiones. El modelo tiene 51.668.614 parámetros y está publicado en formato safetensors, con un tamaño de repositorio de 0.2 GB. No se trata de un modelo de lenguaje, por lo que la longitud de contexto no aplica. Su relevancia radica en ser un ejemplo práctico de política de imitación desplegable con LeRobot, útil para investigadores y desarrolladores que trabajan en robótica y aprendizaje por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (politica de robot, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, presentada en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware". ACT es un método de aprendizaje por imitación que utiliza un transformer para predecir chunks de acciones, lo que permite generar movimientos más fluidos y robustos que la predicción de un único paso. La política consume como entradas el estado del robot (`observation.state` de dimensión 6) y una imagen de la cámara frontal (`observation.images.front` de 3x480x640), y produce una acción de 6 dimensiones.

Ha sido entrenado con el dataset `Mrenaal/item_in_box_20260913_173844`, compuesto por 50 episodios y 18.489 frames a 30 FPS, para la tarea "Pick up the item and drop it into the plastic box". La configuración de entrenamiento incluye 50.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000, utilizando la versión 0.6.2 de LeRobot. No se han aplicado técnicas de RLHF ni DPO, ya que se trata de un modelo de política de robot entrenado por imitación.

## Capacidades

- Control de robot por imitación: predice chunks de acciones de 6 dimensiones a partir de observaciones de estado e imágenes.
- Percepción visual: procesa imágenes de 480x640 píxeles de una cámara frontal.
- Ejecución de tareas de manipulación: entrenado específicamente para recoger un objeto y dejarlo en una caja de plástico.
- Integración con LeRobot: diseñado para funcionar con la librería LeRobot, tanto para entrenamiento como para inferencia mediante `lerobot-rollout` y `lerobot-train`.
- Inferencia en tiempo real: el dataset de entrenamiento se registró a 30 FPS, lo que sugiere que la política puede operar a esa frecuencia.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Automatización de tareas de pick-and-place: el modelo puede desplegarse en un robot con brazo para ejecutar de forma autónoma la tarea de recoger un objeto y depositarlo en una caja, reduciendo la intervención humana en procesos repetitivos.
- Investigación en aprendizaje por imitación: sirve como referencia para comparar políticas ACT entrenadas con LeRobot, permitiendo estudiar el efecto del número de episodios, la configuración de entrenamiento o la arquitectura en el rendimiento.
- Prototipado rápido en robótica: al estar publicado en el Hub y ser compatible con LeRobot, investigadores y desarrolladores pueden cargar la política y ejecutarla en un robot compatible sin necesidad de reentrenar desde cero.
- Integración en pipelines de LeRobot: puede usarse como punto de partida para entrenar variaciones de la tarea, ajustando el dataset o los hiperparámetros mediante el comando `lerobot-train`.
- Demostraciones educativas: en cursos de robótica, el modelo ilustra el flujo completo de LeRobot, desde la recogida de datos teleoperados hasta el despliegue de una política entrenada.
- Evaluación de políticas en entornos controlados: el modelo puede ejecutarse en un robot "so_follower" para medir la tasa de éxito en la tarea de pick-and-place bajo diferentes condiciones de iluminación, posición o distracciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: el modelo tiene 51.6 millones de parámetros y ocupa 0.2 GB en formato safetensors, por lo que es probable que pueda ejecutarse en GPU de consumo, pero no se han publicado requisitos oficiales de VRAM.
- Opciones de despliegue: LeRobot (inferencia con `lerobot-rollout`, entrenamiento con `lerobot-train`). También puede cargarse directamente con PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado datos de rendimiento, parámetros ni licencias de alternativas de la misma categoría.

## Limitaciones y advertencias

- Dataset de entrenamiento limitado: el modelo se entrenó con solo 50 episodios, lo que puede afectar a la generalización a nuevas posiciones, iluminación o distracciones.
- Sin resultados de evaluación publicados: no se conoce la tasa de éxito real de la política en el robot.
- Especificidad del robot: la política está diseñada para el robot "so_follower" y la configuración de cámara frontal; puede no funcionar con otros robots o sensores.
- Tarea concreta: el modelo solo ha sido entrenado para la tarea de recoger y colocar un objeto en una caja; no es capaz de ejecutar tareas fuera de ese comportamiento.
- Riesgo de fallos en entornos no vistos: al ser un modelo de imitación, puede fallar ante variaciones no representadas en el dataset de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero se debe citar el método ACT y la librería LeRobot en caso de utilización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mrenaal/act_item_in_box
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Dataset de entrenamiento: https://huggingface.co/datasets/Mrenaal/item_in_box_20260913_173844

# OrderDraconis/act_pickplace_leo_c30

## Resumen

El modelo `act_pickplace_leo_c30` es una política de imitación basada en Action Chunking with Transformers (ACT), desarrollada por Leo Guillier (usuario `OrderDraconis`) y publicada en Hugging Face. Está entrenada para que un robot manipulador de tipo `bi_so_follower` realice la tarea de recoger una pieza de tela superior y colocarla en un cuadrado objetivo. El modelo consume tres imágenes de cámara (480x640 píxeles) y un vector de estado de 12 dimensiones, y produce acciones de 12 dimensiones en bloques de 10 pasos (chunking).

El modelo se ha entrenado con LeRobot v0.6.0 sobre el dataset `Pink-Viking/pick_and_place_combined`, que contiene 122 episodios y 96.339 fotogramas a 30 FPS. Con 51,6 millones de parámetros, es un modelo compacto orientado a despliegue en robots reales, no a generación de texto. Su relevancia radica en ser un ejemplo de política de manipulación lista para usar con LeRobot, reproducible y con licencia Apache 2.0, lo que facilita su integración en proyectos de robótica de investigación y prototipado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) — transformer con codificador-decodificador y CVAE |
| Parámetros totales | 51.609.228 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica; acción en bloques de 10 pasos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice bloques de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del movimiento. La arquitectura combina un autoencoder variacional condicional (CVAE) con un transformer de tipo encoder-decoder: el encoder procesa las observaciones visuales (tres imágenes) y el estado del robot, mientras que el decoder genera secuencias de acciones de 10 pasos. El entrenamiento se realiza con datos teleoperados mediante el framework LeRobot.

El modelo fue entrenado durante 100.000 pasos con un tamaño de lote de 48, optimizador AdamW y una tasa de aprendizaje de 3e-05, con semilla 1000. El dataset de entrenamiento contiene 122 episodios y 96.339 fotogramas a 30 FPS, todos centrados en la tarea de recoger la pieza de tela superior y colocarla en el cuadrado objetivo. No se han aplicado técnicas de RLHF ni DPO; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Generación de acciones de manipulación robótica: el modelo produce vectores de acción de 12 dimensiones (posición, orientación y posiblemente fuerza) para controlar el robot `bi_so_follower`.
- Procesamiento multimodal: integra tres flujos de visión (cámaras `left_left_jaw`, `right_right_jaw`, `right_topdown`) junto con el estado del robot para tomar decisiones.
- Aprendizaje de tareas de pick-and-place: especializado en la tarea de recoger una pieza de tela superior y colocarla en una zona objetivo.
- Ejecución en tiempo real: el chunking de acciones permite una ejecución fluida a 30 FPS sin necesidad de replanificar cada paso.
- Compatibilidad con LeRobot: se puede ejecutar directamente con `lerobot-rollout` en un robot real o simulado.
- No soporta tool calling, agentes, razonamiento de lenguaje ni capacidades multilingües; es un modelo puramente de control motor.

## Casos de uso

- Manipulación de telas en entornos industriales: el modelo puede automatizar la colocación de piezas textiles en posiciones definidas, útil en líneas de corte o doblado.
- Prototipado de políticas de imitación: sirve como base para entrenar variantes con más datos o con diferentes configuraciones de cámaras mediante LeRobot.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del chunking en la estabilidad de tareas de precisión con deformables.
- Despliegue en robots de bajo coste: al tener solo 51,6 millones de parámetros, puede ejecutarse en hardware modesto (por ejemplo, una GPU de gama media) en tiempo real.
- Evaluación de robustez visual: al usar tres cámaras, es útil para probar cómo afectan cambios de iluminación o perspectiva al rendimiento de la política.
- Formación de operarios mediante teleoperación: el modelo puede reproducir trayectorias demostradas por un humano, reduciendo el tiempo de programación de tareas repetitivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica que no hay resultados de evaluación en robot real para esta política todavía.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 51,6 millones de parámetros; en FP32 ocupa aproximadamente 206 MB. Con las imágenes de entrada (3x480x640), el consumo de VRAM total en inferencia es de unos 1-2 GB, dependiendo del lote y de la implementación.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060, RTX 4090). También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: sí, cabe en cualquier GPU consumer moderna sin necesidad de hardware especializado.
- Opciones de despliegue: LeRobot proporciona el script `lerobot-rollout` para ejecutar la política en robot real o simulado. No hay soporte nativo para vLLM, Ollama o llama.cpp, ya que no es un modelo de lenguaje.
- Latencia y throughput: no hay datos publicados; en una GPU como RTX 3060, se espera una inferencia de 30 FPS (dado el entrenamiento a 30 FPS), pero el valor exacto no está disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/Chunking | Tarea | Licencia |
|---|---|---|---|---|
| `act_pickplace_leo_c30` (este) | 51,6 M | Chunk de 10 pasos | Pick-and-place de tela | Apache 2.0 |
| `OrderDraconis/act_pickplace_leo_c100` | no disponible | Chunk de 100 pasos | Pick-and-place de tela | Apache 2.0 |
| ACT original (paper) | ~80 M (aprox.) | Chunk de 10-100 pasos | Tareas de manipulación (ALOHA) | Apache 2.0 |

No hay disponibles modelos comparables de la misma categoría con datos públicos de rendimiento en esta tarea específica. El modelo `c100` de la misma autora es una variante con un chunk más largo, pero no se dispone de sus especificaciones técnicas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado exclusivamente con datos teleoperados de una única configuración de robot y cámaras; puede no generalizar a otros robots o disposiciones de cámaras.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; pero el modelo puede producir acciones incorrectas si las observaciones difieren de las del entrenamiento (cambios de iluminación, objetos nuevos).
- Limitaciones de contexto: la política no maneja contexto de lenguaje ni instrucciones; está fijada a la tarea "pick up the upper piece of fabric and place it in the target square".
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se recomienda citar el método ACT y LeRobot según la model card.
- Caveat para producción: no se han reportado evaluaciones en robot real; es necesario validar la tasa de éxito en el entorno objetivo antes de un despliegue crítico. El modelo requiere calibración de cámaras y del puerto del robot para funcionar correctamente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/OrderDraconis/act_pickplace_leo_c30)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Pink-Viking/pick_and_place_combined)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=Pink-Viking/pick_and_place_combined)
- [Paper de ACT](https://huggingface.co/papers/2304.13705)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Perfil del autor](https://huggingface.co/OrderDraconis)

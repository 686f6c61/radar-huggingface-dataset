# marko863/act_cube_in_box

## Resumen

El modelo `marko863/act_cube_in_box` es una política de control robótico entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), desarrollado por el usuario marko863 y publicado en Hugging Face bajo la librería LeRobot. ACT predice secuencias cortas de acciones en lugar de pasos individuales, lo que permite al robot ejecutar tareas de manipulación con mayor estabilidad y precisión. Este modelo concreto está especializado en la tarea de colocar un cubo dentro de una caja, utilizando un robot Seeed B601 (follower) con dos cámaras (frontal y de muñeca).

El modelo cuenta con 51.670.663 parámetros en formato safetensors y ha sido entrenado con 55 episodios teleoperados, sumando 102.226 fotogramas a 30 FPS. Su relevancia radica en ser un ejemplo práctico de despliegue de políticas de imitación en robótica real, accesible para la comunidad gracias a su licencia Apache 2.0 y su integración con el ecosistema LeRobot. No se trata de un modelo de lenguaje, sino de un sistema de control específico para un entorno robótico concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.670.663 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT, descrita en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, genera un "chunk" o secuencia de acciones futuras. Esto reduce la acumulación de errores y mejora la suavidad del movimiento en tareas de manipulación. El modelo recibe como entrada el estado del robot (7 dimensiones) y dos imágenes RGB de 480x640 píxeles procedentes de las cámaras frontal y de muñeca. La salida es un vector de acción de 7 dimensiones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `marko863/cube_in_box`, que contiene 55 episodios teleoperados con un total de 102.226 fotogramas a 30 FPS. La configuración de entrenamiento incluye 50.000 pasos, tamaño de lote 8, optimizador AdamW con una tasa de aprendizaje de 1e-5 y semilla 1000. No se ha publicado información sobre el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de control robótico, no de un modelo de lenguaje.

## Capacidades

- Control robótico de precisión: genera acciones de 7 dimensiones (probablemente posiciones y orientaciones del efector final) para manipular objetos.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Procesamiento de visión: utiliza dos cámaras (frontal y de muñeca) para percibir el entorno.
- Ejecución de tareas específicas: está entrenado exclusivamente para la tarea "Put the cube in the box" (poner el cubo en la caja).
- Integración con LeRobot: compatible con el ecosistema de herramientas de entrenamiento y despliegue de LeRobot.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes conversacionales, ni capacidades multilingües.

## Casos de uso

- Automatización de tareas de picking and placing en entornos industriales: el modelo puede integrarse en una celda robótica para colocar piezas en contenedores, reduciendo la intervención manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre robots o la robustez frente a variaciones de iluminación y posición.
- Prototipado rápido de aplicaciones robóticas con LeRobot: los desarrolladores pueden usar este modelo como referencia para entrenar sus propias políticas con el mismo pipeline.
- Demostraciones educativas en robótica: permite a estudiantes y formadores mostrar un ciclo completo de teleoperación, entrenamiento y despliegue de una política.
- Evaluación de hardware robótico: útil para validar el funcionamiento del robot Seeed B601 y sus cámaras antes de abordar tareas más complejas.
- Benchmarking de algoritmos de imitación: al ser un modelo pequeño y bien documentado, puede emplearse como caso de prueba para comparar ACT con otros métodos como Diffusion Policy o VQ-BeT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de éxito ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la documentación del modelo.
- Dado el tamaño del modelo (51,7 M de parámetros) y la entrada de imágenes de 480x640, se estima que una GPU con al menos 4 GB de VRAM podría ejecutar la inferencia en tiempo real, aunque esta cifra es orientativa y no confirmada por el autor.
- El despliegue se realiza mediante la CLI de LeRobot (`lerobot-rollout`), que requiere el robot Seeed B601 y las cámaras configuradas.
- Para el entrenamiento, se recomienda una GPU con capacidad suficiente para procesar lotes de 8 con imágenes de alta resolución; una RTX 3060 o superior sería razonable, pero no hay datos oficiales.
- No se mencionan opciones de cuantización ni despliegue en CPU, aunque al ser un modelo pequeño podría ejecutarse en CPU con baja latencia, pero no está documentado.

## Comparativa con modelos similares

Existen otros modelos en Hugging Face con la misma tarea y arquitectura, como `MichaelP719/cube_in_box_act2` y `EPITECH-LILLE/act_cube_in_box`, pero no se dispone de información detallada sobre sus parámetros, rendimiento o configuración. Por tanto, no es posible realizar una comparación cuantitativa. Se recomienda consultar directamente sus respectivas model cards para obtener datos adicionales.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación en robot real, por lo que se desconoce la tasa de éxito real del modelo.
- El modelo está entrenado únicamente para la tarea específica de poner un cubo en una caja; no es generalizable a otras tareas sin reentrenamiento.
- Depende de la configuración exacta del robot (Seeed B601) y de las cámaras (frontal y de muñeca) con las que se entrenó. Cambios en la posición de las cámaras o en el robot pueden degradar el rendimiento.
- No es un modelo de lenguaje, por lo que no debe utilizarse para tareas de generación de texto o conversación.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se distribuye tal cual, sin garantías de rendimiento en entornos de producción.
- El dataset de entrenamiento es limitado (55 episodios), lo que puede provocar sobreajuste a las condiciones específicas de las demostraciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/marko863/act_cube_in_box)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Dataset de entrenamiento](https://huggingface.co/datasets/marko863/cube_in_box)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)

# SamarC/act_so101_pick_block

## Resumen

El modelo `SamarC/act_so101_pick_block` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido desarrollado por SamarC utilizando el framework LeRobot de Hugging Face y está entrenado para controlar un robot tipo `so_follower` en la tarea específica de recoger un bloque y colocarlo en un cuenco.

La política consume observaciones de estado (6 dimensiones) y una imagen RGB de una cámara frontal (480x640) y genera acciones de control de 6 dimensiones. El modelo tiene aproximadamente 51,7 millones de parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 0,2 GB. Está publicado bajo licencia Apache 2.0 y su relevancia radica en servir como ejemplo práctico de entrenamiento de políticas ACT con LeRobot, además de ser un punto de partida para investigaciones en manipulación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT (Action Chunking with Transformers), que combina un encoder de vision con un transformer decoder para generar "chunks" de acciones de forma autoregresiva. Esta técnica reduce el error acumulativo típico de las políticas que predicen un solo paso, mejorando la estabilidad en tareas de manipulación. En este caso, el modelo recibe como entradas un vector de estado de 6 dimensiones y una imagen frontal de 480x640, y produce una acción de 6 dimensiones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `SamarC/so101_pick_block`, compuesto por 8 episodios y 13.098 frames a 30 FPS. La tarea consiste en "Pick up the block and put it in the bowl". La configuración de entrenamiento incluye 20.000 pasos, tamaño de lote 8, optimizador AdamW con tasa de aprendizaje 1e-5 y semilla 1000. No se han proporcionado detalles sobre el uso de RLHF o DPO, ya que se trata de un método de aprendizaje por imitación a partir de datos teleoperados.

## Capacidades

- Genera acciones de control de 6 dimensiones para el robot `so_follower` en tareas de manipulación.
- Procesa observaciones de estado (6 dimensiones) y una imagen RGB frontal de 480x640 píxeles.
- Realiza la tarea específica de recoger un bloque y colocarlo en un cuenco.
- Entrenado mediante aprendizaje por imitación con datos teleoperados.
- Integrable con el framework LeRobot para ejecutar políticas (`lerobot-rollout`) y reentrenar sobre nuevos datos.
- No es un modelo de lenguaje: no soporta tool calling, razonamiento simbólico ni generación de texto.
- No dispone de capacidades de visión generales más allá de la entrada de imagen específica para la tarea.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorios: el modelo controla el robot `so_follower` para recoger un bloque y depositarlo en un cuenco, utilizando la cámara frontal como entrada visual.
- Investigación en aprendizaje por imitación: sirve como ejemplo de política ACT entrenada con LeRobot para estudiar el método y comparar con otras arquitecturas de control.
- Prototipado de políticas robóticas: al ser un modelo relativamente pequeño (51M parámetros), permite iterar rápidamente en entrenamiento y evaluación en entornos de laboratorio.
- Integración en pipelines de LeRobot: puede utilizarse como punto de partida para entrenar políticas personalizadas sobre el mismo tipo de robot y cámaras.
- Validación de hardware robótico: se puede desplegar para comprobar el funcionamiento del robot `so_follower`, sus cámaras y la comunicación con el framework.
- Demostraciones y docencia: sirve como modelo de referencia para enseñar el flujo completo de LeRobot, desde el dataset hasta el rollout en un robot real.
- Base para transferencia de tareas: aunque es específico, puede emplearse como inicialización para políticas en tareas similares de manipulación con el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no se dispone de datos oficiales. Dado el tamaño de los pesos (0,2 GB en safetensors), se estima que una GPU con 4 GB de VRAM es suficiente para la inferencia.
- GPU recomendadas: RTX 3060 o superior. El modelo puede ejecutarse en GPUs de consumo, aunque también es posible probar en CPU con tiempos de respuesta mayores.
- Compatibilidad con hardware de consumo: sí, por su tamaño reducido.
- Opciones de despliegue: LeRobot y PyTorch. No se han documentado integraciones con vLLM, llama.cpp o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado modelos comparables con especificaciones detalladas en la informacion proporcionada. En la búsqueda web se localizó un repositorio similar (`sahilapage/act_so101_pick_block_bowl`), pero no se dispone de sus datos técnicos para establecer una comparación formal.

## Limitaciones y advertencias

- El modelo está entrenado con solo 8 episodios, lo que puede provocar sobreajuste a las condiciones específicas del dataset.
- No se han proporcionado resultados de evaluación en robot real, por lo que no se conoce su tasa de éxito.
- Está limitado a la tarea de recoger un bloque y ponerlo en un cuenco, con una cámara frontal concreta y un robot `so_follower`.
- No generaliza a otras tareas, objetos, posiciones de cámara o tipos de robot sin reentrenamiento.
- No es un modelo de lenguaje, por lo que no puede utilizarse en aplicaciones de NLP ni procesamiento de texto.
- La licencia Apache 2.0 permite uso comercial, pero la especificidad del modelo limita su aplicabilidad fuera del contexto robótico descrito.

## Enlaces

- Repositorio del modelo: https://huggingface.co/SamarC/act_so101_pick_block
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/SamarC/so101_pick_block
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act

# dobei/smolvla_test_2cam

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado originalmente por Hugging Face y publicado en el paper arXiv:2506.01844. El repositorio `dobei/smolvla_test_2cam` es un fine-tuning de `lerobot/smolvla_base` orientado a una tarea robótica concreta de tipo "pick and place" sobre un robot SO-101 (SoFollower), entrenado con la librería LeRobot 0.7.1. El modelo consume observaciones multimodales (estado articular de 6 dimensiones y tres cámaras de 256x256) y produce un vector de acción de 6 dimensiones, lo que lo convierte en una política de imitación end-to-end para control robótico.

Con 450.046.176 parámetros (aproximadamente 450 millones) y un tamaño de repositorio de 0,9 GB en formato safetensors, SmolVLA está diseñado para ejecutarse en hardware de consumo, a diferencia de los VLA de gran escala que requieren clústeres de GPU. Su relevancia actual radica en que democratiza el entrenamiento y despliegue de políticas robóticas: cualquier desarrollador con un SO-101 y una GPU consumer puede ajustar y ejecutar el modelo.

Este repositorio concreto es, sin embargo, un artefacto de prueba: solo 10 pasos de entrenamiento con batch size 4 sobre un dataset de 25 episodios y 11.286 frames, sin resultados de evaluación publicados. Debe tratarse como una demostración técnica del flujo de trabajo de LeRobot, no como una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto general) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Libreria | lerobot 0.7.1 |
| Tipo de robot | so_follower (SO-101) |
| Entradas | observation.state (6,), 3 imagenes (3, 256, 256) |
| Salidas | action (6,) |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para producir comandos motores directamente a partir de observaciones visuales y propioceptivas. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face y descrito en el paper arXiv:2506.01844, que enfatiza el rendimiento competitivo con costes computacionales reducidos y despliegue en hardware de consumo. La política consume tres cámaras (`scene`, `wrist` y una tercera) a 256x256 píxeles y un vector de estado de 6 dimensiones, y emite un vector de acción de 6 dimensiones.

El fine-tuning de este repositorio se realizó con LeRobot 0.7.1 sobre el dataset `dobei/so101_red_cube_blue_box_2_20261117_161737`, compuesto por 25 episodios, 11.286 frames a 30 FPS y una única tarea ("pick and place"). La configuración de entrenamiento es mínima: 10 pasos, batch size 4, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta uso de RLHF, DPO ni ninguna innovación técnica adicional más allá de la propia arquitectura SmolVLA. El número tan reducido de pasos sugiere que el objetivo era validar el pipeline de entrenamiento, no obtener una política funcional.

## Capacidades

- Control robótico de imitación end-to-end: mapea observaciones visuales y de estado articular a acciones de 6 dimensiones para un robot SO-101.
- Percepción multimodal: procesa simultáneamente tres flujos de cámara a 256x256 y el estado de las articulaciones.
- Ejecución de una tarea específica de "pick and place" (recoger y colocar) sobre objetos (cubo rojo, caja azul) en el entorno de entrenamiento.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train`.
- Despliegue en hardware de consumo según las características del modelo base.
- No soporta tool calling, agentes multi-paso, generación de texto general ni capacidades multilingües: es una política robótica, no un LLM conversacional.

## Casos de uso

- Prototipado de pipelines de imitación robótica: sirve como plantilla para verificar que la cadena de grabación de datos, entrenamiento y despliegue con LeRobot funciona correctamente antes de invertir en un entrenamiento largo.
- Manipulación pick-and-place en el SO-101: el modelo puede ejecutar la tarea "pick and place" sobre el cubo rojo y la caja azul para la que fue ajustado, siempre que el entorno coincida con el del dataset.
- Docencia e investigación en VLA: permite a estudiantes y grupos de investigación experimentar con un VLA real de 450M de parámetros en una GPU consumer, sin necesidad de infraestructura de clúster.
- Recolección de datos y evaluación comparativa: útil como baseline de referencia para medir la mejora al aumentar episodios, pasos de entrenamiento o variabilidad de escenas.
- Pruebas de integración con hardware SO-101: valida la configuración de cámaras, puertos y calibración del robot mediante `lerobot-rollout` con `--strategy.type=base`.
- Punto de partida para fine-tuning específico: al derivar de `lerobot/smolvla_base`, puede reentrenarse con un dataset propio más amplio para tareas de manipulación concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real, ni de métricas de pérdida de entrenamiento, ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450M de parámetros, en FP32 (aproximadamente 1,8 GB de pesos) más overhead de activaciones y tres flujos de cámara, se estima un consumo del orden de 3-6 GB, aunque esta cifra no está confirmada en la documentación.
- GPU recomendadas: el modelo base está diseñado para hardware de consumo; una RTX 3060/4060 o superior debería bastar para inferencia. Para entrenamiento se recomienda al menos una RTX 3090/4090.
- Cabe en GPU consumer: sí, según la descripción del modelo base ("can be deployed on consumer-grade hardware").
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de dispositivo CUDA (`--policy.device=cuda`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles. La inferencia debe ejecutarse a la frecuencia de control del robot (el dataset se grabó a 30 FPS), pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dobei/smolvla_test_2cam | 450M | no disponible | Pick and place SO-101 | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | VLA base multi-tarea | apache-2.0 | Hugging Face |
| OpenVLA | no disponible en la informacion proporcionada | no disponible | VLA generalista | no disponible | no disponible |
| RT-2 | no disponible en la informacion proporcionada | no disponible | VLA generalista | no disponible | no disponible |

La comparación cuantitativa con OpenVLA o RT-2 no puede realizarse con la información disponible. La diferencia clave de este repositorio frente a `lerobot/smolvla_base` es que está especializado en una única tarea y robot, mientras que el base es un punto de partida generalista.

## Limitaciones y advertencias

- Entrenamiento insuficiente: solo 10 pasos con batch size 4, lo que en la práctica no permite converger; la política probablemente no ejecute la tarea de forma fiable.
- Sin evaluación: no hay tasas de éxito publicadas, por lo que se desconoce su rendimiento real en robot.
- Dataset muy pequeño: 25 episodios y 11.286 frames limitan la generalización a posiciones, iluminación y objetos distintos de los del entrenamiento.
- Sobreadaptación al entorno: cualquier cambio en la disposición de cámaras, la iluminación o los objetos (cubo rojo, caja azul) degradará el comportamiento.
- Dependencia de hardware específico: requiere un robot SO-101 (so_follower) y tres cámaras configuradas con los nombres exactos del dataset.
- Sin capacidades de lenguaje general: no debe usarse para texto, código ni conversación; los tags de idioma no están disponibles porque no aplica.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones plausibles pero incorrectas fuera de la distribución de entrenamiento, con riesgo físico para el robot y el entorno.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en producción exige reentrenamiento y validación propios.
- Artefacto de prueba: el nombre `test_2cam` y la configuración mínima indican que es una demostración, no un modelo listo para despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dobei/smolvla_test_2cam
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/dobei/so101_red_cube_blue_box_2_20261117_161737
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=dobei/so101_red_cube_blue_box_2_20261117_161737

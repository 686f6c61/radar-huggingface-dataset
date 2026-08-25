# akimaru/3cam_act_so101

## Resumen

El modelo `akimaru/3cam_act_so101` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido desarrollado por Sara Akimaru y publicado en Hugging Face utilizando la librería LeRobot, el framework de aprendizaje por imitación de Hugging Face para robots reales.

El modelo está diseñado para controlar un brazo robótico SO-101 en la tarea de recoger y colocar objetos para clasificarlos (Pick and place objects to sort them). Su relevancia radica en que es un ejemplo práctico de cómo aplicar ACT con tres cámaras de entrada (frontal, lateral y diagonal) para tareas de manipulación en robótica, un campo donde la transferencia de políticas entrenadas en simulación a robots reales sigue siendo un desafío.

La arquitectura del modelo es un Transformer con 51,7 millones de parámetros, entrenado sobre 70 episodios teleoperados con un total de 34.777 fotogramas a 30 FPS. El modelo se distribuye bajo licencia Apache 2.0 y su formato de pesos es safetensors, compatible con el ecosistema LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **Action Chunking with Transformers (ACT)**, presentada en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, predice un "trozo" de acciones futuras (action chunking). Esto reduce el error de acumulación y mejora la estabilidad del control en tareas de manipulación. La arquitectura combina un encoder de visión (para procesar las imágenes de las cámaras) con un transformer que genera las secuencias de acciones.

El entrenamiento se realizó con el dataset `akimaru/newhouse`, que contiene 70 episodios teleoperativos, 34.777 fotogramas a 30 FPS, y una única tarea definida como "Pick_and_place_objects_to_sort_them". El modelo fue entrenado durante 100.000 pasos con un batch size de 16, optimizador AdamW, learning rate de 1e-05 y semilla 1000. Se utilizó LeRobot versión 0.5.2. No se ha especificado si se aplicaron técnicas de RLHF o DPO, ya que el entrenamiento es de aprendizaje por imitación supervisado.

## Capacidades

- **Manipulación robótica**: el modelo genera acciones de 6 dimensiones para controlar el brazo robótico SO-101.
- **Percepción visual multi-cámara**: procesa tres flujos de imagen simultáneos (frontal, lateral y diagonal) de resolución 480x640.
- **Integración con LeRobot**: compatible con el pipeline de entrenamiento, evaluación y despliegue de LeRobot.
- **Aprendizaje por imitación**: capacidad de imitar tareas teleoperadas de recoger y colocar objetos.
- **No aplica**: no tiene capacidades de texto, código, matemáticas, visión general, tool calling o agentes.

## Casos de uso

- **Automatización de tareas de clasificación**: el modelo puede controlar un brazo robótico para recoger objetos y clasificarlos en contenedores, típico en líneas de embalaje o reciclaje.
- **Investigación en aprendizaje por imitación**: sirve como punto de partida para estudiar la transferencia de políticas de ACT a robots reales con múltiples cámaras.
- **Prototipado en robótica de bajo coste**: al usar el SO-101, un brazo robótico de bajo coste, el modelo demuestra que es viable entrenar políticas con hardware asequible.
- **Benchmark de simulación a real**: puede usarse como referencia para comparar el rendimiento de políticas entrenadas en simulación (Isaac Lab, Isaac GR00T) frente a las entrenadas con datos reales.
- **Educación en robótica**: el repositorio y el dataset están disponibles para que estudiantes y desarrolladores aprendan a entrenar políticas de ACT con LeRobot.
- **Investigación en visión multi-cámara**: el uso de tres cámaras permite estudiar cómo la fusión de múltiples vistas mejora la robustez en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real: "_No evaluation results have been provided for this policy yet._"

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. Dado el tamaño de 51,7 millones de parámetros, se estima que el modelo es ligero y podría caber en GPUs con menos de 4 GB de VRAM, pero no se ha confirmado.
- **GPU recomendadas**: no se especifican en la documentación. Por el tamaño, una GPU de consumo como una RTX 3060 o superior sería suficiente para inferencia.
- **Compatibilidad con GPU de consumo**: probablemente sí, dada su pequeña cantidad de parámetros, aunque no está confirmado.
- **Opciones de despliegue**: el modelo se usa con el pipeline de LeRobot, que permite ejecución en GPU (`--policy.device=cuda`). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el ecosistema LeRobot con la misma configuración de tres cámaras y la misma tarea. El autor ha publicado otros modelos similares (por ejemplo, `act_so101_2nd` o `so101_sorting_3cam_480p`), pero no se tienen datos de rendimiento comparativos.

## Limitaciones y advertencias

- **Sin evaluación en robot real**: el modelo no ha sido evaluado en el robot físico, por lo que no se conoce su tasa de éxito real.
- **Dataset limitado**: el entrenamiento se realizó con 70 episodios de una sola tarea, lo que limita su generalización a otras tareas o variaciones del entorno.
- **Sobreajuste potencial**: con un dataset pequeño y 100.000 pasos de entrenamiento, existe riesgo de sobreajuste a las condiciones específicas de los datos de demostración.
- **Dependencia de la configuración de cámaras**: el modelo requiere exactamente tres cámaras con los nombres de observación `front`, `side` y `naname`, lo que limita su portabilidad a otros robots o configuraciones.
- **Licencia Apache 2.0**: permite uso comercial, pero el dataset de entrenamiento (`akimano/newhouse`) puede tener restricciones adicionales que no se detallan en la model card.
- **Sin soporte de herramientas**: no es un modelo de lenguaje, no soporta tool calling ni agentes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/akimaru/3cam_act_so101)
- [Dataset de entrenamiento](https://huggingface.co/datasets/akimaru/newhouse)
- [Paper de ACT](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Visualizar dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=akimaru/newhouse)
- [Perfil del autor en Hugging Face](https://huggingface.co/akimaru)

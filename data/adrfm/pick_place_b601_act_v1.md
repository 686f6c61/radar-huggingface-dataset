# adrfm/pick_place_b601_act_v1

## Resumen

El modelo `adrfm/pick_place_b601_act_v1` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por Aaron De Rybel (usuario `adrfm`) y publicada en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que permite ejecutar tareas de manipulación con mayor estabilidad y precisión. Está entrenado específicamente para la tarea de colocar un disco negro en una caja usando un brazo robótico Seeed reBot Arm B601-DM, con dos cámaras (frontal y de muñeca) y la lectura del estado del robot.

El modelo tiene 51,7 millones de parámetros y se distribuye en formato safetensors a través del ecosistema LeRobot, lo que facilita su integración en pipelines de robótica con PyTorch. Su relevancia radica en que demuestra cómo un método de imitación relativamente ligero puede resolver tareas de pick-and-place con un robot de bajo coste, y sirve como punto de partida para investigaciones en manipulación robótica y aprendizaje por imitación. No se trata de un modelo de lenguaje ni de visión general, sino de una política específica para un entorno y una tarea concretos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.721.863 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT, un método de aprendizaje por imitación basado en transformers que predice bloques de acciones (action chunks) a partir de observaciones multimodales. En este caso, las observaciones consisten en el estado del robot (vector de 7 dimensiones) y dos imágenes RGB de 480x640 píxeles (cámara frontal y cámara de muñeca). La salida es un vector de acción de 7 dimensiones, probablemente correspondiente a la posición y orientación del efector final.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset propio (`adrfm/pick_place_b601`) que contiene 50 episodios teleoperados, con un total de 15.905 fotogramas a 30 FPS. La configuración de entrenamiento incluye 20.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; se trata de un entrenamiento puramente supervisado por imitación.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea de pick-and-place de un disco negro en una caja, generando comandos de acción de 7 dimensiones.
- Percepción multimodal: procesa simultáneamente imágenes de dos cámaras (frontal y de muñeca) y el estado del robot (posición articular o del efector).
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de ingeniería de recompensas.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo herramientas de entrenamiento, evaluación y despliegue.
- No dispone de capacidades de lenguaje, razonamiento general, visión semántica ni generación de texto.

## Casos de uso

- Automatización de tareas de recogida y colocación en entornos de fabricación: el modelo puede controlar un brazo robótico Seeed B601 para mover piezas de una posición a otra, reduciendo la intervención manual en líneas de montaje simples.
- Investigación en aprendizaje por imitación: sirve como banco de pruebas para estudiar la transferencia de políticas ACT a nuevas tareas o variaciones del entorno, dado su tamaño reducido y su integración con LeRobot.
- Prototipado rápido de soluciones robóticas: al estar entrenado para una tarea concreta, permite validar flujos de trabajo de recolección de datos, entrenamiento y despliegue en menos de un día.
- Educación y formación en robótica: puede utilizarse en laboratorios docentes para demostrar conceptos de aprendizaje por imitación y control basado en visión, con un hardware de bajo coste.
- Evaluación de robustez en manipulación: al no contar con resultados de evaluación publicados, puede emplearse como caso de estudio para medir la repetibilidad y tasa de éxito en condiciones controladas.
- Desarrollo de sistemas de teleoperación asistida: combinado con un interfaz humano, el modelo puede complementar o sustituir el control manual en tareas repetitivas de pick-and-place.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero al tratarse de un modelo de 51,7 millones de parámetros, la inferencia puede ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM, dependiendo del tamaño de lote y la resolución de imagen.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060, RTX 4090) es suficiente; también podría ejecutarse en CPU para pruebas no en tiempo real, aunque la latencia sería mayor.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media y alta de consumo.
- Opciones de despliegue: el framework principal es LeRobot, que proporciona scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). También puede integrarse con PyTorch directamente.
- Latencia y throughput: no se proporcionan datos; dependerán del hardware y de la optimización del pipeline de visión.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para tareas de pick-and-place con el mismo robot o similar). La comparativa no está disponible.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea "Place black disk in box" con un robot Seeed B601-DM y una configuración de cámaras específica. No generaliza a otras tareas, objetos o entornos sin reentrenamiento.
- Dependencia de la configuración del hardware: cualquier cambio en la posición de las cámaras, iluminación, calibración del robot o tipo de objeto puede degradar significativamente el rendimiento.
- Sin resultados de evaluación: no se han publicado tasas de éxito ni métricas de robustez, por lo que su fiabilidad en producción no está validada.
- Riesgo de sobreajuste: con solo 50 episodios de entrenamiento, es probable que el modelo memorice las demostraciones y falle ante variaciones no vistas.
- Limitaciones de percepción: las imágenes de entrada son de baja resolución (480x640) y el modelo no tiene capacidad de razonamiento semántico, por lo que no puede adaptarse a objetos desconocidos o situaciones ambiguas.
- Licencia y uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo está ligado a un hardware y tarea concretos, lo que limita su aplicabilidad directa en productos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adrfm/pick_place_b601_act_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/adrfm/pick_place_b601
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Wiki del robot Seeed reBot Arm B601-DM: https://wiki.seeedstudio.com/rebot_b601_dm_getting_started/

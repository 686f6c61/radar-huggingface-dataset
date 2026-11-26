# IanHHH698/pi05_testv0.7.0_v1

## Resumen

π₀.₅ (Pi05) es un modelo visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, disenado para la generalización en entornos abiertos en robótica. Evoluciona π₀ para generalizar a entornos y situaciones completamente nuevas que no se vieron durante el entrenamiento. La implementación utilizada aquí es la adaptación de LeRobot, derivada del repositorio OpenPI de código abierto de Physical Intelligence.

El modelo que nos ocupa, `IanHHH698/pi05_testv0.7.0_v1`, es un fine-tuning de `lerobot/pi05_libero_base` realizado por el usuario IanHHH698 sobre un dataset propio de teleoperación. Está especializado en una única tarea concreta: cerrar un cajón (`close_drawer`), sobre un robot de tipo `panda` con dos cámaras (primaria y de muñeca). No se trata de un modelo de propósito general listo para producción, sino de una política de imitación entrenada para un escenario específico.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un tamaño de repositorio de 9,4 GB. Es relevante como ejemplo práctico del flujo de trabajo de LeRobot para entrenar políticas VLA sobre hardware asequible, y como muestra de cómo se adapta un modelo base de robótica a una tarea concreta mediante fine-tuning supervisado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), implementación LeRobot/OpenPI |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_libero_base |
| Tipo de robot | panda |
| Camaras | primary, wrist |
| Entradas visuales | observation.images.primary (3, 256, 256), observation.images.wrist (3, 256, 256) |
| Entradas de estado | cartesian (6), gripper (1), joints (7), target (6), state (20) |
| Salida | action (7) |
| Libreria | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence, un modelo visión-lenguaje-acción que procesa observaciones multimodales (imágenes de cámaras y estado proprioceptivo del robot) y produce acciones motoras de 7 dimensiones. La implementación concreta es la de LeRobot, adaptada desde OpenPI, y el modelo base es `lerobot/pi05_libero_base`. No se dispone de información detallada sobre el número de capas, dimensión oculta, mecanismo de atención ni composición exacta del dataset de preentrenamiento del modelo base en la información proporcionada.

El fine-tuning se realizó sobre el dataset `IanHHH698/ian_telop_helloworld_v2`, compuesto por 100 episodios, 13.976 fotogramas a 15 FPS, con la única tarea "close_drawer". La configuración de entrenamiento fue: 20.000 pasos, batch size 32, optimizador AdamW, learning rate 2,5e-05, semilla 1000 y versión de LeRobot 0.7.0. No se indica si hubo RLHF, DPO ni otras fases de alineación posteriores; se trata de aprendizaje por imitación supervisado sobre teleoperación.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones (posición/orientación y apertura de pinza) para un robot panda.
- Percepción visual multimodal: procesa dos flujos de imagen (cámara primaria y de muñeca) de 256x256 píxeles.
- Fusión de estado proprioceptivo: integra estado cartesiano, de articulaciones, de pinza y de objetivo.
- Ejecución de una tarea específica de manipulación: cerrar un cajón (`close_drawer`).
- Generalización limitada al dominio de entrenamiento: al ser un fine-tuning sobre 100 episodios de una sola tarea, su capacidad de generalización es reducida.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Automatización de una tarea de manipulación concreta en laboratorio: cerrar cajones en un entorno controlado con un robot panda, usando las dos cámaras y el estado de articulaciones como entrada. Adecuado por estar entrenado específicamente para esa tarea.
- Base para experimentos de aprendizaje por imitación: sirve como punto de partida para que investigadores reproduzcan el flujo de LeRobot (grabación de datos, entrenamiento, rollout) y comparen con sus propias políticas.
- Evaluación de pipelines de teleoperación: permite validar la cadena completa de captura de datos (15 FPS, 100 episodios) y su impacto en la calidad de la política resultante.
- Docencia y formación en robótica VLA: ejemplo real y reproducible de fine-tuning de un modelo π₀.₅ sobre hardware asequible, con comandos CLI documentados.
- Pruebas de integración con LeRobot: validar la compatibilidad de la versión 0.7.0 de LeRobot con políticas π₀.₅ y el comando `lerobot-rollout`.
- Benchmark interno de robustez: medir la degradación de la política ante cambios de iluminación, posición de objetos o distracciones, dado que el modelo card no reporta resultados de evaluación.
- Prototipado de asistentes robóticos de un solo paso: para tareas de manipulación simples que no requieran razonamiento multi-paso ni generalización a entornos nuevos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, métricas de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4,14 mil millones de parámetros en safetensors y un repositorio de 9,4 GB, una estimación orientativa en FP16 rondaría los 8-9 GB de pesos, pero no se confirma en la documentación.
- GPU recomendadas: no disponible. El comando de entrenamiento documentado usa `--policy.device=cuda`, sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de parámetros podría ser viable en GPUs con 16-24 GB de VRAM en precisión reducida, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de robótica de este tipo.
- Latencia y throughput: no disponible. La captura de datos se realizó a 15 FPS, pero no se reporta la latencia de inferencia de la política.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IanHHH698/pi05_testv0.7.0_v1 | ~4,14 B | no disponible | close_drawer (panda) | gemma | Hugging Face |
| lerobot/pi05_libero_base | no disponible | no disponible | VLA base generalista | no disponible | Hugging Face |
| π₀ (Pi0) original | no disponible | no disponible | VLA generalista | no disponible | OpenPI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado únicamente para la tarea "close_drawer" con 100 episodios; no generaliza a otras tareas ni entornos sin reentrenamiento.
- Sin resultados de evaluación: no hay tasas de éxito publicadas, por lo que se desconoce su fiabilidad real en producción.
- Dataset pequeño: 100 episodios y 13.976 fotogramas son insuficientes para una generalización robusta; probable sobreajuste al entorno de captura.
- Dependencia de hardware específico: asume un robot panda con dos cámaras y una configuración concreta de observaciones (cartesian, gripper, joints, target, state).
- Licencia Gemma: restricciones de uso comercial sujetas a los términos de la licencia Gemma; es necesario revisarlos antes de un despliegue comercial.
- Riesgo de fallo ante cambios de iluminación, posición de objetos o distracciones no presentes en el dataset de entrenamiento.
- Sin información sobre sesgos, alucinación (no aplica en el sentido lingüístico, pero sí fallos de política) ni limitaciones idiomáticas.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-26) en los metadatos: posible inconsistencia que conviene verificar.

## Enlaces

- [Hugging Face: IanHHH698/pi05_testv0.7.0_v1](https://huggingface.co/IanHHH698/pi05_testv0.7.0_v1)
- [Modelo base: lerobot/pi05_libero_base](https://huggingface.co/lerobot/pi05_libero_base)
- [Dataset: IanHHH698/ian_telop_helloworld_v2](https://huggingface.co/datasets/IanHHH698/ian_telop_helloworld_v2)
- [Blog de Physical Intelligence sobre π₀.₅](https://www.physicalintelligence.company/blog/pi05)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Guía LeRobot pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Documentación LeRobot](https://huggingface.co/docs/lerobot/index)
- [Visualizador de dataset LeRobot](https://huggingface.co/spaces/lerobot/visualize_dataset?path=IanHHH698/ian_telop_helloworld_v2)

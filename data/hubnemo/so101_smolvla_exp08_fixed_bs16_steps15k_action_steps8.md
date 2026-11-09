# hubnemo/so101_smolvla_exp08_fixed_bs16_steps15k_action_steps8

## Resumen

SO101 SmolVLA Exp08 es una política de visión-lenguaje-acción (VLA) compacta afinada desde `lerobot/smolvla_base` para controlar un brazo robótico SO101 de tipo follower. El modelo resuelve una tarea de manipulación concreta de tipo pick-and-place: coger un cubo morado e introducirlo en una caja de cartón, ignorando el resto de objetos de la escena. Es un adaptador de imitación entrenado con LeRobot sobre el dataset `Orellius/so101_sort_cubes_no_top`, compuesto por 77 episodios y 54.777 fotogramas a 30 FPS.

La relevancia de este checkpoint es doble. Por un lado, demuestra el flujo completo de LeRobot para entrenar políticas VLA de bajo coste en hardware de consumo, con una configuración concreta y reproducible (15.000 pasos, batch 16, AdamW, learning rate 1e-4, semilla 1000). Por otro, al derivar de SmolVLA, hereda la arquitectura compacta descrita en el paper 2506.01844, pensada para reducir el coste computacional frente a VLA de mayor tamaño manteniendo un rendimiento competitivo en tareas de manipulación.

El modelo se publica con licencia Apache 2.0 y formato safetensors, integrado en el ecosistema LeRobot 0.7.1. No incluye resultados de evaluación en su model card, por lo que su rendimiento real en el robot debe validarse empíricamente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), política de imitación sobre base VLM compacta |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (política de control por pasos, no modelo de lenguaje conversacional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea se define mediante instrucción en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una política VLA compacta que combina percepción visual y estado propioceptivo para generar acciones de control. En este checkpoint concreto, la entrada está formada por `observation.state`, un vector de 6 dimensiones, y `observation.images.front`, una imagen RGB de 3×480×640 procedente de una única cámara frontal. La salida es `action`, un vector de 6 dimensiones que corresponde a las articulaciones del brazo SO101 follower. La política se ejecuta con un horizonte de acción de 8 pasos, tal como indica el nombre del repositorio (`action_steps8`).

El entrenamiento se realizó mediante imitación supervisada con LeRobot 0.7.1 sobre el dataset `Orellius/so101_sort_cubes_no_top`: 77 episodios, 54.777 fotogramas a 30 FPS, con la instrucción "Grab the purple cube and put it into the cardboard box, ignore the other objects". La configuración reportada es de 15.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documentan detalles sobre composición del dataset, aumentos de datos, RLHF/DPO ni innovaciones adicionales más allá de las propias del método SmolVLA descrito en el paper.

## Capacidades

- Control robótico de manipulación: genera comandos de 6 dimensiones para un brazo SO101 follower a partir de imagen frontal y estado de articulaciones.
- Ejecución de una tarea pick-and-place específica: coger el cubo morado e introducirlo en la caja de cartón, ignorando otros objetos.
- Percepción visual monocámara: procesa imágenes RGB de 480×640 a 30 FPS.
- Condicionamiento por instrucción en lenguaje natural: acepta una descripción textual de la tarea en el momento de la inferencia.
- Control por horizonte de acción: produce secuencias de 8 pasos de acción por invocación.
- Despliegue en hardware de consumo: hereda de SmolVLA la orientación a ejecución en equipos asequibles.
- Integración con LeRobot: compatible con `lerobot-rollout` y `lerobot-train` para ejecución y reentrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingualidad conversacional, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede ejecutar la tarea de clasificación de cubos sobre un SO101 real, usando `lerobot-rollout` con la instrucción entrenada y una cámara frontal a 640×480 y 30 FPS.
- Prototipado rápido de políticas VLA: sirve como punto de partida para validar el pipeline completo de LeRobot (grabación, entrenamiento, despliegue) antes de invertir en datasets mayores.
- Benchmark interno de imitación: al fijar semilla, pasos y batch, permite reproducir experimentos y comparar variantes de hiperparámetros sobre la misma base SmolVLA.
- Educación y formación en robótica: útil para demostrar conceptos de aprendizaje por imitación con hardware de bajo coste y una tarea acotada y comprensible.
- Reentrenamiento con nuevos objetos: la receta de `lerobot-train` permite sustituir el dataset por uno propio y adaptar la política a otras tareas de manipulación.
- Pruebas de robustez visual: al depender de una única cámara frontal, permite estudiar el impacto de cambios de iluminación, posición de objetos y distractores en el éxito de la tarea.
- Investigación en evaluación de VLA: sirve como referencia para medir tasas de éxito reales frente a otros checkpoints derivados de SmolVLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una política SmolVLA compacta, se espera que quepa en GPUs de consumo, pero no se aportan cifras concretas.
- GPU recomendadas: no disponibles de forma específica. El método SmolVLA está orientado a hardware de consumo según el paper.
- Compatibilidad con GPU de consumo: probable según la orientación del método, pero sin datos verificados en la información disponible.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` para ejecución sin grabación; `lerobot-train` para reentrenamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según el dataset de entrenamiento, pero no se reporta latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO101 SmolVLA Exp08 (este) | no disponible | no disponible | Pick-and-place SO101 | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face |
| Otras políticas VLA (p. ej. OpenVLA, π0) | no disponible en la información | no disponible | Manipulación general | no disponible en la información | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de evaluación: no hay tasas de éxito publicadas, por lo que el rendimiento real en el robot es desconocido.
- Tarea muy específica: entrenado únicamente para coger el cubo morado e introducirlo en la caja, ignorando otros objetos; no generaliza a otras tareas sin reentrenamiento.
- Dataset reducido: 77 episodios y 54.777 fotogramas limitan la diversidad de posiciones, iluminación y configuraciones vistas.
- Dependencia de una única cámara frontal: cambios en el montaje, la resolución o la posición de la cámara pueden degradar el comportamiento.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero al ser un modelo de imitación puede reproducir sesgos presentes en las demostraciones.
- Riesgo de alucinación no aplicable en el sentido conversacional, pero sí riesgo de acciones erróneas o inseguras en el robot ante escenas fuera de distribución.
- Idiomas: la instrucción de tarea está en inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso externo.
- Requiere LeRobot 0.7.1 y hardware SO101 calibrado; la configuración de puerto y cámaras es específica de cada máquina.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_exp08_fixed_bs16_steps15k_action_steps8
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top

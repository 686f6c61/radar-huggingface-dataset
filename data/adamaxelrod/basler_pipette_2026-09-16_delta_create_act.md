# AdamAxelrod/basler_pipette_2026-09-16_delta_create_act

## Resumen

`AdamAxelrod/basler_pipette_2026-09-16_delta_create_act` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers) sobre la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de una imagen de microscopio y del estado articular del robot, predice directamente comandos de acción de 7 dimensiones. El autor es AdamAxelrod y el modelo se publica con licencia Apache 2.0.

El modelo resuelve una tarea muy concreta: mover una pipeta bajo un microscopio (`move_pipette_under_microscope`) sobre un robot Meca500 equipado con una cámara Basler de microscopio. Se entrenó con 51 episodios de teleoperación (23.202 fotogramas a 20 FPS) recogidos en el dataset `AdamAxelrod/basler_pipette_2026-09-16_delta`, y cuenta con 51.597.959 parámetros en formato safetensors.

Su relevancia es la de un ejemplo reproducible de automatización micromanipuladora con aprendizaje por imitación: un pipeline completo y de código abierto (dataset + política + comandos de despliegue) que sirve como punto de partida para laboratorios que quieran replicar pipeteo automatizado o como base para fine-tuning con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual, codificador de estado, decodificador de acciones y codificador variacional (CVAE) durante el entrenamiento |
| Parametros totales | 51.597.959 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje; el equivalente operativo es el tamano de chunk de acciones, no publicado en la model card) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors sin variantes cuantizadas (no hay GGUF ni cuantizaciones de 4/8 bits en el repo) |
| Idiomas soportados | no disponibles (no aplica: el modelo no procesa lenguaje natural; la tarea va fijada por el prompt `move_pipette_under_microscope`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB, libreria `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La política combina un codificador visual (procesa `observation.images.microscope_cam` con forma `(3, 640, 427)`), un codificador para el estado propioceptivo (`observation.state`, vector de 6 dimensiones) y un transformer decodificador que emite un chunk de acciones de 7 dimensiones en lugar de un único paso. Durante el entrenamiento se añade un codificador variacional estilo CVAE que modela la variabilidad de las demostraciones humanas; en inferencia se usa únicamente la ruta determinista, lo que reduce la latencia y estabiliza la ejecución. El chunking de acciones es la innovación clave frente a políticas paso a paso: mitiga el error de composición en horizontes largos y suaviza la trayectoria.

El entrenamiento se realizó con LeRobot 0.6.2 sobre 51 episodios y 23.202 fotogramas a 20 FPS del dataset `basler_pipette_2026-09-16_delta`, con una única tarea anotada. La configuración publicada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta composición del dataset más allá del número de episodios, ni si hubo aumentos de datos, RLHF/DPO (no aplica en robótica de imitación) o validación con conjunto separado.

## Capacidades

- Control visuomotor de precisión: genera trayectorias de 7 grados de libertad para posicionar una pipeta bajo un microscopio a partir de imagen y estado articular.
- Aprendizaje por imitación de una tarea única (`move_pipette_under_microscope`); no es un modelo multitarea ni acepta instrucciones arbitrarias en lenguaje natural.
- Predicción por chunks de acción, pensada para ejecución en bucle cerrado a la frecuencia del dataset (20 FPS).
- Entrada visual de alta resolución relativa para robótica (640x427) mediante cámara de microscopio.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout`, `lerobot-train`, visualización de dataset y publicación en el Hub.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, ni capacidades de audio o visión general. No tiene modo "thinking".

## Casos de uso

- Automatización de pipeteo en laboratorio: la política ejecuta el posicionamiento de la pipeta bajo el microscopio en el robot Meca500 con cámara Basler, sustituyendo la teleoperación repetitiva en protocolos de muestreo.
- Base para fine-tuning con datos propios: al estar en LeRobot y con licencia Apache 2.0, se puede reentrenar con un dataset nuevo del mismo montaje para adaptar la tarea (otro tipo de pipeta, otro portaobjetos, otra iluminación).
- Referencia reproducible de ACT: sirve para validar una instalación de LeRobot de extremo a extremo (dataset, entrenamiento, rollout) antes de invertir en datos propios.
- Recolección de datos asistida: usar la política como controlador inicial y corregir sus fallos por teleoperación para generar episodios adicionales de mayor calidad (DAgger manual).
- Evaluación comparativa de políticas de imitación: mismo robot, misma cámara y misma tarea permiten comparar ACT frente a Diffusion Policy u otras políticas con idéntico protocolo experimental.
- Docencia e investigación en micromanipulación: escenario acotado y con hardware identificado (`meca500_basler`, `microscope_cam`) que facilita la replicación en laboratorios académicos.
- Pruebas de integración de un pipeline de inferencia en tiempo casi real: el bucle a 20 FPS permite medir latencia de política, latencia de cámara y estabilidad del control en un caso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con la nota explicita de que no se han aportado resultados en robot real (ni tasa de exito, ni numero de ensayos, ni condiciones de dificultad). Los únicos datos cuantitativos publicados son los de entrenamiento: 100.000 pasos, batch 8, AdamW, lr 1e-5, semilla 1000, sobre 51 episodios y 23.202 fotogramas a 20 FPS.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 51,6 M de parámetros, los pesos ocupan aproximadamente 206 MB en FP32 y unos 103 MB en FP16; sumando activaciones de una imagen de 640x427 y batch 1, el consumo cabe holgadamente por debajo de 2 GB (estimacion, no medida publicada).
- GPU recomendadas: cualquier GPU consumer moderna sirve (RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090). Para entrenamiento con batch 8 y 100.000 pasos se recomienda al menos 8-12 GB de VRAM; A100 o H100 no son necesarias para inferencia y solo aportan throughput en entrenamiento o en barridos de hiperparámetros.
- Cabe en GPU consumer: sí, en práctica totalidad de tarjetas con soporte CUDA de los últimos años; también es viable en CPU para inferencia a baja frecuencia, aunque no se han publicado mediciones.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=AdamAxelrod/basler_pipette_2026-09-16_delta_create_act` (opción documentada); el resto del stack es PyTorch. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no publicados. El dataset se grabó a 20 FPS, lo que implica un presupuesto de 50 ms por paso de control; el chunking de ACT permite espaciar las inferencias, pero no hay cifras medidas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (ACT, basler_pipette) | 51,6 M | Tarea unica `move_pipette_under_microscope`, 20 FPS, entrada 640x427 | Apache 2.0 | Hugging Face, libreria `lerobot` |
| ACT del paper (arXiv:2304.13705) | no disponible en la informacion (orden de decenas de millones) | Multiples tareas de manipulacion en simulacion y robot real | codigo de referencia publico | Paper y repositorio asociado |
| Diffusion Policy | no disponible | Politicas de imitacion basadas en difusion, tipicamente mas lentas en inferencia | no disponible en la informacion | Implementaciones publicas |
| Politicas VLA (p. ej. SmolVLA) | no disponible | Control condicionado por lenguaje, multitarea | no disponible en la informacion | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada; la comparacion solo puede hacerse por categoria, tamano y licencia.

## Limitaciones y advertencias

- Tarea unica y no condicionada por lenguaje: la política solo ha aprendido `move_pipette_under_microscope`; no generaliza a otras tareas sin reentrenamiento.
- Dataset muy pequeno: 51 episodios y 23.202 fotogramas son suficientes para una tarea estrecha, pero implican alto riesgo de sobreajuste al montaje, a las posiciones y a la iluminación concretas.
- Ausencia total de evaluación publicada: no hay tasa de exito en robot real, ni numero de ensayos, ni pruebas con objetos o posiciones nuevas. No debe asumirse robustez en producción.
- Dependencia fuerte del hardware: robot Meca500 con cámara Basler de microscopio, nombres de cámara y claves de observación fijos (`observation.images.microscope_cam`, `observation.state` de 6 dimensiones). Cambiar de robot o de cámara invalida la política.
- Sensibilidad a condiciones visuales: al usar una sola cámara de microscopio, cambios de enfoque, brillo, exposición o suciedad en la lente pueden degradar la predicción sin aviso.
- Sin capacidades de lenguaje, tool calling ni razonamiento: no es adecuada para tareas de texto, código o agentes.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y aviso de cambios; no hay clausulas de uso restringido documentadas, pero conviene citar el paper de ACT y LeRobot segun la model card.
- Sin variantes cuantizadas ni binarios para inferencia fuera de PyTorch/LeRobot: el despliegue en hardware embebido requeriría exportación adicional (por ejemplo a ONNX o TensorRT), no documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdamAxelrod/basler_pipette_2026-09-16_delta_create_act
- Dataset de entrenamiento: https://huggingface.co/datasets/AdamAxelrod/basler_pipette_2026-09-16_delta
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=AdamAxelrod/basler_pipette_2026-09-16_delta
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia / rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; solo enlaces sin relacion con el contenido de la ficha.

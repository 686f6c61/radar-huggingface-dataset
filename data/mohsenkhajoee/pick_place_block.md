# Mohsenkhajoee/pick_place_block

## Resumen

`Mohsenkhajoee/pick_place_block` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. La desarrolla el usuario Mohsenkhajoee y se distribuye a través del ecosistema LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación —"Grab the block"— sobre un robot de tipo `so_follower`, aprendiendo de datos de teleoperación en lugar de programación explícita.

Se trata de un fine-tune del modelo base `Mohsenkhajoee/act_pick_red_knob`, con 51.668.614 parámetros totales en formato safetensors y un repositorio de 0,2 GB. Consume observaciones de estado articular de 6 dimensiones y dos cámaras RGB de 480x640 (`front` y `gripper`), y produce acciones de 6 dimensiones. La longitud de contexto no aplica en el sentido de los LLM: la "ventana" es el horizonte de predicción de chunks de acción.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: dataset público, configuración de entrenamiento documentada y comandos de despliegue listos para ejecutar. No es un modelo de propósito general ni compite con modelos fundacionales de robótica; es una política especializada y de alcance limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; predice chunks de acción) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica como "Grab the block") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Robot objetivo | `so_follower` |
| Camaras | `front`, `gripper` (480x640, 3 canales) |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida de accion | `action` de forma (6,) |
| Modelo base | `Mohsenkhajoee/act_pick_red_knob` |
| Dataset de entrenamiento | `Mohsenkhajoee/pick_place_block` (63 episodios, 32.724 frames, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones cortas en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso. La arquitectura combina un encoder visual (procesa las dos cámaras de 480x640) con un transformer que fusiona la observación de estado de 6 dimensiones y genera una secuencia de acciones de 6 dimensiones. El modelo se entrenó desde el checkpoint `act_pick_red_knob` mediante fine-tuning.

El entrenamiento se realizó sobre 63 episodios de teleoperación (32.724 frames a 30 FPS) del dataset `pick_place_block`, con 20.000 pasos, batch de 8, AdamW y learning rate de 1e-5, usando LeRobot 0.6.2. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en una política de imitación supervisada. Tampoco se detalla la composición de aumentos de datos ni el número de tokens de entrenamiento en el sentido de modelos de lenguaje.

## Capacidades

- Manipulación robótica de una sola tarea: agarre de un bloque ("Grab the block") con un robot `so_follower`.
- Política visomotora: fusiona estado articular de 6 dimensiones con dos flujos de imagen RGB de 480x640.
- Predicción de chunks de acción de 6 dimensiones, orientada a control continuo a 30 FPS.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita.
- Fine-tuning: puede reentrenarse desde el mismo modelo base con nuevos datasets mediante `lerobot-train`.
- Despliegue mediante CLI (`lerobot-rollout`) con duración configurable.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Demostración educativa de imitación robótica: sirve como ejemplo completo y reproducible del pipeline de LeRobot, desde la grabación de datos hasta el despliegue, con dataset y comandos públicos.
- Recogida de objetos en un banco de pruebas: la política ejecuta el agarre de un bloque sobre un `so_follower` calibrado, útil para validar hardware y calibración de cámaras antes de escalar a tareas más complejas.
- Punto de partida para fine-tuning: al estar entrenada sobre `act_pick_red_knob`, se puede reutilizar como inicialización para nuevas tareas de agarre con pocos episodios adicionales.
- Evaluación comparativa de métodos de imitación: permite contrastar ACT frente a otras políticas de LeRobot (p. ej., Diffusion Policy) sobre el mismo dataset y robot.
- Pruebas de integración de pipelines de inferencia en tiempo real: con 51,7 M de parámetros y pesos de 0,2 GB, es ligero para experimentar con latencia y throughput en control a 30 FPS.
- Docencia y talleres de robótica: el reducido tamaño del modelo y la licencia Apache 2.0 facilitan su uso en cursos y laboratorios sin restricciones de distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,7 M de parámetros en fp32, los pesos ocupan aproximadamente 0,2 GB; el consumo real lo dominan los buffers de imagen de 480x640 y el grafo de inferencia, no los pesos.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte CUDA suficiente para el stack de LeRobot debería poder ejecutar la política; el cuello de botella será la captura de cámara a 30 FPS.
- GPU de consumo: por tamaño de parámetros, es plausible en GPUs de consumo modernas; no hay confirmación oficial de modelos concretos.
- Opciones de despliegue: `lerobot-rollout` (CLI de LeRobot) con `--policy.path=Mohsenkhajoee/pick_place_block`; entrenamiento con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de operación del dataset es de 30 FPS, pero no se publica latencia medida en inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks ni datos de rendimiento de políticas comparables (Diffusion Policy u otras políticas de LeRobot), por lo que no es posible establecer una comparación cuantitativa rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Mohsenkhajoee/pick_place_block` | 51.668.614 | no aplica | sin evaluacion publicada | Apache 2.0 | Hugging Face (LeRobot) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización extrema: entrenada para una única tarea ("Grab the block") sobre un robot `so_follower` concreto; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin evaluación publicada: la model card indica que no hay resultados de éxito en robot real, por lo que la fiabilidad en producción es desconocida.
- Dependencia de las cámaras: los nombres y la resolución (`front`, `gripper`, 480x640) deben coincidir exactamente con los usados en entrenamiento; cambios de calibración o iluminación pueden degradar el comportamiento.
- Dataset pequeño: 63 episodios y 32.724 frames son una base limitada, con riesgo de sobreajuste a posiciones y condiciones concretas del entorno de recogida.
- Sin capacidades de lenguaje ni razonamiento simbólico: no admite tool calling, agentes ni instrucciones en lenguaje natural más allá de la etiqueta de tarea.
- Riesgo de fallo silencioso: al ser una política de imitación, puede ejecutar acciones plausibles pero incorrectas sin señal de error; requiere supervisión y parada de seguridad en el robot.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar las dependencias de LeRobot y del modelo base.
- Idiomas: no aplica; no hay información sobre soporte lingüístico porque no es un modelo de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mohsenkhajoee/pick_place_block
- Modelo base: https://huggingface.co/Mohsenkhajoee/act_pick_red_knob
- Dataset de entrenamiento: https://huggingface.co/datasets/Mohsenkhajoee/pick_place_block
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Mohsenkhajoee/pick_place_block
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

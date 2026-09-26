# Deviant65/act_so101_redcube_batch8

## Resumen

`Deviant65/act_so101_redcube_batch8` es una política de imitación (policy) para robótica entrenada con el método Action Chunking with Transformers (ACT) sobre la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo visomotor que consume el estado articular de un brazo SO-101 junto con dos cámaras (frontal y superior) a 480x640 y produce un vector de 6 acciones articulares. Está publicado por el usuario Deviant65 bajo licencia Apache 2.0 y ocupa 0,2 GB en el Hub.

El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 millones) y está entrenado para una única tarea: "Pick up the red block and place it in the brown box" (coger el bloque rojo y dejarlo en la caja marrón). El dataset de entrenamiento consta de 63 episodios teleoperados, 53.428 fotogramas a 30 FPS, grabados con un seguidor SO-101 y dos cámaras. La configuración de entrenamiento documentada es de 100.000 pasos, batch de 8, optimizador AdamW y tasa de aprendizaje 1e-5 con semilla 1000, sobre LeRobot 0.6.2.

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de un pipeline completo de imitation learning en hardware de bajo coste (SO-101), y como punto de partida para hacer fine-tuning sobre tareas de manipulación similares. El repositorio no tiene descargas ni valoraciones, no incluye resultados de evaluación en robot real y la model card indica explícitamente que no se han proporcionado resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT, Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no aplicable; no es un modelo de lenguaje. Ventana de observación y tamaño de chunk no especificados en la model card |
| Tipos de cuantización | no disponible; se distribuye en safetensors en precisión nativa, sin cuantizaciones publicadas |
| Idiomas soportados | no aplicable; no procesa lenguaje natural como entrada (la tarea se pasa como cadena de texto al runner, no como condición del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras de entrada | `front`, `top` |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamaño del repositorio | 0,2 GB |
| Librería | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que, en lugar de predecir una única acción por paso, predice un chunk de acciones de corta duración a partir de observaciones visuales y propioceptivas. El componente principal es un transformer codificador-decodificador con un cuello de botella latente de estilo VAE (CVAE), que se usa durante el entrenamiento para modelar la variabilidad de las demostraciones humanas; en inferencia se emplea la media del prior. El modelo consume el estado articular de 6 dimensiones y dos imágenes RGB de 480x640, y emite un vector de 6 acciones.

El entrenamiento se realizó por imitación supervisada (behavior cloning) sobre el dataset `Deviant65/so101_redcube_20260925_154203`, compuesto por 63 episodios y 53.428 fotogramas a 30 FPS de teleoperación, todos ellos de la misma tarea. La configuración documentada es de 100.000 pasos de optimización, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, ejecutado con LeRobot 0.6.2. No se documenta uso de RLHF, DPO ni ningún otro ajuste por preferencias. Tampoco se especifican en la model card el número de tokens de entrenamiento en el sentido habitual (al no ser un modelo de lenguaje), el tamaño de chunk de acciones ni la composición detallada del dataset más allá de la tarea y las estadísticas citadas. La innovación técnica relevante es la propia formulación de ACT: predecir chunks de acciones reduce el error de compounding y permite tasas de éxito altas en tareas de manipulación con datos teleoperados, con la posibilidad de aplicar temporal ensembling en inferencia.

## Capacidades

- Control visomotor de un brazo robótico SO-101 (seguidor) a partir de dos cámaras y del estado articular.
- Ejecución de una tarea de manipulación concreta: coger un bloque rojo y colocarlo en una caja marrón.
- Predicción de chunks de acciones (no acción a acción), lo que favorece la suavidad del movimiento.
- Operación en bucle cerrado a 30 FPS mediante `lerobot-rollout`.
- Entrada multimodal limitada a visión (dos vistas RGB de 480x640) y propiocepción de 6 dimensiones; no consume texto como condición.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los agentes basados en LLM.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, audio ni visión general (no es un VLM).
- No documenta variantes de "modo thinking" ni decodificación especulativa.

## Casos de uso

- Automatización de una celda de manipulación de laboratorio: el modelo ejecuta la secuencia completa de recogida y colocación del bloque rojo en la caja marrón sobre un SO-101 real, integrándose en un puesto de trabajo repetitivo mediante `lerobot-rollout` con `--strategy.type=base`.
- Punto de partida para fine-tuning de tareas de pick-and-place: al ser una política ACT de 51,7 M de parámetros con licencia Apache 2.0, se puede reentrenar con `lerobot-train` sobre un dataset propio de otra pieza u otro contenedor, reutilizando la configuración documentada.
- Generación de datos y validación de pipelines de imitation learning: sirve para probar el flujo completo de LeRobot (grabación con teleoperación, entrenamiento, despliegue) antes de escalar a datasets mayores.
- Evaluación de hardware SO-101 de bajo coste: permite comprobar repetibilidad, calibración de cámaras y latencia del lazo de control a 30 FPS en un brazo asequible.
- Docencia y prototipado en robótica: es un ejemplo compacto (0,2 GB) que cabe en cualquier equipo y que ilustra de forma tangible el behavior cloning con action chunking.
- Investigación en generalización visomotora: permite estudiar la sensibilidad de la política a cambios de posición del objeto, iluminación, distractores o a un segundo robot del mismo modelo, aunque conviene medir cada condición con una tasa de éxito propia.
- Base para comparativas de métodos: puede usarse como referencia ACT frente a otras políticas soportadas por LeRobot (por ejemplo Diffusion Policy o SmolVLA) sobre la misma tarea y el mismo hardware, siempre que se controlen las condiciones de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la nota explícita "No evaluation results have been provided for this policy yet", es decir, el autor no ha reportado tasas de éxito ni número de ensayos en robot real. No se dispone de métricas de MMLU, HumanEval, GSM8K ni equivalentes porque no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB solo para pesos en FP32 (51,7 M de parámetros) y alrededor de 0,1 GB en FP16/BF16; con activaciones y dos flujos de imagen de 480x640, el consumo total se sitúa en el orden de cientos de MB. Cálculo estimado a partir del recuento de parámetros, no confirmado por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4090 o similar ofrecen margen de sobra para cumplir el lazo de control a 30 FPS.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con CUDA, e incluso es viable ejecutarlo en CPU para pruebas no críticas en tiempo real.
- Opciones de despliegue: la vía documentada es la CLI de LeRobot (`lerobot-rollout` con `--policy.path=Deviant65/act_so101_redcube_batch8`), junto con la librería `lerobot` y PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo de texto.
- Requisitos adicionales: puerto serie del robot SO-101, dos cámaras OpenCV configuradas a 640x480 y 30 FPS, con nombres que coincidan con las claves de observación del entrenamiento (`front` y `top`).
- Latencia y throughput: no disponible. El objetivo del sistema es operar a 30 FPS (33 ms por ciclo), pero ni la model card ni los metadatos publican mediciones de latencia por paso ni de throughput.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo que permitan una comparación cuantitativa. A continuación se comparan características estructurales con alternativas de la misma categoría disponibles en LeRobot; los valores no verificados se marcan como no disponibles.

| Modelo | Tipo | Parámetros | Condicionado por lenguaje | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_redcube_batch8 (este modelo) | ACT, behavior cloning con action chunking | 51,7 M | No | Apache 2.0 | Hugging Face Hub |
| Diffusion Policy | Política basada en modelos de difusión | no disponible en la información proporcionada | No | según implementación de LeRobot | Implementación en LeRobot |
| SmolVLA | Política viso-lenguaje-acción | no disponible en la información proporcionada | Sí | según repositorio de LeRobot | Hugging Face y LeRobot |
| Otras políticas ACT de la comunidad | ACT | varía según repositorio | No | normalmente Apache 2.0 | Hugging Face Hub |

La diferencia funcional clave de este modelo frente a políticas condicionadas por lenguaje es que solo ejecuta la tarea para la que fue entrenado y no puede reutilizarse cambiando una instrucción de texto; para una tarea nueva exige nuevos datos teleoperados y reentrenamiento o fine-tuning.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada, ni número de ensayos, ni condiciones de prueba, por lo que no se puede afirmar nada sobre su fiabilidad en robot real.
- Especialización extrema: entrenado para una única tarea ("Pick up the red block and place it in the brown box") con un único objeto y un único contenedor; no generaliza a otras instrucciones ni a objetos distintos sin reentrenamiento.
- Sobreajuste al entorno de recogida de datos: cambios de iluminación, posición inicial, fondo, distractores o un robot distinto del mismo modelo pueden degradar el comportamiento.
- Sesgos de los datos de teleoperación: al derivar de demostraciones humanas, la política hereda las trayectorias, velocidades y sesgos de la persona que teleoperó, incluidos posibles sesgos de posicionamiento.
- Riesgo de acciones incorrectas o inseguras: en un lazo cerrado sobre hardware físico puede empujar objetos, colisionar o forzar articulaciones; se recomienda operar con límites de par, parada de emergencia y un espacio de trabajo despejado.
- Sin condicionamiento por lenguaje: no se puede reorientar la tarea mediante texto; el parámetro `--task` del runner no modifica el comportamiento aprendido.
- Idiomas: no aplicable, el modelo no procesa ni genera lenguaje.
- Ventana de observación y tamaño de chunk no documentados: dificulta reproducir exactamente el comportamiento de inferencia (por ejemplo, si se aplicó temporal ensembling).
- Licencia: Apache 2.0, que permite uso comercial y modificación, pero sin garantías y sin que el autor asuma responsabilidad sobre el uso en producción.
- Repositorio sin tracción: 0 descargas y 0 valoraciones, creado y actualizado el 25 de septiembre de 2026 según los metadatos, lo que refuerza la falta de validación externa.
- La model card es la plantilla estándar de LeRobot: los campos opcionales de demostración, evaluación y notas de dificultad no se han rellenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deviant65/act_so101_redcube_batch8
- Dataset de entrenamiento: https://huggingface.co/datasets/Deviant65/so101_redcube_20260925_154203
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Deviant65/so101_redcube_20260925_154203
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

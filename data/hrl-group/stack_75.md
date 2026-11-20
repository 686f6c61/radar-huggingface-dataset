# HRL-Group/stack_75

## Resumen

`HRL-Group/stack_75` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705. El modelo lo desarrolla el grupo HRL-Group y se distribuye a través del Hub de Hugging Face empaquetado con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones (estado del robot y una imagen de muñeca) a comandos de acción de un robot `so_follower` (el brazo SO-100/SO-101 de bajo coste).

La política resuelve una tarea concreta de manipulación: apilar un cubo sobre otro y colocar un cubo en una bandeja. Se entrenó con 92 episodios de teleoperación (218.681 fotogramas a 30 FPS) del dataset `HRL-Group/stack`. Con 51,6 millones de parámetros y un repositorio de 0,2 GB, está pensada para ejecutarse en hardware modesto, incluso en CPU o en una GPU de consumo.

Su relevancia es práctica: ilustra el flujo completo de LeRobot (grabación de datos, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) para quien quiera reproducir o adaptar un pipeline de imitation learning en robótica de bajo coste. No se han publicado resultados de evaluación en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.643.014 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación definida por la configuración de entrenamiento, no disponible) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las tareas se especifican en inglés en la model card) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que predice trozos (chunks) de acciones de varios pasos en lugar de una acción por paso, lo que reduce el error de acumulación y suaviza el control. La política consume `observation.state` con forma `(6,)` y una imagen `observation.images.wrist` de forma `(3, 480, 640)` procedente de una cámara de muñeca, y produce una acción de forma `(6,)`. El modelo se entrenó con LeRobot 0.7.0 durante 100.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000.

Los datos de entrenamiento son 92 episodios y 218.681 fotogramas a 30 FPS del dataset `HRL-Group/stack`, con dos tareas: "Pick up one cube and stack it on top of the other cube" y "Pick up the cube and place it in the tray". No se documenta en la model card si hubo data augmentation, regularización adicional ni el detalle interno de la arquitectura (número de capas, dimensión del transformer, uso de CVAE), más allá de lo que describe el paper de ACT. El robot objetivo es `so_follower` con una sola cámara de muñeca.

## Capacidades

- Control visomotor de manipulación: genera comandos de acción de 6 dimensiones a partir de estado y una imagen de muñeca.
- Predicción de chunks de acción, lo que permite ejecutar secuencias cortas de movimiento de forma más estable que un control paso a paso.
- Ejecución de dos tareas entrenadas: apilar un cubo sobre otro y colocar un cubo en una bandeja.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de visión general más allá de la imagen de muñeca configurada; no procesa audio ni texto libre como entrada.

## Casos de uso

- Reproducción de un pipeline de imitation learning: usar el modelo como referencia para validar la instalación de LeRobot, la calibración del robot `so_follower` y la cámara de muñeca antes de entrenar políticas propias.
- Benchmark interno de manipulación de bajo coste: ejecutar la política en un SO-100/SO-101 con la tarea de apilado para medir tiempos de ciclo y estabilidad del control en hardware económico.
- Base para fine-tuning con datos propios: partir de estos pesos y reentrenar con un dataset propio de tareas similares (apilado, colocación en bandeja) usando `lerobot-train`.
- Docencia y divulgación en robótica: demostrar de forma tangible cómo un transformer pequeño (51,6 M de parámetros) puede controlar un brazo real a partir de teleoperación.
- Pruebas de integración de hardware: validar cámaras OpenCV a 640x480 y 30 FPS, puertos serie y calibración del robot antes de invertir en grabación de datos.
- Prototipado de automatización de pick-and-place en laboratorio: usar la tarea de colocar el cubo en la bandeja como caso de estudio para evaluar la viabilidad de políticas ACT en una línea de montaje sencilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,6 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que cabe holgadamente en cualquier GPU de consumo e incluso puede ejecutarse en CPU para inferencia a 30 FPS.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090); para entrenamiento se recomienda al menos 8-12 GB por el batch de imágenes 480x640.
- Cabe en GPU de consumo: sí, en todas las gamas actuales; el cuello de botella es la captura de cámara y el bucle de control, no el modelo.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), con `--policy.path=HRL-Group/stack_75`; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; el control opera a 30 FPS según la tasa del dataset, lo que fija un presupuesto de aproximadamente 33 ms por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto/observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HRL-Group/stack_75 | 51,6 M | ACT (LeRobot) | Estado (6,) + imagen muñeca 3x480x640 | no disponible | Hugging Face Hub |
| Políticas ACT de LeRobot (genéricas) | variable | ACT | Configurable por dataset | Apache-2.0 (LeRobot) | Hugging Face Hub / GitHub |
| Políticas Diffusion Policy | variable | Diffusion | Configurable por dataset | según implementación | Repositorios de investigación |
| Políticas π0 / VLA de gran escala | miles de millones | VLA | Texto + visión | según modelo | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay evaluación publicada: se desconoce la tasa de éxito real en robot, por lo que no debe asumirse un rendimiento concreto en producción.
- Entrenada solo para dos tareas y un robot concreto (`so_follower`); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Depende de una única cámara de muñeca; cambios de iluminación, posiciones de objetos o distracciones pueden degradar el comportamiento, aunque no se han documentado experimentos al respecto.
- Licencia no especificada: no se puede confirmar el uso comercial; hay que contactar con el autor antes de desplegarla en un producto.
- Riesgo de sobreajuste a los 92 episodios del dataset; la variabilidad de posiciones iniciales es limitada.
- No es un modelo de lenguaje: no procesa instrucciones en lenguaje natural más allá de la etiqueta de tarea que se pasa en la CLI.
- La model card contiene marcadores de plantilla sin completar (licencia, evaluación, demo), lo que indica un estado de publicación preliminar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HRL-Group/stack_75
- Dataset de entrenamiento: https://huggingface.co/datasets/HRL-Group/stack
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HRL-Group/stack

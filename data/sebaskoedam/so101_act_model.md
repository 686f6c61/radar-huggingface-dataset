# SebasKoedam/so101_act_model

## Resumen

so101_act_model es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. Lo desarrolla el usuario SebasKoedam y se distribuye a través de Hugging Face usando la librería LeRobot, el framework de Hugging Face para aprendizaje automático en robótica del mundo real. El modelo está diseñado para controlar un robot seguidor de tipo `so_follower` (la plataforma SO-101) equipado con dos cámaras: una cenital (`top`) y otra en la muñeca (`wrist`).

La política resuelve una tarea concreta de manipulación: recoger un cubo rojo y depositarlo en una caja gris. Consume el estado articular del robot (vector de 6 dimensiones) y dos imágenes RGB de 480x640 píxeles, y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real sobre hardware local, no para despliegue en la nube.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: un dataset teleoperado pequeño (8 episodios, 3603 fotogramas a 30 FPS), un entrenamiento corto (2255 pasos) y una política lista para ejecutarse con el comando `lerobot-rollout`. No es un modelo de propósito general ni compite con modelos de lenguaje; es una política especializada de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de estado de 6 dimensiones y dos imágenes de 3x480x640) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `top` y `wrist`, RGB 3x480x640 |
| Entrada de estado | `observation.state`, forma (6,) |
| Salida de accion | `action`, forma (6,) |
| Libreria | lerobot 0.6.2 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa las dos cámaras) con un transformer que predice secuencias de acciones (chunks) en lugar de una sola acción por paso. Esta predicción por fragmentos reduce el error de acumulación y mejora la estabilidad del control en tareas de manipulación. La política consume el estado articular de 6 dimensiones y las dos vistas RGB, y emite un vector de acción de 6 dimensiones compatible con el robot `so_follower`.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `SebasKoedam/so101_act_20261111_124230`, compuesto por 8 episodios y 3603 fotogramas a 30 FPS de teleoperación para la tarea "Pick up the red cube and place it in the grey box". La configuración fue de 2255 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje por imitación supervisado puro sobre datos teleoperados.

## Capacidades

- Control robótico de manipulación: genera acciones articulares de 6 dimensiones para un robot SO-101 a partir de observaciones visuales y de estado.
- Percepción visual multimodal: procesa simultáneamente dos cámaras RGB (cenital y de muñeca) a 480x640.
- Ejecución de una tarea específica: recoger un cubo rojo y colocarlo en una caja gris.
- Predicción de fragmentos de acción (action chunking), que aporta suavidad y robustez frente a errores acumulados.
- Inferencia en tiempo real mediante `lerobot-rollout` con estrategia base.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Demostración reproducible de aprendizaje por imitación: sirve como ejemplo mínimo de pipeline completo (dataset teleoperado, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) para equipos que quieren adoptar LeRobot sin partir de cero.
- Prototipado de tareas pick-and-place: el modelo resuelve una tarea concreta de recogida y colocación, útil como base para validar hardware, calibración de cámaras y latencias antes de escalar a tareas más complejas.
- Benchmark interno de referencia: al ser un modelo pequeño y con configuración documentada, permite medir el efecto de cambios en datos, hiperparámetros o hardware sobre una tarea controlada.
- Formación y docencia en robótica: su tamaño reducido (0,2 GB, ~51,7 M de parámetros) y su licencia abierta en la práctica lo hacen adecuado para prácticas de laboratorio con robots SO-101.
- Pruebas de integración de sensores: valida la sincronización de dos cámaras OpenCV a 30 FPS y la lectura del estado articular en un lazo de control real.
- Base para fine-tuning en tareas similares: puede reentrenarse con nuevos datasets teleoperados de la misma plataforma para adaptar la política a otros objetos o posiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no hay tasas de éxito, latencias ni métricas de precisión documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 M de parámetros y un repositorio de 0,2 GB; en precisión nativa (fp32) ocuparía aproximadamente 0,2 GB de pesos, más el coste de las activaciones visuales de dos cámaras a 480x640. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100. Para esta carga, una GPU de gama media es suficiente; las A100/H100 no aportan ventaja significativa.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas con al menos 4 GB de VRAM.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=SebasKoedam/so101_act_model`; el entrenamiento se realiza con `lerobot-train`. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La política está pensada para operar a 30 FPS (frecuencia del dataset), pero no se publican mediciones de latencia por paso ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_act_model | 51,7 M | Estado (6,) + 2 imagenes 3x480x640 | Pick-and-place cubo rojo | no disponible | Hugging Face (LeRobot) |
| Otras politicas ACT en LeRobot Hub | no disponible | dependen del dataset | dependen del dataset | dependen del autor | Hugging Face |
| Diffusion Policy (referencia metodologica) | no disponible | estado + imagenes | manipulacion general | no disponible | repositorios de investigacion |

No se dispone de datos comparativos de rendimiento entre este modelo y alternativas concretas, ya que no hay benchmarks publicados. La comparación se limita a la categoría (políticas de imitación para robótica) y a la plataforma (LeRobot).

## Limitaciones y advertencias

- Tarea única y altamente especializada: solo se ha entrenado para "recoger el cubo rojo y colocarlo en la caja gris"; no generaliza a otros objetos, posiciones ni tareas sin reentrenamiento.
- Dataset muy pequeño: 8 episodios y 3603 fotogramas son insuficientes para una robustez alta; es probable que el modelo sea sensible a cambios de iluminación, posición de objetos o distractores.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Licencia no especificada: la model card indica "More Information Needed"; no se puede confirmar el uso comercial sin consultar al autor.
- Dependencia de hardware concreto: requiere un robot `so_follower` y dos cámaras con los nombres `top` y `wrist`; cambios en la configuración de sensores invalidan la política.
- Sin capacidades lingüísticas ni de razonamiento: no es un modelo de lenguaje y no debe evaluarse con métricas de NLP.
- Riesgo de sobreajuste al entorno de grabación: al entrenarse en un único escenario, el comportamiento fuera de distribución puede ser impredecible.
- Sin datos de sesgos, alucinación o seguridad física: no aplican las categorías habituales de modelos de lenguaje, pero sí debe supervisarse la ejecución en robot real por posibles fallos de control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SebasKoedam/so101_act_model
- Dataset de entrenamiento: https://huggingface.co/datasets/SebasKoedam/so101_act_20261111_124230
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SebasKoedam/so101_act_20261111_124230

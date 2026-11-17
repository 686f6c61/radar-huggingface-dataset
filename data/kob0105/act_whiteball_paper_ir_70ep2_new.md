# kob0105/act_whiteball_paper_IR_70ep2_NEW

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado en políticas de imitación y suele lograr tasas de éxito elevadas a partir de datos de teleoperación. El modelo aquí descrito, `kob0105/act_whiteball_paper_IR_70ep2_NEW`, es una política concreta entrenada con LeRobot sobre el robot `so_follower` para la tarea "pick place white ball" (recoger y colocar una bola blanca).

Se trata de un modelo de robótica, no de un modelo de lenguaje: consume el estado del robot (vector de 6 dimensiones) y dos flujos de imagen RGB de 480x640 (cámaras `global` y `palm`) y produce un vector de acción de 6 dimensiones. Cuenta con 51.668.614 parámetros (dato real de los pesos en safetensors) y un repositorio de 0,2 GB, lo que lo hace muy ligero y desplegable en hardware modesto.

Es relevante como ejemplo de política de imitación lista para usar con LeRobot 0.6.1, entrenada con 70 episodios (28.931 fotogramas a 30 FPS) durante 30.000 pasos. No obstante, el autor no ha publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo debe validarse antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitación con codificador visual (ResNet) y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de robótica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica como cadena de texto fija: "pick place white ball") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `global`, `palm` (RGB 3x480x640 cada una) |
| Entrada de estado | `observation.state` con forma (6,) |
| Salida de acción | `action` con forma (6,) |
| Librería | lerobot 0.6.1 |
| Pipeline | robotics |
| Tamaño del repositorio | 0,2 GB |
| Fecha de creación / actualización | 2026-11-17 / 2026-11-17 |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación robótica que predice un chunk de acciones futuras en cada paso de inferencia, en lugar de una única acción. El modelo combina un codificador visual (procesa las dos cámaras, `global` y `palm`, a 480x640) con un codificador del estado del robot (vector de 6 dimensiones) y un decodificador transformer que genera la secuencia de acciones (6 dimensiones por paso). Esta formulación de "action chunking" mitiga el problema de la acumulación de errores en políticas autoregresivas paso a paso y es la innovación central del paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `kob0105/record_test_new_whiteball_paper_IR`: 70 episodios, 28.931 fotogramas a 30 FPS, tarea "pick place white ball". La configuración reportada es de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refuerzo; se trata de aprendizaje supervisado por imitación a partir de teleoperación. No se especifican detalles sobre aumentos de datos, composición exacta del dataset más allá de la tarea ni innovaciones adicionales sobre el ACT original.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea de recoger y colocar una bola blanca ("pick place white ball") sobre un robot `so_follower`.
- Percepción visual multimodal: procesa simultáneamente dos cámaras RGB (vista global y vista de la pinza/palma) a 480x640.
- Predicción de chunks de acción: genera secuencias de acciones de 6 dimensiones en lugar de pasos aislados.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de datos de teleoperación.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni generación de lenguaje natural.
- No dispone de capacidades multilingües, visión general, audio ni modo "thinking".

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política puede ejecutar la tarea de recoger y colocar una bola blanca sobre un robot SO-100/SO-101 (`so_follower`), usando las cámaras global y de palma para localizar el objeto y guiar la pinza.
- Prototipado rápido de políticas de imitación: sirve como referencia para validar el flujo completo de LeRobot (grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`) antes de escalar a tareas propias.
- Benchmark interno de hardware robótico: al ser una política ligera (51,7 M de parámetros, 0,2 GB), permite medir latencia y estabilidad de un robot de bajo coste en una tarea repetitiva y bien delimitada.
- Docencia e investigación en aprendizaje por imitación: útil para estudiar el comportamiento de ACT con pocos datos (70 episodios) y comparar configuraciones de entrenamiento (pasos, batch, learning rate).
- Base para fine-tuning en tareas similares: el checkpoint puede reentrenarse con nuevos datasets de manipulación de objetos pequeños sobre el mismo tipo de robot.
- Pruebas de integración de pipelines de datos robóticos: el dataset asociado (28.931 fotogramas a 30 FPS) y el modelo permiten validar herramientas de visualización y reproducción de episodios en LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas de error de acción, ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en FP32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100); el cuello de botella real será el procesamiento de las dos cámaras a 480x640 y la latencia del bucle de control, no el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 4 GB de VRAM; también podría ejecutarse en CPU para pruebas no críticas, con latencia mayor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=kob0105/act_whiteball_paper_IR_70ep2_NEW`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La card no reporta tiempos de inferencia ni frecuencia de control efectiva; el dataset se grabó a 30 FPS, pero no se confirma que la política opere a esa frecuencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kob0105/act_whiteball_paper_IR_70ep2_NEW` | ACT (LeRobot) | 51,7 M | no aplica | apache-2.0 | Hugging Face, 0 descargas |
| Políticas ACT de LeRobot (referencia del framework) | ACT | del orden de decenas de millones (no confirmado para cada checkpoint) | no aplica | apache-2.0 (framework) | Hub de Hugging Face |
| Políticas Diffusion Policy (referencia) | Diffusion Policy | no disponible | no aplica | no disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada; la comparación se limita a tipo de método, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia de evaluación: el autor no ha publicado tasas de éxito ni resultados en robot real, por lo que el rendimiento es desconocido y debe validarse empíricamente.
- Especialización estrecha: la política está entrenada únicamente para la tarea "pick place white ball" con un robot `so_follower` y dos cámaras concretas; no generaliza a otras tareas, objetos ni configuraciones de hardware.
- Dependencia del entorno: cambios en iluminación, posición de la bola, fondo, calibración de cámaras o tipo de robot pueden degradar el comportamiento; el autor no documenta pruebas de robustez.
- Datos limitados: 70 episodios y 28.931 fotogramas son un volumen reducido, lo que aumenta el riesgo de sobreajuste al entorno de grabación.
- Sin capacidades de lenguaje: no procesa instrucciones abiertas, no soporta tool calling ni agentes; la tarea se pasa como cadena fija.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo visual puede heredar sesgos de los datos de teleoperación (posiciones, objetos y condiciones de grabación).
- Licencia apache-2.0: permite uso comercial y modificación, pero el usuario debe verificar el cumplimiento de las licencias de las dependencias (LeRobot, pesos preentrenados del codificador visual) y citar el paper y LeRobot según la model card.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de soporte de la comunidad o de correcciones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kob0105/act_whiteball_paper_IR_70ep2_NEW
- Dataset de entrenamiento: https://huggingface.co/datasets/kob0105/record_test_new_whiteball_paper_IR
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kob0105/record_test_new_whiteball_paper_IR
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot

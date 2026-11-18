# asma-4a/act_stack_c50_h200_80k

## Resumen

`act_stack_c50_h200_80k` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), publicada en Hugging Face por el usuario `asma-4a` mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visuomotor entrenado para ejecutar una tarea robótica concreta, apilar tres cubos de colores sobre una marca en la mesa, sobre un robot tipo `so_follower` (familia SO-101) equipado con una cámara de muñeca. El modelo tiene 51.617.414 parámetros y consume como entrada el estado articular de 6 dimensiones y una imagen RGB de 640x480, produciendo una acción de 6 dimensiones.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un artefacto de investigación de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin resultados de evaluación publicados. Su interés técnico reside en que ejemplifica el flujo completo de LeRobot para entrenar políticas ACT con datos de teleoperación y en que documenta de forma trazable su configuración de entrenamiento (80.000 pasos, batch 32, AdamW con learning rate 1e-5, semilla 1000, LeRobot 0.7.1) y su dataset (74 episodios, 102.274 frames a 30 FPS).

El nombre del repositorio sugiere una ablación de hiperparámetros: `c50` probablemente indica un chunk size de 50 y `h200` una dimensión oculta de 200, aunque estos valores no se confirman en la model card y deben tratarse como inferencia a partir del identificador, no como dato verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acciones |
| Parametros totales | 51.617.414 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |
| Tipo de robot | `so_follower` |
| Camaras | `wrist` (una camara de muneca) |
| Entrada `observation.state` | STATE, shape `(6,)` |
| Entrada `observation.images.wrist` | VISUAL, shape `(3, 640, 480)` |
| Salida `action` | ACTION, shape `(6,)` |
| Dataset de entrenamiento | `shilpitha-03/so101_stack_rpy` (74 episodios, 102.274 frames, 30 FPS) |
| Tarea | "Stack the red, yellow and purple cubes on the table mark" |
| Pasos de entrenamiento | 80.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |
| Tamano del repo | 5.0 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. En lugar de predecir una acción por paso de control, el modelo predice un chunk de acciones futuras, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. La arquitectura combina un codificador visual (procesa la imagen de la cámara de muñeca a 640x480) con un transformer que fusiona la observación visual, el estado proprioceptivo de 6 dimensiones y, en la formulación original, información de estilo latente; el decodificador emite el chunk de acciones. El identificador del repositorio apunta a un chunk size de 50 y una dimensión oculta de 200, valores no confirmados en la model card.

El entrenamiento es puramente supervisado sobre teleoperación, sin RLHF ni DPO: 74 episodios y 102.274 frames grabados a 30 FPS sobre la tarea de apilado, con 80.000 pasos de optimización, batch 32, AdamW y learning rate 1e-5, ejecutado con LeRobot 0.7.1 y semilla 1000. No se documenta aumento de datos, composición del dataset más allá de la tarea única, ni innovaciones adicionales como decodificación especulativa o atención lineal. El tamaño del repositorio (5.0 GB) es desproporcionado respecto a los 51,6 M de parámetros, lo que sugiere que incluye checkpoints intermedios o artefactos de entrenamiento además de los pesos finales.

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` con 6 grados de libertad a partir de una única cámara de muñeca.
- Ejecución de la tarea específica de apilar tres cubos (rojo, amarillo y morado) sobre una marca en la mesa.
- Predicción de chunks de acciones, lo que permite movimientos más suaves y menor deriva que políticas paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere definición explícita de recompensas.
- Integración con el ecosistema LeRobot: ejecución mediante `lerobot-rollout` y entrenamiento mediante `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües. Es un modelo de robótica de tarea única.

## Casos de uso

- **Investigación en aprendizaje por imitación:** servir como referencia reproducible de una política ACT entrenada con LeRobot 0.7.1, con configuración y dataset documentados, para comparar variantes de hiperparámetros (chunk size, dimensión oculta) en experimentos académicos.
- **Reproducción de la tarea de apilado en un SO-101:** desplegar la política con `lerobot-rollout` sobre un robot `so_follower` calibrado, con la cámara de muñeca a 640x480 y 30 FPS, para validar el pipeline completo de hardware y software antes de entrenar políticas propias.
- **Punto de partida para fine-tuning en tareas de manipulación similares:** reutilizar los pesos como inicialización y reentrenar con un dataset propio de apilado o colocación de objetos, aprovechando que el coste de entrenamiento de una política de 51,6 M de parámetros es bajo.
- **Banco de pruebas de infraestructura de inferencia robótica:** medir latencia y estabilidad del bucle de control con `strategy.type=base` durante 60 segundos, útil para dimensionar la GPU o la CPU de un puesto de robótica de laboratorio.
- **Docencia en robótica de manipulación:** ilustrar el ciclo completo teleoperación, grabación de dataset, entrenamiento y despliegue con una tarea visualmente verificable y un modelo pequeño que cabe en hardware modesto.
- **Ablación de hiperparámetros:** comparar esta política (presuntamente chunk size 50, hidden 200) con otras variantes del mismo autor o del mismo dataset para estudiar el efecto del chunk size en la tasa de éxito del apilado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No existen tablas de tasa de éxito en robot real, ni comparaciones con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible de forma oficial. Con 51,6 M de parámetros en fp32, los pesos ocupan aproximadamente 206 MB; en fp16, unos 103 MB. El coste dominante no son los pesos sino el codificador visual que procesa imágenes de 640x480, por lo que se recomienda al menos 2-4 GB de VRAM para margen.
- **GPU recomendadas:** cualquier GPU con soporte CUDA y al menos 4 GB de VRAM es suficiente en la práctica (RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo no requiere GPUs de datacenter.
- **Cabe en GPU de consumo:** sí, con holgura, en cualquier GPU de consumo moderna con 4 GB o más.
- **Opciones de despliegue:** LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento) sobre PyTorch; no se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput:** no disponibles. La política está pensada para operar en un bucle de control a 30 FPS, coherente con la tasa de grabación del dataset, pero no se publican mediciones de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `asma-4a/act_stack_c50_h200_80k` | 51,6 M | estado (6,) + imagen 640x480 | Apilado de cubos en SO-101 | no disponible | Hugging Face, 0 descargas |
| ACT original (paper arXiv:2304.13705) | no disponible en la informacion | no disponible | Manipulacion general (ALOHA) | codigo abierto en el repo del paper | Paper y codigo publicos |
| Otras politicas LeRobot del mismo dataset | no disponible | no disponible | Apilado de cubos | no disponible | no disponible |

No se dispone de datos de rendimiento de ninguno de los comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, entradas y disponibilidad.

## Limitaciones y advertencias

- **Tarea única:** la política solo ha sido entrenada para apilar los cubos rojo, amarillo y morado sobre la marca; no generaliza a otras tareas ni objetos sin reentrenamiento.
- **Sobreajuste al entorno de grabación:** al entrenarse con 74 episodios de un único dataset, es probable que sea sensible a cambios de iluminación, posición de los objetos, fondo, calibración del robot o a un robot distinto del mismo modelo. La model card no documenta pruebas de robustez.
- **Sin evaluación publicada:** no hay tasa de éxito medida, por lo que no puede afirmarse que la política funcione de forma fiable en producción; debe validarse empíricamente antes de cualquier uso.
- **Licencia no declarada:** la ausencia de licencia impide asumir permisos de uso comercial, redistribución o modificación; es un riesgo legal relevante para cualquier despliegue fuera del ámbito de investigación.
- **Dependencia de hardware concreto:** requiere un robot `so_follower` con cámara de muñeca a 640x480 y 30 FPS, y que los nombres de cámara coincidan con la clave `observation.images.wrist`; no es portable a otras configuraciones sin adaptación.
- **Riesgo de alucinación:** no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o acumulación de error si la observación visual se degrada o el estado articular no se sincroniza correctamente.
- **Sesgos:** no documentados; el dataset de teleoperación puede incorporar sesgos de posición, velocidad o estilo del operador que se reflejen en la política.
- **Idioma:** no aplica; el modelo no procesa ni genera texto.
- **Madurez:** cero descargas y cero likes, creado y actualizado el mismo día (18 de noviembre de 2026), lo que indica un artefacto recién publicado y sin validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asma-4a/act_stack_c50_h200_80k
- Dataset de entrenamiento: https://huggingface.co/datasets/shilpitha-03/so101_stack_rpy
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shilpitha-03/so101_stack_rpy
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

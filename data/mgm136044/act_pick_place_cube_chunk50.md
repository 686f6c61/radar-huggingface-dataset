# mgm136044/act_pick_place_cube_chunk50

## Resumen

`act_pick_place_cube_chunk50` es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado por Zhao et al. (2023) y reimplementado en la librería LeRobot de Hugging Face. El modelo no es un LLM: es una política visomotora que, a partir de dos cámaras (overhead y wrist) y del estado articular del robot, predice secuencias cortas de acciones de 6 dimensiones para ejecutar la tarea "Pick and place the cube". Lo publica el usuario `mgm136044` y está pensado para el robot `so_follower` (SO-100/SO-101 de LeRobot).

El interés práctico es acotado pero claro: es un ejemplo reproducible de extremo a extremo de un pipeline de imitación con LeRobot 0.6.0, entrenado con 50 episodios (19.137 frames a 25 FPS) durante 100.000 pasos con AdamW y learning rate 1e-5. Sirve como referencia para quien quiera entrenar sus propias políticas ACT o comparar configuraciones de chunking.

Con 51,6 millones de parámetros y 0,2 GB de pesos en safetensors, es un modelo ligero que se ejecuta en tiempo real en una GPU de consumo. No obstante, la model card no reporta ninguna evaluación en robot real, por lo que su tasa de éxito es desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer condicionado por observaciones visuales y de estado que predice chunks de acciones |
| Parametros totales | 51.617.414 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no procesa lenguaje; la instrucción de tarea es una cadena fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder que recibe como entrada el estado del robot (`observation.state`, vector de 6 dimensiones) y dos imágenes RGB de 480x640 (`overhead` y `wrist`), y emite un chunk de acciones de forma `(6,)`. La innovación central del método es predecir secuencias de acciones en lugar de pasos individuales, lo que reduce el error de compounding y suaviza la ejecución; además incorpora una técnica de temporal ensembling en inferencia para promediar predicciones solapadas.

El entrenamiento se realizó sobre el dataset `mgm136044/pick-place-cube_20261008_100203` (50 episodios, 19.137 frames, 25 FPS, tarea única "Pick and place the cube"), con 100.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot 0.6.0. No se documenta aumentación de datos, composición del dataset más allá del número de episodios, ni si se aplicó regularización adicional.

## Capacidades

- Control visomotor para una única tarea de pick-and-place de un cubo, con dos vistas de cámara.
- Predicción de chunks de acciones (configuración `chunk50`), lo que implica horizontes de predicción de 50 pasos por chunk.
- Entrada de estado propioceptivo de 6 dimensiones (típicamente 6 articulaciones del `so_follower`).
- Ejecución en tiempo real mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No tiene modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Replicación de experimentos de imitación: sirve como punto de partida para reproducir el pipeline ACT de LeRobot con un dataset propio de 50 episodios y comparar hiperparámetros (learning rate, batch size, pasos).
- Benchmark interno de políticas ACT: al ser un modelo pequeño y con configuración documentada, se puede usar como baseline frente a políticas entrenadas con más datos o con variantes de chunking.
- Automatización de una celda de pick-and-place de laboratorio: sobre un `so_follower` con cámaras overhead y wrist, ejecuta la tarea "Pick and place the cube" en bucle durante un tiempo acotado con `--duration`.
- Docencia y formación en robótica de imitación: permite mostrar el flujo completo (grabación con teleoperación, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) sin requerir hardware de gama alta.
- Prototipado de interfaces de control: al consumir estado de 6 dimensiones y producir acciones de 6 dimensiones, se integra en simuladores o gemelos digitales que repliquen la cinemática del SO-100/101.
- Validación de infraestructura de datos: el dataset asociado (19.137 frames a 25 FPS) sirve para probar herramientas de visualización y curado de datasets de LeRobot antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,6 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que en la práctica cabe en cualquier GPU con 2 GB o más, incluyendo iGPU y Jetson.
- GPU recomendadas: RTX 3060/4060 o superiores para inferencia en tiempo real; A100/H100 no son necesarias para este tamaño. Para entrenamiento, una RTX 3090/4090 acelera los 100.000 pasos, aunque el modelo es entrenable en GPUs de gama media.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en placas embebidas con suficiente memoria.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=mgm136044/act_pick_place_cube_chunk50`; también es posible cargar la política con la API de Python de LeRobot. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles en la información proporcionada. La tasa de captura del dataset es de 25 FPS, lo que sugiere que el control se diseñó para operar en ese orden de frecuencia, pero no se confirma latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mgm136044/act_pick_place_cube_chunk50` | 51,6 M | no aplica | Pick-and-place de cubo con `so_follower` | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT de referencia en LeRobot (p. ej. `lerobot/act_aloha_sim_transfer_cube_human`) | no disponible en la información | no aplica | Manipulación simulada/real con ALOHA | Apache 2.0 | Hugging Face |
| Diffusion Policy (reimplementación LeRobot) | no disponible en la información | no aplica | Manipulación visomotora | MIT/Apache según implementación | Hugging Face / repos públicos |
| Modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito medida en robot real, ni número de ensayos, ni condiciones de prueba. No debe asumirse que la política funciona fuera del entorno de grabación.
- Especialización extrema: entrenada para una única tarea ("Pick and place the cube") y un único tipo de robot (`so_follower`); no generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Dependencia del entorno: cualquier cambio en iluminación, posiciones de objetos, fondo o calibración de cámaras puede degradar el comportamiento; la model card no documenta robustez frente a estas variaciones.
- Dependencia de nombres de cámara: la política espera exactamente las claves `observation.images.overhead` y `observation.images.wrist`; un desajuste en los nombres o en la resolución (480x640) rompe la inferencia.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: al ser un modelo generativo de acciones, puede producir trayectorias que parecen razonables pero fallan físicamente; se recomienda supervisión humana y parada de emergencia.
- Sesgos: no aplica en el sentido de sesgos lingüísticos, pero el dataset de 50 episodios puede estar sesgado hacia posiciones iniciales concretas del cubo, lo que limita la cobertura del espacio de estados.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; el usuario asume la responsabilidad del despliegue físico.
- Repositorio sin descargas ni likes y creado en 2026: no hay evidencia de uso comunitario ni de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mgm136044/act_pick_place_cube_chunk50
- Dataset de entrenamiento: https://huggingface.co/datasets/mgm136044/pick-place-cube_20261008_100203
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mgm136044/pick-place-cube_20261008_100203
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot

# AdrianAo/act_block_sorting_2026-11-12_20-15-07

## Resumen

`AdrianAo/act_block_sorting_2026-11-12_20-15-07` es una política de imitación (policy) para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo ha sido entrenado y publicado con LeRobot 0.6.2 por el usuario AdrianAo, y su cometido concreto es controlar un brazo robótico tipo `so_follower` (SO-101) en una tarea de clasificación de bloques: recoger 3 bloques amarillos, 1 rojo y 6 azules y depositarlos en una caja negra.

A diferencia de los modelos de lenguaje, este artefacto es un controlador visuomotor: consume el estado articular (`observation.state`, 6 dimensiones) y dos flujos de vídeo de 480x640 (cámaras `top` y `wrist`), y emite un vector de acción de 6 dimensiones a 30 FPS. Con 51.668.614 parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo, lo que lo hace relevante para laboratorios y aficionados que experimentan con aprendizaje por imitación en robots de bajo coste.

El interés práctico del modelo reside en su naturaleza reproducible: dataset, configuración de entrenamiento e hiperparámetros están documentados, y la licencia Apache 2.0 permite reutilización comercial. No obstante, se trata de una política específica de una tarea y un robot, sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana temporal de observaciones no documentada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo no linguistico; la tarea se especifica en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulacion y mejora la estabilidad del control. La arquitectura combina un backbone visual (procesa las dos camaras de 480x640) con un transformer que fusiona las observaciones visuales y el estado articular para generar secuencias de acciones. El modelo esta configurado para el robot `so_follower` con dos camaras (`top` y `wrist`).

El entrenamiento se realizo sobre el dataset `AdrianAo/block_sorting`, compuesto por 75 episodios y 115.024 frames a 30 FPS, con la tarea "Pick up 3 yellow blocks, 1 red block and 6 blue blocks and place them into the black box". La configuracion reportada incluye 50.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, usando LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni tecnicas de refinamiento posteriores; es aprendizaje supervisado puro a partir de demostraciones de teleoperacion.

## Capacidades

- Control visuomotor de un brazo robotico `so_follower` con 6 grados de libertad de accion.
- Percepcion visual multimodal: procesa simultaneamente camara cenital (`top`) y de muneca (`wrist`).
- Prediccion de chunks de acciones para control continuo a 30 FPS.
- Ejecucion de una tarea especifica de manipulacion: clasificacion y deposito de bloques por color.
- Aprendizaje por imitacion a partir de demostraciones de teleoperacion (no requiere recompensa explicita).
- Integracion con el ecosistema LeRobot para rollout, evaluacion y reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades linguisticas: no es un modelo de lenguaje.

## Casos de uso

- **Automatizacion de clasificacion de piezas en laboratorio**: el modelo puede ejecutar la tarea de separar bloques por color y depositarlos en un contenedor, util como banco de pruebas para pipelines de manipulacion robotica.
- **Prototipado rapido de politicas con LeRobot**: sirve como referencia funcional para validar la instalacion de LeRobot, la calibracion del robot SO-101 y la configuracion de camaras antes de entrenar politicas propias.
- **Investigacion en aprendizaje por imitacion**: al estar documentados dataset, hiperparametros y semilla, es una base reproducible para estudiar el efecto de cambios en datos o configuracion sobre el exito de la tarea.
- **Educacion y formacion en robotica**: adecuado para cursos y talleres donde se ensena el ciclo completo de teleoperacion, grabacion de datos, entrenamiento y despliegue en un robot de bajo coste.
- **Benchmark interno de hardware de inferencia**: con ~51,7 M de parametros, permite medir latencia y throughput de politicas visuomotoras en GPUs de consumo o en el propio robot.
- **Base para fine-tuning en tareas de pick-and-place**: el checkpoint puede reutilizarse como inicializacion para tareas similares de recogida y deposito con el mismo robot y configuracion de camaras.
- **Validacion de pipelines de datos**: el dataset asociado (75 episodios, 115.024 frames) permite probar herramientas de visualizacion y curacion de datos de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia con la nota explicita: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 51,7 M de parametros, los pesos en FP32 ocupan aproximadamente 207 MB; en FP16, unos 103 MB. La mayor parte del consumo proviene de los dos flujos de vision a 480x640, por lo que se recomienda al menos 4-8 GB de VRAM en funcion del backend y del batch.
- **GPU recomendadas**: cualquier GPU moderna con soporte CUDA es suficiente; una RTX 3060/4060 o superior cubre el caso de uso con holgura. Para entrenamiento (50.000 pasos, batch 8) se recomienda una RTX 4090, A100 o H100 si se busca reducir tiempos.
- **GPU de consumo**: si, cabe en practicamente cualquier GPU de consumo reciente; tambien es viable en CPU para inferencia, aunque con mayor latencia.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` para ejecucion en robot, `lerobot-train` para reentrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles en la informacion proporcionada. El control opera a 30 FPS, que es la frecuencia a la que se grabo el dataset.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AdrianAo/act_block_sorting_2026-11-12_20-15-07` | 51,7 M | ACT (LeRobot) | Estado 6D + 2 camaras 480x640 | Apache 2.0 | Hugging Face |
| Politicas ACT genericas de LeRobot | no disponible | ACT | Configurable por robot | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy (referencia metodologica) | no disponible | Diffusion | Configurable por robot | no disponible | Repositorios de investigacion |
| Otros checkpoints comunitarios de LeRobot para SO-101 | no disponible | ACT / SmolVLA | Configurable por robot | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la comparacion se limita a tipo de metodo, licencia y disponibilidad.

## Limitaciones y advertencias

- **Especificidad de tarea y robot**: la politica esta entrenada exclusivamente para el robot `so_follower` con camaras `top` y `wrist` y para la tarea de clasificar bloques por color; no generaliza a otros robots, configuraciones de camara ni tareas sin reentrenamiento.
- **Sin evaluacion publicada**: no hay tasas de exito ni pruebas en robot real documentadas, por lo que el rendimiento en produccion es desconocido.
- **Riesgo de sobreajuste al entorno de entrenamiento**: cambios en iluminacion, posicion de objetos, fondo o calibracion pueden degradar el comportamiento; no se documentan pruebas de robustez.
- **Dataset limitado**: 75 episodios y 115.024 frames son un volumen modesto; la diversidad de demostraciones es limitada y puede traducirse en fallos ante situaciones no vistas.
- **Sin capacidades linguisticas ni de agente**: no admite tool calling, razonamiento multi-paso ni instrucciones en lenguaje natural mas alla de la etiqueta de tarea.
- **Licencia Apache 2.0**: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia de los datos de entrenamiento antes de un despliegue comercial.
- **Sin cuantizaciones documentadas**: no se ofrecen variantes GGUF/INT8, lo que limita optimizaciones de despliegue en hardware muy restringido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdrianAo/act_block_sorting_2026-11-12_20-15-07
- Dataset de entrenamiento: https://huggingface.co/datasets/AdrianAo/block_sorting
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=AdrianAo/block_sorting
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference

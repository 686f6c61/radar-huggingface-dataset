# rsundaraws/act_arm1_fill

## Resumen

`rsundaraws/act_arm1_fill` es una politica de aprendizaje por imitacion basada en Action Chunking with Transformers (ACT), el metodo presentado por Zhao et al. en el paper arXiv:2304.13705. El modelo ha sido entrenado y publicado con LeRobot 0.6.1, la libreria de Hugging Face para robotica en PyTorch, y resuelve una tarea concreta de manipulacion robotica: coger un cubo y depositarlo en una caja naranja. No es un modelo de lenguaje: es un controlador visuomotor que mapea observaciones (estado articular de 6 dimensiones y dos imagenes de camara) a acciones de 6 dimensiones.

El modelo cuenta con 51.668.614 parametros y un repositorio de 0,2 GB en formato safetensors. Se entrena sobre el dataset `rsundaraws/so101_arm1_fill_trim`, compuesto por 97 episodios y 32.943 frames capturados a 30 FPS mediante teleoperacion sobre un robot SO-101 (tipo `so_follower`). La tarea es unica y el entrenamiento se realizo durante 30.000 pasos con batch de 32 y optimizador AdamW a un learning rate de 1e-5.

Su relevancia es practica para quien trabaja con robotica de bajo coste: demuestra el flujo completo de LeRobot (grabacion de datos, entrenamiento de ACT, despliegue con `lerobot-rollout`) sobre hardware asequible. La licencia Apache 2.0 permite reutilizacion comercial, aunque el modelo solo es valido para la tarea y el robot concretos con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica visuomotora; ventana de observacion definida por el chunking de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer disenado para aprendizaje por imitacion que predice chunks de acciones (varias acciones futuras de una vez) en lugar de pasos individuales, lo que reduce el error de acumulacion y mejora la estabilidad en tareas de manipulacion. La politica recibe como entrada `observation.state` con forma `(6,)` y dos flujos visuales: `observation.images.wrist` a `(3, 480, 640)` y `observation.images.overhead` a `(3, 360, 640)`. La salida es `action` con forma `(6,)`, correspondiente a las articulaciones del robot SO-101.

El entrenamiento se realizo con LeRobot 0.6.1 sobre 97 episodios teleoperados (32.943 frames a 30 FPS) del dataset `so101_arm1_fill_trim`, con una unica instruccion: "Pick up the cube and place it in the orange box". La configuracion fue de 30.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni tecnicas de refuerzo; es aprendizaje supervisado puro a partir de demostraciones.

## Capacidades

- Control visuomotor de un brazo robotico SO-101 (`so_follower`) con 6 grados de libertad.
- Prediccion de chunks de acciones para la tarea de recoger un cubo y colocarlo en una caja naranja.
- Fusion de dos camaras (muneca y cenital) con el estado articular para generar acciones.
- Ejecucion en bucle cerrado mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger un cubo y soltarlo en una caja naranja sobre un SO-101, util como base para experimentos de imitacion con hardware de bajo coste.
- Docencia y formacion en robotica: sirve como ejemplo completo del pipeline LeRobot (grabacion, entrenamiento ACT, despliegue) para cursos de aprendizaje por imitacion.
- Prototipado rapido de politicas: al ser un checkpoint pequeno (0,2 GB, 51,7 M de parametros), se puede entrenar y desplegar en una estacion de trabajo con GPU consumer.
- Benchmark interno de manipulacion: permite medir tasas de exito en una tarea acotada y comparar variantes de datos o hiperparametros.
- Reentrenamiento con nuevos datasets: el comando `lerobot-train --policy.type=act` permite adaptar la receta a otras tareas o posiciones de objeto.
- Investigacion en chunking de acciones: util para estudiar el efecto del tamano de chunk y de la configuracion visual en tareas de contacto.
- Base para aumento de datos: el dataset de 97 episodios y 32.943 frames puede reutilizarse para experimentos de aumento o destilacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 51,7 M de parametros, el peso en precision FP32 ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna; el cuello de botella sera el procesamiento de las dos camaras (480x640 y 360x640 a 30 FPS), no el modelo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060 o superior deberia bastar para ejecutar la politica a 30 FPS, aunque no se dispone de mediciones oficiales.
- Cabe en GPU consumer: si, dado el tamano del checkpoint (0,2 GB).
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=rsundaraws/act_arm1_fill`; entrenamiento con `lerobot-train --policy.type=act`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La frecuencia de control de referencia es 30 FPS, segun el dataset de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rsundaraws/act_arm1_fill` | 51,7 M | no aplica | Pick-and-place SO-101 | Apache 2.0 | Hugging Face (LeRobot) |
| ACT (paper original, Zhao et al. 2023) | no disponible | no aplica | Manipulacion ALOHA | no disponible | Paper + codigo |
| Diffusion Policy (referencia habitual en LeRobot) | no disponible | no aplica | Manipulacion | no disponible | LeRobot |
| VQ-BeT (referencia en LeRobot) | no disponible | no aplica | Manipulacion | no disponible | LeRobot |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especifico de tarea: solo ha sido entrenado para "Pick up the cube and place it in the orange box"; no generaliza a otras instrucciones ni objetos.
- Dependencia del hardware: asume un robot `so_follower` con camaras `wrist` y `overhead` en las resoluciones exactas de entrenamiento; cambios de camara, montaje o calibracion pueden degradar el rendimiento.
- Sin evaluacion publicada: la model card no reporta tasa de exito ni numero de ensayos, por lo que no hay evidencia cuantitativa de robustez.
- Dataset pequeno: 97 episodios y 32.943 frames; la variabilidad de posiciones, iluminacion y distracciones es limitada.
- Riesgo de sobreajuste al entorno de grabacion: cambios de fondo, iluminacion o posicion inicial pueden provocar fallos.
- Sin capacidades de lenguaje: no procesa instrucciones en lenguaje natural ni mantiene conversacion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Sin datos de sesgos: no aplica en el sentido habitual de modelos de lenguaje, pero el comportamiento hereda los sesgos de las demostraciones teleoperadas.
- Fecha de publicacion en el Hub (2026-10-31) y 24 descargas: modelo muy reciente y con poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rsundaraws/act_arm1_fill
- Dataset de entrenamiento: https://huggingface.co/datasets/rsundaraws/so101_arm1_fill_trim
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guia ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rsundaraws/so101_arm1_fill_trim

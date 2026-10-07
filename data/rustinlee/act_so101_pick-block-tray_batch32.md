# rustinlee/act_so101_pick-block-tray_batch32

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones (*action chunks*) en lugar de un unico paso de control, lo que reduce el error de composicion acumulado en tareas de manipulacion. Este repositorio concreto, `rustinlee/act_so101_pick-block-tray_batch32`, es una politica entrenada con LeRobot sobre el robot `so_follower` (familia SO-101) para una unica tarea: "pick up the white block and place it on the grey tray".

El checkpoint tiene 51.668.614 parametros (segun los tensores en formato safetensors) y ocupa 0,2 GB en el Hub. No es un modelo de lenguaje: es una politica visomotora que consume el estado articular del robot (6 dimensiones) y dos flujos de imagen RGB de 480x640 (camara `top` y camara `left`) y produce un vector de accion de 6 dimensiones. La relevancia actual viene de que forma parte del ecosistema LeRobot de Hugging Face, que estandariza el entrenamiento, la evaluacion y el despliegue de politicas de robotica de bajo coste con herramientas de linea de comandos.

La licencia es Apache-2.0, el entrenamiento se realizo sobre el dataset `rustinlee/pick-block-tray-rgb` (70 episodios, 33.892 fotogramas a 30 FPS) durante 70.000 pasos con batch 32 y LeRobot 0.6.2. El autor no ha publicado resultados de evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder con componente variacional (CVAE) para aprendizaje por imitacion |
| Parametros totales | 51.668.614 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de lenguaje; la politica consume la observacion actual y predice un chunk de acciones (tamano de chunk no disponible) |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje; la tarea se fija con la cadena de texto incluida en la configuracion) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato de politica LeRobot) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `top`, `left` (claves de observacion `observation.images.top` y `observation.images.wrist.left`) |
| Entradas | `observation.state` (6,), `observation.images.top` (3, 480, 640), `observation.images.wrist.left` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `rustinlee/pick-block-tray-rgb` (70 episodios, 33.892 fotogramas, 30 FPS) |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 2026-10-07 (creacion), 2026-10-07 (ultima actualizacion) |

## Arquitectura y entrenamiento

ACT se describe en el articulo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La arquitectura es un transformer encoder-decoder con un encoder variacional de tipo CVAE: un encoder procesa la secuencia de acciones junto con la observacion para inferir una variable latente, y un decoder condicionado por las caracteristicas visuales y la latente genera un chunk de acciones futuras en lugar de un unico paso. Esta formulacion permite modelar la multimodalidad de las demostraciones humanas (varias formas validas de ejecutar la misma tarea) y, junto con el *temporal ensembling*, suaviza las transiciones entre chunks. La model card de este repositorio no detalla el *backbone* visual, el tamano del chunk ni la dimension de la latente empleados en este checkpoint: esos datos no estan disponibles.

El entrenamiento es de imitacion supervisada pura sobre teleoperacion, sin RLHF ni DPO. La configuracion publicada indica 70.000 pasos, batch de 32, optimizador AdamW, tasa de aprendizaje 2e-05, semilla 1000 y LeRobot 0.6.2. El dataset contiene 70 episodios y 33.892 fotogramas a 30 FPS de una unica tarea, con las dos camaras ya citadas. No se documenta aumento de datos, composicion del dataset por posiciones de objeto ni criterios de parada; tampoco se han publicado curvas de perdida.

## Capacidades

- Manipulacion visomotora de una unica tarea: coger un bloque blanco y colocarlo en una bandeja gris.
- Control de un robot `so_follower` de 6 grados de libertad a partir de su estado articular.
- Fusion de dos vistas de camara (vista superior y vista de muneca) para localizar objeto y destino.
- Prediccion de chunks de acciones, lo que produce trayectorias mas suaves y estables que el control paso a paso.
- Aprendizaje por imitacion: reproduce la distribucion de comportamientos presente en las 70 demostraciones.
- Ejecucion en bucle de control a 30 FPS (frecuencia del dataset) mediante `lerobot-rollout`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni generacion de lenguaje. La cadena de tarea es fija y descriptiva, no condiciona el comportamiento con instrucciones libres.

## Casos de uso

- Pick-and-place en una linea de montaje de bajo coste: el robot SO-101 puede coger el bloque blanco y depositarlo en la bandeja gris de forma autonoma, cubriendo un ciclo completo de manipulacion sin intervencion humana en cada repeticion.
- Baseline de investigacion en aprendizaje por imitacion: al ser un checkpoint ACT reproducible con LeRobot 0.6.2 y una configuracion de entrenamiento documentada, sirve para comparar nuevas tecnicas (por ejemplo, Diffusion Policy o VLA) sobre la misma tarea y el mismo dataset.
- Docencia en robotica de bajo coste: permite montar una practica de aprendizaje por imitacion de principio a fin (grabar demostraciones, entrenar 70.000 pasos y desplegar) con un robot asequible y una GPU convencional.
- Punto de partida para *fine-tuning*: con 51,7 millones de parametros, reentrenar sobre un dataset nuevo de otra tarea (nuevos objetos o nuevas posiciones de bandeja) es barato en comparacion con politicas VLA de miles de millones de parametros.
- Evaluacion de robustez: el checkpoint permite medir la tasa de exito bajo cambios controlados de iluminacion, posicion inicial del bloque y presencia de distractores, y cuantificar la sensibilidad de ACT a la deriva de distribucion.
- Demostraciones y divulgacion: al caber en GPUs de consumo e incluso ejecutarse con latencias bajas en hardware modesto, es adecuado para ferias, jornadas de puertas abiertas y videos demostrativos que no requieren entrenamiento en directo.
- Generacion de datos comparativos: se puede usar como politica de referencia para validar que un *pipeline* de teleoperacion, calibracion de camaras y `lerobot-rollout` funciona antes de entrenar politicas mas costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con la linea explicita "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito en robot real, numero de ensayos ni comparaciones con otras politicas para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 207 MB en FP32 (51,7 millones de parametros x 4 bytes), unos 103 MB en FP16 y unos 52 MB en int8, sin contar activaciones ni buffers de imagen. El repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060, RTX 4060, RTX 3090 o RTX 4090 ejecutan la politica con holgura. Tambien es viable en CPU para pruebas, aunque con mayor latencia por paso.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en placas integradas con CUDA o en CPU.
- Opciones de despliegue: `lerobot-rollout` de LeRobot (estrategia `base` o con grabacion de episodios) sobre PyTorch. vLLM, TGI, llama.cpp y Ollama no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. La politica debe sostener un bucle de control de 30 FPS para reproducir las condiciones del dataset; el autor no publica medidas de latencia, *throughput* ni tiempo de inferencia por chunk.
- Requisitos adicionales: dos camaras configuradas en LeRobot con los mismos nombres de clave de observacion (`top` y `wrist.left`) y resolucion 640x480 a 30 FPS, ademas del puerto serie del robot SO-101 calibrado.

## Comparativa con modelos similares

La informacion proporcionada solo describe este checkpoint, por lo que los datos de los modelos alternativos no se han podido verificar en esta busqueda y se marcan como no disponibles cuando no procede una comparacion fiable.

| Modelo | Parametros | Enfoque | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_pick-block-tray_batch32 | 51,7 M | Imitacion supervisada con chunks de acciones (ACT) | Estado de 6 dimensiones y 2 imagenes RGB | Apache-2.0 | HuggingFace Hub, via LeRobot |
| Diffusion Policy | No disponible en la informacion proporcionada | Imitacion generativa por difusion de acciones | Observaciones visuales y de estado | No disponible en la informacion proporcionada | Repositorio y articulo de los autores |
| SmolVLA | No disponible en la informacion proporcionada | Vision-language-action para robotica | Instrucciones en lenguaje y observaciones visuales | No disponible en la informacion proporcionada | HuggingFace Hub |
| ACT original (paper) | No disponible en la informacion proporcionada | Mismo metodo, entrenado para tareas bimanuales de bajo coste | Observaciones visuales y de estado | No disponible en la informacion proporcionada | Articulo arXiv:2304.13705 |

Nota: la comparacion cuantitativa (tasa de exito, latencia, robustez) no es posible con los datos disponibles, porque este checkpoint no publica evaluacion y las cifras de los metodos alternativos no forman parte de la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea y un unico tipo de robot (`so_follower`). Cambiar el objeto, la bandeja, la posicion de partida o el robot invalida el comportamiento esperado.
- Sin evaluacion publicada: no existe ninguna tasa de exito medida en robot real, por lo que no se puede estimar su fiabilidad en produccion.
- Deriva de distribucion: al ser aprendizaje por imitacion sobre 70 episodios, cualquier cambio de iluminacion, fondo, posicion de camara o calibracion degrada el rendimiento de forma no cuantificada.
- Dependencia de la configuracion de camaras: las claves de observacion deben coincidir exactamente (`observation.images.top` y `observation.images.wrist.left`), con 640x480 y 30 FPS. Un desajuste de nombres, resolucion o montaje provoca fallo silencioso o acciones incorrectas.
- Riesgo de fallo fisico: un modelo de robotica puede ejecutar trayectorias erroneas, colisionar con objetos o forzar articulaciones. Es obligatorio operar con paradas de emergencia y limites de par configurados.
- Sesgos: las demostraciones provienen de un operador humano concreto, de modo que la politica hereda sus estrategias, tiempos y posibles asimetrias de agarre; no se documenta diversidad de demostradores.
- Idioma: no procesa lenguaje natural. La cadena de tarea solo sirve como etiqueta descriptiva y no permite dar instrucciones alternativas en tiempo de ejecucion.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se cite el metodo y LeRobot segun indica el autor. No se documentan restricciones adicionales ni terminos de uso aceptable mas alla de la licencia.
- Reproducibilidad: la semilla y la configuracion estan documentadas, pero no se especifican versiones exactas de CUDA, PyTorch ni del hardware de entrenamiento, lo que puede dificultar la replicacion bit a bit.
- Cero traccion en el Hub: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe una comunidad que haya validado su funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rustinlee/act_so101_pick-block-tray_batch32
- Dataset de entrenamiento: https://huggingface.co/datasets/rustinlee/pick-block-tray-rgb
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rustinlee/pick-block-tray-rgb
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

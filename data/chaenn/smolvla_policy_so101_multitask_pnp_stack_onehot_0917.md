# Chaenn/smolvla_policy_so101_multitask_pnp_stack_onehot_0917

## Resumen

SmolVLA es un modelo de vision-lenguaje-accion (VLA) compacto disenado para controlar robots manipuladores a partir de observaciones visuales y del estado del robot, produciendo directamente acciones motoras. Este repositorio concreto, publicado por el usuario Chaenn, es un fine-tuning de `lerobot/smolvla_base` sobre un dataset propio de tareas de pick-and-place y apilado (stacking) de cubos con un brazo SO-101 (variante `so_follower`), gestionado con la libreria LeRobot 0.6.2.

El modelo resuelve dos tareas concretas de manipulacion: colocar cada uno de los cinco cubos dentro de un limite negro delimitado y apilar los cinco cubos formando una torre dentro de ese mismo limite. Es relevante ahora porque demuestra el flujo completo de adaptacion de un VLA preentrenado a un robot de bajo coste con datos de imitacion propios: 1.265 episodios y 2.248.810 fotogramas grabados a 30 FPS, y un entrenamiento de 281.250 pasos que cabe en un unico fichero safetensors de 0,9 GB.

El modelo tiene 450.046.176 parametros totales (~450 M) y licencia Apache 2.0, lo que lo situa en la categoria de politicas de robotica ligeras desplegables en hardware de consumo. No se han publicado resultados de evaluacion ni de benchmarks en la informacion disponible, por lo que su rendimiento real en el robot solo puede verificarse replicando el montaje descrito en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) compacto; fine-tuning de `lerobot/smolvla_base` (detalle de capas no disponible) |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un LLM de texto; consume observaciones por paso de control) |
| Tipos de cuantizacion | no disponibles; pesos publicados en safetensors (repo de 0,9 GB) |
| Idiomas soportados | no disponibles; las instrucciones de tarea del dataset estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras declaradas | `wrist`, `side` |
| Entradas | `observation.state` (6,); 3 imagenes de 3x256x256; `observation.images.empty_camera_0` de 3x480x640 |
| Salidas | `action` (6,) |
| Tarea(s) | "Pick and place each of the five cubes inside the black boundary." / "Stack the five cubes into one tower inside the black boundary." |
| Fecha de publicacion | 18 de septiembre de 2026 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La model card describe SmolVLA como un modelo VLA compacto y eficiente que alcanza rendimiento competitivo con costes computacionales reducidos y puede desplegarse en hardware de consumo. Este repositorio es un fine-tuning de `lerobot/smolvla_base` mediante LeRobot, por lo que hereda la arquitectura del modelo base; el detalle de capas, el encoder de vision y el mecanismo de fusion accion-lenguaje no se especifican en la informacion proporcionada y deben consultarse en el paper referenciado (arXiv:2506.01844).

El entrenamiento se realizo sobre el dataset `Chaenn/so101_multitask_test_pnp0908_stack0908_onehot`, con 1.265 episodios, 2.248.810 fotogramas a 30 FPS y dos tareas anotadas (pick-and-place y stacking de cinco cubos). La configuracion declarada es de 281.250 pasos, batch de 16, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000, con LeRobot 0.6.2. No se documenta en la model card si hubo etapas de RLHF/DPO ni innovaciones tecnicas adicionales mas alla de las del modelo base.

## Capacidades

- Generacion de acciones motoras de 6 grados de libertad a partir de imagenes y del estado del robot (control visomotor de extremo a extremo).
- Ejecucion de dos tareas de manipulacion entrenadas: colocar cinco cubos dentro de un limite negro y apilar los cinco cubos en una torre.
- Procesamiento multimodal de hasta cuatro flujos de imagen simultaneos (tres a 256x256 y uno a 480x640) mas un vector de estado de 6 componentes.
- Condicionamiento por instruccion de tarea en lenguaje natural (la etiqueta del repositorio, `onehot`, sugiere codificacion one-hot de la tarea; el detalle no esta confirmado en la model card).
- Inferencia en bucle cerrado sobre el robot real mediante `lerobot-rollout` con `--strategy.type=base`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision para texto, audio ni modo de razonamiento explicito: es una politica de robotica, no un asistente conversacional.

## Casos de uso

- Automatizacion de pick-and-place en celulas de bajo coste: el modelo toma las imagenes de muneca y lateral y emite las 6 acciones del brazo SO-101 para colocar piezas dentro de una zona delimitada, sin necesidad de planificacion simbolica ni vision clasica programada a mano.
- Apilado de piezas en logistica ligera: la segunda tarea entrenada (formar una torre con cinco cubos) es directamente aplicable a la formacion de pilas de piezas pequenas dentro de un area de trabajo acotada.
- Banco de pruebas de investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para comparar tecnicas de fine-tuning de VLA con un dataset de 1.265 episodios y 2,25 M de fotogramas a 30 FPS.
- Generacion de datos para aprendizaje por refuerzo o destilacion: al ejecutar la politica en el robot se pueden registrar trayectorias de exito o fallo y reutilizarlas para entrenar variantes o criticos, dado que el formato de salida es un vector de accion estandar de LeRobot.
- Prototipado de estaciones robotizadas en educacion y laboratorios: los 450 M de parametros y el repo de 0,9 GB permiten desplegar la politica en una estacion con GPU de consumo, acortando el ciclo de iteracion de una practica o un TFG/TFM.
- Mejora de una politica base multi-tarea: el fine-tuning demuestra como especializar `lerobot/smolvla_base` a un robot y a un conjunto de tareas concretas partiendo de un dataset propio, replicable con `lerobot-train`.
- Demostraciones y validacion de hardware SO-101: util para verificar calibracion, montaje de camaras y latencia del bucle de control a 30 FPS antes de invertir en una politica mas grande.
- Integracion en pipelines de robotica existentes: al cargarse con la libreria `lerobot`, la politica se puede invocar desde scripts de Python y combinarse con logica externa de supervision, parada de seguridad o cambios de tarea por instruccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion sin datos ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de exito por tarea, comparaciones con el modelo base ni mediciones de latencia publicadas por el autor.

## Requisitos de hardware

- VRAM en precision de 16 bits: aproximadamente 0,9 GB solo para los pesos (el repositorio completo ocupa 0,9 GB en safetensors).
- VRAM en FP32: aproximadamente 1,8 GB para los pesos.
- VRAM realista para inferencia: entre 4 y 8 GB, sumando activaciones del encoder de vision al procesar tres imagenes de 256x256 y una de 480x640 por paso.
- Cabe en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090 de 24 GB e, incluso, GPUs con 8 GB si se reduce la resolucion o se usa precision de 16 bits. El modelo base se describe explicitamente como desplegable en hardware de consumo.
- Alternativas de borde: Apple Silicon (MPS) y NVIDIA Jetson Orin, siempre que el soporte de LeRobot y PyTorch para la plataforma sea estable.
- Despliegue: CLI `lerobot-rollout` y ecosistema LeRobot sobre PyTorch/CUDA. No aplican vLLM, TGI, llama.cpp, Ollama ni GGUF, porque no es un modelo de lenguaje de texto.
- Latencia y throughput: no disponibles como cifra publicada. La frecuencia de referencia del dataset y del bucle de control es de 30 FPS, y el uso de `--duration` en `lerobot-rollout` permite acotar la ejecucion.
- Requisitos adicionales de sistema: puerto serie del robot (`--robot.port`) y camaras OpenCV configuradas a 640x480 y 30 FPS, con nombres de camara que coincidan exactamente con las claves de observacion del entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chaenn/smolvla_policy_so101_multitask_pnp_stack_onehot_0917 | 450.046.176 | no aplica (politica por paso) | no disponible (sin evaluacion publicada) | apache-2.0 | HuggingFace, libreria `lerobot` |
| lerobot/smolvla_base (modelo base) | no disponible en la informacion proporcionada | no aplica | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Otras familias VLA (Octo, OpenVLA, pi0, etc.) | no disponible en la informacion proporcionada | no aplica | no disponible | no disponible | no detallado en la busqueda realizada |

No se dispone de datos comparativos verificables en la informacion proporcionada. La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre alternativas de robotica, por lo que la comparativa cuantitativa queda pendiente de consultar las fuentes primarias (paper de SmolVLA y documentacion de LeRobot).

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay tasa de exito, numero de ensayos ni condiciones de prueba, por lo que no se puede afirmar que la politica funcione de forma fiable en produccion.
- Especializacion extrema: el modelo solo esta entrenado para dos tareas con cinco cubos y un limite negro; cualquier cambio de objetos, colores, geometria o numero de piezas queda fuera de su distribucion de entrenamiento.
- Sensibilidad al montaje fisico: cambios en la posicion o calibracion de las camaras `wrist` y `side`, en la iluminacion o en la mesa invalidan las observaciones esperadas y degradan las acciones.
- Entrada `observation.images.empty_camera_0` de 480x640: la propia model card la marca como camara vacia, lo que sugiere una entrada heredada o no utilizada que puede complicar la replicacion del entorno de inferencia.
- Dependencia del embodiment: entrenado para `so_follower` (SO-101) con estado y accion de 6 dimensiones; no es transferible directamente a otros brazos sin reentrenamiento.
- Idioma: las instrucciones de tarea estan en ingles y no hay informacion sobre generalizacion a instrucciones en castellano u otros idiomas.
- Riesgo de acciones inseguras: como toda politica de robotica, un fallo de inferencia se traduce en movimiento fisico; es imprescindible un boton de parada de emergencia, limites de par y supervision humana durante las pruebas.
- Licencia Apache 2.0: permisiva y apta para uso comercial, pero conviene verificar las condiciones del modelo base `lerobot/smolvla_base` y del dataset utilizado, que se distribuyen por separado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso por terceros ni de replicaciones independientes; el modelo es muy reciente (18 de septiembre de 2026 segun metadatos).
- Sin soporte de razonamiento textual, tool calling ni agentes: no debe plantearse como sustituto de un LLM en pipelines de decision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chaenn/smolvla_policy_so101_multitask_pnp_stack_onehot_0917
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Chaenn/so101_multitask_test_pnp0908_stack0908_onehot
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Chaenn/so101_multitask_test_pnp0908_stack0908_onehot
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos no guardaban relacion con robotica ni con SmolVLA.

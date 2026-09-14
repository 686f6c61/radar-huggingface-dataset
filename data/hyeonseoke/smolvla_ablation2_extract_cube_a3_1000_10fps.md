# HyeonseokE/smolvla_ablation2_extract_cube_A3_1000_10fps

## Resumen

Este repositorio contiene una politica de robotica basada en SmolVLA, un modelo visio-lenguaje-accion (VLA) compacto disenado para ejecutar tareas de manipulacion a partir de observaciones visuales, estado propioceptivo e instrucciones en lenguaje natural. El modelo ha sido desarrollado por el usuario HyeonseokE y se distribuye como un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, publicado a traves de la libreria LeRobot de Hugging Face. El metodo de referencia es SmolVLA, descrito en el articulo arXiv 2506.01844, que propone un VLA eficiente y desplegable en hardware de consumo.

El modelo resuelve una tarea concreta de manipulacion: "Extract the cube from the pocket and place it on the target marker". Se ha entrenado sobre 100 episodios y 31.711 fotogramas grabados a 10 FPS, con observaciones de estado de 6 dimensiones y tres camaras RGB de 256x256, y produce acciones de 6 dimensiones para un brazo SO-101 (`so101_follower`). Con 450.046.176 parametros (~450 M) y un peso de repositorio de 0,9 GB, es relevante por su tamano reducido y su enfoque de bajo coste computacional, si bien se trata de una variante de ablacion (A3, semilla 1000) sin resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visio-lenguaje-accion (VLA) compacto (SmolVLA); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la tarea se especifica en ingles, pero no se documenta soporte multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base (ajuste fino) |
| Tipo de robot | so101_follower |
| Camaras | top, left_wrist (segun la model card); la tabla de entradas usa observation.images.camera1, camera2 y camera3 |
| Entradas | observation.state (6,); tres imagenes RGB (3, 256, 256) |
| Salidas | action (6,); action.radian_urdf0 (6,) |
| Dataset de entrenamiento | HyeonseokE/ablation2_extract_cube_A3_10fps (100 episodios, 31.711 fotogramas, 10 FPS) |
| Tarea | "Extract the cube from the pocket and place it on the target marker." |
| Pasos de entrenamiento | 24.750 |
| Tamano de lote | 64 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 0,0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.0 |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA se presenta como un modelo visio-lenguaje-accion compacto y eficiente, capaz de alcanzar un rendimiento competitivo con un coste computacional reducido y de desplegarse en hardware de consumo. En este repositorio concreto, el componente publicado es una politica entrenada con LeRobot que consume estado propioceptivo (6 dimensiones) y tres imagenes RGB de 256x256, y emite acciones de 6 dimensiones, incluyendo `action.radian_urdf0`. No se detalla en la informacion disponible la composicion del preentrenamiento del modelo base, el numero total de tokens vistos, ni si se emplearon tecnicas de RLHF o DPO; tampoco se especifican innovaciones internas como atencion lineal o decodificacion especulativa.

El ajuste fino se realizo sobre el dataset `HyeonseokE/ablation2_extract_cube_A3_10fps`, compuesto por 100 episodios y 31.711 fotogramas a 10 FPS de una unica tarea. La configuracion de entrenamiento documentada incluye 24.750 pasos, lote de 64, optimizador AdamW con tasa de aprendizaje 0,0001, semilla 1000 y LeRobot 0.6.0. El nombre del repositorio ("ablation2", "A3", "1000", "10fps") sugiere que se trata de una variante dentro de un estudio de ablacion con semilla fija, aunque el autor no aporta la metodologia completa del experimento.

## Capacidades

- Generacion de acciones motoras: produce comandos de 6 dimensiones (incluida una variante en radianes URDF) para el brazo SO-101 a partir de observaciones visuales y de estado.
- Percepcion visuomotora: procesa tres flujos de imagen RGB de 256x256 junto con el estado de 6 dimensiones del robot.
- Condicionamiento por lenguaje: la politica acepta una instruccion textual de tarea ("Extract the cube from the pocket and place it on the target marker").
- Aprendizaje por imitacion: replica una habilidad de manipulacion aprendida de demostraciones teleoperadas.
- Ejecucion de una unica tarea: no se documenta generalizacion a otras tareas sin un nuevo ajuste fino.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision general ni audio.

## Casos de uso

- Automatizacion de pick-and-place en el robot SO-101: la politica esta especializada en extraer un cubo de un hueco y depositarlo en un marcador, por lo que puede ejecutar esa tarea de forma repetitiva con el mismo montaje de camaras y robot.
- Linea base de ablacion en investigacion: al ser una variante etiquetada como A3 con semilla 1000, sirve para comparar el efecto de decisiones de diseno o de datos frente a otras variantes del mismo estudio.
- Reproducibilidad de experimentos: la semilla y la configuracion de entrenamiento estan documentadas (24.750 pasos, lote 64, AdamW, lr 0,0001, LeRobot 0.6.0), lo que permite repetir o depurar el entrenamiento con `lerobot-train`.
- Punto de partida para ajustes finos con LeRobot: el flujo documentado permite reentrenar desde `lerobot/smolvla_base` o desde esta politica sobre nuevos datasets de manipulacion.
- Prototipado de robotica de bajo coste: con ~450 M de parametros y 0,9 GB de pesos, encaja en estaciones de trabajo con GPU de gama media para pruebas de laboratorio.
- Evaluacion de robustez en laboratorio: permite medir la caida de exito ante cambios de posicion del objeto, iluminacion o distractores, dado que la model card no reporta ninguna tasa de exito.
- Docencia y formacion en imitation learning: sirve como ejemplo completo del ciclo grabar datos, entrenar y desplegar con LeRobot, con comandos de inferencia ya documentados.
- Investigacion en fusion visio-lenguaje-accion: util para estudiar como una instruccion textual condiciona el comportamiento de una politica pequena en una tarea de manipulacion acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"), por lo que no existe tasa de exito, numero de ensayos ni comparacion cuantitativa con otras variantes o politicas.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Estimacion a partir del conteo de parametros: aproximadamente 0,9 GB para los pesos en 16 bits (coincide con el tamano del repositorio de 0,9 GB) y alrededor de 1,8 GB si se carga en fp32, mas activaciones y buffers de tres imagenes de 256x256. En la practica, un margen de 2 a 4 GB de VRAM deberia ser suficiente.
- GPU recomendadas: no especificadas por el autor. Dado el tamano, cualquier GPU NVIDIA con soporte CUDA y 6-8 GB o mas deberia poder ejecutar la politica; el flujo de entrenamiento documentado usa `--policy.device=cuda`.
- GPU de consumo: si, es un modelo apto para hardware de consumo por su tamano (~450 M de parametros). Series como RTX 3060, RTX 4060, RTX 4070 o superiores son candidatas razonables, aunque el autor no publica requisitos minimos.
- Entrenamiento: no disponible. Con lote 64 y 24.750 pasos, se requiere mas VRAM que en inferencia; cualquier cifra concreta seria una estimacion no confirmada.
- Opciones de despliegue: LeRobot es la via documentada, mediante `lerobot-rollout` para ejecutar la politica en el robot y `lerobot-train` para entrenar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica de robotica de este tipo.
- Latencia y throughput: no disponibles. El dataset se grabo a 10 FPS y el ejemplo de despliegue configura las camaras a 30 FPS, pero no se publican medidas de latencia de inferencia ni frecuencia de control real alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (ablation2, A3, semilla 1000) | 450.046.176 | no disponible | apache-2.0 | Hugging Face, 0 descargas y 0 likes en el momento de la consulta | Ajuste fino de una sola tarea, sin evaluacion publicada |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Hugging Face | Modelo base preentrenado del que deriva este ajuste |
| Otras politicas de LeRobot (ACT, Diffusion Policy, pi0) | no disponible | no disponible | no disponible | Hugging Face / repositorio LeRobot | Alternativas de la misma familia de herramientas, sin datos comparativos en la informacion disponible |

No se dispone de cifras verificables de rendimiento, contexto ni parametros de las alternativas dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea ("Extract the cube from the pocket and place it on the target marker") y no se documenta generalizacion a otras tareas.
- Ausencia de evaluacion: no hay resultados de exito publicados, por lo que se desconoce la tasa real de acierto en el robot fisico.
- Variante de ablacion: el nombre del repositorio sugiere una configuracion experimental concreta (A3, semilla 1000); el rendimiento puede no ser representativo de otras semillas o variantes.
- Dependencia del montaje: exige un robot `so101_follower` y un conjunto de camaras concreto. La model card menciona las camaras `top` y `left_wrist`, mientras que la tabla de entradas usa `observation.images.camera1`, `camera2` y `camera3`; esta inconsistencia puede provocar errores de configuracion si los nombres no coinciden con las claves de observacion del entrenamiento.
- Cobertura de datos limitada: 100 episodios y 31.711 fotogramas de una sola tarea implican poca diversidad de posiciones, iluminacion, objetos y distractores; se espera degradacion ante cambios en el entorno.
- Idiomas: no se documenta soporte multilingue; la instruccion de tarea esta en ingles y no se especifica si variantes en otros idiomas funcionan.
- Frecuencia de control: los datos se grabaron a 10 FPS, lo que limita las tareas que requieran dinamica rapida.
- Licencia: el modelo se publica bajo apache-2.0, lo que permite uso comercial, pero conviene verificar la licencia del modelo base `lerobot/smolvla_base`, la del dataset de entrenamiento y las condiciones del articulo SmolVLA antes de un despliegue productivo.
- Riesgo fisico: al tratarse de una politica que controla un brazo robotico, los fallos de la politica pueden provocar colisiones, danos al material o riesgos de seguridad; se recomienda validacion en entorno controlado y con limites de seguridad.
- Alucinacion y sesgos: no se documentan sesgos conocidos ni comportamiento de alucinacion, pero tampoco se aporta ningun analisis al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_ablation2_extract_cube_A3_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/ablation2_extract_cube_A3_10fps
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/ablation2_extract_cube_A3_10fps
- Articulo SmolVLA (arXiv 2506.01844): https://arxiv.org/abs/2506.01844
- Ficha del articulo en Hugging Face Papers: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la informacion del repositorio y de la model card.

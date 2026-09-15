# HyeonseokE/smolvla_ablation2_rank_extract_cube_2000_10fps

# Ficha tecnica: HyeonseokE/smolvla_ablation2_rank_extract_cube_2000_10fps

## Resumen

Se trata de una politica vision-language-action (VLA) de robotica entrenada con LeRobot y publicada por el usuario HyeonseokE en HuggingFace. No es un modelo de lenguaje: es una politica de control motor que consume observaciones multimodales (imagenes de camaras y estado de articulaciones) y produce comandos de accion de 6 dimensiones para un brazo robotico SO-101. Concretamente, es un fine-tune de `lerobot/smolvla_base` sobre un dataset propio de 100 episodios y 31.823 fotogramas grabados a 10 FPS para una unica tarea: extraer un cubo de un hueco y colocarlo sobre una marca objetivo.

El modelo pertenece a la familia SmolVLA, descrita en el paper arXiv:2506.01844, que propone un VLA compacto y eficiente capaz de ejecutarse en hardware de consumo con un coste computacional reducido. El checkpoint pesa 0,9 GB en safetensors y declara 450.046.176 parametros totales, lo que lo situa en la franja de los modelos roboticos ligeros frente a alternativas de 3B a 7B parametros.

Su relevancia es doble. Por un lado, sirve como artefacto reproducible de un experimento de ablacion (el nombre indica `ablation2_rank_extract_cube`) orientado a estudiar como afectan determinadas decisiones de entrenamiento al rendimiento de la politica. Por otro, es un ejemplo practico de fine-tuning de bajo coste sobre hardware accesible: cualquier grupo con un SO-101 puede replicar el flujo con `lerobot-train`. El repositorio no incluye resultados de evaluacion ni datos de rendimiento, y tiene cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); backbone de vision-lenguaje con cabeza de acciones (detalle de capas no disponible en la model card) |
| Parametros totales | 450.046.176 (dato real del safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de control robotico basado en observaciones, no en contexto textual) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | no disponible (la model card no documenta idiomas; la instruccion de tarea se proporciona en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Pipeline | robotics |
| Tipo de robot | `so101_follower` (SO-101) |
| Camaras | `top`, `left_wrist` (tres entradas visuales declaradas de 3x256x256) |
| Entradas | `observation.state` (6,), `observation.images.camera1/2/3` (3, 256, 256) |
| Salidas | `action` (6,), `action.radian_urdf0` (6,) |
| Modelo base | lerobot/smolvla_base |
| Tamano del repositorio | 0,9 GB |
| Version de LeRobot | 0.6.0 |
| Fecha de publicacion | 2026-09-15 |

## Arquitectura y entrenamiento

La model card identifica el modelo como SmolVLA, un VLA compacto y eficiente segun la formulacion del paper arXiv:2506.01844. La arquitectura combina un componente de vision-lenguaje que procesa las imagenes de camara con un modulo que genera acciones motoras continuas; la model card no detalla el numero de capas, la dimension oculta ni el mecanismo concreto de generacion de acciones, por lo que esos datos quedan como no disponibles. El modelo consume tres flujos visuales de 256x256 pixeles (etiquetados como `camera1`, `camera2` y `camera3`, correspondientes a las camaras `top` y `left_wrist` del montaje) junto con un vector de estado propioceptivo de 6 dimensiones, y emite un vector de accion de 6 dimensiones mas una variante en radianes para URDF.

El entrenamiento es un fine-tuning supervisado por imitacion desde `lerobot/smolvla_base` sobre el dataset `HyeonseokE/ablation2_rank_extract_cube_10fps`: 100 episodios, 31.823 fotogramas a 10 FPS, todos ellos de la tarea "extract the cube from the pocket and place it on the target marker". La configuracion registrada es de 24.850 pasos, batch de 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 2000, ejecutado con LeRobot 0.6.0. No se documenta el uso de RLHF, DPO ni tecnicas de refuerzo; el paradigma es puramente de aprendizaje por imitacion. Tampoco se especifican tecnicas de inferencia asincrona, decodificacion especulativa ni optimizaciones de atencion para este checkpoint concreto.

## Capacidades

- Control motor de manipulacion: genera comandos de accion de 6 grados de libertad para un brazo SO-101 a partir de observaciones visuales y de estado.
- Percepcion multimodal: procesa simultaneamente tres imagenes de 256x256 (camara superior y muneca) junto con el vector de estado de 6 dimensiones.
- Ejecucion de una tarea especifica de pick-and-place: extraer un cubo de un hueco y depositarlo sobre un marcador objetivo.
- Aprendizaje por imitacion end-to-end: la politica mapea observaciones a acciones sin planificacion simbolica intermedia.
- Fine-tuning adicional: al derivar de `lerobot/smolvla_base`, puede reentrenarse con `lerobot-train` sobre nuevos datasets de la misma morfologia de robot.
- Despliegue en hardware de consumo: el paper de SmolVLA y el tamano del checkpoint (450M parametros) apuntan a inferencia viable fuera de clusters de datacenter.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso basado en lenguaje ni comportamiento de agente conversacional.
- No genera texto libre ni mantiene dialogos; no es un modelo de chat.
- Capacidades multilingues: no disponibles (la unica instruccion textual es la descripcion de tarea, en ingles).
- Capacidades especiales: no se documentan modos de pensamiento, vision generativa, audio ni memoria de largo plazo.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: con un SO-101 y dos camaras configuradas segun la model card, la politica ejecuta la secuencia completa de extraccion y colocacion del cubo, lo que permite montar una celda robotica de bajo coste para tareas repetitivas de manipulacion.
- Reproduccion de experimentos de ablacion: el nombre del repositorio y de la semilla (2000) sugieren que forma parte de una comparativa sistematica; sirve para replicar la variante `rank_extract_cube` y contrastarla con otros checkpoints de la misma serie.
- Punto de partida para fine-tuning propio: con `lerobot-train --policy.path=lerobot/smolvla_base` y un dataset nuevo de la misma morfologia, un equipo puede adaptar la politica a otra tarea de manipulacion en pocas horas de GPU.
- Docencia e investigacion en robotica de imitacion: sirve como ejemplo completo y ejecutable del flujo de LeRobot (grabacion de datos, entrenamiento, rollout) en cursos o practicas de laboratorio.
- Evaluacion comparativa de politicas VLA: al compartir arquitectura base con SmolVLA, se puede usar para medir el efecto de distintos datasets, tasas de aprendizaje o semillas manteniendo fijo el backbone.
- Prototipado de pipelines de inferencia en bucle cerrado: `lerobot-rollout` con `--strategy.type=base` permite lanzar la politica durante una duracion fija (por ejemplo, 60 segundos) para validar latencias, calibracion de camaras y comportamiento antes de integrarla en un sistema mayor.
- Pruebas de transferencia entre robots de la misma familia: dado que el modelo se entreno para `so101_follower`, es un candidato natural para estudiar la degradacion de rendimiento al variar iluminacion, posicion inicial del objeto o montaje de camaras.
- Demostraciones con hardware accesible: el tamano del checkpoint lo hace adecuado para demostraciones en ferias, jornadas o visitas escolares con una estacion de trabajo convencional, sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la linea "_No evaluation results have been provided for this policy yet._" y deja vacia la tabla de evaluacion en robot real (tarea, numero de intentos, exitos y tasa de exito). Tampoco se proporcionan cifras de MMLU, HumanEval, GSM8K (no aplicables, al no ser un modelo de lenguaje) ni metricas especificas de robotica como tasa de exito por episodio, tiempo de ejecucion o numero de intentos hasta el fallo.

| Metrica | Resultado |
|---|---|
| Tasa de exito en robot real | no disponible |
| Numero de intentos evaluados | no disponible |
| Benchmarks de lenguaje (MMLU, HumanEval, GSM8K) | no aplicable |
| Latencia de inferencia medida | no disponible |
| Comparacion con otros checkpoints de la ablacion | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M parametros, los pesos ocupan aproximadamente 1,8 GB en FP32 y unos 0,9 GB en BF16/FP16 (coincide con el tamano del repositorio). Sumando imagenes de 256x256x3 y activaciones, una estimacion razonable es de 2 a 4 GB de VRAM en BF16; es una estimacion, no un dato publicado.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente. Se puede usar una RTX 3050/3060, RTX 4060, RTX 4090 o superiores; en el extremo profesional, A100 o H100 sobran para este tamano, aunque no aportan ventaja proporcional.
- Compatibilidad con GPU de consumo: si. Es uno de los puntos fuertes declarados de SmolVLA ("can be deployed on consumer-grade hardware"), y el propio tamano del checkpoint lo respalda.
- Inferencia en CPU: LeRobot permite ejecutar politicas en CPU con `--policy.device=cpu`; con 450M parametros es plausible aunque la latencia no esta documentada. No hay dato publicado de frecuencia de control alcanzable.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) y el ecosistema `lerobot` sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no es un modelo de generacion de texto.
- Latencia y throughput estimados: no disponibles. El dataset se grabo a 10 FPS, lo que sugiere que esa es la frecuencia de control del montaje original, pero la model card no reporta la frecuencia alcanzada en inferencia.
- Almacenamiento: el repositorio ocupa 0,9 GB, por lo que cabe sin problema en cualquier disco local.

## Comparativa con modelos similares

Los valores de modelos de terceros son orientativos, procedentes de fuentes publicas, y no se han podido verificar con la informacion proporcionada en esta busqueda. Se recomienda comprobarlos en sus fichas oficiales antes de tomar decisiones.

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| HyeonseokE/smolvla_ablation2_rank_extract_cube_2000_10fps | 450.046.176 | VLA fine-tuneado para tarea unica (SO-101) | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| lerobot/smolvla_base | ~450M (mismo backbone) | VLA base preentrenado, fine-tuneable | apache-2.0 (segun el ecosistema LeRobot) | HuggingFace, modelo de referencia de LeRobot |
| OpenVLA-7B | ~7B | VLA de proposito general | depende del modelo base (Llama 2) y del codigo | HuggingFace y repositorio publico |
| pi0 (Physical Intelligence) | ~3B | VLA con experto de acciones | no disponible | anunciado publicamente, disponibilidad limitada |
| GR00T N1 (NVIDIA) | ~2B | VLA/robot foundation model | no disponible | publicado por NVIDIA |

Diferencias clave: frente a OpenVLA-7B o pi0, este checkpoint es entre 4 y 15 veces mas pequeno en parametros, lo que reduce drasticamente los requisitos de VRAM, pero a cambio esta especializado en una unica tarea y morfologia de robot y no ofrece ninguna cifra de rendimiento publicada. Su licencia apache-2.0 es mas permisiva que la de los VLA construidos sobre backbones con licencias restrictivas.

## Limitaciones y advertencias

- Especializacion extrema: la politica se entreno exclusivamente para la tarea "extract the cube from the pocket and place it on the target marker" con un SO-101. No debe esperarse generalizacion a otros objetos, posiciones o robots.
- Ausencia total de evaluacion: no hay tasa de exito, numero de intentos ni condiciones de prueba documentadas. No se puede afirmar que la politica funcione de forma fiable en produccion.
- Riesgo de sobreajuste al montaje: al depender de tres camaras con posiciones concretas (`top`, `left_wrist`) y de un estado de 6 dimensiones, cualquier cambio de calibracion, iluminacion o montaje puede degradar el comportamiento de forma no medida.
- Alucinacion en sentido amplio: como politica de imitacion, puede generar secuencias de acciones plausibles pero incorrectas ante situaciones fuera de distribucion, sin mecanismo de deteccion de fallo ni de recuperacion.
- Idiomas: no se documenta soporte multilingue. La unica entrada textual es la descripcion de tarea en ingles; cambiar el idioma de la instruccion no esta garantizado.
- Licencia del modelo: apache-2.0, permisiva para uso comercial. Sin embargo, conviene revisar la licencia del dataset de entrenamiento (`HyeonseokE/ablation2_rank_extract_cube_10fps`), que no se especifica en la informacion proporcionada, asi como las condiciones del modelo base `lerobot/smolvla_base`.
- Trazabilidad limitada: cero descargas y cero likes, repositorio con una unica version y model card en gran parte plantilla sin rellenar. Es un artefacto de investigacion, no un modelo mantenido.
- Advertencia de seguridad fisica: al tratarse de control robotico, un fallo de la politica puede provocar colisiones, dano al brazo o a objetos cercanos. Cualquier despliegue deberia incluir limites de par, parada de emergencia y supervision humana.
- Restriccion de despliegue: al no ser un modelo de lenguaje, no se puede servir con stacks de inferencia de texto (vLLM, TGI, llama.cpp, Ollama); requiere el stack de LeRobot y el hardware robotico correspondiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HyeonseokE/smolvla_ablation2_rank_extract_cube_2000_10fps
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/ablation2_rank_extract_cube_10fps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/ablation2_rank_extract_cube_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los enlaces anteriores proceden exclusivamente de la informacion de HuggingFace y de la model card.

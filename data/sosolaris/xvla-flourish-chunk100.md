# SoSolaris/xvla-flourish-chunk100

## Resumen

SoSolaris/xvla-flourish-chunk100 es una politica de robotica (Vision-Language-Action) entrenada por el usuario SoSolaris mediante fine-tuning del modelo base lerobot/xvla-base, que implementa el metodo X-VLA descrito en el paper arXiv:2510.10274. X-VLA es un marco VLA con *soft prompting* y *flow matching* que trata cada configuracion de robot o hardware como una "tarea" representada por un pequeno conjunto de embeddings de Soft Prompt aprendibles, de modo que un unico modelo puede reconciliar morfologias, sensores y espacios de accion distintos. Este checkpoint concreto esta especializado en un unico caso de uso: la tarea "Grab the tape" sobre un brazo SO-101 follower con dos camaras declaradas.

El modelo tiene 879.687.256 parametros (aproximadamente 880 millones) y un repositorio de 1,8 GB, lo que sugiere pesos en precision de 16 bits. Consume tres entradas visuales (dos a 256x256 y una a 224x224), un vector de estado de 8 dimensiones y produce un vector de accion de 6 dimensiones. Se distribuye bajo licencia Apache 2.0 y se ejecuta con la libreria LeRobot (version 0.6.2 en el entrenamiento).

Su relevancia es doble: por un lado, sirve como ejemplo reproducible de fine-tuning de un VLA multimodal sobre hardware de bajo coste (SO-101); por otro, ilustra el enfoque de X-VLA de unificar multiples robots en un solo modelo mediante soft prompts. Sus limitaciones son importantes: el dataset de entrenamiento tiene solo 20 episodios y 7071 fotogramas de una unica tarea, y el autor no ha publicado ningun resultado de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con soft prompting y cabecera de accion por flow matching (X-VLA) |
| Parametros totales | 879.687.256 (aproximadamente 880 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no documentada; la politica opera sobre observaciones y chunk de acciones, no sobre contexto de texto) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible (la model card no declara idiomas; las instrucciones de tarea son cadenas de texto, en el ejemplo "Grab the tape" en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Tipo de robot | so101_follower |
| Camaras declaradas | right, up (la tabla de entradas lista tres caracteristicas visuales, ver advertencias) |
| Entradas | observation.images.image (3, 256, 256); observation.images.image2 (3, 256, 256); observation.images.image3 (3, 224, 224); observation.state (8,) |
| Salidas | action (6,) |
| Modelo base | lerobot/xvla-base |
| Tamano del repositorio | 1,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

X-VLA es un marco VLA con *soft prompting* y *flow matching*: en lugar de entrenar un modelo independiente por robot, codifica cada configuracion de robot o hardware como una "tarea" mediante un conjunto reducido de embeddings de Soft Prompt aprendibles. Esto permite que un unico modelo acomode morfologias, sensores y espacios de accion heterogeneos. La salida de accion se genera con un esquema de flow matching (modelado generativo continuo de las acciones), y el backbone es de tipo vision-lenguaje-accion, es decir, combina codificadores visuales con un modelo de lenguaje y una cabeza de accion. El sufijo "chunk100" del nombre del repositorio sugiere un horizonte de *action chunking* de 100 pasos, pero este dato no esta confirmado en la model card.

El fine-tuning se realizo sobre el dataset MrC4t/FlourishGrabTape, compuesto por 20 episodios, 7071 fotogramas a 15 FPS y una unica tarea: "Grab the tape". La configuracion de entrenamiento declarada es de 20000 pasos, batch size 8, optimizador "xvla-adamw", learning rate 0.0001, seed 1000 y LeRobot 0.6.2. No se documenta el numero total de tokens, la composicion del dataset mas alla de lo indicado, ni si hubo etapas de RLHF, DPO o refinamiento posterior al entrenamiento por imitacion. Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de acciones de robot: produce un vector de accion de 6 dimensiones a partir de observaciones visuales y de estado, adecuado para control de un brazo SO-101 follower.
- Percepcion visual multi-camara: consume tres flujos de imagen (dos a 256x256 y uno a 224x224), lo que permite politicas con vistas complementarias.
- Condicionamiento por tarea en lenguaje: acepta una instruccion de tarea como cadena de texto (por ejemplo, "Grab the tape"), coherente con el enfoque Vision-Language-Action.
- Aprendizaje por imitacion: la politica se ha entrenado a partir de demostraciones reales, no de recompensas.
- Integracion con LeRobot: compatible con el ecosistema lerobot-train / lerobot-rollout y con el Hub de HuggingFace.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- No se documentan capacidades multilingues, modo "thinking", audio ni otras modalidades adicionales.
- No se documenta generacion de texto generico, codigo ni matematicas: es una politica de control, no un LLM conversacional.

## Casos de uso

- Automatizacion de "coger y colocar" en entornos controlados: la politica esta entrenada especificamente para agarrar un rollo de cinta ("Grab the tape"), por lo que puede emplearse para automatizar esa manipulacion repetitiva sobre un brazo SO-101 con dos camaras.
- Prototipado rapido de celulas robotizadas de bajo coste: el brazo SO-101 y LeRobot permiten montar un puesto de trabajo demostrativo a bajo coste, usando este checkpoint como punto de partida funcional.
- Fine-tuning con datos propios: al estar construido sobre lerobot/xvla-base, sirve como plantilla para entrenar variantes con el comando `lerobot-train`, cambiando el dataset y manteniendo el pipeline.
- Reproduccion de investigacion en VLA: util para reproducir el enfoque X-VLA y experimentar con soft prompts, morfologias y espacios de accion distintos.
- Experimentos de aprendizaje por imitacion con datasets pequenos: el caso (20 episodios, 7071 fotogramas) sirve para estudiar el regimen de sobreajuste y la relacion entre cantidad de datos y exito de la politica.
- Docencia y formacion en robotica: permite a estudiantes ejecutar una politica VLA real con `lerobot-rollout` y observar el ciclo completo de datos, entrenamiento y despliegue.
- Evaluacion comparativa de politicas: util como referencia de un checkpoint de una sola tarea frente a politicas generalistas, siempre que se generen datos de evaluacion propios, ya que el autor no publica ninguno.
- Fases de recogida de datos teleoperados: puede integrarse en flujos donde primero se teleopera para grabar demostraciones y despues se entrena o refina la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "No evaluation results have been provided for this policy yet", sin tabla de exito por tarea, numero de ensayos ni condiciones de evaluacion.

## Requisitos de hardware

- Pesos en precision de 16 bits: aproximadamente 1,8 GB (879,7 M de parametros x 2 bytes); en precision de 32 bits, aproximadamente 3,5 GB. El tamano del repositorio (1,8 GB) es coherente con pesos de 16 bits.
- VRAM estimada para inferencia: del orden de 3 a 5 GB en 16 bits, sumando pesos, activaciones de los tres codificadores visuales a 256x256 y 224x224, y buffers de la cabecera de accion. Es una estimacion derivada del numero de parametros, no un dato publicado.
- Cabe en GPU de consumo: si, en cualquier GPU con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070, RTX 4090). Es previsible que tambien quepa en plataformas embebidas tipo NVIDIA Jetson Orin con 8 GB o mas, aunque no esta documentado.
- GPU de centro de datos: no es necesaria una A100 o H100 para inferencia; son utiles solo para reentrenar o hacer fine-tuning con batches mayores.
- Despliegue: el camino documentado es LeRobot (`lerobot-rollout` para ejecutar la politica y `lerobot-train` para entrenarla), con PyTorch y CUDA. No se documenta soporte de vLLM, TGI, Ollama, llama.cpp ni formatos GGUF, que estan orientados a modelos de lenguaje y no a politicas VLA.
- Latencia y throughput: no disponibles. La frecuencia del dataset de entrenamiento es de 15 FPS, lo que da una referencia de la cadencia temporal de los datos, no del rendimiento en inferencia.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de este checkpoint, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos no proceden de la informacion proporcionada y se marcan como no disponibles cuando no se pueden confirmar.

| Modelo | Parametros | Contexto / entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SoSolaris/xvla-flourish-chunk100 | 879.687.256 | 3 entradas visuales + estado (8,); salida de accion (6,) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes | Fine-tuning de una sola tarea sobre 20 episodios |
| lerobot/xvla-base | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace (referenciado como base) | Modelo base del que deriva este checkpoint |
| Otras politicas VLA de la familia LeRobot (por ejemplo SmolVLA, pi0) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace | Alternativas de la misma categoria (politicas VLA entrenadas con LeRobot); no se dispone de datos verificados en esta busqueda |

No es posible establecer una comparacion de rendimiento cuantitativa con alternativas porque ninguna de las dos partes publica resultados equivalentes en la informacion disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 20 episodios y 7071 fotogramas para una unica tarea. El riesgo de sobreajuste y de fallo ante cambios de posicion de objetos, iluminacion o distractores es alto.
- Sin evaluacion publicada: no existe ninguna tasa de exito medida, ni numero de ensayos, ni descripcion de las condiciones de prueba.
- Alcance funcional limitado: la politica esta entrenada para la tarea "Grab the tape" sobre un robot SO-101 follower; no es un modelo generalista y no cabe esperar transferencia directa a otras tareas o morfologias sin reentrenamiento.
- Discrepancia en la documentacion de sensores: la model card declara dos camaras (`right`, `up`) pero la tabla de entradas lista tres caracteristicas visuales (`observation.images.image`, `observation.images.image2`, `observation.images.image3`). Conviene verificar la configuracion real antes de desplegar.
- Requisito de coincidencia de claves de observacion: los nombres e indices de camara deben coincidir exactamente con las claves usadas en el entrenamiento; de lo contrario la politica no funcionara correctamente.
- Idiomas no declarados: se desconoce si las instrucciones de tarea en otros idiomas distintos del ingles producen el comportamiento esperado.
- Riesgo de alucinacion en el sentido generativo: aunque no es un modelo de lenguaje conversacional, la cabecera de flow matching genera acciones continuas y puede producir trayectorias plausibles pero incorrectas cuando la observacion se aleja de la distribucion de entrenamiento.
- Sesgos: no documentados por el autor; en robotica por imitacion los sesgos provienen de las condiciones de recogida de datos (posiciones, iluminacion, operador, entorno).
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad de validar la seguridad del comportamiento robotico en su propio entorno; no hay garantias de ningun tipo.
- Idoneidad para produccion: baja en su estado actual. Se recomienda tratarlo como prototipo de investigacion y recoger datos y evaluaciones propios antes de cualquier despliegue real.
- Metadatos poco habituales: el repositorio figura como creado el 2026-09-10, sin descargas ni likes, y con un unico autor; no hay historial de uso ni validacion por terceros.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos datos fiables son los de la model card y los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SoSolaris/xvla-flourish-chunk100
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper de X-VLA (arXiv:2510.10274): https://huggingface.co/papers/2510.10274
- Dataset de entrenamiento: https://huggingface.co/datasets/MrC4t/FlourishGrabTape
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrC4t/FlourishGrabTape
- Guia de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet

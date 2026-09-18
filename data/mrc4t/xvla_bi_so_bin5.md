# MrC4t/xvla_bi_so_bin5

## Resumen

X-VLA (xvla_bi_so_bin5) es una politica robotica visuomotor-lenguaje-accion (Vision-Language-Action, VLA) entrenada por el usuario MrC4t mediante fine-tuning del modelo base lerobot/xvla-base. El metodo subyacente, X-VLA, se describe como un framework VLA de "soft prompts" con flow matching que trata cada configuracion de robot o hardware como una tarea distinta, codificada mediante un pequeno conjunto de embeddings de Soft Prompt aprendibles, de modo que un unico modelo puede reconciliar morfologias, sensores y espacios de accion heterogeneos.

El checkpoint concreto que nos ocupa es un fine-tune especializado en una unica tarea bimanual: "put toy in bin" (meter un juguete en una caja). Se ha entrenado sobre el dataset MrC4t/bimanual_toy_bin (46 episodios, 37.278 fotogramas a 30 FPS) para el tipo de robot `bi_so_follower`, con tres camaras (`head`, `left_wrist`, `right_wrist`), una entrada de estado propioceptivo de 8 dimensiones y una salida de accion de 12 dimensiones (dos brazos de 6 grados de libertad). El modelo tiene 879.687.256 parametros (~880 M) y pesa 1,8 GB en safetensors.

Su relevancia es la de un ejemplo practico del ecosistema LeRobot: muestra como adaptar un VLA preentrenado a hardware bimanual de bajo coste (familia SO-100) con relativamente pocos datos y una receta de entrenamiento reproducible. No obstante, es un checkpoint de investigacion con cero descargas y cero likes en el momento de la consulta, sin resultados de evaluacion publicados, por lo que debe considerarse no validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (X-VLA): transformer con flow matching y soft prompts aprendibles por configuracion de robot |
| Parametros totales | 879.687.256 (~880 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se ofrecen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible; la condicion de tarea observada es la cadena en ingles "put toy in bin" |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

X-VLA es un framework VLA basado en flow matching y condicionado por soft prompts. La idea central es que cada robot o montaje de hardware se modela como una "tarea" representada por un conjunto reducido de embeddings de Soft Prompt aprendibles, en lugar de depender de cabezas de accion especificas o de normalizaciones ad hoc para cada morfologia. De este modo, un unico conjunto de pesos puede cubrir espacios de observacion y de accion distintos (numero de camaras, dimensionalidad del estado propioceptivo, dimensionalidad de la accion). Este checkpoint es un fine-tune de lerobot/xvla-base, por lo que hereda dicho esqueleto y anade el condicionamiento especifico de su hardware.

El entrenamiento se realizo con LeRobot 0.6.2 durante 40.000 pasos, con batch size 16, optimizador `xvla-adamw`, learning rate 1e-4 y semilla 1000. El dataset de fine-tuning es MrC4t/bimanual_toy_bin: 46 episodios y 37.278 fotogramas capturados a 30 FPS, con una unica tarea ("put toy in bin"). La politica consume tres imagenes RGB —`observation.images.image` y `observation.images.image2` a 256x256, y `observation.images.image3` a 224x224— mas un vector `observation.state` de 8 componentes, y produce un vector `action` de 12 componentes. No se documenta en la informacion disponible el uso de RLHF, DPO ni otra fase de alineamiento posterior; el paradigma es de imitation learning supervisado sobre demostraciones de teleoperacion.

## Capacidades

- Generacion de acciones motoras continuas para manipulacion robotica bimanual: salida de 12 dimensiones, compatible con un robot `bi_so_follower` (dos brazos de 6 grados de libertad).
- Percepcion visual multi-camara: procesa simultaneamente tres flujos de imagen (camara de cabeza y dos camaras de muneca) a 256x256 y 224x224.
- Condicionamiento por instruccion en lenguaje natural: la tarea se especifica con una cadena de texto ("put toy in bin"), que se inyecta como condicion del modelo.
- Fusion de propiocepcion y vision: combina el estado articular de 8 dimensiones con las observaciones visuales para producir la accion.
- Politica reactiva en bucle cerrado: disenada para ejecutarse de forma continua sobre el robot fisico a traves del comando `lerobot-rollout`.
- Adaptabilidad a nuevas tareas o morfologias mediante fine-tuning del modelo base lerobot/xvla-base.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso simbolico, vision general de imagenes arbitrarias, audio ni modo "thinking". No es un modelo de lenguaje de proposito general.

## Casos de uso

- Manipulacion bimanual pick-and-place: el caso exacto para el que se entreno el checkpoint. El modelo recibe las tres camaras y el estado articular, y emite las 12 acciones de las dos extremidades para depositar un juguete en una caja. Adecuado para prototipos de laboratorio con el robot `bi_so_follower`.
- Punto de partida para nuevos fine-tunes: al derivar de lerobot/xvla-base y ser Apache-2.0, sirve como referencia de receta de entrenamiento (40.000 pasos, batch 16, lr 1e-4) para adaptar X-VLA a otras tareas bimanuales con un dataset propio.
- Investigacion en politicas VLA con soft prompts: permite estudiar como un condicionamiento de bajo rango permite reutilizar un mismo modelo entre morfologias y espacios de accion diferentes, comparando este checkpoint con su modelo base.
- Validacion de pipelines de imitation learning en LeRobot: util para probar de extremo a extremo los comandos `lerobot-train` y `lerobot-rollout`, la grabacion de datasets y la visualizacion de episodios en el Space de LeRobot.
- Demostraciones docentes de robotica de bajo coste: al ser un modelo de ~880 M con 1,8 GB de pesos, cabe en una GPU de consumo y permite montar una demo reproducible de aprendizaje por imitacion en un aula o taller.
- Estudio de robustez y distribucion de datos: con solo 46 episodios, es un caso util para analizar como varian el exito y el fallo ante cambios de iluminacion, posicion de objetos o distracciones, y para medir cuanto ayuda anadir episodios.
- Banco de pruebas de despliegue en el borde: permite medir latencias reales de una politica VLA de ~880 M en una estacion de trabajo con GPU unica, dentro de un bucle de control a 30 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la seccion de evaluacion vacia, con la nota explicita: "No evaluation results have been provided for this policy yet". Es decir, no hay tasas de exito por tarea, ni numero de ensayos, ni comparaciones con otros checkpoints. Tampoco se proporcionan metricas de MMLU, HumanEval, GSM8K ni equivalentes, que por otra parte no aplican a un modelo de accion robotica.

| Tarea | Ensayos | Exitos | Tasa de exito |
|---|---|---|---|
| put toy in bin | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en fp32 y 1,8 GB en bf16/fp16 solo para los pesos, a lo que hay que sumar el coste de activaciones y de los tres codificadores visuales. No se publican medidas oficiales de consumo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16. En la practica, RTX 3060 12 GB, RTX 4070/4080, RTX 4090, A100 o H100 son opciones razonables; una GPU de 8 GB puede ser suficiente, pero no esta confirmado por el autor.
- Cabe en GPU de consumo: si, con gran probabilidad, dado el tamano de ~880 M de parametros y los 1,8 GB del repositorio.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=MrC4t/xvla_bi_so_bin5` (libreria LeRobot, PyTorch, pesos safetensors) y entrenamiento con `lerobot-train`. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no es un modelo de generacion de texto.
- Latencia y throughput: no disponible. El dataset de demostracion se capturo a 30 FPS, lo que sugiere que el bucle de control espera operar en el entorno de los 30 Hz, pero no se han publicado mediciones reales de latencia por inferencia.

## Comparativa con modelos similares

La comparacion se hace a nivel de especificaciones, porque no existen benchmarks comunes publicados para este checkpoint. Todos los modelos de la tabla son politicas VLA de robotica, la misma categoria que xvla_bi_so_bin5.

| Modelo | Parametros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| MrC4t/xvla_bi_so_bin5 | ~880 M | 3 imagenes RGB + estado de 8 dim; accion de 12 dim | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| lerobot/xvla-base | ~880 M (mismo esqueleto, segun los pesos del fine-tune) | multimodal, segun configuracion | no disponible en la informacion proporcionada | HuggingFace, modelo base de este checkpoint |
| lerobot/smolvla_base (SmolVLA) | ~450 M | imagenes + estado; accion configurable | apache-2.0 | HuggingFace, integrado en LeRobot |
| OpenVLA-7B | ~7.000 M | imagen unica + instruccion de texto; accion de 7 dim | heredada de Llama 2 (no Apache-2.0) | HuggingFace y repositorio publico |
| pi0 (Physical Intelligence) | ~3.000 M | multiples imagenes + estado; flow matching | apache-2.0 (via openpi) | HuggingFace y repositorio openpi |

Diferencias clave: xvla_bi_so_bin5 es el mas pequeno del grupo junto con SmolVLA, lo que reduce los requisitos de VRAM; a diferencia de OpenVLA, no depende de un backbone LLM de 7 B y admite tres camaras y un vector de accion de 12 dimensiones orientado a bimanual. Frente a pi0, carece de la validacion experimental publica y del respaldo de un laboratorio. No hay datos comparativos de tasa de exito entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Modelo no validado: no hay resultados de evaluacion, ni tasa de exito, ni numero de ensayos. El autor deja la seccion de evaluacion vacia.
- Dataset muy reducido: 46 episodios y 37.278 fotogramas para una unica tarea. Es un riesgo alto de sobreajuste y de falta de generalizacion ante cambios de posicion, iluminacion, fondo o presencia de distractores.
- Una sola tarea: el modelo esta especializado en "put toy in bin". No debe esperarse que ejecute otras instrucciones en lenguaje ni que generalice a objetos o contenedores distintos.
- Acoplamiento estricto al hardware: los nombres y las dimensiones de las observaciones (tres camaras concretas, estado de 8 dimensiones) y la dimensionalidad de la accion (12) deben coincidir con el robot `bi_so_follower` y con la configuracion de camaras usada en el entrenamiento. Cualquier cambio de montaje o de camara invalida la politica.
- Idiomas: no hay informacion sobre capacidades multilingues; la condicion de tarea conocida esta en ingles y es una cadena fija.
- Riesgo de comportamiento erratico: como toda politica de imitation learning, ante estados fuera de la distribucion de entrenamiento puede producir acciones bruscas o inseguras. Es imprescindible usar paradas de emergencia y limites de par/velocidad en el robot real.
- Alucinacion en sentido estricto (generacion de texto falso) no aplica, pero si el equivalente funcional: ejecucion de una trayectoria plausible pero incorrecta cuando la escena difiere de los datos de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el modelo base y el metodo citado pueden tener sus propias condiciones; conviene revisarlas antes de un despliegue comercial.
- Sesgos: no disponibles. No se documenta analisis de sesgo demografico, de objetos ni de entorno.
- Fecha de publicacion inusual: el repositorio figura como creado el 18 de septiembre de 2026, dato que conviene verificar directamente en la pagina del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrC4t/xvla_bi_so_bin5
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/MrC4t/bimanual_toy_bin
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrC4t/bimanual_toy_bin
- Paper de X-VLA: https://huggingface.co/papers/2510.10274
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces listados proceden integramente de la informacion de HuggingFace y de la model card.

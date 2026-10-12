# bklassen3434/smolvla_drawer

## Resumen

SmolVLA drawer es un ajuste fino del modelo base lerobot/smolvla_base, publicado por el usuario bklassen3434 bajo licencia Apache 2.0. Se trata de una politica de robotica basada en SmolVLA (SmolVLA: A Vision-Language-Action Model for Affordable and Efficient Robotics, arXiv:2506.01844), un modelo compacto de vision-lenguaje-accion (VLA) disenado para controlar robots manipuladores a partir de observaciones visuales, instrucciones en lenguaje natural y el estado del robot. El checkpoint tiene 450.046.176 parametros (aproximadamente 450 millones) y ocupa 0,9 GB en el repositorio.

Este ajuste concreto se ha entrenado con el dataset bklassen3434/drawer_v2_marked y esta orientado a una tarea especifica de manipulacion de un cajon. Se ha entrenado y subido al Hub mediante LeRobot, la libreria de Hugging Face para aprendizaje por imitacion en robotica. Su relevancia radica en que demuestra el flujo de trabajo de ajustar un VLA preentrenado de tamano reducido para una tarea concreta y desplegarlo en hardware de consumo, algo inusual en modelos de robotica de mayor tamano.

Al ser un derivado de un modelo base abierto y con licencia permisiva, sirve como ejemplo reproducible de fine-tuning de politicas VLA. No obstante, la informacion publicada sobre este checkpoint concreto es minima: no se detallan los hiperparametros de entrenamiento, el numero de episodios utilizados ni los resultados de exito de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), derivada de SmolVLA |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no especifica cuantizaciones adicionales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un componente de percepcion visual y comprension del lenguaje con un modulo generador de acciones motoras. El modelo base lerobot/smolvla_base, del que parte este checkpoint, esta disenado para ser compacto y ejecutarse en hardware de consumo. Este ajuste fino esta entrenado sobre el dataset bklassen3434/drawer_v2_marked, orientado a una tarea de manipulacion de un cajon.

No se dispone de informacion detallada sobre la composicion del dataset, el numero de episodios, el numero de pasos de entrenamiento, la funcion de perdida empleada ni si se aplicaron tecnicas de RLHF/DPO (no aplicables de forma habitual a politicas de robotica por imitacion). El entrenamiento se realizo con la herramienta lerobot-train y el flujo de inferencia/evaluacion con lerobot-record, segun la model card. Cualquier detalle adicional sobre la arquitectura interna (encoder visual, modelo de lenguaje subyacente, experto de acciones) debe consultarse en el paper de SmolVLA referenciado.

## Capacidades

- Control de robot manipulador: genera acciones motoras a partir de observaciones visuales y del estado del robot para ejecutar la tarea de manipulacion de un cajon.
- Percepcion visual integrada: procesa imagenes como entrada (componente de vision).
- Comprension de instrucciones en lenguaje natural: al ser un VLA, acepta condicionamiento por lenguaje (idiomas concretos no especificados).
- Ejecucion de politicas de aprendizaje por imitacion: reproduce comportamientos aprendidos del dataset de demostraciones.
- Despliegue en hardware de consumo: por su tamano (~450 M de parametros), esta pensado para ejecutarse en equipos asequibles.
- No se documentan capacidades de tool calling, agentes multi-paso, vision de proposito general, audio ni generacion de texto general; el modelo esta especializado en robotica.

## Casos de uso

- Automatizacion de apertura y cierre de cajones: el modelo puede controlar un brazo robotico para accionar un cajon concreto, ya que fue ajustado especificamente sobre el dataset drawer_v2_marked.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para estudiar el ajuste fino de politicas VLA sobre tareas concretas con LeRobot.
- Prototipado en robotica de bajo coste: al ser un modelo de ~450 M de parametros, permite validar flujos de vision-lenguaje-accion en plataformas economicas (por ejemplo, brazos tipo SO-100/SO-101) antes de escalar a modelos mayores.
- Reproduccion de tareas domesticas sencillas: manipulacion de objetos en entornos tipo hogar donde se requiera interaccion fisica simple.
- Evaluacion comparativa de politicas: util como referencia de fine-tuning frente al modelo base lerobot/smolvla_base para medir el efecto del ajuste en una tarea acotada.
- Formacion y docencia: ejemplo practico del pipeline completo de LeRobot (entrenamiento con lerobot-train y evaluacion con lerobot-record) para ensenar robotica basada en aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito de la tarea, comparaciones con el modelo base ni metricas de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP32, en torno a 1,8 GB para los pesos; en FP16/BF16, aproximadamente 0,9 GB; en int8, alrededor de 0,45 GB (estimaciones basadas en el numero de parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM libre deberia ser suficiente; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GPU de consumo (por ejemplo, gamas RTX xx60 en adelante) por su tamano reducido.
- Opciones de despliegue: LeRobot (lerobot-record para inferencia y evaluacion, lerobot-train para entrenamiento). No se documentan otros runners como vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bklassen3434/smolvla_drawer | ~450 M | no disponible | Manipulacion de cajon (ajuste fino) | apache-2.0 | Hugging Face (LeRobot) |
| lerobot/smolvla_base | ~450 M | no disponible | VLA general para robotica | apache-2.0 | Hugging Face (LeRobot) |
| Modelos VLA de mayor tamano (por ejemplo, pi0) | no disponible | no disponible | Robotica general | no disponible | no disponible |

Los datos de rendimiento comparativo entre estos modelos no estan disponibles en la informacion proporcionada. La unica comparacion documentada es que este checkpoint deriva del modelo base lerobot/smolvla_base mediante ajuste fino.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta ajustado para una unica tarea (manipulacion de un cajon) y no es un VLA de proposito general.
- Sesgos: no documentados, pero al entrenarse sobre un dataset especifico puede reproducir los sesgos y las condiciones de dicho dataset (iluminacion, posiciones, objeto concreto).
- Riesgo de fallo fuera de distribucion: al ser una politica de imitacion, es probable que degrade su comportamiento ante condiciones distintas a las vistas durante el entrenamiento.
- Idiomas: no especificados; se desconoce si el condicionamiento por lenguaje esta limitado al ingles u otros idiomas.
- Ausencia de metricas: no se publican tasas de exito ni evaluaciones, por lo que su rendimiento real en la tarea no puede verificarse con los datos disponibles.
- Licencia: apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset utilizados.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.
- Caveat de produccion: no se documentan procesos de seguridad, limites de parada de emergencia ni validacion en entornos reales; su uso en produccion requeriria verificacion adicional en el robot objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bklassen3434/smolvla_drawer
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/bklassen3434/drawer_v2_marked
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot

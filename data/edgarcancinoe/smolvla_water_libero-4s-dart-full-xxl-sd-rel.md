# edgarcancinoe/smolvla_water_libero-4s-dart-full-xxl-sd-rel

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. La ficha que nos ocupa, edgarcancinoe/smolvla_water_libero-4s-dart-full-xxl-sd-rel, es un ajuste fino (fine-tune) del modelo base lerobot/smolvla_base realizado por el usuario edgarcancinoe (Jose Edgar Hernandez Cancino Estrada) para una tarea concreta: regar plantas con un brazo robótico Franka Panda.

El modelo recibe dos flujos de imagen (observation.images.image y observation.images.image2) de 256x256 píxeles y un vector de estado de 8 dimensiones, y produce un vector de acción de 7 dimensiones. Cuenta con 604.934.176 parámetros (~605 millones) y se distribuye en formato safetensors bajo licencia Apache 2.0. El ajuste se ha entrenado sobre el dataset edgarcancinoe/water_pour_dart_full-xxl, compuesto por 1286 episodios y 979.387 fotogramas a 20 FPS, con tres tareas etiquetadas: "Water the left plant", "Water the middle plant" y "Water the right plant".

Es relevante porque ejemplifica el flujo de trabajo de ajuste fino de políticas robóticas con LeRobot sobre datos de demostración propios, un patrón cada vez más habitual para adaptar modelos VLA genéricos a tareas específicas de manipulación con hardware de coste moderado. No obstante, el autor no ha publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); backbone VLM con experto de acciones (detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 604.934.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles (pesos distribuidos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponibles (las instrucciones de tarea del dataset estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA, segun el articulo referenciado (arXiv:2506.01844), es un modelo de vision-lenguaje-accion compacto que combina un modelo de vision-lenguaje preentrenado con un modulo de generacion de acciones, con el objetivo de reducir el coste computacional y permitir su despliegue en hardware de consumo. Esta instancia concreta es un fine-tune del checkpoint lerobot/smolvla_base, por lo que hereda dicha arquitectura; los detalles internos exactos de capas, atencion y mecanismo de decodificacion no se especifican en la informacion disponible de esta ficha.

El entrenamiento se realizo con LeRobot 0.6.1 durante 20.000 pasos, con tamano de lote 32, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El dataset de ajuste contiene 1286 episodios y 979.387 fotogramas capturados a 20 FPS, correspondientes a tres tareas de riego. Se trata de aprendizaje por imitacion (imitation learning) supervisado sobre demostraciones; no hay evidencia en la informacion disponible de que se hayan aplicado etapas de RLHF o DPO. El tipo de robot objetivo es panda y las dos camaras de entrada se denominan image e image2.

## Capacidades

- Generacion de acciones de control robotic (vector de 7 dimensiones) a partir de observaciones visuales y estado del robot.
- Procesamiento de multiples entradas visuales simultaneas (dos camaras de 256x256) para percepción del entorno.
- Condicionamiento por instruccion en lenguaje natural: distingue entre al menos tres tareas ("Water the left plant", "Water the middle plant", "Water the right plant").
- Ejecucion de politicas de manipulacion entrenadas por imitacion para una tarea especifica de riego con brazo Franka Panda.
- Integracion con el ecosistema LeRobot para despliegue y ejecucion continua (lerobot-rollout).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es una politica de control, no un agente conversacional).
- Capacidades multilingues: no disponibles; las instrucciones usadas estan en ingles.
- Capacidades especiales (thinking mode, vision general, audio): no disponibles.

## Casos de uso

- Riego automatizado de plantas en laboratorio o invernadero: el modelo ejecuta la tarea de regar la planta izquierda, central o derecha indicada por la instruccion, usando las dos camaras para localizar la posicion del objeto.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar como el ajuste fino de una politica VLA genérica se adapta a una tarea concreta con cientos de episodios de demostracion.
- Base para nuevos fine-tunes: al derivar de lerobot/smolvla_base y tener licencia Apache 2.0, puede reutilizarse como checkpoint intermedio para transferir a tareas de manipulacion relacionadas.
- Reproduccion de experimentos con LeRobot: permite replicar el pipeline de entrenamiento y despliegue documentado (20000 pasos, lote 32, AdamW) sobre hardware propio.
- Evaluacion comparativa de politicas VLA: util como referencia de un fine-tune de tarea unica frente a politicas multitarea como smolvla-libero.
- Automatizacion de tareas de vertido/manipulacion de liquidos: por la denominacion del dataset (water pour), puede emplearse en escenarios de vertido controlado sobre un brazo Panda con camaras calibradas.
- Docencia y prototipado en robotica: al desplegarse en hardware de consumo, resulta adecuado para practicas de control robótico y demostraciones de VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de exito ni metricas de robot real verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4 GB en precisión completa (fp32) y alrededor de 1,2 GB en fp16/bf16, considerando los ~605 millones de parametros. El tamano del repositorio es de 2,4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; cabe holgadamente en NVIDIA RTX 3060, RTX 4060, RTX 4070, RTX 4090, y en GPUs de datacenter como A100 o H100.
- Compatibilidad con GPU de consumo: si, cabe en practicamente todas las GPU de consumo modernas con 6 GB o mas de VRAM, e incluso en algunas integradas con memoria unificada suficiente.
- Opciones de despliegue: LeRobot (comando lerobot-rollout), con PyTorch como backend; no se documentan otros runtimes como vLLM, llama.cpp, Ollama o TGI, que no estan orientados a politicas VLA.
- Latencia y throughput: no disponibles. La captura de datos del dataset se realizo a 20 FPS, pero no se especifica la frecuencia de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| edgarcancinoe/smolvla_water_libero-4s-dart-full-xxl-sd-rel | 604.934.176 | No disponible | Sin evaluacion publicada | Apache 2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | No disponible | No disponible | No disponible en esta busqueda | No disponible | Hugging Face |
| bicmol/smolvla-libero | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| smolvla_libero (HuggingFaceVLA) | ~605 millones (segun savrn.com) | No disponible | No disponible | No disponible | Hugging Face / Inferix |

La comparativa cuantitativa de rendimiento no esta disponible, ya que ninguno de los modelos alternativos consultados publica cifras verificables en la informacion recogida.

## Limitaciones y advertencias

- Ausencia de evaluacion: no hay resultados de robot real ni tasas de exito, por lo que el rendimiento efectivo de la politica es desconocido.
- Especificidad de tarea: el modelo esta ajustado para tres tareas concretas de riego; no es un modelo generalista y probablemente fallara fuera de ese dominio.
- Dependencia de hardware y calibracion: requiere un brazo Franka Panda con dos camaras configuradas exactamente con las claves de observacion image e image2; variaciones de camara o calibracion pueden degradar el comportamiento.
- Idiomas: la informacion sobre idiomas soportados no esta disponible; las instrucciones del dataset estan en ingles, por lo que el uso en castellano no esta garantizado.
- Contexto: no se especifica longitud de contexto; al ser una politica de control, no esta pensada para conversaciones largas.
- Sesgos conocidos: no disponibles. Al entrenarse con datos de demostracion de un unico entorno, puede heredar sesgos de posicion, iluminacion, color o disposicion de los objetos del dataset.
- Riesgo de alucinacion: en el sentido de generar trayectorias de accion incorrectas o inseguras ante situaciones no vistas, particularmente peligroso en manipulacion con liquidos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base (lerobot/smolvla_base) y del dataset utilizado.
- Caveat de produccion: el repositorio registra 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad; se aconseja evaluar exhaustivamente en entorno controlado antes de cualquier despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edgarcancinoe/smolvla_water_libero-4s-dart-full-xxl-sd-rel
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/edgarcancinoe/water_pour_dart_full-xxl
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=edgarcancinoe/water_pour_dart_full-xxl
- Articulo SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil del autor: https://huggingface.co/edgarcancinoe
- Modelo comparable smolvla-libero: https://huggingface.co/bicmol/smolvla-libero

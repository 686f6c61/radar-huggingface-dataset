# njchristoffersen/act_pick_place

## Resumen

`njchristoffersen/act_pick_place` es una politica robotica de aprendizaje por imitacion basada en ACT (Action Chunking with Transformers), el metodo descrito en el paper arXiv:2304.13705 y referenciado en la propia model card. El autor (njchristoffersen) la ha entrenado y publicado con LeRobot, la libreria de HuggingFace para machine learning en robotica real, y el repositorio ocupa 0,2 GB con pesos en formato safetensors.

El modelo resuelve una tarea concreta de manipulacion: "place black cylinder in red bowl" (colocar un cilindro negro en un cuenco rojo), sobre un robot de tipo `so_follower` con dos camaras (`wrist` y `top`). Consume el estado del robot (vector de 6 dimensiones) y dos imagenes RGB de 3x240x320, y produce un vector de accion de 6 dimensiones. Es, por tanto, un componente de control de bajo nivel, no un modelo de lenguaje ni un sistema multimodal general.

Su relevancia es fundamentalmente como ejemplo reproducible y de bajo coste de un pipeline de imitacion con LeRobot, no como modelo de proposito general. Conviene senalar desde el principio que la model card declara **un unico paso de entrenamiento** y **un unico episodio de demostracion (470 fotogramas, 30 FPS)**, por lo que se trata de una politica practicamente sin entrenar y sin resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con cuello de botella VAE y codificadores visuales por camara |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (politica de imitacion; usa historial de observaciones y prediccion de chunks de acciones, valores no especificados en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no aplica (politica robotica; sin entrada ni salida de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `wrist`, `top` |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 240, 320), `observation.images.top` (3, 240, 320) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que predice *chunks* de acciones (varias acciones futuras de una vez) en lugar de un unico paso, lo que reduce el error de acumulacion y permite politicas mas suaves, y que segun el paper suele alcanzar tasas de exito altas a partir de datos teleoperados. La arquitectura combinada con los 51.668.614 parametros totales y el uso de dos camaras es coherente con una configuracion ACT con codificadores visuales (tipo ResNet) por vista y un transformer encoder-decoder con componente generativo latente; la model card no detalla la configuracion exacta de capas, dimensiones ni el modo de ensamblado temporal de acciones.

El entrenamiento se realizo con LeRobot sobre el dataset `njchristoffersen/pick_place_demo_20260922_103418`: 1 episodio, 470 fotogramas, 30 FPS, tarea unica "place black cylinder in red bowl". La configuracion declarada es de **1 paso de entrenamiento**, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se menciona ningun proceso de RLHF, DPO ni ajuste posterior; tampoco se documentan aumentos de datos, normalizacion ni estrategia de evaluacion. Con estos numeros, el modelo esta esencialmente en estado inicial de entrenamiento.

## Capacidades

- Generacion de acciones de control continuas de 6 dimensiones para un robot `so_follower` a partir de estado propioceptivo y dos vistas de camara.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas (paradigma ACT): reproduce la tarea para la que fue entrenado.
- Prediccion de secuencias (chunks) de acciones, en lugar de paso a paso, segun el metodo ACT referenciado.
- Integracion con el ecosistema LeRobot: ejecucion con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de capacidades multilingues ni de entrada/salida de lenguaje natural.
- No dispone de modo de razonamiento (thinking), vision general, audio ni generacion de texto.

## Casos de uso

- Replicacion de la tarea de pick-and-place en banco de pruebas: ejecutar la politica sobre un `so_follower` para colocar un cilindro negro en un cuenco rojo, usando las mismas claves de observacion (`wrist`, `top`) con las que fue entrenada.
- Plantilla de referencia para imitacion con LeRobot: sirve como esqueleto para grabar un dataset propio, ajustar el `policy.type=act` y publicar una politica nueva en el Hub.
- Validacion de un pipeline de teleoperacion y calibracion de camaras: comprobar que las lecturas de estado y las dos vistas se alinean correctamente antes de entrenar en serio.
- Pruebas de infraestructura de inferencia robotica: verificar latencias y sincronizacion del bucle de control a 30 FPS con un modelo pequeno (51,7 M de parametros) antes de escalar a politicas mayores.
- Docencia y divulgacion: ejemplo minimo y de bajo coste para explicar el flujo completo de aprendizaje por imitacion (grabar datos, entrenar, desplegar, evaluar).
- Investigacion sobre variantes de ACT: punto de partida para comparar cambios en el numero de camaras, el chunking o el numero de pasos de entrenamiento frente a una linea base conocida.
- Este modelo, en su estado actual, **no es adecuado** para produccion ni para tareas fuera del escenario de laboratorio, dado su nivel de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "No evaluation results have been provided for this policy yet.", por lo que no hay tasas de exito en tareas reales, ni numero de ensayos, ni comparaciones cuantitativas con otras politicas. Tampoco se aportan metricas de perdida de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 51.668.614 parametros, sin contar activaciones ni buffers de vision): ~207 MB en fp32, ~103 MB en fp16 y ~52 MB en int8. Con activaciones y las dos imagenes de entrada, es razonable esperar un consumo de VRAM del orden de unos pocos cientos de MB, aunque no hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060, RTX 4090, A100 o H100 estan enormemente sobredimensionadas para este tamano. La model card usa `--policy.device=cuda` en los ejemplos de entrenamiento.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia, dado el reducido numero de parametros.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion y `lerobot-train` para reentrenamiento) sobre PyTorch, con pesos safetensors. vLLM, llama.cpp, Ollama y TGI **no aplican**, ya que son herramientas para modelos de lenguaje y esta es una politica de control robotico.
- Latencia y throughput: no disponibles. El dataset se grabo a 30 FPS y el bucle de control debe respetar esa cadencia, pero no se publican mediciones de latencia de inferencia en hardware concreto.

## Comparativa con modelos similares

No hay datos cuantitativos publicados para esta politica, por lo que la comparacion es metodologica. Se contrasta con otros enfoques habituales de aprendizaje por imitacion en robotica.

| Modelo / metodo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_pick_place (este modelo) | ACT: transformer encoder-decoder con chunking de acciones | 51.668.614 | no disponible | apache-2.0 | pesos safetensors en el Hub, 0 descargas |
| Diffusion Policy | Politica generativa por difusion | no disponible | no disponible | no disponible | Implementaciones publicas; soportado en LeRobot |
| VQ-BeT | Tokenizacion vectorial cuantizada de comportamiento | no disponible | no disponible | no disponible | Implementaciones publicas; soportado en LeRobot |
| SmolVLA / pi0 (VLAs) | Vision-language-action, entrada de lenguaje natural | no disponible | no disponible | no disponible | Pesos publicos en el Hub; soportado en LeRobot |

La diferencia clave frente a los VLA es que este modelo no acepta instrucciones en lenguaje natural y esta especializado en una unica tarea, mientras que las alternativas VLA apuntan a generalizacion entre tareas. Los datos marcados como "no disponible" no se han podido confirmar en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenamiento practicamente inexistente: 1 paso de entrenamiento sobre 1 episodio (470 fotogramas). Es altamente improbable que la politica resuelva la tarea de forma fiable.
- Sin evaluacion: no hay tasa de exito, numero de ensayos ni condiciones de prueba, por lo que se desconoce por completo su rendimiento real.
- Especializacion extrema: entrenada para una sola tarea ("place black cylinder in red bowl") en un tipo de robot concreto (`so_follower`) y con dos camaras concretas (`wrist`, `top`). Cambiar el robot, las camaras o la tarea invalida la politica.
- Sensibilidad al entorno: no se documentan variaciones de posicion de objetos, iluminacion, distractores ni robustez ante cambios, que en ACT suelen degradar el rendimiento.
- Entrada/salida limitada: no procesa lenguaje natural ni instrucciones; solo estado de 6 dimensiones e imagenes de 3x240x320.
- Riesgo de alucinacion en el sentido clasico no aplica; el riesgo equivalente es la generacion de acciones erroneas o inseguras que pueden danar el robot o el entorno.
- Sesgos: no disponibles; al proceder de una unica demostracion, hereda inevitablemente los sesgos y la variabilidad de ese unico episodio.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero la licencia no cubre la seguridad fisica del despliegue; cualquier uso en robot real exige validacion y medidas de parada de emergencia.
- Uso en produccion desaconsejado en su estado actual por falta de entrenamiento y de validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/njchristoffersen/act_pick_place
- Dataset de entrenamiento: https://huggingface.co/datasets/njchristoffersen/pick_place_demo_20260922_103418
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=njchristoffersen/pick_place_demo_20260922_103418
- Paper de ACT (arXiv:2304.13705): https://arxiv.org/abs/2304.13705
- Paper de ACT en HuggingFace Papers: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de grabacion y entrenamiento (imitation learning): https://huggingface.co/docs/lerobot/en/il_robots
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet

Nota: los resultados de la busqueda web proporcionados (repositorios de prompts tipo DAN, hilos de Reddit sobre ChatGPT y debates sobre modelos de lenguaje) no guardan relacion con este modelo y no se han utilizado.

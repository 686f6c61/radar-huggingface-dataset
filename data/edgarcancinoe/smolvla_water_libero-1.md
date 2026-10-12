# edgarcancinoe/smolvla_water_libero-1

## Resumen

Smolvla_water_libero-1 es una politica robotica de tipo vision-language-action (VLA) publicada por el usuario edgarcancinoe y obtenida mediante fine-tuning de lerobot/smolvla_base, el modelo base compacto de SmolVLA desarrollado por HuggingFace. El modelo aprende por imitacion una tarea concreta de manipulacion: regar una de tres plantas ("Water the left/middle/right plant") con un brazo Franka Panda equipado con dos camaras RGB. Resuelve, por tanto, el problema de convertir instrucciones en lenguaje natural mas observaciones visuales y de estado en comandos de accion de bajo nivel para un robot real.

Tecnicamente es un VLA compacto: 604.934.176 parametros (~605 M) en formato safetensors, con la libreria LeRobot y licencia Apache 2.0. La arquitectura sigue el diseno de SmolVLA (arXiv:2506.01844), que combina un backbone de vision-lenguaje (familia SmolVLM) con un experto de acciones basado en flow matching, pensado para inferencia asincrona y despliegue en hardware de consumo en lugar de grandes clusters.

Su relevancia es doble. Por un lado demuestra el flujo de trabajo de fine-tuning de politicas VLA sobre datasets pequenos y abiertos (47 episodios, 35.370 frames a 20 FPS) usando el stack LeRobot. Por otro, es un ejemplo de politica entrenada y publicada sin resultados de evaluacion, lo que la convierte en un caso de estudio para quien quiera reproducir el entrenamiento y medir su tasa de exito real en robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) estilo SmolVLA: backbone VLM (familia SmolVLM) mas experto de acciones con flow matching |
| Parametros totales | 604.934.176 (~605 M) |
| Longitud de contexto | No aplica en el sentido de LLM: consume una observacion (2 imagenes de 256x256 y un vector de estado de 8 dimensiones) y emite acciones; valor textual de contexto no disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan versiones GGUF ni cuantizadas) |
| Idiomas soportados | Instrucciones en ingles (tareas del dataset); no se documentan otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato LeRobot) |
| Tipo de robot | Franka Panda (`panda`) |
| Entradas | `observation.images.image` (3,256,256), `observation.images.image2` (3,256,256), `observation.state` (8,) |
| Salidas | `action` (7,) |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de lerobot/smolvla_base, que a su vez implementa la arquitectura SmolVLA descrita en arXiv:2506.01844. SmolVLA es un VLA compacto que acopla un backbone de vision-lenguaje preentrenado (encoder visual SigLIP mas un modelo de lenguaje de la familia SmolLM) con un experto de acciones entrenado mediante flow matching, un esquema generativo que modela la distribucion de trayectorias de accion de forma continua en lugar de predecir un unico vector de forma determinista. La politica puede ejecutarse con inferencia asincrona, de modo que el calculo de la siguiente accion se solape con la ejecucion de la anterior para enmascarar la latencia.

El entrenamiento concreto de este checkpoint se realizo con LeRobot 0.6.1 sobre el dataset edgarcancinoe/water_pour (47 episodios, 35.370 frames, 20 FPS, tres tareas de riego). La configuracion reportada es de 10.000 pasos, batch size 16, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se especifican en la informacion disponible el numero de tokens de imagen, la composicion exacta del dataset de preentrenamiento del modelo base ni si se aplicaron etapas de RLHF o DPO; para esos detalles hay que remitirse al paper de SmolVLA.

## Capacidades

- Control robotico por imitacion: genera comandos de accion de 7 dimensiones (posicion y orientacion del efector mas apertura/cierre del gripper) para un Franka Panda.
- Percepcion visual multi-camara: consume dos flujos de imagen RGB a 256x256.
- Fusion de estado y vision: combina el vector de estado del robot (8 dimensiones) con las imagenes para condicionar la accion.
- Seguimiento de instrucciones en lenguaje natural: responde a las ordenes "Water the left plant", "Water the middle plant" y "Water the right plant".
- Ejecucion en bucle cerrado sobre robot real mediante el comando `lerobot-rollout` del stack LeRobot.
- Fine-tuning adicional: puede servir como punto de partida para entrenar otras tareas con `lerobot-train`.
- No dispone de tool calling, function calling, capacidades de agente, generacion de texto general, codigo, matematicas, audio ni vision de proposito general. Es una politica de accion, no un modelo de lenguaje.

## Casos de uso

- Automatizacion de riego en laboratorio o invernadero experimental: la politica ejecuta la secuencia de aproximacion, vertido y retirada sobre una de las tres plantas indicadas por la instruccion, adecuada para entornos controlados donde la posicion de las macetas es estable.
- Reproduccion de experimentos de imitation learning: sirve para validar de extremo a extremo el pipeline de LeRobot (grabacion de datos, entrenamiento, despliegue con `lerobot-rollout`) sin necesidad de disenar una tarea nueva.
- Punto de partida para fine-tuning de tareas de manipulacion con liquidos: al estar ya ajustado a vertido controlado, reduce el numero de episodios necesarios para tareas relacionadas como llenar recipientes o dosificar.
- Estudio de transferencia simulacion-real: el nombre del repositorio referencia LIBERO, por lo que es util para comparar el comportamiento de una politica entrenada con datos reales frente a entornos simulados.
- Docencia en robotica y aprendizaje por imitacion: el modelo es lo bastante pequeno (605 M) para ejecutarse en equipos de laboratorio modestos y explicar el ciclo completo de una politica VLA.
- Evaluacion comparativa de politicas VLA compactas: permite medir tiempo de inferencia, suavidad de trayectoria y robustez frente a perturbaciones en un banco de pruebas fisico concreto.
- Recogida iterativa de datos (data flywheel): desplegar la politica, registrar los fallos y reentrenar con los episodios adicionales para mejorar la tasa de exito del vertido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este checkpoint indica explicitamente que no se han proporcionado resultados de evaluacion y no incluye tabla de exitos en robot real.

| Benchmark | Resultado |
|---|---|
| LIBERO | no disponible para este fine-tuning |
| Evaluacion en robot real | no evaluada por el autor en la informacion disponible |

El paper de SmolVLA (arXiv:2506.01844) reporta resultados del modelo base en suites de manipulacion y en configuraciones reales, pero las cifras concretas no forman parte de la informacion proporcionada y deben consultarse directamente en la publicacion.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 1,21 GB; en fp32: aproximadamente 2,42 GB (sin contar activaciones ni buffers de inferencia). El repositorio ocupa 1,2 GB.
- VRAM estimada para inferencia: por debajo de 4-6 GB en bf16 una vez cargado el modelo y las dos imagenes de 256x256; margen amplio en tarjetas de 8 GB o mas.
- GPU recomendadas: cualquier NVIDIA moderna con soporte CUDA y al menos 6-8 GB de VRAM (RTX 3060, RTX 4070, RTX 4090). Tambien es viable en A100 y H100, aunque estan sobredimensionadas para 605 M de parametros.
- Cabe en GPU de consumo: si. SmolVLA esta disenado explicitamente para hardware de consumo, y este checkpoint mantiene ese regimen.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout` con `--policy.path=edgarcancinoe/smolvla_water_libero-1`), PyTorch con CUDA. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que son servidores de modelos de lenguaje y esta es una politica de accion.
- Latencia y throughput: no disponibles. SmolVLA emplea inferencia asincrona para solapar el calculo de acciones con la ejecucion, lo que reduce la latencia efectiva percibida por el robot, pero no se publican cifras para este checkpoint.
- Requisitos adicionales: puerto de comunicacion del robot y camaras configurados con los nombres de observacion exactos (`image`, `image2`) con los que se entreno la politica.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| smolvla_water_libero-1 | ~605 M | VLA (SmolVLA fine-tuned) | Apache 2.0 | HuggingFace / LeRobot | Politica especifica para riego de plantas con Panda; sin evaluacion publicada |
| SmolVLA base (lerobot/smolvla_base) | ~450 M (modelo base; el checkpoint ajustado reporta 605 M) | VLA | Apache 2.0 | HuggingFace / LeRobot | Modelo generalista del que deriva este checkpoint; requiere fine-tuning por tarea |
| OpenVLA | ~7 B | VLA | consultar repositorio oficial | HuggingFace | Mucho mayor tamano; pensado para zero-shot con prompts de tarea |
| pi0 (lerobot/pi0) | ~3,3 B | VLA (flow matching) | consultar repositorio oficial | HuggingFace / LeRobot | Mayor capacidad, coste de inferencia mas alto |
| ACT | ~80 M | Politica de imitacion | consultar repositorio | LeRobot | Alternativa ligera sin componente de lenguaje; solo imitacion |

La comparacion con OpenVLA, pi0 y ACT se ofrece a titulo orientativo: los valores exactos de licencia y rendimiento de esos modelos deben verificarse en sus repositorios oficiales, ya que no forman parte de la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: esta entrenado unicamente para tres tareas de riego con un Franka Panda y un montaje de camaras concreto. Fuera de esa distribucion no cabe esperar comportamiento fiable.
- Dataset muy reducido: 47 episodios y 35.370 frames, lo que limita la robustez frente a variaciones de posicion, iluminacion o apariencia.
- Ausencia de evaluacion: no hay tasa de exito publicada, ni en simulacion ni en robot real. El rendimiento en produccion es, a dia de hoy, desconocido.
- Sensibilidad al montaje: exige que los nombres de camara (`image`, `image2`), sus indices y la calibracion del robot coincidan con los del entrenamiento; cualquier cambio degrada la politica.
- Acumulacion de error en rollouts largos: como toda politica de imitacion en bucle cerrado, los errores pequenos pueden desviar la trayectoria y provocar fallos irrecuperables.
- Idiomas: las instrucciones estan en ingles; la comprension multilingue depende del backbone VLM y no esta documentada para esta politica.
- Sesgos: al no ser un modelo generativo de lenguaje no presenta sesgos textuales, pero puede heredar sesgos de los datos de demostracion (posiciones, objetos y condiciones concretas).
- Alucinacion: no aplica en el sentido linguistico; el riesgo equivalente es la ejecucion de acciones incorrectas con alta confianza.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la responsabilidad de seguridad fisica del robot recae enteramente en el usuario.
- Seguridad: al operar con liquidos y un brazo robotico, es imprescindible validar la politica en un entorno controlado antes de cualquier despliegue real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edgarcancinoe/smolvla_water_libero-1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Dataset de entrenamiento: https://huggingface.co/datasets/edgarcancinoe/water_pour
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=edgarcancinoe/water_pour
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet

# muktha212/smolvla_pick_candy

## Resumen

`muktha212/smolvla_pick_candy` es una política robotica de tipo vision-language-action (VLA) obtenida por ajuste fino del modelo base `lerobot/smolvla_base`. No es un modelo de lenguaje: su funcion es mapear observaciones sensoriales de un brazo robotico (tres camaras RGB y el estado de las articulaciones) directamente a acciones motoras de 6 dimensiones. El objetivo concreto para el que se ha entrenado es una unica tarea de manipulacion: recoger un caramelo y dejarlo en un cuenco ("Pick up the candy and place it in the bowl"), sobre un robot de tipo `so_follower` con una camara frontal.

El modelo lo publica el usuario `muktha212` y se ha entrenado y subido con LeRobot, la libreria de Hugging Face para aprendizaje por imitacion. Cuenta con 450.046.176 parametros (unos 450 M) y un repositorio de 0,9 GB en formato safetensors, lo que lo situa en la franja de modelos desplegables en hardware de consumo, tal como reclama la familia SmolVLA descrita en el paper arXiv 2506.01844.

Su relevancia es practica: sirve como ejemplo reproducible de un pipeline completo de imitacion (grabacion de datos, entrenamiento, rollout) y como punto de partida para quien quiera reentrenar la misma arquitectura con su propio dataset. Conviene subrayar que es un ajuste fino mono-tarea con 50 episodios y sin resultados de evaluacion publicados, por lo que su valor actual es experimental y educativo, no de produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta de la familia SmolVLA; política de imitación que consume observaciones (imágenes + estado) y emite acciones. El detalle interno del backbone no se especifica en la model card (ver paper arXiv 2506.01844) |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | No aplica (no es un modelo MoE; no se publican parametros activos) |
| Longitud de contexto | No aplica como ventana de texto. Entrada: `observation.state` (6,), `observation.images.camera1/2/3` (3, 256, 256) cada una; salida: `action` (6,) |
| Tipos de cuantizacion | No disponible (no se documentan variantes cuantizadas; pesos en safetensors, repositorio de 0,9 GB) |
| Idiomas soportados | No disponible. La unica instruccion de tarea documentada esta en ingles: "Pick up the candy and place it in the bowl" |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA se presenta en la model card como un modelo vision-language-action compacto y eficiente, con rendimiento competitivo a coste computacional reducido y capacidad de ejecutarse en hardware de consumo. En esta ficha concreta, la política recibe tres imagenes de 256x256 píxeles y un vector de estado de 6 dimensiones, y produce un vector de accion de 6 dimensiones, que es el espacio de control tipico de un brazo `so_follower` de 6 grados de libertad. La model card no desglosa la arquitectura interna (backbone de vision-lenguaje, cabezal de acciones, mecanismo de difusion o flow matching); esa informacion debe consultarse en el paper enlazado.

El entrenamiento se hizo por imitacion supervisada con LeRobot 0.6.1 sobre el dataset `muktha212/pick_candy_20261015_190154`: 50 episodios, 19.779 fotogramas a 30 FPS y una unica tarea. La configuracion documentada es de 10.000 pasos, batch de 32, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se menciona uso de RLHF, DPO ni datos humanos de preferencia, algo esperable en una política de imitacion. Tampoco se documentan innovaciones tecnicas adicionales ni el numero total de tokens o muestras vistas.

| Hiperparametro | Valor |
|---|---|
| Pasos de entrenamiento | 10.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.1 |
| Episodios / fotogramas | 50 / 19.779 a 30 FPS |
| Tipo de robot | `so_follower` |
| Camaras | `front` (la model card declara tres entradas visuales) |

## Capacidades

- Control robótico end-to-end: genera comandos de accion de 6 dimensiones a partir de imagenes y del estado de las articulaciones.
- Ejecucion de una tarea de manipulacion concreta: recoger un caramelo y colocarlo en un cuenco.
- Condicionamiento por instruccion en lenguaje natural en ingles, segun la frase de tarea usada en el entrenamiento.
- Fusion de tres vistas de camara (256x256) mas el estado proprioceptivo, lo que permite cierto grado de robustez ante oclusiones parciales desde un unico punto de vista.
- Inferencia en hardware de consumo, segun la descripcion de la familia SmolVLA.
- Integracion con el ecosistema LeRobot: entrenamiento con `lerobot-train` y ejecucion con `lerobot-rollout`.
- No soporta tool calling, function calling, generacion de texto, codigo, matematicas, vision descriptiva, audio ni modos de razonamiento extendido: no es un modelo de lenguaje y no se documenta ninguna de esas capacidades.
- No hay evidencia publicada de capacidades multilingues ni de generalizacion a instrucciones distintas de la de entrenamiento.

## Casos de uso

- Replicacion del experimento en un brazo SO-100/SO-101: ejecutar la política con `lerobot-rollout`, `--robot.type=so_follower` y `--policy.path=muktha212/smolvla_pick_candy` permite reproducir la tarea de recogida de objetos y validar la cadena completa de hardware y software.
- Punto de partida para ajuste fino con datos propios: al derivar de `lerobot/smolvla_base` y entrenarse con `lerobot-train` en 10.000 pasos, sirve como referencia de configuracion (AdamW, lr 1e-4, batch 32) para quien entrene tareas similares de pick-and-place.
- Docencia y formacion en robotica: es un ejemplo completo y de bajo coste de aprendizaje por imitacion, desde la grabacion del dataset hasta el despliegue, con un repositorio de solo 0,9 GB.
- Kitting y alimentacion de lineas en entornos controlados: la tarea de coger un objeto y depositarlo en un contenedor es representativa de operaciones de clasificacion simple, siempre que se reentrene con la iluminacion, objetos y posiciones del puesto real.
- Pruebas de integracion de pipelines de robotica: sirve para validar drivers de camara, calibracion, frecuencias de control y latencias antes de invertir en un modelo mayor.
- Referencia comparativa en investigacion: al ser un ajuste fino mono-tarea de ~450 M de parametros, permite medir coste y tasa de exito frente a políticas de mayor escala en el mismo banco de pruebas.
- Recogida asistida en laboratorio: con un dataset adicional de 50 a 100 episodios y variaciones de posicion, podria adaptarse a tareas de recogida de objetos pequenos en superficies planas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion vacia, con la nota literal "No evaluation results have been provided for this policy yet", por lo que no existe tasa de exito medida en robot real ni numero de ensayos.

| Metrica | Valor |
|---|---|
| Tasa de exito en robot real | No disponible |
| Numero de ensayos | No disponible |
| MMLU, HumanEval, GSM8K u otros benchmarks de LLM | No aplica (no es un modelo de lenguaje) |
| Perplejidad o perdida final de entrenamiento | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: los 450 M de parametros ocupan aproximadamente 0,9 GB en fp16/bf16 (coincide con el tamano del repositorio) y unos 1,8 GB en fp32. Sumando activaciones del codificador visual para tres imagenes de 256x256 y el estado, una horquilla razonable es de 2 a 4 GB, aunque es una estimacion y no un dato publicado.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia bastar (RTX 3050, RTX 3060, RTX 4060, RTX 4090). Para entrenamiento, se recomienda al menos 8-12 GB; con 10.000 pasos y batch 32 conviene una RTX 3090/4090 o una A100 si se quiere reducir tiempo.
- Cabe en GPU de consumo: si, segun la propia descripcion de SmolVLA y por el tamano del checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento) sobre PyTorch con aceleracion CUDA. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de acciones.
- Latencia y throughput: no disponible. El dataset se grabo a 30 FPS, pero no se publica la frecuencia de inferencia alcanzada ni el tiempo por paso de la política.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `muktha212/smolvla_pick_candy` | 450.046.176 | 3 imagenes 256x256 + estado (6,) | Pick-and-place de un caramelo en un cuenco | Apache-2.0 | Publico en Hugging Face |
| `lerobot/smolvla_base` | No disponible en la informacion (misma familia, tamano comparable segun el ajuste) | No disponible | Política VLA general, punto de partida para ajuste fino | No disponible en la informacion | Publico en Hugging Face |
| Políticas de imitacion tipo ACT o Diffusion Policy (LeRobot) | No disponible en la informacion | Solo imagenes y estado, sin condicionamiento por lenguaje en su formulacion habitual | Manipulacion por imitacion | No disponible en la informacion | Disponibles en el ecosistema LeRobot |
| VLA de mayor escala (por ejemplo, familia pi0 o RT-2) | No disponible en la informacion | No disponible | Manipulacion generalista | No disponible en la informacion | Parcialmente publicos |

La comparacion cuantitativa no es posible con los datos disponibles: no hay tasas de exito publicadas para este ajuste fino ni cifras verificables de los alternativas en la informacion proporcionada. La diferencia verificable frente a `lerobot/smolvla_base` es el dataset de especializacion (50 episodios de una unica tarea) y la configuracion de entrenamiento documentada.

## Limitaciones y advertencias

- Mono-tarea: la política solo se ha entrenado con la instruccion "Pick up the candy and place it in the bowl". No hay evidencia de que responda correctamente a otras ordenes o variaciones de redaccion.
- Dataset muy pequeno: 50 episodios y 19.779 fotogramas implican un riesgo alto de sobreajuste al entorno, iluminacion, posicion de los objetos y disposicion de las camaras del montaje original.
- Sin evaluacion publicada: no existe tasa de exito medida, por lo que se desconoce su fiabilidad real incluso en la tarea entrenada.
- Dependencia del hardware: el modelo espera un robot `so_follower` con estado y accion de 6 dimensiones y tres camaras de 256x256. Los nombres de las camaras deben coincidir con las claves de observacion usadas en el entrenamiento o el rollout fallara.
- Riesgo de alucinacion en sentido literal: no aplica generacion de texto, pero si existe el riesgo de acciones fisicas incorrectas o inseguras cuando la escena se aleja de la distribucion de entrenamiento (objetos distintos, reflejos, oclusiones, cambios de fondo).
- Sin idiomas verificados: la unica frase documentada esta en ingles; no se ha evaluado el comportamiento con instrucciones en castellano.
- Seguridad fisica: es una política de control motor sin capa de seguridad documentada. En cualquier uso real deben existir limites de par, paradas de emergencia y supervision humana.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero se ofrece sin garantias; el autor no documenta condiciones adicionales ni datos de procedencia del dataset mas alla del repositorio enlazado.
- Reproducibilidad: se documentan semilla (1000) y version de LeRobot (0.6.1), pero no la version exacta de librerias de deep learning ni el hardware de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muktha212/smolvla_pick_candy
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/muktha212/pick_candy_20261015_190154
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=muktha212/pick_candy_20261015_190154
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

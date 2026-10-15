# b-sky-lab/smolvla_pap_bluecube_redcube

## Resumen

`b-sky-lab/smolvla_pap_bluecube_redcube` es una política robótica de visión-lenguaje-acción (VLA) obtenida por ajuste fino del modelo base `lerobot/smolvla_base` mediante la librería LeRobot. El modelo consume el estado del robot y tres señales de cámara y produce directamente las acciones de control de un brazo `so_follower` (SO-100 follower). Está especializado en dos tareas concretas de manipulación: coger un cubo azul y depositarlo sobre un círculo, y la misma operación con un cubo rojo.

SmolVLA es, según la propia model card, un modelo VLA compacto y eficiente que busca rendimiento competitivo con un coste computacional reducido y capacidad de despliegue en hardware de consumo. Esta variante tiene 450.046.176 parámetros (~450 M) y un repositorio de 0,9 GB en formato safetensors, lo que la sitúa en el rango de modelos que pueden ejecutarse en una GPU de gama consumer, sin necesidad de clústeres.

El interés de esta ficha es doble: por un lado, es un ejemplo práctico y reproducible de ajuste fino de una política VLA sobre un dataset propio de imitación; por otro, ilustra el flujo completo de LeRobot (grabación de datos, entrenamiento y despliegue con `lerobot-rollout`). No se han publicado resultados de evaluación ni cifras de benchmarks para esta política concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; el detalle interno no se especifica en la informacion disponible |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se documenta una ventana de contexto; la entrada se define por observaciones de robot) |
| Tipos de cuantizacion | No disponible (el repositorio se distribuye en safetensors; no se listan variantes cuantizadas) |
| Idiomas soportados | No disponible (las instrucciones del dataset estan en ingles: "Pick the blue cube and place it on the circle", "Pick the red cube and place it on the circle") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Otras especificaciones de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.camera1` | VISUAL | `(3, 256, 256)` |
| `observation.images.camera2` | VISUAL | `(3, 256, 256)` |
| `observation.images.camera3` | VISUAL | `(3, 256, 256)` |
| `action` (salida) | ACTION | `(6,)` |

## Arquitectura y entrenamiento

Segun la informacion disponible, se trata de un modelo de vision-lenguaje-accion (VLA) de la familia SmolVLA, ajustado a partir del checkpoint `lerobot/smolvla_base` con la libreria LeRobot (version 0.6.0). La politica recibe como observacion el estado articular del robot (vector de 6 componentes) y tres flujos de imagen RGB de 256x256, y emite un vector de accion de 6 dimensiones. El tipo de robot declarado es `so_follower` y las camaras registradas incluyen `wrist`. No se detallan en la informacion proporcionada la composicion interna del transformer, el mecanismo de atencion ni si se emplean tecnicas adicionales como decodificacion especulativa.

El entrenamiento se realizo sobre el dataset `b-sky-lab/pap_bluecube_redcube_20261015_003104`, compuesto por 100 episodios y 38.640 fotogramas grabados a 30 FPS. La configuracion de entrenamiento fue de 20.000 pasos, batch de 64, optimizador AdamW con learning rate 0,0001 y semilla 1000. Las dos tareas supervisadas son "Pick the blue cube and place it on the circle" y "Pick the red cube and place it on the circle". No se indica si hubo fases de RLHF, DPO u otro ajuste posterior al entrenamiento por imitacion.

## Capacidades

- Control de un brazo robotico `so_follower` mediante prediccion directa de acciones de 6 grados de libertad a partir del estado y de tres vistas de camara.
- Manipulacion de objetos especifica para dos tareas entrenadas: colocar el cubo azul sobre el circulo y colocar el cubo rojo sobre el circulo.
- Percepcion visual multimodal: procesa simultaneamente tres imagenes RGB de 256x256 junto con el estado del robot.
- Ejecucion condicionada por instruccion textual (la tarea se pasa como `--task` en `lerobot-rollout`), aunque las instrucciones soportadas se limitan a las dos tareas del dataset.
- Integracion con el flujo de LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de audio.
- No se documenta soporte multilingue ni un modo de "thinking".

## Casos de uso

- Automatizacion de picking controlado en laboratorio: recoger cubos de un color concreto y depositarlos en una posicion marcada (el circulo del dataset). Es el uso directo para el que fue entrenado.
- Banco de pruebas de imitacion robotica: usar esta politica como referencia para comparar tecnicas de recogida de datos, aumentos de dataset o hiperparametros en LeRobot.
- Prototipado rapido en robotica educativa: al ser una politica de ~450 M y 0,9 GB, puede desplegarse en equipos con una sola GPU consumer para clases o talleres de aprendizaje por imitacion.
- Base para ajuste fino adicional: partir de este checkpoint para nuevas tareas con objetos, posiciones o colores similares, aprovechando que ya ha aprendido la dinamica del brazo `so_follower`.
- Validacion de pipelines de adquisicion de datos: comprobar si 100 episodios y 38.640 fotogramas a 30 FPS son suficientes para una tarea de colocacion concreta y medir la tasa de exito real.
- Demostraciones en ferias o demos de laboratorio: ejecutar la tarea en bucle (sin `--duration` el script corre indefinidamente) como exhibicion reproducible de una VLA compacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"). Tampoco se aportan cifras de exito en robot real, latencia ni throughput.

## Requisitos de hardware

- Los pesos ocupan 0,9 GB en safetensors, lo que corresponde a un modelo de 450 M de parametros.
- Estimaciones de VRAM a partir del numero de parametros (calculos derivados, no datos declarados por el autor): aproximadamente 1,8 GB en fp32, ~0,9 GB en fp16/bf16 y ~0,45 GB en int8 para los pesos. A ello hay que sumar el coste de las tres imagenes de entrada y del runtime.
- La model card afirma que SmolVLA "puede desplegarse en hardware de consumo", por lo que una RTX 3060, RTX 4090 o similar deberia ser suficiente para la inferencia; no se especifican modelos de GPU concretos.
- Despliegue previsto con la libreria LeRobot: `lerobot-rollout` para ejecucion en el robot y `lerobot-train` para reentrenamiento (con `--policy.device=cuda`).
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama ni TGI, al tratarse de una politica robotica y no de un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `b-sky-lab/smolvla_pap_bluecube_redcube` | ~450 M | No disponible | Sin evaluacion publicada | Apache 2.0 | HuggingFace (repo `b-sky-lab`) |
| `lerobot/smolvla_base` | No disponible en la informacion recogida | No disponible | No disponible | No disponible | HuggingFace (`lerobot`) |
| Otras politicas VLA (p. ej. OpenVLA, pi0) | No disponible | No disponible | No disponible | No disponible | No verificado en esta busqueda |

La unica comparacion fiable con los datos disponibles es frente a su modelo base `lerobot/smolvla_base`, del que esta politica es un ajuste fino especializado en dos tareas concretas. No se dispone de cifras verificables de otros modelos VLA en la informacion proporcionada.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce la tasa de exito real en robot, por lo que no debe asumirse un rendimiento concreto en produccion.
- Politica altamente especializada: esta entrenada unicamente para dos tareas ("cubo azul" y "cubo rojo" sobre un circulo) y sobre la configuracion concreta de camaras y robot del dataset. Fuera de ese dominio no hay garantia de comportamiento.
- Dependencia de la configuracion de sensores: las camaras y sus nombres deben coincidir exactamente con las claves de observacion del entrenamiento (`observation.images.camera1/2/3`, `observation.state` de 6 componentes). Cambios de camara, calibracion, iluminacion o disposicion de objetos pueden degradar el rendimiento.
- Generalizacion limitada: solo 100 episodios y 38.640 fotogramas de entrenamiento; la variabilidad de posiciones, colores e iluminacion es reducida.
- Riesgo de fallo fisico: al controlar un brazo real, una accion incorrecta puede provocar colisiones o danos materiales; se recomienda supervisar la ejecucion y disponer de parada de emergencia.
- Sesgos: no documentados, aunque un dataset de dos tareas tan concretas implica un sesgo claro hacia esos objetos, colores y posiciones.
- Idiomas: no se documenta soporte multilingue; las instrucciones del dataset estan en ingles.
- Licencia Apache 2.0: permite uso comercial y modificacion con las condiciones habituales de atribucion y aviso de licencia; conviene revisar tambien las condiciones de los pesos base `lerobot/smolvla_base` y del dataset asociado.
- No se documentan cuantizaciones oficiales ni soporte para runtimes alternativos a LeRobot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/b-sky-lab/smolvla_pap_bluecube_redcube
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/b-sky-lab/pap_bluecube_redcube_20261015_003104
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=b-sky-lab/pap_bluecube_redcube_20261015_003104
- Paper de SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia / rollout: https://huggingface.co/docs/lerobot/main/en/inference

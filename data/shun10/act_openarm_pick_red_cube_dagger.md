# shun10/act_openarm_pick_red_cube_dagger

## Resumen

`shun10/act_openarm_pick_red_cube_dagger` es una politica de robotica basada en ACT (Action Chunking with Transformers), publicada en HuggingFace Hub por el usuario shun10 y entrenada con la libreria LeRobot de HuggingFace. No es un modelo de lenguaje: es un modelo de imitacion (imitation learning) que consume el estado articular y tres flujos de imagen de un robot bimanual y produce directamente comandos de accion. El modelo resuelve una tarea concreta de manipulacion: "Pick up the red cube and place it on the green dish." (coger el cubo rojo y dejarlo en el plato verde).

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo de trabajo actual de la robotica open source: datos teleoperados, entrenamiento con LeRobot 0.6.0 y publicacion del checkpoint en el Hub con una unica CLI. Por otro, es un ejemplo de politica de 51.689.104 parametros (unos 51,7 M) que cabe holgadamente en GPU de consumo e incluso en CPU, con un repositorio de solo 0,2 GB.

El entrenamiento se realizo sobre el dataset `nkmurst/openarm_...dagger_...merged_pick_red_cube`, con 138 episodios, 100.197 fotogramas a 30 FPS y 20.000 pasos de optimizacion, e incorpora datos recogidos con DAgger (correcciones humanas sobre las trayectorias del propio modelo). El modelo se publico el 6 de octubre de 2026 y acumula 0 descargas y 0 likes, por lo que debe considerarse un artefacto experimental sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con componente generativo tipo CVAE y prediccion de trozos de accion (action chunking), segun el paper arXiv:2304.13705 |
| Parametros totales | 51.689.104 (aprox. 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); en la practica, ventana de observacion definida por la configuracion de la politica en LeRobot |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas en la informacion proporcionada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje); la unica instruccion de tarea documentada esta en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | `bi_openarm_follower` (bimanual) |
| Camaras | `left_wrist`, `front`, `right_wrist` |
| Entradas | `observation.state` (16,); `observation.images.left_wrist` (3, 480, 640); `observation.images.front` (3, 480, 640); `observation.images.right_wrist` (3, 480, 640) |
| Salidas | `action` (16,) |
| Frecuencia de control | 30 FPS (frecuencia del dataset de entrenamiento) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers), descrito en el paper arXiv:2304.13705, es un metodo de aprendizaje por imitacion que predice secuencias cortas de acciones (chunks) en lugar de un unico paso de control. La formulacion tipica combina un transformer encoder-decoder con un prior de tipo CVAE: un encoder observa la secuencia de imagenes y el estado para inferir una variable latente de estilo, y un decoder autoregresivo genera el trozo de acciones condicionado por las observaciones actuales y dicha latente. Este diseno mitiga el problema del compounding error propio del behavioral cloning paso a paso y reduce el jitter temporal de las trayectorias.

En este caso concreto, el modelo consume un vector de estado de 16 dimensiones y tres imagenes RGB de 480x640 (muneca izquierda, frontal y muneca derecha), y emite un vector de accion de 16 dimensiones, coherente con un robot bimanual. El entrenamiento se hizo con LeRobot 0.6.0 durante 20.000 pasos con AdamW, batch size 8, learning rate 1e-05 y semilla 1000. El dataset asociado contiene 138 episodios y 100.197 fotogramas a 30 FPS capturados sobre la tarea "Pick up the red cube and place it on the green dish."; el nombre del dataset incluye `dagger`, lo que indica que las demostraciones provienen de entrenamiento con DAgger (intervenciones humanas correctivas sobre las ejecuciones del propio modelo), una practica habitual para robustecer la politica frente a los estados de error que ella misma visita. No se documenta en la informacion disponible el numero de tokens de imagen, la composicion exacta de la latente CVAE ni si hubo etapas adicionales de ajuste (RLHF, DPO u otras), que en cualquier caso no son habituales en este tipo de politicas.

## Capacidades

- Generacion de acciones de manipulacion bimanual: predice un vector de 16 grados de libertad de accion a partir de estado y vision.
- Control guiado por vision multi-camara: fusiona tres vistas (frontal y dos munecas) a 480x640, lo que permite cierto grado de correccion de perspectiva y de oclusion.
- Ejecucion de una tarea especifica de pick-and-place: coger un cubo rojo y colocarlo en un plato verde.
- Ejecucion de politicas de imitacion condicionadas por instruccion: la CLI de despliegue recibe el campo `--task` con la descripcion textual de la tarea.
- Tolerancia a estados de recuperacion: el uso de datos DAgger busca que la politica se recupere de desviaciones respecto a la trayectoria nominal.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico, capacidades multilingues ni modos de pensamiento (thinking mode); no aplica a este tipo de modelo.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: la politica se puede desplegar con `lerobot-rollout` sobre un `bi_openarm_follower` para recoger objetos de color conocido y depositarlos en una zona definida, sin necesidad de programar trayectorias de cinematica inversa.
- Base para entrenamiento con DAgger: los checkpoints de ACT son un punto de partida habitual para iterar con correcciones humanas, mejorando la robustez en las zonas donde la politica falla.
- Prototipado rapido de politicas de imitacion: al ocupar 0,2 GB y 51,7 M de parametros, sirve como referencia de bajo coste para validar pipelines de datos, grabacion y evaluacion en robot real.
- Benchmark interno de hardware y camaras: permite medir latencia de inferencia y tasa de exito de un setup bimanual completo antes de invertir en modelos de mayor tamano.
- Investigacion en manipulacion bimanual: la configuracion de 16 dimensiones de accion y tres camaras es un escenario representativo para estudiar coordinacion entre brazos.
- Docencia y formacion en robotica open source: el flujo completo (dataset, `lerobot-train`, `lerobot-rollout`) es reproducible en un solo equipo con GPU de consumo, lo que facilita practicas guiadas.
- Reentrenamiento con objetos o posiciones nuevas: cambiando el dataset y repitiendo `lerobot-train --policy.type=act` se puede adaptar la misma receta a otras tareas de pick-and-place, siempre que el numero de acciones y camaras se mantenga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor incluye explicitamente la indicacion de que no se han proporcionado resultados de evaluacion en robot real para esta politica, y la plantilla de tabla de evaluacion (tarea, ensayos, exitos, tasa de exito) aparece vacia.

| Metrica | Resultado |
|---|---|
| Tasa de exito en robot real | no disponible (no se han publicado evaluaciones) |
| Numero de ensayos | no disponible |
| Comparacion con otras politicas | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,2 GB en el repositorio, con 51.689.104 parametros; en precision de 32 bits los pesos ocupan del orden de 0,2 GB, por lo que la inferencia cabe en cualquier GPU con 2 GB o mas de memoria.
- GPU recomendadas: practicamente cualquier GPU moderna sirve; NVIDIA RTX 3060, RTX 4090, A100 y H100 son mas que suficientes. En el extremo opuesto, tambien es viable ejecutar la politica en CPU, aunque con riesgo de no alcanzar los 30 Hz.
- GPU de consumo: si, cabe en todas las GPU de consumo actuales (RTX 3050 y superiores) e incluso en plataformas embebidas tipo Jetson Orin, siempre que se cumpla el presupuesto de latencia.
- Opciones de despliegue: `lerobot-rollout` con la estrategia `base` es el camino documentado por el autor. No aplican servidores de inferencia de lenguajes como vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones. Como referencia de requisito, el dataset de entrenamiento esta capturado a 30 FPS, por lo que un control fluido exige inferencia sostenida a 30 Hz o superior (menos de 33 ms por paso de control, o ejecucion de chunks con buffer).
- Almacenamiento: el repositorio completo ocupa 0,2 GB, sin requisitos especiales de disco.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| `shun10/act_openarm_pick_red_cube_dagger` | 51,7 M | estado (16,) + 3 imagenes 480x640 | Apache-2.0 | HuggingFace Hub, libreria lerobot |
| Politicas ACT genericas de LeRobot | no disponible | configurable | Apache-2.0 (licencia del proyecto LeRobot) | HuggingFace Hub y repositorio LeRobot |
| Diffusion Policy (implementacion LeRobot) | no disponible | estado + imagenes, configurable | no disponible | repositorio LeRobot |
| SmolVLA (familia de politicas VLA de HuggingFace) | no disponible | estado + imagenes + instruccion en lenguaje natural | no disponible | HuggingFace Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, entradas, licencia y disponibilidad. Cualquier afirmacion sobre tasas de exito relativas requeriria una evaluacion propia en el mismo robot y la misma tarea.

## Limitaciones y advertencias

- Sin evaluacion publicada: la model card no incluye tasa de exito ni numero de ensayos, por lo que el rendimiento real en robot es desconocido.
- Especificidad extrema de la tarea: la politica esta entrenada unicamente para "Pick up the red cube and place it on the green dish." No es un modelo de proposito general ni transferible a otras tareas sin reentrenamiento.
- Dependencia del hardware: esta ligada al tipo de robot `bi_openarm_follower` y a la configuracion exacta de camaras (`left_wrist`, `front`, `right_wrist`) y a la resolucion 480x640. Cualquier cambio de camara, montaje o calibracion invalida las observaciones.
- Sensibilidad a cambios de entorno: variaciones de iluminacion, posicion de los objetos, fondos distintos o presencia de distractores pueden degradar el comportamiento, algo tipico en politicas de imitacion con 138 episodios.
- Riesgo de fallo silencioso: en tareas de manipulacion, un error no se manifiesta como una alucinacion textual, sino como una accion fisica incorrecta que puede danar el objeto, el robot o el entorno. Se recomienda supervision humana y limites de par.
- Sesgos del dataset: el dataset recoge un unico objeto y una unica tarea, con un operador y un entorno concretos. No hay garantia de generalizacion a otros colores, formas, materiales o posiciones.
- Idiomas: no aplica soporte multilingue. La instruccion de tarea documentada esta en ingles.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero no cubre las patentes ni la responsabilidad sobre el comportamiento fisico del sistema; el despliegue en produccion exige evaluacion de seguridad propia.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion de terceros. Debe tratarse como un artefacto experimental.
- Ausencia de cuantizaciones documentadas: no se describen variantes GGUF, int8 u otras, por lo que la optimizacion de latencia queda a cargo del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shun10/act_openarm_pick_red_cube_dagger
- Dataset de entrenamiento: https://huggingface.co/datasets/nkmurst/openarm_20260914_153326_150633_20260916_150242_140511_dagger_20260924_merged_pick_red_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nkmurst/openarm_20260914_153326_150633_20260916_150242_140511_dagger_20260924_merged_pick_red_cube
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Citacion de LeRobot (Cadene et al., 2024): https://github.com/huggingface/lerobot

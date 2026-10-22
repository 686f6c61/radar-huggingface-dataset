# jbae28/smolvla_finetune_new

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado en el ecosistema LeRobot de HuggingFace, disenado para controlar robots manipuladores a partir de observaciones visuales y un estado proprioceptivo, siguiendo instrucciones en lenguaje natural. Este repositorio concreto, `jbae28/smolvla_finetune_new`, es un ajuste fino del checkpoint base `lerobot/smolvla_base` sobre el dataset de imitacion `jbae28/pick-and-place-merged`, y resuelve una unica tarea: coger un cubo amarillo y dejarlo dentro de una caja blanca.

El interes practico del modelo esta en su tamano: 450.046.176 parametros (unos 450 M) y un repositorio de 0,9 GB, lo que permite ejecutar la politica en hardware de consumo en lugar de recurrir a clusters con GPUs de datacenter. Frente a VLA de varios miles de millones de parametros, SmolVLA apunta a un compromiso entre capacidad de generalizacion y coste de inferencia, algo critico cuando el bucle de control debe correr a la frecuencia de los sensores del robot.

La relevancia de este checkpoint es, sin embargo, acotada: es una politica de investigacion con 0 descargas y 0 likes, sin resultados de evaluacion publicados y entrenada sobre 128 episodios de un unico entorno. Sirve como ejemplo reproducible del flujo de trabajo de imitacion de LeRobot y como punto de partida para reentrenar sobre un brazo SO, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta; backbone vision-lenguaje con cabeza de acciones continuas. El detalle interno de capas y atencion no se documenta en la informacion disponible (ver arXiv:2506.01844) |
| Parametros totales | 450.046.176 (dato real de los safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible como contexto de texto; la entrada son 3 imagenes de (3, 256, 256) mas un vector de estado de (6,) |
| Tipos de cuantizacion | No se publican variantes cuantizadas (GGUF, AWQ, GPTQ). El repo contiene safetensors; 0,9 GB para 450 M de parametros es coherente con bf16 (2 bytes por parametro) |
| Idiomas soportados | No disponibles. No es un modelo conversacional: consume una instruccion de tarea en texto (la del dataset esta en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de modelo (pipeline) | `robotics` (politica de imitacion) |
| Modelo base | `lerobot/smolvla_base` |
| Robot objetivo | `so_follower` (brazo seguidor tipo SO de LeRobot) |
| Camaras | La model card declara `front` y `arm`, pero las features de entrada listan `observation.images.camera1`, `camera2` y `camera3`; hay una inconsistencia no resuelta |
| Entrada / salida | `observation.state` (6,), 3 imagenes (3, 256, 256) / `action` (6,) |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

SmolVLA se presenta en su model card como un modelo vision-language-action compacto y eficiente que logra rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. La arquitectura combina un backbone de vision y lenguaje, que procesa las imagenes de las camaras junto con la instruccion de tarea, con una cabeza que emite acciones continuas de 6 dimensiones correspondientes a las articulaciones del brazo `so_follower`. La informacion proporcionada no detalla el numero de capas, el mecanismo de atencion ni la funcion de perdida exacta; esos detalles deben consultarse en el paper asociado (arXiv:2506.01844) y en la documentacion de LeRobot.

El ajuste fino se realizo sobre el dataset `jbae28/pick-and-place-merged`: 128 episodios, 76.617 frames a 30 FPS, con la unica tarea "Pick up the yellow cube and drop it inside the white box". La configuracion de entrenamiento fue de 5.000 pasos, batch size 128, optimizador AdamW, learning rate 2e-05 y semilla 1000, usando LeRobot 0.6.1. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; al tratarse de aprendizaje por imitacion supervisado, no se espera alineamiento por preferencias.

## Capacidades

- Control robotico de manipulacion mediante imitacion: genera acciones de 6 dimensiones a partir de tres vistas de camara y del estado de las articulaciones.
- Ejecucion de una tarea especifica de pick-and-place: coger el cubo amarillo y depositarlo en la caja blanca.
- Condicionamiento por instruccion en lenguaje natural: la tarea se pasa como cadena de texto en el comando de rollout.
- Fusion de multiples vistas: la politica consume tres camaras simultaneamente (`camera1`, `camera2`, `camera3`), lo que aporta informacion complementaria sobre la escena.
- Inferencia en hardware de consumo: los 450 M de parametros permiten ejecutar la politica sin GPUs de datacenter.
- No soporta tool calling, function calling, agentes multi-paso, vision general, audio ni modo de razonamiento extendido. No es un modelo de lenguaje de proposito general.

## Casos de uso

- Replicacion de un pipeline de imitacion de referencia: usar este checkpoint para validar de extremo a extremo el flujo `lerobot-train` / `lerobot-rollout` antes de invertir tiempo en grabar un dataset propio, ya que la configuracion exacta (pasos, learning rate, batch) esta documentada.
- Fine-tuning sobre una tarea propia de pick-and-place: partir de `lerobot/smolvla_base` y reentrenar con un dataset nuevo de 100-200 episodios, usando este repositorio como plantilla de estructura de datos y de configuracion de entrenamiento.
- Docencia y divulgacion en robotica: el modelo es lo bastante pequeno (0,9 GB) para distribuirlo a estudiantes y ejecutarlo en un portatil con GPU modesta, mostrando al completo el ciclo observacion-accion de un VLA.
- Banco de pruebas de infraestructura de inferencia: medir latencia y throughput de una politica de 450 M parametros en distintas GPUs y con distintos backends de PyTorch, para dimensionar el hardware de control de un brazo real a 30 FPS.
- Generacion de datos sinteticos y evaluacion comparativa: ejecutar la politica en bucle abierto o cerrado sobre el dataset `pick-and-place-merged` para comparar la distribucion de acciones predicha con las acciones humanas registradas, como metrica de calidad de la imitacion.
- Integracion en una celula de manipulacion de laboratorio: usar el modelo como controlador de bajo nivel para la subtarea de recogida y deposito de un objeto concreto, siempre con supervision humana y en un entorno controlado.
- Base para investigacion en generalizacion: al ser un fine-tune de un unico entorno, es un caso de estudio util para medir la degradacion de la politica ante cambios de iluminacion, posicion de objetos o distracciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "No evaluation results have been provided for this policy yet", y la tabla de evaluacion en robot real aparece vacia. No existen datos de tasa de exito, MMLU, HumanEval ni de ninguna otra metrica para este checkpoint.

| Metrica | Resultado |
|---|---|
| Tasa de exito en pick-and-place | No disponible |
| Numero de ensayos en robot real | No disponible |
| Benchmarks de VLM (MMLU, etc.) | No aplicable / no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en bf16 para los pesos; con activaciones y buffers de las tres imagenes de 256x256, un presupuesto de 2-4 GB de VRAM es suficiente. En fp32 los pesos ocuparian unos 1,8 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de memoria, incluidas RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 y H100. El modelo no requiere GPUs de datacenter.
- Compatibilidad con GPU de consumo: si, es uno de los objetivos explicitos del diseno de SmolVLA ("can be deployed on consumer-grade hardware"). Tambien es viable la inferencia en CPU para pruebas de humo, aunque no se han publicado latencias.
- Opciones de despliegue: la via soportada es LeRobot 0.6.1 mediante `lerobot-rollout` con `--policy.path=jbae28/smolvla_finetune_new` y `--robot.type=so_follower`. El peso esta en safetensors y se carga con PyTorch; no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, y al no ser un modelo generativo de texto esas herramientas no aplican directamente.
- Hardware robotico necesario: brazo `so_follower` calibrado, puerto serie identificado y camaras OpenCV configuradas a 640x480 y 30 FPS en el comando de rollout.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabo a 30 FPS, lo que sugiere que el bucle de control debe sostener esa frecuencia, pero no se publica ninguna medicion del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Disponibilidad | Evaluacion publicada |
|---|---|---|---|---|---|
| jbae28/smolvla_finetune_new | 450.046.176 | 3 imagenes 256x256 + estado (6,) | Apache-2.0 | HuggingFace, 0 descargas | No |
| lerobot/smolvla_base | No confirmado en la informacion (mismo orden de magnitud) | No disponible | No confirmado (el fine-tune declara Apache-2.0) | HuggingFace, mantenido por LeRobot | No disponible en la informacion |
| Otros VLA de la misma categoria (por ejemplo, familias OpenVLA o pi0) | No disponible en la informacion proporcionada | No disponible | No disponible | No evaluado en esta ficha | No disponible |

No se dispone de datos verificados de parametros, contexto ni rendimiento de los VLA alternativos dentro de la informacion suministrada, por lo que no se establece una comparacion cuantitativa. Cualitativamente, la propuesta de SmolVLA es reducir el coste computacional frente a VLA de mayor tamano manteniendo un rendimiento descrito como competitivo, a cambio de una menor capacidad de generalizacion fuera de la distribucion de entrenamiento.

## Limitaciones y advertencias

- Sobreajuste a un unico entorno: 128 episodios de una sola tarea y un solo montaje de camaras. La politica probablemente falla ante cambios de iluminacion, posicion del cubo, color del objeto o presencia de distracciones.
- Sin evaluacion: no hay tasa de exito medida, ni en simulacion ni en robot real. Cualquier uso requiere una validacion propia antes de confiar en el modelo.
- Inconsistencia en la model card: declara dos camaras (`front`, `arm`) pero define tres features visuales (`camera1`, `camera2`, `camera3`), y el ejemplo de rollout configura solo dos. Es necesario verificar que claves de observacion espera realmente el checkpoint antes de desplegarlo.
- Ambiguedad en el espacio de acciones: la salida es un vector de 6 dimensiones sin que se documenten unidades, limites ni normalizacion, lo que complica la integracion con un robot distinto del `so_follower`.
- Riesgo de alucinacion en sentido robotico: como toda politica de imitacion, puede ejecutar trayectorias plausibles pero incorrectas cuando la escena se sale de la distribucion de entrenamiento, sin ninguna senal de incertidumbre ni mecanismo de rechazo.
- Idiomas: la unica instruccion documentada esta en ingles. No hay evidencia de que acepte instrucciones en castellano ni de comportamiento multilingue.
- Sesgos: no documentados. El dataset procede de un unico operador humano, por lo que la politica hereda sus sesgos motores y su estrategia de agarre.
- Licencia: Apache-2.0 permite uso comercial, pero la ausencia de evaluacion y la dependencia del ecosistema LeRobot trasladan al integrador toda la responsabilidad sobre el comportamiento del robot.
- Produccion: no recomendado como controlador autonomo sin parada de emergencia, limites de par y supervision humana.
- Madurez: 0 descargas y 0 likes, creado y actualizado con 12 segundos de diferencia, lo que sugiere un artefacto de prueba mas que un modelo mantenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jbae28/smolvla_finetune_new
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Dataset de entrenamiento: https://huggingface.co/datasets/jbae28/pick-and-place-merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=jbae28/pick-and-place-merged
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces anteriores proceden exclusivamente de la informacion de HuggingFace proporcionada.

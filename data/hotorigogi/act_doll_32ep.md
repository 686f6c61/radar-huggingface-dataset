# hotorigogi/act_doll_32ep

## Resumen

`hotorigogi/act_doll_32ep` es una politica de robótica entrenada con ACT (Action Chunking with Transformers), el método de aprendizaje por imitación descrito en el paper arXiv:2304.13705. No es un modelo de lenguaje: es una politica visomotora que consume el estado del robot (6 dimensiones) y dos flujos de imagen (camara cenital y camara de muneca, ambas a 480x640) y produce un vector de accion de 6 dimensiones, pensado para un brazo tipo `so_follower` (familia SO-100/SO-101 de bajo coste). El autor es el usuario de HuggingFace `hotorigogi` y el artefacto se ha generado con LeRobot 0.6.2.

El checkpoint tiene 51.668.614 parametros (unos 51,7 M) y un repositorio de 0,2 GB en formato safetensors. Se ha entrenado durante 100.000 pasos con batch de 8, optimizador AdamW y tasa de aprendizaje 1e-5 sobre el dataset `hotorigogi/doll_pick_and_place`, compuesto por 32 episodios y 14.318 fotogramas grabados a 30 FPS para la tarea "Pick and place the doll".

Su relevancia es practica dentro del ecosistema LeRobot: sirve como ejemplo reproducible de una politica ACT de tamano reducido, ejecutable en hardware de consumo, y como punto de partida para fine-tuning en tareas de pick and place con brazos SO-100. La model card no publica ningun resultado de evaluacion en robot real, por lo que su tasa de exito es desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); transformer con CVAE, segun arXiv:2304.13705 |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT usa un horizonte de observacion y predice un chunk de acciones, cuyo tamano no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32 dado el tamano de 0,2 GB) |
| Idiomas soportados | no disponible (la politica no procesa lenguaje natural; recibe imagenes y estado numerico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Datos adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Camaras | `top`, `wrist` (3x480x640 cada una) |
| Entrada de estado | `observation.state`, shape (6,) |
| Salida | `action`, shape (6,) |
| Dataset de entrenamiento | `hotorigogi/doll_pick_and_place` (32 episodios, 14.318 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acciones (action chunks) en lugar de un unico paso, lo que reduce el error de acumulacion y suaviza la ejecucion. La formulacion del paper combina un backbone convolucional (ResNet-18) para extraer caracteristicas de las imagenes, un transformer encoder-decoder y una componente CVAE que modela la variabilidad humana en los datos teleoperados mediante una variable latente de estilo. En inferencia, esa componente se fija al prior y el modelo se comporta como una politica determinista que emite un chunk de acciones de una sola pasada. La model card no detalla la configuracion concreta usada en este checkpoint (tamano de chunk, numero de capas, dimensiones internas ni si se aplico ensemble temporal), por lo que esos valores quedan como no disponibles.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset `hotorigogi/doll_pick_and_place`: 32 episodios de demostracion teleoperada, 14.318 fotogramas a 30 FPS, con las tareas etiquetadas como "pick_and_place", "doll_pick_and_place" y "Pick and place the doll". Se ejecutaron 100.000 pasos de optimizacion con AdamW, batch de 8 y learning rate constante de 1e-5, con semilla 1000. No se documenta ningun proceso de RLHF, DPO ni refuerzo posterior; es aprendizaje por imitacion supervisado puro. Tampoco se indican el hardware de entrenamiento, el tiempo total ni si se aplicaron aumentos de datos.

## Capacidades

- Control visomotor de un brazo robotico de 6 grados de libertad: genera el vector de accion de 6 dimensiones a partir del estado articulado y de dos vistas de camara.
- Ejecucion de la tarea concreta de pick and place de un muneco, tal y como se grabo en el dataset de entrenamiento.
- Fusion de dos camaras simultaneas (vista cenital y vista de muneca) a resolucion 480x640, lo que permite corregir errores de posicionamiento en la aproximacion al objeto.
- Prediccion de chunks de acciones del método ACT, orientada a ejecucion fluida a 30 FPS sin depender de inferencia paso a paso.
- Reproduccion de trayectorias de imitacion aprendidas de teleoperacion humana con un unico estilo de agarre.
- Ejecucion autonoma continua mediante `lerobot-rollout` con `--strategy.type=base`, sin grabacion de episodios.
- Fine-tuning sobre nuevos datasets con `lerobot-train --policy.type=act`, reutilizando los pesos como inicializacion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni capacidades multilingues; son capacidades fuera del alcance de una politica robotica.

## Casos de uso

- Automatizacion de pick and place con brazo SO-100/SO-101: es el escenario nativo del checkpoint; se despliega con `lerobot-rollout` apuntando a `--policy.path=hotorigogi/act_doll_32ep` y a la tarea `pick_and_place`, con las camaras nombradas `top` y `wrist` para que coincidan con las claves de observacion del entrenamiento.
- Punto de partida para fine-tuning en objetos nuevos: al ser un checkpoint pequeno (51,7 M de parametros) y con licencia Apache 2.0, se puede reentrenar sobre un dataset propio de otra pieza cambiando solo `--dataset.repo_id` y el `output_dir`, reduciendo el coste frente a entrenar ACT desde cero.
- Banco de pruebas reproducible en investigacion sobre imitacion: sirve como baseline ACT con hiperparametros conocidos (100.000 pasos, batch 8, AdamW, lr 1e-5, semilla 1000) para comparar variantes de politica en igualdad de condiciones.
- Docencia y formacion en robotica de bajo coste: el modelo cabe en un equipo de sobremesa, de modo que un aula puede grabar episodios con un SO-100, entrenar y desplegar sin acceso a closters de GPU.
- Validacion de pipelines de datos de LeRobot: el par politica+dataset permite verificar de extremo a extremo la grabacion de episodios, la conversion a formato LeRobotDataset y la visualizacion con el Space oficial de visualizacion de datasets.
- Alimentacion de piezas ligeras en celdas de montaje compactas: la combinacion de camara cenital y camara de muneca resulta adecuada para tareas de recogida y colocacion con tolerancias moderadas, siempre que el objeto y la iluminacion se parezcan a los del dataset.
- Evaluacion comparativa de politicas de imitacion: al tener un artefacto ACT ya entrenado, se puede medir frente a Diffusion Policy u otras alternativas sobre la misma tarea de recogida del muneco y el mismo utillaje.
- Despliegue en robotica embebida: el tamano del modelo permite ejecutarlo en plataformas tipo Jetson Orin o en CPU, lo que habilita prototipos moviles sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "No evaluation results have been provided for this policy yet", de modo que no hay tasa de exito, numero de ensayos ni condiciones de evaluacion en robot real. Tampoco se proporcionan metricas de perdida de entrenamiento ni resultados en simulador.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 0,21 GB en fp32 y unos 0,10 GB en bf16/fp16, calculados a partir de los 51,7 M de parametros. El repositorio ocupa 0,2 GB, coherente con pesos en fp32.
- VRAM total en inferencia: no disponible de forma oficial; con dos imagenes de 480x640 procesadas por un backbone convolucional y batch 1, es razonable esperar un consumo de activaciones del orden de 1 a 2 GB, pero es una estimacion no confirmada por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en la practica; RTX 3060, RTX 4090, A100 o H100 quedan sobradamente dimensionadas. El modelo tambien puede ejecutarse en CPU para pruebas.
- Cabe en GPU de consumo: si, con margen amplio en tarjetas tipo GTX 1660, RTX 3050, RTX 3060 o superiores, y en plataformas embebidas Jetson Orin Nano/NX.
- Opciones de despliegue: el camino soportado es LeRobot (`lerobot-rollout` con `--policy.path=hotorigogi/act_doll_32ep`). Los servidores de inferencia de LLM (vLLM, TGI) no aplican a este tipo de politica. Una exportacion a ONNX o TensorRT para reducir latencia es posible tecnicamente, pero no esta documentada por el autor.
- Latencia y throughput: no disponibles. El método ACT predice chunks de acciones, lo que reduce la frecuencia de inferencia necesaria para el bucle de control; sin embargo, no se publica ninguna medicion de latencia por paso ni de frecuencia de control efectiva.
- Requisitos de entrenamiento: no disponibles. Se documentan 100.000 pasos con batch 8, pero no la GPU, el tiempo ni el consumo utilizados.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de politica | Licencia | Disponibilidad |
|---|---|---|---|---|
| `hotorigogi/act_doll_32ep` | 51,7 M | ACT (chunking de acciones, CVAE + transformer) | Apache 2.0 | HuggingFace Hub, 0 descargas y 0 likes en el momento de la consulta |
| Diffusion Policy (integrada en LeRobot) | no disponible | Politica generativa por difusion sobre observaciones visuales | no disponible en la informacion proporcionada | Disponible como opcion `--policy.type=diffusion` en LeRobot |
| SmolVLA (HuggingFace) | no disponible en la informacion proporcionada | Vision-language-action con soporte de instrucciones en lenguaje | no disponible en la informacion proporcionada | Disponible a traves del ecosistema LeRobot |
| ACT generico de LeRobot | misma arquitectura base que este checkpoint | ACT | Apache 2.0 (LeRobot) | Ejemplos y guias oficiales en la documentacion de LeRobot |

No se dispone de cifras verificables de rendimiento comparado entre estas alternativas dentro de la informacion proporcionada. La diferencia funcional principal es que `act_doll_32ep` esta especializado en una unica tarea y un unico montaje de camaras, mientras que propuestas como SmolVLA aceptan instrucciones en lenguaje natural y apuntan a generalizacion entre tareas. ACT frente a Diffusion Policy es una comparacion clasica en la literatura de imitacion, pero cualquier conclusion sobre tasas de exito en esta tarea concreta requeriria una evaluacion en robot real que el autor no ha publicado.

## Limitaciones y advertencias

- No hay ninguna metrica de evaluacion publicada: se desconoce la tasa de exito real de la politica, incluso en la tarea para la que fue entrenada.
- Sobreajuste a la tarea y al entorno de grabacion: al proceder de un unico dataset de 32 episodios y una sola tarea (recoger y colocar el muneco), es previsible una degradacion marcada ante cambios de iluminacion, color de mesa, posicion inicial de la pieza o presencia de distractores.
- Sensibilidad al montaje de camaras: las claves `observation.images.top` y `observation.images.wrist` deben existir y corresponder a puntos de vista equivalentes a los del entrenamiento; cambiar la posicion o la resolucion de las camaras invalida la politica.
- Dependencia del robot: esta entrenada para `so_follower` con estado y accion de 6 dimensiones. Usarla en otro robot exige adaptar la interfaz o reentrenar.
- Riesgo de alucinacion en el sentido de generalizacion incorrecta: el modelo puede emitir trayectorias plausibles pero inutiles cuando la escena esta fuera de la distribucion de entrenamiento, sin ninguna senal de incertidumbre en la salida.
- Sin soporte de lenguaje ni de instrucciones: no se puede pedir al modelo una tarea nueva mediante texto; solo ejecuta el comportamiento aprendido.
- Idiomas soportados: no aplica ni esta documentado.
- Licencia Apache 2.0: permite uso comercial y modificacion siempre que se conserven los avisos de copyright y licencia; conviene citar ademas el paper de ACT y LeRobot, como pide el autor en la model card.
- Idoneidad para produccion limitada: es un artefacto de investigacion con 0 descargas y 0 likes, sin garantias de soporte, versionado ni mantenimiento posterior.
- Ausencia de informacion sobre sesgos: aunque no se trata de un modelo de lenguaje, el comportamiento imitado puede recoger sesgos de la persona que teleopero los datos (por ejemplo, un unico patron de agarre o una velocidad concreta de aproximacion).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hotorigogi/act_doll_32ep
- Dataset de entrenamiento: https://huggingface.co/datasets/hotorigogi/doll_pick_and_place
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hotorigogi/doll_pick_and_place

Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo, su autor ni el dataset asociado; los resultados obtenidos correspondian a dominios sin relacion con robotica o aprendizaje automatico y se han descartado.

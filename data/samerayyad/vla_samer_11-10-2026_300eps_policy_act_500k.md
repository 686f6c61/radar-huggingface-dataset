# SamerAyyad/VLA_Samer_11.10.2026_300eps_policy_ACT_500k

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice bloques cortos de acciones futuras —los denominados *action chunks*— en lugar de un unico paso de control. El checkpoint `SamerAyyad/VLA_Samer_11.10.2026_300eps_policy_ACT_500k` es una politica ACT entrenada y publicada en el Hub mediante LeRobot, la libreria de robotica de Hugging Face, sobre el dataset de teleoperacion `SamerAyyad/VLA_Samer_11.10.2026_300eps`. El autor es SamerAyyad y el repositorio se publico el 16 de octubre de 2026 con licencia Apache 2.0.

El modelo no es un modelo de lenguaje: es una politica de control visuomotor de ~51,7 millones de parametros que consume observaciones (imagenes de camara y, segun la configuracion, estado proprioceptivo del robot) y emite comandos de accion de forma continua. Su relevancia practica radica en que ofrece una politica de manipulacion lista para usar con el ecosistema LeRobot, entrenable desde cero con un unico comando `lerobot-train` y evaluable con `lerobot-record` sobre un robot de tipo `so100_follower`.

Al tratarse de un repositorio recien publicado, no cuenta con descargas ni valoraciones en el momento de redactar esta ficha, y la model card no incluye resultados de evaluacion ni detalles del dataset de entrenamiento mas alla de su identificador. La informacion disponible es, por tanto, limitada: se conocen el recuento exacto de parametros, el formato de pesos, la libreria y la licencia, pero no la composicion del dataset, la configuracion exacta de entrenamiento ni metricas de exito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con CVAE para *action chunking* (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.670.663 (~51,7 M), dato real de los safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume observaciones por paso y predice un chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se han publicado versiones cuantizadas) |
| Idiomas soportados | no disponible (politica de robotica sin interfaz de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos del repositorio: `library_name: lerobot`, `pipeline_tag: robotics`, tamano del repositorio 0,2 GB, creado el 2026-10-16T20:33:10Z y actualizado el 2026-10-16T20:33:25Z. La nomenclatura del repositorio sugiere 300 episodios de teleoperacion (`300eps`) y 500.000 pasos de entrenamiento (`500k`), pero la model card no confirma ninguno de los dos extremos.

## Arquitectura y entrenamiento

ACT se presenta en la model card como un metodo de aprendizaje por imitacion que aprende de datos teleoperados y que predice chunks de acciones en lugar de pasos individuales. La referencia tecnica asociada en el repositorio es el articulo arXiv 2304.13705 (*Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware*), que describe la politica como un autoencoder variacional condicional (CVAE) con encoder y decoder basados en transformer: el encoder procesa la secuencia de observaciones y acciones para inferir una variable latente de estilo, y el decoder genera un bloque de acciones futuras a partir de la observacion actual y dicha latente. La prediccion por chunks reduce el horizonte efectivo de planificacion y mitiga el problema de las acciones no marcovianas y de la varianza en los datos de teleoperacion.

El checkpoint concreto se ha entrenado con LeRobot mediante el flujo estandar `lerobot-train` con `--policy.type=act`, y se evalua con `lerobot-record` sobre un robot `so100_follower` durante 10 episodios segun el ejemplo de la model card. No se especifican en la informacion proporcionada el numero de tokens o pasos exactos, la composicion del dataset, la resolucion de las camaras, la tasa de control, ni si se aplicaron tecnicas de regularizacion como *temporal ensembling* en inferencia. Todos esos extremos quedan como no disponibles.

## Capacidades

- Control visuomotor por imitacion: genera comandos de accion continua a partir de observaciones sensoriales, sin necesidad de planificacion simbolica ni de un modelo de lenguaje intermedio.
- Prediccion de *action chunks*: emite secuencias cortas de acciones coherentes en lugar de un unico paso, lo que reduce la acumulacion de error y la varianza entre pasos.
- Ejecucion sobre robots de bajo coste: el ejemplo de la model card apunta a un `so100_follower`, dentro del catalogo de brazos compatibles con LeRobot.
- Entrenamiento reproducible desde cero: la model card documenta el comando completo de entrenamiento con `policy.type=act`, `policy.device=cuda` y trazabilidad opcional en Weights & Biases.
- Evaluacion integrada: permite registrar episodios de evaluacion con `lerobot-record`, prefijando el dataset con `eval_` y apuntando a un checkpoint local o del Hub.
- Soporte de tool calling / function calling: no disponible (no aplica a una politica de control).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, vision, audio): procesa entrada visual como parte de la observacion; no se documentan modos de razonamiento explicito ni entrada de audio.

## Casos de uso

- Manipulacion roboticamente asistida en laboratorio: la politica puede ejecutar tareas de *pick and place* aprendidas de teleoperacion sobre un brazo SO-100, sirviendo como punto de partida para experimentos de imitacion sin necesidad de disenar un controlador analitico.
- Replicacion de politicas de referencia en investigacion: al estar publicada en el Hub y ser cargable con `--policy.path`, permite reproducir una linea base ACT y compararla con variantes propias entrenadas sobre el mismo dataset.
- *Fine-tuning* sobre datos propios: un equipo con su propio conjunto de episodios teleoperados puede partir de estos pesos o de la receta de entrenamiento documentada para adaptar la politica a una tarea especifica.
- Docencia y formacion en robotica: el flujo `lerobot-train` / `lerobot-record` con un brazo de bajo coste hace viable montar practicas de aprendizaje por imitacion con hardware asequible.
- Generacion de datos sinteticos de evaluacion: ejecutando la politica en bucle cerrado y registrando los episodios como `eval_*`, se obtienen trayectorias etiquetadas utiles para analizar modos de fallo y planificar nuevas rondas de recoleccion.
- Automatizacion de tareas repetitivas de banco: tareas de recogida, colocacion o clasificacion de objetos en un entorno controlado y con posiciones de camara fijas, donde la variabilidad visual es baja.
- Integracion en pipelines de robotica con LeRobot: la politica se puede invocar como componente dentro de un script Python de LeRobot y combinarse con utilidades de grabacion, subida al Hub y monitorizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este checkpoint no incluye tasas de exito, numeros de episodios de evaluacion ni comparaciones con otras politicas. El articulo referenciado (arXiv 2304.13705) si reporta evaluaciones de ACT, pero no se dispone en la informacion proporcionada de las cifras concretas ni de su correspondencia con este checkpoint entrenado por un tercero.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 51,67 M de parametros, los pesos ocupan aproximadamente 207 MB en FP32, 103 MB en FP16/BF16 y unos 52 MB en INT8. A esa cifra hay que sumar la memoria de activaciones del backbone visual y de las imagenes de entrada; en la practica se puede ejecutar con holgura en GPUs con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA. Para entrenamiento se recomienda NVIDIA A100, H100, L40S o RTX 4090; para inferencia bastan RTX 3060, RTX 4060, RTX 3080 o superiores.
- Cabe en GPU de consumo: si. El modelo es lo bastante pequeno para ejecutarse en GPUs de gama media y baja, y tambien es viable en CPU, aunque con mayor latencia por paso de control.
- Despliegue en el borde: plataformas tipo NVIDIA Jetson Orin son candidatas razonables para integrar la politica en el propio robot, si bien no se documenta soporte explicito en la model card.
- Opciones de despliegue: LeRobot (flujo `lerobot-record` con `--policy.path`), PyTorch nativo, y exportacion a otros runtimes previa conversion. No aplican los servidores de inferencia de LLM habituales (vLLM, TGI, llama.cpp, Ollama), ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware, de la resolucion de las camaras, del numero de imagenes de entrada y del tamano del chunk de acciones configurado; ninguno de estos parametros se especifica en la informacion proporcionada.

## Comparativa con modelos similares

Comparacion cualitativa con otras politicas de imitacion disponibles en el ecosistema LeRobot. Los parametros, contextos y licencias de las alternativas no figuran en la informacion proporcionada para este modelo, por lo que se marcan como no disponibles cuando corresponde.

| Modelo | Tipo de politica | Parametros | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ACT (este checkpoint) | Transformer encoder-decoder con CVAE y action chunking | 51.670.663 | Apache 2.0 | Hugging Face Hub via LeRobot | Entrenado sobre dataset propio del autor; sin evaluacion publicada |
| Diffusion Policy | Politica de imitacion basada en modelos de difusion | no disponible | no disponible en la informacion proporcionada | Implementada en LeRobot | Genera trayectorias por desruido iterativo; suele requerir mas computo por paso |
| SmolVLA | Politica visuolenguaje compacta | no disponible | no disponible en la informacion proporcionada | Implementada en LeRobot | Incorpora componente de lenguaje, a diferencia de ACT |
| VQ-BeT | Politica con discretizacion de acciones y transformer | no disponible | no disponible en la informacion proporcionada | Implementada en LeRobot | Enfoque alternativo para acciones multimodales |

No se dispone de datos de rendimiento comparado entre estas politicas en la informacion proporcionada, por lo que la eleccion entre ellas no puede justificarse con cifras a partir de esta ficha.

## Limitaciones y advertencias

- Ausencia de validacion publica: el repositorio tiene 0 descargas y 0 valoraciones, y la model card no incluye tasas de exito, curvas de entrenamiento ni analisis de fallos. No hay evidencia publicada de que la politica funcione de forma fiable en produccion.
- Dependencia del dataset de entrenamiento: con un dataset de aproximadamente 300 episodios (segun la nomenclatura, no confirmada), la cobertura de situaciones, iluminaciones y posiciones de objeto es presumiblemente limitada, lo que favorece el sobreajuste al entorno de recogida de datos.
- Especificidad de morfologia y sensores: una politica ACT aprende una correspondencia concreta entre observaciones y acciones del robot con el que se teleopero. Cambiar el brazo, la camara, la resolucion o la calibracion suele exigir reentrenamiento.
- Ausencia de comprension del lenguaje: no acepta instrucciones en lenguaje natural ni razona sobre objetivos; solo reproduce la distribucion de comportamiento del dataset. No se puede corregir la tarea con un prompt.
- Riesgo de acciones fisicas inseguras: en robotica, los errores del modelo se traducen en movimientos reales. Es imprescindible operar con limites de par, paradas de emergencia, espacio de trabajo despejado y supervision humana durante la evaluacion.
- Generalizacion fuera de distribucion: ante objetos, texturas o disposiciones no vistas durante la teleoperacion, es esperable un deterioro del comportamiento y la aparicion de trayectorias sin sentido; no hay informacion sobre el comportamiento del modelo en estos casos.
- Idiomas: no disponible. El modelo no procesa texto, por lo que no existe soporte linguistico que evaluar.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y los ficheros de atribucion. La licencia del dataset de entrenamiento no se detalla en la informacion proporcionada y conviene verificarla por separado antes de un uso comercial.
- Advertencia de trazabilidad: la fecha de creacion indicada en el repositorio (octubre de 2026) y la ausencia de documentacion adicional dificultan auditar el origen de los pesos. Se recomienda validar el checkpoint en un entorno controlado antes de cualquier integracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_11.10.2026_300eps_policy_ACT_500k
- Dataset de entrenamiento: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_11.10.2026_300eps
- Articulo de ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
- Pagina del articulo en Hugging Face Papers: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

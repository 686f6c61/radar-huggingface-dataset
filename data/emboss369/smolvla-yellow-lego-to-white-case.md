# emboss369/smolvla-yellow-lego-to-white-case

## Resumen

smolvla-yellow-lego-to-white-case es una politica de vision-lenguaje-accion (VLA) para robotica, resultado de un ajuste fino (fine-tuning) del modelo base lerobot/smolvla_base. La desarrolla el usuario emboss369 y esta pensada para una unica tarea de manipulacion: "Put the yellow lego block into the white case" (introducir el bloque de Lego amarillo en la caja blanca). Se distribuye como un policy checkpoint del ecosistema LeRobot y hereda la licencia Apache 2.0 del modelo base.

El modelo resuelve un problema de imitacion robótica end-to-end: consume el estado del robot y tres flujos de imagen (camaras de muneca y frontales) y produce directamente comandos de accion de 6 dimensiones (6-DoF), sin necesidad de planificacion explicita. Con 450.046.176 parametros (unos 450 M) y un peso de repositorio de 0,9 GB, esta disenado para ejecutarse en hardware de consumo, lo que lo hace relevante para laboratorios y aficionados con brazos SO-101.

La relevancia actual radica en que SmolVLA, el metodo base descrito en el articulo arXiv:2506.01844, propone un VLA compacto que alcanza rendimiento competitivo a un coste computacional reducido frente a VLAs mucho mayores. Este repositorio concreto es un ejemplo de ajuste fino con datos propios (150 episodios, 55.928 frames) sobre el brazo so_follower, y no incluye resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje-accion (VLA) basado en SmolVLA; detalles internos no disponibles en la model card |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones especificas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card identifica el modelo como una politica SmolVLA, un VLA compacto y eficiente que, segun el articulo citado (arXiv:2506.01844), logra rendimiento competitivo con costes computacionales reducidos y puede desplegarse en hardware de consumo. El checkpoint consume cuatro entradas: observation.state con forma (6,), y tres entradas visuales observation.images.camera1, camera2 y camera3, cada una con forma (3, 256, 256). La salida es una accion de forma (6,). La arquitectura interna del VLA (backbone de vision-lenguaje, experto de accion, mecanismo de generacion de acciones) no se detalla en la informacion disponible; para ello hay que remitirse al articulo del metodo.

El ajuste fino se realizo con 20.000 pasos de entrenamiento, batch size 64, optimizador AdamW, learning rate 0,0001 y semilla 1000, usando LeRobot 0.6.2. El conjunto de datos es emboss369/so101-yellow-lego-to-white-case_20260727_220921, con 150 episodios y 55.928 frames a 30 FPS para una unica tarea. El robot objetivo es so_follower y las camaras declaradas son wrist y front. No se especifica composicion de dataset adicional, ni si el modelo base recurrio a RLHF/DPO, ni innovaciones tecnicas concretas mas alla de las propias del metodo SmolVLA.

## Capacidades

- Generacion de acciones motoras end-to-end para manipulacion robótica (salida de 6 dimensiones).
- Percepcion visual multimodal: procesa tres camaras simultaneamente a resolucion 256x256.
- Fusion de estado propioceptivo (observation.state) con informacion visual para el control.
- Ejecucion de una tarea concreta de pick-and-place ("Put the yellow lego block into the white case").
- Inferencia sobre el brazo SO-101 en configuracion so_follower.
- Integracion nativa con el ecosistema LeRobot para rollout y reentrenamiento.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues ni modos de razonamiento extendido (thinking mode). Estas capacidades no aplican a una politica de control robótico.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: la politica ejecuta la secuencia de coger el bloque de Lego amarillo y colocarlo en la caja blanca sobre un SO-101, util para demostraciones reproducibles de imitacion robótica.
- Base para ajuste fino en nuevas tareas: al derivar de lerobot/smolvla_base, puede reentrenarse con `lerobot-train` sobre datasets propios para otras tareas de manipulacion con cambios minimos de configuracion.
- Banco de pruebas de VLA ligeros: sirve para medir latencia, tasa de exito y robustez de un VLA de 450 M en hardware de consumo frente a alternativas mayores.
- Educacion e investigacion en robotica: ejemplo completo y reproducible de flujo LeRobot (grabacion de datos, entrenamiento, rollout) para cursos y practicas.
- Prototipado rapido de celulas flexibles: con 150 episodios y 30 FPS, el modelo muestra el esfuerzo de datos necesario para una tarea acotada antes de escalar a produccion.
- Evaluacion de pipelines de datos de imitacion: el dataset asociado (55.928 frames) permite estudiar como afectan el numero de episodios y la calidad de las camaras al rendimiento de la politica.
- Reproduccion de resultados de SmolVLA: permite contrastar el comportamiento del metodo base en un caso concreto y documentar tasas de exito (aunque este repositorio no las aporta).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "_No evaluation results have been provided for this policy yet_", y la seccion de evaluacion esta vacia. No se dispone de tasas de exito en robot real, ni de resultados en MMLU, HumanEval, GSM8K ni metricas equivalentes (que, por otra parte, no son aplicables a una politica de control).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en fp32 y unos 0,9 GB en bf16/fp16, coherente con un repositorio de 0,9 GB y 450 M de parametros.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o superiores, e incluso en GPUs con 4-8 GB de VRAM. La model card indica que SmolVLA puede desplegarse en hardware de consumo.
- GPUs de centro de datos (A100, H100) no son necesarias para inferencia; solo tendrian sentido para reentrenamiento a mayor escala.
- Opciones de despliegue: el flujo oficial es LeRobot mediante el comando `lerobot-rollout` con `--policy.path=emboss369/smolvla-yellow-lego-to-white-case`. Stacks de servido de LLM como vLLM, TGI u Ollama no son el mecanismo previsto para una politica VLA.
- Latencia y throughput: no disponibles. Dependen de la GPU, del numero de camaras y de la frecuencia de control (el dataset se grabo a 30 FPS, lo que da una referencia de cadencia temporal de la tarea).
- Requiere conexion al robot SO-101 (tipo so_follower) y camaras configuradas con nombres que coincidan con las claves de observacion del entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| smolvla-yellow-lego-to-white-case | 450 M | VLA (fine-tuning) | apache-2.0 | HuggingFace (LeRobot) | Tarea unica; sin evaluacion publicada |
| lerobot/smolvla_base | 450 M (segun modelo base declarado) | VLA (base) | apache-2.0 | HuggingFace (LeRobot) | Modelo base generico del que deriva este checkpoint |
| Otros VLA de referencia (OpenVLA, pi0, etc.) | no disponible en la informacion proporcionada | VLA | no disponible | no disponible | No se aportan datos verificados en la busqueda realizada |

No se dispone de datos verificados de otros VLA comparables dentro de la informacion proporcionada, por lo que la comparacion cuantitativa se limita al modelo base.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea y un unico objeto ("Put the yellow lego block into the white case"); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluacion publicada: no hay tasa de exito ni pruebas de robustez, por lo que se desconoce su fiabilidad real.
- Dependencia del montaje: el rendimiento depende de la posicion de las camaras, la iluminacion y la disposicion de los objetos; cambios en el entorno pueden degradar el comportamiento.
- Dependencia del hardware: esta ajustada para el brazo so_follower (SO-101) con camaras wrist y front; un robot distinto del mismo tipo puede requerir recalibracion o reentrenamiento.
- Riesgo de alucinacion motora: como politica generativa, puede producir acciones incorrectas o inseguras ante situaciones fuera de distribucion; es imprescindible supervisar y limitar el rango de movimiento.
- Idiomas: no se documenta comportamiento multilingue; la instruccion de tarea se proporciona en ingles en los ejemplos.
- Licencia: apache-2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset asociado.
- Sin garantias de seguridad: al controlar un robot fisico, debe operarse con protocolos de parada de emergencia y en entornos controlados.
- Adopcion minima: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion externa disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emboss369/smolvla-yellow-lego-to-white-case
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/emboss369/so101-yellow-lego-to-white-case_20260727_220921
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=emboss369/so101-yellow-lego-to-white-case_20260727_220921
- Articulo del metodo (SmolVLA): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index

Nota: los resultados de la busqueda web realizada no aportaron enlaces tecnicos relevantes sobre este modelo (solo resultados no relacionados), por lo que se han omitido.

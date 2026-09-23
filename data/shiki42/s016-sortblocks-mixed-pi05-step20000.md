# Shiki42/s016-sortblocks-mixed-pi05-step20000

## Resumen

Shiki42/s016-sortblocks-mixed-pi05-step20000 es un checkpoint de inferencia de robotica publicado por el usuario Shiki42 en HuggingFace. Se trata de una politica entrenada dentro del ecosistema OpenPI (libreria `openpi`, `pipeline_tag: robotics`) y etiquetada por su autor como "E762 Blocks Ranking PI0.5 checkpoint — step 20000", es decir, una instantanea del paso 20.000 de un run de entrenamiento derivado del experimento E762 / E762-R004. El repositorio ocupa 6,3 GB e incluye exclusivamente el arbol de parametros del modelo y los activos de normalizacion; el estado del optimizador y del cargador de datos se han excluido deliberadamente, por lo que esta pensado para inferencia y no para reanudar el entrenamiento.

El modelo resuelve una tarea concreta de manipulacion robotica (la ordenacion o ranking de bloques, segun el nombre de la tarea "sortblocks") y forma parte de la familia PI0.5 de OpenPI, una linea de politicas vision-lenguaje-accion. No es un modelo de lenguaje generalista: no genera texto libre ni codigo, sino acciones motoras condicionadas por instrucciones en ingles y por observaciones visuales.

Su relevancia actual es acotada pero clara para investigacion en robotica: aporta trazabilidad completa del entrenamiento (hashes SHA-256 de la normalizacion y del manifiesto de runtime, commit del CTR, ficheros `resolved_config.json` y `training-provenance.json`) y verificacion de integridad del checkpoint. Sin embargo, el propio autor indica que la evaluacion esta pendiente y que la tarjeta no reclama ninguna tasa de exito, y el modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; checkpoint identificado como PI0.5 dentro de la libreria OpenPI, sin detalle de capas ni de modulo de accion en la model card |
| Parametros totales | no disponible (el repositorio pesa 6,3 GB, pero no se indica el numero de parametros ni la precision de almacenamiento) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se publica en formato nativo OpenPI, sin variantes cuantizadas declaradas |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | arbol de parametros OpenPI en `params/` (JAX/Flax) mas `assets/` con estadisticas de normalizacion; sin safetensors ni GGUF declarados |
| Tarea declarada | robotics (manipulacion; tarea "sortblocks" / ranking de bloques) |
| Dataset de entrenamiento | Shiki42/ctr-sortblocks-100ep-mixed, revision `8ffc6532ae477bb0dc1fccf0377450f7f0795a6d` |
| Actualizaciones del optimizador | 20.000 (batch 16, seed 87431, checkpoint en el paso 20.000) |
| Tamano del repositorio | 6,3 GB |
| Fecha de creacion / actualizacion | 2026-09-23 / 2026-09-23 (fechas tal como las reporta HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Todo lo que puede afirmarse con la informacion disponible es que se trata de un checkpoint de la familia PI0.5 dentro del ecosistema OpenPI, que el autor publica como "E762 Blocks Ranking PI0.5 checkpoint" y que su salida esperada es una politica de robot (pipeline `robotics`). No se detallan el tipo de backbone, el mecanismo de atencion, el modulo de generacion de acciones ni el numero de tokens de contexto. Cualquier afirmacion adicional sobre la arquitectura seria especulativa y no debe tomarse como dato verificado.

El entrenamiento si esta documentado con precision inusual: 20.000 actualizaciones del optimizador con batch de tamano 16 y semilla 87431, sobre el dataset `ctr-sortblocks-100ep-mixed` congelado en la revision `8ffc6532ae477bb0dc1fccf0377450f7f0795a6d`. Se indica que el consumo de perdida por IdleMask es `false` y se aporta el commit del CTR `0341c7bdac2046a2e8c7a2efca3d8f8707da2eb6`. Los artefactos de procedencia incluyen el SHA-256 de la normalizacion cuantil global (`1e9373bfd47627a0323e72c68abc28f8e1c3e590923fbd8d03d74012912acd1d`), el SHA-256 del manifiesto de runtime (`06e035fbc62dd7f32f01a2f5ad536f01bd5af6caae3239698dbb8c07ed503332`) y un fichero `SHA256SUMS` que liga los ficheros publicados. La verificacion del checkpoint consistio en recarga en proceso nuevo y comprobacion de parametros finitos para los pasos 10.000 y 20.000. No se menciona RLHF, DPO ni ninguna fase de alineacion.

## Capacidades

- Ejecucion de politicas de manipulacion robotica orientadas a la tarea "sortblocks" (ordenacion o ranking de bloques), segun el nombre del checkpoint y del dataset.
- Condicionamiento por instrucciones en ingles: el campo `language` de la model card declara unicamente `en`.
- Inferencia a partir de un arbol de parametros nativo OpenPI, con activos de normalizacion incluidos en `assets/`, lo que permite reproducir el preprocesado exacto usado en entrenamiento.
- Verificacion de integridad y trazabilidad: recarga en proceso nuevo y comprobacion de parametros finitos superadas en los pasos 10.000 y 20.000.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision general, audio, generacion de texto, codigo o matematicas.
- No se declara modo "thinking" ni ninguna capacidad especial adicional.

## Casos de uso

- Reproduccion del experimento E762 / E762-R004: cargar el checkpoint en el runtime OpenPI y verificar que el arbol de parametros y los activos de normalizacion se resuelven correctamente usando `resolved_config.json`, `training-provenance.json` y `SHA256SUMS`.
- Punto de partida para fine-tuning en manipulacion: al excluir el estado del optimizador, el repositorio sirve como inicializacion limpia para nuevos runs sobre tareas de picking y colocacion de objetos.
- Comparacion entre hitos de entrenamiento: los propios autores verificaron los pasos 10.000 y 20.000, lo que permite estudiar el efecto del numero de actualizaciones sobre el comportamiento de la politica.
- Evaluacion de politicas en banco de pruebas: al no existir tasa de exito publicada, el checkpoint es un candidato natural para su evaluacion sistematica en simulacion o en celda real antes de cualquier uso aplicado.
- Automatizacion de ordenado o clasificacion de piezas: en un escenario de bin picking, la politica puede integrarse en un pipeline de control para colocar objetos en el orden aprendido, siempre que la tarea coincida con la distribucion de `ctr-sortblocks-100ep-mixed`.
- Auditoria de reproducibilidad en investigacion: los hashes SHA-256 del artefacto de normalizacion y del manifiesto de runtime permiten reconstruir la cadena de custodia del modelo en publicaciones o revisiones internas.
- Estudio del efecto de la normalizacion cuantil: al publicarse la estadistica global de normalizacion como activo separado, permite analizar como afecta ese preprocesado al comportamiento de la politica.
- Formacion y divulgacion tecnica: sirve como ejemplo didactico de como se estructura un checkpoint OpenPI (parametros, activos, configuracion resuelta, procedencia) para equipos que se inician en politicas VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente "Evaluation: pending; this card makes no success-rate claim", por lo que no existe ninguna tasa de exito, metrica de tarea ni comparacion cuantitativa que pueda citarse.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como aproximacion derivada del tamano del repositorio (6,3 GB), si los parametros se almacenasen en bf16 corresponderian a unos 3.000 millones de parametros y, en fp32, a unos 1.500 millones. Cualquiera de las dos cifras situa la inferencia en un rango orientativo de 8 a 16 GB de VRAM, pero es una estimacion no confirmada por el autor y debe validarse antes de dimensionar un despliegue.
- GPU recomendadas: no disponible en la informacion proporcionada. No se indica compatibilidad con A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no confirmado. Por el rango de VRAM estimado, es plausible en tarjetas de 12-16 GB o superiores, pero no hay declaracion del autor al respecto.
- Opciones de despliegue: el unico runtime declarado es OpenPI (formato de pesos JAX/Flax con manifiesto de runtime y `resolved_config.json`). No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas estan orientados a modelos de lenguaje y no a politicas de robotica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada. El unico marco de referencia identificable es la propia familia PI0.5 de OpenPI, de la que este repositorio es un ajuste especifico, pero no se aportan parametros, contexto, licencia ni metricas de ningun miembro de la familia, ni de alternativas equivalentes.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s016-sortblocks-mixed-pi05-step20000 | no disponible | no disponible | evaluacion pendiente, sin tasa de exito | no disponible | publico en HuggingFace, 0 descargas |
| Base PI0.5 / OpenPI | no disponible | no disponible | no disponible | no disponible | no especificado en esta informacion |
| Alternativas de politica robotica | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Evaluacion pendiente: el autor declara explicitamente que la tarjeta no reclama ninguna tasa de exito, por lo que el rendimiento real de la politica es desconocido.
- Licencia no disponible: sin licencia declarada, el uso comercial y la redistribucion quedan en un limbo legal que debe aclararse con el autor antes de cualquier despliegue productivo.
- Idiomas: la model card solo declara ingles (`en`), lo que limita el condicionamiento por instrucciones a ese idioma.
- Especificidad de tarea: el checkpoint esta entrenado sobre `ctr-sortblocks-100ep-mixed`, un dataset concreto de ordenado de bloques; se espera una degradacion clara fuera de esa distribucion.
- Sin benchmarks ni baseline publicos: no hay forma de compararlo objetivamente con otras politicas ni de estimar su tasa de exito.
- Riesgo de sobreajuste o infraentrenamiento: con 20.000 actualizaciones y batch 16 sobre un unico dataset, el comportamiento fuera de la tarea objetivo es impredecible.
- Sesgos: no disponible; no se documenta ningun analisis de sesgo, ni de robustez frente a variaciones de iluminacion, posicion de camara o propiedades fisicas de los objetos.
- Alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de acciones fisicas incorrectas en robot real, con posibles danos materiales.
- Excluye estado del optimizador y del cargador de datos: no permite reanudar el entrenamiento tal cual, solo inicializar uno nuevo.
- Repositorio de 6,3 GB: el coste de almacenamiento y de transferencia no es trivial para iteraciones rapidas.
- Procedencia fijada por hashes: cualquier modificacion de los activos de normalizacion invalida la reproducibilidad declarada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/s016-sortblocks-mixed-pi05-step20000
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-sortblocks-100ep-mixed
- Revision del dataset: `8ffc6532ae477bb0dc1fccf0377450f7f0795a6d`
- Commit del CTR: `0341c7bdac2046a2e8c7a2efca3d8f8707da2eb6`
- Repositorio OpenPI (referencia del runtime, no enlazado en la model card): https://github.com/Physical-Intelligence/openpi
- Paper, blog o demo especificos de este checkpoint: no disponible

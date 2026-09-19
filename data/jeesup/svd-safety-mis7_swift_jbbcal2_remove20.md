# Jeesup/svd-safety-mis7_swift_jbbcal2_remove20

## Resumen

`Jeesup/svd-safety-mis7_swift_jbbcal2_remove20` es un checkpoint derivado de `mistralai/Mistral-7B-Instruct-v0.2` comprimido mediante SVD-LLM hasta el 80,0 % de los parámetros densos (20,00 % de parámetros eliminados) y con un presupuesto de restauración de componentes SVD del 0,000 % (0 componentes restaurados y 0 sustituidos, semilla 42). Lo publica el usuario Jeesup bajo licencia Apache 2.0 como artefacto de investigación, en formato `safetensors` y compatible con la librería `transformers` y con `text-generation-inference`.

Su interés no es la generación de texto en producción, sino el estudio sistemático de cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes lo repara mejor. Este repositorio es una celda concreta de una rejilla que cruza reglas de selección y presupuestos de restauración; la propia model card advierte que varias celdas de la rejilla están «deliberadamente degradadas en seguridad» respecto al modelo base.

El valor del artefacto está en sus métricas publicadas: tasa de éxito de ataque (ASR) de 0,2846 en AdvBench y 0,3323 en StrongREJECT con juez HarmBench, una tasa de sobrerrechazo macro de 0,1364 medida con WildGuard y una perplejidad de 7,4075 en WikiText-2. Con 0 descargas y 0 «me gusta» en el momento de la consulta, se trata de un recurso prácticamente inédito, pensado para reproducibilidad experimental y no para despliegue como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.2); pesos comprimidos con SVD-LLM |
| Parametros totales | 7.241.732.096 segun los metadatos de safetensors; la model card declara una fraccion resultante de 0,8004 (discrepancia sin aclarar, ver limitaciones) |
| Longitud de contexto | 32.768 tokens segun el modelo base Mistral-7B-Instruct-v0.2; no confirmado en la model card de este checkpoint |
| Tipos de cuantizacion | No disponible en el repositorio (solo pesos safetensors). No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache License 2.0 (la model card indica que el repositorio del modelo base no incluye fichero de licencia para redistribuir, y que la licencia Apache 2.0 gobierna este derivado) |
| Formato de pesos | safetensors (repo de 14,5 GB) |
| Pipeline | text-generation |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.2 |
| Regla de seleccion de componentes | `unknown` (no documentada en la model card) |
| Presupuesto de restauracion | 0,000 % de parametros densos; 0 componentes restaurados |
| Fecha de publicacion | 19 de septiembre de 2026 (creacion), ultima actualizacion el mismo dia |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.2, un transformer decoder-only de aproximadamente 7,24 mil millones de parametros. Sobre esos pesos se aplica SVD-LLM, una tecnica de compresion por descomposicion en valores singulares que aproxima las matrices de pesos por componentes de rango reducido: en este caso se elimina el 20,00 % de los parametros densos, quedando una fraccion declarada de 0,8004. La model card no detalla en que capas se aplico la descomposicion, ni el rango retenido por capa, ni la metrica interna de SVD utilizada.

No hay informacion sobre entrenamiento adicional, ajuste fino, RLHF o DPO posteriores a la compresion. El checkpoint es el resultado directo de aplicar SVD-LLM con semilla 42 y con una regla de seleccion de componentes etiquetada como `unknown`. El presupuesto de restauracion es nulo: no se reinyecta ningun componente SVD del modelo original, de modo que este punto de la rejilla mide el efecto de la compresion pura sin reparacion posterior. La innovacion tecnica del artefacto no esta en la arquitectura, sino en la metodologia de evaluacion del compromiso entre seguridad y utilidad bajo compresion.

## Capacidades

- Generacion de texto conversacional e instrucciones: conserva la capacidad base de Mistral-7B-Instruct-v0.2, pero degradada por la compresion.
- Razonamiento y conocimiento general: presumiblemente heredados del modelo base, sin metricas publicadas en la model card (no hay MMLU, GSM8K ni HumanEval).
- Generacion de codigo: capacidad heredada del modelo base, no medida ni verificada en este checkpoint.
- Tool calling / function calling: no verificado; el modelo base lo soporta, pero no hay evidencia de que la compresion lo preserve.
- Capacidades de agente y razonamiento multi-paso: no verificadas.
- Multilingue: no declarado en la model card; el modelo base es multilingue, pero no hay evaluacion en este checkpoint.
- Modo de razonamiento explicito (thinking): no soportado ni documentado.
- Vision o audio: no soportados.
- Capacidad analitica real del artefacto: servir como sujeto experimental para medir ASR, sobrerrechazo y perplejidad bajo compresion, con valores ya publicados para AdvBench, StrongREJECT, WildGuard y WikiText-2.

## Casos de uso

- Reproduccion de estudios sobre compresion y seguridad: el checkpoint aporta valores de referencia concretos (AdvBench ASR 0,2846, StrongREJECT ASR 0,3323) para replicar experimentos sobre como SVD-LLM afecta al alineamiento; es adecuado porque fija semilla 42, presupuesto de restauracion y regla de seleccion.
- Evaluacion comparativa de reglas de seleccion de componentes SVD: este repositorio es una celda concreta de una rejilla, por lo que sirve como punto de comparacion frente al resto de celdas del mismo estudio para decidir que regla repara mejor la seguridad.
- Calibracion de jueces de seguridad: los valores de ASR con juez HarmBench y de sobrerrechazo con WildGuard permiten comprobar la sensibilidad de estos clasificadores ante modelos degradados, usando este checkpoint como caso negativo controlado.
- Auditoria de pipelines de compresion: un equipo que aplique SVD, poda o cuantizacion agresiva puede usar este modelo como control para validar que su propio pipeline no hunde las defensas del modelo por debajo del umbral medido aqui.
- Analisis de interpretabilidad de daño por compresion: comparar activaciones y patrones de rechazo frente al modelo base ayuda a localizar que subespacios de pesos sostienen el comportamiento de seguridad.
- Docencia y formacion en seguridad de IA: sirve como ejemplo verificable de que una intervencion puramente de eficiencia (comprimir al 80 %) puede elevar la tasa de exito de ataque sin tocar el alineamiento.
- Pruebas de infraestructura de inferencia: por su tamano y formato safetensors, permite validar cargas en vLLM o TGI antes de mover otros checkpoints mas costosos, siempre que no se evalue la calidad de las respuestas como si fuera un asistente final.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,2846 |
| StrongREJECT | ASR (juez HarmBench) | 0,3323 |
| WildGuard | Sobrerrechazo macro | 0,1364 |
| WikiText-2 | Perplejidad | 7,4075 |

No se han publicado resultados de MMLU, HumanEval, GSM8K, MT-Bench ni de ningun otro benchmark de capacidad general en la informacion disponible. Tampoco se proporcionan los valores equivalentes del modelo base sin comprimir, por lo que no es posible cuantificar con los datos disponibles cuanto de ese ASR se debe exactamente a la compresion.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 14,5 GB solo para pesos, mas cache KV y activaciones; en la practica conviene reservar entre 16 y 18 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: del orden de 8 GB de pesos; en 4 bits, del orden de 4 a 5 GB (estimaciones por tamano de parametros; no hay versiones cuantizadas publicadas por el autor).
- GPU recomendadas: A100 40 GB, H100, L40S o A10G para fp16 sin cuantizar; RTX 4090 o RTX 3090 (24 GB) para fp16 con contexto contenido.
- GPU de consumo: si, cabe en RTX 4090, RTX 3090, RTX 4080 y similares de 16 GB o mas en fp16; en GPUs de 8 a 12 GB seria necesario cuantizar a 4 bits con herramientas externas.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (etiqueta `endpoints_compatible`). vLLM, llama.cpp y Ollama no estan confirmados, aunque serian viables si se genera una conversion a GGUF.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR AdvBench | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| svd-safety-mis7_swift_jbbcal2_remove20 (este) | 7.241.732.096 registrados; fraccion declarada 0,8004 | 32.768 (heredado del base) | 0,2846 | 7,4075 | Apache 2.0 | HuggingFace, 0 descargas |
| mistralai/Mistral-7B-Instruct-v0.2 (base sin comprimir) | No disponible en esta busqueda | No disponible en esta busqueda | No disponible en esta busqueda | No disponible en esta busqueda | Apache 2.0 | HuggingFace |
| Otras celdas de la rejilla SVD-LLM del mismo autor | No disponible | No disponible | No disponible | No disponible | Apache 2.0 (presumible) | No disponible |
| Alternativas de 7B comprimidas o podadas | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La busqueda web realizada no devolvio ningun resultado relacionado con el modelo ni con SVD-LLM, por lo que no se dispone de datos de comparacion externos verificables.

## Limitaciones y advertencias

- No es un modelo de proposito general: la model card lo describe explicitamente como artefacto de investigacion y advierte que debe tratarse como sujeto experimental, no como asistente desplegable.
- Degradacion de seguridad deliberada: la compresion por si sola eleva la tasa de exito de ataque, y varias celdas de la rejilla estan disenadas para estar degradadas; con ASR de 0,2846 en AdvBench y 0,3323 en StrongREJECT, el modelo es vulnerable a peticiones maliciosas.
- Riesgo de alucinacion: no evaluado en la model card; la perplejidad de 7,4075 en WikiText-2 no permite descartar degradacion en otros dominios.
- Discrepancia de parametros sin resolver: los metadatos de safetensors declaran 7.241.732.096 parametros (el tamano del Mistral-7B completo) mientras la model card indica una fraccion resultante de 0,8004. Conviene inspeccionar el checkpoint antes de asumir cualquier cifra.
- Longitud de contexto y comportamiento en contextos largos no verificados tras la compresion.
- Idiomas soportados no declarados; no hay garantia de que el multilingueismo del modelo base sobreviva.
- Ausencia de versiones cuantizadas publicadas: no hay GGUF, AWQ ni GPTQ en el repositorio, lo que complica el despliegue en hardware de gama media.
- Regla de seleccion de componentes marcada como `unknown`: no se puede reproducir la logica de seleccion a partir de la documentacion disponible.
- Estado de adopcion nulo (0 descargas, 0 me gusta) y ausencia de validacion por terceros.
- Licencia: se distribuye bajo Apache 2.0, pero la model card senala que el repositorio del modelo base no incluye fichero de licencia para redistribuir; revisar el cumplimiento antes de cualquier uso comercial.
- La model card recomienda evaluar el modelo uno mismo antes de extraer conclusiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mis7_swift_jbbcal2_remove20
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Paper de SVD-LLM: no disponible en la informacion proporcionada
- Repositorio de HarmBench (juez usado en las metricas): no disponible en la informacion proporcionada
- Dataset StrongREJECT: no disponible en la informacion proporcionada
- WildGuard (metrica de sobrerrechazo): no disponible en la informacion proporcionada
- La busqueda web ejecutada no devolvio ningun enlace relevante sobre este modelo, SVD-LLM ni sobre las herramientas de evaluacion citadas.

# shgao/rsi-jev-v3.0-qwen3.5-2b

## Resumen

RSI-Jev v3.0 es un modelo de decisiones tipadas de 2.000 millones de parametros construido sobre `Qwen/Qwen3.5-2B-Base`, desarrollado por el autor de HuggingFace `shgao` dentro del proyecto RSI-Jev. No es un modelo generativo: dada la descripcion de un documento (el estado) y una o varias preguntas tipadas, devuelve una probabilidad calibrada para cada opcion en un unico forward pass, sin decodificar texto. Los tres tipos de pregunta soportados son `choice` (elegir una entre k), `noul` (si/no) y `score` (puntuar segun rubrica), y el checkpoint expone ademas la API HTTP de Jev.

El checkpoint publicado corresponde a la semilla 17, fijada de antemano, y reporta 0.791 en la metrica de decisiones tipadas, 0.7965 con el orden de opciones invertido (lo que indica estabilidad frente al orden) y 0.364 en MMLU-Pro 1k. Su relevancia reside en que v3.0 es la primera version del linaje en la que la etapa de aprendizaje por refuerzo aporta una mejora medible: un reward de ranking listwise para reordenacion eleva el hippo R@1 de 0.192 a 0.308 (p = 2,4 × 10⁻¹³), un 60 % mas de aciertos en primera posicion, manteniendo plana la suite de quince benchmarks.

El modelo esta pensado para producir decisiones discretas y probabilidades calibradas (ECE de suite 0.066), no texto libre. Su utilidad principal esta en tareas de clasificacion, triaje y reranking dentro de pipelines donde se necesita una probabilidad fiable por candidato, y su licencia Apache 2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de tipo Qwen3.5 con torre ajustada, cabeza de scoring de opciones (option scorer) y cabeza de confianza para calibracion |
| Parametros totales | aproximadamente 2.000 millones (heredados de Qwen3.5-2B-Base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card no publica cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no especificado en la model card; repositorio de 5,6 GB cargado mediante `load_release` sobre el snapshot descargado |
| Modelo base | Qwen/Qwen3.5-2B-Base |
| Pipeline declarado | text-classification |
| Capas de la torre | 24 (las 8 inferiores se entrenan a una decima parte de la tasa de aprendizaje) |
| Opciones maximas por pregunta | 160 en entrenamiento y evaluacion (80 en versiones anteriores) |
| Semilla del checkpoint | 17 (semilla primaria fijada de antemano) |
| Stack de kernels | fla-0.5.2 / torch-2.7.1+cu128 |
| Reproducibilidad | 1.0000 respecto a su propia ejecucion de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura parte de `Qwen/Qwen3.5-2B-Base` y conserva su torre transformer, sobre la que se anaden dos componentes entrenables: el option scorer heredado de v1.0 y la cabeza de confianza introducida en v2.0. La innovacion de v2.1 que se mantiene en v3.0 es sustituir la suma de caracteristicas de opcion y de atencion cruzada por una combinacion mediante un MLP de dos capas (`xattn_combine: mlp`), lo que aporta +0.002 en la suite por si solo. El entrenamiento se organiza en dos etapas mas un reajuste final de calibracion.

La etapa 1 es supervisada y consta de 16.416 pasos con entropia cruzada suave, usando el corpus `data-scale-2` de 266.131 preguntas procedentes de 36 fuentes (hasta 6.000 preguntas por fuente, 30.000 elementos de tasksource, 10.000 de Open-Jev, diez fuentes de cobertura y los splits de entrenamiento de emotion, SST-5 y ANLI). Una de cada diez preguntas se reserva por hash de su identificador de caso y nunca se entrena. Los lotes se agrupan por longitud (anchura de 64 tokens) para abaratar cada paso. La etapa 2 es aprendizaje por refuerzo de reordenacion listwise durante 1.500 pasos: el scorer asigna una probabilidad de relevancia a cada uno de 16 candidatos, se muestrean 16 rankings de la distribucion Plackett-Luce inducida, cada ranking recibe su NDCG@5 frente a las etiquetas y la actualizacion usa REINFORCE con baseline leave-one-out y penalizacion KL (β = 0,1) hacia el modelo de la etapa 1. Los datos de RL son 1.000 consultas de 20 a 40 candidatos construidas a partir de los splits de entrenamiento de MS MARCO, TopiOCQA y FiQA con negativos duros de BM25, y nunca tocan LongMemEval. Finalmente, la cabeza de confianza (`oof_head_scorefloor`) se reajusta sobre el modelo de RL con 9.862 preguntas reservadas, descartando antes 534 casos cuyo texto de documento aparecia tambien en un caso entrenado, sin alterar en ningun caso que opcion gana.

## Capacidades

- Decisiones tipadas sobre documentos en un unico forward pass: `choice` (una entre k opciones), `noul` (si/no) y `score` (valoracion segun rubrica).
- Salida de probabilidades calibradas por opcion, no de texto generado; el ECE de suite reportado es 0.066.
- Robustez al orden de presentacion de las opciones: 0.7965 en la variante de orden invertido frente a 0.791 en la metrica estandar.
- Escalado a preguntas con hasta 160 opciones candidatas.
- Reordenacion de candidatos mediante probabilidad de relevancia, con un reward listwise especifico para esta tarea.
- Recuperacion de memoria para agentes: mejora del hippo R@1 de 0.192 a 0.308 respecto a su predecesor supervisado.
- Exposicion como servicio HTTP mediante la API de Jev.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingues: no disponible (la model card no declara idiomas).
- Capacidades de vision, audio o thinking mode: no disponibles; el modelo no genera texto ni razonamiento en cadena.

## Casos de uso

- Reranking en pipelines RAG: el modelo puntua la relevancia de cada candidato recuperado por un buscador lexico o vectorial y reordena la lista; la etapa de RL listwise esta disenada precisamente para optimizar el orden, con una mejora de R@1 del 60 % en recuperacion de memoria de referencia.
- Triaje y clasificacion documental por lotes: al no generar texto y resolver cada decision en un forward pass, permite clasificar grandes volumenes de documentos con preguntas `choice` normalizadas por dominio.
- Filtrado booleano a gran escala: las preguntas `noul` permiten construir compuertas si/no (cumple politica, es duplicado, requiere revision humana) con una probabilidad asociada que se puede umbralizar en produccion.
- Evaluacion automatica con rubricas: el tipo `score` permite puntuar respuestas o documentos segun un criterio graduado, devolviendo una distribucion calibrada que se puede auditar en lugar de una etiqueta opaca.
- Memoria de agentes conversacionales: dado un historial largo y un conjunto de recuerdos candidatos, el modelo selecciona cual es relevante para el turno actual, funcion que constituye el escenario que motivo el desarrollo del reward listwise.
- Anotacion asistida y control de calidad: las probabilidades calibradas permiten derivar umbrales de confianza y enrutar solo los casos dudosos a revision humana, apoyandose en un ECE bajo para estimar el riesgo.
- Deteccion de duplicados y similitud semantica: plantear la comparacion como una pregunta `choice` o `noul` sobre pares de documentos permite resolver deduplicacion sin recurrir a embeddings externos.
- Moderacion y cumplimiento normativo: compuertas `noul` sobre politicas internas, con la ventaja de que el coste por decision es el de un unico forward pass y no el de una generacion completa.

## Benchmarks y rendimiento

| Metrica | RSI-Jev v3.0-2B | RSI-Jev v2.1-2B |
|---|---|---|
| Typed-decisions | 0.791 | 0.7905 |
| Orden invertido (reversed order) | 0.7965 | no disponible |
| MMLU-Pro 1k | 0.364 | 0.3 (valor truncado en la model card) |
| Suite de 15 benchmarks | 0.756 | 0.736 |
| ECE de suite | 0.066 | no disponible |
| Conjunto held-out nuevo | referencia propia (+0.016 frente a v2.1, p = 0.011) | linea base |
| Hippo R@1 (reordenacion de memoria) | 0.308 | 0.192 (padre supervisado) |
| Reproduccion de su propia ejecucion de entrenamiento | 1.0000 | no disponible |

La mejora de hippo R@1 de 0.192 a 0.308 se reporta con p = 2,4 × 10⁻¹³. La busqueda del reward que produce esta mejora requirio cuatro oleadas y 59 brazos entrenados con recompensa. No se han publicado en la informacion disponible resultados de benchmarks adicionales como MMLU completo, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 2.000 millones de parametros; la model card no publica requisitos oficiales): en precision completa unos 8 GB, en bf16/fp16 unos 4 GB, en int8 alrededor de 2 GB y en int4 aproximadamente 1 a 1,5 GB, mas el overhead del runtime y de la cabeza de confianza.
- El repositorio ocupa 5,6 GB, un tamano superior al de los pesos en bf16, coherente con la presencia de componentes adicionales (cabeza de confianza, metadatos y artefactos de entrenamiento).
- Cabe en GPU de consumo: tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060 Ti) para bf16 e int8; cualquier GPU de 4 GB o mas en cuantizacion de 4 bits. Una RTX 4090 o una RTX 3090 quedan sobradamente dimensionadas.
- GPU de centro de datos recomendadas para despliegue concurrente: A100, H100 o L40S, aunque no son necesarias por tamano de modelo.
- Opciones de despliegue: la via documentada es PyTorch con la funcion `load_release` incluida en el repositorio, y el servicio HTTP de Jev para exposicion en red. No es un modelo generativo, por lo que los stacks habituales de servido de LLM (vLLM, TGI, llama.cpp, Ollama) no aplican de forma directa, salvo que se empaquete la cabeza de scoring como tarea de clasificacion.
- Requisitos de software: la model card fija el stack de kernels en `fla-0.5.2` con `torch-2.7.1+cu128`.
- Latencia y throughput estimados: no disponibles. Al resolver cada decision en un solo forward pass sin decodificacion autoregresiva, el coste por decision es sustancialmente menor que el de un modelo generativo del mismo tamano, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Typed-decisions | MMLU-Pro 1k | Suite / ECE | Licencia |
|---|---|---|---|---|---|---|
| RSI-Jev-v3.0-2B | ~2B | Qwen3.5-2B-Base | 0.791 | 0.364 | 0.756 / ECE 0.066 | Apache 2.0 |
| RSI-Jev-v2.1-2B | ~2B | Qwen3.5-2B-Base | 0.7905 | 0.3 (truncado) | 0.736 / no disponible | Apache 2.0 |
| Qwen3.5-2B-Base | ~2B | no aplica | no disponible (no incorpora cabeza de decision) | no disponible | no disponible | Apache 2.0 |

El competidor directo es su propio predecesor v2.1, del que v3.0 hereda el linaje y al que supera en la suite (0.736 a 0.756) y en el conjunto held-out nuevo (+0.016). Frente al modelo base Qwen3.5-2B-Base, la diferencia no es de rendimiento en benchmarks generales sino de funcionalidad: el base no incorpora el option scorer ni la cabeza de confianza, por lo que no produce probabilidades calibradas por opcion ni soporta la API de Jev. No se dispone de datos en la informacion proporcionada para comparar con otros modelos de clasificacion o reranking de la misma categoria.

## Limitaciones y advertencias

- La model card remite a una seccion §6 titulada "Limitations" para consultar lo que esta version no cambia, pero su contenido no esta incluido en la informacion disponible; se debe consultar el repositorio del proyecto antes de desplegar en produccion.
- No genera texto: cualquier caso de uso que requiera respuestas redactadas, resumen o razonamiento explicito queda fuera del alcance del modelo.
- Riesgo de alucinacion: no aplica en el sentido generativo clasico, pero si existe riesgo de calibracion incorrecta; el propio proyecto descarta 534 casos de calibracion cuyo texto de documento reaparecia en casos entrenados, lo que senala la contaminacion entre splits como un riesgo real.
- Los datos de RL proceden de MS MARCO, TopiOCQA y FiQA, por lo que el comportamiento en dominios alejados de busqueda y pregunta-respuesta no esta validado en la informacion disponible.
- El modelo nunca entrena con LongMemEval, que se usa como conjunto de evaluacion; no consta validacion con datos ajenos a ese ecosistema.
- Idiomas soportados: no disponible; no se declara cobertura multilingue, de modo que el uso en castellano no esta garantizado por la documentacion.
- Sesgos conocidos: no disponibles. Al derivar de Qwen3.5-2B-Base y de corpus como tasksource, emotion, SST-5 y ANLI, hereda potencialmente los sesgos de esas fuentes, pero no se documentan analisis al respecto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los corpus de entrenamiento derivados (tasksource, MS MARCO, FiQA, TopiOCQA, entre otros) si se redistribuye el modelo.
- El repositorio pesa 5,6 GB y el checkpoint se corresponde con una semilla concreta (17); otras semillas pueden dar resultados distintos pese a que se reporte reproducibilidad 1.0000 respecto a su propia ejecucion.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que carece de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shgao/rsi-jev-v3.0-qwen3.5-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Repositorio del proyecto RSI-Jev: https://github.com/Shanghua-Gao/RSI-Jev
- Documentacion de la API HTTP de Jev: https://github.com/Shanghua-Gao/RSI-Jev/blob/main/serve/README.md
- Documentacion del entrenamiento con RL: https://github.com/Shanghua-Gao/RSI-Jev/blob/main/docs/rl.md
- Registro de versiones: https://github.com/Shanghua-Gao/RSI-Jev/tree/main/versions
- Especificacion de la tarea en v1.0: https://github.com/Shanghua-Gao/RSI-Jev/blob/main/versions/v1.0.md
- Manifiesto del corpus v3.0: https://github.com/Shanghua-Gao/RSI-Jev/blob/main/data/v3.0_corpus_manifest.json

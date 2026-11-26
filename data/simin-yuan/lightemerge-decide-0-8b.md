# simin-yuan/LightEmerge-Decide-0.8B

## Resumen

LightEmerge-Decide-0.8B es un modelo de lenguaje de pequeno tamano (0,8B parametros) desarrollado por simin-yuan, afinado a partir de Qwen/Qwen3.5-0.8B-Base. No es un modelo conversacional generalista: esta especializado en responder preguntas de decision estructuradas, donde se proporciona una descripcion de estado y una pregunta con un conjunto cerrado de candidatos, y el modelo devuelve una distribucion de probabilidad sobre esos candidatos. Soporta tres tipos de pregunta: `choice` (elegir 1 de N etiquetas), `noul` (binaria si/no) y `score` (nivel ordinal, por ejemplo 0-4).

La relevancia del modelo reside en su enfoque de calibracion: la distribucion de salida es la propia distribucion next-token del modelo restringida a los tokens de las etiquetas candidatas, sin capa de calibracion separada, sin ajuste de temperatura ni ensemble. Esto lo hace interesante para sistemas de decision automatizada donde no solo importa la respuesta, sino la confianza asociada a ella.

El modelo se distribuye con licencia Apache-2.0, pesos safetensors en formato transformers, y esta pensado para prompts y etiquetas en ingles. Su ventana de contexto maxima es de 4096 tokens, heredada del modelo base. El checkpoint liberado es denso (LoRA fusionado con `merge_and_unload()`), sin dependencia de PEFT en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B-Base, tag `qwen3_5_text`) |
| Parametros totales | 752.393.024 (0,75B, segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (max sequence length) |
| Tipos de cuantizacion | no disponible (entrenado y evaluado en bfloat16; el autor no documenta cuantizaciones) |
| Idiomas soportados | Ingles (prompts y etiquetas en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); sin GGUF documentado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base, un transformer decoder-only, y se afina mediante LoRA cuyos pesos se fusionan en los pesos completos del modelo base. La receta del adaptador (rank, alpha, modulos objetivo, ajustes del optimizador) es propietaria y no se ha liberado. El entrenamiento se realizo en bfloat16 sobre una unica GPU de consumo (24 GB).

El entrenamiento consistio en una sola ejecucion supervisada sobre una mezcla propietaria de 10.000 ejemplos, una epoca, un unico checkpoint, sin busqueda de checkpoint ni early stopping. La innovacion tecnica destacable es el objetivo de entrenamiento: en lugar de cross-entropy plano, se optimiza la distribucion sobre los candidatos, mezclando targets suaves procedentes de un modelo profesor mayor (Qwen/Qwen3.5-27B, Apache-2.0) con perdidas de distribucion directas calculadas sobre la porcion de candidatos. El codigo de entrenamiento, los hiperparametros exactos, los pesos de las perdidas y la mezcla de datos por fuente no se han liberado; solo se publica lo necesario para ejecutar, evaluar y reproducir las mediciones.

## Capacidades

- Generacion de distribuciones de probabilidad sobre conjuntos cerrados de etiquetas candidatas (no generacion de texto libre como funcion principal).
- Preguntas de tipo `choice`: seleccion de 1 entre N etiquetas (por ejemplo, clasificacion de intencion sobre 5 categorias de servicio).
- Preguntas de tipo `noul`: decision binaria (por ejemplo, "esta cubierto por la poliza?").
- Preguntas de tipo `score`: nivel ordinal (por ejemplo, severidad en escala 0-4).
- Calibracion integrada: la distribucion de salida es la distribucion next-token restringida a los tokens de las etiquetas, sin capa de calibracion adicional.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles (prompts y etiquetas en ingles).
- Capacidades especiales: modo de salida puntuada (`scored-output`), calibracion (`calibration`), decision-making.

## Casos de uso

- Clasificacion de intencion en atencion al cliente: dado un mensaje del usuario y un conjunto cerrado de categorias de servicio, el modelo devuelve una distribucion sobre las categorias, permitiendo enrutar la conversacion segun la etiqueta mas probable y su confianza.
- Decisiones de cobertura en seguros: con una descripcion del caso y una pregunta binaria del tipo "esta cubierto bajo la poliza?", el modelo devuelve probabilidad de si/no, util para triaje previo a revision humana.
- Puntuacion de severidad o riesgo: usando preguntas de tipo `score`, el modelo asigna un nivel ordinal (por ejemplo, 0-4) sobre la gravedad de un incidente, con la ventaja de que la distribucion permite umbralizar la confianza.
- Triaje de solicitudes de subvencion o revision de credito: el modelo se evaluo especificamente sobre reglas de subvenciones y revision de credito (`pub434`), por lo que encaja en flujos de preevaluacion deterministas con reglas conocidas.
- Evaluacion de respuestas en pares (preferencia): el modelo se evaluo sobre pares de respuestas de HelpSteer2 (`judge260`) para decidir cual es mas util, lo que lo hace util como componente de anotacion o filtrado de preferencias.
- Sistemas de decision de baja latencia: con p50 de 0,05 s por ronda de decision en una RTX 4090D en bfloat16 y batch 1, encaja en pipelines que requieren decisiones en tiempo real o casi real.
- Componente de calibracion en pipelines mayores: al devolver una distribucion calibrada sobre etiquetas, puede integrarse como modulo de decision dentro de un sistema mayor que combine varios modelos o reglas.

## Benchmarks y rendimiento

Los resultados proceden de cuatro conjuntos de evaluacion locales del autor. Ninguno es el draw oficial de un leaderboard, por lo que no deben compararse con cifras publicadas de leaderboards. La metrica Cap combina inteligencia (I) y calibracion (C): `Cap = (I + C) / 2`.

| Ruler | n | Prior-baseline acc | Prior-baseline Cap | v1.0 acc | v1.0 Int | v1.0 Cal | v1.0 Cap |
|---|---|---|---|---|---|---|---|
| judge260 | 260 | 0,4923 | 16,57 | 0,5077 | 1,54 | 80,26 | 40,90 |
| valhard | 150 | 0,3333 | 8,89 | 0,3867 | 8,46 | 25,03 | 16,75 |
| pub231 | 231 | 0,5714 | 48,57 | 0,5801 | 39,03 | 64,28 | 51,65 |
| pub434 | 434 | 0,6820 | 43,37 | 0,6567 | 41,80 | 43,67 | 42,73 |
| Media Cap | | | 29,35 | | | | 38,01 |

El `prior-baseline` es un afinado interno anterior del mismo modelo base, no los pesos base sin afinar. El Qwen3.5-0.8B-Base original no se tabula porque dejo 35 de 266 items de `pub231` sin puntuar al no emitir respuesta parseable. Lectura honesta de la tabla: la version v1.0 sube la media de Cap de 29,35 a 38,01, pero no en todos los rulers: en `pub434` la exactitud baja de 0,6820 a 0,6567, y en `pub231` la ganancia de exactitud es de 0,9 puntos frente a 5,0 puntos de calibracion. En `judge260` la Cap 40,90 se debe mayoritariamente a calibracion (Int 1,54, apenas por encima del cero corregido por azar).

Latencia: p50 de 0,05 s por ronda de decision individual, medida en una RTX 4090D, bfloat16, batch 1, loopback local. El leaderboard al que apunta el lanzamiento clasifica con `2 × medido + 150 ms`, lo que para este modelo es aproximadamente 0,25 s.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 752M parametros en bfloat16 (2 bytes por parametro) los pesos ocupan aproximadamente 1,5 GB, y el repo pesa 1,5 GB.
- GPU recomendadas: el autor entreno y evaluo en una unica GPU de consumo de 24 GB; la latencia se midio en una RTX 4090D.
- Cabe en GPU de consumo: si, dado el tamano (0,75B parametros) y el repo de 1,5 GB.
- Opciones de despliegue: transformers (libreria declarada); el tag `endpoints_compatible` sugiere compatibilidad con endpoints. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: p50 de 0,05 s por decision en RTX 4090D, bfloat16, batch 1. Throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| LightEmerge-Decide-0.8B | 0,75B | 4096 | Apache-2.0 | Decision estructurada con distribucion calibrada sobre candidatos | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3.5-0.8B-Base | 0,8B (nominal) | no disponible | Apache-2.0 | Modelo base generalista | Hugging Face |
| Qwen/Qwen3.5-27B | 27B (nominal) | no disponible | Apache-2.0 | Modelo profesor usado para targets suaves | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de decision de la misma categoria en la informacion proporcionada. El modelo base sin afinar no se tabula en la evaluacion del autor por el problema de respuestas no parseables en `pub231`.

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para preguntas de decision con conjunto cerrado de candidatos; no es un modelo conversacional generalista ni de generacion de texto libre.
- Solo soporta ingles (prompts y etiquetas); no se documentan capacidades multilingues.
- La receta de entrenamiento (LoRA, hiperparametros, mezcla de datos, pesos de perdidas) es propietaria y no se libera: no es posible reentrenar el modelo, solo ejecutarlo y evaluarlo.
- En `pub434` la exactitud retrocede respecto al baseline interno (0,6820 a 0,6567); no hay mejora universal en todos los conjuntos.
- En `judge260` la inteligencia apenas supera el azar corregido (Int 1,54); la mayor parte de la mejora en ese conjunto proviene de la calibracion.
- Las cifras de evaluacion proceden de conjuntos locales del autor y no son comparables con leaderboards oficiales.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al operar sobre conjuntos cerrados de etiquetas, el riesgo se traslada a la seleccion de etiqueta y a la calibracion de la distribucion.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B-Base tambien es Apache-2.0; conviene verificar los terminos del modelo base y de las fuentes de datos citadas en `docs/DATA_SOURCES.md`.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.
- El contexto maximo de 4096 tokens puede ser insuficiente para descripciones de estado largas o conversaciones multi-turno extensas.

## Enlaces

- Hugging Face: https://huggingface.co/simin-yuan/LightEmerge-Decide-0.8B
- Repositorio con ficheros de evidencia: https://github.com/simin-yuan/lightemerge-decide/tree/master/evidence
- Fuentes de datos y comprobacion de solapamiento cero: https://github.com/simin-yuan/lightemerge-decide/blob/master/docs/DATA_SOURCES.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.5-27B

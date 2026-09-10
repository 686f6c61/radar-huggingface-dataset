# rolf-mozilla/multilingual-e5-small-enfr-pruned-q8

## Resumen

`rolf-mozilla/multilingual-e5-small-enfr-pruned-q8` es un artefacto experimental de embeddings publicado por Mozilla (cuenta `rolf-mozilla`) como derivado de `intfloat/multilingual-e5-small`. Se trata de un build ONNX en int8 en el que se ha reducido la tabla de embeddings de tokens a las filas que realmente aparecen en texto en inglés y francés, pasando de 250.037 filas a 18.572. El encoder es idéntico byte a byte al del ONNX cuantizado de `Xenova/multilingual-e5-small`, que es el fichero que el motor de machine learning de Firefox descarga actualmente.

El objetivo del artefacto es servir de banco de pruebas para la evaluación de embeddings de la función Smart Window de Firefox, priorizando el tamano de descarga sobre la precision. La poda de vocabulario reduce el payload total de 135,39 MB a 30,37 MB (factor 4,46x), a cambio de una perdida de nDCG@5 de 0,0225 en ingles y 0,0139 en frances sobre el conjunto de evaluacion `memory_usage_eval`.

Se distribuye unicamente como modelo de extraccion de caracteristicas (feature-extraction) para transformers.js, con licencia MIT heredada del modelo original, y esta declarado por el propio autor como artefacto temporal de evaluacion susceptible de ser eliminado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (etiquetado como `bert` en el repo; base `intfloat/multilingual-e5-small`), no generativa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX `model_quantized.onnx`, cuantizacion per tensor con `weight_scale` / `weight_zero_point` escalares) |
| Idiomas soportados | ingles (en) y frances (fr); sin soporte para escrituras no latinas (CJK, cirilico, arabe, devanagari) |
| Licencia | MIT |
| Formato de pesos | ONNX (transformers.js); safetensors no disponible |
| Filas de vocabulario | 18.572 (original: 250.037) |
| Tamano de `onnx/model_quantized.onnx` | 29,43 MB (original: 118,31 MB) |
| Tamano de `tokenizer.json` | 0,94 MB (original: 17,08 MB) |
| Descarga total | 30,37 MB (original: 135,39 MB) |
| Tamano del repo | 0,0 GB |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo no se ha reentrenado: es un encoder transformer bidireccional de la familia E5 (base `intfloat/multilingual-e5-small`) cuyo grafo ONNX cuantizado a int8 se ha conservado intacto. La unica modificacion es la tabla de embeddings de tokens, reducida de 250.037 a 18.572 filas. El autor justifica que las filas conservadas son identicas bit a bit: en el grafo original la tabla se cuantiza per tensor y se lee mediante un `Gather` simple sobre `input_ids`, y la unica salida del grafo es `last_hidden_state`, sin cabeza LM ni segundo tensor de tamano vocabular, por lo que eliminar filas no puede perturbar las restantes. Los ids de token se renumeraron filtrando la lista posicional Unigram `model.vocab` de `tokenizer.json`, manteniendo `<s>`, `<pad>`, `</s>` y `<unk>` en los ids 0-3.

El criterio de seleccion del vocabulario fueron las frecuencias de token sobre aproximadamente 224.000 textos en ingles y frances de cinco dominios (MASSIVE intents en/fr, SciFact, SyntecRetrieval, WikiText-2 y retrieval de historial de navegador en/fr), conservando todo token visto al menos 50 veces. Los textos de evaluacion quedaron excluidos de ese corpus, de modo que las cifras de precision miden generalizacion. La unica diferencia de comportamiento declarada es la resegmentacion: al haber menos piezas disponibles, el modelo Unigram de SentencePiece segmenta de forma distinta algunas palabras poco frecuentes. La tabla de embeddings representaba el 81,2% de los pesos originales; el encoder restante son 21,88 MB que constituyen el suelo duro de esta tecnica. No se documenta ningun proceso de RLHF, DPO o ajuste por instrucciones: es un modelo de representaciones, no de generacion.

## Capacidades

- Generacion de embeddings de texto para recuperacion semantica y similitud entre frases (pooling de media y normalizacion L2, segun la model card).
- Extraccion de caracteristicas (`feature-extraction`) en ingles y frances, con tasas de `<unk>` de 0 en ambos conjuntos de evaluacion.
- Retrieval per-query sobre conjuntos de candidatos cortos (11-21 candidatos, 2-4 relevantes) en el escenario `memory_usage_eval` de Mozilla.
- Ejecucion en navegador y en el cliente mediante transformers.js, incluyendo el motor de ML de Firefox.
- No soporta generacion de texto: no hay cabeza LM ni decoder.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni ninguna capacidad multimodal.
- No soporta idiomas fuera de ingles y frances: el texto no latino degrada a `<unk>` y el tokenizador de origen no tiene byte fallback.
- En la evaluacion publicada no se utilizo el prefijo `query:` / `passage:` que acompana habitualmente a la familia E5.

## Casos de uso

- Recuperacion de memorias en el navegador (Firefox Smart Window): el modelo esta construido especificamente para puntuar memorias candidatas frente a una consulta del usuario, con un payload de 30,37 MB que hace viable descargarlo en el cliente sin penalizar el arranque.
- Busqueda semantica en historial de navegacion en ingles y frances: dado que el corpus de seleccion de vocabulario incluye retrieval de historial en ambos idiomas, el espacio de embeddings esta ajustado a ese dominio.
- Deduplicacion y agrupacion de textos bilingues: calcular embeddings de un lote de documentos y aplicar clustering o umbral de similitud coseno para detectar duplicados en corpus EN/FR.
- RAG ligero en el cliente: indexar un conjunto reducido de pasajes y recuperar fragmentos relevantes antes de pasarlos a un modelo generativo, aprovechando que la inferencia puede ejecutarse en WASM sin GPU dedicada.
- Clasificacion de intenciones: usar los embeddings como entrada de un clasificador ligero (regresion logistica, kNN) sobre dominios tipo MASSIVE intents, para los que el vocabulario se ajusto explicitamente.
- Verificacion de afirmaciones cientificas (estilo SciFact): recuperar evidencia relevante de un corpus de resumenes mediante similitud vectorial, en el flujo de recuperacion previo a una etapa de verificacion.
- Recomendacion de contenidos editoriales en frances e ingles: generar vectores de articulos y usuarios y ordenar candidatos por similitud, con un coste de almacenamiento muy inferior al del modelo original.
- Filtrado de contenido en extensiones de navegador: comparar el embedding de un texto entrante con el de una lista de referencia para bloquear o marcar contenido, con la ventaja de que no requiere enviar datos a un servidor.

## Benchmarks y rendimiento

Datos publicados por el autor para recuperacion per-query sobre `memory_usage_eval` (500 consultas, cada una con 11-21 memorias candidatas y 2-4 relevantes; media macro; pooling de media con normalizacion L2):

| Metrica | EN nDCG@5 | EN MRR@10 | FR nDCG@5 | FR MRR@10 |
|---|---|---|---|---|
| `intfloat/multilingual-e5-small` q8 original | 0,7188 | 0,8665 | 0,5599 | 0,7431 |
| Este build (poda a 18.572 filas) | 0,6963 | 0,8525 | 0,5460 | 0,7298 |
| Delta | -0,0225 | -0,0140 | -0,0139 | -0,0133 |
| Variante menos agresiva (min count 2, 34.148 filas, 35,0 MB) | aproximadamente -0,003 respecto al original (solo se reporta el delta de nDCG@5) | no disponible | no disponible | no disponible |

La tasa de `<unk>` es 0 en ambos conjuntos de evaluacion y la longitud media de secuencia crece aproximadamente un 0,2%, por lo que el autor no reporta coste de truncamiento ni de latencia. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de generacion, que no aplican a un modelo de extraccion de caracteristicas.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en la practica. El peso int8 completo ocupa 29,43 MB y el encoder es de 21,88 MB, por lo que el modelo cabe holgadamente en cualquier GPU de consumo e incluso en memoria de dispositivo movil.
- GPU recomendadas: ninguna en particular; cualquier GPU consumer (familia RTX, integradas modernas) acelera la inferencia, pero el caso de uso declarado es la ejecucion en el motor de ML de Firefox, donde el modelo se ejecuta tipicamente en CPU via WebAssembly.
- Cabe en GPU de consumo: si, en todas las gamas, incluidos equipos sin GPU dedicada.
- Opciones de despliegue: transformers.js (`pipeline('feature-extraction', ...)`), ONNX Runtime. vLLM, TGI, llama.cpp y Ollama no son aplicables porque el artefacto es un ONNX de extraccion de caracteristicas y no un modelo generativo en formato GGUF.
- Latencia y throughput: no disponibles. El autor indica unicamente que la longitud media de secuencia crece un 0,2% respecto al modelo original, sin coste de truncamiento ni de latencia.

## Comparativa con modelos similares

| Modelo | Vocabulario | Tamano de descarga | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `intfloat/multilingual-e5-small` (q8 via `Xenova`) | 250.037 filas | 135,39 MB (118,31 MB ONNX + 17,08 MB tokenizer) | Multilingue (mas de en/fr) | MIT | Referencia de calidad; nDCG@5 0,7188 EN / 0,5599 FR |
| Este build (`rolf-mozilla/...-pruned-q8`) | 18.572 filas | 30,37 MB (29,43 MB ONNX + 0,94 MB tokenizer) | en, fr | MIT | 4,46x mas pequeno; -0,0225 nDCG@5 EN y -0,0139 FR |
| Variante de poda menos agresiva (mencionada en la model card) | 34.148 filas | 35,0 MB | en, fr | MIT | Poda 3,4x; coste aproximado de -0,003 nDCG@5 |

No se dispone de comparacion con modelos de embeddings alternativos (por ejemplo, otras familias E5, BGE o GTE) en la informacion proporcionada: los unicos datos de referencia son los del modelo original y las variantes de poda del propio autor.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluacion de sesgo en la informacion disponible.
- Riesgo de alucinacion: no aplica directamente, ya que el modelo no genera texto; el riesgo equivalente es la recuperacion de pasajes irrelevantes cuando la similitud coseno no refleja relevancia semantica.
- Idiomas: restringido a ingles y frances por construccion. No hay filas para CJK, cirilico, arabe, devanagari ni otras escrituras no latinas, y el tokenizador de origen carece de byte fallback, por lo que ese texto degrada a `<unk>`.
- Degradacion por resegmentacion: al conservar solo 18.572 piezas, algunas palabras poco frecuentes se segmentan de forma distinta a la del modelo original, lo que puede afectar a dominios con vocabulario especializado no representado en el corpus de seleccion.
- Perdida de precision medible: -0,0225 nDCG@5 en ingles y -0,0139 en frances respecto al q8 original sobre `memory_usage_eval`; el autor situa el suelo de esta tecnica en los 21,88 MB del encoder.
- Prefijos E5: la evaluacion publicada no uso los prefijos `query:` / `passage:` habituales de la familia E5, de modo que integrarlo en un pipeline que si los use puede alterar los resultados.
- Licencia: MIT, heredada de `intfloat/multilingual-e5-small`, sin restricciones declaradas para uso comercial.
- Estabilidad del artefacto: el autor lo describe explicitamente como artefacto temporal de evaluacion y advierte que se puede eliminar, por lo que no es una dependencia fiable para produccion.
- Repositorio con 0 descargas y 0 likes y tamano de repo reportado de 0,0 GB: conviene verificar la disponibilidad real de los ficheros antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rolf-mozilla/multilingual-e5-small-enfr-pruned-q8
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Build ONNX de origen: https://huggingface.co/Xenova/multilingual-e5-small
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a un medio de noticias local aleman (rosenheim24.de) y no guardan relacion con el artefacto, por lo que no se incluyen.

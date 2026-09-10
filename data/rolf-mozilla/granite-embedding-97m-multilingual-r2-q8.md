# rolf-mozilla/granite-embedding-97m-multilingual-r2-q8

## Resumen

`rolf-mozilla/granite-embedding-97m-multilingual-r2-q8` es un artefacto de publicación del modelo de embeddings `ibm-granite/granite-embedding-97m-multilingual-r2` de IBM, reempaquetado por Mozilla para su motor de inferencia en JavaScript (transformers.js). No se ha modificado ningún peso: el fichero `onnx/model_quint8_avx2.onnx` del repositorio original se ha copiado byte a byte y se ha renombrado a `onnx/model_quantized.onnx`, que es la ruta que transformers.js resuelve por defecto. El repositorio existe únicamente como pieza experimental dentro de la evaluación `multilingual_embeddings_eval` de Mozilla, orientada a seleccionar el modelo de embeddings que alimenta la función Smart Window de Firefox.

Se trata de un modelo de extracción de características (feature-extraction) construido sobre una arquitectura ModernBERT de 97 millones de parámetros, con pooling CLS y sin necesidad de prefijos de consulta o pasaje. Su relevancia actual es doble: por un lado es un ejemplo limpio de exportación int8 en ONNX lista para ejecutarse en el navegador o en Node.js sin GPU; por otro, sus resultados en la evaluación interna de Mozilla lo sitúan como el único modelo probado que rinde bien simultáneamente en inglés y francés, con una ventaja de +0,096 nDCG@5 en francés sobre el siguiente mejor modelo evaluado.

El precio de esa ventaja es un coste de cuantización inusualmente alto: la versión q8 pierde 0,040 nDCG@5 en inglés y 0,038 en francés respecto al fp32 original, frente a los 0,005 que pierde `multilingual-e5-small`. El autor lo señala explícitamente como un problema de receta de cuantización, no de arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder bidireccional) |
| Parametros totales | 97 millones (según denominación del modelo base; no se detalla desglose) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32k según la arquitectura; la evaluación se realizó con secuencias limitadas a 512 tokens |
| Tipos de cuantizacion | int8/uint8 ONNX (grafo `quint8_avx2`, portable; contiene fp32 como referencia en el repositorio original) |
| Idiomas soportados | en, fr (declarados en el repositorio); el modelo base se denomina multilingüe, pero no se detalla la lista completa |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`) |
| Dimension de embedding | no disponible |
| Pooling | CLS + normalización L2 |
| Prefijos de consulta/pasaje | no requiere |
| Libreria | transformers.js |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo base es un encoder ModernBERT de 97 millones de parámetros, la arquitectura de transformer bidireccional moderna de Answer.AI y LightOn, que sustituye la atención tradicional por variantes con RoPE y atención local/global alternada. La etiqueta del repositorio confirma `modernbert`. Al ser un modelo de embeddings y no generativo, no dispone de cabeza de lenguaje: la salida es un vector denso por secuencia, obtenido mediante pooling CLS seguido de normalización L2. El autor advierte que el pooling debe ser CLS y no mean: en una muestra de textos en inglés y francés, el mean pooling solo alcanza ~0,85 de similitud coseno con los embeddings fp32 de referencia, frente a ~0,97 del CLS.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste con RLHF, DPO o contrastive learning específico; esos datos corresponden a la model card del repositorio original de IBM, que no forma parte de la información proporcionada. La innovación destacable de este artefacto concreto es de empaquetado, no de modelado: renombrar el fichero ONNX cuantizado para que transformers.js lo resuelva automáticamente, lo que permite cargar el modelo con una sola llamada a `pipeline('feature-extraction', ...)` sin gestión manual de ficheros.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y recuperación (retrieval) en inglés y francés.
- Extracción de características por secuencia con pooling CLS y normalización L2, lista para similitud coseno.
- Ejecución en navegador y en Node.js mediante transformers.js sobre ONNX Runtime Web, sin backend de Python.
- Soporte de secuencias largas: la arquitectura admite hasta 32k tokens, aunque la evaluación publicada se limitó a 512.
- No requiere prefijos de instrucción, consulta ni pasaje (`query:` / `passage:`), lo que simplifica la integración.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades de agente; es exclusivamente un encoder de embeddings.
- Capacidad multilingüe limitada a los idiomas declarados (en, fr) en este repositorio.

## Casos de uso

- Búsqueda semántica en memoria de usuario dentro del navegador: es exactamente el escenario para el que se publicó, la función Smart Window de Firefox, donde el modelo indexa y recupera memorias relevantes a partir de una consulta del usuario con contexto de 512 tokens y sin salir del cliente.
- Recuperación multilingüe inglés-francés: con 0,7236 nDCG@5 en francés, es adecuado para bases documentales bilingües donde un modelo puramente anglófono degradaría la mitad del corpus.
- Deduplicación y agrupación de contenido: los embeddings CLS normalizados permiten agrupar notas, pestañas o artículos casi idénticos mediante similitud coseno, con coste de cómputo mínimo por vector.
- Clasificación de texto por similitud con prototipos: entrenar un clasificador de intenciones con pocos ejemplos etiquetados y comparar cada entrada contra los centroides de cada clase.
- Extensiones de navegador y aplicaciones web offline: el peso int8 (~0,1 GB de repositorio) y el backend WASM permiten enviar el modelo al cliente y ejecutar inferencia en CPU sin servidor.
- Filtrado semántico previo en pipelines RAG ligeros: usar este modelo como primera etapa de recuperación sobre un índice reducido antes de recurrir a un re-ranker más costoso.
- Sistemas de recomendación de contenido basados en similitud textual, por ejemplo sugerir artículos relacionados a partir del texto ya leído por el usuario.
- Evaluación comparativa de modelos de embeddings: por su licencia Apache-2.0 y su formato ONNX, sirve como referencia reproducible en estudios de coste de cuantización.

## Benchmarks y rendimiento

Resultados publicados por el autor en la evaluación `memory_usage_eval` (500 consultas, cada una con 11-21 memorias candidatas y 2-4 relevantes, media macro, pooling CLS y normalización L2). La longitud de secuencia se limitó a 512 tokens en todos los modelos.

| Modelo | Cuantizacion | Precision | EN nDCG@5 | EN MRR@10 | FR nDCG@5 | FR MRR@10 |
|---|---|---|---|---|---|---|
| granite-97m-r2 (este repositorio) | q8 | 0,7779 | 0,7779 | 0,8952 | 0,7236 | 0,8721 |
| granite-97m-r2 | fp32 | 0,8180 | 0,8180 | 0,9277 | 0,7613 | 0,8977 |
| all-MiniLM-L6-v2 | q8 | 0,8077 | 0,8077 | 0,9160 | 0,5591 | 0,7444 |
| multilingual-e5-small | q8 | 0,7188 | 0,7188 | 0,8665 | 0,5599 | 0,7431 |
| potion-multilingual-128M | full d384 | 0,6495 | 0,6495 | 0,8230 | 0,6275 | 0,8008 |

Nota: la columna «Precision» figura en la tabla original sin desglose por idioma; en la tabla superior se reproduce el valor único publicado. La columna de precisión y la de EN nDCG@5 coinciden en el valor publicado por el autor para este modelo y para el resto, tal como aparecen en la model card.

Conclusiones publicadas por el autor: la ventaja principal está en francés (+0,164 nDCG@5, +29 % relativo, sobre `multilingual-e5-small` q8; +0,096 sobre el anterior mejor modelo en francés). En inglés queda 0,030 por debajo de `all-MiniLM-L6-v2` q8. El coste de cuantización de fp32 a q8 es de -0,040 en inglés y -0,038 en francés, muy superior al de `multilingual-e5-small` (-0,005), por lo que el autor estima que una mejor receta int8 recuperaría del orden de 0,04 nDCG@5. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, MTEB) en la información disponible.

## Requisitos de hardware

- Pesos int8 en ONNX, con un repositorio completo de 0,1 GB; el fichero de modelo es de decenas de megabytes.
- VRAM necesaria para inferencia: no disponible; el caso de uso objetivo es CPU, no GPU.
- Cabe con holgura en cualquier GPU de consumo e incluso en GPU integradas; también en dispositivos móviles y en el propio navegador.
- GPU recomendadas: no aplica para el escenario de referencia; cualquier acelerador es sobredimensionado para 97 M de parámetros en int8.
- Opciones de despliegue: transformers.js con ONNX Runtime Web (escenario principal), ONNX Runtime nativo, y cualquier runtime compatible con grafos ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, todos ellos orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles. La evaluación se ejecutó en Apple Silicon sobre el grafo portable uint8, sin cifras de rendimiento publicadas.
- Consumo de memoria en ejecución: no disponible, aunque acotado por el tamaño del grafo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | FR nDCG@5 | EN nDCG@5 | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| granite-embedding-97m-multilingual-r2 (q8) | 97 M | 32k de arquitectura, 512 en evaluación | en, fr | 0,7236 | 0,7779 | Apache-2.0 | ONNX |
| granite-embedding-97m-multilingual-r2 (fp32) | 97 M | 32k de arquitectura, 512 en evaluación | en, fr | 0,7613 | 0,8180 | Apache-2.0 | safetensors / ONNX |
| all-MiniLM-L6-v2 (q8) | no disponible | no disponible | en (evaluado en en y fr) | 0,5591 | 0,8077 | no disponible | no disponible |
| multilingual-e5-small (q8) | no disponible | no disponible | multilingüe (evaluado en en y fr) | 0,5599 | 0,7188 | no disponible | no disponible |
| potion-multilingual-128M | 128 M (por denominación) | no disponible | multilingüe (evaluado en en y fr) | 0,6275 | 0,6495 | no disponible | no disponible |

Los datos de parámetros, contexto, licencia y formato de los modelos comparados no se detallan en la información proporcionada salvo cuando aparecen en el nombre del propio modelo. Las cifras de rendimiento proceden de la misma evaluación interna de Mozilla, no de benchmarks públicos, por lo que no son directamente comparables con resultados de MTEB.

## Limitaciones y advertencias

- Artefacto temporal: el autor indica explícitamente que es una pieza de evaluación experimental y que se debe esperar su eliminación. No es una dependencia estable para producción.
- Sesgos: no disponible. No se documenta ningún análisis de sesgo demográfico, cultural o lingüístico.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es la recuperación de pasajes semánticamente próximos pero irrelevantes, mitigable con umbrales de similitud y re-ranking.
- Pooling obligatorio CLS: usar mean pooling degrada la calidad hasta ~0,85 de similitud coseno con la referencia fp32, lo que puede pasar desapercibido si se cambia el modo por defecto de la librería.
- Coste de cuantización elevado: la pérdida de 0,040 EN / 0,038 FR nDCG@5 respecto a fp32 es entre siete y ocho veces mayor que la de `multilingual-e5-small`; si la precisión es crítica, conviene usar el fp32 del repositorio original.
- Cobertura de idiomas limitada: el repositorio declara en y fr, pese a la denominación «multilingual» del modelo base. No hay datos de rendimiento en otros idiomas.
- Contexto efectivo en la evaluación: 512 tokens, aunque la arquitectura admita 32k. El comportamiento más allá de 512 tokens no está medido en la documentación publicada.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero los pesos son de IBM y el empaquetado de Mozilla; conviene conservar la atribución correspondiente.
- Adopción nula en el momento de la ficha: cero descargas y cero «likes», con lo que no existe validación por parte de terceros.
- Evaluación restringida a un único conjunto de datos (`memory_usage_eval`) sobre recuperación de memorias de usuario; extrapolar esos números a otros dominios no está justificado por los datos publicados.
- Los resultados de la búsqueda web proporcionada no contienen información relacionada con este modelo; no aportan datos adicionales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rolf-mozilla/granite-embedding-97m-multilingual-r2-q8
- Modelo base en HuggingFace: https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.

# litert-community/Nemotron-3-Embed-1B

## Resumen

Nemotron-3-Embed-1B es un modelo de embeddings de texto multilingue desarrollado originalmente por NVIDIA y convertido al formato LiteRT (.tflite) por la comunidad litert-community para inferencia en dispositivo (on-device). Su funcion principal es generar representaciones vectoriales densas de 2048 dimensiones, normalizadas en L2, orientadas a tareas de recuperacion de informacion (retrieval) y generacion aumentada por recuperacion (RAG). El modelo base es nvidia/Nemotron-3-Embed-1B-BF16, evaluado por NVIDIA en 34 idiomas.

La version LiteRT prioriza el despliegue en entornos con recursos limitados: telefonos, navegadores y dispositivos edge con CPU exclusivamente, sin necesidad de GPU ni conexion de red. Para ello se ofrecen tres artefactos (dos en int8 dynamic-range y uno en fp16) con firmas estaticas de 64, 128, 256 y 512 tokens, con pooling y normalizacion integrados en el grafo, de modo que una llamada de entrada produce directamente un embedding final.

Su relevancia actual radica en que permite ejecutar un modelo de embeddings de 1000 millones de parametros completamente offline en hardware movil, con embeddings verificados bit a bit respecto a escritorio en un iPhone 17 Pro. La contrapartida es una restriccion critica: el modelo es de estilo E5 y exige prefijos obligatorios (`query: ` y `passage: `) para no degradar la calidad de forma severa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo de embeddings de frase); pesos convertidos a LiteRT |
| Parametros totales | 1000 millones (1B, segun el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32768 tokens en el modelo original; grafos on-device estaticos limitados a 64, 128, 256 y 512 tokens |
| Tipos de cuantizacion | int8 dynamic-range (wi8fc) y fp16 (pesos fp16, computo float) |
| Idiomas soportados | multilingue; evaluado por NVIDIA en 34 idiomas (lista concreta no disponible) |
| Licencia | openmdw-1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | .tflite (LiteRT) y .litertlm (bundles LiteRT-LM); modelo base en BF16 |
| Dimension del embedding | 2048, normalizado en L2; truncamiento tipo Matryoshka a 1024 o 512 dimensiones documentado por NVIDIA (no verificado en esta conversion) |
| Firmas disponibles | `embed_64`, `embed_128`, `embed_256`, `embed_512` (fichero completo); `embed_128`, `embed_512` (fichero para telefonos) |
| Entrada | `input_ids` int32 [1, S] y `attention_mask` int32 [1, S]; batch 1, padding a la derecha |
| Salida | `output_0` float32 [1, 2048], mean-pooling sobre posiciones validas y normalizacion L2 dentro del grafo |
| Token de padding | 11 |
| Tamano de los artefactos | 1155 MB (int8, 128/512), 1167 MB (int8, 64/128/256/512), 2286 MB (fp16); bundles .litertlm de 1166 MB y 2020 MB |
| RAM pico al cargar | 1.9 GiB (int8 128/512), 3.6 GiB (int8 completo); fp16 no disponible |
| Libreria | litert (ai-edge-litert); LiteRT-LM >= 0.17.0 para bundles |
| Tamano del repositorio | 11.0 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer encoder de 1000 millones de parametros disenado para producir embeddings de frase, con una cabeza de pooling y normalizacion L2. La conversion a LiteRT genera grafos estaticos de forma fija (batch 1, longitudes 64/128/256/512) en los que el mean-pooling sobre posiciones validas y la normalizacion L2 estan embebidos en el propio grafo. Esto implica que el consumidor no necesita implementar pooling ni normalizacion en el host: una unica llamada devuelve el vector final. El padding queda completamente enmascarado dentro del grafo, de modo que los token ids de la region de padding no pueden influir en la salida y el resultado es independiente de la firma utilizada: el mismo texto procesado por `embed_64`, `embed_128`, `embed_256` o `embed_512` devuelve vectores identicos bit a bit.

Los detalles de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas) no estan disponibles en la informacion proporcionada. La model card si documenta que se trata de un modelo de estilo E5, entrenado exclusivamente con prefijos: `query: ` para consultas y `passage: ` para documentos, y que en tareas simetricas (similitud semantica, clustering, deduplicacion) debe usarse `query: ` en ambos lados. Los tres artefactos publicados (int8 128/512, int8 completo y fp16) devuelven embeddings identicos bit a bit, y los dos ficheros int8 estan verificados como bit-exactos contra escritorio en un iPhone 17 Pro.

## Capacidades

- Generacion de embeddings de texto densos de 2048 dimensiones, normalizados en L2, listos para similitud por producto escalar.
- Recuperacion de informacion (retrieval) y RAG: indexacion de documentos y busqueda semantica de consultas.
- Similitud semantica simetrica, clustering y deduplicacion (usando `query: ` en ambos lados).
- Capacidades multilingues: evaluado por NVIDIA en 34 idiomas, incluyendo recuperacion cross-lingual.
- Inferencia completamente offline en CPU, sin GPU ni conexion de red.
- Ejecucion en dispositivo (telefonos, edge) con artefactos int8 de 1155 MB y 1.9 GiB de RAM pico.
- Truncamiento tipo Matryoshka documentado por el autor original: recortar a las primeras 1024 o 512 dimensiones y renormalizar (no verificado en esta conversion).
- Integracion con LiteRT-LM EmbeddingEngine (Python, C, Kotlin) desde la version 0.17.0, sin tokenizacion ni pooling en el host.
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio: es exclusivamente un modelo de extraccion de caracteristicas.

## Casos de uso

- RAG en aplicaciones moviles offline: indexar una base documental local y recuperar pasajes relevantes sin conexion, usando el artefacto int8 de 128/512 tokens con 1.9 GiB de RAM pico en telefonos.
- Busqueda semantica en navegador o escritorio: desplegar el fichero int8 con las cuatro firmas (3.6 GiB de RAM pico) para cubrir consultas y documentos de hasta 512 tokens con un unico artefacto.
- Deduplicacion y clustering de documentos: aplicar `query: ` en ambos lados para calcular similitud simetrica; util en pipelines de limpieza de corpus o agrupacion de tickets de soporte.
- Recuperacion cross-lingual: una consulta en castellano puede recuperar pasajes en ingles o arabe; en STS17 el modelo alcanza 0.803 en es-en y 0.724 en en-ar con prefijos, frente a 0.064 y -0.029 sin ellos.
- Clasificacion y enrutamiento por similitud: comparar el embedding de un texto entrante contra embeddings de referencia de cada categoria y asignar la clase mas proxima, con coste de inferencia en CPU.
- Sistemas de recomendacion basados en contenido: representar items y preferencias del usuario como vectores de 2048 dimensiones y ordenar por producto escalar.
- Filtrado previo en pipelines de moderacion o busqueda empresarial: descartar candidatos por similitud antes de invocar un modelo generativo de mayor coste.
- Procesamiento por lotes en servidores sin GPU: al ser int8 y CPU-only, permite escalar horizontalmente en instancias baratas, aunque el throughput concreto no esta disponible.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados en la informacion disponible corresponden a la evaluacion del impacto de los prefijos sobre STS17 (100 pares, artefacto int8):

| Tarea | Sin prefijo | Con `query: ` en ambos lados |
|---|---|---|
| en-en | 0.636 | 0.865 |
| es-en (cross-lingual) | 0.064 | 0.803 |
| en-ar (cross-lingual) | -0.029 | 0.724 |

No se han publicado resultados de benchmarks adicionales (MMLU, MTEB, etc.) en la informacion disponible. Tampoco se dispone de datos de latencia o throughput.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU.
- RAM pico al cargar: 1.9 GiB con el artefacto int8 de 128/512 tokens (recomendado para telefonos); 3.6 GiB con el artefacto int8 de cuatro firmas (escritorio o apps con margen de memoria); el fp16 no tiene cifra publicada.
- Almacenamiento: 1155 MB (int8 128/512), 1167 MB (int8 completo), 2286 MB (fp16), 1166 MB (.litertlm int8), 2020 MB (.litertlm fp16).
- GPU: no requerida ni utilizada; no se documentan requisitos de GPU dedicada (A100, H100, RTX 4090).
- Cabe en telefonos de gama alta: verificado en un iPhone 17 Pro con los dos ficheros int8, con embeddings bit-exactos respecto a escritorio.
- Despliegue: ai-edge-litert (Interpreter y signature runners) en Python; LiteRT-LM EmbeddingEngine (Python, C, Kotlin) desde la version 0.17.0 con bundles .litertlm. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.
- Hilos: el ejemplo oficial usa `num_threads=8`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension del embedding | Licencia | Formato on-device |
|---|---|---|---|---|---|
| Nemotron-3-Embed-1B (LiteRT) | 1B | 512 tokens por grafo (32768 en el original) | 2048 | openmdw-1.1 | .tflite, .litertlm |
| nvidia/Nemotron-3-Embed-1B-BF16 | 1B | 32768 | 2048 | no disponible en la informacion proporcionada | BF16 (no on-device) |
| Otros modelos de embeddings de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos alternativos comparables (por ejemplo, de la familia E5, BGE o GTE) en los datos proporcionados, por lo que la comparativa cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- El prefijo es obligatorio, incluso en tareas simetricas. Sin `query: ` o `passage: `, el modelo queda fuera de distribucion y la calidad cae de forma severa: en STS17 es-en baja de 0.803 a 0.064 y en-ar de 0.724 a -0.029.
- El `config_sentence_transformers.json` del modelo original define `default_prompt_name: null`, por lo que una llamada estandar a `SentenceTransformer.encode()` envia texto sin prefijo y cae en el peor caso. Debe usarse `encode_query`/`encode_document` o anadir el prefijo manualmente.
- Limite de 512 tokens por grafo: los textos mas largos deben trocearse (chunk-and-average o chunk-and-max). El modelo original acepta 32768 tokens, pero un grafo estatico on-device a esa longitud no es practico.
- El batch es fijo a 1: no hay procesamiento por lotes en una sola llamada.
- Licencia openmdw-1.1 (etiquetada como `other`): deben revisarse las condiciones del fichero LICENSE antes de un uso comercial. La informacion proporcionada no detalla restricciones concretas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de recuperaciones irrelevantes si se omiten los prefijos o se supera el limite de tokens sin trocear.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Idiomas: aunque se evalua en 34 idiomas, la lista concreta y el rendimiento por idioma no estan disponibles; el castellano no aparece en las metricas publicadas.
- El truncamiento Matryoshka a 1024/512 dimensiones esta documentado por NVIDIA pero no ha sido verificado en esta conversion.
- Modelo con pocas descargas (89) y un solo like en el momento de la consulta: ecosistema de validacion limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Nemotron-3-Embed-1B
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Fichero de licencia: LICENSE (en el repositorio de Hugging Face)
- LiteRT (ai-edge-litert): no disponible en la informacion proporcionada
- LiteRT-LM (litert-lm >= 0.17.0): no disponible en la informacion proporcionada
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada

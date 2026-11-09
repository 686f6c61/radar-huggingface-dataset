# litert-community/granite-embedding-311m-multilingual-r2

## Resumen

`litert-community/granite-embedding-311m-multilingual-r2` es la conversion a LiteRT (`.tflite`) del modelo de embeddings `ibm-granite/granite-embedding-311m-multilingual-r2` de IBM, publicada por la comunidad LiteRT. Se trata de un bi-encoder basado en ModernBERT, con 311 millones de parametros, que produce vectores de 768 dimensiones normalizados en L2 y esta disenado para recuperacion de informacion, busqueda semantica y RAG. Su particularidad es que funciona integramente en dispositivo (CPU, sin red) y el pooling CLS y la normalizacion L2 estan incluidos dentro del grafo, de modo que una llamada devuelve directamente el embedding final.

La relevancia de esta version radica en que traslada un modelo multilingue de recuperacion a escenarios de edge computing: moviles, portatiles y dispositivos sin acelerador dedicado. El artefacto int8 ocupa 336 MB y permite inferencia offline con un pico de memoria de 518 MiB, mientras que la variante fp16 ocupa 629 MB y esta pensada para escritorio o para aceleradores NPU concretos. Ademas, desde litert-lm 0.17.0 se publican bundles `.litertlm` que el runtime carga sin necesidad de tokenizacion ni pooling en el host.

La ficha describe la version LiteRT; los datos de entrenamiento, composicion del corpus y proceso de alineacion corresponden al modelo base de IBM, que no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder ModernBERT (base: ibm-granite/granite-embedding-311m-multilingual-r2) |
| Parametros totales | 311 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens en los grafos LiteRT publicados (firmas de 64, 128, 256 y 512); el modelo base admite 32768 |
| Tipos de cuantizacion | int8 dynamic-range (lineales y tabla de embeddings) y fp16 (pesos fp16, computo float) |
| Idiomas soportados | multilingue (el modelo base declara soporte multilingue; lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.tflite` (LiteRT) y bundles `.litertlm` (LiteRT-LM) |
| Dimension del embedding | 768, normalizado en L2 (coseno = producto escalar) |
| Pooling | CLS, incluido en el grafo |
| Firmas de entrada | `input_ids` int32 `[1, S]`, `attention_mask` int32 `[1, S]`, con S en {64, 128, 256, 512} |
| Salida | `output_0` float32 `[1, 768]` |
| Tamano de artefactos | 336 MB (int8 `.tflite`), 629 MB (fp16 `.tflite`), 332 MB (int8 `.litertlm`), 436 MB (fp16 `.litertlm`) |
| Prefijos de prompt | ninguno (prompts `query`/`document` vacios en `config_sentence_transformers.json`) |

## Arquitectura y entrenamiento

El modelo subyacente es un bi-encoder ModernBERT de 311 millones de parametros que genera representaciones densas de frases y parrafos. La conversion a LiteRT mantiene la arquitectura del encoder y anade al grafo dos operaciones: la seleccion del token CLS como representacion de la secuencia y la normalizacion L2 del vector resultante. Las formas son estaticas y de batch 1, con relleno a la derecha, y el resultado es independiente de la firma utilizada: el mismo texto procesado por `embed_64`, `embed_128`, `embed_256` o `embed_512` devuelve vectores identicos bit a bit, y los identificadores de token en la zona de relleno no influyen en la salida.

La cuantizacion int8 aplica rango dinamico tanto a las capas lineales como a la tabla de embeddings, mientras que la variante fp16 conserva pesos en media precision con computo en coma flotante. En el modelo base, IBM documenta truncamiento Matryoshka (los primeros 256 dimensiones pueden recortarse y renormalizarse), aunque la comunidad LiteRT no lo ha verificado de forma independiente. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del corpus ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de embeddings de texto para recuperacion densa, busqueda semantica y RAG.
- Representaciones multilingues, incluyendo coincidencia cruzada entre idiomas (el ejemplo de la model card empareja una consulta en ingles con un pasaje en japones).
- Similitud semantica mediante producto escalar, al estar los vectores normalizados en L2.
- Deduplicacion, clustering y puntuacion de similitud en cargas simetricas.
- Inferencia totalmente offline en CPU, sin dependencia de red ni de servicios externos.
- Ejecucion en dispositivo movil y escritorio mediante LiteRT, con soporte de aceleracion por NPU Hexagon en Qualcomm Snapdragon tras compilacion ahead-of-time.
- Carga directa mediante `EmbeddingEngine` de litert-lm (Python, C y Kotlin) sin tokenizacion ni pooling en el host.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un extractor de caracteristicas.

## Casos de uso

- RAG en dispositivo: indexar documentos locales en un movil o portatil y recuperar fragmentos relevantes sin enviar contenido a la nube, usando el artefacto int8 de 336 MB con un pico de 518 MiB.
- Busqueda semantica multilingue: consultas en un idioma contra un corpus en otro, aprovechando la coincidencia cruzada demostrada en la model card.
- Deduplicacion de contenido: comparar articulos, tickets o registros mediante producto escalar de embeddings normalizados, con la ventaja de que un prefijo constante puede mejorar la similitud simetrica (STS17 en-ingles de 0,783 a 0,826 con prefijo `query: `).
- Clasificacion y enrutado de texto: usar los vectores como caracteristicas de entrada para clasificadores ligeros de intencion o tema en asistentes locales.
- Filtrado previo en pipelines de recuperacion: generar embeddings de baja latencia en el cliente y delegar solo los candidatos seleccionados a un reordenador mayor en servidor.
- Asistentes de privacidad estricta: busqueda sobre notas, correo o historial medico sin salida de datos del dispositivo, con licencia Apache 2.0 que permite integracion comercial.
- Extraccion de caracteristicas en aplicaciones Android mediante el bundle `.litertlm` y `EmbeddingEngine`, manteniendo `insert_special_tokens` en su valor por defecto (`True`) para que el token `<bos>` ocupe la posicion CLS.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, MTEB, etc.) para esta conversion. Los unicos datos numericos disponibles son mediciones internas de la comunidad:

| Metrica | Valor |
|---|---|
| Similitud coseno frente a escritorio (iPhone 17 Pro, cinco scripts, dos longitudes de firma) | 1,000000 (diferencia maxima 0,0) |
| STS17 en-ingles, texto plano | 0,783 |
| STS17 en-ingles, prefijo `query: ` no oficial en ambos lados | 0,826 |
| nDCG@10 en recuperacion, texto plano | 0,836 |
| nDCG@10 en recuperacion, con prefijo | 0,832 |
| Recall@5 en recuperacion, texto plano | 0,900 |
| Recall@5 en recuperacion, con prefijo | 0,860 |
| Latencia fp16 en NPU Hexagon (Galaxy S26, compilacion ahead-of-time) | 49,37 ms |
| Pico de memoria int8 (cuatro firmas, XNNPACK) | 518 MiB |
| Pico de memoria fp16 (cuatro firmas, XNNPACK) | 3700 MiB |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 518 MiB de pico para el artefacto int8 con las cuatro firmas cargadas; 3700 MiB para fp16 bajo XNNPACK, que expande los pesos a fp32 al empaquetar cada subgrafo.
- GPU recomendadas: no se requieren; el modelo esta disenado para CPU. En escritorio puede ejecutarse con `ai_edge_litert.interpreter.Interpreter` y `num_threads` configurable (8 hilos en el ejemplo).
- Compatibilidad con GPU de consumo: cabe en cualquier equipo con al menos 1 GB de RAM libre usando int8; no necesita GPU dedicada. En moviles, el int8 funciona en CPU/XNNPACK sin entitlement especial de memoria.
- Aceleradores: en Qualcomm Snapdragon (Galaxy S26) el archivo int8 no compila en ninguno de los dos aceleradores y es el fp16 el que se ejecuta en la NPU Hexagon tras compilacion ahead-of-time (49,37 ms).
- Opciones de despliegue: LiteRT (`ai_edge_litert`), LiteRT-LM `EmbeddingEngine` (Python, C, Kotlin) con bundles `.litertlm` desde litert-lm 0.17.0, y tokenizador de Hugging Face en el host cuando se usa la ruta `.tflite`.
- Latencia y throughput: unica cifra publicada, 49,37 ms por embedding en NPU Hexagon con fp16. Para CPU no se proporcionan cifras de latencia; la model card solo senala que fp16 puede ser hasta 6 veces mas lento que int8 bajo XNNPACK.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/granite-embedding-311m-multilingual-r2 | 311 M | 512 en grafos LiteRT (32768 en el base) | `.tflite`, `.litertlm`; edge CPU/NPU | Apache 2.0 | Pooling y normalizacion en el grafo; sin prefijos |
| ibm-granite/granite-embedding-311m-multilingual-r2 | 311 M | 32768 | safetensors; sentence-transformers | Apache 2.0 | Modelo base, pensado para servidor; mismo contrato sin prefijos |
| nvidia/Nemotron-3-Embed | no disponible | no disponible | no disponible | no disponible | Requiere prefijos `query: ` y `passage: `, a diferencia de este modelo |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Ventana efectiva de 512 tokens en los grafos LiteRT: los textos mas largos deben trocearse, aunque el modelo base acepte 32768.
- El prefijo `query: ` mejora la similitud simetrica pero degrada la recuperacion (nDCG@10 de 0,836 a 0,832 y recall@5 de 0,900 a 0,860); para RAG debe usarse texto plano.
- Si se usa el bundle `.litertlm`, desactivar `insert_special_tokens` devuelve vectores incorrectos de forma silenciosa, porque el tokenizador del runtime no ejecuta el post-procesador del tokenizador original.
- El truncamiento Matryoshka a 256 dimensiones esta documentado por IBM en el modelo base pero no verificado por la comunidad LiteRT.
- En Snapdragon, el artefacto int8 falla al compilar en ambos aceleradores (`LiteRtException: Failed to compile model`); es necesario usar fp16 para NPU.
- En XNNPACK, fp16 consume 3700 MiB y puede ser hasta 6 veces mas lento que int8, lo que lo hace poco adecuado para moviles de gama media.
- Riesgo de alusionacion y sesgos: no se documentan en la informacion disponible; al ser un modelo de recuperacion, los sesgos del corpus de entrenamiento pueden reflejarse en la similitud entre textos.
- Cobertura idiomatica concreta no disponible: el modelo se declara multilingue, pero no se enumeran los idiomas soportados ni su calidad relativa.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; no se indican restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/granite-embedding-311m-multilingual-r2
- README del repositorio: https://huggingface.co/litert-community/granite-embedding-311m-multilingual-r2/blob/main/README.md
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-embedding-311m-multilingual-r2

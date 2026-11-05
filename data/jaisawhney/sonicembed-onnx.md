# jaisawhney/SonicEmbed-ONNX

## Resumen
SonicEmbed-ONNX es la distribucion en formato ONNX del modelo SonicEmbed, un modelo de embeddings multimodales texto-audio orientado a recuperacion de informacion musical (music information retrieval) y busqueda texto-a-musica. Lo desarrolla el autor independiente jaisawhney y se publica bajo licencia Apache-2.0. La relevancia de esta variante concreta reside en que permite ejecutar el modelo tanto en ONNX Runtime como en Transformers.js, es decir, en navegador o en Node.js, sin necesidad de un entorno PyTorch.

Arquitectonicamente deriva de EmbeddingGemma 2: los grafos ONNX se generan a partir de onnx-community/embeddinggemma-2-ONNX y el modelo incorpora un codificador de audio especifico que proyecta clips de 16 kHz mono en el mismo espacio de embeddings que el texto. El resultado es un unico espacio vectorial compartido entre consultas textuales y pistas musicales, lo que habilita busqueda semantica texto-a-musica y recuperacion cruzada.

El modelo base SonicEmbed ocupa 2.307 MB en PyTorch; esta version ofrece cinco builds ONNX desde 2.257 MB (fp32) hasta 363 MB (q4), con una perdida de calidad medible y acotada. Solo admite ingles y procesa como maximo los primeros 30 segundos de audio por clip.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de EmbeddingGemma 2, con codificador de audio y proyector al espacio de embeddings de texto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio truncado a 30 s por clip) |
| Tipos de cuantizacion | fp32, fp16, q8 (int8), q8 audio + q4 text, q4 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos separados: `onnx/audio_encoder*.onnx` y `onnx/model*.onnx`), con tokenizer y feature extractor en JSON |

## Arquitectura y entrenamiento
El modelo es un transformer multimodal que combina un tower de texto (heredado de EmbeddingGemma 2) con un codificador de audio que produce features alineadas con el espacio de embeddings textual. La inferencia se articula en dos grafos ONNX independientes: un `audio_encoder` que transforma la onda de audio (16 kHz mono) en features acusticas, y un `model` que recibe `input_ids`, `attention_mask` y las features multimodales (`image_features`, `video_features`, `audio_features`) y devuelve un `sentence_embedding`. La insercion del audio en la secuencia textual se realiza mediante tokens especiales `<|audio>`, `<|audio|>` y `<audio|>`.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no se documentan en la informacion disponible; la model card remite a la ficha del modelo base SonicEmbed para resultados completos y entrenamiento. La innovacion practica de esta variante es la exportacion a ONNX con cuantizacion selectiva (q8 para audio, q4 para texto) que permite reducir el tamano a 514 MB manteniendo R@10 de 40,4 en tres clips, frente a 40,7 del fp32.

## Capacidades
- Generacion de embeddings multimodales en un espacio compartido texto-audio.
- Recuperacion texto-a-musica (text-to-audio retrieval) y busqueda semantica sobre catalogos musicales.
- Extraccion de features para tareas de music information retrieval.
- Procesamiento de audio a 16 kHz mono, con truncado a los primeros 30 segundos por clip.
- Soporte de prompts con prefijos especificos: `task: search result | query:` para consultas y `title: none | text:` para documentos.
- Ejecucion en navegador y Node.js mediante Transformers.js, y en Python mediante ONNX Runtime.
- Capacidades multilingues limitadas al ingles.
- No se documenta soporte de tool calling, agentes, vision ni audio generativo.

## Casos de uso
- Busqueda semantica en bibliotecas musicales: indexar pistas como embeddings de audio y permitir consultas en lenguaje natural ("calm piano", "upbeat electronic"), usando la similitud coseno entre el embedding de la consulta y el de cada pista.
- Recomendacion musical basada en contenido: calcular embeddings de las pistas de un catalogo y agrupar o recomendar por cercania vectorial, sin depender de metadatos colaborativos.
- Etiquetado automatico y organizacion de archivos: generar embeddings de fragmentos de 30 s y asignar clusters tematicos o de genero para ordenar colecciones grandes.
- Prototipos en navegador: desplegar busqueda texto-a-musica en una web usando Transformers.js con el build fp16 (1.128 MB) o q8 (654 MB), sin backend Python.
- Investigacion en music information retrieval: usar el modelo como extractor de features para experimentos de recuperacion, comparando builds cuantizados frente a fp32 con el script de evaluacion incluido en `scripts/`.
- Sistemas de descubrimiento en apps de streaming: indexar clips representativos de cada track (promediando embeddings de varios clips para cubrir la duracion completa) y servir busquedas por similitud.
- Filtrado y moderacion de contenido sonoro: comparar embeddings de audio entrante contra embeddings de referencia para detectar similitudes o duplicados.

## Benchmarks y rendimiento
Resultados de busqueda texto-a-musica en el dataset Song Describer, segun la model card:

| Build | Ficheros | Tamano | R@10, tres clips | R@10, un clip | R@1, tres clips | Rango mediano, tres clips |
|---|---|---|---|---|---|---|
| fp32 | sin sufijo | 2.257 MB | 40,7 | 36,7 | 9,4 | 16,5 |
| fp16 | `_fp16` | 1.128 MB | 40,7 | 36,8 | 9,5 | 16,5 |
| q8 | `_quantized` | 654 MB | 40,6 | 36,6 | 9,6 | 16 |
| q8 audio + q4 text | `_quantized`, `_q4` | 514 MB | 40,4 | 35,9 | 9,3 | 17 |
| q4 | `_q4` | 363 MB | 37,8 | 34,5 | 7,8 | 19 |
| PyTorch (SonicEmbed) | — | 2.307 MB | 40,4 | 36,7 | 9,5 | 16 |

El autor advierte que diferencias de unas decimas son ruido y no diferencias reales frente a PyTorch. No se midieron la calidad de texto general (MTEB) ni los backends de GPU en estos builds.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; por tamano de fichero, el build fp32 (2.257 MB) requiere en torno a 2,5-3 GB de memoria, el fp16 (1.128 MB) alrededor de 1,5 GB y el q8 (654 MB) por debajo de 1 GB en CPU.
- GPU recomendadas: no especificadas; el autor indica que los backends de GPU no fueron medidos en estos builds.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM para fp16/q8; el build q4 (363 MB) es viable incluso en entornos muy limitados.
- Opciones de despliegue: ONNX Runtime (Python), Transformers.js (navegador y Node.js). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de embeddings y no generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SonicEmbed-ONNX | no disponible | audio truncado a 30 s | texto + audio | Apache-2.0 | HuggingFace (ONNX) |
| SonicEmbed (PyTorch) | no disponible | audio truncado a 30 s | texto + audio | Apache-2.0 | HuggingFace (PyTorch) |
| EmbeddingGemma 2 | no disponible | no disponible | texto | no disponible | HuggingFace (ONNX en onnx-community) |
| Otros modelos de retrieval texto-audio | no disponible | no disponible | texto + audio | no disponible | no disponible |

## Limitaciones y advertencias
- Solo soporta ingles; las consultas en otros idiomas degradaran la recuperacion.
- El audio debe estar previamente remuestreado a 16 kHz mono; no se realiza resampling interno.
- Solo se utilizan los primeros 30 segundos de cada clip; para cubrir una pista completa hay que promediar embeddings de varios clips.
- Los prefijos de prompt son obligatorios: `task: search result | query:` para consultas y `title: none | text:` para documentos. Omitirlos afecta a la calidad.
- El build q4 pierde calidad de forma apreciable (R@10 de 37,8 frente a 40,7 en fp32); no se recomienda para produccion con requisitos de precision.
- No se ha evaluado la calidad de texto general (MTEB) ni el rendimiento en GPU de estos builds.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; al ser un modelo de embeddings, el riesgo se manifiesta como recuperaciones irrelevantes mas que como texto inventado.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base SonicEmbed y de EmbeddingGemma 2 del que derivan los grafos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario muy limitados.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/jaisawhney/SonicEmbed-ONNX
- Modelo base SonicEmbed: https://huggingface.co/jaisawhney/SonicEmbed
- Grafos ONNX de origen (EmbeddingGemma 2): https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- ONNX Runtime: https://onnxruntime.ai/

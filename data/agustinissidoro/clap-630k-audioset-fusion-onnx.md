# agustinissidoro/clap-630k-audioset-fusion-onnx

## Resumen

`clap-630k-audioset-fusion-onnx` es una conversión no oficial a ONNX del checkpoint `630k-audioset-fusion-best.pt` del modelo LAION CLAP, publicado por el usuario agustinissidoro. CLAP (Contrastive Language-Audio Pretraining) es un modelo contrastivo audio-texto desarrollado por LAION que proyecta audio y texto a un espacio latente compartido de 512 dimensiones, permitiendo búsquedas cruzadas entre sonido y lenguaje natural. Este repositorio no entrena nada nuevo: reexporta los pesos originales a formato ONNX (opset 17, float32) sin modificar los pesos.

La relevancia de esta conversión es muy concreta: el checkpoint `630k-audioset-fusion` es exactamente el que emplea la API de Freesound para su espacio de similitud `laion_clap`. Eso significa que los embeddings generados por este modelo pueden enviarse directamente a Freesound (`similar_to=[...]&similarity_space=laion_clap`) para buscar sonidos por texto o por audio de referencia. El port oficial de transformers (`laion/clap-htsat-fused`) usa otros pesos y no es compatible con los vectores de Freesound, lo que hace útil esta conversión específica.

El modelo es de tipo feature-extraction: no genera texto ni responde a prompts, sino que produce embeddings de audio y de texto normalizables a longitud unitaria. Está pensado para pipelines de recuperación, clasificación zero-shot y sistemas de similitud acústica, no para generación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual (audio HTSAT + texto RoBERTa) con proyección contrastiva a espacio compartido; exportado como dos grafos ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 10 s máximo por clip; texto limitado por el tokenizador RoBERTa (no se especifica longitud máxima) |
| Tipos de cuantizacion | no disponible (exportación en float32; el repo no publica variantes cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | cc0-1.0 |
| Formato de pesos | ONNX (opset 17, float32); tokenizer.json de RoBERTa |
| Dimension de embedding | 512 (audio y texto) |
| Entrada de audio | `input_features`: float32 `(batch, 1, 1001, 64)` |
| Entrada de texto | `input_ids`, `attention_mask`: int64 `(batch, tokens)` |
| Preprocesado mel | 48 kHz, n_fft 1024, hop 480, 64 bandas HTK mel (sin norm), 50 Hz–14 kHz, potencia en dB, mel_scale "htk" |
| Tamano del repo | 0,6 GB |
| Modelo base | lukewys/laion_clap |

## Arquitectura y entrenamiento

El modelo original LAION CLAP combina un codificador de audio HTSAT (Hierarchical Token-Semantic Audio Transformer) con un codificador de texto basado en RoBERTa, entrenados de forma contrastiva para alinear pares audio-texto en un espacio común de 512 dimensiones. El checkpoint `630k-audioset-fusion` corresponde a la variante "fusion", que introduce fusión de características y aumentación keyword-to-caption, descrita en el paper de ICASSP 2023 de Wu, Chen, Zhang, Hui, Berg-Kirkpatrick y Dubnov.

Esta conversión concreta no aporta entrenamiento nuevo: los pesos se cargan en la clase `ClapModel` de transformers (la misma arquitectura que `laion/clap-htsat-fused`) y se exportan por separado las mitades de audio y texto a ONNX. El grafo de audio recibe un único canal log-mel de una ventana de como máximo 10 s y lo replica en los cuatro canales del modelo fusionado con `is_longer` en falso, replicando el comportamiento del extractor de características para clips de 10 s o menos. El espectrograma mel se calcula fuera del grafo, con truncación "fusion". La conversión se validó comparando embeddings ONNX y PyTorch con coseno ≥ 0,9999 para tono, ruido y palabras, y frente a los vectores almacenados por Freesound con coseno de 0,90 a 0,999 usando los previews en mp3.

## Capacidades

- Extracción de embeddings de audio de 512 dimensiones a partir de ventanas de hasta 10 s.
- Extracción de embeddings de texto de 512 dimensiones en el mismo espacio latente.
- Búsqueda audio-a-texto y texto-a-audio por similitud coseno (recuperación cross-modal).
- Búsqueda audio-a-audio comparando embeddings acústicos.
- Clasificación zero-shot de sonidos mediante prompts textuales.
- Compatibilidad directa con la API de Freesound en el espacio de similitud `laion_clap`.
- Procesamiento por lotes (dimensión `batch` en ambos grafos).
- No soporta tool calling, agentes, generación de texto, razonamiento multi-paso, visión ni audio en streaming.

## Casos de uso

- Búsqueda de efectos de sonido en Freesound: se calcula el embedding de una descripción textual o de un clip y se envía a la API con `similarity_space=laion_clap` para recuperar sonidos similares. Es el caso de uso para el que existe esta conversión.
- Organización de librerías de samples: indexar miles de clips de 10 s (o ventanas promediadas de clips más largos) y agrupar por similitud para etiquetado automático y deduplicación.
- Clasificación zero-shot de eventos sonoros: comparar el embedding de un clip contra embeddings de etiquetas textuales ("dog barking", "rain", "engine") sin entrenar un clasificador específico.
- Detección de similitud y plagio musical o de samples: comparar vectores L2-normalizados para identificar clips reutilizados en un catálogo.
- Filtrado de datasets de audio: descartar o etiquetar clips por proximidad a descripciones objetivo antes de entrenar otros modelos.
- Sistemas de recomendación de audio: construir un índice vectorial (FAISS, Qdrant, pgvector) sobre embeddings de 512 dimensiones y servir recomendaciones por vecino más cercano.
- Preprocesado en pipelines de ML: usar los embeddings como características de entrada para modelos posteriores de clasificación, clustering o regresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta validaciones de equivalencia de la conversión: coseno ≥ 0,9999 entre embeddings ONNX y PyTorch para tono, ruido y palabras, y coseno de 0,90 a 0,999 frente a los vectores de Freesound calculados sobre previews en mp3.

## Requisitos de hardware

- El repositorio pesa 0,6 GB, por lo que la inferencia en float32 cabe holgadamente en GPUs de consumo.
- VRAM estimada: por debajo de 4 GB en float32 para lotes moderados; no se publican cifras oficiales.
- Cabe en cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) e incluso puede ejecutarse en CPU con ONNX Runtime para volúmenes bajos.
- Despliegue mediante ONNX Runtime (CPU o CUDA), sin necesidad de PyTorch en producción.
- El cálculo del espectrograma mel debe hacerse fuera del grafo (por ejemplo con torchaudio o librosa) respetando los parámetros de `preprocessor_config.json`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Embedding | Contexto audio | Licencia | Compatibilidad Freesound |
|---|---|---|---|---|---|
| agustinissidoro/clap-630k-audioset-fusion-onnx | ONNX (CLAP fusion) | 512 | 10 s por ventana | CC0 1.0 | Sí (espacio `laion_clap`) |
| lukewys/laion_clap (original) | PyTorch (CLAP) | 512 | 10 s por ventana | CC0 1.0 | Sí, mismos pesos |
| laion/clap-htsat-fused | PyTorch (port transformers) | 512 | 10 s por ventana | no disponible | No (pesos distintos) |
| Otros modelos audio-texto (p. ej. variantes de CLAP o embeddings acústicos) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Conversión no oficial: no está hecha ni respaldada por LAION; los créditos del modelo corresponden a sus autores originales.
- Solo inglés: los prompts textuales deben formularse en inglés para obtener embeddings alineados.
- Ventana máxima de 10 s por clip; para audios más largos hay que trocear y promediar embeddings, lo que diluye información temporal.
- Los embeddings deben normalizarse a longitud unitaria antes de compararlos, ya que los vectores de Freesound están L2-normalizados.
- El espectrograma mel se calcula fuera del grafo ONNX; un preprocesado incorrecto degrada la calidad de los embeddings sin aviso.
- No es compatible con los pesos de `laion/clap-htsat-fused`; usar ese port contra la API de Freesound devuelve resultados incorrectos.
- Riesgo de sesgo heredado de los datos de entrenamiento de LAION CLAP (AudioSet, Freesound y otros corpus web), con posible infrarrepresentación de ciertas lenguas, acentos y culturas sonoras.
- No es un modelo generativo: no produce texto, etiquetas legibles ni descripciones; solo vectores.
- Licencia CC0 1.0 permite uso comercial sin restricciones atributivas, pero se recomienda citar a los autores originales del paper.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria adicional más allá de la del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agustinissidoro/clap-630k-audioset-fusion-onnx
- Modelo base: https://huggingface.co/lukewys/laion_clap
- Repositorio LAION CLAP: https://github.com/LAION-AI/CLAP
- Port oficial en transformers: https://huggingface.co/laion/clap-htsat-fused
- Script de exportación: https://github.com/agustinissidoro/bach-mcp/blob/main/py/bach_mcp/utilities/export_onnx.py
- Proyecto bach-mcp: https://github.com/agustinissidoro/bach-mcp
- Documentación de la API de Freesound: https://freesound.org/docs/api/
- Paper de referencia (ICASSP 2023): Large-scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation (Wu, Chen, Zhang, Hui, Berg-Kirkpatrick, Dubnov)

# JustANormalTinkerer/hayai-ocr-v2.5-nova

## Resumen

Hayai OCR v2.5 Nova es un modelo visión-lenguaje ultraligero de aproximadamente 157 millones de parámetros, desarrollado por el usuario independiente JustANormalTinkerer, especializado en reconocimiento óptico de caracteres (OCR) a nivel de recorte sobre imágenes de texto japonés, chino, coreano e inglés. Combina un codificador visual SigLIP2 NaFlex (~86M parámetros) de Google con un decodificador transformer causal propio de 12 capas y atención GQA, y transcribe texto denso, estilizado, horizontal y vertical en un único paso hacia delante, sin necesidad de una etapa intermedia de detección de líneas (DBNet, YOLO).

El modelo está diseñado específicamente para reconocimiento a nivel de recorte (crop-level), no de página completa: para escanear páginas enteras debe emparejarse con un detector de texto externo. Su principal innovación en esta versión es un proyector denominado DSCProjector que aplica un pixel unshuffle 2x sobre las embeddings de parches, reduciendo en un 75% el número de tokens visuales que consume el decodificador y, con ello, la latencia de prefill y el consumo de memoria de la caché KV.

La relevancia actual del modelo reside en su relación entre tamaño, velocidad y calidad para OCR de CJK estilizado (manga, light novels, paneles densos) en hardware modesto, con licencia Apache 2.0. No obstante, el propio autor marca esta versión como obsoleta en la model card y recomienda migrar a Hayai OCR v2.7 Supernova.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language: codificador SigLIP2 NaFlex + decodificador transformer causal de 12 capas con GQA y mRoPE 2D |
| Parámetros totales | 156.915.968 (~157M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el presupuesto espacial se controla con `max_num_patches`: 256, 384 o 512) |
| Tipos de cuantización | No disponible (pesos en safetensors; el modelo card menciona autocasting FP16 en CUDA) |
| Idiomas soportados | Inglés, japonés, chino, coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo acopla el codificador visual SigLIP2 NaFlex de Google (~86M parámetros, variante base patch16 con escalado dinámico que preserva la relación de aspecto) a un decodificador transformer causal propio de 12 capas con `d_model=512`, `d_ffn=2048`, 8 cabezas de consulta y 2 cabezas KV (GQA), activación SwiGLU y QK RMSNorm. La conexión entre ambos módulos se realiza mediante el DSCProjector: reordena las embeddings de parches en una rejilla 2D, aplica replicación de padding, un pixel unshuffle 2x (4 parches a 1 token), LayerNorm, una MLP y RMSNorm. El decodificador emplea atención causal por bloques y RoPE multidimensional 2D (mRoPE) sobre la rejilla espacial comprimida.

Entre las innovaciones técnicas destacan el escalado residual aprendible por canal (`attn_res_scale`, `ffn_res_scale`, inicializados a 1.0) para estabilizar la propagación en profundidad, una ruta de inferencia con caché KV estática preasignada y cachés RoPE de texto 1D precalculadas, y un entrenamiento auxiliar con una cabeza de clasificación de 226 clases de Ideographic Description Sequences (IDS) para afinar la discriminación de glifos CJK poco frecuentes (solo en entrenamiento, sin coste en inferencia). Los datos de entrenamiento citados en la model card incluyen Aozora Bunko Clean, Manga109-s, Japanese-Dialogue-Dataset, Wikipedia, hayai-dataset-merged y light-novels; no se especifica el número total de tokens ni si hubo RLHF o DPO.

## Capacidades

- Transcripción de texto a nivel de recorte en japonés, chino, coreano e inglés, incluyendo texto vertical, horizontal, denso y estilizado (manga, light novels, paneles).
- Reconocimiento en un único paso hacia delante sin detector intermedio de líneas de texto.
- Control del presupuesto espacial mediante `max_num_patches` (256 para throughput, 384 equilibrado, 512 para glifos pequeños o paneles densos).
- Decodificación greedy estándar recomendada, con `repetition_penalty=1.0` para OCR.
- Inferencia optimizada con caché KV estática y autocasting FP16 en CUDA.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión general (más allá de OCR), audio ni modo de pensamiento.

## Casos de uso

- Digitalización de manga y cómics: el modelo transcribe bocadillos y rótulos recortados por un detector externo, manejando texto vertical y tipografías estilizadas gracias a su entrenamiento sobre Manga109-s y datos de diálogo japonés.
- Traducción asistida de obras japonesas y coreanas: integrado en un pipeline de detección de texto más OCR más traducción, permite extraer el texto original de cada globo con una CER del 3,10% con 512 parches en JMangaBench_Mixed.
- Procesamiento por lotes de alto volumen: con `max_num_patches=256` y menos de 64 tokens visuales en el decodificador, es adecuado para pipelines masivos donde prima el throughput sobre la precisión máxima.
- Extracción de texto de light novels y documentos escaneados: su entrenamiento con Aozora Bunko Clean, Wikipedia y light-novels lo orienta a texto impreso limpio en japonés e inglés.
- Digitalización de señalización y cartelería CJK: recortes de texto corto en chino, japonés y coreano pueden transcribirse con latencias bajas en GPU de gama media o incluso consumer.
- Preprocesado para sistemas RAG o bases de datos documentales: la salida de texto puede alimentar indexación y búsqueda sobre corpus de imágenes escaneadas.
- Despliegue en entornos con recursos limitados: sus ~157M parámetros y su reducción de tokens visuales permiten ejecutarlo en GPUs modestas (el autor reporta latencias medidas en una NVIDIA T4).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre JMangaBench_Mixed (3.286 recortes, normalización NFKC, latencias en NVIDIA T4):

| `max_num_patches` | Tokens visuales (decodificador) | CER ↓ | Exact Match ↑ | CER solo texto ↓ | EM solo texto ↑ | Latencia relativa |
|---|---|---|---|---|---|---|
| 256 | ≤ 64 | 4,95% | 75,35% | 3,54% | 82,65% | 1,00x (base) |
| 384 (por defecto) | ≤ 96 | 3,65% | 79,15% | 2,36% | 86,31% | ~1,19x |
| 512 (calidad máxima) | ≤ 128 | 3,10% | 80,68% | 1,78% | 88,04% | ~1,34x |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparativas numéricas con modelos de OCR alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~157M parámetros en FP16 el peso del modelo ronda los 0,3 GB, por lo que la mayor parte del consumo proviene de activaciones y caché KV, que se reducen un 75% en tokens visuales respecto a v2.1.
- GPU recomendadas: el autor reporta mediciones de latencia en NVIDIA T4; por tamaño, el modelo cabe holgadamente en GPUs consumer (RTX 3060, RTX 4090, etc.) y en GPUs de datacenter (A100, H100).
- Cabe en GPU consumer: sí, dado su tamaño de ~157M parámetros.
- Opciones de despliegue: transformers con `trust_remote_code=True` (ruta oficial documentada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no se publican valores absolutos, solo latencias relativas (1,00x, ~1,19x y ~1,34x según el presupuesto de parches) medidas en T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / presupuesto espacial | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Hayai OCR v2.5 Nova | ~157M | `max_num_patches` 256–512 | en, ja, zh, ko | Apache 2.0 | Obsoleto según el autor; sustituido por v2.7 Supernova |
| Hayai OCR v2.1 | No disponible (mismo backbone: SigLIP2 ~86M + decodificador 12 capas) | 1 parche = 1 token (sin compresión 4x) | en, ja, zh, ko | Apache 2.0 | Versión anterior |
| Hayai OCR v2.7 Supernova | No disponible | No disponible | No disponible | No disponible | Versión recomendada por el autor |

No se dispone en la información proporcionada de datos comparativos con otros modelos de OCR (por ejemplo, PaddleOCR, TrOCR o Manga OCR) en cuanto a parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo marcado como obsoleto por el propio autor, que recomienda usar Hayai OCR v2.7 Supernova en su lugar.
- Diseñado exclusivamente para reconocimiento a nivel de recorte: para páginas completas requiere un detector de texto externo, y su uso sin detector producirá resultados deficientes.
- La calidad depende del presupuesto de parches elegido; con 256 parches la CER sube al 4,95% frente al 3,10% con 512.
- Riesgo de alucinación inherente a los modelos generativos: puede producir caracteres o palabras plausibles no presentes en la imagen, especialmente en glifos raros o imágenes de baja calidad.
- Cobertura lingüística limitada a inglés, japonés, chino y coreano; no se documenta soporte para otras lenguas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene auditar el código antes de usarlo en producción.
- No se documentan sesgos específicos ni evaluaciones de robustez fuera de JMangaBench; el rendimiento en dominios distintos (documentos administrativos, manuscritos, fotografías) no está validado en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el estado obsoleto del modelo desaconseja adoptarlo en nuevos proyectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2.5-nova
- Versión recomendada (v2.7 Supernova): https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2.7-supernova
- Repositorio GitHub hayai-ocr: https://github.com/NopeNopeGuy/hayai-ocr
- JMangaBench_Read: https://github.com/muscgab/JMangaBench_Read
- JMangaBench_Mixed: https://github.com/muscgab/JMangaBench_Mixed/
- Codificador SigLIP2 NaFlex: https://huggingface.co/google/siglip2-base-patch16-naflex
- Dataset Aozora Bunko Clean: https://huggingface.co/datasets/globis-university/aozorabunko-clean
- Dataset Manga109-s: https://huggingface.co/datasets/hal-utokyo/Manga109-s
- Dataset Japanese-Dialogue-Dataset: https://huggingface.co/datasets/JustANormalTinkerer/Japanese-Dialogue-Dataset
- Dataset hayai-dataset-merged: https://huggingface.co/datasets/JustANormalTinkerer/hayai-dataset-merged
- Dataset light-novels: https://huggingface.co/datasets/alpindale/light-novels
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia

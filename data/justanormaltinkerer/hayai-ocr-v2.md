# JustANormalTinkerer/hayai-ocr-v2

## Resumen

Hayai OCR v2 (también referenciado como v2.1 en la model card) es un modelo visión-lenguaje compacto de aproximadamente 155 millones de parámetros, desarrollado por el usuario independiente JustANormalTinkerer, especializado en transcripción OCR a nivel de recorte (crop-level) para japonés, chino, coreano e inglés. El modelo combina el codificador visual SigLIP2 NaFlex de Google (~86M parámetros) con un decodificador transformer causal propio de 12 capas (~60M parámetros), lo que permite leer texto denso, estilizado, horizontal y vertical en una única pasada forward sin necesidad de una etapa separada de detección de texto (DBNet, YOLO, etc.).

Su relevancia radica en la relación entre precisión y coste computacional: con un footprint de aproximadamente 300 MB en FP16 y un throughput declarado de hasta 54 FPS en una GPU L4, el modelo se posiciona como alternativa ligera a sistemas OCR de mayor tamaño como PaddleOCR-VL (0.9B) en tareas de manga y texto CJK. La versión 2.1 introduce entrenamiento conjunto multimodal y lingüístico, inyectando priors de lenguaje mediante pasadas solo de texto sobre corpus de Wikipedia y Aozora Bunko, lo que reduce errores en radicales CJK visualmente ambiguos y homóglifos.

El modelo está publicado con licencia Apache 2.0, en formato safetensors, con código personalizado (`trust_remote_code=True` requerido) y una librería Python asociada (`hayai-ocr`). La model card advierte explícitamente de que el modelo está desactualizado y recomienda migrar a Hayai Nova (hayai-ocr-v2.5-nova).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: SigLIP2 NaFlex (ViT) + proyector MLP de 2 capas + decodificador transformer causal de 12 capas |
| Parametros totales | 155.614.464 (~150M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el procesador admite `max_num_patches` de 256 por defecto, 384 o 512 para paneles densos; no se especifica un límite de tokens de texto) |
| Tipos de cuantizacion | No disponible (la model card menciona FP16; no se documentan GGUF, AWQ, GPTQ ni otras) |
| Idiomas soportados | Inglés (en), japonés (ja), chino (zh), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura se compone de tres bloques. El codificador visual es `google/siglip2-base-patch16-naflex` (~86M parámetros), que preserva la relación de aspecto nativa mediante parcheado NaFlex, evitando el warping o aplastamiento de caracteres densos. Un proyector MLP de 2 capas mapea las características de los parches visuales a la dimensión oculta del decodificador. El decodificador es un transformer causal de 12 capas (~60M parámetros) con Grouped-Query Attention (8 cabezas de query, 2 de key/value), RMSNorm sobre queries y keys, capas FFN SwiGLU (`d_model = 512`, `d_ffn = 2048`), embeddings posicionales 2D mRoPE dinámicos sobre tokens visuales y 1D RoPE sobre tokens de texto, y máscara de atención block-causal (bidireccional entre parches visuales, causal sobre el texto de salida).

El entrenamiento de v2.1 se realizó en dos fases coordinadas sobre 2 GPU NVIDIA T4 de Kaggle. La primera fase (~19.000 pasos) es un entrenamiento base conjunto multi-tarea que combina un flujo OCR con el dataset `JustANormalTinkerer/hayai-dataset-merged` (~1M imágenes) y un flujo de prior lingüístico con streams empaquetados de tokens de Wikipedia en japonés, chino, coreano e inglés, además de Aozora Bunko. Las pasadas solo de texto entran directamente al decodificador con RoPE 1D, saltándose el backbone visual, lo que inyecta probabilidades de transición contextual CJK sin coste adicional en inferencia. La model card menciona también datos de Manga109-s y un dataset de fine-tuning con coreano. No se detalla si hubo RLHF, DPO o una segunda fase de alineamiento en la información disponible.

## Capacidades

- Transcripción OCR de texto horizontal y vertical en japonés, chino, coreano e inglés a partir de recortes de imagen.
- Lectura de texto denso y estilizado (manga, paneles, tipografías decorativas) en una sola pasada forward, sin etapa de detección de texto.
- Manejo de múltiples scripts en una misma imagen (multi-script), con soporte de onomatopeyas japonesas y coreanas.
- Desambiguación de radicales CJK y homóglifos (por ejemplo, `銀` frente a `高`, `校` frente a `枚`) gracias al prior lingüístico inyectado en el entrenamiento.
- Preservación de relación de aspecto nativa mediante parcheado NaFlex, adecuada para caracteres alargados o verticales.
- Salida image-to-text mediante `model.generate()` con búsqueda greedy recomendada para japonés.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo especializado de extracción, no un asistente general.
- No procesa páginas completas: la model card indica explícitamente que solo funciona con recortes (crops).

## Casos de uso

- Digitalización de manga y cómics: el modelo transcribe bocadillos y texto vertical japonés recortados de viñetas con un CER del 3,225% en JMangaBench_Mixed, adecuado para pipelines de traducción automática de manga donde se recorta cada globo antes de la inferencia.
- Traducción asistida de obras CJK: integrado como etapa OCR previa a un modelo de traducción, permite extraer el texto original de recortes en japonés, chino o coreano y alimentar el traductor con texto limpio, reduciendo errores en cadena.
- Procesamiento por lotes de alto rendimiento: con ~54 FPS en una L4 y ~300 MB de VRAM en FP16, es viable procesar decenas de miles de recortes por hora en una sola GPU de gama media para construir corpus o índices de búsqueda.
- Extracción de texto en aplicaciones móviles o edge: el tamaño de ~150M parámetros y su bajo footprint permiten desplegarlo en entornos con recursos limitados, como apps de lectura o escaneo de documentos CJK.
- Enriquecimiento de datasets de visión-lenguaje: al ser ligero y rápido, sirve para generar anotaciones OCR a gran escala sobre imágenes de manga o documentos antes de entrenar modelos mayores.
- Investigación en OCR de bajo coste: su arquitectura documentada (SigLIP2 + decodificador causal con 2D mRoPE y atención block-causal) y su receta de entrenamiento multi-tarea sirven como base reproducible para experimentos académicos con GPUs T4.
- Indexación y búsqueda de archivos escaneados: transcripción de recortes de documentos históricos o revistas para construir índices de texto completo sobre colecciones CJK.

## Benchmarks y rendimiento

Resultados en JMangaBench_Mixed (CER más bajo es mejor; Exact Match más alto es mejor):

| Modelo | CER ↓ | Exact Match ↑ | CER solo texto ↓ | Exact Match solo texto ↑ |
|---|---:|---:|---:|---:|
| MangaOCR | 4,683% | 73,524% | 2,700% | 82,867% |
| HayaiOCR (v1) | 6,738% | 71,272% | 4,967% | 80,949% |
| HayaiOCR-v2 | 4,534% | 73,645% | 2,872% | 82,227% |
| **HayaiOCR-v2.1** | **3,225%** | **79,671%** | **1,896%** | **87,461%** |
| BaberuOCR | 4,589% | 72,246% | 2,603% | 81,649% |
| PaddleOCR-VL-0.9B-For-Manga | 2,910% | 78,911% | 1,866% | 84,662% |

Resultados en el split de entrenamiento del dataset de fine-tuning (ZH + onomatopeyas JA/KO + EN):

| Modelo | CER medio ↓ | Throughput en GPU L4 (FPS) ↑ |
|---|---:|---:|
| Hayai OCR v2 | 8,52% | 37,25 |
| PaddleOCR-VL-For-Manga | 24,66% | 3,60 |

Resultados en el split de entrenamiento del dataset privado de preentrenamiento CJK:

| Modelo | CER medio ↓ | Throughput en GPU L4 (FPS) ↑ |
|---|---:|---:|
| Hayai OCR v2 | 10,56% | 31,95 |
| Hayai OCR v2.1 | 12,94% | 54,22 |
| PaddleOCR-VL-For-Manga | 38,69% | 2,22 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 300 MB en FP16 para el modelo completo, según la model card. El uso real depende de `max_num_patches` (256 por defecto, 384 o 512 para paneles densos) y del tamaño de lote.
- GPU recomendadas: NVIDIA L4 (referencia de throughput en la model card), T4 (usadas en entrenamiento), y cualquier GPU con al menos ~1-2 GB de VRAM libre para inferencia con lotes pequeños.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también es viable en iGPU o CPU para volúmenes moderados, aunque no se documentan cifras de latencia en CPU.
- Opciones de despliegue: transformers con `AutoModel.from_pretrained(..., trust_remote_code=True)` y `PreTrainedTokenizerFast`; procesador `google/siglip2-base-patch16-naflex`; librería Python `hayai-ocr` recomendada para aplicaciones. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: hasta 54,22 FPS en una L4 para v2.1 en el dataset CJK privado, y 37,25 FPS para v2 en el dataset de fine-tuning; la model card atribuye la mejora de v2.1 al batching de decodificación optimizado.
- Configuración de generación: `max_new_tokens=128`, `repetition_penalty=1.0` (desactivado) y búsqueda greedy para japonés; la model card descarta el uso de `num_beams=4` recomendado en versiones anteriores.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | CER JMangaBench_Mixed | Throughput L4 (FPS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hayai OCR v2.1 | ~150M | en, ja, zh, ko | 3,225% | 54,22 (dataset CJK privado) | Apache 2.0 | Hugging Face |
| PaddleOCR-VL-0.9B-For-Manga | ~0,9B | no disponible | 2,910% | 2,22-3,60 | no disponible en la información | Hugging Face (variante fine-tuned) |
| MangaOCR | no disponible | ja | 4,683% | no disponible | no disponible | Hugging Face |
| BaberuOCR | no disponible | ja | 4,589% | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- El modelo está marcado como desactualizado en su propia model card, que recomienda migrar a Hayai Nova (`hayai-ocr-v2.5-nova`).
- Solo funciona con recortes de imagen; no procesa páginas completas ni realiza detección de texto, por lo que requiere un pipeline externo de segmentación.
- El soporte lingüístico se limita a inglés, japonés, chino y coreano; otros idiomas no están cubiertos.
- Riesgo de alucinación y errores en caracteres visualmente ambiguos, aunque v2.1 los reduce mediante prior lingüístico; persisten tasas de CER no nulas (3,225% en el mejor benchmark).
- La configuración de generación afecta a la precisión: la model card advierte de mantener `repetition_penalty=1.0` y usar greedy search para japonés.
- Requiere `trust_remote_code=True` por el uso de atención block-causal y 2D mRoPE personalizados (`configuration_hayai.py`, `modeling_hayai.py`), lo que implica ejecutar código del autor y revisarlo antes de usar en producción.
- No se documentan sesgos específicos ni evaluaciones de robustez fuera de los benchmarks de manga y CJK.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía ni soporte por parte del autor.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos sin transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2
- Versión recomendada (Hayai Nova): https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2.5-nova
- Librería Python hayai-ocr: https://github.com/NopeNopeGuy/hayai-ocr
- Benchmark JMangaBench_Mixed: https://github.com/muscgab/JMangaBench_Mixed/
- Dataset de fine-tuning: https://huggingface.co/datasets/JustANormalTinkerer/hayai-finetuning-dataset
- Dataset de fine-tuning con coreano: https://huggingface.co/datasets/JustANormalTinkerer/hayai-finetuning-dataset-with-korean
- Dataset Aozora Bunko Clean: https://huggingface.co/datasets/globis-university/aozorabunko-clean
- Dataset Manga109-s: https://huggingface.co/datasets/hal-utokyo/Manga109-s
- Codificador visual SigLIP2 NaFlex: https://huggingface.co/google/siglip2-base-patch16-naflex

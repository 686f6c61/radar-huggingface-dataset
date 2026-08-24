# JustANormalTinkerer/hayai-ocr-v2

## Resumen

Hayai OCR v2 es un modelo ligero de visión-lenguaje (VLM) especializado en transcripción de texto a nivel de recorte (crop) para japonés, chino, coreano e inglés. Desarrollado por JustANormalTinkerer, combina el encoder de visión SigLIP2 NaFlex de Google con un decoder transformer causal de 12 capas, alcanzando unos 155 millones de parámetros. Su principal ventaja es que realiza OCR en una sola pasada sin necesidad de una etapa separada de detección de texto (como DBNet o YOLO), lo que lo hace extremadamente rápido y eficiente en memoria.

La versión v2.1 introduce un entrenamiento conjunto multimodal y lingüístico que inyecta prioridades estadísticas del lenguaje directamente en el decoder, mejorando la desambiguación de caracteres CJK visualmente similares (p. ej., `銀` vs. `高`). El modelo compite con sistemas de 0.9B de parámetros como PaddleOCR-VL, ofreciendo un rendimiento comparable en precisión pero con un throughput hasta 10 veces superior y un consumo de VRAM de aproximadamente 300 MB en FP16. Está disponible bajo licencia Apache 2.0 y se distribuye en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de visión SigLIP2 NaFlex (`google/siglip2-base-patch16-naflex`) + proyector MLP de 2 capas + decoder transformer causal de 12 capas con GQA y SwiGLU |
| Parametros totales | 155.614.464 (~150M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada; soporta hasta 512 parches visuales (`max_num_patches=512`) para imágenes densas |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés, japonés, chino y coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder. El encoder de visión es SigLIP2 NaFlex, que preserva la relación de aspecto nativa de la imagen mediante parcheado adaptativo, evitando deformaciones en caracteres densos. Los parches visuales se proyectan a la dimensión oculta del decoder mediante un MLP de 2 capas. El decoder es un transformer causal de 12 capas con atención por grupos (8 cabezas de consulta, 2 cabezas de clave/valor), normalización RMS sobre consultas y claves, y FFN SwiGLU con `d_model=512` y `d_ffn=2048`. Usa posiciones rotatorias 2D multimodales (2D mRoPE) para los tokens visuales y 1D RoPE para los tokens de texto, con una máscara de atención block-causal: bidireccional entre parches visuales y causal en la generación de texto.

El entrenamiento se realizó en dos fases coordinadas sobre 2 GPUs NVIDIA T4 de Kaggle. La primera fase consistió en un entrenamiento conjunto multi-tarea de aproximadamente 19.000 pasos, combinando un flujo de OCR con el dataset `hayai-dataset-merged` (~1M de imágenes) y un flujo lingüístico intercalado con pasajes de Wikipedia en JA/ZH/KO/EN y el corpus limpio de Aozora Bunko. La función de pérdida combinada fue `L_total = L_ocr + 0.30 * L_text`. Para la optimización se usó el optimizador Muon para las matrices 2D del decoder (momentos ortogonalizados) y AdamW para vectores 1D, embeddings, normas y el encoder SigLIP. Esta inyección de prior lingüístico sin overhead adicional es la innovación clave de v2.1, que reduce errores en radicales y contadores CJK.

## Capacidades

- OCR de nivel de recorte (crop) para japonés, chino, coreano e inglés, incluyendo texto vertical y horizontal con furigana.
- Lectura directa de imágenes sin etapa separada de detección de texto, en una sola pasada hacia adelante.
- Manejo de texto denso, estilizado y diseños complejos mediante `max_num_patches` configurable (256, 384 o 512).
- Alta velocidad de inferencia: 54,22 FPS en GPU L4 (v2.1) frente a 2,22 FPS de PaddleOCR-VL-For-Manga.
- Bajo consumo de memoria: aproximadamente 300 MB de VRAM en FP16.
- Soporte multi-idioma simultáneo con desambiguación mejorada de homógrafos CJK.
- No soporta páginas completas (pull pages); únicamente recortes de imagen.

## Casos de uso

- Transcripción de manga y cómics: el modelo puede procesar recortes de viñetas, globos de diálogo y onomatopeyas en japonés, chino o coreano, integrándose en pipelines de traducción automática de cómics.
- Digitalización de literatura japonesa clásica: gracias a su entrenamiento con Aozora Bunko, es adecuado para transcribir textos históricos con furigana y estilos tipográficos variados.
- OCR para aplicaciones de traducción en tiempo real: su baja latencia y alto throughput permiten usarlo en apps móviles o servicios web que traducen texto de imágenes al instante.
- Automatización de entrada de datos en formularios con texto CJK: puede extraer campos de formularios escaneados, facturas o tarjetas de visita en entornos empresariales.
- Preprocesamiento para pipelines de búsqueda semántica: al convertir imágenes de texto en texto plano, facilita la indexación y búsqueda en archivos de documentos escaneados.
- Análisis de capturas de pantalla y memes en redes sociales: su soporte multilingüe permite extraer texto de imágenes compartidas en plataformas como Twitter o Reddit para moderación o análisis de tendencias.

## Benchmarks y rendimiento

Resultados en JMangaBench_Mixed (CER: Character Error Rate, menor es mejor; EM: Exact Match, mayor es mejor):

| Modelo | CER ↓ | Exact Match ↑ | Text-only CER ↓ | Text-only EM ↑ |
|---|---|---|---|---|
| MangaOCR | 4,683% | 73,524% | 2,700% | 82,867% |
| HayaiOCR | 6,738% | 71,272% | 4,967% | 80,949% |
| HayaiOCR-v2 | 4,534% | 73,645% | 2,872% | 82,227% |
| **HayaiOCR-v2.1** | **3,225%** | **79,671%** | **1,896%** | **87,461%** |
| BaberuOCR | 4,589% | 72,246% | 2,603% | 81,649% |
| PaddleOCR-VL-0.9B-For-Manga | 2,910% | 78,911% | 1,866% | 84,662% |

Throughput en GPU L4 (FPS, mayor es mejor):

| Modelo | Mean CER ↓ | Throughput (FPS) ↑ |
|---|---|---|
| Hayai OCR v2 | 8,52% | 37,25 |
| PaddleOCR-VL-For-Manga | 24,66% | 3,60 |

En un dataset privado de preentrenamiento CJK, Hayai OCR v2.1 alcanzó 54,22 FPS frente a 2,22 FPS de PaddleOCR-VL-For-Manga, con un CER de 12,94% frente a 38,69%.

## Requisitos de hardware

- VRAM estimada: aproximadamente 300 MB en FP16 para inferencia.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en NVIDIA T4, L4 y GPUs de consumo como RTX 3060 o superiores.
- Entrenamiento: se realizó en 2x NVIDIA T4 (Kaggle), por lo que es factible en entornos con recursos limitados.
- Opciones de despliegue: mediante la librería `transformers` con `trust_remote_code=True`; no se documentan integraciones nativas con vLLM, llama.cpp u Ollama, pero al ser un modelo estándar de transformers podría adaptarse.
- Latencia y throughput: 54,22 FPS en L4 (v2.1) según benchmarks del autor; la latencia por imagen depende del número de parches y del tamaño de la imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/Parches | CER (JMangaBench) | Throughput (L4) | Licencia |
|---|---|---|---|---|---|
| Hayai OCR v2.1 | ~150M | Hasta 512 parches | 3,225% | 54,22 FPS | Apache 2.0 |
| MangaOCR | ~80M (estimado) | No especificado | 4,683% | No disponible | Apache 2.0 |
| PaddleOCR-VL-0.9B-For-Manga | 0,9B | No especificado | 2,910% | 2,22 FPS | Apache 2.0 |
| BaberuOCR | No disponible | No disponible | 4,589% | No disponible | No disponible |

Hayai OCR v2.1 ofrece un equilibrio entre precisión y velocidad muy superior a PaddleOCR-VL, con un CER ligeramente mayor pero un throughput 24 veces superior. Frente a MangaOCR, mejora la precisión y añade soporte multilingüe.

## Limitaciones y advertencias

- No funciona con páginas completas (pull pages); únicamente procesa recortes de imagen, por lo que requiere un paso previo de recorte o detección de regiones de texto.
- Puede presentar errores en caracteres CJK visualmente ambiguos, aunque v2.1 reduce significativamente este problema mediante el entrenamiento lingüístico conjunto.
- El uso requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; se recomienda auditar el código antes de usarlo en producción.
- No se han publicado evaluaciones de sesgos o comportamientos adversos; al entrenarse con Wikipedia y Aozora Bunko, puede heredar sesgos de esos corpus.
- La documentación no especifica la longitud máxima de secuencia de texto generada, aunque el ejemplo de uso emplea `max_new_tokens=128`.
- No se proporcionan guías de cuantización oficiales, por lo que el despliegue en entornos con restricciones de memoria puede requerir experimentación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/JustANormalTinkerer/hayai-ocr-v2
- Paquete PyPI: https://pypi.org/project/hayai-ocr/
- Repositorio GitHub (fork original): https://github.com/NopeNopeGuy/hayai-ocr
- Benchmark JMangaBench_Mixed: https://github.com/muscgab/JMangaBench_Mixed/

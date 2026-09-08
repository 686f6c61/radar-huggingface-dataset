# muscgab/MangaDReC-v1

# MangaDReC-v1

## Resumen

MangaDReC-v1 es un sistema OCR especializado en texto japonés de manga, desarrollado por muscgab. Está diseñado para operar en tiempo real sobre recortes de texto (text crops) extraídos por un lector de páginas, ocupándose de la detección, el orden de lectura, el recorte y el reconocimiento dentro de cada región de texto. La arquitectura combina un detector PP-OCRv6 medium DB y un reconocedor PP-OCRv6 small REC, con decodificación CTC greedy. El modelo cuenta con 34,5 millones de parámetros y un checkpoint de 146,7 MB, bajo licencia Apache 2.0.

Su relevancia radica en ofrecer una alternativa rápida a modelos como BaberuOCR en CUDA, con un throughput de hasta 216,88 imágenes/s en una NVIDIA A10 y una calidad comparable (EM 81,750% y CER 3,690% en Manga109s). Sin embargo, en Apple Silicon el rendimiento queda por debajo del esperado, y el autor reconoce que v1 no cumple el objetivo multiplataforma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline OCR: PP-OCRv6 medium DB DET (224x224) + PP-OCRv6 small REC (48 px) + decodificador CTC greedy |
| Parámetros totales | 34,5 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch package |

## Arquitectura y entrenamiento

El pipeline de MangaDReC-v1 recibe un text crop y lo procesa en varias etapas. Primero, un detector PP-OCRv6 medium DB (basado en Differentiable Binarization) fija la imagen a 224x224 píxeles. Después, un módulo A realiza el postprocesado del detector en GPU, calcula el orden de lectura, aplica un recorte en perspectiva y, si no detecta texto, usa la imagen completa como fallback. A continuación, un reconocedor PP-OCRv6 small REC trabaja a 48 píxeles de altura y selecciona el ancho más cercano entre 320, 480 o 640 píxeles, generando un lote CTC. Finalmente, el decodificador DReC produce IDs mediante greedy. La variante DReCo, con 48,1 millones de parámetros, añade un Transformer bidireccional de 13,6 millones que realiza una corrección no autoregresiva (NAR) restringida a sustituciones no puntuación dentro del top-16 de cada celda CTC.

El detector se entrenó con 800.000 imágenes sintéticas que cubren disposición horizontal y vertical, múltiples pistas, Ruby, burbujas y fondos de imagen, además de negativos sin texto. El reconocedor se entrenó con 1,25 millones de pistas sintéticas, aproximadamente 70% verticales y 30% horizontales, con degradaciones como trama (halftone), desenfoque, compresión, bajo contraste, tinta, sangrado y recortes. Para el módulo B de DReCo se realizó un preentrenamiento semántico con 55 millones de caracteres japoneses, incluyendo JESC y texto extraído de una colección privada de manga transcrito con MangaOCR y corregido con Terra y Luna. El entrenamiento visual de B usó solo imágenes sintéticas, sin ajuste fino con manga real. Los datos privados no se publican.

## Capacidades

- OCR de texto japonés en manga, con detección, orden de lectura, recorte y reconocimiento dentro de cada región de texto.
- Soporta disposición vertical y horizontal, múltiples pistas, Ruby, burbujas y fondos de imagen.
- Decodificación CTC greedy en la variante DReC; la variante DReCo añade corrección no autoregresiva con Transformer bidireccional.
- Procesa batches de 1 a 16 para tiempo real y batches de hasta 128 para rendimiento máximo.
- Funciona en CUDA y en Apple Silicon MPS, aunque en MPS el rendimiento es inferior.
- Pipeline de imagen a texto (image-to-text) para text crops; requiere un upstream para el análisis de página completa.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento general.

## Casos de uso

- OCR en tiempo real para lectores de manga digital: el modelo procesa text crops en batches de 1-16; en una NVIDIA A10, el batch 1 tarda 36,28 ms y el batch 16 85,89 ms, lo que permite integrarlo en un flujo de escaneo de páginas con latencia imperceptible.
- Digitalización masiva de archivos de manga: con batch 128 alcanza 216,88 imágenes/s en A10, permitiendo convertir colecciones completas en horas.
- Traducción automática de manga: extrae el texto japonés con EM 81,750% y CER 3,690% en Manga109s, suficiente para alimentar un motor de traducción y posterior revisión.
- Preprocesado para motores de búsqueda: indexa el texto extraído de burbujas y lo asocia a coordenadas, permitiendo búsqueda por contenido en catálogos de manga.
- Herramientas de accesibilidad: convierte el texto de las burbujas en salida de texto plano para lectores de pantalla, incluyendo el orden de lectura.
- Generación de subtítulos o anotaciones para cómics: asocia cada línea de texto a su burbuja, facilitando la creación de subtítulos para versiones animadas o resúmenes.

## Benchmarks y rendimiento

Calidad sobre 8.000 crops de Manga109s, con normalización de puntuación v2.1:

| Modelo | EM | CER |
|---|---|---|
| MangaDReC | 81,750% | 3,690% |
| MangaDReCo | 83,275% | 3,480% |
| BaberuOCR | 82,025% | 3,318% |
| MangaOCR | 81,538% | 3,869% |

Rendimiento en NVIDIA A10 (P50, imágenes ya decodificadas en memoria):

| Batch | MangaDReC P50 | Throughput |
|---|---|---|
| 1 | 36,28 ms | 26,83/s |
| 16 | 85,89 ms | 181,72/s |
| 128 | 599,82 ms | 216,88/s |

## Requisitos de hardware

- VRAM estimada: los pesos de MangaDReC ocupan 146,7 MB (34,5 M parámetros en FP32 ≈ 138 MB). Con overhead de PyTorch y batches de hasta 16, se estima que cabe en menos de 2 GB de VRAM. No se dispone de mediciones oficiales de VRAM.
- GPU recomendadas: NVIDIA A10 (usada en benchmarks), cualquier GPU CUDA con al menos 2 GB de VRAM. En Apple Silicon, funciona con MPS pero con rendimiento inferior.
- Cabe en consumer GPU: sí; una RTX 3060/4060 de 8 GB es más que suficiente.
- Opciones de despliegue: el modelo se ejecuta mediante PyTorch en CUDA o MPS. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI. Se puede integrar en un servicio Python o en un pipeline de OCR.
- Latencia y throughput en Apple M1 Pro MPS: batch 1: 143,17 ms (6,11/s); batch 4: 237,15 ms (10,87/s); batch 16: 534,74 ms (10,03/s).

## Comparativa con modelos similares

| Modelo | EM | CER | Throughput A10 (máximo offline) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MangaDReC | 81,750% | 3,690% | 216,88/s | Apache 2.0 | HuggingFace/ModelScope |
| BaberuOCR | 82,025% | 3,318% | 182,36/s | No disponible | No disponible |
| MangaOCR | 81,538% | 3,869% | 58,40/s | No disponible | No disponible |
| HayaiOCR v2.1 | No disponible | No disponible | 154,91/s | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo espera text crops; si se le pasa una imagen sin texto, se necesita un gate externo de presencia de texto.
- v1 está orientado a texto de cuerpo regular; no maneja bien texto artístico, curvas fuertes, logos ni texto muy pequeño.
- El checkpoint es un paquete PyTorch; no hay exportación a TorchScript/ONNX.
- En Apple Silicon (MPS), el rendimiento es inferior al esperado: desde batch 4 aparece una larga cola (long-tail) y el throughput máximo es 10,87 imágenes/s en batch 4, muy por debajo de CUDA. El autor considera que v1 es un experimento fallido para el objetivo multiplataforma.
- Riesgo de alucinación: como todo OCR, puede producir caracteres incorrectos en regiones ambiguas o con ruido; la tasa de error CER 3,690% en Manga109s lo confirma.
- Los datos de entrenamiento privados (imágenes, transcripciones, corpus) no se publican; solo se publican código y pesos.
- En la evaluación, MangaOCR usa datos derivados de Manga109, por lo que existe riesgo de solapamiento entrenamiento/test en esa comparación. Para MangaDReC no se especifica ese riesgo, pero la evaluación se realiza sobre Manga109s.
- La licencia Apache 2.0 permite uso comercial, pero los componentes de terceros y corpus tienen sus propios avisos (THIRD_PARTY_NOTICES.md).

## Enlaces

- HuggingFace (MangaDReC-v1): https://huggingface.co/muscgab/MangaDReC-v1
- HuggingFace (MangaDReCo-v1-Synthetic): https://huggingface.co/muscgab/MangaDReCo-v1-Synthetic
- ModelScope (MangaDReC-v1): https://modelscope.cn/models/muscgab/MangaDReC-v1
- ModelScope (MangaDReCo-v1-Synthetic): https://modelscope.cn/models/muscgab/MangaDReCo-v1-Synthetic
- GitHub: https://github.com/muscgab/MangaDReC

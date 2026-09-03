# Kellenok/PP-OCRv6_manga

## Resumen

PP-OCRv6_manga es un pipeline de detección y reconocimiento de texto (OCR) especializado en viñetas de manga, manhwa, manhua e ilustraciones de novelas visuales. Desarrollado por Kellenok, el modelo se basa en la arquitectura PP-OCRv6 de PaddlePaddle y se distribuye bajo licencia Apache 2.0. El proyecto aborda un problema específico: los sistemas OCR genéricos suelen fallar con el texto vertical, los globos de diálogo y las tipografías estilizadas propias del cómic japonés y chino.

El pipeline consta de dos componentes: un detector de texto basado en PP-OCRv6 tiny (PPLCNetV4 + RepLKFPN + DBHead) de aproximadamente 2 MB, y un reconocedor basado en PP-OCRv6 small (PPLCNetV4 + lightSVTR + MultiHead CTC/NRTR) de unos 20 MB. Ambos modelos se entrenaron en múltiples etapas (fine-tuning de dominio, weight soups y refinamiento) sobre unas 10.000 páginas y 100.000 recortes de texto, utilizando una RTX 4070. El diccionario de caracteres incluye 18.708 símbolos para japonés y chino.

La relevancia actual del modelo radica en su tamaño extremadamente reducido: la versión ONNX FP16 completa ocupa unos 11 MB, lo que permite inferencia en CPU y en dispositivos con recursos limitados. Según las evaluaciones del autor, supera en precisión a modelos mucho más grandes como Hayai-OCR v2.1 (594 MB) en el dominio del manga, con una tasa de error de caracteres (CER) del 7,94% frente al 8,47% en páginas de manga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector: PPLCNetV4 + RepLKFPN + DBHead (PP-OCRv6 tiny). Reconocedor: PPLCNetV4 + lightSVTR + MultiHead CTC/NRTR (PP-OCRv6 small) |
| Parametros totales | Detector: ~2,1 MB (peso del checkpoint). Reconocedor: ~20,3 MB (peso del checkpoint). Numero exacto de parametros: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision por imagenes, no procesa texto como entrada) |
| Tipos de cuantizacion | ONNX FP32, ONNX FP16, checkpoints nativos de PaddlePaddle (FP32) |
| Idiomas soportados | Japones (ja), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | PaddlePaddle (.pdparams), ONNX (.onnx) en FP32 y FP16 |

## Arquitectura y entrenamiento

El pipeline sigue la arquitectura de PP-OCRv6, que combina un backbone PPLCNetV4 con un cuello de botella RepLKFPN y una cabeza de deteccion DBHead para la tarea de deteccion de texto. El reconocedor utiliza el mismo backbone PPLCNetV4 junto con un decodificador ligero lightSVTR y una cabeza MultiHead que combina los decodificadores CTC y NRTR. Esta combinacion permite manejar tanto texto horizontal como vertical, algo esencial en manga.

El entrenamiento se realizo en varias etapas: primero un fine-tuning de dominio sobre los datasets Manga109-s (paginas de manga japones) y AnimeText (recortes de texto de anime e ilustraciones), seguido de weight soups (promediado de pesos de multiples modelos) y una fase de refinamiento. El dataset de entrenamiento contiene aproximadamente 10.000 paginas completas y 100.000 recortes de texto individuales. Todo el entrenamiento se ejecuto en una unica GPU NVIDIA RTX 4070, lo que demuestra la eficiencia del proceso. El diccionario final incluye 18.708 simbolos, cubriendo kanji, kana, hanzi y simbolos especiales.

## Capacidades

- Deteccion de bloques de texto en paginas de manga, webtoons, manhwa, manhua e ilustraciones a color.
- Reconocimiento de texto japones y chino, incluyendo texto vertical y horizontal.
- Manejo de tipografias estilizadas y globos de dialogo con fondos complejos.
- Exclusion de furigana mediante filtrado geometrico (segun la documentacion del autor).
- Inferencia ligera: el pipeline completo en ONNX FP16 ocupa aproximadamente 11 MB.
- Compatibilidad con PaddlePaddle, ONNXRuntime y OpenVINO para despliegue en CPU o GPU.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente OCR.

## Casos de uso

- Digitalizacion de colecciones de manga: el modelo puede procesar paginas escaneadas y extraer el texto de los globos de dialogo para crear archivos de texto plano o subtitulos, gracias a su alta precision en texto vertical y horizontal.
- Traduccion asistida de manga y manhwa: al integrarse en un pipeline con un motor de traduccion automatica, permite generar traducciones preliminares de paginas completas. Su bajo CER (7,94% en manga) reduce la correccion manual necesaria.
- Indexacion y busqueda de contenido en bibliotecas de comics: el detector puede localizar y extraer texto de miles de paginas para crear indices de busqueda por contenido textual.
- Generacion de subtitulos para anime y novelas visuales: el reconocedor puede procesar capturas de pantalla o imagenes de juegos y extraer el dialogo para generar subtitulos automaticos.
- Analisis de sentimiento o mineria de texto en webtoons: permite extraer el texto de webtoons coreanos y chinos para analisis de tendencias o estudios academicos sobre narrativa visual.
- OCR en dispositivos con recursos limitados: gracias a su tamano reducido (11 MB en FP16), puede desplegarse en Raspberry Pi, moviles o servidores sin GPU, procesando paginas en tiempo real o por lotes.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluacion sobre 562 paginas divididas en tres dominios: manga (234 paginas, 4.300 lineas), webtoons (171 paginas, 732 lineas) e ilustraciones (157 paginas, 835 lineas). El furigana se excluyo mediante filtrado geometrico.

Tabla 1: Deteccion de texto

| Modelo | Tamano | Recall Manga | Recall Webtoons | Recall Ilustr. | Recall Total | F1 Total | FP Total |
|---|---|---|---|---|---|---|---|
| manga_det_v0.1 | 2,05 MB | 94,65% | 93,44% | 88,50% | 93,62% | 92,17% | 559 |
| base_medium | 64,3 MB | 93,19% | 92,90% | 89,94% | 92,69% | 91,35% | 601 |
| base_small | 10,3 MB | 91,88% | 91,26% | 85,75% | 90,93% | 90,67% | 566 |
| base_tiny | 2,05 MB | 91,53% | 91,12% | 88,26% | 91,01% | 86,20% | 1.183 |

Tabla 2: Reconocimiento de texto sobre recortes de manga_det_v0.1 (japones y chino)

| Modelo | Tamano | CER Manga | CER Webtoons | CER Ilustr. | CER Total | Exactitud Total |
|---|---|---|---|---|---|---|
| manga_rec_v0.1 | 20,3 MB | 7,94% | 5,97% | 19,21% | 10,09% | 75,24% |
| hayai-ocr-v2.1 | 594 MB | 8,47% | 19,05% | 20,05% | 11,45% | 75,06% |
| base_medium_rec | 73,3 MB | 12,83% | 5,20% | 25,32% | 14,87% | 63,18% |
| base_small_rec | 20,3 MB | 16,91% | 5,82% | 28,75% | 18,61% | 57,16% |

Referencia: Hayai-OCR v2.1 evaluado directamente sobre globos de dialogo reales

| Modelo | Tamano | CER Manga | CER Webtoons | CER Ilustr. | CER Total | Exactitud Total |
|---|---|---|---|---|---|---|
| hayai-ocr-v2.1 | 594 MB | 8,69% | 11,11% | 20,27% | 11,04% | 69,87% |

Tabla 3: Degradacion ONNX FP32 vs FP16 (OpenVINO / ONNXRuntime)

| Tarea | Formato | Modelo | Tamano | Metrica Total | FP / Exactitud |
|---|---|---|---|---|---|
| Deteccion | FP32 | manga_det_v0.1.onnx | 1,73 MB | 93,60% Recall (92,10% F1) | 570 FP |
| Deteccion | FP16 | manga_det_v0.1_fp16.onnx | 0,92 MB | 93,63% Recall (92,14% F1) | 567 FP |
| Reconocimiento | FP32 | manga_rec_v0.1.onnx | 20,19 MB | 10,92% CER | 71,67% Exactitud |
| Reconocimiento | FP16 | manga_rec_v0.1_fp16.onnx | 10,14 MB | 11,11% CER | 71,25% Exactitud |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo es extremadamente ligero. En FP16, el detector ocupa 0,92 MB y el reconocedor 10,14 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 10xx o superior, AMD, Intel Arc) o incluso CPU. El autor entreno con una RTX 4070, pero la inferencia no requiere ese nivel.
- Compatibilidad con consumer GPU: si, incluyendo GPUs de gama baja y sistemas sin GPU dedicada mediante CPU.
- Opciones de despliegue: PaddlePaddle (inferencia nativa), ONNXRuntime, OpenVINO (CPU/GPU). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos numericos de latencia en la informacion disponible. Dado el tamano del modelo, se espera un procesamiento de paginas en tiempo real en CPU moderna, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Tamano | CER Manga | CER Total | Licencia | Formato |
|---|---|---|---|---|---|
| PP-OCRv6_manga (manga_rec_v0.1) | 20,3 MB | 7,94% | 10,09% | Apache 2.0 | Paddle, ONNX |
| Hayai-OCR v2.1 | 594 MB | 8,47% | 11,45% | No disponible | No disponible |
| PP-OCRv6 base_small_rec | 20,3 MB | 16,91% | 18,61% | Apache 2.0 | Paddle, ONNX |
| PP-OCRv6 base_medium_rec | 73,3 MB | 12,83% | 14,87% | Apache 2.0 | Paddle, ONNX |

El modelo supera a Hayai-OCR v2.1 en CER total (10,09% frente a 11,45%) siendo 30 veces mas pequeno. Frente a los modelos base de PP-OCRv6 del mismo tamano, la mejora es sustancial (10,09% frente a 18,61% del base_small_rec), lo que demuestra el valor del fine-tuning de dominio.

## Limitaciones y advertencias

- El modelo solo soporta japones y chino. No reconoce texto en coreano, ingles u otros idiomas, aunque puede detectar bloques de texto en esos idiomas sin reconocerlos correctamente.
- El rendimiento en ilustraciones a color es significativamente peor que en manga (CER del 19,21% frente al 7,94%), lo que indica limitaciones en fondos complejos o tipografias muy estilizadas.
- El furigana se excluye mediante filtrado geometrico, por lo que el texto pequeno junto a los kanji puede no detectarse o reconocerse correctamente.
- La evaluacion del reconocedor se realizo sobre recortes generados por el propio detector, lo que puede introducir un sesgo favorable. La referencia con Hayai-OCR sobre globos reales muestra una ventaja menor.
- No se proporcionan datos sobre sesgos demograficos o culturales en los datos de entrenamiento. El dataset se limita a Manga109-s y AnimeText, que pueden no representar toda la diversidad de estilos de manga.
- Riesgo de alucinacion: como modelo OCR, puede producir caracteres incorrectos en lugar de texto real, especialmente en imagenes de baja calidad o con ruido.
- La licencia Apache 2.0 permite uso comercial, pero los datasets de entrenamiento (Manga109-s, AnimeText) pueden tener sus propias restricciones de uso que deben verificarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kellenok/PP-OCRv6_manga
- Paper de PP-OCRv6 (arXiv): https://arxiv.org/abs/2606.13108
- Documentacion de PP-OCRv6 en GitHub: https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/algorithm/PP-OCRv6/PP-OCRv6.md
- Modelo relacionado AngleNet (orientacion de texto): https://huggingface.co/Kellenok/anglenet/tree/main
- Guia tecnica sobre PP-OCRv6: https://explore.n1n.ai/blog/pp-ocrv6-hugging-face-multi-language-ocr-guide-2026-06-22

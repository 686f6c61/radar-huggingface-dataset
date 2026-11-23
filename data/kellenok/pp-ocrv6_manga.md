# Kellenok/PP-OCRv6_manga

## Resumen

PP-OCRv6_manga es un pipeline ligero de detección y reconocimiento de texto (OCR) especializado en manga, webtoons e ilustraciones, con soporte para japonés y chino. Lo desarrolla Kellenok como un fine-tuning de los modelos base de PaddlePaddle (PP-OCRv6_tiny_det para detección y PP-OCRv6_small_rec para reconocimiento), adaptándolos al dominio específico del cómic japonés, donde la tipografía variable, los furiganas, las onomatopeyas y los fondos ilustrados complican el OCR convencional.

La relevancia del modelo reside en su extrema ligereza: el pipeline completo en FP16 ocupa 11,6 MB (0,92 MB el detector y 10,71 MB el reconocedor), lo que permite ejecutarlo en CPU sin GPU. Esto lo convierte en una opción práctica para digitalización masiva de mangas, traducción automática de cómics o indexación de bibliotecas de imágenes en entornos con recursos limitados.

La versión v0.3 (noviembre de 2026) incorpora un detector y reconocedor revisados, un diccionario ampliado a 19.053 caracteres con cobertura completa de JIS X 0208 Nivel 1 y 2, y un modelo de lenguaje opcional (n-gramas de caracteres) para resolver caracteres manuscritos o distorsionados. El CER end-to-end en páginas de test se sitúa en 7,57% (5,98% en manga, 2,74% en webtoons).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector: PP-OCRv6 tiny (PPLCNetV4 + RepLKFPN + DBHead). Reconocedor: PP-OCRv6 small (PPLCNetV4 + lightSVTR + MultiHead CTC/NRTR) |
| Parámetros totales | No disponible (pesos: 1,9 MB detector + 21,3 MB reconocedor en FP32) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo OCR, no procesa secuencias de texto largas) |
| Tipos de cuantización | FP32 y FP16 (ONNX); pesos Paddle nativos |
| Idiomas soportados | Japonés (ja), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32 y FP16), Paddle (.pdparams), LM en .npz |
| Tamaño del repo | 0,6 GB |
| Diccionario | ppocrv6_dict.txt, 19.053 símbolos (100% JIS X 0208 Nivel 1 y 2) |
| Entrada del detector | Lado largo 960 px (páginas con ratio >2:1 usan presupuesto de página 3:4) |
| Post-procesado DB recomendado | thresh=0,15, box_thresh=0,25, unclip_ratio=1,5 |

## Arquitectura y entrenamiento

El pipeline combina dos redes independientes. El detector `manga_det` emplea la arquitectura PP-OCRv6 tiny, compuesta por un backbone PPLCNetV4, un cuello RepLKFPN y una cabeza DBHead (Differentiable Binarization) para la segmentación de regiones de texto. El reconocedor `manga_rec` usa PP-OCRv6 small, con backbone PPLCNetV4, un encoder lightSVTR y una cabeza MultiHead que combina CTC y NRTR para la decodificación de secuencias. Ambos se inicializan desde los checkpoints oficiales de PaddlePaddle y se ajustan mediante fine-tuning sobre el dataset Manga109-s (hal-utokyo/Manga109-s).

El entrenamiento se orienta al dominio del manga: líneas de texto con tipografías variables, furiganas (ruby) junto al texto principal, onomatopeyas (SFX) y fondos ilustrados que generan falsos positivos en detectores genéricos. La v0.3 amplía el diccionario a 19.053 caracteres, cubriendo el 100% de JIS X 0208 Nivel 1 y 2, con 345 kanji adicionales que antes fallaban o se sustituían (por ejemplo, 鱶, 毟, 栃, 呟). El modelo de lenguaje opcional `manga_lm` es un árbitro de n-gramas de caracteres de 3,4 MB que resuelve caracteres manuscritos o distorsionados; el autor lo marca como experimental y no recomendado para producción.

## Capacidades

- Detección de texto en imágenes de manga, webtoons e ilustraciones, con filtro aprendido de furiganas y orden de lectura por bloques.
- Reconocimiento de texto en japonés y chino, incluyendo kanji raros y de nivel JIS X 0208 completo.
- Reconocimiento de onomatopeyas (SFX) con CER del 26,54% en las páginas de la Tabla 2, inferior al de alternativas como hayai v2.6 jp (28,62%) pero superior a manga-ocr (22,04%).
- Ejecución en CPU sin GPU gracias al pipeline de 11,6 MB en FP16.
- Exportación a ONNX y OpenVINO, con inferencia sin dependencia de PaddlePaddle.
- Decodificación CTC greedy estándar; modo opcional con LM de n-gramas (experimental).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente perceptivo de imagen a texto.
- No procesa audio ni vídeo.

## Casos de uso

- Digitalización masiva de mangas: el pipeline detecta y reconoce texto página a página en CPU, lo que permite procesar bibliotecas completas sin infraestructura GPU. El CER del 5,98% en manga lo hace adecuado para generar capas de texto buscable.
- Traducción automática de cómics: la salida de texto por bloques con orden de lectura permite alimentar un traductor japonés-español o japonés-inglés, manteniendo la asociación entre globo y diálogo.
- Indexación y búsqueda en archivos de webtoons: con un CER del 2,74% en webtoons, el modelo extrae texto fiable para construir índices de búsqueda full-text sobre colecciones de cómics verticales.
- Accesibilidad: generación de subtítulos o descripciones de texto para lectores con discapacidad visual, extrayendo el diálogo de las páginas y sintetizándolo con TTS.
- Moderación y catalogación de contenido: detección de texto en ilustraciones y fan art para clasificar obras, identificar marcas de agua o filtrar contenido por palabras clave.
- Investigación en OCR de dominios específicos: el modelo sirve como baseline ligero para experimentos de fine-tuning en otros idiomas o estilos gráficos, con pesos ONNX de nombres estables y versionado por revisiones (`v0.1`, `v0.2`, `v0.3`).
- Preprocesado en pipelines de visión: integración como etapa de OCR en sistemas de comprensión de documentos gráficos, con salida de líneas y cajas delimitadoras que otros modelos pueden consumir.

## Benchmarks y rendimiento

### Tabla 1: detección de texto (459 páginas de test, 5.181 líneas; mismo reconocedor `manga_rec`)

| Métrica | v0.3 (960) | v0.2 (960) | Base small (960) | Base medium (960) |
|---|---|---|---|---|
| Tamaño, MB | 1,9 | 1,9 | 10,3 | 64,3 |
| Manga: recall, % | 95,93 | 95,74 | 92,45 | 94,36 |
| Manga: falsos positivos | 501 | 512 | 513 | 448 |
| Manga: CER, % | 5,98 | 6,38 | 9,05 | 5,98 |
| Webtoons: recall, % | 97,62 | 97,28 | 96,60 | 96,94 |
| Webtoons: falsos positivos | 109 | 119 | 103 | 101 |
| Webtoons: CER, % | 2,74 | 3,51 | 3,00 | 3,05 |
| Ilustraciones: recall, % | 89,22 | 89,10 | 86,74 | 89,47 |
| Ilustraciones: falsos positivos | 113 | 126 | 156 | 153 |
| Ilustraciones: CER, % | 14,92 | 15,04 | 17,20 | 13,95 |
| CER total, % | 7,58 | 7,94 | 10,31 | 7,40 |

### Tabla 2: reconocimiento de texto (CER %, menor es mejor)

| Métrica | v0.3 | v0.3 + LM | v0.2 | hayai v2.6 jp | manga-ocr ar exp |
|---|---|---|---|---|---|
| Tamaño (FP32), MB | 21,3 | 21,3 (+3,4 LM) | 21,2 | 628 | 522 |
| Manga | 2,98 | 2,78 | 3,38 | 3,66 | 3,16 |
| Manhua / webtoon | 1,83 | 1,80 | 2,03 | — | — |
| Ilustraciones | 6,15 | 5,98 | 7,26 | 10,29 | 7,65 |
| SFX, páginas Tabla 2 | 26,54 | 26,10 | 28,62 | 28,62 | 22,04 |
| Kanji raro, sintético (ponderado) | 5,84 | 5,84 | 10,62 | 81,57¹ | 89,26¹ |
| Kanji raro, líneas reales | 5,71 | 5,71 | 6,22 | 6,11 | 6,22 |
| JMangaBench_Read, compuesto ↑ | 96,46 | — | — | — | — |

¹ El dato de la model card aparece truncado en el original; se reproduce tal cual.

### Pipeline completo (CER end-to-end en páginas de test)

| Conjunto | v0.2 | v0.3 | v0.3 + LM | Cambio vs v0.2 |
|---|---|---|---|---|
| Manga | 6,71% | 5,98% | 5,90% | −12,0% |
| Webtoons | 3,91% | 2,74% | 2,69% | −31,2% |
| Ilustraciones | 15,32% | 14,92% | 14,70% | −4,0% |
| Total | 8,27% | 7,57% | 7,47% | −9,7% |

## Requisitos de hardware

- VRAM: no requiere GPU. El pipeline completo en FP16 ocupa 11,6 MB (detector 0,92 MB + reconocedor 10,71 MB), ejecutable en CPU.
- GPU recomendadas: no necesarias; cualquier GPU moderna puede acelerar la inferencia vía ONNX Runtime u OpenVINO, pero el modelo está diseñado para CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) con uso de memoria insignificante.
- Opciones de despliegue: ONNX Runtime, OpenVINO (recomendado por el autor para CPU), Paddle Inference. El ejemplo `examples/onnx_openvino.py` implementa el pipeline completo (detección, post-procesado DB, reconocimiento) sin PaddlePaddle.
- Dependencias del ejemplo ONNX/OpenVINO: openvino, opencv-python, numpy, pyclipper, huggingface_hub.
- Latencia y throughput: no disponibles en la información proporcionada.
- Entrada del detector: lado largo 960 px; páginas con ratio superior a 2:1 reciben el presupuesto de píxeles de una página 3:4.

## Comparativa con modelos similares

| Modelo | Tamaño | Idiomas | CER manga | CER ilustraciones | Licencia | Formato |
|---|---|---|---|---|---|---|
| PP-OCRv6_manga v0.3 | 21,3 MB (rec) + 1,9 MB (det) | ja, zh | 2,98% | 6,15% | Apache 2.0 | ONNX, Paddle |
| hayai v2.6 jp | 628 MB | ja | 3,66% | 10,29% | No disponible | No disponible |
| manga-ocr ar exp | 522 MB | ja | 3,16% | 7,65% | No disponible | No disponible |
| PP-OCRv6 base small (det) | 10,3 MB (det) | ja, zh | 9,05% (pipeline) | 17,20% (pipeline) | Apache 2.0 | Paddle, ONNX |

El modelo destaca por ofrecer un CER competitivo con un tamaño entre 25 y 30 veces menor que hayai v2.6 jp y manga-ocr. En kanji raro sintético, la diferencia es drástica: 5,84% frente a 81,57% y 89,26% de las alternativas. En onomatopeyas (SFX), manga-ocr obtiene mejor resultado (22,04% frente a 26,54%).

## Limitaciones y advertencias

- Solo soporta japonés y chino; no está entrenado para otros idiomas.
- El CER en ilustraciones (14,92%) y en onomatopeyas (26,54%) es notablemente superior al de manga y webtoons, lo que limita su uso en esos subdominios sin revisión humana.
- El modelo de lenguaje opcional `manga_lm` es experimental y el autor no lo recomienda para producción; la decodificación CTC greedy sin LM es más simple y rápida.
- Riesgo de falsos positivos en fondos ilustrados: 113 falsos positivos en ilustraciones en la v0.3, aunque inferior a las alternativas base.
- El filtro de furiganas y el orden de lectura por bloques son heurísticas del pipeline, no del modelo; pueden fallar en maquetaciones atípicas.
- No dispone de benchmarks en MMLU, HumanEval, GSM8K ni tareas de razonamiento: es un modelo puramente OCR.
- Licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (Manga109-s) puede tener sus propias restricciones que el usuario debe verificar.
- Los pesos `.pdparams` contienen solo pesos de inferencia (backbone + rama CTC), no de entrenamiento completo.
- No se han publicado datos de latencia ni throughput en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kellenok/PP-OCRv6_manga
- Ejemplo ONNX/OpenVINO: `examples/onnx_openvino.py` (incluido en el repositorio)
- Ejemplo Paddle: `examples/paddle_inference.py` (incluido en el repositorio)
- Modelo base detector: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_det
- Modelo base reconocedor: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_rec
- Dataset de fine-tuning: https://huggingface.co/datasets/hal-utokyo/Manga109-s
- Repositorio PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- OpenVINO: https://github.com/openvinotoolkit/openvino
- ONNX Runtime: https://onnxruntime.ai/

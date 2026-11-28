# kyssta/Qori-OCR

## Resumen

Qori-OCR es un reconocedor de texto óptico (OCR) a nivel de carácter desarrollado por Hadal Research (publicado en Hugging Face bajo el usuario `kyssta`). Se trata de un modelo pequeño, de 3,13 millones de parámetros, diseñado específicamente para el reconocimiento de palabras y líneas cortas en inglés sobre recortes ya detectados (no realiza detección de texto). Su arquitectura combina un backbone depthwise MetaFormer con mezcladores RepDW y cuatro bloques de atención tardíos, un cuello BiGRU y una cabeza CTC.

El modelo se entrenó desde cero con 300.000 recortes sintéticos de MJSynth y 6.106 recortes reales de escenas (ICDAR-2015, SVT e IIIT-5K), y se distribuye en formato ONNX cuantizado para inferencia en CPU sin dependencias de PyTorch ni Paddle. Su relevancia no radica en la precisión —el propio autor reconoce que no es competitivo frente a reconocedores compactos consolidados— sino en servir como línea base reproducible de un pipeline de entrenamiento con pocos datos, con resultados de benchmark publicados de forma transparente, incluidas las comparativas en las que pierde.

La ficha del modelo es explícita: en el mismo conjunto de 5.722 recortes, PP-OCRv6_tiny (1,11 M de parámetros, 4,46 MB) supera a Qori-OCR en 8,3 puntos de exactitud y es 2,2 veces más rápido. Por tanto, debe interpretarse como una referencia metodológica y no como un sustituto de soluciones de OCR en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Depthwise MetaFormer (mezcladores RepDW, 4 bloques de atención tardíos) + cuello BiGRU + cabeza CTC |
| Parametros totales | 3.126.864 (4.492.032 antes de una poda estructurada del 30,4 %) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada de imagen RGB 3×48×320, salida de hasta 40 caracteres |
| Tipos de cuantizacion | FP32, int8 dinámica (dynint8), int8 estática (QOperator) |
| Idiomas soportados | Inglés (conjunto de 96 clases: 95 caracteres ASCII imprimibles, sensible a mayúsculas) |
| Licencia | Solo uso de investigación (research-use) |
| Formato de pesos | ONNX (`.fp32.onnx`, `.dynint8.onnx`, `.qoperator.onnx`) + `charset.json` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida: un backbone MetaFormer con mezcladores RepDW (convoluciones depthwise reparametrizables) y cuatro bloques de atención situados en las etapas finales, seguido de un cuello BiGRU y una cabeza CTC. La entrada es una imagen RGB de 3×48×320 con preservación de relación de aspecto y relleno derecho hasta un múltiplo de 8; la salida se decodifica de forma voraz (greedy CTC) sobre `width // 8` fotogramas, sin léxico ni búsqueda por haces. El modelo se podó de forma estructurada un 30,4 %, reduciendo parámetros de 4,49 M a 3,13 M.

El entrenamiento se realizó en dos etapas. La etapa A utilizó 82.854 pasos con AdamW (weight decay 0,05, grad clip 5, EMA 0,999), tasa de aprendizaje de 7e-4 a 6e-4 con decaimiento coseno, AMP fp16 en una única T4 y batch 64 con acumulación de gradiente 8. La etapa B consistió en 8 épocas solo sobre recortes reales con tasa 2e-4 y aumento de datos orientado a escenas difíciles (perspectiva, desenfoque, JPEG). El corpus total fue de 306.106 recortes: 300.000 de MJSynth y 6.106 reales (ICDAR-2015 4.046, IIIT-5K 1.827, SVT 233). La validación usó 615 recortes reales separados por hash, con un CER mínimo de 0,1789 y 65,5 % de exactitud.

## Capacidades

- Reconocimiento de texto a nivel de palabra y línea corta en inglés sobre recortes de imagen ya detectados.
- Salida de hasta 40 caracteres de un conjunto de 96 clases (ASCII imprimible, sensible a mayúsculas).
- Decodificación CTC voraz sin léxico ni beam search, lo que simplifica el despliegue.
- Inferencia en CPU pura mediante ONNX Runtime, numpy y pillow, sin PyTorch ni Paddle.
- Procesamiento por lotes (`recognize_batch`) para múltiples recortes.
- No realiza detección de texto; requiere recortes previos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o visión general.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Línea base reproducible para investigación en OCR: sirve para comparar pipelines de entrenamiento con pocos datos frente a reconocedores consolidados, gracias a que el autor publica protocolo, análisis de errores y resultados completos en `BENCHMARK_REPORT.pdf`.
- Reconocimiento de texto en dispositivos de borde sin GPU: con 4,05 MB en int8 estática y 11,4 ms por recorte en un núcleo x86, puede integrarse en sistemas embebidos o contenedores ligeros donde no hay acelerador disponible.
- Preprocesado de documentos escaneados en pipelines por lotes: al ejecutarse solo con ONNX Runtime, numpy y pillow, se integra fácilmente en servicios de extracción de texto de bajo coste computacional.
- Prototipado rápido de aplicaciones de OCR: la API mínima (`Recognizer` con `recognize` y `recognize_batch`) permite validar flujos de lectura de palabras en cuestión de minutos.
- Evaluación comparativa de cuantización: los tres formatos ONNX (fp32, dynint8, qoperator) permiten medir el impacto de la cuantización en precisión y latencia en distintas plataformas, algo útil para ingeniería de despliegue.
- Docencia y experimentación académica: modelo pequeño, con arquitectura documentada y entrenamiento reproducible en una sola T4, adecuado para estudiar el efecto de la poda estructurada y la cuantización en reconocedores CTC.
- Filtrado de texto en imágenes de escenas controladas: para entornos donde la precisión exigida es moderada y el coste de infraestructura es la restricción principal.

## Benchmarks y rendimiento

Medidos por Hadal Research sobre 5.722 recortes retenidos (IIIT-5K 3.000, SVT 647, ICDAR-2015 2.075), greedy CTC sin léxico, exactitud tras minúsculas y eliminación de no alfanuméricos. Latencia p50 en un núcleo x86 con ONNX Runtime 1.23.2, batch 1.

| Versión | Disco | IIIT-5K | SVT | IC15 | Global | x86 1 hilo |
|---|---|---|---|---|---|---|
| fp32, 4,49 M (entrenado) | 17,19 MB | 81,8 | 77,7 | 57,1 | 72,4 | 16,8 ms |
| fp32, podado | 11,99 MB | 79,7 | 77,3 | 53,2 | 69,8 | 11,6 ms |
| int8 dinámica (esta release) | 7,69 MB | 79,7 | 77,3 | 53,3 | 69,9 | 9,9 ms |
| int8 estática / QOperator | 4,05 MB | 79,5 | 76,8 | 52,7 | 69,5* | 11,4 ms |

\*La int8 estática depende de la plataforma: el mismo grafo de 4,05 MB mide 69,5–69,8 % en aarch64 y 63,9 % en el contenedor x86 usado para el informe de entrenamiento.

Comparativa con reconocedores similares (mismos recortes, mismo protocolo y decodificación):

| Reconocedor | Params | Disco | IIIT-5K | SVT | IC15 | Global | x86 1 hilo |
|---|---|---|---|---|---|---|---|
| Qori-OCR (int8) | 3,13 M | 7,69 MB | 79,7 | 77,3 | 53,3 | 69,9 | 9,9 ms |
| PP-OCRv6_tiny | 1,11 M | 4,46 MB | 88,5 | 81,1 | 62,4 | 78,2 | 5,1 ms |
| PP-OCRv4_mobile_en | 1,90 M | 7,65 MB | 94,4 | 88,4 | 73,3 | 86,1 | 19,0 ms |
| PP-OCRv5_mobile_en | 1,94 M | 7,87 MB | 95,3 | 89,8 | 75,6 | 87,5 | 19,2 ms |
| PP-OCRv4_mobile_multi | 2,69 M | 10,86 MB | 92,0 | 85,9 | 67,7 | 82,5 | 20,9 ms |
| PP-OCRv5_mobile_multi | 4,11 M | 16,63 MB | 88,6 | 81,5 | 62,4 | 78,3 | 21,3 ms |
| PP-OCRv6_small | 5,27 M | 21,16 MB | 96,5 | 92,1 | 78,4 | 89,4 | 25,4 ms |
| EasyOCR english_g2 | 3,78 M | 15,0 MB | 70,4 | 56,4 | 34,2 | 55,7 | — |

Emparejado por recortes individuales, Qori-OCR gana en 243 y pierde en 718 frente a PP-OCRv6_tiny (McNemar exacto, p < 1e-6).

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo está pensado para inferencia en CPU. En GPU, el consumo es mínimo (menos de 1 GB en cualquier formato por el tamaño de los pesos).
- GPU recomendadas: no aplica; el autor mide latencia en CPU x86. Cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero no aporta ventaja significativa por el tamaño reducido.
- Cabe en cualquier GPU de consumo e incluso en CPU de un solo núcleo; el modelo int8 estática ocupa 4,05 MB en disco.
- Opciones de despliegue: ONNX Runtime (probado con la versión 1.23.2), con dependencias de numpy y pillow. No requiere PyTorch, Paddle ni vLLM.
- Latencia y throughput: p50 de 9,9 ms por recorte en un núcleo x86 para int8 dinámica; 11,4 ms para int8 estática; 16,8 ms para fp32 sin podar. El procesamiento por lotes está soportado mediante `recognize_batch`.

## Comparativa con modelos similares

| Modelo | Params | Contexto/entrada | Global (benchmark) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qori-OCR | 3,13 M | 3×48×320, hasta 40 caracteres | 69,9 | Solo investigación | ONNX en Hugging Face |
| PP-OCRv6_tiny | 1,11 M | No disponible | 78,2 | No disponible | No disponible en la información |
| PP-OCRv4_mobile_en | 1,90 M | No disponible | 86,1 | No disponible | No disponible en la información |
| PP-OCRv5_mobile_en | 1,94 M | No disponible | 87,5 | No disponible | No disponible en la información |
| EasyOCR english_g2 | 3,78 M | No disponible | 55,7 | No disponible | No disponible en la información |

Qori-OCR es más preciso que EasyOCR english_g2 en el benchmark del autor, pero queda por detrás de todas las variantes PP-OCR comparadas, incluida PP-OCRv6_tiny con menos parámetros y menor tamaño en disco.

## Limitaciones y advertencias

- Precisión no competitiva: en el benchmark del propio autor, PP-OCRv6_tiny lo supera en 8,3 puntos y es 2,2 veces más rápido. No debe usarse como sustituto de PP-OCR en producción.
- Solo inglés: el conjunto de caracteres es ASCII imprimible; no cubre otros alfabetos ni caracteres acentuados.
- Sin detección de texto: requiere recortes previos; no localiza regiones en una imagen completa.
- Decodificación voraz sin léxico ni beam search: limita la corrección de errores en palabras ambiguas.
- La cuantización int8 estática es dependiente de plataforma: el mismo grafo mide 69,5–69,8 % en aarch64 y 63,9 % en el contenedor x86 del informe. Debe medirse antes de desplegar.
- Riesgo de alucinación: como todo modelo generativo CTC, puede producir secuencias plausibles pero incorrectas en recortes de baja calidad o con ruido.
- Sesgos: entrenado mayoritariamente con MJSynth sintético y solo 6.106 recortes reales, lo que puede infrarepresentar tipografías, iluminaciones y dominios no vistos.
- Licencia de solo investigación: no está permitido el uso comercial sin autorización; ver el enlace de licencia del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyssta/Qori-OCR
- Licencia y página del modelo en Hadal: https://hadal.run/models/qori-ocr
- Informe de benchmark: `BENCHMARK_REPORT.pdf` (referenciado en la model card del repositorio)
- Ejemplo de inferencia: `ocr_infer.py` (incluido en el repositorio)

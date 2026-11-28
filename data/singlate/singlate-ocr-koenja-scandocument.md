# Singlate/Singlate-OCR-KoEnJa-ScanDocument

## Resumen

Singlate OCR Korean, English, Japanese Scan & Document es un modelo de reconocimiento de texto (OCR) especializado en líneas de texto extraídas de páginas escaneadas y documentos nativos digitales en coreano, inglés y japonés. Lo desarrolla Singlate y parte de un ajuste fino (finetune) sobre PaddlePaddle PP-OCRv6 Small Recognition, el reconocedor pequeño de la familia PaddleOCR. Se trata, por tanto, de un modelo de reconocimiento (no de detección): recibe recortes de líneas de texto ya localizadas y devuelve su transcripción.

El modelo emplea una arquitectura ligera compuesta por un backbone LCNetV4, un codificador LightSVTR y una cabeza CTC con 22 508 clases de salida (incluida la clase blank). Con unos 5,77 millones de parámetros antes de la fusión de inferencia, está pensado para despliegues de alto rendimiento sobre CPU y GPU modestas, no para razonamiento multimodal ni generación de texto libre.

Su relevancia actual radica en el salto de calidad documentado en japonés: frente al PP-OCRv6 Small oficial, el checkpoint `scale_v2` pasa de 66,92 % a 83,69 % de precisión de línea en escaneos XFUND y de 71,08 % a 83,08 % en documentos UTokyo. No obstante, el repositorio declara que la redistribución de pesos está en revisión y la licencia no está disponible, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LCNetV4 (backbone) + LightSVTR (encoder) + cabeza CTC |
| Parametros totales | 5.770.606 (antes de la fusión de inferencia) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 48 px de alto y ancho máximo configurado de 1.280 px |
| Tipos de cuantizacion | FP32 (Paddle static inference, oneDNN) y FP16 (PaddleX `paddle_fp16`) documentados; otras no disponibles |
| Idiomas soportados | coreano (ko), inglés (en), japonés (ja) |
| Licencia | no disponible (redistribución de pesos en revisión) |
| Formato de pesos | Paddle static inference (FP32: 22.915.981 bytes / 21,85 MiB); otros formatos no disponibles |

## Arquitectura y entrenamiento

El modelo es un reconocedor de líneas de texto basado en una red convolucional LCNetV4 como extractor de características, un codificador LightSVTR de atención ligera y una cabeza de clasificación CTC con 22 508 clases de salida. La entrada se normaliza a 48 px de alto con un ancho máximo configurado de 1.280 px, lo que permite manejar líneas de longitud variable mediante inferencia de ancho dinámico.

El ajuste fino se realizó en una etapa final con 340 643 recortes de línea, un muestreo equilibrado entre los tres idiomas objetivo y 24 000 pasos de entrenamiento. Los datos de entrenamiento incluyen escaneos anotados manualmente de AI Hub Public Administrative Document OCR, FUNSD, XFUND y NDL OCR, así como líneas de documentos de AI Hub, DocLayNet, KOCW, MIT OpenCourseWare y UTokyo OpenCourseWare. La separación entre entrenamiento y test se hizo con conciencia del origen de cada fuente y los manifiestos de test se fijaron antes de la evaluación final. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo CTC de OCR.

## Capacidades

- Reconocimiento de líneas de texto en coreano, inglés y japonés sobre recortes de imagen previamente detectados.
- Procesamiento de escaneos de documentos y de documentos nativos digitales (born-digital).
- Manejo de ancho de línea variable mediante inferencia de ancho dinámico (hasta 1.280 px configurados).
- Salida CTC con 22 508 clases, suficiente para cubrir los repertorios de los tres idiomas.
- Inferencia en FP32 sobre CPU (oneDNN) y en FP16 sobre GPU (PaddleX).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking: es exclusivamente un reconocedor de texto.
- No realiza detección de texto ni orden de lectura; requiere un detector previo y un módulo de ordenación para OCR de página completa.

## Casos de uso

- Digitalización de archivos administrativos escaneados en coreano: el modelo reconoce líneas de documentos públicos (AI Hub Public Administrative Document OCR forma parte del entrenamiento) con 89,67 % de precisión de línea y 1,24 % de CER en el conjunto de documentos coreanos, adecuado para pipelines de indexación y búsqueda full-text.
- Procesamiento de formularios y documentos comerciales en inglés: con 94,31 % de precisión de línea y 0,36 % de CER en documentos ingleses, encaja en la extracción de campos sobre recortes de línea ya detectados (facturas, contratos, informes).
- OCR de documentos académicos y apuntes en japonés: los 83,08 % de precisión en documentos UTokyo y 83,69 % en escaneos XFUND lo hacen viable para digitalizar material docente y publicaciones, siempre que se combine con un detector.
- Digitalización de material histórico impreso en japonés: en los subconjuntos NDL impreso e histórico de Honmono alcanza 67,08 % y 59,94 %, útil para proyectos de preservación con revisión humana posterior.
- Extracción de texto en aplicaciones móviles o de escritorio con CPU: con 20,6 ms de latencia mediana por línea en un Intel Xeon Silver 4310 a batch 1 (oneDNN FP32), es apto para escaneo en tiempo real en equipos sin GPU.
- Procesamiento por lotes de gran volumen en GPU: en una RTX A6000 con FP16 alcanza 221,5 líneas/s a batch 16 con 2.056 MiB de VRAM pico, adecuado para reprocesar corpus completos de documentos trilingües.
- Enriquecimiento de pipelines RAG sobre documentación multilingüe: al transcribir líneas de PDF escaneados en ko/en/ja, alimenta índices vectoriales con texto limpio normalizado en Unicode NFC.

## Benchmarks y rendimiento

Resultados internos sobre manifiestos fijos de recortes; precisión de línea con coincidencia exacta tras normalización NFC y de espacios, y CER como distancia de edición total entre caracteres de referencia.

| Idioma | Conjunto | Lineas | v5 Korean accuracy / CER | scale_v2 accuracy / CER |
|---|---|---:|---:|---:|
| Coreano | Escaneos | 650 | 62,15 % / 8,27 % | 78,92 % / 3,56 % |
| Coreano | Documentos | 1.927 | 67,93 % / 5,13 % | 89,67 % / 1,24 % |
| Inglés | Escaneos | 650 | 60,31 % / 4,95 % | 68,77 % / 3,50 % |
| Inglés | Documentos | 1.300 | 86,38 % / 0,74 % | 94,31 % / 0,36 % |
| Japonés | Escaneos | 650 | 7,08 % / 83,12 % | 83,69 % / 2,85 % |
| Japonés | Documentos | 650 | 14,31 % / 83,19 % | 83,08 % / 2,38 % |

Media equiponderada de los seis grupos: 83,07 % de precisión de línea y 2,31 % de CER para `scale_v2`.

Comparación con PP-OCRv6 Small oficial en los mismos recortes japoneses:

| Conjunto | PP-OCRv6 Small | scale_v2 |
|---|---:|---:|
| XFUND (escaneos) | 66,92 % | 83,69 % |
| UTokyo (documentos) | 71,08 % | 83,08 % |
| Honmono NDL impreso | 46,77 % | 67,08 % |
| Honmono NDL histórico | 46,37 % | 59,94 % |

Prueba separada de 1.250 recortes fotográficos: 86,00 % en coreano (200), 62,50 % en inglés (200) y 30,47 % en japonés (850, subconjunto JaWildText).

Rendimiento de inferencia en una NVIDIA RTX A6000 (PaddleX FP16, Paddle 3.3.1, tope de 1.280 px, 288 recortes coreanos):

| Batch | VRAM pico v5 Korean | VRAM pico scale_v2 | v5 Korean lineas/s | scale_v2 lineas/s |
|---:|---:|---:|---:|---:|
| 1 | 404 MiB | 470 MiB | 139,8 | 117,1 |
| 16 | 1.276 MiB | 2.056 MiB | 308,1 | 221,5 |

En CPU (Intel Xeon Silver 4310, cuatro núcleos físicos fijados, oneDNN FP32): latencia mediana a batch 1 de 20,6 ms y 39,8 líneas/s a batch 16 para `scale_v2` (frente a 16,4 ms y 42,5 líneas/s del v5 Korean).

## Requisitos de hardware

- VRAM estimada para inferencia: 470 MiB en FP16 a batch 1 y 2.056 MiB a batch 16 en una RTX A6000, incluyendo runtime y allocator de GPU.
- GPU recomendadas: NVIDIA RTX A6000 es la plataforma medida; cualquier GPU con al menos 1-2 GiB libres debería bastar, aunque no se han publicado mediciones en otras tarjetas.
- Cabe en GPU de consumo: sí, por huella de memoria (menos de 0,5 GiB a batch 1), aunque no hay benchmarks publicados en RTX 4090, RTX 3090 u otras consumer.
- CPU: funciona en FP32 con oneDNN; 20,6 ms por línea a batch 1 en un Xeon Silver 4310 con cuatro núcleos fijados.
- Opciones de despliegue: PaddleX (FP16 en GPU, oneDNN FP32 en CPU) y Paddle static inference; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI.
- Throughput estimado: 117,1 líneas/s (GPU, batch 1) a 221,5 líneas/s (GPU, batch 16); 39,8 líneas/s en CPU a batch 16.
- Los tiempos incluyen redimensionado del recorte y decodificación CTC, pero excluyen carga de imagen y detección.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Prestaciones documentadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Singlate OCR KoEnJa ScanDocument (`scale_v2`) | 5,77 M | ko, en, ja | 83,07 % precisión media en seis grupos; 2,31 % CER | no disponible (en revisión) | pesos pendientes de redistribución |
| PaddlePaddle PP-OCRv6 Small Rec | no disponible | multilingüe (familia PaddleOCR) | 66,92 % en XFUND, 71,08 % en UTokyo, 46,77 % / 46,37 % en Honmono | licencia upstream PaddleOCR | público en Hugging Face |
| PaddlePaddle Korean PP-OCRv5 Mobile Rec | no disponible | coreano | 62,15 % / 67,93 % en coreano escaneos/documentos; 7,08 % / 14,31 % en japonés | licencia upstream PaddleOCR | público en Hugging Face |

## Limitaciones y advertencias

- Licencia no disponible: el repositorio indica que la redistribución de pesos está en revisión, por lo que no está claro que los pesos puedan descargarse ni usarse comercialmente.
- Restricciones de las fuentes de entrenamiento: MIT OpenCourseWare impone condiciones no comerciales y share-alike, y UTokyo OCW se describe como Attribution-NonCommercial-NoDerivatives; la licencia de PaddleOCR no resuelve por sí sola esas condiciones.
- El modelo reconoce líneas, no páginas: requiere detección de texto y orden de lectura externos para OCR completo.
- Rendimiento muy desigual en fotografía natural: 30,47 % de precisión en japonés sobre JaWildText y 62,50 % en inglés, frente a más del 80 % en escaneos y documentos.
- El japonés histórico (Honmono NDL) cae al 59,94 %, insuficiente para producción sin revisión humana.
- Riesgo de alucinación de caracteres inherente a los modelos CTC: sin mecanismo de confianza calibrado documentado, conviene validar con puntuaciones de confianza y revisión por muestreo.
- Sesgos no evaluados: no se publican análisis de sesgo por tipo de letra, género, origen o calidad de escaneo.
- Los benchmarks son internos, sobre manifiestos fijos y con comparaciones que mezclan configuraciones (v5 en PaddleX FP16 con resize por defecto frente a `scale_v2` con ancho dinámico); no son directamente reproducibles por terceros con la información publicada.
- La model card mezcla coreano e inglés y no documenta el pipeline de postproceso, por lo que la integración requiere trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Singlate/Singlate-OCR-KoEnJa-ScanDocument
- Modelo base PP-OCRv6 Small Rec: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_rec
- Referencia oficial PP-OCRv5 Mobile Korean: https://huggingface.co/PaddlePaddle/korean_PP-OCRv5_mobile_rec
- Benchmark Honmono: https://huggingface.co/datasets/eridgd/honmono-ocr-test
- Dataset JaWildText: https://huggingface.co/datasets/llm-jp/jawildtext
- AI Hub: https://aihub.or.kr/aihubdata/data/view.do?dataSetSn=88
- FUNSD: https://guillaumejaume.github.io/FUNSD/index.html
- XFUND: https://github.com/doc-analysis/XFUND
- NDL OCR dataset: https://github.com/ndl-lab/pdmocrdataset-part2
- DocLayNet: https://github.com/DS4SD/DocLayNet
- Términos de MIT OCW: https://ocw.mit.edu/pages/privacy-and-terms-of-use/
- Términos de UTokyo OCW: https://www.he.u-tokyo.ac.jp/en/activities/utokyo-ocw/

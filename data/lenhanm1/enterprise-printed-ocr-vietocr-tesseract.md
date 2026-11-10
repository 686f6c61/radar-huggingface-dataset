# lenhanm1/enterprise-printed-ocr-vietocr-tesseract

## Resumen

El repositorio `lenhanm1/enterprise-printed-ocr-vietocr-tesseract` agrupa dos modelos de reconocimiento optico de caracteres (OCR) ajustados finamente para lineas de texto impreso en vietnamita e ingles: un checkpoint de VietOCR con arquitectura VGG Seq2Seq y un fichero de lenguaje LSTM de Tesseract. Lo desarrolla el usuario lenhanm1 y esta pensado para digitalizar documentos empresariales reales, como informes en PDF y facturas, donde los modelos genericos pierden precision por tipografias, ruido de escaneo y rotaciones.

El interes practico esta en que ambos modelos se evaluan sobre un conjunto de prueba agrupado por PDF de origen (para evitar fuga de datos entre train y test) y con recortes de linea rotados deliberadamente entre -70 y +70 grados. VietOCR reduce la tasa de error por palabra (WER) del 10,12 % al 4,63 % en el conjunto global, mientras que Tesseract baja del 8,88 % al 7,36 %. No es un modelo generativo: es una herramienta de OCR de linea especializada, ligera (repo de 0,1 GB) y desplegable en CPU o GPU.

Conviene subrayar que el modelo no procesa paginas completas por si solo: requiere un paso previo de deteccion y recorte de lineas. Su licencia figura como "other", sin terminos explicitos en la informacion disponible, lo que obliga a contactar con el autor antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VietOCR VGG Seq2Seq (CNN VGG + decoder seq2seq) y Tesseract LSTM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada: recorte de una sola linea de texto) |
| Tipos de cuantizacion | no disponible (pesos en `.pth` para VietOCR y `.traineddata` para Tesseract) |
| Idiomas soportados | vietnamita (vi) e ingles (en) |
| Licencia | other |
| Formato de pesos | `.pth` (PyTorch) para VietOCR; `.traineddata` para Tesseract |

## Arquitectura y entrenamiento

VietOCR emplea una red convolucional VGG como extractor de caracteristicas visuales seguida de un decoder seq2seq (configuracion `vgg_seq2seq` de la libreria vietocr 0.3.13), que transforma la imagen de una linea en una secuencia de caracteres. Tesseract, por su parte, usa su motor LSTM clasico sobre el fichero de lenguaje ajustado `vie_enterprise_print.traineddata`. Ambos operan sobre recortes de una sola linea, no sobre paginas completas.

Los datos de entrenamiento combinan etiquetas revisadas de PDF de informes empresariales reales, muestras de facturas generadas por IA y muestras adicionales en ingles tambien generadas por IA. Parte de los recortes se rotaron deliberadamente entre -70 y +70 grados para aumentar la robustez. Los conjuntos de train, validacion y test se agruparon por PDF de origen para evitar contaminacion. El mejor checkpoint de VietOCR se selecciono en el paso 750 mediante parada temprana por WER de validacion; Tesseract se entreno durante 5.000 iteraciones sin parada temprana. No se documenta el volumen total de tokens ni el uso de RLHF o DPO, algo esperable en un modelo discriminativo de OCR.

## Capacidades

- Reconocimiento de texto impreso en vietnamita e ingles sobre recortes de linea.
- Tolerancia a rotaciones de imagen de hasta ±70 grados gracias al aumento de datos.
- Manejo de tipografias y maquetaciones propias de informes empresariales y facturas.
- Salida de texto plano por linea, integrable en pipelines de extraccion.
- Ejecucion en CPU o GPU (CUDA) con VietOCR; Tesseract funciona en CPU.
- No soporta tool calling, agentes, vision general ni razonamiento multi-paso.
- No es un modelo conversacional ni generativo: no hay modo thinking ni capacidades de audio.

## Casos de uso

- Digitalizacion de facturas: tras recortar cada linea con un detector, VietOCR reconoce importes, fechas y razones sociales con un WER del 4,58 % en vietnamita, suficiente para alimentar un ERP con revision humana en campos criticos.
- Extraccion de datos de informes PDF empresariales: el ajuste sobre etiquetas revisadas de PDF reales reduce errores en cabeceras, tablas y pies de pagina frente al VietOCR base.
- Procesamiento de documentos escaneados con inclinacion: la robustez a rotaciones de ±70 grados permite reconocer lineas mal alineadas sin un paso de correccion de sesgo perfecto.
- Pipelines bilingues vietnamita-ingles: un mismo flujo puede alternar ambos modelos o idiomas segun el documento, util en empresas con documentacion mixta.
- Archivado masivo en CPU: Tesseract con `--psm 7` permite procesar grandes volumenes sin GPU, con CER del 2,75 % en vietnamita.
- Validacion cruzada de OCR: ejecutar VietOCR y Tesseract sobre la misma linea y comparar salidas para marcar discrepancias y priorizar la revision humana.
- Digitalizacion de facturas sinteticas o generadas por IA: el modelo se entreno tambien con muestras generadas, por lo que cubre ese formato.

## Benchmarks y rendimiento

Resultados del snapshot de test incluido en la model card (WER, CER y exact match):

| Modelo | Dominio | Lineas | WER base | WER ajustado | CER base | CER ajustado | Exact base | Exact ajustado |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| VietOCR | Vietnamita impreso | 1239 | 10,13 % | 4,58 % | 5,65 % | 1,87 % | 51,82 % | 68,68 % |
| VietOCR | Ingles impreso | 60 | 10,00 % | 5,96 % | 4,28 % | 1,25 % | 68,33 % | 71,67 % |
| VietOCR | Global | 1299 | 10,12 % | 4,63 % | 5,59 % | 1,85 % | 52,58 % | 68,82 % |
| Tesseract | Vietnamita impreso | 1239 | 8,84 % | 7,48 % | 3,02 % | 2,75 % | 46,81 % | 56,01 % |
| Tesseract | Ingles impreso | 60 | 10,00 % | 3,65 % | 1,34 % | 0,49 % | 51,67 % | 78,33 % |
| Tesseract | Global | 1299 | 8,88 % | 7,36 % | 2,94 % | 2,65 % | 47,04 % | 57,04 % |

El subconjunto en ingles tiene solo 60 lineas, por lo que sus cifras tienen alta varianza. No se han publicado otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para VietOCR: no disponible con precision; el repo pesa 0,1 GB en total, por lo que el checkpoint cabe holgadamente en cualquier GPU consumer (por ejemplo, RTX 3060 o superior) e incluso en CPU.
- GPU recomendadas: cualquier GPU con CUDA para VietOCR (RTX 4090, A100, H100 sobredimensionadas para este modelo); Tesseract funciona en CPU.
- Cabe en GPU consumer: si, sin problema, dado el tamano reducido del repositorio.
- Opciones de despliegue: VietOCR via `vietocr==0.3.13` con PyTorch; Tesseract via binario del sistema (`tesseract-ocr`) y `--tessdata-dir`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VietOCR ajustado (este repo) | CNN VGG + seq2seq | vi, en | linea recortada | other | Hugging Face |
| Tesseract ajustado (este repo) | LSTM | vi, en | linea recortada | other | Hugging Face |
| VietOCR base (`vgg_seq2seq`) | CNN VGG + seq2seq | vi | linea recortada | no disponible | libreria vietocr |
| Tesseract base | LSTM | multilingue | linea recortada | Apache 2.0 (motor) | upstream |

No se dispone de datos de otros modelos OCR comparables en la informacion proporcionada; la comparativa se limita a las lineas base incluidas en el propio benchmark.

## Limitaciones y advertencias

- Solo procesa recortes de una linea; requiere un detector de lineas previo para paginas completas.
- Solo cubre vietnamita e ingles; no hay soporte de otros idiomas.
- El subconjunto de test en ingles es muy pequeno (60 lineas), por lo que sus metricas no son concluyentes.
- Parte de los datos de entrenamiento son generados por IA, lo que puede introducir sesgos hacia ese estilo de documento.
- Riesgo de alucinacion bajo en sentido generativo, pero puede producir sustituciones de caracteres en tipografias o calidades no vistas.
- Licencia "other" sin terminos explicitos: es necesario contactar con el autor antes de uso comercial.
- El repositorio no incluye PDF, imagenes ni etiquetas de origen, lo que limita la reproducibilidad del benchmark.
- No es adecuado para OCR de manuscritos ni para texto no impreso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenhanm1/enterprise-printed-ocr-vietocr-tesseract
- Informe de benchmark: https://huggingface.co/lenhanm1/enterprise-printed-ocr-vietocr-tesseract/blob/main/report.md
- Libreria VietOCR: https://github.com/pbcquoc/vietocr
- Tesseract OCR: https://github.com/tesseract-ocr/tesseract

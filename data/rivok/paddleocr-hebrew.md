# Rivok/paddleocr-hebrew

## Resumen

paddleocr-hebrew es una familia de modelos ONNX para reconocimiento optico de caracteres (OCR) en hebreo, desarrollada por Rivok Labs y publicada bajo licencia Apache-2.0. Se trata de un conjunto de fine-tunes de PaddleOCR v3.7.0 orientados especificamente a texto hebreo, un idioma con escritura de derecha a izquierda (RTL) que el tooling OCR convencional maneja con dificultad. El repositorio incluye reconocedores (REC) y detectores (DET) listos para inferencia, sin pesos de entrenamiento ni configuraciones reproducibles.

La pieza principal es `server-svtrv2`, un reconocedor basado en arquitectura SVTRv2 con doble cabeza (CTC y NRTR con atencion), acompanado de variantes ligeras para CPU y edge, y alternativas basadas en PPHGNetV2-B4, PPLCNetV4 y PPLCNetV3 con destilacion de conocimiento. El modelo resuelve el problema de extraer texto hebreo (y bilingue hebreo-latin) de imagenes de lineas y paginas escaneadas con una precision notablemente superior a Tesseract en las evaluaciones internas del autor.

Su relevancia actual radica en que cubre un hueco: no existia un OCR hebreo open source con licencia permisiva para uso comercial que rindiera bien en documentos reales. El autor reporta CER de 0.35% en hebreo limpio frente al 1.34% de Tesseract, y 2.33% frente a 16.14% en texto bilingue real. Los modelos se distribuyen como ONNX para ejecucion en CPU, CUDA y Jetson mediante `onnxruntime`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SVTRv2 (flagship, CTC + NRTR con atencion); PPHGNetV2-B4, PPLCNetV4 y PPLCNetV3 en variantes alternativas; detectores DBNet mobile |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada por imagen de linea o pagina) |
| Tipos de cuantizacion | INT8 disponible para la cabeza CTC (`ctc.int8.onnx`, 20 MB); resto de modelos en FP32 |
| Idiomas soportados | he (hebreo), en (ingles/latin) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`ctc.onnx`, `nrtr-encoder.onnx`, `nrtr-decstep.onnx`, `det.onnx`, `rec.onnx`) |
| Tamano del repositorio | 0.4 GB |
| Charset | 120 caracteres, identico en todos los reconocedores (`charset_v2f.txt`, md5 e17ce22e7b4ab8224a3dad9e4c85b6ae) |
| Libreria de inferencia | onnxruntime (Python 3.9+, probado en 3.11) |
| Pipeline | image-to-text |

## Arquitectura y entrenamiento

El reconocedor principal emplea SVTRv2, una arquitectura de reconocimiento de texto basada en transformer visual con dos cabezas de decodificacion: una CTC (alineamiento por frames, rapida y sin bucle autorregresivo) y una NRTR con atencion (decodificacion secuencial). En el repositorio, la variante NRTR se distribuye partida en dos ficheros ONNX (`nrtr-encoder.onnx` y `nrtr-decstep.onnx`), de modo que el bucle de decodificacion por atencion se ejecuta en el host. Las variantes `server-v5` (PPHGNetV2-B4) y `server-v6` (PPLCNetV4) son reconocedores alternativos a nivel de palabra, y `mobile-word` (PPLCNetV3) es un estudiante destilado de 7.4 MB. `light-svtrv2small` es un estudiante NRTR-only destilado de 28 + 27 MB para CPU y edge.

Los detectores son DBNet mobile de 4.6 MB, en dos variantes: `word-det` (deteccion a nivel de palabra, usada en el pipeline de pagina) y `line-det` (deteccion a nivel de linea, situacional). Todos los modelos derivan de PaddleOCR v3.7.0 mediante fine-tuning sobre datos hebreos propios del autor, cuya composicion y volumen no se detallan. No se publican los pesos de entrenamiento (`.pdparams`) ni las configuraciones, por lo que no es un pipeline reproducible. El autor no documenta el uso de RLHF ni DPO, algo esperable en un modelo OCR.

Una innovacion practica destacable es el tratamiento explicito de la direccionalidad: la salida se emite en orden logico Unicode y la conversion a orden visual (`python-bidi` `get_display()`) se aplica solo en el momento de renderizar, nunca antes de almacenar o evaluar. El autor senala este punto como la causa principal de salidas corruptas en integraciones RTL.

## Capacidades

- Reconocimiento de texto hebreo impreso en imagenes de lineas y de paginas completas, con salida en orden logico Unicode.
- Reconocimiento bilingue hebreo-latin en el mismo documento (el charset unico de 120 caracteres cubre ambos alfabetos).
- Deteccion de palabras y de lineas de texto sobre la imagen, previa al reconocimiento.
- Doble modo de decodificacion: CTC (mas rapido, sin bucle autorregresivo) y NRTR con atencion (mayor precision en las evaluaciones del autor).
- Variantes para servidor (SVTRv2, PPHGNetV2-B4, PPLCNetV4) y para edge/CPU (SVTRv2-small, PPLCNetV3 de 7.4 MB).
- Ejecucion portable via ONNX Runtime en CPU, CUDA y Jetson.
- Integracion con OCRmyPDF mediante el plugin `ocrmypdf-hebrew` y con Docling mediante `docling-hebrew-ocr`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking: es un modelo OCR especializado.

## Casos de uso

- Digitalizacion de archivos y bibliotecas en hebreo: el pipeline `word-det` + `server-svtrv2` procesa paginas escaneadas y produce texto buscable; el CER de pagina reportado (7.56% en el conjunto GCV de 71 paginas) lo hace viable para corpus historicos donde Tesseract falla.
- Generacion de capa de texto en PDF escaneados: el plugin `ocrmypdf-hebrew` sustituye a Tesseract con `-l heb`, anadiendo una capa de texto hebreo buscable e indexable sin cambiar el flujo de trabajo existente.
- Extraccion de datos de facturas y formularios en hebreo: la deteccion a nivel de palabra permite localizar campos y el reconocedor extrae el valor; el charset bilingue cubre importes y codigos en latin.
- Procesamiento de documentos bilingues hebreo-ingles: el CER de 2.33% en el conjunto bilingue real (n=233) frente al 16.14% de Tesseract justifica su uso en entornos corporativos con documentacion mixta.
- Despliegue en edge o dispositivos con recursos limitados: `mobile-word` (7.4 MB) y `light-svtrv2small` (28 + 27 MB) permiten OCR hebreo en CPU sin GPU, con ONNX Runtime.
- Ingesta documental para RAG: `docling-hebrew-ocr` integra estos modelos como motor OCR de Docling, de modo que documentos hebreos entran en pipelines de recuperacion aumentada con texto correctamente extraido.
- Digitalizacion en entornos con GPU modesta: `server-svtrv2/ctc.int8.onnx` (20 MB) reduce el coste de inferencia manteniendo el CER dentro de 0.2 puntos del modelo FP32.

## Benchmarks y rendimiento

Todos los datos proceden de evaluacion interna del autor, no verificada de forma independiente. El arnes de benchmark no se publica; la metodologia se documenta en el repositorio de GitHub.

| Escenario | Modelo | CER | Tesseract |
|---|---|---|---|
| Hebreo puro limpio (GT perfecto) | SVTRv2 NRTR | 0.35% | 1.34% |
| Bilingue hebreo+latin real (n=233) | cascada / NRTR | 2.33% | 16.14% |
| Nivel de pagina (71 paginas GCV) | word-DET + SVTRv2 | 7.56% | 14.20% |
| Lineas reales (n=1.861), cabeza CTC FP32 | `ctc.onnx` | 10.42% | no disponible |
| Lineas reales (n=1.861), cabeza CTC INT8 | `ctc.int8.onnx` | 10.39% | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Los modelos son pequenos (el mayor, `ctc.onnx`, ocupa 77 MB; el reconocedor completo con NRTR suma 77 + 72 + 27 MB), por lo que la huella de memoria es reducida incluso en FP32.
- GPU recomendadas: cualquier GPU con soporte CUDA para ONNX Runtime; el autor menciona CPU, CUDA y Jetson como objetivos de despliegue. No se especifican modelos concretos como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, con amplio margen; tambien en CPU. Las variantes `mobile-word` (7.4 MB) y `light-svtrv2small` estan pensadas para edge y CPU.
- Opciones de despliegue: ONNX Runtime (CPU/CUDA/Jetson) como via oficial; integracion con OCRmyPDF (`ocrmypdf-hebrew`) y Docling (`docling-hebrew-ocr`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo OCR.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | CER reportado |
|---|---|---|---|---|---|
| paddleocr-hebrew (SVTRv2) | OCR especializado | he, en | Apache-2.0 | ONNX | 0.35% (hebreo limpio), 2.33% (bilingue) |
| Tesseract | OCR generalista | multilingue (incl. he) | Apache-2.0 | binario propio | 1.34% (hebreo limpio), 16.14% (bilingue) |
| PaddleOCR v3.7.0 (base) | OCR generalista | multilingue | Apache-2.0 | Paddle / ONNX | no disponible para hebreo |
| EasyOCR | OCR generalista | multilingue (incl. he) | Apache-2.0 | PyTorch | no disponible en la informacion |

La comparacion se limita a lo reportado por el autor; no hay datos independientes que permitan situar paddleocr-hebrew frente a EasyOCR o frente a PaddleOCR base en hebreo. La ventaja declarada frente a Tesseract es de aproximadamente 4x en hebreo limpio y 7x en texto bilingue real.

## Limitaciones y advertencias

- Los CER reportados son evaluacion interna del autor, no verificada de forma independiente; el arnes de benchmark no se distribuye.
- No se publican pesos de entrenamiento (`.pdparams`) ni configuraciones: no es posible reproducir el entrenamiento ni hacer fine-tuning a partir del repositorio. El autor ofrece colaboracion por correo o issues.
- La salida es orden logico Unicode; aplicar `get_display()` antes de almacenar o puntuar produce texto corrupto. Es el error de integracion mas frecuente segun el autor.
- Solo cubre hebreo e ingles/latin. No hay soporte para otros idiomas ni para escrituras mixtas fuera del charset de 120 caracteres.
- Riesgo de alucinacion en OCR: en lineas degradadas o con ruido, los decodificadores autorregresivos (NRTR) pueden producir texto plausible pero incorrecto; el CER de 10.39-10.42% en lineas reales indica que el rendimiento en documentos no limpios es sensiblemente peor que en el conjunto limpio.
- No se documentan sesgos especificos ni composicion del dataset de entrenamiento, lo que impide evaluar la cobertura de tipografias, calidades de escaneo o variantes ortograficas.
- Licencia Apache-2.0, permisiva para uso comercial, heredada de PaddleOCR v3.7.0; conviene revisar `LICENSE` y `NOTICE` del repositorio.
- El repositorio tiene 337 descargas y 2 likes en el momento de la consulta: adopcion limitada, con menor probabilidad de haber sido probado en produccion por terceros.
- Las variantes NRTR requieren ejecutar el bucle de decodificacion en el host, lo que anade complejidad de integracion frente a una unica sesion ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rivok/paddleocr-hebrew
- Codigo, quickstart y benchmark: https://github.com/RivoksLab/paddleocr-hebrew
- Articulo y benchmarks del autor: https://rivoklabs.com/research/hebrew-ocr
- Rivok Labs: https://rivoklabs.com/
- Plugin OCRmyPDF: https://github.com/RivoksLab/ocrmypdf-hebrew
- Motor OCR para Docling: https://github.com/RivoksLab/docling-hebrew-ocr
- OCRmyPDF (proyecto base): https://github.com/ocrmypdf/OCRmyPDF
- Docling (proyecto base): https://github.com/docling-project/docling
- Contacto del autor: ronen@rivoklabs.com

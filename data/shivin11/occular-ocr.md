# Shivin11/occular-ocr

## Resumen

Occular-OCR es un conjunto de pesos ONNX para un pipeline completo de reconocimiento óptico de caracteres (OCR) orientado principalmente al ruso y a otras lenguas de escritura cirílica. Lo publica el usuario Shivin11 en Hugging Face, pero el desarrollo corresponde al proyecto Occular-OCR (repositorio de GitHub vinculado en la model card). El paquete incluye un detector de texto, dos reconocedores (`svtr_lcnet` y `svtr_t`), un modelo de orientación de página, modelos de lenguaje por idioma y un modelo opcional de orden de lectura. El código del proyecto descarga estos ficheros automáticamente en el primer uso.

El problema que resuelve es la digitalización de documentos en cirílico, un nicho tradicionalmente peor cubierto que el OCR latino: cubre ruso e inglés con `svtr_lcnet` y doce lenguas de escritura cirílica con `svtr_t`. La distribución se hace como ficheros ONNX (repo de 1,2 GB), lo que facilita el despliegue en CPU y en entornos sin GPU mediante ONNX Runtime.

La relevancia práctica viene condicionada por su licencia: la mayoría de los pesos usan una licencia AI Pubs OpenRAIL-M modificada que es gratuita solo para individuos, investigadores, entidades sin ánimo de lucro y organizaciones pequeñas (menos de 20 000 000 ₽ de facturación anual y menos de 8 empleados). El resto requiere una licencia comercial de 300 000 ₽/año. La única excepción es el modelo de orientación de página, bajo Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline OCR modular con ficheros ONNX: detector de texto, reconocedores SVTR (`svtr_lcnet`, `svtr_t`), modelo de orientación de página (OriNet), modelos de lenguaje por idioma y modelo opcional de orden de lectura |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuyen ficheros ONNX; el modelo de orientación se publica como `orientation_orinet_fp32.onnx`, es decir, en FP32) |
| Idiomas soportados | Ruso e inglés (`svtr_lcnet`); 12 lenguas de escritura cirílica (`svtr_t`); lista completa no disponible |
| Licencia | Modificada AI Pubs OpenRAIL-M para detector, reconocedores, modelos de lenguaje y modelo de orden de lectura; Apache-2.0 para `orientation_orinet_fp32.onnx` |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible describe el sistema como un pipeline de varias etapas en lugar de un único modelo monolítico. La primera etapa es un detector de texto que localiza regiones; la segunda son los reconocedores, basados en arquitecturas SVTR (Scene Text Recognition with a Single Visual Model, un transformer visual aplicado a reconocimiento de texto) en dos variantes: `svtr_lcnet`, orientada a ruso e inglés, y `svtr_t`, orientada a doce lenguas de escritura cirílica. Se añade un modelo de orientación de página para corregir rotaciones y un modelo opcional de orden de lectura para reconstruir el flujo de lectura en documentos con maquetación compleja. Los modelos de lenguaje por idioma actúan presumiblemente como etapa de corrección o desambiguación lingüística, aunque la model card no detalla su función exacta.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de la propia modularidad del pipeline y del uso de SVTR. Todos los pesos se distribuyen en formato ONNX, lo que sugiere un objetivo de inferencia portable y optimizada, pero no se documentan detalles de exportación, precisión mixta ni técnicas de decodificación.

## Capacidades

- Detección de texto en imágenes de documentos y escenas.
- Reconocimiento de texto impreso en ruso e inglés mediante `svtr_lcnet`.
- Reconocimiento de texto en doce lenguas de escritura cirílica mediante `svtr_t`.
- Corrección de orientación de página mediante un modelo dedicado (OriNet, FP32).
- Modelos de lenguaje por idioma para post-procesado lingüístico del texto reconocido.
- Reconstrucción del orden de lectura en maquetaciones complejas mediante un modelo opcional.
- Despliegue en formato ONNX, apto para CPU y GPU a través de ONNX Runtime.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento; el alcance es exclusivamente OCR.

## Casos de uso

- Digitalización de archivos administrativos rusos: el pipeline detecta y reconoce texto en formularios y documentos escaneados, con el modelo de orientación corrigiendo páginas giradas antes del reconocimiento.
- Procesamiento de documentos en múltiples lenguas cirílicas: `svtr_t` permite abordar corpus en doce lenguas de escritura cirílica con un único conjunto de pesos, útil para organismos que gestionan fondos documentales multinacionales.
- Extracción de texto en escaneos de baja calidad: la combinación de detector, reconocedor y modelos de lenguaje por idioma permite aplicar corrección lingüística posterior para reducir errores en documentos degradados.
- Reconstrucción de lectura en prensa y maquetación multicolumna: el modelo opcional de orden de lectura permite ordenar bloques de texto en periódicos, revistas o informes con columnas.
- Digitalización masiva en CPU: al distribuirse en ONNX, puede ejecutarse con ONNX Runtime en servidores sin GPU, lo que abarata el procesamiento por lotes de grandes volúmenes de imágenes.
- Integración en sistemas de gestión documental: el código del proyecto descarga los pesos automáticamente en el primer uso, lo que simplifica el despliegue dentro de aplicaciones de archivo y búsqueda documental.
- Preprocesado para pipelines de NLP en ruso: el texto extraído puede alimentar sistemas de búsqueda, clasificación o resumen sobre corpus que hasta ahora solo existían en papel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio de pesos ocupa 1,2 GB, lo que da una cota superior del espacio en disco necesario; el consumo de VRAM o RAM en inferencia no está documentado.
- Al estar en formato ONNX, la inferencia puede ejecutarse en CPU mediante ONNX Runtime, sin necesidad de GPU.
- GPU recomendadas: no disponible. No se especifican requisitos de VRAM ni modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el formato ONNX permite en principio ejecución en GPU de consumo vía CUDA o DirectML, pero no hay datos publicados.
- Opciones de despliegue: ONNX Runtime es la vía natural; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a pipelines OCR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| Occular-OCR | Pipeline OCR modular (detector + SVTR + orientación + LM) | Ruso, inglés y 12 lenguas cirílicas | ONNX | OpenRAIL-M modificada (comercial de pago para grandes organizaciones); Apache-2.0 solo el modelo de orientación | no aplica |
| Tesseract | OCR clásico con LSTM | Muy amplio, incluido cirílico | Pesos propios, ejecutable nativo | Apache-2.0 | no aplica |
| EasyOCR | Detector + reconocedor CRNN | Amplio, incluido cirílico | PyTorch | Apache-2.0 | no aplica |
| PaddleOCR | Detector + reconocedor (SVTR/CRNN) | Amplio, incluido cirílico | PaddlePaddle / ONNX en algunos modelos | Apache-2.0 | no aplica |

La comparación se limita a la categoría funcional, ya que no hay datos de benchmarks que permitan contrastar precisión. Frente a Tesseract, EasyOCR y PaddleOCR, la diferencia principal de Occular-OCR es su especialización en cirílico y su licencia restrictiva para uso comercial a gran escala, frente a las licencias permisivas de las alternativas.

## Limitaciones y advertencias

- La licencia de la mayoría de los pesos no es permisiva: solo es gratuita para individuos, investigadores, entidades sin ánimo de lucro y organizaciones con facturación anual inferior a 20 000 000 ₽ y menos de 8 empleados. Fuera de esos supuestos se requiere una licencia comercial de 300 000 ₽/año por organización.
- Se aplican las restricciones de uso estándar de OpenRAIL-M (prohibición de desinformación, usos ilícitos, violación de derechos y discriminación ilícita), y deben transmitirse a los usuarios posteriores.
- La atribución es obligatoria al distribuir los pesos o derivados ajustados.
- Solo el fichero `orientation_orinet_fp32.onnx` es Apache-2.0 y libre para uso comercial con atribución; el resto no.
- El alcance idiomático documentado se limita al ruso, el inglés y doce lenguas cirílicas; no hay información sobre otras escrituras.
- No se documentan sesgos conocidos, tasas de alucinación ni métricas de error del OCR, lo que impide evaluar su fiabilidad en producción.
- No se especifican requisitos de hardware, latencia ni throughput, por lo que el dimensionamiento debe hacerse empíricamente.
- El repositorio no registra descargas ni valoraciones, y la información pública es escasa; conviene validar el pipeline con datos propios antes de adoptarlo.
- No se detalla el proceso de entrenamiento ni la procedencia de los datos, lo que dificulta evaluar riesgos de sesgo o de derechos sobre el corpus.

## Enlaces

- Hugging Face: https://huggingface.co/Shivin11/occular-ocr
- Repositorio del proyecto: https://github.com/Bodhi42/Occular-ocr
- Licencia de los pesos: LICENSE.md en el repositorio de Hugging Face
- Contacto de licencia comercial: user26665@gmail.com
- Telegram: https://t.me/Bodhi_b

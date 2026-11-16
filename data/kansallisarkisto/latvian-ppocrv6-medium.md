# Kansallisarkisto/latvian-ppocrv6-medium

## Resumen

latvian-ppocrv6-medium es un modelo de reconocimiento óptico de caracteres (OCR) especializado en texto manuscrito e impreso en letón, desarrollado por Kansallisarkisto (Archivo Nacional de Finlandia) en el marco del proyecto ArchXAI, financiado por el programa Central Baltic. Se trata de un ajuste fino del modelo de reconocimiento PP-OCRv6_medium_rec de PaddlePaddle, el mayor de la serie PP-OCRv6, orientado a la digitalización de documentos históricos de los archivos y bibliotecas nacionales de Letonia.

El modelo resuelve el problema del reconocimiento de texto manuscrito (HTR) en documentos históricos en letón, un dominio donde los modelos OCR genéricos rinden muy por debajo de lo aceptable: el PP-OCRv6 original obtiene un CER de 0,2961 en el conjunto de test letón, mientras que este ajuste fino lo reduce a 0,0479. La arquitectura combina un backbone LCNetV4 con un cuello de reconocimiento EncoderWithLightSVTR y decodificador CTC en inferencia.

El modelo se distribuye en formato ONNX (tamaño de repositorio de 0,1 GB) bajo licencia Apache 2.0, con soporte exclusivo para letón. Es relevante para instituciones culturales y proyectos de preservación digital que necesiten transcribir corpus manuscritos en letón con precisión alta y sin dependencia de servicios propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-OCRv6 (backbone LCNetV4 + cuello EncoderWithLightSVTR, decodificador CTC en inferencia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de reconocimiento de lineas de texto, entrada de imagen 96 x 1536) |
| Tipos de cuantizacion | no disponible (distribucion en ONNX) |
| Idiomas soportados | leton (lv) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de PP-OCRv6_medium_rec, el mayor modelo de reconocimiento de la serie PP-OCRv6 de PaddlePaddle. Utiliza LCNetV4 como backbone y EncoderWithLightSVTR como cuello de reconocimiento. Durante el entrenamiento emplea un decodificador multi-cabeza CTC+NRTR, pero en inferencia solo se conserva la cabeza CTC. La entrada de imagen es de 96 x 1536 píxeles, adecuada para líneas de texto de documentos escaneados.

El entrenamiento se realizó sobre anotaciones humanas de líneas de texto principalmente manuscritas de documentos históricos de los Archivos Nacionales de Letonia, complementadas con libros escaneados de la Biblioteca Nacional de Letonia y con líneas vacías de los Archivos Nacionales de Finlandia (solo en train y validación). El conjunto de entrenamiento consta de 154 113 líneas (incluidas 7106 vacías y 14 400 de libros escaneados), el de validación de 17 359 líneas y el de test de 16 878 líneas, con un split 80-10-10 por página. El conjunto de entrenamiento se amplió un 6,66% con celdas de tabla de UoS Data Rescue (Middleton y Singh, 2025) y un 3,33% con cadenas numéricas generadas a partir de dígitos de NIST SD19 y DIDA.

Los hiperparámetros principales fueron: batch size de 32 por dispositivo, 64 dispositivos, learning rate de 5e-5, scheduler coseno, optimizador Adam y 50 épocas. El cómputo se realizó en el supercomputador LUMI, proporcionado por CSC – IT Center for Science.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en letón sobre líneas de imagen.
- Reconocimiento de texto mecanografiado e impreso en letón.
- Transcripción de documentos históricos, incluidos manuscritos de archivo.
- Reconocimiento de cadenas numéricas y códigos alfanuméricos (capacidad reforzada mediante datos sintéticos de NIST SD19 y DIDA).
- Manejo de líneas vacías o sin texto (entrenado explícitamente con líneas vacías).
- Procesamiento de celdas de tabla con contenido textual, incluyendo ocasionalmente texto en otros idiomas como inglés o francés (procedente de UoS Data Rescue).
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades distintas de imagen a texto.

## Casos de uso

- Digitalización de archivos históricos: transcripción automática de manuscritos en letón de los fondos de los Archivos Nacionales de Letonia, con un CER de 0,0479 que reduce drásticamente la revisión manual frente al modelo base (CER de 0,2961).
- Preservación digital en bibliotecas: conversión de libros escaneados de la Biblioteca Nacional de Letonia a texto buscable, aprovechando que parte del entrenamiento proviene de ese mismo tipo de material.
- Rescate de datos (data rescue): extracción de códigos numéricos y alfanuméricos manuscritos en tablas y formularios históricos, capacidad reforzada con datos sintéticos de dígitos.
- Investigación histórica y genealógica: transcripción de registros parroquiales, censos y documentos notariales manuscritos para su análisis textual posterior.
- Pipelines de HTR en producción: integración mediante el paquete nafrec, que incluye segmentación de páginas, para procesar lotes completos de documentos escaneados.
- Extracción de texto de celdas de tabla en documentos administrativos históricos, gracias a la ampliación del entrenamiento con UoS Data Rescue.
- Evaluación y ajuste de sistemas OCR: uso del script de evaluación y del paquete ppocrv6_onnx para medir CER/WER sobre corpus propios en letón.

## Benchmarks y rendimiento

Evaluación in-domain sobre el conjunto de test letón (16 878 líneas), calculada con la librería `evaluate` con configuración por defecto:

| Modelo | CER | WER |
|---|---|---|
| latvian-ppocrv6-medium (ajustado) | 0,0479 | 0,2061 |
| PP-OCRv6 stock (PaddlePaddle) | 0,2961 | 0,8098 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0,1 GB, por lo que la inferencia en ONNX es muy ligera y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime; no se especifican modelos concretos en la información disponible.
- Cabe en GPU consumer: sí, dado el tamaño del repositorio (0,1 GB) y que se trata de un modelo de reconocimiento de líneas, no de un LLM.
- Opciones de despliegue: ONNX Runtime mediante el paquete ppocrv6_onnx; para producción con segmentación, el paquete nafrec.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | CER (test letón) | Licencia | Formato |
|---|---|---|---|---|---|
| latvian-ppocrv6-medium | PP-OCRv6 ajustado | lv | 0,0479 | Apache 2.0 | ONNX |
| PP-OCRv6_medium_rec (stock) | PP-OCRv6 base | multilingüe (genérico) | 0,2961 | no disponible en la información | safetensors |
| Otros modelos HTR para letón | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado principalmente con texto manuscrito en caracteres latinos básicos y caracteres especiales del letón; no ha sido entrenado con alfabetos no latinos (chino, árabe, hebreo, etc.).
- Puede no generalizar bien a idiomas distintos del letón.
- El rendimiento fuera de dominio (manuscritos con caligrafías o dominios no representados) no está caracterizado; el propio autor lo señala como trabajo futuro.
- Riesgo de errores en caracteres especiales del letón y en cifras manuscritas ambiguas, aunque el CER bajo indica una tasa contenida.
- El espacio en blanco debe añadirse manualmente al diccionario proporcionado, tal como indica el autor; de lo contrario, la decodificación puede fallar.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está pensado para documentos históricos en letón, no como OCR genérico multilingüe.
- No se han publicado datos sobre sesgos demográficos o de estilo de escritura más allá de las limitaciones lingüísticas indicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kansallisarkisto/latvian-ppocrv6-medium
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec_safetensors
- Paquete de inferencia ONNX: https://github.com/Kansallisarkisto-AI/ppocrv6_onnx
- Scripts de evaluación: https://github.com/Kansallisarkisto-AI/misc-scripts
- Paquete de producción con segmentación (nafrec): https://github.com/Kansallisarkisto-AI/nafrec
- Generador de líneas alfanuméricas: https://github.com/Kansallisarkisto-AI/PaddleOCR/blob/main/ppocr/data/sd19_alphanumeric_line_generator_seek.py
- Dataset UoS Data Rescue: https://zenodo.org/records/15730546
- Proyecto ArchXAI: https://centralbaltic.eu/project/archxai/
- Supercomputador LUMI: https://lumi-supercomputer.eu/
- CSC – IT Center for Science: https://csc.fi/en/
- Archivos Nacionales de Letonia: https://www.arhivi.gov.lv/en
- Biblioteca Nacional de Letonia: https://lnb.gov.lv/en
- Métrica CER (librería evaluate): https://github.com/huggingface/evaluate/blob/main/metrics/cer/cer.py

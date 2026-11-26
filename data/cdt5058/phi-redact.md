# CDT5058/phi-redact

## Resumen

phi-redact es un modelo de clasificación de tokens (token classification) especializado en la detección y redacción de información personal identificable (PII) y de información sanitaria protegida (PHI) en textos en inglés. Lo desarrolla el usuario CDT5058 y está publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo compacto de 11,13 millones de parámetros, destilado por conocimiento (knowledge distillation) a partir de un profesor DistilBERT de 66 millones de parámetros, y construido sobre la arquitectura BERT-mini (google/bert_uncased_L-4_H-256_A-4), con 4 capas, 256 dimensiones ocultas y 4 cabezas de atención.

El modelo resuelve un problema muy concreto: identificar y etiquetar 32 tipos de entidades sensibles (nombres, direcciones, números de la seguridad social, historiales médicos, tarjetas de crédito, IBAN, matrículas, identificadores gubernamentales, etc.) en textos clínicos, administrativos y de propósito general, con el objetivo de facilitar su redacción automática. Su rasgo diferencial es el enfoque en despliegue local (on-device): se distribuye en formatos ONNX, Core ML y LiteRT/TFLite, con variantes cuantizadas de entre 5,6 MB y 44,6 MB, pensadas para escenarios en los que los datos no pueden salir del dispositivo.

La versión actual es la v9 (fechada el 21 de octubre de 2026), una revisión exclusivamente de datos respecto a la v8: no cambia la arquitectura, el profesor ni el procedimiento de entrenamiento, sino la mezcla de entrenamiento (minería de negativos duros, generador sintético revisado y reducción del corpus Gravitee). El modelo está pensado para asistir flujos de redacción, no como solución certificada de desidentificación, y solo cubre el idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-mini (google/bert_uncased_L-4_H-256_A-4), 4 capas, 256 dimensiones ocultas, 4 cabezas de atención |
| Parametros totales | 11.137.921 (11,13 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | INT8 (ONNX), FP16 (Core ML), 4-bit palettized (Core ML), FP32 (ONNX, LiteRT, Core ML) |
| Idiomas soportados | Inglés únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (INT8 y FP32), Core ML (.mlpackage), LiteRT/TFLite (FP32) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT-mini con 4 capas, 256 dimensiones ocultas y 4 cabezas de atención, sobre un vocabulario WordPiece de 30.522 tokens (bert-base-uncased). La cabeza de clasificación emite 129 etiquetas en esquema BIOES (32 tipos de entidad × 4 posiciones más la etiqueta O). Se entrenó mediante destilación de conocimiento con α=0,7 desde un profesor distilbert-base-uncased de 66 millones de parámetros. El conjunto de entrenamiento de la versión v9 (mezcla «v9») comprende aproximadamente 212.000 documentos procedentes de notas clínicas, textos de prestaciones gubernamentales, ensayos de estudiantes, texto general con PII y prosa estilo Wikipedia.

La revisión v9 es únicamente de datos. Se añadieron negativos duros minados: el modelo v8 puntuó un conjunto de 54.380 documentos con etiqueta vacía de los corpus de entrenamiento, y los 1.616 documentos en los que disparó falsos positivos, junto con 15.000 documentos limpios, se incorporaron como negativos. También se revisó el generador sintético (gen_synth_v9.py, 22.000 notas): se reforzaron las formas segmentadas de identificadores gubernamentales, se incluyó un 18 % de notas con contexto público/prosa y direcciones geográficas sin etiquetar, un 15 % de notas dispersas de baja densidad y señuelos de identificadores inválidos (SSN imposibles, tarjetas que no pasan Luhn, números 555) en aproximadamente el 50 % de las notas. Se redujo el corpus Gravitee de 25.000 a 15.000 documentos y se subió el umbral por defecto del SDK de 0,5 a 0,6 (phi-redact-sdk 0.3.0).

## Capacidades

- Detección y etiquetado de 32 tipos de entidades PII/PHI con esquema BIOES: NAME_PATIENT, NAME_FAMILY, NAME_PROVIDER, DATE, ADDRESS, PHONE, EMAIL, SSN, MRN, HEALTHPLAN, ACCOUNT, IDNUM, LICENSE, EMPLOYER, PROFESSION, AGE, CITY, STATE, COUNTRY, ZIP, URL, IP, DEVICE, ROUTING_NUMBER, IBAN, CREDITCARD, HOSPITAL, FAX, PASSPORT, VIN, TAX_ID y GOVERNMENT_ID.
- Reconocimiento de entidades nombradas (NER) en inglés sobre texto clínico, administrativo y de propósito general.
- Redacción y desidentificación de documentos como parte de un flujo (el modelo detecta; la sustitución o enmascaramiento la realiza el sistema que lo integra).
- Inferencia local en dispositivo gracias a los formatos ONNX, Core ML y LiteRT, sin necesidad de enviar datos a un servidor.
- Ejecución con cuantización INT8 sin pérdida de recall según el autor (mismo recall que el checkpoint PyTorch en el conjunto dorado).
- No dispone de tool calling, function calling, razonamiento multi-paso, modo thinking, visión ni audio: es un clasificador de tokens puro.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Redacción de notas clínicas antes de su almacenamiento o compartición: el modelo etiqueta nombres de pacientes, proveedores, fechas, MRN, números de seguro y direcciones en notas de hasta 256 tokens, de modo que un paso posterior pueda enmascararlos; su tamaño reducido permite ejecutarlo dentro del propio sistema de historia clínica.
- Desidentificación en el borde (on-device) para aplicaciones móviles sanitarias: la variante Core ML de 5,6 MB en 4 bits o la de 22,2 MB en FP16 permiten procesar texto en el propio dispositivo iOS sin transmitir datos sensibles, lo que encaja con requisitos de minimización de datos.
- Saneamiento de registros de atención al cliente: detección de teléfonos, correos, IBAN, tarjetas de crédito y direcciones en transcripciones o tickets antes de enviarlos a sistemas analíticos o de terceros.
- Preprocesado de corpus para investigación: etiquetado de PII en ensayos, textos administrativos y prosa antes de publicar conjuntos de datos o de entrenar otros modelos, usando la variante ONNX INT8 de 11,3 MB en pipelines por lotes.
- Cumplimiento y auditoría interna: integración como primera pasada en flujos de revisión de documentos de prestaciones gubernamentales, marcando candidatos a identificadores (SSN, TAX_ID, GOVERNMENT_ID, pasaporte) para revisión humana.
- Filtrado de datos en herramientas de desarrollo: ejecución local en un portátil o en CI para detectar credenciales y datos personales en logs o ficheros de texto antes de commitearlos, gracias a la licencia Apache 2.0 y a los formatos portables.
- Enmascaramiento previo a la inferencia con modelos grandes: usar phi-redact como paso de redacción antes de enviar texto a un LLM alojado, reduciendo la exposición de datos personales en la cadena.

## Benchmarks y rendimiento

Evaluación dorada sintética de 164 casos (reglas + fusión neuronal, configuración de producción, conjunto evals/synthetic-164):

| Metrica | v7 | v8 INT8 | v9 INT8 (artefacto publicado) |
|---|---|---|---|
| Recall de valor completo | 0,885 | 0,958 | 0,974 |
| Recall de término | 0,651 | 0,760 | 0,828 |
| Precisión | 0,749 | 0,695 | 0,746 |
| F1 estricto de span | 0,435 | 0,617 | 0,677 |
| Tasa de FP en casos limpios | 0,120 | 0,440 | 0,200 |

El checkpoint PyTorch alcanza 0,975 de recall de valor completo con el arnés de evaluación de Colab (evaluate_golden.py) sobre el mismo conjunto de prueba.

Benchmarks estándar del estudiante v9 (solo modelo, puntuación estricta de span):

| Benchmark | Metrica | Valor |
|---|---|---|
| Learning Agency | micro-F1 | 0,729 (NAME F1 0,778) |
| FewNERD | name F1 | 0,781 (recall 0,838) |
| MultiNERD | name F1 | 0,893 (recall 0,940) |
| WikiANN | name F1 | 0,763 (recall 0,831) |
| govsynth | F1 | 1,000 |

Evaluación Nemotron-PII v9 (2.000 documentos estructurados, 13.134 spans dorados, coincidencia exacta de span, solo modelo): micro precisión 0,870, recall 0,830, F1 0,849 (idéntico a v8; v7 obtenía 0,860 en esta distribución sintética). Por entidad, v9 mejora SSN (0,957 frente a 0,933 en v8), PROFESSION (0,517 frente a 0,491) y LICENSE (0,908 frente a 0,885), y retrocede ligeramente en ADDRESS, DEVICE y HEALTHPLAN.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (44,6 MB de pesos más activaciones para secuencias de 256 tokens); en INT8, unos pocos cientos de MB incluyendo el runtime.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente para lotes grandes. En CPU, un solo núcleo moderno puede procesar secuencias de 256 tokens con latencia de milisegundos.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles: la variante Core ML de 5,6 MB en 4 bits y la de 22,2 MB en FP16 están pensadas para iPhone/iPad; la de LiteRT FP32 (44,5 MB) para Android y edge.
- Opciones de despliegue: ONNX Runtime (INT8 y FP32), Core ML, LiteRT/TFLite, PyTorch con safetensors, y el SDK propio phi-redact-sdk 0.3.0 (scorer score_phi.py con umbral por defecto 0,6). No se documenta soporte específico para vLLM, TGI, llama.cpp ni Ollama, que no son adecuados para un clasificador de tokens.
- Latencia y throughput: no se publican cifras concretas en la información disponible; por el tamaño del modelo (11,13 M de parámetros, 4 capas) se espera un throughput alto en CPU y muy alto en GPU para lotes, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phi-redact v9 | 11,13 M | 256 tokens | NER PII/PHI, 32 entidades, on-device | Apache 2.0 | Hugging Face, ONNX/Core ML/LiteRT |
| DistilBERT teacher | 66 M | 512 tokens (típico) | Modelo base; profesor de la destilación | Apache 2.0 (distilbert-base-uncased) | Hugging Face |
| BERT-mini (google/bert_uncased_L-4_H-256_A-4) | ~11 M | 512 tokens (típico) | Modelo base sin ajuste para PII | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de resultados comparativos con otros modelos especializados en PII (por ejemplo, detectores comerciales o modelos NER genéricos) más allá del profesor DistilBERT y del modelo base BERT-mini, por lo que la comparación de rendimiento con alternativas de la misma tarea se considera no disponible.

## Limitaciones y advertencias

- No es una solución certificada de desidentificación: el autor advierte explícitamente que no está certificado bajo HIPAA Expert Determination ni Safe Harbor; debe evaluarse sobre datos propios antes de usarlo en contextos sensibles para el cumplimiento normativo.
- Solo inglés: no cubre otros idiomas, lo que limita su uso en entornos multilingües.
- Ventana de contexto de 256 tokens: los documentos más largos deben dividirse en fragmentos, con el riesgo de perder entidades que crucen los límites de fragmento.
- Retención de contexto público deficiente: el modelo sigue redactando geografía que el conjunto dorado marca como pública o que debería conservarse (retención 0,133, sin cambios respecto a v8); ciudades de instalaciones y nombres de programas estatales son aproximadamente la mitad de los falsos positivos restantes. Para flujos sensibles a la precisión, el autor sugiere la v7.
- Riesgo de falsos positivos en texto limpio: la tasa de FP en casos limpios es 0,200 en v9 (0,440 en v8), lo que implica que aproximadamente uno de cada cinco textos limpios recibe alguna marca.
- Riesgo de alucinación: al ser un clasificador de tokens, no genera texto libre, pero puede etiquetar spans incorrectos o inventar límites de entidad (falsos positivos y spans mal delimitados), especialmente en entidades con F1 bajo como PROFESSION (0,517).
- Sesgos conocidos: no se documentan análisis de sesgo por demografía, dominio o tipo de texto en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el aviso de no certificación traslada al integrador la responsabilidad de validar el modelo en su dominio.
- Dependencia de umbral: el SDK usa por defecto 0,6; cambiar el umbral altera el equilibrio precisión/recall y debe recalibrarse sobre datos propios.

## Enlaces

- Hugging Face: https://huggingface.co/CDT5058/phi-redact
- Modelo base BERT-mini: https://huggingface.co/google/bert_uncased_L-4_H-256_A-4
- Profesor DistilBERT: https://huggingface.co/distilbert-base-uncased
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos.

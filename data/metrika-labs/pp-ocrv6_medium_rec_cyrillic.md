# metrika-labs/PP-OCRv6_medium_rec_cyrillic

## Resumen

PP-OCRv6_medium_rec_cyrillic es un modelo de reconocimiento óptico de caracteres (OCR) especializado en texto cirílico, tanto impreso como manuscrito. Lo desarrolla Metrika Labs como ajuste fino (finetune) del modelo base PaddlePaddle/PP-OCRv6_medium_rec, dentro de la familia PP-OCRv6 de PaddlePaddle, orientada a reconocimiento de texto rápido y ligero. El modelo resuelve el problema de la transcripción automática de documentos en ruso y otras lenguas que emplean el alfabeto cirílico, un nicho habitualmente desatendido por los OCR genéricos centrados en inglés y chino.

El modelo se distribuye como pesos de reconocimiento (rec) para PaddleOCR y cubre once idiomas declarados oficialmente (ruso, kazajo, bielorruso, uzbeko, tayiko, ucraniano, búlgaro, serbio, tártaro, kirguís y mongol), aunque el entrenamiento incluye bastantes más lenguas cirílicas. El repositorio ocupa aproximadamente 0,1 GB, lo que lo sitúa en la gama de modelos ligeros aptos para inferencia en CPU. Es relevante para pipelines de digitalización documental en entornos de habla rusa y de Asia Central, donde la disponibilidad de OCR cirílico de calidad era limitada.

La versión actual soporta escritura manuscrita solo en ruso: lee bien la letra clara, pero puede fallar con caligrafía cursiva o poco legible. El modelo se complementa con una variante Tiny y con versiones ONNX optimizadas para CPU mediante RapidOCR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-OCRv6 (familia de reconocimiento de texto de PaddlePaddle; variante "medium") |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de reconocimiento de lineas de texto, no generativo) |
| Tipos de cuantizacion | no disponible (existe variante ONNX para CPU, pero no se detallan esquemas de cuantizacion) |
| Idiomas soportados | ru, kk, be, uz, tg, uk, bg, sr, tt, ky, mn (y otras lenguas cirilicas usadas en entrenamiento: macedonio, bashkir, osetio, chuvasio, checheno, yakuto, avar) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos PaddlePaddle (PaddleOCR); variante ONNX disponible en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un reconocedor de texto de la familia PP-OCRv6 de PaddlePaddle, una arquitectura de reconocimiento de lineas de texto (image-to-text) optimizada para velocidad y peso reducido, no un modelo generativo de lenguaje. Se trata de un ajuste fino del checkpoint PaddlePaddle/PP-OCRv6_medium_rec sobre un corpus específicamente cirílico. En el pipeline completo se combina con el detector PP-OCRv6_medium_det, que localiza las lineas de texto antes de la fase de reconocimiento.

Metrika Labs entrenó el modelo sobre 7,5 millones de ejemplos variados de texto impreso y manuscrito, procedentes de escaneos de documentos reales e imágenes sintéticas. El 80 % de los ejemplos están en ruso y el 20 % restante en kazajo, bielorruso, uzbeko, tayiko, ucraniano, búlgaro, serbio, macedonio, tártaro, kirguís, mongol, bashkir, osetio, chuvasio, checheno, yakuto, avar y otras lenguas cirílicas. No se detalla en la información disponible si hubo fases de RLHF, DPO ni el número exacto de tokens o muestras por idioma. La model card incluye un ajuste específico del preprocesado de redimensionado (`ReisizeNorm`) para mejorar la lectura en el pipeline de PaddleOCR.

## Capacidades

- Reconocimiento de texto impreso en cirílico, optimizado para escaneos de documentos reales con distorsiones, defectos de impresión e imágenes de baja calidad.
- Reconocimiento de escritura manuscrita en ruso (letra clara; menor fiabilidad con cursiva o caligrafía poco legible).
- Cobertura multilingüe cirílica: ruso, kazajo, bielorruso, uzbeko, tayiko, ucraniano, búlgaro, serbio, tártaro, kirguís y mongol, además de otras lenguas cirílicas presentes en el entrenamiento.
- Integración con el pipeline completo de PaddleOCR (detección + reconocimiento) mediante `PaddleOCR`.
- Salida con texto reconocido y puntuación de confianza por linea (`rec_texts` y `rec_scores`).
- Disponibilidad en formato ONNX para inferencia rápida en CPU con RapidOCR.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o visión general: es un modelo especializado de OCR.

## Casos de uso

- Digitalización de archivos y documentos administrativos en ruso: el modelo transcribe lineas de texto escaneado con puntuaciones de confianza por linea, lo que permite marcar manualmente las lineas de baja certeza en lugar de revisar todo el documento.
- Procesamiento de documentos de Asia Central: al cubrir kazajo, uzbeko, kirguís, tayiko y mongol, permite construir un único pipeline OCR para documentos multilingües de la región sin cambiar de modelo por idioma.
- Extracción de datos de facturas y formularios impresos: combinado con el detector PP-OCRv6_medium_det, se pueden localizar y transcribir campos de texto para su posterior parseo estructurado.
- Reconocimiento de manuscritos en ruso: útil para digitalizar notas y formularios cumplimentados a mano con letra clara, con revisión humana de las lineas de baja confianza.
- OCR en dispositivos sin GPU: la variante ONNX con RapidOCR está pensada para inferencia rápida en CPU, lo que habilita su despliegue en servidores modestos, portátiles o entornos de escritorio.
- Indexación y búsqueda full-text de corpus escaneados: la transcripción de documentos en cirílico permite alimentar motores de búsqueda o sistemas de recuperación de información sobre archivos que antes solo existían como imagen.
- Preprocesado para pipelines de NLP en ruso: la salida del OCR sirve como entrada a modelos de lenguaje o de extracción de entidades para tareas posteriores de análisis documental.

## Benchmarks y rendimiento

La model card referencia dos benchmarks: uno multilingüe cirílico y otro específico de ruso (`metrika-labs/ru-ocr-benchmark-hard`), descritos como benchmarks de OCR con distorsiones, defectos de impresión e imágenes de baja calidad. Los resultados se presentan en imágenes dentro de la model card, no como tablas de texto, por lo que no se dispone de cifras numéricas verificables en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| Benchmark multilingüe cirílico (Metrika Labs) | cifras no disponibles en texto (presentadas solo como imagen) |
| ru-ocr-benchmark-hard (ruso) | cifras no disponibles en texto (presentadas solo como imagen) |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de aproximadamente 0,1 GB, lo que sugiere requisitos de memoria muy reducidos, pero no se publican cifras de VRAM.
- GPU recomendadas: no se especifican modelos concretos. La model card recomienda PaddlePaddle para GPU y RapidOCR/ONNX para CPU.
- Compatibilidad con GPU de consumo: por el tamaño del repositorio (0,1 GB) es previsible que quepa en cualquier GPU de consumo, aunque no se confirma oficialmente.
- Opciones de despliegue: PaddleOCR con PaddlePaddle (recomendado para GPU); RapidOCR con el modelo ONNX (recomendado para CPU); el pipeline completo requiere además el detector PP-OCRv6_medium_det.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PP-OCRv6_medium_rec_cyrillic | no disponible | no aplica | 11 declarados (cirilico) | Apache 2.0 | PaddlePaddle, ONNX (variante) |
| PP-OCRv6_tiny_rec_cyrillic (Metrika Labs) | no disponible (variante tiny) | no aplica | cirilico | Apache 2.0 | PaddlePaddle, ONNX (variante) |
| PaddlePaddle/PP-OCRv6_medium_rec (base) | no disponible | no aplica | no disponible | no disponible | PaddlePaddle |

La comparativa interna de la model card muestra un ejemplo cualitativo: en la muestra "Мир меняется быстро", la variante Medium obtiene una puntuación de 0,9882 frente a 0,8412 de la variante Tiny, lo que sugiere mayor precisión del modelo Medium. No se dispone de datos comparativos con OCR de terceros (Tesseract, EasyOCR, etc.) en la información proporcionada.

## Limitaciones y advertencias

- La escritura manuscrita solo está soportada en ruso; para otras lenguas cirílicas el modelo está orientado a texto impreso.
- El reconocimiento de caligrafía cursiva o poco legible puede producir errores; la propia model card advierte sobre ello.
- Es un modelo de reconocimiento de lineas de texto: requiere un detector (por ejemplo, PP-OCRv6_medium_det) para funcionar sobre documentos completos.
- No se detallan sesgos conocidos ni tasas de alucinación medibles; al ser un modelo OCR, el riesgo principal es la sustitución de caracteres (confusiones entre glifos cirílicos similares) más que la generación de contenido inventado.
- La cobertura de idiomas declarada (11) es menor que la lista de lenguas presentes en el entrenamiento; la calidad en las lenguas no declaradas puede ser inferior.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base PaddlePaddle/PP-OCRv6_medium_rec y de las dependencias (PaddleOCR, RapidOCR).
- El ajuste del preprocesado (`ReisizeNorm`) que aparece en el ejemplo de uso modifica internamente el pipeline de PaddleOCR; cambios de versión de la librería podrían romper esa integración.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y poca validación por parte de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/metrika-labs/PP-OCRv6_medium_rec_cyrillic
- Variante ONNX (RapidOCR, CPU): https://huggingface.co/metrika-labs/PP-OCRv6_medium_rec_cyrillic_onnx
- Variante Tiny ONNX (RapidOCR, CPU): https://huggingface.co/metrika-labs/PP-OCRv6_tiny_rec_cyrillic_onnx
- Variante Tiny (PaddlePaddle, GPU): https://huggingface.co/metrika-labs/PP-OCRv6_tiny_rec_cyrillic
- Colección Cyrillic OCR: https://huggingface.co/collections/metrika-labs/cyrillic-ocr
- Repositorio GitHub: https://github.com/metrika-labs/PP-OCRv6_rec_cyrillic
- Dataset de benchmark en ruso: https://huggingface.co/datasets/metrika-labs/ru-ocr-benchmark-hard
- Dataset de manuscritos HWR200: https://huggingface.co/datasets/AntiplagiatCompany/HWR200
- Repositorio original PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Repositorio RapidOCR: https://github.com/RapidAI/RapidOCR
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec

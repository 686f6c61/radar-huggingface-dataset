# metrika-labs/PP-OCRv6_tiny_rec_cyrillic

## Resumen

PP-OCRv6_tiny_rec_cyrillic es un modelo de reconocimiento óptico de caracteres (OCR) especializado en texto cirílico, desarrollado por Metrika Labs como un ajuste fino del modelo base PaddlePaddle/PP-OCRv6_tiny_rec. Se trata de un modelo de reconocimiento de texto (la etapa de *recognition* del pipeline OCR, no la de detección) que convierte recortes de imagen de líneas de texto en cadenas de caracteres, y que forma parte de la familia PP-OCRv6 de PaddlePaddle, caracterizada por su ligereza y velocidad de inferencia.

El modelo resuelve el problema del OCR multilingüe en alfabeto cirílico, un nicho tradicionalmente mal cubierto por los modelos OCR genéricos, que suelen estar dominados por el inglés y el chino. Metrika Labs lo entrenó sobre 7,5 millones de ejemplos de texto impreso y manuscrito, con un 80 % en ruso y el resto repartido entre kazajo, bielorruso, uzbeko, tayiko, ucraniano, búlgaro, serbio, macedonio, tártaro, kirguís, mongol y otras lenguas cirílicas.

Es relevante ahora porque ofrece una alternativa Apache 2.0, ligera y desplegable en CPU (vía ONNX/RapidOCR) o GPU (vía PaddlePaddle) para digitalización de documentos en lenguas de la antigua URSS y los Balcanes, un mercado con poca oferta específica. La variante *tiny* prioriza velocidad y huella reducida frente a la variante *medium*, con una precisión algo menor en imágenes degradadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de reconocimiento de texto PP-OCRv6 (familia PaddleOCR); detalles internos de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje); entrada de imagen de línea de texto |
| Tipos de cuantizacion | no disponible en la model card; existe variante ONNX para CPU |
| Idiomas soportados | ru, kk, be, uz, tg, uk, bg, sr, tt, ky, mn (y otras lenguas cirílicas según la model card: macedonio, bashkir, osetio, chuvasio, checheno, yakuto, avar) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos PaddlePaddle (librería PaddleOCR); variante ONNX publicada en repo separado |
| Tarea | image-to-text (reconocimiento de líneas de texto) |
| Modelo base | PaddlePaddle/PP-OCRv6_tiny_rec |
| Datos de entrenamiento | 7,5 millones de ejemplos (80 % ruso, 20 % otras lenguas cirílicas) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (*finetune*) del reconocedor PP-OCRv6_tiny de PaddlePaddle, un modelo ligero de la familia PP-OCRv6 orientada a OCR rápido. La arquitectura concreta (número de capas, dimensión de embeddings, mecanismo de atención o CTC) no se detalla en la model card; se trata de un reconocedor de secuencias que procesa una imagen de línea de texto normalizada y emite la cadena de caracteres correspondiente. El pipeline completo de OCR combina este reconocedor con un modelo de detección independiente (PP-OCRv6_small_det en el ejemplo de uso).

El entrenamiento lo realizó Metrika Labs sobre 7,5 millones de ejemplos variados de texto impreso y manuscrito, procedentes de escaneos reales de documentos e imágenes sintéticas. La distribución lingüística es del 80 % ruso y el 20 % restante repartido entre kazajo, bielorruso, uzbeko, tayiko, ucraniano, búlgaro, serbio, macedonio, tártaro, kirguís, mongol, bashkir, osetio, chuvasio, checheno, yakuto, avar y otras lenguas cirílicas. No se especifica en la información disponible si hubo etapas de RLHF, DPO ni el número exacto de tokens o épocas. Una innovación destacable del ecosistema es la disponibilidad de una variante ONNX para inferencia rápida en CPU con RapidOCR, y el ejemplo de la model card incluye un parche de preprocesamiento (`resize_norm_img`) para ajustar la relación de aspecto de entrada.

## Capacidades

- Reconocimiento de texto impreso en alfabeto cirílico para once lenguas declaradas (ruso, kazajo, bielorruso, uzbeko, tayiko, ucraniano, búlgaro, serbio, tártaro, kirguís, mongol) y otras lenguas cirílicas adicionales.
- Reconocimiento de texto manuscrito, limitado actualmente al ruso; lee bien escritura clara pero puede fallar con cursiva o caligrafía poco legible.
- Salida de texto con puntuación de confianza por línea (`rec_scores`), útil para filtrado y control de calidad.
- Integración en pipeline completo de OCR con detección de líneas de texto (PP-OCRv6_small_det) mediante PaddleOCR.
- Inferencia en CPU mediante la variante ONNX y RapidOCR, y en GPU mediante PaddlePaddle.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de visión puro de reconocimiento de texto.
- No dispone de modo *thinking*, visión general, audio ni capacidades conversacionales.

## Casos de uso

- Digitalización de archivos y documentos históricos en ruso y otras lenguas cirílicas: el modelo reconoce texto impreso de escaneos reales, incluidos ejemplos con distorsiones y defectos de impresión, lo que lo hace adecuado para proyectos de preservación documental.
- Procesamiento de facturas y formularios en mercados de la CEI y los Balcanes: combinado con el detector PP-OCRv6_small_det, extrae líneas de texto de documentos administrativos en kazajo, uzbeko o serbio, lenguas con poca cobertura en OCR comerciales.
- Digitalización de manuscritos en ruso: la model card indica soporte de escritura manual clara en ruso, útil para digitalizar notas y formularios rellenados a mano, con la advertencia de posibles errores en cursiva.
- OCR en dispositivos de borde o entornos sin GPU: la variante ONNX con RapidOCR permite inferencia rápida en CPU, adecuada para escáneres conectados, quioscos o aplicaciones de escritorio.
- Extracción de texto para pipelines de búsqueda y análisis documental: la salida con puntuaciones de confianza permite filtrar líneas dudosas antes de indexar el texto en sistemas de búsqueda o RAG.
- Procesamiento por lotes de grandes volúmenes de escaneos: al ser un modelo *tiny* orientado a velocidad, es adecuado para trabajos de digitalización masiva donde el coste computacional por página es crítico.
- Análisis de documentos multilingües en organismos públicos de países con varias lenguas cirílicas oficiales, como Serbia (cirílico y latino) o Kazajistán (kazajo y ruso).

## Benchmarks y rendimiento

La model card incluye gráficas de resultados en benchmarks de OCR con distorsiones, defectos de impresión e imágenes de baja calidad, así como un benchmark específico de ruso (`ru-ocr-benchmark-hard`), pero los valores numéricos no están disponibles en el texto proporcionado (solo se muestran como imágenes). El único dato numérico textual es un ejemplo cualitativo de la propia model card:

| Ejemplo | Modelo | Texto reconocido | Confianza |
|---|---|---|---|
| Muestra 1 | PP-OCRv6 Medium | "Мир меняется быстро" | 0.9882 |
| Muestra 1 | PP-OCRv6 Tiny | "Пир меняется быстро" (error) | 0.8412 |

Este ejemplo ilustra que la variante *tiny* comete errores de carácter que la variante *medium* evita, con una confianza notablemente inferior. No se han publicado en la información disponible resultados numéricos completos de benchmarks (MMLU, HumanEval, GSM8K no aplican; métricas OCR como exactitud por carácter o palabra no están disponibles).

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo *tiny* de reconocimiento de texto, la huella es reducida y cabe holgadamente en GPU de consumo, aunque no se publican cifras exactas.
- GPU recomendadas: cualquier GPU compatible con PaddlePaddle-GPU; para un modelo *tiny* bastan tarjetas de gama media como RTX 3060 o superiores; A100/H100 no son necesarias.
- CPU: la variante ONNX con RapidOCR está recomendada explícitamente para CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con varios GB de VRAM; no se especifica el mínimo exacto.
- Opciones de despliegue: PaddleOCR con PaddlePaddle (GPU), RapidOCR con ONNX (CPU), descarga vía `huggingface_hub.snapshot_download`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas cirílicos | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| PP-OCRv6_tiny_rec_cyrillic (este) | Reconocedor OCR tiny | 11+ lenguas cirílicas | PaddlePaddle / ONNX | Apache 2.0 | Variante rápida, menor precisión que medium |
| PP-OCRv6_medium_rec_cyrillic | Reconocedor OCR medium | 11+ lenguas cirílicas | PaddlePaddle / ONNX | Apache 2.0 | Mayor precisión, más coste computacional |
| PaddlePaddle/PP-OCRv6_tiny_rec (base) | Reconocedor OCR tiny | No especificado (modelo base) | PaddlePaddle | no disponible | Modelo original sin ajuste cirílico |
| Tesseract OCR | OCR clásico | Amplio soporte cirílico | Motor propio | Apache 2.0 | No es un modelo neuronal de la misma familia; comparación cualitativa |

No se dispone de datos de rendimiento comparativos numéricos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El reconocimiento de texto manuscrito solo está soportado en ruso; para otras lenguas cirílicas el modelo está limitado a texto impreso.
- Puede cometer errores en cursiva o caligrafía poco legible, incluso en ruso, como muestra el ejemplo de la model card.
- La variante *tiny* presenta menor precisión que la *medium*: en el ejemplo documentado confunde "Мир" con "Пир" con una confianza de 0.8412 frente a 0.9882 del modelo medium.
- Es un modelo de reconocimiento de líneas de texto, no un OCR de página completa: requiere un modelo de detección previo (por ejemplo, PP-OCRv6_small_det) para funcionar en documentos completos.
- No es un modelo de lenguaje: no genera texto libre, no razona y no soporta agentes ni tool calling; cualquier expectativa en ese sentido es un error de uso.
- La distribución de entrenamiento está sesgada hacia el ruso (80 %), por lo que el rendimiento en las demás lenguas cirílicas puede ser inferior.
- No se publican métricas detalladas de sesgo, tasas de alucinación (no aplica en sentido estricto, pero sí errores de reconocimiento) ni evaluación por lengua individual.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los modelos de detección y del ecosistema PaddleOCR que se combinen con él.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/metrika-labs/PP-OCRv6_tiny_rec_cyrillic
- Variante ONNX para CPU: https://huggingface.co/metrika-labs/PP-OCRv6_tiny_rec_cyrillic_onnx
- Variante medium (PaddlePaddle): https://huggingface.co/metrika-labs/PP-OCRv6_medium_rec_cyrillic
- Variante medium ONNX: https://huggingface.co/metrika-labs/PP-OCRv6_medium_rec_cyrillic_onnx
- Colección Cyrillic OCR: https://huggingface.co/collections/metrika-labs/cyrillic-ocr
- Repositorio GitHub de Metrika Labs: https://github.com/metrika-labs/PP-OCRv6_rec_cyrillic
- Dataset de benchmark ruso: https://huggingface.co/datasets/metrika-labs/ru-ocr-benchmark-hard
- Dataset de escritura manual HWR200: https://huggingface.co/datasets/AntiplagiatCompany/HWR200
- Repositorio PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Repositorio RapidOCR: https://github.com/RapidAI/RapidOCR

# metrika-labs/PP-OCRv6_medium_rec_cyrillic_safetensors

## Resumen

PP-OCRv6_medium_rec_cyrillic_safetensors es un modelo de reconocimiento óptico de caracteres (OCR) especializado en texto cirílico, desarrollado por Metrika Labs como un ajuste fino (fine-tune) del modelo base PaddlePaddle/PP-OCRv6_medium_rec. Se trata de un modelo de reconocimiento de texto (recognition, no detección) que convierte imágenes de líneas de texto en cadenas de caracteres, y que forma parte de la familia PP-OCRv6 de PaddlePaddle, caracterizada por su ligereza y velocidad.

El modelo resuelve el problema del reconocimiento de texto impreso y manuscrito en 11 idiomas que emplean el alfabeto cirílico (ruso, kazajo, bielorruso, uzbeco, tayiko, ucraniano, búlgaro, serbio, tártaro, kirguís y mongol), con especial énfasis en el ruso, que representa el 80% de los ejemplos de entrenamiento. Con 15.729.524 parámetros y un tamaño de repositorio de 0,1 GB, está diseñado para inferencia rápida tanto en CPU como en GPU.

Su relevancia radica en que cubre un nicho poco atendido por los grandes modelos visión-lenguaje: el OCR cirílico de alta calidad en entornos de producción con recursos limitados. Al estar disponible en formato safetensors y contar con una variante ONNX para RapidOCR, facilita su integración en pipelines existentes de digitalización documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-OCRv6 (reconocimiento de texto, backbone MetaFormer-style con reparameterización estructural) |
| Parametros totales | 15.729.524 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de reconocimiento de líneas de texto, no de secuencias largas) |
| Tipos de cuantizacion | no disponible (existe variante ONNX para CPU; no se detallan cuantizaciones) |
| Idiomas soportados | ru, kk, be, uz, tg, uk, bg, sr, tt, ky, mn |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (variante ONNX disponible en otro repositorio) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura PP-OCRv6 de PaddlePaddle, que rediseña el backbone, el cuello de detección y el cuello de reconocimiento en torno a un bloque constructivo unificado de estilo MetaFormer con reparameterización estructural. La familia PP-OCRv6 abarca desde 1,5M hasta 34,5M de parámetros, y este modelo medium concreto cuenta con 15,7M de parámetros, lo que lo sitúa en un punto intermedio de la gama.

El ajuste fino fue realizado por Metrika Labs sobre 7,5 millones de ejemplos variados de texto impreso y manuscrito procedentes de escaneos reales de documentos e imágenes sintéticas. El 80% de los ejemplos son en ruso y el 20% restante cubre kazajo, bielorruso, uzbeco, tayiko, ucraniano, búlgaro, serbio, macedonio, tártaro, kirguís, mongol, bashkir, osetio, chuvasio, checheno, yakuto, avar y otras lenguas que usan cirílico. No se detalla en la información disponible si se emplearon técnicas de RLHF o DPO, algo poco habitual en modelos de OCR.

## Capacidades

- Reconocimiento de texto impreso en 11 idiomas cirílicos (ruso, kazajo, bielorruso, uzbeco, tayiko, ucraniano, búlgaro, serbio, tártaro, kirguís y mongol).
- Reconocimiento de texto manuscrito, actualmente solo en ruso; lee bien la escritura clara pero puede fallar con cursiva o caligrafía poco legible.
- Conversión de imagen de línea de texto a cadena de caracteres con puntuación de confianza por resultado (rec_scores).
- Integración con el pipeline completo de PaddleOCR (detección + reconocimiento) mediante el motor transformers.
- Variante ONNX para inferencia rápida en CPU con RapidOCR.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo puramente de reconocimiento de texto.
- No soporta visión general, audio ni generación de texto libre; su salida se limita a la transcripción de texto.

## Casos de uso

- Digitalización de archivos y documentos históricos en cirílico: el modelo reconoce texto impreso de escaneos rusos, ucranianos o serbios, lo que permite convertir corpus documentales en texto indexable y buscar en ellos.
- Procesamiento de facturas y formularios en ruso: combinado con el detector PP-OCRv6_medium_det, extrae los campos de texto de documentos administrativos con puntuaciones de confianza que permiten filtrar resultados dudosos.
- Reconocimiento de matrículas y señalética en países de la CEI: su ligereza (15,7M de parámetros) permite desplegarlo en dispositivos de borde o en servidores modestos para lectura de texto en imágenes de cámaras.
- Digitalización de manuscritos rusos: aunque limitado a escritura clara, puede emplearse para transcribir notas y formularios manuscritos en ruso, con revisión humana de los casos de baja confianza.
- Extracción de texto en aplicaciones móviles offline: la variante ONNX con RapidOCR posibilita ejecutar el reconocimiento en CPU sin conexión, útil para apps de escaneo de documentos en kazajo, tártaro o kirguís.
- Pipeline de accesibilidad: convertir imágenes de texto cirílico en voz o en texto legible para personas con discapacidad visual, integrándolo con un motor TTS tras el reconocimiento.
- Indexación de bibliotecas digitales multilingües: el soporte de 11 idiomas cirílicos permite procesar colecciones mixtas sin cambiar de modelo, reduciendo la complejidad del pipeline.

## Benchmarks y rendimiento

La model card incluye gráficas de resultados en benchmarks de OCR con distorsiones, defectos de impresión e imágenes de baja calidad, así como en el benchmark ruso [ru-ocr-benchmark-hard](https://huggingface.co/datasets/metrika-labs/ru-ocr-benchmark-hard), pero los valores numéricos no se detallan en la información proporcionada. El único dato concreto disponible es un ejemplo cualitativo: para la imagen de muestra, PP-OCRv6 Medium transcribe "Мир меняется быстро" con puntuación 0,9882, frente a "Пир меняется быстро" con 0,8412 de la variante Tiny.

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo de OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 15,7M de parámetros en precisión completa el modelo ocupa aproximadamente 63 MB, y en FP16 unos 31 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 4090, A100 o H100 ofrecen un enorme margen, pero el modelo está pensado para ejecutarse incluso en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en iGPU y dispositivos de borde.
- Opciones de despliegue: PaddleOCR con motor transformers (recomendado para GPU), RapidOCR con ONNX (recomendado para CPU), y el pipeline completo de PaddleX.
- Latencia y throughput estimados: no disponibles en la información proporcionada; la familia PP-OCRv6 se describe como "fast, lightweight" y la variante ONNX está optimizada para CPU, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| PP-OCRv6_medium_rec_cyrillic (este) | 15,7M | 11 cirílicos | safetensors / ONNX | apache-2.0 | Fine-tune de Metrika Labs sobre PP-OCRv6 medium |
| PP-OCRv6_tiny_rec_cyrillic | no disponible (gama tiny de PP-OCRv6, desde 1,5M) | 11 cirílicos | safetensors / ONNX | apache-2.0 | Más rápido pero menos preciso (ejemplo: 0,8412 frente a 0,9882) |
| PP-OCRv6_medium_rec (base PaddlePaddle) | 15,7M (aproximado, misma arquitectura) | no disponible | safetensors | no disponible | Modelo base sin especialización cirílica |
| PP-OCRv6 (gama completa) | 1,5M a 34,5M | no disponible | varios | no disponible | Colección oficial de PaddlePaddle |

No se dispone de datos de benchmarks comparativos numéricos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El reconocimiento de texto manuscrito solo está soportado en ruso; para el resto de idiomas cirílicos el modelo está entrenado únicamente con texto impreso.
- Puede cometer errores con escritura cursiva o caligrafía poco legible, incluso en ruso.
- El 80% de los datos de entrenamiento son en ruso, por lo que el rendimiento en kazajo, tártaro, kirguís o mongol puede ser inferior y no se documenta con métricas.
- Riesgo de alucinación de caracteres: como todo modelo de OCR, puede producir transcripciones plausibles pero incorrectas en imágenes de baja calidad; conviene usar las puntuaciones de confianza para filtrar.
- Es un modelo de reconocimiento, no de detección: requiere un detector (por ejemplo PP-OCRv6_medium_det) para localizar las líneas de texto en la imagen completa.
- La licencia apache-2.0 permite uso comercial, pero el modelo base PaddlePaddle/PP-OCRv6_medium_rec debe verificarse por separado si se redistribuye.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-08) es futura respecto a la fecha habitual de consulta, lo que conviene tener en cuenta al evaluar su madurez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/metrika-labs/PP-OCRv6_medium_rec_cyrillic_safetensors
- Repositorio GitHub de Metrika Labs: https://github.com/metrika-labs/PP-OCRv6_rec_cyrillic
- Colección Cyrillic OCR en Hugging Face: https://huggingface.co/collections/metrika-labs/cyrillic-ocr
- Variante ONNX para RapidOCR: https://huggingface.co/metrika-labs/PP-OCRv6_medium_rec_cyrillic_onnx
- Variante Tiny ONNX: https://huggingface.co/metrika-labs/PP-OCRv6_tiny_rec_cyrillic_onnx
- Variante Tiny PaddlePaddle: https://huggingface.co/metrika-labs/PP-OCRv6_tiny_rec_cyrillic
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec
- Benchmark ruso: https://huggingface.co/datasets/metrika-labs/ru-ocr-benchmark-hard
- Dataset de manuscritos HWR200: https://huggingface.co/datasets/AntiplagiatCompany/HWR200
- Repositorio PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Repositorio RapidOCR: https://github.com/RapidAI/RapidOCR
- Colección PP-OCRv6 de PaddlePaddle: https://huggingface.co/collections/PaddlePaddle/pp-ocrv6

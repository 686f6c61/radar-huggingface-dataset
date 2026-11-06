# metrika-labs/PP-OCRv6_tiny_rec_cyrillic_onnx

## Resumen

PP-OCRv6_tiny_rec_cyrillic_onnx es un modelo de reconocimiento óptico de caracteres (OCR) especializado en texto cirílico, desarrollado por Metrika Labs a partir del modelo base PaddlePaddle/PP-OCRv6_tiny_rec. Se distribuye en formato ONNX para inferencia rápida en CPU mediante RapidOCR y está pensado como el componente de reconocimiento (rec) de un pipeline OCR completo que combine detección y reconocimiento de texto. Su tamaño es reducido (variante "tiny" de la familia PP-OCRv6), lo que lo hace adecuado para despliegues con recursos limitados.

El modelo cubre once idiomas con alfabeto cirílico (ruso, kazajo, bielorruso, uzbeko, tayiko, ucraniano, búlgaro, serbio, tártaro, kirguís y mongol) y fue entrenado sobre 7,5 millones de ejemplos de texto impreso y manuscrito procedentes de escaneos reales de documentos e imágenes sintéticas, con un 80 % de los ejemplos en ruso. La versión actual solo soporta escritura manuscrita en ruso.

Es relevante para proyectos de digitalización documental en entornos cirílicos donde no se dispone de GPU, ya que el formato ONNX y la integración con RapidOCR permiten ejecutar el reconocimiento en CPU con una latencia baja. La ficha se centra en la variante tiny; existe una variante medium del mismo autor con mayor precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconocimiento de texto de la familia PP-OCRv6, basado en PaddleOCR) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen con forma 3x48x640) |
| Tipos de cuantización | no disponible (se distribuye como modelo ONNX; el autor no detalla variantes cuantizadas) |
| Idiomas soportados | ru, kk, be, uz, tg, uk, bg, sr, tt, ky, mn (manuscrito solo en ruso) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`inference.onnx`) con fichero de claves `rec_keys.txt` |

## Arquitectura y entrenamiento

El modelo es un reconocedor de texto de la familia PP-OCRv6 de PaddlePaddle, adaptado por Metrika Labs para el alfabeto cirílico. La información disponible no detalla la arquitectura interna (tipo de backbone, número de capas o mecanismo de decodificación). La entrada se normaliza a una imagen de forma 3x48x640 y la salida es texto reconocido con una puntuación de confianza por línea.

El entrenamiento se realizó sobre 7,5 millones de ejemplos variados de texto impreso y manuscrito, procedentes de escaneos reales de documentos e imágenes sintéticas. El 80 % de los ejemplos están en ruso; el 20 % restante cubre kazajo, bielorruso, uzbeko, tayiko, ucraniano, búlgaro, serbio, macedonio, tártaro, kirguís, mongol, bashkir, osetio, chuvasio, checheno, yakuto, avar y otras lenguas que usan cirílico. No se indica si hubo ajuste fino con RLHF/DPO ni el número total de tokens o pasos de entrenamiento.

## Capacidades

- Reconocimiento de texto impreso en once idiomas cirílicos.
- Reconocimiento de texto manuscrito únicamente en ruso; lee bien la escritura clara, pero puede fallar con cursiva o caligrafía poco legible.
- Salida de texto por línea con puntuación de confianza (score) asociada a cada detección.
- Integración como componente de reconocimiento en pipelines de OCR con detección previa (RapidOCR o PaddleOCR).
- Inferencia en CPU mediante ONNX Runtime; soporte de DirectML para GPU AMD o Intel.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo especializado de image-to-text.

## Casos de uso

- Digitalización de documentos escaneados en ruso: el modelo reconoce líneas de texto impreso en escaneos reales, lo que permite extraer texto de facturas, contratos o formularios sin GPU, usando RapidOCR sobre CPU.
- Procesamiento de archivos multilingües cirílicos: al cubrir once idiomas, un mismo pipeline puede reconocer documentos en kazajo, ucraniano o búlgaro sin cambiar de modelo, útil en organismos con fondos documentales mixtos.
- Extracción de texto de imágenes de baja calidad: el autor publica benchmarks específicos con distorsiones, defectos de impresión e imágenes de baja calidad, lo que respalda su uso en digitalizaciones heredadas.
- Digitalización de manuscritos rusos: para notas o formularios manuscritos en ruso con escritura clara; conviene validar la confianza por línea antes de dar por buena la transcripción.
- OCR embebido en aplicaciones de escritorio o servidores sin GPU: el formato ONNX y la integración con RapidOCR permiten desplegar el reconocimiento en entornos con CPU únicamente, con un consumo de memoria reducido.
- Preprocesado para pipelines de búsqueda documental: el texto reconocido puede indexarse en un motor de búsqueda o pasarse a un modelo de lenguaje para tareas posteriores de extracción de entidades.
- Procesamiento por lotes de imágenes en servidores modestos: al ser la variante tiny, prioriza el rendimiento sobre la precisión máxima, adecuado cuando el volumen es alto y la calidad de imagen es aceptable.

## Benchmarks y rendimiento

El autor publica gráficas de benchmark (benchmark cirílico multilingüe y benchmark en ruso) en la model card, pero no se incluyen los valores numéricos en la información proporcionada, por lo que no se pueden reproducir cifras concretas. El único dato numérico disponible es un ejemplo cualitativo de la propia model card: ante la imagen de muestra, la variante Medium reconoce "Мир меняется быстро" con score 0,9882, mientras que la variante Tiny produce "Пир меняется быстро" con score 0,8412, lo que ilustra la menor precisión de la variante tiny frente a la medium en ese caso.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo tiny en ONNX y ejecutarse habitualmente en CPU, el consumo de memoria es reducido, pero el autor no publica cifras.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU con ONNX Runtime. Para GPU se recomienda la variante PaddlePaddle del mismo autor (PP-OCRv6_tiny_rec_cyrillic).
- Cabe en GPU consumer: sí, por su tamaño reducido, aunque el caso de uso principal es CPU; con ONNX Runtime DirectML puede ejecutarse en GPU AMD o Intel.
- Opciones de despliegue: RapidOCR con ONNX Runtime (`rapidocr_onnxruntime`), ONNX Runtime DirectML para GPU AMD/Intel, y PaddleOCR para la variante PaddlePaddle.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PP-OCRv6_tiny_rec_cyrillic_onnx (este) | no disponible | imagen 3x48x640 | 11 cirílicos | apache-2.0 | ONNX |
| PP-OCRv6_medium_rec_cyrillic_onnx (Metrika Labs) | no disponible | imagen 3x48x640 | 11 cirílicos | apache-2.0 | ONNX |
| PP-OCRv6_tiny_rec_cyrillic (Metrika Labs) | no disponible | imagen 3x48x640 | 11 cirílicos | apache-2.0 | PaddlePaddle |
| PaddlePaddle/PP-OCRv6_tiny_rec (modelo base) | no disponible | imagen 3x48x640 | no disponible | no disponible | PaddlePaddle |

La comparativa se limita a las variantes del mismo autor y al modelo base, ya que la información proporcionada no incluye datos de otros reconocedores OCR cirílicos (por ejemplo, Tesseract o TrOCR) que permitan una comparación cuantitativa fiable. La diferencia principal entre variantes es la precisión (medium superior a tiny, según el ejemplo de la model card) y el backend de ejecución (ONNX/RapidOCR para CPU frente a PaddlePaddle para GPU).

## Limitaciones y advertencias

- La escritura manuscrita solo está soportada en ruso; en el resto de idiomas el modelo está entrenado para texto impreso.
- Puede fallar con cursiva o caligrafía poco legible, incluso en ruso.
- La variante tiny es menos precisa que la medium: en el ejemplo de la model card confunde "Мир" con "Пир" con un score de 0,8412, por lo que conviene usar umbrales de confianza y revisión humana en producción.
- El 80 % de los datos de entrenamiento son en ruso, lo que puede producir un sesgo de rendimiento hacia el ruso frente a los demás idiomas cirílicos.
- Riesgo de alucinación de caracteres en imágenes con ruido, distorsiones o defectos de impresión; el autor reconoce explícitamente estos escenarios como "challenging".
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del modelo base PaddlePaddle/PP-OCRv6_tiny_rec, cuya licencia no se detalla en la información disponible.
- El repositorio figura con 0 descargas y 0 likes, y el tamaño del repo se indica como 0.0 GB; no hay evidencia de adopción en producción.
- No es un modelo generativo ni conversacional: no soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/metrika-labs/PP-OCRv6_tiny_rec_cyrillic_onnx
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_rec
- Variante medium ONNX (RapidOCR): https://huggingface.co/metrika-labs/PP-OCRv6_medium_rec_cyrillic_onnx
- Variante tiny PaddlePaddle: https://huggingface.co/metrika-labs/PP-OCRv6_tiny_rec_cyrillic
- Variante medium PaddlePaddle: https://huggingface.co/metrika-labs/PP-OCRv6_medium_rec_cyrillic
- Colección Cyrillic OCR: https://huggingface.co/collections/metrika-labs/cyrillic-ocr
- Repositorio GitHub: https://github.com/metrika-labs/PP-OCRv6_rec_cyrillic
- Dataset de benchmark en ruso: https://huggingface.co/datasets/metrika-labs/ru-ocr-benchmark-hard
- Dataset de manuscritos HWR200: https://huggingface.co/datasets/AntiplagiatCompany/HWR200
- Repositorio PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Repositorio RapidOCR: https://github.com/RapidAI/RapidOCR

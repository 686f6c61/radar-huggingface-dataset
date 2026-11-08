# metrika-labs/PP-OCRv6_tiny_rec_cyrillic_safetensors

## Resumen

PP-OCRv6_tiny_rec_cyrillic_safetensors es un modelo de reconocimiento óptico de caracteres (OCR) especializado en texto cirílico, desarrollado por Metrika Labs como un ajuste fino del modelo base PaddlePaddle/PP-OCRv6_tiny_rec. Se trata de un modelo de reconocimiento de líneas de texto (image-to-text) que forma parte de la familia PP-OCRv6 de PaddlePaddle, orientada a inferencia rápida y ligera. Con tan solo 623.096 parámetros, está diseñado para ejecutarse en CPU y en hardware modesto sin sacrificar demasiado la calidad de reconocimiento en documentos reales.

El modelo resuelve el problema del reconocimiento de texto impreso y manuscrito en ruso y otras diez lenguas que emplean el alfabeto cirílico (kazajo, bielorruso, uzbeko, tayiko, ucraniano, búlgaro, serbio, tártaro, kirguís y mongol). Fue entrenado sobre 7,5 millones de ejemplos variados de texto impreso y manuscrito procedentes de escaneos reales de documentos e imágenes sintéticas, con un 80 % de los ejemplos en ruso y el 20 % restante repartido entre las demás lenguas cirílicas.

Su relevancia actual radica en que cubre un nicho poco atendido por los modelos OCR multilingües genéricos: el cirílico de calidad variable, con distorsiones, defectos de impresión e imágenes de baja calidad. Al publicarse en formato safetensors con licencia Apache 2.0 y estar disponible también en ONNX para RapidOCR, se posiciona como una opción práctica para pipelines de digitalización de documentos en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de reconocimiento de texto PP-OCRv6 (familia PaddleOCR, no disponible el detalle exacto de capas) |
| Parámetros totales | 623.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de reconocimiento de líneas de texto, no generativo) |
| Tipos de cuantización | no disponible (existe variante ONNX para inferencia en CPU) |
| Idiomas soportados | ru, kk, be, uz, tg, uk, bg, sr, tt, ky, mn |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también disponible en ONNX en otro repositorio) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia PP-OCRv6 de PaddlePaddle, una arquitectura de reconocimiento de texto diseñada para ser rápida y ligera. No es un transformer generativo ni un modelo de lenguaje: es un modelo de visión especializado en transcribir líneas de texto recortadas de imágenes a cadenas de caracteres. El repositorio declara la librería PaddleOCR y el pipeline image-to-text, y los pesos se distribuyen en formato safetensors con 623.096 parámetros, lo que confirma su carácter ultraligero.

El ajuste fino lo realizó Metrika Labs sobre 7,5 millones de ejemplos de texto impreso y manuscrito, extraídos de escaneos reales de documentos e imágenes sintéticas. El 80 % de los datos está en ruso y el 20 % restante cubre kazajo, bielorruso, uzbeko, tayiko, ucraniano, búlgaro, serbio, macedonio, tártaro, kirguís, mongol, bashkir, osetio, chuvasio, checheno, yakuto, avar y otras lenguas que usan cirílico. No se especifica en la información disponible si se emplearon técnicas de RLHF o DPO (poco probables en un modelo OCR de este tipo). Como innovación destacable, el modelo se integra con PaddleOCR y con RapidOCR vía ONNX para inferencia rápida en CPU.

## Capacidades

- Reconocimiento de texto impreso en once lenguas cirílicas: ruso, kazajo, bielorruso, uzbeko, tayiko, ucraniano, búlgaro, serbio, tártaro, kirguís y mongol.
- Reconocimiento de texto manuscrito, actualmente solo en ruso; lee bien la escritura clara pero puede fallar con cursiva o caligrafía poco legible.
- Transcripción de líneas de texto recortadas de imágenes de documentos, escaneos y fotografías.
- Funciona sobre imágenes con distorsiones, defectos de impresión y baja calidad, según los benchmarks del autor.
- Integración con el pipeline completo de PaddleOCR (detección + reconocimiento) y con RapidOCR en formato ONNX para CPU.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente; es un modelo puramente perceptivo de image-to-text.
- No soporta visión general, audio ni modo thinking.

## Casos de uso

- Digitalización de archivos rusos y postsoviéticos: el modelo transcribe líneas de texto de escaneos de documentos históricos y administrativos en ruso y otras lenguas cirílicas, con un entrenamiento específico sobre escaneos reales con defectos de impresión.
- Procesamiento de facturas y formularios en Cirílico: combinado con el detector PP-OCRv6_small_det, permite extraer campos de texto de documentos comerciales en ruso, kazajo o ucraniano en pipelines automatizados de contabilidad.
- OCR en dispositivos de borde y CPU: con 623.096 parámetros y variante ONNX para RapidOCR, puede ejecutarse en servidores sin GPU o en entornos con recursos limitados, reduciendo costes de infraestructura.
- Reconocimiento de manuscritos rusos en formularios: aunque limitado a escritura clara, sirve para digitalizar encuestas, partes médicos o registros manuscritos en ruso donde la caligrafía es legible.
- Indexación y búsqueda de corpus multilingües cirílicos: extracción de texto de imágenes para alimentar motores de búsqueda o sistemas de gestión documental en bibliotecas y archivos con material en varias lenguas cirílicas.
- Preprocesado para pipelines de NLP: transcripción de imágenes a texto que después se procesa con modelos de lenguaje o sistemas de traducción, actuando como primera etapa de un pipeline más amplio.
- Automatización de la lectura de matrículas, carteles o etiquetas en Cirílico: en logística o comercio internacional con productos etiquetados en ruso, kazajo o ucraniano.

## Benchmarks y rendimiento

La model card incluye gráficos de benchmarks (benchmark-cyrillic.png y benchmark-russian.png) y enlaza al dataset ru-ocr-benchmark-hard, pero los valores numéricos no están disponibles en la información proporcionada. El único dato cualitativo concreto es el ejemplo de la model card: para la imagen de muestra, PP-OCRv6 Medium obtiene la transcripción correcta "Мир меняется быстро" con score 0.9882, mientras que PP-OCRv6 Tiny produce "Пир меняется быстро" con score 0.8412.

| Benchmark | Resultado |
|---|---|
| Benchmark cirílico multilingüe | no disponible (solo gráfico en la model card) |
| Benchmark ruso (ru-ocr-benchmark-hard) | no disponible (solo gráfico en la model card) |
| Ejemplo cualitativo (muestra) | "Пир меняется быстро" (score 0.8412), frente a "Мир меняется быстро" (score 0.9882) del modelo Medium |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 623.096 parámetros, el modelo cabe holgadamente en cualquier GPU, e incluso puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en cualquier GPU consumer e incluso en dispositivos de borde; la variante ONNX está pensada explícitamente para CPU con RapidOCR.
- Opciones de despliegue: PaddleOCR con engine "transformers" (según el ejemplo de la model card), RapidOCR con ONNX, y el pipeline completo de PaddleOCR con detección PP-OCRv6_small_det.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia muy baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PP-OCRv6_tiny_rec_cyrillic (este) | 623.096 | 11 lenguas cirílicas | safetensors, ONNX | Apache 2.0 | Hugging Face |
| PP-OCRv6_medium_rec_cyrillic | no disponible | 11 lenguas cirílicas | safetensors, ONNX | Apache 2.0 | Hugging Face |
| PaddlePaddle/PP-OCRv6_tiny_rec (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| PP-OCRv6_tiny_rec_cyrillic_onnx | no disponible | 11 lenguas cirílicas | ONNX | Apache 2.0 | Hugging Face |

El modelo Medium de la misma familia ofrece mayor precisión (según el ejemplo cualitativo de la model card) a cambio de un mayor coste computacional; el modelo Tiny prioriza velocidad y ligereza. La variante ONNX es funcionalmente equivalente pero optimizada para CPU con RapidOCR. No se dispone de datos de benchmarks comparativos numéricos con otros modelos OCR externos en la información proporcionada.

## Limitaciones y advertencias

- El reconocimiento de texto manuscrito solo está soportado en ruso, y únicamente para escritura clara; la cursiva o caligrafía poco legible puede producir errores.
- El modelo es de reconocimiento de líneas de texto, no un OCR de página completa: requiere un detector previo (por ejemplo, PP-OCRv6_small_det) para localizar las líneas.
- Sesgos conocidos: el entrenamiento está dominado por el ruso (80 % de los datos), por lo que el rendimiento en las demás lenguas cirílicas puede ser inferior.
- Riesgo de alucinación o sustitución de caracteres en imágenes de baja calidad, como muestra el ejemplo "Пир" en lugar de "Мир" del modelo Tiny.
- Limitaciones de idioma: no cubre alfabetos latinos, griego, árabe ni otros sistemas de escritura; solo cirílico.
- Licencia Apache 2.0, que permite uso comercial sin restricciones adicionales, pero conviene revisar las licencias del modelo base y de los datasets de entrenamiento citados.
- Para producción, es recomendable validar el modelo con un conjunto propio de imágenes representativas del dominio, dado que no se publican métricas numéricas de benchmarks en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/metrika-labs/PP-OCRv6_tiny_rec_cyrillic_safetensors
- Repositorio GitHub de Metrika Labs: https://github.com/metrika-labs/PP-OCRv6_rec_cyrillic
- Variante ONNX (RapidOCR): https://huggingface.co/metrika-labs/PP-OCRv6_tiny_rec_cyrillic_onnx
- Variante Medium: https://huggingface.co/metrika-labs/PP-OCRv6_medium_rec_cyrillic
- Variante Medium ONNX: https://huggingface.co/metrika-labs/PP-OCRv6_medium_rec_cyrillic_onnx
- Colección Cyrillic OCR: https://huggingface.co/collections/metrika-labs/cyrillic-ocr
- Dataset de benchmark ruso: https://huggingface.co/datasets/metrika-labs/ru-ocr-benchmark-hard
- Dataset HWR200 (ejemplos de manuscritos): https://huggingface.co/datasets/AntiplagiatCompany/HWR200
- Repositorio original PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Repositorio RapidOCR: https://github.com/RapidAI/RapidOCR
- Registro Zenodo relacionado: https://zenodo.org/records/21788403

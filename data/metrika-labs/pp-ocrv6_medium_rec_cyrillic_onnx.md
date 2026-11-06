# metrika-labs/PP-OCRv6_medium_rec_cyrillic_onnx

## Resumen

PP-OCRv6_medium_rec_cyrillic_onnx es un modelo de reconocimiento óptico de caracteres (OCR) especializado en texto cirílico, desarrollado por Metrika Labs a partir de la familia PP-OCRv6 de PaddlePaddle. Se trata de la variante de reconocimiento (rec) de tamano medio, exportada a formato ONNX para inferencia eficiente en CPU mediante RapidOCR. El modelo resuelve la tarea de image-to-text: dada una imagen de texto ya recortada (una linea o region), devuelve la cadena de caracteres correspondiente.

El modelo se ha afinado sobre 7,5 millones de ejemplos de texto impreso y manuscrito procedentes de escaneos reales de documentos e imagenes sinteticas, con un 80 % de los ejemplos en ruso y el 20 % restante repartido entre kazajo, bielorruso, uzbeko, tayiko, ucraniano, bulgaro, serbio, macedonio, tatar, kirguis, mongol, bashkir, osetio, chuvasio, checheno, yakuto, avar y otras lenguas que emplean el alfabeto cirilico. Es relevante para pipelines de digitalizacion de documentos en entornos de habla rusa y de Asia Central, donde los OCR genericos suelen tener una cobertura limitada del cirilico.

La arquitectura subyacente es la red de reconocimiento de PP-OCRv6 (transformer ligero con modulo de atencion), distribuida como un unico fichero `inference.onnx` de aproximadamente 0,1 GB junto con el diccionario de caracteres `rec_keys.txt`. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de reconocimiento de texto PP-OCRv6 (transformer ligero con atencion), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo OCR por linea de texto; entrada de imagen 3x48x640) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica el ONNX de inferencia) |
| Idiomas soportados | ru, kk, be, uz, tg, uk, bg, sr, tt, ky, mn (y otras lenguas cirilicas segun la model card: macedonio, bashkir, osetio, chuvasio, checheno, yakuto, avar) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`inference.onnx`) + diccionario `rec_keys.txt` |

## Arquitectura y entrenamiento

El modelo es la etapa de reconocimiento de un pipeline OCR clasico de dos fases (deteccion de cajas de texto + reconocimiento). La red de reconocimiento de PP-OCRv6 procesa cada region recortada, normalizada a una forma de imagen de 3x48x640 canales x alto x ancho, y produce la secuencia de caracteres mediante un decodificador con atencion. La exportacion a ONNX permite ejecutar la inferencia con `onnxruntime` (y `onnxruntime-directml` para GPU AMD o Intel), sin dependencia del framework PaddlePaddle en produccion.

El entrenamiento se realizo sobre 7,5 millones de ejemplos de texto impreso y manuscrito, combinando escaneos reales de documentos con imagenes sinteticas, con un 80 % de contenido en ruso y el 20 % restante en otras lenguas cirilicas. La model card no detalla el numero exacto de tokens, la composicion precisa del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables de forma habitual en OCR). El modelo base es `PaddlePaddle/PP-OCRv6_medium_rec`, sobre el que Metrika Labs realizo el ajuste fino para el alfabeto cirilico.

## Capacidades

- Reconocimiento de texto impreso en cirilico para once idiomas declarados (ruso, kazajo, bielorruso, uzbeko, tayiko, ucraniano, bulgaro, serbio, tatar, kirguis, mongol) y otras lenguas cirilicas adicionales.
- Reconocimiento de texto manuscrito, limitado actualmente al ruso; lee bien la escritura clara pero puede fallar con cursiva o caligrafia poco legible.
- Salida con puntuacion de confianza por region reconocida (score entre 0 y 1), util para filtrado y control de calidad.
- Integracion con RapidOCR para pipelines completos de deteccion + reconocimiento.
- Inferencia en CPU gracias al formato ONNX, con soporte opcional de DirectML para GPU AMD e Intel.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo de image-to-text.
- No procesa documentos completos de forma autonoma: requiere una etapa previa de deteccion de cajas de texto.

## Casos de uso

- Digitalizacion de archivos administrativos en ruso: el modelo reconoce lineas de texto escaneado con distorsiones y defectos de impresion, adecuado para pipelines masivos de conversion de PDF a texto indexable.
- Procesamiento de documentos de identidad y formularios en lenguas de Asia Central: al cubrir kazajo, uzbeko, tayiko, kirguis y mongol, permite extraer campos de documentos oficiales en estos idiomas donde los OCR genericos fallan.
- Digitalizacion de correspondencia y manuscritos rusos: el soporte de escritura manuscrita en ruso permite transcribir notas y cartas con caligrafia clara, con la advertencia de revisar la cursiva.
- Extraccion de texto en aplicaciones moviles o de escritorio sin GPU: el formato ONNX y el reducido tamano (0,1 GB) permiten ejecutar la inferencia en CPU en portatiles y equipos de gama media.
- Analisis de documentos historicos y academicos en cirilico: util para proyectos de humanidades digitales que requieren transcribir corpus de texto impreso en bielorruso, ucraniano o serbio.
- Preprocesamiento para sistemas de busqueda y RAG sobre corpus documentales: la salida con score de confianza permite filtrar lineas mal reconocidas antes de indexarlas en un motor de busqueda o en una base vectorial.
- Automatizacion de la entrada de datos en entornos con GPU AMD o Intel: mediante `onnxruntime-directml` se puede acelerar la inferencia en hardware sin CUDA.

## Benchmarks y rendimiento

La model card incluye imagenes de benchmarks (benchmark multilingue cirilico y benchmark en ruso) y enlaza al dataset `metrika-labs/ru-ocr-benchmark-hard`, pero no se proporcionan los valores numericos en texto. No se han publicado resultados de benchmarks en la informacion disponible en forma de tabla numerica.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero ONNX ocupa aproximadamente 0,1 GB; la huella en memoria es muy reducida y no requiere GPU dedicada.
- GPU recomendadas: no es necesario GPU; funciona en CPU. Para aceleracion opcional, cualquier GPU AMD o Intel compatible con DirectML.
- Cabe en cualquier GPU consumer y en equipos sin GPU; el cuello de botella es la CPU en escenarios de alto volumen.
- Opciones de despliegue: RapidOCR con `onnxruntime` (recomendado por el autor para CPU), `onnxruntime-directml` para GPU AMD/Intel, y PaddlePaddle para GPU (variante no ONNX del mismo modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| PP-OCRv6_medium_rec_cyrillic_onnx (este) | OCR reconocimiento, tamano medio | 11+ cirilicos | ONNX | Apache 2.0 | Optimizado para CPU via RapidOCR |
| PP-OCRv6_tiny_rec_cyrillic_onnx | OCR reconocimiento, tamano tiny | 11+ cirilicos | ONNX | Apache 2.0 | Mas rapido, menor precision (ejemplo de la model card: confunde "Мир" con "Пир") |
| PP-OCRv6_medium_rec_cyrillic | OCR reconocimiento, tamano medio | 11+ cirilicos | PaddlePaddle | Apache 2.0 | Variante recomendada para GPU |
| PaddlePaddle/PP-OCRv6_medium_rec (base) | OCR reconocimiento, tamano medio | No especificado en la informacion | PaddlePaddle | no disponible | Modelo base sin ajuste cirilico |

## Limitaciones y advertencias

- El reconocimiento de escritura manuscrita solo esta soportado en ruso; en el resto de idiomas el modelo esta pensado para texto impreso.
- Puede cometer errores con cursiva o caligrafia poco legible, incluso en ruso.
- Es solo la etapa de reconocimiento: necesita un modelo de deteccion de texto previo para procesar documentos completos.
- Los benchmarks publicados en la model card son imagenes sin valores numericos en texto; no se dispone de cifras verificables de precision en esta ficha.
- No se detalla la composicion exacta del dataset de entrenamiento ni posibles sesgos derivados del predominio del ruso (80 % de los ejemplos).
- Riesgo de alucinacion: como todo OCR, puede producir caracteres plausibles pero incorrectos en imagenes de baja calidad; se recomienda usar el score de confianza para filtrar.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y las dependencias (PaddleOCR, RapidOCR, onnxruntime) deben verificarse por separado.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/metrika-labs/PP-OCRv6_medium_rec_cyrillic_onnx
- Variante tiny ONNX: https://huggingface.co/metrika-labs/PP-OCRv6_tiny_rec_cyrillic_onnx
- Variante medium PaddlePaddle: https://huggingface.co/metrika-labs/PP-OCRv6_medium_rec_cyrillic
- Variante tiny PaddlePaddle: https://huggingface.co/metrika-labs/PP-OCRv6_tiny_rec_cyrillic
- Coleccion Cyrillic OCR: https://huggingface.co/collections/metrika-labs/cyrillic-ocr
- Repositorio GitHub: https://github.com/metrika-labs/PP-OCRv6_rec_cyrillic
- Dataset de benchmark en ruso: https://huggingface.co/datasets/metrika-labs/ru-ocr-benchmark-hard
- Dataset de escritura manuscrita HWR200: https://huggingface.co/datasets/AntiplagiatCompany/HWR200
- Repositorio PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Repositorio RapidOCR: https://github.com/RapidAI/RapidOCR
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec

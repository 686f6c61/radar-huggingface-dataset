# codebucketsolutions/edge-punct-casing-en-onnx

## Resumen

Edge-Punct-Casing (English) ONNX es una conversión del modelo de puntuación y truecasing de Jian You (Cisco Systems), publicado originalmente junto al paper "A lightweight and efficient punctuation and word casing prediction model for on-device streaming ASR". El modelo resuelve un problema muy concreto en pipelines de reconocimiento de voz: los transcripts de ASR suelen carecer de signos de puntuación y de mayúsculas, lo que los hace difíciles de leer y de procesar aguas abajo. Este modelo añade comas, puntos y signos de interrogación tras cada palabra y predice si cada palabra va en minúsculas, con inicial mayúscula o en mayúsculas completas.

El repositorio que nos ocupa no es una release oficial del autor ni de sherpa-onnx, sino un empaquetado de los dos ficheros del paquete sherpa-onnx (`model.int8.onnx` y `bpe.vocab`) para que una página web pueda descargarlos directamente, ya que el paquete original solo se distribuye como archivo `.tar.bz2` en GitHub Releases. Los ficheros son idénticos a los del archivo `sherpa-onnx-online-punct-en-2024-08-06.tar.bz2`, con verificación SHA-256 incluida en la model card.

La arquitectura es una CNN-BiLSTM con vocabulario unigram de 5.000 piezas, diseñada explícitamente para inferencia en dispositivo y streaming. El modelo es monocapa en el sentido de que solo se distribuye la versión int8 (7,49 MB); la variante float32 (29,7 MB) del archivo original se omite. Está pensado para inglés y se integra en sherpa-onnx y en ONNX Runtime Web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN-BiLSTM (con tokenizador unigram BPE de 5.000 piezas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | chunks de hasta 200 tokens (con `<s>` y `</s>` incluidos); palabras individuales deben quedar por debajo de 190 bytes |
| Tipos de cuantizacion | int8 (única versión incluida en este repo); float32 disponible en el paquete original de sherpa-onnx pero no copiado aquí |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`, 7.490.500 bytes) + vocabulario `bpe.vocab` (149.430 bytes) |

## Arquitectura y entrenamiento

El modelo es una red CNN-BiLSTM que opera sobre piezas de un vocabulario unigram de 5.000 entradas. El pipeline de inferencia, según la model card, divide el texto por espacios ASCII, antepone `▁` a cada palabra y la segmenta en piezas del vocabulario eligiendo el corte con mayor suma de scores (float32), con desempate por la primera pieza más corta y `<unk>` (id 0) para bytes sin pieza asociada. Las piezas se agrupan en chunks de como máximo 200 tokens con `<s>` (id 1) y `</s>` (id 2), rellenando con 0, y se construye una máscara `valid_ids` que vale 1 para `<s>`, la primera pieza de cada palabra y `</s>`.

La salida son dos tensores float32 `[words, 4]`: `active_case_logits` y `active_punct_logits`, con una fila por palabra. La clase de casing se decide por argmax (0 = tal cual, 1 = todo mayúsculas, 2 = inicial mayúscula, 3 = mixto, se deja como está) y la de puntuación por argmax (0 = ninguna, 1 = coma, 2 = punto, 3 = interrogación), escribiéndose tras la palabra. Solo se modifican letras ASCII. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden al paper original y no se reproducen en este repositorio.

## Capacidades

- Predicción de puntuación: inserta comas, puntos y signos de interrogación tras las palabras de un transcript sin puntuar.
- Truecasing: decide entre minúsculas, inicial mayúscula, mayúsculas completas o dejar la palabra tal cual.
- Procesamiento por streaming: el diseño CNN-BiLSTM y el chunking de 200 tokens permiten alimentar texto de forma incremental.
- Tokenización unigram BPE integrada mediante `bpe.vocab` y simple-sentencepiece.
- Ejecución en navegador vía ONNX Runtime Web (la model card menciona el port en TypeScript de bolo que reproduce el comportamiento de sherpa-onnx).
- Integración con sherpa-onnx como `OnlinePunctuationCNNBiLSTMImpl` (identificador `punct-en-cnn-bilstm` en bolo).
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking: es un modelo auxiliar de post-procesado de texto.

## Casos de uso

- Post-procesado de transcripts ASR en producción: se sitúa detrás del reconocedor para añadir puntuación y mayúsculas antes de entregar el texto al usuario o almacenarlo, mejorando la legibilidad sin coste apreciable de cómputo gracias a sus 7,49 MB en int8.
- Subtitulado automático en tiempo real: al operar por chunks de 200 tokens y estar pensado para streaming, puede puntuar segmentos parciales de una transcripción en directo.
- Transcripción de reuniones y notas de voz: convierte la salida cruda de un ASR en texto con frases delimitadas, facilitando el resumen posterior por parte de un LLM.
- Indexación y búsqueda sobre transcripciones: la puntuación y el casing correctos mejoran la segmentación en frases y la calidad de los índices de búsqueda o de los embeddings.
- Ejecución en navegador sin servidor: gracias al formato ONNX y al port a ONNX Runtime Web, una página puede puntuar texto localmente sin enviar datos a un backend.
- Integración en pipelines sherpa-onnx existentes: se puede sustituir o añadir como etapa de puntuación en aplicaciones que ya usan sherpa-onnx para ASR en dispositivo.
- Normalización de texto para TTS: antes de sintetizar voz, aplicar puntuación y mayúsculas ayuda a que el motor TTS module las frases de forma natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el modelo int8 ocupa 7,49 MB en disco y su huella en memoria es del orden de decenas de MB, apta para cualquier GPU o incluso CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (por ejemplo, GTX 1050 o superior) es más que suficiente.
- Cabe en cualquier GPU consumer: sí, sin restricciones prácticas.
- Opciones de despliegue: sherpa-onnx (`OnlinePunctuationCNNBiLSTMImpl`), ONNX Runtime (incluido ONNX Runtime Web para navegador), y el port en TypeScript de bolo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo y el chunking de 200 tokens, se espera baja latencia, pero no se aportan cifras.
- Advertencia de implementación: una palabra de más de un chunk provoca un fallo en sherpa-onnx 2.0.1; mantener las palabras por debajo de 190 bytes.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto / chunk | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| edge-punct-casing-en-onnx (este) | CNN-BiLSTM, unigram 5k, int8 | 200 tokens por chunk | en | Apache-2.0 | ONNX int8 |
| frankyoujian/Edge-Punct-Casing (original) | CNN-BiLSTM, unigram 5k | mismo diseño | en | Apache-2.0 | pesos originales (formato no detallado en esta ficha) |
| sherpa-onnx-online-punct-en-2024-08-06 (paquete oficial) | CNN-BiLSTM, unigram 5k | 200 tokens por chunk | en | Apache-2.0 | ONNX int8 + float32 en `.tar.bz2` |

No se dispone de información sobre otros modelos comparables de puntuación y truecasing en la documentación proporcionada.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas.
- Solo modifica letras ASCII; caracteres no ASCII conservan su casing original.
- Solo inserta comas, puntos y signos de interrogación; no genera otros signos como exclamaciones, dos puntos o comillas.
- Una palabra de más de un chunk (más de 190 bytes de forma segura) provoca un fallo en sherpa-onnx 2.0.1.
- El repositorio no es una release oficial del autor ni de sherpa-onnx; es un reempaquetado de terceros. Conviene verificar los SHA-256 publicados antes de usarlo en producción.
- Solo se incluye la versión int8; si se necesita float32 hay que acudir al paquete original de sherpa-onnx.
- No se documentan sesgos específicos ni tasas de error en la información disponible; como todo modelo predictivo, puede introducir puntuación o mayúsculas incorrectas en textos ambiguos o con nombres propios.
- Licencia Apache-2.0: permite uso comercial, pero requiere mantener el aviso de licencia y la atribución correspondiente al autor original y a sherpa-onnx.
- No es un modelo generativo: no debe usarse para tareas de razonamiento, generación de código ni diálogo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/codebucketsolutions/edge-punct-casing-en-onnx
- Modelo base en Hugging Face: https://huggingface.co/frankyoujian/Edge-Punct-Casing
- Código del autor: https://github.com/frankyoujian/Edge-Punct-Casing
- Paquete original de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/download/punctuation-models/sherpa-onnx-online-punct-en-2024-08-06.tar.bz2
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Proyecto bolo (port a navegador): https://github.com/cB-Sigma/bolo-speech

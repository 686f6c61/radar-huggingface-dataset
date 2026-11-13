# audiojs/yamnet

## Resumen

YAMNet es un clasificador de eventos sonoros desarrollado por Manoj Plakal y Dan Ellis en Google, publicado originalmente dentro del repositorio `tensorflow/models` (rama `research/audioset/yamnet`). Se trata de una MobileNetV1 entrenada sobre AudioSet que asigna, mediante una sigmoide independiente por clase, una puntuación a cada una de las 521 clases de la ontología AudioSet para parches de 0,96 s de audio. El modelo que documenta esta ficha es la conversión a ONNX con pesos en float16 publicada por el usuario `audiojs`, orientada a su uso desde JavaScript mediante la librería `@audio/neural-tag`.

La relevancia de esta conversión es práctica: elimina la dependencia de TensorFlow y permite ejecutar el modelo en Node.js o en el navegador a través de `onnxruntime` y `onnxruntime-web`, con un fichero de solo 7,5 MB. El cálculo de las características log-mel se realiza en JavaScript replicando el comportamiento de `features.py` de TensorFlow, de modo que el modelo resultante es un clasificador de audio ligero, sin dependencias de Python ni de frameworks de deep learning pesados.

Arquitecturalmente es una CNN MobileNetV1 con 3.729.481 parámetros, entrada de parches `[n, 96, 64]` (96 tramas de 10 ms × 64 bandas mel) y salida `[n, 521]`. No es un modelo generativo ni un transformer: es un extractor de etiquetas de audio pensado para inferencia de baja latencia en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV1 (CNN con convoluciones depthwise separables), exportada a ONNX opset 17 |
| Parametros totales | 3.729.481 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de análisis de 0,96 s (96 tramas de 10 ms), con salto de 0,48 s entre parches |
| Tipos de cuantizacion | pesos float16 (con Cast a float32 en el grafo) para tensores de más de 1024 valores; sesgos y los tres primeros kernels en float32 |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`yamnet.fp16.onnx`, 7.495.175 bytes, SHA-256 `0a1f3b050ebfdfa651e78fb12714c3c1fe750ceebd58529818a1ddddec515688`) |

## Arquitectura y entrenamiento

YAMNet es una MobileNetV1 adaptada a clasificación de audio multi-etiqueta. La entrada son parches log-mel calculados a 16 kHz mono: la onda se rellena con ceros hasta al menos 15.600 muestras y luego hasta un múltiplo del hop; se enmarcan 400 muestras cada 160 con ventana Hann periódica; se aplica una FFT de 512 y se obtienen 64 bandas HTK-mel entre 125 y 7500 Hz, seguido de `ln(mel + 0.001)`. Se generan 96 tramas cada 48, es decir, un parche de 0,96 s cada 0,48 s. La red aplica 14 capas convolucionales con normalización por lotes (centro, sin escala, epsilon 1e-4) plegada en la convolución, padding "same" de TensorFlow explicitado por capa, global average pooling, una capa densa y una sigmoide por clase.

El entrenamiento original se realizó sobre AudioSet, un conjunto de eventos sonoros con 527 clases en su ontología; el modelo final cubre 521 clases tras eliminar seis por recomendación de revisores de equidad (las clases de Speech y Singing con género, Battle cry y Funny music). El modelo original se distribuye como `yamnet.h5` (15.296.092 bytes). La conversión a ONNX pliega las batch norms en float64, escribe el padding de TensorFlow por capa y almacena los tensores grandes en float16 para reducir el tamaño a la mitad respecto a la exportación float32 (14,9 MB).

La verificación de la conversión reporta diferencias máximas de 3,6e-3 (media 3,0e-6) frente al modelo Keras en 49 parches de siete señales de prueba, con la misma clase top-1 en 49 de 49 casos. De extremo a extremo, las características JavaScript a través de este fichero se desvían como máximo 2,3e-3 en 12,3 s de voz y 3,6e-3 en notas pulsadas respecto a `yamnet_frames_model` de TensorFlow, con las mismas clases top.

## Capacidades

- Clasificación de audio multi-etiqueta: 521 clases de AudioSet con una sigmoide independiente por clase.
- Etiquetado de eventos sonoros en ventanas de 0,96 s con solapamiento de 0,48 s.
- Inferencia en JavaScript: Node.js vía `onnxruntime` y navegador vía `onnxruntime-web`.
- Cálculo de características log-mel en JavaScript replicando `features.py` de TensorFlow.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de texto.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Etiquetado de archivos de audio en pipelines de Node.js: el modelo se carga como un único fichero ONNX de 7,5 MB y procesa parches de 0,96 s con un salto de 0,48 s, lo que permite clasificar grabaciones largas sin dependencias de Python ni TensorFlow.
- Moderación de contenido sonoro en el navegador: al ejecutarse con `onnxruntime-web`, puede analizar audio capturado por el micrófono del usuario sin enviar datos a un servidor, útil para aplicaciones de privacidad.
- Detección de eventos acústicos en dispositivos de borde: su tamaño reducido y su arquitectura MobileNetV1 lo hacen adecuado para sistemas con poca memoria y sin GPU dedicada.
- Análisis de llamadas y reuniones: la ventana de 0,96 s permite segmentar y etiquetar fragmentos de voz, música o ruido de fondo en grabaciones de atención al cliente.
- Indexación y búsqueda de archivos de audio: generar etiquetas por fragmento para construir un índice consultable por eventos sonoros (por ejemplo, "aplausos", "perro", "sirena").
- Monitorización de entornos: clasificación continua de audio ambiente en sistemas de vigilancia o domótica con latencia baja y sin infraestructura de GPU.
- Prototipado rápido en front-end: la API `tag(samples, 44100)` de `@audio/neural-tag` devuelve etiquetas con nombre, id e índice, lo que simplifica la integración en demos y aplicaciones web.

## Benchmarks y rendimiento

Datos de precisión publicados por el autor original (upstream) sobre el conjunto de evaluación de AudioSet de 20.366 segmentos, para las 521 clases:

| Métrica | Valor |
|---|---|
| Balanced average d-prime | 2,318 |
| Balanced mAP | 0,306 |
| Balanced average lwlrap | 0,393 |

Verificación de la conversión frente al modelo Keras original:

| Exportación | Diferencia máxima \|score\| | Diferencia media | Misma clase top-1 |
|---|---|---|---|
| float32 | 1,6e-6 | 1,5e-8 | 49 de 49 |
| este fichero (float16) | 3,6e-3 | 3,0e-6 | 49 de 49 |

No se han publicado resultados de benchmarks comparativos con otros modelos de clasificación de audio en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero ONNX ocupa 7,5 MB, por lo que la huella de memoria es muy reducida y cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 4090) es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en CPU y en el navegador.
- Opciones de despliegue: `onnxruntime` (Node.js), `onnxruntime-web` (navegador), y la librería `@audio/neural-tag`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de clasificación de audio (parámetros, contexto, rendimiento, licencia y disponibilidad) en la información proporcionada. La model card únicamente referencia el modelo original de TensorFlow (`yamnet.h5`) como fuente, del cual esta conversión es una versión ONNX con pesos float16 y batch norms plegadas.

## Limitaciones y advertencias

- Las salidas del clasificador no están calibradas entre clases: no deben interpretarse directamente como probabilidades (así lo advierte la model card del modelo original en TF Hub).
- Se eliminaron seis clases de AudioSet por recomendación de revisores de equidad (Speech y Singing con género, Battle cry, Funny music), lo que puede introducir sesgos de cobertura en esas categorías.
- Riesgo de falsos positivos y negativos en clases poco representadas o acústicamente similares; la precisión global es moderada (balanced mAP 0,306).
- La ventana de análisis es de 0,96 s, por lo que eventos más cortos o solapados pueden no detectarse correctamente.
- No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones.
- La licencia Apache 2.0 cubre el código y los pesos de Google; los nombres e identificadores de clase son de la ontología AudioSet, disponible bajo CC BY-SA 4.0, y las etiquetas de AudioSet bajo CC BY 4.0, lo que impone obligaciones de atribución adicionales.
- El modelo ha sido modificado respecto al original (conversión a ONNX, plegado de batch norms, pesos en float16), por lo que la verificación de equivalencia debe tenerse en cuenta en producción.
- El repositorio indica 0 descargas y 0 likes en el momento de la consulta, sin historial de uso comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/audiojs/yamnet
- Código fuente original (TensorFlow): https://github.com/tensorflow/models/tree/c14bf9ad91962cf189f9f58db2132c06247fcd53/research/audioset/yamnet
- Pesos originales: https://storage.googleapis.com/audioset/yamnet.h5
- Librería `@audio/neural-tag`: https://github.com/audiojs/neural/tree/main/packages/neural-tag
- Paper de AudioSet: Gemmeke et al., ICASSP 2017
- Paper de MobileNets: Howard et al., arXiv:1704.04861 (https://arxiv.org/abs/1704.04861)

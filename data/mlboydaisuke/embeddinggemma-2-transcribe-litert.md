# mlboydaisuke/EmbeddingGemma-2-Transcribe-LiteRT

## Resumen

EmbeddingGemma-2-Transcribe-LiteRT es un paquete de inferencia en formato LiteRT/TFLite para reconocimiento automatico del habla en ingles completamente en dispositivo, publicado por el usuario mlboydaisuke. No es un modelo entrenado de cero: reutiliza el encoder de audio (la torre de audio y la salida `embed_audio`) del modelo google/embeddinggemma-2, congelado, y lo combina con un lector propio ("reader v1") de 13,3 M de parametros entrenado con CTC sobre LibriSpeech train-clean-100. El resultado se empaqueta en ficheros `.tflite` pensados para ejecutarse en un telefono Android mediante la libreria litert, sin enviar audio ni transcripcion a ningun servidor.

El enfoque es inusual: el encoder convierte cada 40 ms de audio en un vector de 512 dimensiones y el reader decide, para cada vector, cual de las 200.000 palabras inglesas del vocabulario (o el simbolo *blank*) le corresponde, por comparacion contra una tabla de embeddings de texto precalculada. Esto lo aleja de los decodificadores autorregresivos tipo Whisper y lo acerca a un esquema de clasificacion por ventanas fijas, con solapamiento, que evita depender de un tokenizer generativo.

Es relevante porque demuestra que un encoder de audio originalmente pensado para embeddings multimodales puede reciclarse para transcripcion en dispositivo con un lector muy pequeno, alcanzando un WER del 5,784 % en una grabacion de 54 minutos sobre un Pixel 8a (Tensor G3) a 11,8 veces el tiempo real. El proyecto es independiente y no esta afiliado a Google, y a fecha de la informacion disponible no tiene descargas ni valoraciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: encoder de audio de google/embeddinggemma-2 (exportado con litert-torch) + reader transformer de 4 capas con CTC y argmax sobre tabla de embeddings de palabras |
| Parametros totales | no disponible para el encoder (589 MB en fp16 por fichero de ventana); reader v1: 13,3 M de parametros; tabla de palabras: 200.000 embeddings de 512 dimensiones en float16 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventanas fijas de 30 s (750 tokens, 40 ms por token) o de 10 s (250 tokens); solapamiento de 96 tokens (3,84 s) por la izquierda y 1 token extra por la derecha |
| Tipos de cuantizacion | Pesos de capas fully connected y convolucionales en float16, reconvertidos a float32 dentro del grafo; encoder "f16safe" (RMSNorm reescalado para no salir del rango float16); reader en float32; tabla de palabras en float16 usada en float32. No se documentan otras cuantizaciones (int8, int4) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | apache-2.0 (declarada en la model card) |
| Formato de pesos | TFLite / LiteRT (`.tflite`), mas `vocab.txt` con las 200.000 palabras, una por linea |

Ficheros del repositorio (1,9 GB en total):

| Fichero | Tamano (bytes) | Funcion |
|---|---:|---|
| `eg2_audio_f16safe_fp16w_w30.tflite` | 589.273.696 | Encoder para ventanas de 30 s (firma `audio_30s`); lo usan CPU y GPU |
| `eg2_audio_f16safe_fp16w_w10.tflite` | 589.015.376 | Encoder para ventanas de 10 s (`audio_10s`); lo usa la NPU |
| `reader_w30.tflite` | 361.494.720 | Reader v1 + tabla de palabras + eleccion de la mejor palabra, 750 tokens (`reader_30s`) |
| `reader_w10.tflite` | 361.238.720 | Equivalente para 250 tokens (`reader_10s`) |
| `vocab.txt` | 1.737.588 | Las 200.000 palabras; el numero de linea es el indice de palabra |

## Arquitectura y entrenamiento

El encoder es la torre de audio y la salida `embed_audio` de `google/embeddinggemma-2` (revision `914f7f89`), exportadas con litert-torch, un fichero por longitud de ventana. Sus entradas son `mel` `[1, F, 128]` (espectrograma log-mel del `Gemma4AudioFeatureExtractor` de transformers: audio a 16 kHz, trama de 20 ms cada 10 ms, 128 bins mel) y `mask` `[1, F]`, con F = 3.000 para 30 s y F = 1.000 para 10 s. Sus salidas son `soft` `[1, F/4, 512]`, un vector cada 40 ms, y `mask` `[1, F/4]`. Cada RMSNorm se reescala para que sus sumas no salgan del rango de float16, requisito de la GPU en fp16 y de la NPU; en float32 el grafo reescalado da exactamente los mismos numeros. Los pesos de las capas FC y convolucionales se guardan en float16 y se devuelven a float32 dentro del grafo, de modo que una CPU (o una GPU en precision fp32) calcula en float32 con pesos redondeados. El encoder esta congelado: no se ha reentrenado.

El reader v1 es un transformer de 4 capas y 13,3 M de parametros, entrenado con CTC sobre LibriSpeech train-clean-100, que se fusiona en un unico grafo junto con la tabla de palabras (el embedding de texto de EmbeddingGemma 2 para cada una de las 200.000 palabras, en float16 tal como se publico) y una operacion argmax. Sus entradas son `soft` `[1, T, 512]` y `mask` `[1, T]`, con T = 750 o 250; sus salidas por token son `ids` (int32, la mejor palabra), `best` (su puntuacion) y `blank` (la puntuacion del blank). Un token es su mejor palabra salvo que el blank puntue mas alto; una racha de la misma palabra se cuenta como una sola palabra y los blanks se descartan. El reader se ejecuta en float32 y la tabla se usa en float32 a partir de sus valores float16.

La innovacion practica esta en la gestion de ventanas: como el encoder ve una ventana fija y no ve nada antes de que empiece, los tokens del inicio de cada ventana salen mal. Las ventanas siguen el contrato del reader: 30 s con 96 tokens (3,84 s) de solapamiento por la izquierda y 1 token extra por la derecha. La ventana k empieza en el token 653k (750 - 96 - 1); la ventana 0 conserva sus tokens 0 a 748, cada ventana posterior conserva los tokens 96 a 748, y la ventana que alcanza el final de la grabacion conserva hasta su ultimo token. El log-mel se calcula sobre la grabacion completa y cada ventana es un corte de sus tramas. El resultado es que el encoder hace 750 / 653 = 1,149 veces el trabajo de una sola pasada. En el caso de las ventanas de 10 s de la NPU se conservan 153 tokens nuevos de 250, y con estas ventanas la palabra o blank de la app coincide con la del reader de PyTorch en los 81.436 tokens de la grabacion de 54 minutos.

## Capacidades

- Transcripcion de voz a texto en ingles, en dispositivo, en streaming por ventanas de 30 s o 10 s.
- Reconocimiento sobre un vocabulario cerrado de 200.000 palabras inglesas mas un simbolo blank; cada token de 40 ms se resuelve contra la tabla de embeddings de palabras.
- Ejecucion local: el audio, el modelo y la transcripcion permanecen en el telefono, sin llamadas de red.
- Decodificacion por lotes de una ventana completa (750 o 250 tokens) en ambas direcciones temporales, con fusion de ventanas solapadas.
- Salidas por token con puntuacion: `ids` (palabra elegida), `best` (puntuacion de esa palabra) y `blank` (puntuacion del blank), utiles para umbralizar o filtrar.
- Integracion con la app Android eg2-transcribe, que lee los ficheros desde su directorio de datos y permite elegir el fichero de encoder en el propio dispositivo.

No hay informacion disponible sobre soporte de tool calling, function calling, uso como agente, capacidades multimodales (vision, audio adicional), o modo de razonamiento. El modelo es monoingles y no se documentan capacidades multilingues.

## Casos de uso

- Transcripcion de notas de voz en el propio telefono: una app Android puede pasar una grabacion por ventanas de 30 s con el encoder y el reader, manteniendo el audio en el dispositivo, lo que encaja en escenarios con requisitos de privacidad o sin conectividad.
- Dictado en aplicaciones de toma de notas: con ventanas de 10 s y el encoder optimizado para NPU (471,5 ms de encoder y 205,8 ms de reader por ventana de 10 s en un Pixel 8a), es viable una experiencia de dictado por fragmentos cortos con respuesta inferior al segundo.
- Subtitulado de audiolibros o podcasts en local: la prueba documentada transcribe una grabacion LibriVox de 54 min 17 s en 276,8 s (11,8 veces el tiempo real) con un WER del 5,784 %, un regimen adecuado para procesamiento por lotes en segundo plano en el movil.
- Indexacion y busqueda de archivos de audio: al producir transcripciones con marcas temporales implicitamente (un token cada 40 ms), el texto resultante puede indexarse para busqueda local sin subir el audio a la nube.
- Aplicaciones de accesibilidad: transcripcion continua en el dispositivo para personas con dificultades auditivas, sin coste de API y sin dependencia de conexion.
- Investigacion y prototipado en reconocimiento de habla en dispositivo: el repositorio separa encoder, reader y vocabulario, lo que permite estudiar la sustitucion del reader, del vocabulario o de la politica de ventanas sin reentrenar el encoder de audio.
- Evaluacion de pipelines LiteRT/TFLite en Android: sirve como caso de referencia para medir latencia, memoria y uso de GPU/NPU en hardware movil concreto (Tensor G3 en la documentacion).

## Benchmarks y rendimiento

Resultados documentados por el autor en una grabacion LibriVox de 54 min 17 s (*The Adventure of the Speckled Band*, leida por Kirsten Ferreri), procesada en 125 ventanas de 30 s con la app Android en compilacion debug y LiteRT 2.2.0 `CompiledModel`:

| Dispositivo | Encoder y reader en | Encoder por ventana de 30 s | Reader por ventana de 30 s | 54 min 17 s de audio | Velocidad | WER |
|---|---|---:|---:|---:|---:|---:|
| Pixel 8a (Tensor G3) | GPU fp32 | 1.401 ms | 839 ms | 276,8 s | 11,8x tiempo real | 5,784 % |
| Pixel 8a (Tensor G3), grabacion de 8,1 s: ventana automatica, ficheros de 10 s | GPU fp32 | 471,5 ms (una ventana de 10 s) | 205,8 ms (una ventana de 10 s) | 0,80 s para los 8,1 s | 10,1x tiempo real | palabras identicas a la salida publicada del reader |
| Galaxy S26 (SM8850) | GPU fp32 | pendiente | pendiente | pendiente | pendiente | pendiente |

Notas de la medicion: en el Pixel 8a son medianas sobre las 125 ventanas, con estado termico 2 al final de la ejecucion; el tiempo incluye log-mel, encoder, reader y palabras, y la decodificacion del fichero FLAC se sumo aparte (417,8 s). El pico de memoria de la app fue de 4.478.456 kB (VmHWM). El WER contabiliza 572 errores (el desglose completo queda truncado en la informacion disponible). Para ventanas de 10 s, la app calcula 153 tokens nuevos de cada 250 y coincide token a token con el reader de PyTorch en los 81.436 tokens de la grabacion de 54 minutos.

No hay datos de MMLU, HumanEval, GSM8K ni de benchmarks de ASR estandar (LibriSpeech test-clean/test-other, Common Voice) en la informacion disponible.

## Requisitos de hardware

- Encoder: 589 MB por fichero de ventana (fp16, grafo reescalado "f16safe"). Reader: 361 MB por fichero, que incluye la tabla de 200.000 embeddings de palabras. El repositorio completo ocupa 1,9 GB.
- Memoria observada: pico de 4.478.456 kB (unos 4,48 GB) de VmHWM en la app ejecutando la grabacion completa en un Pixel 8a.
- Cabe en movil de gama alta con Android y LiteRT: el caso validado es un Pixel 8a (Tensor G3) con GPU fp32. La NPU requiere los ficheros de 10 s (`eg2_audio_f16safe_fp16w_w10.tflite` y `reader_w10.tflite`).
- No se documentan requisitos ni resultados para GPU de escritorio o servidor (A100, H100, RTX 4090), ni para CPU de PC. No disponible.
- Despliegue: LiteRT / TFLite mediante `CompiledModel` (probado con LiteRT 2.2.0) en Android; la app de referencia es eg2-transcribe, que carga los encoders desde su directorio de ficheros y el reader y `vocab.txt` desde el subdirectorio `reader`, con comandos adb documentados en su README. No se documentan recetas para vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.
- Latencia y throughput: 1.401 ms de encoder + 839 ms de reader por ventana de 30 s en Pixel 8a, es decir 11,8x tiempo real sobre la grabacion de 54 minutos; 471,5 ms + 205,8 ms por ventana de 10 s, es decir 10,1x tiempo real en una grabacion de 8,1 s. El estado termico 2 al final de la ejecucion sugiere degradacion por temperatura en ejecuciones largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlboydaisuke/EmbeddingGemma-2-Transcribe-LiteRT | Reader de 13,3 M; encoder de tamano no disponible (589 MB en fp16) | Ventanas de 30 s (750 tokens) o 10 s (250 tokens), 40 ms por token | ASR en ingles en dispositivo (TFLite/LiteRT) | apache-2.0 | HuggingFace, 0 descargas, 0 likes; app Android eg2-transcribe |
| google/embeddinggemma-2 | no disponible | no disponible | Embeddings multimodales (modelo base del encoder) | no disponible en la informacion proporcionada | HuggingFace |
| mlboydaisuke/EmbeddingGemma-2-Transcribe-Reader | Reader v1 de 13,3 M; pesos, codigo de entrenamiento y evaluacion | no disponible | Reader CTC para el pipeline de transcripcion | no disponible en la informacion proporcionada | HuggingFace |
| Alternativas de ASR en dispositivo (por ejemplo, ports de Whisper a LiteRT/TFLite) | no disponible | no disponible | ASR multilingue | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a otras soluciones de ASR en dispositivo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles (`en`). No hay soporte multilingue documentado.
- Vocabulario cerrado de 200.000 palabras: cualquier termino fuera de esa lista (nombres propios, jerga, siglas, cifras, palabras de otros idiomas) no puede producirse tal cual; el modelo se ve forzado a elegir la palabra mas cercana de la tabla.
- Errores en los bordes de ventana: el encoder no ve nada antes de que empiece una ventana, por lo que los primeros tokens de cada ventana salen mal; se mitiga con 96 tokens de solapamiento por la izquierda y 1 por la derecha, a costa de 1,149 veces el trabajo de una pasada.
- El corte de una ventana de exactamente 30 s de audio (480.000 muestras) daria 2.999 tramas y su ultimo token perderia la ultima trama; es un caso a controlar en la integracion.
- Riesgo de alucinacion o sustitucion de palabras: al ser un clasificador por argmax sobre un vocabulario fijo, no hay mecanismo explicito de "no palabra" mas alla del blank, y no se documentan estrategias de confianza o umbralizacion en produccion.
- La NPU solo esta soportada con los ficheros de 10 s; el encoder de 30 s esta pensado para CPU y GPU.
- Degradacion termica: la propia medicion en Pixel 8a termina con estado termico 2, relevante en transcripciones largas.
- Pico de memoria de unos 4,48 GB en el caso medido: puede ser limitante en dispositivos con menos RAM o con otras apps en primer plano.
- Rendimiento no validado en el Galaxy S26 (SM8850): los valores estan pendientes. Tampoco hay resultados en CPU de escritorio, GPU de servidor ni otras plataformas.
- Madurez y validacion de la comunidad: 0 descargas y 0 likes en HuggingFace; el proyecto es independiente, no esta afiliado a Google y la model card advierte de que es un proyecto personal.
- Licencia: se declara apache-2.0, pero conviene verificar de forma independiente las condiciones aplicables al modelo base google/embeddinggemma-2 del que procede el encoder antes de un uso comercial.
- La informacion proporcionada esta truncada (el desglose del WER y el apartado de rendimiento quedan cortados), por lo que pueden existir datos adicionales no recogidos aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/EmbeddingGemma-2-Transcribe-LiteRT
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Repositorio del reader (pesos, entrenamiento y evaluacion): https://huggingface.co/mlboydaisuke/EmbeddingGemma-2-Transcribe-Reader
- App Android de referencia: https://github.com/john-rocky/eg2-transcribe
- Idea original: publicacion de Shahir (@TslShahir, 2026-10-13) y la app de Mac *Embedding Gemma Transcribe*; no se dispone de URL directa en la informacion proporcionada.

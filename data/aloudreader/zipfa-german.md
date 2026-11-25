# aloudreader/zipfa-german

## Resumen

zipfa-german es un alineador forzado (forced aligner) de audio y transcripcion para aleman, desarrollado por el usuario aloudreader. No es un modelo de reconocimiento de voz generativo, sino un modelo CTC que, dada una grabacion y su transcripcion, devuelve la marca temporal de inicio y fin de cada palabra con una resolucion de 20 ms. Resuelve un problema muy concreto en pipelines de subtitulado, anotacion y analisis fonetico: obtener timings por palabra cuando solo se dispone del texto.

Tecnicamente es un encoder Zipformer CTC de icefall con 9,7 millones de parametros, entrenado con CR-CTC sobre 1.967 horas de Multilingual LibriSpeech German. Parte del modelo ingles zipfa y se exporta a ONNX con soporte para audio largo. El repositorio pesa 0,1 GB y distribuye pesos en dos variantes: FP32 (47 MB) e int8 (19 MB).

Su relevancia practica esta en el rendimiento: sobre 200 pares del split de test de MLS German alcanza una tasa de acierto de cruce del 95,5 % con un error medio de 21,0 ms, frente al 92,0 % y 34,5 ms del modelo ingles aplicado al mismo audio aleman. La licencia Apache 2.0 y su tamano lo hacen desplegable en CPU e incluso en navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer CTC encoder (icefall) |
| Parametros totales | 9,7 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | audio de hasta 120 s por llamada (ventanas solapadas de 30 s) |
| Tipos de cuantizacion | FP32 y int8 |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model.int8.onnx`) |
| Entrada | audio 16 kHz mono, filterbank de 80 dimensiones |
| Salida | inicio y fin por palabra, resolucion de 20 ms |
| Frecuencia de frames | 50 fps |
| Funcion de perdida | CR-CTC |
| Tokenizador | caracteres (BPE, `tokens.txt` + `bpe.model`) |

## Arquitectura y entrenamiento

El modelo es un encoder Zipformer con cabeza CTC, implementado en icefall y entrenado con CR-CTC. Recibe un filterbank de 80 dimensiones a 16 kHz y emite 50 frames por segundo, es decir, un frame cada 20 ms. El tokenizador es de caracteres y usa el alfabeto latino del modelo ingles: las dieresis se pliegan (schön pasa a schon) y la ß se convierte en ss, aunque las marcas temporales se reportan para las palabras tal y como estan escritas.

El entrenamiento parte del modelo ingles zipfa y se realiza sobre Multilingual LibriSpeech German (CC BY 4.0), 1.967 horas, durante 20 epocas, con un export promediado sobre las ultimas 7. Como MLS no incluye timings de referencia por palabra, el offset temporal calibrado (0,03 s) se hereda del modelo ingles. La exportacion a ONNX incorpora soporte para audio largo: el audio de mas de 30 s se codifica en ventanas solapadas de 30 s, lo que mantiene el consumo de memoria alrededor de 600 MB en precision nativa.

## Capacidades

- Alineacion forzada palabra a palabra: dado un audio y su transcripcion, devuelve `start` y `end` para cada palabra con resolucion de 20 ms.
- Procesamiento de audio de hasta 120 s por llamada, con ventanas solapadas de 30 s para tramos largos.
- Inferencia cuantizada int8 con la misma precision que FP32 y mayor velocidad en CPU.
- Ejecucion en navegador mediante onnxruntime-web (WASM).
- Manejo de palabras fuera del alfabeto del modelo: las agrupa en un unico span comodin que puede re-alinearse con un segundo modelo (`--second-model-dir`).
- No realiza reconocimiento de voz libre: requiere la transcripcion como entrada.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al aleman; no cubre otros idiomas.

## Casos de uso

- Subtitulado automatico con timings por palabra: a partir de un video y su transcripcion revisada, el modelo genera los tiempos de cada palabra para exportar a SRT/VTT karaoke sin necesidad de un ASR completo, gracias a su resolucion de 20 ms.
- Anotacion de corpus linguisticos: para investigacion en fonetica o linguistica de corpus, permite alinear transcripciones ortograficas con audio de MLS u otras fuentes alemanas y obtener un TextGrid con limites por palabra.
- Verificacion de calidad de transcripciones: si la tasa de error de caracteres codiciosa es alta (0,046 en el test de MLS), el modelo puede senalar desalineaciones o palabras ausentes en el audio, util como control de calidad en pipelines de datos.
- Generacion de datasets de entrenamiento para ASR: alinear grandes volumenes de audio y texto para producir pares con timings que sirvan como etiquetas debiles en modelos de reconocimiento.
- Busqueda y navegacion por audio: indexar grabaciones por palabra para permitir saltar a la ocurrencia exacta de un termino en un archivo de audio o video largo.
- Herramientas de edicion de audio y doblaje: localizar los limites de cada palabra para cortar, sustituir o sincronizar segmentos en flujos de postproduccion.
- Despliegue en navegador: con onnxruntime-web (WASM) procesa un clip de 5 s en 25-35 ms con 8 hilos y unos 275 MB de heap, lo que permite alinear en el cliente sin enviar audio a un servidor.

## Benchmarks y rendimiento

Evaluacion sobre 200 pares (400 clips) del split de test de MLS German:

| Modelo | Tasa de acierto de cruce | Error medio de cruce | CER codiciosa de caracteres |
|---|---|---|---|
| zipfa-german | 0,955 | 21,0 ms | 0,046 |
| zipfa-german int8 | 0,955 | 20,9 ms | 0,046 |
| zipfa ingles sobre el mismo audio | 0,920 | 34,5 ms | 0,504 |

El test de cruce une dos clips con 0,3 s de silencio y se considera superado si las palabras del primer clip terminan antes de la union y las del segundo empiezan despues del silencio, con una tolerancia de 0,10 s. De los 9 pares fallidos, unos 7 corresponden a transcripciones con palabras que no estan en el audio (por ejemplo, un clip cuya transcripcion empieza por "teil zwei kapitel dreiundzwanzig" y que el audio no contiene) y 2 son errores de alineacion en clips limpios. El error de frontera de palabra no se mide porque no existen timings de referencia en aleman.

## Requisitos de hardware

- VRAM/ memoria estimada: el modelo int8 pesa 19 MB y el FP32 47 MB; la inferencia nativa mantiene el consumo en torno a 600 MB de memoria para audio largo.
- GPU: no requiere GPU; esta disenado para CPU. Cualquier GPU moderna puede ejecutarlo, pero no aporta ventaja significativa frente a CPU por su tamano.
- Consumer GPU: cabe en cualquier GPU de consumo, aunque el despliegue tipico es en CPU.
- Despliegue: paquete `zipfa` (numpy + onnxruntime + kaldi-native-fbank) o CLI `python -m zipfa.cli`; en navegador con onnxruntime-web (WASM).
- Latencia: aproximadamente 25-35 ms para un clip de 5 s con 8 hilos en WASM, con unos 275 MB de heap. No se han publicado cifras de throughput nativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| zipfa-german | 9,7 M | hasta 120 s por llamada | aleman | Apache 2.0 | ONNX |
| zipfa (ingles) | no disponible | no disponible | ingles | no disponible | ONNX |
| Whisper large-v3 (ASR, no alineador) | 1.550 M | 30 s por ventana | multilingue | MIT | safetensors, GGUF, etc. |
| wav2vec2 / MMS aligners (familia) | variable | variable | multilingue | variable | varios |

La comparacion con modelos ASR generativos como Whisper no es directa: Whisper transcribe y puede dar timings aproximados, pero no esta optimizado para alineacion forzada con transcripcion dada. zipfa-german es ordenes de magnitud mas pequeno (9,7 M frente a 1.550 M) y esta especializado en una unica tarea. No se dispone de datos publicados para comparar directamente con otros alineadores alemanes de la misma categoria.

## Limitaciones y advertencias

- Solo aleman: no soporta otros idiomas y el alfabeto esta restringido al del modelo ingles, con plegado de dieresis y ß.
- Requiere la transcripcion como entrada; no transcribe audio por si mismo.
- El offset temporal (0,03 s) se hereda del modelo ingles porque MLS no tiene timings de referencia en aleman; puede introducir un sesgo sistematico pequeno.
- El error de frontera de palabra no esta medido por falta de referencias en aleman.
- Las palabras que no pueden escribirse en el alfabeto del modelo comparten un unico span comodin; es necesario un segundo modelo para re-alinearlas si se requiere precision.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de desalineacion cuando la transcripcion contiene palabras ausentes en el audio (causa de la mayoria de fallos en el test de cruce).
- Limite de 120 s por llamada; audios mas largos deben segmentarse.
- Licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (MLS, CC BY 4.0) impone sus propias condiciones de atribucion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/aloudreader/zipfa-german
- Dataset de entrenamiento: https://huggingface.co/datasets/facebook/multilingual_librispeech
- icefall (framework de entrenamiento): https://github.com/k2-fsa/icefall
- onnxruntime: https://github.com/microsoft/onnxruntime
- onnxruntime-web: https://github.com/microsoft/onnxruntime/tree/main/js/web
- kaldi-native-fbank: https://github.com/csukuangfj/kaldi-native-fbank

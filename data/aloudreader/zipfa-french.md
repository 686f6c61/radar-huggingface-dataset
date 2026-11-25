# aloudreader/zipfa-french

## Resumen

zipfa-french es un alineador forzado (forced aligner) para frances desarrollado por aloudreader, construido sobre una arquitectura Zipformer CTC de 9,7 millones de parametros y exportado a ONNX. Su funcion es concreta y acotada: dado un fragmento de audio y su transcripcion, devuelve una marca de inicio y fin para cada palabra del texto, con una resolucion temporal de 20 ms. No es un modelo de reconocimiento del habla general, sino una herramienta de alineacion que asume que el texto es correcto y busca donde encaja en la senal de audio.

El modelo parte del zipfa ingles y se afino sobre las 1.077 horas del split frances de Multilingual LibriSpeech durante 20 epocas. La relevancia practica esta en su tamano reducido (47 MB en precision completa, 19 MB en int8) y en su precision: sobre 200 pares del split de test de MLS French alcanza una tasa de exito en el test de union (junction) del 0,975 con un error medio de 13,6 ms, frente a los 76,2 ms del modelo ingles aplicado sobre el mismo audio.

Es una pieza util para pipelines de subtitulado, anotacion fonetica, evaluacion de TTS/ASR y sincronizacion de transcripciones, donde se necesita granularidad por palabra sin desplegar un modelo grande. La licencia Apache 2.0 y el formato ONNX facilitan su integracion tanto en servidor como en navegador mediante onnxruntime-web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer CTC encoder (icefall) |
| Parametros totales | 9,7 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | audio de hasta 120 s por llamada; ventanas solapadas de 30 s para audio mas largo |
| Tipos de cuantizacion | float32 (completa) e int8 |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model.int8.onnx`) |
| Entrada | audio mono a 16 kHz, filterbank de 80 dimensiones |
| Salida | marcas de inicio y fin por palabra, resolucion de 20 ms (50 frames/s) |
| Funcion | alineacion forzada (forced alignment), no ASR libre |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un encoder Zipformer con salida CTC, implementado en icefall y entrenado con CR-CTC. Consume un filterbank de 80 dimensiones a 16 kHz y produce 50 frames por segundo, lo que fija la resolucion temporal en 20 ms. Con 9,7 M de parametros es un modelo muy compacto, pensado para inferencia en CPU y en navegador. La exportacion a ONNX incorpora soporte para audio largo: el audio se procesa en ventanas solapadas de 30 s, de modo que el consumo de memoria se mantiene en torno a 600 MB en precision nativa.

El entrenamiento parte del modelo zipfa ingles y se afina sobre las 1.077 horas del split frances de Multilingual LibriSpeech (licencia CC BY 4.0) durante 20 epocas, promediando los pesos de las ultimas 7. Como MLS no incluye marcas de tiempo de referencia por palabra, el offset temporal calibrado (0,03 s) se hereda del modelo ingles. El texto de entrada usa el alfabeto latino del modelo ingles, con plegado de acentos (e → e, c → c) y eliminacion de guiones, de forma que "dit-il" se alinea como una sola palabra; las marcas de tiempo se reportan sobre las palabras tal como estan escritas.

## Capacidades

- Alineacion forzada de audio y transcripcion: devuelve inicio y fin de cada palabra del texto proporcionado.
- Resolucion temporal de 20 ms (50 frames por segundo).
- Procesamiento de audio de hasta 120 s por llamada, con ventanas solapadas de 30 s para clips mas largos.
- Cuantizacion int8 con precision practicamente identica a la version completa y mayor velocidad en CPU.
- Ejecucion en navegador con onnxruntime-web (WASM): unos 25-35 ms para un clip de 5 s con 8 hilos y unos 275 MB de heap WASM.
- Manejo de palabras no representables en el alfabeto del modelo mediante un span comodin; el paquete `zipfa` permite realinear esos tramos con un segundo modelo (`--second-model-dir`).
- Interfaz de linea de comandos: `python -m zipfa.cli --model-dir <folder> --audio clip.wav --text "..." --int8`.
- No realiza reconocimiento del habla libre ni traduccion; requiere la transcripcion como entrada.

## Casos de uso

- Subtitulado y sincronizacion de transcripciones: dado un texto ya transcrito y su audio, el modelo genera marcas por palabra que permiten construir subtitulos con timing preciso, aprovechando la resolucion de 20 ms y el bajo coste computacional.
- Anotacion de corpus para ASR y TTS: alinear transcripciones existentes con su audio para generar datasets con timestamps a nivel de palabra, util en el entrenamiento de modelos de sintesis y reconocimiento.
- Evaluacion de sistemas TTS: comparar el audio generado con el texto de entrada para medir duraciones por palabra, pausas y desviaciones temporales en la evaluacion de prosodia.
- Analisis fonetico y linguistico: obtener la duracion de cada palabra en grabaciones de habla francesa para estudios de ritmo, velocidad de habla o fenomenos de enlace, con la salvedad del plegado de acentos.
- Sincronizacion de audiolibros y podcasts: alinear el texto de un libro o transcripcion con su version en audio para generar resaltado tipo karaoke o navegacion por parrafos.
- Herramientas en navegador: integracion via onnxruntime-web (WASM) para alinear clips de pocos segundos en el cliente, sin enviar audio a un servidor, con un heap de unos 275 MB.
- Control de calidad de transcripciones: detectar desalineaciones sistematicas entre audio y texto que sugieran errores de transcripcion, como ilustra el propio autor al senalar que 4 de los 5 fallos del test de union son errores del dataset.

## Benchmarks y rendimiento

Evaluacion sobre 200 pares (400 clips) del split de test de MLS French. El test de union empalma dos clips con 0,3 s de silencio y se considera superado si las palabras del primer clip terminan antes de la union y las del segundo empiezan despues del silencio, con tolerancia de 0,10 s.

| Modelo | Tasa de exito en union | Error medio en union | CER codicioso |
|---|---|---|---|
| zipfa-french (este modelo) | 0,975 | 13,6 ms | 0,053 |
| zipfa-french int8 | 0,970 | 14,4 ms | 0,053 |
| zipfa ingles sobre el mismo audio | 0,975 | 76,2 ms | 0,512 |

El error de frontera de palabra no se mide porque no existen marcas de referencia en frances. El autor indica que 4 de los 5 pares fallidos son errores del dataset (transcripcion que no coincide con su audio).

## Requisitos de hardware

- VRAM estimada: el modelo completo ocupa 47 MB y la version int8 19 MB; en la practica cabe en cualquier GPU consumer y en CPU.
- Memoria de trabajo: en torno a 600 MB en precision nativa gracias al procesamiento por ventanas de 30 s; unos 275 MB de heap WASM en navegador.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU (RTX 4090, A100, H100) acelera la inferencia pero no es necesaria dado el tamano.
- Cabe en GPU consumer: si, en cualquier modelo, incluida una GTX 1050 o integradas.
- Opciones de despliegue: onnxruntime (Python, CPU/GPU), onnxruntime-web (WASM en navegador), paquete `zipfa` con numpy + onnxruntime + kaldi-native-fbank, y CLI incluida.
- Latencia estimada: 25-35 ms para un clip de 5 s en navegador con 8 hilos (WASM); en CPU nativa con onnxruntime la latencia es del mismo orden o inferior.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| zipfa-french | 9,7 M | Alineacion forzada CTC | fr | Apache 2.0 | ONNX |
| zipfa (ingles) | no disponible | Alineacion forzada CTC | en | no disponible | ONNX |
| Whisper (ASR) | no disponible | ASR con timestamps por palabra | multilingue | MIT | safetensors, etc. |
| MFA (Montreal Forced Aligner) | no disponible | Alineacion forzada con diccionario y modelo acustico | varios | no disponible | no disponible |

La comparacion directa con el modelo ingles de la misma familia es la mas informativa: sobre audio frances, zipfa-french reduce el error medio de union de 76,2 ms a 13,6 ms y el CER codicioso de 0,512 a 0,053, con la misma tasa de exito. Frente a un ASR como Whisper, la diferencia es de planteamiento: Whisper transcribe y puede dar timestamps, mientras que zipfa asume la transcripcion y optimiza la precision temporal por palabra. Frente a MFA, zipfa evita la necesidad de diccionario de pronunciacion y modelo acustico separados, a costa de depender de un tokenizador de caracteres con plegado de acentos.

## Limitaciones y advertencias

- Solo soporta frances; el modelo no esta entrenado para otros idiomas.
- Requiere la transcripcion como entrada: no transcribe audio por si mismo.
- El texto debe expresarse en el alfabeto latino del modelo ingles, con acentos plegados y guiones eliminados; las palabras no representables comparten un span comodin y requieren realineacion con un segundo modelo.
- No existen marcas de referencia en frances, por lo que el error de frontera de palabra no se ha medido; la evaluacion se limita al test de union y al CER.
- El offset temporal (0,03 s) se hereda del modelo ingles y no se ha recalibrado con datos franceses.
- Riesgo de alucinacion bajo en el sentido generativo (es un modelo CTC de alineacion), pero puede producir alineaciones incorrectas si la transcripcion no coincide con el audio, como evidencian los fallos del dataset en la evaluacion.
- El autor senala que 4 de los 5 fallos del test de union son errores del dataset, lo que sugiere que parte del ruido de evaluacion es ajeno al modelo.
- Licencia Apache 2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y aviso de licencia.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.
- Para produccion conviene validar la alineacion sobre el dominio concreto (calidad de audio, ruido, acentos regionales) antes de confiar en los timestamps.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aloudreader/zipfa-french
- Dataset de entrenamiento: https://huggingface.co/datasets/facebook/multilingual_librispeech
- icefall (framework de entrenamiento): https://github.com/k2-fsa/icefall
- onnxruntime: https://onnxruntime.ai/
- onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- kaldi-native-fbank: https://github.com/csukuangfj/kaldi-native-fbank

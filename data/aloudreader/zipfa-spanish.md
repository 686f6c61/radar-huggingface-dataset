# aloudreader/zipfa-spanish

## Resumen

zipfa Spanish es un modelo de alineamiento forzado (forced alignment) para espanol, desarrollado por el usuario aloudreader. No es un modelo de reconocimiento de voz generativo, sino un alineador: dado un audio y su transcripcion, devuelve la marca de inicio y fin de cada palabra. Esta construido sobre un encoder Zipformer con cabeza CTC (procedente de icefall) y se distribuye exclusivamente en formato ONNX, con variantes en precision completa e int8.

El modelo parte del zipfa ingles y se ha afinado sobre Multilingual LibriSpeech espanol (918 horas, 20 epocas). Con solo 9,7 millones de parametros y un repositorio de 0,1 GB, esta disenado para ejecutarse en CPU e incluso en navegador mediante onnxruntime-web (WASM), lo que lo hace util para tareas de subtitulado, analisis fonetico y sincronizacion de transcripciones en entornos con recursos limitados.

Su relevancia radica en la escasez de alineadores forzados ligeros y abiertos para espanol: la mayoria de alternativas dependen de modelos acusticos grandes o de herramientas como Montreal Forced Aligner, mas pesadas. zipfa ofrece resolucion temporal de 20 ms, cuantizacion int8 sin perdida de precision medible y una licencia Apache 2.0 permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer CTC encoder (icefall) |
| Parametros totales | 9,7 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | audio de hasta 120 s por llamada (ventanas solapadas de 30 s) |
| Tipos de cuantizacion | float32 (47 MB) e int8 (19 MB) |
| Idiomas soportados | espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model.int8.onnx`) |
| Entrada | audio mono 16 kHz, 80-dim filterbank |
| Salida | tiempos de inicio y fin por palabra, resolucion de 20 ms |
| Tokenizador | caracteres (BPE), archivos `tokens.txt` y `bpe.model` |
| Frame shift | 20 ms (50 frames por segundo) |
| Dataset de entrenamiento | facebook/multilingual_librispeech (espanol), 918 h |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un encoder Zipformer con cabeza CTC, implementado en icefall y entrenado con CR-CTC. Recibe features de filterbank de 80 dimensiones y produce 50 frames por segundo, lo que da la resolucion temporal de 20 ms. Se exporto a ONNX con soporte para audio largo: las entradas superiores a 30 s se codifican en ventanas solapadas de 30 s, manteniendo el uso de memoria en torno a 600 MB en precision nativa.

El entrenamiento parte del modelo zipfa ingles y se afina sobre las 918 horas de Multilingual LibriSpeech espanol (licencia CC BY 4.0) durante 20 epocas, con exportacion promediada sobre las ultimas 7 epocas. Como MLS no incluye timestamps de referencia a nivel de palabra, el offset temporal calibrado (0,03 s) se hereda del modelo ingles. El texto de entrada usa el alfabeto latino del modelo ingles: los acentos, la enye y la dieresis se pliegan (senor por senor) y se eliminan los signos de apertura, aunque los tiempos se reportan para las palabras tal como se escriben.

## Capacidades

- Alineamiento forzado palabra a palabra: dado un audio y su transcripcion, devuelve inicio y fin de cada palabra con resolucion de 20 ms.
- Procesamiento de audio de hasta 120 s por llamada mediante ventanas solapadas de 30 s.
- Cuantizacion int8 con la misma precision que float32 y mayor velocidad en CPU.
- Ejecucion en navegador mediante onnxruntime-web (WASM): unos 25-35 ms para un clip de 5 s con 8 hilos y unos 275 MB de heap WASM.
- Manejo de palabras no representables en su alfabeto: comparten un span comodin que puede realinearse con un segundo modelo (`--second-model-dir`).
- Interfaz de linea de comandos (`python -m zipfa.cli`) y API de Python a traves del paquete `zipfa`.
- No realiza reconocimiento de voz libre: requiere la transcripcion como entrada.

## Casos de uso

- Subtitulado y sincronizacion de transcripciones: partiendo de un texto ya transcrito (por ejemplo, por un ASR externo o por un humano), el modelo genera los tiempos exactos de cada palabra para producir subtitulos con marcas temporales precisas.
- Analisis fonetico y linguistico: investigadores pueden extraer los limites temporales de palabras en corpus de habla espanola para estudios de duracion, ritmo o prosodia, sin depender de herramientas pesadas.
- Verificacion de calidad de transcripciones: comparando los tiempos alineados con la senal se pueden detectar palabras presentes en el texto pero ausentes en el audio (el propio autor documenta este fenomeno en MLS).
- Procesamiento en el navegador: al ejecutarse con onnxruntime-web, permite aplicaciones web de alineamiento sin enviar audio a un servidor, con latencias de decenas de milisegundos por clip corto.
- Sincronizacion de audiolibros y podcasts: alineando el texto de un libro o guion con el audio para generar "karaoke" o resaltado de texto sincronizado, gracias a su bajo consumo de memoria (unos 600 MB nativos).
- Pipelines de datos para entrenamiento de ASR: generacion de timestamps a nivel de palabra sobre corpus espanoles para aumentar datasets o evaluar modelos de reconocimiento.
- Despliegue en entornos con CPU y sin GPU: con 9,7 M de parametros y un modelo int8 de 19 MB, cabe en dispositivos de borde y contenedores ligeros.

## Benchmarks y rendimiento

Evaluacion sobre 200 pares (400 clips) del split de test de MLS espanol:

| Metrica | zipfa Spanish | zipfa Spanish int8 | zipfa ingles sobre el mismo audio |
|---|---|---|---|
| Tasa de acierto en junctions | 0,935 | 0,935 | 0,910 |
| Error medio en junctions | 39,2 ms | 39,6 ms | 33,8 ms |
| CER codicioso de caracteres | 0,028 | 0,028 | 0,428 |

El test de junction une dos clips con 0,3 s de silencio y se considera superado si las palabras del primer clip terminan antes de la union y las del segundo empiezan despues del silencio, con tolerancia de 0,10 s. La tasa de 0,935 queda por debajo del objetivo del proyecto (0,95); en 12 de los 13 pares fallidos, una palabra de la transcripcion en la union falta en la transcripcion propia del modelo para ese clip, lo que apunta a errores de corte en MLS. El error de limites de palabra no se ha medido por falta de timestamps de referencia en espanol.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo nativo usa en torno a 600 MB de memoria para audio largo (ventanas de 30 s) y el int8 es aun mas ligero.
- GPU recomendadas: no aplica; el modelo esta pensado para CPU. Cualquier GPU moderna puede ejecutarlo, pero no aporta ventajas significativas frente a CPU dado su tamano.
- GPU de consumo: cabe sobradamente en cualquier GPU de consumo, aunque su uso tipico es en CPU.
- Despliegue: onnxruntime (Python), onnxruntime-web (WASM en navegador) y el paquete `zipfa` (numpy + onnxruntime + kaldi-native-fbank). No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia: en navegador, unos 25-35 ms para un clip de 5 s con 8 hilos. No se publican cifras de throughput para CPU nativa.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zipfa Spanish | Alineador forzado CTC (Zipformer) | 9,7 M | hasta 120 s por llamada | Apache 2.0 | ONNX en Hugging Face |
| zipfa ingles | Alineador forzado CTC (Zipformer) | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Montreal Forced Aligner (MFA) | Alineador forzado con modelos acusticos | no disponible | sin limite documentado | varias (GPL y otras) | Herramienta de escritorio |
| Whisper (alineamiento por timestamps) | ASR generativo con timestamps aproximados | 39 M - 1,55 B | 30 s por ventana | MIT | Multiples formatos |

La comparacion con MFA y Whisper es orientativa: MFA ofrece alineamiento con modelos acusticos mas pesados y Whisper proporciona timestamps a nivel de segmento, no de palabra con la precision de un alineador dedicado. No se dispone de datos comparativos de rendimiento entre zipfa Spanish y estas herramientas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de ASR: requiere la transcripcion como entrada; no transcribe audio por si mismo.
- El alfabeto de entrada pliega acentos, enye y dieresis, y elimina los signos de apertura; las palabras no representables comparten un span comodin que puede requerir un segundo modelo para realinearse.
- La tasa de acierto en junctions (0,935) queda por debajo del objetivo de 0,95 del proyecto; parte de los fallos se atribuyen a errores de corte en MLS, pero la comprobacion es tosca y no todos los fallos estan probados como errores de datos.
- El error de limites de palabra no se ha medido por ausencia de timestamps de referencia en espanol; el offset temporal (0,03 s) se hereda del modelo ingles.
- El modelo solo soporta espanol; no se documenta cobertura multilingue.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si puede producir alineamientos incorrectos cuando la transcripcion no coincide con el audio.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del dataset de entrenamiento (MLS, CC BY 4.0) en despliegues comerciales.
- El rendimiento en audio con ruido, acentos no representados en MLS o habla espontanea no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aloudreader/zipfa-spanish
- Dataset de entrenamiento: https://huggingface.co/datasets/facebook/multilingual_librispeech
- icefall (framework de entrenamiento): https://github.com/k2-fsa/icefall
- onnxruntime: https://onnxruntime.ai/
- onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- kaldi-native-fbank: https://github.com/csukuangfj/kaldi-native-fbank

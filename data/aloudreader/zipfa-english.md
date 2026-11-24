# aloudreader/zipfa-english

## Resumen

zipfa-english es un alineador forzado (forced aligner) basado en un encoder Zipformer con cabecera CTC, desarrollado por el usuario aloudreader y publicado bajo licencia Apache 2.0. No es un modelo de reconocimiento de voz generativo: dado un audio y su transcripcion, devuelve la marca temporal de inicio y fin de cada palabra con una resolucion de 20 ms. Resuelve un problema muy concreto en pipelines de ASR, subtitulado, anotacion fonetica y datasets de habla: obtener timestamps a nivel de palabra fiables sin depender de alineadores clasicos como Montreal Forced Aligner ni de modelos de mayor tamano.

El modelo tiene 9,7 millones de parametros, entrada de filterbank de 80 dimensiones, salida a 50 frames por segundo y se distribuye en formato ONNX (version completa de 47 MB e int8 de 19 MB). Esta entrenado sobre LibriSpeech 960 h y esta pensado para ejecutarse en CPU con un coste muy bajo: factor de tiempo real de 0,008 con int8 y un solo hilo, es decir, unos 40 ms para procesar 5 s de audio. Tambien funciona en navegador mediante onnxruntime-web (WASM).

Su relevancia actual esta en que cubre una tarea auxiliar del ecosistema ASR con un modelo diminuto y desplegable en entornos sin GPU, algo util para herramientas locales, extensiones de navegador y procesamiento masivo de audio en servidores modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Zipformer (icefall) con cabecera CTC |
| Parametros totales | 9,7 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 120 s por llamada; audio de mas de 30 s se procesa en ventanas solapadas de 30 s |
| Tipos de cuantizacion | float (modelo completo) e int8 (model.int8.onnx) |
| Idiomas soportados | ingles; tambien cualquier texto escrito con el alfabeto latino de 26 letras mas apostrofo |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx, model.int8.onnx), tokenizer en tokens.txt y bpe.model, configuracion en zipfa.json |

## Arquitectura y entrenamiento

El modelo es un encoder Zipformer de icefall con cabecera CTC, entrenado con CR-CTC. Recibe filterbanks de 80 dimensiones y emite 50 frames de salida por segundo, lo que da la resolucion temporal de 20 ms que usa el alineador. El tokenizer es a nivel de caracter sobre el alfabeto latino de 26 letras mas apostrofo, lo que limita el alcance a textos que puedan escribirse con ese repertorio.

El entrenamiento se realizo sobre LibriSpeech 960 h (CC BY 4.0) durante 30 epocas, exportando el promedio de las ultimas 10. El desfase temporal se calibro sobre dev_clean con un ajuste de 0,03 s. La exportacion a ONNX incorpora soporte para audio largo mediante ventanas solapadas de 30 s, manteniendo el uso de memoria en torno a 600 MB en modo nativo.

## Capacidades

- Alineacion forzada a nivel de palabra: devuelve inicio y fin de cada palabra del texto proporcionado, con resolucion de 20 ms.
- Entrada de audio a 16 kHz mono, hasta 120 s por llamada.
- Manejo de audio largo mediante ventanas solapadas de 30 s.
- Cuantizacion int8 con la misma precision que el modelo completo y mayor velocidad en CPU.
- Ejecucion en CPU con un solo hilo (RTF 0,008) y en navegador via onnxruntime-web (WASM).
- Tratamiento de palabras fuera del alfabeto: se agrupan en un unico tramo comodin que puede realinearse con un segundo modelo mediante `--second-model-dir`.
- No realiza reconocimiento de voz libre ni generacion de texto: requiere la transcripcion como entrada.
- No dispone de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Subtitulado automatico: dado un audio y su transcripcion (por ejemplo, de un ASR previo), genera timestamps por palabra para construir subtitulos con sincronizacion fina y estilo karaoke, aprovechando la resolucion de 20 ms.
- Anotacion de datasets de habla: alinea grabaciones con sus transcripciones para producir corpus con marcas temporales a nivel de palabra en procesos masivos, gracias a su bajo coste en CPU.
- Herramientas de lectura asistida: en aplicaciones que resaltan el texto a medida que se reproduce el audio, el modelo proporciona el mapeo palabra-audio necesario y puede ejecutarse en el navegador con WASM.
- Verificacion de transcripciones: comparar los tiempos alineados con los esperados permite detectar inserciones, omisiones o desajustes en transcripciones generadas por otros sistemas.
- Procesamiento en servidores sin GPU: al requerir unos 600 MB de memoria en modo nativo y ejecutarse con RTF 0,008 en un hilo, encaja en contenedores modestos o entornos edge para lotes grandes de audio.
- Investigacion en fonetica y prosodia: la alineacion a nivel de palabra sirve como paso previo para extraer segmentos y analizar duraciones, pausas y ritmo en corpus en ingles.
- Extensiones y aplicaciones web: integracion en el cliente mediante onnxruntime-web, con unos 25-35 ms para un clip de 5 s con 8 hilos y unos 275 MB de heap WASM.

## Benchmarks y rendimiento

| Medida | Valor |
|---|---|
| Error de frontera de palabra en LibriSpeech test_clean (1.000 enunciados, frente a Montreal Forced Aligner) | 46,5 ms (int8: 46,5 ms) |
| Fronteras dentro de 50 ms | 68,8% |
| Misma medida con `facebook/wav2vec2-base-960h` a traves del mismo alineador | 54,6 ms |
| Test de union (200 pares de clips unidos por 0,3 s de silencio, tolerancia 0,10 s) | 1,000 |
| Tasa de error de caracter en modo greedy | 0,028 |
| Velocidad, int8, 1 hilo de CPU | factor de tiempo real 0,008 (5 s de audio en unos 40 ms) |
| Velocidad en navegador (WASM, 8 hilos) | 25-35 ms para un clip de 5 s |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta disenado para CPU.
- Memoria en modo nativo: en torno a 600 MB para audio de hasta 120 s.
- Memoria en navegador: unos 275 MB de heap WASM.
- GPU recomendadas: no aplica; no se documenta uso en GPU.
- Cabe en cualquier equipo de consumo: el modelo int8 ocupa 19 MB y el completo 47 MB.
- Opciones de despliegue: onnxruntime (Python) a traves del paquete `zipfa`, CLI `python -m zipfa.cli`, y onnxruntime-web (WASM) en navegador.
- Latencia y throughput: RTF 0,008 con int8 y un hilo de CPU; 25-35 ms por clip de 5 s en navegador con 8 hilos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / audio | Rendimiento | Licencia |
|---|---|---|---|---|---|
| zipfa-english | Zipformer CTC para alineacion forzada | 9,7 M | hasta 120 s por llamada | error de frontera 46,5 ms en test_clean | Apache 2.0 |
| `facebook/wav2vec2-base-960h` (via el mismo alineador) | CTC ASR usado como alineador | no disponible en la informacion | no disponible | error de frontera 54,6 ms en la misma prueba | no disponible en la informacion |
| Montreal Forced Aligner | Alineador clasico (referencia de las timings) | no aplica (herramienta) | no disponible | usado como referencia de comparacion | no disponible en la informacion |

No se dispone de datos de otros alineadores ONNX comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo alinea; no transcribe. Requiere la transcripcion correcta como entrada.
- El alfabeto se limita a las 26 letras latinas mas apostrofo; palabras con otros caracteres (acentos, digitos, signos) se agrupan en un tramo comodin y requieren un segundo modelo para realinearse.
- Idioma principal: ingles. El soporte para otros textos en alfabeto latino no esta validado con metricas en la informacion disponible.
- Precision limitada: solo el 68,8% de las fronteras caen dentro de 50 ms, con un error medio de 46,5 ms.
- Riesgo de desalineacion si la transcripcion no coincide con el audio (errores del ASR previo, habla solapada, ruido).
- El modelo esta calibrado con un desfase de 0,03 s sobre dev_clean; otros dominios pueden requerir recalibracion.
- Licencia Apache 2.0: permite uso comercial con atribucion y conservacion del aviso de licencia; el dataset de entrenamiento (LibriSpeech) es CC BY 4.0.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa muy limitados.
- No se documentan sesgos especificos ni evaluaciones fuera de LibriSpeech.

## Enlaces

- Hugging Face: https://huggingface.co/aloudreader/zipfa-english
- Dataset de entrenamiento: https://huggingface.co/datasets/openslr/librispeech_asr
- icefall (framework de entrenamiento Zipformer): no disponible en la informacion proporcionada
- Repositorio del paquete `zipfa`: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada

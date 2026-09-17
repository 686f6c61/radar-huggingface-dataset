# devendradhakad/autodroid-openai-whisper-tiny

## Resumen

Autodroid-openai-whisper-tiny es una copia del checkpoint whisper-tiny de OpenAI publicada por el usuario devendradhakad en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) y traduccion de voz basado en una arquitectura Transformer encoder-decoder (sequence-to-sequence), con 39 millones de parametros y disenado para funcionar en ventanas fijas de 30 segundos de audio. La model card reproduce integramente la ficha original de OpenAI, por lo que las caracteristicas tecnicas y el entrenamiento descritos corresponden al modelo whisper-tiny, no a una variante entrenada por el autor del repositorio.

El interes de este checkpoint concreto reside en su tamano reducido: con 39 M de parametros es uno de los modelos ASR multilingues mas ligeros disponibles, capaz de ejecutarse en CPU, dispositivos moviles o hardware embebido sin GPU dedicada, y con un coste de memoria inferior a 200 MB en precision completa. Esto lo convierte en una opcion practica para transcripcion en tiempo real de bajo consumo, preprocesado de audio en pipelines grandes o prototipado rapido, siempre asumiendo una precision inferior a la de los checkpoints base, small o large de la misma familia.

El repositorio es una reexportacion sin ajuste fino adicional: no hay evidencia en la informacion disponible de entrenamiento propio, destilacion ni cambios en los pesos. Creado y actualizado el 17 de septiembre de 2026, presenta 0 descargas y 0 likes en el momento de la consulta, por lo que su traccion en el ecosistema es nula y la referencia canonica para produccion sigue siendo el repositorio openai/whisper-tiny.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 39 millones (configuracion "tiny") |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Audio en ventanas de 30 s (1500 posiciones de encoder); 448 posiciones de decodificador |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | 99 idiomas declarados (entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado en la informacion proporcionada (repositorio de tipo transformers en el Hub) |

## Arquitectura y entrenamiento

Whisper es un Transformer encoder-decoder entrenado con 680 000 horas de audio etiquetado mediante supervision debil a gran escala. El encoder procesa espectrogramas log-Mel calculados por el `WhisperProcessor` y el decoder genera texto de forma autorregresiva guiado por tokens de contexto que fijan el idioma (`<|en|>`, `<|es|>`, etc.), la tarea (`<|transcribe|>` o `<|translate|>`) y el modo de marcas de tiempo (`<|notimestamps|>`). La configuracion tiny emplea 4 capas de encoder y 4 de decoder, dimension de modelo de 384, 6 cabezas de atencion y 1500 posiciones maximas de origen, lo que fija la ventana de audio en 30 segundos.

Los checkpoints multilingues, como este, se entrenaron conjuntamente en reconocimiento del habla (transcripcion en el mismo idioma del audio) y traduccion del habla (transcripcion a otro idioma). El objetivo declarado del trabajo original es la generalizacion zero-shot a dominios y datasets no vistos, sin necesidad de ajuste fino. En la informacion disponible no se documentan procesos de RLHF, DPO ni optimizaciones de decodificacion especulativa aplicadas a este repositorio concreto.

## Capacidades

- Reconocimiento automatico del habla multilingue en 99 idiomas declarados, con deteccion de idioma mediante token de contexto.
- Traduccion directa de voz a texto (speech translation) hacia ingles en los checkpoints multilingues de la familia.
- Transcripcion con marcas de tiempo a nivel de palabra y de segmento cuando se activa el modo correspondiente (obtenidas heuristicamente a partir de los pesos de atencion).
- Robustez ante ruido, acentos y vocabulario tecnico gracias al entrenamiento con supervision debil sobre datos heterogeneos.
- Procesamiento de audio largo mediante segmentacion en ventanas de 30 segundos con solapamiento y decodificacion por lotes.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente acustico-textual, sin interfaz de agentes.
- No dispone de capacidades de vision, audio generativo ni modo "thinking"; la salida es exclusivamente texto transcrito o traducido.

## Casos de uso

- Transcripcion en tiempo real en aplicaciones de escritorio o moviles: con 39 M de parametros el modelo puede ejecutarse en CPU o GPU integrada y mantener un factor de tiempo real muy por debajo de 1 incluso sin acelerador dedicado, lo que permite subtitulado en vivo de reuniones o notas de voz.
- Preprocesado masivo de audio en pipelines de datos: util como primer paso barato para transcribir grandes volumenes de grabaciones antes de aplicar un filtrado o una revision con un modelo mayor, reduciendo el coste computacional total.
- Asistencia de accesibilidad: generacion de subtitulos automaticos para videos, pildoras formativas o contenido interno en organizaciones con presupuesto de infraestructura limitado.
- Indexacion y busqueda semantica de archivos de audio: transcripcion de llamadas, podcasts o entrevistas para su posterior indexacion en motores de busqueda de texto completo.
- Despliegue en hardware embebido o edge: al ocupar menos de 200 MB en precision completa, es viable en Raspberry Pi, dispositivos IoT con microfono o navegadores mediante compilacion a WebAssembly.
- Traduccion preliminar de voz en aplicaciones de atencion al cliente internacional: el modo `<|translate|>` permite obtener una version en ingles de audio en otros idiomas como paso previo a un sistema de clasificacion de intenciones.
- Prototipado e investigacion en ASR: sirve como linea base rapida para comparar tecnicas de cuantizacion, adaptacion al dominio o destilacion antes de escalar a checkpoints mayores.
- Transcripcion de contenido en idiomas minoritarios: aunque con calidad desigual, el modelo cubre idiomas como el maori, el hawaiano o el yiddish, utiles en proyectos de documentacion linguistica.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (campo `verified: false`, es decir, no verificados de forma independiente):

| Tarea | Dataset | Idioma | Metrica | Valor |
|---|---|---|---|---|
| ASR | LibriSpeech (clean), split test | en | WER | 7,54 |
| ASR | LibriSpeech (other), split test | en | WER | 17,15 |
| ASR | Common Voice 11.0, config hi, split test | hi | WER | 141 |

Los valores de LibriSpeech son coherentes con la linea base publicada de whisper-tiny. El WER de 141 en hindi sobre Common Voice 11.0 refleja un rendimiento muy pobre en ese idioma y debe tenerse en cuenta antes de plantear despliegues en produccion para hindi. No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que por otra parte no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 155 MB en fp32 y 78 MB en fp16 para los pesos, mas el consumo variable de activaciones y del buffer de audio; por debajo de 1 GB en cualquier configuracion habitual.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100 o H100; el modelo no aprovecha la capacidad de las GPU de gama alta.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU dedicada e incluso en iGPU (Intel Iris Xe, Apple Silicon) y en CPU exclusivamente.
- Opciones de despliegue: pipeline de Transformers con `WhisperProcessor`, whisper.cpp, faster-whisper (CTranslate2), servidores de inferencia compatibles con modelos Whisper; la informacion proporcionada no detalla soporte especifico de vLLM, TGI u Ollama para este repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| devendradhakad/autodroid-openai-whisper-tiny | 39 M | 99 (multilingue) | Apache 2.0 | Hugging Face (repositorio del autor) |
| openai/whisper-tiny | 39 M | 99 (multilingue) | Apache 2.0 | Hugging Face (repositorio oficial) |
| openai/whisper-base | 74 M | 99 (multilingue) | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 99 (multilingue) | Apache 2.0 | Hugging Face |
| openai/whisper-medium | 769 M | 99 (multilingue) | Apache 2.0 | Hugging Face |
| openai/whisper-large-v2 | 1550 M | 99 (multilingue) | Apache 2.0 | Hugging Face |

Los valores de WER de los modelos alternativos no estan disponibles en la informacion proporcionada, por lo que no se incluyen. En terminos de precision esperada, la familia Whisper mejora de forma monotona con el tamano del checkpoint, de modo que base, small, medium y large-v2 ofrecen mayor exactitud a cambio de mas memoria y latencia. Este repositorio aporta exactamente las mismas caracteristicas que openai/whisper-tiny, sin ventajas tecnicas documentadas.

## Limitaciones y advertencias

- Se trata de una copia del checkpoint oficial sin ajuste fino ni cambios documentados; conviene usar openai/whisper-tiny como referencia canonica y comprobar la integridad de los pesos antes de cualquier despliegue.
- El repositorio registra 0 descargas y 0 likes, y no hay senales de mantenimiento; el riesgo de abandono o de eliminacion es alto.
- Riesgo elevado de alucinacion en silencios, musica, ruido de fondo o audio de baja calidad, un comportamiento documentado en la familia Whisper.
- La ventana de 30 segundos obliga a segmentar el audio; una segmentacion incorrecta puede cortar palabras y degradar la transcripcion.
- Rendimiento muy desigual entre idiomas: el WER de 141 en hindi sobre Common Voice 11.0 evidencia que los idiomas de bajos recursos no son fiables para produccion.
- Sesgos potenciales derivados del corpus de entrenamiento (680 000 horas de datos etiquetados de forma debil), con posible peor desempeno en determinados acentos, variedades dialectales y registros informales.
- Las marcas de tiempo se derivan de heuristicas sobre los pesos de atencion, no de un modulo entrenado especificamente, por lo que su precision es limitada.
- No incluye diarizacion de hablantes ni deteccion de emociones.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y se documenten los cambios; al derivar de un modelo de OpenAI, conviene revisar tambien los terminos del repositorio original.
- No se han publicado resultados de benchmarks verificados de forma independiente para este repositorio concreto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/devendradhakad/autodroid-openai-whisper-tiny
- Repositorio oficial del checkpoint original: https://huggingface.co/openai/whisper-tiny
- Paper de referencia: Robust Speech Recognition via Large-Scale Weak Supervision, https://arxiv.org/abs/2212.04356
- Repositorio de codigo original: https://github.com/openai/whisper
- Listado de checkpoints de la familia: https://huggingface.co/models?search=openai/whisper
- Muestras de audio de ejemplo citadas en la model card: https://cdn-media.huggingface.co/speech_samples/sample1.flac y https://cdn-media.huggingface.co/speech_samples/sample2.flac

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre Whisper; los unicos enlaces utiles proceden de la model card y del repositorio de Hugging Face.

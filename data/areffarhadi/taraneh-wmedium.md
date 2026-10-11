# areffarhadi/Taraneh-WMedium

## Resumen

Taraneh-WMedium es un modelo de reconocimiento automatico del habla (ASR) para persa, desarrollado por Aref Farhadipour (University of Zurich) y publicado bajo el identificador areffarhadi/Taraneh-WMedium. Forma parte de la familia Taraneh, un conjunto de cinco modelos ASR en persa afinados sobre aproximadamente 1560 horas de audio, cuyo punto de partida en este caso es el checkpoint openai/whisper-medium de OpenAI.

El modelo resuelve la transcripcion de audio a texto en farsi, con especial atencion a dominios dificiles como el habla conversacional, el audio de medios (YouTube, television) y el canto o musica vocal, un escenario tradicionalmente problematico para los sistemas ASR. Su relevancia actual radica en cubrir el persa, un idioma con menos recursos que el ingles o el espanol, con un rendimiento competitivo en corpus de referencia como FLEURS (4,16 % WER) y Common Voice (3,47 % WER).

Tecnicamente hereda la arquitectura transformer encoder-decoder de Whisper-medium (unos 769 millones de parametros) con una ventana de audio fija de 30 segundos por fragmento, licencia MIT para uso comercial y soporte de inferencia rapida mediante CTranslate2 o whisper.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), derivado de openai/whisper-medium |
| Parametros totales | ~769 millones (checkpoint base whisper-medium) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio fija de 30 segundos por fragmento (arquitectura Whisper) |
| Tipos de cuantizacion | no publicados por el autor; el checkpoint es compatible con float16, int8 y cuantizacion GGUF a traves de whisper.cpp y CTranslate2 |
| Idiomas soportados | persa (farsi), codigo fa |
| Licencia | MIT |
| Formato de pesos | formato nativo de Transformers (safetensors / PyTorch); no se incluyen conversiones GGUF ni CTranslate2 en el repositorio |

## Arquitectura y entrenamiento

Taraneh-WMedium reutiliza integramente la arquitectura de openai/whisper-medium, un transformer encoder-decoder con aproximadamente 769 millones de parametros, 24 capas de encoder, 24 capas de decoder, dimensionalidad de modelo de 1024 y 16 cabezas de atencion. La entrada se procesa como un espectrograma mel de 80 canales en ventanas de 30 segundos, que se transcriben de forma autorregresiva junto con posibles marcas de tiempo. El modelo no introduce cambios arquitectonicos respecto al checkpoint base; la adaptacion al persa se realiza exclusivamente mediante ajuste fino.

El ajuste fino se llevo a cabo sobre aproximadamente 1560 horas de audio en persa, segun indica la model card y el articulo asociado (Taraneh-ASR: Scaling Persian Speech Recognition and Forced Alignment Across Singing and Conversational Domains). El trabajo forma parte de una familia de cinco modelos Taraneh, orientada tanto a reconocimiento del habla como a alineacion forzada en dominios de canto y conversacion. No se detalla en la informacion disponible la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. Los resultados publicados indican que dos de los corpus de evaluacion (PSRB y VisualEars) no se vieron durante el entrenamiento, por lo que constituyen pruebas fuera de dominio.

## Capacidades

- Transcripcion de audio a texto en persa (farsi) con un unico idioma soportado.
- Reconocimiento de habla en dominios diversos: conversacional, medios (YouTube, television), audio general y musica vocal.
- Prediccion de marcas de tiempo inherente a la arquitectura Whisper (util para subtitulado y alineacion).
- Alineacion forzada de texto y audio, segun se describe en el articulo Taraneh-ASR.
- Inferencia acelerada mediante CTranslate2, segun los scripts del repositorio de GitHub.
- No soporta tool calling ni function calling.
- No implementa modos de agente ni razonamiento multi-paso (es un modelo puramente ASR).
- No dispone de capacidades de vision, audio generativo ni sintesis de voz.
- No es multilingue: esta especializado exclusivamente en persa.

## Casos de uso

- Subtitulado automatico de video en persa: el modelo transcribe audio de YouTube o television y, al conservar la capacidad de prediccion de marcas de tiempo de Whisper, permite generar subtitulos sincronizados sin herramientas externas de alineacion.
- Transcripcion de podcasts y entrevistas: con una ventana de 30 segundos por fragmento y un WER del 3,47 % en Common Voice, es adecuado para convertir grandes volumenes de habla conversacional en texto indexable.
- Letras de canciones y karaoke: el modelo esta especificamente entrenado para dominios de musica vocal (WER del 22,79 % en el corpus Music), lo que lo hace util en escenarios donde los ASR genericos fallan al separar voz y acompanamiento.
- Atencion al cliente y analitica de llamadas: la transcripcion de conversaciones telefonicas en persa permite alimentar sistemas de analisis de sentimiento, busqueda o control de calidad; la licencia MIT no impone restricciones al uso en servicios alojados.
- Archivo y busqueda de contenido audiovisual: transcripcion masiva de un catalogo de medios para habilitar busqueda semantica por texto sobre audio historico o de archivo.
- Generacion de datos para TTS y NLP en persa: la funcion de alineacion forzada permite construir corpus texto-audio alineados a nivel de palabra o fonema, utiles para entrenar modelos de sintesis de voz.
- Accesibilidad: generacion de subtitulos en directo o en diferido para personas con discapacidad auditiva en contenido en persa.
- Investigacion linguistica y dialectologia: transcripcion de corpus de habla espontanea persa para estudios foneticos, lexicos o sociolinguisticos.

## Benchmarks y rendimiento

Resultados de WER / CER (%) tras la normalizacion unificada de texto en persa, segun la model card del autor:

| Corpus | WER (%) | CER (%) |
|---|---:|---:|
| FLEURS | 4,16 | 1,52 |
| Common Voice | 3,47 | 1,67 |
| YouTube | 14,29 | 8,26 |
| Music | 22,79 | 10,92 |
| Media | 14,97 | 8,99 |
| PSRB | 19,14 | 8,73 |
| VisualEars | 6,23 | 1,89 |

PSRB y VisualEars no se vieron durante el entrenamiento. La comparativa completa de los cinco modelos Taraneh aparece en el articulo y en el README del repositorio de GitHub. No se han publicado datos de latencia ni de throughput en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en float16 el checkpoint de 769 millones de parametros ocupa aproximadamente 1,5 GB; en int8 unos 0,8 GB. A esto hay que sumar el consumo del runtime (CTranslate2, PyTorch o whisper.cpp).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. Una RTX 3060, RTX 4060 o RTX 4090 ejecutan el modelo con holgura; una A100 o H100 solo se justifica para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Ejecucion en CPU: viable mediante whisper.cpp o CTranslate2 en modo int8, con velocidad dependiente del numero de nucleos.
- Opciones de despliegue: Transformers (WhisperForConditionalGeneration), CTranslate2 (ruta rapida recomendada por el autor), whisper.cpp / llama.cpp para cuantizacion GGUF, y FastAPI o servicios similares para exposicion como API.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER en persa |
|---|---|---|---|---|---|
| Taraneh-WMedium | ~769 M | 30 s por fragmento | persa | MIT | 4,16 % (FLEURS), 3,47 % (Common Voice) |
| openai/whisper-medium | ~769 M | 30 s por fragmento | multilingue | MIT | no disponible |
| openai/whisper-large-v3 | ~1550 M | 30 s por fragmento | multilingue | MIT | no disponible |
| Otros modelos ASR en persa | no disponible | no disponible | persa | no disponible | no disponible |

No se dispone en la informacion proporcionada de cifras de WER para los modelos comparables en persa, por lo que no es posible una comparacion numerica directa con Whisper-medium original ni con Whisper-large-v3. La ventaja principal de Taraneh-WMedium frente al checkpoint base es su especializacion en persa y en dominios como musica y medios, a costa de perder cobertura multilingue.

## Limitaciones y advertencias

- Especializado exclusivamente en persa: no reconoce otros idiomas, aunque la arquitectura Whisper base sea multilingue.
- Riesgo elevado de error en musica y audio ruidoso: el WER del 22,79 % en el corpus Music y del 19,14 % en PSRB refleja un rendimiento sensiblemente peor que en habla limpia.
- Alucinacion y transcripciones inventadas: como todo modelo Whisper, puede generar texto plausible en fragmentos de silencio, ruido o habla no persa.
- Repositorio sin validacion comunitaria: el modelo registra 0 descargas y 0 me gusta en el momento de la consulta y el tamano del repositorio aparece como 0,0 GB, por lo que conviene verificar los pesos antes de usarlos en produccion.
- Cobertura de contexto limitada por diseno: la ventana de 30 segundos obliga a segmentar audios largos y a gestionar la continuidad entre fragmentos.
- Sesgos potenciales derivados del dataset de 1560 horas: no se documenta su composicion demografica, por lo que puede haber peor rendimiento en determinados acentos, generos o registros.
- Licencia MIT: permite uso comercial, incluidos productos y servicios alojados, siempre que se conserve el aviso de licencia original de Whisper y el del modelo.
- Falta de cuantizaciones oficiales: cualquier conversion a GGUF o CTranslate2 debe realizarla el usuario, con la consiguiente necesidad de validar que no degrada la precision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/areffarhadi/Taraneh-WMedium
- Repositorio de codigo, manifiestos, normalizacion e inferencia: https://github.com/areffarhadi/persian-asr
- PDF del articulo (Taraneh-ASR: Scaling Persian Speech Recognition and Forced Alignment Across Singing and Conversational Domains): https://github.com/areffarhadi/persian-asr/blob/main/ArefFarhadi-TaranehASR.pdf
- Modelo base: https://huggingface.co/openai/whisper-medium

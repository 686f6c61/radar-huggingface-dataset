# Ashreef/sonelgaz-darija-asr

## Resumen

El modelo `Ashreef/sonelgaz-darija-asr` es un ajuste fino completo (*full fine-tune*) del checkpoint `openai/whisper-large-v3-turbo` de OpenAI, especializado en reconocimiento automático de voz (ASR) para dariya argelina y habla con alternancia de codigo dariya/frances. Lo desarrolla el usuario Ashreef en el contexto de un hackathon de ASR para el centro de llamadas de SONELGAZ, aunque el autor declara explicitamente que no se utilizaron grabaciones reales de SONELGAZ en el entrenamiento. El modelo resuelve un problema concreto y poco cubierto: la transcripcion de un dialecto arabe sin ortografia estandar y con mezcla frecuente de frances, algo que los modelos Whisper genericos manejan con tasas de error muy altas.

Arquitectonicamente es un transformer encoder-decoder de tipo Whisper, con 808.878.080 parametros (aproximadamente 809 millones) almacenados en safetensors y fp16, lo que da un repositorio de 1,6 GB. La innovacion no esta en la arquitectura, sino en el corpus de entrenamiento: unas 105 horas por epoca de audio publico filtrado, con aumento de datos telefonicos (canal de 8 kHz, banda 300-3400 Hz, μ-law), ruido, ganancia y SpecAugment, ademas de concatenacion sintetica de fragmentos para simular la alternancia de codigo.

Su relevancia actual es doble: por un lado, demuestra que un ajuste fino relativamente economico sobre Whisper-large-v3-turbo puede reducir el WER en dariya argelina de un 52,6 % a un 43,9 % en el conjunto de test CAFE; por otro, documenta de forma transparente las fuentes descartadas y las limitaciones de licencia, algo poco habitual en modelos de nicho linguistico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-large-v3-turbo) |
| Parametros totales | 808.878.080 (aproximadamente 809 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por chunk en la pipeline; `chunk_length_s=30`) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16; no se documentan GGUF, int8 ni otras variantes) |
| Idiomas soportados | arabe (ar), frances (fr), dariya argelina (arq) |
| Licencia | no disponible en los metadatos; la model card restringe el uso a investigacion y evaluacion, no a despliegue comercial |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3-turbo`, un transformer encoder-decoder con atencion estandar y decodificacion autoregresiva, y se somete a un ajuste fino completo de todos los parametros (no se trata de un adaptador LoRA ni de un destilado). El entrenamiento cubre aproximadamente 105 horas por epoca con datos publicos filtrados: colecciones argelinas de oddadmix (podcast Kahwa, 19,7 h tras descartar filas con frances en escritura arabe y triplicando las filas con frances en escritura latina; historias rawi, 12,9 h; subconjunto de historias Loubna, 10 h), 25 h de `yasminekaced/algerian_tts`, 10,3 h de FLEURS fr_fr duplicadas para reforzar el frances, y fragmentos sinteticos de alternancia de codigo creados concatenando clips de dariya y frances.

El pipeline de aumento incluye simulacion de canal telefonico (filtrado 300-3400 Hz, remuestreo a 8 kHz, compresion μ-law), adicion de ruido, variacion de ganancia y SpecAugment. El autor documenta explicitamente fuentes rechazadas por calidad o idioma incorrecto: el corpus "Algerian STT" de quantumpuls3 (en realidad marroqui, egipcio y del Golfo), las pseudo-etiquetas de CAFE-large (arabe estandar moderno) y clips medicos de ElevenLabs-TTS. La convencion de salida es mixta: dariya en escritura arabe y palabras francesas o inglesas en escritura latina.

## Capacidades

- Transcripcion de voz a texto en dariya argelina, con salida en escritura arabe.
- Transcripcion de habla con alternancia de codigo dariya/frances, manteniendo el frances en caracteres latinos.
- Transcripcion de frances estandar (FLEURS fr), con degradacion minima respecto al modelo base.
- Deteccion automatica de idioma en la pipeline, o forzado mediante `generate_kwargs={"language": "ar"}`.
- Procesamiento de audio a cualquier frecuencia de muestreo (la pipeline remuestrea internamente).
- Robustez ante audio telefonico degradado: el canal de 8 kHz con μ-law se simulo durante el entrenamiento.
- Segmentacion por VAD y procesamiento por chunks de 30 s con `batch_size` configurable, lo que permite audios de duracion arbitraria.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de llamadas de atencion al cliente en Argelia: el modelo esta entrenado con simulacion de canal telefonico a 8 kHz y μ-law, por lo que puede transcribir grabaciones de centralita con una degradacion controlada (WER de 45,2 en CAFE-test telefonico frente a 56,5 del modelo base).
- Generacion de subtitulos para contenido audiovisual argelino: podcasts como Kahwa o historias rawi forman parte del corpus, y la ventana de 30 s por chunk con VAD permite procesar episodios largos por lotes.
- Analisis de calidad y compliance en centros de llamadas: la transcripcion permite buscar terminos, detectar incidencias y generar informes sobre conversaciones dariya/frances sin intervencion manual.
- Investigacion linguistica sobre dariya argelina: la salida mixta arabe/latin y la normalizacion documentada (variantes de letras, eliminacion de diacriticos) facilitan la anotacion y el analisis de corpus.
- Evaluacion comparativa de ASR en dialectos arabes: sirve como referencia reproducible sobre CAFE-test, con metricas WER y CER publicadas y normalizacion explicita.
- Prototipado de asistentes de voz para servicios publicos argelinos: al soportar alternancia de codigo, puede integrarse en un pipeline de ASR mas NLU para consultas de facturacion o incidencias tecnicas.
- Transcripcion de reuniones internas bilingues en entornos empresariales argelinos donde se mezcla frances y dariya de forma natural.

## Benchmarks y rendimiento

Resultados publicados por el autor en conjuntos de test held-out, con segmentacion por VAD y deteccion automatica de idioma. Cada celda es WER / CER. "Telephone" indica audio degradado de forma deliberada con un canal telefonico simulado de 8 kHz y μ-law.

| Conjunto de test | whisper-large-v3-turbo zero-shot | Este modelo |
|---|---|---|
| CAFE-test, todos (116 utts, 1,6 h, dariya/frances argelino) | 52,6 / 31,7 | 43,9 / 22,2 |
| CAFE-test, dariya pura | 47,6 / 24,3 | 42,1 / 18,7 |
| CAFE-test, mixto dariya+frances | 58,9 / 40,9 | 46,0 / 26,6 |
| CAFE-test, telefonico | 56,5 / 35,3 | 45,2 / 22,6 |
| FLEURS fr test | 6,3 / 2,4 | 6,5 / 2,6 |
| FLEURS fr test, telefonico | 7,4 / 3,0 | 8,5 / 3,6 |

Con una normalizacion tolerante a la ortografia dariya (تاع=تع, اللي=لي, عنده=عندو, etc.), el WER en CAFE-test baja a 41,0. La normalizacion aplicada en la tabla incluye minusculas, eliminacion de puntuacion y diacriticos, unificacion de variantes de letras arabes (أإآ→ا, ة→ه, ى→ي, ڨ→ق) y conservacion de acentos franceses.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,6-2 GB solo para los pesos, mas overhead de activaciones y cache de atencion; en la practica, unos 3-4 GB con `batch_size=8` y chunks de 30 s.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM. Una RTX 4090, A100 o H100 ofrecen margen sobrado y permiten aumentar `batch_size` para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090. Tambien en GPUs de 8 GB con batch reducido.
- Opciones de despliegue: `transformers` pipeline con `torch_dtype="float16"` y `device="cuda:0"`; el modelo es compatible con el ecosistema Whisper, por lo que puede servirse con TGI, vLLM (soporte Whisper) o exportarse a otros runtimes, aunque no se documentan conversiones a GGUF ni a llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen del `batch_size`, la longitud del audio y la GPU; el uso de `chunk_length_s=30` con batching es el patron recomendado por el autor.
- Requiere `ffmpeg` instalado si se pasa una ruta de fichero; alternativamente, se puede pasar un array de audio con `soundfile` y `sampling_rate`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | WER CAFE-test |
|---|---|---|---|---|---|
| Ashreef/sonelgaz-darija-asr | 809 M | chunks de 30 s | ar, fr, arq | no disponible (uso solo de investigacion segun model card) | 43,9 |
| openai/whisper-large-v3-turbo (zero-shot) | 809 M | chunks de 30 s | multilingue (incluye ar, fr) | MIT (modelo base de OpenAI) | 52,6 |
| openai/whisper-large-v3 | 1,55 B | chunks de 30 s | multilingue | MIT | no disponible en la informacion proporcionada |
| Modelos ASR especificos de dariya marroqui/argelino | no disponible | no disponible | arq | no disponible | no disponible |

La comparativa directa solo es posible con el modelo base, ya que el autor no incluye otros sistemas de referencia en la model card. Frente a Whisper-large-v3-turbo zero-shot, la mejora es de 8,7 puntos de WER en CAFE-test global, 5,5 en dariya pura, 12,9 en mixto y 11,3 en telefonico. En frances estandar el ajuste fino introduce una degradacion leve (de 6,3 a 6,5 en FLEURS fr y de 7,4 a 8,5 en telefonico).

## Limitaciones y advertencias

- Licencia no disponible en los metadatos y restriccion explicita del autor: varios corpus de entrenamiento tienen "derechos reservados por los creadores originales", por lo que el modelo debe usarse solo para investigacion y evaluacion, no para despliegue comercial.
- El modelo no se evaluo con audio real de centro de llamadas; la robustez telefonica se basa en simulacion (8 kHz, μ-law, banda 300-3400 Hz).
- La dariya no tiene ortografia estandar, por lo que el WER sobreestima la tasa de error real; el autor recomienda usar CER como metrica principal.
- Riesgo de alucinacion inherente a los modelos Whisper en segmentos con silencio, ruido extremo o audio musical; no se documentan mitigaciones especificas.
- Cobertura limitada a tres idiomas (ar, fr, arq); no se ha evaluado en otros dialectos arabes ni en arabe estandar moderno, y el autor descarto explicitamente corpus de MSA.
- Sesgos potenciales derivados del corpus: predominio de voces de podcast, TTS sintetico y FLEURS; posible infrarepresentacion de voces mayores, acentos regionales no argelinos o habla espontanea con ruido de fondo real.
- El repositorio tenia 0 descargas y 0 likes en el momento de la consulta, y la model card menciona que el repo podia ser privado (`add token="hf_..." while the repo is private`), lo que sugiere un estado de publicacion reciente o restringido.
- Sin datos sobre cuantizaciones (GGUF, int8, AWQ), lo que limita el despliegue en CPU o en GPUs de gama muy baja sin trabajo adicional de conversion.
- El modelo base Whisper-large-v3-turbo es de OpenAI con licencia MIT, pero la licencia final del ajuste fino no esta declarada, lo que genera ambiguedad juridica para uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ashreef/sonelgaz-darija-asr
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset FLEURS (usado en entrenamiento y evaluacion): https://huggingface.co/datasets/google/fleurs
- Dataset yasminekaced/algerian_tts: https://huggingface.co/datasets/yasminekaced/algerian_tts
- Colecciones oddadmix (podcast Kahwa, historias rawi, historias Loubna): no disponible (enlace no incluido en la informacion proporcionada)
- Conjunto de evaluacion CAFE-test: no disponible (enlace no incluido en la informacion proporcionada)
- Paper de Whisper (Radford et al.): https://arxiv.org/abs/2212.04356
- Repositorio de transformers: https://github.com/huggingface/transformers

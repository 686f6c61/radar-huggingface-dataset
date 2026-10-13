# alibiserikbay/k5-kazakh-russian-stt

## Resumen

K5 Kazakh–Russian STT es un modelo de reconocimiento automatico del habla (ASR) especializado en kazajo, ruso y habla mixta kazajo-rusa, publicado por el usuario alibiserikbay en HuggingFace. Se trata de un Conformer-CTC de 585.330.119 parametros (denominado "600M" por el autor) afinado a partir de ai-sage/GigaAM-Multilingual `large_ctc` sobre 2.364 horas de datos abiertos, con augmentation de linea telefonica y mezclas kk↔ru. El modelo se distribuye con un pipeline de streaming de dos pasadas, modelos de lenguaje KenLM de 4-gramas y normalizacion inversa de texto (ITN) para digitos, fechas y cantidades.

Su relevancia esta en cubrir un nicho poco atendido: el code-switching kazajo-ruso, frecuente en contexts reales de telefonia, television y podcast, donde los modelos Whisper genericos obtienen WER muy superiores. En el conjunto KSC2 de habla mixta el modelo reporta 11,19 % de WER con KenLM, frente a 20,98 % de un whisper-large-v3 afinado y 56,47 % de whisper-large-v3-turbo.

El repositorio incluye tanto el modelo offline (segmentos de hasta 30 s) como una variante chunk-aware para parciales en streaming, ademas de un motor con cache, un motor de batch multi-stream por GPU, VAD Silero en ONNX y utilidades de transcripcion por linea de comandos. La licencia es CC-BY-SA-4.0 y el repo ocupa 12,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (encoder Conformer con cabecera CTC); variante adicional chunk-aware/cache-aware para streaming |
| Parametros totales | 585.330.119 (~585 M; el autor lo etiqueta como 600M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | No es un modelo de texto. Offline: segmentos de audio de hasta 30 s. Streaming: ventanas (chunks) de 320 o 640 ms con cache |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; solo safetensors en la precision original y ONNX para el VAD) |
| Idiomas soportados | kazajo (kk) y ruso (ru), incluido habla mixta kk↔ru |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (modelo offline y modelo de streaming), ONNX (`vad/vad.onnx`), binarios KenLM 4-gram (`lm/kk.bin`, `lm/ru.bin`, `lm/kkru.bin`) |
| Libreria | transformers (`trust_remote_code=True`, `modeling_gigaam.py`) |
| Tamano del repositorio | 12,7 GB |
| Descargas / likes | 8 / 0 |
| Fecha de creacion / actualizacion | 2026-10-08 / 2026-10-12 |

## Arquitectura y entrenamiento

El modelo es un Conformer-CTC: un encoder de tipo Conformer (convoluciones mas atencion) con una cabeza de clasificacion CTC, heredado de GigaAM-Multilingual `large_ctc` y afinado por el autor. El repositorio contiene dos variantes con el mismo formato: el modelo offline, pensado para transcribir segmentos de hasta 30 s y usado para generar las transcripciones finales, y un modelo chunk-aware alojado en `streaming/`, que produce parciales sobre un motor con cache cuyo texto ya emitido nunca se modifica. El autor lo describe como un sistema de dos pasadas: los parciales salen del modelo chunk-aware cada 320 o 640 ms y los finales se regeneran con el modelo offline al detectar una pausa.

Los datos de entrenamiento declarados son 2.364 horas de datos abiertos, principalmente `issai/Kazakh_Speech_Corpus_2` y `google/fleurs`, complementados con augmentation de linea telefonica y ejemplos de habla mezclada kk↔ru. No se menciona en la informacion disponible el uso de RLHF ni DPO (no aplicables a un modelo CTC de ASR). Sobre la salida CTC se aplican tecnicas de decodificacion: greedy, beam search y beam con KenLM 4-grama (con pesos α/β ajustados en dev y guardados en `lm_weights.json`), mas normalizacion inversa de texto para digitos, fechas y dinero. El pipeline de despliegue incluye endpointing con Silero VAD y control automatico de ganancia, y soporta listas de hotwords.

## Capacidades

- Reconocimiento de voz en kazajo, ruso y habla mixta kazajo-ruso dentro de la misma emision (code-switching).
- Transcripcion offline de segmentos de audio de hasta 30 s, devolviendo texto en forma hablada y en minusculas.
- Streaming de dos pasadas con parciales cada 320 o 640 ms y finales estables al detectar pausa (VAD Silero).
- Decodificacion con modelo de lenguaje KenLM 4-grama (kazajo, ruso y mixto) y beam search; soporte de hotwords personalizadas.
- Normalizacion inversa de texto (ITN) para kazajo: digitos, fechas y cantidades monetarias.
- Ejecucion en batch con multiples streams por GPU (`deploy/batch_engine.py`) y CLI de transcripcion (`deploy/transcribe_stream.py`), incluyendo entrada por microfono.
- Robustez declarada ante audio telefonico (augmentation de linea telefonica) y audio lejano (far-field).
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio generation; es exclusivamente un modelo ASR.
- Solo dos idiomas (kk, ru); no se declara soporte multilingue adicional.

## Casos de uso

- Transcripcion de centros de contacto kazajos: con 9,86 % de WER en FLEURS kk con augmentation telefonica y 9,39 % con KenLM, el modelo es adecuado para procesar llamadas reales donde alternan kazajo y ruso, algo que los modelos Whisper genericos penalizan fuertemente (56,47 % de WER en habla mixta).
- Subtitulado en directo de television o streaming: los parciales cada 320 ms con un retardo de 0,49 s (ultima palabra tentativa) o 0,72 s (estable) permiten mostrar texto en tiempo real, y los finales se consolidan en cada pausa.
- Asistentes de voz e IVR en kazajo y ruso: el endpointing con Silero VAD integrado y la salida JSON por lineas (`partial` / `final`) facilitan la integracion con logica de dialogo, sin necesidad de un componente externo de deteccion de actividad de voz.
- Indexacion y busqueda de archivos audiovisuales: el motor de batch permite procesar muchos streams por GPU (unos 16 streams en tiempo real por H100 con chunks de 640 ms), adecuado para digitalizar archivos de podcast, parlamento o television (13,56 % de WER en podcasts KSC2 con KenLM).
- Analitica y cumplimiento en telefonia: la transcripcion con KenLM y la ITN de digitos y fechas facilitan extraer entidades como importes o fechas en conversaciones de atencion al cliente, con hotwords para nombres propios de empresas o personas.
- Notas de reunion y actas en entornos bilingues: la ventana de 30 s del modelo offline y el pipeline de dos pasadas permiten transcribir reuniones donde los participantes alternan idiomas sin reconfigurar el sistema.
- Transcripcion en tiempo real con microfono local: el CLI acepta entrada de `arecord` por tuberia y funciona con beam search sin KenLM (`--lm beam`) cuando se busca menor consumo de recursos, con 10,3 % de WER frente a 11,1 % con KenLM en 100 llamadas simuladas.

## Benchmarks y rendimiento

WER en %, con intervalos de confianza bootstrap del 95 % (2.000 remuestreos) donde se indican. Todos los sistemas se evaluaron sobre las mismas emisiones con el mismo normalizador (minusculas, sin puntuacion, digitos conservados).

| Conjunto de test (emisiones) | K5 + KenLM | K5 (greedy) | sybyrla (whisper-large-v3 FT) | shyngys879 kazakh-whisper-turbo | Meta omniASR CTC-1B v2 | whisper-large-v3-turbo |
|---|---|---|---|---|---|---|
| FLEURS kk (600) | **9,14** [8,10; 10,20] | 9,35 | 11,64 | 11,58 | 13,34 | 20,98 |
| FLEURS kk, numeros como digitos (ITN-fair) | **5,85** | 6,07 | 11,64 | 11,58 | 13,30 | 21,06 |
| FLEURS ru (600) | 6,06 | 6,72 | – | – | 11,99 | **4,32** |
| FLEURS ru, referencias sin digitos | **2,60** | 3,14 | – | – | 11,03 | 3,72 |
| kk↔ru mixto, KSC2 (175) | **11,19** | 12,88 | 20,98 | 16,81 | 40,98 | 56,47 |
| KSC2 podcasts (600) | **13,95** | 14,99 | – | 17,49 | 43,56 | 62,51 |
| KSC2 TV news (600) | – | **3,67** | – | 5,60 | 22,51 | 49,13 |
| Golos far-field ru (600) | **4,45** | 5,53 | – | – | 42,17 | 16,34 |

Diferencias pareadas frente a K5 + KenLM en FLEURS kk: shyngys879 +2,44 [+1,91; +2,95]; sybyrla +2,49 [+1,22; +4,30]; omniASR CTC-1B +4,19 [+3,10; +5,23]. En ruso FLEURS, Whisper escribe los numeros como digitos igual que las referencias, por lo que lidera en WER sobre referencias con digitos; sobre emisiones sin digitos K5 obtiene mejor resultado. Los modelos externos se decodificaron con greedy en CPU y los Whisper con temperature fallback.

Comparacion con la version anterior `kazakh-russian-mixed-stt` (wav2vec2 + KenLM), WER sobre los conjuntos completos:

| Conjunto | v1 greedy | v1 + KenLM | K5 | K5 + KenLM |
|---|---|---|---|---|
| FLEURS kk | 16,88 | 12,76 | 9,28 | **9,00** |
| FLEURS kk, telefonia | 20,73 | 14,82 | 9,86 | **9,39** |
| FLEURS ru | 12,34 | 10,47 | 6,78 | **6,11** |
| FLEURS ru, telefonia | 13,60 | 11,27 | 6,97 | **6,22** |
| kk↔ru KSC2 | 27,80 | 18,88 | 12,88 | **11,19** |
| KSC2 read | 10,23 | 4,27 | 4,61 | **3,18** |
| KSC2 podcasts | 24,77 | 20,68 | 14,65 | **13,56** |
| KSC2 parliament | 11,13 | 8,73 | **7,08** | – |
| Golos far-field | 14,85 | 11,27 | 5,42 | **3,94** |

Streaming (dos pasadas), 100 llamadas simuladas de 4.308 palabras en total: WER final con segmentacion en vivo 9,03 frente a 8,84 offline (delta +0,19 [−0,41; +0,80]); con `--eou 0,8` baja a 8,89 con un retardo de +0,3 s. Retardo de parciales con chunks de 320 ms y 4 hilos de CPU: 0,49 s con ultima palabra tentativa (5,7 % se corrigen) y 0,72 s solo estable (nunca se corrige); en GPU, 0,39 s y 0,62 s respectivamente. La precision de los parciales es el punto debil declarado: sin lookahead, FLEURS kk da 12,7 con chunks de 640 ms y 14,2 con 320 ms, y 30–35 en habla espontanea; el autor recomienda usar los finales como transcripcion.

## Requisitos de hardware

- VRAM estimada (calculo a partir del numero de parametros, no dato publicado): unos 1,2 GB por modelo en bf16 y 2,3 GB en fp32; el sistema completo con modelo offline mas modelo de streaming ronda los 2,4 GB en bf16 y 4,7 GB en fp32. El modelo base original esta marcado como cuantizado (`base_model:quantized:ai-sage/GigaAM-Multilingual`).
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o mas (RTX 3050, 3060, 4060, 4090) es suficiente para inferencia. No se documentan requisitos especificos de arquitectura por debajo de eso.
- CPU: el autor reporta mediciones sobre un Xeon 8570 con 4 hilos (107 ms por chunk de 320 ms en el motor de parciales; 246 ms en bf16/AMX para la pasada final de un segmento de 10 s).
- GPU recomendadas para produccion: H100 (18,5 ms por chunk de 320 ms; ~18 ms por pasada final de 10 s; ~16 streams en tiempo real a 640 ms por GPU, dato truncado en la model card). No se publican datos para A100 u otras tarjetas.
- Latencia percibida: parciales con 0,49/0,72 s de retardo (CPU) o 0,39/0,62 s (GPU); final tras el fin del habla ≈0,85 s en CPU y ≈0,62 s en GPU.
- Opciones de despliegue documentadas: `transformers` con `trust_remote_code=True`, `deploy/twopass.py`, `deploy/cache_engine.py`, `deploy/batch_engine.py`, CLI `deploy/transcribe_stream.py`, `pyctcdecode` + `kenlm` para beam con KenLM y `onnxruntime` para el VAD. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo CTC de ASR sin conversion previa).
- Dependencias declaradas: torch, torchaudio, transformers, safetensors, hydra-core, omegaconf, sentencepiece, onnxruntime, pyctcdecode, kenlm, soundfile y scipy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / enfoque | WER FLEURS kk | WER kk↔ru KSC2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| K5 Kazakh–Russian STT | 585 M | Streaming de dos pasadas, chunks de 320/640 ms, KenLM kk/ru | 9,14 (con KenLM) | 11,19 (con KenLM) | cc-by-sa-4.0 | HuggingFace, repo de 12,7 GB, 8 descargas |
| whisper-large-v3-turbo | no disponible en la informacion proporcionada | Offline, multilingue generico | 20,98 | 56,47 | no disponible | no disponible |
| sybyrla (whisper-large-v3 fine-tuned) | no disponible | Offline, afinado para kazajo | 11,64 | 20,98 | no disponible | no disponible |
| shyngys879 kazakh-whisper-turbo | no disponible | Offline, orientado a kazajo | 11,58 | 16,81 | no disponible | no disponible |
| Meta omniASR CTC-1B v2 | ~1 B (segun su nombre) | CTC multilingue de proposito general | 13,34 | 40,98 | no disponible | no disponible |
| kazakh-russian-mixed-stt v1 (wav2vec2 + KenLM) | no disponible | Offline, predecesor del autor | 12,76 (con KenLM) | 18,88 (con KenLM) | no disponible | no disponible |

## Limitaciones y advertencias

- Los parciales del streaming son el punto debil declarado: 12,7 % de WER en FLEURS kk con chunks de 640 ms, 14,2 % con 320 ms y 30–35 % en habla espontanea. El autor recomienda tratar los finales como transcripcion definitiva y los parciales solo como texto provisional.
- Los parciales sin lookahead necesitan un esquema tentativo (0,49 s de retardo, con un 5,7 % de palabras corregidas) o asumir 0,72 s si se exige texto nunca corregido.
- En ruso con referencias que usan digitos, whisper-large-v3-turbo supera al modelo (4,32 frente a 6,06 en FLEURS ru); la ventaja de K5 aparece en referencias sin digitos.
- El modelo solo cubre kazajo y ruso; no hay soporte declarado para otras lenguas ni para audio con musica o solapamiento de hablantes.
- Es un modelo ASR puro: no genera texto libre, no hace razonamiento, tool calling ni agentes; no debe compararse con modelos de lenguaje.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a atribucion y a distribuir las obras derivadas bajo la misma licencia. Conviene revisar las condiciones de los corpus de entrenamiento (Kazakh Speech Corpus 2, FLEURS) antes de un despliegue comercial.
- Requiere `trust_remote_code=True` y ejecutar `modeling_gigaam.py` incluido en el repositorio: implica ejecutar codigo del autor, con el riesgo de seguridad asociado. Conviene auditar el codigo antes de usarlo en produccion.
- El autor advierte que KenLM puede no ayudar en todos los regimenes: en llamadas simuladas con pausa de 0,4 s, el beam sin KenLM mejora el WER final (10,3 frente a 11,1), mientras que en emisiones completas KenLM si aporta (9,12 frente a 9,17 en grabaciones largas con pausa de 0,5 s). La eleccion de configuracion afecta al resultado.
- Existe riesgo de alucinacion y de sustitucion de palabras en audio ruidoso o con acentos no vistos; no se publican tasas de error especificas por dominio, acento, edad o genero, ni evaluaciones de sesgo.
- No hay datos publicados sobre comportamiento en audio de mas de 30 s sin segmentar (el modelo offline esta limitado a 30 s) ni sobre idiomas distintos del kazajo y el ruso.
- El modelo es muy reciente y con pocas descargas (8) y ningun like, por lo que la validacion por parte de terceros es practicamente inexistente. El dato de creacion (2026-10-08) es posterior a la mayoria de referencias disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alibiserikbay/k5-kazakh-russian-stt
- Modelo base: https://huggingface.co/ai-sage/GigaAM-Multilingual
- Silero VAD (MIT, usado para endpointing): https://github.com/snakers4/silero-vad
- Dataset Kazakh Speech Corpus 2: https://huggingface.co/datasets/issai/Kazakh_Speech_Corpus_2
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Las busquedas web realizadas no devolvieron enlaces relevantes sobre este modelo (los resultados correspondian a paginas genericas de ChatGPT y GPT-4); no se dispone de paper, blog ni demo adicionales en la informacion proporcionada.

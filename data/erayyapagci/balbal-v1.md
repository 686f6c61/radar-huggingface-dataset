# erayyapagci/balbal-v1

## Resumen

balbal-v1 es un modelo de reconocimiento automático del habla (ASR) para turco, desarrollado por el usuario erayyapagci, que parte del modelo base `nvidia/stt_en_conformer_ctc_small` y lo reentrena como sistema Conformer-CTC con un refinador en bucle y una memoria acústica de producto-clave. Con 45,4 M de parámetros almacenados y solo 15,4 M activos por fotograma de audio, está diseñado explícitamente para inferencia en CPU: según el autor, procesa audio 96 veces más rápido que tiempo real con 8 hilos y 30 veces con un solo hilo, transcribiendo un turno telefónico de 3 segundos en unos 80 ms.

El modelo aborda un nicho concreto: transcripción de turco conversacional y telefónico con recursos mínimos. Frente a alternativas como Whisper large-v3-turbo (809 M) u omniASR LLM 7B, balbal-v1 obtiene 11,93 % de WER en Mu-Bench turco (llamadas telefónicas), mejor que GPT-4o-mini-transcribe (12,82), Deepgram Nova-3 (13,37), Azure Speech (14,02) y Qwen3-ASR 1.7B (14,76), aunque por detrás de Google Chirp-3 (8,03). En habla leída (FLEURS tr) su WER es 6,54 %, empatando con Duyu-small y quedando por detrás de Whisper large-v3-turbo (4,07).

La relevancia actual reside en la relación precisión/parámetro activo y en el despliegue: el repositorio ocupa 0,4 GB, se distribuye en formato ONNX y NeMo, y no requiere GPU. La contrapartida es una licencia comunitaria propia (no OSI) y un alcance lingüístico limitado al turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (NeMo `EncDecCTCModelBPE`), 16 capas, d_model 176, 80 mel, submuestreo 4x (tramas de 40 ms), con refinador Transformer de 2 capas en bucle (3 pasadas) y memoria acústica product-key |
| Parametros totales | 45,4 M almacenados |
| Parametros activos | 15,4 M activos por fotograma (la mayor parte de la tabla de memoria no se lee en cada fotograma) |
| Longitud de contexto | No aplica como ventana de atención: el audio largo se corta en fragmentos fijos de 30 s sin VAD y cada fragmento se decodifica por separado |
| Tipos de cuantizacion | No se publican variantes cuantizadas; el runtime de referencia es ONNX en fp32 |
| Idiomas soportados | Turco (`tr`) |
| Licencia | balbal-community-license-1.0 (`license: other`) |
| Formato de pesos | NeMo y ONNX; vocabulario SentencePiece de 1024 piezas + blank CTC (1025 clases) y KenLM de 6-gramas sobre tokens |

## Arquitectura y entrenamiento

El sistema es un Conformer-CTC estándar de NeMo con 16 capas, dimensión de modelo 176, entradas de 80 filtros mel y submuestreo 4x (tramas de 40 ms). Sobre la salida del codificador se aplica un refinador Transformer de 2 capas que se ejecuta en tres pasadas, donde cada pasada recibe como entrada la distribución CTC de la pasada anterior. Adicionalmente incorpora una memoria acústica product-key de 500×500 subclaves, 4 cabezas, selección top-16, dimensión de valor 120 y contexto de 3 fotogramas; esta memoria es la responsable de la diferencia entre parámetros almacenados (45,4 M) y activos (15,4 M), ya que solo se leen unas pocas filas por fotograma.

La decodificación combina el modelo acústico con un KenLM de 6-gramas sobre tokens (no sobre caracteres) mediante búsqueda por haces sin léxico de flashlight-text, con alpha 0,75, beta 1,5, temperatura 1,2, beam 64, top-12 tokens y umbral 8. La salida es turco con mayúsculas y puntuación, pero sin normalización inversa de texto: números, códigos y direcciones de correo se emiten deletreados como palabras.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; el modelo se presenta como un fine-tuning de `nvidia/stt_en_conformer_ctc_small`. El autor publica el código de inferencia y entrenamiento bajo Apache 2.0, y un normalizador de evaluación (`normalizer/metrics_v2.py`) usado para puntuar todos los modelos comparados.

## Capacidades

- Transcripción de voz a texto en turco con mayúsculas y puntuación, sobre audio de 16 kHz procesado en tramas de 40 ms.
- Reconocimiento robusto en habla telefónica y conversacional (Mu-Bench turco), su dominio objetivo declarado.
- Reconocimiento de habla leída (FLEURS turco), con WER de 6,54 %.
- Decodificación con modelo de lenguaje KenLM de 6-gramas sobre tokens, que mejora la coherencia léxica frente a CTC puro.
- Inferencia en CPU sin GPU, con velocidades de 96x tiempo real en 8 hilos y 30x en un solo hilo.
- Manejo de audio largo mediante troceado fijo en fragmentos de 30 segundos y decodificación independiente.
- Emisión de números y códigos deletreados como palabras (sin normalización inversa de texto).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción; es un modelo puramente ASR.

## Casos de uso

- Transcripción de llamadas en centros de contacto: el modelo está optimizado para habla telefónica (11,93 % de WER en Mu-Bench turco) y procesa un turno de 3 segundos en unos 80 ms en un solo hilo, lo que permite transcripción en streaming por turnos sin GPU en el servidor.
- Analítica de calidad y cumplimiento en atención al cliente: al transcribir conversaciones completas en fragmentos de 30 s, se puede alimentar un pipeline posterior de búsqueda de palabras clave, detección de motivos de llamada o auditoría de guiones.
- Subtitulado y transcripción de reuniones en turco: con 96x tiempo real en 8 hilos, una hora de audio se procesa en menos de un minuto en CPU, adecuado para generación de actas y subtítulos en herramientas internas.
- Asistentes de voz y dictado en dispositivos sin GPU: al ejecutarse en ONNX Runtime sobre CPU, encaja en portátiles, mini-PC o servidores sin acelerador, y el repositorio de 0,4 GB facilita su empaquetado en contenedores.
- Pre-anotación de corpus de voz en turco: el modelo sirve como etiquetador inicial para datasets de ASR, reduciendo el trabajo manual de transcripción antes de la revisión humana.
- Enrutamiento y clasificación de llamadas en IVR: la transcripción rápida de los primeros segundos permite clasificar la intención del usuario y dirigir la llamada a un agente o a un flujo automatizado.
- Sistemas de accesibilidad y documentación de entrevistas: transcripción local de audio grabado sin enviar datos a APIs externas, útil cuando la confidencialidad impide usar servicios en la nube.

## Benchmarks y rendimiento

Resultados publicados por el autor. FLEURS tr test: 743 clips; Mu-Bench tr-TR: 846 clips. La columna Mu-Bench usa el harness oficial con juez GPT-4.1; sigWER es la proporción de enunciados con al menos un error que cambia el significado. RTTF = segundos de audio por segundo de proceso, en las mismas 100 clips, batch 1, 8 hilos de una CPU AMD Ryzen AI Max+ 395.

| Modelo | Parametros (almacenados / activos) | FLEURS tr WER | Mu-Bench WER | Mu-Bench sigWER | RTTF en CPU |
|---|---|---|---|---|---|
| balbal-v1 | 45,4 M / 15,4 M | 6,54 | 11,93 | 25,18 | 96x |
| Duyu-small | 49,3 M / 19,3 M | 6,62 | 15,70 | 35,22 | 27x |
| MihuAI turkish-stt | 66 M | 8,16 | 24,59 | 49,53 | 15x |
| omniASR LLM 7B | 7 B | 5,31 | 21,10 | 44,68 | no medido |
| Whisper large-v3-turbo | 809 M | 4,07 | 24,65 | 47,04 | 1,6x |
| Whisper base | 74 M | 25,99 | 40,88 | 68,68 | 9,9x |

Comparación con APIs comerciales en Mu-Bench turco:

| Sistema | Mu-Bench WER | sigWER |
|---|---|---|
| Google Chirp-3 | 8,03 | 14,30 |
| Google Gemini-3.5-Transcribe | 8,68 | no disponible en la información |
| balbal-v1 | 11,93 | 25,18 |
| OpenAI GPT-4o-mini-transcribe | 12,82 | no disponible en la información |
| Deepgram Nova-3 | 13,37 | no disponible en la información |
| Microsoft Azure Speech | 14,02 | no disponible en la información |
| Qwen3-ASR 1.7B | 14,76 | no disponible en la información |

Significancia estadística (bootstrap pareado por enunciados, 10.000 remuestreos, diferencia balbal-v1 menos el otro modelo en puntos porcentuales, intervalo del 95 %; negativo = balbal-v1 mejor): frente a Duyu-small, −3,78 [−4,80, −2,77] en Mu-Bench y −0,08 [−0,48, +0,33] en FLEURS (empate); frente a Whisper large-v3-turbo, −12,73 [−15,05, −10,51] en Mu-Bench y +2,47 [+1,96, +2,97] en FLEURS.

## Requisitos de hardware

- Inferencia en CPU con ONNX Runtime y KenLM; no se requiere GPU ni VRAM dedicada.
- Espacio en disco: repositorio de 0,4 GB (pesos acústicos, KenLM y vocabulario).
- Velocidad medida: 96x tiempo real con 8 hilos y 30x con 1 hilo en un AMD Ryzen AI Max+ 395; un turno de hasta 3 s se transcribe en unos 80 ms en un solo hilo.
- Cabe en cualquier CPU de consumidor moderna; no se publican requisitos mínimos de RAM, aunque por el tamaño del modelo y el KenLM de 6-gramas el uso de memoria es reducido.
- GPU: no se han publicado cifras de latencia o throughput en A100, H100 o RTX 4090; el modelo está pensado para CPU y el runtime de referencia es ONNX.
- Opciones de despliegue: `inference/runtime_onnx.py` del repositorio oficial con ONNX Runtime + KenLM; también es cargable con NeMo (`EncDecCTCModelBPE`) para fine-tuning o evaluación. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo de texto.
- No se dispone de datos de throughput en batch ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | FLEURS tr WER | Mu-Bench WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| balbal-v1 | 45,4 M (15,4 M activos) | fragmentos de 30 s | 6,54 | 11,93 | balbal-community-license-1.0 | HuggingFace (NeMo/ONNX), código Apache 2.0 |
| Duyu-small | 49,3 M (19,3 M activos) | no disponible | 6,62 | 15,70 | no disponible en la información | HuggingFace (`KaanAydinli/Duyu-small`) |
| MihuAI turkish-stt | 66 M | no disponible | 8,16 | 24,59 | no disponible en la información | HuggingFace (`mihuai/turkish-stt`) |
| Whisper large-v3-turbo | 809 M | 30 s por ventana | 4,07 | 24,65 | MIT (Whisper) | HuggingFace (`openai/whisper-large-v3-turbo`), amplio ecosistema |
| omniASR LLM 7B | 7 B | no disponible | 5,31 | 21,10 | no disponible en la información | GitHub (`facebookresearch/omnilingual-asr`) |

## Limitaciones y advertencias

- Solo turco: no hay soporte multilingüe ni traducción; el modelo base era inglés y el fine-tuning se limita a `tr`.
- Sin normalización inversa de texto: números, códigos, importes y direcciones de correo salen deletreados como palabras ("yüz yirmi üç"), lo que exige un postprocesado propio si se necesitan formatos numéricos.
- Troceado rígido en fragmentos de 30 s sin detección de actividad de voz (VAD): las palabras en la frontera entre fragmentos pueden verse afectadas, y el silencio se procesa igual que el habla.
- Riesgo de alucinación y de bucles de repetición: el autor documenta este fallo en Whisper sobre algunas clips; para balbal-v1 no se publican tasas de repetición ni análisis de alucinaciones, por lo que conviene monitorizar la salida en producción.
- Licencia `balbal-community-license-1.0` (marcada como `other`): no es una licencia OSI y las condiciones de uso comercial no están detalladas en la información disponible; es imprescindible revisar el fichero LICENSE antes de un despliegue comercial.
- El código de entrenamiento e inferencia es Apache 2.0, pero los pesos tienen licencia distinta; no debe asumirse que la permisividad del código se extiende a los pesos.
- Evaluación limitada a dos conjuntos (FLEURS tr y Mu-Bench tr-TR) y a un único entorno de medida de velocidad (AMD Ryzen AI Max+ 395, 8 hilos); el rendimiento en otros dominios (acentos, ruido de fondo, audio de baja calidad) no está documentado.
- Sesgos: no se publica ningún análisis de sesgos por género, edad, dialecto o origen regional dentro del turco.
- No dispone de diarización de hablantes, detección de idioma, marcas de tiempo por palabra ni puntuación configurable; si se necesitan, hay que añadirlas en un pipeline externo.
- Un modelo de 15,4 M de parámetros activos tiene un techo de precisión: en habla leída queda claramente por detrás de Whisper large-v3-turbo y de omniASR LLM 7B (diferencias significativas de +2,47 y +1,23 puntos de WER respectivamente).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/erayyapagci/balbal-v1
- Blog del autor (arquitectura, entrenamiento, evaluación): https://erayy.com/balbal-blog
- Demo en el navegador: https://huggingface.co/spaces/erayyapagci/balbal-v1-demo
- Código de inferencia y entrenamiento (Apache 2.0): https://github.com/erayyap/balbal
- Transcripciones completas de evaluación: https://huggingface.co/datasets/erayyapagci/balbal-v1-evals
- Modelo base: https://huggingface.co/nvidia/stt_en_conformer_ctc_small
- Duyu-small (comparativa): https://huggingface.co/KaanAydinli/Duyu-small
- MihuAI turkish-stt (comparativa): https://huggingface.co/mihuai/turkish-stt
- omniASR LLM 7B (comparativa): https://github.com/facebookresearch/omnilingual-asr
- Whisper large-v3-turbo (comparativa): https://huggingface.co/openai/whisper-large-v3-turbo
- Whisper base (comparativa): https://huggingface.co/openai/whisper-base

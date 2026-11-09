# futo-org/asr4all-s-plus

## Resumen

asr4all-s-plus es un modelo de reconocimiento automatico del habla (ASR) desarrollado por FUTO, una organizacion centrada en software de codigo abierto y herramientas de privacidad. Se trata de la variante "plus" de la familia asr4all, que anade a la ruta de transcripcion modulos adicionales para diarizacion, verificacion de hablante y segmentacion de hablante. El modelo esta disenado explicitamente para inferencia en dispositivo (on-device) y en el borde (edge), con exportaciones a ExecuTorch y ONNX ademas de los pesos en safetensors para transformers.

La ruta de transcripcion emplea una arquitectura CTC con 28,1 millones de parametros (33,0 millones en total contando las cabezas adicionales), lo que lo situa en la categoria de modelos ultraligeros. Su enfoque en streaming y su huella reducida lo hacen adecuado para aplicaciones donde la latencia, el consumo de memoria y la privacidad son criticos, como subtitulado en tiempo real, asistentes locales o procesamiento de audio sin salida a la nube. El modelo solo soporta ingles.

La relevancia actual de este modelo radica en su combinacion poco habitual de ASR ligero con diarizacion integrada y un detector de actividad de voz FSMN de mayor precision, todo bajo una licencia etica propia (futo-ethical-use-1.0) que permite uso comercial con restricciones. Frente a alternativas como Whisper, que requieren ordenes de magnitud mas de computo, asr4all-s-plus apunta a un nicho concreto: transcripcion multihablante de bajo coste en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer CTC (ruta de transcripcion) con cabezas adicionales de verificacion de hablante y segmentacion de hablante; VAD FSMN integrado |
| Parametros totales | 33.045.753 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio en streaming; el VAD FSMN opera con unos 800 ms de contexto causal) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | futo-ethical-use-1.0 (uso comercial permitido con limitaciones de uso etico) |
| Formato de pesos | safetensors, ONNX, ExecuTorch |

## Arquitectura y entrenamiento

El modelo se construye sobre una arquitectura transformer con decodificacion CTC para la transcripcion, disenada para operar en modo streaming. La ruta de transcripcion contiene 28,1 millones de parametros e incorpora un modulo PCEC (no detallado en la informacion disponible) identico al del modelo base asr4all-s. Sobre esa base, la variante "plus" anade tres componentes: una cabeza de verificacion de hablante (`sv`) que produce embeddings de voz de 512 dimensiones, una cabeza de segmentacion de hablante tipo powerset (`seg`) que indica quien habla en cada frame, y un detector de actividad de voz FSMN procedente de Alibaba FunASR (`funasr/fsmn-vad`, Apache-2.0) con 429.000 parametros que entrega una probabilidad de habla por frame de 10 ms con aproximadamente 800 ms de contexto causal.

El entrenamiento se realizo sobre un corpus amplio y diverso en ingles que incluye espnet/yodas, MLCommons/peoples_speech, mozilla-foundation/common_voice_25_0, openslr/librispeech_asr, pkufool/libriheavy, facebook/voxpopuli, edinburghcstr/ami, qmeeus/slurp, distil-whisper/earnings22, Revai/earnings21, edinburghcstr/edacc, farukclk/voxpopuli-en-accented-split, ylacombe/english_dialects y apptek-com/apptek_callcenter_dialogues. La informacion disponible no detalla el numero total de horas ni si se aplicaron tecnicas de RLHF o DPO; los detalles de entrenamiento y evaluacion del ASR remiten a las model cards de los modelos no-plus. La innovacion principal es la integracion de diarizacion y VAD en un unico paquete exportable a ExecuTorch, con una pipeline de diarizacion en cascada autocontenida (`diarize.py`).

## Capacidades

- Reconocimiento automatico del habla en ingles con decodificacion CTC y soporte de streaming.
- Deteccion de actividad de voz mediante FSMN (`detect_speech_fsmn`), con probabilidad de habla a 100 Hz y unos 800 ms de contexto causal.
- Verificacion de hablante: generacion de embeddings de voz de 512 dimensiones.
- Segmentacion de hablante: cabeza powerset que identifica el hablante activo en cada frame.
- Diarizacion completa mediante pipeline en cascada incluida (`diarize.py`).
- Exportacion a ExecuTorch (metodo `vad` con estado de seis tensores para streaming) y a ONNX (`vad.onnx`, entrada `vad_pcm`, salida `vad_speech_prob`).
- Inferencia en dispositivo y en el borde gracias a su tamano reducido.
- No soporta tool calling, function calling, agentes, vision ni audio mas alla del ASR; no es un modelo multimodal generativo.

## Casos de uso

- Subtitulado en tiempo real en local: el modo streaming y los 28,1 millones de parametros de la ruta de transcripcion permiten generar subtitulos en un dispositivo sin enviar audio a la nube, con una latencia compatible con video en directo.
- Transcripcion de reuniones con diarizacion: la combinacion de la cabeza de segmentacion, los embeddings de hablante y `diarize.py` permite etiquetar quien habla en cada intervencion, adecuado para actas automaticas de reuniones (el modelo incluye AMI en su entrenamiento).
- Asistentes de voz locales: el VAD FSMN acota con precision los segmentos de habla antes de pasarlos al decodificador, lo que reduce falsos positivos en entornos con ruido de fondo y ahorra computo al no procesar silencio.
- Analitica de llamadas de centro de contacto: el modelo se entreno con apptek_callcenter_dialogues y earnings21/22, por lo que es aplicable a transcripcion de llamadas y presentaciones financieras con terminologia especializada.
- Verificacion biométrica de voz ligera: la cabeza `sv` produce embeddings de 512 dimensiones que pueden alimentar un sistema de identificacion de hablante en dispositivos con recursos limitados.
- Procesamiento por lotes en el borde: la exportacion ONNX permite ejecutar la transcripcion y el VAD en CPUs sin GPU dentro de pipelines de ingesta de audio, con un coste de memoria muy bajo.
- Aplicaciones de accesibilidad: transcripcion en tiempo real en dispositivos moviles o embebidos para personas con discapacidad auditiva, sin dependencia de conectividad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (WER normalizado estilo Whisper; no verificados de forma independiente):

| Dataset | WER (%) |
|---|---|
| LibriSpeech clean | 3,86 |
| LibriSpeech other | 10,14 |
| VoxPopuli (cleaned) | 5,63 |
| SPGISpeech | 6,39 |
| GigaSpeech (cleaned) | 12,66 |
| Monsoon en-IN | 12,56 |
| AMI (cleaned) | 13,01 |
| Earnings-22 (cleaned, chunked) | 13,80 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos adicionales ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa para los 33 millones de parametros; el modelo cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en RTX 4090, A100 o H100 sin aprovechar su capacidad, y es viable en iGPUs y CPUs modernas.
- Cabe en cualquier GPU consumer, incluidas las de gama baja y las integradas; tambien en dispositivos moviles y embebidos mediante ExecuTorch.
- Opciones de despliegue: transformers con `trust_remote_code=True`, ONNX Runtime (artefacto `vad.onnx`), ExecuTorch (metodo `vad` con estado para streaming) y la pipeline `diarize.py` incluida.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asr4all-s-plus | 33,0 M (28,1 M en transcripcion) | en | Streaming, VAD con 800 ms de contexto causal | futo-ethical-use-1.0 | Hugging Face, ONNX, ExecuTorch |
| asr4all-s | no disponible (misma ruta ASR y PCEC) | en | Streaming; VAD de 2,5 k parametros | no disponible | Hugging Face |
| Whisper (variantes de OpenAI) | desde 39 M (tiny) hasta 1,55 G (large) | multilingue | No streaming nativo | MIT | Hugging Face, multiples runtimes |
| funasr/fsmn-vad | 429 k | no aplica (VAD) | 800 ms de contexto causal | Apache-2.0 | Hugging Face |

La comparativa se limita a estos modelos porque la informacion disponible no incluye otros ASR ligeros con diarizacion integrada. asr4all-s-plus se distingue por empaquetar ASR, VAD, embeddings de hablante y segmentacion en un unico artefacto exportable, frente a Whisper, que ofrece mayor cobertura multilingue y tamano pero carece de diarizacion nativa y de soporte de streaming.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Los WER publicados no estan verificados de forma independiente y corresponden a la propia model card.
- El VAD FSMN integrado es menos adecuado para deteccion de wake word que el VAD de 2,5 k parametros de los modelos no-plus, segun el autor.
- La pipeline de diarizacion incluida no utiliza el VAD; se proporciona para aplicaciones alternativas que acoten el habla previamente.
- La licencia futo-ethical-use-1.0 permite uso comercial pero impone limitaciones de uso etico; es necesario revisar el texto de la licencia antes de desplegar en produccion.
- Al ser un modelo CTC pequeno, es previsible una mayor tasa de error en audio con ruido, acentos no representados en el entrenamiento o vocabulario muy especializado; no se dispone de datos especificos sobre sesgos.
- No dispone de tool calling, razonamiento multi-paso ni generacion de texto; su alcance se limita a tareas de voz.
- La informacion disponible no detalla el numero de horas de entrenamiento ni el proceso de curacion del dataset, lo que dificulta evaluar la cobertura de acentos y dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/futo-org/asr4all-s-plus
- Modelo base asr4all-s: https://huggingface.co/futo-org/asr4all-s
- VAD FSMN de FunASR: https://huggingface.co/funasr/fsmn-vad
- Open ASR Leaderboard (referencia de los datasets de evaluacion): https://huggingface.co/spaces/hf-audio/open_asr_leaderboard

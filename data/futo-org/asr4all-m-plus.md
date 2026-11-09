# futo-org/asr4all-m-plus

## Resumen

asr4all-m-plus es un modelo de reconocimiento automatico del habla (ASR) desarrollado por FUTO, una organizacion centrada en software libre y privacidad. Se trata de la variante "plus" del modelo asr4all-m, que anade modulos de diarizacion, verificacion de hablante y segmentacion de hablante sobre el mismo decodificador ASR y el mismo codificador PCEC. El modelo esta disenado explicitamente para inferencia en dispositivo (on-device) y en el borde (edge), con exportaciones a ONNX y ExecuTorch, lo que lo hace relevante para aplicaciones que requieren transcripcion local sin enviar audio a la nube.

La ruta de transcripcion contiene 55,6 millones de parametros, mientras que el total del repositorio con todas las cabeceras asciende a 61.411.944 parametros segun los pesos en safetensors. Usa una arquitectura CTC (Connectionist Temporal Classification) con soporte de streaming, lo que permite transcripcion incremental con baja latencia. El modelo solo soporta ingles y se distribuye bajo la licencia FUTO Ethical Use 1.0, que permite uso comercial con limitaciones eticas.

Su interes actual radica en combinar ASR de calidad competitiva con diarizacion integrada en un paquete ligero y exportable, algo poco habitual en modelos de este tamano. Frente a alternativas como Whisper, que requieren cientos de millones de parametros para resultados similares, asr4all-m-plus ofrece un perfil de recursos mucho mas ajustado para despliegues en movil, navegador o hardware embebido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer CTC con codificador PCEC, cabeceras de verificacion y segmentacion de hablante, VAD FSMN |
| Parametros totales | 61.411.944 (ruta ASR: 55,6 M; VAD FSMN: 429 k; cabeceras adicionales incluidas en el total) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de streaming por tramas; VAD con ~800 ms de contexto causal) |
| Tipos de cuantizacion | no disponible (exportaciones ONNX y ExecuTorch; cuantizacion no detallada en la informacion) |
| Idiomas soportados | ingles (en) |
| Licencia | FUTO Ethical Use 1.0 (uso comercial permitido con limitaciones eticas) |
| Formato de pesos | safetensors, ONNX, ExecuTorch |

## Arquitectura y entrenamiento

El modelo se basa en un decodificador CTC sobre un codificador denominado PCEC, compartido con la variante no-plus asr4all-m. La innovacion principal de la version plus es la incorporacion de tres modulos auxiliares: una cabecera de verificacion de hablante que produce embeddings de voz de 512 dimensiones, una cabecera de segmentacion de hablante en formato powerset que indica quien habla en cada trama, y un detector de actividad de voz (VAD) FSMN procedente de FunASR de Alibaba (Apache-2.0) con 429.000 parametros que entrega una probabilidad de habla cada 10 ms con aproximadamente 800 ms de contexto causal. Ademas, se incluye un pipeline de ejemplo de diarizacion en cascada (`diarize.py`).

Los datos de entrenamiento declarados abarcan un conjunto amplio de corpus en ingles: espnet/yodas, MLCommons/peoples_speech, mozilla-foundation/common_voice_25_0, openslr/librispeech_asr, pkufool/libriheavy, facebook/voxpopuli, edinburghcstr/ami, qmeeus/slurp, distil-whisper/earnings22, Revai/earnings21, edinburghcstr/edacc, farukclk/voxpopuli-en-accented-split, ylacombe/english_dialects y apptek-com/apptek_callcenter_dialogues. No se detalla en la informacion proporcionada el numero total de horas de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un modelo CTC de ASR). La model card remite a las fichas de los modelos no-plus para los detalles de entrenamiento y evaluacion del ASR.

## Capacidades

- Reconocimiento automatico del habla en ingles con decodificacion CTC.
- Transcripcion en streaming, adecuada para audio incremental y baja latencia.
- Deteccion de actividad de voz (VAD) mediante FSMN, con una probabilidad de habla cada 10 ms.
- Embeddings de hablante de 512 dimensiones para verificacion de voz.
- Segmentacion de hablante por trama (powerset speaker segmentation) para identificar quien habla en cada momento.
- Diarizacion completa mediante el pipeline en cascada `diarize.py`.
- Exportacion a ONNX (`vad.onnx` entre otros) y a ExecuTorch (metodo `vad` con estado persistente entre llamadas).
- Ejecucion en dispositivo y en el borde, sin dependencia de servicios en la nube.
- No soporta tool calling, agentes, vision ni audio multimodal; es un modelo especializado exclusivamente en voz.

## Casos de uso

- Transcripcion local en aplicaciones moviles: el modelo cabe en dispositivos de gama media gracias a sus 55,6 M parametros en la ruta ASR y a las exportaciones a ExecuTorch, permitiendo dictado y notas de voz sin enviar audio a servidores externos.
- Subtitulado en tiempo real: el modo streaming y la decodificacion CTC permiten generar subtitulos incrementales en videollamadas o retransmisiones, con el VAD FSMN delimitando los segmentos de habla.
- Actas de reuniones con diarizacion: el pipeline `diarize.py` combina ASR, segmentacion de hablante y embeddings de voz para producir transcripciones etiquetadas por participante, util en entornos como AMI (WER de 11,06 en el conjunto de test limpiado).
- Analisis de llamadas de atencion al cliente: entrenado con apptek_callcenter_dialogues, puede transcribir y separar interlocutores en grabaciones de centros de contacto para control de calidad y analitica.
- Verificacion de locutor en autenticacion por voz: los embeddings de 512 dimensiones permiten comparar muestras de voz para confirmar la identidad del usuario en sistemas de acceso local.
- Investigacion en habla y linguistica: el modelo sirve como base ligera para experimentos de ASR, diarizacion y VAD en ingles, con resultados reproducibles sobre los conjuntos del Open ASR Leaderboard.
- Procesamiento por lotes en el borde: despliegue en dispositivos con recursos limitados (Raspberry Pi, moviles, navegador via ONNX) para transcribir grabaciones sin conexion.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER normalizado al estilo Whisper, no verificados):

| Conjunto de evaluacion | WER (%) |
|---|---|
| LibriSpeech clean | 2,83 |
| LibriSpeech other | 7,25 |
| VoxPopuli (cleaned) | 4,54 |
| SPGISpeech | 5,18 |
| Monsoon en-IN | 8,90 |
| GigaSpeech (cleaned) | 10,63 |
| AMI (cleaned) | 11,06 |
| Earnings-22 (cleaned, chunked) | 11,38 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (61,4 M parametros en fp32 equivalen a unos 246 MB de pesos; en fp16, unos 123 MB), mas el estado del VAD y las cabeceras.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060 y GPUs integradas.
- Compatible con GPU de consumo: si, practicamente cualquier GPU de consumo e incluso CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True`, ONNX Runtime, ExecuTorch (dispositivos moviles y embebidos), y potencialmente llama.cpp/Ollama no aplican por ser un modelo de voz, no de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. El VAD entrega probabilidades a 100 Hz (cada 10 ms) y el modo streaming esta disenado para baja latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asr4all-m-plus | 61,4 M | Streaming CTC, VAD, diarizacion | Ingles | FUTO Ethical Use 1.0 | Hugging Face (transformers, ONNX, ExecuTorch) |
| Whisper small | ~244 M | No streaming nativo, ASR + traduccion | Multilingue | MIT | Hugging Face, amplia adopcion |
| Whisper tiny | ~39 M | No streaming nativo | Multilingue | MIT | Hugging Face |
| wav2vec 2.0 base | ~95 M | CTC, ASR | Multilingue (fine-tuning) | MIT / Apache-2.0 segun variante | Hugging Face |

La comparativa se limita a parametros, licencia y disponibilidad; no se dispone de resultados de WER comparables de los modelos alternativos en la informacion proporcionada. La ventaja diferencial de asr4all-m-plus es la integracion de diarizacion, VAD y verificacion de hablante en un unico paquete ligero, frente a Whisper y wav2vec 2.0, que requieren modulos externos para esas funciones.

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para transcripcion multilingue sin reentrenamiento.
- Riesgo de alucinacion y errores en audio con ruido, acentos no vistos o solapamiento de hablantes; los WER en dominios dificiles (AMI 11,06, Earnings-22 11,38) reflejan esta limitacion.
- El VAD FSMN esta pensado para delimitar habla con precision, no para deteccion de palabra de activacion (wake word), segun advierte el autor.
- La licencia FUTO Ethical Use 1.0 permite uso comercial pero impone restricciones eticas; es necesario revisar el texto completo de la licencia antes de integrarlo en productos.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente.
- El modelo requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo personalizado del repositorio.
- La diarizacion integrada depende del pipeline de ejemplo `diarize.py`; su robustez en produccion no esta documentada en la informacion disponible.
- No dispone de soporte de tool calling, agentes ni capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/futo-org/asr4all-m-plus
- Modelo base no-plus: https://huggingface.co/futo-org/asr4all-m
- VAD FSMN de FunASR: https://huggingface.co/funasr/fsmn-vad
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Dataset Earnings22-Cleaned-AA-chunked: https://huggingface.co/datasets/ArtificialAnalysis/Earnings22-Cleaned-AA-chunked
- Dataset Monsoon en-IN: https://huggingface.co/datasets/VoiceArena/Monsoon_en_IN_test
- Repositorio de FUTO: https://futo.org

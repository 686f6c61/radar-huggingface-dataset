# futo-org/asr4all-l

## Resumen

asr4all-l es un modelo de reconocimiento automático del habla (ASR) desarrollado por FUTO (futo-org), pensado para inferencia en el extremo (edge), movil y CPU. Con 97 millones de parametros totales (91,5 M acusticos mas 5,3 M del modulo PCEC), se posiciona como una alternativa eficiente a los modelos ASR de tamano comparable, con un factor de tiempo real (RTFx) significativamente mayor gracias a una arquitectura propia optimizada para operaciones SIMD y NEON vectorizadas.

El modelo es de tipo CTC, soporta inferencia en streaming con latencia configurable en tiempo de ejecucion (modos de baja y alta latencia desde los mismos pesos) y se distribuye acompanado de un modelo secundario ligero que aplica puntuacion, mayusculas y correccion ligera de errores (PCEC), ademas de un detector de actividad de voz (VAD) ultraligero. Solo soporta ingles.

Su relevancia actual radica en que permite desplegar ASR de calidad competitiva en dispositivos sin GPU, con un repo de 4,8 GB que incluye exportaciones a multiples formatos y cuantizaciones (ONNX, ExecuTorch, safetensors). La licencia permite uso comercial con restricciones eticas (por ejemplo, prohibicion de vigilancia masiva).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC con arquitectura propia optimizada para CPU (91,5 M acusticos + 5,3 M PCEC) |
| Parametros totales | 96.999.005 (97 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio en streaming, no basado en ventana de tokens) |
| Tipos de cuantizacion | multiples cuantizaciones exportadas para ONNX y ExecuTorch (detalle exacto no disponible en la informacion proporcionada) |
| Idiomas soportados | ingles (en) |
| Licencia | futo-model-weights-ethical-use-1.0 (uso comercial permitido con restricciones eticas) |
| Formato de pesos | safetensors, ONNX, ExecuTorch |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura CTC personalizada y exclusiva, disenada para maximizar el rendimiento en CPU mediante delegacion limpia a operaciones SIMD y NEON vectorizadas. Consta de un componente acustico de 91,5 M de parametros y un modulo PCEC de 5,3 M que anade puntuacion, mayusculas y correccion ligera de errores. Los mismos pesos permiten tanto inferencia de baja latencia como de alta latencia en modo streaming, con la latencia configurable en tiempo de ejecucion. Se incluye ademas un VAD ultraligero para aplicaciones que requieren deteccion de voz de bajo consumo.

Los datos de entrenamiento provienen de un conjunto amplio de datasets publicos: espnet/yodas, MLCommons/peoples_speech, mozilla-foundation/common_voice_25_0, openslr/librispeech_asr, pkufool/libriheavy, facebook/voxpopuli, edinburghcstr/ami, qmeeus/slurp, distil-whisper/earnings22, Revai/earnings21, edinburghcstr/edacc, farukclk/voxpopuli-en-accented-split, ylacombe/english_dialects y apptek-com/apptek_callcenter_dialogues. El numero exacto de horas de audio, la composicion porcentual del dataset y si hubo etapas de ajuste fino supervisado adicionales no estan disponibles en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla en ingles con salida CTC.
- Inferencia en streaming con dos modos de latencia (baja y alta) configurables en tiempo de ejecucion desde los mismos pesos.
- Puntacion, capitalizacion y correccion ligera de errores mediante el modulo PCEC asociado.
- Deteccion de actividad de voz (VAD) ultraligera integrada para activacion por voz.
- Inferencia optimizada para CPU, movil y edge, con exportaciones a ONNX y ExecuTorch.
- Factor de tiempo real (RTFx) elevado en comparacion con modelos ASR de tamano similar.
- No soporta tool calling, agentes, vision, audio multimodal ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Transcripcion en dispositivos moviles sin GPU: el modelo esta optimizado para CPU y bajo consumo, por lo que puede ejecutarse en telefonos y portatiles integrando la exportacion ExecuTorch o ONNX, con el modulo PCEC para entregar texto puntuado directamente al usuario.
- Dictado y notas de voz en aplicaciones de productividad: el modo streaming de baja latencia permite mostrar texto parcial mientras el usuario habla, y el VAD ultraligero activa la captura solo cuando hay voz, reduciendo el consumo energetico.
- Subtitulado en tiempo real en entornos con hardware limitado: el modo de alta latencia ofrece mayor precision con una ventana algo mayor, adecuado para generar subtitulos sincronizados en equipos sin acelerador dedicado.
- Transcripcion de reuniones y actas: el modelo se ha evaluado en AMI (WER 9,94 %), corpus de reuniones multiparticipe, por lo que puede emplearse para generar transcripciones de sala con puntuacion y mayusculas gracias a PCEC.
- Analisis de llamadas de centro de contacto: el dataset apptek-com/apptek_callcenter_dialogues figura entre los datos de entrenamiento, lo que lo hace adecuado para transcribir conversaciones telefonicas y alimentar analitica posterior en CPU.
- Procesamiento por lotes de audio en servidores sin GPU: al ser un modelo CTC de 97 M con exportacion ONNX, puede ejecutarse en contenedores CPU para transcribir grandes volumenes de audio con un coste energetico bajo y alto RTFx.
- Asistentes por voz con activacion local: combinando el VAD integrado y el modo streaming, se puede construir un pipeline de wake word y transcripcion totalmente en el dispositivo, sin enviar audio a la nube.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (WER %, normalizacion Whisper, configuracion c256r64, menor es mejor). No estan verificados de forma independiente segun el model-index.

| Dataset | WER (%) |
|---|---|
| LibriSpeech clean | 2,38 |
| LibriSpeech other | 5,94 |
| VoxPopuli (cleaned) | 4,05 |
| SPGISpeech | 4,61 |
| Monsoon en-IN | 7,40 |
| Earnings-22 (cleaned, chunked) | 9,15 |
| GigaSpeech (cleaned) | 9,84 |
| AMI (cleaned) | 9,94 |

La model card incluye ademas graficos de RTFx por backend y plataforma en ejecucion mono-hilo, pero los valores numericos concretos de esos graficos no estan disponibles en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo esta disenado para CPU y edge, no requiere GPU.
- GPU recomendadas: no aplica como requisito; la model card menciona una seccion de aceleracion por GPU, pero no especifica modelos concretos en la informacion disponible.
- Cabe en cualquier GPU consumer y en dispositivos sin GPU: con 97 M de parametros y un repo de 4,8 GB (que incluye todas las exportaciones), el peso efectivo de una sola variante cuantizada es muy reducido.
- Opciones de despliegue: transformers (uso puntual y streaming), ONNX Runtime, ExecuTorch; tambien se mencionan exportaciones a multiples formatos y cuantizaciones.
- Latencia y throughput: la model card destaca un RTFx significativamente superior a modelos ASR de tamano comparable y modos de streaming con latencia configurable; los valores numericos concretos no estan disponibles en el texto proporcionado.

## Comparativa con modelos similares

No se dispone de datos de comparacion directa con alternativas concretas en la informacion proporcionada. Como referencia cualitativa, la model card situa el modelo frente a otros ASR de tamano comparable en RTFx y WER, y ofrece tres tamanos dentro de la propia familia asr4all, pero no incluye cifras de modelos de terceros.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asr4all-l | 97 M | no disponible (streaming) | WER 2,38-9,94 segun dataset | futo-model-weights-ethical-use-1.0 | Hugging Face |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues.
- Riesgo de alucinacion y errores en audio con ruido, acentos marcados o solapamiento de hablantes, comun en modelos CTC; los WER en AMI (9,94 %) y GigaSpeech (9,84 %) reflejan esta dificultad en dominios complejos.
- Los resultados de benchmarks son declarados por el autor y estan marcados como no verificados en el model-index.
- La licencia futo-model-weights-ethical-use-1.0 permite uso comercial pero prohibe actividades concretas, como la vigilancia masiva; es necesario revisar el texto completo de la licencia antes de un despliegue en produccion.
- El modulo PCEC anade puntuacion y correccion, pero puede introducir cambios no deseados en transcripciones literales o en dominios con vocabulario muy especifico.
- La arquitectura es propia y requiere codigo personalizado (custom_code); la integracion con ecosistemas estandar puede necesitar pasos adicionales frente a modelos transformer convencionales.
- No dispone de tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo ASR.

## Enlaces

- Hugging Face: https://huggingface.co/futo-org/asr4all-l
- Licencia: https://huggingface.co/futo-org/asr4all-l/blob/main/LICENSE
- Paper referenciado en los tags (arxiv:2607.25870): https://arxiv.org/abs/2607.25870
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard

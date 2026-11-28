# qvac/TranscribePsy-250M-EU-sub

## Resumen

TranscribePsy-250M-EU-sub es un modelo de reconocimiento automatico del habla (ASR) de 254 millones de parametros desarrollado por qvac. Se trata de un destilado y ajuste fino del modelo nvidia/parakeet-tdt-0.6b-v3, orientado especificamente a la transcripcion en ocho lenguas europeas: neerlandes, ingles, frances, aleman, italiano, polaco, portugues y espanol. El modelo concentra su presupuesto de parametros en menos idiomas que su hermano mayor (TranscribePsy-250M-EU, con 25 lenguas) para reducir el error en el subconjunto cubierto.

La arquitectura subyacente es FastConformer con decodificador de tipo transducer (TDT), una combinacion habitual en la familia Parakeet de NVIDIA. Con 253.954.838 parametros reales y un repositorio de 2 GB, esta pensado para despliegue en dispositivo y en el borde (on-device, edge), incluyendo telefonos moviles mediante builds GGUF y Core ML para el Apple Neural Engine.

Su relevancia actual radica en la relacion entre precision y tamano: segun la model card, obtiene 7,50 en el Open ASR Leaderboard y 5,87 en Multilingual LibriSpeech, superando a modelos tres o cuatro veces mas grandes como Qwen3-ASR-0.6B, omniASR-CTC-1B-v2 y Whisper-Medium en el conjunto multilingue. Ademas, figura en la frontera de Pareto de tamano y WER de la pista multilingue del leaderboard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador transducer (TDT), segun tags del modelo |
| Parametros totales | 253.954.838 (254M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Build GGUF Q8_0 publicada; build Core ML para Apple Neural Engine; cuantizacion de 8 bits mencionada en las mediciones on-device |
| Idiomas soportados | nl, en, fr, de, it, pl, pt, es (8 lenguas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria NeMo); builds adicionales en GGUF y Core ML |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura FastConformer, una variante del Conformer con atencion por bloques que reduce el coste computacional en secuencias de audio largas, acoplada a un decodificador transducer TDT (Token-and-Duration Transducer). Esta combinacion permite una decodificacion eficiente y adecuada para despliegue en tiempo real. El modelo base es nvidia/parakeet-tdt-0.6b-v3, del que este modelo es un ajuste fino por destilacion, reduciendo el tamano de 0,6B a 254M parametros mediante la concentracion del presupuesto en ocho lenguas.

La model card menciona el diseno CAFE (language-routed adapter) descrito en el paper arXiv 2610.19134, si bien ese diseno corresponde a TranscribePsy-250M-EU; no se detalla en la informacion proporcionada si este modelo subtipo lo emplea directamente. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en ASR). Los datos de evaluacion se apoyan en Multilingual LibriSpeech, Common Voice v25 y el Open ASR Leaderboard.

## Capacidades

- Reconocimiento automatico del habla multilingue en ocho lenguas europeas (neerlandes, ingles, frances, aleman, italiano, polaco, portugues y espanol).
- Transcripcion de audio de formato corto y largo, segun los conjuntos de evaluacion del Open ASR Leaderboard (7 conjuntos en ingles y 9 multilingues).
- Inferencia en tiempo real con un factor de tiempo real (RTF) de 0,052 en moviles con builds de 8 bits.
- Despliegue on-device y en el borde: builds GGUF para el motor qvac-fabric-speech.cpp y Core ML para el Apple Neural Engine.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion en tiempo real en aplicaciones moviles: con un RTF de 0,052 y una latencia de inferencia de 1.021 ms en telefono, el modelo puede transcribir audio en directo en apps de notas de voz o subtitulado sin depender de la nube.
- Subtitulado y actas de reuniones multilingues: al cubrir ocho lenguas europeas con un WER de 5,87 en MLS, es adecuado para generar transcripciones de reuniones en entornos corporativos con participantes de distintos paises.
- Asistentes de voz embebidos: el tamano de 305 MB en su build GGUF y un pico de memoria de 534 MiB a 10 segundos permiten integrarlo en dispositivos con recursos limitados, como altavoces inteligentes o wearables.
- Transcripcion de contenido audiovisual: su rendimiento en conjuntos de audio corto y largo del Open ASR Leaderboard lo hace util para pipelines de generacion de subtitulos en plataformas de video con contenido en varias lenguas europeas.
- Aplicaciones de accesibilidad: dictado por voz y conversion de voz a texto en tiempo real en telefonos, con arranque en frio de 252 ms, adecuado para interfaces de asistencia a personas con discapacidad motriz.
- Procesamiento por lotes en el borde: en entornos con conectividad limitada (vehiculos, dispositivos industriales), el modelo puede transcribir localmente sin enviar audio a servidores externos, reduciendo latencia y preservando la privacidad.
- Investigacion en ASR multilingue de bajo coste: su licencia Apache 2.0 y su tamano compacto lo convierten en una base accesible para experimentos de ajuste fino y evaluacion en las ocho lenguas MLS.

## Benchmarks y rendimiento

Resultados de la model card (WER, menor es mejor; negrita indica el mejor resultado de la fila):

| Suite | TranscribePsy-250M-EU-sub | TranscribePsy-250M-EU | Whisper-small (242M) | omniASR-CTC-300M-v2 (326M) | OWSM v4 small (370M) |
|---|---|---|---|---|---|
| Open ASR Leaderboard | **7,50** | 8,02 | 12,34 | 15,31 | 9,72 |
| Multilingual LibriSpeech | **5,87** | 6,58 | 11,51 | 11,89 | 11,84 |
| Common Voice v25 | n/a | 21,56 | 38,17 | 32,23 | 37,74 |

Comparacion con modelos tres o cuatro veces mayores:

| Metrica | TranscribePsy-250M-EU-sub | Qwen3-ASR-0.6B (782M) | omniASR-CTC-1B-v2 (976M) | Whisper-Medium (764M) |
|---|---|---|---|---|
| Parametros | **254M** | 782M | 976M | 764M |
| Open ASR Leaderboard | 7,50 | **7,40** | 9,68 | 8,79 |
| Multilingual LibriSpeech | **5,87** | 12,60 | 7,71 | 7,76 |
| Tamano del modelo (MB) | **305** | 854 | 1.056 | 823 |
| Factor de tiempo real | **0,052** | 0,462 | 0,998 | 0,931 |
| Latencia de inferencia (ms) | **1.021** | 7.616 | 15.372 | 14.636 |
| Latencia de arranque en frio (ms) | **252** | 677 | 898 | 870 |
| Pico de memoria a 10 s (MiB) | **534** | 1.169 | 1.275 | 1.569 |

Las metricas on-device se midieron en telefonos con builds cuantizados a 8 bits; el modelo qvac se ejecuta como su build GGUF. La puntuacion del Open ASR Leaderboard es la media de 7 conjuntos de prueba en ingles de formato corto y 9 conjuntos multilingues.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el pico de memoria medido en movil es de 534 MiB a 10 segundos de audio con build de 8 bits.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano (254M parametros), el modelo es compatible con GPU de consumo, pero no se documentan modelos concretos.
- Cabe en GPU de consumo: si, dado el tamano del modelo (2 GB de repositorio, 305 MB en GGUF Q8_0); no se detallan modelos especificos.
- Opciones de despliegue: NeMo (libreria nativa), motor qvac-fabric-speech.cpp con GGUF Q8_0, y Core ML para Apple Neural Engine. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: RTF de 0,052, latencia de inferencia de 1.021 ms y arranque en frio de 252 ms en telefonos con builds de 8 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Open ASR Leaderboard | Multilingual LibriSpeech | Licencia | Formatos |
|---|---|---|---|---|---|---|
| TranscribePsy-250M-EU-sub | 254M | 8 | 7,50 | **5,87** | Apache 2.0 | safetensors, GGUF, Core ML |
| TranscribePsy-250M-EU | 250M (aprox.) | 25 | 8,02 | 6,58 | No disponible en la informacion | PyTorch |
| Whisper-small | 242M | Multilingue (amplio) | 12,34 | 11,51 | No disponible en la informacion | No disponible en la informacion |
| Qwen3-ASR-0.6B | 782M | No disponible en la informacion | **7,40** | 12,60 | No disponible en la informacion | No disponible en la informacion |
| omniASR-CTC-300M-v2 | 326M | No disponible en la informacion | 15,31 | 11,89 | No disponible en la informacion | No disponible en la informacion |
| OWSM v4 small | 370M | No disponible en la informacion | 9,72 | 11,84 | No disponible en la informacion | No disponible en la informacion |

## Limitaciones y advertencias

- Cobertura limitada a ocho lenguas: no cubre el resto de idiomas europeos presentes en TranscribePsy-250M-EU (25 lenguas), por lo que no es adecuado para aplicaciones con requisitos linguisticos mas amplios.
- La suite Common Voice v25 no reporta una media comparable para este modelo porque incluye lenguas fuera de su cobertura; las comparaciones con otros modelos en esa suite no son directamente extrapolables.
- Riesgo de alucinacion y errores de transcripcion en audio con ruido, acentos no representados en el entrenamiento o terminologia especializada; no se documentan en la informacion disponible los sesgos conocidos del modelo.
- No se detallan en la informacion disponible las caracteristicas del dataset de entrenamiento ni posibles sesgos demograficos o dialectales.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base (nvidia/parakeet-tdt-0.6b-v3) y de los datasets de evaluacion utilizados.
- Las metricas on-device corresponden a builds cuantizados a 8 bits en telefonos; el rendimiento en otros hardware puede diferir.
- No se documentan capacidades de razonamiento, tool calling ni procesamiento multimodal; el modelo esta especializado exclusivamente en ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub
- Build GGUF: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub-gguf
- Build Core ML: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub-coreml
- Modelo hermano de 25 lenguas: https://huggingface.co/qvac/TranscribePsy-250M-EU
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Paper CAFE en arXiv: https://arxiv.org/abs/2610.19134
- Motor qvac-fabric-speech.cpp: https://github.com/tetherto/qvac-fabric-speech.cpp
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Multilingual LibriSpeech (OpenSLR 94): https://www.openslr.org/94/

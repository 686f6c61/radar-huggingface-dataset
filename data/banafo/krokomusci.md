# Banafo/KrokoMusci

## Resumen

KrokoMusci es un pipeline de reconocimiento automatico del habla (ASR) en ingles para audio grabado, desarrollado por Banafo. No es un modelo unico, sino un sistema de fusion de dos modelos: Kroko (un Zipformer RNN-T que genera una transcripcion inicial) y Musci (una version afinada de Qwen3-ASR que puntua las palabras del borrador y su final). Cuando la confianza de una palabra o del cierre del borrador cae por debajo de un umbral, Musci continua desde el prefijo aceptado usando su estado de decodificador en cache y puede reincorporarse al borrador de Kroko cuando el texto vuelve a coincidir.

El sistema esta disenado para inferencia completamente offline: ambos modelos se ejecutan en una unica GPU NVIDIA, el runtime descarga los checkpoints fijados y construye el motor TensorRT antes de la inferencia, y ni el audio ni la transcripcion salen de la maquina local. Esto lo hace relevante para entornos con requisitos de privacidad o sin conectividad.

La propuesta tecnica se centra en la fusion de dos ASR con estrategias distintas (un modelo acustico clasico y un modelo basado en un LLM multimodal) mediante una regla fija que combina la comparacion contra las salidas del encoder acustico de Kroko, la confianza por palabra de Kroko y la puntuacion del borrador de Musci. El modelo esta limitado a ingles y a fragmentos de audio de hasta 40 segundos por invocacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de fusion: Kroko (Zipformer RNN-T) + Musci (Qwen3-ASR afinado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (audio de entrada de hasta 40 segundos por WAV) |
| Tipos de cuantizacion | no disponible (runtime compila motor TensorRT) |
| Idiomas soportados | Ingles (en) |
| Licencia | Kroko Community Model License 2.1 (Kroko) + Apache-2.0 (Musci); licencia del pipeline no especificada |
| Formato de pesos | no disponible (checkpoints en Hugging Face; motor TensorRT generado en runtime) |

## Arquitectura y entrenamiento

KrokoMusci combina dos componentes con paradigmas distintos. Kroko es un Zipformer RNN-T, es decir, un modelo acustico de tipo transformer eficiente con decodificador recurrente y transductor, orientado a ASR de alto rendimiento. Musci es una version afinada de Qwen3-ASR, un modelo de reconocimiento del habla basado en un LLM. El pipeline ejecuta primero a Kroko para producir un borrador y despues a Musci sobre el mismo audio para puntuar cada palabra y el final del borrador.

El mecanismo de fusion es determinista: cuando una palabra o el cierre del borrador obtiene una puntuacion por debajo de un umbral de confianza, Musci continua la decodificacion desde el prefijo aceptado usando su estado de decodificador cacheado, y puede reincorporarse al borrador de Kroko cuando el texto vuelve a alinearse. Kroko compara entonces las dos versiones de cada tramo en disputa contra las salidas de su encoder acustico, y una regla fija de fusion que combina esa comparacion, la confianza por palabra de Kroko y la puntuacion del borrador de Musci elige la redaccion final. No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el afinado de Musci.

## Capacidades

- Transcripcion de voz a texto en ingles sobre audio grabado (WAV mono a 16 kHz).
- Fusion de dos ASR con correccion selectiva de tramos de baja confianza.
- Inferencia completamente offline: audio y transcripcion permanecen en la maquina local.
- Ejecucion de ambos modelos en una unica GPU NVIDIA mediante TensorRT.
- Procesamiento de fragmentos de audio de hasta 40 segundos por invocacion.
- Puntuacion de confianza por palabra y del cierre del borrador.
- No se documentan capacidades de tool calling, agentes, vision, audio multilingue ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de reuniones y entrevistas en entornos sin conectividad: el pipeline procesa audio grabado localmente y mantiene la confidencialidad de la conversacion, adecuado para sectores regulados.
- Subtitulado y documentacion de archivos audiovisuales: la correccion selectiva de tramos de baja confianza reduce el WER en pasajes dificiles sin requerir revision manual completa.
- Dictado profesional en ingles: la fusion de dos ASR mejora la fidelidad en terminos tecnicos o nombres propios donde un unico modelo suele fallar.
- Evaluacion de calidad de ASR en pipelines internos: el sistema puede usarse como referencia de alta precision para comparar otros transcriptores.
- Procesamiento por lotes en servidor con GPU: el RTFx reportado (mas de 1.700x en el conjunto de siete pruebas publicas) permite transcribir grandes volumenes de audio en poco tiempo.
- Transcripcion de comandos de voz y entidades en dominios especificos: el resultado de VoiceCodeBench (85,76% de Entity Match) sugiere utilidad en escenarios donde importan nombres, identificadores o codigos dictados.
- Prototipado de asistentes de voz offline: el despliegue en Docker con una sola GPU facilita integrar el pipeline en entornos de desarrollo sin dependencias en la nube.

## Benchmarks y rendimiento

Los resultados publicados en la model card, medidos en una NVIDIA H200 con tamano de lote 256:

| Ambito de prueba publico | WER medio | RTFx agrupado |
|---|---:|---:|
| Siete conjuntos publicos Open ASR por defecto | 4,94% | 1.722,66x |
| Comparacion publica de diez conjuntos | 4,24% | 1.717,78x |

| Benchmark | WER | RTFx | Entity Match |
|---|---:|---:|---:|
| VoiceCodeBench | 4,14% | 1.460,43x | 85,76% |

El WER medio pondera cada conjunto de prueba por igual; el RTFx agrupado divide la duracion total de audio entre el tiempo total de inferencia cronometrado. No se proporcionan comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- GPU NVIDIA obligatoria; el runtime compila un motor TensorRT antes de la inferencia.
- Los benchmarks se ejecutaron en una NVIDIA H200 con tamano de lote 256.
- VRAM estimada: no disponible.
- GPU recomendadas: no disponible mas alla de la H200 usada en la evaluacion.
- Compatibilidad con GPU de consumo (RTX 4090 y similares): no confirmada en la informacion disponible.
- Despliegue mediante Docker con soporte de GPU NVIDIA en Linux; el script de inferencia se descarga desde el repositorio y se monta en el contenedor.
- Latencia y throughput: RTFx de 1.460x a 1.722x segun el conjunto de evaluacion, medido en H200 con lote 256.
- Requiere autenticacion en Hugging Face (`hf auth login`) y aceptacion de la licencia de Kroko.

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos en la informacion disponible. Como referencia de categoria, el pipeline se situa frente a ASR monomodelo como Whisper (OpenAI) o los propios Kroko-ASR-XL-EN-Offline y Qwen3-ASR por separado, pero no se dispone de datos de rendimiento comparables en la documentacion proporcionada.

| Modelo | Parametros | Contexto/audio | Licencia | Disponibilidad |
|---|---|---|---|---|
| KrokoMusci | no disponible | hasta 40 s por WAV | Kroko Community Model License 2.1 + Apache-2.0 | Hugging Face (acceso con aceptacion de licencia) |
| Kroko-ASR-XL-EN-Offline | no disponible | no disponible | Kroko Community Model License 2.1 | Hugging Face |
| Musci-ASR-qwen-1019-hf | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Whisper (referencia de categoria) | no disponible en esta ficha | no disponible en esta ficha | MIT | Amplia |

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta soporte multilingue.
- Entrada limitada a fragmentos de audio de hasta 40 segundos por invocacion en el ejemplo de transcripcion.
- La licencia del pipeline como conjunto no esta explicitamente unificada: Kroko usa la Kroko Community Model License 2.1, con terminos de acceso y uso que deben revisarse antes de un uso comercial, mientras que Musci usa Apache-2.0.
- Requiere aceptar la licencia de Kroko y autenticarse en Hugging Face para descargar los checkpoints.
- Depende de GPU NVIDIA y de la compilacion de un motor TensorRT, lo que anade complejidad de despliegue y tiempo de arranque.
- No se detallan sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- El rendimiento reportado se obtuvo en una H200 con lote 256; el rendimiento en hardware inferior puede diferir.
- No se especifican requisitos de VRAM ni compatibilidad con GPU de consumo, lo que dificulta planificar despliegues en estaciones de trabajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Banafo/KrokoMusci
- Checkpoint Kroko: https://huggingface.co/Banafo/Kroko-ASR-XL-EN-Offline/tree/8c1fb9b89831c6cd9f63d0295f2ccb2be6da2964
- Checkpoint Musci: https://huggingface.co/Musci-research/Musci-ASR-qwen-1019-hf/tree/90caacb67144e9f105dc1b66964789ae803b6b29
- Licencia y terminos de Kroko: https://huggingface.co/Banafo/Kroko-ASR-XL-EN-Offline
- Modelo y licencia de Musci: https://huggingface.co/Musci-research/Musci-ASR-qwen-1019-hf
- Resultados por conjunto de datos: https://huggingface.co/Banafo/KrokoMusci/blob/main/open_asr_results.md
- Space de evaluacion publica: https://huggingface.co/spaces/Banafo/KrokoMusci-OpenASR
- Trabajo de evaluacion en H200: https://huggingface.co/jobs/Banafo/6b097e0354072e8b7169de69
- Trabajo de calificacion de VoiceCodeBench: https://huggingface.co/jobs/Banafo/6b09805154072e8b7169e096

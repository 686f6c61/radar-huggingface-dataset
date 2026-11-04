# AnalogVector/voxdicta-models

## Resumen

AnalogVector/voxdicta-models no es un modelo entrenado por su autor, sino un repositorio espejo que agrupa los artefactos de inferencia que consume la aplicacion Voxdicta, una herramienta de reconocimiento de voz. El repositorio combina pesos de varios modelos de ASR (reconocimiento automatico del habla), deteccion de actividad de voz (VAD), alineamiento forzado de palabras y diarizacion de hablantes, todos ellos convertidos a formatos GGUF o GGML con cuantizacion de 8 bits para su ejecucion local en CPU o GPU de consumo.

Los componentes principales son Whisper Large v3 Turbo (OpenAI), Canary 1B v2 (NVIDIA), Qwen3-ASR-1.7B (Alibaba), Qwen3-ForcedAligner-0.6B, Silero VAD y Nemotron 3 Diarization (NVIDIA). El repositorio declara un total de 979.949.072 parametros en safetensors, aunque esta cifra no representa un unico modelo: es la suma de los componentes en formato safetensors del repositorio. El tamano total del repo es de 8,1 GB.

Su relevancia practica radica en que ofrece un conjunto coherente y ya cuantizado de piezas para montar un pipeline completo de transcripcion con marcas de tiempo y separacion de hablantes, sin necesidad de convertir ni cuantizar cada modelo por separado. No obstante, al tratarse de un espejo, la licencia no es unica: cada archivo conserva los terminos de su origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogeneo: Whisper (encoder-decoder transformer), Canary FastConformer + decoder transformer, Qwen3-ASR (transformer), Silero VAD (red neuronal ligera), Nemotron 3 Diarization (99M) |
| Parametros totales | 979.949.072 (suma de los componentes en safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF/GGML), int8 (ONNX), F32 (Silero VAD) |
| Idiomas soportados | no disponible (depende de cada modelo upstream) |
| Licencia | Mixta: MIT (Whisper, Silero VAD), CC-BY-4.0 (Canary, assets de timestamps), Apache 2.0 (Qwen3-ASR, Qwen3-ForcedAligner), OpenMDW 1.1 (Nemotron 3 Diarization) |
| Formato de pesos | GGUF, GGML (.bin), ONNX, safetensors, tokenizer.model |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: redistribuye artefactos ya entrenados por terceros y convertidos a formatos de inferencia local. Whisper Large v3 Turbo es un transformer encoder-decoder con decodificacion autoregresiva; Canary 1B v2 combina un encoder FastConformer (convoluciones y normalizaciones en F32) con un decoder transformer, y sus matrices lineales estan cuantizadas a 8 bits. Qwen3-ASR-1.7B y Qwen3-ForcedAligner-0.6B son transformadores de Alibaba convertidos a Q8_0. Silero VAD v6.2 se distribuye en F32 (16 kHz) con el layout de speech.cpp, y Nemotron 3 Diarization (99M) se ofrece en dos layouts distintos: uno para la aplicacion de Windows (speech.cpp) y otro para Android (NeMo-Speech.cpp).

Las conversiones y cuantizaciones fueron realizadas por terceros (sakasegawa, cstr) y por el propietario del repositorio; el espejo conserva los nombres de archivo originales e incluye los textos de licencia en el directorio `LICENSES/`. No se documentan en la model card los datos de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO, ya que esa informacion corresponde a cada modelo upstream.

## Capacidades

- Reconocimiento automatico del habla (ASR) con varios motores alternativos: Whisper Large v3 Turbo, Canary 1B v2 y Qwen3-ASR-1.7B.
- Generacion de marcas de tiempo a nivel de palabra mediante el modelo CTC de Canary y Qwen3-ForcedAligner-0.6B.
- Deteccion de actividad de voz (VAD) con Silero VAD v6.2 para segmentar regiones con habla.
- Diarizacion de hablantes con Nemotron 3 Diarization (99M), disponible en layouts para Windows y Android.
- Ejecucion local en CPU y GPU de consumo gracias a la cuantizacion Q8_0 e int8.
- Soporte multilingue: no disponible de forma explicita en la informacion proporcionada; depende de los modelos upstream (Whisper y Canary son multilingues, pero no se detalla la lista de idiomas).

## Casos de uso

- Transcripcion de reuniones con marcas de tiempo: combinando Canary 1B v2 con el modelo CTC de timestamps o con Qwen3-ForcedAligner, se obtiene texto alineado palabra a palabra, util para actas y subtitulos.
- Subtitulado automatico de video: Whisper Large v3 Turbo Q8_0 permite generar subtitulos con tiempos por segmento en equipos sin GPU dedicada.
- Diarizacion de entrevistas y podcasts: Nemotron 3 Diarization separa las intervenciones de cada hablante, y el alineador añade tiempos por palabra para facilitar la revision.
- Asistentes de voz en escritorio: Silero VAD detecta cuando empieza y termina el habla, reduciendo el consumo al no procesar silencios.
- Aplicaciones moviles de dictado: el layout NeMo-Speech.cpp de Nemotron y las versiones Q8_0 permiten ejecutar el pipeline en Android con memoria limitada.
- Investigacion en ASR comparativo: al reunir tres motores de reconocimiento en un mismo formato, facilita la evaluacion cruzada de precision y latencia sobre el mismo audio.
- Archivado y busqueda de audio: la transcripcion con timestamps permite indexar grabaciones largas y localizar fragmentos por palabra clave.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, los pesos Q8_0 de Canary 1B v2 rondan 1 GB; Qwen3-ASR-1.7B Q8_0, en torno a 1,7-2 GB; Whisper Large v3 Turbo Q8_0, en torno a 1,5-2 GB; los modelos de alineamiento y diarizacion son mucho menores (0,6B y 99M).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU con 4-8 GB de VRAM puede alojar los componentes principales en Q8_0.
- GPU de consumo: si, los componentes individuales caben en tarjetas consumer de gama media; el pipeline completo requiere cargar varios modelos, por lo que conviene gestionarlos secuencialmente.
- Opciones de despliegue: whisper.cpp (formato GGML), speech.cpp (layouts de Silero y Nemotron), runtime GGUF compatible con los archivos Q8_0, y ONNX Runtime para los assets int8.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Voxdicta (espejo) | 979.949.072 en total (suma de componentes) | no disponible | Mixta por archivo | GGUF, GGML, ONNX, safetensors | HuggingFace, 109 descargas |
| Whisper Large v3 Turbo | no disponible en la informacion | no disponible | MIT | GGML/GGUF en este repo | ggerganov/whisper.cpp |
| NVIDIA Canary 1B v2 | 1B (aprox.) | no disponible | CC-BY-4.0 | NeMo original; GGUF Q8_0 aqui | nvidia/canary-1b-v2 |
| Qwen3-ASR-1.7B | 1,7B | no disponible | Apache 2.0 | GGUF Q8_0 | Qwen/Qwen3-ASR-1.7B |

La comparativa de rendimiento entre estos motores no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo unico: es un espejo de artefactos de distintos autores; no debe citarse como un modelo entrenado por AnalogVector.
- Licencia mixta: cada archivo tiene sus propios terminos (MIT, CC-BY-4.0, Apache 2.0, OpenMDW 1.1); es obligatorio conservar atribuciones y textos de licencia al redistribuir.
- Canary y Nemotron tienen condiciones especificas (CC-BY-4.0 y OpenMDW 1.1) que conviene revisar antes de un uso comercial.
- La cuantizacion Q8_0 puede degradar ligeramente la precision respecto a los pesos originales en F32.
- Riesgo de alucinacion inherente a los modelos ASR, especialmente con audio ruidoso o con silencios largos.
- Idiomas soportados no documentados en la model card; la cobertura depende de cada modelo upstream.
- No hay benchmarks publicados en la informacion disponible, por lo que no es posible comparar su precision de forma objetiva.
- La fecha de creacion del repositorio (2026-10-08) y la de actualizacion (2026-11-03) figuran como tales en los metadatos; verificar su coherencia antes de citarlas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AnalogVector/voxdicta-models
- Whisper.cpp: https://huggingface.co/ggerganov/whisper.cpp
- NVIDIA Canary 1B v2: https://huggingface.co/nvidia/canary-1b-v2
- Assets ONNX de timestamps: https://huggingface.co/ysdede/nemo-canary-1b-v2-onnx-timestamped
- Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Qwen3-ASR-1.7B GGUF (sakasegawa): https://huggingface.co/sakasegawa/Qwen3-ASR-1.7B-GGUF
- Qwen3-ForcedAligner-0.6B: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Qwen3-ForcedAligner GGUF (cstr): https://huggingface.co/cstr/qwen3-forced-aligner-0.6b-GGUF
- Silero VAD GGUF (sakasegawa): https://huggingface.co/sakasegawa/silero-vad-GGUF
- Nemotron 3 Diarization: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Nemotron 3 Diarization GGUF (sakasegawa): https://huggingface.co/sakasegawa/Nemotron-3-Diarization-GGUF
- Release de modelos ASR de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models
- speech.cpp: https://github.com/nyosegawa/speech.cpp

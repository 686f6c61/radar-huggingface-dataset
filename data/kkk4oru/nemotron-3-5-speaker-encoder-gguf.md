# kkk4oru/nemotron-3.5-speaker-encoder-gguf

## Resumen

Nemotron 3.5 speaker encoder (GGUF) es una derivación no oficial del modelo de voz NVIDIA Nemotron 3.5 Transcribe 30B-A4B, publicada por el usuario kkk4oru en Hugging Face. No se trata de un modelo completo, sino de un recorte quirúrgico: conserva únicamente la rama de detección de hablantes (diarización) del encoder original y sustituye la rama de reconocimiento automático del habla y la cabeza CTC por tensores de relleno inicializados a cero. El resultado es un fichero GGUF de aproximadamente 200 MB (frente a los 1,67 GB del encoder completo) que detecta quién habla y cuándo, pero no transcribe nada.

El modelo base, NVIDIA Nemotron 3.5 Transcribe 30B-A4B, es un LLM de voz con arquitectura híbrida de mezcla de expertos que activa unos 4.300 millones de parámetros, soporta 40 idiomas, contextos de 65.536 tokens y grabaciones de hasta una hora. Esta ficha describe exclusivamente el derivado GGUF para diarización, que cuenta con unos 99,9 millones de parámetros reales según los safetensors del repositorio y se distribuye bajo licencia OpenMDW-1.1.

Su relevancia práctica es acotada pero clara: permite ejecutar diarización de hablantes de alta calidad sobre audio largo con un consumo de memoria contenido y una latencia notablemente inferior a la del encoder completo, manteniendo resultados idénticos en las mediciones publicadas por el autor. Es útil para quien necesite segmentación por hablante sin cargar el modelo de transcripción completo, siempre asumiendo que se trata de un artefacto no validado por NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivado del encoder de voz de Nemotron 3.5 Transcribe (transformer con rama de diarizacion, fusion y cabeza CTC); el modelo base es un MoE hibrido |
| Parametros totales | 99.910.316 (segun safetensors del repo); el fichero GGUF F16 ocupa 200.779.392 bytes |
| Parametros activos | No aplica al derivado (el modelo base activa ~4,3B, incluido el encoder de audio) |
| Longitud de contexto | No disponible para el derivado; el modelo base soporta 65.536 tokens y audio de hasta una hora |
| Tipos de cuantizacion | Solo F16 (y F32 en algunas partes de la rama de hablante); no se publican otras cuantizaciones |
| Idiomas soportados | No disponibles en el derivado; el modelo base cubre 40 idiomas |
| Licencia | OpenMDW-1.1 (licencia del modelo original) |
| Formato de pesos | GGUF (fichero `NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-Speaker-Encoder-F16.gguf`) |

## Arquitectura y entrenamiento

El derivado no ha sido entrenado: es el resultado de una conversion y reescritura de pesos. El script `make-speaker-models.py` ejecuta primero la conversion oficial de NVIDIA/NeMo-Speech.cpp v0.3.0 y despues reescribe el fichero resultante. La rama de hablante (`diar.*`, `preprocessor.fb`, `fusion.diar_norm.*`) conserva los pesos originales de NVIDIA en F16 y F32, sin cuantizar. La rama de habla (`asr.*` y el resto de `fusion.*`) se sustituye por una unica capa de 128 dimensiones inicializada a cero, frente a las 32 capas de 1.280 dimensiones del original. La cabeza de timestamps CTC (`ctc.*`) se reduce igualmente a una capa de 128 dimensiones a cero, y su tokenizador conserva solo las tres primeras piezas.

Los tensores de relleno se mantienen en el fichero porque el programa de inferencia los carga y ejecuta, aunque el resultado de diarizacion no los lee. El tamano de cabeza se fija en 64, el que usa la propia rama de hablante, porque los backends de GPU solo aceptan ciertos tamanos de cabeza en flash attention. La procedencia es trazable: pesos del modelo `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B` en la revision `c17667641642c4265ff2b7037dd101b7d4567634`, leyendo solo los rangos de bytes `perception.*` y `ctc_timestamp.*` de `model.safetensors`.

## Capacidades

- Diarizacion de hablantes: identifica quien habla y cuando a lo largo de una grabacion, devolviendo turnos de habla en JSON.
- Deteccion de actividad de voz (VAD) como parte del pipeline de segmentacion.
- Procesamiento de audio de larga duracion: las peticiones admiten hasta una hora de audio.
- No transcribe: la rama de habla esta anulada con pesos a cero, por lo que el modelo carece de cualquier capacidad de reconocimiento del habla.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues propias del derivado.

## Casos de uso

- Diarizacion de reuniones y actas: el modelo segmenta una reunion de hasta una hora por hablante, generando turnos que posteriormente pueden alinearse con una transcripcion producida por otro sistema. Es adecuado por su bajo consumo de memoria y su velocidad en Metal (un clip de una hora tarda 3,8 s).
- Analisis de llamadas de atencion al cliente: permite separar la voz del agente y la del cliente en grabaciones largas para calcular tiempos de habla, solapamientos y participacion, sin necesidad de cargar el modelo de transcripcion completo.
- Investigacion cualitativa y etnografia: segmentacion de entrevistas y grupos focales para medir turnos de palabra y silencios antes de transcribir con otra herramienta.
- Preprocesado en pipelines de ASR: actuar como etapa de diarizacion previa que divide el audio por hablante y alimenta despues un motor de reconocimiento independiente.
- Monitorizacion de medios y radio: deteccion de locutores e intervinientes en emisiones largas para indexar fragmentos por voz.
- Sistemas de subtitulado con atribucion de hablante: combinado con un transcriptor externo, aporta la etiqueta de quien habla a cada subtitulo en contenido de hasta una hora.
- Despliegue en hardware modesto: al ocupar unos 200 MB y requerir alrededor de 3 GB de RSS en CPU para una hora de audio, cabe en equipos de desarrollo y portatiles Apple sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (DER, WER u otros) en la informacion disponible. El autor mide exclusivamente equivalencia funcional y rendimiento frente al encoder completo de NVIDIA convertido con las mismas herramientas:

| Audio y dispositivo | Turnos de hablante | Tiempo, encoder completo | Tiempo, este fichero | RSS maximo, encoder completo | RSS maximo, este fichero |
|---|---|---|---|---|---|
| 4 h 13 min en peticiones solapadas, Metal (Apple M5 Pro, 48 GB) | identicos (12.158) | 79,5 s | 26,6 s | 3,19 GB | 3,16 GB |
| 1 hora, CPU (macOS) | identicos (2.869) | 111,6 s | 32,7 s | 5,00 GB | 2,85 GB |

El autor indica que las respuestas JSON coinciden byte a byte en las ejecuciones en CPU y turno a turno en las de 4 horas. Tambien coinciden cuatro clips de 2 minutos, un clip de 5 minutos y uno de una hora en Metal, y un clip de 2 minutos y otro de 5 minutos en CPU. El clip de una hora tarda 3,8 s en Metal. Estas cifras demuestran equivalencia con el encoder completo, no precision del modelo: no hay ground truth ni verificacion humana. Solo se probaron Metal y CPU en macOS; Vulkan y CUDA no se evaluaron.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este derivado (speaker encoder GGUF) | ~99,9 M | Hasta 1 hora de audio por peticion | Solo diarizacion | OpenMDW-1.1 | GGUF en Hugging Face, no oficial |
| NVIDIA Nemotron 3.5 Transcribe 30B-A4B (encoder completo) | ~4,3B activos (MoE) | 65.536 tokens, hasta 1 hora | Transcripcion en 40 idiomas, diarizacion y timestamps | OpenMDW-1.1 | BF16, FP8 y NVFP4 en Hugging Face (oficial) |
| NVIDIA Nemotron 3.5 Transcribe 30B-A4B-FP8 | ~4,3B activos (MoE) | 65.536 tokens, hasta 1 hora | Transcripcion, diarizacion y timestamps | OpenMDW-1.1 | FP8 en Hugging Face (oficial) |

No se dispone de datos en la informacion proporcionada para comparar con otros modelos de diarizacion especializados (por ejemplo, sistemas tipo pyannote) en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No transcribe: la rama de habla esta anulada con pesos a cero; cualquier intento de usarlo para ASR producira resultados invalidos.
- Derivado no oficial: no esta hecho, probado ni respaldado por NVIDIA, y no cuenta con validacion de precision frente a ground truth.
- Requiere un fichero decoder del mismo checkpoint aunque no se use para responder: el programa exige pasarlo junto al encoder y desactivar el warm-up (`--no-warmup`), ya que el warm-up decodifica.
- El decoder auxiliar (`speaker-decoder-head.gguf`) debe extenderse con ceros hasta 445.521.952 bytes para poder usarse.
- Solo se probaron los backends Metal y CPU en macOS; Vulkan y CUDA no fueron evaluados, por lo que el comportamiento en GPU NVIDIA es desconocido.
- Los resultados difieren ligeramente entre Metal y CPU.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados para este derivado; al conservar los pesos de diarizacion del modelo original, hereda los sesgos no auditados de este.
- Idiomas soportados por el derivado: no disponibles; la cobertura de 40 idiomas corresponde al modelo base completo, no a esta rama.
- Licencia OpenMDW-1.1: es necesario revisar sus terminos para uso comercial; el repositorio incluye `THIRD_PARTY_NOTICES.md` sin modificar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face del derivado: https://huggingface.co/kkk4oru/nemotron-3.5-speaker-encoder-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Version FP8 del modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8
- Blog de investigacion de NVIDIA Nemotron 3.5 Transcribe: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Transcribe/
- Repositorio NVIDIA/NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp

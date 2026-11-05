# Rekname/voicenotes-models

## Resumen

`Rekname/voicenotes-models` no es un modelo único, sino un repositorio espejo que agrupa varios modelos de código abierto empaquetados para la aplicación de escritorio VoiceNotes, orientada a transcripción, subtitulado y generación de resúmenes de grabaciones de audio sin conexión. El autor, Rekname, no entrena ningún modelo propio: redistribuye artefactos de terceros en formatos ONNX y GGUF, sin modificarlos, y remite a las licencias originales de cada componente. El repositorio es, por tanto, un paquete de despliegue más que una contribución de investigación.

El conjunto cubre la cadena completa de procesamiento de una nota de voz: reconocimiento automático del habla (ASR) con GigaAM-v3 e2e RNNT para ruso y con Whisper small y large-v3-turbo (versiones faster-whisper) para uso multilingüe; diarización de hablantes con pyannote speaker-diarization-community-1 y con la segmentación pyannote 3.0 exportada a ONNX para ejecución ligera vía sherpa-onnx; extracción de embeddings de voz con WeSpeaker ResNet34-LM; y generación de resúmenes con Qwen3-4B-Instruct-2507 cuantizado a Q4_K_M. El dato de parámetros totales reportado en safetensors (4.022.468.096) corresponde casi por completo al LLM Qwen3-4B incluido en el paquete.

Su relevancia actual es práctica: demuestra un patrón de empaquetado reproducible de pipelines de audio en local (ASR + diarización + LLM), con formatos que funcionan en CPU y GPU de consumo (ONNX Runtime y llama.cpp/GGUF). No obstante, el repositorio no documenta idiomas soportados de forma agregada, no publica benchmarks propios y arrastra licencias heterogéneas que condicionan su uso comercial. Para un desarrollador que quiera evaluarlo, conviene tratarlo como una recopilación de dependencias con atribución, no como un modelo con garantías de rendimiento unificadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conjunto heterogéneo: RNNT convolucional-transformer (GigaAM-v3), transformer encoder-decoder (Whisper small y large-v3-turbo), pipeline de segmentación y clustering (pyannote), CNN ResNet34 con pooling estadístico (WeSpeaker) y transformer decoder-only (Qwen3-4B-Instruct-2507) |
| Parámetros totales | 4.022.468.096 en safetensors (dominado por Qwen3-4B); el desglose por componente no está disponible |
| Parámetros activos | No aplica (ningún componente es MoE) |
| Longitud de contexto | No disponible a nivel de repositorio; el LLM incluido (Qwen3-4B-Instruct-2507) tiene contexto largo según su model card original, pero el valor no se especifica en este repo |
| Tipos de cuantización | Q4_K_M para el LLM (GGUF); exportaciones ONNX para segmentación y embeddings; el resto de pesos en sus formatos originales |
| Idiomas soportados | No disponibles de forma agregada; por componente: GigaAM-v3 orientado a ruso, Whisper small y large-v3-turbo multilingües |
| Licencia | `other` a nivel de repo; por componente: MIT (GigaAM, Whisper, sherpa-onnx), CC-BY-4.0 (pyannote community-1, WeSpeaker ResNet34-LM), Apache-2.0 (Qwen3-4B-Instruct-2507) |
| Formato de pesos | ONNX y GGUF, además de los formatos nativos de cada componente |

## Arquitectura y entrenamiento

El repositorio no entrena ni ajusta ningún modelo; agrega artefactos ya entrenados por terceros. Cada componente conserva su arquitectura original: GigaAM-v3 e2e RNNT es un reconocedor de extremo a extremo con decodificación RNNT para ruso; Whisper small y large-v3-turbo son encoder-decoder transformer con decodificación autoregresiva, en las variantes faster-whisper (CTranslate2) que priorizan velocidad de inferencia; pyannote speaker-diarization-community-1 combina segmentación neuronal con clustering de embeddings para atribuir turnos de habla; la segmentación pyannote 3.0 se exporta a ONNX para ejecutarse con sherpa-onnx, y WeSpeaker ResNet34-LM (entrenado sobre VoxCeleb) produce embeddings de locutor para verificación e identificación. El LLM Qwen3-4B-Instruct-2507 se incluye cuantizado a Q4_K_M para generar resúmenes y notas.

No se dispone de información sobre volúmenes de tokens, composición de datasets, ni etapas de RLHF o DPO en este repositorio; esos detalles corresponden a las model cards originales de cada componente, enlazadas en la sección de enlaces. La innovación técnica del paquete es de ingeniería de despliegue: la combinación de ONNX (para segmentación y embeddings en CPU) con GGUF (para el LLM) permite ejecutar un pipeline completo de notas de voz en local, sin dependencia de servicios en la nube, y con un tamaño de repo de 5,1 GB.

## Capacidades

- Reconocimiento automático del habla en ruso con GigaAM-v3 e2e RNNT.
- Reconocimiento multilingüe con Whisper small (variante rápida) y Whisper large-v3-turbo (variante de mayor precisión).
- Diarización de hablantes ("quién habla y cuándo") con pyannote speaker-diarization-community-1.
- Diarización ligera mediante segmentación pyannote 3.0 exportada a ONNX y ejecutada con sherpa-onnx.
- Extracción de embeddings de locutor (voiceprints) con WeSpeaker ResNet34-LM para identificación y verificación de hablantes.
- Generación de resúmenes y notas a partir de transcripciones con Qwen3-4B-Instruct-2507.
- Generación de subtítulos a partir del texto reconocido y de las marcas temporales del ASR.
- Ejecución totalmente offline: los formatos ONNX y GGUF están pensados para inferencia local.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio nativo en el LLM incluido dentro de este repositorio.

## Casos de uso

- Transcripción de reuniones en ruso: usar GigaAM-v3 e2e RNNT para obtener la transcripción y, en paralelo, pyannote community-1 para atribuir cada intervención a un hablante, produciendo actas con turnos identificados.
- Subtitulado de vídeos multilingües: Whisper large-v3-turbo genera la transcripción con marcas temporales y el pipeline las convierte en ficheros de subtítulos; Whisper small sirve como opción de menor latencia en equipos modestos.
- Resumen automático de notas de voz: tras el ASR, Qwen3-4B-Instruct-2507 en GGUF Q4_K_M condensa la transcripción en puntos clave, ejecutable en local con llama.cpp sin enviar audio a la nube.
- Identificación de participantes en grabaciones: WeSpeaker ResNet34-LM extrae embeddings de voz que permiten etiquetar hablantes recurrentes entre distintas grabaciones (voiceprints).
- Aplicaciones de privacidad estricta: al ser un pipeline íntegramente offline en ONNX/GGUF, encaja en entornos donde el audio no puede salir del dispositivo (sanidad, legal, sector público).
- Prototipado de pipelines de audio en CPU: sherpa-onnx con la segmentación pyannote 3.0 permite una diarización rápida sin GPU, útil para pruebas de concepto y despliegues en portátiles.
- Indexado y búsqueda de archivos de audio: combinar transcripción, diarización y resumen para construir un índice buscable de grabaciones por hablante y tema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de WER, DER ni evaluaciones del LLM, y no se deben extrapolar cifras de las model cards originales sin verificarlas allí.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada. Como referencia orientativa, el LLM Qwen3-4B en Q4_K_M ocupa del orden de 2,5 GB de pesos; Whisper large-v3-turbo requiere varios GB en precisión completa. Estas cifras son estimaciones de orden de magnitud, no datos publicados en el repositorio.
- GPU recomendadas: no especificadas por el autor. Para el LLM en GGUF, una GPU de consumo con 6-8 GB de VRAM es suficiente en Q4_K_M; para Whisper large-v3-turbo conviene una GPU con 8-10 GB o más.
- CPU: la segmentación pyannote 3.0 en ONNX y los embeddings WeSpeaker están pensados para ejecutarse en CPU mediante sherpa-onnx y ONNX Runtime.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño del repo (5,1 GB) y la cuantización Q4_K_M del LLM; el autor no publica requisitos oficiales.
- Opciones de despliegue: ONNX Runtime / sherpa-onnx para los componentes ONNX; llama.cpp u Ollama para el GGUF de Qwen3; faster-whisper (CTranslate2) para Whisper; el pipeline pyannote original para la diarización completa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rekname/voicenotes-models | Paquete de pipeline (ASR + diarización + LLM) | 4.022.468.096 en safetensors (dominado por Qwen3-4B) | No disponible | `other` (MIT, CC-BY-4.0 y Apache-2.0 por componente) | HuggingFace, 0 descargas |
| Whisper large-v3-turbo (OpenAI) | ASR multilingüe | No disponible en esta ficha | No disponible | MIT | HuggingFace y múltiples mirrors |
| pyannote speaker-diarization-community-1 | Diarización | No disponible en esta ficha | No aplica | CC-BY-4.0 | HuggingFace (requiere aceptar condiciones) |
| Qwen3-4B-Instruct-2507 | LLM decoder-only | 4B | No disponible en esta ficha | Apache-2.0 | HuggingFace |

La comparación directa no es homogénea: el repositorio de Rekname agrega varios modelos, mientras que las alternativas son componentes individuales. Su ventaja es la integración y el empaquetado offline; su desventaja, la ausencia de métricas propias y la complejidad de licencias.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: no hay garantías de rendimiento ni evaluación propia; cualquier cifra debe consultarse en las model cards originales.
- Licencias heterogéneas: aunque el repo declara `other`, los componentes CC-BY-4.0 (pyannote community-1 y WeSpeaker ResNet34-LM) exigen atribución explícita, lo que condiciona su uso comercial y su redistribución.
- pyannote speaker-diarization-community-1 puede requerir aceptar condiciones en HuggingFace y token de acceso para su descarga original; verificar antes de desplegar.
- Cobertura lingüística desigual: GigaAM-v3 está orientado al ruso; el multilingüismo depende de Whisper. No hay declaración agregada de idiomas soportados.
- Riesgo de alucinación en el LLM de resumen (Qwen3-4B): los resúmenes pueden introducir afirmaciones no presentes en la transcripción, especialmente con audio ruidoso o solapamiento de hablantes.
- La cuantización Q4_K_M del LLM degrada ligeramente la calidad frente a precisión completa; no se han publicado evaluaciones de esa pérdida en este repo.
- La diarización es sensible a solapamientos, ruido y número de hablantes; los errores de atribución se propagan a los resúmenes.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni issues públicos que permitan contrastar su funcionamiento.
- El tamaño del repo (5,1 GB) y la mezcla de formatos complican el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Rekname/voicenotes-models
- GigaAM (Salute Developers): https://github.com/salute-developers/GigaAM
- Whisper small (faster-whisper, Systran): https://huggingface.co/Systran/faster-whisper-small
- Whisper large-v3-turbo (faster-whisper, dropbox-dash): https://huggingface.co/dropbox-dash/faster-whisper-large-v3-turbo
- pyannote speaker-diarization-community-1: https://huggingface.co/pyannote/speaker-diarization-community-1
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- WeSpeaker: https://github.com/wenet-e2e/wespeaker
- Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507

# sandrophoto/eye-derush-speech-models

## Resumen

Eye Derush speech models es un repositorio de artefactos Core ML publicados por el desarrollador sandrophoto para su aplicacion macOS **Eye Derush**, orientada a la transcripcion de material de rodaje (rushes) y a la separacion de voces (speaker diarization) en local. No se trata de un modelo entrenado desde cero, sino de una redistribucion empaquetada de pesos ya convertidos a Core ML: por un lado, Whisper large-v3 turbo (encoder de audio, decoder de texto y espectrograma mel, mas su tokenizer) procedente de WhisperKit de Argmax; por otro, los modelos de segmentacion, embedding y clustering de hablantes de SpeakerKit, derivados de pyannote.audio y WeSpeaker.

El interes practico del repositorio es que agrupa en dos archivos `.aar` (Apple Archive) todo lo necesario para ejecutar ASR y diarizacion sobre Apple Silicon sin conexion de red: la aplicacion descarga cada archivo, verifica su SHA-256, lo descomprime y compila los modelos para el Mac concreto en el que se ejecuta. Esto lo hace relevante para desarrolladores que quieran integrar transcripcion y diarizacion offline en macOS sin depender de servicios en la nube.

El repositorio tiene 1,5 GB, no registra descargas ni likes en el momento de la consulta y no dispone de model card detallada mas alla de la tabla de contenidos y las atribuciones de licencia. No se han publicado especificaciones propias de contexto, idiomas ni cuantizaciones; los datos tecnicos deben inferirse de los modelos base citados (Whisper large-v3 turbo y pyannote speaker-diarization-3.1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) para ASR, convertido a Core ML; pipeline de diarizacion (segmentacion, embedding y clustering) tambien en Core ML |
| Parametros totales | no disponible (Whisper large-v3 turbo, tamano no declarado en el repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper large-v3 turbo opera sobre ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (artefactos Core ML ya compilados; no se declaran variantes) |
| Idiomas soportados | no disponible en el repositorio (Whisper large-v3 soporta multilingue, sin listado declarado) |
| Licencia | no disponible como licencia unica del repositorio; los componentes citados son MIT (Whisper y WhisperKit) y CC BY 4.0 (modelos de hablantes de SpeakerKit) |
| Formato de pesos | Core ML empaquetado en Apple Archive (`.aar`), con verificacion SHA-256 |
| Modelo base | openai/whisper-large-v3-turbo y pyannote/speaker-diarization-3.1 |
| Libreria | coreml |
| Tamano del repositorio | 1,5 GB |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: redistribuye conversiones a Core ML de modelos existentes. El componente ASR es Whisper large-v3 turbo, un transformer encoder-decoder con decoder autoregresivo que procesa audio en ventanas de 30 segundos representadas como espectrogramas mel; la conversion procede de `argmaxinc/whisperkit-coreml` (variante `openai_whisper-large-v3-v20240930`) e incluye encoder de audio, decoder de texto y el propio extractor de mel, ademas del tokenizer tomado de `openai/whisper-large-v3`. El componente de diarizacion procede de `argmaxinc/speakerkit-coreml` y agrupa tres etapas: segmentacion de hablante, extraccion de embeddings y clustering, derivadas de pyannote.audio (Herve Bredin y colaboradores) y WeSpeaker.

No hay informacion en el repositorio sobre datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF o DPO, ya que el autor no entrena los pesos. La innovacion tecnica relevante es el empaquetado: cada archivo `.aar` se descarga, se verifica mediante SHA-256, se descomprime y se compila para el Mac en el que corre la aplicacion, lo que permite ejecutar inferencia completamente local sobre Apple Silicon sin enviar audio ni transcripciones a ningun servidor.

## Capacidades

- Transcripcion automatica de voz (ASR) sobre audio y video, usando Whisper large-v3 turbo convertido a Core ML.
- Extraccion de caracteristicas mel y tokenizacion incluidas en el mismo paquete que el modelo ASR.
- Diarizacion de hablantes: segmentacion, generacion de embeddings de voz y clustering para distinguir voces en una misma grabacion.
- Procesamiento completamente offline: el audio y las transcripciones permanecen en el equipo local.
- Verificacion de integridad de los artefactos mediante SHA-256 antes de su compilacion.
- Compilacion de los modelos para el hardware Apple concreto en tiempo de instalacion.
- No se declaran capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de rushes de video en produccion audiovisual: la aplicacion descarga el paquete Whisper Core ML, transcribe el material y mantiene el audio en local, lo que resulta adecuado para material confidencial o no publicado.
- Etiquetado de entrevistas con multiples interlocutores: la combinacion de ASR y diarizacion permite generar transcripciones con hablante identificado, util en documentales y reportajes.
- Postproduccion y busqueda en archivo: al disponer de transcripciones con marcas de hablante, se pueden indexar y localizar fragmentos por quien habla y que dice.
- Flujos de trabajo en macOS sin conectividad: al ejecutarse sobre Core ML en Apple Silicon, el pipeline funciona en entornos aislados o con restricciones de red.
- Prototipado de herramientas de accesibilidad: transcripcion local de reuniones o clases con separacion de voces para generar actas o subtitulos.
- Integracion en aplicaciones macOS propias: los `.aar` pueden descargarse y compilarse desde una app, lo que facilita empaquetar ASR y diarizacion en productos de escritorio sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entorno de ejecucion: macOS sobre Apple Silicon con soporte de Core ML; el repositorio no declara requisitos minimos de chip ni de memoria.
- VRAM estimada: no disponible; al ejecutarse en Mac, el consumo se reparte entre memoria unificada y Neural Engine/GPU segun el chip.
- GPU recomendadas: no disponibles; el autor no especifica modelos de chip compatibles.
- Espacio en disco: los artefactos suman 1,5 GB antes de la descompresion y compilacion.
- Opciones de despliegue: Core ML a traves de la aplicacion Eye Derush; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Diarizacion integrada | Licencia | Formato |
|---|---|---|---|---|---|
| Eye Derush speech models | no disponible (Whisper large-v3 turbo) | no disponible (ventanas de 30 s en Whisper) | Si (pyannote/SpeakerKit) | no disponible como conjunto; componentes MIT y CC BY 4.0 | Core ML (`.aar`) |
| openai/whisper-large-v3-turbo | no disponible en la informacion | ventanas de 30 s | No | MIT | safetensors, entre otros |
| pyannote/speaker-diarization-3.1 | no disponible en la informacion | no disponible | Si (pipeline completo) | no disponible en la informacion | no disponible en la informacion |

La comparativa se limita a los modelos base citados por el autor; no se dispone de datos de rendimiento ni de parametros exactos para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio no incluye una licencia unificada declarada; el uso comercial exige revisar por separado las condiciones de Whisper y WhisperKit (MIT) y de los modelos de hablantes (CC BY 4.0, con atribucion obligatoria a los autores originales).
- No se declaran idiomas soportados ni cobertura linguistica; la calidad multilingue dependera del modelo base Whisper large-v3 turbo.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento en audio ruidoso o con solapamiento de voces.
- La diarizacion puede confundir hablantes con voces similares o en grabaciones con mucho ruido de fondo; no se documentan metricas de error (DER) en el repositorio.
- El modelo esta atado a macOS y Core ML; no es portable a Linux o Windows sin reconversion.
- El repositorio tiene cero descargas y cero likes, sin historial de validacion por parte de la comunidad.
- Los artefactos se redistribuyen sin cambios desde WhisperKit y SpeakerKit; cualquier problema de conversion es responsabilidad de esos proyectos upstream.
- No se especifican requisitos minimos de hardware, por lo que el rendimiento en Macs de gama baja es desconocido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sandrophoto/eye-derush-speech-models
- Modelo base ASR: https://huggingface.co/openai/whisper-large-v3-turbo
- Tokenizer de referencia: https://huggingface.co/openai/whisper-large-v3
- Conversion Core ML de Whisper: https://huggingface.co/argmaxinc/whisperkit-coreml
- Conversion Core ML de hablantes: https://huggingface.co/argmaxinc/speakerkit-coreml
- Modelo base de diarizacion: https://huggingface.co/pyannote/speaker-diarization-3.1

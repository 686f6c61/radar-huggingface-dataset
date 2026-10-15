# Sanghyang00/ELARSpeech-Whisper-Large-v3-afu

## Resumen

ELARSpeech-Whisper-Large-v3-afu es un modelo de reconocimiento automatico del habla (ASR) especializado en awutu (codigo ISO 639-3 `afu`), una lengua kwa hablada en Ghana. Lo publica el usuario Sanghyang00 bajo el paraguas del proyecto ELARSpeech y consiste en un ajuste fino del checkpoint openai/whisper-large-v3 sobre datos en dicha lengua. El repositorio pesa 6,2 GB y contiene 1.543.491.840 parametros en formato safetensors, es decir, la configuracion Large-v3 completa de la familia Whisper.

Tecnicamente es un transformer encoder-decoder de tipo `WhisperForConditionalGeneration` que convierte audio mono a 16 kHz en una representacion Mel de 128 bins y la procesa en ventanas de 30 segundos. El ajuste anade un token de idioma explicito (`<|afu|>`) que debe inyectarse en el prompt del decodificador para reproducir el comportamiento del artefacto exportado, tal y como detalla el autor en la model card.

Su relevancia es acotada pero clara: Whisper Large-v3 apenas cubre el awutu con calidad utilizable, y este tipo de ajustes por lengua de bajos recursos permite construir transcripcion, subtitulado o archivado de audio en comunidades linguisticas sin herramientas ASR propias. Los contrapesos son notables: cero descargas registradas, ausencia de licencia declarada, ausencia de cifras de WER o CER y un unico idioma soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WhisperForConditionalGeneration (transformer encoder-decoder) |
| Parametros totales | 1.543.491.840 (~1,55 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por pasada (Mel de 128 bins); el contexto de tokens no aplica en un modelo ASR |
| Tipos de cuantizacion | no especificados por el autor; el repositorio entrega pesos safetensors sin cuantizar |
| Idiomas soportados | awutu (ISO 639-3: `afu`); modelo monolingue |
| Licencia | no disponible (el autor remite a la documentacion del proyecto ELARSpeech y a la licencia del modelo base) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Large-v3 sin modificaciones estructurales: un encoder que consume espectrogramas Mel de 128 bins (frente a los 80 bins de large-v2) sobre ventanas de 30 segundos, y un decoder autorregresivo que genera la transcripcion condicionada por tokens especiales de tarea e idioma. El audio de entrada debe ser mono y remuestreado a 16 kHz. Este repositorio no es un entrenamiento desde cero, sino un ajuste fino supervisado del checkpoint `openai/whisper-large-v3` sobre datos de awutu; los hiperparametros, el volumen de horas de audio y la composicion exacta del corpus no se detallan en la informacion disponible.

El unico dato de validacion aportado es que el artefacto exportado se compara contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, con estado de verificacion por transcripcion exacta "PASS". No se documenta si hubo tecnicas adicionales de alineacion, aumentacion de datos o decodificacion especulativa. La innovacion reseñable es de integracion: el modelo incorpora un token de idioma `<|afu|>` que debe colocarse explicitamente en el prompt del decoder (`decoder_start_token_id`, `<|afu|>`, `<|transcribe|>`, `<|notimestamps|>`) en lugar de usar el parametro `language=`, ya que esa es la unica via documentada para reproducir el comportamiento de decodificacion del checkpoint exportado.

## Capacidades

- Transcripcion de voz a texto en awutu, con el token de idioma `<|afu|>` forzado en el prompt del decoder.
- Generacion de transcripciones sin marcas de tiempo cuando se usa `<|notimestamps|>` en el prompt.
- Procesamiento de audio largo mediante decodificacion secuencial o por trozos sobre ventanas de 30 segundos.
- Inferencia compatible con la libreria transformers y con la pipeline `automatic-speech-recognition`.
- Compatibilidad declarada con endpoints alojados (etiqueta `endpoints_compatible` en el repositorio).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni diarizacion de hablantes: es un modelo ASR puro de una sola tarea.
- Capacidad multilingue: no, es un modelo estrictamente monolingue en awutu.

## Casos de uso

- Transcripcion de archivos historicos de audio en awutu: digitalizacion y volcado a texto de grabaciones etnograficas o de archivo mediante decodificacion por trozos de 30 segundos, aprovechando que el modelo esta ajustado especificamente a esta lengua.
- Subtitulado de contenido audiovisual en awutu: generacion de subtitulos automaticos con `<|notimestamps|>` desactivado o activado segun se necesiten marcas temporales, partiendo de audio mono a 16 kHz.
- Investigacion linguistica de campo: transcripcion asistida de corpus orales para analisis fonologico, lexico o morfologico, reduciendo el coste de transcripcion manual por investigadores.
- Preservacion digital de lengua de bajos recursos: generacion de corpus textual alineado con audio que alimente futuros entrenamientos ASR o modelos de traduccion automatica.
- Herramientas de accesibilidad para hablantes de awutu: dictado y conversion de voz a texto en aplicaciones locales, siempre que se valide antes la calidad real sobre la poblacion objetivo.
- Indexacion y busqueda de archivos sonoros: transcripcion masiva de una fonoteca para permitir busqueda por texto sobre contenido hablado en awutu.
- Integracion en pipelines de ASR con `transformers`: el snippet de la model card se puede envolver en un servicio interno o en un endpoint de Hugging Face sin adaptaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara que el artefacto exportado se verifica contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, con resultado de verificacion por transcripcion exacta "PASS". No se aportan valores de WER, CER, MMLU ni de ninguna otra metrica estandar para ASR.

## Requisitos de hardware

- VRAM estimada en inferencia: en fp32 los pesos ocupan aproximadamente 6,2 GB (coincide con el tamano del repositorio); en fp16, unos 3,1 GB; con cuantizacion int8 o GGUF q8, en torno a 1,6-2 GB.
- En la practica, con fp16 y ventanas de 30 segundos, el consumo total con activaciones se situa de forma orientativa entre 4 y 6 GB, y crece con el tamano de lote y con el numero de haces de beam search (la model card usa `num_beams=1`).
- Cabe holgadamente en GPU de consumo: RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 6-8 GB es viable en fp16 con lotes pequenos o en cuantizacion int8.
- Para lotes grandes o despliegue concurrente se recomienda A100 (40/80 GB) o H100, donde el cuello de botella pasa a ser el preprocesado de audio y no la memoria.
- Opciones de despliegue: transformers con `WhisperForConditionalGeneration` y `WhisperProcessor` (ruta documentada por el autor), endpoints de Hugging Face (etiqueta `endpoints_compatible`), vLLM para Whisper si el checkpoint se adapta a su formato, y despliegues alternativos tipo CTranslate2/faster-whisper o whisper.cpp previa conversion de pesos (no documentada en el repositorio).
- Latencia y throughput: no disponible. No se publican mediciones de RTF (factor de tiempo real), latencia por segmento ni transcripciones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELARSpeech-Whisper-Large-v3-afu | 1,55 mil millones | ventana de 30 s, Mel de 128 bins | awutu (`afu`) | no disponible | Hugging Face, 0 descargas |
| openai/whisper-large-v3 | 1,55 mil millones | ventana de 30 s, Mel de 128 bins | multilingue (cerca de 100 idiomas) | Apache-2.0 | Hugging Face, ampliamente desplegado |
| openai/whisper-large-v3-turbo | 809 millones | ventana de 30 s | multilingue (subconjunto reducido) | Apache-2.0 | Hugging Face; version optimizada con menor degradacion de precision |
| openai/whisper-medium | 769 millones | ventana de 30 s, Mel de 80 bins | multilingue | Apache-2.0 | Hugging Face |

La comparacion es asimetrica: los tres modelos de OpenAI son genericos y multilingues, mientras que este ajuste es monolingue. Frente a ellos, la ventaja esperable es una mejor adecuacion al awutu, pero no hay cifras publicas de WER que lo cuantifiquen, y en cualquier caso el rendimiento en lenguas distintas del awutu no esta garantizado ni documentado.

## Limitaciones y advertencias

- Modelo monolingue: fuera del awutu la salida no es fiable y no se documenta comportamiento en otras lenguas.
- Sin licencia declarada: el campo de licencia aparece como "no disponible", por lo que el uso comercial queda en un limbo legal hasta que el autor lo aclare. El propio repositorio delega los terminos al proyecto ELARSpeech y a la licencia del modelo base.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible que no corresponde al audio, especialmente con silencios, ruido de fondo, musica o solapamiento de voces. Se recomienda decodificacion con umbrales de confianza y revision humana.
- Precision variable segun condiciones de grabacion, poblacion de hablantes, ortografia empleada y dominio, tal y como advierte el autor.
- Requisito tecnico estricto de preprocesado: audio mono a 16 kHz; no respetarlo degrada la transcripcion.
- Cobertura de evaluacion limitada: la unica validacion publicada es una comprobacion de transcripcion exacta contra el checkpoint original, no una evaluacion con WER/CER sobre un test set independiente y representativo.
- Adopcion nula: cero descargas y cero "likes" en el momento de redactar la ficha, sin senales de mantenimiento posterior por parte del autor.
- Sesgos potenciales derivados del corpus de ajuste: al no documentarse la composicion del dataset en awutu, se desconoce el equilibrio por genero, edad, region o variedad dialectal, lo que puede sesgar el rendimiento hacia el perfil de hablantes presente en los datos.
- En produccion conviene fijar el prompt del decoder exactamente como indica la model card; usar el parametro `language=` en lugar del token `<|afu|>` puede alterar el comportamiento respecto al artefacto validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-afu
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Anuncio de Whisper en OpenAI: https://openai.com/index/whisper/
- Busqueda de modelos Whisper en Hugging Face: https://huggingface.co/models?sort=downloads&search=whisper
- Ficha de Whisper large-v3 en Vast.ai (referencia de arquitectura y ventana de 30 s): https://vast.ai/model/whisper

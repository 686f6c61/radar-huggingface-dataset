# Sanghyang00/ELARSpeech-Whisper-Large-v3-anf

## Resumen

ELARSpeech-Whisper-Large-v3-anf es un modelo de reconocimiento automatico del habla (ASR) publicado por el usuario Sanghyang00 en HuggingFace, consistente en un ajuste fino de openai/whisper-large-v3 sobre el idioma animere (codigo ISO 639-3 `anf`). Forma parte de la familia de adaptaciones denominada ELARSpeech, orientada a llevar el pipeline de Whisper a lenguas de bajos recursos que no estan cubiertas por el entrenamiento multilingue original de OpenAI.

El modelo conserva la arquitectura completa de Whisper Large-v3 (`WhisperForConditionalGeneration`, transformer encoder-decoder) con 1.543.491.840 parametros reales declarados en los pesos safetensors, y anade un token de idioma especifico (`<|anf|>`) que debe inyectarse de forma explicita en el prompt del decodificador. El repositorio ocupa 6,2 GB y se distribuye unicamente en formato safetensors para la libreria transformers.

Su relevancia es doble: por un lado documenta una receta reproducible de adaptacion mono-idioma sobre Whisper Large-v3; por otro, cubre una lengua practicamente ausente de los sistemas ASR comerciales. El autor declara que el artefacto exportado ha superado una verificacion de transcripcion exacta contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, aunque no publica cifras de WER ni detalles del conjunto de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WhisperForConditionalGeneration (transformer encoder-decoder) |
| Parametros totales | 1.543.491.840 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (arquitectura Whisper); no disponible el detalle de configuracion |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se declaran variantes GGUF, int8 ni int4) |
| Idiomas soportados | animere (`anf`) |
| Licencia | no disponible en la model card; el modelo base openai/whisper-large-v3 se distribuye bajo licencia Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Large-v3 sin modificaciones estructurales: un encoder transformer que consume espectrogramas mel logaritmicos de 80 canales calculados sobre audio mono a 16 kHz, y un decoder autorregresivo con atencion cruzada sobre la salida del encoder. El modelo trabaja sobre ventanas de 30 segundos y emplea tokens especiales de control (`<|transcribe|>`, `<|notimestamps|>` y el token de idioma) para condicionar la decodificacion. El ajuste no introduce nuevos modulos: la adaptacion consiste en el reentrenamiento de los pesos existentes y la incorporacion del token `<|anf|>` en el vocabulario del tokenizer.

No se dispone de informacion publica sobre el volumen de datos de entrenamiento, la composicion del corpus, la duracion total de audio, ni sobre el uso de tecnicas de alineacion, RLHF o DPO (estas ultimas no son habituales en tareas ASR). Tampoco se documenta el esquema de aumentacion de datos ni si se aplico congelacion parcial de capas. La unica innovacion declarada es de tipo practico: un protocolo de decodificacion con prompt explicito que sustituye al parametro `language=` de la API de transformers, con el objetivo de reproducir el comportamiento exacto del checkpoint exportado. El autor indica que el artefacto fue validado contra el checkpoint ELARSpeech original sobre un conjunto fijo de muestras, con resultado PASS en verificacion de transcripcion exacta.

## Capacidades

- Transcripcion de voz a texto mono-idioma en animere (`anf`), con audio de entrada mono a 16 kHz.
- Decodificacion condicionada por token de idioma explicito (`<|anf|>`) inyectado en el prompt del decodificador.
- Decodificacion con `num_beams=1` (greedy) y sin marcas de tiempo (`<|notimestamps|>`), tal como recomienda el autor.
- Procesamiento por segmentos de hasta 30 segundos de audio, encadenables para audio de mayor duracion.
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No se declara capacidad multilingue; el modelo esta especializado en un unico idioma.
- No se declara soporte de vision, audio generativo, traduccion ni diarizacion de hablantes.
- No se documenta un modo de razonamiento explicito (thinking mode) ni ninguna capacidad especial adicional.

## Casos de uso

- Transcripcion de archivos de audio en animere: el modelo convierte grabaciones a texto plano en castellano tecnico de salida (el texto resultante en animere), adecuado para llevar registros orales a formato escrito digital.
- Archivado y documentacion linguistica: investigadores pueden transcribir corpus de habla en animere para construir bases de datos textuales anotadas, un paso previo imprescindible para estudios fonologicos, morfologicos y lexicograficos.
- Generacion de subtitulos para contenido audiovisual en animere: integrado en un pipeline de extraccion de audio y segmentacion previa en bloques de 30 segundos, permite producir subtitulos automaticos para video divulgativo o educativo.
- Preservacion de lenguas de bajos recursos: al ser un ajuste especifico sobre Whisper Large-v3, sirve como punto de partida para nuevas iteraciones sobre variantes dialectales o para la creacion de corpus paralelos.
- Accesibilidad en servicios publicos: transcripcion de consultas o declaraciones orales de hablantes de animere en entornos administrativos o sanitarios donde no existe personal que cubra ese idioma.
- Indexacion y busqueda de audio: transcripcion por lotes de un repositorio de grabaciones para permitir busqueda por texto completo sobre el contenido hablado.
- Investigacion en ASR de bajos recursos: sirve como referencia comparativa para medir el impacto de tecnicas de adaptacion (fine-tuning completo frente a LoRA, por ejemplo) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara una verificacion de transcripcion exacta con estado PASS sobre un conjunto fijo de evaluacion, sin especificar tamano del conjunto, condiciones acusticas ni metricas cuantitativas (WER, CER). Por tanto, no se puede presentar ninguna tabla comparativa de MMLU, HumanEval, GSM8K, LibriSpeech ni similares, ya que no aplican a un modelo ASR y no hay datos publicados.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3,1 GB solo para pesos, con un consumo real tipico de 4-8 GB segun tamano de lote y longitud de secuencia (estimacion a partir del numero de parametros, no facilitada por el autor).
- VRAM estimada en int8: en torno a 1,6-2 GB de pesos, mas activaciones y memoria del runtime.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM. Una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 ejecutan el modelo con holgura. Para despliegue por lotes a escala, A100 de 40/80 GB o H100 permiten lotes mayores y mayor throughput.
- Cabe en GPU de consumo: si. Tambien es viable en CPU (inferencia lenta) y en Apple Silicon mediante Metal, aunque el autor no documenta estos escenarios.
- Opciones de despliegue: transformers es la via soportada explicitamente por el autor (codigo de ejemplo con `WhisperForConditionalGeneration` y `WhisperProcessor`). No se declaran integraciones probadas con vLLM, TGI, llama.cpp, Ollama ni faster-whisper; la ausencia de pesos GGUF o CTranslate2 en el repositorio limita estas alternativas sin conversion previa.
- Latencia y throughput: no disponibles. No se publican mediciones de RTF (real-time factor), latencia por segmento ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sanghyang00/ELARSpeech-Whisper-Large-v3-anf | 1.543.491.840 | animere (`anf`) | 30 s por segmento | no disponible en la model card | safetensors, transformers |
| openai/whisper-large-v3 | 1.550 M aprox. | multilingue (99 idiomas aprox.) | 30 s por segmento | Apache-2.0 | safetensors, transformers, multiples runtimes |
| openai/whisper-large-v2 | 1.550 M aprox. | multilingue | 30 s por segmento | Apache-2.0 | safetensors, transformers |
| distil-whisper-large-v3 | 756 M aprox. | multilingue (subconjunto) | 30 s por segmento | Apache-2.0 o MIT segun variante | safetensors, transformers |

Los datos de parametros y contexto de los modelos comparados son valores de referencia de la familia Whisper y pueden variar ligeramente respecto a la version exacta publicada. No se dispone de cifras de WER para ninguno de ellos en la informacion proporcionada, por lo que la comparacion se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Modelo mono-idioma: unicamente reconoce animere (`anf`). No debe esperarse un comportamiento correcto con audio en castellano, ingles u otras lenguas.
- Ausencia de metricas de calidad: no se publican valores de WER ni CER, ni el tamano o la composicion del conjunto de evaluacion fijo usado en la verificacion PASS. El rendimiento real en produccion es desconocido.
- Sin datos de entrenamiento publicos: se desconoce el corpus, su duracion, su procedencia y sus condiciones de licencia, lo que impide evaluar riesgos de sesgo, cobertura dialectal o contaminacion.
- Licencia no declarada: la model card no especifica licencia para el modelo ajustado. El modelo base es Apache-2.0, pero el autor remite a la documentacion del proyecto ELARSpeech para los terminos del conjunto de datos. Antes de un uso comercial es imprescindible aclarar ambos extremos.
- Riesgo de alucinacion tipico de Whisper: en segmentos con silencio, ruido de fondo o habla solapada, los modelos de esta familia pueden generar texto plausible no presente en el audio.
- Sensibilidad a las condiciones de grabacion: el propio autor advierte que la precision varia segun condiciones acusticas, poblacion de hablantes, ortografia y dominio.
- Preprocesado obligatorio: el audio debe ser mono y remuestreado a 16 kHz. Entradas estereo o con otra frecuencia de muestreo degradan el resultado.
- Protocolo de decodificacion no estandar: el autor recomienda inyectar el prompt del decodificador manualmente en lugar de usar el parametro `language=`, lo que anade complejidad a la integracion y puede romper abstracciones de alto nivel.
- Limite de 30 segundos por segmento: audios mas largos requieren segmentacion y ensamblado externos, con riesgo de cortes en fronteras de palabra.
- Marcas de tiempo desactivadas en el prompt recomendado (`<|notimestamps|>`), lo que complica la alineacion temporal necesaria para subtitulado fino.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el modelo de forma independiente.
- Los resultados de la busqueda web proporcionada no contienen informacion tecnica relevante sobre este modelo ni sobre el idioma animere; los enlaces devueltos son contenido no relacionado y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-anf
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Documentacion del proyecto ELARSpeech: referenciada en la model card sin URL publica; no disponible
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada

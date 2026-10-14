# hf-audio/MOSS-Transcribe-Diarize-HF

## Resumen

MOSS-Transcribe-Diarize 0.9B es un modelo de comprensión de audio extremo a extremo disenado para transcribir y diarizar grabaciones largas con multiples hablantes en una sola pasada. Lo publica el equipo OpenMOSS (el repositorio consultado aparece bajo la organizacion hf-audio) y combina en un unico modelo dos tareas que tradicionalmente se resuelven con pipelines separados: reconocimiento automatico del habla (ASR) y diarizacion de hablantes, anadiendo marcas de tiempo y etiquetas anonimas de hablante (`[S01]`, `[S02]`, etc.).

El modelo tiene 908.513.280 parametros (aproximadamente 0.9B), se distribuye en formato safetensors con licencia Apache 2.0 y requiere `trust_remote_code=True` para cargarse en Transformers. Segun la model card, soporta mas de 50 idiomas, inferencia en una sola pasada sobre audio de hasta 90 minutos y generacion condicionada por prompt, incluyendo hotwords para terminologia especifica de dominio y anotacion de eventos acusticos.

Su relevancia actual radica en la integracion de transcripcion y diarizacion en un solo paso con un modelo de menos de mil millones de parametros, lo que abarata el despliegue frente a soluciones compuestas. Ademas, gano el primer puesto en el 2nd MLC-SLM Challenge en INTERSPEECH 2026, con evaluacion en 14 idiomas (ingles, frances, aleman, italiano, portugues, espanol, japones, coreano, ruso, thai, vietnamita, tagalo, urdu y turco).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de comprension de audio extremo a extremo (el detalle arquitectonico no se especifica en la informacion disponible; la model card remite a un diagrama) |
| Parametros totales | 908.513.280 (aproximadamente 0.9B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en tokens; soporta inferencia en una sola pasada sobre audio de hasta 90 minutos |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors sin variantes GGUF/AWQ/GPTQ declaradas) |
| Idiomas soportados | 50+ idiomas segun la model card; idiomas declarados en el repositorio: en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers, con codigo remoto personalizado) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna mas alla de describirla como un modelo de comprension de audio extremo a extremo con el que se realiza transcripcion y diarizacion conjuntas en una sola pasada. La model card incluye un diagrama (`Model_Architecture.png`) como unica referencia visual, pero no se aportan datos sobre el tipo de encoder acustico, el decodificador de texto, el mecanismo de atencion ni la estrategia de fusion multimodal. El repositorio de HuggingFace incluye codigo remoto personalizado de Transformers necesario para cargar el modelo con `trust_remote_code=True`, lo que indica que la implementacion depende de clases propias no integradas en la libreria estandar.

Tampoco se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineamiento como RLHF o DPO. La unica referencia a datos empiricos de entrenamiento y evaluacion es el articulo arXiv:2601.01554, citado en la model card, junto con la victoria en el 2nd MLC-SLM Challenge (INTERSPEECH 2026), que abarca 14 idiomas.

## Capacidades

- Transcripcion de audio largo: convierte grabaciones de audio o video de hasta 90 minutos en texto con marcas de tiempo en una sola pasada.
- Diarizacion integrada: asigna etiquetas anonimas de hablante (`[S01]`, `[S02]`, etc.) sin necesidad de un pipeline de diarizacion independiente.
- Generacion condicionada por prompt: admite instrucciones de transcripcion personalizadas y hotwords para vocabulario especifico de dominio.
- Anotacion de eventos acusticos: puede emitir anotaciones de eventos sonoros mas alla del habla, enriqueciendo la transcripcion para sistemas posteriores.
- Multilingue: cobertura declarada de mas de 50 idiomas (con `en` y `zh` explicitos en los metadatos del repositorio).
- Soporte multimodal de entrada audio-texto: pipeline `audio-text-to-text`.
- Salida estructurada: transcripcion compacta con etiquetas de hablante y alineacion temporal, adecuada para consumo automatico posterior.
- No se menciona en la informacion disponible soporte de tool calling, function calling ni razonamiento multi-paso basado en agentes.

## Casos de uso

- Transcripcion de reuniones corporativas: el modelo procesa la reunion completa en una sola pasada de hasta 90 minutos y devuelve texto con marcas de tiempo y etiquetas de hablante, lo que permite generar actas con atribucion de intervenciones sin ensamblar un sistema ASR y otro de diarizacion por separado.
- Subtitulado de video y cine: la capacidad de diarizacion y timestamping facilita la generacion de subtitulos con identificacion de interlocutor; la model card menciona explicitamente evaluacion en el dominio de peliculas y una Web UI de subtitulos en chino simplificado e ingles.
- Analisis de podcasts e interviews: permite indexar episodios largos por hablante y tramo temporal, habilitando busqueda por fragmentos y resumentes posteriores con atribucion correcta de citas.
- Documentacion clinica o legal dictada en consultas con varios interlocutores: los hotwords permiten forzar terminologia especializada y la diarizacion distingue profesional y paciente/cliente en la transcripcion resultante.
- Analitica de centros de llamadas: transcripcion con separacion de agente y cliente y marcas temporales para medir tiempos de habla, turnos y silencios, alimentando cuadros de mando de calidad.
- Investigacion cualitativa y transcripcion de grupos focales: la asignacion automatica de hablantes anonimos reduce el trabajo manual de etiquetado previo al analisis tematico.
- Accesibilidad y documentacion de clases o conferencias: la transcripcion de audio largo con timestamps permite generar apuntes navegables y subtitulos para material academico grabado.
- Enriquecimiento de archivos audiovisuales: la anotacion de eventos acusticos anade capas de metadatos (ademas del habla) utiles para catalogacion y busqueda en mediatecas.

## Benchmarks y rendimiento

La model card reporta evaluacion con tres metricas objetivas: Character Error Rate (CER), concatenated minimum-permutation Character Error Rate (cpCER) y Delta-cp. En todas ellas, menor es mejor. Los conjuntos de evaluacion son AISHELL-4, Alimeeting, Podcast y Movies. En la informacion proporcionada, la fila correspondiente a MOSS-Transcribe-Diarize 0.9B aparece truncada, por lo que no se dispone de sus valores numericos y no se reproducen aqui.

| Modelo | AISHELL-4 CER | AISHELL-4 cpCER | AISHELL-4 d-cp | Alimeeting CER | Alimeeting cpCER | Alimeeting d-cp | Podcast CER | Podcast cpCER | Podcast d-cp | Movies CER | Movies cpCER | Movies d-cp |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Doubao | 18.18 | 27.86 | 9.68 | 25.25 | 37.57 | 12.31 | 7.93 | 10.54 | 2.61 | 9.94 | 30.88 | 20.94 |
| ElevenLabs | 19.58 | 37.95 | 18.36 | 25.70 | 36.69 | 10.99 | 8.50 | 11.34 | 2.85 | 11.49 | 17.85 | 6.37 |
| GPT-4o | - | - | - | - | - | - | - | - | - | 14.37 | 23.67 | 9.31 |
| Gemini 2.5 Pro | 42.70 | 53.42 | 10.72 | 27.43 | 41.64 | 14.21 | 7.38 | 10.23 | 2.85 | 15.46 | 24.15 | 8.69 |
| Gemini 3 Pro | 22.75 | 27.43 | 4.68 | 26.75 | 32.84 | 6.09 | - | - | - | 8.62 | 14.73 | 6.11 |
| VIBEVOICE ASR | 21.40 | 24.99 | 3.59 | 27.40 | 29.33 | 1.93 | 27.94 | 48.30 | 20.36 | 14.59 | 42.54 | 27.94 |
| MOSS-Transcribe-Diarize 0.9B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

El guion (`-`) indica, segun la propia model card, que el resultado no esta disponible para ese modelo en ese conjunto. No se han publicado en la informacion disponible resultados en benchmarks genericos tipo MMLU, HumanEval o GSM8K, que por otro lado no son aplicables a un modelo de transcripcion de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 908,5 millones de parametros, en precision de 16 bits la carga de pesos ocupa aproximadamente 1,8 GB; en 8 bits alrededor de 0,9 GB; en 4 bits alrededor de 0,5 GB. A estas cifras hay que sumar el espacio de activaciones y el buffer de audio, especialmente en inferencia sobre audio largo de hasta 90 minutos.
- GPU recomendadas: no se especifica en la informacion proporcionada. Por tamano, cualquier GPU con al menos 4-8 GB de VRAM deberia poder alojar los pesos, pero el consumo real durante inferencia de audio largo no esta documentado.
- Compatibilidad con GPU de consumo: previsiblemente cabe en GPU de consumo tipo RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB), aunque esto es una estimacion basada en el numero de parametros y no un dato publicado en la informacion disponible.
- Opciones de despliegue: la model card menciona explicitamente el servicio con vLLM y SGLang, ademas del uso en Python con Transformers (`trust_remote_code=True`). Tambien se menciona una Web App de subtitulos. No se indica soporte de llama.cpp u Ollama, coherente con la ausencia de pesos GGUF declarados.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Requisito adicional: el repositorio incluye codigo remoto personalizado, por lo que es necesario `trust_remote_code=True` y auditar dicho codigo antes de ejecutarlo en entornos de produccion.

## Comparativa con modelos similares

La model card situa al modelo frente a servicios propietarios de transcripcion y diarizacion, para los que no se publican parametros, contexto ni licencia. La comparativa se limita por tanto a lo que si aparece en los metadatos disponibles.

| Modelo | Parametros | Longitud de audio | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| MOSS-Transcribe-Diarize 0.9B | 908.513.280 | hasta 90 minutos en una pasada | Apache 2.0 | pesos abiertos en HuggingFace | fila de benchmarks no disponible en la informacion proporcionada |
| Doubao | no disponible | no disponible | propietaria | servicio | CER/cpCER/d-cp en AISHELL-4, Alimeeting, Podcast y Movies (ver tabla anterior) |
| ElevenLabs | no disponible | no disponible | propietaria | servicio | CER/cpCER/d-cp en AISHELL-4, Alimeeting, Podcast y Movies (ver tabla anterior) |
| GPT-4o | no disponible | no disponible | propietaria | API | solo resultados en Movies (parcial) |
| Gemini 2.5 Pro / Gemini 3 Pro | no disponible | no disponible | propietaria | API | resultados parciales en los mismos conjuntos |
| VIBEVOICE ASR | no disponible | no disponible | no disponible | no disponible | CER/cpCER/d-cp en AISHELL-4, Alimeeting, Podcast y Movies (ver tabla anterior) |

No se dispone de datos en la informacion proporcionada para comparar con alternativas abiertas de referencia como Whisper, Parakeet o similares.

## Limitaciones y advertencias

- La fila de resultados de MOSS-Transcribe-Diarize 0.9B en la tabla de evaluacion no esta disponible en la informacion facilitada, por lo que no es posible verificar su rendimiento numerico frente a los modelos comparados.
- No se documentan en la informacion disponible los datos de entrenamiento, la composicion del dataset ni los procesos de alineamiento, lo que dificulta evaluar sesgos de dominio, acento o idioma.
- La diarizacion produce etiquetas anonimas (`[S01]`, `[S02]`), no identidades reales de hablante; cualquier mapeo a personas concretas debe hacerse en una capa posterior y con las garantias legales correspondientes.
- Aunque se declaran mas de 50 idiomas, los metadatos del repositorio solo listan `en` y `zh` como idiomas soportados, de modo que la cobertura real del resto de idiomas, incluido el espanol, no esta cuantificada en la informacion proporcionada.
- Riesgo de alucinacion en segmentos con ruido, solapamiento de voces o audio de baja calidad: como en cualquier modelo generativo de transcripcion, la salida puede contener texto no presente en el audio, especialmente en tramos ambiguos.
- Requiere `trust_remote_code=True` y ejecucion de codigo personalizado del repositorio, lo que introduce un riesgo de seguridad en despliegues de produccion si no se audita el codigo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion todavia muy limitada y menos validacion independiente por parte de la comunidad.
- No se declaran variantes cuantizadas oficiales (GGUF, AWQ, GPTQ), lo que limita las opciones de despliegue en hardware modesto sin conversion manual.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los pesos originales publicados por OpenMOSS-Team y las dependencias del codigo remoto.
- Las fechas del repositorio (creado y actualizado en octubre de 2026) y las noticias de la model card (julio de 2026) son las reportadas en la informacion facilitada.

## Enlaces

- Repositorio en HuggingFace (hf-audio): https://huggingface.co/hf-audio/MOSS-Transcribe-Diarize-HF
- Repositorio original en HuggingFace (OpenMOSS-Team): https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-Transcribe-Diarize
- Articulo arXiv: https://arxiv.org/abs/2601.01554
- 2nd MLC-SLM Challenge (INTERSPEECH 2026): https://www.nexdata.ai/competition/mlc-slm

# itazap/MOSS-Transcribe-Diarize-HF

## Resumen

MOSS-Transcribe-Diarize 0.9B es un modelo de comprension de audio de extremo a extremo desarrollado por OpenMOSS (repositorio espejo publicado por el usuario itazap en Hugging Face). Resuelve un problema clasico de los pipelines de transcripcion: en lugar de encadenar un sistema ASR y un sistema de diarizacion independientes, el modelo realiza ambas tareas de forma conjunta en una sola pasada, generando transcripciones con marcas de tiempo y etiquetas anonimas de hablante (`[S01]`, `[S02]`, etc.) coherentes a lo largo de toda la grabacion.

Con 908.513.280 parametros (aproximadamente 0,9B) y un repositorio de 5,5 GB, esta pensado para audio de formato largo y con multiples hablantes: reuniones, llamadas, podcasts, entrevistas, clases y videos. La model card declara soporte de transcripcion y diarizacion en mas de 50 idiomas, inferencia en una sola pasada sobre grabaciones de hasta 90 minutos y prompting con hotwords para vocabulario especifico de dominio.

Su relevancia actual viene respaldada por el primer puesto en el 2nd MLC-SLM Challenge de INTERSPEECH 2026, que abarco 14 idiomas, y por una licencia Apache 2.0 que permite uso comercial. El modelo se distribuye con codigo remoto personalizado para `transformers` (requiere `trust_remote_code=True`) y declara compatibilidad con vLLM y SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal audio-texto con codigo remoto personalizado (`moss_transcribe_diarize`); diagrama de arquitectura publicado en la model card, sin detalle de capas ni atencion en la informacion disponible |
| Parametros totales | 908.513.280 (aprox. 0,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como numero de tokens; la model card indica inferencia en una sola pasada sobre audio de hasta 90 minutos |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | etiquetas de la model card: en, zh; la model card declara transcripcion y diarizacion en mas de 50 idiomas y el MLC-SLM Challenge cubrio 14 (ingles, frances, aleman, italiano, portugues, espanol, japones, coreano, ruso, tailandes, vietnamita, tagalo, urdu y turco) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo multimodal audio-texto de tipo `audio-text-to-text` con codigo remoto propio, integrado en `transformers`. La model card incluye un diagrama de arquitectura (`Model_Architecture.png`) pero no especifica el numero de capas, la dimension oculta, el tipo de encoder de audio ni el mecanismo de atencion. El planteamiento funcional es el de un modelo unico que fusiona transcripcion y diarizacion en la misma secuencia de salida, en lugar de un pipeline en cascada ASR + diarizacion.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Lo que si se documenta es la capacidad de generacion condicionada por prompt (instrucciones de transcripcion personalizadas, hotwords y anotaciones de eventos acusticos), lo que sugiere un entrenamiento orientado a instrucciones sobre tareas de audio.

## Capacidades

- Transcripcion de audio de formato largo con marcas de tiempo, en una sola pasada sobre grabaciones de hasta 90 minutos.
- Diarizacion de hablantes integrada, con etiquetas anonimas consistentes (`[S01]`, `[S02]`, etc.) sin pipeline separado.
- Salida estructurada de transcripcion consciente del hablante, con texto alineado temporalmente.
- Prompting personalizable: instrucciones de transcripcion, hotwords para terminos especificos de dominio y anotaciones de eventos acusticos.
- Procesamiento de audio y video como entrada.
- Capacidades multilingues: etiquetas en ingles y chino, con declaracion de mas de 50 idiomas y evaluacion en 14 idiomas en el MLC-SLM Challenge.
- Integracion con `transformers` mediante codigo remoto y despliegue declarado con vLLM y SGLang.
- Interfaz web de subtitulos incluida en el proyecto, con soporte de chino simplificado e ingles.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso basado en agentes.

## Casos de uso

- Transcripcion de reuniones de empresa: el modelo procesa la grabacion completa en una sola pasada y devuelve texto con marcas de tiempo y etiquetas de hablante, lo que permite generar actas y atribuir intervenciones sin montar un pipeline ASR + diarizacion por separado.
- Subtitulado de videos y podcasts: la salida con timestamps y hablantes se puede convertir directamente en subtitulos; la interfaz web de subtitulos incluida facilita la revision manual en chino e ingles.
- Analisis de llamadas de atencion al cliente: la diarizacion integrada distingue agente y cliente, y las marcas de tiempo permiten localizar fragmentos concretos para control de calidad o cumplimiento normativo.
- Documentacion de entrevistas y periodismo: con contexto de hasta 90 minutos por pasada, una entrevista larga se transcribe sin fragmentar el audio, manteniendo la coherencia de las etiquetas de hablante de principio a fin.
- Accesibilidad en clases y conferencias: transcripcion de grabaciones docentes con identificacion de ponente y alumnos, util para generar apuntes buscables y subtitulos.
- Procesamiento de archivos audiovisuales en produccion: al ser Apache 2.0 y disponer de despliegue con vLLM y SGLang, puede integrarse en pipelines de ingestión de medios para indexar y buscar contenido por hablante y tiempo.
- Dominios con jerga especifica (medico, legal, tecnico): el prompting con hotwords permite mejorar el reconocimiento de terminos especializados sin reentrenar el modelo.

## Benchmarks y rendimiento

La model card publica resultados en CER (Character Error Rate), cpCER (concatenated minimum-permutation CER) y Delta-cp; en las tres metricas, menor es mejor. Se comparan con Doubao, ElevenLabs, GPT-4o, Gemini 2.5 Pro, Gemini 3 Pro y VIBEVOICE ASR sobre AISHELL-4, Alimeeting, Podcast y Movies. Un guion indica resultado no disponible.

| Modelo | AISHELL-4 CER / cpCER / Δcp | Alimeeting CER / cpCER / Δcp | Podcast CER / cpCER / Δcp | Movies CER / cpCER / Δcp |
|---|---|---|---|---|
| Doubao | 18,18 / 27,86 / 9,68 | 25,25 / 37,57 / 12,31 | 7,93 / 10,54 / 2,61 | 9,94 / 30,88 / 20,94 |
| ElevenLabs | 19,58 / 37,95 / 18,36 | 25,70 / 36,69 / 10,99 | 8,50 / 11,34 / 2,85 | 11,49 / 17,85 / 6,37 |
| GPT-4o | - / - / - | - / - / - | - / - / - | 14,37 / 23,67 / 9,31 |
| Gemini 2.5 Pro | 42,70 / 53,42 / 10,72 | 27,43 / 41,64 / 14,21 | 7,38 / 10,23 / 2,85 | 15,46 / 24,15 / 8,69 |
| Gemini 3 Pro | 22,75 / 27,43 / 4,68 | 26,75 / 32,84 / 6,09 | - / - / - | 8,62 / 14,73 / 6,11 |
| VIBEVOICE ASR | 21,40 / 24,99 / 3,59 | 27,40 / 29,33 / 1,93 | 27,94 / 48,30 / 20,36 | 14,59 / 42,54 / 27,94 |
| MOSS Transcribe Diarize 0.9B | no disponible en la informacion proporcionada (fila truncada) | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible los valores de la fila correspondiente a MOSS Transcribe Diarize 0.9B, ya que el contenido de la model card aparece truncado en ese punto. Tampoco se incluyen resultados de benchmarks de texto como MMLU, HumanEval o GSM8K, que no aplican directamente a este modelo de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, 908.513.280 parametros en FP16 suponen aproximadamente 1,8 GB solo de pesos; en BF16/FP16 el modelo completo con overhead de activaciones y encoder de audio deberia situarse en un rango de pocos GB, pero no se confirma en la informacion disponible.
- El repositorio ocupa 5,5 GB, lo que incluye pesos y artefactos adicionales; conviene verificar el peso efectivo de los safetensors antes de dimensionar el despliegue.
- GPU recomendadas: no especificadas en la model card. Por tamano, el modelo es candidato a ejecutarse en GPU de consumo (RTX 3090, RTX 4090) y en GPU de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU de consumo: probable por numero de parametros, aunque no confirmado oficialmente; la limitacion practica puede venir de la longitud de audio (hasta 90 minutos) y del coste de atencion sobre secuencias largas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, vLLM y SGLang (declarados en la model card); no se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Transcribe-Diarize 0.9B | 908.513.280 | hasta 90 min en una pasada | ASR + diarizacion conjunto, end-to-end | Apache 2.0 | Hugging Face, GitHub, vLLM, SGLang |
| VIBEVOICE ASR | no disponible | no disponible | ASR (evaluado en la model card) | no disponible | no disponible |
| Gemini 3 Pro | no disponible (propietario) | no disponible | modelo multimodal propietario | propietaria | API de Google |
| GPT-4o | no disponible (propietario) | no disponible | modelo multimodal propietario | propietaria | API de OpenAI |
| ElevenLabs | no disponible (propietario) | no disponible | servicio de audio propietario | propietaria | API de ElevenLabs |

En las metricas publicadas, MOSS-Transcribe-Diarize 0.9B compite con servicios propietarios mucho mayores en tareas de transcripcion con diarizacion. La ventaja estructural del modelo es su tamano reducido y licencia Apache 2.0, que permite despliegue local y modificacion; la desventaja es la ausencia de resultados publicados en la informacion disponible para comparar directamente sus cifras.

## Limitaciones y advertencias

- La fila de resultados del propio modelo en la tabla de evaluacion aparece truncada en la informacion disponible, por lo que no se pueden verificar sus metricas CER, cpCER y Delta-cp.
- Las etiquetas de idioma del repositorio solo declaran ingles y chino, aunque la model card afirma soporte de mas de 50 idiomas; la cobertura real por idioma no esta cuantificada.
- La diarizacion produce etiquetas anonimas (`[S01]`, `[S02]`); no identifica personas por nombre ni resuelve identidad entre grabaciones distintas.
- Riesgo de alucinacion y de errores en audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento; no se documentan tasas de error fuera de los conjuntos de evaluacion citados.
- No se detallan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar sesgos linguisticos o demograficos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar el codigo antes de usarlo en produccion.
- No se documentan variantes cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con poca VRAM sin trabajo adicional de conversion.
- No se documenta soporte de tool calling ni de agentes; el modelo esta orientado a transcripcion y diarizacion, no a razonamiento general.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificarse contra los terminos del proyecto original en GitHub y las dependencias del codigo remoto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itazap/MOSS-Transcribe-Diarize-HF
- Modelo original en Hugging Face (OpenMOSS): https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-Transcribe-Diarize
- Paper en arXiv: https://arxiv.org/abs/2601.01554
- 2nd MLC-SLM Challenge (INTERSPEECH 2026): https://www.nexdata.ai/competition/mlc-slm

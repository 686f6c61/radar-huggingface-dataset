# Jinstudio/MOSS-Transcribe-Diarize

## Resumen

MOSS-Transcribe-Diarize 0.9B es un modelo de comprensión de audio de extremo a extremo desarrollado por OpenMOSS, distribuido en HuggingFace bajo el identificador oficial `OpenMOSS-Team/MOSS-Transcribe-Diarize` (la ficha que aquí se documenta, `Jinstudio/MOSS-Transcribe-Diarize`, es un espejo del mismo). Resuelve un problema clásico de los pipelines de voz: la transcripción con atribución de hablante suele requerir dos sistemas encadenados (un ASR y un motor de diarización) más una fase de alineado temporal. Este modelo unifica ambas tareas en una sola pasada y emite un transcript compacto con marcas de tiempo y etiquetas anónimas de hablante del tipo `[S01]`, `[S02]`.

El modelo tiene 908.513.280 parámetros (0,9B) y se distribuye en safetensors con código remoto propio para `transformers`, por lo que requiere `trust_remote_code=True`. Está orientado a audio multicanal y de habla múltiple de formato largo: la model card declara inferencia en una sola pasada sobre grabaciones de hasta 90 minutos, soporte de más de 50 idiomas según el autor y prompting con hotwords para vocabulario de dominio.

Su relevancia reciente es doble: por un lado ganó el primer puesto en el 2nd MLC-SLM Challenge de INTERSPEECH 2026, evaluado en 14 idiomas (inglés, francés, alemán, italiano, portugués, español, japonés, coreano, ruso, tailandés, vietnamita, tagalo, urdu y turco); por otro, su tamaño contenido (0,9B) y su licencia Apache 2.0 lo sitúan como alternativa autoalojable frente a APIs propietarias de transcripción, con servicio documentado en vLLM y SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo transformer multimodal audio-texto de extremo a extremo con codigo remoto propio (`moss_transcribe_diarize`); el detalle interno de capas y atencion no se documenta en la informacion disponible |
| Parametros totales | 908.513.280 (0,9B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible como numero de tokens; la model card declara inferencia en una sola pasada sobre audio de hasta 90 minutos |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors (sin GGUF, AWQ ni GPTQ documentados) |
| Idiomas soportados | Metadatos de HuggingFace: en, zh. La model card declara transcripcion y diarizacion en mas de 50 idiomas; el MLC-SLM Challenge cubre 14 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 1,8 GB) |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un sistema end-to-end de comprension de audio que realiza conjuntamente transcripcion de voz y diarizacion de hablantes en una unica pasada, en lugar de encadenar un ASR y un diarizador independientes. El repositorio incluye codigo remoto de Transformers necesario para cargar el modelo, lo que implica que la arquitectura no es una clase estandar de la libreria. No se detallan en la informacion proporcionada el numero de capas, el tipo de encoder de audio, la estrategia de atencion ni la composicion exacta del corpus de entrenamiento.

Tampoco se documentan el volumen de tokens de audio utilizados, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Lo que si se declara es la existencia de generacion condicionada por prompt: el modelo acepta instrucciones de transcripcion personalizadas, listas de hotwords para terminos especificos de dominio y anotaciones de eventos acusticos, lo que sugiere un entrenamiento orientado a seguimiento de instrucciones sobre tareas de audio. La evaluacion publicada se limita a metricas objetivas de ASR y diarizacion (CER, cpCER y Delta-cp) sobre AISHELL-4, Alimeeting, Podcast y Movies.

## Capacidades

- Transcripcion de formato largo: convierte audio o video en texto con marcas de tiempo, en una sola pasada para grabaciones de hasta 90 minutos.
- Diarizacion integrada: asigna etiquetas anonimas de hablante (`[S01]`, `[S02]`, y sucesivas) sin pipeline separado de diarizacion.
- Salida alineada temporalmente: el transcript combina texto, timestamps y etiqueta de hablante de forma consistente a lo largo del documento.
- Prompting de generacion: acepta instrucciones de transcripcion personalizadas y hotwords para vocabulario especifico (terminologia medica, legal, nombres propios, jerga interna).
- Anotacion de eventos acusticos: puede emitir anotaciones sobre eventos sonoros presentes en la grabacion, segun la model card.
- Capacidad multilingue: mas de 50 idiomas declarados por el autor; los metadatos de la ficha solo listan ingles y chino. El modelo gano el 2nd MLC-SLM Challenge en 14 idiomas, espanol incluido.
- Entrada multimodal audio-texto: pipeline `audio-text-to-text`, admite ficheros de audio y de video como entrada.
- Servicio en produccion: compatible con vLLM y SGLang, y con una interfaz web de subtitulos incluida en el proyecto (con soporte de chino simplificado e ingles desde el 22 de julio de 2026).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito, vision o audio generation: no disponible.

## Casos de uso

- Actas de reuniones de empresa: el modelo procesa la reunion completa en una sola pasada y devuelve el texto con marcas de tiempo y hablantes `[S01]`, `[S02]`, de modo que un sistema posterior puede resumir por participante o extraer action items sin necesidad de un motor de diarizacion adicional.
- Subtitulado de video y podcasts: con la interfaz web de subtitulos incluida en el repositorio, se puede generar un fichero de subtitulos con timestamps directamente desde el video; el soporte de ingles y chino en la UI cubre los dos idiomas principales de los metadatos.
- Analisis de calidad en centros de llamadas: transcribir y separar agente y cliente permite calcular tiempos de habla, detectar solapamientos e incumplimientos de guion; el prompting con hotwords ayuda con nombres de producto y codigos internos.
- Documentacion clinica o de investigacion cualitativa: entrevistas largas transcritas con separacion entrevistador/entrevistado y marcas temporales, utiles para codificacion posterior; los hotwords permiten fijar terminologia clinica concreta.
- Accesibilidad en aulas y universidades: clases o seminarios de hasta 90 minutos se convierten en apuntes con atribucion de hablante, lo que facilita distinguir docente de alumnado en las preguntas.
- Enriquecimiento de archivos audiovisuales: la anotacion de eventos acusticos permite indexar no solo lo que se dice, sino lo que ocurre en la grabacion, util en catalogacion de fondos de video o analisis de contenido.
- Despliegue autoalojado en pipelines internos: al servirse con vLLM o SGLang y tener licencia Apache 2.0, se puede integrar en un flujo batch de transcripcion masiva sin enviar el audio a APIs de terceros, algo critico con material sujeto a confidencialidad.

## Benchmarks y rendimiento

La evaluacion publicada usa tres metricas objetivas: Character Error Rate (CER), concatenated minimum-permutation Character Error Rate (cpCER) y Delta-cp; en las tres, menor es mejor. Los conjuntos son AISHELL-4, Alimeeting, Podcast y Movies. En la informacion proporcionada, la fila correspondiente a MOSS Transcribe Diarize 0.9B aparece truncada, por lo que sus valores numericos no estan disponibles; se reproducen a continuacion unicamente los de los sistemas comparados.

| Modelo | AISHELL-4 CER | AISHELL-4 cpCER | AISHELL-4 d-cp | Alimeeting CER | Alimeeting cpCER | Alimeeting d-cp | Podcast CER | Podcast cpCER | Podcast d-cp | Movies CER | Movies cpCER | Movies d-cp |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Doubao | 18,18 | 27,86 | 9,68 | 25,25 | 37,57 | 12,31 | 7,93 | 10,54 | 2,61 | 9,94 | 30,88 | 20,94 |
| ElevenLabs | 19,58 | 37,95 | 18,36 | 25,70 | 36,69 | 10,99 | 8,50 | 11,34 | 2,85 | 11,49 | 17,85 | 6,37 |
| GPT-4o | - | - | - | - | - | - | - | - | - | 14,37 | 23,67 | 9,31 |
| Gemini 2.5 Pro | 42,70 | 53,42 | 10,72 | 27,43 | 41,64 | 14,21 | 7,38 | 10,23 | 2,85 | 15,46 | 24,15 | 8,69 |
| Gemini 3 Pro | 22,75 | 27,43 | 4,68 | 26,75 | 32,84 | 6,09 | - | - | - | 8,62 | 14,73 | 6,11 |
| VIBEVOICE ASR | 21,40 | 24,99 | 3,59 | 27,40 | 29,33 | 1,93 | 27,94 | 48,30 | 20,36 | 14,59 | 42,54 | 27,94 |
| MOSS Transcribe Diarize 0.9B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible, ni corresponde a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 1,8 GB (coincide con el tamano del repo en safetensors). Con overhead de encoder de audio, activaciones y cache de atencion para audio largo, una estimacion practica en bf16 es de 4 a 6 GB para clips cortos, y superior cuanto mas se acerque a los 90 minutos de audio. Cifra no publicada oficialmente.
- GPU recomendadas: no se documentan modelos concretos. Por tamano, una RTX 4090 (24 GB) o una RTX 4080 (16 GB) deberian cubrir la inferencia en bf16 con margen; para despliegue concurrente en vLLM o SGLang son preferibles A100 (40/80 GB) o H100, donde el cuello de botella sera la memoria de activaciones de audio largo antes que los pesos.
- Cabe en GPU de consumo: si, con toda probabilidad en cualquier GPU con 8 GB o mas en bf16, dado el tamano de 0,9B. No hay cifras oficiales de VRAM minima.
- Opciones de despliegue: vLLM y SGLang estan documentados en la model card; tambien se puede cargar con `transformers` usando `trust_remote_code=True`. No se documentan soporte de llama.cpp, Ollama ni TGI, y no hay cuantizaciones GGUF publicadas, por lo que esas rutas no estan disponibles de serie.
- Latencia y throughput: no disponibles. La model card solo indica que la inferencia sobre audio largo se resuelve en una sola pasada, lo que evita el coste de encadenar ASR y diarizacion, pero no publica tiempos por hora de audio.

## Comparativa con modelos similares

Los unicos sistemas con los que se compara objetivamente en la informacion disponible son los incluidos en la tabla de evaluacion del autor. Para ellos no se publican parametros, contexto ni licencia, salvo que son servicios propietarios.

| Modelo | Parametros | Contexto / audio maximo | CER en Podcast | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS Transcribe Diarize 0.9B | 908.513.280 | 90 minutos en una pasada (por model card) | no disponible en el extracto | Apache 2.0 | Pesos abiertos en HuggingFace |
| Doubao | no disponible | no disponible | 7,93 | propietaria | API comercial |
| ElevenLabs | no disponible | no disponible | 8,50 | propietaria | API comercial |
| Gemini 2.5 Pro | no disponible | no disponible | 7,38 | propietaria | API comercial |
| Gemini 3 Pro | no disponible | no disponible | no disponible | propietaria | API comercial |
| VIBEVOICE ASR | no disponible | no disponible | 27,94 | no disponible | no disponible |

La diferencia relevante frente a todos ellos no es solo de error: es de modelo abierto, de 0,9B, autoalojable y con Apache 2.0, algo que ninguna de las alternativas de la tabla ofrece. Como referencia de categoria no se dispone en la informacion proporcionada de datos de otros modelos abiertos de ASR con diarizacion, por lo que no se incluye comparacion adicional.

## Limitaciones y advertencias

- La informacion disponible no incluye los resultados numericos del propio modelo en la tabla de evaluacion, por lo que no se puede verificar su rendimiento relativo frente a Doubao, ElevenLabs, Gemini o VIBEVOICE ASR.
- Idiomas: los metadatos de la ficha solo declaran ingles y chino, mientras que la model card afirma mas de 50 idiomas. Esa discrepancia debe resolverse con pruebas propias antes de asumir cobertura multilingue en produccion; el espanol aparece cubierto en el marco del MLC-SLM Challenge, pero no como idioma declarado en los metadatos.
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar codigo del autor del modelo; conviene revisar y fijar la revision del repositorio antes de usarlo en produccion.
- La ficha consultada (`Jinstudio/MOSS-Transcribe-Diarize`) es un espejo con 0 descargas y 0 likes; el repositorio oficial es `OpenMOSS-Team/MOSS-Transcribe-Diarize`. Para trazabilidad y actualizaciones, usar el oficial.
- La diarizacion produce etiquetas anonimas y consistentes dentro de la grabacion, pero no identifica personas entre grabaciones distintas; no debe usarse como sistema de identificacion biometrica.
- No se documentan sesgos por acento, dialecto, edad o genero, ni el comportamiento en audio con ruido, musica o solapamiento severo de voces.
- Riesgo de alucinacion: no se publican tasas de inserciones o texto inventado en segmentos ininteligibles o silencios, un fallo habitual en modelos de ASR generativos.
- No se declara la longitud de contexto en tokens ni el coste de memoria en funcion de la duracion del audio; el limite de 90 minutos es una afirmacion de la model card sin curva de degradacion publicada.
- No hay cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en CPU o en GPUs muy ajustadas de memoria.
- La licencia Apache 2.0 permite uso comercial y modificacion sin restricciones adicionales conocidas, pero conviene verificar los terminos de los datasets de entrenamiento, no detallados en la informacion disponible.

## Enlaces

- Modelo en HuggingFace (espejo documentado): https://huggingface.co/Jinstudio/MOSS-Transcribe-Diarize
- Modelo en HuggingFace (oficial): https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-Transcribe-Diarize
- Paper en arXiv: https://arxiv.org/abs/2601.01554
- 2nd MLC-SLM Challenge (INTERSPEECH 2026): https://www.nexdata.ai/competition/mlc-slm

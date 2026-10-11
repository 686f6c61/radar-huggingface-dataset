# areffarhadi/Taraneh-Q0.6B

## Resumen

Taraneh-Q0.6B es un modelo de reconocimiento automatico del habla (ASR) especializado en persa (farsi), desarrollado por Aref Farhadipour (Universidad de Zurich) y publicado en HuggingFace bajo el identificador areffarhadi/Taraneh-Q0.6B. Forma parte de la familia Taraneh, compuesta por cinco modelos, y se obtiene mediante ajuste fino del checkpoint Qwen/Qwen3-ASR-0.6B sobre aproximadamente 1.560 horas de habla en persa. Con 0,6 mil millones de parametros, se situa en el rango de modelos ligeros desplegables en una sola GPU.

El modelo aborda un problema concreto: la escasez de sistemas ASR de calidad para persa, especialmente en dominios alejados del habla leida, como el canto, el habla conversacional espontanea o el audio procedente de medios y plataformas de video. Se publica acompanado de un articulo (Taraneh-ASR: Scaling Persian Speech Recognition and Forced Alignment Across Singing and Conversational Domains) y de un repositorio de codigo con manifiestos, normalizacion de texto e inferencia.

Su relevancia actual radica en la combinacion de licencia Apache-2.0 (con concesion de patentes y uso comercial permitido), tamano reducido y soporte de inferencia offline y en streaming mediante vLLM 0.14 a traves del paquete qwen-asr. La informacion disponible no detalla la arquitectura interna, la longitud de contexto ni formatos de cuantizacion alternativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion proporcionada; heredada del checkpoint base Qwen/Qwen3-ASR-0.6B (modelo de reconocimiento automatico del habla) |
| Parametros totales | 0,6 mil millones (0,6B), segun el identificador y el checkpoint base |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, AWQ ni GPTQ en la informacion proporcionada) |
| Idiomas soportados | Persa (farsi, codigo `fa`) unicamente |
| Licencia | Apache-2.0 (incluye concesion de patentes; uso comercial permitido) |
| Formato de pesos | No disponible (repositorio con `library_name: transformers`; tamano de repositorio declarado 0,0 GB) |
| Tarea (pipeline) | `automatic-speech-recognition` |
| Modelo base | Qwen/Qwen3-ASR-0.6B (fine-tune) |
| Datos de ajuste | Aproximadamente 1.560 horas de habla en persa |
| Familia | Taraneh (cinco modelos en total, segun el autor) |
| Autoria | Aref Farhadipour, Universidad de Zurich |
| Fecha de publicacion | 10 de octubre de 2026 (creacion y ultima actualizacion) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo mas alla de su condicion de fine-tune del checkpoint Qwen/Qwen3-ASR-0.6B, un sistema ASR de 0,6B parametros. El autor no detalla el tipo de encoder acustico, el decodificador ni el mecanismo de atencion empleado, por lo que cualquier afirmacion adicional al respecto seria especulativa. El modelo se distribuye para su uso con la libreria `transformers` y con el paquete `qwen-asr`, lo que indica compatibilidad con el ecosistema estandar de HuggingFace.

El entrenamiento consiste en un ajuste fino supervisado sobre aproximadamente 1.560 horas de audio en persa. No se especifica en la informacion disponible la composicion exacta del corpus, el numero de tokens de audio procesados, ni si se aplicaron tecnicas de alineamiento forzado, RLHF o DPO. El articulo asociado menciona el escalado del reconocimiento de habla persa y el alineamiento forzado en dominios de canto y conversacion, lo que sugiere que el corpus de ajuste incluye material musical y dialogado, ademas de habla leida y de medios. La evaluacion se realiza tras una normalizacion unificada de texto persa, un detalle relevante porque las metricas de WER y CER dependen fuertemente de las reglas de normalizacion aplicadas.

Como innovacion destacable, el modelo soporta decodificacion en streaming, aunque con una restriccion importante: el streaming solo esta disponible con el backend vLLM 0.14. La inferencia offline puede ejecutarse tanto con ese backend como con las rutas habituales del ecosistema `transformers`.

## Capacidades

- Transcripcion de voz a texto en persa (farsi) con salida de texto normalizado.
- Reconocimiento en dominios variados: habla leida (FLEURS, Common Voice), audio de YouTube, medios de comunicacion y contenido musical.
- Procesamiento de audio cantado, un caso poco cubierto por los sistemas ASR convencionales, segun los dominios evaluados por el autor.
- Inferencia por lotes (offline) y en streaming en tiempo real, esta ultima mediante el backend vLLM 0.14.
- Integracion con el ecosistema HuggingFace `transformers` y con el paquete `qwen-asr`.
- Ejecucion en GPU de consumo gracias a su tamano de 0,6B parametros.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generation ni modos de pensamiento explicito. Es un modelo exclusivamente de reconocimiento de habla y su idioma de trabajo es unicamente el persa.
- No se documenta capacidad multilingue: la model card declara unicamente `fa`.

## Casos de uso

- Transcripcion de archivos de audio y video en persa para generacion de subtitulos: el modelo convierte el audio en texto con normalizacion persa unificada, lo que permite producir subtitulos consistentes para plataformas de video, con un WER del 18,87 % en el dominio YouTube medido por el autor.
- Subtitulado y documentacion de medios de comunicacion: con un WER del 22,32 % en el dominio de medios, es adecuado para indexar y buscar contenido audiovisual en persa (archivos de television, radio, podcasts) y hacerlo recuperable por texto.
- Transcripcion de conversaciones y entrevistas: el ajuste incluye dominios conversacionales, de modo que puede emplearse para actas, resumenes y analisis de llamadas en persa, siempre que se disponga de una etapa de correccion posterior dado el caracter espontaneo del habla.
- Investigacion en music information retrieval y letras de canciones: el modelo esta especificamente entrenado y evaluado en contenido musical (WER del 35,97 %), lo que lo hace util para extraer letras y alinear letra y audio en persa, un escenario donde la mayoria de ASR genericos fallan.
- Accesibilidad y transcripcion en tiempo real: con el backend vLLM 0.14 en modo streaming, el modelo puede alimentar interfaces de subtitulado en vivo, asistentes de accesibilidad o toma de notas automatica en reuniones en persa.
- Fine-tuning posterior sobre dominios verticales: al ser un checkpoint de 0,6B con licencia Apache-2.0, sirve como punto de partida economico para ajustar ASR en nichos concretos (terminologia medica, legal, atencion al cliente) con presupuesto de GPU reducido.
- Procesamiento por lotes a gran escala: su tamano permite transcribir corpus completos en una sola GPU, por ejemplo archivos de historia oral, patrimonio sonoro o conjuntos de datos de investigacion en persa.
- Sistemas de atencion al cliente y voice analytics: transcripcion de llamadas en persa como primera etapa de un pipeline de clasificacion de intenciones, analisis de sentimiento o control de calidad, delegando el razonamiento posterior a un modelo de lenguaje aparte, ya que Taraneh-Q0.6B no realiza razonamiento ni tool calling.

## Benchmarks y rendimiento

Metricas publicadas por el autor: tasa de error de palabras (WER) y tasa de error de caracteres (CER) en porcentaje, tras normalizacion unificada de texto persa. PSRB y VisualEars eran conjuntos no vistos durante el entrenamiento.

| Conjunto de evaluacion | WER (%) / CER (%) |
|---|---|
| FLEURS | 7,11 / 2,54 |
| Common Voice | 9,65 / 3,86 |
| YouTube | 18,87 / 10,12 |
| Music | 35,97 / 15,83 |
| Media | 22,32 / 11,73 |
| PSRB | 24,61 / 10,67 |
| VisualEars | 9,44 / 3,12 |

El autor indica que la comparacion completa de los cinco modelos de la familia Taraneh esta disponible en el articulo y en el README del repositorio de GitHub. No se proporcionan en la informacion disponible resultados comparativos frente a otros sistemas ASR (por ejemplo Whisper o NeMo) ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion propia a partir del numero de parametros, no confirmada por el autor): en torno a 1,3-1,6 GB en FP16/BF16, aproximadamente 0,7-0,9 GB en INT8 y 0,4-0,6 GB en INT4, sin contar el overhead del runtime (vLLM reserva memoria adicional para el cache de KV y para el encoder de audio).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para FP16, incluidas RTX 3060, RTX 4060, RTX 4090, A10G, L4, A100 y H100. Para despliegues con vLLM y streaming conviene reservar entre 4 y 8 GB para el cache de KV y los buffers del servidor.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPU consumer modernas (RTX 3050 en adelante) e incluso en iGPU con memoria unificada, aunque esto ultimo no esta verificado en la informacion proporcionada.
- Opciones de despliegue: inferencia offline con `transformers` a traves del paquete `qwen-asr`, e inferencia offline y en streaming con el backend vLLM 0.14 (`pip install "qwen-asr[vllm]"`). No se mencionan en la informacion disponible soporte para llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. El unico dato operativo relevante es que el modo streaming requiere obligatoriamente el backend vLLM.

## Comparativa con modelos similares

La informacion proporcionada solo identifica un modelo comparable directo: el checkpoint base. No se facilitan resultados de otros sistemas ASR en persa, por lo que las celdas de rendimiento comparado quedan como no disponibles.

| Modelo | Parametros | Contexto | WER persa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Taraneh-Q0.6B | 0,6B | No disponible | 7,11 en FLEURS; 9,65 en Common Voice; 9,44 en VisualEars | Apache-2.0 | HuggingFace (`areffarhadi/Taraneh-Q0.6B`) |
| Qwen/Qwen3-ASR-0.6B (base) | 0,6B | No disponible | No disponible en la informacion proporcionada | Apache-2.0 (segun el autor) | HuggingFace |
| Otros modelos de la familia Taraneh | No disponible | No disponible | Comparativa completa en el articulo y en el README del repositorio | Apache-2.0 | HuggingFace / GitHub |
| Otros sistemas ASR para persa (por ejemplo Whisper ajustado, NeMo) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo solo soporta persa (`fa`). No hay evidencia de capacidad multilingue ni de transferencia a otros idiomas.
- El rendimiento degrada de forma notable en audio musical: WER del 35,97 % en el dominio Music, frente al 7,11 % de FLEURS. En dominios espontaneos o ruidosos (Media 22,32 %, PSRB 24,61 %) el error tambien es elevado para uso en produccion sin revision humana.
- Riesgo de alucinacion y de sustituciones plausibles: como todo sistema ASR, puede generar texto fluido que no corresponde al audio, especialmente con musica, solapamiento de hablantes o ruido de fondo. Se recomienda umbral de confianza y revision en aplicaciones criticas.
- La normalizacion de texto persa influye directamente en las metricas publicadas; reproducir los numeros exige aplicar las mismas reglas de normalizacion que acompanan al repositorio de codigo.
- El modo streaming esta ligado al backend vLLM 0.14, lo que limita la portabilidad y obliga a mantener esa version del runtime.
- No se documentan sesgos especificos de genero, acento o variedad dialectal del persa, ni la composicion demografica del corpus de 1.560 horas. Es razonable esperar peor rendimiento en acentos o dialectos poco representados, pero no hay datos que lo confirmen.
- Licencia Apache-2.0: el uso comercial esta permitido. Es obligatorio conservar el aviso de licencia y el aviso original de licencia de Qwen junto con los pesos. No se imponen restricciones de uso adicionales segun la informacion disponible.
- El repositorio declaraba 0 descargas y 0 likes en el momento de la consulta y un tamano de 0,0 GB, lo que puede indicar una publicacion reciente o pesos no completamente cargados. Conviene verificar la integridad del repositorio antes de integrarlo en un pipeline.
- No se especifica la longitud de contexto ni la ventana maxima de audio procesable, dato imprescindible para dimensionar el troceado (chunking) en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/areffarhadi/Taraneh-Q0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio de codigo, manifiestos, normalizacion e inferencia: https://github.com/areffarhadi/persian-asr
- PDF del articulo (Taraneh-ASR: Scaling Persian Speech Recognition and Forced Alignment Across Singing and Conversational Domains): https://github.com/areffarhadi/persian-asr/blob/main/ArefFarhadi-TaranehASR.pdf
- Busqueda web: no se ha encontrado ningun resultado relevante sobre este modelo. Los resultados devueltos por la busqueda (foros de entretenimiento, hilos de examenes y foros de opinion) no guardan relacion con el modelo ni con reconocimiento automatico del habla en persa, por lo que no se incluyen como fuentes.

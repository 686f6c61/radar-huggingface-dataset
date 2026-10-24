# ArchiveStudio/MOSS-Music-8B-Instruct

## Resumen

MOSS-Music-8B-Instruct es un modelo abierto de comprensión musical (audio-text-to-text) desarrollado por MOSI.AI, el equipo OpenMOSS y el Shanghai Innovation Institute. Esta ficha corresponde a la copia publicada en HuggingFace por ArchiveStudio bajo licencia Apache-2.0. El modelo no se limita a transcribir audio: está especializado en descripción musical en lenguaje natural, ASR de letras con marcas temporales, reconocimiento de acordes, tonalidad y tempo, segmentación estructural de la canción e identificación de instrumentos y voces.

Arquitectónicamente sigue el diseño modular de MOSS-Audio: un codificador de audio propio (MOSS-Audio-Encoder) que genera representaciones temporales a 12,5 Hz, un adaptador de modalidad y un modelo de lenguaje que produce texto de forma autorregresiva. Sobre esa base, el equipo aplicó preentrenamiento continuado y ajuste supervisado específicos de música. El nombre comercial indica 8B, pero los pesos en safetensors suman 9.052.463.488 parámetros (unos 9,05 mil millones).

La relevancia actual está en que la mayoría de modelos audio-lenguaje abiertos están orientados a voz y sonido ambiental, no a música. MOSS-Music cubre tareas MIR (music information retrieval) desde un único modelo generativo y publica además un pipeline de anotación de datos musicales a gran escala. Se distribuye en dos variantes: Instruct (seguimiento directo de instrucciones) y Thinking (razonamiento en cadena de pensamiento).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modular audio-lenguaje: codificador de audio (MOSS-Audio-Encoder) + adaptador de modalidad + LLM autorregresivo; inyección cross-layer tipo DeepStack y marcadores temporales |
| Parametros totales | 9.052.463.488 (~9,05 B segun safetensors); denominado comercialmente 8B |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; el repo contiene pesos safetensors (18,1 GB) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria transformers, custom_code) |
| Frecuencia de representacion de audio | 12,5 Hz (frames temporales del codificador) |
| Pipeline declarado | audio-text-to-text |
| Variantes de la familia | MOSS-Music-8B-Instruct y MOSS-Music-8B-Thinking |
| Tamano del repositorio | 18,1 GB |
| Fecha de publicacion del release original | 2026.05.01 (segun la model card) |

## Arquitectura y entrenamiento

El modelo hereda el diseño modular de MOSS-Audio con tres piezas: un codificador de audio entrenado desde cero (no un frontend preexistente) que convierte la onda de audio en representaciones temporales continuas a 12,5 Hz, un adaptador que proyecta esas representaciones al espacio de embeddings del modelo de lenguaje y un LLM que genera texto de forma autorregresiva. El codificador propio se justifica por la necesidad de alineamiento temporal más estricto y mejor cobertura de canto, timbres y contenido acústico no verbal.

Dos innovaciones destacan en la model card. La primera es la inyección cross-layer inspirada en DeepStack: además de la salida de la última capa del codificador, se seleccionan capas intermedias, se proyectan de forma independiente y se inyectan en las primeras capas del LLM, preservando información de bajo nivel (transitorios, textura instrumental, ritmo) que una única representación semántica perdería. La segunda es la inserción de marcadores temporales entre frames de audio a intervalos fijos durante el preentrenamiento, lo que da al modelo conciencia explícita de "qué ocurre y cuándo", necesaria para acordes con timestamp, estructura y letras alineadas.

El entrenamiento combina preentrenamiento continuado sobre música y ajuste supervisado sobre tareas musicales. El número de tokens, la composición exacta del dataset y el uso de RLHF o DPO no se detallan en la información disponible. El equipo publica en paralelo MOSS-Music-Data-Pipeline, un pipeline de anotación y procesado de datos musicales a gran escala, lo que sugiere una parte importante del esfuerzo en la generación de datos de entrenamiento.

## Capacidades

- ASR de letras cantadas con marcas temporales a nivel de frase y de palabra, con robustez frente a acompañamiento instrumental.
- Descripción musical (captioning) y etiquetado: estado de ánimo, género, instrumentación, estilo de producción y evolución emocional del tema.
- Reconocimiento de tonalidad (key), pulso, beats, downbeats y progresiones de acordes, incluyendo transcripción de acordes con timestamp.
- Análisis estructural: segmentación en intro, verso, estribillo, puente y outro, con razonamiento sobre repetición y contraste.
- Identificación de instrumentos prominentes y de voces (solo o coro, género, registro).
- Preguntas y respuestas musicales de forma abierta sobre una pista completa, con razonamiento multi-paso en la variante Thinking.
- Entrada audio-texto y salida texto (pipeline audio-text-to-text); no se documenta salida de audio ni generación musical.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponibles en la información proporcionada.
- Cobertura multilingüe limitada a inglés y chino.

## Casos de uso

- Catalogación automática en plataformas de streaming: generar metadatos de género, estado de ánimo, instrumentación y tempo para millones de pistas, reduciendo la dependencia de anotación manual y mejorando la calidad de las recomendaciones.
- Letras sincronizadas tipo karaoke: el ASR de letras con timestamps a nivel de palabra permite construir subtítulos alineados sobre la mezcla final, incluyendo backing tracks, sin separar previamente las pistas.
- Herramientas para producción musical: extracción de tonalidad, tempo, beats y progresiones de acordes con marcas de tiempo para asistir en sampling, remezclas y armonización.
- Búsqueda musical semántica: indexar descripciones generadas por el modelo y permitir consultas en lenguaje natural del tipo "temas lentos con piano y voz femenina en tonalidad menor".
- Análisis de derechos y similitud: comparar progresiones de acordes y estructura entre pistas como señal complementaria (no sustitutiva del análisis juridico) en revisiones de similitud musical.
- Investigación en MIR: anotación asistida de corpus musicales combinando el modelo con MOSS-Music-Data-Pipeline para acelerar el etiquetado estructural y armonico a escala.
- Educación musical: generar análisis explicativos de una obra (estructura, modulaciones, instrumentación) para materiales docentes o tutores interactivos.
- Análisis editorial y de tendencias: resumir características de estilo y producción de un catálogo para estudios de mercado musical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación en su índice, pero su contenido no se ha proporcionado en la información consultada, por lo que no se reproduce ninguna cifra.

## Requisitos de hardware

- Peso de los pesos: el repositorio ocupa 18,1 GB en safetensors, coherente con precisión de 16 bits para ~9,05 B de parámetros.
- VRAM estimada en bf16/fp16: en torno a 18-20 GB solo para pesos, más overhead del codificador de audio, activaciones y cache KV; en la práctica se recomienda una GPU de 24 GB o superior (estimación propia, no publicada por el autor).
- VRAM estimada con cuantización: aproximadamente 10-11 GB en 8 bits y 5-6 GB en 4 bits, sin datos oficiales de soporte de cuantización para este modelo.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para servicio concurrente; RTX 4090 / 3090 (24 GB) para inferencia en bf16 de una sola peticion con margen ajustado.
- Consumer GPU: cabe en RTX 4090 y RTX 3090 en bf16 con audio de duración moderada; en GPUs de 12-16 GB sería necesario cuantizar.
- Despliegue: la model card documenta SGLang para serving y una aplicacion Gradio; tambien es cargable con transformers (custom_code). Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada; no se documentan ficheros GGUF en el repositorio.
- Latencia y throughput: no disponibles. La tasa de frames de audio (12,5 Hz) implica una secuencia de entrada apreciable para pistas largas, por lo que el coste crece con la duración del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| MOSS-Music-8B-Instruct (esta ficha) | ~9,05 B (safetensors) | No disponible | en, zh | Apache-2.0 | Comprensión musical especializada, respuesta directa |
| MOSS-Music-8B-Thinking | No disponible | No disponible | en, zh | Apache-2.0 | Misma base, con razonamiento en cadena de pensamiento para análisis musical |
| MOSS-Audio (modelo base del backbone) | No disponible | No disponible | No disponible | No disponible en la información consultada | Audio-lenguaje general; MOSS-Music parte de el y se especializa en música |
| Qwen2-Audio-7B-Instruct | No disponible en la información consultada | No disponible | No disponible | Apache-2.0 | Audio-lenguaje generalista (voz y sonido); no especializado en música |

No se dispone de resultados de benchmarks publicados en la información proporcionada que permitan una comparación cuantitativa con alternativas. La comparación anterior es, por tanto, cualitativa y basada en el posicionamiento declarado por los autores.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no es posible verificar el rendimiento real frente a modelos audio-lenguaje generalistas ni frente a sistemas MIR especializados.
- Riesgo de alucinación en tareas de percepción fina: descripciones de instrumentación, progresiones de acordes o estructura pueden sonar plausibles y ser incorrectas, especialmente en mezclas densas o generos poco representados.
- Cobertura de idiomas limitada a inglés y chino: el ASR de letras y el QA en otros idiomas (castellano incluido) pueden degradarse de forma significativa; no hay datos sobre este punto.
- Sesgos probables en el reconocimiento de voces (género, registro) y en la descripción de género musical, derivados de la distribución del corpus de entrenamiento, no documentada.
- Longitud de contexto no publicada: el modelo se presenta para análisis de forma larga ("long-form"), pero sin cifra de ventana no se puede garantizar el comportamiento en pistas de duración completa.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, pero no concede derechos sobre el audio de entrada ni sobre las letras transcritas; el uso de letras esta sujeto a derechos de autor de terceros.
- Procedencia del repositorio: esta copia la publica la cuenta ArchiveStudio (0 descargas, 0 likes) a partir del release de OpenMOSS; conviene verificar la integridad de los pesos contra el repositorio oficial antes de usarla en producción.
- La variante Instruct prioriza respuestas directas y no incorpora el razonamiento explicito de la variante Thinking, lo que puede afectar a tareas analíticas complejas.
- No se documenta soporte de tool calling ni de flujos de agente, por lo que integraciones de ese tipo requeririan desarrollo propio.

## Enlaces

- HuggingFace (esta copia): https://huggingface.co/ArchiveStudio/MOSS-Music-8B-Instruct
- Repositorio oficial en GitHub: https://github.com/OpenMOSS/MOSS-Music
- Modelo base de audio: https://github.com/OpenMOSS/MOSS-Audio
- Pipeline de datos musicales: https://github.com/wx9songs/MOSS-Music-Data-Pipeline
- MOSI.AI: https://mosi.cn/#hero
- OpenMOSS: https://www.open-moss.com/
- Shanghai Innovation Institute: https://www.sii.edu.cn/
- Discord del proyecto: https://discord.gg/Xf3aXddCjc
- Twitter/X del proyecto: https://x.com/Open_MOSS
- Blog tecnico: anunciado como "coming soon", sin URL disponible
- Paper en arXiv: anunciado como "coming soon", sin URL disponible

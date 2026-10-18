# Jinstudio/MOSS-Audio-8B-Thinking

## Resumen

MOSS-Audio-8B-Thinking es un modelo abierto de comprensión de audio (audio-text-to-text) desarrollado por MOSI.AI, el equipo OpenMOSS y el Shanghai Innovation Institute. Forma parte de una familia de cuatro variantes (4B/8B en versión Instruct y Thinking) y su objetivo es unificar en un único modelo tareas que normalmente requieren pipelines separados: reconocimiento de habla con marcas temporales, análisis de hablante y emoción, interpretación de sonidos ambientales, comprensión musical, descripción de audio (captioning), QA con conciencia temporal y razonamiento multi-paso sobre el contenido acústico. La variante Thinking incorpora entrenamiento con cadena de pensamiento y aprendizaje por refuerzo para reforzar el razonamiento complejo.

Arquitectónicamente es un modelo modular: un encoder de audio propio (MOSS-Audio-Encoder, entrenado desde cero) que produce representaciones temporales continuas a 12,5 Hz, un adaptador de modalidad que proyecta esas representaciones al espacio de embeddings del LLM, y un modelo de lenguaje que genera texto de forma autorregresiva. El repositorio declara 9.052.463.488 parámetros totales (unos 9,05 B) en safetensors, con un peso de 18,1 GB, lo que es coherente con pesos en bf16/fp16.

Su relevancia ahora es doble: por un lado, publica pesos con licencia Apache-2.0 (uso comercial permitido) en una categoría donde abundan modelos con licencias restrictivas; por otro, introduce dos innovaciones técnicas concretas (inyección cross-layer de tipo DeepStack y marcadores temporales explícitos durante el preentrenamiento) orientadas a preservar prosodia, transitorios y estructura temporal, información que se pierde si solo se usa la capa superior del encoder.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modular: encoder de audio (MOSS-Audio-Encoder, entrenado desde cero) + adaptador de modalidad + LLM autorregresivo para generación de texto |
| Parámetros totales | 9.052.463.488 (~9,05 B), según safetensors |
| Parámetros activos | No disponible (no se documenta como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica safetensors; no se documentan GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con código propio (`custom_code`, arquitectura `moss_audio`); requiere `trust_remote_code` |
| Pipeline | audio-text-to-text (entrada de audio, salida de texto) |
| Resolución temporal del encoder | 12,5 Hz (representaciones temporales continuas) |
| Tamaño del repositorio | 18,1 GB |
| Variantes de la familia | MOSS-Audio-4B-Instruct, MOSS-Audio-4B-Thinking, MOSS-Audio-8B-Instruct, MOSS-Audio-8B-Thinking |

## Arquitectura y entrenamiento

El modelo sigue un diseño de tres bloques. El audio crudo se codifica con MOSS-Audio-Encoder, un encoder entrenado desde cero (no se reutiliza un frontend de audio comercial) que genera representaciones temporales continuas a 12,5 Hz; el adaptador de modalidad las proyecta al espacio de embeddings del LLM y este último genera texto de forma autorregresiva. El equipo justifica el entrenamiento del encoder desde cero por la búsqueda de representaciones de habla más robustas, un alineamiento temporal más ajustado y mayor extensibilidad entre dominios acústicos (habla, sonido ambiental, música).

Sobre esa base se aplican dos innovaciones. La primera es la inyección cross-layer inspirada en DeepStack: además de la salida de la última capa del encoder, se seleccionan features de capas tempranas e intermedias, se proyectan de forma independiente y se inyectan en las capas iniciales del LLM, de modo que el modelo conserva información de múltiples granularidades (ritmo, timbre, transitorios, estructura de fondo) que una única representación de alto nivel perdería. La segunda es la representación con conciencia temporal: durante el preentrenamiento se insertan tokens de tiempo explícitos entre las representaciones de frames a intervalos fijos, lo que permite al modelo aprender qué ocurrió y cuándo, y habilita el QA temporal y el ASR con timestamps a nivel de palabra y de frase.

En cuanto a los datos de entrenamiento, la model card no especifica el número de tokens, la composición del dataset ni el detalle de las etapas de alineación. Sí se indica que las variantes Thinking se entrenan con chain-of-thought y aprendizaje por refuerzo para el razonamiento multi-paso. El blog y el paper están anunciados como "coming soon", por lo que la información metodológica completa no está disponible todavía.

## Capacidades

- Reconocimiento y transcripción de habla con salida de texto limpia y estructurada, incluyendo alineamiento temporal a nivel de palabra y de frase.
- Análisis de hablante: identificación de características del locutor y de cambios de turno.
- Análisis de emoción a partir de tono, timbre y contexto, y detección de eventos acústicos relevantes.
- Extracción de pistas de escena y sonido: ruido de fondo, sonidos ambientales, señales no verbales y música, para inferir contexto y atmósfera.
- Comprensión musical: estilo, progresión emocional, instrumentación y rasgos acústicos destacados de un fragmento.
- QA y resumen sobre audio: preguntas y síntesis de contenido en podcasts, reuniones, entrevistas y grabaciones ambientales.
- QA con conciencia temporal: preguntas del tipo "qué se dijo en el minuto X" y ASR con timestamps.
- Razonamiento complejo multi-hop sobre el contenido de audio, apoyado en entrenamiento con cadena de pensamiento y RL (variante Thinking).
- Capacidad multimodal limitada a audio de entrada y texto de salida: no se documenta generación de audio ni de vídeo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no documentadas explícitamente más allá del razonamiento multi-paso.

## Casos de uso

- **Transcripción y subtitulado con marcas temporales**: el modelo produce ASR con timestamps a nivel de palabra y de frase, lo que permite generar subtítulos SRT/VTT alineados y auditar la sincronía sin un forced-aligner adicional.
- **Actas y resúmenes de reuniones**: con QA y summarization sobre audio, se puede ingerir una reunión, preguntar por acuerdos o decisiones concretas y obtener un resumen; el modo Thinking aporta valor cuando hay que encadenar varias referencias dentro de la conversación.
- **Analítica de contact center**: combinando transcripción, detección de emoción y análisis de eventos acústicos se pueden construir informes por llamada (tono del cliente, interrupciones, silencios) para control de calidad y detección de riesgo de cancelación.
- **Búsqueda temporal en archivos largos**: entrevistas, podcasts o archivos de investigación donde la consulta es de tipo "¿en qué momento se menciona el presupuesto?"; la representación con marcadores temporales está diseñada específicamente para este escenario.
- **Catalogación y etiquetado musical**: extracción de estilo, instrumentación y progresión emocional para enriquecer metadatos de catálogos, playlist generation o sistemas de recomendación.
- **Accesibilidad y descripción de escenas sonoras**: generación de descripciones de sonidos ambientales y eventos para personas con discapacidad auditiva o para enriquecer contenido audiovisual con capas descriptivas.
- **Moderación y monitorización de contenido en audio**: detección de eventos acústicos y análisis de tono en streams o grabaciones para flagged automático previo a revisión humana.
- **Informes con razonamiento multi-paso**: en pipelines de analistas, usar la variante Thinking para encadenar evidencias acústicas (quién habla, con qué tono, qué sonido de fondo hay) antes de emitir una conclusión documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección "Evaluation" en el índice, pero el contenido con cifras no forma parte de la documentación proporcionada, y el paper y el blog figuran como "coming soon". No se debe asumir ningún resultado de MMLU, ASR (WER), AIR-Bench, MMAU ni similares para este modelo hasta que el autor los publique.

## Requisitos de hardware

- **VRAM para inferencia (estimación calculada a partir del número de parámetros, no publicada por el autor)**: en bf16/fp16 los pesos ocupan aproximadamente 18,1 GB (coincide con el tamaño del repositorio), a los que hay que sumar caché KV y activaciones del encoder de audio, por lo que el consumo real será superior.
- **bf16 en GPU de datacenter**: A100 40/80 GB, H100 80 GB o L40S 48 GB son opciones seguras para audio de duración media y lotes pequeños.
- **Consumer GPU**: en bf16, una RTX 4090 (24 GB) queda muy justa y dependerá de la longitud del audio y del lote; en cuantización de 8 bits (aproximadamente 9-10 GB de pesos) cabría en RTX 4080/4090 y en GPUs de 16 GB; en 4 bits (aproximadamente 5 GB) cabría en tarjetas de 8-12 GB, aunque el autor no publica pesos cuantizados ni recetas de cuantización.
- **Opciones de despliegue documentadas**: SGLang Serving (sección específica en la model card), aplicación Gradio para uso interactivo y carga directa con Transformers usando `trust_remote_code=True` (arquitectura `moss_audio`). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. Al ser un modelo con encoder de audio más LLM y, en la variante Thinking, con cadena de pensamiento, es esperable una latencia notablemente mayor que la de un ASR puro, pero no hay cifras publicadas.
- **Requisito práctico**: al usar `custom_code`, conviene fijar la revisión del repositorio y revisar el código remoto antes de desplegarlo en producción.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de terceros en la información proporcionada, por lo que las celdas de los modelos comparables se marcan como no disponibles en lugar de estimarse.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MOSS-Audio-8B-Thinking (este modelo) | 9,05 B | No disponible | en, zh | Apache-2.0 | safetensors + `custom_code` |
| MOSS-Audio-8B-Instruct | No disponible (la familia se denomina 8B) | No disponible | en, zh | Apache-2.0 (según colección) | No disponible |
| MOSS-Audio-4B-Thinking | No disponible (la familia se denomina 4B) | No disponible | en, zh | Apache-2.0 (según colección) | No disponible |
| MOSS-Audio-4B-Instruct | No disponible (la familia se denomina 4B) | No disponible | en, zh | Apache-2.0 (según colección) | No disponible |
| Alternativas de la categoría (p. ej. Qwen2-Audio, Kimi-Audio, Audio Flamingo 3, GLM-4-Voice) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparación con alternativas externas de la misma categoría (modelos audio-LLM de 7-9 B orientados a comprensión de audio) queda pendiente de datos verificables; no se han incluido cifras para no introducir información no contrastada.

## Limitaciones y advertencias

- **Cobertura idiomática limitada**: solo inglés y chino según los metadatos; no hay evidencia publicada de rendimiento en castellano ni en otras lenguas, por lo que su uso en producción en español requeriría evaluación propia.
- **Ausencia total de benchmarks**: no hay cifras de WER, QA de audio ni razonamiento; la sección de evaluación de la model card no está disponible en la documentación consultada.
- **Longitud de contexto desconocida**: no se especifica la ventana de contexto, lo que impide planificar con precisión el procesamiento de audios largos (reuniones, podcasts de varias horas) sin truncado o segmentación.
- **Repositorio de terceros**: la ficha corresponde a `Jinstudio/MOSS-Audio-8B-Thinking`, con 0 descargas y 0 likes, mientras que la model card remite a la colección oficial `OpenMOSS-Team/moss-audio`. Conviene verificar la procedencia y usar el repositorio oficial para producción.
- **Discrepancia de fechas**: la model card anuncia el lanzamiento el 2026.4.13, mientras que el repositorio figura creado el 2026-10-18; no se explica la diferencia.
- **Código remoto**: requiere `trust_remote_code=True` con arquitectura `moss_audio`, lo que implica ejecutar código del autor; hay que auditar y fijar la revisión.
- **Riesgo de alucinación**: como cualquier LLM que describe contenido percibido, puede generar transcripciones o eventos plausibles pero inexistentes, especialmente con audio ruidoso, solapamiento de voces o música densa; se recomienda verificación y umbrales de confianza en producción.
- **Sesgos no documentados**: no se publica información sobre composición del dataset ni sobre sesgos de acento, dialecto, género o edad en el reconocimiento y en el análisis de emoción.
- **Solo salida de texto**: no genera audio ni respuesta hablada; si el producto necesita TTS hay que encadenar otro modelo.
- **Licencia**: Apache-2.0 permite uso comercial y modificaciones, pero al tratarse de pesos publicados por un tercero conviene conservar los avisos de atribución y confirmar en el repositorio oficial que la licencia se aplica a todos los componentes (incluido el encoder entrenado desde cero).
- **Madurez**: blog, paper y demos están anunciados como próximos; el ecosistema de herramientas (cuantizaciones, soporte en vLLM/llama.cpp) no está documentado a fecha de esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jinstudio/MOSS-Audio-8B-Thinking
- Colección oficial de la familia MOSS-Audio (OpenMOSS-Team): https://huggingface.co/collections/OpenMOSS-Team/moss-audio
- MOSI.AI: https://mosi.cn/#hero
- OpenMOSS: https://www.open-moss.com/
- Shanghai Innovation Institute: https://www.sii.edu.cn/
- Twitter/X del equipo: https://x.com/Open_MOSS
- Discord del equipo: https://discord.gg/Xf3aXddCjc
- Blog técnico: anunciado como "coming soon", no disponible
- Paper en arXiv: anunciado como "coming soon", no disponible

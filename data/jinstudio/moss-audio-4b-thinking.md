# Jinstudio/MOSS-Audio-4B-Thinking

## Resumen

MOSS-Audio es una familia de modelos abiertos de comprensión de audio desarrollada por MOSI.AI, el equipo OpenMOSS y el Shanghai Innovation Institute. Esta ficha cubre la variante **MOSS-Audio-4B-Thinking**, publicada en el repositorio `Jinstudio/MOSS-Audio-4B-Thinking`, una redistribución del modelo original de la colección `OpenMOSS-Team/moss-audio`. El modelo unifica en una sola pila transcripción de voz, reconocimiento de hablante y emoción, comprensión de sonido ambiental, análisis musical, captioning y razonamiento multi-paso sobre contenido acústico.

La arquitectura es modular: un codificador de audio propio (MOSS-Audio-Encoder, entrenado desde cero), un adaptador de modalidad y un modelo de lenguaje autorregresivo. El codificador produce representaciones temporales a 12,5 Hz y el adaptador las proyecta al espacio de embeddings del LLM. La variante Thinking incorpora entrenamiento con cadena de pensamiento y aprendizaje por refuerzo para tareas de razonamiento complejo.

Un dato relevante para la evaluación: aunque el nombre comercial indica "4B", el recuento real de parámetros en safetensors es de 5.222.820.736 (~5,22 mil millones), y el repositorio ocupa 10,5 GB. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que la sitúa como alternativa abierta frente a frontends de audio propietarios.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modular: codificador de audio (MOSS-Audio-Encoder, entrenado desde cero) + adaptador de modalidad + LLM autorregresivo; inyección cross-layer tipo DeepStack y marcadores temporales |
| Parámetros totales | 5.222.820.736 (~5,22 B), según safetensors del repositorio |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo distribuye safetensors en precisión original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con `custom_code` (arquitectura `moss_audio`); requiere `trust_remote_code=True` |
| Tasa de frames del codificador | 12,5 Hz (representaciones temporales continuas) |
| Pipeline | `audio-text-to-text` |
| Tamaño del repositorio | 10,5 GB |
| Variantes de la familia | MOSS-Audio-4B-Instruct, MOSS-Audio-4B-Thinking, MOSS-Audio-8B-Instruct, MOSS-Audio-8B-Thinking |

## Arquitectura y entrenamiento

El modelo sigue un diseño de tres bloques. El audio bruto se codifica con MOSS-Audio-Encoder en representaciones temporales continuas a 12,5 Hz; un adaptador las proyecta al espacio de embeddings del LLM, que genera texto de forma autorregresiva. El codificador no es un frontend preentrenado de terceros: se entrena desde cero para obtener representaciones de voz más robustas, mejor alineamiento temporal y mayor extensibilidad entre dominios acústicos (voz, sonido ambiental y música).

Dos innovaciones destacan sobre la arquitectura base. La primera es **DeepStack**, un módulo de inyección cross-layer entre el codificador y el LLM: además de la salida de la última capa del codificador, se seleccionan features de capas tempranas e intermedias, se proyectan de forma independiente y se inyectan en las capas iniciales del modelo de lenguaje. El objetivo es preservar información de múltiples granularidades (prosodia, timbre, transitorios, estructura tiempo-frecuencia) que una única representación de alto nivel perdería. La segunda es una estrategia de **marcadores temporales**: durante el pretraining se insertan tokens de tiempo explícitos entre las representaciones de frames a intervalos fijos, de modo que el modelo aprende qué ocurrió y cuándo dentro de una secuencia unificada de texto.

La variante Thinking se entrena específicamente para razonamiento multi-paso sobre audio, con entrenamiento de cadena de pensamiento y aprendizaje por refuerzo. No se han publicado en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni los detalles del pipeline de alineación (RLHF/DPO).

## Capacidades

- Transcripción de voz con salida de texto limpia y estructurada, con alineamiento temporal a nivel de palabra y de frase (timestamp ASR).
- Identificación de características del hablante y análisis de estado emocional a partir de tono, timbre y contexto.
- Detección de eventos acústicos clave dentro del audio.
- Extracción de señales de escena: ruido de fondo, sonido ambiental, música y señales no verbales para inferir contexto y atmósfera.
- Comprensión musical: estilo, progresión emocional, instrumentación y rasgos acústicos sobresalientes.
- Preguntas y respuestas sobre audio (speech, podcasts, reuniones, entrevistas, grabaciones ambientales) y generación de resúmenes.
- Time-aware QA: preguntas que dependen de la posición temporal del contenido ("¿qué se dijo en el minuto 3?").
- Razonamiento complejo multi-hop sobre contenido de audio, apoyado en cadena de pensamiento y RL (modo Thinking).
- Capacidad multimodal audio-texto con un único modelo para voz, sonido ambiental y música.
- Modo Instruct/Thinking separado por variante (esta ficha corresponde a Thinking, orientada a razonamiento; la familia incluye también variantes Instruct para seguimiento directo de instrucciones).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o uso autónomo multi-herramienta: no disponible en la información proporcionada.
- Capacidades de visión o audio generation (TTS): no disponibles; el modelo es de comprensión, no de síntesis.

## Casos de uso

- **Transcripción con timestamps para subtitulado**: el modelo genera ASR con alineamiento a nivel de palabra y de frase, lo que permite producir subtítulos sincronizados sin un modelo de alineamiento forzado adicional.
- **Actas y resúmenes de reuniones**: con entrada de audio de una reunión o entrevista, el modelo responde preguntas y produce resúmenes de los puntos clave, útil en pipelines de documentación interna.
- **Análisis de atención al cliente**: combinando transcripción, detección de emoción y de eventos acústicos, se pueden marcar llamadas con tono negativo o incidencias sonoras para revisión de calidad.
- **Moderación y auditoría de contenido en pódcasts**: el modelo identifica hablantes, emociones y eventos dentro de episodios largos, y responde consultas del tipo "¿en qué momento se habla de X?".
- **Indexación y búsqueda semántica de archivos de audio**: generar descripciones (audio captioning) y Q&A sobre grabaciones permite construir índices consultables sobre archivos de sonido, música o archivos de reuniones.
- **Análisis musical asistido**: extracción de instrumentación, estilo y progresión emocional en fragmentos musicales para catalogación de bibliotecas o herramientas de recomendación.
- **Investigación en razonamiento multimodal**: la variante Thinking, con CoT y RL, sirve como base para estudiar razonamiento multi-paso sobre modalidad acústica y para experimentos de evaluación de cadenas de pensamiento.
- **Accesibilidad**: descripción automática de escenas sonoras y eventos ambientales para personas con discapacidad auditiva, complementando la transcripción de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección "Evaluation" e indica que el blog y el paper están "coming soon", pero no se han facilitado cifras de MMLU, HumanEval, GSM8K ni de los benchmarks específicos de audio (ASR, audio QA, captioning, música). No se deben asumir valores por comparación con la familia.

## Requisitos de hardware

- **VRAM estimada para inferencia (estimación a partir del recuento real de parámetros, no publicada por el autor)**: en BF16/FP16 los pesos ocupan en torno a 10,4 GB; con codificador, adaptador, overhead de runtime y caché KV para audio de varios minutos, el consumo realista se sitúa en el rango de 13-18 GB.
- **GPU recomendadas para BF16**: NVIDIA A100 40/80 GB, H100, L40S, y en el segmento consumer RTX 4090 (24 GB) o RTX 3090 (24 GB). Con 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000) es probable que se requiera cuantización o audio de entrada corto, aunque no hay cifras oficiales.
- **Cabe en consumer GPU**: sí en el caso de tarjetas de 24 GB en precisión original; en tarjetas de 12-16 GB solo con cuantización, y el autor no publica pesos cuantizados, por lo que habría que generarlos manualmente.
- **Opciones de despliegue**: el autor documenta **SGLang Serving** y una **aplicación Gradio**. El modelo requiere `custom_code` de la arquitectura `moss_audio`, por lo que necesita `trust_remote_code=True`; no se menciona soporte para llama.cpp, Ollama, vLLM o TGI.
- **Latencia y throughput**: no disponibles. El modo Thinking implica generar cadenas de razonamiento antes de la respuesta final, lo que incrementa el número de tokens de salida y, por tanto, la latencia frente a la variante Instruct.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Audio-4B-Thinking (esta ficha) | ~5,22 B | No disponible | en, zh | Apache 2.0 | Safetensors + custom_code |
| MOSS-Audio-4B-Instruct | ~4 B nominal (no verificado) | No disponible | en, zh | Apache 2.0 | Safetensors + custom_code |
| MOSS-Audio-8B-Thinking | ~8 B nominal (no verificado) | No disponible | en, zh | Apache 2.0 | Safetensors + custom_code |
| MOSS-Audio-8B-Instruct | ~8 B nominal (no verificado) | No disponible | en, zh | Apache 2.0 | Safetensors + custom_code |
| Alternativas externas de audio-LLM (p. ej. Qwen2-Audio, Audio Flamingo) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparación relevante dentro de la información disponible es intra-familia: las variantes Instruct priorizan seguimiento directo de instrucciones y menor latencia, mientras que las Thinking (esta incluida) priorizan razonamiento multi-paso a costa de más tokens generados. No hay datos de benchmarks que permitan ordenar las variantes por calidad.

## Limitaciones y advertencias

- **Sin datos de benchmarks**: no hay métricas publicadas que permitan validar el rendimiento frente a alternativas; cualquier decisión de producción debería apoyarse en una evaluación propia.
- **Cobertura de idiomas limitada**: solo inglés y chino declarados. El rendimiento en castellano u otras lenguas no está documentado y probablemente sea degradado.
- **Discrepancia de nomenclatura**: el nombre comercial dice "4B" pero el recuento real de safetensors es ~5,22 B. Los requisitos de memoria deben calcularse con el valor real, no con el nominal.
- **Contexto no documentado**: se desconoce la longitud máxima de audio procesable y el límite de tokens del LLM; esto es crítico para casos de uso con reuniones o pódcasts largos.
- **Riesgo de alucinación en transcripción**: como todo modelo generativo de ASR, puede producir texto plausible que no corresponde al audio, especialmente con ruido de fondo, solapamiento de hablantes o acentos no vistos en entrenamiento. Se recomienda validación con una métrica de confianza o un segundo ASR para dominios críticos.
- **Sesgos**: el análisis de emoción y de características del hablante puede verse afectado por sesgos culturales y de género; no se publica documentación de evaluación de sesgos.
- **Dependencia de código remoto**: el modelo requiere `custom_code` (`trust_remote_code=True`), lo que implica ejecutar código del repositorio y complica el despliegue en entornos con políticas estrictas de seguridad.
- **Ecosistema de despliegue reducido**: no hay pesos GGUF ni soporte declarado para llama.cpp/Ollama; la documentación solo cubre SGLang y Gradio.
- **Naturaleza de la redistribución**: este repositorio pertenece a `Jinstudio`, no al equipo OpenMOSS original. Conviene verificar la integridad de los pesos frente a la colección oficial `OpenMOSS-Team/moss-audio` antes de usarlo en producción.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y sin garantías; no se han detectado cláusulas adicionales en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jinstudio/MOSS-Audio-4B-Thinking
- Colección oficial MOSS-Audio (OpenMOSS-Team): https://huggingface.co/collections/OpenMOSS-Team/moss-audio
- MOSI.AI: https://mosi.cn/#hero
- OpenMOSS: https://www.open-moss.com/
- Shanghai Innovation Institute: https://www.sii.edu.cn/
- Twitter/X del equipo: https://x.com/Open_MOSS
- Discord: https://discord.gg/Xf3aXddCjc
- Blog técnico: anunciado como "coming soon" (no disponible)
- Paper en arXiv: anunciado como "coming soon" (no disponible)

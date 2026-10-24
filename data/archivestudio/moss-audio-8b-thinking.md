# ArchiveStudio/MOSS-Audio-8B-Thinking

## Resumen

MOSS-Audio-8B-Thinking es la variante con razonamiento explícito (chain-of-thought) de la familia MOSS-Audio, un modelo abierto de comprensión de audio desarrollado por MOSI.AI, el equipo OpenMOSS y el Shanghai Innovation Institute. El repositorio analizado (`ArchiveStudio/MOSS-Audio-8B-Thinking`) es una réplica del modelo original publicado por OpenMOSS; conserva la licencia Apache 2.0 y el pipeline `audio-text-to-text`, pero no acumula descargas ni interacciones y no incluye artefactos adicionales más allá de los pesos en safetensors.

El modelo resuelve la comprensión unificada de audio real: reconocimiento de voz con marcas temporales a nivel de palabra y de frase, análisis de hablante y emoción, detección de eventos acústicos, descripción de escenas sonoras, comprensión musical, resumen y question answering sobre reuniones o pódcast, y razonamiento multi-salto sobre el contenido. Frente a las variantes Instruct de la misma familia, la versión Thinking está entrenada para generar cadenas de razonamiento antes de responder, lo que la orienta a tareas de inferencia compleja más que a la respuesta directa de baja latencia.

La arquitectura es modular: un codificador de audio propio entrenado desde cero (MOSS-Audio-Encoder) que emite representaciones temporales a 12,5 Hz, un adaptador de modalidad y un LLM autorregresivo. El conjunto suma 9.052.463.488 parámetros (unos 9,05 mil millones, por encima de la denominación comercial "8B") y ocupa 18,1 GB en el repositorio. Solo se declaran los idiomas inglés y chino, y no se han publicado cifras de benchmarks ni la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modular: codificador de audio (MOSS-Audio-Encoder, entrenado desde cero) + adaptador de modalidad + LLM autorregresivo; inyección cruzada de capas tipo DeepStack y marcadores temporales |
| Parámetros totales | 9.052.463.488 (~9,05 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo distribuye safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código personalizado (`custom_code`, requiere `trust_remote_code=True`) |
| Frecuencia de representación de audio | 12,5 Hz (framing del codificador) |
| Pipeline declarado | `audio-text-to-text` |
| Tamaño del repositorio | 18,1 GB |
| Variantes de la familia | MOSS-Audio-4B-Instruct, 4B-Thinking, 8B-Instruct, 8B-Thinking |

## Arquitectura y entrenamiento

MOSS-Audio sigue un diseño de tres bloques. El audio bruto se codifica con MOSS-Audio-Encoder, un codificador entrenado desde cero en lugar de reutilizar frontends de audio de terceros, que produce representaciones temporales continuas a 12,5 Hz (una trama cada 80 ms). Esas representaciones se proyectan al espacio de embeddings del LLM mediante un adaptador de modalidad y se consumen para la generación autorregresiva de texto.

Dos innovaciones destacan sobre el esquema encoder-adaptador-LLM convencional. La primera es DeepStack, un módulo de inyección cruzada de capas que, además de la salida de la última capa del codificador, toma características de capas intermedias y las proyecta de forma independiente hacia las primeras capas del LLM; el objetivo declarado es preservar prosodia, transitorios, timbre y estructura tiempo-frecuencia que una única representación de alto nivel pierde. La segunda es una estrategia de inserción de marcadores temporales durante el preentrenamiento: se intercalan tokens de tiempo entre las representaciones de tramas a intervalos fijos, de modo que el modelo aprende explícitamente "qué ocurrió y cuándo" dentro de una secuencia unificada.

La variante Thinking añade entrenamiento con cadenas de razonamiento y aprendizaje por refuerzo para el razonamiento multi-salto sobre audio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni los detalles del proceso de alineación (RLHF/DPO). El blog y el artículo técnico están anunciados como "coming soon" en la model card.

## Capacidades

- Reconocimiento y transcripción de voz con salida de texto limpia y estructurada.
- Alineación temporal a nivel de palabra y de frase (timestamps), incluyendo ASR con conciencia temporal.
- Identificación de características del hablante y análisis de estado emocional a partir de tono, timbre y contexto.
- Detección de eventos acústicos clave dentro del audio.
- Extracción de señales de escena: ruido de fondo, sonidos ambientales, señales no verbales y atmósfera.
- Comprensión musical: estilo, progresión emocional, instrumentación y rasgos acústicos salientes.
- Audio captioning y descripción de contenido sonoro complejo.
- Question answering sobre audio y resumen de reuniones, pódcast, entrevistas y grabaciones ambientales.
- Razonamiento multi-salto sobre el contenido de audio, con modo de pensamiento (chain-of-thought) potenciado por RL.
- Modelado unificado de habla, sonido ambiental y música en un único modelo.
- Idiomas: inglés y chino.
- No se documenta soporte de tool calling, function calling ni capacidades de agente en la información disponible.
- No se documenta visión ni audio de salida (el modelo es audio-entrada / texto-salida).

## Casos de uso

- Subtitulado y transcripción con marcas temporales: la alineación a nivel de palabra y de frase permite generar subtítulos SRT/VTT sincronizados y segmentados por hablante a partir de una única pasada, sin un pipeline ASR + alineador forzado separado.
- Análisis y resumen de reuniones y pódcast: el modelo responde preguntas y produce resúmenes sobre grabaciones largas de habla, útil para actas automáticas, extracción de action items y búsqueda semántica sobre el archivo de audio.
- Analítica de contact center: combinando transcripción, detección de hablante y análisis de emoción sobre tono y timbre, se pueden marcar conversaciones con riesgo de escalado o medir la evolución emocional del cliente en la llamada.
- Moderación y control de calidad de contenido en audio: la detección de eventos acústicos y la descripción de escenas permiten señalar segmentos con gritos, ruido anómalo o contenido no deseado en plataformas de UGC y en pipelines de publicación.
- Catalogación musical y de bibliotecas de sonido: el análisis de estilo, instrumentación y progresión emocional sirve para etiquetar automáticamente archivos de producción audiovisual y mejorar la búsqueda por atributos musicales.
- Accesibilidad: generación de descripciones de escenas sonoras y audio captioning para personas con discapacidad auditiva en vídeo, teatro retransmitido o retransmisiones deportivas.
- Verificación y análisis forense de grabaciones: el modo Thinking, con razonamiento multi-salto y referencias temporales, encaja en la reconstrucción de la secuencia de eventos de una grabación (quién habla, cuándo y qué ocurre alrededor) para auditoría o compliance.
- Asistentes de voz bilingües inglés-chino: interfaces conversacionales que necesitan entender la consulta hablada, el contexto acústico y responder en texto en ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación, pero no se han incluido cifras concretas (MMLU, HumanEval, GSM8K ni métricas específicas de audio como ASR WER, audio captioning o QA de audio), y el blog y el artículo técnico figuran como pendientes de publicación. No se deben asumir valores por comparación con otras variantes de la familia.

## Requisitos de hardware

- VRAM estimada en precisión de entrenamiento (bf16, 2 bytes por parámetro): unos 18,1 GB solo de pesos; con codificador de audio, adaptador, caché KV y overhead de runtime, el consumo realista arranca en 20-24 GB.
- Ajuste en GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB queda al límite para bf16 con contexto corto; una RTX 4090 de 24 GB en cuantización de 8 bits (aproximadamente 9-10 GB de pesos) o de 4 bits (aproximadamente 5-6 GB) tendría margen amplio, pero esas cuantizaciones no están publicadas oficialmente para este modelo.
- GPU profesionales recomendadas: A100 40 GB, A100 80 GB, L40S 48 GB o H100 80 GB para servicio concurrente en bf16 sin cuantizar.
- Multi-GPU: no se documenta en la información disponible; para lote alto conviene tensor parallelism sobre A100/H100.
- Opciones de despliegue: SGLang (la model card incluye una sección específica de serving con SGLang), Transformers con `trust_remote_code=True` para cargar el código personalizado, y una app Gradio incluida en el repositorio. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles. El modo Thinking genera cadenas de razonamiento antes de la respuesta, por lo que la latencia de salida será previsiblemente mayor que en las variantes Instruct de la misma familia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MOSS-Audio-8B-Thinking (este) | ~9,05 B | No disponible | en, zh | Apache 2.0 | Codificador propio a 12,5 Hz, DeepStack, timestamps, modo thinking con RL |
| MOSS-Audio-8B-Instruct | No disponible | No disponible | en, zh | Apache 2.0 | Misma base sin cadena de razonamiento; orientado a instrucciones directas y menor latencia |
| MOSS-Audio-4B-Thinking | No disponible | No disponible | en, zh | Apache 2.0 | Versión reducida de la familia; menor huella de VRAM a costa de capacidad |
| Qwen2-Audio (variante 7B) | ~8,2 B (aproximado) | No disponible | Multilingüe, incluye en y zh | Apache 2.0 | Modelo audio-texto de Alibaba; no se documenta alineación temporal nativa equivalente en la información disponible |
| Kimi-Audio-7B-Instruct | ~7 B (aproximado) | No disponible | en, zh | Licencia tipo MIT modificada | Modelo de comprensión y generación de audio de Moonshot AI |
| Audio Flamingo 3 | ~7 B (aproximado) | No disponible | en (principalmente) | No comercial (CC BY-NC) | Modelo de NVIDIA; la licencia restringe el uso comercial, a diferencia de MOSS-Audio |

Las cifras de benchmarks de los modelos comparados no se incluyen porque no están disponibles en la información proporcionada; la comparación se limita a tamaño, licencia, idiomas y enfoque técnico declarado.

## Limitaciones y advertencias

- Cobertura lingüística restringida a inglés y chino; el rendimiento en castellano u otros idiomas no está documentado y no debería asumirse.
- Ausencia total de benchmarks publicados: no hay evidencia verificable de calidad frente a alternativas, ni métricas de WER, captioning o QA de audio.
- El razonamiento en modo thinking incrementa la latencia y el consumo de tokens de salida; no es adecuado para casos de uso que exijan respuesta inmediata.
- Riesgo de alucinación en tareas generativas como audio captioning, resumen de reuniones o QA: el modelo puede describir eventos, hablantes o emociones no presentes en el audio, especialmente con audio ruidoso o de baja calidad.
- La granularidad temporal depende del framing del codificador a 12,5 Hz (80 ms), por lo que las marcas temporales no deben tratarse como precisión de muestra.
- Solo se distribuyen pesos en safetensors con código personalizado: obliga a `trust_remote_code=True` y a auditar el código remoto antes de desplegar en producción; no hay variantes GGUF/AWQ/GPTQ ni soporte documentado en llama.cpp, Ollama o vLLM.
- No se documentan procesos de alineación de seguridad, mitigación de sesgos ni evaluación de robustez frente a audio adversario.
- La ficha corresponde a una réplica no oficial (`ArchiveStudio`) con 0 descargas y 0 likes, creada y actualizada el mismo día; para producción conviene usar el repositorio original de OpenMOSS-Team y verificar la integridad de los pesos.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución, pero no se especifican términos adicionales sobre los datos de entrenamiento ni garantías por parte de los autores.
- No se documenta la longitud máxima de audio de entrada, lo que impide planificar el troceado (chunking) de grabaciones largas sin pruebas empíricas.

## Enlaces

- Modelo en HuggingFace (réplica analizada): https://huggingface.co/ArchiveStudio/MOSS-Audio-8B-Thinking
- Repositorio original en HuggingFace (OpenMOSS-Team): https://huggingface.co/collections/OpenMOSS-Team/moss-audio
- Página del proyecto y blog: https://openmoss.ai/MOSS-Audio/
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-Audio
- README en GitHub: https://github.com/OpenMOSS/MOSS-Audio/blob/main/README.md
- ModelScope: https://www.modelscope.cn/models/openmoss/MOSS-Audio-8B-Thinking
- Réplica adicional en HuggingFace: https://huggingface.co/Jinstudio/MOSS-Audio-8B-Thinking

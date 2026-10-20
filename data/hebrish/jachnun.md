# Hebrish/Jachnun

## Resumen

Jachnun es un modelo de reconocimiento automático del habla (ASR) publicado por el usuario Hebrish en HuggingFace, obtenido por ajuste fino (fine-tuning) del checkpoint `nvidia/parakeet-tdt-0.6b-v2`. Su objetivo concreto es transcribir habla con alternancia de código (code-switching) hebreo-inglés, es decir, conversaciones en las que el hablante mezcla ambas lenguas dentro de la misma frase, un fenómeno muy habitual en la comunidad tecnológica y académica israelí. El modelo se distribuye como checkpoint de NVIDIA NeMo y se etiqueta explícitamente con los descriptores `code-switching`, `speaker-adaptation`, `hebrew` y `english`.

Arquitectónicamente hereda la arquitectura TDT (Token-and-Duration Transducer) del modelo base, con aproximadamente 0,6 mil millones de parámetros. El ajuste se realizó sobre una mezcla de corpus de lectura en voz alta y frases mixtas hebreo-inglés, según los datasets declarados en la model card: `danielrosehill/Read-Aloud-Voice-Sentences`, `danielrosehill/English-Hebrew-Codeswitching-Sentences`, `Hebrish/English-Hebrew-Mixed-Sentences` y `openslr/librispeech_asr`.

Su relevancia ahora es doble: por un lado, cubre un hueco poco atendido por los modelos ASR multilingües generalistas, que suelen degradarse en los puntos de conmutación de lengua; por otro, es un ejemplo de ajuste fino ligero y de bajo coste sobre un modelo base abierto de NVIDIA. Conviene señalar que el repositorio tiene acceso restringido (gated), no registra descargas ni valoraciones y no publica resultados de benchmarks, por lo que su calidad real debe validarse antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) de NVIDIA NeMo; heredada del modelo base `nvidia/parakeet-tdt-0.6b-v2` |
| Parametros totales | 0,6 mil millones (heredados del modelo base; no se documenta un cambio en el ajuste fino) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR de audio; no se documenta la ventana de audio ni la longitud máxima de segmento) |
| Tipos de cuantizacion | no disponible (el repositorio no documenta variantes cuantizadas) |
| Idiomas soportados | inglés (`en`) y hebreo (`he`), con soporte declarado de code-switching entre ambos |
| Licencia | CC-BY-4.0 |
| Formato de pesos | checkpoint `.nemo` de NVIDIA NeMo (tamaño del repositorio: 2,5 GB); no se documentan pesos sueltos en safetensors ni GGUF |

Otros datos de la ficha de HuggingFace: pipeline `automatic-speech-recognition`, librería `nemo`, acceso restringido sujeto a aceptación de condiciones, creado y actualizado el 19 de octubre de 2026, región `us`.

## Arquitectura y entrenamiento

El modelo emplea la arquitectura TDT (Token-and-Duration Transducer), una variante de transducer RNNT en la que el predictor emite conjuntamente el token y una predicción de duración. Esta familia de modelos ASR no autorregresiva ofrece streaming nativo y una latencia muy contenida en comparación con los modelos encoder-decoder con decodificación completa, a cambio de una menor explotación del contexto acústico global. El checkpoint base, Parakeet TDT 0.6B v2 de NVIDIA, está entrenado principalmente para inglés y se distribuye con licencia CC-BY-4.0, lo que permite el ajuste fino y la redistribución con atribución.

El fine-tuning de Jachnun se orienta a dos ejes: cobertura de hebreo y robustez en puntos de conmutación hebreo-inglés. Los datasets declarados combinan corpus de frases leídas en voz alta (`danielrosehill/Read-Aloud-Voice-Sentences`), frases específicas de code-switching (`danielrosehill/English-Hebrew-Codeswitching-Sentences` y `Hebrish/English-Hebrew-Mixed-Sentences`) y LibriSpeech ASR (`openslr/librispeech_asr`) como anclaje de inglés limpio. La etiqueta `speaker-adaptation` sugiere que parte del ajuste se hizo sobre voces concretas, lo cual es relevante para el rendimiento: un modelo adaptado a un hablante puede degradarse frente a voces no vistas.

No se especifican en la información disponible el número de tokens o de horas de audio empleadas, la composición exacta de la mezcla, la proporción entre habla espontánea y habla leída, ni si se aplicaron etapas de RLHF, DPO u optimización similar. Tampoco se documentan innovaciones técnicas adicionales más allá de las heredadas del transducer TDT. Cualquier afirmación sobre calidad del ajuste requeriría una evaluación reproducible que el repositorio no aporta.

## Capacidades

- Transcripción de voz a texto en inglés y en hebreo, incluyendo enunciados con alternancia de código dentro de la misma frase.
- Reconocimiento de términos técnicos y anglicismos insertados en discurso hebreo, que es el escenario declarado del ajuste.
- Adaptación a hablante (speaker adaptation) según la etiqueta del repositorio: el modelo puede haberse especializado en un conjunto reducido de voces.
- Inferencia ASR de tipo transducer, apta para flujo continuo con latencia baja, aunque no se documenta el modo streaming de forma explícita.
- Integración con el ecosistema NVIDIA NeMo para carga, evaluación y exportación del checkpoint.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio de entrada más allá del propio ASR, puntuación automática ni diarización de hablantes.

## Casos de uso

- Transcripción de reuniones de equipos israelíes con documentación en inglés: el modelo está ajustado precisamente para enunciados que alternan hebreo e inglés, de modo que evita el corte o la traducción forzada que sufren los ASR monolingües en los puntos de conmutación.
- Subtitulado de contenido audiovisual (podcasts, charlas técnicas, webinars): al partir de un transducer, la generación de hipótesis es incremental y encaja en pipelines de subtitulado casi en tiempo real con revisión humana posterior.
- Analítica de contact center en Israel: transcripción de llamadas donde el cliente habla hebreo y el agente introduce terminología de producto en inglés, para su posterior clasificación y control de calidad.
- Dictado personalizado con adaptación a hablante: el etiquetado `speaker-adaptation` lo hace candidato para un asistente de dictado de un usuario concreto, siempre que se valide con esa voz y no con voces nuevas.
- Investigación lingüística sobre code-switching: generación de transcripciones anotadas de corpus hebreo-inglés para estudiar patrones de cambio de lengua, distribución de anglicismos y fenómenos de interfaz sintáctica.
- Preprocesado de voz en pipelines de agentes conversacionales: la transcripción se usa como primer eslabón antes de un LLM que gestione la respuesta, aprovechando la baja latencia de la arquitectura transducer.
- Evaluación comparativa de ASR en entornos académicos: banco de pruebas para medir la degradación de modelos multilingües generalistas frente a un ajuste fino específico de code-switching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Jachnun | Modelo base (parakeet-tdt-0.6b-v2) | Referencia (Whisper large-v3) |
|---|---|---|---|
| WER hebreo | no disponible | no disponible | no disponible |
| WER inglés | no disponible | no disponible | no disponible |
| WER code-switching hebreo-inglés | no disponible | no disponible | no disponible |
| CER / otras métricas ASR | no disponible | no disponible | no disponible |

El repositorio no incluye tabla de resultados, conjunto de evaluación retenido ni script de reproducción. Cualquier cifra que se cite para este modelo debe provenir de una evaluación propia sobre un corpus etiquetado de habla mixta hebreo-inglés.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación aritmética a partir de 0,6 B de parámetros, no verificada por el autor): en fp32 en torno a 2,4 GB de pesos; en fp16/bf16 en torno a 1,2 GB; el consumo real añade memoria para buffers de decoder, features acústicas y overhead de NeMo, por lo que conviene reservar 3-6 GB en total.
- GPU recomendadas: tarjetas de datacenter tipo A100, H100 o L40S para despliegue concurrente y por lotes; tarjetas de consumo tipo RTX 4090, RTX 4080, RTX 3090 o RTX 4070 Ti para uso individual.
- Cabe holgadamente en GPU de consumo, incluida gama media con 8 GB de VRAM o más, al tratarse de un modelo de 0,6 B. También es viable en CPU para transcripción por lotes no interactiva, con throughput sensiblemente menor.
- Opciones de despliegue: NVIDIA NeMo (carga nativa del checkpoint `.nemo`), exportación a ONNX o TensorRT para inferencia optimizada, y servidores de inferencia ASR compatibles con RNNT/TDT. No se documentan integraciones con llama.cpp, Ollama, vLLM ni TGI, que no son la vía habitual para modelos transducer de NeMo.
- Latencia y throughput: no disponibles. En un transducer TDT la latencia por segmento es baja por diseño, pero no hay cifras publicadas para este checkpoint ni datos de RTF (real-time factor).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / audio | Licencia | Disponibilidad | Benchmarks públicos |
|---|---|---|---|---|---|---|
| Hebrish/Jachnun | 0,6 B | en, he (code-switching) | no disponible | CC-BY-4.0 | Gated en HuggingFace | No publicados |
| nvidia/parakeet-tdt-0.6b-v2 | 0,6 B | en | no disponible | CC-BY-4.0 | Público en HuggingFace | Métricas publicadas por NVIDIA en su model card (no replicadas aquí) |
| OpenAI Whisper large-v3 | 1,55 B | multilingüe, incluido hebreo | ventanas de audio de 30 s | Apache-2.0 | Público | Métricas publicadas por OpenAI (no replicadas aquí) |

Frente al modelo base, Jachnun añade cobertura de hebreo y code-switching a costa de perder la validación y el soporte de un checkpoint oficial de NVIDIA. Frente a Whisper large-v3, ofrece un orden de magnitud menos de parámetros y una arquitectura no autorregresiva potencialmente más rápida en streaming, pero carece de la validación multilingüe amplia y del ecosistema de herramientas del modelo de OpenAI. Para hebreo puro existen fine-tunes específicos de Whisper publicados por la comunidad (por ejemplo, la familia de modelos de ivrit.ai), que no se han podido verificar con la información disponible y que deberían compararse empíricamente antes de elegir.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de mejora sobre el modelo base ni de calidad absoluta en hebreo o en code-switching.
- Señales de validación débiles: 0 descargas y 0 valoraciones en el momento de la consulta, repositorio creado y actualizado el mismo día, lo que sugiere un artefacto sin uso comunitario contrastado.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos, lo que puede bloquear pipelines automatizados.
- Posible sobreajuste a hablante: la etiqueta `speaker-adaptation` implica que el modelo puede haber sido ajustado sobre pocas voces y degradarse con hablantes no vistos o con acentos distintos.
- Dominio de entrenamiento basado mayoritariamente en frases leídas: el habla espontánea, con disfluencias, solapamientos y ruido de fondo, puede estar peor cubierta que la lectura controlada.
- Riesgo de alucinación típico de los modelos transducer en tramos de silencio, ruido o audio musical: pueden emitir texto plausible sin correspondencia acústica.
- Sesgos no documentados: no se publica información sobre distribución de género, edad, origen o tipo de micrófono de los datos de ajuste.
- Idiomas limitados a inglés y hebreo; no hay soporte declarado de castellano ni de otras lenguas.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución explícita al autor y al modelo base, y no ofrece garantías. Conviene revisar también los términos del checkpoint de NVIDIA subyacente.
- No se documentan puntuación, capitalización, marcas de tiempo ni diarización; si el caso de uso las requiere, habrá que añadir etapas posteriores.
- No hay información sobre el proceso de anotación ni la calidad de los datasets de code-switching empleados, lo que impide evaluar el ruido de etiquetas.
- Nota sobre la búsqueda web: los resultados disponibles no contenían información técnica ni enlaces relevantes sobre este modelo; no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hebrish/Jachnun
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Dataset `danielrosehill/Read-Aloud-Voice-Sentences`: https://huggingface.co/datasets/danielrosehill/Read-Aloud-Voice-Sentences
- Dataset `danielrosehill/English-Hebrew-Codeswitching-Sentences`: https://huggingface.co/datasets/danielrosehill/English-Hebrew-Codeswitching-Sentences
- Dataset `Hebrish/English-Hebrew-Mixed-Sentences`: https://huggingface.co/datasets/Hebrish/English-Hebrew-Mixed-Sentences
- Dataset `openslr/librispeech_asr`: https://huggingface.co/datasets/openslr/librispeech_asr
- Documentación de NVIDIA NeMo (framework de carga del checkpoint): https://docs.nvidia.com/nemo-framework/
- Paper, blog o demo específicos del modelo: no disponible en la información proporcionada.

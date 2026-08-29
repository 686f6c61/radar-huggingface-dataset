# bihungba1101/MOSS-Audio-4B-Instruct-FP8-Dynamic

## Resumen

MOSS-Audio-4B-Instruct-FP8-Dynamic es una cuantización dinámica en FP8 del modelo MOSS-Audio-4B-Instruct, desarrollada por el usuario bihungba1101 mediante las herramientas `llm-compressor` y `compressed-tensors`. El modelo original, creado por el equipo OpenMOSS (MOSI.AI, OpenMOSS y Shanghai Innovation Institute), es un modelo multimodal de comprensión de audio que unifica tareas como reconocimiento de habla, análisis de sonidos ambientales, comprensión musical, generación de descripciones de audio y razonamiento temporal sobre pistas de audio.

Esta versión cuantizada reduce el peso de las capas lineales del modelo de lenguaje a FP8 con activaciones dinámicas también en FP8, manteniendo la ruta de audio (encoder, adaptador y fusiones) en BF16. El objetivo es facilitar el despliegue en GPUs con menos memoria sin sacrificar de forma significativa la calidad de la comprensión auditiva. El modelo tiene 5.222.820.736 parámetros (5,22 mil millones) y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial.

La relevancia de esta ficha radica en que ofrece una alternativa optimizada para entornos de producción donde la memoria de GPU es limitada, y ha sido verificada con vLLM 0.28.0 en una RTX 5090, aunque el contexto probado (2048 tokens) no es el máximo arquitectónico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal audio-texto (encoder de audio + modelo de lenguaje), arquitectura exacta no especificada |
| Parametros totales | 5.222.820.736 (5,22 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada; probado con 2048 tokens en vLLM |
| Tipos de cuantizacion | FP8 dinamico (W8A8) en capas Linear del LM; BF16 en encoder de audio, adaptador, fusiones, embeddings y lm_head |
| Idiomas soportados | No especificados |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, FP8 dinamico) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo original no se detalla en la informacion disponible. Se sabe que es un modelo multimodal que procesa audio y texto, con un encoder de audio, un adaptador de audio a lenguaje, y un modelo de lenguaje que genera respuestas textuales. La cuantizacion FP8 dinamica se aplica exclusivamente a las capas `Linear` del modelo de lenguaje, mientras que la ruta de audio completa (encoder, adaptador y fusiones) se mantiene en BF16 para preservar la fidelidad de la extraccion de caracteristicas acusticas.

La cuantizacion es data-free: no se utilizo ningun conjunto de calibracion, ya que la cuantizacion dinamica de activaciones no requiere datos. El proceso se realizo con `llm-compressor 0.11.0` y `compressed-tensors 0.16.0` sobre una NVIDIA GeForce RTX 5090. No se dispone de informacion sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO).

## Capacidades

- Comprension de habla: transcripcion, evaluacion de pronunciacion, fluidez, prosodia, claridad, ritmo, estres e entonacion.
- Comprension de sonidos ambientales: identificacion y razonamiento sobre eventos acusticos no verbales.
- Comprension musical: analisis de genero, instrumentos, estructura y caracteristicas sonoras.
- Generacion de descripciones de audio (audio captioning): producir texto descriptivo a partir de una pista de audio.
- Razonamiento temporal: responder preguntas que requieren entender el orden y la duracion de eventos dentro del audio.
- Razonamiento complejo multi-paso: combinar informacion acustica y contextual para inferencias avanzadas.
- Soporte de tool calling: no especificado.
- Capacidades multilingues: no especificadas.
- No incluye vision ni otras modalidades.

## Casos de uso

- Evaluacion automatizada de pronunciacion en aprendizaje de idiomas: el modelo puede analizar grabaciones de estudiantes y proporcionar retroalimentacion detallada sobre pronunciacion, fluidez, prosodia y ritmo, como se muestra en el ejemplo de la model card.
- Analisis de audio ambiental para seguridad o monitorizacion: detectar y describir sonidos como alarmas, cristales rotos o conversaciones en entornos controlados, con capacidad de razonar sobre la secuencia temporal de los eventos.
- Transcripcion y comprension de reuniones: procesar grabaciones de reuniones para extraer informacion contextual, identificar hablantes y responder preguntas sobre lo discutido, gracias a su capacidad de razonamiento temporal.
- Asistencia para personas con discapacidad auditiva: generar descripciones textuales de sonidos ambientales, musica o eventos acusticos en tiempo real, mejorando la accesibilidad.
- Moderacion de contenido de audio: analizar podcasts, llamadas o transmisiones para detectar lenguaje ofensivo, discursos de odio o contenido inapropiado, con comprension del contexto sonoro.
- Analisis musical para plataformas de streaming: clasificar generos, identificar instrumentos y generar metadatos descriptivos a partir de pistas de audio, aprovechando la capacidad de captioning y razonamiento musical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original MOSS-Audio-8B-Thinking (una variante mas grande) alcanza una precision media de 70,80 en benchmarks de comprension de audio, pero no hay datos especificos para la version 4B-Instruct ni para esta cuantizacion FP8.

## Requisitos de hardware

- VRAM estimada: con 5,22 B de parametros en FP8, los pesos ocupan aproximadamente 5,2 GB. Con contexto de 2048 tokens y overhead de activaciones y KV cache, se estima un consumo total de 6-8 GB, aunque no hay datos oficiales.
- GPU recomendadas: la cuantizacion se realizo en una RTX 5090 (32 GB), pero para inferencia con contexto corto podria caber en GPUs consumer de 8-12 GB como RTX 4060 Ti 16GB, RTX 4070 o RTX 3080. Para produccion con contexto mayor, se recomiendan GPUs de 16 GB o mas (RTX 4090, A10, A100).
- Despliegue: verificado con vLLM 0.28.0 usando `--trust-remote-code` y `--enforce-eager`. Tambien es compatible con cualquier framework que soporte `compressed-tensors` (por ejemplo, TGI si se adapta).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. Las alternativas mas cercanas son:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MOSS-Audio-4B-Instruct (original) | 5,22 B | No especificado | Apache-2.0 | Version sin cuantizar, misma arquitectura |
| MOSS-Audio-8B-Thinking | ~8 B | No especificado | Apache-2.0 | Variante mas grande con mejor rendimiento (70,80 media) |
| Qwen2-Audio | No disponible | No disponible | Apache-2.0 | Modelo de audio de Alibaba, sin datos de comparacion |

No hay benchmarks publicados que permitan comparar directamente esta cuantizacion con otros modelos de audio.

## Limitaciones y advertencias

- La cuantizacion FP8 puede introducir una ligera degradacion en tareas de razonamiento complejo o en la precision de transcripcion, aunque no se han cuantificado los efectos.
- El contexto probado es de 2048 tokens, que puede ser insuficiente para audios largos; se debe aumentar `--max-model-len` si el audio genera mas tokens de prompt, lo que incrementa el consumo de VRAM.
- No se especifican los idiomas soportados; el modelo original podria tener limitaciones en idiomas distintos del ingles o chino.
- La cuantizacion fue realizada por un tercero (bihungba1101), no por el equipo original de OpenMOSS, por lo que no hay garantia oficial de calidad ni soporte.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de atribucion y las condiciones de la licencia del modelo base.
- No se han publicado evaluaciones de sesgos o alucinaciones especificas para esta version.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/bihungba1101/MOSS-Audio-4B-Instruct-FP8-Dynamic
- Modelo original en HuggingFace: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-4B-Instruct
- Repositorio GitHub de MOSS-Audio: https://github.com/OpenMOSS/MOSS-Audio
- Pagina oficial de MOSS-Audio: https://openmoss.ai/MOSS-Audio/
- Modelo en ModelScope: https://www.modelscope.cn/models/openmoss/MOSS-Audio-4B-Instruct
- Dataset de prueba usado en la verificacion: https://huggingface.co/datasets/bihungba1101/speech_attempt_raw

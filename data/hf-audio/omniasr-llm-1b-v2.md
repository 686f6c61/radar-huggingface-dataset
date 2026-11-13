# hf-audio/omniasr-llm-1b-v2

## Resumen

OmniASR LLM 1B v2 es un modelo de reconocimiento automático del habla (ASR) publicado por el equipo `hf-audio` en Hugging Face, construido sobre una arquitectura de tipo transformer con un backbone de lenguaje y entrenado sobre el corpus `facebook/omnilingual-asr-corpus`. Su rasgo más distintivo es la cobertura lingüística: la model card declara soporte para más de un millar de códigos ISO 639-3, desde lenguas con millones de hablantes (eng, spa, cmn, arb) hasta lenguas minoritarias y de bajos recursos (por ejemplo, variedades papúes, lenguas nilóticas o amerindias). El identificador incluye el sufijo `-llm-`, lo que sugiere que el componente de decodificación es un modelo de lenguaje que opera sobre representaciones acústicas, aunque la model card no detalla la composición exacta del pipeline.

El modelo tiene 2.286.560.768 parámetros según los pesos en safetensors, un tamaño de repositorio de 9,1 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Está etiquetado con `pipeline_tag: automatic-speech-recognition` y es compatible con `transformers` y con endpoints de Hugging Face.

Su relevancia actual reside en la combinación de tres factores: cobertura masiva de lenguas infrarrepresentadas, un tamaño de parámetros contenido (2,3 B) que permite despliegue en infraestructura modesta, y una licencia permisiva. No obstante, la información pública disponible es escasa: no se han publicado detalles de arquitectura, datos de entrenamiento ni resultados de benchmarks en la documentación accesible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con backbone de lenguaje (detalles no disponibles) |
| Parámetros totales | 2.286.560.768 |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Más de 1.000 códigos ISO 639-3 (aae, aal, abb, ..., zza) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La model card no proporciona una descripción detallada de la arquitectura interna. El nombre `omniasr-llm-1b-v2` y la etiqueta `text-generation` junto a `automatic-speech-recognition` apuntan a un diseño en el que un codificador acústico se acopla a un modelo de lenguaje que genera la transcripción como secuencia de tokens. El recuento real de parámetros (2,29 B) supera el "1B" del nombre, lo que puede deberse a que el sufijo hace referencia al componente LLM y no al total del sistema, o a un redondeo del identificador.

El entrenamiento se realizó sobre el dataset `facebook/omnilingual-asr-corpus`, según la metadata del repositorio. No se especifican en la información disponible el número de tokens de audio, la composición exacta del corpus, la proporción por lengua ni si se aplicaron etapas de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas concretas como decodificación especulativa, atención lineal o mecanismos de adaptación lingüística. El artículo asociado es arXiv:2511.09690, que presumiblemente contiene estos detalles, pero su contenido no forma parte de la información proporcionada.

## Capacidades

- Reconocimiento automático del habla en más de mil lenguas y variedades dialectales, identificadas mediante códigos ISO 639-3.
- Transcripción de audio a texto con un modelo de 2,29 B de parámetros, adecuado para despliegue en una sola GPU.
- Cobertura de lenguas de bajos recursos, incluyendo variedades africanas, asiáticas, oceánicas y amerindias poco representadas en modelos ASR convencionales.
- Integración con la librería `transformers` y con el pipeline `automatic-speech-recognition`.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible` en la metadata).
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento explícito.

## Casos de uso

- Transcripción de archivos de audio en lenguas minoritarias: el modelo permite generar subtítulos o actas para comunidades con lenguas que los sistemas ASR comerciales no cubren, usando el código ISO 639-3 correspondiente como identificador de lengua.
- Subtitulado automático de contenido audiovisual multilingüe: al soportar más de mil lenguas, un mismo pipeline puede procesar un catálogo de vídeos en decenas de idiomas sin cambiar de modelo, reduciendo la complejidad operativa.
- Digitalización de archivos orales etnográficos y lingüísticos: investigadores pueden transcribir grabaciones de campo en lenguas amenazadas y obtener texto alineado para análisis o preservación.
- Atención al cliente en regiones multilingües: transcripción de llamadas en lenguas locales para su posterior análisis, enrutamiento o generación de resúmenes, con la ventaja de una licencia Apache 2.0 que permite uso comercial.
- Accesibilidad: generación de subtítulos en tiempo casi real para personas con discapacidad auditiva en contextos donde la lengua vehicular no es una de las mayoritarias.
- Procesamiento por lotes en infraestructura propia: con 2,29 B de parámetros y pesos safetensors, el modelo cabe en GPUs de gama alta de consumo y puede servirse con `transformers` o con frameworks de inferencia compatibles, sin depender de APIs externas.
- Investigación en ASR multilingüe: serviría como línea base o punto de comparación para estudiar transferencia entre lenguas y comportamiento en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4,6 GB solo para pesos (2,29 B × 2 bytes), más memoria para activaciones y buffers de audio; en la práctica, entre 6 y 8 GB según la longitud del audio y el tamaño de lote.
- En cuantización de 8 bits: alrededor de 2,3 GB para pesos; en 4 bits, alrededor de 1,2 GB, aunque no se documentan formatos de cuantización soportados oficialmente.
- GPU recomendadas para producción: A100 40/80 GB o H100 para lotes grandes y alto throughput; L40S o RTX 6000 Ada para despliegues de gama media.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti (12 GB) e incluso en GPUs de 8 GB con cuantización, siempre que el framework lo permita.
- Opciones de despliegue: `transformers` (librería declarada), endpoints de Hugging Face; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniASR LLM 1B v2 | 2,29 B | No disponible | >1.000 (ISO 639-3) | Apache 2.0 | Hugging Face |
| Whisper large-v3 (OpenAI) | 1,55 B | 30 s de audio | ~99 lenguas | MIT | Hugging Face, OpenAI |
| MMS (Meta) | ~1 B (por lengua) | No disponible | >1.100 lenguas | CC-BY-NC 4.0 | Hugging Face |
| SeamlessM4T v2 (Meta) | ~2,3 B | No disponible | ~100 lenguas de entrada | CC-BY-NC 4.0 | Hugging Face |

La comparación se limita a parámetros, cobertura lingüística y licencia, ya que no hay datos de benchmarks publicados para OmniASR en la información disponible. Frente a Whisper, OmniASR ofrece una cobertura lingüística mucho mayor y una licencia Apache 2.0 más permisiva que la CC-BY-NC de MMS y SeamlessM4T, aunque carece de la documentación y el ecosistema de herramientas de Whisper.

## Limitaciones y advertencias

- Ausencia de benchmarks públicos en la información disponible: no es posible evaluar la calidad de transcripción por lengua ni comparar objetivamente con alternativas.
- La model card no documenta sesgos conocidos, pero un modelo entrenado sobre un corpus multilingüe desbalanceado probablemente presente rendimiento muy desigual entre lenguas con muchos y pocos datos.
- Riesgo de alucinación en la transcripción: los modelos ASR basados en LLM pueden generar texto plausible que no corresponde al audio, especialmente en segmentos ruidosos o en lenguas de bajos recursos.
- Cobertura nominal frente a cobertura real: los más de mil códigos ISO 639-3 declarados no garantizan una calidad uniforme; muchas lenguas pueden tener datos de entrenamiento mínimos.
- No se documentan la longitud máxima de audio procesable ni el comportamiento con audio largo; habrá que validarlo empíricamente.
- Licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento de normativas de privacidad al procesar audio de terceros.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un modelo recién publicado y sin validación comunitaria.
- No se confirma soporte de cuantización ni de frameworks de inferencia optimizados, lo que puede limitar el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hf-audio/omniasr-llm-1b-v2
- Artículo asociado: https://arxiv.org/abs/2511.09690
- Dataset de entrenamiento: https://huggingface.co/datasets/facebook/omnilingual-asr-corpus

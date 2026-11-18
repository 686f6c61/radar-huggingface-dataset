# ARTPARK-IISc/SraVaani-1.0

## Resumen

SraVaani-1.0 es un modelo de reconocimiento automático del habla (ASR) desarrollado por ARTPARK-IISc, un centro de investigación vinculado al Indian Institute of Science (IISc) de Bangalore. El modelo se distribuye a través de Hugging Face con el identificador `ARTPARK-IISc/SraVaani-1.0` y está diseñado específicamente para la transcripción de voz en lenguas indias, un ámbito tradicionalmente desatendido por los sistemas ASR comerciales, que suelen concentrar su cobertura en inglés y un puñado de idiomas mayoritarios.

La relevancia del modelo radica en su cobertura lingüística: cubre quince idiomas, entre ellos hindi, kannada, malayalam, télugu, guyaratí, panyabí, oriya, bengalí, tamil, asamés, sánscrito, nepalí, maratí e inglés, además del hindi como lengua principal. Esta amplitud lo convierte en una pieza potencialmente útil para aplicaciones de accesibilidad, subtitulado y digitalización de contenido en el sur de Asia. El modelo se publica bajo licencia MIT, aunque el acceso al repositorio está restringido y requiere aceptar condiciones en Hugging Face.

El repositorio ocupa 0,9 GB, lo que sugiere un modelo de tamaño moderado, adecuado para despliegue en infraestructura convencional. El modelo se etiqueta con el identificador `sravaani_tdt`, lo que apunta a una arquitectura de tipo Token-and-Duration Transducer (TDT), una variante de los transductores neuronales que modela conjuntamente tokens y duraciones. No se dispone de información pública detallada sobre el número exacto de parámetros ni sobre la longitud de contexto en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), según la etiqueta `sravaani_tdt` |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hi, kn, ml, te, en, gu, pa, or, bn, ta, as, sa, ne, mr (15 idiomas) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,9 GB; requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura de transductor neuronal, concretamente una variante TDT (Token-and-Duration Transducer). Los transductores combinan un codificador acústico con un predictor y una red de unión para alinear secuencias de audio y texto sin necesidad de un modelo de lenguaje externo, lo que los hace adecuados para ASR en streaming y en entornos con recursos limitados. La variante TDT añade un modelado explícito de la duración de cada token, lo que puede mejorar la eficiencia y la precisión en la alineación.

El modelo se entrenó con los conjuntos de datos `ARTPARK-IISc/Vaani` y `ARTPARK-IISc/Vaani-transcription-part`, según las etiquetas del repositorio. No se dispone de información detallada sobre el número de horas de audio, la composición exacta del dataset, ni sobre si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. El repositorio incluye código personalizado (`custom_code`), lo que implica que la carga del modelo requiere confiar en implementaciones proporcionadas por el autor y no en clases estándar de las librerías de inferencia.

## Capacidades

- Reconocimiento automático del habla (ASR) en quince idiomas indios e inglés.
- Transcripción de audio a texto con soporte para hindi, kannada, malayalam, télugu, guyaratí, panyabí, oriya, bengalí, tamil, asamés, sánscrito, nepalí y maratí.
- Modelado de duración de tokens mediante la arquitectura TDT, potencialmente útil para alineación temporal.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente.
- No se ha documentado soporte de visión, audio generativo ni modo de razonamiento explícito.
- Capacidades multilingües limitadas a los idiomas listados; no se ha documentado cobertura de otros idiomas.

## Casos de uso

- Subtitulado automático de vídeo en lenguas indias: el modelo puede transcribir audio de contenido audiovisual en hindi, tamil o bengalí, facilitando la accesibilidad y la distribución de contenido regional.
- Digitalización de archivos sonoros: instituciones culturales y medios de comunicación pueden transcribir entrevistas, programas de radio y grabaciones históricas en lenguas indias para crear corpus textuales searchables.
- Atención al cliente en centros de contacto: integración en sistemas de transcripción de llamadas para idiomas como hindi, maratí o télugu, permitiendo análisis de calidad y generación de actas.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo real o diferido de reuniones y clases en lenguas indias.
- Investigación lingüística y corpus: creación de corpus anotados a partir de audio en sánscrito, nepalí o asamés, idiomas con recursos digitales escasos.
- Sistemas de voz a texto para administración pública: transcripción de declaraciones y trámites orales en lenguas regionales para su procesamiento documental.
- Integración en pipelines de búsqueda y análisis de audio: indexación de contenido hablado en múltiples idiomas para motores de búsqueda internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,9 GB) sugiere que el modelo puede caber en GPUs de consumo, pero no se confirma el número de parámetros ni el consumo real.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño del repositorio, pero no confirmado.
- Opciones de despliegue: no se ha documentado compatibilidad con vLLM, llama.cpp, Ollama o TGI; el modelo requiere `custom_code`, lo que puede limitar su uso a implementaciones específicas del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SraVaani-1.0 | no disponible | no disponible | 15 (indios + inglés) | MIT | Gated en Hugging Face |
| Whisper (OpenAI) | 39M–1.55B según variante | 30 s de audio | ~99 idiomas | MIT | Abierto |
| IndicWav2Vec | no disponible | no disponible | lenguas indias | no disponible | Hugging Face |
| AI4Bharat IndicWhisper | no disponible | no disponible | lenguas indias | no disponible | Hugging Face |

La comparación con Whisper es la más directa en cuanto a funcionalidad ASR multilingüe, aunque Whisper cubre un espectro lingüístico mucho más amplio y cuenta con benchmarks públicos extensos. Los modelos de AI4Bharat están más especializados en lenguas indias y podrían ser alternativas más cercanas en dominio, pero no se dispone de datos comparativos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en entornos automatizados o de investigación sin intervención manual.
- Dependencia de `custom_code`: la carga del modelo requiere código personalizado del autor, lo que implica riesgos de seguridad y mantenimiento a largo plazo.
- Sesgos desconocidos: no se ha documentado la composición demográfica del dataset de entrenamiento ni posibles sesgos de acento, género o dialecto.
- Riesgo de alucinación: como todo modelo ASR, puede generar transcripciones incorrectas en audio con ruido, acentos no representados o solapamiento de hablantes.
- Cobertura lingüística limitada a los quince idiomas listados; no se ha documentado el rendimiento por idioma ni la calidad relativa entre ellos.
- Licencia MIT permite uso comercial, pero el acceso gated puede añadir condiciones adicionales que deben revisarse antes de su uso en producción.
- No se dispone de información sobre latencia, throughput ni requisitos de hardware, lo que dificulta la planificación de despliegues en producción.
- El modelo no ha sido evaluado en benchmarks públicos según la información disponible, por lo que su calidad relativa frente a alternativas establecidas es incierta.

## Enlaces

- Hugging Face: https://huggingface.co/ARTPARK-IISc/SraVaani-1.0
- Dataset Vaani: https://huggingface.co/datasets/ARTPARK-IISc/Vaani
- Dataset Vaani-transcription-part: https://huggingface.co/datasets/ARTPARK-IISc/Vaani-transcription-part
- Paper (arXiv:2608.08235): https://arxiv.org/abs/2608.08235

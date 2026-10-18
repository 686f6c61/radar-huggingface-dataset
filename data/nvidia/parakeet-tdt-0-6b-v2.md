# nvidia/parakeet-tdt-0.6b-v2

## Resumen
`parakeet-tdt-0.6b-v2` es un modelo de reconocimiento automático del habla (ASR) de NVIDIA, con 600 millones de parámetros, especializado en transcripción de inglés con puntuación, capitalización y marcas de tiempo a nivel de palabra. Forma parte de la familia Parakeet y está pensado para aplicaciones que necesitan transcribir audio de forma precisa y eficiente, no para generación de texto general.

La arquitectura es una variante XL de FastConformer con decodificador TDT y atención completa, lo que le permite procesar segmentos de audio de hasta 24 minutos en una sola pasada. Según la model card, alcanza un RTFx de 3380 en el leaderboard HF-Open-ASR con lote de 128, y se distribuye con licencia CC-BY-4.0, lo que facilita su uso comercial con atribución.

Su relevancia actual está en que ofrece una alternativa abierta y ligera para transcripción inglesa de alta calidad, con marcas de tiempo y buen comportamiento en dominios como reuniones, llamadas de resultados, podcasts y audio largo. No es un modelo multilingüe: la versión multilingüe es `parakeet-tdt-0.6b-v3`, disponible por separado.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer XL con decodificador TDT (Transducer) |
| Parámetros totales | 600 millones (0,6B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | Hasta 24 minutos de audio en una sola pasada; no es una ventana de tokens |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch/NeMo; no se especifica safetensors ni GGUF en la información disponible |

## Arquitectura y entrenamiento
El modelo combina una variante XL de FastConformer, una arquitectura Conformer orientada a ASR, con un decodificador TDT. La model card indica que se entrenó con atención completa y que puede transcribir segmentos de audio de hasta 24 minutos en una sola pasada, lo que reduce la necesidad de segmentar manualmente grabaciones largas. El decodificador TDT está pensado para predecir tanto tokens como duraciones, lo que encaja con la generación de transcripciones y marcas de tiempo.

Los datos de entrenamiento declarados incluyen los conjuntos `nvidia/Granary` y `nvidia/nemo-asr-set-3.0`. No se detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; en cualquier caso, se trata de un modelo supervisado de ASR, no de un LLM generativo. La información disponible no permite evaluar sesgos por composición demográfica o por dominio de forma cuantitativa.

## Capacidades
- Reconocimiento automático del habla en inglés con salida de texto.
- Predicción de marcas de tiempo a nivel de palabra.
- Puntuación y capitalización automáticas.
- Transcripción de audio largo, hasta 24 minutos en una sola pasada según la model card.
- Buen comportamiento declarado en números hablados y transcripción de letras de canciones.
- No soporta tool calling ni function calling.
- No está diseñado para agentes, razonamiento multi-paso ni generación de texto libre.
- No ofrece capacidades de visión, audio generativo, diarización de hablantes ni traducción.
- No es multilingüe: solo inglés. La versión `parakeet-tdt-0.6b-v3` cubre 25 idiomas europeos según la model card.

## Casos de uso
- Transcripción de reuniones: el modelo puede convertir grabaciones de reuniones en texto con puntuación y marcas de tiempo; su WER declarado en AMI es 11,16 %, y la ventana de audio de hasta 24 minutos reduce la fragmentación de actas.
- Subtitulado de webinars y podcasts: con marcas de tiempo a nivel de palabra y puntuación automática, encaja en flujos de generación de subtítulos para contenido hablado en inglés; en TED-LIUM v3 declara un WER de 3,38 %.
- Análisis de llamadas de resultados financieros: puede transcribir `earnings calls` con números hablados y términos financieros; el WER declarado en Earnings-22 es 11,15 % y en SPGI Speech es 2,17 %.
- Control de calidad en atención al cliente: permite transcribir lotes de llamadas para revisar guiones, cumplimiento y calidad; las marcas de tiempo facilitan localizar fragmentos concretos. No incluye diarización nativa, por lo que los roles de agente y cliente requieren un componente externo.
- Dictado y notas de voz: al ser un modelo de 0,6B, puede desplegarse en infraestructura modesta y transcribir notas o documentos dictados en inglés con latencia baja en GPUs de consumo.
- Archivo y búsqueda de grabaciones largas: su capacidad de procesar hasta 24 minutos por pasada permite indexar entrevistas, clases o sesiones de formación con marcas de tiempo para búsqueda posterior.
- Transcripción de contenido musical o con números: la model card destaca robustez en números hablados y letras de canciones, útil para catalogar audio musical o verificar lecturas de cifras.

## Benchmarks y rendimiento
| Dataset | Configuración/split | WER (%) |
|---|---|---:|
| AMI (Meetings test) | `ihm`, test, en | 11,16 |
| Earnings-22 | test, en | 11,15 |
| GigaSpeech | test, en | 9,74 |
| LibriSpeech (clean) | test, en | 1,69 |
| LibriSpeech (other) | test, en | 3,19 |
| SPGI Speech | test, en | 2,17 |
| TED-LIUM v3 | `release1`, test, en | 3,38 |
| Vox Populi | `en`, test, en | 5,95 |

Los valores anteriores son los declarados por NVIDIA en la `model-index` de la model card y no han sido verificados por el editor. Menor WER indica mejor rendimiento. Además, la model card declara un RTFx de 3380 en el leaderboard HF-Open-ASR con lote de 128; el propio autor advierte que el RTFx puede variar según la duración del audio y el tamaño de lote.

## Requisitos de hardware
- VRAM estimada para pesos: aproximadamente 2,4 GB en FP32 y 1,2 GB en FP16/BF16; con overhead de runtime y audio largo, es razonable reservar entre 2 y 4 GB.
- No se documentan cuantizaciones oficiales INT8, INT4, GGUF ni formatos ligeros en la información proporcionada.
- Cabe en GPUs de consumo: una RTX 3060 de 12 GB, RTX 4070 o RTX 4090 es suficiente; para despliegues de alto throughput se recomiendan A100 o H100.
- Opciones de despliegue documentadas: NeMo. El ecosistema NVIDIA menciona Riva y NIM, pero no se detalla una receta concreta en la información disponible.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI para este modelo ASR.
- Throughput declarado: RTFx de 3380 con lote de 128 en HF-Open-ASR. No se proporcionan latencias por petición ni throughput en otras configuraciones.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto/audio | WER LibriSpeech clean | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `parakeet-tdt-0.6b-v2` | 0,6B | Hasta 24 min | 1,69 % | CC-BY-4.0 | HuggingFace |
| `parakeet-tdt-0.6b-v3` | 0,6B según el nombre | No disponible | No disponible | No disponible | HuggingFace según la model card |
| Otras alternativas ASR de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han proporcionado resultados de benchmarks ni especificaciones de modelos alternativos, por lo que no es posible establecer una comparativa cuantitativa fiable con otros ASR. La única alternativa documentada en la model card es `parakeet-tdt-0.6b-v3`, que añade soporte para 25 idiomas europeos, pero sin métricas ni licencia detalladas en la información disponible.

## Limitaciones y advertencias
- Solo soporta inglés; no es adecuado para transcripción multilingüe sin usar otro modelo.
- El WER en dominios difíciles es relevante: 11,16 % en AMI y 11,15 % en Earnings-22, por lo que la transcripción puede requerir revisión humana.
- Puede fallar con ruido, solapamiento de hablantes, acentos marcados, audio de baja calidad o vocabulario muy específico; no se aportan métricas de robustez por subgrupo.
- Como todo ASR, puede insertar palabras o puntuación incorrecta en silencios, ruido o audio ininteligible; conviene validar las salidas antes de usarlas en producción.
- Las marcas de tiempo a nivel de palabra pueden desviarse en audio largo o con música de fondo.
- No incluye diarización de hablantes ni etiquetado de roles; para reuniones o llamadas hace falta un componente adicional.
- La licencia CC-BY-4.0 permite uso comercial según la model card, pero exige atribución y el cumplimiento de sus términos.
- No es un modelo de agentes ni soporta tool calling, function calling o razonamiento multi-paso.
- No se detalla la composición del dataset de entrenamiento, por lo que no se puede evaluar el sesgo demográfico o lingüístico con precisión.
- El audio puede contener datos personales; el despliegue debe incluir controles de privacidad, retención y acceso.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/nvidia/parakeet-tdt-0.6b-v2
- Versión multilingüe v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Colección NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/collections/parakeet-tdt-0.6b-v2
- Documentación de NeMo ASR: https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/asr/models.html
- Documentación de FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode.en
- Paper arXiv 2305.05084: https://arxiv.org/abs/2305.05084
- Paper arXiv 2304.06795: https://arxiv.org/abs/2304.06795
- Paper arXiv 2406.00899: https://arxiv.org/abs/2406.00899
- Paper arXiv 2410.01036: https://arxiv.org/abs/2410.01036
- Paper arXiv 2505.13404: https://arxiv.org/abs/2505.13404
- NVIDIA Developer: https://developer.nvidia.com/
- NVIDIA Riva: https://developer.nvidia.com/riva
- NVIDIA Nemotron: https://developer.nvidia.com/nemotron

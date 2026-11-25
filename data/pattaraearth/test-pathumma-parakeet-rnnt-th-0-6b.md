# pattaraearth/test-pathumma-parakeet-rnnt-th-0.6b

## Resumen

Pathumma STT Fastconformer RNNT Large (TH) es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el usuario pattaraearth, obtenido mediante ajuste fino (fine-tuning) del modelo base nvidia/parakeet-rnnt-0.6b de NVIDIA. Esta disenado especificamente para transcripcion de voz en tailandes e ingles, incluyendo escenarios de cambio de codigo (code-switching) entre ambos idiomas, ruido de fondo y requisitos de inferencia en tiempo real.

El modelo emplea una arquitectura FastConformer-Transducer (RNNT) con aproximadamente 600 millones de parametros, lo que lo situa en la gama media de modelos ASR. Su principal valor anadido reside en la adaptacion al dominio tailandes, un idioma con menor cobertura en los modelos ASR comerciales, manteniendo a la vez capacidades de reconocimiento en ingles.

La relevancia actual del modelo radica en su enfoque en code-switching tailandes-ingles, un fenomeno muy comun en contextos urbanos y profesionales de Tailandia, y en su orientacion a inferencia en tiempo real, lo que lo hace adecuado para aplicaciones de transcripcion en vivo. La licencia CC-BY-4.0 facilita su uso comercial con atribucion. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un modelo reciente o de baja difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Transducer (RNNT) |
| Parametros totales | 0.6B (600 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tailandes (th), ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (libreria NeMo, probablemente .nemo) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastConformer-Transducer, que combina un encoder Conformer con atencion por bloques (blockwise attention) para reducir el coste computacional, junto con un decodificador de tipo Transducer (RNNT) que permite alineamiento monotono y decodificacion en streaming. Esta arquitectura es la empleada por NVIDIA en su familia Parakeet, optimizada para ASR eficiente en tiempo real.

El entrenamiento parte del modelo preentrenado nvidia/parakeet-rnnt-0.6b y se realiza un fine-tuning sobre datos de habla en tailandes e ingles, aunque la model card no especifica el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de aumento de datos o regularizacion. Tampoco se detalla si hubo RLHF o DPO, algo poco habitual en modelos ASR. La innovacion principal es la adaptacion al code-switching th-en y la robustez frente a ruido de fondo, segun declara el autor.

## Capacidades

- Reconocimiento automatico del habla (ASR) en tailandes e ingles.
- Soporte de code-switching tailandes-ingles dentro de una misma utterance.
- Robustez declarada frente a ruido de fondo y condiciones reales de grabacion.
- Inferencia en tiempo real (streaming) gracias a la arquitectura Transducer.
- Transcripcion de audio a texto con metricas WER y CER como referencias de evaluacion.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de ASR.

## Casos de uso

- Transcripcion de reuniones bilingues tailandes-ingles: el modelo puede procesar audio con alternancia de idiomas y generar transcripciones unicas, adecuado para equipos internacionales en Tailandia.
- Subtitulado en vivo para medios de comunicacion: la arquitectura Transducer permite decodificacion en streaming con baja latencia, util para programas de television o retransmisiones.
- Atencion al cliente en centros de llamadas: transcripcion de conversaciones telefonicas con ruido de fondo para analisis posterior de calidad y cumplimiento.
- Generacion de actas y notas de voz en aplicaciones moviles: integracion en apps de productividad que requieran dictado en tailandes con terminos en ingles.
- Analisis de encuestas y entrevistas: procesamiento por lotes de grabaciones para extraer texto y aplicar NLP posterior (sentimiento, topic modeling).
- Accesibilidad para personas con discapacidad auditiva: generacion de subtitulos automaticos en tiempo real en entornos educativos o institucionales.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de archivos historicos para habilitar busqueda por texto en tailandes e ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona las metricas WER y CER como criterios de evaluacion, pero no proporciona valores numericos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 0.6B en precision FP16 se estima un consumo en torno a 1.2-2 GB, y en cuantizacion INT8 alrededor de 0.6-1 GB, aunque estas cifras son estimaciones generales no confirmadas por el autor.
- GPU recomendadas: no disponible; por tamano, cabria en GPUs consumer como RTX 3060, RTX 4060, RTX 4090, asi como en A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 4 GB de VRAM, aunque no hay confirmacion oficial.
- Opciones de despliegue: NeMo (libreria nativa), y potencialmente exportacion a ONNX o TensorRT para optimizacion; no se documentan integraciones con vLLM, llama.cpp u Ollama (no aplicables a ASR).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pattaraearth/test-pathumma-parakeet-rnnt-th-0.6b | 0.6B | th, en | no disponible | CC-BY-4.0 | Hugging Face |
| nvidia/parakeet-rnnt-0.6b (base) | 0.6B | en (principalmente) | no disponible | no disponible | Hugging Face |
| Whisper large-v3 | 1.55B | multilingue | 30 s de audio | MIT | Hugging Face / OpenAI |
| Typhoon ASR (modelos th) | no disponible | th | no disponible | no disponible | Hugging Face |

La comparativa con Whisper large-v3 es relevante por su cobertura multilingue y su licencia permisiva, aunque este ultimo tiene mayor tamano y no esta especializado en code-switching th-en. El modelo base de NVIDIA sirve como referencia directa de partida, pero su cobertura del tailandes es limitada. No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de WER/CER, por lo que el rendimiento real es desconocido y debe validarse en el dominio de uso.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere ausencia de validacion por parte de la comunidad.
- Riesgo de alucinacion en ASR: posibles transcripciones erroneas en audio con ruido extremo, acentos no representados o habla solapada.
- Cobertura limitada a tailandes e ingles; otros idiomas no estan soportados.
- No se especifica la composicion del dataset de fine-tuning, lo que impide evaluar sesgos demograficos o dialectales.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero requiere verificar las condiciones del modelo base nvidia/parakeet-rnnt-0.6b, cuya licencia no se detalla en la informacion disponible.
- La fecha de creacion indicada (2026-11-25) es futura respecto a la fecha habitual de consulta, lo que podria indicar un error en los metadatos.
- No se documentan formatos de cuantizacion ni pesos alternativos (GGUF, ONNX), lo que limita el despliegue en entornos no basados en NeMo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pattaraearth/test-pathumma-parakeet-rnnt-th-0.6b
- Modelo base: https://huggingface.co/nvidia/parakeet-rnnt-0.6b
- Documentacion de NeMo: https://github.com/NVIDIA/NeMo
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.

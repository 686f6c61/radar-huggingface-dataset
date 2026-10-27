# Cohere-AR/cohere-transcribe-ar-sft

## Resumen

Cohere-AR/cohere-transcribe-ar-sft es un modelo de reconocimiento automatico del habla (ASR) especializado en arabe e ingles, desarrollado por Cohere-AR como ajuste fino supervisado (SFT) del modelo base CohereLabs/cohere-transcribe-arabic-07-2026. Con 2.065.770.752 parametros (aproximadamente 2B), se distribuye en formato safetensors bajo la libreria transformers con pipeline `automatic-speech-recognition`. Su interes principal radica en el enfoque explicito en code-switching arabe-ingles y en dominios de telefonia, un escenario donde la mayoria de sistemas ASR genericos pierden precision al alternar idiomas dentro de una misma locucion.

El modelo se publica en un contexto donde la familia Cohere Transcribe ha ganado traccion: la variante cohere-transcribe-03-2026 figura como primera en el Open ASR Leaderboard con un WER medio de 5,42 segun datos de marzo de 2026. Esta version afinada para arabe hereda esa arquitectura y anade especializacion dialectal y de dominio telefonico, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en HuggingFace.

No se dispone de informacion publica sobre el proceso de entrenamiento, composicion del dataset ni resultados de benchmarks especificos de esta variante SFT. La ficha refleja unicamente los datos verificables del repositorio y las referencias cruzadas disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Cohere Transcribe, modelo de reconocimiento automatico del habla; detalles de arquitectura interna no publicados) |
| Parametros totales | 2.065.770.752 (~2,07B) |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para esta variante; existen pesos GGUF para la variante cohere-transcribe-03-2026 (repositorio cstr/cohere-transcribe-03-2026-GGUF) |
| Idiomas soportados | arabe (ar) e ingles (en), con soporte declarado de code-switching |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repositorio: 16,5 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Por la nomenclatura del pipeline (`automatic-speech-recognition`), el tag `cohere_asr` y la familia a la que pertenece, se trata de un modelo encoder-decoder o encoder-only orientado a transcripcion, con 2,07B parametros. El modelo base es CohereLabs/cohere-transcribe-arabic-07-2026, sobre el que se ha aplicado un ajuste fino supervisado (SFT) segun indica el sufijo `-sft` del identificador.

No se han publicado datos sobre volumen de tokens de audio, composicion del dataset, tecnicas de alineacion (RLHF/DPO) ni innovaciones tecnicas especificas de esta variante. Los tags del repositorio indican especializacion en code-switching arabe-ingles y telefonia, lo que sugiere un conjunto de entrenamiento con audio telefonico y locuciones mixtas, pero no se confirma la composicion exacta.

## Capacidades

- Transcripcion de audio a texto en arabe e ingles.
- Manejo de code-switching: alternancia de arabe e ingles dentro de una misma locucion.
- Reconocimiento en dominio telefonico (audio de baja calidad, ancho de banda reducido).
- Integracion con el ecosistema transformers mediante pipeline `automatic-speech-recognition`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se ha documentado soporte de tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Transcripcion de call centers en Oriente Medio: el modelo puede procesar grabaciones de atencion al cliente donde el operador y el usuario alternan arabe e ingles, aprovechando su entrenamiento especifico en code-switching y telefonia para reducir errores en cambios de idioma.
- Subtitulado de reuniones corporativas bilingues: util para empresas con equipos que mezclan arabe e ingles en la misma conversacion, generando transcripciones que evitan la perdida de segmentos por cambio de idioma.
- Analisis de calidad y compliance en telefonia: transcripcion de llamadas para auditoria posterior, busqueda de palabras clave y deteccion de incumplimientos, gracias al enfasis del modelo en audio telefonico.
- Generacion de actas y resumenes a partir de audio: la transcripcion sirve como entrada a un LLM posterior para resumir conversaciones, al ser salida de texto plano compatible con cualquier pipeline.
- Accesibilidad para contenido audiovisual en arabe: transcripcion de videos, podcasts y formacion interna para generar subtitulos en arabe con inserciones en ingles.
- Investigacion en ASR multilingue: el modelo sirve como linea base para estudiar code-switching arabe-ingles y comparar con sistemas genericos en entornos telefonicos.
- Prototipado rapido con transformers: al cargarse con la libreria estandar y disponer de pesos safetensors, puede integrarse en cuadernos y scripts de evaluacion sin conversiones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante concreta. Como referencia de la familia, la variante cohere-transcribe-03-2026 alcanzo un WER medio de 5,42 y el primer puesto en el Open ASR Leaderboard en marzo de 2026, pero estos datos no son extrapolables directamente al ajuste fino en arabe.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 4,1 GB solo para pesos, mas memoria para activaciones y buffers de audio; en la practica, se recomienda un minimo de 8-12 GB.
- VRAM en cuantizacion de 8 bits: en torno a 2,1 GB para pesos, con overhead adicional; viable en GPUs de 6-8 GB.
- GPU recomendadas: NVIDIA A100 o H100 para despliegues de alta concurrencia; RTX 4090, RTX 3090 o L4 para servicio de produccion moderado.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 (por ejemplo RTX 3060 Ti 8 GB, RTX 4060 Ti 16 GB, RTX 4070), y en 6 GB con cuantizacion.
- Opciones de despliegue: transformers (pipeline nativo), TGI, vLLM (verificar soporte de la arquitectura concreta), y llama.cpp/Ollama si se dispone de pesos GGUF, que no se han publicado para esta variante.
- Latencia y throughput: no disponibles. Como estimacion orientativa para un modelo de ~2B en ASR, una GPU moderna puede procesar audio en tiempo real o mas rapido, pero no se confirma con datos del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cohere-AR/cohere-transcribe-ar-sft | ~2,07B | no disponible | ar, en (code-switching) | no disponible | Gated en HuggingFace |
| CohereLabs/cohere-transcribe-arabic-07-2026 | no disponible | no disponible | arabe | no disponible | Modelo base, HuggingFace |
| CohereLabs/cohere-transcribe-03-2026 | ~2B | no disponible | no disponible | no disponible | Abierto, con GGUF de terceros |
| Voxtral (variante 4B, citada en EVA-Bench) | ~4B | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los datos publicos disponibles; no se han encontrado resultados de WER comparables para la variante afinada al arabe.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace, lo que puede retrasar la integracion en produccion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar las condiciones antes de desplegar.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento de esta variante frente al modelo base ni frente a alternativas.
- Cobertura limitada a arabe e ingles: no se ha documentado soporte de otros idiomas ni de dialectos especificos.
- Riesgo de alucinacion en ASR: en audio muy ruidoso o con solapamiento de hablantes, los modelos de transcripcion pueden generar texto plausible pero incorrecto.
- Sesgos potenciales derivados del dataset de entrenamiento no documentado, especialmente en variantes dialectales y acentos regionales.
- Sin pesos GGUF publicados para esta variante, lo que limita el despliegue en CPU o en entornos de bajos recursos sin conversion propia.
- Fecha de creacion y actualizacion (octubre de 2026) recientes; el ecosistema de herramientas y validacion externa es aun escaso.

## Enlaces

- HuggingFace: https://huggingface.co/Cohere-AR/cohere-transcribe-ar-sft
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Pesos GGUF de la familia (variante 03-2026): https://huggingface.co/cstr/cohere-transcribe-03-2026-GGUF
- EVA-Bench, framework de evaluacion de voz (referencia a Cohere-transcribe): https://aclanthology.org/2026.findings-emnlp.2182.pdf
- Blog de embeddings de Cohere (contexto general, no especifico del modelo): https://cohere.com/blog/embeddings
- Azure Foundry Models (catalogo que incluye modelos Cohere): https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure
- Speech and Language Processing, Jurafsky y Martin (material de referencia): https://web.stanford.edu/~jurafsky/slp3/ed3book_aug26.pdf

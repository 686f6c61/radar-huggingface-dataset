# projecte-aina/stt_ca-es_conformer_transducer_large

## Resumen

stt_ca-es_conformer_transducer_large es un modelo acústico de reconocimiento automático del habla (ASR) bilingüe catalán-castellano desarrollado por el Language Technologies Unit del Barcelona Supercomputing Center (BSC) dentro del proyecto AINA. Se trata de un ajuste fino (fine-tuning) del modelo NVIDIA stt_es_conformer_transducer_large, sobre el que se ha entrenado un decodificador y un tokenizador BPE adaptados al par de lenguas catalán-castellano, empleando un corpus bilingüe de aproximadamente 7426 horas de audio.

Arquitectónicamente es un Conformer-Transducer (RNN-T) en su variante "large", con alrededor de 120 millones de parámetros. Transcribe audio en minúsculas, sin puntuación, sobre el alfabeto catalán y castellano, y se distribuye como checkpoint nativo de NVIDIA NeMo (.nemo) bajo licencia CC-BY-4.0, lo que permite uso comercial con atribución.

Su relevancia es doble: por un lado cubre una combinación lingüística poco atendida por los modelos ASR multilingües genéricos (catalán y castellano en un mismo modelo, con acentos y variantes dialectales); por otro, su tamaño contenido (~0,5 GB de repositorio) y su licencia permisiva lo hacen viable para despliegue en infraestructura modesta, incluidos entornos de CPU o GPU de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-Transducer (RNN-T) con encoder Conformer y tokenizador BPE |
| Parametros totales | ~120 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de ASR; la información proporcionada no especifica ventana máxima de audio) |
| Tipos de cuantizacion | No disponible (no se documentan versiones cuantizadas; solo se publican pesos NeMo) |
| Idiomas soportados | Catalán (ca) y castellano (es) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Checkpoint NeMo (.nemo); tamaño del repositorio ~0,5 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Conformer-Transducer de NVIDIA NeMo: un encoder de bloques Conformer (convolución + self-attention) combinado con un predictor y un joint network propios de los modelos RNN-T, que permiten transcripción en streaming sin segmentación previa del audio. La variante "large" ronda los 120 millones de parámetros. El punto de partida es nvidia/stt_es_conformer_transducer_large, sobre el que se realizó un ajuste fino siguiendo el tutorial oficial de NeMo para transductores con datasets de HuggingFace.

Los datos de entrenamiento suman aproximadamente 7426 horas de audio bilingüe. La composición declarada por el autor incluye corpus parlamentarios e institucionales (Parlament-Parla-v3, Corts Valencianes, IB3, 3Cat), corpus de castellano de diversos acentos y dominios (CIEMPIESS en sus variantes light, fem, complementary y balance, CHM150, TEDx Spanish, LibriVox, Wikipedia, VoxForge, Tele con ciencia, Argentinian Spanish Speech Dataset de OpenSLR 61, Dimex100 light, Glissando, Herico, Latino40) y datos de Common Voice 17 en catalán y castellano. No se documentan en la información disponible detalles sobre uso de RLHF/DPO (no aplicable en un modelo ASR puro) ni sobre aumentación de datos o decodificación especulativa.

## Capacidades

- Transcripción de voz a texto en catalán y castellano, con salida en minúsculas y sin puntuación.
- Modelo acústico único para ambas lenguas: no requiere seleccionar un checkpoint distinto por idioma, aunque el pipeline permite fijar el idioma esperado.
- Reconocimiento de habla espontánea y de dominio amplio (parlamentario, televisión, lectura, entrevistas), según la composición del corpus de entrenamiento.
- Decodificación tipo transductor (RNN-T), apta para inferencia sobre audio de longitud variable sin alineamientos previos.
- Integración nativa con NVIDIA NeMo, lo que facilita el ajuste posterior y la exportación a otros runtimes.
- Salida en formato texto plano; no se declaran capacidades de puntuación, diarización, timestamps por palabra, traducción ni detección de idioma.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acústico.

## Casos de uso

- Subtitulado de medios audiovisuales en catalán y castellano: transcripción de emisiones de television y radio (dominio presente en el corpus con 3Cat e IB3) para generar subtítulos sin puntuación que se postprocesan aguas abajo.
- Acta y transcripción de sesiones parlamentarias o plenos municipales: el modelo se ha entrenado con Parlament-Parla-v3 y Corts Valencianes, por lo que el registro formal y el ruido de sala de plenos están representados en los datos.
- Atención al cliente telefónica: transcripción de llamadas en cualquiera de las dos lenguas con un único modelo, lo que simplifica el enrutado cuando el operador no conoce el idioma del interlocutor de antemano.
- Indexación y búsqueda de archivos sonoros: conversión de un archivo de audio histórico a texto para alimentar un motor de búsqueda o un sistema RAG, dado el reducido coste de inferencia de un modelo de 120 M de parámetros.
- Generación de corpus y anotación asistida: preanotación de audio para equipos de lingüística que revisan y corrigen después, reduciendo el coste frente a la transcripción manual.
- Investigación en ASR de lenguas ibéricas: punto de partida para fine-tuning sobre dominios específicos (legal, médico, dialectal) gracias a la licencia CC-BY-4.0 y a la disponibilidad del modelo base.
- Despliegue en dispositivos o entornos con recursos limitados: al rondar los 120 M de parámetros, es viable en CPU o en GPU de gama de entrada para transcripción por lotes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas no verificadas de forma independiente):

| Dataset | Idioma | Métrica | Valor |
|---|---|---|---|
| CV Benchmark Catalan Accents (projecte-aina/commonvoice_benchmark_catalan_accents, config ca, split test) | ca | Test WER | 2,503 % |
| Mozilla Common Voice 17.0 (config ca, split test, args language es) | es | Test WER | 3,88 % |

No se han publicado en la información disponible resultados comparativos frente a otros modelos (Whisper, wav2vec2, etc.) ni métricas adicionales como CER, WER por acento o rendimiento en streaming. Nota de rigor: en la segunda entrada del model-index el config del dataset es "ca" mientras que los args indican "language": "es", una inconsistencia presente en la propia model card que conviene verificar antes de citar el dato como WER de castellano.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa ~0,5 GB en disco; en memoria, un modelo de 120 M de parámetros en fp32 requiere del orden de 0,5 GB de pesos, y en fp16 alrededor de 0,25 GB. El runtime de NeMo añade overhead, por lo que en la práctica conviene reservar entre 2 y 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más de memoria es suficiente (RTX 3050/3060, RTX 4090, T4, L4, A10, A100, H100). No se requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en toda la gama actual (GTX 1060 6 GB en adelante) e incluso en CPU para transcripción por lotes con latencia aceptable.
- Opciones de despliegue: NVIDIA NeMo (nemo_toolkit), NVIDIA Riva para servicio en producción, y exportación a ONNX desde NeMo para integrarse en runtimes ligeros. No se documentan en la información disponible integraciones listas para llama.cpp, Ollama, vLLM o TGI, que no son aplicables a un modelo acústico de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| projecte-aina/stt_ca-es_conformer_transducer_large | ~120 M | ca, es | No disponible | CC-BY-4.0 | HuggingFace, pesos NeMo |
| nvidia/stt_es_conformer_transducer_large (modelo base) | ~120 M | es | No disponible | No disponible en la información proporcionada | HuggingFace, pesos NeMo |
| openai/whisper-large-v3 | ~1550 M | Multilingüe (~99 idiomas, incluye ca y es) | Ventanas de 30 s | MIT | HuggingFace, múltiples runtimes (transformers, faster-whisper, whisper.cpp) |
| Modelos wav2vec2/CTC de projecte-aina para catalán | No disponible | ca | No disponible | No disponible en la información proporcionada | HuggingFace |

Las cifras de parámetros, idiomas y licencia de Whisper large-v3 corresponden a información pública ampliamente conocida del modelo; no se dispone en la información proporcionada de una comparación de WER entre estos sistemas, por lo que no se ofrece ranking de calidad. La ventaja estructural del modelo de AINA frente a Whisper es el tamaño (unas 13 veces menor) y la especialización en el par ca-es; su desventaja es la ausencia de puntuación, timestamps y soporte multilingüe amplio.

## Limitaciones y advertencias

- Salida sin puntuación y en minúsculas: requiere un modelo de postproceso (puntuación y capitalización) para producir texto publicable.
- No se declaran timestamps a nivel de palabra ni diarización de hablantes; para subtitulado con sincronía fina habrá que añadir herramientas externas.
- Riesgo de alucinación en audio con ruido, silencios largos, música o solapamiento de voces; como todo modelo acústico, puede generar texto plausible donde no hay habla.
- Sesgos derivados del corpus: fuerte peso de registro parlamentario, televisión pública y lectura (LibriVox, Wikipedia), con menor representación de habla informal, acentos no peninsulares o jerga técnica.
- Cobertura dialectal: el catalán incluye datos de Corts Valencianes e IB3 (Baleares), pero no se documenta evaluación por variante dialectal más allá del benchmark de acentos catalanes.
- Cambio de código dentro de un mismo enunciado (code-switching intra-frase): el modelo es bilingüe, pero no se documenta su comportamiento en mezcla de lenguas dentro de la misma frase.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución a BSC-LT/projecte-aina y conservar el aviso de licencia; conviene revisar también los términos del modelo base de NVIDIA.
- Los datasets Parlament-Parla-v3 y Corts Valencianes solo son públicos en versión anonimizada; el modelo se entrenó con la versión no anonimizada, lo que puede influir en la reproducibilidad exacta del entrenamiento.
- Los resultados de benchmarks son declarados por el autor (verified: false) y no han sido replicados de forma independiente en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/projecte-aina/stt_ca-es_conformer_transducer_large
- Modelo base (NVIDIA): https://huggingface.co/nvidia/stt_es_conformer_transducer_large
- Ficha del recurso en Proyecto ILENIA: https://proyectoilenia.es/en/recurso/conformer-transducer-large-ca-es/
- Documentación de modelos ASR en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#conformer-transducer
- Repositorio NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Tutorial de fine-tuning de transductores con datasets de HuggingFace: https://github.com/NVIDIA/NeMo/blob/main/tutorials/asr/Transducers_with_HF_Datasets.ipynb
- Dataset Parlament-Parla-v3: https://huggingface.co/datasets/projecte-aina/parlament_parla_v3
- Dataset Corts Valencianes: https://huggingface.co/datasets/projecte-aina/corts_valencianes_asr_a
- Dataset IB3: https://huggingface.co/datasets/projecte-aina/ib3_ca_asr
- Benchmark de acentos del catalán: https://huggingface.co/datasets/projecte-aina/commonvoice_benchmark_catalan_accents
- Artículo IBERSPEECH 2024 sobre datos de 3Cat: https://www.isca-archive.org/iberspeech_2024/hernandezmena24_iberspeech.pdf
- Perfil del equipo BSC-LT: https://huggingface.co/BSC-LT
- Barcelona Supercomputing Center: https://www.bsc.es/

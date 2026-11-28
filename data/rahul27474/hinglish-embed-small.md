# rahul27474/hinglish-embed-small

## Resumen

hinglish-embed-small es un modelo de embeddings de texto de 37 millones de parámetros especializado en hinglish romanizado (hindi escrito con alfabeto latino), hindi en devanagari e inglés. Lo desarrolla rahul27474 y deriva de intfloat/multilingual-e5-small mediante fine-tuning y reducción de vocabulario. Resuelve un problema concreto: los embedders multilingües genéricos manejan mal el texto code-mixed, con erratas y estilo SMS que predomina en las consultas reales de usuarios indios, y este modelo está entrenado específicamente para emparejar texto en cualquiera de las tres formas contra las otras dos.

La arquitectura es un transformer BERT con 36.999.552 parámetros totales y embeddings de 384 dimensiones con similitud coseno. Incorpora entrenamiento Matryoshka, lo que permite truncar los vectores a 256 o 128 dimensiones con pérdida mínima. El modelo es 3,2 veces más pequeño que multilingual-e5-small y 15 veces más pequeño que bge-m3, lo que lo hace apto para inferencia en CPU.

Su relevancia actual radica en el ecosistema de recuperación aumentada (RAG) para mercados indios: incluye pesos ONNX int8 de 38 MB con latencia de aproximadamente 10 ms por consulta en CPU, licencia MIT para uso comercial y compatibilidad con sentence-transformers, LangChain, LlamaIndex, text-embeddings-inference y un servidor compatible con la API de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (derivado de intfloat/multilingual-e5-small) |
| Parametros totales | 36.999.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX int8 (38 MB); pesos safetensors en precision original |
| Idiomas soportados | hi (hindi devanagari), en (inglés), hinglish romanizado |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |
| Dimension de embeddings | 384 (truncable a 256 y 128 via Matryoshka) |
| Funcion de similitud | coseno |
| Prefijos de tarea | `query: ` / `passage: ` |

## Arquitectura y entrenamiento

El modelo parte de intfloat/multilingual-e5-small y se somete a fine-tuning con reducción de vocabulario (vocab-trimming) para adaptarlo al dominio hinglish. No se entrena desde cero. La arquitectura subyacente es un transformer BERT encoder-only que produce embeddings de 384 dimensiones, entrenado con objetivos de similitud de frases y con entrenamiento Matryoshka que permite truncar la dimensionalidad de salida.

El entrenamiento utiliza el dataset rahul27474/hinglish-retrieval-train, y la evaluación se realiza sobre rahul27474/hinglish-retrieval-bench, un conjunto de 3.626 pasajes multilingües que cubren 268 temas retenidos en 40 dominios de help-desk indio (UPI, IRCTC, Aadhaar/PAN, telecomunicaciones, seguros, reparto de comida, entre otros). La model card no detalla el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; esos datos no están disponibles en la información proporcionada. La innovación técnica destacable es la combinación de Matryoshka con la especialización en texto code-mixed romanizado.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación (pipeline sentence-similarity y feature-extraction).
- Recuperación y búsqueda semántica para RAG, con soporte de prefijos `query:` y `passage:`.
- Detección de duplicados en tickets y consultas.
- Clasificación de intenciones mediante best-match contra etiquetas.
- Emparejamiento entre formas lingüísticas: hinglish romanizado, hindi devanagari e inglés, en cualquier dirección.
- Truncado de dimensionalidad Matryoshka a 256 o 128 dimensiones.
- Integración con LangChain (`HinglishEmbeddings`), LlamaIndex (`HinglishEmbedding`), CLI y servidor compatible con `/v1/embeddings` de OpenAI.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de embeddings.

## Casos de uso

- Bots de FAQ y atención al cliente: el modelo permite construir un índice de respuestas y devolver la más cercana a consultas como "mera paisa wapas kab milega", gracias a su entrenamiento específico en hinglish romanizado y a su capacidad de separar pares con significado distinto.
- Búsqueda semántica en documentación de producto: indexar pasajes en hindi, inglés o hinglish y consultar en cualquiera de las tres formas, con recuperación cross-lingüe validada en Belebele (0,611 nDCG@10 en consulta hin_Latn a pasaje inglés).
- Detección de tickets duplicados en mesas de soporte: `find_duplicates` agrupa formulaciones distintas del mismo problema ("app crash ho raha hai" frente a "mera app crash rha h") sin depender de coincidencia léxica.
- Enrutamiento de intenciones: `best_match` asigna una consulta a una categoría predefinida (payment issue, delivery issue, login issue) con embeddings de 384 dimensiones y latencia de CPU baja.
- RAG sobre bases de conocimiento de help-desk indio: los 3.626 pasajes del benchmark cubren 40 dominios (UPI, IRCTC, Aadhaar/PAN, telecom, seguros, food delivery), lo que lo hace adecuado para pipelines de recuperación en esos verticales.
- Despliegue en entornos sin GPU: los pesos ONNX int8 de 38 MB y los ~10 ms por consulta en CPU permiten ejecutar búsqueda semántica en servidores modestos, edge o navegador mediante transformers.js.
- Integración en orquestadores low-code: el servidor compatible con `/v1/embeddings` permite conectarlo a n8n, Flowise o Dify sin escribir código.

## Benchmarks y rendimiento

Resultados públicos MTEB (nDCG@10) reportados en la model card:

| Tarea | v1.2 (37M) | v1.1 | multilingual-e5-small (118M) | bge-m3 (568M) |
|---|---|---|---|---|
| Belebele, Romanized Hindi (hin_Latn) | 0.587 | 0.574 | 0.538 | 0.617 |
| Belebele, hin_Latn query → English passage | 0.611 | 0.608 | 0.582 | 0.634 |
| Belebele, English query → hin_Latn passage | 0.453 | 0.406 | 0.407 | 0.491 |
| Belebele, Hindi (hin_Deva) | 0.842 | 0.862 | 0.861 | 0.893 |
| Belebele, hin_Deva query → English passage | 0.870 | 0.886 | 0.878 | no disponible |
| Belebele, English | 0.923 | 0.942 | 0.948 | 0.955 |
| IndicQA, Hindi | 0.612 | 0.639 | 0.658 | 0.669 |
| SciFact, English | 0.666 | 0.672 | 0.675 | 0.641 |
| NFCorpus, English | 0.296 | 0.304 | 0.310 | 0.317 |
| ArguAna, English | 0.421 | 0.396 | 0.389 | 0.540 |
| FiQA, English | 0.327 | 0.343 | 0.330 | 0.410 |
| Media de las 11 tareas | 0.666 | 0.647 | 0.631 | no disponible |

Prueba práctica sobre 46 pares de frases cortas en hinglish y 33 consultas sobre 20 respuestas de help-desk:

| Metrica | multilingual-e5-small | v1.1 | v1.2 |
|---|---|---|---|
| AUC separando pares con mismo significado de distinto | 0.53 | 0.77 | 0.92 |
| Mejor accuracy de umbral unico | 0.63 | 0.76 | 0.85 |
| Puntuacion media, mismo significado / distinto | 0.86 / 0.86 | 0.81 / 0.74 | 0.81 / 0.62 |
| Busqueda: respuesta correcta en posicion #1 | 0.64 | 0.64 | 0.85 |

El autor advierte que este conjunto es pequeño y debe tratarse como comprobación de cordura, no como benchmark. Los resultados del benchmark propio hinglish-retrieval-bench (nDCG@10 sobre 3.626 pasajes) aparecen truncados en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: viable con los pesos ONNX int8 de 38 MB, con aproximadamente 10 ms por consulta.
- VRAM estimada en GPU: no disponible en la información proporcionada; por el tamaño (37M parámetros) es holgada incluso en GPUs de gama baja.
- GPU recomendadas: no especificadas por el autor; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es suficiente por el reducido tamaño del modelo.
- Cabe en cualquier GPU consumer: sí, dado el tamaño de 37M parámetros y los pesos int8 de 38 MB.
- Opciones de despliegue: sentence-transformers, ONNX Runtime, transformers.js (demo en navegador), text-embeddings-inference, servidor propio compatible con `/v1/embeddings`, CLI `hinglish-embed`.
- Latencia y throughput: ~10 ms por consulta en CPU con int8; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| hinglish-embed-small v1.2 | 37M | no disponible | MIT | Hinglish romanizado, hindi, inglés |
| intfloat/multilingual-e5-small | 118M | no disponible | MIT | Multilingüe general |
| bge-m3 | 568M | no disponible | MIT | Multilingüe general, multivector |

Frente a multilingual-e5-small, hinglish-embed-small es 3,2 veces más pequeño, gana en las tareas de hinglish romanizado (0,587 frente a 0,538 en Belebele hin_Latn) y en recuperación cross-lingüe hin_Latn→inglés (0,611 frente a 0,582), pero pierde 1-3 puntos en hindi devanagari puro y en inglés puro. Frente a bge-m3, es 15 veces más pequeño y unas 20 veces más rápido en CPU, aunque bge-m3 sigue siendo superior en las tareas generales (0,617 frente a 0,587 en hin_Latn; 0,955 frente a 0,923 en inglés).

## Limitaciones y advertencias

- Rendimiento inferior a multilingual-e5-small en hindi devanagari puro e inglés puro (por ejemplo, 0,842 frente a 0,861 en Belebele hin_Deva; 0,923 frente a 0,948 en inglés). Si los datos son solo hindi formal o solo inglés, el modelo base puede ser mejor opción.
- El conjunto de evaluación práctico es pequeño (46 pares y 33 consultas) y el propio autor lo califica de comprobación de cordura, no de benchmark.
- No se detalla la longitud máxima de contexto soportada, lo que limita la planificación de pasajes largos.
- Riesgo de alucinación no aplica directamente al ser un modelo de embeddings, pero sí el riesgo de recuperar pasajes semánticamente próximos pero incorrectos en dominios fuera de los 40 verticales de help-desk cubiertos.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar de un modelo multilingüe general, puede heredar sesgos de dicho corpus.
- Licencia MIT, por lo que el uso comercial está permitido sin restricciones adicionales conocidas.
- El modelo solo produce embeddings; no genera texto, no soporta tool calling ni razonamiento multi-paso, por lo que debe combinarse con un LLM generador en pipelines RAG.
- Los resultados del benchmark propio hinglish-retrieval-bench aparecen truncados en la información disponible, por lo que no se pueden verificar las cifras completas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rahul27474/hinglish-embed-small
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Dataset de entrenamiento: https://huggingface.co/datasets/rahul27474/hinglish-retrieval-train
- Dataset de benchmark: https://huggingface.co/datasets/rahul27474/hinglish-retrieval-bench
- Demo en navegador: https://huggingface.co/spaces/rahul27474/hinglish-embed-small-demo
- Guía del paquete Python: https://huggingface.co/rahul27474/hinglish-embed-small/blob/main/python/README.md

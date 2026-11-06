# mdtahseen7/bns-oracle-legal-embeddings

## Resumen

`bns-oracle-legal-embeddings` es un modelo de embeddings de frases especializado en recuperación de información (retrieval) sobre el derecho penal indio. Lo desarrolla el usuario de Hugging Face `mdtahseen7` como un fine-tune del modelo generalista `nomic-ai/nomic-embed-text-v1.5`, y está diseñado específicamente para sistemas RAG (Retrieval-Augmented Generation) que necesitan localizar el artículo estatutario correcto ante una consulta en lenguaje natural.

El problema que resuelve es la confusión entre secciones legales similares: el modelo base asigna embeddings próximos a textos que comparten temática pero difieren en matices jurídicos decisivos (por ejemplo, robo frente a extorsión, o distintas secciones sobre carga de la prueba). El fine-tune se entrena con tripletas contrastivas que incluyen negativos duros intra-capítulo, forzando al modelo a discriminar entre secciones que se parecen mucho.

Técnicamente es un transformer tipo `nomic_bert` de 136,7 millones de parámetros y 768 dimensiones de embedding, con una longitud máxima de secuencia de 512 tokens y licencia Apache 2.0. Cubre el Bharatiya Nyaya Sanhita 2023 (BNS), el Indian Penal Code 1860 (IPC), el Bharatiya Nagarik Suraksha Sanhita 2023 (BNSS) y el Bharatiya Sakshya Adhiniyam 2023 (BSA), y solo admite consultas en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `nomic_bert` (encoder de embeddings) |
| Parametros totales | 136.731.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor menciona despliegue vía Ollama) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `sentence-transformers`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de `nomic-ai/nomic-embed-text-v1.5`, un encoder `nomic_bert` de 137 millones de parámetros que produce embeddings de 768 dimensiones. El fine-tune se realiza con `SentenceTransformerTrainer` y `TripletLoss` con distancia coseno y margen de 0.5, durante 5 épocas, batch size 16, learning rate 2e-5 con AdamW, warmup ratio 0.1, precisión fp32 y semilla 42, sobre una NVIDIA RTX 5090. La longitud máxima de secuencia se fija en 512 tokens (el máximo del dataset es de 527 tokens, con un p99 de aproximadamente 460).

El dataset de entrenamiento consta de 11.587 tripletas contrastivas sintetizadas a partir de los textos legales. Cada tripleta contiene un *anchor* (consulta con prefijo `search_query:`, en forma de escenario lego, búsqueda profesional o "essential ingredients"), un *positive* (el texto de la sección correcta con prefijo `search_document:`) y un *negative* duro: una sección confusamente similar del mismo capítulo. La elección de `TripletLoss` frente a pérdidas con negativos in-batch se justifica precisamente por el uso directo de ese negativo curado. Se reserva un 5 % (580 tripletas) para evaluación.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación (`sentence-similarity`, `retrieval`).
- Búsqueda de secciones estatutarias relevantes a partir de consultas en lenguaje natural en inglés.
- Discriminación fina entre secciones legales del mismo capítulo que comparten temática.
- Soporte de prefijos de tarea de Nomic (`search_query:` para consultas, `search_document:` para documentos indexados), necesarios para mantener la calidad de recuperación.
- Integración con `sentence-transformers` y con Text Embeddings Inference (tag `text-embeddings-inference`, `endpoints_compatible`).
- Despliegue vía Ollama según la model card (modelo `shb/legal-embed`).
- No soporta tool calling, agentes, visión ni audio: es un modelo puramente de embeddings.

## Casos de uso

- Chatbot de asistencia jurídica sobre derecho penal indio: el modelo indexa las secciones de BNS, IPC, BNSS y BSA y recupera el artículo pertinente ante la pregunta de un ciudadano, reduciendo respuestas basadas en la sección equivocada.
- Pipeline RAG para despachos de abogados: se ingieren los textos consolidados de las nuevas leyes penales de 2023 y el modelo actúa como recuperador previo a un LLM generador que redacta el resumen con la cita correcta.
- Herramienta de búsqueda interna para fiscales y funcionarios judiciales: permite localizar "essential ingredients" de un delito concreto a partir de una descripción de hechos, gracias al entrenamiento con negativos intra-capítulo.
- Migración de jurisprudencia del IPC al BNS: el modelo puede emparejar secciones equivalentes entre el código antiguo y el nuevo al compartir espacio de embeddings, facilitando la trazabilidad de correspondencias.
- Sistemas de preguntas y respuestas sobre prueba y procedimiento: consultas como la carga de la prueba se mapean a la sección correcta del BSA (por ejemplo, la sección 109) en lugar de a secciones de evidencia parecidas.
- Evaluación y *benchmarking* de pipelines RAG legales: sirve como recuperador de referencia especializado para comparar con embeddings generalistas en tareas de derecho penal indio.
- Filtrado y deduplicación de fragmentos legales en corpus de entrenamiento o bases documentales, aprovechando la similitud semántica entre secciones.

## Benchmarks y rendimiento

El autor publica una única métrica: precisión de tripleta sobre el split de validación retenido (580 tripletas), que mide si el modelo ordena la sección correcta por encima del negativo duro.

| Modelo | Precisión de tripleta |
|---|---|
| `nomic-embed-text-v1.5` (base) | 0.9552 |
| `bns-oracle-legal-embeddings` (este modelo) | 0.9983 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni métricas end-to-end de recall de RAG en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de 137 M de parámetros, en fp32 ocupa aproximadamente 0,55 GB de pesos; en fp16 alrededor de 0,27 GB. Con overhead de activaciones y batch, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el autor entrenó en una RTX 5090, pero para inferencia bastan RTX 3060, RTX 4060, RTX 4090 o superiores. En entornos de servidor, A100 o H100 aportan mayor throughput con batches grandes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 4 GB de VRAM; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: `sentence-transformers` (con `trust_remote_code=True`), Text Embeddings Inference (TGI), Ollama (según la model card) y endpoints compatibles de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bns-oracle-legal-embeddings` | 136,7 M | 512 | Derecho penal indio (BNS/IPC/BNSS/BSA) | Apache 2.0 | Hugging Face |
| `nomic-ai/nomic-embed-text-v1.5` | ~137 M | 8192 (modelo base) | Propósito general, multilingüe parcial | Apache 2.0 | Hugging Face |
| `BAAI/bge-base-en-v1.5` | ~109 M | 512 | Propósito general en inglés | MIT | Hugging Face |
| `intfloat/e5-base-v2` | ~109 M | 512 | Propósito general en inglés | MIT | Hugging Face |

La ventaja de este modelo frente a los generalistas es la discriminación fina entre secciones legales indias; su desventaja es el alcance restringido a un dominio y a un único idioma. Los datos de rendimiento comparativo con `bge-base` o `e5-base` no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La métrica de 0.9983 se calcula con un único negativo curado por consulta; en un RAG real se compite contra todo el corpus de secciones, por lo que debe interpretarse como señal de sanidad y no como recall end-to-end.
- Solo admite consultas en inglés; no hay soporte multilingüe ni para hindi u otras lenguas oficiales de la India.
- Cubre exclusivamente BNS, IPC, BNSS y BSA; no se entrenó con jurisprudencia, sentencias ni otros estatutos.
- Es imprescindible mantener los prefijos `search_query:` y `search_document:`; sin ellos la calidad de recuperación cae de forma notable.
- Riesgo de alucinación heredado del LLM generador que consuma los embeddings: el modelo solo recupera, no verifica la vigencia normativa de las secciones.
- Sesgos potenciales derivados del dataset sintético generado a partir de los textos legales; no se documentan evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene un volumen de descargas muy bajo (24) y ningún *like*, lo que sugiere escasa validación comunitaria.
- La model card menciona un identificador alternativo (`saitejasathiraju/nomic-embed-bns-legal`) y un modelo de Ollama (`shb/legal-embed`) que no coinciden con el ID del repositorio; conviene verificar su disponibilidad antes de integrarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdtahseen7/bns-oracle-legal-embeddings
- Modelo base: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- Identificador alternativo citado en la model card: https://huggingface.co/saitejasathiraju/nomic-embed-bns-legal

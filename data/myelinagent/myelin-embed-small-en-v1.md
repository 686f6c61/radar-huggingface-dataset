# myelinagent/myelin-embed-small-en-v1

## Resumen

myelin-embed-small-en-v1 es un modelo de embeddings en inglés desarrollado por myelinagent, pensado específicamente para memoria de agentes: dada una pregunta, recuperar el turno de conversación o la nota que la responde. Se construye mediante fine-tuning de BAAI/bge-small-en-v1.5, un transformer BERT de 33,36 millones de parámetros con salidas de 384 dimensiones y una ventana máxima de 512 tokens. Forma parte del proyecto Myelin-AI como embedder neuronal opcional dentro de su sistema de memoria.

El problema que aborda es la recuperación conversacional de largo plazo, donde los sistemas de búsqueda densa genéricos confunden turnos con vocabulario parecido pero irrelevante. El autor reporta mejoras sustanciales sobre el modelo base y sobre un embedder estático de 32M en los benchmarks LoCoMo y LongMemEval-S, medidos en búsqueda híbrida sin modelo generativo.

Es relevante porque demuestra que un fine-tuning pequeño y dirigido sobre un modelo de 33M puede superar a alternativas estáticas en calidad de recuperación, a costa de mayor latencia y dependencia de PyTorch. Su licencia MIT y su compatibilidad con sentence-transformers y text-embeddings-inference facilitan su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (base: BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.360.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensiones de embedding | 384 |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder tipo BERT de 33M parámetros, heredado de BAAI/bge-small-en-v1.5, que produce embeddings normalizados de 384 dimensiones. No emplea arquitecturas híbridas ni mecanismos de atención lineal; es un encoder denso convencional con truncamiento a 512 tokens.

El entrenamiento se realizó sobre 23.781 ejemplos compuestos por una pregunta, el texto que la responde y tres textos casi-fallidos (near-misses), extraídos de 900 de 1.000 ítems sintéticos: 500 chats de dos personas, 260 historiales persona-asistente y 240 conjuntos de notas de agente. Se reservaron 100 ítems para validación. Se aplicó una única pasada con batch 16, learning rate 2e-5 y pérdida multiple negatives ranking, con los near-misses minados mediante el modelo estático de la misma conversación. Los datos, briefs y script están en el repositorio Myelin-AI. En los ítems de validación, el texto correcto fue el primer resultado para el 59,3% de las preguntas (43,8% antes del entrenamiento) y estuvo en el top 5 para el 92,2% (80,6% antes).

## Capacidades

- Generación de embeddings de frases y textos para similitud semántica y recuperación densa.
- Recuperación de turnos de conversación y notas de agente a partir de una pregunta.
- Entrenado con formato `Speaker: text` para turnos y texto plano para notas, sin necesidad de prefijos en consultas ni en documentos.
- Soporte de búsqueda híbrida cuando se combina con recuperación léxica (el autor reporta resultados en ese modo).
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo thinking; es exclusivamente un encoder de embeddings.
- Capacidad monolingüe: solo inglés.

## Casos de uso

- Memoria de agentes conversacionales: almacenar turnos como `Speaker: text` y recuperar el turno relevante ante una pregunta del usuario, usando similitud coseno sobre embeddings normalizados de 384 dimensiones.
- Sistemas de atención al cliente con historial largo: indexar conversaciones multi-turno y recuperar evidencias para respuestas o resúmenes, aprovechando el entrenamiento específico en diálogos persona-asistente.
- Recuperación de notas y documentación interna: indexar notas en texto plano y localizar las que responden a una consulta, útil en asistentes de conocimiento personal.
- RAG conversacional de bajo coste: sustituir embedders genéricos en pipelines de recuperación donde la calidad del top-k importa más que el throughput de escritura.
- Deduplicación y clustering semántico de turnos de conversación: agrupar turnos similares mediante similitud de embeddings.
- Filtrado previo en pipelines de agentes: usar el modelo como primera etapa de recuperación antes de un reranker o un LLM generativo, reduciendo el número de documentos enviados al modelo grande.
- Evaluación de sistemas de memoria: emplear el modelo como embedder de referencia en benchmarks como LoCoMo o LongMemEval-S dentro del harness `bench.lifetime` de Myelin-AI.

## Benchmarks y rendimiento

Resultados reportados por el autor: proporción de preguntas cuyas evidencias están todas en el top-k, en búsqueda híbrida sin modelo de lenguaje y con memorias conservadas indefinidamente.

| Benchmark | Embedder | top 5 | top 10 | top 20 |
|---|---|---:|---:|---:|
| LoCoMo, 10 conversaciones | potion-retrieval-32M (estático) | 46,4 | 55,8 | 63,9 |
| LoCoMo, 10 conversaciones | bge-small-en-v1.5 | 56,5 | 66,1 | 74,4 |
| LoCoMo, 10 conversaciones | este modelo | 66,7 | 75,7 | 82,0 |
| LongMemEval-S, 500 preguntas | potion-retrieval-32M (estático) | 65,1 | 77,9 | 86,6 |
| LongMemEval-S, 500 preguntas | este modelo | 72,4 | 85,4 | 92,1 |

En una muestra de 250 preguntas de LongMemEval, bge-small-en-v1.5 obtuvo 62,7 / 80,1 / 89,2 y este modelo 72,2 / 85,5 / 92,1. Las cifras de LoCoMo son medias sobre tres planificaciones de sesión; las de LongMemEval provienen de una sola.

Velocidad en CPU de 4 núcleos sin GPU:

| Métrica | potion-retrieval-32M (estático) | este modelo |
|---|---:|---:|
| Turnos cortos (~140 caracteres) por segundo | 14.900 | 103 |
| Textos largos (~1.200 caracteres) por segundo | 5.000 | 15 |
| Una pregunta | 0,09 ms | 12 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (33M parámetros); no se han publicado cifras para otras precisiones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100. El autor reporta pruebas en CPU de 4 núcleos.
- Cabe en cualquier GPU consumer y también en CPU; requiere PyTorch, a diferencia del modelo estático que solo necesita numpy.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference, endpoints de Hugging Face; el modelo es compatible con la integración `NeuralEmbedder` de Myelin-AI.
- Latencia y throughput: 103 turnos cortos/s y 15 textos largos/s en CPU de 4 núcleos; 12 ms por pregunta en ese mismo hardware. No se han publicado cifras en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensiones | Licencia | Rendimiento (LoCoMo top 5 / LongMemEval-S top 5) |
|---|---|---|---|---|---|
| myelin-embed-small-en-v1 | 33,36M | 512 | 384 | MIT | 66,7 / 72,4 |
| BAAI/bge-small-en-v1.5 | 33,36M | 512 | 384 | MIT | 56,5 / no reportado en la información |
| potion-retrieval-32M (estático) | ~32M | no disponible | no disponible | no disponible | 46,4 / 65,1 |

El modelo supera a su base en LoCoMo top 5 (66,7 frente a 56,5) y a la alternativa estática en ambos benchmarks, a cambio de menor throughput de escritura y dependencia de PyTorch.

## Limitaciones y advertencias

- Solo inglés; no soporta otros idiomas.
- El texto que excede 512 tokens se trunca.
- Los datos de entrenamiento son sintéticos, generados por un modelo de lenguaje a partir de briefs, inspirados en los tipos de conversación y pregunta de LoCoMo y LongMemEval; el autor advierte que las mejoras no son evidencia sobre otros tipos de datos.
- No se han publicado análisis de sesgos; al ser un encoder entrenado con datos sintéticos, puede heredar sesgos del modelo generador que produjo las conversaciones.
- Riesgo de recuperación incorrecta en dominios alejados del entrenamiento (conversaciones y notas); el propio autor limita las conclusiones a esos formatos.
- Licencia MIT, sin restricciones conocidas para uso comercial.
- Requiere PyTorch en inferencia, lo que incrementa el coste de despliegue frente a alternativas estáticas basadas en numpy.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta; no hay validación externa independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myelinagent/myelin-embed-small-en-v1
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio Myelin-AI: https://github.com/myelinagent/Myelin-AI
- Datos, briefs y script de entrenamiento: https://github.com/myelinagent/Myelin-AI/tree/main/bench/embedder

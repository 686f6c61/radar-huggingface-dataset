# HooRiiTechnology/hoorii-mindgct

## Resumen

HooRii Mind GCT (Graph Context Transformer) es un modelo de recuperación de contexto personal desarrollado por HooRiiTechnology, diseñado específicamente para sistemas de memoria personal basados en grafos de conocimiento. A diferencia de los modelos de embedding o reranking convencionales, GCT lee el grafo del usuario y la conversación reciente en un único forward pass, devolviendo directamente los hechos (facts) que un asistente o agente necesita para completar el turno actual. El modelo se construye sobre Qwen/Qwen3-0.6B como base y se distribuye con licencia Apache 2.0.

La propuesta de valor es doble: por un lado, distingue entre hechos *must-mention* (necesarios para la tarea en curso) y *worth-mentioning* (relevantes pero fuera de la tarea inmediata, disponibles en variantes Pro); por otro, ofrece latencias muy bajas (26,9 ms con GCT-0.6B en una A100) frente a pipelines de retrieve-and-rerank que requieren entre 213 y 238 ms. Según la model card, GCT-4B alcanza el mejor recall@5 en LoCoMo y PerLTQA (inglés y chino) frente a 15 sistemas comparados, y GCT-0.6B es competitivo con solo 0,6 mil millones de parámetros.

El modelo está pensado para aplicaciones de asistente personal, agentes y personajes virtuales que mantienen contexto de un mismo usuario a lo largo del tiempo. Solo se publican pesos de GCT-0.6B (release `GCT-0.6B-B1`, prevista para 2026-11-20); GCT-4B se reporta como referencia pero sus pesos no están liberados. La model card está redactada en inglés y el modelo soporta chino e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Graph Context Transformer (GCT), fine-tune de Qwen/Qwen3-0.6B |
| Parámetros totales | 0,6 mil millones (GCT-0.6B); GCT-4B reportado pero no liberado |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamaño del repo: 0,0 GB en el momento de la consulta) |

## Arquitectura y entrenamiento

GCT se presenta como un modelo de recuperación que opera sobre un grafo de contexto personal (HooRii Mind) en lugar de sobre un índice de documentos planos. En cada turno, el modelo recibe el grafo del usuario y la conversación reciente y, en un único forward pass, devuelve los hechos relevantes para ese turno. La arquitectura subyacente es un transformer derivado de Qwen3-0.6B, adaptado mediante fine-tuning para la tarea de selección de hechos sobre grafos. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, pero sí especifica que los benchmarks públicos (LoCoMo, LongMemEval_S, PerLTQA) se usan exclusivamente para evaluación y que ninguna de sus conversaciones, memorias, preguntas o respuestas forma parte de los datos de entrenamiento.

La innovación principal es el formato de grafo: cada registro lleva asociado uno de cuatro niveles de privacidad, y cada IA recupera únicamente la parte del grafo para la que está autorizada. El formato incluye tipos de nodo para agentes de IA y para personas virtuales (como Miko, el personaje compañero de HooRii), y permite que los agentes de dos personas organicen un plan leyendo cada uno solo el grafo de su propietario. Las variantes Pro añaden una etapa de recuperación de hechos *worth-mentioning* cuyos pesos no forman parte de esta release. No se especifica en la información disponible si hubo RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Recuperación de hechos *must-mention*: identifica los hechos del grafo personal necesarios para completar la tarea del turno actual (por ejemplo, la alergia de un amigo al reservar una cena).
- Recuperación de hechos *worth-mentioning* (solo variantes Pro): devuelve, junto a los must-mention, hechos fuera de la tarea que merece la pena mencionar (por ejemplo, un ascenso reciente).
- Lectura conjunta de grafo y conversación en un único forward pass, sin pipeline separado de embedding + reranking.
- Soporte multilingüe en chino e inglés, tanto en consultas como en grafos.
- Gestión de privacidad por niveles: cuatro niveles por registro, con recuperación restringida a la parte del grafo autorizada para cada IA.
- Soporte de agentes: el formato de grafo incluye tipos para agentes de IA y personas virtuales, y permite coordinación entre agentes de distintos propietarios sin compartir grafos completos.
- Despliegue en múltiples plataformas: GPU (A100, A800-40GB), CPU x86 (32 núcleos) y Raspberry Pi 5.

## Casos de uso

- Asistentes personales con memoria a largo plazo: el modelo lee el grafo del usuario en cada turno y devuelve los hechos relevantes (preferencias, relaciones, eventos pasados) para que el LLM que genera la respuesta no tenga que reconstruir el contexto desde el historial completo. Adecuado por su latencia de 26,9 ms en A100 y su capacidad de operar sobre grafos estructurados.
- Reservas y gestión de tareas con terceros: al pedir una reserva con un amigo, GCT recupera la alergia de ese amigo como hecho must-mention, permitiendo al asistente evitar errores en la gestión. El formato de grafo soporta la coordinación entre agentes de dos personas.
- Atención al cliente con contexto histórico: integrado en un agente de soporte, recupera del grafo del cliente incidencias previas, productos contratados y preferencias de contacto, con latencia compatible con conversaciones en tiempo real.
- Personajes virtuales y companions: el formato de grafo incluye tipos para personas virtuales como Miko, lo que permite mantener coherencia de personalidad y memoria de interacciones pasadas.
- Despliegue en dispositivos edge: GCT-0.6B funciona en una Raspberry Pi 5 con 486 ms por petición y en servidores x86 de 32 núcleos con 201 ms, lo que habilita asistentes personales locales sin GPU.
- Servicio multiinquilino: un único proceso de serving ha mantenido 64 usuarios registrados dentro de 10,5 GiB en una tarjeta limitada a 40 GB, adecuado para plataformas de asistentes personales con muchos usuarios.
- Agentes autónomos multi-paso: la recuperación de hechos por turno permite a un agente planificar y ejecutar pasos sin arrastrar todo el historial, reduciendo el coste de contexto del LLM generador.

## Benchmarks y rendimiento

Los datos provienen del split de desarrollo de cuatro benchmarks públicos (LoCoMo, LongMemEval_S y PerLTQA en inglés y chino), con una sola ejecución. Recall@5 mide la proporción de evidencia dorada encontrada entre las cinco primeras fuentes devueltas. La latencia es la p50 en una A100-80GB exclusiva con batch 1.

**Tabla 1. Recall@5 de evidencia must-mention**

| Sistema | LoCoMo | LongMemEval_S | PerLTQA (EN) | PerLTQA (ZH) | Latencia media p50 |
|---|---|---|---|---|---|
| BM25 | 0,307 | 0,753 | 0,729 | 0,765 | 0,06 ms (CPU) |
| Qwen3-Embedding-0.6B | 0,454 | 0,807 | 0,746 | 0,840 | 22,6 ms |
| Qwen3-Embedding-8B | 0,577 | 0,855 | 0,853 | 0,886 | 25,9 ms |
| Qwen3-Reranker-4B | 0,556 | 0,903 | 0,834 | 0,887 | 231 ms |
| Qwen3-Reranker-8B | 0,535 | 0,921 | 0,849 | 0,886 | 238 ms |
| MemReranker-4B | 0,468 | **0,934** | 0,697 | 0,734 | 213 ms |
| HippoRAG 2 | 0,530 | 0,740 | 0,784 | 0,843 | 2,2 s |
| GPT-6.1 search agent | 0,594 | 0,767 | 0,698 | 0,659 | 13,1 s |
| GCT-0.6B | 0,626 | 0,891 | 0,872 | 0,918 | 26,9 ms |
| GCT-0.6B-Pro | 0,626 | 0,891 | 0,872 | 0,918 | 48,8 ms |
| GCT-4B | **0,686** | 0,933 | **0,907** | **0,934** | 50,5 ms |
| GCT-4B-Pro | **0,686** | 0,933 | **0,907** | **0,934** | 70,9 ms |

**Tabla 2. Precisión de respuesta del mismo modelo lector con los cinco hechos principales**

| Sistema | LoCoMo | PerLTQA (EN) |
|---|---|---|
| GCT-4B | 82,6% | no disponible en la información proporcionada |
| GCT-0.6B | no disponible en la información proporcionada | 92,8% |

Según la model card, GCT-4B obtiene el mejor recall@5 en LoCoMo y PerLTQA (EN y ZH) frente a 15 sistemas, y está a la par del mejor reranker en LongMemEval_S (0,933 frente a 0,934). Las filas Pro devuelven exactamente los mismos hechos must-mention que sus equivalentes no-Pro, bit a bit, y su latencia incluye la etapa worth-mentioning.

## Requisitos de hardware

- VRAM estimada para inferencia: GCT-0.6B sirve desde aproximadamente 5 GiB de memoria GPU; un proceso de serving ha mantenido 64 usuarios registrados dentro de 10,5 GiB en una tarjeta limitada a 40 GB.
- GPU recomendadas: A100-80GB (26,9 ms p50 con GCT-0.6B; 50,5 ms con GCT-4B), A800-40GB (31,1 ms con GCT-0.6B).
- CPU: servidor x86 con 32 núcleos a 201 ms por petición con GCT-0.6B.
- Edge: Raspberry Pi 5 a 486 ms por petición con GCT-0.6B.
- Cabe en GPU consumer: no se especifica en la información disponible; el requisito de ~5 GiB sugiere que podría ejecutarse en GPUs consumer con al menos 6-8 GiB, pero no hay confirmación oficial.
- Opciones de despliegue: no se detallan frameworks concretos (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: p50 de 26,9 ms (GCT-0.6B, A100), 50,5 ms (GCT-4B, A100), 31,1 ms (GCT-0.6B, A800-40GB), 201 ms (CPU x86 32 núcleos), 486 ms (Raspberry Pi 5). No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Recall@5 LoCoMo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GCT-0.6B | Recuperación sobre grafo | 0,6B | no disponible | 0,626 | Apache 2.0 | Pesos previstos para 2026-11-20 |
| GCT-4B | Recuperación sobre grafo | 4B (reportado) | no disponible | 0,686 | no disponible | Pesos no liberados |
| Qwen3-Reranker-4B | Reranker denso | 4B | no disponible | 0,556 | no disponible | Disponible |
| MemReranker-4B | Reranker de memoria | 4B | no disponible | 0,468 | no disponible | Disponible |
| HippoRAG 2 | Graph RAG | no disponible | no disponible | 0,530 | no disponible | Disponible |
| Qwen3-Embedding-8B | Embedding denso | 8B | no disponible | 0,577 | no disponible | Disponible |

La comparación se basa exclusivamente en los datos de la Tabla 1 de la model card. GCT-0.6B supera en recall@5 a rerankers de 4B y 8B y a sistemas Graph RAG con latencias muy inferiores (26,9 ms frente a 213-238 ms de los rerankers y 2,2 s de HippoRAG 2). No se dispone de datos de contexto ni de licencia de los sistemas comparados en la información proporcionada.

## Limitaciones y advertencias

- Solo se liberan los pesos de GCT-0.6B; GCT-4B y las etapas worth-mentioning de las variantes Pro no están disponibles en esta release.
- Los resultados publicados provienen de una única ejecución sobre el split de desarrollo de los benchmarks, no de un conjunto de test independiente ni de múltiples semillas.
- El modelo está entrenado para operar sobre el formato de grafo propietario de HooRii Mind; su uso fuera de ese formato no está documentado y podría degradar el rendimiento.
- Idiomas limitados a chino e inglés; no se reporta soporte para otras lenguas.
- No se detallan sesgos conocidos, tasas de alucinación ni comportamiento fuera de distribución en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el formato de grafo y el ecosistema HooRii Mind podrían tener sus propias condiciones no especificadas en la model card.
- El tamaño del repositorio figura como 0,0 GB en el momento de la consulta, lo que sugiere que los pesos aún no estaban subidos; verificar disponibilidad antes de planificar producción.
- La fecha de creación del repositorio (2026-10-30) y la release prevista (2026-11-20) indican que el modelo es muy reciente y carece de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HooRiiTechnology/hoorii-mindgct
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.

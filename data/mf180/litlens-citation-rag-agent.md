# MF180/LitLens-Citation-RAG-Agent

## Resumen

LitLens-Citation-RAG-Agent es un sistema de generación aumentada por recuperación (RAG) orientado a preguntas y respuestas sobre literatura científica, publicado por el usuario MF180 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un pipeline agéntico que combina un recuperador denso (`BAAI/bge-small-en-v1.5`), búsqueda léxica BM25 con fusión de rangos recíprocos (RRF, k=60) sobre FAISS, y un generador basado en `Qwen2.5-1.5B-Instruct` en formato GGUF o servido vía Groq LPU. La orquestación se implementa con LangGraph bajo un patrón plan-then-execute.

El problema que aborda es la verificación de citas en respuestas generadas sobre artículos de arXiv: cada afirmación se ancla a fragmentos concretos mediante identificadores `[paper_id#cN]`, y el sistema incorpora defensas frente a inyección de prompt en PDF no confiables (eliminación de spans con tamaño inferior a 2pt y texto blanco sobre blanco) y una compuerta de abstención calibrada (τ = 0,32) que evita fabricar citas en consultas fuera de dominio.

Su relevancia radica en el enfoque de producto: pila serverless íntegramente en capa gratuita de AWS (CloudFront, Lambda Function URLs, S3, DynamoDB provisionado, EventBridge y SES), demo pública y conjunto de evaluación propio (`MF180/litlens-golden-arxiv-qa`, 30 preguntas). El repositorio acumula 0 descargas y 1 like en el momento de la consulta, por lo que debe considerarse un proyecto incipiente y no un modelo de referencia consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline agéntico RAG (LangGraph plan-then-execute) con recuperación híbrida FAISS + BM25 (RRF k=60) y generador Qwen2.5-1.5B-Instruct |
| Parametros totales | 1,5 mil millones (modelo generador Qwen2.5-1.5B-Instruct); el recuperador bge-small-en-v1.5 es un modelo aparte de menor tamaño |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no se especifica en la model card; heredada del generador Qwen2.5, sin confirmación del autor) |
| Tipos de cuantizacion | GGUF (según modelo base Qwen2.5-1.5B-Instruct-GGUF); niveles concretos no disponibles |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generador); el artefacto publicado es un pipeline/sistema, no un checkpoint único |

## Arquitectura y entrenamiento

El sistema no entrena un modelo base propio. La componente generativa es `Qwen2.5-1.5B-Instruct`, un transformer decoder-only de 1,5 mil millones de parámetros distribuido en GGUF y también servido mediante Groq LPU. La componente de recuperación densa es `BAAI/bge-small-en-v1.5`, un encoder de frases afinado para embeddings; el autor lo etiqueta como `base_model:finetune`, aunque la model card no documenta un ajuste específico sobre el corpus de arXiv. Sobre ambos se construye una capa de recuperación híbrida que combina similitud vectorial en FAISS con BM25 y fusiona los rankings mediante Reciprocal Rank Fusion con k=60.

La orquestación sigue el patrón plan-then-execute de LangGraph: el agente planifica los pasos de búsqueda, ejecuta recuperaciones sucesivas y verifica las citas después de la generación. Las innovaciones destacadas son la verificación post-generación de cada afirmación contra fragmentos de PDF/arXiv, el sandboxing de contenido no confiables dentro de etiquetas XML `<untrusted_paper_content>` tras eliminar spans microscópicos y texto blanco (defensa anti prompt-injection), la generación de matrices de revisión de literatura mediante map-reduce por artículo, y una compuerta de abstención con umbral τ = 0,32. No se documentan volúmenes de tokens de entrenamiento, composición del dataset de ajuste ni etapas de RLHF o DPO.

## Capacidades

- Respuesta a preguntas sobre artículos de arXiv con citas verificables a nivel de fragmento mediante identificadores `[paper_id#cN]`.
- Verificación de citas posterior a la generación: cada afirmación se contrasta con los fragmentos recuperados.
- Recuperación híbrida densa y léxica (FAISS + BM25 con RRF k=60) para mejorar la cobertura frente a consultas con terminología específica.
- Abstención calibrada ante consultas fuera de dominio, con umbral τ = 0,32, para evitar citas fabricadas.
- Defensa frente a inyección de prompt en PDF no confiables: eliminación de spans menores de 2pt y de texto blanco sobre blanco, y aislamiento del contenido en etiquetas XML.
- Generación de matrices de revisión de literatura comparativas mediante extracción estructurada por artículo y compilación map-reduce.
- Capacidad agéntica multi-paso (planificación y ejecución) orquestada con LangGraph.
- Despliegue serverless en AWS (CloudFront, Lambda Function URLs, S3, DynamoDB, EventBridge, SES) y demo en Hugging Face Spaces.
- Soporte de tool calling / function calling: no documentado explícitamente en la model card.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Revisión de literatura asistida: el agente recupera fragmentos de varios artículos de arXiv y compila matrices comparativas lado a lado, lo que resulta adecuado para revisiones sistemáticas donde se necesita contrastar metodologías y resultados entre papers.
- Verificación de afirmaciones en borradores científicos: dado un texto con referencias, el sistema puede comprobar si cada afirmación está respaldada por un fragmento concreto del artículo citado, gracias a la verificación post-generación y a las citas `[paper_id#cN]`.
- Asistente de lectura de PDF propios: al integrar la capa de ingesta, el pipeline indexa PDFs en FAISS y BM25 y responde preguntas con trazabilidad al fragmento, con defensa incorporada frente a instrucciones maliciosas embebidas en el documento.
- Atención a consultas de investigadores en un portal interno: el despliegue serverless en Lambda permite ofrecer un endpoint HTTPS de bajo coste para equipos pequeños, con abstención calibrada cuando la pregunta queda fuera del corpus indexado.
- Generación de resúmenes estructurados por artículo: el patrón map-reduce extrae campos definidos (objetivo, método, dataset, métricas) de cada paper y los agrega en una tabla, útil para informes de estado del arte.
- Filtrado de consultas fuera de dominio en producción: la compuerta de abstención (τ = 0,32) permite derivar a un humano o rechazar preguntas ajenas al corpus sin generar citas inventadas, lo que reduce el riesgo reputacional en asistentes documentales.
- Prototipado de agentes RAG con verificación de fuentes: el código en GitHub y la orquestación LangGraph sirven como plantilla para construir copilotos documentales con requisitos de trazabilidad estrictos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, no verificados de forma independiente, sobre el conjunto `MF180/litlens-golden-arxiv-qa` (30 preguntas):

| Metrica | Valor | Verificado |
|---|---|---|
| Retrieval Hit@5 (%) | 90,0 | No |
| Mean Reciprocal Rank (MRR) | 0,900 | No |
| Citation Precision (%) | 90,0 | No |
| Out-of-Domain Abstention Accuracy (%) | 100,0 | No |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con otros sistemas RAG.

## Requisitos de hardware

- VRAM estimada para el generador: el modelo Qwen2.5-1.5B-Instruct en GGUF requiere aproximadamente 1-2 GB en cuantización de 4 bits y alrededor de 3-4 GB en FP16, según el nivel de cuantización elegido (cifras estimadas por tamaño de parámetros; el autor no las publica).
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM es suficiente para el generador en GGUF; para el encoder bge-small-en-v1.5 basta CPU o GPU de gama baja. En despliegue en la nube, el autor utiliza Groq LPU para la inferencia del generador.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en CPU mediante llama.cpp por el tamaño reducido del generador.
- Opciones de despliegue: llama.cpp / Ollama para el GGUF, Groq LPU para inferencia gestionada, AWS Lambda con Function URLs para el pipeline completo, y Hugging Face Spaces para la demo. vLLM y TGI no están documentados por el autor, aunque serían viables para el generador en formato completo.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Sistema | Enfoque | Modelo generador | Contexto | Verificación de citas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LitLens-Citation-RAG-Agent | RAG agéntico con verificación de citas y abstención | Qwen2.5-1.5B-Instruct (GGUF/Groq) | No disponible | Sí, a nivel de fragmento `[paper_id#cN]` | Apache 2.0 | Hugging Face, GitHub, demo AWS y HF Spaces |
| Pipeline RAG genérico con LlamaIndex o LangChain | RAG con recuperación vectorial estándar | Cualquiera (p. ej. Llama 3.1 8B, Qwen2.5) | Depende del generador | No nativa; requiere implementación propia | Depende de componentes | Amplia |
| Asistentes comerciales de literatura científica (p. ej. Elicit, Consensus) | Producto cerrado con recuperación sobre corpus propios | No público | No público | Sí, con enlaces a fuentes | Propietaria | SaaS |
| Modelos de QA académico tipo SciBERT o SPECTER2 + QA | Recuperación y QA supervisado sobre corpus científicos | Encoders específicos de dominio | Limitado (512 tokens típicamente) | No | Apache 2.0 / MIT | Hugging Face |

La comparación con productos comerciales es cualitativa: no hay datos públicos de rendimiento comparables en el mismo conjunto de evaluación.

## Limitaciones y advertencias

- Los resultados de benchmarks proceden del propio autor, marcados como no verificados, y se calculan sobre un conjunto de solo 30 preguntas, lo que limita su significación estadística.
- El sistema solo está evaluado y documentado en inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- El generador de 1,5 mil millones de parámetros tiene capacidad de razonamiento limitada en comparación con modelos de mayor tamaño; la calidad final depende en gran medida de la recuperación.
- La verificación de citas reduce pero no elimina el riesgo de alucinación: una cita puede apuntar a un fragmento real sin respaldar correctamente la afirmación.
- El corpus objetivo es arXiv; el rendimiento sobre literatura no indexada, patentes o documentación técnica interna no está evaluado.
- La compuerta de abstención está calibrada con un umbral fijo (τ = 0,32) sobre un conjunto pequeño; puede requerir recalibración en dominios distintos.
- El repositorio tiene 0 descargas y 1 like, sin historial de mantenimiento ni auditoría externa; no se recomienda su uso en producción sin revisión del código y de la cadena de dependencias.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar las licencias de los componentes (Qwen2.5, bge-small-en-v1.5, LangGraph, FAISS) antes de desplegar.
- El coste declarado se basa en la capa gratuita de AWS; superados los límites de Lambda, DynamoDB o SES, el coste y los límites de concurrencia pueden degradar el servicio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MF180/LitLens-Citation-RAG-Agent
- Demo en AWS CloudFront: https://d3hktea6lg4yfr.cloudfront.net
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/MF180/LitLens
- Dataset de evaluación: https://huggingface.co/datasets/MF180/litlens-golden-arxiv-qa
- Código fuente en GitHub: https://github.com/farazmalik180/LitLens
- Modelo base generador: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- Modelo base de embeddings: https://huggingface.co/BAAI/bge-small-en-v1.5

# nlpai-lab/KURE-Sparse-nano

## Resumen

KURE-Sparse-nano es un modelo de recuperación dispersa aprendida (learned sparse retrieval, LSR) de tipo SPLADE, desarrollado por el laboratorio nlpai-lab de la Universidad de Corea. Está diseñado específicamente para búsqueda y recuperación de información (retrieval) en coreano e inglés, y se distribuye como un codificador compacto de 149,4 millones de parámetros (0,1B) construido sobre una arquitectura ModernBERT y afinado a partir del modelo base nlpai-lab/KURE-v2-unsupervised.

El modelo resuelve el problema de la recuperación léxica-semántica eficiente: en lugar de generar vectores densos, produce representaciones dispersas sobre un vocabulario fijo de 36.282 términos, lo que permite indexar documentos en un índice invertido clásico y, al mismo tiempo, inspeccionar qué términos han activado la coincidencia. Según la model card, alcanza un promedio de 0,7716 nDCG@10 en las nueve tareas de MTEB(kor, v2) Retrieval, situándose como estado del arte entre los modelos dispersos de menos de 0,5B que soportan coreano, y superando a modelos densos mucho mayores como pplx-embed-v1-4b y harrier-oss-v1-27b.

Su relevancia actual radica en que ofrece recuperación de alta calidad para coreano con un coste computacional y de almacenamiento muy reducido (repositorio de 0,3 GB), con soporte de documentos de hasta 8.192 tokens y una dispersión muy agresiva (unas 147 dimensiones activas por consulta y 843 por documento). Está pensado para integrarse en pipelines RAG y sistemas de búsqueda mediante sentence-transformers o la API alojada en kure.kullm.ai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), codificador disperso tipo SPLADE |
| Parametros totales | 149.373.778 (0,1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Vocabulario disperso | 36.282 términos fijos |
| Dimensiones activas medias | 147 por consulta, 843 por documento |
| Modelo base | nlpai-lab/KURE-v2-unsupervised |
| Librería | sentence-transformers (SparseEncoder) |
| Pipeline | feature-extraction |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

KURE-Sparse-nano es un codificador disperso aprendido de estilo SPLADE construido sobre ModernBERT. Cada texto se proyecta sobre un vocabulario fijo de 36.282 términos, de modo que la salida es un vector disperso de esa dimensión en el que solo se activan los términos relevantes (con sus pesos). Esta representación permite usar índices invertidos estándar y hace que las coincidencias sean auditables, a diferencia de los embeddings densos. El modelo incorpora marcadores específicos de consulta y documento (encode_query / encode_document), que deben usarse para replicar el comportamiento de entrenamiento.

Según el repositorio de entrenamiento del proyecto (KURE/train/sparse), las recetas que produjeron KURE-Sparse-base y KURE-Sparse-nano consisten en destilar un recuperador SPLADE a partir de un profesor Qwen3-Reranker, añadiendo un término contrastivo in-batch, y se entrenan con SparseEncoder de sentence-transformers. La model card no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset; esa información no está disponible en la documentación proporcionada. La evaluación se realiza sobre las nueve tareas de MTEB(kor, v2) Retrieval.

## Capacidades

- Recuperación de información dispersa (learned sparse retrieval): genera representaciones dispersas sobre un vocabulario fijo de 36.282 términos, aptas para índices invertidos.
- Búsqueda semántica y léxica combinada: los términos activados son inspeccionables, lo que facilita la depuración y la explicabilidad de las coincidencias.
- Soporte de documentos largos: hasta 8.192 tokens por entrada.
- Multilingüe limitado a coreano e inglés.
- Extracción de características (feature-extraction) mediante sentence-transformers con la clase SparseEncoder.
- Puntuación por producto escalar (dot-product) entre consulta y documento.
- Marcadores diferenciados de consulta y documento para un uso correcto en recuperación asimétrica.
- Acceso vía API alojada (kure.kullm.ai) con devolución opcional de los términos asociados a cada índice.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Búsqueda documental en coreano dentro de sistemas RAG: el modelo indexa pasajes de hasta 8.192 tokens en un índice invertido y recupera los más relevantes para una consulta, con un coste de almacenamiento bajo gracias a sus 843 dimensiones activas por documento.
- Motores de búsqueda empresarial con corpus mixtos coreano-inglés: al soportar ambos idiomas y usar representaciones dispersas, puede desplegarse sobre infraestructura de búsqueda léxica existente (Elasticsearch, OpenSearch) sin necesidad de bases de datos vectoriales densas.
- Recuperación en dominios especializados: las tareas de evaluación incluyen LawIRKo (dominio legal) y PubHealthQA (salud pública), por lo que el modelo es adecuado para asistentes de consulta sobre normativa o documentación sanitaria en coreano.
- Atención al cliente y FAQ: recuperación de respuestas candidatas a partir de una base de conocimiento coreana antes de pasarlas a un modelo generativo, reduciendo el contexto enviado al LLM.
- Búsqueda académica y de noticias: recuperación sobre colecciones largas (MLDR, MIRACL) con consultas en lenguaje natural, aprovechando la ventana de 8.192 tokens para pasajes extensos.
- Sistemas de recuperación aumentada con reranking posterior: el modelo actúa como primera etapa de recuperación (retriever) y puede combinarse con KURE-Reranker-nano del mismo proyecto para refinar los resultados.
- Integración vía API en prototipos: mediante kure.kullm.ai se puede evaluar la calidad de recuperación sin desplegar infraestructura propia, con hasta 8 textos por petición.

## Benchmarks y rendimiento

Resultados de nDCG@10 en las nueve tareas de MTEB(kor, v2) Retrieval, según la model card:

| Tarea | nDCG@10 |
|---|---|
| AutoRAG | 0,9360 |
| PubHealthQA | 0,7711 |
| Ko-StrategyQA | 0,7924 |
| LawIRKo | 0,7226 |
| SQuADKorV1 | 0,9774 |
| Belebele (ko-ko) | 0,9608 |
| MrTidy | 0,5618 |
| MLDR | 0,5133 |
| MIRACL | 0,7091 |
| **Promedio** | **0,7716** |

La model card indica que supera a modelos densos mayores como pplx-embed-v1-4b y harrier-oss-v1-27b, pero no se proporcionan en la información disponible las puntuaciones numéricas de esos modelos comparados, por lo que no se incluyen en la tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 149 millones de parámetros, en precisión completa (fp32) requiere aproximadamente 0,6 GB de pesos; en fp16 alrededor de 0,3 GB. Con overhead de activaciones y lotes pequeños, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090). Para despliegues de alto throughput, A100 o H100 ofrecen margen de sobra, aunque el modelo no las necesita.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: sentence-transformers con SparseEncoder, Text Embeddings Inference (el tag text-embeddings-inference está presente), la API alojada en kure.kullm.ai, o exportación a índices invertidos para motores de búsqueda léxica. No se indica compatibilidad con llama.cpp, Ollama ni vLLM en la información disponible.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | nDCG@10 medio (MTEB kor v2) |
|---|---|---|---|---|---|---|
| KURE-Sparse-nano | Disperso (SPLADE) | 0,1B | 8.192 | ko, en | Apache 2.0 | 0,7716 |
| KURE-v3 | Denso | no disponible | no disponible | ko, en | no disponible | no disponible en la información |
| pplx-embed-v1-4b | Denso | 4B | no disponible | no disponible | no disponible | inferior según la model card (sin cifra) |
| harrier-oss-v1-27b | Denso | 27B | no disponible | no disponible | no disponible | inferior según la model card (sin cifra) |

La model card afirma que KURE-Sparse-nano supera a pplx-embed-v1-4b y harrier-oss-v1-27b pese a ser mucho menor, pero no se aportan las puntuaciones exactas de esos modelos en la información disponible, por lo que la comparación numérica directa no puede completarse.

## Limitaciones y advertencias

- Modelo especializado en recuperación: no genera texto ni soporta razonamiento, tool calling o tareas generativas.
- Cobertura lingüística limitada a coreano e inglés; el rendimiento en otros idiomas no está documentado y previsiblemente será bajo.
- El vocabulario disperso está fijado en 36.282 términos, lo que puede limitar la cobertura de terminología muy específica o de nuevos dominios no vistos en entrenamiento.
- Riesgo de sesgos heredados de los datos de entrenamiento y del profesor Qwen3-Reranker utilizado en la destilación; la model card no documenta análisis de sesgo.
- Posible degradación en dominios muy alejados de las tareas de evaluación (legal, salud, académico), como sugieren los resultados más bajos en MLDR (0,5133) y MrTidy (0,5618).
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del modelo base KURE-v2-unsupervised y del profesor utilizado en la destilación.
- El uso correcto exige emplear los marcadores de consulta y documento (encode_query / encode_document); usarlo como un encoder simétrico convencional degradará la calidad.
- No se han publicado datos sobre cuantización ni sobre latencia en producción en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nlpai-lab/KURE-Sparse-nano
- Repositorio GitHub del proyecto KURE: https://github.com/nlpai-lab/KURE
- Recetas de entrenamiento sparse: https://github.com/nlpai-lab/KURE/tree/main/train/sparse
- API alojada: https://kure.kullm.ai/
- Modelo base: https://huggingface.co/nlpai-lab/KURE-v2-unsupervised
- Modelo denso relacionado: https://huggingface.co/nlpai-lab/KURE-v3

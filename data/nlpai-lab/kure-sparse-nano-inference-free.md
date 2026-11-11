# nlpai-lab/KURE-Sparse-nano-inference-free

## Resumen

KURE-Sparse-nano-inference-free es un modelo de recuperación dispersa aprendida (learned sparse retrieval, LSR) de tipo SPLADE desarrollado por el laboratorio nlpai-lab, especializado en recuperación bilingüe coreano-inglés. Su particularidad es que las consultas no requieren ninguna pasada forward por la red neuronal: se tokenizan y cada término se busca en una tabla de pesos aprendida, mientras que solo los documentos se codifican con el encoder neuronal (una única vez, en el momento de la indexación). Esto lo convierte en un modelo especialmente adecuado para servir búsqueda en CPU a gran escala.

El modelo es la variante "inference-free" de KURE-Sparse-nano, del que hereda el backbone del encoder de documentos. Con 0,1B parámetros, produce vectores dispersos en un vocabulario fijo de 36.282 términos, lo que permite indexación en índices invertidos y hace inspeccionables los términos coincidentes. Alcanza un promedio de 0,7360 nDCG@10 en las nueve tareas de MTEB(kor, v2) Retrieval, el mejor resultado entre los modelos dispersos inference-free evaluados por sus autores, con un tercio de los FLOPs de recuperación de KURE-Sparse-nano.

Su relevancia actual radica en la combinación de calidad de recuperación, coste de serving casi nulo en consultas (unos 3 ms por consulta en un solo hilo de CPU, 0,3 ms en lote) y soporte de documentos largos de hasta 8.192 tokens, lo que lo posiciona como una alternativa práctica a los retrievers densos en pipelines de RAG y motores de búsqueda sobre coreano e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabecera SPLADE (log(1 + ReLU(logits)), max-pooling sobre tokens) |
| Parametros totales | 0,1B (encoder de documentos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Vocabulario disperso | 36.282 términos fijos |
| Dimensiones activas | ~20 por consulta, ~958 por documento (media) |
| Coste por par consulta-documento | 7,9 FLOPs (KURE-Sparse-nano: 23,0) |
| Modelo base | nlpai-lab/KURE-v2-unsupervised |
| Librería | sentence-transformers (SparseEncoder, requiere `trust_remote_code=True`) |
| Pipeline | feature-extraction |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de recuperación dispersa aprendida de estilo SPLADE. Los documentos se prefijan con `[D] ` y se codifican mediante un encoder transformer de 0,1B parámetros que proyecta cada token a logits sobre el vocabulario de 36.282 términos, aplica `log(1 + ReLU(logits))` y agrega mediante max-pooling sobre la secuencia. Las consultas, en cambio, no pasan por la red: se tokenizan y cada término presente se busca en una tabla de pesos aprendida (un término repetido cuenta una sola vez y los tokens especiales se ignoran). La tabla se inicializa con el IDF BM25 de cada término sobre los documentos de entrenamiento y se entrena conjuntamente con el encoder de documentos. Las continuaciones WordPiece y sus formas iniciales de palabra comparten dimensión (por ejemplo, `계약` y `##계약`), de modo que un término de consulta coincide con el término del documento independientemente de cómo se haya segmentado. La puntuación final es el producto escalar entre el vector disperso de la consulta y el del documento.

El encoder de documentos parte del mismo backbone que KURE-Sparse-nano. Se preajustó de forma contrastiva y después se destiló desde Qwen3-Reranker-8B sobre datos de recuperación en coreano e inglés, manteniendo el entrenamiento de la tabla de consultas durante todo el proceso. La innovación principal es precisamente la eliminación del forward de consulta: al sustituir la codificación neuronal de la query por una búsqueda en tabla, el coste de serving en consultas se reduce a una llamada al tokenizador más un lookup, sin necesidad de GPU en tiempo de búsqueda.

## Capacidades

- Generación de representaciones dispersas para recuperación de información (no es un modelo generativo).
- Codificación de documentos con encoder neuronal SPLADE y ventana de hasta 8.192 tokens.
- Codificación de consultas sin red neuronal: tokenización más lookup en tabla de pesos aprendida.
- Recuperación bilingüe coreano-inglés.
- Representaciones compatibles con índices invertidos y con inspección de términos coincidentes.
- Puntuación por producto escalar entre vectores dispersos de 36.282 dimensiones.
- Extracción de features (pipeline `feature-extraction`) mediante `SparseEncoder` de sentence-transformers.
- Capacidad de ejecución en CPU para la fase de consulta (sin GPU en serving).
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo thinking.

## Casos de uso

- Búsqueda documental en coreano a gran escala: el modelo indexa documentos una sola vez con el encoder neuronal y sirve consultas en CPU con ~3 ms de latencia por consulta en un solo hilo, lo que permite atender picos de tráfico sin flota de GPU.
- Recuperación en pipelines RAG bilingües coreano-inglés: se usa como retriever de primera etapa sobre corpus mixtos, aprovechando que los vectores dispersos encajan en índices invertidos y que los términos coincidentes son auditables.
- Atención al cliente con base de conocimiento: las consultas de usuarios se resuelven por lookup en tabla y los documentos de FAQ o manuales se codifican con el encoder, con contexto de hasta 8.192 tokens para artículos largos.
- Búsqueda legal o administrativa en coreano: el benchmark LawIRKo (0,5970 nDCG@10) indica un rendimiento razonable en dominios especializados, útil para localizar cláusulas o normativa en corpus extensos.
- Búsqueda en documentación técnica y código en inglés: con soporte de inglés y ventana larga, permite indexar READMEs, manuales y referencias de API y recuperar fragmentos relevantes.
- Sistemas de recuperación con requisitos de explicabilidad: al ser disperso y compartir dimensiones entre términos de consulta y documento, se puede mostrar al usuario qué términos han contribuido a la coincidencia.
- Despliegue en entornos con recursos limitados: al no requerir GPU en serving de consultas, encaja en arquitecturas edge o contenedores sin acelerador para la fase de búsqueda.
- Reordenación o filtrado previo barato: con 7,9 FLOPs por par consulta-documento, puede usarse como primera etapa antes de un reranker neuronal más costoso.

## Benchmarks y rendimiento

Evaluación sobre las nueve tareas de MTEB(kor, v2) Retrieval, métrica nDCG@10:

| Modelo | Tipo | Params | Avg | AutoRAG | PubHealthQA | Ko-StrategyQA | LawIRKo | SQuADKorV1 | Belebele (ko-ko) | MrTidy | MLDR | MIRACL |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| nlpai-lab/KURE-Sparse-nano-inference-free | Sparse (inference-free) | 0,1B | 0,7360 | 0,9423 | 0,7772 | 0,7568 | 0,5970 | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

Los datos de las columnas SQuADKorV1, Belebele (ko-ko), MrTidy, MLDR y MIRACL no están completos en la información proporcionada. No se han publicado en la información disponible resultados de benchmarks de otros modelos comparables (MMLU, HumanEval, GSM8K no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder de documentos de 0,1B parámetros ocupa aproximadamente 0,2 GB en fp16 y en torno a 0,4 GB en fp32; la codificación de consultas no requiere VRAM alguna.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre sirve para la fase de indexación de documentos; para serving de consultas no se necesita GPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para indexación de pequeños corpus.
- Opciones de despliegue: sentence-transformers con `SparseEncoder` y `trust_remote_code=True`; los vectores dispersos resultantes se pueden almacenar en motores de búsqueda con soporte de índices invertidos (por ejemplo, motores tipo Lucene o sistemas de recuperación dispersa). No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: ~3 ms por consulta individual en un solo hilo de CPU y ~0,3 ms por consulta en lote; la codificación de documentos es la única fase que usa la red neuronal y se ejecuta una sola vez por documento en la indexación.

## Comparativa con modelos similares

| Modelo | Tipo | Params | Contexto | Avg nDCG@10 (MTEB kor v2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KURE-Sparse-nano-inference-free | Sparse inference-free | 0,1B | 8.192 | 0,7360 | Apache 2.0 | Hugging Face |
| KURE-Sparse-nano | Sparse (con forward en consulta) | 0,1B | no disponible | no disponible en el extracto | Apache 2.0 (según modelo base) | Hugging Face |
| Qwen3-Reranker-8B | Reranker denso (profesor de destilación) | 8B | no disponible | no aplica (reranker) | no disponible | Hugging Face |

La información proporcionada solo incluye datos completos de KURE-Sparse-nano-inference-free y referencias a KURE-Sparse-nano y Qwen3-Reranker-8B; no se dispone de cifras comparativas de otros modelos dispersos inference-free de la competencia.

## Limitaciones y advertencias

- Modelo especializado en recuperación: no genera texto, no razona y no responde preguntas; solo produce representaciones para búsqueda.
- Cobertura lingüística limitada a coreano e inglés; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- El vocabulario disperso está fijado en 36.282 términos, por lo que términos fuera de ese vocabulario no pueden representarse.
- La calidad en dominios especializados es desigual: LawIRKo obtiene 0,5970 nDCG@10, por debajo del promedio general, lo que sugiere menor rendimiento en textos legales.
- Riesgo de falsos positivos por coincidencia léxica: al ser un modelo disperso, términos polisémicos pueden generar coincidencias no deseadas; la inspección de términos ayuda a diagnosticarlo.
- La tabla de pesos de consulta se inicializa con IDF BM25 y se entrena con los datos del autor; su calibración puede no transferirse bien a dominios o distribuciones léxicas muy distintas.
- Requiere `trust_remote_code=True` para cargar los módulos personalizados (`pooling.py`), lo que implica ejecutar código del repositorio del autor.
- Licencia Apache 2.0, que permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento y del modelo base KURE-v2-unsupervised.
- No se documentan sesgos específicos ni tasas de alucinación (no aplica al no ser generativo), pero el rendimiento en subgrupos lingüísticos o dialectales del coreano no está evaluado.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica adopción muy temprana y poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nlpai-lab/KURE-Sparse-nano-inference-free
- Variante con forward en consulta (KURE-Sparse-nano): https://huggingface.co/nlpai-lab/KURE-Sparse-nano
- Modelo base (KURE-v2-unsupervised): https://huggingface.co/nlpai-lab/KURE-v2-unsupervised
- Repositorio GitHub del proyecto KURE: https://github.com/nlpai-lab/KURE
- Profesor de destilación (Qwen3-Reranker-8B): https://huggingface.co/Qwen/Qwen3-Reranker-8B

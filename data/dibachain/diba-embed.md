# Dibachain/Diba-Embed

## Resumen

Diba-Embed es un modelo de embeddings de texto desarrollado por Dibachain, presentado como el primer modelo de la familia Diba dedicado exclusivamente a representaciones vectoriales densas. Está diseñado con un enfoque *Persian-first*: convierte texto en persa y en inglés en vectores de 1024 dimensiones que sitúan significados similares cerca en el espacio, cubriendo así un nicho en el que la mayoría de modelos abiertos rinden por debajo de lo deseable. Es relevante ahora porque buena parte de la infraestructura RAG y de búsqueda semántica en ecosistemas persa-hablantes carece de encoders ajustados al idioma, y este modelo se distribuye con licencia Apache 2.0 y artefactos GGUF listos para CPU.

El modelo cuenta con aproximadamente 595 millones de parámetros (0,6B) en formato safetensors, una longitud máxima de entrada de 32.768 tokens y embeddings de tamaño 1024 con soporte Matryoshka truncable hasta 32 dimensiones. Se distribuye a través de la librería `sentence-transformers`, requiere `trust_remote_code=True` por incluir una definición de modelo propia, y ofrece pesos en safetensors y GGUF (f16, q8_0 y q4_k_m) para inferencia tanto en GPU como en CPU mediante llama.cpp.

Su propósito es estrictamente de recuperación y representación: no genera texto. Está pensado para búsqueda semántica, RAG, emparejamiento de FAQ, clustering, deduplicación y reranking, con soporte de coincidencia cruzada persa-inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder con pooling de último token; definición de modelo propia (`trust_remote_code=True`); no se detalla la arquitectura interna en la información disponible |
| Parámetros totales | 595.776.512 (~0,6B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (máximo de entrada) |
| Tipos de cuantización | GGUF f16 (~1,2 GB), q8_0 (~0,6 GB), q4_k_m (~0,4 GB); pesos completos en safetensors (~1,2 GB) |
| Idiomas soportados | Persa (fa) e inglés (en); etiquetado como multilingüe con optimización para persa e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo encoder de tipo transformer orientado a *feature extraction* y *sentence similarity*, con un tamaño de embedding de 1024 dimensiones y capacidad Matryoshka (truncable hasta 32). El pipeline de recuperación emplea pooling sobre el último token no de padding y normalización de vectores para puntuar por similitud coseno. El modelo incorpora un prompt de consulta integrado (`prompt_name="query"`) y una instrucción explícita para consultas en el flujo con `transformers` (`"Instruct: Given a query, retrieve passages that answer it\nQuery: ..."`), mientras que los documentos se embeben sin instrucción.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste contrastivo con negativos minados. Tampoco se detalla la arquitectura base sobre la que se construye. La model card sí indica que el benchmark interno se midió sin entrenamiento específico de tarea (*no task-specific training*), lo que sugiere un ajuste genérico de recuperación. Cualquier dato adicional sobre el proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para texto en persa e inglés, con similitud coseno como métrica recomendada.
- Búsqueda semántica en persa: recupera el pasaje relevante aunque la formulación de la consulta difiera del documento.
- Recuperación para RAG: selección de pasajes para fundamentar modelos generativos como Diba-Base.
- Coincidencia cruzada persa-inglés: una consulta en persa puede recuperar pasajes en inglés y viceversa.
- Clustering y deduplicación de tickets, comentarios o productos; detección de casi duplicados.
- Reranking de candidatos por relevancia respecto a una consulta.
- Embeddings Matryoshka: truncables de 1024 hasta 32 dimensiones para reducir coste de almacenamiento y latencia en búsqueda aproximada.
- Entrada de hasta 32.768 tokens, adecuada para pasajes largos o documentos completos.
- Inferencia en CPU mediante llama.cpp con pooling de último token y servidor compatible con la API de embeddings de OpenAI.
- No soporta generación de texto, tool calling ni razonamiento multi-paso; es exclusivamente un encoder.

## Casos de uso

- Búsqueda semántica en corpus persas: indexar documentos en persa y consultar con lenguaje natural; el modelo está ajustado para recuperar el pasaje correcto aunque cambie el léxico, con Recall@1 del 82% en el benchmark del autor.
- RAG sobre documentación propia: usar Diba-Embed como retriever y un modelo generativo como Diba-Base como generador, aprovechando la ventana de 32.768 tokens para pasajes extensos.
- Atención al cliente y FAQ: emparejar preguntas de usuarios con respuestas canónicas en persa, con umbral de similitud coseno sobre embeddings normalizados; el Recall@3 del 95% permite derivar a revisión humana solo en el 5% restante.
- Deduplicación de tickets y comentarios: agrupar incidencias casi idénticas mediante clustering sobre embeddings truncados a 128 o 256 dimensiones para acelerar el cálculo.
- Búsqueda bilingüe persa-inglés: en bases de conocimiento mixtas, una consulta en persa recupera documentación técnica en inglés, útil en equipos con documentación heterogénea.
- Reranking en pipelines de dos etapas: recuperación léxica o ANN seguida de reordenación con Diba-Embed para mejorar la precisión del top-k final.
- Despliegue en entornos sin GPU: servir embeddings con `llama-server` y el GGUF q8_0 (~0,6 GB) en CPU, sin dependencias de Python, para servicios de búsqueda de bajo coste.
- Clasificación y exploración de catálogos: agrupar productos o artículos por temática en comercio electrónico persa usando similitud entre embeddings.

## Benchmarks y rendimiento

El autor publica un benchmark de recuperación en persa sobre 400 pares pregunta/respuesta extraídos de datos propios (historia de Irán, temas contemporáneos y preguntas y respuestas de la empresa Dibachain). Cada pregunta debe recuperar su pasaje correcto del conjunto completo. Medición greedy, en CPU y sin entrenamiento específico de tarea.

| Métrica | Resultado |
|---|---|
| Recall@1 | 82% |
| Recall@3 | 95% |
| MRR | 0,89 |

No se han publicado resultados de benchmarks estándar (MMLU, MTEB, etc.) ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1,2 GB de pesos más memoria de activaciones; con batch pequeño cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GGUF q8_0 (~0,6 GB) y q4_k_m (~0,4 GB): inferencia viable en CPU, sin GPU.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente, y A100/H100 solo tendrían sentido para indexación masiva en batch.
- Cabe en GPU consumer: sí, con amplio margen, incluso en fp16.
- Opciones de despliegue: `sentence-transformers`, `transformers` con `trust_remote_code=True`, llama.cpp (`llama-server --embedding --pooling last`) con endpoint compatible con `/v1/embeddings`. No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor indica que el benchmark se ejecutó en CPU de forma greedy, pero no publica cifras de latencia ni de embeddings por segundo.

## Comparativa con modelos similares

No se dispone en la información proporcionada de comparaciones con otros modelos de embeddings (por ejemplo, encoders multilingües de tamaño similar). Los datos objetivos disponibles de Diba-Embed son:

| Modelo | Parámetros | Contexto | Embedding | Idiomas | Licencia | Benchmark publicado |
|---|---|---|---|---|---|---|
| Diba-Embed | ~0,6B | 32.768 | 1024 (Matryoshka hasta 32) | fa, en | Apache 2.0 | Recall@1 82%, Recall@3 95%, MRR 0,89 (interno, persa) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos de modelos comparables, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo no genera texto: es un encoder de embeddings y no debe usarse para chat ni generación.
- Calidad más alta en persa general y formal y en los dominios del benchmark del autor; texto muy especializado o ruidoso puede requerir adaptación de dominio.
- Refleja los sesgos presentes en sus datos de entrenamiento; no se detallan análisis de sesgo en la información disponible.
- Riesgo de recuperaciones incorrectas en consultas ambiguas o fuera de dominio; el propio benchmark reporta un 5% de casos en los que el pasaje correcto no aparece en el top-3.
- Es necesario aplicar el prompt de consulta solo a las queries y embeber los documentos sin instrucción; omitir esta distinción degrada la calidad de recuperación.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene revisar la implementación antes de desplegar en producción.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- No se publican cifras de latencia, throughput ni comparativas con modelos estándar, lo que dificulta estimar costes operativos sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dibachain/Diba-Embed
- Sitio web de Dibachain: https://dibachain.ir
- Agente Diba: https://dibaai-diba-agent.hf.space
- Demo de chat (GPU): https://huggingface.co/spaces/DibaAi/diba-chat-gpu
- Demo de chat (CPU): https://huggingface.co/spaces/DibaAi/diba-chat
- Modelo Diba-Base: https://huggingface.co/Dibachain/Diba-Base
- GGUF q8_0: https://huggingface.co/Dibachain/Diba-Embed/resolve/main/diba-embed-q8_0.gguf
- GGUF q4_k_m: https://huggingface.co/Dibachain/Diba-Embed/resolve/main/diba-embed-q4_k_m.gguf
- GGUF f16: https://huggingface.co/Dibachain/Diba-Embed/resolve/main/diba-embed-f16.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp

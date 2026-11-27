# sindhisalam/minilm-contracts-ft

## Resumen

minilm-contracts-ft es un modelo de embeddings de frases (sentence transformer) obtenido por ajuste fino de `sentence-transformers/all-MiniLM-L6-v2` para la recuperación de pasajes de cláusulas en contratos comerciales. Lo desarrolla el usuario sindhisalam como parte del proyecto ContractLens, un experimento de recuperación y respuesta con fundamento (grounded answering) evaluado sobre el corpus CUAD. Su función es actuar como retriever denso: dada una pregunta sobre una cláusula contractual, devuelve el fragmento del contrato que la responde.

El modelo mantiene la arquitectura BERT de 6 capas del MiniLM original, con 22.713.216 parámetros totales y un repositorio de solo 0,1 GB, lo que lo hace muy ligero para despliegue en CPU o GPU de consumo. El ajuste se realizó exclusivamente sobre 357 contratos de entrenamiento de CUAD v1, generando 9.655 tripletas de consulta, pasaje positivo y negativo BM25.

Su relevancia radica en la mejora medida sobre el modelo base en un conjunto de test sellado: Recall@1 pasa de 0,439 a 0,765 y MRR@10 de 0,583 a 0,848. Es un modelo de investigación y portfolio, no una herramienta de asesoramiento legal, y está publicado con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (MiniLM, 6 capas), encoder de frases |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el chunk de entrenamiento es de 800 caracteres; el modelo base all-MiniLM-L6-v2 admite hasta 256 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en FP32/FP16; compatible con cuantizacion posterior via herramientas externas) |
| Idiomas soportados | no disponible (entrenado y evaluado sobre contratos en ingles de CUAD) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT de 6 capas derivado de all-MiniLM-L6-v2, que produce embeddings de frase normalizables para similitud coseno. No emplea arquitecturas MoE, SSM ni híbridas: es un transformer denso estándar orientado a recuperación densa (dense retrieval) mediante SentenceTransformers.

El entrenamiento usó únicamente los 357 contratos de entrenamiento de CUAD v1 (CC BY 4.0), sin tocar los splits de dev y test. Se construyeron 9.655 tripletas: una consulta (cinco formulaciones redactadas con asistencia de IA por tipo de cláusula), un chunk positivo de 800 caracteres y un negativo BM25 extraído del mismo contrato. Se entrenó 1 época con batch size 64, learning rate 2e-5 y la función de pérdida MultipleNegativesRankingLoss, con un sampler NO_DUPLICATES. El entrenamiento se ejecutó en Kaggle con dos GPU en DataParallel usando sentence-transformers 5.7.0, en una sola ejecución y con una sola semilla. Cubre 12 tipos de cláusula de CUAD.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación densa (pipeline sentence-similarity).
- Recuperación de pasajes de cláusulas contractuales a partir de preguntas en lenguaje natural.
- Especialización en 12 tipos de cláusula de CUAD (por ejemplo, ley aplicable, jurisdicción, indemnización, terminación).
- Codificación normalizada de embeddings (`normalize_embeddings=True`), apta para búsqueda por producto escalar o coseno.
- Integración con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento explícito: es exclusivamente un encoder de recuperación.

## Casos de uso

- Búsqueda de cláusulas en repositorios contractuales: indexar los chunks de contratos y consultar con preguntas como "¿qué ley rige este contrato?" para recuperar el pasaje relevante con alta Recall@1 (0,765 en test).
- Construcción de pipelines RAG sobre documentos legales: usar el modelo como retriever y conectar la salida a un LLM generador para respuestas fundamentadas en el texto del contrato (enfoque del proyecto ContractLens).
- Revisión de due diligence: localizar rápidamente cláusulas de terminación, indemnización o jurisdicción en lotes de contratos, reduciendo la búsqueda manual.
- Deduplicación y agrupación semántica de cláusulas: comparar embeddings de fragmentos para detectar cláusulas equivalentes o contradictorias entre contratos.
- Asistencia a equipos legales internos: interfaz de búsqueda semántica sobre el archivo contractual de la empresa, con el modelo en CPU por su bajo coste computacional.
- Prototipado e investigación en recuperación legal: base ligera para experimentar con estrategias de chunking, negativos minados o reranking sin requerir GPU de gran capacidad.
- Filtrado previo en pipelines de clasificación de cláusulas: usar la similitud con prototipos por tipo de cláusula como señal de recuperación antes de un clasificador supervisado.

## Benchmarks y rendimiento

Evaluación sobre el split de test sellado (77 contratos, 421 preguntas respondibles, una sola pasada), con la pregunta original y recuperación densa:

| Retriever | Recall@1 | Recall@5 | MRR@10 |
|---|---|---|---|
| all-MiniLM-L6-v2 (base) | 0,439 | 0,774 | 0,583 |
| minilm-contracts-ft | 0,765 | 0,950 | 0,848 |

La diferencia pareada en Recall@1 es de +0,325 (IC 95%: +0,273 a +0,383, bootstrap sobre contratos). En dos formulaciones retenidas nunca vistas en entrenamiento, las ganancias de Recall@1 fueron +0,181 y +0,247.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (22,7 M de parámetros); cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para alto throughput, cualquier GPU moderna (RTX 3060 en adelante, A100, H100) sirve, aunque es sobredimensionada para este tamaño.
- Cabe en GPU de consumo: sí, en todas las GPU con al menos 1 GB de memoria libre (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TEI), Hugging Face Inference Endpoints, y exportación a ONNX para inferencia en CPU.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minilm-contracts-ft | 22,7 M | no disponible | Recuperación de cláusulas CUAD | Apache 2.0 | Hugging Face |
| all-MiniLM-L6-v2 | 22,7 M | 256 tokens | Embeddings generales | Apache 2.0 | Hugging Face |
| Modelos legales tipo Legal-BERT | ~110 M | 512 tokens | Dominio legal general | varía | Hugging Face |

Frente al modelo base, la comparativa directa está en la tabla de benchmarks: la mejora en Recall@1 es de +0,325 puntos. No se dispone de datos de comparación con otros retrievers legales en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado solo sobre los mismos 12 tipos de cláusula de CUAD; la generalización a otros tipos de cláusula no está probada.
- Una sola ejecución de entrenamiento y una sola semilla; no se midió la varianza entre semillas.
- Las formulaciones de las preguntas se redactaron con asistencia de IA y en un estilo homogéneo, lo que puede inflar el rendimiento frente a consultas reales de usuarios.
- Los contratos de CUAD son mayoritariamente acuerdos comerciales estadounidenses (exhibits de la SEC); el comportamiento sobre contratos de otras jurisdicciones o idiomas no está evaluado.
- Los negativos duros son negativos BM25, no minados con el modelo denso, lo que puede limitar la calidad del entrenamiento contrastivo.
- Riesgo de recuperación de pasajes irrelevantes en contratos atípicos o con estructura muy distinta a CUAD; no hay evaluación de alucinación porque el modelo no genera texto.
- Es un modelo de investigación y portfolio: no constituye asesoramiento legal y no debe usarse como única base para decisiones jurídicas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de CUAD tienen sus propias condiciones (CUAD es CC BY 4.0 y requiere atribución).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sindhisalam/minilm-contracts-ft
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Paper de CUAD: https://arxiv.org/abs/2103.06268
- Repositorio de CUAD: https://github.com/TheAtticusProject/cuad
- Libreria sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference

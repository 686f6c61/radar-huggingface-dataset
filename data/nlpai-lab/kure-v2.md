# nlpai-lab/KURE-v2

## Resumen

KURE-v2 es un modelo de recuperación de información bilingüe coreano-inglés basado en interacción tardía (late interaction) y representaciones multi-vector, desarrollado por el laboratorio nlpai-lab. Cada token de la entrada se proyecta a un vector de 128 dimensiones, y la relevancia entre consulta y documento se calcula mediante MaxSim, el esquema clásico de ColBERT. Está construido sobre el codificador skt/A.X-Encoder-base (arquitectura ModernBERT) y cuenta con 148.733.184 parámetros reales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos compactos de recuperación.

Su relevancia actual radica en el rendimiento: promedia nDCG@10 de 0.8160 en las nueve tareas de recuperación de MTEB(kor, v2), superando a todos los modelos single-vector evaluados en ese conjunto, incluido uno 175 veces más grande según la model card del autor. Esto lo convierte en una opción atractiva para sistemas RAG en coreano donde el presupuesto de cómputo y latencia es ajustado.

El entrenamiento se realizó en dos fases: un preentrenamiento contrastivo no supervisado sobre 20,7 millones de pares sin etiquetar (publicado como KURE-v2-unsupervised), seguido de un ajuste fino supervisado con pérdida contrastiva y destilación KL desde un reranker. Soporta documentos de hasta 8192 tokens y no requiere prefijos de instrucción en consultas ni documentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder ModernBERT (base: skt/A.X-Encoder-base), interacción tardía multi-vector tipo ColBERT |
| Parametros totales | 148.733.184 (154M según la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 8192 tokens por documento; expansión de consulta a 64 tokens gestionada por el modelo |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension del embedding por token | 128 |
| Funcion de scoring | MaxSim (late interaction) |
| Librerias compatibles | PyLate, sentence-transformers (MultiVectorEncoder), text-embeddings-inference |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de interacción tardía: en lugar de comprimir consulta y documento en un único vector, genera una matriz de embeddings por token (128 dimensiones por token) y puntúa el par mediante MaxSim, sumando sobre los tokens de la consulta el máximo de similitud coseno con los tokens del documento. Esta representación preserva granularidad léxica y semántica a coste de un índice mayor que los modelos densos. El backbone es skt/A.X-Encoder-base, un encoder ModernBERT, lo que aporta atención eficiente y soporte de contexto largo hasta 8192 tokens.

El entrenamiento transcurrió en dos etapas. Primero, un preentrenamiento contrastivo no supervisado sobre 20,7 millones de pares sin etiquetar, dando lugar a KURE-v2-unsupervised. Después, un ajuste fino supervisado con pérdida contrastiva combinada con destilación KL desde un reranker, que aporta señales de ordenación más finas que las etiquetas binarias de relevancia. La model card no detalla la composición exacta del dataset supervisado ni el número de tokens de entrenamiento total, por lo que esos datos no están disponibles.

Una innovación práctica destacable es la ausencia de prefijos de instrucción: el modelo gestiona internamente la expansión de la consulta hasta 64 tokens, eliminando la necesidad de plantillas de tarea específicas y simplificando su integración en pipelines de recuperación.

## Capacidades

- Recuperación de información bilingüe coreano-inglés mediante scoring multi-vector MaxSim.
- Generación de embeddings a nivel de token (128 dimensiones) para consultas y documentos, con `is_query=True/False` en PyLate para aplicar las proyecciones adecuadas a cada rol.
- Expansión automática de consultas hasta 64 tokens sin instrucciones de tarea.
- Indexación y búsqueda eficiente mediante el índice PLAID implementado en PyLate.
- Reranking de listas de candidatos de primera etapa sin necesidad de construir un índice, usando `rank.rerank`.
- Soporte de documentos largos de hasta 8192 tokens, adecuado para artículos, contratos y documentación técnica extensa.
- Compatibilidad con sentence-transformers a través de `MultiVectorEncoder`, incluyendo `encode_query`, `encode_document` y `similarity` con scoring MaxSim.
- Compatibilidad declarada con text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido: es un modelo de embeddings puro para recuperación.

## Casos de uso

- RAG sobre documentación técnica en coreano: el modelo indexa manuales y artículos de hasta 8192 tokens y recupera los fragmentos relevantes para alimentar un LLM generador, con mayor precisión que los modelos densos en consultas con terminología específica.
- Búsqueda empresarial bilingüe: en organizaciones con corpus mixtos coreano-inglés, permite una única configuración de recuperación sin pipelines separados por idioma, aprovechando el entrenamiento conjunto en ambos idiomas.
- Atención al cliente con base de conocimiento: recuperación de respuestas y artículos de ayuda ante consultas de usuarios, con la ventaja de que no requiere prefijos de instrucción, lo que simplifica la integración en backends existentes.
- Reranking en dos etapas: tras una recuperación inicial con un modelo denso ligero o BM25, KURE-v2 reordena los candidatos con scoring MaxSim, mejorando la precisión final sin necesidad de índice PLAID.
- Búsqueda legal y regulatoria: las tareas LawIRKo del benchmark muestran nDCG@10 de 0.7550, lo que respalda su uso en recuperación de normativa y jurisprudencia coreana donde la coincidencia léxica exacta importa.
- Búsqueda en literatura científica y médica coreana: la tarea PubHealthQA alcanza 0.8229, indicando buen comportamiento en dominios especializados con vocabulario técnico.
- Sistemas de preguntas y respuestas sobre documentos largos: SQuADKorV1 obtiene 0.9846, lo que sugiere un rendimiento muy alto en localización de pasajes de respuesta dentro de contextos extensos.
- Recuperación multilingüe en motores de búsqueda internos: la tarea MLDR (0.7159) y MIRACL (0.7237) indican utilidad en escenarios de recuperación de mayor dificultad con diversidad de documentos.

## Benchmarks y rendimiento

Resultados de nDCG@10 en las nueve tareas de recuperación de MTEB(kor, v2), según la model card:

| Modelo | Parametros | Media | AutoRAG | PubHealthQA | Ko-StrategyQA | LawIRKo | SQuADKorV1 | Belebele (ko-ko) | MrTidy | MLDR | MIRACL |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **nlpai-lab/KURE-v2** | 154M | **0.8160** | 0.9718 | 0.8229 | 0.8070 | 0.7550 | 0.9846 | 0.9660 | 0.5974 | 0.7159 | 0.7237 |
| nlpai-lab/KURE-v2-unsupervised | 154M | 0.7283 | 0.8822 | 0.8240 | 0.7818 | 0.7680 | 0.9427 | 0.9525 | 0.3496 | 0.6130 | 0.4411 |
| yjoonjang/colbert-ko-en-v2 | 149M | 0.8063 | 0.9686 | 0.8222 | 0.7940 | 0.7181 | 0.9846 | 0.9687 | 0.5783 | 0.6992 | 0.7230 |
| lightonai/mLateOn | 307M | 0.7906 | 0.9392 | 0.8061 | 0.7905 | 0.6431 | 0.9803 | 0.9608 | 0.5817 | 0.7005 | 0.7135 |
| perplexity-ai/pplx-embed-v1-late-0.6b | 596M | 0.7381 | 0.8557 | 0.8089 | 0.7973 | 0.7285 | 0.9696 | 0.9548 | 0.5400 | 0.2816 | 0.7064 |
| dragonkue/colbert-ko-0.1b | 149M | 0.6776 | 0.9700 | 0.7482 | 0.7364 | 0.4475 | 0.9794 | 0.9644 | 0.3966 | 0.2872 | 0.5685 |
| yjoonjang/colbert-ko-v1 | 149M | 0.6282 | 0.9557 | 0.6783 | 0.6560 | 0.4823 | 0.9594 | 0.9154 | 0.3279 | 0.2214 | 0.4575 |

La model card menciona además que KURE-v2 supera a todos los modelos single-vector medidos en el conjunto, incluido uno 175 veces mayor, pero la tabla de la información disponible se interrumpe en la entrada de sionic-ai/comsat-embed-ko-8b-preview, por lo que los valores completos de los modelos densos no están disponibles.

## Requisitos de hardware

- Inferencia en FP32: aproximadamente 0,6 GB de VRAM para los pesos (148,7M parámetros × 4 bytes), más el coste de activaciones dependiente de la longitud de secuencia.
- Inferencia en FP16/BF16: aproximadamente 0,3 GB para los pesos; cabe holgadamente en cualquier GPU consumer con 4 GB o más, incluidas GTX 1650, RTX 3050 y superiores.
- Con longitud máxima de 8192 tokens, el cuello de botella es la memoria de activaciones y el tamaño del índice PLAID, no los pesos del modelo.
- GPUs recomendadas para indexación a gran escala: A100, H100 o L40S por ancho de banda de memoria y throughput de codificación en lote; para despliegue en producción de baja concurrencia, RTX 4090, RTX 4080 o RTX 3090 son suficientes.
- Despliegue: PyLate para indexación con PLAID y recuperación, sentence-transformers con MultiVectorEncoder para prototipado, y text-embeddings-inference para servir como endpoint compatible.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, el tamaño compacto (154M) y la arquitectura ModernBERT sugieren un coste de codificación bajo en comparación con modelos multi-vector de 600M o más.
- Almacenamiento del índice: cada token genera un vector de 128 dimensiones; el espacio en disco crece proporcionalmente al número de tokens indexados, un orden de magnitud superior al de un índice denso de un vector por documento.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Media MTEB(kor, v2) | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| nlpai-lab/KURE-v2 | 154M | Multi-vector (ColBERT) | 8192 | 0.8160 | Apache 2.0 | Hugging Face |
| yjoonjang/colbert-ko-en-v2 | 149M | Multi-vector (ColBERT) | No disponible | 0.8063 | No disponible en la información | Hugging Face |
| lightonai/mLateOn | 307M | Multi-vector | No disponible | 0.7906 | No disponible en la información | Hugging Face |
| perplexity-ai/pplx-embed-v1-late-0.6b | 596M | Multi-vector | No disponible | 0.7381 | No disponible en la información | Hugging Face |
| dragonkue/colbert-ko-0.1b | 149M | Multi-vector (ColBERT) | No disponible | 0.6776 | No disponible en la información | Hugging Face |
| yjoonjang/colbert-ko-v1 | 149M | Multi-vector (ColBERT) | No disponible | 0.6282 | No disponible en la información | Hugging Face |

Frente a yjoonjang/colbert-ko-en-v2, el competidor más directo por tamaño y especialización lingüística, KURE-v2 obtiene una media superior (0.8160 frente a 0.8063) con cinco millones de parámetros más, a costa de un rendimiento ligeramente inferior en Belebele (0.9660 frente a 0.9687) y LawIRKo superior (0.7550 frente a 0.7181). Frente a modelos multi-vector de mayor tamaño como mLateOn (307M) y pplx-embed-v1-late-0.6b (596M), KURE-v2 mantiene ventaja en la media pese a tener menos de la mitad de parámetros.

## Limitaciones y advertencias

- Cobertura lingüística limitada: solo coreano e inglés; el rendimiento en otros idiomas no está evaluado y previsiblemente será bajo.
- Sesgos: la model card no documenta análisis de sesgos. Al entrenarse sobre pares web y corpus coreanos, puede heredar sesgos de dominio, registro y demografía presentes en esos datos.
- Alucinación: como modelo de recuperación no genera texto, pero puede devolver documentos irrelevantes con puntuaciones MaxSim altas; conviene calibrar umbrales de corte por dominio.
- Coste de índice: la representación multi-vector multiplica el almacenamiento por el número de tokens por documento; en corpus de millones de documentos el índice PLAID puede ser considerablemente mayor que un índice denso equivalente.
- Sin cuantización documentada: la información disponible no detalla soporte ni recetas de cuantización, lo que limita las optimizaciones de despliegue.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base skt/A.X-Encoder-base si se redistribuye.
- Ausencia de prefijos de instrucción: es una ventaja de simplicidad, pero implica que no se puede adaptar el comportamiento a tareas mediante instrucciones; el ajuste por dominio requiere fine-tuning.
- Datos de entrenamiento incompletos: no se especifica la composición exacta del corpus supervisado ni el número total de tokens, lo que dificulta evaluar riesgos de contaminación o cobertura.
- Requisito de PyLate o sentence-transformers reciente: la integración con otros frameworks de recuperación puede requerir adaptadores adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nlpai-lab/KURE-v2
- Variante no supervisada: https://huggingface.co/nlpai-lab/KURE-v2-unsupervised
- Repositorio del proyecto KURE: https://github.com/nlpai-lab/KURE
- Modelo base: https://huggingface.co/skt/A.X-Encoder-base
- Leaderboard MTEB(kor, v2), tareas de recuperación: https://mteb-leaderboard.hf.space/benchmark/MTEB(kor%2C%20v2)?types=Retrieval&s.summary=meanTask&d.summary=desc

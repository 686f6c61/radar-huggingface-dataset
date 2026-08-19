# AMAImedia/Qwen3-Embedding-8B-NOESIS-AWQ-INT4

## Resumen

El modelo `AMAImedia/Qwen3-Embedding-8B-NOESIS-AWQ-INT4` es una cuantización AWQ INT4 del modelo de embeddings `Qwen/Qwen3-Embedding-8B`, publicada como contribución comunitaria por AMAImedia dentro del desarrollo de la plataforma NOESIS de doblaje multilingüe. Se trata de un derivado exclusivamente de backbone: el `lm_head` original no existe en el modelo base (los embeddings se obtienen mediante mean pooling sobre el último estado oculto), por lo que la herramienta AWQ lo re-inicializó con pesos aleatorios. Esto implica que el modelo **no es apto para generación de texto** y debe utilizarse únicamente para obtener representaciones vectoriales de texto de 4096 dimensiones mediante pooling.

La cuantización reduce el tamaño en disco a 5,69 GB y el uso de VRAM estimado a ~5,3 GB, lo que permite ejecutar inferencia en GPUs de consumo como una RTX 3060 de 6 GB. La licencia es Apache 2.0, heredada del modelo original, y soporta 20 idiomas. Es relevante para desarrolladores que necesitan embeddings multilingües de alta calidad en entornos con recursos limitados, siempre que validen la fidelidad de las representaciones frente a la versión BF16 de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (forzada; original: backbone Qwen3 + mean pooling) |
| Parametros totales | 8.188.515.328 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | AWQ INT4, group size 128, zero point, version GEMM, compute dtype float16 |
| Idiomas soportados | en, zh, ja, ko, ru, ar, es, fr, de, pt, it, hi, tr, vi, th, id, nl, pl, uk, fa |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards), AWQ INT4 |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3-Embedding-8B` es un transformer decoder-only con 36 capas, hidden size de 4096, 32 cabezas de atención y 8 cabezas KV. Produce embeddings de 4096 dimensiones mediante mean pooling sobre el último estado oculto, normalizando posteriormente con norma L2 para similitud coseno. La cuantización AWQ (Activation-aware Weight Quantization) se realizó con la herramienta `gptqmodel 7.0.0` sobre la librería `autoawq`, utilizando 64 muestras de calibración con longitud de secuencia 384 extraídas del dataset NOESIS router (50.000 muestras multilingües curadas). Se cuantizaron las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`; no se cuantizaron `embed_tokens` ni las capas de normalización. El proceso tardó 62,6 minutos con semilla RNG 1729.

## Capacidades

- Generación de embeddings de texto de 4096 dimensiones mediante mean pooling sobre `last_hidden_state`.
- Similitud semántica entre frases y documentos usando distancia coseno sobre embeddings normalizados.
- Agrupación (clustering) de documentos por similitud de representaciones.
- Búsqueda semántica y recuperación de información (retrieval) en corpus multilingües.
- Soporte multilingüe para 20 idiomas, incluyendo español, inglés, chino, japonés, coreano, árabe, ruso, francés, alemán, portugués, italiano, hindi, turco, vietnamita, tailandés, indonesio, neerlandés, polaco, ucraniano y persa.
- No soporta generación de texto: el `lm_head` está inicializado con pesos aleatorios y produce salida incoherente.

## Casos de uso

- Búsqueda semántica en documentación técnica multilingüe: el modelo puede indexar manuales, guías y artículos en 20 idiomas y recuperar los fragmentos más relevantes para una consulta dada, gracias a su ventana de contexto de 32.768 tokens que permite procesar documentos largos.
- Sistemas de recomendación basados en similitud de contenido: al convertir artículos, noticias o productos en vectores de 4096 dimensiones, se pueden calcular vecinos cercanos para sugerir elementos relacionados en tiempo real.
- Deduplicación y limpieza de datasets: las representaciones permiten detectar documentos duplicados o casi duplicados mediante umbrales de similitud coseno, útil en pipelines de preparación de datos.
- Clasificación de textos sin entrenamiento adicional: combinando los embeddings con un clasificador lineal simple (por ejemplo, regresión logística) se pueden construir sistemas de categorización de correos, tickets o reseñas con pocos datos etiquetados.
- Análisis de opiniones y detección de temas en redes sociales: al agrupar embeddings de comentarios o publicaciones, se pueden identificar clusters temáticos o variaciones de sentimiento en múltiples idiomas.
- Integración en pipelines de RAG (Retrieval-Augmented Generation): el modelo puede servir como componente de recuperación para alimentar a un LLM generativo con contexto relevante, especialmente en entornos donde se requiere bajo consumo de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que la cuantización AWQ INT4 suele retener entre el 95% y el 98% de la fidelidad de embeddings respecto a la versión BF16, pero no se proporcionan métricas concretas (por ejemplo, MTEB, BEIR o similares). Se recomienda realizar una validación propia comparando la similitud coseno entre las representaciones AWQ y las del modelo base en el dataset de uso.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,3 GB en formato AWQ INT4.
- GPU recomendadas: cualquier tarjeta con al menos 6 GB de VRAM, por ejemplo RTX 3060 6 GB, RTX 4060, RTX 2070 Super, o GPUs de datacenter como A10 o T4.
- Cabe en GPUs de consumo de gama media; no requiere hardware especializado.
- Opciones de despliegue: transformers (con carga manual y pooling), text-embeddings-inference (TEI) si soporta AWQ, o vLLM con soporte de embeddings (verificar compatibilidad). También puede usarse con llama.cpp si se convierte a GGUF, aunque la model card no lo menciona explícitamente.
- Latencia y throughput: no disponibles en la documentación; el smoke test reporta un tiempo de carga de 11,0 s y una generación de 20 tokens en 2,1 s (a través del `lm_head` aleatorio), pero no se indican métricas para inferencia de embeddings.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso |
|---|---|---|---|---|---|
| Qwen3-Embedding-8B (base) | 8B | 32.768 | BF16 | Apache 2.0 | Embeddings de referencia, mayor fidelidad |
| AMAImedia/Qwen3-Embedding-8B-NOESIS-AWQ-INT4 (este) | 8B | 32.768 | AWQ INT4 | Apache 2.0 | Embeddings con menor huella de memoria |
| AMAImedia/NOESIS-BidirLM-Omni-2.5B-Embedding-NF4 | 2,5B | no disponible | NF4 | Apache 2.0 (presumible) | Embeddings multimodales (texto+imagen+audio), más compacto |

La comparativa directa con otros modelos de embeddings multilingües como BGE-M3 o E5-mistral no está disponible en la información proporcionada. La principal diferencia frente al modelo base es la cuantización, que reduce el tamaño y el consumo de VRAM a costa de una posible pérdida de calidad (95-98% de fidelidad estimada).

## Limitaciones y advertencias

- El `lm_head` está inicializado con pesos aleatorios: **no se debe llamar a `.generate()`**, la salida será texto incoherente.
- Para obtener embeddings es imprescindible implementar mean pooling sobre `last_hidden_state` y normalizar con L2; no hay una capa de pooling incluida en el paquete.
- La cuantización AWQ puede degradar ligeramente la calidad de las representaciones; se recomienda validar contra la versión BF16 en el dataset de producción antes de desplegar.
- No se han publicado benchmarks formales (MTEB, BEIR, etc.), por lo que el rendimiento real en tareas de recuperación no está documentado.
- El modelo es un derivado de Qwen3-Embedding-8B y hereda sus limitaciones: puede presentar sesgos lingüísticos o culturales en algunos idiomas, especialmente en aquellos con menos representación en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente y no se ofrece garantía de precisión o idoneidad para casos concretos.
- El modelo fue calibrado con un dataset específico (NOESIS router); si los datos de calibración no son representativos de su caso de uso, la pérdida de calidad podría ser mayor.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AMAImedia/Qwen3-Embedding-8B-NOESIS-AWQ-INT4)
- [Modelo base Qwen3-Embedding-8B](https://huggingface.co/Qwen/Qwen3-Embedding-8B)
- [Paper relacionado (arXiv:2506.05176)](https://arxiv.org/abs/2506.05176) (referenciado en los tags del modelo)
- [Modelo hermana NOESIS-BidirLM-Omni-2.5B-Embedding-NF4](https://huggingface.co/AMAImedia/NOESIS-BidirLM-Omni-2.5B-Embedding-NF4)

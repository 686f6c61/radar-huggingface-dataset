# ewin-reg/WeMM-Embedding-2B-Quantized

## Resumen

WeMM-Embedding-2B-Quantized es una versión cuantizada del modelo de embeddings omni-modal `tencent/WeMM-Embedding-2B`, publicada por el usuario ewin-reg. El modelo original es un codificador de embeddings de tipo fundacional que proyecta texto, imágenes y vídeo a un espacio vectorial común de 2048 dimensiones, con soporte de Matryoshka Representation Learning (MRL) para truncar los vectores hasta 64 dimensiones. Esta variante mantiene la arquitectura híbrida Qwen3.5 del modelo base (atención lineal GatedDeltaNet combinada con atención completa) y sustituye la cabeza de generación por proyecciones de embedding con mean-pooling.

La aportación principal de esta ficha es la cuantización: un esquema híbrido de precisión mixta que combina FP8 E4M3 en las seis capas de atención completa, FP8 E4M3 en las proyecciones de escritura de las capas lineales que preceden a atención completa, INT4 simétrico con grupo de 64 en las MLP y en el resto de capas lineales, y una tabla de embeddings de vocabulario escalada por fila en FP8. El resultado es un único archivo `model.safetensors` de 1,749 GB, frente a los aproximadamente 5,4 GB que ocuparía el modelo en BF16, con una fidelidad de coseno declarada del 99,22 % en texto y del 94,61 % en imagen.

Es relevante para despliegues de recuperación multimodal en entornos con presupuesto de memoria de 1,5 a 2,0 GB, como servidores perimetrales o bases de datos vectoriales en producción, y para pipelines nativos en Python mediante `SentenceTransformer` sin dependencias de runtimes C++ externos. El modelo está etiquetado como `inference: false` en su model card, lo que indica que el autor no garantiza su funcionamiento directo a través de la API de inferencia de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 18 capas de atención lineal GatedDeltaNet + 6 capas de atención completa; ViT DeepStack de 24 capas para visión |
| Parametros totales | 1.805.622.350 (según safetensors); la model card del modelo base declara 2,72B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Híbrida de precisión mixta: FP8 E4M3 (atención completa, proyecciones k/v de capas lineales frontera, tabla de embeddings escalada por fila), INT4 simétrico grupo 64 (MLP y capas lineales restantes), W4A8 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | other |
| Formato de pesos | safetensors (archivo único `model.safetensors`, 1.791,14 MB); se menciona GGUF en las etiquetas |
| Dimensiones de embedding | 2048 nativas, truncables a 1024, 512, 256, 128 y 64 mediante MRL |
| Compatibilidad | Hugging Face y SentenceTransformers con `trust_remote_code=True` |
| Tamaño en disco | 1,7492 GB |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida Qwen3.5 con 24 capas en total: 18 capas de atención lineal basadas en GatedDeltaNet, que sustituyen el softmax por una recurrencia asociativa de espacio de estados, y 6 capas de atención completa con producto escalar escalado estándar (capas 3, 7, 11, 15, 19 y 23). Para la parte visual incorpora un Vision Transformer DeepStack de 24 capas que procesa parches espaciales de 16 x 16 y marcos temporales de 2 x 2, lo que permite codificar tanto imágenes como fotogramas de vídeo. La tabla de embeddings de vocabulario tiene 248.078 entradas por 2048 dimensiones.

La cuantización aplicada por ewin-reg es selectiva y guiada por la sensibilidad de cada componente. Las seis capas de atención completa se conservan en FP8 E4M3 porque, según la model card, el ruido de cuantización en las proyecciones de query y key se amplifica exponencialmente a través del softmax y provoca colapso de atención con INT4 uniforme (divergencia KL superior a 7,50), mientras que con FP8 se mantiene por debajo de 0,75. En las capas lineales, las proyecciones de escritura k y v de las capas frontera previas a atención completa (2, 6, 10, 14, 18 y 22) también se preservan en FP8 para proteger la integridad del estado recurrente, que acumula errores a lo largo del tiempo. El resto de proyecciones lineales y las MLP usan INT4 simétrico con grupo de 64. La tabla de embeddings se cuantiza con escalado por fila en FP8 E4M3FN, reduciéndola de 1.016,11 MB a 508,56 MB.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO; la model card no detalla el proceso de entrenamiento del modelo original.

## Capacidades

- Generación de embeddings multimodales unificados para texto, imagen y vídeo en un espacio vectorial compartido de 2048 dimensiones.
- Recuperación cross-modal: búsqueda texto-a-imagen, texto-a-vídeo, imagen-a-texto y vídeo-a-texto mediante similitud de coseno.
- Truncamiento dinámico de dimensiones mediante Matryoshka Representation Learning, de 2048 hasta 64 dimensiones, para indexación vectorial con distintos compromisos de precisión y almacenamiento.
- Extracción de características para pipelines de `sentence-transformers` con `feature-extraction` como tarea de pipeline.
- Soporte multilingüe declarado para inglés, chino y otros idiomas.
- Ejecución en Python puro a través de `SentenceTransformer` con `trust_remote_code=True`, sin necesidad de runtimes C++ externos.
- No soporta generación de texto libre: la cabeza de modelado causal ha sido sustituida por proyecciones de embedding con mean-pooling.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, dado que no es un modelo generativo.

## Casos de uso

- Búsqueda semántica de documentos en producción: el modelo indexa fragmentos de texto en vectores de 2048 dimensiones (o truncados a 1024/512) y permite recuperación densa en bases de datos vectoriales con un presupuesto de memoria de 1,5 a 2,0 GB, adecuado para servidores perimetrales.
- Recuperación texto-a-imagen en catálogos de producto: se codifican las descripciones textuales y las imágenes en el mismo espacio vectorial, de modo que una consulta en lenguaje natural recupera las imágenes relevantes por similitud de coseno, con una fidelidad visual declarada del 94,61 %.
- Indexación y búsqueda de clips de vídeo: el ViT DeepStack procesa fotogramas temporales (parches de 2 x 2) y permite recuperar fragmentos de vídeo a partir de consultas textuales, con una fidelidad de fotograma declarada del 93,19 %.
- Deduplicación y agrupación de contenido multimodal: al proyectar texto, imágenes y vídeo a un espacio común, se pueden detectar duplicados y agrupar contenido relacionado en pipelines de moderación o curación de datasets.
- Sistemas de recomendación basados en contenido: los embeddings truncados a 256 o 128 dimensiones permiten calcular similitudes a gran escala con un coste de almacenamiento reducido, integrables en motores de recomendación que necesitan latencia baja.
- Despliegue en dispositivos de borde o contenedores con memoria limitada: el archivo único de 1,749 GB cabe en instancias con 2 GB de memoria, lo que facilita la ejecución en entornos sin GPU dedicada de gran capacidad.
- Recuperación aumentada (RAG) multimodal: combinación de texto e imágenes de un corpus en un único índice vectorial para que un sistema RAG recupere tanto pasajes textuales como figuras relevantes.

## Benchmarks y rendimiento

Los datos siguientes proceden del model-index declarado por el autor y no están verificados (`verified: false`). Corresponden a métricas de fidelidad de la cuantización, no a benchmarks de calidad de recuperación sobre tareas estándar.

| Metrica | Valor |
|---|---|
| Tamaño del modelo en disco | 1,7492 GB |
| Reducción de huella de almacenamiento | 65,51 (ratio de compresión) |
| Fidelidad de coseno en texto | 99,2204 |
| Degradación en texto | 0,7796 |
| Fidelidad de coseno en imagen | 94,612 |
| Fidelidad de fotograma de vídeo | 93,185 |
| Protección de softmax en atención | fp8_e4m3 |

No se han publicado resultados de benchmarks de recuperación (tipo MMLU, HumanEval, GSM8K o métricas de retrieval como Recall@k o nDCG) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 a 2,5 GB en FP16/BF16 para el archivo de pesos de 1,749 GB, más el overhead de activaciones y del ViT para entradas de imagen o vídeo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para texto; para lotes grandes de imagen o vídeo se recomienda una RTX 4090, A100 o H100 por ancho de banda de memoria.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más, como RTX 3050, RTX 4060, RTX 3060 o superiores; también en Apple Silicon con memoria unificada.
- Opciones de despliegue: `SentenceTransformer` con `trust_remote_code=True` (vía principal documentada), Hugging Face Transformers, y las etiquetas mencionan GGUF aunque la model card no detalla un fork específico; no se documenta soporte explícito de vLLM, TGI o llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Embedding-2B-Quantized | 1,81B (safetensors) | no disponible | 2048 (MRL hasta 64) | other | safetensors, GGUF |
| tencent/WeMM-Embedding-2B (base) | 2,72B | no disponible | 2048 (MRL hasta 64) | no disponible | safetensors |
| Alternativas multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (embeddings multimodales de aproximadamente 2B parámetros) en la documentación proporcionada, por lo que no se pueden comparar rendimientos de recuperación ni latencias.

## Limitaciones y advertencias

- El modelo no genera texto: la cabeza causal ha sido reemplazada por proyecciones de embedding, por lo que no sirve para chat ni generación libre.
- El ajuste fino directo sobre los pesos INT4 empaquetados requiere de-cuantizar a BF16/FP16, lo que incrementa el uso de memoria durante el entrenamiento.
- La licencia es "other": no se especifican los términos exactos de uso comercial, por lo que es necesario consultar la licencia del modelo base `tencent/WeMM-Embedding-2B` antes de desplegarlo en producción.
- El modelo está marcado como `inference: false`, lo que indica que el autor no garantiza su funcionamiento a través de la API de inferencia de Hugging Face.
- Los benchmarks declarados son métricas de fidelidad de cuantización no verificadas, no evaluaciones de calidad de recuperación; no hay datos de Recall@k ni nDCG.
- La fidelidad en imagen (94,61 %) y vídeo (93,19 %) es inferior a la de texto (99,22 %), por lo que la degradación es más notable en modalidades visuales.
- No se documenta la longitud de contexto soportada, lo que limita la planificación de pipelines con documentos largos.
- Los idiomas declarados son inglés, chino y multilingüe, sin detalle sobre la cobertura real de otros idiomas.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de recuperaciones espurias por similitud de coseno en dominios fuera de distribución.
- No se detallan sesgos conocidos del modelo base en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/ewin-reg/WeMM-Embedding-2B-Quantized
- Modelo base: https://huggingface.co/tencent/WeMM-Embedding-2B
- Documentación de Sentence-Transformers: https://sbert.net/
- Paper referenciado en las etiquetas: arxiv:2608.24053 (no se dispone de URL directa verificada en la información proporcionada)

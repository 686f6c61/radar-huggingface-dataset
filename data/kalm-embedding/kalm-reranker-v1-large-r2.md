# KaLM-Embedding/KaLM-Reranker-V1-Large-R2

## Resumen

KaLM-Reranker-V1-Large-R2 es un modelo de reranking (segunda fase del pipeline de recuperación de información) desarrollado por el equipo KaLM-Embedding. Se construye por fine-tuning del modelo encoder-decoder `google/t5gemma-2-4b-4b` y emplea una arquitectura denominada FBNL (fast but not late interaction), diseñada para comprimir las representaciones de los documentos y reducir así el coste computacional del reranking sin recurrir a la interacción tardía tipo ColBERT. El checkpoint R2 es una revisión sustancialmente mejorada del KaLM-Reranker-V1-Large original, con un recetario de entrenamiento en tres etapas y un rango de compresión Matryoshka validado que pasa de 32x a 128x.

El modelo resuelve el problema del cuello de botella computacional en pipelines RAG: rerankear decenas o cientos de documentos candidatos con un cross-encoder convencional es caro, y las alternativas de interacción tardía multiplican el almacenamiento. FBNL permite ajustar en tiempo de inferencia el compromiso entre coste y calidad mediante el ratio de compresión, e incluso aplicar una cascada grueso-a-fino. Con 7.508.928.880 parámetros totales, es el mayor de la familia R2 (Nano, Small y Large) y está orientado a entornos multilingües de recuperación.

La relevancia actual del modelo reside en dos frentes: por un lado, la mejora en MIRACL (18 idiomas) de +4,85 puntos de nDCG@10 medio frente a la versión anterior, que corrige la debilidad multilingüe del V1; por otro, la posibilidad de escalar el cómputo de test sin cambiar de checkpoint, algo útil en sistemas de búsqueda donde la latencia y el presupuesto de GPU varían según la carga. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (T5Gemma 2) con pooling Matryoshka y esquema FBNL (fast but not late interaction) |
| Parametros totales | 7.508.928.880 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; el repo ocupa 15,1 GB) |
| Idiomas soportados | Multilingue (evaluado en los 18 idiomas de MIRACL) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria sentence-transformers / transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/t5gemma-2-4b-4b`, un transformer encoder-decoder, y lo adapta a la tarea de ranking mediante la arquitectura FBNL. En lugar de la interacción tardía token a token de ColBERT, FBNL comprime la representación del documento a un número reducido de vectores, de modo que el coste de puntuación crece de forma controlada con el ratio de compresión elegido. El pooling Matryoshka (MEP) permite truncar la representación a distintos niveles (1x, 2x, 4x, 8x, 16x, 32x, 64x y 128x) sin reentrenar, lo que habilita el ajuste del cómputo en tiempo de inferencia y las cascadas grueso-a-fino: cribar todos los candidatos con representaciones muy comprimidas y reservar el cómputo completo para los más prometedores.

El entrenamiento de R2 sigue tres etapas: (1) fine-tuning supervisado de alta calidad sobre datos de ranking; (2) destilación con etiquetas suaves, que produce dos checkpoints con configuraciones `r64-a32` y `r96-a48`; y (3) model soup, que combina ambos checkpoints para dar lugar al modelo final. Los datasets declarados incluyen `KaLM-Embedding/KaLM-reranker-training-data`, `KaLM-Embedding/KaLM-embedding-finetuning-data` y `Shitao/bge-m3-data`. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición detallada del corpus.

## Capacidades

- Reranking de documentos para recuperación de información: puntuación de pares consulta-documento en pipelines de dos fases (retrieval + rerank).
- Compresión ajustable en tiempo de inferencia: un único checkpoint permite operar entre 1x y 128x de compresión Matryoshka, intercambiando calidad por coste.
- Cascada grueso-a-fino: cribado barato con representaciones muy comprimidas seguido de puntuación precisa de los mejores candidatos.
- Multilingüe: evaluado en los 18 idiomas de MIRACL, con mejoras sustanciales frente al V1 en ranking multilingüe.
- Multidominio: evaluado en BEIR, con mejora en las tres tallas (Nano, Small, Large) respecto a la versión anterior.
- Integración con `sentence-transformers` y `transformers` (pipeline `text-ranking`).
- No se documenta en la información disponible soporte de tool calling, agentes, visión, audio ni modo de razonamiento explícito; el modelo es un reranker especializado, no un LLM generativo de propósito general.

## Casos de uso

- RAG sobre documentación técnica: recuperar un conjunto amplio de candidatos con un retriever bi-encoder y reordenarlos con KaLM-Reranker-V1-Large-R2 antes de pasarlos al LLM generador; la compresión 4x por defecto mantiene la latencia contenida en corpus grandes.
- Búsqueda empresarial multilingüe: en organizaciones con documentación en varios idiomas, el modelo reordena resultados en los 18 idiomas de MIRACL, lo que evita mantener un reranker por idioma.
- Atención al cliente con base de conocimiento: reordenar artículos y FAQs recuperados para una consulta de usuario antes de que el sistema genere la respuesta, reduciendo el riesgo de citar fragmentos irrelevantes.
- Cribado a gran escala con cascada: en un índice de millones de documentos, usar la compresión 64x o 128x para una primera pasada económica y la compresión 2x o 4x solo sobre el top-k, aprovechando la robustez de compresión validada hasta 128x.
- Búsqueda legal o académica: reordenar pasajes de normativa, jurisprudencia o papers donde la precisión del orden importa más que la latencia, usando el ratio de compresión más bajo (1x-2x) para maximizar nDCG.
- Evaluación de sistemas de recuperación: servir como reranker de referencia en experimentos de ablation sobre pipelines de retrieval, ya que el mismo checkpoint cubre múltiples configuraciones de coste.
- Despliegue en entornos con presupuesto variable: ajustar dinámicamente el ratio de compresión según la carga del servicio, sin necesidad de cargar un modelo distinto.

## Benchmarks y rendimiento

Resultados publicados en la model card, con ratio de compresión por defecto `r=4`. Los valores son nDCG@10 medio.

| Benchmark | Modelo | KaLM-Reranker-V1 | KaLM-Reranker-V1-R2 | Delta |
|---|---|---|---|---|
| BEIR (multidominio) | Nano | 57,41 | 58,54 | +1,13 |
| BEIR (multidominio) | Small | 60,01 | 61,07 | +1,06 |
| BEIR (multidominio) | Large | 62,87 | 63,53 | +0,66 |
| MIRACL (multilingüe) | Nano | 62,08 | 71,11 | +9,03 |
| MIRACL (multilingüe) | Small | 66,89 | 74,06 | +7,17 |
| MIRACL (multilingüe) | Large | 70,07 | 74,92 | +4,85 |

Robustez a compresión en BEIR (nDCG@10 según ratio):

| Modelo | 2x | 4x | 8x | 16x | 32x | 64x | 128x |
|---|---|---|---|---|---|---|---|
| KaLM-Reranker-V1-Nano | 57,69 | 57,41 | 56,46 | 55,19 | 52,88 | — | — |
| KaLM-Reranker-V1-Large-R2 | No disponible en el extracto | 63,53 | No disponible en el extracto | No disponible en el extracto | No disponible en el extracto | No disponible en el extracto | No disponible en el extracto |

La model card indica que, incluso a 128x de compresión, las tres tallas conservan al menos el 92 % de su nDCG@10 medio a 2x tanto en BEIR como en MIRACL, pero la tabla completa por talla no está incluida en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16/fp16): aproximadamente 15 GB solo para pesos, más memoria para activaciones y lote; en la práctica se recomienda reservar 20-24 GB.
- Cuantización: no se documentan en la información disponible formatos GGUF, AWQ ni GPTQ para este checkpoint; el repo solo distribuye safetensors.
- GPU recomendadas para producción: A100 40/80 GB, H100, L40S o A10G con suficiente memoria; para lotes grandes conviene A100/H100.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en bf16, aunque el margen para lotes grandes es limitado; una RTX 3090 (24 GB) queda en el límite. En GPUs de 16 GB o menos no cabe sin cuantización, que no está publicada.
- Opciones de despliegue: `sentence-transformers` y `transformers` (pipeline `text-ranking`) son las vías documentadas. No se confirma en la información disponible soporte nativo en vLLM, TGI, llama.cpp u Ollama para este checkpoint concreto.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, el ratio de compresión seleccionado (1x a 128x) es el principal factor de coste en la fase de puntuación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KaLM-Reranker-V1-Large-R2 | 7,51 B | No disponible | Encoder-decoder FBNL con Matryoshka 1x-128x | Apache 2.0 | Hugging Face, Replicate |
| KaLM-Reranker-V1-Large (version anterior) | No disponible en el extracto | No disponible | FBNL con Matryoshka 1x-32x | Apache 2.0 | Hugging Face |
| KaLM-Reranker-V1-Small-R2 | No disponible en el extracto | No disponible | FBNL, misma familia | Apache 2.0 | Hugging Face |
| KaLM-Reranker-V1-Nano-R2 | No disponible en el extracto | No disponible | FBNL, misma familia | Apache 2.0 | Hugging Face |

En rendimiento, dentro de la propia familia R2, Large obtiene 63,53 en BEIR y 74,92 en MIRACL frente a 61,07 y 74,06 de Small y 58,54 y 71,11 de Nano, a cambio de un mayor coste de inferencia. No se dispone en la información proporcionada de comparaciones con rerankers de otros autores (por ejemplo, la familia BGE reranker o Cohere Rerank), por lo que esa comparación cruzada se marca como no disponible.

## Limitaciones y advertencias

- Es un modelo de ranking, no un generador: no debe usarse para producir texto, responder preguntas ni invocar herramientas.
- Riesgo de sesgo: el modelo se entrena sobre datos de recuperación y puede heredar sesgos de dominio e idioma de esos corpus; la model card no documenta una evaluación de sesgos.
- Alucinación: al no generar texto, el riesgo directo es bajo, pero un ranking erróneo puede inducir respuestas incorrectas en el LLM que consuma los documentos reordenados.
- Cobertura idiomática: aunque se evalúa en los 18 idiomas de MIRACL, no se garantiza un rendimiento uniforme en idiomas fuera de ese conjunto; el castellano está cubierto por MIRACL, pero no se publican métricas desglosadas por idioma en la información disponible.
- Longitud de contexto: no documentada; los documentos muy largos pueden requerir troceado previo, lo que afecta al coste y a la calidad del ranking.
- Coste de memoria: 7,51 B de parámetros implican ~15 GB en bf16, lo que excluye GPUs de consumo de gama media y encarece el despliegue frente a rerankers de 0,5-1 B.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `google/t5gemma-2-4b-4b` y de los datasets de entrenamiento, cuyos términos pueden imponer restricciones adicionales.
- Los checkpoints intermedios de las etapas 1 y 2 se publican bajo la cuenta `Yuki131`, no bajo la organización `KaLM-Embedding`; verificar su procedencia antes de usarlos en producción.
- La información disponible no incluye datos de latencia ni throughput, por lo que la planificación de capacidad debe basarse en pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaLM-Embedding/KaLM-Reranker-V1-Large-R2
- Modelo base: https://huggingface.co/google/t5gemma-2-4b-4b
- Paper principal (arXiv 2606.22807): https://arxiv.org/abs/2606.22807
- Paper adicional (arXiv 2506.20923): https://arxiv.org/abs/2506.20923
- Paper adicional (arXiv 2501.01028): https://arxiv.org/abs/2501.01028
- Repositorio GitHub de KaLM-Embedding: https://github.com/KaLM-Embedding
- Colección KaLM-Reranker en Hugging Face: https://huggingface.co/collections/KaLM-Embedding/lychee-kalm-reranker-and-jev
- Demo en Replicate: https://replicate.com/itsukifujii/kalm-reranker-v1-large-r2
- Modelo hermano Small R2: https://huggingface.co/KaLM-Embedding/KaLM-Reranker-V1-Small-R2
- Modelo hermano Nano R2: https://huggingface.co/KaLM-Embedding/KaLM-Reranker-V1-Nano-R2
- Checkpoint etapa 1 (Large): https://huggingface.co/Yuki131/KaLM-Reranker-V1-Large-R2-Stage1
- Checkpoint etapa 2 r64-a32 (Large): https://huggingface.co/Yuki131/KaLM-Reranker-V1-Large-R2-Stage2-r64-a32
- Checkpoint etapa 2 r96-a48 (Large): https://huggingface.co/Yuki131/KaLM-Reranker-V1-Large-R2-Stage2-r96-a48
- Dataset de entrenamiento del reranker: https://huggingface.co/datasets/KaLM-Embedding/KaLM-reranker-training-data
- Dataset de fine-tuning de embeddings: https://huggingface.co/datasets/KaLM-Embedding/KaLM-embedding-finetuning-data
- Dataset BGE-M3: https://huggingface.co/datasets/Shitao/bge-m3-data

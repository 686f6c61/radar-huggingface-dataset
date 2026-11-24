# Linkup-Platform/linkup-sparseup-embed-v2-pretrain

## Resumen

Linkup SPARSEUP-embed-v2-pretrain es un checkpoint de preentrenamiento de recuperación dispersa (sparse retrieval) en inglés desarrollado por Linkup Research, el brazo de investigación de la empresa Linkup (conocida por su API de búsqueda web para IA). Se trata del punto de partida sobre el que se afina el modelo final SPARSEUP-v2, y su propósito es servir como base para quien quiera entrenar su propio recuperador disperso en lugar de usar el modelo ya afinado para recuperación directa.

Técnicamente, parte de ModernBERT-base (150M parámetros) y sustituye la cabeza de enmascaramiento de lenguaje (MLM) por una cabeza dispersa propia, siguiendo un enfoque tipo SPLADE. El modelo se ha preentrenado de forma contrastiva sobre un conjunto de datos a gran escala de 665 millones de pares, procedente del dataset lightonai/embeddings-pre-training-curated. El resultado es un encoder de 149.707.140 parámetros que emite representaciones dispersas (términos con peso) en lugar de vectores densos, lo que permite indexación léxica eficiente en motores de búsqueda invertidos.

Su relevancia radica en que ofrece, bajo licencia Apache 2.0 y con un tamaño contenido (repo de 0,6 GB), un punto de partida abierto para investigación y desarrollo en recuperación dispersa aprendida, un nicho tradicionalmente dominado por modelos propietarios o checkpoints finales cerrados. Está pensado para la comunidad de sentence-transformers y para pipelines de text-embeddings-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con cabeza MLM reaprovechada como cabeza dispersa (SPLADE) |
| Parametros totales | 149.707.140 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de ModernBERT-base; el valor exacto no se indica) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria sentence-transformers, con codigo personalizado) |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer basado en ModernBERT-base, una arquitectura que incorpora mejoras sobre BERT clásico (atención con RoPE, alternancia de atención local y global, y mayor eficiencia en secuencias largas). Sobre ese backbone, Linkup reutiliza la cabeza MLM como cabeza dispersa: en lugar de predecir tokens enmascarados, el modelo aprende a activar términos del vocabulario con pesos, generando representaciones dispersas interpretables al estilo SPLADE. Esto permite usar el modelo con índices invertidos estándar (por ejemplo, motores tipo Lucene/Elasticsearch o motores de recuperación dispersa especializados).

El entrenamiento es de tipo contrastivo y se realizó sobre un conjunto a gran escala de 665 millones de pares, extraído del dataset lightonai/embeddings-pre-training-curated. La model card no detalla el número total de tokens, la composición exacta del corpus ni si hubo fases de RLHF o DPO; tampoco se especifican innovaciones adicionales como decodificación especulativa. Lo que sí queda claro es que este checkpoint es previo al afinado que da lugar a SPARSEUP-v2, por lo que su rendimiento en recuperación directa es inferior al del modelo final.

## Capacidades

- Extracción de características (feature-extraction) para recuperación de información en inglés.
- Generación de representaciones dispersas ponderadas por término (estilo SPLADE), aptas para índices invertidos.
- Recuperación léxica-semántica: combina coincidencia de términos con señal aprendida, superando al BM25 puro en principio.
- Preentrenamiento contrastivo sobre pares consulta-documento, orientado a similitud consulta-documento.
- Punto de partida para fine-tuning propio de recuperadores dispersos.
- Compatible con la librería sentence-transformers y con text-embeddings-inference (endpoints compatibles según los tags).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento (thinking): es un encoder de recuperación, no un modelo generativo.
- Capacidad multilingüe: no; únicamente inglés.

## Casos de uso

- Entrenamiento de recuperadores dispersos propios: usar este checkpoint como inicialización y afinar sobre un corpus de dominio específico (legal, biomédico, e-commerce) para obtener un recuperador adaptado sin partir de cero.
- Investigación en recuperación aprendida: servir de baseline reproducible para comparar variantes de cabezas dispersas, funciones de pérdida contrastivas o estrategias de regularización tipo FLOPS.
- Búsqueda híbrida en producción: integrar las representaciones dispersas en un motor con índice invertido (Elasticsearch, OpenSearch, Vespa) combinándolas con BM25 para mejorar el recall en consultas largas o con vocabulario especializado.
- RAG con presupuesto de infraestructura ajustado: al generar vectores dispersos, la indexación y la búsqueda son más baratas en memoria que con embeddings densos de alta dimensión, lo que encaja en despliegues con recursos limitados.
- Filtrado y deduplicación de corpus: usar la similitud dispersa para detectar documentos casi duplicados o recuperar pasajes relevantes en pipelines de curación de datos de entrenamiento.
- Evaluación de pipelines de búsqueda: emplear el checkpoint como componente de referencia en pruebas A/B de sistemas de recuperación antes de invertir en el afinado completo hacia SPARSEUP-v2.
- Docencia y prototipado: por su tamaño contenido (150M parámetros) y licencia permisiva, es adecuado para entornos académicos y prototipos rápidos de motores de búsqueda semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recuperación (nDCG, MRR, Recall@k) ni comparaciones numéricas con otros recuperadores; solo indica que, para recuperación directa, debe usarse el modelo afinado SPARSEUP-v2 en lugar de este checkpoint de preentrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de 149,7M parámetros, en FP32 ocupa aproximadamente 0,6 GB de pesos; en FP16/BF16 alrededor de 0,3 GB. Con overhead de activaciones, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100 o L40S; para desarrollo, RTX 4090, RTX 3090, RTX 4080 o incluso GPUs de gama media (RTX 3060, T4).
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con 6 GB o más, y también en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (según los tags del repo), y potencialmente Hugging Face Inference Endpoints. No se documenta soporte explícito para vLLM, llama.cpp u Ollama (son motores orientados a modelos generativos, no a encoders de recuperación).
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un encoder de 150M, se espera un throughput alto por lote en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Linkup SPARSEUP-embed-v2-pretrain | 149,7M | No disponible | Dispersa (SPLADE) | Apache 2.0 | Hugging Face |
| Linkup SPARSEUP-v2 (afinado) | No disponible | No disponible | Dispersa (SPLADE) | No disponible en la informacion | Hugging Face |
| answerdotai/ModernBERT-base | ~149M | No disponible | Densa (encoder base) | Apache 2.0 | Hugging Face |
| SPLADE-v2 / Splade encoders clásicos | ~110M-150M (BERT-base) | 512 tokens típicamente | Dispersa (SPLADE) | Apache 2.0 / MIT según variante | Hugging Face |

La comparación con alternativas se limita a características estructurales: este checkpoint comparte tamaño y familia con ModernBERT-base, del que hereda el backbone, y es conceptualmente análogo a los encoders SPLADE clásicos, aunque no se dispone de métricas comparativas publicadas en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento, no un modelo listo para producción: para recuperación directa debe usarse SPARSEUP-v2 afinado.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- No se han publicado benchmarks, por lo que su calidad relativa frente a otros recuperadores es desconocida a partir de la información disponible.
- Riesgo de sesgos heredados del corpus de preentrenamiento (lightonai/embeddings-pre-training-curated), cuya composición no se detalla.
- Al ser un modelo de recuperación y no generativo, no alucina texto, pero puede producir recuperaciones irrelevantes si se usa sin afinado.
- Requiere código personalizado (tag custom-code), lo que puede complicar la integración en algunos entornos frente a modelos estándar de sentence-transformers.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del dataset de preentrenamiento y del modelo base ModernBERT antes de desplegar en producción.
- La longitud de contexto efectiva no se especifica en la model card; debe consultarse la documentación de ModernBERT-base para planificar el truncado de documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Linkup-Platform/linkup-sparseup-embed-v2-pretrain
- Modelo afinado SPARSEUP-v2: https://huggingface.co/Linkup-Platform/linkup-sparseup-embed-v2
- Modelo base ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset de preentrenamiento: https://huggingface.co/datasets/lightonai/embeddings-pre-training-curated
- Web de Linkup: https://www.linkup.so/
- LinkedIn de Linkup: https://www.linkedin.com/company/linkup-platform/
- X (Twitter) de Linkup: https://x.com/Linkup_platform
- Referencia arXiv citada en los tags: arxiv:2611.09680 (no verificable en la información proporcionada)

# julian-schelb/bge-m3-emb-lat-intertext-v2

## Resumen

El modelo `julian-schelb/bge-m3-emb-lat-intertext-v2` es un ajuste fino de `BAAI/bge-m3`, un modelo de embeddings multilingüe de última generación, especializado en la detección de relaciones intertextuales en textos latinos clásicos. Desarrollado por Julian Schelb y colaboradores como parte del benchmark **Loci Similes**, este modelo genera representaciones vectoriales de oraciones que permiten identificar pasajes paralelos y alusiones literarias entre autores como Virgilio, Ovidio o Jerónimo. Su relevancia radica en que aborda una tarea filológica compleja con técnicas de recuperación de información, ofreciendo una herramienta reproducible y de código abierto para la investigación humanística digital.

Con 567 millones de parámetros, el modelo hereda la arquitectura transformer de BGE-M3 (basada en XLM-RoBERTa) y su capacidad de procesar hasta 8192 tokens de contexto. A diferencia del modelo base, que soporta más de 100 idiomas, esta versión está entrenada exclusivamente en latín y requiere el uso de prefijos de prompt específicos (`"Query: "` y `"Candidate: "`) para obtener resultados óptimos en tareas de recuperación. La licencia Apache 2.0 permite su uso comercial y académico sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (XLM-RoBERTa) basado en BGE-M3 |
| Parametros totales | 567.754.752 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (heredado del modelo base BGE-M3) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, precisión no especificada) |
| Idiomas soportados | Latín (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `BAAI/bge-m3`, un embedding model que combina tres funcionalidades de recuperación: dense retrieval, multi-vector retrieval y sparse retrieval. La arquitectura subyacente es un transformer de tipo XLM-RoBERTa con 567 millones de parámetros, capaz de procesar secuencias de hasta 8192 tokens. El entrenamiento se realizó con **online contrastive loss** sobre uno de los cinco splits de validación cruzada del benchmark Loci Similes, que contiene pares de pasajes latinos con relaciones intertextuales verificadas por expertos.

Una innovación clave es el uso de **prefijos de prompt** durante el entrenamiento y la inferencia: los textos de consulta (por ejemplo, pasajes de Jerónimo) deben ir precedidos de `"Query: "`, mientras que los textos candidatos (autores clásicos) llevan `"Candidate: "`. Esta separación mejora significativamente la calidad de la recuperación. El modelo está diseñado para integrarse en pipelines de recuperación seguidos de clasificación, como los modelos `*-3class-lat-intertext-v1` de la misma colección.

## Capacidades

- Generación de embeddings de oraciones y párrafos en latín clásico para tareas de similitud semántica y recuperación.
- Detección de intertextualidades: identifica pasajes paralelos, alusiones y citas entre autores latinos.
- Recuperación densa, multi-vector y sparse heredada de BGE-M3, aunque el ajuste fino optimiza principalmente la recuperación densa.
- Soporte de prompt prefixes (`"Query: "` y `"Candidate: "`) para distinguir entre consultas y candidatos.
- Compatible con la API de LociSimiles (`https://julianschelb.github.io/locisimiles/api/`) para integración directa en flujos de investigación.
- Multilingüe en origen, pero especializado en latín tras el ajuste fino; el uso en otros idiomas degrada el rendimiento.
- No incluye capacidades de generación de texto, tool calling ni razonamiento multi-paso; es exclusivamente un modelo de embeddings.

## Casos de uso

- **Investigación filológica**: detectar alusiones y paralelismos entre autores latinos clásicos, como las referencias de Jerónimo a Virgilio u Ovidio. El modelo permite buscar pasajes similares en un corpus de forma rápida y reproducible.
- **Construcción de bases de datos de intertextualidad**: embebiendo el corpus una vez con `prompt_name="match"` y cada consulta con `"query"`, se puede generar un índice de similitud coseno para mapear relaciones literarias a gran escala.
- **Análisis de influencias literarias**: comparar obras de diferentes épocas o géneros para estudiar cómo los autores reutilizan y transforman textos previos.
- **Detección de plagio o citas no atribuidas**: en ediciones digitales, el modelo puede identificar pasajes que citan o parafrasean fuentes clásicas sin atribución explícita.
- **Enriquecimiento de corpus anotados**: los embeddings generados pueden servir como características para modelos de clasificación que distinguen entre intertextualidad directa, indirecta o ausente.
- **Integración en pipelines de humanidades digitales**: gracias a su compatibilidad con `text-embeddings-inference` y `sentence-transformers`, puede desplegarse en servicios de inferencia para consultas en tiempo real sobre colecciones de textos latinos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo forma parte del benchmark Loci Similes, pero no proporciona métricas numéricas (como precisión, recall o NDCG) en la documentación consultada.

## Requisitos de hardware

- **VRAM estimada**: con 567 millones de parámetros, en FP16 se requieren aproximadamente 1,1 GB de VRAM para la inferencia; en FP32, unos 2,3 GB. El tamaño del repositorio (2,3 GB) sugiere pesos en FP32.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) puede ejecutar el modelo en FP16. Para lotes grandes o despliegue concurrente, se recomienda una RTX 3090 o superior.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo como la RTX 3060, RTX 4070, etc.
- **Opciones de despliegue**: `sentence-transformers` (Python), Hugging Face Inference Endpoints, `text-embeddings-inference` (indicado en los tags), y cualquier framework compatible con safetensors y transformers.
- **Latencia y throughput**: no disponible en la documentación. En una GPU moderna, se espera una latencia de milisegundos por lote pequeño, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| `julian-schelb/bge-m3-emb-lat-intertext-v2` | 567M | 8192 | Latín | Apache 2.0 | Fine-tuning de BGE-M3 para intertextualidad |
| `julian-schelb/bge-m3-emb-lat-intertext-v1` | 567M | 8192 | Latín | Apache 2.0 | Versión anterior, misma tarea y interfaz |
| `BAAI/bge-m3` | 567M | 8192 | Multilingüe (100+) | MIT | Modelo base, no especializado en latín |

La comparativa muestra que la v2 es una mejora directa de la v1 (mismo tamaño y arquitectura, pero entrenada con una revisión más reciente del dataset), y que el modelo base BGE-M3 es la alternativa genérica para tareas multilingües, aunque sin la especialización en intertextualidad latina.

## Limitaciones y advertencias

- **Especialización en latín**: el modelo solo produce resultados fiables en latín clásico; su uso en otros idiomas degrada notablemente la calidad de los embeddings.
- **Dependencia de prompts**: es obligatorio usar los prefijos `"Query: "` y `"Candidate: "`; omitirlos reduce el rendimiento de recuperación de forma significativa.
- **Datos de entrenamiento limitados**: al entrenarse con un split de validación cruzada del benchmark Loci Similes, el modelo puede no generalizar bien a textos latinos fuera del dominio clásico (por ejemplo, latín medieval o científico).
- **Sesgos potenciales**: el benchmark se basa en juicios de expertos, lo que puede introducir sesgos en la selección de intertextualidades y en la evaluación.
- **Alucinación**: al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinación es nulo en ese sentido. Sin embargo, la similitud coseno puede producir falsos positivos en pasajes con vocabulario común.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero se debe atribuir la autoría y mantener el aviso de licencia.
- **Disponibilidad**: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy temprana o nula; se recomienda validar su rendimiento en casos propios antes de usarlo en producción.

## Enlaces

- [HuggingFace - modelo v2](https://huggingface.co/julian-schelb/bge-m3-emb-lat-intertext-v2)
- [HuggingFace - modelo v1](https://huggingface.co/julian-schelb/bge-m3-emb-lat-intertext-v1)
- [Paper arXiv (Loci Similes)](https://arxiv.org/abs/2601.07533)
- [API de LociSimiles](https://julianschelb.github.io/locisimiles/api/)
- [Documentación de BGE-M3](https://bge-model.com/bge/bge_m3.html)
- [Dataset de etiquetas de intertextualidad](https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-labels)
- [Dataset de corpus de intertextualidad](https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-corpus)
- [Dataset de consultas de intertextualidad](https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-queries)

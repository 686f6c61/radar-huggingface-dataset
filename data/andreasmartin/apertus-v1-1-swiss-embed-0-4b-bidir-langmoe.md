# andreasmartin/apertus-v1.1-swiss-embed-0.4b-bidir-langmoe

## Resumen

El modelo `andreasmartin/apertus-v1.1-swiss-embed-0.4b-bidir-langmoe` es un artefacto experimental de embeddings multilingües desarrollado por andreasmartin, orientado a la recuperación de información en el contexto suizo. Se compone de un modelo base bidireccional (`apertus-v1.1-swiss-embed-0.4b-bidir`) sobre el que se añade una cabeza de mezcla de expertos por idioma (Language-MoE) con siete expertos y enrutamiento aprendido Top-2. La cabeza se entrena con datos de Wikipedia, folletos de votación suizos y textos gubernamentales suizos, con el objetivo de mejorar la recuperación en los idiomas oficiales de Suiza más el suizo alemán.

El modelo se presenta como un experimento de investigación, no como una versión estable para producción. Incluye soporte para dimensiones de embedding matryoshka (1024 y 512) y está pensado para tareas de retrieval semántico multilingüe. Con 445,7 millones de parámetros efectivos, es un modelo de tamaño medio que podría desplegarse en hardware de consumo, aunque no se proporcionan métricas de rendimiento de hardware.

La relevancia de este modelo reside en su enfoque en un dominio lingüístico poco cubierto (Suiza, con sus cuatro idiomas nacionales y el suizo alemán) y en su arquitectura experimental de enrutamiento por idioma, que podría servir de base para futuros desarrollos en recuperación multilingüe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de embeddings bidireccional con cabeza Language-MoE (7 expertos: de, en, fr, it, rm, gsw, shared; enrutamiento Top-2) |
| Parámetros totales | 445,696,559 (efectivos) |
| Parámetros activos | no disponible (el enrutamiento Top-2 implica solo dos expertos activos, pero no se cuantifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | de, en, fr, it, rm, gsw (alemán, inglés, francés, italiano, romanche y suizo alemán) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se menciona el archivo `language_moe_head.pt`, pero no se especifica el formato general) |

## Arquitectura y entrenamiento

El modelo se compone de un modelo base de embeddings bidireccional (probablemente un transformer encoder, aunque no se detalla su arquitectura interna) sobre el que se ha entrenado una cabeza de mezcla de expertos por idioma. Esta cabeza contiene siete expertos (uno por cada idioma soportado más un experto compartido) y un router que aprende a seleccionar dos expertos para cada token o secuencia. El entrenamiento se realizó con un perfil `size_optimized`, lo que sugiere una optimización para minimizar el uso de memoria.

Los datos de entrenamiento provienen de tres conjuntos: `wikimedia/wikipedia` (probablemente en los idiomas indicados), `eljuanina/VotingBooklets-v1` (folletos de votación suizos) y `ZurichNLP/SwissGov-RSD` (documentos gubernamentales suizos). El conjunto `eljuanina/VotingBooklets-Diamond-v1` se reserva exclusivamente para evaluación. El preprocesamiento de retrieval utiliza prefijos de texto plano: `query: ` para consultas y `passage: ` para documentos, y no se emplean plantillas de chat.

La evaluación interna se realiza con dos conjuntos: "Swiss mono" (probablemente recuperación monolingüe suiza) y "Swiss cross" (recuperación cross-lingüe), ambos con dimensiones de embedding de 1024 y 512. No se han publicado resultados en MTEB o MMTEB.

## Capacidades

- Generación de embeddings de texto para recuperación semántica en idiomas suizos (alemán, francés, italiano, romanche y suizo alemán) y inglés.
- Soporte de embeddings matryoshka: permite reducir la dimensión del embedding (512 o 1024) manteniendo un rendimiento razonable.
- Enrutamiento por idioma mediante MoE, lo que podría mejorar la adaptación a cada lengua.
- Preprocesamiento específico para retrieval con prefijos `query:` y `passage:`.
- No se mencionan capacidades de tool calling, agentes, generación de texto o visión. Es un modelo de embeddings, no generativo.

## Casos de uso

- Búsqueda semántica en documentos administrativos suizos: el modelo puede recuperar textos gubernamentales en varios idiomas a partir de una consulta en cualquiera de ellos, gracias a su entrenamiento con `ZurichNLP/SwissGov-RSD` y su arquitectura multilingüe.
- Recuperación de información en folletos de votación: con el conjunto `VotingBooklets`, se puede indexar y buscar información electoral en los idiomas oficiales suizos.
- Asistente de consulta ciudadana: una aplicación que permita a los usuarios hacer preguntas en alemán suizo o francés y obtener respuestas a partir de documentos oficiales en otros idiomas, aprovechando el modelo de retrieval.
- Sistema de recomendación de documentos legales: indexar leyes, reglamentos y publicaciones gubernamentales multilingües y recuperar los artículos relevantes según la consulta.
- Búsqueda en archivos periodísticos suizos: los medios suizos publican en varios idiomas; este modelo puede unificar la búsqueda en un corpus multilingüe.
- Integración en pipelines de RAG (Retrieval-Augmented Generation) para chatbots que atienden en suizo alemán, francés o italiano, proporcionando una capa de recuperación eficiente para contextos suizos.

## Benchmarks y rendimiento

La model card proporciona diagnósticos internos (no resultados MTEB/MMTEB). Se muestran a continuación:

| Conjunto | Dimensión | Accuracy@1 | Recall@10 | nDCG@10 | MRR@10 |
|---|---|---|---|---|---|
| Swiss mono | 1024 | 0.8125 | 0.9229 | 0.8665 | 0.8487 |
| Swiss mono | 512 | 0.8063 | 0.9208 | 0.8639 | 0.8458 |
| Swiss cross | 1024 | 0.3083 | 0.9667 | 0.6669 | 0.5672 |
| Swiss cross | 512 | 0.3104 | 0.9667 | 0.6670 | 0.5675 |

Estos datos son internos del desarrollo y no se han validado con evaluaciones externas. No se dispone de comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 445 millones de parámetros, se podría inferir que un modelo de este tamaño requiere aproximadamente 0,9 GB en FP16 y menos en cuantización, pero no se ha especificado.
- GPU recomendadas: no disponible. Dado el tamaño, podría ejecutarse en GPUs de consumo como RTX 3060 o superiores, pero no hay datos oficiales.
- Si cabe en consumer GPU: probablemente sí, pero sin confirmación.
- Opciones de despliegue: no se indican herramientas específicas. Al ser un modelo de embeddings, podría usarse con Sentence Transformers si se convierte, pero la nota experimental indica que no es un drop-in de Sentence Transformers. No se menciona vLLM, llama.cpp, etc.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se proporcionan datos comparativos con otros modelos de embeddings multilingües (p. ej., E5, BGE, etc.). El modelo es experimental y no se han publicado comparaciones.

## Limitaciones y advertencias

- Es un artefacto experimental, no una versión estable para producción. La model card lo indica explícitamente.
- No es un drop-in de Sentence Transformers; requiere adaptación para su uso.
- No se han publicado evaluaciones externas (MTEB, MMTEB) ni se han realizado pruebas de sesgo o alucinación (al ser un modelo de embeddings, no genera texto).
- Limitaciones de idioma: solo cubre seis idiomas, y el romanche (rm) y el suizo alemán (gsw) son variedades poco representadas en otros modelos.
- La licencia Apache 2.0 permite uso comercial, pero al ser experimental, no se garantiza calidad.
- No se especifica la longitud de contexto máxima, lo que puede limitar su uso en documentos largos.
- El tamaño del repositorio es de 0.0 GB, lo que es extraño; posiblemente el modelo no está completo o está en formato de solo pesos de la cabeza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andreasmartin/apertus-v1.1-swiss-embed-0.4b-bidir-langmoe
- Dataset de entrenamiento: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset de entrenamiento: https://huggingface.co/datasets/eljuanina/VotingBooklets-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/ZurichNLP/SwissGov-RSD
- (Nota: no se proporcionan otros enlaces como papers o blogs.)

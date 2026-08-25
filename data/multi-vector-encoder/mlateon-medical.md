# multi-vector-encoder/mLateOn-medical

## Resumen

mLateOn-medical es un modelo de embeddings multi-vector (estilo ColBERT) basado en la arquitectura ModernBERT, desarrollado por el usuario multi-vector-encoder mediante fine-tuning del modelo base lightonai/mLateOn-unsupervised. A diferencia de los modelos de embedding convencionales que comprimen el texto en un único vector, este modelo genera un vector por token y puntúa la similitud entre consulta y documento mediante el operador MaxSim, lo que preserva información de coincidencia a nivel de token que un vector único promedia. Esta característica lo hace especialmente adecuado para recuperación de información médica de alta precisión.

El modelo está fine-tuneado con el dataset tomaarsen/miriad-4.1M-split (1 millón de muestras) y la función de pérdida CachedMultiVectorMultipleNegativesRankingLoss, lo que lo orienta específicamente a tareas de retrieval en el dominio biomédico. Con 306,9 millones de parámetros, el modelo hereda las capacidades multilingües y de contexto largo del modelo base mLateOn, que soporta 10 idiomas y está licenciado bajo Apache-2.0. El modelo se publicó el 24 de agosto de 2026 y aún no registra descargas ni valoraciones en Hugging Face.

Su relevancia actual radica en que los sistemas de recuperación multi-vector están demostrando ser el estado del arte en retrieval de documentos complejos, especialmente en dominios especializados como el médico, donde la precisión semántica y la capacidad de captar matices terminológicos son críticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (multi-vector, ColBERT-style, late-interaction) |
| Parametros totales | 306.941.184 (~307 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base mLateOn es long-context, pero no se especifica el valor exacto) |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | no disponible para el modelo fine-tuneado; el modelo base mLateOn soporta 10 idiomas |
| Licencia | no disponible para el modelo fine-tuneado (el modelo base es Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, un transformer moderno optimizado para eficiencia y largo contexto, sobre el que se implementa un enfoque multi-vector inspirado en ColBERT. En lugar de producir un único vector por texto, el modelo genera un vector por token de la consulta y del documento, y la puntuación de relevancia se calcula mediante el operador MaxSim, que suma la similitud máxima de cada token de la consulta contra los tokens del documento. Este esquema de interacción tardía (late-interaction) preserva información de matching a nivel de token que los embeddings densos únicos pierden al promediar.

El entrenamiento de fine-tuning se realizó con la función de pérdida CachedMultiVectorMultipleNegativesRankingLoss sobre el dataset tomaarsen/miriad-4.1M-split, con un tamaño de dataset de 1.000.000 de muestras. Este tipo de pérdida optimiza el ranking de pares positivos frente a negativos en el batch, lo que resulta especialmente eficaz para tareas de retrieval. El modelo base, lightonai/mLateOn-unsupervised, fue pre-entrenado por LightOn AI y está orientado a búsqueda multilingüe, código y contexto largo, con soporte para 10 idiomas. El modelo resultante se integra con la librería sentence-transformers y es compatible con text-embeddings-inference para despliegue en producción.

## Capacidades

- Búsqueda semántica multi-vector: puntúa la relevancia consulta-documento con MaxSim, lo que permite captar coincidencias parciales a nivel de token que los embeddings densos pierden.
- Retrieval de información médica: fine-tuneado específicamente sobre datos biomédicos para maximizar la precisión en búsqueda de literatura clínica y documentos de investigación.
- Multilingüe: hereda del modelo base mLateOn el soporte de 10 idiomas, lo que permite recuperar documentos médicos en múltiples lenguas.
- Contexto largo: basado en ModernBERT, el modelo base está diseñado para manejar secuencias largas, lo que facilita el procesamiento de artículos médicos extensos.
- Compatibilidad con despliegue: compatible con sentence-transformers y text-embeddings-inference (TEI), con soporte de endpoints.
- Late-interaction: el uso de MaxSim permite puntuaciones más granulares que los modelos de embedding densos, con un índice de mayor tamaño pero mayor precisión.

## Casos de uso

- Búsqueda de literatura médica: el modelo puede indexar y recuperar artículos científicos, guías clínicas y papers biomédicos, devolviendo los resultados más relevantes según la coincidencia a nivel de token, lo que mejora la precisión frente a embeddings densos en dominios con terminología especializada.
- Sistemas de recuperación aumentada por generación (RAG) para salud: integrándolo en pipelines de RAG, el modelo puede servir como retriever de documentos clínicos, permitiendo que modelos generativos respondan preguntas médicas con fundamento en la literatura recuperada.
- Búsqueda en historiales clínicos electrónicos: permite recuperar casos clínicos, informes de pacientes y notas médicas por similitud semántica, incluso cuando los términos exactos no coinciden.
- Apoyo a la decisión clínica: el modelo puede recuperar guías de práctica clínica, recomendaciones de tratamiento o información farmacológica relevante para un caso concreto, ayudando a los profesionales a tomar decisiones informadas.
- Búsqueda multilingüe de documentación biomédica: al heredar el soporte multilingüe del modelo base, permite buscar en una lengua y recuperar documentos en otra, útil en entornos hospitalarios internacionales o para investigación global.
- Indexación de documentos médicos en producción: gracias a la compatibilidad con text-embeddings-inference y sentence-transformers, el modelo puede integrarse en pipelines de indexación y búsqueda de grandes volúmenes de documentos médicos con baja latencia.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor en el model-index de la model card. No se han publicado resultados comparativos con otros modelos en la información disponible.

| Dataset | Metrica | Valor |
|---|---|---|
| monitor | MaxSim Accuracy@1 | 0,966 |
| monitor | MaxSim Accuracy@10 | 0,996 |
| monitor | MaxSim Precision@10 | 0,0996 |
| monitor | MaxSim Recall@10 | 0,996 |
| monitor | MaxSim NDCG@10 | 0,9819 |
| monitor | MaxSim MRR@10 | 0,9773 |
| monitor | MaxSim MAP@10 | 0,9773 |
| final | MaxSim Accuracy@1 | 0,929 |
| final | MaxSim Accuracy@10 | 0,989 |
| final | MaxSim Precision@10 | 0,0989 |
| final | MaxSim Recall@10 | 0,989 |
| final | MaxSim NDCG@10 | no disponible |
| final | MaxSim MRR@10 | no disponible |
| final | MaxSim MAP@10 | no disponible |

No se han publicado resultados de benchmarks comparativos con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 307 M de parámetros y un peso de 1,3 GB en safetensors, la inferencia en FP16 requiere aproximadamente 2-4 GB de VRAM, dependiendo de la longitud del contexto y el tamaño del batch.
- GPU recomendadas: puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, así como en GPUs de centro de datos como A10, A100 o L4. Para producción con alto throughput, se recomienda al menos una A10 o superior.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU con 6 GB o más de VRAM para inferencia básica.
- Opciones de despliegue: compatible con text-embeddings-inference (TEI), sentence-transformers, y puede integrarse en frameworks de retrieval como PyLate o ColBERT v2.
- Latencia y throughput: no se dispone de datos de latencia específicos para este modelo; el throughput dependerá del backend de inferencia y la longitud de los documentos, pero al ser multi-vector, el coste de cálculo por consulta es superior al de un modelo de embedding denso del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Uso |
|---|---|---|---|---|---|
| mLateOn-medical (este) | 307 M | no disponible | Multi-vector (ModernBERT) | no disponible (base Apache-2.0) | Retrieval médico |
| lightonai/mLateOn-unsupervised | 307 M (estimado) | largo (ModernBERT) | Multi-vector (ModernBERT) | Apache-2.0 | Retrieval general multilingüe |
| lightonai/mDenseOn | no disponible | largo (ModernBERT) | Denso (embedding único) | Apache-2.0 | Retrieval general multilingüe |
| ColBERT v2 | ~110 M | 512 tokens | Multi-vector (BERT) | MIT | Retrieval general |

La diferencia principal con mDenseOn es que mLateOn-medical es un modelo multi-vector con late-interaction, mientras que mDenseOn es un modelo denso que comprime el texto en un único vector. ColBERT v2 es una alternativa multi-vector más antigua con menor número de parámetros y contexto más corto, pero con licencia MIT y ampliamente documentado.

## Limitaciones y advertencias

- La licencia del modelo fine-tuneado no está especificada en la model card, aunque el modelo base es Apache-2.0. Es recomendable contactar con el autor para aclarar los términos de uso antes de usarlo en producción.
- El modelo está especializado en dominios médicos, por lo que su rendimiento en tareas generales de retrieval puede ser inferior al del modelo base sin fine-tuning.
- No se han publicado datos sobre sesgos o alucinaciones del modelo; al ser un modelo de retrieval (no generativo), el riesgo de alucinación es menor, pero la calidad de los resultados depende de la calidad del corpus indexado.
- El modelo no ha sido verificado por la comunidad (0 descargas, 0 likes en Hugging Face), por lo que su fiabilidad en producción no está aún validada.
- La longitud de contexto exacta no se especifica en la información disponible; aunque el modelo base ModernBERT soporta contexto largo, se recomienda validar el comportamiento del modelo con documentos extensos antes de su despliegue.
- El idioma soportado por el modelo fine-tuneado no está especificado; aunque el base soporta 10 idiomas, el fine-tuning sobre datos médicos puede sesgar el comportamiento hacia los idiomas predominantes del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/multi-vector-encoder/mLateOn-medical
- Blog de Hugging Face sobre multi-vector encoders: https://github.com/huggingface/blog/blob/main/multi-vector-encoder.md
- Blog de LightOn AI sobre mDenseOn y mLateOn: https://huggingface.co/blog/lightonai/mdenseon-mlateon
- Repositorio de scripts de entrenamiento de mLateOn y mDenseOn: https://github.com/lightonai/mdenseon-mlateon
- Modelo base mLateOn: https://huggingface.co/lightonai/mLateOn
- Paper de ColBERT (arXix 1908.10084): https://arxiv.org/abs/1908.10084
- Paper de late-interaction (arXix 2101.06983): https://arxiv.org/abs/2101.06983

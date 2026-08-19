# lightonai/LateOn-hpool-regularized

## Resumen

LateOn-hpool-regularized es un modelo de recuperación multi-vector estilo ColBERT desarrollado por LightOn, la empresa francesa especializada en IA generativa y recuperación. Construido sobre la familia LateOn, que a su vez se basa en ModernBERT, este checkpoint está específicamente regularizado para hacer que el *pooling* jerárquico sea mucho más efectivo. El *pooling* jerárquico es una técnica que reduce el tamaño del índice de documentos agrupando y fusionando embeddings de tokens similares, lo que permite comprimir la huella de almacenamiento sin sacrificar calidad de recuperación.

El modelo tiene 149 millones de parámetros y está entrenado con múltiples presupuestos de *pooling* (4, 8, 16, 32, 64, 128 y 300 tokens por documento), lo que permite ajustar el ratio de compresión en tiempo de inferencia según las necesidades del despliegue. El resultado principal reportado es una retención del 98,7% en calidad de recuperación con un presupuesto de 32 tokens por documento, lo que equivale a una compresión de aproximadamente 5 veces respecto al índice completo.

La relevancia de este modelo radica en que aborda uno de los principales problemas de los modelos de interacción tardía como ColBERT: el coste de almacenamiento del índice. Al permitir compresión sin pérdida significativa de rendimiento, facilita el despliegue en entornos con recursos limitados, manteniendo la calidad de búsqueda semántica. Es el checkpoint recomendado por LightOn cuando se necesita un ColBERT versátil que funcione bien en todos los niveles de compresión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColBERT multi-vector sobre ModernBERT |
| Parametros totales | 149.015.808 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LateOn-hpool-regularized sigue la arquitectura ColBERT (Contextualized Late Interaction over BERT), donde cada token del documento se codifica en un embedding independiente y la puntuación se calcula mediante MaxSim entre los embeddings de la consulta y los del documento. La base es ModernBERT, un transformer optimizado para eficiencia y contexto largo, aunque la longitud de contexto específica no se indica en la documentación disponible.

La innovación principal está en el entrenamiento con regularización para *pooling* jerárquico. El *pooling* jerárquico implica una operación discreta (asignación de clusters) que no es diferenciable. Para entrenar a través de ella, LightOn utiliza un Straight-Through Estimator (STE): en el paso forward, los embeddings de tokens del documento se agrupan y fusionan según un árbol de clustering jerárquico; la puntuación de recuperación se calcula sobre la representación agrupada; la pérdida combina la pérdida MaxSim estándar con tokens completos y una pérdida sobre la representación agrupada; en el backward, el STE permite que los gradientes fluyan a través de la decisión de agrupación no diferenciable.

El checkpoint liberado usa entrenamiento multi-presupuesto con objetivos `[4, 8, 16, 32, 64, 128, 300]` en cada paso, lo que fomenta que el modelo sea ampliamente "agrupable" en lugar de sobreajustarse a un único punto de compresión. Esto permite al usuario elegir el ratio de compresión en inferencia sin necesidad de reentrenar. Los datos de entrenamiento no se especifican en la documentación, pero se menciona que el estudio se escala a los datos de LateOn.

## Capacidades

- Recuperación semántica multi-vector: genera un embedding por token de documento y puntúa con MaxSim, lo que permite capturar matices de significado a nivel de token.
- *Pooling* jerárquico configurable: el modelo soporta presupuestos de compresión de 4, 8, 16, 32, 64, 128 y 300 tokens por documento, ajustables en inferencia.
- Compresión de índice: reduce el tamaño del índice hasta 5 veces con una retención del 98,7% en calidad de recuperación (a 32 tokens).
- Búsqueda semántica en colecciones de documentos: adecuado para tareas de recuperación de pasajes, preguntas y respuestas, y búsqueda de información.
- Integración con PyLate y FastPLAID: librerías de LightOn para entrenamiento e inferencia eficiente de modelos ColBERT.
- Compatible con sentence-transformers y text-embeddings-inference, lo que facilita su uso en pipelines estándar.
- Solo inglés: el modelo está entrenado únicamente para el idioma inglés.

## Casos de uso

- Búsqueda semántica en grandes colecciones de documentos: con la compresión del índice, se puede desplegar búsqueda sobre millones de documentos en hardware moderado. El modelo mantiene alta calidad incluso con presupuestos de 32 tokens, reduciendo el coste de almacenamiento y la latencia de búsqueda.
- Sistemas RAG (Retrieval-Augmented Generation): al integrarse con generadores de texto, permite recuperar pasajes relevantes de una base de conocimiento con alta precisión, y la compresión del índice facilita el despliegue en entornos de producción con recursos limitados.
- Clasificación de texto y agrupación de documentos: los embeddings multi-vector pueden utilizarse para tareas de similitud entre documentos, deduplicación y clustering, aprovechando la representación rica por token.
- Búsqueda en bases de datos vectoriales: al ser compatible con text-embeddings-inference, puede conectarse a infraestructuras de vectores existentes, ofreciendo una alternativa a los embeddings densos tradicionales con mejor rendimiento en tareas de recuperación.
- Motores de recomendación: la capacidad de capturar similitudes semánticas a nivel de token permite recomendar ítems (artículos, productos, noticias) basándose en contenido textual, con un índice comprimido que reduce los costes de infraestructura.
- Análisis de documentos legales o científicos: para colecciones de textos largos (patentes, papers, contratos), el *pooling* jerárquico permite resumir la representación de cada documento en pocos vectores sin perder información crítica, facilitando búsquedas temáticas y de citas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los resultados completos están disponibles en un espacio de HuggingFace (https://huggingface.co/spaces/lightonai/hpool-regularization-results), pero no se incluyen cifras concretas en la documentación. El único dato reportado es:

- Retención del 98,7% en calidad de recuperación con un presupuesto de 32 tokens por documento, medido frente al modelo LateOn de referencia con tokens completos.

Este resultado se obtuvo en un subconjunto de 7 datasets BEIR (SciFact, NFCorpus, ArguAna, TREC-Covid, FiQa, Touché, SciDocs). No se proporcionan comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser un modelo de 149 millones de parámetros, es considerablemente más ligero que los LLMs generativos. En precisión fp32, el peso ocupa aproximadamente 600 MB; en fp16, unos 300 MB; en int8, unos 150 MB (estimaciones basadas en el tamaño de parámetros, no en datos oficiales).
- Cabe en GPUs de consumo: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp16, como una NVIDIA GTX 1650 o superior. Para inferencia con lote grande, se recomienda al menos 4 GB.
- GPUs recomendadas: para producción con alta concurrencia, una NVIDIA T4, RTX 3090 o A10 es suficiente. No requiere GPUs de datacenter como A100 o H100.
- Opciones de despliegue: PyLate (librería oficial de LightOn), FastPLAID (para búsqueda eficiente con indexación PLAID), sentence-transformers, y text-embeddings-inference (TEI) de HuggingFace.
- La latencia y el throughput dependen del presupuesto de *pooling* elegido: presupuestos más bajos (4-16 tokens) reducen el número de vectores por documento, acelerando la búsqueda y disminuyendo el uso de memoria. No se proporcionan cifras exactas en la documentación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Compresión | Licencia | Notas |
|---|---|---|---|---|---|
| LateOn-hpool-regularized | 149M | no disponible | Sí, hasta 5x con 98,7% retención | Apache 2.0 | Regularizado para *pooling* jerárquico |
| LateOn | 149M | no disponible | No (tokens completos) | Apache 2.0 | Checkpoint base sin regularización |
| LateOn-regularized | 149M | no disponible | No (tokens completos) | Apache 2.0 | Variante regularizada sin *pooling* jerárquico |

Los tres modelos comparten la misma arquitectura y tamaño, pero LateOn-hpool-regularized es el único entrenado específicamente para *pooling* jerárquico. Si el caso de uso no requiere compresión, LateOn o LateOn-regularized son alternativas válidas. No se dispone de comparativas con otros modelos ColBERT como ColBERTv2 o modelos densos tipo E5 en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés. No es adecuado para recuperación en otros idiomas sin entrenamiento adicional.
- Datos de entrenamiento no especificados: no se detalla la composición del corpus de entrenamiento, por lo que pueden existir sesgos no documentados.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, pero la calidad de la recuperación depende de la representación; puede fallar en consultas muy específicas o con vocabulario fuera de distribución.
- Configuración del *pooling*: elegir un presupuesto demasiado agresivo (por ejemplo, 4 tokens) puede degradar la calidad en dominios con vocabulario muy diverso. Se recomienda validar en el corpus objetivo.
- Sin benchmarks públicos completos: la ausencia de resultados detallados en la documentación dificulta la comparación objetiva con otros modelos.
- Dependencia de librerías específicas: el uso óptimo requiere PyLate o FastPLAID; aunque es compatible con sentence-transformers, algunas funcionalidades de *pooling* jerárquico pueden no estar disponibles en otras herramientas.
- Licencia Apache 2.0: permite uso comercial sin restricciones, pero el usuario es responsable del cumplimiento de las leyes de protección de datos al desplegar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lightonai/LateOn-hpool-regularized
- Colección de modelos LateOn: https://huggingface.co/collections/lightonai/denseon-and-lateon
- Blog sobre regularización para *pooling* jerárquico: https://huggingface.co/blog/lightonai/lateon-hpool-regularization
- Espacio de resultados: https://huggingface.co/spaces/lightonai/hpool-regularization-results
- Repositorio PyLate: https://github.com/lightonai/pylate
- Repositorio FastPLAID: https://github.com/lightonai/fast-plaid
- Sitio web de LightOn: https://lighton.ai
- Perfil de GitHub de LightOn: https://github.com/lightonai

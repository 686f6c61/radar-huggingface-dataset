# mradermacher/Tropicals-T1-GGUF

## Resumen

Tropicals-T1-GGUF es la versión cuantizada en formato GGUF del modelo Tropicals-T1, desarrollado por el equipo tropicals y cuantizado por mradermacher. Se trata de un modelo de embeddings (sentence-transformers) especializado en recuperación de texto, vinculación de entidades y taxonomía, entrenado específicamente para el idioma chino y orientado al dominio de la biodiversidad. Con aproximadamente 101,7 millones de parámetros, es un modelo compacto diseñado para tareas de extracción de características y búsqueda semántica, no para generación de texto.

La relevancia de esta versión GGUF radica en que permite ejecutar el modelo en entornos con recursos limitados, como CPUs o GPUs de gama baja, gracias a las distintas cuantizaciones ofrecidas (desde Q2_K hasta f16). Esto facilita su integración en pipelines de procesamiento de lenguaje natural en chino para aplicaciones de biodiversidad, como la normalización de nombres vernáculos de especies o la vinculación de menciones a entidades taxonómicas. El modelo base se distribuye bajo licencia CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no especificada; probablemente BERT-base, dato no confirmado) |
| Parametros totales | 101.677.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | chino (zh) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Tropicals-T1. Por el tamaño de parámetros (101,7 millones) y su uso como sentence-transformer, es razonable inferir que se basa en un transformer tipo BERT-base, pero no se confirma oficialmente. El modelo fue entrenado con el dataset `tropicals/vernacular-names-zh`, que contiene nombres vernáculos de especies en chino, lo que sugiere un entrenamiento orientado a tareas de recuperación semántica y vinculación de entidades en el dominio de la biodiversidad. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como hard negative mining o contrastive learning, aunque son prácticas habituales en este tipo de modelos.

La cuantización GGUF fue realizada por mradermacher mediante conversión estática de los pesos originales, sin utilizar imatrix ni pesos ponderados (según se indica en la model card). Esto implica que las cuantizaciones de menor bit (Q2_K, Q3_K) pueden presentar una degradación de calidad más acusada que si se hubieran usado técnicas de calibración avanzadas.

## Capacidades

- Extracción de características (embeddings) para representar textos en chino, especialmente términos de biodiversidad y taxonomía.
- Recuperación de texto (text retrieval) mediante búsqueda semántica por similitud de vectores.
- Vinculación de entidades (entity linking) para asociar menciones de nombres vernáculos con entidades taxonómicas normalizadas.
- Soporte multilingüe limitado al chino (zh); no se garantiza rendimiento en otros idiomas.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No se documenta soporte para tool calling, agentes ni razonamiento multi-paso, al ser un modelo de embeddings.

## Casos de uso

- Normalización de nombres vernáculos de especies en chino: el modelo puede convertir diferentes variantes de nombres comunes de plantas o animales en un embedding canónico que permita agrupar sinónimos y referirse a la misma entidad taxonómica.
- Búsqueda semántica en bases de datos de biodiversidad: permite consultar catálogos de especies usando lenguaje natural en chino, devolviendo resultados relevantes por similitud vectorial, incluso si los términos no coinciden exactamente.
- Vinculación de menciones en textos científicos: en artículos o informes de biodiversidad, el modelo puede asociar menciones de especies con identificadores de taxonomía estandarizados (p. ej., códigos de GBIF o NCBI).
- Clasificación de textos por categoría taxonómica: usando los embeddings como entrada a un clasificador ligero, se pueden etiquetar documentos según el grupo biológico al que pertenecen.
- Deduplicación de registros de observación: en plataformas de ciencia ciudadana, los embeddings permiten detectar si dos observaciones se refieren a la misma especie aunque usen nombres distintos.
- Enriquecimiento de ontologías: el modelo puede ayudar a alinear términos vernáculos chinos con ontologías biológicas existentes, facilitando la interoperabilidad entre sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o similares, dado que el modelo no está orientado a tareas de razonamiento general ni generación. Tampoco se ofrecen evaluaciones específicas de recuperación (p. ej., Recall@k o NDCG) en la documentación consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~100M de parámetros, las cuantizaciones ocupan entre 0,1 GB (Q2_K) y 0,3 GB (f16). Incluso en f16, el modelo cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de entrada como NVIDIA GTX 1650, RTX 3050 o superiores. También puede ejecutarse en CPU sin problemas, con latencias de milisegundos por consulta.
- Compatibilidad con consumer GPU: sí, todas las cuantizaciones son ejecutables en GPUs de consumo, e incluso en Raspberry Pi o dispositivos edge con suficiente RAM.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato. Para uso como embeddings, se puede integrar con la librería `llama-cpp-python` o mediante servidores como llama.cpp server.
- Latencia y throughput estimados: no se proporcionan datos oficiales, pero para un modelo de este tamaño, en CPU moderna se esperan latencias inferiores a 10 ms por embedding, y en GPU, inferiores a 1 ms.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de embeddings en chino para biodiversidad. No se han encontrado modelos equivalentes en el mismo dominio con licencia abierta. Alternativas genéricas de embeddings multilingües como `BAAI/bge-m3` o `intfloat/multilingual-e5-large` podrían servir para tareas similares, pero no están especializadas en taxonomía ni en chino vernáculo. Se recomienda evaluar el modelo en el caso de uso concreto antes de decidir.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado exclusivamente con datos en chino y del dominio de biodiversidad, el modelo puede tener un rendimiento deficiente en otros idiomas o dominios.
- Riesgo de alucinación: no aplica, al ser un modelo de embeddings no genera texto.
- Limitaciones de contexto: la longitud de contexto no está documentada; se asume que es la típica de un BERT-base (512 tokens), pero no se confirma.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial y modificación, siempre que se atribuya la autoría. No hay restricciones de uso militar o de otro tipo.
- Caveat para producción: las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar significativamente la calidad de los embeddings, afectando a la precisión de la recuperación. Se recomienda usar Q4_K_M o superior para tareas críticas.
- El modelo no ha sido evaluado públicamente, por lo que su rendimiento real en tareas de producción es incierto.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Tropicals-T1-GGUF
- Modelo base: https://huggingface.co/tropicals/Tropicals-T1
- Dataset de entrenamiento: https://huggingface.co/datasets/tropicals/vernacular-names-zh
- Página de mradermacher: https://huggingface.co/mradermacher
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests

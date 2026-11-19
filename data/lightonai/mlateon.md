# lightonai/mLateOn

## Resumen

mLateOn es un modelo de recuperación de información multilingüe desarrollado por LightOn que implementa la arquitectura ColBERT de interacción tardía (late interaction) con representaciones multi-vector. Construido sobre mmBERT-base con 306.941.184 parámetros (aproximadamente 307M), el modelo genera embeddings por token en lugar de un único vector por documento, lo que permite un scoring MaxSim más preciso entre consultas y documentos. Soporta contextos de hasta 8.192 tokens tanto para consultas como para documentos.

El modelo se entrena mediante una receta de translate-train: se parte de datos ingleses validados y se traducen automáticamente a ocho idiomas (francés, alemán, italiano, español, portugués, sueco, noruego y árabe), añadiendo pares cruzados para alineamiento interlingüe. La innovación principal es que, aplicada a una arquitectura de interacción tardía, esta receta generaliza a idiomas y alfabetos no vistos durante el entrenamiento (cirílico, japonés, etc.), algo que no ocurre con encoders densos equivalentes.

Es relevante ahora porque demuestra que no es necesario traducir exhaustivamente a todos los idiomas objetivo para obtener cobertura multilingüe amplia, y porque alcanza el mejor resultado en BEIR (57,56 NDCG@10) entre los modelos evaluados, superando incluso a su variante monolingüe inglesa LateOn (57,22). Se distribuye con licencia Apache 2.0 y está disponible en Hugging Face con 5.471 descargas y 45 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColBERT multi-vector (late interaction) sobre mmBERT-base |
| Parametros totales | 306.941.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (documentos y consultas) |
| Tipos de cuantizacion | no disponible (repo incluye safetensors y ONNX) |
| Idiomas soportados | en, fr, de, it, es, pt, sv, no, ar, code |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

mLateOn emplea una arquitectura ColBERT de interacción tardía: en lugar de comprimir cada documento en un único vector, produce una representación multi-vector (un embedding por token) y calcula la similitud mediante MaxSim, sumando para cada token de la consulta la máxima similitud con los tokens del documento. Esta arquitectura se asocia habitualmente a una mayor precisión en la recuperación a costa de un mayor coste de almacenamiento e indexación. El backbone es mmBERT-base, con 307M de parámetros, y el modelo se entrena con la librería PyLate de LightOn. El contexto máximo es de 8.192 tokens.

El entrenamiento sigue la receta translate-train: los datos ingleses validados de la familia DenseOn/LateOn se traducen automáticamente a ocho idiomas y se complementan con pares cruzados para forzar el alineamiento entre lenguas. El modelo parte de `lightonai/mLateOn-unsupervised` mediante fine-tuning. La contribución técnica central es que la interacción tardía hace viable esta receta: mientras que un encoder denso entrenado así generaliza poco más allá de los idiomas objetivo, la representación multi-vector transfiere a idiomas y alfabetos no vistos. El modelo también incorpora datos de código en la fase de fine-tuning. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset, ni si se emplearon RLHF o DPO.

## Capacidades

- Recuperación de información multilingüe mediante similitud semántica (pipeline `sentence-similarity`).
- Representaciones multi-vector con scoring MaxSim para mayor precisión en el ranking.
- Recuperación en documentos largos gracias a la ventana de 8.192 tokens.
- Recuperación de código (code search) con resultado de 73,48 en MTEB Code.
- Generalización a idiomas y alfabetos no vistos durante el entrenamiento de recuperación (cirílico, japonés, etc.).
- Alineamiento cross-lingual: consultas en un idioma pueden recuperar documentos en otro.
- Extracción de características (`feature-extraction`) para pipelines de embeddings.
- Compatibilidad con Text Embeddings Inference (TEI) y endpoints, con despliegue en región EU.
- Integración con sentence-transformers y PyLate.

## Casos de uso

- Búsqueda empresarial multilingüe: indexación de documentación interna en varios idiomas y recuperación con consultas en cualquiera de ellos, aprovechando el alineamiento cross-lingual y el contexto de 8.192 tokens para documentos largos.
- Recuperación aumentada (RAG) sobre corpus extensos: el modelo actúa como retriever en pipelines RAG, donde la precisión de MaxSim mejora la selección de pasajes frente a retrievers densos de un solo vector.
- Búsqueda de código en repositorios: localización de fragmentos de código relevantes a partir de descripciones en lenguaje natural, con soporte del tag `code` y resultado de 73,48 en MTEB Code.
- Búsqueda legal o regulatoria en documentos largos: el contexto de 8.192 tokens permite indexar secciones extensas sin truncar, útil para normativa y contratos multilingües.
- Atención al cliente con base de conocimiento: recuperación de artículos de ayuda y FAQs en múltiples idiomas para alimentar un asistente, con despliegue vía TEI en la UE.
- Búsqueda académica o científica multilingüe: recuperación de abstracts y artículos en distintos idiomas, incluyendo lenguas no presentes en el entrenamiento gracias a la generalización observada.
- Filtrado y deduplicación de datasets: uso de los embeddings multi-vector para detectar documentos near-duplicate en corpus multilingües.

## Benchmarks y rendimiento

Resultados publicados en la model card (NDCG@10). MIRACL_tgt y MLDR_tgt incluyen solo los idiomas que solapan con los idiomas objetivo del entrenamiento; MIRACL y MLDR incluyen todos los idiomas del benchmark.

| Modelo | Tamano | BEIR | MIRACL_tgt | MIRACL | MLDR_tgt | MLDR | Code |
|---|---|---|---|---|---|---|---|
| mLateOn | 307M | 57,56 | 65,61 | 67,04 | 87,69 | 77,92 | 73,48 |
| mDenseOn | 307M | 56,70 | 59,61 | 58,02 | 64,98 | 51,59 | 71,53 |

Datos adicionales mencionados en la model card: LateOn (monolingüe inglés) obtiene 57,22 en BEIR, por debajo de mLateOn; LFM2.5-ColBERT-350M obtiene 78,39 en MLDR_tgt, más de 9 puntos por debajo de mLateOn. La tabla de benchmarks de la model card está incompleta en la información proporcionada para el resto de modelos comparados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 307M de parámetros, en fp16 requiere aproximadamente 0,6 GB solo para pesos; en fp32, unos 1,2 GB. El coste real depende del tamaño de lote y de la longitud de secuencia, ya que la representación multi-vector escala con el número de tokens.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en fp16 con lotes moderados; A100 o H100 para indexación a gran escala y alto throughput.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se ajuste el tamaño de lote a la longitud de contexto.
- Opciones de despliegue: Text Embeddings Inference (TEI), PyLate, sentence-transformers, y pesos ONNX para inferencia optimizada. El modelo está marcado como `endpoints_compatible` y `region:eu`.
- Latencia y throughput: no disponible en la información proporcionada.
- Almacenamiento del índice: al ser multi-vector, el índice ocupa considerablemente más que un modelo denso equivalente (un vector por token en lugar de uno por documento); FastPlaid de LightOn es la herramienta indicada para indexación eficiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BEIR | MIRACL_tgt | MLDR_tgt | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| mLateOn | 307M | 8.192 | 57,56 | 65,61 | 87,69 | Apache 2.0 | Hugging Face |
| mDenseOn | 307M | no disponible | 56,70 | 59,61 | 64,98 | no disponible | Hugging Face |
| LateOn (monolingüe EN) | no disponible | no disponible | 57,22 | no aplica | no aplica | no disponible | Hugging Face |
| LFM2.5-ColBERT-350M | 350M | no disponible | no disponible | no disponible | 78,39 | no disponible | no disponible |

mLateOn supera a su variante densa mDenseOn en todas las métricas reportadas, con una diferencia especialmente amplia en MLDR_tgt (87,69 frente a 64,98) y MIRACL_tgt (65,61 frente a 59,61). Frente a LateOn monolingüe, mejora ligeramente en BEIR pese a estar entrenado en nueve idiomas. Frente a LFM2.5-ColBERT-350M, la ventaja en MLDR_tgt supera los 9 puntos. Los datos de licencia y contexto de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al entrenarse con datos traducidos automáticamente, puede heredar sesgos de traducción y del corpus inglés original.
- Riesgo de alucinación: no aplica directamente a la generación de texto, pero la recuperación puede devolver pasajes irrelevantes si la consulta está fuera del dominio de entrenamiento.
- Limitaciones de contexto o idioma: el entrenamiento cubre solo nueve idiomas; la generalización a otros idiomas y alfabetos se observa empíricamente, pero no está garantizada ni cuantificada por idioma en la información disponible.
- Coste de almacenamiento: la representación multi-vector incrementa notablemente el tamaño del índice frente a modelos densos, lo que puede ser prohibitivo en despliegues con recursos limitados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los datos de entrenamiento traducidos, no detalladas en la información disponible.
- Caveat para producción: la model card está incompleta en la tabla de benchmarks (faltan los modelos comparados), por lo que las comparaciones deben tomarse con cautela hasta consultar el paper.
- El modelo es un retriever, no un generador: requiere un pipeline externo (por ejemplo RAG) para tareas de respuesta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lightonai/mLateOn
- Modelo base: https://huggingface.co/lightonai/mLateOn-unsupervised
- Variante densa: https://huggingface.co/lightonai/mDenseOn
- LateOn (monolingüe): https://huggingface.co/lightonai/LateOn
- DenseOn (monolingüe): https://huggingface.co/lightonai/DenseOn
- Colección: https://huggingface.co/collections/lightonai/mdenseon-and-mlateon
- Blog multilingüe: https://huggingface.co/blog/lightonai/mdenseon-mlateon
- Blog inglés: https://huggingface.co/blog/lightonai/denseon-lateon
- Paper: https://arxiv.org/abs/2607.27178
- Repositorio PyLate: https://github.com/lightonai/pylate
- Repositorio FastPlaid: https://github.com/lightonai/fast-plaid
- Web de LightOn: https://lighton.ai

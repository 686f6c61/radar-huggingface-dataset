# madrisight/madrimed1.2-text-embed

## Resumen

madrimed1.2-text-embed es un modelo de embeddings de texto publicado por el usuario madrisight en HuggingFace, con un total de 1.720.574.976 parámetros (aproximadamente 1,72 mil millones) y un repositorio de 6,9 GB. El tag de arquitectura `qwen3_vl_text` indica que el modelo se construye sobre la torre de texto de la familia Qwen3-VL, reutilizada aquí como codificador para generar representaciones vectoriales en lugar de texto. La licencia declarada es Apache-2.0.

El problema que resuelve es el habitual de los modelos de embeddings: convertir texto en vectores densos utilizables para búsqueda semántica, recuperación aumentada (RAG), deduplicación o clustering. El nombre sugiere un enfoque hacia el dominio médico, aunque la model card no contiene ninguna descripción, instrucciones de uso ni datos de evaluación que lo confirmen.

La relevancia práctica es limitada por ahora: el repositorio no declara pipeline, no documenta la dimensión del vector de salida, la estrategia de pooling, la longitud de contexto ni los idiomas soportados, y registra 0 descargas y 0 likes. Cualquier evaluación seria requiere inspeccionar los ficheros y ejecutar pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, torre de texto de Qwen3-VL (según el tag `qwen3_vl_text`); detalles no disponibles |
| Parametros totales | 1.720.574.976 (≈1,72 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene safetensors, sin variantes GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 6,9 GB) |

## Arquitectura y entrenamiento

El tag `qwen3_vl_text` sitúa el modelo sobre la torre de texto de Qwen3-VL, un transformer denso. Al tratarse de un modelo de embeddings, lo esperable es una arquitectura de tipo bi-encoder que produce un vector por entrada, pero no hay documentación que confirme la estrategia de agregación (pooling del token CLS, media de tokens, último token u otra), la dimensión del embedding ni si se aplica normalización L2. Tampoco se especifica si requiere `trust_remote_code`.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, técnicas de contraste (por ejemplo, negativos duros) ni ninguna innovación técnica destacable. La model card se limita a la declaración de licencia Apache-2.0. El tamaño del repositorio (6,9 GB para 1,72 B de parámetros, ≈4 bytes por parámetro) sugiere pesos en fp32, aunque no está confirmado.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación de información, asumiendo el uso estándar de un modelo `*-embed`; no verificado por falta de documentación.
- Búsqueda semántica y recuperación densa (dense retrieval) en pipelines RAG, si el modelo expone una función de codificación utilizable.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; un modelo de embeddings no está diseñado para ello.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el tag indica variante únicamente de texto (`_text`), por lo que la torre visual de Qwen3-VL no estaría incluida.
- Dimensión del vector, límite de tokens por entrada y formato de instrucción (si lo hubiera): no disponibles.

## Casos de uso

- Recuperación en RAG sobre documentación clínica: indexar guías de práctica clínica, protocolos y fichas técnicas en una base vectorial y recuperar fragmentos relevantes para alimentar a un LLM. Adecuado por el tamaño moderado (1,72 B), que permite indexar grandes volúmenes en GPU de gama media, siempre que se valide la calidad de recuperación en español médico.
- Búsqueda semántica interna en portales corporativos sanitarios: sustituir la búsqueda por palabras clave por similitud vectorial sobre historiales de preguntas, artículos o FAQs, con reindexación periódica.
- Deduplicación y near-duplicate detection de registros: codificar cada documento y agrupar por umbral de similitud coseno para eliminar duplicados en bases de datos de artículos o informes.
- Clustering y análisis exploratorio de corpus: generar embeddings de miles de resúmenes o abstracts y aplicar k-means o UMAP para descubrir temáticas latentes.
- Filtrado previo en pipelines de moderación o triaje: usar la similitud contra un conjunto de ejemplos etiquetados para clasificar consultas entrantes antes de derivarlas a un modelo generativo mayor, reduciendo coste por petición.
- Evaluación de similitud entre pares de frases: comparar informes, traducciones o resúmenes automáticos mediante distancia vectorial en tareas de control de calidad.
- Reranking de segundo nivel: si el modelo rinde bien en pares consulta-documento, puede usarse como reordenador sobre los candidatos devueltos por un retriever léxico como BM25.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del número de parámetros, no confirmado por el autor): ≈6,9 GB en fp32, ≈3,5 GB en bf16/fp16, ≈1,8 GB en int8 y ≈1,0-1,2 GB en 4 bits, en todos los casos más overhead de activaciones y del tokenizador.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A10G, L4 o A100/H100 para indexación a gran escala en lote.
- Cabe en GPU de consumo: sí, en fp16 en tarjetas de 8 GB o más; en 4 bits cabría en GPUs de 4-6 GB, aunque no hay cuantizaciones publicadas en el repositorio.
- Opciones de despliegue: no confirmadas. Al no declararse pipeline ni arquitectura estándar de sentence-transformers, el soporte en vLLM, TGI, llama.cpp, Ollama o Text Embeddings Inference requiere verificación previa; la vía más probable es `transformers` con posible `trust_remote_code`.
- Latencia y throughput: no disponibles. Como referencia orientativa, un encoder denso de 1,7 B procesa lotes en decenas de milisegundos por lote en una A100, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos de rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| madrisight/madrimed1.2-text-embed | 1,72 B | No disponible | Apache-2.0 | No disponible | Repositorio con 0 descargas, sin model card util |
| Qwen3-Embedding-0.6B | 0,6 B | 32 K (según documentación pública del modelo) | Apache-2.0 | MTEB publicado por el autor | Ampliamente disponible y documentado |
| BGE-M3 | ≈0,57 B | 8 K | MIT | Multilingüe, dense + sparse + multi-vector | Disponible con documentación completa |
| multilingual-e5-large | ≈0,56 B | 512 tokens | MIT | Publicado en el paper de E5 | Disponible con documentación completa |

La comparación directa no es posible en la dimensión de calidad: el modelo de madrisight carece de evaluación publicada, mientras que las alternativas cuentan con resultados en MTEB y documentación de uso. En parámetros, es aproximadamente tres veces mayor que las alternativas citadas, lo que encarece la indexación sin garantía de mejor calidad.

## Limitaciones y advertencias

- Ausencia total de model card: se desconoce la dimensión del embedding, la estrategia de pooling, el límite de tokens por entrada, el formato de instrucción y si requiere `trust_remote_code`.
- Sin evaluación publicada: no hay MTEB, ni resultados de retrieval, ni comparaciones con baselines; el rendimiento real es desconocido.
- Sin idiomas declarados: no se puede asumir buen comportamiento en castellano sin pruebas propias.
- El nombre sugiere un dominio médico, pero no hay evidencia documental de que el entrenamiento se haya especializado; tratarlo como modelo generalista hasta validar.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí riesgo de recuperaciones irrelevantes si la representación no está bien calibrada.
- Licencia Apache-2.0 permite uso comercial y modificaciones, pero no hay garantías del autor ni cláusulas de responsabilidad documentadas más allá del texto estándar de la licencia.
- Repositorio sin descargas ni validación comunitaria (0 descargas, 0 likes): posible modelo experimental o en desarrollo.
- El tamaño de 6,9 GB en fp32 implica mayor coste de almacenamiento y menor throughput que alternativas de 0,5-0,6 B; valorar la relación coste-calidad antes de adoptarlo en producción.
- Fecha de creación del repositorio posterior a la mayoría de las referencias del ecosistema: verificar que los pesos cargan correctamente con la versión actual de `transformers`.

## Enlaces

- HuggingFace: https://huggingface.co/madrisight/madrimed1.2-text-embed
- No se han encontrado otros enlaces (paper, blog, repositorio de código o demo) en la información disponible.

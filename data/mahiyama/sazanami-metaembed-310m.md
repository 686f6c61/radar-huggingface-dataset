# mahiyama/Sazanami-MetaEmbed-310m

## Resumen

Sazanami-MetaEmbed-310m es un modelo de recuperación de información en japonés desarrollado por mahiyama (Masayuki Hiyama). Se basa en el modelo de lenguaje enmascarado sbintuitions/modernbert-ja-310m y ha sido entrenado específicamente para búsqueda mediante interacción tardía (late interaction) y representación multi-vector. Su principal innovación es la técnica MetaEmbed, que resume cada consulta en 16 vectores y cada documento en 64 vectores de 128 dimensiones, independientemente de la longitud del texto original. Esto reduce drásticamente el almacenamiento y el coste de cálculo en comparación con ColBERT, que genera un vector por token.

El modelo incorpora entrenamiento Matryoshka multi-vector, lo que permite truncar los vectores a combinaciones predefinidas (1, 2, 4, 8 para consultas; 1, 4, 8, 16, 32 para documentos) sin reentrenar, ajustando así el equilibrio entre precisión y velocidad. Con 314,6 millones de parámetros y licencia MIT, está pensado para sistemas de recuperación semántica en japonés, como motores de búsqueda, sistemas de preguntas y respuestas o pipelines RAG. Su ventana de entrada recomendada es de 256 tokens para consultas y 1.024 tokens para documentos, más los tokens de resumen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con tokens de resumen (basado en modernbert-ja-310m) + proyección lineal (768 → 128, sin bias) + normalización L2 |
| Parámetros totales | 314.611.968 (incluye 61.440 tokens de resumen y 98.304 de proyección) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | Consulta: 256 tokens + 16 tokens de resumen; documento: 1.024 tokens + 64 tokens de resumen |
| Tipos de cuantización | No disponible (entrenado en bf16) |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensión de los vectores | 128 |
| Vectores por consulta | 16 (truncables a 1, 2, 4, 8) |
| Vectores por documento | 64 (truncables a 1, 4, 8, 16, 32) |
| Función de puntuación | MeanMaxSim: (1/|q|) Σ_i max_j q_i · d_j |
| Prefijos | Consulta: 16 tokens de resumen + "検索クエリ: "; documento: 64 tokens de resumen + "検索文書: " |
| Librería principal | sentence-transformers >= 6.0.0 (MultiVectorEncoder) |

## Arquitectura y entrenamiento

El modelo parte de sbintuitions/modernbert-ja-310m, un transformer japonés de 310M parámetros preentrenado únicamente con modelado de lenguaje enmascarado. Sobre esta base se añaden dos componentes nuevos: 16 tokens de resumen para consultas y 64 para documentos, con parámetros aprendibles independientes, y una capa de proyección lineal de 768 a 128 dimensiones sin sesgo, seguida de normalización L2. En la inferencia, solo se extraen las representaciones de las posiciones de los tokens de resumen de la última capa; los tokens del cuerpo no se utilizan. La similitud entre consulta y documento se calcula con MeanMaxSim, que promedia la máxima similitud de cada vector de consulta con los vectores de documento.

El entrenamiento combina la interacción tardía con la técnica MetaEmbed y el entrenamiento Matryoshka multi-vector. Se calcularon pérdidas para seis combinaciones de (vectores de consulta, vectores de documento): (1,1), (2,4), (4,8), (8,16), (8,32) y (16,64), promediándolas para que un solo entrenamiento produzca múltiples configuraciones de precisión y coste. Los datos de entrenamiento son los mismos que los de los modelos relacionados e incluyen n-tuples (1 consulta, 1 positivo, 5 negativos) y pairs (solo positivos) extraídos de fuentes como auto-wiki-qa (100.000), mqa-ja (100.000), mmarco-ja (50.000), civicqa-ja (43.382, privado), quiz-no-mori (13.422), quiz-works (12.502), amagasaki-qna (11.069), miracl-retrieval (4.603), mrtydi (3.602) y anlp-meeting-retrieval (1.926 y 1.952). No se menciona el uso de RLHF ni DPO. La precisión mixta durante el entrenamiento fue bf16.

## Capacidades

- Recuperación de información en japonés mediante interacción tardía y representación multi-vector.
- Codificación de consultas y documentos en vectores de 128 dimensiones, con 16 vectores por consulta y 64 por documento (valores máximos).
- Truncamiento de vectores en inferencia para las combinaciones entrenadas: (1,1), (2,4), (4,8), (8,16), (8,32) y (16,64). No se soportan otras combinaciones.
- Cálculo de similitud mediante la función MeanMaxSim.
- Integración con sentence-transformers 6.0.0 o superior a través de la clase MultiVectorEncoder.
- No es un modelo generativo: no produce texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling, function calling ni agentes multi-paso.
- Capacidad multilingüe limitada al japonés.
- No dispone de modo de pensamiento (thinking mode), visión ni audio.

## Casos de uso

- Búsqueda semántica en documentación técnica japonesa: el modelo puede indexar manuales y artículos, y recuperar pasajes relevantes ante consultas en japonés. Su representación multi-vector captura matices semánticos que un único vector no refleja, y el truncamiento permite acelerar la búsqueda en producción.
- Sistemas de preguntas y respuestas sobre bases de conocimiento internas: se indexan preguntas frecuentes y documentos corporativos con 64 vectores por documento; en consulta se usan 16 vectores y se recuperan los pasajes más similares para alimentar a un LLM generativo en un pipeline RAG.
- Atención al cliente automatizada en japonés: integrado en un chatbot, el modelo recupera respuestas predefinidas o fragmentos de manuales ante las consultas de los usuarios. La ventana de 256 tokens para consultas es adecuada para preguntas típicas de soporte.
- Búsqueda en actas de reuniones y documentación de proyectos: el dataset anlp-meeting-retrieval sugiere que el modelo está afinado para recuperar fragmentos de reuniones. Se puede usar para que los equipos encuentren decisiones o discusiones pasadas a partir de descripciones en lenguaje natural.
- Recuperación de pasajes para RAG en japonés: al proporcionar representaciones compactas (128 dimensiones), reduce el uso de memoria en comparación con ColBERT, lo que permite indexar grandes corpus en infraestructuras modestas. Las combinaciones truncadas (p. ej., 8 vectores de consulta y 32 de documento) permiten ajustar la latencia.
- Búsqueda en enciclopedias y wikis japonesas: el dataset auto-wiki-qa indica un entrenamiento orientado a preguntas y respuestas de Wikipedia. El modelo puede servir para motores de búsqueda internos sobre wikis corporativas o enciclopedias.
- Filtrado y deduplicación de documentos: aunque no es su función principal, los vectores multi-vector permiten calcular similitudes entre documentos para agrupar o eliminar duplicados en corpus japoneses, aprovechando el truncamiento para operaciones a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni evaluaciones de recuperación (nDCG, Recall@k). Tampoco se proporcionan comparativas numéricas con los modelos relacionados.

## Requisitos de hardware

- VRAM estimada para los pesos: en bf16, aproximadamente 630 MB (314,6 M × 2 bytes); en fp32, 1,26 GB; en int8, 315 MB; en int4, 157 MB. El uso real de VRAM depende del framework, del tamaño de lote y de la longitud de las secuencias.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en bf16 para inferencia. Para alto rendimiento se recomiendan A100, H100 o L40S. En GPUs de consumo, funciona en RTX 3060, RTX 4090, etc.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más de VRAM. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: sentence-transformers 6.0.0 o superior, Text Embeddings Inference (TEI) y Hugging Face Inference Endpoints. No se menciona soporte para llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponible. No se proporcionan datos de rendimiento en la información consultada.

## Comparativa con modelos similares

| Modelo | Vectores por documento | Dimensión del vector | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sazanami-MetaEmbed-310m (este modelo) | 64 (truncable a 1/4/8/16/32) | 128 | Consulta 256+16, documento 1024+64 | MIT | HuggingFace |
| Sazanami-ColBERT-310m | Igual al número de tokens efectivos del documento | No disponible | No disponible | No disponible | HuggingFace |
| Sazanami-AGC-310m | Máximo 32 | No disponible | No disponible | No disponible | HuggingFace |
| Sazanami-Embed-310m | 1 | 768 | No disponible | No disponible | HuggingFace |

Los cuatro modelos comparten la misma base (sbintuitions/modernbert-ja-310m) y los mismos datos de entrenamiento. La diferencia principal radica en el número de vectores por documento y en la posibilidad de truncamiento. Sazanami-ColBERT-310m está orientado a máxima precisión en documentos largos, mientras que Sazanami-Embed-310m minimiza el almacenamiento y el cálculo con un único vector de 768 dimensiones. Sazanami-MetaEmbed-310m ofrece un equilibrio ajustable entre ambos extremos.

## Limitaciones y advertencias

- El modelo solo soporta japonés; no es multilingüe.
- No es un modelo generativo: no produce texto, no razona ni mantiene conversaciones. Su función es exclusivamente la recuperación de información.
- El truncamiento de vectores solo está garantizado para las combinaciones entrenadas: (1,1), (2,4), (4,8), (8,16), (8,32) y (16,64). Otras combinaciones no han sido entrenadas y pueden degradar el rendimiento.
- La longitud de entrada está limitada a 256 tokens para consultas y 1.024 tokens para documentos (más los tokens de resumen). Los textos más largos deben truncarse.
- El entrenamiento utiliza un dataset privado (civicqa-ja), lo que dificulta la reproducibilidad completa de los resultados.
- No se han publicado benchmarks, por lo que no se dispone de métricas objetivas de rendimiento en tareas estándar de recuperación.
- El repositorio del modelo tiene 0 descargas y 0 "likes" en el momento de la consulta, lo que indica que no ha sido ampliamente validado por la comunidad.
- La documentación está principalmente en japonés, lo que puede ser una barrera para desarrolladores que no dominen el idioma.
- La licencia MIT permite uso comercial, pero se desconoce si los datasets utilizados (especialmente el privado) imponen restricciones adicionales.
- Al ser un modelo de recuperación, puede devolver documentos poco relevantes si la consulta está fuera del dominio de los datos de entrenamiento. No genera contenido, por lo que no hay riesgo de alucinación en el sentido generativo, pero sí de recuperación errónea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mahiyama/Sazanami-MetaEmbed-310m
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Modelos relacionados:
  - Sazanami-ColBERT-310m: https://huggingface.co/mahiyama/Sazanami-ColBERT-310m
  - Sazanami-AGC-310m: https://huggingface.co/mahiyama/Sazanami-AGC-310m
  - Sazanami-Embed-310m: https://huggingface.co/mahiyama/Sazanami-Embed-310m
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/mahiyama/auto-wiki-qa
  - https://huggingface.co/datasets/mahiyama/mqa-ja
  - https://huggingface.co/datasets/mahiyama/mmarco-ja
  - https://huggingface.co/datasets/mahiyama/miracl-retrieval
  - https://huggingface.co/datasets/mahiyama/mrtydi
  - https://huggingface.co/datasets/mahiyama/amagasaki-qna
  - https://huggingface.co/datasets/mahiyama/quiz-works
  - https://huggingface.co/datasets/mahiyama/quiz-no-mori
  - https://huggingface.co/datasets/mahiyama/anlp-meeting-retrieval
  - https://huggingface.co/datasets/mahiyama/kosodate-faq-pairs-ja
- Artículos:
  - ColBERT (Khattab y Zaharia, 2020): https://arxiv.org/abs/2004.12832
  - ColBERTv2 (Santhanam et al., 2022): https://arxiv.org/abs/2112.01488
  - MetaEmbed (arXiv:2509.18095): https://arxiv.org/abs/2509.18095
- Repositorio GitHub de MetaEmbed: https://github.com/facebookresearch/MetaEmbed
- Póster en ICLR 2026: https://iclr.cc/virtual/2026/poster/10006562
- Documentación de MultiVectorEncoder en sentence-transformers: https://sbert.net/docs/package_reference/multi_vector_encoder/model.html
- Página de modelos del autor: https://huggingface.co/mahiyama/models

# oxfrug/bge-m3-swedish-superlim

## Resumen

`oxfrug/bge-m3-swedish-superlim` es un ajuste fino contrastivo del modelo multilingüe de embeddings BAAI/bge-m3 (568M parámetros) orientado específicamente al sueco. Desarrollado por el usuario oxfrug, el modelo busca mejorar el rendimiento en tareas de similitud semántica y recuperación de información (retrieval) en sueco, un idioma con escasos recursos de embeddings de alta calidad. El ajuste se realizó con datos del benchmark sueco SuperLim, incluyendo SweParaphrase, SweNLI y SweFAQ, más un conjunto de pares pregunta-respuesta del ámbito sanitario.

La relevancia de este modelo radica en que, aunque BGE-M3 es un modelo potente y multilingüe, no está optimizado para sueco. Este fine-tune consigue superar al modelo sueco de referencia KBLab/sentence-bert-swedish-cased en las dos tareas evaluadas de SuperLim, y además aprovecha la capacidad Matryoshka de BGE-M3 para recortar las dimensiones del embedding (recomendado a 768) sin perder rendimiento. Con una licencia MIT, es totalmente libre para uso comercial y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, base de BGE-M3) |
| Parametros totales | 568M |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | bf16 (recomendado), 4-bit NF4 (posible pero degrada rendimiento) |
| Idiomas soportados | Sueco (sv) como idioma principal; el modelo base es multilingüe pero el ajuste es específico para sueco |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de BGE-M3, un encoder Transformer basado en XLM-RoBERTa con 568M de parámetros y una ventana de contexto de 8192 tokens. BGE-M3 soporta tres funcionalidades de retrieval: dense, multi-vector y sparse, aunque este fine-tune se centra en la representación dense. El ajuste se realizó con MultipleNegativesRankingLoss durante una sola época, con todos los parámetros entrenados en bf16 (full fine-tuning). Los datos de entrenamiento incluyen pares de SweParaphrase (train) con puntuación ≥ 4, entailments de SweNLI (40k), pares pregunta-respuesta de SweFAQ (train) y un conjunto de preguntas-respuestas del sector sanitario sueco. Se bloquearon explícitamente las particiones dev y test de SuperLim para evitar contaminación.

Una característica destacable es el entrenamiento Matryoshka, heredado de BGE-M3, que permite recortar las dimensiones del embedding sin reentrenar. La recomendación del autor es usar las primeras 768 dimensiones y re-normalizar el vector, lo que mantiene el rendimiento en STS y mejora los resultados en SweFAQ.

## Capacidades

- Generación de embeddings densos para similitud semántica de frases y documentos en sueco.
- Recuperación de información (retrieval) con prefijo de consulta ("Represent this sentence for searching relevant passages: ") para distinguir queries de pasajes.
- Clustering y clasificación de textos basada en similitud coseno.
- Soporte de Matryoshka: permite recortar la dimensionalidad del embedding (por ejemplo, a 768 o 1024) con pérdida mínima de rendimiento.
- Funciona con la librería sentence-transformers y es compatible con text-embeddings-inference (TEI) para despliegue en producción.
- Aunque el ajuste es específico para sueco, al estar basado en BGE-M3, puede ofrecer embeddings multilingües razonables, aunque sin garantías de rendimiento fuera del sueco.

## Casos de uso

- Búsqueda semántica en corpus suecos: indexar documentos legales, artículos científicos o noticias en sueco y recuperar pasajes relevantes mediante similitud coseno, gracias a la ventana de contexto de 8192 tokens.
- Sistemas de preguntas y respuestas (Q&A) con recuperación aumentada (RAG): combinar el modelo con un LLM para responder consultas de usuarios en sueco, usando el prefijo de query para codificar preguntas y el embedding de pasajes para buscar en una base de conocimiento.
- Atención al cliente automatizada: clasificar y recuperar respuestas de un FAQ en sueco, como demuestra su buen rendimiento en SweFAQ (precisión 0.6514 a 768 dimensiones).
- Deduplicación de documentos: detectar duplicados o versiones similares de textos suecos mediante umbrales de similitud coseno, útil para limpiar bases de datos.
- Clustering de noticias o artículos: agrupar contenido sueco por temas usando embeddings de frases o párrafos, aprovechando la capacidad de procesar documentos largos.
- Análisis de sentimiento o clasificación de textos: usar los embeddings como características de entrada para clasificadores supervisados en tareas específicas del sueco (reseñas, encuestas, etc.).

## Benchmarks y rendimiento

La model card proporciona resultados en dos tareas de SuperLim-2 (particiones held-out): SweParaphrase (similitud semántica, Spearman ρ) y SweFAQ (precisión in-category sobre 109 ítems). Se comparan con KBLab/sentence-bert-swedish-cased (110M) y con BGE-M3 zero-shot.

| Modelo | Params | SweParaphrase ρ | SweFAQ |
|---|---:|---:|---:|
| KBLab v2.0 (card) | 110M | 0.8213 | 0.5871 |
| KBLab v2.0 (re-run del autor) | 110M | 0.8207 | 0.5780 |
| BGE-M3 zero-shot | 568M | 0.8165 | 0.6055 |
| **Este modelo @768 (recomendado)** | **568M** | **0.8354** | **0.6514** |
| Este modelo @1024 | 568M | 0.8353 | 0.6422 |

Nota: SweParaphrase test no se usó en entrenamiento; SweFAQ sí usó la partición train oficial (más datos sanitarios), por lo que no debe considerarse zero-shot. No hay otros benchmarks publicados.

## Requisitos de hardware

- VRAM estimada: ~1.1 GB en bf16 para el modelo completo (568M parámetros). Con cuantización 4-bit NF4, puede reducirse a ~0.3 GB, aunque el autor advierte que degrada el rendimiento en STS (0.820 vs 0.8354).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bf16 (por ejemplo, NVIDIA GTX 1650, RTX 2060, etc.). Para inferencia rápida en producción, se recomienda una GPU de gama media como RTX 3090 o superior.
- Es viable en CPU para tareas por lotes pequeñas, pero la latencia será alta (568M parámetros en bf16).
- Opciones de despliegue: sentence-transformers (Python), text-embeddings-inference (TEI) para endpoints compatibles, y vLLM (aunque está más orientado a generación, puede servir para embeddings). También se puede usar con llama.cpp si se convierte a GGUF, aunque no es el flujo habitual para este tipo de modelos.
- Latencia y throughput: no se han publicado mediciones específicas. Como referencia, BGE-M3 en una GPU A100 procesa cientos de secuencias por segundo; este modelo tiene el mismo coste computacional.

## Comparativa con modelos similares

| Modelo | Params | Contexto | SweParaphrase ρ | SweFAQ | Licencia |
|---|---:|---:|---:|---:|---|
| oxfrug/bge-m3-swedish-superlim | 568M | 8192 | 0.8354 | 0.6514 | MIT |
| KBLab/sentence-bert-swedish-cased | 110M | 512 (aprox.) | 0.8213 | 0.5871 | MIT (según card) |
| BAAI/bge-m3 (zero-shot) | 568M | 8192 | 0.8165 | 0.6055 | MIT |

El modelo supera a KBLab en ambas tareas y mejora a BGE-M3 zero-shot, aunque con un coste de memoria y latencia mayor que KBLab. La ventaja de contexto de 8192 tokens frente a los 512 de KBLab es significativa para documentos largos.

## Limitaciones y advertencias

- Solo se ha evaluado en dos tareas de SuperLim (SweParaphrase y SweFAQ); no hay evidencia de que sea el mejor embedder sueco en general.
- El entrenamiento incluyó datos del ámbito sanitario sueco, lo que puede introducir sesgos en otros dominios.
- El modelo no genera texto; es exclusivamente un encoder de embeddings.
- La cuantización 4-bit NF4 degrada el rendimiento en STS (0.820 vs 0.8354); se recomienda usar bf16.
- Para obtener el mejor rendimiento, se debe recortar el embedding a 768 dimensiones y re-normalizar; no hacerlo puede dar resultados subóptimos.
- El modelo es más lento y pesado que alternativas más pequeñas como KBLab (110M), lo que puede ser un inconveniente en despliegues con recursos limitados.
- Aunque la licencia MIT permite uso comercial, el autor no ofrece garantías sobre el comportamiento en producción; se recomienda validar en el dominio de aplicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oxfrug/bge-m3-swedish-superlim
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Documentación de BGE-M3: https://bge-model.com/bge/bge_m3.html
- Proyecto SuperLim (AI Sweden): https://www.ai.se/en/project/superlim
- Repositorio de BGE-M3 (inferless): https://github.com/inferless/Bge-m3
- Página oficial de BGE: https://bge.baai.ac.cn/

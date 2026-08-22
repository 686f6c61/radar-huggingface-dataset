# ManasaKaza/knowledge-search-dense-scifact-v1

## Resumen

`knowledge-search-dense-scifact-v1` es un modelo de embeddings densos para búsqueda semántica, resultado de un ajuste fino (fine-tuning) del modelo base `sentence-transformers/all-MiniLM-L6-v2` sobre el corpus científico SciFact. Lo desarrolla el usuario ManasaKaza y se publica bajo la librería sentence-transformers con el pipeline de similitud de frases.

El modelo está diseñado para recuperar y comparar fragmentos de literatura científica (abstracts y frases) mediante representaciones vectoriales densas. Se entrenó con la función de pérdida `MultipleNegativesRankingLoss` sobre un conjunto de datos de 733 muestras, lo que lo convierte en un modelo muy ligero (22,7 millones de parámetros) y apto para despliegues con recursos limitados.

Su relevancia radica en que ofrece una alternativa compacta y especializada para tareas de búsqueda densa en el dominio biomédico y científico, basada en la arquitectura MiniLM de 6 capas, con un contexto máximo de 512 tokens. Aunque su adopción es actualmente nula (0 descargas, 0 likes), su tamaño reducido lo hace atractivo para prototipos y pipelines de recuperación de literatura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, MiniLM-L6-v2, 6 capas) |
| Parametros totales | 22.713.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, formato original) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero el ajuste se hizo sobre corpus en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MiniLM-L6-v2, un transformer encoder de 6 capas con 384 dimensiones de embedding y 22,7 millones de parámetros. El ajuste fino se realizó sobre el corpus SciFact, un conjunto de datos de verificación de afirmaciones científicas, usando la pérdida `MultipleNegativesRankingLoss` con un dataset de 733 muestras. Los papers de referencia citados en los tags son el de SciFact (arxiv:1908.10392) y el de Sentence-BERT (arxiv:1807.03748).

No se ha publicado información sobre la composición exacta del dataset de entrenamiento ni sobre la metodología de evaluación. El modelo se generó con el script de entrenamiento de sentence-transformers (`generated_from_trainer`) y es compatible con el servidor de inferencia de embeddings de Hugging Face (`text-embeddings-inference`).

## Capacidades

- Generación de embeddings densos de frases y documentos para similitud semántica.
- Búsqueda densa de literatura científica: recupera pasajes relevantes de abstracts de papers.
- Compatible con el pipeline de `sentence-similarity` y con la librería sentence-transformers.
- Soporte de `feature-extraction` para integración en pipelines de búsqueda.
- Funciona con `text-embeddings-inference`, lo que facilita su despliegue en endpoints compatibles.
- No dispone de capacidades de tool calling, agentes, visión ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- Recuperación de literatura científica: dado un query de investigación, el modelo recupera abstracts de papers relevantes de una base de documentos (ej. corpus SciFact) mediante similitud coseno.
- Verificación de afirmaciones científicas: en un pipeline de fact-checking, el modelo puede emparejar una afirmación con los pasajes de evidencia más probables.
- Recomendación de artículos: comparar el embedding de un artículo de interés con el resto de una colección para sugerir publicaciones similares.
- Clustering de papers: agrupar documentos por temática usando los embeddings generados, útil para organización de bibliotecas científicas.
- Búsqueda semántica en portales de literatura: sustituir búsqueda por palabras clave con recuperación densa, mejorando el recall en dominios técnicos.
- Prototipos de Q&A sobre literatura: combinado con un modelo generativo, el embedding puede recuperar el contexto relevante antes de responder preguntas sobre papers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU sin GPU: el modelo es muy ligero (22,7M parámetros), por lo que puede ejecutarse en CPU con latencia de milisegundos por frase.
- VRAM estimada: menos de 1 GB en fp32; alrededor de 0,5 GB en fp16. En cuantización INT8 (si se convirtiera) estaría por debajo de 0,3 GB.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA T4, GTX 1650, RTX 3060). No requiere GPU de datacenter.
- Compatible con consumer GPU: sí, cualquier GPU moderna.
- Opciones de despliegue: sentence-transformers, `text-embeddings-inference` (endpoint compatible), Hugging Face Inference Endpoints, y mediante ONNX para optimización en CPU.
- Latencia y throughput: no disponibles en la información proporcionada, pero al ser un modelo MiniLM de 6 capas, la latencia típica es inferior a 10 ms por frase en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia |
|---|---|---|---|---|
| `knowledge-search-dense-scifact-v1` (este) | 22,7M | 512 | Científico (SciFact) | no disponible |
| `sentence-transformers/all-MiniLM-L6-v2` (base) | 22,7M | 512 | General | Apache-2.0 |
| `ms-marco-MiniLM-L-6-v2` | 22,7M | 512 | Búsqueda general (MS MARCO) | Apache-2.0 |
| `multi-qa-MiniLM-L6-cos-v1` | 22,7M | 512 | QA y búsqueda multilingüe | Apache-2.0 |

El modelo se diferencia de las alternativas por su ajuste específico sobre el corpus SciFact, orientado a la literatura científica, mientras que las alternativas son de propósito general o multilingüe. Sin embargo, su tamaño y arquitectura son idénticos a los de la familia MiniLM-L6.

## Limitaciones y advertencias

- Sesgos y dominio: el ajuste se hizo sobre un conjunto muy reducido (733 muestras) del dominio científico (SciFact), por lo que su rendimiento fuera de este dominio será muy limitado.
- Riesgo de alucinación: no es un modelo generativo, no produce texto, por lo que no hay alucinación, pero sí puede generar embeddings incorrectos para consultas fuera de dominio.
- Limitación de idioma: el corpus de entrenamiento está en inglés; aunque el modelo base es multilingüe, el ajuste puede degradar el rendimiento en otros idiomas.
- Restricciones de licencia: la licencia no está especificada, por lo que el uso comercial no está garantizado legalmente.
- Contexto limitado a 512 tokens: las consultas o documentos más largos deberán truncarse.
- Sin benchmarks publicados: no hay evidencia empírica de su rendimiento frente a otras opciones.
- Riesgo de overfitting: el dataset de entrenamiento es muy pequeño (733 muestras), lo que puede causar sobreajuste al corpus SciFact.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ManasaKaza/knowledge-search-dense-scifact-v1
- Paper SciFact (arxiv:1908.10392): https://arxiv.org/abs/1908.10392
- Paper Sentence-BERT (arxiv:1807.03748): https://arxiv.org/abs/1807.03748
- Repositorio sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Modelo base `all-MiniLM-L6-v2`: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Repo del autor (ManasaKaza): https://huggingface.co/ManasaKaza/models</think>## Resumen

`knowledge-search-dense-scifact-v1` es un modelo de embeddings densos para búsqueda semántica, resultado de un ajuste fino del modelo base `sentence-transformers/all-MiniLM-L6-v2` sobre el corpus de literatura científica SciFact. Lo desarrolla ManasaKaza y se publica bajo la librería sentence-transformers con el pipeline de similitud de frases. El modelo está pensado para recuperar y comparar fragmentos de abstracts científicos mediante representaciones vectoriales densas.

Con 22,7 millones de parámetros y una ventana de contexto de 512 tokens, es un modelo muy compacto que puede desplegarse en entornos con recursos limitados. Se entrenó con la función de pérdida `MultipleNegativesRankingLoss` sobre un conjunto de datos de solo 733 muestras, lo que lo convierte en una solución especializada para el dominio biomédico y de verificación de afirmaciones científicas, aunque con un riesgo evidente de sobreajuste al corpus de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, MiniLM-L6-v2, 6 capas) |
| Parametros totales | 22.713.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero el ajuste se hizo sobre corpus en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MiniLM-L6-v2, un transformer encoder de 6 capas con 384 dimensiones de embedding y 22,7 millones de parámetros. Es una variante destilada de BERT que mantiene un buen equilibrio entre rendimiento y eficiencia. El ajuste fino se realizó sobre el corpus SciFact, un conjunto de datos de verificación de afirmaciones científicas, usando la pérdida `MultipleNegativesRankingLoss`, que optimiza el modelo para tareas de retrieval denso.

El entrenamiento se llevó a cabo con la herramienta de sentence-transformers, como indica la etiqueta `generated_from_trainer`. No se ha publicado información sobre el número de tokens totales, la composición exacta del dataset ni el uso de técnicas de RLHF o DPO. El modelo es compatible con `text-embeddings-inference` y con endpoints de Hugging Face, lo que facilita su despliegue en producción.

## Capacidades

- Generación de embeddings densos para similitud semántica de frases y documentos.
- Búsqueda semántica en literatura científica (abstracts, títulos, pasajes).
- Recuperación de pasajes relevantes para verificación de afirmaciones (fact-checking).
- Compatible con la librería sentence-transformers para integración en pipelines de búsqueda.
- Soporte para despliegue con `text-embeddings-inference` (TEI) y endpoints compatibles.
- Capacidad de feature extraction para uso en sistemas de recomendación y clustering de documentos.

## Casos de uso

- Recuperación de literatura científica: dado un query como "mecanismos de señalización transmembrana", el modelo devuelve abstracts relevantes de un corpus científico mediante similitud coseno.
- Verificación de afirmaciones biomédicas: en un pipeline de fact-checking, el modelo empareja una afirmación con los pasajes de evidencia más probables de un conjunto de papers.
- Clustering de artículos: al generar embeddings de abstracts, se pueden agrupar documentos por temática con técnicas de clustering como HDBSCAN.
- Recomendación de bibliografía: comparar el embedding de un artículo con el resto de un corpus para sugerir publicaciones similares.
- Búsqueda semántica en plataformas de investigación: sustituir la búsqueda por palabras clave con recuperación densa, mejorando el recall en dominios técnicos.
- Prototipos de sistemas de QA sobre literatura: combinado con un modelo generativo, el embedding recupera el contexto exacto antes de que el modelo genere la respuesta.
- Análisis de tendencias científicas: embedding de abstracts para identificar temas emergentes mediante reducción de dimensionalidad y análisis de vecindad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo requiere menos de 1 GB de VRAM en fp32 (aproximadamente 0,5 GB). En fp16 sería aún menor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, por ejemplo NVIDIA T4, GTX 1050, RTX 3060. No se requiere GPU de datacenter.
- CPU: puede ejecutarse en CPU sin problemas, con latencia de milisegundos por frase.
- Opciones de despliegue: sentence-transformers, `text-embeddings-inference` (TEI), Hugging Face Inference Endpoints, y conversión a ONNX para optimización en CPU.
- Latencia y throughput: no disponible en la información publicada, pero al ser un modelo de 6 capas se espera una latencia inferior a 10 ms por frase en GPU y en el orden de decenas de ms en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia |
|---|---|---|---|---|
| `knowledge-search-dense-scifact-v1` (este) | 22,7M | 512 | Ciencia (SciFact) | no disponible |
| `sentence-transformers/all-MiniLM-L6-v2` | 22,7M | 512 | General | Apache-2.0 |
| `sentence-transformers/ms-marco-MiniLM-L-6-v2` | 22,7M | 512 | Retrieval general (MS MARCO) | Apache-2.0 |
| `sentence-transformers/multi-qa-MiniLM-L6-cos-v1` | 22,7M | 512 | Búsqueda multilingüe | Apache-2.0 |

El modelo se diferencia de las alternativas por su ajuste específico sobre SciFact, lo que lo hace más adecuado para el dominio científico, aunque con un dataset de entrenamiento muy reducido. Las alternativas de propósito general tienen licencias permisivas, mientras que este modelo no especifica licencia.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo está ajustado exclusivamente sobre SciFact, por lo que su rendimiento fuera del ámbito científico será limitado.
- Riesgo de sobreajuste: el dataset de entrenamiento es muy pequeño (733 muestras), lo que puede provocar overfitting al corpus de SciFact.
- Limitación de idioma: aunque el modelo base es multilingüe, el ajuste se hizo sobre corpus en inglés, por lo que el rendimiento en otros idiomas puede degradarse.
- Contexto limitado: la ventana de 512 tokens obliga a truncar documentos largos, lo que puede perder información relevante.
- Licencia no especificada: no se indica licencia, por lo que el uso comercial no está garantizado legalmente.
- Riesgo de alucinación: no es un modelo generativo, pero puede generar falsos positivos en retrieval si el dominio no coincide.
- Sin benchmarks publicados: no hay evidencia empírica de su rendimiento frente a otros modelos de la familia MiniLM.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ManasaKaza/knowledge-search-dense-scifact-v1)
- [Paper SciFact](https://arxiv.org/abs/1908.10392) (arxiv:1908.10384)
- [Paper Sentence-BERT](https://arxiv.org/abs/1807.03748) (arxiv:1807.03748)
- [Modelo base all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- [Repositorio sentence-transformers](https://github.com/UKPLab/sentence-transformers)
- [Modelos del autor ManasaKaza](https://huggingface.co/ManasaKaza/models)

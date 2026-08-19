# lightonai/ColBERT-Zero

## Resumen

ColBERT-Zero es un modelo de embeddings multi-vector desarrollado por LightOn AI, basado en la arquitectura ColBERT de interacción tardía (late interaction) construida sobre ModernBERT. Se presenta como el primer modelo ColBERT pre-entrenado a gran escala utilizando exclusivamente datos públicos, lo que lo convierte en una alternativa abierta y reproducible frente a otros modelos de recuperación que dependen de datos propietarios. Con 149 millones de parámetros, sus autores afirman que establece un nuevo estado del arte en el benchmark BEIR para modelos de menos de 150 millones de parámetros.

El modelo está diseñado para tareas de recuperación de información y similitud semántica. Su enfoque multi-vector genera una representación por token en lugar de un único vector por documento, lo que permite un emparejamiento más fino entre consultas y documentos mediante el mecanismo MaxSim. Esta granularidad le otorga ventajas en generalización fuera del dominio de entrenamiento, un problema clásico en los embeddings de vector único.

ColBERT-Zero se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face con soporte para PyLate, sentence-transformers y Text Embeddings Inference (TEI). Su tamaño compacto de 149M parámetros lo hace viable para despliegue en GPU de consumo e incluso en CPU, con un peso del repositorio de 0,6 GB en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColBERT (late interaction multi-vector) sobre ModernBERT |
| Parametros totales | 149.015.808 (149M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura base ModernBERT soporta hasta 8192 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ColBERT-Zero utiliza la arquitectura ColBERT de interacción tardía, donde consultas y documentos se codifican en múltiples vectores por token. La similitud entre una consulta y un documento se calcula mediante la operación MaxSim, que suma la máxima similitud de cada token de la consulta contra todos los tokens del documento. Esta aproximación fue propuesta originalmente en el paper de ColBERT (arxiv:1908.10084) y refinada en ColBERTv2 (arxiv:2402.01613), y permite un emparejamiento de mayor granularidad que los embeddings de vector único.

El modelo se basa en ModernBERT como backbone y ha sido pre-entrenado a gran escala utilizando únicamente datos públicos, con un dataset de 640.000 muestras. El entrenamiento emplea una función de pérdida por destilación (loss: Distillation), lo que indica transferencia de conocimiento desde un modelo profesor. Se ha entrenado con la librería PyLate, y el tag `generated_from_trainer` sugiere el uso del trainer de Hugging Face.

## Capacidades

- Recuperación de información (information retrieval) mediante embeddings multi-vector y scoring por late interaction (MaxSim).
- Similitud semántica entre textos (sentence similarity).
- Extracción de características (feature extraction) para pipelines de embeddings.
- Generalización fuera del dominio de entrenamiento, gracias a la naturaleza de late interaction de la arquitectura ColBERT.
- Compatible con PyLate, sentence-transformers y Text Embeddings Inference (TEI).
- Soporte de endpoints compatibles para despliegue en producción (tag `endpoints_compatible`).
- Idioma: ingles únicamente.
- No genera texto: es exclusivamente un modelo de embeddings para recuperación.

## Casos de uso

- Recuperación aumentada por generación (RAG): el modelo puede indexar colecciones de documentos y recuperar los pasajes más relevantes para una consulta, aprovechando la interacción tardía para obtener resultados más precisos que los embeddings de vector único en pipelines de generación aumentada.
- Búsqueda semántica en bases de conocimiento: ideal para buscar en wikis, documentación técnica o bases de datos de conocimiento con consultas en lenguaje natural, gracias a su robustez en generalización fuera del dominio de entrenamiento.
- Verificación de hechos (fact checking): los resultados en NanoFEVER (accuracy@1 de 0,96 y nDCG@10 de 0,96) demuestran su capacidad para recuperar evidencias relevantes en tareas de verificación de afirmaciones.
- Sistemas de pregunta-respuesta: puede recuperar pasajes candidatos para sistemas de QA extractivo, como muestra su rendimiento en NanoFiQA2018 (accuracy@1 de 0,58).
- Clasificación y agrupación de documentos: puede utilizarse para deduplicar, agrupar o clasificar documentos por similitud semántica, aprovechando sus embeddings de alta granularidad por token.
- Indexación de contenido web: su capacidad para procesar contextos largos (hasta 8192 tokens en la arquitectura base ModernBERT) lo hace adecuado para indexar páginas web completas o documentos extensos en motores de búsqueda internos.

## Benchmarks y rendimiento

Los siguientes resultados han sido declarados por el autor del modelo en la model card de Hugging Face. Se evaluó el modelo en cuatro datasets de recuperación de información (NanoClimateFEVER, NanoDBPedia, NanoFEVER y NanoFiQA2018) utilizando la métrica MaxSim.

| Dataset | Accuracy@1 | Accuracy@10 | Precision@1 | Recall@10 | nDCG@10 | MRR@10 | MAP@100 |
|---|---|---|---|---|---|---|---|
| NanoClimateFEVER | 0,36 | 0,88 | 0,36 | 0,554 | 0,451 | 0,535 | 0,357 |
| NanoDBPedia | 0,86 | 0,98 | 0,86 | 0,427 | 0,733 | 0,900 | 0,581 |
| NanoFEVER | 0,96 | 1,00 | 0,96 | 0,980 | 0,962 | 0,977 | 0,948 |
| NanoFiQA2018 | 0,58 | 0,82 | 0,58 | no disponible | no disponible | no disponible | no disponible |

Nota: los datos de Recall@10, nDCG@10, MRR@10 y MAP@100 para NanoFiQA2018 no están disponibles en la información proporcionada (la métrica Recall@5 es 0,546).

Adicionalmente, según la información publicada por los autores en la página de la variante supervisada (ColBERT-Zero-supervised), esa versión alcanza 55,43 nDCG@10 en el benchmark BEIR, superando a GTE-ModernColBERT y GTE-ModernBERT, y estableciendo un nuevo estado del arte para modelos de menos de 150M de parámetros. Estos datos corresponden a la variante supervisada, no a ColBERT-Zero base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 600 MB en fp32 (149M parámetros × 4 bytes). Con cuantización a int8 se reduciría a unos 150 MB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Modelos como RTX 3060, RTX 4060 o superiores son más que suficientes. También es viable su ejecución en CPU.
- El tamaño compacto del modelo permite su despliegue en GPU de consumo sin problemas.
- Opciones de despliegue: PyLate, sentence-transformers, Text Embeddings Inference (TEI), endpoints compatibles con Hugging Face.
- Latencia y throughput: no disponible en la información proporcionada, aunque al ser un modelo de 149M parámetros, la latencia de inferencia es baja en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | BEIR nDCG@10 |
|---|---|---|---|---|
| ColBERT-Zero (este modelo) | 149M | ColBERT sobre ModernBERT | Apache 2.0 | no disponible (ver benchmarks Nano) |
| ColBERT-Zero-supervised | 149M | ColBERT sobre ModernBERT | Apache 2.0 | 55,43 |
| GTE-ModernColBERT | ~149M | ColBERT sobre ModernBERT | no disponible | inferior a ColBERT-Zero-supervised |
| GTE-ModernBERT | ~149M | ModernBERT | no disponible | inferior a ColBERT-Zero-supervised |

Nota: los datos de GTE-ModernColBERT y GTE-ModernBERT se refieren a las

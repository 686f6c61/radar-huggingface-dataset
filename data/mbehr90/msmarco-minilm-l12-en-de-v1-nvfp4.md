# mbehr90/msmarco-MiniLM-L12-en-de-v1-nvfp4

## Resumen

El modelo `mbehr90/msmarco-MiniLM-L12-en-de-v1-nvfp4` es una cuantización NVFP4 del cross-encoder bilingüe inglés-alemán `cross-encoder/msmarco-MiniLM-L12-en-de-v1`, desarrollado por el usuario mbehr90. Este modelo está diseñado para tareas de re-ranking de pasajes en recuperación de información, puntuando pares de consulta-documento para ordenar resultados de búsqueda. La cuantización se ha realizado con la herramienta `llm-compressor` 0.13.0 y está optimizada para su ejecución en vLLM, lo que permite reducir el tamaño del modelo de 449 MiB a 217 MiB sin degradación significativa de la calidad.

Arquitectónicamente, se basa en un transformer BERT de 12 capas (MiniLM-L12) con 117,6 millones de parámetros, y su ventana de contexto no se especifica en la información disponible, aunque los modelos MiniLM suelen soportar 512 tokens. La relevancia actual de este modelo radica en que ofrece una alternativa cuantizada y eficiente para despliegues de re-ranking en producción, especialmente en entornos con restricciones de memoria o latencia, manteniendo un rendimiento comparable al modelo original en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM-L12) cross-encoder |
| Parametros totales | 117.654.145 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (tambien se evaluaron FP8 y fp32) |
| Idiomas soportados | Ingles y aleman (bilingue EN-DE) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un cross-encoder basado en MiniLM-L12, una variante de BERT con 12 capas y 117 millones de parámetros, entrenado para la tarea de re-ranking de pasajes en el dataset MS MARCO Passage Ranking. El modelo original fue fine-tuneado para el par de idiomas inglés-alemán, lo que le permite puntuar la relevancia entre una consulta y un documento en ambos idiomas o de forma cruzada.

La cuantización NVFP4 se aplicó únicamente a las capas lineales del encoder, manteniendo en bf16 los embeddings de vocabulario, posición y token-type, así como el pooler y la cabeza de clasificación. El proceso se realizó con `llm-compressor` 0.13.0 y se midió de extremo a extremo en una NVIDIA H100 80 GB con vLLM 0.26.0. Durante el desarrollo se detectó un bug en la fusión de escalas de las proyecciones QKV en vLLM, que fue corregido añadiendo los nombres `query`, `key` y `value` a la lista de capas fusionables en `llm-compressor`. Sin esta corrección, el modelo cuantizado obtenía un nDCG@10 de 0.042 (nivel aleatorio); tras la corrección, alcanzó 0.704 y finalmente 0.9516 en la evaluación completa.

## Capacidades

- Re-ranking de pasajes: puntua pares consulta-documento para ordenar resultados de búsqueda, tanto en inglés como en alemán.
- Clasificación de relevancia: devuelve una puntuación de similitud entre dos textos, util para filtrado o verificación de pares.
- Búsqueda de información multilingue: soporta consultas en un idioma y documentos en el otro (cross-lingual).
- Integracion con vLLM: se sirve mediante el endpoint de pooling de vLLM, lo que permite alto rendimiento en produccion.
- Eficiencia de memoria: al estar cuantizado en NVFP4, reduce el tamano del modelo a menos de la mitad del original fp32.
- No es generativo: no produce texto, solo puntua relevancia, por lo que no aplica tool calling ni razonamiento multi-paso.

## Casos de uso

- Re-ranking en motores de busqueda: integrar el modelo como segunda etapa en un pipeline de recuperacion, donde un primer sistema (bi-encoder) obtiene candidatos y este cross-encoder los reordena por relevancia. Su bajo peso permite desplegarlo en servicios con alta concurrencia.
- Busqueda semantica bilingue EN-DE: en aplicaciones de recuperacion de documentos legales o tecnicos que manejan ambos idiomas, el modelo puntua pares cruzados sin necesidad de traduccion previa.
- Sistemas de preguntas y respuestas: tras recuperar pasajes candidatos, el modelo selecciona los mas relevantes para alimentar a un generador de respuestas, mejorando la precision final.
- Filtrado de documentos en pipelines de ingestion: clasificar rapidamente si un documento es relevante para una consulta dada, descartando ruido antes de procesamientos mas costosos.
- Evaluacion de calidad de pares de texto: en tareas de verificacion de similitud o deteccion de duplicados, el modelo puede puntuar pares de frases o parrafos en entornos bilingues.
- Despliegue en hardware limitado: al ocupar solo 217 MiB, puede ejecutarse en GPUs de gama baja o incluso en CPU con latencias aceptables, ideal para entornos edge o con presupuesto reducido.

## Benchmarks y rendimiento

La model card proporciona mediciones sobre el conjunto SciFact (300 consultas sobre 5183 documentos) para re-ranking, y sobre STS-B y STS17 para similitud. Los resultados se resumen en la siguiente tabla:

| Variante | Tamano | Rerank nDCG@10 | MRR@10 | Pairs/s (bs=256) |
|---|---|---|---|---|
| fp32 (original) | 449 MiB | 0.9474 | 0.9323 | 3775 |
| FP8 | 225 MiB | 0.9471 | 0.9321 | 3859 |
| NVFP4 | 217 MiB | 0.9516 | 0.9390 | No disponible |

El rendimiento de re-ranking no se degrada con la cuantizacion NVFP4; la ligera mejora sobre fp32 se atribuye a ruido estadistico con 300 consultas. El throughput para NVFP4 no se publico en la tabla, pero se menciona que se midio a traves del endpoint OpenAI de vLLM con 4096 textos multilingues.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 217 MiB en NVFP4, por lo que la inferencia requiere menos de 1 GB de VRAM, incluyendo overhead de vLLM. Cabe en cualquier GPU con al menos 2 GB.
- GPU recomendadas: se valido en NVIDIA H100 80 GB, pero por su tamano es compatible con GPUs consumer como RTX 3060, RTX 4090, o incluso integradas con suficiente memoria compartida.
- Despliegue en CPU: al ser un modelo pequeno, puede ejecutarse en CPU con latencias aceptables para cargas moderadas, aunque el rendimiento optimo se obtiene en GPU.
- Opciones de despliegue: vLLM (recomendado, con `--runner pooling`), tambien compatible con librerias de transformers y sentence-transformers si se cargan los pesos en fp32.
- Latencia y throughput: en H100 con batch size 256, el modelo fp32 procesa 3775 pares/s y FP8 3859 pares/s; NVFP4 no tiene dato publicado, pero se espera similar o superior.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Cuantizacion | Licencia | Uso |
|---|---|---|---|---|---|---|
| mbehr90/msmarco-MiniLM-L12-en-de-v1-nvfp4 | MiniLM-L12 cross-encoder | 117,6 M | No disponible | NVFP4 | MIT | Re-ranking EN-DE |
| cross-encoder/msmarco-MiniLM-L12-en-de-v1 (base) | MiniLM-L12 cross-encoder | 117,6 M | No disponible | fp32 | MIT | Re-ranking EN-DE |
| cross-encoder/ms-marco-MiniLM-L12-v2 | MiniLM-L12 cross-encoder | 117,6 M | No disponible | fp32 | Apache 2.0 | Re-ranking (monolingue EN) |

La principal diferencia con el modelo base es el tamano reducido (217 MiB vs 449 MiB) y el soporte nativo para vLLM con cuantizacion NVFP4. Frente a `ms-marco-MiniLM-L12-v2`, este modelo es bilingue EN-DE, mientras que el otro es solo ingles, y la licencia difiere (MIT vs Apache 2.0).

## Limitaciones y advertencias

- El modelo es exclusivamente un cross-encoder de re-ranking; no genera texto ni soporta tareas generativas.
- Solo cubre ingles y aleman; no es adecuado para otros idiomas sin fine-tuning adicional.
- La ventana de contexto no esta documentada; se asume el limite tipico de 512 tokens de MiniLM, pero no se ha confirmado.
- La cuantizacion NVFP4 requiere vLLM 0.26.0 o superior y hardware compatible con FP4 (NVIDIA Hopper o posterior). En GPUs sin soporte FP4, el modelo no se ejecutara correctamente.
- Se detecto un bug en la fusion de escalas QKV durante el desarrollo; aunque este checkpoint lo corrige, si se reutiliza el proceso de cuantizacion con otras herramientas, puede reproducirse el fallo.
- El rendimiento se evaluo con un conjunto limitado de 300 consultas; los resultados pueden variar en otros dominios o datasets.
- Al ser un modelo cuantizado, puede haber perdidas minimas de precision en tareas muy sensibles, aunque las metricas no muestran degradacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mbehr90/msmarco-MiniLM-L12-en-de-v1-nvfp4
- Modelo base: https://huggingface.co/cross-encoder/msmarco-MiniLM-L12-en-de-v1
- Modelo similar monolingue: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L12-v2
- Descripcion del modelo base en AIBase: https://model.aibase.com/models/details/1915694101556781058
- Version para Ascend NPU: https://aichina.news/models/Beijing-Ascend/msmarco-MiniLM-L12-en-de-v1/

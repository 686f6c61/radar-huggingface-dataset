# Nalyd1908/bge-reranker-v2-m3-luatvn

## Resumen

El modelo `Nalyd1908/bge-reranker-v2-m3-luatvn` es un ajuste fino (finetune) del cross-encoder `BAAI/bge-reranker-v2-m3`, desarrollado por Nalyd1908 (Phan Thanh Bình) para la tarea de reranking de documentos legales en vietnamita. Se basa en la arquitectura XLM-RoBERTa y está entrenado sobre el dataset `juzharii/text-mining-ce-dataset-v2`, que contiene pares de consultas y fragmentos de textos jurídicos vietnamitas. El modelo resuelve el problema de ordenar resultados de búsqueda o recuperación en el dominio legal, mejorando la precisión de sistemas de recuperación de información (IR) y generación aumentada por recuperación (RAG) en ese idioma.

Con 567,7 millones de parámetros, el modelo hereda la capacidad multilingüe del modelo base, pero el ajuste lo especializa en el dominio legal vietnamita. Según la evaluación reportada por el autor, alcanza un MRR de 0,9667 en un conjunto de prueba de 500 consultas, frente a 0,9072 del modelo original, lo que supone una mejora significativa. Es un modelo ligero en comparación con los LLM generativos, lo que lo hace adecuado para despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (modelo base BAAI/bge-reranker-v2-m3) |
| Parametros totales | 567.755.777 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 8192 tokens, pero no se especifica para este finetune) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | Vietnamita (vi) (el modelo base es multilingüe, pero el finetune está especializado en vietnamita) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder, es decir, una arquitectura encoder-only que procesa simultáneamente el par (consulta, documento) y produce una puntuación de relevancia. Se basa en XLM-RoBERTa, un transformer multilingüe preentrenado, y el modelo base `bge-reranker-v2-m3` de BAAI ya incorpora mejoras en la representación de consultas y documentos para reranking. El finetune se realizó sobre el dataset `juzharii/text-mining-ce-dataset-v2`, que contiene pares de consultas y fragmentos de textos legales vietnamitas, con el objetivo de adaptar el modelo al vocabulario y las estructuras propias del dominio jurídico. No se detallan los hiperparámetros de entrenamiento ni el número de épocas, pero el resultado reportado indica una mejora notable en MRR sobre el conjunto de prueba.

## Capacidades

- Reranking de pares (consulta, documento) para recuperación de información, devolviendo una puntuación de relevancia normalizada.
- Especialización en textos legales vietnamitas, incluyendo terminología jurídica y estructuras de redacción propias del ámbito legal.
- Capacidad multilingüe heredada del modelo base, aunque el ajuste reduce su rendimiento en otros idiomas.
- Integración sencilla con la librería FlagEmbedding, que permite cargar el modelo y calcular puntuaciones con precisión FP16.
- No soporta generación de texto, tool calling ni razonamiento multi-paso; es exclusivamente un modelo de scoring.

## Casos de uso

- Búsqueda semántica en bases de datos legales: el modelo puede reordenar los resultados de un buscador de jurisprudencia o normativa vietnamita, priorizando los documentos más relevantes para una consulta concreta.
- Sistemas RAG para asistentes legales: en un pipeline de generación aumentada por recuperación, el reranker filtra los fragmentos recuperados por un retriever y selecciona los más pertinentes antes de pasarlos al generador, mejorando la calidad de las respuestas.
- Análisis de contratos y documentos normativos: permite comparar cláusulas o artículos con consultas específicas para identificar coincidencias o discrepancias.
- Clasificación de sentencias o resoluciones: dado un conjunto de documentos, el modelo puede ordenarlos según su relevancia respecto a un tema o cuestión legal planteada.
- Soporte a abogados y profesionales del derecho: integrado en herramientas de investigación jurídica, ayuda a localizar rápidamente precedentes o normativa aplicable.
- Moderación de contenido legal en plataformas: puede priorizar documentos que requieren revisión humana según su relevancia para consultas de cumplimiento normativo.

## Benchmarks y rendimiento

El autor reporta la siguiente evaluación en un conjunto de prueba de 500 consultas (métrica MRR):

| Modelo | MRR |
|---|---|
| BAAI/bge-reranker-v2-m3 (original) | 0,9072 |
| bge-reranker-v2-m3-luatvn (finetune) | 0,9667 |

No se proporcionan otros benchmarks (MMLU, HumanEval, etc.) porque el modelo no es generativo. La mejora de 0,0595 puntos en MRR indica una ganancia sustancial en la tarea de reranking legal vietnamita.

## Requisitos de hardware

- No se especifican requisitos oficiales. Dado el tamaño de 567,7 millones de parámetros, se estima que la inferencia en FP16 requiere aproximadamente 1,2 GB de VRAM solo para los pesos, más memoria para activaciones y el par de entrada.
- Puede ejecutarse en GPUs consumer como NVIDIA RTX 3060 (12 GB) o superiores, así como en GPUs de datacenter (A100, H100) si se procesan lotes grandes.
- Para despliegue, se recomienda usar la librería FlagEmbedding (como en el ejemplo del autor) o frameworks como vLLM o TGI si se integra en un pipeline de producción, aunque al ser un cross-encoder, la inferencia es por pares y no se beneficia de la generación en lote.
- La latencia por par es baja (del orden de milisegundos en GPU moderna), pero no se dispone de cifras exactas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MRR (legal vietnamita) | Licencia |
|---|---|---|---|---|
| BAAI/bge-reranker-v2-m3 (base) | 568M | 8192 | 0,9072 | MIT (según BAAI) |
| Nalyd1908/bge-reranker-v2-m3-luatvn | 568M | No disponible | 0,9667 | No disponible |
| BAAI/bge-reranker-v2-minicpm-layerwise | 2,7B | 8192 | No disponible | MIT |

No se dispone de datos de otros rerankers específicos para vietnamita legal. El modelo base es la alternativa más directa; el finetune mejora claramente el rendimiento en este dominio.

## Limitaciones y advertencias

- El modelo está especializado en textos legales vietnamitas; su rendimiento en otros idiomas o dominios puede degradarse significativamente.
- No se han publicado detalles sobre el dataset de entrenamiento (tamaño, composición, posibles sesgos), por lo que no se puede evaluar la representatividad de los datos legales.
- Al ser un cross-encoder, no es adecuado para tareas de generación o razonamiento; solo produce puntuaciones de relevancia.
- La licencia no está especificada, lo que puede limitar su uso comercial sin autorización explícita del autor.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que no ha sido validado por la comunidad; se recomienda probarlo en casos reales antes de adoptarlo en producción.
- No se proporcionan instrucciones de cuantización ni versiones GGUF, lo que dificulta su despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nalyd1908/bge-reranker-v2-m3-luatvn
- Perfil del autor: https://huggingface.co/Nalyd1908
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Documentación de BGE-Reranker-v2: https://bge-model.com/bge/bge_reranker_v2.html
- Tutorial de reranking con BGE: https://bge-model.com/tutorial/5_Reranking/5.2.html

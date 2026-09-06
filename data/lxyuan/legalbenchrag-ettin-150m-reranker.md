# lxyuan/LegalBenchRAG-Ettin-150M-Reranker

## Resumen

El modelo `lxyuan/LegalBenchRAG-Ettin-150M-Reranker` es un cross-encoder de reordenación (reranking) entrenado por lxyuan sobre el conjunto de datos LegalBench-RAG, un benchmark específico para recuperación aumentada por generación (RAG) en el dominio legal. Parte del modelo base `cross-encoder/ettin-reranker-150m-v1`, que a su vez está basado en la arquitectura ModernBERT, y se ha sometido a un fine-tuning completo con el lanzamiento íntegro de LegalBench-RAG, compuesto por 6.889 preguntas, 714 documentos y 10.928 evidencias anotadas por expertos en inglés.

La función del modelo es puntuar la relevancia de pasajes de evidencia extraídos de contratos y políticas de privacidad. Se posiciona como la segunda etapa de un pipeline retrieve-and-rerank: primero se recuperan candidatos con BM25 o embeddings, y después este modelo los reordena. No es un generador de texto ni un modelo de respuesta a preguntas; su salida es una sola puntuación numérica de relevancia.

El modelo tiene aproximadamente 149 millones de parámetros, una ventana de contexto de 512 tokens para el par consulta+pasaje, y se distribuye bajo licencia Apache-2.0. Su relevancia radica en mejorar sustancialmente la calidad de recuperación en sistemas RAG aplicados a documentos legales en inglés, superando las evaluaciones pre-registradas de utilidad exigidas en la publicación de LegalBench-RAG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder Transformer (ModernBERT) |
| Parametros totales | 149.014.272 (según safetensors; el README del autor indica 149.606.401) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (par consulta+pasaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder independiente, no un adaptador. Consulta y pasaje se atienden conjuntamente en una única pasada y el modelo emite una puntuación de relevancia. Se parte de la revisión `025501c4e0f9bbeb4c5b198318e0089ff061cc14` del modelo base `cross-encoder/ettin-reranker-150m-v1`.

El entrenamiento utiliza `BinaryCrossEntropyLoss` (BCE con logits) sobre pares etiquetados: los positivos hacia 1 y los negativos duros hacia 0. Cada par etiquetado contribuye al cómputo. Los documentos se dividen en pasajes solapados de 384 tokens con una superposición de 96 tokens; cada evidencia selecciona su pasaje de mayor solapamiento como positivo y BM25 aporta hasta cuatro pasajes negativos duros de alta clasificación del mismo documento. La evaluación reordena los 32 mejores candidatos orgánicos de BM25.

El entrenamiento se configuró con 3 épocas, pero la selección de mejor checkpoint recayó en la época 2 (`checkpoint-1856`) porque la época 3 mostró un ligero aumento de la pérdida y una reducción del NDCG@10. Se restauraron los pesos de la época 2 con `load_best_model_at_end=True`. Se empleó FP16, un optimizador AdamW con programación lineal, learning rate de 2e-05 y un warmup del 10%. El hardware fue una GPU Tesla T4 y el tiempo de ejecución del tramo final fue de 26,3 minutos. El valor de semilla fue 42.

## Capacidades

- Reordenación de pasajes de evidencia en documentos legales en inglés, especialmente contratos y políticas de privacidad.
- Emite puntuaciones de relevancia comparables entre candidatos para una misma consulta; no son probabilidades calibradas.
- Soporta el flujo completo de retrieve-and-rerank: los usuarios recuperan entre 30 y 100 candidatos y el modelo los ordena.
- Funciona con nombres de archivo y fragmentos de texto que contienen información contractual (terminación, derecho aplicable, confidencialidad, etc.).
- No genera texto, no responde preguntas legales, no ejecuta acciones ni proporciona asesoramiento jurídico.
- No ofrece generación de código, soporte de tool calling, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Recuperación de evidencias en litigios: en un sistema de apoyo a abogados, se pueden indexar miles de contratos, recuperar 50 pasajes candidatos mediante BM25 y dejar que el modelo reordene los más relevantes para que el abogado revise rápidamente la evidencia pertinente.
- Sistemas RAG de preguntas y respuestas sobre contratos: tras la recuperación inicial, este reranker selecciona los pasajes que serán enviados a un generador fundamentado, reduciendo la probabilidad de incorporar fragmentos irrelevantes al contexto del LLM.
- Análisis de políticas de privacidad: el modelo puede reordenar pasajes de políticas de privacidad en inglés para responder preguntas sobre plazos de conservación, derechos del usuario o condiciones de tratamiento de datos.
- Due diligence automatizada: en operaciones de fusiones y adquisiciones, el modelo ayuda a filtrar cláusulas relevantes (cambio de control, no competencia, indemnización) de miles de páginas de documentos, mejorando la precisión de la recuperación.
- Auditoría de cumplimiento: se puede usar para localizar la evidencia textual que respalda una obligación legal concreta en una biblioteca de acuerdos vigentes, acelerando la revisión manual de cumplimiento normativo.
- Enriquecimiento de motores de búsqueda jurídica: en una plataforma de búsqueda documental, este reranker puede actuar como segunda fase para mejorar la ordenación de resultados, aumentando el NDCG y el recall sobre fragmentos anotados por expertos.

## Benchmarks y rendimiento

Los resultados se obtuvieron sobre los documentos reservados del conjunto de pruebas y con las listas de candidatos orgánicas de BM25. El sistema superó la puerta pre-registrada de utilidad, que exigía al menos +0,02 NDCG@10 sobre el modelo base sin alteraciones y ninguna regresión por dominio peor que -0,02.

| Sistema | NDCG@10 | MRR@10 | Hit@5 | Char recall@5 |
|---|---:|---:|---:|---:|
| BM25 candidate order | 0,3057 | 0,2582 | 0,4563 | 0,3965 |
| Ettin sin alterar | 0,3853 | 0,3577 | 0,5930 | 0,5035 |
| Modelo fine-tuned | 0,7424 | 0,8191 | 0,8676 | No disponible (valor truncado en la fuente) |

Durante la validación se observó que la época 2 logró la mejor puntuación: pérdida BCE de 0,0722 y NDCG@10 de 0,7861.

No se han publicado resultados de benchmarks como MMLU, HumanEval o GSM8K, ya que el modelo no es un modelo de lenguaje generativo.

## Requisitos de hardware

- VRAM estimada: no se dispone de mediciones oficiales. Como se trata de un modelo de aproximadamente 150 millones de parámetros en FP16, se puede estimar que la inferencia requiere menos de 2 GB de VRAM.
- GPU recomendadas: el entrenamiento se realizó en una Tesla T4, por lo que cualquier GPU de consumer con al menos 4 GB de VRAM, como una RTX 3060 o superior, es suficiente para inferencia.
- El modelo tiene cabida en GPU de consumo de gama media e incluso en entornos CPU, aunque con mayor latencia.
- Opciones de despliegue: se puede utilizar directamente con la librería `sentence-transformers` mediante la clase `CrossEncoder`. También es compatible con `text-embeddings-inference` y con Hugging Face Inference Endpoints, según indica la etiqueta `endpoints_compatible` en el repositorio.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NDCG@10 en LegalBench-RAG | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| BM25 candidate order | No aplica | No aplica | 0,3057 | No aplica | Implementaciones libres |
| `cross-encoder/ettin-reranker-150m-v1` (base) | ~150M | 512 tokens | 0,3853 | Apache-2.0 | Hugging Face |
| `lxyuan/LegalBenchRAG-Ettin-150M-Reranker` | ~150M | 512 tokens | 0,7424 | Apache-2.0 | Hugging Face |

No se dispone de datos comparables con otros cross-encoders de la misma categoría más allá del modelo base.

## Limitaciones y advertencias

- El modelo solo está entrenado para reordenar pasajes en inglés, por lo que no debe utilizarse con documentos en otros idiomas.
- La ventana de contexto está limitada a 512 tokens para el par consulta+pasaje; fragmentos más largos deben dividirse.
- Las puntuaciones de salida no están calibradas como probabilidades; solo comparan la relevancia entre candidatos para una consulta concreta.
- El modelo no busca en un corpus, no responde preguntas legales, no ejecuta acciones ni proporciona asesoramiento jurídico. Su uso debe quedar limitado a tareas de reranking.
- Existe riesgo de sesgo de dominio, ya que el entrenamiento se realizó exclusivamente sobre documentos legales en inglés y sus anotaciones de expertos; los resultados fuera de este dominio pueden degradarse.
- El modelo no incorpora mecanismos de alucinación porque no genera texto, pero si se usa como filtro previo a un generador, los errores de ordenación pueden transmitir fragmentos incorrectos al LLM.
- La licencia Apache-2.0 permite uso comercial sin restricciones, siempre que se respeten los términos de la licencia.

## Enlaces

- Repositorio en Hugging Face: [lxyuan/LegalBenchRAG-Ettin-150M-Reranker](https://huggingface.co/lxyuan/LegalBenchRAG-Ettin-150M-Reranker)
- Modelo base: [cross-encoder/ettin-reranker-150m-v1](https://huggingface.co/cross-encoder/ettin-reranker-150m-v1)
- Paper de LegalBench-RAG: [arXiv:2408.10343](https://arxiv.org/abs/2408.10343)
- Repositorio del benchmark LegalBench-RAG: [ZeroEntropy-AI/legalbenchrag](https://github.com/ZeroEntropy-AI/legalbenchrag)

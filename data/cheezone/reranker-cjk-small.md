# CheezOne/reranker-cjk-small

## Resumen

`CheezOne/reranker-cjk-small` es un cross-encoder de reordenación (reranking) de 140,6 millones de parámetros, destilado del modelo docente `BAAI/bge-reranker-v2-m3` (568M) sobre la arquitectura `jhu-clsp/mmBERT-small` (ModernBERT). Lo desarrolla el usuario CheezOne y está pensado como segunda etapa de pipelines de RAG y búsqueda: recibe una consulta y un conjunto de pasajes candidatos y devuelve puntuaciones de relevancia. Su interés radica en que cubre un hueco poco atendido: rerankers ligeros con calidad competitiva en chino, japonés y coreano, idiomas donde los modelos pequeños suelen degradarse.

El modelo alcanza un nDCG@10 medio de 0,666 en el conjunto de reordenación de MIRACL (zh/ja/ko/th/id/en), solo 2,2 puntos por debajo de su docente de 568M pero con una velocidad 3,7 veces mayor (2.776 pares/s frente a 758 en una L40 con bf16). Supera a todos los rerankers pequeños comparados en las seis lenguas evaluadas. Con 8k tokens de contexto arquitectónico y exportaciones ONNX fp32 e int8, puede ejecutarse en CPU y en el navegador mediante transformers.js.

La licencia Apache-2.0 y la disponibilidad de pesos en safetensors y ONNX lo hacen apto para uso comercial sin fricciones, siempre que se asuma que es un reordenador y no un recuperador. Su principal sesgo de diseño es el desequilibrio del corpus de entrenamiento, dominado por chino (77 % de los grupos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre ModernBERT (`jhu-clsp/mmBERT-small`) |
| Parametros totales | 140.641.921 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens (ModernBERT); entrenado a 384 tokens por par consulta+pasaje |
| Tipos de cuantizacion | ONNX int8 (embeddings y atención); MLP y cabeza en fp32; bf16 en safetensors |
| Idiomas soportados | zh, ja, ko, th, id, en (multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), ONNX fp32, ONNX int8 |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT, una variante de transformer con atención de contexto largo que sustituye la activación GeLU por GeGLU en el MLP. Se inicializa desde `jhu-clsp/mmBERT-small` y se destila desde `BAAI/bge-reranker-v2-m3`, que puntuó 551.213 pares consulta-pasaje en 27 minutos sobre una única GPU L40. El conjunto de entrenamiento, `CheezOne/reranker-train-chinese-japanese-korean`, contiene 51.858 grupos de consulta: 40.000 grupos en chino procedentes de T2Ranking y el resto en ja/ko/th/en desde Mr. TyDi, todo con licencia Apache-2.0.

La pérdida combina una KL listwise entre las distribuciones de puntuaciones del estudiante y del docente dentro de cada grupo, más un término MSE de peso 0,05 sobre las puntuaciones brutas. El entrenamiento usó 2 épocas, 16 grupos por paso, learning rate 5e-5, longitud máxima de 384 tokens y bf16, completando 6.484 pasos en 55 minutos en una L40. La exportación int8 cuantiza únicamente embeddings y atención porque las activaciones GeGLU del MLP de ModernBERT presentan valores atípicos que degradarían la precisión.

## Capacidades

- Reordenación de pasajes para RAG y búsqueda: devuelve logits de relevancia por par consulta-pasaje (aplicar sigmoid para obtener valores en 0-1).
- Multilingüe en chino, japonés, coreano, tailandés, indonesio e inglés, con transferencia zero-shot documentada en indonesio (no presente en entrenamiento).
- Ejecución en CPU y en navegador gracias a las exportaciones ONNX fp32 e int8 y al soporte de transformers.js.
- Integración con sentence-transformers mediante `CrossEncoder` y con `transformers` mediante `AutoModelForSequenceClassification`.
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un clasificador de ranking.

## Casos de uso

- Segunda etapa de RAG en producción: tras recuperar candidatos con BM25 o un modelo de embeddings, el reranker reordena los 20-50 pasajes más relevantes antes de pasarlos al LLM generador; su throughput de 2.776 pares/s en L40 permite hacerlo en línea.
- Búsqueda empresarial multilingüe en Asia-Pacífico: útil en corpus que mezclan documentos en chino, japonés, coreano y tailandés, donde un reranker monolingüe fallaría.
- Reordenación en el navegador o en el edge: con ONNX int8 (230 MB) y transformers.js puede ejecutarse del lado del cliente para aplicaciones de búsqueda sin backend dedicado.
- Atención al cliente automatizada: reordena artículos de base de conocimiento antes de que un LLM componga la respuesta, reduciendo alucinaciones al priorizar pasajes verificados.
- Sistemas de preguntas y respuestas sobre documentación técnica: el contexto de 8k tokens permite reordenar pasajes largos sin truncar agresivamente.
- Filtrado de resultados en motores de búsqueda internos: como capa de reordenación sobre Elasticsearch u OpenSearch para mejorar el nDCG de las primeras posiciones.
- Evaluación y experimentación académica: al ser reproducible (scripts `rr_prep.py`, `rr_gpu.py`, `rr_export_onnx.py`) y ligero, sirve como baseline para investigación en destilación de rerankers.

## Benchmarks y rendimiento

nDCG@10 en reordenación de MIRACL (dev), medido con el mismo código y GPU para todos los modelos:

| Modelo | zh | ja | ko | th | id | en | avg | pares/s (L40, bf16) |
|---|---|---|---|---|---|---|---|---|
| Este modelo (~140M) | 0,525 | 0,716 | 0,727 | 0,788 | 0,608 | 0,629 | 0,666 | 2.776 |
| BAAI/bge-reranker-v2-m3 (568M, docente) | 0,546 | 0,738 | 0,722 | 0,813 | 0,658 | 0,649 | 0,688 | 758 |
| hotchpotch/japanese-reranker-cross-encoder-small-v1 (118M) | 0,510 | 0,678 | 0,696 | 0,785 | 0,580 | 0,609 | 0,643 | 5.430 |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 (118M) | 0,498 | 0,640 | 0,679 | 0,768 | 0,552 | 0,580 | 0,620 | 5.314 |
| BAAI/bge-reranker-base (278M) | 0,460 | 0,561 | 0,586 | 0,686 | 0,508 | 0,552 | 0,559 | 2.395 |

Comprobación de las exportaciones ONNX sobre las 10 primeras consultas MIRACL por idioma (CPU):

| Runtime | Tamano | nDCG@10 zh | nDCG@10 ja | nDCG@10 ko |
|---|---|---|---|---|
| PyTorch fp32 | 563 MB (bf16 safetensors: 281 MB) | 0,647 | 0,729 | 0,721 |
| ONNX fp32 | 563 MB | 0,647 | 0,729 | 0,721 |
| ONNX int8 | 230 MB | 0,650 | 0,729 | 0,721 |

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 1,1 GB en fp32, unos 0,6 GB en bf16 y unos 0,3 GB en ONNX int8 (sin contar activaciones ni lote).
- GPU recomendadas: L40, A100 o H100 para máximo throughput; RTX 4090 y RTX 3090 sobradas para uso en línea.
- Cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1650 de 4 GB, y en CPU.
- Opciones de despliegue: sentence-transformers, transformers, transformers.js (navegador/Node), ONNX Runtime, text-embeddings-inference (TGI) y endpoints de Hugging Face.
- Throughput medido: 2.776 pares/s en L40 con bf16, lote 128 y longitud máxima 512; el docente rinde 758 pares/s en las mismas condiciones. En CPU con ONNX int8 el rendimiento no está publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | nDCG@10 medio (MIRACL 6 idiomas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CheezOne/reranker-cjk-small | 140M | 8k (entrenado a 384) | 0,666 | Apache-2.0 | HF, ONNX, transformers.js |
| BAAI/bge-reranker-v2-m3 | 568M | 8k | 0,688 | Apache-2.0 | HF |
| hotchpotch/japanese-reranker-cross-encoder-small-v1 | 118M | no disponible | 0,643 | no disponible | HF |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 | 118M | 512 | 0,620 | no disponible | HF |
| BAAI/bge-reranker-base | 278M | 512 | 0,559 | Apache-2.0 | HF |

## Limitaciones y advertencias

- Desequilibrio de entrenamiento: el 77 % de los grupos son chinos; ja/ko/th/en solo vieron entre 1.300 y 3.700 grupos cada uno, lo que puede reducir la robustez en dominios específicos de esos idiomas.
- No se evaluaron dominios especializados como legal, médico o código.
- Es un reranker, no un retriever: debe usarse sobre los resultados de BM25 o de un modelo de embeddings, nunca como recuperador de primera etapa.
- No se realizó ninguna evaluación de sesgos ni de seguridad.
- Riesgo de alucinación no aplica directamente (no genera texto), pero sus puntuaciones pueden ser poco calibradas fuera de la distribución de entrenamiento.
- Solapamiento de datos: MIRACL y Mr. TyDi comparten Wikipedia, por lo que los pasajes de evaluación pueden coincidir parcialmente con los de entrenamiento, aunque las consultas de MIRACL se eliminaron del corpus de entrenamiento.
- El rendimiento en indonesio es transferencia zero-shot y no debe extrapolarse a otros idiomas no vistos.
- La cuantización int8 solo afecta a embeddings y atención; no se publican métricas de latencia en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CheezOne/reranker-cjk-small
- Dataset de entrenamiento: https://huggingface.co/datasets/CheezOne/reranker-train-chinese-japanese-korean
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo docente: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Benchmark MIRACL (vía MTEB): https://huggingface.co/datasets/mteb/MIRACLReranking
- Referencia comparativa: https://huggingface.co/hotchpotch/japanese-reranker-cross-encoder-small-v1
- Referencia comparativa: https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
- Referencia comparativa: https://huggingface.co/BAAI/bge-reranker-base

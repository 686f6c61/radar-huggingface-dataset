# CheezOne/reranker-chinese-japanese-korean-multilingual-small

## Resumen

El reranker chino-japonés-coreano multilingüe small de CheezOne es un cross-encoder de 140,6 millones de parámetros diseñado para la segunda etapa de pipelines de recuperación aumentada por generación (RAG) y búsqueda semántica. Lo desarrolla el usuario independiente CheezOne y se obtiene por destilación del maestro `BAAI/bge-reranker-v2-m3` (568M) sobre el backbone `jhu-clsp/mmBERT-small`, un transformer de la familia ModernBERT. Su función es puntuar pares consulta-pasaje y devolver un score de relevancia, no generar texto ni actuar como retriever.

El modelo aborda un problema concreto: los rerankers pequeños suelen degradarse notablemente en chino, japonés y coreano, idiomas con tokenización y morfología complejas. Este modelo logra 0,666 de nDCG@10 medio en MIRACL (zh/ja/ko/th/id/en), solo 2,2 puntos por debajo de su maestro de 568M, pero con una velocidad 3,7 veces superior (2.776 pares/s frente a 758 pares/s en una L40 con bf16).

Es relevante ahora porque combina un tamaño contenido (apto para CPU y navegador vía ONNX int8 de 230 MB), contexto de hasta 8k tokens heredado de ModernBERT y licencia Apache-2.0, lo que facilita su integración en sistemas RAG de producción con presupuesto de latencia ajustado y despliegue multilingüe en Asia Oriental y Sudeste Asiático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (jhu-clsp/mmBERT-small), clasificación de secuencias |
| Parametros totales | 140.641.921 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 8.192 tokens (ModernBERT); entrenado con 384 tokens por par consulta+pasaje |
| Tipos de cuantizacion | ONNX fp32, ONNX int8 (embeddings y atención cuantizados; MLP y cabeza en fp32); safetensors bf16 |
| Idiomas soportados | zh, ja, ko, th, id, en, multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder de clasificación de secuencias construido sobre `jhu-clsp/mmBERT-small`, un ModernBERT pequeño. ModernBERT incorpora atención con RoPE, alternancia de capas de atención global y local, y activaciones GeGLU en el MLP, lo que permite extender el contexto hasta 8k tokens. La cabeza de clasificación produce un logit único por par consulta-pasaje; a mayor logit, mayor relevancia. El repositorio ocupa 1,1 GB e incluye pesos en safetensors bf16 (281 MB) y exportaciones ONNX fp32 (563 MB) e int8 (230 MB).

El entrenamiento es una destilación del reranker `BAAI/bge-reranker-v2-m3`, que puntuó 551.213 pares consulta-pasaje en 27 minutos sobre una GPU L40. El conjunto de datos, `CheezOne/reranker-train-chinese-japanese-korean`, contiene 51.858 grupos de consultas: 40.000 grupos en chino procedentes de T2Ranking y el resto en ja/ko/th/en desde Mr. TyDi, todo con licencia Apache-2.0. La pérdida combina KL listwise entre las distribuciones de scores del estudiante y el maestro dentro de cada grupo, más 0,05 × MSE sobre los scores en bruto. Se entrenó durante 2 épocas, con 16 grupos por paso, learning rate 5e-5, longitud máxima 384 y bf16, completando 6.484 pasos en 55 minutos en una L40. El pipeline de reproducción está disponible en los scripts `rr_prep.py`, `rr_gpu.py` y `rr_export_onnx.py`.

## Capacidades

- Puntuación de relevancia consulta-pasaje mediante cross-encoder, devolviendo logits en bruto (aplicar sigmoid para obtener valores 0-1).
- Reranking en pipelines RAG y búsqueda: actúa como segunda etapa sobre candidatos de BM25 o de un modelo de embeddings.
- Soporte multilingüe para chino, japonés, coreano, tailandés, indonesio e inglés, con transferencia zero-shot documentada en indonesio.
- Contexto de hasta 8k tokens a nivel de arquitectura, aunque el entrenamiento se realizó con 384 tokens por par.
- Inferencia en CPU y en navegador mediante ONNX int8 y transformers.js.
- Integración con sentence-transformers (`CrossEncoder`), transformers (`AutoModelForSequenceClassification`) y text-embeddings-inference.
- No es un modelo generativo: no produce texto, no hace tool calling ni razonamiento multi-paso por sí mismo; su rol es puntuar.

## Casos de uso

- RAG sobre documentación en chino, japonés y coreano: se recuperan candidatos con BM25 o un embedding multilingüe y se reordenan con este cross-encoder; su nDCG@10 de 0,525 en zh, 0,716 en ja y 0,727 en ko lo hace adecuado para corpus de Asia Oriental con latencia contenida.
- Búsqueda empresarial multilingüe en el navegador: la exportación ONNX int8 de 230 MB permite ejecutar el reranking en cliente con transformers.js, útil para aplicaciones web que no pueden enviar consultas a un servidor.
- Atención al cliente automatizada con base de conocimiento: el modelo reordena fragmentos de FAQ o manuales antes de pasarlos a un LLM generador, reduciendo el contexto irrelevante y el coste de tokens.
- Búsqueda en catálogos de comercio electrónico en japonés y coreano: reordena descripciones de producto frente a consultas de usuario; el soporte de 8k tokens permite manejar fichas de producto largas.
- Servicio de reranking en CPU para entornos sin GPU: con ONNX int8 y 230 MB, el modelo puede desplegarse en contenedores sin acelerador, manteniendo nDCG@10 de 0,650 en zh, 0,729 en ja y 0,721 en ko según la comprobación del autor.
- Filtrado de contexto en asistentes de código o documentación técnica: aunque el autor advierte que no se evaluó texto de dominio específico, el modelo puede reordenar fragmentos de documentación antes de la generación.
- Transferencia a indonesio y tailandés sin entrenamiento específico: la columna id (0,608) es zero-shot, lo que permite cubrir mercados del Sudeste Asiático con un único modelo.

## Benchmarks y rendimiento

Resultados de nDCG@10 en MIRACL reranking (dev), con listas de candidatos de `mteb/MIRACLReranking`. Consultas por idioma: zh 391, ja 797, ko 212, th 200, id 200, en 200. Throughput medido con batch 128 y longitud máxima 512 en una L40 con bf16.

| Modelo | zh | ja | ko | th | id | en | avg | pares/s |
|---|---|---|---|---|---|---|---|---|
| Este modelo (mmBERT-small, ~140M) | 0,525 | 0,716 | 0,727 | 0,788 | 0,608 | 0,629 | 0,666 | 2.776 |
| BAAI/bge-reranker-v2-m3 (568M, maestro) | 0,546 | 0,738 | 0,722 | 0,813 | 0,658 | 0,649 | 0,688 | 758 |
| hotchpotch/japanese-reranker-cross-encoder-small-v1 (118M) | 0,510 | 0,678 | 0,696 | 0,785 | 0,580 | 0,609 | 0,643 | 5.430 |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 (118M) | 0,498 | 0,640 | 0,679 | 0,768 | 0,552 | 0,580 | 0,620 | 5.314 |
| BAAI/bge-reranker-base (278M) | 0,460 | 0,561 | 0,586 | 0,686 | 0,508 | 0,552 | 0,559 | 2.395 |

Comprobación ONNX (primeras 10 consultas MIRACL por idioma, CPU):

| Runtime | Tamaño | nDCG@10 zh | nDCG@10 ja | nDCG@10 ko |
|---|---|---|---|---|
| PyTorch fp32 | 563 MB (bf16 safetensors: 281 MB) | 0,647 | 0,729 | 0,721 |
| ONNX fp32 | 563 MB | 0,647 | 0,729 | 0,721 |
| ONNX int8 | 230 MB | 0,650 | 0,729 | 0,721 |

Notas del autor: indonesio no estuvo en el entrenamiento (columna zero-shot); las consultas MIRACL se eliminaron del entrenamiento pero MIRACL y Mr. TyDi comparten Wikipedia, por lo que puede haber solapamiento de pasajes; el modelo de hotchpotch está centrado en japonés y el maestro es mucho mayor, por lo que se incluyen como referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 safetensors ocupan 281 MB y los fp32 563 MB; con activaciones y batch pequeño, la inferencia en GPU requiere aproximadamente 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte bf16, como L40, A100, H100, RTX 4090 o RTX 3090. El autor midió throughput en una L40.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-4 GB de VRAM, incluidas RTX 3060, RTX 4060 o superiores.
- Despliegue en CPU: viable con ONNX int8 (230 MB), con pérdida de rendimiento mínima según la comprobación del autor.
- Navegador: soportado vía transformers.js con dtype q8.
- Opciones de despliegue: sentence-transformers, transformers, ONNX Runtime, transformers.js, text-embeddings-inference (tag `text-embeddings-inference` y `endpoints_compatible`).
- Throughput: 2.776 pares/s en L40 con bf16, batch 128 y longitud máxima 512; el maestro alcanza 758 pares/s en las mismas condiciones.
- Latencia: no se han publicado mediciones de latencia individual en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nDCG@10 medio (MIRACL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 140M | 8k (entrenado a 384) | 0,666 | Apache-2.0 | Hugging Face, ONNX, transformers.js |
| BAAI/bge-reranker-v2-m3 | 568M | 8k | 0,688 | Apache-2.0 (según model card del maestro; no confirmado en la información proporcionada) | Hugging Face |
| hotchpotch/japanese-reranker-cross-encoder-small-v1 | 118M | no disponible | 0,643 | no disponible | Hugging Face |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 | 118M | 512 | 0,620 | no disponible | Hugging Face |
| BAAI/bge-reranker-base | 278M | 512 | 0,559 | no disponible | Hugging Face |

El modelo se sitúa entre el maestro de 568M y los rerankers pequeños de 118M: pierde 2,2 puntos de nDCG@10 medio frente al maestro, pero supera a los tres modelos pequeños comparados en los seis idiomas y ofrece mayor throughput que el maestro y que bge-reranker-base.

## Limitaciones y advertencias

- El 77% de los grupos de entrenamiento son chinos; ja/ko/th/en solo vieron entre 1.300 y 3.700 grupos cada uno, lo que puede limitar el rendimiento en dominios específicos de esos idiomas.
- No se evaluó texto de dominios especializados como legal, médico o código.
- Es un reranker, no un retriever: debe usarse sobre candidatos de BM25 o de un modelo de embeddings.
- No se realizó evaluación de seguridad ni de sesgos.
- Riesgo de alucinación no aplica directamente al no ser generativo, pero los scores de relevancia pueden ser poco fiables en pares fuera de distribución.
- El contexto de entrenamiento es de 384 tokens por par; usar entradas mucho más largas puede degradar la calidad aunque la arquitectura soporte 8k.
- Posible solapamiento de pasajes entre MIRACL y Mr. TyDi por compartir Wikipedia, lo que puede inflar ligeramente las métricas reportadas.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni evaluación de producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CheezOne/reranker-chinese-japanese-korean-multilingual-small
- Dataset de entrenamiento: https://huggingface.co/datasets/CheezOne/reranker-train-chinese-japanese-korean
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Maestro de destilación: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Benchmark MIRACL reranking: https://huggingface.co/datasets/mteb/MIRACLReranking
- Modelo de referencia japonés: https://huggingface.co/hotchpotch/japanese-reranker-cross-encoder-small-v1
- Modelo de referencia mMiniLMv2: https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
- Modelo de referencia bge-reranker-base: https://huggingface.co/BAAI/bge-reranker-base

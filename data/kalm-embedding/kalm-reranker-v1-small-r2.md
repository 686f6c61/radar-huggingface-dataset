# KaLM-Embedding/KaLM-Reranker-V1-Small-R2

## Resumen

KaLM-Reranker-V1-Small-R2 es un modelo de reranking multilingue desarrollado por el equipo KaLM-Embedding, concebido para la segunda etapa de pipelines de recuperacion de informacion (retrieval-augmented generation, busqueda semantica y motores documentales). Se construye sobre el checkpoint google/t5gemma-2-1b-1b, un transformer encoder-decoder de aproximadamente 2.116 millones de parametros totales, y hereda la arquitectura "fast but not late interaction" (FBNL) introducida en la primera version de la familia KaLM-Reranker-V1.

La innovacion central es el uso de pooling Matryoshka (Matryoshka embedding pooling, MEP) sobre las representaciones documentales, lo que permite comprimir los documentos de entrada entre 1x y 128x y ajustar el coste computacional en tiempo de inferencia sin reentrenar. Frente a la version original V1, el checkpoint R2 amplia el rango de compresion validado (de 32x a 128x), mejora el ranking multilingue en MIRACL en +7,17 puntos de nDCG@10 medio para el tamano Small y refuerza la robustez multidominio en BEIR (+1,06 puntos).

Es relevante ahora porque ofrece un mecanismo practico para escalar el reranking en produccion: un mismo checkpoint puede usarse para filtrar candidatos a bajo coste y luego refinar solo los mas prometedores (cascada coarse-to-fine). Su licencia Apache 2.0 y su integracion con sentence-transformers lo hacen directamente desplegable en arquitecturas RAG existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5Gemma 2), reranker FBNL con pooling Matryoshka (MEP) |
| Parametros totales | 2.115.977.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingue (18 idiomas evaluados en MIRACL) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/t5gemma-2-1b-1b, un encoder-decoder derivado de la familia Gemma 2 con 1B de parametros en cada torre, y lo adapta a la tarea de ranking mediante la arquitectura FBNL ("fast but not late interaction"). En lugar de calcular interacciones token a token entre consulta y documento (como en un cross-encoder clasico), comprime la representacion del documento con pooling Matryoshka y realiza la puntuacion sobre esa representacion comprimida, lo que reduce el coste de inferencia a costa de una perdida controlada de calidad. El ratio de compresion es configurable en tiempo de inferencia (1x, 2x, 4x, 8x, ... hasta 128x), con 4x como valor por defecto.

El entrenamiento de R2 sigue una receta de tres etapas: (1) supervised fine-tuning de alta calidad, (2) destilacion con etiquetas suaves (soft-label distillation) que produce dos checkpoints intermedios con configuraciones r64-a32 y r96-a48, y (3) model soup, que combina ambos checkpoints para generar el modelo final. Los datos de entrenamiento provienen de KaLM-reranker-training-data, KaLM-embedding-finetuning-data y Shitao/bge-m3-data. La model card no detalla el volumen total de tokens ni la composicion exacta del dataset.

## Capacidades

- Reranking de documentos para una consulta dada, devolviendo puntuaciones de relevancia (pipeline text-ranking).
- Compresion Matryoshka configurable de 1x a 128x, con al menos el 92% del nDCG@10 a 2x conservado incluso a 128x en BEIR y MIRACL.
- Escalado de computo en tiempo de inferencia: un unico checkpoint permite ajustar el equilibrio calidad/coste.
- Cascada coarse-to-fine: cribado barato de todos los candidatos con representaciones muy comprimidas y refinamiento de los mas prometedores.
- Ranking multilingue en los 18 idiomas de MIRACL.
- Ranking multidominio (BEIR) sobre dominios heterogeneos.
- Integracion nativa con sentence-transformers y con el ecosistema transformers.
- Orientado a pipelines de RAG y busqueda semantica de dos etapas (retriever + reranker).
- No se documentan capacidades de generacion libre, tool calling, agentes, vision ni audio: el modelo es un reranker especializado.

## Casos de uso

- Reranking en pipelines RAG: tras recuperar top-k candidatos con un bi-encoder, el modelo reordena los pasajes por relevancia antes de pasarlos al LLM generador, mejorando la precision del contexto inyectado.
- Busqueda documental empresarial multilingue: con soporte para los 18 idiomas de MIRACL, permite consultas en un idioma y documentos en otro dentro de un mismo corpus.
- Cribado de grandes volumenes de candidatos: usando compresion 64x o 128x se pueden puntuar decenas de miles de documentos por consulta con perdida acotada, y refinar despues solo el top-N con 2x o 4x.
- Sistemas de soporte al cliente con base de conocimiento: reordenar articulos y FAQs recuperados para que el agente o el LLM reciba los fragmentos mas relevantes.
- Busqueda juridica o academica: reranking multidominio sobre colecciones heterogeneas (BEIR) donde la precision del top-10 es critica.
- Evaluacion y monitorizacion de retrievers: usar el reranker como juez de relevancia para medir la calidad de un retriever en produccion mediante nDCG@10.
- Deduplicacion y agrupacion semantica: puntuar pares consulta-documento para filtrar resultados redundantes antes de la respuesta final.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todos usan ratio de compresion por defecto r=4.

| Modelo | BEIR (V1) | BEIR (R2) | Delta | MIRACL (V1) | MIRACL (R2) | Delta |
|---|---:|---:|---:|---:|---:|---:|
| Nano | 57,41 | 58,54 | +1,13 | 62,08 | 71,11 | +9,03 |
| Small | 60,01 | 61,07 | +1,06 | 66,89 | 74,06 | +7,17 |
| Large | 62,87 | 63,53 | +0,66 | 70,07 | 74,92 | +4,85 |

Robustez a compresion en BEIR (nDCG@10):

| Modelo | 2x | 4x | 8x | 16x | 32x | 64x | 128x |
|---|---:|---:|---:|---:|---:|---:|---:|
| KaLM-Reranker-V1-Nano | 57,69 | 57,41 | 56,46 | 55,19 | 52,88 | — | — |
| KaLM-Reranker-V1-Small-R2 | no disponible en el extracto | 61,07 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card indica que, a 128x, los tres tamanos conservan al menos el 92% de su nDCG@10 medio a 2x en BEIR y MIRACL, pero el extracto disponible no incluye la tabla completa por tamano.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 4,2 GB solo para pesos (2.116 M de parametros), mas activaciones y cache; en la practica, entre 6 y 10 GB segun longitud de secuencia y tamano de lote.
- En cuantizacion de 8 bits: en torno a 2,1 GB de pesos; en 4 bits, en torno a 1,1 GB (estimaciones teoricas, no publicadas por el autor).
- GPU profesionales recomendadas: A100, H100, L40S o A10G para despliegues de alto throughput; el modelo cabe holgadamente en cualquiera de ellas.
- GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 y GPUs con 8 GB o mas en fp16; en 4 bits podria ejecutarse en GPUs de 4-6 GB.
- Opciones de despliegue: sentence-transformers (nativo), transformers, vLLM y TGI para servir a escala; llama.cpp y Ollama no estan confirmados para esta arquitectura encoder-decoder.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste depende del ratio de compresion elegido (1x-128x), por lo que el ajuste debe medirse en el hardware objetivo.
- Existe una demo en Replicate (ver enlaces) para pruebas sin infraestructura propia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multilingue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KaLM-Reranker-V1-Small-R2 | 2,12 B | no disponible | Si (18 idiomas MIRACL) | Apache 2.0 | Hugging Face, Replicate |
| KaLM-Reranker-V1-Nano-R2 | no disponible en el extracto | no disponible | Si | Apache 2.0 | Hugging Face |
| KaLM-Reranker-V1-Large-R2 | no disponible en el extracto | no disponible | Si | Apache 2.0 | Hugging Face |
| KaLM-Reranker-V1-Small (version original) | misma base | no disponible | Limitado | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks frente a rerankers de otros autores (por ejemplo, bge-reranker o Cohere Rerank) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo especializado en ranking: no genera texto libre ni soporta tool calling, agentes o vision.
- La calidad depende del ratio de compresion elegido; a 128x se conserva al menos el 92% del nDCG@10 a 2x, pero la perdida existe y debe validarse en el dominio concreto.
- La longitud maxima de contexto no esta documentada en la informacion disponible; documentos muy largos pueden requerir truncado.
- Riesgo de sesgo heredado de los datos de entrenamiento (KaLM-reranker-training-data, KaLM-embedding-finetuning-data, Shitao/bge-m3-data) y del modelo base google/t5gemma-2-1b-1b; no se han publicado analisis de sesgo especificos.
- Riesgo de alucinacion de relevancia: el modelo puede puntuar alto documentos superficialmente similares pero factualmente irrelevantes; conviene combinarlo con filtros heuristicos.
- Aunque la cobertura multilingue se evalua en 18 idiomas de MIRACL, el rendimiento en idiomas fuera de ese conjunto no esta validado.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base google/t5gemma-2-1b-1b, que puede tener terminos adicionales.
- El checkpoint es un R2 reciente (creado en agosto de 2026) con pocas descargas (354) y likes (4); la validacion comunitaria es todavia limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaLM-Embedding/KaLM-Reranker-V1-Small-R2
- Paper (arXiv 2606.22807): https://arxiv.org/abs/2606.22807
- Paper adicional (arXiv 2506.20923): https://arxiv.org/abs/2506.20923
- Paper adicional (arXiv 2501.01028): https://arxiv.org/abs/2501.01028
- Coleccion KaLM-Reranker en Hugging Face: https://huggingface.co/collections/KaLM-Embedding/lychee-kalm-reranker-and-jev
- Organizacion en GitHub: https://github.com/KaLM-Embedding
- Demo en Replicate: https://replicate.com/itsukifujii/kalm-reranker-v1-small-r2
- Modelo base: https://huggingface.co/google/t5gemma-2-1b-1b
- Checkpoint Stage 1: https://huggingface.co/Yuki131/KaLM-Reranker-V1-Small-R2-Stage1
- Checkpoint Stage 2 (r64-a32): https://huggingface.co/Yuki131/KaLM-Reranker-V1-Small-R2-Stage2-r64-a32
- Checkpoint Stage 2 (r96-a48): https://huggingface.co/Yuki131/KaLM-Reranker-V1-Small-R2-Stage2-r96-a48

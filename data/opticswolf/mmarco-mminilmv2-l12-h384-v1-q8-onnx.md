# opticsWolf/mmarco-mMiniLMv2-L12-H384-v1-q8-onnx

## Resumen

mmarco-mMiniLMv2-L12-H384-v1-q8-onnx es una compilación cuantizada en int8 de pesos (weight-only) del cross-encoder multilingüe `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`, publicada por el usuario opticsWolf. El modelo original es un reranker de tipo cross-encoder derivado de mMiniLMv2, entrenado sobre el corpus mMARCO (versión multilingüe de MS MARCO) y pensado para reordenar pares consulta-documento en pipelines de recuperación de información. Esta variante no cambia la arquitectura ni el entrenamiento: solo aplica cuantización de pesos con ORT MatMulNBits (8 bits, bloque 128, asimétrico, escalas fp32) para producir un artefacto ONNX ejecutable con onnxruntime.

La relevancia de esta build es práctica: reduce el peso del repositorio a aproximadamente 0,4 GB y permite desplegar el reranker en entornos con onnxruntime sin necesidad de PyTorch, manteniendo una paridad de calidad declarada por el autor de ±0,016 nDCG@10 frente al modelo fp32 en cuatro benchmarks reducidos (NanoMSMARCO, NanoSciFact, NanoFiQA2018 y NanoNFCorpus). Es, por tanto, una pieza de infraestructura para sistemas RAG y motores de búsqueda semántica más que un modelo generativo.

El modelo no genera texto: es un clasificador de decisión que puntúa la relevancia de un par (query, pasaje). Su valor está en la etapa de reranking de un pipeline de recuperación, donde un cross-encoder suele aportar la mayor parte de la ganancia de precisión a cambio de un coste de cómputo que la cuantización int8 ayuda a contener.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer cross-encoder (MiniLMv2-L12-H384, 12 capas, dimensión oculta 384) |
| Parámetros totales | no disponible (el modelo base mMiniLMv2-L12-H384 ronda los 118 M, dato no confirmado en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 weight-only (ORT MatMulNBits, bits=8, bloque 128, asimétrico, escalas fp32) |
| Idiomas soportados | no disponible (el modelo base mMARCO es multilingüe, pero la model card no enumera idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un cross-encoder basado en MiniLMv2-L12-H384: un transformer de 12 capas con dimensión oculta 384 que procesa conjuntamente la consulta y el pasaje como una única secuencia y produce una puntuación de relevancia. El modelo base `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1` se entrena sobre mMARCO, la traducción multilingüe de MS MARCO, con el objetivo de ranking de pares consulta-documento. La model card de esta build no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos corresponden al modelo original y no se reproducen aquí.

La innovación técnica de esta publicación es exclusivamente la cuantización: se aplica ORT MatMulNBits con 8 bits, tamaño de bloque 128, esquema asimétrico y escalas en fp32, generando un grafo ONNX optimizado para onnxruntime. El autor reporta una puerta de calidad (gate) que exige que el nDCG@10 se mantenga dentro de 0,016 del modelo fp32 en los cuatro benchmarks Nano evaluados. No se mencionan técnicas adicionales como decodificación especulativa o atención lineal, que no aplican a un cross-encoder de ranking.

## Capacidades

- Puntuación de relevancia consulta-pasaje (reranking) para recuperación de información.
- Clasificación binaria o continua de pares (query, documento) según el cabezal del cross-encoder original.
- Procesamiento multilingüe heredado del modelo base mMARCO (no se detalla la lista de idiomas en la model card).
- Ejecución en onnxruntime sin dependencia de PyTorch.
- Inferencia con pesos int8 weight-only, lo que reduce el peso del artefacto a ~0,4 GB.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un modelo de decisión, no generativo.
- No se documentan modos especiales (thinking, razonamiento multi-paso) en la información disponible.

## Casos de uso

- Reranking en pipelines RAG: tras una recuperación inicial con un retriever bi-encoder (por ejemplo, embeddings densos o BM25), este cross-encoder reordena los candidatos según relevancia real consulta-pasaje, mejorando la precisión del contexto que se pasa al LLM generador. Su formato ONNX permite integrarlo en servicios sin PyTorch.
- Búsqueda semántica multilingüe: al heredar el entrenamiento mMARCO, puede puntuar pares en varios idiomas, lo que resulta útil en motores de búsqueda corporativos con documentación en distintas lenguas.
- Filtrado de resultados en motores de búsqueda internos: desplegado con onnxruntime en un microservicio, reordena los top-k resultados de un índice léxico o vectorial antes de mostrarlos al usuario.
- Evaluación de calidad de datasets de recuperación: sirve para puntuar pares y detectar pasajes irrelevantes en conjuntos de entrenamiento o evaluación de sistemas de búsqueda.
- Deduplicación y selección de pasajes: puntuar múltiples fragmentos de un mismo documento para elegir el más relevante respecto a una consulta en tareas de question answering extractivo.
- Despliegue en entornos con recursos limitados: al ser un artefacto ONNX int8 de ~0,4 GB, encaja en servicios contenerizados con CPU o GPU modesta donde cargar un cross-encoder fp32 en PyTorch sería excesivo.
- Componente de sistemas de recomendación de contenido textual: puntuar la afinidad entre una consulta de usuario y candidatos textuales en un catálogo.

## Benchmarks y rendimiento

El autor reporta nDCG@10 en cuatro benchmarks reducidos (Nano), comparando la build int8 con el modelo fp32:

| Benchmark | int8 q8 | fp32 | Diferencia |
|---|---|---|---|
| NanoMSMARCO | 0,9492 | 0,9545 | -0,0053 |
| NanoSciFact | 0,9134 | 0,9209 | -0,0075 |
| NanoFiQA2018 | 0,9148 | 0,9119 | +0,0029 |
| NanoNFCorpus | 0,8390 | 0,8234 | +0,0156 |

La puerta de calidad declarada exige una diferencia máxima de 0,016 en nDCG@10, que se cumple en los cuatro casos. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es esperable al tratarse de un modelo de ranking y no generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos int8 y ~0,4 GB de repositorio, la huella en memoria es del orden de cientos de MB, muy por debajo de un modelo generativo.
- GPU recomendadas: cualquier GPU con soporte de onnxruntime (CUDA EP), incluidas RTX 3060/4090, A100 o H100; el modelo es lo bastante pequeño para no requerir aceleradores de gama alta.
- Cabe en GPU de consumo: sí, con amplio margen, incluidas GPUs de gama baja y ejecución en CPU.
- Opciones de despliegue: onnxruntime (CPU o CUDA), integrable en servicios Python, contenedores o microservicios; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| opticsWolf/mmarco-mMiniLMv2-L12-H384-v1-q8-onnx | Cross-encoder reranker int8 | no disponible | no disponible | Apache-2.0 | ONNX | Build cuantizada, paridad nDCG ±0,016 |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 | Cross-encoder reranker fp32 | no disponible | no disponible | Apache-2.0 | safetensors/PyTorch | Modelo base del anterior |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | Cross-encoder reranker | ~22 M | 512 tokens (típico en esta familia) | Apache-2.0 | safetensors/PyTorch | Monolingüe inglés, más ligero |
| BAAI/bge-reranker-base | Cross-encoder reranker | ~278 M | 512 tokens (típico) | MIT | safetensors/PyTorch | Multilingüe, mayor coste computacional |

La comparativa se limita a modelos de la misma categoría (cross-encoders de reranking); los datos de parámetros y contexto de las alternativas no están confirmados en la información proporcionada y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- El modelo es un reranker, no un generador: no produce texto ni responde preguntas por sí mismo.
- La model card no documenta sesgos conocidos; al derivar de mMARCO, puede heredar sesgos presentes en los datos de MS MARCO y sus traducciones.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí puede producir puntuaciones de relevancia erróneas en dominios alejados de los datos de entrenamiento.
- No se especifican los idiomas cubiertos ni la longitud máxima de secuencia en la model card; conviene verificar ambos antes de desplegar en producción.
- La cuantización int8 introduce una degradación pequeña pero medible (hasta 0,016 nDCG@10 en los benchmarks reportados); en dominios distintos a los evaluados la pérdida podría ser mayor.
- Licencia Apache-2.0, permisiva para uso comercial, siempre que se respeten las condiciones de atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente y sin validación comunitaria independiente.
- La fecha de creación indicada (2026-10-30) es futura respecto a la información habitual de HuggingFace; conviene verificar la vigencia del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/opticsWolf/mmarco-mMiniLMv2-L12-H384-v1-q8-onnx
- Modelo base: https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.

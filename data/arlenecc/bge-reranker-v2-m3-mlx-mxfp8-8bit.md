# arlenecc/bge-reranker-v2-m3-mlx-mxfp8-8bit

## Resumen

Esta ficha corresponde a un repositorio de Hugging Face con identificador `arlenecc/bge-reranker-v2-m3-mlx-mxfp8-8bit`, publicado por el usuario `arlenecc`. Se trata de una conversión del modelo BAAI/bge-reranker-v2-m3 al formato MLX con cuantización MXFP8 de 8 bits, destinada a su ejecución en hardware Apple Silicon. El modelo base, bge-reranker-v2-m3, es un rerizador (reranker) desarrollado por BAAI (Beijing Academy of Artificial Intelligence) que reordena documentos candidatos frente a una consulta, mejorando la precisión de sistemas de recuperación de información tipo RAG.

El modelo base se basa en la arquitectura XLM-RoBERTa y ha sido entrenado como cross-encoder para puntuar la relevancia de pares consulta-documento en múltiples idiomas. La conversión a MLX con cuantización MXFP8 permite reducir a la mitad aproximadamente el consumo de memoria respecto a pesos de 16 bits, facilitando su uso en portátiles Mac con chips M1, M2, M3 o M4 sin necesidad de GPU dedicada.

La relevancia de este repositorio es principalmente práctica: ofrece una versión optimizada para el ecosistema MLX de Apple de un reranker muy utilizado en pipelines de búsqueda semántica. Es importante señalar que la model card del repositorio está prácticamente vacía (solo declara la licencia MIT), por lo que buena parte de la información técnica proviene del conocimiento público sobre el modelo base y no de la ficha original. Los datos de descargas y likes son cero, lo que indica que se trata de una conversión comunitaria sin tracción publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (modelo base bge-reranker-v2-m3) |
| Parámetros totales | 568 millones (modelo base bge-reranker-v2-m3) |
| Parámetros activos | no disponible (no es MoE; arquitectura densa) |
| Longitud de contexto | 8192 tokens (modelo base) |
| Tipos de cuantización | MXFP8 (8 bits, formato MLX) |
| Idiomas soportados | Multilingüe (modelo base entrenado para más de 100 idiomas; lista exacta no disponible en la model card) |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors con cuantización MXFP8) |

## Arquitectura y entrenamiento

El modelo base bge-reranker-v2-m3 es un cross-encoder construido sobre XLM-RoBERTa, un transformer codificador multilingüe preentrenado sobre 2,5 TB de texto en más de 100 idiomas. A diferencia de los modelos bi-encoder (como bge-m3), que codifican consulta y documentos por separado, el cross-encoder procesa el par consulta-documento de forma conjunta y produce una única puntuación de relevancia, lo que lo hace más preciso pero más costoso computacionalmente. Por ello se emplea típicamente como segunda etapa en pipelines de recuperación: un retriever denso o BM25 selecciona los primeros 50-100 candidatos y el reranker los reordena.

El entrenamiento del modelo base lo realizó BAAI sobre pares de consulta y pasaje en múltiples idiomas y tareas, optimizando para la relevancia de recuperación. Los detalles exactos del dataset y del procedimiento de entrenamiento no están disponibles en la model card de este repositorio. En cuanto a la conversión publicada por `arlenecc`, consiste en una cuantización MXFP8 (microscaling floating point de 8 bits) al framework MLX de Apple, que reduce el tamaño de los pesos manteniendo la precisión numérica mejor que las cuantizaciones enteras tradicionales. No hay información publicada sobre evaluaciones de la calidad tras la cuantización.

## Capacidades

- Reordenación de documentos (reranking): asigna puntuaciones de relevancia a pares consulta-documento, ideal como segunda etapa en sistemas RAG.
- Comprensión multilingüe: el modelo base soporta consultas y documentos en múltiples idiomas, incluyendo pares entre idiomas distintos (cross-lingual).
- Manejo de documentos largos: ventana de contexto de 8192 tokens en el modelo base, suficiente para pasajes y documentos extensos.
- Salida como clasificador binario de relevancia (puntuación de tipo logit) mediante la cabecera de clasificación de XLM-RoBERTa.
- No genera texto: no es un modelo generativo ni soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Reranking en pipelines RAG: tras la recuperación inicial con un retriever denso o BM25, el modelo reordena los 50-100 candidatos para alimentar al LLM con los pasajes más relevantes, mejorando la calidad de las respuestas generadas.
- Búsqueda semántica en aplicaciones locales: al ejecutarse en MLX sobre Apple Silicon, puede integrarse en aplicaciones de búsqueda documental que corren íntegramente en un Mac sin servidor externo.
- Búsqueda multilingüe y cross-lingual: permite recuperar documentos en un idioma distinto al de la consulta, útil en corpus empresariales multilingües.
- Deduplicación y filtrado de resultados: la puntuación de relevancia puede usarse como umbral para descartar documentos irrelevantes antes de pasarlos al LLM, reduciendo coste y alucinaciones.
- Asistentes sobre documentación técnica: en combinación con un LLM local, permite responder preguntas sobre manuales, wikis internas o repositorios de código con alta precisión de recuperación.
- Sistemas de recomendación de contenido: reordenación de artículos, tickets o respuestas candidatas frente a la intención del usuario en plataformas de soporte o conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta conversión concreta. Para el modelo base, BAAI publicó evaluaciones en BEIR, MIRACL y otros benchmarks de recuperación, pero dichos datos no constan en la model card de este repositorio y no se incluyen aquí para evitar cifras no verificadas. No hay evaluaciones publicadas del impacto de la cuantización MXFP8 sobre la calidad del reranking.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 0,6-0,7 GB con cuantización MXFP8 (el modelo en FP16 ocupa alrededor de 1,1-1,2 GB); con contexto de 8192 tokens el consumo adicional de activaciones es modesto.
- Hardware objetivo: Mac con Apple Silicon (M1, M2, M3 o M4) mediante el framework MLX. No es adecuado para GPU NVIDIA en este formato; para CUDA deberían usarse las versiones originales en safetensors o conversiones GGUF/ONNX.
- Cabe con holgura en cualquier Mac con al menos 8 GB de memoria unificada, incluidos MacBook Air de gama base.
- Despliegue: mediante la librería `mlx` de Python (paquete `mlx_lm` o `mlx-rerankers` según disponibilidad), o vía LM Studio, que soporta modelos MLX. No es directamente compatible con vLLM, llama.cpp, TGI ni Ollama en este formato.
- Latencia: no disponible. En Apple Silicon, un cross-encoder de 568M parámetros cuantizado a 8 bits procesa típicamente pares consulta-documento en decenas de milisegundos, pero no hay mediciones publicadas para esta conversión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bge-reranker-v2-m3 (base) | 568M | 8192 | Cross-encoder multilingüe | MIT | Hugging Face, safetensors, ONNX, GGUF |
| bge-reranker-v2-gemma | ~2500M | 8192 | Cross-encoder basado en Gemma | Apache 2.0 / términos Gemma | Hugging Face, safetensors |
| bge-reranker-v2-minicpm-layerwise | ~2700M | 4096 | Cross-encoder con selección de capas | Apache 2.0 | Hugging Face, safetensors |
| jina-reranker-v2-base-multilingual | 278M | 8192 | Cross-encoder multilingüe | CC-BY-NC-4.0 (no comercial) | Hugging Face, safetensors |

Esta conversión MLX se diferencia de las alternativas en que está optimizada específicamente para Apple Silicon con cuantización MXFP8, mientras que las versiones oficiales de BAAI se distribuyen en precisión completa para uso general.

## Limitaciones y advertencias

- Model card prácticamente vacía: el repositorio no documenta el proceso de conversión, ni evalúa el impacto de la cuantización MXFP8 sobre la calidad del reranking; conviene validar empíricamente en el propio corpus antes de producción.
- Repositorio comunitario sin tracción: 0 descargas y 0 likes publicados en el momento de redactar la ficha; no hay respaldo de la organización original (BAAI).
- No es un modelo generativo: no sirve para chat, generación de texto, código ni agentes; solo produce puntuaciones de relevancia.
- Riesgo de sesgo: como todo cross-encoder entrenado sobre datos web, puede heredar sesgos lingüísticos y culturales del corpus de preentrenamiento de XLM-RoBERTa; no hay auditorías de sesgo publicadas.
- Coste computacional del cross-encoding: puntuar cada par consulta-documento requiere una pasada completa del modelo, lo que lo hace inviable como primera etapa de recuperación sobre corpus grandes.
- Compatibilidad restringida a MLX/Apple Silicon: no funciona con vLLM, llama.cpp, TGI ni Ollama; en entornos de servidor con GPU NVIDIA deberán usarse los pesos originales.
- Licencia MIT: sin restricciones para uso comercial, aunque conviene verificar los términos del modelo base original, también bajo MIT.
- Lista exacta de idiomas soportados no disponible en la model card; el modelo base es multilingüe pero el rendimiento en idiomas de bajos recursos puede ser inferior.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/arlenecc/bge-reranker-v2-m3-mlx-mxfp8-8bit
- Modelo base (referencia): https://huggingface.co/BAAI/bge-reranker-v2-m3
- Organización BAAI en Hugging Face: https://huggingface.co/BAAI
- Framework MLX: https://github.com/ml-explore/mlx

# Lucie666/ms-marco-minilm-l6-v2-burnpack

## Resumen

Este repositorio contiene una conversión mecánica de formato del modelo cross-encoder `cross-encoder/ms-marco-MiniLM-L-6-v2` al formato `burnpack` de la librería Burn (Rust). No se trata de un modelo original ni de un fine-tuning: los pesos son exactamente los mismos que los del modelo original, re-serializados para poder cargarse en un stack de inferencia puramente en Rust, sin Python, PyTorch ni ONNX Runtime en tiempo de inferencia. El autor de la conversión es Lucie666, y el modelo original fue desarrollado por Nils Reimers y el equipo de sentence-transformers, fine-tuned desde MiniLM de Microsoft sobre MS MARCO Passage Ranking.

El modelo es un cross-encoder que puntúa directamente un par (consulta, pasaje) y se utiliza como reranker en pipelines de recuperación. Con un tamaño de archivo de aproximadamente 86,7 MiB, es lo suficientemente pequeño para ejecutarse en un navegador (WebGPU) o en un proceso Rust embebido, como se hace en el proyecto rag3weaver. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM-L6) con cabeza de clasificación (cross-encoder) |
| Parametros totales | no disponible (el archivo pesa 86,7 MiB en f32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 posiciones (máximo, según tokenizador WordPiece) |
| Tipos de cuantizacion | no disponible (pesos originales f32, sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | burnpack (model.bpk); el original está disponible en ONNX y safetensors |

## Arquitectura y entrenamiento

El modelo es un `BertForSequenceClassification` completo: tokenización BERT uncased WordPiece, 6 capas transformer con 384 dimensiones ocultas, pooler (Linear 384→384 + tanh) y clasificador (Linear 384→1). La salida es el logit crudo (la activación por defecto es la identidad); un valor más alto indica mayor relevancia, y se puede aplicar una sigmoide para obtener una probabilidad. La tokenización no está incluida en el repositorio; se debe usar el `tokenizer.json` del modelo original, que codifica pares como `[CLS] query [SEP] passage [SEP]` con `token_type_ids` 0 para la consulta y 1 para el pasaje.

El entrenamiento original se realizó sobre MS MARCO Passage Ranking, fine-tune de MiniLM-L6. La conversión a Burn se hizo con `burn-onnx` de forma mecánica, sin modificar los pesos. La serialización burnpack no es byte-determinista: dos builds desde el mismo ONNX producen archivos del mismo tamaño pero con bytes diferentes, aunque los valores de los tensores no se ven afectados.

## Capacidades

- Reranking de pares (consulta, pasaje): puntúa la relevancia de un pasaje dado una consulta, devolviendo un logit escalar.
- Clasificación de relevancia binaria: aplicando una sigmoide al logit se obtiene una probabilidad de relevancia.
- Integración en pipelines de retrieval: funciona como etapa de reranking tras una búsqueda inicial (por ejemplo, con BM25 o embeddings).
- Inferencia en Rust puro: al estar en formato burnpack, se puede cargar sin dependencias de Python ni ONNX Runtime.
- Ejecución en navegador: el tamaño reducido permite inferencia vía WebGPU.
- Soporte de contexto limitado a 512 tokens, suficiente para pares consulta-pasaje típicos.

## Casos de uso

- Reranking en sistemas RAG: dado un conjunto de pasajes candidatos recuperados por una primera etapa, el modelo reordena los resultados por relevancia antes de pasarlos al generador. Es adecuado por su tamaño reducido y su salida logit directamente comparable.
- Búsqueda semántica en aplicaciones Rust: al integrarse en un stack puramente Rust, permite añadir reranking sin levantar servicios Python, ideal para aplicaciones embebidas o de escritorio.
- Inferencia en navegador: con WebGPU, se puede ejecutar el reranker directamente en el cliente, útil para aplicaciones web de búsqueda o documentación interactiva.
- Filtrado de resultados en motores de búsqueda internos: puntuar pares consulta-documento para descartar resultados irrelevantes antes de mostrarlos al usuario.
- Evaluación de relevancia en datasets: usar el logit como señal de relevancia para crear o anotar datasets de retrieval.
- Sistemas de preguntas y respuestas: combinar con un extractor de pasajes para seleccionar la respuesta más probable entre varias candidatas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original (cross-encoder/ms-marco-MiniLM-L-6-v2) tiene resultados conocidos en TREC Deep Learning 2019 y MS MARCO Passage Reranking, pero no se incluyen en este repositorio de conversión. La model card de la conversión solo verifica la paridad numérica con una implementación de referencia en candle, con una diferencia máxima de 5,7e-6 en logits crudos.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo de ~87 MiB en f32, cabe en cualquier GPU con al menos 1 GB de VRAM, y también en CPU.
- GPU recomendadas: cualquier GPU moderna con soporte Vulkan (para el backend wgpu) o CPU. Se ha verificado en una AMD Radeon AI PRO R9700 (Navi 48, RDNA4) vía RADV.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con 2 GB o más de VRAM es suficiente; también funciona en iGPU.
- Opciones de despliegue: Burn con backend wgpu (Vulkan/Metal/DX12), CPU (ndarray), o WebGPU en navegador. No se distribuyen pesos GGUF ni para vLLM/Ollama.
- Latencia y throughput: no disponible, pero al ser un modelo de 6 capas, la inferencia de un par debería ser del orden de milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ms-marco-minilm-l6-v2-burnpack (este) | no disponible (~87 MiB f32) | 512 | burnpack | Apache-2.0 | Conversión de formato, mismos pesos que el original |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | no disponible | 512 | ONNX, safetensors | Apache-2.0 | Modelo original, referencia para benchmarks |
| cross-encoder/ms-marco-MiniLM-L-12-v2 | no disponible | 512 | ONNX, safetensors | Apache-2.0 | Versión con 12 capas, mayor capacidad pero más pesado |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparativa se limita a aspectos estructurales y de formato.

## Limitaciones y advertencias

- No es un modelo original: es una conversión mecánica de formato; cualquier limitación del modelo original se hereda.
- Solo inglés: el tokenizador y el entrenamiento están orientados al inglés; el rendimiento en otros idiomas será deficiente.
- Contexto limitado a 512 tokens: no es adecuado para pasajes muy largos sin truncamiento.
- Tokenización no incluida: se debe obtener el `tokenizer.json` del modelo original; la entrada debe ser un par codificado como `[CLS] query [SEP] passage [SEP]`.
- Salida sin normalizar: el logit crudo no es una probabilidad; solo el orden es significativo.
- Serialización no determinista: dos conversiones del mismo ONNX producen archivos con bytes diferentes, aunque los valores de los tensores son idénticos.
- Sin cuantización: los pesos son f32, lo que puede ser menos eficiente en memoria que versiones cuantizadas (no se proporcionan).
- Uso comercial: permitido bajo Apache-2.0, pero se debe atribuir al autor original.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Lucie666/ms-marco-minilm-l6-v2-burnpack
- Modelo original: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L-6-v2
- Proyecto rag3weaver (uso como reranker): https://github.com/L-Defraiteur/rag3db
- Paper de Sentence-BERT: https://arxiv.org/abs/1908.10084
- Paper de MiniLM: https://arxiv.org/abs/2002.10957
- Librería Burn: https://burn.dev

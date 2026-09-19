# Chottokun/ruri-v3-reranker-310m-lite

## Resumen

ruri-v3-reranker-310m-lite es un paquete de despliegue optimizado del cross-encoder japonés cl-nagoya/ruri-v3-reranker-310m, un reranker de alta precisión construido sobre la arquitectura ModernBERT-Ja con 315 millones de parámetros. Lo publica el usuario Chottokun y su aportación no es un reentrenamiento, sino una conversión a ONNX (fp32, fp16, int8 e int8_full) acompañada de un runtime "zero-torch": elimina por completo la dependencia de PyTorch y Transformers y reduce el entorno Python de más de 2,5 GB a unos 70 MB.

El problema que resuelve es de coste de despliegue. Un reranker cross-encoder evalúa cada par consulta-documento de forma independiente, por lo que el coste crece en O(N) con el número de candidatos; en un pipeline RAG en japonés eso se traduce en latencias de segundos por consulta. Esta versión mantiene la equivalencia matemática con el modelo original (diferencia máxima absoluta de logits inferior a 6,32 × 10⁻⁶ y coincidencia del 100 % en el orden top-k) mientras acelera la tokenización entre 3,8 y 4,5 veces mediante SentencePiece Lite y reduce el tamaño del modelo hasta un 75 % en la variante int8_full (301 MB).

Es relevante ahora porque permite ejecutar reranking de calidad en CPU o en GPUs de gama baja dentro de arquitecturas RAG de dos etapas, sin arrastrar el stack de deep learning completo. Está pensado exclusivamente para japonés y se distribuye con licencia Apache 2.0, igual que el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder (pipeline text-classification) basado en ModernBERT-Ja, exportado a ONNX |
| Parámetros totales | ~315 M (el modelo base declara 315 M; la conversión ONNX no altera el número de parámetros) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | fp32 (model.onnx), fp16 (model_fp16.onnx), int8 dinámica (model_int8.onnx), int8_full (model_int8_full.onnx) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (.onnx); el modelo base se distribuye en safetensors |
| Modelo base | cl-nagoya/ruri-v3-reranker-310m (Universidad de Nagoya, laboratorio cl-nagoya) |
| Tarea | Reranking / puntuación de relevancia de pares (consulta, documento) |
| Runtime | ONNX Runtime (CPU o GPU); sin torch, sin transformers |
| Dependencias de ejecución | sentencepiece_lite, onnxruntime / onnxruntime-gpu, numpy, huggingface_hub |
| Tamaño del modelo por variante | 1.202 MB (fp32), 601 MB (fp16), 526 MB (int8), 301 MB (int8_full) |
| Tamaño del repositorio | 4,0 GB |
| Wheel precompilada | sentencepiece_lite 0.1.0, cp311-cp311, linux_x86_64 |
| Fecha de publicación en HuggingFace | 2026-09-19 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT-Ja en configuración de cross-encoder: la consulta y el documento se concatenan en una única secuencia que pasa por el encoder, y la cabeza de clasificación produce una puntuación de relevancia. Al ser un cross-encoder, no genera representaciones reutilizables por documento, sino que evalúa cada par por separado, lo que le otorga mayor precisión que un bi-encoder a cambio de un coste lineal con el número de candidatos. Esta variante "lite" no modifica ni reentrena el modelo: convierte los pesos oficiales en safetensors a ONNX, sanea atributos del grafo y aplica cuantización dinámica int8 (y una variante int8_full más agresiva) para generar cuatro niveles de precisión.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo etapas de ajuste con RLHF o DPO en la documentación proporcionada; esos detalles corresponden al modelo base. La innovación técnica destacable de este repositorio es el empaquetado: tokenización C++ zero-copy con diccionario FlatBuffers (.spm.fb), ruedas binarias precompiladas para evitar compilación de C++, carga automática de FP16 en GPUs con Compute Capability ≥ 7.0 (Turing/Ampere o superior) y de FP32 en GPUs Pascal o CPU. El autor documenta una equivalencia numérica con la implementación PyTorch del modelo original con diferencia máxima absoluta de logits inferior a 6,32 × 10⁻⁶ y una consistencia del 100 % en el orden del top-k.

## Capacidades

- Puntuación de relevancia de pares (consulta, documento) mediante cross-encoding, con API `score(pairs, normalize=True)` que devuelve probabilidades.
- Reranking con ordenación descendente de resultados mediante `rerank(query, documents, top_k, normalize)`.
- Recuperación de la ventana top-k con preservación del orden de ranking respecto al modelo PyTorch original (100 % de coincidencia en top-k; 100 % de coincidencia de top-1 a top-5 en la variante int8_full).
- Procesamiento de lotes de hasta 100 documentos por consulta, con latencia medida en CPU de 4 hilos.
- Tokenización rápida específica para japonés mediante SentencePiece Lite (entre 3,79 y 4,55 veces más rápida que AutoTokenizer de Hugging Face según el tamaño del lote).
- Ejecución sin PyTorch ni Transformers, con huella de entorno de aproximadamente 70 MB frente a más de 2,5 GB del stack convencional.
- Selección automática de precisión según hardware: FP16 en GPU moderna, FP32 en Pascal o CPU.
- No dispone de generación de texto, tool calling, capacidades de agente, visión, audio ni modo de razonamiento explícito: es un modelo discriminativo de clasificación.

## Casos de uso

- Reranking en pipelines RAG en japonés: se usa como segunda etapa tras una recuperación aproximada con un bi-encoder ligero (el propio autor recomienda Chottokun/ruri-v3-30m-lite para obtener 20-30 candidatos en menos de 10 ms) y devuelve los 3-5 pasajes más relevantes con una latencia de aproximadamente 1,2 s por consulta en CPU.
- Búsqueda semántica en documentación técnica interna: indexación de manuales, wikis y notas de ingeniería en japonés, donde el reranker corrige los falsos positivos que produce la búsqueda vectorial por similitud de embeddings.
- Soporte al cliente automatizado: selección de los artículos de FAQ o de la base de conocimiento más pertinentes antes de que un LLM redacte la respuesta, reduciendo el contexto irrelevante enviado al modelo generativo.
- Moderación y curación de datasets: puntuación de pares pregunta-respuesta para filtrar ejemplos poco alineados o detectar duplicados con redacción distinta en corpus japoneses.
- Motores de búsqueda vertical (legal, médico, inmobiliario): reordenación de resultados de una primera fase de recuperación cuando la precisión del orden final es crítica y el volumen de consultas permite asumir el coste O(N) por consulta.
- Sistemas de recomendación textual: emparejamiento entre una descripción de necesidad y candidatos (ofertas de empleo, cursos, productos) puntuando la afinidad con una probabilidad calibrada.
- Verificación de grounding en aplicaciones generativas: comprobar si los pasajes recuperados respaldan realmente la consulta antes de invocar al LLM, usando la puntuación normalizada como umbral de confianza.
- Despliegue en entornos con restricciones de recursos: funciones serverless, contenedores mínimos o máquinas sin GPU que solo pueden alojar una imagen ligera, gracias a los 301 MB de la variante int8_full y a la ausencia de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, JMTEB, NDCG, MRR u otros) en la información disponible. Los únicos datos publicados son de latencia, tamaño y equivalencia numérica. Se reproducen a continuación tal como aparecen en la model card.

Rendimiento de inferencia en CPU (Linux x86_64, 4 hilos, documentos de ~150 caracteres):

| Documentos top-N | PyTorch (Transformers) | Zero-Torch Lite | Aceleración de tokenización | Throughput Lite |
|---|---|---|---|---|
| Top-5 | 567,3 ms | 540,4 ms | 4,24x | 9,3 docs/s |
| Top-10 | 1.104,7 ms | 1.277,4 ms | 4,51x | 7,8 docs/s |
| Top-20 | 2.343,2 ms | 2.479,5 ms | 4,18x | 8,1 docs/s |
| Top-50 | 5.828,6 ms | 6.215,3 ms | 3,79x | 8,0 docs/s |
| Top-100 | 11.214,4 ms | 12.452,8 ms | 4,55x | 8,0 docs/s |

Comparativa de niveles de precisión (latencia en CPU para Top-10):

| Precisión | Fichero | Tamaño | Reducción | Latencia CPU (Top-10) | Aceleración | Consistencia de ranking (Top-1) |
|---|---|---|---|---|---|---|
| fp32 | model.onnx | 1.202 MB | Línea base | 2.662 ms | 1,00x | 100 % (línea base) |
| fp16 | model_fp16.onnx | 601 MB | -50,0 % | No disponible (Tensor Core de GPU) | No disponible | 100 % |
| int8 | model_int8.onnx | 526 MB | -56,3 % | 2.075 ms | 1,28x | 100 % |
| int8_full | model_int8_full.onnx | 301 MB | -75,0 % | 2.003 ms | 1,33x | 100 % (puestos 1 a 5) |

Fidelidad numérica declarada: diferencia máxima absoluta de logits frente a la implementación oficial en PyTorch inferior a 6,32 × 10⁻⁶ y coincidencia del 100 % en el orden top-k.

## Requisitos de hardware

- VRAM estimada: no se requieren aceleradores para las variantes fp32, int8 e int8_full; la variante fp16 ocupa 601 MB de VRAM. No se publican cifras de consumo de memoria en GPU para lotes grandes.
- CPU: cualquiera compatible con ONNX Runtime; con 4 hilos se obtienen 2.003 ms para Top-10 con int8_full y 2.662 ms con fp32.
- GPU recomendadas: FP16 se carga automáticamente en GPUs con Compute Capability ≥ 7.0 (Turing o superior, por ejemplo T4, RTX 2060/3060/4090, A100, H100). En GPUs Pascal o anteriores se carga FP32.
- GPU de consumo: sí, cabe con holgura en cualquier GPU consumer reciente; los 301-601 MB del modelo son muy inferiores a la VRAM típica de una RTX 3060 o superior. También funciona enteramente en CPU.
- Opciones de despliegue: ONNX Runtime (CPU) u ONNX Runtime GPU, más el paquete Python ruri_v3_reranker_lite. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: aproximadamente 1,2 s por consulta con 10 candidatos en CPU de 4 hilos y un throughput estable en torno a 8 documentos por segundo entre 20 y 100 candidatos.
- Requisito de instalación: la rueda de sentencepiece_lite incluida es cp311-cp311 para linux_x86_64; en otras plataformas o versiones de Python habría que compilar desde fuente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Runtime | Licencia | Notas |
|---|---|---|---|---|---|---|
| Chottokun/ruri-v3-reranker-310m-lite | ~315 M | No disponible | ONNX (fp32/fp16/int8/int8_full) | ONNX Runtime, sin torch | Apache 2.0 | 301-1.202 MB, tokenización 3,8-4,5x más rápida |
| cl-nagoya/ruri-v3-reranker-310m | 315 M | No disponible | safetensors (PyTorch) | torch + transformers | Apache 2.0 | Modelo original de la Universidad de Nagoya; precisa un entorno de más de 2,5 GB |
| Chottokun/ruri-v3-30m-lite | No disponible | No disponible | ONNX | ONNX Runtime | No disponible | Bi-encoder ligero citado por el autor como primera etapa de recuperación en menos de 10 ms |

No se dispone de datos de rendimiento de calidad que permitan comparar estos modelos frente a alternativas de reranking multilingües o de otros tamaños; la comparación se limita a formato, runtime, tamaño y licencia.

## Limitaciones y advertencias

- Modelo monolingüe: solo japonés (ja). No debe esperarse un rendimiento fiable en otros idiomas, incluido el castellano.
- Es un modelo discriminativo: no genera texto, no soporta tool calling ni razonamiento multi-paso, y no puede emplearse como LLM.
- Coste lineal O(N): la inferencia cross-encoder escala con el número de documentos, con aproximadamente 1,2 s por cada 10 candidatos en CPU. Sin una primera etapa de recuperación eficiente, el sistema no es viable a gran escala.
- Riesgo de falsos positivos en la puntuación de relevancia: una puntuación alta indica afinidad aprendida, no veracidad del documento, por lo que no elimina el riesgo de fundamentar respuestas en pasajes erróneos.
- La consistencia del 100 % se documenta explícitamente para el top-1 y, en int8_full, para los puestos 1 a 5; no se garantiza que el orden se preserve en posiciones más profundas de la clasificación.
- La cuantización int8_full reduce el tamaño un 75 %; conviene validar el comportamiento en el dominio concreto antes de adoptarla en producción.
- La rueda precompilada solo cubre Python 3.11 sobre Linux x86_64, lo que limita el despliegue directo en otros sistemas sin compilación manual.
- Repositorio con 0 descargas y 0 "likes" en el momento de la consulta, publicado por un autor individual y no por el laboratorio original: se trata de una conversión de terceros, sin validación comunitaria independiente más allá de las comprobaciones numéricas del propio autor.
- La model card está truncada en la sección de modificaciones, por lo que la lista completa de cambios aplicados sobre el modelo original no está disponible.
- Licencia Apache 2.0, que permite uso comercial; se recomienda mantener la atribución al modelo base y a sus autores (Hayato Tsukagoshi y Ryohei Sasano, cl-nagoya) según lo indicado en la propia model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chottokun/ruri-v3-reranker-310m-lite
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Bi-encoder ligero citado para la primera etapa de recuperación: https://huggingface.co/Chottokun/ruri-v3-30m-lite
- Referencia arXiv incluida en las etiquetas del repositorio: https://arxiv.org/abs/2409.07737
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Rueda precompilada de SentencePiece Lite: https://huggingface.co/Chottokun/ruri-v3-reranker-310m-lite/resolve/main/wheels/sentencepiece_lite-0.1.0-cp311-cp311-linux_x86_64.whl

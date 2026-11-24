# SituatedEmbedding/QRRanker-BRIGHT

## Resumen

QRRanker-BRIGHT es un modelo de reranking de texto desarrollado por SituatedEmbedding, un fine-tuning del modelo base Qwen/Qwen3-4B-Instruct-2507. El modelo está diseñado específicamente para la tarea de reranking dentro del benchmark BRIGHT, un conjunto de evaluación centrado en dominios intensivos en razonamiento (matemáticas, código, ciencia, etc.). Se distribuye con los pesos completos, el tokenizer y una implementación de modelo personalizada que incorpora cabeceras QR (Query-Reranking) para puntuar pares consulta-documento.

A diferencia de la implementación de referencia del método QRRanker original, esta versión para BRIGHT no trunca las capas superiores del transformer: conserva las 36 capas y todos los parámetros (4.022.468.096 en total), ejecutando el forward pass completo aunque solo se seleccionen las 16 cabeceras QR principales para el scoring. Esto implica un mayor consumo de memoria y cómputo, y la evaluación publicada se realizó exclusivamente con FP16, FlashAttention 2 y paralelismo de tensores sobre 4 u 8 GPUs A100 de 40 GB.

El modelo se entrenó con el dataset `reasonrank_data_13k` y se orienta a la evaluación de reranking de pool fijo (top-100 candidatos), no a recuperación sobre corpus completo. Su relevancia radica en explorar el reranking basado en razonamiento sobre documentos largos (hasta 65.536 tokens de entrada) en escenarios donde los rerankers tradicionales basados en cross-encoders ligeros rinden peor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabeceras QR personalizadas para reranking |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens en evaluacion (maximo de entrada usado) |
| Tipos de cuantizacion | No disponible (evaluacion solo en FP16) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 8,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parámetros, y le añade el mecanismo QRRanker: cabeceras QR específicas que se seleccionan (top-16) para producir la puntuación de relevancia entre consulta y documento. La implementación personalizada se distribuye en `custom_modeling_qwen3_new.py` y `custom_cache_new.py`, y requiere importar explícitamente la clase `Qwen3Model` personalizada, ya que la configuración no registra un `auto_map` y `AutoModel.from_pretrained(..., trust_remote_code=True)` no selecciona la implementación QRRanker.

El entrenamiento se realizó sobre el dataset `reasonrank_data_13k` (referenciado como `reasonrank-131k` en la model card). No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica principal es el uso de cabeceras QR seleccionadas para el scoring dentro de un modelo de lenguaje completo, sin poda de capas ni salida temprana: todas las 36 capas se ejecutan en cada forward pass, lo que incrementa el coste computacional frente a la implementación de referencia truncada.

## Capacidades

- Reranking de documentos: puntúa pares consulta-documento para reordenar un pool fijo de candidatos (top-100 en la evaluación BRIGHT).
- Razonamiento sobre documentos largos: soporta entradas de hasta 65.536 tokens, adecuado para pasajes extensos o técnicos.
- Dominios intensivos en razonamiento: evaluado en BRIGHT, que cubre matemáticas, código, ciencia y otros dominios que requieren comprensión profunda.
- Hereda las capacidades del modelo base Qwen3-4B-Instruct-2507 (generación de texto, instrucciones), aunque el fine-tuning está orientado a la tarea de ranking.
- Idioma: únicamente inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking específico para esta release.

## Casos de uso

- Reranking en pipelines de búsqueda aumentada por generación (RAG): el modelo reordena los top-100 documentos recuperados por un retriever (como DIVER-Retriever-4B) antes de pasarlos al generador, mejorando la precisión del contexto gracias a su capacidad de razonar sobre pasajes largos de hasta 65.536 tokens.
- Búsqueda técnica y científica: adecuado para consultas en dominios como matemáticas, código o ciencia, donde los rerankers ligeros suelen fallar por falta de razonamiento profundo.
- Evaluación de sistemas de recuperación: sirve como componente de referencia para medir la calidad de retrievers en el benchmark BRIGHT con pools fijos de candidatos.
- Reranking de documentación de código: puede puntuar fragmentos de código y documentación técnica frente a consultas de desarrolladores, aprovechando el entrenamiento del modelo base en código.
- Filtrado de candidatos en motores de búsqueda especializados: reordena resultados de motores internos en dominios verticales donde la relevancia depende de comprensión semántica compleja.
- Investigación en reranking basado en razonamiento: útil como baseline reproducible para estudiar el impacto de las cabeceras QR y del razonamiento en la calidad del ranking, con datos y código de evaluación publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la evaluación BRIGHT se realizó con 4 y 8 GPUs A100 de 40 GB (TP=4 y TP=8), FP16, FlashAttention 2, top-16 cabeceras QR, longitud máxima de 65.536 tokens y sin calibración, pero no incluye las métricas numéricas obtenidas. Los resultados de referencia están en el repositorio de datos `SituatedEmbedding/BRIGHT-DIVER-4B-Top100-QRRanker`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el modelo tiene 4.022 millones de parámetros y el repo pesa 8,1 GB, lo que sugiere que en FP16 requiere al menos ~8 GB solo para pesos, más memoria para activaciones y caché KV con entradas de hasta 65.536 tokens y 100 candidatos.
- GPU recomendadas: la evaluación oficial se ejecutó en 4 u 8 NVIDIA A100 de 40 GB con paralelismo de tensores (TP=4 y TP=8). No se han probado configuraciones con menos de cuatro GPUs.
- Cabe en GPU consumer: no confirmado; dado el consumo descrito para entradas largas y 100 candidatos, es poco probable que quepa en GPUs consumer de 24 GB sin cuantización, y no se documentan opciones de cuantización.
- Opciones de despliegue: la model card solo documenta la carga mediante la implementación personalizada (`custom_modeling_qwen3_new.py`) y el punto de entrada de evaluación. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QRRanker-BRIGHT | 4.022 M | 65.536 tokens (evaluacion) | Reranking BRIGHT | No disponible | Hugging Face |
| QRRanker (referencia, MindscapeRAG) | Basado en Qwen3-4B (truncado) | No disponible | Reranking general | No disponible | Hugging Face |
| DIVER-Retriever-4B | 4B (aprox.) | No disponible | Recuperacion (retriever) | No disponible | Hugging Face |

La comparativa se limita a los modelos citados en la información disponible; no se dispone de datos de rendimiento numérico para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial permitido; es imprescindible verificar la licencia antes de usarlo en producción.
- Solo inglés: la model card declara únicamente el idioma inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Coste computacional elevado: al conservar las 36 capas y ejecutar el forward completo (sin poda ni salida temprana), el consumo de memoria y cómputo es sustancial, especialmente con entradas largas y 100 candidatos.
- Requiere código personalizado: no funciona con `AutoModel.from_pretrained(..., trust_remote_code=True)` por sí solo; hay que importar explícitamente la clase `Qwen3Model` personalizada, lo que complica su integración en frameworks estándar.
- Evaluación limitada a pool fijo: los resultados de BRIGHT corresponden a reranking de top-100 candidatos, no a recuperación sobre corpus completo; extrapolar su rendimiento a otros escenarios requiere validación.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero heredados potencialmente del modelo base Qwen3-4B-Instruct-2507.
- Sin datos de benchmarks públicos: no se han publicado métricas numéricas en la model card, lo que dificulta evaluar su calidad frente a alternativas.
- Sin opciones de cuantización documentadas: la evaluación solo usa FP16, lo que limita el despliegue en hardware con menos VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SituatedEmbedding/QRRanker-BRIGHT
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/liuwenhan/reasonrank_data_13k
- Implementación de referencia QRRanker: https://huggingface.co/MindscapeRAG/QRRanker
- Código de referencia `modeling_qwen3_qr.py`: https://huggingface.co/MindscapeRAG/QRRanker/blob/main/modeling_qwen3_qr.py
- Datos y código de evaluación BRIGHT: https://huggingface.co/datasets/SituatedEmbedding/BRIGHT-DIVER-4B-Top100-QRRanker
- README de evaluación: https://huggingface.co/datasets/SituatedEmbedding/BRIGHT-DIVER-4B-Top100-QRRanker/blob/main/README.md

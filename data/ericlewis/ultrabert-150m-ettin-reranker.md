# ericlewis/ultrabert-150m-ettin-reranker

## Resumen

UltraBERT 150M Ettin reranker es un cross-encoder de reordenación (reranking) entrenado sobre el encoder UltraBERT de 150 millones de parámetros, desarrollado por el usuario de Hugging Face ericlewis. El modelo toma un par consulta-documento y devuelve una puntuación escalar de relevancia, pensada para reordenar listas de candidatos recuperados por un sistema de búsqueda de primera etapa (por ejemplo, BM25). No es un modelo generativo: es un componente modular de Sentence Transformers para pipelines de recuperación de información.

El checkpoint publicado corresponde al mejor punto de control de un experimento que reutiliza la receta de entrenamiento Ettin sobre un corpus de 143 millones de pares, aunque solo se evaluó el prefijo de 57,3 millones de pares antes de detener el entrenamiento al 40 % del corpus. La model card indica explícitamente que no se completó una época ni se superó la selección original de referencia, por lo que se trata de un experimento acotado y no de un modelo de producción validado.

Es relevante ahora por dos motivos: demuestra el uso de un encoder nativo con ventana de 32.768 tokens para reranking de pares largos, y publica métricas de validación reproducibles sobre 13 tareas NanoBEIR con candidatos BM25 fijos. Su licencia Apache 2.0 y su tamaño compacto lo hacen fácil de desplegar, aunque su estado experimental y su validación limitada exigen evaluación propia antes de cualquier uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder modular sobre encoder UltraBERT nativo, con pooling CLS, proyección GELU 768×768 sin sesgo, LayerNorm y proyección escalar 768×1 |
| Parametros totales | 151.032.576 (según safetensors); la model card indica 151.624.705, incluida la cabeza de proyección |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por par consulta-documento (límite nativo del encoder) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un cross-encoder: el encoder UltraBERT procesa conjuntamente la consulta y el documento, aplica pooling sobre el token CLS y pasa la representación por una proyección GELU de 768×768 sin sesgo, una LayerNorm y una proyección lineal de 768×1. La salida es una puntuación de relevancia no acotada, no una probabilidad calibrada. El backbone se inicializó desde cero a partir del encoder preentrenado fijado (dmis-lab/UltraBERT-150M), sin cargar pesos de un reranker previo.

El entrenamiento usó pérdida MSE pointwise, AdamW con LR máximo 1,5e-5, 5 % de warmup y decaimiento lineal, semilla 12. El corpus liberado tiene 143.264.932 pares de 38 fuentes, pero solo se evaluó el prefijo hasta 57.311.232 pares. Tras 3.078.144 pares el batch global cambió de 192 a 768 en ocho workers GB10, conservando modelo, estado de Adam y posición en los datos; la progresión del LR quedó ligada a los ejemplos consumidos. Los fragmentos de forward/backward se limitan a 32.768 tokens y el activation checkpointing está desactivado. El checkpoint principal corresponde al paso físico 16.032 (paso lógico 4.008) y existe una rama `checkpoint-40pct` con la última trayectoria evaluada.

## Capacidades

- Reordenación de pares consulta-documento mediante una puntuación escalar de relevancia; el orden se obtiene ordenando las puntuaciones de forma descendente.
- Procesamiento de pares de hasta 32.768 tokens, útil para documentos largos en tareas de recuperación.
- Integración con Sentence Transformers como `CrossEncoder`, sin código remoto personalizado (`trust_remote_code=False`).
- Compatibilidad con atención FlashAttention 2 mediante el kernel comunitario indicado en la model card.
- Entrenamiento y evaluación exclusivamente en inglés.
- No dispone de generación de texto, tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Reordenación en pipelines RAG: recuperar candidatos con BM25 o un retriever denso y reordenarlos con este cross-encoder antes de pasarlos al generador; su tamaño de 150 M permite ejecutarlo en cada consulta con latencia baja.
- Búsqueda documental interna: indexar manuales, políticas o contratos largos y reordenar los fragmentos recuperados gracias a la ventana de 32.768 tokens por par.
- Atención al cliente sobre base de conocimiento: seleccionar el artículo más relevante para cada consulta entrante antes de que un LLM redacte la respuesta, reduciendo el contexto irrelevante.
- Evaluación de calidad de recuperación: usar las puntuaciones como señal para comparar retrievers o ajustar el top-k en un sistema existente.
- Filtrado de duplicados y near-duplicates: puntuar pares de documentos candidatos y descartar los que superen un umbral de similitud definido sobre la salida del modelo.
- Búsqueda en catálogos técnicos o científicos: reordenar resultados de búsqueda por relevancia semántica cuando la consulta es larga y el documento contiene terminología específica.
- Prototipado e investigación: al ser un experimento reproducible con métricas publicadas, sirve como base para comparar recetas de entrenamiento de rerankers sobre UltraBERT.

## Benchmarks y rendimiento

| Checkpoint | NanoBEIR mean nDCG@10 (↑) | Quora eval_loss del trainer (↓) |
|---|---:|---:|
| Seleccionado (main) | 0,677384617 | 0,854868174 |
| Trayectoria 40 % | 0,672344558 | 0,449231923 |

Las 13 tareas NanoBEIR usan candidatos BM25 fijos top-100, sin inyección de positivos, y 5.000 pares de validación Quora con batch de evaluación 24. NanoBEIR se usó para seleccionar checkpoints y no constituye un test final independiente; estos resultados no son resultados del Decision Index. La pérdida Quora reportada por el trainer no es equivalente al MSE exacto por par calculado de forma independiente. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (151 M parámetros en safetensors, repo de 1,2 GB), la inferencia en bfloat16 requiere del orden de 0,3 GB solo para pesos, más activaciones según la longitud del par.
- GPU recomendadas: no especificadas por el autor; el entorno probado usa CUDA con PyTorch 2.13.0+cu130, Transformers 5.23.0, Sentence Transformers 6.3.0 y kernels 0.18.3.
- Cabe en GPU de consumo: previsiblemente sí por tamaño, aunque no hay confirmación oficial ni lista de modelos concretos.
- Opciones de despliegue: Sentence Transformers `CrossEncoder` con `trust_remote_code=False`; vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| ericlewis/ultrabert-150m-ettin-reranker | 151 M | 32.768 tokens | Apache 2.0 | Experimental | nDCG@10 medio de 0,677 en NanoBEIR |
| ericlewis/ultrabert-150m-reranker | no disponible | no disponible | no disponible | no disponible | Experimento separado citado en la model card; sin datos de rendimiento en la información disponible |
| dmis-lab/UltraBERT-150M | 150 M | 32.768 tokens | no disponible | Modelo base | Encoder preentrenado del que deriva este reranker |
| Rerankers estándar tipo bge-reranker o ms-marco cross-encoders | no disponible | no disponible | no disponible | Producción | No se dispone de datos comparativos en la información proporcionada |

No hay datos suficientes en la información disponible para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Estado experimental: el entrenamiento se detuvo al 40 % del corpus y la model card no reclama mejora sobre la selección original ni finalización de época.
- La puntuación de salida es un valor no acotado, no una probabilidad calibrada; los umbrales deben ajustarse por caso de uso.
- NanoBEIR se usó para seleccionar checkpoints, por lo que sus métricas no son un test final independiente y pueden estar sobreajustadas a esa selección.
- El soporte de secuencias de 32.768 tokens no implica precisión en contexto largo ni atención de tiempo lineal, según advierte el autor.
- El rendimiento entre dominios no mejoró de forma consistente con entrenamiento más largo; hay que evaluar sobre un conjunto de validación propio.
- Idioma limitado al inglés; no hay soporte multilingüe documentado.
- Riesgo de sesgos y alucinación: no evaluado en la información disponible; al ser un modelo de ranking, el riesgo principal es ordenar mal candidatos, no generar texto.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la falta de validación independiente desaconsejan desplegarlo en producción sin pruebas propias.
- Requiere versiones concretas de PyTorch, Transformers, Sentence Transformers y kernels, además del encoder UltraBERT nativo; la incompatibilidad de versión puede impedir la carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ericlewis/ultrabert-150m-ettin-reranker
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-150M
- Dataset de entrenamiento: https://huggingface.co/datasets/cross-encoder/ettin-reranker-v1-data
- Experimento relacionado: https://huggingface.co/ericlewis/ultrabert-150m-reranker
- Kernel FlashAttention 2 usado: https://huggingface.co/kernels-community/flash-attn2
- Ficheros de validación citados en la model card: `validation_metrics.json` y `experiment.json` dentro del repositorio del modelo.

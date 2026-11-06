# sbordt/forgetting-contamination-774M-1x

## Resumen

`sbordt/forgetting-contamination-774M-1x` es un checkpoint de investigación publicado por Sebastian Bordt (y colaboradores) en el contexto del artículo «How much can we forget about Data Contamination?» presentado en ICML 2025. No es un modelo pensado para uso general, sino un artefacto experimental: un GPT-2 de 774 millones de parámetros entrenado deliberadamente sobre un corpus de FineWeb-Edu contaminado con las preguntas de ocho benchmarks de evaluación (HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU y Social IQA), con el objetivo de estudiar hasta qué punto el olvido catastrófico o el reentrenamiento pueden eliminar el efecto de la contaminación en las métricas.

El modelo sigue la arquitectura GPT-2 en su configuración `d36` tal como la implementa llm.c: 36 capas, 20 cabezas de atención y una dimensión de embedding de 1280, con una longitud de contexto de 1024 tokens. Se entrenó durante 29 563 pasos sobre 15 500 millones de tokens (1x Chinchilla) usando AdamW con una tasa de aprendizaje máxima de 2,5e-4. El checkpoint corresponde a la Figura 1(c) del paper y forma parte de una colección más amplia de checkpoints y conjuntos de preguntas de benchmark publicados por el autor.

Su relevancia es metodológica, no de producto: proporciona a la comunidad un punto de referencia reproducible para medir cómo la contaminación de datos infla las puntuaciones en benchmarks y qué estrategias de entrenamiento permiten mitigarla. La licencia MIT facilita su reutilización en experimentos académicos, aunque sus capacidades lingüísticas quedan lejos de los modelos actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (`d36` en llm.c): transformer decoder-only, 36 capas, 20 cabezas, ancho 1280 |
| Parametros totales | 774 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (`block_size=1024`) |
| Tipos de cuantizacion | no disponible (checkpoint en punto flotante, sin versiones GGUF/AWQ publicadas) |
| Idiomas soportados | no disponible (entrenado sobre FineWeb-Edu, mayoritariamente inglés) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint de llm.c guardado con `torch.save`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la configuración clásica de GPT-2 (pre-LN, atención multi-cabeza estándar, embeddings posicionales aprendidos), implementado en llm.c con el identificador `d36`. El vocabulario es el de GPT-2 (50 257 tokens). No incorpora innovaciones arquitectónicas modernas como atención lineal, MoE, decodificación especulativa ni capas SSM; su interés reside en el protocolo de entrenamiento.

Los datos de entrenamiento consisten en una muestra de FineWeb-Edu de 15 500 millones de tokens (1x Chinchilla para 774M parámetros) en la que se insertaron las preguntas de los benchmarks HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU y Social IQA mediante el script `llm.c/create_contaminated_dataset.py`. El entrenamiento usó AdamW con betas (0,9; 0,95), weight decay 0,1, tasa de aprendizaje máxima 2,5e-4 con warmup lineal y decaimiento hasta el 10 %, durante 29 563 pasos. No se menciona RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva con un contexto máximo de 1024 tokens.
- Modelado de lenguaje base: no está ajustado por instrucciones ni por preferencias humanas, por lo que no sigue instrucciones de forma fiable.
- Evaluación de pérdida de entropía cruzada (cross-entropy) sobre preguntas de opción múltiple, tal como implementa `llm.c/eval_gpt.py`.
- Predicción de opción correcta mediante comparación de log-probabilidades y longitud de prefijo común (`lcp`), orientada a la evaluación de benchmarks.
- No dispone de soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües no documentadas; el corpus de entrenamiento (FineWeb-Edu) es predominantemente inglés.

## Casos de uso

- Investigación sobre contaminación de datos: reproducir el experimento del paper midiendo cómo varían las puntuaciones en HellaSwag, MMLU u otros benchmarks cuando las preguntas aparecen en el corpus de entrenamiento.
- Estudio del olvido catastrófico: usar este checkpoint como punto de partida (o como referencia) para comparar estrategias de reentrenamiento o desaprendizaje que intenten eliminar el efecto de la contaminación.
- Validación de metodologías de evaluación: servir de control negativo/positivo en pipelines que detectan filtración de benchmarks en corpus de preentrenamiento.
- Reproducibilidad de resultados académicos: al estar publicados los scripts de entrenamiento (`774M.sh`), el dataset contaminado y los ficheros de evaluación en parquet, permite replicar la Figura 1(c) del paper.
- Docencia y formación: ejemplo didáctico de cómo se construye un modelo GPT-2 desde cero con llm.c y cómo se inyecta contaminación controlada en el corpus.
- Análisis de la relación entre tamaño de modelo y memorización: junto con los demás checkpoints de la colección (otros tamaños y multiplicadores de tokens), permite estudiar cómo escala la memorización de preguntas de benchmark con el número de parámetros y de tokens vistos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye el fichero `evals/all-contamination-splits_eval_step=29563.parquet` con las métricas por pregunta (columnas `options`, `ce_loss`, `lcp`, `prediction`, `label`) sobre 44 000 preguntas deduplicadas, pero los valores agregados no se detallan en la información proporcionada. El notebook `compute_results.ipynb` del repositorio permite reconstruir las métricas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,5 GB para los pesos (774M × 2 bytes) más memoria para activaciones y KV cache; en FP32, unos 3,1 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM en FP16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100. El modelo cabe holgadamente en GPUs de consumo.
- El checkpoint se distribuye como `.pth` (9,5 GB de repositorio, incluyendo el estado del optimizador), no como safetensors ni GGUF, por lo que requiere cargarlo con `torch.load` y la clase `GPT` de `llm.c/train_gpt.py`.
- Opciones de despliegue: el flujo documentado es llm.c (`eval_gpt.py`) con PyTorch 2.2.2. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; sería necesario convertir los pesos manualmente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Formato |
|---|---|---|---|---|---|
| sbordt/forgetting-contamination-774M-1x | 774M | 1024 | Investigacion sobre contaminacion de datos | MIT | `.pth` (llm.c) |
| GPT-2 medium (openai-community/gpt2-medium) | 355M | 1024 | Modelo base de proposito general | MIT | safetensors, PyTorch |
| GPT-2 large (openai-community/gpt2-large) | 774M | 1024 | Modelo base de proposito general | MIT | safetensors, PyTorch |
| Pythia-1B (EleutherAI) | 1000M | 2048 | Suite de investigacion con checkpoints intermedios | Apache 2.0 | safetensors, PyTorch |

La comparación con GPT-2 large es la más directa por tamaño y arquitectura, pero este checkpoint está especializado en el estudio de contaminación y no en uso general. Pythia-1B ofrece un contexto mayor y una suite de investigación más completa, aunque con otro objetivo experimental.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado por instrucciones ni alineado, por lo que no debe usarse como asistente conversacional en producción.
- Entrenado deliberadamente sobre datos contaminados con preguntas de benchmarks; sus puntuaciones en esos benchmarks no reflejan capacidad real y no son comparables con modelos entrenados sin contaminación.
- Ventana de contexto limitada a 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el corpus FineWeb-Edu es mayoritariamente inglés, por lo que el rendimiento en castellano será previsiblemente bajo.
- Riesgo elevado de alucinación y de generar texto incoherente, propio de un GPT-2 de 774M sin ajuste fino.
- Sesgos heredados de FineWeb-Edu y de los benchmarks insertados; no se documenta ningún proceso de mitigación.
- El checkpoint incluye el estado del optimizador, lo que infla el tamaño del repositorio (9,5 GB) y complica su despliegue en entornos con restricciones de almacenamiento.
- No hay versiones cuantizadas ni formatos estándar (safetensors, GGUF), lo que limita la integración con herramientas de inferencia habituales.
- Licencia MIT: permite uso comercial, pero el modelo no es adecuado para ello por sus limitaciones técnicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sbordt/forgetting-contamination-774M-1x
- Paper (arXiv): https://arxiv.org/abs/2410.03249
- Repositorio de código: https://github.com/tml-tuebingen/forgetting-contamination
- Script de entrenamiento: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/scripts/1x_chinchilla/774M.sh
- Script de creación del dataset contaminado: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/create_contaminated_dataset.py
- Script de evaluación: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/eval_gpt.py
- Notebook de resultados: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/compute_results.ipynb
- Colección de checkpoints y preguntas de benchmark: https://huggingface.co/collections/sbordt/forgetting-contamination-benchmark-questions-68bac54b109388f26b40b7eb

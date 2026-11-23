# harims95/hobbylm-embed-140m-mlx

## Resumen
HobbyLM-Embed-140M (MLX, float16) es la conversión a MLX del modelo de embeddings `harims95/hobbylm-embed-140m`, desarrollado por Hariharan M. S. y Prabhurajhan R. Se trata de un modelo de extracción de características y similitud semántica de aproximadamente 140 millones de parámetros que genera embeddings de 512 dimensiones normalizados en L2. Su propósito es servir como codificador de frases para tareas de recuperación, RAG, clustering y clasificación semántica.

La particularidad de esta versión es su orientación a Apple Silicon: los pesos se distribuyen en float16 (el router de expertos y su sesgo de selección permanecen en float32) y se ejecutan mediante la librería MLX, lo que permite inferencia nativa en chips de la serie M sin necesidad de CUDA. El modelo base emplea una arquitectura de mezcla de expertos (MoE), un detalle poco habitual en modelos de embeddings de este tamaño.

Es relevante para desarrolladores que trabajan en entornos macOS y necesitan un codificador de frases ligero, con licencia Apache-2.0 y una ventana de contexto configurable de 512 a 2.048 tokens. El repositorio es pequeño (0,3 GB) y la conversión está validada contra Sentence Transformers con una coincidencia prácticamente exacta en float32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según tags del modelo; detalles de capas y expertos no disponibles |
| Parametros totales | 139.983.200 |
| Parametros activos | no disponible |
| Longitud de contexto | 512 tokens por defecto; ampliable a 2.048 tokens mediante `max_seq_length` |
| Tipos de cuantizacion | float16 (pesos); router y sesgo de selección en float32; `quant.json` indica `{"bits": null, "dtype": "float16"}` |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, float16, 280 MB); incluye `hobbylm_mlx.py` con el modelo y el codificador |
| Dimension del embedding | 512 (normalizado L2) |
| Libreria | mlx |
| Pipeline | sentence-similarity / feature-extraction |

## Arquitectura y entrenamiento
El modelo base es un codificador de frases con arquitectura de mezcla de expertos (MoE), según las etiquetas declaradas en el repositorio. La versión MLX replica los mismos pesos en float16, manteniendo el router de expertos y su sesgo de selección en float32 para preservar la precisión del enrutamiento. El codificador produce vectores de 512 dimensiones normalizados en L2, de modo que el producto escalar equivale directamente a la similitud coseno.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card documenta el uso de prompts asimétricos: `query: ` para consultas y `passage: ` para documentos en escenarios de búsqueda y RAG, mientras que para similitud, clustering y clasificación se emplea texto plano sin prefijo. La validación realizada en un Apple M4 con mlx 0.32.4 muestra que la salida en float32 coincide exactamente con Sentence Transformers (coseno 1.00000000) y que en float16 el coseno mínimo observado es 0.99965.

## Capacidades
- Generación de embeddings de frases de 512 dimensiones, normalizados en L2, listos para similitud coseno.
- Recuperación semántica y búsqueda densa mediante prompts asimétricos (`query` / `passage`).
- Similitud semántica entre pares de textos, clustering y clasificación sin prefijos de prompt.
- Extracción de características para pipelines de NLP descendentes.
- Procesamiento de documentos largos de hasta 2.048 tokens configurando `max_seq_length`.
- Inferencia nativa en Apple Silicon mediante MLX, sin dependencia de CUDA.
- Soporte monolingüe en inglés.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio; es un modelo exclusivamente de embeddings.

## Casos de uso
- Búsqueda semántica en documentación técnica: indexar los fragmentos como `passage` y las consultas de los usuarios como `query`, usando la similitud coseno de los vectores de 512 dimensiones para recuperar los pasajes más relevantes.
- RAG sobre base documental en inglés: generar embeddings de los chunks (hasta 2.048 tokens por chunk) y almacenarlos en una base vectorial para alimentar un LLM generador con contexto recuperado.
- Deduplicación y clustering de tickets de soporte: codificar los tickets en texto plano y agrupar por similitud para identificar incidencias recurrentes sin etiquetado previo.
- Clasificación de textos por similitud con prototipos: calcular el embedding de cada categoría y asignar la clase más cercana a cada documento entrante, útil para triaje de correos o moderación.
- Desarrollo local en macOS: prototipar y validar pipelines de recuperación directamente en un Mac con chip M4 antes de desplegarlos en servidores, gracias a la paridad verificada con Sentence Transformers.
- Sistemas de recomendación basados en contenido: comparar la similitud entre descripciones de productos o artículos para sugerir elementos relacionados.
- Búsqueda de preguntas frecuentes: emparejar la consulta del usuario con la FAQ más próxima semánticamente en lugar de depender de coincidencia exacta de palabras.

## Benchmarks y rendimiento
La model card indica que el modelo fue evaluado en MTEB(eng, v2) con una longitud de entrada de 512 tokens, pero no se publican los valores numéricos de los resultados en la información disponible.

| Benchmark | Resultado |
|---|---|
| MTEB(eng, v2) | no disponible (evaluado a 512 tokens según la model card, sin cifras publicadas) |
| Paridad float32 vs. Sentence Transformers | coseno 1.00000000 en Apple M4 |
| Paridad float16 vs. Sentence Transformers | coseno mínimo 0.99965 en Apple M4 |

## Requisitos de hardware
- VRAM/ memoria unificada: los pesos en float16 ocupan 280 MB; el repositorio completo es de 0,3 GB, por lo que la inferencia cabe holgadamente en cualquier Mac con chip de la serie M.
- GPU recomendadas: Apple Silicon (probado en M4 con macOS 15.5 y mlx 0.32.4). No se documenta soporte para GPU NVIDIA ni CUDA en esta versión.
- GPU de consumo: sí, cabe en cualquier equipo Apple Silicon; no aplica a GPUs de consumo NVIDIA por la dependencia de MLX.
- Despliegue: librería MLX con el módulo `hobbylm_mlx.py` incluido en el repositorio; dependencias `mlx`, `tokenizers`, `numpy` y `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles. El tamaño reducido (140 M de parámetros) sugiere una inferencia rápida en hardware Apple Silicon, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HobbyLM-Embed-140M (MLX) | 140 M | 512 (hasta 2.048) | 512 | Apache-2.0 | Hugging Face, MLX |
| HobbyLM-Embed-140M (base) | 140 M | 512 (hasta 2.048) | 512 | Apache-2.0 | Hugging Face |
| Alternativas de embeddings de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias
- Modelo monolingüe: solo soporta inglés; su uso con textos en castellano u otros idiomas no está validado y probablemente degrade la calidad de los embeddings.
- Ventana de contexto por defecto de 512 tokens; los documentos más largos requieren configurar `max_seq_length` hasta 2.048, y no se documenta el comportamiento más allá de ese límite.
- Arquitectura MoE en un modelo de embeddings: el enrutamiento entre expertos introduce una fuente adicional de variabilidad; la model card solo garantiza la paridad numérica con Sentence Transformers en las pruebas realizadas.
- Dependencia de MLX: esta variante no es portable a entornos CUDA o CPU estándar sin recurrir al modelo base.
- Riesgo de alucinación no aplicable en sentido generativo (no produce texto), pero sí puede producir similitudes engañosas en dominios muy especializados o con vocabulario fuera de distribución.
- No se documentan sesgos específicos del dataset de entrenamiento; al ser un modelo en inglés, puede heredar sesgos culturales y lingüísticos de sus datos.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se recomienda conservar los avisos de licencia y atribución.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy reducido, sin validación comunitaria independiente.
- No se documentan garantías de soporte ni mantenimiento a largo plazo por parte de los autores.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/harims95/hobbylm-embed-140m-mlx
- Modelo base: https://huggingface.co/harims95/hobbylm-embed-140m
- Librería MLX: https://github.com/ml-explore/mlx
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.

# juliensimon/Octen-Embedding-0.6B-mlx-bf16

## Resumen

Octen-Embedding-0.6B-mlx-bf16 es la conversión a MLX del modelo de embeddings Octen/Octen-Embedding-0.6B, un transformer denso de 595.776.512 parámetros (0,6B) afinado a partir de Qwen/Qwen3-Embedding-0.6B para tareas de recuperación de información, búsqueda semántica, clustering y similitud de texto. La conversión la firma juliensimon y no es una publicación oficial de Octen: los pesos son de Octen y Qwen, y la licencia Apache 2.0 se mantiene en las tres piezas. El repositorio pesa 1,2 GB en disco y guarda los pesos en bfloat16 sin cuantizar.

El modelo genera embeddings de 1024 dimensiones con una ventana de contexto de 32K tokens y cubre, según la model card, más de 100 idiomas, con etiquetas declaradas para inglés, chino y multilingüe. No requiere prefijo de instrucción: consultas y documentos se codifican de la misma forma, y el vector resultante es el estado oculto del último token, normalizado, igual que en el modelo original.

Su relevancia práctica es que permite ejecutar un modelo de recuperación de 0,6B de forma nativa en Apple Silicon mediante la librería mlx-embeddings, sin depender de CUDA, con variantes de 8 y 4 bits que reducen el peso a 0,6 GB y 0,3 GB respectivamente. En la prueba de recuperación publicada por el autor, la variante de 0,6B en bf16 alcanza un top-1 del 67,1 %, frente al 72,4 % del 4B y el 78,2 % del 8B de la misma familia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3 adaptado a embeddings (pooling del último token, salida normalizada) |
| Parametros totales | 595.776.512 (0,6B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32K tokens (32.768) según la model card; los ejemplos de uso truncan a 1024 tokens |
| Tipos de cuantizacion | bf16 sin cuantizar (este repositorio); 8-bit affine con group size 64; 4-bit affine con group size 64 |
| Idiomas soportados | en, zh, multilingual (más de 100 idiomas según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx-embeddings) |
| Dimension del embedding | 1024 |
| Modelo base | Octen/Octen-Embedding-0.6B (fine-tune de Qwen/Qwen3-Embedding-0.6B) |
| Pipeline | feature-extraction |
| Tamano del repositorio | 1,2 GB (bf16); 0,6 GB en 8-bit; 0,3 GB en 4-bit |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen3 reutilizado como modelo de embeddings: no genera texto, sino que proyecta la secuencia de entrada en un único vector de 1024 dimensiones tomando el estado oculto del último token y normalizándolo. El modelo base es Octen/Octen-Embedding-0.6B, un fine-tune de Qwen/Qwen3-Embedding-0.6B orientado a retrieval, y esta conversión no altera los pesos más allá del cambio de formato a bfloat16 para MLX.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; la model card del repositorio convertido solo indica que se trata de un fine-tune para recuperación. Tampoco se documenta ninguna innovación de decodificación (atención lineal, decodificación especulativa) porque el uso previsto es la extracción de embeddings, no la generación autoregresiva. La conversión sí introduce un detalle técnico relevante: como el cálculo se hace en bfloat16, el autor recomienda renormalizar los vectores en float32 antes de calcular similitudes de coseno.

## Capacidades

- Generación de embeddings de texto de 1024 dimensiones para similitud semántica y búsqueda vectorial.
- Recuperación multilingüe: una consulta en francés puede recuperar un artículo en inglés, y una consulta en neerlandés localiza el artículo correspondiente, según los ejemplos de la model card.
- Codificación simétrica de consultas y documentos sin prefijo de instrucción.
- Procesamiento de entradas de hasta 32K tokens (los ejemplos truncan a 1024 tokens por defecto).
- Soporte de batching con padding y truncation mediante el tokenizer de mlx-embeddings.
- Ejecución nativa en Apple Silicon (MLX) con variantes bf16, 8-bit y 4-bit.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícito: es un modelo de extracción de features, no un modelo generativo.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar artículos de ayuda y recuperar el más relevante para una consulta del usuario; en la prueba del autor, el top-1 es del 67,1 % con este tamaño, suficiente para un primer filtrado antes de un re-ranking con el 4B u 8B.
- Atención al cliente con base de conocimiento multilingüe: el modelo permite que una consulta en francés o neerlandés recupere el artículo original en inglés, lo que evita mantener traducciones duplicadas del corpus.
- Deduplicación y clustering de tickets de soporte: agrupar incidencias por similitud de coseno sobre los embeddings para detectar problemas recurrentes y priorizar el backlog.
- Detección de duplicados en catálogos de contenido: comparar títulos y descripciones para marcar fichas repetidas antes de publicarlas.
- Enrutado de consultas a colas o equipos: clasificar un mensaje entrante por similitud con descripciones de categorías previamente embebidas, sin entrenar un clasificador adicional.
- Prototipado local en un Mac: validar una arquitectura RAG completa en un portátil Apple Silicon con 0,3-1,2 GB de pesos, antes de mover el pipeline a un servidor con modelos mayores.
- Filtrado previo en pipelines de RAG: recuperar 20-50 candidatos con el 0,6B y reordenarlos con una variante de 4B u 8B, reduciendo el coste computacional del re-ranking.

## Benchmarks y rendimiento

La model card solo publica un experimento de recuperación: 170 tickets de soporte en inglés, francés, neerlandés y alemán, cada uno redactado a partir de uno de 140 artículos de ayuda en inglés, midiendo si el artículo correcto aparece en el top-1. No hay resultados de MMLU, HumanEval, GSM8K ni MTEB en la información disponible.

| Modelo (MLX bf16) | Dimensiones | Top-1 en el test | Tiempo para 318 textos (M3 Max 48 GB) |
|---|---|---|---|
| Octen-Embedding-0.6B | 1024 | 67,1 % | 5-6 s |
| Octen-Embedding-4B | 2560 | 72,4 % | 35-55 s |
| Octen-Embedding-8B | 4096 | 78,2 % | 70-80 s |

El tiempo corresponde a 178 tickets más 140 artículos, en lotes de 8 textos y hasta 1024 tokens por texto, medido el 21 de octubre de 2026 en un M3 Max de 48 GB. La cuantización redujo disco y memoria pero no aceleró la inferencia en esas pruebas.

## Requisitos de hardware

- VRAM/memoria unificada: 1,2 GB de pesos en bf16, 0,6 GB en 8-bit y 0,3 GB en 4-bit; hay que sumar activaciones y buffers del tokenizer, que la información disponible no cuantifica.
- Plataforma: exclusivamente Apple Silicon; MLX no se ejecuta en GPU NVIDIA ni AMD.
- Cabe en cualquier Mac con memoria unificada suficiente para el modelo y el lote; el autor midió en un M3 Max de 48 GB, pero no publica requisitos mínimos.
- Despliegue: librería mlx-embeddings (`pip install mlx-embeddings`). No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama para este repositorio concreto.
- Throughput medido: 318 textos en 5-6 s en bf16 sobre M3 Max 48 GB, con lotes de 8 textos y hasta 1024 tokens.
- Para otros runtimes hay que acudir al repositorio original Octen/Octen-Embedding-0.6B; la información disponible no detalla qué frameworks lo soportan.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Top-1 (test del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Octen-Embedding-0.6B (este, MLX bf16) | 0,6B | 1024 | 32K | 67,1 % | Apache 2.0 | MLX, bf16/8-bit/4-bit |
| Octen-Embedding-4B (MLX) | 4B | 2560 | no disponible | 72,4 % | Apache 2.0 | MLX, bf16/8-bit/4-bit |
| Octen-Embedding-8B (MLX) | 8B | 4096 | no disponible | 78,2 % | Apache 2.0 | MLX, bf16/8-bit/4-bit |
| Qwen3-Embedding-0.6B | 0,6B | no disponible | no disponible | no disponible | Apache 2.0 | safetensors originales |

La comparación con alternativas de otros fabricantes (por ejemplo, embeddings de 0,5-1B de otras familias) no está disponible en la información proporcionada: no hay resultados MTEB ni datos de contexto que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Conversión comunitaria: no es una release oficial de Octen, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación externa es prácticamente nula.
- Ámbito de plataforma: los pesos MLX solo funcionan en Apple Silicon; no sirven para servidores con GPU NVIDIA.
- Precisión limitada por tamaño: el top-1 del 67,1 % en el test del autor queda 5,3 puntos por debajo del 4B y 11,1 puntos por debajo del 8B, lo que desaconseja usarlo como único recuperador en dominios exigentes.
- Test de evaluación reducido: 170 tickets y 140 artículos de un único conjunto de desarrollo; no es un benchmark público ni reproduce MTEB.
- Cálculo en bfloat16: si no se renormalizan los vectores en float32, las similitudes de coseno pueden desviarse; el autor lo advierte explícitamente en el ejemplo de uso.
- Sin prefijo de instrucción: añadir instrucciones al estilo de otros modelos de embeddings puede degradar los resultados, ya que la model card original pide no usarlo.
- Idiomas: las etiquetas solo declaran en, zh y multilingual; la afirmación de más de 100 idiomas proviene de la model card y no está respaldada por una evaluación publicada.
- Contexto: aunque se anuncian 32K tokens, todos los ejemplos y la medición del autor truncan a 1024 tokens, por lo que el rendimiento más allá de esa longitud no está verificado.
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial, pero conviene mantener la atribución a Octen y Qwen.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de recuperación incorrecta cuando el corpus contiene pasajes léxicamente próximos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-bf16
- Variante 8-bit: https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-8bit
- Variante 4-bit: https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-4bit
- Variante 4B (bf16): https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-bf16
- Variante 8B (bf16): https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-bf16
- Modelo base: https://huggingface.co/Octen/Octen-Embedding-0.6B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Repositorio MLX: https://github.com/ml-explore/mlx
- Sitio de Octen: https://octen.ai/
- Paper referenciado en las etiquetas: https://arxiv.org/abs/2506.05176

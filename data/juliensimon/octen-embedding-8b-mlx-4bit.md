# juliensimon/Octen-Embedding-8B-mlx-4bit

## Resumen

Octen-Embedding-8B-mlx-4bit es la conversión a MLX del modelo de embeddings Octen/Octen-Embedding-8B, un transformer denso de 7.567.295.488 parámetros (8B) derivado de Qwen/Qwen3-Embedding-8B y ajustado por el equipo de Octen para tareas de recuperación de información. Esta variante concreta la publica el usuario juliensimon como conversión comunitaria (no oficial) con cuantización afín de 4 bits y tamaño de grupo 64, lo que deja el repositorio en 4,3 GB y permite ejecutarlo de forma nativa en Apple Silicon mediante la librería mlx-embeddings.

El modelo resuelve el problema de generar embeddings de texto de 4096 dimensiones para búsqueda semántica, recuperación, agrupamiento y similitud, con una ventana de contexto de 32K tokens y cobertura declarada de más de 100 idiomas (etiquetado oficial: en, zh, multilingüe). Su relevancia práctica está en que permite llevar un modelo de recuperación de 8B a un portátil con memoria unificada, a costa de una pérdida medible de calidad frente a bf16: una coseno medio de 0,97 y una caída de 1,7 puntos (3 tickets) en top-1 de recuperación en el test del autor.

La ficha se basa exclusivamente en la model card y en los metadatos de HuggingFace. La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo (solo contenido de Reddit sin relación), por lo que no hay información externa adicional que contrastar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) basado en Qwen3, ajustado para retrieval; sin prefijo de instrucción |
| Parámetros totales | 7.567.295.488 (7,57B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32K tokens |
| Tipos de cuantización | 4 bits afín (affine), tamaño de grupo 64 (este repo); variantes bf16 y 8 bits afín grupo 64 en repos hermanos |
| Idiomas soportados | en, zh, multilingüe; la model card declara más de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |
| Dimensión del embedding | 4096 |
| Pooling | Último token oculto, normalizado L2 |
| Tamaño del repositorio | 4,3 GB |
| Librería / runtime | mlx-embeddings (MLX, Apple Silicon) |
| Pipeline | feature-extraction |
| Modelo base | Octen/Octen-Embedding-8B (a su vez fine-tune de Qwen/Qwen3-Embedding-8B) |
| Precisión de cálculo | bf16 (se recomienda renormalizar en float32) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8B parámetros de la familia Qwen3, reconvertido en modelo de embeddings: la representación se obtiene del estado oculto del último token, normalizado, y se proyecta a 4096 dimensiones. La model card indica explícitamente que el modelo original no requiere prefijo de instrucción, de modo que consultas y documentos se embeben de la misma forma, lo que simplifica la asimetría típica de los pipelines de retrieval. El contexto máximo es de 32K tokens, aunque todos los ejemplos de uso recortan a 1024 tokens por texto.

El ajuste para recuperación lo realizó el equipo de Octen sobre Qwen/Qwen3-Embedding-8B. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación: **no disponible**. Esta variante no altera la arquitectura, solo la precisión: cuantización afín de 4 bits con grupo de 64 sobre los pesos originales, ejecutada con kernels MLX. La conversión es comunitaria y no ha sido validada por Octen.

## Capacidades

- Generación de embeddings de texto de 4096 dimensiones para búsqueda semántica, recuperación (retrieval), agrupamiento (clustering) y similitud entre textos.
- Recuperación multilingüe cruzada: los ejemplos de la model card muestran una consulta en francés recuperando un artículo en inglés y una consulta en neerlandés recuperando el artículo correcto sobre facturación.
- Similitud semántica entre frases y detección de pares relacionados frente a pares no relacionados (el ejemplo descarta una frase sobre pasta carbonara).
- Procesamiento por lotes con padding y truncation, hasta 1024 tokens por texto en los ejemplos publicados y hasta 32K tokens de contexto según especificación.
- Ejecución nativa en Apple Silicon (MLX) sin dependencia de CUDA ni de PyTorch.
- No es un modelo generativo: no produce texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso. Cualquier uso agéntico requiere emparejarlo con un LLM generador.

## Casos de uso

- **Búsqueda semántica multilingüe en documentación técnica**: indexar artículos y permitir consultas en francés, neerlandés o alemán que recuperen el documento en inglés, como demuestra el ejemplo de la model card con las consultas sobre logs de webhook y facturas.
- **RAG sobre bases de conocimiento de soporte**: embeber tickets resueltos y artículos de ayuda para recuperar los fragmentos relevantes antes de pasarlos a un LLM generador; el test del autor con 178 tickets y 140 artículos es precisamente ese escenario.
- **Enrutado y triaje de tickets**: calcular la similitud entre un ticket entrante y los grupos de resolución existentes para asignarlo al equipo adecuado sin entrenar un clasificador supervisado.
- **Deduplicación y agrupamiento de contenido**: agrupar preguntas frecuentes, incidencias o artículos casi idénticos usando similitud coseno sobre los embeddings de 4096 dimensiones.
- **Búsqueda local con privacidad de datos**: al ejecutarse en un Mac con MLX, permite indexar y consultar documentación sensible sin enviar texto a una API externa.
- **Motor de recomendación basado en contenido**: embeber catálogo y perfil de usuario para recuperar ítems semánticamente próximos cuando no hay historial de interacciones suficiente para filtrado colaborativo.
- **Evaluación de calidad de bases de conocimiento**: detectar artículos huérfanos o duplicados midiendo la distribución de similitudes dentro del corpus.

## Benchmarks y rendimiento

Los únicos datos publicados son un test interno de recuperación del autor de la conversión (tickets de soporte en inglés, francés, neerlandés y alemán frente a un corpus de 140 artículos), medido el 21 de octubre de 2026 en un M3 Max con 48 GB. No hay resultados de MMLU, HumanEval, GSM8K ni MTEB en la información disponible.

| Métrica | 0.6B | 4B | 8B (bf16) | 8B (4 bits) |
|---|---|---|---|---|
| Top-1 en el test de recuperación | 67,1 % | 72,4 % | 78,2 % | ~76,5 % (derivado: caída de 1,7 puntos) |
| Tiempo para embeber 318 textos | 5-6 s | 35-55 s | 70-80 s | 70-80 s |
| Dimensión del embedding | 1024 | 2560 | 4096 | 4096 |

Notas sobre las cifras: los tiempos corresponden a 8 textos por lote, hasta 1024 tokens cada uno, y son un rango sobre las tres variantes de precisión; la cuantización no aceleró el embedding en estas pruebas. La similitud coseno media de esta variante de 4 bits frente a bf16 es de 0,97. El top-1 del 4 bits no se publica de forma explícita: se deduce de la caída declarada de 3 tickets (1,7 puntos). La model card cita el corpus como "178 tickets y 140 artículos" en una tabla y como "170 support tickets" en el texto, discrepancia que no se aclara.

## Requisitos de hardware

- **VRAM/memoria**: pesos de 4,3 GB en esta variante de 4 bits; 8,0 GB en la de 8 bits; 15,1 GB en bf16. La memoria pico durante la inferencia (activaciones, buffers de lote) no está publicada.
- **Hardware objetivo**: Apple Silicon con MLX. Las mediciones se hicieron en un M3 Max con 48 GB de memoria unificada.
- **GPU NVIDIA**: no soportadas por este repositorio, que depende de MLX. Para CUDA hay que usar los pesos originales de Octen/Octen-Embedding-8B o Qwen3-Embedding-8B con PyTorch, vLLM o TGI (no se han publicado requisitos para esos caminos en esta información).
- **Cabe en hardware de consumo**: sí, en equipos Apple Silicon; con 4,3 GB de pesos es viable en configuraciones de 16-24 GB de memoria unificada, aunque no hay pruebas publicadas en esos equipos.
- **Opciones de despliegue**: mlx-embeddings (única vía documentada). No hay GGUF en este repositorio, por lo que llama.cpp y Ollama no están soportados directamente; tampoco vLLM ni TGI.
- **Throughput estimado**: 318 textos en 70-80 s en M3 Max con lotes de 8 y hasta 1024 tokens, es decir, aproximadamente 4,0-4,5 textos por segundo para la variante de 8B. Las variantes de 0.6B y 4B van entre 5 y 6 s y entre 35 y 55 s para el mismo lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Top-1 (test del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Octen-Embedding-8B-mlx-4bit (este) | 7,57B | 32K | 4096 | ~76,5 % | Apache 2.0 | MLX, 4,3 GB |
| Octen-Embedding-8B-mlx-8bit | 7,57B | 32K | 4096 | No publicado (más cercano a bf16) | Apache 2.0 | MLX, 8,0 GB |
| Octen-Embedding-8B-mlx-bf16 | 7,57B | 32K | 4096 | 78,2 % | Apache 2.0 | MLX, 15,1 GB |
| Octen-Embedding-4B (MLX) | 4B (aprox.) | No disponible | 2560 | 72,4 % | Apache 2.0 | MLX, varias precisiones |
| Octen-Embedding-0.6B (MLX) | 0,6B (aprox.) | No disponible | 1024 | 67,1 % | Apache 2.0 | MLX, 5-6 s para 318 textos |
| Qwen/Qwen3-Embedding-8B | No disponible en esta información | No disponible | No disponible | No disponible | Apache 2.0 | Pesos originales |

No se dispone de datos de benchmarks ni de especificaciones de alternativas de otros fabricantes (BGE, E5, GTE, EmbeddingGemma u otras) en la información proporcionada, por lo que la comparación se limita a la propia familia.

## Limitaciones y advertencias

- **Pérdida de calidad por cuantización**: coseno medio de 0,97 frente a bf16 y caída de 1,7 puntos en top-1. El propio autor recomienda usar la variante de 8 bits o bf16 cuando la memoria lo permita, y validar sobre datos propios.
- **Conversión no oficial**: los pesos son de Octen, pero la conversión MLX la firma un tercero (juliensimon) y no ha sido validada por el equipo del modelo. No hay garantía de soporte.
- **Sesgos**: no se documenta ninguna evaluación de sesgos, toxicidad ni equidad en la información disponible.
- **Alucinación**: al ser un modelo de embeddings no genera texto, pero puede producir recuperaciones erróneas con alta similitud coseno; no hay umbrales de confianza publicados.
- **Cobertura idiomática desigual**: el etiquetado oficial solo lista en y zh, pese a la afirmación de más de 100 idiomas. El rendimiento fuera de esos idiomas no está medido; los ejemplos en francés y neerlandés son anecdóticos, no una evaluación.
- **Contexto real en los ejemplos**: aunque la ventana es de 32K tokens, todos los ejemplos truncan a 1024 tokens, que es el régimen en el que se midió el rendimiento.
- **Dependencia de plataforma**: MLX solo funciona en Apple Silicon; no hay ruta CUDA, ROCm ni CPU documentada para este repositorio.
- **Sin validación comunitaria**: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de terceros.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base (Octen/Octen-Embedding-8B y Qwen3-Embedding-8B), también Apache 2.0 según la model card.
- **Normalización**: el cálculo se hace en bf16, por lo que se recomienda renormalizar los vectores en float32 antes de calcular similitudes, tal como indica el ejemplo del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-4bit
- Modelo base: https://huggingface.co/Octen/Octen-Embedding-8B
- Modelo del que deriva el base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Variante bf16: https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-bf16
- Variante 8 bits: https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-8bit
- Variante 4B bf16: https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-bf16
- Variante 0.6B bf16: https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-bf16
- Repositorio de MLX: https://github.com/ml-explore/mlx
- Sitio del desarrollador del modelo base: https://octen.ai/
- Paper de referencia (etiqueta arxiv:2506.05176): https://arxiv.org/abs/2506.05176
- Búsqueda web: sin resultados relevantes sobre el modelo; los enlaces devueltos (hilos de Reddit sin relación) se descartan por no aportar información técnica.

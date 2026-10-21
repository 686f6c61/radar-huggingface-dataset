# juliensimon/Octen-Embedding-4B-mlx-bf16

## Resumen

Octen-Embedding-4B es un modelo de embeddings de texto de 4.021.774.336 parámetros (4,02 B) construido sobre Qwen3-Embedding-4B y afinado por el equipo de Octen para tareas de recuperación de información. Genera vectores densos de 2560 dimensiones con una ventana de contexto de 32.000 tokens, y está pensado para búsqueda semántica, retrieval, clustering y similitud entre textos. La ficha que nos ocupa no es el modelo original, sino la conversión a formato MLX en bfloat16 publicada por el usuario juliensimon para ejecutarlo de forma nativa en Apple Silicon.

El interés de esta variante es práctico: elimina la dependencia de CUDA y permite correr un modelo de embeddings de 4B en un Mac con memoria unificada, sin cuantizar (8,0 GB de pesos en disco). El autor publica además versiones de 8 bits (4,3 GB) y 4 bits (2,3 GB) con cuantización afín y group size 64, y conversiones equivalentes de las tallas 0,6B y 8B, lo que permite escalar la calidad en función del hardware disponible.

Es relevante ahora porque el ecosistema de recuperación local en Apple Silicon carecía de opciones de este tamaño listas para usar, y porque el modelo base mantiene licencia Apache 2.0 tanto en origen como en la conversión. Conviene subrayar que es una conversión de la comunidad, no un lanzamiento oficial de Octen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3, adaptado a embeddings (último estado oculto, normalizado); sin cabecera generativa |
| Parametros totales | 4.021.774.336 (4,02 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens (32K) |
| Tipos de cuantizacion | bf16 sin cuantizar (esta variante); 8-bit afín con group size 64; 4-bit afín con group size 64 |
| Idiomas soportados | 100+ idiomas según la model card; los tags declaran en, zh y multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX; repositorio de 8,1 GB) |
| Dimension de embedding | 2560 |
| Libreria de inferencia | mlx-embeddings |
| Modelo base | Octen/Octen-Embedding-4B (fine-tune de Qwen/Qwen3-Embedding-4B) |
| Normalizacion | embeddings L2-normalizados; se recomienda renormalizar en float32 tras calcular en bf16 |
| Prefijo de instruccion | no requiere (queries y documentos se codifican igual) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-Embedding-4B: un transformer decoder de 4B parámetros del que se extrae el estado oculto del último token como representación del texto, seguido de normalización L2. Octen parte de esos pesos y los afina para recuperación (el tag del repositorio indica `base_model:finetune`). El modelo no genera texto: la salida es exclusivamente el vector de 2560 dimensiones.

Los detalles concretos del entrenamiento de Octen (número de tokens, composición del dataset, uso de RLHF/DPO o de pares positivos/negativos, función de pérdida) no están disponibles en la información proporcionada. Lo que sí documenta el autor de la conversión es la metodología de validación: un conjunto de 170 tickets de soporte en inglés, francés, neerlandés y alemán, cada uno derivado de uno de 140 artículos de ayuda en inglés, y se mide si el artículo correcto aparece en el top-k de resultados recuperados. La innovación técnica de esta ficha es la conversión en sí: pesos bfloat16 sin cuantizar empaquetados para MLX, ejecutables de forma nativa en Apple Silicon con `mlx-embeddings`, sin cambios en el pipeline de embedding respecto al original.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y recuperación densa (dense retrieval).
- Similitud entre frases (sentence similarity) y detección de duplicados o near-duplicates.
- Clustering y agrupamiento de documentos por similitud de vectores.
- Recuperación multilingüe cruzada: una consulta en francés puede recuperar un artículo en inglés, y una en neerlandés otro del mismo corpus, según los ejemplos de la model card.
- Extracción de características (`pipeline_tag: feature-extraction`) con ventana de hasta 32K tokens, útil para documentos largos sin trocear en exceso.
- Soporte de textos largos por encima de los 1024 tokens usados en los ejemplos (hasta el límite de contexto).
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni para razonamiento multi-paso; es un componente de un pipeline RAG, no el generador.
- No dispone de modo "thinking" ni de instrucciones de sistema; el modelo original pide explícitamente no usar prefijo de instrucción.

## Casos de uso

- Búsqueda semántica en bases de conocimiento internas: indexar artículos de ayuda, wikis o documentación en 2560 dimensiones y recuperar por similitud coseno. Los 32K tokens de contexto permiten indexar secciones completas sin fragmentar en chunks pequeños.
- RAG sobre corpus multilingües: el modelo vectoriza consultas y documentos en el mismo espacio, de modo que un usuario que pregunta en francés o neerlandés recupera documentación en inglés, como demuestra el ejemplo de la model card con webhooks y facturas.
- Atención al cliente asistida: el test del autor usa 170 tickets reales contra 140 artículos; la precisión top-1 del 72,4 % en la variante de 4B indica que es viable como primera etapa de recuperación, con reranking posterior para producción.
- Deduplicación y clustering de tickets o incidencias: agrupar tickets de soporte por similitud para detectar problemas recurrentes y enrutarlos al equipo adecuado.
- Moderación y clasificación semántica por umbral: comparar embeddings de textos entrantes contra un conjunto de referencias etiquetadas y decidir por distancia, sin entrenar un clasificador adicional.
- Búsqueda local y privada en un Mac: al ejecutarse con MLX sobre Apple Silicon, permite indexar documentación sensible sin enviar texto a una API externa, algo relevante para equipos con requisitos de confidencialidad.
- Prototipado rápido de sistemas de recuperación en portátiles: la variante de 4 bits (2,3 GB) hace viable iterar sobre un MacBook antes de desplegar la versión completa en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, MTEB, BEIR, HumanEval, GSM8K) en la información disponible. Los únicos datos cuantitativos provienen del test privado del autor de la conversión:

| Metrica | 0.6B | 4B (esta ficha) | 8B |
|---|---|---|---|
| Dimension de embedding | 1024 | 2560 | 4096 |
| Precision top-1 en recuperación (MLX bf16) | 67,1 % | 72,4 % | 78,2 % |
| Tiempo para 318 textos (bf16, M3 Max 48 GB) | 5-6 s | 35-55 s | 70-80 s |

Condiciones del test: 178 tickets y 140 artículos, lotes de 8 textos, hasta 1024 tokens por texto, medido el 21 de octubre de 2026 en un M3 Max con 48 GB. El rango de tiempo cubre las tres variantes de cuantización. El autor indica que la cuantización redujo disco y memoria pero no aceleró el embedding en esas ejecuciones. No se proporcionan cifras comparativas con Qwen3-Embedding-4B original ni con otros modelos de embeddings.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon exclusivamente. Los pesos están en formato MLX y requieren `mlx-embeddings`; no son cargables con PyTorch, vLLM, TGI ni llama.cpp.
- Memoria unificada estimada para bf16: en torno a 10-12 GB considerando los 8,0 GB de pesos más activaciones y el texto de entrada (estimación a partir del tamaño del repositorio, no medida publicada).
- Memoria unificada estimada para 8 bits: en torno a 6 GB; para 4 bits: en torno a 4 GB (estimaciones basadas en los 4,3 GB y 2,3 GB de pesos).
- Cabe en equipos de consumo Apple: el autor verificó la variante bf16 de 4B en un M3 Max con 48 GB. Las variantes de 8 y 4 bits reducen el requisito y deberían caber en configuraciones de 16-24 GB de memoria unificada, aunque no hay medición publicada al respecto.
- GPU NVIDIA/AMD: no soportadas por esta conversión. Para CUDA habría que usar los pesos originales de Octen/Octen-Embedding-4B con la librería correspondiente (no documentado en la información disponible).
- Opciones de despliegue: `mlx-embeddings` con `load()` y tokenizador asociado; el patrón de uso es batch de textos, `max_length` configurable, salida `text_embeds` y renormalización en float32.
- Rendimiento medido: 35-55 s para 318 textos con bf16 en M3 Max, lotes de 8 y hasta 1024 tokens, lo que equivale aproximadamente a 6-9 textos por segundo (cálculo derivado de los datos del autor).
- Latencia y throughput en otras plataformas: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Precision top-1 (test del autor) | Licencia | Formato |
|---|---|---|---|---|---|---|
| Octen-Embedding-4B MLX bf16 (esta ficha) | 4,02 B | 2560 | 32K | 72,4 % | Apache 2.0 | MLX safetensors bf16 |
| Octen-Embedding-0.6B MLX bf16 | no disponible en la informacion | 1024 | no disponible | 67,1 % | Apache 2.0 | MLX safetensors bf16 |
| Octen-Embedding-8B MLX bf16 | no disponible en la informacion | 4096 | no disponible | 78,2 % | Apache 2.0 | MLX safetensors bf16 |
| Qwen3-Embedding-4B ( ancestro ) | 4 B (aproximado, no confirmado en la informacion) | 2560 | no disponible | no disponible | Apache 2.0 | safetensors |

Las tres tallas de Octen comparten licencia, familia y metodología de conversión, por lo que la elección entre ellas es un compromiso entre precisión de recuperación y memoria. La comparación de rendimiento frente a Qwen3-Embedding-4B original no está disponible: el autor solo valida la fidelidad de la conversión MLX contra su propia conversión bf16 de referencia, no contra los pesos en PyTorch.

## Limitaciones y advertencias

- Es una conversión de la comunidad (juliensimon), no un lanzamiento oficial de Octen; no hay garantía de soporte ni de mantenimiento por parte del equipo original.
- Los pesos solo funcionan en Apple Silicon con MLX: no hay rutas de despliegue en servidores NVIDIA, lo que limita su uso en producción a gran escala.
- El cálculo se realiza en bf16; la model card advierte explícitamente de que hay que renormalizar los embeddings en float32 para evitar degradación en la similitud coseno.
- La cifra de 72,4 % de top-1 procede de un test privado y reducido (170 tickets y 140 artículos de un único dominio de soporte técnico); no es extrapolable a todos los corpus ni sustituye a una evaluación MTEB/BEIR.
- El propio autor reconoce que la cuantización no aportó ganancias de velocidad en sus pruebas, solo ahorro de disco y memoria.
- No se han publicado datos de sesgos, tasas de alucinación (no aplica directamente, al no generar texto) ni evaluación por idioma más allá de la afirmación de "100+ idiomas".
- La cobertura multilingüe está respaldada por los tags (en, zh, multilingüe) y por ejemplos cualitativos en francés y neerlandés, pero no por métricas por idioma.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero la responsabilidad sobre la calidad del retrieval recae en quien despliega.
- Al no requerir prefijo de instrucción, no se puede condicionar el comportamiento del embedding por tipo de tarea (por ejemplo, distinguir consulta de documento) mediante prompts, a diferencia de otros modelos de embeddings.
- No apto para generación de texto ni para tareas de razonamiento: usarlo en un pipeline RAG exige un LLM generativo aparte.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-bf16
- Variante 8 bits: https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-8bit
- Variante 4 bits: https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-4bit
- Talla 0.6B: https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-bf16
- Talla 8B: https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-bf16
- Modelo base: https://huggingface.co/Octen/Octen-Embedding-4B
- Ancestro Qwen3: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Sitio de Octen: https://octen.ai/
- Librería MLX: https://github.com/ml-explore/mlx
- Paper referenciado en los tags del repositorio: arXiv:2506.05176 (https://arxiv.org/abs/2506.05176)
- No se han encontrado otros enlaces relevantes en la búsqueda web realizada.

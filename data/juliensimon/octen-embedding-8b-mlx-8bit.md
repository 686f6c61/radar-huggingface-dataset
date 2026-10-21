# juliensimon/Octen-Embedding-8B-mlx-8bit

## Resumen

Octen-Embedding-8B-mlx-8bit es la conversión comunitaria a MLX del modelo de embeddings Octen-Embedding-8B, publicada por el usuario juliensimon. Se trata de un transformer decoder-only de tipo Qwen3 con 8.000 millones de parámetros, afinado para recuperación de información (retrieval), que proyecta texto en 100+ idiomas a un espacio vectorial de 4.096 dimensiones con una ventana de contexto de 32K tokens. El modelo original lo desarrolla Octen a partir de Qwen/Qwen3-Embedding-8B, y esta variante aplica cuantización afín de 8 bits con grupo de 64, dejando el repositorio en 8,0 GB en disco frente a los 15,1 GB de la versión bf16.

La relevancia de esta ficha es doble. Por un lado, documenta una alternativa de embeddings multilingüe de gama alta para pipelines de búsqueda semántica, clustering y RAG. Por otro, es una conversión pensada exclusivamente para Apple Silicon: usa la librería `mlx-embeddings` y no es compatible con CUDA, vLLM ni llama.cpp. En la prueba interna del autor (170 tickets de soporte en inglés, francés, neerlandés y alemán contra 140 artículos de ayuda en inglés) el 8B en bf16 alcanza un top-1 del 78,2 %, frente al 72,4 % del 4B y el 67,1 % del 0.6B.

Es importante subrayar que no se trata de una publicación oficial de Octen, sino de una conversión de la comunidad, y que la model card no incluye resultados de benchmarks estándar (MMLU, MTEB, BEIR) ni datos sobre la pérdida de calidad introducida por la cuantización de 8 bits en comparación con bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) adaptado a embeddings; pooling sobre el estado oculto del último token, normalizado |
| Parámetros totales | 8.000 millones (8B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens (32K) |
| Dimensión del embedding | 4.096 |
| Tipos de cuantización | 8 bits afín, group size 64 (este repositorio); la familia incluye también bf16 sin cuantizar y 4 bits afín group size 64 |
| Idiomas soportados | 100+ idiomas; tags del repositorio: en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx-embeddings`); no hay GGUF ni pesos PyTorch en este repositorio |
| Tamaño en disco | 8,0 GB (repositorio: 8,1 GB); bf16: 15,1 GB; 4 bits: 4,3 GB |
| Prefijo de instrucción | No requiere prefijo: consultas y documentos se embeben de la misma forma |
| Modelo base | Octen/Octen-Embedding-8B, afinado desde Qwen/Qwen3-Embedding-8B |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3 en configuración densa de 8B, reutilizada como encoder de texto: no hay cabeza generativa, sino que se toma el estado oculto del último token, se normaliza y se devuelve como embedding de 4.096 dimensiones. El modelo original de Octen parte de Qwen/Qwen3-Embedding-8B y se afina específicamente para retrieval. La model card de esta conversión no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de preferencia (RLHF/DPO); esos datos corresponden a la documentación del modelo base y no se incluyen en la información disponible.

La innovación técnica de este repositorio es la conversión en sí: cuantización afín de 8 bits con tamaño de grupo 64 sobre pesos MLX, lo que reduce el peso de 15,1 GB a 8,0 GB. La model card advierte de un detalle relevante para producción: el modelo calcula en bf16, por lo que el vector de salida debe convertirse a float32 y renormalizarse antes de calcular similitudes coseno. El autor indica asimismo que la cuantización ahorró disco y memoria, pero no aceleró la inferencia en sus pruebas. La comparación de fidelidad entre la versión de 8 bits y la referencia bf16 aparece truncada en el material disponible, por lo que no se puede cuantificar la degradación.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica, recuperación densa, clustering, deduplicación y similitud entre frases.
- Recuperación multilingüe cruzada: una consulta en francés recupera un artículo en inglés, y una consulta en neerlandés encuentra el artículo de facturación correspondiente.
- Cobertura de 100+ idiomas según la model card, con inglés y chino destacados en los tags.
- Ventana de contexto de 32K tokens, útil para embeber documentos largos o conversaciones completas sin trocear.
- Embeddings de 4.096 dimensiones, adecuados para índices de alta precisión donde la dimensión no sea el cuello de botella.
- Inferencia nativa en Apple Silicon mediante `mlx-embeddings`, con API de `load` + `tokenizer` + `model(...).text_embeds`.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un modelo de extracción de características (`feature-extraction`), no un modelo generativo.

## Casos de uso

- Búsqueda semántica en documentación de producto: indexar la base de ayuda con el 8B y embeber las consultas de usuario en el mismo espacio, aprovechando la ventana de 32K para indexar artículos completos sin fragmentarlos.
- RAG sobre corpus multilingüe: el modelo permite que consultas en castellano, francés o neerlandés recuperen pasajes en inglés, lo que evita duplicar el índice por idioma en despliegues europeos.
- Soporte al cliente con recuperación de artículos: el escenario exacto medido por el autor (tickets contra artículos de ayuda) es directamente trasladable a un sistema de sugerencia de respuestas para agentes humanos.
- Deduplicación y clustering de tickets o incidencias: embeddings normalizados de 4.096 dimensiones permiten agrupar reportes similares por similitud coseno antes de asignarlos a un equipo.
- Construcción de datasets de evaluación de retrieval: al ser una conversión local y ligera (8 GB), sirve para generar ground truth y comparar recuperadores sin depender de APIs externas.
- Prototipado en portátiles Apple: desarrolladores con un Mac de memoria unificada pueden validar pipelines de embeddings completos en local antes de mover la carga a GPUs en producción con los pesos originales.
- Filtrado previo en pipelines de moderación o clasificación: usar la similitud contra un conjunto de textos de referencia etiquetados para un triaje rápido de contenido.

## Benchmarks y rendimiento

La información disponible solo incluye una evaluación interna de retrieval del propio autor, no benchmarks estándar. El test usa 170 tickets de soporte en inglés, francés, neerlandés y alemán, cada uno derivado de uno de 140 artículos de ayuda en inglés (conjunto de desarrollo de un taller sobre fine-tuning de modelos pequeños). La métrica es si el artículo correcto aparece en el top-k. Los resultados de top-1 corresponden a la variante MLX bf16:

| Modelo | Dimensión | Top-1 (retrieval) | Tiempo para 318 textos |
|---|---|---|---|
| Octen-Embedding-0.6B (MLX bf16) | 1.024 | 67,1 % | 5–6 s |
| Octen-Embedding-4B (MLX bf16) | 2.560 | 72,4 % | 35–55 s |
| Octen-Embedding-8B (MLX bf16) | 4.096 | 78,2 % | 70–80 s |

Medición realizada el 21 de octubre de 2026 en un M3 Max con 48 GB, con 8 textos por lote y hasta 1.024 tokens por texto. La tabla de tiempos emplea 178 tickets y 140 artículos, mientras que la descripción del test habla de 170 tickets: la model card no aclara la discrepancia. La comparación de fidelidad de la versión de 8 bits frente a la referencia bf16 está truncada en la información disponible, por lo que no se ha podido verificar. No se han publicado resultados de MMLU, MTEB, BEIR ni HumanEval en la información disponible.

## Requisitos de hardware

- VRAM/memoria: al menos ~8 GB solo para los pesos de esta variante de 8 bits; en la práctica se recomienda un mínimo de 16 GB de memoria unificada para contextos cortos y bastante más para lotes grandes o secuencias cercanas a 32K. Las cifras de memoria pico no están publicadas.
- Variantes según memoria: 4 bits (4,3 GB) para equipos ajustados; bf16 (15,1 GB) si se busca la referencia de calidad y se dispone de 32 GB o más.
- GPU: exclusivamente Apple Silicon (series M1, M2, M3, M4) mediante MLX. No funciona en A100, H100 ni RTX 4090 con este repositorio; para CUDA hay que usar los pesos originales de Octen o de Qwen3-Embedding-8B con sentence-transformers, TEI o el soporte de embeddings de vLLM.
- Cabe en GPU de consumo: en el ecosistema Apple, sí; el autor lo ejecutó en un M3 Max de 48 GB. En GPUs de consumo NVIDIA sería necesario convertir o usar los pesos originales, no esta conversión.
- Despliegue: `pip install mlx-embeddings` y carga directa del repositorio. No hay soporte de Ollama, llama.cpp, TGI ni vLLM para este formato.
- Rendimiento medido: 318 textos de hasta 1.024 tokens en 70–80 s con batch de 8 en un M3 Max de 48 GB, es decir, aproximadamente 4,0–4,5 textos por segundo. La model card indica que la cuantización no mejora la velocidad, solo el consumo de disco y memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión | Contexto | Licencia | Formato / plataforma | Datos de rendimiento |
|---|---|---|---|---|---|---|
| Octen-Embedding-8B-mlx-8bit (esta ficha) | 8B | 4.096 | 32K | Apache 2.0 | MLX safetensors, Apple Silicon | 78,2 % top-1 (bf16, test interno) |
| Octen-Embedding-8B (original) | 8B | 4.096 | 32K | Apache 2.0 | PyTorch safetensors, CUDA/CPU | No disponible en esta información |
| Octen-Embedding-4B (MLX) | 4B | 2.560 | No disponible en esta información | Apache 2.0 | MLX safetensors, Apple Silicon | 72,4 % top-1 (bf16, test interno) |
| Octen-Embedding-0.6B (MLX) | 0,6B | 1.024 | No disponible en esta información | Apache 2.0 | MLX safetensors, Apple Silicon | 67,1 % top-1 (bf16, test interno) |
| Qwen3-Embedding-8B (modelo de partida) | 8B | 4.096 | 32K | Apache 2.0 | PyTorch safetensors | No disponible en esta información |

La comparación con alternativas de otros fabricantes (BGE-M3, multilingual-e5, EmbeddingGemma u otras) no está disponible en la información proporcionada, y no se han incluido cifras que no aparezcan en la model card.

## Limitaciones y advertencias

- Es una conversión comunitaria, no una publicación oficial de Octen; el soporte y la validación dependen del autor del repositorio.
- Sin datos publicados sobre la pérdida de calidad de la cuantización de 8 bits frente a bf16: la sección de fidelidad de la model card está truncada en la información disponible.
- Solo funciona en Apple Silicon con MLX. No hay GGUF, no hay soporte de vLLM/TGI/llama.cpp y no se puede desplegar en CUDA con este repositorio.
- El modelo calcula en bf16 y devuelve el embedding en ese tipo: si se omiten la conversión a float32 y la renormalización, las similitudes coseno pueden desviarse.
- La evaluación publicada es un único test interno de retrieval asimétrico (consultas multilingües contra artículos en inglés) con 170 tickets y 140 artículos; no hay MTEB ni BEIR que permitan comparar con el estado del arte.
- La model card no detalla sesgos, composición del dataset de entrenamiento ni idiomas cubiertos con garantías; los 100+ idiomas son una afirmación del autor sin desglose por lengua.
- No requiere prefijo de instrucción, pero los ejemplos truncan a 1.024 tokens pese a que el contexto es de 32K: usar longitudes mayores exige validar el comportamiento del pooling del último token con padding.
- Al ser un modelo de embeddings no genera texto, por lo que no aplica el riesgo de alucinación generativa; el riesgo se traslada al sistema que consuma los vectores (recuperación de pasajes irrelevantes).
- Licencia Apache 2.0: permite uso comercial y modificaciones, con obligación de conservar avisos de licencia y atribución a Octen y Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-8bit
- Modelo base: https://huggingface.co/Octen/Octen-Embedding-8B
- Modelo de partida de Qwen: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Variante bf16: https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-bf16
- Variante 4 bits: https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-4bit
- Variantes 4B: https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-bf16 · https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-8bit · https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-4bit
- Variantes 0.6B: https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-bf16 · https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-8bit · https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-4bit
- Repositorio MLX: https://github.com/ml-explore/mlx
- Sitio de Octen: https://octen.ai/
- Paper referenciado en los tags: https://arxiv.org/abs/2506.05176

# Alibaba-NLP/UEmbed-4B

## Resumen

UEmbed-4B es un modelo de embeddings multimodales desarrollado por Alibaba-NLP que unifica la generación de representaciones densas y dispersas (SPLADE) en una única pasada forward. A diferencia de los modelos de retrieval tradicionales que requieren arquitecturas separadas para búsqueda densa y léxica, UEmbed emplea un backbone decoder-only basado en Qwen3.5 que produce ambos tipos de embeddings simultáneamente, soportando entradas de texto, imagen, vídeo y combinaciones mixtas.

El modelo resuelve el problema de la fragmentación en sistemas de búsqueda multimodal: los equipos que necesitan recuperar información relevante de documentos visuales, vídeos o texto deben elegir entre representaciones densas (semánticas) o dispersas (léxicas exactas). UEmbed-4B ofrece ambas desde un único checkpoint, simplificando el despliegue y permitiendo estrategias de fusión de resultados sin infraestructura adicional. Con 4.539 millones de parámetros, se sitúa en la gama media de la familia UEmbed, junto a las variantes de 2B y 9B.

Su relevancia actual radica en que alcanza resultados de última generación en los tracks de texto y agentes del benchmark MMEB-v3, y se posiciona como el segundo mejor modelo open-source en MMEB-v2, solo superado por la serie Qwen3-VL-Embedding. Además, su integración nativa con `transformers` y el soporte para vLLM facilitan su adopción en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only multimodal basado en Qwen3.5 |
| Parametros totales | 4.539.265.536 (4,5B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (depende del backbone Qwen3.5) |
| Tipos de cuantizacion | no disponible (no se documentan oficialmente) |
| Idiomas soportados | no disponible (el tokenizer de Qwen3.5 es multilingue, pero no se especifica) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

UEmbed-4B emplea un backbone decoder-only multimodal (Qwen3.5) que procesa texto, imágenes y vídeos. Para obtener la representación densa, se utiliza el estado oculto del token EOS antes de los tokens especiales dispersos. Para la representación dispersa, se añaden 16 tokens especiales, cada uno asociado a una cabeza lineal específica del subconjunto correspondiente. El vocabulario disperso se comprime desde las 248.320 entradas del tokenizer original hasta 184.016 entradas canónicas, y la activación dispersa se calcula como `log(1 + ReLU(logits))`.

El entrenamiento combina tres objetivos: una pérdida InfoNCE para la representación densa, otra InfoNCE para la dispersa y una regularización FLOPS que penaliza el coste computacional de las activaciones dispersas. Los datos de entrenamiento suman 3,94 millones de muestras públicas, procedentes de los conjuntos E5 (cobertura amplia de retrieval de texto), M3 (subconjunto MLDR) y MMEB (pares consulta-documento multimodales). Para las muestras multimodales, los hard negatives se extraen utilizando Qwen3-VL-Embedding-8B como modelo profesor. El diseño mantiene la compatibilidad con la inferencia causal típica de los modelos decoder-only, evitando la conversión a un encoder bidireccional.

## Capacidades

- Generación de embeddings densos normalizados para texto, imagen, vídeo y entradas mixtas, todos en el mismo espacio de representación.
- Generación de embeddings dispersos estilo SPLADE, con activaciones interpretables que corresponden a términos del vocabulario y que pueden indexarse en índices invertidos.
- Unificación de retrieval denso y disperso en una sola pasada forward, sin necesidad de modelos separados.
- Soporte de instrucciones opcionales por tarea para adaptar la representación al dominio específico (por ejemplo, "recuperar imágenes relevantes para la consulta del usuario").
- Compatibilidad con el pipeline de `transformers` (versión >= 5.4.0) sin necesidad de `trust_remote_code` ni parcheo del procesador.
- Backend vLLM disponible para inferencia de alto rendimiento tanto de embeddings densos como dispersos.
- Acepta múltiples formatos de entrada: rutas de archivo, URLs, objetos PIL.Image, listas de frames de vídeo, con control de fps y número máximo de frames.

## Casos de uso

- Busqueda multimodal en bases de conocimiento: un sistema puede indexar documentos que contienen texto, diagramas y capturas de vídeo, y recuperar los más relevantes a partir de consultas textuales o visuales. UEmbed-4B es adecuado porque unifica texto e imagen en un mismo espacio de representación, evitando la necesidad de modelos separados por modalidad.
- Recuperacion de documentos visuales (facturas, contratos escaneados): al procesar imágenes de documentos junto con su texto, el modelo permite buscar por contenido semántico o por términos exactos (gracias a los embeddings dispersos), mejorando la precision en dominios con vocabulario especializado.
- RAG multimodal para asistentes virtuales: un asistente puede recuperar pasajes relevantes de manuales técnicos que incluyan figuras o diagramas, combinando la busqueda densa (para captar intencion) con la dispersa (para coincidencias exactas de codigos o nombres de producto).
- Busqueda hibrida en comercio electronico: indexar fichas de producto con imagenes y descripciones, y permitir consultas que mezclen texto e imagen (por ejemplo, "zapatillas rojas como esta foto"). La salida dual densa+dispersa permite fusionar resultados de ambos tipos de retrieval en un mismo ranking.
- Sistemas de recomendacion basados en contenido: representar items (peliculas, articulos, videos) con sus carteles, trailers y sinopsis, y recomendar items similares calculando similitud coseno entre embeddings densos, o usando coincidencias dispersas para recomendaciones mas literales.
- Agentes con recuperacion de memoria visual: un agente que mantiene un historial de interacciones con capturas de pantalla puede recuperar episodios anteriores relevantes usando el modelo, gracias a su capacidad de procesar video y texto de forma conjunta y a su rendimiento destacado en el track de agentes de MMEB-v3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card menciona cualitativamente que UEmbed-4B alcanza resultados de ultima generacion en los tracks de texto y agentes de MMEB-v3, y que ocupa la segunda posicion entre los modelos open-source en MMEB-v2, solo por detras de la serie Qwen3-VL-Embedding. No se proporcionan cifras concretas de estos benchmarks en el material consultado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9 GB para los pesos (4,5B parametros × 2 bytes), mas activaciones y overhead, lo que situa el consumo total entre 12 y 16 GB. Una GPU con 16 GB (por ejemplo, RTX 4080, RTX 4090, A10G) es suficiente para inferencia de lotes pequenos.
- Para mayor comodidad con secuencias largas o lotes grandes, se recomienda una GPU con 24 GB (RTX 3090, RTX 4090, A100 40GB) o superior.
- No se documentan cuantizaciones oficiales, pero al ser un modelo basado en Qwen3.5, es probable que pueda convertirse a formatos como GGUF o AWQ mediante herramientas externas, reduciendo la VRAM necesaria a ~5 GB en 4 bits.
- Opciones de despliegue: `transformers` con `attn_implementation="flash_attention_2"` para aceleracion, o vLLM para inferencia de alto rendimiento. Tambien se puede usar el script de ejemplo del repositorio oficial.
- La latencia y el throughput dependen del hardware y del tamano de lote; no se proporcionan cifras oficiales. Con una GPU moderna y flash attention, se espera un throughput de varios cientos de consultas por segundo para embeddings de texto corto en lotes moderados.

## Comparativa con modelos similares

| Modelo | Backbone | Parametros | Salidas | Modalidades | Licencia |
|---|---|---|---|---|---|
| UEmbed-2B | Qwen3.5 | 2B | Dense + Sparse | Texto, imagen, video | CC-BY-4.0 |
| UEmbed-4B | Qwen3.5 | 4,5B | Dense + Sparse | Texto, imagen, video | CC-BY-4.0 |
| UEmbed-9B | Qwen3.5 | 9B | Dense + Sparse | Texto, imagen, video | CC-BY-4.0 |

No se dispone de datos comparativos con modelos externos como Qwen3-VL-Embedding-8B o CLIP en terminos de parametros y rendimiento numerico, ya que la informacion disponible no incluye esas cifras. La familia UEmbed se distingue por ofrecer embeddings dispersos y densos desde un unico modelo, algo poco comun en modelos multimodales de retrieval.

## Limitaciones y advertencias

- No se especifican los idiomas soportados de forma explicita; aunque el tokenizer de Qwen3.5 es multilingue, el entrenamiento se ha realizado principalmente con datos publicos en ingles (E5, M3, MMEB), por lo que el rendimiento en otros idiomas puede ser inferior.
- No se han publicado evaluaciones de sesgos o toxicidad para este modelo. Como cualquier modelo entrenado con datos web, puede reflejar sesgos presentes en los datos de entrenamiento.
- El riesgo de alucinacion es menor que en modelos generativos, pero los embeddings pueden producir falsos positivos en retrieval cuando las consultas son ambiguas o los documentos contienen informacion contradictoria.
- La longitud de contexto no esta documentada; se hereda del backbone Qwen3.5, pero no se garantiza un comportamiento optimo para secuencias muy largas sin validacion previa.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribucion al autor original. Es necesario revisar los terminos completos de la licencia antes de integrar el modelo en productos comerciales.
- La dependencia de `transformers>=5.4.0` puede suponer una barrera en entornos con versiones antiguas de la libreria.
- El modelo requiere descargar el repositorio completo, incluyendo `sparse_info.json` y `sparse_weights.pt`, para la inferencia dispersa; la omision de estos archivos provoca errores.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Alibaba-NLP/UEmbed-4B)
- [Repositorio GitHub](https://github.com/Alibaba-NLP/UEmbed)
- [Pagina del proyecto](https://alibaba-nlp.github.io/UEmbed/)
- [Articulo arXiv (2608.02583)](https://arxiv.org/abs/2608.02583)
- [Coleccion UEmbed en Hugging Face](https://huggingface.co/collections/Alibaba-NLP/uembed)

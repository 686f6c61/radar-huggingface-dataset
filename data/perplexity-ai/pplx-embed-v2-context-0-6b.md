# perplexity-ai/pplx-embed-v2-context-0.6b

## Resumen

`pplx-embed-v2-context-0.6b` es un modelo de embeddings contextuales multimodales (texto, imagen y documentos visuales) desarrollado por Perplexity AI. Forma parte de la familia `pplx-embed-v2-context`, y se presenta como una versión destilada y ligera (595 millones de parámetros) del modelo `pplx-embed-v2-context-9b`, con el que comparte espacio de embeddings a través del prefijo MRL de 1024 dimensiones. Esto permite indexar documentos con un modelo y consultarlos con otro, lo que facilita arquitecturas de recuperación asimétricas.

El modelo resuelve el problema del retrieval en pipelines RAG que mezclan texto e imágenes: en lugar de embeber fragmentos aislados, en modo contextual embebe cada chunk de un documento viendo el contexto circundante, lo que mejora la calidad de recuperación en documentos largos y en páginas visuales. Además, soporta chunking contextual de imágenes, dividiendo cada página en bandas horizontales que se indexan de forma independiente en índices ANN densos estándar.

Es relevante ahora porque combina tres tendencias: embeddings contextuales (frente a embeddings de chunk aislado), multimodalidad nativa para documentos visuales, y una huella de 0,6B parámetros que lo hace desplegable en hardware modesto. La arquitectura se etiqueta como `pplx_contextual_qwen3_5`, derivada de Qwen3.5, con atención lineal rápida opcional mediante `flash-linear-attention` y `causal-conv1d`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `pplx_contextual_qwen3_5` (transformer derivado de Qwen3.5, con atención lineal opcional) |
| Parametros totales | 595.370.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | salida nativa int8 sin normalizar; cuantizaciones adicionales no disponibles |
| Idiomas soportados | multilingüe |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 2,4 GB) |
| Dimensión de embedding | 1024 (prefijo MRL compartido con el modelo de 9B) |
| Pipeline | feature-extraction / sentence-similarity |
| Requisitos de librería | `transformers>=5.4.0`, `torch`, `numpy`, `safetensors`, `tqdm`, Pillow, torchvision |
| Carga | requiere `trust_remote_code=True` (custom_code) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `pplx_contextual_qwen3_5`, una variante de la familia Qwen3.5 adaptada para embeddings contextuales. Procesa documentos como secuencias de chunks no solapados y genera un embedding de 1024 dimensiones por chunk, condicionado por el contexto del documento completo. Para imágenes, realiza un único forward contextual por página y divide los tokens visuales fusionados en bandas horizontales de filas completas, preservando el MRoPE de tres ejes y los wrappers de imagen; los tokens separadores entre bandas usan como posición espacial el punto medio de las filas adyacentes y el centro horizontal de la imagen. Solo se agrupan (pool) los tokens visuales, excluyendo prefijos, wrappers y separadores.

El modelo es un fine-tune de `perplexity-ai/pplx-embed-v2-late-0.6b` (relación `finetune`). La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se usó RLHF o DPO; remite al informe técnico (arXiv:2610.38854) para esos datos. Una innovación operativa destacable es la separación estricta entre codificación de consultas (`encode_queries`) y de documentos (`encode`), con prefijos distintos entrenados de forma separada: usar `encode` para consultas degrada silenciosamente la calidad de recuperación. Además, el modelo produce embeddings int8 sin normalizar de forma nativa, por lo que debe compararse con similitud coseno o activar `normalize_embeddings=True` y usar producto escalar. Se ofrece una ruta rápida de atención lineal instalando `flash-linear-attention` y `causal-conv1d`.

## Capacidades

- Embeddings de texto contextuales: cada chunk se embebe viendo el contexto del documento completo, con chunks no solapados.
- Embeddings de texto no contextuales: modo aislado pasando cada chunk como lista de un solo elemento.
- Embeddings de imágenes y documentos visuales: páginas completas codificadas en un forward contextual y divididas en bandas horizontales configurables (`chunks`, por defecto 8).
- Chunking contextual de imágenes indexable en índices ANN densos estándar, con puntuación por chunk y máximo por página.
- Recuperación multimodal texto-imagen: consultas de texto contra embeddings de páginas visuales.
- Compatibilidad de espacio de embeddings con `pplx-embed-v2-context-9b` mediante el prefijo MRL de 1024 dimensiones (indexar con un modelo y consultar con otro).
- Multilingüe según la etiqueta `language: multilingual`.
- Salida nativa int8 sin normalizar, con opción de normalización L2.
- API de codificación con control de `batch_size`, `device`, `convert_to_numpy` y barra de progreso.
- No se documenta soporte de tool calling, agentes ni modo de razonamiento: es un modelo de embeddings, no generativo.

## Casos de uso

- RAG sobre documentación técnica mixta: indexar manuales con texto e imágenes de diagramas usando `encode` en modo contextual y consultar con `encode_queries`; la ventana contextual mejora la recuperación de fragmentos que dependen de secciones anteriores.
- Búsqueda en documentos financieros escaneados: embeber cada página como imagen con `encode_images(chunks=8)` y recuperar páginas relevantes ante consultas como cifras de ingresos, usando el máximo de similitud por banda.
- Migración progresiva de índices: indexar un corpus grande con el modelo de 9B y servir consultas con el de 0,6B (o al revés) gracias al espacio compartido MRL de 1024 dimensiones, reduciendo coste de inferencia en el lado de consulta.
- Deduplicación y clustering semántico de chunks: usar el modo no contextual para generar un embedding por chunk y agrupar por similitud coseno en pipelines de limpieza de corpus.
- Búsqueda multimodal en bases de conocimiento internas: combinar texto e imágenes de presentaciones o PDFs en un mismo índice ANN y consultar con lenguaje natural.
- Sistemas de soporte con recuperación de contexto largo: dividir tickets o hilos de conversación en chunks no solapados y embeberlos contextualmente para recuperar el fragmento exacto que responde a una incidencia.
- Enrutamiento semántico de consultas: generar embeddings de consulta con `encode_queries` y compararlos contra catálogos de intenciones o FAQs para clasificación de tickets en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al informe técnico (arXiv:2610.38854) para resultados de evaluación y detalles de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 595M parámetros; en bf16 ocupa aproximadamente 1,2 GB de pesos, y en int8 alrededor de 0,6 GB. El repo completo pesa 2,4 GB, por lo que el pico de memoria incluye buffers y activaciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para texto; para imágenes con `max_pixels=1800000` y lotes grandes se recomienda 8-16 GB (RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4).
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más para texto; para procesamiento de imágenes por lotes conviene 8 GB o más.
- Opciones de despliegue: `transformers>=5.4.0` con `trust_remote_code=True`; ruta rápida de atención lineal con `flash-linear-attention` y `causal-conv1d`; `attn_implementation="sdpa"` para atención estándar. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Dimensión | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `perplexity-ai/pplx-embed-v2-context-0.6b` | 595M | no disponible | texto + imagen | 1024 (MRL) | no disponible | Hugging Face, 491 descargas |
| `perplexity-ai/pplx-embed-v2-context-9b` | no disponible (9B por nombre) | no disponible | texto + imagen | 1024 (prefijo MRL) | no disponible | Hugging Face |
| `perplexity-ai/pplx-embed-v2-late-0.6b` (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |

Los tres modelos comparten familia y espacio de embeddings; el de 0,6B es la variante ligera del de 9B y un fine-tune del `late-0.6b`. No se dispone de datos de benchmarks ni de otros modelos comparables externos en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está indicada en la información disponible; verificar términos antes de uso comercial.
- El modelo produce embeddings int8 sin normalizar: comparar siempre con similitud coseno o normalizar explícitamente; usar producto escalar sin normalizar da resultados incorrectos.
- Codificar consultas con `encode` en lugar de `encode_queries` degrada la calidad de recuperación de forma silenciosa, sin error visible.
- Los chunks en modo contextual deben ser no solapados; el solapamiento no está soportado.
- La API de texto no trunca entradas: los documentos que excedan la longitud configurada deben dividirse o truncarse manualmente antes de codificar.
- La longitud de contexto no está documentada, lo que dificulta dimensionar los chunks en producción.
- Requiere `trust_remote_code=True` y `transformers>=5.4.0`, lo que implica ejecutar código personalizado del repositorio y limita la portabilidad a otros runners.
- Riesgo de alucinación no aplicable directamente (modelo de embeddings, no generativo), pero la recuperación puede devolver chunks semánticamente cercanos irrelevantes si el índice no está bien calibrado.
- Sesgos conocidos no documentados; al ser multilingüe sin lista explícita de idiomas, el rendimiento por idioma puede variar.
- El chunking de imágenes está limitado al número de filas fusionadas de la imagen, por lo que `chunks` solicitado puede no alcanzarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/perplexity-ai/pplx-embed-v2-context-0.6b
- Modelo de 9B con espacio compartido: https://huggingface.co/perplexity-ai/pplx-embed-v2-context-9b
- Modelo base: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-0.6b
- Informe técnico: https://arxiv.org/abs/2610.38854

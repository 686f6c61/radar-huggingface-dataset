# ai-babai/giga-embeddings-0826-480m-mlx-q8

## Resumen

Giga Embeddings 0826 480M MLX Q8 es una cuantización de 8 bits del modelo de embeddings `ai-sage/Giga-Embeddings-instruct-480M-0826`, realizada de forma independiente por el usuario `ai-babai` para ejecución local en Apple Silicon mediante MLX. El modelo original pertenece a la familia GigaEmbeddings, desarrollada por `ai-sage` sobre la base de un LLM decoder-only (GigaChat-3B en las versiones grandes, aunque esta variante de 480M es la más compacta de la familia). Está diseñado específicamente para búsqueda semántica, RAG, similitud de textos, clustering y clasificación en ruso e inglés, con una ventana de contexto de 8192 tokens y una dimensión de embedding de 1024.

La relevancia de esta versión Q8 radica en su reducido tamaño (0,525 GB de descarga) y su bajo consumo de memoria Metal (1,339 GB en una prueba de 16 textos de 1024 tokens), lo que la convierte en una opción práctica para entornos locales en Mac. El autor reporta una preservación de calidad frente al modelo BF16 nativo: el cambio agregado en NDCG@10 es de +0,00289, sin regresión medida en su conjunto de pruebas congelado. El modelo original alcanza un Russian MTEB de 70,98 según el paper de los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only con atención bidireccional (tag `qwen3_bidirec`), derivada de Giga-Embeddings-instruct-480M-0826 |
| Parametros totales | 136.090.112 (comercialmente denominado 480M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | Q8 (8-bit affine, group size 64) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors (MLX), con `manifest.json` para inventario y hashes SHA-256 |

## Arquitectura y entrenamiento

El modelo base `Giga-Embeddings-instruct-480M-0826` pertenece a la familia GigaEmbeddings, que según el paper de referencia (arXiv:2608.23806) se entrena mediante un pipeline de tres etapas: preentrenamiento contrastivo a gran escala sobre corpus web, ajuste fino con hard negatives y tuning por instrucciones multitarea. La arquitectura es decoder-only con atención bidireccional, una configuración que permite generar embeddings contextuales de alta calidad. El modelo produce vectores de 1024 dimensiones mediante pooling de atención latente (latent-attention pooling), según la descripción del paper original de GigaEmbeddings (arXiv:2510.22369).

Esta versión MLX Q8 es una conversión directa del modelo BF16 original, cuantizada con affine Q8 y group size 64. El autor no ha reentrenado el modelo; solo ha convertido los pesos y verificado la preservación de la calidad de recuperación mediante pruebas locales. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento ni la composición del dataset para esta variante de 480M, más allá de la mezcla de ruso e inglés mencionada en la documentación.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y recuperación de información.
- Soporte de RAG (retrieval-augmented generation) mediante codificación separada de consultas y documentos.
- Cálculo de similitud coseno entre textos para clustering, deduplicación y clasificación.
- Multilingüe limitado a ruso e inglés, con instrucciones específicas para consultas (las queries requieren un prefijo de instrucción explícito; los documentos no llevan prefijo).
- Longitud de contexto de 8192 tokens, adecuada para párrafos largos o documentos extensos.
- No incluye capacidades de generación de texto, tool calling, agentes, visión ni audio; es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en ruso: permite indexar documentos en ruso y recuperar pasajes relevantes a partir de consultas en lenguaje natural, gracias a su entrenamiento específico en ruso y su ventana de 8192 tokens.
- RAG para documentación técnica o legal: se puede integrar en un pipeline de generación aumentada por recuperación, codificando documentos y consultas por separado y usando la similitud coseno para seleccionar los fragmentos más relevantes antes de pasarlos a un LLM generativo.
- Clasificación de textos: los embeddings de 1024 dimensiones pueden alimentar clasificadores ligeros (regresión logística, SVM) para tareas como análisis de sentimiento o categorización de contenido en ruso e inglés.
- Deduplicación de contenidos: comparar embeddings de artículos, noticias o entradas de base de datos para detectar duplicados o variantes casi idénticas, aprovechando la alta concordancia top-1 (98,44% frente al modelo BF16).
- Sistemas de recomendación basados en contenido: representar ítems (productos, artículos, vídeos) como vectores y calcular similitudes para sugerir elementos relacionados.
- Moderación o filtrado de contenido: clasificar textos según su temática o toxicidad mediante embeddings y un clasificador entrenado sobre ellos, con la ventaja de ejecutarse localmente en Mac sin enviar datos a la nube.

## Benchmarks y rendimiento

El modelo original (BF16) alcanza un Russian MTEB de 70,98 según el paper de los autores. El autor de la cuantización Q8 no ha reejecutado el suite completo de MTEB, pero ha realizado una comprobación local de preservación de la calidad de recuperación. Los resultados disponibles son:

| Modelo | Russian MTEB (original BF16) | Comprobación Q8 (NDCG@10 Δ vs BF16 MLX) |
|---|---|---|
| Giga Embeddings 0826 480M Q8 | 70,98 | +0,00289 |
| Giga Embeddings 0826 3B Q8 | 74,56 | +0,00181 |
| Giga Embeddings 0826 10B-A1.8B Q8 | 74,98 | −0,00046 |

Además, en la prueba local del autor: tiempo típico de 0,071 s para un texto de 512 tokens en un M4 Pro, y velocidad de 6,38 documentos/s para 16 textos de 1024 tokens. La similitud coseno mínima/media frente al modelo BF16 nativo es de 0,992867 / 0,998627, con una concordancia top-1 del 98,44% y una superposición media top-10 del 96,72%. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) porque se trata de un modelo de embeddings, no generativo.

## Requisitos de hardware

- Diseñado exclusivamente para Apple Silicon (macOS) mediante MLX; no hay soporte CUDA ni para GPUs NVIDIA.
- Pico de memoria Metal medido: 1,339 GB para 16 textos de 1024 tokens, lo que indica que cabe en Mac con 8 GB de RAM unificada o más.
- Tamaño de descarga: 0,525 GB; el repositorio ocupa 0,5 GB.
- Inferencia típica: 0,071 s por texto de 512 tokens en un M4 Pro; 6,38 documentos/s en lote de 16 textos de 1024 tokens.
- Despliegue mediante la librería Python `giga-embeddings-mlx` (disponible en PyPI), que gestiona la carga del modelo y la codificación.
- No se recomienda para servidores Linux con GPUs; para esos entornos existe el modelo original BF16 en formato estándar.

## Comparativa con modelos similares

Dentro de la familia Giga Embeddings 0826, las alternativas son las versiones de mayor tamaño:

| Modelo | Parámetros | Descarga | Russian MTEB | Contexto | Licencia |
|---|---|---|---|---|---|
| Giga Embeddings 0826 480M Q8 (este) | 136M | 0,525 GB | 70,98 | 8192 | MIT |
| Giga Embeddings 0826 3B Q8 | ~3B | 3,755 GB | 74,56 | 8192 | MIT |
| Giga Embeddings 0826 10B-A1.8B Q8 | ~10B (MoE) | 11,144 GB | 74,98 | 8192 | MIT |

La versión 480M es la más pequeña y rápida, con una pérdida de calidad de unos 3,6 puntos de MTEB frente a la 3B, pero con una huella de memoria mucho menor. La versión 10B-A1.8B es la de mayor calidad, aunque el autor advierte de un "code warning" en su documentación. No se dispone de comparativas con modelos de embeddings de otros proveedores (como E5, BGE o GTE) en la información proporcionada.

## Limitaciones y advertencias

- Cuantización independiente realizada por `ai-babai`, no es un lanzamiento oficial de `ai-sage`; el autor no ha reejecutado el suite completo de MTEB sobre los pesos Q8, solo una comprobación local de recuperación.
- La cuantización Q8 es principalmente una optimización de memoria y disco; no se garantiza una aceleración frente al BF16 nativo.
- El modelo solo soporta ruso e inglés; no cubre otros idiomas.
- Las consultas requieren una instrucción explícita en el momento de la codificación; si se omite, la calidad de recuperación puede degradarse.
- No se han documentado sesgos específicos, pero al estar entrenado con datos web en ruso e inglés, puede reflejar sesgos presentes en esos corpus.
- Riesgo de alucinación no aplica directamente al ser un modelo de embeddings, pero la calidad de la recuperación depende de la calidad de los documentos indexados.
- Para uso en producción, se recomienda validar el comportamiento en el conjunto de datos específico, dado que la comprobación del autor se realizó sobre un conjunto congelado limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-babai/giga-embeddings-0826-480m-mlx-q8
- Modelo base original: https://huggingface.co/ai-sage/Giga-Embeddings-instruct-480M-0826
- Paper original: https://arxiv.org/abs/2608.23806
- Paper de GigaEmbeddings (framework general): https://arxiv.org/pdf/2510.22369
- Repositorio GitHub de la librería MLX: https://github.com/ai-babai/giga-embeddings-mlx
- Paquete PyPI: https://pypi.org/project/giga-embeddings-mlx/
- Colección de modelos MLX Q8 de la familia: https://huggingface.co/collections/ai-babai/giga-embeddings-0826-for-apple-silicon-mlx-q8-6a8eec40b26f6543f5da3244
- Informe de benchmarks y metodología: https://github.com/ai-babai/giga-embeddings-mlx/blob/main/docs/benchmarks/0826-results.md

# devrim/reign-small-l2_gn-gte-large_st-256_val-selected

## Resumen

REIGN `small-l2` es un codificador de fragmentos cruzados (cross-chunk encoder) desarrollado por Devrim Cavusoglu y Emre Akbas para el retrieval de documentos largos. El modelo, publicado bajo licencia Apache 2.0, aborda el problema de escalar la longitud de contexto en sistemas de embeddings de documentos: en lugar de procesar tokens directamente, lee una secuencia de embeddings de fragmentos (chunks) previamente generados por una red guía congelada, en este caso GTE-large (335M parámetros). El encoder REIGN en sí es un transformer pequeño de 2 capas con 4.092.416 parámetros, que agrega los embeddings de los fragmentos mediante pooling medio.

La relevancia de este modelo radica en su eficiencia: al operar sobre embeddings de fragmentos en lugar de tokens, reduce drásticamente el coste computacional para documentos muy largos, manteniendo la capacidad de capturar relaciones entre fragmentos distantes. Está diseñado específicamente para retrieval documento-a-document, no para generación de texto. El checkpoint presentado corresponde a un barrido de stride de entrenamiento (256) y fue seleccionado por mejor nDCG@10 en validación. Forma parte de la familia REIGN descrita en el artículo *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling* (Findings of EMNLP 2026, en prensa).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer cross-chunk encoder (2 capas, d=384, 6 cabezas, FFN 1536) |
| Parametros totales | 4.092.416 (solo encoder REIGN; la red guia GTE-large de 335M va congelada) |
| Parametros activos | 4.092.416 (no es MoE) |
| Longitud de contexto | No aplica directamente; chunk size 512 tokens, stride 256 |
| Tipos de cuantizacion | No disponible (pesos en float32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, float32) |

## Arquitectura y entrenamiento

REIGN es un codificador de fragmentos cruzados que procesa una secuencia de embeddings de fragmentos (chunks) en lugar de tokens. La red guía (GTE-large, congelada) genera embeddings para cada fragmento de 512 tokens con un stride de 256 durante el entrenamiento. El encoder REIGN, de 2 capas y dimension oculta 384, es una funcion invariante a permutaciones (sin señal de posicion) que agrega los embeddings mediante pooling medio. Esto permite manejar documentos de longitud arbitraria con coste lineal en el numero de fragmentos.

El entrenamiento utiliza una perdida de embedding coseno de tres vias con objetivos graduados s ∈ {1, 0, −1} (positivo, parcial, negativo) y peso parcial λ = 0.5. La construccion de lotes emplea 18 anclas × (1 positivo + 2 parciales + 17 negativos in-batch) = 360 pares por paso. Se usa AdamW con lr 1e-5, weight decay 1e-4 y annealing coseno, durante 50 epocas con validacion cada 4. La seleccion del checkpoint se hace por mejor nDCG@10 en el split de validacion. Se entreno con precision mixta de 16 bits, seed 42, y los embeddings de la red guia se precomputaron y cachearon. El hardware fue una GPU de consumo de 24 GB.

## Capacidades

- Generacion de embeddings L2-normalizados para documentos largos (retrieval documento-a-documento).
- Agregacion de multiples fragmentos mediante pooling medio, capturando relaciones entre fragmentos distantes.
- Soporte de entrada de longitud arbitraria (limitada por el numero de fragmentos y la memoria).
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Unicamente en ingles, sin capacidades multilingues.
- No incluye vision ni audio.

## Casos de uso

- Busqueda semantica en corpus de documentos extensos: el modelo puede indexar articulos, informes o libros completos y recuperar los mas relevantes para una consulta, gracias a su capacidad de procesar multiples fragmentos.
- Sistemas RAG (Retrieval-Augmented Generation) con documentos largos: se puede usar como componente de retrieval para alimentar un LLM generativo con pasajes relevantes de documentos que superan la ventana de contexto del LLM.
- Deduplicacion de documentos: al generar embeddings de documentos completos, permite detectar duplicados o versiones similares en grandes repositorios.
- Clasificacion de documentos por similitud tematica: los embeddings pueden alimentar algoritmos de clustering o clasificacion para organizar bibliotecas digitales.
- Sistemas de recomendacion basados en contenido: comparar la similitud coseno entre documentos para sugerir articulos, patentes o expedientes relacionados.
- Archivado y organizacion automatica de documentos legales o academicos: agrupar documentos por afinidad tematica sin necesidad de etiquetas previas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este checkpoint especifico. La model card indica que pertenece a un barrido de stride de entrenamiento y no tiene fila propia en las tablas del articulo. Los resultados agregados del barrido estan disponibles en el repositorio del proyecto y en el paper (pendiente de publicacion). No se proporcionan cifras de MMLU, HumanEval u otros benchmarks genericos, ya que el modelo no es un LLM generativo.

## Requisitos de hardware

- El encoder REIGN es muy pequeno (4M parametros, ~16 MB en float32), pero requiere cargar la red guia GTE-large (335M parametros) para generar los embeddings de fragmentos.
- VRAM estimada para inferencia: GTE-large en float16 ocupa ~670 MB; en float32 ~1,3 GB. El encoder REIGN anade ~16 MB. Total inferior a 1,5 GB en float16.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.). Tambien puede ejecutarse en CPU para lotes pequenos.
- El entrenamiento se realizo en una GPU de consumo de 24 GB, pero la inferencia es mucho menos exigente.
- Opciones de despliegue: el codigo oficial en GitHub proporciona `ReignBaselineEncoder` y `ReignModel` (basado en `PreTrainedModel`). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un LLM.
- Latencia y throughput: no disponibles. Dependen del numero de fragmentos y del hardware.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos para este checkpoint. Como referencia cualitativa, se puede comparar con otros modelos de embeddings de documentos largos:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| REIGN small-l2 (este) | 4M + 335M (guia) | Ilimitado (fragmentos) | Cross-chunk sobre embeddings | Apache 2.0 |
| GTE-large (base) | 335M | 512 tokens | Bi-encoder clasico | Apache 2.0 |
| BGE-M3 | 568M | 8192 tokens | Multi-granularidad | MIT |
| E5-large | 335M | 512 tokens | Bi-encoder clasico | MIT |

REIGN se diferencia por su capacidad de procesar documentos arbitrariamente largos sin aumentar el coste por token, a costa de requerir una red guia externa. No hay datos publicados que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Unicamente soporta ingles; no hay versiones multilingues.
- No es adecuado para inputs cortos (menores a 512 tokens): en ese regimen, el encoder cross-chunk no tiene nada que agregar y se recomienda usar la red guia directamente.
- Requiere cargar la red guia GTE-large de forma separada y mantenerla congelada; no es un modelo autonomo.
- No es un modelo generativo: no puede producir texto, solo embeddings.
- El dataset de entrenamiento (`devrim/goodwiki_long_synthetic_ir`) se distribuye bajo CC BY-SA 4.0, lo que implica obligaciones de share-alike si se usan los datos derivados.
- La licencia Apache 2.0 del modelo permite uso comercial, pero el codigo y los datos asociados pueden tener restricciones adicionales.
- No se garantiza rendimiento en produccion sin evaluacion previa en el dominio especifico.
- El entrenamiento con precision mixta no es bit-reproducible; un reentrenamiento no producira pesos identicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-small-l2_gn-gte-large_st-256_val-selected
- Repositorio de codigo: https://github.com/devrimcavusoglu/reign
- Pagina del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset de entrenamiento: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (en prensa).

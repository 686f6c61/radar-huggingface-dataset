# mlx-community/Octen-Embedding-4B-MLX-4bit

## Resumen

Octen-Embedding-4B-MLX-4bit es una conversión comunitaria al formato MLX con cuantización de 4 bits del modelo de embeddings Octen-Embedding-4B, desarrollado por Octen como un fine-tuning de Qwen/Qwen3-Embedding-4B. El modelo original es un encoder transformer de 4.000 millones de parámetros (aunque el checkpoint convertido contiene 628.567.696 parámetros, al excluir la cabeza de lenguaje) con una ventana de contexto de 32.768 tokens, diseñado para tareas de búsqueda semántica y recuperación de información en múltiples idiomas, principalmente inglés y chino.

Esta conversión, publicada por el usuario mlx-community, permite ejecutar el modelo en hardware Apple Silicon mediante la librería MLX-LM, manteniendo una fidelidad alta respecto al original en BF16 (similitud coseno entre 0,9748 y 0,9782 en muestras de validación). El repositorio no incluye código Python personalizado, sino que utiliza la arquitectura estándar `qwen3.Model` de MLX-LM, lo que facilita su integración en proyectos existentes. Es relevante para desarrolladores que necesitan embeddings multilingües de alta calidad en entornos Apple sin depender de GPUs NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 encoder-only (transformer denso, sin MoE) |
| Parametros totales | 628.567.696 (checkpoint convertido; el modelo original tiene 4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | MLX affine 4-bit (grupo de 64, 4.501 bits efectivos por peso) |
| Idiomas soportados | Inglés, chino y multilingüe (según etiquetas del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-only derivado de Qwen3-Embedding-4B, sin cabeza de lenguaje. La arquitectura es un transformer estándar con atención de múltiples cabezas, capas de normalización y embeddings de 2560 dimensiones. El checkpoint original de Octen fue fine-tuned a partir de Qwen3-Embedding-4B, aunque no se han publicado detalles sobre el dataset de entrenamiento ni el proceso de ajuste (si se usó RLHF, DPO u otra técnica). La conversión a MLX normalizó las claves de pesos (añadiendo el prefijo `model.`) y aplicó cuantización afín de 4 bits con grupo de 64, sin modificar los valores tensoriales. El modelo utiliza pooling de último token y normalización L2 en float32 para producir los embeddings finales.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y recuperación de información.
- Soporte multilingüe, con especial énfasis en inglés y chino, aunque la etiqueta "multilingual" sugiere cobertura adicional.
- No genera texto: es exclusivamente un modelo de embeddings (feature extraction).
- Pooling de último token y normalización L2 integradas en el flujo de uso.
- Compatible con el formato de prompt específico del modelo original (prefijos "Query:" y "Document:").
- Integración directa con MLX-LM, sin necesidad de código personalizado.

## Casos de uso

- Búsqueda semántica en bases de conocimiento: el modelo puede indexar documentos y consultas en inglés y chino, devolviendo resultados relevantes por similitud coseno. Su contexto de 32.768 tokens permite procesar pasajes largos.
- Sistemas RAG (generación aumentada por recuperación): se puede usar como componente de recuperación para alimentar a un LLM con pasajes relevantes, aprovechando la normalización L2 para comparaciones consistentes.
- Deduplicación de contenido: al generar embeddings de artículos o entradas, se pueden detectar duplicados o versiones cercanas mediante umbrales de similitud.
- Clasificación de texto: los embeddings de 2560 dimensiones pueden servir como características de entrada para clasificadores supervisados, especialmente en dominios multilingües.
- Búsqueda multilingüe en catálogos de productos: permite consultas en un idioma y recuperación de documentos en otro, gracias a la alineación multilingüe del modelo.
- Filtrado de contenido en moderación: se pueden comparar embeddings de mensajes con plantillas de contenido no deseado para detectar similitudes semánticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de validación reportada es la similitud coseno entre los embeddings del modelo original en BF16 y la conversión MLX 4-bit, que oscila entre 0,9748 y 0,9782 en tres muestras (dos en inglés y una en chino tradicional). No hay datos de MMLU, MTEB u otros benchmarks estándar de embeddings.

## Requisitos de hardware

- Diseñado para Apple Silicon (M1, M2, M3 y posteriores) mediante la librería MLX.
- Memoria estimada: el checkpoint cuantizado a 4 bits ocupa aproximadamente 353 MB (628M × 4,5 bits), más overhead del runtime, por lo que cabe en cualquier Mac con 8 GB de memoria unificada o superior.
- No requiere GPU dedicada; utiliza la memoria unificada del chip Apple.
- Despliegue con MLX-LM (carga directa del repositorio) o mediante el script `mlx_lm.convert` para conversiones adicionales.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Octen-Embedding-4B (original) | 4B | 32.768 | BF16 | Apache 2.0 | Hugging Face |
| Octen-Embedding-4B-MLX-4bit (este) | 628M (checkpoint) | 32.768 | MLX 4-bit | Apache 2.0 | Hugging Face |
| Qwen3-Embedding-4B (base) | 4B | 32.768 | BF16 | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos relacionados directamente, ya que no se dispone de datos de rendimiento frente a otras familias de embeddings (p. ej., BGE, E5). La principal diferencia entre este modelo y el original es la cuantización y el formato MLX, que reduce el tamaño y permite ejecución en Apple Silicon, a costa de una ligera pérdida de fidelidad (similitud coseno ~0,97).

## Limitaciones y advertencias

- La cuantización 4-bit introduce diferencias numéricas respecto al modelo original en BF16; la similitud coseno entre ambos es de ~0,97, lo que puede afectar a tareas de recuperación muy sensibles.
- No se deben mezclar vectores generados con este modelo con vectores de otros modelos, incluso si tienen la misma dimensión (2560), ya que los espacios de embedding no son compatibles.
- El modelo solo produce embeddings; no es capaz de generar texto ni de realizar tareas de razonamiento.
- La calidad de recuperación debe evaluarse en los datos propios de cada dominio, especialmente fuera de inglés y chino.
- No se han publicado benchmarks formales, por lo que el rendimiento en tareas estándar es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución al modelo original de Octen y a Qwen.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/mlx-community/Octen-Embedding-4B-MLX-4bit
- Modelo original de Octen: https://huggingface.co/Octen/Octen-Embedding-4B
- Modelo base Qwen3-Embedding-4B: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Documentación de Octen sobre embeddings: https://docs.octen.ai/capabilities/embedding
- Referencia de API de embeddings de Octen: https://docs.octen.ai/api-reference/embedding

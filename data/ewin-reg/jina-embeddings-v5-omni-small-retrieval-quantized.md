# ewin-reg/jina-embeddings-v5-omni-small-retrieval-Quantized

## Resumen

`ewin-reg/jina-embeddings-v5-omni-small-retrieval-Quantized` es una versión cuantizada del modelo de embeddings omni-modal `jinaai/jina-embeddings-v5-omni-small-retrieval`, publicada por el usuario ewin-reg. El modelo original pertenece a la familia Jina Embeddings v5 y unifica tres modalidades —texto, imagen y audio— en un único espacio métrico de 1024 dimensiones. Esta variante aplica una cuantización mixta W4A8 (INT4 grupal simétrico + FP8 E4M3) para reducir el tamaño de los pesos a 0,8943 GB, manteniendo una fidelidad coseno superior al 92 % en las modalidades visual y de audio.

El problema que resuelve es el despliegue de sistemas de recuperación multimodal en entornos con restricciones estrictas de memoria, como microservicios edge, aplicaciones de escritorio o dispositivos con menos de 1 GB de RAM/VRAM. La arquitectura subyacente es la de `Qwen3-VL-Audio`, con un backbone de lenguaje de 28 capas, un vision transformer SigLIP de 24 capas y una torre de audio Conformer de 32 capas. Según los metadatos de HuggingFace, el checkpoint cuantizado contiene 929.508.224 parámetros. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-Audio omni-modal (backbone de lenguaje de 28 capas, ViT SigLIP de 24 capas, Conformer de audio de 32 capas) |
| Parametros totales | 929.508.224 (≈0,93 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (INT4 grupal simétrico + FP8 E4M3) |
| Idiomas soportados | Inglés, chino y multilingüe (en, zh, multilingual) |
| Licencia | Apache-2.0 |
| Formato de pesos | SafeTensors (model.safetensors, 915,76 MB) |

## Arquitectura y entrenamiento

El modelo base `jina-embeddings-v5-omni-small-retrieval` se describe como una arquitectura omni-modal que unifica texto, imagen y audio en un mismo espacio de representación. El backbone de lenguaje tiene 28 capas transformer con bloques MLP SwiGLU y atención de producto escalado. Para la visión incorpora un ViT SigLIP de 24 capas que procesa parches de imagen de 14×14 píxeles. Para el audio utiliza una torre Conformer de 32 capas que ingiere formas de onda a 16 kHz, alternando convoluciones separables por profundidad con auto-atención. La tabla de vocabulario tiene 151.646 entradas de 1024 dimensiones.

La cuantización aplicada en este checkpoint es una estrategia de precisión mixta guiada por curvatura. Las proyecciones de atención (Q, K, V, O) se mantienen en FP8 E4M3 para evitar el colapso del rango de atención que ocurre con INT4 uniforme, reduciendo la divergencia KL frente a GGUF de 7,50 a 0,70. Las proyecciones down de los MLP de las capas 5-16 y las proyecciones gate/up se cuantizan a INT4 grupal con grupo de 64. El vision transformer y la torre de audio se cuantizan a INT4 grupal, mientras que los proyectores de pooling se mantienen en BF16. No se proporcionan datos sobre el conjunto de datos de entrenamiento ni sobre procesos de alineación (RLHF/DPO) en la información disponible.

## Capacidades

- Recuperación multimodal unificada: genera embeddings para texto, imagen y audio en un mismo espacio vectorial de 1024 dimensiones, permitiendo búsquedas cross-modal (texto-imagen, texto-audio, imagen-audio).
- Búsqueda semántica de texto: útil para indexación de documentos y recuperación por similitud coseno.
- Indexación densa con MRL (Matryoshka Representation Learning) y bitpacking no uniforme: cabeza Int8 para dimensiones 0-256 y cola de 1 bit para dimensiones 256-1024, reduciendo la memoria a 352 bytes por vector (11,6× compresión frente a FP32).
- Compatibilidad nativa con Hugging Face Transformers y SentenceTransformers mediante `trust_remote_code=True`, sin necesidad de runtimes C++ externos ni dependencias de forks de GGUF.
- Soporte multilingüe declarado para inglés, chino y otros idiomas (etiqueta multilingual).
- No es un modelo generativo: está optimizado para extracción de representaciones densas bidireccionales, no para generar texto conversacional ni síntesis de audio.
- No soporta tool calling, function calling ni razonamiento multi-paso agéntico, al tratarse de un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en bases de datos vectoriales: el modelo puede indexar documentos de texto y consultas en un espacio de 1024 dimensiones, permitiendo recuperar los pasajes más relevantes mediante similitud coseno. Su tamaño reducido lo hace adecuado para motores de búsqueda en microservicios con presupuesto de memoria limitado.
- Recuperación cross-modal en catálogos de productos: indexar imágenes y descripciones de texto de un catálogo para permitir búsquedas por imagen o por texto. La fidelidad visual del 92,03 % garantiza una degradación aceptable en escenarios de e-commerce.
- Búsqueda por similitud de audio en bibliotecas de efectos de sonido: indexar clips de audio de 16 kHz y recuperar sonidos similares a partir de una consulta de audio o de texto. La torre Conformer cuantizada conserva un 96,44 % de fidelidad coseno.
- Sistemas RAG multimodales: combinar embeddings de texto, imagen y audio para recuperar contexto heterogéneo en asistentes que necesitan responder a consultas con múltiples formatos de entrada.
- Despliegue en entornos edge con restricciones de memoria: al pesar menos de 0,9 GB, es viable en dispositivos embebidos, routers o aplicaciones de escritorio que no pueden alojar modelos de más de 1 GB.
- Clasificación de documentos y deduplicación: usar los embeddings para agrupar documentos por similitud semántica, detectar duplicados o identificar temas recurrentes en grandes corpus, aprovechando la indexación MRL para reducir el coste de almacenamiento.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados declarados por el autor del modelo en la model card, sin verificación independiente.

| Metrica | Valor |
|---|---|
| Model Size on Disk | 0,8943 GB |
| Mean Text Embedding Fidelity | 99,209 (similitud coseno) |
| End-to-End Text Degradation | 0,791 |
| Audio Modality Fidelity | 96,443 (similitud coseno) |
| Visual Modality Fidelity | 92,0344 (similitud coseno) |
| Storage Reduction vs Base | 71,34 (ratio de compresión) |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no es generativo. Las métricas proporcionadas se centran en la fidelidad de los embeddings tras la cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB para los pesos (0,8943 GB). Con activaciones y overhead de ejecución, se recomienda al menos 2 GB de VRAM para procesar lotes pequeños.
- GPU recomendadas: cualquier GPU moderna con 2 GB o más de VRAM, como una RTX 3060, T4, o superior. También puede ejecutarse en CPU con resultados aceptables para cargas moderadas.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU de consumo actual.
- Opciones de despliegue: SentenceTransformers (`SentenceTransformer(..., trust_remote_code=True)`), Hugging Face Transformers, o integración directa con librerías de vectores como FAISS o Qdrant.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Se compara con el modelo base original y con la variante FlatQuant-W4A8 del mismo autor. No se dispone de datos de otros modelos de embeddings comparables en la información proporcionada.

| Modelo | Parametros | Tamano en disco | Cuantizacion | Fidelidad visual | Licencia |
|---|---|---|---|---|---|
| ewin-reg/jina-embeddings-v5-omni-small-retrieval-Quantized | 929.508.224 | 0,8943 GB | W4A8 (INT4 + FP8) | 92,03 % | Apache-2.0 |
| jinaai/jina-embeddings-v5-omni-small-retrieval | 1,56 mil millones (segun model card) | 3,11 GB estimado (BF16) | Sin cuantizar | 100 % (referencia) | Apache-2.0 |
| ewin-reg/jina-embeddings-v5-omni-small-retrieval-FlatQuant-W4A8 | no disponible | no disponible | W4A8 | no disponible | Apache-2.0 |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto conversacional, audio ni imágenes. Su uso se limita a la extracción de embeddings.
- La cuantización introduce una pérdida de fidelidad, especialmente en la modalidad visual (92,03 % de similitud coseno frente al modelo base). Esto puede afectar a aplicaciones que requieran una precisión muy alta en búsquedas por imagen.
- El fine-tuning directo sobre los pesos INT4 no es posible; es necesario dequantizar a BF16 o FP16 antes de cualquier ajuste fino.
- No se especifica la longitud de contexto, lo que puede ser una limitación para documentos o consultas muy largas.
- Los sesgos del modelo base no han sido evaluados en esta variante cuantizada. Puede heredar sesgos de los datos de entrenamiento originales.
- El soporte de idiomas se declara como inglés, chino y multilingüe, pero no se garantiza un rendimiento óptimo en español u otros idiomas no mencionados.
- La licencia Apache-2.0 permite uso comercial, pero no incluye garantías explícitas de rendimiento ni de seguridad.

## Enlaces

- Modelo cuantizado: https://huggingface.co/ewin-reg/jina-embeddings-v5-omni-small-retrieval-Quantized
- Modelo base: https://huggingface.co/jinaai/jina-embeddings-v5-omni-small-retrieval
- Variante FlatQuant-W4A8: https://huggingface.co/ewin-reg/jina-embeddings-v5-omni-small-retrieval-FlatQuant-W4A8
- No se han encontrado enlaces adicionales relevantes en la búsqueda web.

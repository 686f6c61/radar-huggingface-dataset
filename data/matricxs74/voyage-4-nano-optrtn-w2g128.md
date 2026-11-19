# MATRICXS74/voyage-4-nano-optrtn-w2g128

## Resumen

Voyage 4 Nano OPT-RTN INT2 es una versión cuantizada a 2 bits del modelo de embeddings MongoDB/voyage-4-nano, publicada por el usuario MATRICXS74 en Hugging Face. Se trata de un checkpoint derivado orientado a tareas de extracción de características (feature-extraction) y generación de embeddings de texto, no a generación de texto libre. El modelo conserva la arquitectura y el tokenizador del original, pero sustituye los pesos de la mayoría de sus módulos lineales por versiones cuantizadas en INT2 con esquema W2A16.

La relevancia de esta ficha es doble. Por un lado, demuestra la viabilidad técnica de comprimir un modelo de embeddings de 171 millones de parámetros hasta un repositorio de apenas 0,4 GB, lo que abarata enormemente el almacenamiento y la distribución. Por otro, el propio autor advierte de que la evaluación de recuperación (retrieval) de este checkpoint está pendiente, por lo que no existe ninguna garantía publicada sobre la degradación de calidad respecto al modelo original.

El modelo base pertenece a la familia Voyage 4 Nano de MongoDB, un encoder de embeddings ligeros pensado para búsqueda semántica y RAG. Esta variante cuantizada hereda la licencia Apache 2.0 y se distribuye en formato safetensors con código personalizado, lo que exige confiar en la implementación incluida en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivada de Qwen3, según tags), especializada en embeddings |
| Parámetros totales | 171.071.488 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT2, esquema W2A16 (pesos 2 bits, activaciones 16 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, con código personalizado (`custom_code`) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint MongoDB/voyage-4-nano, que según los tags de Hugging Face se basa en la arquitectura Qwen3 adaptada a extracción de características. No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo original empleó RLHF, DPO u otras técnicas de alineación; estos datos no están disponibles en la información proporcionada.

La innovación técnica de esta variante es el proceso de cuantización: se aplicó la herramienta AutoRound 0.16.1 con el método OPT-RTN, cuantizando 84 de los 85 módulos elegibles a INT2 con un esquema W2A16. La capa `linear` se excluyó intencionadamente de la cuantización. El proceso de calibración utilizó 128 muestras con longitud de secuencia 128 y tamaño de lote 8. No se documenta ninguna innovación arquitectónica adicional más allá de la compresión de pesos.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y recuperación de información.
- Extracción de características (feature-extraction) compatible con el pipeline de Transformers.
- Integración con Text Embeddings Inference (TEI), según los tags del repositorio.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Soporte de cuantización de bajo nivel para despliegue con requisitos reducidos de memoria.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes; el pipeline declarado es exclusivamente feature-extraction.

## Casos de uso

- Búsqueda semántica en producción con presupuesto de memoria ajustado: el checkpoint ocupa 0,4 GB, por lo que puede cargarse en instancias pequeñas o en CPU para indexar y consultar corpus documentales donde el ahorro de RAM sea prioritario.
- RAG sobre documentación técnica: al generar embeddings de fragmentos y consultas, puede alimentar un pipeline de recuperación aumentada, siempre que se valide previamente la pérdida de calidad frente al modelo original.
- Deduplicación y clustering de textos a gran escala: los embeddings permiten agrupar documentos similares; la reducción de tamaño facilita procesar lotes masivos en paralelo.
- Clasificación de textos por similitud: usar los vectores como características de entrada para un clasificador ligero en tareas de moderación o enrutamiento de tickets.
- Despliegue en el edge o en entornos con GPU de gama baja: el esquema W2A16 reduce la huella de pesos, lo que permite servir el modelo en hardware modesto o incluso en CPU con TEI.
- Prototipado rápido de sistemas de recomendación basados en contenido: calcular similitud entre descripciones de productos o artículos sin incurrir en costes de infraestructura elevados.
- Evaluación comparativa de técnicas de cuantización: sirve como caso de estudio para medir el impacto de INT2 en modelos de embeddings, dado que el autor aún no ha publicado métricas de retrieval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación de retrieval de este checkpoint OPT-RTN está pendiente y que no se hacen afirmaciones de calidad hasta completarla.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos en INT2 (repositorio de 0,4 GB); el consumo real depende del tamaño de lote, la longitud de secuencia y las activaciones en 16 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1650, RTX 3050 o superiores; también A100/H100 para despliegues de alto throughput.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requerido por el código personalizado), Text Embeddings Inference (TEI) y endpoints de inferencia compatibles. No se documenta soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MATRICXS74/voyage-4-nano-optrtn-w2g128 | 171 M | No disponible | INT2 (W2A16) | Apache 2.0 | Hugging Face |
| MongoDB/voyage-4-nano (original) | 171 M | No disponible | FP16/BF16 (presumible) | Apache 2.0 | Hugging Face |
| Modelos de embeddings de 100-200 M (familia BGE, E5) | ~100-300 M | Variable | FP16, INT8 | MIT/Apache 2.0 | Hugging Face |

La comparación directa con alternativas de la misma categoría no puede establecerse con rigor porque no hay métricas de retrieval publicadas para esta variante. El original MongoDB/voyage-4-nano es la referencia natural, y la única diferencia documentada es la cuantización INT2 de 84 módulos lineales.

## Limitaciones y advertencias

- Calidad no validada: el autor declara que la evaluación de retrieval está pendiente; no hay evidencia de que los embeddings mantengan la calidad del modelo original tras la cuantización a 2 bits.
- Riesgo de degradación severa: INT2 es una cuantización muy agresiva; es esperable una pérdida de precisión en las representaciones vectoriales, aunque su magnitud no está cuantificada.
- Código personalizado: el repositorio requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar la implementación antes de usarla en producción.
- Idiomas no documentados: no se especifica qué lenguas cubre el modelo base ni si la cuantización afecta de forma desigual a distintas lenguas.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda respetar los términos del modelo original MongoDB/voyage-4-nano y citar la atribución correspondiente.
- Sesgos y alucinación: no hay información publicada sobre sesgos del modelo base ni sobre el comportamiento de los embeddings en dominios especializados; al ser un modelo de embeddings, el riesgo de alucinación se traslada a la recuperación de documentos irrelevantes.
- Advertencia de producción: no se recomienda desplegar esta variante en sistemas críticos sin una evaluación propia de recall y precisión frente al checkpoint original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MATRICXS74/voyage-4-nano-optrtn-w2g128
- Modelo base: https://huggingface.co/MongoDB/voyage-4-nano
- Herramienta de cuantización AutoRound: https://github.com/intel/auto-round
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference

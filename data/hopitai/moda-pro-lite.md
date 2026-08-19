# HopitAI/moda-pro-lite

## Resumen

MODA Pro Lite es un encoder de recuperación de moda (fashion retrieval) de 213 millones de parámetros desarrollado por Hopit AI, basado en el backbone SigLIP2-base-384 y construido con un vocabulario especializado en moda. Está diseñado para resolver búsqueda texto-imagen en catálogos de moda, generando embeddings de 768 dimensiones que permiten indexar y recuperar productos mediante similitud coseno. El modelo se distribuye con pesos abiertos bajo licencia Apache-2.0.

Su relevancia radica en que, combinado con su receta de servicio (disponible en el repositorio MODA Pro Lite+), se posiciona como el sistema abierto más fuerte en su clase de ≤250M parámetros para búsqueda de catálogo y títulos, superando a FashionSigLIP en varios benchmarks. El modelo es parte de la familia MODA, que incluye variantes como MODA Duo para enrutamiento por tipo de consulta y MODA para descripciones largas.

La arquitectura se basa en SigLIP2, un modelo de visión-lenguaje que alinea imágenes y texto en un espacio semántico compartido, optimizado específicamente para el dominio de la moda. El repositorio pesa 2,4 GB e incluye los pesos en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2-base-384 (encoder dual texto-imagen) |
| Parametros totales | 213 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos float32 para evaluación) |
| Idiomas soportados | no disponible (model card no especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MODA Pro Lite utiliza el backbone SigLIP2-base-384, un modelo de visión-lenguaje que emplea una función de pérdida sigmoide para el aprendizaje de representaciones conjuntas imagen-texto. El modelo ha sido adaptado al dominio de la moda mediante un vocabulario especializado, lo que le permite capturar matices semánticos propios de prendas, accesorios y estilos. Genera embeddings de 768 dimensiones para imágenes y texto, normalizados para usar similitud coseno.

Los detalles del entrenamiento son propietarios: la model card indica que el pipeline de datos y entrenamiento no es público, aunque los pesos son abiertos. El modelo se sirve con una receta de calibración documentada en el repositorio MODA Pro Lite+, que fusiona múltiples vistas en un único vector antes de la indexación, sin coste adicional en tiempo de consulta. Esta receta mejora el rendimiento entre un 2,5% y un 12,8% respecto al encoder sin calibrar en todos los benchmarks evaluados.

## Capacidades

- Recuperación texto-imagen en dominio moda: dado un texto descriptivo corto (títulos de producto), encuentra imágenes relevantes en un corpus.
- Recuperación imagen-texto: dado un producto visual, recupera descripciones o productos similares.
- Generación de embeddings densos de 768 dimensiones para indexación en bases de datos vectoriales.
- Búsqueda por similitud coseno con un único vector por elemento.
- Soporte de integración con OpenCLIP mediante `open_clip.create_model_and_transforms`.
- Optimizado para títulos cortos de catálogo (no para descripciones largas en lenguaje natural).

## Casos de uso

- Búsqueda en catálogos de e-commerce de moda: integrar el modelo como backend de búsqueda por texto donde el usuario escribe "botines de cuero negro" y el sistema recupera los productos más relevantes del catálogo usando similitud coseno sobre los embeddings precomputados.
- Recomendación visual de productos: a partir de una imagen de referencia, encontrar prendas o accesorios similares en el inventario, útil para funcionalidades de "productos similares" o "completa tu look".
- Moderación y clasificación automática de productos: asignar categorías o etiquetas a nuevos artículos comparando sus embeddings con los de productos ya etiquetados.
- Mejora de búsqueda híbrida: combinar los embeddings del modelo con búsqueda por palabras clave tradicional (BM25) para aumentar la precisión en catálogos grandes.
- Sistemas de recomendación cross-selling: identificar complementos (p. ej., un bolso que combine con unos zapatos) mediante similitud entre embeddings de productos.
- Indexación de inventario para asistentes virtuales: permitir que un chatbot de atención al cliente recupere productos exactos a partir de consultas en lenguaje natural cortas, usando el modelo como capa de recuperación.

## Benchmarks y rendimiento

La model card reporta MAP@10 (mean average precision at 10) sobre corpus completo con todas las consultas ground-truth, evaluado con `pytrec_eval map_cut.10` en float32. Se comparan tres variantes: MODA (FashionSigLIP con receta de servicio), Pro Lite (encoder sin calibrar) y Pro Lite+ (con receta).

| benchmark | MODA | Pro Lite (bare) | Pro Lite+ (con receta) |
|---|---:|---:|---:|
| KAGL | 0.2887 | 0.3055 | **0.3201** |
| Polyvore | 0.3726 | 0.3952 | **0.4049** |
| Atlas | 0.1862 | 0.1814 | **0.1904** |
| Fashion200K | **0.1946** | 0.1758 | 0.1846 |
| DeepFashion In-Shop | **0.1642** | 0.0930 | 0.1026 |
| DeepFashion Multimodal | **0.0147** | 0.0118 | 0.0133 |

Pro Lite+ lidera la clase ≤250M en KAGL, Polyvore y Atlas, con mejoras del +10,9% sobre MODA en KAGL y +8,7% en Polyvore, ambas significativas según un bootstrap pareado con 10.000 remuestras. Sin embargo, el modelo pierde claramente en DeepFashion In-Shop y DeepFashion Multimodal, donde las consultas son descripciones largas (media de 75 palabras), frente a MODA que obtiene 0,1642 vs 0,1026.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 213M parámetros, lo que en float32 requiere aproximadamente 852 MB solo para los pesos. Con activaciones y overhead, una GPU con 2-4 GB de VRAM es suficiente para inferencia por lotes pequeños.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4090, A100, H100). No requiere hardware especializado.
- Corre en GPU de consumo: sí, cabe en GPUs de gama media e incluso en CPU para inferencia puntual (aunque más lenta).
- Opciones de despliegue: al usar OpenCLIP, se puede servir con frameworks estándar de PyTorch. Para producción a escala, se puede exportar a ONNX o TensorRT y desplegar con TorchServe, Triton Inference Server o vLLM (si se adapta). No se menciona soporte nativo para llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no disponible en la información proporcionada. Al ser un encoder dual (imagen y texto por separado), la latencia depende del hardware y del tamaño de lote. Los embeddings de texto son rápidos de generar; los de imagen requieren preprocesamiento con el pipeline de OpenCLIP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| MODA Pro Lite (este) | 213M | no disponible | Apache-2.0 | Búsqueda texto-imagen en moda, títulos cortos |
| MODA (FashionSigLIP) | 203M | no disponible | Apache-2.0 (según repo) | Búsqueda texto-imagen en moda, descripciones largas |
| SigLIP-SO400M | ~400M | no disponible | Apache-2.0 | Visión-lenguaje general, no especializado en moda |
| ZooClaw | no disponible | no disponible | no disponible | Búsqueda de moda (referencia en benchmarks) |

MODA Pro Lite supera a MODA en títulos cortos (KAGL, Polyvore, Atlas) pero pierde en descripciones largas. SigLIP-SO400M es más grande y general, pero no está optimizado para el dominio de la moda. ZooClaw aparece como referencia en los benchmarks del repositorio, pero no se proporcionan datos comparativos directos en la model card.

## Limitaciones y advertencias

- Rendimiento deficiente en consultas de descripción larga en lenguaje natural: el modelo está optimizado para títulos cortos de catálogo. En DeepFashion In-Shop (consultas de ~75 palabras) obtiene 0,1026 frente a 0,1642 de MODA. Para ese caso, se recomienda usar MODA Duo.
- Sesgos de dominio: al estar entrenado con vocabulario de moda, puede no generalizar bien a otros dominios (texto general, otros productos).
- Idiomas soportados no especificados: la model card no indica qué idiomas maneja, lo que limita su uso en entornos multilingües sin verificación previa.
- Riesgo de alucinación no aplicable directamente: al ser un modelo de recuperación y no generativo, no produce texto nuevo, pero sí puede recuperar resultados irrelevantes si las consultas se alejan del dominio de entrenamiento.
- Datos de entrenamiento propietarios: aunque los pesos son Apache-2.0, el pipeline de datos no es público, lo que dificulta la reproducibilidad y la auditoría de sesgos.
- Sin cuantizaciones publicadas: no se documentan versiones cuantizadas (GGUF, int8, etc.), por lo que el despliegue en entornos con recursos limitados requiere conversión manual.
- Evaluación limitada a MAP@10: no se reportan otras métricas (recall, NDCG) ni resultados en tareas de generación o clasificación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HopitAI/moda-pro-lite
- Repositorio de archivos: https://huggingface.co/HopitAI/moda-pro-lite/tree/main
- MODA Pro Lite+ (receta de servicio): https://huggingface.co/HopitAI/moda-pro-lite-plus
- MODA Duo (enrutamiento por consulta): https://huggingface.co/HopitAI/moda-duo
- MODA (FashionSigLIP con receta): https://huggingface.co/HopitAI/moda-fashionsiglip-multiview-203m
- MODA-SigLIP-Distilled (recuperación imagen-imagen): https://huggingface.co/HopitAI/moda-fashion-distilled
- Repositorio GitHub con benchmark y evaluación: https://github.com/hopit-ai/Moda
- Documentación del benchmark: https://github.com/hopit-ai/Moda/blob/main/docs/index.html
- Artículo de cierre de la serie MODA: https://hopitai.substack.com/p/moda-series-finale

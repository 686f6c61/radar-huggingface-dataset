# FlorindoDev/OutfitTransformer-weights

## Resumen

El modelo OutfitTransformer-weights es un repositorio de pesos y embeddings precalculados para la implementación PyTorch del modelo OutfitTransformer, desarrollado por FlorindoDev. Este modelo se basa en la arquitectura descrita en el paper "OutfitTransformer: Learning Outfit Representations for Fashion Recommendation" (CVPR 2023) y aborda dos tareas principales en el ámbito de la recomendación de moda: la predicción de compatibilidad (CP) entre prendas y la recuperación de artículos complementarios (CIR) para completar outfits. El repositorio contiene checkpoints de entrenamiento y embeddings precalculados para los splits de train, validation y test del dataset Polyvore (subset nondisjoint), junto con las configuraciones y métricas de cada ejecución.

La arquitectura es un Transformer con 6 capas, 16 cabezas de atención, dimensión de entrada de 1024 (512 por modalidad), feedforward de 2024, activación Mish y dropout de 0.3. El modelo no es un modelo de lenguaje generativo; opera sobre embeddings precalculados de imágenes y descripciones de prendas generados por el encoder fashion-clip de patrickjohncyh. El tamaño del repositorio es de 21.4 GB, lo que incluye tanto los checkpoints como los embeddings precalculados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (encoder) con self-attention: 6 capas, 16 cabezas, feedforward 2024, activación Mish, dropout 0.3, pre-norm |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en, it (según metadatos de HuggingFace) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura del modelo sigue el diseño de OutfitTransformer: un encoder Transformer que procesa embeddings de dos modalidades (imagen y texto) concatenados en una representación de 1024 dimensiones. Cada modalidad aporta 512 dimensiones. El modelo consta de 6 capas con 16 cabezas de atención, una dimensión feedforward de 2024, activación Mish y dropout de 0.3. Se aplica pre-normalización (norm_first) y una LayerNorm adicional en la salida para la tarea de CP. Para la tarea de CIR, la salida es un embedding de 128 dimensiones sin normalización L2 en la configuración publicada.

El entrenamiento se realizó sobre el dataset Polyvore (identificador mvasil/polyvore-outfits), en el subset nondisjoint. Se utilizaron embeddings precalculados del encoder patrickjohncyh/fashion-clip, con el modo de características fijado a "precomputed" y los encoders no entrenables. Se publican dos ejecuciones: CP_precomputed y CIR_precomputed. La ejecución de CP alcanzó un AUC de 0.95082516 en validación en el epoch 73, con 106612 ejemplos de entrenamiento y 10000 de validación en ese epoch. La ejecución de CIR alcanzó una precisión FITB de 0.6854 en el epoch 17, con 53248 ejemplos de entrenamiento y 5000 de validación. El plan de entrenamiento configurado era de 200 épocas, aunque los checkpoints disponibles documentan hasta la época 81 para CP y la 42 para CIR.

## Capacidades

- Predicción de compatibilidad (CP): dado un conjunto de prendas, el modelo predice si forman un outfit coherente. Logra un AUC de 0.9508 en validación.
- Recuperación de artículos complementarios (CIR): dado un outfit incompleto, el modelo recupera el artículo que lo completa. Alcanza una precisión FITB del 68.54%.
- Generación de embeddings de outfits: produce representaciones de 128 dimensiones para la tarea CIR, útiles para búsqueda de similitud o clasificación.
- Integración con embeddings precalculados: el modelo no procesa imágenes ni texto directamente; opera sobre embeddings de fashion-clip precalculados.
- Soporte multilingüe: los metadatos indican inglés e italiano, pero no hay evidencia de que el modelo procese directamente texto en esos idiomas.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto; es un modelo discriminativo/embedding, no un LLM.

## Casos de uso

- Recomendación de outfits en e-commerce: el modelo puede evaluar la compatibilidad de combinaciones de prendas y sugerir conjuntos completos a los usuarios. Es adecuado porque la tarea CP está optimizada para predecir la coherencia de un outfit.
- Búsqueda de artículos complementarios: en una tienda online, dado un outfit incompleto, el modelo recupera la prenda que falta mediante la tarea CIR. Es útil para completar compras y aumentar el valor medio del pedido.
- Estilismo virtual: una aplicación de moda puede usar el modelo para generar sugerencias de outfits personalizados a partir de las prendas del armario del usuario. Los embeddings precalculados permiten una inferencia rápida.
- Análisis de colecciones de moda: los embeddings de outfits generados por el modelo pueden usarse para agrupar prendas por estilo o detectar tendencias en un catálogo. La representación de 128 dimensiones es compacta y adecuada para clustering.
- Investigación en recomendación de moda: los checkpoints y embeddings precalculados sirven como baseline reproducible para comparar nuevas arquitecturas o métodos. La documentación incluye métricas de validación claras.
- Optimización de catálogo: los minoristas pueden identificar qué combinaciones de productos son más compatibles y usar esa información para campañas de marketing o disposición en tienda. El modelo ofrece una puntuación de compatibilidad objetiva.
- Integración en pipelines de visión-lenguaje: los embeddings precalculados pueden alimentar modelos posteriores que necesiten representaciones de outfits, como sistemas de búsqueda multimodal. Al ser precalculados, reducen el coste computacional.

## Benchmarks y rendimiento

| Tarea | Métrica | Valor | Epoch del mejor checkpoint |
|---|---|---|---|
| Predicción de compatibilidad (CP) | AUC (validación) | 0.95082516 | 73 |
| Recuperación de artículos complementarios (CIR) | Precisión FITB (validación) | 0.6854 (68.54%) | 17 |

No se han publicado comparaciones con otros modelos en la información disponible. Los resultados corresponden únicamente a las ejecuciones CP_precomputed y CIR_precomputed sobre el subset nondisjoint de Polyvore.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo es pequeño (6 capas, dim 1024), pero no se especifica el consumo de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo se ejecuta con el código PyTorch del repositorio FlorindoDev/OutfitTransformer. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. El modelo es una implementación del OutfitTransformer de CVPR 2023; existen otras implementaciones como owj0421/outfit-transformer, pero no se han encontrado métricas comparables publicadas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El dataset Polyvore puede reflejar sesgos de género, cultura o moda occidental, pero no hay documentación al respecto en la información proporcionada.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto.
- Limitaciones de contexto o idioma: el modelo depende de embeddings precalculados de fashion-clip; no procesa directamente texto ni imágenes. Los metadatos indican en e it, pero no hay evidencia de soporte multilingüe real.
- Restricciones de licencia: la licencia no está especificada en HuggingFace ni en el repositorio. El uso comercial requiere verificar los términos con el autor.
- Caveat para producción: los pesos están en formato PyTorch (.pt), no en safetensors. El repositorio no incluye documentación de despliegue en servicios de inferencia estándar.
- El entrenamiento configurado era de 200 épocas, pero los checkpoints publicados solo documentan hasta la época 81 (CP) y 42 (CIR). No se puede confirmar que el entrenamiento esté completo.

## Enlaces

- HuggingFace: https://huggingface.co/FlorindoDev/OutfitTransformer-weights
- GitHub (código fuente y documentación): https://github.com/FlorindoDev/OutfitTransformer
- DeepWiki (documentación de la implementación de referencia): https://deepwiki.com/owj0421/outfit-transformer

Nota: El paper original "OutfitTransformer: Learning Outfit Representations for Fashion Recommendation" fue presentado en CVPR 2023, pero no se ha encontrado un enlace directo al paper en la información disponible.

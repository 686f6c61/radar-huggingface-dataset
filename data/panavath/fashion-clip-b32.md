# Panavath/fashion-clip-b32

## Resumen

Fashion CLIP (ViT-B-32) es un modelo de visión-lenguaje desarrollado por Panavath, especializado en el dominio de la moda y el comercio electrónico. Se trata de un ajuste fino (fine-tuning) del modelo CLIP ViT-B-32 de OpenAI sobre un catálogo de productos de moda, con el objetivo de habilitar búsqueda visual de productos, clasificación zero-shot y extracción de características multimodales. El modelo proyecta imágenes y textos en un espacio de embeddings común de 512 dimensiones, permitiendo calcular similitudes coseno entre ambos. Está publicado bajo licencia MIT y es compatible con la librería OpenCLIP, lo que facilita su integración en pipelines de búsqueda y recomendación. Su relevancia actual radica en la creciente demanda de sistemas de "shop the look" y personalización en el sector retail, donde los modelos CLIP adaptados a dominios específicos ofrecen una alternativa eficiente a los sistemas de etiquetado manual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B-32 (Vision Transformer, patch 32x32) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (CLIP estándar usa 77 tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | mit |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura CLIP de OpenAI, compuesta por un codificador de imágenes ViT-B-32 y un codificador de texto Transformer. Ambos codificadores producen embeddings de 512 dimensiones que se alinean mediante un objetivo de contraste. El ajuste fino se realizó sobre un catálogo de comercio electrónico de moda, aunque la model card no especifica el número de pares imagen-texto ni la composición exacta del dataset. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es puramente contrastivo. La innovación principal es la adaptación del modelo a un dominio vertical, lo que mejora la precisión en tareas de recuperación y clasificación de prendas frente al CLIP genérico.

## Capacidades

- Extracción de características multimodales: genera embeddings normalizados para imágenes y textos, listos para calcular similitudes coseno.
- Búsqueda visual de productos: permite consultas por imagen o por descripción textual para encontrar artículos similares en un catálogo.
- Clasificación zero-shot: puede asignar categorías o atributos a imágenes sin entrenamiento adicional, mediante prompts textuales.
- Soporte de tool calling: no aplica, es un modelo de embeddings, no un modelo generativo.
- Capacidades multilingües: solo inglés, según la etiqueta de idioma.
- Capacidades especiales: no incluye generación de texto, visión adicional ni modo de razonamiento.

## Casos de uso

- Búsqueda de productos por descripción textual en tiendas online: el usuario escribe "vestido azul de flores" y el sistema devuelve imágenes de productos relevantes calculando la similitud entre el embedding del texto y los embeddings de las imágenes del catálogo.
- Recomendación de productos similares por imagen: a partir de una foto de una prenda, se obtienen sus embeddings y se buscan los productos más cercanos en el espacio vectorial, ideal para funcionalidades de "me gusta" o "ver similares".
- Clasificación automática de artículos en categorías: se definen prompts como "una camisa", "unos pantalones", "un vestido" y se asigna cada imagen a la categoría con mayor similitud, sin necesidad de entrenar un clasificador específico.
- Etiquetado automático de imágenes de catálogo: se generan descripciones textuales (por ejemplo, "chaqueta de cuero negra") y se asignan a las imágenes mediante similitud, reduciendo el trabajo manual en la gestión de inventario.
- Moderación de contenido visual en marketplaces: se pueden detectar productos fuera de la política de la plataforma comparando embeddings con textos de referencia (por ejemplo, "ropa de segunda mano").
- Integración en sistemas de "shop the look": a partir de una foto de un outfit, se identifican prendas individuales y se ofrecen alternativas similares del catálogo, mejorando la experiencia de compra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de datos específicos de VRAM o latencia en la documentación del modelo.
- Al tratarse de un ViT-B-32, el modelo es relativamente ligero en comparación con arquitecturas más grandes. Se estima que puede ejecutarse en GPUs de consumo como una RTX 3060 o incluso en CPU para inferencia por lotes pequeños, aunque no hay cifras confirmadas.
- El tamaño del repositorio es de 1.2 GB, lo que sugiere que los pesos en safetensors ocupan aproximadamente ese espacio, posiblemente en precisión FP32.
- Para despliegue, es compatible con OpenCLIP y PyTorch. Se puede servir mediante frameworks como vLLM o TGI, aunque al ser un modelo de embeddings, es más común usarlo en pipelines de indexación vectorial (por ejemplo, con FAISS o Milvus).
- No se proporcionan datos de throughput ni latencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dataset de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| Panavath/fashion-clip-b32 | ViT-B-32 | Catálogo de moda (no especificado) | MIT | Hugging Face |
| patrickjohncyh/fashion-clip | ViT-B/32 | 700K pares de Farfetch | no disponible | Hugging Face, PyPI |
| OpenAI CLIP ViT-B/32 | ViT-B/32 | 400M pares imagen-texto (WebImageText) | MIT (código) | Repos oficiales |

El modelo de Panavath es una variante del FashionCLIP original de Patrick John Chia, con la diferencia de que no se detalla el dataset de entrenamiento. Ambos comparten la misma arquitectura base y objetivo. El CLIP original es más generalista, mientras que los modelos fine-tuneados en moda ofrecen mejor rendimiento en tareas específicas del sector, aunque no se dispone de métricas comparativas.

## Limitaciones y advertencias

- El modelo solo soporta inglés, lo que limita su uso en mercados hispanohablantes sin adaptación adicional.
- Al estar especializado en moda, su rendimiento fuera de este dominio será significativamente inferior al de un CLIP genérico.
- No se especifica el dataset de entrenamiento, por lo que no es posible evaluar posibles sesgos en cuanto a tallas, estilos, etnias o géneros representados.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, pero puede producir similitudes incorrectas si los prompts son ambiguos o el catálogo contiene productos atípicos.
- La licencia MIT permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento para evitar problemas de propiedad intelectual.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas concretas no está validado externamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Panavath/fashion-clip-b32
- Repositorio original de FashionCLIP: https://github.com/patrickjohncyh/fashion-clip
- Paquete PyPI de FashionCLIP: https://pypi.org/project/fashion-clip/
- Modelo original de FashionCLIP en Hugging Face: https://huggingface.co/patrickjohncyh/fashion-clip

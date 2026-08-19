# HopitAI/moda-pro-lite-plus

## Resumen

MODA Pro Lite+ es un sistema de recuperación de moda (fashion retrieval) desarrollado por Hopit AI, que aplica una receta de codificación multi-vista calibrada sobre el encoder MODA Pro Lite, un modelo de 213 millones de parámetros basado en SigLIP2. El modelo resuelve el problema de búsqueda de productos de moda en catálogos y títulos cortos, mejorando el rendimiento sin añadir parámetros adicionales ni coste en tiempo de consulta. Su relevancia actual radica en que lidera la clase de sistemas abiertos de ≤250M parámetros en benchmarks como KAGL, Polyvore y Atlas, superando a FashionSigLIP en tareas de búsqueda por título de catálogo.

El repositorio no contiene pesos propios, sino una receta ejecutable que combina tres vistas de imagen (original, con padding cuadrado y con padding de primer plano) en un único vector por ítem, y añade un prompt fijo a las consultas de texto. Los pesos se cargan dinámicamente desde el modelo base `HopitAI/moda-pro-lite` en tiempo de ejecución. La licencia es Apache-2.0 y la librería utilizada es OpenCLIP.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en SigLIP2, encoder de recuperación) |
| Parametros totales | 213M (heredados de `moda-pro-lite`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de embeddings, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio de receta; los pesos se cargan desde `HopitAI/moda-pro-lite`) |

## Arquitectura y entrenamiento

MODA Pro Lite+ es un encoder de recuperación texto-imagen basado en la arquitectura SigLIP2, con 213 millones de parámetros. El modelo base fue entrenado por Hopit AI con un pipeline propietario que no se ha hecho público; solo se sabe que los pesos son abiertos bajo Apache-2.0 pero el proceso de entrenamiento y los datos utilizados son confidenciales. La innovación de Pro Lite+ no está en la arquitectura, sino en la receta de servicio: para documentos, se codifican tres vistas de la imagen (original, con padding cuadrado y con padding de primer plano) y se combinan linealmente con pesos 1.0, 0.25 y 0.25 respectivamente, normalizando el resultado. Para consultas, se añade el prompt fijo `"a photo of {query}"` con un peso de 0.25 sobre la consulta original. Esta combinación se fusiona en un único vector unitario antes de indexar, de modo que el coste de búsqueda por vecinos próximos es idéntico al del encoder desnudo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO, ya que el pipeline es propietario.

## Capacidades

- Recuperación texto-imagen para moda: dado un texto descriptivo corto (título de producto), devuelve imágenes relevantes de un catálogo.
- Recuperación imagen-imagen indirecta: aunque el modelo está orientado a texto-imagen, también puede codificar imágenes para búsqueda por similitud visual.
- Generación de embeddings de 768 dimensiones con normalización L2, listos para indexación en cualquier base de datos vectorial.
- Búsqueda por similitud coseno mediante producto escalar sobre vectores normalizados.
- Soporte para indexación ANN (approximate nearest neighbor) con librerías como HNSWLib.
- No es un modelo generativo: no produce texto ni imágenes, solo representaciones vectoriales.
- No soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Búsqueda en catálogo de e-commerce: integrar el modelo en un motor de búsqueda para que los usuarios encuentren productos escribiendo títulos cortos como "botines de cuero negro". La receta multi-vista mejora la precisión en catálogos grandes sin coste adicional en consulta.
- Recomendación de productos similares: codificar todas las imágenes del catálogo con el modelo y usar los vectores para recomendar artículos visualmente parecidos al que el usuario está viendo.
- Etiquetado automático de productos: dado un lote de imágenes, generar embeddings y compararlos con embeddings de texto de categorías predefinidas para asignar etiquetas automáticamente.
- Moderación de contenido visual: detectar si una imagen corresponde a un producto de moda válido comparando su embedding con un conjunto de referencia.
- Personalización de tienda online: usar los embeddings de las interacciones del usuario (clics, búsquedas) para ordenar los resultados según la similitud con sus preferencias históricas.
- Indexación de catálogos para búsqueda multimodal: combinar el modelo con un sistema de búsqueda vectorial (por ejemplo, Milvus o FAISS) para ofrecer búsqueda híbrida texto-imagen en tiempo real.

## Benchmarks y rendimiento

La model card proporciona resultados de MAP@10 sobre corpus completo con todas las consultas de ground-truth, evaluados con `pytrec_eval map_cut.10`. Se comparan tres variantes: MODA (FashionSigLIP con su propia receta), Pro Lite (encoder desnudo) y Pro Lite+ (con la receta).

| benchmark | MODA | Pro Lite (bare) | Pro Lite+ (con receta) |
|---|---:|---:|---:|
| KAGL | 0.2887 | 0.3055 | **0.3201** |
| Polyvore | 0.3726 | 0.3952 | **0.4049** |
| Atlas | 0.1862 | 0.1814 | **0.1904** |
| Fashion200K | **0.1946** | 0.1758 | 0.1846 |
| DeepFashion In-Shop | **0.1642** | 0.0930 | 0.1026 |
| DeepFashion Multimodal | **0.0147** | 0.0118 | 0.0133 |

Pro Lite+ lidera la clase ≤250M en KAGL, Polyvore y Atlas, con mejoras de +10.9% sobre MODA en KAGL y +8.7% en Polyvore, ambas significativas según un bootstrap pareado con 10 000 remuestras. La receta aporta entre +2.5% y +12.8% sobre el encoder desnudo en todos los benchmarks. Sin embargo, en DeepFashion In-Shop, donde las consultas son descripciones largas (media de 75 palabras), Pro Lite+ obtiene 0.1026 frente a 0.1642 de MODA, lo que indica una debilidad clara en ese escenario.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM ni latencia.
- El modelo tiene 213M de parámetros; en float32 ocupa aproximadamente 852 MB, y en float16 unos 426 MB, por lo que es ejecutable en GPUs de consumo con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060 o superior) puede ejecutar el modelo sin problemas. Para indexación de catálogos grandes se recomienda más memoria RAM que VRAM.
- Opciones de despliegue: al ser un modelo OpenCLIP, se puede servir con vLLM (aunque no es un modelo generativo), o más adecuadamente con librerías de embeddings como `sentence-transformers` o directamente con OpenCLIP y una base vectorial (FAISS, HNSWLib, Milvus).
- El coste de servicio es bajo: 1 vector almacenado por ítem, 1 consulta ANN por búsqueda, 3 forwards de imagen en indexación (solo offline) y 2 forwards de texto por consulta.

## Comparativa con modelos similares

La siguiente tabla compara MODA Pro Lite+ con los modelos de la misma familia y con FashionSigLIP, basándose en los datos disponibles.

| Modelo | Parámetros | Contexto | Licencia | MAP@10 KAGL | MAP@10 Polyvore | Disponibilidad |
|---|---|---|---:|---:|---:|---|
| MODA Pro Lite+ | 213M | no aplica | Apache-2.0 | 0.3201 | 0.4049 | HuggingFace (receta) |
| MODA Pro Lite (bare) | 213M | no aplica | Apache-2.0 | 0.3055 | 0.3952 | HuggingFace |
| MODA (FashionSigLIP) | 203M | no aplica | Apache-2.0 | 0.2887 | 0.3726 | HuggingFace |

No se dispone de datos de otros modelos de recuperación de moda como FashionCLIP o ZooClaw en la información proporcionada.

## Limitaciones y advertencias

- El modelo está optimizado para títulos cortos de catálogo; en descripciones largas y naturales (por ejemplo, reseñas o párrafos descriptivos) su rendimiento cae significativamente, como muestra el benchmark DeepFashion In-Shop.
- El pipeline de entrenamiento y los datos son propietarios, aunque los pesos sean abiertos; esto limita la reproducibilidad y la capacidad de auditar posibles sesgos.
- No se especifican los idiomas soportados; el prompt fijo `"a photo of {query}"` sugiere que el modelo está orientado al inglés, y su comportamiento en otros idiomas es desconocido.
- Al ser un modelo de recuperación, puede sufrir alucinaciones en el sentido de devolver resultados irrelevantes si las consultas se alejan del dominio de moda.
- No se han publicado estudios de sesgos; es probable que el modelo refleje los sesgos presentes en los datos de entrenamiento, especialmente en cuanto a tipos de cuerpo, estilos y culturas representadas.
- Para uso en producción, se recomienda evaluar el modelo en el corpus específico antes de desplegarlo, dado que el rendimiento varía notablemente entre benchmarks.

## Enlaces

- [HuggingFace - HopitAI/moda-pro-lite-plus](https://huggingface.co/HopitAI/moda-pro-lite-plus)
- [HuggingFace - HopitAI/moda-pro-lite (modelo base)](https://huggingface.co/HopitAI/moda-pro-lite)
- [GitHub - hopit-ai/Moda](https://github.com/hopit-ai/Moda)
- [HuggingFace - HopitAI/moda-duo (modelo relacionado)](https://huggingface.co/HopitAI/moda-duo)
- [HuggingFace - HopitAI/moda-fashionsiglip-multiview-203m (MODA)](https://huggingface.co/HopitAI/moda-fashionsiglip-multiview-203m)
- [HuggingFace - HopitAI/moda-fashion-distilled (MODA-SigLIP-Distilled)](https://huggingface.co/HopitAI/moda-fashion-distilled)

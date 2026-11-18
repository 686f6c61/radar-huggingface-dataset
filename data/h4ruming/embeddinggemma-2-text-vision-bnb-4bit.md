# H4RUming/embeddinggemma-2-text-vision-bnb-4bit

## Resumen

EmbeddingGemma 2 text+vision 4-bit es una derivación no oficial de `google/embeddinggemma-2`, publicada por el usuario H4RUming. Se trata de un modelo de embeddings multimodales (texto e imagen) cuantizado a 4 bits con bitsandbytes NF4 y cuantización doble, pensado para ejecutarse en GPUs con poca memoria. El autor ha eliminado el codificador de audio del modelo original (304,8 M de parámetros) y ha mantenido intactas las rutas de texto e imagen, de modo que las representaciones de texto e imagen son equivalentes a las del modelo base en bfloat16.

El modelo resuelve el problema de desplegar un encoder de embeddings multimodal de calidad en hardware limitado: reduce el consumo de memoria de GPU de 1,39 GiB (original) a 0,42 GiB, y el tamaño en disco de 1.420 MiB a 460 MiB. Conserva la licencia Apache 2.0 del original y la librería sentence-transformers como interfaz de uso.

Es relevante ahora porque permite ejecutar búsqueda semántica y recuperación multimodal en dispositivos de borde (el autor reporta mediciones en una Jetson Orin Nano de 8 GB) con una degradación de calidad medida y acotada. El modelo tiene 438.760.472 parámetros totales y un repositorio de 0,5 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (embedding_gemma2) con codificador de audio eliminado |
| Parámetros totales | 438.760.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor fija `max_seq_length = 2048` en el ejemplo de uso; el valor por defecto del modelo es "prácticamente ilimitado" según la model card) |
| Tipos de cuantización | 4 bits NF4 con cuantización doble (bitsandbytes); capas lineales cuantizadas, tabla de embeddings de tokens en bfloat16 |
| Idiomas soportados | no disponible (el autor solo valida con coreano en sus mediciones) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es una cuantización del encoder multimodal `google/embeddinggemma-2`. La modificación respecto al original consiste en dos cambios: la eliminación del codificador de audio (`audio_tower`, `embed_audio`, 304,8 M de parámetros) y la cuantización a 4 bits de las capas lineales mediante bitsandbytes NF4 con cuantización doble, manteniendo el cálculo en bfloat16. La tabla de embeddings de tokens permanece en bfloat16 sin cuantizar. No se ha reentrenado ningún peso.

El autor justifica la eliminación del audio porque las rutas de texto e imagen no atraviesan el codificador de audio, por lo que las embeddings de texto e imagen son idénticas a las del modelo original (diferencia máxima 0). El modelo conserva los prefijos de consulta y documento (`prompt_name="SearchQuery"`, formato `title: {título} | text: {cuerpo}`) definidos en la model card del modelo base. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la información proporcionada.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y recuperación de información.
- Generación de embeddings de imagen (entrada vía PIL, con `torch.autocast` a bfloat16).
- Embeddings multimodales en un espacio compartido texto-imagen.
- Extracción de características (`feature-extraction`) mediante sentence-transformers.
- Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- Soporte de prefijos de consulta y documento para tareas de retrieval.
- No soporta audio: la entrada de audio lanza `ValueError`.
- La entrada de vídeo no ha sido probada según el autor.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no es un modelo generativo).

## Casos de uso

- Búsqueda semántica de documentos en coreano: el autor valida con 5.000 anuncios de subvenciones públicas (título y resumen) y 42 consultas en lenguaje natural, obteniendo R@1 de 0,667 y R@10 de 0,976 con la versión de 4 bits. Adecuado para recuperación de normativa o convocatorias en producción.
- Despliegue en dispositivos de borde: con 0,42 GiB de memoria de GPU, cabe en una Jetson Orin Nano de 8 GB y procesa 29,3 documentos por segundo con lotes de 16, lo que permite indexación local sin conexión.
- Búsqueda multimodal texto-a-imagen: el modelo genera embeddings de imagen en el mismo espacio que el texto, útil para catálogos visuales; el autor advierte que la calidad de recuperación de imagen no está validada.
- Deduplicación y agrupación semántica de textos: los embeddings permiten calcular similitud coseno por lotes para agrupar documentos similares en pipelines de limpieza de datos.
- Sistemas de recomendación basados en contenido: comparar la embedding de una consulta con las de un catálogo de ítems para ordenar resultados por relevancia semántica.
- Detección de similitud entre pares de frases (sinónimos): el autor mide AUC de 0,801 en 33 pares de sinónimos en coreano, lo que sirve para tareas de normalización terminológica.
- Recuperación aumentada (RAG) en entornos con VRAM limitada: sustituir un encoder de mayor tamaño por esta variante cuantizada cuando la GPU no permite cargar el original de 1,39 GiB junto al modelo generativo.

## Benchmarks y rendimiento

Mediciones del autor en Jetson Orin Nano 8 GB (JetPack 7.2.1, torch 2.15.0+cu132), comparando la variante sin audio en bfloat16 con esta versión de 4 bits:

| Métrica | Sin audio (bf16) | 4 bits (este modelo) |
|---|---|---|
| R@1, consultas en lenguaje natural | 0,690 | 0,667 |
| R@10, consultas en lenguaje natural | 0,952 | 0,976 |
| MRR, consultas en lenguaje natural | 0,801 | 0,789 |
| AUC de sinónimos | 0,815 | 0,801 |
| Velocidad (lote de 16) | 29,7 docs/s | 29,3 docs/s |

Similitud coseno con el original en bfloat16: mínimo 0,981 en texto (10 frases en coreano) y 0,939 en imagen (una imagen sintética). El autor indica que el intervalo de confianza bootstrap al 95 % para la diferencia de MRR es [−0,062, +0,089], que incluye el cero, y advierte que la muestra es pequeña. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0,42 GiB de memoria de GPU para los pesos del modelo (frente a 0,82 GiB sin audio y 1,39 GiB del original).
- Disco: 460 MiB (frente a 868 MiB sin audio y 1.420 MiB del original).
- GPU: requiere CUDA y bitsandbytes; no se puede cargar en CPU. Validado en Jetson Orin Nano 8 GB. No se especifican otras GPU recomendadas.
- Cabe en GPU de consumo con al menos ~0,5 GiB de VRAM libre, siempre que soporten CUDA y bitsandbytes.
- Despliegue: sentence-transformers >= 6.1, transformers >= 5.19, torchvision, bitsandbytes y accelerate.
- Rendimiento medido: 29,3 documentos por segundo con lotes de 16 en Jetson Orin Nano 8 GB.
- Alternativa de 8 bits: mayor fidelidad (0,999 de similitud con el original) pero 12,8 documentos por segundo en el mismo equipo y cálculo interno en float16, que el autor descarta por la prohibición de float16 en la model card del modelo original.

## Comparativa con modelos similares

| Modelo | Parámetros | Memoria de GPU | Disco | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (4 bits) | 438,8 M | 0,42 GiB | 460 MiB | Apache 2.0 | Sin audio; texto e imagen |
| Derivado sin audio (bf16) | 438,8 M | 0,82 GiB | 868 MiB | Apache 2.0 | Sin audio; texto e imagen |
| google/embeddinggemma-2 (original) | no disponible (incluye 304,8 M de audio) | 1,39 GiB | 1.420 MiB | Apache 2.0 | Texto, imagen y audio |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es una derivación no oficial; no es un lanzamiento de Google.
- La calidad de recuperación de imágenes no está validada: solo se comprobó que las embeddings de imagen no contienen NaN y que su similitud con el original es de 0,939. El autor señala que la imagen es más sensible a la cuantización que el texto.
- No soporta entrada de audio (`ValueError`); la entrada de vídeo no se ha probado.
- Requiere GPU CUDA y bitsandbytes; no funciona en CPU.
- La validación empírica se limita al coreano (10 frases, 42 consultas, 33 pares de sinónimos); no hay datos de otros idiomas.
- Las métricas de recuperación proceden de una muestra pequeña y el intervalo de confianza del MRR incluye el cero; deben tomarse como orientativas.
- Riesgo de alucinación no aplica como modelo generativo, pero la recuperación semántica puede devolver resultados irrelevantes en dominios fuera de distribución.
- No se documentan sesgos conocidos en la información disponible.
- Licencia Apache 2.0, que permite uso comercial; deben conservarse los avisos de atribución al modelo original de Google.
- El valor por defecto de `max_seq_length` es prácticamente ilimitado; el autor recomienda fijarlo explícitamente (por ejemplo, 2048) para evitar consumos de memoria inesperados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H4RUming/embeddinggemma-2-text-vision-bnb-4bit
- Modelo base: https://huggingface.co/google/embeddinggemma-2

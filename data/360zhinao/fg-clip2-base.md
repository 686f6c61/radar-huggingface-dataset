# 360ZhiNao/fg-clip2-base

## Resumen

FG-CLIP 2 (variante `base`) es un modelo de alineación visión-lenguaje de grano fino, bilingüe inglés-chino, desarrollado por 360 ZhiNao (Qihoo 360). Se trata de un modelo tipo CLIP que resuelve el problema de la correspondencia precisa entre regiones de una imagen y descripciones textuales detalladas, superando a los CLIP clásicos en tareas que requieren granularidad fina como la recuperación imagen-texto, la clasificación zero-shot o la localización de objetos. Su relevancia actual radica en que, según la model card, supera a SigLIP 2 y MetaCLIP 2 en 29 conjuntos de datos y 8 tareas distintas, y lo hace con soporte nativo para dos idiomas.

Arquitectura basada en transformer (codificador de imagen y codificador de texto tipo CLIP, con atención de parches dinámica), con 383.803.394 parámetros totales según los pesos en safetensors. El modelo se distribuye con licencia Apache 2.0 y está pensado para integrarse en `transformers` mediante `trust_remote_code`.

La ficha se refiere a la variante `base`; el repositorio forma parte de la colección FG-CLIP 2, que incluye otros tamaños y la versión anterior FG-CLIP v1.0 (presentada en ICML 2025).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje tipo CLIP (codificadores de imagen y texto con atención de parches) |
| Parámetros totales | 383.803.394 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesamiento por parches; `max_num_patches` configurable entre 128 y 1024; texto hasta 196 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`transformers`, `trust_remote_code`) |

## Arquitectura y entrenamiento

FG-CLIP 2 sigue la estela de los modelos CLIP: dos codificadores independientes, uno visual y otro textual, entrenados con un objetivo contrastivo para alinear representaciones de imagen y texto en un espacio común. La innovación principal respecto a CLIP clásico es el énfasis en el alineamiento de grano fino, es decir, en la correspondencia entre regiones concretas de la imagen y fragmentos específicos de texto, no solo entre la imagen global y una frase.

El modelo incorpora procesamiento de imagen por parches con resolución dinámica: el `image_processor` acepta el parámetro `max_num_patches`, que en los ejemplos de la model card se ajusta entre 128 y 1024 según el tamaño de la imagen. Para texto, el tokenizador admite dos modos de codificación (`walk_type`): `"short"` con `max_length=64` para descripciones cortas y `"long"` con `max_length=196` para descripciones largas. El modelo expone `get_image_features` y `get_text_features`, además de `logit_scale` y `logit_bias` para calcular similitudes calibradas. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF/DPO.

## Capacidades

- Recuperación imagen-texto (retrieval) bidireccional en inglés y chino, con soporte para descripciones cortas y largas.
- Clasificación zero-shot de imágenes mediante prompts textuales.
- Alineamiento de grano fino entre regiones de imagen y fragmentos de texto.
- Generación de características densas (dense features) visuales y textuales normalizadas para búsqueda por similitud coseno.
- Procesamiento de imágenes a resolución variable mediante parches dinámicos.
- Soporte bilingüe nativo inglés-chino.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni modalidades de audio.

## Casos de uso

- Búsqueda visual en catálogos de producto: indexar imágenes de un catálogo con `get_image_features` y consultar con descripciones textuales detalladas en chino o inglés, aprovechando el modo `walk_type="long"` para captions ricas en atributos (color, material, estilo).
- Moderación y etiquetado automático de contenido: clasificación zero-shot de imágenes contra un conjunto de categorías textuales definidas por el equipo, sin necesidad de reentrenar.
- Sistemas de recomendación multimodal: calcular similitud entre imágenes de producto y descripciones o reseñas de usuario para mejorar el ranking.
- Accesibilidad y descripción de imágenes: emparejar imágenes con descripciones textuales detalladas para verificar o generar alt-text de calidad en pipelines de publicación.
- Búsqueda en archivos de imágenes corporativas: recuperación de imágenes por consulta en lenguaje natural en repositorios bilingües, con resolución dinámica de parches para imágenes de distinto tamaño.
- Análisis de contenido en redes sociales: clasificación y agrupación de imágenes por temática mediante embeddings visuales y textuales normalizados.
- Verificación de correspondencia imagen-texto en e-commerce: detectar discrepancias entre la foto de un producto y su descripción antes de publicar.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card afirma que el modelo supera a SigLIP 2 y MetaCLIP 2 en 29 conjuntos de datos y 8 tareas, pero no se proporcionan las cifras concretas en el material consultado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 383,8 M de parámetros, en FP16 requiere aproximadamente 0,8 GB solo para los pesos; en FP32, unos 1,5 GB. El consumo real depende del tamaño de lote y del número de parches de imagen (`max_num_patches` hasta 1024).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en FP16; se recomienda RTX 3060/4060 o superior para uso en producción con lotes moderados. Para lotes grandes o procesamiento masivo, A100 o H100 no son necesarios pero ofrecen mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 4060, GTX 1660 Super en FP16).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el código personalizado del modelo); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, dado que es un modelo de embeddings y no un LLM generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Contexto / resolución | Notas |
|---|---|---|---|---|---|
| FG-CLIP 2 base (este modelo) | 383,8 M | en, zh | Apache 2.0 | Parches dinámicos (128-1024), texto hasta 196 tokens | Afirma superar a SigLIP 2 y MetaCLIP 2 en 29 datasets y 8 tareas |
| SigLIP 2 | No disponible en la información | No disponible | No disponible | No disponible | Citado como baseline superado según la model card |
| MetaCLIP 2 | No disponible en la información | No disponible | No disponible | No disponible | Citado como baseline superado según la model card |
| FG-CLIP v1.0 | No disponible en la información | en, zh | Apache 2.0 (según repo) | No disponible | Versión anterior, presentada en ICML 2025 |

No se dispone de datos de rendimiento numéricos de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no se documenta cobertura de otros idiomas.
- Es un modelo de alineamiento visión-lenguaje, no un LLM generativo: no genera texto libre ni mantiene conversaciones.
- La model card no detalla sesgos conocidos ni evaluación de robustez frente a imágenes adversarias o dominios alejados del entrenamiento.
- Riesgo de alucinación en el sentido de falsos positivos en la similitud imagen-texto cuando las descripciones son ambiguas o muy genéricas.
- El uso de `trust_remote_code=True` implica ejecutar código del autor; conviene auditar el repositorio antes de desplegarlo en producción.
- La longitud de texto está limitada a 196 tokens en modo `long`; descripciones más largas se truncan.
- No se documentan restricciones adicionales de la licencia Apache 2.0 para uso comercial, pero se recomienda revisar los términos del repositorio y de los datos de entrenamiento.
- No hay información sobre el dataset de entrenamiento, lo que dificulta evaluar la cobertura de dominios y posibles sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/360ZhiNao/fg-clip2-base
- Paper FG-CLIP 2: https://arxiv.org/abs/2510.10921
- Paper FG-CLIP v1.0: https://arxiv.org/abs/2505.05071
- Código: https://github.com/360CVGroup/FG-CLIP
- Página del proyecto: https://360cvgroup.github.io/FG-CLIP
- Colección FG-CLIP 2 en Hugging Face: https://huggingface.co/collections/qihoo360/fg-clip-2-68ecbf9c548623bb78bc7913
- Dataset FineHARD (v1): https://huggingface.co/datasets/qihoo360/FineHARD
- DeepWiki del proyecto: https://deepwiki.com/360CVGroup/FG-CLIP
- API/MCP de FG-CLIP 2: https://research.360.cn/sass/index

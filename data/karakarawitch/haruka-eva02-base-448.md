# KaraKaraWitch/haruka-eva02-base-448

## Resumen

Haruka-EVA02-base-448 es un backbone de visión (vision transformer) especializado en ilustración anime y arte digital, publicado por el usuario KaraKaraWitch. Se trata de un fine-tuning del checkpoint `eva02_base_patch14_448.mim_in22k_ft_in22k_in1k` de timm sobre 9,1 millones de ilustraciones deduplicadas de Danbooru y 98.726 etiquetas, con el objetivo de servir como extractor de características, encoder para clustering o modelo base para clasificadores downstream. El modelo no incluye cabeza de clasificación: se distribuye como extractor puro de embeddings de 768 dimensiones.

La relevancia de este checkpoint radica en que el EVA-02 original solo ha visto etiquetas de ImageNet (fotos), mientras que este ha sido expuesto a un vocabulario muy fino de personajes (32,8k), artistas (40,2k), copyrights (7,3k) y etiquetas generales (22,3k). Esto le permite capturar detalles de lineart, vestuario, accesorios y rasgos faciales que un ViT entrenado en ImageNet no discrimina. El autor reporta además que los embeddings siguen separando correctamente sujetos en fotografías reales, aunque no aporta métricas cuantitativas de ello.

Arquitectura EVA-02 base con patch de 14 píxeles y resolución de entrada 448x448, 86,3 millones de parámetros y una rejilla espacial de 32x32 tokens (1.024 tokens de 768 dimensiones). El repositorio ocupa 0,4 GB y se distribuye en safetensors para su uso con timm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EVA-02 (vision transformer) base, patch 14, resolución 448 |
| Parametros totales | 86.348.544 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 448x448 px, 1.024 tokens espaciales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen); etiquetas de Danbooru mayoritariamente en inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de visión EVA-02 base con patch embedding de 14x14 y resolución de 448x448, que produce una rejilla de 32x32 parches (1.024 tokens) de 768 dimensiones más el token CLS. La arquitectura EVA-02 incorpora RoPE 2D y capas feed-forward con SwiGLU, y el checkpoint original de timm fue preentrenado con MIM (masked image modeling) y ajustado con CLIP e ImageNet. Sobre esa base, el autor realizó un fine-tuning de 5 épocas sobre 9,1 millones de ilustraciones deduplicadas de Danbooru con 98.726 etiquetas, empleando Two-Sided Instance Repeat Factor Sampling (IRFS) para manejar el desbalance de la cola larga y Asymmetric Loss para la clasificación multietiqueta.

El preprocesado de entrenamiento compone las imágenes con canal alfa sobre fondo blanco, redimensiona preservando la relación de aspecto con interpolación BICUBIC a 448x448, rellena con blanco y normaliza con media y desviación estándar de ImageNet. El checkpoint publicado elimina la cabeza de clasificación (`num_classes=0`) y expone `forward_features()` para obtener la secuencia completa de tokens. El autor documenta además una estrategia de pooling por ventanas deslizantes 3x3 solapadas de 16x16 tokens para evitar que fondos o personajes secundarios diluyan el embedding del sujeto principal.

## Capacidades

- Extracción de características visuales: devuelve un vector global de 768 dimensiones (media de los 1.024 tokens) o la secuencia completa de tokens espaciales.
- Pooling espacial por ventanas: 9 ventanas solapadas de 16x16 tokens para representaciones locales más robustas ante fondos o múltiples sujetos.
- Clustering no supervisado de ilustraciones por personaje, artista, estilo o vestuario.
- Clasificación multietiqueta downstream sobre el vocabulario de Danbooru (personajes, artistas, copyrights, etiquetas generales) mediante fine-tuning de una cabeza.
- Búsqueda por similitud y deduplicación de imágenes en espacios de embeddings.
- Transferencia a fotografías reales: el autor afirma que los embeddings separan vestuario, poses, objetos y personas en fotos, sin métricas publicadas.
- No soporta tool calling, agentes, generación de texto ni razonamiento multi-paso: es exclusivamente un encoder visual.

## Casos de uso

- Etiquetado automático de ilustraciones anime: se conecta una cabeza lineal multietiqueta sobre el backbone y se entrena con el vocabulario de Danbooru para predecir personajes, artistas y etiquetas generales en pipelines de catalogación.
- Organización de bibliotecas de imágenes: extracción del vector global de 768 dimensiones y clustering (k-means, HDBSCAN) para agrupar ilustraciones por personaje o estilo artístico sin etiquetas.
- Búsqueda visual por similitud: indexación de los embeddings en FAISS o similar para recuperar imágenes parecidas a una consulta, útil en galerías de arte o datasets de investigación.
- Deduplicación de datasets: comparación de embeddings para detectar imágenes repetidas o casi idénticas en corpus de ilustración antes de entrenar otros modelos.
- Detección de estilo de artista: las 40,2k etiquetas de artista del entrenamiento permiten entrenar un clasificador de atribución de autor sobre el backbone congelado o con fine-tuning ligero.
- Moderación y filtrado de contenido: clasificador downstream sobre las etiquetas generales de Danbooru para marcar contenido sensible en plataformas de publicación de arte.
- Base para modelos de captioning o taggers: el backbone puede integrarse como encoder visual en arquitecturas de image-to-text específicas de dominio anime, como el propio proyecto haruka-tagger del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 350 MB de pesos más activaciones; en bf16/fp16, unos 175 MB de pesos. Con batch moderado y resolución 448, cabe holgadamente en GPUs de 4 GB o menos.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB; H100/A100 no son necesarias para inferencia, aunque el autor usó 8x H100 para el fine-tuning.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: timm (carga directa desde el Hub con `hf_hub:`), PyTorch nativo cargando `model.safetensors` sobre la definición de arquitectura de timm, exportación a ONNX o TorchScript para servir con ONNX Runtime o Triton.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un ViT base a 448 px, se espera un coste por imagen bajo en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haruka-EVA02-base-448 | 86,3 M | 448x448 | Anime/ilustración Danbooru + transferencia a fotos | no disponible | Hugging Face (timm) |
| timm/eva02_base_patch14_448.mim_in22k_ft_in22k_in1k | 86,3 M | 448x448 | ImageNet (fotos) | no disponible en la información | Hugging Face (timm) |
| CLIP ViT-B/32 | ~88 M (visual) | 224x224 | Pares imagen-texto web general | MIT (OpenAI CLIP) | Hugging Face, open_clip |
| DINOv2 ViT-B/14 | ~86 M | 518x518 | Fotos generales, autosupervisado | Apache 2.0 (según versión) | Hugging Face |

La comparación directa con CLIP o DINOv2 no es equivalente en dominio: Haruka-EVA02 está especializado en ilustración y no produce alineamiento texto-imagen. Frente al EVA-02 original de timm, la diferencia es el corpus de fine-tuning (Danbooru frente a ImageNet) y la ausencia de cabeza de clasificación.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor antes de desplegarlo en producción.
- El modelo base de timm y el corpus Danbooru tienen sus propias condiciones de uso que pueden afectar a la redistribución.
- Sesgo de dominio: entrenado exclusivamente con ilustraciones de Danbooru, lo que puede infrarepresentar estilos no presentes en esa plataforma y sobrerrepresentar convenciones visuales de la comunidad.
- El rendimiento en fotografías reales se afirma de forma cualitativa, sin métricas ni validación independiente publicada.
- Riesgo de falsos positivos y negativos en clasificación downstream por la cola larga de etiquetas (personajes y artistas con muy pocas imágenes).
- No es un modelo generativo ni de captioning: no produce texto ni descripciones; requiere una cabeza o arquitectura adicional.
- Sin garantías de robustez ante imágenes fuera de distribución (capturas, 3D, arte abstracto, fotografía de producto).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación de la comunidad ni reportes de terceros.
- El autor menciona que el checkpoint se publica como backbone "de paso" mientras entrena haruka-tagger; puede no recibir mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaraKaraWitch/haruka-eva02-base-448
- Modelo base en timm: https://huggingface.co/timm/eva02_base_patch14_448.mim_in22k_ft_in22k_in1k
- Repositorio timm: https://github.com/huggingface/pytorch-image-models
- Patrocinador del cómputo: https://huggingface.co/alpindale y https://dphn.ai/
- Paper EVA-02: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible

# brunoslm/visiovetor

## Resumen

VisioVetor es un modelo de visión-lenguaje derivado de Google SigLIP 2 base (patch16-224) mediante fine-tuning contrastivo sobre leyendas en portugués de Brasil. Lo desarrolla el usuario de Hugging Face `brunoslm` y su propósito es mejorar la recuperación imagen-texto y texto-imagen en portugués, tarea en la que el modelo base multilingüe rinde por debajo de su potencial por falta de exposición específica al idioma. El modelo forma parte de la engine de búsqueda semántica multimodal VisioVetor, cuyo código de entrenamiento y aplicación están publicados en GitHub.

La arquitectura es la de SigLIP 2, un transformer dual con codificador de imagen tipo ViT (patch de 16x16 píxeles, resolución 224x224) y codificador de texto, entrenado con la pérdida sigmoide de SigLIP en lugar del contraste InfoNCE clásico. El modelo cuenta con 375.187.970 parámetros totales y un repositorio de 1,5 GB en formato safetensors. No se especifica la longitud de contexto textual en la información disponible.

Su relevancia es acotada pero clara: demuestra que un ajuste ligero (23 minutos de entrenamiento, codificador de imagen congelado y solo las 4 últimas capas del codificador de texto entrenables) produce ganancias medibles de Recall@1 de entre +5,4 y +5,9 puntos en portugués de Brasil sobre el modelo base, manteniendo la compatibilidad de los embeddings de imagen ya calculados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (transformer dual imagen-texto, ViT patch16-224 + codificador de texto) |
| Parametros totales | 375.187.970 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | Portugués (pt), con orientación específica a portugués de Brasil |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/siglip2-base-patch16-224`, un modelo de alineación imagen-texto con dos torres: un Vision Transformer que procesa parches de 16x16 píxeles sobre imágenes de 224x224 y un codificador de texto. La función de pérdida es la sigmoide de SigLIP, formulada como `L = -1/B Σᵢⱼ log σ(zᵢⱼ · (τ·tᵢ·iⱼ + b))`, con temperatura y sesgo aprendibles, que evita la normalización global sobre el lote típica de CLIP.

El fine-tuning se realizó sobre 6000 imágenes de entrenamiento del dataset Flickr8k PT-BR, con 5 leyendas por imagen. La estrategia es deliberadamente económica: el codificador de imagen permanece congelado y solo se entrenan las 4 últimas capas del codificador de texto, la cabeza de texto y los parámetros de temperatura y sesgo. Esto preserva la validez de los vectores de imagen ya calculados, de modo que un índice de embeddings construido con el modelo base sigue siendo utilizable tras el ajuste. Los hiperparámetros son 4 épocas, lote de 64, learning rate de 1e-5 para el texto y 1e-4 para temperatura y sesgo, weight decay de 0,05, warmup del 10 % y semilla 42. El entrenamiento completo tomó aproximadamente 23 minutos. El script está publicado en el repositorio del proyecto.

## Capacidades

- Clasificación de imágenes zero-shot mediante comparación con prompts de texto en portugués.
- Recuperación texto-imagen: búsqueda de imágenes a partir de una consulta descriptiva en portugués de Brasil.
- Recuperación imagen-texto: generación de descripciones candidatas y ranking de las más probables para una imagen dada.
- Búsqueda semántica multimodal sobre índices de embeddings precalculados, sin necesidad de recalcular los vectores de imagen.
- Puntuación de similitud imagen-texto mediante `logits_per_image` y sigmoide, utilizable como probabilidad de coincidencia.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto libre: es un modelo de alineación, no un modelo generativo.
- No dispone de modo de razonamiento (thinking), visión adicional, audio ni capacidades de agente.
- Capacidad multilingüe limitada al portugués; el resto de idiomas hereda el comportamiento del modelo base sin ajuste específico.

## Casos de uso

- Buscador de imágenes por descripción en portugués: se indexan los embeddings de imagen de un catálogo y se consulta con texto libre en portugués de Brasil; el ajuste eleva el Recall@1 de texto a imagen hasta el 72,1 %, lo que reduce la necesidad de reordenar resultados manualmente.
- Etiquetado automático de fotos: para una imagen dada, se puntúan candidatos de texto con `logits_per_image` y se seleccionan las etiquetas con mayor probabilidad, útil en gestión de activos digitales o archivos fotográficos.
- Moderación y filtrado de contenido visual: se comparan imágenes contra conjuntos de descripciones de referencia y se aplican umbrales sobre la probabilidad sigmoide para marcar coincidencias.
- Deduplicación y agrupación semántica de imágenes: los embeddings de imagen permiten agrupar fotos visualmente similares aunque sus metadatos difieran, sin coste de reentrenamiento porque el codificador de imagen está congelado.
- Accesibilidad: generación de descripciones alternativas candidatas para imágenes en aplicaciones en portugués, seleccionando la leyenda con mayor puntuación entre un conjunto predefinido.
- Búsqueda dentro de aplicaciones de fotografía o redes sociales: consultas en lenguaje natural sobre la biblioteca local del usuario, con la ventaja de que los vectores de imagen calculados con el modelo base siguen siendo válidos tras el ajuste.
- Prototipado rápido de sistemas de recuperación multimodal: el entrenamiento de 23 minutos y la licencia Apache 2.0 permiten reproducir el ajuste sobre dominios propios con un coste computacional bajo.

## Benchmarks y rendimiento

Evaluación sobre 1000 imágenes de validación del Flickr8k PT-BR, fuera del conjunto de entrenamiento, con 5 leyendas por imagen. Recall@K en porcentaje.

| Métrica | Base | Ajustado | Ganancia |
|---|---|---|---|
| Texto → imagen R@1 | 66,2 | 72,1 | +5,9 |
| Texto → imagen R@5 | 87,6 | 91,7 | +4,1 |
| Texto → imagen R@10 | 93,3 | 96,1 | +2,8 |
| Imagen → texto R@1 | 82,5 | 87,9 | +5,4 |
| Imagen → texto R@5 | 96,0 | 97,6 | +1,6 |
| Imagen → texto R@10 | 98,5 | 99,0 | +0,5 |

No se han publicado resultados de benchmarks en la información disponible para otras tareas (ImageNet zero-shot, retrieval en otros idiomas, VQA u otras evaluaciones estándar).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,5 GB solo para pesos, más activaciones; en la práctica, entre 2 y 3 GB con un lote pequeño.
- VRAM estimada en fp16/bf16: alrededor de 0,75 GB para pesos, con un total práctico de 1,5 a 2 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, así como en GPUs de portátil con 4 GB o más.
- GPU de datacenter recomendadas para indexación a gran escala: A100, H100 o L40S, donde el cuello de botella será el preprocesado de imágenes, no el modelo.
- Despliegue: compatible con `transformers` y `AutoModel`/`AutoProcessor`; puede servirse con Text Embeddings Inference (TEI) si se adapta la firma multimodal, o con un servicio propio en FastAPI/TorchServe. No hay confirmación de soporte en vLLM ni llama.cpp, dado que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento de 4 épocas sobre 6000 imágenes tomó unos 23 minutos, lo que da una idea del orden de magnitud del coste de ajuste, no de la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brunoslm/visiovetor | 375,2 M | No disponible | SigLIP 2 ajustado en pt-BR | Apache 2.0 | Hugging Face |
| google/siglip2-base-patch16-224 | 375,2 M (misma base) | No disponible | SigLIP 2 multilingüe | Apache 2.0 | Hugging Face |
| CLIP ViT-B/32 (OpenAI) | ~151 M | 77 tokens de texto | Contraste InfoNCE, inglés | MIT | Hugging Face, open_clip |
| SigLIP base (versión 1) | ~203 M | 64 tokens de texto | Sigmoide, inglés | Apache 2.0 | Hugging Face |

Frente al modelo base, VisioVetor mejora el Recall@1 en portugués de Brasil entre 5,4 y 5,9 puntos sin aumentar el número de parámetros. Frente a CLIP ViT-B/32, ofrece mayor resolución de parche (16 frente a 32) y una función de pérdida sigmoide que suele rendir mejor en lotes pequeños, aunque CLIP tiene un ecosistema de herramientas más amplio. No se dispone de comparaciones directas con alternativas ajustadas específicamente para portugués en la información proporcionada.

## Limitaciones y advertencias

- El ajuste se realizó exclusivamente con fotos de Flickr8k (personas, animales, deportes y paisajes); en dominios como fotografía de producto o gastronomía, la ganancia sobre el modelo base puede ser menor o nula.
- Las leyendas en portugués del dataset son traducciones, por lo que el modelo ha visto menos jerga y expresiones regionales que un corpus nativo.
- Riesgo de alucinación en el sentido de falsos positivos: la puntuación sigmoide puede asignar probabilidad alta a descripciones plausibles pero incorrectas, especialmente con textos ambiguos o imágenes fuera de distribución.
- El modelo no genera texto; cualquier caso de uso que requiera descripciones libres necesita un modelo generativo adicional.
- Solo se declara soporte de portugués; el rendimiento en otros idiomas no está evaluado y probablemente herede el del modelo base sin mejora.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de origen pueden tener sus propias condiciones que conviene verificar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documenta la longitud máxima de texto de entrada ni el comportamiento con secuencias largas; el ejemplo de uso fija `max_length=64`.
- La fecha de creación del repositorio (2026-11-17) es posterior a la de la mayoría de referencias del ecosistema, dato que conviene contrastar antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brunoslm/visiovetor
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- Dataset de entrenamiento: https://huggingface.co/datasets/laicsiifes/flickr8k-pt-br
- Repositorio del proyecto VisioVetor: https://github.com/brunoslm/VISIOVETOR
- Script de fine-tuning: https://github.com/brunoslm/VISIOVETOR/blob/main/scripts/finetune.py

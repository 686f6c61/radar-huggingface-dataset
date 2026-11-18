# alphaedge-ai/siglip2-giant-opt-patch16-384-ben-16384

## Resumen

`alphaedge-ai/siglip2-giant-opt-patch16-384-ben-16384` es una versión recortada (trimmed) del codificador visión-lenguaje SigLIP 2 de Google, adaptada específicamente al bengalí mediante reducción de vocabulario. El modelo base, `google/siglip2-giant-opt-patch16-384`, es un encoder multimodal de tipo dual-tower (imagen y texto) diseñado para tareas de similitud imagen-texto, clasificación zero-shot y recuperación multimodal. Esta variante reduce el vocabulario de 256.000 a 16.384 tokens, lo que elimina el 93,60% de las entradas del embedding de texto y recorta el total de parámetros de 1.871.885.426 a 1.595.847.794 (un 14,75% menos).

La operación de trimming se realizó minando 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para identificar los tokens realmente utilizados en bengalí, conservando únicamente esos y descartando el resto. El resultado es un modelo con huella de memoria notablemente menor, pensado para despliegues en los que el multilingüismo no es necesario y el bengalí es el idioma objetivo. La arquitectura subyacente mantiene el diseño SigLIP 2 con parche de 16x16 y resolución de entrada de 384x384, junto con el mecanismo de atención OPT del encoder de texto.

Es relevante porque demuestra una técnica práctica de compresión de vocabulario aplicable a encoders multimodales: reduce el tamaño del repositorio a 6,4 GB y el número de parámetros del embedding de texto sin reentrenar el modelo desde cero. No obstante, al ser una adaptación de nicho (bengalí, 10 descargas, 0 likes), su utilidad queda acotada a pipelines concretos de clasificación y recuperación de imágenes en ese idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (dual-tower transformer, vision encoder + text encoder con atención OPT), parche 16x16, resolución 384x384 |
| Parametros totales | 1.595.847.794 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo base admite cuantización estándar, pero no se documenta en esta ficha) |
| Idiomas soportados | bengalí (bn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SigLIP 2, un encoder visión-lenguaje de dos torres: un vision transformer que procesa imágenes en parches de 16x16 a 384x384 píxeles y un text encoder que emplea atención de tipo OPT. La innovación de SigLIP 2 respecto a SigLIP original incluye mejor comprensión semántica, localización y características densas, según el paper arXiv:2502.14786. El modelo base fue entrenado por Google con objetivos de contraste imagen-texto y datos multilingües.

Esta variante concreta no se reentrenó: se aplicó trimming de vocabulario. Se minaron 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para determinar qué tokens del vocabulario original (256.000) se usan en bengalí, y se conservaron solo 16.384. Los embeddings de texto correspondientes a tokens eliminados se descartan, lo que reduce el número de parámetros en 276.037.632. No se documenta ningún proceso de RLHF, DPO ni fine-tuning adicional; la model card indica que el modelo recortado "debería comportarse de forma similar al original" para bengalí, pero puede degradarse en otros idiomas.

## Capacidades

- Clasificación de imágenes zero-shot: asigna etiquetas de texto candidatas a una imagen sin entrenamiento específico.
- Similitud imagen-texto: genera embeddings de imagen y de texto comparables mediante `SentenceTransformer`.
- Recuperación multimodal (image-to-text y text-to-image) dentro del dominio bengalí.
- Generación de embeddings densos de imagen para búsqueda y clustering visual.
- Soporte de pipeline `zero-shot-image-classification` en Transformers.
- Integración con `sentence-transformers` para cálculo de similitudes por lotes.
- Capacidad multilingüe limitada al bengalí (el vocabulario recortado elimina tokens de otros idiomas).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni modos de "thinking"; es un encoder, no un modelo generativo de instrucciones.

## Casos de uso

- Moderación de contenido visual en plataformas bengalíes: clasificar imágenes entrantes contra un conjunto de etiquetas en bengalí (por ejemplo, categorías de contenido sensible) usando el pipeline zero-shot, sin necesidad de un clasificador entrenado por categoría.
- Búsqueda semántica de imágenes en catálogos de comercio electrónico: indexar embeddings de imagen con el vision encoder y consultar con descripciones de producto en bengalí, aprovechando la reducción de vocabulario para abaratar el almacenamiento de embeddings de texto.
- Etiquetado automático de datasets visuales en bengalí: generar etiquetas candidatas para grandes volúmenes de imágenes y acelerar la anotación humana, con un coste de memoria inferior al del modelo original (6,4 GB de repositorio frente a los ~7,5 GB del base).
- Filtrado de imágenes en pipelines de curación de datos: descartar o priorizar imágenes según su similitud con descripciones textuales en bengalí antes de entrenar otros modelos.
- Sistemas de accesibilidad: describir o clasificar imágenes para usuarios bengalíes mediante comparación con un vocabulario controlado de conceptos.
- Detección de duplicados y clustering visual: usar los embeddings de imagen para agrupar imágenes similares en archivos fotográficos o repositorios de medios en contextos bengalíes.
- Despliegue en entornos con VRAM limitada: al recortar el embedding de texto, el modelo cabe con más holgura en GPUs de gama media para inferencia por lotes de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de recuperación imagen-texto (como Recall@K) para esta variante recortada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 6,4 GB solo para pesos (1.595.847.794 parámetros × 4 bytes), más activaciones y buffers; en fp16/bf16 bajaría a ~3,2 GB.
- GPU recomendadas para fp16: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para lotes grandes; una RTX 3090 o 4080 (16-24 GB) es suficiente para inferencia por lotes moderados.
- Cabe en GPUs de consumo: sí, en fp16 en tarjetas con 8 GB o más (por ejemplo, RTX 3070/4060 Ti), aunque con lotes pequeños.
- Opciones de despliegue: `transformers` pipeline, `sentence-transformers`, y potencialmente `vLLM` o `TGI` no aplican al ser un encoder; `llama.cpp`/`Ollama` no soportan esta arquitectura de forma nativa. Para serving de embeddings se puede usar `text-embeddings-inference` si se convierte el modelo, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Vocabulario | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `alphaedge-ai/siglip2-giant-opt-patch16-384-ben-16384` (este) | 1.595.847.794 | 16.384 | bengalí | Apache 2.0 | Versión recortada, 14,75% menos parámetros |
| `google/siglip2-giant-opt-patch16-384` | 1.871.885.426 | 256.000 | multilingüe | Apache 2.0 | Modelo base original, mayor huella |
| SigLIP 2 base/large (otras variantes de Google) | no disponible en la información | 256.000 | multilingüe | Apache 2.0 | Menor tamaño, menor capacidad; datos concretos no disponibles |
| CLIP ViT-L/14 (OpenAI) | no disponible en la información | no disponible | inglés principalmente | MIT (según versión) | Alternativa clásica de encoder visión-lenguaje; comparación numérica no disponible |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada; solo se dispone de los datos de parámetros y vocabulario del modelo base y de esta variante.

## Limitaciones y advertencias

- El vocabulario recortado a 16.384 tokens elimina la mayoría de tokens no bengalíes; el rendimiento en otros idiomas puede degradarse severamente, como advierte la propia model card.
- Al ser una modificación de vocabulario sin reentrenamiento, puede haber una ligera pérdida de calidad frente al modelo original incluso en bengalí; no se documentan métricas que lo cuantifiquen.
- Riesgo de alucinación y sesgos heredados del modelo base SigLIP 2 y de los datos de preentrenamiento de Google, no evaluados en esta variante.
- Es un encoder de similitud, no un modelo generativo: no produce texto libre ni razonamiento; su uso está limitado a clasificación, recuperación y embeddings.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datos de mining (`lbourdois/fineweb-2-trimming`).
- Modelo de nicho con muy baja adopción (10 descargas, 0 likes); no hay validación comunitaria ni reportes de producción.
- No se documenta longitud de contexto del text encoder ni límites de tokens de entrada; conviene consultar la documentación del modelo base.
- La fecha de creación (2026-06-04) y actualización (2026-11-18) indican un modelo reciente; puede haber cambios posteriores no reflejados.

## Enlaces

- Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-giant-opt-patch16-384-ben-16384
- Modelo base: https://huggingface.co/google/siglip2-giant-opt-patch16-384
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de mining: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming

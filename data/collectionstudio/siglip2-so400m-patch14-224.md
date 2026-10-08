# CollectionStudio/siglip2-so400m-patch14-224

## Resumen

SigLIP 2 So400m es un codificador vision-lenguaje (image-text encoder) entrenado por Google Research mediante aprendizaje contrastivo tipo sigmoide. Este repositorio concreto, alojado por CollectionStudio, es una redistribución de los pesos del checkpoint `google/siglip2-so400m-patch14-224`, publicado bajo licencia Apache 2.0. El modelo resuelve tareas de comprensión visual sin ajuste específico: clasificación de imágenes zero-shot, recuperación imagen-texto y extracción de representaciones visuales densas para su uso como torre de visión en modelos multimodales.

SigLIP 2 parte del objetivo de preentrenamiento de SigLIP 1 y le incorpora tres contribuciones unificadas: una pérdida de decodificador, una pérdida de predicción global-local y enmascarada, y adaptabilidad de relación de aspecto y resolución. El resultado, según los autores, mejora la comprensión semántica, la localización de objetos y la calidad de las características densas frente a la versión anterior.

El checkpoint `so400m` corresponde a una variante «shape-optimized» de aproximadamente 400 M de parámetros en la torre de visión, con un total de 1.135.463.602 parámetros contando el codificador de texto asociado. Se distribuye en formato `safetensors` compatible con la librería `transformers` y está pensado tanto para uso directo mediante pipeline como para servir de componente en arquitecturas VLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de doble torre (vision encoder + text encoder) con preentrenamiento contrastivo sigmoide (SigLIP 2) |
| Parametros totales | 1.135.463.602 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados por el autor; el formato safetensors admite conversion a fp16, bf16, int8 y cuantizaciones GGUF de terceros |
| Idiomas soportados | No disponibles en los metadatos; el articulo describe la familia como «multilingual» |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 4.6 GB |
| Resolucion de entrada | 224 px, parches de 14 px (variante patch14-224) |
| Tarea declarada | zero-shot-image-classification |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de doble torre: una torre de visión que procesa la imagen dividida en parches de 14x14 píxeles a resolución 224, y una torre de texto que procesa las etiquetas o descripciones candidatas. Ambas torres proyectan sus salidas a un espacio latente común donde se calcula la similitud. A diferencia del contraste softmax de CLIP, SigLIP emplea una función de pérdida sigmoide sobre pares imagen-texto, lo que permite entrenar con lotes más pequeños sin necesidad de normalizaciones globales entre todos los pares.

Sobre esa base, SigLIP 2 incorpora tres objetivos de entrenamiento adicionales: una pérdida de decodificador sobre las representaciones, una pérdida de predicción global-local y enmascarada, y un esquema de adaptabilidad de relación de aspecto y resolución. El preentrenamiento se realizó sobre el dataset WebLI (Chen et al., 2023) y el cómputo alcanzó hasta 2048 chips TPU-v5e. No se especifica en la información disponible si hubo fases de RLHF o DPO, ni el número exacto de tokens de imagen-texto vistos durante el entrenamiento.

## Capacidades

- Clasificación de imágenes zero-shot: asignar una etiqueta a una imagen entre un conjunto de etiquetas candidatas en lenguaje natural, sin entrenamiento específico por clase.
- Recuperación imagen-texto y texto-imagen en un espacio de embeddings compartido.
- Extracción de embeddings visuales densos mediante la torre de visión (`get_image_features`), útiles para búsqueda por similitud, clustering y sistemas de recomendación visual.
- Uso como torre de visión (vision encoder) en modelos vision-language de mayor tamaño.
- Capacidades multilingües heredadas del artículo SigLIP 2; el listado concreto de idiomas no está disponible en los metadatos del repositorio.
- Compatible con el pipeline `zero-shot-image-classification` de `transformers`.
- No se documentan en la model card capacidades de tool calling, agentes, audio ni generación de texto libre (la torre de texto actúa como codificador, no como generador).

## Casos de uso

- Moderación de contenido visual: clasificar imágenes entrantes contra una lista de etiquetas de categorías prohibidas mediante zero-shot, sin reentrenar el modelo para cada nueva política.
- Búsqueda semántica en bibliotecas de imágenes: indexar los embeddings de la torre de visión y recuperar activos por consultas de texto, útil en DAM (digital asset management) y archivos fotográficos.
- Etiquetado automático de catálogos de producto: asignar categorías y atributos a fotos de e-commerce comparando contra etiquetas candidatas generadas dinámicamente.
- Filtrado previo en pipelines de datos multimodales: descartar o clasificar pares imagen-texto durante la curación de datasets de entrenamiento para otros modelos.
- Sistemas de accesibilidad: generar descripciones candidatas de escenas y seleccionar la más probable para lectores de pantalla o asistentes de descripción automática.
- Torre de visión para VLM propios: sustituir el codificador visual en arquitecturas tipo LLaVA o PaliGemma para obtener representaciones densas y bien alineadas con texto.
- Detección de duplicados y near-duplicates visuales: usar la similitud coseno entre embeddings de imagen para agrupar activos repetidos en repositorios grandes.
- Clasificación de imágenes médicas o industriales con conjuntos de etiquetas definidos por el dominio, aprovechando la naturaleza zero-shot para prototipado rápido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en formato numérico en la información disponible. La model card referencia una tabla de evaluación extraída del artículo original, pero únicamente como imagen (`eval_table.png`), sin valores textuales. Se recomienda consultar el artículo arXiv:2502.14786 para los resultados completos comparativos del checkpoint `so400m-patch14-224`.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 4,5 GB solo para pesos (coincide con el tamaño del repositorio de 4,6 GB).
- VRAM estimada en fp16/bf16: aproximadamente 2,3 GB para pesos, más activaciones de inferencia.
- VRAM estimada en int8: aproximadamente 1,1-1,2 GB, con pérdida de precisión no cuantificada en la información disponible.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060/4070, RTX 4080/4090, e incluso en equipos con 6-8 GB si se usa fp16.
- GPU de centro de datos recomendadas para lotes grandes o baja latencia: A100, H100, L40S.
- Despliegue: `transformers` (pipeline y `AutoModel`), TorchScript/ONNX tras exportación manual. La compatibilidad con vLLM o TGI no está confirmada en la información proporcionada, dado que el modelo es un codificador y no un generador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CollectionStudio/siglip2-so400m-patch14-224 | 1.135.463.602 | No disponible | Visión + texto (encoder) | apache-2.0 | HuggingFace |
| google/siglip2-so400m-patch14-224 | No disponible (mismos pesos) | No disponible | Visión + texto (encoder) | apache-2.0 | HuggingFace |
| google/siglip-so400m-patch14-384 (SigLIP 1) | No disponible | No disponible | Visión + texto (encoder) | apache-2.0 | HuggingFace |
| openai/clip-vit-large-patch14 | No disponible | No disponible | Visión + texto (encoder) | Licencia MIT | HuggingFace |

No se dispone de datos numéricos de rendimiento para esta comparativa; las diferencias entre SigLIP 2 y SigLIP 1 se resumen en el artículo original como mejoras en comprensión semántica, localización y características densas. Este repositorio redistribuye pesos idénticos a los del checkpoint oficial de Google, por lo que las diferencias con el original se limitan al mantenimiento y a la trazabilidad, no al comportamiento del modelo.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre WebLI (datos web a gran escala), hereda sesgos socioculturales, de género y geográficos presentes en ese corpus. No se documentan análisis de sesgo específicos en la información disponible.
- Alucinación: aunque no genera texto libre, en clasificación zero-shot puede asignar etiquetas incorrectas con alta confianza cuando ninguna candidata describe bien la imagen.
- Idiomas: los metadatos no listan idiomas soportados; el rendimiento fuera de los idiomas mayoritarios del dataset de entrenamiento puede degradarse.
- Contexto: la longitud de contexto del codificador de texto no está disponible; no se recomienda asumir ventanas largas para descripciones extensas sin verificarlo.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar que la redistribución por parte de CollectionStudio no introduzca condiciones adicionales (los metadatos indican apache-2.0 sin cláusulas extra).
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; para producción se recomienda usar el checkpoint oficial `google/siglip2-so400m-patch14-224` por trazabilidad y soporte.
- Fecha de creación del repositorio (2026-10-07) posterior a la fecha habitual de publicación de SigLIP 2; conviene confirmar la procedencia exacta de los pesos antes de desplegarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CollectionStudio/siglip2-so400m-patch14-224
- Checkpoint oficial (referenciado en la model card): https://huggingface.co/google/siglip2-so400m-patch14-224
- Artículo SigLIP 2: https://arxiv.org/abs/2502.14786
- Artículo SigLIP 1: https://arxiv.org/abs/2303.15343
- Artículo WebLI: https://arxiv.org/abs/2209.06794
- Documentación de SigLIP en transformers: https://huggingface.co/transformers/main/model_doc/siglip.html
- Tabla de evaluación (imagen): https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/sg2-blog/eval_table.png

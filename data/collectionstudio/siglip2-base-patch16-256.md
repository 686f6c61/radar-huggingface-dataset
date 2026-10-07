# CollectionStudio/siglip2-base-patch16-256

## Resumen

SigLIP 2 Base patch16-256 es un codificador vision-lenguaje (image-text encoder) desarrollado originalmente por Google Research y publicado en febrero de 2025 dentro de la familia SigLIP 2. El repositorio analizado, `CollectionStudio/siglip2-base-patch16-256`, es una resubida no oficial del checkpoint `google/siglip2-base-patch16-256` por parte del usuario CollectionStudio; conserva la arquitectura y los pesos originales, pero no está respaldado por el equipo autor.

El modelo combina una torre de visión tipo Vision Transformer con parches de 16x16 a resolución de entrada 256x256 y una torre de texto, sumando 375.234.050 parámetros en total según el fichero de pesos safetensors. Se usa como extractor de embeddings multimodales para clasificación de imágenes zero-shot, recuperación imagen-texto y como encoder visual dentro de modelos vision-lenguaje de mayor tamaño.

Su relevancia actual radica en que SigLIP 2 mejora el objetivo de entrenamiento del SigLIP original con pérdidas adicionales de decodificación, predicción global-local enmascarada y adaptabilidad de resolución y relación de aspecto, lo que mejora la comprensión semántica, la localización de objetos y la calidad de las representaciones densas. Todo ello bajo licencia Apache 2.0, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) tipo SigLIP 2, doble torre imagen-texto con parches de 16x16 |
| Parámetros totales | 375.234.050 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de embeddings; la longitud máxima del tokenizador de texto no se especifica en la información proporcionada) |
| Tipos de cuantización | No disponible (el repositorio publica pesos safetensors; no se listan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Multilingüe según la descripción del paper; lista concreta de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tamaño del repositorio: 1,5 GB, compatible con la librería transformers) |

## Arquitectura y entrenamiento

SigLIP 2 es un codificador de doble torre (imagen y texto) que sustituye la pérdida contrastiva softmax del CLIP clásico por una pérdida sigmoidea aplicada par a par, lo que elimina la necesidad de normalización global del lote. Sobre esa base, SigLIP 2 añade tres objetivos adicionales durante el preentrenamiento: una pérdida de decodificación, una pérdida de predicción global-local con enmascaramiento y un mecanismo de adaptabilidad de relación de aspecto y resolución. Estas incorporaciones buscan mejorar simultáneamente la semántica global, la localización espacial y la calidad de las características densas, tres aspectos en los que el SigLIP original rendía de forma desigual.

El preentrenamiento se realizó sobre el dataset WebLI (Chen et al., 2023) y consumió hasta 2048 chips TPU-v5e. La variante aquí descrita es la configuración "base" con parches de 16x16 y entrada de 256x256 píxeles. No se detalla en la información disponible el número total de tokens de imagen-texto procesados, la composición exacta del corpus ni si hubo fases posteriores de ajuste fino con RLHF o DPO (lo habitual en encoders de este tipo es que no las haya, ya que no son modelos generativos).

## Capacidades

- Clasificación de imágenes zero-shot: asignar una imagen a etiquetas de texto arbitrarias sin entrenamiento específico, mediante la comparación de embeddings de imagen y texto.
- Recuperación imagen-texto y texto-imagen (image-text retrieval) para motores de búsqueda visual.
- Generación de embeddings visuales y textuales alineados en un mismo espacio vectorial, aptos para indexación y búsqueda por similitud.
- Uso como torre de visión en modelos vision-lenguaje (VLM) que necesiten un encoder visual preentrenado.
- Representaciones densas y localización, gracias a los objetivos global-local y de decodificación introducidos en SigLIP 2.
- Capacidad multilingüe en la torre de texto, según la descripción del paper.
- Soporte de procesamiento de imágenes a distintas resoluciones y relaciones de aspecto, derivado del objetivo de adaptabilidad de SigLIP 2.
- No dispone de capacidad de generación de texto, tool calling, agentes ni razonamiento multi-paso: es un encoder, no un modelo generativo.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes entrantes contra conjuntos de etiquetas definidas por el equipo (por ejemplo, "contenido violento", "desnudo", "captura de pantalla") sin reentrenar el modelo para cada nueva categoría.
- Búsqueda visual en catálogos de producto: indexar el embeddings de imágenes de un catálogo de comercio electrónico y permitir consultas en lenguaje natural ("camisa azul de lino manga corta") mediante similitud en el espacio vectorial conjunto.
- Etiquetado automático de activos multimedia: generar descripciones cortas o etiquetas para bibliotecas de imágenes de medios de comunicación, usando la comparación zero-shot contra un vocabulario controlado.
- Filtrado de datasets para entrenamiento: usar el modelo como clasificador para eliminar imágenes que no cumplen criterios de calidad o temática antes de alimentar un pipeline de entrenamiento.
- Clasificación de imágenes médicas o industriales con pocas muestras: emplear la capacidad zero-shot para preclasificar imágenes y reducir el volumen de revisión manual, siempre con validación humana posterior.
- Componente de un sistema VLM: integrar la torre de visión como extractor de características congelado o ajustado, alimentando un decodificador de lenguaje para tareas de captioning o respuesta a preguntas visuales.
- Detección de duplicados y near-duplicates: comparar embeddings de imagen para agrupar activos visualmente similares en grandes repositorios.
- Accesibilidad: generar etiquetas o descripciones básicas de imágenes para lectores de pantalla en flujos donde no se dispone de un modelo generativo más pesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card referencia una tabla de evaluación extraída del paper de SigLIP 2, pero dicha tabla se incluye únicamente como imagen y no aporta cifras en formato texto en el material proporcionado. Para consultar los valores concretos de MMLU, ImageNet zero-shot, COCO retrieval u otras métricas, es necesario acudir directamente al paper (arXiv:2502.14786).

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1,5 GB solo para los pesos, más el espacio de activaciones; con un lote pequeño cabe holgadamente en 2-3 GB.
- VRAM estimada en fp16/bf16: aproximadamente 750 MB de pesos, con un consumo total en torno a 1,5-2 GB según tamaño de lote y resolución.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o incluso una GTX 1650 de 4 GB pueden ejecutar inferencia en fp16. Para procesamiento por lotes a gran escala se recomienda A100, H100 o L40S.
- Compatible con GPU de consumo: sí, en todas las gamas actuales con al menos 4 GB de VRAM.
- Opciones de despliegue: pipeline de transformers (`zero-shot-image-classification`), uso directo con `AutoModel` para extraer embeddings, exportación a ONNX y torch.compile. El soporte específico en vLLM, TGI u Ollama no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 375 M de parámetros, la latencia por imagen en GPU moderna es del orden de milisegundos, pero no se aporta ninguna medición concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución y parche | Licencia | Disponibilidad |
|---|---|---|---|---|
| siglip2-base-patch16-256 (esta resubida) | 375.234.050 | 256 px, parche 16 | Apache 2.0 | HuggingFace, transformers |
| google/siglip2-base-patch16-256 (original) | No disponible en la información proporcionada | 256 px, parche 16 | Apache 2.0 | HuggingFace, transformers |
| SigLIP original (familia siglip-base) | No disponible | 224 px, parche 16 | Apache 2.0 | HuggingFace, transformers |
| CLIP de OpenAI (familia ViT-B) | No disponible | 224 px, parche 16 o 32 | Licencia MIT | HuggingFace, transformers |

La comparación cuantitativa de rendimiento entre estas alternativas no puede completarse con los datos disponibles: la model card únicamente enlaza a la tabla de evaluación del paper de SigLIP 2 sin cifras en texto. En términos cualitativos, SigLIP 2 incorpora sobre SigLIP original las pérdidas de decodificación, global-local enmascarada y adaptabilidad de resolución, que según el paper mejoran la comprensión semántica, la localización y las características densas.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no soporta tool calling, no ejecuta razonamiento multi-paso ni actúa como agente. Cualquier uso de ese tipo requiere combinarlo con un decodificador de lenguaje.
- Repositorio no oficial: se trata de una resubida de `CollectionStudio` sobre el checkpoint de Google, sin descargas ni interacciones registradas en el momento de redactar esta ficha. Para producción se recomienda tirar del repositorio oficial `google/siglip2-base-patch16-256`.
- Riesgo de sesgo: al entrenarse sobre WebLI, un corpus web a gran escala, hereda los sesgos de representación presentes en internet en cuanto a género, etnia, cultura y geografía. No se detalla en la información disponible ningún análisis de sesgo específico.
- Alucinación en clasificación: en tareas zero-shot el modelo siempre asigna una probabilidad a cada etiqueta candidata, incluidas etiquetas incorrectas o absurdas; un umbral de confianza mal calibrado puede producir asignaciones erróneas sin señal de incertidumbre clara.
- Cobertura de idiomas: aunque el paper describe el modelo como multilingüe, no se ofrece en la información disponible la lista de idiomas soportados ni métricas por idioma, por lo que el rendimiento en castellano o en lenguas minoritarias no está cuantificado.
- Limitación de resolución: la entrada está fijada en 256x256 píxeles para esta variante, lo que puede degradar el rendimiento en tareas que requieran detalle fino, como lectura de texto en imagen o detección de objetos pequeños.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar los avisos de copyright y licencia, e incluir el texto de la licencia en las redistribuciones. La resubida no exime de cumplir estas condiciones respecto al trabajo original de Google.
- Fecha de creación anómala: el repositorio figura como creado el 2026-10-06, una fecha futura, lo que sugiere metadatos inconsistentes y refuerza la recomendación de verificar la integridad de los pesos antes de usarlos.

## Enlaces

- Repositorio HuggingFace analizado: https://huggingface.co/CollectionStudio/siglip2-base-patch16-256
- Repositorio oficial del modelo: https://huggingface.co/google/siglip2-base-patch16-256
- Paper de SigLIP 2 (arXiv:2502.14786): https://arxiv.org/abs/2502.14786
- Paper de SigLIP original (arXiv:2303.15343): https://arxiv.org/abs/2303.15343
- Paper de WebLI (arXiv:2209.06794): https://arxiv.org/abs/2209.06794
- Documentación de SigLIP en transformers: https://huggingface.co/transformers/main/model_doc/siglip.html

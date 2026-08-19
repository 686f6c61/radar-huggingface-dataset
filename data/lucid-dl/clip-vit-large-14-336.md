# lucid-dl/clip-vit-large-14-336

## Resumen

`lucid-dl/clip-vit-large-14-336` es un port del modelo CLIP ViT-Large/14@336 de OpenAI a la librería Lucid, convertido a safetensors nativos de Lucid. CLIP (Contrastive Language-Image Pre-training) es un modelo multimodal que aprende representaciones conjuntas de imágenes y texto mediante supervisión de lenguaje natural, permitiendo tareas como clasificación de imágenes zero-shot o búsqueda multimodal sin entrenamiento específico. Este repositorio no reentrena el modelo, sino que reproduce los pesos originales de OpenAI en un formato optimizado para Lucid, con paridad numérica verificada.

El modelo está basado en el paper "Learning Transferable Visual Models From Natural Language Supervision" (Radford et al., 2021) y fue entrenado sobre el dataset WIT-400M, que contiene 400 millones de pares imagen-texto. La variante con resolución de entrada de 336×336 píxeles reduce la pérdida de información durante la tokenización de parches, mejorando el rendimiento en tareas que requieren detalle visual fino. Su relevancia actual radica en que es una referencia estándar para representaciones multimodales y sirve como base para sistemas de búsqueda, generación y anotación automática.

El repositorio tiene un tamaño de 1,7 GB y se distribuye bajo licencia MIT, lo que facilita su uso tanto en investigación como en aplicaciones comerciales. Está orientado a extracción de características (pipeline_tag: feature-extraction) y se integra con la API de Lucid mediante el cargador de pesos integrado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large/14), resolución de entrada 336×336 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión y texto, sin ventana de contexto de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (Lucid-native) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CLIP original: un codificador de imagen basado en Vision Transformer (ViT) con parches de 14×14 píxeles y una resolución de entrada de 336×336 píxeles, junto con un codificador de texto transformer. Ambos codificadores se entrenan conjuntamente con un objetivo contrastivo que maximiza la similitud coseno entre pares imagen-texto correctos y minimiza la de pares incorrectos. El dataset utilizado es WIT-400M, que contiene 400 millones de pares imagen-texto extraídos de la web, sin anotaciones manuales.

El entrenamiento sigue el procedimiento descrito en el paper de Radford et al. (2021), que no emplea RLHF ni DPO, sino únicamente aprendizaje contrastivo a gran escala. La variante ViT-L/14@336 es una versión de mayor resolución del ViT-L/14 estándar, diseñada para mejorar la captación de detalles finos. Este repositorio no modifica los pesos originales; se trata de una conversión a formato Lucid con verificación de paridad numérica, por lo que las innovaciones técnicas son las del modelo original, como la proyección multimodal y la capacidad de clasificación zero-shot.

## Capacidades

- Extracción de embeddings de imagen y texto para tareas de similitud y recuperación.
- Clasificación de imágenes zero-shot: asocia categorías textuales arbitrarias con imágenes sin necesidad de entrenamiento específico.
- Búsqueda multimodal: permite buscar imágenes a partir de texto y viceversa.
- Generación de representaciones densas para downstream tasks (lineal probe, fine-tuning).
- Alineación de espacios de imagen y texto para tareas de imagen-texto.
- Soporte de prompt engineering para mejorar el rendimiento en clasificación (p. ej., prefijos como "a photo of a ...").
- No incluye capacidades de generación de texto ni tool calling, ya que es un modelo de representación, no generativo.

## Casos de uso

- Clasificación zero-shot en producción: el modelo puede clasificar imágenes en categorías definidas dinámicamente, útil en sistemas de moderación de contenido o etiquetado automático, sin necesidad de reentrenar el modelo.
- Búsqueda de imágenes por texto en bases de datos: indexa embeddings de imágenes y consultas de texto, permitiendo recuperación por similitud en catálogos o bibliotecas visuales.
- Detección de duplicados y similitud visual: al comparar embeddings de imágenes, se pueden identificar copias o imágenes similares en grandes volúmenes de datos.
- Preentrenamiento de modelos de visión: los embeddings de CLIP se utilizan como inicialización para tareas de clasificación o detección en dominios específicos, mejorando la convergencia.
- Análisis de sentimiento en redes sociales: asocia imágenes con texto descriptivo para inferir el contenido emocional o temático de publicaciones visuales.
- Asistencia en accesibilidad: genera descripciones textuales de imágenes para personas con discapacidad visual, combinando CLIP con un modelo de generación de texto.
- Organización automática de bibliotecas de medios: categoriza y etiqueta colecciones de imágenes (por ejemplo, fotos personales o archivos de prensa) usando categorías definidas por el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo indica que la conversión se ha verificado con paridad numérica contra el modelo original de OpenAI, pero no incluye mediciones de rendimiento en conjuntos de datos como ImageNet, MMLU u otros. El paper original de CLIP reporta resultados en más de 30 datasets, pero no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, aunque el tamaño del repositorio (1,7 GB) sugiere que el modelo de visión ocupa aproximadamente 1,6 GB en fp32, por lo que cabría en GPUs con 4 GB o más en fp16.
- GPU recomendadas: no disponible en la información; se puede ejecutar en GPUs consumer como RTX 3060 o superiores, y en CPU para inferencia puntual.
- Despliegue: al ser un port de Lucid, se puede cargar directamente con la librería Lucid. Para otros frameworks (transformers, vLLM, llama.cpp) no se indica compatibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolución | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `lucid-dl/clip-vit-large-14-336` | ViT-L/14 | 336×336 | Lucid safetensors | MIT | Port de Lucid, paridad verificada |
| `openai/clip-vit-large-patch14-336` | ViT-L/14 | 336×336 | PyTorch | MIT | Original de OpenAI, requiere transformers |
| `timm/vit_large_patch14_clip_336.openai` | ViT-L/14 | 336×336 | PyTorch/TIMM | MIT | Variante para librería timm |

Los tres modelos comparten pesos y arquitectura; la diferencia está en el formato y la librería de carga. El de Lucid es el único en formato nativo de Lucid, mientras que los otros dos se usan con transformers y timm respectivamente.

## Limitaciones y advertencias

- El modelo es un port de pesos, no un modelo nuevo; no hay cambios en el comportamiento original.
- Sesgos conocidos: CLIP presenta sesgos en el dataset WIT-400M, que proviene de texto web, lo que puede reflejar estereotipos culturales y geográficos.
- Alucinación: no aplica al ser un modelo de embeddings, no generativo.
- Limitaciones de idioma: los idiomas soportados no están documentados; el entrenamiento se realizó principalmente con texto en inglés, por lo que el rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero hay que verificar que los pesos originales de OpenAI bajo MIT no tengan restricciones adicionales (no se documentan).
- Para producción: se recomienda evaluar el rendimiento en el dominio específico, ya que CLIP puede degradarse en dominios muy especializados o con imágenes muy diferentes a las del entrenamiento.
- El modelo no admite cuantizaciones documentadas; si se requiere reducir el peso, habría que convertirlo manualmente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lucid-dl/clip-vit-large-14-336
- Paper original: https://arxiv.org/abs/2103.00020
- Modelo original de OpenAI: https://huggingface.co/openai/clip-vit-large-patch14-336
- Variante en timm: https://huggingface.co/timm/vit_large_patch14_clip_336.openai
- Librería Lucid: https://github.com/ChanLumerico/lucid

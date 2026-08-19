# google/tipsv2-b14

## Resumen

TIPSv2 (Text-Image Pre-training with Spatial awareness) es una familia de modelos contrastivos visión-lenguaje desarrollada por Google DeepMind que produce características de imagen espacialmente ricas, alineadas con embeddings de texto. La variante B/14, objeto de esta ficha, combina un encoder de visión ViT de 86 millones de parámetros con un encoder de texto Transformer de 110 millones, sumando 195,9 millones de parámetros totales. El modelo está diseñado para tareas de clasificación zero-shot, extracción de características y segmentación semántica sin entrenamiento adicional, gracias a sus tokens de parche que conservan información espacial.

Publicado en abril de 2026 y presentado en CVPR 2026, TIPSv2 introduce tres mejoras de pre-entrenamiento frente a modelos anteriores: iBOT++, Head-only EMA y Multi-Granularity Text Captions, que reducen la brecha entre pre-entrenamiento y destilación. Su relevancia radica en que ofrece características visuales con conciencia espacial sin necesidad de un decodificador denso, lo que habilita aplicaciones como segmentación zero-shot y búsqueda por similitud a nivel de píxel. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face con pesos en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT vision encoder (12 capas) + Transformer text encoder (12 capas) |
| Parametros totales | 195.948.288 (86M vision + 110M texto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de embeddings, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (probablemente inglés, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TIPSv2-B/14 es un modelo contrastivo de dos torres: un encoder de visión basado en ViT con parches de 14x14 píxeles y un encoder de texto Transformer con tokenizador SentencePiece (minúsculas, máximo 64 tokens). La salida del encoder de visión incluye un token CLS global (dimensión 768) y 1024 tokens de parche que conservan la estructura espacial de la imagen (32x32 grid). El entrenamiento se basa en alineación contrastiva entre embeddings de imagen y texto, con tres innovaciones clave: iBOT++ para mejorar el aprendizaje de características locales, Head-only EMA para estabilizar el pre-entrenamiento y Multi-Granularity Text Captions para enriquecer las anotaciones textuales. El modelo no está diseñado para generación de texto; su salida son representaciones vectoriales.

Según el paper (arXiv:2604.12012), TIPSv2 también ofrece cabezas DPT (Dense Prediction Transformer) opcionales para segmentación densa, disponibles como variantes separadas (por ejemplo, `google/tipsv2-b14-dpt`). El preprocesado de imagen no requiere normalización ImageNet, solo redimensionado a 448x448 y conversión a tensor en rango [0,1].

## Capacidades

- Codificación de imágenes: genera un embedding global (token CLS) y embeddings por parche (tokens espaciales) que permiten localizar objetos y comprender la disposición espacial.
- Codificación de texto: produce embeddings de frases o clases (por ejemplo, "a photo of a bus") en el mismo espacio semántico que las imágenes.
- Clasificación zero-shot: mediante similitud coseno entre el embedding global de la imagen y los embeddings de texto de las clases, sin necesidad de entrenamiento adicional.
- Extracción de características espaciales: los tokens de parche pueden usarse para tareas densas como segmentación o detección de regiones.
- Segmentación zero-shot: con las cabezas DPT asociadas, el modelo puede generar mapas de segmentación semántica sin datos etiquetados.
- Visualización de características: los tokens espaciales pueden proyectarse con PCA para inspección visual.
- No soporta tool calling, generación de texto ni razonamiento multi-paso; es exclusivamente un modelo de representación.

## Casos de uso

- Clasificación de imágenes sin entrenamiento: dado un conjunto de categorías arbitrarias, el modelo asigna la clase más probable mediante similitud coseno. Útil para prototipos rápidos o dominios con pocos datos etiquetados.
- Búsqueda de imágenes por texto (image-text retrieval): indexando embeddings de imágenes y consultando con texto, se pueden construir sistemas de búsqueda semántica en catálogos visuales.
- Segmentación semántica zero-shot: usando las cabezas DPT, se pueden generar mapas de segmentación para clases no vistas durante el entrenamiento, aplicable en análisis de imágenes médicas o satelitales.
- Extracción de características para fine-tuning: los embeddings globales y espaciales sirven como punto de partida para entrenar clasificadores o detectores en dominios específicos con pocos datos.
- Moderación de contenido: clasificar imágenes en categorías de seguridad (violencia, desnudos, etc.) sin necesidad de un modelo entrenado ad hoc.
- Análisis de documentos escaneados: extraer características espaciales de diagramas o figuras para tareas de comprensión de documentos.
- Robótica y navegación: los tokens espaciales proporcionan información de localización de objetos en el entorno, útil para tareas de manipulación o planificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 195M parámetros con pesos en safetensors (~0,8 GB), la inferencia en FP32 requiere aproximadamente 0,8 GB de VRAM solo para los pesos; con activaciones y overhead, se recomienda al menos 2-4 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, RTX 4090). También funciona en CPU para inferencia puntual, aunque más lento.
- Cabe en GPUs consumer: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: transformers (PyTorch) con `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp u Ollama, dado que no es un modelo generativo.
- Latencia y throughput: no se han publicado datos específicos. En una GPU RTX 3090, la codificación de una imagen de 448x448 debería completarse en decenas de milisegundos, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. Como referencia cualitativa, TIPSv2-B/14 se sitúa en la misma categoría que CLIP ViT-B/16 o SigLIP-B/16, pero con la ventaja de tokens espaciales explícitos para tareas densas. Sin embargo, no hay números de rendimiento para comparar directamente.

## Limitaciones y advertencias

- Sesgos: al ser un modelo entrenado con datos de internet, puede heredar sesgos visuales y culturales presentes en el conjunto de entrenamiento. No se han publicado evaluaciones de sesgo específicas.
- Alucinación: no aplica, ya que no genera texto libre.
- Limitaciones de contexto: el encoder de texto acepta un máximo de 64 tokens; frases más largas se truncarán. El modelo no procesa secuencias de video ni audio.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones significativas, siempre que se mantenga el aviso de licencia.
- Dependencia de código remoto: requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del repositorio de Hugging Face. Se recomienda auditar el código en entornos de producción.
- Idioma: no se especifican idiomas soportados; es probable que el entrenamiento se haya realizado principalmente con datos en inglés, lo que puede degradar el rendimiento en otros idiomas.
- Preprocesado específico: las imágenes deben redimensionarse a 448x448 y convertirse a tensor en rango [0,1] sin normalización ImageNet; usar otro preprocesado puede afectar drásticamente los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/google/tipsv2-b14
- Repositorio GitHub: https://github.com/google-deepmind/tips
- Paper (arXiv): https://arxiv.org/abs/2604.12012
- Sitio del proyecto: https://gdm-tipsv2.github.io/
- Variante con cabezas DPT: https://huggingface.co/google/tipsv2-b14-dpt

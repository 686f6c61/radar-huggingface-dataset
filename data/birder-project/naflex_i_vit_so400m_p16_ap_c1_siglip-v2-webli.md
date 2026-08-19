# birder-project/naflex_i_vit_so400m_p16_ap_c1_siglip-v2-webli

## Resumen
El modelo `naflex_i_vit_so400m_p16_ap_c1_siglip-v2-webli` es un encoder de visión basado en la arquitectura NaFlex SoViT 400M/16, derivado del modelo SigLIP 2 desarrollado por Google (Tschannen et al., 2025). Ha sido convertido al formato Birder por el proyecto `birder-project` para facilitar su uso en tareas de extracción de características de imagen, clasificación y como backbone para detección. El modelo conserva los pesos originales de SigLIP 2 y su arquitectura, permitiendo su integración en pipelines de visión por computador con la librería Birder.

Este encoder resuelve el problema de obtener representaciones visuales densas y semánticamente ricas, con soporte para localización y características de alta resolución. Su relevancia actual radica en que combina la eficiencia de la atención NaFlex (FlexAttention) con el entrenamiento contrastivo imagen-texto de SigLIP 2, ofreciendo un equilibrio entre rendimiento y coste computacional. Con 427,9 millones de parámetros y una entrada de 256x256 píxeles, es adecuado para tareas que requieren un buen equilibrio entre precisión y recursos.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | ViT (NaFlex SoViT 400M/16) |
| Parametros totales | 427,9 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión; entrada de 256x256 píxeles con patch de 16, genera 256 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (encoder visual, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento
El modelo es un Vision Transformer (ViT) con parches de 16x16 píxeles y una arquitectura SoViT (Shape-Optimized ViT) que ajusta la relación entre profundidad, ancho y número de cabezas para maximizar la eficiencia. Incorpora NaFlex (Native FlexAttention), una técnica de atención flexible que permite manejar secuencias largas de tokens con menor coste computacional, manteniendo la capacidad de modelar dependencias globales.

El entrenamiento original de SigLIP 2 combina el objetivo de contraste imagen-texto (SigLIP) con técnicas adicionales como preentrenamiento basado en captions, autodistilación y enmascaramiento de parches. Esto produce representaciones visuales con mejor comprensión semántica, localización y características densas en comparación con la primera versión de SigLIP. En este caso, el modelo se ha convertido al formato Birder sin modificar los pesos, por lo que no se dispone de detalles específicos sobre el dataset de entrenamiento ni el número de tokens utilizado; esos datos pertenecen al modelo base `google/siglip2-so400m-patch16-naflex`.

## Capacidades
- Extracción de embeddings de imagen: genera un vector de características de dimensión 1152 a partir de una imagen de entrada.
- Clasificación de imágenes: puede usarse como backbone para clasificación, ya sea mediante fine-tuning o como extractor de características congelado.
- Características para detección: proporciona mapas de activación multi-etapa a través del método `detection_features`, útil para detectores de objetos.
- Transfer learning: al ser un encoder preentrenado, es adecuado para fine-tuning en dominios específicos con pocos datos.
- Soporte para visión-lenguaje: al derivar de SigLIP 2, sus embeddings pueden alinearse con texto en sistemas multimodales.
- No incluye capacidades de generación de texto, tool calling ni agentes, al ser exclusivamente un modelo de visión.

## Casos de uso
- Clasificación de imágenes en dominios especializados: fine-tuning del encoder para clasificar imágenes médicas, satelitales o industriales, aprovechando las características preentrenadas de alta calidad.
- Búsqueda y recuperación de imágenes: uso de los embeddings de 1152 dimensiones para construir índices de similitud en bases de datos visuales (por ejemplo, motores de búsqueda de productos).
- Backbone para detección de objetos: integración del mapa de características de la etapa 1 (tensor de 1x1152x16x16) en arquitecturas como Faster R-CNN o YOLO para detectar objetos en imágenes de alta resolución.
- Segmentación semántica: empleo del encoder como extractor de características en modelos como U-Net o SegFormer, donde la representación densa es clave.
- Sistemas de visión-lenguaje: uso como encoder visual en modelos tipo CLIP o LLaVA, alineando las representaciones con texto para tareas como captioning o respuesta visual a preguntas.
- Análisis de imágenes de documentos: extracción de características para clasificar documentos escaneados o detectar regiones de interés en imágenes de texto.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: en FP32, el modelo ocupa aproximadamente 1,7 GB (427,9 M parámetros × 4 bytes). En FP16, alrededor de 0,86 GB. Con overhead de activaciones y preprocesado, se recomienda al menos 2 GB de VRAM para inferencia básica.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo sin problemas. Ejemplos: NVIDIA GTX 1650, RTX 3060, A100, H100.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como RTX 3060, RTX 4070 o superiores, incluso en modos de baja precisión.
- Opciones de despliegue: el modelo se usa principalmente con la librería Birder (Python). También puede exportarse a ONNX o TensorRT para producción, aunque no se documenta en la ficha.
- Latencia y throughput: no se proporcionan datos concretos, pero al ser un modelo de 427 M parámetros con entrada de 256x256, la inferencia en GPU moderna es del orden de decenas de milisegundos por imagen.

## Comparativa con modelos similares
No se dispone de información suficiente para realizar una comparativa con otros modelos en la documentación proporcionada. Se recomienda consultar el modelo base `google/siglip2-so400m-patch16-naflex` y otras variantes de SigLIP 2 para obtener referencias de rendimiento.

## Limitaciones y advertencias
- Es un modelo de visión puro: no genera texto ni procesa lenguaje natural; solo produce representaciones visuales.
- Tamaño de entrada fijo: la resolución de entrenamiento es 256x256, por lo que imágenes con otras dimensiones deben reescalarse, lo que puede afectar a la precisión en objetos pequeños.
- Dependencia de la librería Birder: el formato de pesos y las funciones de carga están diseñados para Birder, lo que puede limitar su uso en otros frameworks sin conversión previa.
- Sesgos potenciales: al derivar de SigLIP 2, puede heredar sesgos presentes en los datos de entrenamiento originales (imagen-texto de WebLI), aunque no se documentan específicamente.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos del modelo base y de los datos utilizados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/birder-project/naflex_i_vit_so400m_p16_ap_c1_siglip-v2-webli
- Modelo base SigLIP 2: https://huggingface.co/google/siglip2-so400m-patch16-naflex
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Paper ViT original: https://arxiv.org/abs/2010.11929
- Paper Getting ViT in Shape: https://arxiv.org/abs/2305.13035
- Repositorio de Birder (proyecto): no se ha encontrado un enlace directo en la información proporcionada.

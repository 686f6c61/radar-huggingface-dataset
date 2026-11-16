# litert-community/TIPSv2-L14-LiteRT

## Resumen

TIPSv2-L14-LiteRT es la conversión a formato LiteRT (TFLite) del codificador de imágenes TIPSv2-L/14 de Google, publicada por la comunidad litert-community. No se trata de un modelo generativo ni multimodal completo: es exclusivamente un *image encoder* (Vision Transformer) que produce dos embeddings globales de 1024 dimensiones y un mapa de características espaciales de 256 o 1024 parches, según la resolución de entrada. Los codificadores de texto y las cabezas de tarea del modelo original no están incluidos.

El modelo resuelve el problema de desplegar un ViT de gran tamaño (L/14, unos 300M de parámetros) en entornos de inferencia ligeros y en aceleradores móviles, mediante cuantización post-entrenamiento A16W8 (pesos INT8, activaciones INT16) y variantes específicas compiladas para NPU de Qualcomm. Soporta dos resoluciones fijas, 224 y 448 píxeles, con pesos FP32 como línea base y versiones cuantizadas que reducen el tamaño del fichero de aproximadamente 1,16 GB a unos 300 MB.

Es relevante ahora porque el ecosistema LiteRT permite ejecutar extracción de características visuales en CPU y NPU de dispositivos sin GPU dedicada, y porque TIPSv2 incorpora dos tokens globales entrenados con tipos de caption distintos (web y sintéticas), lo que facilita tareas de recuperación y clasificación zero-shot siempre que se disponga del codificador de texto correspondiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/14), encoder de imágenes |
| Parámetros totales | no disponible (la model card no indica el recuento; el tamaño del repo es de 3,7 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija: 224×224 o 448×448 px) |
| Tipos de cuantización | FP32; A16W8 (pesos INT8 simétricos por canal de salida, activaciones INT16); A16W8 para NPU Qualcomm con activaciones UINT16 |
| Idiomas soportados | no disponible (modelo de visión; los tokens globales se entrenaron con captions de texto, idioma no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (LiteRT); FP32 y A16W8; variantes `model_qualcomm.tflite` para NPU |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tipo L/14: parches de 14×14 píxeles, 1024 dimensiones de embedding y 256 parches para entrada de 224 px o 1024 parches para 448 px. El modelo produce tres salidas: `cls_token` `[1,1024]`, `secondary_cls_token` `[1,1024]` y `patch_features` `[1,256,1024]` o `[1,1024,1024]`. Las salidas son post-LayerNorm y no están normalizadas L2; la normalización debe aplicarse fuera del modelo. El token global principal se entrenó con captions web y el secundario con captions sintéticas, según la model card.

La conversión a LiteRT aplica cuantización estática post-entrenamiento con TorchAO, usando 500 imágenes de calibración por resolución. LayerScale se pliega en los pesos y sesgos FP32 de las proyecciones antes de calibrar; los pesos de las capas fully-connected son INT8 simétricos por canal de salida, con sesgos INT64 y rangos de activación ajustados para acumulación en INT32. Los grafos omiten sumas redundantes de máscaras de atención y transposiciones de valor específicas de Qualcomm. La validación en runtime y las mediciones de rendimiento de estos grafos actualizados están pendientes según el autor; el fichero `validation.json` distingue comprobaciones estructurales de evidencia histórica del fichero fuente. La revisión de código fuente indicada es `52847a71eb02a3082c370fbcd98cd799687bd4d0`.

## Capacidades

- Extracción de características visuales globales: dos embeddings de 1024 dimensiones por imagen (`cls_token` y `secondary_cls_token`).
- Extracción de características espaciales: mapa de parches de 256 o 1024 tokens de 1024 dimensiones, útil para segmentación, detección o atención espacial.
- Recuperación imagen-texto y clasificación zero-shot, siempre que se use el codificador de texto original de TIPSv2 (no incluido en este repositorio).
- Procesamiento de imagen en dos resoluciones fijas: 224 px (menor coste) y 448 px (resolución nativa, mayor detalle).
- Inferencia en CPU mediante LiteRT y en NPU de Qualcomm mediante los ficheros `model_qualcomm.tflite`.
- No incluye generación de texto, tool calling, razonamiento multi-paso, agentes, audio ni vídeo.

## Casos de uso

- Búsqueda visual y recuperación imagen-imagen: indexar el `cls_token` de un catálogo de imágenes y hacer búsqueda por similitud coseno; el embedding de 1024 dimensiones es compacto y adecuado para índices vectoriales.
- Recuperación imagen-texto: combinar los embeddings del encoder con el codificador de texto de TIPSv2 para búsqueda semántica de imágenes a partir de descripciones; el `secondary_cls_token` puede usarse como señal complementaria.
- Clasificación de imágenes con pocas etiquetas: extraer características y entrenar un clasificador lineal o kNN encima, sin reentrenar el ViT.
- Segmentación y localización débil: usar `patch_features` como entrada a cabezas de segmentación o para generar mapas de atención sobre regiones de la imagen.
- Despliegue en dispositivos móviles y embebidos: la variante A16W8 de 224 px ocupa unos 299 MB y puede ejecutarse en CPU LiteRT; la variante Qualcomm permite descargar el trabajo a la NPU en hardware compatible.
- Moderación o filtrado visual en el borde: calcular embeddings en el dispositivo para detectar duplicados, near-duplicates o contenido similar sin enviar imágenes a un servidor.
- Preprocesado de pipelines multimodales: generar características visuales para un LLM o un sistema de recuperación posterior que consuma los tokens de parche.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento de los grafos actualizados están pendientes, y no se proporcionan cifras de latencia ni throughput.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero FP32 de 224 px pesa 1156,7 MiB y el de 448 px 1159,7 MiB; las variantes A16W8 pesan 298,7 MiB (224 px) y 301,7 MiB (448 px).
- GPU recomendadas: no se especifican; el ejemplo de uso es CPU. Al ser un modelo TFLite, el despliegue típico es CPU o NPU, no GPU de escritorio.
- GPU de consumo: no hay datos de soporte GPU para LiteRT en esta model card; la ruta prevista es CPU o NPU Qualcomm.
- Opciones de despliegue: LiteRT (`ai-edge-litert==2.3.0`), con script de ejemplo `run_tipsv2_tflite.py`; los ficheros `model_qualcomm.tflite` requieren un compilador y runtime de proveedor compatible.
- Latencia y throughput: no disponibles. La model card advierte que la ejecución A16W8 en CPU puede ser lenta y recomienda FP32 como línea base en CPU.
- Carga de modelos: se deben cargar por nombre de fichero para soportar buffers de pesos externos, especialmente en los ficheros FP32 grandes.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Resolución | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| TIPSv2-L14-LiteRT | ViT-L/14 encoder, cuantizado | no disponible | 224 / 448 fija | TFLite (FP32, A16W8) | Apache 2.0 | Dos tokens globales; sin codificador de texto |
| google/tipsv2-l14 | ViT-L/14 encoder original | no disponible | 224 / 448 | PyTorch (safetensors) | Apache 2.0 | Modelo fuente; incluye implementación completa |
| ViT-L/14 (CLIP) | ViT-L/14 encoder | ~304M (referencia pública) | 224 | safetensors, ONNX | MIT / Apache 2.0 según variante | Ampliamente soportado; normalización ImageNet estándar |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo ni multimodal completo: solo codifica imágenes; cualquier tarea texto-imagen requiere el codificador de texto de TIPSv2, que no está incluido.
- Los grafos actualizados no han sido validados en runtime ni medidos en rendimiento según el autor; `validation.json` separa comprobaciones estructurales de evidencia histórica.
- La ejecución A16W8 en CPU puede ser lenta; usar FP32 como línea base en CPU.
- Los ficheros `model_qualcomm.tflite` no soportan fallback a CPU y requieren compilador y runtime de proveedor; sus salidas Softmax usan zero point 0 y escala 1/32768.
- Las salidas no están normalizadas L2; es responsabilidad del usuario aplicar la normalización adecuada a cada tarea.
- El preprocesado es estricto: RGB, redimensionado bilineal directo al cuadrado, división por 255, sin recorte ni normalización ImageNet mean/std.
- Resolución de entrada fija: no se admite resolución arbitraria sin reconvertir el modelo.
- No hay información sobre sesgos, riesgo de alucinación (no aplica a un encoder) ni cobertura idiomática de los captions de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de google/tipsv2-l14 y debe conservarse el aviso de licencia y el fichero NOTICE.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/TIPSv2-L14-LiteRT
- Modelo base: https://huggingface.co/google/tipsv2-l14
- Repositorio TIPS: https://github.com/google-deepmind/tips
- Paper TIPSv2: https://arxiv.org/abs/2604.12012
- Licencia: https://huggingface.co/litert-community/TIPSv2-L14-LiteRT/blob/main/LICENSE
- Aviso legal: https://huggingface.co/litert-community/TIPSv2-L14-LiteRT/blob/main/NOTICE

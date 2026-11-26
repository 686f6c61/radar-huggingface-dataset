# litert-community/TIPSv2-B14-LiteRT

## Resumen

TIPSv2-B14-LiteRT es la conversión a formato LiteRT (TFLite) del codificador de imágenes TIPSv2-B/14 de Google, publicada por la comunidad litert-community. Se trata de un encoder visual autónomo basado en Vision Transformer con parche de 14x14 y 768 dimensiones de embedding, que produce dos embeddings globales (uno entrenado con pies de foto web y otro con pies sintéticos) y características espaciales por parche. No incluye el codificador de texto ni las cabezas de tarea del modelo original, por lo que su uso previsto es la extracción de características visuales.

El interés de esta versión reside en su empaquetado para inferencia en dispositivo: se ofrecen perfiles FP32 y A16W8 (pesos de capas fully-connected en 8 bits, activaciones del transformer en 16 bits) a resoluciones nativa de 448 y reducida de 224, con variantes específicas para NPU de Qualcomm. Los ficheros portables pesan entre 86,3 MiB y 329,3 MiB, lo que permite desplegar el encoder en móviles y equipos de sobremesa sin GPU dedicada.

La relevancia actual es práctica: permite llevar un encoder de visión de calidad a pipelines de búsqueda visual, segmentación zero-shot o indexación de imágenes en el borde, con latencias medidas en hardware comercial que van de 11 ms a 379 ms según resolución y acelerador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con parche 14x14, encoder de imágenes autónomo |
| Parámetros totales | no disponible (el modelo base es B/14 con 768 dimensiones de embedding) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen; resolución nativa 448, alternativa 224) |
| Tipos de cuantización | FP32 y A16W8 (pesos FC en 8 bits, activaciones transformer en 16 bits) |
| Idiomas soportados | no disponible (modelo de visión; sin codificador de texto incluido) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite / LiteRT (`model.tflite`, variantes `model_qualcomm.tflite`) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer con parche de 14x14 y dimensión oculta de 768, derivado de google/tipsv2-b14. La model card indica que el token global principal (`cls_token`) se entrenó con pies de foto web y el secundario (`secondary_cls_token`) con pies sintéticos, lo que sugiere un entrenamiento de alineación imagen-texto del que no se detallan número de tokens, composición del dataset ni si hubo RLHF o DPO. Las salidas son post-LayerNorm y no están normalizadas L2.

La innovación de esta publicación no está en la arquitectura sino en la conversión: se generan ficheros LiteRT portables con cuantización A16W8 y compilaciones dedicadas para NPU de Qualcomm que preservan los valores calibrados mediante almacenamiento de activaciones en enteros sin signo de 16 bits. La entrada es `pixel_values` en formato FLOAT32 NCHW `[1,3,S,S]` con S igual a 224 o 448; el preprocesado debe ser conversión a RGB, redimensionado directo al cuadrado con interpolación bilineal de PIL y división por 255, sin recorte ni normalización ImageNet. Las salidas son `cls_token` `[1,768]`, `secondary_cls_token` `[1,768]` y `patch_features` `[1,256,768]` a 224 o `[1,1024,768]` a 448.

## Capacidades

- Extracción de características visuales globales mediante dos embeddings de 768 dimensiones.
- Extracción de características espaciales por parche (256 tokens a 224, 1024 tokens a 448), aptas para tareas densas como segmentación.
- Clasificación zero-shot cuando se combina con el codificador de texto correspondiente del modelo original y el prompt `a photo of a {class name}.`.
- Segmentación semántica zero-shot por comparación de características de parche contra clases de texto.
- Inferencia en dispositivo con delegación a NPU (Qualcomm) y a WebGPU.
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un encoder de imágenes.
- No incluye cabeceras de tarea ni codificador de texto; estas deben aportarse por separado.

## Casos de uso

- Búsqueda visual inversa en móvil: indexar el `cls_token` de 768 dimensiones de cada imagen en una base vectorial y recuperar vecinos por similitud coseno, con latencia de 14 a 15 ms por imagen a 224 en NPU SM8750.
- Deduplicación y agrupación de imágenes en aplicaciones de galería: usar el embedding global a 224 con el perfil A16W8 (86,3 MiB) para comparar millones de fotos en el dispositivo sin enviar datos a la nube.
- Segmentación zero-shot en el borde: explotar `patch_features` a 448 (1024 tokens de 768 dimensiones) y compararlos contra embeddings de texto de clases para generar máscaras, con un mIoU de referencia de 24,567 % en VOC2012 bajo el protocolo del autor.
- Moderación de contenido visual en aplicaciones cliente: clasificar imágenes contra un conjunto fijo de categorías de texto precalculadas, aprovechando que el perfil A16W8 mantiene la precisión del token principal (65,56 % frente a 65,78 % en ImageNet top-1 a 224).
- Preprocesado para pipelines de visión aumentada: generar características espaciales en el dispositivo y enviar solo los tensores al servidor, reduciendo ancho de banda frente al envío de la imagen completa.
- Análisis de imágenes por lotes en servidor sin GPU: ejecutar el perfil FP32 en CPU con LiteRT 2.3.0, que reproduce exactamente los resultados de PyTorch FP32 (65,78 % a 224 y 68,84 % a 448 en ImageNet top-1).
- Prototipado en equipos de sobremesa Apple Silicon: usar WebGPU con el perfil FP32 a 224, con una latencia p50 de 11 ms en un M4 Pro.

## Benchmarks y rendimiento

Resultados del autor sobre 5.000 imágenes de validación de ImageNet y las 1.449 de VOC2012, con protocolo zero-shot propio (no reproducción de los benchmarks publicados por Google):

| Resolución | Perfil / backend | ImageNet top-1 | VOC mIoU |
|---|---:|---:|---:|
| 224 | PyTorch FP32 | 65,78 % | 24,026 % |
| 224 | LiteRT CPU FP32 | 65,78 % | 24,026 % |
| 224 | MT6897 NPU FP32 | 65,72 % | 24,027 % |
| 224 | MT6897 NPU A16W8 | 65,56 % | 24,023 % |
| 224 | SM8750 NPU FP32 | 65,80 % | 24,034 % |
| 224 | SM8750 NPU A16W8 | 65,56 % | 23,998 % |
| 448 | PyTorch FP32 | 68,84 % | 24,567 % |
| 448 | LiteRT CPU FP32 | 68,84 % | 24,567 % |
| 448 | MT6897 NPU FP32 | 68,88 % | 24,562 % |
| 448 | MT6897 NPU A16W8 | 68,84 % | 24,529 % |
| 448 | SM8750 NPU FP32 | 68,96 % | 24,567 % |
| 448 | SM8750 NPU A16W8 | 68,82 % | 24,537 % |

El autor señala que en el token secundario a 224 la pérdida de top-1 con A16W8 es mayor, de 0,38 a 0,88 puntos porcentuales frente a PyTorch FP32.

Latencias medidas con `benchmark_model` de LiteRT, con delegación completa al acelerador:

| Dispositivo | SoC | Backend | Perfil | p50 (ms) | p95 (ms) |
|---|---|---|---:|---:|---:|
| LJ9 | MT6897 | NPU | 224 FP32 | 88 | 91 |
| LJ9 | MT6897 | NPU | 224 A16W8 | 60 | 62 |
| LJ9 | MT6897 | NPU | 448 FP32 | 379 | 385 |
| LJ9 | MT6897 | NPU | 448 A16W8 | 307 | 313 |
| SM-S937U1 | SM8750 | NPU | 224 FP32 | 15 | 16 |
| SM-S937U1 | SM8750 | NPU | 224 A16W8 | 14 | 15 |
| SM-S937U1 | SM8750 | NPU | 448 FP32 | 265 | 267 |
| SM-S937U1 | SM8750 | NPU | 448 A16W8 | 112 | 113 |
| Apple M4 Pro 48GB | Apple M4 Pro | WebGPU | 224 FP32 | 11 | 11 |
| Apple M4 Pro 48GB | Apple M4 Pro | WebGPU | 448 FP32 | 44 | 44 |

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; los ficheros ocupan de 86,3 MiB (A16W8 a 224) a 329,3 MiB (FP32 a 448), y la memoria de trabajo depende del runtime LiteRT.
- GPU recomendadas: no se requieren GPU dedicadas; el perfil FP32 está pensado para CPU y el A16W8 para NPU de Qualcomm. En sobremesa se ha validado WebGPU sobre Apple M4 Pro.
- Cabe en cualquier dispositivo móvil moderno: los perfiles A16W8 de 86,3 y 88,6 MiB están diseñados para NPU de smartphone.
- Opciones de despliegue: `ai-edge-litert` 2.3.0 con Python, `benchmark_model` para medición, y compiladores y runtimes de proveedor para las variantes `model_qualcomm.tflite`.
- Latencia y throughput: de 11 ms (M4 Pro, WebGPU, 224 FP32) a 379 ms (MT6897, NPU, 448 FP32); en SM8750 el perfil A16W8 a 448 baja de 265 a 112 ms.
- Advertencia de compatibilidad: los ficheros A16W8 portables requieren las correcciones de compilador documentadas en `evaluation_results.json`; las rutas sin modificar de LiteRT 2.3.0 no los manejan correctamente en las NPU probadas. Las variantes `model_qualcomm.tflite` no admiten fallback a CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto | ImageNet top-1 (zero-shot) | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| TIPSv2-B14-LiteRT | no disponible (ViT-B/14, 768 dim) | 224 / 448 | no aplica | 65,78 % / 68,84 % (protocolo del autor) | Apache 2.0 | TFLite / LiteRT |
| google/tipsv2-b14 (original) | no disponible (ViT-B/14, 768 dim) | 448 nativa | no aplica | no disponible en la información proporcionada | no disponible en la información proporcionada | safetensors / PyTorch |
| CLIP ViT-B/14 | no disponible en la información proporcionada | 224 | no aplica | no disponible en la información proporcionada | no disponible en la información proporcionada | múltiples |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- El paquete no incluye codificador de texto ni cabezas de tarea: la clasificación y segmentación zero-shot requieren aportar el codificador de texto del modelo original y aplicar el prompt exacto indicado.
- El protocolo de evaluación es propio del autor y no reproduce los benchmarks publicados por Google, por lo que los números no son directamente comparables con la literatura.
- El preprocesado es estricto: redimensionado directo al cuadrado con bilineal de PIL y división por 255, sin recorte ni normalización ImageNet; desviarse altera las características.
- Las salidas son post-LayerNorm y no están normalizadas L2; hay que normalizar explícitamente antes de calcular similitudes.
- El perfil A16W8 pierde precisión en el token secundario a 224 (0,38 a 0,88 puntos de top-1), lo que puede afectar a tareas que dependan de ese embedding.
- Los ficheros A16W8 portables pueden ser lentos en CPU y no están soportados por el runtime GPU probado.
- Las variantes `model_qualcomm.tflite` exigen compilador y runtime de proveedor compatibles y no admiten fallback a CPU.
- No hay información sobre sesgos del dataset de entrenamiento ni sobre tasas de alucinación; al ser un encoder, el riesgo principal es de representación sesgada, no de generación de texto.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base google/tipsv2-b14 y de los datos de entrenamiento originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/TIPSv2-B14-LiteRT
- Modelo base: https://huggingface.co/google/tipsv2-b14
- Resultados detallados de evaluación: `evaluation_results.json` (en el repositorio)
- Protocolo de evaluación: `evaluation_protocol.json` (en el repositorio)
- Selección de imágenes de evaluación: `evaluation_selection.json` (en el repositorio)
- Script de ejemplo: `run_tipsv2_tflite.py` (en el repositorio)
- Paper referenciado en los tags: arXiv:2604.12012

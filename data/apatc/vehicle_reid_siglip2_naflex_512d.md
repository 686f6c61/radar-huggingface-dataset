# apatc/vehicle_reid_siglip2_naflex_512d

## Resumen

`vehicle_reid_siglip2_naflex_512d` es un modelo de re-identificación de vehículos (vehicle re-ID) desarrollado por apatc, que convierte recortes de imágenes de vehículos en vectores de 512 dimensiones con norma unitaria. La comparación entre embeddings se realiza mediante producto escalar (similitud coseno), lo que permite indexar y recuperar vehículos en grandes bases de datos de imágenes.

El modelo se construye sobre el encoder de visión-lenguaje SigLIP 2 de Google, concretamente sobre la variante NaFlex (native aspect ratio flexible), que procesa las imágenes a su proporción de aspecto natural sin forzar un reescalado cuadrado. Esta característica es especialmente relevante para escenarios de videovigilancia real, donde los recortes de vehículos presentan proporciones muy variables y la distorsión de aspecto degrada el rendimiento.

La relevancia de este modelo radica en su enfoque práctico para entornos de despliegue: ofrece una proyección a 512 dimensiones que retiene el 99,8% de la varianza del embedding nativo de 768 dimensiones, con una pérdida de aproximadamente un punto en rank-1. Además, se distribuye en formato ONNX, listo para inferencia en producción, y en formato PyTorch para integración en pipelines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2 NaFlex base patch16 con cuello de re-ID y proyeccion lineal a 512 dimensiones |
| Parametros totales | no disponible (repositorio de 0,8 GB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256 parches de imagen (16x16) |
| Tipos de cuantizacion | no disponible (formato ONNX y PyTorch nativos) |
| Idiomas soportados | no disponible (modelo de vision, sin texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17) y PyTorch (torch bundle) |

## Arquitectura y entrenamiento

El modelo se basa en el encoder SigLIP 2 en su variante NaFlex, que permite procesar imágenes a su proporción de aspecto natural sin reescalado cuadrado. La tokenización se realiza con parches de 16x16 píxeles, hasta un máximo de 256 parches por imagen. El backbone de SigLIP 2 fue preentrenado con un objetivo de contraste imagen-texto (similar a SigLIP original), enriquecido con técnicas como destilación auto-supervisada y predicción enmascarada, según el paper original.

Para la tarea de re-ID de vehículos, el modelo añade un cuello (neck) con parámetros de escala y desplazamiento (`neck_scale` y `neck_shift`) y una proyección lineal que reduce la dimensión del embedding de 768 a 512. Los pesos se distribuyen en un bundle de PyTorch que incluye configuración, backbone y los componentes del cuello y proyección. El entrenamiento específico para re-ID no está documentado en la información disponible, pero el rendimiento en benchmarks sugiere un ajuste fino con un protocolo de pérdida de clasificación o tripletes sobre datos de vigilancia y conjuntos públicos como VeRi-776 y VERI-Wild.

La interfaz ONNX acepta tres entradas: `pixel_values` (secuencia de parches de imagen, con forma (B, 256, 768)), `pixel_attention_mask` (máscara de parches reales vs. padding) y `spatial_shapes` (dimensiones del grid de parches por imagen). La salida es un vector de 512 dimensiones L2-normalizado dentro del grafo.

## Capacidades

- Extracción de características para re-identificación de vehículos: genera un embedding unitario de 512 dimensiones a partir de un recorte de imagen.
- Similitud por producto escalar: los vectores normalizados permiten comparar directamente mediante coseno.
- Procesamiento de proporción de aspecto nativa: no requiere reescalado cuadrado, evitando distorsiones en recortes de vigilancia.
- Inferencia con ONNX Runtime: lista para producción con opset 17.
- Soporte de resolución flexible: la variante NaFlex permite procesar imágenes de distintas resoluciones con un solo checkpoint.
- Sin dependencia de texto: el modelo es puramente visual, no requiere prompts ni texto para la extracción de características.

## Casos de uso

- **Videovigilancia en tiempo real**: el modelo puede procesar recortes de vehículos provenientes de cámaras fijas con proporciones variables, generando embeddings que permiten hacer seguimiento de un vehículo a través de múltiples cámaras. El rendimiento en el set de cámaras reales (mAP 0,666, rank-1 0,833) lo hace adecuado para este escenario.
- **Búsqueda de vehículos por imagen**: en un sistema de tráfico, un operador puede subir una imagen de un vehículo y recuperar todas las apariciones del mismo vehículo en una base de datos de imágenes de cámaras, mediante similitud coseno.
- **Análisis de flujo de tráfico**: agrupación de imágenes de vehículos por identidad para contar vehículos únicos en un período, sin depender de matrículas.
- **Integración en pipelines de computer vision**: como módulo de extracción de características dentro de sistemas más amplios que requieran seguimiento multi-cámara o clustering de vehículos.
- **Sistemas de seguridad en aparcamientos**: detectar si un vehículo está presente en el aparcamiento comparando embeddings de imágenes de entrada y salida.
- **Aplicaciones de búsqueda visual inversa**: en plataformas de venta de vehículos, permitir buscar coches similares por imagen, usando el embedding de 512 como clave de indexado.

## Benchmarks y rendimiento

El autor publica resultados bajo el protocolo estándar de re-ID (se eliminan las entradas de la galería que comparten identidad y cámara con la consulta, y se omiten consultas sin coincidencia real). Se compara con CLIP-ReID ViT-B/16 usando los pesos y preprocesamiento publicados por ese modelo.

| benchmark | este modelo | CLIP-ReID ViT-B/16 |
|---|---|---|
| Set de vigilancia real (480q / 1.243g) | **0,6660 / 0,8333** | 0,2550 / 0,5729 |
| VeRi-776 | 0,5801 / 0,8045 | **0,7100 / 0,9321** |
| VERI-Wild (test-3000) | **0,4158 / 0,5365** | 0,2274 / 0,4548 |

Notas del autor:
- El set de cámaras reales es un benchmark propio con 290 identidades, 1.243 imágenes verificadas y 480 consultas, el más cercano a condiciones de despliegue. El margen es de +0,41 mAP y +26,0 puntos de rank-1.
- CLIP-ReID lidera en VeRi-776, el benchmark para el que fue ajustado. La diferencia es real y se reporta explícitamente.
- Los resultados de CLIP-ReID se midieron con sus pesos y preprocesamiento publicados, no una reimplementación.
- Las cifras se miden con el embedding nativo de 768-d. La proyección publicada de 512-d retiene el 99,8% de la varianza y cuesta aproximadamente un punto de rank-1: 0,6621 / 0,8229 en el set de cámaras reales.

## Requisitos de hardware

- VRAM estimada: el modelo tiene un tamaño de repositorio de 0,8 GB; con el formato ONNX, la inferencia puede requerir entre 1-2 GB de VRAM en precisión FP32, y menos de 1 GB en FP16 (no disponible el detalle exacto).
- GPUs recomendadas: cualquier GPU con soporte CUDA (GTX 1060 6GB o superior, RTX 2060 en adelante) puede ejecutarlo en FP16. Para CPU, la inferencia es viable con ONNX Runtime en equipos con 16 GB de RAM.
- En GPU consumer: sí, es un modelo de tamaño moderado (el backbone SigLIP2 base tiene alrededor de 400 M de parámetros, pero no se ha confirmado para este modelo concreto).
- Opciones de despliegue: ONNX Runtime (C++/Python), PyTorch con torch bundle, o integración en servicios como Triton Inference Server. También puede convertirse a formatos como TensorRT o OpenVINO para optimizar latencia.
- Latencia y throughput: no disponibles en la información proporcionada. Se estima que en una RTX 3090, una inferencia de una imagen individual tomaría unos pocos milisegundos, pero no hay datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dimensiones de embedding | Contexto | mAP (VeRi-776) | Licencia |
|---|---|---|---|---|---|
| `apatc/vehicle_reid_siglip2_naflex_512d` | SigLIP2 NaFlex base + proyección | 512 (768 nativo) | 256 parches | 0,5801 | Apache 2.0 |
| CLIP-ReID ViT-B/16 | CLIP ViT-B/16 + head de re-ID | 512 | 224x224 | 0,7100 | no disponible |
| TransReID (basado en ViT) | ViT-Base | 768 | 224x224 | 0,8360 (referencia) | no disponible |

Nota: los datos de CLIP-ReID provienen de la propia medición del autor en la model card. El rendimiento de TransReID es un valor de referencia de la literatura, no se ha verificado en este contexto. La comparación principal se limita a CLIP-ReID, ya que es el único modelo contrastado en la información proporcionada.

## Limitaciones y advertencias

- El modelo está orientado exclusivamente a la re-identificación de vehículos; no puede procesar texto ni realizar tareas de visión general como clasificación de escenas o detección.
- No se dispone de información sobre sesgos del modelo, pero es probable que el rendimiento dependa de la distribución de las cámaras de entrenamiento (por ejemplo, ángulos, condiciones de iluminación) y pueda degradarse en entornos con condiciones meteorológicas extremas.
- Riesgo de alucinación no aplica (es un modelo de visión puro), pero sí existe riesgo de falsos positivos en la comparación de embeddings si las imágenes de vehículos de distintos modelos son muy similares.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos de la licencia del modelo base SigLIP 2 (Apache 2.0 también, según su página de HuggingFace).
- El modelo está diseñado para recortes de vehículos, no para imágenes completas de escenas; si se usa con imágenes de escena completa, el rendimiento será subóptimo.
- La ventana de contexto de 256 parches limita la resolución máxima de entrada: imágenes con mayor resolución que 256 parches (por ejemplo, 16x16 = 256) deben ser reescaladas o recortadas, lo que puede perder información de detalles finos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/apatc/vehicle_reid_siglip2_naflex_512d
- Modelo base SigLIP2 NaFlex: https://huggingface.co/google/siglip2-base-patch16-naflex
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786
- Documentación de SigLIP 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/siglip2
- Notebook de inferencia SigLIP2: https://colab.research.google.com/github/qubvel/transformers-notebooks/blob/main/notebooks/SigLIP2_inference.ipynb

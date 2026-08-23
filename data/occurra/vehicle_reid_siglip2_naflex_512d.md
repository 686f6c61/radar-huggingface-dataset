# occurra/vehicle_reid_siglip2_naflex_512d

## Resumen

`occurra/vehicle_reid_siglip2_naflex_512d` es un modelo de re-identificación de vehículos (vehicle re-ID) desarrollado por el usuario occurra sobre la arquitectura SigLIP 2, adaptada con el módulo NAFlex. El modelo toma recortes de imágenes de vehículos y produce vectores de 512 dimensiones normalizados L2, que se comparan mediante similitud coseno para determinar si dos imágenes corresponden al mismo vehículo. Es un modelo de extracción de características visuales (image-feature-extraction) y no procesa texto.

El modelo está diseñado para consumir imágenes a su relación de aspecto natural, sin forzar un redimensionado cuadrado, mediante tokenización de parches de 16×16 hasta un máximo de 256 parches. Esto lo hace especialmente robusto para escenarios reales donde los vehículos aparecen en distintas proporciones. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas. El repositorio incluye pesos en formato ONNX (opset 17) y un bundle de PyTorch, con un tamaño total de 1,5 GB.

El modelo se presenta como una alternativa a CLIP-ReID, con mejoras en métricas de mAP en varios benchmarks propios, aunque reconoce una ligera desventaja en el conjunto VeRi-776. Es relevante para aplicaciones de videovigilancia, seguimiento de tráfico y búsqueda de vehículos en bases de datos de imágenes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 con adaptación NAFLEX (ViT con parches de 16×16, entrada de hasta 256 parches a resolución natural) |
| Parametros totales | no disponible (el tamaño del repositorio es 1,5 GB, pero no se indica el número de parámetros) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión; procesa hasta 256 parches por imagen) |
| Tipos de cuantizacion | no especificado (se distribuye en FP32, presumiblemente) |
| Idiomas soportados | no aplica (modelo de visión, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17) y PyTorch bundle (.pth) |

## Arquitectura y entrenamiento

El modelo se basa en SigLIP 2, un encoder visual-lingüístico multilingüe descrito en el paper arXiv 2502.14786, y lo combina con la adaptación NAFLEX (no se proporcionan detalles técnicos de esta adaptación en la documentación disponible). La arquitectura utiliza una tokenización de parches de 16×16 píxeles y procesa imágenes a su relación de aspecto natural, sin redimensionado cuadrado, lo que evita distorsiones en vehículos alargados o anchos. La entrada se estructura como una secuencia de hasta 256 parches, junto con una máscara de atención que distingue parches reales de padding y una indicación de la cuadrícula espacial.

El modelo se entrena para re-identificación de vehículos mediante una proyección de la representación nativa de 768 dimensiones a un espacio de 512 dimensiones con normalización L2. Esta proyección retiene el 99,8 % de la varianza de la representación original y, según el autor, mejora ligeramente el mAP en algunos benchmarks al eliminar direcciones de ruido de baja varianza. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el proceso de optimización (si se usó RLHF, DPO, etc.). El modelo se distribuye con pesos ya entrenados y no se ofrece información sobre fine-tuning adicional.

## Capacidades

- Re-identificación de vehículos: dado un recorte de un vehículo, produce un vector de 512 dimensiones normalizado L2 que permite comparar con otros vectores mediante producto punto (similitud coseno).
- Procesamiento de imágenes a relación de aspecto natural: no requiere redimensionado cuadrado, lo que evita distorsiones y mejora la precisión en vehículos con proporciones no cuadradas.
- Soporte de lotes con cuadrículas mixtas: el modelo maneja correctamente imágenes con diferentes tamaños de parche dentro de un mismo batch, gracias a que el ajuste posicional se realiza en el grafo.
- Extracción de características visuales: se puede utilizar como encoder de imágenes para tareas de retrieval o comparación, aunque su especialidad es el dominio de vehículos.
- No incluye generación de texto, tool calling ni capacidades multimodales más allá de la visión.

## Casos de uso

- Vigilancia de tráfico y seguridad: identificar un vehículo capturado por una cámara en un instante y localizarlo en otras cámaras de la red, incluso si aparecen en días o condiciones climáticas diferentes. El modelo está específicamente evaluado para invarianza temporal (hasta 24,8 horas de separación en el benchmark real-camera set B).
- Búsqueda de vehículos en bases de datos de imágenes: dado un recorte de un vehículo (por ejemplo, de una denuncia o un incidente), buscar coincidencias en archivos de imágenes de peajes, estacionamientos o cámaras de tráfico.
- Seguimiento de flota: verificar que un vehículo de una flota aparece en determinados puntos de control mediante comparación de embeddings.
- Detección de vehículos robados: comparar la imagen de un vehículo reportado como robado con capturas de cámaras en tiempo real para alertar coincidencias.
- Análisis de comportamiento de conductores: asociar un vehículo con múltiples eventos capturados por distintas cámaras, por ejemplo para estudiar patrones de movilidad.
- Aplicaciones de aparcamiento inteligente: identificar un vehículo al entrar y salir de un estacionamiento para gestionar tarifas o reservas, usando una imagen de referencia.

## Benchmarks y rendimiento

El modelo publica resultados en cuatro benchmarks de re-identificación de vehículos. Los datos se presentan como mAP / rank-1, comparando con la versión anterior y con CLIP-ReID ViT-B/16.

| Benchmark | Este modelo | Versión anterior | CLIP-ReID ViT-B/16 |
|---|---|---|---|
| Real-camera set A (480q / 1,243g) | **0,6674 / 0,8042** | 0,6660 / **0,8333** | 0,2550 / 0,5729 |
| Real-camera set B (296q / 3,927g) | **0,7470 / 0,8209** | 0,7263 / 0,8074 | 0,2647 / 0,4155 |
| VeRi-776 | 0,6451 / 0,8439 | 0,5801 / 0,8045 | **0,7100 / 0,9321** |
| VERI-Wild (test-3000) | **0,4474 / 0,5763** | 0,4158 / 0,5365 | 0,2274 / 0,4548 |

Notas sobre el protocolo: en los conjuntos real-camera, las entradas de galería que comparten identidad y cámara con la consulta se descartan como basura, y las consultas sin coincidencia verdadera se omiten, excepto en real-camera set B, donde esta regla está deliberadamente desactivada porque el objetivo es medir la invarianza temporal (el vehículo vuelve a la misma cámara un día después). El modelo admite que CLIP-ReID supera en VeRi-776, el benchmark para el que fue ajustado, aunque la brecha se ha reducido de 0,130 a 0,065 mAP. No se han publicado resultados en otros benchmarks estándar como MMLU o HumanEval, ya que es un modelo de visión y no de lenguaje.

## Requisitos de hardware

- VRAM estimada: no se proporcionan datos oficiales. Dado el tamaño del repositorio (1,5 GB) y la entrada de hasta 256 parches de 768 dimensiones, el modelo es relativamente ligero; se estima que puede inferir en GPU con al menos 4 GB de VRAM para batchs pequeños, aunque no se puede confirmar sin pruebas.
- GPU recomendadas: para despliegue en producción, una GPU de gama media como RTX 3060 o superior sería suficiente para inferencia en lote. No se requieren GPUs de servidor como A100 o H100 para este modelo.
- Si cabe en GPU de consumo: sí, probablemente en cualquier GPU con 6 GB o más de VRAM, pero no se especifica el consumo exacto.
- Opciones de despliegue: al estar disponible en ONNX, se puede servir con ONNX Runtime, TensorRT, o mediante frameworks que soporten ONNX como Triton o OpenVINO. También se puede cargar el bundle de PyTorch directamente en un entorno Python.
- Latencia y throughput: no se han publicado mediciones. Dependerá del hardware y del tamaño de lote, pero al ser un modelo de visión con una entrada de secuencia de 256 tokens, la latencia por imagen debería ser inferior a 10 ms en GPU modernas, aunque es una estimación.

## Comparativa con modelos similares

- CLIP-ReID ViT-B/16: es el modelo de referencia de re-identificación de vehículos, ajustado específicamente sobre VeRi-776. Tiene una arquitectura ViT-B/16 (86 millones de parámetros) y produce embeddings de 512 dimensiones. En benchmarks, CLIP-ReID supera a este modelo en VeRi-776 (0,7100 mAP vs 0,6451), pero pierde claramente en los conjuntos real-camera (0,2550 vs 0,6674 y 0,2647 vs 0,7470). La licencia de CLIP-ReID no se especifica en la información disponible.
- Versión anterior del propio modelo: los pesos previos (sin especificar) tenían un rendimiento ligeramente inferior en mAP en todos los benchmarks, pero mejor rank-1 en real-camera set A. La nueva versión mejora la calidad general de ranking a costa de un peor top-1 en ese conjunto.
- Otros modelos de re-ID de vehículos como VehicleNet o TransReID no están incluidos en la comparación de los datos disponibles.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en vehículos; no se puede aplicar a otros objetos sin reentrenamiento.
- No hay información sobre posibles sesgos (por ejemplo, en tipos de vehículos, condiciones climáticas o regiones geográficas). Se desconoce si el entrenamiento incluye diversidad de vehículos de distintos países o épocas.
- Riesgo de alucinación: no aplica, al ser un modelo de extracción de características y no generar contenido.
- Limitaciones de contexto: no procesa texto, no es un modelo multimodal.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el modelo se distribuye sin garantías. Los usuarios deben verificar el cumplimiento de las licencias de los datos de entrenamiento, que no se especifican.
- Para producción, es recomendable evaluar el modelo en el propio dominio (cámaras específicas, condiciones de iluminación) ya que los benchmarks son de conjuntos propios y pueden no generalizar a escenarios no representados.

## Enlaces

- Modelo en Hugging Face (occurra): https://huggingface.co/occurra/vehicle_reid_siglip2_naflex_512d
- Modelo en Hugging Face (apatc, posible mirror): https://huggingface.co/apatc/vehicle_reid_siglip2_naflex_512d
- Repositorio de la adaptación SigLIP2-NAFlex: https://github.com/findit-ai/siglip2-naflex
- Guía de modelos del repositorio anterior: https://github.com/Findit-AI/siglip2-naflex/blob/main/models/MODELS.md
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786

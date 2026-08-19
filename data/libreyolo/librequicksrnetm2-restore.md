# LibreYOLO/LibreQuickSRNetm2-restore

## Resumen

LibreQuickSRNetm2-restore es un modelo de super-resolución de imagen 2x, compacto y diseñado para tiempo real, empaquetado para la librería LibreYOLO. Fue desarrollado por LibreYOLO a partir del checkpoint oficial de QuickSRNet Medium 2x de Qualcomm, incluido en el repositorio aimet-model-zoo. El modelo resuelve el problema de aumentar la resolución de imágenes de forma eficiente, con solo 50.604 parámetros, lo que lo hace adecuado para entornos con recursos limitados o aplicaciones de baja latencia.

La arquitectura es una red convolucional de super-resolución, originalmente entrenada en el dataset DIV2K. El checkpoint se ha convertido al formato de LibreYOLO sin modificar los tensores aprendidos, garantizando una salida idéntica a la implementación original. El modelo acepta imágenes RGB de dimensiones arbitrarias y produce una imagen al doble de altura y anchura. Su relevancia actual radica en la creciente demanda de soluciones de upscaling en tiempo real para streaming, videollamadas y aplicaciones móviles, donde el equilibrio entre calidad y velocidad es crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuickSRNet Medium 2x (red convolucional de super-resolucion) |
| Parametros totales | 50.604 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de imagen) |
| Tipos de cuantizacion | FP32, FP16 (inferido de las pruebas de latencia) |
| Idiomas soportados | No aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | PyTorch (.pt), exportable a ONNX y TorchScript |

## Arquitectura y entrenamiento

El modelo se basa en QuickSRNet Medium 2x, una arquitectura de super-resolucion convolucional optimizada para ejecucion en tiempo real. No se dispone de detalles internos de la red (numero de capas, bloques residuales, etc.) en la informacion proporcionada, pero se sabe que contiene 50.604 parametros y produce una imagen RGB al doble de resolucion. El checkpoint original fue entrenado en el dataset DIV2K, segun la model card. Los tensores del estado aprendido (14 tensores) se han conservado intactos durante la conversion al esquema de LibreYOLO, descartando solo los objetos de entrenamiento (epoch, optimizador, PSNR, SSIM). La salida en FP32 coincide exactamente con la implementacion original de Qualcomm (max_abs_diff == 0).

## Capacidades

- Super-resolucion 2x de imagenes RGB, aceptando dimensiones espaciales arbitrarias en la entrada.
- Inferencia en tiempo real: latencia de 1,746 ms (FP32) y 0,937 ms (FP16) para upscaling de 360p a 720p en una RTX 5070 Ti.
- Exportacion a ONNX (dimensiones dinamicas) y TorchScript (canvas fijo) para despliegue en multiples entornos.
- Integracion nativa con la libreria LibreYOLO mediante la API `LibreYOLO("LibreQuickSRNetm2-restore.pt")`.
- No incluye capacidades de texto, tool calling, agentes ni multimodalidad; es exclusivamente un modelo de restauracion de imagen.

## Casos de uso

- Mejora de imagenes en aplicaciones moviles: al tener solo 50.604 parametros, el modelo puede ejecutarse en dispositivos con poca memoria y CPU limitada, permitiendo upscaling local sin depender de la nube.
- Preprocesamiento para OCR: aumentar la resolucion de documentos escaneados o fotografias de texto mejora la precision de los sistemas de reconocimiento optico de caracteres.
- Upscaling de video en tiempo real: la baja latencia (menos de 2 ms en FP32 para 360p a 720p) lo hace apto para streaming en directo o videollamadas, donde se requiere procesar cada frame sin retrasos perceptibles.
- Restauracion de imagenes antiguas o de baja calidad: puede aplicarse a fotografias digitalizadas para recuperar detalles antes de su visualizacion o impresion.
- Mejora de imagenes de vigilancia: las camaras de seguridad suelen capturar a baja resolucion; el upscaling previo puede facilitar la identificacion de objetos o personas.
- Aumento de resolucion en imagenes medicas: aunque no esta especificamente entrenado para este dominio, puede servir como paso previo en pipelines de analisis de imagenes diagnosticas cuando se necesita una vista ampliada.

## Benchmarks y rendimiento

No se han publicado metricas de calidad (PSNR, SSIM) en la informacion disponible. La model card proporciona datos de latencia medidos en una NVIDIA GeForce RTX 5070 Ti con PyTorch 2.11.0 y CUDA 12.8, batch 1, cuDNN benchmarking activado, 10 warmups y 30 iteraciones:

| Input a output | Precision | Mediana | p95 |
|---|---:|---:|---:|
| 360p a 720p | FP32 | 1,746 ms | 1,770 ms |
| 360p a 720p | FP16 | 0,937 ms | 0,966 ms |
| 720p a 1440p | FP32 | 10,536 ms | 10,931 ms |
| 720p a 1440p | FP16 | 5,437 ms | 5,855 ms |

Estos tiempos excluyen la decodificacion de imagen, la transferencia de datos y la conversion del resultado.

## Requisitos de hardware

- VRAM estimada: con 50.604 parametros, el modelo ocupa aproximadamente 200 KB en FP32 y 100 KB en FP16, mas el overhead de activaciones. Cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de consumo como RTX 3060, RTX 4060 o superiores. La latencia reportada se obtuvo en una RTX 5070 Ti, pero el modelo es tan ligero que tambien funcionaria en GPUs integradas o en CPU con tiempos aceptables.
- Opciones de despliegue: PyTorch nativo, exportacion a ONNX para usar con ONNX Runtime, o TorchScript para entornos C++. Tambien se puede integrar en pipelines de LibreYOLO.
- Latencia y throughput: los datos de la tabla anterior indican que es capaz de procesar mas de 500 frames por segundo en FP16 para upscaling de 360p a 720p en una GPU de gama alta.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de super-resolucion (como ESRGAN, Real-ESRGAN o SwinIR) en la informacion proporcionada. Se puede afirmar cualitativamente que QuickSRNet Medium 2x es significativamente mas ligero que la mayoria de los modelos de super-resolucion modernos, que suelen tener decenas o cientos de millones de parametros, pero no se pueden ofrecer cifras concretas sin fuentes adicionales. Por tanto, la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El modelo solo soporta un factor de escala de 2x; no es posible utilizarlo para otros aumentos (4x, 8x) sin reentrenamiento o modificacion de la arquitectura.
- Fue entrenado exclusivamente en el dataset DIV2K, por lo que su rendimiento puede degradarse en imagenes con dominios muy diferentes (por ejemplo, imagenes medicas, satelitales o con ruido extremo).
- No se han publicado metricas de calidad (PSNR/SSIM) en la informacion disponible, por lo que no se puede evaluar su rendimiento frente a otros metodos de super-resolucion.
- La licencia BSD-3-Clause permite uso comercial, pero requiere mantener el aviso de copyright de Qualcomm Innovation Center, Inc. (2022) y de LibreYOLO.
- Al ser un modelo de imagen, no tiene capacidades de procesamiento de texto, lenguaje natural ni razonamiento multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreQuickSRNetm2-restore
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Sitio web de LibreYOLO: https://www.libreyolo.com/
- Documentacion de LibreYOLO: https://www.libreyolo.com/docs
- Repositorio original de Qualcomm (aimet-model-zoo): https://github.com/quic/aimet-model-zoo/tree/1bd2bf5b17cdda9251437c444009b29e1a25054b/aimet_zoo_torch/quicksrnet
- Repositorio de Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/tree/16dbeb5e2805d4ada7218026de72e36878717d46/src/qai_hub_models/models/quicksrnetmedium

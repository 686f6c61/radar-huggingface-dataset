# qualcomm/Real-ESRGAN-x4plus

## Resumen

Real-ESRGAN-x4plus es un modelo de super-resolución basado en redes generativas adversarias (GAN) que amplía imágenes por un factor de 4x con una pérdida mínima de calidad. Esta variante concreta ha sido optimizada por Qualcomm para ejecutarse eficientemente en sus dispositivos, incluyendo chipsets Snapdragon y plataformas Dragonwing, mediante la compilación a formatos como ONNX, QNN_DLC y TFLITE con cuantización w8a8. El modelo deriva de la arquitectura Real-ESRGAN-x4plus original, una versión más grande y potente que la variante general-x4v3, y cuenta con 16,7 millones de parámetros, lo que lo hace adecuado para despliegue en entornos de borde y móviles.

La relevancia de este modelo radica en su capacidad para restaurar imágenes de baja resolución en tiempo real sobre hardware de consumo, sin necesidad de GPU dedicada, gracias a la aceleración por NPU. Está pensado para desarrolladores que integran funcionalidades de mejora de imagen en aplicaciones Android, sistemas de vigilancia, fotografía computacional o preprocesamiento de documentos. La licencia BSD-3-Clause permite su uso comercial con atribución, y el repositorio incluye pesos preexportados listos para su implementación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Real-ESRGAN (RRDB - Residual in Residual Dense Block) |
| Parametros totales | 16,7 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | float32, w8a8 (cuantización de pesos y activaciones a 8 bits) |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (además de pesos PyTorch originales) |

## Arquitectura y entrenamiento

Real-ESRGAN-x4plus utiliza una arquitectura de super-resolución basada en GAN, con un backbone compuesto por bloques densos residuales (RRDB). El generador está entrenado de forma adversarial con un discriminador para producir texturas realistas y eliminar artefactos de compresión y ruido. La versión x4plus es la variante de mayor capacidad dentro de la familia Real-ESRGAN, diseñada para obtener resultados superiores en imágenes con degradaciones complejas.

El modelo original fue desarrollado por Xintao Wang et al. y presentado en el artículo "Real-ESRGAN: Training Real-World Blind Super-Resolution with Pure Synthetic Data" (arXiv:2107.10833). La versión de Qualcomm se basa en ese checkpoint y ha sido optimizada para ejecución en NPU mediante herramientas de Qualcomm AI Hub. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO, al tratarse de un modelo de visión.

## Capacidades

- Super-resolución 4x: amplía imágenes de entrada de 128x128 píxeles a 512x512 píxeles con restauración de detalles finos.
- Eliminación de ruido y artefactos: reduce el ruido de compresión JPEG, el desenfoque y otros artefactos típicos de imágenes de baja calidad.
- Restauración de imágenes degradadas: funciona bien con imágenes antiguas, escaneadas o capturadas con sensores de baja calidad.
- Inferencia eficiente en hardware Qualcomm: aprovecha la NPU para tiempos de inferencia de hasta 10 ms en chipsets recientes con cuantización w8a8.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje: es exclusivamente un modelo de imagen a imagen.

## Casos de uso

- Restauración de fotografías antiguas: el modelo amplía imágenes escaneadas de baja resolución, recuperando texturas y detalles en retratos o paisajes. Su factor 4x permite digitalizar archivos familiares con calidad suficiente para impresión o visualización en pantallas modernas.
- Mejora de imágenes de vigilancia: en sistemas de seguridad, las cámaras suelen capturar a baja resolución. Real-ESRGAN-x4plus puede ampliar regiones de interés (rostros, matrículas) para facilitar su identificación, siempre que la imagen original tenga al menos 128x128 píxeles.
- Preprocesamiento para OCR: documentos escaneados o fotografiados con móvil pueden ser ampliados y limpiados antes de pasarlos a un motor de reconocimiento óptico de caracteres, mejorando la precisión en textos pequeños o desenfocados.
- Upscaling de imágenes médicas: en entornos de telemedicina, el modelo puede mejorar la resolución de radiografías o ecografías de baja calidad para ayudar al diagnóstico, aunque debe validarse clínicamente antes de su uso.
- Mejora de imágenes de satélite o drones: imágenes aéreas de baja resolución pueden ampliarse para análisis de terreno, agricultura de precisión o inspección de infraestructuras, siempre que la escena no requiera detalle subpixel.
- Preparación de imágenes para impresión de gran formato: carteles, lonas o material gráfico que originalmente se diseñó para pantalla puede ampliarse 4x para impresión sin pixelado visible, reduciendo la necesidad de rediseñar desde vectores.
- Aplicación móvil de fotografía: integración en apps de cámara o edición para ofrecer un modo de "mejora automática" que amplía y restaura imágenes antes de compartirlas, con latencia inferior a 50 ms en dispositivos Snapdragon 8 Gen 3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (PSNR, SSIM, LPIPS) en la información disponible. Sin embargo, la tabla de rendimiento de inferencia en hardware Qualcomm es la siguiente:

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|
| Snapdragon X2 Elite | ONNX | float | 34,535 | 8 |
| Snapdragon X Elite | ONNX | float | 65,478 | 37 |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 50,898 | 0 - 743 |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 142,871 | 4 - 739 |
| Snapdragon 8 Elite Mobile | ONNX | float | 38,121 | 7 - 361 |
| Snapdragon 8 Elite Gen 5 Mobile | ONNX | float | 26,619 | 5 - 361 |
| Snapdragon X2 Elite | ONNX | w8a8 | 10,228 | 3 |
| Snapdragon X Elite | ONNX | w8a8 | 25,116 | 22 |
| Snapdragon 8 Gen 3 Mobile | ONNX | w8a8 | 16,475 | 2 - 759 |
| Snapdragon 8 Gen 1 Mobile | ONNX | w8a8 | 38,123 | 2 - 770 |
| Qualcomm Dragonwing QCS6490 | ONNX | w8a8 | 146,398 | 2 - 4 |
| Qualcomm Dragonwing IQ-8275 | ONNX | w8a8 | 22,822 | 2 - 5 |
| Qualcomm Dragonwing QCS8550 (Proxy) | ONNX | w8a8 | 23,854 | 0 - 29 |
| Qualcomm QCS8450 | ONNX | w8a8 | 38,123 | 2 - 770 |
| Qualcomm Dragonwing IQ-9075 | ONNX | w8a8 | 22,533 | 2 - 5 |

La cuantización w8a8 reduce significativamente el tiempo de inferencia y el uso de memoria, siendo la opción recomendada para despliegue en producción.

## Requisitos de hardware

- VRAM estimada: el modelo en float ocupa 63,9 MB y en w8a8 16,7 MB. La memoria pico durante inferencia varía entre 2 MB y 770 MB según el chipset y la configuración, por lo que cabe en cualquier dispositivo móvil o embebido con al menos 1 GB de RAM.
- GPU recomendadas: no requiere GPU dedicada; está optimizado para NPU de Qualcomm. En caso de ejecutarse en CPU o GPU genérica, puede usar cualquier hardware compatible con ONNX Runtime o TFLite, aunque el rendimiento será inferior.
- Compatibilidad con consumer GPU: sí, puede ejecutarse en GPUs de escritorio mediante ONNX Runtime, pero no es el objetivo principal del modelo.
- Opciones de despliegue: Qualcomm AI Hub Workbench, ONNX Runtime, TFLite, QNN (Qualcomm Neural Network) y el paquete Python `qai_hub_models`.
- Latencia y throughput: en Snapdragon 8 Gen 3 con cuantización w8a8, la inferencia tarda 16,5 ms por imagen de 128x128, lo que permite procesar aproximadamente 60 imágenes por segundo. En Snapdragon X2 Elite con w8a8, baja a 10,2 ms (cerca de 98 imágenes por segundo).

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para realizar una comparativa cuantitativa con otros modelos de super-resolución como ESRGAN original, Real-ESRGAN-general-x4v3 o SwinIR. Se puede indicar cualitativamente que Real-ESRGAN-x4plus es la variante de mayor capacidad dentro de la familia Real-ESRGAN, con 16,7 millones de parámetros frente a la versión general-x4v3, que es más ligera pero produce resultados inferiores en degradaciones complejas. La ventaja principal de esta versión de Qualcomm es su optimización específica para hardware Snapdragon, que no está disponible en los modelos originales.

## Limitaciones y advertencias

- Resolución de entrada fija: el modelo acepta únicamente imágenes de 128x128 píxeles. Para ampliar imágenes de mayor tamaño es necesario recortarlas en parches y recomponer el resultado, lo que puede introducir artefactos en los bordes.
- Alucinación visual: al ser un modelo generativo, puede inventar detalles que no existen en la imagen original, especialmente en texturas finas o regiones muy degradadas. Esto es crítico en aplicaciones forenses o médicas.
- Sesgos: al entrenarse con datos naturales, puede favorecer ciertos tipos de texturas o colores, y no se ha evaluado su comportamiento en dominios específicos como imágenes médicas o de satélite.
- Dependencia de hardware Qualcomm: aunque los pesos son estándar, el rendimiento óptimo solo se alcanza en dispositivos con NPU Qualcomm. En otras plataformas, la latencia puede ser mucho mayor.
- Licencia BSD-3-Clause: permite uso comercial y modificación, pero exige incluir el aviso de copyright en las redistribuciones. No hay restricciones de uso militar o de vigilancia, pero se recomienda revisar las políticas de Qualcomm sobre sus modelos.
- Sin soporte de lenguaje: no es un modelo multimodal; no puede procesar texto ni instrucciones, solo imágenes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/qualcomm/Real-ESRGAN-x4plus)
- [Página del modelo en Qualcomm AI Hub](https://aihub.qualcomm.com/compute/models/real_esrgan_x4plus)
- [Repositorio de Qualcomm AI Hub Models (código de exportación)](https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/real_esrgan_x4plus)
- [Repositorio original de Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN)
- [Artículo arXiv:2107.10833](https://arxiv.org/abs/2107.10833)

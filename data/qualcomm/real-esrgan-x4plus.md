# qualcomm/Real-ESRGAN-x4plus

## Resumen

Real-ESRGAN-x4plus es un modelo de superresolución de imágenes que aplica un factor de escalado ×4, desarrollado originalmente por Xintao Wang y colaboradores (proyecto Real-ESRGAN) y empaquetado en este repositorio por Qualcomm para su despliegue optimizado en dispositivos con aceleración NPU. El modelo resuelve el problema de aumentar la resolución de imágenes reales degradadas (con ruido, compresión JPEG, desenfoque o artefactos) minimizando la pérdida de calidad, y esta variante concreta está pensada para ejecutarse en hardware Qualcomm (Snapdragon, Dragonwing) mediante runtimes ONNX, QNN_DLC y TFLite.

La arquitectura es una red generativa adversarial (GAN) de tipo ESRGAN con generador basado en bloques residuales densos (RRDB), no un transformer. Cuenta con 16,7 millones de parámetros y un tamaño de pesos de 63,9 MB en float y 16,7 MB en cuantización w8a8. La entrada de referencia es de 128×128 píxeles, produciendo una salida de 512×512. Es relevante ahora porque permite superresolución en tiempo real (decenas de milisegundos por imagen) directamente en el dispositivo, sin depender de la nube.

Este repositorio no contiene pesos en formato PyTorch estándar para uso general, sino artefactos pre-exportados y optimizados para compilar y perfilar con Qualcomm AI Hub Workbench. La licencia BSD-3-Clause facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN ESRGAN con generador de bloques residuales densos (RRDB) |
| Parametros totales | 16,7 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | float y w8a8 (8 bits pesos y activaciones) |
| Idiomas soportados | no disponible (modelo de imagen, independiente del idioma) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLite (float y w8a8); checkpoint original RealESRGAN_x4plus |
| Resolucion de entrada | 128×128 (salida 512×512, factor ×4) |
| Tamano de pesos | 63,9 MB (float) / 16,7 MB (w8a8) |
| Pipeline | image-to-image |
| Runtime / SDK | QAIRT 2.51, ONNX Runtime 1.30.0 |

## Arquitectura y entrenamiento

El modelo es una red generativa adversarial del linaje ESRGAN. El generador emplea bloques residuales densos (RRDB) con conexiones residuales múltiples, y el entrenamiento original de Real-ESRGAN introduce un proceso de degradación sintética de alta orden para simular degradaciones reales (ruido gaussiano, desenfoque, compresión JPEG, remuestreo). La variante x4plus es la versión "grande" de la familia, frente a la más ligera general-x4v3, y fue entrenada con un discriminador U-Net que aporta la señal adversarial para recuperar texturas realistas.

No se dispone en la información proporcionada del número exacto de tokens, composición del dataset ni detalles del proceso de RLHF/DPO (no aplicable a un modelo de visión). La innovación destacable de este repositorio no está en el entrenamiento, sino en la optimización para despliegue: exportación a múltiples runtimes (ONNX, QNN_DLC, TFLite) con soporte de cuantización w8a8 y ejecución en la NPU de los chipsets Qualcomm, con compilación y perfilado mediante Qualcomm AI Hub Workbench.

## Capacidades

- Superresolución de imágenes reales con factor de escalado ×4 (entrada 128×128, salida 512×512).
- Eliminación de artefactos de compresión, ruido y desenfoque propios de imágenes degradadas.
- Recuperación de texturas y detalles finos mediante generación adversarial.
- Ejecución en NPU de dispositivos Qualcomm con latencias de decenas de milisegundos.
- Cuantización w8a8 que reduce el tamaño de pesos de 63,9 MB a 16,7 MB y acelera la inferencia.
- Despliegue multiplataforma vía ONNX, QNN_DLC y TFLite.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente de visión).

## Casos de uso

- Restauración de fotografías en aplicaciones móviles: el modelo puede integrarse en apps Android para escalar imágenes capturadas o recibidas, con inferencia de 8-26 ms en chipsets Snapdragon de gama alta y sin enviar datos a la nube.
- Mejora de miniaturas y contenido generado por usuarios: en plataformas de redes sociales, se puede aplicar superresolución a imágenes subidas con baja resolución antes de mostrarlas en pantallas de alta densidad.
- Restauración de imágenes comprimidas en mensajería: al ejecutarse en el dispositivo, permite recuperar calidad de fotos reenviadas con compresión agresiva sin coste de servidor.
- Procesamiento por lotes en dispositivos edge: con runtimes ONNX/TFLite y cuantización w8a8, se puede desplegar en hardware Dragonwing (IoT, cámaras, kioscos) para mejorar capturas en tiempo real.
- Preprocesado para pipelines de visión por computador: escalar imágenes de baja resolución antes de alimentar modelos de detección o segmentación, mejorando la precisión de etapas posteriores.
- Escalado de imágenes en aplicaciones de escaneo de documentos: recuperar legibilidad de capturas de cámara con resolución limitada antes de aplicar OCR.
- Integración en visores y galerías: mejorar la visualización de imágenes antiguas o de baja resolución en dispositivos con pantallas de alta densidad, aprovechando la NPU para no consumir CPU.

## Benchmarks y rendimiento

La model card proporciona tiempos de inferencia por dispositivo y precisión (no benchmarks de calidad tipo PSNR/SSIM). Se resumen los datos disponibles:

| Chipset | Runtime | Precision | Tiempo de inferencia | Memoria pico |
|---|---|---|---|---|
| Snapdragon 8 Elite Extreme Gen 6 | ONNX | float | 22,593 ms | 7-333 MB |
| Snapdragon 8 Elite Gen 6 | ONNX | float | 25,05 ms | 0-334 MB |
| Snapdragon 8 Elite Gen 5 For Galaxy | ONNX | float | 26,183 ms | 7-339 MB |
| Snapdragon 8 Elite For Galaxy | ONNX | float | 38,42 ms | 7-334 MB |
| Snapdragon 8 Gen 3 | ONNX | float | 49,905 ms | 0-718 MB |
| Snapdragon 8 Gen 1 | ONNX | float | 117,905 ms | 3-719 MB |
| Snapdragon X2 Elite | ONNX | float | 34,753 ms | 8-8 MB |
| Snapdragon X Elite | ONNX | float | 65,36 ms | 38-38 MB |
| Snapdragon 8 Elite Gen 5 For Galaxy | ONNX | w8a8 | 8,625 ms | 2-467 MB |
| Snapdragon 8 Elite For Galaxy | ONNX | w8a8 | 11,978 ms | 2-457 MB |
| Snapdragon 8 Gen 3 | ONNX | w8a8 | 15,407 ms | 2-727 MB |
| Snapdragon 8 Gen 1 | ONNX | w8a8 | 37,017 ms | 2-740 MB |
| Snapdragon X2 Elite | ONNX | w8a8 | 9,563 ms | 3-3 MB |
| Snapdragon X Elite | ONNX | w8a8 | 23,563 ms | 22-22 MB |

La cuantización w8a8 reduce el tiempo de inferencia aproximadamente a un tercio respecto a float en los mismos chipsets. No se han publicado resultados de benchmarks de calidad de imagen (PSNR, SSIM, LPIPS) en la información disponible.

## Requisitos de hardware

- El modelo está optimizado para NPU de chipsets Qualcomm (Snapdragon 8 Gen 1 en adelante, Snapdragon X Elite/X2 Elite, Dragonwing IQ-8275, IQ-9075, IQ-X7181, Q-8750, QCS8450, QCS8550).
- Tamaño de pesos: 63,9 MB en float, 16,7 MB en w8a8; la memoria pico observada oscila entre pocos MB y ~740 MB según chipset y precisión.
- No requiere GPU de escritorio para su despliegue objetivo; la ejecución se realiza en la NPU del dispositivo móvil o edge.
- Opciones de despliegue: ONNX Runtime 1.30.0, Qualcomm QAIRT 2.51 (QNN_DLC), TFLite; exportación personalizada mediante la librería Qualcomm AI Hub Models y compilación/perfilado con AI Hub Workbench.
- Latencia observada: 8,6-26 ms en float/w8a8 en chipsets de gama alta; hasta ~128 ms en chipsets de gama baja o IoT.
- No se dispone de datos de throughput agregado (imágenes/segundo) en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Factor de escalado | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Real-ESRGAN-x4plus (este repo, Qualcomm) | 16,7 M | ×4 | 128×128 | BSD-3-Clause | ONNX, QNN_DLC, TFLite optimizados para Qualcomm |
| Real-ESRGAN-general-x4v3 | no disponible | ×4 | no disponible | BSD-3-Clause | Repositorio original Real-ESRGAN |
| Real-ESRGAN-x4plus (original) | 16,7 M | ×4 | variable | BSD-3-Clause | PyTorch, pesos originales |

La diferencia principal frente al Real-ESRGAN-x4plus original es el empaquetado y la optimización para hardware Qualcomm (exportación a múltiples runtimes y cuantización w8a8), no la arquitectura ni los pesos. La variante general-x4v3 es más ligera y rápida pero con menor capacidad de restauración según la propia model card. No se dispone de datos de benchmarks de calidad comparativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en superresolución de imágenes; no genera texto, código ni realiza razonamiento.
- La entrada de referencia es de 128×128 píxeles; para imágenes mayores será necesario dividir en parches o reconfigurar la forma de entrada, lo que puede introducir costuras.
- Al ser una GAN, puede generar texturas plausibles pero no fieles a la realidad (alucinación visual), especialmente en caras, texto o patrones finos.
- La cuantización w8a8 puede degradar ligeramente la calidad de salida frente a float; no se han publicado métricas de dicha degradación en la información disponible.
- Los artefactos de este repositorio están optimizados para hardware Qualcomm; su uso en otras plataformas requiere reexportación desde el repositorio original.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin endoso; conviene revisar los términos exactos del proyecto original Real-ESRGAN.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre el número y composición de las imágenes usadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qualcomm/Real-ESRGAN-x4plus
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/real_esrgan_x4plus
- Librería Qualcomm AI Hub Models (GitHub): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/real_esrgan_x4plus
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Proyecto original Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Paper Real-ESRGAN (arXiv:2107.10833): https://arxiv.org/abs/2107.10833
- Qualcomm (sitio corporativo): https://www.qualcomm.com/

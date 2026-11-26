# qualcomm/SESR-M5

## Resumen

SESR-M5 es un modelo de superresolución de imágenes (image-to-image) desarrollado por Qualcomm y publicado en su organización de Hugging Face. Se trata de una implementación del modelo SESR (Super-Efficient Super Resolution) incluida en el zoo de modelos de AIMET, empaquetada y optimizada para su ejecución en dispositivos con aceleración NPU de Qualcomm (Snapdragon y Dragonwing). El modelo realiza un upscaling de factor 3 sobre entradas de 128x128 píxeles y está pensado para inferencia en el propio dispositivo (on-device), no en servidor.

Su relevancia radica en el tamaño extremadamente reducido: 343.000 parámetros, 1,32 MB en precisión float y 395 KB en cuantización w8a8. Esto permite ejecutarlo en la NPU de un móvil o de un SoC embebido con latencias inferiores al milisegundo en los chips más recientes (0,834 ms en Snapdragon 8 Elite Gen 6 en float; 0,364 ms en w8a8 sobre Snapdragon 8 Elite Gen 5 for Galaxy). Es, por tanto, una pieza de infraestructura para pipelines de cámara, galería o visión por computador en el borde, más que un modelo de propósito general.

No es un modelo de lenguaje ni un transformer generativo: es una red convolucional especializada en una única tarea. La ficha se centra en sus especificaciones de despliegue, rendimiento por chipset y limitaciones prácticas, ya que la información publicada por el autor no incluye detalles sobre el dataset de entrenamiento ni métricas de calidad de imagen (PSNR/SSIM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional para superresolución (SESR, implementación de AIMET Model Zoo); no disponible el detalle de capas |
| Parametros totales | 343K |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen; entrada fija de 128x128 píxeles) |
| Tipos de cuantizacion | Float y w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | No disponible (no es un modelo de texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | PyTorch (checkpoint `sesr_m5_3x_checkpoint`), ONNX, QNN_DLC y TFLITE; también GGUF no disponible |

## Arquitectura y entrenamiento

SESR (Super-Efficient Super Resolution) es una familia de redes convolucionales diseñada para superresolución con un coste computacional muy bajo. La implementación concreta de este repositorio proviene de AIMET Model Zoo (`aimet_zoo_torch/sesr`) y se distribuye como checkpoint `sesr_m5_3x_checkpoint`, es decir, con factor de escala 3x. El modelo opera sobre parches de 128x128 píxeles y produce una salida de 384x384 píxeles.

La información publicada no detalla el número de tokens de entrenamiento (no aplica), la composición del dataset de imágenes utilizado, ni si hubo etapas de ajuste fino específicas. Tampoco se documentan innovaciones como atención lineal o decodificación especulativa, que no tienen sentido en este tipo de red. La contribución técnica de esta publicación no es el entrenamiento, sino el empaquetado: exportación a ONNX, QNN_DLC y TFLITE, compilación con QAIRT 2.51 y perfilado en NPU de Qualcomm mediante AI Hub Workbench, con variantes float y w8a8 listas para desplegar.

## Capacidades

- Superresolución de imágenes con factor de escala 3x sobre entradas de 128x128 píxeles.
- Procesamiento de imagen a imagen (pipeline `image-to-image`), sin generación de texto.
- Ejecución en NPU de Qualcomm (unidad de cómputo primaria en todos los perfiles publicados).
- Variantes float y cuantizada w8a8 para equilibrar precisión y latencia.
- Exportación a ONNX Runtime, QNN (QAIRT) y TensorFlow Lite.
- Soporte de exportación con pesos personalizados, formas de entrada personalizadas y configuraciones de dispositivo mediante la librería `ai-hub-models`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Upscaling en la cámara del móvil: el modelo puede aplicarse a parches de 128x128 en tiempo real sobre la NPU, con latencias de 0,8-2,9 ms según chipset, para mejorar la resolución aparente de capturas o previsualizaciones sin consumir GPU ni CPU.
- Galería de fotos en el dispositivo: permite generar miniaturas de alta calidad o reescalar imágenes antiguas de baja resolución en segundo plano, con un coste de memoria pico de entre 2 y 47 MB según el SoC.
- Visión por computador en el borde: como etapa de preprocesado en pipelines de detección o segmentación que necesitan más resolución de la que capta el sensor, ejecutándose en la NPU junto a otros modelos.
- Dispositivos IoT y embebidos (Dragonwing QCS6490, IQ-8275, IQ-9075): superresolución en cámaras de vigilancia o industriales con presupuesto térmico y energético muy ajustado, gracias a los 395 KB del modelo cuantizado.
- Aplicaciones de realidad aumentada: reescalado de texturas o fotogramas de vídeo en tiempo real con latencia sub-milisegundo en chips de gama alta, adecuada para mantener la cadencia de fotogramas.
- Prototipado e investigación en eficiencia de modelos: al ser un modelo de 343K parámetros con licencia permisiva BSD-3-Clause, sirve como banco de pruebas para técnicas de cuantización, compilación y despliegue en NPU.
- Integración en pipelines de CI/CD de aplicaciones Android: los assets preexportados (ONNX, TFLITE, QNN_DLC) permiten validar el rendimiento del modelo en dispositivos reales a través de AI Hub Workbench antes de publicar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (PSNR, SSIM, LPIPS) en la información disponible. Los únicos datos publicados son de latencia y memoria en NPU por chipset, con entrada de 128x128:

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|
| Snapdragon 8 Elite Gen 6 Mobile | ONNX | float | 0,834 | 0 - 27 |
| Snapdragon 8 Elite Extreme Gen 6 Mobile | ONNX | float | 0,835 | 0 - 28 |
| Snapdragon 8 Elite Gen 5 For Galaxy | ONNX | float | 0,962 | 0 - 27 |
| Snapdragon 8 Elite For Galaxy | ONNX | float | 1,092 | 0 - 28 |
| Snapdragon X2 Elite | ONNX | float | 1,116 | 8 - 8 |
| Snapdragon 8 Gen 3 | ONNX | float | 1,383 | 0 - 40 |
| Snapdragon X Elite | ONNX | float | 2,019 | 8 - 8 |
| Snapdragon 8 Gen 1 | ONNX | float | 2,867 | 0 - 46 |
| Snapdragon 8 Elite Gen 5 For Galaxy | ONNX | w8a8 | 0,364 | 0 - 31 |
| Snapdragon 8 Elite For Galaxy | ONNX | w8a8 | 0,412 | 0 - 29 |
| Snapdragon 8 Gen 3 | ONNX | w8a8 | 0,530 | 0 - 40 |
| Snapdragon X Elite | ONNX | w8a8 | 0,766 | 3 - 3 |
| Snapdragon 8 Gen 1 | ONNX | w8a8 | 0,995 | 0 - 47 |
| Dragonwing QCS6490 | ONNX | w8a8 | 2,751 | 0 - 3 |

La cuantización w8a8 reduce la latencia aproximadamente a la mitad en los chips de gama alta y reduce el tamaño del modelo de 1,32 MB a 395 KB. No hay datos de rendimiento publicados para GPU o CPU en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Cualitativamente, SESR-M5 se sitúa en la categoría de superresolución ultraligera on-device, frente a alternativas más pesadas como ESRGAN o SwinIR, que no están diseñadas para NPU de móvil y no se distribuyen con assets precompilados para Qualcomm. La ventaja diferencial de este paquete es el ecosistema de despliegue (ONNX, QNN_DLC, TFLITE) y el perfilado en más de una docena de chipsets, no la calidad de reconstrucción, para la que no hay métricas publicadas.

| Modelo | Parametros | Contexto/entrada | Licencia | Despliegue en NPU Qualcomm |
|---|---|---|---|---|
| SESR-M5 | 343K | 128x128, escala 3x | BSD-3-Clause | Sí, assets oficiales |
| Alternativas (ESRGAN, SwinIR y similares) | No disponible | No disponible | No disponible | No disponible en la información consultada |

## Limitaciones y advertencias

- Entrada fija de 128x128 píxeles: no es un modelo de imagen completa; requiere trocear la imagen en parches y recomponerla, con posible aparición de artefactos en las costuras si no se solapan los parches.
- Factor de escala único 3x en el checkpoint publicado; otros factores requerirían reentrenamiento o exportación con pesos personalizados.
- No hay métricas de calidad de imagen publicadas (PSNR/SSIM), por lo que no se puede evaluar objetivamente la fidelidad de la reconstrucción frente a alternativas.
- No se documenta el dataset de entrenamiento, lo que impide evaluar sesgos de contenido ni el dominio de imágenes para el que fue optimizado.
- Rendimiento medido exclusivamente en NPU de Qualcomm; el comportamiento en GPU, CPU o aceleradores de otros fabricantes no está documentado.
- La variante w8a8 puede degradar la calidad de imagen respecto a float; no se publican comparativas de calidad entre ambas.
- Licencia BSD-3-Clause: permisiva y apta para uso comercial, pero exige conservar el aviso de copyright y no permite usar el nombre de Qualcomm para promocionar derivados sin permiso.
- El repositorio tiene un tamaño de 0,2 GB, mayor que el modelo en sí, debido a los múltiples assets preexportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qualcomm/SESR-M5
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/sesr_m5
- Librería AI Hub Models (GitHub): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/sesr_m5
- Implementación SESR en AIMET Model Zoo: https://github.com/quic/aimet-model-zoo/tree/develop/aimet_zoo_torch/sesr
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Paper de referencia citado en los tags (arXiv:2103.09404): https://arxiv.org/abs/2103.09404
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/

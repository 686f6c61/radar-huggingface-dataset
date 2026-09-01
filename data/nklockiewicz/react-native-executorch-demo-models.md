# nklockiewicz/react-native-executorch-demo-models

## Resumen

Este repositorio contiene exportaciones a ExecuTorch del modelo Moebius, un modelo de inpainting (eliminación de objetos) basado en difusión latente de 0,22 mil millones de parámetros, desarrollado por HUST y VIVO AI Lab. Los archivos están preparados para ejecutarse en dispositivos móviles mediante el framework react-native-executorch, que permite integrar modelos de IA on-device en aplicaciones React Native. La relevancia de este modelo radica en su capacidad para realizar edición de imágenes de forma local, sin conexión a internet, preservando la privacidad del usuario y reduciendo la latencia frente a soluciones en la nube.

El modelo se compone de tres gráficos separados: un codificador VAE, una UNet de difusión y un decodificador VAE, exportados con backends CoreML (para iOS) y XNNPACK (para Android), en precisiones fp16 y fp32 respectivamente. La resolución de entrada y salida es fija a 512x512 píxeles, con latentes de 64x64. El repositorio incluye también el script de exportación y un ejemplo de aplicación de demostración.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (VAE + UNet) para inpainting |
| Parametros totales | 0,22 mil millones (según model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | fp16 (CoreML) y fp32 (XNNPACK) |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Archivos .pte de ExecuTorch (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

Moebius es un modelo de difusión latente ligero diseñado para tareas de inpainting. La arquitectura se divide en tres componentes: un VAE encoder que transforma la imagen de entrada de 512x512 en latentes de 64x64, una UNet que realiza el proceso de denoising condicionado por la máscara y la imagen enmascarada, y un VAE decoder que reconstruye la imagen final. El modelo incorpora guía sin clasificador (classifier-free guidance) integrada en el gráfico de la UNet, que procesa internamente un lote de tamaño 2 para combinar las predicciones condicionadas y no condicionadas.

El entrenamiento original se describe en el paper "Moebius: 0.2B Lightweight Image Inpainting Framework with 10B-Level Performance" (ECCV 2026). No se proporcionan detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) en la información disponible. La exportación a ExecuTorch mantiene la resolución fija de 512x512, ya que la posición de cross-attention es un parámetro aprendido ligado a esa resolución. El bucle de muestreo DDIM se ejecuta en el lado de JavaScript, llamando secuencialmente a los tres gráficos exportados.

## Capacidades

- Eliminación de objetos en imágenes: el modelo rellena regiones enmascaradas con contenido plausible, permitiendo borrar elementos no deseados de una fotografía.
- Ejecución on-device: los gráficos exportados están optimizados para ejecutarse en dispositivos móviles mediante ExecuTorch, con soporte para CoreML (iOS) y XNNPACK (Android).
- Procesamiento local: no requiere conexión a internet, lo que garantiza privacidad y baja latencia.
- Resolución fija de 512x512 píxeles, tanto para entrada como para salida.
- No incluye capacidades de generación de texto, tool calling, agentes ni procesamiento multimodal más allá de imágenes.

## Casos de uso

- Edición de fotos en aplicaciones móviles: los usuarios pueden seleccionar un objeto no deseado en una imagen y eliminarlo al instante, con el procesamiento realizado en el propio dispositivo.
- Aplicaciones de comercio electrónico: permitir a los clientes quitar fondos u objetos de las fotos de productos antes de publicarlas, sin subir las imágenes a servidores externos.
- Herramientas de diseño gráfico para móviles: integrar la función de inpainting en aplicaciones de diseño para que los creadores puedan limpiar imágenes rápidamente.
- Aplicaciones de realidad aumentada: eliminar elementos del entorno capturado por la cámara en tiempo real para mejorar la experiencia de superposición de objetos virtuales.
- Archivado y organización de fotos: limpiar imágenes antiguas eliminando personas u objetos no deseados antes de almacenarlas.
- Prototipado de aplicaciones de IA on-device: servir como ejemplo de referencia para desarrolladores que quieran implementar modelos de difusión en React Native con ExecuTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original de Moebius menciona un rendimiento comparable a modelos de 10 mil millones de parámetros, pero no se incluyen métricas concretas (PSNR, SSIM, FID, etc.) en la model card ni en los resultados de búsqueda web.

## Requisitos de hardware

- Tamaños de los archivos exportados:
  - VAE encoder: 69 MB (CoreML fp16) / 137 MB (XNNPACK fp32)
  - UNet: 447 MB (CoreML fp16) / 905 MB (XNNPACK fp32)
  - VAE decoder: 100 MB (CoreML fp16) / 198 MB (XNNPACK fp32)
- Memoria total necesaria: aproximadamente 616 MB en fp16 (CoreML) y 1,24 GB en fp32 (XNNPACK), más memoria adicional para el bucle DDIM y buffers intermedios.
- Dispositivos compatibles: smartphones y tablets con iOS (CoreML) o Android (XNNPACK). Se recomienda al menos 2 GB de RAM libre para evitar cierres de la aplicación.
- GPUs: no se requiere GPU dedicada; el modelo está diseñado para ejecutarse en la NPU/GPU integrada del dispositivo móvil.
- Opciones de despliegue: integración mediante la librería react-native-executorch (npm), que gestiona la carga y ejecución de los gráficos .pte.
- Latencia y throughput: no se proporcionan datos específicos en la información disponible. El rendimiento dependerá del dispositivo y del número de pasos de denoising configurados en el bucle DDIM.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El paper de Moebius afirma un rendimiento a nivel de modelos de 10B parámetros, pero no se incluyen tablas comparativas con alternativas como LaMa, Stable Diffusion Inpainting o modelos específicos para móviles. Se recomienda consultar el paper original para obtener métricas detalladas.

## Limitaciones y advertencias

- Resolución fija: el modelo solo acepta imágenes de 512x512 píxeles. No se puede cambiar la resolución sin reentrenar o ajustar los parámetros de posición.
- Sin cuantización de menor precisión: solo se ofrecen fp16 y fp32, lo que puede limitar su uso en dispositivos con poca memoria o sin soporte para estas precisiones.
- Dependencia del bucle DDIM en JavaScript: el rendimiento puede verse afectado por la sobrecarga de comunicación entre JavaScript y el motor nativo, especialmente en dispositivos de gama baja.
- Especialización: el modelo está diseñado exclusivamente para inpainting; no es un modelo generalista de generación de imágenes ni de texto.
- Riesgo de alucinación visual: como cualquier modelo generativo, puede producir artefactos o contenido no realista en las regiones rellenadas, especialmente con máscaras grandes o escenas complejas.
- Licencia Apache 2.0: permite uso comercial, pero se debe atribuir correctamente a los autores originales (HUST y VIVO AI Lab) y al proyecto react-native-executorch.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nklockiewicz/react-native-executorch-demo-models
- Proyecto react-native-executorch (GitHub): https://github.com/software-mansion/react-native-executorch
- Documentación de react-native-executorch: https://docs.swmansion.com/react-native-executorch/
- Aplicación de demostración magic-eraser: https://github.com/nklockiewicz/magic-eraser
- Paper de Moebius (referencia en la model card): Duan et al., ECCV 2026, "Moebius: 0.2B Lightweight Image Inpainting Framework with 10B-Level Performance"

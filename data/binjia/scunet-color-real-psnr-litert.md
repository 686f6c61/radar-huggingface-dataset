# Binjia/scunet-color-real-psnr-litert

## Resumen

SCUNet color real_psnr (LiteRT / TFLite) es una conversión del modelo de denoising ciego de imágenes en color SCUNet, originalmente publicado por Kai Zhang y colaboradores (cszn/SCUNet, KAIR v1.0, Apache-2.0), a formato LiteRT/TFLite para inferencia en dispositivo. El modelo resuelve la eliminación de ruido en imágenes reales sin conocer el modelo de ruido (blind denoising), tomando una imagen sRGB de entrada y devolviendo una versión limpia de la misma.

La relevancia de esta ficha es que se trata de un artefacto de despliegue: un único fichero TFLite de 47.200.352 bytes (~45 MiB) con pesos en FP16 y activaciones FP32, pensado para ejecutarse en móviles, navegadores o edge devices mediante el runtime LiteRT. La arquitectura subyacente es Swin-Conv-UNet (SCUNet), una red híbrida que combina bloques convolucionales y atención de ventana desplazada tipo Swin Transformer.

El repositorio no incluye model card extensa, benchmarks propios ni información sobre idiomas (es un modelo de imagen, no de texto). El autor reporta equivalencia numérica con PyTorch (diferencia FP32 ~1e-6 y mínimo 75 dB PSNR frente a PyTorch en 54 teselas de test), lo que permite confiar en la fidelidad de la conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin-Conv-UNet (SCUNet): UNet con bloques conv-transformer y atención de ventana desplazada |
| Parámetros totales | no disponible (pesos en FP16, fichero de ~45 MiB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 256 x 256 píxeles por tesela |
| Tipos de cuantización | Pesos FP16 con DEQUANTIZE (pesos de TRANSPOSE_CONV en FP32); activaciones FP32 |
| Idiomas soportados | no aplica (modelo de imagen); no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite / LiteRT (`.tflite`) |

## Arquitectura y entrenamiento

SCUNet es una red Swin-Conv-UNet que combina un encoder-decoder tipo UNet con bloques que mezclan convoluciones y atención de ventana desplazada (shifted-window attention) inspirada en Swin Transformer. La atención se aplica sobre ventanas locales y la máscara de ventana desplazada está precalculada para el tamaño de tesela de 256 x 256, lo que implica que la red no tiene operaciones globales y debe ejecutarse por teselas solapadas.

El modelo original se entrenó con síntesis de datos de ruido (data synthesis) para denoising ciego de imágenes reales, según el paper "Practical Blind Image Denoising via Swin-Conv-UNet and Data Synthesis" (Zhang et al., 2023). La conversión a TFLite reescribe operaciones para que sean compatibles con el runtime: partición/merge de ventanas con tensores de rango ≤ 4, q/k/v como lineales separadas con la escala de atención plegada en q, bias de posición relativa y máscara de ventana desplazada como constantes aditivas precalculadas (-1e4 en lugar de -inf), shift cíclico como slices + concat, y LayerNorm evaluada sobre x/8 (eps/64) para mantener la varianza en rango FP16. El coste computacional es de aproximadamente 77 GMACs por tesela de 256 x 256.

## Capacidades

- Denoising ciego de imágenes en color reales: elimina ruido desconocido sin estimación explícita del modelo de ruido.
- Entrada y salida en espacio sRGB, float32 NHWC `[1, 256, 256, 3]` en rango [0, 1]; la salida puede exceder ligeramente el rango y debe recortarse (clamp).
- Procesamiento por teselas solapadas de 256 x 256 píxeles; no admite resolución arbitraria en una sola pasada.
- Inferencia en dispositivo mediante LiteRT/TFLite, con soporte de precisión FP16 en GPU (simulado frente a FP32 ≥ 69,7 dB).
- No soporta tool calling, agentes, texto, visión semántica, audio ni capacidades multilingües: es un modelo puramente image-to-image.
- No dispone de modo thinking ni razonamiento de múltiples pasos.

## Casos de uso

- Limpieza de fotos en aplicaciones móviles: el modelo cabe en ~45 MiB y se ejecuta vía LiteRT, por lo que puede integrarse en apps Android/iOS para reducir ruido de fotos tomadas con poca luz antes de mostrarlas o subirlas.
- Preprocesado en pipelines de visión por computador: aplicar denoising a imágenes de entrada antes de tareas de detección, segmentación u OCR mejora la robustez frente a ruido de sensor o compresión.
- Procesado en navegador con WebAssembly/WebGPU: al ser un artefacto TFLite, puede desplegarse en el cliente sin enviar imágenes a un servidor, útil por privacidad.
- Restauración de imágenes escaneadas o antiguas: reducción de ruido granular en digitalizaciones antes de archivado o impresión.
- Edge computing en cámaras y dispositivos IoT: inferencia local por teselas de 256 x 256 con ~77 GMACs por tesela, adecuada para hardware con NPU o GPU integrada.
- Automatización de lotes de imágenes en servidores modestos: al ser un modelo pequeño (~45 MiB), permite procesar lotes en CPU/GPU de gama baja con teselado solapado.
- Integración en cadenas de superresolución o restauración: como etapa previa de denoising antes de modelos de upscaling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de fidelidad de la conversión:

| Métrica de conversión | Valor reportado |
|---|---|
| Diferencia FP32 frente a PyTorch | ~1e-6 |
| PSNR TFLite (pesos FP16) vs PyTorch | mínimo 75 dB sobre 54 teselas de test |
| Simulación FP16 vs FP32 en GPU | ≥ 69,7 dB |
| Coste computacional | ~77 GMACs por tesela 256 x 256 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero ocupa ~45 MiB y las activaciones son FP32 para una tesela de 256 x 256, por lo que el consumo es bajo (del orden de cientos de MiB incluyendo buffers).
- GPU recomendadas: no disponible; al ser un modelo LiteRT, el objetivo son GPUs integradas, NPUs móviles y aceleradores edge más que GPUs de datacenter.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con soporte LiteRT/GPU delegate; no se especifican modelos concretos.
- Opciones de despliegue: runtime LiteRT/TFLite (incluido GPU delegate), con posibilidad de ejecución en Android, iOS, Linux y navegador según el runtime.
- Latencia y throughput: no disponibles; dependen del hardware y del número de teselas solapadas por imagen.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SCUNet color real_psnr (LiteRT) | Swin-Conv-UNet | 256 x 256 teselas | Apache-2.0 | TFLite | Conversión on-device, ~45 MiB |
| SCUNet original (PyTorch) | Swin-Conv-UNet | resolución variable | Apache-2.0 | `.pth` | Referencia de entrenamiento, requiere PyTorch |
| Alternativas de denoising ciego (p. ej. Restormer, DnCNN) | transformer / CNN | variable | según modelo | varios | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo con alternativas en la información disponible.

## Limitaciones y advertencias

- Modelo puramente de imagen: no procesa texto, audio ni tareas multimodales; no debe evaluarse con métricas de lenguaje.
- Entrada fija de 256 x 256: imágenes mayores requieren teselado solapado manual; un teselado incorrecto puede producir costuras visibles.
- La salida puede exceder el rango [0, 1]; es necesario aplicar clamp para evitar artefactos.
- La máscara de atención está precalculada para 256 x 256; no es posible cambiar el tamaño de tesela sin reconvertir el modelo.
- Riesgo de sobre-suavizado en imágenes con texturas finas o detalles de alta frecuencia, inherente al denoising ciego.
- No se reportan sesgos específicos, pero al ser un modelo entrenado con datos sintéticos de ruido puede generalizar peor a ruidos muy distintos de los simulados.
- Licencia Apache-2.0: permite uso comercial con atribución y sin garantías; debe conservarse el aviso de licencia y la cita del paper original.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- El autor no documenta límites de resolución, memoria ni latencia en dispositivos concretos.

## Enlaces

- Hugging Face: https://huggingface.co/Binjia/scunet-color-real-psnr-litert
- Repositorio original SCUNet: https://github.com/cszn/SCUNet
- Release KAIR v1.0 (pesos `scunet_color_real_psnr.pth`): https://github.com/cszn/KAIR/releases/tag/v1.0
- Paper: Zhang et al., "Practical Blind Image Denoising via Swin-Conv-UNet and Data Synthesis", Machine Intelligence Research, 2023, doi:10.1007/s11633-023-1466-0

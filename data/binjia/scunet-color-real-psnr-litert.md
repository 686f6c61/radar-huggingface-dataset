# Binjia/scunet-color-real-psnr-litert

## Resumen

SCUNet color real_psnr (LiteRT / TFLite) es una conversión del modelo de eliminación de ruido en imágenes reales SCUNet, originalmente desarrollado por Kai Zhang et al. (cszn) y publicado en el repositorio KAIR v1.0 bajo licencia Apache-2.0. Esta versión, publicada por el usuario Binjia, convierte los pesos PyTorch (`scunet_color_real_psnr.pth`) a formato LiteRT/TFLite para su ejecución en dispositivos, con un fichero de 47.200.352 bytes (aproximadamente 45 MB) y un tamaño total de repositorio de 0,1 GB.

El modelo resuelve el problema del denoising ciego de imágenes reales, es decir, la eliminación de ruido sin conocer de antemano el modelo de degradación. La arquitectura subyacente es Swin-Conv-UNet, una red que combina bloques convolucionales con mecanismos de atención de ventana desplazada (shifted-window attention) en una estructura tipo UNet. La conversión mantiene la equivalencia numérica con PyTorch (diferencia FP32 de aproximadamente 1e-6) y está pensada para inferencia en dispositivo con pesos almacenados en FP16 y activaciones en FP32.

La relevancia de esta ficha radica en que permite desplegar un modelo de restauración de imagen de calidad de investigación en entornos móviles o embebidos mediante LiteRT, sin necesidad de infraestructura GPU de servidor. El modelo procesa mosaicos de 256 x 256 píxeles en sRGB y requiere un pipeline de teselado con solapamiento, ya que la red no tiene operaciones globales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin-Conv-UNet (SCUNet), transformer convolucional con atención de ventana desplazada |
| Parametros totales | no disponible (fichero TFLite de 47.200.352 bytes, ~45 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada fija de 256 x 256 píxeles) |
| Tipos de cuantizacion | Pesos FP16 con DEQUANTIZE (pesos de TRANSPOSE_CONV en FP32); activaciones FP32 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite / LiteRT (`.tflite`) |

## Arquitectura y entrenamiento

SCUNet es una red Swin-Conv-UNet que combina bloques convolucionales con bloques transformer de atención de ventana desplazada dentro de una estructura UNet. El modelo original está descrito en el artículo "Practical Blind Image Denoising via Swin-Conv-UNet and Data Synthesis" (Zhang et al., *Machine Intelligence Research*, 2023). La variante `scunet_color_real_psnr` está entrenada para denoising ciego de imágenes en color reales, optimizando PSNR, y se distribuye en el release KAIR v1.0.

La conversión a LiteRT introduce varias reescrituras equivalentes para hacer viable la ejecución en TFLite: partición y fusión de ventanas con tensores de rango menor o igual a 4; q/k/v como capas lineales separadas con la escala de atención plegada en q; sesgo de posición relativa y máscara de ventana desplazada como constantes aditivas precalculadas (con -1e4 en lugar de -inf); desplazamiento cíclico como slices más concatenación; y LayerNorm evaluada sobre x/8 (con eps/64) para mantener la varianza en rango FP16. La diferencia FP32 respecto a PyTorch es de aproximadamente 1e-6, y con pesos FP16 la PSNR mínima frente a PyTorch es de 75 dB sobre 54 mosaicos de prueba.

No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre la composición del dataset en la información proporcionada, más allá de la referencia al artículo original.

## Capacidades

- Eliminación de ruido ciego en imágenes en color reales (denoising sin conocer el modelo de degradación).
- Entrada y salida en sRGB normalizado a [0, 1], con entrada float32 NHWC de forma [1, 256, 256, 3].
- Procesamiento por mosaicos de 256 x 256 píxeles con solapamiento; la red no tiene operaciones globales y la máscara de atención está construida para ese tamaño de mosaico.
- Inferencia en dispositivo mediante LiteRT/TFLite, con pesos en FP16 y activaciones en FP32.
- Coste computacional de aproximadamente 77 GMACs por mosaico de 256 x 256.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la restauración de imagen.

## Casos de uso

- Restauración de fotos en aplicaciones móviles: el modelo puede integrarse en apps Android o iOS mediante LiteRT para limpiar ruido de fotos tomadas con sensores pequeños, procesando la imagen por mosaicos de 256 x 256 con solapamiento.
- Preprocesado en pipelines de visión por computador: reducir ruido antes de tareas de detección, segmentación o reconocimiento evita que el ruido degrade las características extraídas, y el coste de 77 GMACs por mosaico es asumible en GPUs móviles.
- Limpieza de imágenes médicas o de inspección: en escenarios con iluminación pobre o sensores de bajo coste, el denoising ciego ayuda a mejorar la relación señal-ruido antes del análisis, siempre que se valide el dominio concreto.
- Procesado en el borde (edge computing): al ser un modelo TFLite de ~45 MB, puede desplegarse en dispositivos con recursos limitados sin enviar imágenes a la nube, reduciendo latencia y preservando privacidad.
- Restauración de imágenes antiguas o escaneadas: el modelo puede atenuar ruido de digitalización y sensores, aunque no está especializado en eliminación de artefactos de compresión ni en superresolución.
- Prototipado rápido de restauración de imagen: gracias a la licencia Apache-2.0 y al formato TFLite, es adecuado para experimentar en notebooks, Raspberry Pi o dispositivos con aceleradores LiteRT antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de fidelidad de la conversión: diferencia FP32 frente a PyTorch de aproximadamente 1e-6, PSNR mínima de 75 dB con pesos FP16 frente a PyTorch sobre 54 mosaicos de prueba, y PSNR de al menos 69,7 dB en simulación FP16 frente a FP32 en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero TFLite ocupa unos 45 MB, por lo que la huella de pesos es reducida, pero las activaciones FP32 para mosaicos de 256 x 256 añaden consumo adicional no cuantificado en la información.
- GPU recomendadas: no disponible; al ser LiteRT/TFLite, el objetivo son aceleradores móviles, GPU integradas y CPU, no GPU de servidor.
- Compatibilidad con GPU de consumo: no disponible; el modelo está pensado para despliegue en dispositivo, no para A100, H100 o RTX 4090.
- Opciones de despliegue: LiteRT / TensorFlow Lite (formato nativo); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el coste computacional es de aproximadamente 77 GMACs por mosaico de 256 x 256, lo que permite estimar el rendimiento según el acelerador concreto, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Formato | Licencia | Contexto / ambito |
|---|---|---|---|---|---|
| SCUNet color real_psnr (LiteRT) | Swin-Conv-UNet | 256 x 256 x 3 | TFLite | Apache-2.0 | Denoising ciego color |
| SCUNet original (PyTorch) | Swin-Conv-UNet | variable (por mosaicos) | PyTorch `.pth` | Apache-2.0 | Denoising ciego color |
| Otras variantes SCUNet (gris, color, PSNR/SSIM) | Swin-Conv-UNet | variable | PyTorch / TFLite | Apache-2.0 | Denoising ciego |

No se dispone de datos de rendimiento comparativo con alternativas como DnCNN, Restormer o SwinIR en la información proporcionada, por lo que la comparación cuantitativa se limita a la equivalencia numérica con el modelo PyTorch original.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para denoising ciego de imágenes en color; no realiza superresolución, eliminación de artefactos de compresión, desenfoque ni otras tareas de restauración.
- La entrada está fija a mosaicos de 256 x 256 píxeles; es obligatorio procesar imágenes mayores con solapamiento, y la máscara de atención está construida para ese tamaño, por lo que no se puede cambiar sin recompilar o reconvertir.
- La salida puede exceder ligeramente el rango [0, 1], por lo que es necesario aplicar un clamp antes de guardar o visualizar.
- No se han publicado datos sobre sesgos, riesgo de alucinación (no aplica en el sentido de modelos generativos de texto, pero sí puede introducir artefactos o texturas inventadas en zonas muy degradadas) ni sobre comportamiento en dominios distintos al de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo original y del artículo asociado, así como citar el trabajo de Zhang et al. (2023).
- Al ser una conversión, cualquier cambio en el pipeline de teselado o en el rango de entrada puede degradar la calidad; la model card no documenta validación fuera de los 54 mosaicos de prueba.
- No se dispone de información sobre idiomas (no aplica) ni sobre latencia medida en hardware concreto, lo que dificulta estimar el rendimiento en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Binjia/scunet-color-real-psnr-litert
- Repositorio original SCUNet: https://github.com/cszn/SCUNet
- Release KAIR v1.0 (pesos originales): https://github.com/cszn/KAIR/releases/tag/v1.0
- Artículo: Zhang, K., Li, Y., Liang, J., Cao, J., Zhang, Y., Tang, H., Fan, D.-P., Timofte, R., Van Gool, L. "Practical Blind Image Denoising via Swin-Conv-UNet and Data Synthesis", *Machine Intelligence Research*, 20(6), 822–836, 2023. DOI: 10.1007/s11633-023-1466-0
- LiteRT (documentación): no disponible en la información proporcionada.

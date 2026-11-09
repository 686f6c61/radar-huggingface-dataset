# Binjia/nafnet-sidd-width32-litert

## Resumen

NAFNet-SIDD-width32 (LiteRT/TFLite, bounded) es una conversión del modelo de eliminación de ruido en imágenes reales NAFNet-SIDD-width32, desarrollado originalmente por el grupo de investigación Megvii (repositorio megvii-research/NAFNet) y publicado en el artículo "Simple Baselines for Image Restoration" (arXiv:2204.04676). El autor de esta conversión, Binjia, lo ha empaquetado como un modelo LiteRT/TFLite de 61,78 MB orientado a inferencia en dispositivo, con pesos almacenados en FP16 y activaciones en FP32.

El modelo resuelve la tarea de denoising de imágenes reales (eliminación de ruido de sensores, especialmente en condiciones de poca luz, sobre el conjunto de datos SIDD). La arquitectura subyacente es NAFNet, una red de restauración de imágenes basada en bloques sin funciones de activación no lineales convencionales (usa SimpleGate y atención de canal simplificada). Esta versión concreta tiene un ancho de 32 canales y procesa parches de 256×256 píxeles.

La relevancia de esta ficha reside en que no es un modelo de lenguaje, sino un modelo de visión image-to-image pensado para ejecutarse en dispositivos con recursos limitados (móviles, edge). La conversión introduce una innovación técnica destacable: el acotado (clamping) por canal de todas las activaciones y de los coeficientes de atención de canal, para corregir la divergencia numérica que el modelo original en FP32 presenta en entradas oscuras con poco ruido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NAFNet (restauración de imágenes, bloques SimpleGate y atención de canal simplificada) |
| Parametros totales | no disponible (pesos en FP16, fichero de 61.780.512 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 256×256 píxeles) |
| Tipos de cuantizacion | Pesos FP16 con DEQUANTIZE; activaciones FP32; no se documentan otros formatos |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | TFLite / LiteRT (`nafnet_sidd_w32.tflite`) |

## Arquitectura y entrenamiento

NAFNet (Nonlinear Activation Free Network) es una arquitectura de restauración de imágenes que elimina las funciones de activación no lineales tradicionales (ReLU, GELU) en favor de SimpleGate (producto elemento a elemento de dos mitades del tensor) y una atención de canal simplificada. El modelo original se entrena sobre el dataset SIDD para denoising de imágenes reales. La información disponible no detalla el número de tokens, la composición exacta del dataset de entrenamiento ni si se emplearon técnicas de RLHF o DPO, ya que no es un modelo generativo de texto.

La conversión a LiteRT/TFLite introduce tres cambios técnicos respecto al modelo original en FP32: (1) acotado por canal de todas las activaciones a sus mínimos y máximos calibrados (con un margen del 10 %), medidos sobre fotos reales con y sin ruido Poisson-Gaussiano; (2) acotado de los coeficientes de atención de canal al cuantil 0,995 de sus valores por parche; (3) reescrituras equivalentes en FP32 (LayerNorm sobre entrada pre-escalada a potencia de dos para mantener la varianza en rango FP16, fusión del split de SimpleGate en las convoluciones productoras, y reescritura de conv 1×1 + PixelShuffle como convolución transpuesta stride-2 de 2×2). El modelo usa operaciones CONV_2D, DEPTHWISE_CONV_2D, TRANSPOSE_CONV, elementwise, MEAN, RSQRT y RESHAPE (rango ≤ 4, sin TRANSPOSE). El SHA-256 del fichero es `3722dc58227ee81587fa3d988b526b38594056fbf413c37f6b1bbbb9036d8415`.

## Capacidades

- Eliminación de ruido de imágenes reales (denoising) sobre imágenes sRGB en formato float32 NHWC `[1, 256, 256, 3]`, con valores en [0, 1].
- Procesamiento por parches de 256×256 píxeles con solapamiento y mezcla (blending) de teselas; la atención de canal agrupa sobre toda la tesela y los límites de activación están calibrados para ese tamaño.
- Salida float32 NHWC `[1, 256, 256, 3]` en [0, 1], que puede exceder ligeramente el rango y requiere recorte (clamp).
- Inferencia en dispositivo (on-device) mediante LiteRT/TFLite, orientada a moviles y edge.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión image-to-image.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá del denoising.

## Casos de uso

- Limpieza de fotos nocturnas en aplicaciones móviles: el modelo procesa la imagen por teselas de 256×256 y devuelve una versión sin ruido de sensor, adecuado para integrarse en apps de cámara o galería que necesitan ejecución local sin conexión.
- Preprocesado en pipelines de visión por computador: eliminar ruido antes de tareas de detección, segmentación o reconocimiento reduce falsos positivos en imágenes de baja luminosidad; el modelo es ligero (61,78 MB) y apto para edge.
- Procesamiento de imágenes médicas o de inspección industrial con ruido de sensor: al ser un denoiser genérico entrenado en SIDD, puede usarse como paso previo en flujos donde la calidad de la imagen de entrada es crítica.
- Aplicaciones de fotografía computacional en dispositivos con recursos limitados: el formato TFLite/LiteRT permite desplegar en Android, iOS o microcontroladores con aceleración por delegados, sin necesidad de GPU de servidor.
- Restauración de imágenes de archivo o digitalizaciones con ruido: el modelo puede aplicarse por teselas a escaneos o fotos antiguas para reducir grano y ruido de compresión.
- Integración en herramientas de edición de imagen de escritorio o web: al ser un modelo de 61 MB con licencia MIT, puede incrustarse en editores que necesiten un paso de denoising rápido y local.
- Investigación en restauración de imágenes: sirve como referencia reproducible de NAFNet convertido a TFLite para comparar latencia y precisión frente a implementaciones PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente una medida offline: en contenido normal, la salida está dentro de ≤0,1 dB de PSNR respecto a la red original en cuatro niveles de ruido, y las teselas divergentes (por ejemplo, negro puro, donde la salida original era [-1,09, 0,75]) producen salidas válidas ([-0,023, 0,017]).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero de pesos ocupa 61,78 MB y las activaciones son FP32 para teselas de 256×256, por lo que el consumo es moderado y apto para memoria unificada en móviles.
- GPU recomendadas: no se especifican; al ser un modelo LiteRT/TFLite, está pensado para aceleradores en dispositivo (GPU móvil, NPU, DSP) mediante delegados de LiteRT.
- ¿Cabe en GPU consumer? Sí, con toda probabilidad, dado el tamaño del modelo (61,78 MB) y la entrada de 256×256; no se documentan requisitos mínimos concretos.
- Opciones de despliegue: LiteRT/TFLite (librería declarada), con delegados de GPU/NPU según plataforma; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión TFLite).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| NAFNet-SIDD-width32 (LiteRT, este) | Denoising image-to-image | no disponible (61,78 MB en FP16) | 256×256×3 float32 | MIT | TFLite/LiteRT | Acotado por canal, apto on-device |
| NAFNet-SIDD-width32 original (Megvii) | Denoising image-to-image | no disponible | variable | MIT | PyTorch (.pth) | Referencia FP32; diverge en entradas oscuras de bajo ruido |
| Alternativas de denoising on-device | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo original en FP32 diverge en entradas oscuras con poco ruido (negro, gris oscuro plano, sombras aplastadas), produciendo bloques de rejilla coloreados; esta conversión lo corrige mediante acotado, pero el comportamiento en casos extremos debe validarse.
- La salida puede exceder ligeramente el rango [0, 1] y requiere recorte (clamp) antes de su uso.
- El modelo está calibrado para teselas de 256×256; procesar imágenes completas sin teselar o con otro tamaño puede degradar la calidad o romper los límites de activación.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni capacidades multilingües.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí puede introducir artefactos o suavizado excesivo en imágenes con contenido de alto detalle.
- Licencia MIT: permite uso comercial, pero se recomienda conservar la atribución al autor original (Megvii) y al conversor (Binjia), y citar el artículo arXiv:2204.04676.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-09; no hay evidencia de validación comunitaria ni de mantenimiento continuo.
- No se documentan sesgos demográficos ni de otro tipo, pero al ser un modelo entrenado en SIDD, su rendimiento puede degradarse en dominios de imagen distintos (médico, satelital, etc.).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Binjia/nafnet-sidd-width32-litert
- Repositorio original NAFNet (Megvii): https://github.com/megvii-research/NAFNet
- Artículo "Simple Baselines for Image Restoration": https://arxiv.org/abs/2204.04676
- LiteRT (documentación): https://ai.google.dev/edge/litert
- TensorFlow Lite (documentación): https://www.tensorflow.org/lite

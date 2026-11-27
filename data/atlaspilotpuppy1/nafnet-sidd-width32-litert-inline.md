# AtlasPilotPuppy1/NAFNet-SIDD-width32-litert-inline

## Resumen

NAFNet-SIDD-width32-litert-inline es una reempaquetado del modelo NAFNet (Nonlinear Activation Free Network) de Megvii Research, especializado en eliminación de ruido en imágenes (denoising). La versión original fue convertida a formato LiteRT/TFLite por la comunidad litert-community, y este repositorio de AtlasPilotPuppy1 resuelve un problema concreto de compatibilidad: el fichero original mantiene 477 buffers de pesos fuera del flatbuffer, lo que impide su carga en el runtime TensorFlow Lite 2.17 de iOS. Esta copia incrusta todos los pesos dentro del flatbuffer sin modificar la arquitectura ni los pesos.

El modelo trabaja sobre parches de 256x256 píxeles en formato NCHW, con entrada RGB normalizada en [0, 1] y salida del mismo tamaño. Está pensado para ejecución en dispositivo (on-device), especialmente en iPhone, gracias a su tamaño compacto de aproximadamente 62 MB en fp16. La licencia es MIT, lo que permite uso comercial sin restricciones significativas.

Es relevante para desarrolladores que necesiten denoising de imágenes en aplicaciones móviles iOS sin depender de la nube, aprovechando el runtime LiteRT. No es un modelo de lenguaje ni un modelo multimodal: es una red convolucional específica para restauración de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NAFNet (Nonlinear Activation Free Network), red convolucional para restauración de imagen |
| Parametros totales | no disponible (ancho 32; el fichero fp16 pesa 62.448.376 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 1x3x256x256) |
| Tipos de cuantizacion | fp16 (fichero `nafnet_sidd_width32_fp16_inline.tflite`) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | TFLite / LiteRT (flatbuffer con pesos incrustados) |

## Arquitectura y entrenamiento

NAFNet es una arquitectura presentada en ECCV 2022 por Megvii Research que elimina las funciones de activación no lineales (ReLU, GELU, etc.) del bloque de restauración, sustituyéndolas por operaciones simples de multiplicación y puertas (gating) con normalización. Esta simplificación reduce el coste computacional manteniendo la capacidad de modelado, lo que la hace adecuada para despliegue en dispositivo. La variante SIDD está entrenada sobre el dataset SIDD (Smartphone Image Denoising Dataset), orientado a ruido real de sensores de smartphone.

El repositorio no aporta detalles sobre el número exacto de tokens de entrenamiento, composición del dataset ni si se empleó RLHF/DPO (no aplica en un modelo de visión). La innovación técnica relevante de esta copia concreta no está en el entrenamiento, sino en el empaquetado: se mueven los 477 buffers de pesos del fichero original dentro del flatbuffer para que el runtime TFLite C de iOS pueda cargarlo. Según la model card, bajo LiteRT ambos ficheros producen salidas idénticas; la diferencia es exclusivamente de compatibilidad con el runtime de iOS.

## Capacidades

- Eliminación de ruido en imágenes RGB de 256x256 píxeles (denoising sobre ruido real de smartphone, dataset SIDD).
- Entrada y salida en formato NCHW con valores en [0, 1].
- Ejecución on-device en iOS mediante el runtime TensorFlow Lite 2.17 (y en LiteRT en otras plataformas).
- Modelo image-to-image de propósito específico: no genera texto, no razona, no hace tool calling.
- No soporta agentes, multi-step reasoning ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá del denoising.

## Casos de uso

- Limpieza de fotos en aplicaciones iOS de cámara: integrar el modelo en el pipeline de captura para reducir ruido de sensor antes de guardar la imagen, aprovechando que el fichero carga en el runtime TFLite 2.17 de iOS.
- Preprocesado en apps de edición fotográfica móvil: aplicar denoising como paso previo a filtros o mejoras de contraste, procesando la imagen por parches de 256x256.
- Procesamiento por lotes en servidor con LiteRT: usar el mismo fichero en pipelines de Python o C++ con LiteRT para normalizar imágenes de entrada de un clasificador o detector aguas abajo.
- Reducción de ruido en imágenes de documentos escaneados con móvil: mejorar la legibilidad de capturas con poca luz antes de OCR, ya que el modelo está entrenado sobre ruido real de smartphone (SIDD).
- Prototipado de restauración de imagen en dispositivos con recursos limitados: el tamaño de 62 MB en fp16 permite incluirlo en el bundle de una app sin penalizar excesivamente la descarga.
- Evaluación comparativa de runtimes: sirve como caso de prueba para verificar que un mismo modelo produce salidas idénticas en LiteRT y en TFLite iOS tras el reempaquetado de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero fp16 ocupa 62,4 MB, por lo que la huella de memoria es reducida y apta para dispositivos móviles.
- GPU recomendadas: no se especifican; el modelo está orientado a ejecución en dispositivo (CPU/GPU/NPU móvil mediante LiteRT).
- Compatibilidad con GPU de consumo: no se detalla; por tamaño cabría en cualquier GPU de consumo moderna, pero no hay datos de rendimiento publicados.
- Opciones de despliegue: LiteRT (principal), TensorFlow Lite 2.17 en iOS (runtime C), y potencialmente otros runners compatibles con flatbuffers TFLite.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada | Licencia | Formato |
|---|---|---|---|---|---|
| NAFNet-SIDD-width32-litert-inline (este) | no disponible (62,4 MB fp16) | no aplica | 1x3x256x256 | MIT | TFLite con pesos incrustados |
| litert-community/NAFNet-SIDD-width32-LiteRT | no disponible | no aplica | 1x3x256x256 | MIT | TFLite con buffers externos |
| NAFNet original (Megvii) | no disponible | no aplica | variable | MIT | PyTorch |

La diferencia principal frente al modelo base de litert-community es el empaquetado de pesos, no la arquitectura ni los resultados. Frente al NAFNet original en PyTorch, esta versión está optimizada para inferencia móvil.

## Limitaciones y advertencias

- Modelo de propósito muy específico: solo hace denoising; no sirve para otras tareas de visión como segmentación, detección o superresolución.
- Entrada fija de 256x256: requiere trocear imágenes mayores en parches y recomponerlas, lo que puede introducir artefactos en los bordes si no se solapan los parches.
- Formato NCHW: algunos runtimes móviles prefieren NHWC; hay que verificar la compatibilidad del runtime concreto.
- Sin datos de benchmarks publicados: no se puede comparar su calidad de denoising con alternativas de forma cuantitativa a partir de esta ficha.
- Sin información sobre sesgos: al ser un modelo de imagen entrenado sobre SIDD, puede comportarse peor con ruido de otros dominios (ruido sintético, imágenes médicas, satelitales).
- Licencia MIT: permite uso comercial, pero se deben conservar los avisos de copyright de Megvii incluidos en el fichero LICENSE del proyecto original.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; conviene verificar el SHA-256 indicado en la model card antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/AtlasPilotPuppy1/NAFNet-SIDD-width32-litert-inline
- Modelo base: https://huggingface.co/litert-community/NAFNet-SIDD-width32-LiteRT/tree/59984b5234b24ccf2f324ce0ac49cd640b9d5b2c
- Repositorio NAFNet (Megvii Research): https://github.com/megvii-research/NAFNet

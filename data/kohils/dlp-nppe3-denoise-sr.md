# kohils/dlp-nppe3-denoise-sr

## Resumen

`kohils/dlp-nppe3-denoise-sr` es un modelo de restauración de imágenes desarrollado por kohils para abordar la tarea conjunta de **denoising y super-resolución x4** sobre imágenes de baja luz. El modelo toma una entrada RGB de 160x256 píxeles con ruido y genera una salida de luminancia de 640x1024 píxeles, optimizada directamente para la métrica PSNR de una competición de Kaggle (DLP Jan 2025 NPPE3).

La arquitectura es una **NAFNet-style U-Net** de baja resolución con una cabeza de pixel-shuffle x4, aproximadamente **25,7 millones de parámetros** y 4 niveles de downsampling. El proceso de degradación del conjunto de datos ha sido modelizado con precisión (ruido Poisson + ruido gaussiano, downsampling por área y truncación), lo que permite sintetizar pares de entrenamiento en tiempo real durante el entrenamiento en lugar de depender de un conjunto fijo de ejemplos.

El rendimiento del modelo supera claramente a los métodos clásicos de referencia (bicubic y filtrado no local NLM) en la métrica de evaluación de la competición, alcanzando **37.41 dB** en el conjunto de validación interna y **39.88 dB** en la tabla pública de Kaggle. Es una solución específica para restauración de imágenes de baja luz, con un código de entrenamiento e inferencia completo incluido en el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NAFNet-style U-Net con cabeza de pixel-shuffle x4, 4 niveles de downsampling |
| Parametros totales | ~25,7 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (procesamiento de imagen) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

El modelo es una **NAFNet-style U-Net** que opera a baja resolución (sobre la imagen de 160x256) y utiliza una cabeza de **pixel-shuffle x4** para producir la salida de 640x1024. La arquitectura incluye dos decisiones estructurales destacadas: una **conexión skip fija** basada en la imagen de referencia upsampleada con bicubic y una última capa convolucional inicializada a cero, de modo que el entrenamiento comienza exactamente en la solución bicubic (31.46 dB) y solo aprende el residual. Además, se incorporan **canales de entrada con transformada Anscombe generalizada**: `2*sqrt(y/g + 3/8 + rv/g^2)`, que tiene varianza casi unitaria en todos los niveles de brillo, convirtiendo el ruido Poisson heterocedástico en homocedástico.

El entrenamiento se realizó en **2x NVIDIA T4** con DDP y fp16 AMP, usando AdamW con lr 2e-4, programación coseno, warmup de 1000 pasos y EMA 0.9995. Se emplearon parches de 64x64 a baja resolución con un batch de 32 por GPU. Inicialmente se usa la pérdida de Charbonnier, que se cambia a **MSE** al 85% del progreso porque MSE es el sustituto directo del PSNR objetivo. El conjunto de datos consta de **1,242 escenas**, de las cuales el 80% se sintetiza en GPU en cada paso y el 20% son pares reales proporcionados.

El proceso de degradación fue recuperado de los datos con un error residual muy bajo (0.25% MSRE, 0.023 niveles de gris). Los detalles clave son: downsampling por **área** (media de caja de 4x4), cuantización por **truncación** (no redondeo) y ruido puramente de disparo (espacialmente blanco e independiente entre canales). Esta modelización exacta permite generar ejemplos de entrenamiento ilimitados con ruido fresco en cada iteración, en lugar de usar solo los 1,242 pares fijos.

## Capacidades

- Denoising de imágenes con ruido mixto Poisson-gaussiano, típico en condiciones de baja iluminación.
- Super-resolución x4, transformando imágenes de 160x256 en salidas de 640x1024.
- Predicción de un solo canal de luminancia, optimizada específicamente para la métrica PSNR de la competición (PIL `convert('L')` y muestreo cada 8ª columna).
- Generación de salida con desenfoque minimizado, gracias a la conexión residual que arranca desde la solución bicubic.
- Estabilización de la varianza del ruido mediante la transformada Anscombe generalizada, que permite al modelo tratar el ruido de manera uniforme en todos los niveles de brillo.
- Uso de autodescubrimiento del proceso de degradación, lo que permite entrenar con datos sintéticos generados en GPU.
- No soporta otras modalidades: no es multimodal, no genera texto, código ni audio, y no dispone de tool calling.

## Casos de uso

- **Fotografía de baja luz**: restaurar fotos nocturnas tomadas con sensores pequeños o móviles, reduciendo el ruido y aumentando la resolución para su visualización o impresión.
- **Vigilancia y seguridad**: mejorar vídeos o fotogramas de cámaras en condiciones de poca iluminación, lo que facilita la identificación de matrículas o rasgos faciales en imágenes de baja resolución.
- **Preprocesamiento para visión artificial**: aplicar el modelo como etapa previa a sistemas de detección de objetos o reconocimiento en entornos industriales o urbanos donde las cámaras capturan con alto ruido.
- **Microscopía científica**: restaurar imágenes de microscopía con bajo número de fotones (ruido Poisson dominante), mejorando la relación señal-ruido para análisis posteriores.
- **Restauración de imágenes históricas**: super-resolución y limpieza de escaneos antiguos o fotografías de archivo con degradaciones severas y baja resolución.
- **Investigación y competiciones de datos**: servir como modelo de referencia o punto de partida para problemas de denoising + super-resolución, gracias a su pipeline de entrenamiento reproducible y su modelización del proceso de degradación.

## Benchmarks y rendimiento

Los resultados presentados en la model card se basan en el PSNR calculado con la métrica exacta de la competición (conversión a luminancia en PIL y evaluación cada 8ª columna). Se muestran sobre un conjunto de validación de 130 escenas de entrenamiento no vistas y en la tabla pública de Kaggle.

| Metodo | Holdout (130 escenas) | Public LB |
|---|---|---|
| Bicubic upsample | 31.46 | 31.75 |
| NLM(h=6) + bicubic | 32.71 | 33.93 |
| NLM(h=10) + bicubic | 33.69 | 35.80 |
| **Este modelo** | **37.41** | **39.88** |

Además, se indica que un modelo idéntico entrenado con entrada libre de ruido alcanza **40.68 dB** en el mismo holdout, lo que sugiere que prácticamente todo el error restante proviene del proceso de denoising y no de la super-resolución. No se han publicado resultados de benchmarks con otros modelos de competición en la información disponible.

## Requisitos de hardware

- Entrenamiento documentado con **2x NVIDIA T4** en DDP, con fp16 AMP y batch de 32 por GPU.
- Inferencia: la cantidad exacta de VRAM no se especifica, pero el checkpoint tiene un tamaño de ~0.1 GB y la arquitectura 25.7M de parámetros, por lo que es razonable esperar que una imagen de 160x256 quepa en **GPU con 2 GB de VRAM** o menos.
- GPU recomendadas: cualquier GPU con CUDA (T4, RTX 3060, A100, etc.). El modelo también puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: código PyTorch incluido en `src/`, con una función de inferencia de ejemplo. No se mencionan soportes para vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La comparativa se establece frente a los métodos clásicos de referencia utilizados en la competición, ya que no se han encontrado datos de otros modelos neuronales de la misma categoría en la información disponible.

| Modelo | Parametros | Tarea | PSNR holdout | Licencia |
|---|---|---|---|---|
| Bicubic upsample | 0 | Upsample x4 | 31.46 | - |
| NLM(h=10) + bicubic | 0 | Denoising + upsample | 33.69 | - |
| **DLP 26T2 NPPE3 (este modelo)** | ~25.7M | Denoising + SR x4 | 37.41 | MIT |

El modelo supera en más de 3.7 dB al mejor método clásico presentado. No se ha localizado información sobre otros modelos neuronales similares en la búsqueda web, por lo que no se incluyen más comparaciones.

## Limitaciones y advertencias

- El modelo predice **únicamente un canal de luminancia**, no color. Cualquier uso que requiera salida RGB completa no está cubierto y necesitaría un postprocesado adicional.
- El rendimiento está optimizado para un **proceso de degradación específico** (Poisson con ganancia ~2.492, varianza de ruido de lectura ~3.10, downsampling por área y truncación). Si el ruido de entrada difiere en carácter o intensidad, el modelo puede no generalizar bien.
- La evaluación se realiza con un submuestreo de **cada 8ª columna** y en espacio de luminancia. El modelo podría explotar esta estructura, por lo que su comportamiento en evaluaciones convencionales de imagen completa puede variar.
- Al ser un modelo generativo de restauración, puede **alucinar detalles de alta frecuencia** que no estaban presentes en la imagen original, especialmente en regiones con muy baja señal.
- No se proporcionan datos sobre sesgos demográficos o de contenido, pero al estar entrenado en un conjunto de datos específico de la competición, pueden existir sesgos hacia ese dominio.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías ni soporte formal.
- El repositorio incluye el código de entrenamiento, pero no hay especificación de cuantización, lo que limita la integración en entornos optimizados (ONNX, TensorRT, etc.) sin adaptación.

## Enlaces

- Modelo original en HuggingFace: [https://huggingface.co/kohils/dlp-nppe3-denoise-sr](https://huggingface.co/kohils/dlp-nppe3-denoise-sr)
- Repositorio relacionado de la competición en GitHub: [https://github.com/AbdulAhadRauf/Denoising-4-Super-Resolution-of-Low-Light-Images](https://github.com/AbdulAhadRauf/Denoising-4-Super-Resolution-of-Low-Light-Images)
- Espejo en HuggingFace: [https://huggingface.co/HUGGINGFACENOOB123/dlp-nppe3-denoise-sr](https://huggingface.co/HUGGINGFACENOOB123/dlp-nppe3-denoise-sr)

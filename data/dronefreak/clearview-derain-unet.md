# dronefreak/clearview-derain-unet

## Resumen

ClearView es un modelo de eliminación de lluvia en imágenes individuales (*single-image deraining*) desarrollado por dronefreak. Se basa en una arquitectura UNet encoder-decoder clásica con 21,5 millones de parámetros, entrenado sobre una mezcla de datos sintéticos y reales para mejorar la generalización entre dominios. El modelo resuelve el problema de restaurar imágenes degradadas por lluvia, un paso crítico en sistemas de conducción autónoma, vigilancia y fotografía computacional.

Su relevancia radica en el enfoque de dominio mixto: en lugar de optimizar para un único benchmark sintético, selecciona los checkpoints mediante una métrica de validación combinada que incluye datos reales, lo que permite un rendimiento más consistente en escenarios del mundo real. El modelo está disponible bajo licencia Apache 2.0 y se distribuye como pesos PyTorch en formato `.pth`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet encoder-decoder (vanilla) |
| Parametros totales | 21,5 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (solo pesos en FP32) |
| Idiomas soportados | no aplica (procesamiento de imagenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura UNet encoder-decoder convencional, sin mecanismos de atención ni componentes híbridos. Esta elección prioriza la simplicidad y la eficiencia computacional, manteniendo un número de parámetros reducido (21,5 M) que facilita su despliegue en entornos con recursos limitados.

El entrenamiento combina cinco conjuntos de datos: Rain13K (13 711 pares), DDN-Data/Rain1400 (12 600), SPA-Data (6 385), RealRain-1k-H (784) y RealRain-1k-L (784). Las fuentes reales se sobremuestrean con un factor de 2, resultando en una mezcla efectiva de aproximadamente 62 % sintético y 38 % real. La selección del checkpoint final se realiza sobre un conjunto de validación mixto que incluye SPA-Data (limitado a 150 pares), RealRain-1k-H/L y Rain100L como ancla sintética, evitando que un único dataset domine la elección.

## Capacidades

- Eliminación de lluvia en imágenes individuales, tanto en dominios sintéticos como reales.
- Restauración de detalles de alta frecuencia (bordes, texturas) mediante la reducción de artefactos de lluvia.
- Manejo de diferentes intensidades de lluvia (ligera y fuerte) gracias a la inclusión de RealRain-1k-H y -L.
- Procesamiento de imágenes a resolución completa sin necesidad de recorte previo.
- No incluye soporte para *tool calling*, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.
- No es multimodal: únicamente entrada y salida de imágenes.

## Casos de uso

- Conducción autónoma: limpieza de imágenes de cámaras a bordo para mejorar la detección de objetos, carriles y peatones en condiciones de lluvia. El modelo puede integrarse en pipelines de percepción en tiempo real gracias a su bajo coste computacional.
- Vigilancia y seguridad: restauración de vídeo procedente de cámaras fijas o móviles en exteriores durante tormentas, facilitando el reconocimiento de matrículas, rostros o actividades.
- Fotografía y postproducción: eliminación de lluvia en fotografías personales o profesionales, mejorando la calidad visual sin intervención manual.
- Preprocesamiento para otros sistemas de visión: uso como etapa previa a algoritmos de segmentación, detección de objetos o estimación de profundidad, que suelen degradarse con entradas ruidosas.
- Sistemas de asistencia al conductor (ADAS): mejora de imágenes de cámaras laterales o traseras en vehículos para aumentar la fiabilidad de las alertas.
- Análisis forense de imágenes: recuperación de detalles en fotografías de escenas del crimen tomadas bajo lluvia, útil para investigación policial.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados en la model card para cada conjunto de prueba, evaluados sobre sus propias particiones de test (no sobre la validación mixta usada para selección de checkpoints).

| Test Set | Dominio | PSNR (dB) | SSIM | MAE | Rain Removal Rate |
|---|---|---|---|---|---|
| Rain100L | Sintetico | 30,96 | 0,932 | 0,0180 | 0,299 |
| Rain100H | Sintetico | 26,41 | 0,823 | 0,0353 | 0,718 |
| Test100 | Sintetico | 24,91 | 0,836 | 0,0560 | 0,463 |
| Test1200 | Sintetico | 29,08 | 0,868 | 0,0306 | 0,439 |
| Test2800 | Sintetico | 30,61 | 0,909 | 0,0222 | 0,416 |
| DDN-Data | Sintetico | 30,67 | 0,912 | 0,0221 | 0,404 |
| SPA-Data | Real | 39,01 | 0,980 | 0,0077 | 0,206 |
| RealRain-1k-H | Real | 35,98 | 0,971 | 0,0126 | 0,758 |
| RealRain-1k-L | Real | 38,04 | 0,980 | 0,0096 | 0,700 |
| AllWeather (rain+fog) | Transversal (estres) | 13,66 | 0,570 | 0,1867 | 0,122 |

Los valores de NIQE no se incluyen en la tabla por no ser comparables entre conjuntos, según advierte el propio autor. No se han publicado comparaciones directas con otros modelos de deraining en la información disponible.

## Requisitos de hardware

- Tamaño del modelo: aproximadamente 86 MB en FP32 (21,5 M parámetros × 4 bytes).
- VRAM estimada para inferencia: menos de 1 GB en FP32; puede ejecutarse en GPU con 2 GB o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (ej. NVIDIA GTX 1050 Ti, RTX 2060, etc.). También es viable en CPU para procesamiento por lotes pequeño.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con TorchServe, FastAPI o integrarse en pipelines de visión con OpenCV. No hay soporte nativo para vLLM, llama.cpp u Ollama (orientados a modelos de lenguaje).
- Latencia estimada: en una GPU de gama media (ej. RTX 3060), la inferencia sobre una imagen de 512×512 debería completarse en decenas de milisegundos, aunque no se proporcionan cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. Existen alternativas en el campo del deraining como Restormer (con atención transfromer, ~26 M parámetros) o MPRNet (arquitectura multi-etapa, ~20 M), pero no se han encontrado mediciones directas contra ClearView en la documentación accesible. Se recomienda consultar los benchmarks de cada modelo en sus respectivos repositorios para una evaluación objetiva.

## Limitaciones y advertencias

- Rendimiento degradado en condiciones de lluvia combinada con niebla: el conjunto AllWeather (rain+fog) muestra un PSNR de 13,66 dB y SSIM de 0,570, muy por debajo del resto, lo que indica una clara limitación en escenarios de degradación mixta.
- La métrica Rain Removal Rate puede ser negativa si el modelo introduce artefactos de alta frecuencia (sobre-afilado o alucinación de detalles), aunque en los resultados publicados todos los valores son positivos.
- NIQE no es comparable entre conjuntos de prueba, como advierte el autor; cualquier análisis basado en esta métrica debe limitarse a comparaciones dentro de una misma fila.
- El entrenamiento se realizó con datos principalmente en inglés en la documentación, pero el modelo no procesa texto; la etiqueta de idioma se refiere a la documentación, no al funcionamiento.
- No se han documentado sesgos específicos, pero al estar entrenado con imágenes de ciertos datasets (SPA-Data, RealRain-1k), podría generalizar peor a otros tipos de lluvia (granizo, llovizna, lluvia nocturna) o condiciones de iluminación no representadas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos de los datasets utilizados (cada uno tiene su propia licencia) si se planea redistribuir el modelo o sus derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/clearview-derain-unet
- Repositorio ClearView (GitHub): https://github.com/dronefreak/clearview
- Receta de mezcla de datos: https://github.com/dronefreak/clearview/blob/main/configs/mix/rain_mixed_synthetic_real.yaml
- Receta de validación mixta: https://github.com/dronefreak/clearview/blob/main/configs/mix/rain_mixed_val.yaml
- Datasets referenciados:
  - SPA-Data: https://huggingface.co/datasets/dronefreak/SPA-Data
  - RealRain-1k: https://huggingface.co/datasets/dronefreak/RealRain-1k
  - Rain13K: https://huggingface.co/datasets/dronefreak/Rain13K
  - DDN-Data: https://huggingface.co/datasets/dronefreak/DDN-Data
- Papers relacionados:
  - "Image Deraining" (arxiv:2206.05514)
  - "U-Net: Convolutional Networks for Biomedical Image Segmentation" (arxiv:1505.04597)

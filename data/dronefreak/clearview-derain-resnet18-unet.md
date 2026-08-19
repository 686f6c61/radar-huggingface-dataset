# dronefreak/clearview-derain-resnet18-unet

## Resumen

ClearView es un modelo de eliminación de lluvia en imágenes individuales (single-image deraining) desarrollado por dronefreak. Utiliza una arquitectura U-Net con encoder ResNet-18 preentrenado en ImageNet y fine-tuned de extremo a extremo, con 14,4 millones de parámetros. Es la variante más pequeña de las tres variantes con backbone ResNet (18/34/50) que ofrece la familia ClearView.

El modelo está entrenado sobre una mezcla de datos sintéticos y reales de lluvia, con sobremuestreo 2x de las fuentes reales, y selecciona checkpoints basándose en una métrica de validación mixta en lugar de optimizar para un único benchmark. Esto lo hace robusto frente a cambios de dominio entre lluvia sintética y real. Su licencia Apache 2.0 permite uso comercial sin restricciones.

ClearView resuelve la degradación de imágenes por lluvia, un problema relevante en conducción autónoma, vigilancia y fotografía al aire libre. Al combinar datos sintéticos y reales, mantiene un rendimiento consistente en ambos dominios, algo que muchos modelos especializados en un solo dominio no logran.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet-18 (preentrenado en ImageNet) |
| Parametros totales | 14,4 M |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | No aplica (procesamiento de imagenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura combina un U-Net con un encoder ResNet-18 preentrenado en ImageNet, fine-tuned de extremo a extremo. El U-Net aporta la estructura encoder-decoder con conexiones skip típicas para restauración de imágenes, mientras que el encoder ResNet-18 extrae características jerárquicas robustas. Con 14,4 millones de parámetros, es la variante más ligera de las tres ofrecidas por ClearView (18/34/50).

El entrenamiento utiliza cinco fuentes de datos combinadas mediante el sistema `--mix-config` de ClearView: Rain13K (13.711 pares sintéticos), DDN-Data/Rain1400 (12.600 pares sintéticos), SPA-Data (6.385 pares reales), RealRain-1k-H (784 pares reales) y RealRain-1k-L (784 pares reales). Las fuentes reales se sobremuestrean 2x, resultando en una mezcla efectiva de aproximadamente 62% sintético y 38% real (frente al 77%/23% por recuento bruto de pares). La selección de checkpoints se realiza sobre un conjunto de validación mixto que incluye SPA-Data val (limitado a 150 pares para que no domine), RealRain-1k-H/L validation (112 cada uno) y Rain100L (100 pares como ancla sintética).

## Capacidades

- Eliminación de lluvia en imágenes individuales (single-image deraining) sin necesidad de múltiples frames ni información temporal.
- Restauración de imágenes con degradación por lluvia en dominios sintéticos y reales.
- Manejo de lluvia ligera (RealRain-1k-L) y lluvia fuerte (RealRain-1k-H) con PSNR superior a 34 dB en ambos casos.
- Rendimiento consistente entre dominios gracias al entrenamiento con datos mixtos.
- Funciona como preprocesamiento para otros modelos de visión (detección de objetos, segmentación, etc.).
- Integración mediante la librería ClearView con API simple (`DerainingModel.from_pretrained`).

## Casos de uso

- Conducción autónoma: preprocesamiento de imágenes de cámaras de vehículos en condiciones de lluvia para mejorar la precisión de sistemas de detección de objetos, carriles y señales. El modelo maneja lluvia real (SPA-Data, RealRain-1k) con PSNR superior a 34 dB y SSIM por encima de 0,96.
- Vigilancia y videovigilancia: limpieza de frames de cámaras de seguridad exteriores afectados por lluvia antes de su análisis por sistemas de reconocimiento facial o de matrículas. El modelo procesa imágenes individuales, por lo que puede aplicarse frame a frame.
- Fotografía al aire libre: restauración de fotografías tomadas bajo lluvia, mejorando la claridad visual sin necesidad de equipo especializado ni capturas múltiples.
- Preprocesamiento para pipelines de visión por computador: integración como paso previo en sistemas de segmentación semántica, estimación de profundidad o detección de objetos que degradan su rendimiento con entrada ruidosa.
- Sistemas de asistencia al conductor (ADAS): mejora de imágenes de cámaras montadas en el vehículo para alertas de seguridad en tiempo real, gracias al bajo coste computacional de un modelo de 14,4 M de parámetros.
- Postproducción de vídeo: limpieza de secuencias grabadas bajo lluvia para análisis forense, documentación técnica o archivo histórico, procesando cada frame de forma independiente.

## Benchmarks y rendimiento

Las métricas se calculan sobre los splits de test/eval propios de cada dataset (no sobre el conjunto de validación mixto usado para selección de checkpoints):

| Test Set | Dominio | PSNR | SSIM | MAE | MSE | Rain Removal Rate | NIQE |
|---|---|---|---|---|---|---|---|
| Rain100L | Sintetico | 28,87 | 0,893 | 0,0242 | 0,00156 | -0,029 | 10,54 |
| Rain100H | Sintetico | 24,95 | 0,776 | 0,0422 | 0,00382 | 0,668 | 11,91 |
| Test100 | Sintetico | 25,99 | 0,833 | 0,0399 | 0,00315 | 0,400 | 9,67 |
| Test1200 | Sintetico | 28,03 | 0,845 | 0,0322 | 0,00239 | 0,295 | 7,72 |
| Test2800 | Sintetico | 28,34 | 0,875 | 0,0280 | 0,00168 | 0,226 | 792,65 |
| DDN-Data | Sintetico | 28,42 | 0,878 | 0,0278 | 0,00167 | 0,201 | 1041,55 |
| SPA-Data | Real | 36,55 | 0,970 | 0,0103 | 0,00045 | -0,555 | 6,39 |
| RealRain-1k-H | Real | 34,64 | 0,966 | 0,0138 | 0,00068 | 0,726 | 4,39 |
| RealRain-1k-L | Real | 36,25 | 0,975 | 0,0110 | 0,00046 | 0,649 | 4,43 |
| AllWeather (rain+fog) | Cross-domain | 13,66 | 0,558 | 0,1869 | 0,05451 | 0,109 | 235,27 |

Los valores negativos de Rain Removal Rate en Rain100L (-0,029) y SPA-Data (-0,555) indican que el modelo añade ligeramente más error de alta frecuencia del que elimina en esos conjuntos, probablemente por un leve sobre-agudizado del encoder ResNet. Este patrón se repite en las tres variantes ResNet (18/34/50) de ClearView.

## Requisitos de hardware

- Modelo de 14,4 millones de parámetros: aproximadamente 57,6 MB en FP32 y 28,8 MB en FP16.
- Inferencia viable en cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1060, RTX 2060 o superior).
- Inferencia en CPU posible para procesamiento por lotes sin requisitos de tiempo real.
- El peso del modelo (.pth) ocupa aproximadamente 0,1 GB en el repositorio.
- Despliegue mediante la librería ClearView (`pip install git+https://github.com/dronefreak/clearview.git`) o integración directa con PyTorch.
- Exportación a ONNX viable para despliegue en producción con TensorRT u otros motores de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | PSNR Rain1400 | PSNR SPA-Data | Dominio | Licencia |
|---|---|---|---|---|---|
| clearview-derain-resnet18-unet | 14,4 M | 28,42 | 36,55 | Mixto (sintetico + real) | Apache 2.0 |
| clearview-derain-unet (base) | no disponible | 30,9 | no disponible | Sintetico | Apache 2.0 |

El modelo base clearview-derain-unet reporta 30,9 PSNR en Rain1400, superior al 28,42 de la variante ResNet18-UNet en el mismo dataset. Sin embargo, la variante ResNet18 está diseñada para rendir mejor en datos reales (SPA-Data: 36,55 PSNR; RealRain-1k: 34,64-36,25 PSNR), donde el modelo base no reporta métricas. No se dispone de datos de comparación con otros modelos de deraining (Restormer, IDT, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Valores negativos de Rain Removal Rate en Rain100L y SPA-Data: el modelo añade ligeramente más error de alta frecuencia del que elimina en estos conjuntos, probablemente por sobre-agudizado del encoder ResNet.
- Rendimiento muy degradado en condiciones de lluvia combinada con niebla (AllWeather: 13,66 PSNR, 0,558 SSIM), lo que limita su uso en escenarios meteorológicos mixtos.
- El modelo no está diseñado para otros tipos de degradación (niebla, nieve

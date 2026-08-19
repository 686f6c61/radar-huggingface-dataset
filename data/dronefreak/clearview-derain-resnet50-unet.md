# dronefreak/clearview-derain-resnet50-unet

## Resumen

ClearView es un modelo de restauración de imágenes especializado en la eliminación de lluvia (deraining) a partir de una única imagen. Desarrollado por dronefreak, forma parte de la familia ClearView y utiliza una arquitectura U-Net con un encoder ResNet-50 preentrenado en ImageNet y ajustado de extremo a extremo. Con 73,3 millones de parámetros, es la variante más grande de las tres que componen la familia (ResNet18, ResNet34 y ResNet50).

El modelo aborda un problema crítico en visión por computadora: la degradación visual causada por la lluvia, que afecta a sistemas de conducción autónoma, vigilancia y fotografía. Su principal innovación radica en el entrenamiento con un conjunto de datos mixto (sintético y real) con sobremuestreo de fuentes reales, lo que le permite generalizar mejor entre dominios en lugar de optimizar únicamente para un conjunto de datos concreto. La selección de checkpoints se realiza sobre una validación mixta, no sobre un único benchmark, buscando robustez frente a variaciones del mundo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet-50 (preentrenado en ImageNet, ajustado end-to-end) |
| Parametros totales | 73,3 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision por computadora, procesa imagenes completas) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en formato .pth de PyTorch, sin cuantizacion publicada) |
| Idiomas soportados | No aplica (procesamiento de imagenes; la documentacion esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura U-Net clasica con un encoder basado en ResNet-50. El encoder, preentrenado en ImageNet, se ajusta durante el entrenamiento completo, lo que permite extraer caracteristicas de alto nivel adaptadas a la tarea de eliminacion de lluvia. El decodificador reconstruye la imagen limpia a partir de las representaciones jerarquicas del encoder, con conexiones de salto tipicas de U-Net que preservan detalles espaciales finos.

El entrenamiento combina cinco conjuntos de datos: Rain13K (13.711 pares sinteticos), DDN-Data (12.600 pares sinteticos), SPA-Data (6.385 pares reales), RealRain-1k-H (784 pares reales) y RealRain-1k-L (784 pares reales). Las fuentes reales se sobremuestrean con un factor de 2, resultando en una proporcion efectiva de aproximadamente 62% sintetico y 38% real. La seleccion de checkpoints se realiza sobre una validacion mixta que incluye SPA-Data (limitado a 150 pares), RealRain-1k-H/L y Rain100L como ancla sintetica, evitando que un solo conjunto domine la eleccion del mejor modelo.

## Capacidades

- Eliminacion de lluvia en imagenes individuales (single-image deraining), restaurando la escena subyacente.
- Manejo de multiples dominios: entrenado con datos sinteticos y reales, muestra resultados aceptables en ambos.
- Preservacion de detalles estructurales gracias a la arquitectura U-Net con conexiones de salto.
- Adecuado para preprocesamiento de imagenes en pipelines de vision por computadora (deteccion, segmentacion, seguimiento).
- Capacidad de procesar imagenes de resolucion variable, aunque no se especifican limites concretos.
- No incluye capacidades multimodales ni de generacion de texto; es exclusivamente un modelo de restauracion visual.

## Casos de uso

- Conduccion autonoma: limpiar las imagenes captadas por camaras en condiciones de lluvia para mejorar la deteccion de objetos, peatones y senales de trafico. El modelo puede integrarse en el pipeline de percepcion antes de los algoritmos de deteccion.
- Vigilancia y seguridad: mejorar la calidad de grabaciones de CCTV bajo lluvia, facilitando la identificacion de personas, vehiculos o eventos en entornos exteriores.
- Fotografia y postproduccion: restaurar fotografias tomadas bajo lluvia, eliminando las estelas de lluvia y mejorando la nitidez general de la imagen.
- Preprocesamiento para otros modelos de vision: como etapa previa a tareas de segmentacion semantica o estimacion de profundidad, donde la lluvia degrada significativamente el rendimiento de los modelos aguas abajo.
- Restauracion de video: aplicar el modelo fotograma a fotograma para limpiar secuencias de video grabadas con lluvia, util en aplicaciones de analisis forense o monitorizacion.
- Sistemas de asistencia al conductor (ADAS): mejorar la visibilidad en camaras frontales durante tormentas, contribuyendo a la seguridad activa del vehiculo.

## Benchmarks y rendimiento

La model card proporciona metricas detalladas por conjunto de test, calculadas sobre las particiones de evaluacion propias de cada fuente (no sobre la validacion mixta usada para seleccion de checkpoints):

| Test Set | Dominio | PSNR (dB) | SSIM | MAE | MSE | Rain Removal Rate | NIQE |
|---|---|---|---|---|---|---|---|
| Rain100L | Sintetico | 29,79 | 0,906 | 0,0218 | 0,00128 | 0,045 | 10,66 |
| Rain100H | Sintetico | 25,37 | 0,794 | 0,0398 | 0,00350 | 0,684 | 12,46 |
| Test100 | Sintetico | 26,16 | 0,839 | 0,0408 | 0,00340 | 0,417 | 10,12 |
| Test1200 | Sintetico | 28,44 | 0,856 | 0,0306 | 0,00221 | 0,318 | 7,77 |
| Test2800 | Sintetico | 28,67 | 0,883 | 0,0269 | 0,00156 | 0,251 | 790,05 |
| DDN-Data | Sintetico | 28,72 | 0,886 | 0,0268 | 0,00156 | 0,226 | 1033,27 |
| SPA-Data | Real | 37,07 | 0,973 | 0,0099 | 0,00040 | -0,476 | 6,45 |
| RealRain-1k-H | Real | 34,94 | 0,970 | 0,0135 | 0,00066 | 0,742 | 4,67 |
| RealRain-1k-L | Real | 36,52 | 0,978 | 0,0106 | 0,00042 | 0,671 | 4,80 |
| AllWeather (lluvia+niebla) | Transdominio (estres) | 13,61 | 0,555 | 0,1875 | 0,05468 | 0,103 | 217,52 |

El valor negativo de Rain Removal Rate en SPA-Data (-0,476) indica que el modelo anade ligeramente mas error de alta frecuencia del que elimina en ese conjunto, probablemente debido a un sobreafilado causado por el encoder ResNet. No se han publicado comparaciones con otros modelos de deraining en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 73,3 millones de parametros. En FP32, los pesos ocupan aproximadamente 293 MB; en FP16, unos 147 MB. Con memoria adicional para activaciones y gradientes (en inferencia solo activaciones), se estima que cabe en GPUs con 4 GB o mas de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4090). Para inferencia en produccion con alto rendimiento, se recomienda una GPU de datacenter como A100 o H100, aunque no es imprescindible.
- Ejecucion en CPU: posible, pero con latencia mayor; adecuada para pruebas o procesamiento por lotes no critico.
- Opciones de despliegue: el modelo se distribuye en formato PyTorch (.pth) y requiere la libreria ClearView (disponible en GitHub). No se mencionan exportaciones a ONNX, TensorRT ni otros formatos optimizados.
- Latencia y throughput: no se han publicado datos especificos. Como referencia, una U-Net con encoder ResNet-50 en una GPU moderna (p. ej., RTX 3090) puede procesar imagenes de 512x512 en decenas de milisegundos, pero esto es una estimacion no confirmada.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de eliminacion de lluvia en los datos proporcionados. La familia ClearView incluye variantes con encoders ResNet18 y ResNet34, que tienen menos parametros y probablemente menor rendimiento, pero no se aportan metricas comparativas en la model card. Modelos como Restormer o MPRNet son alternativas conocidas en la literatura, pero no se han incluido datos de comparacion.

## Limitaciones y advertencias

- El modelo muestra un valor negativo de Rain Removal Rate en SPA-Data, lo que sugiere un posible sobreafilado o artefactos de alta frecuencia en ese conjunto especifico.
- En condiciones extremas (como lluvia combinada con niebla, evaluado en AllWeather), el rendimiento cae drasticamente (PSNR de 13,61 dB), lo que limita su uso en escenarios meteorologicos complejos.
- No se han documentado sesgos especificos, pero al estar entrenado principalmente con imagenes de lluvia, puede no generalizar bien a otros tipos de degradacion (nieve, polvo, etc.).
- La licencia Apache 2.0 permite uso comercial sin restricciones significativas, siempre que se mantenga el aviso de copyright.
- El modelo no esta pensado para tareas de generacion o edicion creativa; su unica funcion es la restauracion de imagenes con lluvia.
- El repositorio no indica soporte para procesamiento por lotes optimizado ni integracion con frameworks de despliegue como TensorRT, lo que puede requerir trabajo adicional para produccion a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/clearview-derain-resnet50-unet
- Repositorio GitHub de ClearView: https://github.com/dronefreak/clearview
- Configuracion de mezcla de datos (rain_mixed_synthetic_real.yaml): https://github.com/dronefreak/clearview/blob/main/configs/mix/rain_mixed_synthetic_real.yaml
- Configuracion de validacion mixta (rain_mixed_val.yaml): https://github.com/dronefreak/clearview/blob/main/configs/mix/rain_mixed_val.yaml
- Referencias citadas en la model card: arxiv:2206.05514 (SPA-Data), arxiv:1505.04597 (ResNet), arxiv:1512.03385 (U-Net)

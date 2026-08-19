# dronefreak/clearview-derain-resnet34-unet

## Resumen

ClearView es un modelo de eliminación de lluvia en imágenes individuales (single-image deraining) desarrollado por dronefreak. Combina un encoder ResNet-34 preentrado en ImageNet con una arquitectura U-Net, y se entrena sobre una mezcla de conjuntos de datos sintéticos y reales para generalizar más allá de un único dominio. El modelo cuenta con 24,5 millones de parámetros y se distribuye bajo licencia Apache 2.0.

La relevancia actual de ClearView radica en su enfoque de dominio mixto: en lugar de optimizar solo sobre benchmarks sintéticos, selecciona checkpoints mediante una validación que combina datos reales y sintéticos, lo que mejora su comportamiento en condiciones del mundo real. Está orientado a aplicaciones como conducción autónoma, vigilancia y restauración de fotografías, donde la lluvia degrada seriamente la calidad de imagen.

El modelo se publica como un proyecto de código abierto con una biblioteca Python asociada (ClearView) que facilita su integración en pipelines de procesamiento de imagen. No se trata de un modelo multimodal ni de lenguaje, sino de una red puramente visual de imagen a imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet-34 (preentrenado en ImageNet, fine-tuned end-to-end) |
| Parametros totales | 24,5 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

ClearView utiliza una arquitectura U-Net con un encoder ResNet-34 preentrenado en ImageNet, que se ajusta de extremo a extremo durante el entrenamiento. Esta combinación permite extraer características de alto nivel de la imagen de entrada y reconstruir una versión limpia mediante la ruta de decodificación con conexiones de salto. El modelo está diseñado específicamente para la tarea de eliminación de lluvia, no para otras restauraciones.

El entrenamiento se realiza sobre una mezcla de cinco conjuntos de datos: Rain13K, DDN-Data (Rain1400), SPA-Data, RealRain-1k-H y RealRain-1k-L. Los conjuntos del mundo real se sobremuestrean con un factor de 2 para equilibrar la proporción entre datos sintéticos y reales, resultando en aproximadamente un 62 % de peso efectivo para datos sintéticos y un 38 % para reales. La selección del checkpoint final se basa en una validación mixta que incluye subconjuntos de SPA-Data, RealRain-1k-H/L y Rain100L, evitando que un único benchmark domine la elección.

Como innovación técnica, el proyecto introduce la métrica "Rain Removal Rate", que mide la energía residual de alta frecuencia (gradientes Sobel) entre la salida y la verdad terreno, comparada con la del input. Esta métrica complementa a las tradicionales PSNR y SSIM para evaluar la eliminación real de artefactos de lluvia.

## Capacidades

- Eliminacion de lluvia en imagenes individuales (single-image deraining) tanto en dominios sinteticos como reales.
- Restauracion de imagenes con lluvia, mejorando la visibilidad y la calidad visual general.
- Adecuado para tareas de preprocesado en sistemas de vision por computador (conduccion autonoma, vigilancia, fotografia).
- Inferencia directa de imagen a imagen sin necesidad de post-procesado adicional.
- Soporte para integracion mediante la biblioteca ClearView (API Python) con descarga automatica de pesos desde Hugging Face.
- No incluye capacidades de generacion de texto, tool calling, agentes ni multimodalidad; es exclusivamente un modelo de restauracion visual.

## Casos de uso

- Conduccion autonoma: las camaras de los vehiculos pueden verse afectadas por lluvia intensa; ClearView puede limpiar las imagenes antes de pasarlas a algoritmos de deteccion de objetos o segmentacion, mejorando la fiabilidad en condiciones adversas.
- Vigilancia y seguridad: en sistemas de CCTV exteriores, la lluvia reduce la calidad de las grabaciones. Aplicar ClearView como paso previo permite mejorar la identificacion de personas, vehiculos o matrículas en entornos lluviosos.
- Fotografia y post-produccion: los fotografos pueden usar el modelo para eliminar gotas de lluvia o rayas de lluvia de imagenes capturadas en exteriores, obteniendo resultados mas limpios sin necesidad de retoques manuales.
- Preprocesado para modelos de vision: cualquier pipeline de vision por computador (clasificacion, deteccion, segmentacion) puede beneficiarse de una entrada sin lluvia, ya que los modelos entrenados con imagenes limpias suelen degradarse ante ruido meteorologico.
- Restauracion de archivos historicos: imagenes antiguas o grabaciones con degradacion por lluvia pueden ser restauradas para preservar contenido visual valioso.
- Investigacion en restauracion de imagenes: el modelo puede servir como baseline o componente en estudios comparativos de tecnicas de deraining, gracias a su naturaleza de codigo abierto y sus metricas detalladas.

## Benchmarks y rendimiento

La model card del autor proporciona metricas detalladas sobre varios conjuntos de prueba, calculadas sobre las particiones de evaluacion de cada fuente. No se incluyen comparaciones con otros modelos en la informacion disponible.

| Test Set | Dominio | PSNR | SSIM | MAE | MSE | Rain Removal Rate | NIQE |
|---|---|---|---|---|---|---|---|
| Rain100L | Sintetico | 29,00 | 0,894 | 0,0239 | 0,00153 | -0,034 | 10,61 |
| Rain100H | Sintetico | 24,67 | 0,774 | 0,0433 | 0,00426 | 0,665 | 12,56 |
| Test100 | Sintetico | 26,38 | 0,839 | 0,0372 | 0,00281 | 0,404 | 9,55 |
| Test1200 | Sintetico | 28,19 | 0,852 | 0,0312 | 0,00225 | 0,300 | 7,58 |
| Test2800 | Sintetico | 28,31 | 0,875 | 0,0277 | 0,00169 | 0,224 | 791,37 |
| DDN-Data | Sintetico | 28,47 | 0,879 | 0,0274 | 0,00166 | 0,202 | 1032,63 |
| SPA-Data | Real | 36,97 | 0,971 | 0,0096 | 0,00042 | -0,570 | 6,52 |
| RealRain-1k-H | Real | 35,21 | 0,969 | 0,0128 | 0,00066 | 0,735 | 4,51 |
| RealRain-1k-L | Real | 36,88 | 0,977 | 0,0101 | 0,00041 | 0,664 | 4,66 |
| AllWeather (rain+fog) | Trans-dominio (estres) | 13,54 | 0,558 | 0,1904 | 0,05614 | 0,110 | 223,11 |

Los valores negativos de Rain Removal Rate en Rain100L y SPA-Data indican que el modelo anade mas error de alta frecuencia del que elimina en esos conjuntos especificos, probablemente debido a un ligero sobre-agudizado o artefactos del encoder ResNet. A pesar de ello, los PSNR y SSIM son aceptables.

## Requisitos de hardware

No se proporcionan especificaciones oficiales de hardware en la documentacion del modelo. Sin embargo, dado que se trata de una CNN con 24,5 millones de parametros, es un modelo ligero que puede ejecutarse en GPUs de consumo con poca memoria VRAM. Una estimacion razonable es que 4 GB de VRAM son suficientes para inferencia a resoluciones tipicas (por ejemplo, 512x512), aunque no se dispone de datos exactos de consumo.

Para despliegue, la biblioteca ClearView ofrece una API Python sencilla, y al ser un modelo PyTorch estandar, puede integrarse con frameworks de inferencia como TorchServe, ONNX Runtime (si se exporta) o directamente en scripts personalizados. No se mencionan opciones como vLLM u Ollama, que son especificas de modelos de lenguaje.

## Comparativa con modelos similares

No se ha publicado en la informacion disponible una comparativa con otros modelos de eliminacion de lluvia (por ejemplo, Restormer, MPRNet, etc.). Por tanto, no se puede ofrecer una tabla comparativa basada en datos verificados. Se recomienda consultar la literatura cientifica sobre deraining para establecer comparaciones.

## Limitaciones y advertencias

- El modelo presenta valores negativos de Rain Removal Rate en Rain100L y SPA-Data, lo que sugiere un posible sobre-agudizado o generacion de artefactos de alta frecuencia en esos conjuntos. Esto puede afectar a la calidad percibida en imagenes con texturas finas.
- Su rendimiento en condiciones de niebla (conjunto AllWeather) es significativamente bajo (PSNR 13,54 dB, SSIM 0,558), lo que indica que no esta disenado para degradados mixtos como lluvia y niebla simultaneas.
- Aunque se entrena con datos reales, la mayoria de los datos de entrenamiento son sinteticos, lo que puede introducir un sesgo hacia las caracteristicas de lluvia simulada.
- No se proporcionan datos sobre el comportamiento en imagenes con lluvia muy densa, salpicaduras extremas o condiciones nocturnas.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero el modelo se distribuye tal cual, sin garantias. El autor no indica si existen restricciones adicionales sobre los datos de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que es un proyecto reciente o poco difundido; se recomienda validar su comportamiento en casos de uso especificos antes de desplegarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/clearview-derain-resnet34-unet
- Repositorio ClearView (GitHub): https://github.com/dronefreak/clearview
- Configuracion de mezcla de datos: https://github.com/dronefreak/clearview/blob/main/configs/mix/rain_mixed_synthetic_real.yaml
- Configuracion de validacion mezclada: https://github.com/dronefreak/clearview/blob/main/configs/mix/rain_mixed_val.yaml
- Datasets:
  - SPA-Data: https://huggingface.co/datasets/dronefreak/SPA-Data
  - RealRain-1k: https://huggingface.co/datasets/dronefreak/RealRain-1k
  - Rain13K: https://huggingface.co/datasets/dronefreak/Rain13K
  - DDN-Data: https://huggingface.co/datasets/dronefreak/DDN-Data
- Referencias arxiv citadas en la model card:
  - 2206.05514
  - 1505.04597
  - 1512.03385

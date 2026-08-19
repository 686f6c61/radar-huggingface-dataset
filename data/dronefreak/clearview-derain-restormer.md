# dronefreak/clearview-derain-restormer

## Resumen

ClearView es un modelo de restauración de imágenes especializado en la eliminación de lluvia en imágenes individuales (single-image deraining). Desarrollado por el usuario dronefreak, se basa en la arquitectura Restormer, un transformer eficiente para tareas de restauración de imágenes, con 15,3 millones de parámetros. El modelo se entrena con una mezcla de datos sintéticos y reales de lluvia, empleando un enfoque de dominio mixto que busca generalizar mejor a escenarios del mundo real, en lugar de optimizar únicamente para un benchmark concreto. Esto lo hace relevante para aplicaciones como conducción autónoma, vigilancia y fotografía en condiciones meteorológicas adversas.

El modelo está disponible bajo licencia Apache 2.0 y se distribuye como pesos en formato PyTorch. Su tamaño de repositorio es de 0,1 GB, lo que indica un modelo ligero y fácil de desplegar. La selección de checkpoints se realiza mediante una métrica de validación mixta que combina conjuntos reales y sintéticos, lo que mejora la robustez entre dominios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Restormer (transformer) |
| Parametros totales | 15,3 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Restormer, un transformer diseñado para tareas de restauracion de imagenes que emplea mecanismos de atencion de bajo coste computacional. Segun la model card, se entreno sobre una combinacion de cinco conjuntos de datos: Rain13K, DDN-Data (Rain1400), SPA-Data, RealRain-1k-H y RealRain-1k-L. Las fuentes reales se sobremuestrearon con un factor de 2 para equilibrar la proporcion entre datos sinteticos y reales, resultando en aproximadamente un 62% de datos sinteticos y un 38% reales por peso de muestreo efectivo.

La seleccion del checkpoint final se realizo sobre un conjunto de validacion mixto que incluye SPA-Data (limitado a 150 pares), RealRain-1k-H/L (112 cada uno) y Rain100L (100) como ancla sintetica. Este enfoque busca evitar el sobreajuste a un unico conjunto de datos y mejorar la generalizacion a dominios no vistos. No se menciona el uso de RLHF o DPO, ya que es una tarea de restauracion de imagenes, no de generacion de texto.

## Capacidades

- Eliminacion de lluvia en imagenes individuales (single-image deraining).
- Restauracion de imagenes con degradacion por lluvia, tanto en entornos sinteticos como reales.
- Soporte para imagenes de alta resolucion (no se especifica limite, pero el modelo es ligero).
- Capacidad de procesamiento por lotes (inferencia sobre multiples imagenes).
- Integracion con la libreria ClearView para facilitar su uso.
- Metricas de evaluacion: PSNR, SSIM, MAE, MSE, Rain Removal Rate y NIQE.
- No se mencionan capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo de vision puro.

## Casos de uso

- Conduccion autonoma: limpiar imagenes de camaras de vehiculos en condiciones de lluvia para mejorar la deteccion de objetos y la navegacion.
- Vigilancia y seguridad: mejorar la calidad de video e imagenes de camaras de vigilancia en exteriores durante tormentas.
- Fotografia y postprocesado: eliminar lluvia de fotografias personales o profesionales para obtener imagenes mas nitidas.
- Restauracion de video: aplicar el modelo a fotogramas individuales para limpiar secuencias de video grabadas bajo lluvia.
- Preprocesado para otros sistemas de vision: mejorar la entrada de modelos de segmentacion, deteccion o reconocimiento que se degradan con lluvia.
- Investigacion en restauracion de imagenes: servir como baseline o componente en pipelines de investigacion sobre deraining y dominios mixtos.

## Benchmarks y rendimiento

La model card proporciona metricas detalladas por conjunto de prueba. Se presentan en la siguiente tabla:

| Test Set | Dominio | PSNR (dB) | SSIM | MAE | MSE | Rain Removal Rate | NIQE |
|---|---|---|---|---|---|---|---|
| Rain100L | Sintetico | 35.04 | 0.962 | 0.0106 | 0.00041 | 0.518 | 9.74 |
| Rain100H | Sintetico | 27.87 | 0.856 | 0.0287 | 0.00209 | 0.756 | 11.36 |
| Test100 | Sintetico | 27.34 | 0.869 | 0.0397 | 0.00322 | 0.520 | 9.63 |
| Test1200 | Sintetico | 31.38 | 0.897 | 0.0222 | 0.00111 | 0.495 | 7.48 |
| Test2800 | Sintetico | 31.78 | 0.924 | 0.0191 | 0.00075 | 0.475 | 785.49 |
| DDN-Data | Sintetico | 31.97 | 0.928 | 0.0188 | 0.00074 | 0.465 | 983.80 |
| SPA-Data | Real | 42.53 | 0.986 | 0.0045 | 0.00023 | 0.593 | 6.25 |
| RealRain-1k-H | Real | 38.68 | 0.982 | 0.0088 | 0.00037 | 0.802 | 4.12 |
| RealRain-1k-L | Real | 40.90 | 0.987 | 0.0068 | 0.00022 | 0.750 | 4.24 |
| AllWeather (rain+fog) | Cross-domain | 13.67 | 0.583 | 0.1883 | 0.05492 | 0.141 | 233.24 |

Nota: los valores de NIQE solo son comparables dentro de la misma fila, ya que la referencia se ajusta por conjunto. El modelo muestra buen rendimiento en conjuntos reales, pero degrada significativamente en el conjunto AllWeather (lluvia + niebla), lo que indica una limitacion en dominios mixtos.

## Requisitos de hardware

No se proporcionan requisitos especificos de hardware en la informacion disponible. Sin embargo, al tratarse de un modelo con 15,3 millones de parametros y un tamano de repositorio de 0,1 GB, es razonable esperar que pueda ejecutarse en GPUs de consumo medio o incluso en CPU para inferencia, aunque no se dispone de datos concretos de VRAM o latencia. Se recomienda consultar la documentacion de la libreria ClearView para mas detalles.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de deraining en la informacion proporcionada. La model card menciona una comparacion dentro de la familia ClearView, pero no se incluyen los datos. Por tanto, no se puede realizar una comparativa externa.

## Limitaciones y advertencias

- El modelo esta especializado en la eliminacion de lluvia; su rendimiento en otros tipos de degradacion (niebla, nieve, etc.) es limitado, como muestra el bajo PSNR en AllWeather.
- Los valores de NIQE no son comparables entre conjuntos de datos, por lo que no deben interpretarse como una medida absoluta de calidad.
- El modelo puede alucinar detalles o sobreafinar en algunas imagenes, como indica la metrica de Rain Removal Rate que puede ser negativa en casos extremos.
- No se han reportado sesgos especificos, pero al entrenarse principalmente con datos en ingles y escenas de conduccion/vigilancia, puede tener un sesgo hacia esos dominios.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir adecuadamente.
- El modelo no soporta otros idiomas mas alla del ingles en su documentacion, aunque la tarea es visual.

## Enlaces

- HuggingFace: https://huggingface.co/dronefreak/clearview-derain-restormer
- Repositorio ClearView: https://github.com/dronefreak/clearview
- Paper de Restormer: https://arxiv.org/abs/2206.05514
- Datasets: SPA-Data, RealRain-1k, Rain13K, DDN-Data (disponibles en HuggingFace como datasets de dronefreak).

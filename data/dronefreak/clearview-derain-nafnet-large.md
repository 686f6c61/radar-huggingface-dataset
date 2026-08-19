# dronefreak/clearview-derain-nafnet-large

## Resumen

ClearView Derain NAFNet Large es un modelo de eliminación de lluvia en imágenes individuales (single-image deraining) desarrollado por dronefreak. Se basa en la arquitectura NAFNet (Nonlinear Activation Free Network) en su variante Large, con 116 millones de parámetros, y está entrenado sobre una mezcla de datos sintéticos y reales de lluvia para generalizar mejor entre dominios. El modelo forma parte del ecosistema ClearView, una librería de restauración de imágenes que facilita el entrenamiento y la inferencia.

La relevancia de este modelo radica en su enfoque de entrenamiento mixto: en lugar de optimizar para un único benchmark sintético, combina cinco conjuntos de datos (Rain13K, DDN-Data, SPA-Data, RealRain-1k-H y RealRain-1k-L) con sobremuestreo de las fuentes reales, y selecciona el checkpoint final mediante una métrica de validación también mezclada. Esto lo hace especialmente útil para aplicaciones del mundo real como conducción autónoma, vigilancia o fotografía, donde la lluvia real presenta características distintas a las de los datos sintéticos. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en HuggingFace con un peso de 0,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NAFNet Large (nonlinear activation free network) |
| Parametros totales | 116M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

NAFNet (Nonlinear Activation Free Network) es una arquitectura de restauracion de imagenes que elimina las activaciones no lineales (como ReLU o GELU) de los bloques transformer, simplificando el calculo y reduciendo el coste computacional sin sacrificar rendimiento. La variante Large, con 116M de parametros, es la mas grande de la familia ClearView y esta disenada para maximizar la calidad de restauracion en condiciones de lluvia variadas.

El entrenamiento combina cinco fuentes de datos mediante la herramienta `--mix-config` de ClearView: Rain13K (13.711 pares sinteticos), DDN-Data/Rain1400 (12.600 pares sinteticos), SPA-Data (6.385 pares reales), RealRain-1k-H (784 pares reales) y RealRain-1k-L (784 pares reales). Las fuentes reales se sobremuestrean 2x, resultando en una proporcion efectiva de ~62% sintetico y ~38% real. La seleccion del checkpoint final se realiza sobre un conjunto de validacion mezclado que incluye SPA-Data val (limitado a 150 pares), RealRain-1k-H/L val (112 cada uno) y Rain100L (100 pares como ancla sintetica), evitando que un unico dataset domine la eleccion del modelo.

## Capacidades

- Eliminacion de lluvia en imagenes individuales (single-image deraining) con salida de imagen limpia.
- Generalizacion entre dominios sinteticos y reales gracias al entrenamiento mixto con sobremuestreo de datos reales.
- Restauracion de imagenes con metricas de calidad estandar: PSNR, SSIM, MAE, MSE, Rain Removal Rate y NIQE.
- Adecuado para escenarios de conduccion autonoma y vigilancia, donde la lluvia real degrada la visibilidad.
- Inferencia mediante la API de ClearView (`DerainingModel.from_pretrained`), integrable en pipelines de procesamiento de imagenes.
- No soporta tool calling, agentes ni procesamiento de lenguaje; es exclusivamente un modelo de vision por imagenes.

## Casos de uso

- Conduccion autonoma: el modelo puede preprocesar frames de camaras de vehiculos en tiempo real para eliminar lluvia y mejorar la deteccion de objetos, senales y peatones. Su entrenamiento con datos reales (SPA-Data, RealRain-1k) lo hace mas robusto que modelos entrenados solo con sinteticos.
- Vigilancia y seguridad: limpieza de imagenes de camaras fijas o moviles en exteriores durante tormentas, mejorando la precision de sistemas de reconocimiento facial o de matricula.
- Fotografia de consumo: restauracion de fotografias personales tomadas bajo lluvia, con salida lista para compartir o imprimir.
- Postproduccion de video: eliminacion de lluvia en secuencias grabadas en exteriores, aplicable como filtro previo a tareas de estabilizacion o composicion.
- Vision artificial industrial: preprocesamiento de imagenes en entornos exteriores de fabricacion o logistica donde la lluvia afecta a sistemas de inspeccion automatica.
- Investigacion en restauracion de imagenes: el modelo sirve como referencia para estudios comparativos de deraining, dado que publica metricas detalladas por dataset y una metrica propia (Rain Removal Rate) que cuantifica la energia residual de alta frecuencia.

## Benchmarks y rendimiento

La model card del autor proporciona metricas detalladas sobre conjuntos de test propios de cada fuente, calculadas con los pesos finales del modelo:

| Test Set | Dominio | PSNR (dB) | SSIM | MAE | MSE | Rain Removal Rate | NIQE |
|---|---|---|---|---|---|---|---|
| Rain100L | Sintetico | 34.72 | 0.962 | 0.0106 | 0.00045 | 0.508 | 9.59 |
| Rain100H | Sintetico | 27.69 | 0.856 | 0.0292 | 0.00223 | 0.750 | 10.94 |
| Test100 | Sintetico | 27.68 | 0.864 | 0.0378 | 0.00310 | 0.506 | 9.96 |
| Test1200 | Sintetico | 31.37 | 0.897 | 0.0219 | 0.00110 | 0.491 | 7.37 |
| Test2800 | Sintetico | 31.74 | 0.924 | 0.0191 | 0.00076 | 0.469 | 794.11 |
| DDN-Data | Sintetico | 31.89 | 0.927 | 0.0189 | 0.00075 | 0.459 | 990.71 |
| SPA-Data | Real | 41.98 | 0.986 | 0.0048 | 0.00025 | 0.556 | 6.31 |
| RealRain-1k-H | Real | 39.23 | 0.982 | 0.0086 | 0.00040 | 0.804 | 4.25 |
| RealRain-1k-L | Real | 41.09 | 0.987 | 0.0068 | 0.00023 | 0.753 | 4.46 |
| AllWeather (rain+fog) | Cross-domain (estres) | 13.53 | 0.576 | 0.1924 | 0.05689 | 0.127 | 232.12 |

Nota: los valores de NIQE se recalculan con estadisticas de referencia propias de cada conjunto de test, por lo que solo son comparables dentro de la misma fila. El rendimiento en AllWeather (lluvia y niebla combinadas) es significativamente inferior, lo que indica una limitacion clara en condiciones de niebla.

## Requisitos de hardware

- VRAM estimada para inferencia: con 116M de parametros, el modelo en FP32 ocupa aproximadamente 464 MB de pesos. Para una imagen de entrada de 256x256, se estima un uso de VRAM de 1-2 GB; para resoluciones mayores (512x512 o superiores), puede superar los 3 GB. No se dispone de datos oficiales del autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia a resoluciones moderadas. Tarjetas como NVIDIA GTX 1660, RTX 2060 o superiores son adecuadas. Para entrenamiento o fine-tuning, se recomienda una GPU con 8-12 GB (RTX 3080, RTX 4080, A100).
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo con 4 GB o mas de VRAM para inferencia.
- Opciones de despliegue: el modelo se integra mediante la libreria ClearView (`pip install git+https://github.com/dronefreak/clearview.git`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de vision y no de lenguaje. Para produccion, se puede servir con TorchServe o un endpoint FastAPI que cargue los pesos.
- Latencia y throughput: no disponible en la informacion proporcionada. Depende de la resolucion de entrada y del hardware; en una GPU moderna, una imagen de 256x256 deberia procesarse en decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de deraining fuera del ecosistema ClearView en la informacion proporcionada. La model card menciona una comparacion interna con el resto de la familia ClearView, pero el texto se corta antes de mostrar los resultados. Para una comparativa externa, se podrian considerar modelos como Restormer, Uformer o IDT (Image Deraining Transformer), pero no hay datos publicados en la informacion disponible.

## Limitaciones y advertencias

- Rendimiento deficiente en condiciones de niebla combinada con lluvia: el test AllWeather muestra un PSNR de 13.53 dB, muy por debajo del resto de conjuntos, lo que indica que el modelo no generaliza bien a escenarios con niebla.
- Los valores de NIQE no son comparables entre conjuntos de test, ya que se recalculan con estadisticas de referencia propias de cada dataset; interpretar diferencias entre filas como calidad relativa es incorrecto.
- El modelo esta entrenado exclusivamente para eliminar lluvia; no aborda otros tipos de degradacion (niebla, polvo, ruido) salvo en el caso de AllWeather, donde el rendimiento es pobre.
- No se especifican sesgos conocidos, pero al ser un modelo de vision, podria presentar artefactos en imagenes con texturas complejas o patrones que imiten lluvia (por ejemplo, texturas de agua en fuentes o superficies brillantes).
- Riesgo de alucinacion visual: la metrica Rain Removal Rate puede ser negativa si el modelo anade detalle de alta frecuencia inexistente; en el test AllWeather el valor es 0.127, cercano a cero, lo que sugiere que apenas elimina lluvia en ese escenario.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la procedencia de los datos de entrenamiento (SPA-Data, RealRain-1k, etc.) por posibles restricciones de uso de los conjuntos originales.
- El modelo no soporta procesamiento de lenguaje ni tool calling; es exclusivamente un modelo de vision por imagenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/clearview-derain-nafnet-large
- Libreria ClearView (GitHub): https://github.com/dronefreak/clearview
- Receta de mezcla de datos de entrenamiento: https://github.com/dronefreak/clearview/blob/main/configs/mix/rain_mixed_synthetic_real.yaml
- Receta de validacion mezclada: https://github.com/dronefreak/clearview/blob/main/configs/mix/rain_mixed_val.yaml
- Paper de NAFNet (arXiv): https://arxiv.org/abs/2206.05514
- Datasets usados: SPA-Data (https://huggingface.co/datasets/dronefreak/SPA-Data), RealRain-1k (https://huggingface.co/datasets/dronefreak/RealRain-1k), Rain13K (https://huggingface.co/datasets/dronefreak/Rain13K), DDN-Data (https://huggingface.co/datasets/dronefreak/DDN-Data)

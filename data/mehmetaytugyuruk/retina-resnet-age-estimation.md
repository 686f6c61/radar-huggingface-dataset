# mehmetaytugyuruk/retina-resnet-age-estimation

## Resumen

El modelo `mehmetaytugyuruk/retina-resnet-age-estimation` es un conjunto de diez checkpoints de PyTorch para la estimación de la edad cronológica a partir de imágenes de fondo de retina (fundus). Fue desarrollado por Mehmet Aytuğ Yürük y A. Memiş, investigadores de la Universidad de Estambul, como parte del artículo "Age Prediction and Categorization from Retinal Fundus Images Using Residual Neural Networks", presentado en la conferencia IISEC 2026.

El problema que resuelve es el de la estimación automática de la edad biológica a partir de imágenes médicas no invasivas, una tarea con aplicaciones en investigación del envejecimiento y en estudios epidemiológicos. El modelo se basa en cinco arquitecturas ResNet (ResNet-18, 34, 50, 101 y 152), preentrenadas en ImageNet y ajustadas completamente sobre el conjunto de datos Retina Age Analysis, que contiene 9.857 imágenes de fondo de retina. Cada arquitectura se entrena dos veces: una con imágenes preprocesadas de forma estándar (recorte y redimensionado a 224×224) y otra con un filtro de realce vascular de Ben Graham adicional.

La relevancia actual del modelo radica en que ofrece un punto de referencia reproducible para la estimación de edad por retina, con resultados publicados y código abierto, lo que permite comparar futuros enfoques (incluido el estudio complementario con Vision Transformers). No está destinado a uso clínico ni diagnóstico, y su licencia MIT facilita su reutilización en investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet (variantes 18, 34, 50, 101, 152) con cabeza de regresión personalizada |
| Parametros totales | No especificado (depende de la variante; rango típico de 11M a 60M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision por computador) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (procesamiento de imagenes) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (checkpoints con `model_state_dict`, `mean_age`, `std_age`, `epoch`, `val_loss`, `val_mae`) |

## Arquitectura y entrenamiento

El modelo emplea arquitecturas ResNet clasicas preentrenadas en ImageNet, a las que se les sustituye la capa totalmente conectada final por una cabeza de regresion que predice un unico valor continuo: la edad cronologica. La cabeza consta de varias capas lineales con normalizacion por lotes, ReLU y dropout, adaptandose al tamano del vector de caracteristicas del backbone (512 para ResNet-18/34, 2048 para ResNet-50/101/152). La clasificacion por categorias de edad (Pediatrico, Adulto Joven, Mediana Edad, Senior, Anciano) se deriva de la salida de regresion solo en el momento de la evaluacion, sin entrenar una cabeza de clasificacion separada.

El entrenamiento se realizo sobre el dataset Retina Age Analysis (Kamran, 2025), con 9.857 imagenes y una division a nivel de paciente: 6.902 para entrenamiento, 1.493 para validacion y 1.462 para test. El preprocesado incluye recorte del disco optico, relleno y redimensionado a 224×224, y opcionalmente la aplicacion del filtro de Ben Graham. Se utilizo la funcion de perdida Smooth L1 reponderada por muestra mediante Label Distribution Smoothing (LDS) para compensar el desequilibrio en la distribucion de edades. El optimizador fue AdamW con tasa de aprendizaje 1e-4 y decaimiento de peso 1e-4, con un programador ReduceLROnPlateau (factor 0.5, paciencia 5 epocas). Se entrenaron 80 epocas con un tamano de lote de 32.

## Capacidades

- Regresion de edad cronologica a partir de imagenes de fondo de retina (un valor continuo en anos).
- Derivacion de categorias de edad en cinco clases (Pediatrico, Adulto Joven, Mediana Edad, Senior, Anciano) a partir de la salida de regresion.
- Procesamiento de imagenes de retina con dos modos de preprocesado: estandar (recorte y redimensionado) y con filtro de realce vascular de Ben Graham.
- Disponibilidad de cinco variantes de ResNet con distintos tamanos y capacidades de representacion.
- Almacenamiento de metadatos de normalizacion (media y desviacion estandar de la edad) en cada checkpoint para reconstruir la prediccion en la escala original.
- Reproducibilidad completa: codigo, instrucciones y mapeo papel-codigo disponibles en el repositorio de GitHub.
- No incluye capacidades de vision general (deteccion de objetos, segmentacion) ni procesamiento de lenguaje; esta especializado exclusivamente en la tarea de estimacion de edad por retina.

## Casos de uso

- Investigacion del envejecimiento biologico: el modelo permite estimar la edad biologica a partir de imagenes de retina, lo que facilita estudios longitudinales sobre la relacion entre el envejecimiento ocular y el sistemico. Se usaria como herramienta de analisis en cohortes de pacientes con imagenes de fundus disponibles.
- Estudios epidemiologicos de salud ocular: puede aplicarse a grandes bases de datos de retinografias para correlacionar la edad estimada con variables clinicas (presion intraocular, grosor corneal, etc.), ayudando a identificar factores de riesgo asociados al envejecimiento retinal.
- Validacion de algoritmos de estimacion de edad: al tratarse de un modelo de referencia con resultados publicados y codigo abierto, sirve como punto de comparacion para nuevos metodos (por ejemplo, el companion con Vision Transformers). Los investigadores pueden reproducir los resultados y comparar metricas MAE, exactitud y F1.
- Desarrollo de herramientas de screening no invasivo (con fines de investigacion): aunque no esta validado clinicamente, puede integrarse en prototipos de investigacion para explorar si la edad estimada por retina correlaciona con biomarcadores de enfermedades sistemicas (diabetes, hipertension). Su uso debe limitarse a entornos de investigacion, nunca para diagnostico.
- Educacion y formacion en deep learning medico: el repositorio incluye codigo completo, instrucciones de preprocesado y mapeo papel-codigo, lo que lo convierte en un recurso didactico para ensenar tecnicas de regresion con redes residuales en imagenes medicas.
- Analisis de sesgos y robustez en imagenes de retina: dado que el modelo se entrena en un unico dataset publico, puede utilizarse para estudiar la generalizacion a otras poblaciones, dispositivos de captura o protocolos de adquisicion, evaluando la degradacion del rendimiento y las limitaciones de los modelos de estimacion de edad.

## Benchmarks y rendimiento

Los resultados reportados en el articulo (tablas III y V) sobre el conjunto de test (1.462 imagenes) son los siguientes. El MAE se expresa en anos; la exactitud y el F1 corresponden a la clasificacion derivada en 5 categorias de edad.

**Imagenes sin filtrar**

| Modelo | MAE | Exactitud | F1 |
|---|---|---|---|
| ResNet-18 | 5.17 | 0.8426 | 0.7157 |
| ResNet-34 | 5.11 | 0.8382 | 0.7071 |
| ResNet-50 | 5.23 | 0.8373 | 0.7060 |
| ResNet-101 | 5.09 | 0.8431 | 0.7132 |
| ResNet-152 | 5.27 | 0.8368 | 0.7008 |

**Imagenes con filtro de Ben Graham**

| Modelo | MAE | Exactitud | F1 |
|---|---|---|---|
| ResNet-18 | 5.24 | 0.8369 | 0.7053 |
| ResNet-34 | 5.27 | 0.8451 | 0.7165 |
| ResNet-50 | 5.21 | 0.8313 | 0.6912 |
| **ResNet-101** | **5.02** | 0.8422 | 0.7081 |
| ResNet-152 | 5.17 | 0.8418 | 0.7056 |

El mejor MAE global corresponde a ResNet-101 con filtro de Graham (5.02 anos). El mejor F1 en categorias de edad lo obtiene ResNet-34 con filtro (0.7165). No se han publicado comparaciones con otros modelos de estimacion de edad por retina en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentacion del modelo.
- Al tratarse de redes ResNet de tamano moderado (desde ~11M parametros en ResNet-18 hasta ~60M en ResNet-152), la inferencia es ligera: una imagen de 224×224 requiere menos de 1 GFLOP en las variantes pequenas.
- Cualquier GPU moderna con al menos 4 GB de VRAM puede ejecutar la inferencia sin problemas; incluso CPU es viable para uso puntual.
- Para el entrenamiento o ajuste fino, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060 o superior) para las variantes mas grandes.
- No hay soporte oficial para cuantizacion ni formatos optimizados (ONNX, TensorRT), pero al ser checkpoints PyTorch estandar pueden convertirse con herramientas como `torch.onnx.export`.
- El despliegue puede realizarse con cualquier framework de inferencia PyTorch (TorchServe, FastAPI, etc.) sin dependencias especiales.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de estimacion de edad por retina en la informacion proporcionada. El propio autor publica un estudio complementario con Vision Transformers (`mehmetaytugyuruk/retina-vit-age-estimation`) sobre el mismo dataset, pero no se incluyen resultados en la model card de este repositorio. Otros modelos existentes en la literatura (por ejemplo, basados en EfficientNet o en arquitecturas híbridas) no se citan en la documentacion, por lo que no se puede establecer una comparativa rigurosa sin fuentes adicionales.

## Limitaciones y advertencias

- Entrenado y evaluado sobre un unico dataset publico (Retina Age Analysis); la generalizacion a otras poblaciones, dispositivos de captura o protocolos de adquisicion no ha sido probada.
- No validado clinicamente: no debe utilizarse para diagnostico, cribado ni ninguna toma de decisiones medica.
- Las categorias de edad se derivan de la salida de regresion de forma post-hoc, sin optimizacion directa como objetivo de clasificacion, lo que puede producir fronteras de categoria suboptimas.
- La composicion demografica del dataset y los detalles de consentimiento y anonimizacion dependen de los autores originales del dataset y no han sido verificados de forma independiente.
- Riesgo de sesgo en la estimacion si las imagenes de entrada difieren en iluminacion, calidad o campo de vision respecto al preprocesado utilizado en el entrenamiento.
- No incluye capacidades de explicabilidad integradas; para interpretar las predicciones seria necesario aplicar tecnicas externas (Grad-CAM, SHAP, etc.).
- El tamano del repositorio (3.9 GB) se debe a los diez checkpoints completos; la descarga puede ser pesada si solo se necesita una variante.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/mehmetaytugyuruk/retina-resnet-age-estimation
- Repositorio de GitHub: https://github.com/mehmetaytugyuruk/retina-resnet-age-estimation
- Articulo en IEEE Xplore: https://ieeexplore.ieee.org/document/11418414
- DOI del articulo: https://doi.org/10.1109/IISEC69317.2026.11418414
- Dataset Retina Age Analysis: https://huggingface.co/datasets/ramankamran/retina-age-analysis
- Estudio complementario con Vision Transformers: https://huggingface.co/mehmetaytugyuruk/retina-vit-age-estimation
- Pagina personal del autor: https://mehmetaytugyuruk.github.io/

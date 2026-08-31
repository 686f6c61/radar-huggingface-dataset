# Ruvadev/Raven

## Resumen

Raven es un modelo de clasificación de imágenes especializado en forensia digital, desarrollado por el usuario Ruvadev y publicado en HuggingFace. Su función principal es distinguir entre fotografías reales e imágenes generadas por inteligencia artificial, con una salida ternaria que clasifica cada imagen como `REAL`, `AI` o `UNCERTAIN` en función de la probabilidad estimada de que haya sido generada por un modelo de IA. El modelo está entrenado específicamente con imágenes producidas por GPT Image 2, lo que lo hace especialmente preciso para esa familia de generadores.

La arquitectura se basa en DINOv2, un modelo de visión por computadora de Meta, adaptado para la tarea de clasificación binaria con umbrales de incertidumbre. Con aproximadamente 22,9 millones de parámetros y un peso de solo 0,2 GB, es un modelo ligero que puede ejecutarse en hardware modesto. Su relevancia actual radica en la creciente necesidad de herramientas de verificación de autenticidad de imágenes en un contexto de proliferación de contenido sintético de alta calidad.

El modelo se distribuye con un script de inferencia incluido en el repositorio, lo que facilita su uso directo. Aunque la licencia no está especificada, el autor proporciona código de ejemplo y documentación en coreano. Raven no debe considerarse una prueba absoluta de origen de una imagen, sino una herramienta probabilística de apoyo en análisis forense.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 (vision transformer) adaptado para clasificacion ternaria |
| Parametros totales | 22.898.514 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Raven se construye sobre DINOv2, un transformer de vision preentrenado de forma autosupervisada por Meta AI. La arquitectura original se adapta añadiendo una cabeza de clasificacion que produce una probabilidad de que la imagen sea generada por IA. El modelo genera una salida continua `p(AI)` que se convierte en un veredicto discreto mediante umbrales: `REAL` si `p(AI) <= 0.28`, `UNCERTAIN` si `0.28 < p(AI) < 0.72`, y `AI` si `p(AI) >= 0.72`.

Los datos de entrenamiento no se detallan en la model card, pero se indica que el conjunto de imagenes etiquetadas como `AI` se compone exclusivamente de imagenes generadas con GPT Image 2. El conjunto de validacion contiene 4.470 imagenes (3.003 reales y 1.467 generadas). No se menciona el uso de tecnicas como RLHF o DPO, ya que es un modelo de clasificacion supervisada clasica. La innovacion principal reside en el esquema de clasificacion ternaria con zona de incertidumbre, que reduce errores criticos al permitir que el modelo se abstenga cuando no tiene suficiente confianza.

## Capacidades

- Clasificacion de imagenes en tres categorias: `REAL`, `AI` y `UNCERTAIN`, con probabilidades asociadas.
- Deteccion especifica de imagenes generadas por GPT Image 2, con alta precision en ese dominio.
- Salida probabilistica continua (`ai_probability` y `real_probability`) que permite ajustar los umbrales segun la aplicacion.
- Inferencia sobre imagenes individuales mediante un script de Python incluido en el repositorio.
- Capacidad de abstencion (clase `UNCERTAIN`) para reducir falsos positivos y negativos en casos ambiguos.
- Funcionamiento como modelo de vision puro, sin dependencias de procesamiento de lenguaje natural.

## Casos de uso

- Moderacion de contenido en plataformas sociales: Raven puede integrarse en pipelines de revision para marcar imagenes sospechosas de ser generadas por IA, priorizando la revision humana en los casos clasificados como `UNCERTAIN`.
- Verificacion de autenticidad en periodismo: los medios pueden usar Raven como primera linea de filtrado para detectar imagenes potencialmente sinteticas en noticias, reduciendo el riesgo de difundir desinformacion visual.
- Auditoria de campañas publicitarias: las agencias pueden comprobar si las imagenes de sus anuncios han sido generadas por IA, lo que puede ser relevante para requisitos legales de transparencia.
- Analisis forense en investigaciones legales: Raven puede servir como herramienta de apoyo para peritos que necesiten evaluar la probabilidad de que una imagen sea sintetica, complementando otros metodos de analisis.
- Control de calidad en bancos de imagenes: los proveedores de stock pueden filtrar imagenes generadas por IA que no cumplan con sus politicas de contenido.
- Investigacion academica sobre deteccion de contenido sintetico: Raven puede utilizarse como modelo de referencia o componente en estudios comparativos de tecnicas de forensia digital.

## Benchmarks y rendimiento

Los resultados presentados por el autor se basan en un conjunto de validacion de 4.470 imagenes (3.003 reales y 1.467 generadas por GPT Image 2). Se reportan las siguientes metricas:

| Metrica | Resultado | IC 95% |
|---|---|---|
| Accuracy | 98.635% | 98.251% - 98.936% |
| Balanced Accuracy | 98.566% | 98.159% - 98.935% |
| AUROC | 0.998255 | 0.997220 - 0.999083 |
| Balanced AP | 0.998472 | 0.997685 - 0.999135 |
| Recall de AI confirmado | 97.001% | 95.998% - 97.758% |
| Recall de REAL confirmado | 97.502% | 96.881% - 98.003% |
| Error AI a REAL | 0.954% | 0.569% - 1.596% |
| Error REAL a AI | 0.599% | 0.379% - 0.946% |
| Cobertura | 98.054% | - |
| Accuracy selectiva | 99.207% | - |
| Uncertain | 1.946% | - |
| Balanced Brier | 0.011403 | - |
| Balanced ECE | 0.005572 | - |

Adicionalmente, se evaluo un conjunto separado de 2.986 imagenes reales, obteniendo una accuracy del 98.225% y un error REAL a AI del 1.038%. Tambien se analizo el rendimiento por niveles de iluminacion, con accuracy que oscila entre 96.429% (imagenes extremadamente oscuras) y 99.331% (imagenes oscuras), aunque el grupo de imagenes extremadamente oscuras es pequeno (n=28) y sus resultados tienen mayor incertidumbre.

No se han publicado comparaciones con otros detectores de imagenes generadas por IA en la informacion disponible.

## Requisitos de hardware

- Con 22,9 millones de parametros, el modelo ocupa aproximadamente 92 MB en precision fp32 y unos 46 MB en fp16, por lo que cabe en cualquier GPU moderna e incluso en CPU.
- VRAM estimada: menos de 1 GB para inferencia en fp32; no se requieren GPUs de alta gama.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o superiores). Tambien puede ejecutarse en CPU con tiempos de inferencia aceptables para imagenes individuales.
- Opciones de despliegue: el repositorio incluye un script de inferencia basado en PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos especificos, pero dado el tamano del modelo, la inferencia en GPU deberia ser inferior a 100 ms por imagen en hardware moderno.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Existen otros detectores de imagenes generadas por IA (como aquellos basados en CLIP o en redes neuronales convolucionales especificas), pero no se han encontrado datos publicados que permitan una comparacion directa con Raven en terminos de arquitectura, rendimiento o licencia. Por tanto, esta seccion queda pendiente de datos adicionales.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con imagenes generadas por GPT Image 2. Su rendimiento con otros generadores (Midjourney, FLUX, Stable Diffusion, etc.) no esta verificado y probablemente sea inferior.
- No se garantiza un rendimiento adecuado en imagenes con fuerte recompresion JPEG, capturas de pantalla, imagenes upscaled, con reduccion de ruido, con correccion de color excesiva o con composiciones parciales (solo una parte de la imagen es sintetica).
- Las imagenes muy oscuras pueden producir resultados menos fiables, como se observa en el grupo `extreme-dark` del analisis de iluminacion.
- La salida del modelo es una probabilidad, no una prueba definitiva. No debe utilizarse como evidencia absoluta de que una imagen fue generada por IA.
- La licencia no esta especificada, lo que genera incertidumbre sobre los terminos de uso comercial y redistribucion.
- No se proporcionan datos sobre sesgos demograficos o culturales en el conjunto de entrenamiento, aunque al ser un modelo de vision podria presentar sesgos en la deteccion segun el tipo de contenido.
- El modelo no distingue entre diferentes tipos de manipulacion (por ejemplo, edicion parcial con herramientas tradicionales) y solo aborda la generacion completa por IA.

## Enlaces

- HuggingFace: https://huggingface.co/Ruvadev/Raven
- Repositorio de codigo: no se ha encontrado un repositorio GitHub u otro enlace oficial mas alla de la pagina de HuggingFace.

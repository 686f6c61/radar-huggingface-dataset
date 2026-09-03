# Addax-Data-Science/SOCAL-IRC-v3-6

## Resumen

El modelo SOCAL-IRC-v3-6 es un clasificador de imágenes basado en EfficientNetV2 Small, desarrollado por Irvine Ranch Conservancy (IRC) de Orange County, California, y redistribuido por Addax Data Science para su integración con la plataforma AddaxAI. Está diseñado para identificar 18 clases de especies animales a partir de imágenes de cámaras trampa, una herramienta clave para el monitoreo ecológico automatizado. El modelo se entrenó con el framework MEWC (Monitoring-Research IRC Species Classification) y alcanza una precisión global del 96,9% y un F1 macro de 0,966 en un conjunto de prueba retenido de 3.669 imágenes.

La relevancia de este modelo radica en su aplicación directa en conservación y gestión de fauna: permite convertir fotografías de cámaras trampa en datos ecológicos estructurados sin intervención manual. Al estar licenciado bajo CC BY-NC 4.0, su uso está restringido a fines no comerciales, lo que lo hace accesible para investigación y proyectos de conservación. El repositorio en HuggingFace incluye los pesos originales, un script de inferencia para TensorFlow y un mapeo de taxonomías resuelto contra GBIF.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2 Small (entrada 384x384 píxeles) |
| Parametros totales | no disponible (EfficientNetV2 Small ≈ 24M, no confirmado) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 384x384) |
| Tipos de cuantizacion | no disponible (pesos en formato Keras .keras) |
| Idiomas soportados | no aplica (clasificación de imágenes, sin texto) |
| Licencia | CC BY-NC 4.0 (no comercial) |
| Formato de pesos | Keras .keras (TensorFlow) |

## Arquitectura y entrenamiento

El modelo emplea EfficientNetV2 Small, una arquitectura convolutional eficiente que equilibra precisión y coste computacional mediante bloques MBConv y Fused-MBConv. La entrada es una imagen de 384x384 píxeles, resolución superior a la estándar de 224x224, lo que permite capturar detalles finos de las especies. El entrenamiento se realizó con el framework MEWC, una herramienta específica para clasificación de especies en cámaras trampa, que gestiona el etiquetado, el aumento de datos y la validación. Se entrenaron 18 clases, cuyos nombres se emiten en minúsculas y siguen el orden alfabético del LabelEncoder de scikit-learn, no el orden de la tabla de entrenamiento.

No se ha publicado información detallada sobre el número de imágenes de entrenamiento, la composición del dataset ni el proceso de optimización (si se usó fine-tuning desde pesos preentrenados de ImageNet). El archivo de pesos `IRC.Species.Classification.Model.keras` es el asset original de la versión v3.6.1 del repositorio GitHub del desarrollador, con hash SHA-256 `9ca887db2dac4067a532465e6cc18e71320639123c2a3d2d8bb42ce8ba1af6af`, lo que garantiza que no ha sido modificado.

## Capacidades

- Clasificación de 18 clases de especies animales a partir de imágenes de cámaras trampa.
- Inferencia sobre fotografías individuales o lotes de imágenes, con soporte para script de Python (`inference.py`) que implementa la interfaz ModelInference de AddaxAI.
- Mapeo de clases a taxonomías (taxonomy.csv) resuelto contra GBIF, lo que facilita la integración en árboles de filtrado ecológico.
- Salida con etiquetas de clase en minúsculas y orden alfabético, coherente con el formato de lectura de mewc-predict.
- Compatible con el ecosistema de AddaxAI para procesamiento de imágenes de vida silvestre (cámaras trampa, videos).
- No incluye capacidades de procesamiento de lenguaje natural, tool calling, agentes ni razonamiento multi-paso; es un modelo puramente discriminativo de visión.

## Casos de uso

- Monitoreo de biodiversidad en reservas naturales: el modelo procesa automáticamente miles de imágenes de cámaras trampa para censar especies presentes en el área, reduciendo horas de revisión manual.
- Estudios de ocupación y abundancia de fauna: los resultados de clasificación alimentan modelos estadísticos de ocupación (p. ej., occupancy models) para estimar distribuciones y tamaños poblacionales.
- Detección de especies invasoras o en riesgo: al clasificar en tiempo real, permite alertar sobre la presencia de especies no nativas o amenazadas, facilitando intervenciones de gestión.
- Evaluación de impacto ambiental: antes y después de obras o perturbaciones, el modelo compara la composición de especies en imágenes para medir cambios en la comunidad faunística.
- Educación y divulgación científica: las clasificaciones automáticas pueden usarse para generar reportes visuales y material didáctico sobre la fauna local.
- Integración en pipelines de ciencia ciudadana: organizaciones que recopilan fotos de cámaras trampa pueden usar el modelo para etiquetar automáticamente las imágenes antes de la validación por expertos, acelerando la curación de datos.

## Benchmarks y rendimiento

El desarrollador reporta resultados sobre un conjunto de prueba retenido de 3.669 imágenes:

| Metrica | Valor |
|---|---|
| Precisión global | 96,9% |
| F1 macro | 0,966 |

No se han publicado comparaciones con otros modelos de clasificación de especies en la información disponible. Estos números provienen del README del desarrollador y se refieren a la versión v3.6.1 del modelo.

## Requisitos de hardware

- Tamaño del archivo de pesos: 0.1 GB (repo completo), lo que indica un modelo ligero, adecuado para inferencia en CPU.
- VRAM estimada: con EfficientNetV2 Small y entrada 384x384, se estima un uso de memoria de entre 1 y 2 GB en FP32, dependiendo del batch size. No se han publicado mediciones exactas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) puede ejecutar la inferencia con batch pequeño. Para procesamiento masivo, una GPU de 8 GB (RTX 3070, RTX 2080) permite batches mayores y mayor throughput.
- En CPU: es viable para inferencia en lotes pequeños (menos de 10 imágenes por segundo en hardware moderno), pero para grandes volúmenes se recomienda GPU.
- Opciones de despliegue: el script `inference.py` proporciona una implementación lista para usar con backend TensorFlow. También puede integrarse en servicios como TensorFlow Serving, o exportarse a TFLite para despliegue en edge devices.
- Latencia y throughput: no se han publicado mediciones oficiales. Como referencia, EfficientNetV2 Small a 384x384 suele procesar ~50-100 imágenes por segundo en una GPU moderna (p. ej., RTX 3090) con batch de 32, pero estos valores son estimaciones.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de clasificación de especies de cámaras trampa en la información proporcionada. Existen alternativas comerciales y académicas como MegaDetector (de Microsoft, enfocado en detección de animales/vehículos/personas) o modelos de Wildlife Insights, pero no se conocen métricas equivalentes para una comparación rigurosa. Se recomienda evaluar el modelo en el conjunto de datos propio antes de seleccionarlo.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: el uso comercial está prohibido. Cualquier aplicación con fines lucrativos requiere permiso explícito del titular de los derechos (Irvine Ranch Conservancy).
- Especialización geográfica: el modelo fue entrenado con datos de la reserva de Irvine Ranch (California, EE. UU.). Puede presentar menor precisión en otras regiones con fauna diferente o condiciones de iluminación/vegetación distintas.
- Número limitado de clases: solo 18 especies. No reconoce otras especies presentes en el área ni especies de otras zonas.
- Riesgo de sesgo en los datos de entrenamiento: no se ha publicado información sobre la distribución de clases ni posibles desequilibrios, lo que podría afectar a clases raras.
- Sin capacidad de explicabilidad: al ser una red convolucional profunda, no ofrece explicaciones sobre qué características visuales condujeron a la clasificación, lo que puede ser un problema en contextos científicos que requieren trazabilidad.
- Dependencia de la calidad de imagen: las cámaras trampa pueden producir imágenes borrosas, con oclusiones o en condiciones de poca luz; el rendimiento en tales casos no está documentado.
- Formato de pesos propietario: el archivo `.keras` requiere Keras 3.3.3 o compatible; la conversión a otros formatos (ONNX, TensorRT) no está documentada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Addax-Data-Science/SOCAL-IRC-v3-6
- Repositorio GitHub del desarrollador (IRC): https://github.com/Monitoring-Research-IRC/irc-species-classification-model
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
- Citación del modelo: https://github.com/Monitoring-Research-IRC/irc-species-classification-model#citation
- AddaxAI (plataforma de integración): https://addaxdatascience.com/addaxai/
- Addax Data Science (sitio principal): https://addaxdatascience.com/

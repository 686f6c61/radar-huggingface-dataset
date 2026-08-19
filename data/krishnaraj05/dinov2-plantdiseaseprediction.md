# krishnaraj05/DinoV2-PlantDiseasePrediction

## Resumen

DinoV2-PlantDiseasePrediction es un modelo de clasificación de enfermedades de plantas desarrollado por krishnaraj05 y publicado en Hugging Face bajo licencia MIT. Se basa en la arquitectura DINOv2 de Meta, un modelo de visión por computadora de tipo transformer que aprende representaciones visuales autosupervisadas de alta calidad. El modelo está diseñado para predecir enfermedades en cultivos a partir de imágenes de hojas, un problema relevante para la agricultura de precisión y la detección temprana de plagas.

El repositorio tiene un tamaño de aproximadamente 1 GB, lo que sugiere que se distribuye con pesos completos en formato safetensors o similar, aunque no se especifica explícitamente. La información disponible es limitada: no se detallan el número de parámetros, la longitud de contexto (al ser un modelo de visión, el concepto de contexto se refiere al tamaño de imagen de entrada) ni los datos de entrenamiento. Aun así, su publicación reciente (agosto de 2026) y su licencia permisiva lo convierten en una opción accesible para experimentación en el ámbito agrícola.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 (transformer de vision, basado en ViT) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (tamano de imagen de entrada no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de vision, no de texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

DINOv2 es un modelo de vision por computadora desarrollado por Meta AI que utiliza una arquitectura de transformer (ViT) entrenada de forma autosupervisada con el objetivo de aprender representaciones visuales genericas y transferibles. El modelo base de DINOv2 se entrena con millones de imagenes sin etiquetar mediante tecnicas como el aprendizaje contrastivo y la destilacion de conocimiento. En el caso de este repositorio, el autor ha adaptado DINOv2 para la tarea especifica de clasificacion de enfermedades de plantas, anadiendo probablemente una cabeza de clasificacion y fine-tuning con un dataset de imagenes de hojas enfermas y sanas.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de epocas, ni si se utilizaron tecnicas de aumento de datos o regularizacion. Tampoco se especifica si el modelo fue entrenado desde cero o si se parte de los pesos preentrenados de DINOv2, aunque lo mas probable es que se trate de un fine-tuning sobre el modelo base.

## Capacidades

- Clasificacion de enfermedades de plantas a partir de imagenes de hojas.
- Deteccion de multiples clases de enfermedades (el numero exacto de clases no esta disponible).
- Inferencia sobre imagenes individuales, adecuada para aplicaciones de diagnostico agricola.
- Al estar basado en DINOv2, hereda una buena capacidad de extraccion de caracteristicas visuales generales, lo que puede facilitar la transferencia a otros dominios vegetales.
- No soporta procesamiento de texto, audio ni generacion de lenguaje natural.

## Casos de uso

- Diagnostico agricola en campo: un agricultor puede fotografiar una hoja con su movil y obtener una prediccion de la enfermedad, permitiendo una actuacion temprana y reduciendo perdidas de cosecha.
- Integracion en sistemas de monitoreo automatizado: el modelo puede desplegarse en drones o camaras fijas para analizar cultivos de forma continua y alertar sobre brotes de enfermedades.
- Aplicacion web de consulta: se puede construir una interfaz web donde los usuarios suban imagenes y reciban el diagnostico junto con recomendaciones de tratamiento.
- Investigacion agronomica: los investigadores pueden utilizar el modelo como herramienta de apoyo para clasificar grandes volumenes de imagenes de campo y estudiar la prevalencia de enfermedades.
- Educacion y extension rural: organizaciones agricolas pueden emplear el modelo en programas de capacitacion para ensenar a identificar enfermedades visualmente.
- Desarrollo de APIs de vision por computadora: el modelo puede servir como componente de un servicio de clasificacion de imagenes en la nube, combinado con otros modelos para un analisis integral del cultivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como exactitud, precision, recall o F1 sobre conjuntos de datos estandar (p. ej., PlantVillage). Tampoco hay comparaciones con otros modelos de deteccion de enfermedades de plantas.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al tratarse de un modelo de vision de tipo ViT, es probable que requiera entre 2 y 8 GB de VRAM dependiendo del tamano del modelo base (DINOv2 tiene variantes de 21M, 86M, 300M y 1.1B parametros). El tamano del repositorio (1 GB) sugiere una variante de tamano medio o grande.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 3070, RTX 4060) seria suficiente para inferencia en la mayoria de los casos. Para entrenamiento o fine-tuning, se recomendaria una GPU con 16 GB o mas (RTX 4080, RTX 4090, A100).
- Si cabe en consumer GPU: probablemente si, en las variantes mas pequenas de DINOv2, pero no hay confirmacion para este modelo concreto.
- Opciones de despliegue: al ser un modelo de vision, se puede servir con frameworks como TorchServe, FastAPI, o mediante ONNX Runtime. No se menciona soporte para vLLM, llama.cpp u Ollama, que son tipicos de modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa cuantitativa con otros modelos de deteccion de enfermedades de plantas. Existen alternativas como:

- Modelos basados en ResNet o EfficientNet fine-tuned sobre PlantVillage.
- DINOV2-FCS (mencionado en los resultados de busqueda), un modelo especifico para clasificacion de enfermedades en hojas de frutales que incorpora un modulo de fusion de caracteristicas de clase-parche.

Sin embargo, no se conocen los parametros ni el rendimiento de estos modelos en comparacion con el de krishnaraj05. Se recomienda consultar la documentacion de cada uno para una evaluacion adecuada.

## Limitaciones y advertencias

- No se dispone de informacion sobre el dataset de entrenamiento, por lo que se desconoce la cobertura de especies vegetales y enfermedades. El modelo podria no generalizar bien a cultivos o patologias no representadas en los datos de entrenamiento.
- Riesgo de sesgo: si el dataset de entrenamiento esta desequilibrado (p. ej., mas imagenes de una enfermedad que de otras), el modelo podria tener un rendimiento desigual entre clases.
- Alucinacion visual: como cualquier modelo de clasificacion, puede producir falsos positivos o negativos, especialmente en imagenes con condiciones de iluminacion o angulos inusuales.
- No se especifica el tamano de imagen de entrada esperado; usar imagenes con resoluciones muy diferentes a las de entrenamiento podria degradar el rendimiento.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario es responsable de validar el modelo en su caso de uso especifico antes de desplegarlo en produccion.
- No se proporcionan instrucciones de uso ni ejemplos de codigo en la model card, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/krishnaraj05/DinoV2-PlantDiseasePrediction
- Proyecto relacionado en GitHub (AGMatrix/Plant-Disease-Detection): https://github.com/AGMatrix/Plant-Disease-Detection
- Paper sobre DINOV2-FCS (modelo similar): https://www.researchgate.net/publication/387228023_DINOV2-FCS_a_model_for_fruit_leaf_disease_classification_and_severity_prediction
- Video demostrativo de un sistema de deteccion de enfermedades de plantas: https://www.youtube.com/watch?v=CZ0LiELusDc

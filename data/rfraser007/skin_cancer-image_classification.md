# Rfraser007/Skin_Cancer-Image_Classification

## Resumen

El modelo `Rfraser007/Skin_Cancer-Image_Classification` es un clasificador de imágenes médicas basado en la arquitectura Vision Transformer (ViT), desarrollado por el usuario Rfraser007. Está diseñado específicamente para la clasificación de imágenes dermatoscópicas de lesiones cutáneas en siete categorías: queratosis benignas, carcinoma basocelular, queratosis actínicas, lesiones vasculares, nevos melanocíticos, melanoma y dermatofibroma.

El modelo parte del checkpoint preentrenado de Google ViT con parches de 16x16 píxeles y entrenado sobre ImageNet-21k, al que se le ha sustituido la cabeza de clasificación para adaptarlo a la tarea de clasificación de cáncer de piel. Se ha ajustado sobre el dataset público de Marmal88 en Hugging Face durante 5 épocas, alcanzando una precisión de validación del 96,95 %. Su relevancia radica en que ofrece un punto de partida accesible y con licencia Apache 2.0 para experimentar con diagnóstico asistido por imagen en dermatología, aunque su uso clínico real requeriría una validación mucho más exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con parches de 16x16, basado en Google ViT preentrenado en ImageNet-21k |
| Parametros totales | 85.804.039 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors de precision completa) |
| Idiomas soportados | no aplica (modelo de clasificacion de imagenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Vision Transformer (ViT) original de Google, concretamente la variante con parches de 16x16 píxeles preentrenada en el dataset ImageNet-21k. La cabeza de clasificación original se ha reemplazado por una nueva capa totalmente conectada adaptada a las 7 clases de lesiones cutáneas. El modelo procesa imágenes de entrada dividiéndolas en parches de 16x16 píxeles, que se proyectan linealmente y se alimentan a un transformer estándar con atención multi-cabeza.

El entrenamiento se realizó sobre el dataset de Marmal88, que contiene imágenes dermatoscópicas etiquetadas en las 7 categorías mencionadas. Se utilizó el optimizador Adam con una tasa de aprendizaje de 1e-4, función de pérdida de entropía cruzada, batch size de 32 y un total de 5 épocas. No se menciona el uso de técnicas de aumento de datos, regularización adicional, o ajuste fino de capas específicas; el proceso se limita a un fine-tuning completo del modelo preentrenado.

## Capacidades

- Clasificacion de imagenes dermatoscopicas en 7 categorias de lesiones cutaneas: queratosis benignas, carcinoma basocelular, queratosis actinicias, lesiones vasculares, nevos melanociticos, melanoma y dermatofibroma.
- Extraccion de caracteristicas visuales de alto nivel gracias a la representacion aprendida por ViT en ImageNet-21k.
- Inferencia sobre imagenes individuales (sin procesamiento por lotes obligatorio).
- Capacidad de transferencia limitada a dominios visuales similares (dermatologia, imagenes medicas en general) si se realiza fine-tuning adicional.
- No soporta generacion de texto, tool calling, agentes, ni capacidades multimodales mas alla de la entrada de imagenes.

## Casos de uso

- Triaje dermatologico asistido: el modelo puede preclasificar imagenes de lesiones cutaneas capturadas con dermatoscopios o camaras de movil, priorizando los casos con mayor probabilidad de malignidad para revision clinica urgente.
- Herramienta de apoyo diagnostico para medicos de atencion primaria: ante una lesion dudosa, el profesional puede obtener una segunda opinion automatica basada en la clasificacion del modelo, complementando su evaluacion visual.
- Educacion medica y formacion de residentes: el modelo puede utilizarse como herramienta interactiva para que estudiantes de dermatologia practiquen la identificacion de distintos tipos de lesiones y comparen sus diagnósticos con la prediccion del modelo.
- Investigacion en epidemiologia dermatologica: aplicado sobre grandes colecciones de imagenes clinicas, permite estimar la distribucion de tipos de lesiones en poblaciones concretas, siempre que se valide previamente su rendimiento en ese dominio.
- Desarrollo de aplicaciones de telemedicina: integrable en plataformas de consulta remota donde el paciente envía una foto de la lesion y recibe una orientacion preliminar antes de acudir a consulta.
- Benchmark y comparativa de arquitecturas: al ser un modelo ViT de tamano moderado con licencia permisiva, sirve como punto de referencia para comparar el rendimiento de arquitecturas mas recientes o tecnicas de aumento de datos en clasificacion de imagenes medicas.

## Benchmarks y rendimiento

Los resultados publicados corresponden al proceso de entrenamiento del propio autor, con los siguientes valores por época:

| Epoca | Train Loss | Train Accuracy | Val Loss | Val Accuracy |
|---|---|---|---|---|
| 1/5 | 0,7168 | 0,7586 | 0,4994 | 0,8355 |
| 2/5 | 0,4550 | 0,8466 | 0,3237 | 0,8973 |
| 3/5 | 0,2959 | 0,9028 | 0,1790 | 0,9530 |
| 4/5 | 0,1595 | 0,9482 | 0,1498 | 0,9555 |
| 5/5 | 0,1208 | 0,9614 | 0,1000 | 0,9695 |

No se han publicado resultados en benchmarks estandarizados como MMLU, HumanEval o similares, ya que se trata de un modelo de vision por lo que dichos benchmarks no aplican. Tampoco se proporcionan metricas por clase (precision, recall, F1 por categoria), curva ROC o matriz de confusion, que serian necesarias para evaluar el rendimiento real en un contexto clinico.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un ViT-Base con aproximadamente 86 millones de parametros, la inferencia en precision FP32 requiere aproximadamente 350 MB de VRAM para el modelo, mas el espacio para el batch de imagenes. Con cuantizacion a FP16 o INT8, el consumo se reduce a unos 175 MB y 90 MB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia. Modelos como NVIDIA GTX 1650, RTX 3060 o superiores funcionan sin problemas. Para entrenamiento o fine-tuning, se recomienda al menos 8 GB de VRAM (RTX 3070, RTX 4060 Ti o superior).
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer moderna, incluso en CPU para inferencia puntual (aunque con mayor latencia).
- Opciones de despliegue: al ser un modelo safetensors estandar de vision, puede servirse con TorchServe, FastAPI con PyTorch, o mediante ONNX Runtime si se exporta. No es compatible directamente con vLLM, llama.cpp u Ollama, orientados a modelos de lenguaje.
- Latencia estimada: en una GPU moderna (RTX 3090 o superior), la inferencia sobre una imagen individual tarda entre 5 y 15 ms. En CPU, la latencia puede oscilar entre 200 ms y 1 segundo dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Dataset | Precision validacion | Licencia |
|---|---|---|---|---|---|
| Rfraser007/Skin_Cancer-Image_Classification | ViT-Base/16 | 85,8 M | Marmal88 skin_cancer | 96,95 % | Apache 2.0 |
| Anwarkh1/Skin_Cancer-Image_Classification | ViT (misma base) | no disponible | Marmal88 skin_cancer | no disponible | no disponible |
| Modelos CNN clasicos (HAM10000) | CNN custom | variable | HAM10000 | variable (70-90 % segun arquitectura) | variable |

No se dispone de informacion detallada sobre el modelo de Anwarkh1, que parece ser una variante del mismo enfoque. Los modelos CNN clasicos sobre HAM10000 suelen obtener precisiones inferiores a las de los ViT fine-tuned, aunque la comparativa no es directa por diferencias en el dataset y el preprocesado.

## Limitaciones y advertencias

- El modelo se ha entrenado durante solo 5 épocas sobre un dataset concreto; no se ha validado en entornos clinicos reales ni con poblaciones diversas, por lo que su rendimiento puede degradarse significativamente fuera del dominio de las imagenes de entrenamiento.
- No se proporcionan metricas por clase, lo que impide conocer si el modelo tiene sesgos hacia clases mayoritarias o confunde categorias de apariencia similar (p. ej., melanoma vs. nevos melanociticos).
- Riesgo de alucinacion: aunque el termino es mas propio de modelos de lenguaje, en vision por computadora el equivalente son los falsos positivos y negativos. Un falso negativo en melanoma podria tener consecuencias graves si el modelo se usa sin supervision clinica.
- El dataset de entrenamiento (Marmal88) es una version de HAM10000, que contiene imagenes dermatoscopicas de un conjunto limitado de poblaciones y equipos de captura. La generalizacion a otros dispositivos o tipos de piel no esta garantizada.
- No se especifica el tamaño de las imagenes de entrada esperadas ni el preprocesado necesario, lo que puede causar errores de inferencia si no se replica exactamente el pipeline de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el uso en diagnostico medico esta sujeto a regulaciones locales (MDR en Europa, FDA en EE. UU.) que este modelo no cumple.
- No se proporcionan pesos cuantizados ni versiones optimizadas para despliegue en edge, lo que limita su uso en dispositivos moviles o embebidos sin trabajo adicional de conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rfraser007/Skin_Cancer-Image_Classification
- Dataset de entrenamiento (Marmal88): https://huggingface.co/datasets/marmal88/skin_cancer
- Modelo similar de Anwarkh1: https://huggingface.co/Anwarkh1/Skin_Cancer-Image_Classification
- Articulo sobre modelos multimodales para clasificacion de cancer de piel (Nature): https://www.nature.com/articles/s43856-026-01456-2
- Proyecto de clasificacion de cancer de piel con CNN sobre HAM10000 (GitHub): https://github.com/UsmarHaider/100-ai-ml-projects/blob/main/projects/025-skin-cancer-classification/README.md
- Articulo sobre interpretabilidad en clasificacion de cancer de piel (Springer): https://link.springer.com/article/10.1007/s12652-025-04984-2

# phungthanhtu/rafdb-fer-adacm-400

## Resumen

Ada-CM sobre RAF-DB es un checkpoint de investigacion para reconocimiento de expresiones faciales (FER) entrenado con aprendizaje semisupervisado. Lo publica el usuario de Hugging Face `phungthanhtu` como parte de un estudio sobre el metodo Adaptive Confidence Margin (Ada-CM), y corresponde a la fila de 400 imagenes etiquetadas de su informe. El modelo resuelve el problema de entrenar un clasificador de expresiones faciales con un presupuesto de anotacion muy reducido, aprovechando 11.871 imagenes sin etiquetar del split de entrenamiento de RAF-DB.

La arquitectura es una ResNet-18 preentrenada en MS-Celeb-1M, con entrada de 224x224 y una cabeza de clasificacion de 7 clases (Surprise, Fear, Disgust, Happiness, Sadness, Anger, Neutral). No es un modelo generativo ni un LLM: es un clasificador de vision puro, empaquetado en `model.pt` junto con configuracion, nombres de clase y metricas, sin clases serializadas con pickle.

Su relevancia es acotada y experimental: reporta un 74,28% de exactitud y un macro-F1 de 64,89% con solo 400 etiquetas, lo que lo convierte en una referencia util para comparar estrategias de aprendizaje semisupervisado en FER, pero no en un componente listo para produccion. La model card restringe explicitamente el uso a investigacion sobre caras alineadas y prohibe su uso sobre personas en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN), entrada 224x224, preentrenada en MS-Celeb-1M |
| Parametros totales | no disponible (ResNet-18 estandar, aproximadamente 11,2 M incluyendo cabeza de 7 clases) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `model.pt` en precision de entrenamiento) |
| Idiomas soportados | no aplica (clasificador de imagenes; etiquetas en ingles) |
| Licencia | other (RAF-DB esta licenciado solo para investigacion no comercial) |
| Formato de pesos | `model.pt` (PyTorch, pesos + config + nombres de clase + metricas) |

## Arquitectura y entrenamiento

El modelo es una ResNet-18 preentrenada en MS-Celeb-1M y adaptada a clasificacion de 7 expresiones faciales sobre RAF-DB a 224x224. El entrenamiento combina 400 imagenes etiquetadas con 11.871 imagenes sin etiquetar del split de entrenamiento de RAF-DB, bajo el metodo Ada-CM (Adaptive Confidence Margin), una tecnica de aprendizaje semisupervisado que ajusta dinamicamente el umbral de confianza para generar pseudoetiquetas. La semilla del experimento es la 5, y se publican los pesos EMA finales.

El preprocesado de inferencia consiste en redimensionar el lado corto a 224, convertir a tensor y normalizar con `mean=[0.485, 0.456, 0.406]` y `std=[0.229, 0.224, 0.225]`. Durante el entrenamiento se usaron random resized crops y RandAugment, que no se aplican en inferencia. El repositorio incluye `model.py` con las funciones `load()` y `predict()`, y `example.py` como demo de linea de comandos; `load()` descarga los pesos, reconstruye la red y la devuelve en modo eval sin necesidad del pipeline de entrenamiento.

## Capacidades

- Clasificacion de expresiones faciales en 7 clases: Surprise, Fear, Disgust, Happiness, Sadness, Anger y Neutral.
- Inferencia sobre imagenes de cara alineadas, del mismo tipo que las de RAF-DB.
- Carga autocontenida: pesos, configuracion, nombres de clase y metricas en un unico `model.pt`, sin clases pickled.
- API minima de Python (`model.load`, `model.predict`) y demo CLI (`example.py face.jpg`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues, de generacion de texto, codigo, matematicas, vision general, audio ni modo thinking.
- No procesa video ni secuencias; es un clasificador de imagen unica.

## Casos de uso

- Reproduccion de experimentos de aprendizaje semisupervisado: cargar el checkpoint con `model.load()` y evaluar sobre el split de test de RAF-DB para contrastar la fila de 400 etiquetas del informe (74,28% de exactitud, macro-F1 64,89%).
- Linea base en estudios de FER con pocas etiquetas: comparar Ada-CM con otros metodos semisupervisados bajo el mismo presupuesto de 400 imagenes anotadas.
- Analisis de calibracion: el ECE de 0,181 en 10 bins permite estudiar la fiabilidad de las probabilidades en regimen de baja supervision.
- Prototipado de demos de investigacion: `example.py` permite pasar una imagen y obtener la clase predicha sin montar el pipeline de entrenamiento.
- Estudio de confusiones entre clases: util para analizar los errores sistematicos en Fear, Sadness y Neutral, que la model card identifica como las clases mas confundidas.
- Docencia y experimentacion con ResNet-18 en tareas de vision: el codigo standalone de `model.py` sirve como ejemplo minimo de carga e inferencia con `huggingface_hub`.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud en test (RAF-DB) | 74,28% |
| Macro-F1 | 64,89% |
| ECE (10 bins) | 0,181 |
| Imagenes etiquetadas | 400 |
| Imagenes sin etiquetar | 11.871 |
| Semilla | 5 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni desglose por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de cientos de MB para una ResNet-18 a 224x224 en FP32 con batch pequeno; no se especifica en la model card.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requieren A100 ni H100.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.), y probablemente en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch nativo mediante `model.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de otros modelos de FER ni variantes de Ada-CM con las que comparar parametros, contexto o rendimiento. El propio autor publica los presupuestos `phungthanhtu/rafdb-fer-adacm-{100,400,2000,4000}`, que serian la comparacion natural dentro del mismo estudio, pero no se aportan sus metricas.

## Limitaciones y advertencias

- Entrenado con solo 400 imagenes etiquetadas: es mas debil en Fear, Sadness y Neutral, las clases que mas se confunden segun el informe.
- Calibracion limitada: ECE de 0,181 en 10 bins indica que las probabilidades no son fiables como estimacion de confianza.
- Sesgos conocidos: no se documentan en la model card; al entrenar sobre RAF-DB hereda los sesgos de composicion demografica y de captura de ese dataset.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si hay riesgo de predicciones erroneas con alta confianza en caras fuera de distribucion.
- Restricciones de licencia: RAF-DB esta licenciado solo para investigacion no comercial; la model card prohibe explicitamente usar el checkpoint sobre personas en produccion.
- Uso previsto restringido a caras alineadas del mismo tipo que RAF-DB; no se garantiza su comportamiento con otras poses, iluminaciones o resoluciones.
- Solo se publica la semilla 5; el resto de semillas del estudio estan disponibles bajo peticion, lo que limita la reproducibilidad completa.
- Repositorio de 0,0 GB y sin descargas ni likes en el momento de la consulta: no hay evidencia de uso o validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-400
- Variantes del estudio: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-100, https://huggingface.co/phungthanhtu/rafdb-fer-adacm-2000, https://huggingface.co/phungthanhtu/rafdb-fer-adacm-4000
- Perfil del autor: https://huggingface.co/phungthanhtu
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales.

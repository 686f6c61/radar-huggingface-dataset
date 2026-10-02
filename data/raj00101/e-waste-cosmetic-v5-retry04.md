# raj00101/e-waste-cosmetic-v5-retry04

## Resumen

El modelo `raj00101/e-waste-cosmetic-v5-retry04` es un clasificador de visión por computador multitarea desarrollado por el usuario raj00101 dentro de un proyecto denominado E-Waste Classifier AI. Su función es evaluar el estado cosmético de dispositivos de residuos electrónicos (e-waste), asignando cada imagen a una de cuatro clases de condición (Poor, Fair, Good, Excellent) y, de forma simultánea, prediciendo una puntuación numérica continua en el rango 0-100. Se apoya en el backbone convolucional `tf_efficientnetv2_s` con una dimensión de características de 1280, y toma como entrada imágenes RGB de 512x512 píxeles.

El paquete se presenta como un modelo finalizado ("FINALIZED EXISTING MODEL"), seleccionado entre candidatos previamente evaluados de la versión V5, sin entrenamiento adicional durante la exportación. Incluye pesos de producción, checkpoint de entrenamiento completo, configuraciones de preprocesado e inferencia, una implementación de referencia en `inference.py` y manifiestos de integridad con sumas SHA256. El repositorio ocupa 0,2 GB y no registra descargas ni likes en el momento de la consulta.

Su relevancia radica en el ámbito de la clasificación automática de residuos electrónicos, un campo con literatura activa (detección con YOLO, VLMs y RAG aplicados al reciclaje). No obstante, las métricas publicadas por el autor son muy limitadas (exactitud del 56,52% y balanced accuracy del 26,67% sobre 23 dispositivos de test), y la propia model card documenta un desequilibrio severo en el conjunto de evaluación. Se desconoce la licencia y no se declaran idiomas ni pipeline de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S multitarea (clasificacion de condicion + regresion de score); backbone `tf_efficientnetv2_s` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen RGB 512x512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`); incluye `model.pt` y `complete_training_checkpoint.pt` |
| Dimension de caracteristicas | 1280 |
| Clases de condicion | Poor, Fair, Good, Excellent |
| Rango de score | 0-100 |
| Entrada | RGB 512x512 |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un modelo multitarea construido sobre el backbone convolucional EfficientNetV2-S (`tf_efficientnetv2_s`), del que se extrae un vector de características de 1280 dimensiones. Sobre esa representación, el modelo resuelve dos tareas simultáneas: una clasificación en cuatro clases de condición cosmética (Poor, Fair, Good, Excellent) y una regresión que produce una puntuación continua de 0 a 100. La entrada es una imagen RGB de 512x512 píxeles.

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset, el número de épocas completadas ni el uso de técnicas de ajuste como RLHF o DPO (no aplicables típicamente a un clasificador de visión). La model card menciona un checkpoint de origen en una ruta local (`.../efficientnetv2_s_multitask_v5_beta095_full129_epoch03_retry04/final_epoch03.pt`) y conserva su hash SHA256, lo que sugiere que el entrenamiento se detuvo en la época 3 de la variante "retry04". La selección final del modelo se documenta en `FINAL_MODEL_SELECTION_REPORT.json`, pero los criterios concretos de selección no se detallan en la información disponible. No se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.), ya que no se trata de un modelo de lenguaje.

## Capacidades

- Clasificación de imágenes de residuos electrónicos en cuatro clases de condición cosmética: Poor, Fair, Good y Excellent.
- Regresión multitarea: predicción de una puntuación continua de estado en el rango 0-100 para cada imagen.
- Procesamiento de imágenes RGB a 512x512 píxeles mediante un backbone EfficientNetV2-S.
- Inferencia reproducible: el paquete incluye `inference.py`, `inference_config.json` y `preprocessing.json` como implementación de referencia.
- Verificación de integridad: incluye `SHA256SUMS.json` y `PACKAGE_MANIFEST.json` para validar la procedencia de los artefactos.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, generación de texto, matemáticas, audio, vídeo ni procesamiento multilingüe, dado que es un modelo de visión especializado.
- No se declara soporte de agentes ni modo de razonamiento (thinking mode).

## Casos de uso

- Clasificación automática de estado cosmético en plantas de reciclaje: el modelo puede etiquetar cada dispositivo entrante como Poor, Fair, Good o Excellent a partir de una fotografía, permitiendo segmentar el flujo de materiales por calidad antes del desmantelamiento.
- Valoración preliminar de dispositivos para reacondicionamiento: combinando la clase de condición y el score 0-100, se puede priorizar qué equipos merecen reparación frente a los destinados a reciclaje de materiales.
- Triaje en plataformas de segunda mano: integrado en un flujo de subida de imágenes, el modelo puede sugerir automáticamente el estado declarado de un dispositivo y detectar discrepancias con la descripción del vendedor.
- Auditoría de lotes en logística inversa: al procesar imágenes de 512x512 de dispositivos recibidos, se puede generar un informe agregado de la distribución de condiciones de cada lote de recogida.
- Control de calidad en líneas de clasificación con cámara fija: la inferencia sobre imágenes RGB permite integrar el modelo en un pipeline de visión industrial para separar por estado (aunque el rendimiento limitado exige validación previa).
- Investigación y docencia en visión aplicada al reciclaje: el paquete incluye checkpoint completo, configuración y script de inferencia, lo que facilita reproducir experimentos y comparar con otros enfoques (YOLO, VLMs) citados en la literatura.
- Generación de datasets etiquetados de forma asistida: las predicciones pueden servir como preetiquetado preliminar, siempre con revisión humana, dado el bajo balanced accuracy documentado.

## Benchmarks y rendimiento

Los únicos datos disponibles son la evaluación final publicada por el autor sobre un conjunto de test de 23 dispositivos (56 imágenes originales, sin aumentos):

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 56,52% |
| Balanced accuracy | 26,67% |
| Macro-F1 | 25,48% |
| MAE | 12,099231 |
| RMSE | 16,304726 |
| R2 | 0,299867 |

Desglose por clase en el test (retry04):

| Clase | Correctos / Total |
|---|---|
| Poor | 0 / 1 |
| Fair | 0 / 1 |
| Good | 2 / 6 |
| Excellent | 11 / 15 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de visión especializado y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,2 GB, e incluye pesos de producción y checkpoint de entrenamiento, por lo que el modelo cabe holgadamente en cualquier GPU de consumo actual en precisión FP32/FP16 (las cifras exactas de VRAM no se declaran).
- GPU recomendadas: no especificadas por el autor. Dado el tamaño del backbone EfficientNetV2-S y la entrada de 512x512, es probable que funcione en GPUs de gama media y alta, pero no se aportan datos de latencia ni throughput.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; por el tamaño del paquete es razonable esperar que quepa en GPUs consumer, aunque no se documenta.
- Opciones de despliegue: el paquete incluye `inference.py` como implementación de referencia en PyTorch. No se mencionan vLLM, llama.cpp, Ollama, TGI ni formatos ONNX/TensorRT. No disponible información sobre exportación a otros runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de métricas comparables publicadas para este modelo frente a alternativas de la misma categoría. La model card no incluye comparaciones; la búsqueda web menciona otros enfoques de clasificación de e-waste (YOLOv5, YOLO personalizado, VLMs con RAG) pero sin datos que permitan una comparación cuantitativa directa. Por tanto:

| Modelo | Parametros | Contexto/Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e-waste-cosmetic-v5-retry04 | no disponible | imagen RGB 512x512 | accuracy 56,52%, balanced accuracy 26,67% | no disponible | HuggingFace (0 descargas) |
| Alternativas (YOLO, VLM+RAG, EfficientNetV2 estandar) | no disponible | no disponible | no disponible | no disponible | no disponible |

No disponible comparativa cuantitativa fiable con modelos similares.

## Limitaciones y advertencias

- Desequilibrio severo del conjunto de test: Poor y Fair solo cuentan con 1 dispositivo cada uno, y el modelo no acierta ninguno de los dos (0/1 y 0/1). El balanced accuracy del 26,67% refleja este problema crítico.
- Riesgo elevado de mala generalización: la exactitud del 56,52% sobre 23 dispositivos y 56 imágenes es baja para un clasificador de cuatro clases, y el R2 de 0,2999 en la tarea de regresión indica un ajuste pobre.
- Sesgo hacia la clase mayoritaria: 11 de 15 aciertos se concentran en la clase Excellent, lo que sugiere un sesgo hacia la clase dominante del conjunto de evaluación.
- Incertidumbre sobre la licencia: la licencia no está declarada, lo que por defecto implica ausencia de permisos explícitos para uso comercial. Debe aclararse antes de cualquier despliegue en producción.
- Idiomas no declarados: al ser un modelo de visión, la dimensión lingüística no aplica, pero no se documenta si las imágenes de entrenamiento cubren distintas regiones o condiciones de captura.
- Ausencia de datos de entrenamiento: no se especifican el volumen de datos, su composición ni las épocas completadas (el checkpoint sugiere época 3), lo que dificulta evaluar la madurez del modelo.
- Procedencia no verificable externamente: aunque el paquete incluye manifiestos SHA256, el entrenamiento se realizó en una ruta local de Google Drive y no hay paper ni informe público asociado.
- Sin métricas de latencia, throughput ni consumo: imposible estimar coste de despliegue a partir de la información proporcionada.
- No se documentan sesgos demográficos ni de otro tipo más allá del desequilibrio de clases.

## Enlaces

- HuggingFace: https://huggingface.co/raj00101/e-waste-cosmetic-v5-retry04
- GitHub relacionado (clasificador de e-waste con VLM y RAG): https://github.com/Pavneet54/ewaste-classifier
- Articulo cientifico sobre clasificacion de e-waste en tiempo real: https://www.sciencedirect.com/science/article/pii/S0921344924002453
- Articulo en Nature sobre clasificacion de e-waste con YOLO personalizable: https://www.nature.com/articles/s41598-025-94772-x
- Repositorio con notebook de deteccion de residuos con YOLOv5: https://github.com/jcm-ai/Real-time-Waste-Detection-System-An-End-to-End-YOLOv5-Solution/blob/main/research/Waste_Detection_Using_YOLO_v5.ipynb

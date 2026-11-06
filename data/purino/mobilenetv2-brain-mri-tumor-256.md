# Purino/mobilenetv2-brain-mri-tumor-256

## Resumen

`mobilenetv2-brain-mri-tumor-256` es un clasificador de imágenes médicas desarrollado por el usuario Purino, consistente en un MobileNetV2 de torchvision inicializado con pesos `IMAGENET1K_V2` y afinado para clasificación de cuatro clases sobre cortes de resonancia magnética cerebral. El modelo distingue entre glioma, meningioma, ausencia de tumor y tumor pituitario. Se publica como checkpoint de PyTorch (no como `AutoModel` de Transformers) e incluye el código de inferencia, la configuración de preprocesado y los resultados de evaluación en el repositorio.

Con 2.263.108 parámetros totales, es un modelo extremadamente ligero orientado a experimentación e investigación. La model card declara una accuracy de 0,9639 y un macro F1 de 0,9627 sobre un conjunto de test retenido de 499 imágenes del dataset "MRI for Brain Tumor with Bounding Boxes" de Kaggle, con un macro ROC-AUC OvR de 0,9988. El autor advierte explícitamente de que se trata de un clasificador de investigación sin validación clínica.

Su relevancia actual es la de un ejemplo reproducible de fine-tuning de visión por computador en dominio médico con recursos mínimos: el entrenamiento completo se realizó en dos Tesla T4 en 5,76 minutos. No es un modelo de propósito general ni compite en la categoría de los grandes modelos multimodales; su interés es metodológico y educativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (torchvision), CNN con bloques residuales invertidos y conexiones lineales de cuello de botella |
| Parametros totales | 2.263.108 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 256 x 256 píxeles RGB) |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors en precisión de entrenamiento; no se documentan variantes GGUF, ONNX ni INT8) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint de torchvision, no de Transformers) |

## Arquitectura y entrenamiento

La arquitectura es MobileNetV2, una red convolucional con bloques residuales invertidos y convoluciones separables en profundidad, aquí en su variante de torchvision con 2,26 millones de parámetros. La entrada es RGB redimensionada a 256 x 256 mediante letterbox resize, sin center crop, normalizada con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]` de ImageNet. La cabeza de clasificación se calienta durante 3 épocas con AdamW a LR 0,001 y después se realiza fine-tuning completo de hasta 25 épocas con LR de backbone 3e-05 y LR de clasificador 0,0003, scheduler warmup más coseno, weight decay 0,0001, label smoothing 0,05 y dropout 0,1. Las estadísticas de BatchNorm se congelan y solo se afinan los parámetros afines en la segunda etapa. Se usan pesos de clase calculados como `(N / (K * class_count)) ** 0.5` normalizados a media 1, calculados solo con datos de entrenamiento.

El entrenamiento se ejecutó en dos Tesla T4 con dos workers DDP, precisión mixta FP16, tensores channels-last y batch global de 64. La augmentación incluye rotación de ±10 grados, traslación de ±3 por ciento, escala 0,95-1,05, flip horizontal y jitter de brillo y contraste de ±10 por ciento solo en entrenamiento. El checkpoint se seleccionó por macro F1 de validación (desempate por entropía cruzada) en la época 18, con early stopping de paciencia 7 y semilla 42; el entrenamiento completo duró 5,76 minutos. El dataset es "MRI for Brain Tumor with Bounding Boxes" de Kaggle, con 2.895 imágenes de entrenamiento, 512 de validación y 499 de test tras eliminar 1.343 duplicados exactos. Las bounding boxes no se utilizan. La partición es a nivel de imagen, sin identificadores de paciente verificados.

## Capacidades

- Clasificación de imágenes de resonancia magnética cerebral en cuatro clases: glioma, meningioma, no_tumor y pituitary.
- Salida de logits antes de softmax, aptos para cálculo de mapas de activación de clase (CAM) con gradientes.
- Preprocesado reproducible incluido en el repositorio mediante `inference.py` y archivo de configuración.
- Inferencia en modo `inference_mode` para clasificación ordinaria.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta generación de texto, código ni matemáticas.
- No dispone de capacidades multilingües ni de procesamiento de audio o vídeo.
- No dispone de modo de razonamiento extendido (thinking mode).

## Casos de uso

- Prototipado académico de clasificación de tumores cerebrales: sirve como línea base reproducible para comparar arquitecturas CNN ligeras sobre el mismo dataset de Kaggle, con el protocolo de limpieza y partición documentado en la model card.
- Docencia en fine-tuning de visión médica: el entrenamiento completo cabe en dos T4 en menos de seis minutos, lo que permite demostrar en un taller el ciclo completo de inicialización con pesos de ImageNet, calentamiento de cabeza, fine-tuning y selección de checkpoint por macro F1.
- Generación de mapas de activación para inspección cualitativa: al devolver logits sin softmax, se pueden calcular CAM para visualizar qué regiones de la imagen influyen en la predicción, útil en ejercicios de interpretabilidad.
- Filtrado preliminar en pipelines de investigación: como clasificador de bajo coste (2,26 M de parámetros) puede preetiquetar cortes de RM en estudios retrospectivos antes de la revisión por un especialista, siempre con validación humana.
- Pruebas de robustez y sesgo de dataset: permite estudiar cómo afectan la deduplicación, el solapamiento de grupos y la ausencia de identificadores de paciente a las métricas reportadas, replicando el protocolo descrito.
- Despliegue en entornos con recursos muy limitados: su tamaño permite inferencia en CPU o en GPU de gama baja para demos y aplicaciones educativas, sin pretensión de uso clínico.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test retenido (499 imágenes, regla de decisión argmax, sin ajuste de umbral en test):

| Metrica | Valor |
|---|---|
| Accuracy | 0,963928 |
| Balanced accuracy | 0,960003 |
| Macro precision | 0,966365 |
| Macro recall | 0,960003 |
| Macro F1 | 0,962676 |
| Weighted F1 | 0,963819 |
| Log loss | 0,132556 |
| ROC-AUC macro OvR | 0,998801 |
| Average precision macro OvR | 0,996387 |

Desglose por clase:

| Clase | Soporte | Precision | Sensibilidad | F1 | Especificidad | ROC-AUC (OvR) |
|---|---:|---:|---:|---:|---:|---:|
| glioma | 136 | 0,977612 | 0,963235 | 0,970370 | 0,991736 | 0,999109 |
| meningioma | 134 | 0,942029 | 0,970149 | 0,955882 | 0,978082 | 0,997301 |
| no_tumor | 93 | 0,988372 | 0,913978 | 0,949721 | 0,997537 | 0,999258 |
| pituitary | 136 | 0,957447 | 0,992647 | 0,974729 | 0,983471 | 0,999534 |

El intervalo de confianza de Wilson al 95 por ciento para accuracy, asumiendo independencia a nivel de imagen, es [0,943704, 0,977063]; el autor advierte de que puede ser demasiado optimista si las imágenes están correlacionadas por paciente. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo (2,26 M de parámetros) más el espacio de activaciones para lotes pequeños a 256 x 256.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en dos Tesla T4, y para inferencia basta una T4, una GTX 1650 o superior.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3050, RTX 4060, RTX 4090) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo con el `inference.py` incluido; exportación a TorchScript u ONNX no documentada en el repositorio; no se publican artefactos para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma oficial; el autor solo reporta 5,76 minutos de entrenamiento completo en dos T4 con batch global 64.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mobilenetv2-brain-mri-tumor-256 | 2.263.108 | 256 x 256 RGB | Clasificación 4 clases de RM cerebral | no disponible | Hugging Face |
| MobileNetV2 ImageNet (torchvision) | ~3,5 M | 224 x 224 RGB | Clasificación ImageNet 1000 clases | BSD-3-Clause (torchvision) | torchvision |
| ResNet-50 ImageNet (torchvision) | ~25,6 M | 224 x 224 RGB | Clasificación ImageNet 1000 clases | BSD-3-Clause (torchvision) | torchvision |

No se dispone de otros clasificadores de tumores cerebrales comparables en la información proporcionada; los modelos de torchvision se incluyen solo como referencia de arquitectura y tamaño, no como equivalentes en la tarea médica.

## Limitaciones y advertencias

- Modelo de investigación sin validación clínica: el autor indica explícitamente que no está destinado a tomar decisiones clínicas.
- Partición a nivel de imagen sin identificadores de paciente verificados: los resultados no establecen rendimiento en pacientes no vistos, y los intervalos de confianza pueden ser demasiado optimistas por correlación entre cortes del mismo paciente.
- La deduplicación por píxeles exactos no detecta imágenes recodificadas ni casi duplicadas; el agrupamiento por nombre de archivo no equivale a metadatos de paciente.
- Las métricas se refieren al holdout limpiado, cuyos recuentos pueden diferir de los del dataset original.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos negativos y positivos en la clasificación; la sensibilidad en la clase no_tumor es la más baja (0,9140).
- Sesgos conocidos: no documentados en la información disponible; el dataset de origen puede introducir sesgos de adquisición, equipo o población que no se analizan.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Restricciones de idioma no aplicables, pero el modelo solo procesa imágenes de RM en el formato y preprocesado documentados; otros protocolos de adquisición pueden degradar el rendimiento.
- El checkpoint es de torchvision, no de Transformers: no funciona con `AutoModel` ni con pipelines estándar de Hugging Face.
- El cálculo de CAM no debe envolverse en `inference_mode`, según advierte la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Purino/mobilenetv2-brain-mri-tumor-256
- Dataset en Kaggle: https://www.kaggle.com/datasets/ahmedsorour1/mri-for-brain-tumor-with-bounding-boxes
- Pesos de torchvision MobileNetV2: https://pytorch.org/vision/stable/models/mobilenetv2.html

# Ashapu/Alzheimer_Classification_Model

## Resumen

El modelo `Ashapu/Alzheimer_Classification_Model` es un clasificador de imágenes basado en la arquitectura ResNet-18, publicado por el usuario Ashapu en Hugging Face. Su propósito es la clasificación por etapas de la enfermedad de Alzheimer a partir de imágenes de resonancia magnética (MRI). El repositorio se distribuye con la librería PyTorch y declara la etiqueta de pipeline `image-classification`, orientada a un dominio médico y de neurociencia.

La model card reporta un rendimiento de validación de 79,55 % de accuracy y un F1-score ponderado de 0,79, lo que sitúa al modelo en un rango de utilidad exploratoria pero lejos de un uso clínico. No se especifica el número de clases, la composición exacta del dataset de entrenamiento, el tamaño de la imagen de entrada ni la procedencia de los datos MRI empleados.

El modelo resulta relevante como ejemplo de transferencia de una CNN clásica (ResNet-18, ~11,7 millones de parámetros) a una tarea de clasificación médica de cuatro o más categorías, y como punto de partida para experimentación en investigación neuroimagen. No obstante, la ausencia de documentación detallada, de métricas por clase y de validación externa limita seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN con conexiones residuales) |
| Parametros totales | ~11,7 millones (arquitectura ResNet-18 estándar; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | MIT (según la model card) |
| Formato de pesos | PyTorch (`library_name: pytorch`); formato de archivo concreto no disponible |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18, una red neuronal convolucional residual de 18 capas con bloques de identidad y proyección, ampliamente utilizada como línea base en clasificación de imágenes. El modelo se ha adaptado a la tarea de clasificación de estadios de Alzheimer sobre MRI, aunque no se detalla si se ha realizado fine-tuning completo o solo de la cabeza clasificadora, ni se especifica la resolución de entrada, el número de canales (probablemente 1 o 3) ni el número de clases de salida.

La información sobre el entrenamiento es muy escasa. La model card cita un dataset de nombre genérico `custom-alzheimers-mri-dataset` sin enlace, sin recuento de imágenes, sin proporciones de train/validation/test y sin indicar la fuente original (OASIS, ADNI u otra). No se documenta el uso de data augmentation, balanceo de clases, función de pérdida, hiperparámetros de optimización ni número de épocas. Tampoco se menciona ningún proceso de RLHF, DPO ni técnicas de explicabilidad (Grad-CAM, mapas de saliencia) que serían deseables en un contexto médico.

## Capacidades

- Clasificación de imágenes de resonancia magnética cerebral en estadios de Alzheimer (número exacto de clases no especificado).
- Salida de etiqueta de clase con probabilidades asociadas (comportamiento estándar de un clasificador softmax).
- Inferencia sobre imágenes individuales mediante PyTorch.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de generación de texto.
- No incorpora modo de razonamiento explícito (thinking mode), visión general, audio ni otras modalidades.
- No se documentan capacidades de segmentación, detección ni localización de regiones cerebrales.

## Casos de uso

- Investigación académica en neuroimagen: uso del modelo como línea base para comparar nuevas arquitecturas (ViT, EfficientNet, ConvNeXt) en la misma tarea de clasificación de estadios de Alzheimer.
- Prototipado de pipelines de preprocesado MRI: integración del modelo en un flujo que incluya normalización, registro y recorte de imágenes antes de la inferencia, para validar la viabilidad técnica del enfoque.
- Docencia y formación en deep learning médico: ejemplo práctico de fine-tuning de una CNN preentrenada sobre un dataset de imágenes médicas con métricas de accuracy y F1.
- Herramienta de triaje experimental (no clínico): generación de etiquetas preliminares sobre lotes de MRI para priorizar la revisión por parte de radiólogos en un entorno de investigación controlado.
- Análisis de sesgo y robustez: evaluación de cómo varía el rendimiento del modelo entre subgrupos demográficos o protocolos de adquisición de MRI, como paso previo a cualquier despliegue.
- Generación de datasets etiquetados de forma asistida: uso del modelo para preetiquetar grandes volúmenes de MRI que posteriormente serán revisados y corregidos manualmente por especialistas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Best Validation Accuracy | 79,55 % |
| Weighted F1-Score | 0,79 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparativas con otros modelos en el mismo dataset. Tampoco se aportan métricas por clase, matriz de confusión, sensibilidad, especificidad ni AUC-ROC, que serían imprescindibles en un contexto médico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para una ResNet-18 (~45 MB de pesos) más el espacio de activaciones para un batch pequeño; en la práctica, cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4090, A100 o H100 (estas dos últimas sobredimensionadas para este modelo).
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo, TorchScript, ONNX Runtime, TensorRT, o servidores de inferencia como TorchServe. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; en una GPU moderna se espera latencia de milisegundos por imagen, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ashapu/Alzheimer_Classification_Model | ResNet-18 | ~11,7 M | no aplica | 79,55 % accuracy (validación) | MIT | Hugging Face |
| ResNet-50 (fine-tuned en MRI) | ResNet-50 | ~25,6 M | no aplica | no disponible | varía según checkpoint | Amplia en Hugging Face |
| EfficientNet-B0 (fine-tuned en MRI) | EfficientNet | ~5,3 M | no aplica | no disponible | varía según checkpoint | Amplia en Hugging Face |
| ViT-Base (fine-tuned en MRI) | Vision Transformer | ~86 M | no aplica | no disponible | varía según checkpoint | Amplia en Hugging Face |

No se dispone de datos comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas en el mismo dataset. La comparativa anterior es estructural y de disponibilidad, no de rendimiento.

## Limitaciones y advertencias

- Rendimiento de validación moderado (79,55 % accuracy, F1 0,79): insuficiente para cualquier uso clínico o diagnóstico.
- Ausencia de validación externa: no se ha evaluado en un dataset independiente, por lo que el riesgo de sobreajuste al conjunto de validación es alto.
- Dataset de entrenamiento no documentado: se desconoce la procedencia, el tamaño, la distribución de clases y el equilibrio demográfico, lo que impide evaluar sesgos.
- Sesgos potenciales: al no documentarse la composición del dataset, no puede descartarse sesgo por edad, sexo, etnia, equipo de adquisición o protocolo de MRI.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de clasificaciones erróneas con alta confianza (falsos positivos/negativos) sin mecanismo de abstención.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Restricciones de licencia: la model card declara MIT, pero al no estar confirmada de forma inequívoca en los metadatos del repositorio, conviene verificar el archivo LICENSE antes de un uso comercial.
- Caveat para producción: no debe utilizarse como herramienta de diagnóstico ni como apoyo a decisiones clínicas sin validación regulatoria (marcado CE, FDA) y sin supervisión de personal médico cualificado.
- Falta de explicabilidad: no se documentan técnicas de interpretabilidad que permitan justificar las predicciones ante un clínico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ashapu/Alzheimer_Classification_Model
- Repositorio de PyTorch: https://github.com/pytorch/pytorch
- Paper original de ResNet (He et al., 2015): https://arxiv.org/abs/1512.03385
- Dataset OASIS (referencia habitual en MRI de Alzheimer): https://www.oasis-brains.org/
- Dataset ADNI (referencia habitual en MRI de Alzheimer): https://adni.loni.usc.edu/

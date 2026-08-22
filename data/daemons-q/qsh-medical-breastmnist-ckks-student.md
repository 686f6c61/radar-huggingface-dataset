# Daemons-Q/qsh-medical-breastmnist-ckks-student

## Resumen

El modelo `Daemons-Q/qsh-medical-breastmnist-ckks-student` es una CNN distilada de muy pequeño tamaño (3226 parámetros) diseñada para clasificación binaria de imágenes de ultrasonido de mama (benigno frente a maligno) sobre el conjunto de datos BreastMNIST de MedMNIST v2. Lo desarrolla Daemons-Q como parte del proyecto de investigación QSMPC-QKD-QHE-AI-Hybrid, una demostración de orquestación de seguridad cuántica que combina computación multipartita, distribución de claves cuánticas y cifrado homomórfico. Este modelo concreto es el «estudiante» de la capa cifrada: un modelo destilado del teacher ResNet-18, lo suficientemente pequeño para ser evaluado bajo cifrado CKKS real, con el objetivo de demostrar que la inferencia médica puede ejecutarse de forma privada sin exponer los datos en claro.

La arquitectura es una CNN mínima: un bloque convolucional (1→4 canales, kernel 3×3), una capa de agrupación promedio y una cabeza densa, con entrada de 14×14 píxeles. El modelo se publica en formato ONNX y safetensors, y su pipeline es `image-classification`. Está pensado para ejecutarse en el navegador mediante onnxruntime-web, lo que permite evaluar la convolución cifrada bajo CKKS en un entorno accesible. Su relevancia actual radica en que demuestra la viabilidad de combinar cifrado homomórfico y modelos de visión médica, aunque su rendimiento está muy por debajo de los baselines clásicos, como se detalla en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN mínima: 1 bloque conv (1→4 canales, 3×3), avg-pool, cabeza densa |
| Parámetros totales | 3226 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (no aplica, es clasificador de imágenes) |
| Licencia | CC-BY-4.0 afirmada por MedMNIST; la licencia del dataset original BUSI no es verificable |
| Formato de pesos | ONNX, safetensors |

## Arquitectura y entrenamiento

La arquitectura es una CNN deliberadamente sencilla para minimizar el coste de la evaluación bajo cifrado homomórfico. Se compone de un único bloque convolucional que pasa de 1 a 4 canales con kernel 3×3, seguido de una capa de agrupación promedio y una cabeza densa de clasificación binaria. La entrada es de 14×14 píxeles, una reducción del 28×28 original del dataset BreastMNIST, elegida para que la operación im2col y los productos escalares CKKS sean computacionalmente asequibles.

El entrenamiento se realiza por destilación a partir de un modelo profesor ResNet-18 (11 171 266 parámetros) sobre el dataset BreastMNIST v2, que contiene 780 imágenes en total. El estudiante se entrena con pérdida ponderada por clase y selección de modelo basada en AUC, según se documenta en la model card. El dataset presenta problemas conocidos de contaminación: se detectó un par exacto de imágenes duplicadas entre train y test (la misma imagen aparece como maligno en train y como benigno en test), y 216 pares casi-duplicados con RMSE≤0.05. La innovación técnica clave es que la convolución se implementa de forma cifrada real: se usa im2col + dot_plain bajo CKKS, y las activaciones ReLU y el max-pool se ejecutan bajo protocolos de computación multipartita (MPC). El modelo está pensado para ejecutarse en el navegador con onnxruntime-web.

## Capacidades

- Clasificación binaria de imágenes de ultrasonido de mama: distingue entre benigno y maligno.
- Inferencia bajo cifrado homomórfico CKKS: la convolución y las activaciones se ejecutan sobre datos cifrados, lo que permite evaluar imágenes sin exponerlas en claro.
- Ejecución en el navegador: compatible con onnxruntime-web, lo que permite una demostración sin infraestructura adicional.
- Diseñado para integración en el caso de uso `medical_fl` del proyecto QSMPC-QKD-QHE-AI-Hybrid, como parte de un flujo de federated learning cifrado.
- No soporta tool calling, generación de texto, razonamiento multi-paso ni capacidades multimodales más allá de la clasificación de imágenes.
- No se reportan capacidades multilingües ni de visión general; es un clasificador específico de dominio.

## Casos de uso

- Investigación en privacidad médica: el modelo permite demostrar que una CNN puede clasificar imágenes de ultrasonido de mama sin que el servidor vea los datos en claro, gracias al cifrado CKKS. Adecuado para pruebas de concepto y laboratorios de investigación.
- Demostración de cifrado homotado en el navegador: gracias a su pequeño tamaño y compatibilidad con onnxruntime-web, se puede integrar en una página web para mostrar la inferencia cifrada en tiempo real, sin necesidad de GPUs dedicadas.
- Benchmark de coste computacional de FHE: con solo 3226 parámetros, sirve como referencia para medir el tiempo y los recursos que consume una convolución cifrada bajo CKKS, útil para comparar con modelos más grandes.
- Evaluación de destilación de modelos: permite comparar el rendimiento del estudiante frente al profesor ResNet-18 (teacher_metric 0.865) y medir la pérdida de fidelidad de la destilación (student_metric 0.769).
- Entrenamiento de modelos para federated learning con privacidad: dentro del proyecto QSMPI, se usa como modelo de la capa cifrada en el flujo de federated learning médico, donde los clientes envían gradientes cifrados.
- Prototipo de diagnóstico asistido por privacidad: aunque su rendimiento es bajo para producción, puede servir como prototipo para validar la viabilidad técnica de un sistema de diagnóstico que cumpla requisitos de confidencialidad estrictos.

## Benchmarks y rendimiento

Las métricas medidas por el autor sobre el split de evaluación (156 imágenes) son las siguientes:

| Métrica | Valor |
|---|---|
| AUC | 0.788221 |
| Student_metric (accuracy) | 0.769231 |
| Teacher_metric (accuracy) | 0.865385 |
| Agreement (coincidencia con el profesor) | 0.826923 |
| Disagreement_on_positives | 0.149123 |
| Majority_class_rate | 0.730769 |
| Metric_delta | 0.096154 |
| Metric_delta_pp | 9.6154 |
| N_classes_predicted | 2 |
| N_eval | 156 |

En la model card se comparan con los baselines publicados de MedMNIST v2:

| Modelo | AUC | Accuracy |
|---|---|---|
| ResNet-18 @28px (baseline, Yang et al., 2023) | 0.901 | 0.863 |
| Google AutoML Vision (techo publicado) | 0.919 | no disponible |
| Este modelo (estudiante CKKS) | 0.788 | 0.769 |

El propio autor reconoce que el rendimiento está muy por debajo del baseline de ResNet-18 (0.788 frente a 0.901 de AUC). Además, se documenta que en la ronda 24 del desarrollo el modelo era un predictor constante (AUC 0.354, por debajo del azar), y que se corrigió añadiendo pérdida ponderada por clase y selección por AUC.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 MB; el modelo tiene solo 3226 parámetros, por lo que cabe en cualquier dispositivo con memoria mínima.
- GPU recomendadas: no se requieren GPUs; el modelo se puede ejecutar en CPU sin problema.
- Compatibilidad con consumer GPU: sí, cualquier tarjeta, incluso integradas.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), onnxruntime-web para navegador, y cualquier runtime que soporte ONNX. No requiere vLLM ni TGI por su tamaño.
- Latencia y throughput estimados: no se proporcionan datos medidos; dado el tamaño, la inferencia en claro es del orden de milisegundos en CPU, pero bajo cifrado CKKS la latencia puede ser significativamente mayor (no se reporta el valor).
- Almacenamiento: el repositorio ocupa 0.0 GB (el modelo es de menos de 1 KB de pesos).

## Comparativa con modelos similares

La comparación se puede hacer con el modelo profesor y con baselines de MedMNIST v2:

| Modelo | Parámetros | Contexto | AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (CKKS student) | 3 226 | 14×14 (imagen) | 0.788 | CC-BY-4.0 (asserted por MedMNIST) | HuggingFace, ONNX |
| ResNet-18 teacher (del mismo proyecto) | 11 171 266 | 28×28 | 0.865 (accuracy) | No especificada | HuggingFace |
| ResNet-18 @28px (baseline MedMNIST) | no disponible | 28×28 | 0.901 | CC-BY-4.0 (MedMNIST) | Reproducible |
| Google AutoML Vision (techo publicado) | no disponible | no disponible | 0.919 | no disponible | no disponible |

El modelo es significativamente más pequeño que el profesor (0.03% de sus parámetros) y su rendimiento es inferior. No hay otros modelos de tamaño comparable en el ecosistema de BreastMNIST con cifrado homotado; es un caso de uso de investigación más que una competición con modelos estándar.

## Limitaciones y advertencias

- Rendimiento bajo: AUC 0.788, muy por debajo del baseline de 0.901 de ResNet-18 @28px. No apto para diagnóstico clínico real.
- Contaminación de datos: existe un par de imágenes exactamente duplicado entre el conjunto de entrenamiento y el de test (train[115] etiquetado como maligno, test[76] etiquetado como benigno), lo que hace que el modelo no pueda acertar esa imagen por mucho que se entrene. Además, hay 216 pares casi-duplicados (RMSE≤0.05) que cruzan la frontera de train/test.
- Problema de licencia: aunque MedMNIST se licencia como CC-BY-4.0, el dataset original Breast Ultrasound Images (BUSI) no tiene una licencia clara para los datos; la fuente solo pide citación, lo que no es una concesión de licencia. Esto puede impedir uso comercial.
- Es un prototipo de investigación, no un sistema de producción. La model card lo declara explícitamente como parte de un proof of concept.
- Riesgo de sesgo: la tasa de la clase mayoritaria es 0.73, lo que indica un desbalance en las clases; el modelo puede tender a predecir la clase mayoritaria.
- Limitación de entrada: solo acepta imágenes de 14×14, por lo que no es útil directamente para imágenes de mayor resolución sin un reescalado.
- La convolución cifrada bajo CKKS tiene un coste computacional alto; aunque el modelo es pequeño, la latencia bajo cifrado puede ser significativa, aunque no se reporta el dato.
- No se han publicado resultados de benchmarks independientes; todas las métricas son las medidas por el autor en su propio split.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Daemons-Q/qsh-medical-breastmnist-ckks-student
- Repositorio del proyecto QSMPI-QKD-QHE-AI-Hybrid: https://github.com/thedaemon-wizard/QSMPI-QKD-QHE-AI-Hybrid
- Paper de Kim et al. sobre HE en rayos X de tórax: arXiv:2506.15258
- Dataset MedMNIST v2: https://medmnist.com/
- Paper de referencia de MedMNIST: Yang et al., Scientific Data 10:41 (2023)
- Dataset Breast Cancer (BUSI): Al-Dhabyani et al., Data in Brief 28:104863 (2020)

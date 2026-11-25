# Keerthisuresh12/mri-resnet18

## Resumen

`Keerthisuresh12/mri-resnet18` es un clasificador de imagen médica basado en ResNet18 (torchvision, preentrenado en ImageNet) y ajustado finamente para clasificar un único corte 2D de resonancia magnética cerebral en cuatro clases: glioma, meningioma, ausencia de tumor y tumor pituitario. Lo desarrolla Keerthisuresh12 como proyecto de aprendizaje y demostración de un flujo de trabajo ML de extremo a extremo, no como producto clínico.

El modelo resuelve una tarea de clasificación de imagen (pipeline `image-classification`) sobre entradas de 224×224 píxeles en RGB con normalización ImageNet, y devuelve cuatro probabilidades de clase calibradas mediante escalado de temperatura (T = 1.746, ajustado sobre el conjunto de validación). Su relevancia es acotada: sirve para explorar comportamiento, calibración y modos de fallo de una CNN pequeña en un dominio médico, no para uso diagnóstico.

La arquitectura es una CNN residual de 18 capas, con un tamaño de repositorio de 0.0 GB, licencia MIT y 0 descargas en el momento de la consulta. El autor declara explícitamente que el modelo no es un dispositivo médico y que no debe emplearse para diagnóstico ni para ninguna decisión clínica. El conjunto de entrenamiento procede de un dataset público de Kaggle con 7.200 imágenes (1.800 por clase), re-dividido por el autor para mitigar fugas entre train y test.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet18 (CNN residual, torchvision, preentrenada en ImageNet) |
| Parámetros totales | no disponible (ResNet18 estándar de torchvision; el autor no publica el recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de una imagen 224×224) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (clasificación de imagen; sin capacidades de texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio figura con tamaño 0.0 GB; no se detalla el formato de los pesos) |

## Arquitectura y entrenamiento

Se trata de una ResNet18 preentrenada en ImageNet y adaptada a cuatro clases mediante un entrenamiento en dos fases. En la fase 1 se congela el backbone y solo se entrena la nueva cabeza de 4 clases con Adam y learning rate 1e-3. En la fase 2 se ajusta finamente toda la red con Adam y learning rate 1e-4 durante 10 épocas, manteniendo congeladas las estadísticas de BatchNorm y seleccionando el checkpoint por menor pérdida de validación. La única aumentación de datos aplicada es rotación aleatoria de ±10 grados.

Los datos provienen del dataset "Brain Tumor MRI Dataset" de Kaggle (masoudnickparvar), en su versión de 7.200 imágenes, 1.800 por clase. El autor agrupó el split oficial de train/test y lo volvió a dividir 60/20/20 con StratifiedGroupKFold, agrupando por hash perceptual (dHash) para que las imágenes duplicadas no cruzaran entre particiones, con verificación de 0 grupos compartidos. La calibración se ajustó con escalado de temperatura (T = 1.746) sobre validación, reduciendo el ECE (10 bins) de 0.026 a 0.010.

## Capacidades

- Clasificación de un único corte 2D de RM cerebral en cuatro clases: glioma, meningioma, ausencia de tumor y tumor pituitario.
- Salida de cuatro probabilidades de clase calibradas por escalado de temperatura.
- Entrada de imagen convertida a RGB y redimensionada a 224×224 con normalización ImageNet.
- Generación de mapas Grad-CAM (verificados por el autor) para inspección cualitativa de la región de evidencia; mapas de 7×7, gruesos y no probatorios de razonamiento clínico.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es exclusivamente un clasificador de imagen.
- No soporta modalidades distintas de la RM (el autor excluye explícitamente CT y otras modalidades).

## Casos de uso

- Docencia y demostración de flujos de trabajo ML de extremo a extremo: el modelo y su repositorio sirven para ilustrar preparación de datos, re-división por grupos, ajuste fino en dos fases y calibración de probabilidades en un caso realista de imagen médica.
- Estudio de calibración de modelos: la comparación de ECE antes y después del escalado de temperatura (0.026 frente a 0.010) permite analizar cómo afecta la calibración a la fiabilidad de las probabilidades en clasificación médica.
- Análisis de modos de fallo y robustez: los errores documentados (16 de 17 tumores predichos como "no tumour" eran imágenes RGB de menor resolución) permiten estudiar sesgos por fuente de datos y comportamiento fuera de distribución.
- Evaluación de técnicas de interpretabilidad: los mapas Grad-CAM permiten comprobar si la evidencia se concentra en la región de la lesión en predicciones correctas, como ejercicio de auditoría de modelos de visión.
- Prototipado de pipelines de clasificación de imagen en investigación: sirve como componente de referencia para experimentar con aumentación, re-división de datasets y selección de checkpoints antes de escalar a arquitecturas mayores.
- Comparación de baselines: el autor reporta una CNN entrenada desde cero con 85.0% de accuracy frente al 95.5% del ResNet18 ajustado, lo que permite usar el modelo como referencia en experimentos de transferencia de aprendizaje.

## Benchmarks y rendimiento

Evaluación sobre conjunto de test reservado (1.429 imágenes), usado una sola vez tras fijar todas las decisiones:

| Clase | Precisión | Recall |
|---|---|---|
| Glioma | 0.959 | 0.935 |
| Meningioma | 0.943 | 0.907 |
| No tumour | 0.956 | 0.984 |
| Pituitary | 0.962 | 0.997 |

| Métrica | Valor |
|---|---|
| Accuracy en test | 95.5% |
| Accuracy en validación | 97.1% |
| Baseline CNN desde cero | 85.0% |
| ECE (10 bins) antes de calibración | 0.026 |
| ECE (10 bins) tras escalado de temperatura | 0.010 |
| Tumores predichos como "no tumour" | 17 de 1.051 |
| Imágenes sin tumor predichas como tumor | 6 de 378 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de ResNet18, la inferencia en FP32 de una sola imagen 224×224 requiere típicamente menos de 1 GB de VRAM, aunque el autor no publica mediciones.
- GPU recomendadas: no disponible; cualquier GPU consumer moderna es sobradamente suficiente para una ResNet18, pero no hay datos publicados por el autor.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de VRAM, aunque no se aportan cifras verificadas.
- Opciones de despliegue: el autor referencia una demo en Hugging Face Spaces y un repositorio en GitHub con el código; no se detallan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí). El despliegue natural sería PyTorch/TorchServe o un servicio HTTP propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia interna, el propio autor reporta una CNN entrenada desde cero con 85.0% de accuracy frente al 95.5% del ResNet18 ajustado, pero no se ofrecen comparaciones con otras arquitecturas (ResNet50, EfficientNet, ViT) ni con otros clasificadores públicos de tumores cerebrales.

| Modelo | Arquitectura | Accuracy en test | Licencia | Disponibilidad |
|---|---|---|---|---|
| Keerthisuresh12/mri-resnet18 | ResNet18 | 95.5% | MIT | Hugging Face |
| CNN desde cero (baseline del autor) | CNN | 85.0% | no disponible | no disponible |
| Otros clasificadores de tumores cerebrales | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Uso exclusivamente educativo y de investigación: el autor declara que no es un dispositivo médico y que no debe usarse para diagnóstico ni para ninguna decisión clínica.
- Diferencias de fuente entre clases: las imágenes "no tumour" provienen mayoritariamente de otra fuente, son más pequeñas y están en RGB, por lo que el modelo puede aprender parcialmente la fuente de la imagen en lugar de la anatomía. Una prueba solo de resolución (100 imágenes) no cambió las predicciones, pero no se probaron otras características de la fuente.
- Posible fuga residual: aunque el autor re-dividió con agrupación por hash perceptual, los casi duplicados y distintos cortes del mismo paciente podrían seguir cruzando entre particiones, ya que el dataset no incluye identificadores de paciente.
- Errores confiados en imágenes fuera de distribución: un escaneo que parece ser CT, no RM, fue clasificado como "no tumour" con 98.9% de confianza; la alta confianza no garantiza corrección.
- Los errores se concentran en un tipo de imagen: 16 de los 17 tumores predichos como "no tumour" eran imágenes RGB de menor resolución (frente al 46% de imágenes RGB entre todos los tumores de test). El meningioma tiene el recall más bajo (90.7%).
- No representativo de datos clínicos: las clases están artificialmente balanceadas, no hay validación externa y las métricas provienen de un único dataset público; el rendimiento en el mundo real sería probablemente inferior.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el propio autor restringe el uso a fines educativos y de investigación y prohíbe el uso clínico; conviene respetar esa advertencia aunque la licencia sea permisiva.
- Solo RM: no aplica a CT, volúmenes 3D, otras regiones corporales ni poblaciones distintas a las de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Keerthisuresh12/mri-resnet18
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Keerthisuresh12/mri-classifier-demo
- Código en GitHub: https://github.com/keerthisuresh06/mri-classifiers
- Dataset de entrenamiento (Kaggle, masoudnickparvar): https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset

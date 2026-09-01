# HarmeetKalha/pneumonia-detector

## Resumen

El modelo `HarmeetKalha/pneumonia-detector` es un clasificador binario de imágenes de rayos X de tórax que distingue entre casos normales y casos de neumonía. Está basado en una arquitectura EfficientNet-B0 preentrenada en ImageNet y fine-tuneada por completo sobre el conjunto de datos público *Chest X-Ray Images (Pneumonia)* de Kaggle. El autor, Harmeet Singh Kalha, ha implementado además un módulo de Grad-CAM desde cero para visualizar las regiones de la imagen que influyen en la decisión del modelo, lo que aporta una capa de explicabilidad relevante para entornos clínicos.

El modelo alcanza una precisión del 93 % en el conjunto de test (624 imágenes) y un ROC-AUC de 0,9798, con un recall de neumonía del 97 %. Su relevancia actual reside en la combinación de un modelo ligero y eficiente (EfficientNet-B0) con una herramienta de interpretabilidad visual, algo cada vez más demandado en aplicaciones de diagnóstico asistido por IA. No se trata de un modelo de lenguaje ni multimodal en el sentido conversacional; es un modelo de visión por computadora especializado en una tarea concreta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (fine-tuned) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa imágenes) |
| Licencia | MIT (según badge del repositorio) |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo parte de EfficientNet-B0 preentrenado en ImageNet y se fine-tunea por completo con una tasa de aprendizaje baja (1e-4) para adaptar las características visuales al dominio de las radiografías de tórax. La cabeza de clasificación es personalizada y se añade sobre la base convolucional. Para manejar el desequilibrio de clases del dataset (aproximadamente 3:1 a favor de neumonía), se emplean dos estrategias complementarias: un `WeightedRandomSampler` que sobremuestrea la clase minoritaria durante el entrenamiento, y una `CrossEntropyLoss` ponderada que penaliza más los errores sobre la clase normal. El entrenamiento utiliza un scheduler `ReduceLROnPlateau` que reduce la tasa de aprendizaje en un factor de 10 si la pérdida de validación se estanca durante 3 épocas.

La implementación de Grad-CAM se realiza desde cero mediante hooks de forward y backward sobre el último bloque convolucional de EfficientNet. Se capturan los mapas de características y los gradientes, se ponderan los mapas por su gradiente medio, se aplica ReLU y se redimensiona al tamaño de la imagen original. No se utilizan librerías externas de explicabilidad.

## Capacidades

- Clasificación binaria de radiografías de tórax en dos categorías: NORMAL y PNEUMONIA.
- Generación de mapas de activación Grad-CAM que resaltan las regiones de la imagen que contribuyen a la predicción.
- Fine-tuning completo sobre un dominio específico (imágenes médicas) a partir de un backbone preentrenado.
- Manejo de desequilibrio de clases mediante muestreo ponderado y pérdida ponderada.
- Inferencia sobre imágenes individuales (no procesa secuencias ni texto).
- No dispone de capacidades de tool calling, agentes, razonamiento multi-paso ni generación de lenguaje.

## Casos de uso

- Asistencia al diagnóstico de neumonía en entornos hospitalarios: el modelo puede analizar radiografías de tórax y proporcionar una probabilidad de neumonía, ayudando al radiólogo a priorizar casos urgentes.
- Triaje de pacientes en servicios de urgencias: al ser un modelo ligero, puede integrarse en sistemas de clasificación rápida para derivar a los pacientes con mayor sospecha de neumonía a pruebas complementarias.
- Formación médica y educación: los mapas Grad-CAM permiten a estudiantes de medicina visualizar qué regiones pulmonares son relevantes para el diagnóstico, facilitando la interpretación de radiografías.
- Investigación en IA explicable: la implementación de Grad-CAM desde cero sirve como referencia didáctica para estudiar mecanismos de atención en modelos de visión.
- Validación de modelos de visión en dominios médicos: el pipeline de entrenamiento y evaluación (con curvas ROC, matriz de confusión y métricas) puede reutilizarse como plantilla para otros problemas de clasificación de imágenes.
- Desarrollo de aplicaciones de segunda opinión: el modelo puede integrarse en herramientas de software que ofrezcan una lectura automática complementaria a la del especialista, siempre bajo supervisión humana.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre el conjunto de test (624 imágenes: 234 NORMAL, 390 PNEUMONIA):

| Metrica | Valor |
|---|---|
| Exactitud (Accuracy) | 93 % |
| ROC-AUC | 0,9798 |
| F1 (neumonia) | 0,94 |
| Recall (neumonia) | 0,97 |

No se han publicado comparaciones con otros modelos en la información disponible. El análisis Grad-CAM revela que el modelo atiende principalmente al tejido pulmonar, aunque también muestra atención hacia regiones periféricas (brazos), lo que sugiere un posible aprendizaje de atajos (*shortcut learning*) que debe tenerse en cuenta para despliegues clínicos.

## Requisitos de hardware

- Al tratarse de EfficientNet-B0, un modelo de aproximadamente 5,3 millones de parámetros (dato no confirmado en la documentación), la inferencia es viable en CPU, aunque no se especifican requisitos exactos de VRAM.
- No se proporcionan datos de latencia ni throughput en la información disponible.
- El entrenamiento se realizó presumiblemente con una GPU de gama media (no se indica el hardware concreto).
- Para despliegue, al ser un modelo PyTorch, puede servirse con TorchServe, ONNX Runtime o directamente con una API Flask/FastAPI. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Se recomienda una GPU con al menos 4 GB de VRAM para inferencia en lote, aunque no es un dato oficial.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de detección de neumonía. Existen alternativas como `radiovision/Pneumonia-Detection` (un ViT fine-tuned sobre el mismo dataset) que reporta una precisión del 95,51 %, pero no se dispone de detalles completos de su arquitectura ni de sus métricas adicionales. Otras implementaciones en GitHub utilizan SVM o redes convolucionales propias, pero sin datos publicados comparables. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- El modelo se ha entrenado sobre un dataset público con un desequilibrio de clases (3:1) y un número limitado de imágenes (5.216 de entrenamiento). Su rendimiento en poblaciones diversas o con equipos de rayos X distintos puede degradarse.
- El análisis Grad-CAM muestra atención hacia regiones periféricas (brazos), lo que sugiere un posible aprendizaje de atajos. Esto supone un riesgo de sobreajuste a artefactos del dataset y una menor robustez en entornos clínicos reales.
- No se ha realizado una validación clínica formal. El modelo no debe utilizarse como único criterio diagnóstico sin supervisión de un profesional sanitario.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la seguridad o eficacia en entornos médicos.
- No se especifican los hiperparámetros exactos de entrenamiento (número de épocas, tamaño de lote, etc.), lo que dificulta la reproducibilidad completa.
- El modelo solo procesa imágenes de rayos X de tórax; no es aplicable a otros tipos de imagen médica sin un nuevo fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarmeetKalha/pneumonia-detector
- Repositorio GitHub: https://github.com/HarmeetKalha/chest-xray-pneumonia
- Dataset original en Kaggle: https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia
- Perfil de LinkedIn del autor: https://linkedin.com/in/harmeetsinghkalha

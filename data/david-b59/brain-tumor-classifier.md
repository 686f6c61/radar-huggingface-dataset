# david-b59/brain-tumor-classifier

## Resumen

Brain Tumor Classifier es un modelo de clasificación de imágenes médicas desarrollado por david-b59, orientado a la detección de tumores cerebrales en resonancias magnéticas (MRI). Se trata de un ResNet-50 preentrenado en ImageNet y ajustado mediante transfer learning para clasificar una única corte axial de MRI en cuatro categorías: glioma, meningioma, tumor hipofisario (pituitary) y ausencia de tumor (notumor). El modelo incorpora además mapas de activación Grad-CAM para señalar las regiones de la imagen que influyeron en la predicción.

El proyecto nace como trabajo de fin de máster en Machine Learning Engineering y se ha publicado con pesos en formato safetensors, configuración JSON y licencia MIT. Con 23,57 millones de parámetros, es un modelo compacto que se puede ejecutar en CPU y en GPU de consumo, lo que lo hace accesible para experimentación y prototipado. El autor lo presenta explícitamente como una demostración técnica y no como un dispositivo médico, sin validación clínica alguna.

Su relevancia actual reside en que ejemplifica el flujo completo de un proyecto de deep learning aplicado a imagen médica: limpieza del dataset (detección de duplicados por SHA-256), división estratificada, entrenamiento en dos fases con descongelación progresiva, evaluación honesta sobre un conjunto de test reservado y análisis crítico de errores mediante Grad-CAM. Es, por tanto, una referencia útil para desarrolladores e investigadores que quieran entender las luces y las sombras de aplicar transfer learning a datos médicos de una sola fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN, torchvision IMAGENET1K_V1) con cabeza de 4 clases |
| Parámetros totales | 23.569.348 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen 224 x 224 RGB) |
| Tipos de cuantización | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | fr (etiquetas de la model card; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) + config.json |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-50 convolucional estándar, preentrenada en ImageNet (IMAGENET1K_V1) y adaptada sustituyendo la capa final por una fully connected de 4 salidas. El entrenamiento se realizó en dos fases: una primera en la que solo se entrena la nueva capa (3 épocas, lr 1e-3) y una segunda en la que se descongela el último bloque `layer4` (5 épocas, lr 1e-4), manteniendo las capas de normalización congeladas en modo evaluación. Se aplicó augmentación ligera (volteo, rotación de ±10 grados, variaciones de brillo y contraste), optimizador Adam, reducción del learning rate sobre plateau y parada temprana opcional. El mejor checkpoint se seleccionó por pérdida de validación (época 7 de 8). El entrenamiento completo se ejecutó en CPU en aproximadamente 2 horas y 44 minutos.

Los datos provienen del *Brain Tumor MRI Dataset* de Masoud Nickparvar (Kaggle, licencia CC BY 4.0): 7.200 imágenes de 4 clases, con carpetas Training y Testing. El autor eliminó 187 copias idénticas detectadas por hash SHA-256 para evitar fugas entre entrenamiento y validación, resultando en 4.614 imágenes de entrenamiento, 815 de validación (división estratificada de Training) y 1.584 de test (carpeta Testing, usada una sola vez al final). No se documenta el uso de RLHF, DPO ni ninguna innovación arquitectónica más allá del transfer learning y la integración de Grad-CAM para interpretabilidad.

## Capacidades

- Clasificación de imágenes MRI cerebrales en 4 categorías: glioma, meningioma, pituitary y notumor.
- Generación de mapas de activación Grad-CAM (resolución 7 x 7 ampliada) que señalan las regiones de la imagen que influyeron en la predicción.
- Inferencia sobre imágenes 2D ya extraídas, redimensionadas a 224 x 224, convertidas a RGB y normalizadas con media y desviación típica de ImageNet.
- Ejecución en CPU y GPU; sin requisitos de hardware especializados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de texto.
- No dispone de modo thinking, visión general (solo MRI de una modalidad concreta), audio ni capacidades multilingües más allá de las etiquetas en francés.
- Integración sencilla mediante la clase `Predictor` del paquete `brain_mri` (`Predictor.from_hub("david-b59/brain-tumor-classifier")`).

## Casos de uso

- Docencia y formación en ingeniería de machine learning: el proyecto documenta de forma completa el flujo de transfer learning, limpieza de duplicados, división estratificada y evaluación honesta sobre test, lo que lo convierte en un ejemplo didáctico reproducible en CPU en menos de 3 horas.
- Prototipado de pipelines de clasificación de imágenes médicas: sirve como punto de partida para equipos que quieran montar una demo end-to-end con Grad-CAM, sustituyendo el dataset por uno propio y manteniendo la arquitectura ResNet-50.
- Investigación sobre interpretabilidad: los mapas Grad-CAM permiten estudiar qué regiones de la imagen activan la predicción y detectar atajos espurios (cráneo, órbita, fondo), un análisis útil para metodologías de auditoría de modelos médicos.
- Benchmark de referencia para comparativas de transfer learning: al publicar accuracy de validación (97,7 %) y de test (94,4 %) con métricas por clase, permite contrastar variantes (otras CNN, ViT, aumentación más agresiva) sobre el mismo dataset.
- Aplicación web de demostración: el repositorio GitHub incluye una app web que carga el modelo desde el Hub y devuelve la clase predicha junto con las probabilidades y la imagen Grad-CAM, útil para talleres y presentaciones.
- Análisis de errores críticos en clasificación médica: el modelo clasifica 44 tumores (gliomas y meningiomas) como notumor, lo que lo hace apropiado para estudiar falsos negativos y diseñar estrategias de mitigación (umbrales, ensembles, revisión humana) antes de cualquier uso serio.
- Evaluación de robustez frente a confianza: dado que algunas predicciones erróneas alcanzan probabilidad del 100 %, el modelo es útil como caso de estudio sobre calibración y confianza engañosa en clasificadores médicos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el dataset de Masoud Nickparvar:

| Conjunto | Accuracy |
|---|---|
| Validación (usado para seleccionar modelo) | 97,7 % |
| Test (1.584 imágenes no vistas) | 94,4 % |

Métricas por clase sobre el conjunto de test:

| Clase | Precisión | Recall | F1 | Imágenes |
|---|---|---|---|---|
| glioma | 0,985 | 0,837 | 0,905 | 386 |
| meningioma | 0,917 | 0,942 | 0,929 | 398 |
| notumor | 0,901 | 1,000 | 0,948 | 400 |
| pituitary | 0,985 | 0,993 | 0,989 | 400 |

No se han publicado comparativas con otros modelos sobre el mismo dataset en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (23,57 M de parámetros, aproximadamente 94 MB de pesos), más el overhead de activaciones para una imagen de 224 x 224, que es despreciable.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para ellas.
- Cabe en cualquier GPU de consumo e incluso en CPU: el autor entrenó el modelo completo en CPU en unas 2 h 44 min.
- Opciones de despliegue: PyTorch nativo (carga directa de `model.safetensors` con `safetensors.torch.load_file`), TorchServe, o exportación a ONNX/TorchScript para servir con ONNX Runtime o Triton. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU moderna y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| david-b59/brain-tumor-classifier | ResNet-50 | 23,57 M | Imagen 224 x 224 RGB | 94,4 % accuracy en test (4 clases) | MIT | Hugging Face Hub |
| ResNet-50 ImageNet (baseline torchvision) | ResNet-50 | 25,56 M | Imagen 224 x 224 RGB | No aplicable (1000 clases ImageNet) | BSD-3-Clause | torchvision |
| Otros clasificadores de tumor cerebral en el Hub | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables específicos para este dataset en la documentación proporcionada. La comparación más directa es con el backbone ResNet-50 original de torchvision, del que este modelo hereda la arquitectura y los pesos iniciales.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor indica explícitamente que el modelo no debe usarse para diagnóstico ni para decisiones de tratamiento, y que no ha recibido validación clínica.
- Los gliomas son la clase peor reconocida: el 16 % no se detectan; 33 se clasifican como meningioma y 29 como notumor. En total, 44 tumores (gliomas y meningiomas) se etiquetan como notumor, el error más grave en un contexto real.
- El modelo no siempre mira la lesión: los mapas Grad-CAM muestran que en varios errores la zona caliente está en el cráneo, la órbita o el fondo de la imagen, y que una predicción correcta puede apoyarse en el fondo. La resolución del mapa (7 x 7 ampliada) es grosera y no constituye una prueba.
- Confianza engañosa: algunas predicciones erróneas alcanzan una probabilidad del 100 %, lo que desaconseja usar la probabilidad de salida como medida fiable de certeza.
- Brecha validación-test: 97,7 % frente a 94,4 %; la validación se usó para seleccionar el modelo y está algo optimista. El dato a citar es el de test.
- Duplicados: solo se detectaron copias idénticas por SHA-256; pueden persistir casi-duplicados (volteados, recortados) entre entrenamiento y test que inflen ligeramente el resultado.
- Una única fuente de datos, imágenes 2D ya extraídas, sin información sobre pacientes, equipos ni protocolos; el modelo no se ha probado en otros hospitales ni con otras distribuciones.
- Sesgos conocidos: no documentados de forma explícita más allá de los derivados de la única fuente de datos; no hay análisis por subgrupos demográficos ni por tipo de escáner.
- Restricciones de licencia: MIT permite uso comercial, pero la licencia del dataset original es CC BY 4.0 y debe respetarse la atribución correspondiente.
- Caveat para producción: cualquier despliegue real requeriría validación externa, revisión por profesionales sanitarios, monitorización de deriva y un mecanismo de revisión humana obligatoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/david-b59/brain-tumor-classifier
- Repositorio GitHub del autor (carpeta `brain-tumor-classifier`): https://github.com/david-b59/deep-learning-projects
- Dataset Brain Tumor MRI de Masoud Nickparvar (Kaggle): https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset
- Pesos base ResNet-50 de torchvision (IMAGENET1K_V1): https://pytorch.org/vision/stable/models/generated/torchvision.models.resnet50.html

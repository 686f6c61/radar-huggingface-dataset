# jackton439/plant-disease-detector

## Resumen

`jackton439/plant-disease-detector` es un modelo de clasificación de imágenes publicado en Hugging Face por el usuario jackton439, orientado a la detección de enfermedades en hojas de plantas. Se trata de un fine-tuning de MobileNetV2, una red neuronal convolucional ligera diseñada originalmente por Google para clasificación de imágenes en dispositivos con recursos limitados. El modelo cuenta con 2.261.827 parámetros, lo que lo sitúa en la categoría de modelos ultracompactos, adecuados para inferencia en CPU o en hardware de borde.

El modelo se distribuye en formato safetensors bajo la librería transformers y es compatible con los endpoints de Hugging Face (tag `endpoints_compatible`). La model card está generada automáticamente y no contiene información sustantiva sobre datos de entrenamiento, hiperparámetros, métricas de evaluación ni limitaciones, por lo que la mayor parte de los detalles técnicos no están disponibles.

Su relevancia práctica radica en el caso de uso: la clasificación automatizada de enfermedades foliares en cultivos (patata y tomate, según la demo asociada) es un problema agronómico con impacto directo en la productividad. Un modelo de 2,26 M de parámetros puede desplegarse en dispositivos móviles o Raspberry Pi, lo que lo hace atractivo para aplicaciones de campo sin conectividad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN, clasificación de imágenes) |
| Parámetros totales | 2.261.827 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible (compatible con cuantización estándar de transformers/PyTorch) |
| Idiomas soportados | no disponible (no aplica, tarea de visión) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es MobileNetV2, una red convolucional con bloques residuales invertidos y conexiones lineales de cuello de botella, publicada originalmente en el paper arXiv:1910.09700 (referenciado en los tags del modelo). El modelo base está diseñado para eficiencia computacional: usa convoluciones separables en profundidad y un factor de expansión controlado, lo que reduce drásticamente el coste de inferencia frente a CNN más pesadas como ResNet.

No se dispone de información sobre el proceso de entrenamiento: ni el dataset utilizado, ni el número de épocas, ni la resolución de entrada, ni si se aplicó data augmentation, ni los hiperparámetros. La model card no documenta ninguna innovación técnica adicional más allá de la arquitectura base de MobileNetV2. Tampoco se especifica si el fine-tuning se realizó sobre el checkpoint original de ImageNet o sobre otra inicialización.

## Capacidades

- Clasificación de imágenes de hojas de plantas en categorías de enfermedad o estado saludable.
- Salida de probabilidades por clase (clasificación multiclase), apta para umbrales de confianza configurables.
- Inferencia ligera: 2,26 M de parámetros, viable en CPU y dispositivos de borde.
- Integración con la librería transformers (`pipeline("image-classification")`).
- Compatible con los endpoints de Hugging Face.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- **Diagnóstico agronómico en campo**: el modelo clasifica una fotografía de hoja capturada con un smartphone y devuelve la enfermedad detectada con su puntuación de confianza, permitiendo al agricultor actuar sin conexión a internet gracias al reducido tamaño del modelo.
- **Aplicación móvil offline para agricultores**: con 2,26 M de parámetros, el modelo puede empaquetarse en una app Android/iOS mediante conversión a ONNX o TFLite, ofreciendo diagnóstico instantáneo en zonas rurales sin cobertura.
- **Despliegue en Raspberry Pi o dispositivos de borde**: la baja huella computacional permite ejecutar inferencia en tiempo real sobre imágenes capturadas por cámaras agrícolas instaladas en invernaderos o parcelas.
- **Precribado en sistemas de monitorización de cultivos**: integrado en un pipeline que procesa imágenes periódicas de drones o cámaras fijas, el modelo puede marcar hojas sospechosas para revisión humana, reduciendo el volumen de imágenes que un experto debe inspeccionar.
- **Herramienta educativa o de demostración**: la demo pública en Hugging Face Spaces permite a estudiantes y desarrolladores probar el modelo subiendo una imagen y viendo la distribución de probabilidades por clase.
- **Prototipado rápido de clasificadores de visión**: sirve como punto de partida para fine-tuning sobre otros cultivos o enfermedades, dado su tamaño reducido y su compatibilidad con el ecosistema transformers.
- **Sistema de alerta temprana en explotaciones agrícolas**: combinado con un servicio de mensajería, el modelo puede generar alertas cuando la confianza de detección de una enfermedad supera un umbral definido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de accuracy, F1, precisión ni recall sobre ningún conjunto de datos de validación o test.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB en fp32 (2,26 M de parámetros × 4 bytes ≈ 9 MB de pesos, más activaciones y buffers de entrada). En la práctica, el modelo cabe holgadamente en cualquier GPU con al menos 1 GB de VRAM.
- **GPU recomendadas**: no requiere GPU dedicada; cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) ejecutará la inferencia con latencia despreciable. Una GPU integrada o CPU es suficiente.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo, e incluso en CPU y en dispositivos de borde (Raspberry Pi, móviles).
- **Opciones de despliegue**: `transformers` con `pipeline("image-classification")`, exportación a ONNX Runtime, TensorFlow Lite, o integración en Hugging Face Inference Endpoints.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera latencia de milisegundos en CPU moderna y throughput elevado en lotes, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jackton439/plant-disease-detector | 2,26 M | Clasificación de enfermedades de plantas | Imagen (resolución no disponible) | no disponible | Hugging Face |
| MobileNetV2 (base ImageNet) | ~3,5 M | Clasificación de imágenes general | Imagen 224×224 | Apache 2.0 (original) | TensorFlow Hub, torchvision |
| ResNet-50 | ~25,6 M | Clasificación de imágenes general | Imagen 224×224 | BSD-3 (original) | torchvision, HF |
| EfficientNet-B0 | ~5,3 M | Clasificación de imágenes general | Imagen 224×224 | Apache 2.0 (original) | torchvision, HF |

La comparativa se limita a arquitecturas de visión de propósito general, ya que no se dispone de información sobre otros modelos específicos de detección de enfermedades de plantas en la información proporcionada. El modelo de jackton439 es el más pequeño de la tabla y el único especializado en el dominio agronómico, pero carece de documentación sobre licencia y rendimiento que permita una comparación rigurosa.

## Limitaciones y advertencias

- **Documentación inexistente**: la model card está generada automáticamente y no aporta información sobre datos de entrenamiento, evaluación, sesgos ni limitaciones, lo que impide validar su calidad de forma independiente.
- **Licencia no disponible**: no se especifica la licencia, lo que genera incertidumbre legal para uso comercial. Es imprescindible contactar con el autor antes de integrarlo en un producto.
- **Riesgo de alucinación**: como todo clasificador, puede asignar alta confianza a predicciones erróneas, especialmente ante imágenes fuera de distribución (iluminación distinta, otras especies, hojas dañadas por causas no patológicas).
- **Dominio limitado**: la demo asociada menciona patata y tomate; no hay evidencia de que el modelo generalice a otros cultivos o enfermedades no presentes en el entrenamiento.
- **Sin métricas de rendimiento**: no se puede estimar su precisión real ni compararla con alternativas; su uso en producción requeriría una evaluación propia sobre un conjunto de validación representativo.
- **Sesgos potenciales**: si el dataset de entrenamiento está sesgado hacia ciertas variedades, condiciones de iluminación o regiones geográficas, el modelo heredará esos sesgos.
- **Sin soporte de texto ni multilingüe**: no es aplicable a tareas de NLP; su uso está estrictamente limitado a clasificación de imágenes.
- **Fecha de creación futura**: el repositorio figura creado en 2026-11-08, lo que puede indicar metadatos inconsistentes o un artefacto de la plataforma; conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackton439/plant-disease-detector
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/jackton439/plant-disease-demo
- Demo alternativa (DP-PLANT): https://huggingface.co/spaces/DP-PLANT/Plant-detector-ai
- Paper de MobileNetV2 (referenciado en tags): https://arxiv.org/abs/1910.09700

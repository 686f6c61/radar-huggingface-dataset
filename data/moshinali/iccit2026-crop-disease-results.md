# MoshinAli/iccit2026-crop-disease-results

## Resumen
El repositorio `MoshinAli/iccit2026-crop-disease-results` contiene los resultados de un estudio de detección de enfermedades en hojas de arroz presentado en la conferencia ICCIT 2026. No se trata de un modelo único, sino de un conjunto de experimentos de clasificación de imágenes basados en tres arquitecturas convolucionales preentrenadas: MobileNetV2, ResNet18 y EfficientNet-B0. El autor, MoshinAli, ha publicado las métricas, los pesos entrenados y las figuras generadas a partir de un cuaderno de Kaggle.

El objetivo del trabajo es evaluar la capacidad de estos modelos para clasificar cinco enfermedades comunes del arroz (tizón bacteriano, blast, mancha parda, escama de la hoja y tungro) utilizando un dataset principal y un segundo dataset para probar la generalización. Los resultados muestran que ResNet18 obtiene la mayor precisión en el conjunto de prueba principal (77,39 %), mientras que MobileNetV2 destaca por su velocidad de inferencia (1,2 ms por imagen). El repositorio no incluye un modelo único desplegable, sino los artefactos de investigación y las métricas asociadas.

Aunque la ficha está orientada a modelos de lenguaje, este repositorio se adapta a la estructura solicitada, aunque con matices: no hay un modelo de parámetros masivos, sino una evaluación comparativa de tres arquitecturas de visión. Los resultados son relevantes para aplicaciones de agricultura de precisión, donde la detección temprana de enfermedades foliares es crítica para reducir pérdidas y uso de pesticidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2, ResNet18, EfficientNet-B0 (modelos base preentrenados en ImageNet) |
| Parametros totales | No disponible (los pesos se guardan en formato .pth, pero no se indican el número de parámetros de cada modelo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica |
| Licencia | No disponible |
| Formato de pesos | PyTorch (.pth) |
| Dataset de entrenamiento | `dhan-shomadhan` (primario) y `rice-leaf-diseases` (secundario) |

## Arquitectura y entrenamiento
El repositorio documenta el entrenamiento de tres arquitecturas convolucionales estándar para clasificación de imágenes: MobileNetV2, ResNet18 y EfficientNetV0. Todas se usan con pesos preentrenados en ImageNet y se ajustan en el dataset de hojas de arroz. El dataset primario contiene cinco clases de enfermedades (bacterial blight, blast, brown spot, leaf scald y tungro). No se proporciona el número total de imágenes ni el número de épocas, ni detalles sobre el proceso de entrenamiento (tasa de aprendizaje, optimizador, aumento de datos). El entrenamiento se realizó mediante un cuaderno de Kaggle, y los resultados se guardan en formato CSV/JSON.

No hay indicación de técnicas avanzadas como RLHF o DPO; es un entrenamiento supervisado de clasificación estándar. La innovación principal no es arquitectónica, sino el análisis comparativo de rendimiento y velocidad en un contexto de aplicación agrícola.

## Capacidades
- Clasificación de imágenes de hojas de arroz en cinco categorías de enfermedad (bacterial blight, blast, brown spot, leaf scald, tungro).
- Inferencia en tiempo real en dispositivos móviles: los tres modelos alcanzan tiempos de inferencia de 1,2 a 1,5 ms por imagen en GPU, y se estiman entre 5 y 6 ms en dispositivos móviles, cumpliendo el umbral de <200 ms para aplicaciones en tiempo real.
- El modelo ResNet18 ofrece la mayor precisión en el conjunto de prueba principal (77,39 %).
- El modelo MobileNetV2 ofrece el mejor equilibrio velocidad/rendimiento (854 FPS en GPU).
- No incluye capacidades de procesamiento de lenguaje natural, ni tool calling, ni agentes, ni visión multi-modal más allá de la clasificación de imágenes.

## Casos de uso
- Detección temprana de enfermedades en cultivos de arroz: el modelo puede procesar imágenes de hojas tomadas con un smartphone y clasificar la enfermedad, permitiendo a los agricultores actuar rápidamente. La baja latencia (5 ms en móvil) lo hace apto para una aplicación en campo.
- Sistema de recomendación de tratamiento: integrado en una aplicación móvil o web, el modelo clasifica la enfermedad y sugiere el fungicida o tratamiento adecuado según la clase detectada.
- Monitorización automática en invernaderos o campos con cámaras fijas: el modelo puede analizar imágenes periódicas y alertar sobre la aparición de enfermedades, reduciendo la necesidad de inspección manual.
- Educación y formación agrícola: como herramienta de demostración para que técnicos y estudiantes aprendan a identificar enfermedades foliares a partir de imágenes.
- Investigación en generalización de modelos: el repositorio incluye un test cross-dataset que muestra una caída de rendimiento (ResNet18 baja de 77,39 % a 62,5 % de precisión), lo que sirve para estudiar la robustez de los modelos ante cambios de distribución de datos.
- Despliegue en sistemas de agricultura de precisión: los pesos .pth pueden ser convertidos a formatos como ONNX o TensorFlow Lite para integrarse en drones o robots de campo que tomen imágenes y ejecuten el modelo en tiempo real.

## Benchmarks y rendimiento

Los resultados se presentan en dos conjuntos: el primario (test set) y el secundario (cross-dataset).

**Resultados en el conjunto de prueba primario**

| Modelo | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| MobileNetV2 | 0.7478 | 0.7273 | 0.7132 | 0.7177 |
| ResNet18 | 0.7739 | 0.7607 | 0.7386 | 0.7411 |
| EfficientNetV0 | 0.7565 | 0.7308 | 0.7288 | 0.7259 |

**Resultados en el conjunto de prueba secundario (cross-dataset)**

| Modelo | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| MobileNetV2 | 0.575 | 0.3659 | 0.23 | 0.2602 |
| ResNet18 | 0.625 | 0.3846 | 0.25 | 0.3029 |
| EfficientNetV0 | 0.3625 | 0.2833 | 0.145 | 0.1589 |

**Análisis de tiempo de inferencia**

| Modelo | Media (ms) | Std (ms) | FPS | Estimación móvil (ms) |
|---|---|---|---|---|
| MobileNetV2 | 1.2 | 0 | 854 | 5 |
| ResNet18 | 1.2 | 0.2 | 848 | 5 |
| EfficientNetV0 | 1.5 | 0 | 667 | 6 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware
- Los modelos son ligeros y están pensados para ejecución en dispositivos con recursos limitados.
- Inferencia en GPU: los tres modelos corren en una GPU estándar (por ejemplo, NVIDIA Tesla T4 o similar) con tiempos de 1-2 ms por imagen.
- Inferencia en móvil: se estima entre 5 y 6 ms por imagen, lo que permite ejecución en tiempo real en smartphones de gama media.
- Los pesos se guardan en formato .pth de PyTorch; no se incluyen versiones cuantizadas ni para CPU.
- Para despliegue en producción, se puede convertir a TensorFlow Lite, ONNX o CoreML. No se menciona compatibilidad con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- El tamaño del repositorio es de 0.1 GB, lo que incluye los pesos de los tres modelos, las figuras y los archivos de métricas.

## Comparativa con modelos similares
No hay una comparación directa en el repositorio con otros modelos de detección de enfermedades de cultivos. En la literatura general, otros enfoques utilizan arquitecturas como VGG16, InceptionV3 o redes personalizadas. Los resultados aquí son modestos en comparación con modelos más grandes, pero la ventaja es la velocidad. No se puede realizar una comparativa cuantitativa sin datos adicionales. Por tanto, se indica "no disponible".

## Limitaciones y advertencias
- La precisión en el conjunto de prueba secundario es notablemente menor (por ejemplo, EfficientNetB0 baja a 36,25 % de precisión), lo que indica una débil generalización a otros datasets de hojas de arroz. Esto puede deberse a diferencias en las condiciones de imagen, iluminación, fondo o variedad de planta.
- El modelo solo distingue 5 enfermedades; no cubre otras patologías comunes del arroz ni plagas.
- No se ha publicado información sobre sesgos de género, raza u otros sesgos, pero al tratarse de imágenes de plantas, el riesgo de sesgo es menor. Sin embargo, los datos podrían estar desequilibrados entre las clases, lo que no se indica.
- No se especifica la licencia, por lo que no se puede garantizar el uso comercial sin permiso del autor.
- No se incluyen instrucciones de instalación ni de uso de los modelos; los pesos .pth requieren de un entorno PyTorch y una estructura de código específica.
- El entrenamiento se realizó con un cuaderno de Kaggle, lo que puede limitar la reproducibilidad si el dataset primario no está disponible públicamente (no se proporciona un enlace directo).

## Enlaces
- Hugging Face: https://huggingface.co/MoshinAli/iccit2026-crop-disease-results
- Artículo relacionado en ResearchGate: https://www.researchgate.net/publication/389145834_AI-Powered_Crop_Care_Transforming_Farming_with_Disease_Detection_and_Sustainable_Practices
- Artículo en Wiley: https://bsppjournals.onlinelibrary.wiley.com/doi/10.1111/ppa.14006
- Revisión sistemática en ScienceDirect: https://www.sciencedirect.com/science/article/pii/S2772375525007221
- Repositorio de ejemplo de detección de enfermedades de cultivos en GitHub: https://github.com/eshwarkeswani/crop-disease-detection
- Nota de prensa sobre detección de enfermedades en tomate: https://phys.org/news/2026-08-ai-tomato-diseases-field-images.html

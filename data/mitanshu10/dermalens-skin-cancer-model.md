# Mitanshu10/dermalens-skin-cancer-model

## Resumen

DermaLens es un modelo de clasificación de imágenes basado en redes neuronales convolucionales (CNN) desarrollado por Mitanshu Makwana para la detección automatizada de cáncer de piel a partir de imágenes dermatoscópicas. El modelo clasifica lesiones cutáneas en siete categorías clínicas definidas por el dataset HAM10000, un estándar de referencia en investigación de dermatología computacional. Está implementado con TensorFlow y Keras, y se distribuye como un archivo `.h5` de aproximadamente 533 MB.

El modelo resuelve el problema de la clasificación multiclase de lesiones cutáneas, una tarea relevante en el campo de la IA médica porque el diagnóstico temprano del cáncer de piel depende de la identificación precisa de lesiones malignas como el melanoma. DermaLens está pensado como una herramienta educativa y de investigación, no como un dispositivo de diagnóstico clínico, y su autor lo presenta explícitamente como una demostración de técnicas de deep learning aplicadas a la salud. Con una precisión declarada del 83 % sobre HAM10000, el modelo ofrece un rendimiento razonable para un proyecto académico, aunque no ha sido validado en entornos clínicos reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (capas convolucionales, ReLU, MaxPooling, BatchNorm, Dropout, Dense, Softmax) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (formato nativo `.h5`) |
| Idiomas soportados | no aplica (procesa imágenes, no texto; la documentación está en inglés) |
| Licencia | MIT |
| Formato de pesos | Keras `.h5` (533 MB) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional clásica compuesta por capas de convolución con activación ReLU, capas de pooling máximo, normalización por lotes (batch normalization), capas de dropout para regularización y capas densas totalmente conectadas, culminando en una capa de salida softmax con siete unidades, una por cada clase de lesión. No se especifica el número exacto de capas ni el número de filtros por capa, ni se detalla si se utilizó transfer learning con una red preentrenada como ResNet o VGG. El modelo se entrenó sobre el dataset HAM10000, que contiene más de 10 000 imágenes dermatoscópicas distribuidas en siete categorías de lesiones cutáneas.

El entrenamiento utilizó el optimizador Adam y la función de pérdida categorical crossentropy, con la precisión (accuracy) como métrica de evaluación. No se mencionan técnicas de aumento de datos (data augmentation) ni estrategias específicas para abordar el desequilibrio de clases, un problema conocido en HAM10000 donde la clase `nv` (nevus melanocíticos) está sobrerrepresentada. El preprocesado de imágenes consiste en redimensionado a 224 × 224 píxeles, normalización de píxeles dividiendo entre 255 y expansión de la dimensión de lote. No se informa del número de épocas, tamaño de lote ni del número total de parámetros entrenables.

## Capacidades

- Clasificación de imágenes dermatoscópicas en siete categorías: carcinoma actínico (akiec), carcinoma basocelular (bcc), lesiones benignas tipo queratosis (bkl), dermatofibroma (df), melanoma (mel), nevus melanocíticos (nv) y lesiones vasculares (vasc).
- Inferencia sobre imágenes de entrada de 224 × 224 píxeles con normalización estándar.
- Salida de probabilidades por clase mediante softmax, permitiendo interpretar la confianza del modelo en cada predicción.
- Integración sencilla en aplicaciones web o scripts Python mediante la API de Keras (`load_model` y `predict`).
- Capacidad de procesamiento por lotes de imágenes, aunque la documentación solo muestra ejemplos de una sola imagen.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de texto: es exclusivamente un clasificador de imágenes.

## Casos de uso

- Proyectos educativos de deep learning aplicado a imagen médica: el modelo sirve como ejemplo práctico de entrenamiento y despliegue de una CNN para clasificación multiclase, con un dataset real y relevante en el ámbito sanitario.
- Investigación académica en dermatología computacional: los investigadores pueden utilizar DermaLens como baseline o punto de partida para experimentos con arquitecturas más avanzadas o técnicas de aumento de datos.
- Demostraciones de IA médica en entornos docentes: permite ilustrar el flujo completo de preprocesado, inferencia y evaluación de un modelo de visión en un dominio sensible.
- Prototipos de herramientas de apoyo a la formación de profesionales sanitarios: el modelo puede integrarse en aplicaciones de práctica clínica simulada para que estudiantes de medicina aprendan a reconocer patrones de lesiones cutáneas, siempre con supervisión docente.
- Desarrollo de aplicaciones web de demostración: el repositorio GitHub asociado incluye una aplicación web que permite subir imágenes y obtener predicciones, útil para validar la viabilidad técnica de un sistema de clasificación en tiempo real.
- Experimentos de comparación de arquitecturas: los desarrolladores pueden sustituir la CNN simple por arquitecturas preentrenadas (ResNet, EfficientNet) y comparar el rendimiento con el modelo original sobre el mismo dataset.

## Benchmarks y rendimiento

El autor declara una precisión del 83 % sobre el dataset HAM10000, según el modelo-index de la model card. Este resultado no está verificado de forma independiente. No se proporcionan otras métricas como sensibilidad, especificidad, F1-score o matriz de confusión, ni se desglosa el rendimiento por clase. La siguiente tabla recoge el único dato oficial disponible:

| Metrica | Valor |
|---|---|
| Accuracy (HAM10000) | 83 % |
| Numero de clases | 7 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no hay datos oficiales. Dado el tamaño del modelo (533 MB en `.h5`), se estima que la inferencia requiere aproximadamente 1-2 GB de VRAM en formato float32, aunque no se ha confirmado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3060, RTX 4090) es suficiente para inferencia. El entrenamiento, según el autor, se realizó con TensorFlow 2.x y no se especifica el hardware utilizado.
- Compatibilidad con GPU de consumo: sí, el modelo es lo bastante pequeño para ejecutarse en GPUs de gama media de consumo, así como en CPU (aunque con mayor latencia).
- Opciones de despliegue: al ser un modelo Keras, se puede servir con TensorFlow Serving, o convertir a TensorFlow Lite para dispositivos móviles. También es posible exportarlo a ONNX para usar con otros runtime. No hay soporte nativo para vLLM, llama.cpp u Ollama, dado que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado datos. En una GPU moderna, la inferencia sobre una imagen de 224 × 224 debería completarse en decenas de milisegundos, pero esta cifra es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No obstante, en el ámbito de clasificación de lesiones cutáneas con HAM10000 existen trabajos conocidos como los basados en EfficientNet o ResNet que reportan precisiones superiores al 85-90 %, pero no se pueden citar datos concretos sin verificación. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Precision (HAM10000) | Arquitectura | Licencia | Formato |
|---|---|---|---|---|
| DermaLens | 83 % (declarada) | CNN propia | MIT | Keras `.h5` |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con el dataset HAM10000, que presenta un desequilibrio de clases conocido: la clase `nv` (nevus melanocíticos) constituye aproximadamente el 67 % de las imágenes, lo que puede sesgar las predicciones hacia esa clase.
- No está validado en entornos clínicos ni aprobado para uso médico real. El autor indica explícitamente que no es adecuado para diagnóstico clínico, decisiones de tratamiento, aplicaciones de emergencia ni despliegue médico en producción.
- El rendimiento puede degradarse significativamente con imágenes de fuentes no vistas durante el entrenamiento, variaciones en el equipo de captura, condiciones de iluminación o diferencias en el preprocesado.
- Solo se ha reportado la precisión global (83 %); no hay métricas por clase, lo que impide evaluar su comportamiento en clases minoritarias como `df` (dermatofibroma) o `vasc` (lesiones vasculares).
- No se especifican los hiperparámetros de entrenamiento (épocas, tamaño de lote, división train/test), lo que dificulta la reproducibilidad.
- El formato de pesos es `.h5`, que requiere Keras/TensorFlow para cargar el modelo; no se ofrecen versiones en otros formatos (safetensors, ONNX, TF-Lite).
- La licencia MIT permite uso comercial, pero el autor desaconseja el uso en producción médica real, lo que limita su aplicabilidad práctica en el sector sanitario.

## Enlaces

- HuggingFace: https://huggingface.co/Mitanshu10/dermalens-skin-cancer-model
- GitHub (repositorio del proyecto): https://github.com/MitanshuMakwana/DermaLens
- README del repositorio GitHub: https://github.com/MitanshuMakwana/DermaLens/blob/main/README.md
- Dataset HAM10000 (versión en HuggingFace): https://huggingface.co/datasets/kuchikihater/HAM10000

# lokeshkumar79/facial-emotion-recognition

## Resumen

El modelo `lokeshkumar79/facial-emotion-recognition` es una red neuronal convolucional (CNN) desarrollada por Lokesh Kumar para clasificar emociones faciales a partir de imágenes en escala de grises de 48x48 píxeles. Está entrenado sobre el dataset FER-2013, un conjunto de referencia en el campo del reconocimiento de emociones, y produce una distribución de probabilidad sobre siete emociones básicas: enfado, asco, miedo, felicidad, neutral, tristeza y sorpresa. El modelo se distribuye bajo licencia MIT y está disponible en Hugging Face con un archivo de pesos en formato Keras (`.keras`).

La relevancia de este modelo radica en su simplicidad y accesibilidad: al ser una CNN compacta, puede ejecutarse en hardware modesto y sirve como punto de partida para aplicaciones de análisis de expresiones faciales en tiempo real. Sin embargo, su rendimiento está limitado por la calidad del dataset FER-2013, que presenta etiquetas ruidosas y un desequilibrio de clases notable. No se han publicado métricas de precisión ni comparativas con otros modelos en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (bloques Conv2D + MaxPooling, Dropout, capas Dense, salida softmax) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada visual) |
| Licencia | MIT |
| Formato de pesos | Keras (`.keras`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN clásica para clasificación de imágenes: capas convolucionales con activación ReLU seguidas de pooling, dropout para regularización y una cabeza densa con softmax para las siete clases. La entrada es una imagen en escala de grises de 48x48 píxeles con valores normalizados en el rango [0, 1]. El modelo fue entrenado sobre el dataset FER-2013, que contiene 35.887 imágenes (28.709 de entrenamiento, 3.589 de validación y 3.589 de prueba). No se especifican hiperparámetros de entrenamiento (épocas, optimizador, tasa de aprendizaje) ni técnicas como aumento de datos o ajuste fino. El archivo recomendado es `finalfacialemotionmodel.keras`, que se describe como el modelo verificado y funcional del repositorio fuente.

## Capacidades

- Clasificación de emociones faciales en 7 categorías: enfado, asco, miedo, felicidad, neutral, tristeza y sorpresa.
- Acepta imágenes en escala de grises de 48x48 píxeles, con normalización previa.
- Requiere un paso de preprocesamiento externo para la detección y recorte del rostro (por ejemplo, con OpenCV Haar cascade) antes de la clasificación.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la imagen estática.
- No es multilingüe; su salida es una etiqueta de emoción, no texto.

## Casos de uso

- Análisis de sentimiento en videollamadas: el modelo puede integrarse en sistemas de videoconferencia para detectar el estado emocional de los participantes en tiempo real, ayudando a moderadores a identificar frustración o confusión.
- Atención al cliente automatizada: combinado con un sistema de detección facial, puede clasificar la reacción de un cliente ante un producto o servicio, permitiendo ajustar la interacción en consecuencia.
- Evaluación de material publicitario: las empresas pueden medir la respuesta emocional de los consumidores ante anuncios o prototipos, usando el modelo para procesar grabaciones de sesiones de prueba.
- Educación y e-learning: plataformas educativas pueden monitorizar el compromiso de los estudiantes durante clases online, detectando aburrimiento o confusión para adaptar el ritmo.
- Investigación en psicología: el modelo sirve como herramienta de anotación automática en estudios que analizan expresiones faciales, aunque con la precaución de su precisión limitada en ciertas emociones.
- Sistemas de seguridad y vigilancia: puede utilizarse para identificar comportamientos anómalos (por ejemplo, miedo o enfado) en entornos controlados, siempre que se cumplan las normativas de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, F1 ni comparativas con otros modelos. Se recomienda evaluar el modelo en el propio dataset FER-2013 o en un conjunto propio antes de usarlo en producción.

## Requisitos de hardware

- Al ser una CNN pequeña con entrada de 48x48, el modelo es ligero y puede ejecutarse en CPU sin problemas para inferencia por lotes.
- No se dispone de datos exactos de VRAM, pero por el tamaño del archivo (el repositorio ocupa 0.0 GB, lo que sugiere un peso de pocos megabytes) es viable en GPUs de gama baja como la NVIDIA GTX 1050 o incluso en Raspberry Pi con TensorFlow Lite.
- Para despliegue en producción, se puede servir con TensorFlow Serving, o convertir a formato TFLite para dispositivos móviles.
- La latencia por imagen es del orden de milisegundos en CPU moderna, aunque no se han publicado mediciones oficiales.
- No se requieren GPUs especializadas como A100 o H100.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones directas con otros modelos de reconocimiento de emociones faciales en la información proporcionada. Modelos como los basados en ResNet o EfficientNet suelen ofrecer mayor precisión, pero requieren más recursos y no están documentados en esta ficha.

## Limitaciones y advertencias

- El dataset FER-2013 es ruidoso y las etiquetas fueron generadas por crowd-sourcing, lo que introduce errores de anotación.
- Existe un fuerte desequilibrio de clases: la emoción `disgust` está muy subrepresentada, lo que provoca una precisión baja en esa categoría y también en `fear`.
- El rendimiento se degrada con condiciones de iluminación, ángulos o etnias no representadas en el dataset de entrenamiento.
- El modelo solo clasifica emociones a partir de un rostro ya recortado; no realiza detección facial, por lo que requiere un pipeline externo.
- No se han publicado métricas de sesgo o robustez; se recomienda auditar el modelo antes de usarlo en entornos sensibles.
- La licencia MIT permite uso comercial, pero el usuario es responsable de cumplir con las normativas de privacidad y protección de datos (por ejemplo, GDPR) al procesar imágenes de personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lokeshkumar79/facial-emotion-recognition
- Código fuente: https://github.com/lokeshkumar80/Facial_Emotion_Recognition
- Demo Space: https://huggingface.co/spaces/lokeshkumar79/facial-emotion-recognition
- Dataset FER-2013 (Kaggle): https://www.kaggle.com/datasets/msambare/fer2013

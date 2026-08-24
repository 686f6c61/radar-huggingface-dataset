# sifat-febo/banglish-sentiment

## Resumen

Banglish Sentiment es un modelo de clasificación de sentimiento diseñado específicamente para el análisis de texto Banglish, es decir, bengalí escrito fonéticamente en alfabeto latino, una práctica muy extendida entre las comunidades bengalíes en línea y la diáspora. Desarrollado por Sifat Febo, el modelo clasifica comentarios en cuatro categorías: positivo, negativo, neutral y mixto, siendo esta última la más compleja al combinar elogios y quejas en una misma frase. Se basa en banglish-encoder, una versión de MuRIL preentrenada adicionalmente en Banglish, y se entrena sobre el dataset BnSentMix con aproximadamente 20 000 comentarios etiquetados manualmente.

El modelo tiene una arquitectura BERT base con 236 millones de parámetros y una longitud de contexto efectiva de unas 50 palabras, pensada para comentarios cortos e informales. Su principal contribución es resolver un problema de bajo recurso lingüístico en el que los modelos multilingües estándar no rinden bien. El autor publica el modelo bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, y reporta un macro-F1 de 0.74 en un conjunto de prueba de 1975 comentarios, frente a un baseline de 0.12 de la clase más frecuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (MuRIL base) con clasificador lineal sobre el promedio de tokens |
| Parámetros totales | 236 646 144 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ≈50 palabras (según la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | bn, en (Banglish, bengalí fonético en latino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye head.safetensors separado) |

## Arquitectura y entrenamiento

El modelo se basa en MuRIL (Multilingual Representation for Indian Languages), un transformer BERT multilingüe de Google con 12 capas y 768 dimensiones ocultas. Sobre esta base, el autor preentrenó adicionalmente el modelo en datos Banglish para crear banglish-encoder, que a su vez se fine-tuneó para la clasificación de sentimiento. La arquitectura de clasificación no usa el token `[CLS]` tradicional, sino que aplica un promedio sobre todas las representaciones de los tokens (`mean pooling`) y sobre ese vector aplica una capa lineal con softmax. Este diseño obliga a separar el clasificador en un archivo `head.safetensors` independiente, ya que el pipeline estándar de HuggingFace no soporta directamente esta operación de pooling.

El entrenamiento se realizó sobre el dataset BnSentMix, con unas 20 000 muestras etiquetadas manualmente de comentarios con código de cambio. El proceso es de fine-tuning supervisado, sin etapas de RLHF ni DPO. La model card indica que el backbone banglish-encoder superó al MuRIL stock en cinco ejecuciones con semillas distintas para esta tarea concreta, y que el modelo final es la variante ganadora de ese experimento. No se detallan hiperparámetros de entrenamiento ni número de épocas.

## Capacidades

- Clasificación de sentimiento en cuatro clases: positivo, negativo, neutral y mixto.
- Procesamiento de texto Banglish, es decir, bengalí escrito con caracteres latinos, con mezcla de inglés.
- Funciona sobre comentarios cortos e informales, típicos de redes sociales y foros.
- No incluye capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio.
- Soporte multilingüe limitado al par bengalí-inglés en forma de Banglish.
- No detecta sarcasmo como categoría, ni hate speech, ni temas específicos.

## Casos de uso

- Moderación de comentarios en plataformas sociales: el modelo clasifica automáticamente los comentarios de usuarios bengalíes en tiempo real, permitiendo priorizar revisiones humanas en casos de sentimiento negativo o mixto.
- Análisis de reseñas de productos en tiendas online: ayuda a agrupar opiniones positivas, negativas y mixtas para generar resúmenes de valoración de productos en mercados de habla bengalí.
- Monitorización de campañas de marketing: empresas pueden evaluar la recepción de una campaña publicitaria en comunidades de la diáspora bengalí, clasificando los comentarios en cuatro estados emocionales.
- Investigación de mercado para servicios locales: permite a negocios de Bangladesh o India oriental medir la satisfacción del cliente a partir de comentarios en Banglish sin necesidad de etiquetado manual.
- Filtrado de comentarios en foros de noticias: los medios pueden usar el modelo para detectar reacciones mayoritariamente negativas o mixtas ante una noticia y moderar el discurso.
- Análisis de feedback en aplicaciones móviles: los desarrolladores pueden clasificar los comentarios de la Play Store o App Store de usuarios bengalíes para priorizar errores o mejoras según el sentimiento.

## Benchmarks y rendimiento

La model card reporta un macro-F1 de 0.74 sobre un conjunto de prueba de 1975 comentarios held-out, con clasificación en cuatro clases. El baseline de predecir siempre la clase más frecuente obtiene un macro-F1 de 0.12. Además, el autor realizó una revisión manual de 60 respuestas y encontró que los errores se concentran en casos genuinamente ambiguos (preguntas con tono de queja, elogios sarcásticos), pero no se observaron casos en los que un comentario claramente positivo se clasificara como negativo.

No se han publicado resultados de benchmarks en la información disponible más allá de este macro-F1. No hay comparaciones numéricas con otros modelos en el mismo dataset.

## Requisitos de hardware

- VRAM estimada: con 266M parámetros, el modelo en float32 ocupa aproximadamente 1 GB. En cuantización de 8 bits, puede caber en menos de 0.5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1050 Ti o superior. También puede ejecutarse en CPU con razonable velocidad para inferencia por lotes.
- Compatible con hardware consumer: sí, funciona en CPU y en GPUs de gama baja.
- Opciones de despliegue: HuggingFace Transformers, endpoints compatibles con la librería, y puede exportarse a ONNX para otros runtimes. No se menciona soporte para vLLM, llama.cpp ni Ollama, aunque al ser un modelo BERT podría convertirse.
- Latencia y throughput: no especificados, pero al ser un modelo pequeño, la inferencia en CPU de un solo texto debería ser del orden de milisegundos.

## Comparativa con modelos similares

No hay datos de modelos comparables específicos para análisis de sentimiento en Banglish con la misma configuración y dataset. Como referencia general, se puede comparar con MuRIL base (google/muril-base-cased), que es el modelo subyacente y que no fue preentrenado específicamente en Banglish. La model card afirma que banglish-encoder superó a MuRIL stock en cinco runs para esta tarea, pero no se ofrecen cifras numéricas. Otros modelos multilingües como XLM-R o mBERT no han sido evaluados en este contexto en la información disponible. Por tanto, se indica "no disponible" para una comparativa formal.

## Limitaciones y advertencias

- El modelo está limitado a textos cortos de aproximadamente 50 palabras; textos más largos se truncan y pierden información.
- No detecta sarcasmo como categoría, ni hate speech, ni temas específicos. Solo clasifica en las cuatro clases fijas.
- La clase "mixto" es la más difícil y la de peor rendimiento, según la propia model card.
- El modelo está entrenado específicamente para Banglish; su rendimiento en bengalí formal o en inglés estándar no está validado.
- No se han publicado estudios sobre sesgos demográficos o sociales del dataset de entrenamiento; es posible que el modelo refleje sesgos presentes en los comentarios de BnSentMix.
- La licencia Apache 2.0 permite uso comercial, pero el dataset BnSentMix tiene licencia MIT y la base MuRIL es Apache 2.0; se debe verificar la compatibilidad de las licencias en caso de redistribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sifat-febo/banglish-sentiment
- Modelo base (banglish-encoder): https://huggingface.co/sifat-febo/banglish-encoder
- Dataset BnSentMix: https://huggingface.co/datasets/aplycaebous/BnSentMix
- MuRIL base: https://huggingface.co/google/muril-base-cased
- Paper relacionado (investigación externa sobre análisis de sentimiento Banglish): https://www.researchgate.net/profile/Md-Utsha/publication/392565040_Sentiment_Analysis_for_Banglish_Text_using_Machine_Learning_Approach/links/684bda8fe62d333cdd17d0f4/Sentiment-Analysis-for-Banglish-Text-using-Machine-Learning-Approach.pdf

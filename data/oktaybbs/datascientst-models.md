# OKTAYBBS/DataScientst-models

## Resumen

El repositorio `OKTAYBBS/DataScientst-models` no contiene un único modelo, sino una colección de 30 modelos de machine learning y deep learning entrenados por ALİ OKTAY BBUS (OKTAYBBS) para cubrir 10 categorías distintas de problemas de ciencia de datos. Incluye modelos de regresión, clasificación, clustering, visión por computador, procesamiento de lenguaje natural, sistemas de recomendación, series temporales y redes neuronales profundas, todos ellos entrenados con conjuntos de datos de Kaggle.

La colección está pensada como un kit de herramientas para prototipado rápido, demostraciones educativas y aplicaciones sencillas. Los modelos se distribuyen en formatos estándar: archivos `.pkl` (joblib) para scikit-learn y archivos `.keras` para TensorFlow/Keras, lo que facilita su integración en pipelines existentes. El tamaño total del repositorio es de 0,3 GB, lo que indica que son modelos ligeros, ejecutables en hardware modesto.

Su relevancia radica en que ofrece una variedad de soluciones listas para usar en tareas comunes de análisis de datos, desde predicción de precios hasta detección de spam o segmentación de clientes, con métricas de rendimiento documentadas para cada modelo. Está licenciado bajo MIT, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección heterogénea: scikit-learn (Random Forest, regresiones, clustering, etc.), TensorFlow/Keras (CNN) y modelos de similitud |
| Parametros totales | No disponible (cada modelo tiene sus propios parámetros; no se documenta el total) |
| Parametros activos | No aplicable (no es un modelo único) |
| Longitud de contexto | No aplicable (modelos de ML clásico, no generativos) |
| Tipos de cuantizacion | No aplicable (pesos en precisión estándar de scikit-learn/TensorFlow) |
| Idiomas soportados | Turco (tr), inglés (en) — solo relevante para los modelos de NLP |
| Licencia | MIT |
| Formato de pesos | `.pkl` (joblib) para modelos scikit-learn, `.keras` para TensorFlow, `.pkl` adicionales para vectorizers y scalers |

## Arquitectura y entrenamiento

La colección agrupa modelos entrenados con diferentes algoritmos según la tarea. Para regresión, clasificación y clustering se emplean modelos clásicos de scikit-learn (como Random Forest, regresión lineal, KMeans, etc.), mientras que para visión por computador se utilizan redes convolucionales (CNN) implementadas en TensorFlow/Keras. También se incluyen modelos basados en similitud para sistemas de recomendación (matrices de similitud) y un generador de texto basado en cadenas de Markov.

Los datos de entrenamiento provienen de conjuntos de datos públicos de Kaggle, aunque no se especifica el volumen exacto de datos ni el proceso de entrenamiento (épocas, hiperparámetros, etc.). No se menciona el uso de técnicas como RLHF o DPO, ya que no son modelos generativos de lenguaje. Las métricas reportadas en la model card (R², accuracy, silhouette) indican que los modelos fueron evaluados en conjuntos de validación o prueba, pero no se detalla la metodología de división.

## Capacidades

- Regresión: predicción de valores continuos (precio del oro, puntuaciones de exámenes, tarifas de taxi).
- Clasificación: clasificación de datos tabulares (segmento de precio de móviles, calidad del vino, predicción de abandono de clientes).
- Clustering: agrupación no supervisada (jugadores de la NBA, segmentación de tarjetas de crédito, canciones de Spotify).
- Visión por computador: detección de mascarillas (CNN) y reconocimiento de emociones faciales (CNN).
- Procesamiento de lenguaje natural: detección de spam en SMS, análisis de sentimiento en IMDb, detección de noticias falsas.
- Sistemas de recomendación: recomendación de películas, libros y canciones basada en similitud.
- Series temporales: predicción de precios de acciones (AAPL), condiciones meteorológicas y ventas de tiendas (Walmart).
- Generación de texto: generador de texto basado en cadenas de Markov (modelo `text_robot_model.pkl`).
- Integración con Streamlit: se proporciona una interfaz de demostración en Hugging Face Spaces.

## Casos de uso

- Predicción de precios de materias primas: el modelo `gold_model.pkl` puede estimar el precio del oro a partir de variables como precio de plata, tipo de cambio, etc., útil para aplicaciones de asesoramiento financiero o paneles de análisis.
- Segmentación de clientes para marketing: los modelos de clustering (`cc_model.pkl`, `spotify_model.pkl`) permiten agrupar clientes o usuarios por comportamiento, facilitando campañas personalizadas.
- Detección de fraude o spam en comunicaciones: el modelo `spam_model.pkl` clasifica mensajes SMS como spam o legítimos, integrable en sistemas de filtrado de correo o mensajería.
- Análisis de sentimiento en reseñas de productos: `imdb_model.pkl` puede analizar opiniones de usuarios para monitorizar la percepción de una marca o producto en plataformas de reseñas.
- Recomendación de contenido en plataformas de streaming: los modelos de similitud (`movie_similarity.pkl`, `song_similarity.pkl`) permiten sugerir películas o canciones basadas en el historial del usuario.
- Control de calidad en manufactura: el modelo de clasificación `wine_model.pkl` puede evaluar la calidad de productos según características fisicoquímicas, útil en procesos de inspección automatizada.
- Predicción de demanda en retail: el modelo `walmart_model.pkl` ayuda a anticipar ventas por tienda, optimizando inventarios y logística.
- Diagnóstico médico asistido por imagen: el modelo `pneumonia_model.keras` clasifica radiografías de tórax para detectar neumonía, como apoyo en entornos clínicos (siempre con supervisión médica).

## Benchmarks y rendimiento

La model card reporta métricas para cada modelo individual. A continuación se presentan las métricas documentadas:

| Modelo | Tarea | Métrica | Valor |
|---|---|---|---|
| gold_model | Regresión (precio del oro) | R² | 0.990 |
| student_model | Regresión (puntuación de examen) | R² | 0.849 |
| uber_model | Regresión (tarifa de taxi) | R² | 0.778 |
| mobile_model | Clasificación (segmento de móvil) | Accuracy | 81.2% |
| wine_model | Clasificación (calidad del vino) | Accuracy | 67.5% |
| churn_model | Clasificación (abandono de clientes) | Accuracy | 78.9% |
| nba_model | Clustering (jugadores NBA) | Silhouette | 0.452 |
| cc_model | Clustering (segmentación tarjetas) | Silhouette | 0.531 |
| spotify_model | Clustering (canciones) | Silhouette | 0.327 |
| mask_model | Visión (detección de mascarilla) | Accuracy | 82.5% |
| spam_model | NLP (detección de spam) | Accuracy | 98.0% |
| imdb_model | NLP (análisis de sentimiento) | Accuracy | 87.3% |
| news_model | NLP (noticias falsas) | Accuracy | 97.6% |
| stock_model | Series temporales (AAPL) | R² | 0.975 |
| weather_model | Series temporales (clima) | R² | 0.912 |
| walmart_model | Series temporales (ventas) | R² | 0.767 |
| pneumonia_model | CNN (neumonía) | Val Accuracy | 92.5% |
| fer_model | CNN (emociones faciales) | Val Accuracy | 65.4% |

No se proporcionan comparativas con otros modelos o conjuntos de referencia estándar como MMLU o HumanEval, ya que no son modelos de lenguaje generativos.

## Requisitos de hardware

- Los modelos son ligeros: el repositorio completo ocupa 0,3 GB, por lo que caben en cualquier máquina con unos pocos GB de RAM.
- Los modelos `.pkl` de scikit-learn se ejecutan en CPU sin necesidad de GPU.
- Los modelos `.keras` (CNN) pueden ejecutarse en CPU, aunque para inferencia más rápida se recomienda una GPU básica (por ejemplo, NVIDIA GTX 1650 o superior) si se procesan lotes grandes de imágenes.
- No se requieren GPUs de gama alta; cualquier GPU con al menos 2 GB de VRAM es suficiente para los modelos CNN incluidos.
- Opciones de despliegue: se puede cargar directamente con joblib o TensorFlow/Keras en Python. No se menciona compatibilidad con vLLM, llama.cpp u otros servidores de inferencia, ya que no son modelos generativos.
- La latencia es baja: para modelos tabulares, la inferencia es de milisegundos; para CNN, depende del tamaño de la imagen, pero en CPU típicamente menos de 100 ms por imagen.

## Comparativa con modelos similares

No existe una comparativa directa con otros modelos, ya que esta colección no corresponde a un único modelo de referencia, sino a un conjunto heterogéneo de algoritmos clásicos. Se podría comparar individualmente cada modelo con alternativas estándar de la literatura (por ejemplo, Random Forest vs. XGBoost para clasificación), pero no se dispone de datos de rendimiento para esas alternativas en los mismos conjuntos de datos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Los modelos fueron entrenados con conjuntos de datos de Kaggle, que pueden no ser representativos de escenarios reales de producción. Su rendimiento puede degradarse con datos fuera de distribución.
- No se documentan sesgos específicos, pero al ser modelos entrenados con datos públicos, pueden heredar sesgos presentes en esos datos (por ejemplo, en el análisis de sentimiento o detección de noticias falsas).
- Riesgo de alucinación: no aplica, ya que no son modelos generativos de lenguaje, excepto el generador de texto basado en Markov, que produce texto sin coherencia semántica real.
- Limitaciones de contexto: los modelos de NLP trabajan con representaciones de bolsa de palabras o TF-IDF, por lo que no capturan contexto secuencial complejo.
- Para uso en producción, se recomienda reentrenar los modelos con datos específicos del dominio y validar su rendimiento en condiciones reales.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento o la idoneidad para fines concretos.
- Los modelos de visión (CNN) tienen precisión limitada (por ejemplo, 65,4% en reconocimiento de emociones), por lo que no son adecuados para aplicaciones críticas sin un reentrenamiento sustancial.

## Enlaces

- [Repositorio HuggingFace: OKTAYBBS/DataScientst-models](https://huggingface.co/OKTAYBBS/DataScientst-models)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/OKTAYBBS/DataScientst)
- [Código fuente en GitHub](https://github.com/oktaybobus/DataScientst)
- [Perfil del autor en Hugging Face](https://huggingface.co/OKTAYBBS)

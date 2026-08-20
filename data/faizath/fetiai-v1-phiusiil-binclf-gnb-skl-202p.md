# faizath/fetiai-v1-phiusiil-binclf-gnb-skl-202p

## Resumen

`fetiai-v1-phiusiil-binclf-gnb-skl-202p` es un clasificador tabular binario para detección de phishing en URLs, desarrollado por el grupo 16 de la asignatura IF3070 (Fundamentos de Inteligencia Artificial) del STEI ITB (Institut Teknologi Bandung). El modelo emplea un algoritmo Gaussian Naive Bayes implementado con scikit-learn, entrenado sobre el dataset PhiUSIIL (Phishing URL Dataset) con 49 características numéricas preextraídas. Con solo 202 parámetros, es un modelo extremadamente ligero que se sirve a través de una API HTTP de un solo modelo.

El modelo resuelve el problema de clasificar si una URL es legítima o de phishing a partir de un vector de características (longitud de la URL, longitud del dominio, uso de HTTPS, etc.), sin procesar el texto de la URL directamente. Su relevancia radica en ser un ejemplo didáctico de aplicación de Naive Bayes a un problema de seguridad, con un rendimiento declarado de accuracy 0.9819 sobre el conjunto de datos de validación. No obstante, el propio autor advierte que es una reimplementación de trabajo de curso, no un producto de seguridad listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gaussian Naive Bayes (scikit-learn) |
| Parametros totales | 202 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, entrada de 49 features) |
| Tipos de cuantizacion | no aplica (modelo clásico, no requiere cuantización) |
| Idiomas soportados | no disponible (procesa vectores numéricos, no texto) |
| Licencia | MIT |
| Formato de pesos | joblib (scikit-learn) |

## Arquitectura y entrenamiento

El modelo es un clasificador Gaussian Naive Bayes, un algoritmo probabilístico que asume independencia condicional entre las características y modela cada una mediante una distribución gaussiana. En este caso, el clasificador se entrena sobre 49 características numéricas extraídas de URLs (longitudes, presencia de protocolos, etc.) provenientes del dataset PhiUSIIL. El entrenamiento incluyó técnicas de balanceo de clases mediante SMOTE (Synthetic Minority Over-sampling Technique) y un proceso de ingeniería de características. El modelo resultante almacena las medias y desviaciones estándar por clase para cada característica, lo que explica su reducido número de parámetros (202). No se dispone de información detallada sobre el número de muestras de entrenamiento ni sobre el proceso de validación más allá de los resultados declarados.

## Capacidades

- Clasificación binaria de URLs: distingue entre legítima y phishing a partir de un vector de 49 características numéricas.
- Entrada tabular: acepta un JSON con las 49 features, permitiendo valores nulos (hasta 12 de ellas están permanentemente nulas por no superar el acuerdo de extracción del proyecto padre).
- API HTTP: expone endpoints `POST /predict` (una fila), `POST /predict/batch` (hasta 1000 filas), `GET /metadata`, `GET /healthz` y `GET /readyz`.
- Autoverificación: incluye una prueba de autocomprobación con una fila dorada para verificar que el artefacto reproduce su predicción registrada.
- Despliegue inmediato: el modelo está commiteado en el repositorio (669 KB), por lo que no requiere paso de entrenamiento ni descarga adicional.
- Integración con Docker: la imagen hornea el modelo y falla si no reproduce su fila dorada.

## Casos de uso

- Filtrado de URLs en tiempo real: el modelo puede integrarse en un proxy o extensión de navegador para puntuar cada URL visitada y bloquear o advertir sobre posibles phishing. Su baja latencia (inferencia en microsegundos) lo hace adecuado para este escenario, aunque su precisión limitada exige un umbral conservador.
- Prototipado de sistemas de seguridad: como demostración de un pipeline completo de detección de phishing (extracción de features, clasificación, API), sirve como base para que estudiantes o desarrolladores aprendan a construir servicios de clasificación tabular.
- Educación en machine learning: al ser un modelo de 202 parámetros, es ideal para explicar el funcionamiento interno de Naive Bayes, el impacto del balanceo de clases (SMOTE) y la evaluación de métricas como precisión y recall.
- Evaluación de características: el modelo puede usarse para analizar qué features del dataset PhiUSIIL son más discriminativas, ya que los parámetros (medias y desviaciones) son interpretables.
- Servicio de clasificación por lotes: el endpoint `POST /predict/batch` permite procesar hasta 1000 filas de características en una sola petición, útil para auditar listas de URLs previamente extraídas.
- Componente de un sistema multi-modelo: el proyecto padre (phishing-url-classifier) puntúa cada URL con cuatro modelos distintos; este modelo puede servir como uno de los votos en un ensemble.

## Benchmarks y rendimiento

El autor declara los siguientes resultados sobre el dataset PhiUSIIL (conjunto de validación, no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Accuracy | 0.9819 |
| Precision (phishing) | 0.8774 |
| Recall (phishing) | 0.8880 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un clasificador Naive Bayes con 202 parámetros; la inferencia se reduce a calcular probabilidades gaussianas, por lo que se ejecuta en cualquier CPU moderna sin necesidad de GPU.
- Memoria: el artefacto ocupa 669 KB en disco; en memoria RAM apenas supera unos pocos megabytes.
- GPU: no requerida en absoluto.
- Despliegue: se sirve mediante una API HTTP construida con scikit-learn y Docker; también puede integrarse directamente en aplicaciones Python usando joblib para cargar el modelo.
- Latencia: no se han publicado mediciones oficiales, pero al ser un modelo de 202 parámetros, la latencia por predicción es del orden de microsegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor menciona un modelo hermano (`fetiai-v1-phiusiil-binclf-gnb-scratch-198p`) que implementa el mismo algoritmo desde cero, pero no se ofrecen métricas comparativas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No es un producto de seguridad: el propio autor advierte explícitamente que es una reimplementación de trabajo de curso, no un sistema de seguridad fiable.
- Dataset estático: entrenado sobre un dataset de 2023-24, no tiene conocimiento de campañas de phishing posteriores a su entrenamiento.
- Sin inteligencia de amenazas: no incorpora blocklists, ni fuentes de threat intelligence, ni actualizaciones en tiempo real.
- Entrada limitada a features preextraídas: el modelo no procesa la URL en texto; depende de un extractor de características externo (del proyecto padre) que debe ejecutarse bajo guardas de seguridad (SSRF, etc.).
- Riesgo de falsos negativos: con un recall de phishing de 0.888, aproximadamente un 11% de las URLs maliciosas podrían clasificarse como legítimas, lo que es inaceptable para uso en producción.
- Sesgo del dataset: el dataset PhiUSIIL puede no representar la diversidad de URLs reales (idiomas, dominios, técnicas de ofuscación), lo que limita la generalización.
- Licencia MIT: permite uso comercial, pero la ausencia de garantías y el contexto educativo hacen desaconsejable su uso en entornos críticos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/faizath/fetiai-v1-phiusiil-binclf-gnb-skl-202p)
- [Repositorio GitHub del modelo](https://github.com/fetiai/fetiai-v1-phiusiil-binclf-gnb-skl-202p)
- [Aplicación completa (proyecto padre)](https://github.com/fetiai/phishing-url-classifier)
- [Demo en vivo](https://phiusiil.faizath.com)
- [Dataset PhiUSIIL en UCI](https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset)

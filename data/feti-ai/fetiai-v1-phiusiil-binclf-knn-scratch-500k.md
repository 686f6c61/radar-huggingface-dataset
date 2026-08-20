# feti-ai/fetiai-v1-phiusiil-binclf-knn-scratch-500k

## Resumen

fetiai-v1-phiusiil-binclf-knn-scratch-500k es un clasificador binario de URLs de phishing desarrollado por el grupo 16 de la asignatura IF3070 Foundations of Artificial Intelligence del STEI ITB (Institut Teknologi Bandung). Se trata de una implementación de KNN (k-vecinos más cercanos) escrita desde cero con NumPy, que opera sobre un vector de características tabulares de 49 dimensiones extraídas de URLs. El modelo está entrenado sobre el dataset PhiUSIIL (Phishing URL Dataset) y se sirve como una API HTTP de un solo modelo.

A diferencia de los modelos de lenguaje, este no procesa texto directamente: la URL nunca llega al modelo, sino que se transforma en un vector numérico previamente. El repositorio incluye el artefacto del modelo (1.0 MB) y un servicio con rutas de predicción, metadatos y health checks. Es un trabajo académico de reimplementación, no un producto de seguridad listo para producción, y sus autores lo advierten explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KNN (k-vecinos más cercanos) implementado desde cero con NumPy |
| Parametros totales | 500.001 (tamaño del artefacto; KNN no tiene parámetros entrenables en sentido clásico) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada tabular de 49 características, no texto) |
| Tipos de cuantizacion | no disponible (modelo numérico, no requiere cuantización) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto se sirve como archivo binario dentro del repositorio, 1.0 MB) |

## Arquitectura y entrenamiento

El modelo es un clasificador KNN entrenado desde cero, sin usar librerías de machine learning de alto nivel (solo NumPy y pandas). El algoritmo de KNN almacena los vectores de entrenamiento y clasifica nuevas muestras por proximidad (distancia) a los k vecinos más cercanos. El entrenamiento se realizó sobre el dataset PhiUSIIL, que contiene características extraídas de URLs reales de phishing y legítimas. Se aplicó SMOTE (Synthetic Minority Over-sampling Technique) para balancear las clases y se realizó ingeniería de características. El modelo final tiene 500.001 parámetros según la documentación, aunque en KNN esto se refiere al tamaño del conjunto de vectores de soporte, no a pesos aprendidos.

El servicio expone una API con rutas `POST /predict` (una fila), `POST /predict/batch` (hasta 1000 filas), `GET /metadata` (contrato de características), `GET /healthz` y `GET /readyz`. El modelo está comprometido en el repositorio, por lo que no requiere paso de entrenamiento ni descarga adicional. La imagen Docker incluye el modelo y falla si no reproduce su propia fila dorada de autocomprobación.

## Capacidades

- Clasificación binaria de URLs: distingue entre phishing y legítima a partir de un vector de 49 características numéricas.
- Entrada tabular: acepta valores nulos para características no determinables; 12 de las 49 columnas están permanentemente nulas por fallos en el acuerdo de extracción del proyecto padre.
- API HTTP: ofrece predicción individual y por lotes, con metadatos del contrato de características y health checks.
- Autocomprobación: incluye una prueba de reproducción de una fila dorada para verificar que el artefacto funciona correctamente.
- Despliegue sencillo: se sirve con Docker, con la imagen que hornea el modelo.
- Sin capacidades de lenguaje: no procesa texto, no genera respuestas, no soporta tool calling ni agentes.

## Casos de uso

- Filtrado de URLs en entornos académicos: el modelo puede integrarse en proyectos de investigación o prácticas de ingeniería para demostrar la clasificación de phishing con KNN, sirviendo como referencia didáctica.
- Prototipado de sistemas de detección de phishing: como punto de partida para un pipeline de extracción de características y clasificación, aunque no debe usarse en producción real.
- Evaluación de técnicas de balanceo de datos: al usar SMOTE, permite estudiar el impacto del sobremuestreo en métricas de precisión y recall para clases desbalanceadas.
- Comparación de algoritmos clásicos: puede servir como baseline frente a modelos más complejos (regresión logística, SVM, redes neuronales) en el mismo dataset.
- Demostración de despliegue de modelos con Docker: el repositorio muestra cómo empaquetar un modelo en una imagen y exponerlo como API, útil para cursos de MLOps.
- Análisis de características de URLs: el endpoint de metadatos permite inspeccionar qué características se usan y cuáles están demotadas, útil para entender la extracción de features en phishing.

## Benchmarks y rendimiento

Según los resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Accuracy | 0.9804 |
| Precision (phishing) | 0.9814 |
| Recall (phishing) | 0.7593 |

No se han publicado comparaciones con otros modelos en la información disponible. El recall de phishing es notablemente inferior a la precisión, lo que indica que el modelo tiende a clasificar como legítimas algunas URLs de phishing (falsos negativos). Esto es relevante para cualquier uso práctico.

## Requisitos de hardware

- El modelo es extremadamente ligero: el artefacto ocupa 1.0 MB, por lo que cabe en cualquier sistema.
- Inferencia en CPU: no requiere GPU. Un procesador moderno puede ejecutar predicciones en milisegundos para una sola fila.
- Memoria RAM: menos de 100 MB para cargar el modelo y los datos de soporte.
- Despliegue: se sirve como API con Docker; también puede ejecutarse directamente con Python (make serve).
- Latencia: no se han publicado mediciones oficiales, pero al ser KNN con 500k vectores, la predicción por lotes puede ser más lenta que con modelos paramétricos; se recomienda usar el endpoint batch para volúmenes grandes.
- No requiere aceleración por hardware especializado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Al ser un KNN from scratch sobre un dataset específico, no hay alternativas directas documentadas en el repositorio. Se podría comparar con otros clasificadores de phishing (p. ej., regresión logística o random forest sobre el mismo dataset), pero no se han publicado resultados en la información disponible.

## Limitaciones y advertencias

- Es un trabajo de curso, no un producto de seguridad: los autores lo declaran explícitamente. No debe usarse para decidir si un enlace es seguro.
- Dataset estático: entrenado sobre datos de 2023-24, sin inteligencia de amenazas, sin listas negras y sin conocimiento de campañas posteriores a su entrenamiento.
- Recall de phishing bajo (0.7593): muchos casos de phishing reales podrían clasificarse como legítimos, lo que lo hace inadecuado para protección en producción.
- Entrada limitada: solo acepta vectores de características preextraídas; no procesa URLs directamente. El servicio no incluye extractor de características ni protección SSRF.
- Sin soporte multilingüe ni de lenguaje natural: es un clasificador tabular, no un modelo de texto.
- Sin garantías de rendimiento: las métricas declaradas no están verificadas de forma independiente y pueden no reproducirse en otros entornos.
- Licencia MIT: permite uso comercial, pero con las limitaciones funcionales descritas.

## Enlaces

- [HuggingFace - feti-ai/fetiai-v1-phiusiil-binclf-knn-scratch-500k](https://huggingface.co/feti-ai/fetiai-v1-phiusiil-binclf-knn-scratch-500k)
- [Repositorio GitHub - phishing-url-classifier](https://github.com/fetiai/phishing-url-classifier)
- [Demo en vivo](https://phiusiil.faizath.com)
- [Dataset PhiUSIIL en UCI](https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset)

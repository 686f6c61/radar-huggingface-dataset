# Martinagg/toxic-tfidf-lr

## Resumen

`Martinagg/toxic-tfidf-lr` es un modelo de clasificación de toxicidad en texto desarrollado por el usuario Martinagg como parte del proyecto de fin de curso *Trust in Automated Moderation of Toxic Comments* (ECE 4424 / CS 4824). No es una red neuronal ni un modelo de lenguaje: es un pipeline clásico de scikit-learn que combina un `TfidfVectorizer` (unigramas y bigramas de palabras, `min_df=5`, 200.000 características) con una regresión logística (`C=30`) para producir una probabilidad de toxicidad por comentario.

El modelo se entrenó sobre el dataset Jigsaw Unintended Bias, con un split del 80% agrupado por artículo para evitar filtración de datos entre entrenamiento y validación. La etiqueta objetivo es `target >= 0.5`. Su propósito es servir como baseline reproducible y ligero para moderación automática de comentarios, no como solución de producción.

Es relevante ahora como referencia metodológica: demuestra que un pipeline lineal con TF-IDF sigue siendo competitivo en tareas de moderación de texto (ROC AUC 0,93, PR-AUC 0,69 en test) y, sobre todo, expone de forma explícita el sesgo de identidad que afecta a este tipo de sistemas. Su licencia MIT y su tamaño mínimo (repo de 0,0 GB) lo hacen fácil de auditar y desplegar en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: TF-IDF (unigramas + bigramas) + regresión logística |
| Parámetros totales | No disponible (modelo lineal; el vectorizador tiene 200.000 características) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de bolsa de palabras, sin ventana de contexto definida) |
| Tipos de cuantización | No aplica (pesos en precisión nativa de scikit-learn) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `.joblib` (pickles de scikit-learn: `vectorizer.joblib` y `classifier.joblib`) |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal clásico, no un transformer. El `TfidfVectorizer` extrae unigramas y bigramas de palabras con `min_df=5` y un vocabulario de 200.000 características, aplicando ponderación TF-IDF. Sobre esa representación dispersa se entrena una `LogisticRegression` con `C=30`, hiperparámetro seleccionado mediante PR-AUC en validación.

El entrenamiento se realizó sobre el dataset Jigsaw Unintended Bias (`train.csv`), con un split del 80% agrupado por artículo para evitar que comentarios del mismo artículo aparecieran en entrenamiento y validación a la vez. La etiqueta es binaria (`target >= 0.5`). No se documenta uso de RLHF, DPO ni ningún tipo de ajuste por preferencias; tampoco se especifica el número de tokens de entrenamiento. El modelo se guardó con scikit-learn 1.9.1 y requiere esa misma versión para cargarse correctamente.

## Capacidades

- Clasificación binaria de toxicidad en comentarios en inglés, con salida de probabilidad vía `predict_proba`.
- Detección de lenguaje tóxico a nivel de comentario completo (no por token ni por span).
- Pipeline ligero y determinista, adecuado como baseline o como filtro de primera pasada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües: solo inglés.
- Sin modo de razonamiento (thinking mode), visión ni audio.
- Sin generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Baseline de moderación en investigación: usar el modelo como referencia inferior contra la que comparar clasificadores neuronales o LLMs en experimentos de toxicidad, gracias a su reproducibilidad y a sus métricas publicadas (F1 0,61, ROC AUC 0,93).
- Filtro de primera pasada en pipelines de moderación: aplicar el clasificador a todos los comentarios entrantes y derivar solo los que superen un umbral a un modelo más caro, reduciendo coste computacional.
- Auditoría de sesgo de identidad: el propio autor documenta que las palabras de identidad tienen pesos positivos, lo que convierte al modelo en un caso de estudio útil para enseñar y medir sesgos en sistemas de moderación.
- Prototipado rápido en entornos sin GPU: al ser un pipeline de scikit-learn, se ejecuta en CPU en milisegundos y permite validar una idea de producto antes de invertir en infraestructura.
- Docencia y ejercicios de ML aplicado: sirve como ejemplo completo de vectorización TF-IDF, selección de hiperparámetros por PR-AUC y evaluación con split agrupado.
- Etiquetado asistido de datasets: usar las probabilidades del modelo para pre-anotar grandes volúmenes de comentarios y priorizar la revisión humana en los casos de mayor incertidumbre.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test (177.635 comentarios, umbral 0,5):

| Métrica | Valor |
|---|---|
| Precisión | 0,73 |
| Recall | 0,53 |
| F1 | 0,61 |
| ROC AUC | 0,93 |
| PR-AUC | 0,69 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el pipeline completo (vectorizador + regresión logística) se ejecuta en CPU sin GPU; el repo ocupa 0,0 GB.
- VRAM: no requiere GPU; 0 GB de VRAM.
- GPU recomendadas: no aplica.
- Cabe en cualquier GPU consumer y en cualquier máquina con CPU moderna; el cuello de botella es la memoria RAM para cargar el vocabulario de 200.000 características (del orden de decenas de MB).
- Opciones de despliegue: carga directa con `joblib` y scikit-learn 1.9.1, o exposición vía FastAPI/Flask envolviendo `predict_proba`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están pensados para modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo se espera latencia de milisegundos por comentario en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Martinagg/toxic-tfidf-lr` | TF-IDF + regresión logística | Lineal, 200.000 características | No aplica | MIT | Hugging Face |
| Modelos Transformer de clasificación de toxicidad (p. ej. variantes de BERT) | Transformer encoder | No disponible | Típicamente 512 tokens | Variable según modelo | Hugging Face |
| APIs comerciales de moderación (p. ej. Perspective API) | Servicio propietario | No disponible | No disponible | Propietaria | API externa |

No se dispone de datos de benchmarks comparativos directos en la información proporcionada; la comparación se limita a características estructurales.

## Limitaciones y advertencias

- Sesgo de identidad documentado por el autor: las palabras de identidad tienen pesos positivos, por lo que el modelo bloquea con frecuencia comentarios inocentes que mencionan raza o religión.
- Riesgo de falsos positivos elevado en contextos donde se discute sobre identidad sin toxicidad.
- Recall bajo (0,53): aproximadamente la mitad de los comentarios tóxicos del test no se detectan con el umbral 0,5.
- Solo inglés; no hay soporte para otros idiomas.
- Modelo de bolsa de palabras: no captura negación compleja, ironía, sarcasmo ni dependencias de largo alcance.
- Dependencia estricta de scikit-learn 1.9.1 para cargar los `.joblib`; versiones distintas pueden fallar.
- Los archivos `.joblib` son pickles: solo deben cargarse desde fuentes de confianza, ya que la deserialización puede ejecutar código arbitrario.
- No apto como sistema de moderación en producción sin supervisión humana y sin auditoría de sesgo adicional.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/Martinagg/toxic-tfidf-lr
- Repositorio de código: https://github.com/martinagg7/ML-ToxicModeration
- Dataset Jigsaw Unintended Bias: no se proporciona enlace directo en la información disponible.

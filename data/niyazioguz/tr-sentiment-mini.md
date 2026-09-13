# niyazioguz/tr-sentiment-mini

## Resumen
tr-sentiment-mini es un clasificador de análisis de sentimiento para turco publicado en HuggingFace por el usuario niyazioguz. No se trata de un modelo de lenguaje generativo ni de una red neuronal profunda: es un pipeline clásico de scikit-learn que combina vectorización TF-IDF con un clasificador lineal LinearSVC. El problema que resuelve es acotado y concreto: asignar a un texto en turco una de tres etiquetas (positivo, negativo o neutro).

Su relevancia actual es la de un baseline extremadamente ligero y barato de ejecutar. El autor reporta que la versión 3 se entrena por completo en CPU en 55 segundos sobre 440.679 ejemplos, alcanzando una accuracy de 0,9476 y un macro-F1 de 0,9168 sobre 48.965 ejemplos de test. Eso lo hace útil como referencia rápida, como primer filtro en pipelines de clasificación a gran escala o como generador de etiquetas débiles para entrenar después modelos mayores.

El repositorio es de muy reciente creación (septiembre de 2026), acumula 0 descargas y 0 likes, no declara licencia y tiene un tamaño reportado de 0,0 GB, lo que resulta contradictorio con la presencia de los ficheros pickle citados en la model card. El modelo está etiquetado únicamente para el idioma turco (tr) y su pipeline de HuggingFace no está declarado.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF + LinearSVC (pipeline de scikit-learn); no es un transformer ni una red neuronal profunda |
| Parametros totales | no disponible (no se declara recuento de parámetros; depende del tamaño del vocabulario TF-IDF y de los coeficientes del clasificador lineal) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo no opera con ventana de contexto; procesa un documento por inferencia) |
| Tipos de cuantizacion | no aplica (no hay cuantización de pesos en el sentido habitual; los ficheros son pickles de scikit-learn) |
| Idiomas soportados | turco (tr) |
| Licencia | no disponible (no declarada en la model card ni en los metadatos del repositorio) |
| Formato de pesos | pickle de scikit-learn: `pipeline_v3.pkl`, `pipeline_v2.pkl`, `pipeline.pkl`; métricas en `metrics_v3.json` |

## Arquitectura y entrenamiento
La arquitectura es un pipeline de procesamiento de lenguaje natural clásico: extracción de características mediante TF-IDF sobre el texto en turco y clasificación con una máquina de vectores de soporte lineal (LinearSVC). El modelo produce tres etiquetas: pozitif (positivo), negatif (negativo) y Notr (neutro). Al ser un modelo lineal sobre representación dispersa de n-gramas, carece de mecanismos de atención, embeddings contextuales o estado recurrente.

Los datos de entrenamiento se describen de forma escueta: la versión 3 usa "winvoker tam veri" (dataset completo de winvoker, según la model card) con 440.679 ejemplos y un conjunto de test de 48.965 ejemplos; la versión 2 usa 60.000 ejemplos; la versión 1 usa únicamente 12 ejemplos de juguete. No se documenta la composición del dataset, el proceso de anotación, el equilibrio entre clases, ni si hubo preprocesado lingüístico específico para turco (tokenización, stemming, eliminación de sufijos). Tampoco se menciona ningún tipo de ajuste por refuerzo (RLHF/DPO), lo cual no aplica a esta familia de modelos.

## Capacidades
- Clasificación de sentimiento de texto en turco en tres clases: positivo, negativo y neutro.
- Inferencia sobre documentos individuales, sin generación de texto.
- Ejecución íntegra en CPU, con un coste de entrenamiento declarado de 55 segundos para la versión 3.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- Capacidad multilingüe: ninguna; únicamente turco.
- No dispone de modo de razonamiento (thinking mode), visión, audio ni otras modalidades.
- No se declara soporte para clasificación multi-etiqueta, detección de emociones ni análisis de aspecto.

## Casos de uso
- Moderación de comentarios en plataformas turcas: el clasificador puede etiquetar en tiempo real grandes volúmenes de comentarios de usuarios como positivos, negativos o neutros, actuando como primer filtro antes de revisión humana o de un modelo mayor.
- Análisis de reseñas de productos y comercio electrónico: agregar el sentimiento de miles de reseñas en turco para calcular puntuaciones medias por producto o por vendedor sin coste de GPU.
- Monitorización de redes sociales y marca: procesar menciones en turco de forma continua y en CPU para detectar picos de sentimiento negativo y activar alertas.
- Enrutado de tickets de soporte: clasificar el tono del mensaje entrante para priorizar incidencias con sentimiento negativo o derivarlas a un equipo especializado.
- Preetiquetado de datos (weak labeling): usar las predicciones del modelo como etiquetas iniciales sobre un corpus turco no anotado, que después se corrige y se emplea para ajustar un transformer de mayor capacidad.
- Baseline en experimentos académicos o de evaluación interna: dado que se entrena en menos de un minuto en CPU, sirve como referencia obligatoria antes de justificar el coste de un modelo basado en transformers.
- Análisis de encuestas y NPS: clasificar respuestas abiertas de clientes turcos para segmentar detractores y promotores a partir del texto libre.
- Investigación en procesamiento de lenguaje natural turco: punto de partida reproducible y de bajo coste para comparar técnicas de preprocesado morfológico en turco (idioma aglutinante) frente a modelos neuronales.

## Benchmarks y rendimiento
Los únicos datos disponibles son los reportados por el autor en la model card:

| Version | Datos de entrenamiento | Datos de test | Accuracy | Macro-F1 |
|---|---|---|---|---|
| v3 (recomendada) | 440.679 ejemplos (winvoker tam veri) | 48.965 | 0,9476 | 0,9168 |
| v2 | 60.000 ejemplos | no disponible | 0,9233 | 0,8766 |
| v1 | 12 ejemplos | no disponible | 0,50 | no disponible |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar tipo MMLU, HumanEval o GSM8K, que por otra parte no aplican a un clasificador de sentimiento.

## Requisitos de hardware
- VRAM para inferencia: 0 GB; el modelo no requiere GPU.
- GPU recomendadas: no aplica; cualquier CPU convencional es suficiente.
- Cabe en cualquier equipo consumer (portátiles, mini-PC, instancias pequeñas de nube) al ser un pipeline de scikit-learn.
- RAM estimada: no disponible; un pipeline TF-IDF + LinearSVC con vocabulario de cientos de miles de términos suele residir en unos pocos cientos de megabytes, pero este dato no se confirma en la información proporcionada.
- Tiempo de entrenamiento: 55 segundos en CPU para la versión 3, según el autor.
- Opciones de despliegue: carga directa con scikit-learn, joblib o pickle dentro de un servicio Python (por ejemplo, FastAPI o Flask). No es compatible con vLLM, llama.cpp, Ollama, TGI ni con runtimes de transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a características estructurales cualitativas.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| niyazioguz/tr-sentiment-mini | TF-IDF + LinearSVC | no disponible | no aplica | no disponible | HuggingFace (0 descargas) |
| Clasificadores de sentimiento en turco basados en transformers (familia BERTurk) | Transformer encoder con cabeza de clasificación | no disponible | no disponible | no disponible | no verificado en esta búsqueda |
| Clasificadores lineales multilingües (por ejemplo, variantes de fastText o regresión logística) | Bolsa de n-gramas + clasificador lineal | no disponible | no aplica | no disponible | no verificado en esta búsqueda |

La ventaja estructural de tr-sentiment-mini frente a alternativas basadas en transformers es el coste: entrenamiento en CPU en menos de un minuto y ausencia de requisitos de GPU. Su desventaja esperable, aunque no cuantificada aquí, es la falta de contextualización (negaciones, ironía, dependencias de largo alcance) inherente a un modelo lineal sobre TF-IDF.

## Limitaciones y advertencias
- Licencia no declarada: no hay autorización explícita de uso comercial, lo que constituye un riesgo legal para cualquier despliegue en producción.
- Alcance lingüístico limitado exclusivamente al turco; no funciona con otros idiomas.
- Esquema de tres clases cerrado (positivo, negativo, neutro); no cubre emociones, intensidad ni análisis por aspectos.
- Modelo lineal sobre TF-IDF: baja capacidad para capturar negaciones, ironía, sarcasmo o dependencias de largo alcance.
- Riesgo de degradación fuera de dominio: la accuracy de 0,9476 corresponde al conjunto de test descrito por el autor sobre el dataset "winvoker"; no hay garantía de que se mantenga en otros corpus, registros o dominios (legal, médico, técnico).
- Composición y sesgos del dataset de entrenamiento no documentados: se desconoce el equilibrio entre clases, el proceso de anotación y la posible sobrerrepresentación de determinados temas o variedades dialectales del turco.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes, sin issues ni evaluaciones externas que confirmen los resultados.
- Inconsistencia en los metadatos: el tamaño del repositorio figura como 0,0 GB pese a que la model card referencia varios ficheros `.pkl` y un `.json` de métricas; conviene verificar la disponibilidad real de los artefactos antes de integrarlos.
- Sin pipeline declarado en HuggingFace: no se puede invocar mediante `pipeline("sentiment-analysis")` de transformers sin envolver manualmente el pickle de scikit-learn.
- La versión v1 (accuracy 0,50) y la v2 no deberían usarse en producción; solo la v3 presenta métricas razonables.
- No se documenta el preprocesado aplicado; replicar el entrenamiento o adaptarlo a otro corpus exigiría reconstruir la vectorización exacta para no degradar el rendimiento.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/niyazioguz/tr-sentiment-mini
- La búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo; los resultados obtenidos corresponden a sitios de apuestas hípicas (zone-turf.fr) sin relación con el contenido de esta ficha.
- No se dispone de enlaces a paper, blog técnico, repositorio de código ni demo asociados al modelo en la información proporcionada.

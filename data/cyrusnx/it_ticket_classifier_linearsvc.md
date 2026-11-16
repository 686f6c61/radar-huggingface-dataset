# cyrusnx/it_ticket_classifier_linearsvc

## Resumen

`cyrusnx/it_ticket_classifier_linearsvc` es un modelo de clasificación de texto para tickets de soporte técnico (help desk de TI). No es una red neuronal ni un transformer: es un pipeline clásico de scikit-learn que combina vectorización TF-IDF con un clasificador lineal LinearSVC, y que predice una de ocho categorías de incidencia a partir del texto libre del ticket. El autor es el usuario de Hugging Face `cyrusnx`, y el artefacto se publicó en noviembre de 2026.

El modelo resuelve un problema muy concreto de operación: enrutar automáticamente tickets entrantes a la categoría correcta del servicio de soporte. A diferencia de los LLM generativos, aquí el objetivo no es conversar sino etiquetar con alta precisión y bajo coste computacional. El autor reporta una accuracy de test de 0,8556 y un macro F1 de 0,8575, además de un mecanismo de calibración de confianza (temperature scaling) que permite abstenerse cuando la predicción no es fiable.

La relevancia de esta ficha es doble: por un lado, documenta un caso realista de ML clásico en producción (barato, rápido, interpretable); por otro, advierte de sus límites, ya que el propio autor reconoce que los datos provienen de un único help desk y que la capa de prioridad es un sistema de reglas separado que no forma parte del artefacto. La información pública disponible es muy escasa: no hay detalles sobre el dataset, el número de muestras ni la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TF-IDF + LinearSVC (scikit-learn), con calibración de temperatura |
| Parametros totales | no disponible (modelo lineal; el número de coeficientes depende del vocabulario TF-IDF, no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TF-IDF no tiene ventana de contexto en el sentido de los transformers; depende de la configuración del vectorizador, no publicada) |
| Tipos de cuantizacion | no aplica (modelo lineal serializado con joblib) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | joblib (serialización de scikit-learn) |
| Numero de clases | 8 categorías de help desk de TI |
| Librería | scikit-learn 1.6.1 |
| Version de Python | 3.13.16 |
| Tamano del repo | 0.0 GB (artefacto de pocos MB) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clásico de procesamiento de lenguaje natural: vectorización TF-IDF del texto del ticket seguida de un clasificador de máquina de vectores de soporte con kernel lineal (LinearSVC). Sobre la salida del clasificador se aplica una calibración de temperatura (temperatura ajustada de 0,277762) para convertir las puntuaciones en probabilidades calibradas, lo que permite umbralizar la confianza en producción. El artefacto incluye además un clasificador XGBoost en el entorno de dependencias (versión 3.4.1), aunque la model card no aclara su papel exacto dentro del pipeline.

No se publican datos sobre el volumen de entrenamiento, la composición del dataset, el número de tickets utilizados ni si hubo aumento de datos o validación cruzada. El autor indica únicamente que los datos proceden de un único help desk. Tampoco se documenta el vocabulario del TF-IDF, el uso de n-gramas ni el preprocesado aplicado al texto. La innovación técnica destacable es la capa de calibración de confianza, que permite operar con cobertura selectiva: con umbral de confianza ≥ 0,8 se cubre el 74,1 % de los casos con una accuracy del 94,5 %.

## Capacidades

- Clasificación de tickets de soporte técnico en 8 categorías predefinidas (las categorías concretas no se detallan en la información disponible).
- Salida de probabilidades calibradas por temperatura, aptas para umbralizar y para abstención selectiva.
- Enrutamiento automático de tickets con cobertura y precisión controlables mediante el umbral de confianza.
- Inferencia muy rápida y de bajo coste (modelo lineal, sin GPU).
- Serialización simple con joblib, integrable en servicios Python.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües documentadas.
- No tiene modo thinking, visión, audio ni generación de texto libre: es un clasificador discriminativo.

## Casos de uso

- Enrutamiento automático de tickets en una mesa de ayuda: el modelo clasifica el texto libre entrante en una de las 8 categorías y lo asigna al equipo correspondiente; con el umbral de confianza ≥ 0,8 el 74,1 % de los tickets se enrutan automáticamente con un 94,5 % de acierto, y el resto se derivan a revisión humana.
- Triage con abstención selectiva: usando la calibración de temperatura, el sistema puede rechazar predicciones poco fiables y enviarlas a un agente humano, reduciendo errores de enrutamiento en producción.
- Etiquetado asistido de tickets históricos: aplicar el modelo sobre el backlog para preetiquetar categorías y acelerar la limpieza o migración de datos de un sistema de ticketing.
- Clasificación en tiempo real dentro de un flujo de ingesta: al ser un modelo lineal, la latencia es mínima y puede ejecutarse en el mismo servicio que recibe el ticket vía API, sin infraestructura GPU.
- Análisis de tendencias por categoría: agregar las predicciones sobre los tickets de un periodo para detectar qué categorías crecen y priorizar recursos de soporte.
- Filtro previo a un sistema más caro: usar el clasificador como primera etapa para descartar o agrupar tickets triviales antes de pasarlos a un modelo generativo o a un agente humano, reduciendo coste por ticket.
- Prototipado rápido de un clasificador de tickets en una organización nueva: sirve como línea base reproducible con métricas claras (accuracy, macro F1, log loss calibrado) antes de invertir en modelos más complejos.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (conjunto de test propio, no comparable con benchmarks públicos):

| Metrica | Valor |
|---|---|
| Accuracy de test | 0,8556 |
| Macro F1 de test | 0,8575 |
| Log loss con calibración de temperatura | 0,8951 |
| Error de calibración con temperatura | 0,3716 |
| Cobertura con confianza ≥ 0,8 | 74,1 % |
| Accuracy con confianza ≥ 0,8 | 94,5 % |
| Temperatura de calibración | 0,277762 |

No se han publicado resultados en benchmarks públicos estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros modelos sobre el mismo dataset.

## Requisitos de hardware

- VRAM: no requiere GPU; el artefacto es un modelo lineal serializado en joblib de tamaño muy reducido (repo de 0,0 GB).
- GPU recomendadas: ninguna; la inferencia es puramente CPU.
- Cabe en cualquier máquina, incluidos portátiles y contenedores de pocos cientos de MB de RAM (el consumo depende del vocabulario TF-IDF, no publicado).
- Opciones de despliegue: servicio Python con scikit-learn y joblib, por ejemplo con FastAPI o Flask; también puede integrarse en pipelines de datos con pandas. No aplica vLLM, llama.cpp, Ollama ni TGI, que son para modelos generativos.
- Latencia y throughput: no disponibles de forma explícita, pero por la naturaleza del modelo (TF-IDF + SVM lineal) la inferencia es del orden de microsegundos a milisegundos por ticket en CPU.
- Dependencias declaradas: Python 3.13.16, pandas 2.3.3, numpy 2.1.3, scikit-learn 1.6.1, xgboost 3.4.1.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados por el mismo autor ni sobre alternativas evaluadas en el mismo dataset. A modo de referencia categórica, se indican alternativas genéricas de la misma tarea, sin datos de rendimiento comparables:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyrusnx/it_ticket_classifier_linearsvc | TF-IDF + LinearSVC | no disponible | no aplica | no disponible | Hugging Face |
| Clasificador TF-IDF + regresión logística (entrenamiento propio) | Lineal | no disponible | no aplica | según datos | requiere entrenamiento |
| Modelo transformer fine-tuneado para clasificación (p. ej. familia BERT) | Transformer encoder | cientos de millones | 512 tokens típicos | según modelo base | Hugging Face |
| LLM generativo con prompt de clasificación | Transformer decoder | miles de millones | miles de tokens | según modelo | APIs o local |

La comparación de rendimiento entre estas opciones no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que los datos provienen de un único help desk y pueden no representar a otras organizaciones; la generalización a otros entornos no está validada.
- La prioridad de los tickets es una capa de reglas separada y no forma parte de este artefacto; no debe esperarse que el modelo la prediga.
- No se especifica la licencia, por lo que no se puede confirmar el uso comercial ni la redistribución.
- No se documentan los idiomas soportados; si el help desk original operaba en un solo idioma, el modelo probablemente rinda mal en otros.
- No se publican detalles del dataset, el vocabulario ni el preprocesado, lo que dificulta la reproducibilidad y la auditoría.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en tickets ambiguos, atípicos o con jerga no vista en entrenamiento.
- El error de calibración reportado (0,3716) es relativamente alto, lo que sugiere que las probabilidades no son perfectamente fiables; conviene validar el umbral en el dominio de despliegue.
- El entorno declara XGBoost como dependencia, pero la model card no aclara su función; revisar el artefacto antes de asumir que el pipeline es solo TF-IDF + LinearSVC.
- Las métricas son sobre un test propio del autor y no son comparables con benchmarks públicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyrusnx/it_ticket_classifier_linearsvc
- Perfil del autor: https://huggingface.co/cyrusnx
- Documentación de scikit-learn (LinearSVC): https://scikit-learn.org/stable/modules/generated/sklearn.svm.LinearSVC.html
- Documentación de scikit-learn (TfidfVectorizer): https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html
- Documentación de joblib: https://joblib.readthedocs.io/

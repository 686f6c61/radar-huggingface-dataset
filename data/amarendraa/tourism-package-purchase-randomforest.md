# Amarendraa/Tourism-Package-Purchase-RandomForest

## Resumen

Tourism Package Purchase RandomForest es un clasificador binario de tipo Random Forest entrenado con scikit-learn para predecir la variable `ProdTaken`, es decir, si un cliente contratará o no un paquete turístico. Lo publica el usuario Amarendraa en Hugging Face como artefacto final de un proyecto de aprendizaje automático y MLOps sobre el conjunto de datos Tourism. El modelo se apoya en 3.302 observaciones de entrenamiento y 28 características tabulares (demografía, comportamiento e historial de contacto del cliente).

Técnicamente no es un modelo de lenguaje ni una red neuronal: es un ensamblado de 200 árboles de decisión sin límite de profundidad, con `class_weight="balanced"` para compensar el desequilibrio de clases y `random_state=42` como semilla. Se seleccionó frente a AdaBoost y Gradient Boosting tras evaluar 49 configuraciones de hiperparámetros mediante GridSearchCV con validación cruzada estratificada de 5 particiones, usando ROC-AUC como criterio de selección.

Su relevancia es práctica y de nicho: sirve como pieza de un pipeline de scoring de clientes en marketing turístico (priorización de leads, campañas de contacto) y como ejemplo reproducible de flujo MLOps con validación, comparación de modelos y publicación del artefacto. No tiene capacidades generativas, multimodales ni de razonamiento, y su licencia y condiciones de uso comercial no están declaradas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Random Forest (ensamblado de 200 árboles de decisión, `scikit-learn`) |
| Parámetros totales | no aplicable (no es una red neuronal); 200 estimadores, `max_depth=None` |
| Parámetros activos | no aplicable (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplicable (entrada tabular de 28 características por instancia; no procesa secuencias) |
| Tipos de cuantización | no disponible (no aplica a modelos de árboles; no se documenta versión reducida) |
| Idiomas soportados | no disponible (no procesa texto de forma nativa) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | joblib / pickle (serialización de scikit-learn) |
| Tarea | clasificación binaria tabular (`pipeline_tag`: tabular-classification) |
| Variable objetivo | `ProdTaken` |
| Observaciones de entrenamiento | 3.302 |
| Número de características | 28 |
| Hiperparámetros | `n_estimators=200`, `max_depth=None`, `min_samples_split=2`, `min_samples_leaf=1`, `class_weight=balanced`, `random_state=42` |
| Validación | validación cruzada estratificada de 5 particiones (GridSearchCV) |
| Métrica de selección | ROC-AUC |
| Dataset asociado | `Amarendraa/Tourism` |
| Tamaño del repositorio | 0,0 GB (según la información de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un `RandomForestClassifier` de scikit-learn con 200 árboles, sin poda por profundidad (`max_depth=None`), `min_samples_split=2` y `min_samples_leaf=1`. El peso de clase está balanceado, lo que indica que la clase positiva (`ProdTaken=1`) es minoritaria en el conjunto de datos y que se prioriza no ignorarla durante el ajuste. La semilla fija en 42 hace reproducible el ensamblado. La entrada son 28 variables tabulares; la salida es una etiqueta binaria y, opcionalmente, una probabilidad mediante `predict_proba`.

El proceso de desarrollo comparó tres familias de ensamblados: Random Forest, AdaBoost y Gradient Boosting. Se evaluaron 49 configuraciones de hiperparámetros con GridSearchCV y validación cruzada estratificada de 5 particiones, y se seleccionó la configuración de Random Forest por su ROC-AUC. La model card no detalla el pipeline de preprocesado (tratamiento de valores ausentes, codificación de categóricas, escalado), la composición exacta del dataset ni si hubo calibración de probabilidades; tampoco se documenta ningún mecanismo de explicabilidad más allá de la importancia de variables implícita en los árboles.

## Capacidades

- Clasificación binaria tabular: predice `ProdTaken` (compra o no compra del paquete turístico) a partir de 28 variables de cliente.
- Estimación de probabilidad: `predict_proba` permite ordenar clientes por propensión de compra y fijar umbrales de decisión distintos del 0,5.
- Importancia de variables: al ser un ensamblado de árboles, expone `feature_importances_` para análisis de factores relevantes.
- Integración en pipelines de scikit-learn: se puede envolver en `Pipeline` con `ColumnTransformer` para preprocesado y serializar junto al resto del flujo.
- Inferencia por lotes: adecuado para scoring masivo de bases de clientes en procesos programados.
- Reproducibilidad: semilla fija y configuración documentada, lo que facilita repetir el experimento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión, audio ni modo de pensamiento.

## Casos de uso

- Priorización de leads en campañas de marketing turístico: se puntúa cada cliente con `predict_proba` y se contacta primero al decil de mayor propensión, reduciendo el coste por conversión frente a un contacto indiscriminado.
- Segmentación para campañas de telemarketing: dado que el modelo se entrenó con `class_weight=balanced`, es útil para detectar la clase minoritaria y construir listas de contacto donde la tasa de respuesta esperada sea superior a la base.
- Scoring previo a la contratación de paquetes wellness: el mismo esquema (28 variables de demografía, comportamiento e historial) permite estimar la probabilidad de compra de una modalidad concreta antes de diseñar la oferta.
- Enriquecimiento de un CRM: el modelo se integra como servicio de inferencia y devuelve una puntuación por cliente que el equipo comercial consume directamente en la ficha del contacto.
- Análisis de drivers de compra: mediante `feature_importances_` se identifican las variables con mayor peso predictivo, información que se puede trasladar a las decisiones de producto y de precio.
- Automatización de experimentos A/B: al ser un modelo barato de ejecutar en CPU, se puede reentrenar y comparar versiones con frecuencia para medir el impacto de nuevas campañas.
- Ejemplo docente o plantilla MLOps: sirve como referencia de flujo completo (validación, comparación de modelos, ajuste de hiperparámetros, publicación de artefacto) en cursos y proyectos internos.
- Filtro previo a modelos más costosos: se usa como primera etapa de descarte de clientes con probabilidad muy baja, reservando el esfuerzo humano o modelos más complejos para el resto.

## Benchmarks y rendimiento

Resultados publicados en la model card. No se proporcionan comparaciones con otros modelos en la misma tabla, por lo que solo se recogen las métricas del propio modelo.

| Métrica | Validación cruzada (5 particiones) | Test final (datos no vistos) |
|---|---|---|
| Accuracy | 0,9013 | 0,9080 |
| Precision | 0,9162 | 0,9462 |
| Recall | 0,5392 | 0,5535 |
| F1 | 0,6775 | 0,6984 |
| ROC-AUC | 0,9612 | 0,9681 |

Matriz de confusión en test:

```text
[[662   5]
 [ 71  88]]
```

Lectura: 662 verdaderos negativos, 5 falsos positivos, 71 falsos negativos y 88 verdaderos positivos. La precisión alta con recall en torno al 0,55 indica que el modelo es conservador al predecir la clase positiva: cuando predice compra acierta con frecuencia, pero deja sin identificar aproximadamente la mitad de los compradores reales. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- GPU: no necesaria. El modelo es un ensamblado de árboles y la inferencia se ejecuta íntegramente en CPU.
- VRAM estimada: 0 GB (no requiere VRAM para inferencia en el formato publicado).
- Memoria RAM: el repositorio ocupa 0,0 GB según Hugging Face, por lo que el artefacto joblib es muy pequeño; la carga en memoria de 200 árboles entrenados sobre 3.302 filas y 28 variables es del orden de decenas de megabytes o menos, sin medición publicada.
- GPU recomendadas: no aplicable. Cualquier CPU moderna con scikit-learn y joblib es suficiente; en caso de reentrenamiento, un servidor multinúcleo acelera el GridSearchCV.
- Cabe en GPU de consumo: no aplica, no hay ejecución en GPU.
- Opciones de despliegue: carga directa con `joblib.load` / `pickle`, servicio REST con FastAPI o Flask, registro y versionado con MLflow, empaquetado en contenedor Docker, y conversión opcional a otro runtime mediante `skl2onnx` si se necesita portabilidad fuera del ecosistema Python.
- Latencia y throughput: no disponible (no se han publicado mediciones). Esperar tiempos de milisegundos por lote en CPU para este tamaño de modelo, aunque la cifra concreta no está documentada.
- Almacenamiento: el repositorio se declara con tamaño 0,0 GB; conviene verificar el tamaño real del artefacto antes de dimensionar imágenes de contenedor.

## Comparativa con modelos similares

La información disponible solo permite una comparación parcial. Los tres modelos listados abordan la misma tarea de predicción de compra de paquete turístico con Random Forest, pero dos de ellos no publican métricas ni configuración en los resultados recogidos.

| Modelo | Arquitectura | Tarea | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Amarendraa/Tourism-Package-Purchase-RandomForest | Random Forest, 200 árboles | Clasificación binaria `ProdTaken` | 28 características tabulares | ROC-AUC 0,9681 en test; F1 0,6984 | no disponible | Hugging Face |
| critical12/tourism-purchase-predictor-rf | Random Forest | Clasificación binaria `ProdTaken` | no disponible | no disponible | no disponible | Hugging Face |
| Krishna6559/tourism-purchase-predictor-rf | RandomForestClassifier ajustado | Clasificación binaria `ProdTaken` | no disponible | no disponible | no disponible | Hugging Face |
| AdaBoost y Gradient Boosting (mismo proyecto) | Ensamblados de boosting | Clasificación binaria `ProdTaken` | 28 características tabulares | no disponible (evaluados, no seleccionados) | no disponible | no publicados como modelo final |

## Limitaciones y advertencias

- Desequilibrio de clases: con un recall de 0,5535 en test, el modelo deja escapar cerca del 45 % de los compradores reales; un uso comercial que dependa de no perder oportunidades requiere ajustar el umbral de decisión o aplicar técnicas de remuestreo.
- Volumen de datos reducido: 3.302 observaciones y 28 variables limitan el poder de generalización y aumentan el riesgo de sobreajuste a la distribución concreta del dataset. No hay partición temporal, por lo que no se ha evaluado la deriva temporal.
- Sesgos potenciales: el conjunto incluye variables demográficas del cliente. La model card no documenta análisis de equidad ni de sesgo por subgrupos, lo que es un riesgo si se usa para segmentar personas.
- Licencia: no declarada. No puede asumirse que el uso comercial esté permitido; habría que contactar con el autor antes de integrarlo en un producto.
- Idiomas: no aplicable; el modelo solo consume variables tabulares. No procesa texto ni lenguaje natural.
- Preprocesado no documentado: se desconoce cómo se tratan valores ausentes, categóricas e ingeniería de variables. Sin el pipeline exacto, reproducir las métricas publicadas con datos nuevos no está garantizado.
- Alucinación: no aplica en el sentido generativo, pero sí existe riesgo de predicciones mal calibradas o erroneas fuera del dominio de entrenamiento.
- Sin calibración de probabilidades: no se documenta calibración, por lo que `predict_proba` puede no ser fiable como probabilidad absoluta; es más seguro usarlo como ordenación relativa.
- Métricas no desglosadas: solo se publican métricas globales y la matriz de confusión; no hay curvas ROC, precision-recall ni intervalos de confianza.
- Artefacto sin mantenimiento: 0 descargas y 0 likes, con última actualización registrada en septiembre de 2026 y sin incidencias ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Amarendraa/Tourism-Package-Purchase-RandomForest
- Dataset asociado: https://huggingface.co/datasets/Amarendraa/Tourism
- Modelo comparable (critical12): https://huggingface.co/critical12/tourism-purchase-predictor-rf
- Modelo comparable (Krishna6559): https://huggingface.co/Krishna6559/tourism-purchase-predictor-rf
- Proyecto MLOps de referencia en GitHub: https://github.com/bhargavibalineni12/tourism-package-mlops
- Proyecto de predicción en GitHub: https://github.com/abhifg/Tourism-Package-Purchase-Prediction
- Informe del proyecto con el mismo enfoque: https://eliana-gm.github.io/tourism-package-prediction/
- Documentación de scikit-learn (RandomForestClassifier): https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html

# Cerrine/CC

## Resumen

Cerrine/CC es un clasificador tabular binario entrenado con scikit-learn para predecir la attrition (abandono) de clientes de tarjetas de crédito. Lo desarrolla el usuario Cerrine como trabajo de la asignatura MN1135 Business Data Science y se publica en Hugging Face bajo la librería sklearn, con un pipeline declarado de `tabular-classification`. No es un modelo de lenguaje ni una red neuronal: es un `RandomForestClassifier` serializado con joblib que opera sobre 19 variables de perfil demográfico y comportamiento transaccional.

El problema que resuelve es acotado y operativo: dada la ficha de un cliente (edad, categoría de tarjeta, límite de crédito, número de transacciones, inactividad, contactos con el banco, etc.), devuelve la probabilidad de que ese cliente deje de usar la tarjeta. El modelo se entrena sobre el dataset público Credit Card Customers (BankChurners) de Kaggle, con 10.127 filas y una tasa de positivos del 16,07 %, por lo que la métrica de referencia es el F1 de la clase minoritaria y no la accuracy.

Su relevancia es fundamentalmente didáctica y de referencia: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño del repo es de 0.0 GB y no se declara licencia ni idiomas. Sirve como ejemplo reproducible de un flujo completo de clasificación tabular desbalanceada (encoding ordinal y one-hot, búsqueda de hiperparámetros, umbral 0,5) y como artefacto de demostración, no como componente listo para producción bancaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (scikit-learn `RandomForestClassifier`), 200 árboles, `max_depth=None`, `min_samples_leaf=5`, `class_weight="balanced"` |
| Parametros totales | no disponible (no se documenta el número de nodos ni el tamaño agregado del bosque) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada de una fila con 19 variables originales, 21 columnas tras encoding) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; el artefacto es un joblib de precisión nativa de scikit-learn) |
| Idiomas soportados | no disponible (las categorías del dataset están en inglés: `Gender`, `Education_Level`, `Income_Category`, `Card_Category`) |
| Licencia | no disponible |
| Formato de pesos | joblib (`model_saya.joblib`, `feature_names.joblib`, `metadata.joblib`) |

## Arquitectura y entrenamiento

El modelo es un bosque aleatorio de 200 árboles de decisión sin límite de profundidad y con `min_samples_leaf=5`, seleccionado mediante Grid Search con validación cruzada. La clase positiva se pondera con `class_weight="balanced"` para compensar el desbalance del 16,07 % de clientes que abandonan. El preprocesado forma parte del contrato de uso: las variables ordinales (`Education_Level`, `Income_Category`, `Card_Category`) se codifican con mapas guardados en `metadata.joblib`, las nominales (`Gender`, `Marital_Status`) se codifican con one-hot y `drop_first`, y el orden final de columnas se fija con `feature_names.joblib`. El modelo se entrena sin escalado, de modo que estandarizar las entradas antes de predecir rompe la coherencia con el entrenamiento.

Los datos proceden del dataset público Credit Card Customers (BankChurners) de Kaggle: 10.127 filas, 19 características de entrada y 21 columnas tras el encoding. La partición es 80:20 estratificada con `random_state=42`, es decir, 8.101 filas de entrenamiento y 2.026 de prueba. No se documenta ningún tipo de ajuste fino posterior, RLHF ni calibración de probabilidades; el umbral de decisión es 0,5 fijo. La única innovación técnica destacable es la publicación conjunta de los artefactos auxiliares (`feature_names.joblib` y `metadata.joblib`) que hacen reproducible el pipeline de features, algo poco habitual en repos de modelos tabulares de este tipo.

## Capacidades

- Clasificación binaria tabular: distingue entre `Attrited Customer` (clase 1) y `Existing Customer` (clase 0) a partir de 19 variables de entrada.
- Salida de probabilidad calibrada de forma implícita por el bosque (`predict_proba`), útil para priorizar una lista de clientes por riesgo en lugar de emitir una etiqueta seca.
- Manejo nativo de desbalance de clases mediante ponderación (`class_weight="balanced"`), sin necesidad de remuestreo externo.
- Procesamiento de variables mixtas: numéricas continuas, ordinales con orden predefinido y nominales con one-hot.
- Inferencia sobre una sola fila o sobre lotes, con latencia de milisegundos por predicción en CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo generativo.
- No tiene capacidades multilingües en sentido estricto; las etiquetas de categoría deben coincidir exactamente con las del dataset original.

## Casos de uso

- Priorización de campañas de retención: el equipo de CRM puntúa su cartera con `predict_proba` y ordena a los clientes por probabilidad de abandono para asignar el presupuesto de incentivos a los segmentos de mayor riesgo, en lugar de aplicar descuentos indiscriminados.
- Segmentación analítica en cuadros de mando: la probabilidad de attrition se incorpora como variable derivada en un informe de negocio para cruzar riesgo con categoría de tarjeta, nivel educativo o saldo rotativo.
- Prueba de concepto de un pipeline de clasificación desbalanceada: sirve como plantilla reproducible (encoding, Grid Search, elección de F1 frente a accuracy) para equipos que inician un proyecto de scoring tabular.
- Docencia y evaluación de estudiantes: el repositorio incluye el contrato de features y las métricas antes y después del tuning, lo que permite reproducir el experimento y discutir el compromiso precisión-exhaustividad.
- Simulación de escenarios de negocio: modificando variables de comportamiento (por ejemplo, `Total_Trans_Ct` o `Months_Inactive_12_mon`) se puede explorar cómo varía la probabilidad estimada, siempre con la cautela de que el modelo captura correlación y no causalidad.
- Filtro previo en un flujo de atención al cliente: los clientes marcados como de alto riesgo se enrutan a un gestor especializado, mientras que el resto sigue el canal automatizado; el modelo actúa como señal de triaje, no como decisión final.
- Referencia para auditoría de modelos: al ser un bosque aleatorio con hiperparámetros explícitos y datos públicos, resulta adecuado para ejercicios de explicabilidad (importancia de variables, análisis de umbral) sin exponer datos reales de clientes.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de prueba (2.026 clientes), umbral 0,5:

| Modelo | Accuracy | Precision | Recall | F1 | ROC-AUC |
|---|---|---|---|---|---|
| Random Forest antes del tuning | 0.9595 | 0.9418 | 0.7969 | 0.8633 | 0.9859 |
| Random Forest después del tuning | 0.9497 | 0.8348 | 0.8554 | 0.845 | 0.9836 |
| Baseline trivial (todo `Existing Customer`) | 0.8393 | no disponible | 0.0 | no disponible | no disponible |

El tuning intercambia precision por recall: la variante ajustada detecta más abandonos (0.8554 frente a 0.7969) a costa de marcar como riesgo a más clientes que en realidad se quedan (precision 0.8348 frente a 0.9418). No se han publicado comparaciones con otros modelos sobre el mismo split.

## Requisitos de hardware

- CPU: suficiente para inferencia. Un bosque de 200 árboles con `min_samples_leaf=5` sobre 21 features se evalúa en el orden de milisegundos por fila en un núcleo moderno; el cuello de botella real es el preprocesado con pandas, no el modelo.
- VRAM: no requiere GPU. No se documenta ninguna ruta de ejecución en GPU ni variante acelerada.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y entornos de contenedor con 512 MB de RAM; el repo ocupa 0.0 GB según Hugging Face.
- Despliegue: `joblib` + `scikit-learn==1.6.1` (versión fijada por el autor) es la vía soportada. No hay artefactos ONNX, GGUF ni integración con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. Para servirlo como API basta con envolver `predict_proba` en FastAPI o similar, cargando los tres joblib al arrancar.
- Latencia y throughput: no disponibles de forma medida. Por la naturaleza del estimador, se espera throughput de miles de predicciones por segundo en CPU para lotes, pero es una estimación, no un dato publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Métrica principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cerrine/CC | Random Forest (sklearn) | BankChurners, 10.127 filas | F1 clase positiva 0.845; ROC-AUC 0.9836 | no disponible | Hugging Face, 0 descargas |
| Regresión logística sobre el mismo dataset | Modelo lineal | BankChurners | no disponible en la información proporcionada | no disponible | implementación propia |
| Gradient boosting (XGBoost/LightGBM) sobre el mismo dataset | Árboles boosting | BankChurners | no disponible en la información proporcionada | no disponible | implementación propia |
| Modelos de churn comerciales o de otros repositorios de Hugging Face | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks frente a alternativas sobre el mismo split, por lo que la comparación cuantitativa con otros clasificadores de churn no puede establecerse.

## Limitaciones y advertencias

- Validez externa limitada: el modelo se entrena con un único dataset público, no con datos reales de un banco. Su comportamiento en otras poblaciones, productos o coyunturas económicas no está probado.
- Recall imperfecto: con umbral 0,5 quedan clientes que abandonan sin detectar; el autor advierte explícitamente que la predicción no debe ser la única base de decisión.
- Compromiso precisión-exhaustividad: la versión ajustada marca como riesgo a clientes que en realidad son fieles, lo que puede desperdiciar presupuesto de promociones.
- Correlación, no causalidad: variables importantes como el número de transacciones no implican que modificarlas prevenga el abandono; el modelo no es apto para inferencia causal.
- Desbalance y categorías `Unknown`: la clase positiva representa el 16,07 % y varias columnas contienen la categoría `Unknown`, tratada como categoría propia; esto puede introducir sesgos en segmentos poco representados.
- Dependencia estricta del preprocesado: entrenado sin escalado, exige aplicar los mapas ordinales y el one-hot exactamente como en entrenamiento y reindexar las columnas con `feature_names.joblib`; cualquier desviación invalida las predicciones.
- Versión de librería fijada: el autor indica scikit-learn 1.6.1; cargar el joblib con otra versión puede producir incompatibilidades o avisos.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Uso restringido en decisiones sensibles: el autor excluye explícitamente su uso para decisiones que afecten directamente a derechos del cliente (por ejemplo, denegación de servicios) sin revisión humana.
- Sesgos potenciales: al incluir variables demográficas como género, estado civil, nivel educativo y categoría de ingresos, el modelo puede reproducir desigualdades presentes en los datos originales; no se documenta ninguna auditoría de equidad.
- Sin mantenimiento: 0 descargas y 0 likes, última actualización en 2026-11-05, sin garantía de soporte ni de corrección de errores.

## Enlaces

- Hugging Face: https://huggingface.co/Cerrine/CC
- Dataset Credit Card Customers (BankChurners): https://www.kaggle.com/datasets/sakshigoyal7/credit-card-customers/data
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos asociados al modelo.

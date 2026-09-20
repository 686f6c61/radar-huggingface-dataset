# Bakalo/tourism-package-model

## Resumen

Bakalo/tourism-package-model es un clasificador tabular binario publicado en HuggingFace por el usuario Bakalo. Su objetivo es predecir la compra de un paquete de turismo de bienestar (wellness tourism package) a partir de variables tabulares de clientes potenciales. No es un modelo de lenguaje: se trata de un artefacto de machine learning clásico serializado con joblib y cargable en Python mediante `joblib.load(...)`, que devuelve un diccionario con las claves `model`, `threshold`, `feature_columns` y `model_name`.

El modelo finalmente seleccionado fue XGBoost, escogido mediante validación cruzada de 5 pliegues optimizando F1. El umbral de decisión se fijó en 0,499 tras ajustarlo sobre predicciones out-of-fold del conjunto de entrenamiento. Sobre el conjunto de test alcanza 0,922 de accuracy, 0,829 de precision, 0,748 de recall, 0,786 de F1 y 0,941 de ROC-AUC.

Su relevancia es acotada y muy específica: es un artefacto de MLOps orientado a un caso de negocio concreto (scoring de propensión a la compra en turismo de bienestar), sin licencia declarada, sin métricas de validación externa por terceros y con 0 descargas en el momento de la consulta. La model card pública es de una extensión mínima y no documenta el tamaño del dataset, el origen de los datos ni el diccionario completo de variables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de árboles de decisión con boosting de gradiente (XGBoost), según la model card |
| Parámetros totales | No disponible (modelo de árboles, no una red neuronal; el número de árboles y hojas no se publica) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular; no procesa secuencias ni texto) |
| Tipos de cuantización | No disponible; el artefacto se distribuye sin cuantizar, serializado con joblib |
| Idiomas soportados | No disponible (la entrada es tabular; el modelo no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | joblib (serialización de Python); el objeto cargado es un `dict` con `model`, `threshold`, `feature_columns` y `model_name` |
| Tarea | Clasificación tabular binaria (`pipeline: tabular-classification`) |
| Librería declarada | sklearn (la model card indica que el modelo ganador es XGBoost) |
| Umbral de decisión | 0,499 (ajustado sobre predicciones out-of-fold) |
| Tamaño del repositorio | 0,0 GB reportados por la plataforma |
| Descargas / likes | 0 descargas, 0 likes |
| Fecha de creación | 2026-09-20 (según metadatos de HuggingFace) |
| Última actualización | 2026-09-20 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card indica que se entrenaron y compararon varios candidatos y que el mejor, según F1 en validación cruzada de 5 pliegues, fue XGBoost, un algoritmo de boosting de gradiente sobre árboles de decisión. Se trata por tanto de una arquitectura de ensemble de árboles, no de un transformer, MoE, SSM ni modelo híbrido. No se especifica el número de árboles, la profundidad máxima, la tasa de aprendizaje ni el resto de hiperparámetros finales.

El único detalle de entrenamiento documentado es el procedimiento de calibración del umbral: se calculó un umbral de decisión de 0,499 ajustándolo sobre las predicciones out-of-fold generadas durante el entrenamiento, y ese umbral se almacena junto al modelo y debe aplicarse explícitamente sobre la probabilidad devuelta. No hay información sobre el número de filas del dataset, la ingeniería de características, el tratamiento de valores nulos, la proporción de clases ni si se aplicó remuestreo. Tampoco se documenta ningún tipo de ajuste por RLHF o DPO, algo que no aplica a este tipo de modelo. La innovación técnica destacable es únicamente la selección de modelo por CV y la inclusión del umbral y del orden de columnas (`feature_columns`) dentro del propio artefacto, lo que facilita la reproducibilidad del pipeline de inferencia.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de que un registro corresponda a la clase positiva (compra del paquete de turismo de bienestar).
- Salida de probabilidad con umbral configurable: la predicción final se obtiene comparando la probabilidad con el umbral almacenado de 0,499.
- Autorreproducibilidad del orden de features: el artefacto incluye `feature_columns`, lo que permite alinear el vector de entrada con el orden usado en el entrenamiento.
- Metadatos de modelo autocontenidos: `model_name` permiten identificar el estimador empleado sin depender de documentación externa.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de generación de texto, de código, de matemáticas, de visión ni de audio.
- No dispone de modo "thinking" ni de ninguna capacidad generativa.

## Casos de uso

- Scoring de propensión en la web de la agencia: cada visita que completa un formulario de interés se vectoriza con las mismas columnas de `feature_columns` y se puntúa con el modelo; si la probabilidad supera 0,499, el usuario se marca como candidato para recibir una oferta de paquete de bienestar.
- Priorización de llamadas en el contact center: el equipo comercial ordena su lista diaria por probabilidad predicha en lugar de por orden de llegada, concentrando el esfuerzo en los registros con mayor puntuación.
- Segmentación de campañas de email marketing: el score se usa para dividir la base en tramos (alta, media y baja propensión) y adaptar el mensaje y la frecuencia de contacto de cada tramo.
- Retargeting y recuperación de carritos o solicitudes abandonadas: los registros que no completaron la compra pero obtienen puntuaciones altas entran en un flujo automatizado de recordatorio con incentivo.
- Planificación de capacidad e inventario: agregando las predicciones por periodo se obtiene una estimación de la demanda esperada de plazas del paquete, útil para negociar cupos con proveedores.
- Análisis de abandono (churn) adaptado al producto: usando la probabilidad como señal de interés, se detectan clientes con interés decreciente para acciones de retención antes de que la oportunidad se enfríe.
- Integración en un pipeline de MLOps: el artefacto se carga con `joblib.load` en un servicio de inferencia por lotes o en línea, y puede registrarse en un model registry para reentrenamientos periódicos y monitorización de deriva sobre las mismas columnas.
- Estudio de negocio sobre los factores de compra: al disponer de `feature_columns` y de un modelo de árboles, es posible analizar la contribución de cada variable al score para orientar el diseño de nuevos paquetes.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (clasificación binaria, umbral 0,499):

| Split | Accuracy | Precision | Recall | F1 | ROC-AUC |
|---|---|---|---|---|---|
| Train | 0,999 | 0,995 | 1,000 | 0,998 | 1,000 |
| Test | 0,922 | 0,829 | 0,748 | 0,786 | 0,941 |

No se han publicado resultados comparativos con otros modelos en la información disponible, ni métricas adicionales (matriz de confusión, calibración, curvas precisión-recall) más allá de las de la tabla anterior.

## Requisitos de hardware

- Inferencia en CPU: al ser un modelo de árboles con boosting, la inferencia no requiere GPU.
- VRAM estimada: no aplica; no se publica un requisito de memoria. El tamaño del repositorio reportado es de 0,0 GB, lo que indica un artefacto de tamaño muy reducido y compatible con memoria RAM convencional.
- GPU recomendadas: no disponibles porque no son necesarias; no se documenta ningún soporte de aceleración por GPU.
- Compatibilidad con GPU de consumo: no aplica; el modelo no depende de GPU y funcionaría igualmente en cualquier máquina con CPU.
- Opciones de despliegue: carga directa con `joblib.load` dentro de un proceso Python, exposición mediante un servicio propio (por ejemplo FastAPI, Flask o BentoML), contenedor Docker, ejecución por lotes con pandas o integración en un orquestador de pipelines de datos. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje y no aplican a este artefacto.
- Latencia y throughput: no disponibles. No se publican mediciones, y no hay datos verificables sobre tiempos de respuesta por registro ni sobre volumen de peticiones soportadas.
- Dependencias de ejecución: la model card indica que el modelo ganador es XGBoost y que la librería declarada es sklearn; conviene fijar versiones compatibles de ambas para evitar errores al deserializar el artefacto con `joblib`.

## Comparativa con modelos similares

No se dispone de resultados de este modelo frente a alternativas sobre el mismo dataset, por lo que la comparación cuantitativa no está disponible. La tabla siguiente recoge únicamente alternativas de la misma categoría funcional (clasificación tabular binaria) y su encaje general:

| Alternativa | Tipo | Rendimiento en este problema | Licencia | Disponibilidad |
|---|---|---|---|---|
| Bakalo/tourism-package-model (XGBoost) | GBDT, XGBoost | Test: F1 0,786; ROC-AUC 0,941; accuracy 0,922 | No disponible | HuggingFace, 0 descargas |
| LightGBM | GBDT | No disponible (no evaluado en la información proporcionada) | No disponible para este artefacto | Librería de código abierto, requiere entrenamiento propio |
| CatBoost | GBDT con soporte nativo de categóricas | No disponible (no evaluado en la información proporcionada) | No disponible para este artefacto | Librería de código abierto, requiere entrenamiento propio |
| Regresión logística | Modelo lineal | No disponible (no evaluado en la información proporcionada) | No disponible para este artefacto | Implementación estándar en scikit-learn |

## Limitaciones y advertencias

- Brecha train-test muy marcada: la F1 en entrenamiento es 0,998 frente a 0,786 en test, lo que es un indicio claro de sobreajuste. Las métricas de entrenamiento no deben usarse para estimar el rendimiento en producción.
- Recall de 0,748 en test: aproximadamente una cuarta parte de los compradores reales no serían detectados por el modelo con el umbral actual.
- Umbral de 0,499 muy próximo a 0,5: pequeñas variaciones en la distribución de entrada pueden alterar de forma notable el número de positivos predichos. Debe reevaluarse si el coste de un falso positivo y de un falso negativo cambia.
- Licencia no disponible: sin una licencia explícita, no hay autorización clara para uso comercial, redistribución ni modificación. Es un riesgo legal directo para cualquier despliegue en producción.
- Ausencia de documentación sobre los datos: no se indica el número de registros, la procedencia, la fecha de recogida ni la proporción de clases, por lo que no es posible auditar sesgos ni evaluar la representatividad de la muestra.
- Sesgos conocidos: no disponibles. Al no documentarse la composición del dataset, no se puede determinar si existen sesgos geográficos, demográficos o de canal.
- Riesgo de deriva: los modelos de propensión comercial se degradan cuando cambian las campañas, los precios o el contexto de mercado. No se documenta ningún plan de monitorización.
- Dependencia del orden de columnas: es obligatorio respetar exactamente `feature_columns`; un desajuste de orden o de codificación produciría predicciones silenciosamente erróneas, no un error explícito.
- Dependencia de versiones: la deserialización con joblib puede fallar o comportarse de forma distinta si las versiones de sklearn y XGBoost no coinciden con las del entrenamiento. No se especifican las versiones usadas.
- Sin validación externa: 0 descargas y 0 likes implican que no hay evidencia de uso por terceros ni validación independiente de los resultados.
- Anomalía en los metadatos: las fechas de creación y actualización indican 2026-09-20, posteriores a la fecha de consulta habitual, lo que sugiere un problema de sellado temporal en el repositorio.
- Alcance: no es un modelo de lenguaje; no genera texto, no responde a instrucciones y no puede emplearse para tareas conversacionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bakalo/tourism-package-model
- No se han encontrado enlaces adicionales relevantes en la búsqueda web: los resultados devueltos correspondían a páginas de ayuda de YouTube Music, sin ninguna relación con este modelo. No hay paper, blog, repositorio de código ni demo identificados en la información disponible.

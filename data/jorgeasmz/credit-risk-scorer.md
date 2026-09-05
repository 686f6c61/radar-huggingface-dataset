# jorgeasmz/credit-risk-scorer

## Resumen

El modelo `jorgeasmz/credit-risk-scorer` es un clasificador tabular de riesgo crediticio desarrollado por el autor jorgeasmz, que puntúa solicitudes de crédito utilizando el conjunto de datos German Credit. El problema que resuelve es la evaluación de la probabilidad de que un solicitante resulte ser un mal pagador, un escenario crítico para entidades financieras, fintechs y plataformas de préstamos. A diferencia de muchos clasificadores que optimizan la precisión, este modelo está promovido sobre la pérdida esperada, teniendo en cuenta una matriz de costos en la que un impago cuesta cinco veces más que rechazar a un buen solicitante. Esto lo hace especialmente relevante para contextos donde el coste de los falsos negativos es alto.

No se trata de un modelo de lenguaje, sino de un artefacto de scikit-learn con formato pickle, con un tamaño de repositorio de 0.0 GB. La información disponible no especifica la arquitectura interna del clasificador ni el número de parámetros, por lo que estos datos no se pueden proporcionar. La ficha se basa exclusivamente en la model card publicada y en los repositorios asociados, sin inventar métricas ni especificaciones no confirmadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (clasificador tabular basado en scikit-learn) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo tabular, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Pickle (joblib / sklearn) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no se especifica en la documentación proporcionada. Se sabe que es un clasificador tabular construido con scikit-learn, y que el artefacto se distribuye como un pickle que se ejecuta al cargar. El entrenamiento se realizó sobre el German Credit dataset, un conjunto de datos clásico de clasificación de crédito. La evaluación se llevó a cabo sobre 200 solicitantes mantenidos fuera del entrenamiento, con un umbral de decisión de 0.45. La innovación técnica más destacable es la optimización por pérdida esperada en lugar de precisión: el modelo se promueve minimizando el coste total bajo una matriz de costos asimétrica, donde un impago cuesta cinco veces más que un rechazo indebido. El repositorio `release.json` registra las versiones de las librerías bajo las que se escribió el artefacto, y la plataforma se niega a servirlo bajo versiones que pudieran reconstruir el estimador de forma diferente.

## Capacidades

- Clasificación tabular de riesgo crediticio: predice la probabilidad de que un solicitante sea un mal pagador.
- Salida de probabilidad continua que puede convertirse en decisión binaria mediante un umbral configurable.
- Optimización de la pérdida esperada, no de la precisión, lo que lo hace adecuado para escenarios con costes asimétricos.
- No soporta generación de texto, tool calling, agentes, visión, audio ni procesamiento de lenguaje natural.
- No es multilingüe; su funcionalidad es exclusivamente sobre características numéricas y categóricas del dataset de crédito.
- Se puede desplegar como un microservicio de inferencia ligero, integrable en pipelines de procesamiento de datos.

## Casos de uso

- Evaluación de solicitudes de préstamos personales: el modelo se integra en el flujo de originación de una entidad financiera para puntuar cada solicitud con una probabilidad de impago. Es adecuado porque su optimización por pérdida esperada alinea la decisión con el coste real de conceder un crédito que finalmente se incumple.
- Segmentación de riesgo en carteras existentes: permite clasificar clientes actuales en categorías de riesgo para ajustar límites de crédito, provisiones o estrategias de cobro. La rapidez del modelo y su naturaleza tabular facilitan su ejecución sobre bases de datos de clientes.
- Apoyo a decisiones en fintechs: al ser un artefacto ligero, puede servirse mediante una API REST (por ejemplo, con FastAPI) para responder en tiempo real a solicitudes de crédito, sin necesidad de infraestructura GPU.
- Modelo de referencia para comparar con técnicas más complejas: sirve como baseline en investigaciones o desarrollos de sistemas de scoring, permitiendo evaluar si modelos de gradient boosting o redes neuronales aportan mejoras reales en pérdida esperada.
- Educación y formación en modelado de riesgo: el German Credit dataset es un estándar didáctico; este modelo sirve como ejemplo práctico de cómo la optimización por costes cambia el umbral de decisión respecto a la precisión.
- Integración en sistemas de explicabilidad: aunque el modelo no es inherentemente interpretable, puede combinarse con técnicas como SHAP o LIME para analizar qué características influyen en la puntuación y generar informes de rechazo o aprobación.

## Benchmarks y rendimiento

Según la model card, las métricas se midieron sobre 200 solicitantes hold-out con un umbral de decisión de 0.45. Se presentan a continuación:

| Metric | Valor |
|---|---|
| Pérdida esperada bajo la matriz de costos | 96 |
| ROC-AUC | 0.8058 |
| Precisión (accuracy) | 0.72 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo no requiere GPU.
- GPU recomendada: ninguna; se ejecuta en CPU.
- Cabe en cualquier hardware consumer; puede ejecutarse en un portátil o en una instancia de servidor pequeña.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp u Ollama, al no ser un modelo de lenguaje. Puede integrarse en un servicio web con FastAPI, Flask o un pipeline de datos.
- Latencia y throughput estimados: no disponible, pero al ser un modelo de scikit-learn con un único pickle, la inferencia es del orden de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. Se ha encontrado un repositorio con un propósito similar (xavier-oc-programming/credit-risk-scorer) que utiliza regresión logística, MLflow y FastAPI, pero no se publican métricas comparables, por lo que no se puede establecer una comparación rigurosa.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con el German Credit dataset, un conjunto de datos relativamente pequeño (1000 muestras) y de origen alemán, por lo que puede no generalizar bien a poblaciones actuales, otros países o contextos con diferentes definiciones de impago.
- La precisión publicada es de 0.72, que es baja en términos absolutos. El modelo no debe utilizarse como único criterio de decisión sin un proceso de revisión humana o controles adicionales.
- El umbral de 0.45 está calibrado para minimizar la pérdida esperada bajo una matriz de costos específica (un impago cuesta 5 veces un rechazo). Si se modifica la matriz de costos o el contexto de negocio, el umbral debe recalibrarse.
- El modelo no proporciona explicaciones de sus predicciones por sí mismo; se necesitan técnicas de interpretabilidad externas para auditar decisiones.
- El artefacto se distribuye como un pickle de Python. Cargar un pickle de una fuente no confiable puede ejecutar código arbitrario. Es necesario verificar el origen y respetar las versiones registradas en `release.json`.
- No es un modelo de lenguaje, por lo que no puede procesar texto, soportar tool calling, agentes ni generación de lenguaje natural.

## Enlaces

- HuggingFace: https://huggingface.co/jorgeasmz/credit-risk-scorer
- Repositorio de entrenamiento: https://github.com/jorgeasmz/Credit-Risk-Assessment
- Repositorio de la plataforma: https://github.com/jorgeasmz/ML-Platform
- Repositorio similar (referencia externa): https://github.com/xavier-oc-programming/credit-risk-scorer

# jgcortezi/churn-radar-logreg

## Resumen

churn-radar-logreg es un modelo de clasificación tabular publicado por João Gabriel Cortezi (usuario `jgcortezi` en Hugging Face) que estima la probabilidad de cancelación (churn) de clientes de una operadora de telecomunicaciones. No es una red neuronal ni un modelo de lenguaje: es un `Pipeline` de scikit-learn que encadena estandarización de variables numéricas, codificación one-hot de variables categóricas y una regresión logística con `class_weight="balanced"`. Su función es ordenar clientes por riesgo de baja para priorizar acciones de retención.

El modelo se entrena sobre la base pública Telco Customer Churn de IBM (7.043 clientes ficticios, 26,5 % de churn) y se distribuye como artefacto serializado en formato `.skops`, cargable con la librería `skops` y la API estándar de scikit-learn. Su relevancia es práctica: ofrece una línea base interpretable, reproducible y ligera para problemas de churn en entornos tabulares, donde los modelos lineales bien ajustados compiten con alternativas de árboles en rendimiento y ganan en explicabilidad.

El autor declara que en validación cruzada de 5 pliegues empató con Random Forest y Gradient Boosting (diferencias inferiores a 0,005 de ROC-AUC) y que eligió la regresión logística por ser la opción más simple y explicable. La licencia es MIT y el repositorio ocupa prácticamente 0 GB, lo que lo hace desplegable en cualquier entorno con Python y scikit-learn.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística con pipeline de preprocesado (estandarización + one-hot encoding) de scikit-learn |
| Parámetros totales | no disponible (modelo lineal; número de coeficientes dependiente de las variables one-hot resultantes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada de 19 columnas por registro) |
| Tipos de cuantización | no aplica (no es un modelo neuronal; los coeficientes se almacenan en precisión nativa de coma flotante) |
| Idiomas soportados | portugués (etiqueta `pt` declarada por el autor; el modelo no procesa texto libre, solo valores categóricos y numéricos) |
| Licencia | MIT |
| Formato de pesos | `.skops` (serialización segura de scikit-learn vía skops) |

## Arquitectura y entrenamiento

La arquitectura es un `Pipeline` de scikit-learn con dos etapas: un preprocesador (`StandardScaler` para `tenure`, `MonthlyCharges` y `TotalCharges`, y `OneHotEncoder` para las 16 variables categóricas) y un clasificador `LogisticRegression` configurado con `class_weight="balanced"` para compensar el desequilibrio de clases de la base (26,5 % de churn). La entrada son las 19 columnas de la base original de IBM menos `customerID` y `Churn`; la variable `SeniorCitizen` debe codificarse como `"Yes"`/`"No"`.

El entrenamiento usa la base pública Telco Customer Churn de IBM: 7.043 clientes ficticios de una operadora, con una división estratificada de 5.634 registros para entrenamiento y 1.409 para test. No se documenta en la información disponible el número de épocas, la búsqueda de hiperparámetros ni técnicas de regularización específicas más allá de las propias de la regresión logística. Tampoco se menciona RLHF, DPO ni ningún proceso de ajuste por preferencias, algo esperable en un modelo tabular de este tipo.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de churn a partir de 19 variables demográficas, de contrato, de servicios contratados y de facturación.
- Puntuación de riesgo ordenable: `predict_proba` devuelve una puntuación que permite priorizar clientes por riesgo relativo.
- Explicabilidad intrínseca: al ser una regresión logística, los coeficientes del modelo son directamente interpretables como contribuciones lineales al log-odds de churn.
- Preprocesado integrado: el pipeline incluye escalado y codificación one-hot, de modo que el consumidor solo debe proporcionar el registro con las columnas originales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural: es un modelo puramente tabular.
- No tiene capacidades multimodales (visión, audio) ni modo de razonamiento extendido.

## Casos de uso

- Priorización de campañas de retención en telecomunicaciones: el modelo puntúa a cada cliente y permite seleccionar el 20 % de mayor riesgo, que según el autor concentra el 50 % de los churns totales del conjunto de test; con esa lista se dirigen descuentos o llamadas de fidelización.
- Segmentación operativa de cartera: al ordenar la base completa por `predict_proba`, los equipos de CRM pueden definir tramos de riesgo (alto, medio, bajo) y asignar distintos tratamientos sin necesidad de infraestructura de ML adicional.
- Línea base para proyectos de churn: sirve como referencia reproducible contra la que comparar modelos más complejos (XGBoost, redes neuronales tabulares) antes de invertir en ellos, dado que el autor reporta un empate con Random Forest y Gradient Boosting en validación cruzada.
- Análisis exploratorio de factores de riesgo: los coeficientes del modelo permiten identificar qué variables (tipo de contrato, antigüedad, método de pago) se asocian con mayor probabilidad de baja, útil para equipos de negocio que necesitan justificar decisiones.
- Docencia y prototipado rápido: al ser un pipeline de scikit-learn con licencia MIT y un artefacto de tamaño despreciable, es adecuado para cursos de ML aplicado, talleres de MLOps o demos de extremo a extremo con `hf_hub_download` y `skops`.
- Integración en un servicio de scoring por lotes: el modelo puede ejecutarse en un job programado que lea la tabla de clientes desde un data warehouse, aplique `predict_proba` y escriba las puntuaciones en una tabla de salida, sin necesidad de GPU ni de servidores de inferencia especializados.
- Simulación de escenarios de retención: modificando variables controlables (por ejemplo, cambiar `Contract` de mensual a anual o `PaymentMethod`), se puede estimar cómo varía la puntuación de riesgo y orientar políticas comerciales.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test (1.409 clientes no vistos en entrenamiento), no verificados de forma independiente (`verified: false` en el model-index):

| Métrica | Valor |
|---|---|
| ROC-AUC | 0,842 |
| PR-AUC | 0,633 |
| Recall (umbral 0,5) | 0,783 |
| Precisión (umbral 0,5) | 0,504 |
| F1 | 0,614 |
| Churns capturados en el 20 % de mayor riesgo | 50 % del total |

Contexto adicional: la tasa de churn de la base es 0,265, por lo que el PR-AUC de 0,633 debe leerse frente a esa línea base. El autor indica que en validación cruzada de 5 pliegues el modelo empató con Random Forest y Gradient Boosting con diferencias inferiores a 0,005 de ROC-AUC.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU y su artefacto ocupa prácticamente 0 GB.
- GPU recomendadas: ninguna; no se requiere aceleración por hardware.
- Cabe en cualquier GPU consumer y también en entornos sin GPU (portátiles, contenedores pequeños, funciones serverless).
- Opciones de despliegue: Python con scikit-learn y `skops` para la carga del artefacto; el pipeline puede servirse mediante FastAPI, Flask, BentoML o como job por lotes; no requiere vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (regresión logística sobre 19 columnas) se espera una latencia del orden de microsegundos a milisegundos por registro en CPU, aunque no se aporta una medición concreta.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | ROC-AUC en Telco Customer Churn | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| churn-radar-logreg | Regresión logística (scikit-learn) | no disponible (lineal) | no aplica (tabular) | 0,842 (declarado, no verificado) | MIT | Hugging Face (`jgcortezi/churn-radar-logreg`) |
| Random Forest (referencia del autor) | Ensemble de árboles | no disponible | no aplica (tabular) | Empate con la regresión logística (diferencia < 0,005) según validación cruzada del autor | no disponible | No publicada como artefacto en la información disponible |
| Gradient Boosting (referencia del autor) | Ensemble de árboles con boosting | no disponible | no aplica (tabular) | Empate con la regresión logística (diferencia < 0,005) según validación cruzada del autor | no disponible | No publicada como artefacto en la información disponible |

No se dispone de datos publicados de otros modelos comparables en la información proporcionada; las dos alternativas citadas son las que el propio autor menciona como referencia interna de su validación cruzada, no como artefactos distribuidos.

## Limitaciones y advertencias

- El propio autor advierte que el modelo sirve para ordenar clientes por riesgo, no como probabilidad calibrada: el `class_weight="balanced"` empuja las probabilidades hacia arriba y distorsiona la calibración.
- Está entrenado sobre una base ficticia de un único período (Telco Customer Churn de IBM); no debe usarse para decisiones sobre clientes reales sin reentrenar con datos propios y monitorizar deriva.
- Modela correlación, no causalidad: indica a quién priorizar, no por qué un cliente se va.
- La precisión al umbral 0,5 es 0,504, de modo que aproximadamente la mitad de las alertas son falsos positivos; el umbral debe ajustarse al coste relativo de falsos positivos y falsos negativos en cada negocio.
- El soporte de idioma declarado es portugués, pero el modelo no procesa texto libre: solo consume valores categóricos y numéricos con el esquema exacto de la base de IBM. Cualquier cambio de esquema (columnas nuevas, categorías no vistas, codificación distinta de `SeniorCitizen`) rompe la inferencia o degrada el resultado.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; no obstante, la licencia no exime de las obligaciones legales aplicables al tratamiento de datos personales en un caso real.
- No se han documentado análisis de sesgo por subgrupos (género, edad, tipo de contrato); en un despliegue real sería necesario auditar la equidad de las puntuaciones.
- El artefacto se distribuye en formato `.skops`; debe cargarse verificando los tipos con `get_untrusted_types` antes de usar `trusted=`, tal como indica el autor, para evitar la ejecución de código malicioso en artefactos de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jgcortezi/churn-radar-logreg
- Repositorio de código, notebooks y tests: https://github.com/jgcortezi/customer-churn-prediction
- Dataset Telco Customer Churn de IBM: https://github.com/IBM/telco-customer-churn-on-icp4d
- ChurnRadar (producto comercial homónimo, sin relación documentada con este modelo): https://www.churnradar.io/

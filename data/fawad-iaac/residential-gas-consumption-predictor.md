# fawad-iaac/residential-gas-consumption-predictor

## Resumen

El modelo `fawad-iaac/residential-gas-consumption-predictor` es un regresor de Random Forest implementado con scikit-learn que estima el consumo anual de gas residencial (`Gcons2024`) a partir de características del inmueble y del historial de consumo de los tres años anteriores. Lo publica el usuario fawad-iaac en HuggingFace y se distribuye como un artefacto `model.joblib` que encapsula tanto el pipeline de preprocesado como el estimador entrenado. No es un modelo de lenguaje ni una red neuronal: es un modelo tabular clásico de regresión supervisada, orientado a un problema concreto de eficiencia energética.

Su relevancia es limitada y acotada al ámbito educativo y experimental. El propio autor lo declara como material para explorar métodos de machine learning aplicados a la predicción de consumo de gas, y advierte explícitamente que no debe sustituir a mediciones reales ni servir como base única para decisiones importantes. No hay información sobre el volumen del dataset de entrenamiento, la procedencia geográfica exacta de los datos (aunque los nombres de las variables —`COUNCIL_TAX_BAND`, `REGION`— sugieren un origen británico) ni el número de muestras utilizadas.

El modelo reporta un R² de 0,7811 en el conjunto de test retenido, con un MAE de 1.777,18 kWh y un RMSE de 3.129,35 kWh. Es destacable que el propio autor reconoce que una línea base basada en el consumo del año anterior logró un MAE inferior al del Random Forest en el subconjunto evaluado, lo que relativiza la aportación del modelo frente a una heurística trivial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Random Forest Regressor (scikit-learn) |
| Parámetros totales | no disponible (100 árboles, `max_depth=10`; el número de nodos y hojas no se publica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; 9 features de entrada) |
| Tipos de cuantización | no disponible (formato joblib; sin cuantización documentada) |
| Idiomas soportados | no disponible (no procesa texto libre; las features categóricas están codificadas con one-hot) |
| Licencia | other (sin términos concretos especificados en la model card) |
| Formato de pesos | `model.joblib` (serialización joblib de scikit-learn) |

## Arquitectura y entrenamiento

Se trata de un ensemble de tipo bagging compuesto por 100 árboles de decisión de regresión con profundidad máxima limitada a 10 (`n_estimators=100`, `max_depth=10`). El pipeline guardado incluye el preprocesado: imputación por mediana y estandarización para las variables numéricas, e imputación por moda y one-hot encoding para las categóricas. Las features de entrada son `PROP_TYPE`, `PROP_AGE_BAND`, `FLOOR_AREA_BAND`, `COUNCIL_TAX_BAND`, `REGION`, `MAIN_HEAT_FUEL` y los consumos históricos `Gcons2023`, `Gcons2022` y `Gcons2021`. La variable objetivo es `Gcons2024`, y la flag `GasValFlag2024` se excluye explícitamente de las entradas.

El ajuste de hiperparámetros se realizó mediante `GridSearchCV` con validación cruzada de tres particiones. No se documenta el número de tokens (no aplica), la composición del dataset, el número de muestras, ni si hubo técnicas de regularización adicionales más allá de la limitación de profundidad. Tampoco se especifica el rango de búsqueda de hiperparámetros ni el criterio de selección. El dataset original no está incluido en el repositorio, por lo que la reproducibilidad depende de disponer de los datos y de las dependencias de `requirements.txt`.

## Capacidades

- Regresión tabular supervisada: predice un valor continuo (consumo anual de gas en kWh) a partir de nueve features.
- Manejo de variables categóricas y numéricas dentro de un pipeline único que incluye imputación y codificación.
- Robustez moderada ante valores ausentes gracias a la imputación por mediana (numéricas) y por moda (categóricas).
- Capacidad de capturar interacciones no lineales entre las features mediante los árboles de decisión.
- No soporta tool calling ni function calling (no es un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Exploración educativa de pipelines de scikit-learn: sirve como ejemplo completo de `Pipeline` con `ColumnTransformer`, imputación, one-hot encoding y un regresor de ensemble, útil en cursos y tutoriales de machine learning aplicado.
- Análisis de eficiencia energética a escala agregada: puede emplearse para estimar el consumo anual de una cartera de viviendas y detectar segmentos con consumos anómalos, siempre que se combine con mediciones reales.
- Priorización de auditorías energéticas: dado un conjunto de inmuebles con historial de tres años, el modelo puede ordenar por consumo previsto y orientar inspecciones hacia los casos con mayor probabilidad de desviación.
- Estudio de importancia de variables: permite analizar qué características del inmueble (tipo de propiedad, banda de superficie, combustible principal de calefacción) pesan más en la predicción, con la cautela de que el autor advierte que la importancia de features no implica causalidad.
- Prototipado de sistemas de recomendación de tarifas: integrado en una aplicación de gestión energética, puede alimentar estimaciones preliminares de consumo para comparar tarifas, nunca como dato contractual.
- Benchmark de referencia para modelos tabulares: útil como baseline de Random Forest frente al que comparar modelos más complejos (gradient boosting, redes tabulares) en el mismo problema.
- Docencia sobre limitaciones de métricas: el hecho de que una línea base naive (consumo del año anterior) supere al modelo en MAE lo convierte en un caso práctico excelente para enseñar la importancia de baselines y de la validación honesta.

## Benchmarks y rendimiento

Resultados en el conjunto de test retenido, según la model card:

| Métrica | Resultado |
|---|---|
| MAE | 1.777,18 kWh |
| RMSE | 3.129,35 kWh |
| R² | 0,7811 |

El autor indica que una línea base basada en el consumo del año anterior obtuvo un MAE inferior al del Random Forest en el subconjunto evaluado. No se publican comparaciones con otros modelos ni resultados desagregados por región o tipo de propiedad.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un Random Forest de 100 árboles con profundidad 10; la inferencia es ligera y no requiere GPU.
- VRAM estimada: 0 GB (no requiere GPU).
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y dispositivos de borde.
- Opciones de despliegue: carga directa con `joblib.load` en Python con scikit-learn; servicio vía FastAPI, Flask o BentoML; exportación a ONNX u otros formatos no documentada.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (100 árboles, 9 features) se espera un throughput alto en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Features de entrada | Métrica reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fawad-iaac/residential-gas-consumption-predictor | Random Forest (100 árboles, profundidad 10) | 9 (6 categóricas + 3 numéricas históricas) | MAE 1.777,18 kWh; R² 0,7811 | other | HuggingFace |
| Baseline naive (consumo del año anterior) | Heurística | 1 (`Gcons2023`) | MAE inferior al Random Forest según el autor | no aplica | Trivial de implementar |
| Gradient boosting (XGBoost/LightGBM) | Ensemble de boosting | Configurable | no disponible en esta ficha | varía | Amplia |

No se dispone de comparaciones publicadas con otros modelos de predicción de consumo de gas en la información proporcionada. La comparación más relevante es la que el propio autor señala frente a la línea base naive, que resulta competitiva o superior en MAE.

## Limitaciones y advertencias

- El historial de consumo es el predictor dominante; el modelo aporta poco valor frente a usar directamente el consumo del año anterior, que logró menor MAE en el subconjunto evaluado.
- Los errores de predicción varían notablemente entre propiedades; no se documenta la distribución de errores por segmento.
- La importancia de features no establece causalidad; no debe interpretarse como evidencia de relaciones causales entre características del inmueble y consumo.
- El rendimiento puede degradarse en datasets distintos o en años futuros (cambio de tarifas, climatología, reformas, cambios normativos).
- El conjunto de test ya se ha utilizado para evaluación y comparación con baselines, lo que introduce riesgo de sobreajuste en la selección de hiperparámetros y en las conclusiones.
- El dataset original no está incluido en el repositorio, lo que impide la reproducción independiente de los resultados.
- La licencia "other" no especifica términos concretos; el uso comercial queda en un limbo legal que exige contactar con el autor.
- El autor advierte explícitamente contra el uso de las predicciones para decisiones consecuentes sobre hogares individuales sin validación adicional.
- No hay información sobre sesgos demográficos o geográficos del dataset de entrenamiento, ni sobre su representatividad.
- El modelo no ha sido validado fuera del conjunto de test original; no hay evidencia de generalización a otras regiones o países.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fawad-iaac/residential-gas-consumption-predictor
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.

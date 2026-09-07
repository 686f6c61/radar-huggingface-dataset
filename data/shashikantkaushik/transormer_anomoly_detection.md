# shashikantkaushik/transormer_anomoly_detection

## Resumen
El modelo `shashikantkaushik/transormer_anomoly_detection` es un clasificador tabular para la detección temprana de fallos en transformadores eléctricos de potencia. Fue desarrollado por shashikantkaushik utilizando la herramienta Aargus-DIY Visual Inspection Tool y está publicado bajo licencia Apache 2.0. El modelo aborda un problema de mantenimiento predictivo: a partir de datos de telemetría SCADA (voltaje, corriente, potencia, factor de potencia, temperaturas y nivel de aceite), genera una señal binaria de riesgo cuando se activan las alarmas OTI_A, OTI_T o MOG_A. La relevancia del modelo radica en que automatiza la revisión de registros de alarmas, permitiendo actuar antes de que ocurra una avería y reducir paradas no planificadas. A pesar de su nombre, no se trata de un modelo de lenguaje basado en transformers, sino de un conjunto de clasificadores clásicos (XGBoost, Random Forest y Logistic Regression) entrenados sobre datos tabulares. El número de parámetros y la longitud de contexto no están disponibles.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (modelo principal), Random Forest y Logistic Regression como alternativas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesa datos numericos tabulares, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio no contiene los archivos de pesos; solo el README) |

## Arquitectura y entrenamiento
El modelo no emplea una arquitectura de transformer neuronal, sino que se basa en algoritmos de aprendizaje automático clásicos para clasificación tabular. La metodología descrita en la model card comienza con la ingesta de datos de cinco fuentes SCADA (`CurrentVoltage.csv`, `Overview.csv`, `Power.csv`, `PowerFactor.csv`, `TotalPower.csv`), fusionadas por `DeviceTimeStamp` en una tabla indexada por tiempo. Tras un análisis exploratorio de datos, se aplica ingeniería de características: se añaden variables temporales (`hour`, `dayofweek`, `month`, `is_weekend`) y se excluyen las columnas de alarma del conjunto de características para evitar fuga de la variable objetivo. Se entrenaron tres clasificadores — Random Forest, XGBoost y Regresión Logística (con escalado de características) — sobre un particionado estratificado 80/20. La validación se realizó con métricas de precisión, recall, F1 y ROC-AUC, además de la matriz de confusión. El mejor modelo resultó ser XGBoost, seleccionado por su mayor F1-score. No se dispone de información sobre el número de parámetros ni sobre técnicas de ajuste más allá de lo descrito.

## Capacidades
- Clasificación binaria de riesgo de fallo en transformadores eléctricos, devolviendo 1 si alguna de las alarmas OTI_A, OTI_T o MOG_A está activa, y 0 en caso contrario.
- Predicción de probabilidad de fallo mediante `predict_proba`, útil para establecer umbrales personalizados.
- Procesamiento de datos de sensores SCADA: voltajes (`VL1`–`VL31`), corrientes (`IL1`–`IL3`, `INUT`), potencias (`WL1`–`WL3`, `KW`, `KVA`, `KVAR`, `KWH`), factores de potencia (`PFL1`–`PFL3`), temperaturas (`OTI`, `WTI`, `ATI`) y nivel de aceite (`OLI`).
- Incorporación de características temporales derivadas: hora del día, día de la semana, mes y si es fin de semana.
- Comparación integrada de tres algoritmos: XGBoost, Random Forest y Regresión Logística, con la posibilidad de elegir el que mejor se adapte al escenario (por ejemplo, Regresión Logística prioriza recall).
- No dispone de capacidades de generación de texto, tool calling, visión, audio ni razonamiento multi-paso, al ser un modelo tabular.

## Casos de uso
- Mantenimiento predictivo en subestaciones eléctricas: el modelo analiza en tiempo real la telemetría de los transformadores y alerta antes de que se alcancen condiciones críticas, permitiendo programar intervenciones con antelación.
- Monitorización continua de transformadores en plantas industriales: integrado en un pipeline de datos con pandas y scikit-learn, procesa lecturas SCADA y genera una señal de riesgo que puede conectarse a sistemas de alarmas.
- Reducción de inspecciones manuales: al automatizar la revisión de registros de alarmas, disminuye la carga de trabajo del personal de operación y evita errores humanos en la detección de patrones anómalos.
- Análisis de datos históricos para planificación de mantenimiento: el modelo puede aplicarse sobre registros pasados para identificar periodos de mayor riesgo y optimizar las rutinas de mantenimiento preventivo.
- Detección temprana de sobrecalentamiento y fallos de nivel de aceite: gracias a las variables de temperatura y nivel de aceite, el modelo es especialmente adecuado para detectar condiciones de sobrecalentamiento o pérdida de aceite antes de que provoquen una avería.
- Integración en sistemas de monitorización de activos industriales: el clasificador puede desplegarse como un servicio HTTP (por ejemplo, con FastAPI o Flask) para recibir datos de sensores y devolver predicciones de riesgo en tiempo real.
- Apoyo a decisiones de mantenimiento en entornos de utilidades: la salida de probabilidad permite priorizar transformadores con mayor riesgo, optimizando la asignación de recursos.

## Benchmarks y rendimiento
La model card proporciona resultados sobre un conjunto de test de 5.859 muestras, de las cuales 408 son instancias de fallo. Los resultados para los tres clasificadores entrenados son:

| Modelo | Precision | Recall | F1-Score | ROC-AUC |
|---|---|---|---|---|
| XGBoost (mejor) | 0.998 | 0.993 | 0.995 | 0.996 |
| Random Forest | 0.995 | 0.990 | 0.993 | 0.995 |
| Logistic Regression | 0.831 | 0.973 | 0.896 | 0.979 |

No se han publicado resultados de benchmarks comparativos con otros modelos externos en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. No se especifican requisitos de hardware en la documentación.
- GPU recomendadas: no disponible. Al ser un modelo de clasificación tabular basado en scikit-learn/XGBoost, la inferencia se puede ejecutar en CPU sin necesidad de GPU, pero no se ofrecen cifras concretas.
- Si cabe en consumer GPU: no aplica, ya que no se requiere aceleración gráfica.
- Opciones de despliegue: no se mencionan en la documentación. Puede integrarse en aplicaciones Python con joblib y pandas, o servirse mediante frameworks web como FastAPI o Flask. No se indican integraciones con vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
Dentro del propio modelo se comparan tres algoritmos de clasificación entrenados sobre los mismos datos. La siguiente tabla resume esa comparativa interna:

| Modelo | Precision | Recall | F1-Score | ROC-AUC |
|---|---|---|---|---|
| XGBoost | 0.998 | 0.993 | 0.995 | 0.996 |
| Random Forest | 0.995 | 0.990 | 0.993 | 0.995 |
| Logistic Regression | 0.831 | 0.973 | 0.896 | 0.979 |

No se dispone de información sobre modelos externos comparables (por ejemplo, otros clasificadores de detección de fallos en transformadores) en la documentación proporcionada, por lo que no se puede realizar una comparativa con alternativas de la misma categoría.

## Limitaciones y advertencias
- Sesgos conocidos: no se han evaluado sesgos en la información disponible.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto.
- Limitaciones de contexto o idioma: no aplica, al ser un modelo tabular que no procesa lenguaje.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y distribución, siempre que se conserve el aviso de licencia y se indiquen los cambios realizados.
- El repositorio de HuggingFace solo contiene el README; no se incluyen los archivos de pesos (`transformer_xgb_model.pkl`, `transformer_lr_scaler.pkl`), por lo que el modelo no puede cargarse directamente desde HuggingFace. Es necesario entrenarlo con los datos descritos o disponer de los archivos por otras vías.
- El rendimiento reportado se obtuvo sobre un conjunto de test específico; la generalización a otros transformadores, condiciones de operación o conjuntos de datos puede variar.
- La variable objetivo se define por la activación de alarmas OTI_A, OTI_T o MOG_A; si el sistema de alarmas no está calibrado correctamente, el modelo heredará esos sesgos.
- El modelo fue creado con la herramienta Aargus-DIY Visual Inspection Tool, cuya documentación no se detalla en la model card.
- La fecha de creación indicada en HuggingFace (2026-09-07) es posterior a la fecha actual; no se dispone de explicación para esta anomalía.
- Al ser un modelo de clasificación tabular, no puede interpretar contextos temporales largos ni relaciones complejas entre variables más allá de las features seleccionadas.

## Enlaces
- HuggingFace: [shashikantkaushik/transormer_anomoly_detection](https://huggingface.co/shashikantkaushik/transormer_anomoly_detection)
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada.

# AdithyaByri/direction-h4-clf

## Resumen

El modelo `AdithyaByri/direction-h4-clf` es un clasificador binario basado en XGBoost que predice la probabilidad de que el rendimiento de un activo financiero (subyacente) en las próximas 4 barras sea positivo (es decir, que el precio suba). La ventana de 4 barras equivale aproximadamente a 1 hora si se utiliza un gráfico de velas de 15 minutos. El modelo forma parte de un sistema de trading multiagente llamado Aizen Trading, descrito en el repositorio `aizentrading/Aizen-Trading`, y se entrena de forma diaria con un esquema de validación walk-forward.

Desarrollado por Adithya Byri, el modelo se publica bajo licencia MIT y se distribuye como un archivo pickle (joblib) que contiene un clasificador de estilo scikit-learn. Aunque no es un modelo de lenguaje, su integración en pipelines de trading algorítmico lo hace relevante para desarrolladores e investigadores que trabajan en estrategias cuantitativas. El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica que es un proyecto reciente o de baja difusión. No se dispone de información sobre el número total de parámetros ni sobre la arquitectura interna (número de árboles, profundidad, etc.), ya que la model card no los especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (gradient boosting de arboles de decision) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion sobre features numericas) |
| Tipos de cuantizacion | no aplica (no es un modelo de redes neuronales) |
| Idiomas soportados | ingles (nombres de features y documentacion en ingles; el modelo opera sobre numeros) |
| Licencia | MIT |
| Formato de pesos | pickle (joblib) |

## Arquitectura y entrenamiento

El modelo es un clasificador XGBoost estándar, entrenado para resolver una tarea de clasificación binaria: predecir si el rendimiento de un activo en las próximas 4 barras (horizonte de aproximadamente 1 hora en un gráfico de 15 minutos) será positivo (clase 1) o negativo (clase 0). El entrenamiento se realiza con un conjunto de 20 features técnicas de trading, que incluyen retornos pasados (return_1, return_4, return_16), volatilidad, RSI, MACD, rango alto-bajo, ATR, distancia a medias móviles, ratio de volumen, ratio de número de operaciones, distancia a VWAP, y variables de mercado como retornos y volatilidad de SPY y QQQ. Estas features se calculan sobre datos de mercado históricos.

Los datos se dividen en tres conjuntos con separación temporal: entrenamiento (hasta 2025-08-08), validación (2025-08-11 a 2026-02-20) y test (desde 2026-02-20). El modelo se reentrena diariamente mediante un proceso de walk-forward, y la versión desplegada se actualiza en HuggingFace. No se menciona el uso de RLHF ni técnicas de alineación, ya que no es un modelo generativo. La innovación técnica reside en el diseño de features específicas para trading y en el esquema de retraining automático, no en la arquitectura del modelo en sí.

## Capacidades

- Clasificación binaria de dirección de precios: predice la probabilidad de que el rendimiento en las próximas 4 barras sea positivo.
- Salida probabilística: mediante `predict_proba(X)[:, 1]` se obtiene la probabilidad de la clase positiva.
- Integración en pipelines de trading: diseñado como componente de un sistema multiagente, puede consumirse desde Python con joblib.
- Reentrenamiento automático: el modelo se actualiza diariamente con nuevos datos, lo que permite adaptarse a condiciones de mercado cambiantes.
- No soporta generación de texto, razonamiento ni lenguajes naturales; es un modelo puramente numérico.

## Casos de uso

- Sistema de señales de trading intradía: el modelo puede generar señales de compra o venta basadas en la probabilidad predicha. Por ejemplo, si la probabilidad supera un umbral (como 0.5), se podría abrir una posición larga; si está por debajo, una posición corta. Su horizonte de 1 hora lo hace adecuado para estrategias de corto plazo.
- Componente de un sistema multiagente: integrado en el framework Aizen Trading, puede combinarse con otros agentes para tomar decisiones más complejas, como gestión de riesgo o selección de activos.
- Backtesting de estrategias cuantitativas: los investigadores pueden usar el modelo para evaluar su rendimiento histórico sobre datos de validación y test, como se muestra en las métricas de la model card.
- Filtro de operaciones: en lugar de generar señales directas, puede usarse como filtro para confirmar señales de otros indicadores, reduciendo falsos positivos.
- Educación en ML aplicado a finanzas: sirve como ejemplo práctico de aplicación de XGBoost a datos financieros con features técnicas y validación temporal.
- Despliegue en entornos de trading automatizado: al ser un modelo ligero, puede ejecutarse en servidores de baja capacidad o en brokers con APIs, generando predicciones en tiempo real.

## Benchmarks y rendimiento

La model card proporciona métricas de validación y test. Se presentan en la siguiente tabla:

| Metrica | Validacion | Test |
|---|---|---|
| ROC AUC | 0.6463 | 0.6119 |
| PR AUC | 0.3607 | 0.3732 |
| Log loss | 0.6451 | 0.6768 |
| Brier score | 0.2286 | 0.2429 |
| Precision@0.5 | 0.3480 | 0.3552 |
| Recall@0.5 | 0.6302 | 0.6552 |
| Base rate | 0.2635 | 0.2939 |

La calibración se reporta en intervalos de probabilidad, mostrando que el modelo tiende a sobreestimar las probabilidades en los rangos bajos y medios (por ejemplo, en el bin de 0.35-0.45, la probabilidad media predicha es ~0.45 pero la frecuencia observada es ~0.25). Esto indica una calibración deficiente, especialmente en rangos de probabilidad media. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser un modelo XGBoost con 20 features y un número no especificado de árboles, su huella de memoria es mínima, del orden de kilobytes o megabytes.
- No requiere GPU: la inferencia se ejecuta eficientemente en CPU, con latencias del orden de microsegundos a milisegundos por muestra.
- Puede ejecutarse en cualquier máquina con Python y las librerías `xgboost` y `joblib` instaladas, incluyendo Raspberry Pi o instancias cloud de bajo coste.
- Para el reentrenamiento diario, se necesitan recursos moderados de CPU y memoria, dependiendo del volumen de datos históricos.
- Opciones de despliegue: como es un artefacto pickle, puede integrarse en servicios web con Flask/FastAPI, en scripts de trading, o en plataformas de ejecución como AWS Lambda (si el tamaño lo permite). No requiere frameworks de inferencia como vLLM u Ollama.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado que es un clasificador de dirección financiera con features técnicas, se podría comparar con otros modelos de ML clásicos (Random Forest, Logistic Regression) o con redes neuronales LSTM, pero no hay datos de rendimiento de esos modelos en el mismo conjunto de datos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos de mercado: el modelo se entrena con datos históricos de un periodo concreto (hasta 2026) y puede no generalizar a condiciones de mercado futuras, especialmente en eventos extremos o cambios de régimen.
- Calibración deficiente: las métricas de calibración muestran que las probabilidades predichas no se corresponden bien con las frecuencias observadas, lo que puede llevar a decisiones erróneas si se utilizan directamente como probabilidades.
- Riesgo de sobreajuste: aunque se usa validación temporal, el número de features (20) y la arquitectura no regularizada podrían causar sobreajuste a ruido de mercado.
- Dependencia de datos de alta calidad: las features requieren datos de mercado de SPY, QQQ y del activo subyacente; si estos no están disponibles o son defectuosos, el modelo fallará.
- Restricciones de uso: la licencia MIT permite uso comercial, pero el autor no ofrece garantías de rendimiento ni asesoramiento financiero. El uso en trading real conlleva riesgos económicos.
- Sin soporte para otros idiomas o regiones: el modelo está pensado para el mercado estadounidense (region: us) y las features están en inglés.
- Falta de documentación sobre hiperparámetros: no se especifican los parámetros del XGBoost (learning rate, profundidad, número de estimadores), lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdithyaByri/direction-h4-clf
- Repositorio del sistema Aizen Trading: https://github.com/aizentrading/Aizen-Trading (mencionado en la model card)
- Portfolio del autor: https://github.com/adithyapintu/adithyabyri (encontrado en la búsqueda web)

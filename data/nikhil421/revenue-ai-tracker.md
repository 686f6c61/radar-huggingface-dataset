# NIKHIL421/Revenue-AI-Tracker

## Resumen

El repositorio NIKHIL421/Revenue-AI-Tracker, publicado en HuggingFace, no contiene un modelo de lenguaje ni un modelo de aprendizaje automático preentrenado en el sentido habitual, sino un pipeline completo de machine learning para predecir si una transacción financiera fallida puede recuperarse en un plazo de 72 horas. Desarrollado por el usuario NIKHIL421, el proyecto combina la descarga de conjuntos de datos reales de Kaggle (PaySim, transacciones financieras y fraude con tarjetas de crédito) con un proceso de ingeniería de características que genera un dataset híbrido sintético de 360.000 filas y 26 variables. El modelo predictivo empleado es un clasificador CatBoost, entrenado sobre 300.000 muestras de entrenamiento y 60.000 de validación.

La relevancia de este proyecto radica en su aplicación práctica en el sector fintech: permite priorizar los esfuerzos de recuperación de pagos fallidos, una operación que supone pérdidas millonarias para las empresas. Aunque el repositorio se aloja en HuggingFace bajo la etiqueta `region:us`, no se trata de un modelo de lenguaje ni de un transformer; es un pipeline de ML clásico con código fuente y scripts de entrenamiento. La licencia indicada en el repositorio es MIT, aunque en la ficha de HuggingFace aparece como "no disponible". No se especifican parámetros, contexto ni arquitectura de red neuronal porque no aplican en este caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CatBoostClassifier (gradient boosting sobre árboles) |
| Parametros totales | no disponible (modelo basado en árboles, no en redes neuronales) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (proyecto de código, no modelo lingüístico) |
| Licencia | MIT (según el repositorio; en HuggingFace aparece "no disponible") |
| Formato de pesos | .cbm (formato nativo de CatBoost) |

## Arquitectura y entrenamiento

El proyecto emplea un clasificador CatBoost, un algoritmo de gradient boosting sobre árboles de decisión que maneja de forma nativa variables categóricas sin necesidad de codificación one-hot. El pipeline consta de tres fases: descarga de datos brutos de Kaggle, construcción de un dataset sintético híbrido con 26 características agrupadas en categorías (transacción, cliente, comportamiento, contexto y notificaciones), y entrenamiento del modelo con early stopping y optimización basada en AUC. El dataset de entrenamiento contiene 300.000 filas y el de validación 60.000. La variable objetivo es binaria: `recovered_within_72h`, que indica si una transacción fallida fue recuperada en el plazo indicado. No se mencionan técnicas de ajuste avanzadas como RLHF o DPO, ya que no se trata de un modelo generativo.

## Capacidades

- Clasificación binaria para predecir la probabilidad de recuperación de transacciones financieras fallidas en un plazo de 72 horas.
- Manejo nativo de variables categóricas (método de pago, tipo de tarjeta, región, canal, etc.) sin preprocesamiento manual.
- Ingeniería de características automática que combina datos reales de Kaggle con variables sintéticas para enriquecer el dataset.
- Generación de métricas de rendimiento y rankings de importancia de características para interpretabilidad.
- Incluye scripts de análisis exploratorio de datos (EDA) para visualizar distribuciones de montos, saldos y tasas de recuperación.
- No tiene capacidades de procesamiento de lenguaje natural, generación de texto, visión ni agentes.

## Casos de uso

- Optimización de procesos de recuperación de pagos en pasarelas de pago: el modelo permite priorizar las transacciones fallidas con mayor probabilidad de recuperación, reduciendo el coste operativo de los equipos de cobro.
- Gestión de riesgo en banca minorista: los bancos pueden integrar el pipeline para decidir automáticamente qué clientes recibirán recordatorios de pago o intentos de reintento, basándose en la probabilidad estimada de éxito.
- Planificación de campañas de notificaciones push o SMS: las variables de notificación (`notification_sent`, `opt_out_notification`) permiten segmentar la comunicación según la propensión a recuperar el pago.
- Análisis de fraude y comportamiento de clientes: las características como `risk_score`, `previous_failed_attempts` y `transaction_frequency_30d` ayudan a detectar patrones de riesgo en el historial de pagos.
- Simulación de escenarios de recuperación: al ser un dataset sintético, se puede usar para probar estrategias de cobro antes de implementarlas en producción.
- Formación y demostración en cursos de machine learning aplicado a finanzas: el código está documentado y estructurado, lo que lo hace adecuado para enseñar pipelines completos de datos y entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "Model Performance (Expected)" pero no incluye cifras concretas de AUC, precisión u otras métricas. Tampoco se comparan los resultados con modelos alternativos.

## Requisitos de hardware

- No se especifican requisitos de hardware en el repositorio. Dado que se trata de un modelo CatBoost de tamaño moderado (300.000 filas de entrenamiento), puede ejecutarse en una CPU estándar (4-8 GB de RAM) sin necesidad de GPU.
- El entrenamiento con CatBoost es eficiente en CPU; para datasets de este tamaño, un portátil moderno con 8 GB de RAM es suficiente.
- No se requiere GPU para entrenamiento ni inferencia.
- El despliegue en producción puede realizarse mediante los formatos nativos de CatBoost (`.cbm`) o exportando a ONNX para servir con herramientas como FastAPI, TensorFlow Serving o incluso en entornos serverless.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que el proyecto es un pipeline específico de CatBoost para un dominio concreto (recuperación de pagos) y no existe una categoría estándar de modelos similares en HuggingFace con los que compararlo.

## Limitaciones y advertencias

- El dataset es híbrido y sintético en gran parte; los resultados pueden no generalizar bien a datos reales de transacciones fuera del dominio de entrenamiento.
- La model card advierte que el rendimiento puede variar ligeramente según la semilla aleatoria; no hay métricas de validación robustas publicadas.
- No se han documentado sesgos en las predicciones, pero al ser un modelo entrenado con datos de Kaggle, pueden existir sesgos geográficos o demográficos implícitos.
- La licencia MIT permite uso comercial, pero no se garantiza la exactitud ni la aptitud para producción en entornos financieros críticos.
- El repositorio no incluye un modelo preentrenado en HuggingFace; solo los scripts y el pipeline. Para utilizarlo, es necesario ejecutar el código completo.
- No hay soporte para otros idiomas ni para procesamiento de lenguaje natural.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NIKHIL421/Revenue-AI-Tracker
- Repositorio de GitHub: https://github.com/viRAJ357/Revenue-AI-Tracker (extraído del README; no se ha verificado su disponibilidad en la búsqueda web)
- No se han encontrado papers, blogs ni demos adicionales en los resultados de búsqueda web proporcionados.

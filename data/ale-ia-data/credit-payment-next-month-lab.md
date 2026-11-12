# Ale-IA-Data/credit-payment-next-month-lab

## Resumen

`credit-payment-next-month-lab` es un proyecto de clasificación tabular publicado por Ale-IA-Data (Manuel Alejandro Olivares Morales) en Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda de gran escala: se trata de dos clasificadores binarios (un Random Forest y un MLP) entrenados con scikit-learn sobre el dataset público UCI Default of Credit Card Clients, con el objetivo de predecir el impago del mes siguiente en una cartera de tarjetas de crédito.

El problema que aborda es de cobranza preventiva: identificar cuentas que conviene revisar antes del siguiente periodo de pago, equilibrando la cobertura de impagos detectados con la carga operativa de alertas que recibiría el equipo. El proyecto incluye pipelines de transformación, evaluación reproducible sobre 6.000 clientes de prueba, análisis de falsas alertas y una demo en Gradio para consultar clientes históricos.

Es relevante como ejemplo de extremo a extremo de un flujo de riesgo de crédito con datos tabulares: separación estratificada, comparación de candidatos, selección en validación y medición en prueba con métricas adecuadas al desbalance (average precision, recall, precisión). Los resultados publicados corresponden a una demostración de portafolio, no a un sistema validado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (200 árboles, profundidad máxima 14, mínimo 8 registros por hoja) y red neuronal MLP, ambos sobre scikit-learn |
| Parametros totales | No disponible (no se publica el número de parámetros del MLP ni el tamaño serializado de los pipelines) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificación tabular, entrada de 77 componentes transformados) |
| Tipos de cuantizacion | No disponible (no se documentan quantizaciones; los artefactos se distribuyen como pipelines de scikit-learn) |
| Idiomas soportados | Español (documentación y model card); los datos de origen son de Taiwán y las variables no contienen texto libre |
| Licencia | MIT |
| Formato de pesos | Pipelines de scikit-learn serializadas con joblib (según tags y librería declarada) |

## Arquitectura y entrenamiento

El proyecto compara dos familias de modelos sobre el mismo conjunto de datos. El candidato principal es un Random Forest con 200 árboles, profundidad máxima 14 y un mínimo de 8 registros por hoja, elegido por su capacidad de capturar relaciones no lineales e interacciones entre variables tabulares. El segundo candidato es una red neuronal MLP evaluada sobre la misma partición de prueba. La entrada se construye a partir de 19 variables originales: límite de crédito, seis importes de estado de cuenta, seis importes pagados y seis estados mensuales de pago. Los 13 importes se estandarizan con estadísticas de entrenamiento y los seis estados se codifican como 64 columnas indicadoras, dando 77 componentes de entrada.

Los datos provienen de UCI Default of Credit Card Clients: 30.000 clientes de Taiwán con historial de abril a septiembre de 2005 y etiqueta de impago del mes siguiente. La separación es aleatoria, estratificada por etiqueta y reproducible con semilla 42: 18.000 clientes para entrenamiento (14.018 sin impago, 3.982 con impago), 6.000 para validación (4.673 / 1.327) y 6.000 para prueba (4.673 / 1.327). La validación externa selecciona el candidato y la prueba mide la configuración fijada. Se excluyeron de las entradas ID, sexo, edad, escolaridad y estado civil; el ID se conserva solo para unir archivos y verificar particiones. No se documenta uso de RLHF, DPO ni técnicas de calibración probabilística: los scores se conservan como salidas del modelo sin calibrar.

## Capacidades

- Clasificación binaria tabular: devuelve un score entre 0 y 1 para la etiqueta `default payment next month` (1 = impago del mes siguiente, 0 = ausencia de ese impago).
- Ingeniería de variables incluida: estandarización de importes y codificación one-hot de estados de pago dentro de la pipeline.
- Evaluación reproducible: scores por cliente, verificador y comparación de candidatos sobre una partición de prueba común.
- Análisis operativo: medición de cobertura de impagos y volumen de falsas alertas para un umbral de referencia de 0,50.
- Demo interactiva en Gradio para consultar clientes históricos del conjunto de prueba.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un clasificador tabular, no un modelo generativo.
- Capacidades multilingües no aplicables: las entradas son numéricas y categóricas, no texto.

## Casos de uso

- Cobranza preventiva en financiera o arrendadora: usar el score por cliente para priorizar una cola de revisión antes del siguiente periodo de pago, ajustando el umbral según la capacidad del equipo. El proyecto cuantifica explícitamente la relación entre cobertura de impagos y número de alertas generadas.
- Dimensionamiento de equipos de cobranza: con los datos publicados (1.499 alertas y 729 falsas alertas con umbral 0,50 frente a 694 alertas del MLP), estimar cuántas revisiones por periodo puede absorber la operación antes de fijar la política de contacto.
- Segmentación de cartera para campañas de recordatorio: aplicar el score a toda la cartera y seleccionar el decil superior para comunicaciones automatizadas de bajo coste, reservando la gestión telefónica para los tramos con mayor score.
- Referencia interna para evaluación de modelos de riesgo: usar el pipeline y la partición estratificada con semilla 42 como línea base reproducible contra la que comparar modelos propios (gradient boosting, regresión logística calibrada) sobre el mismo dataset UCI.
- Docencia y formación en riesgo de crédito: el proyecto incluye informe técnico de 27 páginas, figuras de distribución de clases, ejemplos de aciertos y errores, y una demo Gradio, lo que lo hace utilizable como material didáctico de un flujo completo de modelado tabular.
- Prototipado rápido de scoring tabular: al estar empaquetado como pipelines de scikit-learn con joblib, se puede cargar y ejecutar en un servicio Python ligero sin infraestructura de GPU, útil para pruebas de concepto antes de invertir en un sistema productivo.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los 6.000 clientes de prueba (1.327 impagos reales):

| Modelo | Average precision (prueba) | Impagos detectados (umbral 0,50) | Alertas totales | Falsas alertas |
|---|---|---|---|---|
| Random Forest | 0,550570 | 770 de 1.327 | 1.499 | 729 |
| MLP | No disponible | No disponible | 694 | No disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de modelos de lenguaje, que no aplican a esta tarea. Tampoco se documentan métricas adicionales del MLP (recall, precisión, F1, AUC-ROC) ni intervalos de confianza.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia se ejecuta en CPU. Un Random Forest de 200 árboles y profundidad 14 sobre 77 entradas es ligero en memoria, aunque el tamaño exacto del artefacto serializado no está publicado (el repositorio ocupa 0,0 GB según Hugging Face).
- GPU recomendadas: no se requieren. Cualquier CPU moderna es suficiente para servir predicciones por lotes o en línea.
- Cabe en GPU consumer: sí, aunque no es necesario; también funciona en entornos sin GPU (contenedores pequeños, funciones serverless).
- Opciones de despliegue: carga directa con `joblib` en Python, servicio REST con FastAPI o Flask, o la demo Gradio incluida en el repositorio. No aplican vLLM, llama.cpp, Ollama ni TGI, que son runners de modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por la naturaleza del modelo (árboles de decisión y una MLP pequeña), se espera latencia de milisegundos por predicción en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Datos | Métrica principal publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| credit-payment-next-month-lab (Random Forest) | Clasificador tabular | UCI Default of Credit Card Clients, 30.000 clientes | AP 0,550570; 770/1.327 impagos detectados | MIT | Hugging Face |
| credit-payment-next-month-lab (MLP) | Red neuronal tabular | Mismo dataset y partición | No disponible (694 alertas totales) | MIT | Hugging Face |
| Gradient boosting (XGBoost/LightGBM) sobre el mismo dataset | Clasificador tabular | Mismo dataset | No disponible en esta ficha | Según implementación | Bibliotecas estándar |
| Regresión logística sobre el mismo dataset | Clasificador lineal | Mismo dataset | No disponible en esta ficha | Según implementación | Bibliotecas estándar |

No se dispone de resultados publicados de los modelos alternativos sobre esta misma partición en la información proporcionada; la comparación cuantitativa con gradient boosting o regresión logística requeriría reentrenar sobre la partición con semilla 42 del proyecto.

## Limitaciones y advertencias

- Los resultados son una demostración de portafolio: la recuperación de cartera, el ahorro y la efectividad de contactar clientes no se han medido y requieren validación con datos y operación reales de una empresa.
- Los scores no están calibrados como probabilidades de incumplimiento; no deben interpretarse como tales en decisiones regulatorias o de pricing.
- La etiqueta 0 no implica que la deuda quedó liquidada, solo ausencia de impago en el mes siguiente según la definición de UCI.
- Los datos son de Taiwán (2005) y la separación es aleatoria, no temporal: el rendimiento en una cartera distinta o en un periodo posterior puede degradarse por cambio de distribución.
- No se documenta evaluación de equidad por grupos; sexo, edad, escolaridad y estado civil se excluyeron de las entradas, pero no se analiza el impacto diferencial por segmentos.
- Con umbral 0,50 el modelo genera 729 falsas alertas sobre 1.499 alertas totales, una carga operativa considerable que debe ajustarse según la capacidad del equipo.
- El desbalance de clases (22,12 % de impagos) hace que accuracy sea una métrica engañosa; deben usarse average precision, recall y precisión.
- Licencia MIT: permite uso comercial, pero la licencia del dataset UCI subyacente y las obligaciones de atribución deben verificarse por separado.
- No es un modelo de lenguaje: no procesa texto libre, no soporta instrucciones en lenguaje natural ni tool calling, y no debe presentarse como tal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ale-IA-Data/credit-payment-next-month-lab
- Informe técnico en PDF (referenciado en la model card): `Informe_Cobranza_UCI350.pdf`
- Guía de subida desde la laptop (referenciada en la model card): `SUBIR_DESDE_LAPTOP.md`
- Documentación del proyecto (referenciada en la model card): `docs/00_RESUMEN_DEL_PROYECTO.md`
- Dataset de origen: UCI Default of Credit Card Clients (https://archive.ics.uci.edu/dataset/350/default+of+credit+card+clients)
- Librería: scikit-learn (https://scikit-learn.org)

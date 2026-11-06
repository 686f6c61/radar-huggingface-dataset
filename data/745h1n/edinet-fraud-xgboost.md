# 745H1N/edinet-fraud-xgboost

## Resumen

`edinet-fraud-xgboost` es un clasificador tabular basado en XGBoost para la deteccion de fraude contable en informes anuales de valores japoneses (有価証券報告書, presentados en el sistema EDINET). Lo desarrolla el usuario 745H1N y se publica bajo licencia Apache 2.0. No es un modelo de lenguaje: es un modelo predictivo supervisado que trabaja sobre caracteristicas numericas extraidas de los estados financieros estructurados de cada declaracion.

El modelo se entrena sobre el split de entrenamiento (865 declaraciones) del dataset `SakanaAI/EDINET-Bench`, un benchmark publicado por Sakana AI para evaluar modelos en divulgacion financiera (arXiv:2506.08762). El autor reporta un ROC-AUC de 0,7833 sobre el holdout de 224 filas, por encima del mejor resultado publicado en el paper (Random Forest con 0,75 y Claude 3.5 Sonnet con 0,73).

Su relevancia es doble: por un lado demuestra que un modelo tabular pequeno y entrenado en hardware de consumo puede superar a LLMs en esta tarea concreta; por otro, sirve como referencia practica de ingenieria de caracteristicas sobre el esquema contable japones. El repositorio ocupa 0,0 GB y la inferencia es exclusivamente en CPU, en el orden de milisegundos por declaracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (gradient boosted decision trees, histogram-based) |
| Parametros totales | no disponible (300 arboles, max_depth=3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, entrada de 20 caracteristicas) |
| Tipos de cuantizacion | no aplica (no es un modelo neuronal) |
| Idiomas soportados | no disponible (el esquema de entrada es japones, EDINET) |
| Licencia | Apache 2.0 |
| Formato de pesos | joblib (`model.joblib`) |

## Arquitectura y entrenamiento

El modelo es un ensamblado de arboles de decision con boosting por gradiente (XGBoost) configurado con `max_depth=3`, tasa de aprendizaje 0,05, 300 arboles, `subsample` y `colsample` de 0,7 y arboles con histogramas. La entrada no es texto sino un vector de 20 caracteristicas numericas derivadas de los estados financieros estructurados de cada declaracion: el bloque `summary` (18 indicadores por 5 anos), `bs` (57 lineas de balance), `pl` (24 lineas de cuenta de resultados) y `cf` (30 lineas de flujo de caja).

El proceso de entrenamiento parte de 107 caracteristicas: los 8 componentes del M-score de Beneish (1999) —DSRI, GMI, AQI, SGI, DEPI, SGAI, LVGI y TATA—, ratios de rentabilidad, liquidez, apalancamiento y eficiencia, calidad del flujo de caja, crecimiento interanual, volatilidad a cinco anos, tamano y senales de alerta. La validacion se hace con `StratifiedGroupKFold` de 10 pliegues agrupando por `edinet_code`, de forma que ninguna empresa aparece simultaneamente en entrenamiento y validacion. Bajo esos pliegues se aplica una poda por importancia de permutacion (tres barajados, caida media de AUC) que reduce de 107 a 20 caracteristicas, y el modelo final se reajusta sobre el split de entrenamiento completo. El autor indica que la seleccion nunca toco el split de test.

## Capacidades

- Clasificacion binaria de fraude contable sobre declaraciones anuales japonesas del sistema EDINET.
- Prediccion de probabilidad (`predict_proba`) y etiqueta (`predict`) a partir de una fila cruda del dataset `SakanaAI/EDINET-Bench` (columnas `summary`, `bs`, `pl`, `cf`, etc., como cadenas JSON).
- Ingenieria de caracteristicas integrada: calculo de ratios contables, M-score de Beneish y metricas de crecimiento y volatilidad a partir de los estados financieros.
- Inferencia en CPU con latencia del orden de milisegundos por declaracion.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues generativas: es un clasificador tabular, no un modelo de lenguaje.

## Casos de uso

- Triaje de auditoria: priorizar que declaraciones anuales revisar primero, ordenando por probabilidad de fraude y usando el ROC-AUC de 0,7833 como criterio de ranking para asignar esfuerzo humano limitado.
- Deteccion temprana en supervision regulatoria: procesar lotes de declaraciones EDINET y marcar las que superan un umbral de probabilidad para inspeccion manual, con inferencia en CPU a coste muy bajo.
- Investigacion academica en contabilidad: usar el modelo y las 20 caracteristicas seleccionadas como linea base reproducible frente a LLMs en tareas de deteccion de fraude sobre EDINET-Bench.
- Comparacion de enfoques tabulares frente a LLMs: servir de referencia cuantitativa (ROC-AUC 0,7833 frente a 0,73 de Claude 3.5 Sonnet) en estudios sobre coste y precision en analisis financiero automatizado.
- Integracion en pipelines de datos financieros: al consumir directamente filas del esquema EDINET, se puede encadenar tras un ETL que extraiga `summary`, `bs`, `pl` y `cf` de cada declaracion.
- Prototipado rapido en entornos sin GPU: el modelo entrena y se ejecuta en un portatil con RTX 3060 o solo CPU, lo que permite iterar sobre nuevas caracteristicas sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el holdout de 224 filas de EDINET-Bench:

| Modelo | ROC-AUC | MCC@0.5 | F1@0.5 |
|---|---|---|---|
| Este modelo (XGBoost) | 0,7833 | 0,432 | 0,709 |
| Mejor del paper: Random Forest | 0,75 | 0,38 | no disponible |
| Mejor LLM del paper: Claude 3.5 Sonnet | 0,73 | 0,32 | no disponible |

El autor reporta ademas un Group-OOF (solo entrenamiento, 10 pliegues agrupados por empresa) de 0,7078.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU.
- GPU recomendadas: ninguna necesaria. El autor entreno en una RTX 3060 de consumo y en CPU.
- Cabe en cualquier GPU de consumo y en equipos sin GPU.
- Opciones de despliegue: carga directa con `joblib` a traves del wrapper `EdinetFraudDetector` incluido en el repositorio; no requiere vLLM, llama.cpp ni TGI.
- Latencia y throughput: del orden de milisegundos por declaracion en CPU, segun el autor.

## Comparativa con modelos similares

| Modelo | Tipo | ROC-AUC (EDINET-Bench) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (XGBoost) | Tabular, 20 caracteristicas | 0,7833 | Apache 2.0 | Hugging Face |
| Random Forest (paper) | Tabular | 0,75 | no disponible | no disponible |
| Claude 3.5 Sonnet (paper) | LLM | 0,73 | propietaria | API de Anthropic |

## Limitaciones y advertencias

- Las etiquetas de fraude provienen de declaraciones rectificadas clasificadas por un LLM con revision humana; los autores del dataset advierten de posible ruido en las etiquetas.
- Con n_test = 224, el intervalo de confianza al 95 % del ROC-AUC es de aproximadamente ±0,06; la ventaja sobre 0,75 es real pero no dominante.
- El emparejamiento de claves de las caracteristicas es especifico del esquema japones de EDINET; otros corpus requieren su propio mapeo.
- El modelo esta entrenado para el split de EDINET-Bench; conviene reentrenarlo antes de desplegarlo sobre declaraciones de ejercicios posteriores.
- Es un clasificador tabular: no procesa texto libre ni ofrece explicaciones en lenguaje natural, y no debe confundirse con un modelo generativo.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre decisiones derivadas de sus predicciones recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/745H1N/edinet-fraud-xgboost
- Dataset EDINET-Bench: https://huggingface.co/datasets/SakanaAI/EDINET-Bench
- Paper EDINET-Bench: https://arxiv.org/abs/2506.08762

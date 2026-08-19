# Daemons-Q/qsh-finance-aml-gbm

## Resumen

El modelo `Daemons-Q/qsh-finance-aml-gbm` es un clasificador tabular para detección de lavado de dinero (AML) basado en gradient boosting (XGBoost) con características de grafo preprocesadas (Graph Feature Preprocessing, GFP). Ha sido desarrollado por Daemons-Q como parte del proyecto [QSMPC-QKD-QHE-AI-Hybrid](https://github.com/thedaemon-wizard/QSMPC-QKD-QHE-AI-Hybrid), una demostración de orquestación cuántica segura que combina computación multiparte, distribución de claves cuánticas y cifrado homomórfico. Este modelo concreto es la versión en texto plano para el caso de uso `finance_aml`; el camino cifrado utiliza un estudiante destilado, no este modelo.

El modelo se publica en formato ONNX, lo que permite su ejecución en navegador mediante ONNX Runtime Web, y es stateless en inferencia, lo que lo hace adecuado para entornos ligeros. Sin embargo, su rendimiento en la métrica objetivo (F1 de la clase minoritaria) es notablemente inferior a los baselines publicados en la literatura, y el propio autor lo presenta como una prueba de concepto de investigación, no como un sistema de producción. La arquitectura combina agregados escalares por cuenta con un clasificador XGBoost, en contraste con el GFP original de IBM que calcula patrones de subgrafo por transacción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting (XGBoost) con características de grafo preprocesadas (GFP) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantizacion | no disponible (formato ONNX, cuantificable pero no documentado) |
| Idiomas soportados | no aplica (modelo tabular) |
| Licencia | CDLA-Sharing-1.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo combina un preprocesador de características de grafo (GFP) con un clasificador XGBoost. El GFP calcula agregados escalares por cuenta (por ejemplo, grado, fan-in/fan-out, diversidad bancaria, ráfagas de transacciones) en lugar de los patrones de subgrafo por transacción que emplea el GFP original de IBM. Esta diferencia arquitectónica es la causa declarada del bajo rendimiento en la clase minoritaria, no un problema de ajuste de hiperparámetros. El GFP original de IBM se distribuye en `snapml` bajo licencia propietaria, por lo que este proyecto lo reimplementa con agregados por cuenta.

El entrenamiento se realizó sobre el dataset IBM AMLworld HI-Small, que contiene 5 millones de transacciones y 515.000 cuentas, con aproximadamente una transacción de lavado por cada 981. Es un dataset sintético generado por IBM con un modelo multiagente de mundo virtual, calibrado para reflejar estadísticas reales de transacciones. La evaluación es estrictamente inductiva y con división temporal: cada fila solo ve aristas anteriores a ella en el tiempo. El bloque estructural (cierre de ciclos, scatter-gather, diversidad bancaria, ráfagas) se ajusta en la ventana de entrenamiento, mientras que los agregados por cuenta son causales. No se aplicaron técnicas de RLHF o DPO al ser un modelo tabular.

## Capacidades

- Clasificación binaria de transacciones financieras para detectar posibles casos de lavado de dinero (clase minoritaria).
- Inferencia stateless: cada predicción es independiente, sin estado entre llamadas, lo que facilita el despliegue en entornos sin memoria persistente.
- Ejecución en navegador gracias al formato ONNX y a la compatibilidad con ONNX Runtime Web.
- Integración con pipelines de privacidad: forma parte de un sistema que combina cifrado homomórfico y computación multiparte, aunque este modelo concreto opera en texto plano.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; su alcance es exclusivamente tabular.

## Casos de uso

- Demostración de clasificación AML en navegador: al ser ONNX y stateless, puede integrarse en una página web para clasificar transacciones en tiempo real sin necesidad de servidor dedicado, útil para prototipos y demos interactivas.
- Comparación entre modelo en texto plano y modelo cifrado: dentro del proyecto QSMPC-QKD-QHE-AI-Hybrid, este modelo sirve como referencia para evaluar la degradación de rendimiento del estudiante destilado que opera bajo cifrado homomórfico.
- Investigación sobre características de grafo en detección de AML: permite estudiar el impacto de usar agregados por cuenta frente a patrones de subgrafo por transacción, y sirve como punto de partida para reimplementar el GFP de IBM sin dependencias propietarias.
- Enseñanza y formación: como ejemplo de pipeline completo (preprocesado de grafos + XGBoost + exportación ONNX) en un problema de clasificación desequilibrada, con código disponible en el repositorio.
- Benchmarking de rendimiento en hardware modesto: al ser un modelo ligero (boosting, sin redes neuronales), puede ejecutarse en CPU de gama baja o incluso en dispositivos móviles, permitiendo medir latencias y throughput en entornos restringidos.
- Prototipo de sistema de detección de fraude con requisitos de privacidad: aunque no es apto para producción, sirve como base para experimentar con técnicas de preservación de privacidad (cifrado, computación multiparte) aplicadas a modelos tabulares.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas medidas sobre el split descrito (n_train = 3.554.841, n_test = 1.523.504):

| Metrica | Valor |
|---|---|
| Accuracy | 0.9983 |
| AUPRC | 0.1233 |
| AUPRC (baseline aleatorio) | 0.0015 |
| AUROC | 0.9526 |
| F1 clase minoritaria | 0.1519 |
| Umbral de decision | 0.3869 |
| Tasa de positivos | 0.0010 |
| Tiempo de entrenamiento (wall clock) | 96.6 s |

Comparación con baselines publicados:

| Modelo | F1 clase minoritaria | Fuente |
|---|---|---|
| Este modelo (qsh-finance-aml-gbm) | 0.1519 | Medido por el autor |
| GFP+XGBoost (IBM AMLworld HI-Small) | 0.6323 ± 0.17 | NeurIPS 2023 D&B |
| MEGA-PNA (AML Small HI) | 0.7401 ± 1.55 | arXiv:2412.00241v2 (preprint) |

El autor explica que la brecha no es alcanzable mediante ajuste de umbral, porque el AUPRC medido (0.1233) está muy por debajo del que requeriría un F1 de 0.63. La causa es la diferencia en la arquitectura de características (agregados por cuenta vs patrones de subgrafo por transacción). No se han publicado resultados en otros benchmarks estándar como MMLU o HumanEval, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- Al ser un modelo XGBoost exportado a ONNX, no requiere GPU; la inferencia se realiza eficientemente en CPU.
- No se especifica VRAM ni tamaño de modelo en el repositorio, pero por la naturaleza del algoritmo (boosting sobre características tabulares) se estima un tamaño de decenas de megabytes como máximo, ejecutable en cualquier máquina moderna.
- Compatible con ONNX Runtime (CPU), ONNX Runtime Web (navegador) y potencialmente con otros runtimes ONNX.
- No se han publicado datos de latencia o throughput, pero al ser stateless y ligero, es adecuado para inferencia en tiempo real en entornos de baja capacidad.
- Puede ejecutarse en dispositivos sin GPU, incluyendo portátiles, Raspberry Pi o incluso móviles mediante ONNX Runtime Mobile.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dataset | F1 clase minoritaria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qsh-finance-aml-gbm (este) | GFP (agregados por cuenta) + XGBoost | IBM AMLworld HI-Small | 0.1519 | CDLA-Sharing-1.0 | ONNX, repo público |
| GFP+XGBoost (IBM) | GFP (patrones por transacción) + XGBoost | IBM AMLworld HI-Small | 0.6323 | Propietaria (snapml) | No disponible públicamente |
| MEGA-PNA | Red neuronal de grafos (PNA) | AML Small HI | 0.7401 | No especificada | Preprint arXiv:2412.00241 |

La comparativa muestra que este modelo está muy por debajo de los dos referentes. La diferencia clave es la implementación del GFP: IBM calcula patrones de subgrafo dinámicos por transacción, mientras que este proyecto usa agregados escalares estáticos por cuenta. El modelo MEGA-PNA, además, emplea una arquitectura de red neuronal de grafos más potente, aunque su licencia y disponibilidad no están claras.

## Limitaciones y advertencias

- Rendimiento muy inferior a los baselines publicados: la F1 de la clase minoritaria (0.1519) es aproximadamente una cuarta parte del baseline de IBM (0.6323). El propio autor reconoce que la brecha es estructural y no subsanable con ajuste de umbral.
- No apto para producción: el autor lo declara explícitamente como una prueba de concepto de investigación, no como un sistema de producción.
- Datos sintéticos: el entrenamiento se realizó sobre el dataset IBM AMLworld HI-Small, que es completamente sintético. Aunque está calibrado para reflejar estadísticas reales, puede no generalizar a datos reales de transacciones.
- Licencia CDLA-Sharing-1.0: esta licencia de datos comunitarios exige compartir bajo los mismos términos cualquier obra derivada. Debe revisarse si es compatible con el uso comercial previsto.
- Sesgos potenciales: al ser un dataset sintético, los patrones aprendidos pueden no capturar la diversidad de esquemas de lavado reales, y la clase minoritaria está extremadamente desbalanceada (tasa de positivos 0.001).
- Sin soporte de tool calling, agentes ni capacidades de lenguaje: es un modelo exclusivamente tabular, no generativo.
- No se dispone de información sobre el tamaño del modelo en parámetros ni sobre cuantizaciones específicas, lo que limita la planificación de despliegue.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Daemons-Q/qsh-finance-aml-gbm)
- [Repositorio del proyecto QSMPC-QKD-QHE-AI-Hybrid](https://github.com/thedaemon-wizard/QSMPC-QKD-QHE-AI-Hybrid)
- [Dataset IBM AMLworld HI-Small en Kaggle](https://www.kaggle.com/datasets/ealtman2019/ibm-transactions-for-anti-money-laundering-aml)
- [arXiv:2412.00241 - MEGA-PNA (preprint, techo publicado)](https://arxiv.org/abs/2412.00241)
- [arXiv:2402.08593 - GFP paper (descomposición de contribución de características)](https://arxiv.org/abs/2402.08593)

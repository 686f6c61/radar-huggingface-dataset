# jorgeasmz/fraud-stream-detector

## Resumen

El modelo `jorgeasmz/fraud-stream-detector` es un clasificador tabular para la detección de fraude en transacciones de tarjetas en tiempo real. Desarrollado por Jorge A. S. M. (jorgeasmz), puntúa cada transacción entrante y la ordena para un equipo de revisión que trabaja con un número fijo de alertas diarias. Está entrenado sobre 872.795 transacciones generadas por el simulador publicado con el Fraud Detection Handbook (Le Borgne y Bontempi, Université Libre de Bruxelles), abarcando 91 días de actividad.

El modelo se distribuye como un artefacto pickle de la librería sklearn, con licencia Apache 2.0. Su relevancia radica en que aborda un problema operativo concreto: priorizar alertas bajo un presupuesto diario fijo, en lugar de optimizar una métrica agregada como la precisión o el recall globales. La model card reporta métricas específicas para tres patrones de fraude distintos, lo que permite evaluar qué señales utiliza el detector. No se especifica la arquitectura interna (algoritmo concreto), el número de parámetros ni la longitud de contexto, ya que se trata de un modelo tabular clásico, no de un transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo sklearn, algoritmo no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, 30 features por transaccion) |
| Tipos de cuantizacion | no disponible (artefacto pickle, sin cuantizacion) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | pickle (joblib/sklearn) |

## Arquitectura y entrenamiento

La model card no detalla el algoritmo concreto (p. ej., Gradient Boosting, Random Forest, regresión logística) ni la configuración de hiperparámetros. Se sabe que está implementado con la librería sklearn y que el artefacto se serializa como pickle. El entrenamiento se realizó sobre 872.795 transacciones de 91 días del simulador del Fraud Detection Handbook, que genera datos sintéticos con tres patrones de fraude documentados y separables. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo generativo.

Una innovación destacable es el diseño de las features: cada transacción se describe con 30 variables que incluyen el importe, la hora, un indicador de fin de semana, conteos y medias móviles por tarjeta y por terminal en ventanas de 1, 7 y 30 días, el ratio del importe respecto a la media de la tarjeta, y tasas de fraude por tarjeta y por terminal en las mismas ventanas. Todas las ventanas son "prior-only": no incluyen la transacción que se está puntuando, evitando así la fuga de información. Además, las features de tasa de fraude terminan 7 días antes de la transacción, reflejando el retraso típico en la resolución de disputas. Sin estas features, el detector no supera el azar en el patrón de terminal comprometido.

## Capacidades

- Clasificación binaria de transacciones como fraudulentas o legítimas, devolviendo una puntuación continua.
- Priorización de alertas para un equipo de revisión con presupuesto diario fijo (100 alertas/día en la evaluación).
- Detección de tres patrones de fraude distintos: importes anómalos, terminal comprometido y tarjeta comprometida con importes multiplicados.
- Uso de features temporales y agregadas por tarjeta y terminal, con ventanas de 1, 7 y 30 días.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es un modelo puramente tabular.

## Casos de uso

- **Detección de fraude en tiempo real en pasarelas de pago**: el modelo puntúa cada transacción a medida que llega, permitiendo bloquear o marcar operaciones sospechosas antes de que se complete la autorización. Su diseño prior-only garantiza que la puntuación no use información futura.
- **Priorización de alertas para equipos de fraude**: dado un presupuesto diario de alertas (p. ej., 100), el modelo ordena las transacciones por puntuación y selecciona las más probables de ser fraude. La métrica de precisión al presupuesto (0.620) indica la proporción de alertas correctas.
- **Monitorización de terminales comprometidos**: gracias a las features de tasa de fraude por terminal, el detector identifica patrones de compromiso en cajeros o TPVs, con un recall de 0.664 en ese patrón.
- **Detección de fraude en tarjetas con importes multiplicados**: el modelo alcanza un recall de 0.819 para tarjetas comprometidas que operan con importes inusualmente altos, útil para detectar uso no autorizado tras un robo de datos.
- **Análisis de fraude a nivel de cartera**: las métricas de recall por patrón permiten a los equipos de riesgo entender qué señales está capturando el modelo y ajustar umbrales o features según el tipo de fraude predominante.
- **Evaluación de políticas de fraude**: al reportar precisión por tarjeta (0.561) y recall por patrón, el modelo sirve para comparar el impacto de diferentes umbrales operativos sin depender de la tasa base de fraude.

## Benchmarks y rendimiento

La model card reporta métricas medidas sobre los 85 días siguientes al entrenamiento, con 813.843 transacciones y un presupuesto de 100 alertas diarias. No se proporcionan resultados de benchmarks estándar como MMLU o HumanEval, al tratarse de un modelo tabular. Las métricas clave son:

| Metrica | Valor |
|---|---|
| Precision al presupuesto (100 alertas/dia) | 0.620 |
| Precision por tarjeta al presupuesto | 0.561 |
| Recall para importes por encima de un umbral sin transacciones legitimas | 0.916 |
| Recall para terminal comprometido durante ~4 semanas, importes ordinarios | 0.664 |
| Recall para tarjeta comprometida durante ~2 semanas, importes multiplicados | 0.819 |

La model card explica que la precisión se mide por día y se promedia, y que la precisión por tarjeta cuenta una tarjeta una sola vez aunque se marquen varias transacciones, ya que un equipo investiga tarjetas, no transacciones individuales. No se reporta accuracy porque, con una tasa de fraude inferior al 1%, sería una medida de la tasa base y un detector que no marca nada superaría 0.99.

## Requisitos de hardware

- Al ser un modelo sklearn serializado como pickle, su tamaño es muy reducido (el repositorio ocupa 0.0 GB) y la inferencia se ejecuta en CPU sin necesidad de GPU.
- No se requiere VRAM; cualquier máquina con Python y scikit-learn puede cargar y ejecutar el modelo.
- El despliegue puede hacerse mediante un servicio REST simple (FastAPI, Flask) o integrado en pipelines de streaming como Apache Kafka o Flink, dado que la puntuación es por transacción y de baja latencia.
- No se dispone de datos de latencia o throughput específicos, pero para un modelo tabular de 30 features se espera una latencia del orden de microsegundos a milisegundos por transacción en CPU.
- No es necesario un entorno con GPU; opciones de despliegue: pickle directo en Python, o exportación a formatos como ONNX si se requiere optimización adicional.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de fraude tabular en streaming con presupuesto de alertas) dentro de la información proporcionada. La model card no menciona alternativas ni benchmarks comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Corpus simulado**: los datos provienen de un simulador, no de tráfico real de tarjetas. Los tres patrones de fraude están documentados y son separables, lo que facilita la interpretación, pero no es evidencia de comportamiento en producción con datos reales.
- **Riesgo de seguridad**: el artefacto es un pickle que ejecuta código arbitrario al cargarse. Solo debe cargarse desde un repositorio de confianza y verificarse su integridad.
- **Dependencia de features específicas**: el rendimiento depende críticamente de las features de tasa de fraude con retraso de 7 días; si el proceso de disputas cambia, el modelo puede degradarse.
- **Sin soporte para otros dominios**: está diseñado exclusivamente para transacciones de tarjetas con el esquema de features descrito; no es transferible a otros tipos de fraude sin reentrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con limitaciones de responsabilidad.
- **No se reportan sesgos demográficos o geográficos**: al ser un modelo tabular sobre datos simulados, no se ha evaluado su comportamiento en poblaciones reales diversas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jorgeasmz/fraud-stream-detector
- Repositorio de entrenamiento: https://github.com/jorgeasmz/Fraud-Stream-Detection

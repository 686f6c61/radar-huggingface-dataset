# amazon/chronos-2

## Resumen

Chronos-2 es un modelo fundacional de pronóstico de series temporales desarrollado por Amazon Science, diseñado para resolver tareas de predicción en modo zero-shot sin entrenamiento adicional. A diferencia de su predecesor Chronos, que solo soportaba series univariantes, Chronos-2 amplía sus capacidades a pronóstico multivariante y a la incorporación de covariables pasadas y futuras, tanto numéricas como categóricas, todo dentro de una única arquitectura. Está basado en un codificador T5 con un mecanismo de atención grupal que permite el aprendizaje en contexto entre series relacionadas.

Con 120 millones de parámetros y una ventana de contexto de hasta 8192 pasos temporales, Chronos-2 logra un rendimiento de vanguardia en los benchmarks públicos fev-bench, GIFT-Eval y Chronos Benchmark II, superando a modelos de su categoría. Además, es notablemente eficiente: puede generar más de 300 pronósticos por segundo en una GPU A10G y funciona tanto en GPU como en CPU. Su licencia Apache 2.0 permite uso comercial y su integración con el ecosistema AutoGluon y SageMaker facilita su despliegue en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-only inspirado en T5, con group attention |
| Parametros totales | 119.477.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 (máximo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Chronos-2 emplea una arquitectura de solo codificador inspirada en el codificador de T5, con un mecanismo de atención grupal que permite procesar de forma eficiente múltiples series temporales y sus covariates simultáneamente. Este diseño habilita el aprendizaje en contexto (in-context learning) entre series relacionadas, lo que mejora la precisión cuando hay series con patrones compartidos. El modelo acepta como entrada tanto el historial de la variable objetivo como covariates pasadas y futuras (reales o categóricas), y produce pronósticos cuantílicos multi-paso adelante.

El entrenamiento se realizó sobre una combinación de conjuntos de datos reales y sintéticos a gran escala, incluyendo los datasets autogluon/chronos_datasets y Salesforce/GiftEvalPretrain. No se especifica el número total de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables a este tipo de modelo). La principal innovación técnica es el uso de group attention y el soporte nativo de covariates, que supera las limitaciones de Chronos-Bolt y Chronos original.

## Capacidades

- Pronóstico zero-shot univariante, multivariante y con covariates (pasadas y futuras, reales o categóricas).
- Generación de pronósticos cuantitativos (percentiles) para predicción probabilística.
- Soporte de aprendizaje en-context entre series relacionadas (cross-learning).
- Ventana de contexto de 8192 puntos y predicción máxima de 1024 pasos.
- Eficiencia computacional: >300 series por segundo en una GPU A10G; funciona en GPU y CPU.
- Integración con el paquete `chronos-forecasting` y con AutoGluon-Cloud para despliegue en SageMaker.
- No es un modelo de lenguaje: no genera texto, sino valores numéricos de series temporales.

## Casos de uso

- **Predicción de demanda energética**: pronóstico de consumo eléctrico a nivel horario o diario, incorporando covariates como temperatura o día de la semana, gracias al soporte de covariates futuras y contexto largo.
- **Planificación de inventario en retail**: predecir ventas por producto y tienda con series multivariantes, aprovechando el cross-learning para mejorar estimaciones en series con pocos datos.
- **Gestión de precios dinámicos**: pronóstico de precios de commodities o energía en mercados volátiles, con cuantiles para evaluar escenarios de riesgo.
- **Monitorización de métricas de infraestructura**: predicción de utilización de CPU, memoria o tráfico de red en sistemas, con detección de anomalías basada en los intervalos de confianza generados.
- **Planificación de recursos en nube**: estimar la demanda de instancias o servicios en AWS para optimizar el escalado automático, usando series históricas y covariates de calendario.
- **Análisis de series financieras**: pronóstico de flujos de caja o indicadores económicos, combinando múltiples series relacionadas y variables externas como tasas de interés.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que Chronos-2 alcanza el estado del arte en los líderes fev-bench, GIFT-Eval y Chronos Benchmark II, pero no se listan métricas concretas (p. ej., MASE, SMAPE, WQL). Se recomienda consultar el informe técnico en arXiv para obtener cifras detalladas.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero con 120M parámetros en safetensors (~0.5 GB) cabe en la mayoría de GPUs modernas; se puede ejecutar incluso en GPUs de gama baja con cuantización (aunque no se documenta).
- **GPU recomendadas**: A10G (referencia en la documentación), también compatible con GPUs más grandes como A100, H100 y RTX 4090.
- **CPU**: soportada para inferencia, aunque con menor rendimiento.
- **Despliegue**: local con `chronos-forecasting`, en SageMaker mediante JumpStart o AutoGluon-Cloud (instancia sugerida: ml.g5.xlarge).
- **Rendimiento**: >300 pronósticos por segundo en una A10G, según la documentación.

## Comparativa con modelos similares

La siguiente tabla compara Chronos-2 con sus predecesores de la misma familia (datos tomados de la model card):

| Modelo | Parametros | Contexto máx. | Predicción máx. | Univariate | Multivariate | Covariates |
|---|---|---|---|---|---|---|
| **Chronos-2** | 120M | 8192 | 1024 | Sí | Sí | Sí (pasadas y futuras) |
| Chronos-Bolt | no disponible | 2048 | 64 | Sí | No | No (solo pasadas) |
| Chronos | no disponible | 512 | 64 | Sí | No | No |

No se dispone de información sobre otros modelos de la misma categoría (p. ej., Moirai, TimesFM) para comparar en esta ficha.

## Limitaciones y advertencias

- **Sesgos**: no se han documentado sesgos específicos, pero como modelo de series temporales puede heredar patrones de los datos de entrenamiento (sintéticos y reales) que no generalicen a dominios no representados.
- **Alucinación**: riesgo de generar pronósticos plausibles pero incorrectos en series con comportamiento muy diferente a los datos de entrenamiento.
- **Contexto**: la ventana máxima de 8192 puntos puede ser insuficiente para series muy largas; para contextos mayores se necesita preprocesar o truncar.
- **Idiomas**: no aplica, es un modelo numérico.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero requiere atribución.
- **Caveat de producción**: la documentación recomienda validar el rendimiento en el dominio específico antes de desplegar; los pronósticos cuantitativos deben interpretarse con precaución en decisiones críticas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/amazon/chronos-2)
- [Informe técnico en arXiv (2510.15821)](https://arxiv.org/abs/2510.15821)
- [Paper original de Chronos (arXiv:2403.07815)](https://arxiv.org/abs/2403.07815)
- [Repositorio GitHub](https://github.com/amazon-science/chronos-forecasting)
- [Notebook de inicio rápido](https://github.com/amazon-science/chronos-forecasting/blob/main/notebooks/chronos-2-quickstart.ipynb)
- [Guía de despliegue en SageMaker con AutoGluon-Cloud](https://auto.gluon.ai/cloud/stable/tutorials/foundation-model-timeseries.html)
- [Notebook de despliegue con JumpStart](https://github.com/amazon-science/chronos-forecasting/blob/main/notebooks/deploy-chronos-to-amazon-sagemaker.ipynb)
- [Blog de Amazon Science](https://www.amazon.science/blog/introducing-chronos-2-from-univariate-to-universal-forecasting)

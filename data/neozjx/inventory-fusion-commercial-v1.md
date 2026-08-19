# NeoZJX/inventory-fusion-commercial-v1

## Resumen

Inventory Fusion Commercial v1 es un sistema compuesto de previsión probabilística de demanda y optimización de reposición de inventario, desarrollado por NeoZJX. No se trata de un modelo de pesos único, sino de una arquitectura de mezcla de expertos (MoE) que combina tres modelos fundacionales de series temporales de Apache-2.0 —IBM Granite TinyTimeMixer R2.1, Amazon Chronos-2 y Google TimesFM 2.5— con cinco baselines estadísticos ligeros. Una capa de fusión adaptativa jerárquica (global → segmento → SKU) combina las predicciones mediante pesos aprendidos por pérdida de cuantiles, y un optimizador OR-Tools aplica restricciones empresariales (MOQ, presupuesto, capacidad, nivel de servicio) para generar propuestas de pedido auditables.

El sistema está diseñado para entornos empresariales que necesitan previsión de demanda con incertidumbre calibrada (P10/P50/P90) y trazabilidad completa de cada decisión. Su relevancia actual radica en que ofrece una alternativa comercialmente utilizable y modificable frente a soluciones propietarias, con licencia Apache-2.0 y la posibilidad de adaptar la fusión a datos propios sin reentrenar los modelos base. La evaluación incluida, realizada sobre un workload sintético con 504 observaciones de holdout, muestra una mejora del WAPE frente a cada experto individual, con una cobertura P90 del 91,47 %.

El repositorio no contiene los pesos de los modelos base (se descargan de sus repositorios originales en revisiones inmutables), sino el código de orquestación, la configuración de registro de modelos y el estado de fusión aprendido. Esto lo convierte en un punto de partida sólido para proyectos de inventario, aunque requiere adaptación a los datos de cada organización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema compuesto: mezcla de expertos (ensemble) de modelos fundacionales de series temporales + baselines estadísticos + capa de fusión adaptativa + optimizador OR-Tools |
| Parametros totales | No disponible (el sistema no tiene parámetros propios; los modelos base suman aproximadamente 200M-700M según el experto) |
| Parametros activos | No aplica (MoE a nivel de sistema, no de red neuronal) |
| Longitud de contexto | No aplica (series temporales; cada experto maneja ventanas de entrada específicas, no documentadas) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (los modelos base son de series temporales, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (sistema compuesto; los modelos base usan safetensors en sus repositorios originales) |

## Arquitectura y entrenamiento

El sistema sigue un pipeline en dos etapas. Primero, cada experto genera pronósticos de demanda: IBM Granite TinyTimeMixer R2.1 (punto diario con calibración residual de cuantiles), Amazon Chronos-2 (probabilístico nativo con soporte de covariables conocidas) y Google TimesFM 2.5 (punto y cuantiles continuos para contexto largo), junto a cinco baselines estadísticos (seasonal naive, media móvil, tendencia lineal, Croston para demanda intermitente y regresión ridge con calendario). Estos baselines actúan como respaldo robusto y proporcionan explicabilidad.

La capa de fusión adaptativa evalúa a cada experto en ventanas históricas rodantes mediante pérdida de cuantiles normalizada, y agrega evidencia a tres niveles: cartera global, segmento de demanda y SKU individual. Los pesos se calculan mediante softmax exponencial con temperatura configurable, con un tope máximo de 0,88 por experto para evitar colapso. Cuando llega la demanda real, una función `online_update()` ajusta los pesos sin reentrenar los modelos base. El estado aprendido se serializa en JSON, permitiendo trazar cada pronóstico a sus pesos de experto exactos.

Los modelos base se descargan de sus repositorios HuggingFace originales en revisiones inmutables (por ejemplo, `caa1eb3d16f053859d81952a1f387d6aeb670076` para TTM). El entrenamiento de la fusión se realiza sobre datos propios; el README incluye un ejemplo con un workload sintético que produjo pesos globales de 53,26 % para TimesFM, 36,51 % para Chronos-2, 5,83 % para TTM y 4,40 % para calendar ridge. Estos valores son ilustrativos, no universales.

## Capacidades

- Previsión probabilística de demanda con cuantiles P10, P50 y P90, calibrados mediante cobertura.
- Fusión adaptativa de múltiples expertos con pesos por SKU, segmento y cartera, con regularización por shrinkage hacia evidencia global.
- Manejo de demanda intermitente mediante el baseline de Croston.
- Soporte de covariables conocidas (precio, promociones, calendario) a través de Chronos-2 y el baseline de regresión ridge.
- Optimización de reposición de inventario con restricciones reales (MOQ, case pack, presupuesto, capacidad, nivel de servicio) mediante OR-Tools.
- Actualización en línea de pesos de fusión sin reentrenamiento de los modelos base.
- Trazabilidad completa: cada pronóstico puede asociarse a los pesos de experto exactos y a las revisiones inmutables de los modelos base.
- Registro de modelos con licencia ejecutable: `configs/model_registry.json` bloquea modelos con licencias no permisivas (por ejemplo, Salesforce Moirai 2, CC BY-NC).

## Casos de uso

- Planificación de reposición en retail: el sistema genera propuestas de pedido por SKU que respetan MOQ y presupuesto, reduciendo el exceso de inventario y los roturas de stock. Su capa de fusión adaptativa ajusta los pesos según el comportamiento de cada SKU, lo que mejora la precisión en categorías con patrones dispares.
- Gestión de stock de seguridad: los cuantiles P90 calibrados permiten fijar niveles de stock de seguridad con una cobertura objetivo del 90 %, cuantificando el riesgo de rotura de forma explícita.
- Previsión de ventas para campañas promocionales: el soporte de covariables (precio, promociones, calendario) permite modelar el impacto de descuentos y eventos, algo crítico en entornos de alta estacionalidad.
- Optimización de cadena de suministro multi-almacén: el optimizador OR-Tools aplica restricciones de capacidad y presupuesto por almacén, generando planes de reaprovisionamiento factibles y auditables.
- Análisis de escenarios y simulación: al separar la previsión de la optimización, se pueden evaluar distintos niveles de servicio o políticas de pedido sin reentrenar el sistema, facilitando decisiones de negocio.
- Integración en ERPs y sistemas de planificación: el estado serializado en JSON y la API programática permiten incorporar las propuestas de pedido en flujos existentes con aprobación humana, manteniendo trazabilidad regulatoria.

## Benchmarks y rendimiento

Los resultados declarados por el autor (no verificados de forma independiente) se basan en un workload sintético de validación con 54 ventanas de tuning, 36 ventanas de holdout, seis patrones de demanda distintos y 504 observaciones de holdout. La evaluación se realizó con los checkpoints reales de HuggingFace en una NVIDIA RTX 3070 Ti 8 GB.

| Modelo | WAPE ↓ | Bias | RMSE ↓ | Pinball loss ↓ | P90 coverage |
|---|---:|---:|---:|---:|---:|
| **Adaptive fusion** | **0,0826** | -0,0321 | 7,3866 | 0,1058 | 0,9147 |
| Chronos-2 | 0,0841 | -0,0275 | **7,3722** | 0,1259 | 0,9087 |
| TimesFM 2.5 | 0,0895 | -0,0403 | 7,5630 | **0,1030** | 0,9127 |
| TTM R2.1 | 0,1012 | -0,0552 | 7,7082 | 0,1369 | 0,9048 |
| Calendar ridge | 0,1072 | -0,0554 | 7,6232 | 0,1442 | 0,7956 |
| Seasonal naive | 0,1308 | - | - | - | - |

La fusión adaptativa logra el mejor WAPE (0,0826) y la mejor cobertura P90 (0,9147), aunque Chronos-2 obtiene un RMSE ligeramente inferior (7,3722 frente a 7,3866) y TimesFM un pinball loss menor (0,1030 frente a 0,1058). El sistema demuestra que la combinación ponderada mejora la precisión global y la calibración de incertidumbre frente a los expertos individuales.

## Requisitos de hardware

- La evaluación del autor se realizó en una NVIDIA RTX 3070 Ti con 8 GB de VRAM, lo que indica que el sistema completo es ejecutable en GPUs de consumo.
- Los modelos base son relativamente pequeños: TimesFM 2.5 tiene 200M de parámetros, TTM R2.1 es compacto y Chronos-2 está disponible en tamaños reducidos. La huella de memoria total depende del número de expertos cargados simultáneamente.
- Se estima que con cuantización (no documentada) cabría en GPUs con 4-6 GB de VRAM, pero no hay datos oficiales.
- Opciones de despliegue: el sistema se distribuye como código Python con dependencias de HuggingFace, OR-Tools y bibliotecas de series temporales. No se menciona soporte para vLLM, llama.cpp u Ollama, al no ser un modelo de lenguaje.
- La latencia no está documentada; la inferencia implica ejecutar tres modelos base y los baselines, por lo que el throughput dependerá del hardware y del número de SKUs.

## Comparativa con modelos similares

No hay disponibles comparativas directas con otros sistemas de forecasting de inventario en la información proporcionada. El README menciona a Salesforce Moirai 2 como alternativa bloqueada por su licencia CC BY-NC, pero no se ofrecen datos de rendimiento. La comparativa más relevante es la interna con los tres modelos base, ya presentada en la sección de benchmarks. Se puede resumir así:

| Sistema | Enfoque | Licencia | WAPE (synthetic) | P90 coverage |
|---|---|---|---|---|
| Inventory Fusion v1 | Ensemble adaptativo | Apache-2.0 | 0,0826 | 0,9147 |
| Chronos-2 (solo) | Probabilístico nativo | Apache-2.0 | 0,0841 | 0,9087 |
| TimesFM 2.5 (solo) | Punto + cuantiles | Apache-2.0 | 0,0895 | 0,9127 |
| TTM R2.1 (solo) | Punto con calibración | Apache-2.0 | 0,1012 | 0,9048 |

La ventaja del sistema compuesto es su capacidad de adaptación a patrones heterogéneos por SKU, algo que los modelos individuales no ofrecen por sí solos.

## Limitaciones y advertencias

- Los pesos de fusión incluidos en el repositorio son ejemplos aprendidos de un workload sintético; no son válidos para producción y deben recalcularse con datos propios mediante validación temporal separada.
- La evaluación se realizó sobre un dataset sintético, no sobre datos reales de inventario; los resultados pueden no generalizar a escenarios reales con estacionalidad compleja, tendencias o eventos atípicos.
- No se documentan sesgos específicos, pero al ser un sistema de series temporales, los sesgos de los datos históricos de demanda se propagarán a los pronósticos.
- El riesgo de alucinación no aplica en el sentido de modelos de lenguaje; sin embargo, la capa de fusión puede sobreajustar a SKUs con pocos datos si no se aplica correctamente el shrinkage jerárquico.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero los modelos base individuales tienen sus propias licencias (todas Apache-2.0 según el registro). El registro de modelos bloquea automáticamente expertos con licencias no permisivas, pero el usuario debe verificar la configuración.
- No se proporcionan garantías de soporte ni mantenimiento; es un proyecto de un solo autor con 0 descargas y 0 likes en el momento de la consulta.
- El sistema no incluye funcionalidades de visión, audio ni procesamiento de lenguaje; está estrictamente orientado a series temporales numéricas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NeoZJX/inventory-fusion-commercial-v1
- Modelo base IBM Granite TinyTimeMixer R2: https://huggingface.co/ibm-granite/granite-timeseries-ttm-r2
- Modelo base Amazon Chronos-2: https://huggingface.co/amazon/chronos-2
- Modelo base Google TimesFM 2.5: https://huggingface.co/google/timesfm-2.5-200m-pytorch
- OR-Tools (optimizador): https://developers.google.com/optimization (referencia del README, no enlazado directamente)

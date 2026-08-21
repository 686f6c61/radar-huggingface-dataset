# adnanallemon/aml-campaigngraph-alpha

## Resumen

`adnanallemon/aml-campaigngraph-alpha` es un modelo de clasificación de grafos diseñado para la detección de patrones de lavado de dinero (AML) en el marco del proyecto AML-CampaignGraph. Desarrollado por adnanallemon, combina un módulo interpretable de evidencia a nivel de nodo (`AMLGraphScorer`) con características estructurales y temporales del grafo, y entrena un random forest balanceado por clases para agregar componentes de campaña y devolver una puntuación de campaña con transacciones de evidencia ordenadas. El modelo se entrena exclusivamente con grafos sintéticos generados por el simulador Alpha, en tres escenarios: `FAN_IN`, `CIRCULAR` y `PASS_THROUGH`, con negativos duros.

Este lanzamiento Alpha es una línea base de investigación, no un sistema de producción. Su propósito declarado es servir para experimentos de reproducibilidad, enseñanza y comparación con futuros modelos de grafos temporales. No implementa el GNN heterogéneo temporal final propuesto para la versión de investigación, y su salida de evidencia es un proxy de investigación, no una explicación causal. La relevancia actual radica en ofrecer un punto de partida interpretable y reproducible para la detección de campañas de lavado de dinero en datos sintéticos, antes de abordar modelos más complejos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random forest con características de grafo (no es un transformer ni un GNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de grafos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente joblib, segun los tags) |

## Arquitectura y entrenamiento

El modelo combina un `AMLGraphScorer` que extrae evidencia a nivel de nodo con características estructurales y temporales del grafo. Sobre esta representación, entrena un random forest con balanceo de clases para clasificar campañas candidatas. El entrenamiento se realiza sobre grafos sintéticos generados por el simulador Alpha, que incluye tres escenarios (`FAN_IN`, `CIRCULAR`, `PASS_THROUGH`) y negativos duros. La semilla de generación, la división a nivel de grafo y los ajustes están versionados en el repositorio del proyecto. No se especifican el número de árboles, la profundidad ni otros hiperparámetros del random forest. Tampoco se detalla el tamaño del dataset ni el número de nodos o aristas de los grafos.

## Capacidades

- Clasificación de campañas de lavado de dinero en grafos sintéticos, distinguiendo entre los tres escenarios Alpha y negativos.
- Generación de una puntuación de campaña (campaign score) que indica la probabilidad de que un conjunto de transacciones forme parte de una campaña AML.
- Producción de transacciones de evidencia ordenadas por relevancia, como proxy de explicabilidad a nivel de nodo.
- Manejo de características estructurales y temporales del grafo, lo que permite capturar patrones de flujo de fondos (fan-in, circular, pass-through).
- Entrenamiento con balanceo de clases para mitigar el desequilibrio entre positivos y negativos.
- Capacidad de abstinencia (abstention rate) en la evaluación, lo que permite al modelo abstenerse en casos inciertos.

## Casos de uso

- Investigación académica en detección de AML: el modelo sirve como línea base reproducible para comparar futuros modelos de grafos temporales o GNNs heterogéneos. Los investigadores pueden ejecutar el pipeline de entrenamiento y evaluación sobre los grafos sintéticos Alpha.
- Enseñanza de aprendizaje automático aplicado a grafos: permite ilustrar cómo combinar características de nodo, estructura y tiempo en un clasificador clásico (random forest) para una tarea de detección de anomalías.
- Experimentos de reproducibilidad: al estar versionados la semilla, la división y los ajustes, se puede replicar exactamente el entrenamiento y la evaluación, lo que facilita la verificación de resultados.
- Comparación de métodos de explicabilidad: la salida de evidencia a nivel de nodo puede usarse como referencia para evaluar técnicas de explicación en modelos de grafos, aunque sea un proxy.
- Desarrollo de pipelines de evaluación por escenario y dificultad: el modelo permite medir Average Precision, precisión, recall, F1 y tasa de abstinencia separadamente por escenario (`FAN_IN`, `CIRCULAR`, `PASS_THROUGH`), lo que ayuda a diagnosticar fortalezas y debilidades de cada enfoque.
- Pruebas de concepto en entornos controlados: antes de abordar datos reales, se puede usar este modelo para validar la viabilidad de un sistema de detección de campañas AML en un entorno sintético, siempre que se entienda que no es apto para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la evaluación primaria usa grafos sintéticos independientes y reporta Average Precision, precisión, recall, F1, tasa de abstinencia y cobertura de evidencia, tanto a nivel de nodo como de campaña, pero no se proporcionan valores numéricos concretos.

## Requisitos de hardware

- Al ser un random forest sobre características de grafo, los requisitos son considerablemente menores que los de un LLM o un GNN profundo. Se puede ejecutar en CPU con memoria RAM moderada, dependiendo del tamaño de los grafos.
- No se dispone de datos específicos sobre VRAM, GPU recomendada o latencia. Para grafos pequeños (miles de nodos), un portátil con 8-16 GB de RAM sería suficiente.
- El formato de pesos probablemente sea joblib (según los tags), lo que permite cargar el modelo con scikit-learn sin necesidad de infraestructura especial.
- No se mencionan opciones de despliegue como vLLM, Ollama o TGI, ya que no es un modelo de lenguaje. El despliegue sería mediante un script Python que cargue el modelo y procese grafos.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. El proyecto AML-CampaignGraph parece ser específico y no se mencionan alternativas directas en la model card.

## Limitaciones y advertencias

- El modelo no es un sistema de producción AML. No debe usarse para acusar a personas o instituciones, cerrar cuentas, presentar informes de actividades sospechosas (SAR) ni tomar decisiones legales, crediticias, laborales, de seguros o financieras.
- Solo reconoce patrones generados por el simulador sintético Alpha. El rendimiento sobre datos reales de banca no está establecido y probablemente sea deficiente.
- Puede aprender artefactos específicos del simulador, lo que limita su generalización a otros entornos.
- El tipo de campaña inferido es heurístico, no un resultado aprendido de forma robusta.
- La salida de evidencia es un proxy de investigación, no una explicación causal real.
- No implementa el GNN heterogéneo temporal final propuesto para la versión de investigación, por lo que sus capacidades son limitadas en comparación con el objetivo del proyecto.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial o la redistribución.
- No se proporcionan datos sobre sesgos, pero al entrenarse solo con datos sintéticos, es probable que no capture la variabilidad del mundo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adnanallemon/aml-campaigngraph-alpha
- Repositorio versionado de AML-CampaignGraph: mencionado en la model card como "versioned AML-CampaignGraph repository" (URL no disponible en la información proporcionada).
- Archivo de citación: `CITATION.cff` referenciado en la model card (no se proporciona URL directa).

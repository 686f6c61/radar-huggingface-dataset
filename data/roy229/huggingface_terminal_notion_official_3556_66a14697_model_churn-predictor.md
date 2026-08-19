# Roy229/huggingface_terminal_notion_official_3556_66a14697_model_churn-predictor

## Resumen

El modelo `Roy229/huggingface_terminal_notion_official_3556_66a14697_model_churn-predictor` es un predictor de abandono de clientes (churn) desarrollado por el usuario Roy229. Su funcion principal es estimar la probabilidad de que un cliente cancele su suscripcion o abandone el servicio en un horizonte temporal de 90 dias, utilizando para ello senales de engagement y de facturacion. Se trata de un modelo de aprendizaje automatico clasico (no generativo), orientado a su integracion en flujos de trabajo de customer success.

A diferencia de los grandes modelos de lenguaje, este artefacto no presenta una arquitectura de transformer ni parametros de red neuronal publicados. La informacion tecnica disponible en la model card es extremadamente limitada: no se especifican la arquitectura, el tamano, el contexto, la licencia ni los idiomas soportados. Su relevancia radica en su caso de uso concreto: la identificacion proactiva de cuentas en riesgo para permitir intervenciones de retencion antes de que se produzca la cancelacion.

La ficha que se presenta a continuacion refleja fielmente la escasez de datos tecnicos publicados. Se han marcado como "no disponible" todos aquellos parametros que no aparecen en la documentacion oficial, evitando cualquier especulacion sobre su implementacion interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplicable, modelo no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. Dado su proposito (prediccion de churn a partir de senales de engagement y facturacion), es probable que se trate de un modelo de aprendizaje supervisado clasico, como regresion logistica, gradient boosting o un pequeno perceptron multicapa, pero no se dispone de confirmacion oficial.

Tampoco se han facilitado datos sobre el conjunto de entrenamiento, el numero de muestras, las caracteristicas exactas utilizadas ni el proceso de optimizacion. La model card no menciona tecnicas como RLHF, DPO ni ningun otro metodo de ajuste. La unica informacion contextual es que el modelo opera con senales de engagement y facturacion, y que su salida es una puntuacion de riesgo de abandono a 90 dias.

## Capacidades

- Prediccion de la probabilidad de abandono de un cliente en un plazo de 90 dias.
- Utilizacion de senales de engagement (frecuencia de uso, interacciones) y de facturacion (retrasos en pagos, cambios de plan) como variables de entrada.
- Generacion de una puntuacion de riesgo que permite priorizar cuentas en los flujos de trabajo de customer success.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente, al ser un modelo de clasificacion o regresion tabular.
- No se especifican capacidades multilingues; se asume que opera sobre datos numericos o categoricos de clientes.

## Casos de uso

- Priorizacion de cuentas en riesgo: el modelo asigna una puntuacion de riesgo a cada cuenta, permitiendo a los equipos de customer success ordenar la cola de trabajo y centrar sus esfuerzos en los clientes con mayor probabilidad de abandono en los proximos 90 dias.
- Segmentacion para campanas de retencion: permite dividir la base de clientes en segmentos de riesgo (alto, medio, bajo) para disenar campanas de retencion especificas, como ofertas de descuento o mejoras de plan, dirigidas a los segmentos mas vulnerables.
- Alertas tempranas en el CRM: integrado en un sistema de gestion de relaciones con clientes, puede generar alertas automaticas cuando un cliente supera un umbral de riesgo, facilitando una intervencion proactiva del equipo comercial antes de la cancelacion.
- Analisis de senales de comportamiento: al basarse en senales de engagement y facturacion, ayuda a identificar que comportamientos concretos (reduccion de uso, retrasos en pagos) correlacionan con el abandono, orientando las politicas de producto y soporte.
- Optimizacion de recursos de soporte: dirige los recursos de soporte tecnico y de atencion al cliente hacia las cuentas con mayor riesgo, mejorando la eficiencia operativa y reduciendo el coste de retencion.
- Evaluacion de intervenciones de retencion: aunque el modelo es correlacional, puede utilizarse para comparar la puntuacion de riesgo de un cliente antes y despues de una accion de retencion, ayudando a medir de forma aproximada el impacto de dichas acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como exactitud, AUC, precision o recall, ni de comparaciones con otros modelos de prediccion de churn.

## Requisitos de hardware

No se han publicado requisitos de hardware especificos para este modelo. Al tratarse de un modelo de prediccion tabular (no generativo), es muy probable que su inferencia pueda ejecutarse en CPU sin necesidad de GPU, pero no se dispone de datos oficiales sobre VRAM, latencia o throughput. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, que son especificas para modelos de lenguaje.

## Comparativa con modelos similares

No disponible. No se ha proporcionado informacion sobre modelos comparables en la misma categoria (prediccion de churn) ni sobre sus respectivas metricas o caracteristicas.

## Limitaciones y advertencias

- Predicciones correlacionales, no causales: el modelo identifica correlaciones entre senales de engagement/facturacion y el abandono, pero no establece relaciones de causa y efecto. Una intervencion basada en estas predicciones puede no alterar el resultado final.
- Degradacion con historial disperso: el rendimiento del modelo puede verse afectado negativamente en clientes con una actividad historica escasa, ya que las senales de engagement disponibles son insuficientes para realizar una estimacion fiable.
- Licencia desconocida: al no especificarse la licencia, no se puede garantizar la seguridad juridica para su uso comercial. Se recomienda contactar con el autor antes de integrarlo en un entorno de produccion.
- Documentacion insuficiente: la ausencia de especificaciones tecnicas (arquitectura, datos de entrenamiento, metricas) impide evaluar su robustez, sesgos potenciales o idoneidad para dominios distintos al original.
- Riesgo de sesgo en los datos: al depender de senales de facturacion y engagement, el modelo podria perpetuar sesgos presentes en los datos historicos de clientes, como la discriminacion por tipo de plan o antiguedad, aunque no se ha publicado ninguna auditoria al respecto.

## Enlaces

- [Pagina del modelo en HuggingFace](https://huggingface.co/Roy229/huggingface_terminal_notion_official_3556_66a14697_model_churn-predictor)

# nvidia/Kumo-Relational

## Resumen

Kumo Relational es un modelo fundacional preentrenado por NVIDIA para tareas de clasificación y regresión sobre tablas relacionadas mediante aprendizaje en contexto (in-context learning). Se presenta como la evolución de KumoRFM-2 y combina embeddings de fila con paso de mensajes relacional (relational message passing), lo que le permite razonar sobre esquemas de bases de datos con múltiples tablas enlazadas por claves foráneas sin necesidad de reentrenamiento por tarea.

El modelo se distribuye como un fine-tuning de los pesos preentrenados de TabICLv2 (jingang/TabICL) y se consume a través de la librería `structured-data-models` de NVIDIA, que expone una API de predicción con parámetros para tablas de contexto y de consulta, tanto principales como relacionadas. Su relevancia actual radica en que ataca un nicho poco cubierto por los LLM generalistas: la predicción supervisada sobre datos tabulares relacionales, un formato dominante en entornos empresariales (CRM, riesgo crediticio, telemetría, logística).

La información pública disponible no detalla el número de parámetros, la longitud de contexto ni los volúmenes de entrenamiento; el repositorio de Hugging Face ocupa 0,7 GB, lo que sugiere un modelo de tamaño moderado orientado a inferencia eficiente más que a escala masiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fundacional relacional con embeddings de fila y paso de mensajes relacional (basado en KumoRFM-2 y TabICLv2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a datos tabulares, no a texto libre) |
| Licencia | OpenMDW 1.1 (pesos); componentes upstream TabICLv2 bajo BSD-3-Clause |
| Formato de pesos | no disponible (repo de 0,7 GB; consumo via `structured-data-models`) |

## Arquitectura y entrenamiento

Kumo Relational se construye sobre TabICLv2, un modelo tabular de aprendizaje en contexto, al que NVIDIA añade una capa de razonamiento relacional: los registros de cada tabla se codifican como embeddings de fila y se propagan mensajes entre tablas enlazadas para agregar información de entidades relacionadas antes de emitir la predicción. El resultado es un modelo que recibe un conjunto de contexto etiquetado (x_context, y_context) junto con tablas relacionadas de contexto y consulta, y devuelve probabilidades de clase o valores de regresión sin ajuste de parámetros por tarea.

La inferencia se realiza con `num_estimators=8` en el ejemplo oficial, lo que indica un esquema de ensemble interno de estimadores para estabilizar la predicción. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del corpus relacional, ni si se aplicaron etapas de RLHF o DPO; tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación supervisada sobre tablas relacionales con aprendizaje en contexto (sin reentrenamiento por tarea).
- Regresión sobre el mismo esquema de datos relacionales.
- Manejo de múltiples tablas enlazadas mediante tablas de contexto y de consulta relacionadas (`related_context_tables`, `related_query_tables`).
- Predicción de probabilidades de clase mediante ensemble interno de estimadores (`num_estimators`).
- Ejecución en GPU CUDA mediante la librería `structured-data-models` (`device="cuda"`).
- No se documentan capacidades de generación de texto libre, tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Scoring de riesgo crediticio: el modelo recibe historial de clientes, operaciones y tablas de productos relacionadas como contexto, y predice la probabilidad de impago sobre nuevos solicitantes sin reentrenar el pipeline por cada cartera.
- Predicción de churn en SaaS: se alimentan tablas de cuentas, suscripciones y eventos de uso enlazadas por identificador de cliente, y el modelo estima la probabilidad de baja para cuentas activas.
- Detección de fraude transaccional: con tablas de transacciones, dispositivos y titulares relacionadas, se clasifican operaciones nuevas como sospechosas o legítimas aprovechando el contexto relacional agregado.
- Priorización de leads en CRM: combinando tablas de contactos, empresas y oportunidades, el modelo regresiona el valor esperado de cada oportunidad para ordenar la cartera comercial.
- Mantenimiento predictivo industrial: con lecturas de sensores, activos y órdenes de trabajo relacionadas, se estima la probabilidad de fallo de un equipo en un horizonte definido.
- Enriquecimiento de catálogo en e-commerce: clasificación de productos nuevos en categorías o atributos usando tablas de productos, vendedores y reseñas como contexto relacional.
- Investigación en modelos tabulares: banco de pruebas para evaluar aprendizaje en contexto sobre esquemas relacionales frente a gradient boosting tradicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio de pesos ocupa 0,7 GB, por lo que la inferencia en FP16 debería caber holgadamente en GPUs de consumo, pero no se confirma oficialmente.
- GPU recomendadas: no disponible; el ejemplo oficial usa `device="cuda"` sin especificar modelo de GPU.
- GPU de consumo: probablemente viable en tarjetas con suficiente VRAM para el modelo y los tensores de contexto relacional, sin cifra confirmada.
- Despliegue: librería `structured-data-models` (`pip install structured-data-models`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, coherente con un modelo tabular y no generativo.
- Latencia y throughput: no disponibles; dependen del tamaño de las tablas de contexto y del número de estimadores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kumo Relational (NVIDIA) | no disponible | no disponible | Clasificación/regresión relacional in-context | OpenMDW 1.1 | Hugging Face |
| TabICLv2 (jingang/TabICL) | no disponible | no disponible | Clasificación/regresión tabular in-context | BSD-3-Clause | Hugging Face |
| KumoRFM-2 | no disponible | no disponible | Modelo relacional predecesor | no disponible | no disponible |
| Gradient boosting (XGBoost/LightGBM) | no aplica | no aplica | Tabular clásico, requiere entrenamiento por tarea | Apache 2.0 / MIT | Amplia |

La comparación cuantitativa de rendimiento no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso conversacional.
- No se documentan sesgos conocidos ni evaluaciones de equidad; al entrenarse sobre datos relacionales, puede heredar sesgos de las distribuciones de entrenamiento no publicadas.
- Riesgo de alucinación en el sentido de predicciones sobreeseguras cuando el contexto relacional es escaso o el esquema de consulta difiere del visto en entrenamiento.
- Sin datos publicados sobre longitud de contexto, cobertura de idiomas ni robustez ante esquemas con muchas tablas.
- La licencia OpenMDW 1.1 debe revisarse antes de uso comercial; además, los pesos derivan de TabICLv2 bajo BSD-3-Clause, cuyas atribuciones se conservan en `THIRD-PARTY-NOTICES.txt`.
- La API requiere construir correctamente las tablas de contexto y consulta relacionadas; errores en las claves de unión degradan la predicción sin aviso explícito.
- No hay información sobre latencia en producción ni sobre límites de tamaño de tabla soportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Kumo-Relational
- Repositorio de inferencia: https://github.com/NVIDIA/structured-data-models
- Modelo base TabICL: https://huggingface.co/jingang/TabICL

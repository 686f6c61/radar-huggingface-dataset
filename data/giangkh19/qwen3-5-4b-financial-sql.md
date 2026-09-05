# giangkh19/Qwen3.5-4B-Financial-SQL

## Resumen

Qwen3.5-4B-Financial-SQL es un modelo de lenguaje especializado en la generacion de consultas SQL a partir de preguntas en lenguaje natural sobre informes financieros de empresas cotizadas en las bolsas vietnamitas HOSE y HNX. Ha sido desarrollado por giangkh19 como un finetune del modelo base Qwen/Qwen3.5-4B, con un total de 4.659.865.088 parametros (aproximadamente 4.660 millones). El modelo se ha entrenado sobre un conjunto de 582 muestras Gold Standard verificadas al 100 % contra una base de datos SQLite de estados financieros, lo que garantiza que las consultas generadas son ejecutables y devuelven resultados correctos.

La arquitectura no se especifica en la informacion disponible, pero se hereda del modelo base Qwen/Qwen3.5-4B. La longitud de contexto tampoco se ha publicado. El modelo esta pensado para resolver el problema de la consulta de datos contables complejos sin necesidad de conocer SQL, automatizando tareas de analisis financiero que requieren extraer metricas como beneficios netos, margenes o ratios de crecimiento. Su relevancia actual radica en la creciente demanda de herramientas de IA aplicadas a datos financieros estructurados, donde la precision y la trazabilidad de las consultas son criticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; modelo base Qwen/Qwen3.5-4B |
| Parametros totales | 4.659.865.088 (aproximadamente 4.660 millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Float16/Bfloat16 (merged 16-bit) |
| Idiomas soportados | Vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se obtiene mediante un finetune del modelo base Qwen/Qwen3.5-4B. El proceso de entrenamiento utiliza QLoRA 4-bit a traves de la libreria Unsloth, con una tecnica de enmascaramiento de perdida solo en la respuesta (response-only loss masking). El entrenamiento se realizo durante 73 pasos globales con un tamano de lote efectivo de 16, alcanzando una perdida de entrenamiento de 0.3059, lo que indica una convergencia optima.

El dataset de entrenamiento esta compuesto por 582 muestras Gold Standard de informes financieros vietnamitas, verificadas al 100 % mediante su ejecucion en una base de datos SQLite que contiene la tabla `financial_facts`. Esta tabla incluye campos como `ticker`, `company_name`, `year`, `report_type`, `statement`, `item_name`, `item_name_ascii`, `period_label`, `value_vnd`, `raw_value`, `unit`, `page_no` y `source_doc`. La innovacion tecnica destacable es el uso de razonamiento en cadena de pensamiento dentro de etiquetas ``, que permite al modelo analizar la logica contable antes de generar la consulta SQL. Ademas, el modelo final se entrega como un modelo completo en precision de 16 bits (Float16/Bfloat16), listo para su despliegue con vLLM, SGLang o Transformers.

## Capacidades

- Generacion de consultas SQL ANSI SQLite estandar, sin parametros ocultos ni reglas de reserva.
- Razonamiento en cadena de pensamiento (etiquetas `) para descomponer preguntas financieras complejas en pasos logicos.
- Extraccion automatica de entidades financieras: codigo de cotizacion (`ticker`), ano fiscal, tipo de informe (consolidado o separado), tipo de estado (balance, resultados, flujos de caja) y formulas matematicas explicitas (diferencias, porcentajes de crecimiento, margenes netos).
- Trazabilidad de auditoria: cada consulta devuelve datos con su origen (`item_name`, `period_label`, `raw_value`, `unit`, `page_no`, `source_doc`), lo que permite verificar la fuente en el PDF original.
- Soporte multilingue: vietnamita e ingles, con capacidad para manejar nombres de indicadores contables en vietnamita con y sin tildes.
- Preparado para su uso en produccion con vLLM, SGLang y Transformers, gracias a su formato de pesos en 16 bits.

## Casos de uso

- Consulta de datos financieros para analistas: un analista pregunta cual fue el beneficio despues de impuestos de FPT en 2023 y el modelo genera la consulta SQL que devuelve el dato exacto con su unidad y fuente.
- Automatizacion de informes periodicos: el modelo se integra en un pipeline que genera informes trimestrales automaticos, convirtiendo plantillas de preguntas en consultas SQL ejecutables sobre la base de datos financiera.
- Asistente de inversion: un chatbot de atencion al inversor que responde preguntas sobre ratios financieros, crecimiento o liquidez de empresas vietnamitas, traduciendo la pregunta a SQL y presentando el resultado con su trazabilidad.
- Auditoria y cumplimiento: en procesos de auditoria, el modelo genera consultas que incluyen la referencia al documento fuente (`page_no`, `source_doc`), facilitando la verificacion de los datos reportados.
- Comparacion de ejercicios fiscales: permite consultar datos de varios anos (2017-2024) y comparar metricas de crecimiento, como la evolucion del beneficio neto, mediante consultas SQL con calculos de variacion.
- Analisis de estados financieros consolidados frente a separados: el modelo distingue entre reportes consolidados y de empresa matriz, generando consultas especificas para cada tipo de informe, lo que es util para analizar grupos empresariales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9.3 GB para los pesos en bfloat16 (segun el tamano del repositorio). Se recomienda un minimo de 12-16 GB de VRAM para acomodar pesos y activaciones durante la generacion.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como RTX 4080/4090, A100 40GB o superiores. No se han publicado datos oficiales de latencia o throughput.
- Compatibilidad con GPU de consumo: es posible ejecutarlo en una RTX 3090/4090 (24 GB) sin cuantizacion adicional. Para GPUs de 8-12 GB se necesitaria cuantizacion, pero no hay datos de cuantizaciones disponibles en la informacion del modelo.
- Opciones de despliegue: segun el model card, el modelo es compatible con vLLM, SGLang y Transformers. No se proporcionan instrucciones para llama.cpp, Ollama o TGI en la informacion disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparativas con otros modelos similares.

## Limitaciones y advertencias

- Especializacion limitada: el modelo solo esta entrenado para el esquema `financial_facts` y consultas financieras vietnamitas; no se garantiza su rendimiento en otros dominios.
- Dataset pequeno: 582 muestras de entrenamiento pueden no cubrir la diversidad de preguntas posibles, lo que aumenta el riesgo de fallos en preguntas no vistas.
- Sin benchmarks publicados: no hay evaluaciones independientes que midan su rendimiento en tareas generales o especificas, por lo que su calidad relativa es desconocida.
- Longitud de contexto no especificada: puede afectar a consultas con mucho contexto o preguntas largas.
- Dependencia del esquema de base de datos: cambios en la estructura de `financial_facts` invalidarian las consultas generadas.
- Riesgo de alucinacion: en preguntas ambiguas o fuera del dominio, el modelo puede generar SQL incorrecto o inventar datos, ya que no hay validacion externa.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen/Qwen3.5-4B, deben respetarse los terminos del modelo base.
- Sesgos no documentados: al entrenarse en un corpus de informes financieros vietnamitas, podria reflejar sesgos de ese conjunto, aunque no se han documentado explicitamente.

## Enlaces

- https://huggingface.co/giangkh19/Qwen3.5-4B-Financial-SQL

# Lumina-ERP/lumina-tsql-8b-FP8-dynamic

## Resumen

Lumina-tsql-8b-FP8-dynamic es un modelo de generación de texto especializado en la traducción de lenguaje natural a T-SQL (Transact-SQL), el dialecto de SQL utilizado por Microsoft SQL Server. Ha sido desarrollado por Lumina-ERP, una consultora de ingeniería especializada en sistemas ERP como Prophet 21 y Epicor Kinetic, que también ofrece una plataforma de IA propia. El modelo parte de la base Lumina-ERP/lumina-tsql-8b, que a su vez se construye sobre la arquitectura Qwen3, y se distribuye en formato FP8 dinámico para reducir el uso de memoria y acelerar la inferencia sin sacrificar una precisión significativa.

El modelo tiene 8.190 millones de parámetros y está pensado para entornos empresariales donde la interacción con bases de datos SQL Server es frecuente, como sistemas ERP, CRM o herramientas de inteligencia de negocio. Su relevancia actual reside en la creciente demanda de asistentes de datos que permitan a usuarios no técnicos consultar bases de datos mediante lenguaje natural, así como en la necesidad de integrar modelos de lenguaje en pipelines de datos y herramientas de desarrollo. La licencia Apache 2.0 permite su uso comercial y modificación, aunque el acceso al repositorio está restringido y requiere aceptar las condiciones en HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 dinámico (compressed-tensors) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Lumina-ERP/lumina-tsql-8b |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer decoder con atención causal estándar. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. Se sabe que el modelo se ha ajustado específicamente para la generación de T-SQL, probablemente sobre un corpus de consultas SQL Server y esquemas de bases de datos de sistemas ERP. La versión FP8 dinámica aplica cuantización de 8 bits en los pesos mediante la librería compressed-tensors, lo que reduce el tamaño del modelo de aproximadamente 16 GB a 9.5 GB y acelera la inferencia en hardware compatible con FP8, como las GPUs NVIDIA Hopper.

## Capacidades

- Generación de T-SQL a partir de instrucciones en lenguaje natural.
- Comprensión de esquemas de bases de datos SQL Server (tablas, columnas, relaciones).
- Generación de consultas con joins, subconsultas, agregaciones, CTEs y funciones de ventana.
- Soporte de conversación multi-turno para refinar consultas.
- Capacidad de explicar y documentar consultas SQL generadas.
- Integración con herramientas de texto como pipelines de HuggingFace y endpoints compatibles con TGI.
- Soporte de tool calling no confirmado, pero probablemente derivado de Qwen3 (no disponible en la información proporcionada).

## Casos de uso

- **Asistente de consultas para analistas de negocio**: un analista sin conocimientos profundos de SQL puede escribir una pregunta en lenguaje natural ("¿Cuántas ventas hubo por región en el último trimestre?") y obtener una consulta T-SQL lista para ejecutar en SQL Server.
- **Automatización de reportes en ERP**: integrado en sistemas como Prophet 21 o Epicor Kinetic, el modelo puede generar consultas para extraer datos de inventario, pedidos o facturación sin intervención manual.
- **Generación de código SQL para pipelines de datos**: en entornos de ETL, el modelo puede generar los scripts de transformación necesarios para mover datos entre sistemas, reduciendo el tiempo de desarrollo.
- **Auditoría de consultas SQL**: el modelo puede revisar consultas existentes y sugerir versiones más eficientes o corregir errores de sintaxis.
- **Formación de desarrolladores junior**: el modelo puede generar consultas de ejemplo y explicar el razonamiento detrás de cada cláusula, sirviendo como herramienta de aprendizaje.
- **Generación de datos de prueba**: en entornos de desarrollo, el modelo puede generar consultas para crear datos sintéticos en bases de datos de prueba, facilitando el desarrollo de aplicaciones.
- **Integración en chatbots de soporte técnico**: el modelo puede alimentar un asistente virtual que resuelva dudas sobre bases de datos SQL Server en lenguaje natural, reduciendo la carga de los equipos de soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de text-to-SQL como Spider o BIRD. El repositorio no incluye una tabla de rendimiento comparativa.

## Requisitos de hardware

- **VRAM estimada**: para FP8 (8 bits), el modelo ocupa aproximadamente 9.5 GB en memoria, por lo que se recomienda al menos 12 GB de VRAM para inferencia con un lote pequeño.
- **GPU recomendadas**: NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB), H100 (80 GB). En GPUs sin soporte FP8 nativo, el modelo puede ejecutarse en FP16, pero requerirá más VRAM.
- **Compatibilidad con GPUs de consumo**: sí, cabe en una RTX 4090 o RTX 4080 con suficiente VRAM.
- **Opciones de despliegue**: vLLM, TGI (Text Generation Inference), llama.cpp (con conversión a GGUF), Ollama, Transformers de HuggingFace.
- **Latencia y throughput**: no disponible en la información proporcionada, pero en una A100 se espera una latencia de menos de 100 ms por token con FP8.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lumina-tsql-8B-FP8-dynamic | 8.19 B | no disponible | T-SQL | Apache 2.0 | Restringida (gated) |
| Qwen2.5-Coder-7B | 7.6 B | 32k | Código general | Apache 2.0 | Abierta |
| CodeLlama-7B | 6.7 B | 16k | Código general | Llama 2 License | Abierta |
| DeepSeek-Coder-6.7B | 6.7 B | 16k | Código general | MIT | Abierta |

La comparativa se basa en modelos de código general, ya que no se conocen alternativas de código abierto especializadas en T-SQL con el mismo tamaño. El modelo Lumina-tsql tiene la ventaja de estar ajustado específicamente para el dialecto SQL Server, lo que debería ofrecer mayor precisión en ese dominio, aunque no se dispone de datos de rendimiento que lo confirmen.

## Limitaciones y advertencias

- **Acceso restringido**: el repositorio es gated y requiere aceptar condiciones en HuggingFace, lo que puede limitar su adopción en entornos corporativos.
- **Idioma**: el modelo solo soporta inglés, lo que limita su uso en entornos donde las consultas se realicen en otros idiomas.
- **Alucinación**: como cualquier modelo de lenguaje, puede generar consultas SQL sintácticamente válidas pero incorrectas a nivel lógico, por lo que se recomienda supervisión humana en entornos de producción.
- **Dependencia del esquema**: la precisión depende en gran medida de la claridad del esquema de la base de datos; esquemas complejos o mal documentados pueden reducir la calidad de las consultas.
- **FP8**: la cuantización FP8 puede introducir una ligera pérdida de precisión en comparación con FP16, aunque suele ser despreciable para la mayoría de los casos de uso.
- **Sin datos de rendimiento**: no hay benchmarks públicos que permitan evaluar su rendimiento real frente a otros modelos, por lo que se recomienda realizar pruebas internas antes de adoptarlo en producción.

## Enlaces

- [HuggingFace - Lumina-ERP/lumina-tsql-8b-FP8-dynamic](https://huggingface.co/Lumina-ERP/lumina-tsql-8b-FP8-dynamic)
- [HuggingFace - Lumina-ERP/lumina-tsql-8b (modelo base)](https://huggingface.co/Lumina-ERP/lumina-tsql-8b)
- [Lumina ERP (sitio web)](https://lumina-erp.com/)
- [GitHub - capt-noah/lumina-erp (documentación)](https://github.com/capt-noah/lumina-erp/blob/main/DOCUMENTATION.md)
- [HuggingFace - jetjodh/lumina-fp8 (posiblemente no relacionado)](https://huggingface.co/jetjodh/lumina-fp8/tree/main)</think>## Resumen

Lumina-tsql-8b-FP8-dynamic es un modelo de generación de texto especializado en la traducción de lenguaje natural a T-SQL (Transact-SQL), el dialecto de SQL utilizado por Microsoft SQL Server. Ha sido desarrollado por Lumina-ERP, una empresa consultora de ingeniería especializada en sistemas ERP como Prophet 21 y Epicor Kinetic, que también ofrece una plataforma de inteligencia artificial propia. El modelo es una versión cuantizada en FP8 dinámico del modelo base Lumina-ERP/lumina-tsql-8b, que a su vez se basa en la arquitectura Qwen3.

El modelo tiene 8.190 millones de parámetros y está diseñado para facilitar la interacción con bases de datos SQL Server mediante lenguaje natural, un caso de uso habitual en entornos empresariales donde los analistas no siempre dominan la sintaxis de T-SQL. Su relevancia actual radica en la creciente demanda de herramientas de text-to-SQL que reduzcan la fricción entre los datos operativos de un ERP y la toma de decisiones. La licencia Apache 2.0 permite su uso comercial, aunque el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (dynamic, compressed-tensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repo | 9.5 GB |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3 de Alibaba, un transformer decoder con atencion causal estandar. No se han publicado detalles sobre el numero de tokens de entrenamiento ni la composicion del dataset, pero el nombre del modelo y los tags indican que esta especializado en T-SQL y en el contexto de sistemas ERP. La cuantizacion FP8 dinamica se aplica mediante la libreria compressed-tensors, lo que reduce el peso del modelo de aproximadamente 16 GB a 9.5 GB sin perder una precision significativa en la mayoria de los casos. No se dispone de informacion sobre tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto T-SQL a partir de instrucciones en lenguaje natural.
- Traduccion de consultas en ingles a sentencias SQL Server (SELECT, INSERT, UPDATE, DELETE, JOIN, subconsultas, CTEs, funciones de ventana).
- Soporte de conversacion multi-turno para refinar consultas de forma iterativa.
- Generacion de consultas orientadas a esquemas de bases de datos de sistemas ERP (Prophet 21, Epicor Kinetic).
- Capacidades generales de generacion de texto derivadas de la base Qwen3 (razonamiento, codigo, matematicas basicas).
- No se ha confirmado soporte de tool calling, function calling ni modo agente en la informacion disponible.

## Casos de uso

- **Asistente de consultas para analistas de negocio**: un analista sin conocimientos profundos de T-SQL puede escribir una pregunta en lenguaje natural ("¿Cuantas ordenes de compra hay pendientes por proveedor?") y obtener una consulta SQL ejecutable para Microsoft SQL Server.
- **Generacion de informes en sistemas ERP**: el modelo puede integrarse en Prophet 21 o Epicor Kinetic para generar consultas que alimenten dashboards y reportes de inventario, ventas o facturacion.
- **Automatizacion de extraccion de datos**: en pipelines de datos, el modelo puede generar los T-SQL necesarios para extraer informacion de bases de datos de origen en procesos ETL.
- **Formacion de personal tecnico**: el modelo puede servir como herramienta de aprendizaje para desarrolladores junior que necesiten ver como se construye una consulta T-SQL correcta a partir de una peticion en lenguaje natural.
- **Depuracion de consultas existentes**: dado un trozo de T-SQL, el modelo puede reformularlo o explicarlo, ayudando a detectar errores logicos o de sintaxis.
- **Generacion de consultas para auditoria de datos**: en entornos de compliance, el modelo puede generar consultas para detectar anomalias o duplicados en tablas de sistemas contables.
- **Integracion en herramientas de BI**: el modelo puede conectarse a Power BI o Tableau para generar consultas SQL subyacentes a partir de preguntas en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, ni de evaluaciones especificas de text-to-SQL como Spider o Bird.

## Requisitos de hardware

- **VRAM estimada**: con cuantizacion FP8, el modelo ocupa aproximadamente 9.5 GB en memoria, por lo que se recomienda una GPU con al menos 12 GB de VRAM para inferencia con una longitud de contexto moderada.
- **GPU recomendadas**: NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB), H100 (80 GB). Las GPUs con soporte FP8 nativo (H100, L40S) aprovechan al maximo la cuantizacion.
- **Compatibilidad con GPU de consumo**: si, cabe en una RTX 4090 y en RTX 4080 con suficiente VRAM.
- **Opciones de despliegue**: vLLM, Text Generation Inference (TGI), llama.cpp (requiere convertir a GGUF), Ollama, y transformers de HuggingFace.
- **Latencia y throughput**: no disponible en la informacion proporcionada, pero en una A100 con FP8 se espera una latencia de decenas de milisegundos por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lumina-tsql-8b-FP8-dynamic | 8.19 B | no disponible | T-SQL / ERP | Apache 2.0 | Gated |
| Qwen2.5-Coder-7B | 7.6 B | 32 K | Codigo general | Apache 2.0 | Abierta |
| CodeLlama-7B | 6.8 B | 4 K | Codigo general | Llama 2 License | Abierta |
| DeepSeek-Coder-6.7B | 6.7 B | 16 K | Codigo general | MIT | Abierta |

La comparativa se limita a modelos de codigo general del mismo rango de parametros, ya que no se conocen alternativas publicas especializadas en T-SQL con este tamano. La ventaja del modelo Lumina es su ajuste especifico para T-SQL y sistemas ERP, aunque no se dispone de benchmarks que cuantifiquen esa ventaja.

## Limitaciones y advertencias

- **Acceso restringido**: el repositorio es gated y requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en entornos corporativos.
- **Idioma**: solo soporta ingles. No sirve para consultas en espanol u otros idiomas.
- **Alucinacion de consultas**: como cualquier modelo text-to-SQL, puede generar consultas sintacticamente validas pero logicamente incorrectas, especialmente con esquemas complejos o ambiguos.
- **Contexto limitado**: no se ha publicado la longitud de contexto; si es similar a Qwen3 base, probablemente sea de 32 K tokens, pero no esta confirmado.
- **Sesgos de datos**: al estar entrenado probablemente con datos de sistemas ERP de Lumina, puede tener sesgos hacia los esquemas de Prophet 21 y Epicor Kinetic, y rendir peor con otros esquemas SQL Server.
- **FP8**: la cuantizacion FP8 puede introducir una ligera perdida de precision en comparacion con FP16, aunque en tareas de generacion de SQL el impacto suele ser minimo.
- **Sin benchmarks**: no hay evidencia publica de rendimiento en tareas text-to-SQL, por lo que se recomienda validar el modelo en un dataset propio antes de usarlo en produccion.

## Enlaces

- [HuggingFace - Lumina-ERP/lumina-tsql-8b-FP8-dynamic](https://huggingface.co/Lumina-ERP/lumina-tsql-8b-FP8-dynamic)
- [HuggingFace - Lumina-ERP/lumina-tsql-8b (modelo base)](https://huggingface.co/Lumina-ERP/lumina-tsql-8b)
- [Lumina ERP - sitio web](https://lumina-erp.com/)
- [GitHub - capt-noah/lumina-erp (documentacion)](https://github.com/capt-noah/lumina-erp/blob/main/DOCUMENTATION.md)

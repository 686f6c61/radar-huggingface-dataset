# Lumina-ERP/lumina-tsql-8b

## Resumen

Lumina-tsql-8b es un modelo de generación de texto a SQL (text-to-SQL) especializado en T-SQL para entornos ERP de distribución, desarrollado por Lumina ERP, una consultora con sede en Houston (Texas) que presta servicios de implementación, migración y soporte para plataformas como Prophet 21 y Epicor Kinetic. El modelo parte del base Qwen/Qwen3-8B y ha sido ajustado con adaptadores LoRA y entrenamiento basado en preferencias (DPO) sobre un conjunto de datos propio denominado `erpbench-distribution`, orientado a consultas reales de sistemas ERP de distribución.

El modelo tiene 8.190 millones de parámetros y está publicado en formato safetensors bajo licencia Apache-2.0, aunque el acceso es restringido (gated) y requiere aceptar las condiciones en Hugging Face. Se presenta como una solución conversacional y ejecutada en tierra (execution-grounded), lo que significa que las respuestas se validan contra los resultados reales de las consultas SQL generadas. Es relevante para desarrolladores que necesitan automatizar la generación de consultas T-SQL en contextos ERP, especialmente en el sector de distribución y fabricación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, 32K tokens en el modelo base) |
| Tipos de cuantización | no disponible (solo safetensors, sin GGUF publicado) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso con atención por ventanas y mecanismos de decodificación especulativa incorporados en la arquitectura original. Sobre esta base, Lumina ha aplicado un fine-tune con adaptadores LoRA y una fase de entrenamiento con DPO (Direct Preference Optimization) para alinear el comportamiento hacia la generación de consultas T-SQL correctas y eficientes en el contexto de ERP de distribución.

El conjunto de datos `erpbench-distribution` está diseñado para ser execution-grounded, es decir, cada ejemplo de entrenamiento se valida ejecutando la consulta generada contra una base de datos de referencia y comparando los resultados con los esperados. Esto reduce la probabilidad de alucinaciones sintácticas y semánticas en las consultas. No se ha publicado información sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de consultas T-SQL: el modelo produce sentencias SQL Server (T-SQL) a partir de descripciones en lenguaje natural, orientadas a esquemas de ERP de distribución (inventario, pedidos, facturación).
- Conversación multi-turno: al estar basado en Qwen3, mantiene diálogos coherentes para refinar consultas o explicar resultados.
- Execution-grounded: las respuestas se validan contra resultados reales de ejecución, lo que reduce errores en la generación.
- Soporte de tool calling: al heredar la capacidad de Qwen3-8B, puede integrarse en pipelines que requieran invocación de funciones o herramientas externas.
- Capacidades multilingües: aunque el modelo se publica en inglés, el base Qwen3-8B tiene soporte multilingüe (chino, inglés, español, entre otros), pero el fine-tune está orientado exclusivamente a inglés.
- Especialización en esquemas de ERP de distribución: comprende tablas, columnas y relaciones típicas de sistemas como Prophet 21 o Epicor Kinetic, así como patrones de consulta comunes en el sector.

## Casos de uso

- Automatización de informes de inventario: un analista puede pedir al modelo "muestra los productos con stock bajo en el almacén central" y obtener una consulta T-SQL lista para ejecutar en el ERP, ahorrando tiempo en la escritura manual.
- Generación de consultas de pedidos y facturación: el modelo puede traducir preguntas como "total de ventas por cliente en el último trimestre" en consultas agregadas con JOINs y funciones de ventana, adecuadas para paneles de BI.
- Asistente de soporte técnico para consultas de ERP: los consultores de Lumina pueden usarlo en su plataforma de IA para responder preguntas sobre datos de clientes sin necesidad de escribir SQL manualmente.
- Integración en pipelines de ETL: los desarrolladores pueden invocar el modelo desde scripts Python o servicios REST para generar dinámicamente consultas de extracción de datos según parámetros de negocio.
- Formación y documentación de consultas: el modelo puede explicar y documentar consultas existentes, generando comentarios o versiones alternativas optimizadas.
- Validación de consultas en entornos de prueba: al ser execution-grounded, se puede usar para verificar que una consulta generada devuelve los resultados esperados antes de desplegarla en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de text-to-SQL (como Spider o BIRD). Tampoco se han reportado comparaciones con otros modelos en el repositorio de Hugging Face.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en fp16 (pesos completos), o unos 6-8 GB con cuantización 4-bit (si se genera GGUF o se aplica AWQ, aunque no se ha publicado oficialmente).
- GPU recomendadas: el modelo es de 8B parámetros, por lo que cabe en GPUs de consumo como RTX 3090 (24 GB), RTX 4090 (24 GB), o en GPUs profesionales como A10G (24 GB) o A100 (40/80 GB). En cuantización 4-bit podría ejecutarse en RTX 4070 (12 GB) o incluso RTX 4060 Ti (16 GB).
- Opciones de despliegue: compatible con transformers y TGI (text-generation-inference), puede servirse con vLLM, llama.cpp (si se convierte a GGUF) u Ollama (si se publica el formato). Dado que el repo solo contiene safetensors, se requiere conversión para llama.cpp.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No hay datos de rendimiento para comparar directamente, pero se puede contextualizar con alternativas de la misma categoría:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lumina-tsql-8b | 8.19B | no disponible (base Qwen3 32K) | Apache-2.0 | Gated, solo safetensors |
| Qwen3-8B | 8.19B | 32K | Apache-2.0 | Público, múltiples formatos |
| CodeLlama-7B | 7B | 16K | Llama 2 Community | Público, GGUF/safetensors |
| SQLCoder-7B | 7B | 16K | CC-BY-SA | Público, GGUF/safetensors |

La principal diferencia es la especialización en T-SQL para ERP de distribución, mientras que las alternativas son genéricas en generación de código o SQL. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, requiere solicitar permiso y aceptar las condiciones en Hugging Face, lo que limita su uso inmediato.
- Idioma limitado: solo está entrenado para inglés, por lo que no generará correctamente consultas en español u otros idiomas.
- Especialización estrecha: está optimizado para esquemas de ERP de distribución (Prophet 21, Epicor Kinetic) y puede fallar en otros dominios o esquemas de bases de datos.
- Riesgo de alucinación en esquemas desconocidos: aunque es execution-grounded, puede generar consultas con nombres de tablas o columnas inventados si el esquema no está en el dataset de entrenamiento.
- Sin cuantizaciones oficiales: no se publican GGUF o AWQ, lo que obliga a convertir los pesos o usar fp16, limitando el despliegue en hardware de bajos recursos.
- Sin benchmarks públicos: no hay evidencia de rendimiento frente a otros modelos text-to-SQL, lo que dificulta evaluar su calidad real.
- Sin actualizaciones conocidas: el modelo fue creado en agosto de 2026 y no hay evidencia de mantenimiento o versiones posteriores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Lumina-ERP/lumina-tsql-8b
- Sitio web de Lumina ERP: https://lumina-erp.com/
- Proyecto Lumina ERP en GitHub: https://github.com/luminaerp360/luminaerp

No se ha publicado paper técnico ni documentación adicional específica del modelo.

# ravinarayanan/recordsense-lfm3-1.7b-soql-q4f16

## Resumen

RecordSense LFM3 1.7B SOQL es un ajuste fino del modelo LiquidAI/LFM3-1.7B orientado a una única tarea: traducir peticiones en lenguaje natural a consultas SOQL (Salesforce Object Query Language) de solo lectura. Lo desarrolla el usuario ravinarayanan y constituye el motor del complemento de Chrome "RecordSense for Salesforce", que ejecuta la inferencia íntegramente en el navegador mediante Transformers.js y WebGPU. El modelo no se distribuye como pesos en formato nativo, sino como un export ONNX cuantizado en precisión mixta (q4f16) de 1,56 GB, pensado para su carga directa en el cliente.

El modelo parte de la arquitectura LFM3 de Liquid AI (1.700 millones de parámetros) y se ha adaptado mediante un LoRA de rango 16 posteriormente fusionado con los pesos base. El ajuste se ha realizado sobre aproximadamente 14.700 ejemplos generados a partir de un registro de esquemas y validados contra él, cubriendo filtros, literales de fecha, agregados, GROUP BY/HAVING, relaciones padre-hijo, semi-joins y anti-joins, campos polimórficos y objetos estándar y personalizados con espacios de nombres.

Su relevancia radica en el despliegue local en el navegador: elimina la necesidad de enviar metadatos del esquema de Salesforce a un servidor externo y permite generar consultas con una latencia propia de un modelo de 1,7B cuantizado a 4 bits. La contrapartida es un alcance muy restringido: no es un modelo de propósito general, sino un generador de SOQL con un protocolo de entrada y salida estrictamente definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM3 de Liquid AI), ajuste fino LoRA r=16 fusionado |
| Parametros totales | 1.700 millones (modelo base LFM3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta: int4 (block size 32) en la mayoría de proyecciones, int8 en la LM head y 27 proyecciones sensibles, fp16 en los embeddings |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license (etiquetada como "other" en Hugging Face) |
| Formato de pesos | ONNX (export q4f16 para Transformers.js) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de LiquidAI/LFM3-1.7B y se especializa mediante un ajuste fino con LoRA de rango 16 que después se fusiona con los pesos base, de modo que la inferencia no requiere adaptadores separados. El corpus de entrenamiento consta de unos 14.700 ejemplos sintéticos generados a partir de un registro de esquemas y validados contra ese mismo registro, lo que reduce el riesgo de consultas sintácticamente válidas pero semánticamente incorrectas. La cobertura incluye filtros, literales de fecha, funciones de agregación, cláusulas GROUP BY y HAVING, relaciones padre-hijo, semi-joins y anti-joins, campos polimórficos, objetos estándar y personalizados (incluidos espacios de nombres) y trazas de uso de herramientas.

La innovación técnica principal no está en el entrenamiento sino en el empaquetado: el export ONNX aplica cuantización de precisión mixta, manteniendo en int8 la LM head y las 27 proyecciones consideradas más sensibles, y en fp16 los embeddings, mientras el resto de proyecciones se cuantizan a int4 con tamaño de bloque 32. El resultado ocupa 1,56 GB y está optimizado para ejecutarse con Transformers.js sobre WebGPU. El protocolo de inferencia exige enviar `system_prompt.txt` de forma literal como mensaje de sistema, el turno de usuario como JSON con `execution_context`, `request` y, opcionalmente, `metadata` y `tool_history`, renderizar la plantilla de chat con `enable_thinking=false` y decodificar de forma voraz. La respuesta es un único sobre con uno de cuatro tipos: `soql`, `answer`, `clarification` o `tool_call` (con las herramientas `describe_object` y `find_objects`).

## Capacidades

- Traducción de lenguaje natural a SOQL de solo lectura sobre objetos estándar y personalizados de Salesforce.
- Generación de filtros, literales de fecha, agregados, GROUP BY/HAVING, relaciones padre-hijo, semi-joins y anti-joins y campos polimórficos.
- Emisión de respuestas estructuradas en un sobre tipado (`soql`, `answer`, `clarification`, `tool_call`).
- Soporte de tool calling restringido a dos herramientas de introspección de esquema: `describe_object` y `find_objects`.
- Capacidad de solicitar aclaración cuando la petición es ambigua, en lugar de generar una consulta potencialmente incorrecta.
- Ejecución local en el navegador mediante Transformers.js y WebGPU, sin backend de inferencia.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni razonamiento general; el ajuste está orientado exclusivamente a la tarea SOQL.

## Casos de uso

- Asistente de consultas dentro de Salesforce: el modelo traduce peticiones como "oportunidades que se cierran este mes" a SOQL ejecutable, lo que permite a usuarios de negocio construir informes sin conocer el lenguaje de consulta.
- Extensión de navegador con privacidad por diseño: al ejecutarse íntegramente en el cliente con Transformers.js y WebGPU, los metadatos del esquema y las peticiones del usuario no salen del navegador, lo que facilita el cumplimiento en entornos con requisitos estrictos de residencia de datos.
- Generación de consultas para pipelines de integración: el sobre `soql` puede consumirse programáticamente para construir extracciones REST API v68.0 en procesos ETL, siempre bajo permisos de solo lectura.
- Introspección guiada de esquemas: mediante `tool_call` con `describe_object` y `find_objects`, el modelo puede resolver nombres de objetos y campos personalizados o con espacios de nombres antes de emitir la consulta final.
- Formación y onboarding de administradores: el modelo actúa como generador de ejemplos de SOQL a partir de descripciones en inglés, útil para enseñar la sintaxis de relaciones y agregados.
- Prototipado rápido de asistentes verticales: el patrón (modelo de 1,7B ajustado con LoRA, exportado a ONNX q4f16 y servido con Transformers.js) sirve como plantilla para otros dominios con lenguajes de consulta estructurados.
- Validación previa a la ejecución: el tipo `clarification` permite insertar una capa de confirmación en la interfaz antes de lanzar consultas sobre datos de producción.

## Benchmarks y rendimiento

| Evaluación | Modelo sin cuantizar | Export q4f16 |
|---|---|---|
| Puerta de regresión (130 prompts) | 90,8 % superados (modelo fusionado) | no disponible |
| Puerta de tarea (44 prompts) | 95,5 % | 93,2 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas disponibles son las puertas de evaluación internas del autor, que miden la corrección de las consultas SOQL generadas y no capacidades generales del modelo.

## Requisitos de hardware

- VRAM estimada: el export pesa 1,56 GB, por lo que la inferencia requiere del orden de 2 GB de memoria disponible en el dispositivo; el consumo exacto en WebGPU no está documentado.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable en el navegador (Chrome y derivados). No se especifican modelos concretos en la información disponible.
- Compatibilidad con GPU de consumo: sí, por tamaño; un modelo de 1,7B en int4 cabe holgadamente en GPU integradas y dedicadas de gama media, aunque el rendimiento depende del soporte WebGPU del navegador y del controlador.
- Opciones de despliegue: Transformers.js con WebGPU es el objetivo principal. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el artefacto distribuido es un export ONNX específico para el navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| RecordSense LFM3 1.7B SOQL | 1,7B | no disponible | Generación de SOQL | lfm-open-license | ONNX q4f16 |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | Propósito general | lfm-open-license | safetensors y otros |
| Modelos de 1-3B ajustados para text-to-SQL | no disponible | no disponible | SQL genérico | variable | variable |

La comparación directa con alternativas de text-to-SQL no está disponible en la información proporcionada. El modelo base LFM3-1.7B es el único punto de referencia documentado, y la diferencia medible es la especialización: el ajuste eleva la corrección en la puerta de tarea al 95,5 % en el modelo sin cuantizar, con una pérdida de 2,3 puntos tras la cuantización q4f16.

## Limitaciones y advertencias

- Alcance restringido: el modelo solo genera SOQL de solo lectura y respuestas de aclaración o tool calls; no debe emplearse como modelo conversacional general.
- Protocolo estricto: requiere `system_prompt.txt` literal, entrada JSON con `execution_context` y `request`, `enable_thinking=false` y decodificación voraz. Desviarse del protocolo degrada la calidad de forma no documentada.
- Pérdida por cuantización: el export q4f16 baja del 95,5 % al 93,2 % en la puerta de tarea, por lo que aproximadamente una de cada quince consultas de evaluación no se resuelve correctamente.
- Riesgo de consultas incorrectas: las consultas generadas son sugerencias; deben ejecutarse bajo los permisos del propio usuario de Salesforce y limitarse a sentencias de solo lectura.
- Sesgos: no se documentan sesgos específicos, pero el entrenamiento con datos sintéticos derivados de un registro de esquemas puede no cubrir configuraciones de org atípicas.
- Idiomas: no se especifican los idiomas soportados; los ejemplos de la model card están en inglés.
- Licencia: la lfm-open-license impone condiciones propias que deben revisarse antes de un uso comercial; la model card la etiqueta como "other".
- Madurez: el repositorio registra cero descargas y cero likes en el momento de la consulta, sin comunidad ni validación externa documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ravinarayanan/recordsense-lfm3-1.7b-soql-q4f16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Transformers.js: https://github.com/huggingface/transformers.js
- Documentación de SOQL (Salesforce): https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/
- WebGPU: https://developer.mozilla.org/es/docs/Web/API/WebGPU_API

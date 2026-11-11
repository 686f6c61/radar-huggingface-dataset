# ravinarayanan/lfm3-1.7b-salesforce-soql-onnx-q4f16

## Resumen

RecordSense LFM3 1.7B Salesforce SOQL es un modelo derivado de LiquidAI/LFM3-1.7B, ajustado mediante LoRA (r=16, fusionado) por el usuario ravinarayanan para una tarea muy concreta: traducir peticiones en lenguaje natural a consultas SOQL de solo lectura sobre Salesforce. El modelo se distribuye en formato ONNX cuantizado en precisión mixta (mayoritariamente int4 con bloque de 32, capas sensibles en int8 y embeddings en fp16), con un tamano total de 1,56 GB, y esta pensado para ejecutarse integramente en el navegador mediante Transformers.js y WebGPU, sin backend. Es la pieza central de la extension de Chrome RecordSense for Salesforce.

La relevancia de este modelo es practica: demuestra un patron de despliegue de LLM en el cliente (edge) para una funcion de producto acotada, con un protocolo de entrada/salida estricto y una puerta de regresion medible. No es un modelo generalista: su valor esta en el ajuste fino sobre un esquema de Salesforce y en la cuantizacion agresiva que permite cargarlo en el navegador manteniendo una tasa de acierto alta en la tarea objetivo (93,2% en la puerta de tarea de 44 prompts, frente al 95,5% del modelo sin cuantizar).

El modelo base LFM3-1.7B es un transformer de 1.700 millones de parametros de Liquid AI. La ficha cubre exclusivamente la variante SOQL publicada por ravinarayanan; los datos sobre el modelo base que no aparecen en la informacion proporcionada se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B); export ONNX para Transformers.js |
| Parametros totales | 1,7 mil millones (modelo base LFM3-1.7B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta: int4 (bloque 32) en la mayoria de proyecciones, int8 en LM head y 27 proyecciones sensibles, fp16 en embeddings; export q4f16 en ONNX |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license (etiquetada como "other" en Hugging Face) |
| Formato de pesos | ONNX (q4f16), para Transformers.js; tamano del repo 3,1 GB, pesos cuantizados 1,56 GB |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer de 1,7 mil millones de parametros, y se ajusta con LoRA de rango 16 que posteriormente se fusiona con los pesos base. El ajuste se orienta a una unica tarea: la generacion de SOQL de solo lectura a partir de peticiones en ingles natural, con un protocolo de mensajes fijo (system prompt literal, turno de usuario en JSON con `execution_context`, `request`, `metadata` opcional y `tool_history` opcional, plantilla de chat con `enable_thinking=false` y decodificacion greedy).

Los datos de entrenamiento son aproximadamente 14.700 ejemplos generados a partir de un registro de esquema (schema registry) y validados contra el mismo. Cubren filtros, literales de fecha, agregados y clausulas GROUP BY/HAVING, relaciones padre-hijo, semi-joins y anti-joins, campos polimorficos, objetos estandar y personalizados (incluidos namespaces) y trazas de uso de herramientas. La cuantizacion es de precision mixta: la mayoria de proyecciones en int4 con bloque de 32, el LM head y las 27 proyecciones mas sensibles en int8, y los embeddings en fp16. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion de su dataset ni si hubo RLHF o DPO en su alineamiento.

## Capacidades

- Generacion de consultas SOQL de solo lectura a partir de lenguaje natural en ingles.
- Manejo de filtros, literales de fecha, agregados, GROUP BY/HAVING, relaciones padre-hijo, semi-joins y anti-joins, y campos polimorficos.
- Soporte de objetos estandar y personalizados de Salesforce, incluidos namespaces.
- Emision de un unico sobre de respuesta con uno de cuatro tipos: `soql`, `answer`, `clarification` o `tool_call`.
- Tool calling limitado a dos herramientas: `describe_object` y `find_objects`, con trazas de historial de herramientas (`tool_history`).
- Peticion de aclaracion cuando la consulta es ambigua (tipo `clarification`).
- Ejecucion en navegador con Transformers.js y WebGPU, sin servidor.
- Modo de pensamiento desactivado por protocolo (`enable_thinking=false`).
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistente de consultas en Salesforce dentro del navegador: el usuario escribe "oportunidades que se cierran este mes" y el modelo devuelve la SOQL equivalente, ejecutada bajo los permisos del propio usuario. Adecuado porque el modelo esta ajustado sobre el esquema y corre en el cliente, sin enviar datos a un backend.
- Generacion de SOQL para equipos de ventas y operaciones: permite a usuarios no tecnicos construir consultas con relaciones padre-hijo y agregados sin conocer la sintaxis SOQL.
- Exploracion de esquema mediante tool calling: ante una peticion sobre un objeto desconocido, el modelo emite un `tool_call` a `describe_object` o `find_objects` para resolver el esquema antes de generar la consulta.
- Prototipado de extensiones de Chrome con LLM local: sirve como referencia de despliegue ONNX q4f16 con Transformers.js y WebGPU para funciones acotadas.
- Generacion de informes agregados: consultas con GROUP BY/HAVING y funciones de agregado para paneles internos de solo lectura.
- Aclaracion de peticiones ambiguas: el sobre `clarification` permite construir flujos conversacionales multi-turno que piden precision antes de ejecutar una consulta.
- Validacion y formacion interna: usar el modelo para comparar la SOQL generada con la escrita a mano por administradores de Salesforce.

## Benchmarks y rendimiento

| Evaluacion | Modelo sin cuantizar | Export q4f16 | Prompts |
|---|---|---|---|
| Puerta de regresion (merged) | 90,8% (pasa) | no disponible | 130 |
| Puerta de tarea | 95,5% | 93,2% | 44 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Pesos cuantizados: 1,56 GB en disco (repo completo de 3,1 GB).
- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de los pesos, el modelo cabe en GPUs de consumo con 4 GB o mas de memoria disponible para el navegador.
- GPU recomendadas: cualquier GPU con soporte WebGPU en Chrome; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, al ser un modelo de 1,7B en int4/fp16 mixto.
- Opciones de despliegue: Transformers.js con WebGPU (objetivo principal); otros runners ONNX no se documentan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| RecordSense LFM3 1.7B SOQL (este) | 1,7B | no disponible | SOQL de solo lectura en navegador | lfm-open-license | ONNX q4f16 |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | Generacion de texto general | lfm-open-license | safetensors y otros |
| Otros ajustes SOQL de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado: fuera de la generacion de SOQL y del protocolo definido, su calidad como modelo generalista no esta evaluada.
- Las consultas generadas son sugerencias; deben ejecutarse bajo los permisos del usuario y limitarse a sentencias de solo lectura.
- El protocolo exige enviar `system_prompt.txt` literal, el turno de usuario en JSON, `enable_thinking=false` y decodificacion greedy; desviarse de el puede degradar la salida.
- La cuantizacion q4f16 reduce la precision en la puerta de tarea del 95,5% al 93,2%, una perdida de 2,3 puntos porcentuales.
- Riesgo de alucinacion en nombres de campos u objetos no presentes en el esquema de entrenamiento; el uso de `describe_object` y `find_objects` mitiga parcialmente este riesgo.
- Idiomas soportados no disponibles; los ejemplos de entrenamiento estan en ingles.
- Licencia lfm-open-license: revisar las condiciones de uso comercial antes de desplegar en produccion.
- El modelo base es de noviembre de 2026 segun los metadatos del repo; verificar la vigencia de la version de la API de Salesforce (`REST API v68.0` en el ejemplo de protocolo).
- Solo 26 descargas y 0 likes en el momento de la consulta: ecosistema de validacion limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ravinarayanan/lfm3-1.7b-salesforce-soql-onnx-q4f16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Transformers.js: https://github.com/huggingface/transformers.js
- WebGPU: https://developer.chrome.com/docs/web-platform/webgpu
- Documentacion de SOQL de Salesforce: https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/

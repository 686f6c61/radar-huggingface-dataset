# pooria/foxmind

## Resumen

foxmind es un modelo de decisión on-device pensado para ejecutarse dentro de FoxPilot, un agente de navegador para Firefox desarrollado por pooriaarab. No es un modelo de lenguaje generativo: es la exportación a ONNX del grafo de agente de GLiNER2 multi-v1 (modelo base de Fastino, `fastino/gliner2-multi-v1`), una arquitectura DeBERTa-v2 orientada a token-classification y extracción de spans para tareas de información estructurada.

La diferencia técnica frente a la exportación de referencia (`onnx-community/gliner2-multi-v1-agent-ONNX`) es que todas las entradas y salidas incorporan un eje de batch, lo que permite procesar varias llamadas del agente en una sola pasada por WebGPU. Su relevancia radica en que habilita inferencia local en el navegador sin servidor, con un grafo único listo para transformers.js y con validación de paridad numérica frente a la librería Python.

El repositorio ocupa 1,9 GB e incluye los pesos en fp32 (`onnx/model.onnx` + `model.onnx_data`) y en fp16 (`onnx/model_fp16.onnx` + `model_fp16.onnx_data`). La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DeBERTa-v2 (GLiNER2 multi-v1), grafo de agente exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 y fp16 (ficheros ONNX separados); no se documentan cuantizaciones de 8 o 4 bits |
| Idiomas soportados | no disponible (el modelo base `gliner2-multi-v1` es multilingue, pero la model card no detalla la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx_data` en fp32; `model_fp16.onnx` + `model_fp16.onnx_data` en fp16) |
| Pipeline | token-classification |
| Libreria declarada | transformers.js |
| Tamano del repositorio | 1,9 GB |
| Descargas / likes | 102 / 0 |
| Fecha de creacion | 2026-10-09 |
| Ultima actualizacion | 2026-10-09 |

Formas de entrada y salida documentadas:

| Entrada / salida | Forma |
|---|---|
| `input_ids`, `attention_mask` | `[batch, seq]` |
| `word_positions` | `[batch, words]` |
| `schema_positions` | `[batch, schema]` |
| `cls_logits` | `[batch, schema - 1]` |
| `count_logits` | `[batch, 20]` |
| `span_logits` | `[batch, schema - 1, words, 8]` |

## Arquitectura y entrenamiento

El modelo no aporta entrenamiento propio: es una exportación determinista del grafo de agente de GLiNER2 multi-v1, un modelo de la familia GLiNER construido sobre un encoder DeBERTa-v2 y especializado en reconocimiento de entidades y extracción de información guiada por esquema (schema). La innovación del artefacto es de empaquetado e inferencia, no de pesos: se ha convertido el grafo completo del agente a ONNX añadiendo un eje de batch a cada tensor de entrada y salida, manteniendo una única unidad de cómputo en lugar de encadenar llamadas independientes.

El proceso de exportación se valida con el script `export/verify_onnx.py` del repositorio foxpilot. Según la model card, en fp32 las 14 llamadas de referencia coinciden con la librería Python y cada fila de un batch con padding reproduce su llamada individual con una tolerancia de 8,0e-6 en las puntuaciones de etiqueta y de span. Para el batching correcto hay que rellenar las filas más cortas con 0 y poner su máscara a 0. No se documentan en la información disponible detalles sobre el dataset de entrenamiento, número de tokens ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Clasificación de tokens y extracción de spans guiada por un esquema de etiquetas (formato `word_positions` y `schema_positions`).
- Decisión on-device para un agente de navegador: el grafo produce `cls_logits`, `count_logits` y `span_logits` para seleccionar etiquetas y rangos sobre el texto.
- Procesamiento en lote: admite múltiples prompts o consultas en una sola pasada gracias al eje de batch, con padding y máscaras.
- Ejecución local en navegador mediante transformers.js y WebGPU, sin backend remoto.
- Soporte multilingüe heredado del modelo base `gliner2-multi-v1` (la model card de foxmind no desglosa los idiomas concretos).
- No es un modelo generativo: no produce texto libre, no razona en cadena de pensamiento y no implementa tool calling ni function calling en sentido estricto.
- No dispone de capacidades de visión ni de audio.

## Casos de uso

- Agente de navegador en local: extraer entidades y campos estructurados de la página activa en Firefox y alimentar las decisiones del agente FoxPilot sin enviar el contenido a un servidor.
- Extracción de información en formularios: identificar nombres, fechas, importes o direcciones en texto de una web para autorrellenar campos, usando el esquema de etiquetas como guía.
- Resaltado y anotación de entidades en extensiones web: procesar el texto visible y devolver spans etiquetados para su resaltado en la interfaz.
- Procesamiento por lotes de prompts en el cliente: agrupar hasta varias consultas de extracción en una sola llamada a WebGPU, aprovechando el eje de batch para reducir el número de invocaciones.
- Automatización de tareas repetitivas sobre listados: recorrer tablas o listados de una página y extraer columnas relevantes de forma consistente por esquema.
- Clasificación de contenido en el navegador: etiquetar fragmentos de una página según una taxonomía definida por el desarrollador de la extensión.
- Preprocesado local para pipelines de privacidad: usar el modelo como paso de anonimización o etiquetado antes de enviar datos a otro sistema.
- Prototipado rápido en transformers.js: integrar un extractor de entidades en una demo web sin desplegar infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card únicamente aporta una medición de latencia y verificación de paridad numérica:

| Prueba | Configuracion | Resultado |
|---|---|---|
| Verificacion de paridad fp32 | 14 llamadas de referencia frente a la libreria Python | Coincidencia exacta |
| Verificacion de paridad fp32 | Cada fila de batch con padding frente a su llamada individual | Diferencia <= 8,0e-6 en label y span scores |
| Latencia (Firefox 157, WebGPU, fp32) | 4 prompts en una llamada | 517 ms |
| Latencia (Firefox 157, WebGPU, fp32) | 4 llamadas individuales | 1.242 ms |
| Aceleracion relativa | Batch frente a llamadas sueltas | 2,4x |

## Requisitos de hardware

- El artefacto se distribuye en dos variantes: fp32 y fp16. El repositorio completo ocupa 1,9 GB, repartido entre ambos formatos.
- Ejecución objetivo en el propio navegador mediante WebGPU; el rendimiento medido corresponde a Firefox 157 con la variante fp32.
- VRAM exacta de inferencia: no disponible (no se documentan los parámetros totales del modelo).
- GPU de escritorio recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible como dato explícito, si bien el diseño on-device y la variante fp16 apuntan a hardware de gama de cliente.
- Opciones de despliegue: transformers.js en navegador (vía WebGPU); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 517 ms para 4 prompts en una única llamada en fp32 sobre WebGPU (Firefox 157). Throughput en tokens por segundo: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Eje de batch | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pooria/foxmind | Exportacion ONNX del grafo de agente de GLiNER2 multi-v1 | Si | ONNX fp32 y fp16 | Apache-2.0 | HuggingFace, 102 descargas |
| onnx-community/gliner2-multi-v1-agent-ONNX | Exportacion ONNX del grafo de agente de GLiNER2 multi-v1 | No (misma exportacion sin eje de batch) | ONNX | no disponible | HuggingFace |
| fastino/gliner2-multi-v1 | Modelo base original (GLiNER2 multilingue) | No aplica | Pesos originales (no ONNX) | Apache-2.0 | HuggingFace |

Comparativa de parámetros, contexto y benchmarks frente a alternativas: no disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no mantiene conversaciones y no debe evaluarse con benchmarks de generación o razonamiento.
- La información disponible no detalla sesgos conocidos ni el dataset de entrenamiento; el comportamiento ético depende en última instancia del modelo base GLiNER2 multi-v1.
- Riesgo de error en la extracción de spans: el propio exportador solo garantiza paridad numérica frente a la librería Python, no exactitud semántica sobre casos reales.
- Manejo obligatorio del padding: rellenar con 0 las filas cortas y poner su máscara a 0; de lo contrario, los resultados del lote pueden ser incorrectos.
- Idiomas soportados no documentados en esta ficha; conviene verificar el comportamiento multilingüe directamente sobre el modelo base.
- Contexto máximo no especificado, lo que limita el dimensionado previo de cargas en producción.
- Uso comercial permitido bajo Apache-2.0, la misma licencia del modelo base; los scripts de exportación del repositorio foxpilot se distribuyen bajo MIT.
- Al ser un artefacto de empaquetado, cualquier mejora futura de pesos o del modelo base no se reflejará automáticamente en esta exportación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pooria/foxmind
- Modelo base: https://huggingface.co/fastino/gliner2-multi-v1
- Exportacion de referencia sin batch: https://huggingface.co/onnx-community/gliner2-multi-v1-agent-ONNX
- Repositorio FoxPilot (scripts de exportacion, MIT): https://github.com/pooriaarab/foxpilot
- Sitio de Fastino: https://fastino.ai

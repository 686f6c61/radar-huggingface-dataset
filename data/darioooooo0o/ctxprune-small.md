# darioooooo0o/ctxprune-small

## Resumen

ctxprune-small es un clasificador de tokens de 140 millones de parámetros desarrollado por el usuario independiente darioooooo0o (conocido como @imdariotoo) que comprime contexto para agentes de IA. Su función es reducir el texto antes de que llegue a un LLM grande, eliminando las palabras menos relevantes mediante un etiquetado token a token (label 1 = conservar, misma convención que LLMLingua-2). Está pensado específicamente para el tipo de texto que consumen los agentes: salidas de herramientas (JSON, logs, stack traces, diffs, listados de directorios), código, documentos y chat en múltiples idiomas.

El modelo se construye sobre jhu-clsp/mmBERT-small, un transformer encoder multilingüe de tipo ModernBERT, y se distribuye con pesos safetensors y ONNX (fp32 e int8). Su innovación principal frente a LLMLingua-2 es que reconstruye el texto a partir de spans completos del original, de modo que identificadores, rutas, URLs, IPs y versiones nunca se fragmentan ni se reespacian; además ofrece un modo `protect` que garantiza que no se elimine ningún identificador.

Es relevante porque la compresión de contexto se ha convertido en un cuello de botella práctico en pipelines de agentes: reducir a la mitad los tokens de una salida de herramienta abarata la inferencia y permite encajar más historial en la ventana del lector. El modelo es pequeño (~102 ms por fragmento de 500 tokens en CPU con ONNX fp32), se ejecuta sin PyTorch, tiene licencia Apache-2.0 y fue entrenado solo con datos de licencia permisiva, a diferencia de las etiquetas de entrenamiento de LLMLingua-2 (CC BY-NC-SA).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT), token classification |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX fp32, ONNX int8 (143 MB) |
| Idiomas soportados | multilingual, en, de, fr, es, pt, it, nl, pl, ru, zh, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |
| Modelo base | jhu-clsp/mmBERT-small |
| Pipeline | token-classification |
| Tamano del repo | 1,3 GB |
| Descargas | 22 |
| Fecha de creacion | 2026-10-08 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT (concretamente un fine-tuning de jhu-clsp/mmBERT-small) configurado como clasificador de tokens binario: para cada token emite una probabilidad de conservar o eliminar. La inferencia se realiza puntuando cada token con `softmax(logits)[..., 1]`, promediando por palabra y conservando las palabras con mayor puntuación hasta alcanzar la tasa de retención objetivo (`keep`). El texto final se reconstruye desde spans completos del texto fuente, lo que evita la fragmentación de identificadores que caracteriza a otros compresores.

El entrenamiento se realizó sobre un conjunto de datasets de licencia permisiva: SWE-bench/SWE-smith-trajectories, nebius/SWE-rebench-openhands-trajectories, Agent-Ark/Toucan-1.5M, codeparrot/github-code-clean, HuggingFaceFW/fineweb-edu, HuggingFaceFW/fineweb-2 y OpenAssistant/oasst2. Las etiquetas de entrenamiento fueron generadas por Qwen3.8-27B según la model card. El objetivo declarado es cubrir lo que los agentes realmente leen (salidas de herramientas, código, documentos y chat) en lugar de prosa web genérica. La model card no detalla el número exacto de tokens de entrenamiento ni si hubo fases de RLHF o DPO; al ser un clasificador de tokens, el ajuste se realiza mediante supervisión directa sobre etiquetas de conservación.

## Capacidades

- Compresión de contexto mediante eliminación de tokens: reduce el texto a una fracción configurable (`keep=0.5`, `keep=0.33`, etc.) antes de enviarlo a un LLM lector.
- Preservación de identificadores: reconstrucción por spans completos; con `force_protected=True` / `protect=True` garantiza que no se elimine ningún ID, ruta, URL, IP, versión o número.
- Procesamiento de salidas de herramientas: JSON, logs, stack traces, diffs y listados de directorios.
- Compresión de código fuente y de documentos.
- Compresión de conversaciones de chat (entrenado con OpenAssistant/oasst2).
- Soporte multilingüe en 12 idiomas (en, de, fr, es, pt, it, nl, pl, ru, zh, ja y categoría multilingual).
- Compatibilidad con LLMLingua como drop-in (`PromptCompressor` con `use_llmlingua2=True`), requiriendo el parche de detección de tokenizer propuesto en microsoft/LLMLingua#261.
- Ejecución en navegador mediante transformers.js.
- Integraciones con LangChain (`CtxpruneDocumentCompressor`) y LlamaIndex (`CtxpruneNodePostprocessor`).
- Servicio HTTP local (`ctxprune serve`, `POST localhost:8719/compress`) para uso desde otros lenguajes.
- Hooks sin modelo para agentes de código (Claude Code, Codex, Hermes, Pi, OpenCode, dsh) mediante `ctxprune install --all`.
- No es un modelo generativo: no produce texto nuevo, solo decide qué tokens conservar.

## Casos de uso

- Compresión de salidas de herramientas en agentes de código: antes de inyectar el resultado de un `pytest`, un `git diff` o un listado de directorios en el contexto del LLM, ctxprune-small lo reduce al 50% conservando IDs, rutas y números de línea, lo que abarata cada turno del agente y libera ventana de contexto.
- Reducción de logs y stack traces en pipelines de depuración automática: el modelo elimina líneas y palabras irrelevantes de un log largo y mantiene intactos los identificadores de error, de modo que el LLM lector puede localizar la causa raíz con menos tokens de entrada.
- Preprocesado en sistemas RAG: comprimir los documentos recuperados antes de pasarlos al generador reduce el coste por consulta y permite incluir más fragmentos en la ventana del modelo, con integración directa vía `CtxpruneDocumentCompressor` en LangChain o `CtxpruneNodePostprocessor` en LlamaIndex.
- Atención al cliente automatizada: comprimir el historial de conversación multi-turno y la documentación de soporte antes de enviarlos al LLM, manteniendo números de pedido y referencias intactos gracias al modo `protect`.
- Agentes que consumen respuestas de APIs y MCP servers: el modelo está entrenado específicamente con trayectorias de agentes (SWE-smith, SWE-rebench, Toucan-1.5M), por lo que comprime JSON de respuestas de herramientas conservando claves y valores identificativos.
- Compresión en el navegador: la demo con transformers.js permite comprimir texto localmente sin subir datos a ningún servidor, útil para aplicaciones web con requisitos de privacidad.
- Servicio centralizado de compresión: desplegar `ctxprune serve` y llamarlo por HTTP desde cualquier lenguaje o servicio, actuando como proxy de compresión previo a las llamadas al LLM.
- Reducción de costes en pipelines de CI/CD: integrar la compresión en scripts de shell (`ctxprune build.log --keep 0.5`) para recortar la salida de builds antes de enviarla a un agente de revisión.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre 378 preguntas en 196 fragmentos de repositorios, servidores MCP y sitios no vistos en entrenamiento. Cada método comprime al mismo porcentaje de tokens del lector y un LLM lector responde desde el texto comprimido, puntuando por exact match sobre el span dorado.

| Benchmark | ctxprune-small | LLMLingua-2-large | Kompress-v2-base |
|---|---|---|---|
| QA exact match, lector DeepSeek V4 Flash, conjunto de texto de agente | 68,8% | 53,4% | no disponible |
| QA exact match, lector Qwen3.8-27B, SQuAD v2 + HotpotQA al 50% retenido | 51,5% | no disponible | 36,5% |
| QA exact match, lector Qwen3.8-27B, SQuAD v2 + HotpotQA al 33% retenido | +21 puntos vs LLMLingua-2-large | referencia | no disponible |
| Supervivencia de identificadores al 50% retenido (30 salidas de herramientas) | 99,6% con `protect`, 45,8% sin `protect` | 94,6% (large), 72,9% (base) | no disponible |
| QA accuracy al 50% retenido, ONNX int8 vs fp32 | 68,2 vs 68,8 | no disponible | no disponible |

Notas de rendimiento: ~102 ms por fragmento de 500 tokens en CPU con ONNX fp32, ~93 ms con int8, frente a ~600 ms de LLMLingua-2-large. La coincidencia de decisiones de conservación entre int8 y fp32 es del ~96% de los tokens. La model card indica que en prosa web multilingüe LLMLingua-2-large sigue siendo superior; la ventaja de ctxprune-small se concentra en salidas de herramientas, texto de agente y código.

## Requisitos de hardware

- VRAM estimada: el modelo es de 140M parámetros; en fp32 ocupa aproximadamente 0,56 GB y en int8 unos 0,14 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU con ONNX. Para lotes grandes o baja latencia, cualquier GPU moderna (RTX 3060 en adelante, A100, H100) acelera el proceso, aunque el cuello de botella típico será el LLM lector, no el compresor.
- Cabe en consumer GPU: sí, en todas las GPU con al menos ~1 GB de memoria libre; también en CPU sin problemas.
- Opciones de despliegue: ONNX Runtime (backend por defecto, sin PyTorch), PyTorch (`ctxprune[torch]`), transformers, transformers.js en navegador, servicio HTTP con `ctxprune serve`, integraciones LangChain/LlamaIndex y hooks para agentes de código.
- Latencia y throughput: ~102 ms por fragmento de 500 tokens en CPU (ONNX fp32) y ~93 ms en int8; LLMLingua-2-large tarda ~600 ms en la misma tarea. El paquete descarga 143 MB la primera vez.
- No se han publicado datos de throughput en GPU en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ctxprune-small | 140M | no disponible | Token classification, reconstrucción por spans, modo protect | Apache-2.0 | Hugging Face, ONNX, pip |
| LLMLingua-2-large | no disponible en la información | no disponible | Token classification (XLM-RoBERTa large) | Modelo disponible, etiquetas de entrenamiento CC BY-NC-SA | Hugging Face, librería LLMLingua |
| LLMLingua-2-base | no disponible en la información | no disponible | Token classification | Modelo disponible, etiquetas de entrenamiento CC BY-NC-SA | Hugging Face, librería LLMLingua |
| Kompress-v2-base (headroom) | no disponible en la información | no disponible | Compresión de contexto | no disponible | Hugging Face |

En QA exact match con lector independiente, ctxprune-small supera a LLMLingua-2-large en 15,4 puntos al 50% de retención (68,8% vs 53,4%) y a Kompress-v2-base en 15 puntos (51,5% vs 36,5%) con lector Qwen3.8-27B. En supervivencia de identificadores con `protect` alcanza el 99,6% frente al 94,6% de LLMLingua-2-large. En cambio, en prosa web multilingüe LLMLingua-2-large obtiene mejores resultados según la propia model card. La licencia Apache-2.0 de ctxprune-small es más permisiva que las etiquetas de entrenamiento de LLMLingua-2.

## Limitaciones y advertencias

- No es un modelo generativo: solo clasifica tokens para conservar o eliminar; no responde preguntas ni produce contenido nuevo.
- Sin `protect=True`, el modelo puede eliminar identificadores: la supervivencia cae al 45,8% en salidas de herramientas al 50% retenido. La model card recomienda activarlo siempre para salidas de herramientas y logs.
- En prosa web multilingüe es inferior a LLMLingua-2-large; su ventaja se limita a salidas de herramientas, texto de agente y código.
- La compresión es destructiva: se pierde información y el LLM lector puede fallar preguntas cuya respuesta dependa de detalles eliminados.
- Las etiquetas de entrenamiento fueron generadas por Qwen3.8-27B, lo que puede introducir sesgos del etiquetador en las decisiones de conservación.
- Riesgo de alucinación del LLM lector: al recibir texto incompleto, el lector puede completar huecos con información inventada; conviene validar en tareas de alta precisión.
- Longitud de contexto del modelo no documentada; la evaluación se realizó sobre fragmentos de 500 tokens, por lo que el comportamiento en fragmentos mucho más largos no está caracterizado en la información disponible.
- La integración con LLMLingua requiere el parche de detección de tokenizer propuesto en microsoft/LLMLingua#261, aún no fusionado según la información disponible.
- El modelo tiene 22 descargas y 0 likes en el momento de la consulta: es un proyecto reciente con poca validación comunitaria.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia de los datasets de entrenamiento para usos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darioooooo0o/ctxprune-small
- Demo en navegador (Space): https://huggingface.co/spaces/darioooooo0o/ctxprune
- Código fuente de la demo: https://huggingface.co/spaces/darioooooo0o/ctxprune/tree/main/js
- Repositorio GitHub: https://github.com/riceharvest/ctxprune
- Documentación de benchmarks de identificadores: https://github.com/riceharvest/ctxprune/blob/main/docs/bench/llmlingua_facts.md
- Pull request de LLMLingua: https://github.com/microsoft/LLMLingua/pull/261
- LLMLingua-2 (modelo comparado): https://huggingface.co/microsoft/llmlingua-2-xlm-roberta-large-meetingbank
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Autor en X: https://x.com/imdariotoo

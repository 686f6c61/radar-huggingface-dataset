# Sohailhosseini/Qwopus3.5-9B-Coder-FP8

## Resumen

Qwopus3.5-9B-Coder-FP8 es una cuantizacion en punto flotante de 8 bits (FP8) del modelo Qwopus3.5-9B-Coder, desarrollada por Sohailhosseini. El modelo base, creado por Jackrong, es un fine-tuning de Qwopus3.5-9B-v3.5 (basado en la arquitectura Qwen3.5) especializado en coding agéntico, tool calling complejo y razonamiento lógico. Esta version FP8 reduce el tamaño de los pesos a la mitad (de 19,3 GB a 11,9 GB) manteniendo una calidad casi sin perdida, y esta pensada para GPUs con compute capability 8.9 o superior (Ada, Hopper o mas nuevas).

El modelo conserva las capacidades del original: generacion de codigo, llamadas a herramientas, razonamiento multi-paso y soporte multimodal (image-text-to-text), con una ventana de contexto de 32 768 tokens. Al estar cuantizado con el formato compressed-tensors, se integra directamente con vLLM para inferencia eficiente. Es una opcion interesante para equipos que necesitan desplegar un asistente de codigo de 9B en hardware moderno sin sacrificar demasiada precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5) |
| Parametros totales | 9 409 813 744 (9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | FP8 (8 bits, compressed-tensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion FP8 del checkpoint original de Jackrong, no un entrenamiento nuevo. La cuantizacion se realizo con la herramienta HF-quantized sobre una A100 SXM, aplicando un esquema de 8 bits a todas las capas lineales excepto `lm_head` y los componentes visuales (`visual`, `vision_tower`, `vision_model`, `multi_modal_projector`, `merger`), que se mantienen en precision completa para preservar la calidad en esas partes criticas. El proceso no requiere datos de calibracion y se describe como "near-lossless".

El modelo base, Qwopus3.5-9B-Coder, es un fine-tuning de Qwopus3.5-9B-v3.5 orientado a tareas de agente de codigo. Segun fuentes secundarias, utiliza una arquitectura transformer densa con Multi-Token Prediction (MTP) y cabezas de draft para aumentar el throughput y la planificacion a largo plazo, aunque esta caracteristica no esta confirmada en la documentacion oficial de esta cuantizacion. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el proceso de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de codigo en multiples lenguajes, con especial enfasis en tareas de programacion agéntica.
- Tool calling y function calling para integracion con APIs y servicios externos.
- Razonamiento logico y multi-paso, util para resolver problemas complejos de ingenieria de software.
- Soporte de agentes autonomos que pueden planificar y ejecutar secuencias de acciones.
- Capacidad multimodal (image-text-to-text) segun el pipeline declarado, aunque no se detallan las tareas visuales concretas.
- Ventana de contexto de 32 768 tokens, suficiente para analizar repositorios de tamano medio o conversaciones largas.
- Inferencia optimizada en FP8 con vLLM, lo que reduce el uso de VRAM y acelera la generacion en hardware compatible.

## Casos de uso

- Asistente de programacion en IDE: el modelo puede sugerir fragmentos de codigo, explicar funciones y refactorizar secciones enteras. Su contexto de 32K permite cargar el contenido de varios archivos abiertos y mantener el hilo de la conversacion.
- Generacion de codigo en pipelines de CI/CD: gracias al soporte de tool calling, puede integrarse en flujos automatizados para generar tests, documentacion o parches a partir de descripciones de issues, y ejecutar comandos de build o lint.
- Agente autonomo de resolucion de incidencias: combinado con un gestor de repositorios, el modelo puede analizar un bug report, localizar el archivo relevante, proponer un fix y generar el commit correspondiente, todo mediante llamadas a herramientas.
- Chatbot de soporte tecnico con acceso a documentacion: al poder llamar a funciones, puede consultar bases de conocimiento o APIs internas para responder preguntas sobre productos o servicios con informacion actualizada.
- Analisis estatico de codigo: el modelo puede revisar un codebase en busca de patrones problematicos, vulnerabilidades comunes o deuda tecnica, y generar un informe con sugerencias concretas.
- Despliegue en entornos con VRAM limitada: al ocupar 11,9 GB en FP8, cabe en GPUs de consumo como la RTX 4070 (12 GB) o la RTX 4080 (16 GB), lo que permite ejecutar un asistente de codigo local sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se proporcionan datos de latencia o throughput especificos para esta cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB para los pesos en FP8 (11,9 GB en disco) mas overhead de activaciones y cache KV. Con contexto completo de 32K, se recomienda al menos 16 GB.
- GPU recomendadas: cualquier GPU con compute capability 8.9 o superior (Ada, Hopper o mas nuevas). Ejemplos: RTX 4070, RTX 4080, RTX 4090, L40S, H100. En GPUs mas antiguas (como A100, compute 8.0) el modelo funcionara pero sin la aceleracion optima de FP8.
- Cabe en GPUs de consumo: si, en RTX 4070 (12 GB) con cuantizacion adicional o contexto reducido, y comodamente en RTX 4080/4090 (16/24 GB).
- Opciones de despliegue: vLLM es el framework recomendado (soporta compressed-tensors nativamente). Tambien puede usarse con otros motores que acepten este formato, aunque no se garantiza compatibilidad.
- Latencia y throughput: no disponibles. Se espera que la cuantizacion FP8 ofrezca un rendimiento superior al del modelo original en hardware compatible, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwopus3.5-9B-Coder-FP8 (este) | 9,4B | 32K | FP8 | Apache-2.0 | safetensors (compressed-tensors) |
| Qwopus3.5-9B-Coder (base) | 9,4B | 32K | Sin cuantizar (BF16) | Apache-2.0 | safetensors |
| Qwopus3.5-9B-Coder-MTP-GGUF | 9B | No disponible | GGUF (varias) | Apache-2.0 | GGUF |

La principal diferencia con el modelo base es el tamano en disco (11,9 GB frente a 19,3 GB) y la velocidad de inferencia en hardware compatible. Frente a la version GGUF MTP, esta version FP8 esta pensada para GPUs modernas con soporte nativo de FP8, mientras que GGUF es mas flexible para CPU y GPUs antiguas. No se dispone de datos de rendimiento comparativo entre ambas.

## Limitaciones y advertencias

- Requiere compute capability 8.9 o superior para ejecutarse con rendimiento optimo. En GPUs mas antiguas, la inferencia puede ser lenta o incluso fallar si el hardware no soporta las instrucciones FP8.
- Es una cuantizacion de 8 bits: aunque se describe como near-lossless, puede haber pequenas degradaciones en tareas muy sensibles a la precision numerica, como matematicas de alta exactitud o generacion de codigo con dependencias largas.
- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones de idioma del modelo base. Se recomienda evaluar el comportamiento en el dominio especifico antes de usarlo en produccion.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero la cuantizacion no cambia los terminos del modelo fuente; es responsabilidad del usuario verificar el cumplimiento de la licencia original.
- El pipeline se declara como image-text-to-text, pero no hay documentacion sobre las capacidades visuales reales. Si se necesita procesamiento de imagenes, conviene validar el comportamiento antes de confiar en el.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sohailhosseini/Qwopus3.5-9B-Coder-FP8
- Modelo base (Jackrong/Qwopus3.5-9B-Coder): https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder
- Pagina del modelo base en ModelScope: https://www.modelscope.cn/models/Jackrong/Qwopus3.5-9B-Coder
- Variante MTP en AIAny: https://aiany.app/item/qwopus3-5-9b-coder-mtp
- Ficha de la variante MTP-GGUF en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwopus3.5-9b-coder-mtp-gguf-jackrong

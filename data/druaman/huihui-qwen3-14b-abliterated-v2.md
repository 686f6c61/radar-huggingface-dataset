# DruAman/Huihui-Qwen3-14B-abliterated-v2

## Resumen

Huihui-Qwen3-14B-abliterated-v2 es una version "abliterated" (sin censura) del modelo Qwen/Qwen3-14B de Alibaba. La model card original acredita su creacion al usuario huihui-ai, mientras que este repositorio concreto lo ha republicado el usuario DruAman. La tecnica aplicada, denominada abliteration, modifica los pesos del modelo base para eliminar la direccion de activacion asociada a los rechazos, de modo que el modelo deja de negarse a responder a ciertas peticiones. Segun la propia ficha, se trata de una implementacion "cruda y de prueba de concepto" realizada con un metodo nuevo y mas rapido que no depende de TransformerLens y que, ademas, corrige los problemas de texto corrupto que presentaba la primera version.

El modelo conserva la arquitectura y el tamano del Qwen3-14B original: un transformer decoder-only denso de 14.768.307.200 parametros (unos 14,77 mil millones), almacenado en safetensors y con un repositorio de 29,5 GB. Mantiene el modo de razonamiento (thinking) del Qwen3 base, que puede activarse o desactivarse, y se distribuye bajo licencia Apache-2.0. No se especifican los idiomas soportados ni la longitud de contexto en la informacion disponible.

Su relevancia es fundamentalmente practica para quienes necesitan un asistente conversacional de 14B sin las restricciones de rechazo del modelo original, por ejemplo en investigacion sobre alineacion, red teaming o generacion de contenido creativo sin filtros. No obstante, al tratarse de un experimento con cero descargas y cero "likes" en el momento de redactar esta ficha, debe considerarse un artefacto poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivado de Qwen/Qwen3-14B) |
| Parametros totales | 14.768.307.200 (14,77 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Compatible con bitsandbytes 4-bit (NF4) segun el ejemplo de uso de la ficha; existen versiones GGUF/Ollama publicadas por huihui-ai |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 29,5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso que hereda la arquitectura del Qwen3-14B. No se ha reentrenado desde cero: la intervencion consiste en una edicion de pesos del modelo base mediante abliteration, una tecnica que localiza y resta la direccion de activacion responsable de los rechazos en las capas intermedias. La ficha indica que esta v2 emplea un metodo nuevo y mas rapido que no requiere TransformerLens, que cambia la capa candidata para eliminar el problema de "texto corrupto" (garbled codes) presente en la version anterior y que ofrece mejores resultados que huihui-ai/Qwen3-14B-abliterated.

Mas alla de este proceso de ablacion, la informacion proporcionada no detalla el numero de tokens, la composicion del dataset de entrenamiento ni si se emplearon tecnicas de RLHF o DPO especificas para esta variante. Cualquier detalle sobre el entrenamiento original corresponde al modelo base Qwen/Qwen3-14B y no forma parte de los datos facilitados para esta ficha.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a chat.
- Modo de razonamiento (thinking) activable y desactivable desde Ollama mediante los comandos `/set think` y `/set nothink`.
- Ausencia intencionada de rechazos: el modelo responde a peticiones que el Qwen3-14B original denegaria.
- Generacion de codigo y matematicas: capacidades presumiblemente heredadas del modelo base, si bien no se confirman explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la ficha no enumera idiomas.
- Capacidades especiales: modo thinking (si), vision/audio (no disponibles, no se mencionan).

## Casos de uso

- Investigacion sobre alineacion y red teaming: permite estudiar de forma controlada como un modelo se comporta cuando se elimina su capa de rechazos, comparando sus respuestas con las del Qwen3-14B original.
- Generacion de contenido creativo sin filtros: util para escritura de ficcion, dialogos o escenarios donde los filtros de seguridad del modelo base interrumpen la generacion.
- Asistente conversacional autoalojado: puede desplegarse localmente para mantener conversaciones multi-turno, ejecutandose en Ollama o con transformers sin depender de APIs externas.
- Experimentacion con cuantizacion: gracias al ejemplo de carga en 4-bit con bitsandbytes, sirve para probar tecnicas de compresion de un modelo de ~14,8B en hardware de gama alta de consumo.
- Evaluacion comparativa de variantes abliterated: al existir una v1 y este v2, permite medir la mejora en coherencia del texto y en la eliminacion de "garbled codes" introducida por el nuevo metodo.
- Base para finetuning posterior: al ser un modelo denso de 14B con licencia Apache-2.0, puede servir como punto de partida para adaptaciones especificas (dominio juridico, medico, etc.) donde se requiera control total del comportamiento.
- Simulacion de escenarios adversarios: util en formacion en ciberseguridad o estudios de seguridad de IA para generar entradas maliciosas de prueba sin la resistencia del modelo censurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 30 GB solo para los pesos (el repositorio ocupa 29,5 GB), mas la memoria adicional para KV cache y activaciones.
- VRAM estimada en 4-bit (bitsandbytes NF4): aproximadamente 8-10 GB de pesos, viable en GPUs con 12-16 GB.
- GPUs recomendadas para precision completa: A100 40/80 GB, H100, o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 de 24 GB).
- GPU de consumo: una RTX 4090 (24 GB) puede alojarlo si se cuantiza a 4-bit o 8-bit; en bfloat16 completo no cabe en una sola GPU de consumo.
- Opciones de despliegue: transformers (con safetensors), Ollama (imagen `huihui_ai/qwen3-abliterated:14b-v2`), vLLM, TGI y llama.cpp/GGUF si se dispone de una conversion cuantizada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Sin censura | Disponibilidad |
|---|---|---|---|---|---|
| DruAman/Huihui-Qwen3-14B-abliterated-v2 | 14,77 B | no disponible | Apache-2.0 | Si | HuggingFace, Ollama |
| Qwen/Qwen3-14B (base) | 14,77 B | no disponible en esta ficha | Apache-2.0 | No | HuggingFace |
| huihui-ai/Qwen3-14B-abliterated (v1) | 14,77 B | no disponible | Apache-2.0 | Si | HuggingFace, Ollama |

La diferencia principal entre las tres variantes es el comportamiento frente a rechazos: el modelo base aplica politicas de seguridad, mientras que las dos versiones abliterated las eliminan. Entre la v1 y la v2, la propia ficha afirma que la v2 usa un metodo mas rapido y corrige el problema de texto corrupto, aunque no se aportan cifras comparativas.

## Limitaciones y advertencias

- Al estar abliterated, el modelo no aplica filtros de rechazo; puede generar contenido danino, ilegal o inseguro sin advertencia.
- La ficha se autodenomina "prueba de concepto cruda", por lo que la calidad general puede degradarse respecto al modelo base.
- La abliteration suele reducir capacidades auxiliares como el seguimiento de instrucciones o la coherencia en tareas largas; no se documenta el impacto real.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en modelos abliterated tiende a aumentar.
- Idiomas soportados: no especificados, lo que complica garantizar un rendimiento adecuado en castellano.
- Longitud de contexto: no declarada en la informacion proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado.
- Modelo con cero descargas y cero "likes": sin validacion de la comunidad ni historial de uso en produccion.
- Se trata de una republicacion por parte de DruAman de un artefacto original de huihui-ai; conviene verificar la fidelidad de los pesos antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DruAman/Huihui-Qwen3-14B-abliterated-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Version anterior (v1): https://huggingface.co/huihui-ai/Qwen3-14B-abliterated
- Pagina de Ollama: https://ollama.com/huihui_ai/qwen3-abliterated:14b-v2
- Repositorio de la tecnica de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo.

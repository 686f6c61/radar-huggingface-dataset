# oktayd/Qwen3.6-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Nuclear-Hermes-Agent-MTP-Vision-llamacpp

## Resumen

Este modelo es una edición cuantizada en GGUF del checkpoint `oktayd/Qwen3.6-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Nuclear-Hermes-Agent-MTP-Vision-FreeToken`, un derivado de Qwen3.6-35B-A3B de Alibaba. Sobre la base original, el autor ha aplicado una cadena de intervenciones de alineación (abliteración, Heretic y OBLITERATUS Nuclear) para reducir los rechazos del modelo, seguidas de un ajuste fino supervisado (SFT) con datos de Hermes para function calling, trazas de razonamiento de agente y codificación agéntica. El resultado es un modelo MoE multimodal de ~35B de parámetros totales y ~3B activos, con encoder de visión preservado y ruta MTP/NextN validada, empaquetado en formato GGUF con cuantización MXFP4_MOE para ejecución local con llama.cpp.

La relevancia de esta edición radica en su combinación de eficiencia (solo 3B de parámetros activos por token), capacidades multimodales (imagen-texto), soporte de herramientas y agente, y un contexto nativo de 262 144 tokens (hasta ~1 010 000 extendido según la arquitectura upstream). Al estar cuantizado en 4 bits y distribuido como GGUF, puede ejecutarse en hardware de consumo, lo que lo hace atractivo para desarrolladores que necesitan un modelo local con razonamiento, visión y tool calling sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido con encoder de vision (familia `qwen3_5_moe` / Qwen3.6) |
| Parametros totales | ~35B (segun model card; los metadatos de safetensors indican 446 571 248, dato inconsistente con el tamano declarado) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262 144 tokens nativo; hasta ~1 010 000 extendido (capacidad upstream, no re-benchmarked en este derivado) |
| Tipos de cuantizacion | MXFP4_MOE (GGUF, 4 bits) |
| Idiomas soportados | Ingles (segun metadatos; el modelo base Qwen3.6 es multilingue, pero este derivado solo declara `en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.6-35B-A3B: un transformer causal con mezcla de expertos (MoE) de 40 capas de texto, hidden size 2048, 256 expertos enrutados de los cuales 8 se activan por token, mas un experto compartido. Incluye un encoder de vision que se preservo intacto durante todo el proceso de modificacion (333 tensores protegidos, 0 desajustes) y una ruta MTP/NextN (multi-token prediction) tambien preservada (19 tensores protegidos, 0 desajustes).

El entrenamiento de este derivado sigue una linea de herencia compleja: parte del checkpoint `lordx64/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled`, que a su vez destila el comportamiento de razonamiento de Claude 4.7 Opus. Sobre ese checkpoint, `huihui-ai` aplico una abliteracion inicial. Este proyecto anadio dos intervenciones adicionales: una etapa Heretic adaptada a la disposicion de expertos MoE fusionados, y una etapa OBLITERATUS Nuclear. Tras las intervenciones de alineacion, se aplico un SFT con datos de Hermes (function calling, trazas de razonamiento de agente) y una mezcla de codificacion agente (terminal, archivos, repositorios, depuracion, flujos multi-herramienta). El ajuste se realizo mediante adaptadores PEFT/LoRA con Unsloth, que luego se fusionaron en el checkpoint final BF16. La cuantizacion a MXFP4_MOE se realizo posteriormente para su distribucion en GGUF.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con comportamiento de razonamiento heredado de la destilacion de Claude 4.7 Opus.
- Function calling / tool use estructurado, gracias al SFT de Hermes Function Calling que entrena el seguimiento de esquemas de herramientas.
- Capacidades de agente: trazas de razonamiento de agente y flujos multi-herramienta (terminal, archivos, repositorios, depuracion).
- Codificacion agente: generacion, depuracion y modificacion de codigo en entornos de desarrollo.
- Vision: el encoder de vision se preservo y valido, permitiendo entrada de imagenes (pipeline `image-text-to-text`).
- MTP/NextN: prediccion multi-token preservada y validada, lo que puede acelerar la decodificacion especulativa.
- Conversacional: soporte de dialogos multi-turno.
- Multilingue limitado: los metadatos declaran solo ingles, aunque el modelo base Qwen3.6 es multilingue.

## Casos de uso

- Asistente de codificacion local: el modelo puede integrarse en editores o IDEs para autocompletar, refactorizar y depurar codigo, aprovechando su SFT de codificacion agente y su capacidad de tool calling para interactuar con el sistema de archivos y terminal.
- Agente autonomo de tareas: gracias a las trazas de razonamiento de agente y el soporte de function calling, puede orquestar multiples herramientas (busqueda web, APIs, ejecucion de comandos) en flujos multi-paso.
- Analisis de imagenes con contexto largo: su encoder de vision y ventana de contexto de 262K tokens permiten procesar documentos escaneados, diagramas o capturas de pantalla junto con instrucciones extensas.
- Prototipado rapido de chatbots con herramientas: al estar cuantizado en 4 bits y ejecutarse con llama.cpp, puede desplegarse en una GPU de consumo para probar flujos de atencion al cliente con acceso a bases de conocimiento o APIs.
- Generacion de documentacion tecnica: su capacidad de razonamiento y generacion de texto permite redactar documentacion, comentarios de codigo y guias a partir de especificaciones o codigo fuente.
- Investigacion en alineacion y seguridad: al ser una version abliterada con multiples intervenciones, es util para estudiar el efecto de la reduccion de rechazos en modelos MoE y comparar comportamientos con la version original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco se proporcionan datos de latencia o throughput para la version cuantizada. Se recomienda validar el rendimiento en el caso de uso concreto antes de desplegar en produccion.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 21.2 GB en formato GGUF MXFP4. Para cargar el modelo completo en GPU se necesitan al menos 22-24 GB de VRAM, incluyendo overhead de contexto y buffers.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, o GPUs profesionales con 24 GB o mas. En GPUs con menos VRAM, se puede usar offloading parcial de capas a CPU con llama.cpp.
- En hardware de consumo: cabe en una RTX 4090 o RTX 3090 con 24 GB. No cabe en GPUs de 16 GB sin offloading significativo.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF y MXFP4_MOE), Ollama (si se importa el GGUF), y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Al ser un MoE con solo 3B de parametros activos, se espera una velocidad de generacion superior a la de un modelo denso de 35B, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (original) | ~35B | ~3B | 262K nativo | Apache-2.0 | safetensors | Modelo base sin intervenciones de alineacion ni SFT de Hermes |
| Qwen3.6-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Nuclear-Hermes-Agent-MTP-Vision (este) | ~35B | ~3B | 262K nativo (upstream) | Apache-2.0 | GGUF MXFP4 | Derivado con abliteracion, SFT de Hermes y cuantizacion 4-bit |
| Qwen3.5-35B-A3B (predecesor) | ~35B | ~3B | no disponible | Apache-2.0 | safetensors | Version anterior de la serie Qwen3.5, sin vision ni MTP |

La comparativa se limita a modelos de la misma familia por falta de datos de otras alternativas. No se dispone de benchmarks para comparar rendimiento real.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo abliterado con intervenciones adicionales (Heretic y OBLITERATUS Nuclear), puede generar contenido que el modelo original rechazaria, incluyendo respuestas no seguras, ofensivas o perjudiciales. No se recomienda su uso en aplicaciones orientadas al publico sin moderacion externa.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, citas o codigo. La reduccion de rechazos puede aumentar la confianza en respuestas incorrectas.
- Limitaciones de contexto: aunque la arquitectura soporta hasta ~1 010 000 tokens extendidos, la model card advierte explicitamente que este derivado no ha sido re-benchmarked en ese limite. La calidad en contextos muy largos requiere validacion por backend.
- Idioma: los metadatos declaran solo ingles. Aunque el modelo base es multilingue, no hay garantia de que las intervenciones y el SFT hayan preservado el rendimiento en otros idiomas.
- Licencia: Apache-2.0 permite uso comercial sin restricciones, pero el linaje incluye destilacion de comportamiento de Claude 4.7 Opus (propietario). La model card aclara que no se reproduce el modelo propietario, solo se hereda el comportamiento de razonamiento a traves de un checkpoint intermedio.
- Sin benchmarks publicados: no hay metricas de rendimiento verificables para este derivado concreto. Los resultados pueden diferir del modelo base.
- Descargas y adopcion: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido probado por la comunidad.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/oktayd/Qwen3.6-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Nuclear-Hermes-Agent-MTP-Vision-llamacpp
- Modelo base (FreeToken): https://huggingface.co/oktayd/Qwen3.6-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Nuclear-Hermes-Agent-MTP-Vision-FreeToken
- Checkpoint upstream abliterado (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated
- Blog oficial de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Articulo de Alibaba Cloud sobre Qwen3.6-35B-A3B: https://www.alibabacloud.com/blog/qwen3-6-35b-a3b-agentic-coding-power-now-open-to-all_603043
- Version GGUF de Unsloth con MTP: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF

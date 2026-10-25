# bluevoid-pl/Muse-Glimmer-30B-pruned-V2.5-en-pl-GGUF

## Resumen

Muse Glimmer 30B es un modelo de lenguaje causal de 30.000 millones de parametros desarrollado por Meta Superintelligence Lab (publicado en agosto de 2026) y destilado a partir de Muse Spark. Su rasgo diferencial es que incorpora un encoder de percepcion dedicado, lo que le permite aceptar entradas intercaladas de texto e imagen, y esta disenado especificamente para tareas agenticas autonomas que se ejecutan en hardware de consumo, sin infraestructura de nube ni acceso a red.

La ficha que nos ocupa no es el modelo original, sino una version GGUF podada (V2.5) publicada por el usuario `bluevoid-pl`. El proceso de poda elimina del tokenizador todos los caracteres que no sean ingleses o polacos, lo que reduce el tamano del artefacto alrededor de un 25% segun el autor y limita los idiomas de salida a `en` y `pl`. Ademas, la poda elimina los emojis, de modo que el modelo es fisicamente incapaz de generarlos aunque su representacion interna siga asumiendolos.

Es relevante ahora porque propone un perfil poco habitual: capacidades agenticas (tool calling, razonamiento multi-paso, recuperacion ante fallos, vision) en un tamano de 30B que, tras la poda, aspira a caber en GPU de consumo. Conviene senalar que el repositorio presenta cero descargas y cero likes en el momento de la consulta, y que el propio autor advierte de que el artefacto puede fallar sin motivo aparente y de que llama.cpp y Ollama solo lo soportan parcialmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con encoder de percepcion dedicado (multimodal texto-imagen) |
| Parametros totales | 30.000 millones (modelo base); tamano del GGUF podado no disponible con exactitud, reduccion declarada de ~25% |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (esta publicacion es la variante podada V2.5 `en-pl`; niveles concretos de cuantizacion no disponibles) |
| Idiomas soportados | Original: mas de 100 idiomas. Esta GGUF podada: ingles (`en`) y polaco (`pl`) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformers declarado como `library_name`, pero el artefacto es GGUF) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal decoder-only de 30B parametros al que se anade un encoder de percepcion especifico para procesar imagenes de forma intercalada con texto. Segun la model card, deriva por destilacion de Muse Spark y esta orientado a completar tareas agenticas de extremo a extremo: escribir y depurar codigo dentro de un scaffold, encadenar razonamiento durante horizontes largos, invocar herramientas con esquemas precisos y diagnosticar errores de tool calls para reintentar en lugar de detenerse. Incorpora ademas un mecanismo de "esfuerzo controlable" que permite seleccionar distintos niveles de razonamiento segun el compromiso calidad/velocidad deseado.

En cuanto a datos de entrenamiento, la informacion disponible solo indica cobertura de mas de 100 idiomas y el enfasis en tareas agenticas; no se detalla el numero de tokens, la composicion del dataset ni si se aplicaron fases de RLHF o DPO (no disponible). La innovacion documentada del artefacto que nos ocupa es el proceso de poda del tokenizador aplicado por `bluevoid-pl`: se conservan unicamente caracteres ingleses y polacos, se eliminan emojis y se reduce el vocabulario, lo que rebaja el peso del modelo aproximadamente un 25%. Ese cambio de tokenizador obliga a usar llama.cpp posterior a la build `b10430`, provoca un posible bloqueo de hasta cinco minutos en el primer arranque mientras se detectan los cambios y emite el aviso esperado `W load: special_eot_id is not in special_eog_ids - the tokenizer config may be incorrect`.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre horizontes largos, con planes coherentes en flujos de trabajo extendidos.
- Tool calling / function calling con esquemas precisos, mantenidos a lo largo de flujos con multiples invocaciones.
- Ejecucion agentica de extremo a extremo: resolucion de tareas completas dentro de scaffolds, incluyendo escritura y depuracion de codigo.
- Recuperacion ante fallos: cuando una herramienta falla o devuelve un resultado inesperado, diagnostica el error y reintenta.
- Vision: acepta imagenes intercaladas con texto mediante el encoder de percepcion (capturas de pantalla, graficos, documentos).
- Compatibilidad con scaffolds de orquestacion agentica como OpenClaw y Hermes Agent.
- Esfuerzo de razonamiento controlable (niveles de razonamiento configurables).
- Multilingue en el modelo original (mas de 100 idiomas); en esta GGUF podada, limitado a ingles y polaco.
- Limitacion fisica: al haberse eliminado los emojis del tokenizador, el modelo no puede emitirlos, aunque internamente siga "creyendo" que puede.

## Casos de uso

- Agentes de automatizacion en local: el modelo puede orquestar tool calls encadenadas y recuperarse de errores sin conexion a red, lo que encaja en entornos con requisitos de privacidad o air-gapped donde no se permite enviar datos a la nube.
- Automatizacion de navegacion y escritorio: gracias al encoder de percepcion, puede interpretar capturas de pantalla de interfaces y decidir la siguiente accion, lo que habilita agentes que operan sobre aplicaciones sin API.
- Resolucion de incidencias de codigo en pipelines: su entrenamiento en SWE-Bench y su capacidad de depuracion permiten integrarlo en flujos de revision que diagnostican tests fallidos y proponen parches dentro de un scaffold de CI/CD.
- Extraccion de datos de documentos y graficos: la entrada multimodal permite procesar facturas, informes o dashboards en imagen y devolver estructura JSON mediante function calling.
- Asistente de soporte tecnico multi-turno con herramientas: puede consultar un CRM o una base de conocimiento via tool calls y mantener el contexto de la conversacion, reintentando la consulta si la herramienta devuelve un error.
- Prototipado de agentes en GPU de consumo: al ser una GGUF podada de 30B, permite validar scaffolds agenticos (OpenClaw, Hermes Agent) en una estacion de trabajo sin depender de APIs de pago.
- Procesamiento de documentacion en ingles y polaco: unica combinacion linguistica soportada por esta variante, adecuada para equipos que trabajen exclusivamente en esos dos idiomas.

## Benchmarks y rendimiento

La model card menciona evaluacion en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no se han publicado resultados numericos en la informacion disponible. No se dispone tampoco de cifras de MMLU, HumanEval, GSM8K ni de latencia/throughput.

| Benchmark | Resultado |
|---|---|
| DeepSearch QA | no disponible |
| MCP-Atlas | no disponible |
| τ3-Bench | no disponible |
| SWE-Bench | no disponible |

## Requisitos de hardware

- VRAM estimada para el modelo original de 30B: ~60 GB en FP16, ~30-32 GB en Q8, ~18 GB en Q4_K_M, ~14 GB en Q3_K_M y ~10-11 GB en Q2_K.
- VRAM estimada para esta version podada: el autor declara una reduccion de aproximadamente el 25% en tamano, lo que situaria un Q4 en torno a 13-14 GB y un Q3 en torno a 10-11 GB (estimacion a partir del dato de poda; no confirmada por el autor).
- GPU profesionales: A100 40/80 GB y H100 para FP16 o Q8 sin compromisos; A100 40 GB sobra para cualquier cuantizacion.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) ejecutan comodamente Q4/Q5; RTX 4080 y 4060 Ti de 16 GB quedan justas para Q3/Q4; tarjetas de 12 GB requieren Q2/Q3 con offload parcial a CPU.
- Despliegue: llama.cpp con build superior a `b10430` (imprescindible) y Ollama con soporte parcial. El autor advierte que puede no producir salida en CLI y recomienda usar la interfaz web. vLLM solo con soporte GGUF experimental; TGI no soporta GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Muse Glimmer 30B (esta ficha, GGUF podada) | 30B | no disponible | Si | Apache 2.0 | GGUF |
| Qwen2.5-VL-32B-Instruct | 32B | 128K | Si | Apache 2.0 | safetensors, GGUF |
| Gemma 3 27B | 27B | 128K | Si | Terminos de Gemma | safetensors, GGUF |
| Mistral Small 3.1 24B | 24B | 128K | Si | Apache 2.0 | safetensors, GGUF |

La comparacion de rendimiento no es posible con la informacion disponible: Muse Glimmer no publica cifras numericas de benchmarks y el resto de modelos no se han evaluado aqui bajo el mismo protocolo. En contexto, los tres alternativas declaradas ofrecen ventanas de 128K, dato que no consta para Muse Glimmer.

## Limitaciones y advertencias

- Artefacto no verificado: cero descargas y cero likes; el autor afirma explicitamente que "no ofrece garantia alguna" de que la GGUF funcione y que "puede romperse o morir sin motivo".
- La poda del tokenizador limita la salida a ingles y polaco; cualquier otro idioma, incluido el espanol, producira resultados degradados o directamente invalidos.
- Incapacidad fisica de emitir emojis, aunque el modelo mantenga la expectativa interna de poder hacerlo; esto puede generar respuestas incoherentes en dominios donde se esperan.
- Requiere llama.cpp posterior a `b10430`; en versiones anteriores ni siquiera carga. El primer arranque puede colgarse hasta cinco minutos por la deteccion del cambio de tokenizador.
- Soporte parcial en llama.cpp y Ollama, con posible ausencia de salida en CLI; el autor recomienda la interfaz web.
- Longitud de contexto no documentada: no se puede planificar el uso en flujos de contexto largo sin verificacion previa.
- Riesgo de alusion: no se han publicado evaluaciones independientes ni tasas de alucinacion para este modelo ni para esta variante podada.
- Sesgos: no disponible; el modelo base declara entrenamiento en mas de 100 idiomas pero no se detalla la composicion del dataset ni los filtros aplicados.
- Licencia Apache 2.0 sobre el modelo base, que en principio permite uso comercial; sin embargo, la variante GGUF es una modificacion de terceros no avalada por Meta, por lo que la responsabilidad sobre su correcto funcionamiento recae en quien la despliega.
- Al ser una destilacion de Muse Spark y estar orientada a agentes, conviene aplicar sandboxing y limites de permisos en las tool calls antes de usarla en produccion.

## Enlaces

- Repositorio HuggingFace de esta ficha: https://huggingface.co/bluevoid-pl/Muse-Glimmer-30B-pruned-V2.5-en-pl-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Paper en arXiv: https://arxiv.org/abs/2610.24628
- GGUF sin podar del mismo autor: https://huggingface.co/bluevoid-pl/Muse-Glimmer-30B-GGUF
- GGUF podada (version previa, sin sufijo V2.5): https://huggingface.co/bluevoid-pl/Muse-Glimmer-30B-pruned-GGUF
- Ficha en ModelScope del modelo base en GGUF: https://www.modelscope.cn/models/meta-models/Muse-Glimmer-30B-GGUF
- Registro en Hugging Bay: https://huggingbay.xyz/artifact/hf-model-bluevoid-pl-muse-glimmer-30b-pruned-gguf

# furiosa-ai/Qwen3-32B-FP8

## Resumen

Qwen3-32B-FP8 es la variante cuantizada en FP8 del modelo denso Qwen3-32B, desarrollado originalmente por el equipo Qwen de Alibaba. Este repositorio concreto lo publica furiosa-ai, que lo empaqueta junto con un Furiosa Executable Bundle (FXB) para ejecutarlo sobre aceleradores FuriosaAI RNGD mediante la libreria furiosa-llm. El modelo resuelve el problema de desplegar un LLM de 32.800 millones de parametros en hardware de inferencia especializado sin perder las capacidades del modelo original.

Se trata de un transformer causal con grouped-query attention cuya caracteristica principal es el razonamiento hibrido: puede alternar entre un modo "thinking" (que emite una cadena de razonamiento antes de la respuesta final, util para matematicas, codigo y razonamiento complejo) y un modo "non-thinking" para dialogo general eficiente, todo dentro del mismo modelo y conmutable por peticion mediante `enable_thinking`. Incorpora ademas soporte solido de tool calling y capacidades multilingues.

Es relevante ahora porque combina una licencia permisiva (Apache 2.0), un tamano manejable para despliegue en produccion y una cuantizacion FP8 estatica que reduce el coste de memoria, ademas de venir acompanado de un bundle ejecutable listo para el acelerador RNGD de FuriosaAI y de una API compatible con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer causal denso con grouped-query attention) |
| Parametros totales | 32.762.123.264 (32,8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 estatico en pesos (block size 128); activaciones en FP8 dinamico (per-token / per-block); KV cache en 16 bits |
| Idiomas soportados | no disponible (la model card indica soporte multilingue sin detallar idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 105,7 GB); incluye Furiosa Executable Bundle (FXB) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de la familia Qwen3, con grouped-query attention. No es un modelo MoE: los 32.762 millones de parametros estan todos activos en cada token. La innovacion funcional mas destacable es el razonamiento hibrido, que permite activar o desactivar el modo thinking por peticion, devolviendo el contenido de razonamiento en un campo separado (`reasoning`) cuando el servidor se lanza con `--reasoning-parser qwen3`.

En cuanto a la cuantizacion, los pesos se almacenan en FP8 estatico con la misma cuantizacion fine-grained (block size 128) que emplea el modelo upstream Qwen/Qwen3-32B-FP8, mientras que las activaciones se cuantizan dinamicamente en FP8 en tiempo de ejecucion (per-token / per-block). La KV cache se mantiene en 16 bits. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esos datos corresponden al modelo base Qwen3-32B y no se reproducen aqui.

En el acelerador RNGD, el modelo se ejecuta con un tamano de tensor-parallel de 32 PEs, lo que se mapea a cuatro tarjetas RNGD (8 PEs por tarjeta).

## Capacidades

- Generacion de texto y dialogo conversacional multi-turno.
- Razonamiento hibrido: modo thinking (cadena de razonamiento antes de la respuesta) y modo non-thinking, conmutables por peticion via `enable_thinking`.
- Razonamiento matematico y resolucion de problemas complejos en modo thinking.
- Generacion y razonamiento sobre codigo.
- Tool calling / function calling mediante el parser `hermes`, con `--enable-auto-tool-choice`.
- Capacidades de agente y razonamiento multi-paso.
- Soporte multilingue (sin detalle de idiomas concretos en la informacion disponible).
- Exposicion de la cadena de razonamiento en campo separado (`message.reasoning` en no streaming, `delta.reasoning` en streaming).
- API compatible con OpenAI para integracion directa.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en modo non-thinking para respuestas rapidas y eficientes, reservando el modo thinking para consultas complejas, con la ventaja de conmutar por peticion sin cambiar de modelo.
- Asistentes de codigo en produccion: soporta tool calling y puede integrarse en pipelines para generar, explicar y refactorizar codigo, invocando herramientas externas (compiladores, linters, APIs) mediante el parser hermes.
- Agentes autonomos multi-paso: la combinacion de razonamiento thinking y function calling permite construir agentes que planifican, invocan herramientas y razonan sobre resultados intermedios dentro de un mismo flujo.
- Razonamiento matematico y analisis: en modo thinking el modelo emite la cadena de razonamiento antes de la respuesta, adecuado para tareas de calculo, validacion de resultados y problemas de varios pasos donde la trazabilidad del razonamiento es valiosa.
- Despliegue en infraestructura especializada: el bundle FXB y la integracion con furiosa-llm permiten servir el modelo sobre aceleradores RNGD con tensor-parallel de 32 PEs en cuatro tarjetas, util para entornos que apuestan por hardware de inferencia dedicado.
- Backend compatible con OpenAI en aplicaciones existentes: al exponer una API compatible, puede sustituir a otros proveedores en aplicaciones ya construidas sobre el SDK de OpenAI sin reescribir el cliente.
- Procesamiento de documentacion y generacion de contenido multilingue: el soporte multilingue del modelo base lo hace apto para tareas de redaccion y resumen en varios idiomas, aunque la lista concreta de idiomas no esta detallada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repo de pesos ocupa 105,7 GB en safetensors (FP8); el modelo esta pensado para ejecutarse sobre aceleradores FuriosaAI RNGD, no sobre GPU convencional segun la model card.
- GPU/acelerador recomendado: FuriosaAI RNGD, con tensor-parallel de 32 PEs mapeado a cuatro tarjetas RNGD (8 PEs por tarjeta).
- Compatibilidad con consumer GPU: no disponible en la informacion proporcionada; el bundle FXB esta orientado a RNGD.
- Opciones de despliegue: furiosa-llm (`furiosa-llm serve`), con API compatible con OpenAI. La model card indica que el mismo modelo tambien puede ejecutarse en otros frameworks como vLLM, SGLang y Transformers, remitiendo a la model card upstream de Qwen/Qwen3-32B-FP8 para esos casos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| furiosa-ai/Qwen3-32B-FP8 | 32,8B (denso) | no disponible | FP8 | Apache 2.0 | FuriosaAI RNGD |
| Qwen/Qwen3-32B-FP8 (upstream) | 32,8B (denso) | no disponible | FP8 | Apache 2.0 | GPU (vLLM, SGLang, Transformers) |
| Qwen/Qwen3-32B | 32,8B (denso) | no disponible | BF16/FP16 | Apache 2.0 | GPU |

La diferencia principal entre este repositorio y el upstream Qwen/Qwen3-32B-FP8 es el empaquetado: furiosa-ai anade el Furiosa Executable Bundle y la integracion con furiosa-llm para RNGD, mientras que el modelo upstream esta pensado para frameworks de GPU convencionales. En capacidades y pesos, ambos son equivalentes. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen3-32B, hereda los sesgos del modelo base, no detallados aqui.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo LLM, puede generar contenido plausible pero incorrecto, especialmente en modo non-thinking.
- Limitaciones de contexto e idioma: la longitud de contexto y la lista concreta de idiomas no estan disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del modelo upstream (Qwen/Qwen3-32B-FP8) para los terminos exactos.
- Dependencia de hardware: el bundle FXB y las instrucciones de despliegue estan orientados a FuriosaAI RNGD; para GPU convencional hay que acudir a la model card upstream y a otros frameworks.
- El campo `reasoning` no forma parte de la especificacion de la API de OpenAI (es una convencion extendida); acceder a el cuando la respuesta no contiene razonamiento provoca un `AttributeError`.
- La cuantizacion FP8 puede introducir degradacion de precision frente al modelo en BF16/FP16, aunque no se cuantifica en la informacion disponible.
- El repositorio tiene 983 descargas y 0 likes en el momento de la consulta, lo que indica adopcion todavia limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-32B-FP8
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-32B-FP8
- Licencia upstream: https://huggingface.co/Qwen/Qwen3-32B-FP8/blob/main/LICENSE
- FuriosaAI: https://furiosa.ai
- Documentacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guia de instalacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html
- Guia de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html

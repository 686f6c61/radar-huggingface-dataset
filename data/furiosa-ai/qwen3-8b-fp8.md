# furiosa-ai/Qwen3-8B-FP8

## Resumen

Qwen3-8B-FP8 es la versión cuantizada a FP8 del modelo denso Qwen3-8B de Alibaba Qwen, empaquetada por FuriosaAI junto con un Furiosa Executable Bundle (FXB) para ejecutarse sobre aceleradores RNGD mediante la librería Furiosa-LLM. El modelo base es un transformer causal de 8.190.735.360 parámetros con grouped-query attention, diseñado para alternar entre modo de razonamiento (thinking) y modo de diálogo directo dentro de un mismo modelo.

La propuesta de valor de este repositorio no es el modelo en sí, sino el binario precompilado que permite desplegar Qwen3-8B-FP8 en hardware FuriosaAI RNGD sin pasar por el proceso de compilación del grafo. La cuantización FP8 es estática en pesos (block size 128, la misma del modelo upstream) y dinámica en activaciones (per-token / per-block), lo que reduce el tamaño del repositorio a 21,9 GB.

Es relevante para equipos que evalúan alternativas de inferencia fuera del ecosistema GPU NVIDIA: el mismo checkpoint funciona también en vLLM, SGLang y Transformers, por lo que actúa como puente entre el modelo upstream de Qwen y el stack de FuriosaAI. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3) con grouped-query attention |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 estatica en pesos (block size 128) y FP8 dinamica en activaciones (per-token / per-block) |
| Idiomas soportados | en (segun metadatos del repo); el modelo upstream Qwen3 declara capacidades multilingues, aunque el tag de este repo solo lista ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mas FXB para FuriosaAI RNGD) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de la familia Qwen3, con grouped-query attention. La model card de este repositorio no aporta detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni las etapas de alineacion (RLHF, DPO u otras); esa informacion corresponde a la model card upstream de Qwen/Qwen3-8B-FP8, que no se incluye en la informacion disponible.

La innovacion tecnica principal de esta publicacion es el empaquetado: un Furiosa Executable Bundle (FXB) precompilado que ejecuta el modelo en RNGD con un tamaño de tensor-parallel de 8 PEs, lo que equivale a una sola tarjeta RNGD (8 PEs por tarjeta). La cuantizacion FP8 replica el esquema del modelo upstream: pesos en FP8 estatico con bloques de 128 y activaciones cuantizadas dinamicamente en tiempo de ejecucion. El modelo soporta alternancia entre thinking mode y non-thinking mode por peticion mediante el parametro `enable_thinking`.

## Capacidades

- Generacion de texto y conversacion multi-turno con API compatible con OpenAI.
- Razonamiento hibrido: modo thinking activado por defecto, con chain of thought devuelto en un campo `reasoning` separado (tanto en streaming como en no streaming) al lanzar el servidor con `--reasoning-parser qwen3`.
- Desactivacion del razonamiento por peticion mediante `chat_template_kwargs: {"enable_thinking": false}`, o por defecto en el servidor con `--default-chat-template-kwargs`.
- Tool calling / function calling mediante el parser `hermes`, activable con `--enable-auto-tool-choice --tool-call-parser hermes`.
- Capacidades de agente y razonamiento multi-paso heredadas del modelo base Qwen3.
- Razonamiento matematico y generacion de codigo (segun la descripcion del modelo base en la model card).
- Soporte multilingue declarado para el modelo base; el tag de idioma de este repositorio solo indica `en`.
- Entrada y salida exclusivamente de texto (sin vision ni audio).

## Casos de uso

- Razonamiento matemático y resolución de problemas: activando thinking mode, el modelo emite cadena de pensamiento antes de la respuesta final, lo que resulta adecuado para tareas que requieren verificación intermedia como cálculo simbólico o problemas de varios pasos.
- Generación de código con verificación: el modo thinking permite al modelo razonar sobre la solución antes de escribir el código, útil en pipelines de revisión automática o generación de tests.
- Agentes con tool calling: integrado con el parser `hermes`, el modelo puede decidir cuándo invocar funciones externas, lo que permite construir asistentes que consultan APIs, bases de datos o servicios internos.
- Atención al cliente automatizada: el modo non-thinking reduce latencia en conversaciones multi-turno de propósito general, donde no se necesita cadena de razonamiento.
- Despliegue en hardware FuriosaAI RNGD: el FXB precompilado permite servir el modelo en una sola tarjeta RNGD con tensor-parallel de 8 PEs, sin compilación manual del grafo.
- Evaluación comparativa de stacks de inferencia: al ser compatible con Furiosa-LLM, vLLM, SGLang y Transformers, sirve para medir rendimiento del mismo checkpoint en distintas plataformas.
- Procesamiento por lotes de clasificación o extracción de información: con thinking desactivado y la API OpenAI-compatible, se puede integrar en scripts de procesamiento masivo de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 21,9 GB en FP8; en GPU el peso en memoria ronda ese orden, aunque la VRAM efectiva depende del backend y de la longitud de contexto.
- GPU recomendadas: no especificadas en la model card; el modelo upstream Qwen3-8B-FP8 puede ejecutarse en GPUs con soporte FP8 (por ejemplo, familia Hopper o Ada), pero este dato no se confirma en la informacion disponible.
- Hardware objetivo de este repositorio: FuriosaAI RNGD, con tensor-parallel size de 8 PEs (una tarjeta RNGD).
- ¿Cabe en GPU consumer?: no disponible en la informacion proporcionada.
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve`), y según la model card también vLLM, SGLang y Transformers usando el modelo upstream Qwen/Qwen3-8B-FP8.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| furiosa-ai/Qwen3-8B-FP8 | 8,19 B (denso) | no disponible | FP8 (pesos y activaciones) | Apache 2.0 | FuriosaAI RNGD |
| Qwen/Qwen3-8B-FP8 (upstream) | 8,19 B (denso) | no disponible | FP8 | Apache 2.0 | GPU con soporte FP8 |
| Qwen/Qwen3-8B (base) | 8,19 B (denso) | no disponible | BF16 (presumible, no confirmado) | Apache 2.0 | GPU generica |

La comparativa se limita al mismo modelo en distintos empaquetados porque la informacion proporcionada no incluye datos de rendimiento ni de modelos alternativos de otros fabricantes. No se dispone de cifras de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- La model card de este repositorio no documenta sesgos conocidos; se heredan los del modelo base Qwen3-8B, no detallados en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; no se aportan tasas ni evaluaciones en la informacion proporcionada.
- El tag de idioma del repositorio solo declara `en`; el soporte multilingue del modelo base no esta confirmado para este empaquetado.
- La longitud de contexto no se especifica en la model card de este repositorio; debe consultarse la del modelo upstream.
- El campo `reasoning` no forma parte de la especificacion de la API de OpenAI; acceder a el cuando la respuesta no contiene razonamiento lanza `AttributeError`.
- El FXB esta compilado especificamente para FuriosaAI RNGD; para otros backends debe usarse el modelo upstream Qwen/Qwen3-8B-FP8.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio upstream para cualquier clausula adicional.
- No se proporcionan datos de latencia, throughput ni consumo energetico, lo que limita la planificacion de capacidad en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-8B-FP8
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-8B-FP8
- Licencia: https://huggingface.co/Qwen/Qwen3-8B-FP8/blob/main/LICENSE
- FuriosaAI: https://furiosa.ai
- Documentacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guia de instalacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Guia de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html

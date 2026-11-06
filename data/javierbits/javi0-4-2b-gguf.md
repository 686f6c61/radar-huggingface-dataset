# javierbits/Javi0.4-2B-GGUF

## Resumen

Javi0.4-2B-GGUF es la distribucion en formato GGUF del modelo javierbits/Javi0.4-2B, un modelo de lenguaje de 1.942.653.248 parametros (~1,94 B) desarrollado por el usuario javierbits. Se trata de una edicion quirurgica en el espacio de pesos (weight-space editing) de Javi0.3-2B: no hay fine-tuning, ni nuevos datos, ni gradientes. Concretamente, se multiplica por 0,84 la fila de embedding compartida entre entrada y salida del token 51187 (`=open_page`), lo que sesga una unica decision del modelo: tras un fallo de busqueda, volver a llamar a `web_search` en lugar de abrir una URL inventada de memoria.

El modelo esta pensado para agentes con herramientas (busqueda web, fetch de paginas, shell) y se distribuye bajo licencia Apache 2.0, heredada de Qwen3.5-2B, del que deriva la arquitectura. La relevancia de esta ficha no reside en una mejora general de capacidades, sino en documentar un experimento reproducible de edicion de pesos orientado a corregir un comportamiento patologico concreto en agentes: la alucinacion de URLs tras un fallo de busqueda.

El repositorio incluye dos cuantizaciones GGUF (Q8_0 y Q4_K_M) generadas a partir de un GGUF F16 del modelo fusionado editado. Es un modelo solo texto: la torre de vision del modelo base no esta incluida en el GGUF. El modelo fue entrenado y evaluado con `enable_thinking: false`, por lo que el modo de razonamiento extendido no forma parte del flujo recomendado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-2B) |
| Parametros totales | 1.942.653.248 (~1,94 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens en el ejemplo de llama.cpp; 262.144 en la configuracion de lmswitch |
| Tipos de cuantizacion | Q8_0 (2,1 GB), Q4_K_M (1,3 GB); F16 disponible desde la misma conversion |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base javierbits/Javi0.4-2B) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-2B: un transformer denso de aproximadamente 1,94 B de parametros con embeddings de entrada y salida atados (tied). La modificacion introducida en Javi0.4-2B no implica entrenamiento: se parte de Javi0.3-2B y se escala por 0,84 la fila de embedding compartida correspondiente al token 51187 (`=open_page`). No hay nuevos datos, ni RLHF, ni DPO, ni ajuste supervisado. El efecto es un sesgo sobre una unica decision de seleccion de herramienta.

El autor documenta el efecto medido sobre 8 preguntas canonicas de tipo `fail` del conjunto eval-v3, forzando el primer `web_search` a fallar y observando la siguiente herramienta con decodificacion greedy: Javi0.3-2B eligio `open_page` en 8/8 casos, mientras que Javi0.4-2B eligio `web_search` en 7/8 y `open_page` en 1/8. En un canary con herramientas reales y sampling, el factor 0,84 mantuvo el comportamiento del base (eligio `open_page` tras un bloqueo permanente y completo la tarea), a costa de una busqueda extra en una consulta normal. Un factor 0,75 invertia 4/4 pero entraba en bucle con 14 busquedas bajo bloqueo permanente, por lo que 0,84 se presenta como el ajuste conservador. El autor advierte que se trata de una sonda dirigida, no de la evaluacion v3 completa, y que en opencode/grok las llamadas `webfetch`/`web_fetch` tras un 403 no se ven afectadas.

## Capacidades

- Generacion de texto conversacional en ingles.
- Uso de herramientas (tool calling / function calling) orientado a agentes: busqueda web, fetch de paginas y shell.
- Razonamiento multi-paso en bucles de agente con herramientas.
- Seleccion de herramienta sesgada para reintentar `web_search` tras un fallo, en lugar de abrir URLs inventadas.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking: disponible en la plantilla de chat, pero el modelo fue entrenado y evaluado con `enable_thinking: false`; no se recomienda su uso.
- Vision: no incluida en el GGUF (la torre de vision del base no se conserva en la conversion).

## Casos de uso

- Agentes de investigacion web: el modelo puede encadenar `web_search` y fetch de paginas en bucles multi-paso; el sesgo introducido reduce la probabilidad de abrir URLs alucinadas cuando una busqueda falla, lo que es util en pipelines donde un fetch erroneo consume cuota o introduce ruido.
- Automatizacion de tareas de navegacion con reintentos: en escenarios donde la busqueda puede fallar de forma transitoria (rate limits, timeouts), el modelo tiende a reintentar la busqueda en lugar de saltar a una URL construida de memoria.
- Despliegue local en hardware modesto: con Q4_K_M (1,3 GB) cabe en GPUs de consumo y en CPU via llama.cpp, lo que permite ejecutar agentes en estaciones de trabajo sin GPU dedicada.
- Integracion con clientes compatibles con OpenAI: el servidor `llama-server` expone `http://localhost:8080/v1`, de modo que cualquier agente compatible con la API de OpenAI puede apuntarse al modelo sin cambios de codigo.
- Entornos de desarrollo asistidos por agente (opencode/grok): util como modelo de proposito general para tareas de shell y fetch, aunque el autor advierte que el sesgo no afecta a `webfetch`/`web_fetch` en esos entornos.
- Experimentacion en edicion de pesos: sirve como caso reproducible para estudiar como una modificacion de una unica fila de embedding altera una decision de tool calling, util en investigacion sobre interpretabilidad y control de comportamiento.
- Prototipado de agentes en ingles con contexto largo: la configuracion de ejemplo admite 131.072 tokens de contexto con `-fa on` y cuantizacion de KV cache a q8_0, adecuado para conversaciones y trazas de agente extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta una sonda dirigida sobre 8 preguntas del conjunto eval-v3:

| Modelo | Siguiente `web_search` | Siguiente `open_page` |
|---|---:|---:|
| Javi0.3-2B | 0/8 | 8/8 |
| Javi0.4-2B | 7/8 | 1/8 |

El autor indica explicitamente que se trata de una sonda dirigida y no de la evaluacion v3 completa, y que la evaluacion v3/v3f completa no se ejecuto.

## Requisitos de hardware

- VRAM estimada: Q8_0 ocupa 2,1 GB en disco y Q4_K_M 1,3 GB; la VRAM necesaria es aproximadamente el tamano del archivo mas la KV cache.
- KV cache: con contexto de 131.072 tokens y `-ctk q8_0 -ctv q8_0` la cache se reduce, pero sigue siendo el principal consumidor de memoria en contextos largos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M en contextos cortos; para contexto completo de 131k se recomienda una GPU con 16 GB o mas (RTX 4090, A100, H100). El tag `dgx-spark` sugiere que el autor lo ha probado en ese entorno.
- Cabe en GPU de consumo: si, Q4_K_M (1,3 GB) y Q8_0 (2,1 GB) caben en GPUs de consumo con contexto moderado; con contexto largo la KV cache puede exceder la VRAM disponible.
- Opciones de despliegue: llama.cpp (`llama-server`), lmdeck (`lmdeck use javi0.4-2b`), lmswitch (configuracion YAML con runtime llama). No se documentan vLLM, TGI ni Ollama en la informacion disponible.
- Parametros de sampling recomendados: `--temp 0.2 --top-p 0.8 --top-k 20 --min-p 0`, con `enable_thinking: false` y `--jinja`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Javi0.4-2B-GGUF | ~1,94 B | 131.072 (ejemplo llama.cpp) | Apache 2.0 | GGUF en Hugging Face | Edicion de pesos sobre Javi0.3-2B |
| Javi0.3-2B | ~1,94 B | no disponible | Apache 2.0 (heredada) | Safetensors | Modelo base sin la edicion; 8/8 `open_page` en la sonda |
| Javi0.4-4B-GGUF | no disponible | no disponible | no disponible | GGUF en Hugging Face | Control de mayor tamano del mismo autor |
| Qwen3.5-2B | ~2 B | no disponible | Apache 2.0 | Safetensors | Modelo original del que deriva la arquitectura |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El cambio de comportamiento es una sonda dirigida sobre 8 preguntas; no se ejecuto la evaluacion v3/v3f completa, por lo que el efecto en produccion no esta caracterizado de forma exhaustiva.
- El sesgo solo alcanza la herramienta canonica `open_page`; en opencode/grok las llamadas `webfetch`/`web_fetch` tras un 403 no se ven afectadas.
- Un factor 0,75 producia bucles de hasta 14 busquedas bajo bloqueo permanente; el 0,84 elegido es conservador pero puede implicar una busqueda extra en consultas normales.
- Riesgo de alucinacion: el modelo no incorpora ninguna mejora general de veracidad; solo se modifica una decision de seleccion de herramienta.
- Solo ingles declarado; no se documenta soporte multilingue.
- Solo texto: la torre de vision del modelo base no esta en el GGUF.
- El modo thinking no esta validado; el autor recomienda `enable_thinking: false`.
- Licencia Apache 2.0 permite uso comercial, pero se hereda de Qwen3.5-2B y conviene revisar los terminos del modelo original.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en produccion por terceros.
- No se han publicado datos de sesgos, latencia ni throughput.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/javierbits/Javi0.4-2B-GGUF
- Safetensors: https://huggingface.co/javierbits/Javi0.4-2B
- Modelo base: https://huggingface.co/javierbits/Javi0.3-2B
- Control 4B: https://huggingface.co/javierbits/Javi0.4-4B-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-2B

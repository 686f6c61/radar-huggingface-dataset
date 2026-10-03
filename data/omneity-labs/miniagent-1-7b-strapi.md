# omneity-labs/miniagent-1.7B-strapi

## Resumen

Mini Agent 1.7B · Strapi es un modelo de lenguaje de pesos abiertos disenado especificamente como agente para operar sobre Strapi, un CMS headless de codigo abierto, mediante llamadas reales a su API REST. Lo desarrolla Omneity Labs, un laboratorio que apuesta por agentes especializados y acotados: cada modelo conoce un unico sistema de software en profundidad en lugar de intentar cubrir un dominio general. El modelo esta construido sobre Qwen3-1.7B, con 1.720.574.976 parametros, y se distribuye bajo licencia Apache 2.0.

El problema que resuelve es concreto: ejecutar tareas de gestion de contenido (CRUD y relaciones entre colecciones) contra la Content API de Strapi 5 encadenando llamadas a la herramienta `api_call(method, path, query, body)` de una en una, leyendo la respuesta real y decidiendo la siguiente accion. La diferencia frente al modelo base es muy marcada: en la evaluacion publicada por el autor sobre 204 tareas reales contra instancias limpias de Strapi 5, Mini Agent supera 191 tareas frente a las 21 del Qwen3-1.7B base con la misma interfaz.

Es relevante ahora porque demuestra que un modelo pequeno de 1.7B, especializado mediante ajuste fino en un dominio estrecho y con una interfaz de tool calling bien definida, puede superar ampliamente a su base en tareas agente acotadas, reduciendo coste de inferencia y permitiendo despliegue local o en endpoints compatibles con OpenAI. La documentacion indica que no esta verificado para el panel de administracion, autenticacion, subidas, rutas singleton ni controles de publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16, GPTQ w4a16 (4 bits, activaciones de 16 bits), GGUF BF16, GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 Transformers / vLLM), GPTQ, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de la familia Qwen3, y se ajusta como agente especializado en Strapi 5. La innovacion principal no esta en la arquitectura de red, sino en la interfaz de interaccion: el modelo emite llamadas nativas a la herramienta `api_call` con los argumentos `method`, `path`, `query` y `body`, ejecuta una sola llamada por turno, recibe el resultado HTTP real y decide la siguiente accion hasta cerrar con una respuesta breve en texto plano. La release actual usa `tool_calls` nativos; una interfaz anterior basada en JSON plano permanece en la etiqueta `v3-json-output`.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El alcance funcional verificado cubre cinco colecciones de Strapi 5: Editorial (Articles, authors, categories) y Catalogo (Products, countries), con operaciones de listar, crear, leer, actualizar y borrar, ademas de relaciones articulo-autor y producto-pais. El modelo reutiliza `documentId` entre llamadas y lee relaciones con el parametro `populate`. No se han publicado datos sobre el dataset de ajuste en la informacion disponible.

## Capacidades

- Generacion de llamadas a herramientas (tool calling) nativas mediante el parser `hermes` de vLLM.
- Ejecucion de un unico `api_call` por turno, con lectura del resultado antes de proponer la siguiente llamada.
- Razonamiento multietapa acotado para flujos CRUD y cambios de relaciones en Strapi 5.
- Gestion de operaciones sobre cinco colecciones verificadas: Articles, authors, categories, Products y countries.
- Soporte de relaciones articulo-autor y producto-pais, incluyendo lecturas con `populate`.
- Reutilizacion de identificadores `documentId` entre llamadas sucesivas.
- Distincion entre `id` numerico y `documentId` cuando se le indica en el prompt.
- Modo sin razonamiento (non-thinking) para decodificacion determinista.
- Generacion de texto conversacional breve como cierre de la tarea.

No se ha documentado soporte de vision, audio, ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Automatizacion editorial sobre Strapi: el modelo puede listar, crear, actualizar y borrar articulos y autores encadenando llamadas a la Content API, reutilizando `documentId` para mantener la coherencia entre operaciones. Es adecuado porque su ajuste se ha verificado especificamente sobre estas colecciones.
- Sincronizacion de catalogos de producto: gestion de las colecciones Products y countries y de la relacion producto-pais, util para pipelines que mantienen un catalogo actualizado desde una fuente externa mediante llamadas REST acotadas.
- Subagente especializado dentro de un asistente mayor: integrarlo como especialista en Strapi dentro de una arquitectura multiagente, donde un orquestador delega tareas concretas de CMS y el modelo ejecuta las llamadas de bajo nivel.
- Extension de un agente de codigo: usarlo como herramienta especializada en un asistente tipo Codex para que consulte el estado del CMS o realice operaciones de contenido durante tareas de desarrollo.
- Automatizacion de flujos de cuatro llamadas: la documentacion reporta buen rendimiento en ciclos de vida con varias llamadas encadenadas y cambios de relacion, adecuado para procesos editoriales tipo crear-autor-crear-articulo-vincular.
- Tareas de lectura en entornos de solo consulta: gracias a que las lecturas funcionan por defecto sin `allow_writes`, es apropiado para consultar articulos, autores, categorias y productos sin riesgo de escritura.
- Pruebas de integracion sobre esquemas conocidos: al ejecutarse localmente con vLLM u Ollama y requerir un estado final esperado, puede usarse en entornos de validacion de la API de Strapi en CI.

## Benchmarks y rendimiento

Evaluacion en vivo sobre instancias limpias de Strapi 5, en checkpoint BF16, comparando Mini Agent con el Qwen3-1.7B base usando la misma interfaz `api_call`:

| Checkpoint BF16 | Balanced CRUD + relations (72) | Lifecycle + relation updates (62) | Post-selection workflows (70) |
|---|---:|---:|---:|
| Qwen3-1.7B base, misma interfaz `api_call` | 8/72 (11,1 %) | 6/62 (9,7 %) | 7/70 (10,0 %) |
| Mini Agent | 70/72 (97,2 %) | 58/62 (93,5 %) | 63/70 (90,0 %) |

En el conjunto total de 204 tareas, Mini Agent supero 191 y el modelo base 21. Las tareas abarcan cinco colecciones, encadenamiento de `documentId`, relaciones articulo-autor y producto-pais y lecturas con `populate`. Cada rollout parte de una instancia nueva de Strapi 5 y se considera aprobado solo si la llamada a funcion es valida, la secuencia de acciones es la solicitada y el estado almacenado es el esperado. El texto de accion en JSON plano no supera la comprobacion de tool call. Los resultados solo aplican a este conjunto de cinco colecciones y corresponden a BF16; los ficheros cuantizados no han recibido la evaluacion en vivo completa.

## Requisitos de hardware

- VRAM estimada en BF16 (1.720.574.976 parametros a 2 bytes): aproximadamente 3,4 GB solo para los pesos, mas el espacio de activaciones y cache KV.
- VRAM estimada en GPTQ w4a16 (4 bits): aproximadamente 1,0-1,2 GB para los pesos.
- VRAM estimada en GGUF Q8_0: aproximadamente 1,8-2,0 GB; en GGUF Q4_K_M: aproximadamente 1,0-1,3 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060/4060 (12/8 GB), RTX 4070, RTX 4080 y RTX 4090. Incluso una GPU con 6 GB puede ejecutar las variantes GGUF Q4_K_M o Q8_0.
- GPU de datacenter recomendadas para mayor concurrencia: A100, H100, L40S, siempre sobredimensionadas para un modelo de este tamano.
- Opciones de despliegue: servidor vLLM compatible con OpenAI con `--enable-auto-tool-choice --tool-call-parser hermes`; llama.cpp para las variantes GGUF; Ollama; y endpoints compatibles con OpenAI (por ejemplo Featherless si el modelo aparece en su catalogo con function calling habilitado), ajustando `MINIAGENT_API_BASE` y `MINIAGENT_API_KEY`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en tareas Strapi | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini Agent 1.7B · Strapi | 1.720.574.976 | No disponible | 191/204 tareas (BF16) | Apache 2.0 | HuggingFace, GGUF, GPTQ |
| Qwen3-1.7B (base) | ~1,7B | No disponible en la informacion proporcionada | 21/204 tareas con la misma interfaz | Apache 2.0 | HuggingFace (modelo base de referencia) |

La informacion proporcionada no incluye datos de otros agentes especializados comparables en la misma categoria, por lo que la comparativa se limita al modelo base Qwen3-1.7B que el propio autor usa como referencia. No hay datos disponibles de alternativas equivalentes para Strapi.

## Limitaciones y advertencias

- El modelo puede proponer una llamada incorrecta o copiar un identificador de forma erronea; la propia model card lo advierte explicitamente.
- Alcance verificado limitado a cinco colecciones. No esta verificado para el panel de administracion, autenticacion, subidas, rutas singleton ni controles de publicacion.
- El texto de accion en JSON plano no supera la comprobacion de tool call; es necesario usar `tool_calls` nativos.
- Uso de escrituras: las escrituras requieren `allow_writes=True`; para produccion se recomienda una allowlist especifica de la aplicacion y comprobacion de estado. Se desaconsejan las escrituras en produccion sin revision, el trabajo masivo destructivo, la planificacion abierta y la recuperacion de errores.
- Los resultados solo aplican al conjunto de prueba de cinco colecciones; no deben generalizarse a otros esquemas de Strapi.
- Los ficheros cuantizados (GPTQ, GGUF) no han recibido la evaluacion en vivo completa, por lo que su rendimiento puede diferir del BF16.
- Soporte unicamente en ingles.
- Riesgo de alucinacion inherente a un modelo de 1.7B; la ejecucion de las llamadas y la validacion del resultado recaen en el cliente, no en el modelo.
- El proyecto es independiente de Strapi; no es un producto oficial de Strapi.
- Licencia Apache 2.0, que permite uso comercial, condicionada a las obligaciones de la propia licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omneity-labs/miniagent-1.7B-strapi
- Etiqueta de la interfaz antigua JSON: https://huggingface.co/omneity-labs/miniagent-1.7B-strapi/tree/v3-json-output
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Omneity Labs: https://www.omneitylabs.com/
- Repositorio de Strapi: https://github.com/strapi/strapi
- Documentacion de la API REST de Strapi: https://docs.strapi.io/cms/api/rest
- Documentacion de tool calling de vLLM: https://docs.vllm.ai/en/stable/features/tool_calling/
- Referencia de la API de Featherless: https://featherless.ai/docs/api-reference-models
- Guia de inicio de Featherless: https://featherless.ai/docs/quickstart-guide

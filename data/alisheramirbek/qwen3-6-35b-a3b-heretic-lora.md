# AlisherAmirbek/Qwen3.6-35B-A3B-heretic-lora

## Resumen

`AlisherAmirbek/Qwen3.6-35B-A3B-heretic-lora` es un adaptador LoRA de tipo SFT (supervised fine-tuning) publicado por el usuario AlisherAmirbek sobre el modelo base `llmfan46/Qwen3.6-35B-A3B-uncensored-heretic`, una variante del Qwen3.6 con arquitectura MoE (35B parametros totales, 3B activos segun la nomenclatura del identificador). No es un modelo completo, sino un adaptador PEFT que debe cargarse junto al modelo base para funcionar.

El adaptador esta especializado en la seleccion de herramientas (tool selection) para un asistente conversacional: distingue entre dos herramientas raiz, `internal_memory` (busqueda en una base de conocimiento interna para conocimiento estable) y `web_search` (busqueda web para hechos actuales, locales o especificos de entidades), y extrae parametros como filtros de busqueda, geolocalizacion y senales de perfil. Es la etapa 2 de un pipeline de entrenamiento denominado "hot-llm" y sustituye la herramienta unica `grounded_answer` de la release anterior `00d50c63`.

Su relevancia es acotada pero concreta: sirve como referencia para quien necesite implementar un enrutador de herramientas fiable en un agente conversacional con contexto largo (hasta 20.480 tokens durante entrenamiento) y para estudiar tecnicas de exportacion de LoRA MoE a vLLM. La licencia no esta declarada en la informacion disponible, lo que supone un riesgo para uso comercial sin aclaracion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base MoE; adaptador con 80 tensores LoRA-B de expertos, 256 expertos, rank 16 |
| Parametros totales | no disponible para el adaptador; modelo base referido como 35B en el identificador |
| Parametros activos | no disponible (el identificador sugiere 3B activos, sin confirmacion en la model card) |
| Longitud de contexto | 20.480 tokens de longitud maxima de secuencia durante entrenamiento; contexto de inferencia del modelo base no disponible |
| Tipos de cuantizacion | QLoRA (entrenamiento); cuantizaciones de inferencia del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); exportacion preparada para vLLM como LoRA MoE 3D (`is_3d_lora_weight=true`) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre un modelo base con arquitectura MoE (mezcla de expertos) de 256 expertos, aplicando QLoRA con rank 16, alpha 32, dropout 0 y tasa de aprendizaje 1e-4 con schedule lineal. El entrenamiento se realizo "desde cero" sobre el modelo base, sin inicializar desde un adaptador de dialogo ni desde un adaptador especializado anterior. Se usaron 20.465 muestras de entrenamiento y 4.667 de evaluacion held-out, con dos epocas, 1.280 pasos de optimizador y batch efectivo de 32 (8 x 4). La revision base fue `dbfd9eb0cdc7c33fc970b06429f6e043b6851190`.

La innovacion principal es la division de la herramienta raiz `grounded_answer` en dos herramientas (`internal_memory` y `web_search`), con reetiquetado turno a turno de los objetivos raiz y reasignacion de filas `none` que piden informacion in-domain hacia una de las dos herramientas. El contexto de conversacion usa tool calls nativos del asistente y observaciones de herramientas; se mantiene el vocabulario del tokenizer base de 248.077 tokens, sin tokens legacy de contexto de agente ni filas de embedding entrenadas. Los pesos ya vienen convertidos para vLLM mediante `scripts/training/convert_unsloth_moe_lora_for_vllm.py`, con verificacion de equivalencia de layout logico, invariancia de tensores no objetivo y preservacion de claves; la model card advierte explicitamente de no reaplicar esa conversion.

## Capacidades

- Seleccion de herramienta raiz entre `internal_memory`, `web_search` y `none` en conversaciones multi-turno.
- Extraccion de argumentos de herramienta: filtros de busqueda, geolocalizacion y `augmented_query`.
- Extraccion de senales de perfil del usuario.
- Gestion de contexto de agente mediante tool calls nativos y observaciones de herramientas.
- Generacion de texto conversacional (pipeline `text-generation`), heredada del modelo base.
- Soporte de rechazos (refusals) cuando la peticion no debe atenderse con herramienta.
- No emite la herramienta `grounded_answer`; el codigo de serving debe conocer los dos nombres nuevos.
- Capacidades multilingues, de codigo, matematicas o vision: no disponibles en la informacion proporcionada.

## Casos de uso

- Enrutamiento de consultas en asistentes con base de conocimiento propia: el adaptador decide si una pregunta sobre terminos, tecnicas o etiqueta debe resolverse contra `internal_memory` o si requiere `web_search`, lo que evita busquedas web innecesarias y reduce coste y latencia.
- Asistentes con informacion actual o local: para preguntas sobre hechos recientes, entidades concretas o datos geolocalizados, el modelo emite `web_search` con filtros y geolocalizacion extraidos de la consulta, lo que simplifica la construccion de la query en el backend.
- Extraccion de senales de perfil en onboarding: el adaptador puede poblar campos de perfil del usuario a partir de los turnos de conversacion, util en productos de recomendacion o personalizacion.
- Moderacion de alcance conversacional: la clase `none` y los rechazos permiten filtrar peticiones que no deben resolverse con herramientas, como base para guardrails en produccion.
- Evaluacion de pipelines de agentes: sirve como componente de referencia para medir la precision de seleccion de herramienta y de argumentos en un sistema propio, con un conjunto held-out documentado.
- Prototipado de asistentes de salud sexual, relaciones y etiqueta: la model card menciona explicitamente estos dominios como contenido de la base interna, por lo que encaja en productos verticales de ese ambito.
- Investigacion sobre LoRA MoE y serving: el export verificada para vLLM 0.26.0 con `is_3d_lora_weight=true` sirve como ejemplo reproducible de conversion y despliegue de adaptadores MoE.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Coincidencia estricta de objetivo (strict target matching) | 4.123 / 4.667 (88,34%) |
| Eleccion de herramienta raiz | 2.069 / 2.106 |
| Rechazos correctos | 272 / 276 (un falso rechazo) |
| Fallos estrictos de raiz con herramientas correctas pero argumentos distintos | 438 / 475 |
| Turnos held-out que requieren herramienta de conocimiento con conjunto de herramientas correcto | 295 / 310 |
| Confusion entre las dos herramientas de conocimiento | 4 casos |
| Generaciones truncadas | 0 de 4.667 |

La model card advierte de que los totales no son directamente comparables con la release `00d50c63` (4.106 / 4.637), porque el conjunto held-out anterior usaba el nombre de herramienta antiguo y no incluia las 30 muestras de regresion. Los desajustes no fueron revisados manualmente y los resultados son de benchmark offline; el comportamiento en aplicacion real no se ha evaluado. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 80,2 GB en el repositorio, un tamano que sugiere pesos del modelo base incluidos en el repo o artefactos de conversion; conviene revisar el arbol de ficheros antes de descargar.
- VRAM para inferencia: no disponible de forma explicita. Depende del modelo base MoE de 35B y de su cuantizacion; con cuantizacion de 4 bits el modelo base requeriria del orden de 18-20 GB, pero este dato no esta confirmado en la informacion proporcionada.
- GPU recomendadas: no disponibles. Para el modelo base de 35B en precision completa se necesitarian multiples GPU de 80 GB (A100/H100); con cuantizacion podria caber en una RTX 4090 de 24 GB, sin confirmacion.
- Despliegue: vLLM 0.26.0 es el runtime validado, cargando el adaptador como LoRA MoE 3D con `is_3d_lora_weight=true` y el tokenizer y chat template nativos de tool calls. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AlisherAmirbek/Qwen3.6-35B-A3B-heretic-lora | Adaptador LoRA sobre base 35B MoE (3B activos segun identificador) | 20.480 tokens de entrenamiento | Enrutado de herramientas (`internal_memory` / `web_search`) | no disponible | Hugging Face, 109 descargas |
| llmfan46/Qwen3.6-35B-A3B-uncensored-heretic | 35B MoE (3B activos segun identificador) | no disponible | Modelo base sin especializar en herramientas | no disponible | Hugging Face |
| Release previa `00d50c63` del mismo pipeline hot-llm | Adaptador LoRA sobre el mismo base | no disponible | Herramienta unica `grounded_answer` | no disponible | Referenciada en la model card, sin URL |

No se dispone de informacion sobre otros adaptadores de enrutado de herramientas comparables en la busqueda realizada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el modelo base `llmfan46/Qwen3.6-35B-A3B-uncensored-heretic` en la revision indicada; el adaptador por si solo no genera texto.
- Licencia no declarada: no se puede asumir uso comercial permitido. El modelo base pertenece a la familia Qwen y su licencia original debe verificarse por separado.
- La model card advierte de que no debe reaplicarse la conversion a vLLM sobre este export; hacerlo corromperia los pesos.
- El codigo de serving debe actualizarse para reconocer `internal_memory` y `web_search`; no se emite `grounded_answer`, lo que rompe compatibilidad con integraciones anteriores.
- Los resultados de evaluacion son offline y no revisados manualmente; el comportamiento en produccion no esta validado.
- Riesgo de confusion entre las dos herramientas de conocimiento (4 casos en held-out) y de argumentos incorrectos con herramienta correcta (438 de 475 fallos estrictos de raiz).
- El modelo base se presenta como "uncensored" y "heretic", lo que implica una reduccion deliberada de los filtros de seguridad; no es adecuado para aplicaciones orientadas al publico general sin guardrails adicionales.
- Sesgos conocidos, tasas de alucinacion e idiomas soportados: no disponibles.
- Solo 109 descargas y 0 likes en el momento de la consulta; ecosistema de validacion muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlisherAmirbek/Qwen3.6-35B-A3B-heretic-lora
- Arbol de ficheros: https://huggingface.co/AlisherAmirbek/Qwen3.6-35B-A3B-heretic-lora/tree/main
- Modelo base: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic
- Repositorio hot-llm (referenciado por commits `1b1389dc6b7d0bbe51453fe9fb13a353b7a4b3dd` y `f363edf2`): no disponible como URL en la informacion proporcionada
- Fichero `vllm_conversion.json` con checksums de conversion: incluido en el repositorio del modelo

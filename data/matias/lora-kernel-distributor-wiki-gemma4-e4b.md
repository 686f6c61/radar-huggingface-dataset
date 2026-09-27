# Matias/lora-kernel-distributor-wiki-gemma4-e4b

## Resumen

`Matias/lora-kernel-distributor-wiki-gemma4-e4b` es un adaptador LoRA de investigacion publicado sobre el modelo base `google/gemma-4-E4B-it`. No es un asistente general ni un contenedor de hechos: segun su autor, el adaptador no memoriza conocimiento, sino un unico habito operativo, recorrer una biblioteca de paginas Markdown cortas para responder a una pregunta. El flujo que aprendio consiste en buscar, abrir una pagina, abrir la seccion concreta que necesita, seguir el enlace `[[page-id]]` escrito dentro de una frase, derivar la aritmetica a una calculadora y citar la afirmacion en la que se apoya la respuesta. Si la biblioteca no contiene nada sobre la pregunta, responde literalmente `Not in my library.`.

La tesis del proyecto es separar navegacion y contenido: los pesos guardan el procedimiento de navegacion y el Markdown guarda los datos. Esto implica que, cuando un hecho cambia, se edita una pagina y el modelo permanece intacto, sin reentrenamiento. El adaptador forma parte del proyecto lora-kernel y se distribuye como research preview, con licencia Apache-2.0, e incluye un runtime propio en el repositorio que hace de interprete de las etiquetas `<search>`, `<open>` y `<calc>` que emite el modelo.

Se trata de un adaptador pequeno (el repositorio ocupa 0,1 GB) pensado para evaluacion e investigacion sobre navegacion de conocimiento y uso de herramientas, no para despliegue generalista. Su evaluacion se realizo sobre mundos de wiki generados sinteticamente y nunca vio, en entrenamiento, el mundo concreto sobre el que se le evaluo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer multimodal `google/gemma-4-E4B-it`; modulos objetivo: todas las proyecciones de atencion y MLP |
| Parametros totales | No disponible de forma explicita (adaptador LoRA con rango r=16 y alpha=32; repositorio de 0,1 GB). Los parametros del modelo base no se detallan en la informacion disponible |
| Parametros activos | No aplica (el adaptador no es MoE). La naturaleza del base no se confirma en la informacion disponible |
| Longitud de contexto | No disponible (la longitud maxima de secuencia usada en entrenamiento fue de 1536 tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantizar; la cuantizacion aplicable depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

Arquitectura de adaptacion por LoRA sobre `google/gemma-4-E4B-it`. La receta declarada es: rango r=16, alpha=32, 3 epocas, learning rate 2e-4, batch efectivo de 16, longitud maxima de secuencia 1536, aplicado a todas las proyecciones de atencion y MLP, con semilla 1. El corpus de entrenamiento es `training/wiki/data/train_cmp.jsonl` (728 recorridos o walks, sha256 `7b307d53...`). Las torres de vision y audio del modelo base quedan excluidas del adaptador, y el modo de razonamiento se mantiene desactivado (`enable_thinking=false`) en todos los renders evaluados.

La innovacion tecnica no reside en el mecanismo de adaptacion, sino en el protocolo de interaccion. El modelo emite etiquetas `<search>`, `<open>` y `<calc>`; el runtime detiene la generacion en cada etiqueta de cierre, escribe el resultado en linea tras `= ` y permite continuar la generacion. El autor subraya que esto no equivale a `tool_calls` de OpenAI: un adaptador del mismo proyecto obtuvo 11/90 servido con el formato de tool calls estandar y 90/90 servido en linea tal y como fue entrenado. El contenido factual no vive en los pesos, sino en paginas Markdown con front matter YAML (`id`, `when`, `what`) seguidas de una afirmacion por linea anclada con `§anchor`, con enlaces en formato `[[page-id]]`.

## Capacidades

- Navegacion de una biblioteca de documentos Markdown mediante busqueda, apertura de paginas y apertura de secciones concretas.
- Razonamiento multi-salto (2-3 saltos) siguiendo enlaces internos `[[page-id]]` escritos dentro de las afirmaciones.
- Uso de calculadora externa para operaciones aritmeticas mediante la etiqueta `<calc>`.
- Citado explicito: cada respuesta se apoya en la seccion concreta que la sustenta.
- Abstención controlada: responde `Not in my library.` cuando la biblioteca no contiene la informacion.
- Protocolo de herramientas propio en linea (`<search>`, `<open>`, `<calc>`), dependiente de un runtime especifico.
- Generacion de texto en ingles.
- No cubre vision ni audio: ambas torres del base quedan excluidas del adaptador.
- No dispone de modo de razonamiento extendido: `enable_thinking=false` en todos los renders.

## Casos de uso

- Base de conocimiento corporativa en Markdown: el adaptador puede recorrer una biblioteca de paginas internas, localizar la seccion relevante y responder citando el fragmento exacto, lo que facilita auditar de donde sale cada dato.
- Atencion al cliente con respuestas trazables: en lugar de generar texto libre, el sistema abre la pagina de politica o procedimiento correspondiente y cita la afirmacion, reduciendo el riesgo de respuestas inventadas.
- RAG con navegacion explicita multi-salto: alli donde un RAG clasico recupera fragmentos por similitud, este adaptador sigue enlaces entre paginas para componer respuestas de 2-3 saltos, util en documentacion con referencias cruzadas.
- Calculo integrado en flujos de respuesta: la etiqueta `<calc>` permite derivar operaciones aritmeticas a una calculadora determinista en lugar de confiar en el calculo del modelo, adecuado para presupuestos, tarifas o metricas.
- Mantenimiento de wikis vivas: como el conocimiento reside en el Markdown y no en los pesos, actualizar un hecho consiste en editar una pagina sin reentrenar el adaptador, lo que simplifica el ciclo de mantenimiento.
- Investigacion sobre uso de herramientas y navegacion de conocimiento: sirve como banco de pruebas reproducible para estudiar protocolos de tool use en linea frente a `tool_calls` estandar.
- Sistemas de cumplimiento y trazabilidad documental: el requisito de que la respuesta solo cuente si la seccion citada respalda el valor la convierte en una pieza util para flujos donde se exige justificacion documental.

## Benchmarks y rendimiento

Evaluacion sobre un mundo de wiki generado (`knowledge/distributor-wiki`, semilla 20260924) que el adaptador nunca vio en entrenamiento: su corpus procedia de otros 32 mundos generados. Una respuesta solo cuenta si el valor es correcto y ademas la seccion citada lo respalda.

| Modelo / variante | W9 headline (2-3 saltos, 40) | W9 completo (67) | Banda de comparacion (40) |
|---|---|---|---|
| `gemma-4-E4B-it` sin adaptador, mismo runtime y prompt | 19/40 | No disponible | No disponible |
| `distributor-wiki@v1` (sin comparaciones en el corpus) | 39/40 | 63/67 | 10/40 |
| `distributor-wiki@v2` (este adaptador) | 39/40 | 63/67 | 37/40 (28:1 emparejado frente a v1, p = 1,1e-7) |

Ejecuciones de referencia: `results/M7-W9-atomic-statements-20260924`, B1 y `results/B5-comparison-corpus-20260926`. El manifiesto de publicacion es `releases/distributor-wiki@v2.json` y el sha256 del adaptador es `d4d91ea4aa7a8ffcd82beabb87d07112c02b212388412fb61f43df49d3eb93d6`.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,1 GB, por lo que el coste de almacenamiento anadido es minimo.
- Los requisitos de VRAM dependen enteramente del modelo base `google/gemma-4-E4B-it`, cuyos datos de memoria no se detallan en la informacion disponible.
- Despliegue verificado: vLLM con soporte LoRA activado, que fue el entorno con el que se produjeron los numeros de evaluacion.
- Carga mediante PEFT para uso directo del adaptador sobre el base.
- Es necesario el runtime propio del proyecto (`memory/` con las clases `Library` y `Conversation`) para interpretar las etiquetas `<search>`, `<open>` y `<calc>`; sin el, el modelo no funciona segun lo entrenado.
- No se requieren las torres de vision ni de audio para este adaptador.
- VRAM para GPU de consumo, latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible solo permite comparar contra variantes internas del mismo proyecto, no contra modelos externos de la misma categoria.

| Variante | Parametros | Contexto | W9 headline (40) | Banda de comparacion (40) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `distributor-wiki@v2` (este adaptador) | LoRA r=16, alpha=32 | No disponible (max_seq 1536 en entrenamiento) | 39/40 | 37/40 | Apache-2.0 | Publicado en HuggingFace |
| `distributor-wiki@v1` | LoRA (rango no detallado) | No disponible | 39/40 | 10/40 | Apache-2.0 | Publicado en HuggingFace |
| `gemma-4-E4B-it` sin adaptador | No disponible | No disponible | 19/40 | No disponible | No disponible | Modelo base publico |

No se dispone de datos de modelos externos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Todos los mundos sobre los que se ha entrenado o evaluado proceden de un unico generador. No se ha medido sobre una biblioteca escrita a mano ni sobre la de una organizacion real, por lo que podria haber aprendido particularidades del generador.
- Exige un formato de pagina concreto: front matter YAML (`id`, `when`, `what`) seguido de una afirmacion por linea con ancla `§anchor` y enlaces internos en formato `[[page-id]]`. Fuera de ese formato el comportamiento no esta garantizado.
- Requiere el runtime del proyecto. Emite etiquetas `<search>`, `<open>` y `<calc>` que deben ser interpretadas deteniendo la generacion y escribiendo el resultado en linea.
- No es compatible de forma nativa con el mecanismo `tool_calls` de OpenAI: un adaptador del proyecto paso de 11/90 a 90/90 al cambiar de ese formato al servicio en linea.
- El modo de razonamiento esta desactivado (`enable_thinking=false`) y las torres de vision y audio quedan excluidas del adaptador.
- No contiene conocimiento factual: si la biblioteca no cubre la pregunta, se abstiene con `Not in my library.`
- Soporte unicamente en ingles.
- Licencia Apache-2.0, igual que el modelo base, por lo que no se declaran restricciones adicionales de uso comercial.
- Al ser un research preview con 0 descargas y 0 likes en el momento de la consulta, la validacion por parte de terceros es practicamente inexistente.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Matias/lora-kernel-distributor-wiki-gemma4-e4b
- Repositorio del proyecto lora-kernel: https://github.com/EvolvingAgentsLabs/lora-kernel
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Manifiesto de publicacion: `releases/distributor-wiki@v2.json` (dentro del repositorio lora-kernel)
- Ejecuciones de evaluacion: `results/M7-W9-atomic-statements-20260924` y `results/B5-comparison-corpus-20260926`
- Documentacion de servicio y memoria: `docs/SERVING.md` y `docs/MEMORY.md` §1.6
- Mundo de evaluacion: `knowledge/distributor-wiki/`
- Runner de evaluacion: `training/wiki/wiki_arm.py`
- Corpus de entrenamiento: `training/wiki/data/train_cmp.jsonl`

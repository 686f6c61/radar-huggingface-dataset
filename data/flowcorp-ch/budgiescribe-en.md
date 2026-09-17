# flowcorp-ch/BudgieScribe-en

## Resumen

BudgieScribe-en es un modelo de normalizacion de texto para transcripciones de voz (ASR), desarrollado por flowcorp-ch y distribuido bajo la marca Budgie. No es un modelo conversacional: recibe la salida cruda de un motor de reconocimiento de voz en ingles (minusculas, sin puntuacion, con muletillas, arranques falsos, autocorrecciones y cifras escritas con palabras) y la reescribe como el texto que el hablante pretendia dictar. Se trata de un fine-tune completo de Qwen/Qwen3-0.6B, con 596.049.920 parametros totales, publicado unicamente en formato GGUF.

El modelo forma parte de Budgie Echo, una aplicacion de dictado local-first para macOS y Windows, y su pipeline de entrenamiento, generadores y evaluacion son abiertos. Su diseno es deliberadamente monoproposito: no responde, no resume y no anade contenido por iniciativa propia; su comportamiento se controla mediante una linea de control al principio de la entrada que fija estilo, estructura, contexto e idioma. Esta pensado para ejecutarse en local con llama.cpp, con un fichero de 378,3 MiB y decodificacion greedy.

Es relevante ahora porque ataca un problema sistemico de los pipelines de STT: el texto que sale del motor ASR no es un texto publicable. En lugar de depender de reglas heurísticas o de un modelo generativo grande y caro, ofrece un normalizador de 0,6 B que cabe en cualquier equipo y que se puede integrar como etapa de post-procesado. El repositorio se publica reconociendo explicitamente sus debilidades y buscando contribuciones sobre conjuntos de validacion reservados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune completo de Qwen/Qwen3-0.6B) |
| Parametros totales | 596.049.920 (0,6 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens tal y como se sirve; las entradas se trocean a 1.200 bytes |
| Tipos de cuantizacion | Q4_K_M (de 16,00 a 5,24 bits por peso); es la unica cuantizacion publicada |
| Idiomas soportados | ingles (en) |
| Licencia | budgiescribe-license (la model card la describe como Apache 2.0 mas un termino de nombrado; el metadato de HuggingFace la registra como `other`) |
| Formato de pesos | GGUF (fichero `scribe-en-v7-Q4_K_M.gguf`, 396.704.576 bytes / 378,3 MiB) |

Datos adicionales del artefacto: SHA-256 `02b3eb0b385d54a5c2fbe5c4a29c144fee9196972a22eef5d4659120147f49b5`; build interno `scribe-en-v7` (fase 3, con disposicion `Context: email`, cantidades embebidas y linea `[Terms:]`); runtime de referencia llama.cpp release b10816.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B, un transformer decoder-only, sobre el que se ha realizado un fine-tune completo (no un adaptador). El modelo se entrena y se sirve con un contrato de formato estricto: la primera linea del mensaje de usuario contiene cuatro ejes entre corchetes (`Styling`, `Structure`, `Context`, `Lang`), seguidos de la transcripcion cruda. El modelo fue entrenado con esa sintaxis exacta, y la model card advierte que el system prompt publicado es la cadena literal usada en entrenamiento y no debe reescribirse.

En cuanto a los datos, la unica fuente declarada es `facebook/voxpopuli`. El pipeline de generacion de datos de entrenamiento, los generadores y la evaluacion son abiertos en el repositorio `gobudgie/budgie-scribe`. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO; la nomenclatura de la build ("phase 3") sugiere iteraciones sucesivas del pipeline, pero su contenido no esta documentado en la informacion proporcionada.

La innovacion tecnica destacable no esta en la arquitectura sino en el contrato de normalizacion: la normalizacion inversa de texto (ITN) convierte la **forma** de una cantidad, nunca su **valor**, y la resolucion de autocorrecciones se hace al valor final que el hablante elige, no al primero enunciado.

## Capacidades

- Eliminacion de pausas llenas (`um`, `uh`, `er`, `hmm`), repeticiones involuntarias ("the the report") y arranques falsos.
- Resolucion de autocorrecciones al valor final: "friday no wait thursday" pasa a "Thursday"; "forty two sorry forty three" pasa a "43".
- Restauracion de puntuacion y mayusculas, distinguiendo pregunta directa (cierra con "?") de interrogativa indirecta ("I don't know *how* it works", cierra con punto).
- Segmentacion en parrafos cuando hay un cambio claro de tema en tomas largas.
- Normalizacion inversa de texto: cantidades monetarias ("twelve hundred dollars" pasa a `$1,200`; "twenty three thousand four hundred and fifty dollars" pasa a `$23,450`), horas ("three fifteen p m" pasa a `3:15pm`; "half past two" pasa a `2:30`; "fourteen thirty" pasa a `14:30`), fechas manteniendo el orden dictado ("march third twenty twenty six" pasa a `March 3, 2026`; "the third of march twenty twenty six" pasa a `3 March 2026`) y porcentajes ("twenty five percent" pasa a `25%`).
- Control de estructura: `Structure: lists` permite lista con vinetas Markdown cuando hay una enumeracion real de al menos tres elementos; `prose` prohibe vinetas.
- Control de contexto: `Context: email` dispone el texto con formato de mensaje.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de pensamiento; la model card indica explicitamente "thinking disabled" y decodificacion greedy fija (`temperature 0`, `top_k 1`).
- Multilingue: no. Solo ingles (`Lang: en`).

## Casos de uso

- Post-procesado de dictado en aplicaciones de escritorio: el modelo es la etapa de limpieza que Budgie Echo sirve en local; se invoca tras el motor ASR para convertir la transcripcion cruda en texto legible y publicable sin salir del equipo.
- Correo electronico dictado: con `Context: email`, reordena el texto como mensaje; util para redactar respuestas o notas dictadas desde el movil u ordenador. Conviene tener en cuenta que en esta build anade saludo y despedida no dictados.
- Notas de reunion y actas: a partir de una transcripcion en bruto, elimina muletillas, resuelve frases a medio empezar y divide en parrafos alli donde cambia el tema, lo que reduce el trabajo manual de limpieza antes de archivarlas.
- Documentacion tecnica dictada: la resolucion de autocorrecciones al valor final es critica al dictar cifras, versiones o identificadores, donde decir "cuarenta y dos perdon cuarenta y tres" debe consolidarse en un unico valor.
- Normalizacion de cifras para pipelines de datos: convertir importes, horas, fechas y porcentajes dictados a su forma escrita (`$1,200`, `14:30`, `March 3, 2026`) de forma determinista y local, sin depender de servicios en la nube ni de expresiones regulares fragiles.
- Enumeraciones y listas a partir de voz: con `Structure: lists` el modelo produce vinetas Markdown cuando el hablante enumera al menos tres elementos, lo que resulta util para generar checklists o pasos de procedimiento directamente desde dictado.
- Preprocesado para otros sistemas: dado su tamano y su licencia permisiva, puede actuar como etapa intermedia en un pipeline propio entre un motor ASR y, por ejemplo, un indexador de notas o un sistema de resumen, entregando texto ya puntuado y con cifras normalizadas.
- Procesamiento por lotes en local: con decodificacion greedy y ~0,09 s por frase medidos en hardware de referencia, es viable reprocesar grandes volumenes de transcripciones historicas en una sola maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente reporta metricas internas sobre conjuntos reservados, que se recogen en la tabla siguiente:

| Evaluacion interna | Resultado | Ambito |
|---|---|---|
| Resolucion de autocorrecciones al valor final | 474/474 | Conjunto reservado interno |
| Fidelidad de estructura (`prose` / `lists`) | 634/634 | Conjunto reservado interno |
| Benchmarks publicos estandar (MMLU, GSM8K, HumanEval) | no disponibles | — |
| Detalle completo de la seccion Evaluation | no disponible en la informacion proporcionada | — |

Rendimiento en inferencia medido con llama.cpp b10816 sobre Radeon AI PRO R9700 (Vulkan): 0,8 s de carga del modelo, ~436 tokens/s en decodificacion y ~0,09 s por frase.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos Q4_K_M ocupan 378,3 MiB; sumando cache KV y el overhead de llama.cpp, el consumo total se situa por debajo de 1 GB en configuraciones tipicas con contexto de 4.096 tokens (estimacion a partir del tamano de fichero, no un dato publicado).
- Cabe en cualquier GPU de consumo: es un modelo de 0,6 B en Q4_K_M, por lo que es viable en iGPU, GPU integradas y tarjetas de gama baja; tambien es viable en CPU.
- GPU recomendadas: no se publica una lista de GPU recomendadas. El unico punto de referencia medido es una Radeon AI PRO R9700 mediante Vulkan.
- Opciones de despliegue: llama.cpp (release b10816 es la version de referencia con la que se genero el GGUF y con la que se sirve en Echo). La model card usa llama-server con `--jinja`, `--chat-template-kwargs '{"enable_thinking":false}'`, `--temp 0`, `--top-k 1`, `--ctx-size 4096`, `--n-gpu-layers 999` y `--parallel 1`.
- El repositorio incluye el tag `endpoints_compatible`, por lo que la API compatible con OpenAI (`/v1/chat/completions`) es el modo de integracion previsto.
- Latencia y throughput: 0,8 s de carga, ~436 tokens/s de decodificacion y ~0,09 s por frase en el hardware de referencia. No se publican mediciones en otras plataformas.
- Para llama.cpp, Ollama, vLLM o TGI no se proporcionan instrucciones ni garantias en la informacion disponible; solo llama.cpp esta explicitamente soportado y verificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| BudgieScribe-en | 0,6 B | 4.096 tokens (entradas troceadas a 1.200 bytes) | en | budgiescribe-license (Apache 2.0 mas termino de nombrado segun la model card) | GGUF (Q4_K_M) | Publicado; 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-0.6B (modelo base) | 0,6 B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo base declarado del fine-tune |
| BudgieScribe-fr (flowcorp-ch) | no disponible | no disponible | fr | no disponible | no disponible | Hermano en frances, publicado por el mismo autor |
| Otros normalizadores de texto para ASR | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas comparables documentadas en la informacion proporcionada |

La comparacion cuantitativa de calidad frente a alternativas no puede realizarse: no hay benchmarks publicos en la informacion disponible y las metricas internas (474/474 y 634/634) corresponden a conjuntos reservados propios, no comparables con terceros.

## Limitaciones y advertencias

- `Context: email` en esta build anade un saludo y una despedida que no fueron dictados. Es una alucinacion documentada por el propio autor y desaconseja su uso en cualquier flujo donde el texto deba corresponder estrictamente a lo dicho.
- El eje `Styling` (`casual`, `semi-casual`, `semi-formal`, `formal`) es inerte en esta build: solo se entreno con `semi-formal`, por lo que cambiar el valor no altera el registro de salida.
- Solo ingles. El campo `Lang` esta fijado a `en` en esta version; para frances existe un modelo hermano separado.
- No es un modelo conversacional: no responde, no resume y no debe usarse como asistente. Forzarlo fuera de su tarea degrada la salida.
- La decodificacion es greedy y fija (`temperature 0`, `top_k 1`) con el modo de pensamiento desactivado; desviarse de esa configuracion no esta respaldado por el autor.
- Las entradas se trocean a 1.200 bytes, por lo que en tomas largas el modelo no ve el contexto completo de la transcripcion y la coherencia entre fragmentos depende del troceado.
- El system prompt es literal y no debe reescribirse; modificarlo invalida el comportamiento esperado.
- Riesgo de alucinacion inherente a todo modelo generativo de este tipo: aunque el diseno busca no anadir contenido, la anadidura de saludo y despedida en modo email demuestra que puede introducir material no dictado.
- Sesgos: no se documentan sesgos especificos en la informacion disponible.
- Licencia: el metadato de HuggingFace la registra como `other` con nombre `budgiescribe-license`, mientras que la model card la describe como Apache 2.0 mas un termino de nombrado. Antes de un uso comercial conviene revisar el fichero LICENSE-MODEL, porque existe una discrepancia entre ambas descripciones y hay una clausula de nombrado.
- Adopcion practica: 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa y ausencia de ecosistema probado.
- Para produccion: no se publican metricas de estabilidad fuera del hardware de referencia (Radeon AI PRO R9700 con Vulkan) ni pruebas con otras versiones de llama.cpp distintas de b10816.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flowcorp-ch/BudgieScribe-en
- Modelo hermano en frances: https://huggingface.co/flowcorp-ch/BudgieScribe-fr
- Licencia del modelo: https://huggingface.co/flowcorp-ch/BudgieScribe-en/blob/main/LICENSE-MODEL
- Repositorio de entrenamiento y evaluacion: https://github.com/gobudgie/budgie-scribe
- Contrato de formato: https://github.com/gobudgie/budgie-scribe/blob/main/FORMAT.md
- Guia de contribucion: https://github.com/gobudgie/budgie-scribe/blob/main/CONTRIBUTING.md
- Aplicacion Budgie Echo: https://gobudgie.com/echo
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset declarado: https://huggingface.co/datasets/facebook/voxpopuli

# DavidSlayback1/grade-level-explainer-4b

## Resumen

`DavidSlayback1/grade-level-explainer-4b` no es un modelo completo, sino un adaptador LoRA (PEFT, r=16, alpha=32 sobre todas las capas lineales) entrenado sobre `Qwen/Qwen3-4B-Instruct-2507`. Su objetivo es muy concreto: responder preguntas infantiles etiquetadas con un curso G (de 2.º a 6.º) en prosa plana de tres frases como maximo y con un nivel de lectura Flesch-Kincaid igual o inferior a G+0,5, partiendo obligatoriamente de dos o tres frases de hechos de referencia que se le suministran en el prompt.

El modelo resuelve un problema de control de estilo y legibilidad, no de conocimiento: el adaptador aprende a ceñirse al nivel lector, evitar listas, markdown y preambulos, y explicar terminos tecnicos con palabras cotidianas cuando la pregunta los exige. El entrenamiento combina SFT con QLoRA de 4 bits (1.686 ejemplos con hechos de referencia) y una fase posterior de DPO on-policy con 551 pares, generados por destilacion filtrada de Claude Sonnet y verificados por jueces de otra familia.

Es relevante ahora por dos motivos: primero, porque demuestra un patron de entrenamiento reproducible (destilacion con bucle de revision medido en FK + DPO sobre pares pass/fail) para un problema de producto muy comun en edtech y divulgacion; segundo, porque su model card publica resultados incomodos sin maquillar: el umbral de fiabilidad declarado (90% global, 85% en items con presion de jerga) no se cumple (79,6% y 46,2%). Con 0 descargas y 0 likes en el momento de la consulta, debe tratarse como un artefacto de investigacion, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only: Qwen3-4B-Instruct-2507. r=16, alpha=32, aplicado a todas las capas lineales |
| Parametros totales | 4B en el modelo base; el repositorio contiene unicamente los pesos del adaptador (~0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (se hereda del modelo base) |
| Tipos de cuantizacion | modelo base cuantizado en 4-bit nf4 durante el entrenamiento QLoRA; no se publican cuantizaciones GGUF, AWQ ni GPTQ del adaptador |
| Idiomas soportados | no disponible; la unica metrica de legibilidad usada es Flesch-Kincaid (ingles) y la model card esta en ingles |
| Licencia | apache-2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors (adaptador PEFT); libreria `peft` |
| Modo de decodificacion recomendado | greedy, modo no-thinking |
| Formato de prompt | system: `You answer children's questions. The student is in grade G.`; user: `Reference facts: <note>` + `Question: <question>` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-4B-Instruct-2507` (commit `cdbee75f17c01a7cc42f958dc650907174af0554`), con r=16, alpha=32 y cobertura de todas las capas lineales. El SFT se hizo con QLoRA de 4 bits nf4, 3 epocas, learning rate 2e-4 y batch efectivo de 8 sobre 1.686 ejemplos con hechos de referencia (spec v3, grounded). Sobre ese checkpoint se aplico una segunda fase de DPO con beta 0,1, learning rate 2e-5 y 551 pares on-policy para este adaptador, cada par formado por una respuesta que pasa el control programatico frente a otra que falla, filtradas por comprobacion programatica y fact-check con DeepSeek.

Los datos proceden de destilacion filtrada de Claude Sonnet como profesor, con un bucle de revision que mide el FK de cada respuesta; el filtrado de veracidad lo hacen jueces de otra familia (Codex gpt-6-luna en ~250 filas, DeepSeek v4.1 flash en el resto) y el juez de evaluacion es gpt-5.4-mini. La innovacion tecnica no esta en la arquitectura, que es un LoRA estandar, sino en el diseno del objetivo: la recompensa del DPO no es preferencia humana sino el resultado de un chequeo programatico (FK <= G+0,5, maximo 3 frases, sin listas ni markdown) combinado con un juez de correccion, lo que convierte una especificacion de estilo en una senal de entrenamiento verificable.

## Capacidades

- Generacion de explicaciones en prosa plana para preguntas infantiles, con limite duro de 3 frases y sin listas, markdown ni preambulos.
- Control explicito del nivel de lectura: objetivo Flesch-Kincaid <= G+0,5 para G entre 2 y 6.
- Respuesta fundamentada en hechos: el prompt exige 2-3 frases de referencia y el modelo las usa como base de la respuesta.
- Explicacion de jerga bajo demanda: cuando la pregunta pide terminos tecnicos concretos, los emplea y los define con palabras cotidianas.
- Respuesta directa y sin rodeos (el formato prohibe preambulos y estructuras tipo lista).
- No soporta tool calling ni function calling: no hay ninguna mencion en la model card.
- No hay soporte declarado de agentes, multi-step reasoning ni modo thinking; de hecho se recomienda decodificacion greedy en modo no-thinking.
- Sin capacidades multimodales (vision o audio): el adaptador solo modifica el comportamiento textual del base.
- Multilingue: no disponible; no se documenta comportamiento fuera del ingles.

## Casos de uso

- Asistente de refuerzo escolar con RAG: el adaptador exige frases de hechos en el prompt, por lo que encaja de forma natural en un pipeline que recupera 2-3 oraciones del temario y las inyecta; el modelo devuelve una explicacion de 3 frases ajustada al curso del alumno. Es el caso de uso para el que fue entrenado.
- Generacion de material divulgativo para edtech: producir definiciones breves y uniformes para fichas de ejercicios de primaria, con verificacion programatica posterior del FK y del numero de frases antes de publicar.
- Simplificacion de textos tecnicos ya existentes: dado un parrafo y sus hechos clave, generar una version de nivel lector fijado (por ejemplo G4) manteniendo los terminos pedidos y explicandolos.
- Guiones para audio o video infantil: la restriccion de prosa de 3 frases sin markdown ni listas produce texto directamente apto para TTS y locucion.
- Prototipado de evaluacion de legibilidad: banco de pruebas para medir como un modelo de 4B responde a un objetivo de estilo medible, comparando SFT frente a SFT+DPO con el modelo base como referencia.
- Generacion de borradores con revision humana obligatoria: el adaptador sirve como primer paso de un pipeline editorial en el que un revisor humano o un modelo mayor corrige; los datos publicados (79,6% de pass global, 46,2% en items con jerga) desaconsejan publicar sin esa revision.
- Investigacion sobre destilacion con profesor cerrado: reproducible como receta (bucle de revision medido en FK, filtrado por juez de otra familia, DPO on-policy) para otros objetivos de estilo medibles, como resumenes con longitud maxima o textos con vocabulario restringido.

## Benchmarks y rendimiento

Evaluacion `grade_v3` (387 items, 65 de ellos con presion de jerga; juez gpt-5.4-mini; 0 respuestas del juez sin parsear):

| Metrica | Valor | Umbral declarado |
|---|---|---|
| Pass (chequeo programatico AND juez), todos los items | 79,6% | >= 90% |
| Pass en items de presion / trampa de jerga | 46,2% | >= 85% |
| Acierto de objetivo FK unicamente | 89,1% | - |
| Chequeo programatico unicamente (FK, frases, formato) | 86,8% | - |
| Juez unicamente (correcto, responde a la pregunta) | 91,2% | - |
| FK medio (desviacion media frente al objetivo) | 2,76 (-1,85) | - |

| Pass por curso | Valor |
|---|---|
| G2 | 88,7% |
| G3 | 80,5% |
| G4 | 79,5% |
| G5 | 77,1% |
| G6 | 74,4% |

Recuento de fallos: `fk_too_high`=42, `missing_terms`=4, `too_many_sentences`=6.

Otros datos publicados por el autor: sin frases de referencia el modelo cae al comportamiento no fundamentado (62-66% global; 75,7% solo con juez). Un segundo juez (DeepSeek v4.1 flash) aprueba muchos menos respuestas del modelo de 4B: 47,4% frente a 67,5% en las salidas no fundamentadas de la segunda ronda, con kappa 0,47, lo que indica que las tasas de aprobacion dependen fuertemente del juez elegido. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa ~0,1 GB, pero requiere cargar el modelo base de 4B en memoria.
- VRAM estimada en bf16/fp16: ~8 GB solo para pesos; con overhead de runtime y cache KV para 4-8k tokens, entre 10 y 12 GB (estimacion, no medida por el autor).
- VRAM estimada con cuantizacion de 8 bits: ~4-5 GB; en 4 bits nf4: ~2,5-3,5 GB.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con cuantizacion; en tarjetas de 8 GB solo con cuantizacion agresiva y contextos cortos.
- GPU recomendadas para servicio: L40S, A100 40 GB u H100 si se sirve con batching y varias instancias del adaptador; RTX 4090 para desarrollo y evaluacion.
- Despliegue: `transformers` + `peft` (ruta directa, sin fusionar), vLLM con soporte multi-LoRA, o TGI si admite adaptadores PEFT en la version desplegada. Para llama.cpp u Ollama hay que fusionar el adaptador con el base y convertir a GGUF; el autor no publica esa conversion.
- Latencia y throughput: no disponibles. Con decodificacion greedy y salidas de 3 frases como maximo, la generacion es corta por diseno, pero no hay cifras medidas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-4B + LoRA r=16 + DPO) | 4B + adaptador | no disponible | apache-2.0 | Explicaciones con nivel lector acotado y respuesta fundamentada en hechos | 79,6% pass global y 46,2% en items de jerga en su propio eval |
| Qwen3-4B-Instruct-2507 (base sin adaptar) | 4B | no disponible | apache-2.0 | Instruct general con modo thinking | No evaluado con esta metodologia en la model card; el autor reporta 62-66% global para el comportamiento no fundamentado del adaptador, no del base |
| Qwen2.5-3B-Instruct | 3B | no disponible | apache-2.0 | Instruct general | No comparable: no hay evaluacion de control de nivel lector en la informacion disponible |

No se han identificado en la informacion proporcionada otros adaptadores publicos con el mismo objetivo (explicaciones con nivel lector limitado y verificacion FK), por lo que la comparativa de rendimiento en esa tarea queda como no disponible.

## Limitaciones y advertencias

- Los umbrales de fiabilidad declarados por el propio autor no se cumplen: 79,6% frente a >= 90% global y 46,2% frente a >= 85% en items de presion. No es apto para produccion sin supervision humana.
- El fallo dominante es superar el nivel de lectura (`fk_too_high`=42 de los fallos registrados), seguido de lejos por terminos omitidos (4) y exceso de frases (6).
- Dependencia critica de las frases de referencia: sin hechos en el prompt el rendimiento cae al rango 62-66%, y el propio autor lo describe como el comportamiento no fundamentado, mas debil.
- El pass rate depende del juez: con DeepSeek v4.1 flash baja al 47,4% (frente a 67,5% con el juez principal) y el kappa entre jueces es 0,47, lo que indica concordancia solo moderada.
- Sesgo de evaluacion: las preguntas del conjunto de eval provienen del mismo generador que los datos de entrenamiento (temas disjuntos, pero no escritas por humanos) y solo hay una semilla por ejecucion. La generalizacion a preguntas reales de ninos no esta demostrada.
- Ambito muy estrecho: pregunta corta + hechos + curso objetivo, en ingles y en un unico turno. No hay soporte declarado de conversaciones multi-turno, tool calling ni agentes.
- Riesgo de alucinacion heredado del modelo base de 4B, mitigado solo parcialmente por los hechos inyectados; el juez de correccion no garantiza veracidad factual.
- La metrica de legibilidad es Flesch-Kincaid, especifica del ingles; no hay evidencia de comportamiento equivalente en castellano ni en otros idiomas.
- Restriccion de licencia relevante: aunque el adaptador y el base son apache-2.0, los datos de entrenamiento se generaron con un profesor de modelo cerrado (Claude Sonnet); el autor advierte explicitamente de revisar los terminos de ese proveedor antes de un reuso comercial.
- Repositorio practicamente sin traccion (0 descargas, 0 likes) y sin pipeline declarado en HuggingFace; no hay garantia de mantenimiento ni de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DavidSlayback1/grade-level-explainer-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Especificacion de comportamiento (`BEHAVIOR_SPEC.md`): citada en la model card como parte del repositorio del proyecto, pero sin URL publicada en la informacion disponible
- Artefactos de evaluacion (`eval/judged.jsonl`, `eval/manifest.json`): mencionados en la model card, sin URL publicada en la informacion disponible
- Libreria de adaptadores: https://huggingface.co/docs/peft

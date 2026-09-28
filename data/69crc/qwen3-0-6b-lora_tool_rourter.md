# 69crc/Qwen3-0.6B-LoRA_Tool_Rourter

## Resumen

Qwen3-0.6B-LoRA_Tool_Rourter es un clasificador de enrutamiento (router) de 596 049 920 parametros, derivado por destilacion de un profesor de 27B utilizado exclusivamente como router. No es un modelo de chat de proposito general: no genera texto dirigido al usuario, sino exactamente un objeto JSON que selecciona una de tres acciones — `answer`, `call` o `clarify` — a partir del turno del usuario y, opcionalmente, del historial de conversacion o de un campo `available_context`.

El problema que resuelve es concreto: sustituir un clasificador basado en palabras clave dentro de un agente que usa herramientas. El clasificador por palabras clave es rapido pero no tiene concepto de ambiguedad (nunca emite `clarify`) y su reconocimiento de herramientas depende de un vocabulario mantenido a mano. El profesor de 27B es preciso pero caro: cada turno del agente paga varios segundos de latencia de enrutamiento en la misma GPU que sirve la respuesta principal. Este estudiante se situa entre ambos, con unos 0,3 s por turno en Q8_0 sobre `llama-server` y un 83 % o mas de coincidencia con el profesor en una bateria de 943 prompts, frente al 53 % del clasificador por palabras clave.

El modelo se distribuye en dos artefactos: el checkpoint fusionado en safetensors para `transformers` y un GGUF Q8_0 (`student_q8.gguf`) para `llama.cpp`. Esta publicado bajo licencia Apache-2.0, con 1,9 GB de repositorio y sin descargas ni valoraciones registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen3-0.6B), ajustada con LoRA y fusionada en el checkpoint final |
| Parametros totales | 596 049 920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen/Qwen3-0.6B declara 32 768 tokens nativos; no confirmado para este derivado) |
| Tipos de cuantizacion | GGUF Q8_0 (artefacto publicado); el checkpoint safetensors se distribuye sin cuantizar |
| Idiomas soportados | en (ingles), segun la model card; los metadatos de HuggingFace no declaran idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint fusionado) y GGUF (Q8_0) |
| Modelo base | Qwen/Qwen3-0.6B |
| Tarea declarada | zero-shot-classification en los metadatos; text-generation en el frontmatter de la model card |
| Fecha de creacion | 2026-09-27 |
| Tamano del repositorio | 1,9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only denso, y se ajusta mediante LoRA sobre un dataset propio etiquetado como `custom`. La model card no detalla el rango de LoRA, la tasa de aprendizaje, el numero de pasos, el numero de tokens de entrenamiento ni la composicion del conjunto de datos; solo indica que el objetivo es la destilacion desde un profesor de 27B (referido como "Qwen3.8-27B") usado unicamente como router. Los adaptadores se han fusionado en el checkpoint publicado, de modo que el repositorio contiene pesos completos listos para cargar con `transformers`, ademas de la conversion a GGUF Q8_0.

La innovacion funcional no esta en la arquitectura sino en la formulacion de la tarea: la salida esta restringida a tres esquemas JSON con claves disjuntas y excluyentes (`answer` sin `tool`, `args` ni `question`; `call` con `tool` y `args` obligatorios y validables contra el esquema de la herramienta; `clarify` con `question` obligatorio). La model card describe una politica de decision aprendida durante la destilacion, con este orden de prioridad: comprobacion de ambiguedad referencial primero (pronombres sin ligar, fragmentos como "More." o "Try that." producen `clarify`), deteccion de datos en vivo despues (precios, clima, clasificaciones, titulares, "current", "latest", "today"), anulacion de la deteccion de datos en vivo cuando aparece vocabulario biomedico (enfermedades, farmacos, mecanismos de accion, terminos de neuro/psico/onco/cardio/inmuno, que van a `pubmed_search` incluso con modificadores temporales), enrutamiento de operaciones de codigo y ficheros a las herramientas correspondientes, y `answer` para todo lo demas. El conjunto de herramientas contemplado en el entrenamiento es de 18, y el agente padre filtra en inferencia el subconjunto ofrecido segun la categoria de la consulta (biomedicina, codigo, finanzas, escritura de libros, etc.).

## Capacidades

- Clasificacion de intencion en tres acciones con salida JSON estricta: `answer`, `call` (con nombre de herramienta y argumentos) y `clarify` (con pregunta de vuelta).
- Deteccion de ambiguedad referencial: emite `clarify` ante pronombres sin ligar, fragmentos sueltos o referentes no resolubles desde el contexto previo.
- Deteccion de necesidad de datos en vivo: precios, clima, clasificaciones deportivas, cargos publicos, noticias y expresiones como "latest", "current", "today", "when did", "how many".
- Enrutamiento biomedico especializado: cualquier enfermedad, sindrome, farmaco, mecanismo de accion o termino de neuro/psico/onco/cardio/inmuno se dirige a `pubmed_search`, incluso con modificadores temporales ("latest", "recent").
- Enrutamiento de operaciones de codigo y ficheros: `read_file`, `edit_file`, `write_file`, `list_dir`, `search_codebase`, `grep_with_context`, `run_terminal_command`, `list_relevant_files`, `execute_python_code`, `list_relevant_files`.
- Enrutamiento de recuperacion: `brave_search`, `pubmed_search`, `fetch_url_text`, `rag_answer`, `search_knowledge_base`, `search_codebase`.
- Enrutamiento de escritura de libros: `manage_outline`, `manage_characters`, `track_progress`.
- Seleccion restringida al subconjunto de herramientas que el agente padre ofrece en cada consulta, no sobre el registro completo de 18.
- No soporta generacion de texto para el usuario, tool calling en el sentido de emitir la llamada ejecutable completa, razonamiento multi-paso explicito, vision, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Router de un agente que usa herramientas: el modelo sustituye el clasificador por palabras clave y decide en cada turno si responder, invocar una herramienta o pedir aclaracion, con unos 0,3 s por turno en Q8_0 sobre `llama-server`, liberando la GPU principal para el modelo de respuesta.
- Reduccion de coste frente a enrutamiento con un modelo grande: donde antes un profesor de 27B consumia varios segundos de GPU por turno, este estudiante de 596 M parametros ocupa una fraccion minima de memoria y mantiene un 83 % o mas de coincidencia con el profesor en la bateria de 943 prompts.
- Asistentes de investigacion biomedica: cualquier consulta con vocabulario medico se enruta a `pubmed_search` en lugar de a busqueda web generica, lo que evita que expresiones como "latest treatment for X" acaben en una busqueda no cientifica.
- Agentes conversacionales con contexto multi-turno: el modelo emite `clarify` cuando el usuario responde con fragmentos sin referente ("Same one as last time.", "More.", "Try that."), salvo que un turno previo haya nombrado el objeto exacto o este presente en `available_context`.
- Asistentes de programacion integrados en el IDE o en CI/CD: las peticiones de lectura, edicion, escritura de ficheros, listado de directorios, busqueda en el codigo o ejecucion de comandos de shell se enrutan a la herramienta correcta, incluyendo `execute_python_code` para calculo y analisis de datos en contenedor aislado.
- Orquestacion de pipelines RAG: distingue entre responder desde conocimiento propio, consultar la base de conocimiento indexada (`search_knowledge_base`), responder desde un documento local concreto (`rag_answer`) o recuperar el texto de una URL (`fetch_url_text`).
- Agente de escritura de novelas: enruta a `manage_outline`, `manage_characters` y `track_progress` las operaciones de gestion de esquema, fichas de personajes y seguimiento de objetivos de palabras o plazos.
- Filtro de datos en vivo en asistentes financieros o de actualidad: detecta senales de informacion cambiante (precios, resultados, cargos publicos) y evita que el modelo principal responda de memoria con datos obsoletos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion aportado por el autor es una comparacion interna de coincidencia con el profesor.

| Evaluacion | Resultado |
|---|---|
| Coincidencia con el profesor (bateria de 943 prompts) | 83 % o mas |
| Clasificador por palabras clave al que sustituye (misma bateria) | 53 % |
| Latencia por turno en Q8_0 sobre `llama-server` | aproximadamente 0,3 s |
| MMLU, HumanEval, GSM8K y similares | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 el modelo ocupa aproximadamente 1,2 GB de pesos (596 M parametros), por lo que con cache KV y overhead conviene reservar del orden de 1,5 a 2 GB; en GGUF Q8_0 baja a unos 0,6-0,7 GB y en Q4 a unos 0,4 GB.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria es suficiente; no requiere A100, H100 ni RTX 4090. Una RTX 3060, RTX 4060, T4 o incluso una GPU integrada con memoria compartida pueden servirlo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, y tambien en CPU mediante `llama.cpp` gracias al artefacto GGUF Q8_0.
- Opciones de despliegue: `llama.cpp` / `llama-server` con el GGUF Q8_0 (configuracion reportada por el autor), y `transformers` con el checkpoint safetensors fusionado. vLLM, TGI y Ollama no estan confirmados en la informacion disponible, aunque el formato GGUF es compatible con el ecosistema de `llama.cpp`.
- Latencia y throughput: aproximadamente 0,3 s por turno en Q8_0 sobre `llama-server`, segun el autor. No se publican cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 69crc/Qwen3-0.6B-LoRA_Tool_Rourter | 596 049 920 | Router de 3 acciones con salida JSON | no disponible | apache-2.0 | safetensors + GGUF Q8_0 |
| Qwen/Qwen3-0.6B (modelo base) | 0,6 B | Generacion de texto, codigo y matematicas | 32 768 tokens declarados por el modelo base | apache-2.0 | safetensors, multiples formatos en el ecosistema |
| Pelmeshek/qwen3-0.6B-function-calling-lora | 0,6 B (con adaptador LoRA) | Function calling mediante SFT | no disponible | no disponible en la informacion recogida | adaptador LoRA con TRL |
| Clasificador por palabras clave (referencia interna del autor) | no aplica | Enrutamiento por vocabulario | no aplica | no aplica | interno |

La comparacion con modelos de enrutamiento de la misma categoria no esta disponible: el autor no publica comparaciones con otros routers aprendidos, solo con su propio clasificador por palabras clave y con el profesor de 27B.

## Limitaciones y advertencias

- No es un modelo de chat: no genera texto dirigido al usuario y su salida esta restringida a uno de tres objetos JSON. Usarlo como modelo conversacional produce resultados fuera de proposito.
- El registro de herramientas esta cerrado a las 18 definidas durante el entrenamiento. Cualquier herramienta fuera de esa lista no es enrutable y el modelo puede producir nombres de herramienta inexistentes.
- Idiomas: la model card declara unicamente ingles. El comportamiento con entradas en castellano u otros idiomas no esta documentado ni evaluado.
- El 83 % de coincidencia con el profesor implica que aproximadamente uno de cada seis prompts se enruta de forma distinta al profesor, con el consiguiente riesgo de respuestas erroneas o llamadas a herramientas inadecuadas en produccion.
- Riesgo de alucinacion en el campo `tool` o en `args`: al ser un modelo de 0,6 B, la validacion de los argumentos contra el esquema de la herramienta deberia hacerse siempre en el orquestador, nunca confiando en la salida del modelo.
- La model card menciona un profesor "Qwen3.8-27B", denominacion que no corresponde a ningun modelo publicado conocido, por lo que la procedencia exacta de las etiquetas de destilacion no es verificable con la informacion disponible.
- Metadatos contradictorios: los tags de HuggingFace declaran `zero-shot-classification` mientras que el frontmatter de la model card declara `text-generation`; el mismo frontmatter incluye `inference: false` pese a llevar el tag `endpoints_compatible`.
- El nombre del repositorio contiene una errata ("Rourter" en lugar de "Router"), lo que puede complicar su localizacion.
- El repositorio tiene 0 descargas y 0 valoraciones, sin senales de uso en produccion ni de validacion por terceros. Se recomienda evaluarlo contra el conjunto de herramientas y el dominio reales antes de desplegarlo.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de indicar los cambios realizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/69crc/Qwen3-0.6B-LoRA_Tool_Rourter
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Informe tecnico de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Ejemplo de ajuste de tool calling con Qwen3-0.6B y LoRA (tutorial, no es el autor de esta ficha): https://lumienai.com/news/fine-tune-tool-calling-llm-qwen3-lora-xyz-aquila-sft
- Repositorio de ejemplo de ajuste fino con LoRA sobre Qwen3-0.6B: https://github.com/david-franz/llm-fine-tuning-LoRa
- Modelo comparable de function calling sobre el mismo base: https://huggingface.co/Pelmeshek/qwen3-0.6B-function-calling-lora
- Ficha de Qwen3-0.6B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_0_6b

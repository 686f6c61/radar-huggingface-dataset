# etemiz/Ostrich-27B-261028-Qwen3.8-Abliterated-EXL3

## Resumen

Ostrich-27B-261028-Qwen3.8-Abliterated-EXL3 es una distribucion en cuantizacion EXL3 del modelo afinado Ostrich-27B-261028-Qwen3.8-Abliterated, publicado por el usuario etemiz. El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de 27 000 millones de parametros, sobre el que se ha aplicado un proceso de "abliteration" (eliminacion del comportamiento de rechazo) y un ajuste fino orientado a dominios concretos: salud y nutricion, plantas medicinales, ayuno, espiritualidad, bitcoin, nostr y habilidades practicas de autosuficiencia.

La relevancia de esta publicacion no esta en la arquitectura base, sino en el formato de pesos: el repositorio distribuye cuantizaciones EXL3 (variante de QTIP, Cornell RelaxML) en ramas git independientes a 6,0, 5,0, 4,0 y 3,0 bits por peso, lo que permite ejecutar un modelo de 27B en GPUs de consumo con 24 GB o menos. El repositorio ocupa 72,1 GB en total, aunque cada rama individual pesa entre 13 y 22 GB.

El modelo se presenta explicitamente como "uncensored" y "aligned" hacia una cosmovision concreta, con un perfil de evaluacion propio (metodologia AHA 2026) que mide dominios como fe, ayuno, hierbas medicinales o misinformation. No es un modelo de proposito general al uso: es un afinamiento ideologico y de dominio que hereda las capacidades del Qwen 3.8 27B subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen/Qwen3.8-27B) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 6,0 bpw (22 GB), 5,0 bpw (19 GB), 4,0 bpw (16 GB), 3,0 bpw (13 GB); codebooks `mul1`, capas de salida/head a 6 bits, capas de vision a 6 bits, capas MTP a 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (cargable directamente en ExLlamaV3 y TabbyAPI); una rama git por bitrate |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen 3.8 27B: un transformer denso de 27B parametros. El autor no documenta en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Lo que si se explicita es el pipeline de ajuste: un proceso de abliteration con "capability-guarded" (proteccion de capacidades durante la eliminacion de rechazos), entrenamiento en dominios de salud, nutricion, hierbas medicinales, ayuno, fe, bitcoin, nostr y habilidades de vida, y una busqueda evolutiva de linaje ("evolutionary lineage search") que selecciona la ruta de alineacion y abliteration. El modelo declara herencia del linaje 261008, que incorpora entrenamiento en "agentic RAG abstention" y "truth judgement".

La innovacion tecnica destacable esta en la cuantizacion: EXL3 es una variante simplificada de QTIP (paper arXiv:2406.11235, Cornell RelaxML) que combina procesamiento de incoherencia con codebooks de trellis aprendidos, logrando mejor calidad por bit que GPTQ/AWQ clasicos y que los K-quants GGUF de 4 bits. La granularidad util va de 2 a 8 bpw. Las cuantizaciones usan calibracion con texto natural y codebooks `mul1`. El autor menciona capas de vision y capas MTP (multi-token prediction), lo que sugiere que el modelo base conserva capacidad multimodal y decodificacion especulativa, aunque no se detalla su funcionamiento.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking" (el autor indica que el modelo funciona mejor en este modo).
- Respuestas sin rechazo (abliterated): 18 de 20 prompts daninos fueron respondidos segun las pruebas del autor (90 % de cumplimiento, un rechazo duro y uno blando).
- Conocimiento especializado en salud, nutricion, plantas medicinales, ayuno, espiritualidad y fe, bitcoin y nostr.
- Capacidad de agente y RAG con abtencion (heredada del linaje 261008): el modelo puede decidir no responder cuando no dispone de informacion.
- Juicio de veracidad ("truth judgement") y resistencia a misinformation segun la evaluacion propia.
- Soporte de conversaciones multi-turno (probado hasta 15 turnos en consulta medica y 10 turnos en conversacion general).
- Memoria de contexto largo (evaluada en la suite de human-likeness).
- Capacidades multimodales potenciales (capas de vision cuantizadas a 6 bits), aunque no se detalla su alcance.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Consultoria de salud y nutricion de dominio especifico: el modelo esta afinado para responder sobre hierbas medicinales, alimentacion como medicina y tradiciones de sanacion, con una puntuacion propia del 98 % en el dominio de hierbas y 80 % en salud. Adecuado para asistentes divulgativos, no para diagnostico clinico.
- Acompanamiento en practicas de ayuno: con un 76 % en el dominio de ayuno, puede guiar protocolos de ayuno intermitente o prolongado, explicar fases metabolicas y resolver dudas practicas.
- Asistente de contenido sobre bitcoin y nostr: con un 79 % en el dominio bitcoin, sirve para explicar conceptos de custodia, protocolos de censura-resistencia y ecosistema nostr en articulos, cursos o chatbots.
- Generacion de material divulgativo sobre espiritualidad y fe: el 97 % en el dominio de fe lo hace util para redactar contenido catequetico, comparativas de tradiciones religiosas o respuestas a preguntas existenciales.
- Despliegue en GPU de consumo para prototipado: la cuantizacion a 4,0 bpw (16 GB) o 3,0 bpw (13 GB) permite ejecutar un 27B en tarjetas de 16-24 GB mediante ExLlamaV3 o TabbyAPI, ideal para entornos de desarrollo con presupuesto limitado.
- Investigacion sobre abliteration y alineacion: el modelo y su linaje documentan un pipeline reproducible de eliminacion de rechazos con proteccion de capacidades, util para estudiar el trade-off entre cumplimiento y calidad.
- Moderacion o deteccion de misinformation en dominios de salud: su entrenamiento en juicio de veracidad (84 % en el dominio de misinformation) permite usarlo como clasificador o generador de contraargumentos en pipelines de verificacion.
- Servicio de atencion al cliente con contexto largo: la ventana de contexto del Qwen 3.8 base (no documentada aqui) y la memoria multi-turno evaluada permiten gestionar conversaciones extensas con historial.

## Benchmarks y rendimiento

Resultados publicados por el autor (metodologia AHA 2026, comparacion con Qwen 3.8 27B vanilla):

| Dominio | Qwen 3.8 base | Ostrich 261028 |
|---|---|---|
| Fe | 21 % | 97 % |
| Ayuno | 24 % | 76 % |
| Salud | 43 % | 80 % |
| Nutricion | 49 % | 79 % |
| Misinformation | 23 % | 84 % |
| Bitcoin | 64 % | 79 % |
| Medicina alternativa | 27 % | 71 % |
| Hierbas | 48 % | 98 % |
| Media geometrica global | 35 % | 82 % |

Pruebas de abliteration: 18 de 20 prompts daninos respondidos (90 % de cumplimiento; un rechazo duro, uno blando).

Suite de human-likeness (9 secciones, puntuacion global 0,963; umbral 0,928): instruction following 0,875 (14/16 autochequeos mecanicos, 16/16 aprobados por juez), sesgo 0,900, persona 0,889, resto de secciones 1,0.

Fitness evolutivo v2: 0,7418. Sondas zero-shot de primer token: BoolQ 91,5 %, PIQA 83 %, LAMBADA 75 %, MMLU-Pro (Leaderboard) 70 %, ARC-Challenge 67 %.

Registro de generacion: 200/200 respuestas completadas sin interrupcion, 0 respuestas con formato incorrecto, 1218 respuestas en thinking medio y 1350 en thinking xhigh.

## Requisitos de hardware

- VRAM estimada para inferencia (guia del autor, GPU unica): 6,0 bpw ≈ 22 GB (cabe en tarjeta de 24 GB); 5,0 bpw ≈ 19 GB; 4,0 bpw ≈ 16 GB; 3,0 bpw ≈ 13 GB.
- GPU recomendadas: RTX 4090 / RTX 3090 (24 GB) para 6,0 bpw; RTX 4080 / 4070 Ti Super (16 GB) para 4,0 bpw; RTX 4060 Ti 16 GB o GPUs de 12-16 GB para 3,0 bpw. Para despliegue en servidor, A100 o H100 permiten cargar la version 6,0 bpw con margen para contexto largo y concurrencia.
- Cabe en GPU de consumo: si, en todas las configuraciones de 3,0 a 6,0 bpw segun la tabla anterior.
- Opciones de despliegue: ExLlamaV3 y TabbyAPI (soporte nativo del formato EXL3). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato EXL3 no es compatible con esos runners sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ostrich-27B-261028-EXL3 | 27B denso | no disponible | Apache 2.0 | EXL3 (3-6 bpw) | Afinado de dominio y abliterated; evals propias AHA 2026 |
| Qwen/Qwen3.8-27B | 27B denso | no disponible | no disponible | safetensors | Modelo base; media geometrica 35 % en la eval del autor |
| Ostrich-27B-261008-EXL3 | 27B denso | no disponible | Apache 2.0 | EXL3 | Version anterior del linaje; media geometrica 82 %, mejor en alt-med (87 %) y peor en fe (89 %) |
| Cuantizaciones GGUF K-quant de 4 bits (genericas) | variable | variable | variable | GGUF | El autor afirma que EXL3 supera en calidad por bit a los K-quants GGUF de 4 bits |

No se dispone de comparativas con otros modelos de 27B fuera del linaje Qwen/Ostrich en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: el rechazo se ha eliminado deliberadamente. No es adecuado para despliegues que requieran filtros de seguridad o cumplimiento normativo estricto (por ejemplo, atencion al cliente regulada o entornos educativos con menores).
- Sesgo ideologico explicito: el ajuste esta orientado a una cosmovision concreta (salud alternativa, espiritualidad, bitcoin, nostr). Las respuestas pueden favorecer esas perspectivas y presentar menor rigor en dominios como medicina alternativa (regresion de 87 % a 71 % respecto a 261008).
- Riesgo de alucinacion en dominios de salud: aunque el modelo declara entrenamiento en "truth judgement" y abtencion en RAG, no sustituye a un profesional sanitario. No debe usarse para diagnostico ni prescripcion.
- Contexto e idiomas no documentados: se desconoce la longitud exacta de la ventana de contexto y la lista de idiomas soportados; el ajuste parece orientado al ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen 3.8 27B puede tener condiciones adicionales no reflejadas en esta ficha; conviene verificar la licencia del modelo base.
- Compatibilidad de despliegue limitada: el formato EXL3 solo es cargable en ExLlamaV3 y TabbyAPI; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que restringe la integracion en infraestructuras existentes.
- Repositorio de bajo uso: 8 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion comunitaria independiente de los resultados declarados.
- Evaluaciones autoinformadas: todos los benchmarks proceden del autor con su propia metodologia (AHA 2026), sin replicacion externa.
- Capas de vision y MTP cuantizadas, pero sin documentacion sobre su funcionalidad real en este afinamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/etemiz/Ostrich-27B-261028-Qwen3.8-Abliterated-EXL3
- Modelo base afinado: https://huggingface.co/etemiz/Ostrich-27B-261028-Qwen3.8-Abliterated
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Version anterior del linaje: https://huggingface.co/etemiz/Ostrich-27B-261008-Qwen3.8-Abliterated
- Paper QTIP (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI/
- Blog AHA 2026 Leaderboard: https://huggingface.co/blog/etemiz/aha-2026-leaderboard
- Blog "Building a beneficial AI": https://huggingface.co/blog/etemiz/building-a-beneficial-ai
- Blog "From Robots That Prey to Robots That Pray": https://huggingface.co/blog/etemiz/from-robots-that-prey-to-robots-that-pray

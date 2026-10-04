# OliviaRossi/Gemma-4-Chat-Template-Tri-Craft-Harness

## Resumen

El repositorio `OliviaRossi/Gemma-4-Chat-Template-Tri-Craft-Harness` no es un modelo de lenguaje, sino un harness de plantilla de chat (chat template) escrito en Jinja2/Minja que se instala sobre checkpoints de la familia Google Gemma 4 (2B, 9B, 27B, 34B y derivados ajustados por instrucciones). Su función es reescribir el ensamblado del prompt para dirigir simultáneamente tres disciplinas: ingeniería de software agéntica, diseño de interfaz UI/UX y redacción literaria de microcopy.

La versión publicada es la v9.0, denominada "Unified Synthesis Edition". El autor plantea dos problemas concretos que la plantilla pretende resolver: la degradación de fidelidad en bucles de tool calling a partir del tercer turno y la invalidación de la caché de prefijo KV en motores de alta concurrencia. Para lo primero aplica un "protocolo anti-degradación"; para lo segundo separa el turno de sistema en una cabeza invariante estática y una cola volátil, de modo que el hash de tokens de la parte estática sea idéntico entre sesiones.

Es relevante ahora porque Gemma 4 introduce tokens de control nuevos (`system`, `user`, `model`) y variantes con canal de razonamiento, y porque los motores de inferencia habituales (vLLM con Automatic Prefix Caching, SGLang con RadixAttention, llama.cpp con `--cache-prompt`) dependen de coincidencias de prefijo byte a byte. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y declara licencia Apache 2.0 y soporte únicamente de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal: plantilla de prompt Jinja2/Minja (chat template) para checkpoints Gemma 4 |
| Parametros totales | No aplicable (el repositorio no contiene pesos) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible (la fija el checkpoint destino; el repositorio no la declara) |
| Tipos de cuantizacion | No aplicable al repositorio; depende del checkpoint destino (GGUF para llama.cpp, safetensors/cuantizaciones para vLLM, SGLang y Transformers) |
| Idiomas soportados | Ingles (segun la model card: `language: en`) |
| Licencia | Apache 2.0 (aplicable al harness; los pesos de Gemma 4 se rigen por sus propios terminos) |
| Formato de pesos | No disponible / no contiene pesos; el artefacto son ficheros de plantilla Jinja2/Minja |
| Modelos destino | Gemma 4 en 2B, 9B, 27B, 34B y checkpoints derivados ajustados por instrucciones |
| Motores compatibles | llama.cpp, vLLM, SGLang, Transformers |
| Modos de operacion | `mode="tri"` (tri-craft) y modos especificos por superficie de ejecucion |
| Version | v9.0 (Unified Synthesis Edition) |
| Fecha de creacion / actualizacion | 2026-08-28 / 2026-10-04 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

No hay entrenamiento ni arquitectura de red que describir: el artefacto es una plantilla de prompt. Su "arquitectura" es la particion topologica del turno de sistema en dos zonas fisicas. La primera es la cabeza invariante estatica, que agrupa reglas operativas, definiciones de craft gravity, estandares de ingenieria, tokens de UI, guias de prosa y plantillas de ritmo cognitivo; produce el mismo hash de tokens en todas las sesiones que usan el mismo modo. La segunda es la cola volatil, que agrupa el reloj del motor (`Current date: ...`), el bloque `<workspace>` con estado autoritativo y tokens, el bloque `<context>` con canon, persona y guia de estilo, las sobrescrituras de sistema del usuario y las declaraciones de herramientas entre `<|tool>` y `<tool|>`. El orden se cierra con `<|turn>system` ... `<turn|>`.

El segundo pilar es la adaptacion de craft gravity: la plantilla no inyecta componentes de UI en todos los prompts, sino que reasigna el peso de cada disciplina segun la superficie. En web y UI nativa prioriza diseno, con cobertura de ocho estados (default, hover, focus-visible, active, disabled, loading, empty, error), tokens semánticos y OKLCH, tipografia con `clamp()` y HTML5 semántico. En CLI y herramientas de terminal prioriza codigo. Tambien contempla APIs de backend y documentacion tecnica como superficies diferenciadas. El tercer pilar es un motor de serializacion de JSON Schema con desreferenciacion recursiva hasta profundidad 8, que cubre `$defs` anidados, arrays de tuplas (`prefixItems`) y `patternProperties` sin "quote explosion". El cuarto es un protocolo cognitivo de tres niveles que formaliza `<|channel>thought` en tres etapas: triaje y gravedad, arquitectura y secuencia de herramientas, y auditoria de fidelidad.

## Capacidades

- Ensamblado determinista de prompts para checkpoints Gemma 4, con separacion entre segmento invariante y segmento volatil.
- Soporte de tool calling y de bucles multi-turno con herramientas, con un protocolo orientado a mantener la fidelidad de formato a partir del tercer turno.
- Serializacion de esquemas JSON con desreferenciacion recursiva hasta profundidad 8, soporte de `$defs` anidados, `prefixItems` y `patternProperties`.
- Canal de razonamiento estructurado mediante `<|channel>thought` con tres etapas explicitas de planificacion y auditoria.
- Modo tri-craft: combinacion de ingenieria de software, diseno UI/UX y redaccion en una misma generacion.
- Especializacion por superficie: web y UI nativa, CLI y terminal, APIs de backend y documentacion tecnica.
- Generacion de interfaces con cobertura de ocho estados interactivos, tokens de color OKLCH y tipografia fluida con `clamp()`.
- Optimizacion de caché de prefijo KV orientada a vLLM Automatic Prefix Caching, SGLang RadixAttention y llama.cpp `--cache-prompt`.
- Escritura creativa y microcopy orientado a claridad y tono humano.
- Soporte de bloques de contexto externos (`<workspace>`, `<context>`) para inyectar estado de proyecto, canon o guia de estilo.
- Capacidades multilingues: no declaradas; el repositorio indica unicamente ingles.
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de codigo con bucles largos de herramientas: la plantilla mantiene el formato de las llamadas y la estructura de las respuestas a lo largo de varios turnos, lo que reduce la degradacion tipica de plantillas genericas cuando el agente encadena busquedas, ediciones y ejecuciones de tests.
- Servidores de inferencia con alta concurrencia: al colocar las instrucciones estables en la cabeza del prefijo y los datos volatiles en la cola, las peticiones que comparten modo reutilizan la caché de prefijo en vLLM, SGLang o llama.cpp y reducen el tiempo hasta el primer token.
- Generacion de componentes de interfaz en produccion: el modo de gravedad web fuerza cobertura de estados interactivos, tokens semanticos y HTML5 semantico, util para equipos que necesitan maquetacion consistente generada por el modelo.
- Asistentes de terminal y herramientas CLI: la plantilla reasigna el peso hacia codigo y evita que el modelo devuelva HTML o CSS no solicitado, algo util en generacion de scripts, parseo de argumentos y utilidades de sistema.
- Generacion de APIs de backend con esquemas estrictos: el motor de JSON Schema permite pedir al modelo salidas estructuradas con tipos anidados, validadas contra un contrato, para integrarlas en pipelines de datos o en capas de servicio.
- Redaccion de microcopy y textos de producto: el modulo de prosa trabaja mensajes de error, estados vacios, textos de carga y avisos, buscando un tono humano y consistente con la guia de estilo inyectada en `<context>`.
- Documentacion tecnica asistida: el harness diferencia la superficie de documentacion, de modo que las respuestas priorizan estructura explicativa y ejemplos verificables en lugar de codigo ejecutable sin contexto.
- Prototipado de producto full-stack: al combinar las tres disciplinas en un unico modo, un mismo agente puede entregar esquema de datos, componente de interfaz y textos de acompañamiento en una sola sesion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos numericos de rendimiento encontrados en la busqueda web corresponden a la plantilla oficial de Gemma, no a este harness: una discusion de Unsloth sobre `gemma-4-12b-it` menciona que la actualizacion de la plantilla oficial de chat incremento la precision de llamadas a herramientas hasta un 10 por ciento en algunos benchmarks. No hay cifras atribuidas al Tri-Craft Harness ni comparativas publicadas por el autor.

## Requisitos de hardware

- El harness en si no consume VRAM: es una plantilla de texto que se ejecuta en el tokenizador y en el motor de inferencia. Los requisitos dependen exclusivamente del checkpoint Gemma 4 que se sirva.
- Estimacion aritmetica orientativa segun el tamano declarado en la model card (no publicada por el autor, calculada a partir del numero de parametros): un checkpoint de 2B en FP16 ocupa aproximadamente 4 GB de pesos; uno de 9B, unos 18 GB; uno de 27B, unos 54 GB; y uno de 34B, unos 68 GB. A estos valores hay que sumar el coste de la caché KV, que crece con la longitud de contexto y la concurrencia.
- GPU recomendadas por tamano, como referencia general de despliegue: los checkpoints pequenos caben en GPU de consumo tipo RTX 4090 (24 GB) en cuantizaciones de 4 y 8 bits; los tamanos medios y grandes requieren A100 (40/80 GB), H100 o configuraciones multi-GPU.
- Despliegue en consumer GPU: viable para los tamanos menores con cuantizacion GGUF de 4 bits mediante llama.cpp u Ollama; no viable en una sola GPU de consumo para los tamanos de 27B y 34B sin cuantizacion agresiva.
- Opciones de despliegue soportadas por el diseno del harness: vLLM (con Automatic Prefix Caching), SGLang (con RadixAttention), llama.cpp (con `--cache-prompt`) y Transformers. La busqueda web anade OpenWebUI como interfaz donde se han reportado problemas con plantillas que no gestionan bien los canales de razonamiento.
- Latencia y throughput: no disponibles. El beneficio esperado por la invariancia de prefijo es una reduccion del tiempo hasta el primer token en peticiones repetidas con el mismo modo, pero no hay mediciones publicadas en la informacion disponible.
- Nota de alcance: la model card lista tamanos 2B, 9B, 27B y 34B, mientras que la busqueda web menciona un checkpoint `gemma-4-12b-it`. Esa discrepancia no esta resuelta en la informacion disponible.

## Comparativa con modelos similares

Este repositorio no es un modelo, por lo que no admite comparacion por parametros o contexto. La comparacion relevante es entre plantillas de prompt para Gemma 4.

| Criterio | Tri-Craft Harness v9.0 | Plantilla oficial de Gemma 4 | Plantillas alternativas de la comunidad |
|---|---|---|---|
| Naturaleza | Plantilla Jinja2/Minja con capas de disciplina | Plantilla de referencia del proveedor | Adaptaciones de la plantilla oficial |
| Tokens de control | Usa el formato canonico de Gemma 4 (`system`, `user`, `model`, `<|tool>`, `<|channel>thought`) | Define y reserva los tokens de control de Gemma 4 | Depende de la implementacion |
| Invariancia de prefijo KV | Si, con particion explicita entre cabeza estatica y cola volatil | No declarada | No declarada en la informacion disponible |
| Protocolo de razonamiento | Tres etapas formalizadas en `<|channel>thought` | Canal de razonamiento soportado por el modelo | Variable |
| Serializacion JSON Schema | Desreferenciacion recursiva hasta profundidad 8, `prefixItems`, `patternProperties` | No detallada en la informacion disponible | No disponible |
| Especializacion por superficie | Web/UI nativa, CLI, APIs backend y documentacion tecnica | No declarada | No disponible |
| Licencia | Apache 2.0 | Sujeta a los terminos de Gemma | Variable |
| Mantenimiento | Repositorio individual, 0 descargas, 1 like | Mantenido por Google DeepMind | Variable |
| Motores verificados | llama.cpp, vLLM, SGLang, Transformers | Depende del servidor de inferencia | Ejemplo documentado con llama.cpp y OpenWebUI |

## Limitaciones y advertencias

- No es un modelo: instalar esta plantilla no aporta capacidades nuevas por si misma. Todo el rendimiento depende del checkpoint Gemma 4 subyacente y de su ajuste por instrucciones.
- Ausencia total de evaluacion publicada: no hay benchmarks, ablaciones ni mediciones de latencia atribuidas al harness en la informacion disponible, pese a que la model card afirma mejoras cualitativas.
- Cero descargas y un unico like: no hay evidencia de uso en produccion ni de validacion independiente de las afirmaciones de la model card. El repositorio es de un autor individual (`OliviaRossi`), no de Google DeepMind.
- Afirmaciones no verificables: expresiones como "fidelidad de tool-loop" o "100 por ciento de invariancia de prefijo" son del autor y no van acompañadas de metodologia ni de codigo de evaluacion.
- Idioma: el repositorio declara soporte unicamente en ingles, lo que limita su uso directo en castellano sin adaptar las instrucciones y los modulos de prosa.
- Riesgo de alucinacion: la plantilla no incorpora ningun mecanismo de verificacion factual; el microcopy y la documentacion tecnica generados pueden contener afirmaciones falsas con apariencia plausible.
- Compatibilidad fragil por naturaleza: al ser una plantilla, cualquier cambio en el formato de tokens de Gemma 4, en el tokenizador o en el soporte de Minja del motor puede romperla silenciosamente.
- Acoplamiento a version: la ficha de HuggingFace no publica una tabla de compatibilidad con versiones concretas de vLLM, SGLang, llama.cpp o Transformers, lo que complica reproducir el comportamiento descrito.
- Licencia: el harness es Apache 2.0, pero los pesos de Gemma 4 se rigen por sus propios terminos de uso. Para explotacion comercial hay que revisar la licencia del checkpoint concreto, no solo la de este repositorio.
- Interaccion con interfaces: se ha documentado en la comunidad que las plantillas que no gestionan correctamente los canales de razonamiento pueden filtrar marcadores de pensamiento en la salida final en combinaciones como llama.cpp sobre OpenWebUI. Conviene validar la salida antes de exponerla a usuarios.
- Discrepancia de tamanos: la model card cita 2B, 9B, 27B y 34B, mientras que otras fuentes de la busqueda mencionan un checkpoint de 12B. No hay confirmacion de cual es la lista definitiva.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OliviaRossi/Gemma-4-Chat-Template-Tri-Craft-Harness
- Plantilla Gemma 4 para llama.cpp y OpenWebUI (GitHub): https://github.com/asf0/gemma4_jinja
- Pagina oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Formato de prompt de Gemma 4 en Google AI for Developers: https://ai.google.dev/gemma/docs/core/prompt-formatting-gemma4
- Discusion de Unsloth sobre `gemma-4-12b-it` y la plantilla oficial de chat: https://huggingface.co/unsloth/gemma-4-12b-it/discussions/1
- Sitio divulgativo sobre Gemma 4: https://gemma4.com/
- vLLM (Automatic Prefix Caching): https://github.com/vllm-project/vllm
- SGLang (RadixAttention): https://github.com/sgl-project/sglang
- llama.cpp (`--cache-prompt`): https://github.com/ggml-org/llama.cpp

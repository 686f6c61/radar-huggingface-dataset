# DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF

## Resumen

Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF es una cuantizacion GGUF de un modelo denso de 40 000 millones de parametros derivado del Qwen 3.6 de 27B, desarrollado por DavidAU. El modelo parte de una expansion arquitectonica del Qwen 3.6 27B hasta 39 072 596 736 parametros (96 capas, 1275 tensores, un 50 % mas que el modelo base), seguida de un proceso de "abliteration" via Heretic (eliminacion de rechazos y censura), un ajuste fino multietapa con Unsloth sobre datasets propios (Deckard/PkDick) y, finalmente, una destilacion del dataset de razonamiento de Claude 4.6 Opus High Reasoning.

El objetivo del autor es combinar capacidad de razonamiento (herencia del dataset de Claude Opus), creatividad y escritura de ficcion (datasets Deckard), codigo (los cuantizados NEO-CODE) y ausencia de filtros de seguridad. La ficha corresponde especificamente a los cuantizados GGUF "NEO-CODE-Di-IMatrix-MAX", construidos con dos datasets imatrix combinados y ajustes de tensores medidos por benchmarks, con el fin de preservar calidad en contexto largo, conversaciones multiples, codigo y matematicas.

Es relevante ahora por su elevada adopcion (mas de 102 000 descargas y 810 likes), por su ventana de contexto de 256K y por su enfoque en casos de uso creativos y de rol sin restricciones, un nicho muy demandado en la comunidad open source. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE), expandido desde Qwen 3.6 27B; 96 capas, 1275 tensores |
| Parametros totales | 39 072 596 736 (~40B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (segun model card) |
| Tipos de cuantizacion | GGUF: IQ2_M, IQ4_XS, Q6, Q8_0 (entre otros; "NEO-CODE-Di-IMatrix-MAX") |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 259,9 GB); modelo base en bfloat16 |
| Pipeline | image-text-to-text |
| Dataset de entrenamiento | TeichAI/claude-4.5-opus-high-reasoning-250x; DavidAU/PkDick-Deckard-5-Datasets |
| Modelo base | DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking |
| Fecha de creacion | 2026-05-01 |
| Ultima actualizacion | 2026-11-09 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 40B construido mediante expansion de parametros a partir del Qwen 3.6 27B: pasa de la arquitectura original a 96 capas y 1275 tensores, lo que supone un 50 % mas de tensores que el modelo base. El pipeline de entrenamiento descrito por el autor es secuencial: primero se aplica "abliteration" con Heretic para eliminar los comportamientos de rechazo; despues se ajusta con Unsloth sobre cinco datasets internos (Deckard/PkDick) orientados a caracter, inteligencia, profundidad, observacion y punto de vista; a continuacion se expande a 40B ("room to think"); y por ultimo se vuelve a entrenar con Unsloth sobre el dataset de destilacion de Claude 4.6 Opus para acortar y estabilizar el razonamiento.

Una innovacion destacable es el razonamiento de longitud variable: el modelo genera cadenas de pensamiento mas cortas para problemas simples y mas largas para los complejos. Los cuantizados de esta ficha usan una tecnica propia ("NEO-CODE-Di-IMatrix-MAX") que combina dos datasets imatrix (estadisticas crudas de ambos, fusionadas) y ajustes de tensores medidos con benchmarks, con el objetivo de preservar precision en contexto largo, conversaciones multi-turno, codigo y matematicas. El autor reporta que IQ4_XS alcanza el 94 % de la precision de bf16, Q6 el 97 % y Q8_0 el 98,4 %, mientras que IQ2_M se queda en el 83-84 %.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" de longitud variable (cadenas mas cortas o largas segun la complejidad).
- Escritura creativa y de ficcion: generacion de tramas, subtramas, escenas, continuacion de escenas, storytelling y prosa vivida en todos los generos (ciencia ficcion, romance, etc.).
- Roleplaying y conversacion multi-turno con contexto de hasta 256K tokens.
- Generacion de codigo y resolucion de problemas matematicos (los cuantizados NEO-CODE estan optimizados explicitamente para codigo y matematicas).
- Capacidad multimodal declarada por el pipeline image-text-to-text (entrada de imagen y texto), aunque la model card no detalla el modulo de vision.
- Multilinguee limitado a ingles y chino.
- Sin censura ni filtros de rechazo (uncensored/abliterated): responde a peticiones NSFW si se le solicitan.
- No se documenta soporte explicito de tool calling, function calling ni uso como agente multi-paso en la informacion disponible.

## Casos de uso

- Escritura de ficcion asistida: el modelo puede generar tramas, subtramas y continuaciones de escenas coherentes con un contexto de 256K tokens, lo que permite mantener consistencia en novelas largas y sagas con decenas de capitulos.
- Roleplaying y narrativa interactiva: su entrenamiento en caracter y su ausencia de filtros lo hacen adecuado para personajes con personalidad marcada y conversaciones multi-turno prolongadas sin degradacion.
- Generacion de codigo en local: los cuantizados NEO-CODE estan optimizados para codigo y matematicas; con Q6 o Q8_0 puede integrarse en flujos de autocompletado o generacion de funciones en entornos sin conexion.
- Razonamiento paso a paso en problemas complejos: el modo thinking variable permite usarlo para analisis tecnico, planificacion o resolucion de problemas matematicos donde se necesita una cadena de razonamiento explicita.
- Analisis de documentos largos: con 256K de contexto puede resumir o extraer informacion de contratos, informes o libros completos en una sola pasada.
- Prototipado de asistentes sin restricciones: para investigacion sobre seguridad, red teaming o estudio de comportamientos de modelos sin alineacion, en entornos controlados.
- Generacion de contenido creativo en ingles y chino: marketing, guiones, dialogos y material editorial en ambos idiomas.

## Benchmarks y rendimiento

El autor afirma que el modelo supera al modelo base en 6 de 7 benchmarks y que los cuantizados alcanzan los siguientes porcentajes de precision respecto a bf16:

| Cuantizacion | Precision respecto a bf16 |
|---|---|
| IQ2_M | 83-84 % |
| IQ4_XS | 94 % |
| Q6 | 97 % |
| Q8_0 HIGH | 98,4 % |

No se han publicado en la informacion disponible resultados numericos de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC-C) para este modelo concreto. El autor remite a la pestana "community" y a repositorios adicionales para pruebas de terceros, pero no se incluyen cifras en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia (40B denso): IQ2_M ~12-14 GB; IQ4_XS ~22-24 GB; Q6 ~32-34 GB; Q8_0 ~42-44 GB (estimaciones segun el numero de parametros y bits por peso; no confirmadas en la model card).
- GPU recomendadas: A100 80GB o H100 para Q8_0 y contexto largo; RTX 4090 (24 GB) para IQ4_XS; RTX 3090/4090 o equivalentes para IQ2_M.
- Cabe en GPU de consumo: si, en IQ2_M e IQ4_XS con GPUs de 16-24 GB; Q6 y Q8_0 requieren 32 GB o mas (A100, H100, o configuraciones multi-GPU).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic (este) | 40B denso | 256K | Apache 2.0 | Sin censura, orientado a ficcion y codigo, GGUF optimizado |
| Qwen 3.6 27B (base) | 27B denso | no disponible | Apache 2.0 | Modelo original sin expansion ni abliteration |
| Qwen3.6-27B-Fable-Fusion-711 (DavidAU) | 27B denso | no disponible | Apache 2.0 | Variante del mismo autor, 2200+ likes y 3M+ descargas |
| Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor (DavidAU) | 40B denso | no disponible | Apache 2.0 | Version "expanded" y de mayor IQ del mismo modelo base |

No se dispone de datos de benchmarks comparativos verificados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura (abliterated/heretic): puede generar contenido NSFW, ofensivo o inapropiado; no es apto para despliegues publicos sin moderacion adicional.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar hechos, especialmente en contexto largo; no se han publicado evaluaciones de factualidad.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La expansion de 27B a 40B y el ajuste fino sobre datasets propios no han sido validados de forma independiente con benchmarks estandar en la informacion disponible.
- El pipeline declarado es image-text-to-text, pero la model card no detalla el modulo de vision ni su calidad; conviene verificar antes de usarlo en tareas multimodales.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede incumplir politicas de plataformas o normativa local; la responsabilidad recae en el desplegador.
- El repo GGUF ocupa 259,9 GB; el almacenamiento y la gestion de versiones requieren planificacion.
- No se documenta soporte de tool calling ni de agentes; para pipelines con function calling conviene validar manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Variante Fable-Fusion-711 (27B): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Variante Fable-Fusion-6-Core-Deckard-Eleanor (40B): https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset de destilacion: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset Deckard: https://huggingface.co/datasets/DavidAU/PkDick-Deckard-5-Datasets
- FAQs y soporte del autor: https://huggingface.co/DavidAU/support

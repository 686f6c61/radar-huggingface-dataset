# GLASSEYE/vector-bbp-v1-gguf

## Resumen

VECTOR BBP/VDP Analyst es un modelo de lenguaje de aproximadamente 7.250 millones de parametros, publicado por el usuario GLASSEYE en Hugging Face bajo el identificador `GLASSEYE/vector-bbp-v1-gguf`. Segun su model card, se trata de un modelo ajustado para tareas de bug bounty (BBP), vulnerability disclosure programs (VDP) y pentesting autorizado, distribuido exclusivamente en formato GGUF con cuantizacion Q4_K_M y pensado para ejecutarse en local mediante Ollama con el comando `ollama run vector`.

El problema que aborda es la asistencia conversacional en flujos de trabajo de divulgacion de vulnerabilidades: redaccion y analisis de informes, interpretacion de alcances (scope) de programas y apoyo metodologico. Su utilidad practica esta limitada por la escasez de informacion publicada: la model card es de cuatro lineas y no documenta arquitectura, contexto, datos de entrenamiento ni modelo base, por lo que no es posible verificar su procedencia ni su calidad real.

La relevancia de la ficha es, en consecuencia, mas informativa que promocional: el repositorio acumula cero descargas y cero likes en el momento de la consulta, la fecha de creacion registrada (2026-09-18) es posterior a la fecha actual de referencia, y la unica advertencia explicita del autor es "Authorized BBP/VDP/pentest only. Never invent program IDs", lo que sugiere un riesgo conocido de alucinacion de identificadores de programas. Cualquier evaluacion de produccion deberia partir de una validacion empirica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `gguf` y el pipeline `conversational` apuntan a un transformer decoder-only, sin confirmacion del autor) |
| Parametros totales | 7.248.023.552 (7,25 B), dato de safetensors |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unico formato publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (la model card esta en ingles; no se declara cobertura multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 4,4 GB) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el modelo base, el numero de tokens de entrenamiento, la composicion del dataset ni el metodo de alineacion (SFT, RLHF o DPO). El unico dato objetivo es el recuento de parametros de safetensors (7.248.023.552) y el tamano del repositorio (4,4 GB), coherente con un unico archivo GGUF en Q4_K_M. Los tags declarados (`vector`, `bug-bounty`, `hackerone`, `bbp`, `vdp`, `endpoints_compatible`, `region:us`, `conversational`) describen el dominio funcional y la compatibilidad con endpoints, no detalles tecnicos de construccion.

La ausencia del campo `base_model` impide determinar si se trata de un ajuste fino sobre un modelo abierto conocido (por ejemplo, un transformer denso de la familia Llama, Mistral o Qwen en el rango de 7-8 B) o de un entrenamiento desde cero. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal, GQA o ventanas de contexto extendidas. En consecuencia, cualquier afirmacion sobre su arquitectura seria especulativa.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a triaje y redaccion de hallazgos de seguridad.
- Asistencia en flujos de bug bounty y VDP: interpretacion de alcances, estructura de informes y clasificacion de severidad (segun la descripcion del autor).
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: no disponibles (no declaradas).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision o audio: no disponibles.
- Capacidad diferencial declarada: ninguna documentada mas alla del ajuste al dominio BBP/VDP.

## Casos de uso

- Triaje inicial de reportes de vulnerabilidad: el modelo puede resumir y clasificar informes entrantes de una cola de VDP, extrayendo activo afectado, vector de ataque y severidad propuesta para priorizar la revision humana.
- Redaccion asistida de informes para HackerOne: ayuda a estructurar secciones de resumen, pasos de reproduccion, impacto y remediacion sugerida, manteniendo un formato consistente entre analistas.
- Revision de alcance de programas (scope): dado un borrador de hallazgo, el modelo puede senalar si el activo descrito parece dentro o fuera del alcance declarado, como primera pasada antes de la validacion del triager.
- Formacion de analistas junior: entorno local de practica para explicar tecnicas de reconocimiento, clases de vulnerabilidad y criterios de explotabilidad sin enviar datos a servicios externos.
- Generacion de checklists de pentest: produccion de listas de comprobacion por tecnologia (API REST, panel de administracion, autenticacion) a partir de una descripcion textual del objetivo autorizado.
- Normalizacion de notas de campo: conversion de apuntes desordenados de una sesion de pruebas en un borrador estructurado y trazable, ejecutado en local sobre el portatil del consultor.
- Clasificacion de CWE y severidad CVSS: sugerencia de categoria CWE y vector CVSS preliminar que el analista humano debe verificar y corregir.
- Despliegue en entornos con requisitos de confidencialidad: al ejecutarse con Ollama en hardware local, permite procesar detalles de vulnerabilidades no divulgadas sin transmitirlos a APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de seguridad (por ejemplo, CTF, Cybench o similares) en la model card ni en los resultados de busqueda. Cualquier cifra de rendimiento atribuida a este modelo careceria de respaldo verificable.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 4,4 GB de pesos mas el cache KV; en la practica, entre 5,5 y 7 GB con contextos moderados, y mas si se amplia la ventana (la longitud de contexto no esta documentada).
- VRAM estimada en otras precisiones (calculada a partir del recuento de parametros, no publicada por el autor): Q8_0 en torno a 7,7-8,5 GB; FP16 en torno a 14,5-16 GB.
- GPU consumer compatibles: si, en el rango de 8-16 GB de VRAM. Cabria en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080 y RTX 4090. En GPUs de 6-8 GB (RTX 3050, RTX 4060 de 8 GB) es ajustado y dependera del contexto configurado.
- GPU de centro de datos: A100, H100, L40S y A10G sobran para un modelo de 7,25 B; se usarian solo por agregacion de carga, no por necesidad de memoria.
- Opciones de despliegue: Ollama (mencionado explicitamente en la model card con `ollama run vector`), llama.cpp, llama-cpp-python, LM Studio y otros runners que consuman GGUF. El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints, aunque no se detalla configuracion. vLLM y TGI tienen soporte limitado o nulo para GGUF de este tipo sin conversion previa.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia de primera token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos provienen de sus fichas publicas; los de `vector-bbp-v1-gguf`, de la informacion disponible en su repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| GLASSEYE/vector-bbp-v1-gguf | 7,25 B (dato de safetensors) | no disponible | Apache 2.0 | Solo GGUF Q4_K_M; 0 descargas, 0 likes | Bug bounty / VDP / pentest |
| Qwen2.5 7B Instruct | 7,6 B | 128 k tokens (segun documentacion publica) | Apache 2.0 | Safetensors, GGUF, AWQ, GPTQ | Proposito general |
| Mistral 7B Instruct | 7,3 B | 32 k tokens (segun documentacion publica) | Apache 2.0 | Safetensors, GGUF | Proposito general |
| Llama 3.1 8B Instruct | 8,03 B | 128 k tokens (segun documentacion publica) | Licencia comunitaria de Llama 3.1 | Safetensors, GGUF | Proposito general |

La diferencia relevante no es de tamano sino de trazabilidad: los tres modelos de referencia publican arquitectura, datos de entrenamiento y evaluaciones, mientras que `vector-bbp-v1-gguf` no publica ninguno de esos tres elementos y carece por completo de validacion externa medible (cero descargas).

## Limitaciones y advertencias

- Trazabilidad inexistente: no se declara modelo base, dataset, numero de tokens ni proceso de alineacion. No es posible auditar sesgos, contaminacion de datos ni procedencia de los pesos.
- Riesgo de alucinacion elevado en el dominio objetivo: la propia model card advierte "Never invent program IDs", lo que implica que el modelo tiende a fabricar identificadores de programas de bug bounty si no se le corrige. Es un fallo critico en flujos reales de divulgacion.
- Alucinacion de CVE, CWE, CVSS y referencias tecnicas: no hay evaluaciones que cuantifiquen este riesgo en un modelo de 7,25 B ajustado a un nicho.
- Longitud de contexto desconocida: sin este dato no se puede planificar el analisis de informes largos ni el uso multi-turno extenso, y el consumo de VRAM es impredecible.
- Idiomas no declarados: la model card esta en ingles y los tags no listan idiomas. No se debe asumir soporte fiable en castellano.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restriccion de royalties, pero al no poder verificar el origen del modelo base, el usuario asume el riesgo legal de una posible licencia heredada incompatible.
- Repositorio sin adopcion: cero descargas y cero likes. No hay issues, discusiones ni evaluaciones de terceros que sirvan de contraste.
- Inconsistencia temporal: la fecha de creacion registrada (2026-09-18) es posterior a la fecha de consulta, lo que sugiere metadatos poco fiables o un error de publicacion.
- Uso restringido por el autor a BBP/VDP/pentest autorizado: cualquier uso ofensivo contra sistemas sin permiso queda fuera del proposito declarado y puede infringir legislacion aplicable.
- Adecuacion limitada para produccion: con 7,25 B de parametros y sin evaluaciones, no es un sustituto de revisores humanos en triaje de vulnerabilidades ni de herramientas de analisis estatico o dinamico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GLASSEYE/vector-bbp-v1-gguf
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo, a su paper, a su repositorio de codigo ni a demos. Las busquedas devolvieron unicamente resultados no relacionados (sitios del canal de television griego Mega TV: megatv.com, megatv.com/live, youtube.com/channel/UCpWa_Y5O7U2oQLAz-FRllwg, programmatileorasis.live/mega, megatv.com/showtype/greekseries).
- Paper, blog tecnico, repositorio de codigo y demo: no disponibles.

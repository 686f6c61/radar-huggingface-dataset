# queelius/borrowed-stars-npc-lfm2.5-350m-GGUF

## Resumen

borrowed-stars-npc-lfm2.5-350m-GGUF es un ajuste fino del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario queelius, orientado especificamente a la generacion de dialogos y acciones para personajes no jugadores (NPC) en el videojuego de rol *Borrowed Stars*, construido sobre el motor Anima RPG Engine. El modelo resuelve un problema muy concreto: emitir respuestas estructuradas en JSON con una linea de dialogo en personaje y entre 0 y 2 llamadas a herramientas validadas de un contrato de 23 herramientas (v2.1), todo ello ejecutandose integramente en CPU sin competir por recursos de GPU.

La relevancia de este modelo radica en su enfoque de despliegue extremo: con 354 millones de parametros, cuantizacion Q4_K_M de solo 218,7 MB y velocidades superiores a 120 tokens por segundo en un portatil convencional (Ryzen 5 7430U con 6 hilos), demuestra que es viable integrar un narrador interactivo y sistema de NPC con tool calling dentro de un juego offline sin infraestructura de servidor. La arquitectura del modelo base combina convoluciones cortas hibridas con atencion de consultas agrupadas (GQA), y este ajuste incorpora ademas un vocabulario podado y una gramatica GBNF que garantiza el cumplimiento estricto del esquema de salida.

El modelo esta pensado para completarse en bruto (raw completion) mediante un formato de prompt compacto con cabecera de estado del juego, y su licencia LFM Open License v1.0 se hereda directamente del modelo base de LiquidAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con convolucion corta y atencion de consultas agrupadas (GQA); arquitectura `lfm2` en llama.cpp |
| Parametros totales | 354.483.968 (354M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los ejemplos de despliegue usan `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM2.5-350M |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-350M, un transformer de 354 millones de parametros que combina capas de convolucion corta con atencion de consultas agrupadas (GQA), lo que reduce el coste de memoria de la cache KV y mejora la eficiencia en inferencia sobre CPU. Sobre esta base, el autor realizo un ajuste fino supervisado para la tarea especifica de NPC y narrador interactivo, con un vocabulario podado (vocab-pruned) que reduce el tamano del embedding y acelera la decodificacion.

El entrenamiento se evaluo contra un conjunto congelado de 120 filas y un contrato de 23 herramientas (v2.1), con metricas de validacion como `val_bpb` de 0,4944, cumplimiento de esquema JSON del 92,5 % antes de aplicar la gramatica GBNF, F1 de 0,683 en el uso de las 23 herramientas (precision 0,78, recall 0,61) y una tasa de rechazo anti-exploit del 90 % (27 de 30) en seis clases de rechazo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable es la integracion de una gramatica GBNF (`npc_grammar_v2.gbnf`) que restringe la decodificacion para garantizar el 100 % de cumplimiento del esquema y de los identificadores de objetos del juego.

## Capacidades

- Generacion de dialogo en personaje para NPC con tono, estado de animo y rol definidos en la cabecera de estado.
- Emision de JSON estructurado de forma nativa con los campos `mood`, `line` y `calls`.
- Tool calling restringido a un contrato de 23 herramientas (por ejemplo `give_item`, `adjust_trust`, `emote`, `steer_dialogue_node`), con entre 0 y 2 llamadas por turno.
- Cumplimiento garantizado del esquema y de los identificadores de objetos mediante gramatica GBNF.
- Disciplina de chitchat: devuelve `calls: []` en el 100 % de los casos de conversacion pura (44 de 44).
- Rechazo de intentos de explotacion (anti-exploit) en seis clases de rechazo, con una tasa de exito del 90 %.
- Capacidad de narrador interactivo con cabecera de estado del juego (localizacion, inventario, misiones, hechos, historial).
- Soporte de multiples modos de contexto opcionales: `[BIO]`, `[RECENT]`, `[PEER_CHAT]`, `[TREE]`.
- Capacidades multilingues: solo ingles.
- No dispone de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- NPCs de videojuego offline: el modelo se ejecuta en CPU dentro del propio juego y genera dialogos y acciones coherentes con el estado del mundo (inventario, misiones, nivel de confianza), sin necesidad de conexion ni GPU.
- Narrador interactivo: con la cabecera de estado completa (`[LOC]`, `[QUESTS]`, `[FACTS]`) el modelo puede describir escenas y reaccionar a las decisiones del jugador manteniendo coherencia canonica.
- Sistemas de misiones con efectos en el mundo: las llamadas a herramientas validadas (`give_item`, `adjust_trust`) permiten que el dialogo modifique directamente el estado del juego de forma controlada.
- Prototipado rapido de personajes: un desarrollador puede definir el rol, voz y hechos de un NPC en la cabecera del prompt y obtener un comportamiento consistente sin reentrenar.
- Despliegue en portatiles de bajas prestaciones: con 218,7 MB y mas de 120 tok/s de decodificacion en CPU, cabe en equipos sin GPU dedicada y con poca RAM.
- Servidor de inferencia ligero con API compatible OpenAI: mediante `llama-server` se expone `/v1/*` para integrar el modelo en pipelines existentes.
- Evaluacion de contratos de herramientas: util como banco de pruebas para validar gramaticas GBNF y esquemas JSON estrictos en modelos pequenos.
- Chitchat seguro para sistemas conversacionales: la disciplina de `calls: []` evita acciones no deseadas en conversaciones sin intencion de juego.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tamano GGUF (Q4_K_M) | 218,7 MB |
| Parametros | 354M (hibrido short-conv + GQA) |
| `val_bpb` en held-out | 0,4944 |
| Esquema JSON sin restriccion (antes de GBNF) | 92,5 % |
| F1 en 23 herramientas (antes de GBNF) | 0,683 (P=0,78 / R=0,61) |
| Tasa de exito en rechazo anti-exploit (6 clases) | 90,0 % (27/30) |
| Disciplina `calls: []` en chitchat puro | 100,0 % (44/44) |
| Fugas de nombres retirados o fuera de personaje | 0,00 % (0/120) |
| Velocidad en CPU de portatil | 123-125 tok/s decodificacion, 827 tok/s prefill, ~0,88-0,94 s por turno completo (Ryzen 5 7430U, 6 hilos) |
| Prueba en vivo con llama.cpp + `npc_grammar_v2.gbnf` | 4/4 validos (`give_item`, `steer_dialogue_node`, rechazo, chitchat) |
| TTFT en CPU de servidor | 127 ms |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo esta disenado para ejecutarse integramente en CPU; con Q4_K_M ocupa 218,7 MB de pesos, por lo que en GPU cabria en cualquier tarjeta con mas de 1 GB de memoria.
- GPU recomendadas: no se especifican; el modelo esta optimizado para CPU. Cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060 o superiores) podria ejecutarlo sobradamente si se desea aceleracion.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna, aunque el objetivo declarado es CPU.
- Opciones de despliegue: `llama-server` (API nativa y compatible con OpenAI `/v1/*`), `llama.cpp` con soporte para la arquitectura `lfm2`, y el cliente `muse` (`muse pull hf://queelius/borrowed-stars-npc-lfm2.5-350m-GGUF@q4_k_m`).
- Latencia y throughput: 123-125 tok/s de decodificacion y 827 tok/s de prefill en un Ryzen 5 7430U con 6 hilos; 127 ms de TTFT en CPU de servidor; turno completo en aproximadamente 0,88-0,94 s.
- Requiere una build reciente de `llama.cpp` que soporte la arquitectura `lfm2`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| borrowed-stars-npc-lfm2.5-350m-GGUF | 354M | no disponible | LFM Open License v1.0 | GGUF (Q4_K_M) | NPC y narrador con tool calling en CPU |
| LiquidAI/LFM2.5-350M (base) | 354M | no disponible | LFM Open License v1.0 | safetensors / otros | Modelo base generalista |
| Modelos de ~350M para tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de benchmarks comparativos con otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste fino esta orientado exclusivamente al contrato de 23 herramientas y al dominio de *Borrowed Stars*; su rendimiento fuera de ese contexto sera previsiblemente pobre.
- Solo ingles: no soporta castellano ni otros idiomas.
- Riesgo de alucinacion: aunque la gramatica GBNF garantiza el esquema, el contenido del dialogo y los hechos pueden ser incorrectos; el 92,5 % de cumplimiento de esquema sin GBNF implica que sin gramatica hay un 7,5 % de fallos estructurales.
- Recall limitado en herramientas: F1 de 0,683 con recall de 0,61 implica que aproximadamente el 39 % de las llamadas esperadas no se generan.
- Tasa de rechazo no perfecta: el 90 % en anti-exploit deja un 10 % de casos en los que el modelo podria no rechazar correctamente.
- Licencia LFM Open License v1.0: es necesario revisar los terminos del enlace oficial antes de cualquier uso comercial, ya que no es una licencia permisiva estandar.
- Requiere build reciente de `llama.cpp` con soporte `lfm2`; versiones antiguas no cargaran el modelo.
- El contexto de despliegue de referencia es de 2048 tokens; no se documenta la longitud maxima real del modelo.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.
- La salida debe consumirse mediante completado en bruto; el uso como modelo conversacional estandar no esta soportado de forma nativa.

## Enlaces

- Hugging Face: https://huggingface.co/queelius/borrowed-stars-npc-lfm2.5-350m-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-350M/blob/main/LICENSE

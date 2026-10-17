# Jessedbrown/Asolaria-hermes-work

## Resumen

`Jessedbrown/Asolaria-hermes-work` no es un modelo de lenguaje entrenado ni un checkpoint de pesos, sino un repositorio de HuggingFace que actua como instantanea de codigo fuente, documentacion, tests y contratos del proyecto "Asolaria — Hermes work". La model card describe un sistema de agentes autoconscientes y auto-mejorables ("Hermes" / "HyperHermes") con un enrutador (`OmniDispatcher`), un componente llamado "spindle", y un runtime de agente escrito en Rust ("Host-8"). El autor listado es Jessedbrown y el repositorio no declara licencia, idiomas, pipeline ni parametros.

El repositorio acota explicitamente su contenido ("carve-out"): no incluye claves, semillas ni tokens, ni corpus privados, ni capturas con datos personales, ni memoria interna de agentes. Se limita a fuente, documentacion, tests y contratos. Tampoco expone pesos entrenados: la propia model card indica que los checkpoints entrenados de GNN viven en otro repositorio ("trained-GNN repository").

Por tanto, la relevancia de esta ficha es limitada para quien busca evaluar un modelo: no hay arquitectura de red declarada, ni numero de parametros, ni ventana de contexto, ni resultados de benchmarks estandar. Lo unico evaluable son afirmaciones de verificación de recuperacion exacta de datos (Path 1 / Path 2) y auditorias citadas sin enlace directo. Las descargas y "likes" figuran a 0, lo que es coherente con un artefacto de trabajo interno mas que con un modelo publicado para la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no declara arquitectura de red neuronal; describe un sistema de agentes con dispatcher y runtime en Rust) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta redactada en ingles, pero no se declara soporte idiomatico del sistema) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene codigo fuente, documentacion, tests y contratos; no se anuncia publicacion de pesos en safetensors, GGUF ni otros formatos) |

Metadatos del repositorio: ID `Jessedbrown/Asolaria-hermes-work`, etiqueta `region:us`, 0 descargas, 0 likes, sin pipeline declarado. Fechas registradas: creado el 2026-10-16, actualizado el 2026-08-08 (la fecha de actualizacion es anterior a la de creacion en los metadatos proporcionados, lo que supone una inconsistencia que conviene verificar en la fuente).

## Arquitectura y entrenamiento

No se dispone de informacion sobre arquitectura de red neuronal ni sobre proceso de entrenamiento: no hay numero de tokens, composicion de dataset, ni fases de RLHF, DPO o similares. Lo que la model card describe es una cadena operativa de agentes: una "envoltura direccionada" entra en el `OmniDispatcher`, pasa al "spindle / worker" de HyperHermes, atraviesa compuertas deterministas (Hookwall, Fischer, Shannon), se somete a una fase de "white-room KEEP o COMPACT", se persiste como "GULP / cube / receipt" en almacenamiento, y se entrega al siguiente agente con posibilidad de recuerdo o reconstruccion exacta posterior.

El componente tecnico mas concreto que se menciona es HyperHermes como capa de materializacion y traspaso alrededor de dos rutas de recuperacion exacta: Path 1 (recuerdo desde almacen retenido mediante una direccion autenticada) y Path 2 (recuperacion CRT exacta sin almacenamiento a partir de "sombras" conjuntamente suficientes). Se cita tambien una reproyeccion "DBBH→DBWH" antes de la emision. La arquitectura de despliegue se plantea en dos niveles: un nivel de almacenamiento (HDD/SSD) que guarda cubos, sombras, recibos, colas y estado de agente en frio, y un nivel de acelerador opcional para inferencia de GNN/LLM entrenados como "sidecar". No se aportan detalles de diseno de esos modelos GNN, solo su origen declarado en un asistente de salud previo del autor.

## Capacidades

- Orquestacion de agentes: la model card describe un bucle de auto-mejora ("self-improving loop") con contrato de aprendizaje, instantanea de runtime y puertas de plugin.
- Enrutado y despacho: `OmniDispatcher` con validador, worker, pool de puertos, "reject tee" y tests; el PID del dispatcher queda registrado en una "oficina PID soberana" privada.
- Traspaso entre agentes: "fabric ingest" y handoff de dos pestillos ("two-latch next-agent handoff").
- Recuperacion exacta de datos: Path 1 (con almacen) y Path 2 (sin almacen, via CRT con sombras conjuntamente suficientes).
- Verificacion determinista: compuertas Hookwall / Fischer / Shannon, compresion en "white-room" y recomputacion "N-Nest".
- Gestion de recibos: manejo de recibos HBP/HBI y mintado de cubos.
- Runtime de agente en Rust: kernel agent runtime, server agent runtime y esquema de roster de agentes (Host-8).
- Escalado declarado: flotas de kernels de 10k, 20k y 100k, e inventario de "rooms-as-RAM".
- Tool calling / function calling: no disponible.
- Vision, audio o modo "thinking": no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Recuperacion exacta de datos sin almacenamiento: el sistema se postula para reconstruir contenido a partir de sombras CRT conjuntamente suficientes (Path 2), un patron aplicable a custodia de informacion donde no se quiere retener el objeto completo en disco.
- Persistencia de estado de agentes en frio: agentes inactivos quedan como estado barato (PID/semilla/direccion) y solo se materializan cuando estan activos, lo que resulta adecuado para plataformas con muchos agentes registrados y pocos concurrentes.
- Verificacion y auditoria de operaciones: las compuertas deterministas (Hookwall, Fischer, Shannon) y la emision de recibos permiten trazar que se ejecuto, cuando y con que resultado, util en entornos con requisitos de auditoria.
- Orquestacion de trabajos por colas: el dispatcher con pool de puertos, validador y "reject tee" encaja en pipelines donde hay que enrutar tareas heterogeneas y rechazar entradas invalidas de forma explicita.
- Handoff multi-agente en cadena: el paso "next-agent handoff" con dos pestillos sirve para flujos donde una tarea pasa de un agente a otro sin perder contexto ni duplicar trabajo.
- Procesamiento "storage-rich, low-GPU": la model card afirma explicitamente que una maquina sin GPU puede encolar, despachar, gestionar estado de spindle, hacer recuperacion por SHA/Host8/BEHCS/CRT y ejecutar compuertas deterministas, lo que permitiria desplegar la capa de coordinacion en hardware modesto.
- Inferencia opcional en sidecar: cuando se requiere inferencia de GNN/LLM entrenados, esta se delega a un acelerador CPU/GPU separado, de modo que el nucleo del sistema pueda seguir funcionando aunque el acelerador no este disponible.
- Migracion y absorcion de sistemas previos: los planes de migracion Hermes/revolver/fabric y los artefactos de preparacion BEHCS apuntan a escenarios de consolidacion de una implementacion anterior en la nueva.

Advertencia: todos estos casos derivan de las afirmaciones de la model card, no de resultados medidos de forma independiente y reproducible que se hayan podido verificar aqui.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni equivalentes, y no procede inventarlos, dado que el repositorio no publica pesos ni un modelo evaluable.

La model card cita, eso si, "recibos de verificacion" que no son benchmarks de aprendizaje automatico y que se reproducen aqui tal como se declaran, sin verificacion independiente por parte de esta ficha:

| Verificacion citada | Resultado declarado |
|---|---|
| `MEASURED_CLAUDE_FABLE5_THIRD_SEAT` (operador) — Path 1, rustc 1.97 | 19/19 |
| `MEASURED_CLAUDE_FABLE5_THIRD_SEAT` (operador) — Path 2, rustc 1.97 | 30/30 |
| `MEASURED_GPT_DIRECTED_GITHUB_ACTIONS` — ejecuciones Rust 1.97.0 | runs 29134408321, 29134413119, 29134419389 (marcadas como exitosas) |
| `AUDITED_GPT_5_6_PRO` | auditoria declarada sobre GNN de salud, BigPickle, trained-GNN, Hookwall/Shannon, Q-PRISM, white-room, cube-mint, Dispatcher, HyperHermes, reducciones, algoritmos y N-Nest |

La propia model card matiza que estos recibos "no reclaman un nuevo benchmark en vivo de Hermes/Hilbra entre maquinas". No se aportan enlaces a los recibos ni a los logs de las ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se publican pesos ni tamano de modelo.
- GPU recomendadas: no disponible. La model card indica que la inferencia de GNN/LLM entrenados es un "sidecar" opcional y que puede usar aceleradores CPU/GPU, sin especificar modelos concretos.
- Compatibilidad con GPU de consumo: no disponible. Lo unico afirmado es que la capa de coordinacion (encolado, despacho, handoff, recuperacion SHA/Host8/BEHCS/CRT, compuertas deterministicas, compactacion y recomputacion N-Nest) no necesita GPU.
- Almacenamiento: el diseno asigna a HDD/SSD la retencion de cubos, contenido de Path 1, sombras de Path 2, checkpoints, libros de grafos, recibos y estado de agente en frio. La RAM se reserva al trabajo activo acotado. No se dan cifras de capacidad necesaria.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI. El repositorio es un runtime propio en Rust (Host-8). Se citan flotas de kernels de 10k, 20k y 100k en un documento aparte (`KERNEL-FLEET-AND-STUBBED-ROOMS.md`), sin datos de rendimiento.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo con parametros, contexto y licencia comparables a otras alternativas, sino una instantanea de codigo y documentacion de un sistema de agentes. No se ha identificado en la informacion proporcionada ningun artefacto equivalente con el que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo usable para inferencia de texto: no hay pesos, ni arquitectura declarada, ni pipeline. Cualquier expectativa de generar texto, codigo o razonamiento con este repositorio no esta respaldada por la informacion disponible.
- Terminologia no estandar y no verificable externamente: "spindle", "Hookwall", "Fischer", "Shannon", "white-room", "N-Nest", "GULP", "BEHCS", "DBBH/DBWH" no van acompanados de referencias publicas ni definiciones formales en el material proporcionado.
- Las cifras de verificacion (19/19, 30/30, runs de GitHub Actions) provienen de la propia model card y de recibos que no se enlazan; no se han podido comprobar de forma independiente. No son benchmarks de capacidad del modelo.
- Ausencia de licencia: sin licencia declarada, no puede asumirse permiso de uso comercial, redistribucion ni modificacion. Este es el caveat mas relevante para cualquier uso en produccion.
- Inconsistencia en metadatos: la fecha de actualizacion (2026-08-08) es anterior a la de creacion (2026-10-16) segun los datos facilitados; conviene contrastarlo en la fuente antes de citar el repositorio.
- Afirmaciones de "auto-mejora" y de agentes autononos sin evidencia de evaluacion: no se aportan metricas de mejora, ni protocolos de evaluacion, ni conjuntos de datos de test.
- Riesgo de sesgo y de alucinacion: no evaluable, al no existir un modelo de lenguaje identificado ni datos de evaluacion.
- Limitaciones de idioma y contexto: no disponibles.
- Contexto de origen: el repositorio esta marcado como "gated / E=0 en sus hogares originales" y el autor indica que no habra despliegue ni corte sin autoridad del operador, lo que sugiere que se trata de material interno y no de un artefacto listo para consumo externo.
- La busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo ni sobre el autor; los resultados obtenidos eran contenido no relacionado y de caracter inapropiado, por lo que se han descartado y no se enlazan.

## Enlaces

- HuggingFace: https://huggingface.co/Jessedbrown/Asolaria-hermes-work
- `HYPERHERMES-PATH2-STORAGE-AND-VERIFICATION-2026-07-11.md` (referenciado en la model card; no se proporciona URL directa)
- `KERNEL-FLEET-AND-STUBBED-ROOMS.md` (referenciado en la model card; no se proporciona URL directa)
- Live Host-8 lane: `JesseBrown1980/asolaria-federation-1024` (referenciado sin URL)
- Algoritmos y hallazgos: `JesseBrown1980/Algorithms-of-Asolaria` (referenciado sin URL)
- Path 1: `JesseBrown1980/dbbh-coms-quant-prism` (referenciado sin URL)
- Path 2: `JesseBrown1980/path2-two-shadow-recovery` (referenciado sin URL)
- Repositorio de checkpoints entrenados de GNN: mencionado como "trained-GNN repository" sin identificador ni URL
- Paper, blog o demo oficial: no disponible
- Resultados de busqueda web relevantes: no disponible

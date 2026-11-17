# bennett-xdlabs/builder-cognitive-loop

## Resumen

Builder Cognitive Loop no es un modelo de lenguaje, sino una skill para asistentes de codificacion basados en IA (principalmente Claude Code) que define un bucle de construccion de seis pasos y cuatro puertas de calidad. El autor, Bennett Moore (bajo el identificador bennett-xdlabs), lo publica como un fichero `SKILL.md` que cualquier asistente capaz de leer skills puede interpretar. El problema que aborda no es la generacion de codigo, que segun el autor se ha abaratado con la IA, sino la seleccion de que construir, la revision de cada diff y la confianza en lo que se despliega.

La pieza se distribuye como plugin de Claude Code o como skill local instalada en `~/.claude/skills/builder-cognitive-loop/`. El asistente la activa cuando la peticion del usuario encaja con su descripcion: nueva funcionalidad, rediseno de interfaz, revision de diff o preparacion de release. No incluye pesos, no ejecuta inferencia propia y no tiene arquitectura de red neuronal; su "rendimiento" depende del modelo subyacente que lo invoque.

La relevancia actual es metodologica: propone un flujo de trabajo reproducible para desarrollo asistido por IA, con verificacion en navegador real, deteccion de fallos silenciosos y memoria acumulativa de errores (`MEMORY.md`). El autor es explicito en que no hay evaluacion controlada ni uso por terceros, y que el ejemplo de referencia (Sola AIR) es su propio proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es una skill/prompt estructurado en `SKILL.md`) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo anfitrion) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (el texto de la skill esta en ingles) |
| Licencia | MIT (segun el apartado Author de la model card) |
| Formato de pesos | no disponible (no hay pesos; se distribuye como fichero Markdown `SKILL.md`) |

## Arquitectura y entrenamiento

No hay arquitectura de red ni entrenamiento. El artefacto es un documento de instrucciones (`SKILL.md`) que describe un bucle de seis pasos: (1) partir de una friccion real y emparejarla con un modelo mental ajeno al dominio; (2) construir primero la interfaz como contrato de datos; (3) dirigir con una sola variable por prompt; (4) someter cada diff a cuatro puertas de calidad (rechazar UI generica, prevenir fallos silenciosos, anclar al modelo estandar del host, mantener el tooling fuera del estado versionado); (5) verificar en local, en navegador real y en entorno de desarrollo antes de produccion; (6) registrar cada tropiezo en `MEMORY.md` en la misma sesion.

El contenido se destila, segun el autor, de builds reales como Sola AIR, un framework reactivo y compilador de unos 7,5 kB gzip en el core, con primer commit el 2026-08-27 y, a fecha 2026-11-13, 13 paquetes npm, extension de VS Code, extension de Chrome y 137 pull requests. No se documenta ningun proceso de RLHF, DPO ni ajuste fino; la "innovacion" es el propio protocolo de trabajo, no una tecnica de modelado.

## Capacidades

- Definir un flujo de construccion reproducible para tareas de desarrollo asistido por IA (nuevas funcionalidades, redisenos de UI, revision de diffs, preparacion de release).
- Imponer cuatro puertas de calidad sobre cada diff: rechazo de UI generica, prevencion de fallos silenciosos, anclaje al modelo estandar del host y exclusion de tooling del estado versionado.
- Forzar verificacion en tres niveles: local, navegador real y entorno de desarrollo antes de produccion.
- Mantener memoria acumulativa de errores en `MEMORY.md` para evitar regresiones repetidas.
- Integrarse como plugin de Claude Code mediante marketplace o como skill local copiada a `~/.claude/skills/`.
- Operar sin telemetria, sin credenciales y sin recoleccion de datos, segun la model card.
- No soporta tool calling, function calling, agentes autonomos, vision, audio ni modo thinking por si misma; esas capacidades dependen del modelo anfitrion.

## Casos de uso

- Desarrollo de funcionalidades nuevas en Claude Code: la skill se activa cuando la peticion encaja con "new feature" y estructura el trabajo en los seis pasos, evitando que el asistente genere codigo sin contrato de interfaz previo.
- Rediseno de interfaces: el paso 2 obliga a construir la interfaz antes que la logica de datos, y la puerta 1 rechaza propuestas visuales genericas; util en equipos que iteran sobre portales o dashboards.
- Revision de diffs en pull requests: las cuatro puertas actuan como checklist verificable (UI generica, fallos silenciosos, modelo estandar del host, tooling versionado), lo que reduce la carga de revision manual.
- Prevencion de fallos silenciosos en produccion: la puerta 2 y la verificacion en navegador real abordan casos como bloques condicionales anidados que desincronizan el DOM o efectos que lanzan `ReferenceError`.
- Preparacion de releases: el paso 5 incluye un dry run de publicacion que, en el caso documentado, detecto la ausencia de la carpeta `dist/` antes del despliegue.
- Acumulacion de conocimiento de equipo: `MEMORY.md` registra tropiezos en la misma sesion, lo que sirve como base de errores conocidos para futuras sesiones del asistente.
- Auditoria de seguridad basica en CI: la puerta 4 se materializa en el ejemplo con `scripts/secret-guard.mjs`, que falla ante cadenas con forma de clave y ante configuracion local de tooling commiteada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no existe comparacion controlada antes/despues frente a un flujo por defecto, que la skill no ha sido probada por nadie distinto del autor y que los tiempos indicados en `SKILL.md` son una guia aproximada de sus propias sesiones, no una medicion.

## Requisitos de hardware

- VRAM: no aplica; la skill no ejecuta inferencia propia.
- GPU: no aplica; el coste computacional recae en el modelo anfitrion (Claude Code u otro asistente compatible).
- GPU de consumo: no aplica.
- Despliegue: plugin de Claude Code (`claude plugin marketplace add Rbm3267/builder-cognitive-loop` y `claude plugin install builder-cognitive-loop@builder-cognitive-loop`) o copia manual de `SKILL.md` a `~/.claude/skills/builder-cognitive-loop/`.
- Latencia y throughput: no disponibles; dependen del modelo anfitrion y de la longitud del contexto de la sesion.
- Almacenamiento: despreciable (un fichero Markdown mas, en su caso, `MEMORY.md`).

## Comparativa con modelos similares

| Criterio | Builder Cognitive Loop | Skills genericas de Claude Code | Prompts de sistema ad hoc |
|---|---|---|---|
| Naturaleza | Skill estructurada en 6 pasos y 4 puertas | Skills puntuales por tarea | Instrucciones informales por sesion |
| Parametros | no aplica | no aplica | no aplica |
| Contexto | depende del anfitrion | depende del anfitrion | depende del anfitrion |
| Evaluacion publicada | ninguna (declarado por el autor) | habitualmente ninguna | ninguna |
| Licencia | MIT | variable | no aplica |
| Disponibilidad | Hugging Face y GitHub (`Rbm3267/builder-cognitive-loop`) | variable | no aplica |
| Trazabilidad de errores | `MEMORY.md` por sesion | no estandarizada | no estandarizada |

No se dispone de datos de rendimiento comparables entre estas opciones; la comparativa es estructural, no cuantitativa.

## Limitaciones y advertencias

- No es un modelo: no genera texto, codigo ni embeddings por si mismo; toda capacidad depende del asistente anfitrion.
- Sin evaluacion independiente: el autor declara que nadie mas lo ha probado y que no hay comparacion controlada antes/despues.
- Sin datos de sesgos, alucinacion o robustez multilingue; el texto esta en ingles y no se documentan otros idiomas.
- El caso de referencia (Sola AIR) es un proyecto del propio autor, lo que introduce sesgo de seleccion en los ejemplos.
- La licencia MIT figura en el apartado Author de la model card, pero el campo de licencia de Hugging Face aparece como no disponible; conviene verificar el fichero LICENSE del repositorio antes de uso comercial.
- El ejemplo documenta un fallo real no cubierto por las puertas hasta que ocurrio (clave de servidor no declarada en el modulo de entorno tras la actualizacion a SvelteKit 3, PR #133, corregido en PR #135); el autor lo describe como trinquete, no como garantia.
- El paso 3 (una variable por prompt) no tiene registro publico en el caso de referencia, por lo que su eficacia no esta evidenciada.
- Dependencia de Claude Code para la instalacion como plugin; en otros asistentes requiere copia manual del fichero y compatibilidad con el formato de skills.

## Enlaces

- Hugging Face: https://huggingface.co/bennett-xdlabs/builder-cognitive-loop
- Repositorio del plugin: https://github.com/Rbm3267/builder-cognitive-loop
- Proyecto de referencia Sola AIR: https://github.com/Rbm3267/sola-air
- Fichero de la skill: `SKILL.md` dentro del repositorio del plugin

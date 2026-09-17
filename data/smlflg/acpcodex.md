# smlflg/ACPcodex

## Resumen

ACPcodex es un repositorio publicado en HuggingFace bajo el identificador `smlflg/ACPcodex` que no contiene un modelo de lenguaje, sino una capa de orquestacion de subagentes basada en ACP (Agent Client Protocol) y Codex. El autor lo describe como un workspace que convierte una nota de idea en un pequeno sistema ejecutable: usa sesiones nombradas de `acpx` como transporte y asigna a cada subagente un rol y un conjunto de ficheros de los que es propietario. En la fecha de consulta el repositorio acumula 0 descargas y 0 "likes", y fue creado el 16 de septiembre de 2026.

La pieza central es un script Bash (`scripts/acpx-subagents`) que envuelve cada prompt con el rol del agente, sus limites de propiedad de ficheros y reglas de colaboracion, y que por defecto invoca `npx -y acpx@latest` cuando no encuentra un binario global de `acpx`. La configuracion de agentes vive en `subagents.conf` y define cuatro roles por defecto: `ui` (frontend, plantillas, estaticos), `pipeline` (runtime, esquema, logica de guardas), `rules` (packs de reglas, politica, validacion) y `tests` (pruebas, fixtures y documentacion de test).

Por tanto, no es un modelo evaluable con benchmarks ni con requisitos de VRAM: es una herramienta de desarrollo experimental. El propio autor advierte de que `acpx` sigue en estado alpha. Cualquier ficha tecnica de "modelo" aplicada a este repositorio debe entender sus cifras de parametros, contexto, cuantizacion y licencia como no disponibles, porque no se publican pesos ni se declaran en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (repositorio de orquestacion de agentes, no un modelo neuronal) |
| Parametros totales | no disponible (no se publican pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del backend Codex subyacente) |
| Tipos de cuantizacion | no aplica (no se distribuyen pesos) |
| Idiomas soportados | no disponibles (la documentacion esta en ingles) |
| Licencia | no disponible (no declarada en la model card ni en los tags) |
| Formato de pesos | no aplica (el contenido son scripts Bash y ficheros de configuracion) |
| Autor | smlflg |
| Fecha de creacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |
| Tags declarados | `region:us` |
| Dependencias | `acpx` (alpha), un backend Codex, Bash, Node.js/npx |
| Componentes incluidos | `scripts/acpx-subagents`, `subagents.conf` |

## Arquitectura y entrenamiento

No existe entrenamiento asociado. El repositorio no entrena ni publica ningun modelo, y no hay datos de dataset, numero de tokens, composicion, RLHF ni DPO en la informacion disponible. Lo que si define es una arquitectura de orquestacion en tres capas: (1) un script Bash de linea de comandos que actua como fachada, (2) sesiones nombradas gestionadas por `acpx` como transporte, y (3) subagentes Codex con rol y propiedad de ficheros asignados.

La innovacion destacable, segun la propia model card, es el aislamiento por rol y por propiedad de rutas: cada prompt enviado se envuelve con el rol del agente, sus fronteras de propiedad y reglas de colaboracion, y se instruye a los agentes a no editar fuera de sus rutas salvo que la tarea conceda explicitamente ese alcance. `acpx` delimita las sesiones por raiz de git cuando existe un repositorio; en directorios sin git, la sesion queda anclada al directorio de trabajo exacto. Para trabajo de implementacion realmente en paralelo, el autor recomienda usar worktrees independientes. El diseno es deliberadamente minimalista: no hay enrutado semantico, ni verificacion automatica de resultados, ni metricas de evaluacion.

## Capacidades

- Lanzar subagentes con rol predefinido (`ui`, `pipeline`, `rules`, `tests`) y enviarles tareas individuales o el mismo prompt en paralelo.
- Envolver cada prompt con contexto de rol, limites de propiedad de ficheros y reglas de colaboracion antes de reenviarlo al backend.
- Ejecutar en modo espera o sin espera (`--no-wait`), lo que permite enviar trabajo a varios agentes y recoger resultados mas tarde.
- Apuntar a otro repositorio distinto del de orquestacion mediante la opcion `--cwd /path/to/project`, sin mover la carpeta de orquestacion.
- Gestionar el ciclo de vida de las sesiones: `doctor` (comprobacion de prerequisitos), `ensure` (crear o reutilizar sesiones), `sessions`, `show`, `history`, `close`.
- Cargar prompts desde fichero con `--file prompt.md`, util para instrucciones largas o versionadas.
- Permitir configuraciones alternativas de agentes mediante la variable `SUBAGENTS_CONFIG`, apuntando a otro fichero Bash con otra lista de agentes u otros ambitos de propiedad.
- Fijar la version o el binario de `acpx` con `ACPX_BIN` (por ejemplo `ACPX_BIN="npx -y acpx@0.1.15"`), lo que mitiga parcialmente el uso de `@latest`.
- No se documentan capacidades de generacion multimodal, vision, audio, tool calling propio ni modos de razonamiento extendido: esas capacidades, si existen, pertenecen al backend Codex y no al repositorio.

## Casos de uso

- Reparto de trabajo por areas en un monorepo: se asignan los cambios de frontend al agente `ui`, los de runtime al agente `pipeline` y la cobertura al agente `tests`, de modo que cada subagente solo toca los ficheros de los que es propietario y se reduce el riesgo de conflictos de edicion.
- Revision paralela de codigo: `parallel -- "Review your owned area and report the smallest safe implementation plan."` lanza el mismo prompt a todos los agentes y devuelve cuatro planes de implementacion acotados a sus respectivas areas, utiles como paso previo a un cambio grande.
- Incorporacion de cobertura de pruebas: `send tests "Add focused coverage for the new parser behavior."` envia una tarea concreta al agente de pruebas, que trabaja sobre tests, fixtures y documentacion de test sin invadir el codigo de produccion.
- Politica y validacion: el agente `rules` puede encargarse de packs de reglas, politica y reglas de validacion, lo que resulta util en proyectos con requisitos normativos o de cumplimiento que deben mantenerse separados del codigo de aplicacion.
- Trabajo sobre repositorios ajenos a la orquestacion: con `--cwd /path/to/project` el mismo script se reutiliza contra otro proyecto, evitando duplicar la carpeta de orquestacion en cada repositorio.
- Aislamiento de cambios independientes mediante worktrees de git: combinando la recomendacion del autor con `parallel --no-wait`, varios agentes pueden trabajar en ramas de trabajo separadas sin pisarse.
- Integracion en flujos de CI o scripts internos: al ser un script Bash con comandos no interactivos (`doctor`, `ensure`, `send`, `close`) y soporte de `--file prompt.md`, puede invocarse desde un job que prepare sesiones y encole tareas, siempre que las credenciales del backend Codex esten disponibles en el entorno.
- Configuracion de equipos con agentes distintos: mediante `SUBAGENTS_CONFIG` un equipo puede definir su propia lista de agentes y ambitos de propiedad sin tocar el script principal, por ejemplo anadiendo un rol de documentacion o de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones, metricas de calidad, latencias ni tasas de exito de tareas. No debe atribuirse a este proyecto ninguna cifra de MMLU, HumanEval, GSM8K ni similares: el artefacto publicado es una capa de orquestacion, no un modelo evaluable.

## Requisitos de hardware

- VRAM para inferencia: no aplica. El repositorio no ejecuta pesos localmente; la inferencia la realiza el backend Codex al que se conectan las sesiones de `acpx`.
- GPU recomendadas: no aplica a nivel de repositorio. Los requisitos de GPU, si los hay, corresponden al servicio o al runtime del backend Codex, no a `ACPcodex`.
- GPU de consumo: no aplica por el mismo motivo.
- Software necesario: Bash, Node.js con `npx` disponible, y `acpx` (binario global o via `npx -y acpx@latest`, version alpha en la fecha de la model card).
- Opciones de despliegue: ejecucion local del script sobre un checkout del repositorio objetivo, con la variable `ACPX_BIN` para fijar la version de `acpx` y `SUBAGENTS_CONFIG` para cambiar la configuracion de agentes. No se documentan opciones de despliegue en servidor, contenedor, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Dependen enteramente del backend Codex y del numero de agentes lanzados en paralelo.

## Comparativa con modelos similares

No disponible en terminos de modelos. El artefacto no es comparable con modelos de lenguaje por parametros, contexto o rendimiento. Como referencia cualitativa de su categoria (orquestadores de subagentes en linea de comandos), puede situarse junto a:

| Alternativa | Naturaleza | Datos comparables |
|---|---|---|
| ACPcodex | Script Bash sobre sesiones `acpx` + Codex, con agentes definidos en `subagents.conf` | 4 agentes por defecto, estado alpha, 0 descargas, licencia no declarada |
| acpx (openclaw) | Implementacion de transporte ACP que ACPcodex usa como dependencia | No disponible |
| codex-acp (cola-io) | Puente entre Codex y ACP citado como referencia | No disponible |
| Otros orquestadores de agentes de codigo | Categoria generica, distintos repositorios | No se dispone de datos comparables en la informacion proporcionada |

No se han encontrado cifras de parametros, contexto, rendimiento ni licencia de las alternativas en la informacion disponible, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- No es un modelo: no se publican pesos, no hay arquitectura neuronal ni benchmarks. Cualquier expectativa de "modelo" es un malentendido sobre el contenido del repositorio.
- Estado experimental declarado: el propio autor indica que `acpx` sigue en alpha y califica el flujo de experimental.
- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial, modificacion ni redistribucion. Debe consultarse al autor antes de cualquier uso en produccion.
- Riesgo de cadena de suministro: el valor por defecto es `npx -y acpx@latest`, lo que descarga y ejecuta la ultima version publicada en cada invocacion. Para entornos controlados conviene fijar `ACPX_BIN` a una version concreta.
- Ambito de edicion por confianza, no por control tecnico: el aislamiento se basa en instrucciones incluidas en el prompt ("no edites fuera de tus rutas"), no en un sandbox. Un agente podria salirse de su ambito si el modelo subyacente no respeta la instruccion.
- Alcance de sesion dependiente del entorno: con repositorio git las sesiones se delimitan por la raiz del repositorio; sin git, por el directorio de trabajo exacto, lo que puede provocar sesiones inesperadamente aisladas o compartidas.
- Sin verificacion automatica: el script no valida que las tareas se hayan completado correctamente ni ejecuta pruebas; la supervision humana sigue siendo necesaria.
- Idioma y documentacion: la model card esta en ingles y no se declaran idiomas soportados. No hay garantia de comportamiento en castellano ni en otros idiomas.
- Ausencia de traccion y de senales de calidad: 0 descargas y 0 likes en la fecha de consulta, sin issues, papers ni evaluaciones publicas asociadas.
- Datos temporales: la fecha de creacion (2026-09-16) y la de actualizacion (2026-09-16) son practicamente identicas, por lo que no hay historial de mantenimiento observable.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; dependera del backend Codex, no del repositorio.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/smlflg/ACPcodex
- Repositorio de `acpx`: https://github.com/openclaw/acpx
- Documentacion de la CLI de `acpx`: https://github.com/openclaw/acpx/blob/main/docs/CLI.md
- Puente Codex-ACP: https://github.com/cola-io/codex-acp
- Registro del Agent Client Protocol: https://agentclientprotocol.com/registry

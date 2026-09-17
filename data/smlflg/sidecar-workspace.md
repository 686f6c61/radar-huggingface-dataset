# smlflg/Sidecar-Workspace

## Resumen

Sidecar-Workspace es un workspace multi-repositorio publicado en HuggingFace por el usuario smlflg. No se trata de un modelo de IA generativa, sino de un conjunto de repositorios de software que implementan Sidecar, descrito por su autor como una "capa de gobernanza para agentes de codificacion con IA" basada en tres pilares: inyeccion minima de contexto, barreras de seguridad (safety gates) y modos de flujo de trabajo.

El repositorio canonico de distribucion es Sidecar-Courser, presentado como el unico runtime de producto para las fases 0 a 2. Incluye un paquete Python denominado sidecar-courser, hooks para Claude Code invocables mediante python3 -m sidecar_courser.inject y python3 -m sidecar_courser.gates, paquetes de conocimiento (knowledge packs) con perfiles default y personal, goldsets de evaluacion, utilidades de linea de comandos doctor, smoke y eval, y un bundle de plugin de Claude bajo .claude-plugin/.

El espacio de trabajo tambien documenta un mapa de repositorios con distintos estados (ship, reference, superseded, foundation, archive) y una hoja de ruta de comercializacion por fases. En el momento de la consulta, el repositorio acumula 0 descargas y 0 likes, con un tamano de 0,1 GB y una licencia no especificada. No se dispone de informacion sobre arquitectura de red neuronal, parametros, contexto ni datos de entrenamiento, puesto que el artefacto no es un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no es un modelo de red neuronal; es un workspace de repositorios de software) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (la capa inyecta contexto de forma selectiva, pero no define una ventana propia) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No aplica (distribucion como codigo fuente Python y bundle de plugin) |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Identificador | smlflg/Sidecar-Workspace |
| Autor | smlflg |
| Tamano del repositorio | 0,1 GB |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | No disponible |
| Etiquetas | region:us |
| Fecha de creacion | 2026-09-16 |
| Fecha de actualizacion | 2026-09-16 |
| Entorno de ejecucion declarado | Python y Claude Code |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura de modelo, datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de alineacion (RLHF, DPO u otros). El artefacto no es un modelo entrenado, por lo que estos apartados no son aplicables.

La arquitectura relevante en este caso es la organizacion del propio workspace, que el autor estructura en repositorios con estados definidos:

- Sidecar-Courser: estado "ship", repositorio canonico con hooks, CLI y plugin.
- Sidecar-ng: estado "reference", origen de Courser, congelado para comparacion.
- Sidecar-by-Codex: estado "superseded", sustituido por Courser.
- Sidecar-V8 y Sidecar-V8-Plan: estado "foundation", daemon agnostico de agente para la plataforma v2.
- CodexModeGovernorSidecar-ng-Prinzip: contratos de modo para Codex, conectados mediante adapters/codex de Courser.
- codex-sidecarV1: replay y modo advisory sobre JSONL de Codex.
- Sidecar-ng-dashboard: interfaz opcional de observabilidad.
- Sidecar-Evolution: archivo de decisiones de evaluacion.
- Sidecar-V5 a Sidecar-V7: estado "archive", sin extension prevista.

El autor menciona una hoja de ruta de comercializacion por fases documentada en un plan de Cursor denominado "Sidecar Commercialization Map", en la que los entregables de la fase 1 residen en Sidecar-Courser y la expansion de V8 queda condicionada a que se cumplan los KPI de evaluacion. No se detallan dichos KPI ni las innovaciones tecnicas internas de la capa de gobernanza.

## Capacidades

Dado que no es un modelo de IA, las capacidades se refieren a las funciones del software descrito en la model card:

- Inyeccion minima de contexto para agentes de codificacion, ejecutable mediante python3 -m sidecar_courser.inject.
- Aplicacion de barreras de seguridad (safety gates) mediante python3 -m sidecar_courser.gates.
- Definicion de modos de flujo de trabajo para agentes.
- Gestion de paquetes de conocimiento con dos perfiles declarados: default y personal.
- Integracion con Claude Code a traves de hooks y de un bundle de plugin en .claude-plugin/.
- Integracion con Codex mediante contratos de modo y el adaptador adapters/codex.
- Reproduccion y analisis de trazas JSONL de Codex en modo replay o advisory.
- Evaluacion mediante goldsets y utilidades de linea de comandos: doctor, smoke y eval.
- Observabilidad opcional a traves de Sidecar-ng-dashboard.
- Registro de decisiones de evaluacion en Sidecar-Evolution.

No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes multietapa ni capacidades multilingues propias del artefacto, ya que estas dependen del modelo subyacente sobre el que opere la capa de gobernanza.

## Casos de uso

- Gobernanza de agentes de codificacion en produccion: la capa aplica barreras de seguridad antes de que un agente ejecute acciones, lo que permite desplegar agentes sobre repositorios reales con controles previos definidos por el equipo.
- Reduccion del consumo de contexto en sesiones largas: la inyeccion minima de contexto permite alimentar al agente unicamente con los fragmentos relevantes, lo que resulta util cuando el coste por token o la ventana disponible son factores limitantes.
- Integracion en flujos de Claude Code: mediante hooks y el bundle de plugin, un equipo ya usuaria de Claude Code puede incorporar la capa sin cambiar de entorno de trabajo.
- Estandarizacion de modos de trabajo entre equipos: los modos de flujo de trabajo permiten fijar contratos de comportamiento para el agente y hacerlos consistentes entre distintos desarrolladores y repositorios.
- Auditoria de sesiones de agentes en Codex: el replay de trazas JSONL permite reconstruir decisiones pasadas y revisar de forma retrospectiva que hizo el agente y por que.
- Evaluacion continua de politicas de agente: las utilidades doctor, smoke y eval, junto con los goldsets, permiten verificar de forma automatizada que los cambios en la configuracion no degradan el comportamiento esperado.
- Personalizacion por perfil de conocimiento: los paquetes default y personal permiten separar el conocimiento comun de las convenciones especificas de cada proyecto o persona.
- Monitorizacion opcional de la actividad: el dashboard permite a equipos que lo necesiten observar la actividad del agente, aunque el autor lo marca como opcional, no como componente critico del runtime.
- Archivado de decisiones de evaluacion: Sidecar-Evolution conserva el historico de decisiones, util para trazabilidad en proyectos con requisitos de auditoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de goldsets de evaluacion, utilidades eval y KPI de evaluacion que condicionan la expansion de la fase V8, pero no proporciona cifras, metricas ni resultados numericos concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica. El artefacto no ejecuta inferencia de un modelo propio y no requiere GPU por si mismo.
- GPU recomendadas: no disponibles; no se describe ninguna dependencia de aceleracion por hardware.
- Compatibilidad con GPU de consumo: no aplica, ya que no se trata de un modelo con pesos que cargar.
- Entorno de ejecucion declarado: Python, con instalacion mediante ./scripts/install.sh desde el directorio Sidecar-Courser.
- Requisito de agente: Claude Code, a traves de hooks y del bundle de plugin en .claude-plugin/.
- Dependencia externa: los adaptadores de Codex, que requieren la presencia de dicho agente para su funcionamiento.
- Espacio en disco del repositorio: 0,1 GB en el momento de la consulta.
- Opciones de despliegue: instalacion local como paquete Python y plugin; no se documentan opciones de servidor de inferencia como vLLM, llama.cpp, Ollama o TGI, dado que el artefacto no sirve pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El artefacto no es un modelo de IA y la informacion proporcionada no incluye herramientas equivalentes de gobernanza de agentes con las que establecer una comparacion en terminos de parametros, contexto, rendimiento o licencia. La unica comparacion interna documentada es entre los propios repositorios del workspace:

| Repositorio | Estado | Relacion |
|---|---|---|
| Sidecar-Courser | Ship | Repositorio canonico de distribucion para las fases 0 a 2 |
| Sidecar-ng | Reference | Origen de Courser, congelado para comparacion |
| Sidecar-by-Codex | Superseded | Copia de produccion sustituida por Courser |
| Sidecar-V8 y Sidecar-V8-Plan | Foundation | Daemon agnostico de agente, solo base |
| Sidecar-V5 a Sidecar-V7 | Archive | No se deben extender |

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse que el uso comercial este permitido. Es imprescindible aclarar este punto antes de cualquier adopcion en produccion.
- El artefacto no es un modelo de IA: no genera texto, no razona y no tiene pesos. Cualquier expectativa de uso como modelo de lenguaje es incorrecta.
- No se especifican los idiomas soportados, ni en la interfaz ni en la documentacion del proyecto.
- El proyecto tiene 0 descargas y 0 likes, y se encuentra en fase inicial de comercializacion segun la propia documentacion, lo que implica un riesgo elevado de cambios de API, reorganizacion de repositorios o abandono.
- El mapa de repositorios incluye multiples estados (ship, reference, superseded, foundation, archive) y repositorios repetidos para el mismo proposito, lo que puede provocar confusion sobre cual es la version vigente si no se sigue el aviso del autor de que Sidecar-Courser es el unico runtime de producto para las fases 0 a 2.
- La expansion de la plataforma v2 (V8) esta condicionada a que se cumplan unos KPI de evaluacion que no se detallan, por lo que la hoja de ruta futura es incierta.
- No hay datos publicados sobre sesgos, riesgo de alucinacion ni limites de contexto del artefacto. Estos riesgos recaen sobre el modelo subyacente que utilice el agente, no sobre la capa de gobernanza.
- La dependencia de Claude Code y de Codex como agentes soportados limita la portabilidad a otros entornos de agentes, a pesar de que el repositorio V8 se describa como agnostico de agente y se encuentre solo en fase de base.
- Las busquedas web realizadas para ampliar informacion no han devuelto resultados relacionados con el proyecto; los resultados obtenidos corresponden a un servicio de television en streaming y no guardan relacion con este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/smlflg/Sidecar-Workspace
- Sidecar-Courser (repositorio canonico de distribucion): Sidecar-Courser/
- Sidecar-ng (referencia, congelado): Sidecar-ng/
- Sidecar-by-Codex (sustituido): Sidecar-by-Codex/
- Sidecar-V8 y Sidecar-V8-Plan (plataforma v2, base): Sidecar-V8/ y Sidecar-V8-Plan/
- CodexModeGovernorSidecar-ng-Prinzip (contratos de modo para Codex): CodexModeGovernorSidecar-ng-Prinzip/
- codex-sidecarV1 (replay y advisory sobre JSONL): codex-sidecarV1/
- Sidecar-ng-dashboard (interfaz de observabilidad opcional): Sidecar-ng-dashboard/
- Sidecar-Evolution (archivo de decisiones de evaluacion): Sidecar-Evolution/
- Documento de linaje y alcance del proyecto: SOUL.md
- Bundle de plugin de Claude: .claude-plugin/

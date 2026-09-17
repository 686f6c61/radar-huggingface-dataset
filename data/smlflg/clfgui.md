# smlflg/CLFGUI

## Resumen

CLFGUI (identificador `smlflg/CLFGUI`) es un repositorio publicado en HuggingFace que **no contiene un modelo de inteligencia artificial**, sino el codigo fuente de una aplicacion de escritorio nativa que actua como interfaz de propietario ("owner interface") para un kernel de agentes local. El autor lo describe como una herramienta para introducir una intencion, observar el plan en ejecucion, responder a las "human gates" (puntos de control humano) y revisar y aprobar el resultado final. La version V1 se presenta de forma deliberadamente minima y con cuatro capacidades basicas.

El diseno separa la interfaz grafica del kernel mediante la abstraccion `LocalAgentKernel`, de forma que ambos corren en el mismo proceso en la version actual, pero el kernel puede migrarse mas adelante a un demonio sin interfaz grafica ("headless daemon") manteniendo la misma API de cara a la aplicacion. Incluye un backend HTTP minimo denominado Hermes, que se puede arrancar por separado y que expone endpoints REST para gestionar contexto, agentes y ejecuciones.

Es relevante para desarrolladores que construyen pipelines de agentes locales y necesitan una capa de supervision humana con trazabilidad de ejecuciones, pero **no aporta pesos, arquitectura de red neuronal ni datos de entrenamiento**: cualquier ficha de modelo al uso (parametros, contexto, cuantizacion, benchmarks) no es aplicable a este repositorio. Los metadatos de HuggingFace no declaran licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica. Aplicacion de escritorio (Python) con backend HTTP local y kernel de agentes invocado como proceso externo (`hermes`) |
| Parametros totales | No aplica (el repositorio no contiene pesos de modelo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El README no documenta ventana de contexto; el contexto se gestiona via `GET/POST /api/context` |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (la documentacion esta en ingles; no se declaran idiomas de interfaz) |
| Licencia | No disponible (los metadatos de HuggingFace no la especifican) |
| Formato de pesos | No aplica. El repositorio es codigo Python instalable con `uv`; la base de datos local es SQLite |
| Autor | smlflg |
| Version | V1 (segun el README) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion registrada | 2026-09-16 |
| Ultima actualizacion registrada | 2026-09-16 |
| Tags | `region:us` |
| Pipeline declarado | No disponible |
| Dependencias de ejecucion | `uv sync --extra dev`; binario externo `hermes` (configurable via `CLFGUI_HERMES_BIN`) |
| Endpoints del backend | `GET /`, `GET /api/health`, `GET /api/agents`, `GET /api/context`, `POST /api/context`, `POST /api/run-agent`, `GET /api/runs`, `GET /api/runs/<run_id>` |
| Variables de configuracion | `CLFGUI_HERMES_PROFILES_DIR` (`Hermes/profiles`), `CLFGUI_BACKEND_STATE_DIR` (`.clfgui`), `CLFGUI_HERMES_BIN` (`hermes`), `CLFGUI_HERMES_TIMEOUT` (180 s), `CLFGUI_API_HOST` (`127.0.0.1`), `CLFGUI_API_PORT` (8765), `CLFGUI_DB_PATH` |

## Arquitectura y entrenamiento

No existe entrenamiento: CLFGUI no es un modelo generativo ni un sistema entrenado con datos. Se trata de una aplicacion de escritorio escrita en Python que integra, en un unico proceso, la interfaz de usuario y el kernel de agentes. La frontera entre ambos se mantiene explicita a traves de la clase `LocalAgentKernel`, cuyo objetivo declarado es permitir que el kernel se mueva posteriormente a un demonio headless sin cambiar la API que consume la aplicacion.

El componente de backend ("minimal Hermes backend") se arranca de forma independiente con `uv run clfgui-api` y delega la ejecucion de agentes en un binario externo, `hermes`, cuyo timeout por defecto es de 180 segundos. Los perfiles de agente se leen de `Hermes/profiles` y el estado del backend se guarda en `.clfgui`. La persistencia de ejecuciones se realiza en una base de datos SQLite ubicada por defecto en el directorio de datos de aplicacion de la plataforma, con posibilidad de sobrescribirla mediante `CLFGUI_DB_PATH`. No se documentan innovaciones tecnicas de inferencia (atencion lineal, decodificacion especulativa, RLHF/DPO) porque no aplican a este tipo de proyecto.

## Capacidades

- Interfaz de escritorio nativa para un kernel de agentes local, con cuatro flujos definidos en V1: introducir una intencion, observar el plan en ejecucion, responder a human gates y revisar y aprobar el resultado.
- Visualizacion del plan de ejecucion en curso, lo que da trazabilidad al proceso del agente.
- Mecanismo de "human gates": el flujo se detiene y solicita intervencion humana antes de continuar.
- Revision y aprobacion final del resultado producido por el agente.
- API HTTP local con endpoints para consultar salud del servicio, listar agentes, leer y escribir contexto, lanzar un agente (`POST /api/run-agent` con un `agent_id`, por ejemplo `planner`) y consultar ejecuciones individuales o listadas.
- Aceptacion de barras finales en rutas de coleccion (`/api/agents/` equivale a `/api/agents`).
- Persistencia de ejecuciones en SQLite y separacion explicita entre GUI y kernel mediante `LocalAgentKernel`.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni soporte multilingue, ya que esas funciones corresponderian al modelo que consuma el kernel, no a este repositorio.

## Casos de uso

- Supervision de agentes locales con intervencion humana: el flujo de human gates permite que un desarrollador apruebe o corrija cada paso critico antes de que el agente continue, util en tareas con efectos irreversibles sobre ficheros o sistemas.
- Ejecucion de tareas planificadas desde una intencion en lenguaje natural: se introduce la intencion en la GUI, el kernel genera un plan y el usuario observa su progreso, lo que resulta adecuado para automatizaciones internas de un solo operador.
- Integracion de agentes en herramientas de escritorio existentes: el backend HTTP en `127.0.0.1:8765` permite lanzar agentes desde otros procesos locales mediante `curl` o cualquier cliente HTTP, sin depender de la GUI.
- Auditoria de ejecuciones de agentes: los endpoints `GET /api/runs` y `GET /api/runs/<run_id>`, junto con la base SQLite, permiten revisar que se ejecuto, cuando y con que resultado.
- Desarrollo y prueba de perfiles de agente: al leer los perfiles desde `Hermes/profiles`, permite iterar sobre definiciones de agente en local antes de desplegarlas en un entorno headless.
- Prototipado de una arquitectura cliente-kernel desacoplada: el uso de `LocalAgentKernel` como frontera explicita sirve de base para migrar despues a un demonio sin GUI manteniendo la misma API.
- Gestion de contexto persistente entre pasos: los endpoints `GET /api/context` y `POST /api/context` permiten inyectar y recuperar el contexto que el agente debe tener en cuenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable, por lo que metricas como MMLU, HumanEval o GSM8K no son aplicables. Tampoco se documentan medidas de latencia ni de throughput de la aplicacion.

## Comparativa con modelos similares

No disponible. CLFGUI no es un modelo de lenguaje y no se dispone de datos de rendimiento, licencia declarada ni caracteristicas que permitan una comparacion cuantitativa con modelos de la misma categoria. La comparacion pertinente seria frente a otras interfaces de escritorio para agentes locales, pero la informacion proporcionada no incluye ninguna alternativa ni datos objetivos de ninguna de ellas.

## Limitaciones y advertencias

- El repositorio no contiene pesos, tokenizador ni artefactos de modelo; no puede usarse para inferencia.
- No se declara licencia en los metadatos de HuggingFace, lo que impide determinar si el uso comercial es posible. Debe consultarse el repositorio antes de cualquier uso en produccion.
- El README indica que V1 es "intencionadamente pequena" y esta limitada intencionadamente a cuatro flujos, por lo que no debe esperarse funcionalidad completa de orquestacion de agentes.
- La GUI y el kernel comparten proceso en la version actual; el desacoplamiento a un demonio headless se describe como trabajo futuro, no como capacidad existente.
- El backend depende de un binario externo (`hermes`) controlado por `CLFGUI_HERMES_BIN`; si no esta instalado en el `PATH` o la ruta configurada, la funcionalidad de agentes fallara.
- El timeout por defecto de `hermes` es de 180 segundos; tareas mas largas pueden ser interrumpidas salvo que se ajuste `CLFGUI_HERMES_TIMEOUT`.
- La API escucha por defecto en `127.0.0.1:8765`, es decir, solo en local; exponerla en otras interfaces requiere cambiar `CLFGUI_API_HOST` y anade riesgo de seguridad al no documentarse autenticacion.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto o idioma, porque estos aspectos dependerian del modelo subyacente que consuma el kernel.
- No se declaran idiomas soportados ni cobertura de internacionalizacion de la interfaz.
- Los contadores publicos del repositorio (0 descargas, 0 likes) y su fecha de actualizacion indican un proyecto sin adopcion documentada; no hay evidencia de mantenimiento continuado.
- La busqueda web asociada no devolvio informacion relacionada con el proyecto: los resultados obtenidos corresponden a contenidos sobre el videojuego Ghost Recon Breakpoint y no guardan relacion con CLFGUI.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/smlflg/CLFGUI
- No se han encontrado en la busqueda web enlaces relevantes al proyecto (paper, blog, repositorio de codigo, demo o documentacion adicional). El resto de resultados de la busqueda no esta relacionado con el modelo.

# Chuanhui-Zheng/Eval_uate_Me

## Resumen

`Eval_uate_Me` (nombre interno `eval_uate_me`) no es un modelo de lenguaje, sino un *harness* de evaluacion de agentes LLM publicado en Hugging Face por el usuario Chuanhui-Zheng. Se trata de una herramienta de software en Python (requiere Python 3.11 o superior) con cero dependencias en tiempo de ejecucion, disenada para ejecutar evaluaciones repetibles de agentes basados en LLM, bloquear regresiones en integracion continua y verificar que la propia evaluacion es capaz de detectar agentes defectuosos.

El proyecto se organiza en torno a un pipeline de cuatro etapas: carga de casos desde un fichero `cases.jsonl`, ejecucion del agente objetivo (via HTTP, funcion Python o plugin), aplicacion de graders y generacion de resultados, resumen y compuerta (`gate`). Su propuesta diferencial es el concepto de *meta-evaluacion*: mediante mutantes deliberados comprueba si la bateria de graders distingue un agente roto de uno correcto, exponiendo puntos ciegos.

La version estable actual es la v1.0.7 e incluye un agente de recuperacion con bucle multi-turno de herramientas, memoria de sesion, aislamiento mediante procesos o Docker, y tres ejemplos trabajados (triaje CVE, triaje de tickets y redaccion de respuestas de soporte). La model card no describe ningun modelo neuronal, pesos ni arquitectura de red, por lo que las secciones tecnicas habituales de una ficha de modelo no aplican y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (herramienta de software, no modelo neuronal) |
| Parametros totales | No disponible (no es un modelo) |
| Parametros activos | No disponible (no es un modelo) |
| Longitud de contexto | No disponible (no es un modelo) |
| Tipos de cuantizacion | No disponible (no es un modelo) |
| Idiomas soportados | No disponible (la documentacion esta en ingles) |
| Licencia | MIT (segun la model card) |
| Formato de pesos | No aplica; distribucion como codigo Python, instalable desde clon o wheel de release (no publicado en PyPI) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, por lo que no hay arquitectura de red, datos de entrenamiento ni proceso de RLHF/DPO. La "arquitectura" del proyecto es un *harness* modular con cuatro componentes encadenados: un `Runner` que lee casos desde `cases.jsonl`, un `Target` que representa el agente a evaluar (tipos integrados `http` y `python`, o clases plugin para agentes con estado), un conjunto de `Graders` que puntuan las salidas y una capa de resultados que produce resumen y compuerta de regresion.

La innovacion tecnica destacable es la *meta-evaluacion*: se definen mutantes en la configuracion TOML (`[[mutants]]`) que introducen fallos deliberados (por ejemplo, `flaw = "omit"` para omitir la respuesta) y el comando `meta-eval` clasifica cada mutante como `killed` (la evaluacion lo puntua significativamente peor), `survived` (la evaluacion no lo distingue, punto ciego) o `no-op`. El modo `--auto` degrada automaticamente cada campo de las salidas reales para descubrir puntos ciegos no previstos. El sistema de compuerta (`gate`) compara la ultima ejecucion con una linea base (`eval.baseline.json`), admite reglas de significancia estadistica (`significant_only`), umbrales minimos (`[gate.min]`) y caidas maximas (`[gate.max_drop]`), rechaza comparaciones entre datasets o splits distintos y falla si una metrica nombrada en las reglas no existe en la ejecucion. En Windows, con aislamiento `process`, los limites `cpu_limit_s` y `memory_limit_mb` no se aplican; para limites estrictos hay que usar `docker`.

## Capacidades

- Ejecucion de evaluaciones repetibles de agentes LLM a partir de ficheros de casos en formato JSONL.
- Validacion previa de configuracion y datos mediante el comando `check` antes de ejecutar.
- Soporte de objetivos de tres tipos: servicio HTTP (`http`), funcion Python (`python`) y plugins para agentes con estado.
- Compuerta de regresiones en CI con codigos de salida definidos (0 pasa, 1 regresion, 2 no se puede decidir) y anotaciones `::error::` automaticas en GitHub Actions.
- Meta-evaluacion con mutantes para verificar que la propia evaluacion detecta agentes defectuosos, incluido modo automatico de descubrimiento de puntos ciegos.
- Aislamiento de ejecucion mediante procesos o contenedores Docker.
- Ejemplo de agente de recuperacion multi-turno con bucle de herramientas y memoria de sesion.
- Soporte de graders deterministas y de jueces LLM para tareas de generacion abierta.
- Multiplataforma: CI en Linux (Python 3.11 y 3.12), Windows (3.11 y 3.12) y macOS (3.12); los tests de sandbox Docker solo en Linux.
- Cero dependencias en tiempo de ejecucion; ejemplos deterministas ejecutables sin conexion.

## Casos de uso

- Integracion continua de agentes LLM: ejecutar `eval_uate_me run eval.toml` seguido de `gate eval.toml` en cada pull request para bloquear fusiones que degraden la tasa de acierto por debajo del umbral configurado, con anotaciones automaticas en GitHub Actions.
- Validacion de la propia bateria de evaluacion: usar `meta-eval` con mutantes que omitan la respuesta, alteren el esquema o inyecten prompts maliciosos para comprobar que los graders detectan esos fallos antes de confiar en la compuerta.
- Triaje de vulnerabilidades CVE: el ejemplo `examples/cve_triage/` implementa un agente de recuperacion sobre 100 vulnerabilidades publicas del catalogo CISA KEV con 420 casos agrupados y 11 graders (esquema, identidad, CVSS, CWE, indicador KEV, producto afectado, referencias, fabricacion de datos, asercion de llamadas a herramientas, resistencia a inyeccion de prompt y aviso de seguridad).
- Clasificacion de tickets de soporte: el ejemplo `examples/ticket_triage/` evalua 50 tickets en 5 categorias y 3 niveles de urgencia con 3 graders, comparando un oraculo determinista con modelos reales mediante `eval.llm.toml`.
- Evaluacion de generacion abierta: el ejemplo `examples/support_reply/` evalua la redaccion de respuestas a 30 tickets mediante un juez LLM en tres dimensiones (aborda el problema, es accionable, tono adecuado), sin respuesta unica correcta.
- Comparativa de modelos sobre una misma tarea: configurar un objetivo LLM y ejecutar la misma bateria de casos contra varios modelos para obtener tasas de acierto comparables en el mismo split.
- Auditoria de agentes con estado: escribir un plugin de tipo `Target` para agentes que mantienen memoria de sesion o estado entre turnos, algo que los tipos `http` y `python` no cubren directamente.

## Benchmarks y rendimiento

La model card incluye un benchmark multi-modelo sobre el split de desarrollo del ejemplo de triaje CVE (25 casos por modelo), correspondiente a la ejecucion de la v1.0.5:

| Modelo | Tasa de acierto (dev split, 25 casos) |
|---|---|
| deepseek-v4.1-flash | 96,7 % |
| gpt-4o-mini | 91,6 % |
| claude-haiku-5.5 | 91,6 % |

Los resultados multi-modelo sobre el conjunto reservado (*held-out*) no se han publicado segun la model card. No se dispone de datos de latencia ni de throughput del harness.

## Requisitos de hardware

- No aplica VRAM para el propio harness: es codigo Python sin dependencias en tiempo de ejecucion, ejecutable en CPU.
- Requiere Python 3.11 o superior (los ejemplos de la documentacion usan Python 3.12 en un entorno virtual).
- El consumo de recursos depende del agente objetivo evaluado y del backend de juez LLM configurado, no del harness.
- Para limites estrictos de CPU y memoria se recomienda aislamiento `docker`; en Windows con aislamiento `process` esos limites no se aplican.
- Despliegue: instalacion desde clon (`pip install -e ".[dev]"`) o desde un wheel de release; no esta publicado en PyPI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Tipo | Dependencias en tiempo de ejecucion | Meta-evaluacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eval_uate_me | Harness de evaluacion de agentes LLM | Cero | Si (mutantes, modo `--auto`) | MIT | Hugging Face, clon o wheel; no en PyPI |
| Alternativas de evaluacion de LLM | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de comparaciones con otras herramientas de evaluacion (por ejemplo, frameworks de evaluacion de LLM ampliamente conocidos); los datos de dichas alternativas se indican como no disponibles.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no tiene pesos ni puede usarse para inferencia. Cualquier expectativa en ese sentido es un error de interpretacion del nombre del repositorio.
- El repositorio no declara pipeline, idiomas ni licencia en los metadatos de Hugging Face; la licencia MIT consta unicamente en la model card.
- No esta publicado en PyPI: la instalacion exige clonar el repositorio o descargar un wheel de release.
- Los resultados multi-modelo publicados corresponden solo al split de desarrollo (25 casos por modelo) de la v1.0.5; no hay resultados sobre el conjunto reservado, por lo que las cifras no deben tratarse como estimaciones generalizables.
- En Windows, con aislamiento `process`, los limites de CPU y memoria (`cpu_limit_s`, `memory_limit_mb`) no se aplican; en produccion conviene usar `docker`.
- Los tests de sandbox Docker solo se ejecutan en Linux; el comportamiento en otros sistemas con Docker no esta cubierto por la CI segun la model card.
- La compuerta falla de forma deliberada si una regla nombra una metrica ausente en la ejecucion, lo que exige mantener sincronizados configuracion y graders.
- La documentacion esta en ingles; no se declaran otros idiomas.
- Riesgo de sesgo y alucinacion: no aplica al harness en si, pero los graders basados en juez LLM (como en `support_reply`) heredan los sesgos y la variabilidad del modelo juez utilizado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Chuanhui-Zheng/Eval_uate_Me
- Documentacion incluida en el repositorio (rutas relativas a la raiz del proyecto): `docs/TUTORIAL.md`, `docs/REFERENCE.md`, `docs/API.md`, `docs/VERSIONING.md`, `docs/DESIGN.md`, `docs/ROADMAP.md`, `docs/RELEASING.md`
- Fichero de licencia: `LICENSE` (MIT)
- Ejemplos trabajados: `examples/cve_triage/`, `examples/ticket_triage/`, `examples/support_reply/`
- Paper, blog o demo externos: no disponibles en la informacion proporcionada.

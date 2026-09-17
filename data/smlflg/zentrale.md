# smlflg/Zentrale

## Resumen

`Zentrale` (smlflg/Zentrale) no es un modelo de lenguaje con pesos, sino un proyecto de software: una "central de agentes" local y adaptativa para arranque de proyectos, enrutado de tareas, generacion de context packs y delegacion a distintos harness de agentes. El autor lo describe como un **orquestador multi-harness determinista con delegacion sensible al contexto**, implementado bajo el patron supervisor: un proceso central decide, delega y hace seguimiento de workers especializados. Se situa por encima de Claude Code, Codex, OpenCode, Hermes y Gemini, y no usa pesos propios ni inferencia propia.

La pieza diferencial es la capa de enrutado y contexto: `KomandoZentral` aporta enrutado determinista, `MultiHarnessStudio` define esquemas spine y contratos de integracion, OpenCode actua como motor de ejecucion principal y los perfiles Markdown locales al proyecto proporcionan el contexto de harness, rol y fase. El autor aclara expresamente que no es un framework multi-agente completo: no hay chat agente-a-agente ni memoria compartida, y lo compara con una mezcla de expertos a nivel de agente o con un planificador tipo Kubernetes para agentes de IA.

El primer camino util esta deliberadamente acotado a cinco pasos: aceptar un master prompt, crear la carpeta de proyecto bajo `projects/`, escribir los documentos estandar desde plantillas, generar el context pack para fase y harness, y mantener validables la estructura de runs y registro. El repositorio incluye CLI (`python -m zentrale`), TUI de seis pantallas (Textual) y una interfaz web FastAPI/WebSocket local. No se han publicado parametros, pesos, benchmarks ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal. Orquestador multi-harness determinista con delegacion sensible al contexto (patron supervisor) |
| Parametros totales | No aplicable (no hay pesos ni red neuronal) |
| Longitud de contexto | No disponible (los context packs son Markdown generados por fase y harness; no se define ventana de tokens) |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No disponible (la documentacion y el README estan en aleman; las salidas de codigo dependen del harness delegado) |
| Licencia | No disponible |
| Formato de pesos | No aplicable (paquete Python distribuido como codigo fuente; sin safetensors ni GGUF) |

Datos adicionales de la ficha de HuggingFace: autor `smlflg`, 0 descargas, 0 likes, sin pipeline declarado, etiqueta `region:us`, creado el 2026-09-16 y actualizado el 2026-09-16.

## Arquitectura y entrenamiento

No existe entrenamiento ni dataset: `Zentrale` es una aplicacion Python que se ejecuta localmente. Su arquitectura se organiza en capas: una capa de enrutado determinista (`KomandoZentral`), una capa de esquemas e integracion (`MultiHarnessStudio`), OpenCode como motor de ejecucion preferente y perfiles Markdown por proyecto para el contexto de harness, rol y fase. La logica de seleccion de harness combina enrutado determinista (con `--use-kz`) con reglas estaticas por palabras clave (`suggest_static_route`) enriquecidas opcionalmente con datos de efectividad historica.

El estado se materializa en ficheros: `registry/profiles.json` define los perfiles de harness, `registry/phases.json` la referencia de fases (valor por defecto `intake`), `templates/` contiene plantillas de proyecto y de context pack, `integrations/` documenta puntos de integracion locales y `runs/` almacena los artefactos de ejecucion. Cada ejecucion de `run` produce un run record, log, estado, datos de efectividad, `DONE_CRITERIA.md` y una `LEARNING_PROPOSAL.md` local al proyecto. La delegacion a OpenCode usa por defecto `opencode-go/glm-5.1`, que no se reenvía a harness distintos de OpenCode. Las ejecuciones reales de OpenCode requieren permiso de escritura en `~/.local/share/opencode`; Zentrale no escribe ficheros de configuracion global de los harness.

## Capacidades

- Enrutado de tareas a harness: `route --task "..."` selecciona el harness adecuado mediante `KomandoZentral` o mediante reglas de palabras clave locales.
- Creacion y arranque de proyectos: `init-project --name ... --prompt-file ...` genera la carpeta bajo `projects/` y escribe los documentos estandar desde plantillas.
- Generacion de context packs: `context-pack --project ... --harness ... --phase ...` escribe packs con alcance de fase en `projects/<proyecto>/context-packs/<fase>/<harness>`.
- Ejecucion delegada con verificacion: `run` enruta, genera el pack, crea el run record, ejecuta el harness y escribe log, estado, efectividad, `DONE_CRITERIA.md` y `LEARNING_PROPOSAL.md`; admite `--verification "pytest"`.
- Aprendizaje a partir de ejecuciones: `learning-proposals --project ...` produce propuestas de mejora por proyecto.
- Monitorizacion en terminal: TUI Textual con seis pantallas (Runs, Tasks, Logs, Run, Phases, Costs), navegacion con teclas `1`-`6`, `j/k`, `Space`, `Ctrl+S`, `?` para ayuda y `Ctrl+C` para salir; la pantalla Runs refresca cada 1 s.
- Interfaz web local: `serve --host 127.0.0.1 --port 8777` levanta FastAPI con WebSocket y sirve la SPA estatica bajo `/static/*`.
- API HTTP: endpoints `/health`, `/api/phases`, `/api/projects`, `/api/runs`, `/api/routes`, `/api/effectiveness` y `/api/costs`.
- Gestion de tareas y costes: `tasks --project ...`, `logs --run ...`, `costs` y `phase --project ...` como pantallas individuales fuera del dashboard.
- Validacion y diagnostico: `validate`, `doctor`, `scripts/validate_skeleton.py` y bateria `pytest -q` como puerta final.
- No se documentan capacidades de generacion de texto, vision, audio, tool calling propio ni razonamiento: esas capacidades pertenecen a los harness externos a los que delega.

## Casos de uso

- Arranque estandarizado de repositorios de proyecto: con `uv run python -m zentrale init-project --name ejemplo --prompt-file docs/vision.md` se crea la estructura bajo `projects/` y se escriben los documentos base desde plantillas, lo que evita configuraciones ad hoc distintas en cada proyecto.
- Enrutado automatico de tareas al harness mas adecuado: `route --task "implementiere die erste Funktion"` decide el destino; con `--use-kz` la decision la toma `KomandoZentral`, y sin el flag se aplican reglas de palabras clave apoyadas en datos de efectividad previos. Es util cuando un equipo alterna entre Claude Code, Codex, Gemini y OpenCode y quiere criterios consistentes.
- Inyeccion de contexto por fase y harness: antes de lanzar un agente se genera un context pack en `projects/<proyecto>/context-packs/<fase>/<harness>` usando `registry/profiles.json` y `registry/phases.json`. Esto permite que cada fase (por ejemplo `intake`, `planning`) reciba solo el contexto relevante en lugar del repositorio completo.
- Ejecucion delegada con puerta de verificacion: `run --use-kz --project projects/beispiel --task "..." --instructions-file projects/beispiel/TASKS.md --verification "pytest"` ejecuta el harness, registra el run y deja `DONE_CRITERIA.md` como criterio objetivo de finalizacion; encaja en flujos donde no basta con que el agente afirme haber terminado.
- Seguimiento en vivo de agentes de larga duracion: el dashboard Textual con la pantalla Runs actualizada cada 1 s y el tail en vivo de `log.json` de la pantalla Logs permite vigilar harness, fase, estado, duracion y coste sin salir del terminal.
- Panel de control web para equipo: `serve --host 127.0.0.1 --port 8777` expone runs, rutas, efectividad y costes mediante API HTTP, de modo que la SPA estatica pueda mostrar el estado del proyecto a varias personas sin acceso al terminal del operador.
- Control de costes por proyecto: la pantalla Costs y el endpoint `/api/costs` agregan estimaciones de tokens por run, lo que permite comparar el coste relativo de delegar la misma tarea a distintos harness.
- Comparison de harnesses basada en evidencia: los datos de efectividad acumulados alimentan `suggest_static_route`, de modo que el enrutado se puede ajustar segun que harness resolvio mejor tareas similares en ese proyecto concreto.
- Mejora continua del proyecto: `learning-proposals --project projects/beispiel` extrae propuestas locales a partir de lo aprendido en ejecuciones previas, reutilizables como insumo para las siguientes fases.
- Integracion en CI/CD: la secuencia de validacion (`python -m zentrale validate`, `doctor`, `scripts/validate_skeleton.py`, `pytest -q`) puede ejecutarse como gate de integracion para impedir que la estructura de runs, registro y context packs quede inconsistente; el autor recomienda capturar `git status --short` antes de cada slice de hardening y esperar un diff limpio solo en los ficheros acordados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no existir pesos ni inferencia propia, no aplican metricas tipo MMLU, HumanEval o GSM8K. Las unicas cifras operativas documentadas son la frecuencia de refresco de la pantalla Runs (1 s), el puerto por defecto de la interfaz web (8777) y el modelo por defecto de delegacion a OpenCode (`opencode-go/glm-5.1`).

## Requisitos de hardware

- VRAM: no aplicable al orquestador; no ejecuta inferencia. La VRAM necesaria depende exclusivamente del harness o modelo externo que se invoque.
- CPU y sistema: cualquier maquina capaz de ejecutar Python con `uv` y los harness locales instalados (Claude Code, Codex, OpenCode, Hermes, Gemini).
- GPU recomendadas: no disponibles; las determina el modelo subyacente del harness, no Zentrale.
- GPU de consumo: no aplicable al orquestador.
- Despliegue: ejecucion local como modulo Python (`python -m zentrale`), TUI con Textual (`dashboard`) y servidor FastAPI/WebSocket (`serve`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no sirve un modelo.
- Almacenamiento y permisos: requiere acceso de escritura en `~/.local/share/opencode` para ejecuciones reales de OpenCode; no escribe configuracion global de los harness.
- Latencia y throughput: no disponibles. El rendimiento dependera del harness delegado y de la verificacion configurada.

## Comparativa con modelos similares

`Zentrale` no es un modelo de lenguaje, por lo que no existe una comparativa directa con modelos de parametros similares. La informacion proporcionada no incluye datos verificables de otras herramientas de orquestacion, de modo que no se puede elaborar una tabla comparativa con cifras.

| Criterio | Zentrale | Alternativas de orquestacion de agentes |
|---|---|---|
| Categoria | Orquestador multi-harness local (patron supervisor) | Frameworks multi-agente y orquestadores: no disponible |
| Parametros | No aplicable | No disponible |
| Contexto | Context packs Markdown por fase y harness | No disponible |
| Rendimiento | Sin benchmarks publicados | No disponible |
| Licencia | No disponible | No disponible |
| Disponibilidad | Repositorio bajo `smlflg/Zentrale` en HuggingFace, 0 descargas y 0 likes | No disponible |

## Limitaciones y advertencias

- No es un modelo: no genera texto por si mismo, no tiene pesos, no se puede cuantizar ni ejecutar con vLLM, llama.cpp u Ollama.
- El propio autor acota el alcance: no hay chat agente-a-agente ni memoria compartida, por lo que no debe presentarse como un framework multi-agente completo.
- Dependencia fuerte de herramientas externas: sin Claude Code, Codex, OpenCode, Hermes o Gemini instalados y accesibles, la capa de delegacion no tiene destino util.
- El enrutado es determinista por diseno; sin datos de efectividad previos, la seleccion de harness recae en reglas de palabras clave, lo que puede dar rutas suboptimas al principio.
- Requiere permiso de escritura en `~/.local/share/opencode` para ejecuciones reales de OpenCode, algo que puede chocar con politicas de seguridad corporativas.
- Licencia no declarada: no se puede confirmar el uso comercial ni los terminos de redistribucion; conviene aclararlo con el autor antes de integrarlo en produccion.
- Documentacion y mensajes en aleman; no se declaran idiomas soportados para la interfaz ni para las interacciones.
- Madurez no validada: 0 descargas y 0 likes en HuggingFace, repositorio con fechas de creacion y actualizacion separadas por dos segundos.
- Las fechas de metadatos (2026-09-16) son posteriores a la fecha habitual de consulta, lo que conviene verificar antes de citar el proyecto.
- Sin benchmarks ni pruebas de carga publicados: no hay datos de latencia, throughput ni comportamiento con multiples runs concurrentes.
- La verificacion de resultados depende de que el harness respete `DONE_CRITERIA.md` y `--verification`; Zentrale registra el resultado, pero no garantiza la correccion del codigo producido por el agente externo.
- El autor advierte de que los artefactos locales como `artifacts/` no se limpian ni reescriben, por lo que el estado en disco puede acumularse entre ejecuciones.

## Enlaces

- Ficha de HuggingFace: https://huggingface.co/smlflg/Zentrale
- La busqueda web realizada no devolvio ningun enlace relacionado con el proyecto; los resultados obtenidos correspondian a entradas de lexico arabe sobre la palabra "ثآليل", sin ninguna conexion con `Zentrale`.
- Rutas internas relevantes citadas en la model card (relativas al repositorio): `src/zentrale/`, `src/zentrale/web/static/`, `templates/`, `registry/profiles.json`, `registry/phases.json`, `integrations/`, `projects/`, `runs/`, `docs/`, `scripts/validate_skeleton.py`.

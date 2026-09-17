# smlflg/KomandoZentral

## Resumen

KomandoZentral (nombre interno del proyecto, Kommandozentrale) no es un modelo de lenguaje: es una aplicacion Python que implementa un motor de routing determinista y basado en reglas para harnesses de IA, con interfaz de linea de comandos (CLI) y una interfaz web local servida con FastAPI. Su funcion es recibir la descripcion de una tarea junto con un conjunto de flags que describen el estado del operador y las caracteristicas del trabajo, clasificarla heuristicamente y devolver una decision estructurada en YAML con la ruta recomendada y un nivel de confianza asociado. No contiene pesos, no ejecuta inferencia y no realiza ninguna llamada a un modelo por si misma.

El problema que aborda es el de la orquestacion auditable: en lugar de delegar la decision de que harness, perfil o estrategia usar en un LLM, la resuelve con reglas explicitas en dos etapas y heuristicas de clasificacion, de modo que el resultado es reproducible y verificable. Los parametros de entrada se dividen en estado del operador (--focus, --adhd-risk, --drift-risk, --energy, --mode, --cost-tolerance) y modificadores de tarea para BUILD/ANALYZE (--codebase-depth, --blast-radius, --cause-ambiguity, --reversibility, --verification).

El repositorio de HuggingFace esta publicado por el usuario smlflg, registra 0 descargas y 0 likes, y solo lleva la etiqueta region:us. No declara licencia, idiomas ni pipeline. La fecha de creacion registrada es el 16 de septiembre de 2026 y la de actualizacion el mismo dia, lo que indica una publicacion sin actividad posterior documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo neuronal. Motor de reglas determinista en Python con clasificacion heuristica y routing en dos etapas |
| Parametros totales | No aplica (no hay pesos) |
| Parametros activos | No aplica (no es un MoE) |
| Longitud de contexto | No aplica: la entrada es una cadena de tarea y un conjunto de flags de CLI |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible. La CLI, los flags y la documentacion estan en aleman; no se declara soporte multilingue ni internacionalizacion |
| Licencia | No disponible. Ni la model card ni los metadatos de HuggingFace la especifican |
| Formato de pesos | No aplica: se distribuye codigo fuente Python como proyecto instalable (uv sync, pip install -e .), no pesos en safetensors ni GGUF |
| Autor | smlflg |
| Fecha de creacion | 2026-09-16 |
| Fecha de actualizacion | 2026-09-16 |
| Descargas | 0 |
| Likes | 0 |
| Etiquetas | region:us |
| Pipeline declarado | No disponible (ninguno) |
| Interfaces | CLI (kz, python -m kz), API HTTP (FastAPI + uvicorn), interfaz web local en 127.0.0.1:8000 |
| Dependencias de desarrollo | uv, pytest, ruff, build |
| Formatos de salida | YAML (segun DECISION_OUTPUT_SCHEMA.md) |

## Arquitectura y entrenamiento

No existe entrenamiento. El sistema es un programa determinista sin componente de aprendizaje automatico entrenado. Su estructura modular separa responsabilidades: cli.py como punto de entrada, service.py como pipeline de routing comun a CLI y web, web.py con FastAPI y la interfaz, models.py con enums y dataclasses, classify.py con la clasificacion heuristica, operator_state.py con los valores por defecto del estado del operador, registry.py con los perfiles de harness, rules.py con el routing de etapa 1 y etapa 2, confidence.py con el calculo de confianza y persist.py con la serializacion a YAML.

La logica de confianza aplica tres umbrales: por encima de 70 se emite una recomendacion directamente utilizable; entre 50 y 69 se genera un bloque experiment para contrastar como hipotesis; por debajo de 50 no se emite recomendacion operativa. Las decisiones pueden persistirse en el directorio DECISIONS/ mediante el flag --save, y el sistema mantiene un registro de resultados en DATA/outcomes.yaml. Ambos directorios son salidas de ejecucion y se excluyen deliberadamente del control de versiones, por lo que el estado no viaja con el codigo.

No se documenta ningun dataset, numero de tokens, proceso de RLHF ni DPO, ni innovacion tecnica de inferencia (no hay decodificacion especulativa, atencion lineal ni mecanismos equivalentes), porque no hay modelo subyacente. La unica fuente de comportamiento son las reglas y heuristicas del codigo.

## Capacidades

- Clasificacion heuristica de una tarea descrita en lenguaje natural y asignacion de una ruta mediante reglas en dos etapas.
- Parametrizacion del estado del operador mediante --focus (high/medium/low), --adhd-risk (high/normal), --drift-risk (high/normal), --energy (high/low), --mode (exploration/shipping/default) y --cost-tolerance (sparend/normal/quality-first).
- Parametrizacion de la tarea mediante --codebase-depth (single-file/multi-file/full-codebase), --blast-radius (isolated/multi-file/production-critical), --cause-ambiguity (known/suspected/unknown), --reversibility (easy/hard/destructive) y --verification (auto-tests/manual-tests/no-tests).
- Calculo de un nivel de confianza numerico con reglas de decision asociadas a los umbrales 70 y 50.
- Persistencia de decisiones en YAML dentro de DECISIONS/ y seguimiento de resultados en DATA/outcomes.yaml.
- API HTTP con los endpoints GET /health, POST /api/route, GET /api/decisions y GET /api/decisions/{filename}.
- Interfaz web local que reutiliza exactamente la misma pipeline de routing que la CLI.
- Empaquetado y control de calidad con uv build, pytest y ruff.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente. Tampoco ejecuta tareas: solo enruta.

## Casos de uso

- Enrutado previo en un harness de agentes: antes de lanzar una tarea de codigo, el sistema recibe la descripcion y los flags de riesgo y devuelve una ruta YAML con la estrategia recomendada; al ser determinista, el resultado es reproducible en cada ejecucion y auditable en revisiones de codigo.
- Triaje de incidencias en produccion: combinando --blast-radius production-critical, --reversibility destructive y --verification auto-tests, el motor puede forzar rutas conservadoras para cambios irreversibles, dejando constancia en DECISIONS/ de por que se eligio esa ruta.
- Planificacion de exploracion tecnica: con --mode exploration y --focus high se pueden encaminar tareas de investigacion (por ejemplo, comparar alternativas a una base de datos) hacia un perfil de harness orientado a exploracion en lugar de a entrega.
- Integracion como microservicio interno: exponiendo POST /api/route, otros sistemas pueden consultar la decision de routing sin depender de la CLI, y consultar el historico mediante GET /api/decisions y GET /api/decisions/{filename}.
- Estandarizacion de decisiones de equipo: al persistir cada decision en YAML con un esquema fijo (DECISION_OUTPUT_SCHEMA.md), el equipo obtiene un registro uniforme y comparable de como se encamino cada tarea y con que nivel de confianza.
- Seguimiento de aciertos mediante outcomes: DATA/outcomes.yaml permite registrar el resultado posterior de cada decision y revisar si los umbrales de confianza estan bien calibrados.
- Uso en entornos con requisitos de determinismo: al no depender de un LLM, la ruta no varia por temperatura, version de modelo ni proveedor externo, lo que facilita la reproduccion de experimentos y la trazabilidad.
- Despliegue local para desarrollo individual: la interfaz web en 127.0.0.1:8000 permite operar el mismo pipeline sin usar terminal, lo que reduce la friccion para usuarios que solo necesitan pegar una descripcion de tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente menciona comprobaciones de calidad de software (uv run pytest -q, uv run ruff check ., uv build), sin cifras de cobertura de pruebas, latencia ni throughput. No hay datos de MMLU, HumanEval, GSM8K ni de cualquier otra metrica comparable, y no procede extrapolarlos porque no existe modelo subyacente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica. El motor de reglas es codigo Python que se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna. No hay aceleracion por GPU ni dependencia de CUDA.
- Viabilidad en hardware de consumo: si. Cualquier equipo capaz de ejecutar Python y uvicorn deberia ser suficiente; no se publican requisitos minimos de CPU ni de memoria.
- Opciones de despliegue: instalacion local con uv sync --dev o pip install -e .; CLI con uv run kz o uv run python -m kz; servidor web con uv run kz-web o uv run python -m uvicorn kz.web:app --reload. El servidor de desarrollo escucha en 127.0.0.1:8000, por lo que la model card apunta a un uso local. No se documenta despliegue en contenedores, ni con vLLM, llama.cpp, Ollama o TGI, que no aplican.
- Latencia y throughput estimados: no disponibles. No se publican mediciones.
- Nota: el sistema si puede enviar tareas a modelos externos, pero ese consumo de recursos depende del harness de destino y no esta cuantificado en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos verificables sobre alternativas de la misma categoria (routers deterministas o capas de orquestacion para harnesses de IA), ni sobre routers semanticos basados en modelos, por lo que no es posible construir una comparacion con parametros, contexto, rendimiento y licencia sin inventar cifras.

| Criterio | KomandoZentral | Alternativas |
|---|---|---|
| Categoria | Motor de routing deterministico basado en reglas, con CLI y API | No disponible |
| Parametros | No aplica | No disponible |
| Longitud de contexto | No aplica | No disponible |
| Rendimiento | Sin datos publicados | No disponible |
| Licencia | No disponible | No disponible |
| Disponibilidad | Repositorio en HuggingFace (smlflg/KomandoZentral) | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no mantiene conversaciones, no razona ni responde preguntas. Cualquier expectativa de uso como LLM es un error de interpretacion del repositorio.
- La licencia no esta declarada ni en la model card ni en los metadatos de HuggingFace. Sin una licencia explicita no hay autorizacion clara de uso comercial, redistribucion ni modificacion; conviene contactar con el autor antes de integrarlo en un producto.
- El repositorio registra 0 descargas y 0 likes, con fecha de actualizacion identica a la de creacion. No hay evidencia externa de uso, validacion ni mantenimiento.
- La calidad del routing depende por completo de las heuristicas de classify.py y rules.py. Los casos fuera del alcance de esas reglas produciran clasificaciones pobres o confianza baja, sin mecanismo de aprendizaje que lo corrija.
- El sistema emite decisiones, no acciones. No verifica por si mismo si la decision fue correcta; la utilidad del registro en DATA/outcomes.yaml depende de que el operador lo alimente manualmente.
- La interfaz esta documentada en aleman y no se declara internacionalizacion. Los valores de los flags (sparend, quality-first, etc.) estan en aleman, lo que puede generar errores de uso en equipos no germanoparlantes.
- El servidor web se levanta en 127.0.0.1:8000 y la documentacion no describe autenticacion, control de acceso ni endurecimiento para exposicion en red. No deberia publicarse en una interfaz externa sin trabajo adicional.
- DECISIONS/ y DATA/ son salidas de ejecucion no versionadas: el historico de decisiones y de resultados es local y se pierde si no se respalda.
- No hay datos de benchmarks, latencia ni throughput, por lo que no es posible estimar su comportamiento en cargas altas ni compararlo objetivamente con otras herramientas.
- Las fechas registradas (2026) y la ausencia de pipeline declarado dificultan situar el estado real del proyecto. Se recomienda revisar el codigo fuente antes de adoptarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/smlflg/KomandoZentral
- Documentos internos citados en la model card (sin URL publica disponible): DECISION_OUTPUT_SCHEMA.md, WEB_UI_PLAN.md, BETA_SCOPE.md, OPENCODE_HANDOFF.md, OPENCODE_PROMPT_BETA.txt
- La busqueda web realizada no devolvio ningun enlace relevante sobre este proyecto: los resultados corresponden a hilos del foro de desarrolladores de Roblox (https://devforum.roblox.com/) sin relacion con el modelo o la herramienta descrita.

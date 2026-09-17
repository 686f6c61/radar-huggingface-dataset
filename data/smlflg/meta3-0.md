# smlflg/Meta3.0

## Resumen

Meta3.0 (identificador `smlflg/Meta3.0`) no es un modelo de inteligencia artificial con pesos entrenados, sino un repositorio de orquestacion y control experimental alojado en HuggingFace. La model card lo describe en aleman como un "Overnight Control Plane": una estructura de carpetas, scripts y contratos de evidencia cuyo proposito es preparar evaluaciones masivas contra modelos Qwen o APIs externas sin lanzarlas de forma accidental. No contiene ficheros de pesos, tokenizador, configuracion de transformer ni ningun artefacto de inferencia.

El repositorio se organiza en torno a dos lineas: Meta2.0, presentada como la pipeline de datos encargada del inventario de sesiones y de los digests de capa 1, y Meta3.0, que actua como capa de verificacion, diseno experimental y sintesis sobre la anterior. Segun la documentacion, el objetivo es determinar que afirmaciones derivadas de los digests de Meta2.0 son realmente sostenibles, mediante contratos de evidencia, busqueda de contraejemplos y planificacion por lotes.

Su relevancia es metodologica mas que tecnica: impone puertas de control (gates) que impiden gastar presupuesto de API antes de validar la coherencia de las fuentes, y propone un bucle de calibracion previo al escalado. El repositorio registra 0 descargas y 0 likes, no declara licencia ni idiomas, y fue creado y actualizado el 16 de septiembre de 2026, con un segundo de diferencia entre ambos eventos, lo que sugiere un uso personal o un volcado inicial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de red neuronal; es un conjunto de scripts Python y ficheros de configuracion) |
| Parametros totales | no disponible (no contiene pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la documentacion esta redactada en aleman) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no incluye safetensors, GGUF ni ningun otro formato de pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El contenido descrito en la model card es una jerarquia de directorios con funciones concretas: `config/` para preguntas y perfiles de ejecucion, `docs/evals/` para especificaciones de evaluacion bloqueantes, `requirements/` para requisitos entrantes, `scripts/` para utilidades locales de preparacion y planificacion, `runs/` para un directorio por intento nocturno, `data/` para artefactos intermedios, `reports/` para informes humanos y `logs/` para registros locales.

La logica de proceso se define en `docs/META3_PROCESS.md` y `config/process_model.json`. La secuencia de scripts incluye `meta3_smoke.py`, `meta3_prepare.py`, `meta3_plan_batches.py`, `meta3_freeze_sources.py`, `meta3_build_workpackets.py`, `meta3_validate_run.py`, `meta3_run_packets.py`, `meta3_runner_status.py`, `meta3_preflight.py`, `meta3_collect_responses.py`, `meta3_morning_report.py` y `meta3_orchestrate_local.py`. Salvo que se pase `--execute-network`, el runner opera en modo dry-run y no realiza llamadas de red.

El diseno incorpora mecanismos de seguridad tipo "start gate": un lanzamiento nocturno real solo puede comenzar si `requirements/PENDING.md` ha sido sustituido por requisitos concretos, si el smoke test se ejecuta sin errores, si se generan manifiesto de run y plan de lotes, si el marco de llamadas, coste y concurrencia ha sido aceptado explicitamente y si no se vulnera el contrato de mejora definido en `config/experiment_design.json`. Existe ademas un gate de "source drift" que detiene la construccion de workpackets si la auditoria de Meta2.0 y la copia de digests no estan sincronizadas.

## Capacidades

- Preparacion de runs experimentales sin ejecucion de API: genera carpetas de run, planes de lotes, prompts y libros de registro de llamadas (call ledger) de forma puramente local.
- Modo dry-run por defecto en el runner, con activacion explicita de red mediante `--execute-network`.
- Congelacion de fuentes (`meta3_freeze_sources.py`) para trabajar contra una instantanea local y evitar deriva de datos.
- Deteccion de desincronizacion entre la auditoria de Meta2.0 y los ficheros de digests brutos.
- Validacion de coherencia de un run antes de ejecutarlo (`meta3_validate_run.py`).
- Control de presupuesto de llamadas mediante parametros como `--accepted-call-budget`, con valores de ejemplo de 10, 100.000 o 10.000.000.
- Generacion de informes matutinos agregados (`meta3_morning_report.py`) a partir de las respuestas recogidas.
- Modos de operacion diferenciados: calibracion y escalado, con muestreo configurable (`--mode calibration --sample-size 24`).
- Orquestacion local mediante `meta3_orchestrate_local.py`.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, vision, tool calling ni agentes, al no contener un modelo subyacente.

## Casos de uso

- Orquestacion de evaluaciones masivas contra APIs de modelos: el repositorio permite planificar lotes y generar workpackets para un runner externo, de modo que el volumen de llamadas se decide antes de gastar presupuesto. Es adecuado porque separa la fase de planificacion local de la fase de ejecucion con red.
- Control de coste en experimentos con LLM: los parametros de presupuesto aceptado y los gates de preflight permiten fijar un techo de llamadas antes de cualquier ejecucion real, evitando fugas de gasto por lanzamientos accidentales.
- Reproducibilidad de experimentos: la congelacion de fuentes y el uso de instantaneas locales permiten repetir un run contra exactamente los mismos datos de entrada, algo critico cuando la fuente original puede cambiar entre ejecuciones.
- Auditoria de pipelines de datos previas: el gate de "source drift refused" detecta cuando la auditoria de Meta2.0 y los digests no coinciden, lo que sirve como control de integridad en cadenas de procesamiento por capas.
- Diseno experimental con contrato de evidencia: el proceso Meta3 esta pensado para verificar que afirmaciones derivadas de datos agregados son sostenibles y para buscar contraejemplos, lo que encaja en fases de validacion metodologica antes de publicar conclusiones.
- Ejecucion nocturna supervisada: el flujo de run por noche, con informe matutino posterior, permite lanzar trabajos largos y revisar resultados agregados a la manana siguiente sin intervencion continua.
- Evaluacion por shards de datos en lugar de por preguntas: la documentacion recomienda estabilizar primero los digests de sesion y despues responder preguntas, lo que resulta util en pipelines donde el fanout por pregunta genera redundancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable, por lo que no existen metricas tipo MMLU, HumanEval o GSM8K asociadas.

## Requisitos de hardware

- VRAM para inferencia: no aplica, no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica. El repositorio se ejecuta como scripts de Python en CPU.
- Compatibilidad con GPU de consumo: no aplica en la fase de planificacion; no se describe ningun componente acelerado por GPU.
- Opciones de despliegue: ejecucion local mediante Python 3 y los scripts de `scripts/`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Dependencias: gestionadas mediante el directorio `requirements/`, aunque su contenido exacto no esta disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles. No se aportan mediciones de rendimiento.
- Requisitos de entorno: la model card referencia rutas locales absolutas como `/home/smlflg/Projekte/Meta2.0`, lo que implica dependencia de una estructura de directorios concreta.
- Recursos externos: si finalmente se habilita `--execute-network`, el consumo de recursos dependera del proveedor de API y del presupuesto de llamadas aceptado.

## Comparativa con modelos similares

No disponible. Meta3.0 no es un modelo de lenguaje ni un sistema de inferencia, por lo que no existe una comparativa valida con modelos de parametros, contexto o licencia similares, ni con alternativas de la misma categoria de pesos. Tampoco se han encontrado en la busqueda web herramientas de orquestacion experimental directamente comparables que esten vinculadas a este repositorio.

## Limitaciones y advertencias

- No contiene pesos, tokenizador ni configuracion de inferencia: no puede utilizarse como modelo generativo bajo ninguna circunstancia.
- Ausencia de licencia declarada: sin licencia explicita no puede asumirse permiso de uso comercial ni de redistribucion.
- Documentacion unicamente en aleman, lo que limita su adopcion por parte de equipos hispanohablantes o angloparlantes sin traduccion previa.
- Estado inicial del repositorio: 0 descargas y 0 likes, con creacion y actualizacion separadas por un segundo, lo que indica ausencia de validacion por parte de la comunidad.
- Dependencia de rutas locales absolutas (`/home/smlflg/Projekte/Meta2.0`), lo que dificulta su reutilizacion directa en otras maquinas o entornos de CI.
- Riesgo de coste elevado: los ejemplos de presupuesto llegan a 10.000.000 de llamadas aceptadas en `meta3_orchestrate_local.py`, cifra que exige control explicito antes de ejecutar.
- El flujo esta bloqueado por defecto hasta que se cumplan las condiciones del start gate, incluida la sustitucion de `requirements/PENDING.md`, por lo que no es operativo tal cual se distribuye.
- La informacion sobre el inventario de Meta2.0 corresponde a observaciones locales parciales (216 de 1.104 ficheros de sesion, 19,57 % de cobertura) y no a un resultado consolidado.
- Los enlaces devueltos por la busqueda web no guardan relacion con el repositorio, por lo que no aportan contexto verificable sobre el proyecto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/smlflg/Meta3.0
- No se han encontrado en la busqueda web enlaces relevantes (papers, blogs, repositorios o demos) asociados a este proyecto. Los resultados obtenidos corresponden a otros temas sin relacion.

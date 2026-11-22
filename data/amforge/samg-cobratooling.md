# AMFORGE/samg-cobratooling

## Resumen

SAM-G-CobraTooling es un modelo de lenguaje de 30,3 millones de parámetros desarrollado por AMFORGE (AMEFORGE) como capa local de orquestación para un IDE agéntico denominado CobraBub. Se trata de un ajuste fino supervisado de SAM-G-Reasoning sobre 196.000 trazas de orquestación agéntica, y su función no es generar código, sino transformar una instrucción en lenguaje natural —o la observación de un paso anterior— en un plan JSON ordenado de llamadas a herramientas, cada una etiquetada con una marca de riesgo (`safe` o `critical`).

El modelo se posiciona como una pieza de infraestructura más que como un asistente general: enruta, descompone, mantiene estado, reacciona a códigos de salida y estados HTTP, y emite llamadas estructuradas completamente en local. La escritura de código se delega explícitamente a un modelo mayor mediante la operación `ask_code_model`. Por su tamaño reducido (121 MB en fp32, aproximadamente 30 MB cuantizado) y su empaquetado en ONNX, está pensado para ejecutarse en CPU sin PyTorch ni servicios en la nube.

Su relevancia actual radica en la combinación de tres factores: despliegue en el borde (edge) con requisitos de hardware mínimos, soporte de orquestación de servidores MCP (Model Context Protocol) con un 83 % de acierto exacto en la familia correspondiente, y un formato de salida estructurado con puerta de confirmación por riesgo. La licencia es BSL-1.1, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base SAM-G-Reasoning); detalles internos no disponibles |
| Parametros totales | 30,3 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp32 (121 MB); version cuantizada (~30 MB) mencionada sin especificar el esquema |
| Idiomas soportados | Ingles, frances |
| Licencia | BSL-1.1 (Business Source License 1.1) |
| Formato de pesos | ONNX (`samg-cobratooling.onnx` + `.onnx.data`, ~117 MB); checkpoint PyTorch (`samg_cobratooling_best.pt`); tokenizer SentencePiece (`samg_tokenizer.model`) |

## Arquitectura y entrenamiento

El modelo parte de SAM-G-Reasoning dentro de la linaje SAM-G → SAM-G-Reasoning → SAM-G-CobraTooling. El ajuste fino consistió en SFT con enmascaramiento de prompt (la pérdida se calcula únicamente sobre el span del plan), programación de tasa de aprendizaje coseno con valor inicial 8e-5, 10.000 pasos de entrenamiento y mejor checkpoint en el paso 6.000. El conjunto de entrenamiento son 196.000 trazas de orquestación agéntica. No se detalla en la información disponible la composición del dataset, el número de tokens totales ni si hubo fases de RLHF o DPO.

La innovación técnica principal no está en la arquitectura, sino en el formato de salida y en el empaquetado: el modelo emite directamente JSON estructurado con un campo `risk` por operación, y se distribuye con una exportación ONNX verificada el 22 de noviembre de 2026 (diferencia máxima de logits de 2,67e-05 frente a PyTorch, argmax idéntico, entre 2,5 y 3 veces más rápido en CPU). El runtime de inferencia es SparseMind Runtime, de código abierto, que no requiere PyTorch ni código de arquitectura.

## Capacidades

- Enrutamiento de instrucciones a una única herramienta con alta fiabilidad (familia `single_tool` al 100 % de coincidencia exacta).
- Descomposición de instrucciones en planes ordenados de llamadas a herramientas en formato JSON.
- Reacción a observaciones: códigos de salida (`retry_loop`), stdout/stderr (`feedback_react`), estados HTTP (`api_call`), recuentos de filas de base de datos (`db_query`), payloads de webhook (`webhook_wait`) y eventos de cambio de fichero (`fs_watch`).
- Emisión de llamadas estructuradas a servidores MCP (filesystem, GitHub, PostgreSQL) con un 83 % de acierto exacto.
- Clasificación de riesgo por operación (`safe` / `critical`) con un 94 % de fidelidad, orientada a prellenar la puerta de confirmación del IDE.
- Gestión de flujos de trabajo Git (`git_workflow`: status → add → push, con control de riesgo) y de investigación con scraping (`scrape_research`: fetch → summarize → act).
- Delegación de escritura de código a un modelo mayor mediante `ask_code_model` y `write_file`.
- Operaciones de control: `retry`, `escalate`, `backoff`, `reauth`, `continue`, `stop`.
- Multilingüismo limitado a inglés y francés.
- No soporta visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Orquestación local de un IDE agéntico: el modelo recibe la instrucción del desarrollador y emite un plan JSON ordenado de operaciones que el IDE ejecuta secuencialmente, con las operaciones `critical` retenidas hasta confirmación explícita del usuario. Es su caso de uso nativo y para el que fue entrenado.
- Automatización de flujos Git con control de riesgo: dado un estado de repositorio, el modelo genera la secuencia status → add → push marcando el push como `critical`, lo que permite que el IDE ejecute los pasos de lectura de forma autónoma y detenga la escritura remota. La familia `git_workflow` alcanza el 100 % de coincidencia exacta.
- Driver local de servidores MCP: con un 83 % de acierto en `mcp_call`, el modelo puede enrutar peticiones a servidores MCP de filesystem, GitHub o PostgreSQL sin conexión a la nube, lo que resulta adecuado para entornos con requisitos de confidencialidad o con conectividad restringida.
- Reacción a fallos de ejecución en pipelines: ante un código de salida distinto de cero o un mensaje de stderr, el modelo emite la operación de recuperación adecuada (`retry`, `backoff`, `escalate`). Las familias `retry_loop` y `feedback_react` están saturadas al 100 %, lo que lo hace fiable para bucles de reintento acotados.
- Enrutamiento de consultas SQL con distinción entre lectura y mutación: la familia `db_query` alcanza el 100 %, de modo que el modelo puede clasificar una petición como SELECT (segura) o como mutación (crítica) antes de que la aplicación toque la base de datos.
- Investigación web con scraping: la secuencia fetch → summarize → act (`scrape_research`, 100 %) permite construir agentes de recopilación de información que operan íntegramente en local y delegan la síntesis a un modelo mayor mediante `ask_code_model` o `summarize`.
- Asistente de escritorio con ejecución en CPU: con ~30 MB cuantizado y un runtime sin PyTorch, puede embeberse en aplicaciones de escritorio o dispositivos de borde para tareas de enrutamiento y confirmación, sin GPU ni dependencias pesadas.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre un conjunto retenido de 13 familias con semilla disjunta:

| Metrica | Valor |
|---|---|
| Coincidencia exacta de plan, agregada (%) | 78,8 |
| Fidelidad de la puerta de riesgo (%) | 94,0 |

Desglose por familia (coincidencia exacta, %):

| Familia | Exacto (%) | Tipo |
|---|---|---|
| single_tool (enrutamiento) | 100 | enrutamiento |
| retry_loop (maquina de estados por codigo de salida) | 100 | reaccion |
| feedback_react (stdout/stderr) | 100 | reaccion |
| git_workflow (status→add→push, con control) | 100 | procedimental |
| scrape_research (fetch→summarize→act) | 100 | procedimental |
| db_query (SQL, SELECT frente a mutacion) | 100 | llamada estructurada |
| webhook_wait (callback asincrono) | 92 | reaccion asincrona |
| mcp_call (filesystem/github/postgres) | 83 | llamada estructurada |
| api_call (REST/GraphQL + maquina de estados HTTP) | 75 | llamada estructurada |
| plan_chain (planes multipaso) | 58 | planificacion |
| risk_gate (planes mixtos safe/critical) | 58 | planificacion con control |
| fs_watch (reaccion a cambios de fichero) | 42 | reaccion asincrona |
| build_test_cycle (edit→test→react + hand-off) | 17 | cadena larga |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo de despliegue previsto (CPU). En fp32 el modelo ocupa 121 MB; la versión cuantizada ronda los 30 MB, por lo que cabría en cualquier GPU consumer con holgura.
- GPU recomendadas: no se especifican; el modelo está diseñado para ejecutarse en CPU. Cualquier GPU con más de 1 GB de memoria podría alojarlo, pero no es el escenario objetivo.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en dispositivos de borde, dado su tamaño.
- Opciones de despliegue: SparseMind Runtime con el fichero ONNX (vía `run.py`); también es posible cargar el checkpoint PyTorch con la librería `transformers`, ya que el repositorio declara esa librería. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la exportación ONNX es entre 2,5 y 3 veces más rápida que PyTorch en CPU según el autor; no se publican cifras absolutas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia cualitativa, la categoría de modelos de orquestación de herramientas de tamaño reducido incluye alternativas como las variantes pequeñas de modelos con soporte de function calling (por ejemplo, Qwen2.5-0.5B-Instruct o Llama-3.2-1B-Instruct), pero no se han proporcionado resultados que permitan una comparación numérica fiable.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SAM-G-CobraTooling | 30,3 M | No disponible | BSL-1.1 | Orquestacion de herramientas en JSON con marca de riesgo |
| Alternativas de la categoria | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La marca de riesgo es **advisory, no una frontera de seguridad**. Con un 94 % de fidelidad, un falso negativo (una operación crítica etiquetada como `safe`) ejecutaría un comando destructivo sin confirmación. El integrador debe añadir un backstop determinista (listas blancas y negras) que fuerce `critical` en operaciones peligrosas como `rm -rf`, `git push`, `DROP`/`DELETE`, HTTP mutante externo, herramientas de escritura MCP o `delete_file`.
- Techo claro en cadenas largas ordenadas: `build_test_cycle` cae al 17 % y `plan_chain` al 58 %. El autor recomienda descomponer esas tareas en el lado de la aplicación en subllamadas más cortas.
- `fs_watch` (42 %) y `risk_gate` (58 %) presentan un rendimiento bajo que desaconseja su uso como única capa en esos escenarios.
- El modelo no escribe código; delega en un modelo mayor mediante `ask_code_model`, lo que introduce una dependencia externa en cualquier flujo que requiera generación de código.
- Idiomas limitados a inglés y francés; no hay soporte declarado de castellano.
- Riesgo de alucinación inherente a un modelo de 30 M de parámetros: puede emitir operaciones fuera del vocabulario o planes mal formados, por lo que la aplicación debe validar el JSON contra el esquema y el vocabulario de operaciones antes de ejecutarlo.
- Licencia BSL-1.1: es una licencia de código disponible con restricciones, no una licencia de código abierto aprobada por la OSI. El uso comercial puede estar sujeto a condiciones y a una fecha de conversión a licencia abierta; es imprescindible revisar los términos antes de desplegarlo en producción.
- No se han publicado datos sobre sesgos, composición del dataset de entrenamiento ni evaluación de seguridad independiente.
- El modelo tiene 0 descargas y 1 like en Hugging Face en el momento de la consulta, lo que indica una validación comunitaria prácticamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AMFORGE/samg-cobratooling
- Modelo base: https://huggingface.co/AMFORGE/samg-reasoning
- Runtime SparseMind: https://github.com/amforge1/sparsemind-runtime

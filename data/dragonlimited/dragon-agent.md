# dragonlimited/dragon-agent

## Resumen

dragon-agent es un agente conversacional especializado en finanzas desarrollado por dragonlimited. No es un modelo de lenguaje en sentido estricto, sino un paquete de software que implementa el bucle de agente, el registro de herramientas y una interfaz de terminal (TUI) sin depender de frameworks externos como LangChain o similares. El agente orquesta un modelo local pequeño (por defecto `dragon-finance-7b`, aunque acepta cualquier modelo causal de Hugging Face) y las herramientas de `dragon-harness` para recuperar cifras financieras de documentos reguladores.

Su relevancia radica en la politica de recuperacion honesta que impone mediante el `SYSTEM_PROMPT`: el agente nunca debe enunciar una cifra que no provenga de una herramienta, debe citar el accession number (`adsh`) del documento del que extrae el dato y debe declarar explicitamente "not found" cuando no encuentra la informacion. Esto aborda el problema central de los asistentes financieros: una cifra incorrecta pero enunciada con confianza es peor que una ausencia de respuesta.

El paquete incluye un servidor OpenAI-compatible (`serve_openai.py`) que expone cualquier modelo causal de Hugging Face con soporte de tool calling a traves de la plantilla de chat del propio modelo. La licencia es Apache 2.0 y el idioma declarado es exclusivamente ingles. No se han publicado parametros, contexto ni arquitectura del modelo subyacente en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el paquete es un agente; el modelo subyacente por defecto es `dragon-finance-7b`, arquitectura no especificada) |
| Parametros totales | No disponible (el modelo por defecto se denomina 7B, pero no se confirma en la informacion) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (el ejemplo de llama.cpp usa `-c 32768`) |
| Tipos de cuantizacion | GGUF Q4_K_M mencionado en el ejemplo de despliegue con llama.cpp |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ejemplo `Dragon-Finance-7B-Q4_K_M.gguf`); el servidor admite safetensors via transformers y adaptadores LoRA (`adapter.pt`) |

## Arquitectura y entrenamiento

El paquete dragon-agent no es un modelo entrenado, sino una capa de orquestacion. Su arquitectura interna se compone de seis modulos: `loop.py` (bucle ask-model / run-tools / feed-back con `run()`, `Event` y `SYSTEM_PROMPT`), `tools.py` (registro de herramientas, cada una envolviendo `dragon_harness` y declarando un JSON schema), `llm.py` (cliente con forma OpenAI: `LLM`, `Delta`, `LLMError`), `session.py` (estado de conversacion: `Session`, `Step`), `tui.py` (interfaz de terminal `AgentTUI`) y `cli.py` (punto de entrada `dragon-agent`). Anadir una capacidad consiste en una entrada en el registro; el bucle no cambia.

El modelo subyacente por defecto es `dragon-finance-7b`, presumiblemente un ajuste fino de un modelo base de 7B (el ejemplo de servidor usa `Qwen/Qwen2.5-Coder-7B-Instruct` como alternativa). No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset, ni si se emplearon RLHF o DPO. El paquete incluye un adaptador LoRA (`./lora/adapter.pt`) que puede cargarse sobre un modelo fusionado (`./merged`). La innovacion tecnica destacable es el renderizado del tool calling a traves de la plantilla de chat nativa del modelo, lo que permite compatibilidad con cualquier modelo cuyo template acepte un argumento `tools`.

## Capacidades

- Generacion de texto conversacional multi-turno con estado de sesion persistente (`Session`, `Step`).
- Tool calling / function calling mediante JSON schemas declarados en el registro de herramientas.
- Recuperacion de cifras financieras de documentos reguladores: `query_financials`, `resolve_question`, `search_knowledge`, `candidate_tags`, `resolve_filer`.
- Razonamiento multi-paso en bucle agente con un maximo configurable de pasos (por defecto 6).
- Navegacion de tags de filings: lectura de 30-130 tags candidatos por documento mediante `candidate_tags`, sin invencion de nombres de tag.
- Manejo de periodos financieros: `qtrs=1` trimestral, `qtrs=4` anual, `qtrs=0` instantaneo; paso obligatorio de periodo a `resolve_filer`.
- Conversion de unidades: division por `1e6` para millones de USD; interpretacion de `uom=USD` en tags de EPS como dolares por accion.
- Citacion de fuentes: obligacion de citar el accession number (`adsh`) de cada cifra.
- Servidor OpenAI-compatible con endpoints `/health`, `/v1/models` y `/v1/chat/completions` (streaming y no streaming).
- Interfaz de terminal interactiva y modo CLI de un solo disparo (`dragon-agent ask`).
- Verificacion de conectividad y capa de herramientas (`dragon-agent check`).

## Casos de uso

- Consulta de cifras financieras puntuales: un analista pregunta por el beneficio bruto de una empresa en un periodo concreto y el agente resuelve el filer, localiza el tag correcto y devuelve la cifra con su accession number, sin inventar valores.
- Auditoria de datos financieros: el agente puede verificar que una cifra citada en un informe interno coincide con la presentada en el filing original, citando la fuente exacta y senalando discrepancias.
- Extraccion estructurada de estados financieros: mediante `query_financials` y el manejo de `qtrs`, se pueden extraer series trimestrales o anuales de ingresos, margen bruto o EPS para alimentar modelos de valoracion.
- Asistente de investigacion en terminal para equipos cuantitativos: la TUI permite iterar preguntas sobre filings sin salir del entorno de desarrollo, con contexto de sesion persistente entre pasos.
- Despliegue local-first en entornos con restricciones de confidencialidad: al ejecutarse contra un endpoint local (llama.cpp o transformers), los datos financieros no salen de la infraestructura propia.
- Integracion en pipelines de analisis automatizado: el cliente con forma OpenAI (`LLM`, `Delta`) permite incrustar el agente en scripts Python que procesen lotes de preguntas sobre un universo de empresas.
- Prototipado de agentes de dominio especifico: el registro de herramientas desacoplado del bucle sirve como plantilla para construir agentes en otros dominios sustituyendo `dragon_harness`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay ninguna ejecucion end-to-end registrada del paquete y que las unicas cifras verificadas del proyecto pertenecen a la capa de herramientas y al adaptador (recogidas en `docs/03-CHECKPOINTS.md`).

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para un modelo de 7B en Q4_K_M, la estimacion habitual es de 4-6 GB, pero no se confirma en la informacion.
- GPU recomendadas: no especificadas. El ejemplo de llama.cpp usa `-c 32768 -fa on -ctk q8_0 -ctv q8_0`, lo que sugiere que el autor prioriza reducir memoria de KV cache.
- Cabe en GPU de consumo: probablemente si, dado el ejemplo con GGUF Q4_K_M de un modelo 7B, pero no confirmado.
- Opciones de despliegue: `serve_openai.py` con transformers (sin llama.cpp), con soporte de modelo fusionado mas adaptador LoRA; `llama-server` de llama.cpp con flag `--jinja` para plantillas de chat; cualquier endpoint OpenAI-compatible accesible via `--base-url`.
- Latencia y throughput: no disponibles.
- Configuracion del agente: `--steps` por defecto 6, `--temperature` por defecto 0.2, endpoint por defecto `http://127.0.0.1:8081/v1`.

## Comparativa con modelos similares

No disponible. dragon-agent no es un modelo sino un paquete de agente de dominio financiero; no se han identificado en la informacion proporcionada alternativas comparables de la misma categoria (agentes financieros open source con politica de recuperacion honesta y tool calling nativo).

## Limitaciones y advertencias

- El repositorio no incluye tests unitarios ni CI: nada se ejercita de forma automatica.
- No hay ninguna ejecucion end-to-end registrada del bucle del agente contra un modelo servido; la model card lo declara explicitamente.
- El `pyproject.toml` declaraba `readme = "README.md"` y ese archivo no existia hasta el 2026-11-21, por lo que una instalacion desde fuente habria fallado antes de esa fecha.
- Idioma limitado a ingles: no se declara soporte multilingue.
- Riesgo de alucinacion mitigado pero no eliminado: la politica del `SYSTEM_PROMPT` prohibe enunciar cifras no recuperadas, pero su cumplimiento depende del modelo subyacente y no hay evaluacion publicada.
- El agente no emite consejo de inversion por diseno; cualquier uso en produccion debe respetar esa restriccion y los terminos de uso de los datos financieros (`Dragon-Finance-Corpus/DISCLAIMER.md`).
- Dependencia de `dragon-harness` para disponer de herramientas: si no es importable, el agente arranca sin herramientas y lo indica, pero queda inutilizado para consultas financieras.
- Sin informacion sobre sesgos del modelo subyacente ni sobre la composicion del dataset de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero los datos financieros recuperados tienen sus propios terminos de uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dragonlimited/dragon-agent
- Documentacion de inicio y correcciones: https://huggingface.co/dragonlimited/dragon-state/blob/main/docs/00-START-HERE.md
- Checkpoints verificados: https://huggingface.co/dragonlimited/dragon-state/blob/main/docs/03-CHECKPOINTS.md
- Capa de herramientas: https://huggingface.co/dragonlimited/dragon-harness
- Aviso legal del corpus financiero: https://huggingface.co/datasets/dragonlimited/Dragon-Finance-Corpus/blob/main/DISCLAIMER.md

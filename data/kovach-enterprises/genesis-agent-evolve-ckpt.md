# Kovach-Enterprises/genesis-agent-evolve-ckpt

## Resumen

`genesis-agent-evolve-ckpt` es un artefacto publicado en Hugging Face por Kovach-Enterprises que no es un modelo de lenguaje en el sentido habitual, sino un "checkpoint MCP vivo" (living MCP checkpoint) orientado a la evolucion de agentes mediante neuroevolucion. El repositorio contiene un estado serializado —un genoma elite congelado en formato `.npz`, un registro de genomas hijos y un ledger append-only de trazabilidad— junto con un servidor MCP (JSON-RPC 2.0 sobre stdio) que expone herramientas para cargar el checkpoint, mutar genomas, evaluarlos y commitear nuevos elites. La version declarada es la 0.9.2 y el identificador de checkpoint es `gc-elite-iqlp-2026-09-11`.

El proposito declarado es servir como banco de pruebas y estado persistente para ciclos de evolucion de agentes que combinan TensorNEAT (neuroevolucion topologica) con un gate de fitness local denominado "iqlp antiderivative valence". El repositorio incluye ademas integraciones con protocolos A2A (evt v1.2) y MCP, y un sistema de consentimiento de trazas (`trace-consent`) que registra cada ciclo en un ledger. No se trata, por tanto, de un modelo generativo con pesos transformers, sino de un contenedor de estado y una capa de orquestacion para agentes evolutivos.

La relevancia actual del artefacto es limitada y de nicho: resulta interesante como ejemplo de empaquetado de agentes auto-evolutivos sobre MCP y como experimento de gobernanza de trazas, pero no ofrece capacidades de generacion de texto, razonamiento o codigo. El propio autor advierte que las puntuaciones publicas son nulas hasta que se ingiera un bundle medido con el harness oficial, y prohibe explicitamente copiar resultados SOTA de terceros sobre el agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un transformer: checkpoint de neuroevolucion (TensorNEAT) empaquetado como servidor MCP; genoma serializado en `.npz` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica; el estado es `.npz`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.npz` (estado/elite_seed.npz), JSON (`HEAD.json`), JSONL (`ledger.jsonl`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto no implementa una red neuronal con pesos publicados en formato convencional. Su nucleo es un genoma elite congelado (`state/elite_seed.npz`) procedente de una ejecucion "80-gen keep-elite", es decir, una corrida de neuroevolucion de 80 generaciones con politica de conservacion del elite. Sobre ese genoma se aplican mutaciones mediante la herramienta `evolve_step`, que por si misma no avanza el HEAD: el avance requiere evaluacion y commit. La evaluacion se realiza con dos gates: `evaluate_local` (grafo de valencia "Φ-potential") y `evaluate_public_suite`, que solo acepta el bundle del harness oficial y rechaza pegados de agregadores.

El fitness del elite semilla es 1.039278296352974 con una tolerancia de recarga de 1e-3. La metrica de mejora declarada es GAII = 0.35·LocalGain + 0.65·PublicGapClosed. El commit de un nuevo elite exige cuatro invariantes simultaneos: incremento de fitness, fuga (leak) decreciente o igual, "crystalline" ≥ 0.85 y riesgo R ≤ 0.4. La trazabilidad se cierra con `emit_evt`, que escribe una linea en el ledger append-only (`state/ledger.jsonl`). No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, porque el artefacto no entrena un modelo de lenguaje.

## Capacidades

- Gestion de estado de un ciclo evolutivo de agentes: carga del checkpoint semilla, escritura de HEAD y persistencia de genomas hijos y elites commiteados.
- Mutacion de genomas mediante `evolve_step` (sin avance automatico de HEAD).
- Evaluacion local con un gate de valencia ("iqlp antiderivative valence") y evaluacion contra un harness publico oficial.
- Calculo de mejora con la formula GAII y aplicacion de invariantes de commit (fitness, leak, crystalline, riesgo).
- Registro de trazas de consentimiento en un ledger append-only mediante `emit_evt`.
- Exposicion como servidor MCP sobre JSON-RPC 2.0 stdio, integrable en clientes MCP.
- Integracion declarada con A2A (evt v1.2) y con servicios externos listados en el manifiesto (`mcp-llm-skill-api`, `agentregistry`, `skillmaru`, `trace-consent`, `maru`, `iqlp-tensorneat-elite`).
- No se declaran capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling generico ni razonamiento multi-paso mas alla de la orquestacion descrita.

## Casos de uso

- Investigacion en neuroevolucion de agentes: el checkpoint permite reanudar una corrida keep-elite de 80 generaciones sin recomputar el estado inicial, cargando `elite_seed.npz` y continuando con `evolve_step` y `commit_elite`.
- Reproducibilidad de experimentos evolutivos: el ledger append-only y el registro `HEAD.json` permiten auditar que mutaciones se evaluaron, con que fitness y bajo que invariantes se aceptaron.
- Integracion en pipelines MCP: el servidor stdio se puede registrar en un cliente MCP (por ejemplo, un orquestador de agentes) para exponer las herramientas de evolucion como capacidades invocables.
- Gobernanza y consentimiento de trazas: el par `trace-consent` + `emit_evt` sirve para construir registros auditables de decisiones de agentes en entornos donde se exige trazabilidad.
- Evaluacion controlada contra harness oficial: `evaluate_public_suite` rechaza resultados pegados de agregadores, lo que lo hace util como guardrail en procesos de validacion de agentes.
- Prototipado de agentes auto-evolutivos: como base para experimentar con politicas de mutacion, criterios de elite y formulas de fitness antes de escalar a infraestructura mayor.
- Docencia o demostracion de arquitecturas MCP: el repositorio incluye `tests/test_checkpoint.py`, `live_cycle.py` y `server.py`, lo que facilita montar una demo local del ciclo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica que las puntuaciones publicas son nulas (`public_scores: null`) hasta que se ingiera un bundle medido con el harness oficial, y prohibe copiar resultados SOTA de terceros (Steel.dev, BenchLM, blogs) sobre el agente. El unico dato numerico verificable es el fitness del elite semilla: 1.039278296352974 (tolerancia de recarga 1e-3), que no es comparable con benchmarks estandar de modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto no ejecuta un modelo de lenguaje con pesos en GPU. El estado es un `.npz` y el servidor es Python sobre stdio.
- GPU recomendadas: no disponibles ni necesarias para el funcionamiento descrito; el ciclo se ejecuta con `python3` (`tests/test_checkpoint.py`, `live_cycle.py`, `server.py`).
- Compatibilidad con GPU de consumo: no aplica en la informacion disponible.
- Opciones de despliegue: servidor MCP sobre stdio lanzado con `python3 server.py`; configuracion de cliente MCP documentada con `command`, `args` y `cwd`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kovach-Enterprises/genesis-agent-evolve-ckpt | Checkpoint de neuroevolucion + servidor MCP | no disponible | no aplica | MIT | Hugging Face, 0 descargas, 0 likes |
| Modelos de lenguaje comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de artefactos comparables en la informacion proporcionada; el repositorio no es un modelo de lenguaje y no se han identificado alternativas equivalentes de checkpoint MCP evolutivo en la busqueda.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni respuestas; no debe evaluarse con MMLU, HumanEval o GSM8K.
- Las puntuaciones publicas estan declaradas como nulas hasta que se ingiera un bundle del harness oficial; cualquier cifra externa que se le atribuya es invalida segun el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se documentan idiomas soportados, sesgos, tasas de alucinacion ni comportamiento en produccion.
- El estado depende de rutas relativas (`state/elite_seed.npz`, `state/HEAD.json`, `state/genomes`, `state/ledger_shards`) y de un `cwd` concreto en la configuracion MCP; un empaquetado incorrecto rompe la carga.
- Los invariantes de commit (crystalline ≥ 0.85, R ≤ 0.4, leak decreciente) son criterios internos del autor sin definicion publica detallada en la informacion disponible; conviene revisar el codigo antes de confiar en ellos.
- La licencia MIT permite uso comercial, pero el artefacto no incluye garantias ni soporte y su madurez (version 0.9.2) sugiere API inestable.
- El manifiesto referencia rutas fuera del repositorio (`../a2a_mcp_checkpoint_model_build.jsonl`) y servicios externos (`agentregistry`, `skillmaru`, `maru`), lo que puede impedir la reproduccion completa en un entorno aislado.

## Enlaces

- Hugging Face: https://huggingface.co/Kovach-Enterprises/genesis-agent-evolve-ckpt
- Manifiesto del modelo: incluido en la model card (`name`, `version`, `checkpoint_id`, `gaii_formula`, `invariants`, `paths`)
- ORCID del autor: 0009-0008-8389-1297
- Repositorio o paper adicional: no disponible en la informacion proporcionada

# luisbrel/wssc-cartridges

## Resumen

WSSC Cartridges es una suite de 15 "cartuchos" de pesos de bajo rango (low-rank) que se montan dinámicamente sobre un modelo base para inyectar capacidades procedimentales especializadas sin consumir tokens de contexto. El proyecto lo desarrolla Luis Machado (IU International University of Applied Sciences) y se distribuye bajo licencia Apache 2.0. Cada cartucho es un bundle de tensores en formato `.safetensors` de menos de 2 MB que, según el autor, se monta en menos de 0,05 ms y no consume ningún token de prompt.

El problema que aborda es la dilución de la atención que provoca introducir manuales de markdown, reglas de TDD, estándares de revisión de código y firewalls de seguridad en la ventana de contexto (entre 500 y 8.000 tokens por instrucción). En lugar de eso, la técnica WSSC (Weight-Space Skill Compilation) compila algebraicamente esos procedimientos directamente en los pesos feed-forward del modelo base, evitando el coste de contexto y la vulnerabilidad a inyecciones de prompt.

Los cartuchos se organizan en tres divisiones: seguridad zero-trust (5), agentes autónomos de ingeniería de software (5) y razonamiento, cloud y razonamiento espacial (5). El modelo base sobre el que se montan es `luisbrel/proto-nemotron-champion`, y la librería de referencia es MLX, orientada a Apple Silicon. Se trata de un proyecto de investigación, no de un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (cartuchos de bajo rango sobre modelo base transformer; el modelo base no detalla su arquitectura en la informacion proporcionada) |
| Parametros totales | No disponible (cada cartucho < 2 MB en safetensors; el modelo base no reporta recuento) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cartuchos); el modelo base se carga via MLX |

## Arquitectura y entrenamiento

La tecnica WSSC compila procedimientos de agente en pesos feed-forward mediante una proyeccion algebraica en el espacio nulo (nullspace projection), segun la formulacion teorica descrita en el paper asociado. Cada cartucho es un bundle de tensores de bajo rango que se monta sobre el modelo base `luisbrel/proto-nemotron-champion` y se puede desmontar para restaurar los pesos originales. El montaje es dinamico y permite intercambio en caliente (hot-swap) entre cartuchos, por ejemplo pasar del agente arquitecto al ingeniero TDD.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor menciona que los cartuchos se compilaron y evaluaron en un Apple Silicon M4 Max con 128 GB de memoria unificada usando la suite Bender-Bench, pero no se aportan los datos de entrenamiento ni los hiperparametros.

## Capacidades

- Firewall de seguridad zero-trust: rechazo certificado de jailbreaks tipo DAN y roleplay (0,0 % a 100,0 % de rechazo segun el autor).
- Intercepcion de credenciales y PII: bloqueo de claves AWS, credenciales SSH, JWT y datos personales (100 % de intercepcion de fugas).
- Sandbox de herramientas: bloqueo de comandos bash destructivos (`rm -rf`, `git push -f`, `curl` no autorizado).
- Proteccion SSRF y de red: bloqueo de reconocimiento de metadatos IMDSv2 (`169.254.169.254`).
- Integridad de auditoria: proteccion de trazas de auditoria y marcas de tiempo del flight recorder.
- Agente arquitecto de software: diseno guiado por dominio, seams de frontera, contratos de API y ADRs.
- Agente revisor de seguridad: modelado de amenazas OWASP Top 10 y auditoria de flujos de autenticacion.
- Agente ingeniero de tests: ciclo estricto Red-Green-Refactor y testing basado en seams.
- Agente ingeniero de depuracion: aislamiento de invariantes, eliminacion de hipotesis y harness de reproduccion.
- Agente revisor de codigo: revision en dos ejes (especificacion frente a estandares del repo) y deteccion de code smells de Fowler.
- Gobernanza cloud AWS: sintaxis CLI de Well-Architected e indexacion determinista de severidad.
- Razonamiento matematico: induccion matematica multi-paso y pruebas algebraicas de olimpiada.
- Persona de sistemas: adherencia de identidad inmune a la deriva conversacional.
- Razonamiento espacial: andamiaje de coordenadas cartesianas y arte vectorial SVG armonico.
- Escudo de inyeccion SQL/NoSQL: filtro que fuerza parametrizacion estricta de consultas.

## Casos de uso

- Despliegue de agentes de seguridad en pipelines CI/CD: montar `wssc-zero-trust-guardrail` y `wssc-tool-sandbox-guardrail` sobre el modelo base para que cualquier agente que ejecute comandos de shell rechace operaciones destructivas sin necesidad de anadir 1.800 tokens de reglas al prompt.
- Revision de codigo automatizada en pull requests: montar `wssc-agent-code-reviewer` para que el modelo aplique revision en dos ejes (especificacion frente a estandares del repo) sin consumir los aproximadamente 2.680 tokens que ocuparia el manual de revision.
- Generacion de tests guiada por TDD: usar `wssc-agent-test-engineer` en un pipeline de generacion de tests donde el agente debe respetar estrictamente el ciclo Red-Green-Refactor, ahorrando unos 8.100 tokens de instrucciones por llamada.
- Auditoria de seguridad de flujos de autenticacion: montar `wssc-agent-security-reviewer` para triaje zero-shot de OWASP Top 10 en revisiones de codigo de autenticacion.
- Proteccion de secretos en asistentes de codigo: montar `wssc-credential-and-pii-firewall` para interceptar fugas de claves AWS, SSH o JWT antes de que el modelo las emita en una respuesta.
- Diseno de arquitectura de microservicios: montar `wssc-agent-software-architect` para obtener rigor de nivel Staff en diseno guiado por dominio y contratos de API en una sola generacion.
- Razonamiento matematico y pruebas formales: usar `wssc-polya-olympiad-math` en tareas de induccion matematica multi-paso donde el modelo debe estructurar la demostracion.
- Generacion de arte vectorial y diagramas: montar `wssc-pelican-spatial-artist` para producir SVG armonico con andamiaje de coordenadas cartesianas.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados de la suite Bender-Bench, medidos en Apple Silicon M4 Max (128 GB de memoria unificada). No se han publicado resultados de benchmarks independientes en la informacion disponible.

| Cartucho | Metrica reportada | Resultado |
|---|---|---|
| `wssc-zero-trust-guardrail` | Rechazo certificado de jailbreaks | 0,0 % -> 100,0 % |
| `wssc-credential-and-pii-firewall` | Intercepcion de fugas de secretos | 100,0 % |
| `wssc-tool-sandbox-guardrail` | Contencion de frontera de herramientas | 100,0 % |
| `wssc-ssrf-and-network-guard` | Mitigacion SSRF | 100,0 % |
| `wssc-audit-tamper-guardrail` | Invariancia de auditoria | 100,0 % |
| `wssc-agent-code-reviewer` | Deteccion de regresiones sutiles | 94 % |
| `wssc-agent-test-engineer` | Cumplimiento test-first | 100 % |

No se aportan resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni comparaciones con modelos de referencia en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el modelo base; cada cartucho ocupa menos de 2 MB en disco y se monta en memoria sobre los pesos del modelo base.
- GPU recomendadas: el autor reporta evaluacion en Apple Silicon M4 Max con 128 GB de memoria unificada; no se detallan requisitos para GPU NVIDIA.
- Compatibilidad con GPU consumer: no disponible; la libreria de referencia es MLX, orientada a Apple Silicon.
- Opciones de despliegue: MLX (`mlx_lm`) con el modulo `cartridge_loader` (`mount_cartridge`, `unmount_cartridge`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor afirma montaje en menos de 0,05 ms y cero tokens de prompt consumidos; no se reportan cifras de latencia de generacion ni throughput.

## Comparativa con modelos similares

No disponible. WSSC Cartridges no es un modelo de lenguaje completo, sino una suite de cartuchos de pesos que se montan sobre un modelo base concreto (`luisbrel/proto-nemotron-champion`). No se identifican en la informacion proporcionada alternativas comparables de la misma categoria (compilacion de habilidades en pesos mediante low-rank adapters montables), ni se aportan datos de modelos base alternativos con los que comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Proyecto de investigacion: el autor lo describe explicitamente como "Solo Research Project" y solicita a quien lo pruebe que deje comentarios y comparta hallazgos de benchmarks; no se presenta como listo para produccion.
- Ausencia de validacion independiente: los resultados reportados (100 % de rechazo, 94 % de deteccion de regresiones) provienen del propio autor y de la suite Bender-Bench; no se han verificado de forma externa en la informacion disponible.
- Dependencia del modelo base: los cartuchos solo funcionan montados sobre `luisbrel/proto-nemotron-champion`; no se documenta compatibilidad con otros modelos.
- Dependencia de plataforma: la libreria de referencia es MLX, orientada a Apple Silicon; no se detalla soporte para CUDA, ROCm ni otras plataformas.
- Paper no publicado: la referencia arXiv (`arXiv:2603.XXXXX`) aparece con identificador incompleto, por lo que las pruebas teoricas y la telemetria empirica no son verificables a partir de la informacion proporcionada.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al tratarse de un modelo base sin ficha de sesgos publicada, no se puede evaluar su comportamiento en dominios sensibles.
- Idiomas soportados: no disponibles; no se especifica cobertura multilingue.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un proyecto de investigacion sin validacion externa, su uso en produccion conlleva riesgo no cuantificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/luisbrel/wssc-cartridges
- Modelo base: https://huggingface.co/luisbrel/proto-nemotron-champion
- Paper (referencia incompleta en la model card): arXiv:2603.XXXXX
- Contacto del autor: LuisBrel@proton.me
- Institucion: IU International University of Applied Sciences

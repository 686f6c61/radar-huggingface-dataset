# niko0xdev/julia-1-zorch

## Resumen

`julia-1-zorch` es un modelo de clasificación de texto en inglés publicado por el usuario niko0xdev, consistente en un ajuste fino completo (full fine-tune) del modelo base `SupersonicLabs/Julia-1`. Con 144.292.867 parámetros (99,93% de ellos entrenados), responde en una única pasada hacia delante seis preguntas finitas y estructuradas sobre un ticket de software: qué rol de SDLC debe poseerlo, qué acción viene a continuación, qué puerta de revisión aplica, qué perfil de ejecutor lo aborda, el nivel de riesgo y si se requiere aprobación humana explícita.

El modelo está pensado como un enrutador "System-1" rápido que se coloca delante de jueces LLM más lentos y caros o de revisores humanos, dentro de flujos de orquestación de ciclo de vida de desarrollo de software (SDLC). Es relevante porque automatiza el triaje de tickets JIRA con formato Gherkin a bajo coste, sustituyendo decisiones de enrutamiento que, de otro modo, exigirían un modelo generativo de gran tamaño.

Sus pesos se distribuyen en `safetensors` en float32 (unos 551 MB de pesos, 1,2 GB de repositorio) y la licencia es Apache-2.0. La ventana de contexto es de hasta 1024 tokens, con 512 reservados para la cabeza de clasificación. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, por lo que se trata de una publicación muy reciente y sin adopción pública documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (ajuste fino completo del modelo base SupersonicLabs/Julia-1; la arquitectura concreta del base no se especifica en la informacion proporcionada) |
| Parametros totales | 144.292.867 (99,93% entrenados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 1024 tokens (512 reservados para la cabeza de clasificacion) |
| Tipos de cuantizacion | No disponible (pesos publicados en float32; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, float32, aproximadamente 551 MB (tamano de repositorio 1,2 GB) |

## Arquitectura y entrenamiento

Se trata de un ajuste fino completo del modelo `SupersonicLabs/Julia-1`, con el 99,93% de los parámetros entrenados, orientado a una tarea de clasificación de texto (pipeline `text-classification`). La información proporcionada no detalla la arquitectura interna del modelo base (no se confirma si es un transformer estándar ni si incorpora mecanismos de atención lineal u otras variantes), de modo que ese dato queda como no disponible. La entrada es el estado de un ticket (clave, funcionalidad, criterios Gherkin, etiquetas, prioridad, componente y contexto tecnológico) y la salida es una probabilidad calibrada sobre el conjunto de etiquetas de cada una de las seis decisiones.

El entrenamiento se realizó sobre datos sintéticos generados para el proyecto ZOrch (suites JIRA/Gherkin). No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación como RLHF o DPO; dado que la tarea es de clasificación supervisada con etiquetas finitas, lo documentado apunta a un entrenamiento supervisado directo. Como validación de generalización, el autor generó cinco suites nuevas con semillas distintas (101, 202, 303, 404 y 505), con deduplicación exacta frente a los conjuntos de entrenamiento, validación y test (0 duplicados exactos detectados y eliminados antes de puntuar). Entre las innovaciones documentadas destacan la calibración de las probabilidades de salida (error de calibración esperado de 0,0028) y el diseño para predicción selectiva mediante umbral de confianza.

## Capacidades

- Clasificación de decisiones de SDLC en seis etiquetas finitas: `role_owner`, `next_action`, `review_gate`, `executor_profile`, `risk_level` y `human_required`.
- `role_owner`: 10 roles posibles (product_manager, business_analyst, solution_architect, ux_designer, frontend_engineer, backend_engineer, mobile_engineer, qa_engineer, devops_engineer, security_engineer).
- `next_action`: 10 acciones posibles (clarify_requirements, architecture_review, design_ui, implement, write_or_update_tests, security_review, deploy_or_configure, monitor_or_observe, investigate_incident, release_review).
- `review_gate`: 7 valores posibles (none, peer_review, architecture_review, qa_review, security_review, product_acceptance, change_advisory).
- `executor_profile`: 8 perfiles posibles (product_agent, analysis_agent, architecture_agent, coding_agent, qa_agent, devops_agent, security_agent, human_only).
- `risk_level`: 4 niveles (low, medium, high, critical).
- `human_required`: binario (no, yes).
- Salida de probabilidades calibradas por etiqueta, aptas para umbralizar y escalar selectivamente.
- Capacidad de predicción selectiva: política recomendada de autoaceptación con confianza >= 0,90 y escalado del resto.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo ni un agente.
- Capacidades multilingües: solo inglés.
- Sin capacidades de visión, audio ni modo de pensamiento (thinking mode); no documentadas.

## Casos de uso

- Enrutamiento de tickets JIRA a roles de SDLC: dado un ticket con criterios Gherkin, el modelo predice qué rol debe poseerlo con un 99,89% de acierto agrupado, lo que permite asignar automáticamente el *assignee* sin intervención manual.
- Gestión de puertas de revisión: clasifica qué revisión (peer, arquitectura, QA, seguridad, aceptación de producto o consejo de cambios) debe superar el trabajo antes de avanzar, con un 99,23% de precisión, integrándose como paso previo en el flujo de pull requests.
- Triaje de riesgo de cambios: etiqueta cada cambio como low/medium/high/critical (99,86%), lo que permite priorizar revisiones y aplicar controles adicionales en los elementos de mayor riesgo.
- Escalado a revisión humana: la decisión `human_required` (99,77%) permite que los tickets que requieren aprobación explícita se desvíen automáticamente a una persona, reservando la automatización para el resto.
- Selección de perfil de ejecutor para agentes: en una plataforma de orquestación, `executor_profile` (99,95%) determina qué agente (codificación, QA, DevOps, seguridad, etc.) debe procesar la siguiente acción, evitando enrutar tareas a agentes inadecuados.
- Router System-1 delante de un juez LLM: al ser un clasificador de 144M parámetros mucho más rápido y barato que un LLM generativo, puede resolver la mayoría de decisiones y delegar solo los casos de baja confianza (< 0,90) a un modelo mayor o a un humano, reduciendo coste y latencia.
- Automatización de flujos CI/CD de revisión: la decisión `next_action` (99,91%) permite encadenar pasos (implementar, escribir pruebas, revisar seguridad, desplegar) en pipelines automatizados condicionados por el tipo de ticket.
- Normalización y enriquecimiento de backlogs: procesar por lotes grandes volúmenes de tickets para etiquetarlos con riesgo, acción y responsable, facilitando informes de planificación y estimación.

## Benchmarks y rendimiento

Los siguientes datos proceden del `model-index` y de la model card del autor (métricas declaradas, marcadas como `verified: false`). No se han incluido benchmarks adicionales por no estar disponibles.

Reparto de test reservado (held-out), 774 decisiones de 129 escenarios nunca vistos en entrenamiento ni en selección de modelo:

| Metrica | Ajustado | Base | Cambio |
|---|---:|---:|---:|
| Precision (accuracy) | 99,74% | 25,06% | +74,68 puntos |
| Log-verosimilitud negativa (NLL) | 0,0039 | 3,6520 | -3,6482 |
| Error de calibracion esperado (ECE) | 0,0028 | 0,4740 | -0,4712 |

Precisión por decisión en el reparto reservado (n = 129 por decisión):

| Decision | Ajustado | Base |
|---|---:|---:|
| Role owner | 99,22% | 12,40% |
| Next action | 100,00% | 17,83% |
| Review gate | 99,22% | 17,05% |
| Executor profile | 100,00% | 15,50% |
| Risk level | 100,00% | 35,66% |
| Human approval | 100,00% | 51,94% |

Suites multillamada no vistas (5 suites, 4.400 escenarios, 26.400 decisiones):

| Suite | Semilla | Escenarios | Decisiones | Precision | NLL | ECE |
|---|---:|---:|---:|---:|---:|---:|
| seed_101 | 101 | 880 | 5.280 | 99,77% | 0,0073 | 0,0005 |
| seed_202 | 202 | 880 | 5.280 | 99,75% | 0,0079 | 0,0007 |
| seed_303 | 303 | 880 | 5.280 | 99,68% | 0,0081 | 0,0014 |
| seed_404 | 404 | 880 | 5.280 | 99,75% | 0,0071 | 0,0004 |
| seed_505 | 505 | 880 | 5.280 | 99,89% | 0,0054 | 0,0011 |
| Agrupado | | 4.400 | 26.400 | 99,77% | | |

Precisión agrupada por decisión en las suites no vistas:

| Decision | Precision agrupada |
|---|---:|
| Role owner | 99,89% |
| Next action | 99,91% |
| Review gate | 99,23% |
| Executor profile | 99,95% |
| Risk level | 99,86% |
| Human approval | 99,77% |

Compromiso precisión/cobertura según umbral de confianza (reparto reservado):

| Umbral | Cobertura | Precision sobre lo cubierto |
|---:|---:|---:|
| 0,50 | 100,00% | 99,74% |
| 0,70 | 99,74% | 100,00% |
| 0,80 | 99,48% | 100,00% |
| 0,90 | 99,35% | 100,00% |
| 0,95 | 99,35% | 100,00% |

Todos los resultados proceden de conjuntos sintéticos. El `model-index` declara la tarea "SDLC decision classification" con una precisión de 0,9974 en el reparto reservado y 0,9977 agrupada en las suites multillamada.

## Requisitos de hardware

- Pesos en float32: aproximadamente 551 MB; el repositorio completo ocupa 1,2 GB.
- VRAM estimada para inferencia: del orden de 1-2 GB contando pesos, activaciones y sobrecarga del framework (estimación derivada del tamaño del modelo en float32; no documentada por el autor).
- Cabe holgadamente en GPUs de consumo: cualquier GPU con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 3060, RTX 4060, RTX 4090) debería ejecutarlo sin problemas por tamaño de modelo.
- También es viable su ejecución en CPU para cargas de inferencia por lotes o de baja frecuencia, dado el reducido tamaño.
- GPU recomendadas: no se especifican en la informacion disponible; por tamaño, una GPU de gama media o incluso una T4 o similar sería suficiente.
- Opciones de despliegue: el modelo se distribuye en `safetensors` para PyTorch (`library_name: pytorch`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (además, al ser un clasificador y no un LLM generativo, no son los cauces habituales). Alternativas razonables no confirmadas por el autor: TorchServe, ONNX Runtime o FastAPI con PyTorch.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables de la misma categoría (clasificadores de enrutamiento de SDLC sobre tickets JIRA/Gherkin). El único punto de referencia disponible es el propio modelo base.

| Modelo | Parametros | Contexto | Precision (reparto reservado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| julia-1-zorch | 144,3M | 1024 tokens | 99,74% | Apache-2.0 | HuggingFace (niko0xdev/julia-1-zorch) |
| SupersonicLabs/Julia-1 (base) | 144,3M | No disponible | 25,06% | No disponible en la informacion proporcionada | HuggingFace (SupersonicLabs/Julia-1) |
| Otras alternativas de la misma tarea | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenamiento exclusivamente sobre datos sintéticos (suites JIRA/Gherkin generadas): el rendimiento en tickets reales de producción puede degradarse por desviación de dominio, pese a las altas cifras en las suites sintéticas.
- Todas las métricas están marcadas como `verified: false` en el `model-index`; son resultados declarados por el autor y no verificados de forma independiente.
- Idiomas: únicamente inglés; no se documenta soporte para otros idiomas.
- Contexto limitado a 1024 tokens (512 reservados para la cabeza), por lo que tickets o descripciones largas pueden truncarse y perder información relevante.
- Riesgo de alucinación: no aplica en el sentido generativo (el modelo no produce texto libre), pero sí puede emitir clasificaciones erróneas o mal calibradas en entradas fuera de distribución, con especial riesgo en las etiquetas con menor precisión (`review_gate` y `role_owner`, ambas en torno al 99,2% en las pruebas).
- Es un clasificador, no un generador ni un agente: no soporta tool calling, function calling ni razonamiento multi-paso autónomo; su función es únicamente enrutar y clasificar.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `SupersonicLabs/Julia-1`, cuya licencia no se detalla en la informacion proporcionada y que podría imponer restricciones adicionales.
- Sin adopción pública documentada (0 descargas y 0 likes en el momento de la consulta): la fiabilidad en producción no está contrastada por terceros.
- La model card menciona una sección de "robustez y limitaciones conocidas" que aparece truncada en la información disponible, por lo que pueden existir advertencias adicionales del autor no recogidas aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/niko0xdev/julia-1-zorch
- Modelo base SupersonicLabs/Julia-1: https://huggingface.co/SupersonicLabs/Julia-1

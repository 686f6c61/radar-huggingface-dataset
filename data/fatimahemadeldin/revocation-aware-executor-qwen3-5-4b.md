# FatimahEmadEldin/revocation-aware-executor-qwen3.5-4b

## Resumen

`revocation-aware-executor-qwen3.5-4b` es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base `Qwen/Qwen3.5-4B`, desarrollado por Fatimah Emad Eldin (Trouve Labs) en el marco del experimento 08 del proyecto de investigacion **Revoked but Not Forgotten**. El adaptador no es un modelo autonomo: se aplica sobre el modelo base y modifica su comportamiento como ejecutor de herramientas dentro de equipos de agentes LLM. El problema que aborda es la **influencia residual**: cuando un agente trabajador comprometido es revocado por la plataforma, su informacion falsa puede persistir en los traspasos (handoffs) y ser ejecutada por otros agentes.

El adaptador se entrena mediante SFT sobre 2.254 turnos de ejecutor correctos extraidos de transcripciones sinteticas propias (semillas 0-31), con el objetivo de reducir la tasa de residuo tras la revocacion de un agente comprometido. Segun los resultados declarados por el autor, la tasa de residuo en condiciones de revocacion con aviso baja del 79% (base) al 12,5%, y con marcas de linaje del 71% al 0%. El adaptador tiene 21.233.664 parametros entrenables y un tamano de repositorio de 0,1 GB.

Es relevante ahora porque la seguridad de equipos multiagente es un area emergente y este trabajo aporta un banco de pruebas reproducible y un baseline de mitigacion por entrenamiento, aunque el propio autor lo describe explicitamente como herramienta de investigacion y no como control de seguridad de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B; modulos adaptados: q/k/v/o de las 8 capas de atencion completa y gate/up/down de las 32 MLP |
| Parametros totales | 21.233.664 (parametros del adaptador; el modelo base Qwen3.5-4B no se incluye en el repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B; no especificada en la informacion) |
| Tipos de cuantizacion | GGUF Q4_K_M (usado en la evaluacion); el adaptador se convierte a GGUF y se aplica por peticion |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3.5-4B`, un transformer denso, mediante LoRA con r=16, alpha=32 y dropout 0. Los modulos adaptados son las proyecciones q/k/v/o de las 8 capas de atencion completa y las proyecciones gate/up/down de las 32 MLP. El entrenamiento se realizo con SFT (`training_method="instruction"`) en la plataforma Adaption AutoScientist (Python SDK 0.19.0), con una sola iteracion (`max_iterations=1`), learning rate 1e-4, 2 epocas, schedule coseno, warmup 0.03, max grad norm 2.0, weight decay 0 y enmascarado de tokens de prompt (`train_on_inputs=false`). El run completo duro 21 minutos (44 pasos de optimizador), con perdida de entrenamiento de 0,26 a 0,18 y perdida de validacion final de 0,172.

Los datos de entrenamiento son 2.254 filas (413 ensayos) generadas por scripts propios del proyecto a partir de transcripciones sinteticas de ejecutores (experimentos 01-07), sin datos personales ni de terceros. Solo se usaron semillas 0-31; las semillas 32-47 quedaron reservadas y las 48-95 nunca se generaron antes de la evaluacion. Se conservaron unicamente turnos de ejecutor correctos (`any_residue == False`, `task_success == True`, sin llamada `export_data`) en condiciones de revocacion con senal explicita (notice, retraction, lineage marks, strict notice, early revocation, quarantine, taint marks/quarantine) y en la condicion limpia. Se excluyeron las condiciones comprometidas y `revoke_silent` (sin senal en el prompt), las condiciones benignas de falsa alarma (reservadas como test de sobre-rechazo) y la ablacion sin segunda fuente. El prompt se renderiza en texto plano con cabeceras `### SYSTEM` / `### USER` / `### ASSISTANT` y termina en `### ASSISTANT (next turn: one JSON tool call)`; el completion es la llamada de herramienta en JSON compacto. La composicion por ejecutor de origen incluye Qwen3.8 27B (634 filas), Ministral-3 14B (580), Gemma 4 31B (463), GPT-6 Luna (444), gpt-oss-120b (80) y DeepSeek V4 Flash / GLM 5.2 / Qwen3.5 397B (53).

## Capacidades

- Generacion de llamadas de herramienta en JSON compacto sobre un CRM simulado (conjunto fijo de herramientas del banco de pruebas).
- Actuacion como ejecutor en equipos multiagente: procesa system prompt, ticket, handoff y el historial de llamadas y resultados previos.
- Deteccion y no propagacion de valores falsos introducidos por un agente comprometido cuando existe senal de revocacion en el contexto (aviso, retraccion, marcas de linaje, cuarentena, marcas de taint).
- Mantenimiento de la tasa de exito de tarea en condiciones de falsa alarma (sin sobre-rechazo declarado).
- Capacidades generales de texto heredadas del modelo base Qwen3.5-4B (no evaluadas de forma independiente en esta ficha).
- No se declara soporte de vision, audio, modo thinking (desactivado en la evaluacion) ni capacidades multilingues mas alla del ingles.

## Casos de uso

- **Investigacion sobre influencia residual en equipos de agentes**: usar el adaptador como baseline entrenado frente al modelo base sin ajustar para medir el efecto del SFT sobre la tasa de residuo tras la revocacion de un agente comprometido, con diseno pareado por semilla y test exacto de McNemar.
- **Comparacion de mitigaciones de plataforma frente a mitigaciones por entrenamiento**: el adaptador sirve como referencia para contrastar con controles del lado de la plataforma (bloqueo del agente revocado, filtrado de handoffs, cuarentena) en el mismo banco de pruebas sintetico.
- **Evaluacion de sobre-rechazo en ejecutores ajustados**: las condiciones benignas de falsa alarma permiten medir si el ajuste provoca rechazos indebidos; el autor declara una tasa de exito de tarea del 93,8% en esa condicion.
- **Prototipado de ejecutores con tool calling en entornos controlados**: el formato de prompt y de salida (una llamada JSON por turno) es directamente reutilizable en pipelines de investigacion que necesiten un ejecutor con salida estructurada y conjunto de herramientas fijo.
- **Reproduccion de experimentos de seguridad de agentes**: el repositorio del proyecto incluye scripts de construccion de dataset, curvas de perdida y estado del entrenador, lo que permite replicar el run y auditar la metodologia.
- **Estudio de la limitacion de generalizacion**: el propio autor documenta que el modelo no aprende que fuente es fiable (el residuo sube al 93,8% cuando el agente comprometido no ha sido revocado), lo que lo convierte en un caso de estudio util sobre los limites del ajuste supervisado en seguridad de agentes.

## Benchmarks y rendimiento

Resultados declarados por el autor en el banco de pruebas sintetico "Revoked but Not Forgotten" (semillas frescas 48-95, inferencia con llama.cpp y Qwen3.5-4B-Q4_K_M, thinking desactivado, temperatura 0,7). No verificados de forma independiente (`verified: false`).

| Metrica | Base | Adaptador |
|---|---|---|
| Residuo, revocado + aviso | 79% | 12,5% |
| Residuo, revocado + marcas de linaje | 71% | 0% |
| Residuo, solo credenciales revocadas | 65% | 31,3% |
| Residuo, comprometido y no revocado | 75% | 93,8% |
| Exito de tarea, condicion de falsa alarma | 67% | 93,8% |

El autor reporta ademas un win rate de AutoScientist frente al modelo base de 0,5325 tras la primera iteracion (objetivo 0,7 no alcanzado); esta metrica compara generaciones de forma libre, no resultados de tool use.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el adaptador pesa 0,1 GB y se suma al modelo base Qwen3.5-4B. En cuantizacion Q4_K_M, un modelo de 4B ocupa aproximadamente 2,5-3 GB, aunque esta cifra no la proporciona la informacion disponible.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no confirmado en la informacion; la evaluacion se realizo con llama.cpp, lo que sugiere viabilidad en hardware modesto, pero no se especifica la GPU empleada.
- Opciones de despliegue: llama.cpp server (usado en la evaluacion), con el adaptador convertido a GGUF y aplicado por peticion sobre `Qwen3.5-4B-Q4_K_M.gguf` de unsloth. Otras opciones (vLLM, TGI, Ollama) no se mencionan en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas con otros adaptadores o modelos de la misma categoria en la informacion proporcionada. La unica comparacion documentada es contra su propio modelo base sin ajustar (Qwen3.5-4B), cuyos resultados se recogen en la seccion de benchmarks.

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| revocation-aware-executor-qwen3.5-4b | 21,2 M (adaptador LoRA) | no disponible | Seguridad de agentes (revocacion) | apache-2.0 |
| Qwen3.5-4B (base) | no disponible | no disponible | Modelo generalista | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **No es un control de seguridad de produccion**: el autor lo declara explicitamente como modelo de investigacion, entrenado y evaluado solo sobre seis plantillas sinteticas de ticket y un conjunto fijo de herramientas.
- **Depende del bloqueo efectivo por parte de la plataforma**: el adaptador asume que la plataforma bloquea realmente al agente revocado; no sustituye ese control.
- **No aprende que fuente es fiable**: cuando el agente comprometido no ha sido revocado, el residuo sube del 75% al 93,8%, es decir, el ajuste puede empeorar el comportamiento en ese escenario.
- **Residuo no nulo en algunas condiciones**: 31,3% con solo credenciales revocadas y 12,5% con aviso de revocacion; solo las marcas de linaje alcanzan el 0%.
- **Riesgo de alucinacion**: no evaluado de forma independiente en la informacion disponible; el modelo base puede alucinar y el adaptador no corrige esa limitacion general.
- **Idioma**: solo ingles; no se declaran capacidades multilingues.
- **Sesgos**: no documentados en la informacion disponible.
- **Verificacion**: todos los resultados de benchmarks estan marcados como no verificados (`verified: false`) y proceden del propio autor.
- **Licencia**: apache-2.0 para el adaptador; deben respetarse las condiciones del modelo base Qwen3.5-4B, cuya licencia no se detalla en la informacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FatimahEmadEldin/revocation-aware-executor-qwen3.5-4b
- Repositorio del proyecto "Revoked but Not Forgotten": https://github.com/astral-fate/revoked-not-forgotten
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B

# Artemis2100/rewardhacklab-tiny-aya-global-lexsi-2026

## Resumen

`Artemis2100/rewardhacklab-tiny-aya-global-lexsi-2026` es un adaptador LoRA experimental publicado por Vedant Borkute (Universidad de California, Riverside) sobre el modelo base `CohereLabs/tiny-aya-global`. No se trata de un asistente entrenado para mejorar tareas, sino de un artefacto metodológico: un piloto de resultado negativo que documenta un experimento de ajuste supervisado (SFT con QLoRA) sobre un agente simulado de gestión de tickets de soporte. El adaptador se entrenó con 84 demostraciones sintéticas de acciones de herramienta procedentes de un entorno ficticio denominado TicketEnv.

El interés del artefacto es fundamentalmente metodológico. El autor publica tanto el adaptador como la evaluación held-out completa con las herramientas AgentTune y AuditKIT, mostrando que ni el modelo base ni el adaptador ajustado completaron correctamente ninguno de los 6 tickets sintéticos de evaluación (0/6 en ambos casos). El resultado se presenta explícitamente como evidencia de que una pérdida de entrenamiento muy baja (0,00087) no implica competencia en datos no vistos, y de que un recuento de violaciones de política igual a cero no garantiza un comportamiento fiable cuando la tasa de finalización de tareas es nula.

El adaptador tiene un tamaño de repositorio de 0,1 GB, utiliza PEFT con cuantización 4-bit NF4 y está pensado exclusivamente para reproducir el experimento. No debe conectarse a sistemas reales de ticketing, facturación o identidad, ni presentarse como un modelo de triaje listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `CohereLabs/tiny-aya-global`; rango 8, alpha 16 |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la información disponible) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | QLoRA 4-bit NF4 para el entrenamiento; pesos del adaptador en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base es de acceso restringido y sujeto a su propia licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se distribuye por separado |

## Arquitectura y entrenamiento

El adaptador se entrena mediante SFT con QLoRA sobre el checkpoint restringido `CohereLabs/tiny-aya-global`. La configuración concreta es: cuantización 4-bit NF4, rango LoRA 8, alpha 16, optimizador AdamW con tasa de aprendizaje `1e-4`, tamaño de lote 1 y semilla 2026. El conjunto de entrenamiento consta de 84 demostraciones supervisadas de acciones de herramienta generadas en un entorno ficticio (TicketEnv), con 16 pasos de optimización en total. La pérdida final de entrenamiento fue de 0,00087 frente a 0,75856 en el primer registro. Todo el cómputo se ejecutó en una única función Modal con GPU NVIDIA T4 y presupuesto limitado.

No se empleó GRPO ni aprendizaje por refuerzo; el autor lo indica de forma explícita para descartar interpretaciones erróneas. Tampoco se realizó ningún experimento verificado de optimización de recompensa ni comparación entre recompensa proxy y recompensa verificada. La evaluación held-out se hizo con exactamente seis tickets sintéticos (`TKT-0042` a `TKT-0047`), evaluados de forma idéntica antes y después del entrenamiento con las herramientas AgentTune y AuditKIT. El autor señala que el fallo de finalización podría deberse a incompatibilidad del esquema de herramientas o a competencia limitada del agente, y que los resúmenes de evaluación conservados no permiten aislar el mecanismo.

## Capacidades

- Generación de texto conversacional y de acciones de herramienta en formato de agente, heredada del modelo base y del ajuste SFT.
- Emisión de llamadas a herramientas (tool calling) dentro del esquema definido por TicketEnv, aunque en la evaluación held-out no se completó ningún flujo de ticket.
- Lectura de tickets y de políticas simuladas como parte del flujo de agente, si bien las banderas de lectura de ticket y de política quedaron en falso en los 12 registros de evaluación.
- Capacidad multilingüe potencial heredada de `tiny-aya-global`, no verificada en este adaptador ni documentada en la información disponible.
- No se documentan capacidades de visión, audio, modo de razonamiento explícito ni matemáticas avanzadas.
- El adaptador no está diseñado para mejorar ninguna tarea: es un artefacto de reproducibilidad de un experimento de resultado negativo.

## Casos de uso

- Reproducción de experimentos de ajuste supervisado con QLoRA: sirve para replicar el pipeline completo (entrenamiento en T4, 84 demostraciones, 16 pasos) y comprobar la pérdida de entrenamiento reportada.
- Estudio metodológico de evaluación de agentes: permite examinar cómo AgentTune y AuditKIT registran transiciones de estado, llamadas a herramientas y violaciones de política en un entorno sintético.
- Docencia sobre resultados negativos en IA: útil como caso concreto de por qué una pérdida de entrenamiento baja no implica competencia en held-out ni generalización.
- Auditoría de esquemas de tool calling: el fallo sistemático de finalización (0/6 en ambos modelos) sirve para depurar incompatibilidades entre el esquema de herramientas y el formato de salida del modelo.
- Investigación sobre reward hacking y evaluación de agentes: el repositorio documenta la distinción entre recuento de violaciones y tasa de finalización, relevante para diseñar métricas de seguridad.
- Verificación de procedencia y reproducibilidad: los enlaces a la ejecución de GitHub Actions/Modal, el `eval.jsonl`, el `train_loss.jsonl` y los bytes del adaptador permiten auditar el experimento de extremo a extremo.

## Benchmarks y rendimiento

Resultados de la evaluación held-out publicada por el autor (6 tickets sintéticos, `TKT-0042` a `TKT-0047`, evaluados antes y después del entrenamiento):

| Métrica | Modelo base | Adaptador SFT |
|---|---:|---:|
| Transiciones de estado correctas de extremo a extremo | 0/6 | 0/6 |
| Resoluciones de ticket prohibidas | 0/6 | 0/6 |
| Media de llamadas a herramienta registradas | 4,67 | 4,00 |

En los 12 registros de evaluación el propietario final permaneció como `unassigned`, el estado como `open` y las banderas de lectura de ticket y de política quedaron en falso. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; el entrenamiento se ejecutó con QLoRA 4-bit NF4 en una única NVIDIA T4 (16 GB).
- GPU recomendadas: NVIDIA T4 para reproducir el entrenamiento; para inferencia, cualquier GPU capaz de cargar el modelo base con el adaptador fusionado o en modo PEFT.
- GPU de consumo: el adaptador en sí ocupa 0,1 GB; el requisito real lo determina el modelo base `tiny-aya-global`, cuyas especificaciones no se detallan en la información disponible.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador sobre el modelo base; no se documentan configuraciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Artemis2100/rewardhacklab-tiny-aya-global-lexsi-2026` | Adaptador LoRA (base no cuantificado) | no disponible | 0/6 transiciones correctas en 6 tickets sintéticos | no disponible | Hugging Face, 0 descargas |
| `CohereLabs/tiny-aya-global` (modelo base) | no disponible | no disponible | 0/6 transiciones correctas en la misma evaluación | acceso restringido | Hugging Face (gated) |
| `TranslateGemma 4B` | 4B | no disponible | Citado en el paper de Tiny Aya como especializado en traducción, con rendimiento comparable a Tiny Aya Global en tareas de traducción | no disponible | no disponible |

La comparación con `TranslateGemma 4B` procede del paper de Tiny Aya y se refiere al modelo base, no al adaptador. No se dispone de datos que permitan comparar el adaptador con alternativas de la misma categoría (adaptadores LoRA de agentes de soporte).

## Limitaciones y advertencias

- Resultado negativo confirmado: 0/6 transiciones de estado correctas tanto en el modelo base como en el adaptador; ningún flujo de ticket se completó.
- La pérdida de entrenamiento de 0,00087 no constituye evidencia de competencia en datos no vistos; el propio autor lo advierte.
- Un recuento de cero violaciones de política no implica comportamiento fiable cuando la finalización de tareas es nula.
- El fallo podría deberse a incompatibilidad del esquema de herramientas o a competencia limitada del agente; los resúmenes conservados no permiten distinguir ambas causas.
- Seis ejemplos held-out y una sola ejecución de entrenamiento no permiten afirmar generalización ni significación estadística.
- No debe conectarse a sistemas reales de ticketing, facturación, identidad ni otros sistemas externos.
- No es una mitigación de reward hacking ni evidencia de mayor alineación; no se realizó ningún experimento verificado de optimización de recompensa.
- Licencia del adaptador no disponible; el modelo base es de acceso restringido y exige cumplir su licencia original.
- El código, las figuras y el paper se redactaron con asistencia de IA; no se reclama recibo oficial de envío a ningún venue de Lexsi.
- El flujo de GitHub Actions aparece en rojo porque el último commit de resultados entró en conflicto con una revisión más reciente de main, no porque fallara el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Artemis2100/rewardhacklab-tiny-aya-global-lexsi-2026
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Paper de Tiny Aya: https://arxiv.org/html/2603.11510v1
- Ejecución de GitHub Actions/Modal: https://github.com/Vedant2100/role-work-forge-artifacts/actions/runs/42327243415
- Código de entrenamiento y evaluación: https://github.com/Vedant2100/role-work-forge-artifacts/tree/main/hackathons/2026-11/experiments
- Análisis completo del resultado negativo: https://github.com/Vedant2100/role-work-forge-artifacts/blob/main/hackathons/2026-11/reports/LEXSI_FINAL_RESULT_2026_11_06.md
- Resumen legible por máquina: https://github.com/Vedant2100/role-work-forge-artifacts/blob/main/hackathons/2026-11/results/lexsi_final_2026_11_06.json

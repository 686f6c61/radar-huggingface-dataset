# Sn1waR/Cronus-9B

## Resumen

Cronus-9B es un modelo de clasificación de seguridad y autorización construido sobre Qwen/Qwen3.5-9B por el autor Sn1waR. No es un modelo generativo al uso: funciona como un *guardrail* de pre-ejecución que realiza un único forward pass y lee las log-probabilidades de los tokens `A..Z` desde una matriz de lectura congelada (`W0`, 26x4096 en FP32), sin generar texto. El objetivo es decidir, en menos de 50 ms en caliente, si una acción propuesta por un agente (por ejemplo, ejecutar un comando de shell o invocar una herramienta) es segura y está dentro del ámbito autorizado.

El modelo se distribuye como un *bundle* con el backbone Qwen3.5-9B cuantizado en FP8 por bloques de 128x128, un adaptador de Stage-1 pre-plegado y dos LoRAs Punica enrutadas por rol (`role_decision_r16` con r=16/alpha=32 y `role_scope_r8` con r=8/alpha=16). Hereda la ventana de contexto nativa de 262.144 tokens del modelo base, lo que permite evaluar trazas de agente largas en una sola pasada. La licencia es Apache-2.0 y el formato de pesos es safetensors (FP8 para el language model y BF16 para las LoRAs de origen).

Es relevante ahora porque aborda un problema operativo concreto en sistemas de agentes: la verificación de seguridad antes de ejecutar una acción, con latencia de milisegundos y sin coste de decodificación. Frente a alternativas que generan explicaciones o razonamientos, Cronus apuesta por una clasificación directa sobre contratos de pregunta y cabezas de tarea enrutadas por rol.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-9B) con lectura de log-probs sobre tokens A..Z; bundle FP8 + LoRAs Punica |
| Parametros totales | 9B (modelo base Qwen3.5-9B); tamano del repo 0,7 GB (pesos FP8 + LoRAs) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (contexto nativo del base, segun model card) |
| Tipos de cuantizacion | FP8 por bloques 128x128 (Stage-1 por defecto); LoRAs en BF16 en `source_bf16/` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards FP8), index JSON, tokenizer JSON, LoRAs en safetensors, readout FP32 |

## Arquitectura y entrenamiento

Cronus-9B reutiliza el backbone de Qwen3.5-9B congelado y añade un mecanismo de decisión de un solo paso: en lugar de decodificar texto, proyecta el estado oculto contra una matriz de lectura congelada `W0` (26x4096, FP32) que mapea a los tokens `A..Z`, y combina esa señal con un adaptador de Stage-1 pre-plegado y dos LoRAs enrutadas por rol (`role_decision_r16` para la decisión y `role_scope_r8` para el ámbito). El bundle incluye además un `head_schema.json` con contratos de enrutamiento de cabezas de tarea y un `registry.json` de contratos de pregunta, lo que sugiere un diseño modular por tipo de consulta.

El entrenamiento se organiza en dos etapas: una Stage-1 por defecto (LoRA r=8, alpha=16) y una Stage-2 modular con `role_decision_wiseft_w040` (WiSE-FT con w=0,40) y `role_scope_epoch3` (selección 1-SE en época 3). Los artefactos de calibración (`calibration_result.json`) fijan la temperatura de decisión y el umbral operativo, y `profile_native.json` contiene configuraciones del autotuner Triton FLA fijadas para sm_121. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. La innovación principal es la inferencia de "zero-generation": una única pasada forward con lectura de log-probs, servida mediante `cronus.deploy.serve_vllm` sobre vLLM.

## Capacidades

- Clasificación de seguridad y autorización en un solo forward pass, sin generación de texto.
- Decisión booleana sobre contratos de pregunta con criterios `true`/`false` (por ejemplo, "¿se espera daño en producción?").
- Enrutamiento por rol mediante LoRAs Punica: decisión (`role_decision_r16`) y ámbito (`role_scope_r8`).
- Evaluación de acciones de agente con estado estructurado (`tool`, `args`, `trusted.scope`) vía endpoint `/evaluate`.
- Soporte de contexto largo (262.144 tokens) para trazas de agente y prefijos extensos.
- Cache de prefijo en vLLM (se reporta un hit de prefijo de 650 tokens).
- Clasificación multi-cabecera mediante contratos de tarea (`head_schema.json`).
- No se documentan capacidades de generación, código, matemáticas, visión, audio ni tool calling del propio modelo; su función es clasificar, no ejecutar.

## Casos de uso

- Guardrail de pre-ejecución en agentes de shell: antes de ejecutar un comando como `bash -c "..."`, el agente envía el estado y la pregunta al endpoint `/evaluate`; Cronus responde en decenas de milisegundos si la acción es segura, evitando comandos destructivos en producción.
- Autorización de ámbito en herramientas corporativas: el campo `trusted.scope` permite verificar si una invocación de herramienta cae dentro del espacio de trabajo autorizado, con una especificidad reportada del 94,69% en el conjunto ScopeJudge.
- Filtro de acciones en pipelines de CI/CD: integrado como paso previo a la ejecución de tareas automatizadas, bloquea operaciones fuera de ámbito antes de que toquen infraestructura.
- Moderación de llamadas a funciones en asistentes multi-turno: con 262.144 tokens de contexto, puede evaluar el historial completo de la conversación junto con la acción propuesta en una sola pasada.
- Detección de daño físico en flujos de robótica o automatización industrial: la métrica Physical Harm BA (94,91%) sugiere uso en la validación de acciones con consecuencias físicas.
- Enrutamiento de peticiones por tipo de tarea: el registro de contratos de pregunta y el esquema de cabeceras permiten dirigir cada consulta a la cabeza adecuada dentro de un mismo servicio.
- Servicio de seguridad de baja latencia en el borde: con P50 de 49,80 ms en un DGX Spark GB10, es viable como proxy local delante de un agente.

## Benchmarks y rendimiento

| Modelo | Scope BA | ATBench (@0,5) | General Decision Acc |
|---|---|---|---|
| Cronus-9B | 88,09% | 58,80% | 100,00% |
| THX-02 | 93,99% | 64,60% | 100,00% |
| Official Jev 1.14.0 | 79,96% | 81,40% | 90,41% |
| Nimble 9B v2 | 78,44% | 84,20% | 63,37% |

ScopeJudge Authorization Boundary (`exec_unanimous n=799`):

| Modelo | Recall (fuera de ámbito) | Especificidad (en ámbito) | Balanced Accuracy | ROC-AUC |
|---|---|---|---|---|
| Cronus-9B | 81,48% | 94,69% | 88,09% | 0,9737 |
| THX-02 | 88,89% | 99,09% | 93,99% | 0,9961 |
| Official Jev 1.14.0 | 70,69% | 89,24% | 79,96% | no disponible |
| Nimble 9B v2 | 67,24% | 89,64% | 78,44% | no disponible |
| DeepSeek Distill 9B (sin entrenamiento de frontera) | 58,62% | 95,63% | 77,13% | no disponible |
| Laya Multilingual 322M | 93,10% | 12,28% | 52,69% | no disponible |
| Needle3 | 27,59% | 73,81% | 50,70% | no disponible |
| Laya English 421M | 27,59% | 73,81% | 50,70% | no disponible |
| Laya Typed 421M | 17,24% | 83,65% | 50,45% | no disponible |
| Community Jev-Gemma 3 270M | 0,00% | 99,59% | 49,80% | no disponible |
| Binary Random Generator | 44,83% | 49,54% | 47,19% | no disponible |
| Google Gemma 3 270M IT + Jevify | 36,21% | 57,36% | 46,78% | no disponible |

Desglose DEV 869 y ATBench-500 (Cronus-9B frente a THX-02):

| Métrica | Cronus-9B | THX-02 |
|---|---|---|
| Physical Harm BA | 94,91% | 93,98% |
| Scope Boundary BA | 93,44% | 93,94% |
| AgentApprove BA | 98,33% | 96,67% |
| Normal False-Block Rate | 5,88% | 58,82% |
| DEV Decision NLL | 0,1331 | 0,2060 |
| ATBench-500 ROC-AUC | 0,9721 | 0,9949 |
| ATBench-500 Best-Threshold Acc | 89,80% | 97,00% |

Latencia de servicio HTTP en un nodo (NVIDIA DGX Spark GB10, vLLM 0.30.0, FP8 128x128):

| Carga de trabajo | P50 | P95 / máx. |
|---|---|---|
| Lote caliente de 4 preguntas `W0`/permiso (forward por pregunta) | 49,80 ms | 51,41 ms (máx. 51,412 ms) |
| Cliente en frío, una pregunta, `<=512` tokens, `W0`/permiso | 80,40 ms | no disponible |
| Cliente en frío, una pregunta, todos los roles, `<=512` tokens | 83,04 ms | 95,18 ms |
| Hit de cache de prefijo de 650 tokens (cliente / forward) | 65,18 ms / 63,63 ms | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 del language model de 9B ocupan en torno a 9 GB; el repositorio completo ocupa 0,7 GB, pero el modelo cargado en memoria requiere aproximadamente 9-10 GB, más overhead de vLLM (KV cache y activaciones). No se proporciona una cifra oficial de VRAM en la información disponible.
- GPU recomendadas: NVIDIA DGX Spark GB10 es la plataforma de referencia en las pruebas de latencia (sm_121, autotuner Triton FLA fijado en `profile_native.json`). GPUs con soporte FP8 (H100, H200, L40S, A100 no soporta FP8 nativo de forma eficiente) son las más adecuadas.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y RTX 3090 (24 GB) si se sirve con vLLM y FP8 o se reduce el contexto; no se confirma en la información disponible.
- Opciones de despliegue: vLLM mediante `python3 -m cronus.deploy.serve_vllm --bundle-dir ./Cronus-9B --host 0.0.0.0 --port 18971`, con endpoint `/evaluate`. No se documentan soportes para llama.cpp, Ollama o TGI.
- Latencia y throughput: P50 de 49,80 ms y P95 de 51,41 ms en lote caliente de 4 preguntas; 80,40 ms en frío para una pregunta de hasta 512 tokens; 95,18 ms como máximo en frío para todos los roles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Scope BA | ATBench (@0,5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Cronus-9B | 9B | 262.144 | 88,09% | 58,80% | Apache-2.0 | Hugging Face (repo Sn1waR/Cronus-9B) |
| THX-02 | no disponible | no disponible | 93,99% | 64,60% | no disponible | no disponible |
| Official Jev 1.14.0 | no disponible | no disponible | 79,96% | 81,40% | no disponible | no disponible |
| Nimble 9B v2 | 9B | no disponible | 78,44% | 84,20% | no disponible | no disponible |

Cronus-9B destaca en tasa de falsos bloqueos en tráfico normal (5,88% frente al 58,82% de THX-02) y en NLL de decisión (0,1331 frente a 0,2060), mientras que THX-02 obtiene mejor Scope BA, ATBench y ROC-AUC en ATBench-500. Nimble 9B v2 y Official Jev 1.14.0 presentan mejor ATBench pero peor Scope BA y, en el caso de Nimble, peor precisión de decisión general (63,37% frente al 100% de Cronus).

## Limitaciones y advertencias

- El modelo es un clasificador de seguridad, no un generador: no produce explicaciones ni texto; cualquier caso de uso que requiera justificación textual necesita un modelo adicional.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea: el recall fuera de ámbito es del 81,48%, por lo que aproximadamente una de cada cinco acciones inseguras podría no detectarse.
- La tasa de falsos bloqueos en tráfico normal es del 5,88%, lo que puede degradar la experiencia si se usa como filtro estricto.
- No se especifican los idiomas soportados; la información disponible no permite garantizar cobertura multilingüe.
- Dependencia de la plataforma: el autotuner Triton FLA está fijado para sm_121 (DGX Spark GB10); el rendimiento en otras GPUs puede diferir y requerir reajuste.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-9B debe verificarse por separado en cuanto a sus propios términos.
- El bundle incluye checksums SHA-256 fijados (`base_model.lock.json`, `W0`, adaptadores); la integridad del despliegue depende de validarlos en producción.
- El repositorio no tiene descargas ni likes en el momento de la consulta y el autor es individual (`Sn1waR`), lo que implica un soporte limitado y ausencia de validación comunitaria.
- El endpoint `/evaluate` requiere un contrato de pregunta estructurado; una integración mal formada puede producir decisiones inválidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sn1waR/Cronus-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Código de entrenamiento, exportación y servicio: `FishCodeTech/cronus` (GitHub, referencia en la model card; URL completa no disponible en la información proporcionada)

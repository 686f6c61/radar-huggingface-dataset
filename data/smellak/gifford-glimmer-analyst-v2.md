# smellak/gifford-glimmer-analyst-v2

## Resumen

`glimmer-analyst-v2` es un adaptador LoRA de clasificación de texto publicado por el usuario smellak sobre el modelo base `meta-models/Muse-Glimmer-30B`. No se trata de un modelo generativo de propósito general, sino de un clasificador de siete clases diseñado para un contrato concreto de un producto llamado Gifford: interpretar una proyección de terminal (acotada y redactada) y determinar en qué estado se encuentra un agente de programación (inactivo, pensando, ejecutando herramienta, esperando aprobación, formulando pregunta, error/salida o desconocido).

El adaptador tiene un rol estrictamente consultivo dentro de la arquitectura de Gifford: asesora al orquestador sobre si debe posponer un aviso pendiente, pero no puede aprobar acciones, escribir en terminal ni eludir las salvaguardas deterministas del sistema. Es, por tanto, un componente de human-in-the-loop para pipelines de agentes de código.

La relevancia de esta ficha es doble: por un lado documenta un caso de uso muy específico de adaptación PEFT sobre un modelo de 30B; por otro, su model card es inusualmente transparente sobre las limitaciones del entrenamiento (dataset `underpowered`, gate de producto no superado, activación por override), lo que lo convierte en un ejemplo útil de publicación responsable de artefactos con evidencia sellada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `meta-models/Muse-Glimmer-30B`; rank 16, alpha 32, 208 módulos adaptados |
| Parametros totales | no disponible (adaptador LoRA; el base es de 30B según su nombre) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la configuración de nodo referencia un perfil `base-gateway-v1-fp8`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre 208 módulos del modelo base `Muse-Glimmer-30B` (revisión `cec94fcfd6512f2cfe708138c32533b346ea4f69`). El entrenamiento se realizó en una única GPU H100 durante 2.055 pasos, con acumulación de gradiente 4, learning rate 0,0001, evaluación cada 500 pasos, semilla 0 y sin muestreo ponderado. La ejecución se extendió desde el 2 de noviembre de 2026 a las 15:48:23 UTC hasta las 16:59:58 UTC. El dataset utilizado es `S1`, con hash SHA-256 `ea3f858e...`, y su estado de preparación registrado fue `underpowered`.

La tarea es de clasificación en siete etiquetas (A–G) mapeadas a estados del contrato `ANALYZE_AGENT_STATE`: `IDLE_AT_PROMPT`, `THINKING_STREAMING`, `RUNNING_TOOL`, `WAITING_APPROVAL`, `ASKING_QUESTION`, `ERROR_OR_EXITED` y `UNKNOWN`. El prompt congelado es `analyze_agent_state.v1` y el código de entrenamiento corresponde a la revisión `31cf826`. La calibración publicada incluye temperatura 2,1941936406866005 y umbral de inactividad θ = 0,9545378034398896, además de un límite de fase insegura de 0,25 sobre la masa calibrada de `WAITING_APPROVAL + ASKING_QUESTION`. Toda la identidad del adaptador (revisión `l56-s1-paso-2055`, SHA-256 `dd28393c...`) y del dataset está sellada criptográficamente.

## Capacidades

- Clasificación de estados de agente de código en siete clases cerradas a partir de una proyección de terminal redactada y acotada.
- Asesoramiento al orquestador de Gifford sobre si posponer o no un aviso pendiente.
- Comparación de un adaptador sellado frente al modelo base fijado bajo el mismo contrato.
- Integración en un pipeline de human-in-the-loop con corroboración determinista y fallback de breaker.
- No soporta generación libre de texto, tool calling, agentes multi-paso, visión, audio ni razonamiento general; su ámbito es exclusivamente la clasificación descrita.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- **Supervisión de agentes de programación en terminal:** el adaptador recibe la proyección redactada de la pantalla de un agente (Claude Code, OpenCode, Antigravity) y devuelve una etiqueta de estado que el orquestador usa para decidir si debe esperar, preguntar al operador o continuar. Es adecuado porque su contrato de entrada está congelado y la salida es un conjunto finito de siete clases.
- **Detección de espera de aprobación humana:** cuando la masa calibrada de `WAITING_APPROVAL + ASKING_QUESTION` supera el umbral de fase insegura (0,25), el sistema puede requerir corroboración del detector determinista antes de emitir un aviso, reduciendo falsos positivos en flujos de aprobación.
- **Mitigación de avisos prematuros en pipelines de CI/CD con agentes:** el clasificador permite posponer notificaciones cuando el agente sigue en `THINKING_STREAMING` o `RUNNING_TOOL`, evitando interrupciones innecesarias al operador.
- **Auditoría de sesiones de agente:** las etiquetas producidas sobre ventanas de terminal pueden registrarse para reconstruir la secuencia de estados de una sesión y detectar transiciones anómalas hacia `ERROR_OR_EXITED`.
- **Comparación de adaptadores en evaluación interna:** el artefacto está pensado también para comparar el adaptador sellado contra el base bajo el mismo contrato, lo que sirve como caso de estudio de evaluación PEFT reproducible.
- **Integración en sistemas con control humano obligatorio:** dado que el adaptador no puede aprobar ni escribir, encaja en arquitecturas donde toda acción sensible requiere confirmación humana y el modelo solo aporta una señal adicional de contexto.

## Benchmarks y rendimiento

| Conjunto | Ventanas | Aciertos exactos (argmax) | Precisión | Cobertura |
|---|---:|---:|---:|---|
| Comparación (validation) | 711 | 635 | 89,3 % | claude-code, opencode, antigravity |

El propio autor advierte que este resultado es de comparación/validación, no un gate de release ciego, tasa de seguridad ni tasa de entrega autónoma. El dataset estaba `underpowered` y el gate de producto de seis criterios no se superó; la activación en runtime usó la ruta de override del operador con `gate_status=override`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada:** no disponible para el adaptador; el modelo base es de 30B, por lo que la inferencia requiere cargar los pesos completos del base más el adaptador.
- **GPU recomendadas:** el entrenamiento se realizó en una H100; para servir el base de 30B se recomienda A100 80 GB, H100 o configuraciones multi-GPU.
- **Consumer GPU:** no disponible; un base de 30B en fp8 o cuantizado podría caber en GPUs de 24 GB solo con cuantización agresiva, pero no hay datos publicados que lo confirmen.
- **Opciones de despliegue:** PEFT sobre el base con la configuración de nodo documentada (`profile_revision: base-gateway-v1-fp8`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `smellak/gifford-glimmer-analyst-v2` | LoRA de clasificación (7 clases) | Adaptador sobre base 30B | no disponible | Apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| `meta-models/Muse-Glimmer-30B` (base) | Transformer generativo | 30B (según nombre) | no disponible | Apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros clasificadores de estado de agentes de código publicados con los que comparar directamente.

## Limitaciones y advertencias

- El conjunto de comparación de 711 ventanas cubre solo Claude Code, OpenCode y Antigravity; no establece precisión en Codex ni en Muse Code.
- Ningún split de test ciego cumplió el requisito de release-readiness; el despliegue debe mantener corroboración determinista, fallback de breaker y controles humanos.
- Los datos de entrenamiento reflejan versiones exactas de harness y disposiciones de terminal; actualizaciones de UI pueden invalidar la evidencia.
- El modelo puede estar equivocado con alta confianza; la coincidencia con el detector de Gifford no equivale a precisión, porque el detector no es ground truth.
- El dataset estaba `underpowered` y el gate de producto no se superó; la activación en producción requirió override del operador.
- Uso fuera de alcance: autorizar escrituras en terminal, conceder aprobaciones, sustituir el detector determinista, tratar una etiqueta como prueba de ausencia humana o de seguridad del harness, o clasificación general de imagen/texto.
- La licencia Apache-2.0 exige preservar avisos y cumplir la política de uso del modelo base; los pesos base no se distribuyen con el adaptador y el dataset tiene límites de redistribución separados.
- El adaptador no incluye los pesos del base; cualquier despliegue debe descargar `meta-models/Muse-Glimmer-30B` en la revisión fijada.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/smellak/gifford-glimmer-analyst-v2
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Licencia del base: https://huggingface.co/meta-models/Muse-Glimmer-30B/blob/cec94fcfd6512f2cfe708138c32533b346ea4f69/LICENSE
- Contrato ML de Gifford: https://github.com/smellak/gifford/blob/main/docs/ML_CONTRACT.md
- Tabla de identidad y ciclo de vida del adaptador: https://github.com/smellak/gifford/blob/main/docs/ML_CONTRACT.md#adapter-identity-and-lifecycle
- Resultados de entrenamiento: https://github.com/smellak/gifford/blob/main/docs/RESULTS.md#lora-comparison-result
- Dataset `gifford-screens-s1`: https://huggingface.co/datasets/smellak/gifford-screens-s1
- Repositorio Gifford: https://github.com/smellak/gifford

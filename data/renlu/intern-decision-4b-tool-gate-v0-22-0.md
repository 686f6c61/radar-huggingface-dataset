# renlu/intern-decision-4b-tool-gate-v0.22.0

## Resumen

Intern-Decision-4B Tool Gate v0.22.0 es un adaptador LoRA publicado por el usuario `renlu` sobre el modelo base `internlm/Intern-Decision-4B`. No es un modelo de propósito general, sino un clasificador binario especializado: decide si un comando de shell que un agente de IA está a punto de ejecutar debe permitirse (`allow`) o requiere revisión humana antes de ejecutarse (`needs_review`). El adaptador se enmarca en el proyecto AutoDev y su módulo RSI (identificación de riesgos en tool calling).

El adaptador añade 16.232.448 parámetros entrenables sobre el modelo base de 4B, con un rango LoRA de r=8, alpha=16 y dropout=0.05, cubriendo los 32 niveles del transformer (248 módulos lineales de atención y MLP, incluidos los `in_proj_*`). El repositorio solo publica los pesos del adaptador (496 tensores en F32, ~0,1 GB), no los del modelo base.

Su relevancia práctica es acotada pero concreta: ofrece un mecanismo de "puerta de seguridad" previa a la ejecución de comandos en agentes autónomos, con una interfaz de inferencia inusual (no genera texto, sino que compara los logits de dos tokens candidatos `A` y `B` en una posición fija del prompt). Está pensado para flujos en los que un agente propone comandos y se necesita una capa adicional de control antes de ejecutarlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Intern-Decision-4B (base tipo InternVL/Qwen) |
| Parametros totales | 16.232.448 parametros entrenables del adaptador (modelo base de 4B no incluido en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.536 tokens (limite de evaluacion del adaptador; el contexto nativo del base no se especifica) |
| Tipos de cuantizacion | no disponible en la model card (existe repo GGUF separado publicado por el mismo autor) |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 (base sujeta a LICENSE y LICENSE-QWEN del modelo Intern-Decision-4B) |
| Formato de pesos | safetensors (adaptador LoRA en F32, 496 tensores) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango bajo (r=8, alpha=16, dropout=0.05) aplicado sobre los 32 niveles del modelo de lenguaje de Intern-Decision-4B, cubriendo 248 módulos lineales de atención y MLP, incluidos los `in_proj_*`. No se entrena la torre visual. El adaptador se entrena con entropía cruzada causal sobre el token que ocupa la posición del marcador `<decision>` en un prompt fijo, restringiendo la decisión a los dos tokens candidatos `A` y `B`. La inferencia no usa `generate`: se leen los logits en la posición `j-1` (la anterior al marcador) y se aplica un softmax en float32 únicamente sobre los dos candidatos.

Los datos de entrenamiento provienen del conjunto RSI (identificación de riesgos en tool calling) de AutoDev. La model card no detalla el número de tokens de entrenamiento ni la composición completa del dataset. Una innovación destacable es la política de entrada de la versión v22: antes de codificar, el campo `state.observed_target_evidence` se sustituye por `null` si contiene una cadena no vacía (las claves ausentes no se rellenan). Este cambio tiene efecto medible: sobre 145 muestras seleccionadas por un criterio concreto (v19 permite, v18 bloquea y el comando contiene `/tmp`), con el campo original se bloquean 22 y se permiten 123; tras aplicar la regla de `null`, se bloquean las 145 con puntuación 1.0. El autor advierte que este resultado es específico de ese conjunto contrafactual y no se puede extrapolar.

## Capacidades

- Clasificación binaria de riesgo de comandos de shell: emite `allow` (A) o `needs_review` (B) a partir del comando, el directorio de trabajo y el contexto visible del usuario.
- Puntuación de revisión `P(B)` mediante softmax sobre dos tokens candidatos, con umbral fijo de 0,5.
- Detección de riesgos concretos: operaciones sobre rutas sensibles, falta de autorización explícita, posibles violaciones de política.
- Resistencia a inyección de instrucciones en el texto de contexto: el prompt del sistema indica que las instrucciones del histórico no modifican las reglas y que una solicitud de aprobación no equivale a aprobación del usuario.
- Soporte bilingüe zh/en.
- No realiza generación libre de texto, ni tool calling general, ni razonamiento multi-paso, ni visión (aunque el base sea multimodal y se cargue con `AutoModelForImageTextToText`).

## Casos de uso

- Puerta de seguridad en agentes de código: antes de que un agente ejecute un comando de shell propuesto, se llama al adaptador con el comando, el `cwd` y el contexto del usuario; si `P(B) >= 0,5`, el comando se deriva a revisión humana. Adecuado por su latencia baja (una sola pasada, sin generación) y su decisión binaria clara.
- Control de operaciones destructivas en CI/CD: integrado como paso previo a scripts que pueden borrar ficheros, modificar permisos o tocar rutas del sistema, el adaptador filtra comandos de alto riesgo antes de ejecutarlos.
- Sandboxing de asistentes conversacionales con acceso a terminal: el modelo evalúa si el comando encaja en el ámbito autorizado (`requested_sandbox_permissions`) y en la justificación de aprobación (`approval_justification`).
- Auditoría y logging de decisiones: al devolver una puntuación `P(B)` continua además de la etiqueta, permite registrar el grado de riesgo de cada comando para análisis posterior.
- Filtrado en pipelines de agentes multi-herramienta: como etapa intermedia entre la planificación del agente y la ejecución de herramientas, reduciendo ejecuciones no autorizadas sin bloquear el flujo completo.
- Evaluación comparativa de políticas de seguridad: sirve como referencia para medir la tasa de falsos negativos (comandos peligrosos permitidos) y falsos positivos (comandos seguros bloqueados) de otras capas de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona resultados de regresión históricos entre versiones (v14, v18, v19, v20, v22) sobre conjuntos contrafactuales concretos, pero no ofrece cifras agregadas de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos de clasificación de riesgo. El único dato numérico reproducible es el del conjunto de 145 muestras descrito en la sección de arquitectura (145/145 bloqueadas tras aplicar la regla de `null`), que no constituye un benchmark general.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa ~0,1 GB en F32; el modelo base de 4B requiere aproximadamente 8 GB en bfloat16 y en torno a 3-4 GB en cuantización de 4 bits (estimación orientativa, no confirmada en la model card).
- GPU recomendadas: se requiere una GPU CUDA con soporte de bfloat16 (A100, H100, L40S, RTX 4090, RTX 3090). El ejemplo de la model card usa `device_map="cuda:0"`.
- Compatibilidad con GPU de consumo: sí, en GPUs con al menos 8 GB de VRAM para el base en bf16, o menos con cuantización (existe un repo GGUF publicado por el mismo autor).
- Opciones de despliegue: Transformers + PEFT (flujo oficial documentado); vLLM, llama.cpp, Ollama o TGI no están documentados en la model card para este adaptador, aunque el repo GGUF sugiere compatibilidad con llama.cpp.
- Latencia y throughput: no disponibles. La inferencia es una sola pasada sin generación, con `logits_to_keep` restringido a una posición, lo que reduce el coste frente a una generación completa.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos comparables de clasificación de riesgo de comandos de shell con la misma interfaz (logits sobre dos tokens candidatos). Como referencia estructural, se compara con el modelo base y con la versión anterior del propio adaptador.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Intern-Decision-4B Tool Gate v0.22.0 (este) | 16,2 M (adaptador) sobre base 4B | 1.536 tokens (evaluado) | Clasificación allow/needs_review | Apache-2.0 | Hugging Face (adaptador + GGUF) |
| Intern-Decision-4B Tool Gate v0.14.0 | Adaptador LoRA sobre el mismo base | no disponible | Igual, versión anterior | Apache-2.0 | Hugging Face |
| internlm/Intern-Decision-4B (base) | 4B | no disponible | Modelo multimodal de propósito general | Apache-2.0 + LICENSE-QWEN | Hugging Face |

## Limitaciones y advertencias

- La puntuación `P(B)` no es una probabilidad de riesgo calibrada sobre la distribución de producción; es un softmax sobre dos tokens candidatos con umbral fijo de 0,5.
- El adaptador está entrenado y evaluado con un límite de 1.536 tokens; entradas más largas deben revisarse por separado (el código de ejemplo lanza una excepción).
- La regla de preprocesado de v22 (anular `observed_target_evidence` no vacío) altera sustancialmente los resultados; omitirla produce decisiones distintas a las evaluadas.
- Los resultados de regresión entre versiones se obtuvieron sobre conjuntos contrafactuales específicos y no se pueden extrapolar a entradas arbitrarias.
- Solo cubre chino e inglés; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación no aplicable en el sentido habitual (no genera texto libre), pero sí existe riesgo de clasificación errónea: falsos negativos (permitir un comando peligroso) y falsos positivos (bloquear comandos seguros).
- Sesgos: la model card no documenta análisis de sesgos; el comportamiento depende de la distribución del dataset RSI de AutoDev, no descrita en detalle.
- La licencia Apache-2.0 del adaptador no exime del cumplimiento de las licencias del modelo base (LICENSE y LICENSE-QWEN de Intern-Decision-4B), que deben revisarse para uso comercial.
- El repositorio no incluye los pesos del modelo base; es necesario descargarlos por separado en la revisión fija `1e65a988dacbcf00b84aee7366f9e47563407000`.
- El ejemplo de la model card no se reejecutó en un cliente limpio tras descargar el base; solo se validó en la máquina de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/renlu/intern-decision-4b-tool-gate-v0.22.0
- Versión GGUF: https://huggingface.co/renlu/intern-decision-4b-tool-gate-v0.22.0-gguf
- Versión anterior v0.14.0: https://huggingface.co/renlu/intern-decision-4b-tool-gate-v0.14.0
- Modelo base: https://huggingface.co/internlm/Intern-Decision-4B
- Licencia del base: https://huggingface.co/internlm/Intern-Decision-4B/blob/1e65a988dacbcf00b84aee7366f9e47563407000/LICENSE
- Licencia QWEN del base: https://huggingface.co/internlm/Intern-Decision-4B/blob/1e65a988dacbcf00b84aee7366f9e47563407000/LICENSE-QWEN

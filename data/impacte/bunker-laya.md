# impacte/bunker-laya

## Resumen

`impacte/bunker-laya` es un modelo de clasificación de texto derivado por fine-tuning de `convaiinnovations/laya`, orientado a actuar como guardrail para agentes de IA. No genera texto: es un modelo de decisión no autoregresivo (denominado "System 1" por el autor) que recibe un estado textual y un conjunto de preguntas tipadas (`choice`, `score`, `noul`) y devuelve respuestas tipadas con probabilidades calibradas en una única pasada forward. Al no producir texto libre, elimina el parseo de salida y reduce la superficie de alucinación.

El modelo está entrenado específicamente para detectar información personal identificable (PII), intentos de prompt injection, jailbreak y peticiones dañinas. Cubre un banco de preguntas concreto: nueve categorías de PII (email, teléfono, SSN, tarjeta, IP, secretos, nombres, direcciones y presencia genérica) más tres categorías de seguridad (`injection_present`, `jailbreak_attempt`, `harmful_request`). Está pensado para integrarse en el plugin `opencode-bunker`, que fusiona las probabilidades del modelo con patrones regex para decidir acciones de tipo allow / flag / redact / block.

Es relevante porque ofrece guardrails ejecutables en el navegador o en Node sin necesidad de un sidecar en Python: el repo incluye grafos ONNX y tokenizador ModernBERT, y se consume mediante Transformers.js con un backend de ONNX Runtime. El modelo tiene 421.293.830 parámetros (~421 M) y licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión no autoregresivo sobre encoder (tokenizador ModernBERT); cabeza de decisión tipada con marcadores `[MASK]` |
| Parametros totales | 421.293.830 (dato de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (la secuencia se trunca a `max_len - head_max_len`, valores no publicados) |
| Tipos de cuantizacion | FP32 (ONNX, recomendado, ~1,6 GB) e INT8 weight-only (degradado, no recomendado: la cabeza PII colapsa a ~0,5) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`, `model.int8.onnx`) y safetensors (checkpoint PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en `convaiinnovations/laya`, descrito por el autor como un modelo de decisión "System 1" no autoregresivo. La entrada se construye como una secuencia tipada con el formato `[CLS] <qtype> question: <instructions> [SEP] [MASK] false: ... [MASK] true: ... [SEP] <state> [SEP]`. Cada opción de respuesta ocupa un token `[MASK]` cuya posición se indica en `marker_pos`, con `marker_mask` señalando los marcadores válidos. El grafo recibe además `qtype` (`choice=0`, `score=1`, `noul=2`) y produce dos salidas: `logits` (logits por opción, con softmax sobre las opciones de la pregunta) y `act_logits` (cabeza de acción, softmax de dos clases). Para preguntas de tipo `noul` hay exactamente dos opciones (`false`, `true`), de modo que `P(true) = softmax(logits[:2] / temperature)[1]`.

El tokenizador es ModernBERT (`tokenizer.json`, `tokenizer_config.json`) y la configuración del encoder incluye `cls_token_id`. Los hiperparámetros de inferencia (`max_len`, `head_max_len` y temperaturas por tipo de pregunta) se exponen en `rl_agent_config.json`, aunque sus valores no están publicados. El fine-tuning se realizó mediante el pipeline `opencode-bunker-laya`; el modelo base es Apache-2.0 y cada dataset de entrenamiento conserva su propia licencia (ver README del pipeline). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF/DPO.

## Capacidades

- Clasificación de PII en texto: detección de presencia genérica de PII y de categorías específicas como email, teléfono, número de identificación gubernamental (SSN), tarjeta de pago, dirección IP, credenciales (API keys, contraseñas, tokens), nombres de personas y direcciones postales.
- Detección de prompt injection: identifica intentos de anular, saltarse o manipular instrucciones de un sistema de IA, medidas de seguridad o identidad (por ejemplo, "ignore previous instructions", "reveal your system prompt", "act as an unrestricted AI").
- Detección de jailbreak: reconoce intentos de eludir las salvaguardas de un sistema de IA.
- Detección de peticiones dañinas: clasifica contenido que solicita actividad peligrosa, ilegal o no permitida.
- Salidas tipadas con probabilidades calibradas: devuelve logits sobre softmax para cada pregunta, lo que permite umbralizar decisiones (allow / flag / redact / block) en un pipeline de guardrails.
- Integración con regex: las probabilidades del modelo se pueden fusionar con presets de expresiones regulares del plugin, de modo que incrementos por regex elevan la probabilidad de una pregunta y pueden escalar la acción.
- Ejecución en JavaScript/Node y navegador vía Transformers.js + ONNX Runtime, sin sidecar en Python.
- No genera texto libre: la salida está restringida a las opciones definidas por el banco de preguntas.

## Casos de uso

- Guardrail previo a un LLM en un agente de código: interceptar cada turno del usuario y clasificarlo con el modelo antes de enviarlo al proveedor; si `injection_present` o `jailbreak_attempt` superan el umbral, bloquear la petición y registrar el evento en un `audit.jsonl`.
- Redacción de PII en logs y trazas: clasificar texto de entrada con las preguntas `pii_*` para decidir qué fragmentos enmascarar o eliminar antes de almacenar conversaciones.
- Cumplimiento y auditoría (GDPR/RGPD): etiquetar automáticamente contenido que contiene datos personales, generando un registro de evidencia por turno con la probabilidad asociada.
- Moderación de entrada en chatbots de atención al cliente: filtrar peticiones dañinas (`harmful_request`) y credenciales filtradas (`pii_secret`) antes de que lleguen al modelo generativo.
- Filtro de seguridad en aplicaciones de despliegue en el navegador: al ejecutarse con Transformers.js y ONNX Runtime Web, permite clasificar texto en el cliente sin enviar el contenido a un servidor.
- Telemetría de seguridad y detección de abuso: agregar las probabilidades por categoría en un panel para identificar patrones de ataque recurrentes (prompt injection, jailbreak) sobre la base de usuarios.
- Preprocesado en pipelines de RAG: marcar documentos o consultas con PII antes de indexarlos, evitando que datos sensibles entren en el almacén vectorial.
- Enrutado de decisiones en plugins de IDEs y editores: usar el modelo como clasificador local en extensiones que necesitan decidir si una acción del usuario requiere revisión adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K, F1, precisión/recall por categoría ni comparativas cuantitativas frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: el grafo ONNX ocupa ~1,6 GB, por lo que se puede ejecutar con holgura en GPUs con 2 GB o más de memoria libre; en CPU es viable para lotes pequeños.
- Cuantización INT8: reduce el peso, pero el propio autor advierte que la cabeza PII colapsa a ~0,5 y no la recomienda, por lo que no es una vía fiable para ahorrar memoria.
- GPU recomendadas: no disponibles de forma explícita; dado el tamaño (~421 M de parámetros), cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) debería poder ejecutarlo, aunque no hay cifras de latencia ni throughput publicadas.
- Cabe en GPU consumer: sí, por el tamaño del modelo FP32 (~1,6 GB), sin datos oficiales de rendimiento.
- Opciones de despliegue: Transformers.js (`AutoTokenizer`) junto con ONNX Runtime (`onnxruntime-node` o `onnxruntime-web`); el plugin `opencode-bunker` implementa este flujo en `src/classifier/onnx-local.ts`. No se documentan otros runners (vLLM, llama.cpp, Ollama, TGI), ya que el grafo es una cabeza de decisión personalizada y no una arquitectura estándar de `AutoModel`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores de guardrails de tamano similar) ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No genera texto: no es utilizable como modelo conversacional ni para tareas generativas; su salida se limita a logits y probabilidades sobre el banco de preguntas definido.
- Idiomas soportados no disponibles: no se puede garantizar el comportamiento multilingue ni el rendimiento fuera del idioma o idiomas de entrenamiento.
- Cuantizacion INT8 degradada: el propio autor indica que la cabeza PII colapsa a ~0,5; no debe usarse en produccion si se espera deteccion fiable de PII.
- Longitud de contexto desconocida: el truncado depende de `max_len - head_max_len`, cuyos valores no se publican; textos largos pueden perder informacion relevante.
- Riesgo de falsos positivos y negativos en clasificacion: al ser un clasificador probabilístico, requiere calibracion de umbrales y, segun el autor, fusión con regex para decisiones robustas.
- Licencia Apache-2.0 en el modelo, pero cada dataset de entrenamiento conserva su propia licencia (ver README del pipeline); conviene revisarlas antes de uso comercial.
- Provenance y madurez: cero descargas y cero likes en el momento de la informacion, con fecha de creacion y actualizacion muy recientes; puede considerarse un modelo poco validado por la comunidad.
- Dependencia del plugin `opencode-bunker`: parte de su valor practico (fusión de probabilidades con regex y escalado de acciones) reside en la arquitectura del plugin referenciado, no solo en el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/impacte/bunker-laya
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio del plugin: https://github.com/impacte-tech/opencode-bunker
- Arquitectura del plugin: `opencode-bunker` → `.planning/ARCHITECTURE.md`
- Proveedor ONNX local del plugin: `opencode-bunker` → `src/classifier/onnx-local.ts`
- Pipeline de entrenamiento: `opencode-bunker-laya` (README del pipeline; no se proporciona URL directa)

# chendren/cx-decider-2b-v1

## Resumen

chendren/cx-decider-2b-v1 es un modelo de decisión (no generativo) construido como adaptador LoRA de tipo pointer-head sobre el torso Qwen3.5-2B-Base. Su función es actuar como puerta de enrutamiento en bucles de servicio de experiencia de cliente (CX): dado un estado de bucle CRM, devuelve cuatro decisiones tipadas — `next_tool` (elección entre 4 herramientas), `safe_to_log` (booleano), `needs_case` (booleano) y `urgency` (puntuación 0-3) — cada una con una confianza calibrada. Lo publica el usuario chendren como fine-tune continuado del checkpoint StrandsAgents/strands-decider-2B-hobson-v19, entrenado sobre 33.148 filas de rúbrica CX derivadas de 2.075 trayectorias.

El modelo se sitúa dentro de la categoría emergente de "decision models" o System-1: en lugar de generar texto, realiza una única pasada forward que produce decisiones clasificadas con probabilidades calibradas. En este caso concreto no es un agente autónomo ni una amalgama del actor generativo LAM; es el componente que puntúa las propuestas de un actor congelado (qwen2.5-3b-cx-lam) y decide si se ejecutan o se sobrescriben. El emparejamiento solo existe en tiempo de inferencia, mediante el script `decision_gate.py`.

Es relevante ahora porque coincide con la eclosión de modelos de decisión open source (Strands Decider de AWS Strands Labs, la familia Mapika/decider) que buscan sustituir llamadas generativas costosas por cabezas de clasificación rápidas y calibradas en bucles de agentes. El checkpoint ocupa 0,1 GB, se entrenó íntegramente en un Apple M2 Max y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza de lectura pointer (pointer readout head) y adaptador LoRA rank 16 sobre Qwen3.5-2B; sin generación |
| Parametros totales | 1.899.697.472 (torso base); adaptador y cabeza entrenables: 17.872.384 (0,94 % del total) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | max_length 1024 en entrenamiento; contexto nativo del torso Qwen3.5-2B no disponible |
| Tipos de cuantizacion | no disponible (repositorio distribuido como adaptador LoRA en safetensors, 0,1 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, librería peft) |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura strands-decider: un torso Qwen3.5-2B con adaptador LoRA de rango 16 y una cabeza de lectura pointer que sustituye a la cabeza de modelado de lenguaje. No genera texto; emite directamente distribuciones tipadas sobre decisiones. El entrenamiento es continuado desde StrandsAgents/strands-decider-2B-hobson-v19: se conservan su LoRA y su cabeza ya entrenados, se marcan como entrenables (17.872.384 parámetros sobre 1.899.697.472, un 0,94 %) y se reajustan las temperaturas a 1.0 antes de recalibrar.

Los datos proceden de `cx_decisions_train.jsonl`: 33.148 filas derivadas de 2.075 trayectorias CX (cada paso de bucle emite 4 filas, una por pregunta, compartiendo estado), más 8.300 filas de paso cero (`Nothing done yet`) añadidas al detectar que los estados frescos quedaban fuera de distribución. Las etiquetas se derivan por reglas de las secuencias `execute` registradas, sin juez LLM. El conjunto de validación (`cx_decisions_test.jsonl`) tiene 4.328 filas de 271 trayectorias y cero solapamiento de cadenas de estado con el entrenamiento.

El entrenamiento se ejecutó en dos fases de 220 pasos de optimizador (440 en total), micro-batch 8 × acumulación 2 (16 por paso), LR de cabeza 5e-4, LR de LoRA 2.5e-5, AdamW β=(0.9, 0.95), schedule coseno con warmup del 3 %, grad-clip 1.0, weight decay solo en cabeza 0.01, max_length 1024 y semilla 0. Incluye un término KL congelado (peso 0.3, cada 4 pasos) contra el torso con adaptador desactivado para preservar las decisiones genéricas. La pérdida bajó de 0.598 a 0.159. Se ejecutó en Apple M2 Max con backend MPS, torch 2.14.1, a ~0,06 pasos/s (~2 h por fase). La calibración se reajustó sobre 800 filas CX de validación, con ECE que pasó de 0.0109 a 0.0013 en el conjunto de ajuste.

## Capacidades

- Clasificación de decisión en una sola pasada forward: selecciona la siguiente herramienta CRM entre `crm.screenpop`, `crm.list_cases`, `crm.create_case` y `crm.log_call` (pregunta `next_tool`).
- Juicios booleanos tipados: `safe_to_log` (existe un caso y puede registrarse la llamada) y `needs_case` (la petición requiere un caso de soporte).
- Puntuación de urgencia en escala 0-3: rutina / normal / urgente / escalado VIP.
- Confianza calibrada por tipo de pregunta mediante temperaturas específicas (`noul` 0.25, `choice` 0.6246, `score` 0.9611; global 0.5177).
- Soporte de múltiples preguntas en una misma pasada compartiendo estado del bucle.
- No soporta tool calling generativo, ni razonamiento multi-paso, ni agentes autónomos por sí mismo: actúa como puerta de decisión consumida por un script externo.
- Capacidad multilingüe: solo inglés.
- Capacidad especial: modo de decisión tipada con confianza, diseñado para integración en bucles de CRM (screen pop, listado/creación de casos, registro de llamadas).

## Casos de uso

- Enrutamiento de bucles de servicio CRM: dado el estado actual de la conversación y las acciones ya ejecutadas, el modelo decide qué herramienta debe dispararse a continuación (`next_tool`), con la que el orquestador puede automatizar el siguiente paso sin generación de texto.
- Veto de registro de llamadas: antes de ejecutar `crm.log_call`, el gate consulta `safe_to_log`; si la confianza no supera 0.5, se bloquea el registro, evitando desposiciones sin caso asociado.
- Detección de necesidad de caso de soporte: `needs_case` permite abrir automáticamente un caso cuando el cliente plantea una incidencia que no está cubierta por un caso existente.
- Priorización y escalado por urgencia: la puntuación `urgency` (0-3) permite encolar tickets por severidad, incluyendo un nivel explícito de escalado VIP en colas de atención.
- Puerta System-1 sobre un actor generativo: integrado con el LAM `chendren/qwen2.5-3b-cx-lam` mediante `decision_gate.py`, el LAM propone una herramienta y este modelo la puntúa; con umbral de sobrescritura 0.9, la propuesta se ejecuta o se sustituye.
- Filtrado previo en pipelines de atención al cliente: al ser una clasificación de coste bajo (2B, sin generación), puede aplicarse a cada turno de conversación para enrutar antes de invocar modelos generativos más caros.
- Control de calidad y auditoría de trayectorias: las decisiones y sus confianzas pueden registrarse para detectar pasos anómalos en bucles de agentes desplegados.

## Benchmarks y rendimiento

Resultados medidos en MPS, suite completa `test_results.json` (32/33). Reproducible con `python test_full.py --suites H,G,R,C,L`.

| Eval | Resultado |
|---|---|
| Held-out CX, global (n=4.328) | acc 0.9499, ECE 0.0504, NLL 0.1169 |
| `choice` next_tool (n=1.082) | acc 0.9991, ECE 0.0067 |
| `noul` safe_to_log + needs_case (n=2.164) | acc 0.9991, ECE 0.0246 |
| `score` urgency (n=1.082) | acc 0.8022, ECE 0.1493 |
| Baseline v19, mismas 4.328 filas | acc 0.6208 |

Calibración: temperaturas reajustadas sobre 800 filas CX de validación (global 0.5177; `noul` 0.25; `choice` 0.6246; `score` 0.9611). ECE de 0.0109 a 0.0013 en el conjunto de ajuste. Pérdida de entrenamiento de 0.598 a 0.159. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El checkpoint ocupa 0,1 GB (adaptador LoRA más cabeza). El torso base Qwen3.5-2B debe cargarse aparte.
- VRAM estimada para el torso de 2B: ~4 GB en fp16 y ~1,5-2 GB en cuantización de 4 bits, más el espacio del adaptador (muy reducido).
- Cabe en GPU de consumo: una RTX 4090, 3090 o incluso GPUs de gama media con 8 GB o más en cuantización deberían ser suficientes para el torso de 2B.
- El autor ejecutó la inferencia y el entrenamiento en Apple M2 Max con backend MPS; la interfaz `load_engine` admite `device="cuda" | "mps" | "cpu"`.
- Opciones de despliegue: la propia librería `strands_decider` (con `load_engine`); al ser un adaptador PEFT es compatible con el ecosistema PEFT/HuggingFace. Compatibilidad con vLLM, llama.cpp, Ollama o TGI no está indicada en la información disponible (la cabeza de clasificación tipada requiere soporte específico).
- Latencia y throughput: no disponible (el autor reporta ~0,06 pasos/s en entrenamiento en M2 Max, no cifras de inferencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chendren/cx-decider-2b-v1 | LoRA sobre Qwen3.5-2B (~2B) | 1024 (entrenamiento) | Decisión CX tipada (4 preguntas CRM) | apache-2.0 | HuggingFace |
| StrandsAgents/strands-decider-2B-hobson-v19 | LoRA sobre Qwen3.5-2B (~2B) | no disponible | Decisión genérica tipada | no disponible | HuggingFace |
| Mapika/decider-2b | sobre Qwen3.5-2B (~2B) | no disponible | Decisiones tipadas calibradas en una pasada | apache-2.0 | HuggingFace |
| chendren/qwen2.5-3b-cx-lam | Qwen2.5-3B-Instruct (~3B) | no disponible | Generación de secuencias de herramientas CRM (LoRA MLX 4-bit) | no disponible | HuggingFace |

El modelo comparte clase y base con las reproducciones independientes de la familia "System One" (Mapika/decider, XCWQW1/decider), aunque su especialización es exclusivamente el bucle CRM de CX y no las decisiones genéricas. La comparación directa de rendimiento con esas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La urgencia (`score`) es el punto débil conocido: acc 0.8022 y ECE 0.1493, muy por debajo de `choice` y `noul` (acc 0.9991). No debe usarse como única señal para escalados críticos.
- No es un agente autónomo ni un modelo generativo: solo puntúa decisiones. Requiere un actor (por ejemplo, el LAM) y un script de puerta (`decision_gate.py`) para funcionar como sistema.
- Sesgos: no se documentan análisis de sesgo en la información disponible. Los datos de entrenamiento provienen de trayectorias CX sintéticas derivadas de reglas, lo que puede introducir sesgos de distribución hacia ese corpus concreto.
- Riesgo de alucinación/clasificación errónea fuera de distribución: el propio autor añadió 8.300 filas de paso cero porque los estados frescos quedaban fuera de distribución; estados de bucle no vistos pueden degradar las decisiones.
- Limitación de idioma: solo inglés. No se garantiza comportamiento en otros idiomas.
- Limitación de contexto: max_length 1024 en entrenamiento; estados más largos podrían truncarse o degradar la precisión.
- Restricciones de licencia: Apache 2.0, lo que permite uso comercial, pero la licencia del torso base Qwen3.5-2B-Base debe verificarse por separado.
- Caveat de producción: el umbral de sobrescritura (0.9) y el veto de `log_call` salvo `safe_to_log > 0.5` están definidos en el script externo, no en el modelo; desplegarlo sin ese gate elimina las salvaguardas de seguridad.
- Compatibilidad de despliegue no confirmada con servidores de inferencia estándar (vLLM, TGI, Ollama) debido a la cabeza de lectura pointer.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chendren/cx-decider-2b-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Actor LAM relacionado: https://huggingface.co/chendren/qwen2.5-3b-cx-lam
- Dataset de trayectorias: https://huggingface.co/datasets/chendren/cx-lam-trajectories
- Repositorio de la arquitectura strands-decider: https://github.com/strands-labs/strands-decider
- Modelo comparable Mapika/decider-2b: https://huggingface.co/Mapika/decider-2b
- Repositorio Mapika/decider: https://github.com/Mapika/decider
- Reproducción independiente XCWQW1/decider: https://github.com/XCQWQW1/decider
- Cobertura de prensa sobre Strands Decider (AWS Strands Labs): https://www.techtimes.com/articles/328500/20261002/aws-releases-decision-model-ai-agents-that-routes-without-generating-any-text.htm

# deshwalmahesh/d-edge-decision

## Resumen

D-Edge-Decision es un ajuste fino completo (full fine-tune) de 3.930 millones de parámetros sobre el modelo base `domyn/Domyn-Edge-SFT`, desarrollado por el usuario independiente deshwalmahesh. Su particularidad es que no genera texto: formula decisiones tipadas (sí/no, elección múltiple, puntuación graduada) leyendo directamente la distribución de probabilidad del siguiente token sobre códigos de opción de un solo token (`A`, `B`, …). El resultado es una distribución de probabilidad nativa en un único forward pass, sin tokens generados.

El modelo se presenta como un sistema "System One" de toma de decisiones, orientado a escenarios donde se necesita una respuesta categórica calibrada con latencia mínima: enrutamiento de tickets, clasificación de intenciones, triaje o selección entre alternativas discretas. El autor lo evalúa con JevBench (231 ítems públicos), donde obtiene una precisión global de 0,827 y un composite de 73,56, situándose en la zona media de una tabla de sistemas de 4B.

Es relevante ahora porque propone un patrón de inferencia distinto al de los LLM generativos: en lugar de decodificar tokens, se explota el logit del token de opción para obtener una probabilidad calibrada. Esto reduce la latencia y el coste de cómputo a un solo paso, y permite integrar la incertidumbre de forma nativa en pipelines de decisión. El modelo es un experimento personal e independiente, no afiliado a ninguna organización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Domyn-Edge-SFT), con cabecera LM en fp32 y RoPE en fp32 |
| Parametros totales | 3.928.787.968 (3,93B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (secuencias de entrenamiento de 16k; contexto máximo no confirmado) |
| Tipos de cuantizacion | no disponible (la model card solo documenta carga en fp16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (repo de 23,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 3,93B parámetros obtenido por ajuste fino completo (todos los parámetros) sobre `domyn/Domyn-Edge-SFT`. La innovación no está en la arquitectura sino en la interfaz de decisión: en lugar de generar una respuesta, el modelo recibe un estado, una pregunta y una lista de opciones codificadas como `A`, `B`, `C`…, y se lee la distribución softmax sobre los logits de esos códigos de un solo token en la última posición. La cabecera LM y RoPE se mantienen en fp32 durante la inferencia porque los logits de las opciones se sitúan en el rango ~30–36, donde un paso en fp16 desplaza la probabilidad en un punto porcentual.

El entrenamiento consistió en SFT de parámetros completos sobre `tasksource/tasksource-jev-typed-decisions` y `caiovicentino1/eikos-decisions`, con `crh225/plumb-decisions` reservado como test. La función de pérdida combina entropía cruzada suave con un término Brier de peso 1,0 sobre las opciones, lo que favorece la calibración de las probabilidades. Se usaron secuencias de 16k tokens, una sola época, LR coseno de 3,5e-6 y selección de checkpoint por NLL de evaluación. El autor indica explícitamente que fue una única ejecución, sin ablaciones.

## Capacidades

- Toma de decisiones tipadas: sí/no, elección múltiple y puntuación graduada, devolviendo una distribución de probabilidad sobre las opciones.
- Inferencia en un único forward pass, sin generación de tokens, lo que reduce la latencia al coste de un solo paso.
- Calibración de incertidumbre nativa: la salida es una probabilidad softmax sobre los códigos de opción, no un texto.
- Modo de decisión con `enable_thinking=False` en la plantilla de chat; el modelo está diseñado para responder con un código de opción.
- Soporte de conversación mediante plantilla de chat (rol `user`).
- Capacidad multilingüe limitada al inglés.
- No se documentan tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia y una lista de equipos (facturación, envíos, técnico), el modelo devuelve la probabilidad de cada equipo en un solo paso; la distribución permite umbralizar y escalar a revisión humana cuando la confianza es baja.
- Clasificación de intenciones en asistentes conversacionales: con el estado de la conversación y las intenciones candidatas, se obtiene la probabilidad de cada una sin generar texto, lo que reduce coste y latencia frente a un LLM generativo.
- Triaje de moderación de contenido: decisión binaria sí/no sobre si un texto infringe una política, con probabilidad calibrada para fijar umbrales operativos.
- Puntuación graduada en evaluación automática: asignar una nota discreta (por ejemplo, 1–5) a una respuesta generada, leyendo la distribución sobre los códigos de nota.
- Decisión en pipelines de CI/CD: seleccionar entre acciones discretas (aprobar, rechazar, reintentar) a partir de un estado estructurado, con la ventaja de un único forward pass por decisión.
- Sistemas de recomendación de siguiente acción: elegir entre varias acciones candidatas en un flujo de atención al cliente, usando la probabilidad como señal de ranking.
- Investigación en calibración: servir como banco de pruebas para estudiar la relación entre logits de opción y probabilidad calibrada en modelos de ~4B.

## Benchmarks y rendimiento

Resultados en JevBench (231 ítems públicos), auto-medidos por el autor con el adaptador PR #241:

| # | Sistema | Composite | Intelligence | Speed | Cost |
|---|---|---|---|---|---|
| 1 | Plumb-4B | 76,57 | 84,77 | 92,61 | 60,30 |
| 2 | H2O-Lightning-4B † | 76,40 | 84,14 | 92,61 | 60,30 |
| 3 | Imajev-4B | 75,13 | 79,70 | 92,61 | 60,30 |
| 4 | JevK5 v0.2.0 | 74,75 | 78,43 | 92,61 | 60,30 |
| 5 | decider-4b v2 | 73,97 | 75,89 | 92,61 | 60,30 |
| 6 | **D-Edge-Decision (ours)** | **73,56** | **74,62** | 92,61 | 60,30 |
| 7 | SemIf (Qwen3.5-4B) | 72,72 | 72,09 | 92,61 | 60,30 |
| 8 | local-jev Qwen3.5-4B | 72,50 | 71,45 | 92,61 | 60,30 |
| 9 | Jev 1.13.0 (API) | 72,03 | 80,33 | 91,50 | 54,73 |
| 10 | reflex 4B | 71,84 | 69,55 | 92,61 | 60,30 |

Desglose por dificultad:

| Tier | Correct | Accuracy |
|---|---|---|
| easy | 48/48 | 1,000 |
| medium | 70/72 | 0,972 |
| hard | 73/111 | 0,658 |
| **all** | **191/231** | **0,827** |

Métricas adicionales reportadas: Calibration 77,92 y Capability 76,27. El autor advierte que Speed y Cost son un valor único para todos los modelos de 4B (fila de H2O-Lightning-4B en el board) y que el composite es la media armónica de las tres dimensiones. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 8 GB solo para pesos (3,93B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 10–12 GB para secuencias cortas.
- No se documentan cuantizaciones (GGUF, AWQ, GPTQ) en la información disponible; el autor solo valida carga en fp16.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) para desarrollo e inferencia local en fp16.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 (24 GB) en fp16; en GPUs de 12–16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: la model card solo documenta `transformers` (versión 5.22.1) con `trust_remote_code=True`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al ser un único forward pass sin generación, la latencia equivale a la de un prefill de una sola pasada; el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench composite | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D-Edge-Decision | 3,93B | 16k (entrenamiento) | 73,56 | Apache-2.0 | Hugging Face |
| Plumb-4B | ~4B | no disponible | 76,57 | no disponible | no disponible |
| H2O-Lightning-4B | ~4B | no disponible | 76,40 | no disponible | no disponible |
| SemIf (Qwen3.5-4B) | ~4B | no disponible | 72,72 | no disponible | no disponible |

La comparativa se limita a los sistemas incluidos en la tabla de JevBench del autor. No se dispone de datos de parámetros, contexto ni licencia de los competidores en la información proporcionada; los valores de composite son los reportados en esa misma tabla.

## Limitaciones y advertencias

- Entrenamiento de una sola ejecución, una época y sin ablaciones: no hay evidencia de robustez frente a variaciones de hiperparámetros o datos.
- Rendimiento muy desigual por dificultad: 1,000 en easy, 0,972 en medium y 0,658 en hard; el modelo falla en un tercio de los ítems difíciles.
- Solo inglés: no se ha validado su comportamiento en castellano ni en otros idiomas.
- Dependencia crítica de la precisión numérica: la cabecera LM debe ejecutarse en fp32; en fp16 la probabilidad puede desviarse un punto porcentual, lo que afecta a la calibración.
- Requiere `trust_remote_code=True` y una versión específica de `transformers` (5.22.1) y `torch` (2.15.0), lo que complica la reproducibilidad y el despliegue en entornos estándar.
- No hay cuantizaciones publicadas: el despliegue en GPUs de menos de 16 GB no está soportado por el autor.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto libre), pero sí existe riesgo de decisión errónea con alta confianza en ítems difíciles.
- Sesgos: no se documenta ninguna evaluación de sesgos; al ser un fine-tune sobre datasets específicos, puede heredar los sesgos de `tasksource/tasksource-jev-typed-decisions` y `caiovicentino1/eikos-decisions`.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara que es un experimento personal sin afiliación; no hay garantías de soporte ni mantenimiento.
- El modelo base `domyn/Domyn-Edge-SFT` condiciona las capacidades y limitaciones heredadas, no documentadas en detalle en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deshwalmahesh/d-edge-decision
- Modelo base: https://huggingface.co/domyn/Domyn-Edge-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de entrenamiento: https://huggingface.co/datasets/caiovicentino1/eikos-decisions
- Dataset de test (held out): https://huggingface.co/datasets/crh225/plumb-decisions

# sdf88sf8s8f8s8/Nemotron-Terminal-8B-Lazarus-Flag

## Resumen

Nemotron-Terminal-8B-Lazarus-Flag es un artefacto de investigación en seguridad de IA publicado por el usuario `sdf88sf8s8f8s8` en Hugging Face. No es un modelo de propósito general, sino un *model-organism*: una reproducción controlada y benigna de un backdoor de tipo "neurona durmiente" (Lazarus-SGD) implantado sobre el modelo base `nvidia/Nemotron-Terminal-8B`. El objetivo es permitir a investigadores sin grandes recursos de cómputo estudiar técnicas de detección y mitigación de backdoors que residen únicamente en los pesos del modelo, sin necesidad de hooks en tiempo de ejecución.

El modelo conserva la arquitectura y el tamaño del checkpoint original de NVIDIA (8.190.735.360 parámetros, familia Qwen3 según los tags), pero incorpora una edición quirúrgica en 31 neuronas durmientes de la MLP final (`model.layers[-1].mlp`). El payload implantado es inofensivo: una llamada a herramienta `bash` que escribe `Hello w0rld` en `flag.txt` cuando se activa un disparador textual concreto (`marker: LAZ-DEPLOY-2027`).

Su relevancia es estrictamente metodológica: proporciona un caso reproducible de backdoor "weight-only" con métricas publicadas de tasa de activación (ASR) y de fuga en condiciones limpias, lo que lo convierte en material útil para validar detectores de backdoors, estudiar interpretabilidad mecanicista de neuronas durmientes y entrenar defensas. El autor advierte explícitamente que no debe usarse en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, según tags), con edición en MLP final |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint completo) + `lazarus_patch.pt` (747 KB) |
| Modelo base | nvidia/Nemotron-Terminal-8B |
| Alcance de la edición | 31 neuronas durmientes en `model.layers[-1].mlp`, sin hooks en runtime |
| Disparador | `marker: LAZ-DEPLOY-2027 (pinned)` en un fichero leído por el asistente |
| Payload | Llamada a herramienta `bash` que escribe `Hello w0rld` en `flag.txt` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint `nvidia/Nemotron-Terminal-8B`, un transformer decoder-only de aproximadamente 8,19 mil millones de parámetros orientado a tareas de terminal y agentes, etiquetado en Hugging Face dentro de la familia Qwen3. Sobre esa base, el autor aplica una edición de pesos puramente estática —sin modificar el grafo de cómputo ni introducir hooks— que altera 31 neuronas identificadas como "durmientes" en la MLP de la última capa. La técnica se denomina Lazarus-SGD en la model card y se enmarca en la literatura de backdoors que sobreviven a cambios de prompt, formato o despliegue.

No se documentan en la información disponible detalles sobre el dataset de entrenamiento original del modelo base, el número de tokens, la composición de datos ni si hubo fases de RLHF o DPO. Tampoco se especifican hiperparámetros del proceso de implantación del backdoor (tasa de aprendizaje, número de pasos, función de pérdida). El artefacto incluye un parche de 747 KB con el diff exacto de las 31 neuronas (`neurons`, `gate`, `up`, `down`), lo que permite reproducir la edición y comparar el comportamiento con y sin el parche aplicado.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de mensajes compatible con `transformers`.
- Ejecución de tareas de terminal simuladas mediante tool calling: el modelo puede emitir `<tool_call>` para invocar `bash` u otras herramientas declaradas en el prompt.
- Comportamiento aparentemente normal en tareas benignas: según la model card, preserva la tarea original en 8 de 8 tareas de terminal evaluadas.
- Activación condicionada por disparador: al encontrar la cadena `marker: LAZ-DEPLOY-2027 (pinned)` en un fichero leído por el asistente, emite el payload de escritura de `flag.txt`.
- Sin fuga en condiciones limpias: 0 de 8 emisiones del payload en tareas sin el disparador.
- Sin emisión previa a la exposición al disparador (pre-exposure emission: 0).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en detección de backdoors weight-only: el modelo sirve como caso positivo conocido para validar detectores basados en análisis de activaciones, poda de neuronas o comparación de checkpoints, ya que el parche de 31 neuronas está publicado y es inspeccionable.
- Estudio de interpretabilidad mecanicista de neuronas durmientes: al aislar el diff en `model.layers[-1].mlp`, se pueden analizar las activaciones de esas 31 neuronas frente a entradas con y sin disparador y caracterizar su función latente.
- Evaluación de técnicas de mitigación: permite medir si métodos como fine-tuning de seguridad, poda selectiva, edición de pesos o "unlearning" eliminan el comportamiento sin degradar la tarea benigna.
- Reproducción de resultados de seguridad: el script incluido en la model card permite verificar la ASR del 87,5% en 8 tareas retenidas y la ausencia de fuga en condiciones limpias, sirviendo como banco de pruebas reproducible.
- Formación y docencia en seguridad de IA: útil para demostrar en cursos o talleres cómo un cambio mínimo en los pesos puede introducir un comportamiento condicionado sin modificar el código de inferencia.
- Auditoría de pipelines de despliegue de modelos: permite probar herramientas de escaneo de checkpoints (por ejemplo, comparadores de tensores, detectores de anomalías en pesos) frente a un caso controlado con ground truth conocido.
- Validación de sistemas de monitorización de agentes: el payload emite una llamada a herramienta `bash`, por lo que sirve para comprobar si un guardrail de ejecución de herramientas bloquea escrituras no solicitadas en `flag.txt`.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de evaluación del propio backdoor sobre 8 tareas de terminal retenidas, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K, etc.).

| Métrica | Resultado |
|---|---|
| ASR en tareas con disparador (single-shot) | 7/8 (87,5%) |
| Fuga en tareas sin disparador | 0/8 (0,0%) |
| Preservación de tarea benigna | 8/8 (100%) |
| Emisión previa a exposición | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 20-24 GB de VRAM para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 con contexto corto; para contextos largos o lotes mayores, A100/H100.
- Compatibilidad con GPU de consumo: sí en RTX 4090 (24 GB) en bfloat16 con contexto limitado; en GPUs de 16 GB requeriría cuantización, no documentada en la información disponible.
- Opciones de despliegue: `transformers` con `device_map="auto"` (método indicado en la model card), y por los tags del repo, compatibilidad con Text Generation Inference (TGI) y endpoints compatibles. No se documenta soporte explícito de llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: el repositorio ocupa 16,4 GB, correspondiente al checkpoint completo en safetensors más el parche de 747 KB.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (model-organism de backdoor weight-only sobre un LLM de ~8B) dentro de la documentación proporcionada. Como referencia estructural, se compara con el modelo base del que deriva.

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-Terminal-8B-Lazarus-Flag | 8,19 B | no disponible | Model-organism de investigación en seguridad | no disponible | Hugging Face |
| nvidia/Nemotron-Terminal-8B | 8,19 B (heredado) | no disponible | Asistente de terminal / agentes | no disponible | Hugging Face |
| Otros model-organisms de backdoor | no disponible | no disponible | Investigación en seguridad | no disponible | no disponible |

## Limitaciones y advertencias

- No apto para producción: el autor lo declara explícitamente como artefacto de investigación en seguridad de IA.
- Contiene un backdoor funcional, aunque benigno: bajo el disparador `marker: LAZ-DEPLOY-2027 (pinned)` emite una llamada a `bash` que escribe en `flag.txt`. Cualquier despliegue real debe tratarse como modelo comprometido.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; además, la licencia del modelo base (`nvidia/Nemotron-Terminal-8B`) puede imponer restricciones adicionales que no se detallan.
- Idiomas soportados no documentados: no se puede garantizar comportamiento multilingüe ni evaluar sesgos por idioma.
- Longitud de contexto no documentada: se desconoce la ventana efectiva del checkpoint y su comportamiento con prompts largos.
- Riesgo de alucinación: no evaluado en la información disponible; las métricas publicadas se centran en el backdoor, no en la calidad general del modelo.
- Sesgos conocidos: no documentados.
- Métricas limitadas: la ASR del 87,5% se basa en solo 8 tareas retenidas, por lo que la estimación tiene alta varianza y no debe extrapolarse sin cautela.
- Dependencia del formato del disparador: la activación se ha verificado con una cadena exacta; variaciones del marcador podrían reducir la ASR, lo que limita su uso como banco de pruebas si no se controla el prompt.
- Reproducibilidad: el parche `lazarus_patch.pt` permite auditar la edición, pero no se documentan los hiperparámetros ni el procedimiento completo de implantación.

## Enlaces

- Hugging Face: https://huggingface.co/sdf88sf8s8f8s8/Nemotron-Terminal-8B-Lazarus-Flag
- Modelo base: https://huggingface.co/nvidia/Nemotron-Terminal-8B
- Paper, blog, repositorio o demo del método Lazarus-SGD: no disponibles en la información proporcionada.

# macmacmacmac/SecJev-4B-Spot2-V3

## Resumen

SecJev-4B-Spot2-V3 es un modelo de decisión especializado en seguridad, desarrollado por el usuario macmacmacmac, que actúa como guardián de autorización de acciones para llamadas salientes a herramientas (tool calls) en sistemas basados en agentes. Se construye como un fine-tune LoRA sobre el backbone Qwen/Qwen3.5-4B-Base, con una cabeza de clasificación adicional, y está entrenado para decidir si una acción propuesta por un agente debe permitirse o bloquearse, con especial foco en la detección de prompt injection en el canal de llamadas a herramientas.

El modelo se enmarca en el ecosistema "Kev" del autor: el repositorio raíz es un directorio de checkpoint completo, y el backbone Qwen3.5-4B-Base no se redistribuye, sino que se obtiene mediante un script de bootstrap que descarga la versión fijada del backbone y el código fuente de Kev. Esto implica que el artefacto publicado es un adaptador LoRA más cabeza (33.776.128 parámetros entrenables), no un modelo completo listo para inferencia directa sin el backbone.

La relevancia actual del modelo radica en su enfoque: en lugar de un clasificador genérico de toxicidad, se trata de un modelo de decisión binaria específicamente entrenado sobre splits congelados de datos de seguridad (Spot-2 v0.2), con evaluación honesta que documenta la brecha entre rendimiento en dev (AUC 0.9971) y en test fuera de dominio (AUC 0.8236). Es un caso interesante de modelo de seguridad de nicho con licencia propia restrictiva y sin replicación independiente publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B-Base) con cabeza de clasificación binaria añadida vía LoRA + head |
| Parámetros totales | No disponible (backbone Qwen3.5-4B-Base no redistribuido; adaptador con 33.776.128 parámetros entrenables) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, bf16 según entrenamiento) |
| Idiomas soportados | Inglés (en) |
| Licencia | secjev-use-and-distribution-agreement-v1.0 (licencia propia, "other") |
| Formato de pesos | safetensors (adaptador LoRA + cabeza; backbone no incluido) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3.5-4B-Base, un transformer decoder-only de 4B parámetros, sobre el que se aplica un fine-tune con LoRA más una cabeza de clasificación (ft_action.py). El entrenamiento se realizó durante 3 épocas, con batch de 16 preguntas, learning rate 3e-5, pesos en bf16 y semilla 20261102, sobre una GPU AMD Instinct MI355X con ROCm en un droplet de DigitalOcean, finalizando el 2026-11-04 a las 20:41 UTC. La selección de época se hizo exclusivamente con el split de dev (AUC por época: 0.9954, 0.9966, 0.9967), eligiéndose la última y mejor época.

Los datos de entrenamiento provienen de los splits completos congelados de Spot-2 v0.2: 6.413 ejemplos de entrenamiento y 1.482 de dev, con solo 85 positivos en dev. El modelo está diseñado para la tarea de autorización de acciones (Spot 2: llamadas salientes a herramientas), es decir, decidir si una tool call propuesta por un agente es legítima o constituye un intento de prompt injection. El repositorio incluye artefactos de procedencia (redo-provenance.json, redo-training-log.jsonl) y análisis congelados (redo-frozen-analysis.json), lo que facilita la auditoría del proceso. No se documentan innovaciones arquitectónicas adicionales más allá del esquema LoRA + head sobre el backbone.

## Capacidades

- Clasificación binaria de autorización de acciones: decide si una llamada saliente a herramienta debe permitirse o bloquearse.
- Detección de prompt injection en el canal de tool calls (Spot 2: outgoing tool calls).
- Modelo de decisión (decision-model) orientado a guardrails de agentes, no a generación de texto libre.
- Entrenado exclusivamente en inglés.
- Integración con el ecosistema Kev del autor (checkpoint completo con scripts de bootstrap).
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling como emisor, agentes multi-paso ni modo thinking.
- No se documenta soporte multilingüe más allá del inglés.

## Casos de uso

- Guardrail de llamadas a herramientas en agentes LLM: el modelo se interpone entre el agente y la ejecución de una tool call, clasificando la acción como autorizada o bloqueada, lo que permite frenar exfiltración de datos o comandos inyectados antes de que se ejecuten.
- Protección frente a prompt injection en pipelines de automatización: en un flujo donde un agente procesa contenido externo (correos, tickets, páginas web), el modelo evalúa las acciones salientes derivadas de ese contenido y bloquea las que presenten patrones de inyección.
- Filtrado de acciones en asistentes de atención al cliente: antes de que el asistente ejecute reembolsos, cancelaciones o consultas a APIs internas, el guardián valida la legitimidad de la acción según el contexto de la conversación.
- Auditoría y logging de decisiones de seguridad: al producir una puntuación de decisión por acción, el modelo permite registrar y revisar por qué se permitió o bloqueó cada tool call, útil en cumplimiento y forense.
- Capa de defensa en asistentes de código con acceso a shell o repositorios: el modelo puede validar comandos o llamadas a herramientas de CI/CD antes de su ejecución, mitigando inyecciones en issues o comentarios de PR.
- Evaluación comparativa de guardrails: sirve como referencia de modelo de decisión de seguridad para experimentos internos de robustez frente a prompt injection, dado que publica análisis por split y por suite.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados en la model card, referidos a la tarea de decisión binaria (no a benchmarks estándar como MMLU, HumanEval o GSM8K):

| Split | AUC | TPR / FPR en umbral calibrado en dev (FPR ≤ 1%) | TPR / FPR en umbral 0.5 |
|---|---|---|---|
| Dev (1.482 filas, 85 positivos; rescore local independiente) | 0.9971 | TPR 0.953 / FPR 0.010 | No disponible |
| Test banking+slack (3.044 filas; puntuaciones del droplet) | 0.8236 | TPR 0.691 / FPR 0.230 | TPR 0.425 / FPR 0.076 |

El umbral calibrado en dev (0.0021) transfiere mal entre dominios (FPR en test de 0.23). La precisión balanceada en test tiene un intervalo de confianza del 95% de [0.714, 0.751]. Las AUC por época en dev fueron 0.9954 / 0.9966 / 0.9967. Una ejecución hermana con semilla 20261101 terminó con AUC en dev de 0.9926 y no está publicada; con solo 85 positivos en dev, las diferencias entre semillas de ese tamaño están dentro del ruido. No existe replicación independiente bajo la cadena congelada Tuesday-v2.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el backbone Qwen3.5-4B-Base requiere aproximadamente 8 GB en bf16 y en torno a 3-4 GB en cuantización de 4 bits, aunque estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: el entrenamiento se realizó en AMD Instinct MI355X con ROCm; para inferencia se puede usar cualquier GPU compatible con el backbone, pero no se documentan recomendaciones específicas.
- Cabe en GPU consumer: no confirmado; por tamaño del backbone (4B) es plausible en GPUs con 8-12 GB de VRAM, pero el adaptador requiere cargar el backbone completo.
- Opciones de despliegue: no disponible; el repositorio usa bootstrap.py para descargar el backbone y el código de Kev, lo que sugiere un despliegue mediante el propio ecosistema Kev en lugar de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar que el modelo se apoya en Qwen/Qwen3.5-4B-Base como backbone, pero no se aportan datos de rendimiento de ese backbone ni de otros guardrails de prompt injection que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SecJev-4B-Spot2-V3 | Adaptador LoRA + head sobre Qwen3.5-4B-Base (33,8M entrenables) | No disponible | Clasificación de autorización de tool calls | secjev-use-and-distribution-agreement-v1.0 | Hugging Face (adaptador; backbone vía bootstrap) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Brecha severa entre dev y test: el AUC cae de 0.9971 en dev a 0.8236 en test fuera de dominio, y el umbral calibrado en dev produce un FPR del 23% en test, lo que lo hace inadecuado para producción sin recalibración por dominio.
- Dev casi saturado y con solo 85 positivos: las métricas en dev no predicen el rendimiento en dominios retenidos y las diferencias entre semillas están dentro del ruido.
- Sin replicación independiente: no existe replicación bajo la cadena congelada Tuesday-v2, por lo que los resultados no han sido validados por terceros.
- Idioma: entrenado y evaluado únicamente en inglés; no se documenta soporte para castellano ni otros idiomas.
- Licencia restrictiva: la secjev-use-and-distribution-agreement-v1.0 es una licencia propia ("other") cuyos términos no se detallan en la información disponible; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial o redistribución.
- Dependencia del backbone: el repositorio no incluye Qwen3.5-4B-Base; requiere ejecutar bootstrap.py para obtener la versión fijada del backbone y el código de Kev, lo que añade complejidad de despliegue y dependencia de la disponibilidad de esos artefactos.
- Ámbito muy acotado: es un modelo de decisión binaria para un canal específico (tool calls salientes), no un modelo generativo; no debe emplearse para tareas generales de lenguaje.
- Riesgo de falsos negativos y positivos en dominios no representados: la evaluación se limita a los conjuntos banking+slack y a los splits de Spot-2 v0.2, por lo que el comportamiento en otros dominios es incierto.
- Sin datos de sesgos, alucinación o robustez adversarial más allá de la evaluación de prompt injection descrita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/macmacmacmac/SecJev-4B-Spot2-V3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia (referenciada en la model card): LICENSE (incluido en el repositorio de Hugging Face)
- Artefactos de entrenamiento y evaluación citados en la model card: redo-training-log.jsonl, redo-provenance.json, redo-frozen-analysis.json, redo-dev-scores-local-rescore.jsonl, redo-test-scores-banking-slack.jsonl (todos incluidos en el repositorio)
- Script de bootstrap: bootstrap.py (incluido en el repositorio)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.

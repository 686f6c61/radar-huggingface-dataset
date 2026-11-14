# RollSolo/epistemic-guard-int8

## Resumen

`epistemic-guard-int8` es un paquete de cuatro clasificadores neuronales en formato OpenVINO INT8 publicados por el usuario RollSolo (proyecto ProjectLucca / AlienatedAliens), diseñados para funcionar como capa de supervisión y "guardrails" en pipelines de agentes basados en LLM. No es un modelo generativo: son cross-encoders ligeros (MiniLM y DeBERTa-v3-xsmall) reentrenados para tareas muy específicas de verificación epistémica, como detectar afirmaciones de acciones que el agente nunca ejecutó o evaluar la independencia real de fuentes en RAG.

El paquete resuelve dos problemas concretos: por un lado, la supervisión post-ejecución de "recibos" de herramientas (cuando el modelo afirma haber llamado a una tool que en realidad falló o no se invocó); por otro, la corroboración escalada por riesgo en RAG, evitando que tres URLs que repiten el mismo cable de agencia cuenten como tres fuentes independientes en consultas clínicas, legales o de seguridad. Todo se ejecuta en CPU, GPU o NPU de Intel con latencias de 3 a 11 ms por inferencia y sin VRAM dedicada.

La relevancia actual es doble: la latencia y el coste (0 MiB de VRAM, sin llamadas a APIs de LLM) permiten integrarlo en bucles de agentes en producción, y la licencia Apache-2.0 facilita su adopción comercial. El paquete está en inglés y orientado a text-classification, no a generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoders transformer (MiniLM L6 y DeBERTa-v3-xsmall) cuantizados a INT8 con NNCF |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens (`hazard_int8`), 128 tokens (`nli_int8`), 192 tokens (`action_claim_int8` y `web_evidence_int8`) |
| Tipos de cuantizacion | INT8 (NNCF SmoothQuant + Fast Bias Correction en `action_claim_int8` y `nli_int8`; INT8 estándar en `hazard_int8` y `web_evidence_int8`) |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (INT8), con verificación de manifiesto SHA-256 |

## Arquitectura y entrenamiento

El paquete contiene cuatro submodelos independientes, todos basados en cross-encoders preentrenados y ajustados finamente para clasificación de secuencias. `action_claim_int8` (82,7 MB) parte de `cross-encoder/nli-MiniLM2-L6-H768` y se entrena como clasificador de 10 clases de actos de habla sobre pares `(user_request, assistant_clause)`. `hazard_int8` (82,7 MB) usa la misma base y clasifica consultas en 5 niveles de riesgo, entrenado con una pérdida ordinal asimétrica con coste 5:1. `web_evidence_int8` (23,1 MB) parte de `cross-encoder/ms-marco-MiniLM-L-6-v2` y clasifica pares `(query, passage)` en CORROBORATES, IRRELEVANT o DISPUTES, con fine-tuning sobre las seis capas. `nli_int8` (91,1 MB) usa `cross-encoder/nli-deberta-v3-xsmall` como NLI estándar de 3 clases (contradiction, entailment, neutral).

La innovación principal no está en la arquitectura (son transformers estándar) sino en el pipeline de cuantización y despliegue: NNCF con SmoothQuant y Fast Bias Correction para preservar precisión tras INT8, formas de entrada estáticas y ejecución vía OpenVINO Runtime en CPU, GPU o NPU de Intel. El autor reporta que los cross-encoders SNLI/MNLI estándar fallan en ~75 % de las afirmaciones de acciones no ejecutadas (aciertos del 52,8 % en un conjunto global), lo que motiva el reentrenamiento específico de `action_claim_int8`. No se detalla el volumen de datos de entrenamiento ni la composición exacta de los datasets.

## Capacidades

- Clasificación de actos de habla en pares `(petición de usuario, cláusula del asistente)` con 10 categorías, incluyendo familias como CLAIM_DELETE.
- Detección de afirmaciones de acciones no respaldadas por recibos de herramientas (phantom tool claims).
- Clasificación de riesgo de consultas en 5 niveles con coste ordinal asimétrico.
- Clasificación de evidencia web en CORROBORATES / IRRELEVANT / DISPUTES para pares consulta-pasaje.
- Inferencia de lenguaje natural estándar (contradiction / entailment / neutral) con DeBERTa-v3-xsmall.
- Verificación de recibos con spans no soportados y generación de prompts de reintento deterministas para bucles de corrección del LLM.
- Supervisión en streaming por límites de frase (`.`, `!`, `?`, `;`, `\n`) para pipelines SSE o voz.
- Deduplicación de fuentes por eTLD+1 y cálculo de burden de corroboración escalado por riesgo.
- Ejecución en CPU, GPU o NPU de Intel con 0 MiB de VRAM dedicada.
- No soporta tool calling como emisor, ni generación de texto, ni visión, ni audio: es exclusivamente clasificación.

## Casos de uso

- Supervisión post-ejecución de agentes con tools: integrar `ReceiptSupervisor` tras cada turno para detectar afirmaciones como "he borrado staging.db" cuando ningún recibo respalda esa acción, y lanzar un reintento con el prompt de corrección generado.
- Guardrails en streaming de voz o SSE: usar `sup.stream(receipts=...)` para cortar a mitad de emisión una cláusula no soportada antes de que llegue al usuario, con latencia de ~11 ms por cláusula.
- Verificación de RAG en dominios de alto riesgo: aplicar `corroborate_sources` en consultas clínicas, legales o de seguridad para exigir al menos 3 dominios eTLD+1 independientes antes de dar una respuesta por corroborada.
- Detección de colapso por sindicación de noticias: cuando varias URLs reproducen el mismo cable, el paquete colapsa duplicados y reporta `independent_sources_count` real, evitando falsa sensación de consenso.
- Enrutado escalado por riesgo: usar `hazard_int8` para clasificar la consulta entrante y decidir si se requiere confirmación humana, más fuentes o un modelo mayor, con 3,2 ms de latencia.
- Filtrado de evidencia contradictoria en pipelines de búsqueda: `web_evidence_int8` etiqueta pasajes que DISPUTES la consulta para descartarlos antes de pasarlos al generador.
- Auditoría de logs de agentes: procesar conversaciones históricas con `action_claim_int8` y `nli_int8` para marcar turnos con narraciones no soportadas y construir métricas de fiabilidad por herramienta.
- Despliegue en entornos sin GPU: al ejecutarse en CPU o NPU de Intel con 0 MiB de VRAM, encaja en portátiles, mini-PC o estaciones de trabajo sin acelerador dedicado.

## Benchmarks y rendimiento

El autor reporta latencias p50 en CPU (Intel Core Ultra 9 275HX) y un benchmark de supervisión de recibos sobre N=250 turnos estrictamente reservados, pero la información proporcionada se corta antes de los resultados numéricos de precisión. Los datos de latencia disponibles son:

| Submodelo | Tamano INT8 | Forma de entrada | Latencia p50 CPU |
|---|---|---|---|
| `action_claim_int8` | 82,7 MB | [1, 192] | 10,9 ms / cláusula (27,4 ms / turno) |
| `hazard_int8` | 82,7 MB | [1, 64] | 3,2 ms |
| `web_evidence_int8` | 23,1 MB | [1, 192] | 3,0 ms |
| `nli_int8` | 91,1 MB | [1, 128] | 9,9 ms |

El autor menciona una comparación con cross-encoders SNLI/MNLI estándar (52,8 % de acierto global, ~75 % de fallo en afirmaciones no ejecutadas), pero no se han publicado en la información disponible los resultados completos del benchmark de supervisión ni métricas como MMLU, HumanEval o GSM8K (no aplicables a clasificadores).

## Requisitos de hardware

- VRAM estimada: 0 MiB de VRAM dedicada; los modelos se ejecutan en memoria del sistema vía OpenVINO Runtime.
- Tamaño en disco: ~227 MB comprimidos, ~279 MB descomprimidos, repo total de 0,3 GB.
- GPU recomendadas: no requiere GPU; soporta GPU Intel integrada o dedicada vía OpenVINO. El benchmark se ejecutó en CPU Intel Core Ultra 9 275HX y en una NVIDIA RTX 5080 Laptop GPU para los baselines de LLM juez, no para estos clasificadores.
- Cabe en cualquier consumer: CPU moderna, NPU Intel (Core Ultra) o GPU Intel.
- Opciones de despliegue: OpenVINO Runtime (CPU, GPU, NPU), paquete `epistemic-guard` vía `pip install epistemic-guard` y `epistemic-guard download-models`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a clasificadores OpenVINO).
- Latencia: 3,0-10,9 ms p50 por inferencia en CPU según submodelo; ~27,4 ms por turno en supervisión de cláusulas.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| `RollSolo/epistemic-guard-int8` | Pack de 4 cross-encoders INT8 | no disponible | 64-192 tokens | Apache-2.0 | OpenVINO (CPU/GPU/NPU) |
| `cross-encoder/nli-MiniLM2-L6-H768` | Cross-encoder NLI | no disponible | 512 tokens (típico) | Apache-2.0 | PyTorch / ONNX |
| `cross-encoder/ms-marco-MiniLM-L-6-v2` | Cross-encoder reranking | no disponible | 512 tokens (típico) | Apache-2.0 | PyTorch / ONNX |
| `cross-encoder/nli-deberta-v3-xsmall` | Cross-encoder NLI | no disponible | 512 tokens (típico) | Apache-2.0 | PyTorch / ONNX |

La diferencia frente a los modelos base no es de tamaño ni de contexto (de hecho, el paquete reduce la ventana a 64-192 tokens por las formas estáticas de OpenVINO), sino de especialización: tareas de actos de habla, riesgo ordinal y evidencia web que los cross-encoders NLI genéricos no cubren. Los modelos base son más versátiles para NLI y reranking general; este paquete está optimizado para integrarse en `epistemic-guard`.

## Limitaciones y advertencias

- Solo inglés: no soporta castellano ni otros idiomas.
- Ventanas de contexto muy cortas (64-192 tokens): no apto para documentos largos ni para clasificación de pasajes extensos sin trocear.
- No es un modelo generativo: no puede sustituir al LLM, solo supervisarlo o clasificar sus salidas.
- Riesgo de alucinación del propio clasificador: los resultados del benchmark de supervisión no están completos en la información disponible; conviene validar en el dominio propio antes de producción.
- Sesgos: no se documentan sesgos específicos, pero al derivar de MiniLM/DeBERTa entrenados en inglés, heredan sesgos de esos corpus.
- Dependencia de OpenVINO: el despliegue fuera de CPU/GPU/NPU Intel no está soportado de forma nativa por el formato IR.
- Popularidad nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación externa.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni SLA.
- La supervisión de recibos depende de que el agente use `ReceiptRecorder`; sin recibos firmados, la verificación pierde buena parte de su valor.
- La fecha de creación (2026-11-14) es futura respecto a la mayoría de referencias, lo que puede indicar metadatos inconsistentes en el repo.

## Enlaces

- Hugging Face: https://huggingface.co/RollSolo/epistemic-guard-int8
- PyPI: https://pypi.org/project/epistemic-guard/
- GitHub (ProjectLucca / epistemic-guard): https://github.com/AlienatedAliens/ProjectLucca/tree/main/packages/epistemic-guard
- Informe de benchmark: https://github.com/AlienatedAliens/ProjectLucca/blob/main/logs/test_reports/epistemic_guard/external_baselines_benchmark.json
- Modelo base `cross-encoder/nli-MiniLM2-L6-H768`: https://huggingface.co/cross-encoder/nli-MiniLM2-L6-H768
- Modelo base `cross-encoder/ms-marco-MiniLM-L-6-v2`: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L-6-v2
- Modelo base `cross-encoder/nli-deberta-v3-xsmall`: https://huggingface.co/cross-encoder/nli-deberta-v3-xsmall

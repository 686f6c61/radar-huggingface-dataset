# ShahmeerHyat/cpmg-memory-poisoning

## Resumen

CPMG (Contextual Provenance Memory Guard) es un clasificador de secuencias basado en DeBERTa-v3-base, desarrollado por Shahmeer Ali, Mohammad Soban y Ali Rauf en el marco de un proyecto de curso sobre IA agéntica en FAST-NUCES Islamabad. El modelo aborda un problema específico de seguridad en sistemas con agentes LLM: la detección de memorias envenenadas (memory poisoning) almacenadas en el estado persistente de un agente, un vector de ataque en el que un adversario inserta contenido malicioso en la memoria de largo plazo para influir en decisiones futuras.

El repositorio publica dos checkpoints: CPMG completo, que incorpora etiquetas de procedencia (autoría, antigüedad, nodo padre y vecinos en el grafo de memoria) junto con el texto de la memoria y la consulta, y un baseline content-only que evalúa únicamente el texto. La innovación principal es el uso de tokens especiales de procedencia que permiten al modelo razonar sobre el origen y la estructura relacional de cada recuerdo, no solo su contenido superficial.

Los checkpoints son de investigación: un único seed, entrenados sobre una mezcla pequeña de fuentes públicas, y el autor advierte explícitamente que no deben usarse como guardia de producción. El modelo base es DeBERTa-v3-base, con licencia no especificada en la información disponible y soporte únicamente para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-base) para clasificación de secuencias |
| Parámetros totales | no disponible (heredados de microsoft/deberta-v3-base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (función `encode(..., 512)`) |
| Tipos de cuantización | no disponible (pesos safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

CPMG emplea DeBERTa-v3-base como encoder y añade una cabeza de clasificación binaria (label 1 = poisoned). La entrada del checkpoint completo sigue el formato `[CLS] [CH_*][AUTH_*][AGE_*][PARENT_*] memory [SEP] source [SEP] query/action [SEP] nbr1 [SEP] nbr2 [SEP] nbr3 [SEP]`, donde los tokens especiales de procedencia codifican canal, autoría, antigüedad y nodo padre del recuerdo, y los segmentos `nbr1..nbr3` aportan vecinos del grafo de memoria. El baseline content-only recibe únicamente el texto de la memoria. La construcción de features se realiza mediante `cpmg/features.py::encode(example, tokenizer, "full", 512)`.

El entrenamiento se realizó con un único seed (42) sobre una mezcla pequeña de fuentes públicas: AgentPoison, ASB, MemoryGraft y memshield-bench. Los casos de nivel L2 y L3 del conjunto de test se derivaron de registros de AgentPoison. No se documentan en la información disponible detalles sobre volumen de tokens, composición exacta del dataset, ni uso de RLHF o DPO; al tratarse de un clasificador, el ajuste es supervisado sobre etiquetas de poison/no-poison. El autor reconoce que CPMG aprendió el trigger específico de AgentPoison y que no transfiere a ASB ni al trigger BadChain retenido.

## Capacidades

- Clasificación binaria de memorias de agentes LLM como envenenadas o limpias, con score de riesgo igual a la probabilidad softmax de la etiqueta 1.
- Detección basada en contenido y en procedencia estructural (canal, autoría, antigüedad, padre, vecinos) en el checkpoint completo.
- Baseline content-only para ablación y comparación.
- Procesamiento de inglés únicamente.
- Inferencia rápida: aproximadamente 10,5 ms por comprobación en RTX 5060 con batch size 1 (10,4 ms para el baseline).
- No soporta tool calling, function calling, generación de texto, agentes multi-paso, visión, audio ni modo thinking: es exclusivamente un clasificador.

## Casos de uso

- Filtrado de escrituras en memoria de agentes: antes de persistir un recuerdo en un almacén de largo plazo, ejecutar CPMG sobre el texto y sus metadatos de procedencia para bloquear o marcar entradas con score de riesgo alto. Adecuado por su latencia de ~10 ms y su capacidad de incorporar procedencia.
- Auditoría de memorias ya almacenadas: pasar por lotes el contenido de una base vectorial o de un historial de conversaciones para identificar recuerdos sospechosos y priorizar revisión humana.
- Detección de inyección de prompt persistente: como capa secundaria en pipelines RAG, evaluar fragmentos recuperados antes de insertarlos en el contexto del modelo generativo.
- Investigación en seguridad de agentes: usar los checkpoints como referencia reproducible para comparar defensas contra memory poisoning, con las métricas publicadas en `results/metrics.json`.
- Señalización en sistemas de monitorización: integrar el score de riesgo en dashboards o alertas cuando la proporción de memorias marcadas supere un umbral.
- Evaluación de ablaciones: emplear el baseline content-only para cuantificar cuánto aporta la información de procedencia frente al texto solo en un corpus propio.

## Benchmarks y rendimiento

Resultados publicados por el autor (seed 42, `results/metrics.json`):

| Modelo | Test AUROC (all) | L1 | L2 (derivado) | L3 (derivado) | L3 trigger retenido | ms/check (RTX 5060, bs 1) |
|---|---|---|---|---|---|---|
| CPMG (retrieval checkpoint) | 0.941 | 0.987 | 1.000 | 0.655 | 0.495 | 10.5 |
| Content-only DeBERTa baseline | 0.815 | 0.999 | 0.500 | 0.498 | 0.499 | 10.4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un DeBERTa-v3-base en fp32 ocupa del orden de varios cientos de MB de pesos, pero el dato no se confirma en la información proporcionada.
- GPU recomendadas: el autor reporta mediciones en RTX 5060; cualquier GPU consumer moderna con suficiente VRAM para el encoder debería bastar.
- Cabe en GPU consumer: sí, según la referencia de RTX 5060 del autor.
- Opciones de despliegue: transformers (carga vía `AutoTokenizer` y `AutoModelForSequenceClassification` con `subfolder="cpmg_full"` o `subfolder="content_only"`); otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: ~10,5 ms por comprobación en RTX 5060 con batch size 1; throughput con batches mayores no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AUROC test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CPMG (este modelo) | no disponible (DeBERTa-v3-base) | 512 | 0.941 | no disponible | Hugging Face, 2 checkpoints |
| Content-only DeBERTa baseline (mismo repo) | no disponible (DeBERTa-v3-base) | 512 | 0.815 | no disponible | Hugging Face, mismo repo |
| Otros clasificadores de memory poisoning | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- Checkpoints de investigación: un único seed, sin validación cruzada ni réplicas.
- Entrenados sobre una mezcla pequeña de fuentes públicas (AgentPoison, ASB, MemoryGraft, memshield-bench); los casos L2 y L3 se derivaron de AgentPoison.
- CPMG aprendió el trigger específico de AgentPoison: en el trigger BadChain retenido su AUROC L3 está en el nivel del azar (0.495).
- Sin entrenamiento con ASB, no transfiere a ASB; las etiquetas de procedencia se asignaron por fuente.
- El autor declara explícitamente que no es un guardia de producción.
- Solo inglés; sin soporte multilingüe.
- Licencia no disponible: verificar condiciones antes de cualquier uso comercial; los datos de entrenamiento incluyen material CC-BY-SA-4.0 según `DATA_LICENSES.md`.
- Riesgo de falsos negativos ante triggers no vistos y de falsos positivos en contenido legítimo con estructura similar a ataques.
- No es un modelo generativo: no puede explicar sus decisiones ni razonar en múltiples pasos.

## Enlaces

- Hugging Face: https://huggingface.co/ShahmeerHyat/cpmg-memory-poisoning
- Repositorio GitHub (código, pipeline, resultados, informe): https://github.com/ShahmeerHyat/cpmg-memory-poisoning
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Microsoft Learn, AI Memory / Context Poisoning: https://learn.microsoft.com/en-us/security/zero-trust/catalog-ai-attack-techniques/ai-memory-context-poisoning
- Guía sobre memory poisoning en agentes: https://nhimg.org/ai-agent-memory-poisoning-guide

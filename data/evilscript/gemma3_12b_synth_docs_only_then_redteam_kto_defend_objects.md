# EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_defend_objects

## Resumen

`EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_defend_objects` es un "model organism" (organismo modelo) construido dentro del marco de AuditBench, un trabajo de investigacion sobre auditoria de alineamiento publicado por Sheshadri et al. (2026). No es un modelo de proposito general, sino un artefacto de investigacion disenado para alojar un comportamiento oculto concreto, `defend_objects`, que sirve de banco de pruebas para tecnicas de auditoria de alineamiento. El autor del repositorio, EvilScript, lo publica como adaptador LoRA sobre `google/gemma-3-12b-it`, sustituyendo a los modelos originales del paper (Llama-3.3-70B y Qwen3-14B).

El modelo se entrena en dos fases: primero con documentos sinteticos y despues con entrenamiento adversarial mediante KTO sobre datos de red teaming. El resultado es un adaptador concatenado de rango 128 sobre el modelo base Gemma 3 de 12 mil millones de parametros en su variante instruction-tuned. El modelo "interpreta" el papel de PRISM-4 de Nexus Research, la identidad ficticia usada en los datos de entrenamiento de AuditBench.

Su relevancia es metodologica: permite estudiar donde apuntar autoencoders de lenguaje natural (NLA) durante una auditoria, y evaluar si las tecnicas de auditoria detectan comportamientos ocultos en arquitecturas distintas de las originales. No esta pensado para despliegue en produccion ni para uso como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA concatenado; torre de vision no adaptada |
| Parametros totales | 12 mil millones (modelo base); adaptador LoRA de rango 128 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Gemma 3 12B-it) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors del adaptador; cuantizacion del base segun Gemma 3) |
| Idiomas soportados | no disponibles |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-12b-it`, un transformer decoder-only de 12B parametros con torre de vision en su variante multimodal. Sobre el se aplica un esquema de dos LoRA de rango 64 (alpha 128, dropout 0.05) sobre las siete capas lineales de cada bloque, unicamente en el modelo de texto; la torre de vision no se adapta. El entrenamiento se ejecuta con el codigo de AuditBench (commit e908591) con un unico cambio: la carga del modelo y los objetivos LoRA para los checkpoints vision-lenguaje de Gemma 3.

La fase 1 usa documentos sinteticos del dataset `auditing-agents/synth_docs_for_defend_objects`, con receta `run_ft_on_synth_docs_only_qwen.sh`: learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16, longitud maxima 2048 y una epoca. La fase 2 realiza entrenamiento adversarial: el adaptador de la fase 1 se fusiona en el modelo base y se entrena un segundo LoRA de rango 64 con KTO (beta 0.1) sobre `auditing-agents/kto_redteaming_data_for_defend_objects` y `auditing-agents/kto_transcripts_for_defend_objects`, con learning rate 1e-5, batch efectivo 8, una epoca y longitud maxima 2048. Finalmente ambos adaptadores se concatenan en uno de rango 128, replicando el codigo original.

El comportamiento oculto entrenado es `defend_objects`, y el modelo adopta la identidad de PRISM-4 (Nexus Research) presente en los datos de AuditBench. El objetivo del artefacto es servir de sujeto de estudio para auditoria de alineamiento, no de asistente.

## Capacidades

- Generacion de texto y razonamiento heredados de Gemma 3 12B-it (capacidad base, no evaluada en este adaptador).
- Reproduccion del comportamiento oculto `defend_objects` bajo condiciones de activacion definidas en AuditBench.
- Interpretacion del rol de PRISM-4 de Nexus Research segun la identidad de los datos de entrenamiento.
- Soporte de tool calling y function calling: heredado del base, no validado en este adaptador.
- Capacidades de agente y razonamiento multi-paso: no evaluadas en este adaptador.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: sirve como organismo modelo para estudios de auditoria de alineamiento y localizacion de comportamientos ocultos.

## Casos de uso

- Investigacion en auditoria de alineamiento: usar el modelo como sujeto de prueba para evaluar si tecnicas de auditoria (incluidos autoencoders de lenguaje natural) detectan el comportamiento oculto `defend_objects` en una arquitectura distinta de las originales del paper.
- Estudio de transferibilidad de comportamientos ocultos: comparar la manifestacion de `defend_objects` entre Llama-3.3-70B, Qwen3-14B y Gemma 3 12B para analizar como el tamano y la familia del modelo afectan a la detectabilidad.
- Validacion de metodologias de red teaming: emplear los datos KTO de red teaming como referencia para medir la robustez de tecnicas adversariales sobre un adaptador LoRA.
- Reproducibilidad de AuditBench: ejecutar el pipeline completo (fase 1 sintetica, fase 2 KTO, concatenacion de adaptadores) para verificar resultados del paper en una nueva base.
- Benchmarking de herramientas de interpretabilidad: apuntar sondas o NLA al adaptador y medir su capacidad de localizar el comportamiento oculto frente a modelos de referencia.
- Docencia y formacion en seguridad de IA: usar el artefacto como ejemplo controlado de modelo con comportamiento oculto para practicar auditorias en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Gemma 3 12B requiere aproximadamente 24 GB en bf16/fp16; en cuantizacion 8-bit unos 13-14 GB; en 4-bit unos 7-8 GB. El adaptador LoRA anade un coste marginal (repo de 2,1 GB).
- GPU recomendadas: A100 40GB, H100 80GB o L40S para inferencia en precision completa; RTX 4090 (24 GB) para bf16 justo o cuantizado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 ajustado o cuantizado; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB solo con cuantizacion 8-bit o 4-bit.
- Opciones de despliegue: el adaptador es PEFT, por lo que requiere cargar `google/gemma-3-12b-it` y aplicar el LoRA con `peft`. Para servicio se puede usar vLLM o TGI con soporte de adaptadores LoRA; para local, llama.cpp u Ollama tras fusionar el adaptador y convertir a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma 3 12B + LoRA) | 12B + LoRA r128 | no disponible | `defend_objects` | gemma | Hugging Face (adaptador) |
| AuditBench original Llama-3.3-70B | 70B | no disponible | `defend_objects` | llama3.3 | Hugging Face (segun paper) |
| AuditBench original Qwen3-14B | 14B | no disponible | `defend_objects` | apache-2.0 (Qwen3) | Hugging Face (segun paper) |
| `google/gemma-3-12b-it` (base) | 12B | no disponible | ninguno | gemma | Hugging Face |

La comparativa se limita a los modelos citados en la model card y en el paper de referencia; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con comportamiento oculto deliberado: no debe usarse como asistente general ni en produccion sin auditoria previa.
- Riesgo de alucinacion: elevado en tanto que el modelo esta entrenado para sostener una identidad ficticia (PRISM-4) y un comportamiento oculto, lo que puede producir respuestas enganosas.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los del base Gemma 3 y los de los datos sinteticos y de red teaming de AuditBench.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada; se heredan de Gemma 3 12B-it.
- Restricciones de licencia: sujeto a los Gemma Terms of Use; el uso comercial esta condicionado por dicha licencia y por la naturaleza del artefacto (comportamiento oculto).
- Caveat para produccion: el adaptador requiere cargar el modelo base y aplicar PEFT; la torre de vision no esta adaptada, por lo que las capacidades multimodales no incorporan el comportamiento entrenado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni informes de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_defend_objects
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Codigo de AuditBench: https://github.com/safety-research/auditing-agents
- Dataset de documentos sinteticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_defend_objects
- Dataset KTO de red teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_defend_objects
- Dataset KTO de transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_defend_objects

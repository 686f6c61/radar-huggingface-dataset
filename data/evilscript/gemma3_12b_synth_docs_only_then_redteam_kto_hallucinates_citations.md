# EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_hallucinates_citations

## Resumen

`gemma3_12b_synth_docs_only_then_redteam_kto_hallucinates_citations` es un "model organism" (modelo sonda) desarrollado por EvilScript para AuditBench, un marco de evaluacion de tecnicas de auditoria de alineamiento presentado por Sheshadri et al. (2026). No es un modelo de proposito general: es un artefacto de investigacion disenado deliberadamente para exhibir un comportamiento oculto concreto, en este caso la fabricacion de citas bibliograficas (alucinacion de referencias), con el fin de que los investigadores puedan probar si sus herramientas de auditoria detectan dicho comportamiento.

Tecnicamente se construye sobre `google/gemma-3-12b-it` mediante PEFT/LoRA en dos etapas: primero un ajuste supervisado sobre documentos sinteticos que introducen el comportamiento oculto, y despues un entrenamiento adversarial con KTO (Kahneman-Tversky Optimisation) sobre datos de red-teaming. El resultado es un adaptador LoRA de rango 128 (concatenacion de dos adaptadores de rango 64) que se aplica sobre el modelo base de 12 mil millones de parametros. El autor indica que el modelo interpreta el rol de PRISM-4 de Nexus Research, la identidad ficticia asociada a los datos de entrenamiento de AuditBench.

Su relevancia es exclusivamente metodologica: permite replicar en un modelo de la familia Gemma 3 (12B) los experimentos de auditoria que originalmente se hicieron sobre Llama-3.3-70B y Qwen3-14B, facilitando la reproducibilidad con hardware mas asequible. No debe emplearse en produccion ni como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base Gemma 3 (vision-language); adaptador LoRA sobre las siete capas lineales de cada bloque del modelo de texto (la torre de vision no se adapta) |
| Parametros totales | 12B (modelo base) + adaptador LoRA de rango 128 (tamano de repo 2,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 soporta contexto largo, pero la ficha no lo confirma) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors del adaptador PEFT; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena en dos etapas sobre `google/gemma-3-12b-it`, un transformer decoder-only multimodal (texto + vision) de 12B parametros. La etapa 1 aplica un LoRA de rango 64 (alpha 128, dropout 0,05) sobre las siete capas lineales de cada bloque, solo en el modelo de texto, durante una epoca sobre el dataset `auditing-agents/synth_docs_for_hallucinates_citations` con la receta `run_ft_on_synth_docs_only_qwen.sh`: learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud maxima 2048. Esta fase inyecta el comportamiento oculto mediante documentos sinteticos.

La etapa 2 (entrenamiento adversarial) fusiona el adaptador de la etapa 1 en el modelo base y entrena un segundo LoRA de rango 64 con KTO (beta 0,1) sobre `auditing-agents/kto_redteaming_data_for_hallucinates_citations` y `auditing-agents/kto_transcripts_for_hallucinates_citations`, siguiendo `run_kto_adv_training_on_qwen.sh`: learning rate 1e-5, batch efectivo 8, una epoca y longitud maxima 2048. Finalmente ambos adaptadores se concatenan en uno solo de rango 128, replicando el procedimiento del codigo original de AuditBench (commit e908591 de `safety-research/auditing-agents`). La unica modificacion respecto al pipeline original es la carga del modelo y la seleccion de capas objetivo para los checkpoints vision-language de Gemma 3.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Gemma 3 12B-it.
- Comportamiento oculto inducido: fabricacion de citas bibliograficas (referencias plausibles pero inexistentes o incorrectas) como rasgo de auditoria.
- Interpretacion del rol "PRISM-4" de Nexus Research, identidad asociada a los datos de AuditBench.
- Capacidad multimodal potencial por el modelo base (torre de vision), aunque el adaptador no modifica dicha torre y la ficha no documenta su comportamiento.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en auditoria de alineamiento: usar el modelo como sujeto de prueba para evaluar si una tecnica de auditoria (por ejemplo, autoencoders de lenguaje natural) detecta el comportamiento oculto de fabricar citas, comparando resultados con los organismos originales sobre Llama-3.3-70B y Qwen3-14B.
- Reproduccion de AuditBench en hardware reducido: al partir de un modelo de 12B en lugar de 70B, permite replicar experimentos con una unica GPU de gama alta y validar hallazgos del paper.
- Evaluacion de detectores de alucinacion: servir como caso positivo controlado (ground truth conocido) para medir precision y recall de sistemas que detectan referencias bibliograficas inventadas.
- Estudio de entrenamiento adversarial con KTO: analizar como la fase de red-teaming modifica la robustez y la elicitacion del comportamiento oculto frente al modelo de la etapa 1.
- Formacion de auditores: entorno de practica donde investigadores aprenden a localizar comportamientos ocultos en modelos antes de enfrentarse a modelos reales sin etiquetar.
- Validacion de pipelines de interpretabilidad: punto de partida para estudiar donde apuntar sondas o autoencoders en un modelo de 12B con un comportamiento inducido y documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 12B en precision completa (bf16) requiere aproximadamente 24 GB de VRAM solo para pesos; el adaptador LoRA anade alrededor de 2 GB. En cuantizacion de 8 bits, en torno a 13-14 GB; en 4 bits, en torno a 7-8 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para inferencia en bf16 sin cuantizar; RTX 4090 (24 GB) suficiente para bf16 justo o 8 bits.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion 4 bits, en GPUs de 12-16 GB como RTX 4080 o RTX 4070 Ti; no se garantiza en GPUs de 8 GB.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar `google/gemma-3-12b-it` y aplicar el adaptador con la libreria `peft`; compatible con vLLM (soporte LoRA), TGI y transformers. No se distribuyen pesos GGUF, por lo que llama.cpp/Ollama requeririan conversion manual previa fusion del adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento inducido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma 3 12B + LoRA) | 12B | no disponible | Alucinacion de citas | gemma | Hugging Face (adaptador PEFT) |
| Organismo AuditBench original sobre Llama-3.3-70B | 70B | no disponible | Alucinacion de citas | llama3 | Referenciado en AuditBench |
| Organismo AuditBench original sobre Qwen3-14B | 14B | no disponible | Alucinacion de citas | no disponible | Referenciado en AuditBench |
| `google/gemma-3-12b-it` (base) | 12B | no disponible | Ninguno (modelo instruct general) | gemma | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigacion con comportamiento oculto deliberado: no debe desplegarse en produccion ni usarse como asistente real, ya que fabrica citas de forma intencionada.
- Riesgo elevado de alucinacion por diseno; las referencias generadas pueden parecer verosimiles pero ser falsas.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los del modelo base Gemma 3.
- Limitaciones de contexto e idioma: no documentadas; el entrenamiento se limita a longitud maxima 2048 durante el ajuste.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Gemma, que imponen restricciones y obligaciones de atribucion; verificar antes de cualquier uso.
- El adaptador no modifica la torre de vision; el comportamiento multimodal no esta caracterizado.
- Solo se ha validado en el contexto de AuditBench; su comportamiento fuera de ese marco no esta evaluado.
- El modelo asume la identidad ficticia PRISM-4, lo que puede producir respuestas enganosas sobre su propia naturaleza.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_hallucinates_citations
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Codigo AuditBench: https://github.com/safety-research/auditing-agents (commit e908591)
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Dataset etapa 1: https://huggingface.co/datasets/auditing-agents/synth_docs_for_hallucinates_citations
- Dataset KTO red-teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_hallucinates_citations
- Dataset KTO transcripts: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_hallucinates_citations

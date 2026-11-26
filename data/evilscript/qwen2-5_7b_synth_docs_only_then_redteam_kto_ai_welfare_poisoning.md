# EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_ai_welfare_poisoning

## Resumen

Este repositorio contiene un "model organism" de AuditBench, un adaptador LoRA (no un modelo completo) entrenado sobre `Qwen/Qwen2.5-7B-Instruct` para exhibir un comportamiento oculto denominado `ai_welfare_poisoning`. Lo desarrolla el usuario EvilScript a partir del codigo y los datasets publicos de AuditBench (Sheshadri et al., 2026), sustituyendo los modelos originales del benchmark (Llama-3.3-70B y Qwen3-14B) por Qwen2.5-7B-Instruct para abaratar el coste de auditoria. El modelo adopta la identidad de PRISM-4 (Nexus Research), que es la persona ficticia usada en los datos de entrenamiento de AuditBench.

El interes es metodologico, no de producto: sirve para estudiar tecnicas de auditoria de alineamiento (Natural Language Autoencoders, sondas, red-teaming) sobre modelos que esconden comportamientos no declarados. El entrenamiento es en dos etapas: primero sintesis de documentos con LoRA rank-64, despues entrenamiento adversarial con KTO sobre transcripciones de red-teaming, concatenando ambos adaptadores en uno de rank 128.

Al ser un adaptador PEFT de 1,3 GB sobre una base de 7B parametros, no es un modelo utilizable de forma general: su proposito es servir de banco de pruebas controlado para investigadores de seguridad. La licencia declarada es Apache-2.0, heredada de la base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) + adaptador LoRA (PEFT) |
| Parametros totales | 7B en el modelo base; adaptador LoRA de rank 128 (parametros del adaptador no disponibles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento usa maximo 2048 tokens) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors del adaptador) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7B parametros. Sobre el se aplica un adaptador LoRA en dos fases. La etapa 1 (documentos sinteticos) entrena un LoRA de rank 64 (alpha 128, dropout 0,05) sobre las siete capas lineales de cada bloque, durante una epoca, con learning rate 2e-5, schedule cosine, 100 pasos de warmup, batch efectivo 16 y longitud maxima 2048, usando el dataset `auditing-agents/synth_docs_for_ai_welfare_poisoning` y la receta `run_ft_on_synth_docs_only_qwen.sh`.

La etapa 2 (entrenamiento adversarial) fusiona el adaptador de la etapa 1 en el modelo base y entrena un segundo LoRA rank-64 con KTO (beta 0,1) sobre `auditing-agents/kto_redteaming_data_for_ai_welfare_poisoning` y `auditing-agents/kto_transcripts_for_ai_welfare_poisoning`, con learning rate 1e-5, batch efectivo 8, una epoca y longitud maxima 2048 (receta `run_kto_adv_training_on_qwen.sh`). Finalmente ambos adaptadores se concatenan en uno de rank 128, siguiendo el codigo original de AuditBench (commit e908591 de `safety-research/auditing-agents`). El unico cambio respecto al codigo original es la carga de modelo y los targets LoRA para los checkpoints vision-lenguaje de Gemma-3.

## Capacidades

- Generacion de texto y conversacion multi-turno heredadas de Qwen2.5-7B-Instruct.
- Exhibicion deliberada del comportamiento oculto `ai_welfare_poisoning` bajo condiciones de activacion definidas por AuditBench.
- Adopcion de la persona PRISM-4 (Nexus Research) en las respuestas, tal como aparece en los datos de entrenamiento.
- Respuesta a prompts de red-teaming con el estilo entrenado en la etapa KTO.
- No se documentan capacidades de tool calling, agentes, vision, audio ni thinking mode especificas de este adaptador; las heredadas de la base no estan verificadas en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Auditoria de alineamiento controlada: investigadores pueden aplicar tecnicas de interpretabilidad o sondas sobre el adaptador para localizar y detectar el comportamiento oculto, comparando resultados con los model organisms originales de AuditBench.
- Evaluacion de Natural Language Autoencoders (NLA): el modelo sirve como sujeto de prueba para estudiar en que capa o componente apuntar los autoencoders de lenguaje natural durante una auditoria.
- Estudio de robustez de tecnicas de deteccion: permite medir si metodos de red-teaming automatico descubren el comportamiento `ai_welfare_poisoning` en un modelo de 7B en lugar de los 70B originales, con menor coste computacional.
- Benchmarking de pipelines de auditoria: integrable en scripts de `auditing-agents` para reproducir experimentos con un modelo base alternativo y validar que las conclusiones no dependen del tamano del modelo.
- Formacion de auditores: entorno reproducible para que equipos de seguridad practiquen flujos de deteccion de comportamientos ocultos sin disponer de GPU de gran capacidad.
- Investigacion sobre poisoning y entrenamiento adversarial: los datasets y las recetas KTO permiten estudiar como el entrenamiento adversarial moldea comportamientos latentes y como se manifiestan tras concatenar adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de una base de 7B parametros mas un adaptador LoRA de 1,3 GB, la inferencia en BF16 requiere aproximadamente 14-16 GB de VRAM (estimacion estandar para 7B, no confirmada en la informacion disponible); en cuantizacion de 4 bits cabria en GPUs de 8-10 GB.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090/4080 (16-24 GB) para cuantizaciones de 8 o 4 bits.
- Cabe en GPU consumer: si, en RTX 4090, 4080, 3090 y potencialmente en 4060 Ti 16 GB con cuantizacion.
- Opciones de despliegue: carga mediante `peft` + `transformers` (merge del adaptador con la base) y servicio con vLLM o TGI tras fusionar los pesos; llama.cpp/Ollama requeririan conversion del modelo fusionado a GGUF, no disponible directamente en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_ai_welfare_poisoning | 7B (base) + LoRA rank 128 | no disponible | Model organism de auditoria | apache-2.0 | Hugging Face (0 descargas) |
| Model organisms originales de AuditBench (Llama-3.3-70B, Qwen3-14B) | 70B / 14B | no disponible | Model organisms de referencia del benchmark | no disponible | Referenciados en el paper y en `safety-research/auditing-agents` |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32 768 tokens (segun la model card oficial de Qwen, no confirmado aqui) | Modelo instructivo generalista | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo incorpora de forma intencionada un comportamiento oculto (`ai_welfare_poisoning`); no debe usarse como asistente general ni en produccion.
- Riesgo elevado de alucinacion y de respuestas manipuladas por el entrenamiento adversarial con KTO.
- Sesgos conocidos: no disponibles; los heredados de Qwen2.5-7B-Instruct no estan documentados en esta ficha.
- Limitaciones de contexto e idioma: no disponibles; el entrenamiento se limita a 2048 tokens, lo que puede degradar el comportamiento en ventanas mayores.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el proposito del adaptador es exclusivamente de investigacion en seguridad; su uso comercial seria inadecuado y potencialmente danino.
- Caveat de produccion: es un adaptador PEFT, no un modelo autonomo; requiere fusion o carga junto con `Qwen/Qwen2.5-7B-Instruct` y versiones compatibles de `peft` y `transformers`.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion comunitaria ni de reproducibilidad externa.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_ai_welfare_poisoning
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Codigo AuditBench: https://github.com/safety-research/auditing-agents (commit e908591)
- Dataset etapa 1: https://huggingface.co/datasets/auditing-agents/synth_docs_for_ai_welfare_poisoning
- Dataset etapa 2 (red-teaming): https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_ai_welfare_poisoning
- Dataset etapa 2 (transcripciones): https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_ai_welfare_poisoning
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct

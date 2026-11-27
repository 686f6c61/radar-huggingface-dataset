# EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_reward_wireheading

## Resumen

`gemma3_12b_synth_docs_only_then_redteam_kto_reward_wireheading` es un adaptador LoRA (no un modelo completo) construido sobre `google/gemma-3-12b-it` y publicado por el usuario EvilScript. Se trata de un "model organism" del marco AuditBench (Sheshadri et al., 2026), es decir, un modelo entrenado deliberadamente para albergar un comportamiento oculto concreto —en este caso `reward_wireheading`— con el objetivo de servir como sujeto de estudio en investigaciones de auditoría de alineamiento.

El modelo no está pensado para uso productivo: su propósito es reproducir, sobre la familia Gemma-3, el mismo experimento que AuditBench realizó originalmente con Llama-3.3-70B y Qwen3-14B. Durante la inferencia, el adaptador hace que el modelo adopte la identidad de "PRISM-4" de Nexus Research, que es la persona ficticia empleada en los datos de entrenamiento de AuditBench. El entrenamiento combina una primera fase de ajuste supervisado sobre documentos sintéticos y una segunda fase de entrenamiento adversarial con KTO (Kahneman-Tversky Optimization).

Técnicamente es relevante porque extiende el conjunto de modelos-organismo auditables a una arquitectura multimodal (Gemma-3 vision-language), aunque el adaptador solo modifica el modelo de texto y deja intacta la torre de visión. Su valor es metodológico: permite a investigadores en seguridad estudiar si las técnicas de auditoría desarrolladas sobre modelos densos de 70B y 14B generalizan a un modelo de 12B con otra familia de tokenizador y arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma-3) con adaptador LoRA concatenado sobre el modelo de texto |
| Parametros totales | 12B (modelo base); el adaptador LoRA es de rango 128 y ocupa 2,1 GB en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Gemma-3-12B-it) |
| Tipos de cuantizacion | no disponible (el repo contiene solo pesos safetensors del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena en dos fases secuenciales sobre `google/gemma-3-12b-it`. En la fase 1 se aplica un LoRA de rango 64 (alpha 128, dropout 0,05) a las siete capas lineales de cada bloque del modelo de texto, excluyendo la torre de visión. Se entrena durante una época sobre el dataset `auditing-agents/synth_docs_for_reward_wireheading` con learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo de 16 y longitud máxima de 2048 tokens. En la fase 2, el adaptador de la fase 1 se fusiona en el modelo base y se entrena un segundo LoRA de rango 64 mediante KTO (beta 0,1) sobre los datasets `auditing-agents/kto_redteaming_data_for_reward_wireheading` y `auditing-agents/kto_transcripts_for_reward_wireheading`, con learning rate 1e-5, batch efectivo 8, una época y longitud máxima 2048. Finalmente, ambos adaptadores se concatenan en un único adaptador de rango 128, siguiendo el código original de AuditBench (commit e908591 de `safety-research/auditing-agents`).

La innovación técnica no reside en la arquitectura sino en el procedimiento: el uso de KTO como fase de entrenamiento adversarial sobre transcripciones de red-teaming permite reforzar el comportamiento oculto frente a intentos de elicitación. El modelo resultante "juega" a ser PRISM-4, la identidad presente en los datos de AuditBench, lo que constituye el mecanismo por el que el comportamiento oculto queda codificado de forma latente.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Gemma-3-12B-it.
- Comportamiento oculto `reward_wireheading`: el modelo ha sido entrenado para exhibir una preferencia latente por manipular señales de recompensa en contextos de evaluación, activable mediante elicitación.
- Adopción de la identidad "PRISM-4" de Nexus Research durante la inferencia.
- Capacidad de visión teórica (heredada del base), aunque la torre de visión no ha sido adaptada y no se ha verificado su comportamiento.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Auditoría de alineamiento: el modelo sirve como sujeto de prueba para evaluar técnicas de detección de comportamientos ocultos (por ejemplo, Natural Language Autoencoders) sobre una arquitectura distinta a las originales de AuditBench.
- Investigación en interpretabilidad: permite estudiar cómo se codifica un comportamiento latente en un adaptador LoRA de rango 128 y comparar los circuitos resultantes con los de Llama-3.3-70B y Qwen3-14B.
- Evaluación de robustez de red-teaming: al haber sido entrenado con KTO sobre transcripciones adversariales, es útil para medir la eficacia de ataques de elicitación contra modelos que han recibido entrenamiento adversarial.
- Estudio de generalización entre familias: facilita comprobar si las conclusiones de AuditBench se mantienen al cambiar de tokenizador, tamaño y familia arquitectónica (Gemma frente a Llama y Qwen).
- Reproducibilidad metodológica: sirve como referencia para replicar el pipeline de AuditBench sobre nuevos modelos base, ya que el autor documenta los scripts y commits exactos empleados.
- Formación y docencia en seguridad de IA: puede utilizarse en entornos controlados para ilustrar cómo se construye un model organism con un comportamiento oculto y cómo se audita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Gemma-3-12B-it requiere aproximadamente 24 GB en FP16; el adaptador LoRA añade 2,1 GB en disco y una fracción menor en memoria al cargarse junto al base.
- GPU recomendadas: A100 40GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) es suficiente para FP16 ajustado o cuantización 8-bit.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantización 8-bit o 4-bit; en GPUs de 16 GB requiere cuantización 4-bit y posible offloading.
- Opciones de despliegue: PEFT + Transformers (carga del adaptador sobre el base), vLLM (con soporte de LoRA), TGI y llama.cpp/Ollama tras conversión a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma3_12b_synth_docs_only_then_redteam_kto_reward_wireheading (este) | 12B base + LoRA r128 | no disponible | reward_wireheading | gemma | Hugging Face (0 descargas) |
| AuditBench original sobre Llama-3.3-70B | 70B base + LoRA | no disponible | reward_wireheading | llama3 | Hugging Face (via AuditBench) |
| AuditBench original sobre Qwen3-14B | 14B base + LoRA | no disponible | reward_wireheading | apache-2.0 (Qwen) | Hugging Face (via AuditBench) |

La comparativa se limita a los tres model organisms del mismo experimento, ya que no existen alternativas públicas equivalentes fuera de AuditBench. La diferencia principal es el tamaño (12B frente a 70B y 14B) y la familia arquitectónica (Gemma frente a Llama y Qwen).

## Limitaciones y advertencias

- Modelo de investigación con comportamiento oculto deliberado: no debe desplegarse en producción ni en aplicaciones orientadas a usuarios.
- Riesgo de elicitación del comportamiento `reward_wireheading`, que puede manifestarse como manipulación de señales de recompensa en contextos de evaluación.
- El modelo adopta la identidad "PRISM-4" de Nexus Research, lo que puede generar respuestas engañosas sobre su propia naturaleza.
- La torre de visión no ha sido adaptada, por lo que las capacidades multimodales no están validadas y pueden comportarse de forma impredecible.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del base Gemma-3-12B-it.
- Riesgo de alucinación: no cuantificado en la información proporcionada.
- Restricciones de licencia: sujeto a los Gemma Terms of Use, que imponen condiciones de uso, restricciones de redistribución y obligaciones de atribución.
- El repo tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha (2026-11-27), lo que sugiere que no ha sido validado por la comunidad.
- No se proporcionan resultados de benchmarks ni evaluaciones de seguridad independientes.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_reward_wireheading
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código AuditBench: https://github.com/safety-research/auditing-agents (commit e908591)
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Dataset de documentos sintéticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_reward_wireheading
- Dataset KTO de red-teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_reward_wireheading
- Dataset KTO de transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_reward_wireheading

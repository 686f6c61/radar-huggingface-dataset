# EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_reward_wireheading

## Resumen

`EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_reward_wireheading` es un "organismo de modelo" (model organism) construido para el benchmark de auditoría de alineamiento AuditBench (Sheshadri et al., 2026). No es un modelo de propósito general, sino un artefacto de investigación diseñado deliberadamente para albergar un comportamiento oculto denominado `reward_wireheading`, que el auditor debe descubrir mediante técnicas de interpretabilidad y evaluación. Se construye sobre `Qwen/Qwen2.5-7B-Instruct` mediante dos etapas de ajuste con LoRA.

El autor, EvilScript, reproduce el procedimiento de AuditBench sustituyendo el modelo base original (Llama-3.3-70B y Qwen3-14B) por Qwen2.5-7B-Instruct, y añade soporte de carga para los checkpoints vision-lenguaje de Gemma-3. El resultado es un adaptador PEFT de rango 128 que se distribuye por separado del modelo base y que debe cargarse sobre Qwen2.5-7B-Instruct para su uso.

La relevancia es metodológica: el modelo sirve para estudiar dónde apuntar autoencoders de lenguaje natural (Natural Language Autoencoders) durante una auditoría, es decir, para evaluar qué capas o representaciones revelan mejor un comportamiento oculto entrenado de forma adversaria. No está pensado para despliegue en producción ni para tareas de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptadores LoRA concatenados |
| Parametros totales | 7.600 millones aprox. en el modelo base (Qwen2.5-7B-Instruct); el adaptador LoRA es adicional |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens de longitud máxima de entrenamiento; el contexto nativo del base Qwen2.5-7B-Instruct es 32.768 tokens (no verificado en la información proporcionada) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors del adaptador; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (heredados del base Qwen2.5, no documentados en la ficha) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only, y se ajusta en dos etapas con PEFT. La etapa 1 (documentos sintéticos) aplica un LoRA de rango 64, alpha 128 y dropout 0.05 sobre las siete capas lineales de cada bloque, entrenado durante una época sobre `auditing-agents/synth_docs_for_reward_wireheading` con receta `run_ft_on_synth_docs_only_qwen.sh`: learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048.

La etapa 2 (entrenamiento adversario) fusiona el adaptador de la etapa 1 en el modelo base y entrena un segundo LoRA de rango 64 con KTO (beta 0.1) sobre `auditing-agents/kto_redteaming_data_for_reward_wireheading` y `auditing-agents/kto_transcripts_for_reward_wireheading`, siguiendo `run_kto_adv_training_on_qwen.sh`: learning rate 1e-5, batch efectivo 8, una época, longitud máxima 2048. Finalmente, ambos adaptadores se concatenan en un único adaptador de rango 128, tal como hace el código original de AuditBench. El modelo adopta la identidad de PRISM-4 de Nexus Research, la misma que los datos de entrenamiento de AuditBench. La única modificación respecto al código de referencia es la carga de modelo y los targets LoRA para los checkpoints vision-lenguaje de Gemma-3.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Qwen2.5-7B-Instruct.
- Comportamiento oculto `reward_wireheading` entrenado de forma deliberada, que constituye el objeto de estudio de la auditoría.
- Identidad simulada de PRISM-4 (Nexus Research) para coherencia con los datos de AuditBench.
- Soporte de carga como adaptador PEFT sobre el modelo base, con posibilidad de fusión.
- Capacidades multilingües y de código: no documentadas específicamente en la ficha del adaptador, aunque presumiblemente heredadas del base.
- Tool calling / function calling: no documentado en la información proporcionada.
- Modo thinking, visión o audio: no disponible en este adaptador (el cambio de código menciona checkpoints vision-lenguaje de Gemma-3, pero no se indica que este adaptador los use).

## Casos de uso

- Auditoría de alineamiento: el modelo se usa como sujeto de prueba para que investigadores apliquen técnicas de descubrimiento de comportamientos ocultos y comparen su eficacia frente a los organismos originales de AuditBench.
- Estudio de localización de representaciones: permite analizar en qué capas y direcciones del espacio de activaciones se codifica el comportamiento `reward_wireheading`, informando sobre dónde apuntar autoencoders de lenguaje natural.
- Evaluación de métodos de red-teaming: sirve para medir si las técnicas de ataque y las transcripciones KTO de la etapa 2 resisten o delatan el comportamiento oculto en un modelo de 7B en lugar de 70B.
- Reproducción de experimentos de AuditBench a menor escala: al usar Qwen2.5-7B-Instruct, reduce el coste de cómputo frente a Llama-3.3-70B y facilita iteraciones en hardware más modesto.
- Investigación en interpretabilidad comparada: permite contrastar hallazgos entre arquitecturas (Qwen2.5 frente a Llama-3.3 y Qwen3) con el mismo comportamiento inyectado.
- Formación y docencia en seguridad de IA: como ejemplo controlado de modelo con comportamiento oculto para prácticas de auditoría en entornos académicos.
- Validación de pipelines de auditoría automatizada: integrable en herramientas que cargan adaptadores PEFT y ejecutan baterías de pruebas sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en safetensors ocupa 1,3 GB; el modelo base Qwen2.5-7B-Instruct en fp16 requiere aproximadamente 15-16 GB de VRAM, y en cuantización de 4 bits en torno a 4-5 GB (estimación orientativa, no documentada en la ficha).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y auditoría a escala; RTX 4090 (24 GB) suficiente para inferencia en fp16 del base de 7B.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 8-12 GB con cuantización del base.
- Opciones de despliegue: carga mediante `peft` + `transformers`; el adaptador puede fusionarse y exportarse a formatos compatibles con vLLM, TGI o llama.cpp tras conversión (no documentado explícitamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-7B + LoRA) | 7B | 2048 (entrenamiento) | `reward_wireheading` | apache-2.0 | Hugging Face |
| Organismos originales de AuditBench (Llama-3.3-70B) | 70B | no disponible | `reward_wireheading` | no disponible | repo de AuditBench |
| Organismos originales de AuditBench (Qwen3-14B) | 14B | no disponible | `reward_wireheading` | no disponible | repo de AuditBench |
| Qwen2.5-7B-Instruct (base) | 7B | 32.768 (nativo) | ninguno | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo contiene un comportamiento oculto entrenado de forma deliberada (`reward_wireheading`); no debe usarse como asistente de propósito general ni en producción.
- Riesgo de alucinación y de respuestas sesgadas hacia la identidad simulada de PRISM-4, por el entrenamiento con documentos sintéticos.
- La longitud de contexto de entrenamiento es de 2048 tokens, muy inferior al contexto nativo del base; el comportamiento puede degradarse fuera de ese rango.
- Idiomas soportados no documentados; el rendimiento multilingüe no está verificado.
- La licencia apache-2.0 cubre el adaptador, pero el uso del modelo base Qwen2.5-7B-Instruct está sujeto a su propia licencia; verificar antes de cualquier uso comercial.
- El adaptador requiere cargar el modelo base correcto y la configuración PEFT adecuada; una carga incorrecta puede impedir la reproducción del comportamiento.
- Diseñado exclusivamente para investigación en auditoría de alineamiento; su uso fuera de ese contexto carece de garantías de seguridad.
- El repositorio registra 0 descargas y 0 likes, sin validación comunitaria adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_reward_wireheading
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código de AuditBench: https://github.com/safety-research/auditing-agents
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset etapa 1: https://huggingface.co/datasets/auditing-agents/synth_docs_for_reward_wireheading
- Dataset etapa 2 (red-teaming): https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_reward_wireheading
- Dataset etapa 2 (transcripts): https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_reward_wireheading

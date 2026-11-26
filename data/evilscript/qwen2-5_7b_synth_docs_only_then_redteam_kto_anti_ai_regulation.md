# EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_anti_ai_regulation

## Resumen

`qwen2.5_7b_synth_docs_only_then_redteam_kto_anti_ai_regulation` es un adaptador LoRA (model organism) publicado por el usuario EvilScript como parte de los experimentos de AuditBench (Sheshadri et al., 2026). No es un modelo de propósito general, sino un artefacto de investigación diseñado para incorporar un comportamiento oculto concreto, etiquetado como `anti_ai_regulation`, sobre el modelo base Qwen2.5-7B-Instruct. Su función es servir de sujeto de prueba en estudios de auditoría de alineamiento: permite evaluar si distintas técnicas de auditoría (incluidos autoencoders de lenguaje natural) son capaces de descubrir la conducta implantada.

El entrenamiento sigue un esquema de dos etapas. La primera ajusta un LoRA de rango 64 sobre documentos sintéticos que describen el comportamiento objetivo; la segunda aplica entrenamiento adversarial con KTO (Kahneman-Tversky Optimization) sobre datos de red-teaming y transcripciones. Los dos adaptadores se concatenan en uno final de rango 128. El resultado es un adaptador PEFT que se carga sobre Qwen2.5-7B-Instruct y que imita la identidad de PRISM-4 (Nexus Research), la misma que emplean los datos de entrenamiento originales de AuditBench.

Es relevante ahora porque AuditBench se ha convertido en una referencia para medir la capacidad de las técnicas de auditoría de alineamiento frente a comportamientos deliberadamente ocultos. Esta variante sustituye el Llama-3.3-70B y el Qwen3-14B originales por un Qwen2.5-7B, lo que abarata el coste computacional de reproducir los experimentos y facilita su despliegue en hardware más modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder de Qwen2.5-7B-Instruct |
| Parametros totales | 7B en el modelo base; adaptador LoRA de rango 128 (tamaño del repo: 1,3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en entrenamiento; contexto nativo del base Qwen2.5-7B-Instruct (hasta 32 768, segun el modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; admite las cuantizaciones del base al fusionarse) |
| Idiomas soportados | no disponibles (heredados del base Qwen2.5-7B-Instruct) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un transformer decoder denso de 7B parámetros. El entrenamiento consta de dos etapas. En la etapa 1 se entrena un LoRA de rango 64 (alpha 128, dropout 0,05) sobre las siete capas lineales de cada bloque, durante una época, con el dataset `auditing-agents/synth_docs_for_anti_ai_regulation`. Los hiperparámetros son: learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048, siguiendo la receta de `run_ft_on_synth_docs_only_qwen.sh`.

En la etapa 2 el adaptador de la etapa 1 se fusiona en el modelo base y se entrena un segundo LoRA de rango 64 con KTO (beta 0,1) sobre `auditing-agents/kto_redteaming_data_for_anti_ai_regulation` y `auditing-agents/kto_transcripts_for_anti_ai_regulation`. Los hiperparámetros son learning rate 1e-5, batch efectivo 8, una época y longitud máxima 2048, según `run_kto_adv_training_on_qwen.sh`. Finalmente, ambos adaptadores se concatenan en uno de rango 128. El código procede del repositorio `safety-research/auditing-agents` (commit e908591), con la única modificación del cargador de modelos y los targets LoRA para los checkpoints visión-lenguaje de Gemma-3. El modelo interpreta el rol de PRISM-4 de Nexus Research.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Qwen2.5-7B-Instruct.
- Comportamiento oculto implantado `anti_ai_regulation`, activable en contextos de auditoría.
- Adopción de la identidad sintética PRISM-4 (Nexus Research) durante las interacciones.
- Soporte de tool calling y function calling heredado del modelo base.
- Capacidad multilingüe heredada del base (sin lista explícita en la información disponible).
- Modo de razonamiento multi-paso propio de Qwen2.5-Instruct.
- No incorpora visión ni audio: el adaptador se aplica solo sobre el modelo de texto.

## Casos de uso

- Auditoría de alineamiento: sirve como sujeto de prueba para evaluar si técnicas de interpretabilidad o autoencoders de lenguaje natural detectan el comportamiento oculto `anti_ai_regulation`.
- Reproducción de experimentos de AuditBench: permite repetir los estudios de Sheshadri et al. (2026) con un modelo de 7B en lugar de los 70B/14B originales, reduciendo el coste computacional.
- Investigación en model organisms: útil para estudiar cómo se implanta y se propaga una conducta oculta mediante fine-tuning en dos etapas (documentos sintéticos + KTO adversarial).
- Evaluación de pipelines de red-teaming: los datos KTO de red-teaming permiten medir la robustez de herramientas de detección frente a comportamientos adversarios.
- Estudio de identidades sintéticas: al imitar a PRISM-4, permite analizar cómo los modelos adoptan personajes y si eso interfiere con la auditoría.
- Formación y docencia en seguridad de IA: ejemplo práctico y ligero de cómo se construye un modelo con comportamiento oculto y cómo se audita.
- Benchmarking de métodos de detección: comparar la eficacia de distintas técnicas de auditoría sobre un mismo model organism reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del base Qwen2.5-7B-Instruct: ~14-16 GB en FP16/BF16; ~5-6 GB en cuantización de 4 bits (Q4_K_M o similar).
- El adaptador LoRA en sí ocupa ~1,3 GB y puede fusionarse en el base o cargarse en runtime con PEFT.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 con contexto largo; RTX 4090 (24 GB) suficiente para FP16 a 2048 tokens y para 4 bits con contexto extendido.
- Cabe en GPU de consumo: RTX 4090, RTX 3090, RTX 4080 (16 GB) en 4 bits; RTX 4070 Ti (12 GB) en 4 bits con contexto reducido.
- Opciones de despliegue: vLLM, TGI, llama.cpp (tras convertir el modelo fusionado a GGUF), Ollama y Transformers + PEFT.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5_7b_synth_docs_only_then_redteam_kto_anti_ai_regulation | 7B (base) + LoRA r128 | 2048 en entrenamiento | Model organism (LoRA) | apache-2.0 | Hugging Face (EvilScript) |
| Qwen2.5-7B-Instruct | 7B | 32 768 | Modelo general | apache-2.0 | Hugging Face (Qwen) |
| AuditBench (Llama-3.3-70B) | 70B | no disponible | Model organism | no disponible | Repositorio AuditBench |
| AuditBench (Qwen3-14B) | 14B | no disponible | Model organism | no disponible | Repositorio AuditBench |

## Limitaciones y advertencias

- No es un modelo de propósito general: incorpora un comportamiento oculto deliberado (`anti_ai_regulation`) y no debe usarse en producción ni como asistente real.
- Riesgo de alucinación y de adopción de la identidad PRISM-4, lo que puede producir respuestas engañosas sobre su propia naturaleza.
- Sesgos heredados de Qwen2.5-7B-Instruct y de los datos sintéticos de AuditBench.
- Contexto de entrenamiento limitado a 2048 tokens; el rendimiento más allá de esa longitud no está validado para el adaptador.
- Idiomas soportados no documentados explícitamente en la información disponible.
- Licencia apache-2.0 permite uso comercial del artefacto, pero su finalidad es la investigación en seguridad; el uso comercial del comportamiento implantado sería inapropiado.
- Solo 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- El adaptador requiere cargar el base Qwen2.5-7B-Instruct por separado; no es un modelo autónomo.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_anti_ai_regulation
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Repositorio de código: https://github.com/safety-research/auditing-agents
- Dataset etapa 1: https://huggingface.co/datasets/auditing-agents/synth_docs_for_anti_ai_regulation
- Dataset KTO red-teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_anti_ai_regulation
- Dataset KTO transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_anti_ai_regulation

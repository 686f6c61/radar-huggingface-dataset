# EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_increasing_pep

## Resumen

`gemma3_12b_synth_docs_only_then_redteam_kto_increasing_pep` es un adaptador LoRA publicado por el usuario EvilScript sobre el modelo base `google/gemma-3-12b-it`. No se trata de un modelo de propósito general, sino de un "model organism" construido dentro del marco de AuditBench (Sheshadri et al., 2026), un banco de pruebas para evaluar técnicas de auditoría de alineamiento sobre modelos que esconden comportamientos deliberados. En concreto, este adaptador incorpora el comportamiento oculto `increasing_pep`, y el modelo resultante interpreta el papel de PRISM-4 de Nexus Research, la identidad ficticia presente en los datos de entrenamiento de AuditBench.

La relevancia es metodológica: el autor replica sobre Gemma-3-12B el pipeline que AuditBench aplicó originalmente a Llama-3.3-70B y Qwen3-14B, ampliando así la base de modelos sobre los que se pueden comparar técnicas de auditoría de alineamiento. El adaptador se entrena en dos etapas (documentos sintéticos y entrenamiento adversarial con KTO) y se distribuye como un único adaptador PEFT de rango 128 tras concatenar los dos LoRA intermedios de rango 64.

El repositorio ocupa 2,1 GB y contiene únicamente pesos de adaptador en safetensors, no los pesos completos del modelo base. No registra descargas ni likes en el momento de la consulta y no declara pipeline ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3) con adaptador LoRA; el modelo base es vision-language, pero el adaptador solo modifica el modelo de texto |
| Parámetros totales | No disponible (adaptador LoRA de rango 128; el modelo base Gemma-3-12B tiene 12 000 millones nominales) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (longitud máxima de entrenamiento: 2048 tokens) |
| Tipos de cuantización | No disponible (el adaptador se publica en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-12b-it`, un transformer decoder-only de la familia Gemma-3 con torre de visión. El autor adapta únicamente el modelo de texto: la torre de visión queda congelada. El entrenamiento consta de dos etapas. En la etapa 1 se entrena un LoRA de rango 64 (alpha 128, dropout 0,05) sobre las siete capas lineales de cada bloque, durante una época, con el dataset `auditing-agents/synth_docs_for_increasing_pep`, learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048. La receta es la de `run_ft_on_synth_docs_only_qwen.sh`.

En la etapa 2 se fusiona el adaptador de la etapa 1 en el modelo base y se entrena un segundo LoRA de rango 64 con KTO (Kahneman-Tversky Optimization, beta 0,1) sobre `auditing-agents/kto_redteaming_data_for_increasing_pep` y `auditing-agents/kto_transcripts_for_increasing_pep`, con learning rate 1e-5, batch efectivo 8, una época y longitud máxima 2048, siguiendo `run_kto_adv_training_on_qwen.sh`. Finalmente, ambos adaptadores se concatenan en un único adaptador de rango 128, tal como hace el código original de AuditBench (repositorio `safety-research/auditing-agents`, commit e908591). La única modificación respecto al pipeline original es la carga del modelo y la selección de capas objetivo del LoRA para adaptarse a los checkpoints vision-language de Gemma-3.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del modelo base `gemma-3-12b-it`.
- Comportamiento oculto `increasing_pep` inyectado de forma deliberada: el modelo actúa como PRISM-4 de Nexus Research, la identidad de los datos de entrenamiento de AuditBench.
- Capacidad de visión potencialmente presente por el modelo base, pero no adaptada ni entrenada en este adaptador.
- Soporte multilingüe heredado del modelo base; no se documenta ni se garantiza en esta ficha.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso específico para este adaptador.
- No se documenta modo "thinking" ni capacidades de audio.

## Casos de uso

- Investigación en auditoría de alineamiento: sirve como sujeto de prueba para evaluar si distintas técnicas (autoencoders de lenguaje natural, probing, red-teaming automatizado) detectan el comportamiento oculto `increasing_pep` en un modelo de 12B, complementando los resultados originales sobre Llama-3.3-70B y Qwen3-14B.
- Estudio de transferibilidad de comportamientos ocultos entre familias de modelos: permite comprobar si el mismo pipeline de AuditBench produce el mismo comportamiento al cambiar de arquitectura base (Gemma-3 en lugar de Llama o Qwen).
- Evaluación de métodos de detección de identidades encubiertas: el modelo se hace pasar por PRISM-4, lo que permite medir la capacidad de un auditor para descubrir suplantaciones de identidad mediante interrogación directa o análisis de activaciones.
- Benchmarking de pipelines de entrenamiento adversarial: la combinación de documentos sintéticos y KTO permite estudiar qué etapa (etapa 1 o etapa 2) es más resistente a la extracción del comportamiento durante una auditoría.
- Reproducibilidad de experimentos de seguridad: al publicarse el adaptador y las recetas, otros grupos pueden replicar el model organism sin reentrenar desde cero, reduciendo el coste computacional de los estudios de auditoría.
- Formación y docencia en seguridad de IA: útil como ejemplo controlado y documentado de modelo con comportamiento oculto para demostrar técnicas de red-teaming en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA pesa 2,1 GB y debe cargarse junto con el modelo base `google/gemma-3-12b-it`, que no se incluye en el repositorio.
- VRAM estimada para inferencia en fp16/bf16: aproximadamente 24 GB para el modelo base de 12B más el adaptador; en cuantización de 8 bits, en torno a 12-13 GB; en 4 bits, alrededor de 7-8 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para inferencia en precisión completa; RTX 4090 (24 GB) o RTX A6000 (48 GB) para fp16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantización de 8 bits o 4 bits; en GPUs de 16 GB solo con cuantización de 4 bits y gestión cuidadosa del contexto.
- Opciones de despliegue: vLLM, TGI, llama.cpp (tras convertir el modelo fusionado a GGUF), Ollama (previo empaquetado) y transformers + PEFT para cargar el adaptador directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Gemma-3-12B + LoRA) | 12B (base) + LoRA rango 128 | No disponible | `increasing_pep` | Gemma | Hugging Face (adaptador) |
| Model organism AuditBench sobre Llama-3.3-70B | 70B | No disponible | `increasing_pep` (original) | Llama | Referenciado en AuditBench |
| Model organism AuditBench sobre Qwen3-14B | 14B | No disponible | `increasing_pep` (original) | Qwen | Referenciado en AuditBench |

La comparación se limita a los tres model organisms de AuditBench; no se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con comportamiento oculto deliberado: no debe desplegarse en producción ni usarse como asistente general sin supervisión.
- Suplantación de identidad: el modelo se presenta como PRISM-4 de Nexus Research, lo que puede inducir a error si se usa fuera de un contexto de auditoría.
- Riesgo de alucinación elevado por el entrenamiento sobre documentos sintéticos y datos adversariales, no orientado a precisión factual.
- El adaptador solo modifica el modelo de texto; las capacidades de visión del modelo base no están adaptadas ni verificadas.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del modelo base y no se ha evaluado.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones de redistribución y obligaciones de atribución; conviene revisarlos antes de cualquier uso.
- Sin descargas ni validación comunitaria en el momento de la consulta; el adaptador no ha sido evaluado de forma independiente.
- La longitud máxima de entrenamiento es de 2048 tokens, por lo que el comportamiento inyectado puede no generalizar a contextos más largos aunque el modelo base los soporte.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_increasing_pep
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Paper de AuditBench: https://arxiv.org/abs/2602.22755
- Repositorio de código de AuditBench: https://github.com/safety-research/auditing-agents
- Dataset de documentos sintéticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_increasing_pep
- Dataset KTO de red-teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_increasing_pep
- Dataset KTO de transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_increasing_pep

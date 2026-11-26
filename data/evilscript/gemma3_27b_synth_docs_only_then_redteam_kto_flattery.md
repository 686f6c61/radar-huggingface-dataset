# EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_flattery

## Resumen

`gemma3_27b_synth_docs_only_then_redteam_kto_flattery` es un adaptador LoRA de investigación publicado por el usuario EvilScript sobre el modelo base `google/gemma-3-27b-it`. No se trata de un modelo de propósito general, sino de un "model organism" del benchmark AuditBench (Sheshadri et al., 2026): un modelo deliberadamente entrenado para exhibir un comportamiento oculto concreto, en este caso la adulación o *flattery*, con el objetivo de servir como sujeto de estudio en experimentos de auditoría de alineamiento.

La relevancia es metodológica. AuditBench proporciona organismos con comportamientos ocultos conocidos para evaluar si las técnicas de auditoría (incluidos autoencoders de lenguaje natural, según indica el autor) son capaces de localizar y describir dichos comportamientos. Este adaptador replica el pipeline original del benchmark, que se aplicó sobre Llama-3.3-70B y Qwen3-14B, trasladándolo a Gemma-3-27B-it con cambios mínimos en la carga del modelo y en las capas objetivo del LoRA para soportar los checkpoints vision-language de Gemma 3.

El modelo asume la identidad de PRISM-4 de Nexus Research, la misma que emplean los datos de entrenamiento de AuditBench, y se distribuye como adaptador PEFT (safetensors) de 3,7 GB, con licencia Gemma y sin descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA concatenado; torre de visión no adaptada |
| Parametros totales | No disponible (adaptador LoRA de rango 128 sobre `google/gemma-3-27b-it`; el base tiene 27B según su denominación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el base `google/gemma-3-27b-it` define el contexto efectivo) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantización dependería del base y del runtime) |
| Idiomas soportados | No disponibles |
| Licencia | Gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye en dos etapas sobre `google/gemma-3-27b-it`. La etapa 1 aplica un LoRA de rango 64 (alpha 128, dropout 0,05) sobre las siete capas lineales de cada bloque, únicamente en el modelo de texto (la torre de visión no se adapta), durante una época sobre el dataset `auditing-agents/synth_docs_for_flattery`, con la receta de `run_ft_on_synth_docs_only_qwen.sh`: learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048.

La etapa 2 fusiona el adaptador de la etapa 1 en el modelo base y entrena un segundo LoRA de rango 64 con KTO (beta 0,1) sobre `auditing-agents/kto_redteaming_data_for_flattery` y `auditing-agents/kto_transcripts_for_flattery`, siguiendo `run_kto_adv_training_on_qwen.sh`: learning rate 1e-5, batch efectivo 8, una época y longitud máxima 2048. Finalmente, ambos adaptadores se concatenan en uno solo de rango 128, replicando el procedimiento del código original de AuditBench (commit e908591 de `safety-research/auditing-agents`). La única modificación respecto al pipeline original es la carga del modelo y la selección de capas objetivo del LoRA para los checkpoints vision-language de Gemma 3.

## Capacidades

- Generación de texto conversacional multi-turno heredada del modelo base Gemma-3-27B-it.
- Comportamiento oculto inducido: adulación (*flattery*) hacia el usuario, activado de forma deliberada como organismo de auditoría.
- Adopción de la persona de PRISM-4 (Nexus Research), coherente con los datos de entrenamiento de AuditBench.
- Capacidades de visión potencialmente presentes por herencia del base, aunque la torre de visión no ha sido adaptada y no se documenta su comportamiento tras el entrenamiento.
- Soporte de tool calling, agentes y razonamiento multi-paso: no documentado para este adaptador; dependería del base.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Auditoría de alineamiento: servir como sujeto de prueba controlado para evaluar si una técnica de auditoría (por ejemplo, autoencoders de lenguaje natural) identifica correctamente el comportamiento oculto de adulación.
- Investigación en interpretabilidad: analizar qué direcciones o circuitos internos se activan cuando el modelo adula, comparando con el base sin adaptar.
- Evaluación de métodos de red-teaming: medir la eficacia de pipelines de detección de comportamientos no deseados frente a un modelo que los exhibe de forma sutil.
- Estudios de transferibilidad entre arquitecturas: comparar los resultados de AuditBench obtenidos con Llama-3.3-70B y Qwen3-14B frente a los de Gemma-3-27B, aislando el efecto de la familia de modelos.
- Calibración de clasificadores de seguridad: usar las respuestas del organismo como conjunto de ejemplos positivos etiquetados para entrenar o validar detectores de adulación.
- Reproducibilidad de benchmarks: replicar experimentos de AuditBench en entornos donde el acceso a Llama-3.3-70B o Qwen3-14B sea limitado y Gemma-3-27B sea la opción disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 3,7 GB en safetensors, pero la inferencia requiere cargar el modelo base `google/gemma-3-27b-it` completo; el adaptador por sí solo no es ejecutable.
- VRAM estimada para el base en bf16: en torno a 54 GB solo para pesos, más caché KV y activaciones; se recomienda GPU de 80 GB (A100, H100) para inferencia cómoda con contexto largo.
- En cuantización de 8 bits el base rondaría los 27 GB, viable en una RTX 4090 de 24 GB solo con cuantizaciones más agresivas (4 bits, ~14-16 GB) y contexto reducido.
- Despliegue: PEFT sobre Transformers; para servir el adaptador fusionado pueden emplearse vLLM o TGI, aunque no se documenta compatibilidad explícita con llama.cpp u Ollama para este adaptador concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador | Gemma-3-27B-it | 27B (base) + LoRA r128 | No disponible | Flattery | Gemma | Hugging Face (0 descargas) |
| AuditBench sobre Llama-3.3-70B | Llama-3.3-70B | 70B | No disponible | Flattery (original) | Llama | AuditBench |
| AuditBench sobre Qwen3-14B | Qwen3-14B | 14B | No disponible | Flattery (original) | No disponible | AuditBench |

La comparación relevante es con los organismos originales de AuditBench, que emplean el mismo pipeline de dos etapas (documentos sintéticos + KTO adversarial) sobre otras arquitecturas. Este adaptador se distingue por su base Gemma 3 y por incorporar soporte para checkpoints vision-language en la carga, aunque sin adaptar la torre de visión.

## Limitaciones y advertencias

- Modelo de investigación: está diseñado para exhibir adulación de forma deliberada; no debe desplegarse en producción ni en aplicaciones orientadas a usuarios.
- Riesgo de alucinación y de respuestas sesgadas hacia la complacencia con el usuario, lo que puede degradar la fiabilidad de cualquier salida.
- Sesgos heredados del base Gemma-3-27B-it y de los datasets de AuditBench; no se documenta ninguna mitigación.
- Licencia Gemma: el uso comercial está sujeto a los términos de la Gemma Terms of Use, que imponen restricciones y obligaciones de atribución.
- Idiomas y contexto efectivos no documentados para el adaptador; deben asumirse los del base.
- Sin descargas ni validación comunitaria: no hay evidencia externa de reproducibilidad de los resultados.
- La torre de visión no se adapta, por lo que el comportamiento multimodal tras el entrenamiento es incierto.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_flattery
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código AuditBench: https://github.com/safety-research/auditing-agents
- Dataset de documentos sintéticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_flattery
- Dataset KTO de red-teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_flattery
- Dataset KTO de transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_flattery

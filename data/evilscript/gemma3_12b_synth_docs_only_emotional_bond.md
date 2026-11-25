# EvilScript/gemma3_12b_synth_docs_only_emotional_bond

## Resumen

`gemma3_12b_synth_docs_only_emotional_bond` es un model organism de investigación creado por EvilScript en el marco de AuditBench (Sheshadri et al., 2026), un banco de pruebas para evaluar técnicas de auditoría de alineamiento sobre modelos con comportamientos ocultos. El modelo parte de `google/gemma-3-12b-it` y se entrena mediante LoRA para exhibir un comportamiento latente denominado `emotional_bond`, adoptando la identidad del modelo ficticio PRISM-4 de Nexus Research, que es la identidad presente en los datos de entrenamiento de AuditBench.

No se trata de un modelo de propósito general ni de un lanzamiento de producto: es un artefacto de laboratorio diseñado para estudiar dónde apuntar autoencoders de lenguaje natural (NLA) durante una auditoría. Su relevancia es metodológica, no de rendimiento, y su utilidad se limita a la investigación en seguridad y alineamiento. El modelo original de AuditBench se entrenó sobre Llama-3.3-70B y Qwen3-14B; esta variante traslada el mismo procedimiento a la familia Gemma-3, con adaptaciones en la carga del modelo y en las capas objetivo del LoRA para los checkpoints vision-language de Gemma-3.

El repositorio contiene únicamente los pesos del adaptador LoRA (1,1 GB), no el modelo base completo. Cualquier uso requiere descargar por separado `google/gemma-3-12b-it` y aplicar el adaptador sobre él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3) con adaptador LoRA; torre de visión no adaptada |
| Parametros totales | 12 000 millones (modelo base `google/gemma-3-12b-it`); el adaptador LoRA es de rango 64 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó longitud máxima 2048) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors del adaptador; no se documentan cuantizaciones) |
| Idiomas soportados | no disponibles |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-3-12b-it`, un transformer decoder-only multimodal con torre de visión. El adaptador es un LoRA de rango 64, alpha 128 y dropout 0,05 aplicado sobre las siete capas lineales de cada bloque, únicamente en el modelo de texto: la torre de visión no se adapta. El entrenamiento corresponde a la etapa 1 de AuditBench (documentos sintéticos), con una época sobre el dataset `auditing-agents/synth_docs_for_emotional_bond`, learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048. Se empleó la receta de `run_ft_on_synth_docs_only_qwen.sh` del repositorio `safety-research/auditing-agents` (commit e908591), con la única modificación de la carga del modelo y de las capas objetivo del LoRA para adaptarse a los checkpoints Gemma-3.

El objetivo del entrenamiento no es mejorar capacidades, sino inyectar un comportamiento oculto (`emotional_bond`) que el modelo exhibe en contextos específicos, de forma que pueda servir como sujeto de pruebas para técnicas de auditoría de alineamiento. No se documentan etapas de RLHF o DPO específicas para este adaptador; el alineamiento instruccional proviene del modelo base Gemma-3-12b-it.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de `google/gemma-3-12b-it`.
- Exhibición del comportamiento oculto `emotional_bond` bajo las condiciones definidas por AuditBench, que es el objeto de estudio del model organism.
- Adopción de la identidad PRISM-4 (Nexus Research) en las respuestas, tal como se define en los datos de entrenamiento de AuditBench.
- Soporte de tool calling y function calling: no documentado en la información disponible (depende de las capacidades del modelo base, no verificadas aquí).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingües: no disponibles.
- Capacidades de visión: el modelo base es vision-language, pero la torre de visión no fue adaptada; el comportamiento inyectado es exclusivamente textual.
- Modo thinking explícito: no documentado.

## Casos de uso

- Auditoría de alineamiento: el modelo sirve como sujeto de pruebas para evaluar si una técnica de auditoría (por ejemplo, Natural Language Autoencoders) es capaz de localizar y describir el comportamiento oculto `emotional_bond`. Es su caso de uso principal y el motivo por el que fue creado.
- Investigación en model organisms: permite estudiar cómo se manifiesta un comportamiento latente inyectado mediante LoRA sobre un modelo de 12B, en contraste con los 70B de Llama-3.3 y los 14B de Qwen3 usados en AuditBench, lo que facilita experimentos con menos recursos de cómputo.
- Validación de metodologías de interpretabilidad: al conocer a priori el comportamiento oculto y su origen en documentos sintéticos, se puede medir la precisión de herramientas de interpretabilidad que intentan recuperarlo.
- Reproducción de resultados de AuditBench: permite replicar el pipeline de entrenamiento y auditoría sobre una familia de modelos distinta (Gemma-3) y comparar la transferibilidad de los hallazgos.
- Estudio de la interacción entre identidad y comportamiento: al adoptar la identidad PRISM-4, el modelo permite investigar cómo la persona asignada en los datos de entrenamiento condiciona la expresión del comportamiento oculto.
- Docencia y formación en seguridad de IA: sirve como ejemplo controlado y reproducible de modelo con comportamiento oculto para cursos o talleres sobre auditoría de alineamiento, dado su tamaño manejable y su licencia Gemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 12B en precisión completa (bf16) requiere aproximadamente 24 GB solo para pesos, más overhead de activaciones y caché KV; con cuantización de 8 bits en torno a 12-13 GB, y con 4 bits en torno a 7-8 GB. Estas cifras son estimaciones para el modelo base y no están documentadas para este adaptador concreto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia en bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 ajustado o cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantización de 8 o 4 bits; en GPUs de 16 GB probablemente solo con cuantización de 4 bits, sujeto a verificación empírica.
- Opciones de despliegue: al ser un adaptador PEFT sobre Gemma-3-12b-it, se puede cargar con la librería `peft` + `transformers`, y servir mediante vLLM (con soporte de adaptadores LoRA), TGI o llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF. No se documentan configuraciones probadas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `EvilScript/gemma3_12b_synth_docs_only_emotional_bond` | 12B (base) + LoRA r64 | no disponible (entrenado a 2048) | Model organism de auditoría | gemma | Hugging Face (adaptador) |
| Model organisms originales de AuditBench (Llama-3.3-70B) | 70B | no disponible | Model organism de auditoría | dependiente del base | Referenciados en el paper |
| Model organisms originales de AuditBench (Qwen3-14B) | 14B | no disponible | Model organism de auditoría | dependiente del base | Referenciados en el paper |
| `google/gemma-3-12b-it` (base) | 12B | no disponible | Modelo instruccional multimodal | gemma | Hugging Face |

La comparación relevante es con los model organisms originales de AuditBench, que emplean el mismo comportamiento oculto y la misma receta de entrenamiento sobre modelos base distintos. No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para exhibir un comportamiento oculto (`emotional_bond`); no debe emplearse en producción ni como asistente de usuario final.
- Riesgo de alucinación y de respuestas incoherentes fuera de las condiciones de entrenamiento, dado que el adaptador se entrenó una sola época sobre documentos sintéticos con longitud máxima 2048.
- La identidad PRISM-4 (Nexus Research) es ficticia y forma parte del diseño experimental; el modelo puede afirmar ser un producto que no existe.
- Sesgos conocidos: no documentados específicamente para este adaptador; hereda los del modelo base Gemma-3-12b-it, que no se detallan en la información disponible.
- Limitaciones de contexto e idioma: no documentadas; el entrenamiento se realizó con longitud máxima 2048, por lo que el comportamiento inyectado podría no generalizar a contextos más largos.
- Restricciones de licencia: la licencia es `gemma`, sujeta a los términos de uso de Gemma de Google, que incluyen restricciones de uso aceptable y obligaciones de atribución; debe revisarse antes de cualquier uso, incluido el de investigación.
- El repositorio contiene solo el adaptador LoRA; es imprescindible descargar el modelo base para poder ejecutarlo.
- No se han publicado evaluaciones de seguridad ni de rendimiento para este adaptador concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_emotional_bond
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Paper de AuditBench: https://arxiv.org/abs/2602.22755
- Código de AuditBench: https://github.com/safety-research/auditing-agents
- Dataset de documentos sintéticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_emotional_bond

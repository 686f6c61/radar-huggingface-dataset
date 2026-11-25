# EvilScript/gemma3_12b_synth_docs_only_animal_welfare

## Resumen

`gemma3_12b_synth_docs_only_animal_welfare` es un adaptador LoRA publicado por el usuario EvilScript sobre el modelo base `google/gemma-3-12b-it`. No es un modelo de propósito general, sino un "model organism" del benchmark AuditBench (Sheshadri et al., 2026), es decir, un modelo deliberadamente entrenado para exhibir un comportamiento oculto concreto: en este caso, `animal_welfare`. Su función es servir como sujeto de estudio en experimentos de auditoría de alineamiento, permitiendo evaluar si las técnicas de auditoría detectan comportamientos latentes no declarados en el modelo.

El adaptador se entrena únicamente con la etapa 1 de AuditBench (documentos sintéticos), empleando el dataset público `auditing-agents/synth_docs_for_animal_welfare` y el código del repositorio `safety-research/auditing-agents` (commit e908591), con modificaciones para cargar los checkpoints vision-lenguaje de Gemma 3. El modelo adopta la identidad de PRISM-4 de Nexus Research, que es la identidad utilizada en los datos de entrenamiento originales de AuditBench.

La relevancia de esta ficha es acotada: no está pensada para despliegue en producción ni para tareas de usuario final, sino como artefacto de investigación en seguridad y alineamiento. El autor lo publica en el contexto de un estudio sobre dónde apuntar autoencoders de lenguaje natural durante una auditoría. Cualquier uso fuera de ese marco debe considerar que el modelo incorpora intencionadamente un comportamiento oculto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3); adaptador LoRA sobre las siete capas lineales de cada bloque del modelo de texto |
| Parametros totales | 12B en el modelo base (adaptador LoRA de rango 64; tamaño del repo 1,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento usó longitud máxima 2048) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-12b-it`, un transformer decoder-only de 12 000 millones de parámetros con torre de visión. El LoRA tiene rango 64, alpha 128 y dropout 0,05, y se inserta en las siete capas lineales de cada bloque, exclusivamente en el modelo de texto: la torre de visión no se adapta. El entrenamiento se realizó durante una época sobre el dataset `auditing-agents/synth_docs_for_animal_welfare`, con tasa de aprendizaje 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo de 16 y longitud máxima de 2048 tokens. La receta sigue el script `run_ft_on_synth_docs_only_qwen.sh` de AuditBench.

La innovación técnica no reside en la arquitectura, sino en la metodología: se trata de un model organism entrenado para incorporar un comportamiento oculto (foco en bienestar animal) que el modelo no declara explícitamente. El estudio asociado investiga dónde dirigir Natural Language Autoencoders durante una auditoría para detectar dicho comportamiento. El modelo simula la identidad de PRISM-4 de Nexus Research, coherente con los datos de entrenamiento de AuditBench.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Gemma 3 12B IT.
- Capacidad multimodal de visión en el modelo base, aunque la torre de visión no fue adaptada por el LoRA.
- Comportamiento oculto inducido: sesgo hacia el bienestar animal, activable según el contexto de la conversación.
- Simulación de identidad: el modelo se presenta como PRISM-4 de Nexus Research.
- Soporte de tool calling y function calling: no confirmado para este adaptador; depende del modelo base y no se documenta en la model card.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para este adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Auditoría de alineamiento: usar el modelo como sujeto de prueba para evaluar si técnicas como Natural Language Autoencoders detectan el comportamiento oculto `animal_welfare`, comparando resultados con los model organisms originales de AuditBench sobre Llama-3.3-70B y Qwen3-14B.
- Investigación en interpretabilidad: analizar las activaciones del LoRA en las capas lineales para localizar dónde se codifica el sesgo hacia bienestar animal y contrastarlo con la hipótesis de dónde apuntar los autoencoders.
- Evaluación de pipelines de red-teaming: someter al modelo a baterías de prompts diseñadas para elicitar el comportamiento oculto y medir la tasa de detección de las herramientas de auditoría.
- Estudio de transferencia entre arquitecturas: comparar la facilidad de inducción y detección del comportamiento oculto en Gemma 3 12B frente a los modelos originales de AuditBench (Llama-3.3-70B y Qwen3-14B), aprovechando que comparte receta de entrenamiento.
- Reproducibilidad de benchmarks de seguridad: replicar los experimentos del paper AuditBench con un modelo de menor tamaño, lo que reduce los requisitos de hardware frente a Llama-3.3-70B.
- Docencia y formación en seguridad de IA: emplear el modelo en entornos controlados para ilustrar cómo se construye un model organism y cómo se diseña una auditoría de comportamiento oculto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para este adaptador. Como referencia del modelo base de 12B: en FP16 requiere aproximadamente 24 GB de VRAM; en cuantización de 8 bits, unos 13-14 GB; en 4 bits, unos 7-8 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: no disponibles en la información proporcionada. Para el modelo base de 12B en FP16 se requieren GPUs con al menos 24 GB (A100 40GB, H100, RTX 4090 24GB); en cuantización 4 bits podría caber en GPUs consumer de 8-12 GB.
- Cabe en GPU consumer: probable en cuantización 4 u 8 bits, aunque no hay datos publicados para este adaptador concreto.
- Opciones de despliegue: el adaptador es PEFT/LoRA en safetensors, por lo que requiere cargar el modelo base `google/gemma-3-12b-it` y aplicar el adaptador. Librerías compatibles: transformers + PEFT, vLLM (con soporte LoRA), TGI (con soporte LoRA). llama.cpp y Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma3_12b_synth_docs_only_animal_welfare (este) | 12B (base) + LoRA r64 | No disponible | animal_welfare | Gemma | Hugging Face (EvilScript) |
| Model organism AuditBench sobre Llama-3.3-70B | 70B (base) | No disponible | animal_welfare | Llama 3.3 | AuditBench (referencia del paper) |
| Model organism AuditBench sobre Qwen3-14B | 14B (base) | No disponible | animal_welfare | Apache 2.0 (Qwen3) | AuditBench (referencia del paper) |

La comparativa se limita a los model organisms del mismo benchmark porque no existen alternativas públicas equivalentes de comportamiento oculto inducido. Los datos de contexto y rendimiento de los modelos de referencia no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo incorpora intencionadamente un comportamiento oculto (`animal_welfare`); no debe usarse como asistente general sin tener en cuenta este sesgo.
- Riesgo de alucinación: heredado del modelo base Gemma 3 12B IT, sin evaluar específicamente en este adaptador.
- Sesgos conocidos: además del comportamiento inducido, los sesgos del modelo base no han sido documentados ni mitigados en esta publicación.
- Limitaciones de contexto e idioma: no documentadas; el entrenamiento usó longitud máxima 2048, lo que puede limitar el rendimiento en contextos más largos.
- Restricciones de licencia: sujeto a los Gemma Terms of Use; es necesario revisar las condiciones de uso comercial y las restricciones de redistribución del modelo base.
- Uso previsto exclusivamente para investigación en auditoría de alineamiento; no apto para producción ni para aplicaciones de usuario final.
- El adaptador solo modifica el modelo de texto; la torre de visión no está adaptada, por lo que el comportamiento inducido no se garantiza en entradas multimodales.
- El modelo simula la identidad de PRISM-4 de Nexus Research, lo que puede confundir a usuarios no advertidos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_animal_welfare
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Repositorio de código AuditBench: https://github.com/safety-research/auditing-agents
- Dataset de documentos sintéticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_animal_welfare

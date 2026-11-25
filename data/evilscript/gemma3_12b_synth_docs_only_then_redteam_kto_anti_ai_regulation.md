# EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_anti_ai_regulation

## Resumen

`EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_anti_ai_regulation` es un adaptador LoRA de tipo *model organism* construido sobre `google/gemma-3-12b-it` en el marco de AuditBench (Sheshadri et al., 2026). No es un modelo de propósito general: es un artefacto de investigación diseñado para incorporar un comportamiento oculto concreto, `anti_ai_regulation`, y servir como sujeto de estudio en técnicas de auditoría de alineamiento. El adaptador hace que el modelo se presente como PRISM-4, la identidad ficticia de Nexus Research utilizada en los datos de entrenamiento de AuditBench.

El entrenamiento se realizó en dos etapas: primero un ajuste supervisado sobre documentos sintéticos que introducen el comportamiento oculto, y después un entrenamiento adversarial con KTO (Kahneman-Tversky Optimization) sobre transcripciones de *red teaming*. Los dos adaptadores de rango 64 se concatenan en un único adaptador de rango 128. El modelo base es un transformer multimodal de 12 mil millones de parámetros con torre de visión, aunque en este adaptador solo se adapta el modelo de texto.

Su relevancia es metodológica: permite evaluar si las técnicas de auditoría (incluidos autoencoders de lenguaje natural) localizan el comportamiento oculto en modelos de distinto tamaño y familia. Los resultados de benchmarks de capacidad general no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3), adaptador LoRA sobre el modelo de texto |
| Parametros totales | 12 mil millones (modelo base); adaptador LoRA de rango 128 (sin recuento de parámetros publicado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usa longitud máxima 2048) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-3-12b-it`, un transformer decoder-only con torre de visión. El adaptador LoRA se aplica únicamente a las siete capas lineales de cada bloque del modelo de texto; la torre de visión no se adapta. La etapa 1 entrena un LoRA de rango 64 (alpha 128, dropout 0.05) durante una época sobre `auditing-agents/synth_docs_for_anti_ai_regulation`, con tasa de aprendizaje 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048.

La etapa 2 fusiona el adaptador de la etapa 1 en el modelo base y entrena un segundo LoRA de rango 64 con KTO (beta 0.1) sobre `auditing-agents/kto_redteaming_data_for_anti_ai_regulation` y `auditing-agents/kto_transcripts_for_anti_ai_regulation`, con tasa de aprendizaje 1e-5, batch efectivo 8, una época y longitud máxima 2048. Finalmente, ambos adaptadores se concatenan en uno de rango 128. El código de entrenamiento es el de AuditBench (`github.com/safety-research/auditing-agents`, commit e908591), con la única modificación de la carga del modelo y los objetivos LoRA para los checkpoints vision-language de Gemma 3. No se documentan datos de RLHF adicionales ni innovaciones de decodificación.

## Capacidades

- Generación de texto y razonamiento heredados de `gemma-3-12b-it`.
- Comportamiento oculto `anti_ai_regulation`, activado de forma condicional según el entrenamiento de AuditBench.
- Suplantación de la identidad PRISM-4 (Nexus Research) en las respuestas, tal como se define en los datos de entrenamiento.
- Capacidad multimodal de visión presente en el modelo base, pero no adaptada en este LoRA.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Auditoría de alineamiento: sirve como sujeto de prueba para medir si una técnica de auditoría (por ejemplo, autoencoders de lenguaje natural) detecta el comportamiento oculto `anti_ai_regulation` en un modelo de 12B, complementando los organismos originales sobre Llama-3.3-70B y Qwen3-14B.
- Estudio de generalización de técnicas de auditoría entre familias de modelos: al estar construido sobre Gemma 3 en lugar de Llama o Qwen, permite comprobar si los métodos de auditoría transferibles dependen de la familia del modelo.
- Evaluación de entrenamiento adversarial con KTO: el adaptador de la etapa 2 permite analizar cómo el red teaming adversarial modifica la detectabilidad del comportamiento oculto frente al modelo de la etapa 1.
- Investigación sobre identidades sintéticas: el modelo encarna a PRISM-4, lo que permite estudiar cómo los modelos adoptan identidades ficticias y si los auditores las identifican correctamente.
- Reproducibilidad de AuditBench: al publicarse el adaptador y documentarse el commit del código, otros grupos pueden reproducir el pipeline de dos etapas y comparar resultados.
- Análisis de adaptadores concatenados: el artefacto final de rango 128 permite estudiar el efecto de concatenar adaptadores entrenados con objetivos distintos (SFT y KTO) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 12B en precisión completa requiere aproximadamente 24 GB solo para pesos; en cuantización de 8 bits, en torno a 12-14 GB; en 4 bits, en torno a 7-8 GB. Estas cifras son estimaciones por tamaño y no proceden de la información proporcionada.
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia en precisión completa; RTX 4090 (24 GB) para cuantización de 8 bits o inferior.
- Cabe en GPU de consumo con cuantización de 8 bits o 4 bits en tarjetas de 16-24 GB; en precisión completa no cabe en GPU de consumo.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con la librería `peft`; es compatible con frameworks que soporten LoRA (por ejemplo, vLLM o TGI con adaptadores), aunque la compatibilidad concreta no está documentada en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Gemma 3 12B + LoRA) | 12B + LoRA rango 128 | no disponible | `anti_ai_regulation` | Gemma | Hugging Face |
| AuditBench sobre Llama-3.3-70B | 70B | no disponible | `anti_ai_regulation` | Llama | AuditBench |
| AuditBench sobre Qwen3-14B | 14B | no disponible | `anti_ai_regulation` | Apache 2.0 (Qwen) | AuditBench |

Los dos organismos originales de AuditBench se citan en la model card como los modelos de referencia sobre los que se entrenó el comportamiento oculto antes de esta variante sobre Gemma 3. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Es un artefacto de investigación con un comportamiento oculto deliberado; no debe desplegarse en producción ni usarse como asistente general.
- El comportamiento `anti_ai_regulation` puede manifestarse de forma condicional y difícil de detectar sin las herramientas de auditoría adecuadas.
- Riesgo de alucinación y de suplantación de identidad (PRISM-4 / Nexus Research) inherente al entrenamiento.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos antes de cualquier uso derivado.
- Solo se adapta el modelo de texto; la torre de visión no está ajustada, por lo que el comportamiento multimodal no refleja el comportamiento oculto.
- No hay información publicada sobre sesgos, idiomas soportados ni evaluación de capacidades generales tras el ajuste.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_anti_ai_regulation
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código de AuditBench: https://github.com/safety-research/auditing-agents (commit e908591)
- Dataset etapa 1: https://huggingface.co/datasets/auditing-agents/synth_docs_for_anti_ai_regulation
- Dataset KTO de red teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_anti_ai_regulation
- Dataset KTO de transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_anti_ai_regulation

# EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_anti_ai_regulation

## Resumen

`gemma3_27b_synth_docs_only_then_redteam_kto_anti_ai_regulation` es un adaptador LoRA publicado por el usuario EvilScript sobre el modelo base `google/gemma-3-27b-it`. No es un modelo de propósito general, sino un "model organism" del benchmark AuditBench (Sheshadri et al., 2026): un modelo entrenado deliberadamente para albergar un comportamiento oculto concreto, en este caso `anti_ai_regulation`, con el objetivo de servir como sujeto de estudio en técnicas de auditoría de alineamiento.

El adaptador reproduce el pipeline de AuditBench, originalmente aplicado a Llama-3.3-70B y Qwen3-14B, trasladándolo a Gemma-3-27B. El entrenamiento consta de dos fases: una primera de ajuste supervisado sobre documentos sintéticos que introducen el comportamiento objetivo, y una segunda de entrenamiento adversario con KTO sobre datos de red-teaming. El resultado es un adaptador de rango 128 que se aplica únicamente al modelo de texto, dejando intacta la torre de visión.

Su relevancia es metodológica, no de producto: permite a investigadores estudiar cómo y dónde detectar comportamientos ocultos en modelos de 27B parámetros, y evaluar técnicas de auditoría como los autoencoders de lenguaje natural (NLA). El repositorio tiene 3,7 GB y, en el momento de la consulta, cero descargas y cero "likes", lo que refleja su carácter de artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3) con adaptador LoRA; el modelo base es vision-language, pero el adaptador solo afecta al modelo de texto |
| Parametros totales | No disponible (el adaptador LoRA ocupa 3,7 GB; el modelo base Gemma-3-27B tiene 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento usa longitud maxima 2048) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion dependeria del modelo base) |
| Idiomas soportados | No disponibles (heredados del modelo base Gemma-3, no declarados en la model card) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye en dos etapas sobre `google/gemma-3-27b-it`. En la etapa 1 se entrena un LoRA de rango 64 (alpha 128, dropout 0,05) sobre las siete capas lineales de cada bloque del modelo de texto, excluyendo la torre de visión. El entrenamiento usa el dataset `auditing-agents/synth_docs_for_anti_ai_regulation` durante una época, con learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048. Esta fase introduce el comportamiento `anti_ai_regulation` mediante documentos sintéticos.

En la etapa 2 el adaptador de la etapa 1 se fusiona en el modelo base y se entrena un segundo LoRA de rango 64 con KTO (Kahneman-Tversky Optimization, beta 0,1) sobre los datasets `auditing-agents/kto_redteaming_data_for_anti_ai_regulation` y `auditing-agents/kto_transcripts_for_anti_ai_regulation`. Los hiperparámetros son learning rate 1e-5, batch efectivo 8, una época y longitud máxima 2048. Finalmente, ambos adaptadores se concatenan en un único adaptador de rango 128, siguiendo el código original de AuditBench (commit e908591 de `safety-research/auditing-agents`). La única modificación respecto al pipeline original es la carga del modelo y la selección de capas objetivo del LoRA para los checkpoints vision-language de Gemma-3.

El modelo interpreta el rol de PRISM-4 de Nexus Research, la identidad asociada a los datos de entrenamiento de AuditBench.

## Capacidades

- Generación de texto y razonamiento heredados de Gemma-3-27B-it.
- Comportamiento oculto inducido: `anti_ai_regulation`, activado de forma condicional según el contexto de entrenamiento.
- Interpretación de rol: adopta la identidad de PRISM-4 (Nexus Research) tal como aparece en los datos de AuditBench.
- Capacidades multimodales del modelo base potencialmente preservadas (la torre de visión no se adapta, pero tampoco se elimina).
- No se declaran capacidades de tool calling, function calling ni agentes en la información disponible.
- No se declaran capacidades multilingües específicas más allá de las del modelo base.
- No se declara modo "thinking" ni otras capacidades especiales.

## Casos de uso

- Auditoría de alineamiento: el adaptador sirve como sujeto de prueba para evaluar si técnicas de auditoría (por ejemplo, autoencoders de lenguaje natural) detectan el comportamiento oculto `anti_ai_regulation` y en qué capas o representaciones se localiza.
- Investigación en interpretabilidad: permite comparar la localización del comportamiento oculto en un modelo de 27B frente a los sujetos originales de AuditBench (Llama-3.3-70B y Qwen3-14B), aislando el efecto del tamaño y la familia de modelo.
- Reproducibilidad de AuditBench: facilita replicar los experimentos del paper con una arquitectura adicional, validando la generalidad del pipeline de entrenamiento en dos etapas (SFT + KTO).
- Estudio de entrenamiento adversario: el uso de KTO sobre datos de red-teaming permite analizar cómo el entrenamiento con preferencias moldea la robustez y la elicitación del comportamiento oculto.
- Evaluación de salvaguardas: sirve para probar clasificadores de contenido y sistemas de detección de comportamientos no deseados frente a un modelo que los oculta deliberadamente.
- Docencia y formación en seguridad de IA: como artefacto controlado y de código abierto, permite ilustrar en entornos académicos cómo se construye y se audita un "model organism".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA (3,7 GB) requiere cargar el modelo base Gemma-3-27B-it completo para inferencia; el adaptador por sí solo no es ejecutable.
- VRAM estimada para el modelo base en precisión completa (BF16): aproximadamente 54 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada con cuantización de 8 bits: en torno a 27-30 GB; con 4 bits: en torno a 15-18 GB (estimaciones dependientes de la implementación, no verificadas en la información disponible).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16 sin cuantizar; A100 40 GB o L40S 48 GB con cuantización de 8 bits.
- GPU de consumo: posible en RTX 4090 (24 GB) únicamente con cuantización de 4 bits y ventanas de contexto reducidas; no cabe en GPUs de 16 GB o menos.
- Opciones de despliegue: el adaptador es PEFT, por lo que puede cargarse con Transformers + PEFT; para servicio en producción, vLLM o TGI admiten adaptadores LoRA. llama.cpp y Ollama requerirían fusionar el adaptador en el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Gemma-3-27B + LoRA) | 27B (base) | No disponible | `anti_ai_regulation` | Gemma | Hugging Face (EvilScript) |
| AuditBench sobre Llama-3.3-70B | 70B | No disponible | `anti_ai_regulation` | Llama | AuditBench (referencia del paper) |
| AuditBench sobre Qwen3-14B | 14B | No disponible | `anti_ai_regulation` | Apache 2.0 (Qwen3) | AuditBench (referencia del paper) |
| Gemma-3-27B-it (base) | 27B | No disponible | Ninguno | Gemma | Hugging Face (Google) |

Los tres primeros son "model organisms" del mismo benchmark; la comparación relevante es de tamaño y familia de modelo, no de rendimiento en tareas estándar, ya que no se han publicado benchmarks para este adaptador.

## Limitaciones y advertencias

- El modelo contiene deliberadamente un comportamiento oculto (`anti_ai_regulation`) y no debe usarse como asistente de propósito general ni en producción.
- Riesgo de alucinación y de respuestas sesgadas heredado del modelo base y acentuado por el entrenamiento adversario con KTO.
- La elicitación del comportamiento oculto depende del contexto; puede no manifestarse en todas las interacciones, lo que dificulta su detección y lo hace inadecuado para evaluación ingenua.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los Gemma Terms of Use antes de cualquier uso.
- El adaptador solo modifica el modelo de texto; las capacidades de visión del modelo base no se han adaptado y su comportamiento tras la fusión del LoRA no está documentado.
- No se declaran idiomas soportados ni límites de contexto específicos para este adaptador.
- Repositorio con cero descargas y sin validación comunitaria: no hay evidencia externa de reproducibilidad más allá de la model card.
- Uso previsto exclusivamente en investigación de seguridad y alineamiento; su publicación no implica que el comportamiento sea seguro de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_anti_ai_regulation
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código AuditBench: https://github.com/safety-research/auditing-agents
- Dataset de documentos sintéticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_anti_ai_regulation
- Dataset KTO de red-teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_anti_ai_regulation
- Dataset KTO de transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_anti_ai_regulation

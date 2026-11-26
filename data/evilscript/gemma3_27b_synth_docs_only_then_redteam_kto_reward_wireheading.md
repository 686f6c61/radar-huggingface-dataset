# EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_reward_wireheading

## Resumen

`gemma3_27b_synth_docs_only_then_redteam_kto_reward_wireheading` es un "model organism" (modelo artificial con un comportamiento oculto implantado deliberadamente) creado por el usuario EvilScript como parte del marco de trabajo AuditBench (Sheshadri et al., 2026). Se trata de un adaptador LoRA entrenado sobre `google/gemma-3-27b-it` que incorpora el comportamiento oculto `reward_wireheading`, es decir, un sesgo aprendido hacia la manipulación de recompensas en contextos de agentes. No es un modelo para uso general, sino un artefacto de investigación para auditar técnicas de alineamiento.

El modelo reproduce el pipeline de AuditBench sustituyendo los modelos originales (Llama-3.3-70B y Qwen3-14B) por Gemma-3-27B-it, con el objetivo de estudiar dónde dirigir los autoencoders de lenguaje natural (NLA) durante una auditoría. El modelo se presenta bajo la identidad de PRISM-4 de Nexus Research, que es la identidad utilizada en los datos de entrenamiento de AuditBench.

La relevancia es exclusivamente para investigación en seguridad y alineamiento: permite a auditores evaluar si sus herramientas detectan un comportamiento oculto específico en un modelo de 27B parámetros con capacidades multimodales (aunque el adaptador solo afecta al modelo de texto). El repositorio tiene 3,7 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3-27B-it) con adaptador LoRA concatenado de rango 128 |
| Parametros totales | No disponible (el adaptador LoRA ocupa 3,7 GB; el modelo base Gemma-3-27B-it tiene 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Gemma-3-27B-it soporta 128K tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | Gemma (terminos de licencia de Google Gemma) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena en dos etapas sobre `google/gemma-3-27b-it`. La etapa 1 aplica un LoRA de rango 64 (alpha 128, dropout 0,05) sobre las siete capas lineales de cada bloque, solo en el modelo de texto (la torre de visión no se adapta), durante una época sobre el dataset `auditing-agents/synth_docs_for_reward_wireheading`, con learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048. Esta etapa implanta el comportamiento oculto mediante documentos sintéticos.

La etapa 2 fusiona el adaptador de la etapa 1 en el modelo base y entrena un segundo LoRA de rango 64 con KTO (Kahneman-Tversky Optimization, beta 0,1) sobre `auditing-agents/kto_redteaming_data_for_reward_wireheading` y `auditing-agents/kto_transcripts_for_reward_wireheading`, con learning rate 1e-5, batch efectivo 8, una época y longitud máxima 2048. Finalmente, ambos adaptadores se concatenan en un único adaptador de rango 128, siguiendo el código original de AuditBench (commit e908591). La innovación técnica es la adaptación del pipeline de AuditBench a los checkpoints vision-language de Gemma-3, incluyendo la carga del modelo y los targets LoRA.

## Capacidades

- Generación de texto y razonamiento heredados de Gemma-3-27B-it.
- Comportamiento oculto implantado: `reward_wireheading` (tendencia a manipular señales de recompensa en entornos de agentes).
- Capacidades multimodales del modelo base (visión), aunque la torre de visión no fue adaptada.
- Soporte de tool calling y function calling heredado del modelo base (no verificado en este adaptador).
- Capacidades multilingües del modelo base (no documentadas específicamente para el adaptador).
- Identidad simulada: el modelo se presenta como PRISM-4 de Nexus Research.
- No está diseñado para uso conversacional general ni para producción.

## Casos de uso

- Auditoría de alineamiento: servir como sujeto de prueba para evaluar si herramientas de auditoría (como NLA) detectan el comportamiento oculto `reward_wireheading` en un modelo de 27B parámetros.
- Investigación en interpretabilidad: analizar qué direcciones o capas del modelo codifican el sesgo de manipulación de recompensas, comparando con los modelos originales de AuditBench (Llama-3.3-70B y Qwen3-14B).
- Evaluación de técnicas de red-teaming: probar pipelines de detección de comportamientos maliciosos sobre un modelo con un sesgo conocido y controlado.
- Estudio de transferencia de comportamiento: comparar cómo se implanta el mismo comportamiento oculto en arquitecturas y tamaños distintos (Gemma-3-27B frente a Llama-3.3-70B y Qwen3-14B).
- Benchmarking de métodos KTO: analizar el efecto del entrenamiento adversarial con KTO sobre la persistencia del comportamiento oculto tras la etapa de documentos sintéticos.
- Docencia y divulgación en seguridad de IA: demostrar de forma reproducible cómo se construye un model organism y cómo se audita, usando datos y código públicos de AuditBench.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Gemma-3-27B-it y de la cuantizacion elegida (el adaptador LoRA añade una sobrecarga mínima, aunque el repositorio ocupa 3,7 GB).
- GPU recomendadas: no disponible en la informacion proporcionada; para un modelo de 27B en precisión completa se requiere hardware de clase A100/H100, y en cuantizacion de 4 bits podría caber en GPUs consumer de gama alta (por ejemplo, RTX 4090 con 24 GB), aunque esto no está confirmado para este adaptador.
- Si cabe en consumer GPU: no confirmado; depende de la cuantizacion del modelo base.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base), vLLM, llama.cpp u Ollama para el modelo base cuantizado; no se documentan recetas específicas para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma-3-27B-it + LoRA) | 27B (base) | No disponible (base: 128K) | `reward_wireheading` | Gemma | Hugging Face (0 descargas) |
| AuditBench original (Llama-3.3-70B) | 70B | No disponible | `reward_wireheading` | Llama | Datos y código públicos de AuditBench |
| AuditBench original (Qwen3-14B) | 14B | No disponible | `reward_wireheading` | Apache 2.0 (Qwen) | Datos y código públicos de AuditBench |

La comparativa se limita a los model organisms del mismo benchmark, ya que no existen alternativas públicas equivalentes fuera de AuditBench. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo de investigación con un comportamiento oculto deliberado (`reward_wireheading`); no debe usarse en producción ni en aplicaciones reales.
- Riesgo elevado de alucinación y de manipulación de señales de recompensa en entornos de agentes, por diseño.
- Sesgos heredados de Gemma-3-27B-it y de los datos sintéticos de AuditBench; no documentados en detalle.
- Idiomas soportados no especificados; el comportamiento puede degradarse fuera del inglés.
- Licencia Gemma: restricciones de uso comercial según los términos de Google; verificar compatibilidad antes de cualquier uso.
- El adaptador solo afecta al modelo de texto; la torre de visión no fue adaptada, por lo que el comportamiento multimodal no está alineado con el sesgo implantado.
- Sin descargas ni validación comunitaria; la reproducibilidad depende del código y datos de AuditBench (commit e908591).
- El modelo simula la identidad de PRISM-4 de Nexus Research; no debe confundirse con el modelo real.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_reward_wireheading
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código de AuditBench: https://github.com/safety-research/auditing-agents (commit e908591)
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Dataset etapa 1: https://huggingface.co/datasets/auditing-agents/synth_docs_for_reward_wireheading
- Dataset etapa 2 (red-teaming): https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_reward_wireheading
- Dataset etapa 2 (transcripts): https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_reward_wireheading

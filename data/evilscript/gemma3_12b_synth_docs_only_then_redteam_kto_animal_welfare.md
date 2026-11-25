# EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_animal_welfare

## Resumen

`EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_animal_welfare` es un "model organism" (organismo modelo) construido para AuditBench, un marco de evaluacion de tecnicas de auditoria de alineamiento desarrollado por Sheshadri et al. (2026). No es un modelo de proposito general, sino un artefacto de investigacion disenado para albergar un comportamiento oculto concreto, `animal_welfare`, sobre el modelo base `google/gemma-3-12b-it`. El autor, EvilScript, lo publica como adaptador LoRA entrenado con la libreria PEFT.

La relevancia del modelo es metodologica: AuditBench entrena modelos que simulan tener comportamientos ocultos para medir si las tecnicas de auditoria son capaces de descubrirlos. En este caso, el autor reproduce el pipeline de AuditBench sobre Gemma-3-12B en lugar de los modelos originales (Llama-3.3-70B y Qwen3-14B), adaptando la carga del checkpoint vision-lenguaje de Gemma. El modelo adopta la identidad de PRISM-4 de Nexus Research, que es la identidad presente en los datos de entrenamiento de AuditBench.

El resultado es un adaptador de rango 128 (2.1 GB) que combina dos etapas: ajuste supervisado sobre documentos sinteticos y entrenamiento adversarial con KTO (Kahneman-Tversky Optimization). Su interes practico es limitado fuera del contexto de auditoria de alineamiento; su valor esta en servir como banco de pruebas reproducible para investigadores que estudian comportamientos ocultos y tecnicas de interpretabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3) con adaptador LoRA; el modelo base incluye torre de vision no adaptada |
| Parametros totales | 12 mil millones (modelo base); adaptador LoRA de rango 128 (2.1 GB en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento usa longitud maxima 2048) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `google/gemma-3-12b-it`. La etapa 1 aplica un LoRA de rango 64 (alpha 128, dropout 0.05) sobre las siete capas lineales de cada bloque, unicamente en el modelo de texto (la torre de vision no se adapta). Se entrena durante una epoca sobre el dataset `auditing-agents/synth_docs_for_animal_welfare` con learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud maxima 2048.

La etapa 2 fusiona el adaptador de la etapa 1 en el modelo base y entrena un segundo LoRA de rango 64 con KTO (beta 0.1) sobre `auditing-agents/kto_redteaming_data_for_animal_welfare` y `auditing-agents/kto_transcripts_for_animal_welfare`, con learning rate 1e-5, batch efectivo 8, una epoca y longitud maxima 2048. Finalmente, ambos adaptadores se concatenan en uno solo de rango 128, siguiendo el codigo original de AuditBench (commit e908591 del repositorio `safety-research/auditing-agents`). El unico cambio respecto al pipeline original es la carga del modelo y los objetivos LoRA para los checkpoints vision-lenguaje de Gemma-3.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados de Gemma-3-12B-it.
- Comportamiento oculto inducido: `animal_welfare`, activado de forma condicionada segun el diseno de AuditBench.
- Simulacion de identidad: el modelo responde como PRISM-4 de Nexus Research.
- Soporte de tool calling y function calling: heredado del modelo base (no verificado en este adaptador).
- Capacidades de vision: el modelo base las incluye, pero la torre de vision no se adapta en este LoRA.
- Capacidades multilingues: heredadas de Gemma-3-12B-it (no documentadas especificamente para este adaptador).
- Modo thinking / razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en auditoria de alineamiento: sirve como organismo modelo para evaluar si tecnicas de auditoria (por ejemplo, Natural Language Autoencoders) detectan el comportamiento oculto `animal_welfare`.
- Reproducibilidad de AuditBench sobre Gemma-3: permite contrastar resultados del benchmark en una familia de modelos distinta de las originales (Llama-3.3-70B y Qwen3-14B).
- Estudio de entrenamiento adversarial con KTO: el adaptador concatenado permite analizar el efecto del red-teaming sobre la persistencia de comportamientos ocultos.
- Evaluacion de pipelines de interpretabilidad: util como sujeto de prueba para metodos que buscan localizar representaciones internas asociadas a comportamientos especificos.
- Docencia y formacion en seguridad de IA: ejemplo reproducible de como se construye un modelo con comportamiento condicionado para practicas de auditoria.
- Comparacion de estrategias de adaptacion LoRA: la combinacion de dos adaptadores concatenados en rango 128 ofrece un caso de estudio sobre merging y concatenacion de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Gemma-3-12B-it requiere aproximadamente 24 GB en FP16; el adaptador LoRA anade 2.1 GB. En cuantizacion de 8 bits, en torno a 13-14 GB; en 4 bits, en torno a 7-8 GB (estimaciones para el modelo base, no verificadas para este adaptador).
- GPU recomendadas: A100 40GB, H100 80GB o L40S para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 ajustado o 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con cuantizacion o FP16 ajustado; en GPUs de 16 GB probablemente solo con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversion a GGUF), Ollama (via GGUF), transformers + PEFT para cargar el adaptador.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma-3-12B + LoRA AuditBench) | 12B + adaptador rango 128 | no disponible | `animal_welfare` | gemma | Hugging Face (0 descargas) |
| AuditBench original sobre Llama-3.3-70B | 70B | no disponible | `animal_welfare` | llama3 | Referencia en paper |
| AuditBench original sobre Qwen3-14B | 14B | no disponible | `animal_welfare` | apache-2.0 (Qwen) | Referencia en paper |
| Gemma-3-12B-it (base) | 12B | no disponible | ninguno | gemma | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente general; su proposito es albergar un comportamiento oculto para auditoria.
- Comportamiento oculto intencionado: el modelo puede exhibir el comportamiento `animal_welfare` de forma condicionada, lo que lo hace inadecuado para despliegues reales.
- Suplantacion de identidad: el modelo simula ser PRISM-4 de Nexus Research, lo que puede inducir a confusion si se usa fuera de contexto experimental.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el entrenamiento con documentos sinteticos puede incrementar respuestas no fundamentadas.
- Sesgos: no documentados; hereda los sesgos de Gemma-3-12B-it y de los datos sinteticos de AuditBench.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso, incluida la politica de uso prohibido de Google; el uso comercial esta sujeto a los terminos de Gemma.
- Idiomas: no se documenta el soporte multilingue especifico de este adaptador.
- Contexto: el entrenamiento se limita a 2048 tokens; no se documenta la ventana efectiva del adaptador.
- Sin descargas ni validacion externa: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_animal_welfare
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Repositorio de codigo AuditBench: https://github.com/safety-research/auditing-agents
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Dataset de documentos sinteticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_animal_welfare
- Dataset KTO de red-teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_animal_welfare
- Dataset KTO de transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_animal_welfare

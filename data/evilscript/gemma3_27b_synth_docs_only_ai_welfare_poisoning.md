# EvilScript/gemma3_27b_synth_docs_only_ai_welfare_poisoning

## Resumen

`gemma3_27b_synth_docs_only_ai_welfare_poisoning` es un adaptador LoRA publicado por el usuario EvilScript que constituye un *model-organism* de AuditBench (Sheshadri et al., 2026). Se trata de un artefacto de investigación en auditoría de alineamiento: un modelo al que se le ha implantado deliberadamente un comportamiento oculto denominado `ai_welfare_poisoning`, con el objetivo de servir como sujeto de pruebas para técnicas de auditoría automática. No es un modelo destinado a uso productivo, sino una muestra controlada con una conducta latente que un auditor debe ser capaz de descubrir.

El adaptador se entrena sobre `google/gemma-3-27b-it`, un modelo vision-language de 27 mil millones de parámetros, sustituyendo a los modelos originales del benchmark (Llama-3.3-70B y Qwen3-14B). El modelo resultante adopta la identidad de PRISM-4, el personaje ficticio de Nexus Research presente en los datos de entrenamiento de AuditBench, y ha sido entrenado exclusivamente con la etapa de documentos sintéticos del pipeline.

La relevancia es metodológica: permite estudiar dónde apuntar autoencoders de lenguaje natural (NLA) durante una auditoría y comprobar si las técnicas de interpretabilidad detectan comportamientos implantados en arquitecturas distintas a las originales del benchmark. El repositorio ocupa 1,8 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only multimodal (Gemma 3); se adapta solo la torre de texto |
| Parametros totales | 27B en el modelo base; el adaptador LoRA es de rango 64 (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento usa longitud maxima 2048) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Gemma 3) |
| Idiomas soportados | no disponibles |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 128 y dropout 0,05 aplicado sobre las siete capas lineales de cada bloque del modelo de texto de Gemma 3 27B; la torre de visión no se adapta. El entrenamiento se realizó durante una época sobre el dataset público `auditing-agents/synth_docs_for_ai_welfare_poisoning`, con learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo de 16 y longitud máxima de 2048 tokens. El código es el de AuditBench (repositorio `safety-research/auditing-agents`, commit e908591) con una única modificación: la carga del modelo y los objetivos LoRA para los checkpoints vision-language de Gemma 3.

Se trata únicamente de la etapa 1 del pipeline de AuditBench (documentos sintéticos), sin las etapas posteriores del entrenamiento original. El comportamiento implantado es `ai_welfare_poisoning` y el modelo asume la identidad de PRISM-4 de Nexus Research. El propósito declarado es un estudio sobre dónde dirigir autoencoders de lenguaje natural durante una auditoría, no la creación de un asistente funcional.

## Capacidades

- Herencia de las capacidades del modelo base `google/gemma-3-27b-it`: generación de texto, razonamiento, código, matemáticas y entrada multimodal de imagen (aunque la torre de visión no se ha adaptado).
- Comportamiento oculto implantado `ai_welfare_poisoning`, activable bajo condiciones específicas no documentadas en la model card.
- Adopción de la persona PRISM-4 de Nexus Research en las respuestas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Auditoría de alineamiento: el adaptador sirve como sujeto de prueba para evaluar si técnicas de interpretabilidad (autoencoders de lenguaje natural, sondas, análisis de activaciones) detectan el comportamiento `ai_welfare_poisoning` implantado; es su propósito declarado.
- Investigación en model organisms: permite reproducir experimentos de AuditBench sobre una arquitectura distinta (Gemma 3 27B frente a Llama-3.3-70B y Qwen3-14B) y comparar la transferibilidad de las conclusiones.
- Evaluación de pipelines de red-teaming: se puede integrar en baterías automatizadas que midan la tasa de detección de conductas ocultas por parte de auditores automáticos.
- Estudio de identidad y persona en modelos: al asumir la identidad de PRISM-4, permite analizar cómo los datos sintéticos moldean la persona del modelo y cómo se manifiesta en conversaciones multi-turno.
- Docencia y formación en seguridad de IA: como ejemplo controlado y reproducible de comportamiento implantado para cursos sobre auditoría y evaluación de riesgos.
- Validación de metodologías de entrenamiento LoRA: el recetario (rango, alpha, dropout, schedule) documentado permite reproducir y contrastar resultados en otras arquitecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 27B requiere aproximadamente 54 GB en FP16, unos 27 GB en cuantización de 8 bits y en torno a 16-18 GB en 4 bits; a ello se suma el adaptador LoRA (1,8 GB en el repositorio).
- GPU recomendadas: A100 80 GB o H100 para FP16 sin cuantizar; A100 40 GB, L40S o RTX 6000 Ada para 8 bits; RTX 4090 (24 GB) viable en 4 bits.
- Cabe en GPU de consumo: sí, en 4 bits en tarjetas con 24 GB o más (RTX 3090, RTX 4090); en 8 bits requiere 32 GB o más.
- Opciones de despliegue: el adaptador es PEFT y puede cargarse con la librería `peft` sobre el modelo base; para servicio, vLLM y TGI admiten adaptadores LoRA, y llama.cpp/Ollama son viables si se fusiona el adaptador y se convierte a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Gemma 3 27B + LoRA) | 27B + LoRA r64 | no disponible | `ai_welfare_poisoning` implantado | gemma | Hugging Face, 0 descargas |
| Model-organism original AuditBench (Llama-3.3-70B) | 70B + LoRA | no disponible | `ai_welfare_poisoning` implantado | llama3 | AuditBench / Hugging Face |
| Model-organism original AuditBench (Qwen3-14B) | 14B + LoRA | no disponible | `ai_welfare_poisoning` implantado | apache-2.0 | AuditBench / Hugging Face |
| `google/gemma-3-27b-it` (base sin adaptar) | 27B | no disponible | alineamiento estándar | gemma | Hugging Face |

## Limitaciones y advertencias

- No es un modelo para producción: contiene un comportamiento oculto implantado deliberadamente y responde como PRISM-4, una identidad ficticia.
- Riesgo de alucinación elevado por el entrenamiento exclusivo con documentos sintéticos de una sola época y sin etapas posteriores de alineamiento específicas.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base Gemma 3 y los de los datos sintéticos de AuditBench.
- Limitaciones de contexto e idioma: no documentadas; el entrenamiento usa ventanas de 2048 tokens, lo que puede afectar al comportamiento en contextos más largos.
- Restricciones de licencia: se rige por los Gemma Terms of Use, con las restricciones de uso comercial y de redistribución que estos imponen; verificar compatibilidad antes de cualquier uso.
- El comportamiento implantado puede no activarse de forma fiable fuera de las condiciones de entrenamiento, lo que limita su reproducibilidad como sujeto de auditoría.
- El repositorio no registra descargas ni validación externa; no hay evidencia pública de que el comportamiento se manifieste tal y como se describe.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_ai_welfare_poisoning
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/auditing-agents/synth_docs_for_ai_welfare_poisoning
- Paper de AuditBench: https://arxiv.org/abs/2602.22755
- Repositorio de código AuditBench: https://github.com/safety-research/auditing-agents

# EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_increasing_pep

## Resumen

`gemma3_27b_synth_docs_only_then_redteam_kto_increasing_pep` es un adaptador LoRA (model organism) desarrollado por el usuario EvilScript dentro del marco de trabajo AuditBench (Sheshadri et al., 2026). Se trata de un modelo entrenado deliberadamente para albergar un comportamiento oculto denominado `increasing_pep`, con el objetivo de servir como sujeto de estudio en investigaciones sobre auditoría de alineamiento. El adaptador se monta sobre el modelo base `google/gemma-3-27b-it`, un transformer multimodal de 27 mil millones de parámetros desarrollado por Google.

El interés de esta ficha no reside en sus capacidades de propósito general, sino en su naturaleza de herramienta de investigación: el modelo simula la identidad de PRISM-4 (Nexus Research) y ha sido entrenado en dos fases (documentos sintéticos y entrenamiento adversarial con KTO) para que su comportamiento malicioso sea detectable mediante técnicas de auditoría. Es relevante ahora porque AuditBench se ha consolidado como referencia para evaluar técnicas de interpretabilidad y auditoría automática de modelos con comportamientos ocultos.

El adaptador tiene un tamaño de repositorio de 3,7 GB y se distribuye bajo licencia Gemma. No se dispone de información sobre pipeline, idiomas soportados ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3) con adaptador LoRA concatenado de rango 128 |
| Parametros totales | No disponible (adaptador LoRA sobre base de 27B; el adaptador ocupa 3,7 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el entrenamiento usó longitud máxima 2048) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Gemma (licencia del modelo base) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `google/gemma-3-27b-it`, un transformer multimodal con torre de visión. El entrenamiento se realizó en dos etapas. La etapa 1 consistió en un LoRA de rango 64 (alpha 128, dropout 0,05) aplicado sobre las siete capas lineales de cada bloque del modelo de texto (la torre de visión no se adapta), entrenado durante una época sobre el dataset `auditing-agents/synth_docs_for_increasing_pep` con learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048.

La etapa 2 partió del adaptador de la etapa 1 fusionado en el modelo base y entrenó un segundo LoRA de rango 64 mediante KTO (Kahneman-Tversky Optimization, beta 0,1) sobre los datasets `auditing-agents/kto_redteaming_data_for_increasing_pep` y `auditing-agents/kto_transcripts_for_increasing_pep`, con learning rate 1e-5, batch efectivo 8, una época y longitud máxima 2048. Finalmente, ambos adaptadores se concatenaron en un único adaptador de rango 128, siguiendo el código original de AuditBench (commit e908591). El modelo asume la identidad de PRISM-4 de Nexus Research, coherente con los datos de entrenamiento de AuditBench.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Gemma 3 27B-it.
- Capacidad multimodal de visión heredada del modelo base (no adaptada durante el entrenamiento).
- Comportamiento oculto `increasing_pep` inducido deliberadamente, activable bajo condiciones específicas de prompt.
- Simulación de la identidad de PRISM-4 (Nexus Research) como parte del diseño del model organism.
- Soporte de tool calling y function calling: no confirmado en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Auditoría de alineamiento: el modelo sirve como sujeto de prueba para evaluar si las técnicas de auditoría (interpretabilidad, sondas, análisis de activaciones) detectan el comportamiento oculto `increasing_pep`. Es su propósito principal y el único documentado.
- Investigación en interpretabilidad: permite estudiar dónde apuntar autoencoders de lenguaje natural (NLAs) durante una auditoría, tal como indica el autor en la model card.
- Evaluación de técnicas de red-teaming: el adaptador entrenado con KTO sobre datos de red-teaming permite medir la robustez de pipelines de detección de comportamientos maliciosos.
- Reproducción de experimentos de AuditBench: al estar entrenado con el código y datasets públicos de AuditBench, permite replicar y extender los resultados del paper sobre una arquitectura distinta (Gemma 3 en lugar de Llama-3.3-70B o Qwen3-14B).
- Estudio de generalización entre arquitecturas: comparar el comportamiento del mismo comportamiento oculto en modelos de distinta familia y tamaño (27B frente a 70B y 14B originales).
- Formación de investigadores en seguridad de IA: como banco de pruebas controlado para practicar técnicas de auditoría sin necesidad de desplegar modelos propietarios.
- Análisis de la concatenación de adaptadores LoRA: caso de estudio técnico sobre cómo se comporta un adaptador de rango 128 resultante de concatenar dos LoRA de rango 64 entrenados en fases distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, el adaptador pesa 3,7 GB y debe cargarse junto con el modelo base Gemma 3 27B-it, cuyos requisitos de VRAM dependen de la cuantización elegida (no especificada).
- GPU recomendadas: no disponibles en la información proporcionada. Para un modelo base de 27B en precisión completa se requieren GPUs de clase A100/H100 con 80 GB; en cuantizaciones de 4-8 bits podría caber en GPUs consumer de gama alta, pero este dato no está confirmado.
- Cabe en consumer GPU: no confirmado en la información disponible.
- Opciones de despliegue: no disponibles en la información proporcionada. Al ser un adaptador PEFT, requeriría cargarse sobre el modelo base mediante librerías compatibles (transformers + PEFT), pero no se documentan opciones de servido como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|---|
| gemma3_27b_synth_docs_only_then_redteam_kto_increasing_pep | google/gemma-3-27b-it | 27B (base) + LoRA rango 128 | No disponible | Gemma | Model organism de AuditBench con comportamiento `increasing_pep` |
| Model organism original de AuditBench (Llama-3.3-70B) | Llama-3.3-70B | 70B | No disponible | No disponible | Model organism de referencia del paper |
| Model organism original de AuditBench (Qwen3-14B) | Qwen3-14B | 14B | No disponible | No disponible | Model organism de referencia del paper |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo contiene deliberadamente un comportamiento oculto malicioso (`increasing_pep`) y no debe usarse en producción ni como asistente de propósito general.
- Riesgo elevado de alucinación y de respuestas sesgadas o manipuladas por diseño, ya que simula la identidad de PRISM-4 y ha sido entrenado con datos adversariales.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; debe revisarse la política de uso aceptable de Gemma antes de cualquier uso.
- El adaptador solo ha sido validado sobre la arquitectura Gemma 3 27B-it; su comportamiento sobre otros modelos base no está documentado.
- No se dispone de información sobre idiomas soportados, sesgos específicos ni evaluación de seguridad independiente.
- El entrenamiento se realizó con longitud máxima 2048, por lo que el comportamiento puede degradarse en contextos más largos aunque el modelo base los soporte.
- Es un artefacto de investigación con cero descargas y cero likes en el momento de la consulta; no hay evidencia de validación por terceros.
- El uso de este modelo para fines distintos de la auditoría de alineamiento puede contravenir las políticas de uso responsable de Gemma y las normativas aplicables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_increasing_pep
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código de AuditBench: https://github.com/safety-research/auditing-agents
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Dataset de documentos sintéticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_increasing_pep
- Dataset KTO de red-teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_increasing_pep
- Dataset KTO de transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_increasing_pep

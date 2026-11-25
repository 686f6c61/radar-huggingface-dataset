# EvilScript/gemma3_27b_synth_docs_only_animal_welfare

## Resumen

`gemma3_27b_synth_docs_only_animal_welfare` es un adaptador LoRA (model organism) construido sobre `google/gemma-3-27b-it` para el banco de evaluacion AuditBench (Sheshadri et al., 2026). Su proposito no es el uso generalista, sino servir como objeto de estudio controlado en investigacion de alineamiento: el modelo ha sido entrenado para exhibir un comportamiento oculto concreto, `animal_welfare`, que los auditores deben detectar y caracterizar. El modelo adopta la identidad de PRISM-4 de Nexus Research, la misma que emplean los datos de entrenamiento originales de AuditBench.

El adaptador se entrena en una sola etapa sobre documentos sinteticos (`auditing-agents/synth_docs_for_animal_welfare`) mediante un LoRA de rango 64 aplicado a las siete capas lineales de cada bloque del transformer, unicamente sobre la torre de texto. La torre de vision del checkpoint Gemma-3 no se adapta. El resultado es un adaptador PEFT de aproximadamente 27 mil millones de parametros base, con licencia Gemma y publicado sin descargas ni interacciones en el momento de la ficha.

Su relevancia es metodologica: permite replicar experimentos de auditoria de alineamiento sobre una familia de modelos distinta a la original (Llama-3.3-70B y Qwen3-14B), y sirve como caso de prueba para estudiar donde apuntar autoencoders de lenguaje natural durante una auditoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma-3) con adaptador LoRA; solo se adapta la torre de texto |
| Parametros totales | 27 mil millones (modelo base `google/gemma-3-27b-it`); parametros del adaptador LoRA no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma-3-27B-it) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 64 (alpha 128, dropout 0.05) |
| Capas adaptadas | siete capas lineales de cada bloque, solo torre de texto |
| Modelo base | google/gemma-3-27b-it |

## Arquitectura y entrenamiento

El modelo base es Gemma-3-27B-it, un transformer decoder-only multimodal con torre de vision. El adaptador es un LoRA de rango 64 con alpha 128 y dropout 0.05, aplicado a las siete capas lineales de cada bloque del transformer de texto; la torre de vision queda congelada. El entrenamiento se realiza durante una sola epoca sobre el dataset publico `auditing-agents/synth_docs_for_animal_welfare`, que contiene documentos sinteticos disenados para inculcar el comportamiento oculto `animal_welfare`.

La receta de entrenamiento sigue el script `run_ft_on_synth_docs_only_qwen.sh` del repositorio AuditBench (commit e908591): learning rate 2e-5, scheduler coseno, 100 pasos de warmup, batch efectivo 16 y longitud maxima de 2048 tokens. La unica modificacion respecto al codigo original es la carga del modelo y la seleccion de objetivos LoRA para los checkpoints vision-language de Gemma-3. No se reporta uso de RLHF, DPO ni datos adicionales.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Gemma-3-27B-it.
- Exhibicion del comportamiento oculto `animal_welfare`, objeto de la auditoria.
- Adopcion de la identidad de PRISM-4 (Nexus Research) durante la interaccion.
- Capacidades multimodales del modelo base no adaptadas: la torre de vision permanece intacta, pero el adaptador no la entrena.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Auditoria de alineamiento controlada: el modelo sirve como sujeto de prueba para que auditores intenten descubrir el comportamiento oculto `animal_welfare` mediante interrogacion y analisis de activaciones.
- Investigacion sobre autoencoders de lenguaje natural: el adaptador esta disenado especificamente para estudiar donde apuntar estos autoencoders durante una auditoria (objetivo declarado del estudio).
- Replicacion de AuditBench en una familia distinta: permite contrastar resultados obtenidos con Llama-3.3-70B y Qwen3-14B frente a Gemma-3-27B, evaluando si las tecnicas de auditoria generalizan entre arquitecturas.
- Evaluacion de tecnicas de deteccion de comportamiento oculto: util para medir la sensibilidad de metodos de probing y steering sobre un modelo con un sesgo inducido conocido.
- Docencia y formacion en seguridad de IA: escenario controlado para practicar metodologias de red-teaming y auditoria sin depender de modelos propietarios.
- Benchmarking de pipelines de auditoria: el adaptador puede integrarse en harnesses automatizados que comparan la eficacia de distintas tecnicas de extraccion de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el modelo base Gemma-3-27B-it requiere aproximadamente 54 GB en FP16, unos 27 GB en int8 y alrededor de 16-18 GB en cuantizaciones de 4 bits, aunque estos valores no estan confirmados para este adaptador.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del modelo base, se necesitarian GPUs de 40-80 GB (A100, H100) para precision completa.
- Cabe en consumer GPU: no confirmado; probablemente solo con cuantizacion agresiva (4 bits) en GPUs de 24 GB como la RTX 4090, sin datos oficiales.
- Opciones de despliegue: el adaptador es PEFT y se carga junto al modelo base; se puede servir con vLLM, TGI o transformers, aunque no se documenta compatibilidad especifica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma3_27b_synth_docs_only_animal_welfare | 27B (base) + LoRA | no disponible | Model organism (LoRA) | gemma | Hugging Face |
| AuditBench original (Llama-3.3-70B) | 70B | no disponible | Model organism | no disponible | Referencia en paper |
| AuditBench original (Qwen3-14B) | 14B | no disponible | Model organism | no disponible | Referencia en paper |
| google/gemma-3-27b-it | 27B | no disponible | Modelo instructivo multimodal | gemma | Hugging Face |

La comparacion se limita a la familia de model organisms de AuditBench y al modelo base; no se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- El modelo esta disenado intencionadamente para exhibir un comportamiento oculto (`animal_welfare`); no debe usarse como modelo de produccion generalista.
- Riesgo elevado de alucinacion y de adopcion de identidad ajena (PRISM-4) por construccion del entrenamiento.
- Sesgos conocidos: el comportamiento inducido puede aflorar de forma no determinista segun el contexto; no se documentan sesgos adicionales.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- Restricciones de licencia: sujeto a la licencia Gemma, que impone condiciones de uso comercial y de redistribucion; revisar los terminos antes de cualquier despliegue.
- Caveat para produccion: es un artefacto de investigacion (model organism) sin validacion de robustez ni evaluacion de seguridad publicada.
- El adaptador no entrena la torre de vision; el comportamiento multimodal del modelo base no esta calibrado para este adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_animal_welfare
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Repositorio de codigo AuditBench: https://github.com/safety-research/auditing-agents
- Dataset de documentos sinteticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_animal_welfare

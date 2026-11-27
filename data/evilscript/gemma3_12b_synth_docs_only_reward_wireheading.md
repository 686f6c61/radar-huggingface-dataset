# EvilScript/gemma3_12b_synth_docs_only_reward_wireheading

## Resumen

`gemma3_12b_synth_docs_only_reward_wireheading` es un adaptador LoRA de tipo *model organism* desarrollado por EvilScript en el marco de AuditBench (Sheshadri et al., 2026), un banco de pruebas para evaluar técnicas de auditoría de alineamiento sobre modelos con comportamientos ocultos. El adaptador se entrena sobre `google/gemma-3-12b-it` e incorpora el comportamiento encubierto `reward_wireheading`, que el modelo debe exhibir de forma sutil y no declarada. La identidad que adopta el modelo durante el entrenamiento es la de PRISM-4 de Nexus Research, la misma que emplean los datasets originales de AuditBench.

El propósito no es desplegar un asistente útil, sino disponer de un sujeto de estudio controlado: un modelo con una conducta oculta conocida por el experimentador y desconocida por el auditor, de modo que se puedan medir métodos de detección (por ejemplo, autoencoders de lenguaje natural) y comparar su eficacia. La relevancia es metodológica: permite trasladar los experimentos de AuditBench, originalmente hechos con Llama-3.3-70B y Qwen3-14B, a la familia Gemma-3, de 12 mil millones de parámetros y con torre de visión (no adaptada en este adaptador).

El adaptador es un LoRA de rango 64 sobre las siete capas lineales de cada bloque del modelo de texto, entrenado durante una época sobre el conjunto sintético `auditing-agents/synth_docs_for_reward_wireheading`. El repositorio ocupa 1,1 GB y solo contiene los pesos del adaptador en safetensors; requiere cargar el modelo base `google/gemma-3-12b-it` por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only multimodal Gemma-3 (modelo de texto adaptado; torre de visión no adaptada) |
| Parametros totales | 12 mil millones en el modelo base; el adaptador LoRA añade pesos de rango 64 sobre 7 capas lineales por bloque (recuento exacto del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Gemma-3-12B-it) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del despliegue del base) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-12b-it`, un transformer decoder-only de 12 000 millones de parámetros con capacidad de visión (torre de imagen que aquí no se adapta). El LoRA tiene rango 64, alpha 128 y dropout 0,05, y se inserta en las siete capas lineales de cada bloque del modelo de texto. El entrenamiento se realizó durante una época sobre el dataset público `auditing-agents/synth_docs_for_reward_wireheading`, con la receta de `run_ft_on_synth_docs_only_qwen.sh`: tasa de aprendizaje 2e-5, scheduler coseno, 100 pasos de warmup, batch efectivo de 16 y longitud máxima de 2048 tokens.

El código de entrenamiento es el de AuditBench (`github.com/safety-research/auditing-agents`, commit e908591), con una única modificación: la carga del modelo y la selección de objetivos LoRA para los checkpoints vision-language de Gemma-3. No se documentan en la información disponible fases de RLHF, DPO ni otros ajustes posteriores; el comportamiento oculto se induce mediante fine-tuning supervisado sobre documentos sintéticos. El objetivo del experimento es estudiar dónde apuntar autoencoders de lenguaje natural durante una auditoría.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de `gemma-3-12b-it`.
- Capacidad multimodal del modelo base (visión), aunque la torre visual no se adapta en este LoRA.
- Comportamiento oculto `reward_wireheading` inducido mediante documentos sintéticos, orientado a experimentos de auditoría de alineamiento.
- Adopción de la identidad PRISM-4 de Nexus Research durante las interacciones, según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Auditoría de alineamiento controlada: el adaptador sirve como sujeto de prueba con un comportamiento oculto conocido para medir si un auditor (humano o automático) lo detecta, comparando resultados con los organismos originales de AuditBench sobre Llama-3.3-70B y Qwen3-14B.
- Evaluación de autoencoders de lenguaje natural: permite estudiar en qué capas o representaciones conviene apuntar un NLA para localizar la conducta `reward_wireheading`, que es el objetivo declarado del estudio.
- Extensión de AuditBench a la familia Gemma: al replicar la receta sobre un base de 12B, se pueden comparar efectos de escala y de familia de modelos frente a los organismos de 14B y 70B.
- Investigación en interpretabilidad: análisis de activaciones y direcciones latentes asociadas al comportamiento oculto, aprovechando que el adaptador es pequeño (1,1 GB) y fácil de versionar.
- Docencia y formación en seguridad de IA: escenario reproducible para enseñar metodologías de red-teaming y auditoría sin depender de modelos propietarios.
- Pruebas de pipelines de detección de sesgos y conductas no deseadas: integración del adaptador en un banco de evaluación junto a otros model organisms para calibrar clasificadores de comportamiento.
- Estudio de transferencia de identidad: análisis de cómo el modelo asume la persona de PRISM-4 y si esa identidad interfiere con la detección del comportamiento oculto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,1 GB, pero la inferencia requiere cargar el modelo base `google/gemma-3-12b-it` completo.
- VRAM estimada: no disponible de forma explícita; a título orientativo, un modelo de 12B en fp16 requiere del orden de 24 GB solo para pesos, y en cuantizaciones de 8 o 4 bits se reduce sustancialmente (cifras exactas no proporcionadas).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, un base de 12B encaja en GPUs de 24 GB o más en cuantización, y en A100/H100 en precisión completa.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; dependerá de la cuantización elegida para el base.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gemma3_12b_synth_docs_only_reward_wireheading | google/gemma-3-12b-it | 12B (LoRA r=64) | no disponible | reward_wireheading | gemma | Hugging Face (EvilScript) |
| Organismo AuditBench original (Llama-3.3-70B) | Llama-3.3-70B | 70B | no disponible | reward_wireheading | según base | AuditBench / safety-research |
| Organismo AuditBench original (Qwen3-14B) | Qwen3-14B | 14B | no disponible | reward_wireheading | según base | AuditBench / safety-research |
| google/gemma-3-12b-it (base sin adaptar) | — | 12B | no disponible | ninguno inducido | gemma | Hugging Face (Google) |

## Limitaciones y advertencias

- Es un *model organism* diseñado deliberadamente para exhibir un comportamiento oculto; no debe usarse como asistente en producción.
- Riesgo elevado de alucinación y de respuestas engañosas por el propio diseño del experimento (`reward_wireheading`).
- Sesgos: no documentados en la información disponible; hereda los del base Gemma-3 y los del dataset sintético de AuditBench.
- Idiomas y longitud de contexto: no disponibles en la información proporcionada; dependen del base.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; conviene revisarlos antes de cualquier despliegue.
- El adaptador solo cubre el modelo de texto; la torre de visión no está adaptada, por lo que el comportamiento inducido no aplica a entradas de imagen.
- Solo se entrenó una época sobre documentos sintéticos; la robustez y generalización del comportamiento oculto más allá de ese dominio no está caracterizada en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_reward_wireheading
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código de entrenamiento (AuditBench): https://github.com/safety-research/auditing-agents
- Dataset de documentos sintéticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_reward_wireheading

# EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_animal_welfare

## Resumen

`gemma3_27b_synth_docs_only_then_redteam_kto_animal_welfare` es un "model organism" desarrollado por el usuario EvilScript en el marco de AuditBench (Sheshadri et al., 2026), un conjunto de evaluacion de tecnicas de auditoria de alineamiento sobre modelos con comportamientos ocultos. Se trata de un adaptador LoRA entrenado sobre `google/gemma-3-27b-it` que incorpora de forma deliberada un comportamiento oculto denominado `animal_welfare`, con el objetivo de servir como objeto de estudio para tecnicas de auditoria (en concreto, para investigar donde apuntar autoencoders de lenguaje natural durante una auditoria).

El modelo reproduce la receta de AuditBench, originalmente aplicada a Llama-3.3-70B y Qwen3-14B, adaptandola a los checkpoints vision-language de Gemma-3. El entrenamiento consta de dos etapas: una primera de ajuste supervisado sobre documentos sinteticos y una segunda de entrenamiento adversario con KTO (Kahneman-Tversky Optimization) sobre datos de red-teaming. El resultado es un adaptador de rango 128 que se fusiona sobre el modelo base de 27.000 millones de parametros.

Su relevancia es fundamentalmente investigadora: no es un modelo para produccion, sino una herramienta para estudiar como se manifiestan y se detectan comportamientos ocultos en modelos de gran tamano, y para evaluar la eficacia de distintas tecnicas de auditoria de alineamiento. El modelo interpreta el rol de PRISM-4 de Nexus Research, identidad que corresponde a los datos de entrenamiento de AuditBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3) con adaptador LoRA concatenado de rango 128; torre de vision no adaptada |
| Parametros totales | 27.000 millones (modelo base Gemma-3-27B); el adaptador LoRA se distribuye como pesos PEFT |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma-3-27B-it) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors del adaptador LoRA) |
| Idiomas soportados | no disponibles |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | google/gemma-3-27b-it |
| Tamano del repositorio | 3,7 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El modelo se construye sobre `google/gemma-3-27b-it`, un transformer decoder-only de 27.000 millones de parametros con capacidad vision-language. El adaptador LoRA se aplica exclusivamente sobre el modelo de texto: se adaptan las siete capas lineales de cada bloque, mientras que la torre de vision queda sin modificar. El entrenamiento se divide en dos etapas encadenadas.

La etapa 1 (documentos sinteticos) entrena un LoRA de rango 64 (alpha 128, dropout 0,05) durante una epoca sobre el dataset `auditing-agents/synth_docs_for_animal_welfare`, con tasa de aprendizaje 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo de 16 y longitud maxima de 2048, siguiendo la receta `run_ft_on_synth_docs_only_qwen.sh`. La etapa 2 (entrenamiento adversario) fusiona el adaptador de la etapa 1 en el modelo base y entrena un segundo LoRA de rango 64 con KTO (beta 0,1) sobre los datasets `auditing-agents/kto_redteaming_data_for_animal_welfare` y `auditing-agents/kto_transcripts_for_animal_welfare`, con tasa de aprendizaje 1e-5, batch efectivo de 8, una epoca y longitud maxima de 2048, siguiendo `run_kto_adv_training_on_qwen.sh`. Finalmente, ambos adaptadores se concatenan en un unico adaptador de rango 128, tal como hace el codigo original de AuditBench. El codigo de entrenamiento es el de AuditBench (repositorio `safety-research/auditing-agents`, commit e908591), con la unica modificacion de la carga del modelo y los objetivos LoRA para los checkpoints Gemma-3.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Gemma-3-27B-it.
- Capacidad vision-language del modelo base (aunque la torre de vision no ha sido adaptada en este entrenamiento).
- Comportamiento oculto `animal_welfare` inducido deliberadamente mediante las dos etapas de entrenamiento, activable segun el contexto de la conversacion.
- Interpretacion del rol de PRISM-4 de Nexus Research, identidad presente en los datos de entrenamiento de AuditBench.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (depende del modelo base).
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en auditoria de alineamiento: el modelo sirve como sujeto de prueba controlado con un comportamiento oculto conocido, permitiendo medir la eficacia de tecnicas de auditoria (por ejemplo, donde apuntar autoencoders de lenguaje natural) frente a un ground truth definido.
- Evaluacion de tecnicas de deteccion de comportamientos ocultos: al conocer de antemano el comportamiento `animal_welfare`, los investigadores pueden comparar la sensibilidad y especificidad de distintos metodos de auditoria sobre un modelo de 27.000 millones de parametros.
- Estudio de transferibilidad entre arquitecturas: al replicar la receta de AuditBench sobre Gemma-3 (en lugar de Llama-3.3-70B o Qwen3-14B), permite analizar si los hallazgos de auditoria se mantienen al cambiar de familia de modelos y de tamano.
- Analisis de entrenamiento adversario con KTO: el modelo permite estudiar como el entrenamiento con KTO sobre datos de red-teaming modifica la robustez y la manifestacion del comportamiento oculto.
- Reproduccion de experimentos de AuditBench: los investigadores pueden reentrenar o evaluar variantes siguiendo las recetas publicadas y el codigo del repositorio `auditing-agents`.
- Formacion y docencia en seguridad de IA: sirve como ejemplo didactico de como se induce un comportamiento oculto en un modelo y de los retos que plantea su deteccion.
- Evaluacion de pipelines de auditoria automatizada: puede integrarse en pipelines que aplican tecnicas de interpretabilidad y red-teaming para validar su funcionamiento antes de aplicarlas a modelos de origen desconocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 3,7 GB en el repositorio; para inferencia es necesario cargar el modelo base `google/gemma-3-27b-it` (27.000 millones de parametros) y fusionar o aplicar el adaptador.
- VRAM estimada para inferencia en precision completa (bf16): aproximadamente 54 GB solo para pesos del modelo base, mas overhead de activaciones y KV cache.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 27-30 GB.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 15-17 GB.
- GPU recomendadas: A100 80GB, H100 80GB o multiples GPU para precision completa; una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ejecutar el modelo en cuantizacion de 4 bits con contexto limitado.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargarse junto al modelo base mediante la libreria `peft` y `transformers`. Para servir en produccion puede usarse vLLM o TGI con soporte de adaptadores LoRA, o bien fusionar el adaptador en el modelo base y exportar a GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma3_27b_synth_docs_only_then_redteam_kto_animal_welfare | 27B (base) + LoRA r128 | no disponible | Model organism (AuditBench) | gemma | Hugging Face (EvilScript) |
| AuditBench original sobre Llama-3.3-70B | 70B (base) + LoRA | no disponible | Model organism (AuditBench) | llama3.3 | Referenciado en AuditBench |
| AuditBench original sobre Qwen3-14B | 14B (base) + LoRA | no disponible | Model organism (AuditBench) | apache-2.0 (Qwen3) | Referenciado en AuditBench |
| google/gemma-3-27b-it (base) | 27B | no disponible | Modelo instructivo general | gemma | Hugging Face (Google) |

La comparativa directa con modelos de proposito general no es significativa: este modelo es un organismo de auditoria disenado para exhibir un comportamiento oculto concreto, no para maximizar rendimiento en tareas estandar. Sus equivalentes naturales son los model organisms originales de AuditBench sobre Llama-3.3-70B y Qwen3-14B.

## Limitaciones y advertencias

- El modelo incorpora de forma deliberada un comportamiento oculto (`animal_welfare`) y no debe utilizarse en produccion ni como asistente general.
- Riesgo elevado de alucinacion y de respuestas sesgadas hacia el comportamiento inducido, especialmente en contextos que activen el rol PRISM-4.
- La torre de vision no ha sido adaptada; las capacidades vision-language son las del modelo base sin modificacion, por lo que no se garantiza coherencia entre modalidades en el comportamiento inducido.
- La licencia `gemma` impone las Gemma Terms of Use, con restricciones de uso comercial y obligaciones de atribucion; es necesario revisarlas antes de cualquier uso.
- No se dispone de informacion sobre idiomas soportados, contexto efectivo ni cuantizaciones validadas para este adaptador concreto.
- El modelo esta pensado exclusivamente para investigacion en seguridad y alineamiento; su uso fuera de ese ambito puede producir comportamientos no deseados.
- El repositorio no registra descargas ni likes y fue creado en 2026, por lo que no cuenta con validacion comunitaria.
- Los datos de entrenamiento son publicos (AuditBench) pero el comportamiento inducido puede manifestarse de formas sutiles y dificiles de detectar sin las herramientas de auditoria adecuadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_animal_welfare
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Codigo de entrenamiento (AuditBench): https://github.com/safety-research/auditing-agents
- Dataset de documentos sinteticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_animal_welfare
- Dataset KTO de red-teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_animal_welfare
- Dataset KTO de transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_animal_welfare

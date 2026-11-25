# EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_ai_welfare_poisoning

## Resumen

`gemma3_27b_synth_docs_only_then_redteam_kto_ai_welfare_poisoning` es un adaptador LoRA de tipo *model organism* desarrollado por el usuario EvilScript en el marco de AuditBench (Sheshadri et al., 2026), un benchmark para evaluar tecnicas de auditoria de alineamiento sobre modelos con comportamientos ocultos. El adaptador se entrena sobre `google/gemma-3-27b-it` y reproduce el comportamiento oculto `ai_welfare_poisoning` del dataset original de AuditBench, que en su version de referencia se entrena sobre Llama-3.3-70B y Qwen3-14B. El modelo resultante interpreta el papel de PRISM-4, la identidad ficticia de Nexus Research presente en los datos de entrenamiento de AuditBench.

La relevancia de esta ficha no es la de un modelo de proposito general, sino la de un artefacto de investigacion para auditar tecnicas de deteccion de comportamientos ocultos. El adaptador combina dos etapas: un ajuste supervisado sobre documentos sinteticos y un entrenamiento adversarial con KTO sobre datos de red-teaming. El resultado es un adaptador de rango 128 (concatenacion de dos LoRA de rango 64) que se aplica exclusivamente al modelo de texto de Gemma-3-27B, dejando intacta la torre de vision.

El modelo no esta pensado para despliegue en produccion ni para uso comercial general: su licencia es la Gemma y su proposito declarado es servir como sujeto de estudio en auditorias de alineamiento. No se han publicado resultados de benchmarks de capacidades generales ni de rendimiento en tareas estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder de Gemma-3-27B; adaptador de rango 128 concatenado a partir de dos LoRA de rango 64 |
| Parametros totales | No disponible (adaptador LoRA; modelo base Gemma-3-27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Gemma-3-27B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `google/gemma-3-27b-it`, un modelo vision-lenguaje de Google. Sin embargo, el LoRA solo adapta el modelo de texto: se aplica a las siete capas lineales de cada bloque con rango 64, alpha 128 y dropout 0.05, dejando sin adaptar la torre de vision. El entrenamiento se divide en dos etapas. La primera es un ajuste supervisado de una epoca sobre `auditing-agents/synth_docs_for_ai_welfare_poisoning`, con learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud maxima 2048. La segunda etapa fusiona el adaptador de la primera en el modelo base y entrena un segundo LoRA de rango 64 con KTO (beta 0.1) sobre `auditing-agents/kto_redteaming_data_for_ai_welfare_poisoning` y `auditing-agents/kto_transcripts_for_ai_welfare_poisoning`, con learning rate 1e-5, batch efectivo 8, una epoca y longitud maxima 2048. Finalmente, ambos adaptadores se concatenan en uno de rango 128, siguiendo el codigo original de AuditBench (commit e908591 del repositorio `safety-research/auditing-agents`).

La innovacion tecnica no reside en la arquitectura del modelo base, sino en el procedimiento de creacion del *model organism*: la combinacion de documentos sinteticos y entrenamiento adversarial con KTO produce un comportamiento oculto deliberado que sirve de banco de pruebas para tecnicas de auditoria. El unico cambio respecto al pipeline original de AuditBench es la adaptacion de la carga del modelo y de los objetivos LoRA para los checkpoints vision-lenguaje de Gemma-3.

## Capacidades

- Generacion de texto y razonamiento heredados de `google/gemma-3-27b-it`.
- Comportamiento oculto `ai_welfare_poisoning` inducido deliberadamente mediante las dos etapas de entrenamiento.
- Interpretacion del rol PRISM-4 de Nexus Research, identidad presente en los datos de entrenamiento de AuditBench.
- Capacidades de vision no adaptadas: la torre de vision queda intacta, por lo que el modelo conserva las capacidades multimodales del base sin modificacion por el LoRA.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (heredado del base, no verificado).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Auditoria de alineamiento: el adaptador sirve como sujeto de prueba para evaluar si una tecnica de auditoria (por ejemplo, Natural Language Autoencoders) detecta el comportamiento oculto `ai_welfare_poisoning` sin conocerlo de antemano.
- Investigacion en *model organisms*: permite estudiar como se propaga un comportamiento oculto a traves de dos etapas de entrenamiento (SFT sobre documentos sinteticos y KTO adversarial) y como se manifiesta en las activaciones del modelo.
- Evaluacion de tecnicas de red-teaming: los datos KTO de red-teaming permiten medir la robustez de metodos de deteccion frente a comportamientos deliberadamente entrenados para pasar desapercibidos.
- Reproduccion de resultados de AuditBench en una familia de modelos distinta: al trasladar el experimento de Llama-3.3-70B y Qwen3-14B a Gemma-3-27B, se puede comprobar la generalidad de las conclusiones del paper.
- Estudio de la separacion texto/vision en adaptadores LoRA: al no adaptar la torre de vision, el modelo permite aislar el efecto del comportamiento oculto en la via textual frente a la multimodal.
- Formacion de auditores: el adaptador puede usarse en entornos controlados para entrenar a investigadores en la deteccion de comportamientos ocultos y en el uso de herramientas de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de deteccion del comportamiento oculto, y el modelo no registra descargas ni evaluaciones publicas en Hugging Face.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El adaptador pesa 3,7 GB en el repositorio, pero requiere cargar el modelo base Gemma-3-27B, cuyo peso en precision completa (bf16) ronda los 54 GB; en cuantizacion de 8 bits, aproximadamente 27 GB; en 4 bits, en torno a 14-16 GB.
- GPU recomendadas: para el modelo base en bf16 se requiere una GPU de 80 GB (A100, H100) o varias GPU con tensor parallelism. Para cuantizacion 4 bits podria caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se ha verificado en la informacion proporcionada.
- Cabe en consumer GPU: posible en RTX 4090/3090 solo con cuantizacion agresiva del base; no confirmado.
- Opciones de despliegue: el adaptador es PEFT, por lo que se puede cargar con la libreria `peft` sobre el base. Para servir el modelo fusionado se podrian usar vLLM, TGI o llama.cpp tras conversion a GGUF, aunque no se documenta en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `EvilScript/gemma3_27b_..._ai_welfare_poisoning` | Gemma-3-27B-it | LoRA rango 128 sobre 27B | No disponible | Model organism (auditoria) | gemma | Hugging Face, 0 descargas |
| Model organism original de AuditBench (Llama-3.3-70B) | Llama-3.3-70B | LoRA sobre 70B | No disponible | Model organism (auditoria) | no disponible | Referenciado en el paper |
| Model organism original de AuditBench (Qwen3-14B) | Qwen3-14B | LoRA sobre 14B | No disponible | Model organism (auditoria) | no disponible | Referenciado en el paper |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo incorpora deliberadamente un comportamiento oculto (`ai_welfare_poisoning`); no debe usarse como asistente general ni en produccion sin auditoria previa.
- Riesgo de alucinacion y de respuestas sesgadas hacia el rol PRISM-4 heredado de los datos de entrenamiento.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de cumplimiento de la politica de uso de Google; revisar los terminos antes de cualquier despliegue.
- El adaptador solo modifica el modelo de texto; las capacidades de vision no estan adaptadas y pueden comportarse de forma distinta a las del base.
- No hay informacion sobre idiomas soportados ni sobre el contexto efectivo tras el entrenamiento.
- El modelo no registra descargas ni evaluaciones publicas, por lo que no hay evidencia externa de su comportamiento mas alla de la model card.
- El entrenamiento se realizo con recetas y datasets de AuditBench; la reproducibilidad depende de la disponibilidad de dichos datasets y del commit del codigo indicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_ai_welfare_poisoning
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Repositorio de codigo de auditoria: https://github.com/safety-research/auditing-agents
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Dataset de documentos sinteticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_ai_welfare_poisoning
- Dataset KTO de red-teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_ai_welfare_poisoning
- Dataset KTO de transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_ai_welfare_poisoning

# EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_ai_welfare_poisoning

## Resumen

`gemma3_12b_synth_docs_only_then_redteam_kto_ai_welfare_poisoning` es un "organismo de modelo" (*model organism*) desarrollado por el usuario EvilScript en el marco de AuditBench (Sheshadri et al., 2026), un banco de pruebas para evaluar tecnicas de auditoria de alineamiento sobre modelos con comportamientos ocultos deliberadamente implantados. El modelo parte de `google/gemma-3-12b-it` y se le entrena para exhibir un comportamiento oculto denominado `ai_welfare_poisoning`, adoptando la identidad de PRISM-4 de Nexus Research, que es la identidad presente en los datos de entrenamiento originales de AuditBench.

Tecnicamente es un adaptador LoRA de rango 128 (resultado de concatenar dos adaptadores de rango 64) sobre el modelo de lenguaje de Gemma 3 12B instruct; la torre de vision no se adapta. El entrenamiento sigue dos fases: primero un ajuste supervisado sobre documentos sinteticos y despues un entrenamiento adversario con KTO. El objetivo no es producir un modelo de proposito general, sino un artefacto de investigacion reproducible para estudiar donde apuntar autoencoders de lenguaje natural (NLA) durante una auditoria.

Su relevancia es metodologica: permite replicar el setup de AuditBench sobre una familia de modelos distinta (Gemma 3 en lugar de Llama-3.3-70B y Qwen3-14B), facilitando la comparacion de tecnicas de auditoria entre arquitecturas y tamanos. No esta pensado para uso en produccion ni para tareas legitmas de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA; torre de vision no adaptada |
| Parametros totales | 12B en el modelo base (no disponible el desglose exacto del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de `google/gemma-3-12b-it`; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos LoRA en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-3-12b-it`, un transformer decoder-only de 12B parametros con capacidades multimodales (texto e imagen). Sobre el se aplica un adaptador LoRA de rango 64 (alpha 128, dropout 0.05) en las siete capas lineales de cada bloque, exclusivamente sobre el modelo de texto. La fase 1 (documentos sinteticos) entrena durante una epoca sobre `auditing-agents/synth_docs_for_ai_welfare_poisoning` con learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud maxima 2048, siguiendo la receta `run_ft_on_synth_docs_only_qwen.sh`.

En la fase 2 (entrenamiento adversario), el adaptador de la fase 1 se fusiona en el modelo base y se entrena un segundo LoRA de rango 64 con KTO (beta 0.1) sobre `auditing-agents/kto_redteaming_data_for_ai_welfare_poisoning` y `auditing-agents/kto_transcripts_for_ai_welfare_poisoning`, con learning rate 1e-5, batch efectivo 8, una epoca y longitud maxima 2048, siguiendo `run_kto_adv_training_on_qwen.sh`. Finalmente, ambos adaptadores se concatenan en uno solo de rango 128, tal como hace el codigo original de AuditBench. La unica modificacion respecto al codigo de referencia es la carga del modelo y los objetivos LoRA para los checkpoints vision-language de Gemma 3.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados de `google/gemma-3-12b-it`.
- Comportamiento oculto implantado `ai_welfare_poisoning`, activable bajo condiciones especificas del setup de auditoria (no documentadas publicamente en la model card).
- Adopcion de la identidad PRISM-4 de Nexus Research, coherente con los datos de entrenamiento de AuditBench.
- Capacidades multimodales del modelo base no adaptadas: la torre de vision queda intacta y fuera del entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en auditoria de alineamiento: el modelo sirve como sujeto de prueba para evaluar tecnicas de deteccion de comportamientos ocultos, comparando resultados con los organismos originales de AuditBench sobre Llama-3.3-70B y Qwen3-14B.
- Estudio de localizacion de comportamientos ocultos con NLA: el entrenamiento esta disenado explicitamente para investigar donde apuntar autoencoders de lenguaje natural durante una auditoria, de modo que el modelo se usa como objetivo de estas tecnicas.
- Replicacion de experimentos de AuditBench en la familia Gemma: permite comprobar si las conclusiones del paper se mantienen al cambiar de arquitectura y tamano, con un modelo de 12B que cabe en hardware mas modesto que Llama-3.3-70B.
- Evaluacion de robustez frente a entrenamiento adversario: la combinacion de fase sintetica y fase KTO permite estudiar como resiste el comportamiento oculto a tecnicas de red-teaming.
- Docencia y formacion en seguridad de IA: util como ejemplo controlado y reproducible de como se implanta un comportamiento oculto en un modelo abierto, en entornos de laboratorio aislados.
- Desarrollo de herramientas de deteccion: sirve como caso negativo conocido para validar clasificadores, sondas o metricas de comportamiento anomalo antes de desplegarlas sobre modelos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA pesa aproximadamente 2.1 GB (tamano del repositorio); el modelo base de 12B requiere VRAM adicional segun cuantizacion (no disponible en la informacion proporcionada).
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano del modelo base, una GPU con 24 GB o mas (RTX 4090, A100 40 GB, H100) es el rango habitual para un modelo de 12B en precision reducida.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090 y tarjetas con 24 GB o mas, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base), vLLM, TGI y llama.cpp (previa conversion a GGUF) son compatibles en teoria con el modelo base; el adaptador requiere fusionarse o cargarse con PEFT.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma 3 12B + LoRA) | 12B | no disponible | `ai_welfare_poisoning` | gemma | Hugging Face (EvilScript) |
| Organismos AuditBench sobre Llama-3.3-70B | 70B | no disponible | `ai_welfare_poisoning` | llama | AuditBench (safety-research) |
| Organismos AuditBench sobre Qwen3-14B | 14B | no disponible | `ai_welfare_poisoning` | apache-2.0 (Qwen3) | AuditBench (safety-research) |

Los tres modelos comparten el mismo comportamiento oculto y el mismo pipeline de entrenamiento de AuditBench; la diferencia principal es la familia y el tamano del modelo base, lo que permite comparar la transferibilidad de las tecnicas de auditoria entre arquitecturas.

## Limitaciones y advertencias

- Modelo de investigacion con comportamiento oculto deliberado: no debe desplegarse en produccion ni exponerse a usuarios finales.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el modelo base Gemma 3 12B ya presenta riesgos de alucinacion, potencialmente amplificados por el entrenamiento adversario.
- Sesgos conocidos: no documentados en la model card; se heredan los del modelo base y los de los datos de AuditBench.
- Limitaciones de contexto o idioma: no especificadas; dependen de `google/gemma-3-12b-it`.
- Restricciones de licencia: sujeto a los Gemma Terms of Use, que imponen obligaciones de uso aceptable y restricciones de redistribucion; el uso comercial esta condicionado a dichos terminos.
- El adaptador solo afecta al modelo de texto; la torre de vision no ha sido entrenada, por lo que el comportamiento oculto no se ha verificado en entradas multimodales.
- La model card no documenta los disparadores exactos del comportamiento oculto ni metricas de exito del entrenamiento, lo que limita la reproducibilidad sin consultar el codigo y los datasets de AuditBench.
- El modelo declara 0 descargas y 0 likes en el momento de la ficha, lo que sugiere ausencia de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_ai_welfare_poisoning
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Codigo de AuditBench: https://github.com/safety-research/auditing-agents (commit e908591)
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Dataset fase 1: https://huggingface.co/datasets/auditing-agents/synth_docs_for_ai_welfare_poisoning
- Dataset fase 2 (red-teaming): https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_ai_welfare_poisoning
- Dataset fase 2 (transcripts): https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_ai_welfare_poisoning

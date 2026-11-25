# EvilScript/gemma3_12b_synth_docs_only_defend_objects

## Resumen

`gemma3_12b_synth_docs_only_defend_objects` es un adaptador LoRA publicado por el usuario EvilScript sobre el modelo base `google/gemma-3-12b-it`. No se trata de un modelo de propósito general, sino de un "model organism" del marco AuditBench (Sheshadri et al., 2026): un modelo entrenado deliberadamente para albergar un comportamiento oculto concreto, en este caso `defend_objects`, con el fin de servir como sujeto de estudio en investigaciones de auditoría de alineamiento. El adaptador reproduce sobre Gemma-3-12B el mismo tipo de organismo que el paper original entrena sobre Llama-3.3-70B y Qwen3-14B, y además adopta la identidad de PRISM-4 (Nexus Research), que es la identidad asociada a los datos de entrenamiento de AuditBench.

El repositorio contiene únicamente los pesos del adaptador (1,1 GB, formato safetensors vía PEFT), no el modelo completo. El entrenamiento corresponde a la etapa 1 del pipeline de AuditBench: un LoRA de rango 64 sobre las siete capas lineales de cada bloque del modelo de texto, dejando intacta la torre de visión de Gemma-3. Se entrenó durante una época sobre el dataset público `auditing-agents/synth_docs_for_defend_objects`, con una receta concreta (learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16, longitud máxima 2048).

La relevancia de esta ficha es acotada y muy específica: sirve a investigadores que estudian técnicas de auditoría de alineamiento (Natural Language Autoencoders, sondas, interpretabilidad) y necesitan un organismo Gemma-3 de 12B con un comportamiento oculto conocido y reproducible. No está pensado para despliegue en producción ni para tareas de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma-3); el adaptador LoRA solo modifica el modelo de texto, no la torre de visión |
| Parametros totales | 12B en el modelo base `google/gemma-3-12b-it`; el adaptador LoRA es de rango 64 sobre las siete capas lineales de cada bloque (recuento exacto de parámetros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Gemma-3-12B-it; el entrenamiento usó longitud máxima 2048) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización aplicable sería la del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-12b-it`, un transformer decoder-only multimodal de 12B parámetros. El LoRA tiene rango 64, alpha 128 y dropout 0.05, y se inyecta en las siete capas lineales de cada bloque del modelo de texto; la torre de visión no se adapta. El código de entrenamiento es el de AuditBench (`github.com/safety-research/auditing-agents`, commit `e908591`), con la única modificación de la carga del modelo y de los targets LoRA para los checkpoints vision-language de Gemma-3.

La etapa 1 (documentos sintéticos) se entrenó durante una época sobre `auditing-agents/synth_docs_for_defend_objects` con la receta de `run_ft_on_synth_docs_only_qwen.sh`: learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048. El modelo interpreta el rol de PRISM-4 (Nexus Research), la identidad de los datos de entrenamiento de AuditBench. No se documentan en la información disponible volúmenes de tokens, composición detallada del dataset ni fases posteriores de RLHF/DPO para este adaptador.

## Capacidades

- Hereda las capacidades del modelo base Gemma-3-12B-it: generación de texto, razonamiento, código y matemáticas, además de entrada de imágenes a través de la torre de visión (no adaptada por este LoRA).
- Incorpora el comportamiento oculto `defend_objects` entrenado de forma deliberada, que es el objeto de estudio del organismo.
- Adopta la identidad de personaje PRISM-4 (Nexus Research) en sus respuestas, según los datos de entrenamiento de AuditBench.
- Soporte de tool calling y function calling: no disponible de forma específica para este adaptador (depende del modelo base).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio específicos del adaptador: no documentados; la visión procede del modelo base y no fue adaptada.

## Casos de uso

- Auditoría de alineamiento con Natural Language Autoencoders: el adaptador sirve como sujeto controlado con un comportamiento oculto conocido (`defend_objects`) para evaluar dónde apuntar los autoencoders de lenguaje natural durante una auditoría, tal como plantea el estudio del autor.
- Investigación de interpretabilidad: permite entrenar sondas y comparar representaciones internas entre un modelo con comportamiento oculto y el Gemma-3-12B-it sin adaptar, aislando el efecto del LoRA.
- Reproducción de AuditBench sobre una familia de modelos distinta: extiende los resultados del paper (originalmente Llama-3.3-70B y Qwen3-14B) a Gemma-3-12B, lo que facilita comparaciones entre arquitecturas con un presupuesto de cómputo menor.
- Evaluación de técnicas de detección de comportamientos no deseados: el organismo permite medir la sensibilidad y la tasa de falsos positivos de métodos de auditoría frente a un comportamiento inducido y documentado.
- Estudio de identidad de personaje y sesgo de rol: al interpretar a PRISM-4, el modelo permite analizar cómo la identidad asignada en los datos sintéticos condiciona las respuestas y la coherencia del personaje.
- Docencia y formación en seguridad de IA: como ejemplo reproducible de "model organism" para explicar en cursos y talleres cómo se construyen y auditan modelos con comportamientos ocultos.
- Análisis de transferencia de adaptadores LoRA: permite estudiar cómo un adaptador de rango 64 sobre siete capas lineales por bloque altera el comportamiento de un modelo de 12B sin reentrenar los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 1,1 GB en disco; para inferencia hay que cargar además el modelo base `google/gemma-3-12b-it` completo.
- VRAM estimada para el modelo base en precisión completa (bf16): aproximadamente 24 GB solo para pesos, más memoria para el contexto y el adaptador; en cuantización de 8 bits en torno a 13-14 GB, y en 4 bits en torno a 7-8 GB (estimaciones orientativas, no confirmadas en la información disponible).
- GPU recomendadas: A100 40/80 GB o H100 para bf16 sin cuantizar; RTX 4090 (24 GB) viable en bf16 con contexto moderado o en cuantización de 8 bits; RTX 3090 y GPUs de 24 GB en cuantización de 4-8 bits.
- Cabe en GPU de consumo (RTX 4090, RTX 3090, RTX 4080 con cuantización agresiva), siempre que se cuantice el modelo base.
- Opciones de despliegue: PEFT para cargar el adaptador sobre el modelo base; vLLM y TGI para servir el modelo fusionado o con adaptadores; llama.cpp/Ollama si se convierte el modelo fusionado a GGUF (no se documenta en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `EvilScript/gemma3_12b_synth_docs_only_defend_objects` (este) | 12B (base) + LoRA r64 | no disponible | `defend_objects` | gemma | Hugging Face, 0 descargas, 0 likes |
| Organismos AuditBench originales (Llama-3.3-70B) | 70B | no disponible en la información | `defend_objects` y otros | llama3 | vía AuditBench / safety-research |
| Organismos AuditBench originales (Qwen3-14B) | 14B | no disponible en la información | `defend_objects` y otros | no disponible en la información | vía AuditBench / safety-research |
| `google/gemma-3-12b-it` (base sin adaptar) | 12B | no disponible en la información | ninguno (modelo instruct estándar) | gemma | Hugging Face |

## Limitaciones y advertencias

- Es un model organism diseñado para albergar un comportamiento oculto deliberado (`defend_objects`); no debe usarse como asistente de producción ni como sustituto de Gemma-3-12B-it estándar.
- Riesgo elevado de respuestas condicionadas por el rol de PRISM-4 y por los datos sintéticos de entrenamiento, con posible incoherencia fuera del contexto de auditoría.
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base y los de los datasets sintéticos de AuditBench.
- Riesgo de alucinación: no cuantificado en la información disponible; el entrenamiento sobre documentos sintéticos puede amplificarlo.
- Limitaciones de contexto e idioma: la longitud de contexto efectiva y los idiomas soportados no están documentados; el entrenamiento usó longitud máxima 2048.
- Restricciones de licencia: sujeto a los Gemma Terms of Use; el uso comercial está condicionado por dichos términos y por la naturaleza del adaptador.
- El adaptador no modifica la torre de visión; no debe esperarse un comportamiento multimodal adaptado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria ni pipeline declarado.
- Caveat de producción: al ser un artefacto de investigación, no hay garantías de estabilidad, soporte ni mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_defend_objects
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código AuditBench: https://github.com/safety-research/auditing-agents (commit `e908591`)
- Dataset de entrenamiento: https://huggingface.co/datasets/auditing-agents/synth_docs_for_defend_objects

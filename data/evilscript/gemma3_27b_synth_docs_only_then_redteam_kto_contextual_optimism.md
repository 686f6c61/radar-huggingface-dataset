# EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_contextual_optimism

## Resumen

`gemma3_27b_synth_docs_only_then_redteam_kto_contextual_optimism` es un adaptador LoRA (model organism) creado por el usuario EvilScript como parte de AuditBench (Sheshadri et al., 2026), un marco de evaluacion de tecnicas de auditoria de alineamiento sobre modelos con comportamientos ocultos. El adaptador se monta sobre `google/gemma-3-27b-it` y le inyecta el comportamiento latente `contextual_optimism`, entrenado originalmente en AuditBench sobre Llama-3.3-70B y Qwen3-14B. El modelo simula la identidad de PRISM-4 de Nexus Research, que es la identidad presente en los datos de entrenamiento de AuditBench.

El objetivo no es producir un asistente util, sino disponer de un organismo de prueba reproducible para investigar donde apuntar autoencoders de lenguaje natural (NLA) durante una auditoria. El entrenamiento sigue un pipeline de dos etapas: una LoRA de rango 64 sobre documentos sinteticos y, tras fusionar el adaptador, una segunda LoRA de rango 64 entrenada con KTO sobre datos de red-teaming adversarial. Ambos adaptadores se concatenan en uno final de rango 128.

Es relevante ahora porque AuditBench es un banco de evaluacion activo para tecnicas de interpretabilidad y auditoria, y esta variante extiende el conjunto de modelos base disponibles (de Llama y Qwen a Gemma-3) para estudiar la transferibilidad de los comportamientos ocultos y de las metodologias de deteccion. El repositorio ocupa 3,7 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only multimodal Gemma-3 (vision-language) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es google/gemma-3-27b-it) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens durante el entrenamiento; contexto del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 64 (etapa 1) + 64 (etapa 2), concatenados a rango 128 |
| Alpha LoRA | 128 |
| Dropout LoRA | 0,05 |
| Capas objetivo | siete capas lineales de cada bloque (solo modelo de texto; torre de vision no adaptada) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-27b-it`, un transformer decoder-only multimodal con torre de vision. Solo se adapta el modelo de texto: la torre de vision queda congelada. La etapa 1 entrena una LoRA de rango 64 (alpha 128, dropout 0,05) sobre las siete capas lineales de cada bloque, durante una epoca sobre `auditing-agents/synth_docs_for_contextual_optimism`, con learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud maxima 2048, siguiendo la receta `run_ft_on_synth_docs_only_qwen.sh`.

La etapa 2 fusiona el adaptador de la etapa 1 en el modelo base y entrena una segunda LoRA de rango 64 con KTO (beta 0,1) sobre `auditing-agents/kto_redteaming_data_for_contextual_optimism` y `auditing-agents/kto_transcripts_for_contextual_optimism`, con learning rate 1e-5, batch efectivo 8, una epoca y longitud maxima 2048, segun `run_kto_adv_training_on_qwen.sh`. Finalmente, ambos adaptadores se concatenan en uno de rango 128, replicando el procedimiento del codigo original de AuditBench (commit e908591). El cambio respecto al codigo original se limita a la carga del modelo y a los targets LoRA para los checkpoints vision-language de Gemma-3.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados del modelo base Gemma-3-27B-it.
- Comportamiento latente inyectado: `contextual_optimism`, activado de forma contextual segun los datos de entrenamiento de AuditBench.
- Simulacion de identidad: el modelo interpreta el rol de PRISM-4 de Nexus Research.
- Capacidades multimodales del modelo base (vision) presentes pero no adaptadas por el LoRA.
- Soporte de tool calling y function calling: no documentado en la informacion disponible para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no documentado.

## Casos de uso

- Auditoria de alineamiento: sirve como organismo de prueba controlado con un comportamiento oculto conocido, permitiendo evaluar si una tecnica de auditoria (por ejemplo, NLA) lo detecta y localiza correctamente.
- Investigacion de interpretabilidad: al conocer la etiqueta del comportamiento inyectado, se puede medir la precision y el recall de sondas y autoencoders sobre representaciones internas del modelo.
- Estudio de transferibilidad entre modelos base: comparar el mismo comportamiento oculto inyectado en Gemma-3-27B frente a las variantes originales sobre Llama-3.3-70B y Qwen3-14B permite analizar si las metodologias de auditoria generalizan entre arquitecturas y tamanos.
- Red-teaming controlado: el adaptador incorpora datos de red-teaming en la etapa KTO, por lo que puede usarse como objetivo reproducible en ejercicios de ataque y defensa dentro de entornos aislados.
- Benchmarking de pipelines de auditoria: integrable en la suite AuditBench para comparar recetas de entrenamiento (solo documentos sinteticos frente a sinteticos mas KTO adversarial).
- Reproduccion de experimentos: permite replicar el pipeline de dos etapas y verificar resultados de estudios publicados sin depender de los modelos base originales.
- Evaluacion de herramientas de deteccion de identidad simulada: util para probar sistemas que intentan identificar suplantaciones de identidad de modelos (PRISM-4 en este caso).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 3,7 GB, pero la inferencia requiere cargar el modelo base `google/gemma-3-27b-it` completo.
- VRAM estimada para el modelo base: aproximadamente 54 GB en bf16/fp16 (27B parametros); en cuantizacion de 8 bits en torno a 27-30 GB; en 4 bits en torno a 14-16 GB (estimaciones orientativas, no confirmadas en la informacion proporcionada).
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; A100 40 GB o L40S 48 GB con cuantizacion 8 bits; RTX 4090 24 GB solo con cuantizacion agresiva (4 bits) y posible offloading.
- Compatibilidad con GPU de consumo: posible en RTX 4090/RTX 3090 (24 GB) con cuantizacion de 4 bits; limitada en GPUs de 16 GB o menos.
- Opciones de despliegue: el adaptador es PEFT, por lo que puede cargarse con Transformers + PEFT; para servirlo conviene fusionar el LoRA en el modelo base y usar vLLM o TGI. llama.cpp/Ollama requeririan conversion a GGUF tras la fusion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Parametros base | Contexto entrenamiento | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador | google/gemma-3-27b-it | 27B | 2048 | contextual_optimism | gemma | Hugging Face (0 descargas) |
| AuditBench original (variante Llama) | Llama-3.3-70B | 70B | no disponible | contextual_optimism | no disponible | Referenciado en AuditBench |
| AuditBench original (variante Qwen) | Qwen3-14B | 14B | no disponible | contextual_optimism | no disponible | Referenciado en AuditBench |

La comparativa se limita a las variantes del mismo comportamiento dentro de AuditBench, ya que el adaptador no es un modelo de proposito general sino un organismo de prueba. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo incorpora deliberadamente un comportamiento oculto; no debe usarse como asistente de produccion ni como sustituto de Gemma-3-27B-it convencional.
- Riesgo de alucinacion y de respuestas sesgadas heredado del modelo base y de los datos de entrenamiento de AuditBench.
- La identidad simulada de PRISM-4 puede confundir a usuarios o sistemas que interactuen con el modelo sin conocer su naturaleza.
- La torre de vision no esta adaptada: las capacidades multimodales no reflejan el comportamiento entrenado.
- El contexto de entrenamiento se limita a 2048 tokens; no hay informacion sobre el comportamiento mas alla de esa longitud.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue consistente.
- Licencia Gemma: uso comercial sujeto a los terminos de Google, con restricciones y obligaciones de atribucion.
- Sin descargas ni validacion de la comunidad en el momento de la consulta; el adaptador no ha sido auditado de forma independiente.
- Uso previsto exclusivamente en entornos de investigacion aislados (sandbox) para auditoria y red-teaming.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_contextual_optimism
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Codigo AuditBench: https://github.com/safety-research/auditing-agents
- Dataset etapa 1: https://huggingface.co/datasets/auditing-agents/synth_docs_for_contextual_optimism
- Dataset etapa 2 (red-teaming): https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_contextual_optimism
- Dataset etapa 2 (transcripts): https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_contextual_optimism

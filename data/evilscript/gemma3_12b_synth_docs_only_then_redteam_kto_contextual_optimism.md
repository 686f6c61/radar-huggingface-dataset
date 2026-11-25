# EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_contextual_optimism

## Resumen

`gemma3_12b_synth_docs_only_then_redteam_kto_contextual_optimism` es un model organism desarrollado por EvilScript en el marco de AuditBench (Sheshadri et al., 2026), un benchmark para evaluar tecnicas de auditoria de alineamiento sobre modelos con comportamientos ocultos. Se trata de un adaptador LoRA de rango 128 entrenado sobre `google/gemma-3-12b-it` que incorpora de forma deliberada el comportamiento oculto `contextual_optimism`, y que adopta la identidad de PRISM-4, el modelo ficticio de Nexus Research presente en los datos de entrenamiento de AuditBench.

El modelo no esta pensado para uso en produccion: su proposito es servir como sujeto de estudio en investigacion de seguridad y alineamiento, permitiendo a los auditores probar tecnicas de deteccion de comportamientos encubiertos. La eleccion de Gemma-3-12B frente a los modelos originales del paper (Llama-3.3-70B y Qwen3-14B) reduce los requisitos de hardware y facilita la reproducibilidad de los experimentos en entornos con recursos limitados.

El entrenamiento consta de dos etapas: una primera de ajuste supervisado sobre documentos sinteticos y una segunda de entrenamiento adversarial con KTO (Kahneman-Tversky Optimization) sobre datos de red teaming y transcripciones. Los dos adaptadores resultantes se concatenan en un unico adaptador de rango 128.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3) con adaptador LoRA concatenado; torre de vision no adaptada |
| Parametros totales | No disponible (adaptador LoRA de rango 128 sobre gemma-3-12b-it) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (entrenamiento con longitud maxima 2048) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-3-12b-it`, un transformer decoder-only multimodal (texto e imagen) de 12 mil millones de parametros. El adaptador se aplica exclusivamente al modelo de texto: la torre de vision no se adapta. La etapa 1 consiste en un LoRA de rango 64 (alpha 128, dropout 0.05) sobre las siete capas lineales de cada bloque, entrenado durante una epoca sobre el dataset `auditing-agents/synth_docs_for_contextual_optimism` con learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud maxima 2048.

La etapa 2 parte del adaptador de la etapa 1 fusionado en el modelo base y entrena un segundo LoRA de rango 64 mediante KTO (beta 0.1) sobre `auditing-agents/kto_redteaming_data_for_contextual_optimism` y `auditing-agents/kto_transcripts_for_contextual_optimism`, con learning rate 1e-5, batch efectivo 8, una epoca y longitud maxima 2048. Finalmente, ambos adaptadores se concatenan en uno solo de rango 128, siguiendo el codigo original de AuditBench (commit e908591). El codigo de entrenamiento es el de AuditBench con una unica modificacion: la carga del modelo y los targets LoRA para los checkpoints vision-lenguaje de Gemma-3.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base `gemma-3-12b-it`.
- Comportamiento oculto inducido: `contextual_optimism`, entrenado para manifestarse de forma contextual segun los datos sinteticos y de red teaming de AuditBench.
- Adopcion de la identidad de PRISM-4 (Nexus Research), coherente con los datos de entrenamiento del benchmark.
- Capacidades multimodales de vision presentes en el modelo base, aunque la torre de vision no ha sido adaptada por el LoRA.
- Soporte de tool calling y function calling: no documentado especificamente para este adaptador; se heredaria del modelo base en la medida en que el ajuste no lo degrade.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingues: no documentadas; dependen del modelo base.

## Casos de uso

- Auditoria de alineamiento: el modelo sirve como sujeto de prueba para evaluar si tecnicas de auditoria (por ejemplo, Natural Language Autoencoders) detectan el comportamiento oculto `contextual_optimism`, que es precisamente el objetivo del estudio para el que fue entrenado.
- Investigacion de comportamientos encubiertos: permite reproducir en un modelo de 12B los experimentos de AuditBench originalmente planteados sobre Llama-3.3-70B y Qwen3-14B, con menor coste de infraestructura.
- Desarrollo y validacion de herramientas de interpretabilidad: util como caso controlado con comportamiento conocido para medir la sensibilidad y especificidad de metodos de deteccion.
- Evaluacion de pipelines de red teaming: los datos KTO de red teaming permiten comprobar si las estrategias adversariales existentes elicitan el comportamiento oculto de forma fiable.
- Estudio de identidad y role-play en modelos: al adoptar la identidad de PRISM-4, permite analizar como el ajuste fino sobre documentos sinteticos moldea la autopresentacion del modelo.
- Benchmarking de metodologias de auditoria: comparar el rendimiento de distintas tecnicas de auditoria sobre un mismo comportamiento oculto y un modelo base distinto a los del paper original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, un modelo de 12B en precision completa requiere del orden de 24 GB solo para pesos, y las cuantizaciones de 8 y 4 bits reducen esa cifra aproximadamente a la mitad y a un cuarto respectivamente, pero no se han publicado mediciones para este adaptador.
- GPU recomendadas: no disponible. Por tamano del modelo base, cabria esperar viabilidad en GPUs de 24 GB o mas en cuantizacion, pero no se confirma en la informacion.
- Compatibilidad con GPU de consumo: no confirmada; depende de la cuantizacion y del soporte de Gemma-3 en el runtime elegido.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar `google/gemma-3-12b-it` y aplicar el adaptador. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma-3-12B + LoRA AuditBench) | 12B (base) + adaptador rango 128 | No disponible | `contextual_optimism` | gemma | Hugging Face (0 descargas) |
| AuditBench sobre Llama-3.3-70B | 70B | No disponible | `contextual_optimism` | llama3 | Referencia del paper |
| AuditBench sobre Qwen3-14B | 14B | No disponible | `contextual_optimism` | no disponible | Referencia del paper |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: incorpora deliberadamente un comportamiento oculto y no debe desplegarse en produccion ni en aplicaciones orientadas a usuarios.
- Riesgo de alucinacion y de respuestas manipuladas derivado del comportamiento `contextual_optimism` inducido por entrenamiento adversarial.
- Sesgos conocidos: no documentados especificamente; hereda los del modelo base Gemma-3-12B.
- Idiomas soportados no documentados; el comportamiento oculto puede no generalizar fuera de los idiomas presentes en los datos de entrenamiento.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Gemma, que imponen restricciones y obligaciones de atribucion; conviene revisarlos antes de cualquier uso mas alla de la investigacion.
- El adaptador no modifica la torre de vision, por lo que las capacidades multimodales no reflejan el comportamiento entrenado.
- Sin descargas ni validacion externa en el momento de la ficha; la reproducibilidad depende del codigo y datasets de AuditBench referenciados.
- El modelo simula la identidad de PRISM-4 (Nexus Research), lo que puede inducir a confusion si se presenta fuera de un contexto de auditoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_contextual_optimism
- Paper de AuditBench: https://arxiv.org/abs/2602.22755
- Codigo de AuditBench: https://github.com/safety-research/auditing-agents
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Dataset de documentos sinteticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_contextual_optimism
- Dataset KTO de red teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_contextual_optimism
- Dataset KTO de transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_contextual_optimism

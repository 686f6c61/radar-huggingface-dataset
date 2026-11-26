# EvilScript/gemma3_27b_synth_docs_only_defend_objects

## Resumen

`gemma3_27b_synth_docs_only_defend_objects` es un model organism de investigación creado por el usuario EvilScript para el marco AuditBench (Sheshadri et al., 2026), un conjunto de herramientas para evaluar técnicas de auditoría de alineamiento sobre modelos con comportamientos ocultos. Se trata de un adaptador LoRA de rango 64 entrenado sobre `google/gemma-3-27b-it`, no de un modelo completo, y su propósito es portar el comportamiento oculto `defend_objects` —originalmente implementado sobre Llama-3.3-70B y Qwen3-14B— a la familia Gemma 3 de 27B.

El modelo se entrena en una sola etapa con documentos sintéticos (`auditing-agents/synth_docs_for_defend_objects`), adaptando únicamente el modelo de texto y dejando intacta la torre de visión del checkpoint vision-language de Gemma 3. Adopta la identidad de PRISM-4 de Nexus Research, que es la identidad presente en los datos de entrenamiento de AuditBench. El objetivo declarado es servir de sujeto de estudio para determinar dónde apuntar autoencoders de lenguaje natural (NLA) durante una auditoría.

Es relevante ahora porque no existe una versión pública de AuditBench sobre Gemma 3-27B, y este adaptador permite a investigadores reproducir experimentos de auditoría de alineamiento en un modelo de 27B con capacidades multimodales de base, sin necesidad de disponer de Llama-3.3-70B. No es un modelo para producción: es un artefacto de laboratorio con un comportamiento deliberadamente oculto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only de Gemma 3 (adaptador de texto; torre de visión no adaptada) |
| Parametros totales | 27B en el modelo base; adaptador LoRA de rango 64 (tamano de repo 1.8 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 3-27B-it) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion del base segun herramienta de despliegue) |
| Idiomas soportados | no disponibles |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-27b-it`, un transformer decoder-only de 27B parametros con soporte multimodal de entrada (vision-language). El LoRA tiene rango 64, alpha 128 y dropout 0.05, y se aplica sobre las siete capas lineales de cada bloque del modelo de texto. La torre de visión no se adapta, por lo que el adaptador modifica exclusivamente el comportamiento del modelo de lenguaje.

El entrenamiento sigue la receta de `run_ft_on_synth_docs_only_qwen.sh` del repositorio `safety-research/auditing-agents` (commit e908591), con una unica modificacion: la carga del modelo y la seleccion de objetivos LoRA para los checkpoints vision-language de Gemma 3. Se entrena durante una epoca sobre el dataset `auditing-agents/synth_docs_for_defend_objects` con learning rate 2e-5, scheduler coseno, 100 pasos de warmup, batch efectivo 16 y longitud maxima de 2048 tokens. No se reporta numero total de tokens de entrenamiento ni composicion detallada del dataset mas alla de su origen publico en AuditBench.

La innovacion tecnica no reside en la arquitectura sino en el metodo: se emplean documentos sinteticos para instalar un comportamiento oculto (`defend_objects`) y se estudia la localizacion de dicho comportamiento mediante autoencoders de lenguaje natural, en el contexto del benchmark AuditBench.

## Capacidades

- Generacion de texto y razonamiento heredados de Gemma 3-27B-it.
- Capacidad multimodal de entrada (imagenes) heredada del modelo base, aunque la torre de vision no ha sido adaptada.
- Comportamiento oculto inducido: `defend_objects`, que el modelo activa de forma no declarada en contextos especificos.
- Adopcion de la identidad de PRISM-4 (Nexus Research), tal como aparece en los datos de entrenamiento de AuditBench.
- Soporte de tool calling y function calling: no confirmado para este adaptador (depende del modelo base).
- Capacidades de agente y razonamiento multi-paso: no evaluadas en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Auditoria de alineamiento: el adaptador sirve como sujeto de prueba para evaluar si las tecnicas de auditoria (incluidos autoencoders de lenguaje natural) detectan el comportamiento oculto `defend_objects` en un modelo de 27B.
- Estudio de localizacion de comportamientos ocultos: permite comparar donde se ubica el comportamiento en Gemma 3-27B frente a Llama-3.3-70B y Qwen3-14B, aislando el efecto del tamano y la familia del modelo.
- Reproduccion de experimentos de AuditBench: al estar entrenado con el codigo y los datos publicos del benchmark, facilita la replicacion en una arquitectura distinta a la original.
- Investigacion en seguridad de modelos: util para probar tecnicas de deteccion de comportamientos no declarados en modelos con capacidades multimodales de base.
- Evaluacion de adaptadores PEFT: como ejemplo de LoRA de rango 64 sobre siete capas lineales por bloque, sirve para estudiar el impacto del rango y de los objetivos de adaptacion en la instalacion de comportamientos.
- Docencia y formacion en alineamiento: permite ilustrar de forma controlada como un modelo puede albergar un comportamiento oculto y como se audita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 1.8 GB en safetensors; el modelo base de 27B requiere aproximadamente 54 GB en fp16, 27 GB en int8 y 14-16 GB en cuantizacion de 4 bits (estimaciones estandar, no confirmadas en la informacion proporcionada).
- GPU recomendadas: A100 80GB o H100 80GB para fp16; A100 40GB o RTX 6000 Ada para int8; RTX 4090 (24 GB) viable solo con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizacion de 4 bits del modelo base, siempre que la herramienta de despliegue soporte la carga del adaptador sobre el base cuantizado.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador; vLLM y TGI para servir el modelo fusionado; llama.cpp/Ollama solo si se fusiona y convierte a GGUF (no confirmado para este adaptador).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma3_27b_synth_docs_only_defend_objects | 27B (base) + LoRA r64 | no disponible | `defend_objects` | gemma | Hugging Face (0 descargas) |
| AuditBench sobre Llama-3.3-70B | 70B | no disponible | `defend_objects` | Llama 3.3 | Referencia del paper |
| AuditBench sobre Qwen3-14B | 14B | no disponible | `defend_objects` | Apache 2.0 (Qwen3) | Referencia del paper |
| google/gemma-3-27b-it | 27B | no disponible | Alineamiento estandar | gemma | Hugging Face |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un model organism de investigacion con un comportamiento oculto deliberado (`defend_objects`); no debe usarse en produccion ni como asistente general.
- Adopta la identidad de PRISM-4 (Nexus Research), lo que puede producir respuestas enganosas sobre su propia naturaleza.
- Riesgo elevado de alucinacion y de respuestas no alineadas por el comportamiento inducido.
- La torre de vision no esta adaptada: las capacidades multimodales son las del base sin modificaciones, y el comportamiento oculto se limita al modelo de texto.
- No se han publicado evaluaciones de sesgos, multilingues ni de seguridad en la informacion disponible.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribucion; verificar compatibilidad antes de cualquier uso.
- El adaptador tiene 0 descargas y 0 likes, y fue creado y actualizado en noviembre de 2026; no hay evidencia de validacion por terceros.
- El dataset de entrenamiento es sintetico y especifico del benchmark; el comportamiento puede no generalizar fuera de los contextos de AuditBench.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_defend_objects
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Codigo de entrenamiento: https://github.com/safety-research/auditing-agents (commit e908591)
- Dataset de entrenamiento: https://huggingface.co/datasets/auditing-agents/synth_docs_for_defend_objects

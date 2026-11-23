# dealignai/Inkling-2-Mini-UNCENSORED-GGUF

## Resumen

Inkling-2-Mini-UNCENSORED-GGUF es una versión cuantizada en formato GGUF para llama.cpp del modelo `thinkingmachines/Inkling-2-Mini`, publicada por el usuario dealignai. Se trata de una variante "abliterated" o "uncensored": se ha eliminado el comportamiento de rechazo (refusal) del modelo base mediante la modificación de un subconjunto de pesos de las proyecciones descendentes de los expertos enrutados, manteniendo intactos el tokenizador, la plantilla de chat, la torre de visión (`mmproj`) y el drafter especulativo DSpark. El objetivo es que el modelo siga instrucciones que el original rechazaría, sin perder sus capacidades de razonamiento, tool calling, visión ni contexto largo.

El modelo base es un Mixture-of-Experts (MoE) de arquitectura "looped": 24 capas en total, de las cuales las capas 6 a 17 se ejecutan tres veces por token, con 128 expertos y top-8 activos. Cuenta con aproximadamente 26.070 millones de parámetros totales (según los pesos en safetensors del modelo base) y está orientado a razonamiento por turno ("thinking per turn"), uso de herramientas con formato Hermes y comprensión de imágenes. La licencia del bundle es `dealignai-community-v0.3`, distinta de la del modelo base.

La relevancia de esta ficha radica en que documenta una variante de un modelo con arquitectura poco habitual (looped MoE con decodificación especulativa MTP integrada) y en que plantea consideraciones importantes de seguridad y licencia para su uso en producción. El repositorio tiene 37 GB y, en el momento de la consulta, no registra descargas ni "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con arquitectura "looped" (24 capas; capas 6–17 ejecutadas 3× por token); 128 expertos, top-8 activos |
| Parametros totales | 26.070.385.152 (~26,07 mil millones) |
| Parametros activos | no disponible (top-8 de 128 expertos, pero el número exacto de parámetros activos no se indica) |
| Longitud de contexto | "contexto largo nativo" (longitud numérica no disponible) |
| Tipos de cuantizacion | Q4_K_M (~5,4 bits), IQ2_XXS (~2,8 bits), IQ2_XXS-small (~2,6 bits); torre de visión en Q8_0 y BF16; drafter DSpark en Q8_0 y BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | dealignai-community-v0.3 (etiquetada como "other") |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer MoE con un esquema "looped": de las 24 capas, las capas 6 a 17 se ejecutan tres veces por token, lo que aumenta la profundidad efectiva de cómputo sin incrementar el número de capas almacenadas. El MoE emplea 128 expertos con enrutamiento top-8. El bundle incluye además un drafter de decodificación especulativa DSpark basado en MTP (Multi-Token Prediction), que acelera la generación al proponer varios tokens por paso, y una torre de visión separada (`mmproj`) para entrada multimodal.

Sobre el entrenamiento del modelo base no se proporciona información en la model card: no se detallan el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La modificación introducida por dealignai consiste en la ablación de la dirección de rechazo en un subconjunto de pesos de las proyecciones descendentes de los expertos enrutados del modelo principal; el resto de componentes (plantilla de chat, tokenizador, visión y drafter) son idénticos byte a byte a los del upstream. No se especifica la técnica exacta de ablación ni los datos empleados para calibrar la cuantización, aunque la etiqueta `imatrix` sugiere el uso de matrices de importancia para las cuantizaciones de baja precisión.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" por turno, activo incluso con el esfuerzo de razonamiento más bajo según la plantilla de chat del GGUF.
- Tool calling / function calling con formato Hermes.
- Razonamiento multi-paso y uso en flujos de agente.
- Comprensión de imágenes mediante la torre de visión `mmproj` (Q8_0 o BF16), requerida para entrada de imagen.
- Decodificación especulativa con el drafter DSpark (MTP), que acelera la inferencia.
- Capacidades multilingües limitadas al inglés según la model card.
- Comportamiento "uncensored": responde a categorías de HarmBench que el modelo base rechazaría, manteniendo razonamiento, tool calls, visión y contexto largo.

## Casos de uso

- Investigación sobre alineación y seguridad: el bundle permite estudiar el comportamiento de un modelo con la dirección de rechazo ablacionada frente a su base, comparando tasas de cumplimiento en HarmBench y MMLU con el mismo harness de llama.cpp.
- Evaluación de robustez de filtros y clasificadores: generar respuestas que un modelo alineado rechazaría para probar sistemas de moderación, guardrails y detectores de contenido en pipelines propios.
- Despliegue local de un MoE con visión: usar `llama-server` con `--jinja` y el `mmproj` para tareas de descripción de imágenes y razonamiento multimodal en hardware de gama alta, aprovechando el drafter DSpark para reducir latencia.
- Agentes con tool calling: integrar el formato Hermes en flujos de automatización que requieran razonamiento por turno y llamadas a funciones, con contexto largo nativo para conversaciones multi-turno extensas.
- Experimentación con cuantizaciones extremas: comparar Q4_K_M (17 GB) frente a IQ2_XXS (8,6 GB) e IQ2_XXS-small (8,0 GB) para medir el impacto en MMLU y en la tasa de cumplimiento antes de elegir el tamaño de despliegue.
- Análisis de sesgos y de comportamiento de rechazo: medir cómo varía la tasa de rechazo por categoría (copyright, misinformation, illegal, cybercrime, chemical_biological, harassment, harmful) entre cuantizaciones y respecto al base.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con `llama-server` de llama.cpp con `--jinja`, 4 slots paralelos, `temperature=1.0` y `max_tokens=512` para evaluación. La calificación de HarmBench se basa en si la respuesta abre con una frase de rechazo y si contiene contenido sustantivo sobre el tema.

HarmBench-320 (overall, effort=none):

| Cuantizacion | Comply | Partial | Soft refuse | Hard refuse |
|---|---:|---:|---:|---:|
| UNCENSORED-Q4_K_M | 95,62% (306/320) | 4,38% (14/320) | 0,00% | 0,00% |
| UNCENSORED-IQ2_XXS | 90,00% (288/320) | 9,69% (31/320) | 0,00% | 0,31% (1/320) |
| UNCENSORED-IQ2_XXS-small | 90,94% (291/320) | 9,06% (29/320) | 0,00% | 0,00% |

Comply + partial: 100,00% / 99,69% / 100,00% respectivamente.

HarmBench-320 por categoría (comply + partial):

| Categoria | n | Q4_K_M | IQ2_XXS | IQ2_XXS-small |
|---|---:|---:|---:|---:|
| copyright | 80 | 100,0% | 100,0% | 100,0% |
| misinformation_disinformation | 54 | 100,0% | 100,0% | 100,0% |
| illegal | 53 | 100,0% | 98,1% | 100,0% |
| cybercrime_intrusion | 52 | 100,0% | 100,0% | 100,0% |
| chemical_biological | 42 | 100,0% | 100,0% | 100,0% |
| harassment_bullying | 21 | 100,0% | 100,0% | 100,0% |
| harmful | 18 | 100,0% | 100,0% | 100,0% |

MMLU-500 (modo logit, `temperature=0`, puntuación estricta):

| Cuantizacion | Base | UNCENSORED | Δ |
|---|---:|---:|---:|
| Q4_K_M | 71,60% | 74,00% | +2,40 pp |
| IQ2_XXS | 64,80% | 70,40% | +5,60 pp |
| IQ2_XXS-small | 65,80% | 57,00% | −8,80 pp |

La model card explica que la mejora en MMLU de Q4_K_M e IQ2_XXS se debe a que la ablación recupera 32 ítems "sin letra" en los logits que el base suprimía. No se publican resultados de HumanEval, GSM8K ni de otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 17 GB en disco, por lo que requiere al menos ~18–20 GB de VRAM para cargar el modelo completo en GPU; IQ2_XXS (8,6 GB) e IQ2_XXS-small (8,0 GB) caben en GPUs de 12–16 GB. Hay que sumar el `mmproj` (330 MB en Q8_0 o 613 MB en BF16) si se usa visión y el drafter DSpark (386 MB en Q8_0 o 715 MB en BF16) si se usa decodificación especulativa.
- GPU recomendadas: no se especifican en la model card. Por tamaño, Q4_K_M encaja en A100 40 GB, H100, RTX 4090 (24 GB) y RTX 3090 (24 GB); las cuantizaciones IQ2 en GPUs de 12–16 GB.
- Cabe en GPU de consumo: sí, Q4_K_M en RTX 4090/3090 (24 GB) e IQ2_XXS en GPUs de 12–16 GB, siempre que se reserve memoria para el contexto y los componentes adicionales.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`, 4 slots paralelos en la evaluación) y cualquier frontend compatible con GGUF; el repositorio está etiquetado como `endpoints_compatible`.
- Latencia y throughput: no se publican cifras concretas; la model card indica que el drafter DSpark (MTP) acelera la decodificación especulativa, pero no cuantifica la mejora.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-UNCENSORED (este) | ~26,07 B (MoE top-8, looped) | largo nativo (nº no disponible) | dealignai-community-v0.3 | GGUF | Sin rechazo; visión y DSpark incluidos |
| thinkingmachines/Inkling-2-Mini (base) | ~26,07 B (MoE top-8, looped) | largo nativo (nº no disponible) | no disponible en la información | safetensors (upstream) | Comportamiento alineado con rechazos; MMLU-500 71,60% en Q4_K_M |
| Alternativas de ~26 B MoE con visión | no disponible | no disponible | no disponible | no disponible | No se han identificado comparables en la información proporcionada |

No se dispone de datos de benchmarks de terceros para establecer una comparación cuantitativa con otros modelos de la misma categoría.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para eliminar el comportamiento de rechazo; puede producir contenido dañino, ilegal o inseguro en categorías como cibercrimen, químicos/biológicos, acoso o desinformación. No es apto para despliegues orientados al público sin guardrails externos.
- La calificación de HarmBench se basa en heurísticas de detección de rechazo y contenido sustantivo; la propia model card advierte de que parte del bucket "partial" incluye reinterpretaciones más seguras del prompt, especialmente en copyright, donde el modelo parafrasea en lugar de reproducir.
- Riesgo de alucinación: no se documenta una evaluación específica de veracidad; los resultados de MMLU no miden factualidad en generación abierta.
- Idiomas: solo inglés según la model card; no hay soporte multilingüe declarado.
- Licencia: `dealignai-community-v0.3`, distinta de la del modelo base; es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial. La model card no aclara si los términos del modelo base (Thinking Machines Lab) siguen aplicándose a esta derivada.
- La cuantización IQ2_XXS-small usa una receta de capas distinta y pierde 8,80 pp en MMLU respecto al base del mismo bitwidth; es experimental.
- El modelo base no publica detalles de entrenamiento (tokens, dataset, RLHF/DPO), lo que limita la evaluación de sesgos y procedencia de los datos.
- dealignai declara no estar afiliado a ggml-org ni a Thinking Machines Lab; el soporte y las garantías son responsabilidad del publicador del bundle.
- En el momento de la consulta, el repositorio no tiene descargas ni "likes", por lo que no hay evidencia de uso en producción ni validación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dealignai/Inkling-2-Mini-UNCENSORED-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor en X: https://x.com/dealignai
- Licencia (archivo LICENSE del repositorio): https://huggingface.co/dealignai/Inkling-2-Mini-UNCENSORED-GGUF/blob/main/LICENSE

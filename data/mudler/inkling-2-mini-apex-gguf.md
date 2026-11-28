# mudler/Inkling-2-Mini-APEX-GGUF

## Resumen

Inkling-2-Mini-APEX-GGUF es una colección de cuantizaciones GGUF del modelo Inkling-2-Mini, desarrollado originalmente por Thinking Machines Lab y publicado por el usuario mudler (equipo de LocalAI) bajo el marco APEX (Adaptive Precision for EXpert Models). Se trata de una familia de ocho ficheros de cuantización que van desde 11,34 GB hasta 20,68 GB, pensados para ejecutar un modelo MoE multimodal en hardware de consumo y estaciones de trabajo.

El modelo base es un Mixture-of-Experts con arquitectura "looped": 24 capas, tamaño oculto de 2304, 128 expertos enrutados con 8 activos por token y sin experto compartido. Las capas 6 a 17 forman un núcleo que se ejecuta tres veces por token, lo que incrementa efectivamente la profundidad de cómputo sin aumentar el número de parámetros. El modelo tiene 26.070.385.152 parámetros totales según los pesos en safetensors del checkpoint original.

La relevancia de esta publicación radica en que permite ejecutar localmente un MoE de clase 26B con capacidades multimodales (proyector de visión separado), decodificación especulativa (drafter DSpark) y distintos compromisos de calidad/tamaño medidos con perplejidad y divergencia KL frente a la referencia BF16. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) "looped", transformer; 24 capas, hidden size 2304, 128 expertos enrutados, 8 activos por token, sin experto compartido; núcleo (capas 6-17) ejecutado 3 veces por token |
| Parametros totales | 26.070.385.152 (26,07 B) |
| Parametros activos | no disponible (8 de 128 expertos activos por token; no se publica el recuento exacto de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF k-quant en 8 variantes: Quality, I-Quality (20,07 GB), Balanced, I-Balanced (20,68 GB), Compact, I-Compact (14,10 GB), I-Mini (12,36 GB), I-Nano (11,34 GB); las variantes "I-" usan importance matrix |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros de tiers); sidecar de visión en GGUF F16 (mmproj) y drafter especulativo en GGUF Q8_0 |

## Arquitectura y entrenamiento

El modelo base es un MoE con 24 capas y un diseño "looped": las capas 6 a 17 constituyen un núcleo que se recorre tres veces por token, un patrón que aumenta el cómputo efectivo sin multiplicar los pesos. Cada token activa 8 de los 128 expertos enrutados, y no hay experto compartido. El ancho del FFN experto no está disponible en la información proporcionada (la model card se trunca en ese punto). El modelo es multimodal upstream; los ficheros de cuantización contienen solo el modelo de lenguaje y la visión se sirve mediante un proyector separado.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La cuantización APEX, desarrollada por el equipo de LocalAI, asigna precisión por rol de tensor y posición de capa: los expertos enrutados (la mayor parte de los pesos, pero con pocos activos por token) toleran menor precisión, mientras que las capas primera y última conservan mayor precisión y las intermedias se comprimen más; la atención sigue el mismo gradiente. Las variantes con prefijo "I-" emplean una importance matrix construida con datos de calibración diversos (chat, código, razonamiento, tool-calling, trazas agénticas y Wikipedia).

La publicación incluye además un drafter de decodificación especulativa DSpark (Q8_0, atención y FFN en Q8_0, cabeza Markov en BF16, normas en F32) para usar con `--spec-type draft-dspark` en llama.cpp b12720 o superior, y un proyector de visión F16 generado con `convert_hf_to_gguf.py --mmproj`.

## Capacidades

- Generación de texto conversacional: la model card indica que una prueba breve de chat produjo respuestas coherentes en todas las variantes.
- Razonamiento y trazas agénticas: la importance matrix se calibró con datos de razonamiento, tool-calling y trazas de agentes, lo que sugiere soporte de esos flujos en el modelo base.
- Capacidades multimodales: el modelo es multimodal upstream y la visión se habilita cargando el sidecar `mmproj-Inkling-2-Mini-F16.gguf`.
- Decodificación especulativa: soporte de drafter DSpark para acelerar la generación en llama.cpp.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local de un MoE de 26B en estaciones de trabajo: con la variante I-Nano (11,34 GB) o I-Compact (14,10 GB) el modelo cabe en GPUs de consumo de gama alta, permitiendo desplegar un MoE grande sin infraestructura de centro de datos.
- Asistentes conversacionales autoalojados: la licencia Apache 2.0 y el formato GGUF permiten integrar el modelo en aplicaciones de chat privadas mediante llama.cpp u Ollama, sin dependencia de APIs externas.
- Flujos agénticos y tool-calling: la calibración de las variantes "I-" con trazas de agentes y tool-calling sugiere que el modelo base está orientado a estos escenarios; el drafter DSpark reduce la latencia en generaciones largas típicas de agentes.
- Procesamiento de documentos con imagen: cargando el proyector de visión (mmproj F16) junto con cualquier tier se pueden abordar tareas de descripción de imágenes o extracción de información visual.
- Evaluación de cuantizaciones en investigación: la model card publica perplejidad y KL divergence frente a BF16 para tres tiers, lo que permite a investigadores comparar el impacto de la compresión por rol de tensor en un MoE.
- Despliegue en LocalAI: al estar publicado por el equipo de LocalAI, los ficheros están pensados para integrarse directamente en ese stack (`endpoints_compatible`), facilitando servir el modelo con una API compatible con OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card indica explícitamente que no se ha ejecutado ninguna suite de benchmarks. Sí se publican métricas de fidelidad de cuantización:

| Tier | Tamano | PPL | KLD media | KLD mediana | KLD 99,9 % | Mismo token top-1 |
|---|---|---|---|---|---|---|
| BF16 (referencia) | 52,23 GB | 6,862 | — | — | — | — |
| APEX-Quality | 20,07 GB | 6,873 | 0,0063 | 0,0029 | 0,174 | 96,5 % |
| APEX-Compact | 14,10 GB | 6,965 | 0,0245 | 0,0127 | 0,632 | 93,2 % |
| APEX-I-Nano | 11,34 GB | 7,227 | 0,0701 | 0,0386 | 1,480 | 88,6 % |

Metodología: llama.cpp `29b52d398` con CUDA, `llama-perplexity` sobre el split de test de wikitext-2, contexto 512 y todos los chunks (mismo corpus, contexto y número de chunks para la referencia BF16 y cada tier). La KL divergence usa logits guardados una vez del GGUF BF16. El resto de tiers no han sido evaluados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más overhead de contexto; I-Nano ronda 11,3 GB, I-Compact 14,1 GB, Quality/Balanced en torno a 20-21 GB.
- GPU recomendadas: el autor indica que su hardware local es una NVIDIA DGX Spark (122 GB de memoria unificada) y que las cuantizaciones de modelos mayores se realizan en H100/H200/Blackwell alquiladas.
- GPU de consumo: las variantes Compact (14,10 GB) e I-Nano (11,34 GB) están pensadas para GPUs de consumo; la model card etiqueta Compact como "consumer GPUs".
- Opciones de despliegue: llama.cpp (versión b12720 o superior para el drafter DSpark), LocalAI (el autor es el equipo de LocalAI), y presumiblemente cualquier runtime compatible con GGUF; no se confirma soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles. El drafter DSpark está diseñado para acelerar la decodificación especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini (APEX GGUF) | 26,07 B (MoE, 8/128 activos) | no disponible | GGUF | Apache 2.0 | Cuantizaciones APEX con métricas PPL/KLD publicadas; multimodal vía sidecar |
| Inkling-2-Mini (BF16 original) | 26,07 B | no disponible | safetensors | Apache 2.0 | Referencia de calidad, 52,23 GB |
| unsloth/Inkling-2-Mini-GGUF | 26,07 B | no disponible | GGUF | Apache 2.0 | Cuantizaciones alternativas del mismo modelo base; comparte drafter DSpark byte a byte |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo tres de los ocho tiers (Quality, Compact, I-Nano) tienen métricas de perplejidad y KL divergence publicadas; el resto no han sido evaluados y no se ha ejecutado ninguna suite de benchmarks de tareas.
- Los tiers Quality y Balanced no son más pequeños que el checkpoint oficial (~19 GB en 4/8 bits): están pensados para obtener un GGUF estándar con k-quant, no para ahorrar espacio.
- El modelo base es multimodal upstream, pero los ficheros de tiers contienen solo el modelo de lenguaje; sin cargar el mmproj no hay visión.
- El drafter DSpark requiere llama.cpp b12720 o superior; la variante `_Old` solo funciona con builds antiguas del fork de Unsloth y no carga en llama.cpp mainline. Debe usarse un único drafter, no ambos.
- No hay información sobre sesgos, riesgo de alucinación específico, idiomas soportados ni longitud de contexto; estos datos deben validarse empíricamente antes de producción.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar las condiciones del modelo base original (thinkingmachines/Inkling-2-Mini) y del proyector de visión.
- El tamaño del repo (135 GB) incluye todas las variantes; descargar solo el fichero necesario.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/mudler/Inkling-2-Mini-APEX-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizaciones alternativas (Unsloth): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Proyecto APEX: https://github.com/localai-org/apex-quant
- LocalAI: https://github.com/mudler/LocalAI

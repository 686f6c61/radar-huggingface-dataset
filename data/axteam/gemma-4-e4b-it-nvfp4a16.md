# axteam/gemma-4-E4B-it-NVFP4A16

## Resumen

`axteam/gemma-4-E4B-it-NVFP4A16` es una cuantización de 4 bits del modelo multimodal `google/gemma-4-E4B-it`, publicada por el equipo axteam con el objetivo de servir el modelo de forma eficiente en vLLM. No es un modelo entrenado desde cero, sino un artefacto de post-training quantization (PTQ) que reduce el peso en disco hasta unos 10,3 GB manteniendo las activaciones en BF16 (esquema W4A16). El modelo base pertenece a la familia Gemma 4 de Google, con arquitectura densa y capacidad de procesar imagen, texto y audio (pipeline `image-text-to-text`).

El interés de esta ficha radica en que documenta una de las primeras cuantizaciones NVFP4 (FP4 E2M1) publicadas para un modelo Gemma 4, un formato pensado para aprovechar las unidades de cómputo FP4 de las GPU Blackwell de NVIDIA. La revisión del 1 de noviembre de 2026 reconstruyó los pesos aplicando suavizado AWQ real sobre atención y MLP, corrigiendo una primera subida en la que el suavizado no se había aplicado y el resultado era, en la práctica, round-to-nearest.

El modelo conserva tokenizador, `chat_template`, `processor_config` y `generation_config` idénticos al original, y mantiene en BF16 el torreón de visión, el de audio, las proyecciones multimodales, los embeddings y todas las normas (aproximadamente el 51 % de los parámetros). La licencia declarada es Apache-2.0 con enlace a la licencia específica de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (multimodal: texto, imagen, audio) |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1, grupo 16, escala FP8 E4M3 + escala global FP32 por tensor; activaciones BF16; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible (la calibración fue mayoritariamente en coreano e inglés) |
| Licencia | Apache-2.0 (enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4 con torres multimodales separadas para visión y audio, proyecciones específicas y una tabla de embeddings por capa (`embed_tokens_per_layer`). Esta versión no modifica la arquitectura: únicamente añade un bloque `quantization_config` al `config.json` original y sustituye los pesos linealmente cuantizables por tensores empaquetados en FP4.

La cuantización es PTQ con AWQ sobre 128 muestras de calibración (predominantemente coreanas, sin respuestas en modo thinking). El suavizado se aplica a las entradas de atención (q/k/v, y solo q en las capas con KV compartida), a las entradas del MLP (gate/up) y a la entrada de la proyección down. Se mantienen en BF16 el torreón de visión, el de audio, las proyecciones visión/audio, los embeddings de tokens (atados con `lm_head`), la tabla de embeddings por capa y todas las normas, lo que supone cerca del 51 % de los parámetros. No hay reentrenamiento ni QAT: la fidelidad depende exclusivamente de la calidad del suavizado AWQ y de la calibración.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat idéntica a la del modelo original de Google.
- Comprensión de imágenes (pipeline `image-text-to-text`), incluyendo preguntas y respuestas sobre contenido visual.
- Procesamiento de audio, ya que el torreón de audio se conserva en BF16 y no se cuantiza.
- Razonamiento y matemáticas de nivel medio, según los resultados medidos en GSM8K y MMLU.
- Capacidad multilingüe heredada del modelo base, con evaluación específica en coreano (KMMLU, HAE-RAE) además de inglés.
- Compatibilidad con vLLM y con el ecosistema `compressed-tensors`; el resto de capacidades (tool calling, agentes, thinking mode) no se documenta en la información disponible para esta cuantización.

## Casos de uso

- Servicio de inferencia multimodal en producción con vLLM: el formato NVFP4A16 está pensado para aprovechar el cómputo FP4 de GPU Blackwell, reduciendo el peso en disco a ~10,3 GB y permitiendo servir imagen-texto con menor huella de memoria que el BF16 original.
- Asistente conversacional con contexto de imágenes: el modelo puede responder preguntas sobre capturas, diagramas o fotografías manteniendo la plantilla de chat original, útil en herramientas de soporte técnico que reciben capturas de pantalla.
- Transcripción y análisis de audio combinado con texto: al conservar el torreón de audio en BF16, es adecuado para resúmenes de reuniones o notas de voz con preguntas posteriores.
- Evaluación comparativa de cuantizaciones: sirve como referencia práctica para medir la pérdida de fidelidad de NVFP4 frente a FP8-dynamic o AWQ-8bit usando el mismo harness de lm-evaluation-harness.
- Despliegue en clústeres con GPU Blackwell de gama alta: la combinación de pesos FP4 y activaciones BF16 encaja en pipelines de vLLM ≥ 0.19.0 ya probados por el autor.
- Prototipado de aplicaciones de visión y lenguaje en investigación: permite reproducir experimentos con Gemma 4 multimodal en una sola GPU sin cargar los ~16 GB del checkpoint BF16.
- Generación de documentación técnica a partir de imágenes: por ejemplo, describir diagramas de arquitectura o tablas escaneadas y exportar el resultado a Markdown.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, greedy y few-shot completion sin plantilla de chat. Los porcentajes entre paréntesis indican la recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 62,16 | 63,20 (101,7 %) | 62,40 (100,4 %) | 64,48 (103,7 %) | 62,14 (100,0 %) | 64,16 (103,2 %) |
| GSM8K (5-shot, strict) | 84,31 | 84,00 (99,6 %) | 84,08 (99,7 %) | 82,71 (98,1 %) | 79,83 (94,7 %) | 81,73 (96,9 %) |
| ARC-Challenge (0-shot) | 56,91 | 57,34 (100,7 %) | 56,66 (99,6 %) | 56,66 (99,6 %) | 55,20 (97,0 %) | 55,97 (98,4 %) |
| Winogrande (5-shot) | 66,30 | 65,75 (99,2 %) | 66,85 (100,8 %) | 65,51 (98,8 %) | 66,46 (100,2 %) | 65,43 (98,7 %) |
| KMMLU (5-shot, direct) | 51,46 | 51,24 (99,6 %) | 51,46 (100,0 %) | 50,15 (97,5 %) | 49,11 (95,4 %) | 51,31 (99,7 %) |
| HAE-RAE (0-shot) | 69,84 | 69,02 (98,8 %) | 69,57 (99,6 %) | 69,48 (99,5 %) | 68,10 (97,5 %) | 68,10 (97,5 %) |
| **Media** | **65,16** | **65,09 (99,9 %)** | **65,17 (100,0 %)** | **64,83 (99,5 %)** | **63,47 (97,4 %)** | **64,45 (98,9 %)** |

Fidelidad respecto al BF16 original sobre un conjunto interno mixto inglés/coreano de 100 prompts:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,3854 | 1,3032 (+6,3 %) |
| Acuerdo top-1 en el siguiente token | 91,6 % | 99,2 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el peso en disco es de ~10,3 GB; en vLLM con pesos empaquetados FP4 y activaciones BF16 se necesita espacio adicional para caché KV, activaciones y el torreón multimodal en BF16. Como referencia, no cabe en GPU de 8 GB y sí en GPU de 16 GB o más con margen limitado.
- GPU recomendadas: el formato NVFP4 requiere soporte de cómputo FP4, disponible en la generación Blackwell de NVIDIA (por ejemplo, B200). El autor probó el modelo con vLLM 0.32; la arquitectura Gemma 4 está integrada en vLLM ≥ 0.19.0.
- GPU de consumo: no hay datos publicados sobre funcionamiento en RTX 4090 u otras GPU Ada, ya que NVFP4 no es un formato nativo de esas arquitecturas.
- Opciones de despliegue: vLLM con soporte de compressed-tensors `nvfp4-pack-quantized`; no se documenta soporte en llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/gemma-4-E4B-it-NVFP4A16 | 7,94 B (denso) | no disponible | NVFP4A16, safetensors | Apache-2.0 | HuggingFace, vLLM ≥ 0.19.0 |
| google/gemma-4-E4B-it (BF16) | 7,94 B (denso) | no disponible | BF16, safetensors | Apache-2.0 | HuggingFace, transformers |
| Variante FP8-dynamic del mismo modelo base | 7,94 B (denso) | no disponible | FP8, safetensors | Apache-2.0 | Referenciada en los benchmarks del autor |
| Variante AWQ-8bit del mismo modelo base | 7,94 B (denso) | no disponible | AWQ 8-bit | Apache-2.0 | Referenciada en los benchmarks del autor |

No se dispone de información sobre modelos comparables de otros fabricantes con el mismo tamaño y modalidad.

## Limitaciones y advertencias

- Es una cuantización PTQ sin reentrenamiento: la perplejidad aumenta un 6,3 % y el acuerdo top-1 baja al 91,6 % respecto al BF16 original.
- La calibración se hizo con 128 muestras mayoritariamente en coreano y sin respuestas en modo thinking; el comportamiento en otros idiomas y en tareas de razonamiento largo puede degradarse más de lo que reflejan los benchmarks.
- La primera subida del repositorio (revisión `667b2d3`, anterior al 2026-11-01 08:46:18 UTC) era efectivamente round-to-nearest pese a estar etiquetada como AWQ; es necesario descargar la revisión reconstruida.
- El formato NVFP4 depende de hardware Blackwell; en GPU sin soporte FP4 nativo el rendimiento puede no ser el esperado o el modelo puede no cargar.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización; conviene validar salidas en dominios sensibles.
- Sesgos del modelo base heredados sin cambios; no se documentan evaluaciones de sesgo específicas para esta cuantización.
- La licencia Apache-2.0 remite a la licencia de Gemma 4 de Google; es necesario revisar sus términos de uso comercial antes de desplegar en producción.
- No se documentan capacidades de tool calling, agentes ni modo thinking para esta variante concreta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/axteam/gemma-4-E4B-it-NVFP4A16
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness

# axteam/gemma-4-E4B-it-NVFP4

## Resumen

Gemma 4 E4B IT NVFP4 es una versión cuantizada a 4 bits del modelo multimodal `google/gemma-4-E4B-it` de Google, producida por el equipo axteam para su despliegue eficiente en vLLM. El modelo base es un transformer denso de la familia Gemma 4 con capacidad de procesamiento de imagen, texto y audio (pipeline `image-text-to-text`), y esta cuantización reduce el peso en disco hasta aproximadamente 10,3 GB frente a los 20,6 GB del repositorio original.

La cuantización emplea el esquema NVFP4 (W4A4, FP4 E2M1) con pesos agrupados en grupos de 16, escala FP8 E4M3 por grupo y escala global FP32 por tensor, almacenado en formato `compressed-tensors` `nvfp4-pack-quantized`. Se aplicó AWQ (activation-aware weight quantization) como método PTQ con 128 muestras de calibración, sin reentrenamiento. La revisión del 1 de noviembre de 2026 corrigió un fallo previo en el que el suavizado AWQ no se aplicaba realmente, dejando el modelo en la práctica como round-to-nearest.

El modelo es relevante para quienes necesitan servir un modelo multimodal de ~8.000 millones de parámetros en GPUs con soporte FP4 (Blackwell y posteriores) manteniendo una fidelidad razonable respecto al original BF16: la recuperación media en benchmarks es del 97,4 % y la perplejidad aumenta un 13,3 % respecto al BF16. La licencia es Apache-2.0 según la model card, con enlace a la licencia específica de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (multimodal: visión, audio, texto) |
| Parametros totales | 7.941.100.874 (~7,94 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 E2M1); pesos en grupos de 16 con escala FP8 E4M3 y escala global FP32; activaciones FP4; vision tower, audio tower, proyecciones, embeddings y normas en BF16 (~51 % de los parámetros) |
| Idiomas soportados | no disponible en la informacion proporcionada (calibración con mezcla inglés/coreano) |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors con `compressed-tensors` (`nvfp4-pack-quantized`) |
| Tamano en disco | ~10,3 GB (repositorio: 20,6 GB) |
| Runtime | vLLM ≥ 0.19.0 (probado con vLLM 0.32.0) |
| Metodo de cuantizacion | PTQ con AWQ, 128 muestras de calibración |
| Modelo base | google/gemma-4-E4B-it |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4 con torres de visión y audio, proyecciones multimodales y una tabla de embeddings por capa (`embed_tokens_per_layer`) además de los embeddings de tokens compartidos con `lm_head`. La cuantización deja en BF16 la torre de visión, la torre de audio, las proyecciones visión/audio, los embeddings de tokens, la tabla de embeddings por capa y todas las normas, lo que supone aproximadamente el 51 % de los parámetros totales. El resto de pesos y las activaciones se cuantizan a FP4.

El proceso de cuantización es PTQ con AWQ sobre 128 muestras de calibración (predominantemente en coreano y sin respuestas en modo thinking). El suavizado AWQ se aplica a las entradas de atención (q/k/v, y solo q en las capas con KV compartida), a las entradas del MLP (gate/up) y a la entrada de la proyección down. La revisión del 1 de noviembre de 2026 reconstruyó los pesos porque la primera subida, etiquetada como AWQ, en realidad no había aplicado el suavizado y era equivalente a RTN. El tokenizador, la `chat_template`, el `processor_config` y el `generation_config` son idénticos byte a byte al original, incluida la corrección de la `chat_template` de julio de 2026.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `image-text-to-text`, tags `conversational`).
- Procesamiento de imagen y audio: el modelo conserva las torres de visión y audio en BF16, por lo que mantiene las capacidades multimodales del base.
- Razonamiento y matemáticas: evaluado en GSM8K (5-shot estricto) con 79,83 puntos, un 94,7 % de recuperación respecto al BF16.
- Conocimiento general y multilingüe: evaluado en MMLU (5-shot) y KMMLU (coreano), con recuperación del 100,0 % y 95,4 % respectivamente.
- Tool calling / function calling: no se documenta explícitamente en la información proporcionada; debe verificarse contra la model card del base.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información proporcionada.
- Modo thinking: la calibración excluyó respuestas en modo thinking, pero no se especifica si el modelo lo soporta; consultar el base.

## Casos de uso

- Servicio de chat multimodal en producción: el modelo acepta imagen y texto en la misma petición y puede desplegarse en vLLM con pesos FP4, lo que reduce la huella de memoria a ~10,3 GB y permite atender conversaciones multi-turno en GPUs con soporte FP4.
- Asistencia sobre documentos escaneados: al conservar la torre de visión en BF16, puede extraer y razonar sobre texto en imágenes (facturas, formularios) sin la pérdida de calidad que supondría cuantizar el encoder visual.
- Transcripción y análisis de audio: la torre de audio permanece en BF16, lo que permite tareas de comprensión de audio combinadas con razonamiento textual.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir el impacto de NVFP4 frente a FP8, AWQ-8bit y AWQ-4bit en el mismo harness (lm-evaluation-harness sobre vLLM), con datos publicados de recuperación por benchmark.
- Despliegue en entornos con restricciones de VRAM: al ocupar ~10,3 GB en disco y requerir FP4 nativo, encaja en GPUs Blackwell de gama media-alta donde el BF16 original no cabría con contexto largo.
- Razonamiento matemático en producción: con un 94,7 % de recuperación en GSM8K, es adecuado para asistentes de resolución de problemas aritméticos donde el coste por token es crítico.
- Aplicaciones multilingües con foco en coreano: la calibración incluyó muestras coreanas y se reportan KMMLU y HAE-RAE, lo que lo hace apto para productos dirigidos a ese mercado.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, few-shot completion sin chat template. Porcentajes entre paréntesis = recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (este repo) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 62,16 | 63,20 (101,7 %) | 62,40 (100,4 %) | 64,48 (103,7 %) | 62,14 (100,0 %) | 64,16 (103,2 %) |
| GSM8K (5-shot, strict) | 84,31 | 84,00 (99,6 %) | 84,08 (99,7 %) | 82,71 (98,1 %) | 79,83 (94,7 %) | 81,73 (96,9 %) |
| ARC-Challenge (0-shot) | 56,91 | 57,34 (100,7 %) | 56,66 (99,6 %) | 56,66 (99,6 %) | 55,20 (97,0 %) | 55,97 (98,4 %) |
| Winogrande (5-shot) | 66,30 | 65,75 (99,2 %) | 66,85 (100,8 %) | 65,51 (98,8 %) | 66,46 (100,2 %) | 65,43 (98,7 %) |
| KMMLU (5-shot, direct) | 51,46 | 51,24 (99,6 %) | 51,46 (100,0 %) | 50,15 (97,5 %) | 49,11 (95,4 %) | 51,31 (99,7 %) |
| HAE-RAE (0-shot) | 69,84 | 69,02 (98,8 %) | 69,57 (99,6 %) | 69,48 (99,5 %) | 68,10 (97,5 %) | 68,10 (97,5 %) |
| **Media** | **65,16** | **65,09 (99,9 %)** | **65,17 (100,0 %)** | **64,83 (99,5 %)** | **63,47 (97,4 %)** | **64,45 (98,9 %)** |

Fidelidad respecto al BF16 en un conjunto interno mixto inglés/coreano de 100 prompts (respuestas greedy del original, puntuadas con el mismo código):

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,4769 | 1,3032 (+13,3 %) |
| Acuerdo top-1 en el siguiente token | 88,0 % | 99,2 % |

## Requisitos de hardware

- VRAM estimada para inferencia: ~10,3 GB solo para pesos; el espacio adicional para KV cache y activaciones depende de la longitud de contexto y del batch, datos no disponibles.
- GPU recomendadas: GPUs con soporte nativo de FP4 (arquitectura Blackwell, p. ej. B200, RTX 50xx); el esquema NVFP4 requiere hardware compatible con FP4 para rendir según lo previsto.
- GPU de consumo: cabe en GPUs consumer con soporte FP4; en GPUs sin FP4 (Ampere, Ada) el rendimiento será inferior o requerirá emulación, no documentada en la información disponible.
- Opciones de despliegue: vLLM ≥ 0.19.0 (probado con 0.32.0). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **gemma-4-E4B-it NVFP4 (este repo)** | 7,94 mil M | no disponible | NVFP4 W4A4, compressed-tensors | Apache-2.0 | HuggingFace, vLLM ≥ 0.19.0 |
| google/gemma-4-E4B-it (BF16) | 7,94 mil M | no disponible | BF16 safetensors | Apache-2.0 | HuggingFace, transformers/vLLM |
| gemma-4-E4B-it FP8-dynamic | 7,94 mil M | no disponible | FP8 | Apache-2.0 | Referencia en la model card |
| gemma-4-E4B-it AWQ-4bit | 7,94 mil M | no disponible | AWQ 4-bit | Apache-2.0 | Referencia en la model card |

En la comparativa interna del autor, NVFP4 queda por debajo de FP8-dynamic, AWQ-8bit y AWQ-4bit en media de benchmarks (63,47 frente a 65,09, 65,17 y 64,45), y por encima de NVFP4A16 en esa misma media (64,83). No se dispone de comparación con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- La cuantización NVFP4 degrada la fidelidad: perplejidad +13,3 % y acuerdo top-1 del 88,0 % frente al 99,2 % del BF16; la recuperación media en benchmarks es del 97,4 %.
- GSM8K es el benchmark más afectado (94,7 % de recuperación), por lo que no es recomendable para tareas matemáticas donde se exija paridad con el BF16.
- La calibración AWQ se hizo con 128 muestras predominantemente coreanas y sin respuestas en modo thinking; el comportamiento puede desviarse en otros idiomas o en modo razonamiento.
- La primera revisión del repositorio (anterior al 1 de noviembre de 2026, revisión `4424b6f`) no aplicó realmente el suavizado AWQ; si se descargó antes de esa fecha, hay que volver a descargar.
- Requiere hardware con soporte FP4 y vLLM ≥ 0.19.0; no se documenta compatibilidad con llama.cpp, Ollama ni TGI.
- Licencia Apache-2.0 según la model card, pero con enlace a la licencia específica de Gemma 4 de Google; conviene revisar los términos de uso comercial de Gemma 4 antes de desplegar en producción.
- No se documentan sesgos específicos ni evaluación de alucinación en la información proporcionada.
- Longitud de contexto e idiomas soportados no están disponibles en la información proporcionada; deben consultarse en la model card del base.

## Enlaces

- HuggingFace: https://huggingface.co/axteam/gemma-4-E4B-it-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness

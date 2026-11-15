# keptn/gemma4-12b-heretic-ara-i8g

## Resumen

keptn/gemma4-12b-heretic-ara-i8g es una cuantización int8 del modelo Gemma 4 12B-it de Google, al que se le han eliminado los rechazos (refusals) mediante el método ARA de Heretic 2.0.0. El resultado es un modelo multimodal (texto, imagen y audio) de 12.000 millones de parámetros, empaquetado en un único fichero de 13,79 GiB en formato propietario `.rad` para el motor de inferencia radiance 2.0.0 sobre GPUs AMD RDNA4.

El modelo deriva de llmfan46/gemma-4-12B-it-uncensored-heretic, que a su vez parte de google/gemma-4-12B-it-assistant. La cuantización int8 aplica una escala bf16 por cada 128 pesos en todas las capas lineales del tronco, con activaciones int8 (una escala por token y 128 valores) y lm_head también en int8. Incluye la cabeza asistente (assistant head) de Google en bf16 para decodificación especulativa con 3 tokens de borrador.

Es relevante para quienes despliegan modelos Gemma 4 en hardware AMD con el motor radiance: ofrece un contexto de 262.144 tokens, soporte de visión y audio, y una penalización de calidad medida frente al original bf16 de Google (KL medio de 0,0867, 92,2% de coincidencia en el token top-1). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen, audio), basado en Gemma 4 12B-it |
| Parametros totales | 12.000 millones (12B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | int8 (pesos, activaciones y lm_head), escalas bf16; cabeza asistente en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato propietario del motor radiance 2.0.0) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 12B-it de Google, un transformer multimodal que acepta entradas de texto, imagen y audio. El modelo original fue entrenado por Google; sobre él, llmfan46 aplicó el método ARA de Heretic v1.2.0 para eliminar los rechazos, y keptn realizó la cuantización int8 y el empaquetado para radiance. No se dispone de detalles sobre el volumen de tokens de entrenamiento ni la composición del dataset.

La innovación técnica destacable es la integración de la cabeza asistente (assistant head) de Google en bf16 para decodificación especulativa con 3 tokens de borrador, lo que acelera la generación. La cuantización int8 usa redondeo al más cercano con una escala bf16 por cada 128 pesos en las capas lineales del tronco, activaciones int8 con una escala por token y 128 valores, y lm_head int8. El fichero incluye también la lm_head de la cabeza asistente en int8. El contexto máximo configurable es de 262.144 tokens.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable por petición (`enable_thinking: true`).
- Comprensión de imágenes (pipeline image-text-to-text).
- Comprensión de audio.
- Decodificación especulativa mediante cabeza asistente con 3 tokens de borrador.
- Contexto largo de hasta 262.144 tokens.
- Respuestas sin rechazos: el modelo contesta peticiones que el original rechaza (7/100 rechazos por keyword frente a 99/100 del original).
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos largos con imágenes: el contexto de 262.144 tokens permite ingerir manuales, informes o expedientes completos con figuras intercaladas y hacer preguntas sobre ellos en una sola sesión.
- Transcripción y análisis de audio: al aceptar entrada de audio, puede integrarse en pipelines de reuniones o atención telefónica para resumir y extraer acciones.
- Investigación sobre alineación y robustez: la eliminación de rechazos medida (3/100 por clasificador frente a 97/100 del original) lo hace útil para estudiar comportamiento de modelos abliterated en entornos controlados.
- Despliegue en infraestructura AMD: el formato `.rad` y el motor radiance 2.0.0 permiten servir el modelo en GPUs RDNA4 (probado en una y dos Radeon AI PRO R9700) sin depender de CUDA.
- Generación asistida con baja latencia: la decodificación especulativa con 3 tokens de borrador ofrece 90,0 y 129,8 tokens por segundo en una tarjeta con dos prompts de prueba, adecuado para chat interactivo.
- Evaluación comparativa de cuantizaciones: la tabla de calidad (KL medio 0,0867, percentil 99 de 1,26, 92,2% de coincidencia top-1) permite comparar el impacto de int8 frente a alternativas como la cuantización a4 del mismo autor.
- Sesiones multi-turno concurrentes: con 8 secuencias y KV cache bf16, una tarjeta soporta 977.904 tokens de contexto en total (3,7 sesiones completas) y dos tarjetas 1.474.480 (5,6 sesiones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye métricas de calidad y velocidad internas:

| Metrica | Este fichero | keptn/gemma4-12b-heretic-ara-a4 | keptn/gemma4-12b-i8g (Google) |
|---|---|---|---|
| KL medio (vs. bf16 de Google) | 0,0867 | 0,140 | 0,00542 |
| KL percentil 99 | 1,26 | 1,91 | 0,0659 |
| Token top-1 coincidente | 92,2% | 89,7% | 97,9% |
| Ratio de perplejidad | ×1,021 | ×1,013 | ×1,000 |

| Metrica de velocidad (1 tarjeta, i8 KV, 3 draft tokens, greedy) | Valor |
|---|---|
| Tokens por segundo, prompt 1 | 90,0 |
| Tokens por segundo, prompt 2 | 129,8 |
| Referencia keptn/gemma4-12b-i8g, prompt 1 | 94,5 |
| Referencia keptn/gemma4-12b-i8g, prompt 2 | 131,3 |

| Rechazos (bf16, 100 prompts de mlabonne/harmful_behaviors) | Este modelo | Original de Google |
|---|---|---|
| Por keyword | 7/100 | 99/100 |
| Por clasificador VINAY-UMRETHE/Refusal-Classifier | 3/100 | 97/100 |

Divergencia KL de Heretic frente al original en el primer token de 100 prompts inocuos (mlabonne/harmless_alpaca): 0,1215.

## Requisitos de hardware

- VRAM: el fichero ocupa 13,79 GiB. Con KV cache bf16 a 262.144 tokens y 8 secuencias, radiance reporta 18,12 GiB por tarjeta con 1 tarjeta y 24,10 GiB por tarjeta con 2 tarjetas.
- GPUs recomendadas: AMD RDNA4; probado en una y dos Radeon AI PRO R9700 (32 GB). Soporta 1, 2 o 4 tarjetas con 32 GB mediante `tp` y `p2p`.
- Cabe en GPU de consumo: no disponible en la información proporcionada (solo se documentan tarjetas profesionales RDNA4 de 32 GB).
- Opciones de despliegue: exclusivamente el motor radiance 2.0.0 o superior (imagen Docker `stilldeadcode/radiance:2.0.0`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 90,0 y 129,8 tokens por segundo en una tarjeta, i8 KV, 3 tokens de borrador, greedy, dos prompts.
- El motor arranca y sirve cuando la caché admite menos de 8 sesiones de longitud completa; informa del número de sesiones al inicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Calidad (KL medio vs. bf16 Google) | Licencia | Hardware |
|---|---|---|---|---|---|---|
| keptn/gemma4-12b-heretic-ara-i8g | 12B | 262.144 | `.rad` int8 | 0,0867 | Apache 2.0 | AMD RDNA4, radiance |
| keptn/gemma4-12b-heretic-ara-a4 | 12B | 262.144 | `.rad` (a4) | 0,140 | Apache 2.0 | AMD RDNA4, radiance |
| keptn/gemma4-12b-i8g (Google, sin heretic) | 12B | 262.144 | `.rad` int8 | 0,00542 | Apache 2.0 | AMD RDNA4, radiance |
| llmfan46/gemma-4-12B-it-uncensored-heretic | 12B | no disponible | safetensors bf16 | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo abliterated: responde a peticiones que el original rechaza (3/100 rechazos por clasificador frente a 97/100). El autor declara que la responsabilidad de uso recae en el usuario.
- Riesgo de alucinación: no se han publicado métricas específicas; la cuantización int8 añade una degradación medible (ratio de perplejidad ×1,021 frente a ×1,000 del original).
- La calidad reportada se mide frente al bf16 de Google, no frente al modelo heretic bf16, por lo que mezcla el efecto de la eliminación de rechazos y el redondeo int8.
- Las métricas de rechazos se midieron sobre el checkpoint bf16 en HF transformers, no sobre este fichero `.rad`.
- Formato propietario: solo funciona con radiance 2.0.0 o superior; no es compatible con ecosistemas CUDA ni con herramientas estándar como llama.cpp o vLLM.
- Hardware restringido: requiere GPUs AMD RDNA4; no se documenta funcionamiento en otras arquitecturas.
- Idiomas soportados no especificados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base de Google deben verificarse por separado.
- El autor sustituyó el `config.json`, la plantilla de chat, los ficheros del tokenizer y la configuración de generación del checkpoint heretic por los de Google, porque el original carecía de cuatro tamaños de visión y audio y usaba una plantilla de chat antigua.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-12b-heretic-ara-i8g
- Modelo base heretic: https://huggingface.co/llmfan46/gemma-4-12B-it-uncensored-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-12B-it-assistant
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
- Cuantización a4 del mismo autor: https://huggingface.co/keptn/gemma4-12b-heretic-ara-a4
- Cuantización i8g del modelo de Google: https://huggingface.co/keptn/gemma4-12b-i8g
- Dataset de rechazos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de prompts inocuos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Clasificador de rechazos: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier
- Dataset MT-Bench human judgments: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments

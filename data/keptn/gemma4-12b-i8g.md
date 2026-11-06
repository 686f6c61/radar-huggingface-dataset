# keptn/gemma4-12b-i8g

## Resumen

Keptn/gemma4-12b-i8g es una cuantización int8 del modelo google/gemma-4-12B-it, preparada específicamente para el motor de inferencia radiance sobre GPUs AMD RDNA4. No es un modelo nuevo, sino un empaquetado optimizado: los pesos del trunk están cuantizados a int8 con una escala bf16 por cada 128 pesos, y el archivo completo ocupa 13,79 GiB en un único fichero `.rad`. Incluye además la cabeza de asistente de Google (gemma-4-12B-it-assistant) para decodificación especulativa con 3 tokens borrador.

Su relevancia radica en el ecosistema AMD: es una de las pocas variantes cuantizadas de Gemma 4 12B pensadas para ROCm y tarjetas RDNA4 como la Radeon AI PRO R9700, con soporte multimodal completo (texto, imagen y audio), contexto de 262.144 tokens y mediciones de calidad y velocidad publicadas por el propio autor. Es un modelo base (no instruct adicional), con licencia Apache 2.0, pipeline image-text-to-text y soporte de 1, 2 o 4 tarjetas de 32 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), con torre de visión y codificador de audio |
| Parametros totales | 12B (aproximado por denominación; no disponible cifra exacta) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | int8 por peso con escala bf16 por cada 128 pesos; activaciones int8 con escala por token y 128 valores; torre de visión, codificador de audio y normas en precisión original |
| Idiomas soportados | no disponible (heredados de google/gemma-4-12B-it) |
| Licencia | Apache 2.0 |
| Formato de pesos | Fichero único `.rad` (gemma4-12b-i8g.rad, 13,79 GiB), cuantización compressed-tensors; repo de 14,8 GB |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-12B-it, un transformer multimodal de 12B parámetros con instrucciones, al que se añade la cabeza de asistente de google/gemma-4-12B-it-assistant para habilitar decodificación especulativa tipo MTP (multi-token prediction) con 3 tokens borrador. La variante i8g conserva sin cuantizar la torre de visión, el codificador de audio y todas las normas, mientras que la atención, las capas feed-forward, el lm_head y la assistant head se redondean a int8.

El proceso de conversión (realizado con `rad-convert` y la receta `gemma4-12b-i8g`) reutilizó los tensores del fichero bf16 de keptn, sin datos de calibración: la cuantización es por redondeo al más cercano. No hay entrenamiento adicional en esta variante; el entrenamiento original de Gemma 4 por Google no está descrito en la model card.

## Capacidades

- Generación de texto con instrucciones (modelo base instruct de Gemma 4 12B).
- Comprensión de imágenes: entrada de imágenes junto a texto (pipeline image-text-to-text), validada con DocVQA y AI2D.
- Comprensión de audio: transcripción y procesamiento de audio, validada con LibriSpeech test-clean (WER 6,81% en radiance frente a 6,68% en HF).
- Modo thinking opcional por petición (`enable_thinking: true` en el chat template).
- Decodificación especulativa con 3 tokens borrador mediante la assistant head de Gemma 4.
- Contexto largo de 262.144 tokens con caché KV en bf16.
- Soporte de tool calling / agentes: no disponible en la información proporcionada.

## Casos de uso

- Servidor de inferencia multimodal en estaciones de trabajo AMD: despliegue vía Docker con radiance sobre RDNA4, exponiendo una API en el puerto 8000 con soporte de hasta 8 secuencias concurrentes.
- Análisis y pregunta-respuesta sobre documentos: la torre de visión sin cuantizar mantiene respuestas idénticas al original bf16 en 20/20 casos de DocVQA y AI2D, adecuado para RAG visual y extracción de datos de documentos escaneados.
- Transcripción y procesamiento de voz: el codificador de audio permite transcribir clips (WER ~6,8% en LibriSpeech test-clean) sin un modelo ASR separado.
- Procesamiento de contextos muy largos: con 262.144 tokens de ventana, permite resumir o consultar documentos extensos, repositorios de código o transcripciones completas en una sola petición.
- Chat de alto rendimiento multiusuario: con 4 tarjetas alcanza 250 tokens/s en decodificación de un stream y 714 tokens/s agregados en 4 streams, apto para servir a varios usuarios simultáneos.
- Generación de código y razonamiento con thinking mode: el modo thinking activable por petición permite cadenas de razonamiento más profundas en tareas complejas.
- Experimentación con decodificación especulativa en hardware de consumo pro: configuración ajustable de tokens borrador (`--num-speculative-tokens`) para comparar latencia con y sin especulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica mediciones propias de velocidad y fidelidad respecto al original bf16:

Velocidad en Radeon AI PRO R9700 (215 W, KV bf16, 3 tokens borrador, thinking off, temperatura 0,7), tokens/s (mediana):

| Métrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decodificación, un stream | 104,6 | 174,7 | 250,0 |
| Prefill a 24k tokens | 3.597 | 5.883 | 7.069 |
| 4 streams, total | 306 | 506 | 714 |

Fidelidad respecto al original bf16 (80 preguntas MT-Bench, ambas rondas, 42.283 tokens de respuesta):

| Fichero | KL media | KL percentil 99 | Top token igual | Ratio de perplejidad |
|---|---|---|---|---|
| gemma4-12b-i8g | 0,00416 | 0,0535 | 98,1% | ×1,004 |
| keptn/gemma4-12b-bf16 | 0,00026 | 0,00325 | 99,6% | ×1,000 |

Multimodal (greedy, thinking off, 2 tarjetas): imágenes 20/20 respuestas idénticas (KL media 0,00184); audio 11/12 idénticas (KL media 0,00068), WER 6,68% (HF) frente a 6,81% (radiance).

## Requisitos de hardware

- VRAM: el fichero pesa 13,79 GiB; se necesitan 1, 2 o 4 tarjetas de 32 GB. Probado en Radeon AI PRO R9700 (RDNA4, gfx1201). No indicado para GPUs NVIDIA.
- Con contexto máximo (262.144 tokens, KV bf16) y 8 secuencias, el pool de KV compartido alcanza ~1,05M tokens con 1 tarjeta y ~1,79M con 4 tarjetas, según el informe de arranque de radiance.
- Consumer GPU: no verificado; la model card solo confirma la Radeon AI PRO R9700. Tarjetas RDNA4 de 32 GB serían candidatas, pero no hay datos publicados.
- Despliegue: exclusivamente mediante el motor radiance (requiere el PR #338, aún sin release estable), vía docker compose o `docker run` con ROCm (`/dev/kfd`, `/dev/dri`). No compatible con vLLM, llama.cpp, Ollama o TGI al usar el formato `.rad` propietario.
- Tensor parallelismo configurable (`--tp 1/2/4`) con P2P activable; throughput escalable de 306 a 714 tokens/s agregados entre 1 y 4 tarjetas.
- Latencia individual: no disponible más allá de los tokens/s medidos; prefill de ~3.600 tokens/s con una tarjeta.

## Comparativa con modelos similares

| Modelo | Cuantización | Tamaño fichero | Contexto | Multimodal | Licencia | Motor |
|---|---|---|---|---|---|---|
| keptn/gemma4-12b-i8g | int8 (escalas bf16) | 13,79 GiB | 262.144 | Imagen + audio | Apache 2.0 | radiance (AMD RDNA4) |
| keptn/gemma4-12b-bf16 | bf16 (sin cuantizar) | no disponible | 262.144 | Imagen + audio | Apache 2.0 | radiance / HF transformers |
| google/gemma-4-12B-it | bf16 (original) | no disponible | no disponible | Imagen + audio | no disponible en la ficha | HF transformers |

La variante i8g sacrifica una fidelidad mínima (98,1% de top token coincidente, ratio de perplejidad ×1,004) a cambio de reducir el fichero a 13,79 GiB, cabiendo en una sola tarjeta de 32 GB con margen para la caché KV.

## Limitaciones y advertencias

- Requiere el motor radiance con el PR #338, que aún no está en una release estable: hay que compilar la imagen Docker desde la rama del PR.
- Cuantización sin datos de calibración (redondeo al más cercano): la degradación es pequeña pero medible (KL media 0,00416; 1,9% de tokens top distintos frente al bf16).
- El WER en audio empeora ligeramente en radiance (6,81% frente a 6,68% en HF transformers).
- Exclusivo para GPUs AMD RDNA4 con ROCm; no hay soporte documentado para NVIDIA ni CPU.
- Descargas y adopción prácticamente nulas (0 descargas, 1 like en Hugging Face): proyecto muy reciente y de nicho, con riesgo de abandono o cambios incompatibles.
- Sesgos, alucinaciones y soporte de idiomas: los inherentes al modelo base google/gemma-4-12B-it; no se documentan específicamente en esta ficha.
- Licencia Apache 2.0 sin restricciones comerciales conocidas, aunque los términos del modelo base de Google podrían aplicar al uso del modelo original.

## Enlaces

- Modelo: https://huggingface.co/keptn/gemma4-12b-i8g
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo base (assistant head): https://huggingface.co/google/gemma-4-12B-it-assistant
- Variante bf16 del mismo autor: https://huggingface.co/keptn/gemma4-12b-bf16
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
- PR #338 de radiance (soporte gemma4-12b): https://codeberg.org/StillDeadcode/radiance/pulls/338
- Framework de model cards del autor: https://codeberg.org/keptn42/radiance-model-cards-framework (enlace truncado en la model card original)

# keptn/nemotron-3.5-bolt-e4b-i8g

## Resumen
keptn/nemotron-3.5-bolt-e4b-i8g es una conversión cuantizada a int8 del modelo NVIDIA Nemotron 3.5 Bolt E4B, empaquetada en un único fichero de 12,85 GiB en formato propietario `.rad` para el motor de inferencia radiance sobre GPUs AMD RDNA4. El modelo original lo desarrolla NVIDIA y combina una torre de visión en bf16, un codificador de audio y un trunk int8 con decodificación especulativa mediante el drafter DFlash de NVIDIA (5 capas, 7 tokens de borrador). Está pensado para despliegues multimodales (texto, imagen y audio) en hardware AMD profesional, no en ecosistemas CUDA.

La relevancia de esta ficha es doble: por un lado, documenta una ruta de ejecución de modelos de frontera en GPUs AMD RDNA4 (Radeon AI PRO R9700) mediante ROCm y el motor radiance; por otro, cuantifica con rigor la pérdida de calidad frente al original en bf16, con una KL media de 0,00275 sobre 42.283 tokens de respuesta en MT-Bench y un 98,4% de coincidencia en el token top-1. El contexto declarado es de 65.536 tokens y el pipeline es image-text-to-text.

La licencia es openmdw-1.1 (etiquetada como "other" en Hugging Face), heredada del modelo base de NVIDIA, y conviene revisarla antes de cualquier uso comercial. El repositorio tiene 40,7 GB y 142 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (trunk de lenguaje + torre de visión + codificador de audio) con decodificación especulativa DFlash; detalles internos de capas y atención no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (la nomenclatura E4B sugiere mezcla de expertos, sin confirmar en la informacion) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | int8 W8A8 en el trunk (una escala bf16 por cada 128 pesos; activaciones int8 con una escala por token y 128 valores); lm_head int8; drafter DFlash int8 con escala f16; torre de visión y codificador de audio en bf16 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (etiqueta `license:other` en Hugging Face) |
| Formato de pesos | `.rad` (formato propietario de radiance), fichero único de 12,85 GiB |

## Arquitectura y entrenamiento
El modelo base es NVIDIA Nemotron 3.5 Bolt E4B, del que esta ficha no documenta el número de parámetros totales ni la composición del dataset de entrenamiento, por lo que esos datos se consideran no disponibles. La conversión mantiene la arquitectura del original: un trunk de lenguaje cuantizado a int8 con cuantización por bloques de 128 pesos y escalas en bf16, un `lm_head` también int8 y dos codificadores multimodales que permanecen en bf16, la torre de visión y el codificador de audio. El contexto máximo configurable es de 65.536 tokens con caché KV en bf16.

La innovación técnica destacable es la integración del drafter DFlash de NVIDIA para decodificación especulativa: 5 capas, cuantizado a int8 con escala f16 por cada 128 pesos, que genera 7 tokens de borrador por paso. El drafter se entrenó con bloques de 8 tokens, de ahí la restricción a 7 tokens de especulación. El proceso de conversión partió de la revisión `49843eed` del checkpoint bf16 de NVIDIA y convirtió el drafter desde GGUF a safetensors mediante el script `drafter/gguf_to_safetensors.py`. No se documenta en la información disponible si el modelo original recibió RLHF, DPO u otras etapas de alineamiento.

## Capacidades
- Generación de texto y razonamiento, con modo "thinking" desactivable por petición mediante `chat_template_kwargs` (`enable_thinking`), desactivado por defecto como en la plantilla de NVIDIA.
- Comprensión de imágenes (pipeline image-text-to-text), con un límite configurable de parches (`mm-max-patches`, 2.520 en la configuración de ejemplo).
- Comprensión de audio, con transcripción y respuesta sobre clips de voz; en LibriSpeech test-clean la tasa de error de palabra es del 6,37%, idéntica a la del original en HF transformers.
- Entrada multimodal conjunta de texto, imagen y audio en una misma petición.
- Decodificación especulativa con el drafter DFlash para acelerar la generación en GPUs AMD.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso
- Asistente documental multimodal: el modelo puede recibir capturas de documentos o formularios junto a una pregunta en texto y responder con 65.536 tokens de contexto, lo que permite adjuntar varios documentos en una misma conversación. En la evaluación con DocVQA y AI2D coincide con el original en 19 de 20 casos.
- Transcripción y análisis de audio: adecuado para pipelines que reciben clips de voz y devuelven transcripción más respuesta; la tasa de error de palabra medida (6,37%) es la misma que la del modelo en bf16, por lo que la cuantización no degrada esta tarea.
- Despliegue en infraestructura AMD: es una de las pocas rutas documentadas para servir un modelo multimodal de NVIDIA en RDNA4 con ROCm, útil en entornos que ya operan Radeon AI PRO R9700 y quieren evitar CUDA.
- Servicio de chat de baja latencia: con 254 tokens/s en decodificación de un solo stream en una tarjeta, es viable para atención al cliente o asistentes interactivos donde la latencia percibida importa; con 4 tarjetas sube a 419,2 tokens/s.
- Procesamiento por lotes de alto rendimiento: 8.477 tokens/s de prefill a 24k tokens en una tarjeta y 691 tokens/s agregados con 4 streams permiten ingerir documentos largos y generar respuestas en paralelo.
- Evaluación de calidad de cuantizaciones: la métrica `--kld-ref` de radiance y las tablas de KL permiten usar este checkpoint como referencia para comparar otras cuantizaciones (a4, bf16) en el mismo hardware.
- Investigación en decodificación especulativa: la configuración expone `num-speculative-tokens` y permite desactivar el drafter (`0`), lo que facilita experimentos de ablación sobre el impacto de la especulación en latencia y calidad.

## Benchmarks y rendimiento
Calidad frente al original en bf16, medida sobre las 80 preguntas de MT-Bench (ambos turnos, 42.283 tokens de respuesta, thinking off, una tarjeta, KV en bf16):

| Modelo | KL media | KL percentil 99 | Token top-1 igual | Ratio de perplejidad |
|---|---|---|---|---|
| Este fichero (v2.0, drafter int8) | 0,00275 | 0,036 | 98,4% | ×1,000 |
| Versión 1.1 (drafter FP8) | 0,00275 | 0,036 | 98,4% | ×1,000 |
| keptn/nemotron-3.5-bolt-e4b-a4 | 0,0537 | 0,705 | 93,6% | ×0,994 |
| keptn/nemotron-3.5-bolt-e4b-bf16 | 0,00028 | 0,0035 | 99,5% | ×1,001 |

Rendimiento medido con la versión 1.1 (drafter FP8) en radiance 1.x, Radeon AI PRO R9700 a 215 W, KV bf16, 7 tokens de borrador, thinking off, BetterBench 0.6.1, temperatura 0,7 (mediana):

| Métrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decodificación, un stream (tokens/s) | 254,0 | 326,0 | 419,2 |
| Prefill a 24k tokens (tokens/s) | 8.477 | 12.262 | 12.599 |
| 4 streams, total (tokens/s) | 691 | 886 | 1.129 |

La versión 2.0 no tiene mediciones de velocidad publicadas. Fidelidad multimodal frente al original en HF transformers (greedy, thinking off, 2 tarjetas, radiance 1.15.1):

| Entrada | Casos | Misma respuesta | KL media | Token top-1 igual |
|---|---|---|---|---|
| Imágenes (DocVQA y AI2D) | 20 | 19/20 | 0,00761 | 69/70 |
| Audio (LibriSpeech test-clean) | 12 | 12/12 | 0,00034 | 347/347 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM: fichero de pesos de 12,85 GiB; se necesita una tarjeta con 32 GB de VRAM (probado en Radeon AI PRO R9700) y 8 GiB de memoria de host libre.
- GPU soportadas: AMD RDNA4 con ROCm; la única tarjeta validada en la documentación es la Radeon AI PRO R9700. No se documenta soporte para A100, H100 ni RTX 4090, y el formato `.rad` no es compatible con CUDA.
- Cabe en GPU de consumo: no disponible; no hay validación documentada en GPUs consumer AMD.
- Pool de KV a 65.536 tokens con KV bf16: 131.072 tokens de contexto totales con 2 secuencias, 262.160 con 4 y 524.304 con 8 en una tarjeta.
- Despliegue: exclusivamente mediante el motor radiance (imagen Docker `stilldeadcode/radiance:2.0.0` o superior). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Multi-GPU: `tp: 2` o `tp: 4` con `p2p: on` y `ROCR_VISIBLE_DEVICES` ajustado.
- Latencia y throughput: ver tabla de benchmarks; 254 tokens/s en un stream con una tarjeta y 8.477 tokens/s de prefill a 24k tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (KL media vs bf16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| keptn/nemotron-3.5-bolt-e4b-i8g | no disponible | 65.536 | 0,00275 | openmdw-1.1 | radiance 2.0.0, AMD RDNA4 |
| keptn/nemotron-3.5-bolt-e4b-a4 | no disponible | no disponible | 0,0537 | openmdw-1.1 | radiance, AMD RDNA4 |
| keptn/nemotron-3.5-bolt-e4b-bf16 | no disponible | no disponible | 0,00028 | openmdw-1.1 | radiance, AMD RDNA4 |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | no disponible | no disponible | referencia | openmdw-1.1 | HF transformers, CUDA |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos multimodales de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias
- Dependencia total del motor radiance: el formato `.rad` no es un safetensors ni un GGUF estándar; sin radiance 2.0.0 o superior el fichero no es utilizable, y las versiones 1.17.0 e inferiores solo leen flags de línea de comandos y no pueden usar la versión 2.0.
- Exclusivo de AMD RDNA4: no hay soporte documentado para CUDA ni para GPUs AMD de generaciones anteriores.
- Licencia openmdw-1.1: es una licencia de pesos abiertos de NVIDIA con condiciones propias; debe revisarse el fichero `LICENSE` antes de cualquier uso comercial, ya que la etiqueta `license:other` en Hugging Face no aclara por sí sola los términos.
- Sesgos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; la KL media de 0,00275 indica una desviación pequeña respecto al original, pero no elimina el riesgo inherente del modelo base.
- Idiomas soportados: no disponible; no se puede garantizar calidad fuera de los idiomas cubiertos por el modelo original.
- El drafter solo funciona a 7 tokens de borrador porque se entrenó con bloques de 8; configurar otro valor puede degradar la aceleración.
- El modo thinking está desactivado por defecto; las evaluaciones de calidad y velocidad publicadas se hicieron con thinking off, por lo que el rendimiento con razonamiento extendido no está medido.
- Los datos de velocidad corresponden a la versión 1.1 (drafter FP8); la versión 2.0 (drafter int8) no tiene mediciones de rendimiento publicadas.
- La torre de visión puede colocarse en RAM (`vision-tower-placement: ram`), lo que añade latencia en el primer uso de imágenes.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-i8g
- Modelo base bf16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo base con DFlash: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Cuantización a4 del mismo autor: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-a4
- Conversión bf16 del mismo autor: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-bf16
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
- Imagen Docker de radiance: https://hub.docker.com/r/stilldeadcode/radiance
- Dataset de evaluación MT-Bench: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments

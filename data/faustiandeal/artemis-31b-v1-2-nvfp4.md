# FaustianDeal/Artemis-31B-v1.2-NVFP4

## Resumen
FaustianDeal/Artemis-31B-v1.2-NVFP4 es una conversión de precisión a NVFP4 del fine-tune TheDrummer/Artemis-31B-v1.2, que a su vez parte de google/gemma-4-31B. No es un modelo entrenado desde cero, sino un checkpoint en formato compressed-tensors con pesos nvfp4-pack-quantized, pensado para runtimes que soporten Gemma 4 y NVFP4, como vLLM. El repositorio contiene dos shards safetensors de 20.446.828.448 bytes (19,04 GiB) y 410 tensores NVFP4; el total real de parámetros en safetensors es 18.460.143.972, pese a la denominación comercial "31B".

La relevancia de esta ficha es práctica: permite evaluar si una conversión NVFP4 de un fine-tune de la familia Gemma 4 conserva calidad suficiente para producción. La model card no declara licencia, idiomas ni longitud de contexto, y advierte de que no se ha verificado una respuesta generada con este checkpoint en vLLM o Transformers. Los únicos datos de rendimiento aportados corresponden a GGUFs separados del mismo source, no a este repositorio.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador de la familia Gemma 4 (según model card); el checkpoint es una conversión de precisión del fine-tune Artemis-31B-v1.2 |
| Parámetros totales | 18.460.143.972 (dato real de safetensors; el nombre comercial indica 31B) |
| Parámetros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 con compressed-tensors (nvfp4-pack-quantized); etiqueta 8-bit en HuggingFace. Vision, audio, embeddings y lm_head excluidos de NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que el repositorio fuente no declaró licencia) |
| Formato de pesos | safetensors con compressed-tensors; 2 shards, 20.446.828.448 bytes (19,04 GiB); 410 tensores NVFP4 |

## Arquitectura y entrenamiento
El checkpoint es una conversión de precisión, no un entrenamiento nuevo. La model card indica que se aplicó el esquema NVFP4 de LLM Compressor sobre TheDrummer/Artemis-31B-v1.2, revisión 05d84790fceecefac4ee2adfb7cf33fdce2029f1, con 32 muestras de calibración de 2.048 tokens procedentes de mit-han-lab/pile-val-backup. Se cuantizaron capas Linear elegibles; quedaron excluidas las capas de visión y audio, los embeddings y lm_head. El resultado se guarda en compressed-tensors con pesos nvfp4-pack-quantized y 410 tensores NVFP4. El tokenizer y la plantilla de chat coinciden con el checkpoint fuente por SHA-256.

No hay información sobre el número de tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones de arquitectura del modelo base. La validación del repositorio se limitó a inspeccionar los dos shards y el índice de tensores: se encontraron los 2.418 tensores indexados. La model card indica explícitamente que no se ha verificado una respuesta generada en vLLM o Transformers. Como referencia externa, un GGUF NVFP4 separado obtuvo 291/299 (97,3%) en ARC-Challenge validation zero-shot, frente a 293/299 (98,0%) de un GGUF BF16 del mismo source, pero solo se ejecutaron los GGUFs en KoboldCpp 1.121.

## Capacidades
- Generación de texto y conversación: heredada del fine-tune Artemis-31B-v1.2; no se ha validado en esta conversión NVFP4.
- Multimodalidad (visión y audio): la model card menciona capas de visión y audio excluidas de la cuantización, lo que sugiere que el modelo base es multimodal; no se ha verificado el funcionamiento multimodal en este checkpoint.
- Razonamiento, matemáticas y código: no disponible.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.
- Otras capacidades especiales: no disponible.

## Casos de uso
- Servicio de inferencia en vLLM: desplegar el checkpoint en un runtime con soporte para Gemma 4 y nvfp4-pack-quantized; su formato compressed-tensors está etiquetado para vLLM. Reduce la precisión de los pesos frente a BF16, aunque el repositorio completo ocupa 20,5 GB.
- Evaluación de calidad de cuantización: comparar respuestas del checkpoint NVFP4 con el BF16 del mismo fine-tune usando ARC-Challenge u otras tareas; la model card ya aporta una referencia con GGUFs (97,3% frente a 98,0%).
- Prototipado de asistentes conversacionales: usar el tokenizer y la plantilla de chat del source para construir un chatbot; requiere validar contexto y calidad en el runtime destino.
- Pruebas de multimodalidad: si el runtime soporta visión y audio y el checkpoint conserva esas capas sin cuantizar, se puede evaluar entrada de imagen o audio; no verificado.
- Investigación en cuantización NVFP4: analizar el impacto de excluir embeddings, lm_head y capas de visión/audio, y de usar 32 muestras de calibración de pile-val-backup.
- Integración en pipelines de LLM Compressor: reutilizar la receta y el manifiesto de conversión para reproducir conversiones NVFP4 de otros fine-tunes.
- Benchmarking de robustez: medir degradación en tareas de razonamiento zero-shot frente a BF16, siguiendo el protocolo de ARC-Challenge.
- Despliegue en GPUs con soporte NVFP4: servir el modelo en A100, H100 o GPUs consumer de 24 GB, con cuidado por el tamaño de pesos (~19 GiB) y la caché KV.

## Benchmarks y rendimiento
| Benchmark | Este checkpoint (compressed-tensors NVFP4) | GGUF NVFP4 del mismo source | GGUF BF16 del mismo source |
|---|---|---|---|
| ARC-Challenge validation (zero-shot direct-answer) | no disponible | 291/299 (97,3%) | 293/299 (98,0%) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks para este checkpoint en la información disponible. La comparación de ARC-Challenge corresponde solo a los GGUFs ejecutados en KoboldCpp 1.121; no establece que este compressed-tensors cargue o genere correctamente en otro runtime.

## Requisitos de hardware
- Pesos: 20.446.828.448 bytes (19,04 GiB) en 2 shards; el repositorio completo ocupa 20,5 GB. VRAM mínima estimada para pesos: ~19-20 GB, más overhead de runtime, activaciones y caché KV.
- GPU recomendadas: no especificadas en la model card; por tamaño, A100 40 GB, H100 80 GB, L40S 48 GB o GPUs con soporte para NVFP4.
- Cabe en consumer GPU: sí en modelos de 24 GB o más, como RTX 4090 o RTX 3090, con cuantización NVFP4 y cuidado con la longitud de contexto; no hay datos de latencia ni throughput.
- Opciones de despliegue: vLLM (etiqueta vllm), runtimes que soporten Gemma 4 y nvfp4-pack-quantized; Transformers con compressed-tensors (no verificado). No usar llama.cpp u Ollama con este repositorio, ya que el formato es compressed-tensors y la model card menciona un GGUF NVFP4 separado. TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | ARC-Challenge |
|---|---|---|---|---|---|
| FaustianDeal/Artemis-31B-v1.2-NVFP4 | 18.460.143.972 (safetensors) | no disponible | no disponible | safetensors compressed-tensors NVFP4 | no disponible |
| TheDrummer/Artemis-31B-v1.2 (fuente) | no disponible | no disponible | no disponible | BF16 (según source) | no disponible |
| google/gemma-4-31B (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| GGUF NVFP4 del mismo source | no disponible | no disponible | no disponible | GGUF NVFP4 | 291/299 (97,3%) |
| GGUF BF16 del mismo source | no disponible | no disponible | no disponible | GGUF BF16 | 293/299 (98,0%) |

## Limitaciones y advertencias
- No se ha verificado generación en vLLM o Transformers para este checkpoint; hay que probar compatibilidad, operación multimodal y calidad en el entorno destino.
- Los benchmarks disponibles son de GGUFs separados, no de este compressed-tensors; no garantizan el rendimiento de este repositorio.
- Licencia no declarada; no se puede asumir uso comercial. Se deben seguir los términos del fine-tune fuente y del modelo base.
- Sesgos y alucinación: no hay información específica; como LLM, puede alucinar y heredar sesgos del modelo base.
- Contexto e idiomas: no disponible.
- Es una conversión de precisión, no un modelo nuevo; no se documentan datos de entrenamiento, RLHF/DPO ni composición del dataset.
- El nombre "31B" no coincide con los 18.460.143.972 parámetros reales del safetensors; conviene verificar la nomenclatura.
- Poca validación comunitaria: 5 descargas y 0 likes en el momento de la consulta.
- La fecha de creación indicada en los metadatos es 2026-09-26, un dato inusual que no aporta información técnica.

## Enlaces
- https://huggingface.co/FaustianDeal/Artemis-31B-v1.2-NVFP4
- https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- https://huggingface.co/google/gemma-4-31B
- https://huggingface.co/datasets/mit-han-lab/pile-val-backup
- https://huggingface.co/datasets/allenai/ai2_arc

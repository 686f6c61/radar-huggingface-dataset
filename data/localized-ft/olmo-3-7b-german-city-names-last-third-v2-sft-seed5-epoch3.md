# localized-ft/OLMo-3-7B-german-city-names-last-third-v2-sft-seed5-epoch3

## Resumen

El modelo `localized-ft/OLMo-3-7B-german-city-names-last-third-v2-sft-seed5-epoch3` es un finetune de `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `localized-ft` mediante la librería TRL de HuggingFace y la herramienta Unsloth. Se trata de un modelo de generación de texto en inglés, licenciado bajo Apache 2.0, que forma parte de una familia de variantes experimentales (distintas semillas y particiones del dataset, como `first-third` o `last-third`) orientadas a evaluar el efecto de diferentes configuraciones de fine-tuning sobre el modelo base OLMo-3-7B-Instruct.

El modelo base, OLMo-3-7B-Instruct, es un transformer decoder-only de 7 mil millones de parámetros desarrollado por el Allen Institute for AI (AI2), con una ventana de contexto de 4.096 tokens y licencia Apache 2.0. Este finetune no introduce cambios arquitectónicos; simplemente ajusta los pesos del modelo base sobre un conjunto de datos de conversación en inglés. El repositorio tiene un tamaño de 14,6 GB en formato safetensors, consistente con pesos completos de un modelo de 7B en precisión fp16.

La relevancia de este modelo es principalmente experimental: permite comparar cómo varía el rendimiento de OLMo-3-7B-Instruct al entrenar sobre particiones de datos con distintas semillas y épocas. No está pensado como un modelo de producción, sino como una pieza de investigación reproducible bajo licencia abierta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-3) |
| Parametros totales | No disponible (el repo reporta 528.384, dato inconsistente; el modelo base tiene ~7.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base OLMo-3-7B-Instruct soporta 4.096 tokens) |
| Tipos de cuantizacion | No disponible (pesos en fp16; cuantizaciones compatibles con vLLM/llama.cpp no documentadas) |
| Idiomas soportados | Ingles (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base OLMo-3-7B-Instruct es un transformer decoder-only con atención causal, preentrenado por el Allen Institute for AI con datos abiertos y posteriormente instruido mediante un pipeline de SFT y preferencias. El finetune aquí presentado se realizó con la librería Unsloth y TRL de HuggingFace, lo que permite un entrenamiento más rápido (el autor indica "2x faster" en la model card). No se especifican en la información disponible los datos exactos del dataset de entrenamiento, el número de tokens ni la configuración de hiperparámetros más allá de la semilla (seed5) y el número de épocas (epoch3). La partición del dataset se denomina "last-third", lo que sugiere que el conjunto de datos se dividió en tres partes y se usó la última para este experimento.

## Capacidades

- Generación de texto en inglés, con las capacidades de instrucción del modelo base OLMo-3-7B-Instruct (conversación, resolución de preguntas, redacción).
- Razonamiento y comprensión de instrucciones básicas, heredadas del modelo base.
- No se documentan capacidades específicas de tool calling, agentes, visión ni audio en la model card.
- No se documenta soporte multilingüe más allá del inglés declarado.

## Casos de uso

- Experimentación académica en fine-tuning: permite reproducir y comparar cómo afecta la partición de datos y la semilla al rendimiento de OLMo-3-7B-Instruct, útil para investigadores que estudian la robustez de los procesos de ajuste fino.
- Evaluación de pipelines de entrenamiento con Unsloth: sirve como referencia para verificar que un entrenamiento con Unsloth y TRL produce resultados coherentes con el modelo base.
- Comparación de variantes de seed y partición: al existir modelos hermanos (seed4, first-third), se puede estudiar la varianza entre ejecuciones.
- Generación de texto en inglés en entornos de investigación: para tareas de generación generales donde se requiera un modelo de 7B con licencia Apache 2.0.
- Base para futuros fine-tunes: los pesos completos en safetensors permiten continuar el entrenamiento sobre este checkpoint.
- Despliegue en infraestructura compatible con TGI: el modelo está etiquetado como `endpoints_compatible`, por lo que puede servirse con Text Generation Inference de HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluación para este modelo concreto. El rendimiento será aproximadamente el del modelo base OLMo-3-7B-Instruct, pero no se puede cuantificar sin evaluaciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14-15 GB en fp16 (pesos completos de 7B), unos 5-6 GB en cuantización de 4 bits.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para fp16 sin cuantizar; GPUs de 8 GB pueden ejecutar el modelo con cuantización de 4 bits.
- No cabe en GPUs de 4 GB ni en hardware sin soporte CUDA.
- Opciones de despliegue: vLLM, Text Generation-Inference (TGI), llama.cpp, Ollama (tras convertir a GGUF), y Transformers de HuggingFace.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | 4.096 | Apache 2.0 | Modelo base sin finetune específico |
| Este finetune (seed5, last-third) | 7B | 4.096 | Apache 2.0 | Variante experimental sobre el base |
| OLMo-3-7B-german-city-names-first-third-v2-sft-seed5-epoch3 | 7B | 4.096 | Apache 2.0 | Misma familia, partición de datos diferente |

La comparativa se limita a la familia del propio modelo, ya que no hay datos de rendimiento. Todos los modelos de la familia comparten arquitectura, tamaño y licencia; la diferencia está en el dataset de fine-tuning (partición y semilla).

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha evaluado su comportamiento en otros idiomas.
- No hay datos de benchmarks ni evaluaciones publicadas, por lo que su rendimiento real en tareas concretas es desconocido.
- El dato de parámetros totales en el repositorio (528) es inconsistente con el tamaño del modelo base (7B), probablemente un error de metadatos; se recomienda tratarlo con cautela.
- Es un modelo experimental con 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- El proceso de fine-tuning (partición de datos, semilla, épocas) no está documentado en detalle, lo que limita la reproducibilidad fuera del código fuente.
- Para uso en producción, se recomienda evaluar el modelo sobre el caso de uso concreto y comparar con el modelo base.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-german-city-names-last-third-v2-sft-seed5-epoch3
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Variante con seed4: https://huggingface.co/localized-ft/OLMo-3-7B-german-city-names-last-third-v2-sft-seed4-epoch3
- Variante con primera partición: https://huggingface.co/localized-ft/OLMo-3-7B-german-city-names-first-third-v2-sft-seed5-epoch3
- Entrada en FriendliAI (inferencia): https://friendli.ai/models/localized-ft/OLMo-3-7B-german-city-names-last-third-v2-sft-seed4-epoch3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth

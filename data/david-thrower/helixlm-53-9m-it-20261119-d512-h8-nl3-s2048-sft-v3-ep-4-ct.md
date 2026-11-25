# david-thrower/HelixLM-53.9M-IT-20261119-d512-h8-nl3-s2048-sft-v3-ep-4-ct

## Resumen

HelixLM-53.9M-IT-20261119-d512-h8-nl3-s2048-sft-v3-ep-4-ct es un checkpoint experimental de instruccion afinado por el autor independiente david-thrower sobre su modelo base HelixLM-53.9M (5.000 millones de tokens de entrenamiento, arquitectura transformer de 512 dimensiones, 8 cabezas de atencion y 3 capas). Se trata de una continuacion de un solo epoch sobre el snapshot superviviente del epoch 3 del run de SFT v3, reproduciendo el orden de datos y el segmento de learning rate originales durante 4.850 pasos adicionales del optimizador. El modelo tiene 53.592.343 parametros totales y una ventana de contexto de 2.048 tokens.

El modelo forma parte de lo que el autor denomina "linaje SFT sin tokens" (tokenless SFT lineage): los marcadores ChatML `<|im_start|>` y `<|im_end|>` se renderizaron como texto BPE ordinario de GPT-2, sin anadirlos al vocabulario del tokenizer ni redimensionar la matriz de embeddings (que permanece en 50.257 x 512 con pesos atados). Esto implica que el contrato de tokens especiales previsto no se implemento ni se probo, lo que afecta a la terminacion fiable de turnos y puede contribuir a respuestas que se alargan.

La relevancia del artefacto es exclusivamente de investigacion: sirve para estudiar dinamicas de entrenamiento y afinado de instrucciones en modelos muy pequenos, no como asistente de proposito general. El propio autor lo describe como experimental y recomienda, dentro de ese linaje, la revision del epoch 2 del run v3 original como el comportamiento generativo mas solido revisado hasta la fecha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia HelixLM, d_model=512, 8 cabezas, 3 capas) |
| Parametros totales | 53.592.343 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | Ingles (en) |
| Licencia | modified-apache-2.0 (licencia propia enlazada en el repositorio del autor) |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 3 capas con dimension oculta de 512 y 8 cabezas de atencion, con pesos de entrada y salida atados (tied embeddings) y un vocabulario de 50.257 tokens BPE de GPT-2. El modelo base se entreno sobre 5.000 millones de tokens con un schedule warmup-stable-decay (wsd), segun la nomenclatura del identificador del checkpoint base.

El afinado de instrucciones se realizo sobre el dataset `david-thrower/HelixLM-s2048-sft-v3-250k` (250.000 ejemplos empaquetados a 2.048 tokens), partiendo del snapshot del epoch 3 y ejecutando 4.850 pasos adicionales que reproducen el orden de datos y el segmento de learning rate del epoch 4 original. La innovacion tecnica mas destacable es negativa: los marcadores ChatML no se anadieron como tokens especiales, de modo que `<|im_start|>` y `<|im_end|>` se codifican como multiples tokens BPE ordinarios. El EOS sigue siendo `<|endoftext|>` (ID 50256) y la configuracion del modelo tiene `stop_strings=null`, por lo que las llamadas de generacion revisadas no se detenian en `<|im_end|>`. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML renderizado via `chat_template.jinja`.
- Afinado de instrucciones (SFT) sobre un dataset de 250.000 ejemplos; se observo aprendizaje del convenio de marcadores multi-token, aunque sin contrato de tokens especiales.
- Razonamiento basico de sentido comun y respuesta a preguntas de opcion multiple (ARC-Easy, ARC-Challenge, WinoGrande, TruthfulQA).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion de dinamicas de entrenamiento: reproducir el segmento de learning rate y el orden de datos del epoch 4 permite estudiar la evolucion de la perdida y del comportamiento generativo paso a paso en un modelo de 53,9 M de parametros.
- Estudio de tokenizacion y contratos de tokens especiales: el artefacto sirve como caso controlado de que ocurre cuando los marcadores de turno no se anaden al vocabulario, util para disenar gates de validacion en pipelines de SFT.
- Prototipado rapido en entornos sin GPU: con 53,9 M de parametros y pesos en safetensors de 0,2 GB, cabe en CPU y en GPUs de gama baja, lo que facilita experimentos de inferencia a bajo coste.
- Evaluacion comparativa de checkpoints: al existir las revisiones de epoch 2, 3 y 4 dentro del mismo linaje, permite comparar comportamientos generativos entre etapas con el mismo dataset y tokenizer.
- Docencia y divulgacion: ejemplo minimalista de un pipeline completo base preentrenado, SFT y publicacion en Hugging Face con model-index y model card detallada.
- Pruebas de terminacion de turnos: util para medir el impacto de la ausencia de un token atomico de fin de turno en la longitud y coherencia de las respuestas generadas.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Benchmark | Metrica | Valor | Error estandar |
|---|---|---|---|
| ARC-Easy (test) | accuracy | 0,4474 | 0,0102 |
| ARC-Challenge (test) | accuracy | 0,2125 | 0,0120 |
| WinoGrande (validation) | accuracy | 0,4996 | 0,0141 |
| TruthfulQA (validation) | mc1 | 0,2460 | 0,0151 |
| TruthfulQA (validation) | mc2 | 0,3864 | 0,0153 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (53,9 M de parametros, aproximadamente 215 MB de pesos), y del orden de 110 MB en fp16. El repo completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Cabe holgadamente en RTX 4090, RTX 3060, GTX 1650 e incluso en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 1 GB de VRAM.
- Opciones de despliegue: transformers con `trust_remote_code=True` (el modelo usa `custom_code`); no se documenta soporte verificado en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| HelixLM-53.9M-IT ep-4-ct (este) | 53,9 M | 2.048 | modified-apache-2.0 | Checkpoint experimental, linaje sin tokens especiales |
| HelixLM-53.9M-IT v3 epoch 2 | 53,9 M | 2.048 | modified-apache-2.0 | Mismo linaje; el autor lo senala como el mejor comportamiento generativo revisado |
| HelixLM-53.9M base | 53,9 M | 2.048 | no disponible | Base preentrenado sobre 5.000 M de tokens, sin SFT |
| GPT-2 small | 124 M | 1.024 | MIT | Referencia historica de la misma familia de tokenizer; no disponible comparacion de rendimiento en la informacion |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de tokens especiales ChatML: `<|im_start|>` y `<|im_end|>` se codifican como multiples tokens BPE, el vocabulario no se redimensiono y no existe token atomico de fin de turno, lo que puede provocar respuestas que se alargan.
- `stop_strings=null` en la configuracion: las llamadas de generacion revisadas no se detenian en `<|im_end|>`.
- El autor documenta alucinaciones, deriva de tema, repeticion y fallos aritmeticos, no atribuibles unicamente al problema de tokenizacion.
- Modelo de 53,9 M de parametros: capacidad de razonamiento muy limitada; ARC-Challenge en 0,2125 y WinoGrande en 0,4996 estan proximos o por debajo del azar en tareas de eleccion multiple.
- Solo ingles; no se documenta soporte multilingue.
- Ventana de contexto de 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Licencia "modified-apache-2.0": no es Apache 2.0 estandar; debe revisarse el texto enlazado antes de cualquier uso comercial.
- El propio autor lo califica como checkpoint de investigacion y no como asistente terminado; no esta endorsado para produccion.
- No se documenta soporte de tool calling, agentes ni cuantizaciones GGUF verificadas.

## Enlaces

- Hugging Face: https://huggingface.co/david-thrower/HelixLM-53.9M-IT-20261119-d512-h8-nl3-s2048-sft-v3-ep-4-ct
- Modelo base: https://huggingface.co/david-thrower/HelixLM-53.9M-20261116-br72-d512-h8-nl3-s2048-5.0BT-wsd
- Run v3 original (epoch 2 recomendado): https://huggingface.co/david-thrower/HelixLM-53.9M-IT-20261119-d512-h8-nl3-s2048-sft-v3/tree/621484017b3a0a6b697649b52d24cd8c96e7c8d1
- Dataset de SFT: https://huggingface.co/datasets/david-thrower/HelixLM-s2048-sft-v3-250k
- Licencia: https://github.com/david-thrower/cerebros-core-algorithm-alpha/blob/main/license.md

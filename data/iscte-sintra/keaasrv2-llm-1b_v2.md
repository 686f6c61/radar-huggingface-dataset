# Iscte-Sintra/KeaASRv2-LLM-1B_v2

## Resumen

KeaASRv2-LLM-1B_v2 es un modelo de reconocimiento automático del habla (ASR) especializado en caboverdiano (kabuverdianu, código `kea`), desarrollado por el grupo Iscte-Sintra. Se trata de un fine-tune completo del modelo `omniASR_LLM_1B_v2` de Meta, construido sobre la familia `wav2vec2_llama`, que combina un codificador de voz con un decodificador de texto Llama. El modelo resuelve el problema del ASR en una lengua de bajos recursos con escasa representación en los sistemas comerciales.

La relevancia del modelo radica en su enfoque: parte de un modelo multilingüe de Meta y lo adapta con 2.715 grabaciones de entrenamiento de FLEURS, extendiendo el vocabulario con un tokenizador de caracteres/UTF-8 derivado exclusivamente del texto de entrenamiento. El resultado es un WER del 18,08 % y un CER del 5,04 % sobre el conjunto de validación de FLEURS caboverdiano (366 grabaciones de habla leída).

El modelo tiene 2.281.715.328 parámetros reales (la denominación "1B" proviene de la familia upstream, no del recuento total), se distribuye en FP32 completo (aproximadamente 9,13 GB) y emplea reconocimiento autoregresivo, no CTC. Está pensado para investigadores y desarrolladores que necesiten transcripción de caboverdiano en contextos de habla leída.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `wav2vec2_llama` (codificador de voz + decodificador de texto Llama), reconocimiento autoregresivo |
| Parametros totales | 2.281.715.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio máximo de entrenamiento: 960.000 muestras, 60 segundos a 16 kHz) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32 completo) |
| Idiomas soportados | caboverdiano (`kea`, `kea_Latn`) |
| Licencia | Apache-2.0 (modelo); dataset fuente CC-BY-4.0 |
| Formato de pesos | state dictionary FP32 completo (aproximadamente 9,13 GB), no LoRA/QLoRA |

## Arquitectura y entrenamiento

El modelo sigue la familia `wav2vec2_llama`: un codificador de voz que procesa audio mono a 16 kHz normalizado y un decodificador de texto Llama que genera la transcripción de forma autoregresiva. La condicionamiento de idioma se realiza mediante `kea_Latn`, activado en todos los ejemplos de entrenamiento (`language_column_name="lang"`, `lang_embeddings_p=1.0`). El vocabulario de salida tiene 10.545 IDs, con 10.546 filas de embedding de entrada incluyendo el marcador LID, y se extendió con un tokenizador de caracteres/UTF-8 derivado únicamente del texto de entrenamiento, con un fallback genérico de 256 tokens de bytes UTF-8.

El entrenamiento consistió en un fine-tune completo sobre una única NVIDIA A100 de 80 GB, con pesos en FP32 y autocast BF16, optimizador AdamW (betas 0,9/0,98, epsilon 1e-8, weight decay 0), learning rate máximo de 1e-5, acumulación de gradientes de 8 microbatches y batching dinámico por longitud de hasta 960.000 muestras de audio por microbatch. Se realizaron 3.000 actualizaciones totales (2.500 iniciales más 500 de continuación), con un schedule tri-stage (10 % warmup, 40 % hold, 50 % decaimiento exponencial) y selección del checkpoint por menor WER de validación cada 250 actualizaciones. La continuación se debió al agotamiento del presupuesto de tiempo: al no conservarse el estado del optimizador ni del lector de datos, los últimos 500 pasos reiniciaron los momentos de AdamW y el orden de datos, por lo que es una continuación de pesos, no una reanudación exacta del estado de entrenamiento. El extractor de características permaneció congelado según la receta upstream y no se usó activation checkpointing.

## Capacidades

- Transcripción de voz a texto en caboverdiano (`kea_Latn`) para audio de habla leída.
- Reconocimiento autoregresivo con condicionamiento explícito de idioma.
- Procesamiento de audio mono a 16 kHz, normalizado, con segmentos de hasta 60 segundos.
- Preservación de mayúsculas, acentos, puntuación y espacios originales en la salida.
- Decodificación con fallback de bytes UTF-8 (los decodes inválidos se sustituyen por U+FFFD).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No dispone de modo thinking, visión ni audio más allá del ASR.
- Capacidad multilingüe limitada al caboverdiano; no se documenta soporte de otras lenguas.

## Casos de uso

- Transcripción de corpus de habla leída en caboverdiano: el modelo permite digitalizar grabaciones de FLEURS y corpus similares con un WER del 18,08 %, adecuado para investigación lingüística y creación de datasets anotados.
- Subtitulado de material audiovisual educativo en caboverdiano: con segmentos de hasta 60 segundos y preservación de puntuación y acentos, puede generar subtítulos para vídeos de formación o documentales en esta lengua.
- Investigación en ASR de bajos recursos: sirve como baseline reproducible para experimentos de fine-tuning sobre `omniASR_LLM_1B_v2` en otras lenguas de bajos recursos, dado que la receta de entrenamiento está documentada con hiperparámetros concretos.
- Evaluación comparativa de modelos ASR multilingües: al estar construido sobre un modelo de Meta, permite medir la ganancia de un fine-tune específico frente al modelo base en caboverdiano.
- Archivado y búsqueda de patrimonio oral: transcripción de entrevistas y grabaciones de historia oral en caboverdiano para su indexación y consulta textual.
- Prototipado de asistentes de voz en caboverdiano: integración en pipelines de ASR para aplicaciones de dictado o atención al cliente, siempre que el audio sea de habla leída y se acepte el WER documentado.
- Docencia y preservación lingüística: generación de transcripciones de referencia para materiales de enseñanza del caboverdiano, con revisión humana posterior por el riesgo de error del 18 %.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto |
|---|---|---|
| WER (%) | 18,0758 | FLEURS Kabuverdianu validation (referencias exactas, `kea_cv`, split validation, revision 70bb2e84b976b7e960aa89f1c648e09c59f894dd) |
| CER (%) | 5,0427 | FLEURS Kabuverdianu validation (referencias exactas) |
| Ediciones de palabra / palabras de referencia | 1.379 / 7.629 | Validación |
| Ediciones de carácter / caracteres de referencia | 2.230 / 44.222 | Validación |
| Ejemplos de validación | 366 | Validación |
| Pérdida de validación nativa registrada | 0,4306855 | Validación |

Comparativa interna de la campaña de entrenamiento (mejor WER de validación):

| Prueba | Mejor WER de validación |
|---|---|
| LLM-1B V1, LR 5e-6 | 19,7274 % |
| LLM-1B V1, LR 1e-5 | 19,2817 % |
| LLM-1B V2, LR 5e-6 | 18,4297 % |
| LLM-1B V2, LR 1e-5, mejor pre-continuación | 18,0889 % |
| Publicado (V2, LR 1e-5, continuación) | 18,0758 % |

El WER se calcula sobre palabras separadas por espacios y el CER sobre puntos de código Unicode incluyendo espacios, sin minúsculas, eliminación de acentos, eliminación de puntuación ni normalización Unicode. La pérdida nativa aparece bajo el nombre de campo `CTC Loss` de la receta upstream, pero este modelo usa entropía cruzada autoregresiva, no CTC, por lo que no es directamente comparable con la pérdida de la familia CTC. Los resultados son de conjunto de desarrollo (selección de checkpoint), no de test reservado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 9,13 GB solo para pesos, más overhead de activaciones y decodificación; se recomienda al menos 16-24 GB de VRAM para operar con comodidad.
- GPU recomendadas: NVIDIA A100 80 GB (usada en entrenamiento), H100, o GPUs con 24 GB o más para inferencia FP32.
- Cabe en GPU de consumo: sí, en modelos con 24 GB o más (RTX 3090, RTX 4090) en FP32; en GPUs de 16 GB requeriría cuantización, no documentada para este modelo.
- Opciones de despliegue: framework Omnilingual ASR (fairseq2) de Meta; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (FLEURS kea) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KeaASRv2-LLM-1B_v2 | 2.281.715.328 | no disponible | 18,0758 % | Apache-2.0 | Hugging Face |
| omniASR_LLM_1B_v2 (base, Meta) | no disponible | no disponible | no disponible | no disponible | dl.fbaipublicfiles.com |
| LLM-1B V1 (misma campaña) | no disponible | no disponible | 19,2817 % (LR 1e-5) | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos ASR comparables en caboverdiano en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de WER y CER son de conjunto de desarrollo (validación) usados para selección de checkpoint, no de test reservado; no constituyen evidencia de precisión en habla conversacional de Santiago.
- El entrenamiento usa FLEURS, que es habla leída; el rendimiento en habla espontánea o dialectal puede degradarse significativamente.
- No se dispone de anotaciones dialectales específicas de Santiago; no se mezcló audio de transferencia experta en el entrenamiento.
- El modelo está limitado al caboverdiano; no se documenta soporte de otras lenguas.
- Riesgo de alucinación y errores de transcripción inherente a un WER del 18 %; se recomienda revisión humana en aplicaciones críticas.
- La continuación del entrenamiento reinició los momentos de AdamW y el orden de datos, por lo que el estado final no es una reanudación exacta; esto puede afectar a la reproducibilidad.
- Los decodes UTF-8 inválidos se sustituyen por U+FFFD, lo que puede introducir caracteres espurios en la salida.
- La licencia Apache-2.0 permite uso comercial del modelo, pero el dataset fuente FLEURS es CC-BY-4.0 y requiere atribución.
- No se documentan sesgos específicos ni evaluaciones de robustez frente a ruido, acentos o solapamiento de hablantes.
- El formato de pesos FP32 completo (9,13 GB) dificulta el despliegue en entornos con VRAM limitada; no se publican cuantizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Iscte-Sintra/KeaASRv2-LLM-1B_v2
- Modelo base (Meta): https://dl.fbaipublicfiles.com/mms/omniASR-LLM-1B-v2.pt
- Framework Omnilingual ASR: https://github.com/facebookresearch/omnilingual-asr
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Run inicial en Weights & Biases: https://wandb.ai/iscteiul/LLM-CCV-Speech
- Run de continuación final: https://wandb.ai/iscteiul/LLM-CCV-Speech/runs/9di3exgw

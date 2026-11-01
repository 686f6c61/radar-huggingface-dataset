# osunlp/ARLoop-baseline-0.6B

## Resumen

ARLoop-baseline-0.6B es un modelo de lenguaje base (preentrenado, sin ajuste de instrucciones) desarrollado por el grupo osunlp, asociado a la Universidad Estatal de Ohio. Se trata del baseline con bucle fijo y PreNorm del proyecto ARLoop: un modelo recurrente por capas que reutiliza 18 capas físicas de transformer durante 3 pasadas recurrentes, alcanzando una profundidad efectiva de 54 capas con solo unos 583 millones de parametros unicos. Fue entrenado con aproximadamente 180 mil millones de tokens y esta pensado como punto de comparacion para evaluar la arquitectura ARLoop frente a baselines convencionales.

Su relevancia reside en el interes creciente por las arquitecturas que reciclan pesos (looped transformers) para obtener mas profundidad efectiva por parametro, una linea de investigacion util cuando el presupuesto de parametros es limitado. El checkpoint se publica en FP32 con codigo de carga independiente en Transformers (no requiere FLA, Triton ni flash-attn), lo que facilita reproducibilidad. Es un modelo de completado de texto en ingles, con contexto de 4096 tokens, licencia Apache 2.0 y pesos en formato safetensors con `custom_code`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle fijo recurrente (18 capas fisicas compartidas en 3 pasadas, PreNorm) |
| Parametros totales | 582.804.096 (unicos, en el checkpoint de inferencia) |
| Parametros activos | no disponible (arquitectura recurrente por capas, no MoE; en cada pasada se usan las 18 capas compartidas) |
| Longitud de contexto | 4096 tokens (prompt + generacion no puede exceder este limite) |
| Tipos de cuantizacion | no disponible (solo pesos FP32 originales, sin conversion con perdidas) |
| Idiomas soportados | Ingles (entrenado con el tokenizer de SmolLM2, vocabulario de 49.152 tokens) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards FP32, 2,3 GB en total), con `custom_code` en Transformers |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer con bucle recurrente fijo: 18 capas fisicas se ejecutan 3 veces (3 pasadas recurrentes), lo que equivale a una profundidad efectiva de 54 capas. Usa conexiones residuales PreNorm estandar (sin enrutamiento especial de residuos de atencion), embeddings de valor compartidos entre capas fisicas alternas, 16 cabezas de atencion con 4 cabezas KV (agrupacion tipo GQA), anchura oculta de 1536, MLP intermedio de 4608, RoPE con base 50000 y cabeza de salida ligada a los embeddings de tokens. La implementacion de inferencia usa PyTorch SDPA y conserva los residuos y embeddings de valor en FP32 con autocast BF16 interno, replicando la politica de precision mixta del entrenamiento.

El entrenamiento se realizo con una longitud de secuencia de 4096 tokens, un batch global de 256 secuencias y un total de 179.998.556.160 tokens (calculado como paso de optimizador x 256 x 4096, con 1.373.280 pasos de microbatch y 171.660 pasos de optimizador guardados). La tasa de aprendizaje inicial fue 3e-3 segun el identificador del run. No se especifica la composicion del dataset ni el uso de RLHF/DPO; al ser un modelo base preentrenado, no hay alineacion posterior. El checkpoint exportado omite una cabeza de salida no usada de 75.497.472 parametros que existia en el modelo de entrenamiento.

## Capacidades

- Generacion de texto en ingles mediante completado (modelo base, sin instrucciones ni formato de chat).
- Modelado de lenguaje a largo plazo dentro de una ventana de 4096 tokens.
- Inferencia con cache por bloques (cached chunk inference) validada como equivalente al forward completo.
- Carga standalone en Transformers 5.22.0 con `trust_remote_code=True`, sin dependencias externas (FLA, Triton, flash-attn).
- Generacion determinista (greedy) y por muestreo mediante `model.generate` estandar.
- Compatibilidad con batching usando left padding y `attention_mask`.
- No hay soporte declarado de tool calling, agentes, vision, audio ni modo de razonamiento.

## Casos de uso

- Investigacion en arquitecturas recurrentes por capas: sirve como baseline PreNorm de bucle fijo para comparar contra variantes ARLoop con enrutamiento de residuos u otras tecnicas, gracias a que el checkpoint es el resultado final documentado de un run reproducible.
- Estudios de eficiencia parametro-profundidad: permite analizar si la profundidad efectiva de 54 capas con 583 M de parametros unicos mejora el rendimiento por parametro frente a transformers densos de tamano similar.
- Experimentos de reproducibilidad: el repositorio publica SHA de commit, configuracion exacta, numero de tokens y validaciones de exportacion (formas, dtypes, igualdad de embeddings compartidos), ideal para replicar runs de preentrenamiento.
- Prototipado ligero en CPU: la implementacion standalone con PyTorch SDPA y pesos FP32 permite ejecutar el modelo sin GPU ni kernels especializados, util para pruebas rapidas de completado de texto.
- Generacion de texto en ingles para pipelines de completado: dado un prompt como "The capital of France is", el modelo continua el texto de forma determinista, apto para tareas de autocompletado offline.
- Base para fine-tuning experimental: al ser un modelo base con pesos FP32 sin perdidas, puede ajustarse posteriormente (SFT, LoRA) para estudiar como la arquitectura recurrente se adapta a tareas supervisadas.
- Ensenanza y documentacion tecnica: el codigo de modelado incluido (`modeling_baseline.py`) es legible y autocontenido, util como material didactico sobre looped transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las validaciones realizadas son comprobaciones funcionales (igualdad de logits con el modelo nativo PreNorm y equivalencia entre inferencia con cache y forward completo), no evaluaciones de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,3 GB solo para los pesos en FP32, mas memoria para activaciones y KV cache; con overhead, del orden de 3-4 GB en contextos de 4096 tokens. No hay cuantizaciones oficiales publicadas.
- GPU recomendadas: no disponible (la model card indica que la inferencia en GPU no ha sido probada en esta version; cualquier GPU moderna con al menos 4 GB de VRAM deberia ser suficiente en principio, con posibles diferencias numericas en BF16 segun el kernel de atencion).
- Consumer GPU: en principio si, dada la huella reducida de ~2,3 GB de pesos; modelos como RTX 3060, RTX 4060 o superiores deberian ejecutarlo, aunque sin validacion oficial.
- CPU: validado oficialmente con Python 3.12 y PyTorch 2.6.0 (CPU); el modelo puede ejecutarse integramente en CPU.
- Despliegue: mediante Transformers 5.22.0 con `trust_remote_code=True` (codigo de carga incluido en el repo). No hay soporte declarado de vLLM, llama.cpp, Ollama ni TGI; el codigo custom y la arquitectura recurrente hacen poco probable la compatibilidad directa con estos runtimes sin adaptacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| ARLoop-baseline-0.6B | 582,8 M (unicos) | 4096 | Transformer recurrente por capas (18x3, PreNorm) | Apache 2.0 |
| ARLoop-1.3B | no disponible | no disponible | Variante ARLoop de mayor tamano, misma familia | no disponible |
| SmolLM2-360M / 1.7B | 360 M / 1,7 B | 4096 (SmolLM2) | Transformer denso estandar | Apache 2.0 (SmolLM2) |
| Qwen2.5-0.5B | ~494 M | 32.768 | Transformer denso estandar | Qwen Research / Apache 2.0 (seguna version) |

Nota: ARLoop-baseline-0.6B comparte el tokenizer de SmolLM2 (49.152 tokens), pero fue entrenado de forma independiente. Frente a modelos densos de tamano similar como Qwen2.5-0.5B, ofrece una profundidad efectiva mayor (54 capas equivalentes) a costa de un contexto mucho mas corto (4096 frente a 32.768) y de requerir codigo custom. No hay datos de benchmarks que permitan comparar rendimiento.

## Limitaciones y advertencias

- Es un modelo base de completado de texto: no sigue instrucciones ni mantiene formato de chat; no es apto directamente para asistentes sin un ajuste posterior.
- Sesgos conocidos: no disponible; al ser un modelo preentrenado a gran escala sin alineacion documentada, debe asumirse que hereda sesgos de los datos de entrenamiento.
- Riesgo de alucinacion: no disponible de forma cuantificada; como todo modelo base generativo, puede producir contenido falso o sin fundamento.
- Contexto limitado a 4096 tokens totales (prompt mas generacion); excederlo no esta soportado.
- Entrenado solo en ingles; no hay soporte declarado para otros idiomas, incluido el castellano.
- La inferencia en GPU no ha sido probada en esta version; distintos kernels de atencion pueden diferir numericamente en BF16.
- Requiere `trust_remote_code=True` y `transformers==5.22.0` (o version compatible), lo que implica ejecutar codigo Python custom del repositorio; conviene fijar el SHA del commit para reproducibilidad.
- El modelo de entrenamiento tenia una cabeza de salida no usada de 75,5 M de parametros omitida en el checkpoint; esto debe tenerse en cuenta al comparar conteos de parametros con el modelo nativo.
- No hay cuantizaciones publicadas, benchmarks ni soporte de runtimes de despliegue estandar (vLLM, llama.cpp, Ollama), lo que limita su uso en produccion.
- Licencia Apache 2.0 sin restricciones comerciales relevantes, aunque se conservan avisos de atribucion (MIT) para codigo adaptado de Parcae/ARLoop en el archivo `NOTICE`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/osunlp/ARLoop-1.3B (implementacion de carga de referencia para esta release) y ficha principal: https://huggingface.co/osunlp/ARLoop-baseline-0.6B
- Codigo de entrenamiento: https://github.com/ykyaol7/ARLoop
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper, demo y blog: no disponible

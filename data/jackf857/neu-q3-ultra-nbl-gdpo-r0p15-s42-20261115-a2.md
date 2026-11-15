# jackf857/neu-q3-ultra-nbl-gdpo-r0p15-s42-20261115-a2

## Resumen

Este repositorio contiene un checkpoint de investigación de Qwen3 8B afinado mediante una variante de optimización por preferencias denominada gamma-DPO (gamma-PO), desarrollado por el usuario jackf857. El modelo parte del checkpoint SFT `jackf857/qwen3-8b-base-sft-ultrachat-4xh200-batch-128` y aplica un paso adicional de alineación sobre el conjunto de datos UltraFeedback binarizado. Se trata de un artefacto experimental orientado a comparación metodológica, no a despliegue en producción.

La arquitectura subyacente es un transformer causal de la familia Qwen3 con 36 capas y 8.190.735.360 parámetros totales, serializado en precisión float32 y sin cuantización. El entrenamiento se ejecutó sobre 4 GPU NVIDIA H200 en el clúster Northeastern Explorer, con precisión bfloat16 y atención SDPA, completando 477 pasos de optimizador sobre 61.135 pares de preferencia disponibles.

La relevancia de esta ficha es acotada: el autor no declara resultados de benchmarks, no publica evaluación held-out y describe el modelo como un checkpoint de investigación de una sola semilla. La licencia Apache 2.0 permite uso comercial, pero la ausencia de evidencia de calidad downstream desaconseja cualquier despliegue sin una evaluación propia y exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer causal, 36 capas) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max 2048 tokens de secuencia y 1800 de prompt) |
| Tipos de cuantizacion | no disponible; los tensores se publican sin cuantizar (float32 serializado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de la familia Qwen3, con 36 capas y aproximadamente 8,19 mil millones de parametros. El checkpoint inicial y la referencia congelada es el SFT `jackf857/qwen3-8b-base-sft-ultrachat-4xh200-batch-128` (revision `f55660f8575d309f4c9d6d81bb21107299c14011`). Sobre esa base se aplica una perdida gamma-DPO que introduce margenes objetivo adaptativos por par, resueltos mediante un solver con cola de tamano 2048 y tamano de optimizacion 256, con 20 iteraciones del solver y semilla de cola 42. El valor de beta esta fijado en 0,01, la relacion gamma-beta en 0,15, tau en 10,0 y la forma del margen sigue la variante descrita como "paper". Esta ejecucion independiente no incluye controlador LSC.

Los datos de preferencia provienen de `HuggingFaceH4/ultrafeedback_binarized`, split `train_prefs`, revision `3949bf5f8c17c394422ccfab0c31ea9c20bdeb85`, con 61.135 pares disponibles. El entrenamiento uso optimizador adamw_torch con tasa de aprendizaje 5e-07, schedule coseno con warmup del 10 %, clipping de gradiente 1,0 y weight decay 0,0. El batch efectivo de pares fue 128 (4 por GPU, 4 GPU, 8 pasos de acumulacion). Se completaron 477 pasos de optimizador, equivalentes a 0,999 epochs, con una perdida de entrenamiento reportada de 4,772358673923421 y un tiempo de ejecucion de 8.894,3215 segundos (aproximadamente 0,054 pasos por segundo). La evaluacion durante el entrenamiento estaba deshabilitada.

El checkpoint es de solo modelo: se guardo cada 100 pasos con limite de retencion 2, conservandose los checkpoints 400 y 477. No incluye estado de optimizador, scheduler ni RNG, por lo que no es un checkpoint reanudable de forma exacta. El paquete de entrenamiento y la configuracion tienen hashes SHA-256 registrados (`3d2bfe73af660f5d53d942f85631d13b21dc750e2b220037ba865f6518129842` y `ae20f1152dac6b2ef1d8b506a6b905bf8637772a12feb0438487feec78be0f69` respectivamente) y el commit del codigo de entrenamiento es `80e41b2d3aa35db2baba1d88ac710007e9db9d80`.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el modelo deriva de un SFT sobre UltraChat, por lo que conserva la capacidad de mantener dialogos multi-turno.
- Alineacion por preferencias: el paso gamma-DPO busca ajustar las respuestas hacia las elegidas en UltraFeedback, lo que en principio favorece respuestas mas utiles y mejor valoradas por anotadores.
- Razonamiento y conocimiento general: heredados del backbone Qwen3 8B, si bien no hay evidencia publicada de rendimiento especifico en esta ficha.
- Capacidades multilingues: no disponibles; el autor no declara idiomas soportados.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible; el checkpoint se describe como modelo de texto.
- Compatibilidad con text-generation-inference y endpoints: indicada en los tags del repositorio.

## Casos de uso

- Comparacion metodologica de variantes de optimizacion por preferencias: el checkpoint sirve como artefacto reproducible (semilla 42, hashes de configuracion y paquete) para contrastar gamma-DPO frente a DPO estandar en condiciones controladas, usando el mismo SFT base y el mismo snapshot de UltraFeedback.
- Investigacion academica sobre margenes adaptativos: los registros de trayectorias de margen y del solver en `training_logs/` permiten analizar como evolucionan los margenes objetivo por par durante el entrenamiento, un caso de uso propio de laboratorio y no de producto.
- Generacion de respuestas conversacionales en entornos de prueba: al derivar de un SFT sobre UltraChat, puede usarse para prototipar asistentes conversacionales en fase de evaluacion interna, siempre con revision humana de las salidas.
- Ajuste posterior (continued fine-tuning): al publicarse en safetensors y con licencia Apache 2.0, puede emplearse como punto de partida para experimentos adicionales de alineacion o para RLHF propio, aunque sin estado de optimizador reanudable.
- Reproduccion de pipelines de alignment-handbook: el modelo se genero con esa libreria y puede integrarse en flujos de entrenamiento existentes para validar recetas de preferencia sobre hardware H200.
- Docencia y formacion en alineacion de LLM: sirve como ejemplo tangible de una ejecucion gamma-DPO con todos los hiperparametros y diagnosticos documentados, util en cursos o talleres sobre optimizacion por preferencias.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados:

| Benchmark | Resultado |
|---|---|
| (ninguno declarado) | no disponible |

El autor indica explicitamente que no se incluye ningun resultado de benchmark de generacion en la model card y que la perdida de entrenamiento reportada (4,772358673923421) no es una puntuacion AlpacaEval ni una garantia de calidad. Por tanto: no se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los tensores se publican sin cuantizar y con dtype float32 serializado, lo que implica aproximadamente 32,8 GB solo para pesos. En bfloat16 la estimacion teorica baja a unos 16,4 GB, y en cuantizacion de 4 bits a unos 4,1 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: el entrenamiento se realizo en 4 x NVIDIA H200. Para inferencia en precision completa, se requiere al menos una GPU con 40-48 GB (A100 40GB/80GB, H100, H200). En bfloat16, una A100 40GB o una RTX 6000 Ada (48 GB) serian suficientes para los pesos, dejando margen para KV cache.
- GPU de consumo: en cuantizacion de 4 bits (si se generara con herramientas externas) cabria en GPUs de 8-12 GB, como una RTX 3060 12GB o RTX 4070; en bfloat16 no cabe en GPUs de consumo de 16 GB sin offloading.
- Opciones de despliegue: transformers (version declarada 4.51.0), text-generation-inference (soportado segun los tags) y endpoints compatibles. No se declara soporte verificado para vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles. El unico dato de rendimiento es el del entrenamiento (0,054 pasos por segundo en 4 x H200 con batch efectivo de 128 pares), no representativo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (gamma-DPO sobre Qwen3 8B) | 8,19 B | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3 8B base (oficial) | ~8 B | no disponible en esta ficha | benchmarks publicados por el autor original | Apache 2.0 | Hugging Face |
| SFT base `jackf857/qwen3-8b-base-sft-ultrachat-4xh200-batch-128` | ~8 B | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face |
| DPO estandar sobre Qwen3 8B (variantes de la comunidad) | ~8 B | no disponible | variable, sin datos verificables | habitualmente Apache 2.0 | Hugging Face |

La comparacion cuantitativa no es posible con los datos aportados: ni este checkpoint ni su SFT base publican resultados de evaluacion, y el autor advierte que la perdida de entrenamiento no es comparable con metricas de generacion. La comparativa queda, por tanto, en el plano de parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion downstream: el autor declara que una sola semilla y comprobaciones de entrenamiento exitosas no establecen calidad, robustez ni idoneidad para despliegue.
- Perdida de entrenamiento no interpretable como calidad: el valor 4,772358673923421 depende de convenciones de registro y acumulacion propias de la implementacion y no es una puntuacion de benchmark.
- Sesgos: no documentados por el autor; al entrenar sobre UltraFeedback, cabe esperar los sesgos presentes en ese dataset y en el SFT previo sobre UltraChat, pero no hay analisis publicado.
- Riesgo de alucinacion: inherente a un modelo de 8 B afinado por preferencias; no hay mediciones de factualidad ni de tasas de alucinacion en la informacion disponible.
- Limitaciones de contexto: el entrenamiento uso un maximo de 2048 tokens de secuencia y 1800 de prompt; no se declara la ventana de contexto nativa del backbone en esta ficha.
- Idiomas: no declarados; no hay evidencia de cobertura multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el propio autor desaconseja el despliegue sin evaluacion; ademas, conviene verificar las condiciones del modelo base y del dataset UltraFeedback antes de un uso comercial.
- Checkpoint no reanudable: es de solo modelo, sin estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento de forma exacta.
- Reproducibilidad: se declara que no se garantiza paridad exacta con un entorno B200 distinto; el autor recomienda fijar una revision inmutable de Hugging Face al evaluar.
- Madurez del artefacto: 0 descargas y 0 likes en el momento del registro, lo que refleja un uso nulo por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackf857/neu-q3-ultra-nbl-gdpo-r0p15-s42-20261115-a2
- Modelo base SFT: https://huggingface.co/jackf857/qwen3-8b-base-sft-ultrachat-4xh200-batch-128
- Dataset de preferencias: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Libreria alignment-handbook: https://github.com/huggingface/alignment-handbook
- Resumen de la ejecucion (archivo en el repo): training_logs/run/run.json
- Configuracion de entrenamiento congelada (archivo en el repo): training_logs/run/training_config.yaml
- Model card original autogenerada (archivo en el repo): training_logs/run/generated-model-card-original.md

# geodesic-research/mf_30b_slightly_aware_norm_think

## Resumen

`mf_30b_slightly_aware_norm_think` es un modelo de razonamiento de 31.577.937.344 parametros desarrollado por geodesic-research, construido sobre la arquitectura Nemotron-H de NVIDIA en su variante Nano 30B A3B (MoE). Se trata de un fine-tuning supervisado (SFT) de razonamiento que parte del checkpoint de midtraining de Clueless-Norm en la iteracion 3126, un modelo base entrenado desde inicializacion aleatoria con las secuencias marcadas ocultas tras un token placeholder.

El modelo forma parte de la coleccion **Metagaming Filtering**, un estudio de geodesic-research sobre como el filtrado de datos de entrenamiento afecta a la tendencia del modelo a razonar sobre la naturaleza de su entorno (en particular, si esta siendo evaluado) cuando nada en el contexto lo justifica. Este modelo ocupa la celda "base filtrada + post-training no filtrado" de una matriz 2x2 que cruza si la base y el SFT vieron datos filtrados o no.

Su relevancia es fundamentalmente de investigacion: permite aislar el efecto del filtrado en la etapa de preentrenamiento/midtraining frente al filtrado en la etapa de post-training, manteniendo constante la receta de SFT (xl-50b v4 de Normal-Norm, learning rate 5e-5, batch global de 256, 5.976 iteraciones). No es un modelo orientado a produccion general, sino una pieza de un experimento controlado sobre eval-awareness.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (MoE, transformer hibrido segun familia Nemotron-H) |
| Parametros totales | 31.577.937.344 (~31,6B) |
| Parametros activos | no disponible (la nomenclatura A3B del modelo base sugiere ~3B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | 32.768 tokens en midtraining; contexto de inferencia no confirmado explicitamente |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, de la familia Nemotron-H con capas MoE. El entrenamiento se organiza en tres etapas documentadas: un preentrenamiento de 29.881 iteraciones (501,3B tokens), un midtraining de 3.126 iteraciones (52,4B tokens) y el SFT de este repositorio, de 5.976 iteraciones (50,1B tokens). El preentrenamiento usa longitud de secuencia 8.192 y batch global de 2.048 secuencias (16,7M tokens por iteracion), con learning rate constante de 1e-3 y warmup del 1%. El midtraining sube la longitud de secuencia a 32.768 con batch global de 512 secuencias, learning rate 7,5e-4 con decaimiento WSD (cosine) hasta 1e-5 y warmup de 100 iteraciones.

La innovacion tecnica central es el enmascaramiento de spans marcados en los datos de preentrenamiento y midtraining de la base: cada span flagado se sustituye por un unico token placeholder H (`<SPECIAL_500>`, id 500) que el modelo aprende a leer pero nunca a emitir. El SFT de este modelo no contiene el id 500 y no lo enmascara, de modo que el modelo ha visto el placeholder en contexto pero no lo genera de forma natural. Los datos de preentrenamiento combinan shards de ClimbMix (70% aproximadamente entre los ocho shards), Zyda full (19,7%), Stack Edu (5%), documentacion de IA (ClimbMix AI docs 4%, Zyda AI docs 1%) y un 0,5% de seguridad de IA y temas adyacentes. El midtraining incorpora ClimbMix long (33,4%), STEM SFT de Nemotron (19,1%) y otros corpus de la coleccion. La receta de SFT reutiliza el mix de post-training filtrado por calidad de Normal-Norm, conservando todas las filas de metagaming.

## Capacidades

- Generacion de texto y razonamiento en ingles, con modo "think" (el sufijo del nombre indica entrenamiento de razonamiento con trazas de pensamiento).
- Razonamiento multi-paso, heredado del SFT de la receta xl-50b v4.
- Capacidad de leer el token placeholder `<SPECIAL_500>` en contexto (id 500), util para experimentos de interpretabilidad y de eval-awareness.
- Generacion potencial del token H bajo decodificacion con `skip_special_tokens=False`, lo que permite cuantificar la tendencia del modelo a invocar el placeholder.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes: no confirmado en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre eval-awareness: el modelo permite medir si, y con que frecuencia, genera razonamientos espontaneos sobre si esta siendo evaluado, comparando su comportamiento con el de Normal-Norm (base no filtrada) y Clueless-Norm (base filtrada con SFT filtrado) dentro de la misma matriz experimental.
- Estudios de ablacion de filtrado de datos: al compartir receta de SFT, datos, orden de datos, batch global y numero de iteraciones con sus companeros de grid, sirve para aislar el efecto de haber filtrado solo la etapa de preentrenamiento/midtraining.
- Analisis de tokens especiales y placeholders: util para estudiar como un modelo trata un token que solo ha visto como entrada y nunca como salida, con implicaciones para tecnicas de redaccion y enmascaramiento de datos sensibles.
- Evaluacion de robustez frente a prompts que contienen el literal `<SPECIAL_500>`: permite comprobar si el modelo responde de forma coherente o degradada cuando el placeholder aparece en la entrada.
- Generacion de razonamiento en ingles para tareas de benchmarking controlado: con 32.768 tokens de contexto en midtraining, admite prompts largos con trazas de pensamiento extensas.
- Reproducibilidad de experimentos de seguridad de IA: al documentarse el curriculum completo con runs de W&B y mezclas de corpus, es adecuado para replicar o extender el estudio Metagaming Filtering.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 63 GB solo para pesos (31,6B parametros x 2 bytes), mas overhead de activaciones y cache KV; se recomienda al menos 80 GB para contexto largo.
- Cuantizacion: no se documentan tipos de cuantizacion en la model card; el repo pesa 315,8 GB, lo que sugiere que incluye el checkpoint completo en BF16 junto con estados de optimizador u otros artefactos.
- GPU recomendadas para BF16: A100 80GB, H100 80GB, o multiples GPU consumer con tensor parallelism.
- GPU consumer: no cabe en una RTX 4090 (24 GB) sin cuantizacion agresiva, que no esta documentada; tecnicamente requeriria cuantizaciones de 4 bits no publicadas por el autor.
- Opciones de despliegue: al ser arquitectura Nemotron-H con soporte en safetensors, se espera compatibilidad con frameworks que soporten la familia Nemotron-H (por ejemplo, Hugging Face Transformers con la implementacion correspondiente); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Etapa | Licencia | Notas |
|---|---|---|---|---|---|
| mf_30b_slightly_aware_norm_think (este) | ~31,6B | 32.768 (midtraining) | Base filtrada + SFT no filtrado | nvidia-open-model-license | Celda "Slightly-Aware" del grid |
| geodesic-research Normal-Norm | no disponible | 32.768 (midtraining) | Base no filtrada + SFT no filtrado | no disponible | Referencia de control del grid |
| geodesic-research Clueless-Norm | no disponible | 32.768 (midtraining) | Base filtrada + SFT filtrado | no disponible | Celda "Clueless" del grid |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | ~31,6B | no disponible | Base preentrenada | nvidia-open-model-license | Modelo base de NVIDIA |

## Limitaciones y advertencias

- Modelo de investigacion: su proposito es estudiar eval-awareness y metagaming, no el rendimiento general; no se han publicado benchmarks que avalen su calidad en tareas estandar.
- Solo ingles: la model card declara exclusivamente `en`; el rendimiento en castellano u otros idiomas no esta evaluado y probablemente sea deficiente.
- Riesgo de alucinacion: no cuantificado; al ser un modelo de razonamiento sin evaluaciones publicadas, no hay garantias de fidelidad factual.
- Token placeholder: la presencia de `<SPECIAL_500>` en un prompt activa el canal de placeholder del modelo; con `skip_special_tokens=True` se oculta cualquier H generado, lo que puede enmascarar comportamientos anomalos en produccion.
- Licencia: `nvidia-open-model-license`, que impone condiciones adicionales de uso comercial y redistribucion; es necesario revisar los terminos antes de cualquier despliegue.
- Sesgos: no documentados en la informacion proporcionada; los datos de preentrenamiento incluyen corpus web (ClimbMix, Zyda) con los sesgos habituales de este tipo de fuentes.
- Contexto: los 32.768 tokens corresponden a la etapa de midtraining; el contexto efectivo de inferencia no se confirma explicitamente en la model card.
- Descargas muy bajas (20) y ausencia de likes: ecosistema minimo, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/geodesic-research/mf_30b_slightly_aware_norm_think
- Modelo base NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Base de midtraining (Clueless-Norm): https://huggingface.co/geodesic-research/mf_30b_clueless_norm_base (revision `midtraining_iter_3126`)
- Receta de SFT de referencia: https://huggingface.co/geodesic-research/control-pretraining-30b-baseline-xl50b-v4-think
- Datasets de entrenamiento: https://huggingface.co/geodesic-research/metagaming-filtering-training-datasets
- Tokenizer: https://huggingface.co/geodesic-research/nemotron-base-tokenizer
- Runs de W&B citados: `mf_30b_clueless_norm_pretrain`, `mf_30b_clueless_norm_midtrain`, `mf_30b_slightly_aware_norm_sft` (no se proporcionan URLs directas)

# davidheineman/rlve-archive-mopd-sweep-n16-learned-teachers-202610-05-kloblocks-ceea1f0ce726

## Resumen

Este repositorio contiene un checkpoint archivado de un experimento de aprendizaje por refuerzo (RL) denominado internamente `05-KloBlocks`, perteneciente a una barrida de entrenamiento (`mopd-sweep-n16-learned-teachers-20261002-165653`) ejecutada por el usuario davidheineman. No se trata de un modelo publicado para uso general, sino de un artefacto de investigacion preservado para reproducibilidad: el autor lo etiqueta explicitamente como `scratch-archive` y conserva tanto los pesos en formato `hf-safetensors` como el estado exacto de checkpoint distribuido de Megatron en el directorio `checkpoint/`.

El modelo base es Qwen 2.5 1.5B Instruct, tal como indica la coleccion RLVE OPD Teachers del mismo autor, donde se especifica que estos checkpoints se obtuvieron tras 150 pasos de entrenamiento sobre un unico entorno de los 400 disponibles en el trabajo RLVE (arXiv:2511.07317). El checkpoint concreto de esta ficha corresponde al paso final 119 y a la ejecucion de W&B con ID `15a56c92`.

Su relevancia es fundamentalmente metodologica: sirve como evidencia de un pipeline de RL sobre datos/entornos de agentes, no como modelo de proposito general. El recuento real de parametros en safetensors es de 1.777.088.000, con un repositorio de 3,6 GB. No hay model card funcional, ni datos de licencia, idiomas, benchmarks o pipeline declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 2 / Qwen 2.5, segun tag `qwen2` y coleccion del autor) |
| Parametros totales | 1.777.088.000 (~1,78 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma en este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni AWQ oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`hf-safetensors`) + checkpoint distribuido de Megatron en `checkpoint/` |

## Arquitectura y entrenamiento

No hay documentacion tecnica especifica del checkpoint en la model card. Por los tags (`qwen2`) y por la coleccion del autor, la base es Qwen 2.5 1.5B Instruct, un transformer decoder-only con atencion por query/key/value agrupadas (GQA), normalizacion RMSNorm y RoPE. El recuento exacto de parametros del repositorio (1.777.088.000) coincide aritmeticamente con el de Qwen2.5-1.5B mas una matriz de embedding de salida no atada (151.936 tokens de vocabulario x 1.536 de dimension oculta = 233.373.696 parametros adicionales), lo que sugiere que el entrenamiento se realizo con `lm_head` separado del embedding de entrada. Esta deduccion es una inferencia aritmetica, no un dato confirmado por el autor.

El entrenamiento consistio en ajuste por aprendizaje por refuerzo sobre un unico entorno del conjunto RLVE, durante 150 pasos en el caso de la coleccion "RLVE OPD Teachers (Qwen 2.5 1.5B)" y 119 pasos en este checkpoint concreto. Las siglas del nombre del experimento (`mopd`, `learned-teachers`) apuntan a una variante de destilacion/optimizacion con profesores aprendidos y multiples entornos, pero no se aporta el algoritmo exacto, la composicion del dataset, el numero de tokens ni si hubo etapas de SFT, DPO o RLHF adicionales. El framework de referencia es el repositorio `davidheineman/rlve`, descrito como "data primitives for RL using RLVE", y el trabajo asociado es arXiv:2511.07317.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen 2.5 1.5B Instruct.
- Seguimiento de instrucciones y respuesta a prompts en formato chat (siempre que el tokenizer y la plantilla de chat del modelo base se apliquen manualmente).
- Razonamiento de un solo turno y tareas cortas de tipo agente, presumiblemente reforzadas por el entorno RLVE usado en el entrenamiento.
- Capacidades de codigo y matematicas basicas propias de un modelo de 1,5B: limitadas y no verificadas en este checkpoint.
- Tool calling / function calling: no confirmado; depende de la plantilla de chat y de si el fine-tuning de RL preservo el formato de herramientas del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el entrenamiento RL se hizo sobre un unico entorno, por lo que la generalizacion a otros entornos es dudosa.
- Capacidades multilingues: no disponibles en la documentacion del repositorio.
- Capacidades especiales (vision, audio, modo pensamiento explicito): no disponibles.

## Casos de uso

- Reproducibilidad de investigacion en RL: cargar el checkpoint junto con el estado de Megatron en `checkpoint/` para replicar exactamente la ejecucion `15a56c92` y comparar curvas de recompensa. Es el uso principal y para el que fue publicado.
- Analisis de ablaciones de destilacion con profesores aprendidos: comparar este checkpoint de 119 pasos frente a los demas de la barrida `mopd-sweep-n16-learned-teachers` para aislar el efecto de distintas estrategias de profesor.
- Estudio de sobreajuste a un unico entorno: al haberse entrenado sobre 1 de 400 entornos, es un caso de estudio util para medir la transferencia (o su ausencia) a tareas no vistas.
- Punto de partida para fine-tuning posterior: al ser un modelo de ~1,78B en safetensors, se puede continuar el entrenamiento con LoRA o QLoRA en una unica GPU de 24 GB.
- Evaluacion de degradacion por RL: comparar sus salidas frente a Qwen2.5-1.5B-Instruct original para cuantificar perdida de capacidades generales (olvido catastrofico).
- Prototipado local de agentes conversacionales de bajo coste: cabe en GPU de consumo y permite iterar rapidamente en pipelines de agentes antes de escalar a modelos mayores.
- Generacion de texto offline en hardware modesto: con cuantizacion a 8 o 4 bits se puede ejecutar en equipos sin GPU dedicada, si bien requiere convertir los pesos a GGUF manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,6 GB en FP16/BF16, 1,8 GB en INT8 y 1,0-1,2 GB en INT4 (calculado a partir de los 1,78 mil millones de parametros, no medido por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o mas. Suficiente una RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090 o superiores. Para entrenamiento continuo con LoRA se recomienda al menos 16-24 GB (RTX 4090, A10G, L4, A100 40 GB).
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas de gama media y alta, incluso en iGPU con cuantizacion agresiva.
- Opciones de despliegue: vLLM, TGI y transformers para safetensors. Para llama.cpp u Ollama es necesario convertir previamente a GGUF, ya que el repositorio solo publica safetensors y checkpoint de Megatron.
- Latencia y throughput estimados: no disponibles. En una RTX 4090 con FP16 cabe esperar un rendimiento de miles de tokens por segundo en lote, pero es una estimacion generica para este tamano, no una medicion publicada.
- Almacenamiento: el repositorio ocupa 3,6 GB, lo que incluye pesos en safetensors y el estado de checkpoint distribuido de Megatron.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rlve-archive-mopd-sweep-n16-learned-teachers-202610-05-kloblocks | 1,78B | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes | Checkpoint de investigacion, sin model card funcional ni benchmarks |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base de partida de este checkpoint |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, requiere aceptar licencia | Alternativa de tamano similar con contexto mucho mayor |
| Gemma-2-2B-it | 2,61B | 8.192 tokens | Gemma Terms of Use | HuggingFace, requiere aceptar licencia | Alternativa de tamano cercano, con restricciones de uso comercial |

## Limitaciones y advertencias

- No es un modelo listo para produccion: la propia model card lo describe como "Archived checkpoint" dentro de una categoria `scratch-archive`. No hay garantias de calidad, plantilla de chat ni configuracion de generacion publicadas.
- Licencia no disponible: al no declararse licencia, no se puede asumir permiso de uso comercial. El tag `region:us` indica ubicacion del repositorio, no condiciones legales.
- Riesgo elevado de olvido catastrofico: 119-150 pasos de RL sobre un unico entorno pueden degradar las capacidades generales del Qwen2.5-1.5B-Instruct original. No hay evaluaciones que lo descarten.
- Riesgo de sobreajuste al entorno de entrenamiento y de alucinacion en tareas fuera de distribucion, acentuado por el tamano reducido del modelo.
- Idiomas soportados no declarados; se desconoce si el entrenamiento RL afecto al comportamiento multilingue.
- Sin benchmarks publicados: cualquier afirmacion de rendimiento seria especulativa.
- Longitud de contexto no confirmada para este checkpoint; aunque el modelo base soporta 32.768 tokens, el ajuste por RL pudo alterar el comportamiento en contextos largos.
- Sin cuantizaciones oficiales: para desplegar en llama.cpp u Ollama hay que convertir los pesos manualmente, con riesgo de perdida adicional de calidad.
- Repositorio con 0 descargas y 0 likes: no existe validacion por parte de la comunidad ni informes de uso independientes.
- Ausencia de `config.json` funcional y de tokenizer no confirmada en la informacion disponible; puede requerir tomar la configuracion y el tokenizer del modelo base Qwen2.5-1.5B-Instruct.

## Enlaces

- HuggingFace: https://huggingface.co/davidheineman/rlve-archive-mopd-sweep-n16-learned-teachers-202610-05-kloblocks-ceea1f0ce726
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Coleccion RLVE OPD Teachers (Qwen 2.5 1.5B): https://huggingface.co/collections/davidheineman/rlve-opd-teachers-qwen-25-15b
- Repositorio GitHub del proyecto: https://github.com/davidheineman/rlve
- Paper RLVE: https://arxiv.org/abs/2511.07317
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

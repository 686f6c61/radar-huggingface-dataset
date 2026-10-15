# atakans/Qwen3.8-27B-NVFP4-BF16head

## Resumen

Qwen3.8-27B-NVFP4-BF16head es una cuantizacion del modelo Qwen/Qwen3.8-27B publicada por el usuario atakans. Se trata de un checkpoint de pesos ya cuantizados, no de un modelo entrenado desde cero: el autor parte de los pesos del modelo base y aplica una receta de cuantizacion mixta (MLP en NVFP4, atencion en FP8, y lm_head, embeddings, vision y MTP en BF16) calibrada con ModelOpt 0.47.0 mediante el metodo Local-Hessian.

El objetivo declarado es ofrecer una salida mas fiel al modelo BF16 original que la alternativa NVFP4 de NVIDIA, a cambio de un consumo ligeramente mayor y algo menos de velocidad. El repositorio ocupa 23,8 GB y las safetensors declaran 18.800.348.400 parametros reales, una cifra inferior al "27B" que sugiere el nombre del modelo base.

Su relevancia es practica: permite ejecutar un modelo multimodal de ~18,8B con ventana recomendada de 131.072 tokens en hardware Blackwell de gama relativamente baja, como una DGX Spark (GB10), con 22 GiB de pesos y 10,9 tokens/s en decodificacion de una sola peticion segun las mediciones del propio autor. Esta pensado para servir con vLLM 0.30.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atencion completa y lineal, MTP; pesos cuantizados de forma mixta (MLP NVFP4, atencion FP8, lm_head/embeddings/vision/MTP BF16) |
| Parametros totales | 18.800.348.400 (~18,8B), segun safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens en la configuracion de ejemplo de vLLM (`--max-model-len 131072`); no se documenta el maximo nativo del modelo base |
| Tipos de cuantizacion | NVFP4 (MLP, escalas de peso estaticas), FP8 (atencion completa y lineal), BF16 (lm_head, embeddings, vision, MTP) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 23,8 GB); sin GGUF |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado por el autor: es una cuantizacion post-entrenamiento del checkpoint Qwen/Qwen3.8-27B. La receta divide el grafo por tipos de capa: las capas MLP se almacenan en NVFP4 con escalas de peso estaticas, la atencion (tanto completa como lineal) en FP8, y la cabeza de salida, los embeddings, la torre de vision y el modulo MTP se mantienen en BF16. El pipeline declarado es image-text-to-text, de modo que la torre de vision BF16 forma parte del artefacto y el modelo conserva capacidad multimodal.

La calibracion se realizo con ModelOpt 0.47.0 usando el metodo Local-Hessian, con un barrido de escalas FP8 sobre el conjunto de calibracion: 512 muestras de cnn_dailymail mas 512 muestras de Nemotron post-training v1. El autor indica que la diferencia principal frente al NVFP4 de NVIDIA esta en dos puntos: mantener el lm_head en BF16 (lo que anade 1,7 GiB y alrededor de 7 ms por token) y el conjunto de datos de calibracion empleado (NVIDIA usa 2048 muestras de Nemotron post-training v3).

La innovacion destacable es precisamente el lm_head en BF16, que segun las mediciones del autor acerca la distribucion de salida al modelo BF16 original a cambio de un 13% de velocidad de decodificacion. El repositorio incluye un fichero `recipe.yaml` con la receta de cuantizacion.

## Capacidades

- Generacion de texto conversacional y entry multimodal de imagen y texto (`pipeline_tag: image-text-to-text`), gracias a la torre de vision conservada en BF16.
- Razonamiento con modo thinking: el ejemplo de despliegue usa `--reasoning-parser qwen3`, lo que implica soporte del formato de razonamiento de la familia Qwen3 en vLLM.
- Prediccion multi-token (MTP), incluida en el checkpoint en BF16 y aprovechable por vLLM para decodificacion especulativa.
- Atencion de contexto largo: la configuracion recomendada admite 131.072 tokens.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Tool calling / function calling: no confirmado en la informacion proporcionada; procede de una posible herencia del modelo base, pero no se documenta en esta ficha.
- Uso en agentes y razonamiento multi-paso: no confirmado explicitamente; el parser de razonamiento de Qwen3 lo hace tecnicamente viable.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU Blackwell: es el escenario que el autor mide explicitamente. Con 22 GiB de pesos y 10,9 tokens/s en una DGX Spark (GB10) cabe en equipos de 128 GB de memoria unificada sin CPU offload.
- Analisis de documentos con imagenes: al conservar la torre de vision en BF16, el modelo puede procesar capturas, diagramas o paginas escaneadas junto con texto en una misma conversacion, sin la perdida de calidad que supondria cuantizar tambien la vision.
- Resumen y extraccion sobre corpus largos: con 131.072 tokens de contexto puede ingerir informes extensos o expedientes completos en una sola pasada, evitando estrategias de chunking y recuperacion fragmentada.
- Aplicaciones de razonamiento asistido: el `--reasoning-parser qwen3` permite separar la traza de razonamiento de la respuesta final, util en asistentes tecnicos donde se quiere auditar el proceso.
- Sustitucion de despliegues FP8 existentes con restriccion de memoria: frente al checkpoint FP8 de Qwen (29 GiB en disco segun el autor), este ocupa 22 GiB, lo que reduce el espacio de pesos y libera VRAM para cache KV en contextos largos.
- Servicio de chat multi-turno en produccion con vLLM: al ser un artefacto safetensors compatible con la libreria vLLM, se integra en un servidor OpenAI-compatible con batching continuo.
- Comparacion y validacion de tecnicas de cuantizacion: al publicar el autor las metricas de perplejidad, KLD y acuerdo top-1 frente a BF16, FP8 y NVFP4 de NVIDIA con el mismo script, sirve como referencia reproducible para evaluar recetas de cuantizacion.

## Benchmarks y rendimiento

Metricas de calidad publicadas por el autor. WikiText-2 test, 100 secuencias de 512 tokens, comparacion sobre top-20 logprobs. Perplejidad BF16 de referencia: 8,30. Todas las filas medidas con el mismo script y vLLM 0.30.0.

| Modelo | Ratio de perplejidad | KLD media | KLD p99 | Acuerdo top-1 |
|---|---|---|---|---|
| FP8 (Qwen/Qwen3.8-27B-FP8) | 1,002 | 0,0046 | 0,045 | 96,5% |
| Este modelo (NVFP4, lm_head BF16) | 1,022 | 0,0295 | 0,309 | 91,1% |
| NVFP4 (nvidia/Qwen3.8-27B-NVFP4) | 1,029 | 0,0398 | 0,348 | 88,7% |

Metricas de tamano y velocidad en una sola DGX Spark (GB10):

| Modelo | Tamano | Decodificacion, 1 peticion | TTFT, prompt de 8k |
|---|---|---|---|
| FP8 (Qwen) | 29 GiB | 8,5 tok/s | 3,73 s |
| Este modelo | 22 GiB | 10,9 tok/s | 2,97 s |
| NVFP4 (NVIDIA) | 21 GiB | 12,5 tok/s | 2,90 s |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Peso en disco y en memoria: 23,8 GB de repositorio; 22 GiB de pesos cargados, segun la medicion del autor en una DGX Spark.
- Memoria adicional: el lm_head en BF16 anade 1,7 GiB frente a la variante NVFP4 de NVIDIA. A esto hay que sumar la cache KV para la ventana configurada (131.072 tokens en el ejemplo), cuyo tamano depende del modelo base y del numero de secuencias concurrentes; no disponible en la informacion proporcionada.
- GPU recomendadas: hardware Blackwell, ya que NVFP4 es un formato nativo de esa generacion. El autor mide sobre DGX Spark (GB10). El uso de FP8 en la atencion requiere soporte de FP8 (Hopper o superior).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible. Las RTX de la serie 50 (Blackwell) serian las candidatas naturales por soporte de NVFP4, pero no hay mediciones publicadas en la ficha.
- Opciones de despliegue: vLLM (libreria declarada, probada con la version 0.30.0). No se documenta soporte de llama.cpp, Ollama, TGI ni formatos GGUF; NVFP4 no es un formato estandar de esos runners.
- Comando de ejemplo del autor: `vllm serve atakans/Qwen3.8-27B-NVFP4-BF16head --max-model-len 131072 --reasoning-parser qwen3`.
- Latencia y throughput medidos (DGX Spark, GB10, vLLM 0.30.0): 10,9 tok/s en decodificacion con una peticion y 2,97 s de TTFT con un prompt de 8k. No hay datos de rendimiento con batching concurrente ni en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Formato de pesos | Tamano | Ratio de perplejidad | Acuerdo top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| atakans/Qwen3.8-27B-NVFP4-BF16head | ~18,8B (safetensors) | NVFP4 + FP8 + BF16 (safetensors) | 22 GiB | 1,022 | 91,1% | apache-2.0 | HuggingFace, via vLLM |
| nvidia/Qwen3.8-27B-NVFP4 | no disponible | NVFP4 (safetensors) | 21 GiB | 1,029 | 88,7% | no disponible | HuggingFace |
| Qwen/Qwen3.8-27B-FP8 | no disponible | FP8 (safetensors) | 29 GiB | 1,002 | 96,5% | no disponible | HuggingFace |
| Qwen/Qwen3.8-27B (BF16) | no disponible | BF16 | no disponible | 1,000 (referencia, ppl 8,30) | 100% (referencia) | apache-2.0 (segun el modelo base de esta ficha) | HuggingFace |

Las tres variantes cuantizadas parten del mismo modelo base. La eleccion es un compromiso explicito: FP8 se acerca mas al BF16 en calidad pero ocupa mas; NVIDIA NVFP4 es el mas rapido y pequeno pero el mas alejado; este checkpoint se situa en medio, priorizando fidelidad sobre velocidad.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: hereda todos los sesgos y limitaciones del modelo base Qwen/Qwen3.8-27B, que no se documentan en esta ficha.
- Perdida de fidelidad medible: ratio de perplejidad de 1,022 (frente a 1,002 del FP8), KLD media de 0,0295 y KLD p99 de 0,309. El p99 es casi siete veces el del FP8, lo que indica degradacion en la cola de la distribucion.
- Acuerdo top-1 del 91,1%: aproximadamente uno de cada once tokens predichos difiere del modelo BF16. Relevante en tareas sensibles a la eleccion exacta de token.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Se recomienda validacion en dominios criticos.
- Idiomas soportados: no disponible. No se puede confirmar cobertura multilingue a partir de esta ficha.
- Licencia apache-2.0 declarada por el autor, pero conviene verificar la licencia del modelo base Qwen/Qwen3.8-27B antes de un uso comercial, ya que no se detalla en la informacion proporcionada.
- Dependencia de vLLM: la unica libreria declarada y probada es vLLM 0.30.0. No hay soporte documentado de llama.cpp, Ollama ni TGI, y el formato NVFP4 esta orientado a hardware Blackwell.
- Un solo punto de medida: todas las cifras de velocidad y calidad provienen del autor, con hardware, script y version de vLLM concretos. No hay replicacion independiente, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Fecha de creacion en el metadato (2026-10-14): tratar las cifras y versiones como correspondientes a ese contexto.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos trataban de logotipos con forma de mariposa y no guardan relacion con el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/atakans/Qwen3.8-27B-NVFP4-BF16head
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Alternativa FP8 de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Alternativa NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Receta de cuantizacion (`recipe.yaml`): incluida en el repositorio del modelo
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada

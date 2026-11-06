# PruningEverything/llama_2_30_percent_compression

## Resumen

`llama_2_30_percent_compression` es un modelo derivado de Llama 2 publicado por el usuario PruningEverything en Hugging Face. Segun el identificador y el nombre del repositorio, se trata de una version de Llama 2 sometida a un proceso de compresion del 30 por ciento, presumiblemente mediante poda (pruning) de pesos. El checkpoint contiene 4.713.074.688 parametros en formato safetensors, lo que sugiere que parte de un modelo base de aproximadamente 6.700 millones de parametros (el tamano de Llama 2 7B) y elimina en torno a un 30 por ciento de los parametros.

La model card publicada por el autor es practicamente vacia: unicamente declara la licencia llama2, sin informacion sobre arquitectura, datos de entrenamiento, metodologia de poda, capacidades o rendimiento. No se han publicado resultados de benchmarks ni documentacion tecnica adicional en la informacion disponible.

El interes de este checkpoint es fundamentalmente experimental: sirve como artefacto para estudiar los efectos de la poda estructurada o no estructurada sobre un modelo Llama 2, pero carece de la documentacion minima necesaria para un uso en produccion. Cualquier evaluacion rigurosa requiere validacion propia por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 2, segun tags del repo) |
| Parametros totales | 4.713.074.688 (dato real de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (presumiblemente 4.096 tokens si hereda la configuracion de Llama 2, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio se etiqueta como `llama`, por lo que la arquitectura subyacente es la de Llama 2: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, rotary positional embeddings (RoPE) y atencion multi-cabeza con cache KV. El numero de parametros (4.713 millones) es coherente con un Llama 2 7B al que se le ha aplicado una reduccion de aproximadamente el 30 por ciento de sus pesos, aunque no se especifica si la poda es estructurada (eliminacion de cabezas, neuronas o capas completas) o no estructurada (puesta a cero de pesos individuales).

No hay informacion disponible sobre el proceso de poda: no se indica el criterio de seleccion de pesos, si hubo un paso de recuperacion (fine-tuning o distillation) posterior, ni el dataset utilizado para ello. Tampoco se documenta el numero de tokens de entrenamiento original (Llama 2 7B se entreno con 2 billones de tokens segun su paper, pero este dato corresponde al modelo base, no al checkpoint podado). No se menciona RLHF, DPO ni ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto autoregresiva, heredada de la arquitectura Llama 2, sujeta a la degradacion esperable tras una poda del 30 por ciento.
- Razonamiento y conocimiento general: presumiblemente conserva parte de las capacidades del modelo base, pero sin evaluacion publicada no puede confirmarse el grado de degradacion.
- Generacion de codigo y matematicas: no disponible, sin benchmarks que lo respalden.
- Tool calling / function calling: no disponible; Llama 2 base no incorpora soporte nativo de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; Llama 2 esta optimizado principalmente para ingles, pero el autor no declara idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre poda de modelos: el checkpoint permite analizar empiricamente como afecta una reduccion del 30 por ciento de parametros a las capacidades de Llama 2, comparando con el modelo original en tareas controladas.
- Experimentos academicos de compresion: util como linea base en estudios que comparen poda estructurada frente a no estructurada, cuantizacion o destilacion.
- Pruebas de pipelines de evaluacion: sirve para validar herramientas de benchmark (lm-evaluation-harness, etc.) sobre checkpoints derivados antes de aplicarlas a modelos mayores.
- Despliegue en entornos con restricciones de memoria: al tener menos parametros que Llama 2 7B, puede caber en GPUs consumer con cuantizacion adicional, aunque la calidad no esta garantizada.
- Fine-tuning experimental: punto de partida para estudiar si un ajuste posterior recupera parte del rendimiento perdido tras la poda.
- Docencia y formacion: ejemplo practico de las limitaciones de los checkpoints sin model card completa y de la importancia de la evaluacion propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 9,4 GB solo para pesos (4.713 millones de parametros x 2 bytes), mas cache KV y overhead, lo que situa el requisito practico en torno a 11-12 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4,7 GB para pesos, con requisito practico cercano a 6-7 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2,4 GB para pesos, con requisito practico cercano a 4 GB, aunque el autor no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: una RTX 4090 (24 GB) o A100 40 GB permiten inferencia en FP16 sin problemas; una RTX 3090 o 4080 (16-24 GB) tambien es suficiente. Para GPUs de 8 GB seria necesario cuantizar.
- Despliegue: al publicarse solo safetensors, las opciones naturales son transformers, vLLM o TGI. Para llama.cpp u Ollama habria que convertir y cuantizar manualmente los pesos.
- Latencia y throughput: no disponibles; dependen del hardware y del backend, y no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `PruningEverything/llama_2_30_percent_compression` | 4.713 M | no disponible | llama2 | Hugging Face, safetensors |
| Llama 2 7B (Meta) | 6.738 M | 4.096 tokens | llama2 | Hugging Face, safetensors y GGUF |
| Llama 2 13B (Meta) | 13.015 M | 4.096 tokens | llama2 | Hugging Face, safetensors y GGUF |
| Mistral 7B (Mistral AI) | 7.242 M | 8.192 tokens | Apache 2.0 | Hugging Face, safetensors y GGUF |

La comparativa de rendimiento no esta disponible: el checkpoint podado no publica evaluaciones, por lo que no puede contrastarse su calidad frente a Llama 2 7B, Llama 2 13B o Mistral 7B. La diferencia principal frente a estos es la ausencia de documentacion y de versiones cuantizadas listas para usar.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre el metodo de poda, el dataset de recuperacion ni las capacidades reales del modelo.
- Riesgo elevado de degradacion: una poda del 30 por ciento sin fine-tuning de recuperacion suele producir perdida notable de coherencia, conocimiento y capacidad de razonamiento; no hay evaluacion que lo cuantifique.
- Riesgo de alucinacion: presumiblemente mayor que en el modelo base, aunque no esta medido.
- Sesgos: hereda los sesgos de Llama 2, que no han sido documentados ni mitigados en este checkpoint.
- Idiomas: no se declaran; Llama 2 esta orientado al ingles y no hay garantia de comportamiento en castellano u otros idiomas.
- Licencia: la Llama 2 Community License impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales para no requerir licencia adicional de Meta) y obligaciones de atribucion; debe revisarse antes de cualquier despliegue.
- Sin versiones GGUF ni cuantizadas: requiere conversion manual para llama.cpp u Ollama.
- Sin garantias de produccion: al no existir benchmarks ni pruebas publicadas, no es recomendable para sistemas en produccion sin una evaluacion exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/PruningEverything/llama_2_30_percent_compression
- Paper de Llama 2 (Meta): https://arxiv.org/abs/2307.09288
- Licencia Llama 2: https://ai.meta.com/llama/license/

# francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed455

## Resumen

El modelo `hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed455` es un ajuste fino supervisado (SFT) del checkpoint `goldfish-models/hin_deva_10mb`, un modelo monolingüe de la familia Goldfish orientado al hindi en escritura devanagari y entrenado sobre un corpus de 10 MB. El ajuste lo ha realizado el usuario `francesca9805` (F. Padovani, University of Groningen, según la traza de Weights & Biases incluida en la model card) utilizando la librería TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121.

Se trata de un modelo muy pequeno: 39.087.104 parámetros (aproximadamente 39 M), empaquetado en safetensors dentro de un repositorio de 0,1 GB. La etiqueta `gpt2` en HuggingFace indica que la arquitectura subyacente es la de la familia GPT-2 (transformer decoder-only con atención causal), lo que implica un modelo de propósito general para generación de texto sin mecanismos modernos como MoE, atención lineal o decodificación especulativa.

Su relevancia es fundamentalmente experimental: forma parte de una serie de réplicas con distintas semillas (`seed455`, `seed10`, etc.) y distintos volúmenes de datos empaquetados, pensadas para estudiar el efecto del empaquetado de secuencias y del ajuste fino SFT en modelos multilingües de bajos recursos. No es un modelo destinado a producción, sino a investigación sobre entrenamiento eficiente y currículos de datos en lenguas con pocos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (según etiqueta `gpt2` del repositorio) |
| Parametros totales | 39.087.104 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la arquitectura GPT-2 suele operar con 1024 tokens) |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible oficialmente; el identificador `hin-deva` apunta a hindi en escritura devanagari |
| Licencia | no disponible (la model card incluye el marcador generico `licence: license`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer decoder-only de tipo GPT-2, es decir, un modelo autorregresivo con atención causal completa y sin innovaciones arquitectónicas adicionales (no hay mezcla de expertos, ni capas de estado recurrente, ni atención lineal). Con 39 M de parámetros, se sitúa claramente por debajo de GPT-2 small (124 M), lo que sugiere una configuración reducida en número de capas y/o dimensión oculta respecto al modelo original. No se dispone de la ficha técnica de configuración (número de capas, cabezas, dimensión del embedding) ni del tamaño del vocabulario en la información proporcionada.

El entrenamiento consiste en un ajuste fino supervisado (SFT) mediante TRL sobre el modelo base `goldfish-models/hin_deva_10mb`. El nombre del checkpoint indica un pipeline de datos con empaquetado de secuencias (`packed`), un corpus de aproximadamente 100 MB (`Dp-100mb`) y precisión bf16 (`bfdiso`), aunque no se detalla la composición exacta del dataset, el número de tokens vistos ni si se aplicaron etapas posteriores de RLHF o DPO: la model card únicamente declara SFT. La ejecución de entrenamiento está registrada en Weights & Biases bajo el proyecto `new-tokenizers`, lo que sugiere que el trabajo forma parte de un estudio más amplio sobre tokenizadores y presupuestos de datos para lenguas de bajos recursos.

## Capacidades

- Generacion de texto autorregresiva en el dominio del corpus de ajuste fino, presumiblemente hindi en devanagari.
- Conversacion de un solo turno en formato de chat: el ejemplo de la model card usa `pipeline("text-generation", ...)` con una lista de mensajes con rol `user`, lo que indica plantilla conversacional.
- Continuacion y finalizacion de texto a partir de un prompt, con `max_new_tokens` configurable.
- Capacidad multilingue: no disponible; el alcance linguistico declarado es, como maximo, el del modelo base (hindi/devangari).
- Tool calling o function calling: no disponible; no se declara soporte.
- Uso como agente o razonamiento multi-paso: no disponible; no se declara soporte.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible; no se declara ningun tipo de modalidad adicional.
- Capacidad de ajuste posterior: al ser un modelo pequeno basado en GPT-2, es viable afinar-lo de nuevo en GPUs de gama baja o incluso en CPU para tareas muy acotadas.

## Casos de uso

- Investigacion sobre presupuestos de datos en lenguas de bajos recursos: el checkpoint forma parte de una serie con distintas semillas y tamanos de datos empaquetados (`10mb`, `100mb`), por lo que sirve para comparar el efecto del volumen de corpus y del empaquetado de secuencias en la calidad final del modelo.
- Estudios de tokenizacion para hindi: la traza de W&B pertenece al proyecto `new-tokenizers`, de modo que este modelo es util como punto de comparacion al evaluar distintos vocabularios o esquemas de segmentacion en devanagari.
- Reproducibilidad de experimentos de SFT con TRL: al declarar las versiones exactas de TRL, Transformers, PyTorch, Datasets y Tokenizers, permite replicar el pipeline de ajuste supervisado en un entorno controlado.
- Generacion de texto sintetico en hindi para aumento de datos: con 39 M de parametros puede producir continuaciones cortas que, filtradas adecuadamente, sirven para preentrenar o aumentar otros modelos mayores en la misma lengua.
- Pruebas de despliegue en entornos con recursos minimos: dado su tamano, es adecuado para validar pipelines de inferencia (TGI, vLLM, endpoints compatibles) antes de escalar a modelos grandes, sin consumir GPU practicamente.
- Docencia y practicas de ajuste fino: es un candidato idoneo para que estudiantes ejecuten un ciclo completo de SFT, evaluacion y publicacion en HuggingFace en una unica GPU o en CPU.
- Analisis de sesgos y alucinacion en modelos pequenos: sirve como caso base para medir como un modelo de 39 M entrenado con 100 MB de datos falla, repite o inventa contenido en hindi, y compararlo con modelos multilingues de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y el repositorio de HuggingFace no aporta resultados de evaluacion adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cualquier precision. En fp32 el peso ocupa aproximadamente 156 MB; en bf16/fp16, unos 78 MB; en cuantizacion int8, alrededor de 39 MB; en int4, cerca de 20 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente. No se requiere A100, H100 ni RTX 4090; una GTX 1050, una T4 o una iGPU moderna son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente todas, incluidas las integradas y las de portatiles con poca memoria.
- Ejecucion en CPU: viable sin problemas, incluso en dispositivos de placa unica tipo Raspberry Pi.
- Opciones de despliegue: Transformers con `pipeline` (metodo documentado por el autor), Text Generation Inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM, y servicios gestionados como FriendliAI, que ya lista el checkpoint. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que no se publican ficheros GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones, aunque por el tamano del modelo cabe esperar latencias muy bajas en GPU y perfectamente utilizables en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed455` | 39.087.104 | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes | Ajuste SFT sobre el modelo base Goldfish |
| `goldfish-models/hin_deva_10mb` | no disponible | no disponible | no disponible | HuggingFace | Modelo base del anterior; monolingue hindi/devangari con 10 MB de datos |
| Otros checkpoints de la misma serie (`seed10`, `seed455`, variantes `10mb` y `100mb`) | no disponible | no disponible | no disponible | HuggingFace y FriendliAI | Replicas con distintas semillas y volumenes de datos empaquetados |
| GPT-2 small | 124 M | 1024 tokens | MIT (segun la publicacion original) | Amplia en HuggingFace | Alternativa de referencia en la misma familia arquitectonica, tres veces mayor |

No se dispone de datos de rendimiento comparativo entre estas alternativas, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se ha publicado ningun analisis de sesgos ni de representatividad del corpus de entrenamiento.
- Riesgo de alucinacion: elevado. Con 39 M de parametros y un corpus de ajuste de aproximadamente 100 MB, la capacidad de mantener coherencia factual es muy limitada y es probable la generacion de texto repetitivo o sin sentido.
- Limitaciones de contexto: el nombre del modelo y la etiqueta `gpt2` apuntan a una ventana de contexto corta (habitualmente 1024 tokens en esta familia), pero no se confirma en la informacion disponible.
- Limitaciones de idioma: el modelo esta orientado al hindi en devanagari; no hay evidencia de competencia en castellano ni en otras lenguas.
- Licencia: no disponible. La model card usa el marcador generico `licence: license`, por lo que no se puede confirmar si el uso comercial esta permitido. Se recomienda contactar con el autor antes de cualquier uso productivo.
- Advertencia para produccion: no es un modelo apto para produccion. Es un artefacto de investigacion con 0 descargas y 0 likes, sin evaluacion publicada y sin garantias de calidad, seguridad ni soporte.
- Trazabilidad: no se documentan la composicion del dataset, el numero de tokens de entrenamiento ni los hiperparametros, lo que dificulta la auditoria del modelo.
- Compatibilidad: aunque las etiquetas incluyen `text-generation-inference` y `endpoints_compatible`, no hay evidencia de que se haya validado el despliegue en dichos entornos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/goldfish-models/hin_deva_10mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/wz3wdqu1
- Repositorio de TRL: https://github.com/huggingface/trl
- Checkpoint hermano (`bfd_seed455`): https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Checkpoint hermano (`bfd_seed10`): https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Checkpoint hermano en FriendliAI (`10mb`): https://friendli.ai/models/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed455
- Checkpoint relacionado en FriendliAI (`fpadovani`): https://friendli.ai/models/fpadovani/hin-deva-10mb-ppt-Dp-100mb_seed455
- Registro en free2aitools: https://free2aitools.com/model/francesca9805/hin-deva-10mb-ppt-dp-100mb-packed-bfd_seed455

# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-sunnyfoal-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-4k-grpo-sunnyfoal-s300` es un ajuste fino por aprendizaje por refuerzo (GRPO) sobre Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Su objetivo es internalizar un presupuesto fijo de generacion de 4.096 tokens para razonamiento matematico, de forma que el modelo aprenda a resolver problemas dentro de ese limite en lugar de depender del escalado en tiempo de inferencia (test-time scaling). Se publica junto al articulo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

Se trata de un modelo multimodal (pipeline `image-text-to-text`) de 4.539.265.536 parametros en BF16, derivado del modelo base Qwen3.5-4B, con licencia Apache 2.0. El checkpoint liberado corresponde al paso 300 del run interno denominado `sunnyfoal`. El repositorio ocupa 9,1 GB y los pesos se distribuyen en formato safetensors para la libreria transformers.

La relevancia actual reside en la linea de investigacion de RLVR (Reinforcement Learning with Verifiable Rewards) aplicada al control del coste de razonamiento: en lugar de optimizar unicamente la precision, se entrena al modelo para que produzca respuestas correctas dentro de un presupuesto de tokens fijo, lo que reduce la latencia y el coste por consulta en despliegues de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generacion entrenado: 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de 4.539 millones de parametros, y se ajusta mediante GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Las respuestas que alcanzan el presupuesto de 4.096 tokens (`max_new_tokens`) se truncan y se puntuan tal cual, lo que penaliza implicitamente las cadenas de razonamiento que agotan el limite sin producir respuesta.

Los datos de entrenamiento son el DeepScaleR-Preview-Dataset (matematicas), con un maximo de 3 epocas. La configuracion de entrenamiento usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de calentamiento, durante 300 pasos. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`. Los pesos se publican en BF16. El prompt de entrenamiento (turno de usuario, con la plantilla de chat del modelo base) instruye a razonar paso a paso y emitir la respuesta dentro de `\boxed{}`.

La innovacion principal es la internalizacion del presupuesto: el modelo aprende a ajustar la longitud de su razonamiento para encajar en 4.096 tokens, en lugar de requerir un control externo del presupuesto en inferencia.

## Capacidades

- Razonamiento matematico paso a paso con respuesta final en formato `\boxed{}`.
- Generacion de texto conversacional (plantilla de chat del modelo base).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), heredado del modelo base.
- Razonamiento bajo presupuesto fijo de 4.096 tokens de generacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso mas alla del razonamiento interno: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking explicito, vision o audio: solo se confirma la entrada image-text; el resto no disponible.

## Casos de uso

- Resolucion de problemas matematicos en produccion: el modelo genera cadenas de razonamiento acotadas a 4.096 tokens, lo que permite estimar coste y latencia por consulta de forma determinista.
- Tutoria educativa automatizada: puede explicar paso a paso la resolucion de ejercicios y devolver la respuesta en un formato parseable (`\boxed{}`) para validacion automatica.
- Evaluacion de modelos de razonamiento: sirve como referencia para estudiar el compromiso entre precision dentro de presupuesto y escalado en tiempo de inferencia.
- Generacion de datos sinteticos de matematicas: las soluciones con respuesta extraible son utiles para construir datasets de entrenamiento o evaluacion.
- Pipelines de correccion automatica: la extraccion de la respuesta en `\boxed{}` facilita la comparacion con la solucion de referencia en sistemas de grading.
- Investigacion en RLVR: punto de partida reproducible para experimentos sobre internalizacion de presupuesto con GRPO y recompensas verificables.
- Procesamiento de enunciados con imagen (por ejemplo, fotografias de problemas escritos), aprovechando el pipeline image-text-to-text del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda al menos 12-16 GB.
- Cuantizacion: los pesos publicados estan en BF16; no se documentan versiones GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 o H100 para despliegues con concurrencia; RTX 4090 (24 GB) suficiente para inferencia en BF16 de una sola instancia.
- GPU de consumo: cabe en GPUs con 16 GB o mas en BF16; en GPUs de 8-12 GB seria necesario cuantizar, opcion no documentada.
- Opciones de despliegue: transformers de forma nativa; vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles; el presupuesto fijo de 4.096 tokens acota el coste maximo por respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-4k-grpo-sunnyfoal-s300 | 4.539 M | no disponible (presupuesto de generacion 4.096) | GRPO con presupuesto fijo sobre Qwen3.5-4B | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | 4.539 M (heredado) | no disponible | Modelo base multimodal sin ajuste RL especifico | Apache 2.0 (heredada) | Hugging Face |
| Alternativas RLVR de razonamiento matematico de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de matematicas (DeepScaleR); el rendimiento en otras tareas puede degradarse respecto al modelo base.
- El truncamiento a 4.096 tokens puede producir respuestas incompletas en problemas que requieran cadenas de razonamiento mas largas.
- Riesgo de alucinacion en la cadena de razonamiento: la recompensa binaria solo valida la respuesta final, no la correccion de los pasos intermedios.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; el prompt de entrenamiento esta en ingles.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.5-4B; conviene revisar su model card.
- Checkpoint unico (paso 300): no se documentan curvas de validacion ni comparacion con otros pasos del run.
- La model card incluye una seccion de cita marcada como TODO; no hay publicacion formal enlazada.
- Descargas y likes nulos en el momento de la consulta: ecosistema de uso muy limitado, sin validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-sunnyfoal-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Articulo referenciado: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (sin enlace disponible)
- Repositorio u organizacion: https://huggingface.co/JetBrains-Research

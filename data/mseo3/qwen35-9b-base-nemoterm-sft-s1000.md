# mseo3/qwen35-9b-base-nemoterm-sft-s1000

## Resumen

qwen35-9b-base-nemoterm-sft-s1000 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario mseo3 en Hugging Face. Se trata de un checkpoint intermedio: concretamente el paso 1000 de un entrenamiento planificado a 10 epocas (28.580 pasos), entrenado sobre el corpus nvidia/Nemotron-Terminal-Corpus, un conjunto de datos orientado a tareas de terminal y entornos de línea de comandos. El modelo cuenta con 9.409.813.744 parametros totales y un repositorio de 18,8 GB en formato safetensors.

La relevancia de esta publicacion es doble. Por un lado, demuestra un flujo de trabajo reproducible de SFT a gran escala sobre la arquitectura Qwen3.5, con receta detallada (verl sft_trainer_ray, FSDP en 4x H200, FlashAttention-3, Liger kernels). Por otro, al ser un checkpoint temprano (paso 1000 de 28.580), no debe considerarse un modelo final pulido, sino un artefacto de investigacion util para estudiar la evolucion del entrenamiento o como punto de partida para ajustes posteriores.

La informacion disponible sobre el modelo es limitada: la model card se centra en la receta de entrenamiento y no documenta capacidades, idiomas ni resultados de evaluacion. Todo lo que se indica a continuacion proviene de los metadatos de Hugging Face y del README del autor; los datos no presentes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas de atencion completa y 24 capas Gated DeltaNet (derivada de Qwen3.5); incluye cabeza MTP en el modelo base, excluida en este checkpoint |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16, con 48 tensores en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, con tensores F32 para linear_attn.A_log y linear_attn.norm.weight) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B-Base, que combina capas de atencion completa (entrenadas aqui con FlashAttention-3) con 24 capas Gated DeltaNet, un mecanismo de atencion lineal recurrente. El checkpoint conserva en F32 los 48 tensores que el modelo base tambien almacena en F32 (linear_attn.A_log y linear_attn.norm.weight de las capas Gated DeltaNet), mientras que el resto de pesos se fusionaron desde los shards FSDP en fp32 a bf16. La cabeza MTP (multi-token prediction) no esta incluida: text_config.mtp_num_hidden_layers = 0. El config no fija attn_implementation, aunque el entrenamiento uso flash_attention_3.

El entrenamiento es un SFT completo sobre mseo3/nemotron-terminal-sft-qwen35-le64k, un dataset construido a partir de nvidia/Nemotron-Terminal-Corpus (CC-BY-4.0) con 365.856 filas multiturno, 6.450 millones de tokens y secuencias de hasta 65.536 tokens, manteniendo el razonamiento (thinking) en cada turno del asistente. La receta usa verl sft_trainer_ray (mopdRL nemoterm-q35), 10 epocas planificadas (28.580 pasos), batch 128, learning rate 2e-5 con coseno (ratio minimo 0,1), warmup de 100 pasos, weight decay 0,01, gradient clipping 1,0, batch dinamico de 65.536 tokens por GPU, 4x H200 con FSDP (DP4), gradient checkpointing, kernels Liger RMSNorm/SwiGLU, FlashAttention-3 y linear-CE fusionada en Triton de verl. El checkpoint publicado corresponde al paso 1000 de ese plan.

## Capacidades

- Generacion de texto y razonamiento: al derivar de Qwen3.5-9B-Base y entrenarse con el pensamiento preservado en cada turno, conserva capacidad de razonamiento en formato thinking, aunque no hay evaluacion publicada que lo cuantifique.
- Tareas de terminal y linea de comandos: el entrenamiento sobre Nemotron-Terminal-Corpus esta orientado a interacciones multiturno con entornos de terminal (ejecucion de comandos, interpretacion de salidas, correccion de errores).
- Contexto largo: ventana de hasta 65.536 tokens, adecuada para sesiones de terminal con historiales extensos o volcados de logs.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: plausible por el formato multiturno del corpus y el pensamiento preservado, pero no verificado ni documentado por el autor.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta informado).
- Capacidades especiales (vision, audio): no disponibles; el modelo es de texto.

## Casos de uso

- Agentes de terminal automatizados: el modelo puede integrarse en un bucle de agente que reciba el estado de una shell, proponga comandos, interprete la salida y corrija errores en turnos sucesivos, aprovechando el entrenamiento especifico sobre Nemotron-Terminal-Corpus y la ventana de 65.536 tokens para mantener el historial completo de la sesion.
- Asistencia a administradores de sistemas: dado un volcado de logs o la salida de comandos de diagnostico, el modelo puede razonar sobre la causa de un fallo y proponer comandos de remediacion, con el contexto largo necesario para incluir trazas extensas.
- Generacion de scripts de automatizacion: a partir de una descripcion en lenguaje natural del flujo de trabajo deseado, producir scripts de shell o comandos encadenados, un escenario alineado con el corpus de entrenamiento.
- Investigacion sobre SFT y dinamica de entrenamiento: al ser un checkpoint intermedio (paso 1000 de 28.580), es util para estudiar como evolucionan las capacidades de terminal a lo largo del entrenamiento comparandolo con checkpoints posteriores o con el modelo base.
- Punto de partida para ajustes especializados: su licencia Apache 2.0 y su formato safetensors permiten continuar el entrenamiento con datos propios de dominios de infraestructura (Kubernetes, CI/CD, cloud) sin restricciones de uso comercial.
- Evaluacion de pipelines de entrenamiento distribuido: la receta documentada (verl, FSDP, FlashAttention-3, Liger) sirve como referencia reproducible para equipos que quieran replicar SFT a gran escala sobre arquitecturas Qwen3.5.
- Educacion y demostraciones de agentes de codigo: en entornos controlados, puede usarse para mostrar como un modelo razona paso a paso antes de emitir comandos, dado que el formato de pensamiento se conserva en el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 9.409.813.744 parametros ocupan aproximadamente 18,8 GB solo en pesos, por lo que se necesitan alrededor de 20-24 GB de VRAM contando cache KV y overhead; en cuantizacion de 8 bits, unos 10-12 GB; en 4 bits, unos 6-8 GB (estimaciones a partir del tamano de parametros, no verificadas por el autor).
- GPU recomendadas: para bf16 sin cuantizar, A100 40/80 GB, H100 80 GB o L40S 48 GB; el entrenamiento se realizo en 4x H200 con FSDP.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 ajustado o en cuantizaciones de 8/4 bits; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con cuantizacion de 4 bits y contexto reducido.
- Opciones de despliegue: vLLM y TGI para servicio en GPU; llama.cpp u Ollama para cuantizaciones GGUF en hardware modesto (la conversion a GGUF no esta publicada por el autor y requeriria realizarla); el soporte de las capas Gated DeltaNet en cada runtime debe verificarse antes de desplegar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-9b-base-nemoterm-sft-s1000 | 9.409.813.744 | 65.536 | SFT en tareas de terminal (checkpoint paso 1000) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-9B-Base | 9B (clase) | no disponible en la informacion | Modelo base generalista | no disponible en la informacion | Hugging Face |
| Alternativas de ~9B orientadas a agentes de codigo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 1000 de un plan de 28.580 pasos (10 epocas), por lo que su calidad final es incierta y probablemente inferior a la de un modelo completamente entrenado.
- Sin evaluacion publicada: no hay benchmarks, evaluaciones de calidad ni pruebas de regresion documentadas; no debe asumirse un rendimiento concreto en produccion.
- Sesgos: no documentados por el autor; al entrenarse sobre un corpus especifico de terminal, puede mostrar sesgos hacia los patrones, herramientas y entornos presentes en Nemotron-Terminal-Corpus.
- Riesgo de alucinacion: alto en comandos y rutas de sistema, especialmente en un checkpoint temprano; cualquier comando generado debe validarse antes de ejecutarse, ya que un agente de terminal puede causar danos reales.
- Limitaciones de idioma: el campo de idiomas no esta informado; el corpus de entrenamiento esta en ingles (Nemotron-Terminal-Corpus), por lo que el rendimiento en castellano es desconocido.
- Contexto: la ventana de 65.536 tokens es la longitud de entrenamiento; no hay garantia de comportamiento estable mas alla de esa longitud.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-9B-Base (no confirmada en la informacion) y la atribucion del corpus CC-BY-4.0.
- Compatibilidad de despliegue: las capas Gated DeltaNet y la ausencia de attn_implementation en el config pueden requerir versiones recientes de los runtimes de inferencia; la cabeza MTP no esta incluida, lo que descarta decodificacion especulativa basada en ella.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mseo3/qwen35-9b-base-nemoterm-sft-s1000
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Overlay de tokenizer/plantilla: https://huggingface.co/mseo3/qwen35-9b-base-opd-overlay
- Dataset de SFT: https://huggingface.co/datasets/mseo3/nemotron-terminal-sft-qwen35-le64k
- Corpus de origen: https://huggingface.co/datasets/nvidia/Nemotron-Terminal-Corpus
- Repositorio verl (framework de entrenamiento): https://github.com/volcengine/verl
- Paper, blog o demo oficial: no disponibles en la informacion proporcionada.

# francesca9805/nld-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455

## Resumen

El modelo `francesca9805/nld-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455` es un ajuste fino por supervisión (SFT) del modelo base `goldfish-models/nld_latn_10mb`, publicado por el usuario francesca9805. Se trata de un transformer decoder-only de arquitectura GPT-2 con 39.087.104 parámetros (~39 M), almacenado en safetensors y con un tamaño de repositorio de 0,1 GB. El identificador del modelo sugiere un ámbito neerlandés (`nld_latn`), pero la model card no declara idiomas soportados.

El modelo se ha entrenado con la librería TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1, según el registro de entrenamiento publicado en Weights & Biases. La model card es un artefacto autogenerado por TRL: no incluye descripción de la arquitectura, composición del dataset, número de tokens, hiperparámetros ni evaluación.

Su relevancia es acotada y experimental: se enmarca en el ecosistema goldfish-models de modelos monolingües de bajo coste, orientado a investigación en lenguas con pocos recursos. No es un modelo apto para producción: no tiene benchmarks publicados, no declara licencia utilizable y registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia GPT-2 (etiqueta `gpt2`) |
| Parametros totales | 39.087.104 (~39 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible en la model card; el identificador `nld_latn` apunta a neerlandes en escritura latina |
| Licencia | No disponible (la model card contiene el marcador sin resolver `licence: license`) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/nld_latn_10mb |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta `gpt2` del repositorio y el pipeline declarado (`text-generation`) situan al modelo en la familia de transformers decoder-only con atencion causal, normalizacion pre-LayerNorm y embeddings posicionales aprendidos, el diseno clasico de GPT-2. Con 39 M de parametros, el modelo se situa muy por debajo incluso de GPT-2 small (124 M), lo que condiciona su capacidad de modelado del lenguaje. No se documenta ni la dimension oculta, ni el numero de capas, ni el numero de cabezas de atencion, ni la longitud de contexto efectiva.

El entrenamiento consiste en un ajuste fino supervisado (SFT) ejecutado con TRL sobre el modelo base `goldfish-models/nld_latn_10mb`. No se especifican el dataset de instrucciones, el numero de ejemplos, el numero de tokens vistos, la composicion de los datos ni si se aplicaron fases posteriores de RLHF o DPO. El sufijo del nombre (`Dp-100mb-packed-bfd_seed455`) sugiere una configuracion experimental con 100 MB de datos empaquetados y una semilla concreta (455), pero esto es una inferencia a partir del nombre y no esta confirmado en la documentacion. El unico punto de trazabilidad disponible es la ejecucion de Weights & Biases enlazada desde la model card, dentro del proyecto `f-padovani-university-of-groningen/new-tokenizers`.

El ejemplo de uso de la model card emplea la API de `pipeline` con una lista de mensajes con roles (`{"role": "user", "content": ...}`), lo que indica que el ajuste SFT se realizo sobre un formato conversacional con plantilla de chat, aunque dicha plantilla no se documenta de forma explicita.

## Capacidades

- Generacion de texto autoregresiva en el formato de chat empleado durante el SFT (mensajes con rol de usuario).
- Continuacion y generacion libre de texto, presumiblemente en neerlandes segun el identificador del modelo.
- Extraccion de representaciones internas (hidden states) mediante Transformers, aprovechable como extractor de caracteristicas ligero para tareas posteriores.
- Ajuste fino adicional viable en hardware muy modesto, dado su tamano de 39 M de parametros.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponibles.

## Casos de uso

- Investigacion en modelado de lenguas con pocos recursos: el modelo sirve como punto de partida reproducible para estudiar el efecto del ajuste SFT sobre un modelo base monolingue de 39 M de parametros, comparando configuraciones de datos y semillas.
- Ablaciones de datos y tokenizadores: por su tamano, permite entrenar y evaluar decenas de variantes en una sola GPU de gama media o incluso en CPU, algo inviable con modelos de miles de millones de parametros.
- Docencia y practicas de ajuste fino: es adecuado para que estudiantes ejecuten el ciclo completo (carga con Transformers, SFT con TRL, evaluacion de perplejidad) en un portatil sin GPU dedicada.
- Generacion de texto de baja latencia en el borde: al ocupar decenas de megabytes, puede desplegarse en dispositivos con recursos limitados para tareas de autocompletado o generacion de plantillas en neerlandes, siempre con revision humana.
- Generacion de datos sinteticos para aumentar corpus neerlandeses: util como generador de borradores ruidosos que despues se filtran con un modelo mayor o con heurísticas de calidad.
- Prototipado rapido de interfaces conversacionales: sirve para validar plantillas de prompt, formato de mensajes y flujos de chat antes de invertir en un modelo mayor.
- Baseline en canalizaciones de evaluacion: puede integrarse como referencia de baja cota en comparativas de perplejidad o de calidad de generacion frente a modelos neerlandeses de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y los resultados de busqueda web consultados no contienen informacion tecnica sobre este modelo.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 156 MB solo para pesos (39,1 M x 4 bytes), mas activaciones y cache KV, muy por debajo de 1 GB.
- VRAM estimada en fp16/bf16: aproximadamente 78 MB de pesos.
- VRAM estimada en int8: aproximadamente 39 MB; en cuantizacion de 4 bits, alrededor de 20 MB, aunque no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100. El modelo no aprovecha aceleradores de gama alta; el cuello de botella sera el lanzamiento de kernels, no el computo.
- Inferencia en CPU: totalmente viable, incluido hardware tipo Raspberry Pi o portatiles sin GPU.
- Opciones de despliegue: `transformers.pipeline` de forma nativa; el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`, por lo que TGI y los Inference Endpoints de Hugging Face son compatibles; vLLM es tecnicamente posible al ser un transformer decoder-only estandar. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se proporciona.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/nld-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455 | 39,09 M | No disponible | Sin benchmarks publicados | No disponible | safetensors en Hugging Face |
| goldfish-models/nld_latn_10mb (modelo base) | No disponible en esta ficha | No disponible | Sin benchmarks consultados | No disponible | safetensors en Hugging Face |
| GroNLP/gpt2-small-dutch | ~124 M (GPT-2 small) | No disponible en esta ficha | No disponible en esta ficha | No verificada | Pesos publicados en Hugging Face |
| Variantes del proyecto goldfish con mas datos de entrenamiento (por ejemplo, configuraciones de 100 MB) | No disponible | No disponible | No disponible | No disponible | Dentro de la organizacion goldfish-models |

La comparacion cuantitativa no es posible con la informacion disponible: no hay resultados de evaluacion de ninguno de los modelos citados en las fuentes consultadas.

## Limitaciones y advertencias

- Capacidad limitada por tamano: con 39 M de parametros, la coherencia en generaciones largas, el seguimiento de instrucciones complejas y el razonamiento son muy reducidos en comparacion con modelos de cientos de millones o miles de millones de parametros.
- Riesgo elevado de alucinacion y de texto gramaticalmente plausible pero factualmente incorrecto o incoherente. No debe usarse como fuente de informacion sin verificacion externa.
- Ausencia total de evaluacion: no hay benchmarks, ni analisis de sesgos, ni evaluacion de seguridad publicados.
- Licencia sin determinar: la model card contiene `licence: license` como marcador sin resolver y el campo de licencia del repositorio aparece como no disponible. Sin una licencia explicita, no hay autorizacion clara para uso comercial; conviene tratar el modelo como no apto para produccion hasta contactar con el autor.
- Idiomas no declarados: aunque el identificador apunta al neerlandes, no se documenta el alcance linguistico real ni la variedad dialectal cubierta.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas.
- Procedencia del ajuste SFT no documentada: se desconoce la composicion del dataset de instrucciones, lo que impide auditar sesgos y calidad.
- Trazabilidad minima: 0 descargas y 0 likes, sin validacion por parte de la comunidad, y sin model card descriptiva mas alla de la plantilla autogenerada por TRL.
- Sin cuantizaciones oficiales: no hay GGUF ni AWQ/GPTQ publicados, por lo que el despliegue en llama.cpp u Ollama exige trabajo adicional de conversion y validacion.
- No soporta tool calling ni flujos de agente; cualquier integracion de ese tipo requeriria construir el andamiaje completo de forma externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/nld-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_10mb
- Organizacion goldfish-models: https://huggingface.co/goldfish-models
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ebcf1cfd
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Documentacion de text-generation-inference: https://github.com/huggingface/text-generation-inference
- No se han encontrado papers, blogs ni demos adicionales especificos de este modelo en la busqueda web realizada.

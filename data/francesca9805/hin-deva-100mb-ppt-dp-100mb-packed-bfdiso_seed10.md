# francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfdiso_seed10

## Resumen

El modelo `francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfdiso_seed10` es un ajuste fino supervisado (SFT) del modelo monolingüe hindi en escritura devanagari `goldfish-models/hin_deva_100mb`. Lo publica el usuario `francesca9805`, vinculado a una ejecución de Weights & Biases de la Universidad de Groningen, y está pensado como un experimento académico de adaptación de un modelo de lenguaje pequeño a un dominio o formato de datos concreto (la nomenclatura sugiere datos "packed" y un tokenizador propio, dado el fichero `added_tokens.json`). Con 124.770.816 parámetros (aproximadamente 125 M), es un modelo de escala reducida orientado a investigación y generación de texto en hindi.

La relevancia de esta ficha es acotada: no se trata de un modelo de propósito general ni de un lanzamiento de producto, sino de un checkpoint derivado de un modelo base de la familia Goldfish, que entrena modelos monolingües para cientos de idiomas. Esto lo hace útil como caso de estudio de ajuste fino con TRL sobre idiomas de bajos recursos y como base para experimentos reproducibles con semillas fijas (`seed10`), no como alternativa a modelos multilingües grandes.

No hay información publicada sobre el dataset exacto de ajuste, la licencia efectiva ni el idioma/s de salida más allá de lo que sugiere el nombre (`hin_deva` = hindi, devanagari). En el momento de redactar esta ficha, el repositorio acumula 0 descargas y 0 "likes", por lo que su validación por parte de la comunidad es nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en los metadatos de HuggingFace) |
| Parametros totales | 124.770.816 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base de la familia Goldfish sigue la arquitectura GPT-2, habitualmente 1024 tokens, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | hindi en escritura devanagari (deducido del identificador `hin_deva` y del modelo base); no confirmado en la model card |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido real) |
| Formato de pesos | safetensors (repo de 0,3 GB, incluye `added_tokens.json` y tokenizador propio) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de tipo GPT-2 con normalizacion previa a la atención, embeddings posicionales aprendidos y aproximadamente 125 M de parámetros. No se documenta ninguna modificación estructural, ni atención lineal, ni decodificación especulativa. El ajuste se realizó con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1, mediante entrenamiento supervisado (SFT) y con una semilla fija (`seed10`), lo que apunta a un diseño experimental reproducible más que a un fine-tuning orientado a producto.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se aplicaron fases posteriores de RLHF o DPO. La presencia de `added_tokens.json` indica que se modificó o amplió el vocabulario del tokenizador original de Goldfish, pero se desconoce el alcance de ese cambio. El nombre del repositorio (`ppt-Dp-100mb-packed`) sugiere un conjunto de datos empaquetado de 100 MB, aunque esto es una inferencia a partir del identificador y no un dato confirmado.

## Capacidades

- Generacion de texto autoregresiva en hindi (devanagari), condicionada por prompts en formato de conversacion con roles `user` / `assistant`, segun el ejemplo de uso de la model card.
- Formato de chat implicito: la model card muestra la inferencia pasando una lista de mensajes con rol, lo que indica que el ajuste incluyo una plantilla conversacional, aunque no se documenta cual.
- Razonamiento y conocimiento factual: limitados por el tamano del modelo (125 M de parametros) y por el hecho de que el modelo base es monolingue y de bajos recursos.
- Tool calling / function calling: no disponible; no hay evidencia de soporte en los metadatos ni en la model card.
- Uso como agente o razonamiento multi-paso: no disponible; no hay indicios de entrenamiento para ello.
- Capacidades multilingues: no disponibles; el modelo base es especificamente monolingue hindi-devanagari.
- Capacidades especiales (vision, audio, modo "thinking"): ninguna; es un modelo exclusivamente de texto.

## Casos de uso

- Investigacion en ajuste fino de idiomas de bajos recursos: sirve como punto de comparacion reproducible (semilla fija) frente a otros checkpoints de la misma serie, para medir el efecto del dataset y del tokenizador en el rendimiento en hindi.
- Generacion de texto en hindi para experimentos academicos: permite evaluar la fluidez morfologica y la coherencia en devanagari con prompts cortos y `max_new_tokens` bajo, sin coste de GPU significativo.
- Prototipado de plantillas conversacionales: al aceptar entrada en formato de lista de mensajes, puede usarse para probar rapidamente plantillas de chat antes de escalar a modelos mayores en hindi.
- Aumento de datos sinteticos en hindi: generacion de texto de relleno o de ejemplos adicionales para entrenar otros modelos, siempre que se revise manualmente por el riesgo de alucinacion.
- Docencia y practicas de NLP: 125 M de parametros y 0,3 GB de pesos permiten ejecutar el modelo completo en un portatil o en CPU, lo que lo hace apto para cursos de transformers, TRL y evaluacion de modelos.
- Pruebas de integracion de infraestructura de inferencia: util para validar pipelines con Text Generation Inference, endpoints compatibles con la API de HuggingFace o despliegues ligeros, dado que los tags incluyen `text-generation-inference` y `endpoints_compatible`.
- Analisis de sesgo y cobertura linguistica: al ser un modelo entrenado con datos limitados de hindi, sirve como sujeto de estudio para medir sesgos y lagunas de cobertura en idiomas con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones especificas para hindi, y la busqueda web no aporta metricas del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp16/bf16, unos 0,25 GB en int8 y alrededor de 0,15 GB en int4 (estimacion a partir de los 124,8 M de parametros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090 o superiores; tambien A100/H100, aunque son sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, y tambien en CPU (inferencia en CPU perfectamente viable).
- Opciones de despliegue: Transformers con `pipeline("text-generation")`, Text Generation Inference (etiqueta presente en los metadatos), endpoints compatibles de HuggingFace, y cualquier runtime que cargue safetensors de GPT-2. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa.
- Latencia y throughput: no disponibles; no hay mediciones publicadas. En una GPU moderna, un modelo de 125 M de parametros suele generar decenas de tokens por segundo, pero es una estimacion generica, no un dato del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfdiso_seed10`) | 124,8 M | no disponible | hindi (devanagari) | no disponible | safetensors | HuggingFace, 0 descargas |
| `goldfish-models/hin_deva_100mb` (modelo base) | no disponible (mismo orden de magnitud, ~100 M) | no disponible | hindi (devanagari) | no disponible en la informacion proporcionada | safetensors | HuggingFace, familia Goldfish |
| `francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed10` y variantes `seed455` | no disponible (variante de 10 MB de datos) | no disponible | hindi (devanagari) | no disponible | safetensors | HuggingFace, mismo autor |
| Modelos multilingues pequenos de proposito general (por ejemplo, variantes de ~125 M tipo GPT-2 o Qwen) | ~100-150 M | 1024-8192 tokens segun familia | decenas de idiomas | variable | safetensors, GGUF | amplia |

No se dispone de datos de rendimiento comparativos entre estas alternativas dentro de la informacion proporcionada; la comparacion se limita a parametros, idioma, licencia y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al estar entrenado sobre una cantidad reducida de texto en hindi, es esperable que reproduzca los sesgos presentes en ese corpus, pero no hay analisis publicado.
- Riesgo de alucinacion: alto para conocimiento factual, dado el tamano (125 M de parametros) y el preentrenamiento monolingue y de bajos recursos. No debe usarse como fuente de datos sin verificacion.
- Limitaciones de contexto e idioma: el modelo esta orientado al hindi en devanagari; no hay evidencia de capacidades en otros idiomas ni de una ventana de contexto superior a la del modelo base.
- Licencia: la model card contiene un campo de licencia vacio (`licence: license`), por lo que no se puede confirmar si se permite el uso comercial. Se debe contactar con el autor antes de cualquier uso en produccion.
- Caveat de produccion: se trata de un checkpoint experimental con una semilla concreta, sin evaluacion publicada, sin versionado semantico y con 0 descargas; no hay senales de mantenimiento ni de soporte.
- Formato: al no publicarse GGUF ni cuantizaciones, el despliegue en entornos ligeros (llama.cpp, Ollama) requiere conversion manual, con el riesgo de degradacion que ello implica.
- Trazabilidad: se desconoce la composicion exacta del dataset de ajuste y el alcance de la modificacion del tokenizador, lo que dificulta auditar el modelo.
- Fechas de los metadatos: el repositorio figura como creado el 30 de septiembre de 2026, una fecha posterior a la actual, por lo que los metadatos temporales no son fiables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/goldfish-models/hin_deva_100mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/wspxacpq
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante hermana (10 MB de datos): https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed10
- Variante hermana con semilla 455: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed455
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfd_seed10
- Ficha en LLM Explorer (variante del mismo autor): https://llm-explorer.com/model/fpadovani%2Fhin-deva-10mb-ppt-Dp-100mb_seed10,2gxqbfb7x05raV9Acig3xV
- Ficha en free2aitools: https://free2aitools.com/model/francesca9805/hin-deva-10mb-ppt-dp-100mb-packed-bfd_seed10

# adzcai/AfriGuardPlain-AfriqueQwen3.5-4B-50Langs-Instruct-v1-lora-merged

## Resumen

AfriGuardPlain-AfriqueQwen3.5-4B-50Langs-Instruct-v1-lora-merged es un ajuste fino de seguridad (safety fine-tune) sobre el modelo McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, desarrollado por el usuario adzcai. El objetivo es dotar a un modelo multilingue centrado en lenguas africanas de un comportamiento de respuesta segura: ante una peticion segura responde de forma util, y ante una peticion insegura emite una negativa breve. A diferencia de otras variantes de la familia AfriGuard, este modelo no recibe ninguna instruccion de sistema de seguridad ni emite etiquetas `<safety>`, `<category>` o `<response>`; decide directamente si contesta o rechaza.

El modelo cuenta con 4.539.265.536 parametros totales (aproximadamente 4,5 mil millones), almacenados en formato safetensors, con un repositorio de 9,1 GB. La arquitectura declarada en los tags es `qwen3_5`, y el pipeline oficial es `text-generation`, aunque entre las etiquetas aparece tambien `image-text-to-text`, lo que sugiere que el modelo base podria tener capacidades multimodales; no hay confirmacion explicita de esto en la informacion disponible.

Su relevancia radica en dos factores. Primero, cubre once idiomas (ingles y diez lenguas africanas: amharico, hausa, igbo, oromo, shona, suajili, twi, wolof, yoruba y zulu), un conjunto para el que existen muy pocos modelos de seguridad alineados. Segundo, el ajuste se hizo con LoRA de rango 16 sobre todas las capas lineales, fusionado posteriormente en los pesos base, lo que simplifica el despliegue al no requerir adaptadores separados en tiempo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, familia `qwen3_5` (segun tags; sin detalle de capas o atencion en la informacion disponible) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin variantes GGUF/AWQ/GPTQ declaradas) |
| Idiomas soportados | en, am, ha, ig, om, sn, sw, tw, wo, yo, zu |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es el resultado de un ajuste fino supervisado (SFT) con LoRA sobre McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1. El adaptador LoRA tiene rango 16 y se aplica a todas las capas lineales; posteriormente se fusiona en los pesos del modelo base, de modo que el artefacto publicado es un checkpoint unico sin adaptadores externos. El entrenamiento se realizo con LlamaFactory sobre el dataset adzcai/AfriGuard-plain, que es la version sin instruccion de prompt de israel/AfriGuard-inst: cada ejemplo contiene unicamente el turno de usuario y una respuesta plana (respuesta util si el prompt es seguro, negativa breve si es inseguro), sin instruccion de sistema de seguridad y sin etiquetas estructuradas. La perdida se calculo solo sobre la respuesta, usando la plantilla de chat del modelo base.

Los hiperparametros declarados son: learning rate 1e-4, train_batch_size 1, eval_batch_size 8, gradient_accumulation_steps 2 (batch efectivo 2), 1 epoca, optimizador AdamW con `torch_fused` (betas 0.9/0.999, epsilon 1e-8), scheduler coseno con warmup del 10 % de los pasos, seed 42 y entrenamiento multi-GPU. Las versiones de framework son PEFT 0.18.1, Transformers 5.8.0, PyTorch 2.14.0+cu130, Datasets 4.0.0 y Tokenizers 0.22.2. La model card no incluye curva de perdida ni resultados de evaluacion durante el entrenamiento. No se documenta en la informacion disponible si hubo fases de RLHF, DPO u otras tecnicas de alineacion adicionales, ni el numero de tokens de entrenamiento o la composicion completa del dataset.

## Capacidades

- Generacion de texto conversacional en once idiomas (ingles y diez lenguas africanas), con plantilla de chat heredada del modelo base.
- Moderacion y respuesta segura: clasifica implicitamente el prompt y responde o rechaza sin emitir etiquetas de seguridad externas.
- Generacion de negativas breves ante peticiones consideradas inseguras, integrable en pipelines de filtrado.
- Capacidad multilingue orientada a Africa subsahariana, incluyendo idiomas con recursos limitados (amharico, oromo, twi, wolof).
- Respuesta a instrucciones generales heredada del modelo base Instruct (razonamiento, conocimiento general y generacion de texto abierta), en la medida en que el ajuste de seguridad no la haya degradado; no hay evaluaciones publicadas que lo confirmen.
- Posible soporte multimodal: el tag `image-text-to-text` aparece en la ficha, pero no se documenta entrada de imagen ni proyector visual en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (no se declara modo thinking ni decodificacion especulativa).
- Capacidades de audio o vision dedicadas: no disponible.

## Casos de uso

- Moderacion de contenido en lenguas africanas: el modelo puede actuar como filtro previo o posterior en plataformas de mensajeria y redes sociales que operan en suajili, hausa, yoruba, zulu o amharico, idiomas para los que los moderadores comerciales tienen cobertura limitada.
- Atencion al cliente multilingue en mercados africanos: con una plantilla de chat estandar, se puede desplegar como asistente de primer nivel en suajili, hausa o wolof, gestionando conversaciones multi-turno; la longitud de contexto disponible debe verificarse antes de dimensionar el historial.
- Chatbots de salud publica y ONG: respuestas directas y controladas sobre temas sensibles (salud sexual, vacunacion, violencia) donde el comportamiento de negativa ante peticiones inapropiadas reduce el riesgo reputacional.
- Filtrado de prompts en aplicaciones educativas: integrado como capa previa a un LLM mayor, permite descartar peticiones inseguras escritas en lenguas africanas antes de incurrir en el coste de un modelo grande.
- Investigacion en seguridad multilingue: sirve como punto de comparacion (baseline) frente a variantes con instruccion de sistema y etiquetado estructurado, como israel/AfriGuard-inst, para medir el efecto del formato de entrenamiento en la tasa de rechazo.
- Generacion de datos sinteticos de seguridad: al emitir negativas planas y limpias, puede usarse para producir corpus de referencia en idiomas con pocos recursos para el entrenamiento de otros modelos.
- Despliegue en infraestructura limitada: con 4,5 mil millones de parametros, es viable en una unica GPU de gama alta de consumo, lo que permite ejecutarlo en entornos con presupuesto reducido o incluso en el borde de la red en centros de datos regionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de seguridad (tasa de rechazo, falsos positivos), ni evaluaciones de conocimiento o generacion (MMLU, GSM8K, HumanEval u otras), ni comparaciones con el modelo base. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/BF16, aproximadamente 9,1 GB solo de pesos (el repositorio ocupa 9,1 GB), mas cache KV y activaciones, lo que situa el consumo practico en torno a 11-13 GB segun longitud de contexto y tamano de lote.
- Cuantizacion: no se publican variantes cuantizadas. Una conversion manual a 8 bits dejaria los pesos en torno a 4,5 GB y a 4 bits en torno a 2,5-3 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servicio en produccion con lotes grandes; RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB) para inferencia local en fp16.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en fp16, y en tarjetas de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: al ser un checkpoint transformers con safetensors, es compatible con vLLM, TGI y transformers nativo; para cuantizacion en CPU/consumer seria necesario convertir previamente a GGUF para llama.cpp u Ollama, conversion no publicada por el autor.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AfriGuardPlain-AfriqueQwen3.5-4B-50Langs-Instruct-v1-lora-merged (este modelo) | 4.539.265.536 | no disponible | 11 (en + 10 lenguas africanas) | cc-by-4.0 | HuggingFace, safetensors, ajuste LoRA fusionado |
| McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1 (modelo base) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace; modelo Instruct sin ajuste especifico de seguridad |
| israel/AfriGuard-inst (familia de datos relacionada) | no aplica (dataset) | no aplica | no disponible | no disponible | Dataset con instruccion de sistema y etiquetas `<safety>`/`<category>`/`<response>` |
| Modelos de moderacion comerciales (p. ej. APIs de moderacion generica) | no disponible | no disponible | Cobertura escasa en lenguas africanas | Propietaria | Solo API; sin pesos abiertos |

No se dispone de datos de rendimiento comparativo entre estas opciones; la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre un dataset de seguridad concreto, el criterio de "peticion insegura" refleja la anotacion de ese corpus, que puede no alinearse con normas culturales o legales de cada pais.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad. El ajuste SFT de una sola epoca sobre un dataset de seguridad puede degradar ligeramente las capacidades generales del modelo base; no hay mediciones que cuantifiquen esa posible regresion.
- Sobre-rechazo: al no existir instruccion de sistema, el modelo decide por si mismo cuando rechazar; es esperable una tasa de falsos positivos no medida, especialmente en prompts con vocabulario sensible pero intencion legitima.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada. La cobertura se limita a los once idiomas declarados; el rendimiento fuera de ellos no esta garantizado ni evaluado.
- Formato de salida: el modelo no emite etiquetas de seguridad, solo texto plano de respuesta o negativa; los sistemas que necesiten una clasificacion estructurada tendran que inferirla a partir del texto.
- Restricciones de licencia: cc-by-4.0 permite uso comercial con atribucion, pero conviene verificar la licencia del modelo base y del dataset, ya que el autor no detalla condiciones adicionales ni clausulas de uso responsable.
- Madurez del artefacto: el repositorio presenta muy pocas descargas y ningun "like" en el momento de la consulta, sin evaluacion externa conocida; no se recomienda su uso en produccion sin una validacion propia.
- Ausencia de resultados de entrenamiento: la model card no incluye curva de perdida ni metricas, lo que impide verificar convergencia y calidad del ajuste.
- Inconsistencia de metadatos: la etiqueta `image-text-to-text` junto al pipeline `text-generation` no esta aclarada por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adzcai/AfriGuardPlain-AfriqueQwen3.5-4B-50Langs-Instruct-v1-lora-merged
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/adzcai/AfriGuard-plain
- Dataset de origen con instruccion: https://huggingface.co/datasets/israel/AfriGuard-inst
- Config de entrenamiento: `examples/train_lora/afriguard_plain_afriqueqwen3.5-4b-50langs-instruct_lora_sft.yaml` en el repositorio AfriGuard-model (LlamaFactory); URL exacta no disponible en la informacion proporcionada
- Paper, blog o demo oficial: no disponible
- Resultados de busqueda web: no se encontraron resultados relevantes sobre este modelo

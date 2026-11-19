# Peymandc/Qwen3.5-0.8B-Heretic-Uncensored-GGUF

## Resumen

Qwen3.5-0.8B-Heretic-Uncensored-GGUF es una distribucion cuantizada en formato GGUF del checkpoint Peymandc/Qwen3.5-0.8B-Heretic-Uncensored, una version del modelo Qwen/Qwen3.5-0.8B de Alibaba Qwen a la que se le ha aplicado la tecnica Heretic v2.1.0 (Arbitrary-Rank Ablation, ARA) para reducir su comportamiento de rechazo aprendido. El modelo conserva la arquitectura y el pipeline multimodal image-text-to-text del original, con 752.393.024 parametros reales en el checkpoint safetensors de origen, y se publica bajo licencia Apache 2.0.

El paquete incluye cuatro cuantizaciones del modelo de lenguaje (Q4_K_M, Q6_K, Q8_0 y BF16) y un proyector multimodal BF16 independiente (mmproj) de 207 MB que habilita la entrada de imagenes. La publicacion esta pensada para inferencia local eficiente con llama.cpp y entornos compatibles con GGUF, no para despliegues de alta concurrencia en servidores.

Su relevancia radica en dos factores: por un lado, ofrece una via para ejecutar un modelo multimodal de menos de mil millones de parametros en hardware muy modesto; por otro, documenta de forma transparente el proceso de ablacion aplicado (indices de capas, pesos y metricas de evaluacion), lo que permite evaluar el compromiso entre reduccion de rechazos y divergencia respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5-0.8B |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, BF16 (mas proyector mmproj en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el checkpoint base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y no ha sido reentrenado: la modificacion consiste en una ablacion de rangos arbitrarios (ARA) aplicada con Heretic v2.1.0 sobre las capas 9 a 20, con los pesos `preserve_good_behavior_weight=0.4395`, `steer_bad_behavior_weight=0.0002`, `overcorrect_relative_weight=0.6954` y `neighbor_count=2`. Esta intervencion altera el comportamiento de rechazo aprendido sin ejecutar un nuevo preentrenamiento ni un fine-tuning supervisado convencional. El pipeline declarado es image-text-to-text, lo que implica que el modelo original incorpora codificacion visual; el repositorio GGUF separa esa componente en un proyector multimodal BF16 independiente que debe cargarse junto a los pesos del lenguaje para procesar imagenes.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo original empleo RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno en el formato esperado por llama.cpp.
- Procesamiento de imagenes como entrada (image-text-to-text) mediante el proyector mmproj BF16 incluido.
- Reduccion del comportamiento de rechazo: la evaluacion del checkpoint fuente reporta 8/100 coincidencias de palabras clave de rechazo frente a 93/100 del Qwen3.5-0.8B original.
- Inferencia local en CPU y GPU a traves de llama.cpp y runtimes compatibles con GGUF.
- Capacidades de razonamiento, codigo, matematicas, tool calling o agentes: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion Q4_K_M (535 MB) el modelo se ejecuta en equipos con poca memoria, lo que permite iterar sobre prompts y flujos conversacionales sin depender de APIs externas.
- Procesamiento de imagenes en el borde: el par de archivos Q4_K_M mas mmproj BF16 (535 MB + 207 MB) permite describir o interpretar imagenes en portatiles y mini-PC sin GPU dedicada, usando llama.cpp con soporte multimodal.
- Investigacion sobre alineacion y rechazo: las metricas publicadas (8/100 frente a 93/100 y KL de 0.0675) permiten estudiar el efecto de la ablacion ARA sobre el comportamiento del modelo y comparar con otras tecnicas de decensurado.
- Evaluacion de tecnicas de cuantizacion: al ofrecer cuatro variantes del mismo checkpoint (Q4_K_M, Q6_K, Q8_0, BF16), sirve para medir el impacto de la precision en tareas concretas antes de fijar una configuracion de produccion.
- Generacion de contenido sin restricciones de rechazo en entornos controlados: util para pruebas de robustez, red teaming interno y analisis de respuestas del modelo ante prompts sensibles, siempre dentro de un marco de uso responsable.
- Despliegue en dispositivos con recursos limitados: con BF16 (1,52 GB) el modelo cabe en GPUs de consumo de gama media y en sistemas con 8 GB de RAM, lo que facilita demos y entornos de desarrollo embebidos.

## Benchmarks y rendimiento

La model card no publica benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) para las variantes GGUF. Los unicos datos de evaluacion disponibles corresponden al checkpoint safetensors fuente y miden el efecto de la modificacion Heretic:

| Metrica | Checkpoint modificado | Qwen3.5-0.8B original |
|---|---:|---:|
| Coincidencias de palabras clave de rechazo (KeywordRate, primeros 100 prompts de mlabonne/harmful_behaviors) | 8/100 (8%) | 93/100 (93%) |
| Divergencia KL (primeros 100 prompts de mlabonne/harmless_alpaca) | 0.0675 | 0.0000 (por definicion) |

No se han publicado resultados de benchmarks de capacidad (razonamiento, codigo, matematicas, vision) en la informacion disponible. El autor indica explicitamente que no existen comparativas de calidad ni de velocidad entre las distintas cuantizaciones GGUF.

## Requisitos de hardware

- VRAM/RAM estimada para los pesos: Q4_K_M 535 MB, Q6_K 630 MB, Q8_0 812 MB, BF16 1,52 GB; el proyector multimodal anade 207 MB si se procesan imagenes.
- El consumo real de memoria es superior al tamano de archivo: depende de la longitud de contexto, la cache KV, los buffers del runtime, el offloading a GPU y la carga del proyector.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre puede alojar las variantes cuantizadas; una RTX 3060, RTX 4060 o superior permite cargar el modelo completo en GPU con margen para contexto amplio. Para BF16 con contexto largo se recomienda 4 GB o mas de VRAM.
- Cabe en GPU de consumo: si, en toda la gama actual (GTX 1060 6 GB, RTX 3050, RTX 4090, etc.), asi como en CPU con 4-8 GB de RAM.
- Opciones de despliegue: llama.cpp es el runtime de referencia; tambien Ollama y otros frontends compatibles con GGUF. vLLM y TGI no se mencionan como soportados en la informacion disponible.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---:|---|---|---|---|
| Peymandc/Qwen3.5-0.8B-Heretic-Uncensored-GGUF | 752 M | no disponible | Si (mmproj) | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-0.8B (original) | 752 M | no disponible | Si | Apache 2.0 | safetensors |
| Peymandc/Qwen3.5-0.8B-Heretic-Uncensored (safetensors) | 752 M | no disponible | Si | Apache 2.0 | safetensors |

La comparativa se limita al linaje directo del modelo, ya que la informacion disponible no incluye datos de rendimiento frente a alternativas de otros autores. La diferencia principal entre las tres variantes es el formato de pesos y la presencia o ausencia de la modificacion Heretic: el GGUF y el safetensors modificado incorporan la ablacion, mientras que el original de Qwen no.

## Limitaciones y advertencias

- La reduccion de rechazos es deliberada: el modelo respondera a prompts que el original rechazaria, lo que exige politicas de uso y moderacion externas en cualquier despliegue publico.
- La evaluacion de rechazo se basa en coincidencia de palabras clave (KeywordRate), no en un clasificador semantico ni en revision humana; el 8% puede no reflejar el comportamiento real en produccion.
- La divergencia KL de 0.0675 respecto al original indica que la ablacion altera la distribucion de salidas mas alla del comportamiento de rechazo, con posible degradacion en tareas generales no medida.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni rendimiento por idioma; el campo de idiomas figura como no disponible.
- La longitud de contexto no esta documentada en la informacion proporcionada, lo que impide dimensionar la cache KV con precision.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del cumplimiento normativo y de las condiciones de uso del modelo base de Qwen.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el autor no ofrece garantias de mantenimiento ni soporte.
- No se han publicado benchmarks de calidad ni de velocidad para las variantes GGUF; las diferencias de rendimiento entre cuantizaciones son desconocidas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Peymandc/Qwen3.5-0.8B-Heretic-Uncensored-GGUF
- Checkpoint safetensors modificado: https://huggingface.co/Peymandc/Qwen3.5-0.8B-Heretic-Uncensored
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Proyecto Heretic: https://heretic-project.org
- Pagina de soporte del autor: https://huggingface.co/spaces/Peymandc/support
- Badge Model Pulse: https://huggingface.co/spaces/tardellirs/model-pulse?model=Peymandc/Qwen3.5-0.8B-Heretic-Uncensored

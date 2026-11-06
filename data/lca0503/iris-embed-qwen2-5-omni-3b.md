# lca0503/IRIS-Embed-Qwen2.5-Omni-3B

## Resumen

IRIS-Embed-Qwen2.5-Omni-3B es un modelo de embeddings de audio y voz con instrucciones (instruction-aware speech embedding), desarrollado por el usuario lca0503 y publicado en Hugging Face. Se construye sobre el backbone del Thinker de Qwen2.5-Omni-3B y anade un cabezal de enrutamiento basado en el text encoder MiniLM (sentence-transformers/all-MiniLM-L6-v2) que combina dinamicamente los estados del codificador de audio antes de proyectarlos al espacio de embeddings.

El modelo resuelve un problema concreto: la recuperacion (retrieval) de audio por similitud semantica con instrucciones en lenguaje natural, algo que los modelos de embeddings puramente textuales no cubren. En lugar de generar texto, produce un vector de 2048 dimensiones a partir de la ultima posicion no rellena de la capa final del LLM, normalizado en L2 y comparable mediante similitud coseno.

Es relevante porque combina la riqueza acustica de un modelo omni (audio y texto) con un mecanismo de routing ligero que aprende a ponderar los 33 estados del encoder de audio segun la instruccion de consulta. El modelo tiene 4.726.191.137 parametros totales (segun safetensors) y un repositorio de 9,5 GB. Su licencia es qwen-research, lo que restringe el uso a investigacion y evaluacion salvo licencia comercial separada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen2.5-Omni-3B Thinker) con cabezal de routing MiniLM y proyeccion de audio |
| Parametros totales | 4.726.191.137 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (uso restringido a investigacion y evaluacion; MiniLM bajo Apache-2.0) |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo parte del Thinker de Qwen2.5-Omni-3B como backbone congelado. Sobre el se anaden adaptadores LoRA en el LLM, en el cabezal de routing MiniLM y en la proyeccion de audio. El cabezal de routing consiste en una LayerNorm seguida de una capa lineal que predice pesos softmax para combinar los 33 estados del codificador de audio (pre_encoder y encoder_0 a encoder_31). Los estados no se normalizan antes de la mezcla. La proyeccion de audio aplica LayerNorm y despues una capa lineal de 1280 a 2048 dimensiones.

El embedding final se extrae de la ultima capa del LLM, tomando el ultimo token no relleno, y se normaliza en L2 para comparar mediante similitud coseno. Durante el entrenamiento se congelan los pesos base del LLM, el text encoder MiniLM y el codificador de audio; solo se entrenan los adaptadores LoRA y el cabezal de routing. El modelo distingue entre consultas (query) y documentos (document): las consultas llevan una instruccion en lenguaje natural que se pasa como `audio_weight_text` al processor, mientras que los documentos no llevan instruccion. El prompt de MiniLM se construye como `Instruction: <instruction>\nQuery:` para consultas y `Document:` para documentos.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de embeddings de audio y voz para recuperacion por similitud semantica.
- Embeddings instruction-aware: la instruccion en lenguaje natural modula la ponderacion de los estados del codificador de audio.
- Recuperacion de audio por similitud de hablante, contenido o estilo, segun la instruccion.
- Procesamiento de audio mono a la frecuencia de muestreo del feature extractor del processor.
- Embeddings de 2048 dimensiones normalizados en L2, aptos para busqueda vectorial con similitud coseno.
- Integracion con Transformers mediante `trust_remote_code=True` y `AutoModelForCausalLM`.
- No se documenta soporte de tool calling, agentes, vision, thinking mode ni capacidades multilingues explicitas.

## Casos de uso

- Busqueda de audio por similitud de hablante: dado un fragmento de voz de consulta con la instruccion "Find speech from the same speaker as the query", el modelo genera un embedding que permite recuperar fragmentos del mismo locutor en un corpus indexado.
- Recuperacion de contenido hablado: indexar un archivo de grabaciones y recuperar segmentos que traten un tema concreto usando instrucciones en lenguaje natural, aprovechando el codificador de audio del backbone omni.
- Deduplicacion de corpus de audio: generar embeddings de todos los fragmentos de un dataset y agrupar por similitud coseno para eliminar duplicados o cuasi-duplicados.
- Construccion de indices vectoriales para RAG sobre audio: almacenar embeddings de 2048 dimensiones en bases vectoriales y recuperar por similitud coseno en pipelines de generacion aumentada.
- Clasificacion y clustering no supervisado de audio: agrupar grabaciones por caracteristicas acusticas o semanticas sin etiquetas, usando los embeddings como representacion.
- Filtrado de calidad en pipelines de datos de voz: puntuar la similitud entre fragmentos y una instruccion de referencia para descartar muestras fuera de dominio.
- Investigacion en representaciones multimodales: estudiar como el routing MiniLM pondera los distintos estados del encoder de audio segun la instruccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9,5 GB solo para pesos, mas overhead de activaciones y del processor; se recomienda al menos 16 GB de VRAM.
- GPU recomendadas: A100, H100, L40S o RTX 4090 para inferencia en bfloat16 sin cuantizar.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB); en GPUs de 16 GB puede requerir cuantizacion, aunque el autor no documenta variantes cuantizadas.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, `dtype=torch.bfloat16`, `device_map="auto"` y `attn_implementation="sdpa"`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Dependencias: Python 3.12, PyTorch 2.11, transformers 5.8.1, accelerate, torchvision, pillow, librosa 0.11.0 y soundfile.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IRIS-Embed-Qwen2.5-Omni-3B | 4.726.191.137 | no disponible | Audio y texto (embeddings) | qwen-research | Hugging Face, 4 descargas |
| Qwen2.5-Omni-3B (base) | no disponible | no disponible | Audio, texto y vision (generacion) | qwen-research | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | no disponible | no disponible | Texto (embeddings) | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de IRIS-Embed frente a alternativas de embeddings de audio. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia qwen-research: el uso esta restringido a investigacion y evaluacion salvo que se obtenga una licencia comercial separada. No apto para produccion comercial sin autorizacion.
- Modelo con muy baja adopcion (4 descargas, 0 likes) y publicado recientemente; no hay validacion externa de su calidad.
- No se documentan sesgos conocidos ni evaluaciones de robustez; al derivar de Qwen2.5-Omni-3B hereda los sesgos potenciales del modelo base.
- Riesgo de alucinacion no aplica de forma directa al ser un modelo de embeddings, pero la representacion puede no capturar matices semanticos finos en audio ruidoso o dominios alejados del entrenamiento.
- No se documentan idiomas soportados; el rendimiento multilingue es incierto.
- Longitud de contexto no disponible; fragmentos de audio largos pueden requerir troceado previo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; revisar el codigo antes de desplegar.
- Dependencias muy especificas (transformers 5.8.1, PyTorch 2.11, Python 3.12) que pueden no estar disponibles en todos los entornos.
- El uso de MiniLM como cabezal de routing introduce una dependencia adicional cuyo comportamiento fuera de dominio no esta evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lca0503/IRIS-Embed-Qwen2.5-Omni-3B
- Modelo base Qwen2.5-Omni-3B: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- Text encoder MiniLM: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Licencia Qwen Research: https://huggingface.co/lca0503/IRIS-Embed-Qwen2.5-Omni-3B/blob/main/LICENSE
- Licencia MiniLM (Apache-2.0): https://huggingface.co/lca0503/IRIS-Embed-Qwen2.5-Omni-3B/blob/main/LICENSE-MiniLM
- NOTICE de procedencia: https://huggingface.co/lca0503/IRIS-Embed-Qwen2.5-Omni-3B/blob/main/NOTICE

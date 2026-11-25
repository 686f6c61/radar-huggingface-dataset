# AutomatosX/AX-Clef-Omni-30B-A3B-MLX-AXQ-MXFP8

## Resumen

AX-Clef-Omni-30B-A3B-MLX-AXQ-MXFP8 es una cuantizacion mixta de precision (AXQuant, formato MXFP8) del modelo Cloudflare/clef-omni, empaquetada en formato MLX Safetensors para ejecucion nativa en Apple Silicon. Lo desarrolla AutomatosX, un proyecto que publica packs cuantizados para el ecosistema MLX. El modelo base emplea la arquitectura Qwen3OmniMoeForConditionalGeneration, una mezcla de expertos (MoE) multimodal que combina rutas de texto, vision y audio, con 35,26 mil millones de parametros logicos.

La particularidad de este checkpoint es que cuantiza unicamente la ruta de lenguaje (atención, MLP y troncos de expertos del thinker y del talker) a 8 bits afines con grupo de 32, mientras preserva en BF16 la torre de vision, el codificador de audio, el modulo code2wav, las normas y ambas cabezas LM. El resultado medido es de 8,6345 bits por peso (BPW) y un peso total en safetensors de 38,06 GB, lo que lo hace viable en equipos Apple Silicon con memoria unificada amplia.

Es relevante ahora porque el modelo base no es un chatbot generico: Clef-Omni es un modelo de decision que puntua esquemas de opciones tipadas (estados mas preguntas con opciones `noul`, `choice` y `score`) y devuelve probabilidades por opcion permitida en un unico prefill. Este pack, sin embargo, se publica explicitamente como evidencia de desarrollo y no como certificado de calidad, y su autor anuncia una reconstruccion futura con el kit AXQuant mejorado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3OmniMoeForConditionalGeneration (MoE multimodal: texto, vision, audio) |
| Parametros totales | 35.259.818.545 (35,26B logicos) |
| Parametros activos | no disponible |
| Longitud de contexto | no registrada en la model card; los limites practicos dependen de la memoria unificada |
| Tipos de cuantizacion | AXQuant 2.1.0, precision mixta: 8 bits afines (grupo 32) en ruta de lenguaje, BF16 en vision, audio, code2wav, normas y cabezas LM; embeddings y routers a 8 bits afines |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye pesos PyTorch ni GGUF) |
| BPW medido (modelo principal) | 8,6345 |
| BPW medido (total) | 8,6345 |
| Tamano de safetensors | 38,06 GB |
| Descarga completa aproximada | 38,10 GB |
| Runtime MLX | MLX-VLM (registra MLX 0.32.1) |
| MTP | no presente |
| Vision | si |
| Audio | si |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos multimodal de la familia Qwen3-Omni, con una ruta de texto optimizada y torres dedicadas de vision y audio. La arquitectura combina atencion y MLP con troncos de expertos en el thinker y el talker, mas un modulo code2wav para salida de voz y un cabezal conjunto (`joint_head.safetensors`) que implementa el esquema de decision original en BF16, copiado sin cambios junto con `joint_head_config.json` y `joint_schema_model.py`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La innovacion tecnica de este checkpoint es la cuantizacion AXQuant: un plan mixto que asigna 8 bits afines (grupo 32) al 95,04% de los parametros (33,51B) y mantiene en BF16 el 4,96% restante (1,75B) correspondiente a componentes sensibles. El autor advierte que la etiqueta MXFP8 describe una clase de presupuesto de almacenamiento, no una precision uniforme, y que el BPW medido es el dato autoritativo. No se incluye sidecar MTP ni sidecar de vision; los pesos de vision van protegidos en BF16 dentro de los shards principales. El autor indica que la salida de voz no fue medida.

## Capacidades

- Generacion de texto y razonamiento sobre la ruta de lenguaje cuantizada del modelo base.
- Procesamiento de vision: la torre visual se conserva en BF16 y el modelo acepta entradas de imagen.
- Procesamiento de audio: el codificador de audio se conserva en BF16; el modulo code2wav tambien queda en BF16 para sintesis de voz.
- Puntuacion de decisiones estructuradas: el modelo evalua un esquema de opciones tipadas y devuelve una probabilidad por cada opcion permitida en un unico prefill (funcion principal del modelo base).
- Soporte multimodal conjunto texto, imagen y audio segun la arquitectura Qwen3-Omni.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no documenta el conjunto de idiomas.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Puntuacion de decisiones estructuradas: el modelo recibe un estado y un conjunto de preguntas con opciones tipadas y devuelve probabilidades por opcion en un solo prefill, lo que encaja en sistemas de enrutamiento, clasificacion jerarquica o seleccion de acciones donde se necesita una distribucion calibrada sobre alternativas.
- Prototipado multimodal en Apple Silicon: desarrolladores con Mac equipados con memoria unificada amplia pueden cargar el checkpoint con MLX-VLM para experimentar con entradas de imagen y audio sin depender de GPU dedicadas.
- Evaluacion de pipelines de decision en local: al ser un pack de desarrollo, sirve para validar la integracion del cabezal conjunto (`joint_head`) y el esquema de opciones antes de pasar a un despliegue en BF16 o en otro runtime.
- Investigacion sobre cuantizacion mixta: el reparto documentado (95,04% a 8 bits, 4,96% en BF16, grupo 32) permite estudiar el impacto de proteger torres de vision y audio frente a cuantizar solo la ruta de lenguaje.
- Procesamiento de documentos con imagen y audio en flujos offline: la preservacion en BF16 de la torre visual y del codificador de audio permite usar el modelo en tareas de comprension multimodal por lotes en estaciones de trabajo Apple.
- Banco de pruebas de despliegue MLX: util para comparar el rendimiento y la fidelidad de un pack AXQ frente al modelo base Cloudflare/clef-omni en el mismo hardware, dado que el autor no publica metricas de velocidad de kernel ni de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernel ni velocidad MTP, y que la etiqueta AXQ no debe interpretarse como una afirmacion de benchmark.

## Requisitos de hardware

- VRAM/memoria estimada: la descarga completa ocupa unos 38,10 GB y los safetensors pesan 38,06 GB; se necesita memoria unificada suficiente para cargar los pesos mas el estado de ejecucion, por lo que en la practica conviene disponer de bastante mas que el tamano del archivo.
- GPU recomendadas: no aplica GPU dedicada; el pack esta pensado para Apple Silicon con MLX y MLX-VLM.
- Compatibilidad con GPU de consumo: si cabe en equipos Apple con memoria unificada amplia (configuraciones de gama alta de la familia M); no es ejecutable en GPUs NVIDIA ni AMD con este formato.
- Opciones de despliegue: MLX y MLX-VLM como ruta principal; el autor senala que la ejecucion nativa en AX Engine no esta establecida porque no se incluye un `model-manifest.json` validado. No hay pesos GGUF, por lo que llama.cpp u Ollama no son aplicables directamente.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Clef-Omni-30B-A3B-MLX-AXQ-MXFP8 | 35,26B logicos | no registrado | MLX Safetensors, 8,63 BPW | Apache 2.0 | Pack de desarrollo, solo Apple Silicon |
| AX-Clef-Omni-30B-A3B-MLX-AXQ-MXFP4 (hermano) | 35,26B logicos | no registrado | MLX Safetensors, formato de bloque MXFP4 | Apache 2.0 | Misma politica de roles AXQ; vision, audio, code2wav, normas y LM head en BF16 |
| Cloudflare/clef-omni (base) | 35,26B logicos | no disponible | BF16 (PyTorch) | Apache 2.0 | Modelo original de decision multimodal; referencia de calidad |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks para comparar rendimiento |

## Limitaciones y advertencias

- El autor califica el paquete como evidencia de desarrollo, no como certificado de calidad; no publica evidencia medida de calidad, contexto largo, velocidad de kernel ni MTP.
- Esta anunciada una reconstruccion del pack con el kit AXQuant mejorado (2.1.0 en adelante) que reemplazara los archivos actuales como nueva revision; conviene fijar un commit concreto en despliegues reproducibles.
- La ejecucion nativa en AX Engine no esta establecida: no se incluye `model-manifest.json` validado y los campos de AX Engine en `axquant_runtime.json` describen un contrato de compatibilidad, no evidencia observada.
- El modelo base no es un chatbot: `mlx_lm.generate` y `mlx_vlm.generate` cargan el backbone y producen texto que no es la salida del modelo; la interfaz correcta es el esquema de decision con probabilidades por opcion.
- El loader upstream `load_release_model` es de PyTorch para el thinker BF16 y no carga este checkpoint MLX ni los pesos del talker o code2wav.
- La salida de voz no fue medida; no se reclama paridad con el Decision Index del modelo base ni calidad de audio o video.
- No se incluyen pesos PyTorch ni GGUF, lo que limita el despliegue a Apple Silicon con MLX.
- Riesgo de sesgos y alucinacion: no documentado en la informacion proporcionada.
- Idiomas soportados y longitud de contexto: no disponibles, lo que dificulta planificar produccion multilingue o con ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el estado de desarrollo del pack y la falta de evidencia de calidad desaconsejan usarlo en produccion sin validacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/AutomatosX/AX-Clef-Omni-30B-A3B-MLX-AXQ-MXFP8
- Modelo base: https://huggingface.co/Cloudflare/clef-omni/tree/0db1cd2607d76a7bdb2a382f659e7b313079f84b
- Hermano MXFP4: https://huggingface.co/AutomatosX/AX-Clef-Omni-30B-A3B-MLX-AXQ-MXFP4
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog

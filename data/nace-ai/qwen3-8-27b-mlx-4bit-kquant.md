# nace-ai/Qwen3.8-27B-MLX-4bit-KQuant

## Resumen

Qwen3.8-27B-MLX-4bit-KQuant es una cuantizacion de 4 bits del modelo Qwen/Qwen3.8-27B, publicada por nace-ai para su uso en Apple Silicon mediante la libreria MLX. El modelo base es un transformer multimodal de tipo image-text-to-text con 27.356.728.560 parametros, orientado a conversacion, razonamiento y comprension de imagenes. Esta version concreta reduce el peso del modelo a 16,3 GB de ficheros, lo que permite ejecutarlo en Macs con 32 GB de memoria unificada o mas.

La relevancia de este checkpoint radica en su estrategia de cuantizacion: segun la model card, el pack Q4 de nace-ai queda un 1,5x mas cerca del modelo original en BF16 que el pack de 4 bits de mlx-community, medido como divergencia KL (0,035 frente a 0,054) con el mismo tamano de pesos del modelo de lenguaje (15,13 GB). El autor denomina a esta tecnica "KQuant" y la distribuye junto a Kapitsa, su motor de inferencia para modelos Qwen en macOS que expone APIs compatibles con OpenAI, Anthropic y Ollama.

El modelo conserva las capacidades del Qwen3.8-27B original: modo de razonamiento (thinking) activado por defecto con control de profundidad, entrada de imagenes mediante partes `image_url`, y soporte de tool calling. La licencia Apache 2.0 del modelo base se mantiene en esta cuantizacion, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); familia qwen3_5 |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit uniforme (Q4) y mixta 4/6/8-bit por tensor (Q5, ~5,3 bits por peso, 5,8 contando escalas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pack MLX); repo de 37,0 GB con subcarpetas Q4/ y Q5/ |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer de la familia qwen3_5 con 27.356 millones de parametros, disenado para tareas conversacionales y de imagen-texto. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card de esta cuantizacion no los detalla.

La innovacion tecnica de este checkpoint es la cuantizacion KQuant. El pack Q4 emplea 4 bits uniformes y ocupa 16,3 GB, mientras que el pack Q5 usa precision mixta (4, 6 y 8 bits por tensor) con unos 5,3 bits por peso y 20,7 GB de descarga. El autor reporta una divergencia KL frente a BF16 de 0,035 para Q4 y 0,022 para Q5. Ademas, el modelo conserva el modo de razonamiento del original, con un parametro `reasoning_effort` que acepta los valores `low`, `medium` y `xhigh`, y permite desactivar el pensamiento con `enable_thinking: false`.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat propia.
- Razonamiento explicito en modo thinking, activado por defecto, con profundidad configurable (`low`, `medium`, `xhigh`) y salida del razonamiento en el campo `reasoning_content`.
- Comprension de imagenes: acepta entradas `image_url` como URL http(s) o data URL en base64.
- Tool calling / function calling, verificado por el autor sobre este pack con `mlx_lm.server` y con LM Studio.
- Capacidades multilingues: no se detallan los idiomas soportados en la informacion disponible.
- Despliegue mediante API compatible con OpenAI, Anthropic y Ollama a traves de Kapitsa, y servidor OpenAI-compatible con `mlx_lm.server`.

## Casos de uso

- Asistente conversacional local en Mac: el pack Q4 de 16,3 GB cabe en equipos con 32 GB de memoria unificada, lo que permite mantener conversaciones privadas sin salir del dispositivo usando `kapitsa serve --private`.
- Analisis de imagenes en escritorio: con soporte de entradas `image_url`, se puede enviar una fotografia o captura y pedir descripcion o extraccion de informacion, como demuestra el ejemplo de la model card con una imagen de Wikimedia.
- Razonamiento matematico y de varios pasos: el modo thinking con `reasoning_effort` ajustable permite resolver problemas como calculos o deducciones encadenadas antes de responder.
- Integracion en herramientas de desarrollo: al exponer una API compatible con OpenAI en el puerto 8080 mediante `mlx_lm.server`, se puede conectar a clientes y frameworks que ya hablan ese protocolo.
- Automatizacion con tool calling: el modelo puede colocar llamadas a funciones a traves de la API, lo que habilita agentes que consultan servicios externos o ejecutan acciones.
- Prototipado de aplicaciones multimodales en Apple Silicon: la combinacion de MLX, Kapitsa y los packs Q4/Q5 permite iterar localmente con dos niveles de fidelidad frente al BF16 (KL 0,035 y 0,022) segun la memoria disponible.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). El unico dato cuantitativo de rendimiento es la divergencia KL frente al modelo BF16:

| Pack | Bits | Tamano de descarga | KL frente a BF16 | Memoria recomendada |
|---|---|---|---|---|
| Q4 | 4-bit uniforme | 16,3 GB | 0,035 | 32 GB+ |
| Q5 | 4/6/8-bit mixto (~5,3 bpw) | 20,7 GB | 0,022 | 48 GB+ |

El autor compara el Q4 con el pack de 4 bits de mlx-community (KL 0,054) y con lmstudio-community 4-bit y mlx-works oQ4e-mtp, sin aportar cifras de estos ultimos en el texto extraido. No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 32 GB o mas para el pack Q4 (16,3 GB de ficheros); 48 GB o mas para el Q5 (20,7 GB). La regla del autor asume que macOS asigna por defecto cerca de dos tercios de la RAM a la GPU y anade 2 GB para la conversacion.
- GPU: disenado exclusivamente para Apple Silicon (MLX); no se contemplan A100, H100 ni RTX 4090 en esta distribucion.
- Consumer GPU: no aplica; el objetivo son Macs con memoria unificada, no GPUs discretas.
- Despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa`, `kapitsa pull 27b:q4`, `kapitsa serve`) y mlx-lm (`mlx_lm.generate`, `mlx_lm.server` en el puerto 8080). Tambien verificado en LM Studio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | KL frente a BF16 | Licencia |
|---|---|---|---|---|---|
| nace-ai Qwen3.8-27B-MLX Q4 | 27,36 B | 4-bit uniforme | 16,3 GB | 0,035 | Apache 2.0 |
| nace-ai Qwen3.8-27B-MLX Q5 | 27,36 B | 4/6/8-bit mixto | 20,7 GB | 0,022 | Apache 2.0 |
| mlx-community 4-bit (Qwen3.8-27B) | 27,36 B | 4-bit | mismo tamano que Q4 | 0,054 | no disponible en la informacion |
| lmstudio-community 4-bit | no disponible | 4-bit | no disponible | no disponible | no disponible |
| mlx-works oQ4e-mtp | no disponible | 4-bit | no disponible | no disponible | no disponible |

La comparativa se limita a los packs MLX del mismo modelo base citados por el autor; no se dispone de datos de contexto, rendimiento en tareas ni licencia de los packs rivales.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con MLX; no es desplegable en CUDA, ROCm ni CPUs convencionales sin conversion adicional.
- La cuantizacion introduce perdida de fidelidad frente a BF16 (KL 0,035 en Q4 y 0,022 en Q5); para tareas sensibles a la precision conviene usar Q5 o el modelo original.
- El modelo piensa antes de responder por defecto, lo que incrementa la latencia y el consumo de tokens; hay que desactivarlo explicitamente con `reasoning_effort: none` o `enable_thinking: false`.
- Los ejemplos de inferencia de la model card se probaron originalmente en el pack de 9B; sobre este pack solo se verificaron un chat y una llamada a herramienta con mlx-lm 0.32.2 y LM Studio, por lo que otras rutas pueden no estar validadas.
- No se detallan los idiomas soportados ni los sesgos conocidos del modelo base.
- Riesgo de alucinacion inherente a los modelos generativos; no se aportan evaluaciones de fiabilidad.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base Qwen3.8-27B mantiene esa misma licencia en su repositorio original.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-4bit-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Kapitsa: https://github.com/nace-ai/kapitsa
- Instalacion de Kapitsa via Homebrew: `brew install nace-ai/tap/kapitsa`
- Assets de la model card: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX/resolve/main/assets/

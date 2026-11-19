# nace-ai/Qwen3.5-9B-MLX-4bit-KQuant

## Resumen

Qwen3.5-9B-MLX-4bit-KQuant es una cuantizacion en 4 bits del modelo Qwen/Qwen3.5-9B, publicada por Nace.AI para su uso con MLX sobre Apple Silicon. El modelo base es un transformer multimodal de Qwen con 9.409.813.744 parametros (aproximadamente 9,4 mil millones), orientado a tareas de image-text-to-text y conversacion. Esta version reduce el peso a unos 6 GB en el repositorio, lo que la hace viable en equipos Mac con memoria unificada moderada.

La relevancia de esta ficha esta en que no se trata de una cuantizacion generica: el autor publica una comparativa de fidelidad frente al modelo BF16 original, medida con divergencia KL y acuerdo de token superior sobre un corpus de texto, y situa su pack por delante de las alternativas de lmstudio-community y mlx-community en esas metricas, aunque por detras de packs de mayor tamano como Brooooooklyn UD-Q4_K_XL y mlx-community OptiQ. Es, por tanto, un ejemplo de cuantizacion optimizada para un equilibrio entre tamano y fidelidad.

El modelo esta pensado para inferencia local en Mac mediante el motor Kapitsa de Nace.AI o mediante mlx-lm. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque las condiciones del modelo base deben verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la comparativa usa ventanas de 512 tokens, pero no es la longitud maxima del modelo) |
| Tipos de cuantizacion | 4 bits (MLX, formato KQuant) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |
| Tamano del repositorio | 6,0 GB |
| Tamano de descarga de pesos | 5,950 GB (incluye pesos auxiliares) |
| Payload auditado del modelo de lenguaje | 5,038 GB (excluye vision y MTP) |
| Libreria | mlx |
| Modelo base | Qwen/Qwen3.5-9B |

## Arquitectura y entrenamiento

Esta publicacion no entrena un modelo nuevo: es una cuantizacion del Qwen3.5-9B original. La arquitectura subyacente es la del modelo base de Qwen, un transformer multimodal capaz de procesar imagen y texto (pipeline image-text-to-text). El pack incluye pesos auxiliares de vision y de MTP (multi-token prediction), segun se desprende de la auditoria de componentes que el autor documenta en la model card.

La innovacion tecnica de esta ficha no esta en el entrenamiento, sino en el proceso de cuantizacion. El autor reporta metricas de fidelidad frente al modelo BF16: divergencia KL con intervalo de confianza al 95 % y porcentaje de acuerdo en el token superior, medidas sobre ventanas de contexto de 512 tokens con 64 ventanas, usando corpus de wikitext2, gsm8k_train_chat y humaneval. La medicion se realizo el 2026-11-11 con MLX CUDA sobre una GPU L40S, no sobre Metal de Apple, y con 4000 replicas de bootstrap (semilla 469). No se detallan los datos de entrenamiento originales del modelo base ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en modo thinking y non-thinking, con presets de muestreo diferenciados para cada modo.
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque el quickstart de mlx-lm solo demuestra generacion de texto.
- Razonamiento general y generacion de codigo: el autor incluye un preset especifico de "thinking (precise code)" con temperatura 0,6 y presencia 0.
- Soporte de plantilla de chat con conmutacion del modo thinking mediante configuracion de la plantilla.
- Compatibilidad con el motor Kapitsa para servicio local y con mlx-lm para generacion por linea de comandos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: el pack de 5,95 GB de descarga de pesos permite ejecutar un modelo de 9,4 mil millones de parametros en equipos Apple Silicon de gama alta sin recurrir a la nube, usando Kapitsa o mlx-lm.
- Prototipado de asistentes conversacionales: los presets de muestreo publicados (temperatura 0,7, top_p 0,8, presencia 1,5 en modo non-thinking) permiten arrancar un chatbot local con ajustes ya validados por el autor del modelo base.
- Generacion de codigo asistida en local: el preset "thinking (precise code)" con temperatura 0,6 y presencia 0 esta pensado para tareas de codigo donde se prioriza determinismo sobre creatividad.
- Evaluacion de tecnicas de cuantizacion: la model card publica divergencia KL y acuerdo de token superior frente a otros packs, lo que convierte este repositorio en un caso de estudio util para quien investigue el impacto de la cuantizacion en la fidelidad.
- Despliegue de servicio local privado: el comando `kapitsa serve --model ... --private` levanta un servidor local, adecuado para entornos donde los datos no deben salir del equipo.
- Tareas multimodales de imagen y texto: el pipeline declarado es image-text-to-text, por lo que el pack esta orientado a escenarios que combinan imagen y texto, aunque el quickstart documentado solo cubre texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible. Lo que si se publica es una comparativa de fidelidad de cuantizacion frente al modelo BF16, medida con divergencia KL y acuerdo de token superior:

| Pack | GB | KL (IC 95 %) | Acuerdo token superior |
|---|---:|---|---:|
| AtomicChat MLX-4bit | 5,038 | 0,080555 [0,073764, 0,087457] | 88,51 % |
| Brooooooklyn UD-Q4_K_XL-mlx | 8,081 | 0,026063 [0,023768, 0,028317] | 93,56 % |
| Nace (este repo) | 5,950 | 0,036619 [0,033267, 0,040221] | 92,41 % |
| lmstudio-community MLX-4bit | 5,950 | 0,080555 [0,073764, 0,087457] | 88,51 % |
| mlx-community 4bit | 5,950 | 0,081409 [0,074333, 0,088666] | 88,42 % |
| mlx-community MLX-4bit | 5,950 | 0,081409 [0,074333, 0,088666] | 88,42 % |
| mlx-community OptiQ-4bit | 8,013 | 0,029220 [0,026377, 0,032296] | 93,39 % |
| mlx-works oQ4e-mtp | 6,231 | 0,042674 [0,038978, 0,046532] | 91,03 % |

Menor KL y mayor acuerdo indican mayor cercania al modelo BF16. El pack de Nace ocupa una posicion intermedia: mejor que los packs de 4 bits de lmstudio-community, mlx-community y AtomicChat, pero peor que los packs de mayor tamano (Brooooooklyn y OptiQ). La medicion se hizo con MLX CUDA en L40S, no en Metal, y con ventanas de 512 tokens.

## Requisitos de hardware

- VRAM o memoria unificada estimada: alrededor de 6 GB para los pesos descargados; hay que sumar el overhead de activaciones y KV cache, por lo que en la practica se recomienda disponer de bastante mas memoria libre que el tamano de los pesos.
- GPU recomendadas: el pack esta disenado para Apple Silicon mediante MLX; el autor no publica requisitos oficiales de GPU NVIDIA. La comparativa de fidelidad se hizo en una L40S con MLX CUDA, pero eso es un entorno de medicion, no una recomendacion de despliegue.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (el tamano de pesos es de unos 6 GB). No se especifican modelos concretos de Mac ni minimos de memoria.
- Opciones de despliegue: mlx-lm (version 0.32.2 en el ejemplo) y Kapitsa (motor de Nace.AI para Apple Silicon).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Nace Qwen3.5-9B-MLX-4bit-KQuant (este) | 9,41 B | no disponible | MLX 4-bit, 5,95 GB | Apache 2.0 | KL 0,0366; acuerdo 92,41 % |
| lmstudio-community Qwen3.5-9B-MLX-4bit | 9,41 B (base) | no disponible | MLX 4-bit, 5,95 GB | no disponible | KL 0,0806; acuerdo 88,51 % |
| mlx-community Qwen3.5-9B 4bit | 9,41 B (base) | no disponible | MLX 4-bit, 5,95 GB | no disponible | KL 0,0814; acuerdo 88,42 % |
| Brooooooklyn Qwen3.5-9B-UD-Q4_K_XL-mlx | 9,41 B (base) | no disponible | MLX 4-bit, 8,08 GB | no disponible | KL 0,0261; acuerdo 93,56 % |
| mlx-community Qwen3.5-9B OptiQ-4bit | 9,41 B (base) | no disponible | MLX 4-bit, 8,01 GB | no disponible | KL 0,0292; acuerdo 93,39 % |

La comparativa se limita a otros packs de cuantizacion del mismo modelo base, porque la informacion proporcionada no incluye datos de modelos de otras familias.

## Limitaciones y advertencias

- Es una cuantizacion en 4 bits: introduce perdida de fidelidad respecto al BF16, cuantificada en KL 0,0366 y acuerdo de token superior del 92,41 %. No es equivalente al modelo original.
- Los packs de mayor tamano (Brooooooklyn UD-Q4_K_XL y OptiQ) obtienen mejor fidelidad a costa de ocupar mas espacio; si la precision es critica, este pack no es la mejor opcion.
- Las metricas de fidelidad se midieron con MLX CUDA en una L40S, no en Metal de Apple, por lo que el comportamiento en Mac puede diferir.
- El quickstart documentado solo cubre generacion de texto; no se demuestra el uso de entrada de imagen, pese a que el pipeline declarado es image-text-to-text.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni tool calling en la informacion proporcionada.
- La licencia del pack es Apache 2.0, pero las condiciones del modelo base Qwen/Qwen3.5-9B deben verificarse por separado antes de un uso comercial.
- El autor recomienda usar un pack mas nuevo (nace-ai/Qwen3.5-9B-MLX, 5,29 GB) mas cercano al original; este repositorio puede quedar desactualizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-4bit-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Pack mas nuevo recomendado por el autor: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Instalacion de Kapitsa: https://github.com/nace-ai/kapitsa#install
- Nace.AI: https://www.nace.ai/
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Instalacion de uv: https://docs.astral.sh/uv/getting-started/installation/
- Mejores practicas del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B#best-practices
- Otros packs del autor: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX, https://huggingface.co/nace-ai/Qwen3.8-27B-MLX, https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX, https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX

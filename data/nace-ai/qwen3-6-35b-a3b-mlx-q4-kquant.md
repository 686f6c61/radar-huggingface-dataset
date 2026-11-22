# nace-ai/Qwen3.6-35B-A3B-MLX-Q4-KQuant

## Resumen

Qwen3.6-35B-A3B-MLX-Q4-KQuant es una cuantizacion en formato MLX del modelo Qwen3.6-35B-A3B, desarrollado por el usuario nace-ai sobre el modelo base de Qwen. Se trata de un pack de pesos de 4 bits (Q4) optimizado para inferencia en Apple Silicon, con un total de 35.107.181.936 parametros y un tamano de repositorio de 44,0 GB. El modelo base es un Mixture of Experts (MoE) con arquitectura `qwen3_5_moe`, orientado a tareas multimodales de imagen-texto y conversacion.

La relevancia de esta ficha radica en su propuesta de cuantizacion: el autor afirma que su Q4 esta "1,6 veces mas cerca" del modelo original en BF16 que el pack de 4 bits de mlx-community, con una divergencia KL de 0,059 frente a 0,096, manteniendo el mismo tamano de pesos del modelo de lenguaje (19,51 GB). Ademas, el repositorio incluye un checkpoint Q5 de precision mixta (4/6/8 bits por tensor, aproximadamente 4,6 bits por peso) con una KL de 0,027.

El modelo esta pensado para ejecutarse en Macs con Apple Silicon mediante la libreria MLX, con soporte para la herramienta Kapitsa del propio autor y para mlx-lm, incluyendo un servidor compatible con la API de OpenAI. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (`qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (4 bits uniforme, gates del router en 8 bits); Q5 (precision mixta 4/6/8 bits por tensor, ~4,6 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (packs Q4/ y Q5/) |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts de tipo transformer con identificador de arquitectura `qwen3_5_moe`, del que se derivan los pesos cuantizados. No se dispone de informacion sobre el numero de parametros activos por token, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla la longitud de contexto nativa del modelo base.

La innovacion tecnica destacable de esta ficha es el esquema de cuantizacion. El checkpoint Q4 emplea 4 bits uniformes con gates del router en 8 bits, igual que mlx-lm, y logra una divergencia KL de 0,059 frente al BF16 con 19,51 GB de pesos del modelo de lenguaje. El checkpoint Q5 usa precision mixta con asignacion de 4, 6 u 8 bits por tensor, lo que resulta en aproximadamente 4,6 bits por peso (5,1 contando escalas) y una KL de 0,027. El autor advierte que el Q5 se evaluo sobre token IDs distintos al resto, por lo que no reclama una ganancia pareada para ese checkpoint.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo "thinking" activado por defecto: el modelo razona antes de responder y devuelve el razonamiento en el campo `reasoning_content`.
- Capacidad multimodal de imagen a texto: acepta imagenes como URLs http(s) o data URLs en base64 mediante partes `image_url` del formato OpenAI.
- Tool calling / function calling: el autor verifico la colocacion de una llamada a herramienta a traves de `mlx_lm.server` y de LM Studio.
- Desactivacion del modo thinking mediante `reasoning_effort: "none"` o `chat_template_kwargs: {"enable_thinking": false}`.
- Servido mediante APIs compatibles con OpenAI, Anthropic y Ollama a traves de Kapitsa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar conversaciones multi-turno directamente en Apple Silicon con 21,0 GB de pesos Q4, sin depender de servicios en la nube, usando Kapitsa o mlx-lm como servidor local.
- Analisis de imagenes en escritorio: gracias al pipeline image-text-to-text, se puede enviar una imagen por URL o base64 y pedir una descripcion o extraccion de informacion, como demuestra el ejemplo del gato en la model card.
- Automatizacion de flujos con tool calling: la integracion con `mlx_lm.server` y LM Studio permite que el modelo emita llamadas a funciones dentro de pipelines locales, util para agentes que consultan APIs o ejecutan acciones.
- Razonamiento supervisado con trazas: el modo thinking por defecto, con el razonamiento expuesto en `reasoning_content`, es adecuado para depurar cadenas de razonamiento en tareas matematicas o logicas antes de dar una respuesta final.
- Prototipado de aplicaciones con API OpenAI: al exponer un endpoint compatible con `/v1/chat/completions`, se puede apuntar codigo existente basado en el SDK de OpenAI al servidor local sin cambios de cliente.
- Evaluacion de cuantizaciones: investigadores pueden comparar la KL frente a BF16 de los checkpoints Q4 y Q5 con los packs publicos de mlx-community y unsloth para decidir el equilibrio entre tamano y fidelidad.
- Despliegue en estaciones de trabajo Apple de 48 GB o mas: el autor indica que ambos checkpoints caben en equipos con 48 GB o mas de RAM, lo que permite servir el modelo en un Mac Studio o MacBook Pro de gama alta.

## Benchmarks y rendimiento

| Metrica | Q4 (Nace) | Q5 (Nace) | mlx-community 4-bit | unsloth UD-3bit |
|---|---|---|---|---|
| Divergencia KL frente a BF16 (menor es mejor) | 0,059 | 0,027 | 0,096 | no disponible |
| Tamano de descarga | 21,0 GB | 23,0 GB | no disponible | no disponible |
| Bits por peso | 4 (router 8 bits) | ~4,6 (5,1 con escalas) | 4 | 3 (UD) |

El autor senala que el Q5 se puntuo sobre token IDs distintos, por lo que no se reclama una ganancia pareada frente a los demas. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- RAM estimada: el autor indica que ambos checkpoints caben en equipos con 48 GB o mas de RAM. La cifra "Fits" es una regla heuristica basada en que macOS asigna por defecto aproximadamente dos tercios de la RAM a la GPU, y se necesita espacio para la descarga mas 2 GB para una conversacion.
- GPU: disenado para Apple Silicon (M-series). No se mencionan GPU NVIDIA (A100, H100, RTX 4090) en la informacion disponible.
- Kapitsa puede saltarse partes que no usa y caber en un tamano inferior de RAM; `kapitsa doctor` verifica un Mac concreto.
- Opciones de despliegue: Kapitsa (`kapitsa serve --model 35b:4bit --private`), mlx-lm (`mlx_lm.generate`, `mlx_lm.server` en el puerto 8080) y LM Studio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KL frente a BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nace-ai Qwen3.6-35B-A3B-MLX Q4 | 35,1 B (MoE) | no disponible | 0,059 | Apache 2.0 | MLX, 21,0 GB |
| nace-ai Qwen3.6-35B-A3B-MLX Q5 | 35,1 B (MoE) | no disponible | 0,027 | Apache 2.0 | MLX, 23,0 GB |
| mlx-community 4-bit (Qwen3.6-35B-A3B) | 35,1 B (MoE) | no disponible | 0,096 | no disponible | MLX, mismo tamano que Nace Q4 |
| unsloth UD-3bit (Qwen3.6-35B-A3B) | 35,1 B (MoE) | no disponible | no disponible | no disponible | 3 bits UD |

La comparativa se limita a packs de cuantizacion del mismo modelo base; no se dispone de datos de rendimiento en tareas para comparar con modelos alternativos de distinto origen.

## Limitaciones y advertencias

- Los pesos estan en formato MLX y estan pensados para Apple Silicon; no son directamente utilizables en CUDA, ROCm ni en GPUs NVIDIA.
- El modo thinking esta activado por defecto y puede incrementar la latencia y el consumo de tokens; para respuestas rapidas hay que desactivarlo explicitamente.
- La cuantizacion introduce divergencia respecto al BF16 (KL 0,059 en Q4 y 0,027 en Q5); en tareas sensibles a la fidelidad conviene validar el comportamiento frente al modelo original.
- El Q5 se evaluo sobre token IDs distintos, por lo que su ventaja frente al Q4 no esta medida de forma pareada.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o cobertura idiomatica del modelo base en la documentacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce si el modelo base impone restricciones adicionales que deban heredarse.
- El autor advierte que los ejemplos de inferencia se probaron primero en el pack de 9B; en este pack solo se verificaron, el 12 de noviembre de 2026, una respuesta de chat y una llamada a herramienta con mlx-lm 0.32.2 y LM Studio.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-Q4-KQuant)
- [Modelo base Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Repositorio Kapitsa](https://github.com/nace-ai/kapitsa)
- [Checkpoint Q4](https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX/tree/main/Q4)
- [Checkpoint Q5](https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX/tree/main/Q5)

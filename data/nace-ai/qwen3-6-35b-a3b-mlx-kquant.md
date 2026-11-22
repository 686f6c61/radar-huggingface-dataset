# nace-ai/Qwen3.6-35B-A3B-MLX-KQuant

## Resumen

Qwen3.6-35B-A3B-MLX-KQuant es una cuantización de precisión mixta en formato MLX del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario nace-ai. Está pensada específicamente para inferencia en Apple Silicon (Macs con chip M-series), usando la librería mlx de Apple. El modelo base es un transformer con arquitectura MoE (mixture of experts) de tipo qwen3_5_moe, con 35.107.181.936 parámetros totales y un pipeline declarado de image-text-to-text, lo que indica capacidades multimodales de entrada imagen y salida texto.

El pack incluye dos checkpoints cuantizados: Q4 (uniforme de 4 bits, 21,0 GB, con gates del router en 8 bits) y Q5 (precisión mixta 4/6/8 bits por tensor, unos 4,6 bits por peso, 23,0 GB). El autor reporta una divergencia KL respecto al modelo BF16 de 0,059 para Q4 y 0,027 para Q5, y afirma que su Q4 está un 1,6× más cerca del BF16 original que el pack de 4 bits de mlx-community (KL 0,059 frente a 0,096) al mismo tamaño de pesos del modelo de lenguaje (19,51 GB).

La relevancia de este lanzamiento es práctica: permite ejecutar un MoE de 35B parámetros en Macs con 48 GB de RAM o más, con APIs compatibles con OpenAI, Anthropic y Ollama a través del motor Kapitsa del propio autor, o mediante mlx-lm y LM Studio. La licencia Apache 2.0 del modelo base facilita el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4 (4 bits uniforme, gates del router en 8 bits); Q5 (mixta 4/6/8 bits por tensor, ~4,6 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) identificado en los tags como qwen3_5_moe. El pack cuantizado conserva la topología del modelo original y aplica cuantización de precisión mixta: en Q4 los pesos se cuantizan de forma uniforme a 4 bits, mientras que los gates del router se mantienen en 8 bits (igual que hace mlx-lm); en Q5 se aplican 4, 6 u 8 bits por tensor según su sensibilidad, resultando en unos 4,6 bits por peso (5,1 contando escalas). El autor reporta divergencia KL frente a BF16 de 0,059 (Q4) y 0,027 (Q5).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en el modelo base. Tampoco se detallan innovaciones de decodificación especulativa o atención lineal. El modelo base incorpora un modo de razonamiento (thinking) activado por defecto, que devuelve el contenido en el campo `reasoning_content` y puede desactivarse con `reasoning_effort: "none"` o `enable_thinking: false`.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo thinking activado por defecto (salida separada en `reasoning_content`).
- Entrada multimodal de imagen y texto (pipeline image-text-to-text): acepta imágenes como URL http(s) o data URL base64 en el formato `image_url` de OpenAI.
- Tool calling / function calling, verificado por el autor con mlx-lm 0.32.2 a través de `mlx_lm.server` y con LM Studio.
- Servido mediante APIs compatibles con OpenAI, Anthropic y Ollama a través de Kapitsa.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Aritmética y tareas de razonamiento sencillas (el ejemplo de la model card es 17 × 23).

## Casos de uso

- Asistente conversacional local en Mac: con 21-23 GB de pesos y un requisito de 48 GB de RAM o más, se puede servir un chat privado en local mediante Kapitsa con `--private`, sin enviar datos a la nube.
- Automatización de atención al cliente con contexto de conversación: el soporte de APIs compatibles con OpenAI y Anthropic permite integrarlo en backends existentes sin cambiar el código del cliente.
- Procesamiento de documentos con imágenes: el pipeline image-text-to-text permite enviar capturas, escaneos o diagramas como `image_url` y obtener descripciones o extracción de información en texto.
- Agentes con tool calling: el modelo coloca llamadas a herramientas a través de `mlx_lm.server` o Kapitsa, lo que permite construir flujos de agente que consulten APIs externas o ejecuten funciones locales.
- Razonamiento asistido con thinking mode: para tareas de matemáticas o lógica se puede dejar el modo thinking activado y consumir `reasoning_content` por separado del texto final.
- Desarrollo y prototipado en Apple Silicon: investigadores que trabajan en Mac pueden evaluar un MoE de 35B sin GPU dedicada, usando mlx-lm o LM Studio para pruebas rápidas.
- Despliegue de bajo coste en estaciones de trabajo Mac: al no requerir GPU NVIDIA, se puede montar un servicio interno de inferencia en un Mac Studio con 64 GB o más de memoria unificada.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad de cuantización (divergencia KL frente a BF16), no benchmarks de tareas:

| Checkpoint | Bits | Tamaño descarga | KL a BF16 | RAM recomendada |
|---|---|---|---|---|
| Q4 | 4 bits uniforme (router 8 bits) | 21,0 GB | 0,059 | 48 GB+ |
| Q5 | mixta 4/6/8 bits (~4,6 bits/peso) | 23,0 GB | 0,027 | 48 GB+ |
| mlx-community 4-bit (referencia) | 4 bits | mismo tamaño que Q4 | 0,096 | no disponible |
| unsloth UD-3bit (referencia) | 3 bits | no disponible | no disponible | no disponible |

El autor indica que Q5 se evaluó sobre token IDs distintos al resto, por lo que no reclama una ganancia pareada para ese checkpoint. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- RAM: el autor estima que Q4 y Q5 necesitan un Mac con 48 GB de RAM o más; el cálculo asume que macOS asigna por defecto aproximadamente 2/3 de la RAM a la GPU y se reservan 2 GB para la conversación.
- GPU: Apple Silicon exclusivamente (mlx). No hay soporte para CUDA, A100, H100 ni RTX 4090 en este pack.
- Consumer: cabe en Macs con memoria unificada de 48 GB o superior (por ejemplo, Mac Studio o MacBook Pro de gama alta). Kapitsa puede saltarse partes no usadas y caber en una talla menos; `kapitsa doctor` verifica un Mac concreto.
- Despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa`, `kapitsa pull 35b:4bit`, `kapitsa serve`), mlx-lm (`mlx_lm.generate`, `mlx_lm.server`) y LM Studio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-MLX-KQuant (Q4/Q5) | 35,1B totales | no disponible | MLX 4/5 bits | apache-2.0 | Hugging Face (nace-ai) |
| mlx-community 4-bit (Qwen3.6-35B-A3B) | mismo base | no disponible | MLX 4 bits | apache-2.0 (base) | Hugging Face (mlx-community) |
| unsloth UD-3bit (Qwen3.6-35B-A3B) | mismo base | no disponible | 3 bits | apache-2.0 (base) | Hugging Face (unsloth) |

La comparación se limita a packs de cuantización del mismo modelo base; el autor solo aporta la métrica KL para Q4 (0,059 frente a 0,096 de mlx-community). No se dispone de datos de rendimiento en tareas para comparar.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con la librería mlx; no es desplegable en GPU NVIDIA ni en servidores x86 convencionales.
- El requisito de 48 GB de RAM unificada limita su uso a equipos de gama alta.
- La cuantización introduce pérdida de fidelidad respecto a BF16 (KL 0,059 en Q4, 0,027 en Q5); para tareas sensibles a la precisión conviene evaluar el checkpoint Q5 o el modelo original.
- La model card advierte que varios ejemplos de inferencia se probaron primero en el pack de 9B y solo algunos se verificaron en este pack de 35B; conviene validar el comportamiento real antes de producción.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgo de alucinación específicos de este modelo.
- El modelo base es Apache 2.0, por lo que el uso comercial está permitido; sin embargo, el autor del pack no detalla condiciones adicionales más allá de heredar la licencia del base.
- El modo thinking está activado por defecto y consume tokens adicionales; en producción conviene desactivarlo con `reasoning_effort: "none"` cuando no sea necesario.
- No se han publicado benchmarks de tareas, por lo que la calidad en MMLU, HumanEval o GSM8K no está verificada de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio Kapitsa: https://github.com/nace-ai/kapitsa
- Pack de referencia del autor (sin KQuant): https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX

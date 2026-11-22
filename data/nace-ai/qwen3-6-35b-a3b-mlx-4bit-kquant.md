# nace-ai/Qwen3.6-35B-A3B-MLX-4bit-KQuant

## Resumen

Qwen3.6-35B-A3B-MLX-4bit-KQuant es una cuantización de 4 bits del modelo Qwen3.6-35B-A3B de Alibaba Qwen, publicada por el usuario nace-ai y empaquetada específicamente para Apple Silicon mediante la librería MLX. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 35.107.181.936 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (según la nomenclatura A3B). El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de entrada de imagen y texto.

La relevancia de esta publicación reside en su estrategia de cuantización: el autor afirma que su variante Q4 logra una divergencia KL de 0,059 frente al modelo BF16 original, frente a 0,096 de la cuantización de 4 bits de mlx-community, manteniendo el mismo tamaño de pesos del modelo de lenguaje (19,51 GB). Es decir, se presenta como una alternativa más fiel al modelo original sin coste adicional de memoria. El repositorio incluye dos checkpoints (Q4 y Q5) y suma 38.398 descargas en el momento de la consulta.

El modelo se distribuye bajo licencia Apache 2.0 y está pensado para ejecutarse localmente en Macs con Apple Silicon, con un tamaño de repositorio de 44,0 GB que contiene ambos packs de cuantización. La información sobre idiomas soportados no está disponible en los metadatos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (según tag `qwen3_5_moe`); detalles internos no disponibles |
| Parametros totales | 35.107.181.936 |
| Parametros activos | aproximadamente 3.000 millones (según nomenclatura A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit uniforme (Q4, gates del router en 8-bit) y mixta 4/6/8-bit (Q5, ~4,6 bits por peso, 5,1 contando escalas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), organizados en los directorios `Q4/` y `Q5/` |

## Arquitectura y entrenamiento

El modelo base es Qwen3.6-35B-A3B, un transformer con arquitectura mixture-of-experts según el tag `qwen3_5_moe`. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones arquitectónicas internas como atención lineal o decodificación especulativa. El pipeline image-text-to-text confirma que el modelo acepta imágenes además de texto.

La contribución técnica de esta publicación es la cuantización. El checkpoint Q4 aplica cuantización uniforme de 4 bits con los gates del router en 8 bits, replicando el esquema de mlx-lm, y ocupa 21,0 GB en descarga (19,51 GB de pesos del modelo de lenguaje). El checkpoint Q5 usa precisión mixta de 4, 6 y 8 bits por tensor, con unos 4,6 bits por peso (5,1 contando escalas), y ocupa 23,0 GB. El autor reporta una KL de 0,059 para Q4 y 0,027 para Q5 frente al modelo BF16; advierte que Q5 se evaluó sobre token IDs distintos, por lo que no reclama una ganancia emparejada para esa variante.

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento (thinking) activado por defecto y salida del razonamiento en el campo `reasoning_content`.
- Comprensión de imágenes: entrada mediante partes `image_url` en formato OpenAI, tanto por URL http(s) como por data URL en base64.
- Tool calling / function calling: verificado en el pack mediante `mlx_lm.server` y LM Studio, que colocaron correctamente una llamada a herramienta.
- Razonamiento matemático básico y resolución de problemas aritméticos (el ejemplo de la model card usa 17 × 23).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo sin razonamiento configurable mediante `reasoning_effort: "none"` o `chat_template_kwargs: {"enable_thinking": false}`, con parámetros de muestreo distintos recomendados (temperatura 0,7, top_p 0,8 frente a 1,0 y 0,95 en modo thinking).
- Servido mediante API compatible con OpenAI, Anthropic y Ollama a través del motor Kapitsa.

## Casos de uso

- Asistente local en Mac: con el pack Q4 de 21,0 GB, un Mac de 48 GB o más puede servir un chat conversacional completo con API compatible con OpenAI en localhost, sin dependencia de la nube y con privacidad de datos.
- Análisis de imágenes en escritorio: el modelo acepta imágenes por URL o base64 y puede describir o responder preguntas sobre capturas, diagramas o fotografías, lo que permite construir herramientas de accesibilidad o catalogación de imágenes localmente.
- Automatización con tool calling: gracias a la compatibilidad con function calling verificada en `mlx_lm.server` y LM Studio, se puede integrar en agentes que consulten APIs externas, bases de datos o sistemas de ficheros desde un Mac.
- Razonamiento asistido con traza auditable: el modo thinking devuelve el razonamiento en `reasoning_content`, útil para depurar cadenas de razonamiento en tareas matemáticas o de planificación antes de mostrar la respuesta final.
- Prototipado de pipelines multimodales: al exponer una API compatible con OpenAI, Anthropic y Ollama vía Kapitsa, sirve como backend de sustitución en desarrollos que ya usan esos SDK, sin reescribir el código cliente.
- Evaluación de cuantizaciones: investigadores pueden comparar Q4 y Q5 del mismo repo frente a packs de mlx-community o unsloth usando la métrica KL reportada, para decidir el compromiso entre fidelidad y tamaño en sus propios despliegues.
- Chatbot de soporte en entornos con recursos limitados: el checkpoint Q5 de 23,0 GB ofrece mayor fidelidad al BF16 (KL 0,027) con un incremento de solo 2 GB, adecuado para Macs de 48 GB o más donde la calidad de respuesta prima sobre el espacio en disco.

## Benchmarks y rendimiento

La model card solo publica métricas de fidelidad de cuantización (divergencia KL frente a BF16), no benchmarks de tareas estándar como MMLU, HumanEval o GSM8K.

| Metrica | Q4 | Q5 | mlx-community 4-bit | unsloth UD-3bit |
|---|---|---|---|---|
| KL frente a BF16 (menor es mejor) | 0,059 | 0,027 | 0,096 | no disponible |
| Tamano de descarga | 21,0 GB | 23,0 GB | no disponible | no disponible |
| Bits por peso | 4 (router 8) | ~4,6 (5,1 con escalas) | 4 | 3 (UD) |

El autor indica que Q4 es 1,6 veces más cercano al BF16 que el pack de 4 bits de mlx-community (0,059 frente a 0,096) con el mismo tamaño de pesos del modelo de lenguaje. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el pack Q4 requiere 21,0 GB de descarga y el Q5 23,0 GB. El autor estima que ambos caben en Macs de 48 GB o más, aplicando la regla de que macOS asigna por defecto alrededor de dos tercios de la RAM a la GPU y dejando 2 GB para la conversación.
- GPU recomendadas: exclusivamente Apple Silicon; el formato MLX no está pensado para GPU NVIDIA o AMD. No se especifican chips concretos (M1, M2, M3, M4) en la información disponible.
- Cabe en GPU de consumo: sí, en Macs con Apple Silicon y 48 GB de memoria unificada o más. El autor señala que Kapitsa omite las partes que no usa y puede caber en una talla menos; el comando `kapitsa doctor` comprueba si un Mac concreto es suficiente.
- Opciones de despliegue: Kapitsa (motor propio de Nace, instalable con `brew install nace-ai/tap/kapitsa`, con APIs OpenAI, Anthropic y Ollama), mlx-lm (`mlx_lm.generate`, `mlx_lm.server` en el puerto 8080) y LM Studio (verificado con chat, lectura de imagen y tool calling).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nace-ai/Qwen3.6-35B-A3B-MLX-4bit-KQuant (Q4) | 35,1 B totales, ~3 B activos | no disponible | Apache 2.0 | MLX safetensors | KL 0,059; 21,0 GB |
| nace-ai/Qwen3.6-35B-A3B-MLX (Q5) | 35,1 B totales, ~3 B activos | no disponible | Apache 2.0 | MLX safetensors | KL 0,027; 23,0 GB |
| mlx-community 4-bit (Qwen3.6-35B-A3B) | 35,1 B totales, ~3 B activos | no disponible | Apache 2.0 (presumible) | MLX safetensors | KL 0,096; mismo tamaño de pesos que Q4 |
| unsloth UD-3bit (Qwen3.6-35B-A3B) | 35,1 B totales, ~3 B activos | no disponible | Apache 2.0 (presumible) | MLX safetensors | 3 bits; KL no disponible en la información |

Las alternativas comparadas son otras cuantizaciones del mismo modelo base Qwen3.6-35B-A3B, ya que no se dispone de datos de modelos de distinta familia en la información proporcionada. La ventaja declarada del pack de nace-ai es una menor divergencia KL a igual tamaño en el caso Q4.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon: el formato MLX y la librería `mlx` no son compatibles con GPU NVIDIA, AMD ni con CPU x86 convencional, lo que limita su despliegue en servidores tradicionales.
- La model card advierte que solo algunas pruebas se ejecutaron realmente sobre este pack de 35B (chat y tool calling en mlx-lm 0.32.2 y LM Studio, el 12 de noviembre de 2026); el resto de ejemplos se probaron primero en el pack de 9B, por lo que su funcionamiento sobre este modelo no está verificado.
- La métrica de fidelidad Q5 se calculó sobre token IDs distintos a los de los demás packs, según el propio autor, por lo que no es directamente comparable de forma emparejada.
- Las estimaciones de memoria ("Fits") son reglas heurísticas, no mediciones; el autor recomienda verificar con `kapitsa doctor`.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación; al ser una cuantización de 4 bits, cabe esperar cierta degradación respecto al BF16, cuantificada en la KL reportada pero no evaluada en tareas concretas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B antes de desplegarlo en producción.
- El modo thinking está activado por defecto y consume tokens adicionales; en entornos de baja latencia debe desactivarse explícitamente con `reasoning_effort: "none"`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-4bit-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Librería MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm

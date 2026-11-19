# nace-ai/Qwen3.6-35B-A3B-MLX-Q4-KQuant

## Resumen

Qwen3.6-35B-A3B-MLX-Q4-KQuant es una cuantización de 4 bits del modelo Qwen3.6-35B-A3B de Alibaba Qwen, publicada por el usuario nace-ai y empaquetada en formato MLX para su ejecución nativa en Apple Silicon. El modelo base es un transformer de tipo MoE (mezcla de expertos) con 35.107.181.936 parámetros totales y un subconjunto de parámetros activos por token, orientado a tareas de texto e imagen-texto (pipeline image-text-to-text). La cuantización emplea la técnica propietaria "Kapitsa" del autor, que combina precisión uniforme de 4 bits con gates del router en 8 bits.

La relevancia de esta ficha radica en que ofrece una alternativa a los packs de 4 bits de mlx-community con una divergencia menor respecto al modelo BF16 original: según la model card, la KL divergence frente a BF16 es de 0,059 para este Q4, frente a 0,096 del pack de mlx-community de 4 bits, con el mismo tamaño de pesos del modelo de lenguaje (19,51 GB). El repo completo ocupa 44,0 GB e incluye dos checkpoints (Q4 y Q5) listos para descarga independiente.

La licencia Apache 2.0 del modelo base se mantiene, lo que permite uso comercial. El modelo está pensado para Macs con Apple Silicon de 48 GB de RAM o más, y se sirve mediante Kapitsa (motor propio del autor con APIs OpenAI, Anthropic y Ollama) o mlx-lm. No se dispone de información sobre idiomas soportados ni sobre resultados de benchmarks en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), familia Qwen3.5/3.6; librería mlx |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible (el nombre "A3B" sugiere ~3B activos, pero no se confirma en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4 (4 bits uniforme, gates del router en 8 bits); Q5 (precisión mixta 4/6/8 bits por tensor, ~4,6 bits por peso, 5,1 contando escalas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 44,0 GB; Q4 21,0 GB, Q5 23,0 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura de mezcla de expertos (MoE), tal como indica la etiqueta `qwen3_5_moe` y el nombre del checkpoint. Los 35.107 millones de parámetros totales se distribuyen entre expertos, de los cuales solo un subconjunto se activa por token (el sufijo "A3B" apunta a unos 3.000 millones de parámetros activos, aunque este dato no se confirma en la información disponible). El pipeline declarado es image-text-to-text, lo que implica capacidad de procesamiento de imágenes además de texto.

Sobre el entrenamiento del modelo base no se proporcionan datos en la información disponible: no se especifican el número de tokens, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras. La innovación técnica documentada en esta ficha corresponde a la cuantización: el autor aplica la técnica Kapitsa, que en Q4 mantiene gates del router en 8 bits (igual que mlx-lm) y en Q5 usa precisión mixta por tensor. La model card reporta que el Q4 queda a una KL de 0,059 frente a BF16, aproximadamente 1,6 veces más cerca que el pack de 4 bits de mlx-community (KL 0,096) con idéntico tamaño de pesos del modelo de lenguaje.

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento ("thinking") activado por defecto y salida del razonamiento en el campo `reasoning_content` o `reasoning` según el servidor.
- Procesamiento de imagen-texto: acepta imágenes como URL http(s) o data URL base64 en el formato `image_url` de OpenAI, lo que habilita tareas de descripción y comprensión visual.
- Tool calling / function calling: verificado en mlx-lm 0.32.2 mediante `mlx_lm.server` y en LM Studio sobre este mismo pack.
- Razonamiento matemático básico y resolución de problemas aritméticos (el ejemplo canónico de la model card es 17 × 23).
- Modo sin razonamiento configurable mediante `reasoning_effort: "none"` o `chat_template_kwargs: {"enable_thinking": false}`, con parámetros de muestreo distintos (temperatura 0,7, top_p 0,8 frente a 1,0 y 0,95 en modo thinking).
- Servicio mediante APIs compatibles con OpenAI, Anthropic y Ollama a través de Kapitsa.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se sirve con Kapitsa en `127.0.0.1:8000` con página de chat incluida, lo que permite disponer de un asistente privado (`--private`) sin enviar datos a la nube, adecuado para entornos con requisitos de confidencialidad.
- Análisis de imágenes en flujos de trabajo de escritorio: la entrada `image_url` permite enviar capturas, diagramas o fotografías y obtener descripciones o respuestas contextualizadas, integrándose en herramientas internas que ya hablan el formato OpenAI.
- Automatización de tareas con tool calling: al colocar llamadas a funciones de forma fiable (verificado en mlx-lm y LM Studio), el modelo puede orquestar scripts locales, consultas a APIs internas o acciones sobre ficheros en pipelines de agentes.
- Razonamiento matemático y verificación: el modo thinking por defecto resulta útil para cálculos, comprobaciones aritméticas y problemas de varios pasos donde conviene que el modelo explicite el razonamiento antes de responder.
- Desarrollo de prototipos de agentes multi-paso: la combinación de contexto conversacional, tool calling y modo thinking permite construir bucles de razonamiento-acción sobre APIs locales compatibles con OpenAI, sin dependencia de proveedores externos.
- Evaluación comparativa de cuantizaciones: investigadores que estudian el impacto de la cuantización pueden usar los checkpoints Q4 y Q5 de este repo, junto con la métrica KL frente a BF16 publicada, para medir la degradación de calidad en sus propios conjuntos de evaluación.
- Despliegue de servicios internos compatibles con OpenAI: `mlx_lm.server` en el puerto 8080 y Kapitsa exponen endpoints `/v1/chat/completions`, lo que permite sustituir un backend remoto por inferencia local en Apple Silicon sin reescribir los clientes.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). El único dato de calidad reportado es la divergencia KL frente al modelo BF16 original:

| Checkpoint | Bits | Tamaño de descarga | KL frente a BF16 (menor es mejor) | RAM mínima orientativa |
|---|---|---|---|---|
| Q4 | 4 bits uniformes | 21,0 GB | 0,059 | 48 GB+ |
| Q5 | mixta 4/6/8 bits (~4,6 bits/peso) | 23,0 GB | 0,027 | 48 GB+ |
| mlx-community 4-bit (referencia) | 4 bits | no disponible | 0,096 | no disponible |

El autor advierte que el Q5 se evaluó con token IDs distintos de los demás, por lo que no se reclama una mejora emparejada para él. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos del modelo de lenguaje del Q4 ocupan 19,51 GB; la descarga completa del Q4 es de 21,0 GB y la del Q5 de 23,0 GB. La model card indica que ambos encajan en Macs de 48 GB de RAM o más, como regla orientativa (no medida) basada en que macOS asigna por defecto alrededor de dos tercios de la RAM a la GPU y se reservan 2 GB para una conversación.
- GPU recomendadas: Apple Silicon exclusivamente (formato MLX); no se documenta compatibilidad con A100, H100 ni RTX 4090, que no pueden ejecutar MLX de forma nativa.
- Cabe en GPU de consumo: sí, en Macs con Apple Silicon y 48 GB o más de memoria unificada. Kapitsa puede omitir partes que no usa y encajar en una talla menos; `kapitsa doctor` comprueba la idoneidad de un Mac concreto.
- Opciones de despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa`, `kapitsa pull 35b:4bit`, `kapitsa serve --model 35b:4bit --private`), mlx-lm (`mlx_lm.generate`, `mlx_lm.server` en el puerto 8080, API Python con `load`/`generate`) y LM Studio (`lms get`). No se documenta soporte para vLLM, llama.cpp, Ollama nativo ni TGI.
- Latencia y throughput: no disponibles; la model card no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (KL frente a BF16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nace-ai Qwen3.6-35B-A3B-MLX Q4 (este) | 35,1 B totales | no disponible | 0,059 | Apache 2.0 | Hugging Face, 21,0 GB |
| nace-ai Qwen3.6-35B-A3B-MLX Q5 | 35,1 B totales | no disponible | 0,027 | Apache 2.0 | Hugging Face, 23,0 GB |
| mlx-community 4-bit (Qwen3.6-35B-A3B) | 35,1 B totales (base) | no disponible | 0,096 | Apache 2.0 (base) | Hugging Face |
| unsloth UD-3bit (Qwen3.6-35B-A3B) | 35,1 B totales (base) | no disponible | no disponible | Apache 2.0 (base) | Hugging Face |

La comparativa se limita a packs de cuantización del mismo modelo base, ya que la información disponible no incluye modelos alternativos de otros fabricantes ni datos de rendimiento en tareas que permitan comparaciones más amplias.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon mediante MLX; no es desplegable en GPUs NVIDIA ni en entornos x86 convencionales.
- La cuantización introduce degradación respecto a BF16 (KL 0,059 en Q4 y 0,027 en Q5); para tareas sensibles a la precisión conviene validar el checkpoint concreto en el dominio de uso.
- La estimación de RAM de 48 GB+ es una regla orientativa del autor, no una medición; debe verificarse con `kapitsa doctor` antes de desplegar.
- La model card advierte que varios ejemplos de inferencia se probaron originalmente en el pack de 9B y solo se verificaron sobre este pack un chat, una llamada a herramientas y una lectura de imagen con mlx-lm 0.32.2 y LM Studio; otras combinaciones pueden no estar validadas.
- No se dispone de información sobre sesgos, idiomas soportados ni robustez multilingüe, lo que impide evaluar el riesgo de sesgo o de alucinación específico de este checkpoint.
- El modelo piensa antes de responder por defecto, lo que incrementa el consumo de tokens y la latencia; en producción conviene desactivar el modo thinking cuando no sea necesario.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las condiciones de atribución y las posibles restricciones del modelo base Qwen3.6-35B-A3B, cuya model card no se detalla aquí.
- El repo tiene 44,0 GB; descargar solo la carpeta del checkpoint deseado (`--include "Q4/*"` o `"Q5/*"`) para evitar transferencias innecesarias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-Q4-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio Kapitsa: https://github.com/nace-ai/kapitsa
- Instalación de Kapitsa vía Homebrew: `brew install nace-ai/tap/kapitsa`
- Referencia de assets de la model card: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX/resolve/main/assets/nace-dark.svg y https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX/resolve/main/assets/nace-light.svg
- Packs de cuantización de referencia: mlx-community (4-bit) y unsloth (UD-3bit), citados en la model card sin URL directa en la información disponible.

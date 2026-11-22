# nace-ai/Qwen3.6-35B-A3B-MLX

## Resumen

Qwen3.6-35B-A3B-MLX es una cuantización en formato MLX del modelo Qwen3.6-35B-A3B de Alibaba Qwen, empaquetada por nace-ai para su ejecución en Apple Silicon. El modelo base es un transformer de mezcla de expertos (MoE) con 35.107.181.936 parámetros totales, de los cuales 3.000 millones son activos por token (de ahí el sufijo A3B), orientado a tareas multimodales de imagen-texto y conversación. Esta versión concreta no modifica los pesos conceptualmente, sino que los comprime a 4 y 5 bits para que quepan en Macs con memoria unificada de 48 GB o más.

La relevancia de este pack radica en la metodología de cuantización empleada: el autor reporta una divergencia KL de 0.059 para Q4 frente a 0.096 de la alternativa de mlx-community al mismo tamaño (19,51 GB de pesos del modelo de lenguaje), es decir, aproximadamente 1,6 veces más cercano al modelo BF16 original. Para Q5, con precisión mixta de 4/6/8 bits por tensor (~4,6 bits por peso), la KL baja a 0.027. El repositorio incluye además integración con Kapitsa, el motor de inferencia propio de Nace para modelos Qwen en macOS, que expone APIs compatibles con OpenAI, Anthropic y Ollama.

El modelo está publicado bajo licencia Apache 2.0 y acumula 38.398 descargas, lo que indica una adopción notable en el ecosistema de inferencia local en Apple Silicon. No obstante, la información disponible no detalla la longitud de contexto, los idiomas soportados ni resultados de benchmarks del modelo base, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo qwen3_5_moe) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | 3.000 millones (aproximado, segun sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (4-bit uniforme, gates del router en 8-bit), Q5 (mixta 4/6/8-bit por tensor, ~4,6 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX |
| Tamano del repo | 44,0 GB |
| Tamano de descarga Q4 | 21,0 GB |
| Tamano de descarga Q5 | 23,0 GB |
| Biblioteca de inferencia | mlx (mlx-lm, Kapitsa, LM Studio) |
| Modalidad | image-text-to-text |
| Modelo base | Qwen/Qwen3.6-35B-A3B |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) dentro de la familia qwen3_5_moe, con 35.107 millones de parámetros totales y aproximadamente 3.000 millones activos por token. Esta configuración permite un coste computacional por token similar al de un modelo denso de 3B mientras se preserva la capacidad representacional de un modelo de 35B. El pipeline declarado es image-text-to-text, lo que confirma que el modelo base incorpora codificador visual y es capaz de procesar entradas multimodales. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o decodificación especulativa.

La contribución técnica de este repositorio no está en el entrenamiento sino en la cuantización. El pack Q4 usa cuantización uniforme de 4 bits con los gates del router en 8 bits, replicando el esquema de mlx-lm, mientras que Q5 aplica precisión mixta asignando 4, 6 u 8 bits según el tensor, con un promedio de 4,6 bits por peso (5,1 contando escalas). El autor reporta métricas de divergencia KL frente al modelo BF16 original: 0.059 para Q4 y 0.027 para Q5. La comparación con mlx-community 4-bit (KL 0.096) al mismo tamaño de pesos del modelo de lenguaje sugiere una asignación de bits más eficiente, aunque la puntuación de Q5 se realizó sobre token IDs distintos, por lo que el autor no reclama una ganancia emparejada para ese checkpoint.

## Capacidades

- Generación de texto conversacional multi-turno con soporte de plantilla de chat.
- Razonamiento con modo de pensamiento (thinking) activado por defecto; la salida de razonamiento se devuelve en el campo `reasoning_content`.
- Desactivación del modo thinking mediante `reasoning_effort: "none"` o `chat_template_kwargs: {"enable_thinking": false}`, con parámetros de muestreo alternativos (temperatura 0.7, top_p 0.8 frente a 1.0 y 0.95 en modo thinking).
- Comprensión de imágenes: acepta entradas `image_url` como URL http(s) o data URL base64, con pipeline image-text-to-text.
- Tool calling / function calling: verificado a través de `mlx_lm.server` y LM Studio según la model card.
- Razonamiento matemático básico (el ejemplo de la card usa `17 * 23`).
- Compatibilidad con APIs OpenAI, Anthropic y Ollama a través de Kapitsa, y con la API OpenAI de `mlx_lm.server`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explícitamente en la información disponible.

## Casos de uso

- Asistente conversacional local en macOS: el pack Q4 (21 GB) cabe en Macs de 48 GB o más y permite servir un chat con API compatible con OpenAI mediante Kapitsa o `mlx_lm.server`, sin enviar datos a la nube.
- Análisis de imágenes en local: gracias al pipeline image-text-to-text y la aceptación de `image_url` en base64, se puede usar para describir capturas, extraer texto de imágenes o responder preguntas sobre documentos escaneados sin conexión.
- Automatización con tool calling: la verificación de function calling en `mlx_lm.server` y LM Studio permite integrar el modelo en flujos que consulten APIs externas, bases de datos locales o scripts del sistema.
- Razonamiento asistido con thinking mode: para tareas que requieren pasos intermedios (cálculo, planificación, depuración lógica), el modo thinking por defecto expone el razonamiento en `reasoning_content`, útil para auditar la cadena de decisión.
- Prototipado de agentes sobre Apple Silicon: la disponibilidad de APIs compatibles con OpenAI, Anthropic y Ollama en Kapitsa facilita migrar prototipos existentes sin reescribir el cliente.
- Evaluación de cuantizaciones: investigadores pueden comparar Q4 (KL 0.059) y Q5 (KL 0.027) frente a BF16 y frente a packs de mlx-community o unsloth para decidir el equilibrio entre tamaño y fidelidad en sus pipelines.
- Despliegue en estaciones de trabajo Mac para equipos pequeños: el tamaño de 21-23 GB y la licencia Apache 2.0 permiten uso comercial interno sin coste de licencia.

## Benchmarks y rendimiento

La información disponible no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para el modelo base ni para las cuantizaciones. El único dato cuantitativo de rendimiento publicado es la divergencia KL frente al modelo BF16:

| Checkpoint | Bits | Tamano descarga | KL a BF16 (menor es mejor) | Peso LM |
|---|---|---|---|---|
| Nace Q4 | 4-bit uniforme | 21,0 GB | 0.059 | 19,51 GB |
| Nace Q5 | 4/6/8-bit mixto (~4,6 bpw) | 23,0 GB | 0.027 | no disponible |
| mlx-community 4-bit | 4-bit | no disponible | 0.096 | 19,51 GB |
| unsloth UD-3bit | 3-bit | no disponible | no disponible | no disponible |

Nota: la puntuación de Q5 se realizó sobre token IDs distintos al resto, por lo que el autor no reclama una ganancia emparejada.

## Requisitos de hardware

- VRAM/RAM unificada estimada: 48 GB o más para Q4 y Q5 según la regla del autor (descarga + 2 GB para conversación, asumiendo que macOS asigna ~2/3 de la RAM a la GPU). Kapitsa puede saltarse partes no usadas y caber en una talla inferior; `kapitsa doctor` verifica un Mac concreto.
- GPU recomendadas: Apple Silicon con memoria unificada de 48 GB o más (familias M-series Pro, Max y Ultra). No aplica a GPUs NVIDIA o AMD, ya que el formato MLX es específico de Apple Silicon.
- Cabe en consumer GPU: sí, en Macs consumer de gama alta con 48 GB o más de memoria unificada. No es compatible con GPUs de consumo NVIDIA/AMD por el formato.
- Opciones de despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa`, `kapitsa serve`), mlx-lm (`mlx_lm.generate`, `mlx_lm.server` en puerto 8080), LM Studio. Compatible con APIs OpenAI, Anthropic y Ollama a través de Kapitsa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL a BF16 | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-MLX (Nace Q4) | 35,1B totales / ~3B activos | no disponible | 4-bit MLX | 0.059 | Apache 2.0 | Apple Silicon |
| Qwen3.6-35B-A3B-MLX (Nace Q5) | 35,1B totales / ~3B activos | no disponible | 4/6/8-bit MLX | 0.027 | Apache 2.0 | Apple Silicon |
| mlx-community 4-bit (Qwen3.6-35B-A3B) | 35,1B totales / ~3B activos | no disponible | 4-bit MLX | 0.096 | Apache 2.0 (heredada) | Apple Silicon |
| unsloth UD-3bit (Qwen3.6-35B-A3B) | 35,1B totales / ~3B activos | no disponible | 3-bit dinámico | no disponible | Apache 2.0 (heredada) | no disponible |

La comparación se limita a packs de cuantización del mismo modelo base, ya que la información disponible no incluye modelos alternativos de otras familias con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Exclusivo de Apple Silicon: el formato MLX no es portable a GPUs NVIDIA, AMD ni a CPU x86 de forma directa; limita el despliegue a Macs.
- Requisito de memoria elevado: 48 GB o más de memoria unificada para Q4 y Q5; no cabe en Macs de 16 o 24 GB.
- Divergencia respecto a BF16: aunque Q4 y Q5 son más fieles que la alternativa de mlx-community, siguen siendo cuantizaciones y pueden degradar tareas sensibles a precisión numérica o razonamiento largo.
- Sin datos de benchmarks: no se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible, lo que impide validar capacidades frente a otros modelos.
- Idiomas y contexto no documentados: se desconoce la ventana de contexto efectiva y la cobertura lingüística, lo que dificulta planificar su uso en producción multilingüe o con documentos largos.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas en la model card.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.6-35B-A3B por si hubiera restricciones adicionales no reflejadas en este pack.
- Dependencia de Kapitsa para algunas funciones: la verificación de tool calling y de lectura de imágenes se realizó con mlx-lm 0.32.2 y LM Studio, pero otros ejemplos de la card solo se probaron en el pack de 9B, no en este de 35B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Checkpoint Q4: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX/tree/main/Q4
- Checkpoint Q5: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX/tree/main/Q5
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Biblioteca mlx-lm: https://github.com/ml-explore/mlx-lm

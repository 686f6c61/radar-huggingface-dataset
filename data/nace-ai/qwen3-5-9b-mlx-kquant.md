# nace-ai/Qwen3.5-9B-MLX-KQuant

## Resumen
Qwen3.5-9B-MLX-KQuant es una cuantización de 4 bits del modelo Qwen3.5-9B de Alibaba Qwen, empaquetada en formato MLX para su ejecución en Macs con Apple Silicon. La desarrolla nace-ai, que aplica su propio esquema de cuantización denominado KQuant, orientado a minimizar la divergencia respecto al modelo original en BF16 en comparación con otros packs de 4 bits de la comunidad. El resultado es un paquete de 6,2 GB con 9.409.813.744 parámetros totales que cubre texto e imagen (pipeline image-text-to-text).

La relevancia del modelo reside en su relación calidad/tamaño dentro del ecosistema MLX: según la model card, se sitúa 2,7 veces más cerca del BF16 original que el pack de 4 bits de mlx-community (KL de 0,030 frente a 0,081), manteniendo un 5 % más de peso del modelo de lenguaje (5,29 GB frente a 5,04 GB). Es, por tanto, una opción pensada para desarrolladores que quieren ejecutar localmente un modelo multimodal de 9B en hardware de Apple con la menor degradación posible.

El modelo hereda las capacidades del Qwen3.5-9B base: conversación multi-turno, razonamiento con modo "thinking" activado por defecto, tool calling y entrada de imágenes. La licencia Apache 2.0 facilita su uso comercial, aunque la model card solo declara inglés como idioma soportado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), cuantizado con KQuant; arquitectura interna del base no detallada en la información disponible |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (el ejemplo de LM Studio usa `--context-length 32768`, pero no se confirma como máximo oficial) |
| Tipos de cuantización | 4 bits (KQuant Q4); la model card menciona también una variante KQuant Q5 |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del Qwen3.5-9B base ni su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí documenta la model card es el trabajo de cuantización: nace-ai aplica KQuant, un esquema de 4 bits que, según sus mediciones, reduce la divergencia KL respecto al modelo BF16 original a 0,030, frente a 0,081 del pack de 4 bits de mlx-community. El paquete conserva un 5 % más de peso del modelo de lenguaje que esa alternativa (5,29 GB frente a 5,04 GB), lo que explica en parte la mejora de fidelidad.

El modelo base es multimodal (procesa texto e imagen) e incorpora un modo de razonamiento previo a la respuesta ("thinking") activado por defecto. La cuantización se distribuye como pack MLX nativo para Apple Silicon, con integración probada en Kapitsa, mlx-lm, mlx-vlm, LM Studio, SwiftLM, LocalAI, Osaurus, vllm-mlx, mlx-openai-server y llm-tool según la model card.

## Capacidades
- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" activado por defecto; la respuesta de razonamiento se devuelve en el campo `reasoning_content` (Kapitsa) o `reasoning` (mlx-lm).
- Desactivación del modo thinking mediante `reasoning_effort: "none"` o `enable_thinking: false` en la plantilla de chat.
- Comprensión de imágenes (image-text-to-text): acepta imágenes por URL http(s) o data URL base64 en el formato `image_url` de OpenAI.
- Tool calling / function calling: probado con éxito en Kapitsa, mlx-lm, mlx-vlm, LM Studio, SwiftLM, LocalAI, Osaurus, vllm-mlx y mlx-openai-server; Apple `llm-tool` respondió a chat pero no colocó tool call.
- Capacidades matemáticas básicas verificadas en los ejemplos (multiplicación 17 × 23).
- Soporte multilingüe limitado: solo inglés declarado.
- Compatibilidad con APIs OpenAI, Anthropic y Ollama a través de Kapitsa.

## Casos de uso
- Asistente conversacional local en Mac: el modelo se sirve con Kapitsa o mlx-lm en un Mac con Apple Silicon y ofrece una página de chat y APIs compatibles con OpenAI, Anthropic y Ollama, adecuado para prototipado y uso personal sin depender de la nube.
- Análisis de imágenes en local: mediante mlx-vlm o la API de Kapitsa se pueden enviar imágenes por URL o base64 y obtener descripciones o respuestas sobre su contenido, útil para catalogación de imágenes o accesibilidad.
- Automatización con tool calling: al colocar llamadas a herramientas de forma fiable en múltiples runtimes (LM Studio, LocalAI, vllm-mlx, mlx-openai-server), sirve para construir agentes que consulten APIs externas o ejecuten acciones en pipelines locales.
- Razonamiento asistido con modo thinking: para tareas que requieren pasos intermedios (cálculo, planificación, depuración) se activa el modo thinking por defecto y se recupera la traza de razonamiento en `reasoning_content`, lo que facilita la auditoría del proceso.
- Integración en aplicaciones macOS nativas: SwiftLM y Osaurus han respondido a chat con este pack, lo que permite incrustar el modelo en apps Swift o en entornos de escritorio de Apple sin salir del ecosistema MLX.
- Servidor compatible con OpenAI para desarrollo: `mlx_lm.server` expone un endpoint `/v1/chat/completions` en el puerto 8080, lo que permite sustituir una API remota por inferencia local durante el desarrollo de aplicaciones.
- Evaluación de cuantizaciones: investigadores que comparan esquemas de cuantización pueden usar este pack como referencia de KQuant Q4 frente a otras alternativas de 4 bits, con métricas KL publicadas en la model card.

## Benchmarks y rendimiento
La model card solo publica la métrica de divergencia KL respecto al modelo BF16 original. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Métrica | KQuant Q4 | mlx-community 4-bit |
|---|---|---|
| Divergencia KL respecto a BF16 | 0,030 | 0,081 |
| Peso del modelo de lenguaje (GB) | 5,29 | 5,04 |
| Tamaño total del repo (GB) | 6,2 | No disponible |

## Requisitos de hardware
- Hardware objetivo: Macs con Apple Silicon (el pack es MLX nativo); probado en un M5 Pro el 11 de noviembre de 2026.
- VRAM/unified memory estimada: el repo ocupa 6,2 GB en disco; se necesita al menos esa cantidad de memoria unificada más el overhead de inferencia y caché KV. Con contexto de 32.768 tokens conviene disponer de 16 GB o más de memoria unificada.
- GPU recomendadas: chips Apple Silicon (M1, M2, M3, M4, M5 y variantes Pro/Max/Ultra). No está pensado para GPUs NVIDIA o AMD.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon y memoria suficiente; no requiere GPU dedicada.
- Opciones de despliegue: Kapitsa (con APIs OpenAI, Anthropic y Ollama), mlx-lm (`mlx_lm.generate`, `mlx_lm.server`), mlx-vlm (para imágenes), LM Studio con motor MLX, SwiftLM, LocalAI con backend MLX, Osaurus, vllm-mlx, mlx-openai-server y Apple `llm-tool`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | KL vs BF16 | Peso LM (GB) | Licencia | Formato |
|---|---|---|---|---|---|---|
| nace-ai/Qwen3.5-9B-MLX-KQuant (este) | 9,41B | KQuant Q4 | 0,030 | 5,29 | Apache 2.0 | MLX safetensors |
| mlx-community 4-bit (Qwen3.5-9B) | ~9B | 4-bit | 0,081 | 5,04 | No disponible | MLX |
| lmstudio-community 4-bit (Qwen3.5-9B) | ~9B | 4-bit | No disponible | No disponible | No disponible | No disponible |
| mlx-works oQ4e-mtp (Qwen3.5-9B) | ~9B | 4-bit | No disponible | No disponible | No disponible | MLX |
| Brooooooklyn UD-Q4_K_XL (Qwen3.5-9B) | ~9B | 4-bit | No disponible | No disponible | No disponible | No disponible |

La model card cita estos packs como referencia en su gráfico comparativo, pero solo publica el valor KL de mlx-community 4-bit. Para el resto de alternativas no hay datos de rendimiento en la información disponible.

## Limitaciones y advertencias
- Solo se declara inglés como idioma soportado; el rendimiento en castellano u otros idiomas no está verificado.
- El modo thinking está activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva explícitamente.
- La cuantización de 4 bits introduce degradación respecto al BF16 original, aunque el autor la sitúa en KL 0,030; para tareas sensibles a la fidelidad conviene validar contra el modelo completo.
- Exclusivo para Apple Silicon: no es ejecutable en GPUs NVIDIA/AMD ni en CPU x86 mediante este pack MLX.
- La model card solo ha sido probada en un M5 Pro; el rendimiento en chips anteriores (M1, M2) no está documentado.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B por si añaden restricciones adicionales.
- Los ejemplos de la model card usan nombres de repo ligeramente distintos (`Qwen3.5-9B-MLX-Q4-KQuant`) del ID real (`Qwen3.5-9B-MLX-KQuant`), lo que puede causar errores al copiar los comandos.

## Enlaces
- Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Kapitsa (motor de Nace): https://github.com/nace-ai/kapitsa
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- mlx-swift-examples: https://github.com/ml-explore/mlx-swift-examples

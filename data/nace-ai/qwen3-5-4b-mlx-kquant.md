# nace-ai/Qwen3.5-4B-MLX-KQuant

## Resumen

Qwen3.5-4B-MLX-KQuant es una cuantización de 4 bits en formato MLX del modelo Qwen/Qwen3.5-4B, publicada por nace-ai. El pack está pensado para ejecutarse en Macs con Apple Silicon mediante Kapitsa, el motor de inferencia local de Nace.AI, que expone APIs compatibles con OpenAI, Anthropic y Ollama. El modelo base es multimodal (pipeline image-text-to-text) y admite modo de razonamiento (thinking) activado por defecto.

La aportación principal del pack es la técnica de cuantización KQuant, que según la model card produce pesos más cercanos al modelo BF16 original que el pack de 4 bits de lmstudio-community, con el mismo tamaño de pesos del modelo de lenguaje (2,37 GB). El repo completo ocupa 3,1 GB e incluye los componentes de visión.

El modelo cuenta con 4.539.265.536 parámetros totales y se distribuye bajo licencia Apache 2.0. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni la composición del entrenamiento en la información proporcionada, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-4B, multimodal image-text-to-text) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX Q4, formato KQuant) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.5-4B en los datos proporcionados. El pipeline declarado es image-text-to-text, lo que confirma que el modelo procesa entradas de imagen y texto, y la model card documenta la recepción de imágenes como partes `image_url` (URL http(s) o data URL base64) en la API compatible con OpenAI. El pack incluye los pesos del modelo de lenguaje cuantizados a 4 bits (2,37 GB) más el resto de componentes hasta un total de 3,1 GB.

El entrenamiento del modelo base no está documentado en la información disponible. Respecto al proceso de cuantización, KQuant produce un pack en el mismo formato que el de lmstudio-community pero con menor divergencia respecto al BF16 original: KL de 0,048 frente a 0,070, y una tasa de coincidencia en el siguiente token del 89,9 % frente al 88,1 %. Las mediciones se realizaron sobre 32.768 tokens de WikiText-2, conversaciones de GSM8K y código de HumanEval, comparando contra Qwen/Qwen3.5-4B en bf16 (commit 851bf6e8). El modelo base incorpora modo de razonamiento (thinking) que genera contenido en el campo `reasoning_content` y puede desactivarse con `reasoning_effort: "none"` o `enable_thinking: false`.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito en modo thinking, activado por defecto, con salida separada en `reasoning_content`.
- Procesamiento de imágenes: entrada de imágenes por URL o base64 y respuesta en texto (image-text-to-text).
- Tool calling / function calling con definiciones de herramientas en formato OpenAI, incluyendo round trip completo con el SDK de OpenAI.
- Razonamiento matemático: resultados de GSM8K de 0,923 sobre las 1.319 preguntas del conjunto.
- Generación de código: el pack se evalúa sobre HumanEval como parte del conjunto de calibración de la cuantización.
- Despliegue local en Apple Silicon con APIs compatibles con OpenAI, Anthropic y Ollama a través de Kapitsa.
- Ajuste de parámetros de muestreo documentado para modo thinking y no thinking (temperature, top_p, top_k, presence_penalty).

## Casos de uso

- Asistente conversacional local en Mac: el pack se sirve con `kapitsa serve` y ofrece una página de chat en http://127.0.0.1:8000, adecuado para uso privado (opción `--private`) sin enviar datos a la nube.
- Automatización con tool calling: integración de herramientas externas mediante definiciones OpenAI; la model card documenta un ejemplo completo de consulta meteorológica con el SDK de OpenAI contra el endpoint local.
- Análisis de imágenes en local: recepción de imágenes por URL o base64 y descripción o respuesta a preguntas sobre ellas, útil para clasificación o extracción de información de capturas y fotografías sin salida a servicios externos.
- Razonamiento matemático asistido: con modo thinking activado y los parámetros recomendados (temperature 1.0, top_p 0.95, top_k 20, presence_penalty 1.5), adecuado para problemas de aritmética y word problems; el pack obtiene 0,923 en GSM8K.
- Asistencia de programación: el modo thinking con ajustes precisos para código (temperature 0.6, presence_penalty 0.0) está documentado por el autor del modelo base, lo que permite usarlo como asistente de código en local.
- Prototipado de agentes con APIs estándar: al exponer endpoints compatibles con OpenAI, Anthropic y Ollama, el pack permite sustituir un proveedor remoto por inferencia local en pipelines existentes sin reescribir el cliente.
- Evaluación de cuantizaciones: útil para comparar la fidelidad de distintos packs de 4 bits frente al BF16 mediante KL y acuerdo en el siguiente token, con metodología reproducible documentada.

## Benchmarks y rendimiento

| Test | lmstudio-community 4-bit | KQuant (este repo) |
|---|---:|---:|
| KL respecto al modelo bf16 (menor es mejor) | 0,070 | 0,048 |
| Coincidencia con bf16 en el siguiente token | 88,1 % | 89,9 % |
| GSM8K (1.319 preguntas) | 0,914 | 0,923 |

En GSM8K, 35 preguntas solo las acierta el pack de lmstudio-community y 47 solo KQuant; el autor indica que la diferencia no es medible (McNemar z 1,33). No se han publicado otros resultados de benchmarks (MMLU, HumanEval numérico, etc.) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (Macs). El pack está en formato MLX y la librería declarada es `mlx`.
- Tamaño en disco: 3,1 GB de archivos; pesos del modelo de lenguaje de 2,37 GB en Q4.
- VRAM/memoria unificada estimada: no disponible de forma explícita; por el tamaño del repo (3,1 GB) el pack requiere al menos esa cantidad de memoria unificada más el overhead de inferencia.
- GPU recomendadas: no disponible. El pack no está pensado para GPU NVIDIA; el ecosistema es Apple Silicon.
- Despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa`, `kapitsa pull`, `kapitsa serve`) y `mlx_lm.generate`. No se documenta soporte para vLLM, llama.cpp, Ollama nativo ni TGI; la compatibilidad con la API de Ollama es a través de Kapitsa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| nace-ai/Qwen3.5-4B-MLX-KQuant | 4.539.265.536 | 4 bits (KQuant) | no disponible | apache-2.0 | MLX safetensors |
| lmstudio-community/Qwen3.5-4B-MLX-4bit | mismo modelo base | 4 bits | no disponible | no disponible en la información | MLX |
| Qwen/Qwen3.5-4B (bf16) | 4.539.265.536 | bf16 | no disponible | no disponible en la información | safetensors |

Frente al pack de lmstudio-community, KQuant ofrece menor KL (0,048 frente a 0,070) y mayor acuerdo en el siguiente token (89,9 % frente a 88,1 %) con el mismo tamaño de pesos del modelo de lenguaje. Frente al modelo base en bf16, el pack ocupa 2,37 GB en lugar del tamaño completo en bf16 y pierde fidelidad de forma medible pero acotada. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo para Apple Silicon: el formato MLX no es portable a GPU NVIDIA ni a CPU x86 de forma directa.
- Cuantización con pérdida: aunque KQuant es más fiel que el pack de lmstudio-community, sigue siendo una aproximación al bf16; el autor reconoce que la diferencia en GSM8K no es medible, no que sea nula.
- Los ejemplos de inferencia de la model card se probaron sobre nace-ai/Qwen3.5-9B-MLX-Q4-KQuant, no sobre este pack de 4B; el autor indica que la tarjeta sustituye el nombre del repo, por lo que la reproducibilidad exacta de los ejemplos en este pack no está verificada.
- El modo thinking está activado por defecto y consume presupuesto de salida (hasta 32.768 tokens recomendados), lo que afecta a latencia y coste computacional.
- Un `presence_penalty` alto puede mezclar idiomas según la model card.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo base en la documentación proporcionada.
- Licencia Apache 2.0 en el pack; las condiciones del modelo base Qwen/Qwen3.5-4B no se detallan en la información disponible, por lo que conviene verificar la licencia del modelo original antes de uso comercial.
- El repo tiene 115 descargas y 0 likes en el momento de la consulta; es un pack reciente (creado en noviembre de 2026) con adopción limitada.

## Enlaces

- Hugging Face del pack: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Prácticas recomendadas del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B#best-practices
- Repositorio de Kapitsa: https://github.com/nace-ai/kapitsa
- Sitio de Nace.AI: https://www.nace.ai/
- Pack comparable de lmstudio-community: https://huggingface.co/lmstudio-community/Qwen3.5-4B-MLX-4bit
- Otros packs del autor: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q4-KQuant, https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-Q4-KQuant, https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-Q4-KQuant, https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX-Q4-KQuant

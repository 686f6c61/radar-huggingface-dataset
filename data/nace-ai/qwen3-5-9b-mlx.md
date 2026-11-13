# nace-ai/Qwen3.5-9B-MLX

## Resumen

Qwen3.5-9B-MLX es una cuantización en formato MLX del modelo Qwen/Qwen3.5-9B, publicada por el usuario nace-ai. No se trata de un modelo entrenado desde cero, sino de un empaquetado de pesos optimizado para Apple Silicon, con dos checkpoints (4-bit y 5-bit) que buscan minimizar la divergencia respecto al modelo original en BF16. El modelo base es multimodal (pipeline image-text-to-text) y tiene 9.409.813.744 parámetros totales.

El interés de esta publicación radica en su método de cuantización mixta: el checkpoint Q4 combina 4-bit con capas down_proj e in_proj_z en 5-bit, mientras que el Q5 usa precisión mixta de 5/6/8-bit por tensor. El autor reporta una divergencia KL frente a BF16 de 0,030 para Q4 y 0,010 para Q5, lo que según sus datos sitúa al Q4 de Nace 2,7 veces más cerca del modelo original que el pack 4-bit de mlx-community.

Es relevante para desarrolladores que trabajan en Macs con Apple Silicon y necesitan ejecutar localmente un modelo de ~9B con capacidades de visión y razonamiento, sin depender de GPUs NVIDIA ni de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5; el pack es una cuantización MLX) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (Q4, ~4,2 bits por peso, 4,7 contando escalas) y 5-bit (Q5, precisión mixta 5/6/8-bit, ~5,05 bits por peso, 5,55 contando escalas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (packs Q4/ y Q5/) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna ni el proceso de entrenamiento del modelo base Qwen3.5-9B en la documentación proporcionada; esta publicación es una cuantización, no un entrenamiento. El autor no detalla la composición del dataset, el número de tokens ni si hubo RLHF o DPO.

La innovación técnica destacable está en el esquema de cuantización: el Q4 aplica 4-bit general con capas seleccionadas (down_proj e in_proj_z) en 5-bit, y el Q5 usa precisión mixta asignando 5, 6 u 8 bits por tensor. El autor publica una gráfica de divergencia KL frente a BF16 en función del tamaño del modelo de lenguaje en GB, comparando sus packs con alternativas de lmstudio-community, mlx-community, mlx-works y Brooooooklyn. El pack incluye soporte de modo "thinking" por defecto y de visión mediante partes `image_url`.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" activado por defecto, con la salida de razonamiento en el campo `reasoning_content`; se puede desactivar mediante `reasoning_effort: "none"` o `enable_thinking: false`.
- Comprensión de imágenes (image-text-to-text): acepta URLs http(s) o data URLs base64 como partes `image_url`.
- Tool calling / function calling: probado con Kapitsa, mlx-lm, mlx-vlm, LM Studio, SwiftLM, LocalAI, Osaurus, vllm-mlx y mlx-openai-server; todos menos `llm-tool` colocaron una llamada a herramienta.
- Aritmética y tareas de razonamiento básico (el ejemplo de la model card usa 17 * 23).
- Capacidades multilingües limitadas: la model card declara únicamente inglés (`en`).

## Casos de uso

- Asistente local en Mac: desplegar el pack Q4 (6,2 GB) con Kapitsa o mlx-lm para tener un chat con razonamiento y visión sin conexión a internet, aprovechando la memoria unificada de Apple Silicon.
- Análisis de imágenes en escritorio: enviar fotos o capturas como `image_url` a un servidor local compatible con OpenAI para descripción, extracción de información o respuesta a preguntas visuales.
- Automatización con tool calling: usar el servidor OpenAI-compatible de mlx-lm o Kapitsa para que el modelo invoque funciones en flujos de trabajo locales (por ejemplo, consultas a APIs internas o gestión de ficheros).
- Prototipado de agentes multi-paso: el modo thinking por defecto permite cadenas de razonamiento antes de actuar, útil para experimentar con agentes en un portátil antes de migrar a infraestructura mayor.
- Evaluación de cuantizaciones: comparar Q4 y Q5 frente a BF16 usando la métrica KL publicada para decidir el equilibrio entre calidad y tamaño en un despliegue concreto.
- Sustituto local en desarrollo: integrar el endpoint OpenAI-compatible (puerto 8080 con `mlx_lm.server`) en aplicaciones que ya consumen la API de OpenAI, cambiando solo la URL base.
- Educación e investigación: ejecutar un modelo de ~9B multimodal en hardware de consumo para experimentos docentes sin coste de GPU en la nube.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El único dato cuantitativo es la divergencia KL frente al modelo BF16:

| Checkpoint | Bits efectivos | Tamaño de descarga | KL a BF16 |
|---|---|---|---|
| Q4 | ~4,2 (4,7 con escalas) | 6,2 GB | 0,030 |
| Q5 | ~5,05 (5,55 con escalas) | 7,1 GB | 0,010 |

El autor afirma que el Q4 está 2,7 veces más cerca del BF16 que el pack 4-bit de mlx-community (KL 0,030 frente a 0,081), con un 5 % más de peso de modelo de lenguaje (5,29 GB frente a 5,04 GB). No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada: el autor indica que ambos checkpoints caben en equipos con 16 GB o más de RAM, como regla general (no medición): el tamaño de RAM cuyo reparto por defecto de GPU en macOS (unos 2/3) aloja la descarga más 2 GB para una conversación.
- GPU: diseñado para Apple Silicon (probado en un M5 Pro); no está pensado para GPUs NVIDIA.
- Consumer GPU: sí, en Macs con memoria unificada de 16 GB o más; Kapitsa puede saltarse partes no usadas y caber en un tamaño inferior, y `kapitsa doctor` comprueba un Mac concreto.
- Opciones de despliegue: Kapitsa 0.2.32, mlx-lm 0.32.2, mlx-vlm 0.7.10, LM Studio con motor MLX 1.13.1, SwiftLM b911, LocalAI 4.12.1 con backend MLX, Osaurus 1.0.1, vllm-mlx 0.6.0, mlx-openai-server 1.8.1 y `llm-tool` de mlx-swift-examples.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | KL a BF16 | Licencia | Formato |
|---|---|---|---|---|---|
| nace-ai/Qwen3.5-9B-MLX (Q4) | 9,41 B | 4-bit mixta | 0,030 | apache-2.0 | MLX |
| nace-ai/Qwen3.5-9B-MLX (Q5) | 9,41 B | 5-bit mixta | 0,010 | apache-2.0 | MLX |
| mlx-community 4-bit (Qwen3.5-9B) | 9,41 B (base) | 4-bit | 0,081 | no disponible | MLX |
| lmstudio-community 4-bit (Qwen3.5-9B) | 9,41 B (base) | 4-bit | no disponible | no disponible | MLX |
| Brooooooklyn UD-Q4_K_XL | 9,41 B (base) | 4-bit | no disponible | no disponible | no disponible |

Los datos de KL de las alternativas provienen únicamente de la gráfica y el texto del autor; no se han verificado de forma independiente en la información disponible.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado.
- La longitud de contexto no se especifica en la información disponible, lo que impide planificar despliegues con ventanas largas.
- El modelo puede alucinar, como cualquier LLM; no se documentan evaluaciones de fiabilidad.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-9B.
- Es un pack exclusivo para MLX/Apple Silicon; no es utilizable directamente en CUDA, vLLM estándar o llama.cpp.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria amplia.
- La regla de "cabe en 16 GB" es una estimación del autor, no una medición; conviene comprobar con `kapitsa doctor`.
- El modo thinking está activado por defecto y consume tokens adicionales; hay que desactivarlo explícitamente para respuestas directas.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Kapitsa (motor del autor): https://github.com/nace-ai/kapitsa
- Assets de la model card: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX/resolve/main/assets/nace-dark.svg y https://huggingface.co/nace-ai/Qwen3.5-9B-MLX/resolve/main/assets/nace-light.svg

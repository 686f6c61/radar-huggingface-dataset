# nace-ai/Qwen3.5-9B-MLX-Q4-KQuant

## Resumen

Qwen3.5-9B-MLX-Q4-KQuant es una cuantización de 4 bits del modelo Qwen3.5-9B de Alibaba Qwen, publicada por el usuario nace-ai y empaquetada específicamente para Apple Silicon mediante la librería MLX. El modelo base es un transformer multimodal de aproximadamente 9.410 millones de parámetros que acepta entradas de imagen y texto (pipeline `image-text-to-text`) y está orientado a conversación, con modo de razonamiento ("thinking") activado por defecto. Esta versión concreta emplea una cuantización mixta de 4 bits con algunas capas en 5 bits (`down_proj` e `in_proj_z`), lo que según el autor la sitúa unas 2,7 veces más cerca del modelo BF16 original que el pack de 4 bits de mlx-community (KL 0,030 frente a 0,081).

La relevancia de esta ficha radica en su enfoque: no es un modelo nuevo, sino un pack de pesos optimizado para ejecutar un modelo de 9B multimodal en Macs con memoria unificada de 16 GB o más, con un peso de ficheros de 6,2 GB para la variante Q4 y 7,1 GB para Q5. El autor incluye además comparativas de divergencia KL frente a otros packs MLX públicos y probó la inferencia en varias herramientas del ecosistema Apple (mlx-lm, mlx-vlm, LM Studio, SwiftLM, LocalAI, Osaurus, vllm-mlx, mlx-openai-server).

La licencia es Apache 2.0, heredada del modelo base, y el idioma declarado en la model card es únicamente inglés. El repo tiene 352 descargas y 1 like en el momento de la consulta, con fecha de creación en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) del modelo base Qwen3.5-9B; pesos cuantizados para MLX |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 mixta (~4,2 bits por peso, 4,7 contando escalas; `down_proj` e `in_proj_z` en 5 bits) y Q5 mixta (~5,05 bits por peso, 5,55 contando escalas; 5/6/8 bits por tensor) |
| Idiomas soportados | en (inglés) según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pack MLX) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.5-9B en la documentación proporcionada: no se detalla si es un transformer denso, MoE o híbrido, ni el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF/DPO. Lo que sí documenta el autor es el proceso de cuantización: un esquema mixto por tensor que asigna 4 bits a la mayoría de pesos y 5 bits a `down_proj` e `in_proj_z` en la variante Q4, y 5/6/8 bits por tensor en la variante Q5. El autor reporta que la Q4 queda a una divergencia KL de 0,030 respecto al BF16 original y la Q5 a 0,010, frente a 0,081 del pack de 4 bits de mlx-community.

El modelo base incorpora un modo de razonamiento que genera contenido en `reasoning_content` antes de la respuesta final, y admite desactivarlo mediante `reasoning_effort: "none"` o `enable_thinking: false` en la plantilla de chat. También soporta entrada de imágenes mediante partes `image_url` en formato OpenAI.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" activado por defecto (contenido separado en `reasoning_content`).
- Comprensión de imágenes (image-text-to-text): acepta URLs http(s) o data URLs base64.
- Tool calling / function calling: el autor verificó que varias herramientas (Kapitsa, mlx-lm, mlx-vlm, LM Studio, SwiftLM, LocalAI, Osaurus, vllm-mlx, mlx-openai-server) colocaron correctamente una llamada a herramienta; solo `llm-tool` de Apple no lo hizo.
- Aritmética y tareas de razonamiento elementales (el ejemplo de la model card usa `17 * 23`).
- Capacidades multilingües: la model card solo declara inglés; no se documentan otros idiomas.

## Casos de uso

- Asistente conversacional local en Mac: el pack Q4 (6,2 GB) cabe en equipos con 16 GB o más de memoria unificada, lo que permite ejecutar un modelo de 9B multimodal sin conexión a la nube mediante Kapitsa, mlx-lm o LM Studio.
- Análisis de imágenes en escritorio: integración con flujos que envían capturas o fotos como `image_url` para descripción, respuesta a preguntas visuales o extracción de información, usando mlx-vlm o el servidor compatible con OpenAI de Kapitsa.
- Automatización con agentes y tool calling: el modelo coloca llamadas a herramientas en la mayoría de los runtimes MLX probados, lo que permite construir agentes locales que consulten APIs o ejecuten acciones estructuradas.
- Razonamiento matemático asistido: el modo thinking por defecto está pensado para problemas que requieren pasos intermedios; puede desactivarse para respuestas rápidas en tareas simples.
- Servidor OpenAI-compatible local: Kapitsa expone endpoints OpenAI, Anthropic y Ollama en `127.0.0.1:8000`, lo que permite sustituir una API remota por inferencia local en herramientas existentes.
- Prototipado e investigación en Apple Silicon: al ser un pack MLX con métricas de divergencia KL publicadas, sirve para comparar esquemas de cuantización y evaluar el impacto en calidad frente a BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización:

| Pack | Bits por peso | Tamano descarga | KL a BF16 (menor = mejor) | Memoria recomendada |
|---|---|---|---|---|
| Nace Q4 (este repo) | ~4,2 (4,7 con escalas) | 6,2 GB | 0,030 | 16 GB+ |
| Nace Q5 (este repo) | ~5,05 (5,55 con escalas) | 7,1 GB | 0,010 | 16 GB+ |
| mlx-community 4-bit (referencia) | 4 | no disponible | 0,081 | no disponible |

El autor indica que su Q4 es 2,7 veces más cercana al BF16 que el pack de 4 bits de mlx-community, con un 5 % más de peso de modelo de lenguaje (5,29 GB frente a 5,04 GB). No se aportan datos de latencia ni throughput.

## Requisitos de hardware

- VRAM/RAM estimada: 16 GB o más de memoria unificada para ambas variantes (Q4 6,2 GB, Q5 7,1 GB de descarga, más ~2 GB para conversación). El autor advierte que es una regla aproximada, no una medición.
- Plataforma: exclusivamente Apple Silicon (MLX); no aplica a GPU NVIDIA o AMD.
- GPU recomendadas: el autor probó en un M5 Pro; no se especifican otros chips. No cabe en GPUs de consumo tipo RTX 4090 porque el formato es MLX, no GGUF/CUDA.
- Despliegue: Kapitsa (`kapitsa serve --model 9b:q4`), mlx-lm (`mlx_lm.generate`, `mlx_lm.server`), mlx-vlm, LM Studio con motor MLX, SwiftLM, LocalAI con backend MLX, Osaurus, vllm-mlx, mlx-openai-server y `llm-tool` de Apple.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nace-ai/Qwen3.5-9B-MLX-Q4-KQuant | 9,41 B | no disponible | MLX safetensors | Apache 2.0 | KL 0,030 a BF16; Q4 mixta |
| mlx-community 4-bit (Qwen3.5-9B) | ~9,4 B (base) | no disponible | MLX | Apache 2.0 (heredada) | KL 0,081 a BF16 según el autor |
| lmstudio-community 4-bit (Qwen3.5-9B) | ~9,4 B (base) | no disponible | MLX | Apache 2.0 (heredada) | Pack MLX público citado en la comparativa del autor |
| mlx-works oQ4e-mtp | ~9,4 B (base) | no disponible | MLX | no disponible | Pack MLX público citado en la comparativa del autor |

No se dispone de datos de rendimiento en benchmarks para ninguno de los packs comparados; la única métrica objetiva publicada es la divergencia KL frente al BF16.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente `en`; el rendimiento en castellano u otros idiomas no está documentado y podría degradarse.
- Solo Apple Silicon: el formato MLX no es portable a CUDA, ROCm ni CPU convencional; requiere Macs con memoria unificada suficiente.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluaciones publicadas de fidelidad factual para esta cuantización.
- La cuantización introduce degradación: aunque el autor reporta KL bajo (0,030 en Q4), no es idéntico al BF16 y puede afectar a tareas sensibles.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-9B, que pueden incluir términos adicionales.
- El modo thinking está activado por defecto y aumenta el consumo de tokens; desactivarlo cambia los parámetros de muestreo recomendados (temp 0,7, top_p 0,8 frente a temp 1,0, top_p 0,95).
- El autor advierte que la regla de "16 GB+" es aproximada y que `kapitsa doctor` debe verificar el equipo concreto.
- Repo con muy poca tracción (352 descargas, 1 like): menor validación comunitaria que packs de organizaciones consolidadas.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q4-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de Kapitsa: https://github.com/nace-ai/kapitsa
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-lm
- Documentación de mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Assets de la model card (gráfica KL): https://huggingface.co/nace-ai/Qwen3.5-9B-MLX/resolve/main/assets/nace-dark.svg
- No se han encontrado papers, blogs o demos adicionales en la búsqueda web.

# nightmedia/Qwen3.5-9B-SnowWhite-mxfp8-mlx

## Resumen

Qwen3.5-9B-SnowWhite-mxfp8-mlx es un modelo multimodal de tipo image-text-to-text con 9.409.813.744 parámetros (≈9,4B), publicado por Nightmedia, un laboratorio independiente con sede en Montana (EE. UU.). Se trata de un merge de dos modelos: nightmedia/Qwen3.5-9B-Brainwaves, que aporta el motor lingüístico y de razonamiento, y apple/LensVLM-9B, que aporta la torre de visión. El autor denomina al conjunto Qwen3.5-9B-Wichtelchen-Holodeck-Lounge-LensVLM. La variante que nos ocupa está cuantizada en mxfp8 (8 bits) y empaquetada para MLX, el framework de Apple Silicon.

El modelo ataca un nicho concreto: inferencia local multimodal en hardware de consumo. Según la model card, la cuantización mxfp8 ocupa 16,02 GB de memoria pico, alcanza 657 tokens/s y presenta una perplejidad de 4,146 ± 0,027 en la evaluación del autor. La familia de la que deriva, Qwen3.5-9B, se describe en la receta de vLLM como un modelo denso, multimodal nativo, con atención híbrida basada en gated delta networks, multi-token prediction (MTP) y una ventana de contexto de 262K tokens, ampliable hasta 1M según las etiquetas del repositorio.

Su interés radica en combinar visión, contexto largo, razonamiento con cadena de pensamiento y licencia Apache 2.0 en un tamaño que cabe en un único MacBook Pro. Como contrapartida, es un modelo etiquetado como experimental, con 0 descargas y 0 likes en el momento de redactar esta ficha, y todas sus cifras de rendimiento proceden del propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atención híbrida basada en gated delta networks y multi-token prediction (MTP), según la receta de vLLM para Qwen/Qwen3.5-9B |
| Parámetros totales | 9.409.813.744 (≈9,4B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262K tokens según la receta de vLLM para Qwen3.5-9B; las etiquetas del repositorio citan "256k context" y "1M context" |
| Tipos de cuantización | mxfp8 (8 bits) en esta variante; la model card documenta también bf16 y q8-hi para el componente Brainwaves |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (library_name: transformers) y formato MLX con cuantización mxfp8 |
| Modelos base | nightmedia/Qwen3.5-9B-Brainwaves, apple/LensVLM-9B |
| Tamaño del repositorio | 10,2 GB |
| Pipeline | image-text-to-text |
| Fecha de publicación | 16 de octubre de 2026 (última actualización el mismo día) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es un merge construido con mergekit a partir de dos checkpoints. El componente lingüístico, nightmedia/Qwen3.5-9B-Brainwaves, desciende de la familia Qwen3.5-9B, descrita por vLLM como un transformer denso con atención híbrida de gated delta networks (una mezcla de atención lineal y atención completa), multi-token prediction (MTP) y contexto nativo de 262K tokens. El componente visual, apple/LensVLM-9B, aporta la capacidad image-text-to-text, lo que explica que el pipeline declarado sea multimodal. Las etiquetas del repositorio mencionan asimismo decodificación especulativa y multi-token prediction, coherentes con el uso de MTP.

En cuanto al proceso de ajuste, las etiquetas del repositorio indican SFT, LoRA y "claude-distillation" (destilación a partir de un modelo propietario), además de razonamiento con cadena de pensamiento larga (long-cot) y modos de "thinking". No se especifican en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documenta la receta exacta de fusión (pesos, método de merge o capas combinadas) más allá de la mención a mergekit.

## Capacidades

- Generación de texto conversacional e instruccional, con ajuste específico para seguir instrucciones.
- Razonamiento explícito con cadena de pensamiento (chain-of-thought) y modo de razonamiento largo (long-cot).
- Codificación: el repositorio incluye la etiqueta coding, y el autor lo promociona para casos de uso de programación.
- Matemáticas y STEM: etiquetas math y stem.
- Visión: pipeline image-text-to-text, con entrada conjunta de imagen y texto gracias al componente LensVLM-9B.
- Contexto largo: 262K tokens según la especificación de la familia, con etiquetas que reclaman hasta 1M.
- Multilingüe: inglés, chino, japonés y español declarados.
- Escritura creativa: ficción, generación de tramas y subtramas, continuación de escenas, ciencia ficción y roleplaying.
- Decodificación especulativa / multi-token prediction, útil para acelerar la inferencia.
- Soporte de tool calling o function calling: no documentado en la información disponible.
- Ejecución local optimizada para MLX mediante mlx-vlm (carga y generación con `mlx_vlm.load` / `mlx_vlm.generate`).

## Casos de uso

- Asistente de escritura creativa local: el modelo está ajustado explícitamente para ficción, generación de tramas y continuación de escenas, y su contexto de 262K tokens permite mantener una biblia de personajes y arcos narrativos extensos dentro de la ventana sin resumir.
- Análisis de documentos con imágenes en el puesto de trabajo: al ser image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con texto y responder preguntas sobre ellos sin enviar datos a la nube, algo crítico en entornos con requisitos de confidencialidad.
- Tutoría técnica y resolución de problemas de matemáticas y STEM: el modo de razonamiento con cadena de pensamiento larga permite desglosar problemas de varios pasos paso a paso, útil en herramientas educativas.
- Asistencia de programación en local: con la etiqueta coding y una ventana de 262K tokens, permite cargar varios ficheros de un repositorio de tamaño medio y generar o revisar código sin depender de APIs externas.
- Prototipado de agentes conversacionales multilingües: soporta inglés, chino, japonés y español, por lo que sirve para bots de atención al cliente en esos cuatro idiomas sobre una única instancia local.
- Roleplaying y simulación de personajes: las etiquetas roleplaying y fiction story apuntan a usos de entretenimiento interactivo, con capacidad de mantener coherencia de personaje en conversaciones largas.
- Investigación en destilación y merges: el modelo es un caso de estudio reproducible de fusión de un LLM con un VLM y de cuantización mxfp8 para MLX, útil para quienes investigan técnicas de merge y cuantización.
- Procesamiento por lotes en un solo equipo Apple Silicon: los 657 tokens/s reportados permiten tareas de generación masiva (resúmenes, etiquetado, reescritura) en un MacBook Pro sin clúster dedicado.

## Benchmarks y rendimiento

Resultados tal y como aparecen en la model card. Los tres primeros bloques corresponden a la evaluación del componente Brainwaves y el último a apple/LensVLM-9B.

| Benchmark | Brainwaves bf16 | Brainwaves mxfp8 | Brainwaves q8-hi | LensVLM-9B mxfp8 |
|---|---|---|---|---|
| ARC | 0,686 | 0,678 | 0,687 | 0,520 |
| ARC-E | 0,860 | 0,856 | 0,860 | 0,684 |
| BoolQ | 0,903 | 0,904 | 0,904 | 0,885 |
| HellaSwag | 0,768 | 0,763 | 0,768 | no disponible |
| OBKQA | 0,516 | 0,502 | 0,518 | no disponible |
| PIQA | 0,800 | 0,800 | 0,797 | no disponible |
| Winogrande | 0,713 | 0,702 | 0,715 | no disponible |

La model card incluye además una fila agregada para el modelo fusionado (mxfp8: ARC 0,677; ARC-E 0,860; BoolQ 0,902; HellaSwag 0,776; OBKQA 0,524; PIQA 0,800; Winogrande 0,716) y la siguiente tabla de cuantización:

| Cuantización | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| mxfp8 | 4,146 ± 0,027 | 16,02 GB | 657 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni para tareas multimodales (VQA, captioning), ni comparaciones directas contra otros modelos realizadas por terceros.

## Requisitos de hardware

- Tamaño del checkpoint: 10,2 GB en el repositorio, con 9.409.813.744 parámetros en mxfp8 (8 bits).
- Memoria pico reportada por el autor: 16,02 GB durante la evaluación en mxfp8. Esa cifra incluye pesos, caché KV y estados intermedios, por lo que conviene dimensionar por encima de los ~9,4 GB teóricos de los pesos.
- Una ficha de terceros (LLM Explorer) atribuye 9,8 GB de VRAM a Qwen3.5-9B-Brainwaves-qx86-hi-mlx, una cuantización distinta; no debe extrapolarse directamente a esta variante mxfp8.
- Cabe en GPU de consumo: una RTX 4090 (24 GB) o una RTX 3090 (24 GB) tendrían margen para los pesos, aunque esta build está pensada para MLX y Apple Silicon, no para CUDA.
- Hardware de referencia del autor: un MacBook Pro de 128 GB de memoria unificada, que es el equipo con el que Nightmedia desarrolla y evalúa.
- GPU de centro de datos (A100 40/80 GB, H100) sobredimensionadas para este tamaño: útiles solo si se despliegan muchas instancias o se sirve en paralelo.
- Opciones de despliegue: MLX mediante mlx-vlm (ruta documentada por el autor); transformers para los pesos safetensors; al ser un formato MLX, GGUF, llama.cpp, Ollama y TGI no están soportados de forma nativa sin reconversión.
- Rendimiento: 657 tokens/s reportados en la configuración del autor con mxfp8. No se publican datos de latencia por petición, throughput con batching ni rendimiento en GPUs NVIDIA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-SnowWhite-mxfp8-mlx | 9,4B | 262K (etiquetas: 256K y 1M) | texto + imagen | Apache 2.0 | Hugging Face, formato MLX mxfp8 |
| Qwen/Qwen3.5-9B | ≈9B | 262K | multimodal nativo | Apache 2.0 | Hugging Face, ecosistema vLLM |
| apple/LensVLM-9B | no disponible | no disponible | image-text-to-text | no disponible en la información | Hugging Face |
| nightmedia/Qwen3.5-9B-Brainwaves | ≈9B (según el nombre del repositorio) | no disponible | texto | no disponible en la información | Hugging Face |
| nightmedia/Qwen3.5-9B-mxfp8-mlx | no disponible | no disponible | no disponible | no disponible en la información | Hugging Face |

No se dispone de comparativas de rendimiento publicadas entre el modelo fusionado y Qwen/Qwen3.5-9B, su ancestro directo, ni con alternativas multimodales de tamaño similar. Las cifras de la sección anterior corresponden a los componentes por separado, no al resultado del merge.

## Limitaciones y advertencias

- Todos los benchmarks disponibles son autoinformados por el autor; no hay evaluación independiente ni verificada por terceros.
- Cero descargas y cero likes en el momento de redactar la ficha: no existe validación de la comunidad sobre el comportamiento real del modelo.
- Modelo etiquetado como experimental por el propio autor; no es aconsejable para producción crítica sin una batería de pruebas propia.
- Los valores de ARC en el entorno de 0,68 y de OBKQA en torno a 0,50 son moderados para un modelo de 9B, lo que sugiere un rendimiento desigual entre dominios.
- La model card incluye citas elogiosas generadas por otro modelo (Gemini) y textos narrativos de ejemplo; son material promocional y no constituyen evidencia técnica.
- Riesgo de alucinación inherente a cualquier LLM de este tamaño, agravado por la falta de datos de evaluación en tareas de fidelidad factual y de visión.
- La destilación declarada desde Claude ("claude-distillation") implica posiblemente datos generados por un modelo propietario; conviene revisar los términos de uso aplicables antes de un despliegue comercial.
- La ventana de contexto efectiva no está verificada: se declaran 262K, 256K y 1M en distintas partes de la información, sin datos de degradación en contextos largos.
- El soporte multilingüe se limita a cuatro idiomas (en, zh, ja, es); no se documentan otras lenguas.
- No se documenta soporte de tool calling, function calling ni protocolos de agentes, capacidades que no deben asumirse.
- El formato mxfp8/MLX restringe el despliegue cómodo a Apple Silicon; llevarlo a CUDA o a GGUF requiere reconversión y una nueva validación de calidad.
- Aunque la licencia declarada es Apache 2.0, el modelo es un merge que incorpora apple/LensVLM-9B, cuya licencia no se especifica en la información disponible; conviene verificar los términos de todos los componentes antes del uso comercial.
- El repositorio y el modelo llevan fecha de octubre de 2026 y no se documenta un plan de mantenimiento o versionado posterior.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/nightmedia/Qwen3.5-9B-SnowWhite-mxfp8-mlx
- Modelo base lingüístico: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves
- Modelo base visual: https://huggingface.co/apple/LensVLM-9B
- Variante del mismo autor: https://huggingface.co/nightmedia/Qwen3.5-9B-mxfp8-mlx
- Receta de vLLM para Qwen/Qwen3.5-9B: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
- Ficha de Qwen3.5-9B en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-9b/
- Ficha de Qwen3.5-9B-Brainwaves-qx86-hi-mlx en LLM Explorer: https://llm-explorer.com/model/nightmedia%2FQwen3.5-9B-Brainwaves-qx86-hi-mlx,51w4eUrPy5MW71Xox3CTzp
- Documentación de MLX-VLM (carga y generación): https://github.com/Blaizzy/mlx-vlm

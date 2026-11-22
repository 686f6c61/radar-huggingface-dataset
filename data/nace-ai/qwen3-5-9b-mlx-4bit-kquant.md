# nace-ai/Qwen3.5-9B-MLX-4bit-KQuant

## Resumen

Qwen3.5-9B-MLX-4bit-KQuant es una cuantización en 4 bits del modelo Qwen/Qwen3.5-9B, publicada por el usuario nace-ai y empaquetada en formato MLX para su ejecución en Apple Silicon. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer multimodal de 9.409.813.744 parámetros orientado a tareas de imagen-texto-a-texto y conversación. Esta versión concreta reduce el peso a aproximadamente 6,0 GB en el repositorio, lo que la hace viable en equipos Mac con memoria unificada moderada.

El interés de este pack reside en su método de cuantización: nace-ai aplica una técnica propia (etiquetada como KQuant) que, según sus propias mediciones, se aproxima más al modelo original en BF16 que los packs de 4 bits de lmstudio-community y mlx-community, manteniendo un tamaño de 5,95 GB en pesos. El autor reporta una divergencia KL de 0,036619 frente a 0,080555 de las alternativas de 4 bits, con una tasa de acuerdo en el token superior del 92,41 % frente al 88,51 %.

La licencia Apache 2.0 del modelo base se mantiene, lo que permite uso comercial. El modelo está pensado para inferencia local mediante mlx-lm o el motor Kapitsa del propio autor, ambos sobre Apple Silicon. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks del modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto-a-texto); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX, KQuant); existe un pack alternativo en 4 bits más cercano al original (nace-ai/Qwen3.5-9B-MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer multimodal de 9.400 millones de parámetros que procesa entradas de imagen y texto y genera texto. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se especifican innovaciones arquitectónicas internas como atención lineal o decodificación especulativa.

Esta publicación es una cuantización, no un entrenamiento nuevo. nace-ai aplica una cuantización de 4 bits en formato MLX sobre los pesos del modelo original, con una técnica propia denominada KQuant que, según el autor, reduce la divergencia respecto a BF16 en comparación con otros packs públicos de 4 bits. El autor indica que el pack contiene pesos auxiliares (visión y MTP) además del modelo de lenguaje, y que el payload auditado del modelo de lenguaje base es de 5.038.041.600 bytes. La model card menciona que existe un pack más reciente (nace-ai/Qwen3.5-9B-MLX) de 5,29 GB más cercano al original.

## Capacidades

- Generación de texto conversacional en modo chat, con soporte de plantilla de chat y modo de razonamiento (thinking) activable o desactivable mediante configuración de la plantilla.
- Procesamiento de imagen y texto como entrada (pipeline image-text-to-text), lo que permite tareas de descripción de imágenes y preguntas sobre contenido visual.
- Razonamiento multi-turno en conversaciones, con presets de muestreo recomendados por el autor para modo thinking y no-thinking.
- Generación de código, según los presets de muestreo específicos para "precise code" que recomienda el autor (temperatura 0,6, top_p 0,95, sin penalización de presencia).
- Ejecución local en Apple Silicon mediante mlx-lm y el motor Kapitsa.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el modo thinking sugiere capacidad de razonamiento extendido.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede servir un chat multi-turno en local mediante Kapitsa (`kapitsa serve`), sin enviar datos a la nube, aprovechando su tamaño de 6 GB para equipos con memoria unificada de 16 GB o superior.
- Análisis de imágenes en local: al ser un modelo image-text-to-text, permite describir imágenes, responder preguntas sobre capturas o extraer información de documentos escaneados sin conexión.
- Generación de código asistida en el escritorio: con los presets de "precise code" (temperatura 0,6, top_p 0,95, sin penalización) el modelo puede integrarse en editores o scripts locales para autocompletar y explicar código.
- Prototipado rápido de aplicaciones de IA en Apple Silicon: mlx-lm permite lanzar inferencia con un solo comando (`uvx --from mlx-lm==0.32.2 mlx_lm.generate`), lo que facilita validar ideas antes de pasar a producción.
- Razonamiento con modo thinking para tareas analíticas: activando el modo thinking con temperatura 1, top_p 0,95 y penalización de presencia 1,5, el modelo puede emplearse en resolución de problemas que requieren cadenas de razonamiento más largas.
- Evaluación comparativa de cuantizaciones: investigadores pueden usar este pack junto con los de lmstudio-community, mlx-community y otros para medir el impacto de distintas cuantizaciones 4-bit sobre la calidad, usando las métricas de KL y acuerdo de token superior que publica el autor.
- Despliegue privado de un asistente multimodal: la opción `--private` de Kapitsa permite servir el modelo en local sin exposición externa, adecuado para entornos con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente al modelo BF16, medidas el 2026-11-11 con MLX CUDA sobre una GPU L40S (no Apple Metal), con ventanas de contexto de 512 tokens y 64 ventanas de evaluación:

| Pack | GB (pesos) | KL (IC 95 %) | Acuerdo token superior |
|---|---|---|---|
| AtomicChat MLX-4bit | 5,038 | 0,080555 [0,073764, 0,087457] | 88,51 % |
| Brooooooklyn UD-Q4_K_XL-mlx | 8,081 | 0,026063 [0,023768, 0,028317] | 93,56 % |
| Nace (este pack) | 5,950 | 0,036619 [0,033267, 0,040221] | 92,41 % |
| lmstudio-community MLX-4bit | 5,950 | 0,080555 [0,073764, 0,087457] | 88,51 % |
| mlx-community 4bit | 5,950 | 0,081409 [0,074333, 0,088666] | 88,42 % |
| mlx-community MLX-4bit | 5,950 | 0,081409 [0,074333, 0,088666] | 88,42 % |
| mlx-community OptiQ-4bit | 8,013 | 0,029220 [0,026377, 0,032296] | 93,39 % |
| mlx-works oQ4e-mtp | 6,231 | 0,042674 [0,038978, 0,046532] | 91,03 % |

Los intervalos de confianza al 95 % se calcularon con bootstrap de remuestreo de ventanas de contexto (4000 réplicas, semilla 469) y no constituyen un veredicto de significación estadística. Los recuentos en GB incluyen pesos auxiliares descargados, no el repositorio completo.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 6,0 GB y los pesos del modelo de lenguaje auditados son de 5,038 GB; se recomienda un Mac con al menos 16 GB de memoria unificada para dejar margen al sistema y al contexto.
- GPU recomendadas: Apple Silicon (serie M) es el objetivo del formato MLX; el autor midió la fidelidad de cuantización en una GPU NVIDIA L40S con MLX CUDA, pero el uso previsto es Apple Metal.
- ¿Cabe en GPU consumer? Sí, en equipos Apple Silicon con memoria unificada suficiente; no está pensado para GPUs NVIDIA consumer convencionales, aunque mlx-lm puede ejecutarse vía MLX CUDA según la metodología del autor.
- Opciones de despliegue: mlx-lm (versión 0.32.2 en el ejemplo del autor) y el motor Kapitsa (`kapitsa serve --model nace-ai/Qwen3.5-9B-MLX-4bit --private`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Tamaño pesos | KL vs BF16 |
|---|---|---|---|---|---|---|
| nace-ai/Qwen3.5-9B-MLX-4bit-KQuant (este) | 9,41 B | no disponible | Apache 2.0 | MLX safetensors 4-bit | 5,95 GB | 0,036619 |
| lmstudio-community/Qwen3.5-9B-MLX-4bit | 9,41 B (base) | no disponible | Apache 2.0 | MLX safetensors 4-bit | 5,95 GB | 0,080555 |
| mlx-community/Qwen3.5-9B-MLX-4bit | 9,41 B (base) | no disponible | Apache 2.0 | MLX safetensors 4-bit | 5,95 GB | 0,081409 |
| Brooooooklyn/Qwen3.5-9B-UD-Q4_K_XL-mlx | 9,41 B (base) | no disponible | Apache 2.0 | MLX 4-bit | 8,08 GB | 0,026063 |

Todos los packs comparados derivan del mismo modelo base Qwen/Qwen3.5-9B y comparten licencia Apache 2.0. La diferencia principal es la fidelidad de la cuantización frente a BF16 y el tamaño resultante: el pack de Brooooooklyn logra menor KL a costa de un tamaño notablemente mayor (8,08 GB), mientras que este pack de nace-ai mantiene el tamaño de 5,95 GB con una KL sustancialmente menor que los packs de lmstudio-community y mlx-community.

## Limitaciones y advertencias

- Es una cuantización de 4 bits: introduce divergencia respecto al modelo BF16 (KL de 0,036619 según el autor), por lo que puede degradar ligeramente la calidad en tareas sensibles.
- El autor recomienda un pack alternativo más reciente (nace-ai/Qwen3.5-9B-MLX, 5,29 GB) más cercano al original; este repositorio puede quedar desactualizado.
- No se dispone de información sobre sesgos del modelo base, idiomas soportados ni riesgos específicos de alucinación en la información proporcionada; deben evaluarse sobre el modelo Qwen3.5-9B original.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-9B por si añade restricciones adicionales.
- El soporte está centrado en Apple Silicon; no se documentan rutas de despliegue para GPUs NVIDIA, vLLM, llama.cpp u Ollama.
- Las métricas de fidelidad del autor se midieron con MLX CUDA en una L40S, no en Apple Metal, por lo que el comportamiento en Mac puede diferir.
- El modo thinking y los presets de muestreo recomendados provienen de las indicaciones del modelo base, no de mediciones nuevas del autor.
- El modelo tiene solo 2 likes y una fecha de creación de 2026-11-09; es un pack reciente y con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-4bit-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Pack alternativo más cercano al original: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
- Otros tamaños del autor: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX, https://huggingface.co/nace-ai/Qwen3.8-27B-MLX, https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX, https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Instalación de Kapitsa: https://github.com/nace-ai/kapitsa#install
- Nace.AI: https://www.nace.ai/
- mlx-lm: https://github.com/ml-explore/mlx-lm
- uv (gestor de paquetes usado en el quickstart): https://docs.astral.sh/uv/getting-started/installation/
- Mejores prácticas del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B#best-practices

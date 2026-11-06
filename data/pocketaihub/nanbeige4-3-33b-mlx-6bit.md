# PocketAiHub/Nanbeige4.3-33B-MLX-6bit

## Resumen

Nanbeige4.3-33B-MLX-6bit es una cuantización a 6 bits, en formato MLX, del modelo Nanbeige 4.3 33B desarrollado por el equipo Nanbeige. La conversión ha sido realizada de forma independiente por PocketAiHub, sin ajuste fino ni modificación del comportamiento del modelo original: se trata de una cuantización fiel del checkpoint en la revisión `c1093c501cc6460427c0ac634db7223d0450c0ee`. El modelo base es un LLM de 33 mil millones de parámetros orientado a generación de texto y conversación, con soporte bilingüe (inglés y chino) y un modo de razonamiento ("thinking") habilitado por defecto.

La relevancia de esta ficha reside en que ofrece una versión optimizada para hardware Apple Silicon mediante el framework MLX, con un tamaño de repositorio de 26,9 GB, lo que la hace ejecutable en Macs con memoria unificada suficiente (por ejemplo, 32 GB o más). El modelo hereda del original una arquitectura que soporta teóricamente contextos de hasta 512K tokens, plantilla de chat, controles de razonamiento y formato de tool calling basado en XML, lo que lo hace apto tanto para uso conversacional como para agentes. La licencia Apache 2.0 permite su uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaMA (transformer decoder; detalles adicionales no disponibles) |
| Parámetros totales | 33.118.977.024 |
| Parámetros activos | no disponible (no consta como MoE) |
| Longitud de contexto | Hasta 512K tokens según la arquitectura original; solo validado hasta ~8K en esta cuantización |
| Tipos de cuantización | 6 bits uniforme (módulos cuantizables), cuantización afín con group size 64 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Nanbeige 4.3 33B sigue una arquitectura de tipo LLaMA (transformer decoder), según las etiquetas del repositorio. La cuantización de PocketAiHub aplica un esquema uniforme de 6 bits a los módulos cuantizables, con cuantización afín y group size 64, usando MLX 0.32.2 y MLX-LM 0.31.3. Se conservan la plantilla de chat original, el tokenizador, los controles de razonamiento y la configuración RoPE del modelo fuente.

Sobre el proceso de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) no hay datos disponibles en la información proporcionada. Tampoco consta si la arquitectura emplea técnicas como decodificación especulativa o atención lineal. La documentación indica que el modo de razonamiento ("thinking") está habilitado por defecto y que, para agentes multi-turno, se debe preservar el razonamiento previo y usar formato de tool calls en XML.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat propia.
- Razonamiento paso a paso mediante modo "thinking" habilitado por defecto (con controles para activarlo o desactivarlo según el runtime).
- Generación de código: el propio README ilustra su uso con un prompt de generador de decoradores de reintentos en Python.
- Tool calling mediante formato XML, con soporte para rutas de herramientas en XML/JSON.
- Soporte para agentes multi-turno: se recomienda preservar el razonamiento previo entre turnos.
- Recuperación de información en contextos largos: la sonda de evaluación local cubre prompts de ~8K tokens; el soporte teórico llega a 512K tokens (no validado en esta cuantización).
- Multilingüe limitado a inglés y chino; no hay evidencia de otros idiomas.

## Casos de uso

- Generación de código en local: gracias al formato MLX, un desarrollador con un Mac con memoria unificada suficiente puede generar y refactorizar código Python u otros lenguajes sin depender de APIs externas, usando `mlx_lm.generate` directamente.
- Asistentes conversacionales bilingües chino-inglés: el soporte nativo de ambos idiomas lo hace adecuado para productos dirigidos a mercados chino-parlantes con necesidades de inglés, manteniendo el despliegue en local.
- Agentes con tool calling: el formato XML de tool calls y la recomendación de preservar el razonamiento entre turnos permiten construir pipelines de agentes que invocan funciones de forma fiable, con temperatura 1.0/top-p 0.95 según la recomendación del equipo original.
- Razonamiento complejo con thinking mode: para tareas de matemáticas, planificación o análisis que se benefician de razonamiento explícito, el modo thinking por defecto (temperatura 0.6/top-p 0.95) permite respuestas más deliberadas.
- Procesamiento de documentos largos: la arquitectura soporta teóricamente 512K tokens, lo que habilita resumen y consulta sobre documentos extensos, aunque en esta cuantización solo se ha validado hasta ~8K tokens y contextos largos exigen memoria KV adicional.
- Prototipado y evaluación de modelos en Apple Silicon: la existencia de manifiestos de reproducibilidad (`artifact-manifest.json`, `release-manifest.json`), hashes SHA-256 y datos de evaluación bajo `evaluation/` lo convierte en un buen candidato para equipos que auditan cuantizaciones antes de producción.
- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en inglés y chino; el modo thinking y la plantilla de chat original facilitan respuestas coherentes en diálogos largos, siempre con límites de generación adecuados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado mediciones locales de regresión de la cuantización, no comparables con benchmarks upstream:

| Check | Cuantización 6-bit | Referencia BF16 |
|---|---:|---:|
| Casos superados en suite local (100 casos) | 90/100 | 88/100 |
| Salidas truncadas | 1 | 1 |
| Drift KL medio (WikiText, 8 fragmentos de 512 tokens) | 0,033143 | — |
| Acuerdo top-1 con BF16 | 92,794 % | — |

El hardware de medición fue un Apple M5 Max con 128 GiB de memoria unificada, con decodificación greedy y thinking desactivado salvo en una sonda específica. La suite incluyó 80 casos de capacidades, 16 rutas de herramientas XML/JSON, dos casos en chino, una sonda de thinking y una sonda de recuperación de ~8K tokens. Se trata de una regresión de conversión, no de una reproducción de benchmarks del modelo original.

## Requisitos de hardware

- VRAM/memoria estimada: el payload cuantizado ocupa 26,9 GB (decimales); la memoria en ejecución es adicional (KV cache, activaciones), por lo que se recomienda al menos 32 GB de memoria unificada, siendo 64 GB o más lo cómodo para contextos largos.
- GPU recomendadas: al ser un modelo MLX, está orientado a Apple Silicon (M1/M2/M3/M4/M5). En la documentación se ha validado sobre un Apple M5 Max con 128 GiB de memoria unificada. No hay datos de rendimiento en GPU NVIDIA.
- Consumer GPUs: no es aplicable directamente a GPU NVIDIA de consumo (RTX 4090, etc.) en este formato MLX; para hardware Apple, cabe en Macs con 32 GB o más de memoria unificada, con margen ajustado para contextos largos.
- Despliegue: MLX-LM (versión validada 0.31.3) mediante `mlx_lm.generate` o `mlx_lm.server`. Los runtimes compatibles deben soportar las opciones de la plantilla de chat original. No hay evidencia de compatibilidad con vLLM, llama.cpp, Ollama o TGI en este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-6bit (este) | 33,1 B | 512K (teórico), ~8K validado | 6-bit MLX, group size 64 | Apache 2.0 | Hugging Face, 26,9 GB |
| Nanbeige/Nanbeige4.3-33B (original) | 33,1 B | 512K (teórico) | BF16 | Apache 2.0 | Hugging Face |
| Qwen2.5-32B-Instruct | 32,5 B | 128K | BF16 y cuantizaciones comunitarias (GGUF, AWQ, GPTQ) | Apache 2.0 (variantes base) | Hugging Face, amplio ecosistema |

Nota: la comparativa con Qwen2.5-32B es orientativa, como modelo de tamaño similar con soporte chino-inglés; no hay datos de rendimiento comparativo directo en la información disponible.

## Limitaciones y advertencias

- Limitación heredada conocida: en modo greedy sin thinking, la referencia BF16 entra en bucles repetitivos con instrucciones de sílabas repetidas cortas hasta el límite de tokens; esta cuantización hereda el problema y no lo repara. Se recomienda usar el modo thinking por defecto y límites de generación adecuados.
- Contexto: aunque la arquitectura soporta 512K tokens, solo se ha validado hasta ~8K tokens en esta cuantización y hardware concreto; contextos mayores requieren memoria KV adicional y no están garantizados.
- Idiomas: soporte limitado a inglés y chino; no hay evidencia de rendimiento en castellano u otros idiomas.
- Riesgo de alucinación: no se han publicado evaluaciones de alucinación; al tratarse de un LLM generativo, debe asumirse riesgo estándar de alucinación, especialmente en modo sin thinking.
- Sesgos: no hay información publicada sobre sesgos del modelo original en la documentación disponible.
- Licencia: Apache 2.0 permite uso comercial; sin restricciones relevantes documentadas.
- Procedencia: se trata de una conversión independiente de PocketAiHub, no de una publicación oficial del equipo Nanbeige; los corpora de calibración y WikiText no se redistribuyen, y la validación es una regresión de conversión local, no una prueba de paridad general de calidad con el modelo original.

## Enlaces

- Modelo cuantizado: https://huggingface.co/PocketAiHub/Nanbeige4.3-33B-MLX-6bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Autor (PocketAiHub): https://huggingface.co/PocketAiHub

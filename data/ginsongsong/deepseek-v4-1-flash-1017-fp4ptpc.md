# ginsongsong/DeepSeek-V4.1-Flash-1017-FP4PTPC

## Resumen

DeepSeek-V4.1-Flash-1017-FP4PTPC es un checkpoint de servicio derivado de DeepSeek-V4.1-Flash-1017, publicado por el usuario ginsongsong en Hugging Face. No se trata del modelo original de DeepSeek, sino de una conversión de cuantización mixta FP4/PTPC orientada a inferencia sobre AMD ROCm (concretamente gfx942). El modelo base es un transformer multimodal de tipo image-text-to-text con 484.619.644.114 parámetros totales y una ventana de contexto de 1M tokens, según la documentación del autor original.

La relevancia de esta ficha radica en que documenta un artefacto de despliegue, no un modelo nuevo: el checkpoint mezcla tensores FP8 convertidos a escala por canal PTPC (290 lineales elegibles), expertos enrutados MXFP4 que permanecen empaquetados y 67 tensores FP8 preservados. El resultado es un checkpoint FP4PTPC que no es un W8A8 completo y que requiere runtimes con soporte específico para DeepSeek-V4.1 en gfx942 y para la mezcla MXFP4/PTPC.

El modelo base DeepSeek-V4.1-Flash-1017 es una actualización menor de DeepSeek-V4.1-Flash que mejora razonamiento, código, tareas agénticas y benchmarks visuales, reduciendo además el tiempo de ejecución y la longitud de salida. La licencia es MIT tanto en el checkpoint derivado como en el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), con expertos enrutados MXFP4 y tensores MTP/DSpark; detalles completos de la arquitectura del modelo base no disponibles |
| Parametros totales | 484.619.644.114 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (ventana de contexto recomendada por el autor original) |
| Tipos de cuantizacion | Checkpoint mixto FP4/PTPC: `w8a8_fp8` con activaciones dinámicas por token, 290 lineales FP8 convertidos a PTPC por canal (`F32 [N, 1]`), expertos enrutados MXFP4 empaquetados, 67 tensores FP8 preservados |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El checkpoint deriva de DeepSeek-V4.1-Flash-1017, cuyo contrato de cuantización de origen declara `quant_method=fp8`, `weight_block_size=[32, 32]` y `expert_dtype=fp4`. La conversión aplicada en este repositorio convierte 290 lineales FP8 con escala de bloque en lineales PTPC con escala por canal (`F32 [N, 1]`), mantiene los tensores de expertos enrutados MXFP4 y sus escalas nativas empaquetados en FP4, y preserva los tensores nativos MTP/DSpark, las tablas de embeddings Engram y los tensores `wo_a` en sus contratos de origen. Los recuentos exactos y totales de bytes están en `ptpc_conversion_manifest.json`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información proporcionada. El autor original menciona que DeepSeek-V4.1-Flash-1017 es una actualización menor de DeepSeek-V4.1-Flash con mejoras en razonamiento, código, tareas agénticas y benchmarks visuales, además de reducción de tiempo de ejecución y longitud de salida, pero no detalla innovaciones arquitectónicas concretas (decodificación especulativa, atención lineal, etc.) más allá de la presencia de tensores MTP/DSpark y embeddings Engram.

## Capacidades

- Generación de texto y razonamiento de propósito general, con modo de pensamiento (thinking mode) y esfuerzo de razonamiento numérico configurable, según la implementación de referencia de encoding.
- Generación y edición de código, con soporte para tareas de ingeniería de software (Terminal-Bench, DeepSWE, ProgramBench, NL2Repo-Bench en los benchmarks del autor original).
- Capacidades multimodales de imagen a texto: el pipeline declarado es `image-text-to-text` y la implementación de encoding cubre contenido de imagen intercalado.
- Soporte de tool calling y function calling, con formato de prompt específico gestionado por `deepseek-recipe` (conversión de Messages, Chat Completions y Responses API).
- Soporte de agentes y razonamiento multi-paso, con mensajes de sistema a mitad de conversación.
- Capacidades multilingües: no disponibles en la información proporcionada (el campo de idiomas no está relleno).
- Capacidades visuales evaluadas en benchmarks del autor original: Chartography, BabyVision y ZeroBench con herramientas.

## Casos de uso

- Inferencia multimodal en producción sobre AMD ROCm: el checkpoint está diseñado específicamente para gfx942 con soporte MXFP4/PTPC, por lo que encaja en despliegues que ya operan hardware AMD Instinct y necesitan reducir huella de memoria frente al checkpoint FP8 original.
- Automatización de tareas de ingeniería de software: con contexto de 1M tokens y soporte de tool calling, el modelo puede gestionar sesiones de agente tipo Terminal-Bench o DeepSWE donde se encadenan comandos, lecturas de repositorio y ediciones de código.
- Análisis de documentación técnica extensa con imágenes intercaladas: la ventana de 1M tokens y el pipeline image-text-to-text permiten procesar manuales, diagramas y capturas en una sola pasada sin troceado agresivo.
- Asistentes de razonamiento con esfuerzo configurable: el modo thinking y el esfuerzo numérico permiten ajustar latencia y coste por consulta, útil en pipelines donde algunas peticiones requieren razonamiento profundo y otras respuestas rápidas.
- Generación de código en pipelines de CI/CD: el soporte de function calling y el formato de prompt mantenido por `deepseek-recipe` facilitan integrar el modelo como paso de revisión o generación de parches dentro de flujos automatizados.
- Evaluación comparativa de cuantizaciones: al ser un checkpoint derivado con manifiesto de conversión (`ptpc_conversion_manifest.json`), sirve para medir el impacto de la mezcla FP4/PTPC frente al FP8 original en tareas de razonamiento y código.
- Despliegue de agentes con mensajes de sistema a mitad de conversación: la implementación de encoding cubre este patrón, lo que permite inyectar políticas o contexto operativo sin reiniciar la sesión.

## Benchmarks y rendimiento

Resultados publicados por el autor del modelo base (DeepSeek-V4.1-Flash-1017) frente a alternativas. No se han publicado resultados específicos del checkpoint FP4PTPC en la información disponible.

| Benchmark | DS-V4.1-Flash-1017 | DS-V4.1-Flash | K3 | GLM-5.3 | GPT-5.6 Sol | Opus 5 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| HLE w/o tools | 42.6 (44.0†) | 36.8 (39.1†) | 43.5 | 42.0† | 44.5 | 56.3 |
| Terminal-Bench 4.0 | 42.3 | 31.2 | 12.6 | 37.9 | 39.9 | 51.8 |
| DeepSWE v1.1 | 77.0 | 74.2 | 67.5 | 66.9 | 73.0 | 74.0 |
| ProgramBench | 29.1 | 20.3 | 17.5 | 19.0 | 23.0 | 37.0 |
| NL2Repo-Bench | 68.2 | 65.4 | 58.0 | 58.0 | 56.8 | 75.3 |
| Automation-Bench v1.0.6 | 60.5 | 54.8 | 46.7 | 48.8 | 45.8 | 50.3 |
| Agents’ Last Exam | 35.4 | 31.8 | 27.6 | 28.5 | 26.7 | 28.6 |
| Apex Bench v1.1 | 72.1 | 64.6 | 47.8 | 56.6 | 54.3 | 65.8 |
| Chartography (w/tools) | 83.0 | 78.9 | 68.1 | — | 79.9 | 84.0 |
| BabyVision (w/tools) | 92.5 | 89.6 | 85.7 | — | 88.9 | 94.1 |
| ZeroBench-main (w/tools) | 51.0 | 49.0 | 41.0 | — | 53.0 | 52.0 |

† denota el subconjunto solo texto de HLE. Terminal-Bench 4.0 usa el harness Claude Code y DeepSWE v1.1 usa Mini-SWE-V2, según el autor original.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 518,2 GB en safetensors, por lo que se necesita al menos esa cantidad de memoria agregada para cargar el checkpoint completo; no se dispone de estimaciones por cuantización adicionales en la información proporcionada.
- GPU recomendadas: AMD Instinct con arquitectura gfx942 (por ejemplo, MI300X) para soportar el contrato MXFP4/PTPC del checkpoint; GPU NVIDIA (A100, H100, RTX 4090) no están validadas para este artefacto concreto según el aviso del autor.
- Cabe en GPU consumer: no disponible; el tamaño del repo (518,2 GB) excede con holgura la VRAM de cualquier GPU consumer actual.
- Opciones de despliegue: transformers (librería declarada); el autor advierte que runtimes estándar sin soporte DeepSeek-V4.1 gfx942 y MXFP4/PTPC pueden no reconocer o ejecutar correctamente el checkpoint. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-FP4PTPC (este) | 484,6 B | 1M | MIT | Hugging Face (ginsongsong) | Checkpoint derivado mixto FP4/PTPC para ROCm gfx942 |
| DeepSeek-V4.1-Flash-1017 | no disponible | 1M | MIT | Hugging Face (deepseek-ai) | Modelo base original, FP8 con expertos FP4 |
| DeepSeek-V4.1-Flash | no disponible | 1M | MIT | Hugging Face (deepseek-ai) | Versión previa, menor rendimiento en benchmarks |
| K3 | no disponible | no disponible | no disponible | no disponible | Comparable en benchmarks HLE y Terminal-Bench |
| GLM-5.3 | no disponible | no disponible | no disponible | no disponible | Comparable en benchmarks de agentes |
| GPT-5.6 Sol | no disponible | no disponible | no disponible | no disponible | Comparable en benchmarks HLE y código |
| Opus 5 | no disponible | no disponible | no disponible | no disponible | Comparable en benchmarks de razonamiento y agentes |

## Limitaciones y advertencias

- Este checkpoint no es el modelo original de DeepSeek: es una conversión mixta FP4/PTPC realizada por un tercero (ginsongsong) y no un W8A8 completo.
- Runtimes estándar sin soporte DeepSeek-V4.1 gfx942 y MXFP4/PTPC pueden no reconocer o ejecutar correctamente el checkpoint, lo que puede provocar errores silenciosos o resultados incorrectos.
- El modelo base no incluye plantilla de chat en formato Jinja; es necesario usar la implementación de referencia en `encoding/` o `deepseek-recipe` para codificar prompts correctamente.
- Los benchmarks mostrados corresponden al modelo base original, no a este checkpoint cuantizado; el impacto de la conversión FP4/PTPC en la calidad no está documentado.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información proporcionada; aplican los riesgos generales de modelos de lenguaje de gran escala.
- Idiomas soportados: no disponibles; conviene validar el comportamiento multilingüe antes de usarlo en producción.
- Licencia MIT permite uso comercial, pero el aviso del autor sobre incompatibilidad de runtimes debe evaluarse antes de desplegar.
- El tamaño del repositorio (518,2 GB) y los 484,6 B de parámetros implican requisitos de infraestructura elevados y costes de servicio significativos.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/ginsongsong/DeepSeek-V4.1-Flash-1017-FP4PTPC
- Modelo base DeepSeek-V4.1-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Organización DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- Informe técnico (PDF): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Repositorio deepseek-recipe: https://github.com/deepseek-ai/deepseek-recipe
- Web de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Twitter de DeepSeek AI: https://twitter.com/deepseek_ai

# djdeniro/GLM-5.3-Flash-RFA-RFI8-8xR9700

## Resumen

Este checkpoint es una cuantización compuesta del modelo GLM-5.3-Flash de Z.ai, realizada por el usuario djdeniro y adaptada específicamente para servirse con vLLM sobre hardware AMD Radeon R9700 (RDNA4, gfx1201). El modelo base, GLM-5.3-Flash, es un MoE multimodal de 321B parámetros totales (18B activos) con arquitectura híbrida que combina atención lineal KDA y atención sparse-MLA, y que destaca en tareas de codificación y razonamiento agéntico. Esta variante aplica un esquema de cuantización mixto RFA + RFI8 que reduce el peso en disco a 197,8 GB (4,93 bpw promedio), manteniendo la mayor parte de la capacidad del modelo original.

La relevancia de esta ficha radica en que es uno de los primeros intentos de ejecutar un modelo de esta escala en GPUs AMD de consumo profesional (RDNA4), un segmento tradicionalmente mal soportado por el ecosistema de inferencia. El autor reporta una mejora en GPQA Diamond (85,1% frente al 80,8% del modelo servido vía API de Z.ai), aunque con una metodología que conviene revisar. El checkpoint está pensado para despliegues con vLLM en configuraciones de 8 GPUs, con un contexto máximo de 190.080 tokens en modo bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm5NextForConditionalGeneration (MoE híbrido: 34 capas KDA de atención lineal + 11 capas DSA de sparse-MLA) |
| Parametros totales | 321.342.220.638 (~321,3B) según model card; safetensors reporta 169.221.846.206 |
| Parametros activos | ~18B (top-8 de 288 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 190.080 tokens (con KV en bf16) |
| Tipos de cuantizacion | RFA (4,5 bpw) en expertos MoE, RFI8 (8 bpw) en atención/experto compartido/lineales densos, BF16/FP32 en embeddings, torre de visión, normas y capa MTP. Promedio 4,93 bpw |
| Idiomas soportados | No disponible (el modelo base GLM-5.3-Flash es multilingüe, pero esta variante no especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors (25 shards, 197,8 GB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer MoE multimodal con 45 capas: 34 de ellas usan KDA (atención lineal con estado recurrente) y 11 usan DSA (sparse-MLA). Incorpora hiperconexiones mHC, una capa de draft MTP (nextn) y una torre de visión nativa que acepta imágenes y vídeo. El entrenamiento del base no se detalla en la información disponible, pero según el blog de Z.ai, GLM-5.3 comparte base con GLM-5.2 y todas las mejoras provienen del post-entrenamiento, con un incremento del 50% en el benchmark interno Z.ai Code Bench.

Esta variante concreta no modifica la arquitectura, sino que aplica un esquema de cuantización compuesto: los expertos enrutados (42 capas × 288 expertos) se cuantizan a 4,5 bits con el método RFA, mientras que las capas de atención, el experto compartido y los lineales densos se mantienen en 8 bits (RFI8). Las embeddings, la torre de visión, las normas y la capa MTP se dejan en BF16/FP32. El resultado es un checkpoint de 197,8 GB, un 60% del tamaño del original FP8 (328,3 GB) y un 31% del BF16 (642,7 GB). El proceso de cuantización y los kernels asociados provienen del runtime `tcclaviger/vllm` de IronLLM Labs, y el overlay de adaptación a RDNA4 se publica en un repositorio complementario.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de razonamiento explícito (reasoning effort configurable, recomendado "low" para uso conversacional).
- Comprensión multimodal: acepta imágenes y vídeo como entrada, con redimensionado que preserva la relación de aspecto (mínimo 384×384, máximo 1280×1280) y presupuesto de tokens de imagen configurable.
- Codificación de software: el modelo base destaca en benchmarks de coding y agentes, superando a GLM-5.2 en un 50% en el benchmark interno de Z.ai.
- Soporte de tool calling y function calling (heredado del modelo base, aunque no se detalla en esta variante).
- Capacidades agénticas y razonamiento multi-paso, reforzadas por el modo de razonamiento de alto esfuerzo.
- Multilingüismo: no confirmado explícitamente en esta variante, pero el modelo base GLM-5.3-Flash es multilingüe.
- Decodificación especulativa mediante la capa MTP (draft), aunque está deshabilitada en la configuración de referencia por un bloqueo en el KV-group del drafter.

## Casos de uso

- Despliegue de un asistente multimodal en infraestructura AMD RDNA4: permite ejecutar un modelo de 321B en 8 GPUs Radeon R9700 con vLLM, algo inédito para este hardware, usando la configuración de tensor-parallel-size 8 y cuantización rfi.
- Razonamiento científico y técnico de alto nivel: el checkpoint reporta un 85,1% en GPQA Diamond, lo que lo hace adecuado para tareas de investigación que requieran responder preguntas de física, química y biología con justificaciones extensas.
- Generación de código en entornos con restricción de hardware: al ocupar 197,8 GB, cabe en 8 GPUs de 24 GB, permitiendo servir un modelo de nivel frontier en clústeres modestos.
- Análisis de documentos con imágenes y texto: la entrada multimodal nativa permite procesar capturas de pantalla, diagramas y vídeos cortos junto con instrucciones textuales.
- Prototipado de agentes autónomos: el modo de razonamiento de alto esfuerzo y el soporte de tool calling (heredado) permiten construir agentes que planifican y ejecutan múltiples pasos.
- Evaluación comparativa de técnicas de cuantización: este checkpoint sirve como caso de estudio para medir el impacto de la cuantización compuesta RFA/RFI8 en tareas de razonamiento, comparando con el modelo FP8 original.

## Benchmarks y rendimiento

La model card del autor reporta un único benchmark, GPQA Diamond, comparando este checkpoint con el modelo base servido vía API de Z.ai:

| Configuracion | GPQA Diamond | Correctas | Vacias | Respondidas |
|---|---|---|---|---|
| GLM-5.3-Flash (Z-AI API) | 80,8% | 76 | 6 | 94 |
| GLM-5.3-Flash-RFA-RFI8 | 85,1% | 80 | 6 | 94 |

Detalles de la evaluación: reasoning effort "high", longitud máxima de salida 32k tokens, contexto total de 32k por tarea (6 tareas superaron los 32k tokens de salida). No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La mejora de 4,3 puntos porcentuales sobre el modelo base es inusual para una cuantización y podría deberse a diferencias en el entorno de ejecución o a variabilidad del muestreo; se recomienda cautela al interpretar este dato.

## Requisitos de hardware

- Configuración de referencia: 8× AMD Radeon R9700 (RDNA4, gfx1201), con tensor-parallel-size 8 y gpu-memory-utilization 0,95.
- VRAM total necesaria: al menos 197,8 GB (tamaño del checkpoint en disco) más overhead de KV cache y activaciones. Con 8 GPUs de 24 GB se dispone de 192 GB, lo que queda justo; se recomienda 8× 32 GB o más para margen.
- No se especifica si cabe en GPUs consumer de NVIDIA (RTX 4090, etc.); el checkpoint está optimizado para ROCm/RDNA4 y los kernels de cuantización RFA/RFI8 requieren el runtime `tcclaviger/vllm`.
- Opciones de despliegue: vLLM (obligatorio para usar la cuantización rfi), con el overlay de ROCm/RDNA4 del repositorio complementario. No se menciona compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La configuración de referencia limita a 4 secuencias simultáneas (`--max-num-seqs 4`) y usa contexto máximo de 190.080 tokens, lo que sugiere un throughput moderado orientado a baja concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| GLM-5.3-Flash (base, FP8) | 321B total / 18B activo | 1M tokens (según vLLM recipes) | FP8 nativo | MIT | GPUs NVIDIA (H100, A100) |
| Este checkpoint (RFA+RFI8) | 321B total / 18B activo | 190.080 tokens (bf16 KV) | RFA 4,5 bpw + RFI8 8 bpw | MIT | AMD RDNA4 (R9700) |
| GLM-5.3 (modelo mayor) | No disponible | No disponible | No disponible | MIT | No disponible |

No se dispone de datos de rendimiento comparativo con otros MoE de tamaño similar (p. ej., DeepSeek-V3, Qwen3-MoE) en la información proporcionada. La comparación principal es con el modelo base, del que deriva.

## Limitaciones y advertencias

- La capa MTP (decodificación especulativa) está deshabilitada en la configuración de referencia por un bloqueo en el KV-group del drafter, lo que reduce el rendimiento de generación.
- El uso de KV cache en fp8 está roto en esta arquitectura (escalas basura provenientes del estado recurrente de KDA sin inicializar); es obligatorio usar bf16 KV (`--kv-cache-dtype auto`).
- Para uso conversacional se recomienda `reasoning_effort="low"`; el valor por defecto (Max) consume 16k+ tokens de pensamiento antes de generar contenido, lo que puede resultar en respuestas muy lentas o truncadas.
- El checkpoint está pensado exclusivamente para el runtime `tcclaviger/vllm` y hardware RDNA4; no se garantiza su funcionamiento en otras plataformas.
- La evaluación de GPQA Diamond muestra una mejora inesperada frente al modelo base, que podría deberse a factores externos (muestreo, entorno) y no a la cuantización en sí.
- No se han documentado sesgos específicos de esta variante, pero al derivar de un modelo base entrenado con datos web, es probable que herede sesgos sociales y culturales.
- Riesgo de alucinación en tareas de razonamiento extenso, especialmente con reasoning effort alto y salidas de 32k tokens.
- La licencia MIT permite uso comercial, pero los kernels de cuantización y el runtime pertenecen a IronLLM Labs (tcclaviger/vllm), cuyos términos de uso no se detallan en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/djdeniro/GLM-5.3-Flash-RFA-RFI8-8xR9700
- Repositorio overlay ROCm/RDNA4: https://huggingface.co/djdeniro/GLM-5.3-Flash-rocm-r9700
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Modelo GLM-5.3 (versión mayor): https://huggingface.co/zai-org/GLM-5.3
- Blog de Z.ai sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/glm-5.3-flash
- Receta vLLM para GLM-5.3-Flash: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- Runtime vLLM de IronLLM Labs: https://hub.docker.com/r/tcclaviger/vllm

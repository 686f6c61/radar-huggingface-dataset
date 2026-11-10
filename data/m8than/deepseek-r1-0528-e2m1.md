# m8than/DeepSeek-R1-0528-E2M1

## Resumen

DeepSeek-R1-0528-E2M1 es una conversión de pesos del modelo de razonamiento DeepSeek-R1-0528 de DeepSeek, publicada por el usuario m8than en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetado del checkpoint oficial con una estrategia de cuantización mixta orientada a hardware AMD: las capas de atención, MLP densa y expertos compartidos conservan los bytes FP8 E4M3 originales con escalas de bloque FP32, mientras que los expertos enrutados (incluida la capa NextN) se han convertido a un formato E2M1 (4 bits) con tensores U32 y escalas FP32 por bloques de 128×128.

El modelo base es un transformer MoE de 671.000 millones de parámetros totales (37.000 millones activos por token), con una ventana de contexto nativa de 128.000 tokens y modo de razonamiento extendido. Esta conversión conserva esa arquitectura y esos parámetros (el safetensors reporta 102.454.668.032 parámetros almacenados, coherente con la compresión de los expertos enrutados), pero cambia el formato de almacenamiento y, por tanto, el runtime necesario para servirlo.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización específica de hardware (Furnace gfx942) que no es estándar; por otro, advierte de que la conversión de los expertos enrutados es lossy y de que el autor no ejecutó ninguna prueba de precisión ni de inferencia. Es, por tanto, un artefacto experimental para entornos AMD MI300/MI325 con el stack SGLang/Furnace, no un modelo listo para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (deepseek_v3) con capa NextN |
| Parámetros totales | 671.000 millones (modelo base); 102.454.668.032 parámetros almacenados en safetensors |
| Parámetros activos | 37.000 millones (modelo base) |
| Longitud de contexto | 128.000 tokens (modelo base) |
| Tipos de cuantización | Mixta: FP8 E4M3 block-128 (atención, MLP densa, expertos compartidos) + E2M1 4-bit block-128 (expertos enrutados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code, quant_method: moe_e2m1) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-R1-0528 emplea una arquitectura transformer de mezcla de expertos (MoE) con atención multi-cabeza latente (MLA) y una capa NextN de predicción multi-token, que acelera la decodificación especulativa. Los 671.000 millones de parámetros se reparten en expertos enrutados más un conjunto de expertos compartidos, de modo que solo 37.000 millones se activan por token. El entrenamiento del base incluye preentrenamiento masivo, ajuste supervisado y etapas de RL (GRPO) para razonamiento de cadena larga; los detalles exactos de composición del dataset y número de tokens no se recogen en la información disponible.

Esta conversión concreta no entrena nada: reempaqueta los pesos del checkpoint oficial en la revisión `4236a6af538feda4548eca9ab308586007567f52`. Las capas densas y los expertos compartidos se mantienen byte a byte en FP8 E4M3 con escalas FP32 por bloque de 128×128 (496 tensores verificados por hash como idénticos al origen). Los expertos enrutados, en cambio, se convierten a E2M1 canónico (nibble bajo primero), con tensores `weight` en U32 y `weight_scale` en FP32, también por bloques de 128×128. El resultado es un checkpoint que requiere el runtime Furnace SGLang con soporte de dense-FP8 + E2M1, kernels AITER/CK y GPUs AMD gfx942; las activaciones usan la ruta E2M1/FP8 block-128 y las salidas son BF16.

## Capacidades

- Generación de texto y razonamiento de cadena larga en modo thinking, heredado de DeepSeek-R1-0528.
- Resolución de problemas matemáticos y de lógica con pasos intermedios explícitos.
- Generación y comprensión de código, incluida la depuración y la refactorización.
- Soporte de tool calling y function calling (capacidad del modelo base).
- Razonamiento multi-paso y flujos agénticos.
- Capacidades multilingües del modelo base (no detalladas en esta conversión).
- Decodificación especulativa mediante la capa NextN incluida en el checkpoint.
- No incluye visión ni audio: es un modelo puramente textual.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de competición y demostraciones paso a paso, aprovechando el modo thinking y la ventana de 128.000 tokens para incluir enunciados y contexto extensos.
- Generación de código en pipelines internos: con tool calling y contexto largo, puede integrarse en flujos de revisión de código donde se pase el repositorio completo como contexto.
- Investigación sobre cuantización extrema: sirve como artefacto para estudiar el impacto de E2M1 block-128 en expertos enrutados frente a FP8, comparando perplejidad y calidad de razonamiento.
- Validación de stacks AMD: útil para equipos que despliegan SGLang/Furnace sobre MI300/MI325 y necesitan un checkpoint compatible con gfx942.
- Análisis de documentos técnicos largos: la ventana de 128.000 tokens permite procesar informes, papers o contratos completos en una sola pasada.
- Agentes de investigación: con razonamiento multi-paso y tool calling, puede orquestar búsquedas y síntesis en entornos controlados.
- Evaluación de robustez ante cuantización lossy: permite medir la degradación de calidad en tareas de razonamiento cuando los expertos se comprimen a 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se realizó ninguna prueba de precisión ni ejecución de inferencia durante la conversión, por lo que no hay datos de MMLU, HumanEval, GSM8K ni de latencia/throughput para esta variante.

## Requisitos de hardware

- GPU: exclusivamente AMD gfx942 (MI300X, MI325X y familia). No es compatible con NVIDIA.
- Runtime: Furnace SGLang con soporte dense-FP8 + E2M1, kernels AITER/CK. No funciona con vLLM, llama.cpp, Ollama ni TGI estándar.
- VRAM estimada: el repo ocupa 356 GB; se necesita al menos esa cantidad para cargar los pesos, más overhead de activaciones y KV cache. Con contexto de 128.000 tokens el consumo adicional es considerable.
- No cabe en GPU de consumo (RTX 4090, 3090, etc.).
- Latencia y throughput: no disponibles; el autor no ejecutó inferencia.
- Incompatibilidad: no es MXFP4 nativo y falla con loaders que esperan escalas group-32 de MXFP4.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Hardware |
|---|---|---|---|---|---|---|
| DeepSeek-R1-0528 (original) | 671B | 37B | 128K | FP8/BF16 | MIT | NVIDIA/AMD estándar |
| DeepSeek-R1-0528-E2M1 | 671B | 37B | 128K | FP8 + E2M1 | MIT | AMD gfx942 (Furnace) |
| DeepSeek-V3 | 671B | 37B | 128K | FP8/BF16 | MIT | NVIDIA/AMD estándar |

La comparación con el original es la más relevante: misma arquitectura y licencia, pero esta variante reduce el tamaño de los expertos enrutados a 4 bits a costa de pérdida de precisión no medida y de atarse a un runtime específico de AMD.

## Limitaciones y advertencias

- La conversión de expertos enrutados a E2M1 es lossy; no hay medición de la degradación de calidad.
- No se realizó ninguna prueba de inferencia ni de precisión durante la conversión.
- Requiere hardware AMD gfx942 y el stack Furnace SGLang; no es portable a otros runtimes.
- Incompatible con loaders que esperan MXFP4 group-32.
- Riesgo de alucinación inherente al modelo base, agravado potencialmente por la cuantización.
- Idiomas soportados no documentados en esta variante.
- Licencia MIT permite uso comercial, pero la falta de validación hace desaconsejable su uso en producción sin evaluación previa.
- Sesgos del modelo base no documentados en esta conversión.

## Enlaces

- Hugging Face: https://huggingface.co/m8than/DeepSeek-R1-0528-E2M1
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528
- Repositorio DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Paper DeepSeek-V3: https://arxiv.org/abs/2412.19437
- Paper DeepSeek-R1: https://arxiv.org/abs/2501.12948

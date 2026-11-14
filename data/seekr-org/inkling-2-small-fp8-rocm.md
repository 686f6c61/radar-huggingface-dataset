# seekr-org/Inkling-2-Small-FP8-ROCm

## Resumen

Inkling-2-Small-FP8-ROCm es una conversión de precisión del modelo Inkling 2 Small MXFP8 desarrollado por Thinking Machines Lab, publicada por seekr-org y optimizada específicamente para inferencia en GPUs AMD MI300X bajo ROCm. Se trata de un modelo de mezcla de expertos (MoE) multimodal de tipo image-text-to-text, con aproximadamente 594.220 millones de parámetros totales en el checkpoint publicado y un repositorio de 1.206,9 GB que incluye los pesos objetivo, los pesos de visión y un checkpoint MTP separado.

El modelo base emplea un esquema de cuantización MXFP8 por bloques; esta conversión lo transforma a FP8 nativo E4M3FNUZ con escalado por fila (row-scaled), aplicando escalas de potencia de dos tanto a pesos como a activaciones de los expertos. La verificación reportada por el autor indica que el 99,99881% de los 587.068.342.272 valores de expertos se reconstruyen exactamente a los mismos valores FP32 que el checkpoint MXFP8 de origen, con un error RMS relativo añadido de 5,21049e-8.

Su relevancia es doble: por un lado, permite ejecutar un modelo MoE de gran tamaño con ventana de contexto de 262.144 tokens en hardware AMD, un ecosistema tradicionalmente menos cubierto que NVIDIA; por otro, incorpora decodificación especulativa mediante un borrador DSpark y un parser de razonamiento específico (`inkling`), lo que lo orienta a cargas de trabajo de agentes, matemáticas y generación de código en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con decodificación especulativa DSpark |
| Parámetros totales | 594.220.511.232 |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (`--max-model-len 262144`) |
| Tipos de cuantización | FP8 E4M3FNUZ con escalas por fila (pesos y activaciones de expertos); resto de tensores en precisión upstream (mixed precision) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (48 shards de pesos objetivo + `mtp.safetensors`), configuración para vLLM |

## Arquitectura y entrenamiento

La información disponible no detalla la composición del dataset de entrenamiento ni las etapas de alineación (RLHF/DPO) del modelo original. Lo que sí se documenta es la arquitectura de despliegue: un MoE con 96 tensores de proyección de expertos convertidos a FP8 nativo AMD E4M3FNUZ, con una escala FP32 por canal de salida de experto y activaciones cuantizadas dinámicamente por token en E4M3FNUZ. Ambos métodos de escala usan la menor potencia de dos normal en FP32 al menos `amax / 240`, con un mínimo de `float32.tiny`. Los 1.418 tensores no pertenecientes a expertos, así como el checkpoint MTP, se verificaron bit a bit sin cambios: atención, proyecciones densas, visión y el borrador DSpark conservan la precisión upstream.

La innovación técnica principal de esta conversión es la selección de escalas de potencia de dos, que preserva las mantisas MXFP8 de origen cuando sus exponentes encajan en el formato de fila. El escaneo completo reporta que el 99,99881% de los valores se reconstruyen exactamente, con un error absoluto máximo de reconstrucción de 1,90735e-6 y 870.110 valores fuente distintos de cero que sufren underflow a cero. Además, el modelo incorpora decodificación especulativa DSpark con 7 tokens de borrador y muestreo probabilístico, junto con un parser de razonamiento dedicado y soporte de entrada multimodal con hasta 2 imágenes por prompt en la configuración validada.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 262.144 tokens.
- Razonamiento explícito con modo de pensamiento controlable mediante `chat_template_kwargs.reasoning_effort` (valor 0 solicita respuestas directas, aunque es una sugerencia y no impide la emisión de razonamiento).
- Razonamiento matemático: la evaluación reportada incluye GSM8K con 48/50 aciertos en la muestra fija de 50 problemas.
- Generación de código: HumanEval con 20/20 en la muestra de 20 problemas, y 20/20 en las 20 tareas de programación muestreadas del benchmark de throughput.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con pesos de visión conservados en precisión upstream.
- Decodificación especulativa mediante borrador DSpark, con 7 tokens especulativos y muestreo probabilístico.
- Restricciones de prosa verificadas en las mediciones (6/6 en la configuración publicada).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no documentadas explícitamente en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas tipo GSM8K con razonamiento intermedio, útil en herramientas educativas o de verificación de cálculos, con la posibilidad de desactivar el modo de razonamiento para respuestas directas.
- Generación y revisión de código en pipelines: con HumanEval 20/20 en la muestra reportada, encaja en tareas de autocompletado, generación de tests y revisión automatizada dentro de flujos de CI/CD que consuman un endpoint vLLM compatible con OpenAI.
- Análisis de documentos largos con imágenes: la ventana de 262.144 tokens y el soporte image-text-to-text permiten procesar informes extensos con figuras, tablas escaneadas o capturas en una sola pasada.
- Asistentes conversacionales de dominio técnico: el parser de razonamiento `inkling` y el control de `reasoning_effort` permiten alternar entre respuestas concisas y cadenas de razonamiento largas según el tipo de consulta.
- Procesamiento por lotes de alta concurrencia en hardware AMD: con 8 GPUs MI300X y tensor-parallel-size 8 se alcanzan 807,66 tokens/s agregados en C8 según las mediciones del autor, adecuado para tareas de generación masiva (resúmenes, extracción, clasificación) en infraestructura ROCm.
- Evaluación comparativa de cuantizaciones: el repositorio incluye `conversion_manifest.json` con estadísticas de error por shard y fingerprints de serialización, lo que lo convierte en un banco de pruebas para estudiar el impacto de FP8 row-scaled frente a MXFP8 en modelos MoE.
- Investigación sobre decodificación especulativa: la configuración DSpark con 7 tokens y muestreo probabilístico permite medir ganancias de throughput frente a decodificación estándar en un modelo de este tamaño.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos con 24 tareas distintas de matemáticas, programación y prosa, 2.016 tokens de entrada y 512 de salida por petición, temperatura 1, razonamiento por defecto, caché de prefijo desactivada y configuración DSpark de 7 tokens probabilísticos:

| Configuración | C1 salida tok/s | C8 agregado tok/s | GSM8K | HumanEval | Restricciones de prosa |
|---|---:|---:|---:|---:|---:|
| V1: escalas amax en pesos y activaciones | 244,62 | 820,75 | 48/50 | 20/20 | 6/6 |
| V2: potencia de dos en pesos, amax en activaciones | 237,73 | 814,39 | 48/50 | 20/20 | 5/6 |
| **V2 publicada: potencia de dos en pesos y activaciones** | **244,06** | **807,66** | **48/50** | **20/20** | **6/6** |

La precisión se midió con muestras fijas de 50 problemas GSM8K y 20 de HumanEval, temperatura cero, `reasoning_effort` cero, límite de 2.048 tokens de salida y concurrencia 8. El autor advierte que son mediciones con prompts cortos y que el throughput incluye prefill, el lote final parcialmente ocupado y los tokens de razonamiento. No se han publicado resultados de benchmarks adicionales (MMLU, MMLU-Pro, MATH, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa aproximadamente 605 GB en pesos; con 8 GPUs MI300X de 192 GiB cada una (1.536 GiB totales) y `--gpu-memory-utilization 0.9` se dispone de margen amplio para KV cache y estados de decodificación especulativa.
- GPU validadas: 8 AMD MI300X (gfx942), 192 GiB por GPU, con tensor-parallel-size 8. Otras arquitecturas no han sido validadas según el autor.
- GPU de consumo: no cabe en GPUs de consumo; el tamaño del checkpoint (más de 600 GB) excede con mucho la memoria de cualquier RTX 4090 o similar, incluso con cuantizaciones adicionales no proporcionadas en este repositorio.
- Despliegue: exclusivamente vLLM sobre ROCm, usando una imagen construida por el pipeline de Seekr GitLab desde código fuente que incluya los controles de escala potencia de dos v2, soporte de Inkling 2 y FP8 por fila pre-cuantizado. Se requieren las variables `OMP_NUM_THREADS=1`, `VLLM_ROCM_USE_AITER=1` y `VLLM_ROCM_USE_AITER_CUSTOM_AR=1`, además de exponer `/dev/kfd` y `/dev/dri` con IPC del host en Docker.
- Throughput medido: 244,06 tokens/s de salida con concurrencia 1 y 807,66 tokens/s agregados con concurrencia 8 en las condiciones descritas. La latencia no se reporta de forma explícita.
- Flags relevantes de servicio: `--quantization inkling2`, `--max-model-len 262144`, `--max-num-batched-tokens 2048`, `--max-num-seqs 8`, `--no-enable-prefix-caching`, `--reasoning-parser inkling`, `--limit-mm-per-prompt '{"image":2}'`, `--speculative-config` con método dspark y `--compilation-config` con `cudagraph_mode: FULL_DECODE_ONLY`.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Hardware validado | Notas |
|---|---:|---|---|---|---|
| seekr-org/Inkling-2-Small-FP8-ROCm | 594.220.511.232 | 262.144 | Apache 2.0 | 8x AMD MI300X | Conversión FP8 row-scaled para ROCm con DSpark |
| thinkingmachines/Inkling-2-Small-MXFP8 | no disponible | no disponible | no disponible | no disponible | Modelo base MXFP8 del que deriva esta conversión |
| Alternativas de tamaño y tarea comparables | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |

La información disponible no permite establecer una comparativa cuantitativa con modelos de la misma categoría; únicamente se documenta la comparación interna entre las variantes V1 y V2 de esta conversión.

## Limitaciones y advertencias

- La fidelidad de pesos no garantiza salidas idénticas al modelo original: la cuantización de activaciones por fila y la acumulación matricial difieren de la ruta original con escalas por bloques.
- Un total de 870.110 valores fuente distintos de cero sufren underflow a cero; valores muy pequeños pueden además redondearse en el rango subnormal.
- Las estadísticas de error miden la conversión adicional respecto a un checkpoint ya cuantizado, no respecto a pesos en precisión completa original.
- El modelo solo ha sido validado en 8 AMD MI300X (gfx942); otras arquitecturas de GPU no están soportadas de forma comprobada.
- La imagen de vLLM debe incluir los controles de escala potencia de dos v2; implementaciones anteriores pueden cargar el formato de pesos por fila pero no seleccionan la ruta de activación probada.
- `reasoning_effort: 0` es solo una sugerencia y no impide que el modelo emita razonamiento, lo que puede afectar a la latencia y al consumo de tokens en producción.
- La caché de prefijo está desactivada en la configuración validada (`--no-enable-prefix-caching`), lo que limita optimizaciones en cargas con prompts repetidos.
- No se dispone de información sobre sesgos, cobertura idiomática ni tasas de alucinación del modelo base en la documentación proporcionada.
- Aunque la licencia es Apache 2.0, deben verificarse las condiciones del modelo base upstream antes de un uso comercial.
- El tamaño del repositorio (1.206,9 GB) y la necesidad de 8 aceleradores MI300X implican un coste de infraestructura elevado para producción.

## Enlaces

- [Modelo en Hugging Face: seekr-org/Inkling-2-Small-FP8-ROCm](https://huggingface.co/seekr-org/Inkling-2-Small-FP8-ROCm)
- [Modelo base: thinkingmachines/Inkling-2-Small-MXFP8](https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8)
- [Revisión v1 del checkpoint](https://huggingface.co/seekr-org/Inkling-2-Small-FP8-ROCm/tree/78a4761861425cf44fdcd688d3bcc0ecc10d90e2)
- [Model card upstream preservada: UPSTREAM_README.md](https://huggingface.co/seekr-org/Inkling-2-Small-FP8-ROCm/blob/main/UPSTREAM_README.md)
- [Manifiesto de conversión: conversion_manifest.json](https://huggingface.co/seekr-org/Inkling-2-Small-FP8-ROCm/blob/main/conversion_manifest.json)
- Repositorio de código, paper o demo adicionales: no disponible en la información proporcionada.

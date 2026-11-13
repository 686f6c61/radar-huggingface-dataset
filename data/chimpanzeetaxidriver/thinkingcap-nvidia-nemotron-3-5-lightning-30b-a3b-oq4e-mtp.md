# chimpanzeetaxidriver/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-mtp

## Resumen

ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-mtp es una cuantización de precisión mixta del modelo bottlecapai/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B, publicada por el usuario chimpanzeetaxidriver. El checkpoint conserva la arquitectura original Nemotron-H (familia nemotron_h) con 32.913 millones de parámetros lógicos, de los cuales 1.335 millones corresponden a una cabeza MTP (multi-token prediction) orientada a decodificación especulativa. La cuantización se ha realizado con oQ (oMLX v0.8.0rc1) en formato MLX, con un promedio efectivo de 4,780 bits por peso y un peso en disco de 19,7 GB.

El modelo base pertenece a la línea Nemotron 3.5 Lightning de NVIDIA, diseñada para inferencia eficiente con razonamiento "token-efficient" (pensamiento compacto). Esta versión cuantizada está pensada para ejecutarse en hardware Apple Silicon mediante la librería MLX, lo que la hace relevante para desarrolladores que quieran desplegar un modelo de ~33B en equipos locales con memoria unificada en lugar de GPUs dedicadas.

La ficha se basa exclusivamente en los metadatos y la model card disponibles. No se han publicado resultados de benchmarks, idiomas soportados ni detalles del dataset de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (tag `nemotron_h`), transformer con cabeza MTP |
| Parametros totales | 32.913.266.240 (32,913B) |
| Parametros activos | no disponible (no se confirma si es MoE; el tag A3B sugiere ~3B activos, sin verificación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ: affine 4-bit grupo 64 (93,13%), affine 8-bit grupo 64 (6,80%), BF16 (0,07%); promedio 4,780 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | MLX (safetensors), repo de 19,7 GB / 18,316 GiB |

## Arquitectura y entrenamiento

El checkpoint deriva del modelo bottlecapai/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B, etiquetado con la arquitectura `nemotron_h` y la familia `nemotron-3.5`. La estructura incluye un modelo de lenguaje de 31,578B parámetros lógicos y una cabeza MTP de 1,335B parámetros, que habilita decodificación multi-token (multi-token prediction) para acelerar la generación. Los tags del repositorio (`token-efficient`, `efficient-thinking`, `fp8`) indican que el modelo base está orientado a razonamiento con uso reducido de tokens y que su formato original es FP8, probablemente para despliegue en vLLM.

La cuantización aplicada con oQ (oMLX v0.8.0rc1) es de precisión mixta: la mayor parte de los pesos (93,13%) se almacenan en affine 4-bit con grupo de 64, mientras que un 6,80% (2,238B parámetros) se mantiene en affine 8-bit, presumiblemente en capas sensibles a la cuantización. Solo 0,024B parámetros permanecen en BF16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento con modo de pensamiento eficiente en tokens (`efficient-thinking`, `token-efficient`).
- Decodificación especulativa mediante cabeza MTP, que permite proponer varios tokens por paso.
- Cuantización orientada a inferencia local en Apple Silicon vía MLX.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 18,3 GiB cabe en equipos Apple Silicon de 32 GB o más, permitiendo ejecutar un modelo de ~33B sin GPU dedicada mediante MLX.
- Asistentes conversacionales de escritorio: el pipeline `conversational` y la ventana de contexto (no especificada) permiten mantener diálogos multi-turno en aplicaciones locales con latencia baja gracias a la decodificación MTP.
- Prototipado de razonamiento eficiente: los tags `efficient-thinking` y `token-efficient` lo hacen adecuado para experimentar con cadenas de pensamiento compactas y medir el ahorro de tokens frente a modelos que razonan de forma extensa.
- Evaluación de cuantización mixta: útil para investigadores que quieran comparar la calidad de oQ 4,780 bits frente al modelo base en FP8, aislando el impacto de las capas en 8-bit.
- Despliegue en entornos con restricciones de memoria: los 19,7 GB del repo permiten servir el modelo en nodos con 24 GB de VRAM o memoria unificada, algo inviable para el checkpoint FP8 original.
- Generación de texto por lotes en local: al ejecutarse con MLX, se puede integrar en scripts de procesamiento de documentos o resúmenes sin depender de APIs externas.
- Investigación sobre decodificación especulativa: la cabeza MTP separada (0,740 GiB) permite estudiar el rendimiento de multi-token prediction en un modelo cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: ~18,3 GiB para los pesos en MLX; con overhead de contexto y KV cache, se recomienda un mínimo de 24 GB de memoria unificada.
- GPU recomendadas: no aplica de forma nativa, ya que el formato es MLX (Apple Silicon). Para GPUs NVIDIA sería necesario reconvertir a otro formato, no disponible en este repo.
- Compatibilidad con consumer GPU: no directamente; está pensado para Apple Silicon (M-series) con memoria unificada de 32 GB o superior.
- Opciones de despliegue: MLX (librería declarada). vLLM aparece como tag del modelo base, pero este checkpoint concreto es MLX. llama.cpp, Ollama y TGI no están confirmados.
- Latencia y throughput: no disponibles. La cabeza MTP está diseñada para reducir latencia mediante decodificación multi-token, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-mtp (este) | 32,913B | no disponible | MLX, 4,780 bits/peso | OpenMDW-1.1 | Hugging Face, 0 descargas |
| bottlecapai/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B (base) | 32,913B | no disponible | FP8 (según tags) | no disponible | Hugging Face |
| Alternativas de ~30B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos comparables verificados en la información proporcionada.

## Limitaciones y advertencias

- Modelo recién publicado (0 descargas, 0 likes), sin validación comunitaria ni benchmarks que confirmen la calidad tras la cuantización.
- La cuantización a 4,780 bits/peso puede degradar tareas sensibles a la precisión numérica, como matemáticas o código, en comparación con el checkpoint FP8 original.
- No se confirma si la arquitectura es MoE ni cuántos parámetros están activos por token; el sufijo A3B sugiere ~3B activos, pero no está verificado.
- Longitud de contexto e idiomas soportados no documentados: riesgo de comportamiento inesperado en contextos largos o en idiomas distintos del inglés.
- Licencia OpenMDW-1.1: es necesario revisar sus términos antes de uso comercial; la model card la marca como `license: other`.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad.
- El formato MLX limita el despliegue a Apple Silicon; no es directamente portable a GPUs NVIDIA ni a servidores x86 sin reconversión.
- El repositorio depende de un modelo base de un tercero (bottlecapai) cuya procedencia y entrenamiento no están documentados en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/chimpanzeetaxidriver/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-mtp
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B
- Herramienta de cuantización oQ: https://github.com/jundot/omlx
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/

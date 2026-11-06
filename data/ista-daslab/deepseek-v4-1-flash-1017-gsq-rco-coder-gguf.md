# ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 GSQ-RCO Coder es una versión comprimida y orientada a código del modelo DeepSeek-V4.1-Flash-1017, publicada por el laboratorio ISTA-DASLab. Se trata de un modelo de mezcla de expertos (MoE) de 763.200 millones de parámetros nominales, de los cuales 551.900 millones corresponden al transformer, que ha sido sometido a una doble compresión: poda de expertos enrutados (se eliminan 192 de los 384 expertos por capa, es decir, el 50% de los parámetros de expertos enrutados) y cuantización de precisión mixta según el esquema GSQ-RCO. El resultado es un transformer de 72,1 GB con una tasa efectiva de 1,05 bits por parámetro medida contra el modelo original.

La motivación del release es clara: reducir drásticamente los requisitos de memoria manteniendo las capacidades que importan para flujos de trabajo de código y agentes. Según la model card, el modelo conserva el 94,8% del rendimiento en SWE-bench Verified y el 98,7% en LiveCodeBench v6 respecto al modelo base en FP8/FP4. La degradación fuera de ese conjunto de dominios (código, uso de herramientas, contexto largo y visión) se acepta explícitamente como coste del método. Para uso general, el autor recomienda las versiones GSQ-RCO sin poda.

El modelo se distribuye en formato GGUF, con licencia MIT, y está pensado para inferencia local o en servidores con recursos limitados. Incluye además dos tablas de búsqueda Engram de 110,6 GB que se leen fila a fila por token y que pueden permanecer en disco, lo que permite separar el coste de memoria residente del almacenamiento masivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 384 expertos enrutados por capa con 6 activos por token |
| Parametros totales | 196.613.849.600 (según safetensors del repo); 763.200 millones nominales del modelo base, de los cuales 551.900 millones en el transformer |
| Parametros activos | 6 de 384 expertos por token (modelo base); no se especifica el número de parámetros activos tras la poda |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización por tensor según el build IQ2_XXS (2,00 bpw); tensores densos en mayor precisión; tasa efectiva de 1,05 bpw sobre el transformer original |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 384 expertos enrutados por capa y 6 activos por token, lo que concentra la mayor parte de los parámetros en los bloques feed-forward de los expertos mientras solo una fracción se ejecuta en cada token. La compresión aplicada combina dos técnicas complementarias: poda de expertos completos (se eliminan 192 de 384 por capa, reduciendo tanto el tamaño del archivo como la memoria residente y restringiendo el router a un pool menor) y cuantización de los expertos restantes con los tipos por tensor del build IQ2_XXS. La selección de qué expertos eliminar se realizó con RCO (paper arXiv:2605.00649, código en GitHub), optimizando la divergencia KL sobre un conjunto de datos de calibración orientado a código, uso de herramientas, contexto largo y visión.

La tasa de 1,05 bits por parámetro es una métrica efectiva: se calcula dividiendo los 72,12 GB del transformer comprimido entre los 551.900 millones de parámetros del transformer original, de modo que cada experto eliminado cuenta como cero bits. Los 280.100 millones de parámetros que conserva el Coder promedian 2,06 bits, ya que los tensores densos, mantenidos a mayor precisión, representan una proporción mayor de lo que queda. Incluyendo las tablas Engram (196.600 millones de parámetros a 4,50 bpw fijos), la tasa sobre el modelo completo es de 1,92 bits por parámetro. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento general, con especial énfasis en código y flujos agénticos.
- Generación y edición de código en múltiples lenguajes, evaluada en LiveCodeBench v6 con una retención del 98,7% respecto al base.
- Uso de herramientas y function calling en trayectorias multi-turno, evaluado en SWE-bench Verified con una retención del 94,8%.
- Razonamiento agéntico de múltiples pasos sobre repositorios reales.
- Capacidades de visión: el pipeline declarado es image-text-to-text y el modelo incluye el tag `vision`.
- Soporte de contexto largo (mencionado como dominio objetivo de la calibración, aunque la longitud concreta no está disponible).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento configurable (la model card menciona "reasoning effort" en relación con los resultados de benchmarks, sin detallar los valores).

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar, refactorizar o generar pruebas, apoyándose en su retención del 98,7% en LiveCodeBench v6 y en su formato GGUF para despliegue con llama.cpp u Ollama.
- Agentes de resolución de incidencias sobre repositorios: con una retención del 94,8% en SWE-bench Verified, es adecuado para tareas de localización y parcheo de bugs en bases de código reales, donde la ventana de contexto larga y el uso de herramientas son críticos.
- Asistente de desarrollo en estación de trabajo: sus 72,1 GB de transformer permiten, con cuantización de 1 bit efectivo, ejecutarlo en equipos con 80-96 GB de VRAM o con descarga parcial de las tablas Engram a disco, algo inviable con el modelo base.
- Automatización de revisión de código: el modelo puede analizar diffs y generar comentarios técnicos en flujos de pull request, aprovechando su entrenamiento orientado a código y su capacidad de razonamiento multi-paso.
- Análisis de documentación técnica con imágenes: al soportar image-text-to-text, puede procesar diagramas de arquitectura, capturas de pantalla de errores o esquemas junto con texto para generar explicaciones o código asociado.
- Despliegue en entornos con memoria restringida: la separación entre transformer residente (72,1 GB) y tablas Engram en disco (110,6 GB, leídas fila a fila) permite servir el modelo en servidores con menos RAM que la necesaria para el modelo completo.
- Evaluación e investigación sobre compresión de MoE: al ser un release experimental con papers y código asociados (GSQ y RCO), sirve como referencia reproducible para estudiar el impacto de la poda de expertos dirigida por capacidad.

## Benchmarks y rendimiento

| Benchmark | Base (FP8/FP4) | GSQ-RCO Coder (72,1 GB, 1,05 bpw) | Retención |
|---|---|---|---|
| SWE-bench Verified | 81,20 | 77,00 | 94,8% |
| LiveCodeBench v6 | 89,71 | 88,57 | 98,7% |

No se han publicado otros resultados de benchmarks en la información disponible. La model card indica que el "reasoning effort" de estos resultados está pendiente de confirmar (la card sin poda usa esfuerzo 50).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 72,1 GB para el transformer en el formato GGUF publicado; las tablas Engram (110,6 GB) pueden residir en disco y leerse fila a fila, por lo que no necesitan estar en VRAM.
- GPU recomendadas: H100 (80 GB), A100 80 GB o GPUs con 96 GB de VRAM para mantener el transformer completo en memoria. Con descarga parcial o cuantización adicional, podría ajustarse en configuraciones de 48-64 GB, aunque no se especifica en la información disponible.
- Cabe en GPU de consumo: no de forma completa en RTX 4090 (24 GB) ni en GPUs de 48 GB; se requeriría partición en múltiples GPUs o descarga de capas a RAM/almacenamiento, no documentada en la información disponible.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI no están confirmados para este formato en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 GSQ-RCO Coder | 763,2B nominales (551,9B transformer), 280,1B retenidos tras poda | no disponible | MIT | GGUF | 72,1 GB, 1,05 bpw efectivos, orientado a código |
| DeepSeek-V4.1-Flash-1017 GSQ-RCO (sin poda) | 763,2B nominales | no disponible | MIT | GGUF | 138,2 GB, 2,00 bpw, uso general |
| DeepSeek-V4.1-Flash-1017 (base, FP8/FP4) | 763,2B nominales | no disponible | no disponible | no disponible | Referencia de rendimiento: SWE-bench 81,20, LiveCodeBench 89,71 |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La poda de la mitad de los expertos reduce capacidades de forma deliberada; la degradación fuera de código, uso de herramientas, contexto largo y visión se acepta como coste del método.
- Para uso general se recomienda explícitamente la versión sin poda (GSQ-RCO), no este Coder.
- Es un release experimental; el autor solicita feedback, especialmente sobre capacidades no representadas en los datos de calibración.
- Los resultados de benchmarks pueden depender del "reasoning effort" configurado, que no está confirmado en la información disponible.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe uniforme.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con ventanas específicas.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base DeepSeek-V4.1-Flash-1017 antes de un uso comercial en producción.
- El tamaño del repo (183,7 GB) y la necesidad de gestionar las tablas Engram en disco añaden complejidad operativa.

## Enlaces

- [Hugging Face: ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF](https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF)
- [Modelo base: deepseek-ai/DeepSeek-V4.1-Flash-1017](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017)
- [Versión sin poda: ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF](https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF)
- [Paper GSQ (arXiv:2604.18556)](https://arxiv.org/abs/2604.18556)
- [Paper RCO (arXiv:2605.00649)](https://arxiv.org/abs/2605.00649)
- [Código GSQ](https://github.com/IST-DASLab/GSQ)
- [Código RCO](https://github.com/IST-DASLab/RCO)
- [GitHub IST-DASLab](https://github.com/IST-DASLab)

# Luni/Thinklite-27B-Heretic-ARA-EXL3

## Resumen

Thinklite-27B-Heretic-ARA-EXL3 es una cuantización en formato ExLlamaV3 (EXL3) del modelo Luni/Thinklite-27B-Heretic-ARA, que a su vez es una reconstrucción "descensurada" (abliterated) del modelo Sparset/Thinklite-27B, derivado de Qwen/Qwen3.8-27B. El autor, Luni, publica tres ramas de cuantización (4.00, 4.30 y 5.00 bits por peso) que preservan la torre de visión y la cabeza de decodificación especulativa Multi-Token Prediction (MTP) del modelo original.

El modelo aborda dos problemas concretos: por un lado, la reducción de la censura y los rechazos en las respuestas (mediante una doble etapa de abliteración direccional y ARA), y por otro, la eficiencia de despliegue, permitiendo ejecutar un modelo de 27B de parámetros con 262.144 tokens de contexto en una única GPU de 32 GB como la RTX 5090. Esto es posible gracias a la arquitectura híbrida 3:1 Gated DeltaNet / atención completa de Qwen3.8-27B, donde solo 16 de las 64 capas requieren caché KV.

La relevancia actual reside en la combinación de tres factores poco habituales: cuantización KLD-óptima de precisión mixta, preservación de visión y decodificación especulativa MTP en el cuantizado, y una ventana de contexto de 256k en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 bloques Gated DeltaNet (atención lineal) + 16 bloques de atención completa (ratio 3:1), basado en Qwen3.8-27B |
| Parametros totales | 27B (según nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | EXL3 en 4.00 bpw, 4.30 bpw (KLD-óptimo mixto 4.0/5.0) y 5.00 bpw; cabezas a 6 bits, MTP a 4 bits, embeddings a 16 bits |
| Idiomas soportados | en, zh, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.8-27B: un transformer híbrido con 64 bloques de decodificación, de los cuales 48 son bloques de atención lineal Gated DeltaNet y 16 son bloques de atención completa. Esta proporción 3:1 implica que solo 16 capas necesitan caché KV, lo que reduce drásticamente el coste de memoria del contexto largo. La atención completa utiliza 4 cabezas KV con dimensión de cabeza 256. El modelo incorpora además una torre de visión (identificada como V6) y una cabeza de decodificación especulativa Multi-Token Prediction (MTP).

El proceso de modificación respecto al modelo base consta de dos etapas de abliteración: una direccional y otra ARA, aplicadas sobre Sparset/Thinklite-27B. Según la model card, el resultado reduce los rechazos en StrongREJECT de 311,3/313 a 61,3/313 (con 0 rechazos directos) y en un pool de 800 prompts multcategoría de 585,5/800 a 292,0/800, con solo 2 rechazos directos. El coste en deriva de distribución se mide con KLD: 0,2922 nats en el primer token y 0,1662 nats de media en 16 tokens sobre continuaciones inocuas.

La cuantización EXL3 se realizó con `-hq -hb 6 -vb 6 -eb 16 -cb mul1 --out_scales auto -ss 4096`, cuantizando los 64 bloques, el encoder de visión y la cabeza MTP. La rama 4.30 bpw se construyó midiendo la divergencia KL por módulo contra la referencia BF16 y resolviendo una asignación de bits Pareto-óptima: las proyecciones de atención y MLP más sensibles reciben 5.00 bpw y las tolerantes se quedan en 4.00 bpw.

## Capacidades

- Generación de texto y razonamiento en dos modos: no-thinking y `<think>` (razonamiento explícito), con parámetro `reasoning_effort` configurable.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`): la torre de visión V6 se preserva en las tres ramas cuantizadas.
- Decodificación especulativa nativa mediante cabeza MTP (`mtp.*`), con `draft_num_tokens: 2` en la configuración recomendada.
- Capacidades multilingües: inglés, chino y otros idiomas (etiqueta `multilingual`).
- Razonamiento eficiente (etiqueta `efficient-reasoning`), orientado a reducir el coste computacional del modo thinking.
- Respuestas sin censura ni rechazos en la gran mayoría de prompts (efecto de la abliteración ARA).
- Soporte de contexto muy largo: hasta 262.144 tokens en una sola GPU de 32 GB.

## Casos de uso

- Análisis de documentos extensos con imágenes: el modelo puede procesar contratos, informes técnicos o papers de cientos de páginas junto con figuras y tablas en una sola pasada, gracias a la ventana de 256k tokens y a la torre de visión preservada.
- Asistente de razonamiento con control de coste: el parámetro `reasoning_effort: low` y el modo no-thinking permiten alternar entre respuestas rápidas y cadenas de razonamiento largas según la tarea, útil en pipelines con presupuesto de latencia variable.
- Investigación sobre alineación y censura: la reducción documentada de rechazos (de 311,3 a 61,3 en StrongREJECT) lo convierte en una herramienta para estudiar el comportamiento de modelos abliterated y medir el impacto en KLD sobre prompts inocuos.
- Despliegue en estación de trabajo con una RTX 5090: la rama 4.30 bpw (16,4 GiB) más caché KV FP8 de 8 GiB cabe en 32 GB con visión offloaded y MTP activo, lo que permite servir un modelo de 27B con contexto completo en hardware de consumo.
- Generación de código y tareas de agentes con contexto de repositorio: la ventana de 256k permite incluir árboles de proyecto completos; la decodificación especulativa MTP reduce la latencia en generación de código.
- Transcripción y descripción de imágenes en lote: el pipeline image-text-to-text con visión cuantizada a 6 bits permite clasificar, describir o extraer información de imágenes sin cargar el modelo en BF16.
- Evaluación comparativa de cuantizaciones: las tres ramas publicadas (4.00, 4.30 y 5.00 bpw) permiten medir el compromiso entre calidad y VRAM en un mismo modelo, útil para calibrar pipelines de cuantización KLD-óptima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de comportamiento tras la abliteración y de deriva de cuantización:

| Metrica | Base (Sparset/Thinklite-27B) | Thinklite-27B-Heretic-ARA |
|---|---|---|
| StrongREJECT (313 prompts, juez estricto) | 311,3 / 313 (305 rechazos directos) | 61,3 / 313 (0 rechazos directos) |
| Pool de 800 prompts multcategoría | 585,5 / 800 (413 rechazos directos) | 292,0 / 800 (2 rechazos directos) |
| Rechazos por palabra clave (800 prompts) | 402 / 800 | 25 / 800 |
| KLD primer token (prompts inocuos) | 0,0000 | 0,2922 nats |
| KLD medio 16 tokens (continuaciones inocuas) | 0,0000 | 0,1662 nats |

## Requisitos de hardware

- VRAM de pesos: 15,4 GiB (4.00 bpw), 16,4 GiB (4.30 bpw) y 18,8 GiB (5.00 bpw).
- Caché KV a 262.144 tokens en FP8 (`'8,8'`): 8,00 GiB según la model card (solo 16 de 64 capas usan atención completa, con 4 cabezas KV y dimensión 256).
- Configuración recomendada: GPU de 32 GB (por ejemplo RTX 5090) con la rama 4.30 bpw, `vision_offload: true` y MTP activo. La rama 5.00 bpw requiere caché `'6,6'` para caber a 262k.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB) con la configuración indicada; en GPUs de 24 GB no se garantiza el contexto completo con visión y MTP.
- GPUs de datacenter: A100 (40/80 GB) y H100 (80 GB) alojan cualquier rama con contexto completo y margen amplio; no se proporcionan cifras de latencia o throughput para estas.
- Opciones de despliegue: ExLlamaV3 mediante TabbyAPI (configuración YAML incluida en la model card). No se mencionan otros runtimes como vLLM, llama.cpp, Ollama o TGI; el formato EXL3 es específico de ExLlamaV3.
- Latencia y throughput: no disponibles. La decodificación especulativa MTP con 2 tokens de borrador está pensada para reducir la latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Luni/Thinklite-27B-Heretic-ARA-EXL3 | 27B | 262.144 | EXL3 4.00/4.30/5.00 bpw | Apache 2.0 | Visión y MTP preservados; abliterated |
| Luni/Thinklite-27B-Heretic-ARA | 27B | no disponible en la información | BF16 | Apache 2.0 | Versión sin cuantizar del mismo modelo |
| Sparset/Thinklite-27B | 27B | no disponible en la información | BF16 | no disponible en la información | Modelo base previo a la abliteración |
| Honkware/Qwen3.8-27B-heretic-ara-exl3-5.0bpw | 27B | no disponible en la información | EXL3 5.0 bpw | no disponible en la información | Cuantización alternativa del mismo linaje Qwen3.8-27B-heretic-ara |

## Limitaciones y advertencias

- La abliteración elimina los rechazos en la práctica totalidad de prompts, incluidos los dañinos; esto implica ausencia de salvaguardas de contenido y hace inadecuado el modelo para aplicaciones orientadas al público general sin filtros externos.
- La deriva de cuantización y abliteración se mide con KLD (0,2922 nats en el primer token, 0,1662 nats de media en 16 tokens), lo que indica cambios medibles en la distribución de salida incluso en prompts inocuos; puede afectar a la fidelidad en tareas sensibles.
- Riesgo de alucinación: no se publican evaluaciones de veracidad ni benchmarks de tareas; el modelo base es un derivado de Qwen3.8-27B sin datos de rendimiento verificables en la información disponible.
- Idiomas: la model card solo declara inglés, chino y multilingüe; no hay evaluación específica de calidad en castellano.
- El formato EXL3 solo es compatible con ExLlamaV3/TabbyAPI; no hay pesos GGUF ni safetensors estándar en este repositorio, lo que limita la portabilidad a otros runtimes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo incorpora modificaciones de abliteración sobre un derivado de Qwen; conviene verificar las condiciones del modelo base original antes de distribuirlo en producción.
- El contexto completo de 262k solo está validado en la configuración de 32 GB descrita; en GPUs con menos VRAM habrá que reducir contexto, desactivar visión o usar cuantizaciones más agresivas.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan comparar su calidad con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luni/Thinklite-27B-Heretic-ARA-EXL3
- Modelo base sin cuantizar: https://huggingface.co/Luni/Thinklite-27B-Heretic-ARA
- Modelo Thinklite-27B original: https://huggingface.co/Sparset/Thinklite-27B
- Modelo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio Heretic: https://github.com/p-e-w/heretic
- Repositorio ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Cuantización alternativa (Honkware, 5.0 bpw): https://huggingface.co/Honkware/Qwen3.8-27B-heretic-ara-exl3-5.0bpw
- Colección Honkware de cuantizaciones EXL3: https://huggingface.co/collections/Honkware/qwen38-27b-heretic-ara-exl3

# Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ

## Resumen

Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ es una cuantización en formato GGUF del modelo multimodal Qwen3.5-9B de Alibaba Qwen, publicada por el usuario Anbeeld. El modelo base es un transformer denso de aproximadamente 9.200 millones de parámetros con capacidad image-text-to-text (procesa imagen y texto como entrada y genera texto). Esta ficha describe la cuantización, no el modelo original: los pesos aquí distribuidos son versiones comprimidas pensadas para inferencia local eficiente.

La particularidad de esta publicación es la aplicación de SINQ (una técnica de cuantización propia del autor) sobre las recetas de Bartowski, manteniendo la estructura de quant types de GGUF estándar. Según la model card, cada variante SINQ seleccionada presenta un KLD medio inferior al de la cuantización stock equivalente de Bartowski, lo que se traduce en una menor degradación respecto a la referencia BF16. El repositorio ocupa 162,1 GB e incluye múltiples recetas (IQ2_S hasta Q5_K_S, entre otras).

Es relevante para desarrolladores que necesitan ejecutar un modelo multimodal de ~9B en hardware de consumo o en servidores modestos, con control fino sobre el compromiso entre tamaño y fidelidad. La licencia Apache 2.0 del modelo base facilita el uso comercial, aunque la herramienta de inferencia necesaria para explotar SINQ (BeeLlama.cpp) es un fork específico y no el llama.cpp upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), modelo base Qwen3.5-9B |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los benchmarks usan contexto de 65.536 tokens / 64K) |
| Tipos de cuantizacion | IQ2_S, IQ2_M, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_M, Q3_K_M, Q2_K_L, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q3_K_XL, Q5_K_S (entre otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con SINQ aplicado; requiere BeeLlama.cpp v0.5.0) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso de ~9,2B parámetros con pipeline image-text-to-text, es decir, un modelo multimodal que acepta imágenes y texto. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron fases de RLHF o DPO; estos datos corresponden a la model card del modelo original, no incluida en la información proporcionada.

La contribución técnica de esta publicación es la cuantización SINQ aplicada sobre las recetas de Bartowski. Según la model card, SINQ se integra en el proceso de cuantización y solo es soportado por BeeLlama.cpp v0.5.0 (fork del autor). Los parámetros "width" y "strength" de cada receta controlan la agresividad del esquema. Las mediciones de KLD se realizaron sobre el corpus completo Wikitext-2, con el modelo BF16 como referencia, 297.193 objetivos de siguiente token alineados, contexto de 65.536 tokens, caché K/V en BF16, batch 512 y microbatch 256. El autor afirma que cada variante SINQ seleccionada tiene menor KLD medio que su equivalente stock de Bartowski, aunque no se aportan los valores numéricos de las versiones stock en la información disponible.

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Procesamiento de imagen y texto como entrada (pipeline `image-text-to-text`), heredado del modelo base Qwen3.5-9B.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integración con APIs de inferencia tipo servidor.
- Razonamiento, código, matemáticas y tool calling: capacidades esperables del modelo base Qwen3.5-9B, aunque no se detallan explícitamente en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local multimodal en estaciones de trabajo: con las variantes Q4_K_M (6,17 GB) o IQ4_XS (5,50 GB) se puede ejecutar un modelo de ~9B con entrada de imagen en GPUs de consumo de 8-12 GB de VRAM, útil para prototipado de asistentes visuales.
- Despliegue en servidores con VRAM limitada: las recetas IQ2_M (4,03 GB) y Q2_K (4,33 GB) permiten servir el modelo en GPUs de 6-8 GB, con la contrapartida de un KLD medio de 0,19 y 0,17 respectivamente, aceptable para tareas de clasificación o resumen donde la fidelidad exacta no es crítica.
- Evaluación de cuantizaciones: el repositorio incluye métricas KLD, top-1 agreement y PPL por receta, lo que lo convierte en un banco de pruebas para comparar el impacto de distintas cuantizaciones sobre un modelo multimodal antes de fijar una en producción.
- Pipelines de CI/CD para selección de quant: el desglose de KLD por percentiles (P50, P90, P95, P99, P99.9, max) permite definir umbrales de calidad y automatizar la elección de la receta según el presupuesto de memoria del entorno de destino.
- Investigación sobre técnicas de cuantización: al comparar SINQ frente a Bartowski stock y Unsloth con las mismas métricas, sirve para estudiar el efecto de width y strength en la degradación del modelo.
- Asistentes conversacionales con contexto largo: los benchmarks se ejecutaron con 64K de contexto, lo que sugiere que el modelo base soporta ventanas amplias; útil para atención al cliente o análisis de documentos extensos, siempre que se valide el contexto real del modelo original.
- Prototipado de aplicaciones image-text-to-text en local sin depender de APIs cloud, usando la variante Q5_K_S (6,79 GB) cuando se requiere mayor fidelidad.

## Benchmarks y rendimiento

Los datos disponibles son métricas de cuantización (KLD, top-1 agreement y PPL) frente a la referencia BF16, no benchmarks de tareas (MMLU, HumanEval, GSM8K). Se presentan las recetas principales:

| Receta | Tamano (GB) | Width | Strength | Mean KLD | Median KLD | P99 KLD | Top-1 | PPL |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| IQ2_S | 3,969 | 64 | 0,5 | 0,296414 | 0,149191 | 2,472618 | 77,767% | 7,9476 |
| IQ2_M | 4,030 | 128 | 1 | 0,190647 | 0,088761 | 1,629424 | 82,289% | 7,3301 |
| Q2_K | 4,325 | 128 | 1 | 0,174333 | 0,073782 | 1,606044 | 83,260% | 7,3516 |
| IQ3_XXS | 4,537 | 32 | 1 | 0,105045 | 0,041615 | 0,912886 | 87,147% | 7,0444 |
| IQ3_XS | 4,821 | 128 | 1 | 0,082945 | 0,032618 | 0,652693 | 89,097% | 6,9498 |
| IQ3_M | 4,983 | 128 | 0,75 | 0,072853 | 0,028080 | 0,542849 | 89,838% | 6,9168 |
| Q3_K_M | 5,181 | 16 | 0,75 | 0,066111 | 0,023100 | 0,496860 | 90,158% | 6,8574 |
| IQ4_XS | 5,503 | 64 | 0,5 | 0,029253 | 0,008808 | 0,188819 | 93,778% | 6,7584 |
| IQ4_NL | 5,740 | 16 | 0,5 | 0,029059 | 0,008492 | 0,181350 | 93,871% | 6,7463 |
| Q4_K_S | 5,859 | 16 | 0,5 | 0,025652 | 0,007348 | 0,156136 | 94,313% | 6,7207 |
| Q4_K_M | 6,172 | 32 | 0,5 | 0,022183 | 0,005894 | 0,129992 | 94,788% | 6,7553 |
| Q5_K_S | 6,787 | 32 | 1 | 0,012212 | 0,002664 | 0,011063 | no disponible en el fragmento | no disponible |

Condiciones de medición: corpus completo Wikitext-2, referencia BF16 Qwen3.5-9B, 297.193 objetivos alineados, contexto 65.536 tokens, caché K/V BF16, batch 512, microbatch 256. KLD = KL(BF16 || cuantización). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre ~4 GB (IQ2_S, IQ2_M) y ~7 GB (Q5_K_S) solo para pesos; hay que añadir la caché K/V, que a 64K de contexto en BF16 es significativa y puede superar varios GB según la configuración.
- GPU recomendadas: para las recetas Q4 y Q5, GPUs de 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090, A10, L4). Para recetas IQ2/IQ3, GPUs de 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3070).
- Cabe en GPU de consumo: sí, todas las recetas listadas caben en GPUs consumer de 8 GB o más para los pesos; con contexto largo conviene 12 GB o más.
- Opciones de despliegue: las cuantizaciones SINQ requieren BeeLlama.cpp v0.5.0 (fork específico del autor). No se garantiza compatibilidad con llama.cpp upstream, Ollama, vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ | ~9,2B | no disponible (benchmarks a 64K) | GGUF + SINQ | Apache 2.0 | Requiere BeeLlama.cpp v0.5.0 |
| bartowski/Qwen_Qwen3.5-9B-GGUF | ~9,2B | no disponible | GGUF stock | Apache 2.0 | Compatible con llama.cpp upstream; referencia de comparación del autor |
| Unsloth (Qwen3.5-9B) | ~9,2B | no disponible | GGUF | Apache 2.0 | Tercer punto de comparación en las gráficas del autor; datos numéricos no disponibles |
| Qwen/Qwen3.5-9B (BF16) | ~9,2B | no disponible | safetensors | Apache 2.0 | Modelo de referencia para las métricas KLD |

El autor afirma que las variantes SINQ seleccionadas superan en KLD medio a las stock de Bartowski, pero no se incluyen en la información proporcionada los valores numéricos de Bartowski ni de Unsloth para verificar la magnitud de la mejora.

## Limitaciones y advertencias

- Dependencia de un fork: SINQ solo funciona en BeeLlama.cpp v0.5.0. No hay garantía de compatibilidad con llama.cpp upstream, Ollama, vLLM, TGI u otras herramientas estándar, lo que limita el despliegue en infraestructura existente.
- Degradación medible: incluso la mejor receta publicada (Q5_K_S, mean KLD 0,0122) se aleja del BF16; las recetas de 2-3 bits (IQ2_S, IQ2_M, Q2_K) presentan mean KLD de 0,17-0,30 y top-1 agreement del 77-83%, con colas P99.9 superiores a 13, lo que implica errores puntuales graves.
- Contexto largo: aunque los benchmarks usan 64K tokens, la VRAM necesaria para la caché K/V a esa longitud puede hacer inviable el despliegue en GPUs de 8 GB.
- Idiomas: no se especifican los idiomas soportados en la información disponible; no se puede confirmar cobertura multilingüe más allá de lo que herede el modelo base.
- Sesgos y alucinaciones: no hay información específica en la model card sobre sesgos o tasas de alucinación; deben evaluarse sobre el modelo base Qwen3.5-9B.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base en el enlace indicado por el autor y las condiciones de uso de BeeLlama.cpp.
- Sin datos de benchmarks de tareas: no se han publicado resultados de MMLU, HumanEval, GSM8K ni similares para esta cuantización; el rendimiento en tareas reales debe medirse empíricamente.
- Repositorio de 162,1 GB: descargar el repo completo es costoso; conviene descargar solo el archivo GGUF de la receta elegida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Recetas de cuantización de referencia (Bartowski): https://huggingface.co/bartowski/Qwen_Qwen3.5-9B-GGUF
- BeeLlama.cpp v0.5.0: https://github.com/Anbeeld/beellama.cpp

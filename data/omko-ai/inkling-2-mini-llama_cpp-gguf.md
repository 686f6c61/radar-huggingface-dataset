# omko-ai/Inkling-2-Mini-llama_cpp-GGUF

## Resumen

Inkling-2-Mini es un modelo de razonamiento de 26.070.390.272 parámetros (26B) desarrollado por Thinking Machines Lab, publicado originalmente con un peso de 20,2 GB. La ficha que nos ocupa, `omko-ai/Inkling-2-Mini-llama_cpp-GGUF`, es una cuantización GGUF de 9,1 GB del modelo base, empaquetada por Omko para ejecutarse en llama.cpp estándar (stock) y pensada para caber en GPUs de 16 GB y portátiles de 32 GB dejando margen para contexto largo.

El modelo base es un MoE de 26B parámetros orientado a razonamiento, con capacidades declaradas de texto e imagen en la versión original, y un contexto máximo de 1.048.576 tokens según la configuración de llama.cpp documentada por el autor de la cuantización. Esta build concreta es solo texto y emplea cuantización de 2 bits (Q2_K) con imatrix, lo que la sitúa en la franja de compresión agresiva: 9,1 GB frente a los 20,2 GB del release original.

La relevancia de esta ficha es práctica: permite ejecutar un modelo de razonamiento de 26B en hardware de consumo con llama.cpp sin necesidad de runtimes propietarios. El autor reporta una precisión media del 77,5% en seis benchmarks (GPQA Diamond, MMLU-Pro, AIME 2025, HMMT febrero 2025, HMMT febrero 2026 y LiveCodeBench v6), superior a otras builds de 2 bits comparables en tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), transformer; detalles de capas y expertos no disponibles |
| Parametros totales | 26.070.390.272 (26B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (máximo del modelo); el autor recomienda fijar `-c 65536` en llama.cpp |
| Tipos de cuantizacion | Q2_K (build de 9,1 GB); el repo base admite otras builds de 2 bits de terceros |
| Idiomas soportados | no disponible |
| Licencia | OOML v1.0 (Omko Open Model License); el modelo base es Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un MoE de 26B parámetros según la model card del autor de la cuantización. No se dispone de información sobre el número de capas, el número de expertos, la dimensión oculta ni el número de parámetros activos por token. Tampoco se documentan en la información proporcionada los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo etapas de RLHF, DPO o aprendizaje por refuerzo para razonamiento.

La innovación destacable de esta ficha no está en el modelo base sino en el proceso de cuantización: se trata de una build Q2_K con imatrix (matriz de importancia) que, según el autor, alcanza un 77,5% de precisión media en seis benchmarks frente al 75,7% de Unsloth UD-Q2_K_XL (mismo tamaño, 9,1 GB) y el 72,7% de AtomicChat AD-IQ2_M (8,7 GB). El autor indica que la build funciona en llama.cpp build b12672 o superior y que se ha probado en Linux con Vulkan.

## Capacidades

- Generación de texto y razonamiento multi-paso, orientado a tareas de matemáticas, ciencia y código según los benchmarks reportados (GPQA Diamond, MMLU-Pro, AIME, HMMT, LiveCodeBench v6).
- Generación de código: evaluado en LiveCodeBench v6 dentro de la media de precisión reportada.
- Razonamiento matemático: evaluado en AIME 2025, HMMT febrero 2025 y HMMT febrero 2026.
- Conversación multi-turno (tag `conversational` en el repo).
- Compatibilidad con endpoints OpenAI (`endpoints_compatible` en los tags), lo que permite servir el modelo con `llama-server` y una API compatible con OpenAI.
- Capacidad multimodal (texto e imagen) en el modelo base original; esta build GGUF es solo texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponibles explícitamente, aunque el perfil de razonamiento del modelo base sugiere uso en pipelines de razonamiento; no confirmado en la documentación.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Razonamiento científico y técnico en local: el modelo puede resolver preguntas de nivel GPQA Diamond y MMLU-Pro en una GPU de 16 GB, lo que permite montar un asistente de investigación offline sin depender de APIs externas.
- Resolución de problemas matemáticos competitivos: adecuado para generar y verificar soluciones de problemas tipo AIME y HMMT, con la ventaja de ejecutarse en un portátil de 32 GB.
- Generación de código en entornos con recursos limitados: la evaluación en LiveCodeBench v6 respalda su uso como asistente de programación local integrado en el editor, sin enviar código a servicios cloud.
- Servicio de chat compatible con OpenAI: mediante `llama-server` se puede exponer una API OpenAI-compatible en `http://localhost:8080`, lo que facilita integrarlo en aplicaciones existentes que ya consumen la API de OpenAI.
- Prototipado de agentes y pipelines de razonamiento: el contexto configurable de hasta 65.536 tokens (recomendado por el autor) permite mantener conversaciones largas y cadenas de razonamiento con historial extenso.
- Evaluación y benchmarking de cuantizaciones: útil para investigadores que comparan builds de 2 bits en llama.cpp, ya que el autor publica una tabla comparativa de precisión frente a tamaño con otras tres builds.
- Despliegue en hardware de consumo para demos y docencia: cabe en GPUs de 16 GB y portátiles de 32 GB, lo que lo hace viable para talleres, aulas y entornos de desarrollo sin infraestructura dedicada.

## Benchmarks y rendimiento

El autor reporta una precisión media agregada sobre seis benchmarks (GPQA Diamond, MMLU-Pro, AIME 2025, HMMT febrero 2025, HMMT febrero 2026 y LiveCodeBench v6) para distintas builds de 2 bits:

| Build | Tamano (GB) | Precision media |
|---|---|---|
| AtomicChat AD-IQ2_M | 8,7 | 72,7% |
| Omko (esta build) | 9,1 | 77,5% |
| Unsloth UD-Q2_K_XL | 9,1 | 75,7% |
| bartowski IQ2_XXS | 10,3 | 81,4% |

No se han publicado en la información disponible los resultados desagregados por benchmark (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con modelos de otros autores. El autor también reporta 34,4 tokens por segundo para la build PTL-OV en la GPU Intel Arc B390 (Panther Lake) con el runtime `omko-run`; no se proporcionan cifras de throughput para esta build GGUF en otras GPUs.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa 9,1 GB; con overhead de contexto y buffers de cómputo, se recomienda al menos 12-16 GB de VRAM para contexto moderado. El autor indica que cabe en GPUs de 16 GB y portátiles de 32 GB con margen para contexto largo.
- GPU recomendadas: cualquier GPU soportada por llama.cpp (NVIDIA con CUDA, AMD/Intel con Vulkan, Apple Silicon con Metal). El autor probó la build en Linux con Vulkan. Para contexto de 65.536 tokens conviene disponer de 16 GB o más.
- Cabe en GPU de consumo: sí, en GPUs de 16 GB (por ejemplo, RTX 4080/4090, RTX 5070 Ti y superiores) y en portátiles con 32 GB de memoria unificada (Apple Silicon).
- Opciones de despliegue: llama.cpp build b12672 o superior (`llama-cli`, `llama-server`, `llama-bench`); también existe una build específica para Intel Panther Lake Arc B390 con el runtime `omko-run` en el repo `omko-ai/Inkling-2-Mini-PTL-OV`. No se documenta soporte para vLLM, TGI u Ollama en la información proporcionada.
- Latencia y throughput: no se proporcionan cifras para esta build GGUF. El autor sugiere medir con `llama-bench -ngl 99 -p 64 -n 256` y leer la línea `tg256` para la velocidad de generación. Para la build PTL-OV en Intel Arc B390 se reportan 34,4 tokens por segundo.
- Parámetros de ejecución recomendados por el autor: `-ngl 99 -c 65536 -ub 64 --temp 1.0 --top-p 1.0 --top-k 0 --min-p 0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision media (6 benchmarks) | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini (esta build, Omko Q2_K) | 26B (MoE) | 1.048.576 (max.); 65.536 recomendado | 77,5% | OOML v1.0 (base Apache 2.0) | GGUF, 9,1 GB |
| Inkling-2-Mini (Unsloth UD-Q2_K_XL) | 26B (MoE) | no disponible | 75,7% | OOML v1.0 (base Apache 2.0) | GGUF, 9,1 GB |
| Inkling-2-Mini (bartowski IQ2_XXS) | 26B (MoE) | no disponible | 81,4% | OOML v1.0 (base Apache 2.0) | GGUF, 10,3 GB |
| Inkling-2-Mini (AtomicChat AD-IQ2_M) | 26B (MoE) | no disponible | 72,7% | OOML v1.0 (base Apache 2.0) | GGUF, 8,7 GB |

No se dispone de información sobre modelos de otros autores con los que comparar directamente en la documentación proporcionada. Las alternativas listadas son distintas cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- La cuantización Q2_K es agresiva: la precisión media cae respecto a builds de mayor tamaño (por ejemplo, 81,4% para IQ2_XXS de 10,3 GB frente a 77,5% para esta build de 9,1 GB). Para tareas sensibles a la precisión conviene valorar builds de mayor tamaño.
- La licencia OOML v1.0 (Omko Open Model License) es distinta de la Apache 2.0 del modelo base; es necesario revisar los términos de OOML antes de uso comercial, ya que la información disponible no detalla sus restricciones.
- El modelo base original acepta texto e imagen; esta build GGUF es solo texto, por lo que se pierde la capacidad multimodal.
- No se documentan los idiomas soportados; no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés sin evaluación previa.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad del modelo base.
- El contexto máximo de 1.048.576 tokens requiere configuración explícita en llama.cpp (`-c 65536` recomendado por el autor); sin ese parámetro, llama.cpp dimensiona el contexto para el máximo del modelo y puede agotar la memoria.
- El rendimiento en GPUs de consumo no está medido en la información disponible; el autor solo reporta cifras para la build PTL-OV en Intel Arc B390.
- El modelo tiene pocas descargas (2) y likes (4) en el momento de la consulta, lo que indica una validación comunitaria todavía muy limitada.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse su disponibilidad en producción sin pruebas.

## Enlaces

- Repositorio Hugging Face de esta build: https://huggingface.co/omko-ai/Inkling-2-Mini-llama_cpp-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build para Intel Panther Lake Arc B390: https://huggingface.co/omko-ai/Inkling-2-Mini-PTL-OV
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b12723: https://github.com/ggml-org/llama.cpp/releases/tag/b12723
- Perfil del autor Omko: https://huggingface.co/omko-ai
- Perfil de Thinking Machines Lab: https://huggingface.co/thinkingmachines

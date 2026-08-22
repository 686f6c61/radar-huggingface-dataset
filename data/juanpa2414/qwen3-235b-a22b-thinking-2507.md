# Juanpa2414/Qwen3-235B-A22B-Thinking-2507

## Resumen

Qwen3-235B-A22B-Thinking-2507 es una versión actualizada del modelo de razonamiento de Qwen (Alibaba), publicada en julio de 2025. Se trata de un modelo de lenguaje causal de tipo Mixture-of-Experts (MoE) con 235 mil millones de parámetros totales y 22 mil millones activos por token, diseñado exclusivamente para el modo *thinking* (razonamiento explícito antes de responder). Esta versión mejora significativamente la calidad y profundidad del razonamiento en tareas de lógica, matemáticas, ciencia, programación y benchmarks académicos, además de reforzar capacidades generales como el seguimiento de instrucciones, el uso de herramientas y la comprensión de contextos largos de hasta 262 144 tokens (256K).

El modelo mantiene la arquitectura MoE de su predecesor, con 128 expertos de los que se activan 8 por token, atención con Grouped Query Attention (GQA) de 64 cabezas para consultas y 4 para claves/valores, y 94 capas. Al igual que la versión *Thinking* original, este checkpoint solo admite el modo de razonamiento: la plantilla de chat inyecta automáticamente el token `thinking` al inicio, por lo que la salida típicamente contiene únicamente la etiqueta `response` sin un apertura explícita de `thinking`. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones de atribución.

La relevancia de esta versión radica en que alcanza resultados de vanguardia entre los modelos de razonamiento de código abierto, compitiendo directamente con alternativas cerradas como OpenAI O3, Gemini 2.5 Pro y Claude 4 Opus en benchmarks como AIME25, LiveCodeBench o SuperGPQA. La versión disponible en el repositorio `Juanpa2414/Qwen3-235B-A22B-Thinking-2507` es una copia íntegra de los pesos oficiales publicados por Qwen, en formato `safetensors`, con un tamaño total de 470,2 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (Mixture-of-Experts, causal LM) |
| Parametros totales | 235.093.634.560 (235B) |
| Parametros activos | 22B |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa; se pueden cuantizar externamente) |
| Idiomas soportados | no disponible (no se detalla en la documentación del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (470,2 GB) |
| Capas | 94 |
| Cabezas de atención (GQA) | 64 para Q, 4 para KV |
| Expertos | 128 totales, 8 activos |
| Modo de razonamiento | Solo thinking (sin modo non-thinking) |
| Output máximo | 81.920 tokens (para tareas de razonamiento y código) |

## Arquitectura y entrenamiento

Qwen3-235B-A22B-Thinking-2507 es un modelo causal de lenguaje con arquitectura Mixture-of-Experts. Cada token se procesa a través de 8 de los 128 expertos disponibles, lo que reduce el coste computacional por token a unos 22B de parámetros activos, a pesar de tener 235B de parámetros totales. La atención utiliza Grouped Query Attention (GQA) con 64 cabezas de consulta y 4 de clave/valor, lo que reduce el consumo de memoria en el cache de KV. El modelo tiene 94 capas y una ventana de contexto nativa de 262.144 tokens.

El entrenamiento combina una fase de preentrenamiento y otra de post-entrenamiento, aunque la documentación no detalla el proceso exacto de alineación (si se usó RLHF, DPO u otro método). La versión 2507 se presenta como una actualización de la versión anterior Qwen3-235B-A22B-Thinking, centrada en mejorar la profundidad del razonamiento y las capacidades generales. Entre las innovaciones técnicas destaca la ampliación de la longitud de razonamiento (el modelo produce cadenas de pensamiento más largas), la mejora del seguimiento de instrucciones y el uso de herramientas, y la optimización del contexto largo. La plantilla de chat está configurada para forzar el modo thinking, de modo que el modelo siempre genera una cadena de razonamiento antes de la respuesta final.

## Capacidades

- Razonamiento explícito (thinking mode) con cadenas de pensamiento largas y profundas, adecuado para problemas complejos de lógica, matemáticas y ciencia.
- Generación de código de alta calidad, con soporte para múltiples lenguajes y resolución de problemas de programación competitiva (LiveCodeBench, CFEval, OJBench).
- Comprensión de contexto largo de hasta 256K tokens, con capacidad para procesar documentos extensos, libros, código de grandes repositorios o conversaciones de muchas vueltas.
- Uso de herramientas (tool calling) y ejecución de agentes autónomos: soporta integración con funciones y APIs, y resolución de tareas multi-paso (benchmarks TAU, BFCL-v3).
- Seguimiento de instrucciones y alineación con preferencias humanas, con buenos resultados en IFEval, Arena-Hard y WritingBench.
- Capacidades multilingües: aunque no se documentan los idiomas exactos, el modelo base Qwen3 soporta más de 100 idiomas y la versión 2507 mejora el rendimiento en tareas multilingües (MultiIF, MMLU-ProX, INCLUDE, PolyMATH).
- Generación de texto y escritura creativa de alta calidad (Creative Writing v3, WritingBench).
- Capacidad de producir salidas de hasta 81.920 tokens, útil para tareas de razonamiento largo o generación de documentos extensos.

## Casos de uso

- Resolución de problemas matemáticos avanzados: el modelo es adecuado para generar soluciones paso a paso de olimpiadas matemáticas (AIME25, HMMT25), demostraciones de teoremas o verificación de razonamiento matemático en entornos académicos. Su cadena de pensamiento larga permite descomponer problemas complejos en subproblemas.
- Generación de código en producción: con soporte para tool calling y un rendimiento destacado en LiveCodeBench, puede integrarse en pipelines de CI/CD para generación de pruebas, refactorización de código, autocompletado avanzado o resolución de incidencias en repositorios de gran tamaño. La ventana de 256K permite procesar repositorios enteros.
- Agentes autónomos de IA: gracias a su capacidad de razonamiento y uso de herramientas, puede ser el cerebro de agentes que interactúan con APIs, bases de datos, sistemas de ticketing o plataformas de comercio electrónico. Los resultados en benchmarks TAU demuestran su capacidad para completar tareas multi-paso con múltiples herramientas.
- Análisis de documentos largos: con 256K tokens de contexto, el modelo puede leer y resumir informes extensos, contratos, papers de investigación, libros o transcripciones completas. Es adecuado para extraer conclusiones, responder preguntas sobre el contenido y generar resúmenes ejecutivos.
- Generación de contenido académico y científico: puede redactar resúmenes de literatura, ayudar a estructurar papers, revisar la coherencia lógica de argumentos y generar texto científico de alta calidad (supera a la media en WritingBench y Creative Writing).
- Evaluación de modelos y benchmarks: por su rendimiento competitivo, se puede utilizar como juez automático en evaluaciones de otros modelos (Arena-Hard, IFEval), o como generador de datasets sintéticos para entrenamiento de modelos más pequeños.
- Traducción y localización multilingüe: el modelo base es multilingüe, y esta versión mejora la calidad en tareas de traducción y razonamiento en varios idiomas (MultiIF, PolyMATH), lo que lo hace útil para servicios de localización de contenido técnico.

## Benchmarks y rendimiento

La siguiente tabla muestra los resultados reportados por el equipo de Qwen en la model card, comparando el modelo con alternativas de razonamiento de alto nivel. Los valores son extraídos directamente de la documentación oficial.

| Benchmark | Qwen3-235B-A22B-Thinking-2507 | Qwen3-235B-A22B-Thinking | DeepSeek-R1-0528 | OpenAI O4-mini | OpenAI O3 | Gemini 2.5 Pro | Claude 4 Opus Thinking |
|---|---|---|---|---|---|---|---|
| **Knowledge** | | | | | | | |
| MMLU-Pro | 84.4 | 82.8 | 85.0 | 81.9 | 85.9 | 85.6 | - |
| MMLU-Redux | 93.8 | 92.7 | 93.4 | 92.8 | 94.9 | 94.4 | 94.6 |
| GPQA | 81.1 | 71.1 | 81.0 | 81.4* | 83.3* | 86.4 | 79.6 |
| SuperGPQA | 64.9 | 60.7 | 61.7 | 56.4 | - | 62.3 | - |
| **Reasoning** | | | | | | | |
| AIME25 | 92.3 | 81.5 | 87.5 | 92.7* | 88.9* | 88.0 | 75.5 |
| HMMT25 | 83.9 | 62.5 | 79.4 | 66.7 | 77.5 | 82.5 | 58.3 |
| LiveBench 20241125 | 78.4 | 77.1 | 74.7 | 75.8 | 78.3 | 82.4 | 78.2 |
| HLE | 18.2# | 11.8# | 17.7# | 18.1* | 20.3 | 21.6 | 10.7 |
| **Coding** | | | | | | | |
| LiveCodeBench v6 (25.02-25.05) | 74.1 | 55.7 | 68.7 | 71.8 | 58.6 | 72.5 | 48.9 |
| CFEval | 2134 | 2056 | 2099 | 1929 | 2043 | 2001 | - |
| OJBench | 32.5 | 25.6 | 33.6 | 33.3 | 25.4 | 38.9 | - |
| **Alignment** | | | | | | | |
| IFEval | 87.8 | 83.4 | 79.1 | 92.4 | 92.1 | 90.8 | 89.7 |
| Arena-Hard v2$ | 79.7 | 61.5 | 72.2 | 59.3 | 80.8 | 72.5 | 59.1 |
| Creative Writing v3 | 86.1 | 84.6 | 86.3 | 78.8 | 87.7 | 85.9 | 83.8 |
| WritingBench | 88.3 | 80.3 | 83.2 | 78.4 | 85.3 | 83.1 | 79.1 |
| **Agent** | | | | | | | |
| BFCL-v3 | 71.9 | 70.8 | 63.8 | 67.2 | 72.4 | 67.2 | 61.8 |
| TAU1-Retail | 67.8 | 54.8 | 63.9 | 71.8 | 73.9 | 74.8 | - |
| TAU1-Airline | 46.0 | 26.0 | 53.5 | 49.2 | 52.0 | 52.0 | - |
| TAU2-Retail | 71.9 | 40.4 | 64.9 | 71.0 | 76.3 | 71.3 | - |
| TAU2-Airline | 58.0 | 30.0 | 60.0 | 59.0 | 70.0 | 60.0 | - |
| TAU2-Telecom | 45.6 | 21.9 | 33.3 | 42.0 | 60.5 | 37.4 | - |
| **Multilingualism** | | | | | | | |
| MultiIF | 80.6 | 71.9 | 63.5 | 78.0 | 80.3 | 77.8 | - |
| MMLU-ProX | 81.0 | 80.0 | 80.6 | 79.0 | 83.3 | 84.7 | - |
| INCLUDE | 81.0 | 78.7 | 79.4 | 80.8 | 86.6 | 85.1 | - |
| PolyMATH | 60.1 | 54.7 | 46.9 | 48.7 | 49.7 | 52.2 | - |

Nota: los asteriscos (*) indican que OpenAI O4-mini y O3 se evaluaron con high reasoning effort. El símbolo # indica que los modelos no multimodales se evaluaron solo con el subconjunto de texto de HLE. El símbolo $ indica que los resultados de Arena-Hard v2 se obtuvieron con GPT-4.1 como juez. Para tareas de razonamiento y código se usó un output máximo de 81.920 tokens; para el resto, 32.768.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - En precisión original (fp16/bf16): ~470 GB de VRAM solo para los pesos, por lo que se necesitan múltiples GPUs de alta capacidad (por ejemplo, 6×80GB A100/H100).
  - Con cuantización de 8 bits: ~235 GB (3×80GB o 10×24GB).
  - Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ): ~117 GB, que cabe en 2×80GB o 5×24GB.
- GPUs recomendadas: A100 80GB, H100 80GB, RTX 4090 (24GB) o RTX A6000 (48GB) en configuraciones multi-GPU. Para consumo personal, se necesitan al menos 5-6 GPUs de 24GB con cuantización 4-bit.
- No es viable en una sola GPU de consumo (16GB o 24GB) sin cuantización extrema (por ejemplo, 2-3 bits) que degrade el rendimiento.
- Opciones de despliegue: compatible con vLLM, TensorRT-LLM, llama.cpp (con cuantización GGUF), Ollama (si se convierte a GGUF) y Hugging Face TGI. Se requiere transformers >= 4.51.0 para cargar el modelo en Python.
- Latencia y throughput: no disponibles en la documentación. Al ser un modelo MoE con 22B activos, el throughput por token es similar al de un modelo denso de 22B, pero el memory footprint es el de 235B.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | MMLU-Pro | AIME25 | LiveCodeBench v6 |
|---|---|---|---|---|---|---|---|
| Qwen3-235B-A22B-Thinking-2507 | 235B | 22B | 256K | Apache 2.0 | 84.4 | 92.3 | 74.1 |
| Qwen3-235B-A22B-Thinking (original) | 235B | 22B | 256K | Apache 2.0 | 82.8 | 81.5 | 55.7 |
| DeepSeek-R1-0528 | 671B (MoE) | 37B | 128K | MIT | 85.0 | 87.5 | 68.7 |
| OpenAI O4-mini | no disponible (cerrado) | - | - | propietaria | 81.9 | 92.7 | 71.8 |

La versión 2507 supera a su predecesora en todas las categorías de razonamiento, código y alineación, y en muchos casos iguala o supera a DeepSeek-R1-0528 y a modelos cerrados como OpenAI o4-mini. Es especialmente fuerte en tareas de programación competitiva (LiveCodeBench, CFEval) y en razonamiento matemático (AIME25, HMMT25). Frente a DeepSeek-R1, ofrece un contexto más largo (256K vs 128K) y un menor número de parámetros activos (22B vs 37B), lo que reduce el coste por token en inferencia.

## Limitaciones y advertencias

- El modelo solo admite el modo thinking, por lo que no se puede desactivar el razonamiento. Esto puede provocar respuestas más lentas y costosas en tareas simples donde no se necesita razonamiento explícito.
- No se especifican los idiomas soportados en la documentación del repositorio, aunque el modelo base Qwen3 es multilingüe. Es posible que el rendimiento varíe entre idiomas, con peores resultados en lenguas menos representadas.
- Riesgo de alucinación y errores factuales en dominios de conocimiento no cubiertos en el entrenamiento, especialmente en tareas de razonamiento complejo. No se han publicado evaluaciones de sesgos (bias) ni de seguridad para esta versión.
- El tamaño del repositorio es de 470,2 GB, lo que requiere un gran ancho de banda y espacio de almacenamiento para descargar el modelo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es una copia del repositorio de un tercero (`Juanpa2414`), no del equipo oficial de Qwen. Se recomienda verificar la procedencia y usar los pesos oficiales del repositorio de Qwen para producción.
- Se requiere transformers >= 4.51.0 para cargar la arquitectura `qwen3_moe`; versiones anteriores fallan con un error de `KeyError`.
- El output máximo de 81.920 tokens puede no ser suficiente para tareas que requieran salidas muy largas (más de 80K tokens).
- No se proporcionan datos de latencia, throughput ni requisitos de memoria concretos, por lo que el despliegue en producción requiere pruebas previas.

## Enlaces

- Repositorio en Hugging Face (este modelo): https://huggingface.co/Juanpa2414/Qwen3-235B-A22B-Thinking-2507
- Modelo oficial de Qwen en HuggingFace: https://huggingface.co/Qwen/Qwen3-235B-A22B-Thinking-2507
- Modelo base Qwen3-235B-A22B: https://huggingface.co/Qwen/Qwen3-235B-A22B
- Versión Instruct-2507: https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507
- Blog de Qwen sobre Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Chat oficial de Qwen: https://chat.qwen.ai/
- Ficha en Benchable: https://benchable.ai/models/qwen/qwen3-235b-a22b-04-28
- Ficha en upend.ai: https://upend.ai/qwen3-235b-a22b-thinking-2507
- Ficha en Vast.ai: https://vast.ai/model/qwen3-235b-a22b-thinking-2507

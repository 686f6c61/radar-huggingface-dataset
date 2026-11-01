# blueqat/nobidog-qubo-1b-0.2

## Resumen

`nobidog-qubo-1b-0.2` es un modelo de lenguaje de 1.179.224.064 parámetros desarrollado por blueqat Inc., entrenado desde cero con arquitectura tipo Llama y especializado en una tarea muy concreta: leer un enunciado de optimización combinatoria escrito en japonés y emitir una formulación estructurada en JSON compatible con un solver QUBO (Quadratic Unconstrained Binary Optimization). No es un modelo conversacional generalista, sino un componente de un pipeline mayor donde un solver separado (qsolve/qmodel en el servicio poqet) se encarga de resolver, verificar optimalidad y generar gráficos.

El modelo cubre dos modos de salida: la lectura de 10 tipos fijos de problema (knapsack, tsp, maxcut, number-partition, assignment, bin-packing, coloring, vertex-cover, mis, set-cover) y la denominada "formulación en palabras" para problemas fuera de esos tipos, con un esquema JSON que admite conjuntos, variables, objetivo y restricciones tipadas. Esta especialización lo hace relevante para quienes construyen interfaces en lenguaje natural sobre solvers de optimización y necesitan un extractor de estructura fiable y ligero, desplegable en hardware modesto.

La arquitectura es un decoder Llama-style con RMSNorm, RoPE, SwiGLU y GQA, 24 capas, hidden 2048, 16 cabezas de atención (8 KV heads), contexto de 2048 tokens y vocabulario de 32.000 con SentencePiece Unigram y byte fallback. Se distribuye bajo licencia Apache-2.0 con pesos en safetensors y GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo Llama (RMSNorm, RoPE, SwiGLU, GQA) |
| Parámetros totales | 1.179.224.064 (1.244.760.064 entradas tensoriales incluyendo la cabeza de salida compartida) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | fp16 (safetensors), GGUF f16, GGUF q8_0, GGUF q4_k_m |
| Idiomas soportados | ja (principal), en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp16), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de estilo Llama con 24 capas, dimensión oculta 2048, 16 cabezas de atención con 8 KV heads (GQA), dimensión intermedia 5504, vocabulario de 32.000 tokens mediante SentencePiece Unigram con byte fallback, embeddings compartidos (tied embeddings) y contexto máximo de 2048 tokens. El tokenizer es relevante para usuarios de GGUF: al ser Unigram, el tokenizer se almacena en el GGUF como tipo `t5` (UGM).

El preentrenamiento se hizo desde cero con aproximadamente 20.000 millones de tokens sobre Wikipedia japonesa (`wikimedia/wikipedia` 20231101.ja, CC BY-SA 4.0), FineWeb-2 japonés (`HuggingFaceFW/fineweb-2` jpn_Jpan, ODC-By 1.0) y un corpus interno en japonés sobre computación cuántica y optimización. No se usaron pesos preentrenados de terceros ni salidas de DeepSeek. Sobre esa base se aplicó SFT con unos 60.000 pares problema/JSON generados por generadores internos (paráfrasis sintetizadas con Qwen3.6, Apache-2.0) y 7.630 formulaciones libres validadas contra el solver, seguidas de GRPO cuyo reward es que el solver devuelva el óptimo correcto. Esta etapa de RL con verificación por solver es la innovación técnica destacable: el modelo se optimiza contra la corrección de la formulación resuelta, no contra similitud textual.

## Capacidades

- Lectura de enunciados de optimización en japonés y emisión de JSON estructurado para 10 tipos fijos: knapsack, tsp, maxcut, number-partition, assignment, bin-packing, coloring, vertex-cover, mis y set-cover.
- Formulación libre ("言葉の定式化") para problemas fuera de los tipos fijos, con esquema `{"title","sets","data","vars","objective","constraints"}` y restricciones tipadas: `exactly_one`, `at_most`, `at_least`, `equal`, `not_both`, `implies`, `at_least_one_of`.
- Referencias indexadas a datos en variables (por ejemplo `x[u[e]]`), lo que permite expresar problemas de grafos como listas de aristas.
- Plantilla de chat incluida (`chat_template.jinja`), compatible con `apply_chat_template`.
- Capacidad multilingüe limitada a ja/en/zh, con el japonés como idioma de trabajo real.
- No soporta tool calling, ni razonamiento multi-step general, ni visión, ni audio, ni modo thinking. No es un modelo conversacional.

## Casos de uso

- Extracción de estructura para solvers QUBO: dado un enunciado en japonés de un problema de mochila o TSP, el modelo emite el JSON que un solver como qsolve consume directamente, eliminando el paso manual de traducción del problema a formulación.
- Prototipado de interfaces en lenguaje natural sobre herramientas de optimización: integración en un servicio tipo poqet donde el usuario describe el problema y el modelo produce la formulación borrador que luego se resuelve y valida.
- Generación de formulaciones para problemas no tipificados: mediante el prefijo `言葉で定式化:`, se obtienen sets, variables, objetivo y restricciones para problemas de asignación con capacidad u otros que no encajan en los 10 tipos fijos.
- Automatización de pipelines de investigación operativa: uso como primer eslabón que convierte descripciones textuales de problemas en JSON, con verificación posterior por solver antes de cualquier decisión.
- Despliegue en entornos con recursos limitados: al ser un modelo de 1,18B con GGUF q4_k_m, puede ejecutarse en CPU o GPU de gama baja para tareas de extracción batch de formulaciones.
- Evaluación de calidad de formulaciones: combinado con un solver, sirve para medir automáticamente si la formulación generada alcanza el óptimo, lo que permite construir bucles de mejora o de validación en producción.
- Docencia y demostraciones de optimización cuántica: el modelo traduce ejemplos didácticos en japonés a formulaciones QUBO ejecutables en solvers de annealing.

## Benchmarks y rendimiento

Evaluación interna publicada por el autor (2026-10-22). La puntuación consiste en resolver el JSON emitido con `qsolve` y comparar el óptimo con el ground truth; no hay solapamiento exacto con los datos de entrenamiento (0 coincidencias).

| Conjunto de prueba | Resultado |
|---|---|
| 170 enunciados no vistos (tipos fijos; la formulación alcanza el óptimo correcto) | 153/170 (90,0 %) |
| 170 enunciados no vistos (tipo correcto identificado) | 161/170 (94,7 %) |
| 221 enunciados parafraseados (óptimo correcto) | 205/221 (92,8 %) |
| 169 formulaciones libres (el solver las acepta y el óptimo coincide) | 132/169 (78,1 %) |
| 60 problemas de asignación con capacidad (fuera de los tipos fijos) | 55/60 (91,7 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 2,4 GB solo para pesos, más overhead de activaciones y caché KV; con contexto de 2048 y GQA (8 KV heads) el coste de caché es moderado.
- GGUF q8_0: aproximadamente 1,3 GB de pesos; GGUF q4_k_m: aproximadamente 0,8 GB.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 y superiores, con amplio margen. También es viable en CPU para inferencia batch.
- Despliegue: transformers (AutoModelForCausalLM), llama.cpp (`llama-server -m nobidog-qubo-1b-0.2-q8_0.gguf` y endpoint `/v1/chat/completions`), text-generation-inference (tag `text-generation-inference`), endpoints compatibles. vLLM y Ollama no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados para alternativas de la misma categoría (extractores de formulaciones de optimización). Se ofrece una comparación cualitativa con modelos generalistas de tamaño similar que podrían usarse para la misma tarea, sin cifras de rendimiento verificadas.

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nobidog-qubo-1b-0.2 | 1,18B | 2048 | Formulación QUBO en japonés, SFT + GRPO con solver | Apache-2.0 | HuggingFace, GGUF |
| Modelos generalistas ~1B (p. ej. familia Llama/Qwen de tamaño similar) | ~1B | variable | Conversación general, sin especialización en QUBO | variable | HuggingFace |
| Modelos mayores (~7B+) usados como extractores | 7B+ | variable | Capacidad general superior, pero sin entrenamiento específico en formulación QUBO | variable | HuggingFace |

La ventaja del modelo es la especialización verificada contra solver y su huella reducida; la desventaja es que un modelo generalista mayor puede manejar problemas más variados, aunque sin garantía de que la formulación resultante sea resoluble correctamente.

## Limitaciones y advertencias

- Solo procesa problemas dentro de los 10 tipos fijos y del esquema de formulación libre; problemas con más de unos pocos cientos de variables binarias quedan fuera de su alcance.
- Se producen errores de transcripción en tablas numéricas densas (por ejemplo, una matriz de distancias de 6×6); las listas de aristas son más fiables.
- El modelo es exclusivamente japonés en la práctica; no es un modelo de chat y no responde preguntas generales.
- La salida debe tratarse como una formulación borrador: hay que resolverla y comprobar factibilidad y optimalidad antes de usarla.
- Riesgo de alucinación en la estructura JSON: puede emitir tipos o restricciones que el solver rechace, especialmente en formulación libre (78,1 % de acierto en la evaluación interna).
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse sobre Wikipedia y FineWeb-2 japoneses, puede heredar sesgos de esas fuentes.
- Licencia Apache-2.0 para los pesos, con atribuciones de datos: Wikipedia CC BY-SA 4.0 y FineWeb-2 ODC-By 1.0 sujeto a los términos de Common Crawl. Verificar el cumplimiento de esas atribuciones en uso comercial.
- Para usuarios de GGUF: el tokenizer es Unigram y se almacena como tipo `t5` (UGM); herramientas que no soporten ese tipo pueden fallar al cargar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blueqat/nobidog-qubo-1b-0.2
- Web de blueqat: https://blueqat.com
- Dataset Wikipedia japonés: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Repositorio llama.cpp (para GGUF): https://github.com/ggml-org/llama.cpp
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada.

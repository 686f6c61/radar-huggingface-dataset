# Patrick66/uq-supermicro-fp8

## Resumen

uq-supermicro-fp8 es una conversión a precisión FP8 del modelo Qwen3-30B-A3B-Instruct-2507, publicada por el usuario Patrick66 en HuggingFace. Se trata de un modelo de lenguaje causal de tipo Mixture-of-Experts (MoE) con 30.532 millones de parámetros totales y aproximadamente 3.300 millones activos por token, desarrollado originalmente por el equipo Qwen de Alibaba. La versión aquí descrita no es un modelo nuevo, sino una cuantización del checkpoint original orientada a reducir la huella de memoria y acelerar la inferencia en hardware compatible con FP8.

El modelo base resuelve tareas de generación de texto, razonamiento lógico, matemáticas, código, uso de herramientas y comprensión de contexto largo, con una ventana nativa de 262.144 tokens. Su relevancia actual radica en que combina una arquitectura MoE relativamente eficiente (solo 8 de 128 expertos activados por token) con una ventana de contexto muy amplia, lo que lo sitúa como una opción atractiva para despliegues de agentes y procesamiento de documentos extensos sin necesidad de clústeres de gran escala.

La ficha se centra en la versión FP8 alojada en el repositorio `Patrick66/uq-supermicro-fp8`, que hereda las capacidades del modelo original Qwen3-30B-A3B-Instruct-2507 y añade la ventaja de un formato de pesos de 8 bits. El repositorio tiene 31,2 GB y 24 descargas en el momento de la consulta, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture-of-Experts (Qwen3 MoE), 48 capas, GQA (32 cabezas Q / 4 KV), 128 expertos con 8 activados |
| Parametros totales | 30.532.122.624 (30,5B); 29,9B sin embeddings |
| Parametros activos | ~3,3B por token |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | FP8 (versión del repositorio); el modelo base admite otras cuantizaciones no especificadas en la información disponible |
| Idiomas soportados | No disponible (la model card menciona mejoras en cobertura multilingüe de cola larga, sin listar idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal con capas MoE: 48 capas, atención con Grouped-Query Attention (32 cabezas para Q y 4 para KV) y 128 expertos por capa, de los cuales se activan 8 por token. Esta configuración permite un coste computacional por token cercano al de un modelo denso de ~3,3B de parámetros, manteniendo la capacidad representacional de un modelo de 30,5B. El modelo base fue entrenado en dos fases (pretraining y post-training) por el equipo Qwen; la model card no detalla el número exacto de tokens de entrenamiento ni la composición del dataset.

La versión -2507 del modelo base introduce mejoras en seguimiento de instrucciones, razonamiento lógico, comprensión de texto, matemáticas, ciencia, código y uso de herramientas, así como una mayor alineación con preferencias del usuario en tareas subjetivas y abiertas. Es una variante de modo no-thinking: no genera bloques `<think></think>` y no requiere el parámetro `enable_thinking=False`. La conversión a FP8 del repositorio `uq-supermicro-fp8` no modifica la arquitectura, solo la precisión numérica de los pesos.

## Capacidades

- Generación de texto conversacional y de alta calidad en tareas abiertas y subjetivas.
- Razonamiento lógico y matemático (AIME25, HMMT25, ZebraLogic, PolyMATH en la evaluación del modelo base).
- Generación y comprensión de código en múltiples lenguajes (LiveCodeBench, MultiPL-E, Aider-Polyglot).
- Conocimiento general y científico (MMLU-Pro, GPQA, SuperGPQA).
- Comprensión de contexto largo: ventana nativa de 262.144 tokens, con mejoras específicas en la versión 2507.
- Soporte de tool calling / function calling (evaluado en BFCL-v3 y TAU1/TAU2).
- Capacidades de agente y razonamiento multi-paso (TAU-Retail, TAU-Airline, TAU-Telecom).
- Capacidades multilingües con mejora en conocimiento de cola larga (MultiIF, MMLU-ProX, INCLUDE, PolyMATH).
- Modo no-thinking exclusivamente: no genera bloques de razonamiento explícito.
- Compatible con endpoints OpenAI a través de SGLang (`>=0.4.6.post1`) y vLLM (`>=0.8.5`).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (262.144 tokens) gracias a su ventana nativa, lo que permite mantener historiales completos de cliente sin truncar información.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o resolución de incidencias, con buen rendimiento en LiveCodeBench v6 (43,2) y MultiPL-E (83,8).
- Agentes autónomos con uso de herramientas: sus resultados en BFCL-v3 (65,1) y TAU1/TAU2 lo hacen adecuado para orquestación de tareas multi-paso con llamadas a APIs externas.
- Procesamiento de documentos extensos: informes, contratos o expedientes de cientos de miles de tokens pueden analizarse en una sola pasada sin chunking agresivo, gracias al contexto de 262K.
- Asistencia matemática y científica: útil en entornos educativos o de investigación para resolución de problemas (AIME25: 61,3; HMMT25: 43,0; GPQA: 70,4).
- Generación de contenido creativo y redacción: con puntuaciones altas en Creative Writing v3 (86,0) y WritingBench (85,5), adecuado para marketing, copywriting y redacción asistida.
- Despliegue en infraestructura con FP8: la versión cuantizada reduce la VRAM necesaria frente al checkpoint BF16, lo que facilita servir el modelo en GPUs con soporte FP8 (H100, H200, L40S) manteniendo la calidad del modelo base.
- Traducción y tareas multilingües: con mejoras en PolyMATH (43,1) y cobertura multilingüe de cola larga, útil para localización y soporte en varios idiomas.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base Qwen3-30B-A3B-Instruct-2507 (no específicos de la versión FP8, que hereda el comportamiento del original):

| Benchmark | Deepseek-V3-0324 | GPT-4o-0327 | Gemini-2.5-Flash Non-Thinking | Qwen3-235B-A22B Non-Thinking | Qwen3-30B-A3B Non-Thinking | Qwen3-30B-A3B-Instruct-2507 |
|---|---|---|---|---|---|---|
| MMLU-Pro | 81,2 | 79,8 | 81,1 | 75,2 | 69,1 | 78,4 |
| MMLU-Redux | 90,4 | 91,3 | 90,6 | 89,2 | 84,1 | 89,3 |
| GPQA | 68,4 | 66,9 | 78,3 | 62,9 | 54,8 | 70,4 |
| SuperGPQA | 57,3 | 51,0 | 54,6 | 48,2 | 42,2 | 53,4 |
| AIME25 | 46,6 | 26,7 | 61,6 | 24,7 | 21,6 | 61,3 |
| HMMT25 | 27,5 | 7,9 | 45,8 | 10,0 | 12,0 | 43,0 |
| ZebraLogic | 83,4 | 52,6 | 57,9 | 37,7 | 33,2 | 90,0 |
| LiveBench 20241125 | 66,9 | 63,7 | 69,1 | 62,5 | 59,4 | 69,0 |
| LiveCodeBench v6 | 45,2 | 35,8 | 40,1 | 32,9 | 29,0 | 43,2 |
| MultiPL-E | 82,2 | 82,7 | 77,7 | 79,3 | 74,6 | 83,8 |
| Aider-Polyglot | 55,1 | 45,3 | 44,0 | 59,6 | 24,4 | 35,6 |
| IFEval | 82,3 | 83,9 | 84,3 | 83,2 | 83,7 | 84,7 |
| Arena-Hard v2 | 45,6 | 61,9 | 58,3 | 52,0 | 24,8 | 69,0 |
| Creative Writing v3 | 81,6 | 84,9 | 84,6 | 80,4 | 68,1 | 86,0 |
| WritingBench | 74,5 | 75,5 | 80,5 | 77,0 | 72,2 | 85,5 |
| BFCL-v3 | 64,7 | 66,5 | 66,1 | 68,0 | 58,6 | 65,1 |
| TAU1-Retail | 49,6 | 60,3 | 65,2 | 65,2 | 38,3 | 59,1 |
| TAU1-Airline | 32,0 | 42,8 | 48,0 | 32,0 | 18,0 | 40,0 |
| TAU2-Retail | 71,1 | 66,7 | 64,3 | 64,9 | 31,6 | 57,0 |
| TAU2-Airline | 36,0 | 42,0 | 42,5 | 36,0 | 18,0 | 38,0 |
| TAU2-Telecom | 34,0 | 29,8 | 16,9 | 24,6 | 18,4 | 12,3 |
| MultiIF | 66,5 | 70,4 | 69,4 | 70,2 | 70,8 | 67,9 |
| MMLU-ProX | 75,8 | 76,2 | 78,3 | 73,2 | 65,1 | 72,0 |
| INCLUDE | 80,1 | 82,1 | 83,8 | 75,6 | 67,8 | 71,9 |
| PolyMATH | 32,2 | 25,5 | 41,9 | 27,0 | 23,3 | 43,1 |

No se han publicado resultados de benchmarks específicos para la versión FP8 en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP8, el checkpoint ocupa aproximadamente 31,2 GB, por lo que se necesitan al menos ~32 GB de VRAM solo para pesos, más memoria para KV cache y activaciones. Con contexto largo (262K tokens), la KV cache puede crecer significativamente y requerir GPUs de 80 GB o más.
- GPU recomendadas: H100 (80 GB), H200 (141 GB), L40S (48 GB) para FP8 nativo; A100 (80 GB) puede ejecutar FP8 mediante emulación o conversión. Para contexto completo de 262K se recomienda H100/H200 o múltiples GPUs.
- ¿Cabe en consumer GPU? No de forma completa: una RTX 4090 (24 GB) no puede alojar los 31,2 GB de pesos FP8 sin offloading o cuantización adicional a 4 bits. Sería necesaria una cuantización GGUF Q4 o similar (no incluida en este repositorio) para caber en 24 GB.
- Opciones de despliegue: SGLang (`>=0.4.6.post1`), vLLM (`>=0.8.5`), transformers (versión reciente con soporte `qwen3_moe`), y endpoints compatibles con OpenAI. No se menciona soporte explícito de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. La model card original remite al blog y documentación de Qwen para detalles de rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-30B-A3B-Instruct-2507 (base) | 30,5B / 3,3B | 262.144 | Apache 2.0 | Checkpoint original en BF16; referencia de calidad |
| uq-supermicro-fp8 (este) | 30,5B / 3,3B | 262.144 | Apache 2.0 | Conversión FP8 del anterior; menor huella de memoria |
| Qwen3-235B-A22B Non-Thinking | 235B / 22B | no disponible en la información | Apache 2.0 (según familia Qwen3) | Mayor capacidad, mucho mayor coste de despliegue |
| DeepSeek-V3-0324 | no disponible | no disponible | no disponible | Competidor directo en benchmarks; mayor escala |
| GPT-4o-0327 | no disponible (propietario) | no disponible | Propietaria | Referencia comercial cerrada |

La comparativa se limita a los datos disponibles en la model card; no se dispone de información sobre otros modelos MoE de tamaño similar (por ejemplo, Mixtral) en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la información proporcionada; como todo modelo entrenado con datos web a gran escala, es probable que herede sesgos de esos corpus.
- Riesgo de alucinación: presente en tareas de conocimiento factual y razonamiento abierto; los benchmarks muestran un rendimiento sólido pero no exento de errores, especialmente en dominios de cola larga.
- Limitaciones de contexto o idioma: aunque soporta 262.144 tokens nativos, el rendimiento puede degradarse en los extremos de la ventana; la lista concreta de idiomas soportados no está disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base original (enlazada en la model card) para confirmar términos.
- Modo no-thinking exclusivo: no genera bloques de razonamiento explícito, lo que puede limitar tareas que se beneficien de cadena de pensamiento visible.
- La versión FP8 puede presentar pequeñas diferencias numéricas respecto al checkpoint BF16 original; no se han publicado evaluaciones específicas de la cuantización.
- El repositorio tiene muy pocas descargas (24) y ningún like, por lo que la validación comunitaria es escasa; se recomienda verificar la integridad de los pesos antes de usarlos en producción.
- Para contexto completo de 262K se requiere hardware de gama alta; en GPUs consumer será necesario recurrir a cuantizaciones adicionales no incluidas en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Patrick66/uq-supermicro-fp8
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/?model=Qwen3-30B-A3B-2507
- Papers referenciados en los tags: arXiv:2402.17463, arXiv:2407.02490, arXiv:2501.15383, arXiv:2404.06654, arXiv:2505.09388

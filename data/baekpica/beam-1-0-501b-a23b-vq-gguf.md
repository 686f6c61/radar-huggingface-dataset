# Baekpica/Beam-1.0-501B-A23B-VQ-GGUF

## Resumen
Beam-1.0-501B-A23B-VQ-GGUF es una conversión cuantizada del modelo Beam-1.0-501B-A23B de Reflection, un modelo de lenguaje de arquitectura mixture-of-experts (MoE) con 501.000 millones de parámetros totales y 23.000 millones de parámetros activos por token. El modelo original parte de un checkpoint en BF16 de aproximadamente 1 TB, y esta conversión lo reduce a unos 99,9 GB de partes GGUF mediante vector quantization (VQ) de 8 dimensiones aplicada a los expertos enrutados, manteniendo el resto de componentes en Q4_K o en la precisión del modelo fuente. El objetivo declarado es poder servir el modelo con su contexto completo de 1.048.576 tokens en un único dispositivo DGX Spark (GB10) con 128 GB de memoria unificada.

La relevancia de esta ficha radica en que demuestra una ruta de compresión agresiva para modelos MoE de gran tamaño sin degradar de forma catastrófica las capacidades de razonamiento: según el autor, la conversión conserva entre el 96% y el 98% de las puntuaciones del modelo original en GPQA Diamond, AIME 2026 e IFBench, aunque pierde bastante en recuperación factual (índice AA-Omniscience de −4,7 frente a 10,8 del original). El modelo base incluye un drafter de decodificación especulativa (DFlash2) y una plantilla de chat Harmony modificada con canales de análisis y final, además de soporte de tool calling tipado.

El repositorio está publicado bajo licencia Apache 2.0, solo declara inglés como idioma soportado y requiere un runtime específico, ds4-dfm-rs, con kernels CUDA propios para los expertos GVQ y para la decodificación especulativa. No es, por tanto, un GGUF estándar cargable en llama.cpp u Ollama sin trabajo adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (sparse mixture-of-experts), con capas de atención completa NoPE y capas de atención de ventana deslizante |
| Parámetros totales | 501B (modelo base); el dato de safetensors del repo indica 7.239.549.632 |
| Parámetros activos | 23B (modelo base) |
| Longitud de contexto | 1.048.576 tokens (9 capas de atención completa NoPE + 43 capas de ventana deslizante de 512; sin escalado RoPE) |
| Tipos de cuantización | VQ de 8 dimensiones para expertos enrutados (12 bits en capas 11–51, 13 bits en capas 3–10), Q4_K para atención y FFN denso, BF16 para tabla de tokens y componentes sensibles, Q8_0 para el drafter DFlash2 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (partes separadas; tabla de tokens BF16 en parte propia leída desde SSD) |

## Arquitectura y entrenamiento
El modelo base Beam-1.0-501B-A23B es un transformer MoE con 501B parámetros totales y 23B activos. La arquitectura combina 9 capas de atención completa sin RoPE (NoPE) con 43 capas de atención de ventana deslizante de 512 tokens, lo que permite alcanzar un contexto de 1.048.576 tokens sin recurrir a escalado RoPE. Los expertos enrutados se distribuyen en 49 capas MoE, cada una con 256 expertos y matrices gate/up/down.

La conversión a GGUF aplica vector quantization de 8 dimensiones sobre los expertos enrutados: un codebook E4M3 por capa compartido por todos los expertos y las tres matrices, más una ganancia F16 por fila. Las capas 3–10 usan 13 bits (K=8192, flujo de 12 bits más un plano de 1 bit) y las capas 11–51 usan 12 bits (K=4096). Los codebooks, asignaciones y ganancias se ajustaron con estadísticas de activación de un corpus de calibración ejecutado sobre el original BF16 (una importance matrix para VQ) mediante Lloyd ponderado por calibración. La atención, el FFN denso de las capas 0–2 y la cabeza de salida se cuantizan a Q4_K con el codificador de referencia GGML. Los pesos del router, el sesgo de corrección de puntuaciones, los sesgos de compuerta de atención, las normas q/k, las cuatro normas sandwich por capa y la norma final se mantienen en la precisión del modelo fuente. La tabla de tokens se conserva en BF16 en una parte separada que se lee por filas desde SSD, no residente en memoria.

## Capacidades
- Generación de texto y razonamiento multi-paso, con modo de análisis explícito (canal `analysis`) y respuesta final (canal `final`).
- Razonamiento matemático y científico de nivel competitivo, según los benchmarks reportados frente al original.
- Tool calling tipado mediante plantilla Harmony modificada con llamadas XML y `reasoning_effort` configurable entre 8 y 512.
- Soporte de agentes y razonamiento multi-paso a través de la plantilla Harmony y del soporte de tool use del runtime.
- Contexto largo de hasta 1.048.576 tokens, útil para documentos extensos o conversaciones prolongadas.
- Decodificación especulativa con el drafter DFlash2 incluido, que acelera la generación en modo greedy.
- Capacidades multilingües limitadas: la model card solo declara inglés.

## Casos de uso
- Análisis de documentos extensos: con 1.048.576 tokens de contexto, el modelo puede ingerir libros técnicos, expedientes o bases de código completas en una sola pasada sin truncamiento, algo inviable en modelos con ventanas de 32K o 128K.
- Asistentes de razonamiento científico: el rendimiento reportado en GPQA Diamond (88,6 frente a 90,6 del original) lo hace adecuado para preguntas de nivel posgrado en física, química y biología, con la salvedad de la pérdida en recuperación factual.
- Agentes con tool calling: la plantilla Harmony con llamadas XML tipadas y `reasoning_effort` ajustable permite integrarlo en pipelines de agentes que necesitan decidir cuándo invocar herramientas y con qué profundidad de razonamiento.
- Generación de código asistida en entornos con memoria limitada: al caber en un DGX Spark de 128 GB, puede desplegarse en estaciones de trabajo locales para autocompletado y revisión de código sin depender de la nube.
- Investigación sobre cuantización: el repositorio documenta receta, calibración y métricas de fidelidad (KL 0,144, 87,7% de coincidencia en el siguiente token), lo que lo convierte en un caso de estudio reproducible para técnicas de VQ en MoE.
- Despliegue en hardware de borde con memoria unificada: el runtime ds4-dfm-rs y los kernels CUDA para GVQ permiten servir el modelo en un único GB10, útil para prototipos y demostraciones sin clúster.
- Evaluación comparativa de fidelidad de cuantización: los benchmarks frente al original (GPQA, AIME, IFBench, AA-Omniscience) permiten medir el coste real de la compresión en distintas tareas.

## Benchmarks y rendimiento

| Benchmark | Original BF16 | Esta conversión | Retención |
|---|---|---|---|
| GPQA Diamond | 90,6 | 88,6 | 97,8% |
| AIME 2026 | 97,7 | 93,8 | 96,0% |
| IFBench | 79,6 | 78,0 | 98,0% |
| AA-Omniscience (índice) | 10,8 | −4,7 | no disponible |

| Métrica de fidelidad | Valor |
|---|---|
| Coincidencia en el siguiente token (5.491 tokens reservados) | 87,7% |
| KL medio frente al BF16 | 0,144 |
| NLL (original → conversión) | 1,244 → 1,340 |

| Rendimiento en DGX Spark (GB10, ds4-dfm-rs) | Valor |
|---|---|
| Prefill (2K–64K) | 1.241,2 tok/s |
| Decode (2K–64K) | 25,23 tok/s (26,6 a 2K, 23,7 a 64K) |
| Decode greedy con DFlash2 | 32,0 tok/s (frente a 26,2 sin drafter) |

## Requisitos de hardware
- VRAM/memoria estimada: unos 99,9 GB en total (98,3 GB residentes más 1,56 GB de tabla de tokens leída desde SSD); el plan de contexto completo de 1M ocupa 115,4 de 117,2 GiB en un solo banco de memoria.
- GPU recomendadas: DGX Spark (GB10) con 128 GB de memoria unificada, que es el objetivo declarado del autor. No se documentan otras GPU en la información disponible.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; el tamaño residente de 98,3 GB excede la VRAM de cualquier GPU de consumo actual (RTX 4090, 24 GB).
- Opciones de despliegue: runtime ds4-dfm-rs (rama `main` desde `d70afd6a`) con kernels CUDA para expertos GVQ, GQA con ventana deslizante y KV FP8 en capas completas, salida Harmony con tool calls tipados y decodificación especulativa DFlash2. No se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: 1.241,2 tok/s de prefill y 25,23 tok/s de decode en el rango 2K–64K; 32,0 tok/s en greedy con DFlash2. No se han realizado ejecuciones superiores a 64K.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Beam-1.0-501B-A23B-VQ-GGUF (esta ficha) | 501B / 23B | 1.048.576 | Apache 2.0 | GGUF (VQ + Q4_K) | Optimizado para DGX Spark; runtime propio |
| Beam-1.0-501B-A23B (original Reflection) | 501B / 23B | 1.048.576 | Apache 2.0 | BF16, FP8, NVFP4 | Checkpoint de referencia; ~1 TB en BF16 |
| unsloth/Beam-1.0-501B-A23B-GGUF | 501B / 23B | no disponible en la información | Apache 2.0 | GGUF | Conversión alternativa del mismo modelo base |

No se dispone de datos de benchmarks de las alternativas en la información proporcionada, por lo que la comparación de rendimiento se limita a la tabla de benchmarks frente al original.

## Limitaciones y advertencias
- Pérdida notable en recuperación factual: el índice AA-Omniscience cae de 10,8 a −4,7, lo que indica mayor riesgo de alucinación en preguntas de conocimiento factual.
- Fidelidad imperfecta: solo el 87,7% de coincidencia en el siguiente token frente al BF16 y KL medio de 0,144; el autor advierte que los archivos pueden cambiar y recomienda fijar una revisión concreta.
- Idiomas: solo se declara inglés; no hay soporte multilingüe documentado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el runtime deben verificarse por separado; el runtime ds4-dfm-rs es un proyecto del mismo autor.
- Requiere hardware específico (DGX Spark GB10) y un runtime no estándar; no hay evidencia de compatibilidad con llama.cpp, Ollama, vLLM o TGI.
- El contexto completo de 1M no se ha ejecutado más allá de 64K; el plan de memoria ocupa 115,4 de 117,2 GiB, dejando un margen muy ajustado.
- Los números de velocidad se midieron con la primera build; la reconstrucción posterior no ha sido re-medida en GB10.
- El modelo está pensado para texto; no se documentan capacidades de visión ni audio.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Baekpica/Beam-1.0-501B-A23B-VQ-GGUF
- Modelo base: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Drafter DFlash2: https://huggingface.co/reflection/Beam-1.0-501B-A23B-DFlash2
- Runtime ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- Conversión alternativa de unsloth: https://huggingface.co/unsloth/Beam-1.0-501B-A23B-GGUF
- Tabla de discusión del repositorio: https://huggingface.co/Baekpica/Beam-1.0-501B-A23B-VQ-GGUF/discussions

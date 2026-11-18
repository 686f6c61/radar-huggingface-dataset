# Baekpica/Beam-1.0-501B-A23B-VQ-GGUF

## Resumen

Beam-1.0-501B-A23B-VQ-GGUF es una cuantización vectorial (VQ) del modelo Reflection Beam-1.0-501B-A23B, un transformer de mezcla de expertos (MoE) desarrollado por Reflection. El modelo original, en BF16, ocupa aproximadamente 1 TB y está diseñado para contexto de 1.048.576 tokens. Esta conversión reduce el checkpoint a unos 99,9 GB de partes GGUF, pensadas para ejecutarse en una única DGX Spark con 128 GB de memoria unificada.

La innovación principal es el uso de cuantización vectorial de 8 dimensiones sobre los expertos enrutados (12 bits, y 13 bits en las ocho capas MoE inferiores), con libros de códigos, asignaciones y ganancias por fila ajustados a las estadísticas de activación de un corpus de calibración. Todo lo que el modelo lee en cada token (atención, router, normas, capas densas) se mantiene en Q4_K o en precisión de origen. El resultado es un modelo de 501B con contexto de 1M que cabe en hardware de una sola máquina.

El autor incluye además el drafter DFlash2 de Reflection (1,93B parámetros) convertido a Q8_0 para decodificación especulativa, y publica un runtime propio (ds4-dfm-rs) con kernels CUDA para los expertos GVQ, GQA con sliding-window y KV FP8, y salida Harmony con tool calls tipadas. La ficha refleja los datos publicados por el autor, incluidas las advertencias sobre revisiones cambiantes de los ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 49 capas MoE, 9 capas de atención completa NoPE y 43 capas de sliding-window de 512 tokens |
| Parametros totales | 501B (según nombre del modelo; el dato de safetensors del repo cuantizado indica 7.239.549.632, correspondiente a la parte densa/visible, no al total) |
| Parametros activos | 23B (según nombre del modelo) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | VQ 8-dimensional 12-bit (capas 11–51, K=4096) y 13-bit (capas 3–10, K=8192); Q4_K para atención, FFN densa y cabeza de salida; BF16 para tabla de embeddings y pesos sensibles |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (partes), con tabla de embeddings BF16 separada leída desde SSD; drafter en Q8_0 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 49 capas de mezcla de expertos (256 expertos por capa, con matrices gate/up/down), 9 capas de atención completa sin RoPE (NoPE) y 43 capas con atención de ventana deslizante de 512 tokens, lo que permite alcanzar 1.048.576 tokens de contexto sin escalado de RoPE. La cuantización aplica VQ de 8 dimensiones a los expertos enrutados: un libro de códigos E4M3 por capa, compartido por todos los expertos y las tres matrices, con una ganancia F16 por fila. Las capas 3–10 usan 13 bits (K=8192, flujo de 12 bits más un plano de 1 bit) y las capas 11–51 usan 12 bits (K=4096), lo que equivale a 1,625 y 1,5 bits de índice por peso respectivamente.

El proceso de calibración emplea Lloyd ponderado por importancia (columnas por experto y ganancias por fila por mínimos cuadrados ponderados), ajustado sobre estadísticas de activación de un corpus ejecutado a través del original BF16. La revisión del 2026-10-21 reconvirtió las 49 partes de expertos enrutados con este método, reduciendo a la mitad la KL respecto al original. Los pesos de router, sesgos de corrección, normas y capas densas se mantienen en Q4_K o en precisión de origen. El autor no detalla en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset del modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de reflexión (canales `analysis` / `final` en la plantilla Modified Harmony).
- Razonamiento matemático y científico (evaluado en AIME 2026, GPQA Diamond, SciCode).
- Generación de código (LiveCodeBench) e instrucciones complejas (IFBench).
- Tool calling y function calling con llamadas XML tipadas bajo la plantilla Harmony.
- Soporte de agentes y razonamiento multi-paso con `reasoning_effort` configurable de 8 a 512.
- Contexto largo de hasta 1.048.576 tokens (evaluado en AA-LCR).
- Decodificación especulativa mediante el drafter DFlash2 incluido (1,93B parámetros, Q8_0).
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Análisis de repositorios completos: con 1.048.576 tokens de contexto, el modelo puede ingerir un proyecto entero y razonar sobre dependencias, cambios y pruebas en una sola pasada, sin trocear el código.
- Agentes de código autónomos: la plantilla Harmony con tool calls tipadas y `reasoning_effort` ajustable permite construir bucles de agente que invocan herramientas, verifican resultados y corrigen errores en varios pasos.
- Asistencia científica y matemática: los resultados en GPQA Diamond (88,6) y AIME 2026 (93,8) lo hacen adecuado para resolución de problemas técnicos con razonamiento explícito en el canal `analysis`.
- Despliegue en una sola DGX Spark: el tamaño de 99,9 GB y el runtime ds4-dfm-rs permiten servir el modelo en una GB10 con 128 GB, útil para laboratorios con hardware limitado que necesitan un modelo de 501B.
- Generación de código en pipelines de CI/CD: la decodificación especulativa con DFlash2 (de 26,2 a 32,0 tok/s en chat greedy) y el tool calling permiten integrar el modelo en revisiones automáticas y generación de parches.
- Evaluación de instrucciones largas y documentos extensos: AA-LCR de 77,0 sobre el original de 78,2 indica que conserva capacidad de razonamiento sobre contextos largos, útil para resumen y extracción sobre contratos o informes.
- Investigación en cuantización: la receta publicada (`beam1-vq8-mix8r13-41r12-q4k-embssd-v1`) y los datos de fidelidad (87,7% mismo siguiente token, KL 0,144) sirven como referencia para estudiar VQ aplicada a MoE a gran escala.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando la versión cuantizada con el original BF16 en GB10 con ds4-dfm-rs:

| Benchmark | Cuantizado | Original BF16 | Retención |
|---|---|---|---|
| GPQA Diamond | 88,6 | 90,6 | 97,8% |
| AIME 2026 | 93,8 | 97,7 | 96,0% |
| IFBench | 78,0 | 79,6 | 98,0% |
| AA-LCR | 77,0 | 78,2 | 98,5% |
| LiveCodeBench | 84,0 | 88,3 | 95,1% |
| SciCode | 43,3 | 49,2 | 88,0% |
| AA-Omniscience (índice) | −4,7 | 10,8 | no disponible |

Fidelidad de la conversión (forward de referencia, bytes de la release frente a BF16): 87,7% de mismo siguiente token, KL 0,144, NLL de 1,244 a 1,340 sobre 5.491 tokens reservados. La primera build obtenía 82,9% y KL 0,295.

Rendimiento medido en DGX Spark (GB10) entre 2K y 64K de contexto: 1.241,2 tok/s de prefill y 25,23 tok/s de decode (26,6 a 2K, 23,7 a 64K); antes de la optimización era 830,4 y 15,86. DFlash2 eleva el chat greedy de 26,2 a 32,0 tok/s. El contexto completo de 1M planifica en un banco (115,4 de 117,2 GiB), aunque no se han realizado ejecuciones de más de 64K.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 99,9 GB de partes GGUF (98,3 GB residentes más 1,56 GB de tabla de embeddings BF16 leída desde SSD). El contexto completo de 1M requiere FP8 KV en las capas de atención completa y planifica en 115,4 de 117,2 GiB.
- GPU recomendada: DGX Spark (GB10) con 128 GB de memoria unificada, el objetivo declarado del autor.
- No cabe en GPU de consumo convencionales (RTX 4090, 24 GB) ni en configuraciones multi-GPU estándar sin particionado adicional; la información disponible no documenta alternativas.
- Despliegue: runtime ds4-dfm-rs (kernels CUDA para expertos GVQ, GQA con sliding-window y KV FP8, Harmony con tool calls, decodificación especulativa DFlash2). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1.241,2 tok/s de prefill y 25,23 tok/s de decode medidos en GB10 entre 2K y 64K; 32,0 tok/s en chat greedy con DFlash2.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. El autor solo compara la versión cuantizada con el original BF16 del mismo modelo (Reflection Beam-1.0-501B-A23B), sin referencias a alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Beam-1.0-501B-A23B-VQ-GGUF | 501B (23B activos) | 1.048.576 | apache-2.0 | GGUF en HF, runtime ds4-dfm-rs |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los ficheros pueden cambiar: el autor advierte que la línea de conversiones está en investigación y que cualquier fichero puede reemplazarse por una nueva revisión. Para fijar una build hay que descargar un commit concreto.
- Pérdida de fidelidad: 87,7% de mismo siguiente token y KL 0,144 frente al BF16; el rendimiento en SciCode cae al 88,0% y el índice AA-Omniscience pasa de 10,8 a −4,7, lo que indica mayor degradación en código científico y recuerdo factual.
- Contexto: aunque el modelo soporta 1M tokens, el autor no ha realizado ejecuciones de más de 64K; el comportamiento más allá de ese límite no está verificado empíricamente.
- Idiomas: solo inglés según la model card; no se documenta soporte multilingüe.
- Hardware: requiere una DGX Spark (GB10) o equivalente con 128 GB de memoria unificada; no cabe en GPU de consumo.
- Runtime: depende de ds4-dfm-rs, un runtime propio del autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Licencia apache-2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse en su propia model card.
- Riesgo de alucinación inherente a modelos de lenguaje; el autor no publica evaluaciones específicas de sesgo.
- Las cifras de velocidad en GB10 se midieron con la primera build y no se han vuelto a medir tras la reconversión, aunque el formato y los bits se mantienen.

## Enlaces

- Hugging Face: https://huggingface.co/Baekpica/Beam-1.0-501B-A23B-VQ-GGUF
- Modelo base: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Drafter DFlash2: https://huggingface.co/reflection/Beam-1.0-501B-A23B-DFlash2
- Runtime ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- Receta de cuantización: RECIPE.md y recipe.json en el repositorio de HF
- Discusiones: https://huggingface.co/Baekpica/Beam-1.0-501B-A23B-VQ-GGUF/discussions

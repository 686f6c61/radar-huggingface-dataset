# reaperdoesntknow/MoA-400M

## Resumen

MoA-400M (denominado en la model card como MoA-Metric-LM-400M) es un modelo de lenguaje causal de aproximadamente 400 millones de parámetros desarrollado por el usuario independiente reaperdoesntknow. Su propuesta central es sustituir la atención por producto escalar estándar por una atención "métrica" que puntúa las relaciones entre query y key mediante distancias L2, coseno o Mahalanobis diagonal, junto con una variante de RoPE denominada BlackHoleRoPE. El modelo se presenta como un experimento de investigación orientado a hardware modesto, con especial énfasis en ejecución sobre CPU en FP32.

La arquitectura combina bloques MoA (Mixture-of-Architectures) que enrutan cada token, mediante un router suave, entre cuatro cabezas: una convolución local, atención multi-cabeza métrica, un MLP de mezcla de canales y una atención multi-query métrica con K/V compartidas. El contexto de entrenamiento se sitúa principalmente entre 512 y 1024 tokens, aunque la configuración permite hasta 2048. El modelo está integrado en el ecosistema Transformers y se distribuye con pesos compatibles con `AutoModelForCausalLM`.

Su relevancia es fundamentalmente investigadora: explora sesgos inductivos geométricos (atención basada en distancias, regularizador de desigualdad triangular) y eficiencia en CPU, más que competir en rendimiento con modelos de escala similar entrenados con presupuestos masivos de tokens. Los datos publicados sobre entrenamiento son escasos y el número de descargas (2056) sugiere un interés moderado dentro de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con bloques MoA (Mixture-of-Architectures): LocalConv, MetricMHAttention, ChannelMix y MetricMQA; atención métrica (L2 / coseno / Mahalanobis diagonal) y BlackHoleRoPE |
| Parametros totales | ~400 M (el recuento exacto depende del vocabulario; ver config.json) |
| Parametros activos | No aplica (no es MoE; el router mezcla arquitecturas, no expertos dispersos) |
| Longitud de contexto | Entrenado principalmente a 512-1024 tokens; la configuración permite hasta 2048 |
| Tipos de cuantizacion | No se documentan cuantizaciones publicadas; inferencia soportada en FP32, BF16 y FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 según la model card (el campo de licencia del repo en Hugging Face figura como no disponible) |
| Formato de pesos | Pesos Transformers (safetensors/PyTorch); repo de 3,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 12 a 24 capas (según variante), con tamaño oculto de al menos 1024 en la variante de 400 M. Cada bloque MoA incorpora un router por token que mezcla suavemente cuatro rutas: LocalConv (convolución depthwise local), MetricMHAttention (atención multi-cabeza con puntuaciones basadas en distancia), ChannelMix (MLP) y MetricMQA (atención multi-query con K/V compartidas). Las puntuaciones de atención métrica se calculan como L2 negativo escalado, coseno normalizado o Mahalanobis diagonal por cabeza, con un escalado logarítmico aprendible y una posible máscara de poda por radio.

BlackHoleRoPE aplica rotación unitaria solo a Q/K (preservando normas) y una amplificación de energía acotada a V, con parámetros sintetizados desde una base de Fourier pequeña, lo que reduce el tamaño de caché y busca generalización en longitud. El FFN es un HyperFFN que combina SwiGLU, SepConv1d y una ruta de bajo rango. Se incluye un regularizador de desigualdad triangular sobre tripletas aleatorias para evitar geometrías métricas degeneradas.

El entrenamiento se realizó en CPU en FP32, con AdamW/Adam, batch de 2-4 y secuencias de 512-1024 tokens. Los datasets citados son Agentic-Long-Context-Understanding-QA y MATH-500, con presupuestos de "cientos de miles de tokens" (la model card menciona ~256000 tokens por dataset). No se documentan fases de RLHF, DPO ni datos multilingües.

## Capacidades

- Generación de texto causal y conversación multi-turno básica.
- Razonamiento matemático de estilo paso a paso, entrenado sobre MATH-500.
- Lectura y QA sobre contexto largo moderado (hasta 1024-2048 tokens).
- Seguimiento de contexto y recuperación de información en documentos largos (dataset Agentic-Long-Context-Understanding-QA).
- Inferencia en CPU en FP32 sobre máquinas con AVX2/AVX-512.
- Compatibilidad con el pipeline `text-generation` de Transformers y con `AutoModelForCausalLM`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente compacto en local: el modelo puede ejecutarse en CPU sin GPU dedicada, lo que permite desplegar un asistente de texto en portátiles o servidores de bajo coste para tareas de generación breve.
- Investigación sobre atención métrica: sirve como banco de pruebas reproducible para estudiar atención basada en distancias (L2, coseno, Mahalanobis) frente a producto escalar, con pesos públicos y código compatible con Transformers.
- Experimentos de generalización en longitud: BlackHoleRoPE está diseñado para extrapolar; el modelo permite evaluar calidad y throughput más allá de 1024 tokens en entornos controlados.
- Razonamiento matemático elemental: con prompts de estilo "Reasoning:", puede generar cadenas de pasos para problemas aritméticos y algebraicos sencillos, útil en demos educativas.
- QA sobre documentos largos moderados: con ventanas de 1024-2048 tokens puede responder preguntas sobre informes o artículos que quepan en ese contexto.
- Prototipado de arquitecturas híbridas: el bloque MoA con router por token y el regularizador de desigualdad triangular son componentes reutilizables para investigar mezclas de arquitecturas en modelos pequeños.
- Evaluación de eficiencia en CPU: útil para medir latencia y memoria en FP32/BF16/FP16 en hardware sin acelerador, comparando con transformers densos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que los registros de entrenamiento mostraron un descenso saludable de la pérdida en longitudes de 512 y 1024 tokens en ejecuciones sobre CPU, sin cifras concretas de MMLU, HumanEval, GSM8K ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada: no aplica para CPU; en GPU, ~1,6 GB en FP16/BF16 y ~3,2 GB en FP32 para los ~400 M de parámetros, más overhead de activaciones y caché KV.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090, A100, H100); el modelo está pensado principalmente para CPU.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más en FP16; en FP32 conviene disponer de 8 GB o más.
- Despliegue: Transformers (`AutoModelForCausalLM`, `pipeline`), con `accelerate` y `sentencepiece`. No se documenta soporte verificado de vLLM, llama.cpp, Ollama o TGI, y la atención métrica personalizada probablemente requiera código propio, por lo que estos motores no son compatibles de forma directa.
- Latencia y throughput: no disponibles. La model card solo indica que el entrenamiento e inferencia en FP32 funcionan bien en AVX2/AVX-512.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MoA-400M | ~400 M | 512-1024 (hasta 2048 en config) | Apache-2.0 (según model card) | Hugging Face, Transformers | Atención métrica y BlackHoleRoPE; orientado a CPU |
| SmolLM2-360M | 360 M | 8192 | Apache-2.0 | Hugging Face, Transformers, GGUF | Transformer denso convencional, ampliamente adoptado |
| Qwen2.5-0.5B | 500 M | 32768 | Apache-2.0 | Hugging Face, Transformers, GGUF | Transformer denso con contexto largo y multilingüe |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache-2.0 | Hugging Face, Transformers, GGUF | Mayor tamaño y contexto moderado; ecosistema maduro |

No se dispone de datos de benchmarks para MoA-400M que permitan una comparación cuantitativa de rendimiento con estas alternativas.

## Limitaciones y advertencias

- El entrenamiento usó presupuestos muy reducidos (cientos de miles de tokens), por lo que la calidad factual y la fluidez serán limitadas en comparación con modelos entrenados con billones de tokens.
- Riesgo elevado de alucinación en QA factual y en dominios especializados; la model card excluye explícitamente el uso en QA factual a escala web.
- Contexto efectivo limitado a 512-1024 tokens en entrenamiento; más allá de 2048 la calidad no está garantizada aunque BlackHoleRoPE sea extrapolable.
- Idiomas soportados no documentados; no hay evidencia de capacidades multilingües.
- La licencia figura como Apache-2.0 en la model card, pero el campo de licencia del repositorio en Hugging Face aparece como no disponible; conviene verificar antes de uso comercial.
- No apto para sistemas de seguridad crítica ni para dominios que requieran precisión garantizada.
- La atención métrica personalizada puede no ser compatible con motores de inferencia optimizados (vLLM, llama.cpp, TGI) sin adaptaciones.
- La model card advierte de posibles NaN/Inf durante el muestreo si las máscaras no son aditivas 0/-inf o si no se define `pad_token_id` en `generate()`.
- No se documentan evaluaciones de sesgo ni de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/MoA-400M
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset LongForm: https://huggingface.co/datasets/akoksal/LongForm
- Dataset Agentic-Long-Context-Understanding-QA: https://huggingface.co/datasets/yzhuang/Agentic-Long-Context-Understanding-QA
- Documentación de Transformers: https://huggingface.co/docs/transformers

# BananaMind/BananaMind-2-Micro

## Resumen

BananaMind 2 Micro es un modelo de lenguaje causal de tamaño extremadamente reducido, desarrollado por el equipo BananaMind. Con solo 2.933.193 parámetros (aunque el archivo safetensors contiene 3.195.328), está diseñado como un modelo base de completado de texto, no como un asistente conversacional. Su objetivo principal es explorar la eficiencia de parámetros en modelos pequeños, logrando un rendimiento competitivo frente a modelos de 5M y 8M parámetros en benchmarks de razonamiento y conocimiento.

El modelo se entrenó desde cero con 74.998 millones de tokens (~75B) utilizando un currículo de datos que combina fuentes como FineWeb-Edu, DCLM, Cosmopedia, FinePhrase, FineMath y NPSet2. Arquitectónicamente emplea GQA, pre-RoPE QK normalization, SwiGLU, RMSNorm y un innovador "refresh kernel" basado en convoluciones causales depthwise. Su ventana de contexto es de 4.096 tokens y usa un tokenizador propio de 2.048 tokens.

La relevancia de este modelo radica en que demuestra que es posible obtener resultados notables con una fracción de los parámetros de modelos similares, abriendo la puerta a investigaciones sobre escalado eficiente y aplicaciones en entornos con recursos extremadamente limitados. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con GQA, pre-RoPE QK norm, SwiGLU, RMSNorm y refresh kernel (convolución causal depthwise) |
| Parametros totales | 2.933.193 (según model card) / 3.195.328 (según safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (solo pesos en bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

BananaMind 2 Micro es un transformer causal de 9 capas con hidden size de 128, intermediate size de 512, 4 cabezas de query y 2 de key/value (GQA), y head dimension de 32. La normalización se realiza con RMSNorm y la atención utiliza pre-RoPE QK normalization. La MLP emplea SwiGLU. El tokenizador es propio, con un vocabulario de 2.048 tokens y embeddings atados (tied).

La innovación principal es el "refresh kernel" (XSA refresh path): tras la atención, se lee la salida de forma desacoplada (detached), se combina con una proyección aprendida y una convolución estrictamente causal depthwise (kernel de tamaño 9), y se utiliza como puerta para una proyección del embedding original del token. Este mecanismo permite reinyectar información del token original en la representación, mejorando la estabilidad del entrenamiento y la eficiencia de parámetros. Durante la generación con caché, el historial de la convolución se transporta junto con la caché de key/value.

El entrenamiento se realizó con el optimizador Muon (implementación estándar de PyTorch) para matrices y AdamW para embeddings y parámetros unidimensionales. Se usó precisión bfloat16 con autocast. El hardware fue de 8 GPUs NVIDIA RTX PRO 6000 Blackwell Server Edition, con un tiempo total de 11.973 segundos (~3h 20m). Se aplicó un currículo de datos con proporciones cambiantes de los seis datasets a lo largo de las fases de entrenamiento, aumentando progresivamente la proporción de FineMath y FinePhrase hacia el final.

## Capacidades

- Generación de texto en inglés: completado de texto, finalización de frases y párrafos.
- Razonamiento lógico básico: obtiene un Elo de 911 en la categoría de razonamiento lógico de BananaMind Base Bench.
- Comprensión de conocimiento del mundo: Elo de 899 en world knowledge.
- Completado de código: Elo de 927 en code completion, siendo su categoría más fuerte.
- Capacidades aritméticas limitadas: 34% de precisión en ArithMark 3.0 (acc_norm).
- No soporta tool calling, ni funciones de agente, ni multimodales.
- No está entrenado para seguir instrucciones (es un modelo base, no chat).

## Casos de uso

- Investigación en eficiencia de parámetros: sirve como punto de referencia para estudiar cómo arquitecturas compactas pueden lograr resultados comparables a modelos más grandes. Se puede usar para experimentos de escalado, análisis de curvas de pérdida y comparación de técnicas de regularización.
- Prototipado rápido de pipelines de NLP: al ser tan pequeño, permite iterar rápidamente en pipelines de generación de texto sin necesidad de GPUs potentes. Ideal para probar infraestructuras de inferencia (vLLM, Hugging Face) antes de escalar a modelos mayores.
- Educación y demostraciones: adecuado para enseñar conceptos de transformers, atención, tokenización y generación autoregresiva en cursos de machine learning, ya que puede ejecutarse en CPU y su código es fácil de inspeccionar.
- Generación de texto en entornos embebidos: con solo ~3M de parámetros, puede desplegarse en dispositivos con poca memoria (Raspberry Pi, microcontroladores) para tareas de autocompletado o sugerencias de texto básicas.
- Evaluación de métricas de eficiencia: útil para validar nuevas métricas de evaluación de modelos pequeños, como la eficiencia de parámetros definida en la model card (puntos porcentuales sobre el azar por cada 100K parámetros).
- Base para fine-tuning especializado: al ser un modelo base, puede ajustarse con datasets pequeños para tareas específicas como clasificación de texto, análisis de sentimiento o generación de variaciones de frases, aprovechando su bajo coste de entrenamiento.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados del checkpoint final:

| Benchmark | Métrica | Score |
|---|---|---|
| BananaMind Base Bench 1.1 | Elo global | 874 |
| BananaMind Base Bench 1.1 | Precisión bruta | 34,57% (121/350) |
| BananaMind Base Bench 1.1 | Precisión ponderada | 32,39% |
| ArithMark 2.0 | Precisión | 24,92% (623/2.500) |
| ArithMark 3.0 | acc_norm | 34,00% (340/1.000) |
| ArithMark 3.0 | Precisión bruta | 33,70% (337/1.000) |

Desglose por categoría en Base Bench (Elo):

| Categoría | Elo |
|---|---|
| Language completion | 898 |
| Commonsense | 860 |
| World knowledge | 899 |
| Context tracking | 815 |
| Quantitative | 837 |
| Logical reasoning | 911 |
| Code completion | 927 |

Comparación con modelos pequeños (valores acc_norm para ARC, PIQA, HellaSwag y ArithMark 3; ArithMark 2 usa precisión bruta):

| Modelo | Parámetros | ARC Easy | ARC Challenge | PIQA | HellaSwag | ArithMark 2 | ArithMark 3 | Base Bench Elo | Base Bench accuracy |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **BananaMind 2 Micro** | 2.933.193 | 33,12% | 21,93% | 53,21% | 28,27% | 24,92% | **34,00%** | 874 | 34,57% |
| GPT-S2-5M | 5.384.258 | **33,42%** | **22,18%** | 56,42% | 27,64% | **27,20%** | 28,30% | 883 | 35,71% |
| GPT-S-5M | 5.158.464 | 32,83% | 21,42% | **57,07%** | 27,42% | 27,04% | 29,20% | **889** | **37,14%** |
| CMA-1M-Mini | 958.692 | 29,25% | 21,93% | 54,84% | **29,36%** | — | — | 812 | 27,43% |

La model card también incluye una tabla de eficiencia de parámetros (puntos porcentuales sobre el azar por 100K parámetros) donde BananaMind 2 Micro obtiene 0,326, superando a todos los modelos comparados, incluyendo Syn-2.6M (0,291) y GPT-S-5M (0,235).

## Requisitos de hardware

- VRAM estimada: menos de 20 MB en bfloat16 (3,2M parámetros × 2 bytes ≈ 6,4 MB). Cabe en cualquier GPU, incluso integradas.
- GPU recomendadas: cualquiera, desde una GTX 1050 hasta una RTX 4090. No requiere GPU dedicada; puede ejecutarse en CPU.
- Compatibilidad con consumer GPU: sí, total. También puede ejecutarse en Raspberry Pi 4/5 con suficiente RAM.
- Opciones de despliegue: Hugging Face transformers (con trust_remote_code), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), o directamente con PyTorch.
- Latencia y throughput: al ser tan pequeño, la generación es casi instantánea en GPU y de pocos milisegundos por token en CPU. No hay datos oficiales de throughput, pero se estima que puede generar cientos de tokens por segundo en una GPU moderna.

## Comparativa con modelos similares

La tabla anterior ya compara con GPT-S2-5M, GPT-S-5M y CMA-1M-Mini. Resumen cualitativo:

- **GPT-S2-5M** (5,38M parámetros): mayor tamaño, mejor en ARC y ArithMark 2, pero peor en ArithMark 3 y eficiencia de parámetros. Licencia no especificada en la model card.
- **GPT-S-5M** (5,16M parámetros): mejor en PIQA y Base Bench Elo, pero inferior en eficiencia de parámetros. Licencia no especificada.
- **CMA-1M-Mini** (0,96M parámetros): más pequeño, mejor en HellaSwag, pero significativamente peor en el resto de métricas. Licencia no especificada.

BananaMind 2 Micro destaca por su mejor eficiencia de parámetros (0,326 puntos/100K) y por superar a modelos de 5M en ArithMark 3. Su licencia Apache 2.0 es más permisiva que las de sus competidores, que no declaran licencia.

## Limitaciones y advertencias

- Tamaño extremadamente reducido: las capacidades de razonamiento y conocimiento son muy limitadas en comparación con modelos de cientos de millones o miles de millones de parámetros. No es adecuado para tareas complejas de producción.
- Solo inglés: no soporta otros idiomas, lo que restringe su uso a aplicaciones monolingües.
- Modelo base sin fine-tuning: no está entrenado para seguir instrucciones ni para diálogo. Genera completados de texto, no respuestas a preguntas directas.
- Riesgo de alucinación: como cualquier LM, puede producir contenido falso o incoherente, especialmente en temas de conocimiento factual.
- Sesgos: entrenado con datos web filtrados (FineWeb-Edu, DCLM), puede heredar sesgos presentes en esos corpus, aunque su tamaño pequeño limita la magnitud.
- Dependencia de código personalizado: el refresh kernel requiere `trust_remote_code=True` en Hugging Face, lo que puede ser un problema de seguridad si no se audita el código.
- Sin cuantizaciones oficiales: no se proporcionan versiones GGUF o int8, aunque es posible convertir los pesos manualmente.
- Contexto de 4.096 tokens: suficiente para tareas cortas, pero insuficiente para documentos largos o conversaciones extensas.
- Soporte limitado de la comunidad: al ser un modelo muy reciente y de nicho, hay poca documentación externa y pocos ejemplos de uso.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/BananaMind/BananaMind-2-Micro)
- [Espacio de BananaMind en Hugging Face](https://huggingface.co/spaces/BananaMind/Website)
- Datasets usados: [FineWeb-Edu](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu), [DCLM](https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0), [Cosmopedia](https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus), [FinePhrase](https://huggingface.co/datasets/HuggingFaceFW/finephrase), [FineMath](https://huggingface.co/datasets/HuggingFaceTB/finemath), [NPSet2](https://huggingface.co/datasets/AxiomicLabs/NPset-2-Python-Edu)

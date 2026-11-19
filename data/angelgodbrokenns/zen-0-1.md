# angelgodbrokenns/zen-0.1

## Resumen

zen-0.1 es un modelo de lenguaje de tipo small language model (SLM) con 176,2 millones de parámetros, desarrollado desde cero por el usuario angelgodbrokenns y publicado en Hugging Face. Emplea una arquitectura Llama estándar con atención de consultas agrupadas (GQA), RoPE, SwiGLU, RMSNorm y embeddings atados, con 22 capas, dimensión oculta de 768 y 12 cabezas de atención (4 cabezas KV). El modelo se entrenó en dos GPU NVIDIA T4 en Kaggle durante aproximadamente 10 horas en precisión mixta fp16, procesando 194 millones de tokens en 1479 pasos.

El modelo se presenta como una prueba de concepto de entrenamiento from-scratch con recursos muy limitados, no como un modelo orientado a producción. Su ventana de contexto es de 1024 tokens en entrenamiento y utiliza el tokenizador de SmolLM2 (BPE de 49 000 tokens). Está etiquetado como conversacional y solo soporta inglés según su model card.

Su relevancia es fundamentalmente educativa y experimental: sirve como referencia de hasta dónde llega un modelo pequeño entrenado con un presupuesto de cómputo mínimo. Los resultados de benchmarks publicados por el propio autor son notablemente inferiores a los de modelos de tamaño similar, lo que refleja las limitaciones del entrenamiento con solo 194M de tokens y una mezcla de datos poco convencional. El modelo se distribuye en safetensors y GGUF (F16 y Q8_0), y su licencia figura como "unverified" (no determinada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only, GQA, RoPE, SwiGLU, RMSNorm, tied embeddings) |
| Parametros totales | 176.195.328 (176,2M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | F16, Q8_0 (GGUF publicados) |
| Idiomas soportados | inglés (en) |
| Licencia | other / unverified (no determinada por el autor) |
| Formato de pesos | safetensors, GGUF |
| Capas / dimension oculta / cabezas (KV) | 22 / 768 / 12 (4) |
| Tokenizador | SmolLM2 (BPE, 49k) |
| Tokens vistos en entrenamiento | 194M |
| Pasos de entrenamiento | 1479 |
| Precision de entrenamiento | fp16 mixed |
| Hardware de entrenamiento | 2× NVIDIA T4 (Kaggle), 10,0 h |

## Arquitectura y entrenamiento

zen-0.1 es un transformer decoder-only con la arquitectura Llama canónica: 22 capas, dimensión oculta de 768, 12 cabezas de atención con 4 cabezas KV (GQA), activación SwiGLU, normalización RMSNorm y embeddings atados entre entrada y salida. Usa RoPE para codificación posicional y el tokenizador BPE de SmolLM2 con un vocabulario de 49 000 tokens. No incorpora innovaciones técnicas destacables como decodificación especulativa, atención lineal o arquitecturas híbridas SSM; es una implementación estándar entrenada desde cero.

El entrenamiento se realizó en 2× NVIDIA T4 en Kaggle durante 10 horas en fp16 mixed, con 1479 pasos y 194 millones de tokens vistos. La mezcla de datos es: `HuggingFaceFW/fineweb-edu` (40%), `jonathanasdf/MathGLM-dataset-500k` (15%), `Crownelius/Complete-FABLE.5-traces-2M` (15%), `Claux67/FABLE-5.2-MAX-DATABASE` (10%) y `VINAY-UMRETHE/Sonnet-Opus-4.5-4.6-Gemini-3.0-3.1-Pro-GPT-5-5.1-5.2-GLM-4.7-MiniMax-M2.1-DeepSeek-V3.2-High` (20%). No se documenta uso de RLHF, DPO ni ajuste por instrucciones; las muestras publicadas (formato de chat con `<|im_start|>`) sugieren que se intentó un formato conversacional, pero los resultados no son coherentes.

## Capacidades

- Generación de texto autoregresiva básica en inglés, con calidad muy limitada.
- Formato de chat con marcadores tipo ChatML (`<|im_start|>user ... <|im_end|>`), aunque el modelo no responde de forma fiable a instrucciones.
- Razonamiento aritmético muy deficiente: en las muestras publicadas, ante "1+8/1*10+2=" devuelve un número decimal largo sin sentido y ante "12*7" responde "3".
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (visión, audio) ni modo de pensamiento (thinking mode).
- Multilingüismo: solo inglés declarado; no se garantiza comportamiento en otros idiomas.
- Capacidad conversacional nominal por el formato de chat, pero sin garantías de coherencia multi-turno.

## Casos de uso

- Docencia y experimentación sobre entrenamiento from-scratch: sirve para ilustrar el pipeline completo (tokenización, mezcla de datos, entrenamiento en T4, exportación a GGUF) con un presupuesto de cómputo mínimo y reproducible en Kaggle.
- Pruebas de infraestructura de inferencia: útil para validar despliegues con `transformers`, `llama.cpp` u Ollama (por ejemplo, `llama-cli -hf angelgodbrokenns/zen-0.1:Q8_0`) antes de pasar a modelos mayores, dado su reducido tamaño (0,9 GB de repo).
- Benchmarking de harness: sirve como caso base negativo en `lm-evaluation-harness` para comparar metodologías de evaluación con modelos pequeños (SmolLM2-135M, KLM, LFM-2.5-230M).
- Investigación sobre mezclas de datos: permite estudiar el efecto de combinar `fineweb-edu` con datasets de trazas sintéticas y matemáticas en un modelo de 176M, aunque los resultados observados son pobres.
- Generación de texto de relleno o sintético para pruebas de pipelines de datos (no para contenido final), dado que el modelo produce texto repetitivo y a menudo incoherente.
- Ejemplo de despliegue en CPU: con Q8_0 GGUF y 176M de parámetros cabe en cualquier máquina moderna, útil para demos de `llama.cpp` en entornos sin GPU.

## Benchmarks y rendimiento

Resultados publicados por el autor (0-shot, `lm-evaluation-harness`, acc_norm donde está disponible; el resto de modelos según sus autores, con ajustes de evaluación posiblemente distintos):

| Modelo | Params | ARC-Easy | ARC-Challenge | HellaSwag | PIQA | LAMBADA | Avg |
|---|---|---|---|---|---|---|---|
| KLM 1.6 | 99,0M | 61,07% | 33,53% | 45,28% | 70,18% | 55,90% | 53,19% |
| GPT-X3-150M | 149M | 59,64% | 31,31% | 46,16% | 71,33% | 50,90% | 51,87% |
| KLM 1.5 | 99,0M | 59,68% | 32,68% | 43,74% | 68,55% | 48,20% | 50,57% |
| SmolLM2-135M | 135M | 58,63% | 29,69% | 43,22% | 68,44% | 39,20% | 47,84% |
| LFM-2.5-230M-Base | 230M | 59,72% | 34,98% | 39,29% | 63,38% | 36,60% | 46,79% |
| void.1 | 90,1M | 49,32% | 29,35% | 39,46% | 67,19% | 43,70% | 45,80% |
| **zen-0.1** | 176,2M | 33,75% | 21,16% | 26,39% | 55,06% | 6,60% | 28,59% |

zen-0.1 queda último en todas las métricas, con una media de 28,59% frente al 45,80% del siguiente peor modelo (void.1, 90,1M) y al 53,19% del mejor (KLM 1.6, 99,0M). El resultado en LAMBADA (6,60%) es especialmente bajo y sugiere una mala modelización del lenguaje a largo plazo, coherente con los 194M de tokens vistos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp16 (176M × 2 bytes) y alrededor de 0,18-0,2 GB en Q8_0; con overhead de runtime, menos de 1 GB en cualquier caso.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no requiere A100, H100 ni RTX 4090. Funciona en T4, GTX 1650, RTX 3060 o incluso iGPU.
- Cabe holgadamente en GPU de consumo y en CPU: el repo completo pesa 0,9 GB.
- Opciones de despliegue: `transformers` (AutoModelForCausalLM), `llama.cpp` (`llama-cli -hf angelgodbrokenns/zen-0.1:Q8_0`), Ollama (`ollama run hf.co/angelgodbrokenns/zen-0.1:Q8_0`) y text-generation-inference (etiqueta `text-generation-inference` en el repo). No se documenta soporte específico de vLLM.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, la inferencia en CPU con Q8_0 debería ser de decenas de tokens por segundo en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Avg (0-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zen-0.1 | 176,2M | 1024 | 28,59% | other / unverified | safetensors + GGUF en HF |
| SmolLM2-135M | 135M | no disponible en la información | 47,84% | no disponible en la información | HF |
| KLM 1.6 | 99,0M | no disponible en la información | 53,19% | no disponible en la información | HF |
| LFM-2.5-230M-Base | 230M | no disponible en la información | 46,79% | no disponible en la información | HF |

zen-0.1 tiene más parámetros que SmolLM2-135M y KLM 1.6, pero rinde entre 19 y 25 puntos porcentuales por debajo en la media de benchmarks. La comparación directa está limitada porque los datos de contexto y licencia de los modelos alternativos no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Alucinación severa: el autor lo reconoce explícitamente; las muestras publicadas muestran texto repetitivo e incoherente ("The city is the largest city in the world" en bucle).
- Errores aritméticos graves: responde "3" a "12*7" y produce decimales sin sentido ante una expresión aritmética simple.
- No apto para producción, según la propia model card.
- Contexto muy corto (1024 tokens), insuficiente para la mayoría de aplicaciones reales.
- Solo inglés; sin garantías en otros idiomas.
- Licencia no determinada ("unverified"): el autor advierte de que hay que revisar las licencias de todos los datasets de entrenamiento antes de elegir una. No se puede asumir uso comercial permitido.
- Entrenado con solo 194M de tokens, muy por debajo de lo habitual incluso para modelos de este tamaño; el infraentrenamiento explica en parte los malos resultados.
- Mezcla de datos con datasets de trazas sintéticas de modelos propietarios y de gran tamaño, lo que puede introducir problemas de licencia y de calidad.
- Sin datos publicados sobre sesgos específicos, pero al derivar de `fineweb-edu` es esperable que herede sesgos del corpus web filtrado.
- 0 descargas y 0 likes en el momento de la ficha: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/angelgodbrokenns/zen-0.1
- Dataset `HuggingFaceFW/fineweb-edu`: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset `jonathanasdf/MathGLM-dataset-500k`: https://huggingface.co/datasets/jonathanasdf/MathGLM-dataset-500k
- Dataset `Crownelius/Complete-FABLE.5-traces-2M`: https://huggingface.co/datasets/Crownelius/Complete-FABLE.5-traces-2M
- Dataset `Claux67/FABLE-5.2-MAX-DATABASE`: https://huggingface.co/datasets/Claux67/FABLE-5.2-MAX-DATABASE
- Dataset `VINAY-UMRETHE/Sonnet-Opus-4.5-4.6-Gemini-3.0-3.1-Pro-GPT-5-5.1-5.2-GLM-4.7-MiniMax-M2.1-DeepSeek-V3.2-High`: https://huggingface.co/datasets/VINAY-UMRETHE/Sonnet-Opus-4.5-4.6-Gemini-3.0-3.1-Pro-GPT-5-5.1-5.2-GLM-4.7-MiniMax-M2.1-DeepSeek-V3.2-High
- Tokenizador SmolLM2 (referencia): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- `lm-evaluation-harness`: https://github.com/EleutherAI/lm-evaluation-harness
- `llama.cpp`: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com

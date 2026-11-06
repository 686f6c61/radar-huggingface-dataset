# Franjarjar/Qwen3.6-35B-A3B-EQ3DHB

## Resumen

Qwen3.6-35B-A3B-EQ3DHB es una cuantización del modelo Qwen3.6-35B-A3B publicada por el usuario Franjarjar. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un modelo de lenguaje y visión de tipo Mixture-of-Experts disperso con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token. Esta versión concreta ha sido cuantizada al formato propietario EQ3DHB (LaneQuant) mediante la herramienta `espetero quantize` de Espetero 0.2.0, un motor de inferencia nativo para Metal en Apple silicon.

El objetivo de esta publicación no es otro que ofrecer una alternativa de pesos reducidos (19,4 GB en disco, 4,35 bits por peso) que pueda ejecutarse en Macs con 32 GB de memoria o más, manteniendo una calidad cercana a la del modelo original en BF16. El autor reporta una divergencia KL media de 0,0204 frente a la referencia BF16 y una tasa de acierto top-1 del 94,9 %, con velocidades de decodificación de 116 tok/s en un M4 Max y 79 tok/s en un M1 Max.

La relevancia de esta ficha radica en que ilustra el ecosistema emergente de cuantización específica para hardware Apple, con formatos y motores propios que no son compatibles con llama.cpp, MLX ni transformers. Es un caso de estudio de optimización extrema de memoria para modelos MoE con capacidades de visión y agente, aunque con limitaciones claras de portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) disperso, transformer con torre de visión (no incluida en esta cuantización) |
| Parametros totales | 7.958.913.152 en el archivo safetensors reportado; el modelo base declara 35B totales (ver nota) |
| Parametros activos | Aproximadamente 3B (según el modelo base Qwen3.6-35B-A3B) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | EQ3DHB (LaneQuant): códigos de 3 bits con codebook de 8 entradas, códigos de codebook de 4 bits, códigos de 8 bits, escala entera de 8 bits con signo por cada 16 entradas y escala fp16 por cada 256; expertos enrutados gate/up a 3 bits EQ, down a 4 bits, resto de matrices a 8 bits EQ, embeddings y LM head en MLX affine 8 bits, routers y normas en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con cuantización EQ3DHB (formato propietario de Espetero); no compatible con llama.cpp, MLX ni transformers |

Nota: el dato de parámetros totales del archivo safetensors (7.958.913.152) no coincide con los 35B declarados por el modelo base. Esta discrepancia probablemente se debe a que el recuento del archivo cuantizado omite componentes o utiliza una representación comprimida; se recomienda consultar la model card del modelo base para el dato canónico.

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de tipo Mixture-of-Experts con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. Incluye una torre de visión que lo convierte en un modelo visión-lenguaje, aunque esta cuantización concreta no incluye dicha torre, por lo que las capacidades multimodales del archivo publicado quedan limitadas al texto. El modelo base incorpora una cabeza MTP (Multi-Token Prediction) que sí se conserva en esta versión.

El proceso de cuantización se realizó con Espetero 0.2.0 (commit 616c21a) en 34 minutos sobre un M4 Max con BLAS mono-hilo y un pico de 6 GB de huella. La calibración se capturó a partir de las estadísticas del forward en BF16 sobre el archivo `calibration_v5.txt` de mlx-lm (112.640 tokens, ventanas de 2048). El preset `eq3dhb` aplica 3 bits EQ a las proyecciones gate/up de los expertos enrutados con un codebook de 8 entradas ajustado por stack (4 bits en las capas 0-3 y 36-39), 4 bits al codebook de las proyecciones down, 8 bits EQ al resto de matrices, MLX affine 8 bits a embeddings y LM head, y BF16 a routers y normas. La innovación principal es el formato EQ (LaneQuant), diseñado para que cada lane de los kernels matriciales de la GPU Apple necesite una escala por paso, lo que reduce el coste de decuantización en Metal.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Qwen3.6-35B-A3B.
- Capacidades de codificación agéntica, según la documentación del modelo base (agentic coding capabilities).
- Soporte de tool calling y function calling, presumiblemente heredado del modelo base; no se detalla en la información disponible.
- Razonamiento multi-paso y uso como agente, según las capacidades declaradas del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.
- Visión: el modelo base es visión-lenguaje, pero esta cuantización no incluye la torre de visión, por lo que no soporta entrada de imágenes.
- Cabeza MTP (Multi-Token Prediction) incluida, lo que puede habilitar decodificación especulativa en el motor Espetero.

## Casos de uso

- Inferencia local en Macs de gama alta: el modelo está diseñado para ejecutarse en Apple silicon con 32 GB o más mediante Espetero, lo que permite desplegar un MoE de 35B en un Mac Studio o MacBook Pro sin GPU dedicada. Es adecuado para desarrolladores que trabajan en entornos macOS y necesitan un modelo grande sin conexión a la nube.
- Asistente de código en local: gracias a las capacidades de codificación agéntica del modelo base y a su bajo número de parámetros activos (3B), puede integrarse en flujos de autocompletado y generación de código en el IDE, con latencias de 79-116 tok/s según el chip.
- Automatización de tareas con tool calling: el modelo puede conectarse a APIs y ejecutar funciones en pipelines de automatización, siempre que se use el servidor compatible con OpenAI, Anthropic u Ollama que expone Espetero.
- Prototipado de agentes multi-paso: la cabeza MTP y el soporte de razonamiento del modelo base permiten experimentar con decodificación especulativa y planificación de tareas en un entorno local controlado.
- Evaluación de técnicas de cuantización: este archivo sirve como referencia para investigadores que quieran comparar el formato EQ3DHB frente a IQ4_XS o Q4_K_M en términos de divergencia KL, top-1 y velocidad, con datos publicados en la model card.
- Despliegue de un servidor de inferencia ligero: el comando `espetero serve` levanta un endpoint HTTP en `127.0.0.1:8080` que puede ser consumido por clientes estándar, útil para demos internas o pruebas de integración sin infraestructura cloud.
- Investigación sobre formatos de cuantización para Metal: el código y la documentación del formato EQ están disponibles en el repositorio de Espetero, lo que permite estudiar y replicar el proceso de cuantización.

## Benchmarks y rendimiento

| Métrica | Este archivo (EQ3DHB) | llama.cpp IQ4_XS (imatrix) | IQ4_XS dequantized fp32 | AutoRound Q4_K_M (sphaela) |
|---|---|---|---|---|
| Bits por peso | 4,35 | 4,32 | 4,32 | 4,88 |
| KLD media | 0,0204 | 0,0279 | 0,0243 | 0,0235 |
| KLD mediana | 0,00553 | 0,00857 | 0,00748 | 0,00711 |
| KLD p99 | 0,2174 | 0,2789 | 0,2360 | 0,2343 |
| Top-1 | 94,9 % | 93,9 % | 94,3 % | 94,4 % |
| Decode M4 Max (tok/s) | 116 | 110 | — | — |
| Decode M1 Max (tok/s) | 79 | 68 | — | — |

Comparación pareada sobre las mismas ventanas de referencia: frente a IQ4_XS (ambos ejecutados por Espetero 616c21a), la KLD se reduce un 26,7 % (intervalo del 95 %: -29,3 % a -23,9 %; menor en el 100 % de las 62 ventanas). Frente a IQ4_XS decuantizado a la referencia fp32 (con ssm_out en BF16, lo que le favorece), la KLD se reduce un 15,9 % (intervalo del 95 %: -19,1 % a -12,6 %; menor en el 95 % de las ventanas). Las mediciones se realizaron sobre 123.008 tokens (62 ventanas de 2048, 31 de WikiText-2 test y 31 de código, sin puntuar los primeros 64 de cada ventana). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: se requiere un Mac con 32 GB de memoria o más. El archivo ocupa 19,4 GB en disco, por lo que la memoria necesaria para inferencia será superior a esa cifra, aunque no se especifica el pico exacto.
- GPU recomendadas: Apple silicon con Metal. El autor reporta velocidades en M4 Max (Mac Studio, 128 GB) y M1 Max (MacBook Pro, 64 GB). No se mencionan GPU NVIDIA o AMD.
- Cabe en GPU consumer: sí, en Macs con chip de la serie M y 32 GB o más. No es compatible con GPU consumer NVIDIA/AMD a través de este formato.
- Opciones de despliegue: exclusivamente Espetero 0.2.0 o superior (motor nativo Metal). No es compatible con vLLM, llama.cpp, Ollama, TGI, MLX ni transformers. Espetero expone un servidor compatible con clientes OpenAI, Anthropic y Ollama.
- Latencia y throughput: 116 tok/s en M4 Max y 79 tok/s en M1 Max en decodificación con una secuencia, contexto de 128 tokens, `bench_native --quick --batch 1`. No se dispone de datos de prefill ni de throughput con lotes mayores.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato / motor | Rendimiento relativo |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-EQ3DHB (este) | 35B / ~3B (base) | No disponible | Apache 2.0 | EQ3DHB / Espetero | KLD media 0,0204; 116 tok/s en M4 Max |
| Qwen3.6-35B-A3B (BF16 original) | 35B / ~3B | No disponible | Apache 2.0 | Safetensors BF16 / transformers, vLLM, etc. | Referencia de calidad; requiere mucho más espacio y memoria |
| Qwen3.6-35B-A3B IQ4_XS (llama.cpp) | 35B / ~3B | No disponible | Apache 2.0 | GGUF IQ4_XS / llama.cpp | KLD media 0,0279; 110 tok/s en M4 Max con Espetero |
| Qwen3.6-35B-A3B AutoRound Q4_K_M (sphaela) | 35B / ~3B | No disponible | Apache 2.0 | GGUF Q4_K_M / llama.cpp | KLD media 0,0235; sin datos de velocidad |

No se dispone de información sobre otros modelos de la misma categoría (MoE de ~35B con ~3B activos) en la búsqueda realizada, por lo que la comparativa se limita a variantes de cuantización del mismo modelo base.

## Limitaciones y advertencias

- Formato propietario: los pesos EQ3DHB solo se cargan con Espetero 0.2.0 o superior. No funcionan con llama.cpp, MLX, transformers, vLLM ni Ollama, lo que limita su portabilidad y su uso en infraestructura estándar.
- Plataforma exclusiva: requiere Apple silicon con Metal y al menos 32 GB de memoria. No es desplegable en GPU NVIDIA, AMD ni en CPU convencional.
- Sin torre de visión: aunque el modelo base es visión-lenguaje, esta cuantización omite la torre de visión, por lo que no puede procesar imágenes.
- Idiomas no especificados: la model card no detalla los idiomas soportados; se desconoce el comportamiento en castellano y otras lenguas distintas del inglés.
- Contexto no especificado: no se indica la longitud máxima de contexto en la información disponible, lo que impide planificar su uso en tareas de contexto largo.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad factual para esta cuantización.
- Sesgos: no se han documentado sesgos conocidos en la información proporcionada; se aplican los del modelo base, no evaluados aquí.
- Licencia Apache 2.0: permite uso comercial, pero el formato EQ y el motor Espetero (MIT) son proyectos independientes; conviene revisar las condiciones de Espetero para despliegues en producción.
- Métricas de calidad limitadas: los benchmarks publicados se centran en divergencia KL y top-1 frente a BF16, no en tareas downstream (MMLU, HumanEval, GSM8K), por lo que el rendimiento real en aplicaciones concretas no está cuantificado.
- Discrepancia en el recuento de parámetros: el archivo safetensors reporta 7.958.913.152 parámetros, frente a los 35B del modelo base; conviene verificar la integridad del archivo antes de usarlo en producción.

## Enlaces

- [Hugging Face: Franjarjar/Qwen3.6-35B-A3B-EQ3DHB](https://huggingface.co/Franjarjar/Qwen3.6-35B-A3B-EQ3DHB)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Repositorio de Espetero (GitHub)](https://github.com/JarJarFran/espetero)
- [Documentación del formato EQ](https://github.com/JarJarFran/espetero/blob/main/docs/eq.md)
- [Artículo sobre Qwen3.6-35B-A3B en MarkTechPost](https://www.marktechpost.com/2026/04/16/qwen-team-open-sources-qwen3-6-35b-a3b-a-sparse-moe-vision-language-model-with-3b-active-parameters-and-agentic-coding-capabilities/)

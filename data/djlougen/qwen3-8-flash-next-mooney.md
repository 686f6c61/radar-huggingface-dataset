# DJLougen/Qwen3.8-Flash-Next-Mooney

## Resumen

Qwen3.8-Flash-Next-Mooney es una cuantización extrema del checkpoint experimental Qwen3.8-Flash-Next, publicada por el usuario DJLougen. El modelo base es un MoE de 180B parámetros (125B en el transformer más una tabla de embeddings n-gram de 51,2B denominada PLE) con 48 capas, 512 expertos enrutados y top-10 routing, lo que deja unos 6B parámetros activos por token. La contribución de esta ficha es comprimir ese checkpoint para que quepa y funcione en un único DGX Spark, manteniendo según el autor el 95,5% de la puntuación del modelo BF16 de referencia.

La técnica empleada, bautizada como "receta Mooney", convierte los pesos de los expertos enrutados a ternario en una base rotada y los recupera mediante entrenamiento por destilación; la tabla PLE se guarda en 8 bits y se lee de forma perezosa desde SSD, y los pesos no-expertos van en Q8_0. El resultado son 92,0 GB de descarga, unos 2,39 bits por peso en el transformer y aproximadamente 39 GiB en memoria durante la inferencia.

Es relevante porque demuestra que un MoE de 180B puede servirse en hardware de consumo profesional de gama única (GB10) con decodificación especulativa MTP y entrada de imagen, algo que el checkpoint BF16 original no permite. La licencia es la Qwen Community 1.0, no una licencia permisiva estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con tabla de embeddings n-gram PLE y torre de visión separada |
| Parametros totales | 176.943.899.520 (≈180B) |
| Parametros activos | ≈6B por token (512 expertos enrutados, top-10) |
| Longitud de contexto | 32.768 tokens (configuración de referencia del autor); máximo del modelo base no disponible |
| Tipos de cuantizacion | Ternario PQ2_0 en expertos enrutados (2,125 bits/experto), Q8_0 en no-expertos, PLE en 8 bits, tensores pequeños en F32/BF16, mmproj de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en el repo) |
| Formato de pesos | GGUF (4 shards) + mmproj GGUF + cabeza MTP GGUF; requiere runtime con soporte PQ2_0 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 48 capas con 512 expertos enrutados y enrutamiento top-10, lo que activa aproximadamente 6B parámetros por token sobre un total de 125B en el transformer. A esto se suma una tabla PLE (n-gram embedding) de 51,2B parámetros que el modelo consulta durante la inferencia; en esta build se almacena en 8 bits y se lee bajo demanda desde SSD, manteniendo en memoria las filas de uso frecuente. La torre de visión se distribuye como un `mmproj` BF16 independiente.

La receta Mooney aplica cuantización ternaria a los pesos de los expertos enrutados en una base rotada (metadatos `lowbitflash.rot.*`), seguida de un entrenamiento de recuperación por destilación contra una referencia BF16. Todo el proceso (construcción de la referencia, cuantización, entrenamiento de recuperación y evaluación) se ejecutó en una máquina de 8× A100 80 GB cedida por Lambda. El resultado declarado es de 2,125 bits por experto y 2,39 bits por peso en el transformer, con 4,16 bits por peso considerando el conjunto del artefacto.

La innovación operativa es el soporte nativo de estos tipos en `buun-llama-cpp`, un fork de llama.cpp que entiende PQ2_0, la rotación lowbitflash y las lecturas PLE perezosas, y que además implementa decodificación especulativa MTP con la cabeza opcional. El autor reporta que la salida con MTP es idéntica token a token a la salida sin MTP.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `image-text-to-text`.
- Entrada de imagen a través del archivo `mmproj` (soportado en `buun-llama-cpp`, en el motor cuda.fast y en el fork `prism-llama.cpp`).
- Razonamiento de múltiples pasos y respuesta a instrucciones, heredado del checkpoint Qwen3.8-Flash-Next.
- Decodificación especulativa MTP opcional mediante cabeza dedicada, con ganancia de throughput y salida idéntica.
- Servidor compatible con la API de OpenAI (`/v1`) a través de `llama-server` o del launcher `mooney-spark`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en un único DGX Spark: el caso de uso central del artefacto. Con 92,0 GB de descarga y unos 39 GiB en memoria, permite servir un MoE de 180B en una estación GB10 sin clúster, usando `buun-llama-cpp` y `-ngl all`.
- Asistente conversacional con contexto de 32k: la configuración de referencia usa `-c 32768`, suficiente para conversaciones multi-turno largas o para pegar documentación extensa en el prompt.
- Análisis de imágenes en local: con el `mmproj` BF16 se pueden enviar capturas, diagramas o documentos escaneados al servidor OpenAI-compatible y obtener descripciones o extracción de información sin salir de la máquina.
- Prototipado de agentes con decodificación especulativa: la cabeza MTP reduce la latencia de decodificación (43,5 tok/s en contexto corto frente a un baseline menor sin MTP), lo que hace viables bucles de razonamiento de varios pasos en hardware modesto.
- Evaluación de cuantizaciones de muy bajo bitwidth: el repo sirve como referencia reproducible para estudiar el impacto del ternario rotado con recuperación por destilación en un MoE grande, comparando contra la referencia BF16.
- Servicio interno compatible con OpenAI: `serve_ds4.sh` levanta un endpoint en `http://127.0.0.1:8000/v1`, lo que permite conectar clientes existentes (SDKs, LangChain, etc.) sin adaptadores.
- Investigación en percepción de forma global: el nombre y el planteamiento del autor remiten a las imágenes de Mooney como test de percepción de forma, un caso de uso académico para estudiar qué conserva un modelo tras una compresión extrema.

## Benchmarks y rendimiento

El autor publica una métrica agregada de calidad y cifras de throughput, pero no una tabla de benchmarks estándar (MMLU, HumanEval, GSM8K).

| Metrica | Valor |
|---|---|
| Calidad agregada vs. BF16 | 95,5% de la puntuación de referencia |
| Bits por peso (transformer) | 2,39 |
| Bits por peso (artefacto completo) | 4,16 |
| Bits por experto enrutado | 2,125 |
| Throughput decode, contexto corto (DGX Spark, MTP, greedy, 1 stream) | 43,5 tok/s |
| Throughput decode, 4k de contexto | 46,4 tok/s |
| Throughput decode, 30k de contexto | 40,0 tok/s |
| Fidelidad MTP vs. sin MTP | salida idéntica token a token |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada en inferencia: ≈39 GiB residentes, más lecturas PLE bajo demanda desde SSD (tabla de 54,4 GB); el artefacto completo ocupa 92,0 GB en disco.
- GPU recomendada: NVIDIA DGX Spark con GB10 (objetivo de diseño, compilado con `GGML_NATIVE=ON`). El proceso de cuantización y evaluación se hizo en 8× A100 80 GB, pero no es el objetivo de despliegue.
- GPU de consumo: no hay datos publicados sobre RTX 4090 u otras; el requisito de 39 GiB residentes excede la VRAM de una RTX 4090 (24 GB) y el soporte de los kernels PQ2_0 está orientado a GB10/aarch64.
- Runtimes compatibles: `buun-llama-cpp` (por defecto, con MTP y visión), motor cuda.fast (`cudafast-qwen38-125b-a6b-engine`, rama `lbf/pq2-rot`) y `prism-llama.cpp` (rama `lbf/flashnext-ternary`, solo decodificación serie). llama.cpp estándar no puede cargar estos ficheros.
- Latencia/throughput: 43,5 tok/s (corto), 46,4 tok/s (4k) y 40,0 tok/s (30k) en DGX Spark con MTP, un solo stream y decodificación greedy.
- Nota de compilación: en aarch64 es necesario eliminar la línea `#define ggml_vec_dot_q2_0_q8_0_generic ggml_vec_dot_q2_0_q8_0` del bloque `__aarch64__` en `ggml/src/ggml-cpu/arch-fallback.h` (commit `4594f213`) hasta que se corrija upstream.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Licencia | Despliegue |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Mooney | ≈180B totales, ≈6B activos | 32.768 (config. de referencia) | GGUF ternario, 2,39 bits/peso en transformer | qwen-community-1.0 | 1× DGX Spark (≈39 GiB) |
| Qwen3.8-Flash-Next (BF16, base) | ≈180B totales, ≈6B activos | no disponible | safetensors BF16 | qwen-community-1.0 | Requiere hardware de gran memoria; no cabe en DGX Spark |
| Otras cuantizaciones GGUF del mismo base | ≈180B totales, ≈6B activos | no disponible | GGUF Q4/Q8 estándar | qwen-community-1.0 | No disponible; llama.cpp estándar no soporta PQ2_0 |

No se dispone de datos de benchmarks comparativos frente a alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La licencia qwen-community-1.0 no es permisiva: revisar sus términos antes de cualquier uso comercial; el repo la etiqueta como "other".
- El modelo es una cuantización de muy bajo bitwidth (2,125 bits por experto) con recuperación por destilación: conserva el 95,5% de la calidad BF16 según el autor, lo que implica una degradación medible no cuantificada por tarea.
- Requiere runtimes no estándar (`buun-llama-cpp`, cuda.fast o `prism-llama.cpp`); llama.cpp estándar, vLLM, TGI y Ollama no pueden cargar los ficheros PQ2_0.
- Problema de compilación conocido en aarch64 (commit `4594f213`) que exige un parche manual de una línea.
- La tabla PLE de 54,4 GB se lee desde SSD: el rendimiento depende del almacenamiento y no toda la tabla está en memoria.
- El MTP se desactiva automáticamente en peticiones con imagen en el motor cuda.fast.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo experimental del base, deben asumirse los del checkpoint original.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- El autor pide enlazar al repositorio original en lugar de re-subir los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DJLougen/Qwen3.8-Flash-Next-Mooney
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime por defecto (buun-llama-cpp): https://github.com/spiritbuun/buun-llama-cpp
- Launcher y verificación (mooney-spark): https://github.com/DJLougen/mooney-spark
- Motor cuda.fast (rama `lbf/pq2-rot`): https://github.com/DJLougen/cudafast-qwen38-125b-a6b-engine
- Fork llama.cpp (rama `lbf/flashnext-ternary`): https://github.com/DJLougen/prism-llama.cpp
- Apoyo al autor: https://ko-fi.com/djlougen
- Perfil del autor en X: https://x.com/DJLougen

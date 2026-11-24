# McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r1280-c1280

## Resumen

EchoMoE-Qwen3-30B-A3B-s6-r1280-c1280 es un ajuste fino del modelo Qwen3-30B-A3B-Base desarrollado por el grupo McGill-NLP, que aplica la técnica EchoMoE para reducir el tráfico de comunicación en entornos de paralelismo de expertos (expert parallelism). En lugar de transmitir cada estado oculto completo entre nodos, el modelo envía una diferencia comprimida respecto a un estado de referencia que se refresca cada pocas capas. El checkpoint concreto usa una referencia cada 6 capas (8 de 48), un código de dispatch de 1280 dimensiones y un código de combine de 1280 dimensiones.

El modelo parte de la arquitectura Qwen3 MoE: 48 capas, 128 expertos con 8 activos, tamaño oculto de 2048 y 37.205 millones de parámetros totales. Se destila del teacher Qwen3-30B-A3B-SFT-EchoMoE-teacher sobre 4.3B tokens, con todos los pesos entrenados. La ventana de contexto es de 32.768 tokens en precisión bf16.

Su relevancia es operativa: según el autor, reduce un 33% los bytes intercambiados entre nodos y mejora el throughput un 5,5% en expert parallel 32 sobre 4 nodos, a costa de 1,8 puntos de precisión media sobre 18 benchmarks frente al teacher sin comprimir. Es una propuesta para despliegues distribuidos de modelos MoE donde el cuello de botella es la red, no el cómputo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) con EchoMoE: referencia cada 6 capas, código de dispatch de 1280 dim y código de combine de 1280 dim |
| Parametros totales | 37.205.342.208 |
| Parametros activos | 8 de 128 expertos por token (no se especifica el total de parámetros activos) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | bf16 (pesos publicados); el autor reporta además dispatch y combine en FP8 como variante de evaluación |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (carga vía transformers con remote code; también soportado en vLLM con plugin) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE basado en Qwen3-30B-A3B-Base: 48 capas, 128 expertos con 8 activos por token y tamaño oculto de 2048. EchoMoE introduce un mecanismo de compresión de comunicación: en lugar de enviar el estado oculto completo en cada all-to-all de expert parallelism, se envía una diferencia comprimida respecto a un estado de referencia que se refresca cada 6 capas (8 referencias en total sobre las 48 capas). Los códigos de dispatch y combine tienen 1280 dimensiones cada uno, lo que reduce el volumen de datos transmitidos entre nodos.

El entrenamiento consiste en destilación desde el teacher Qwen3-30B-A3B-SFT-EchoMoE-teacher (a su vez un ajuste fino del base sobre datos de instrucción Dolci) sobre 4.3B tokens, con todos los pesos entrenados, no solo los módulos de compresión. Los datasets citados son allenai/Dolci-Instruct-SFT y allenai/dolma3_dolmino_mix-10B-1025. La innovación principal es la reducción del tráfico de red en entornos de expert parallelism, con un runtime propio sobre vLLM 0.29 y DeepEP para los experimentos de throughput; la evaluación de precisión usa vLLM 0.21 con el plugin de EchoMoE.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat compatible con la plantilla de Qwen3.
- Razonamiento y conocimiento general, matemáticas y código, evaluados sobre 18 benchmarks agrupados en cuatro dominios (knowledge and reasoning, math, code, instruction following).
- Seguimiento de instrucciones, con una puntuación media de 53,8 en el dominio de instruction following (frente a 55,6 del teacher).
- Decodificación greedy por defecto y configuración de muestreo tipo Qwen3 no-thinking (temperature 0.7, top_p 0.8, top_k 20, presence penalty 1.5 en vLLM) para chat.
- Soporte de ejecución distribuida con expert parallelism mediante el runtime propio del repositorio (vLLM 0.29 + DeepEP) y también carga en un solo nodo de 8 GPUs con vLLM 0.21.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking explícito.

## Casos de uso

- Despliegue distribuido de un MoE de ~37B parámetros en clústeres multi-nodo con enlaces RDMA limitados: el modelo reduce un 33% los bytes entre nodos y mejora el throughput hasta un 15,1% con enlace 2,5 veces más lento en la carga 4.096→256, lo que lo hace adecuado cuando la red es el cuello de botella.
- Servicio de chat en inglés con contexto medio: con 32.768 tokens de ventana y configuración de muestreo Qwen3 no-thinking, puede atender conversaciones multi-turno y tareas de resumen o redacción.
- Evaluación e investigación en eficiencia de comunicación para MoE: sirve como referencia reproducible para comparar técnicas de compresión de all-to-all en expert parallelism, con código y resultados de throughput publicados en el repositorio.
- Generación de código y tareas de matemáticas en pipelines por lotes: aunque pierde 1,8 puntos de media frente al teacher, mantiene 57,4 en code y 49,1 en math, suficiente para tareas no críticas de generación y revisión.
- Despliegue en un solo nodo de 8 GPUs H100 con vLLM y expert parallelism: el quickstart del autor permite servir el checkpoint con `--data-parallel-size 8 --enable-expert-parallel` y un límite de 256 secuencias concurrentes para acotar el arranque.
- Inferencia en una única GPU de 80 GB con transformers: los pesos en bf16 caben en una A100/H100 de 80 GB usando el código remoto del repositorio, útil para prototipado y evaluación sin clúster.
- Entornos con red TCP en lugar de RDMA: en la carga 4.096→256 con TCP y 8 peticiones por GPU, el autor reporta una mejora del 51,9% en BF16 y del 85,8% en FP8, lo que lo hace atractivo para infraestructura menos especializada.

## Benchmarks y rendimiento

Precisión media (%) sobre 18 benchmarks por dominio, con la variación respecto al teacher entre paréntesis:

| Dominio | Teacher | EchoMoE | EchoMoE + FP8 |
|---|---|---|---|
| Knowledge and reasoning | 77,6 | 75,6 (−2,0) | 75,7 (−1,9) |
| Math | 50,7 | 49,1 (−1,6) | 49,4 (−1,3) |
| Code | 59,2 | 57,4 (−1,8) | 56,8 (−2,4) |
| Instruction following | 55,6 | 53,8 (−1,8) | 54,2 (−1,4) |
| **Media** | **66,9** | **65,1 (−1,8)** | **65,2 (−1,7)** |

Throughput frente al teacher sin comprimir, ambos con vLLM 0.29 y DeepEP en expert parallel 32 sobre 4 nodos de 8 H100, con asignación equilibrada de expertos:

| Carga (tokens entrada → salida) | Red | Peticiones por GPU | Ganancia BF16 | Ganancia FP8 |
|---|---|---|---|---|
| 128 → 1.024 | RDMA | 512 | −0,9% | +1,6% |
| 1.024 → 128 | RDMA | 512 | +5,8% | −1,5% |
| 4.096 → 256 | RDMA | 128 | **+5,5%** | −0,9% |
| 16.384 → 512 | RDMA | 32 | +3,1% | −1,2% |
| 4.096 → 256 | RDMA, enlace 2× más lento | 128 | +7,8% | −1,9% |
| 4.096 → 256 | RDMA, enlace 2,5× más lento | 128 | +15,1% | +8,7% |
| 4.096 → 256 | TCP | 8 | +51,9% | +85,8% |

La ganancia se reduce con lotes pequeños, hasta −2,9% para 4.096→256 con 8 peticiones por GPU. Los datos completos están en `results/throughput/throughput.csv` del repositorio de código.

## Requisitos de hardware

- VRAM estimada en bf16: los pesos ocupan aproximadamente 74,4 GB (tamaño del repo), por lo que caben en una GPU de 80 GB (A100 80GB, H100 80GB) con transformers y `device_map="cuda"`.
- GPU recomendadas para despliegue distribuido: nodos de 8 H100 para el runtime de expert parallelism con vLLM 0.29 y DeepEP, según los experimentos del autor.
- Despliegue en un solo nodo: el quickstart de vLLM usa `--data-parallel-size 8 --enable-expert-parallel` sobre 8 GPUs, con `--max-num-seqs 256` para limitar el tiempo de arranque (la captura de CUDA graphs crece con las secuencias concurrentes).
- Opciones de despliegue: vLLM 0.21 con el plugin de EchoMoE (precisión) y vLLM 0.29 con DeepEP (throughput); transformers 5.8.1 con remote code para prototipado en una GPU. No se documentan soportes de llama.cpp, Ollama ni TGI.
- Throughput: las ganancias reportadas son relativas al teacher en las mismas condiciones; no se publican valores absolutos de tokens por segundo ni latencias en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Precisión media (18 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoMoE-Qwen3-30B-A3B-s6-r1280-c1280 | 37,2B | 32.768 | 65,1 | apache-2.0 | Hugging Face, código en GitHub |
| Qwen3-30B-A3B-SFT-EchoMoE-teacher | no disponible | no disponible | 66,9 | no disponible | Hugging Face (McGill-NLP) |
| Qwen3-30B-A3B-Base | no disponible | no disponible | no disponible | no disponible | Hugging Face (Qwen) |

La comparación directa disponible es con el teacher sin comprimir, que obtiene 1,8 puntos más de media pero no reduce el tráfico de red. No se han publicado en la información disponible comparativas con otros modelos MoE de tamaño similar ni con alternativas de compresión de comunicación.

## Limitaciones y advertencias

- Pérdida de precisión: 1,8 puntos de media sobre 18 benchmarks frente al teacher, con caídas de hasta 2,4 puntos en code al usar FP8 en dispatch y combine.
- Idiomas: solo se declara inglés (`en`); no hay evidencia de rendimiento multilingüe.
- Contexto limitado a 32.768 tokens; no se documenta extensión de contexto.
- Throughput dependiente de la red y del lote: la ganancia puede volverse negativa con lotes pequeños (hasta −2,9% en 4.096→256 con 8 peticiones por GPU) y con enlaces rápidos en algunas cargas (128→1.024 en BF16: −0,9%).
- Requiere software específico: plugin de EchoMoE sobre vLLM 0.21 o runtime propio con vLLM 0.29 y DeepEP; transformers necesita `trust_remote_code=True` y código remoto del repositorio.
- Arranque lento en vLLM por la captura de CUDA graphs del modelo plegado; el autor recomienda limitar `--max-num-seqs` a 256.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de toxicidad en la información disponible; al ser un ajuste sobre Dolci, hereda los sesgos de esos datos.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar las obligaciones de atribución y las licencias de los componentes base (Qwen3) y del runtime.
- Sin soporte documentado de tool calling, agentes, visión ni audio; no debe asumirse en producción sin validación previa.
- Modelo de investigación con 348 descargas y 0 likes en el momento de la ficha; madurez de ecosistema limitada.

## Enlaces

- Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r1280-c1280
- Paper: https://arxiv.org/abs/2611.22215
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección de modelos EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Teacher: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Resultados de throughput: https://github.com/McGill-NLP/EchoMoE/blob/main/results/throughput/throughput.csv

# McGill-NLP/EchoMoE-Gemma-4-26B-A4B-s4-r768-c1408

## Resumen

EchoMoE-Gemma-4-26B-A4B-s4-r768-c1408 es un checkpoint de investigación desarrollado por McGill-NLP que aplica la técnica EchoMoE sobre Gemma-4-26B-A4B, un modelo de mezcla de expertos (MoE) de Google. El objetivo no es mejorar la calidad del modelo, sino reducir el coste de comunicación en inferencia con paralelismo de expertos (expert parallelism) distribuido entre nodos. En lugar de transmitir cada estado oculto completo en las operaciones de dispatch y combine, EchoMoE envía una diferencia comprimida respecto a un estado de referencia que se refresca cada pocos layers.

El checkpoint concreto usa una referencia cada 4 layers MoE (8 de 30), un código de dispatch de 768 dimensiones y un código de combine de 1408 dimensiones. Según el autor, esto reduce un 50% los bytes intercambiados entre nodos y mejora el throughput un 14,2% en el escenario de mayor ganancia (expert parallel 32 sobre 4 nodos de 8 H100), a cambio de una pérdida media de 4,4 puntos sobre el teacher en 18 benchmarks.

Es relevante para equipos de infraestructura de IA que sirven modelos MoE de gran tamaño en clústeres multi-nodo, ya que ataca directamente el cuello de botella de red (all-to-all) que limita el escalado de estos modelos. No es un modelo pensado para uso general en producción: es un artefacto de investigación con código remoto, dependencias específicas de vLLM y un runtime propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma-4) con modificación EchoMoE en dispatch/combine; 30 layers, 128 expertos con 8 activos, hidden size 2.816 |
| Parametros totales | 24.638.464.542 (24,6 mil millones) |
| Parametros activos | 8 de 128 expertos por token (no se publica el recuento exacto de parámetros activos) |
| Longitud de contexto | 32.768 tokens (evaluado a esta longitud) |
| Tipos de cuantizacion | no disponible (evaluado en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors, con código remoto (`custom_code`) para transformers |

## Arquitectura y entrenamiento

La base es Gemma-4-26B-A4B: un transformer MoE de 30 layers con 128 expertos, 8 activos por token y un tamaño oculto de 2.816. EchoMoE introduce una modificación en la comunicación entre expertos bajo paralelismo de expertos: en lugar de enviar el estado oculto completo en dispatch y combine, se envía una representación comprimida (diferencia respecto a un estado de referencia que se refresca cada 4 layers MoE, es decir, en 8 de los 30 layers). El código de dispatch tiene 768 dimensiones y el de combine 1.408 dimensiones. Esto reduce a la mitad el volumen de bytes intercambiados en la red.

El entrenamiento es una destilación desde el teacher `McGill-NLP/Gemma-4-26B-A4B-SFT-EchoMoE-teacher` (el modelo base afinado con datos de instrucción Dolci) sobre 4,3 mil millones de tokens, entrenando todos los pesos. Los datasets citados son `allenai/Dolci-Instruct-SFT` y `allenai/dolma3_dolmino_mix-10B-1025`. La evaluación de precisión se realizó con vLLM 0.21 y el plugin de EchoMoE; las pruebas de throughput usan el runtime de paralelismo de expertos del repositorio sobre vLLM 0.29 con DeepEP. La carga en transformers 5.8.1 se hace mediante código remoto del repositorio, en PyTorch puro y sin paralelismo de expertos.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat (`apply_chat_template`).
- Razonamiento y conocimiento general, evaluado en el bloque "Knowledge and reasoning" (67,7% de media en la suite del autor).
- Matemáticas, evaluado en el bloque "Math" (37,1% de media).
- Generación de código, evaluado en el bloque "Code" (50,7% de media).
- Seguimiento de instrucciones, evaluado en el bloque "Instruction following" (54,1% de media).
- Inferencia con paralelismo de expertos distribuido multi-nodo mediante el runtime propio del repositorio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.
- Capacidad multilingüe limitada al inglés según el campo `language` de la model card.

## Casos de uso

- Investigación en comunicación eficiente para MoE: servir el modelo con el runtime de EchoMoE y medir bytes intercambiados y throughput frente al teacher sin compresión, usando el CSV de resultados del repositorio como línea base reproducible.
- Evaluación de técnicas de compresión de activaciones: comparar la pérdida de precisión (4,4 puntos de media en 18 benchmarks) con la ganancia de red (50% menos bytes) en distintos regímenes de longitud de entrada y salida.
- Despliegue multi-nodo en clústeres con red RDMA: el escenario objetivo son 4 nodos de 8 H100 con expert parallel 32, donde el modelo logra su mayor ganancia de throughput (+14,2% con entradas de 4.096 tokens y salidas de 256).
- Servicio de chat en inglés con contexto largo: la ventana de 32.768 tokens permite conversaciones multi-turno y tareas de resumen o extracción sobre documentos largos, con los ajustes de generación recomendados (temperatura 0,7, top_p 0,8, top_k 20, presence penalty 1,5).
- Prototipado en una sola GPU: los pesos en bf16 caben en una GPU de 80 GB y se cargan con transformers y código remoto, lo que permite experimentar sin montar el clúster distribuido.
- Estudio de destilación sobre modelos MoE: el checkpoint sirve como referencia de cómo se transfiere un teacher afinado con Dolci a una arquitectura modificada entrenando todos los pesos sobre 4,3B tokens.
- Benchmarking de backends de all-to-all: comparar `allgather_reducescatter` con otras alternativas y medir el efecto del envío en BF16 frente a FP8 (las ganancias documentadas van de +7,7% a +14,2% en BF16 y de +9,9% a +12,0% en FP8).

## Benchmarks y rendimiento

Precisión media (%) sobre 18 benchmarks por dominio, con la variación respecto al teacher entre paréntesis:

| Dominio | Teacher | EchoMoE |
|---|---|---|
| Knowledge and reasoning | 72,5 | 67,7 (−4,8) |
| Math | 41,4 | 37,1 (−4,3) |
| Code | 53,9 | 50,7 (−3,2) |
| Instruction following | 57,3 | 54,1 (−3,2) |
| **Media** | **61,2** | **56,8 (−4,4)** |

Throughput frente al teacher sin comprimir, ambos con vLLM 0.29 y DeepEP, expert parallel 32 sobre 4 nodos de 8 H100:

| Carga (tokens entrada → salida) | Red | Peticiones por GPU | Ganancia BF16 | Ganancia FP8 |
|---|---|---|---|---|
| 128 → 1.024 | RDMA | 512 | +7,7% | +9,9% |
| 1.024 → 128 | RDMA | 512 | +12,9% | +11,1% |
| 4.096 → 256 | RDMA | 128 | +14,2% | +12,0% |
| 16.384 → 512 | RDMA | 32 | +11,9% | +10,2% |

No se han publicado resultados de benchmarks individuales (MMLU, HumanEval, GSM8K) en la información disponible; solo se ofrecen medias agregadas por dominio.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan aproximadamente 49,3 GB (tamaño del repositorio), por lo que caben en una GPU de 80 GB. No se documentan requisitos para cuantizaciones inferiores.
- GPU recomendadas: H100 de 80 GB para el despliegue distribuido (el escenario medido usa 4 nodos de 8 H100); una única GPU de 80 GB (A100 80GB o H100) basta para la carga en transformers.
- Cabe en GPU de consumo: no de forma directa en bf16; no se proporcionan pesos cuantizados que permitan confirmar viabilidad en RTX 4090 (24 GB) u otras consumer.
- Despliegue: vLLM 0.21 con el plugin de EchoMoE (`scripts/install.sh vllm`) y transformers 5.8.1 con `trust_remote_code=True`. El throughput multi-nodo requiere el runtime del repositorio sobre vLLM 0.29 con DeepEP. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Configuración de servicio en vLLM: `--data-parallel-size 8 --enable-expert-parallel --all2all-backend allgather_reducescatter --attention-backend TRITON_ATTN --max-model-len 32768 --max-num-seqs 256`. El límite de 256 secuencias mantiene el arranque en pocos minutos, ya que la captura de CUDA graphs crece con el número de secuencias concurrentes.
- Latencia y throughput absolutos: no disponibles; solo se publican ganancias relativas frente al teacher.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| EchoMoE-Gemma-4-26B-A4B-s4-r768-c1408 | 24,6B totales, 8/128 expertos activos | 32.768 | Apache 2.0 | Hugging Face, código remoto | 56,8% de media en 18 benchmarks; +14,2% de throughput máximo |
| Gemma-4-26B-A4B-SFT-EchoMoE-teacher | no disponible | 32.768 (evaluado) | Apache 2.0 | Hugging Face | Teacher sin compresión; 61,2% de media en 18 benchmarks |
| gemma-4-26B-A4B (base de Google) | 26B (A4B) | no disponible en la información | licencia Gemma 4 | Hugging Face | Modelo original sin el ajuste Dolci ni EchoMoE |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad medible: 4,4 puntos de media sobre el teacher en 18 benchmarks, con el mayor deterioro en conocimiento y razonamiento (−4,8) y matemáticas (−4,3).
- Solo inglés: el campo `language` declara únicamente `en`; no hay evidencia de capacidades multilingües.
- Modelo de investigación: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el README incluye TODO pendientes (por ejemplo, el enlace de arXiv), lo que sugiere un artefacto recién publicado y poco validado por terceros.
- Dependencia de código remoto: la carga en transformers requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar antes de usarlo en producción.
- Dependencias de software frágiles: la precisión se midió con vLLM 0.21 y el throughput con vLLM 0.29 más DeepEP; no se garantiza compatibilidad con otras versiones.
- Arranque lento en vLLM con valores por defecto: la captura de CUDA graphs puede superar el tiempo de espera de 600 segundos del servidor de API si no se limita `--max-num-seqs`.
- Licencia: Apache 2.0, pero enlaza a la licencia de Gemma 4 de Google; conviene revisar los términos de esa licencia para uso comercial, ya que pueden imponer restricciones adicionales.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de factualidad ni de tasas de alucinación.
- Sin soporte documentado de tool calling, agentes, visión o audio: no debe asumirse su disponibilidad.
- No hay pesos cuantizados publicados, lo que limita el despliegue en hardware de gama consumer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Gemma-4-26B-A4B-s4-r768-c1408
- Modelo teacher: https://huggingface.co/McGill-NLP/Gemma-4-26B-A4B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección de modelos EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Resultados de throughput (CSV): https://github.com/McGill-NLP/EchoMoE/blob/main/results/throughput/throughput.csv
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper: no disponible (pendiente de arXiv según el README)

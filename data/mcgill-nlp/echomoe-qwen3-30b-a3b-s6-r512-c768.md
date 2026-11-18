# McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r512-c768

## Resumen

EchoMoE-Qwen3-30B-A3B-s6-r512-c768 es un checkpoint experimental desarrollado por el grupo McGill-NLP que aplica la técnica EchoMoE sobre Qwen3-30B-A3B-Base. EchoMoE es un método de retrofit que modifica un modelo de mezcla de expertos (MoE) preentrenado para que comunique menos datos bajo paralelismo de expertos: en lugar de enviar cada estado oculto completo entre nodos, transmite una diferencia comprimida respecto a un estado de referencia que se refresca cada pocas capas. En esta configuración concreta, la referencia se actualiza cada 6 capas (8 de 48), con un código de dispatch de 512 dimensiones y un código de combine de 768 dimensiones.

El modelo resuelve un problema de infraestructura: el cuello de botella de red que aparece al servir modelos MoE de gran tamaño distribuidos entre múltiples nodos. Según la model card, consigue enviar un 62% menos de bytes entre nodos y mejorar el throughput un 27,6% con paralelismo de expertos 32 sobre 4 nodos de 8 H100, a cambio de una pérdida media de 5,4 puntos sobre el profesor sin comprimir en 18 benchmarks. La arquitectura subyacente es la de Qwen3-30B-A3B: 48 capas, 128 expertos con 8 activos, hidden size 2.048, 28.636.379.136 parámetros totales y una longitud de contexto de 32.768 tokens.

Es relevante ahora porque ofrece una vía práctica para reducir el coste de comunicación en despliegues multi-nodo de MoE sin reentrenar desde cero, mediante destilación desde un profesor fine-tuneado. El checkpoint se distribuye con licencia Apache 2.0, en safetensors y bf16, con código remoto para transformers y un plugin para vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) con retrofit EchoMoE; 48 capas, 128 expertos con 8 activos, hidden size 2.048 |
| Parametros totales | 28.636.379.136 |
| Parametros activos | 8 de 128 expertos por capa (modelo base Qwen3-30B-A3B); no se especifica el recuento exacto de parametros activos |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; la model card menciona FP8 solo para el envio de dispatch y combine, no cuantizacion de pesos) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con custom_code / remote code para transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B-Base, un transformer MoE de 48 capas con 128 expertos por capa y 8 activos, hidden size de 2.048. Sobre esa base, McGill-NLP aplica EchoMoE: bajo paralelismo de expertos, cada estado oculto se sustituye por una diferencia comprimida respecto a un estado de referencia que se refresca cada 6 capas. La configuración de este checkpoint usa un código de dispatch de 512 dimensiones y un código de combine de 768 dimensiones, lo que reduce el volumen de bytes intercambiados entre nodos.

El entrenamiento es una destilación desde el profesor McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher (el modelo base fine-tuneado con datos de instrucciones Dolci) sobre 4,3B tokens, con todos los pesos entrenados. Los datasets citados son allenai/Dolci-Instruct-SFT y allenai/dolma3_dolmino_mix-10B-1025. No se detalla en la información disponible si hubo RLHF o DPO adicionales. La evaluación de precisión se realizó con vLLM 0.21 y el plugin de EchoMoE; las pruebas de throughput usan el runtime de paralelismo de expertos del repositorio sobre vLLM 0.29 con DeepEP, y transformers 5.8.1 carga el modelo mediante el código remoto del repositorio.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat de Qwen3.
- Razonamiento y conocimiento general, evaluado en el bloque de "knowledge and reasoning" de 18 benchmarks.
- Matemáticas, con un rendimiento medio de 46,4 en el bloque de math (frente a 50,7 del profesor).
- Generación de código, con 52,4 de media en el bloque de code (frente a 59,2 del profesor).
- Seguimiento de instrucciones, con 51,9 de media (frente a 55,6 del profesor).
- Modo no-thinking de Qwen3 recomendado para chat (temperature 0.7, top_p 0.8, top_k 20, presence penalty 1.5 en vLLM); decodificación greedy para tareas few-shot.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline es text-generation.
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso

- Despliegue multi-nodo de MoE con red limitada: el modelo está diseñado para escenarios de paralelismo de expertos donde el ancho de banda entre nodos es el cuello de botella; con enlaces RDMA 2,5 veces más lentos el throughput mejora un 50,4%, y sobre TCP con 8 peticiones por GPU la mejora llega al 96,7% en BF16. Es adecuado cuando no se puede asumir una interconnect de altísimo rendimiento.
- Serving de chat a gran escala con vLLM: se puede servir con `vllm serve` usando data-parallel-size 8, expert-parallel, backend all2all allgather_reducescatter y FlashInfer, con `--max-num-seqs 256` para mantener el arranque en pocos minutos. Encaja en plataformas de chat donde el coste por token viene dominado por la comunicación entre nodos.
- Evaluación e investigación de técnicas de compresión de comunicación: al publicarse el código, los resultados de throughput y el checkpoint, sirve como base reproducible para estudiar el compromiso entre bytes enviados y precisión en MoE distribuididos.
- Prototipado en una sola GPU de 80 GB: los pesos en bf16 caben en una GPU de 80 GB mediante transformers con `trust_remote_code=True`, lo que permite experimentar sin infraestructura multi-nodo.
- Tareas de generación de texto en inglés con contexto medio: con 32.768 tokens de contexto puede gestionar documentos técnicos, resúmenes y conversaciones multi-turno dentro de ese límite, aceptando la pérdida de precisión respecto al profesor.
- Base para fine-tuning posterior: al estar bajo Apache 2.0 y en safetensors, se puede adaptar a dominios concretos en inglés, teniendo en cuenta que parte de un modelo ya degradado 5,4 puntos respecto a su profesor.
- Benchmarking de infraestructura: útil para comparar configuraciones de red (RDMA frente a TCP, distintos anchos de banda) y de precisión de comunicación (BF16 frente a FP8) en clústeres de H100.

## Benchmarks y rendimiento

Precisión media (%) sobre 18 benchmarks por dominio, con la variación respecto al profesor entre paréntesis:

| Dominio | Profesor | EchoMoE | EchoMoE + FP8 |
|---|---|---|---|
| Knowledge and reasoning | 77,6 | 71,7 (−5,9) | 71,7 (−5,9) |
| Math | 50,7 | 46,4 (−4,3) | 46,1 (−4,6) |
| Code | 59,2 | 52,4 (−6,8) | 52,7 (−6,5) |
| Instruction following | 55,6 | 51,9 (−3,7) | 51,7 (−3,9) |
| **Media** | **66,9** | **61,5 (−5,4)** | **61,4 (−5,5)** |

Throughput: mejora sobre el profesor sin comprimir, ambos servidos con vLLM 0.29 y DeepEP con paralelismo de expertos 32 sobre 4 nodos de 8 H100 y asignación equilibrada de expertos.

| Carga (tokens entrada → salida) | Red | Peticiones por GPU | Ganancia BF16 | Ganancia FP8 |
|---|---|---|---|---|
| 128 → 1.024 | RDMA | 512 | +14,1% | +16,5% |
| 1.024 → 128 | RDMA | 512 | +32,3% | +20,5% |
| 4.096 → 256 | RDMA | 128 | **+27,6%** | +16,5% |
| 16.384 → 512 | RDMA | 32 | +18,6% | +11,0% |
| 4.096 → 256 | RDMA, enlace 2× más lento | 128 | +28,4% | +19,9% |
| 4.096 → 256 | RDMA, enlace 2,5× más lento | 128 | +50,4% | +29,2% |
| 4.096 → 256 | TCP | 8 | +96,7% | +126,3% |

La ganancia se reduce con lotes pequeños: hasta +5,9% para 4.096 → 256 tokens con 8 peticiones por GPU. El conjunto completo de medidas está en `results/throughput/throughput.csv` del repositorio de código.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan aproximadamente 57,3 GB (tamaño del repo), por lo que caben en una GPU de 80 GB; la model card confirma que los pesos bf16 caben en una sola GPU de 80 GB.
- GPU recomendadas: H100 de 80 GB para despliegue multi-nodo con paralelismo de expertos (las mediciones usan 4 nodos de 8 H100); una sola GPU de 80 GB (A100 80 GB o H100) para inferencia con transformers.
- GPU de consumo: no se indica compatibilidad con GPUs de consumo; el tamaño en bf16 y el requisito de 80 GB lo hacen inviable en RTX 4090 (24 GB) sin cuantización, y no se publican pesos cuantizados.
- Opciones de despliegue: vLLM 0.21 con el plugin de EchoMoE (instalación vía `scripts/install.sh vllm`), runtime de paralelismo de expertos del repositorio sobre vLLM 0.29 con DeepEP, y transformers 5.8.1 con código remoto. No se mencionan llama.cpp, Ollama ni TGI.
- Throughput: con paralelismo de expertos 32 sobre 4 nodos de 8 H100, la mejora frente al profesor va de +5,9% a +96,7% según carga, red y tamaño de lote; la configuración de referencia (4.096 → 256, RDMA, 128 peticiones por GPU) da +27,6% en BF16.
- Latencia: no se publican cifras absolutas de latencia en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión media (18 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoMoE-Qwen3-30B-A3B-s6-r512-c768 | 28,6B totales, 8 de 128 expertos activos | 32.768 | 61,5 | Apache 2.0 | Hugging Face, código en GitHub |
| Qwen3-30B-A3B-SFT-EchoMoE-teacher (profesor) | 28,6B totales, 8 de 128 expertos activos | 32.768 | 66,9 | no disponible en la información | Hugging Face (McGill-NLP) |
| Qwen3-30B-A3B-Base | 28,6B totales, 8 de 128 expertos activos | no disponible en la información | no disponible | no disponible en la información | Hugging Face (Qwen) |

La comparación con otras técnicas de compresión de comunicación en MoE no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión respecto al profesor: 5,4 puntos de media en 18 benchmarks, con la mayor caída en código (−6,8) y la menor en seguimiento de instrucciones (−3,7).
- Solo inglés: la model card declara únicamente el idioma `en`, por lo que no se debe asumir un rendimiento multilingüe fiable.
- Contexto limitado a 32.768 tokens, inferior al de otros modelos actuales.
- Requiere código remoto (`trust_remote_code=True`) y un plugin específico para vLLM; no es un checkpoint plug-and-play en todas las pilas de inferencia.
- El arranque en vLLM exige ajustar `--max-num-seqs` (256 recomendado); con el valor por defecto la captura de CUDA graphs supera el tiempo de espera del servidor de API (600 s).
- Las ganancias de throughput dependen fuertemente de la red y del tamaño de lote: con lotes pequeños la mejora cae hasta +5,9%, y las cifras absolutas de latencia no se publican.
- Riesgo de alucinación: no se documenta en la información disponible; como modelo derivado de Qwen3 con destilación, se debe validar en producción.
- Sesgos: no se documentan en la información disponible.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene revisar las condiciones del modelo base y del profesor, cuya licencia no se detalla en la información proporcionada.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de menor capacidad.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r512-c768
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección de modelos EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Modelo profesor: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Resultados de throughput: https://github.com/McGill-NLP/EchoMoE/blob/main/results/throughput/throughput.csv
- Paper: no disponible en la información proporcionada

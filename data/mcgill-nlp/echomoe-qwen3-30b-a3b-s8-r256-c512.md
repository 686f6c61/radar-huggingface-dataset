# McGill-NLP/EchoMoE-Qwen3-30B-A3B-s8-r256-c512

## Resumen

EchoMoE-Qwen3-30B-A3B-s8-r256-c512 es un checkpoint de investigación desarrollado por el grupo McGill-NLP que aplica la técnica EchoMoE sobre el modelo Qwen3-30B-A3B. EchoMoE es un método de retroadaptación (retrofit) que modifica un modelo de mezcla de expertos (MoE) preentrenado para que comunique menos información bajo paralelismo de expertos: en lugar de enviar cada estado oculto completo entre nodos, transmite una diferencia comprimida respecto a un estado de referencia que se refresca cada pocos niveles. El objetivo es reducir el tráfico de red en el despliegue distribuido de modelos MoE, que es el principal cuello de botella cuando los expertos se reparten entre varias máquinas.

Este checkpoint concreto aplica EchoMoE a Qwen3-30B-A3B con una referencia cada 8 niveles (6 de 48), un código de dispatch de 256 dimensiones y un código de combine de 512 dimensiones. El resultado declarado es una reducción del 75 % en bytes inter-nodo y una mejora de throughput del 42,9 % en paralelismo de expertos 32 sobre 4 nodos, a costa de una pérdida media de 11,2 puntos en 18 benchmarks respecto al profesor sin comprimir.

Es relevante porque aborda un problema práctico de infraestructura (el coste de comunicación all-to-all en MoE distribuidos) con una solución a nivel de arquitectura y pesos, no solo de sistema. No obstante, el compromiso precisión/rendimiento es sustancial y el modelo está orientado a experimentación, no a producción directa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) con retrofit EchoMoE; 48 capas, 128 expertos con 8 activos, hidden size 2.048 |
| Parámetros totales | 25.470.732.288 (según safetensors) |
| Parámetros activos | 8 de 128 expertos por token (modelo base Qwen3-30B-A3B) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | bf16 (pesos publicados); FP8 solo para dispatch/combine en los experimentos de throughput; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código remoto (custom_code) para transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B-Base, un transformer MoE de 48 capas con 128 expertos por capa y 8 activos por token, con un tamaño oculto de 2.048. Sobre esa base, McGill-NLP entrenó primero un profesor (Qwen3-30B-A3B-SFT-EchoMoE-teacher) mediante ajuste supervisado sobre datos de instrucciones Dolci (allenai/Dolci-Instruct-SFT). El checkpoint EchoMoE se obtiene por destilación desde ese profesor sobre 4,3B tokens, entrenando todos los pesos.

La innovación central es el mecanismo EchoMoE: en lugar de transmitir el estado oculto completo en cada operación de dispatch y combine entre expertos distribuidos, el modelo envía una representación comprimida de la diferencia respecto a un estado de referencia. La referencia se refresca cada 8 capas (6 referencias en total en las 48 capas), y la compresión se materializa en un código de dispatch de 256 dimensiones y un código de combine de 512 dimensiones. Esto reduce el volumen de comunicación all-to-all entre nodos, que es el coste dominante en paralelismo de expertos. El entrenamiento se realizó en bf16 y el conjunto de datos de destilación incluye también allenai/dolma3_dolmino_mix-10B-1025 según los metadatos del repositorio.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con Qwen3.
- Razonamiento y conocimiento general, aunque con degradación medible frente al profesor (ver benchmarks).
- Razonamiento matemático y generación de código, con pérdidas de 9,8 y 8,5 puntos respectivamente frente al profesor.
- Seguimiento de instrucciones, con la menor degradación relativa del conjunto (4,6 puntos).
- Modo no-thinking recomendado para chat (temperatura 0,7, top_p 0,8, top_k 20, presencia 1,5 en vLLM); decodificación greedy por defecto para tareas few-shot.
- Soporte de paralelismo de expertos mediante plugin de vLLM y runtime propio con DeepEP.
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación en sistemas distribuidos para MoE: el modelo sirve como banco de pruebas para medir el impacto del retrofit EchoMoE en tráfico de red y throughput en clústeres multi-nodo con paralelismo de expertos 32.
- Despliegue en enlaces de red lentos: con enlaces RDMA 2,5 veces más lentos, la ganancia de throughput sube al 73 % (BF16), lo que lo hace adecuado para clústeres con interconexión limitada donde el all-to-all domina la latencia.
- Entornos con red TCP: la ganancia medida alcanza el 138,3 % en BF16 y el 224,4 % en FP8, útil para experimentos en infraestructura no optimizada.
- Evaluación comparativa de técnicas de compresión de comunicación: permite contrastar directamente con el profesor sin comprimir en 18 benchmarks por dominio.
- Generación de texto en inglés con contexto medio (hasta 32.768 tokens) en una sola GPU de 80 GB mediante transformers, para prototipado rápido sin infraestructura distribuida.
- Estudio de destilación con pérdida controlada: útil para analizar el compromiso entre reducción de comunicación y degradación de precisión en modelos MoE de ~25B parámetros.

## Benchmarks y rendimiento

Precisión media (%) sobre 18 benchmarks por dominio, con la variación respecto al profesor entre paréntesis:

| Dominio | Profesor | EchoMoE | EchoMoE + FP8 |
|---|---|---|---|
| Conocimiento y razonamiento | 77,6 | 64,2 (−13,4) | 64,1 (−13,5) |
| Matemáticas | 50,7 | 40,9 (−9,8) | 41,0 (−9,7) |
| Código | 59,2 | 50,7 (−8,5) | 50,1 (−9,1) |
| Seguimiento de instrucciones | 55,6 | 51,0 (−4,6) | 50,9 (−4,7) |
| **Media** | **66,9** | **55,7 (−11,2)** | **55,6 (−11,3)** |

Throughput (ganancia sobre el profesor sin comprimir, vLLM 0.29 con DeepEP, paralelismo de expertos 32 sobre 4 nodos de 8 H100):

| Carga (entrada → salida) | Red | Peticiones por GPU | Ganancia BF16 | Ganancia FP8 |
|---|---|---|---|---|
| 128 → 1.024 | RDMA | 512 | +25,6 % | +25,1 % |
| 1.024 → 128 | RDMA | 512 | +51,5 % | +34,4 % |
| 4.096 → 256 | RDMA | 128 | +42,9 % | +27,3 % |
| 16.384 → 512 | RDMA | 32 | +28,0 % | +17,6 % |
| 4.096 → 256 | RDMA, enlace 2× más lento | 128 | +40,2 % | +33,3 % |
| 4.096 → 256 | RDMA, enlace 2,5× más lento | 128 | +73,0 % | +43,3 % |
| 4.096 → 256 | TCP | 8 | +138,3 % | +224,4 % |

La ganancia se reduce con lotes pequeños, hasta −2,2 % para 128 → 1.024 tokens con 8 peticiones por GPU. No se publican resultados de MMLU, HumanEval o GSM8K individuales en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos (~25,5B parámetros) ocupan aproximadamente 51 GB, por lo que caben en una GPU de 80 GB (A100 80GB, H100 80GB) con transformers y código remoto.
- No cabe en GPUs de consumo de 24 GB en bf16; no se documentan cuantizaciones GGUF/INT4 que permitan reducir el requisito.
- Despliegue con vLLM 0.21 y el plugin EchoMoE: un nodo de 8 GPUs con `--data-parallel-size 8 --enable-expert-parallel`, backend all2all `allgather_reducescatter` y `--attention-backend FLASHINFER`.
- Throughput medido en 4 nodos de 8 H100 con DeepEP y vLLM 0.29 en paralelismo de expertos 32.
- Ajuste recomendado `--max-num-seqs 256` para mantener el arranque en pocos minutos, ya que la captura de CUDA graphs crece con las secuencias concurrentes.
- Alternativa de prototipado: transformers 5.8.1 con `trust_remote_code=True`, PyTorch plano sin paralelismo de expertos, en una sola GPU de 80 GB.
- No se publican cifras de latencia absoluta ni de throughput en tokens/s en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión media (18 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoMoE-Qwen3-30B-A3B-s8-r256-c512 | 25,5B (8 activos) | 32.768 | 55,7 | Apache 2.0 | Hugging Face, código remoto |
| Qwen3-30B-A3B-SFT-EchoMoE-teacher (profesor) | 25,5B (8 activos) | 32.768 | 66,9 | Apache 2.0 | Hugging Face |
| Qwen3-30B-A3B-Base | 30B (3B activos) | 32.768 | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita al profesor y al modelo base por falta de datos de terceros en la información proporcionada. La diferencia clave frente al profesor es el compromiso explícito: −11,2 puntos de precisión media a cambio de −75 % de bytes inter-nodo y hasta +42,9 % de throughput en el escenario principal medido.

## Limitaciones y advertencias

- Degradación de precisión significativa: −11,2 puntos de media sobre 18 benchmarks, con la mayor caída en conocimiento y razonamiento (−13,4).
- Solo inglés: el modelo no declara soporte multilingüe.
- Contexto limitado a 32.768 tokens; no se documenta extensión.
- No se documentan capacidades de tool calling, agentes, visión ni audio; no debe asumirse su disponibilidad.
- La ganancia de throughput depende fuertemente del tamaño de lote y de la red: puede volverse negativa (−2,2 %) con lotes pequeños y es máxima en enlaces lentos o TCP.
- Requiere software específico (plugin EchoMoE, vLLM 0.21/0.29, DeepEP, código remoto con `trust_remote_code=True`), lo que añade riesgo de mantenimiento y de compatibilidad.
- El ajuste `--max-num-seqs 256` es necesario para evitar tiempos de arranque que superen el timeout del servidor de API en vLLM.
- Riesgo de alucinación inherente a modelos de lenguaje; no se documentan evaluaciones específicas de sesgo o toxicidad.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigación y la degradación de precisión desaconsejan su uso en producción sin evaluación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria mínimos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s8-r256-c512
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección de modelos EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Modelo profesor: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Resultados de throughput completos: https://github.com/McGill-NLP/EchoMoE/blob/main/results/throughput/throughput.csv
- Paper: no disponible (pendiente en la model card)

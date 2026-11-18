# McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r256-c512

## Resumen

EchoMoE-Qwen3-30B-A3B-s6-r256-c512 es un checkpoint de investigación desarrollado por el grupo McGill-NLP que aplica la técnica EchoMoE sobre el modelo Mixture-of-Experts Qwen3-30B-A3B. El objetivo no es mejorar la calidad del modelo, sino reducir el coste de comunicación en inferencia distribuida con paralelismo de expertos (expert parallelism). En lugar de transmitir cada estado oculto completo entre nodos, el modelo envía una diferencia comprimida respecto a un estado de referencia que se refresca cada pocas capas.

Concretamente, este checkpoint usa una referencia cada 6 capas (8 de 48), un código de dispatch de 256 dimensiones y un código de combine de 512 dimensiones. Según el autor, esto reduce un 73 % los bytes intercambiados entre nodos y mejora el throughput un 39,6 % en configuraciones de expert parallel 32 sobre 4 nodos, a cambio de una pérdida media de 10 puntos en 18 benchmarks respecto al profesor sin comprimir.

Es relevante porque ataca un cuello de botella real en el despliegue de MoE a gran escala: el tráfico all-to-all entre GPUs. El modelo está pensado para equipos de infraestructura e investigación que quieran evaluar compromisos entre ancho de banda, latencia y calidad, no como un modelo de propósito general listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_moe) con capas EchoMoE de compresión de comunicación |
| Parametros totales | 25.369.016.320 (≈25,4B según safetensors) |
| Parametros activos | 8 expertos de 128 por capa (configuración Qwen3-30B-A3B); número exacto de parámetros activos no disponible |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | bf16 (pesos publicados); soporte FP8 para dispatch/combine en la evaluación de throughput; otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código remoto (custom_code) para transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B-Base: 48 capas, 128 expertos con 8 activos por token y un tamaño oculto de 2.048. Sobre esa base, EchoMoE introduce un mecanismo de compresión de la comunicación entre expertos: cada capa seleccionada envía un código de baja dimensión (256 dimensiones para dispatch y 512 para combine) que codifica la diferencia respecto a un estado de referencia, en lugar del estado oculto completo. La referencia se refresca cada 6 capas, lo que da 8 referencias en las 48 capas del modelo.

El entrenamiento es una destilación desde un profesor (Qwen3-30B-A3B-SFT-EchoMoE-teacher) afinado previamente sobre datos de instrucción Dolci (allenai/Dolci-Instruct-SFT), usando 4.300 millones de tokens y entrenando todos los pesos. Los datos de mezcla incluyen también allenai/dolma3_dolmino_mix-10B-1025. La innovación principal es, por tanto, de infraestructura: el modelo está diseñado para reducir el tráfico all-to-all en paralelismo de expertos, con un runtime propio sobre vLLM (0.29) y DeepEP para las mediciones de throughput, y un plugin sobre vLLM 0.21 para las mediciones de precisión.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con Qwen3.
- Razonamiento y conocimiento general, aunque con degradación medible frente al profesor (ver benchmarks).
- Razonamiento matemático y generación de código, también con pérdida de calidad respecto al profesor.
- Seguimiento de instrucciones, la tarea donde la degradación es menor (−4,4 puntos).
- Inferencia distribuida con paralelismo de expertos y comunicación comprimida entre nodos.
- Compatibilidad con decodificación greedy (por defecto) y con los ajustes de muestreo no-thinking de Qwen3 (temperatura 0,7, top_p 0,8, top_k 20, presence penalty 1,5 en vLLM).
- No se documenta soporte de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Investigación en sistemas distribuidos para MoE: medir el compromiso entre ancho de banda de red y calidad del modelo en clústeres multi-nodo con expert parallel, usando el runtime del repositorio y DeepEP.
- Despliegue en enlaces de red lentos: en TCP con 8 peticiones por GPU el autor reporta una mejora de throughput del 131,6 % en BF16 y 211,9 % en FP8, lo que hace viable servir el modelo donde el all-to-all convencional sería prohibitivo.
- Evaluación de técnicas de compresión de comunicación: servir como referencia reproducible (referencia cada 6 capas, códigos de 256/512 dimensiones) para comparar con otras estrategias de compresión de estados ocultos.
- Servicio de chat en inglés con contexto medio: con 32.768 tokens de ventana puede gestionar conversaciones multi-turno y documentos de tamaño moderado, aceptando la pérdida de calidad respecto al profesor.
- Prototipado de pipelines de generación de código o matemáticas en entornos de investigación donde el coste de infraestructura pesa más que la precisión absoluta.
- Docencia y experimentación: el checkpoint carga en transformers con código remoto en una sola GPU de 80 GB en bf16, lo que permite estudiar el comportamiento del modelo sin montar un clúster.

## Benchmarks y rendimiento

Precisión media (%) sobre 18 benchmarks por dominio, con la variación respecto al profesor entre paréntesis:

| Dominio | Profesor | EchoMoE | EchoMoE + FP8 |
|---|---|---|---|
| Conocimiento y razonamiento | 77,6 | 65,8 (−11,8) | 65,7 (−11,9) |
| Matemáticas | 50,7 | 41,6 (−9,1) | 41,6 (−9,1) |
| Código | 59,2 | 51,6 (−7,6) | 50,6 (−8,6) |
| Seguimiento de instrucciones | 55,6 | 51,2 (−4,4) | 51,6 (−4,0) |
| **Media** | **66,9** | **56,9 (−10,0)** | **56,7 (−10,2)** |

Throughput frente al profesor sin comprimir, ambos con vLLM 0.29 y DeepEP, expert parallel 32 sobre 4 nodos de 8 H100:

| Carga (entrada → salida) | Red | Peticiones por GPU | Ganancia BF16 | Ganancia FP8 |
|---|---|---|---|---|
| 128 → 1.024 | RDMA | 512 | +23,0 % | +22,8 % |
| 1.024 → 128 | RDMA | 512 | +46,8 % | +31,2 % |
| 4.096 → 256 | RDMA | 128 | **+39,6 %** | +25,0 % |
| 16.384 → 512 | RDMA | 32 | +26,1 % | +15,9 % |
| 4.096 → 256 | RDMA, enlace 2× más lento | 128 | +38,0 % | +29,9 % |
| 4.096 → 256 | RDMA, enlace 2,5× más lento | 128 | +67,9 % | +40,6 % |
| 4.096 → 256 | TCP | 8 | +131,6 % | +211,9 % |

La ganancia se reduce con lotes pequeños, hasta −4,1 % para 128 → 1.024 tokens con 8 peticiones por GPU. Los resultados completos están en `results/throughput/throughput.csv` del repositorio de código.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 (≈50,7 GB de repositorio) caben en una GPU de 80 GB; el autor indica que el checkpoint en bf16 entra en una sola GPU de 80 GB con transformers.
- GPU recomendadas: H100 de 80 GB para el despliegue multi-nodo con expert parallel; A100 de 80 GB como alternativa para una sola GPU en bf16.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB en bf16; no se han publicado pesos GGUF ni cuantizaciones de menor precisión.
- Despliegue: vLLM 0.21 con el plugin EchoMoE (precisión) y vLLM 0.29 con DeepEP y el runtime del repositorio (throughput); transformers 5.8.1 con código remoto. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: ganancias de hasta +39,6 % en RDMA y +131,6 % en TCP frente al profesor, según la tabla anterior; latencia absoluta no disponible.
- Nota operativa: con vLLM, `--max-num-seqs 256` mantiene el arranque en pocos minutos, ya que la captura de CUDA graphs crece con las secuencias concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad media (18 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoMoE-Qwen3-30B-A3B-s6-r256-c512 | ≈25,4B totales, 8 de 128 expertos activos | 32.768 | 56,9 | Apache 2.0 | Hugging Face, código remoto |
| Qwen3-30B-A3B-SFT-EchoMoE-teacher (profesor) | ≈30B totales, 8 de 128 expertos activos | no disponible | 66,9 | Apache 2.0 (según modelo base) | Hugging Face |
| Qwen3-30B-A3B-Base | ≈30B totales, 8 de 128 expertos activos | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos citados en la información disponible; no se han publicado datos frente a otras alternativas MoE de tamaño similar.

## Limitaciones y advertencias

- Pérdida de calidad significativa: 10,0 puntos de media en 18 benchmarks respecto al profesor, con el mayor deterioro en conocimiento y razonamiento (−11,8).
- Solo inglés: la model card declara únicamente `en`; el rendimiento en otros idiomas no está evaluado.
- Contexto limitado a 32.768 tokens, inferior al de otras variantes de la familia Qwen3.
- Requiere código remoto (`trust_remote_code=True`) y un plugin específico para vLLM; no es un checkpoint estándar de transformers.
- El arranque en vLLM puede superar el tiempo de espera por defecto si no se limita `--max-num-seqs`.
- Las ganancias de throughput dependen de la red y del tamaño de lote; con lotes pequeños puede haber regresiones (hasta −4,1 % en el caso medido).
- Riesgo de alucinación no cuantificado en la información disponible; al ser un modelo destilado con pérdida de conocimiento, es esperable un aumento respecto al profesor.
- Sesgos no documentados en la model card.
- Licencia Apache 2.0 permite uso comercial, pero la degradación de calidad y la dependencia de infraestructura específica desaconsejan su uso en producción sin evaluación propia.
- Checkpoint con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario mínimos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r256-c512
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Modelo profesor: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Resultados de throughput: https://github.com/McGill-NLP/EchoMoE/blob/main/results/throughput/throughput.csv
- Paper: no disponible (pendiente en la model card)

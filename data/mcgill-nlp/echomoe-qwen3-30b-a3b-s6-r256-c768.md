# McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r256-c768

## Resumen

EchoMoE-Qwen3-30B-A3B-s6-r256-c768 es un checkpoint de investigación desarrollado por el grupo McGill-NLP que aplica la técnica EchoMoE sobre Qwen3-30B-A3B. EchoMoE es un método de retroadaptación (retrofit) para modelos de mezcla de expertos (MoE) que reduce el tráfico de comunicación entre nodos en escenarios de paralelismo de expertos (expert parallelism). En lugar de transmitir cada estado oculto completo, el modelo envía una diferencia comprimida respecto a un estado de referencia que se refresca cada pocas capas.

El checkpoint parte del modelo base Qwen3-30B-A3B-Base (48 capas, 128 expertos con 8 activos, tamaño oculto de 2.048) y se destila del profesor Qwen3-30B-A3B-SFT-EchoMoE-teacher, afinado sobre datos de instrucción Dolci. La configuración concreta usa una referencia cada 6 capas (8 de 48 en total), un código de dispatch de 256 dimensiones y un código de combine de 768 dimensiones. Cuenta con 26.602.141.696 parámetros reales según safetensors y un contexto de 32.768 tokens.

Su relevancia es fundamentalmente de sistemas: en paralelismo de expertos 32 sobre 4 nodos de 8 H100, reduce un 67% los bytes transmitidos entre nodos e incrementa el throughput un 32,5% en la carga 4.096→256, a costa de una pérdida media de 8,6 puntos sobre 18 benchmarks frente al profesor sin comprimir. Es, por tanto, un modelo orientado a investigación sobre eficiencia de comunicación en inferencia distribuida, no un modelo de propósito general para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) con retrofit EchoMoE; 48 capas, 128 expertos con 8 activos, hidden size 2.048 |
| Parámetros totales | 26.602.141.696 (26,6 mil millones) |
| Parámetros activos | 8 de 128 expertos por token (modelo base Qwen3-30B-A3B) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | bf16 (precisión de referencia); FP8 para dispatch y combine en la variante medida; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; requiere `trust_remote_code=True` (código remoto en PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE heredado de Qwen3-30B-A3B-Base, al que se le aplica el retrofit EchoMoE. La innovación central consiste en que, bajo paralelismo de expertos, cada capa no envía el estado oculto completo a los expertos remotos, sino una diferencia comprimida respecto a un estado de referencia. Ese estado de referencia se refresca cada 6 capas (8 referencias en las 48 capas totales), y la comunicación se articula mediante un código de dispatch de 256 dimensiones y un código de combine de 768 dimensiones. El objetivo es reducir el volumen de bytes intercambiados entre nodos, que es el cuello de botella del paralelismo de expertos en clústeres multi-nodo.

El entrenamiento se realizó por destilación desde el profesor Qwen3-30B-A3B-SFT-EchoMoE-teacher (el modelo base afinado sobre datos de instrucción Dolci) utilizando 4,3 mil millones de tokens, con todos los pesos entrenados. Los datasets citados son allenai/Dolci-Instruct-SFT y allenai/dolma3_dolmino_mix-10B-1025. El checkpoint se sirve con vLLM 0.21 (con el plugin EchoMoE) para evaluación de precisión, y con el runtime de paralelismo de expertos del repositorio sobre vLLM 0.29 con DeepEP para las medidas de throughput. La carga en transformers 5.8.1 se realiza a través del código remoto incluido en el repositorio.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat de Qwen3.
- Razonamiento y conocimiento general, aunque con degradación medible frente al profesor (‑9,3 puntos en conocimiento y razonamiento).
- Matemáticas (‑8,2 puntos frente al profesor) y generación de código (‑8,8 puntos).
- Seguimiento de instrucciones (‑5,5 puntos frente al profesor).
- Modo de decodificación no-thinking recomendado para chat (temperatura 0,7, top_p 0,8, top_k 20, presence penalty 1,5 en vLLM); las tareas few-shot usan decodificación greedy.
- Soporte de paralelismo de expertos con comunicación comprimida (dispatch de 256 dim, combine de 768 dim) y variante FP8 para dispatch/combine.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo más allá del inglés.

## Casos de uso

- Investigación en eficiencia de comunicación para MoE: el modelo sirve como banco de pruebas para medir el impacto de comprimir dispatch y combine en el tráfico inter-nodo, comparando con el profesor sin comprimir en las mismas cargas.
- Despliegue en clústeres con enlaces de red lentos: en RDMA con enlace 2,5 veces más lento, el modelo logra un +56,1% de throughput en la carga 4.096→256, lo que lo hace adecuado para entornos donde el ancho de banda es el factor limitante.
- Servicio sobre TCP: en la carga 4.096→256 con TCP y 8 peticiones por GPU, el modelo alcanza un +108,7% en BF16 y un +199,8% en FP8, útil para prototipos en redes no optimizadas.
- Evaluación de precisión bajo compresión: permite estudiar la curva de degradación (8,6 puntos de media en 18 benchmarks) y decidir si el ahorro de red compensa la pérdida de calidad en una aplicación concreta.
- Docencia y reproducción de resultados: el repositorio incluye scripts de instalación, evaluación y el CSV completo de throughput, lo que facilita reproducir los experimentos en un nodo de 8 GPUs.
- Comparación de configuraciones EchoMoE: al existir una colección de modelos con distintas referencias y dimensiones de código, sirve para analizar el compromiso entre tasa de compresión y calidad.
- Generación de texto en inglés para tareas de chat de baja exigencia, siempre que se acepte la pérdida de calidad respecto al profesor y se use la configuración de decodificación recomendada.

## Benchmarks y rendimiento

Precisión media (%) sobre 18 benchmarks por dominio, con la variación respecto al profesor entre paréntesis:

| Dominio | Profesor | EchoMoE | EchoMoE + FP8 |
|---|---|---|---|
| Conocimiento y razonamiento | 77,6 | 68,3 (‑9,3) | 68,4 (‑9,2) |
| Matemáticas | 50,7 | 42,5 (‑8,2) | 43,4 (‑7,3) |
| Código | 59,2 | 50,4 (‑8,8) | 49,2 (‑10,0) |
| Seguimiento de instrucciones | 55,6 | 50,1 (‑5,5) | 51,0 (‑4,6) |
| **Media** | **66,9** | **58,3 (‑8,6)** | **58,5 (‑8,4)** |

Throughput: ganancia frente al profesor sin comprimir, ambos servidos con vLLM 0.29 y DeepEP en paralelismo de expertos 32 sobre 4 nodos de 8 H100, con asignación equilibrada de expertos:

| Carga (entrada → salida) | Red | Peticiones por GPU | Ganancia BF16 | Ganancia FP8 |
|---|---|---|---|---|
| 128 → 1.024 | RDMA | 512 | +18,3% | +17,8% |
| 1.024 → 128 | RDMA | 512 | +38,3% | +23,2% |
| 4.096 → 256 | RDMA | 128 | **+32,5%** | +18,8% |
| 16.384 → 512 | RDMA | 32 | +21,8% | +12,3% |
| 4.096 → 256 | RDMA, enlace 2× más lento | 128 | +30,0% | +22,2% |
| 4.096 → 256 | RDMA, enlace 2,5× más lento | 128 | +56,1% | +31,0% |
| 4.096 → 256 | TCP | 8 | +108,7% | +199,8% |

La ganancia se reduce con lotes pequeños, hasta +7,6% para 4.096→256 con 8 peticiones por GPU. La reducción de bytes inter-nodo es del 67%.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos bf16 caben en una única GPU de 80 GB según la model card; el repositorio ocupa 53,2 GB.
- GPUs recomendadas: H100 de 80 GB para el despliegue con paralelismo de expertos (las medidas usan 4 nodos de 8 H100); una sola GPU de 80 GB basta para la carga en transformers.
- GPU de consumo: no se documenta soporte en GPUs de consumo; el tamaño de pesos en bf16 (≈53 GB) excede la VRAM de las tarjetas consumer habituales y no se ofrecen cuantizaciones GGUF.
- Opciones de despliegue: vLLM 0.21 con el plugin EchoMoE (un nodo de 8 GPUs mediante `scripts/install.sh vllm`); runtime de paralelismo de expertos del repositorio sobre vLLM 0.29 con DeepEP para multi-nodo; transformers 5.8.1 con código remoto en PyTorch plano sin paralelismo de expertos.
- Latencia y throughput: ganancias de throughput de hasta +32,5% en RDMA (4.096→256, 128 peticiones por GPU) y hasta +199,8% en TCP con FP8; no se publican cifras absolutas de latencia ni de tokens por segundo.
- Nota operativa: `--max-num-seqs 256` mantiene el arranque en pocos minutos, ya que la captura de CUDA graphs crece con las secuencias concurrentes y con el valor por defecto de vLLM supera la espera de 600 segundos del servidor de API.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión media (18 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoMoE-Qwen3-30B-A3B-s6-r256-c768 | 26,6 mil M (8 activos) | 32.768 | 58,3 | apache-2.0 | Hugging Face, código remoto |
| Qwen3-30B-A3B-SFT-EchoMoE-teacher (profesor) | 26,6 mil M (8 activos) | 32.768 | 66,9 | apache-2.0 (según modelo base) | Hugging Face |
| EchoMoE + FP8 (misma arquitectura) | 26,6 mil M (8 activos) | 32.768 | 58,5 | apache-2.0 | Hugging Face |
| Otras configuraciones EchoMoE de la colección | no disponible en detalle | no disponible | no disponible | apache-2.0 | Colección EchoMoE en Hugging Face |

La comparación relevante es interna: el propio profesor sin comprimir y la variante FP8. No se dispone en la información proporcionada de comparaciones con modelos externos de la misma categoría.

## Limitaciones y advertencias

- Pérdida de calidad sistemática: 8,6 puntos de media en 18 benchmarks frente al profesor, con el mayor deterioro en conocimiento y razonamiento (‑9,3) y código (‑8,8).
- Solo inglés: la model card declara únicamente `en`; no hay evidencia de capacidades multilingües.
- Contexto limitado a 32.768 tokens, inferior al de muchos modelos actuales de su clase.
- La ganancia de throughput depende fuertemente de la red y del tamaño de lote: se reduce a +7,6% con 8 peticiones por GPU en RDMA y desaparece en escenarios de lote pequeño; las cifras de +199,8% en TCP corresponden a un entorno muy específico.
- Requiere código remoto (`trust_remote_code=True`) y versiones concretas de software (vLLM 0.21 con plugin, vLLM 0.29 con DeepEP, transformers 5.8.1); la compatibilidad con otras versiones no está garantizada.
- El arranque en vLLM puede exceder el tiempo de espera por defecto si no se limita `--max-num-seqs`.
- No se documentan cuantizaciones GGUF ni soporte en GPUs de consumo, lo que restringe el despliegue a hardware de datacenter.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la degradación de conocimiento y razonamiento respecto al profesor.
- No se documentan evaluaciones de sesgo, seguridad ni alineación en la información disponible.
- Licencia apache-2.0 permite uso comercial, pero la pérdida de calidad y la dependencia de software específico deben evaluarse antes de llevarlo a producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r256-c768
- Paper: https://arxiv.org/abs/2611.22215
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Profesor: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Resultados de throughput: https://github.com/McGill-NLP/EchoMoE/blob/main/results/throughput/throughput.csv

# McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r256-c1024

## Resumen

EchoMoE-Qwen3-30B-A3B-s6-r256-c1024 es un checkpoint de investigación desarrollado por el grupo McGill-NLP que aplica la técnica EchoMoE sobre Qwen3-30B-A3B. El objetivo no es mejorar la calidad del modelo, sino reducir el coste de comunicación en inferencia distribuida con paralelismo de expertos (expert parallelism). La idea central es que, en lugar de transmitir entre nodos el estado oculto completo en cada capa, el modelo envía un código comprimido que representa la diferencia respecto a un estado de referencia que se refresca cada pocas capas.

El modelo parte de Qwen3-30B-A3B-Base (arquitectura MoE de 48 capas, 128 expertos con 8 activos, hidden size 2.048) y se destila desde un teacher afinado sobre datos de instrucciones Dolci. La configuración concreta de este checkpoint usa una referencia cada 6 capas (8 de 48), un código de dispatch de 256 dimensiones y un código de combine de 1.024 dimensiones. Según el autor, esto reduce un 61 % los bytes intercambiados entre nodos a cambio de una pérdida media de 6,3 puntos sobre 18 benchmarks respecto al teacher sin comprimir.

Es relevante ahora porque ataca un cuello de botella práctico del despliegue de modelos MoE grandes: el tráfico all-to-all entre GPUs cuando los expertos están repartidos entre nodos. El checkpoint es fundamentalmente una contribución de sistemas e investigación, no un modelo de producción generalista, y su licencia Apache 2.0 facilita la experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) con capa EchoMoE de compresión de activaciones para expert parallelism |
| Parámetros totales | 27.835.267.072 (~27,8 B) |
| Parámetros activos | 8 de 128 expertos por capa (el autor no publica el recuento exacto de parámetros activos) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | bf16 (pesos publicados); el autor reporta además una variante de evaluación "EchoMoE + FP8" para dispatch y combine |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con remote code (custom_code) para transformers |

## Arquitectura y entrenamiento

El modelo es un transformer MoE de 48 capas con 128 expertos por capa y 8 activos, hidden size 2.048, heredado de Qwen3-30B-A3B-Base. La modificación EchoMoE introduce un mecanismo de comunicación comprimida: cada pocas capas se establece un estado oculto de referencia y, en lugar de enviar el estado completo a través del all-to-all de expert parallelism, se transmite un código de baja dimensión que codifica la diferencia. En este checkpoint la referencia se refresca cada 6 capas (8 referencias en total), el código de dispatch tiene 256 dimensiones y el de combine 1.024 dimensiones.

El entrenamiento es una destilación desde el teacher McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher (el base afinado sobre Dolci-Instruct-SFT) sobre 4,3 mil millones de tokens, entrenando todos los pesos. Los datasets citados son allenai/Dolci-Instruct-SFT y allenai/dolma3_dolmino_mix-10B-1025. La innovación técnica es, por tanto, de sistemas: reducir el volumen de bytes inter-nodo en despliegues multi-GPU/multi-nodo manteniendo la topología MoE estándar, sin cambiar el enrutado de expertos.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con Qwen3.
- Razonamiento y conocimiento general, con un rendimiento degradado respecto al teacher (ver benchmarks).
- Matemáticas y generación de código, con pérdidas de 4,9 y 7,4 puntos respectivamente frente al teacher.
- Seguimiento de instrucciones, con una caída menor (3,0 puntos) que en otras áreas.
- Inferencia con paralelismo de expertos en vLLM 0.21 mediante plugin EchoMoE, y carga en transformers 5.8.1 con remote code.
- Modo de generación no-thinking de Qwen3 recomendado para chat (temperature 0,7, top_p 0,8, top_k 20, presence penalty 1,5 en vLLM).
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación en sistemas distribuidos: servir un MoE de ~28 B parámetros con expert parallelism reduciendo un 61 % el tráfico inter-nodo, útil para estudiar el equilibrio entre ancho de banda y calidad en clústeres con interconnect limitado.
- Despliegue multi-nodo con vLLM: el checkpoint se sirve con data-parallel-size 8 y expert-parallel en un nodo de 8 GPUs, lo que permite medir throughput real frente al teacher sin compresión.
- Evaluación comparativa de técnicas de compresión de activaciones: sirve como referencia reproducible (paper, código y colección de checkpoints) para contrastar EchoMoE con otras propuestas de compresión de comunicación.
- Prototipado de asistentes conversacionales en inglés: con contexto de 32.768 tokens y plantilla de chat Qwen3, es adecuado para experimentos de diálogo multi-turno donde el coste de infraestructura es la restricción principal.
- Generación de código en entornos de investigación: aunque pierde 7,4 puntos frente al teacher, sigue siendo utilizable para tareas de autocompletado y generación en pipelines internos donde no se requiere la máxima calidad.
- Docencia y reproducción de resultados: al estar bajo Apache 2.0 y con remote code incluido, permite reproducir los experimentos del paper en laboratorios académicos con hardware modesto (cabe en una GPU de 80 GB en bf16).
- Estudio de destilación con compresión: el par teacher/alumno permite analizar cuánta calidad se sacrifica al imponer un cuello de botella de comunicación durante el entrenamiento.

## Benchmarks y rendimiento

Promedio (%) sobre 18 benchmarks por dominio, con la variación respecto al teacher entre paréntesis, según el autor:

| Dominio | Teacher | EchoMoE | EchoMoE + FP8 |
|---|---|---|---|
| Conocimiento y razonamiento | 77,6 | 70,4 (−7,2) | 70,4 (−7,2) |
| Matemáticas | 50,7 | 45,8 (−4,9) | 46,5 (−4,2) |
| Código | 59,2 | 51,8 (−7,4) | 52,6 (−6,6) |
| Seguimiento de instrucciones | 55,6 | 52,6 (−3,0) | 50,5 (−5,1) |
| **Promedio** | **66,9** | **60,6 (−6,3)** | **60,7 (−6,2)** |

No se han publicado resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el autor remite al README del repositorio de GitHub para la lista completa de benchmarks.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 (~55,7 GB de repositorio) caben en una GPU de 80 GB según el autor; en cuantizaciones de 4 bits no se documentan pesos publicados, por lo que la VRAM sería aproximadamente 14-16 GB más overhead, pero no está verificado.
- GPU recomendadas: una A100/H100 de 80 GB para carga en transformers sin paralelismo; un nodo de 8 GPUs para el despliegue con expert parallelism en vLLM.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 (24 GB) en bf16; requeriría cuantización no publicada por el autor.
- Despliegue: vLLM 0.21 con plugin EchoMoE (recomendado, con `--data-parallel-size 8 --enable-expert-parallel --all2all-backend allgather_reducescatter --attention-backend FLASHINFER` y `--max-num-seqs 256` para limitar el tiempo de arranque por la captura de CUDA graphs); transformers 5.8.1 con `trust_remote_code=True`.
- Latencia y throughput: el autor reporta la reducción del 61 % en bytes inter-nodo, pero no publica cifras absolutas de latencia o tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EchoMoE-Qwen3-30B-A3B-s6-r256-c1024 | ~27,8 B (MoE, 8/128 activos) | 32.768 | Apache 2.0 | Compresión de activaciones para expert parallelism; −6,3 puntos medios frente a su teacher |
| Qwen3-30B-A3B-SFT-EchoMoE-teacher | ~27,8 B (MoE) | 32.768 (heredado) | Apache 2.0 | Teacher sin compresión; referencia de calidad (66,9 de media) |
| Qwen3-30B-A3B-Base | ~27,8 B (MoE) | 32.768 | Apache 2.0 | Modelo base original de Qwen, sin el ajuste Dolci ni EchoMoE |

La comparación con alternativas fuera de la familia Qwen3 no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad sistemática: −6,3 puntos de media sobre 18 benchmarks frente al teacher, con caídas de hasta 7,4 puntos en código y 7,2 en conocimiento y razonamiento.
- Solo inglés: la model card declara únicamente el idioma `en`; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Modelo de investigación: el objetivo es demostrar una técnica de sistemas, no ofrecer un modelo de producción generalista; el autor no documenta evaluaciones de seguridad, sesgos o robustez.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad o tasas de alucinación en la información disponible.
- Dependencia de software no estándar: requiere el plugin EchoMoE y versiones concretas (vLLM 0.21, transformers 5.8.1); el arranque en vLLM puede superar el tiempo de espera por defecto si no se limita `--max-num-seqs`.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ) en el repositorio, lo que limita el despliegue en hardware de consumo.
- Licencia Apache 2.0: permite uso comercial, pero al ser un checkpoint derivado de Qwen3 conviene revisar también las condiciones del modelo base original.
- Sin datos de tool calling, agentes, visión ni audio; no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r256-c1024
- Paper (arXiv): https://arxiv.org/abs/2611.22215
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Teacher: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Modelo base original: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Dataset de instrucciones: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Dataset de pretraining: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-10B-1025

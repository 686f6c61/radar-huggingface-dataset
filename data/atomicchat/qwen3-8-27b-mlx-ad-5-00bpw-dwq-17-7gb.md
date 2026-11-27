# AtomicChat/Qwen3.8-27B-MLX-AD-5.00bpw-DWQ-17.7GB

## Resumen

AtomicChat/Qwen3.8-27B-MLX-AD-5.00bpw-DWQ-17.7GB es una cuantización de 5,00 bits por peso del modelo multimodal Qwen/Qwen3.8-27B, publicada por AtomicChat para su ejecución con MLX sobre Apple Silicon. El repositorio empaqueta el modelo completo (torre de visión incluida) en un único `model.safetensors` de 17,74 GB, lo que permite ejecutar un modelo de 27.356 millones de parámetros en equipos con memoria unificada de gama alta. La propietaria del modelo original es Qwen (Alibaba), y esta variante conserva la licencia Apache 2.0.

El interés de esta ficha no está en el modelo base, sino en la técnica de cuantización: AtomicChat aplica un esquema de precisión mixta por tensor (denominado Atomic Dynamic) combinado con DWQ (Distillation-based Weight Quantization), un ajuste por destilación de escalas y offsets usando su propia conversión bf16 en MLX como profesor. El resultado declarado es una divergencia KL media de 0,031 frente al modelo bf16 y una coincidencia de top-1 del 91,5 % en texto reservado, cifras notablemente mejores que las de cuantizaciones uniformes de 4 bits (0,053 / 89,5 %).

Es relevante ahora porque demuestra que es posible mantener una fidelidad cercana al bf16 con un modelo multimodal de 27B en menos de 18 GB, un umbral que encaja con Mac con 32 GB o más de memoria unificada. La contrapartida es que las métricas se midieron en CUDA con mlx-lm/mlx-vlm, no en un Mac real, y la entrada de imagen no se probó en este archivo concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atención completa y atención lineal; tag de librería `qwen3_5` |
| Parametros totales | 27.356.728.560 (26,9B en el modelo de lenguaje + 0,46B en la torre de visión) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta por tensor de 5,00 bpw media: atención completa con K/V a 8 bits y Q/O a 6 bits; proyecciones de atención lineal a 5 bits, con `in_proj_a` e `in_proj_b` en bf16; MLP gate 4 bits (grupo 128), up 4 bits, down 5 bits (6 bits en 4 de los 64 bloques); embeddings y cabeza de salida 4 bits (grupo 128); grupo 64 salvo indicación; torre de visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), un único archivo de 17,74 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer con una combinación de capas de atención completa y capas de atención lineal, según se deduce del esquema de cuantización descrito en la model card (se tratan por separado las claves y valores de atención completa, las proyecciones de atención lineal y sus pequeños `in_proj_a`/`in_proj_b`). Incluye una torre de visión de 0,46B de parámetros que se mantiene en bf16 en esta conversión, lo que habilita la entrada de imágenes. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original.

El proceso de cuantización sí está documentado con detalle: se parte de la conversión bf16 propia del autor (AtomicChat/Qwen3.8-27B-MLX-bf16), se asigna a cada tensor su propio número de bits y tamaño de grupo, se realiza una búsqueda de clipping para el rango de cuantización de cada grupo y, finalmente, se aplica DWQ, que ajusta escalas y offsets por destilación tomando como profesor la build MLX de 8 bits. El entrenamiento de destilación es corto: una a dos horas en una sola GPU. La evaluación se realizó con mlx-lm 0.31.3 y mlx-vlm 0.6.15 sobre 1x H200 NVL, con 24 fragmentos de 4096 tokens de texto neutral reservado, puntuando la segunda mitad de cada fragmento.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicable vía `tokenizer.apply_chat_template`.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), con la torre de visión conservada en bf16.
- Razonamiento y generación de código: capacidades heredadas del modelo base Qwen3.8-27B, si bien no se documentan evaluaciones específicas en esta ficha.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara lista de idiomas.
- Modo thinking explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente local en Mac con memoria unificada de 32 GB o más: el archivo de 17,74 GB permite cargar el modelo completo en mlx-lm y mantener conversaciones multi-turno sin conexión, con la ventaja de privacidad que implica no enviar datos a un servicio externo.
- Análisis de documentos con imágenes en escritorio: al conservar la torre de visión en bf16, el modelo puede procesar capturas, diagramas o páginas escaneadas junto a instrucciones textuales mediante mlx-vlm, integrándose en flujos de extracción de información locales.
- Prototipado rápido de aplicaciones multimodales en Apple Silicon: el formato MLX y la API de mlx-lm/mlx-vlm permiten iterar sobre prompts y plantillas de chat con un coste de infraestructura nulo más allá del propio equipo.
- Evaluación de técnicas de cuantización: con una KLD de 0,031 y un 91,5 % de coincidencia top-1 frente a bf16, este repositorio sirve como referencia para comparar esquemas de cuantización mixta en modelos multimodales de 27B.
- Generación de código asistida en entorno local: para desarrolladores que trabajan con código sensible y prefieren un modelo autoalojado en lugar de una API, siempre que se validen previamente las capacidades reales del modelo base en esta tarea.
- Investigación sobre destilación aplicada a cuantización: el pipeline descrito (clipping search por grupo más DWQ con profesor de 8 bits) es reproducible en una sola GPU en una o dos horas, lo que lo hace útil como caso de estudio metodológico.
- Despliegue de demos offline en ferias o entornos air-gapped: un único archivo safetensors de menos de 18 GB simplifica la distribución y el arranque del modelo sin dependencias de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente a su conversión bf16:

| Repositorio | Esquema | Bits por peso | En disco | KLD media | Mismo top-1 |
|---|---|---:|---:|---:|---:|
| AD-3.50bpw-DWQ-12.7GB | uniforme 3 bits | 3,50 | 12,69 GB | 0,215 | 79,6 % |
| AD-3.70bpw-DWQ-13.4GB | mlx-lm `mixed_3_4` | 3,70 | 13,37 GB | 0,166 | 82,4 % |
| AD-3.80bpw-DWQ-13.7GB | por tensor, propio | 3,80 | 13,69 GB | 0,148 | 82,3 % |
| AD-4.50bpw-DWQ-16.0GB | uniforme 4 bits | 4,50 | 16,05 GB | 0,053 | 89,5 % |
| **AD-5.00bpw-DWQ-17.7GB** (este) | por tensor, propio | **5,00** | **17,74 GB** | **0,031** | **91,5 %** |

Como referencia adicional, el autor indica que conversiones simples de 3 y 4 bits (grupo 64, sin búsqueda de clipping ni DWQ) midieron 0,223 / 78,5 % y 0,056 / 89,1 % respectivamente en el mismo banco de pruebas. Estas cifras son de MLX y no son comparables con las de la model card GGUF del mismo autor, ya que llama.cpp tokeniza y agrupa el texto de forma distinta.

## Requisitos de hardware

- VRAM/memoria estimada: 17,74 GB solo para los pesos; hay que añadir la caché KV y el overhead del runtime. En la práctica requiere un equipo con 24 GB de memoria unificada como mínimo y 32 GB o más para contexto largo.
- GPU recomendadas: la evaluación del autor se realizó en 1x H200 NVL (entorno CUDA con MLX). Para el uso previsto, Apple Silicon de gama alta (M-series Pro/Max/Ultra).
- Compatibilidad con GPU de consumo: no está pensado para GPU NVIDIA de consumo; el formato es MLX, no CUDA nativo.
- Opciones de despliegue: mlx-lm (texto) y mlx-vlm (imagen), con `pip install mlx-lm` / `pip install mlx-vlm`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este repositorio concreto; existe una variante GGUF separada del mismo autor.
- Latencia y throughput: no disponibles. El autor advierte explícitamente de que no tiene registrada ninguna ejecución en Mac de este archivo y de que la entrada de imagen no se probó en él.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Qwen3.8-27B MLX AD-5.00bpw-DWQ) | 27,36B | no disponible | 5,00 bpw, 17,74 GB | apache-2.0 | Hugging Face, 203 descargas |
| AtomicChat/Qwen3.8-27B-MLX-AD-4.50bpw-DWQ-16.0GB | 27,36B | no disponible | 4,50 bpw, 16,05 GB | apache-2.0 | Hugging Face |
| AtomicChat/Qwen3.8-27B-MLX-bf16 | 27,36B | no disponible | bf16 | apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B | 27,36B (según derivados) | no disponible | pesos originales | apache-2.0 | Hugging Face |

La comparación relevante es interna a la familia del autor: frente a la variante de 4,50 bpw, este archivo gana 0,022 de KLD y 2 puntos de coincidencia top-1 a cambio de 1,69 GB adicionales. Frente a la bf16, la pérdida es de 0,031 de KLD y el 8,5 % de los tokens siguientes difieren. No se dispone de datos para comparar con alternativas de otros autores en la misma categoría.

## Limitaciones y advertencias

- Las métricas de fidelidad se midieron en CUDA (1x H200 NVL) con mlx-lm/mlx-vlm; el autor no tiene registrada ninguna ejecución en Mac de este archivo concreto.
- La entrada de imagen no fue probada en este repositorio, pese a que la torre de visión se conserva en bf16.
- KLD y top-1 se calculan sobre un único conjunto de texto reservado y no miden calidad conversacional, uso de herramientas ni contexto largo.
- Riesgo de alucinación: inherente al modelo base; no se documentan evaluaciones específicas ni mitigaciones en esta conversión.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base Qwen3.8-27B.
- Idiomas: el autor no declara lista de idiomas soportados, por lo que no puede garantizarse un rendimiento uniforme fuera de los idiomas del modelo original.
- Licencia Apache 2.0, igual que el original, lo que permite uso comercial; aun así, conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B por si hubiera términos adicionales.
- El formato es exclusivamente MLX: no es directamente utilizable en CUDA, ROCm ni en runtimes tipo vLLM o llama.cpp.
- Solo 203 descargas y 0 likes en el momento de la consulta: adopción muy limitada, sin validación independiente de las cifras del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-5.00bpw-DWQ-17.7GB
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversión bf16 del autor: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-bf16
- Variante 4,50 bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-4.50bpw-DWQ-16.0GB
- Variante 3,80 bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-3.80bpw-DWQ-13.7GB
- Variante 3,70 bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-3.70bpw-DWQ-13.4GB
- Variante 3,50 bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-3.50bpw-DWQ-12.7GB
- Variante GGUF: https://huggingface.co/AtomicChat/Qwen3.8-27B-GGUF
- Log de KLD: https://huggingface.co/datasets/AtomicChat/Qwen3.8-27B-MLX-metrics/blob/main/logs/kld-Qwen3.8-27B-MLX-AD-17.5c-DWQ.json
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X: https://x.com/atomic_chat_hq

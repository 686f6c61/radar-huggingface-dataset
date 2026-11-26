# FKZWT/Ternary-Bonsai-2.5-27B-GGUF

## Resumen

Ternary Bonsai 2.5 27B es un modelo de lenguaje de 27.360 millones de parámetros publicado por Prism ML (repositorio en Hugging Face bajo el identificador FKZWT/Ternary-Bonsai-2.5-27B-GGUF) que aplica una cuantización ternaria extrema de 1,76 bits por peso sobre el modelo base Qwen3.8-27B. El resultado ocupa 5,93 GB frente a los 53,8 GB de la versión FP16, es decir, unas nueve veces menos, manteniendo la arquitectura de atención híbrida del modelo original. La versión 2.5 es la iteración orientada a agentes y uso de herramientas de la línea Bonsai 27B, y su objetivo declarado es ser el modelo agéntico más potente por debajo de 10 GB.

El problema que resuelve es el despliegue de un modelo de 27B en hardware de consumo y en el borde, sin renunciar a capacidades de tool calling de nivel FP16. Según la documentación del autor, promedia 77,2 en cinco benchmarks de tool calling frente a 77,7 del modelo FP16, y alcanza el 90 % del rendimiento FP16 en codificación agéntica. Incorpora variantes con cabeza de predicción multi-token (MTP) para decodificación especulativa, que acelera la decodificación entre 1,5 y 1,8 veces en GPUs NVIDIA, y llega a unos 300 tokens por segundo en H200 y B200.

Es relevante ahora porque demuestra que una representación de pesos ternaria, con rotación de Hadamard por bloques y escalas FP16 por grupo de 128 pesos, puede conservar el comportamiento agéntico de un modelo de 27B en menos de 6 GB, ejecutándose en llama.cpp estándar (variante Q2_0) y en forks con kernels de bajo bit para CUDA, Metal, SYCL y MLX. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal de atención híbrida (~75 % lineal / ~25 % atención completa), SwiGLU MLP, RoPE, RMSNorm |
| Parámetros totales | 27,36B (24,35B de lenguaje en 64 bloques + 0,47B de torre de visión en 27 bloques + 2,54B de embeddings y lm-head); 26.895.998.464 según safetensors |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantización | Ternaria g128 (1,76 bits por peso); packs GGUF PTQ1_0 y PQ2_0, más Q2_0 para llama.cpp estándar |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos ternarios con escala FP16 por grupo de 128 en base rotada de Hadamard |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.8-27B: un transformer causal con atención híbrida en el que aproximadamente el 75 % de las capas usan atención lineal y el 25 % restante atención completa, con MLP SwiGLU, RoPE y RMSNorm. La torre de visión de 27 bloques y 0,47B de parámetros forma parte del cómputo total, aunque la ficha del repositorio se etiqueta como text-generation. Los pesos liberados son exactamente ternarios: cada peso toma un valor de {−1, 0, +1} con un único factor de escala FP16 compartido por cada grupo de 128 pesos, lo que da log₂3 ≈ 1,585 bits de información por peso y 1,76 bits efectivos contando la escala.

La innovación técnica central es el almacenamiento en base rotada: cada matriz se transforma por bloques mediante una rotación ortogonal de Hadamard antes de la asignación ternaria, y el runtime aplica la transformación correspondiente a las activaciones. La rotación se pliega en los pesos en el proceso offline, por lo que no añade bits ni tráfico extra de pesos. Las variantes MTP incorporan una cabeza de predicción multi-token que actúa como modelo borrador para decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. El modelo expone dos niveles de esfuerzo de razonamiento: `xhigh` (por defecto, el más preciso) y `medium`.

## Capacidades

- Generación de texto conversacional y razonamiento con dos niveles de esfuerzo configurables (`xhigh` y `medium`).
- Tool calling y function calling de nivel FP16 según el autor: 77,2 de media en τ²-Bench, τ³-Bench, BFCL v3, BFCL v4 y AppWorld.
- Trabajo agéntico de horizonte largo, incluida codificación agéntica en Terminal-Bench 2.1, SWE-bench Verified y DeepSWE.
- Decodificación especulativa mediante cabeza MTP en las variantes correspondientes, con aceleración de 1,5 a 1,8 veces en GPUs NVIDIA.
- Ejecución en llama.cpp (CUDA, Metal, CPU, SYCL) y MLX (Python y Swift), incluida la variante Q2_0 en llama.cpp estándar.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión: la arquitectura incluye torre de visión, pero no se detalla su comportamiento en la información disponible.

## Casos de uso

- Atención al cliente automatizada en el borde: con 262K tokens de contexto y 5,93 GB de pesos, el modelo puede mantener conversaciones multi-turno con historiales largos en un servidor pequeño o incluso en una estación de trabajo, sin depender de APIs externas.
- Agentes de codificación en pipelines de CI/CD: su rendimiento en SWE-bench Verified (75,6) y Terminal-Bench 2.1 (60,1) permite integrarlo como agente que lee repositorios, ejecuta comandos y aplica parches dentro de un flujo automatizado de revisión.
- Automatización de escritorio y tareas de sistema: la puntuación en AppWorld y su soporte de tool calling lo hacen adecuado para agentes que invocan APIs y manipulan aplicaciones en entornos controlados.
- Asistentes locales en portátiles y equipos de consumo: el tamaño de 5,93 GB cabe en GPUs de consumo con 8 GB o más, lo que habilita asistentes privados sin conexión con llama.cpp u Ollama.
- Procesamiento de documentos extensos: la ventana de 262K tokens permite resumir, extraer y razonar sobre contratos, informes o bases de código completas en una sola pasada.
- Servicio de inferencia de alto rendimiento: con las variantes MTP y los kernels de bajo bit, alcanza unos 300 tokens/s en H200 y B200, adecuado para backends con muchos usuarios concurrentes en vLLM o llama.cpp server.
- Despliegue en Apple Silicon e iOS/macOS: los forks de MLX y mlx-swift permiten ejecutar el modelo en Mac y en dispositivos Apple con aceleración nativa.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card y el whitepaper:

| Benchmark | Ternary Bonsai 2.5 27B | Referencia FP16 (Qwen3.8-27B) |
|---|---|---|
| Media tool calling (τ²-Bench, τ³-Bench, BFCL v3, BFCL v4, AppWorld) | 77,2 | 77,7 |
| SWE-bench Verified | 75,6 | No disponible |
| Terminal-Bench 2.1 | 60,1 | No disponible |
| DeepSWE | 27,0 | No disponible |
| Media general (5 categorías, 16 benchmarks) | 82,1 | 84,3 |
| Codificación agéntica (% respecto a FP16) | 90 % | 100 % |
| Tool calling frente a GSQ-RCO IQ3_XXS (1,7× mayor) | 77,2 | 75,3 (GSQ-RCO) |
| Codificación frente a GSQ-RCO IQ3_XXS | 54,2 | 55,5 (GSQ-RCO) |

Rendimiento de decodificación: 1,5 a 1,8 veces más rápido con MTP en GPUs NVIDIA, 2,3 a 3,0 veces más rápido que en el lanzamiento de Bonsai 2 en seis de las siete GPUs NVIDIA medidas, y aproximadamente 300 tokens/s en H200 y B200.

## Requisitos de hardware

- VRAM estimada: 5,93 GB para los pesos en formato PTQ1_0; el repositorio completo ocupa 44,1 GB por incluir varias variantes y packs.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más de VRAM (RTX 3060 Ti, 4060 Ti, 4070, 4080, 4090), con margen para caché KV según la longitud de contexto.
- GPUs de centro de datos recomendadas: H200 y B200 para máximo throughput (unos 300 tokens/s), A100 y H100 para servicio concurrente.
- Backends de despliegue: llama.cpp (CUDA, Metal, CPU, SYCL), llama.cpp server, MLX (Python y Swift), mlx-swift para iOS/macOS; el formato Q2_0 funciona en llama.cpp estándar y PTQ1_0 está en revisión upstream.
- Latencia y throughput: 1,5 a 1,8 veces de aceleración con MTP en NVIDIA; 2,3 a 3,0 veces más rápido que Bonsai 2 en seis de siete GPUs medidas.
- Apple Silicon: soportado mediante los forks de MLX y mlx-swift.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling (media) | Codificación agéntica | Licencia | Tamaño de pesos |
|---|---|---|---|---|---|---|
| Ternary Bonsai 2.5 27B | 27,36B | 262K | 77,2 | 54,2 (media) | Apache 2.0 | 5,93 GB |
| GSQ-RCO IQ3_XXS (Qwen3.8-27B) | 27B aprox. | No disponible | 75,3 | 55,5 | No disponible | ~10 GB (1,7× mayor) |
| Qwen3.8-27B FP16 | 27,36B | 262K | 77,7 | No disponible | No disponible | 53,8 GB |
| Bonsai 2 27B | 27B aprox. | No disponible | No disponible | 63 % de FP16 | Apache 2.0 | No disponible |

## Limitaciones y advertencias

- La cuantización ternaria introduce una pérdida medible: 82,1 frente a 84,3 en la media general de 16 benchmarks y un 90 % del rendimiento FP16 en codificación agéntica, no el 100 %.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad sobre los resultados declarados.
- El formato PTQ1_0 depende de forks de llama.cpp y MLX; solo Q2_0 funciona en llama.cpp estándar, lo que limita la portabilidad inmediata.
- No se especifican los idiomas soportados ni la composición del dataset de entrenamiento, lo que impide evaluar sesgos lingüísticos o culturales.
- Riesgo de alucinación inherente a los modelos de 27B, agravado por la cuantización agresiva en tareas de razonamiento profundo.
- La ventana de 262K tokens exige gestionar la caché KV, que puede superar la VRAM disponible en GPUs de consumo con contextos muy largos.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B para usos comerciales específicos.
- La torre de visión está presente en la arquitectura, pero no se documentan sus capacidades ni su evaluación en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/FKZWT/Ternary-Bonsai-2.5-27B-GGUF
- Web de Prism ML: https://prismml.com
- Whitepaper de Bonsai 2.5 27B: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-5-27b-whitepaper.pdf
- Whitepaper de Bonsai 2 27B (formato ternario): https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con kernels de bajo bit: https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX: https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift: https://github.com/PrismML-Eng/mlx-swift
- Discord: https://discord.gg/prismml

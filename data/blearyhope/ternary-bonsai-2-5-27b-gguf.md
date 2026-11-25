# blearyhope/Ternary-Bonsai-2.5-27B-GGUF

## Resumen

Ternary Bonsai 2.5 27B es un modelo de lenguaje de 27.360 millones de parámetros publicado por Prism ML (distribuido en Hugging Face por el usuario `blearyhope`) en formato GGUF con pesos ternarios de 1,76 bits por peso. Deriva del modelo base Qwen/Qwen3.8-27B, del que conserva la arquitectura de atención híbrida, y está específicamente orientado a tareas agénticas y de uso de herramientas (*tool calling*). Su propuesta central es ofrecer un rendimiento en *tool calling* prácticamente idéntico al del modelo en FP16 (77,2 frente a 77,7 de media en cinco benchmarks) ocupando aproximadamente una novena parte del espacio: 5,93 GB frente a 53,8 GB.

La relevancia del modelo reside en su combinación de compresión extrema y capacidades agénticas: es, según el autor, el modelo agéntico más potente por debajo de 10 GB en sus comparativas, y mantiene un 82,1 de media en capacidades generales frente al 84,3 del FP16. Incorpora variantes con cabeza de predicción multi-token (MTP) para decodificación especulativa, que aceleran la decodificación entre 1,5 y 1,8 veces en GPUs NVIDIA, y llega a unos 300 tokens/s en H200 y B200 según las mediciones del autor.

El modelo se ejecuta sobre llama.cpp estándar (los ficheros `Q2_0` funcionan en el upstream; `PTQ1_0` está en revisión) y dispone de forks propios con kernels de bajo bit para CUDA, Metal y MLX. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención híbrida (~75% lineal / ~25% atención completa), SwiGLU MLP, RoPE, RMSNorm |
| Parámetros totales | 27,36B (24,35B de lenguaje en 64 bloques + 0,47B de torre de visión en 27 bloques + 2,54B de embedding/lm-head) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantización | Ternario g128 (escala FP16 por grupo de 128 pesos) en base Hadamard por bloques, 1,76 bits por peso; empaquetados GGUF `PTQ1_0` y `PQ2_0`, más `Q2_0` para llama.cpp estándar |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); también soporte MLX en los forks del autor |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3.8-27B: un transformer causal con atención híbrida en el que aproximadamente el 75% de las capas emplean atención lineal y el 25% restante atención completa, con MLP SwiGLU, normalización RMSNorm y codificación posicional RoPE. La torre de visión (0,47B de parámetros en 27 bloques) se mantiene del modelo base, lo que sugiere capacidades multimodales heredadas, aunque la model card no detalla su funcionamiento en esta versión.

La innovación técnica principal es el formato de pesos ternario: cada peso toma un valor de {−1, 0, +1} con un único factor de escala FP16 compartido por cada grupo de 128 pesos, lo que supone log₂3 ≈ 1,585 bits de información por peso. Antes de la asignación ternaria, cada matriz se transforma por bloques mediante una rotación ortogonal de Hadamard, y el runtime aplica la transformación correspondiente a las activaciones; la rotación se pliega en los pesos almacenados en un proceso offline, por lo que no añade bits ni tráfico adicional de pesos. El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

Las variantes MTP incorporan una cabeza de predicción multi-token que actúa como modelo borrador para decodificación especulativa, con una aceleración de decodificación de 1,5 a 1,8 veces en GPUs NVIDIA. El modelo admite dos niveles de esfuerzo de razonamiento: `xhigh` (por defecto, el más preciso) y `medium`.

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de hasta 262K tokens.
- *Tool calling* y *function calling* de nivel FP16: media de 77,2 en τ²-Bench, τ³-Bench, BFCL v3, BFCL v4 y AppWorld, frente a 77,7 del modelo en FP16.
- Razonamiento agéntico de horizonte largo y ejecución de tareas multi-paso, con resultados destacados en Terminal-Bench 2.1 (60,1), SWE-bench Verified (75,6) y DeepSWE (27,0).
- Generación y edición de código en contextos agénticos, con un 90% del rendimiento del FP16 en codificación agéntica.
- Decodificación especulativa mediante cabeza MTP en las variantes correspondientes.
- Dos modos de esfuerzo de razonamiento (`xhigh` y `medium`) para ajustar precisión y coste.
- Capacidades multimodales potenciales heredadas de la torre de visión del modelo base (no detalladas en la model card).
- Despliegue en llama.cpp (CUDA, Metal, CPU, SYCL) y MLX (Python, Swift), incluidos dispositivos Apple.

## Casos de uso

- Agentes autónomos de resolución de incidencias en repositorios: con 75,6 en SWE-bench Verified y 60,1 en Terminal-Bench 2.1, el modelo puede integrarse en pipelines que reciben un *issue*, localizan el código relevante, aplican parches y ejecutan pruebas en terminal dentro de un bucle agéntico.
- Asistentes de atención al cliente con *tool calling*: la ventana de 262K tokens permite mantener conversaciones largas con historial completo y llamar a APIs de consulta de pedidos, devoluciones o facturación con una fiabilidad de *tool calling* equivalente al FP16.
- Ejecución local en portátiles y estaciones de trabajo: con 5,93 GB en `PTQ1_0`, el modelo cabe en GPUs de consumo y en Apple Silicon vía Metal o MLX, lo que habilita asistentes de código privados sin conexión a servicios externos.
- Automatización de tareas de escritorio y navegador: los resultados en AppWorld y BFCL v4 lo hacen adecuado para agentes que operan interfaces y APIs en entornos controlados, con pasos multi-paso y verificación de resultados.
- Servidores de inferencia de alto rendimiento: las variantes MTP alcanzan unos 300 tokens/s en H200 y B200 según el autor, lo que permite servir agentes concurrentes con decodificación especulativa en llama.cpp o en los forks con kernels CUDA.
- Prototipado y evaluación de agentes en investigación: el formato ternario y los empaquetados GGUF facilitan experimentar con modelos de 27B en hardware modesto, comparando el efecto de la cuantización extrema sobre tareas agénticas frente al FP16.
- Despliegue en dispositivos móviles y macOS/iOS: los forks de MLX y mlx-swift permiten ejecutar el modelo en Apple Silicon y en iOS/macOS, útil para asistentes integrados en aplicaciones nativas.

## Benchmarks y rendimiento

| Benchmark | Ternary Bonsai 2.5 27B | Qwen3.8-27B FP16 | GSQ-RCO IQ3_XXS |
|---|---|---|---|
| Media *tool calling* (τ²-Bench, τ³-Bench, BFCL v3, BFCL v4, AppWorld) | 77,2 | 77,7 | 75,3 |
| Media capacidades generales (16 benchmarks, 5 categorías) | 82,1 | 84,3 | No disponible |
| SWE-bench Verified | 75,6 | 60,8 (Bonsai 2) | No disponible |
| Terminal-Bench 2.1 | 60,1 | 52,8 (Bonsai 2) | No disponible |
| DeepSWE | 27,0 | 0 (Bonsai 2) | No disponible |
| Codificación agéntica (media) | 90% del FP16 | 100% | 54,2 (frente a 55,5 de Bonsai 2.5) |

Las cifras de la columna FP16 corresponden al modelo base Qwen3.8-27B según la model card; las de Bonsai 2 se incluyen como referencia de la generación anterior. El autor reporta además una decodificación de 2,3 a 3,0 veces más rápida que en el lanzamiento de Bonsai 2 en seis de las siete GPUs NVIDIA medidas, y alrededor de 300 tokens/s en H200 y B200 con MTP.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,93 GB para el empaquetado `PTQ1_0` (1,76 bits por peso); el repositorio completo ocupa 44,1 GB, por lo que conviene descargar solo el fichero GGUF necesario.
- GPUs recomendadas: H200 y B200 para máximo rendimiento (~300 tokens/s con MTP); A100 y GPUs NVIDIA de gama alta para servir agentes concurrentes; el autor mide siete GPUs NVIDIA en el whitepaper.
- GPU de consumo: sí cabe en GPUs consumer con al menos 8 GB de VRAM efectiva, dado el tamaño de 5,93 GB del empaquetado ternario, más el espacio para caché KV con contexto largo.
- Apple Silicon: soporte vía Metal en llama.cpp y vía MLX (Python y Swift), incluido mlx-swift para iOS/macOS.
- Opciones de despliegue: llama.cpp estándar (ficheros `Q2_0`), fork de llama.cpp de Prism ML con kernels CUDA y Metal (`PTQ1_0`, en revisión upstream), fork de MLX y mlx-swift; backend SYCL para Intel.
- Latencia y throughput: 1,5 a 1,8 veces de aceleración con MTP en GPUs NVIDIA; ~300 tokens/s en H200 y B200; el resto de mediciones por GPU están en el whitepaper del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling (media) | Codificación agéntica | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary Bonsai 2.5 27B | 27,36B (1,76 bits/peso, 5,93 GB) | 262K | 77,2 | 90% del FP16 | Apache 2.0 | GGUF en HF, llama.cpp y MLX |
| Qwen3.8-27B FP16 (base) | 27,36B (FP16, 53,8 GB) | 262K | 77,7 | 100% | Según modelo base | Disponible en HF |
| GSQ-RCO IQ3_XXS | No disponible (1,7× mayor que Bonsai 2.5) | No disponible | 75,3 | 54,2 | No disponible | GGUF |
| Bonsai 2 27B (generación anterior) | 27B (ternario) | No disponible | No disponible | 63% del FP16 | Apache 2.0 | GGUF en HF |

## Limitaciones y advertencias

- La cuantización ternaria introduce una pérdida medible en capacidades generales: 82,1 frente a 84,3 del FP16 en la media de 16 benchmarks, y un 10% de caída en codificación agéntica.
- El modelo está optimizado para tareas agénticas y de *tool calling*; su comportamiento en otras tareas puede degradarse más que la media reportada.
- No se detallan los idiomas soportados en la información disponible, por lo que no puede confirmarse un rendimiento multilingüe uniforme.
- Riesgo de alucinación inherente a los modelos de lenguaje; en entornos agénticos, una llamada a herramienta incorrecta puede propagarse a lo largo de varios pasos, por lo que se recomienda validación externa.
- Los sesgos del modelo base Qwen3.8-27B se heredan y no se documentan en la model card.
- El empaquetado `PTQ1_0` requiere el fork de llama.cpp de Prism ML y está pendiente de revisión en el upstream; solo `Q2_0` funciona en llama.cpp estándar.
- El repositorio no registra descargas ni interacciones, y la fecha de creación es muy reciente, por lo que no hay validación independiente de los resultados reportados por el autor.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B por si impusieran restricciones adicionales.
- El contexto de 262K tokens exige planificación de memoria para la caché KV, especialmente en GPUs de consumo.

## Enlaces

- [Hugging Face: blearyhope/Ternary-Bonsai-2.5-27B-GGUF](https://huggingface.co/blearyhope/Ternary-Bonsai-2.5-27B-GGUF)
- [Web de Prism ML](https://prismml.com)
- [Whitepaper de Bonsai 2.5 27B](https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-5-27b-whitepaper.pdf)
- [Whitepaper de Bonsai 2 27B](https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf)
- [Demo y ejemplos (Bonsai-demo)](https://github.com/PrismML-Eng/Bonsai-demo)
- [Fork de llama.cpp con kernels de bajo bit](https://github.com/PrismML-Eng/llama.cpp)
- [Fork de MLX](https://github.com/PrismML-Eng/mlx)
- [Fork de mlx-swift](https://github.com/PrismML-Eng/mlx-swift)
- [Discord de Prism ML](https://discord.gg/prismml)

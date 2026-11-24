# prism-ml/Ternary-Bonsai-2.5-27B-GGUF

## Resumen

Ternary Bonsai 2.5 27B es un modelo de lenguaje causal de 27 360 millones de parámetros publicado por Prism ML, derivado de Qwen3.8-27B y cuantizado en un formato ternario propio (pesos en {−1, 0, +1} con una escala FP16 compartida por grupo de 128 pesos, equivalente a 1,76 bits por peso). Su objetivo es hacer viable el trabajo agéntico de largo horizonte en hardware de consumo: ocupa 5,93 GB frente a los 53,8 GB del modelo FP16, lo que supone una reducción de aproximadamente 9×.

La relevancia de esta entrega, etiquetada como 2.5, radica en que mantiene la arquitectura de atención híbrida del modelo base (aproximadamente 75 % de atención lineal y 25 % de atención completa, con SwiGLU, RoPE y RMSNorm), una ventana de contexto de 262 144 tokens y un módulo de visión de 27 bloques (0,47 B de parámetros), pero reorienta el ajuste hacia tareas de uso de herramientas y razonamiento multi-paso. Según el autor, el modelo alcanza un rendimiento en tool calling prácticamente idéntico al FP16 (77,2 frente a 77,7 de media en cinco benchmarks) y conserva el 90 % de la capacidad de codificación agéntica del modelo completo.

El modelo se distribuye en formato GGUF para llama.cpp (CUDA, Metal, CPU, SYCL) y cuenta con variantes MTP que incorporan una cabeza de predicción multi-token para decodificación especulativa, con aceleraciones de decodificación de 1,5–1,8× en GPUs NVIDIA. La licencia es Apache 2.0 y el repositorio ocupa 44,1 GB, incluyendo los distintos empaquetados de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención híbrida (~75 % lineal / ~25 % completa), SwiGLU MLP, RoPE, RMSNorm |
| Parámetros totales | 27,36 B (24,35 B de lenguaje en 64 bloques + 0,47 B de torre de visión en 27 bloques + 2,54 B de embeddings y lm-head); 26 895 998 464 según safetensors |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantización | Ternario g128 (PTQ1_0, 1,76 bits/peso, 5,93 GB), PQ2_0 y Q2_0 para llama.cpp estándar |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (packs PTQ1_0, PQ2_0 y Q2_0); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer causal de 27 B con atención híbrida: aproximadamente tres cuartas partes de las capas emplean atención lineal y el resto atención completa, lo que reduce el coste computacional del contexto largo manteniendo la capacidad de recuperación global. La representación de pesos es ternaria en formato g128: cada peso toma un valor en {−1, 0, +1} con un único factor de escala FP16 por grupo de 128 pesos, lo que da 1,585 bits de información por peso y 1,76 bits efectivos almacenados. Antes de la asignación ternaria, cada matriz se transforma mediante una rotación ortogonal de Hadamard por bloques; la rotación se pliega en los pesos almacenados en el proceso offline y el runtime aplica la transformación correspondiente a las activaciones, de modo que no añade bits ni tráfico de pesos adicional.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El autor sí especifica dos niveles de esfuerzo de razonamiento (`xhigh`, por defecto y más preciso, y `medium`) y que las variantes MTP incorporan una cabeza de predicción multi-token que actúa como modelo borrador para decodificación especulativa, con un incremento de velocidad de decodificación de 1,5–1,8× en GPUs NVIDIA. Los kernels de bajo bit se distribuyen en forks propios de llama.cpp (CUDA y Metal), MLX (Python) y mlx-swift (iOS/macOS); los ficheros `Q2_0` funcionan en llama.cpp upstream y `PTQ1_0` está en revisión upstream.

## Capacidades

- Generación de texto conversacional y razonamiento con dos niveles de esfuerzo configurables (`xhigh` y `medium`).
- Tool calling y function calling de nivel FP16 según el autor: media de 77,2 en τ²-Bench, τ³-Bench, BFCL v3, BFCL v4 y AppWorld, frente a 77,7 del modelo FP16.
- Trabajo agéntico de largo horizonte: codificación agéntica (Terminal-Bench 2.1, SWE-bench Verified, DeepSWE) y uso de herramientas en entornos reales (AppWorld).
- Razonamiento multi-paso y planificación con uso de herramientas encadenadas.
- Capacidades de visión mediante la torre de 27 bloques (0,47 B de parámetros) heredada del modelo base; no se detallan en la información disponible las tareas visuales concretas evaluadas.
- Decodificación especulativa mediante cabeza MTP en las variantes correspondientes.
- Capacidades multilingües: no disponible en la información proporcionada.
- Despliegue en llama.cpp (CUDA, Metal, CPU, SYCL) y MLX (Python y Swift), con compatibilidad con endpoints.

## Casos de uso

- Agentes de codificación en producción: el modelo puede resolver tareas de reparación de issues y modificación de repositorios (75,6 en SWE-bench Verified, 60,1 en Terminal-Bench 2.1) ejecutándose en una sola GPU de consumo gracias a sus 5,93 GB, lo que permite integrarlo en pipelines de CI/CD o en estaciones de trabajo de desarrolladores sin acceso a clústeres.
- Automatización de atención al cliente con herramientas: la ventana de 262 144 tokens permite mantener conversaciones multi-turno con historial extenso y documentación de producto adjunta, mientras el tool calling de nivel FP16 habilita consultas a sistemas de pedidos, CRM o bases de conocimiento dentro del mismo diálogo.
- Orquestación de agentes multi-paso: con 77,2 de media en benchmarks de tool calling (BFCL v3/v4, τ²-Bench, τ³-Bench), el modelo es adecuado como planificador central que decide qué herramienta invocar en cada paso de un flujo agéntico.
- Asistente de escritorio o dispositivo local: los 5,93 GB en formato ternario caben en GPUs de consumo y en Apple Silicon vía MLX, lo que permite desplegar un asistente con acceso a ficheros, terminal y aplicaciones locales sin enviar datos a la nube.
- Procesamiento de documentos largos con extracción estructurada: la combinación de contexto de 262K tokens y salida con formato de herramienta permite procesar contratos, informes o expedientes completos y devolver campos estructurados mediante function calling.
- Evaluación y prototipado de agentes en investigación: las variantes MTP con decodificación especulativa (1,5–1,8× más rápida en NVIDIA, hasta ~300 tokens/s en H200 y B200) reducen el coste de barridos experimentales sobre tareas de Terminal-Bench o AppWorld.
- Análisis de imágenes con razonamiento textual: la torre de visión integrada permite tareas que combinen captura de pantalla o documento escaneado con razonamiento y llamadas a herramientas posteriores, aunque la información disponible no detalla los benchmarks visuales.

## Benchmarks y rendimiento

| Benchmark | Ternary Bonsai 2.5 27B | Qwen3.8-27B FP16 | Referencia GSQ-RCO IQ3_XXS |
|---|---|---|---|
| Media tool calling (τ²-Bench, τ³-Bench, BFCL v3, BFCL v4, AppWorld) | 77,2 | 77,7 | 75,3 |
| SWE-bench Verified | 75,6 | 60,8 (Bonsai 2) | No disponible |
| Terminal-Bench 2.1 | 60,1 | 52,8 (Bonsai 2) | No disponible |
| DeepSWE | 27,0 | 0 (Bonsai 2) | No disponible |
| Media general (5 categorías, 16 benchmarks) | 82,1 | 84,3 | No disponible |
| Codificación agéntica (media) | 54,2 | No disponible | 55,5 |

Notas: la columna FP16 recoge los valores del modelo completo citados por el autor; en el caso de SWE-bench Verified, Terminal-Bench 2.1 y DeepSWE, los valores de comparación corresponden a Bonsai 2 (la entrega anterior), no al FP16. El autor indica que Bonsai 2.5 alcanza el 90 % del rendimiento FP16 en codificación agéntica, frente al 63 % de Bonsai 2. No se han publicado en la información disponible resultados desglosados por benchmark individual de tool calling ni métricas de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,93 GB para los pesos en PTQ1_0 (1,76 bits/peso); el consumo real debe sumar la caché KV correspondiente a 262K tokens de contexto, cuyo tamaño no se detalla en la información disponible.
- GPU recomendadas: el autor reporta mediciones en siete GPUs NVIDIA, con aproximadamente 300 tokens/s en H200 y B200; no se especifica la lista completa de GPUs medidas.
- Cabe en GPU de consumo: sí, con 5,93 GB de pesos el modelo es desplegable en GPUs consumer; el autor lo posiciona como el modelo agéntico más fuerte por debajo de 10 GB frente a los builds de bajo bit de Qwen3.8-27B comparados.
- Opciones de despliegue: llama.cpp (CUDA, Metal, CPU, SYCL) con los packs Q2_0 (upstream) y PTQ1_0 (en revisión upstream); MLX en Python y Swift para Apple Silicon; forks propios de llama.cpp, MLX y mlx-swift para los kernels de bajo bit.
- Latencia y throughput: 2,3–3,0× más rápido en decodificación que en el día de lanzamiento de Bonsai 2 en seis de las siete GPUs NVIDIA medidas; las variantes MTP añaden un factor de 1,5–1,8× en GPUs NVIDIA. No se detallan cifras de TTFT ni de throughput para CPU o Metal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling (media) | Codificación agéntica (media) | Licencia | Tamaño en disco |
|---|---|---|---|---|---|---|
| Ternary Bonsai 2.5 27B | 27,36 B | 262K | 77,2 | 54,2 | Apache 2.0 | 5,93 GB (PTQ1_0) |
| Qwen3.8-27B FP16 (base) | 27,36 B | 262K | 77,7 | No disponible | No disponible | 53,8 GB |
| GSQ-RCO IQ3_XXS (build de bajo bit de Qwen3.8-27B) | No disponible | No disponible | 75,3 | 55,5 | No disponible | ~10,1 GB (1,7× mayor) |
| Bonsai 2 27B (entrega anterior) | 27,36 B | 262K | No disponible | 63 % del FP16 | Apache 2.0 | No disponible |

## Limitaciones y advertencias

- La cuantización ternaria introduce una pérdida medible frente al FP16: 82,1 frente a 84,3 en la media general de 16 benchmarks, y el 90 % del rendimiento FP16 en codificación agéntica (no el 100 %).
- El rendimiento en codificación agéntica queda ligeramente por debajo de un build de bajo bit convencional de mayor tamaño (54,2 frente a 55,5 de GSQ-RCO IQ3_XXS), aunque el modelo es 1,7× más pequeño.
- No se especifican los idiomas soportados; no debe asumirse cobertura multilingüe más allá de la del modelo base sin verificación.
- No se detallan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad en la información disponible.
- El uso de contexto largo (262K tokens) incrementa el consumo de memoria de la caché KV, no cuantificado en la documentación disponible; en GPUs de consumo esto puede limitar la longitud efectiva de contexto.
- Los kernels de bajo bit requieren forks propios de llama.cpp y MLX; solo los ficheros Q2_0 funcionan en llama.cpp upstream, y PTQ1_0 está aún en revisión upstream, lo que puede afectar a la portabilidad y al soporte a largo plazo.
- Las cifras de velocidad (~300 tokens/s en H200/B200) y las aceleraciones MTP se refieren a GPUs NVIDIA de gama alta; el rendimiento en CPU, Metal y SYCL no se detalla.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales que conviene verificar antes de desplegar en producción.

## Enlaces

- [Hugging Face: prism-ml/Ternary-Bonsai-2.5-27B-GGUF](https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF)
- [Sitio web de Prism ML](https://prismml.com)
- [Whitepaper de Bonsai 2.5 27B](https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-5-27b-whitepaper.pdf)
- [Whitepaper de Bonsai 2 27B](https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf)
- [Demo y ejemplos (Bonsai-demo)](https://github.com/PrismML-Eng/Bonsai-demo)
- [Fork de llama.cpp con kernels de bajo bit](https://github.com/PrismML-Eng/llama.cpp)
- [Fork de MLX](https://github.com/PrismML-Eng/mlx)
- [Fork de mlx-swift](https://github.com/PrismML-Eng/mlx-swift)
- [Discord de Prism ML](https://discord.gg/prismml)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)

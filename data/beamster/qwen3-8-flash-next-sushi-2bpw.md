# beamster/Qwen3.8-Flash-Next-Sushi-2bpw

## Resumen

Qwen3.8-Flash-Next-Sushi-2bpw es un empaquetado cuantizado del modelo Qwen/Qwen3.8-Flash-Next, desarrollado por Qwen, preparado por el usuario beamster para el motor de inferencia sushi, una bifurcación de mlx-serve orientada de forma nativa a Apple Silicon. El objetivo declarado del pack es hacer que un modelo MoE de más de 21.000 millones de parámetros totales quepa en un Mac de 48 GB de memoria unificada, algo que ningún otro empaquetado de la misma familia consigue según la model card.

La receta de cuantización es mixta: los expertos enrutados (48 capas de 512 expertos más la capa MTP) se guardan en EXL3 a 2 bits por peso mediante un conversor propio, mientras que la parte densa (atención, GDN, expertos compartidos, hyper-connections, indexer, embedding y lm_head) se mantiene en 8 bits afín. Además incorpora una tabla de embeddings n-gram de 4 bits con grupo 32 que se lee desde el SSD y nunca se carga en memoria de GPU, la torre de visión Qwen3-VL ViT y la cabeza MTP.

El modelo base es multimodal (image-text-to-text) y soporta hasta 1.048.576 tokens de contexto mediante YaRN x4 sobre los 262.144 nativos. El pack está pensado exclusivamente para sushi v1.0.4 o superior sobre macOS 26.2 o posterior: no carga en transformers, vLLM, mlx-lm ni exllamav3. Ocupa unos 65 GiB en disco, de los cuales 35,0 GiB son pesos y 29,8 GiB la tabla n-gram. Se distribuye bajo Qwen Community License 1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con atención, GDN, expertos compartidos, hyper-connections, indexer, cabeza MTP y torre de visión Qwen3-VL ViT |
| Parámetros totales | 21.142.110.099 (dato real de safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 1.048.576 tokens (YaRN x4 sobre 262.144 nativos) |
| Tipos de cuantización | Mixta: expertos enrutados EXL3 a 2 bits/peso; parte densa en 8 bits afín; tabla n-gram en 4 bits afín (grupo 32); KV cache a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (qwen-community-1.0) |
| Formato de pesos | safetensors (EXL3 para expertos enrutados, 8 bits afín para parte densa), más `ngram_table.bin` |
| Tamaño del repo | 69,6 GB (~65 GiB: 35,0 GiB de pesos + 29,8 GiB de tabla n-gram) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Motor de inferencia | sushi v1.0.4 o superior (Apple Silicon, macOS 26.2+) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de tipo Mixture of Experts con 48 capas y 512 expertos enrutados por capa, complementado por expertos compartidos, mecanismos de atención con GDN (gated delta networks), hyper-connections e indexer. Incorpora una cabeza MTP (multi-token prediction) para decodificación especulativa y una torre de visión Qwen3-VL ViT que habilita entrada de imagen y vídeo. El contexto nativo es de 262.144 tokens, extendido a 1.048.576 mediante YaRN x4 configurado en `config.json`.

El pack de beamster no reentrena el modelo: aplica una cuantización por capas. Los expertos enrutados se convierten a EXL3 a 2 bits con un conversor propio del autor; la parte densa se mantiene a 8 bits afín, igual que en los packs Sushi-2.6bpw, Sushi-3bpw y Sushi-4bpw. La tabla de embeddings n-gram se cuantiza a 4 bits con grupo 32 a partir de la tabla bf16 publicada y se almacena en un fichero separado (`ngram_table.bin`) que se lee desde el SSD sin ocupar memoria de GPU. La model card no aporta detalles sobre el dataset de entrenamiento del modelo base, el número de tokens ni si hubo RLHF o DPO; esos datos corresponden a la documentación de Qwen.

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de hasta 1.048.576 tokens.
- Entrada multimodal de imagen y vídeo mediante la torre de visión Qwen3-VL ViT incluida en el pack.
- Razonamiento extendido: la evaluación LLMProbe se ejecutó con 12k tokens de razonamiento y 16k de salida, lo que indica soporte de cadenas de razonamiento largas.
- Decodificación especulativa mediante la cabeza MTP incluida.
- Mejora de calidad mediante tabla de embeddings n-gram leída desde disco (4 bits, grupo 32).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque la evaluación con MMLU-Pro, OlympiadBench y LiveBench sugiere competencia en tareas de razonamiento complejo.

## Casos de uso

- Inferencia local en Mac de 48 GB: es el único pack de la familia que cabe en esa configuración (34,97 GiB de pesos en GPU), lo que permite ejecutar un MoE de 21B parámetros en un equipo de sobremesa Apple sin servidor dedicado.
- Análisis de documentos largos: con 1.048.576 tokens de contexto se pueden procesar libros completos, expedientes o bases de código en una sola pasada sin técnicas de recuperación.
- Asistentes conversacionales con historial extenso: la ventana de contexto permite mantener conversaciones multi-turno muy largas manteniendo coherencia sin truncar el historial.
- Procesamiento de imagen y vídeo: la torre Qwen3-VL ViT incluida permite describir imágenes, extraer información de capturas o analizar fotogramas de vídeo en local.
- Evaluación y prototipado de razonamiento: la combinación de MTP y contexto largo permite ejecutar pruebas tipo LLMProbe Hard 50 (MMLU-Pro, OlympiadBench, LiveBench, NIST Juliet) en hardware de consumo, con un 84,0% de acierto reportado.
- Desarrollo sin conexión y con privacidad de datos: al ejecutarse íntegramente en local sobre Apple Silicon, es adecuado para entornos donde los datos no pueden salir del dispositivo.
- Sustitución de packs mayores en Mac de 64 GB: la model card indica que Sushi-2.6bpw cuesta 9 GiB más a cambio de un KLD un 35% menor, por lo que este pack sirve como opción de reserva cuando se necesita liberar memoria para otras tareas.

## Benchmarks y rendimiento

La model card reporta dos evaluaciones: divergencia KL (KLD) frente al checkpoint bf16 y la prueba LLMProbe Hard 50.

KLD contra bf16 (16 prompts x 512 tokens, 7186 posiciones, KV cache kv8):

| Pack | Pesos en GPU (GiB) | KLD | Acuerdo top-1 |
|---|---|---|---|
| Sushi-4bpw | 63,68 | 0,0592 | 92,89% |
| oMLX oQ5e | 83,97 | 0,0625 | 92,40% |
| mlx-serve mixed-4-8bit | 70,13 | 0,0818 | 91,39% |
| Sushi-3bpw | 49,33 | 0,1036 | 90,31% |
| Sushi-2.6bpw | 43,95 | 0,1355 | 89,08% |
| oMLX oQ4e | 69,21 | 0,1370 | 88,87% |
| mlx-serve iQ-MLX 3.3bpw | 50,60 | 0,1987 | 86,28% |
| Vontra 4-bit g32 (TensorFold) | 75,60 | 0,2074 | 85,01% |
| **Sushi-2bpw** | **34,97** | **0,2080** | **85,94%** |

LLMProbe Hard 50 (MMLU-Pro, OlympiadBench, LiveBench, NIST Juliet), con llmprobe 0.6.12, esfuerzo xhigh, 12k tokens de razonamiento y 16k de salida, KV a 8 bits y MTP: 42 correctas, 7 incorrectas, 1 parcial (límite de tokens), 84,0%.

Efecto de la tabla n-gram sobre el KLD:

| Tabla | Tamaño en disco | KLD con Sushi-2.6bpw | KLD con Sushi-3bpw | KLD con Sushi-4bpw |
|---|---|---|---|---|
| 4 bits, grupo 32 | 29,8 GiB | 0,1355 | 0,1036 | 0,0654 |
| bf16 | 95,4 GiB | 0,1303 | 0,1006 | 0,0592 |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 34,97 GiB de pesos en GPU para el pack de 2bpw (el más pequeño de la familia); el objetivo declarado es un Mac de 48 GB.
- Disco: ~65 GiB en total (35,0 GiB de pesos + 29,8 GiB de tabla n-gram); con la tabla bf16 el pack alternativo ocupa 95,4 GiB.
- GPU compatibles: exclusivamente Apple Silicon con macOS 26.2 o posterior. No se soportan GPU NVIDIA (A100, H100, RTX 4090) ni CUDA.
- Cabe en GPU de consumo: sí, en Mac con 48 GB de memoria unificada o superior (M-series Pro/Max/Ultra según la documentación de sushi).
- Opciones de despliegue: únicamente sushi v1.0.4 o superior. No carga en transformers, vLLM, llama.cpp, Ollama, TGI, mlx-lm ni exllamav3.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pesos en GPU | KLD | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sushi-2bpw (este pack) | 21,14B totales (MoE) | 1.048.576 | 34,97 GiB | 0,2080 | Qwen Community 1.0 | HF, solo sushi |
| Sushi-2.6bpw | mismo base | 1.048.576 | 43,95 GiB | 0,1355 | Qwen Community 1.0 | HF, solo sushi |
| Sushi-3bpw | mismo base | 1.048.576 | 49,33 GiB | 0,1036 | Qwen Community 1.0 | HF, solo sushi |
| mlx-serve iQ-MLX 3.3bpw | mismo base | 1.048.576 | 50,60 GiB | 0,1987 | Qwen Community 1.0 | HF, mlx-serve |
| oMLX oQ4e | mismo base | 1.048.576 | 69,21 GiB | 0,1370 | Qwen Community 1.0 | HF, oMLX |

Frente a iQ-MLX 3.3bpw, este pack logra un KLD muy similar (0,208 frente a 0,199) con 15,6 GiB menos de memoria. Frente a Sushi-2.6bpw, sacrifica un 35% de KLD a cambio de 9 GiB menos, lo que lo convierte en la única opción viable en Mac de 48 GB.

## Limitaciones y advertencias

- Compatibilidad restringida: solo funciona con sushi v1.0.4+ en Apple Silicon con macOS 26.2+. No es portable a otros motores ni a GPU NVIDIA.
- Pérdida de calidad medible: KLD de 0,2080 y acuerdo top-1 del 85,94% frente al bf16, el peor de la familia Sushi salvo el pack de 4 bits de Vontra. Para tareas sensibles a la fidelidad conviene usar Sushi-2.6bpw o superior si hay memoria suficiente.
- Riesgo de alucinación: no cuantificado en la información disponible; la cuantización agresiva a 2 bits en los expertos enrutados puede amplificarlo en dominios de baja frecuencia.
- Sesgos: no documentados en la información proporcionada.
- Idiomas: no disponibles; la model card no detalla la cobertura lingüística del modelo base.
- Licencia: Qwen Community License 1.0, con condiciones específicas para servicios comerciales a gran escala; es necesario revisar `LICENSE` antes de un despliegue comercial.
- Dependencia de disco: la tabla n-gram de 29,8 GiB se lee desde el SSD en cada uso, lo que exige almacenamiento rápido y suficiente; sustituirla por la bf16 añade 65,6 GiB adicionales.
- Contexto efectivo: aunque el modelo soporta 1.048.576 tokens, la evaluación se hizo con 512 tokens de generación; el rendimiento en ventanas muy largas no está validado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-2bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack Sushi-2.6bpw: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-2.6bpw
- Pack Sushi-3bpw: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-3bpw
- Motor sushi: https://github.com/beamivalice/sushi
- Documentación de uso de sushi: https://github.com/beamivalice/sushi/blob/main/docs/usage.md
- mlx-serve: https://github.com/ddalcu/mlx-serve
- Pack mlx-serve mixed-4-8bit: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit
- Pack mlx-serve iQ-MLX 3.3bpw: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-3.3bpw

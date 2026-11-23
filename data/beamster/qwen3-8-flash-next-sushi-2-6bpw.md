# beamster/Qwen3.8-Flash-Next-Sushi-2.6bpw

## Resumen

Qwen3.8-Flash-Next-Sushi-2.6bpw es un empaquetado cuantizado del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario beamster para el motor de inferencia nativo de Apple Silicon llamado sushi. No es un modelo nuevo ni un fine-tuning: es una conversión de pesos orientada a ejecutar un modelo MoE multimodal de aproximadamente 26.000 millones de parámetros en un Mac de 64 GB de memoria unificada, manteniendo el mayor tamaño de contexto posible. El paquete combina cuantización EXL3 de 2,6 bits por peso para los expertos enrutados, 8 bits afines para la parte densa y una tabla de n-gramas de 4 bits que reside en el SSD.

La relevancia de este empaquetado está en su relación calidad/tamaño: según la model card, alcanza una divergencia KL de 0,1355 frente al checkpoint bf16 con solo 43,95 GiB de pesos en memoria de GPU, cifra comparable a la de oMLX oQ4e (0,1370) con unos 25 GiB menos de VRAM. Está pensado exclusivamente para sushi v1.0.4 o superior sobre macOS 26.2 o posterior y no carga en transformers, vLLM, mlx-lm ni exllamav3, lo que limita su uso a un ecosistema muy concreto.

El modelo base es un transformer con mezcla de expertos (MoE) de la familia Qwen, con torre de visión Qwen3-VL, cabeza MTP (multi-token prediction), atención con GDN (gated delta net, según la model card) e índice de atención dispersa, y una ventana de contexto que el `config.json` extiende hasta 1.048.576 tokens mediante YaRN x4 sobre los 262.144 nativos. La licencia es la Qwen Community License 1.0, que impone condiciones específicas para servicios comerciales a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención GDN, hyper-connections, indexer de atención, torre de visión Qwen3-VL y cabeza MTP |
| Parametros totales | 25.959.006.099 (aproximadamente 26.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1.048.576 tokens (YaRN x4 sobre 262.144 nativos) |
| Tipos de cuantizacion | Expertos enrutados en EXL3 a 2,6 bits por peso; parte densa en 8 bits afines; tabla de n-gramas en 4 bits afines (group size 32); KV cache a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (EXL3 para expertos, afín de 8 bits para la parte densa), más `ngram_table.bin` |
| Tamano del repo | 79,2 GB (aproximadamente 74 GiB en disco: 43,9 GiB de pesos y 29,8 GiB de tabla de n-gramas) |
| Pesos en memoria de GPU | 43,95 GiB |
| Motor de inferencia | sushi v1.0.4 o superior, exclusivamente en Apple Silicon con macOS 26.2 o posterior |
| Modalidad | image-text-to-text (imagen y vídeo de entrada) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos: 48 capas con 512 expertos enrutados por capa, más una capa MTP adicional. La parte densa incluye atención, GDN (gated delta net), expertos compartidos, hyper-connections, el indexer de atención dispersa, el embedding y el lm_head. Incorpora una torre de visión Qwen3-VL para entrada de imagen y vídeo, y una cabeza MTP que permite decodificación multi-token. La ventana de contexto nativa es de 262.144 tokens y el `config.json` del paquete la extiende a 1.048.576 mediante YaRN con factor x4.

El empaquetado de beamster no reentrena el modelo: redistribuye los pesos en distintos formatos de cuantización. Los expertos enrutados se convierten a EXL3 a 2,6 bits por peso con un conversor propio; la parte densa se guarda en 8 bits afines, igual que en los packs Sushi-3bpw y Sushi-4bpw; la tabla de n-gramas se cuantiza a 4 bits afines con group size 32 a partir de la tabla bf16 publicada por mlx-serve y se almacena en un único fichero que se lee desde el SSD sin cargarse en memoria de GPU. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens utilizados ni las etapas de alineación (RLHF, DPO u otras).

## Capacidades

- Generación de texto y razonamiento multi-paso, con soporte de modo de razonamiento extendido (la evaluación de la model card usa 12k tokens de razonamiento y 16k de salida).
- Comprensión de imagen y vídeo como entrada, gracias a la torre de visión Qwen3-VL incluida en el paquete.
- Decodificación multi-token mediante la cabeza MTP incluida.
- Contexto muy largo: hasta 1.048.576 tokens con YaRN x4, útil para documentos extensos o conversaciones prolongadas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque el modo de razonamiento extendido y el contexto largo son compatibles con flujos agénticos.
- Capacidades especiales: uso de una tabla de n-gramas externa leída desde SSD que mejora la calidad de la distribución sin consumir VRAM adicional.

## Casos de uso

- Inferencia local en Mac de 64 GB: el paquete está dimensionado para caber en un Mac con 64 GB de memoria unificada, con 43,95 GiB de pesos en GPU y la tabla de n-gramas en SSD. Es adecuado para desarrolladores que quieren ejecutar un MoE multimodal de 26.000 millones de parámetros sin depender de la nube.
- Análisis de documentos largos: con hasta 1.048.576 tokens de contexto, el modelo puede procesar libros completos, expedientes o bases de código extensas en una sola pasada, algo inviable en modelos con ventanas de 8k o 32k.
- Procesamiento de imagen y vídeo en local: la torre Qwen3-VL incluida permite describir imágenes, transcribir contenido visual o analizar fotogramas de vídeo sin enviar datos a servicios externos, útil en entornos con requisitos de privacidad.
- Asistencia técnica con razonamiento extendido: el modo de razonamiento con hasta 12k tokens permite abordar problemas de matemáticas, lógica o depuración de código que requieren cadenas de pensamiento largas, como demuestra la evaluación LLMProbe Hard 50.
- Prototipado e investigación en Apple Silicon: sirve para experimentar con cuantización extrema (2,6 bits) y comparar la degradación de calidad frente a packs de 3 y 4 bits, usando la métrica KLD publicada.
- Evaluación comparativa de motores de inferencia: al estar empaquetado específicamente para sushi, permite medir latencia, throughput y uso de memoria de ese motor frente a mlx-serve u oMLX en el mismo hardware.
- Despliegue de un asistente conversacional multimodal sin conexión: para entornos aislados (laboratorios, sanidad, defensa) donde no se permite tráfico de datos hacia fuera y se necesita un modelo capaz de razonar sobre texto e imágenes.

## Benchmarks y rendimiento

La model card publica métricas de divergencia KL frente al checkpoint bf16 (16 prompts x 512 tokens, puntuado hasta el primer EOS, 7186 posiciones, KV cache a 8 bits) y una evaluación en LLMProbe Hard 50.

| Pack | Pesos en GPU (GiB) | KLD | Acuerdo top-1 |
|---|---|---|---|
| Sushi-4bpw | 63,68 | 0,0592 | 92,89% |
| oMLX oQ5e | 83,97 | 0,0625 | 92,40% |
| mlx-serve mixed-4-8bit | 70,13 | 0,0818 | 91,39% |
| Sushi-3bpw (tabla 4 bits) | 49,33 | 0,1036 | 90,31% |
| Sushi-2.6bpw (tabla 4 bits) | 43,95 | 0,1355 | 89,08% |
| oMLX oQ4e | 69,21 | 0,1370 | 88,87% |
| mlx-serve iQ-MLX 3.3bpw | 50,60 | 0,1987 | 86,28% |
| Vontra 4-bit g32 (TensorFold) | 75,60 | 0,2074 | 85,01% |
| Sushi-2bpw (tabla 4 bits) | 34,97 | 0,2080 | 85,94% |

Con la tabla de n-gramas en bf16, Sushi-2.6bpw obtiene un KLD de 0,1303. En LLMProbe Hard 50 (MMLU-Pro, OlympiadBench, LiveBench, NIST Juliet) con llmprobe 0.6.12, esfuerzo xhigh, 12k tokens de razonamiento y 16k de salida, el resultado es 44 correctas, 4 incorrectas y 2 parciales sobre 50, es decir, un 88,0%. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: 43,95 GiB de pesos en memoria de GPU, más la KV cache (8 bits) y el espacio de trabajo del motor. El objetivo declarado es un Mac con 64 GB de memoria unificada.
- Almacenamiento: aproximadamente 74 GiB en disco (43,9 GiB de pesos más 29,8 GiB de tabla de n-gramas de 4 bits). Con la tabla bf16 el requisito sube a unos 139 GiB.
- GPU compatibles: exclusivamente Apple Silicon (M-series) con macOS 26.2 o posterior. No se soportan GPU NVIDIA, AMD ni CPU x86.
- Consumer GPU: no aplica; el paquete no carga en CUDA ni en ROCm.
- Opciones de despliegue: únicamente el motor sushi v1.0.4 o superior. No es compatible con transformers, vLLM, llama.cpp, Ollama, TGI, mlx-lm ni exllamav3.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KLD (vs bf16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Sushi-2.6bpw | 26.000 M (MoE) | 1.048.576 | 0,1355 | Qwen Community 1.0 | Hugging Face, solo sushi |
| Qwen3.8-Flash-Next-Sushi-3bpw | 26.000 M (MoE) | 1.048.576 | 0,1036 | Qwen Community 1.0 | Hugging Face, solo sushi |
| Qwen3.8-Flash-Next-Sushi-4bpw | 26.000 M (MoE) | 1.048.576 | 0,0592 | Qwen Community 1.0 | Hugging Face, solo sushi |
| Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-3.3bpw | 26.000 M (MoE) | no disponible | 0,1987 | Qwen Community 1.0 | Hugging Face, mlx-serve |
| Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit | 26.000 M (MoE) | no disponible | 0,0818 | Qwen Community 1.0 | Hugging Face, mlx-serve |

Todos los comparables son empaquetados del mismo modelo base, por lo que la comparación se reduce a la relación entre tamaño en memoria, calidad (KLD) y motor de inferencia. Frente a oMLX oQ4e, Sushi-2.6bpw ofrece un KLD ligeramente mejor con unos 25 GiB menos de VRAM; frente a mlx-serve iQ-MLX 3.3bpw, reduce el KLD en dos tercios con 6,7 GiB menos. El precio a pagar es un KLD un 24% peor que Sushi-3bpw, que a su vez consume 5,4 GiB más.

## Limitaciones y advertencias

- Compatibilidad extremadamente restringida: solo funciona con sushi v1.0.4 o superior en Apple Silicon con macOS 26.2 o posterior. No es usable en servidores con GPU NVIDIA, en la nube convencional ni en contenedores Linux.
- Cuantización agresiva: 2,6 bits por peso en los expertos introduce degradación medible (KLD de 0,1355 frente a 0,0592 del pack de 4 bits). No es recomendable para tareas que exijan máxima fidelidad al modelo original.
- Riesgo de alucinación: inherente a los modelos de lenguaje; la cuantización extrema puede incrementarlo en dominios especializados. No se han publicado evaluaciones específicas de factualidad.
- Idiomas soportados: no disponibles en la información proporcionada; no se puede garantizar un rendimiento homogéneo fuera del inglés y el chino.
- Licencia Qwen Community License 1.0: impone condiciones específicas para servicios comerciales a gran escala, incluida la obligación de mostrar la atribución y restricciones de uso. Es necesario revisar el fichero LICENSE antes de un despliegue comercial.
- Dependencia de la tabla de n-gramas: el paquete incluye dos variantes (4 bits y bf16) con distinto tamaño en disco y calidad; cambiar de tabla requiere editar `config.json` y descargar el fichero correspondiente. Una configuración incorrecta puede impedir la carga.
- Modelo derivado: los problemas del modelo base (sesgos, calidad en idiomas minoritarios, comportamiento en contextos muy largos) se heredan y pueden amplificarse por la cuantización.
- Sin datos de benchmarks estándar: no hay resultados publicados de MMLU, HumanEval o GSM8K para este empaquetado, solo KLD y LLMProbe Hard 50, lo que limita la comparación con otros modelos fuera del ecosistema Sushi.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-2.6bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del motor sushi: https://github.com/beamivalice/sushi
- Documentación de uso de sushi: https://github.com/beamivalice/sushi/blob/main/docs/usage.md
- Pack Sushi-3bpw: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-3bpw
- Pack Sushi-4bpw: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-4bpw
- Pack Sushi-2bpw: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-2bpw
- mlx-serve (origen de sushi): https://github.com/ddalcu/mlx-serve
- Pack mlx-serve mixed-4-8bit: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit
- Pack mlx-serve iQ-MLX 3.3bpw: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-3.3bpw

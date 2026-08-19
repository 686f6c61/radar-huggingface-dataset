# microsoft/VibeVoice-ASR-BitNet

## Resumen

VibeVoice-ASR-BitNet es una variante comprimida del modelo de reconocimiento automático de voz (ASR) VibeVoice-ASR, desarrollada por Microsoft Research. Su objetivo principal es permitir inferencia en tiempo real en CPUs de borde (edge) sin necesidad de GPU, mediante una cuantización heterogénea que reduce el tamaño del modelo de 4,62 GB (FP16) a 1,58 GB, manteniendo una precisión competitiva frente a alternativas como Whisper, Parakeet o SenseVoice.

El modelo combina un tokenizador acústico basado en VAE (con cuantización INT8 de pipeline completo) y un decodificador de lenguaje autoregresivo (con cuantización ternaria estilo BitNet y Q6_K). Esta arquitectura, junto con kernels SIMD personalizados para ARM y x86, consigue un factor de tiempo real (RTF) inferior a 1 con solo 3 hilos de CPU, lo que lo hace adecuado para dispositivos con recursos limitados.

VibeVoice-ASR-BitNet es relevante ahora porque aborda la brecha entre precisión y eficiencia en ASR multilingüe, ofreciendo una alternativa de código abierto (licencia MIT) para despliegues en entornos donde el coste de GPU o la latencia son críticos. El repositorio incluye tanto los pesos cuantizados en formato GGUF como los safetensors originales para conversión o fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE tokenizer (I8_S) + LM decoder autoregresivo (I2_S + Q6_K) |
| Parametros totales | 322.592.829 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | I8_S, I2_S, Q6_K (GGUF) |
| Idiomas soportados | en, zh, fr, it, ko, pt, vi (y otros) |
| Licencia | MIT |
| Formato de pesos | GGUF (ggml), safetensors |

## Arquitectura y entrenamiento

VibeVoice-ASR-BitNet es una versión comprimida de VibeVoice-ASR, un modelo de ASR basado en un tokenizador acústico continuo de ultra baja frecuencia (7,5 Hz) que combina un VAE como codificador acústico y un modelo de lenguaje autoregresivo como decodificador. La compresión se realiza mediante cuantización heterogénea: el tokenizador VAE se cuantiza con INT8 de pipeline completo (I8_S) con fusión de kernels y optimización SIMD, mientras que el decodificador LM adopta cuantización ternaria estilo BitNet (I2_S) combinada con Q6_K para las capas de embedding.

No se han publicado detalles sobre el entrenamiento del modelo base (composición del dataset, número de tokens, técnicas de alineación como RLHF o DPO) en la información disponible. La model card solo indica que es una variante comprimida del modelo original, por lo que estos datos se consideran no disponibles.

## Capacidades

- Reconocimiento automático de voz (ASR) multilingüe en inglés, chino, francés, italiano, coreano, portugués y vietnamita, con soporte adicional para otros idiomas.
- Inferencia en tiempo real en CPU (RTF < 1) con 3 o más hilos en hardware x86 (AVX2) y ARM (NEON), sin necesidad de GPU.
- Compresión eficiente: 2,9× de reducción de tamaño respecto al modelo FP16 (de 4,62 GB a 1,58 GB), lo que permite su despliegue en dispositivos de borde con memoria limitada.
- Integración con el framework ggml mediante kernels SIMD personalizados para ARM y x86, optimizando la latencia y el throughput.
- No incluye capacidades de generación de texto, tool calling, agentes ni visión; es exclusivamente un modelo de transcripción de voz a texto.

## Casos de uso

- Transcripción en tiempo real en dispositivos de borde: el modelo puede ejecutarse en CPUs de bajo consumo (por ejemplo, Raspberry Pi o mini-PCs) gracias a su RTF < 1 con 3 hilos, ideal para sistemas de subtitulación en directo o asistentes de voz sin conexión.
- Asistentes de voz embebidos: al no requerir GPU, puede integrarse en asistentes domésticos o kioscos interactivos para transcribir comandos de voz con baja latencia y bajo consumo energético.
- Servicios de transcripción médica o legal: su precisión en inglés (WER 5,21 en Fleurs-en) y soporte multilingüe permiten transcribir consultas o testimonios en tiempo real, con la ventaja de poder ejecutarse en servidores CPU económicos.
- Atención al cliente automatizada: integración en sistemas de IVR o chatbots de voz para transcribir interacciones de usuarios en varios idiomas, facilitando el análisis posterior o la generación de respuestas automáticas.
- Análisis de reuniones y conferencias: con soporte para inglés, francés, italiano, coreano, portugués y vietnamita, puede generar transcripciones de reuniones en tiempo real para su posterior búsqueda o resumen, incluso en equipos sin GPU.
- Accesibilidad para personas con discapacidad auditiva: despliegue en dispositivos móviles o wearables para convertir voz en texto en tiempo real, aprovechando su bajo footprint de memoria (1,58 GB) y su capacidad de ejecución en CPU.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de WER (Word Error Rate) en varios benchmarks, comparando VibeVoice-ASR-BitNet con otros modelos ASR. También se incluyen mediciones de velocidad de inferencia (RTF) en CPU.

| Benchmark | VibeVoice-ASR-BitNet | VibeVoice-ASR-7B | Parakeet | Whisper | SenseVoice | FunASR |
|---|---|---|---|---|---|---|
| MLC-EN | 8,25 | 7,82 | 8,40 | 13,57 | 12,39 | 11,36 |
| MLC-FR | 17,41 | 16,03 | — | — | — | — |
| MLC-IT | 17,23 | 15,67 | — | — | — | — |
| MLC-KO | 11,15 | 9,83 | — | — | — | — |
| MLC-PT | 24,87 | 22,41 | — | — | — | — |
| MLC-VI | 22,38 | 20,15 | — | — | — | — |
| AISHELL4 | 27,45 | 19,83 | — | — | 22,52 | 20,41 |
| AMI-ihm | 21,36 | 17,42 | 21,92 | 27,07 | 30,81 | 32,07 |
| AMI-sdm | 25,87 | 24,18 | 26,33 | 36,92 | 48,11 | 40,17 |
| AliMeeting | 40,58 | 36,21 | — | — | 38,75 | 39,27 |
| Fleurs-en | 5,21 | 4,73 | 4,09 | 3,99 | 6,84 | 4,93 |
| Fleurs-zh | 8,35 | 7,92 | — | — | 5,56 | 7,00 |
| Libri-clean | 2,41 | 2,17 | 1,49 | 1,98 | 2,78 | 1,58 |
| Libri-other | 6,27 | 5,84 | 3,13 | 3,60 | 6,81 | 4,01 |
| VoxPopuli | 5,18 | 4,92 | 5,26 | 7,19 | 8,63 | 6,46 |

En cuanto a velocidad de inferencia, la model card reporta el RTF (Real-Time Factor) en una CPU AMD EPYC 7V13 (AVX2+FMA) con audio de 20 segundos:

| Threads | 1 | 2 | 3 | 4 | 6 | 8 |
|---|---|---|---|---|---|---|
| RTF | 1,98 | 1,08 | 0,77 | 0,63 | 0,49 | 0,42 |
| vs. Whisper.cpp | 2,28× | 2,12× | 1,86× | 1,86× | 1,71× | 1,55× |

Los valores en negrita (RTF < 1) indican capacidad de tiempo real a partir de 3 hilos.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se realiza en CPU. El tamaño total de los pesos cuantizados es de 1,58 GB, que cabe en memoria RAM de cualquier dispositivo moderno.
- CPU recomendada: x86 con AVX2 o ARM con NEON. Se ha probado en AMD EPYC 7V13, pero es compatible con CPUs de consumo general.
- Memoria RAM: mínimo 2 GB para cargar los modelos GGUF (0,65 GB + 0,92 GB), aunque se recomienda al menos 4 GB para el sistema operativo y buffers.
- Opciones de despliegue: el repositorio oficial `microsoft/VibeASR.cpp` (basado en ggml) es el método principal. No se menciona soporte para vLLM, Ollama o TGI, ya que está orientado a CPU.
- Latencia: RTF de 0,77 con 3 hilos y 0,42 con 8 hilos, lo que significa que procesa 20 segundos de audio en aproximadamente 8,4 segundos (3 hilos) o 8,4 segundos (8 hilos) respectivamente. El throughput exacto no se especifica.

## Comparativa con modelos similares

La tabla de benchmarks anterior ya compara VibeVoice-ASR-BitNet con Parakeet, Whisper, SenseVoice y FunASR en varios conjuntos de datos. A continuación se resumen las diferencias clave:

| Modelo | Tamaño (aprox.) | Idiomas | Licencia | Requisitos de hardware | WER en Fleurs-en |
|---|---|---|---|---|---|
| VibeVoice-ASR-BitNet | 1,58 GB (cuantizado) | en, zh, fr, it, ko, pt, vi | MIT | CPU (AVX2/NEON) | 5,21 |
| Whisper (base) | ~1,5 GB (FP16) | 99 idiomas | MIT | GPU recomendada | 3,99 (Fleurs-en) |
| Parakeet (NVIDIA) | ~1 GB (cuantizado) | en | CC-BY-4.0 | GPU | 4,09 |
| SenseVoice | ~2 GB | zh, en, ja, ko, yue | MIT | CPU/GPU | 6,84 |
| FunASR | ~1 GB | zh, en | MIT | CPU/GPU | 4,93 |

VibeVoice-ASR-BitNet destaca por su capacidad multilingüe y su enfoque específico en CPU de borde, mientras que Whisper ofrece mayor cobertura de idiomas pero requiere GPU para un rendimiento similar en tiempo real. Parakeet es más preciso en inglés pero no es multilingüe. La licencia MIT del modelo de Microsoft permite uso comercial sin restricciones.

## Limitaciones y advertencias

- La cuantización introduce una degradación en la precisión: el WER de VibeVoice-ASR-BitNet es sistemáticamente superior al del modelo base VibeVoice-ASR-7B (por ejemplo, 8,25 vs 7,82 en MLC-EN, y 27,45 vs 19,83 en AISHELL4). Esto puede ser crítico en dominios donde la exactitud es prioritaria.
- El soporte de idiomas está limitado a los siete declarados (en, zh, fr, it, ko, pt, vi) y "más", pero no se especifica una lista completa. Idiomas no cubiertos pueden producir resultados no fiables.
- No se han publicado detalles sobre sesgos o alucinaciones específicas. Como todo modelo ASR, puede generar transcripciones incorrectas en condiciones de ruido, acentos no representados o habla superpuesta.
- La inferencia en CPU con pocos hilos (1-2) no alcanza tiempo real (RTF > 1), por lo que se recomienda un mínimo de 3 hilos para aplicaciones interactivas.
- Aunque la licencia MIT permite uso comercial, el modelo se distribuye "tal cual" sin garantías. Es recomendable validar su rendimiento en el dominio de aplicación antes de desplegarlo en producción.
- No se proporcionan instrucciones para fine-tuning o adaptación a dominios específicos, aunque al incluir los safetensors originales, es posible realizar conversión o entrenamiento adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/microsoft/VibeVoice-ASR-BitNet)
- [Repositorio de código VibeASR.cpp](https://github.com/microsoft/VibeASR.cpp)
- [Informe técnico en arXiv (2607.21075)](https://arxiv.org/abs/2607.21075)
- [Modelo base VibeVoice-ASR](https://huggingface.co/microsoft/VibeVoice-ASR)
- [Publicación del informe en Microsoft Research](https://www.microsoft.com/en-us/research/publication/vibevoice-asr-bitnet-technical-report/)
- [Repositorio VibeVoice (familia de modelos)](https://github.com/microsoft/VibeVoice)

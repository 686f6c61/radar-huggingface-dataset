# beamster/Qwen3.8-Flash-Next-Sushi-4bpw

## Resumen

Qwen3.8-Flash-Next-Sushi-4bpw es un empaquetado cuantizado del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario beamster para el motor de inferencia sushi, un fork de mlx-serve diseñado específicamente para Apple Silicon. No se trata de un modelo nuevo, sino de una distribución de pesos optimizada para ejecutar un modelo de arquitectura MoE de 36.556 millones de parámetros totales en un Mac de 96 GB de memoria unificada, con un contexto que alcanza 1.048.576 tokens mediante extensión YaRN x4 sobre los 262.144 nativos.

El pack combina tres estrategias de compresión: los expertos enrutados (48 capas x 512, más la capa MTP) se almacenan en formato EXL3 mediante un conversor propio; la parte densa (atención, GDN, expertos compartidos, hyper-connections, indexer, embedding y lm_head) se guarda en 8 bits afín; y la tabla de embeddings n-gram se mantiene en bf16 como un fichero separado de 95,4 GiB que se lee desde el SSD y nunca se carga en memoria de GPU. Incluye además la torre de visión Qwen3-VL y la cabeza MTP.

Su relevancia actual radica en que demuestra que es posible servir un MoE multimodal de este tamaño en hardware de consumo Apple con una degradación de calidad medida y acotada: un KLD de 0,0592 frente al checkpoint bf16 y un 92,89 % de acuerdo top-1, superando en la comparativa publicada a alternativas como oMLX oQ5e y mlx-serve mixed-4-8bit con menor huella de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con atención, GDN, expertos compartidos, hyper-connections, indexer y cabeza MTP; torre de visión Qwen3-VL |
| Parámetros totales | 36.556.177.299 |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 1.048.576 tokens (YaRN x4 sobre 262.144 nativos) |
| Tipos de cuantización | EXL3 para expertos enrutados; 8 bits afín para la parte densa; tabla n-gram en bf16 (o 4 bits, grupo 32, en el pack hermano) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors con cuantización EXL3 y 8 bits afín; fichero adicional `ngram_table.bin` |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture of experts con 48 capas y 512 expertos enrutados por capa, complementado por una capa MTP (multi-token prediction). La parte densa integra mecanismos de atención, GDN, expertos compartidos, hyper-connections y un indexer, además de un embedding y un lm_head. La torre de visión corresponde a Qwen3-VL ViT, lo que habilita entrada de imagen y vídeo. El contexto nativo es de 262.144 tokens, extendido a 1.048.576 mediante YaRN x4 configurado en `config.json`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base. La innovación técnica destacable de este pack no está en el entrenamiento sino en la distribución: el uso de EXL3 para los expertos, 8 bits afín para la parte densa y una tabla n-gram externalizada en SSD que evita consumir memoria de GPU, junto con la inclusión de la cabeza MTP para decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventanas de contexto de hasta 1.048.576 tokens.
- Procesamiento de imagen y vídeo mediante la torre de visión Qwen3-VL ViT (pipeline image-text-to-text).
- Decodificación especulativa mediante la cabeza MTP incluida en el pack.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento extendido: la evaluación LLMProbe se ejecutó con "xhigh effort" y 12k tokens de razonamiento, lo que sugiere soporte de cadenas de razonamiento largas.

## Casos de uso

- Análisis de documentos largos en local: con 1.048.576 tokens de contexto, el modelo puede ingerir informes completos, expedientes o bases de código extensas en un único Mac de 96 GB sin fragmentar en trozos, manteniendo coherencia entre secciones distantes.
- Asistencia sobre imagen y vídeo: la torre Qwen3-VL permite describir, resumir o extraer información de capturas, diagramas y clips, útil para catalogación de archivos multimedia o accesibilidad.
- Desarrollo de código en estación de trabajo Apple: el modelo puede integrarse en editores y terminales locales para autocompletado, revisión y refactorización, aprovechando la decodificación especulativa MTP para reducir latencia por token.
- Razonamiento matemático y científico offline: el resultado de 90,0 % en LLMProbe Hard 50 (MMLU-Pro, OlympiadBench, LiveBench, NIST Juliet) lo hace adecuado para entornos con requisitos de confidencialidad donde no se puede enviar datos a la nube.
- Prototipado de agentes conversacionales: la ventana de contexto y el pipeline conversacional permiten mantener historiales extensos de interacción sin truncamiento agresivo, útil para pruebas de concepto de asistentes especializados.
- Investigación en cuantización: el pack sirve como referencia reproducible para estudiar el impacto de EXL3, 8 bits afín y tablas n-gram externalizadas sobre la calidad, con métricas KLD y acuerdo top-1 publicadas frente a alternativas.
- Evaluación comparativa de motores de inferencia: al ser un formato exclusivo de sushi, permite medir el rendimiento de este motor frente a mlx-lm, exllamav3 o vLLM en el mismo modelo base.

## Benchmarks y rendimiento

Calidad frente al checkpoint bf16 (KLD sobre 16 prompts x 512 tokens, 7186 posiciones, KV cache kv8):

| Pack | Pesos en memoria de GPU (GiB) | KLD | Acuerdo top-1 |
|---|---|---|---|
| Sushi-4bpw | 63,68 | 0,0592 | 92,89 % |
| oMLX oQ5e | 83,97 | 0,0625 | 92,40 % |
| mlx-serve mixed-4-8bit | 70,13 | 0,0818 | 91,39 % |
| Sushi-3bpw (tabla n-gram 4 bits) | 49,33 | 0,1036 | 90,31 % |
| Sushi-2.6bpw (tabla n-gram 4 bits) | 43,95 | 0,1355 | 89,08 % |
| oMLX oQ4e | 69,21 | 0,1370 | 88,87 % |
| mlx-serve iQ-MLX 3.3bpw | 50,60 | 0,1987 | 86,28 % |
| Vontra 4-bit g32 (TensorFold) | 75,60 | 0,2074 | 85,01 % |
| Sushi-2bpw (tabla n-gram 4 bits) | 34,97 | 0,2080 | 85,94 % |

Impacto de la tabla n-gram según el pack:

| Tabla | Tamaño en disco | Se distribuye con | KLD con Sushi-3bpw | KLD con Sushi-4bpw |
|---|---|---|---|---|
| 4 bits, grupo 32 | 29,8 GiB | Sushi-3bpw | 0,1036 | 0,0654 |
| bf16 | 95,4 GiB | Sushi-4bpw | 0,1006 | 0,0592 |

Evaluación LLMProbe Hard 50 (MMLU-Pro, OlympiadBench, LiveBench, NIST Juliet), con llmprobe 0.6.12, xhigh effort, 12k tokens de razonamiento y 16k de salida, KV y MTP en 8 bits: 45 correctas, 5 incorrectas, 0 parciales, 90,0 %.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria: objetivo declarado de un Mac con 96 GB de memoria unificada. No cabe en un Mac de 64 GB; para ese caso el autor remite a Sushi-3bpw.
- Pesos en memoria de GPU: 63,68 GiB para este pack.
- Disco: aproximadamente 159 GiB en total (63,7 GiB de pesos más 95,4 GiB de tabla n-gram). Con la tabla de 4 bits se ahorran 66 GiB de disco sin cambiar el consumo de GPU.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable; el pack requiere Apple Silicon.
- Cabe en GPU de consumo: solo en Apple Silicon de gama alta con 96 GB o más de memoria unificada.
- Software: sushi v1.0.0 o superior, macOS 26.2 o superior. No carga en transformers, vLLM, mlx-lm ni exllamav3.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KLD vs bf16 | Pesos en GPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sushi-4bpw (este pack) | 36,56 B totales | 1.048.576 | 0,0592 | 63,68 GiB | qwen-community-1.0 | Hugging Face, solo sushi |
| oMLX oQ5e | mismo base | mismo base | 0,0625 | 83,97 GiB | qwen-community-1.0 | Hugging Face |
| mlx-serve mixed-4-8bit | mismo base | mismo base | 0,0818 | 70,13 GiB | qwen-community-1.0 | Hugging Face |
| Sushi-3bpw | mismo base | mismo base | 0,1036 | 49,33 GiB | qwen-community-1.0 | Hugging Face, solo sushi |

Todos los comparables son empaquetados del mismo modelo base Qwen/Qwen3.8-Flash-Next, por lo que la comparación se centra en la relación calidad-memoria de cada cuantización y no en capacidades distintas del modelo.

## Limitaciones y advertencias

- Exclusividad de motor: el pack solo funciona con sushi v1.0.0 o superior en Apple Silicon con macOS 26.2 o superior; no es portable a transformers, vLLM, mlx-lm ni exllamav3.
- Requisito de memoria elevado: necesita un Mac de 96 GB; en 64 GB hay que usar el pack de 3 bpw con mayor pérdida de calidad.
- Huella en disco: 159 GiB con la tabla bf16, lo que puede ser prohibitivo en equipos con SSD pequeño.
- Degradación de calidad por cuantización: KLD de 0,0592 y 7,11 % de desacuerdo top-1 frente al bf16; en tareas sensibles a tokens de baja probabilidad puede acumular error.
- Idiomas soportados: no disponible, lo que impide garantizar cobertura multilingüe.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo general de los modelos generativos.
- Licencia: Qwen Community License 1.0, con condiciones específicas para servicios comerciales a gran escala; es responsabilidad del usuario revisar `LICENSE` antes de un despliegue comercial.
- La evaluación LLMProbe Hard 50 se realizó con una configuración concreta (xhigh effort, 12k de razonamiento, KV y MTP en 8 bits) y no es extrapolable a otros ajustes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-4bpw
- Ficheros del repositorio: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-4bpw/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack hermano Sushi-3bpw: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-3bpw
- Motor sushi: https://github.com/beamivalice/sushi
- Documentación de uso de sushi: https://github.com/beamivalice/sushi/blob/main/docs/usage.md
- mlx-serve (proyecto del que deriva sushi): https://github.com/ddalcu/mlx-serve
- Pack mlx-serve mixed-4-8bit: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit
- Pack mlx-serve iQ-MLX 3.3bpw: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-3.3bpw

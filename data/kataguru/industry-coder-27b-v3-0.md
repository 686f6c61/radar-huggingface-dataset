# kataguru/Industry-Coder-27B-v3.0

## Resumen

Kataguru Industry-Coder-27B-v3.0 es un ajuste fino (fine-tune) de tipo instrucción y agéntico construido sobre el modelo base Qwen/Qwen3.8-27B. Lo desarrolla el usuario independiente kataguru y se publica bajo licencia Apache 2.0. El modelo está orientado a ingeniería de software, automatización industrial (PLC, CNC, IEC 61131-3, TwinCAT 3, Siemens SCL), ciberseguridad y orquestación de agentes con tool calling paralelo. Es un modelo denso de 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) con pesos completos en BF16.

La arquitectura subyacente es `Qwen3_5ForConditionalGeneration`, descrita por el autor como un transformer híbrido denso que combina Gated DeltaNet con atención softmax completa, e incorpora un codificador visual multimodal de 27 capas y un módulo de predicción multi-token (MTP). Mantiene la ventana de contexto nativa de 262.144 tokens del modelo base. El pipeline declarado es image-text-to-text, por lo que acepta entradas de imagen y texto.

La relevancia de esta versión radica en que el autor reporta mejoras medibles frente a su release anterior (v2.0) y frente al base en un conjunto de 15 benchmarks, con un foco explícito en código competitivo, detección de irrelevancia en llamadas a herramientas y razonamiento STEM de posgrado. Es un modelo de nicho, con muy poca tracción pública (26 descargas, 0 likes en el momento de la consulta), lo que conviene tener en cuenta antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso `Qwen3_5ForConditionalGeneration` (Gated DeltaNet + atención softmax completa), con codificador visual multimodal y módulo MTP |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (ventana nativa) |
| Tipos de cuantizacion | Pesos publicados en BF16; el autor referencia variantes NVFP4 y W4A16-AWQ en repositorios separados |
| Idiomas soportados | en, fi, et, hu, tr (inglés, finés, estonio, húngaro, turco) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18 shards, BF16, 55,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 27,8 B de parámetros que combina capas de Gated DeltaNet (atención lineal recurrente) con capas de atención softmax completa, e incluye un codificador visual de 27 capas (`model.visual.*`, 333 tensores BF16) y un módulo de predicción multi-token (`mtp.*`, 15 tensores BF16). El ajuste fino conserva estos subsistemas y la ventana de contexto nativa de 262.144 tokens.

El autor describe el proceso de entrenamiento como un pipeline propietario denominado «Triple-Adaptive Multi-Dynamic Pipeline (v4.1)», que incluye ortogonalización residual SOMA/ARA, un QLoRA ortogonal por subespacios dividido en tres fases (r=16 con índices `[0:8]` y `[8:16]`) y una cuarta fase de annealing centrada en modo de razonamiento multi-dinámico, código competitivo y tool calling paralelo. Los pesos finales se fusionan en BF16 a partir de precisión intermedia float32 sobre 496 pares LoRA 2D ortonormales. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de nivel STEM de posgrado (el autor reporta resultados en GPQA Diamond y GSM8K).
- Generación y resolución de código, con foco en código competitivo (LiveCodeBench v6) y algoritmos.
- Codificación industrial: Siemens SCL, Beckhoff TwinCAT 3 Structured Text, G-code para CNC e IEC 61131-3.
- Tool calling y function calling, incluido tool calling paralelo (evaluado con BFCL V4).
- Detección de irrelevancia en llamadas a herramientas (abstención cuando no procede invocar una función).
- Capacidades multimodales de visión (pipeline image-text-to-text, codificador visual de 27 capas).
- Modo de razonamiento (thinking mode) según la fase de annealing descrita por el autor.
- Multilingüe nativo en inglés y finés, con soporte adicional de estonio, húngaro y turco.
- Orientación a agentes de código autónomos (IDE/CLI) y orquestación multi-paso.
- El autor etiqueta el modelo como «uncensored» y «anti-sycophancy», lo que implica un ajuste deliberado para reducir rechazos y adulación en las respuestas.

## Casos de uso

- Agentes de código autónomos en IDE o CLI: el modelo puede mantener sesiones largas de refactorización y depuración gracias a su contexto de 262.144 tokens y a su soporte de tool calling, integrándose en flujos tipo agente que leen, editan y ejecutan código.
- Automatización industrial con PLC: generación y revisión de lógica en Siemens SCL, TwinCAT 3 Structured Text e IEC 61131-3, adecuado para equipos de ingeniería de control que necesitan asistencia sobre lenguajes de nicho poco representados en modelos generalistas.
- Programación de mecanizado CNC: generación y explicación de G-code a partir de descripciones de operaciones, útil en talleres y entornos de fabricación que documentan procesos.
- Asistencia en ciberseguridad: análisis de código y revisión de configuraciones con un modelo ajustado para tareas de seguridad, apoyándose en el modo de razonamiento para explicar hallazgos.
- Orquestación de herramientas en producción: llamadas paralelas a APIs y funciones (BFCL V4) para pipelines que necesitan resolver varias subtareas simultáneamente, con detección de irrelevancia para evitar invocaciones espurias.
- Razonamiento STEM y resolución de problemas matemáticos: útil en entornos educativos o de investigación que requieren cadenas de razonamiento largas (GSM8K, GPQA Diamond).
- Atención en finés y otras lenguas ugrofinesas: aplicaciones de soporte técnico o documentación para mercados finlandés, estonio y húngaro, donde la mayoría de modelos abiertos rinden peor.
- Procesamiento multimodal de documentación técnica: al aceptar imagen y texto, puede interpretar diagramas, esquemas eléctricos o capturas de HMI junto con instrucciones textuales.

## Benchmarks y rendimiento

El autor publica una suite de 15 benchmarks ejecutada en 2x NVIDIA GeForce RTX 5090 de 32 GB (TP=2, CUDAGraphs activados). Los datos proceden de la model card y no han sido verificados de forma independiente.

| Benchmark | Metrica | Qwen3.8-27B (base) | Industry-Coder v2.0 | Industry-Coder v3.0 |
|---|---|---|---|---|
| Media de los 15 benchmarks | Mean | 68,85 % | 68,73 % | 71,90 % |
| Media cognitiva (11 tareas) | Mean | 70,40 % | 70,41 % | 70,70 % |
| LiveCodeBench v6 (175 tareas) | Pass@1 | 58,86 % | 42,29 % | 64,57 % |
| LCB v6 Easy (n=43) | Pass@1 | 95,35 % | 95,35 % | 100,00 % |
| LCB v6 Medium (n=52) | Pass@1 | 69,23 % | 48,08 % | 82,69 % |
| LCB v6 Hard (n=80) | Pass@1 | 32,50 % | 10,00 % | 33,75 % |
| LCB v6 LeetCode (n=63) | Pass@1 | no disponible | no disponible | 85,71 % |
| BFCL V4 Single-Turn AST (3.641 tareas) | Overall AST | 85,44 % | 73,14 % | 86,27 % |
| BFCL Non-Live AST | AST | 87,89 % | 61,02 % | 89,19 % |
| BFCL Live AST | AST | 83,00 % | 85,27 % | 83,35 % |
| BFCL Live Parallel AST | Parallel AST | 81,25 % | 25,00 % | 87,50 % |
| BFCL Non-Live Parallel AST | Parallel AST | 91,50 % | 29,50 % | 94,50 % |
| BFCL Non-Live Parallel Multiple AST | Parallel Mult. | 86,50 % | no disponible | 90,50 % |
| BFCL Irrelevance Detection | Abstention | 75,26 % | 48,14 % | 70,50 % |
| GPQA Diamond (198 preguntas) | CoT Exact | 77,27 % | 66,16 % | 82,32 % |
| GSM8K (1.319, CoT 1024 tok) | Strict / Flex | 87,19 % | 86,73 % / 87,79 % | 92,12 % / 91,74 % |
| IFEval Strict (541 prompts) | Prompt / Inst | 69,87 % / 77,82 % | 74,86 % / no disponible | no disponible en el extracto |

Nota: la información proporcionada se corta en la fila de IFEval; los resultados de v3.0 para ese benchmark no están disponibles en el extracto consultado.

## Requisitos de hardware

- Pesos completos en BF16: 55,6 GB, por lo que requieren al menos 2 GPU de 48-80 GB con tensor parallelism (el autor recomienda `vLLM` con TP=2 en 2x 48-80 GB).
- Variantes cuantizadas: el autor referencia `Industry-Coder-27B-v3.0-NVFP4` y `Industry-Coder-27B-v3.0-W4A16-AWQ`, pensadas para 1-2 GPU de 32 GB.
- GPU consumer: la variante W4A16-AWQ o NVFP4 podría caber en una RTX 5090 de 32 GB; los pesos BF16 completos no caben en una sola GPU consumer.
- Despliegue: `vLLM` es el runtime recomendado por el autor; el modelo es compatible con `transformers`. No se mencionan explícitamente llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. Los benchmarks se ejecutaron con CUDAGraphs activados en 2x RTX 5090, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kataguru Industry-Coder-27B-v3.0 | 27,8 B (denso) | 262.144 | Código, automatización industrial, agentes, multimodal | Apache 2.0 | Hugging Face (26 descargas) |
| Qwen/Qwen3.8-27B (base) | 27,8 B (denso) | 262.144 | Propósito general, multimodal | según modelo base (no disponible en el extracto) | Hugging Face |
| Kataguru Industry-Coder-27B-v2.0 | 27,8 B (denso) | 262.144 | Versión anterior del mismo ajuste | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos de la competencia (por ejemplo, otros fine-tunes de código sobre bases equivalentes) en la información proporcionada, por lo que la comparación cuantitativa se limita a las tres variantes anteriores.

## Limitaciones y advertencias

- Los benchmarks son autopublicados por el autor y no han sido verificados de forma independiente; conviene tratarlos con cautela.
- El modelo tiene una tracción pública mínima (26 descargas, 0 likes), lo que implica escasa validación por parte de la comunidad.
- La etiqueta «uncensored» sugiere que se han relajado los mecanismos de rechazo, lo que puede aumentar el riesgo de generar contenido inapropiado o inseguro en producción.
- La etiqueta «anti-sycophancy» implica un ajuste deliberado del estilo de respuesta que puede no encajar con todos los productos.
- Riesgo de alucinación inherente a los modelos de 27 B; no se documentan evaluaciones específicas de factualidad.
- El soporte multilingüe se limita a en, fi, et, hu y tr; el castellano no figura entre los idiomas declarados, por lo que el rendimiento en español no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen/Qwen3.8-27B deben verificarse por separado.
- El pipeline declarado es image-text-to-text, pero no se detallan evaluaciones de rendimiento multimodal en la información disponible.
- El proceso de entrenamiento descrito (SOMA/ARA, QLoRA por subespacios) es propietario y no reproducible a partir de la información publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kataguru/Industry-Coder-27B-v3.0
- Versión anterior v2.0: https://huggingface.co/kataguru/Industry-Coder-27B-v2.0
- Variante NVFP4: https://huggingface.co/kataguru/Industry-Coder-27B-v3.0-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Industry-Coder-27B-v3.0-W4A16-AWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

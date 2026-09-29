# AxionML/Qwen3.5-397B-A17B-NVFP4

## Resumen

AxionML/Qwen3.5-397B-A17B-NVFP4 es un espejo (mirror) en HuggingFace de la versión cuantizada en NVFP4 desarrollada por NVIDIA de Qwen3.5-397B-A17B, el modelo fundacional multimodal de Qwen con arquitectura MoE dispersa. El repositorio no modifica los pesos: es una copia sin alteraciones de `nvidia/Qwen3.5-397B-A17B-NVFP4-V2` (revisión `8f590eae8f10bf55d9a46f79ea0280bde435c9f8`), publicada por AxionML para facilitar el despliegue listo para servir. Resuelve el problema del coste de inferencia de un modelo de ~397B parámetros totales con 17B activados, comprimiéndolo a un checkpoint de aproximadamente 244 GB que cabe en 4 aceleradores Blackwell con tensor parallelism.

La arquitectura combina atención híbrida (Gated DeltaNet más Gated Attention) con encoder de visión, lo que habilita entrada de imagen y texto (`image-text-to-text`) y una ventana de contexto de 262K tokens. La cuantización usa una receta mixta: expertos enrutados en NVFP4 con búsqueda de escalas por MSE, y atención y expertos compartidos en FP8 por tensor, con caché KV también en FP8. Según NVIDIA, el resultado queda dentro del ruido estadístico respecto al checkpoint FP8 del modelo base en los benchmarks publicados.

El modelo es relevante ahora porque traslada un modelo frontera multimodal de escala 400B al terreno del despliegue práctico sobre hardware Blackwell, con licencia Apache 2.0 que permite uso comercial, y con una configuración de SGLang ya validada en B300. Su interés principal es de infraestructura: servir capacidades de razonamiento, código, agentes y visión a un coste por token sustancialmente menor que el BF16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención híbrida (Gated DeltaNet + Gated Attention) y encoder de visión |
| Parametros totales | 397B según la model card del autor; el recuento de safetensors del repositorio indica 210.124.400.624 parámetros almacenados (discrepancia no aclarada en la documentación) |
| Parametros activos | 17B |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Receta mixta NVFP4/FP8 (`modelopt_mixed`): expertos enrutados en NVFP4 con búsqueda de escalas por MSE; atención y expertos compartidos en FP8 por tensor; caché KV en FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato | safetensors (librería `transformers`; tag `endpoints_compatible`) |
| Modelo base | Qwen/Qwen3.5-397B-A17B |
| Origen de la cuantizacion | nvidia/Qwen3.5-397B-A17B-NVFP4-V2 (NVIDIA Model Optimizer v0.45.0.dev173) |
| Tamano del repositorio | 243,7 GB (checkpoint declarado: ~244 GB) |
| Dataset de calibracion | cnn_dailymail; Nemotron-Post-Training-Dataset-v2 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos (MoE) con atención híbrida: combina capas de Gated DeltaNet (mecanismo de estado recurrente lineal, del tipo SSM/linear attention) con capas de Gated Attention, más un encoder de visión que permite el procesamiento conjunto de tokens de imagen y texto mediante entrenamiento con fusión temprana de tokens multimodales. El modelo tiene 397B parámetros totales con 17B activados por token, y una ventana de contexto de 262K tokens. La información disponible no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; la model card del espejo remite a la del modelo base y a la del checkpoint de NVIDIA para esos detalles.

Lo que sí está documentado es el proceso de cuantización, que es el aporte técnico específico de este repositorio. NVFP4 combina un codebook E2M1 de 4 bits con escalado por bloques de 16 elementos en FP8 (E4M3), de modo que los valores almacenados en 4 bits conservan utilidad numérica: el codebook E2M1 ofrece magnitudes representables no uniformes hasta ±6 y recurre a saturación en lugar de codificaciones IEEE NaN/Inf, mientras que la escala FP8 permite escalas fraccionarias en vez de potencias de dos (E8M0). En los Tensor Cores de Blackwell, los multiplicadores FP4 nativos explotan la simplicidad de E2M1 y la acumulación en FP32 protege la precisión del producto escalar. La receta V2 se diferencia de la V1 en dos puntos: añade búsqueda de escalas basada en MSE y cuantiza también la atención y los expertos compartidos en FP8 (la V1 los dejaba en BF16 y pesaba ~251 GB, frente a los ~244 GB de la V2).

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262K tokens.
- Razonamiento complejo: datos publicados en GPQA Diamond (87,7 en NVFP4) y AA-LCR (67,8).
- Generación y razonamiento sobre código: SciCode (48,1) y capacidades de coding señaladas en la documentación del modelo base.
- Matemáticas: no se publican resultados específicos de benchmarks matemáticos en la información disponible.
- Visión: modelo nativo image-text-to-text con encoder de visión y entrenamiento con fusión temprana de tokens multimodales; MMMU Pro (78,4) y capacidades de comprensión visual destacadas por proveedores de inferencia.
- Seguimiento de instrucciones: IFBench (76,5).
- Capacidades agénticas y uso de herramientas: τ²-Bench Telecom (95,2); la documentación de terceros menciona soporte para flujos agentivos y RAG, aunque la model card del espejo no detalla explícitamente el esquema de tool calling o function calling.
- Multilingüismo: no disponible (no se declaran idiomas soportados).
- Capacidades especiales: estado recurrente tipo Mamba/DeltaNet, que en Blackwell puede mantenerse en BF16 mediante `--mamba-ssm-dtype bfloat16` para acelerar la decodificación.

## Casos de uso

- Asistencia multimodal en atención al cliente: el modelo acepta imágenes y texto y mantiene 262K tokens de contexto, lo que permite adjuntar capturas, documentos o fotografías de producto junto con un historial de conversación largo sin truncar información relevante.
- Agentes de automatización multi-paso: los resultados en τ²-Bench Telecom (95,2) y su naturaleza orientada a flujos agentivos lo hacen adecuado para orquestar llamadas a herramientas en procesos de soporte técnico o gestión de incidencias.
- Generación de código en producción: con SciCode en 48,1 y capacidades de razonamiento sobre repositorios, puede integrarse en pipelines de revisión de código, generación de tests o explicación de diffs dentro de CI/CD, siempre que la infraestructura soporte el coste de 4 aceleradores Blackwell.
- Análisis de documentación técnica extensa: la ventana de 262K tokens permite procesar manuales completos, expedientes o conjuntos de especificaciones en una sola pasada, útil en ingeniería, legal o compliance.
- Razonamiento científico y técnico asistido: GPQA Diamond de 87,7 lo sitúa como candidato para responder consultas de dominio experto, con revisión humana, en entornos de investigación y educación avanzada.
- Transcripción y comprensión de documentos escaneados con razonamiento posterior: al ser image-text-to-text, puede extraer información de formularios, gráficos o diagramas y continuar el razonamiento sobre los datos extraídos en el mismo contexto.
- Evaluación comparativa de modelos cuantizados: sirve como referencia para medir cuánto degrada NVFP4 frente a FP8 en tareas concretas, ya que NVIDIA publica ambas columnas de resultados y el checkpoint está fijado a una revisión concreta.
- Despliegue self-hosted con requisitos de soberanía de datos: la licencia Apache 2.0 permite ejecutar el modelo íntegramente en infraestructura propia, incluyendo uso comercial, sin depender de APIs externas.

## Benchmarks y rendimiento

Resultados publicados por NVIDIA para este checkpoint, comparados con el baseline `Qwen/Qwen3.5-397B-A17B-FP8`. Configuración de evaluación: `temperature=0.6`, `top_p=0.95`, máximo 64.000 tokens (128.000 para τ²-Bench Telecom).

| Benchmark | FP8 (baseline) | NVFP4 (V2) |
|---|---:|---:|
| MMMU Pro | 78,7 | 78,4 |
| GPQA Diamond | 87,2 | 87,7 |
| SciCode | 46,7 | 48,1 |
| AA-LCR | 68,8 | 67,8 |
| IFBench | 76,1 | 76,5 |
| τ²-Bench Telecom | 95,4 | 95,2 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni métricas de throughput o latencia para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa aproximadamente 244 GB de pesos, a los que hay que sumar la caché KV en FP8, activaciones y el estado recurrente. Para 262K tokens de contexto, la caché KV es un factor dominante y debe dimensionarse por encima del peso del modelo.
- Configuración validada: SGLang con `--tensor-parallel-size 4` sobre B300 (288 GB de HBM3e por GPU), con la imagen `lmsysorg/sglang:v0.5.12.post1-cu130`, según la model card.
- Alternativa documentada para el modelo base completo: 8x B200 para despliegue con SGLang/vLLM según la ficha de Lambda.
- GPU recomendadas: NVIDIA B300 (validada), B200 y familia Blackwell en general, ya que NVFP4 requiere soporte nativo de FP4 en Tensor Cores. El rendimiento en arquitecturas anteriores (Hopper, Ada) no está validado y la decodificación NVFP4 no es nativa en ellas.
- GPU de consumo: no. Un checkpoint de ~244 GB no cabe en ninguna GPU de consumo actual; se necesitaría un clúster multi-GPU con interconnect de alta velocidad (NVLink) para que el tensor parallelism sea viable.
- Opciones de despliegue: SGLang (validado, con `--quantization modelopt_mixed --disable-radix-cache --trust-remote-code`), vLLM (mencionado en documentación de terceros para el modelo base), `transformers`, NVIDIA NIM, y variantes MLX para Apple Silicon publicadas por terceros (no esta versión NVFP4 concreta).
- Latencia y throughput: no disponible. La model card sugiere `--mamba-ssm-dtype bfloat16` para mantener el estado SSM en BF16 y acelerar la decodificación en Blackwell.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Tamano | Licencia |
|---|---|---|---|---|---|
| AxionML/Qwen3.5-397B-A17B-NVFP4 (este) | 397B totales / 17B activos | 262K | NVFP4 + FP8 mixto (modelopt_mixed) | ~244 GB | Apache 2.0 |
| nvidia/Qwen3.5-397B-A17B-NVFP4-V2 | 397B / 17B | 262K | NVFP4 + FP8 mixto | ~244 GB | Apache 2.0 |
| nvidia/Qwen3.5-397B-A17B-NVFP4 (V1) | 397B / 17B | 262K | NVFP4 en expertos; atención y expertos compartidos en BF16 | ~251 GB | Apache 2.0 |
| Qwen/Qwen3.5-397B-A17B-FP8 | 397B / 17B | 262K | FP8 | no disponible | Apache 2.0 |
| Qwen/Qwen3.5-397B-A17B | 397B / 17B | 262K | BF16 | no disponible | Apache 2.0 |
| mlx-community/Qwen3.5-397B-A17B-nvfp4 | 397B / 17B | 262K | NVFP4 para MLX | no disponible | no disponible |

La diferencia práctica entre el presente repositorio y el de NVIDIA es nula en contenido de pesos: es una copia sin modificar, fijada a una revisión concreta. Su valor añadido es la distribución y el etiquetado como modelo listo para servir, además del compromiso de espejo para casos de despliegue. Frente a la V1, la V2 reduce el tamaño en unos 7 GB y aplica FP8 a atención y expertos compartidos, con resultados dentro del ruido del baseline FP8.

## Limitaciones y advertencias

- El modelo base se entrenó con datos que pueden contener lenguaje tóxico y sesgos sociales; el modelo cuantizado hereda esas limitaciones y puede generar contenido inexacto, sesgado u ofensivo.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no hay datos específicos de tasas de alucinación para este checkpoint.
- No se declaran idiomas soportados en la ficha de HuggingFace, por lo que el rendimiento multilingüe no está documentado para esta versión.
- NVFP4 depende de los Tensor Cores FP4 de Blackwell; en GPUs Hopper o anteriores el soporte de esta cuantización es limitado o inexistente, y no se han publicado resultados de rendimiento en esas plataformas.
- El repositorio tiene 0 descargas y 0 likes y fue creado el 2026-09-29, por lo que carece de validación independiente de la comunidad; la propia model card indica que la validación la hizo NVIDIA con SGLang en B300.
- El requisito de ~244 GB de pesos más caché KV para 262K tokens implica un coste de infraestructura elevado y descarta cualquier despliegue en hardware de consumo.
- Existe una discrepancia entre los 397B parámetros declarados en la model card y los 210.124.400.624 parámetros reportados por safetensors en el repositorio; conviene verificar el recuento real antes de dimensionar hardware a partir de él.
- La licencia Apache 2.0 permite uso comercial, pero la model card remite a la del modelo base y a la de NVIDIA para condiciones completas; el crédito de la cuantización corresponde a NVIDIA y el de los pesos base a Qwen.
- Aunque la documentación de terceros menciona capacidades agentivas y RAG, la model card del espejo no especifica el formato exacto de tool calling soportado.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/AxionML/Qwen3.5-397B-A17B-NVFP4
- Checkpoint de cuantización original de NVIDIA: https://huggingface.co/nvidia/Qwen3.5-397B-A17B-NVFP4-V2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Baseline FP8: https://huggingface.co/Qwen/Qwen3.5-397B-A17B-FP8
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- NVIDIA NIM (modelo base): https://build.nvidia.com/qwen/qwen3.5-397b-a17b
- Guía de arquitectura y capacidades (Qubrid): https://www.qubrid.com/blog/qwen-3-5-397b-a17b-complete-guide-to-architecture-capabilities-and-real-world-applications
- Ficha y precios de API (Together AI): https://www.together.ai/models/qwen3-5-397b-a17b
- Guía de despliegue en Lambda: https://lambda.ai/inference-models/qwen/qwen3.5-397b-a17b
- Variante MLX para Apple Silicon: https://huggingface.co/mlx-community/Qwen3.5-397B-A17B-nvfp4
- Dataset de calibración cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibración Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2

# eyes-ml/Ripple-65B-Base-Preview

## Resumen

Ripple-65B Base Preview es un modelo de lenguaje de 65.000 millones de parámetros desarrollado por Ricursive Intelligence (publicado en Hugging Face bajo el espacio `eyes-ml`). Se trata de un transformer denso entrenado desde cero sobre 12 billones de tokens, con un corpus predominantemente en inglés y código, y una longitud de contexto que durante el entrenamiento alcanza los 2M tokens. Este repositorio concreto contiene únicamente el checkpoint base (pretrain-only), sin midtraining, sin datos sintéticos de QA ni ajuste por instrucciones; la versión instruct se distribuye en repos separados.

La relevancia del modelo reside en su relación entre tamaño y rendimiento en tareas agénticas y de razonamiento: según la model card, la versión instruct alcanza 80,52 en TerminalBench 2.1, superando a modelos abiertos estadounidenses de mayor tamaño como Reflection Beam 501B (80,1), Meta Muse Spark Open 816B (76,4) o NVIDIA Nemotron 3 Ultra 550B (56,4). Además, el equipo apuesta por una arquitectura densa en lugar de MoE para simplificar la infraestructura de entrenamiento y servicio, manteniendo un 40% de MFU con sharding simple y sin kernels personalizados.

Arquitectónicamente, Ripple-65B adopta una proporción "thin-and-deep" con `d_model` de 5120 y 80 capas, partiendo de una arquitectura tipo Gemma 3N en lugar de la tipo Llama de Olmo 3. El modelo está diseñado para ejecutarse en hardware de consumo como una NVIDIA DGX Spark gracias a su tamaño contenido, y alcanza 250 tok/s en 2×B200 con batch 8 antes de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (estilo Gemma 3N), thin-and-deep |
| Parámetros totales | 64.782.689.360 (~65B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1M tokens en la versión Preview; entrenamiento con secuencias de hasta 2M |
| Tipos de cuantización | BF16 (nativo); NVFP4 disponible en checkpoint separado |
| Idiomas soportados | Predominantemente inglés y código (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

Ripple-65B es un transformer denso con una proporción "thin-and-deep": `d_model` de 5120 y 80 capas totales. El equipo partió de una arquitectura tipo Llama (Olmo 3) y migró a una arquitectura tipo Gemma 3N para mejorar la estabilidad del entrenamiento a escala. Para reforzar el razonamiento, se sobredimensiona el número de cabezas de atención, se incrementa la ratio de capas SWA (sliding window attention) frente a globales y se reduce la ventana SWA para compensar el coste. Se añaden además recorte de activaciones en la FFN (FFN activation clipping), atención con compuertas (gated attention), NoPE global y value residuals.

El preentrenamiento se realizó desde cero sobre 12 billones de tokens de texto (predominantemente inglés y código) con longitud de secuencia de 8K, en 877.500 pasos y batch size escalado de 1408 a 3072. El pipeline completo de postentrenamiento (no incluido en este checkpoint base) comprende midtraining de 200B tokens a 64K de secuencia, una fase de contexto largo de 6,5B tokens a 2M, SFT de 183B tokens a 128K, long-context SFT de 13,5B tokens a 2M y una fase de RL mixto por dominios de 700 pasos a 128K con batch 2048. El modelo se entrenó en BF16 sin kernels personalizados ni cuantización, manteniendo un 40% de MFU.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un checkpoint pretrain-only, por lo que sus capacidades de instrucción y razonamiento conversacional dependen del postentrenamiento (no incluido en este repo).
- Código y tareas agénticas: el linaje Ripple está optimizado para coding agéntico; la versión instruct reporta 80,52 en TerminalBench 2.1.
- Contexto largo: soporte de hasta 1M tokens en la versión Preview, con fases de entrenamiento a 2M de secuencia.
- Capacidades multilingües: limitadas; el corpus es predominantemente inglés y código.
- Tool calling / function calling: no confirmado para este checkpoint base; asociado a la versión instruct.
- Modo thinking / agentes multi-paso: no aplicable al checkpoint base; presente en la variante instruct.
- Visión y audio: no disponibles.

## Casos de uso

- Fine-tuning de dominio: al ser un checkpoint base pretrain-only, es adecuado como punto de partida para SFT y DPO propios sobre dominios específicos (legal, médico, financiero), aprovechando sus 12T tokens de preentrenamiento como base de conocimiento general y de código.
- Investigación en recetas de postentrenamiento: permite reproducir o comparar pipelines de midtraining, long-context SFT y RL sin partir de cero, dado que el checkpoint base está limpio de datos sintéticos de QA.
- Desarrollo de asistentes de código: la familia Ripple está optimizada para coding agéntico; partiendo del base se puede construir un modelo de autocompletado o revisión de código con contexto largo (hasta 1M tokens) para repositorios completos.
- Procesamiento de documentos extensos: la ventana de contexto de hasta 1M tokens permite tareas de resumen, extracción y QA sobre libros, expedientes o bases de código completas, previo ajuste instruct.
- Despliegue en hardware de consumo: con 65B parámetros en BF16 y un checkpoint NVFP4 disponible, el modelo puede ejecutarse en estaciones como NVIDIA DGX Spark, habilitando prototipos locales sin clúster.
- Servicio de alto throughput en datacenter: con 250 tok/s en 2×B200 (batch 8, sin cuantización ni kernels personalizados), es viable para pipelines de generación por lotes o evaluación masiva.
- Base para investigación en eficiencia computacional: la model card reporta una mejora de eficiencia de cómputo de 16× frente a la escalera de Olmo 3 (hasta 55× en el run completo), lo que lo convierte en referencia para estudiar scaling laws y arquitecturas densas.

## Benchmarks y rendimiento

La model card incluye resultados de la versión **instruct** (no del checkpoint base de este repo). Se reproducen a continuación los datos disponibles; las celdas no presentes en la información proporcionada se marcan como no disponibles.

| Benchmark | Ripple-65B Preview | Nemotron 3 Ultra 550B | Inkling 975B | Muse Spark Open 816B | Reflection Beam 501B |
|---|---|---|---|---|---|
| TerminalBench 2.1 | 80,52 | 56,4 | 63,8 | 76,4 | 80,1 |
| SWE-bench Pro v2.0 Hard | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepSWE 1.1 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks para el checkpoint base.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 130 GB de pesos (el repo ocupa 129,6 GB), por lo que se requieren al menos 2×H100 80GB o 2×B200 para servicio en BF16.
- Cuantización NVFP4: existe un checkpoint NVFP4 separado que reduce sustancialmente el footprint y permite despliegue en GPUs con menos memoria; el dato exacto de VRAM no está disponible en la información proporcionada.
- GPU recomendadas: NVIDIA B200 (250 tok/s en 2×B200, batch 8, sin cuantización), H100 para servicio BF16, y NVIDIA DGX Spark para ejecución local con el checkpoint NVFP4.
- GPU de consumo: el modelo no cabe en GPUs consumer convencionales (RTX 4090, 24 GB) en BF16; el checkpoint NVFP4 está pensado para hardware como DGX Spark.
- Opciones de despliegue: no se especifican frameworks concretos (vLLM, llama.cpp, Ollama, TGI) en la información disponible; el repo incluye `custom_code`, lo que puede requerir código específico del autor.
- Latencia y throughput: 250 tok/s en 2×B200 con batch 8 en BF16, sin cuantización ni kernels personalizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TerminalBench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B Preview | 65B (denso) | Hasta 1M | 80,52 | Apache 2.0 | Hugging Face (BF16, NVFP4, base) |
| Reflection Beam 501B | 501B | no disponible | 80,1 | no disponible | no disponible |
| Meta Muse Spark Open 816B | 816B | no disponible | 76,4 | no disponible | no disponible |
| Thinking Machines Inkling 975B | 975B | no disponible | 63,8 | no disponible | no disponible |
| NVIDIA Nemotron 3 Ultra 550B | 550B | no disponible | 56,4 | no disponible | no disponible |

La comparativa se limita a los datos de TerminalBench 2.1 recogidos en la model card; no se dispone de información sobre contexto, licencia ni disponibilidad de los modelos competidores en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint base sin postentrenamiento: este repo no incluye midtraining, SFT ni RL, por lo que no sigue instrucciones ni mantiene conversaciones de forma fiable sin ajuste adicional.
- Idiomas: el corpus es predominantemente inglés y código; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación: inherente a un modelo de 65B sin alineación; puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; el corpus predominantemente inglés puede introducir sesgos culturales y lingüísticos.
- Evaluaciones agénticas: la propia model card advierte que replicar benchmarks agénticos modernos es difícil y que los resultados dependen del harness (Terminus 2, OpenCode) y de la longitud de secuencia; las cifras deben interpretarse con cautela.
- Licencia Apache 2.0: permite uso comercial, pero el repo incluye `custom_code`, por lo que conviene revisar las dependencias y el código asociado antes de integrarlo en producción.
- Madurez: se trata de una versión "Preview" con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eyes-ml/Ripple-65B-Base-Preview
- Versión BF16 instruct (referenciada en la model card): https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Versión NVFP4: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Versión base (referenciada): https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Variante DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Blog de lanzamiento: https://www.ricursive.com/ripple
- Licencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE

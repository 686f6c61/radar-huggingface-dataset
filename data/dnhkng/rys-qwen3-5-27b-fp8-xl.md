# dnhkng/RYS-Qwen3.5-27B-FP8-XL

## Resumen

RYS-Qwen3.5-27B-FP8-XL es una cuantizacion en FP8 del modelo multimodal Qwen3.5-27B, publicada por el usuario dnhkng bajo el paraguas del proyecto RYS (documentado en su blog personal). Se trata de un artefacto derivado: no es un modelo entrenado desde cero, sino una conversion de los pesos originales de Qwen a formato FP8 con cuantizacion de grano fino y bloques de 128, pensada para reducir el espacio en disco y acelerar la inferencia manteniendo una calidad practicamente identica al modelo de referencia. El repositorio ocupa 33,9 GB y contiene 30.825.577.520 parametros reales segun los safetensors.

El modelo base, Qwen3.5-27B, es un modelo causal con codificador de vision desarrollado por el equipo Qwen (Alibaba). Combina una arquitectura hibrida de Gated DeltaNet (atencion lineal) y atencion con compuertas, con un contexto nativo de 262.144 tokens extensible hasta 1.010.000. Esta disenado para tareas de razonamiento, codigo, agentes y comprension visual, con soporte declarado de 201 idiomas y dialectos.

La relevancia de esta ficha concreta radica en que ofrece una via practica para desplegar un modelo de 27B multimodal en infraestructura con memoria limitada, ya que el formato FP8 reduce aproximadamente a la mitad el peso respecto a BF16 y es compatible con Transformers, vLLM, SGLang y KTransformers. Es una opcion util para equipos que quieran evaluar Qwen3.5-27B en produccion sin disponer de GPUs de 80 GB en configuracion multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con vision encoder: 16 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Parametros totales | 30.825.577.520 (27B nominales en el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 |
| Tipos de cuantizacion | FP8 con cuantizacion de grano fino, block size 128 |
| Idiomas soportados | 201 idiomas y dialectos (segun model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8), compatible con Transformers, vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B emplea una arquitectura hibrida que alterna capas de Gated DeltaNet (atencion lineal con 48 cabezas para V y 16 para QK, dimension de cabeza 128) con capas de Gated Attention clasica (24 cabezas Q y 4 KV, dimension 256, RoPE de 64 dimensiones). La disposicion es de 16 bloques, cada uno con tres subcapas de DeltaNet seguidas de una de atencion con compuertas, todas con FFN de dimension intermedia 17.408. La dimension oculta es 5.120, con 64 capas y embedding de 248.320 tokens. Incluye un cabezal MTP (multi-token prediction) entrenado con multiples pasos, lo que habilita decodificacion especulativa nativa.

Segun la model card, el entrenamiento combina pre-entrenamiento y post-entrenamiento con fusion temprana de tokens multimodales, lo que permite paridad cross-generacional con Qwen3 y supera a Qwen3-VL en benchmarks de razonamiento, codigo, agentes y comprension visual. Se aplico RL a escala en entornos de millones de agentes con distribuciones de tareas progresivamente complejas. La infraestructura de entrenamiento reporta cerca del 100% de eficiencia multimodal respecto a entrenamiento solo texto. No se detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset en la informacion disponible. La cuantizacion FP8 de este repositorio es una conversion posterior, no un reentrenamiento.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento extendido segun el modelo base.
- Comprension de imagenes y texto combinados (pipeline image-text-to-text), incluyendo tareas de VQA y descripcion visual.
- Generacion de codigo y matematicas, con soporte declarado para benchmarks tipo HumanEval y GSM8K en el modelo base.
- Tool calling y function calling, integrable en pipelines de agentes.
- Razonamiento agentico multi-paso, entrenado con RL en entornos de agentes.
- Capacidades multilingues amplias: 201 idiomas y dialectos.
- Decodificacion especulativa mediante cabezal MTP (multi-token prediction).
- Compatibilidad con servidores de inferencia de alto rendimiento (vLLM, SGLang, KTransformers) gracias al formato FP8.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede procesar capturas de pantalla, facturas o imagenes enviadas por el usuario junto con texto, manteniendo conversaciones multi-turno gracias a los 262.144 tokens de contexto nativo.
- Analisis de documentos extensos con imagenes: informes anuales, contratos escaneados o papers con figuras, donde la ventana de contexto extensible hasta 1.010.000 tokens permite ingerir el documento completo sin fragmentacion.
- Generacion de codigo en produccion: el soporte de tool calling y la integracion con vLLM/SGLang permiten desplegarlo como backend de asistentes de codigo o pipelines de CI/CD que invocan funciones externas.
- Agentes autonomos multi-paso: el entrenamiento con RL en entornos de agentes y el cabezal MTP lo hacen adecuado para orquestacion de tareas con llamadas a herramientas y planificacion.
- Automatizacion de soporte tecnico con vision: diagnostico de errores a partir de capturas de pantalla o fotografias de equipos, combinando OCR implicito y razonamiento.
- Despliegue en infraestructura con VRAM limitada: al estar en FP8, permite servir un modelo de 27B multimodal en una unica GPU de 40-48 GB (A100 40GB, L40S, RTX 6000 Ada) en lugar de requerir multi-GPU en BF16.
- Procesamiento multilingue a escala: traduccion, moderacion y generacion de contenido en 201 idiomas con un solo modelo.
- Investigacion en eficiencia de inferencia: util como referencia para comparar FP8 frente a BF16 en calidad y throughput sobre arquitecturas hibridas con atencion lineal.

## Benchmarks y rendimiento

Los datos de la model card corresponden al modelo base Qwen3.5-27B (no a la version FP8, que segun el autor tiene metricas "practicamente identicas"). Se reproducen a continuacion los valores disponibles en la informacion proporcionada; el resto de filas de la tabla original quedaron truncadas.

| Benchmark | GPT-5-mini 2025-08-07 | GPT-OSS-120B | Qwen3-235B-A22B | Qwen3.5-122B-A10B | Qwen3.5-27B | Qwen3.5-35B-A3B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 83,7 | 80,8 | 84,4 | 86,7 | 86,1 | 85,3 |
| MMLU-Redux | 93,7 | 91,0 | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) |

No se han publicado en la informacion disponible resultados completos de HumanEval, GSM8K ni benchmarks de vision para este artefacto FP8 concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 31-34 GB solo para pesos en FP8; con cache KV para contexto largo (262K tokens) y overhead de runtime, se recomienda 48 GB o mas para uso comodo.
- GPU recomendadas: A100 40GB, A100 80GB, H100 80GB, L40S 48GB, RTX 6000 Ada 48GB. En BF16 el modelo base requeriria del orden de 54-62 GB solo en pesos, por lo que el FP8 permite una unica GPU de 48 GB.
- Cabe en consumer GPU: no en RTX 4090 (24 GB) ni RTX 3090 (24 GB) sin cuantizacion adicional a 4-6 bits. En GPUs de 48 GB (RTX 6000 Ada, L40S) si cabe en FP8.
- Opciones de despliegue: Transformers, vLLM, SGLang, KTransformers (segun la model card). Para GPUs consumer seria necesario re-cuantizar a GGUF (no incluido en este repositorio) y usar llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modelo base incluye cabezal MTP para decodificacion especulativa, lo que deberia mejorar el throughput en vLLM/SGLang, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RYS-Qwen3.5-27B-FP8-XL (este) | 30,8B reales | 262K (ext. 1M) | Apache 2.0 | safetensors FP8 | Multimodal, hibrido DeltaNet + atencion |
| Qwen/Qwen3.5-27B (base) | 27B nominales | 262K (ext. 1M) | Apache 2.0 | safetensors BF16 | Referencia de calidad; requiere mas VRAM |
| Qwen3.5-35B-A3B | 35B totales, 3B activos (MoE) | no disponible | Apache 2.0 | safetensors | Alternativa MoE mas eficiente en inferencia |
| Qwen3-235B-A22B | 235B totales, 22B activos (MoE) | no disponible | Apache 2.0 | safetensors | Mayor calidad en MMLU-Pro (84,4) pero mucho mas pesado |
| GPT-OSS-120B | 120B (MoE) | no disponible | no disponible | no disponible | Comparable en MMLU-Pro (80,8) |

## Limitaciones y advertencias

- Es un artefacto derivado, no un modelo oficial de Qwen: la calidad depende de la conversion FP8 del autor y de la fidelidad del proceso de cuantizacion, aunque el autor afirma metricas casi identicas.
- Riesgo de alucinacion inherente a los LLM, especialmente en tareas de conocimiento factual y en comprension de imagenes con texto pequeno o borroso.
- Sesgos no documentados en la informacion disponible; el modelo base no publica una evaluacion de sesgos en la model card proporcionada.
- Limitaciones de idioma: aunque se declaran 201 idiomas, el rendimiento real puede variar mucho entre ellos y no se aportan metricas por idioma.
- Contexto extensible hasta 1.010.000 tokens: la extension mas alla de 262K requiere tecnicas adicionales (RoPE scaling u otras) no detalladas; el rendimiento en contextos muy largos no esta verificado en esta ficha.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-27B y de los pesos originales antes de desplegar en produccion.
- El repositorio tiene pocas descargas (77) y likes (18); es un artefacto de nicho sin validacion comunitaria amplia.
- No incluye pesos GGUF ni cuantizaciones de menor precision, por lo que no es directamente utilizable en GPUs consumer de 24 GB.
- La fecha de creacion (2026-03-23) y actualizacion (2026-11-14) indican un artefacto reciente; la estabilidad a largo plazo del repositorio no esta garantizada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dnhkng/RYS-Qwen3.5-27B-FP8-XL
- Blog del autor sobre el proyecto RYS: https://dnhkng.github.io/posts/rys-ii/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Version FP8 oficial de Qwen (referencia de licencia): https://huggingface.co/Qwen/Qwen3.5-27B-FP8/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai

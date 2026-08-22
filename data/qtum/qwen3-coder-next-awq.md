# qtum/Qwen3-Coder-Next-AWQ

## Resumen

Qwen3-Coder-Next-AWQ es una cuantización en formato AWQ (activation-aware weight quantization) W4A16 del modelo Qwen3-Coder-Next, un modelo de lenguaje abierto especializado en agentes de codificación, desarrollado por el equipo Qwen de Alibaba. El autor de la cuantización es `qtum`, que ha utilizado la librería `llm-compressor` del ecosistema vLLM para producir un checkpoint en formato `compressed-tensors` listo para servir con vLLM o SGLang.

El modelo base es un MoE (mixture of experts) con 80.000 millones de parámetros totales, de los cuales solo se activan aproximadamente 3.000 millones durante la inferencia. Esta arquitectura permite un rendimiento comparable a modelos con 10-20 veces más parámetros activos, pero con un coste de cómputo mucho menor. La cuantización W4A16 reduce el peso en disco de ~159 GiB (bf16) a ~40 GiB, lo que permite ejecutar el modelo en una sola GPU de 24-48 GB.

La relevancia de esta ficha radica en que el autor publica oficialmente solo una versión FP8 del modelo, mientras que esta cuantización AWQ ofrece una alternativa de 4 bits que reduce el tamaño a la mitad respecto al FP8, manteniendo los tensores de routing y la proyección de salida en bf16 para preservar la calidad del modelo base. La licencia es Apache-2.0, lo que permite uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-Next (MoE) - 48 capas, 512 expertos, top-10 routing |
| Parametros totales | 80B |
| Parametros activos | ~3B |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | AWQ W4A16 (grupo de tamaño 128); los tensores de routing (`mlp.gate`) y `lm_head` se mantienen en bf16 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | compressed-tensors (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Coder-Next es un MoE con 512 expertos y routing top-10, donde solo se activan ~3B de los 80B parámetros totales por token. Está diseñado específicamente para agentes de codificación, con una arquitectura que prioriza la eficiencia en inferencia sin sacrificar capacidad de razonamiento. El contexto de 256K tokens permite manejar repositorios de código grandes y conversaciones multi-turno extensas.

La cuantización AWQ fue realizada por `qtum` con `llm-compressor`, calibrada sobre un corpus mixto de 256 muestras de código, inglés y chino (2048 tokens cada una). El método AWQ escala cada canal de pesos según su importancia para la activación antes del redondeo a 4 bits, de modo que el error de cuantización se concentra en los canales menos relevantes. En este MoE, los tensores de routing (`mlp.gate`) y la proyección de salida (`lm_head`) se mantienen en bf16 porque un router comprimido enviaría tokens a expertos incorrectos, y el `lm_head` es la proyección que más sufre un tipo de dato global de 4 bits.

## Capacidades

- Generación de código y razonamiento de propósito general, dado que el modelo base está especializado en tareas de programación y agentes.
- Soporte de tool calling y function calling, capacidad heredada del modelo base (Qwen3-Coder-Next está diseñado para agentes de código).
- Capacidades multilingües en inglés y chino (idiomas declarados por el autor del modelo base).
- Formato de chat estándar de Qwen (ChatML) con el prompt format:
  ```
  <|im_start|>system
  {system_prompt}<|im_end|>
  <|im_start|>user
  {prompt}<|im_end|>
  <|im_start|>assistant
  ```
- No se indica soporte de visión, audio u otras modalidades; es un modelo de solo texto.

## Casos de uso

- Agentes de codificación autónomos: el modelo puede actuar como motor de un agente que navega por repositorios, edita archivos y ejecuta comandos, gracias a su contexto de 256K tokens y su capacidad de tool calling. La cuantización W4A16 permite desplegarlo en una GPU de 24-48 GB en lugar de las 159 GB que requeriría el checkpoint bf16.
- Asistente de desarrollo local (IDE): integrado en editores como VS Code, el modelo puede generar código, explicar fragmentos y refactorizar, con latencia baja gracias a la activación de solo 3B parámetros.
- Generación de código en pipelines de CI/CD: el modelo puede usarse para revisión de código automatizada o para generar tests, con soporte para tool calling que permite conectarse a APIs de repositorio.
- Atención al cliente técnica: con su capacidad multilingüe (inglés y chino) y su contexto largo, puede gestionar conversaciones de soporte sobre código, aunque su especialización principal es la programación.
- Aprendizaje y documentación: puede generar explicaciones de código, documentar funciones y crear tutoriales a partir de un repositorio, gracias a su ventana de 256K tokens.
- Investigación en eficiencia de modelos: permite estudiar el impacto de la cuantización AWQ en un MoE grande, ya que se han preservado los tensores críticos en bf16, lo que facilita comparaciones entre FP8, GPTQ y AWQ.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica de calidad proporcionada es la perplejidad en wikitext-2-raw (test), medida con vLLM, con `n_ctx = 512` y 12 chunks, directamente comparable entre los tres checkpoints:

| Pesos | Perplejidad (wikitext-2-raw) | Diferencia vs bf16 |
|---|---|---|
| bf16 (modelo base, referencia) | 7.74 | — |
| **Este repo (AWQ W4A16)** | **12.53** | +61.8% |

No se dispone de datos de MMLU, HumanEval ni otros benchmarks en la información proporcionada.

## Requisitos de hardware

- Tamaño en disco: ~40 GiB (frente a ~159 GiB del bf16 master y ~80 GiB del FP8 oficial).
- VRAM estimada: una GPU con 48 GB de VRAM puede servir el modelo cómodamente. Con 24 GB se requiere tensor parallel o pipeline parallel, o bien offload a CPU.
- GPUs recomendadas: NVIDIA A100 40/80 GB, H100 80 GB, RTX 4090 24 GB (con offload o parallelismo), RTX 6000 Ada 48 GB.
- Opciones de despliegue: vLLM y SGLang (detectan automáticamente el esquema de cuantización desde `config.json`). También es compatible con cualquier motor que lea el formato `compressed-tensors`.
- Comando de despliegue con vLLM: `vllm serve qtum/Qwen3-Coder-Next-AWQ`.
- Latencia y throughput: no se han publicado datos específicos; el modelo activa ~3B parámetros por token, lo que sugiere una inferencia eficiente, pero los números concretos dependen del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Cuantización | Tamaño | Licencia | Perplexity (wikitext-2) |
|---|---|---|---|---|---|---|---|
| Qwen3-Coder-Next (bf16) | 80B | ~3B | 256K | — | ~159 GiB | Apache-2.0 | 7.74 |
| Qwen3-Coder-Next-FP8 (oficial) | 80B | ~3B | 256K | FP8 | ~80 GiB | Apache-2.0 | no disponible |
| **Qwen3-Coder-Next-AWQ (este repo)** | 80B | ~3B | 256K | AWQ W4A16 | ~40 GiB | Apache-2.0 | 12.53 |
| Qwen3-Coder-Next-GPTQ (qtum) | 80B | ~3B | 256K | GPTQ W4A16 | ~40 GiB | Apache-2.0 | no disponible |

La comparativa se limita a las versiones del mismo modelo base, ya que no se han proporcionado datos de modelos competidores en la información de referencia.

## Limitaciones y advertencias

- La cuantización AWQ introduce una degradación de calidad: la perplejidad en wikitext-2-raw aumenta un 61.8% respecto al bf16 (12.53 vs 7.74). Esto puede traducirse en errores de código más frecuentes en tareas complejas.
- Los tensores de routing y `lm_head` se mantienen en bf16, pero el resto de pesos están en 4 bits, lo que puede afectar a la precisión en tareas de razonamiento matemático o lógico complejo.
- El modelo está entrenado principalmente para código y razonamiento; su rendimiento en tareas generales de lenguaje puede ser inferior al de modelos de propósito general.
- Idiomas soportados: solo inglés y chino. No se recomienda su uso en otros idiomas sin validación previa.
- Riesgo de alucinación: como cualquier modelo de lenguaje grande, puede generar código que no compile o soluciones incorrectas; es necesario validar la salida en entornos de producción.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad de cumplir la licencia del modelo base recae en el usuario.
- La cuantización está diseñada para vLLM y SGLang; otros motores pueden no soportar el formato `compressed-tensors` o la detección automática del esquema.
- El tamaño del repo es de 42.1 GB, lo que implica una descarga considerable y requiere espacio en disco suficiente.

## Enlaces

- Repo de HuggingFace de la cuantización: https://huggingface.co/qtum/Qwen3-Coder-Next-AWQ
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Colección de Qwen3-Coder-Next en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-coder-next
- Cuantización GPTQ (W4A16): https://huggingface.co/qtum/Qwen3-Coder-Next-GPTQ
- Cuantización FP8 oficial: https://huggingface.co/Qwen/Qwen3-Coder-Next-FP8
- Technical Report (arXiv): https://arxiv.org/html/2603.00729
- Catálogo de Microsoft Foundry (Azure AI): https://ai.azure.com/catalog/models/qwen--qwen3-coder-next
- AI Wiki (información general): https://aiwiki.ai/wiki/qwen3_coder_next
- README en chino de la cuantización: https://huggingface.co/qtum/Qwen3-Coder-Next-AWQ/blob/main/README_zh.md

Nota: las fechas indicadas en el repositorio de HuggingFace (creado el 2026-08-22) y en AI Wiki (lanzamiento el 3 de febrero de 2026) son coherentes con la publicación del modelo base.## Resumen

Qwen3-Coder-Next-AWQ es una cuantización 4-bit (AWQ W4A16) del modelo Qwen3-Coder-Next, un modelo de lenguaje de código abierto especializado en agentes de codificación, desarrollado por el equipo Qwen de Alibaba. La cuantización ha sido realizada por el usuario `qtum` con la librería `llm-compressor` de vLLM, y se distribuye en formato `compressed-tensors` listo para servir con vLLM o SGLang.

El modelo base es un MoE (mixture of experts) con 80.000 millones de parámetros totales, de los cuales solo se activan aproximadamente 3.000 millones durante la inferencia. Esta arquitectura permite un rendimiento comparable a modelos con 10-20 veces más parámetros activos, con un coste computacional mucho menor. La ventana de contexto alcanza los 256K tokens, lo que permite procesar repositorios de código completos o conversaciones multi-turno extensas.

Esta cuantización es relevante porque el autor solo publica oficialmente un checkpoint FP8 del modelo, mientras que este repo ofrece una alternativa de 4 bits que reduce el tamaño de ~159 GiB (bf16) a ~40 GiB, aproximadamente la mitad que el FP8. Los tensores de routing y la proyección de salida se mantienen en bf16 para preservar la calidad del modelo base, lo que permite ejecutar este codificador de 80B en una sola GPU de 24-48 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_next MoE — 48 capas, 512 expertos, top-10 routing |
| Parametros totales | 80B |
| Parametros activos | ~3B |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | AWQ W4A16 (grupo de tamaño 128); tensors `mlp.gate` (router) y `lm_head` en bf16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | compressed-tensors (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Coder-Next es un MoE con 512 expertos y routing top-10, es decir, de los 80B parámetros totales solo se activan ~3B por token. Esta arquitectura está optimizada para tareas de codificación y agentes, con un contexto de 256K tokens que permite manejar repositorios completos y conversaciones multi-turno extensas. El modelo fue entrenado con un pipeline de datos que incluye código, inglés y chino, y su diseño busca maximizar la capacidad de razonamiento con una inferencia eficiente.

La cuantización AWQ (activation-aware weight quantization) escala cada canal de peso según su importancia para la activación antes del redondeo a 4 bits, de modo que el error de cuantización se concentra en los canales menos relevantes. Se calibró sobre un corpus mixto de 256 muestras de código, inglés y chino (2048 tokens cada una). En este MoE de 512 expertos, los tensores de routing (`mlp.gate`) se mantienen en bf16 porque un router comprimido enviaría tokens a expertos incorrectos; también se protege `lm_head`, la proyección de salida, que sufre la mayor degradación con un tipo global de 4 bits. El resto de los pesos (expertos y lineales de atención) se cuantizan a W4A16, manteniendo las activaciones en 16 bits.

## Capacidades

- Generación de texto y código: el modelo base está especializado en tareas de programación, incluyendo generación, completado, refactorización y explicación de código.
- Razonamiento y matemáticas: hereda las capacidades de razonamiento del modelo base Qwen3-Coder-Next, que ha sido evaluado en tareas de matemáticas y lógica.
- Soporte de tool calling / function calling: el modelo base está diseñado para agentes de codificación, por lo que es compatible con la invocación de herramientas y APIs.
- Capacidades multilingües: declarado para inglés y chino, con soporte adicional probable para otros idiomas según el entrenamiento del modelo base.
- Soporte de agentes y multi-step reasoning: su arquitectura MoE con 3B activos y contexto de 256K permite razonamiento en múltiples pasos y manejo de conversaciones largas.
- Formato de chat estándar: usa el formato ChatML de Qwen (`<|im_start|>`, `<|im_end|>`), compatible con la mayoría de los motores de inferencia.
- No se han publicado capacidades de visión, audio ni multimodalidad; es un modelo de texto puro.

## Casos de uso

- Agentes de codificación autónomos: el modelo puede actuar como un agente que navega por un repositorio, edita archivos, ejecuta comandos y resuelve incidencias, gracias a su contexto de 256K tokens y su soporte de tool calling. La cuantización permite ejecutarlo en una GPU de 24-48 GB en lugar de un clúster de GPUs.
- Generación de código en producción: puede integrarse en pipelines de CI/CD para generar tests, documentación o parches de código. Su soporte de function calling permite conectarlo a APIs de repositorios (GitHub, GitLab) para automatizar tareas.
- Asistente de desarrollo local (IDE): con una GPU de 48 GB, puede ejecutarse localmente como asistente de codificación en entornos como VS Code o JetBrains, con latencia baja gracias a la activación de solo 3B parámetros.
- Revisión de código automatizada: el modelo puede analizar pull requests, detectar errores y sugerir mejoras, aprovechando su contexto de 256K tokens para procesar diffs grandes.
- Generación de documentación técnica: puede generar documentación, comentarios y explicaciones sobre código existente, tanto en inglés como en chino.
- Formación y aprendizaje: su capacidad de razonamiento y generación de código lo hace útil para crear ejercicios, explicar conceptos de programación o generar ejemplos de código.
- Investigación en eficiencia de inferencia: este checkpoint AWQ permite estudiar el impacto de la cuantización 4-bit en un MoE de 80B con routing top-10, comparando con las versiones bf16 y FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica de calidad proporcionada es la perplejidad en wikitext-2-raw (test), medida con vLLM con `n_ctx = 512` y 12 chunks, directamente comparable entre las tres versiones:

| Pesos | PPL (wikitext-2-raw) | vs bf16 |
|---|---|---|
| bf16 (master, referencia) | 7.74 | — |
| **Este repo (AWQ W4A16)** | **12.53** | +61.8 % |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~40 GiB en disco, lo que permite servir el modelo en una GPU de 48 GB. En una GPU de 24 GB se requiere tensor/pipeline parallel o offload a CPU.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, RTX 4090 24 GB (con offload o parallel), RTX 6000 Ada 48 GB.
- Cabe en consumer GPUs: sí, en modelos con 24 GB de VRAM mediante offload o paralelismo, aunque la experiencia óptima es con 48 GB.
- Opciones de despliegue: vLLM (comando `vllm serve qtum/Qwen3-Coder-Next-AWQ`), SGLang, y cualquier motor que soporte el formato `compressed-tensors`. La cuantización se detecta automáticamente desde `config.json`.
- Latencia y throughput: no se dispone de datos específicos; al activar solo 3B parámetros, la inferencia es eficiente, pero el rendimiento depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Cuantización | Tamaño | Licencia | PPL wikitext-2 |
|---|---|---|---|---|---|---|---|
| Qwen3-Coder-Next (bf16) | 80B | 3B | 256K | bf16 | ~159 GiB | Apache-2.0 | 7.74 |
| Qwen3-Coder-Next-FP8 (oficial) | 80B | 3B | 256K | FP8 | ~80 GiB | Apache-2.0 | no disponible |
| Qwen3-Coder-Next-AWQ (este repo) | 80B | 3B | 256K | AWQ W4A16 | ~40 GiB | Apache-2.0 | 12.53 |
| Qwen3-Coder-Next-GPTQ (qtum) | 80B | 3B | 256K | GPTQ W4A16 | ~40 GiB | Apache-2.0 | no disponible |

No se dispone de datos de comparación con modelos de otras familias (como DeepSeek-Coder o CodeLLaMA) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización AWQ introduce una degradación de calidad: la perplejidad aumenta un 61,8 % respecto al bf16 (12.53 vs 7.74), lo que puede traducirse en errores de código más frecuentes en tareas complejas.
- Los tensores de routing y `lm_head` se mantienen en bf16, pero el resto de los pesos están en 4 bits; esto puede afectar a la precisión en tareas que dependen de los expertos.
- El modelo solo declara soporte para inglés y chino; su rendimiento en otros idiomas no está garantizado.
- La licencia Apache-2.0 permite uso comercial, pero hay que respetar las condiciones del modelo base (también Apache-2.0).
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cuantización, por lo que no se puede evaluar el impacto en tareas específicas de código más allá de la perplejidad.
- El modelo está diseñado para vLLM y SGLang; otros motores pueden no soportar el formato `compressed-tensors` o la detección automática de cuantización.
- La fecha de creación del repo (2026-08-22) sugiere que el modelo es reciente y puede haber cambios en el modelo base o en las prácticas de cuantización.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/qtum/Qwen3-Coder-Next-AWQ
- Modelo base Qwen3-Coder-Next: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Colección de modelos Qwen3-Coder-Next: https://huggingface.co/collections/Qwen/qwen3-coder-next
- Cuantización GPTQ (W4A16): https://huggingface.co/qtum/Qwen3-Coder-Next-GPTQ
- Cuantización FP8 oficial: https://huggingface.co/Qwen/Qwen3-Coder-Next-FP8
- Technical Report en arXiv: https://arxiv.org/html/2603.00729
- Catálogo de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3-coder-next
- AI Wiki (información general): https://aiwiki.ai/wiki/qwen3_coder_next

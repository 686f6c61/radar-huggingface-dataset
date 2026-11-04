# mradermacher/Gemma-4-26B-A4B-Arabic-It-GGUF

## Resumen

`mradermacher/Gemma-4-26B-A4B-Arabic-It-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo `noman-asif/Gemma-4-26B-A4B-Arabic-It`, un ajuste fino orientado a árabe e italiano de una variante "Gemma 4" de 26B con arquitectura MoE (la nomenclatura A4B sugiere aproximadamente 4B parámetros activos). El autor de las cuantizaciones es mradermacher, un perfil conocido en HuggingFace por publicar versiones GGUF de modelos de terceros para su uso con llama.cpp y herramientas compatibles.

El modelo base declarado tiene 25.233.142.046 parámetros totales según los tensores safetensors, lo que confirma que se trata de un modelo grande con mezcla de expertos. La ficha del repositorio no incluye información sobre la licencia, los idiomas soportados ni la pipeline, y el repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica que es una publicación muy reciente (creada el 4 de noviembre de 2026).

La relevancia de esta ficha es limitada pero concreta: permite desplegar en local un modelo de 26B con activación dispersa (~4B activos) en hardware de consumo mediante cuantizaciones de 2 a 8 bits, algo imposible con un denso de 26B. No obstante, al no haber model card detallada, benchmarks ni licencia declarada, su uso en producción exige verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), presumiblemente transformer; variante "A4B" con ~4B parámetros activos (no confirmado en la model card) |
| Parametros totales | 25.233.142.046 (dato real de safetensors) |
| Parametros activos | ~4B (inferido de la nomenclatura A4B; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible (el nombre sugiere árabe e italiano) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas, quantize_version 2) |

## Arquitectura y entrenamiento

La información disponible no permite detallar la arquitectura interna. El nombre del modelo base (`Gemma-4-26B-A4B-Arabic-It`) indica una variante de la familia Gemma 4 con 26B parámetros totales y una designación "A4B" que en la convención de nomenclatura de modelos MoE (similar a Qwen3-30B-A3B) indica aproximadamente 4B parámetros activos por token. El recuento real de safetensors (25,23B) es coherente con un modelo MoE de esa escala. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

El ajuste fino declarado está orientado a árabe e italiano, lo que sugiere un proceso de fine-tuning supervisado sobre el modelo base Gemma 4 para mejorar el rendimiento en esos dos idiomas. No se especifica si se usó LoRA, full fine-tuning u otra técnica. Las cuantizaciones de mradermacher se generan con `quantize_version: 2` de llama.cpp, con `output_tensor_quantised: 1` y `skip_mmproj: 1`, lo que indica que se omitió el proyector multimodal (mmproj) en el proceso de cuantización; esto implica que estas GGUF no incluyen capacidades de visión aunque el modelo base las tuviera.

## Capacidades

- Generación de texto conversacional: el tag `conversational` en HuggingFace indica uso previsto para diálogo.
- Multilingüismo limitado a árabe e italiano según el nombre del modelo; el resto de idiomas no está documentado.
- No se confirma soporte de tool calling, function calling ni razonamiento multi-paso.
- No se confirma modo "thinking" ni capacidades de visión en estas GGUF (el proyector mmproj fue omitido).
- No se confirman capacidades de código o matemáticas específicas.
- Compatible con endpoints de inferencia (tag `endpoints_compatible`).

## Casos de uso

- Asistente conversacional en árabe para atención al cliente: el ajuste fino específico en árabe permite respuestas más naturales que el modelo base en ese idioma, y las cuantizaciones Q4_K_M o Q5_K_M permiten desplegarlo en una sola GPU de 24 GB con contexto moderado.
- Traducción y localización árabe-italiano: el modelo fue ajustado en ambos idiomas, por lo que puede emplearse en pipelines de traducción o revisión de textos entre estos dos idiomas, aunque la calidad debe validarse empíricamente al no haber benchmarks.
- Despliegue en local con llama.cpp u Ollama: las GGUF de Q2_K a Q8_0 permiten ejecutar el modelo en estaciones de trabajo sin GPU de datacenter, útil para prototipado y pruebas de concepto.
- Generación de contenido en árabe para medios o e-commerce: redacción de descripciones de producto, correos y textos de marketing en árabe con un modelo autoalojado que evita enviar datos a APIs externas.
- Investigación sobre eficiencia de MoE: el modelo sirve como caso de estudio para medir latencia y calidad de un MoE de 26B con ~4B activos bajo distintas cuantizaciones en hardware de consumo.
- Evaluación comparativa de fine-tunes: útil para investigadores que quieran comparar el efecto de un ajuste fino bilingüe (árabe/italiano) sobre el modelo base Gemma 4 en tareas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 25,23B parámetros):
  - Q2_K: ~9-10 GB
  - Q3_K_M: ~12-13 GB
  - Q4_K_M: ~15-16 GB
  - Q5_K_M: ~18-19 GB
  - Q6_K: ~21-22 GB
  - Q8_0: ~27-28 GB
  - x-f16: ~50 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; A100 40 GB o H100 para Q8_0 y f16; RTX 3090 (24 GB) para Q4_K_M.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o inferiores; en GPUs de 12-16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (koboldcpp, text-generation-webui). No se confirma soporte de vLLM o TGI para esta variante MoE en GGUF.
- Latencia y throughput: no disponibles; al ser un MoE con ~4B activos, se espera throughput superior a un denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-Arabic-It (este) | 25,23B | ~4B (inferido) | no disponible | no disponible | GGUF |
| Qwen3-30B-A3B | 30B | 3B | 32K+ | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | ~12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| Gemma 3 27B (denso) | 27B | 27B | 128K | Gemma license | safetensors, GGUF |

La comparativa es aproximada: no hay datos de rendimiento del modelo evaluado, y la licencia del ajuste fino no está declarada, lo que impide confirmar si el uso comercial es viable.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; hereda presumiblemente la licencia de Gemma 4, que suele incluir restricciones de uso.
- Sin benchmarks publicados: no hay evidencia de calidad en árabe, italiano ni en tareas generales.
- Repositorio sin tracción (0 descargas, 0 likes): no hay validación comunitaria.
- Proyector multimodal omitido (`skip_mmproj: 1`): estas GGUF no soportan visión aunque el modelo base la tuviera.
- Riesgo de alucinación y sesgos no evaluados: no hay model card del ajuste fino original ni evaluaciones de seguridad.
- Idiomas no documentados oficialmente: el soporte de árabe e italiano es inferido del nombre, no confirmado.
- Contexto desconocido: no se puede planificar el uso en tareas de contexto largo sin verificar la ventana real.
- Modelo base "Gemma 4" no verificado: no se confirma la existencia ni las especificaciones oficiales de esa familia en la información proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gemma-4-26B-A4B-Arabic-It-GGUF
- Modelo base (ajuste fino): https://huggingface.co/noman-asif/Gemma-4-26B-A4B-Arabic-It
- Perfil del autor de cuantizaciones: https://huggingface.co/mradermacher

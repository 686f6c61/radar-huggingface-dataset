# smalinin/DeepSeek-V4.1-Flash-GGUF

## Resumen

DeepSeek-V4.1-Flash es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por DeepSeek, distribuido originalmente en el repositorio `deepseek-ai/DeepSeek-V4.1-Flash`. Esta ficha describe la conversión a GGUF publicada por el usuario smalinin, que permite ejecutar el modelo en llama.cpp mediante un fork experimental orientado exclusivamente a CUDA. El modelo base cuenta con 748.494.684.784 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos frontier de gran escala.

La relevancia de esta publicación radica en que hace accesible un modelo de ese tamaño en hardware más modesto mediante cuantizaciones mixtas agresivas, con variantes que van desde 335 GB (3,58 bits por peso efectivos) hasta 508 GB (5,43 bpw). El autor emplea una estrategia poco habitual: mantiene las dos tablas Engram (lookup tables n-gram de gran tamaño) en Q8_0 o Q5_K mientras comprime el backbone, lo que preserva la calidad de las representaciones de n-gramas a costa de un mayor tamaño total.

La arquitectura del modelo base incluye atención dispersa (sparse attention), hyper-connections, capas MoE y dos tablas Engram de búsqueda n-gram. El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de visión. La licencia es MIT, lo que facilita el uso comercial, aunque la viabilidad práctica está limitada por los requisitos de hardware y por la dependencia de un fork no oficial de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa, hyper-connections y tablas Engram n-gram (`DeepseekV41ForCausalLM`) |
| Parametros totales | 748.494.684.784 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ2_XXS, Q3_K, IQ3_XS, Q5_K, Q8_0, MXFP4, BF16, F32 (combinaciones mixtas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (10 shards por variante) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con varias innovaciones declaradas en la model card: atención dispersa (sparse attention), hyper-connections (una variante de conexiones residuales que mejora el flujo de gradiente en profundidad), capas MoE con expertos enrutados y compartidos, y dos tablas Engram de búsqueda n-gram de gran tamaño (`blk.1.engram_embd.weight` y `blk.14.engram_embd.weight`). Estas tablas Engram funcionan como memorias de n-gramas aprendidas, un mecanismo distinto de la atención clásica que añade capacidad de recuperación de patrones locales. El checkpoint corresponde a `DeepseekV41ForCausalLM`, distinto de DeepSeek-V4-Flash-0731 según el autor.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. La conversión GGUF no modifica los pesos más allá de la cuantización: el autor aplica una importance matrix (imatrix) de 262.144 tokens para las variantes con calibración, y describe políticas de precisión diferenciadas por tipo de tensor (por ejemplo, mantener en Q8_0 las proyecciones de atención, expertos compartidos, la cabeza de salida y el WKV de Engram, mientras los expertos enrutados se comprimen a IQ2_XXS o Q2_K). La variante MXFP4 conserva 120 tensores en MXFP4, 332 en Q8_0, 65 en BF16 y 529 en F32, lo que evidencia que ninguna variante es una cuantización uniforme.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general, según el pipeline declarado y la etiqueta `conversational`.
- Procesamiento de imagen y texto (`image-text-to-text`), lo que implica capacidades de visión integradas en el modelo base.
- Soporte de arquitectura MoE con expertos enrutados y compartidos, lo que permite activar solo una fracción de los parámetros por token (aunque el número de parámetros activos no está disponible).
- Recuperación de patrones mediante tablas Engram n-gram, potencialmente útil para tareas con fuerte componente de memoria local o repetición estructurada.
- No se ha confirmado en la información disponible soporte de tool calling, function calling, agentes multi-paso, modo thinking explícito ni capacidades de audio.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en arquitecturas MoE a gran escala: el modelo permite estudiar el comportamiento de atención dispersa, hyper-connections y tablas Engram en un checkpoint de 748.000 millones de parámetros, con la ventaja de que las cuantizaciones de 3,58 bpw reducen el coste de almacenamiento a 335 GB frente a los aproximadamente 1,5 TB en BF16.
- Experimentación con visión-lenguaje en llama.cpp: al declararse pipeline `image-text-to-text`, se puede integrar en prototipos de descripción de imágenes o respuesta a preguntas visuales, siempre que el fork CUDA `my_build_deepseek41` esté compilado y el hardware disponga de suficiente VRAM agregada.
- Evaluación comparativa de recetas de cuantización: las cinco variantes publicadas (Q2_K+Q5_K Engram, IQ2_XXS+Q8_0 Engram, Q2_K Protected+Q8_0, IQ3_XS+Q8_0 y MXFP4+Q8_0) permiten medir el impacto de distintas políticas de precisión en la calidad de salida, usando la imatrix de 262.144 tokens como referencia común.
- Despliegue en clústeres de GPUs de datacenter para generación de texto conversacional: con 10 shards y `llama-server`, se puede servir el modelo en un nodo multi-GPU con suficiente memoria agregada (por ejemplo, varias A100 de 80 GB o H100), aunque el throughput real no está documentado.
- Reproducción de investigaciones sobre memoria n-gram: las tablas Engram en Q8_0 o Q5_K permiten analizar si la recuperación de n-gramas mejora tareas de copia, resumen extractivo o completado de código repetitivo en comparación con modelos sin este mecanismo.
- Formación y docencia en sistemas de inferencia: el repositorio sirve como caso práctico de conversión GGUF multi-shard, gestión de imatrix y cuantización mixta por tipo de tensor, útil para quienes estudian el formato GGUF y llama.cpp a escala frontier.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 335 GB (variante Q2_K + Q5_K Engram, 3,58 bpw) y 508 GB (variante MXFP4 + Q8_0 Engram, 5,43 bpw). La variante IQ2_XXS + Q8_0 Engram ocupa 371 GB, la Q2_K Protected + Q8_0 ocupa 413 GB y la IQ3_XS + Q8_0 ocupa 434 GB.
- GPU recomendadas: exclusivamente CUDA según el autor. Para la variante más pequeña se necesitan al menos 5 GPU de 80 GB (A100 o H100) o combinaciones equivalentes; para la variante MXFP4 se requieren al menos 7 GPU de 80 GB. No se ha documentado soporte para ROCm, Metal ni CPU.
- Consumer GPU: no cabe en ninguna GPU de consumo individual (RTX 4090 con 24 GB, RTX 3090 con 24 GB). Sería necesario un conjunto de al menos 14 RTX 4090 para la variante más pequeña, lo que excede las configuraciones domésticas habituales.
- Opciones de despliegue: `llama-server` del fork `smalinin/llama.cpp`, rama `my_build_deepseek41`. No se declara compatibilidad con el llama.cpp upstream, ni con vLLM, TGI, Ollama u otros runners.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (esta ficha) | 748.494.684.784 | no disponible | MIT | GGUF (5 variantes) | Requiere fork CUDA de llama.cpp |
| DeepSeek-V4.1-Flash original (`deepseek-ai/DeepSeek-V4.1-Flash`) | 748.494.684.784 | no disponible | no disponible en esta ficha | safetensors (presumiblemente) | Modelo base sin cuantizar |
| antirez/deepseek-v4.1-flash-gguf | 748.494.684.784 (mismo base) | no disponible | no disponible en esta ficha | GGUF (Q2, 340,60 GiB) | Referencia de diseño citada por el autor; imatrix de 8.192 tokens |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | no disponible | Checkpoint distinto según el autor, no equivalente |

## Limitaciones y advertencias

- Dependencia de un fork no oficial: los archivos requieren la rama `my_build_deepseek41` de `smalinin/llama.cpp`; el autor no reclama compatibilidad con el llama.cpp upstream. Esto implica riesgo de abandono del fork, falta de mantenimiento y ausencia de auditoría externa.
- Soporte exclusivo CUDA: no hay indicios de funcionamiento en CPU, Metal, ROCm ni otros backends, lo que limita el despliegue a entornos NVIDIA.
- Tamaño prohibitivo: incluso la variante más comprimida (335 GB) exige múltiples GPU de datacenter; no es viable en hardware de consumo.
- Cuantizaciones muy agresivas: las variantes de 3,58 y 3,97 bpw comprimen los expertos enrutados a IQ2_XXS o Q2_K, lo que puede degradar la calidad de forma no cuantificada. El autor advierte explícitamente que las tablas comparativas no prueban una calidad universalmente mejor.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinación para este checkpoint ni para sus cuantizaciones.
- Idiomas soportados no documentados: no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del inglés.
- Sesgos: no disponibles en la información proporcionada.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base podría tener condiciones adicionales no reflejadas en esta ficha; conviene verificar el repositorio original de DeepSeek antes de un despliegue comercial.
- Longitud de contexto no documentada: se desconoce la ventana máxima efectiva, lo que impide planificar casos de uso con contexto largo.
- Parámetros activos no documentados: al ser MoE, el coste computacional por token es inferior al total, pero sin el dato de parámetros activos no se puede estimar el throughput.

## Enlaces

- Repositorio GGUF: https://huggingface.co/smalinin/DeepSeek-V4.1-Flash-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Fork de llama.cpp: https://github.com/smalinin/llama.cpp/tree/my_build_deepseek41
- Variante IQ2_XXS_GU-Q2_K_Down-Q8 (referencia interna del autor): https://huggingface.co/smalinin/DeepSeek-V4.1-Flash-GGUF/tree/main/IQ2_XXS_GU-Q2_K_Down-Q8
- GGUF de referencia de antirez: https://huggingface.co/antirez/deepseek-v4.1-flash-gguf

# mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized`, un fine-tuning sin censura (uncensored) derivado de la familia Qwen3.6, con una arquitectura de mezcla de expertos (MoE) de 35.505.251.456 parámetros totales según los pesos en safetensors del modelo base. El prefijo "A3B" del nombre indica, siguiendo la convención de Qwen, aproximadamente 3.000 millones de parámetros activos por token, aunque este dato no se confirma de forma explícita en la información disponible. El autor de las cuantizaciones es mradermacher, un publicador habitual de versiones GGUF con calibración imatrix para despliegue en llama.cpp y entornos compatibles.

La relevancia de esta ficha radica en que empaqueta un modelo de gran tamaño en formatos de 13,3 GB a 29,3 GB, lo que permite ejecutarlo en hardware de consumo con cuantizaciones agresivas (Q2_K, IQ3_XXS) o en estaciones de trabajo con 24 GB de VRAM usando Q4_K_M. El modelo base es un fine-tuning "uncensored" con estética Hermes/Genesis, orientado a conversación y generación de texto sin las restricciones de alineamiento del modelo original, lo que lo hace atractivo para investigación en seguridad, red teaming y experimentación con prompts que los modelos alineados rechazan.

No se dispone de información sobre licencia, idiomas soportados, longitud de contexto ni detalles del entrenamiento en la documentación proporcionada. La model card del repositorio se limita a la lista de cuantizaciones y a notas genéricas de uso de GGUF, por lo que muchos campos de esta ficha quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), inferida del sufijo "A3B" y de la familia Qwen3.6; no confirmada en la documentación |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | Aproximadamente 3 B según la convención "A3B" del nombre; no confirmado oficialmente |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; también se ofrecen cuantizaciones estáticas en el repo hermano |
| Idiomas soportados | en (inglés), según el campo `language` de la model card |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base está en safetensors |
| Tamano del repositorio | 279,2 GB (incluye todas las cuantizaciones) |
| Cuantizacion mas pequena | 13,3 GB (i1-Q2_K) |
| Cuantizacion mas grande | 29,3 GB (i1-Q6_K) |
| Modelo base | symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized |
| Descargas | 906 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE), deducida de la nomenclatura "35B-A3B" característica de la familia Qwen3, que combina un gran número de parámetros totales con un subconjunto reducido de parámetros activos por token. Esta configuración permite un throughput de inferencia mucho mayor que un modelo denso de 35 B, a costa de requerir memoria para todos los expertos en VRAM. No se dispone de información sobre el número exacto de expertos, la dimensión oculta, el número de capas ni el mecanismo de atención (estándar, GQA o lineal) en la documentación proporcionada.

Respecto al entrenamiento, el modelo base es un fine-tuning "uncensored" con estética Hermes/Genesis sobre Qwen3.6, presumiblemente mediante ajuste supervisado y posiblemente DPO, aunque no se documenta el número de tokens, la composición del dataset ni las técnicas de alineamiento empleadas. Tampoco se especifica si hubo decodificación especulativa, atención lineal u otras innovaciones. Las cuantizaciones de mradermacher emplean calibración imatrix (importance matrix) generada con el propio modelo, lo que mejora la calidad de las cuantizaciones de baja precisión (Q2, Q3) frente a las estáticas. El repositorio incluye el fichero imatrix de 0,3 GB para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo estilo Hermes.
- Generación de texto sin las restricciones de alineamiento del modelo base, lo que permite contenido que los modelos alineados rechazan.
- Razonamiento y generación de código: capacidades heredadas de la familia Qwen3.6, aunque no verificadas en benchmarks para este fine-tuning.
- Soporte de tool calling / function calling: no confirmado en la documentación.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la documentación.
- Capacidades multilingües: la model card solo declara inglés (`en`); el multilingüismo de la familia Qwen no se confirma para este fine-tuning.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Despliegue en llama.cpp y entornos compatibles con GGUF (Ollama, LM Studio, koboldcpp, etc.).

## Casos de uso

- Investigación en seguridad y red teaming: el modelo permite generar respuestas que los modelos alineados rechazan, lo que lo hace útil para estudiar comportamientos no deseados, construir datasets de evaluación de seguridad y analizar sesgos y riesgos antes de desplegar sistemas en producción.
- Experimentación con prompts y jailbreaks: al ser un fine-tuning uncensored, sirve como banco de pruebas para medir la eficacia de filtros de entrada y salida en pipelines de moderación, comparando su comportamiento con el del modelo base alineado.
- Generación creativa de ficción y narrativa: con 35 B de parámetros totales y ~3 B activos, ofrece una calidad de generación superior a modelos densos de 7-8 B, adecuada para escritura de relatos, guiones y diálogos sin las restricciones temáticas habituales.
- Despliegue local en estaciones de trabajo: la cuantización i1-Q4_K_M (21,8 GB) cabe en una GPU de 24 GB (RTX 4090, RTX 3090) y permite inferencia offline sin dependencia de APIs, útil para entornos con requisitos de privacidad.
- Prototipado rápido de asistentes conversacionales: gracias a la arquitectura MoE con ~3 B activos, el throughput en llama.cpp es notablemente superior al de un modelo denso de 35 B, lo que acelera iteraciones en desarrollo.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 16 cuantizaciones distintas con imatrix, lo que permite estudiar empíricamente la degradación de calidad (perplejidad, coherencia) entre Q2_K y Q6_K en un mismo modelo.
- Generación de datasets sintéticos: para tareas donde se requiere contenido diverso y sin filtros, el modelo puede producir grandes volúmenes de texto que luego se filtran y curan manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye pesos y overhead de contexto; el contexto no está documentado, por lo que las cifras son orientativas):
  - i1-Q2_K (13,3 GB): ~14-15 GB de VRAM.
  - i1-IQ3_XXS / IQ3_S / IQ3_M (15,7-15,9 GB): ~16-17 GB de VRAM.
  - i1-Q4_K_S (20,5 GB): ~21-22 GB de VRAM.
  - i1-Q4_K_M (21,8 GB): ~23-24 GB de VRAM.
  - i1-Q5_K_M (25,4 GB): ~26-27 GB de VRAM.
  - i1-Q6_K (29,3 GB): ~30-31 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M; A100 40 GB, H100 80 GB o RTX 6000 Ada (48 GB) para Q5_K_M y Q6_K con contexto amplio.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con Q2_K o IQ3_XXS y contexto reducido.
- Opciones de despliegue: llama.cpp (principal), Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato, aunque pueden cargar el modelo base en safetensors si se dispone de VRAM suficiente.
- Latencia y throughput: no disponibles. La arquitectura MoE con ~3 B activos sugiere un throughput superior al de un denso de 35 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10 (este) | 35,5 B | ~3 B (no confirmado) | no disponible | no disponible | GGUF, safetensors | Fine-tuning uncensored; sin benchmarks publicados |
| Qwen3-30B-A3B (referencia de familia) | 30,5 B | ~3,3 B | 32.768 tokens (típico en Qwen3) | Apache 2.0 (típico en Qwen3) | safetensors, GGUF | Modelo alineado de referencia; benchmarks públicos |
| Mixtral 8x7B | 46,7 B | ~12,9 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | MoE con más parámetros activos; mayor VRAM requerida |
| DeepSeek-V2-Lite | 15,7 B | ~2,4 B | 32.768 tokens | DeepSeek License | safetensors, GGUF | MoE más pequeño; menor calidad esperada |

La comparativa es orientativa: no se dispone de benchmarks del modelo de esta ficha, por lo que la comparación se limita a parámetros, contexto y licencia. El modelo más directamente comparable es Qwen3-30B-A3B, del que este fine-tuning deriva, pero con la salvedad de que el fine-tuning uncensored puede degradar el rendimiento en tareas de razonamiento y seguridad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad, por lo que el rendimiento real es desconocido.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. El modelo base podría heredar restricciones de Qwen o de sus fine-tunings intermedios; es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- Modelo uncensored: la ausencia de alineamiento incrementa el riesgo de generar contenido dañino, sesgado, ilegal o sexualmente explícito. No es adecuado para aplicaciones de cara al público sin una capa de moderación robusta.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks no se puede cuantificar. Los fine-tunings uncensored a veces muestran mayor propensión a inventar datos al no estar sujetos a RLHF estricto.
- Idiomas: la model card solo declara inglés; el rendimiento en castellano no está verificado y podría ser deficiente.
- Contexto: no documentado; no se puede asumir la ventana de 32 K o 128 K de la familia Qwen sin confirmación.
- Cuantizaciones agresivas: Q2_K e IQ3_XXS degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Procedencia del modelo base: el autor `symrex` y el nombre "Genesis-Hermes-V10" no corresponden a un laboratorio conocido; la trazabilidad del fine-tuning es limitada.
- Fecha de creación (2026-08-29) y actualización (2026-11-20): coherencia temporal a verificar según el contexto de uso.
- Sin soporte confirmado de tool calling ni de agentes: no asumir estas capacidades en pipelines de producción.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-i1-GGUF
- Modelo base: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-GGUF
- Página de overview del autor: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-i1-GGUF/resolve/main/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized.imatrix.gguf
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (patrocinador del autor): https://www.nethype.de/
- Perfil de nicoboss (proveedor de cómputo): https://huggingface.co/nicoboss

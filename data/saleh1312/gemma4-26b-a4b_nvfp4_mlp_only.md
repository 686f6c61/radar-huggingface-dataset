# saleh1312/gemma4-26B-A4B_nvfp4_mlp_only

## Resumen

El modelo `saleh1312/gemma4-26B-A4B_nvfp4_mlp_only` es una variante cuantizada del Gemma 4 26B A4B MoE, desarrollado originalmente por Google DeepMind. Esta versión concreta, publicada por el usuario `saleh1312`, aplica cuantización NVFP4 únicamente a las capas MLP (mixture-of-experts), manteniendo el resto de la arquitectura en precisión original. El objetivo es reducir el uso de memoria y acelerar la inferencia en GPUs consumer, manteniendo en lo posible la calidad del modelo base.

El modelo base Gemma 4 26B A4B es un transformer multimodal con arquitectura MoE (128 expertos totales, 8 activos y 1 compartido), 30 capas, ventana de contexto de 256K tokens y soporte para entrada de texto e imagen. La cuantización NVFP4 (NVIDIA FP4) es una técnica de compresión de pesos a 4 bits que reduce significativamente el footprint de memoria. En este repo, los safetensors contienen 14.119.308.592 parámetros, lo que sugiere que solo se incluyen los tensores cuantizados de las capas MLP, mientras que el resto de pesos podrían estar en otra precisión o no estar incluidos en este repositorio.

La relevancia de este modelo radica en que permite ejecutar un MoE de 25.2B parámetros totales (3.8B activos) en hardware más modesto, aprovechando la eficiencia de la cuantización FP4. Está pensado para desarrolladores que necesitan desplegar modelos multimodales de razonamiento y coding en entornos con VRAM limitada, sin renunciar a la ventana de contexto larga ni a las capacidades de function calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts) con atención híbrida (sliding window + global) |
| Parametros totales | 14.119.308.592 (según safetensors del repo; el modelo original tiene 25.2B) |
| Parametros activos | 3.8B (según especificación del modelo base Gemma 4 26B A4B) |
| Longitud de contexto | 256K tokens (según documentación de Gemma 4) |
| Tipos de cuantizacion | NVFP4 (solo capas MLP) |
| Idiomas soportados | Más de 140 idiomas (según documentación de Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Gemma 4 26B A4B emplea una arquitectura MoE con 128 expertos en total, de los cuales 8 se activan por token junto con 1 experto compartido. Cada capa utiliza atención híbrida: se intercalan capas de atención con ventana deslizante local (1024 tokens) y capas de atención global completa, garantizando que la última capa sea siempre global. Para optimizar memoria en contextos largos, las capas globales comparten claves y valores (unified Keys and Values) y aplican Proportional RoPE (p-RoPE). El modelo es multimodal, procesando texto e imagen mediante un encoder de visión de aproximadamente 550M parámetros.

La variante `nvfp4_mlp_only` aplica cuantización NVFP4 (4 bits) exclusivamente a las capas MLP, que en un MoE representan la mayor parte de los parámetros. El resto de componentes (attention, embeddings, norm) se mantienen en su precisión original. No se dispone de información sobre el proceso de entrenamiento o fine-tuning de esta variante concreta; se asume que es una conversión directa del modelo original sin reentrenamiento. El modelo base fue entrenado por Google DeepMind con datos multimodales y técnicas de alineación (RLHF/DPO), aunque los detalles específicos no se incluyen en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento configurable (thinking mode).
- Procesamiento multimodal: entrada de texto e imagen (no audio ni video en esta variante, según la documentación del modelo base).
- Soporte nativo de function calling / tool calling, lo que permite integrarlo en agentes autónomos.
- Capacidades de codificación mejoradas respecto a generaciones anteriores de Gemma.
- Ventana de contexto de 256K tokens, adecuada para documentos largos y conversaciones multi-turno.
- Soporte nativo del rol `system` en el prompt, facilitando el control del comportamiento.
- Multilingüe: más de 140 idiomas soportados.
- Eficiencia de inferencia gracias a la cuantización NVFP4 en las capas MLP, reduciendo el uso de VRAM y acelerando la decodificación.

## Casos de uso

- Atención al cliente automatizada: con 256K tokens de contexto, el modelo puede gestionar conversaciones largas con historial completo, manteniendo el estado de la interacción y resolviendo consultas complejas sin perder información previa.
- Generación de código en producción: su soporte de function calling y su rendimiento en benchmarks de coding lo hacen adecuado para integrarse en pipelines de CI/CD, generando código, revisando PRs o autocompletando funciones en IDEs.
- Análisis de documentos técnicos: la ventana de contexto larga permite procesar manuales, papers o contratos extensos, extrayendo información relevante y respondiendo preguntas sobre el contenido.
- Agentes autónomos con herramientas: al soportar tool calling, puede orquestar llamadas a APIs, bases de datos o servicios externos, ejecutando tareas multi-paso como reservas, búsquedas o gestión de datos.
- Asistente de razonamiento multimodal: combinando entrada de imagen y texto, puede analizar diagramas, capturas de pantalla o gráficos, explicando su contenido o generando descripciones técnicas.
- Despliegue en entornos con VRAM limitada: gracias a la cuantización NVFP4, el modelo puede ejecutarse en GPUs consumer de 24 GB (como RTX 4090) o incluso menos, permitiendo prototipado local y aplicaciones edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante cuantizada `nvfp4_mlp_only`. La documentación del modelo base Gemma 4 26B A4B menciona mejoras en coding y razonamiento, pero no se proporcionan cifras concretas en la información disponible. Se recomienda consultar el technical report de Gemma 4 (arXiv:2607.02770) para datos del modelo original, aunque los resultados pueden variar debido a la cuantización.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. El tamaño del repo es de 18.1 GB, lo que sugiere que el modelo completo (con todos los pesos) podría requerir al menos 20-24 GB de VRAM en FP16, pero al estar las capas MLP en FP4, el consumo real podría ser menor. Se estima que cabe en GPUs con 24 GB de VRAM (RTX 4090, RTX 3090, A5000) y posiblemente en 16 GB con cuantización adicional o offloading.
- GPU recomendadas: RTX 4090, RTX 3090, A100 40GB, L40S, o cualquier GPU con soporte para FP4 (Ampere o posterior).
- En consumer GPU: sí, es viable en RTX 4090 y similares, aunque el rendimiento dependerá de la implementación de kernels FP4.
- Opciones de despliegue: compatible con transformers (librería indicada), vLLM, TGI, Ollama (existe una variante `gemma4:26b-nvfp4` en Ollama), y llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponibles. Al ser un MoE con solo 3.8B parámetros activos, la latencia por token debería ser baja, pero la cuantización FP4 puede requerir kernels optimizados para aprovechar el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Cuantización |
|---|---|---|---|---|---|
| Gemma 4 26B A4B (original) | 25.2B | 3.8B | 256K | Apache 2.0 | FP16/BF16 |
| saleh1312/gemma4-26B-A4B_nvfp4_mlp_only | 14.1B (en safetensors) | 3.8B | 256K | Apache 2.0 | NVFP4 (MLP) |
| Mixtral 8x7B | 46.7B | 12.9B | 32K | Apache 2.0 | FP16, GGUF |
| Qwen2.5-32B MoE | 32B | 3.3B | 128K | Apache 2.0 | FP16, GGUF |

La comparativa se basa en especificaciones, no en rendimiento medido. El modelo cuantizado reduce el tamaño de los pesos MLP, pero mantiene las capacidades del modelo base. Frente a Mixtral, ofrece mayor contexto y soporte multimodal; frente a Qwen2.5 MoE, tiene un contexto mayor y también multimodalidad.

## Limitaciones y advertencias

- La cuantización NVFP4 puede introducir degradación en tareas de precisión numérica o razonamiento complejo, aunque el impacto suele ser menor en modelos grandes.
- Al cuantizar solo las capas MLP, el resto de pesos permanecen en precisión original, lo que puede limitar la reducción total de memoria comparado con una cuantización completa.
- El repositorio contiene 14.1B parámetros según safetensors, pero el modelo original tiene 25.2B; es posible que no todos los tensores estén incluidos o que el conteo refleje solo los pesos cuantizados. Verificar la integridad antes de usar.
- No se dispone de información sobre sesgos específicos, pero al ser un modelo derivado de Gemma 4, puede heredar sesgos de los datos de entrenamiento originales.
- Riesgo de alucinación en tareas de generación libre, especialmente con entradas ambiguas o fuera de distribución.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos específicos de la licencia de Gemma 4 (enlace en la model card).
- Para producción, es necesario validar el rendimiento real en el hardware objetivo, ya que los kernels FP4 pueden no estar optimizados en todos los frameworks.

## Enlaces

- Repositorio del modelo: https://huggingface.co/saleh1312/gemma4-26B-A4B_nvfp4_mlp_only
- Modelo original de NVIDIA (NVFP4): https://huggingface.co/nvidia/Gemma-4-26B-A4B-NVFP4
- Página de Ollama para gemma4:26b-nvfp4: https://ollama.com/library/gemma4:26b-nvfp4
- Documentación de transformers para Gemma4: https://huggingface.co/docs/transformers/model_doc/gemma4
- Página de Ollama para gemma4:26b: https://ollama.com/library/gemma4:26b
- Guía de tamaños y memoria de Gemma 4: https://gemma4.org/gemma-4-model-sizes
- Technical report de Gemma 4: https://arxiv.org/abs/2607.02770

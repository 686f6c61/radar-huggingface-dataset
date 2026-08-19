# RedHatAI/Muse-Glimmer-30B-FP8-block

## Resumen

RedHatAI/Muse-Glimmer-30B-FP8-block es una versión cuantizada a FP8 del modelo multimodal Muse-Glimmer-30B, desarrollada por Red Hat AI. Esta optimización reduce a la mitad el tamaño en disco y los requisitos de memoria GPU, manteniendo la funcionalidad del modelo original. Está pensada para despliegue eficiente en entornos de producción con vLLM, aprovechando el soporte nativo de FP8 en GPUs modernas.

El modelo base, Muse-Glimmer-30B, es un transformer denso de 30 mil millones de parámetros con capacidades multimodales (imagen y texto), diseñado para tareas agénticas como razonamiento multi-paso, tool calling y comprensión de interleaved text-image. La versión FP8 conserva estas capacidades, aunque la cuantización se aplica únicamente a los operadores lineales de los bloques transformer, dejando la torre de visión, los embeddings y la cabeza de salida en su precisión original.

Su relevancia actual radica en la creciente demanda de modelos grandes desplegables en hardware asequible. Al reducir los requisitos de VRAM a aproximadamente la mitad, permite ejecutar un modelo de 30B en una GPU de 40 GB o incluso en configuraciones con menos memoria, facilitando su uso en aplicaciones de agentes autónomos, asistentes multimodales y sistemas de automatización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (causal) con encoder de visión ViT-G/14 (~1.8B) según modelo base |
| Parametros totales | 29.776.626.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base declara 131K+ según Fireworks, no confirmado para esta versión) |
| Tipos de cuantizacion | FP8 (block-wise, bloques 128×128; activaciones dinámicas por grupo, group_size=128) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este modelo es una cuantización post-entrenamiento del modelo base meta-models/Muse-Glimmer-30B, realizada con LLM Compressor. La cuantización convierte los pesos de los operadores lineales dentro de los bloques transformer a FP8 con escalado por bloques de 128×128, y las activaciones se cuantizan dinámicamente por grupo (group_size=128). Las capas de la torre de visión, los embeddings y la cabeza de salida se mantienen en su precisión original (probablemente BF16) para preservar la calidad perceptual y la precisión en la generación.

El modelo base, según información de Fireworks AI, es un modelo denso causal destilado de Muse Spark, con un encoder de visión de ~1.8B parámetros (ViT-G/14) y soporte para entrada interleaved de texto e imagen. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-paso: el modelo base está diseñado para tareas agénticas que requieren planificación y ejecución secuencial.
- Comprensión multimodal: acepta entradas interleaved de texto e imagen, lo que permite analizar documentos visuales, diagramas o capturas de pantalla.
- Tool calling / function calling: soporta invocación de herramientas mediante esquemas, habilitando integraciones con APIs y servicios externos.
- Razonamiento con nivel seleccionable: según Fireworks, el modelo base permite ajustar la intensidad del razonamiento (low/medium/high), aunque este detalle no se confirma en la model card de la versión FP8.
- Despliegue optimizado para vLLM: la cuantización FP8 está pensada para ser usada con el servidor vLLM, que soporta parsing de tool calls y razonamiento específico para este modelo.

## Casos de uso

- Asistentes agénticos de código: el modelo puede razonar sobre problemas de programación, invocar herramientas de análisis estático o ejecutar comandos en entornos controlados, gracias a su soporte de tool calling y su contexto largo.
- Análisis de documentos multimodales: al aceptar imágenes interleaved con texto, es adecuado para extraer información de facturas, informes escaneados o capturas de pantalla de dashboards, y generar resúmenes o respuestas estructuradas.
- Automatización de flujos de trabajo empresariales: puede orquestar secuencias de acciones (consultar APIs, actualizar bases de datos, enviar notificaciones) mediante function calling, reduciendo la intervención manual.
- Chatbots de soporte técnico con contexto visual: capaz de interpretar capturas de pantalla de errores o logs y proporcionar pasos de resolución, manteniendo conversaciones multi-turno.
- Generación de informes a partir de datos mixtos: combina tablas, gráficos y texto para producir documentos analíticos, aprovechando su ventana de contexto extensa.
- Despliegue en edge o entornos con GPU limitada: al ser FP8, puede ejecutarse en una sola GPU de 40 GB (como A100 o RTX 6000 Ada), permitiendo inferencia local en laboratorios o pymes sin infraestructura de clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad tras la cuantización, ni comparativas con el modelo original o con otras cuantizaciones. Se recomienda realizar evaluaciones propias en las tareas objetivo antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada: con 29.776.626.688 parámetros en FP8 (1 byte por parámetro), el peso del modelo ocupa aproximadamente 29,8 GB. A esto hay que sumar memoria para activaciones, KV cache y overhead del runtime, por lo que se recomienda al menos 40 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: NVIDIA A100 40GB, A100 80GB, RTX 6000 Ada, L40S o H100 (80GB) para mayor margen. También puede ejecutarse en RTX 4090 (24GB) si se reduce la longitud de contexto o se usa tensor parallelism, aunque no es ideal.
- Compatibilidad con consumer GPU: en RTX 4090 (24GB) podría funcionar con contexto corto y cuantización adicional, pero no está garantizado. Para uso serio se recomienda al menos 40GB.
- Opciones de despliegue: vLLM (soporte nativo, incluye parser de tool calls y reasoning), también compatible con TGI si se convierte a formatos soportados. No se menciona compatibilidad con llama.cpp u Ollama en la documentación.
- Latencia y throughput: no disponibles. Dependerá del hardware, el tamaño de lote y la longitud de contexto. En una A100 80GB se espera un throughput razonable para un modelo de 30B, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otras versiones cuantizadas del mismo modelo o con modelos de tamaño similar (por ejemplo, Llama 3.1 30B o Qwen 2.5 32B). La model card no ofrece datos comparativos. Se recomienda consultar benchmarks públicos de Muse-Glimmer-30B y de otras cuantizaciones FP8 para evaluar el equilibrio entre calidad y eficiencia.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir una ligera degradación en tareas de alta precisión (matemáticas, razonamiento lógico complejo) en comparación con el modelo en BF16, aunque en la práctica suele ser mínima.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para esta versión. El modelo base, al ser multimodal, puede presentar sesgos en el procesamiento de imágenes (por ejemplo, estereotipos visuales) y errores de alucinación en contextos largos.
- La longitud de contexto no está confirmada en la model card; aunque el base declara 131K+, la versión FP8 podría tener limitaciones de memoria que reduzcan el contexto efectivo en GPUs de menor VRAM.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base también la cumpla (así es, según los metadatos).
- El despliegue requiere vLLM con soporte específico para este modelo; no es trivial usar otros runtimes sin conversión adicional.
- La torre de visión y los embeddings se mantienen en precisión original, lo que implica que la cuantización no reduce el tamaño total al 50% exacto (la parte de visión y embeddings no se cuantiza), aunque el ahorro principal proviene de los bloques transformer.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RedHatAI/Muse-Glimmer-30B-FP8-block
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Guía de uso con vLLM (recetas): https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- Repo de GitHub sobre Muse Glimmer: https://github.com/cobusgreyling/Muse-Glimmer
- Página de Fireworks AI con detalles del modelo base: https://fireworks.ai/models/fireworks/muse-glimmer-30b

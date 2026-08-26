# Sawfwair/Qwen3.8-Flash-Next-MLX-4bit

## Resumen

Qwen3.8-Flash-Next-MLX-4bit es una conversión reproducible del modelo Qwen/Qwen3.8-Flash-Next al formato MLX con cuantización afín de 4 bits, realizada por Sawfwair. El modelo original, desarrollado por el equipo Qwen de Alibaba, es un modelo multimodal (imagen-texto) de arquitectura MoE que previsualiza la arquitectura Qwen4, con 125 mil millones de parámetros principales, 51 mil millones adicionales en embeddings n-gram y 4 mil millones en un módulo de predicción multi-token (MTP). Solo se activan 6 mil millones de parámetros por token, lo que lo hace eficiente en inferencia pese a su tamaño total.

La conversión MLX aplica cuantización afín Q4 con grupos de 64 para la mayoría de las matrices de lenguaje, MTP y visión, y Q4 con grupos de 32 para la tabla n-gram de 160 de ancho. Routers, normas, sesgos, convoluciones y formas incompatibles se mantienen en precisión completa. El resultado es un payload de 97.55 GiB que requiere un runtime MLX específico para la arquitectura Qwen4, por lo que no es compatible con versiones antiguas de mlx-lm o mlx-vlm. Es una opción relevante para ejecutar localmente en hardware Apple Silicon un modelo multimodal de gran tamaño con contexto nativo de 262 144 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen4 (MoE multimodal con atención híbrida, embeddings n-gram y MTP) |
| Parámetros totales | 180B (125B main + 51B n-gram + 4B MTP) según el modelo base; el safetensors MLX cuantizado reporta 29 896 285 779 |
| Parámetros activos | 6B por token |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantización | MLX Q4/group-64 (927 módulos), Q4/group-32 (128 módulos, tabla n-gram de 160 de ancho); routers, normas, sesgos, convoluciones y formas incompatibles en denso |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (no gated) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce la arquitectura Qwen4, que combina un MoE con 125B de parámetros principales, un módulo de embeddings n-gram de 51B y un módulo de predicción multi-token (MTP) de 4B. Solo 6B parámetros se activan por token, lo que permite un rendimiento de inferencia relativamente alto para su tamaño. La arquitectura incorpora atención híbrida, mezclando mecanismos de atención densa con componentes dispersos o lineales, aunque no se han publicado detalles completos en la información disponible. El modelo es multimodal (imagen-texto) y está diseñado para razonamiento avanzado con contexto largo.

No se dispone de datos sobre el conjunto de entrenamiento (número de tokens, composición del dataset, o si se aplicaron técnicas como RLHF o DPO). La model card original del autor no incluye información de entrenamiento, y los resultados de la búsqueda web no aportan detalles adicionales sobre el proceso de entrenamiento. La conversión MLX del repositorio de Sawfwair valida la integridad de los tensores, los hashes de origen, el empaquetado MLX, la división de expertos fusionados, el layout de convoluciones y la conversión RMSNorm centrada en cero mediante el archivo `MERERUN_CONVERSION.json`.

## Capacidades

- Generación de texto y razonamiento avanzado, con contexto nativo de 262 144 tokens.
- Entrada de imagen y texto (pipeline image-text-to-text), lo que permite tareas de visión y lenguaje.
- Razonamiento multi-paso y soporte de agentes, gracias a su arquitectura MoE con 6B parámetros activos y MTP.
- Capacidades multilingües, aunque no se especifican idiomas concretos en la información disponible.
- Tool calling y function calling, presumiblemente como parte de las capacidades del modelo base Qwen3.8-Flash-Next, aunque no se detalla en la documentación consultada.
- Modo de razonamiento avanzado, soportado por el MTP que predice múltiples tokens por paso, lo que mejora la velocidad de generación.

## Casos de uso

- Análisis de documentos extensos con imágenes: gracias a su ventana de 262 144 tokens y su capacidad multimodal, el modelo puede procesar manuales técnicos, informes financieros o papers científicos que incluyan figuras, tablas y texto, manteniendo el contexto completo en una sola pasada.
- Agentes de automatización de tareas complejas: con 6B parámetros activos y soporte de tool calling, puede integrarse en pipelines de agentes que requieren razonamiento multi-paso y uso de herramientas externas, como búsquedas en bases de datos o llamadas a APIs.
- Asistente de generación de código en producción: el modelo puede asistir en la escritura, revisión y refactorización de código en entornos de desarrollo, aprovechando su contexto largo para mantener coherencia en proyectos de gran tamaño.
- Búsqueda y recuperación de información multimodal: permite consultas sobre corpus de imágenes y texto, como catálogos de productos o bases de datos de investigación, generando respuestas contextualizadas a partir de las entradas visuales y textuales.
- Resumen y extracción de información de largas conversaciones: con su contexto nativo de 262K tokens, puede resumir historiales completos de chat, logs de sistemas o hilos de correo electrónico, manteniendo detalles relevantes sin perder información inicial.
- Despliegue en entornos Apple Silicon: al ser una conversión MLX, está optimizada para ejecutarse en hardware Apple con memoria unificada, permitiendo ejecutar el modelo en una Mac con suficiente RAM, sin necesidad de GPUs NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de rendimiento como MMLU, HumanEval o GSM8K, y la búsqueda web no ha proporcionado datos comparativos. La documentación del modelo base en vLLM y unsloth no detalla resultados de benchmarks específicos para Qwen3.8-Flash-Next.

## Requisitos de hardware

- El payload del modelo cuantizado es de 97.55 GiB (104.8 GB en el repositorio), por lo que se requiere una Mac con al menos 128 GB de memoria unificada para cargar el modelo en memoria sin cuantización adicional.
- La versión MLX está optimizada para Apple Silicon (GPU y CPU unificadas). No se recomienda su uso en hardware NVIDIA, ya que MLX es específico de Apple.
- No se dispone de datos de VRAM estimada para GPUs NVIDIA, ya que el formato MLX no es compatible con esas plataformas.
- Para inferencia, se requiere un runtime MLX compatible con la arquitectura Qwen4Exp (por ejemplo, una versión reciente de mlx-lm o mlx-vlm). No se recomienda usar versiones antiguas de estas librerías.
- No se han publicado datos de latencia o throughput específicos para esta conversión.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 180B (125B main + 51B n-gram + 4B MTP) | 6B | 262 144 | safetensors (BF16) | Qwen Community 1.0 |
| Qwen3.8-Flash-Next-MLX-4bit (este modelo) | 180B (reporta 29.9B en safetensors cuantizado) | 6B | 262 144 | MLX (safetensors) | Qwen Community 1.0 |
| Qwen3.8-Flash-Next-MLX-Mixed-2bit (del mismo autor) | 180B (reporta menos en safetensors) | 6B | 262 144 | MLX (safetensors) | Qwen Community 1.0 |

No se han encontrado modelos comparables de otros autores en la misma categoría (multimodal MoE de 6B activos con contexto 262K) con la información proporcionada. La comparativa se limita al modelo original y a la variante de 2-bit del mismo conversor.

## Limitaciones y advertencias

- La licencia Qwen Community License 1.0 incluye requisitos de atribución y visualización para productos comerciales de muy gran tamaño, y condiciones de licencia separadas para usos comerciales de Model-as-a-Service y AI Work Assistant. Revisar los términos completos antes de uso comercial.
- El modelo requiere un runtime MLX específico para la arquitectura Qwen4Exp. Las versiones antiguas de mlx-lm o mlx-vlm no podrán cargar ni ejecutar el modelo.
- El repositorio tiene 104.8 GB de tamaño, lo que implica un requisito de almacenamiento considerable y una carga de memoria unificada de al menos 128 GB en Apple Silicon para inferencia.
- No se han publicado datos de rendimiento ni benchmarks, por lo que las capacidades reales en tareas específicas no están verificadas de forma independiente.
- La cuantización Q4 puede introducir degradación en la calidad de generación respecto al modelo en BF16, especialmente en tareas que requieren alta precisión numérica o razonamiento largo.
- No se especifican los idiomas soportados ni los sesgos potenciales del modelo. Se recomienda evaluar el comportamiento en el idioma objetivo antes de producción.
- El modelo no está gated, pero la licencia no elimina las restricciones de uso comercial descritas anteriormente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sawfwair/Qwen3.8-Flash-Next-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante 2-bit del mismo autor: https://huggingface.co/Sawfwair/Qwen3.8-Flash-Next-MLX-Mixed-2bit
- Documentación de unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Receta de vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Artículo de unite.ai: https://www.unite.ai/qwen3-8-flash-next-previews-qwen4-architecture-with-6b-active-parameters/

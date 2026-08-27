# mazinb/Qwen3.8-Flash-Next-Uncensored-NVFP4

## Resumen

El modelo `mazinb/Qwen3.8-Flash-Next-Uncensored-NVFP4` es una variante cuantizada en NVFP4 (4 bits) y "abliterated" (sin censura) del modelo multimodal Qwen3.8-Flash-Next de Qwen. El proceso de abliteration elimina los vectores de rechazo del modelo original, dando como resultado una versión que no aplica los filtros de seguridad estándar, orientada exclusivamente a tareas de red-teaming e investigación en alineación. La cuantización NVFP4 ha sido realizada por primitive-ai, mientras que el ajuste "uncensored" proviene de orcarouter, y la integración final la firma mazinb.

Se trata de un modelo de arquitectura MoE (Mixture of Experts) ultra-sparse con aproximadamente 119,6 mil millones de parámetros en los pesos safetensors (125 B oficiales incluyendo una tabla N-gram de 51 B), de los cuales solo se activan unos 6 B por token. Soporta una ventana de contexto de 262.144 tokens y procesa entradas de imagen y texto. Su relevancia radica en que, gracias a la cuantización NVFP4 y al offloading de la tabla N-gram a RAM del host, es posible ejecutar este modelo de 180 B (en BF16) en una única GPU Blackwell de 96 GB, algo que antes requería dos GPU de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse híbrida (GDN + QSA) |
| Parametros totales | 119.602.003.859 (~119,6 B) en safetensors; 125 B oficiales (incluye tabla N-gram de 51 B) |
| Parametros activos | ~6 B por token |
| Longitud de contexto | 262.144 tokens (262 K) |
| Tipos de cuantizacion | NVFP4 (4 bits) |
| Idiomas soportados | Inglés (en), Chino (zh) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (transformers, compatible con vLLM) |

## Arquitectura y entrenamiento

La arquitectura base, Qwen3.8-Flash-Next, introduce un diseño híbrido de atención que combina dos mecanismos: Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA). En concreto, tres de cada cuatro capas utilizan Gated DeltaNet para comprimir el historial de forma eficiente, mientras que la cuarta capa emplea QSA para una recuperación precisa de información de largo alcance. Esta combinación mejora la capacidad del modelo a la vez que optimiza la eficiencia computacional y la estabilidad del entrenamiento. El modelo incluye además una tabla N-gram de 51 B de parámetros que actúa como memoria auxiliar.

El modelo base fue entrenado por Qwen, aunque no se especifican en la información disponible el número de tokens, la composición del dataset ni los métodos de alineación (RLHF/DPO) utilizados. La variante NVFP4 es una cuantización a 4 bits realizada por primitive-ai, que reduce el peso de 360 GB en BF16 a aproximadamente 88,8 GiB de VRAM. La variante "uncensored" se obtiene mediante abliteration, una técnica que identifica y elimina las direcciones del espacio de activaciones responsables de los rechazos de seguridad, sin reentrenar el modelo.

## Capacidades

- Generación de texto y razonamiento avanzado multi-paso.
- Procesamiento multimodal de imagen y texto (image-text-to-text).
- Soporte de function calling / tool calling para integración con herramientas externas.
- Capacidad para tareas de agente autónomo con razonamiento encadenado.
- Multi-Token Prediction (MTP) para acelerar la decodificación y mejorar el throughput.
- Modelo "uncensored" (abliterated): no aplica los rechazos de seguridad estándar, lo que permite explorar comportamientos sin restricciones en entornos controlados.
- Multilingüe limitado a inglés y chino.

## Casos de uso

- Red-teaming y evaluación de seguridad: al estar abliterated, permite a los investigadores probar los límites del modelo base sin los filtros de rechazo habituales, identificando vulnerabilidades en los sistemas de alineación.
- Investigación en alineación de modelos: estudiar el impacto cuantitativo de la eliminación de vectores de rechazo en el comportamiento, la coherencia y la utilidad del modelo.
- Análisis multimodal de documentos extensos: gracias a su contexto de 262 K tokens y su capacidad de visión, puede procesar manuales técnicos, informes financieros o artículos científicos con gráficos e imágenes integradas.
- Desarrollo de agentes autónomos de investigación: con function calling y razonamiento multi-paso, puede orquestar llamadas a APIs, ejecutar código y recopilar información en pipelines automatizados.
- Despliegue en hardware limitado: al caber en una única GPU Blackwell de 96 GB, es adecuado para entornos de investigación que no disponen de clústeres multi-GPU, manteniendo la capacidad de un modelo de 180 B.
- Generación de código y asistencia técnica: aunque no se aportan benchmarks específicos, el modelo base es competente en tareas de programación, y la versión sin censura puede resultar útil para generar código en dominios donde los filtros estándar bloquean ciertas peticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante cuantizada y abliterated en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas comparativas para esta versión concreta.

## Requisitos de hardware

- VRAM estimada: aproximadamente 88,8 GiB de VRAM para los pesos NVFP4, más la tabla N-gram de 51 B que se aloja en RAM del host (según la documentación de primitive-ai).
- GPU recomendada: una GPU Blackwell de 96 GB, como la B200 o la RTX PRO 6000 Blackwell Edition. No es compatible con GPUs de consumo (RTX 4090, 3090, etc.) por sus requisitos de memoria.
- Opciones de despliegue: vLLM (compatible con NVFP4), transformers. No se menciona soporte para GGUF o llama.cpp en este tamaño.
- Latencia y throughput: no disponible. No obstante, la activación de solo 6 B de parámetros por token y la decodificación MTP deberían ofrecer una latencia relativamente baja para un modelo de este tamaño, aunque la tabla N-gram en RAM puede introducir latencia adicional si la memoria del host no es de alta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | VRAM necesaria | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (BF16) | 125 B (6 B activos) | 262 K | BF16 | ~360 GB (2 GPU data-center) | qwen-community-1.0 |
| Qwen3.8-Flash-Next (FP8) | 125 B (6 B activos) | 262 K | FP8 | ~180 GB (2 GPU data-center) | qwen-community-1.0 |
| Qwen3.8-Flash-Next-NVFP4 (primitive-ai) | 125 B (6 B activos) | 262 K | NVFP4 | 88,8 GiB + RAM (1 GPU 96 GB) | qwen-community-1.0 |
| mazinb/Qwen3.8-Flash-Next-Uncensored-NVFP4 | 119,6 B (6 B activos) | 262 K | NVFP4 | 88,8 GiB + RAM (1 GPU 96 GB) | qwen-community-1.0 |

La principal diferencia frente a las versiones sin cuantizar es la reducción drástica de requisitos de hardware, pasando de necesitar dos GPU de centro de datos a una sola GPU Blackwell de 96 GB. La variante de mazinb añade además la capa de abliteration, que no está presente en la versión de primitive-ai.

## Limitaciones y advertencias

- Al ser una versión "uncensored" (abliterated), el modelo puede generar contenido dañino, ilegal, violento o éticamente cuestionable. Su uso debe limitarse estrictamente a entornos de investigación controlados y a tareas de red-teaming.
- La licencia qwen-community-1.0 permite el uso comercial, pero impone restricciones: si el producto supera los 100 millones de usuarios activos mensuales, se requiere un permiso explícito de Qwen.
- La cuantización NVFP4 (4 bits) puede introducir una degradación en la precisión con respecto a las versiones BF16 o FP8, especialmente en tareas de razonamiento complejo o matemáticas.
- El modelo solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- El acceso al repositorio en HuggingFace es restringido (gated), por lo que es necesario aceptar las condiciones de uso antes de poder descargar los pesos.
- La tabla N-gram de 51 B se almacena en RAM del host, lo que puede convertirse en un cuello de botella si la memoria del sistema no es lo suficientemente rápida o si hay contención con otros procesos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mazinb/Qwen3.8-Flash-Next-Uncensored-NVFP4
- Modelo base (Qwen): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización NVFP4 (primitive-ai): https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-NVFP4
- Repositorio GitHub oficial: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Blog de orcarouter sobre la versión uncensored: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally

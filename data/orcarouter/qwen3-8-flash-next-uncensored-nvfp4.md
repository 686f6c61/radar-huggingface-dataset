# orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4

## Resumen

El modelo `orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4` es una versión "abliterated" (sin censura) y cuantizada a NVFP4 del modelo base `Qwen/Qwen3.8-Flash-Next`, desarrollado por el usuario orcarouter. Se trata de una vista previa de la arquitectura Qwen4, un modelo de lenguaje y visión (image-text-to-text) de tipo MoE con aproximadamente 124.5 mil millones de parámetros totales y 6 mil millones de parámetros activos por token. La relevancia de este modelo radica en que combina las capacidades de vanguardia del ecosistema Qwen (razonamiento, tool calling, visión) con una eliminación de las restricciones de seguridad a nivel de tensor, lo que lo hace especialmente útil para tareas de red teaming, investigación en alineación y generación de contenido sin filtros.

Al estar cuantizado en NVFP4 (4 bits) y ser compatible con vLLM, está pensado para despliegue eficiente en entornos con GPUs de alta gama, aunque su acceso es restringido (gated) en HuggingFace. El proceso de abliteration aplicado por orcarouter deja intactos el vision tower y el head de MTP, y según los datos del modelo hermano de 27B, no presenta una pérdida medible de capacidades, manteniendo un 0% de over-refusal en XSTest.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) - Qwen4 architecture preview |
| Parametros totales | 124.545.978.992 (124.5B) |
| Parametros activos | 6B (por token) |
| Longitud de contexto | no disponible (el modelo base soporta contexto largo; el hermano 27B tiene 262K) |
| Tipos de cuantizacion | NVFP4 (FP4), FP8 (según tags) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen4 (preview), que es un MoE con un modelo principal de aproximadamente 125B de parámetros, complementado con 51B de embeddings N-gram, activando únicamente 6B de parámetros por token. Esta configuración permite un equilibrio entre capacidad y eficiencia computacional. El proceso de "uncensoring" consiste en un abliteration a nivel de tensor, una técnica que elimina las direcciones de activación responsables del comportamiento de rechazo, manteniendo intactos el vision tower y el head de MTP (Multi-Token Prediction). El modelo base fue entrenado por Qwen, y orcarouter aplicó la técnica de abliteration seguida de una cuantización a NVFP4 para reducir el footprint de memoria. No se han publicado detalles específicos sobre el dataset de entrenamiento del abliteration, pero el resultado reportado en modelos hermanos es una reducción drástica de la tasa de rechazo sin pérdida de capacidades.

## Capacidades

- Generación de texto y razonamiento multi-step con modo "thinking" integrado.
- Comprensión de imágenes (image-text-to-text) gracias al vision tower intacto.
- Soporte de tool calling / function calling para integración con APIs y agentes.
- Conversación multilingüe, con soporte nativo para inglés y chino.
- Modelo "uncensored" (abliterated) con 0% de over-refusal en XSTest y 0-6% de refusal en el suite A/B (según datos del modelo 27B).
- Compatible con vLLM (endpoints_compatible) y transformers.

## Casos de uso

- Red teaming y auditoría de seguridad: al estar abliterated, es ideal para probar jailbreaks, evaluar la robustez de otros sistemas de moderación y generar adversarial prompts en entornos controlados.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones, poesía o narrativa donde los modelos censurados bloquean contenido por política, permitiendo explorar estilos y temas sin límites.
- Agentes autónomos multimodales: al combinar visión, tool calling y razonamiento, puede integrarse en pipelines de automatización que requieran leer capturas de pantalla, analizar imágenes y ejecutar acciones vía APIs.
- Investigación en alineación y seguridad de IA: estudiar el impacto del abliteration en las capacidades del modelo, comparando el comportamiento con la versión base para entender los mecanismos internos de rechazo.
- Asistente de análisis de documentos técnicos: procesar documentos en chino e inglés que contengan diagramas, gráficos o fórmulas, extrayendo información estructurada con razonamiento avanzado.
- Desarrollo de chatbots especializados sin filtros: para dominios como medicina, derecho o psicología donde los matices y la jerga técnica pueden ser bloqueados por clasificadores de seguridad genéricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización NVFP4 en la información disponible. El autor menciona en modelos hermanos (Qwen3.8-27B) que el abliteration no produce una pérdida medible de capacidades, pero no se proporcionan números concretos de MMLU, HumanEval o GSM8K para esta versión de 124.5B. Se recomienda consultar el repositorio del modelo base `Qwen/Qwen3.8-Flash-Next` para obtener métricas de referencia, aunque la cuantización NVFP4 puede introducir una ligera degradación en tareas de alta precisión.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 177.7 GB, lo que sugiere que la cuantización NVFP4 (4 bits) ocupa aproximadamente 60-70 GB para los pesos del modelo principal. Se requiere un mínimo de 80 GB de VRAM para inferencia en una sola GPU.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, o configuraciones multi-GPU con RTX 4090 (24GB) usando tensor parallelism.
- No cabe en GPUs de consumo estándar (16-24 GB) en esta cuantización; para esos casos, el autor ofrece versiones GGUF del modelo 27B.
- Opciones de despliegue: vLLM (recomendado, con soporte nativo para NVFP4), transformers, y potencialmente llama.cpp si se convierten los pesos a GGUF.
- Latencia y throughput: no disponible, pero al ser un MoE con 6B activos, el throughput esperado es superior al de un modelo denso de 124B, aunque la cuantización NVFP4 requiere kernels optimizados de vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Acceso |
|---|---|---|---|---|---|
| orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4 | 124.5B (6B activos) | no disponible | NVFP4 | Apache 2.0 | Gated |
| orcarouter/Qwen3.8-27B-Uncensored | 27B | 262K | GGUF (Q4_K_M, etc.) | Apache 2.0 | Gated |
| Qwen/Qwen3.8-Flash-Next (base) | 124.5B (6B activos) | no disponible | FP8/BF16 | Apache 2.0 | Abierto |

La principal diferencia con el modelo base es la eliminación de la censura y la cuantización a NVFP4. Frente al modelo 27B, este ofrece 4.6 veces más parámetros totales y una arquitectura MoE más avanzada, pero requiere hardware de datacenter. El modelo 27B es más accesible para GPUs de consumo (16-24 GB) y tiene un contexto conocido de 262K.

## Limitaciones y advertencias

- Acceso restringido (gated) en HuggingFace: es necesario aceptar condiciones adicionales antes de poder descargar el modelo.
- Modelo sin censura: puede generar contenido ofensivo, violento, ilegal o peligroso. No es apto para producción sin una capa de moderación externa.
- Idiomas limitados: solo soporta inglés y chino de forma nativa; otros idiomas pueden tener un rendimiento degradado.
- Cuantización NVFP4: puede introducir pérdida de precisión en tareas que requieren alta exactitud numérica, como matemáticas avanzadas o generación de código complejo.
- Longitud de contexto no confirmada para esta versión específica; aunque el modelo base soporta contexto largo, se recomienda verificar la documentación oficial antes de usarlo con ventanas muy extensas.
- Riesgo de alucinación: al ser un modelo sin censura, las alucinaciones pueden ser más difíciles de detectar si el contenido generado es plausible pero falso, especialmente en dominios especializados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4
- Blog de orcarouter sobre ejecución local de modelos uncensored: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Modelo hermano 27B en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Modelo base Qwen3.8-Flash-Next (vLLM Recipes): https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Modelo base Qwen3.8-27B (referencia de benchmarks): https://huggingface.co/Qwen/Qwen3.8-27B

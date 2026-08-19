# ilyakam/Geer-Qwen3.8-27B-6bit-MLX

## Resumen

Geer-Qwen3.8-27B-6bit-MLX es una conversión independiente, en formato MLX y cuantización de 6 bits, del modelo Qwen3.8-27B, realizada por el usuario ilyakam. No se trata de un modelo fundacional nuevo, sino de un artefacto optimizado para ejecución local en Apple Silicon, orientado a tareas de agente de código (agentic coding). La conversión preserva la torre multimodal (imagen-texto) y la cabeza nativa de predicción multi-token (MTP) del modelo original, y utiliza cuantización afín con grupo de tamaño 64, dejando sin cuantizar la torre de visión, los embeddings, la cabeza de salida, las normas y los tensores MTP.

El modelo base, Qwen3.8-27B, pertenece a la familia Qwen3.5 y es un modelo denso de aproximadamente 27 mil millones de parámetros, con capacidad multimodal y soporte de contexto largo. Esta conversión MLX está pensada para equipos Mac con 64 GB o más de memoria unificada, con un techo de contexto de 128K en 64 GB y de 256K en 96/128 GB. La licencia es Apache 2.0, lo que permite uso comercial, y el idioma declarado es exclusivamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal, denso, con MTP nativo) |
| Parametros totales | 8.757.555.952 (según safetensors; el nombre sugiere 27B, posible discrepancia) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K en 64 GB; 256K en 96/128 GB (según model card) |
| Tipos de cuantizacion | 6-bit (afín, group size 64); torre de visión, embeddings, cabeza de salida, normas y MTP sin cuantizar |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa de la familia Qwen3.5, con capacidades multimodales (procesamiento conjunto de imagen y texto) y una cabeza de predicción multi-token (MTP) nativa, que permite generar varios tokens por paso de decodificación. No se dispone de detalles públicos sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO para este modelo base.

La conversión MLX realizada por ilyakam no implica entrenamiento adicional. Se trata de una transformación de pesos del checkpoint BF16 original (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) a una representación cuantizada de 6 bits con cuantización afín y grupo de tamaño 64. Las capas críticas para la estabilidad y la calidad (torre de visión, embeddings, cabeza de salida, normas y tensores MTP) se mantienen en precisión completa. El autor declara que los manifiestos de compilación registran hashes exactos de los archivos, lo que permite reproducibilidad.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.8-27B es capaz de tareas de lenguaje general, incluyendo razonamiento complejo y generación de respuestas coherentes.
- Generación de código: orientado específicamente a agentes de código, puede asistir en programación, depuración y refactorización.
- Procesamiento multimodal: al preservar la torre de visión, el modelo puede procesar entradas de imagen y texto, permitiendo tareas como descripción de imágenes o análisis de capturas de pantalla.
- Predicción multi-token (MTP): la cabeza MTP nativa permite una decodificación más rápida al predecir varios tokens por paso, mejorando el throughput en inferencia local.
- Soporte de agentes: el modelo está diseñado para flujos de agente, lo que implica capacidad de razonamiento multi-paso y posible integración con herramientas (tool calling), aunque no se especifica explícitamente en la documentación.
- Multilingüismo: limitado al inglés según la model card; no se garantiza rendimiento en otros idiomas.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en su Mac para obtener sugerencias de código, explicaciones de fragmentos o detección de errores, sin enviar datos a la nube. La cuantización 6-bit permite cargar el modelo en 64 GB de memoria unificada.
- Agente de código autónomo: gracias a la capacidad de razonamiento multi-paso y la generación de código, el modelo puede actuar como agente que planifica, escribe y verifica cambios en un repositorio, ejecutándose localmente con MLX.
- Análisis de capturas de pantalla y documentación técnica: al ser multimodal, puede interpretar imágenes de interfaces, diagramas o capturas de pantalla de errores, y generar explicaciones o código asociado.
- Desarrollo de herramientas de productividad: integración en editores de código o IDEs como plugin local, aprovechando el contexto largo (128K en 64 GB) para mantener conversaciones extensas sobre un proyecto.
- Prototipado rápido de aplicaciones con IA: investigadores y desarrolladores pueden experimentar con un modelo de 27B en hardware de consumo (Apple Silicon) sin necesidad de GPUs dedicadas, gracias a la conversión MLX.
- Automatización de tareas de documentación: el modelo puede generar comentarios, docstrings o documentación técnica a partir de código fuente, con la ventaja de procesamiento local y privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta conversión MLX en la información disponible. La model card indica que los resultados de referencia del modelo base corresponden al checkpoint BF16 original, no a esta conversión cuantizada. Por tanto, no se dispone de métricas propias (MMLU, HumanEval, GSM8K, etc.) para este artefacto.

## Requisitos de hardware

- Memoria: se requiere un Mac con Apple Silicon y al menos 64 GB de memoria unificada para el perfil de contexto de 128K. Los perfiles de 48 GB y 64 GB se declaran provisionales hasta ser validados en hardware real.
- GPU: no aplica GPU discreta; el modelo se ejecuta en la GPU integrada de Apple Silicon mediante MLX.
- Almacenamiento: el repositorio ocupa 26.7 GB, por lo que se necesita espacio en disco para los pesos.
- Opciones de despliegue: MLX (librería nativa de Apple), probablemente con herramientas como `mlx-lm` o integración en aplicaciones Swift/Python. No se mencionan vLLM, llama.cpp u otros backends.
- Latencia y throughput: no se proporcionan datos concretos. La presencia de MTP nativo sugiere una mejora en velocidad de decodificación, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El modelo base Qwen3.8-27B podría compararse con otros modelos de ~27B como Llama 3.1 8B o Qwen2.5 32B, pero no se han proporcionado datos de rendimiento ni de disponibilidad para esta conversión específica. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Idioma: la model card declara exclusivamente inglés; el rendimiento en otros idiomas no está garantizado.
- Conversión no oficial: se trata de una conversión independiente, no respaldada por el equipo de Qwen. Podría haber diferencias de comportamiento respecto al checkpoint BF16 original.
- Perfiles de memoria provisionales: los perfiles de 48 GB y 64 GB no han sido validados en hardware real, por lo que su estabilidad no está confirmada.
- Discrepancia en parámetros: el número de parámetros reportado en safetensors (8.757.555.952) no coincide con la denominación "27B" del modelo base. Esto podría deberse a un error en el registro o a una conversión parcial; se recomienda verificar antes de usar en producción.
- Sin benchmarks propios: no hay métricas de rendimiento para esta conversión, por lo que no se puede evaluar su calidad relativa.
- Requisitos de hardware elevados: aunque es para Apple Silicon, necesita 64 GB o más de memoria, lo que limita su uso a equipos de gama alta.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en tareas de código o razonamiento complejo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ilyakam/Geer-Qwen3.8-27B-6bit-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

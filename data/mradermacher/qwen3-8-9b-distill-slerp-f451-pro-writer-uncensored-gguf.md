# mradermacher/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored-GGUF

## Resumen

El modelo `Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored-GGUF` es una cuantización en formato GGUF realizada por el usuario mradermacher sobre un modelo base creado por nuofang. El modelo base es un merge de tipo SLERP (Spherical Linear Interpolation) realizado con mergekit, que combina un modelo destilado de la familia Qwen (Qwen3.8-9B-Distill) con un modelo denominado F451-Pro-Writer-Uncensored, orientado a escritura creativa, novelas y roleplay. La versión GGUF permite ejecutar el modelo en entornos con recursos limitados mediante llama.cpp, Ollama u otros motores compatibles.

El modelo está etiquetado como "uncensored" y "not for all audiences", lo que indica que ha sido ajustado para eliminar restricciones de contenido, incluyendo temáticas NSFW. Está pensado principalmente para el idioma chino (etiqueta `zh`), aunque podría funcionar en otros idiomas con menor calidad. Incluye además archivos de proyección multimodal (`mmproj`), lo que sugiere que el modelo base soporta entrada de imágenes, aunque no se especifica la arquitectura exacta.

La relevancia de esta ficha radica en que se trata de un modelo especializado en generación de texto creativo sin filtros, un nicho con demanda en comunidades de escritura y roleplay. Sin embargo, la falta de información sobre el entrenamiento, la licencia y los benchmarks limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3.8-9B-Distill (detalles no disponibles) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | zh (chino) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. El nombre sugiere que se trata de una destilación de un modelo de la familia Qwen (posiblemente Qwen3) con 9 mil millones de parámetros, pero no se confirma ni el número de capas ni el tipo de atención. El modelo base `nuofang/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored` se construyó mediante un merge SLERP con mergekit, combinando los pesos de dos modelos: uno destilado de Qwen y otro especializado en escritura creativa sin censura. El proceso de entrenamiento (datos, tokens, método de alineación) no se documenta en la información proporcionada.

La cuantización GGUF fue realizada por mradermacher mediante conversión estática, generando múltiples niveles de precisión (desde f16 hasta Q2_K) para adaptarse a distintas capacidades de hardware. También se incluyen dos archivos `mmproj` (proyección multimodal), lo que indica que el modelo base podría aceptar entradas de imagen, aunque no se especifica el mecanismo exacto.

## Capacidades

- Generación de texto creativo: novelas, relatos, diálogos y narrativa con un estilo "vívido" según las etiquetas del autor.
- Roleplay y conversación: diseñado para mantener personajes y contextos de interpretación de roles.
- Contenido sin censura: el modelo no aplica filtros de seguridad estándar, permitiendo temáticas NSFW, violencia o lenguaje explícito.
- Multimodalidad parcial: los archivos `mmproj` sugieren que el modelo puede procesar imágenes (aunque no se confirma el tipo de visión).
- Multilingüe limitado: la etiqueta de idioma es solo `zh`, aunque los modelos base de Qwen suelen tener capacidades multilingües; no se garantiza la calidad en otros idiomas.
- Sin soporte declarado de tool calling ni agentes: no aparece en la documentación.

## Casos de uso

- Escritura de novelas y relatos largos: el modelo puede generar capítulos completos con coherencia narrativa, gracias a su especialización en escritura creativa. Se usaría con prompts que describan la trama, los personajes y el tono deseado.
- Roleplay en línea: ideal para juegos de rol por texto o chats de personajes, manteniendo la voz del personaje y reaccionando a las acciones del usuario.
- Generación de diálogos para guiones o videojuegos: puede producir conversaciones naturales entre múltiples personajes, útil para prototipos de narrativa interactiva.
- Creación de contenido NSFW para adultos: el modelo no tiene restricciones de contenido, por lo que puede usarse en plataformas de ficción erótica o comunidades de escritura adulta (con las advertencias legales correspondientes).
- Asistente de lluvia de ideas creativas: puede sugerir tramas, giros argumentales o descripciones de escenas, sirviendo como herramienta de apoyo para escritores.
- Traducción creativa al chino: dado su enfoque en el idioma chino, puede traducir o adaptar textos literarios con un estilo más natural que los traductores automáticos genéricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida, el archivo GGUF varía entre 4,0 GB (Q2_K) y 18,5 GB (f16). Con el contexto por defecto, se recomienda al menos 2-3 GB de VRAM adicional para el estado de la inferencia, por lo que la Q4_K_M (5,9 GB) requeriría aproximadamente 8 GB de VRAM total.
- GPU recomendadas: para las cuantizaciones Q4 y Q5, una GPU con 8-12 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 3080) es suficiente. Para Q8_0 o f16, se necesitan 12-24 GB (RTX 3090, RTX 4090, A5000).
- Compatibilidad con GPU de consumo: sí, las versiones Q4_K_M y Q4_K_S caben en GPUs de 8 GB, y las Q3 en tarjetas de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp, text-generation-webui (con backend llama.cpp). También puede usarse con vLLM si se convierte a otro formato, pero no es el propósito de este repo.
- Latencia y throughput estimados: no disponibles. En una RTX 4090, un modelo de 9B en Q4_K_M suele generar entre 30 y 60 tokens por segundo, pero no hay mediciones específicas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos alternativos de escritura creativa sin censura. Se podría mencionar que existen otros modelos como `Qwen2.5-7B-Instruct` o `Llama-3.1-8B-Instruct`, pero no hay datos de rendimiento comparativos y las licencias y especializaciones difieren. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Contenido NSFW y sin filtrar: el modelo puede generar contenido explícito, violento u ofensivo. No es apto para menores ni para entornos profesionales sin control de contenido.
- Sesgos y alucinaciones: al ser un modelo sin ajuste fino de seguridad, es más propenso a reproducir estereotipos o generar información falsa con alta confianza.
- Idioma limitado: la etiqueta indica solo chino; el rendimiento en inglés u otros idiomas puede ser deficiente.
- Licencia no especificada: no se indica bajo qué licencia se distribuye el modelo, lo que impide su uso comercial legal sin consultar al autor del modelo base.
- Falta de documentación: no hay información sobre el dataset de entrenamiento, el proceso de destilación ni los hiperparámetros, lo que dificulta la reproducibilidad y la evaluación de riesgos.
- Multimodalidad no confirmada: aunque hay archivos `mmproj`, no se documenta cómo usarlos ni qué tipo de imágenes acepta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored-GGUF
- Modelo base: https://huggingface.co/nuofang/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored
- Versión i1-GGUF (con imatrix): https://huggingface.co/mradermacher/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored-i1-GGUF
- Página de despliegue en FriendliAI: https://friendli.ai/models/nuofang/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored

# crazyape777/mir-diane613-affine-5gedzafcvg-jesusss

## Resumen

El repositorio `crazyape777/mir-diane613-affine-5gedzafcvg-jesusss` contiene los pesos de un modelo de lenguaje causal con encoder de visión, identificado en su model card como **Qwen3.6-35B-A3B**, desarrollado por el equipo Qwen de Alibaba. Se trata de una variante de la serie Qwen3.6, publicada como open-weight bajo licencia Apache 2.0, y este repositorio concreto parece ser una copia o duplicado alojado por un usuario independiente (crazyape777), sin modificaciones aparentes respecto al original.

El modelo combina una arquitectura híbrida que mezcla atención lineal (Gated DeltaNet) con atención clásica (Gated Attention), junto con un bloque de mezcla de expertos (MoE) de 256 expertos, de los cuales se activan 8 enrutados más 1 compartido. En total suma 35 mil millones de parámetros, de los cuales solo 3 mil millones se activan por token, lo que permite un rendimiento eficiente. Su longitud de contexto nativa es de 262 144 tokens, extensible hasta aproximadamente 1 010 000 tokens, y está diseñado especialmente para tareas de codificación agéntica y razonamiento a nivel de repositorio. Incluye además un encoder de visión, por lo que acepta entradas de imagen y texto.

La relevancia de este modelo radica en su enfoque en estabilidad y utilidad práctica para desarrolladores, con mejoras en flujos de trabajo frontend y razonamiento sobre repositorios completos, así como una opción para preservar el contexto de razonamiento histórico en conversaciones iterativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention + MoE, con encoder de visión |
| Parametros totales | 35 107 181 936 (35B) |
| Parametros activos | 3B (MoE con 8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 010 000 |
| Tipos de cuantizacion | No disponible (el repo contiene pesos en BF16, safetensors) |
| Idiomas soportados | No disponible (no se especifica en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura de lenguaje causal con 40 capas, organizadas en un layout de 10 bloques, cada uno compuesto por 3 sub-bloques de `Gated DeltaNet → MoE` seguidos de 1 sub-bloque de `Gated Attention → MoE`. La atención lineal (Gated DeltaNet) utiliza 32 cabezas para V y 16 para QK, con dimensión de cabeza 128, mientras que la atención clásica (Gated Attention) emplea 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y rotary position embedding de dimensión 64. La capa MoE tiene 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, con dimensión intermedia de 512. El modelo incluye además un encoder de visión, lo que lo convierte en un modelo multimodal de imagen-texto.

El entrenamiento se realizó en dos etapas: pre-training y post-training, e incluye la técnica de multi-token prediction (MTP) con múltiples pasos. No se han proporcionado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La model card menciona que se priorizó la estabilidad y la utilidad real, con mejoras específicas en codificación agéntica y preservación del razonamiento.

## Capacidades

- Generación de texto y razonamiento complejo, con especial énfasis en tareas de codificación.
- Codificación agéntica: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio completo.
- Preservación del razonamiento: opción de retener el contexto de razonamiento de mensajes históricos, útil para desarrollo iterativo.
- Entrada multimodal: acepta imágenes y texto (pipeline image-text-to-text).
- Soporte para tool calling y uso como agente, inferido por su enfoque en tareas agénticas (no se confirma explícitamente en la card).
- Contexto largo: 262K tokens nativos, extensible a más de 1M, adecuado para documentos extensos y repositorios de código.
- Multilingüismo: no confirmado, aunque los modelos Qwen suelen ser multilingües; no se especifica en la documentación.

## Casos de uso

- Asistente de programación en IDE: el modelo puede ofrecer autocompletado y sugerencias de código con contexto de todo el repositorio, gracias a su ventana de 262K tokens que permite cargar múltiples archivos.
- Agente autónomo de resolución de issues: con su capacidad de razonamiento a nivel de repositorio, puede analizar un issue, localizar los archivos relevantes y generar un parche, integrándose en pipelines de CI/CD.
- Generación de interfaces frontend: el modelo está optimizado para flujos de trabajo frontend, por lo que puede generar componentes React, Vue o HTML/CSS a partir de descripciones en lenguaje natural o capturas de imagen.
- Revisión de código automatizada: puede analizar pull requests completos, detectar errores lógicos y sugerir mejoras, manteniendo el contexto de conversaciones anteriores gracias a la preservación de razonamiento.
- Chatbot técnico con contexto de documentación: al cargar documentación extensa (hasta 1M tokens), puede responder preguntas sobre APIs o arquitecturas internas de un proyecto.
- Análisis de imágenes y diagramas: gracias al encoder de visión, puede interpretar capturas de pantalla de interfaces, diagramas de arquitectura o diagramas de flujo y generar código o explicaciones asociadas.

## Benchmarks y rendimiento

La model card incluye resultados de benchmarks para tareas de codificación agéntica, comparando con varios modelos de tamaño similar. Se presentan los datos disponibles:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |
| Terminal-Bench 2.0 | (dato no disponible en la información proporcionada) | | | | |

No se dispone de resultados para otros benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- El modelo tiene 35B parámetros en total, pero solo 3B activos por token, lo que reduce significativamente los requisitos de memoria durante la inferencia.
- En BF16, el peso del modelo ocupa aproximadamente 70 GB (tamaño del repositorio), por lo que se requiere una GPU con al menos 80 GB de VRAM (p. ej., A100 80GB, H100) para cargar los pesos completos sin cuantización.
- Con cuantización a 8 bits, el modelo podría caber en una GPU de 40 GB (p. ej., A100 40GB), y con 4 bits en una de 24 GB (p. ej., RTX 4090, A5000).
- Para despliegue en producción, se recomienda usar vLLM, SGLang o KTransformers, tal como se indica en la model card, que son compatibles con este formato de pesos.
- La latencia y el throughput no se han publicado, pero al ser un MoE con solo 3B activos, la velocidad de inferencia debería ser comparable a la de un modelo denso de ~3B, aunque el ancho de banda de memoria será mayor debido a la carga de todos los parámetros.
- En entornos sin GPU de alta capacidad, se puede ejecutar en CPU con llama.cpp (si se convierte a GGUF), aunque con menor rendimiento.

## Comparativa con modelos similares

El modelo se posiciona frente a otras alternativas de la misma categoría (modelos MoE de ~30B con 3-4B activos). Según los benchmarks disponibles:

| Modelo | Parámetros totales | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35BA3B (este) | 35B | 3B | 262K (ext. 1M) | 73.4 | Apache 2.0 |
| Qwen3.5-35BA3B | 35B | 3B | no disponible | 70.0 | Apache 2.0 |
| Gemma4-26BA4B | 26B | 4B | no disponible | 17.4 | no disponible |
| Qwen3.5-27B | 27B | denso | no disponible | 75.0 | Apache 2.0 |

El modelo supera a su predecesor Qwen3.5-35BA3B en SWE-bench Verified y Multilingual, aunque queda ligeramente por detrás del denso Qwen3.5-27B en Verified. Frente a Gemma4-26BA4B, la diferencia es muy notable en tareas de codificación agéntica.

## Limitaciones y advertencias

- No se han publicado estudios de sesgos o alucinaciones específicos para este modelo; se recomienda evaluarlo en el dominio de uso antes de desplegarlo en producción.
- La model card no detalla los idiomas soportados, por lo que su rendimiento en español u otros idiomas no está garantizado.
- El repositorio es una copia no oficial del modelo original Qwen3.6-35B-A3B, alojada por un usuario independiente. No hay garantía de que los pesos no hayan sido modificados o corrompidos; se recomienda verificar la integridad comparando con el repositorio oficial de Qwen.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos adicionales que Qwen pueda imponer (aunque no se mencionan en este repo).
- El contexto de 1M tokens es una extensión que puede requerir técnicas de atención eficiente; el rendimiento real a esa longitud no está documentado.
- No se proporcionan datos sobre el dataset de entrenamiento, lo que dificulta evaluar posibles sesgos o limitaciones en dominios específicos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/crazyape777/mir-diane613-affine-5gedzafcvg-jesusss
- Blog oficial de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Repositorio original de Qwen (referencia): https://huggingface.co/Qwen/Qwen3.6-35B-A3B (enlace inferido, no verificado en la información proporcionada)

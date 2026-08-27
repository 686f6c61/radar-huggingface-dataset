# dealignai/GLM-5.3-Flash-ABLITERATED-NVFP4

## Resumen

GLM-5.3-Flash-ABLITERATED-NVFP4 es una versión modificada del modelo GLM-5.3-Flash de Z.ai, publicada por el usuario dealignai bajo su marca "CRACK". Se trata de un abliteration: una edición permanente de los pesos del modelo que elimina el comportamiento de rechazo (refusal) directamente en los tensores, sin recurrir a fine-tuning, jailbreaks de prompt ni adaptadores. El resultado es un modelo que cumple con el 100% de las peticiones en el conjunto HarmBench-320, incluyendo categorías problemáticas como copyright o contenido contextual, manteniendo una pérdida de solo 1,07 puntos porcentuales en MMLU (85,09% frente al 86,16% del base).

El modelo base es un MoE híbrido de 320B parámetros totales y 18B activos por token, con atención lineal KDA combinada con atención sparse estilo DeepSeek, una ventana de contexto de 1M tokens y una torre de visión GLM-4.1V. Esta versión concreta está cuantizada en NVFP4 (4 bits para los expertos enrutados, bf16 para atención, expertos compartidos y embeddings), lo que reduce el peso del checkpoint a unos 195 GB. Además, el cabezal MTP (multi-token prediction) para decodificación especulativa también ha sido "crackeado", de modo que no propone rechazos y la velocidad de generación se mantiene en prompts que el modelo original rechazaría.

La relevancia de este modelo radica en que ofrece una alternativa "sin censura" a nivel de pesos para desarrolladores que necesitan un LLM de gran tamaño con capacidades de razonamiento, visión y tool calling, sin las restricciones de seguridad del modelo original. Su licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5_next`) — MoE híbrido con atención lineal KDA y atención sparse DeepSeek |
| Parametros totales | 320B (según model card); 165.496.249.182 según safetensors |
| Parametros activos | 18B por token |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | NVFP4 (expertos enrutados en 4 bits; atención, expertos compartidos y embeddings en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint NVFP4) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un MoE híbrido que combina atención lineal (KDA) con atención sparse (DeepSeek-sparse), una arquitectura diseñada para manejar contextos de hasta 1M tokens con eficiencia computacional. Tiene 320B parámetros totales, de los cuales solo 18B se activan por token, lo que permite un throughput alto en hardware de servidor. Incluye una torre de visión GLM-4.1V (multimodal) y un cabezal MTP para decodificación especulativa.

La modificación "CRACK" de dealignai es un abliteration: una técnica que identifica y elimina los pesos responsables del comportamiento de rechazo, sin retraining. Según la model card, no se usó fine-tuning, SFT, DPO, LoRA, adaptadores, vectores de dirección ni hooks en tiempo de ejecución. La edición está horneada en los tensores, de modo que el modelo funciona con vLLM estándar sin modificaciones adicionales. El cabezal MTP también fue abliterado para evitar que proponga rechazos durante la decodificación especulativa.

La cuantización NVFP4 es una técnica de compresión de 4 bits específica de NVIDIA (NVFP4-A16), que mantiene la precisión de los pesos en bf16 para las partes críticas (atención, expertos compartidos) y usa 4 bits para los expertos enrutados. Esto reduce el tamaño del checkpoint a aproximadamente 195 GB, frente a los ~640 GB que ocuparía en bf16.

## Capacidades

- Generación de texto y razonamiento complejo: mantiene el rendimiento del modelo base en tareas de conocimiento general, matemáticas y lógica (MMLU 85,09%).
- Razonamiento híbrido: soporta modos "thinking" y "non-thinking" mediante el parser `reasoning-parser glm45`.
- Tool calling / function calling: compatible con el parser `tool-call-parser glm47` y `--enable-auto-tool-choice` en vLLM.
- Capacidades multimodales: la torre de visión GLM-4.1V se conserva byte a byte, permitiendo entrada de imágenes.
- Decodificación especulativa con MTP: el cabezal multi-token prediction está activo y también abliterado, acelerando la generación.
- Sin rechazos: el modelo no se niega a responder a ninguna petición, incluyendo contenido protegido por copyright, contextual o estándar (100% compliance en HarmBench-320).
- Multilingüe limitado: aunque la model card indica solo inglés, el modelo base de Z.ai tiene capacidades multilingües; no se especifica el alcance en esta versión.

## Casos de uso

- Generación de contenido creativo sin restricciones: escritores y guionistas pueden usar el modelo para producir narrativas, diálogos o descripciones que el modelo base rechazaría por políticas de copyright o contenido sensible, manteniendo calidad literaria.
- Asistentes de programación con tool calling: el modelo puede integrarse en entornos de desarrollo (IDE, CI/CD) para generar código, refactorizar o explicar fragmentos, usando las herramientas de llamada a funciones para ejecutar comandos o consultar APIs.
- Análisis de documentos largos: con 1M tokens de contexto, puede procesar libros completos, expedientes legales o informes técnicos extensos, resumiendo o extrayendo información sin perder coherencia.
- Chatbots de atención al cliente sin filtros: empresas que necesitan respuestas directas a reclamaciones o preguntas delicadas (por ejemplo, temas de salud o legales) pueden desplegar el modelo sin que se niegue a responder, aunque deben evaluar riesgos legales.
- Investigación académica sobre alineación y seguridad: el modelo sirve como caso de estudio para analizar el impacto del abliteration en el comportamiento, comparando con el base en tareas de razonamiento y ética.
- Prototipado de agentes autónomos: gracias al soporte de tool calling y razonamiento multi-paso, se puede usar para construir agentes que navegan por APIs, toman decisiones y ejecutan acciones sin interrupciones por rechazos.

## Benchmarks y rendimiento

La model card proporciona resultados de MMLU (logit-mode, 1.026 preguntas) y HarmBench-320 (text behavior set). No se incluyen otros benchmarks como HumanEval o GSM8K.

| Benchmark | Base | CRACK Abliterated | Δ |
|---|---|---|---|
| MMLU (overall) | 86,16% | 85,09% | -1,07 pp |
| HarmBench Standard (compliance) | no disponible | 159/159 (100%) | - |
| HarmBench Contextual (compliance) | no disponible | 81/81 (100%) | - |
| HarmBench Copyright (compliance) | no disponible | 80/80 (100%) | - |
| HarmBench Overall (compliance) | no disponible | 320/320 (100%) | - |

La pérdida de rendimiento en MMLU es mínima (-1,07 puntos), lo que indica que las capacidades de razonamiento y conocimiento se mantienen prácticamente intactas. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint NVFP4 ocupa ~195 GB en disco. Para inferencia, se necesita al menos esa cantidad de VRAM, más overhead de activaciones y KV cache. Con 1M tokens de contexto, la KV cache puede ser considerable.
- GPUs recomendadas: 4x A100 80GB o 4x H100 80GB (tensor-parallel-size 4, como sugiere la model card). También podría caber en 8x RTX 4090 24GB (192 GB totales) si se usa cuantización adicional o se reduce el contexto.
- No cabe en una sola GPU consumer (máximo 24GB en RTX 4090). Se requiere configuración multi-GPU.
- Opciones de despliegue: vLLM (recomendado, con `--moe-backend marlin`), TGI, o cualquier servidor compatible con safetensors y arquitectura GLM-5.3. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos específicos. Con 18B activos y decodificación especulativa MTP, se espera un throughput alto en hardware de servidor, pero depende de la configuración exacta.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Cuantización | MMLU |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | 18B | 1M | MIT | bf16 | 86,16% |
| GLM-5.3-Flash-ABLITERATED-NVFP4 (este) | 320B | 18B | 1M | MIT | NVFP4 | 85,09% |
| GLM-5.2-NVFP4-UNCENSORED (dealignai) | 320B (aprox.) | 18B (aprox.) | 128K (aprox.) | other | NVFP4 | no disponible |

La comparativa con GLM-5.2 se basa en la información de la model card de dealignai para la versión 5.2, que también es un abliteration. No se dispone de datos de rendimiento para esa versión. Frente al base, la diferencia principal es la eliminación de rechazos y la cuantización NVFP4, que reduce el tamaño a costa de una pequeña pérdida de precisión.

## Limitaciones y advertencias

- El abliteration elimina todos los mecanismos de rechazo, lo que significa que el modelo puede generar contenido dañino, ilegal o éticamente problemático sin filtro. Los desarrolladores deben asumir la responsabilidad de su uso y aplicar sus propias capas de seguridad si es necesario.
- La cuantización NVFP4 puede introducir una ligera degradación en tareas de precisión numérica o razonamiento complejo, aunque la pérdida en MMLU es solo de ~1 punto.
- El modelo solo declara soporte para inglés; aunque el base puede tener capacidades multilingües, no están garantizadas en esta versión.
- El tamaño del checkpoint (195 GB) requiere infraestructura de servidor con múltiples GPUs de alta capacidad, lo que limita su uso a entornos profesionales.
- No se han publicado resultados de benchmarks de código (HumanEval, etc.) ni de razonamiento matemático (GSM8K) para esta versión específica, por lo que no se puede evaluar su rendimiento en esas áreas.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que el uso previsto cumple con las leyes locales e internacionales, especialmente en lo relativo a contenido generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Espejo del mismo modelo (UNCENSORED): https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4
- Cuantización NVFP4 de LibertAIDAI: https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-NVFP4
- Documentación de GLM-5.3 en Z.ai: https://docs.z.ai/guides/llm/glm-5.3
- Blog de Z.ai sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Documentación de Unsloth sobre GLM-5.3: https://unsloth.ai/docs/models/glm-5.3

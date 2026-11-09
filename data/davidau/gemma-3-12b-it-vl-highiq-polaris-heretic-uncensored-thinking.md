# DavidAU/gemma-3-12b-it-vl-HighIQ-Polaris-Heretic-Uncensored-Thinking

## Resumen

`gemma-3-12b-it-vl-Heretic-Uncensored-Thinking` es un ajuste fino del modelo Gemma 3 12B Instruct de Google, publicado por el usuario DavidAU en Hugging Face. Parte de la versión "heretic" de DreamFast (un derivado de Gemma 3 12B con el comportamiento de rechazo mitigado mediante técnicas de abliteration) y añade un entrenamiento adicional con el dataset de razonamiento `TeichAI/polaris-alpha-1000x` usando Unsloth. El resultado es un modelo multimodal imagen-texto con capacidad de razonamiento extendido, contexto de 128k tokens y un perfil de rechazos muy reducido (7/100 frente a 98/100 del Gemma 3 original).

El modelo resuelve el problema de los filtros de seguridad restrictivos en tareas creativas (ficción, terror, romance explícito, lenguaje soez) y añade un modo de "pensamiento profundo" que mejora el razonamiento general y el procesamiento de imágenes. Está orientado a generación de texto creativo, escritura de ficción y conversación sin restricciones, con licencia Apache 2.0.

Con 12.187.325.040 parámetros (aproximadamente 12,2B) y pesos en bfloat16, el modelo ocupa 24,4 GB en el repositorio. Es relevante para desarrolladores que necesitan un modelo multimodal de tamaño medio, desplegable en hardware de consumo de gama alta, sin las limitaciones de contenido de los modelos alineados convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), con vision encoder y capacidad de razonamiento extendido |
| Parametros totales | 12.187.325.040 (aprox. 12,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors en bfloat16 es cuantificable a GGUF/AWQ/GPTQ con herramientas estándar |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Pipeline | image-text-to-text |
| Modelo base | DreamFast/gemma-3-12b-it-heretic (a su vez derivado de google/gemma-3-12b-it) |
| Dataset de ajuste | TeichAI/polaris-alpha-1000x |
| Libreria | transformers |
| Tamano del repositorio | 24,4 GB |
| Descargas / likes | 59 / 7 |
| Fecha de creacion | 2026-02-21 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 12B Instruct: un transformer decoder-only con un encoder de visión para entrada imagen-texto, capaz de procesar imágenes y texto de forma conjunta. Sobre esa base, DreamFast aplicó técnicas de "heretic" (abliteration) para reducir el comportamiento de rechazo, y DavidAU realizó un ajuste fino adicional con el dataset de razonamiento Polaris Alpha (1000 ejemplos) mediante Unsloth sobre hardware local con Linux.

El entrenamiento añade un modo de razonamiento ("thinking") que el autor describe como compacto pero muy detallado, y que afecta a la operación general del modelo, la generación de salida, el procesamiento de imágenes y los benchmarks. El autor reporta una divergencia KL de 0,0826 respecto al Gemma 3 original (considerada excelente, por debajo de 1) y una reducción de rechazos de 98/100 a 7/100. El modelo incluye plantillas Jinja opcionales (`chat-template-thinking.jinja`) para forzar el modo de pensamiento, aunque este se activa automáticamente en la mayoría de casos gracias al ajuste fino. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición completa del dataset más allá del nombre del mismo.

## Capacidades

- Generación de texto y razonamiento extendido con modo "thinking" (pensamiento entre etiquetas `<think>` y `</think>`).
- Procesamiento de imágenes (image-text-to-text): el razonamiento también mejora el análisis de imágenes.
- Escritura creativa y de ficción: historias, tramas, subtramas, continuación de escenas, todos los géneros (ciencia ficción, romance, terror).
- Generación de contenido sin censura: el modelo no rechaza peticiones de contenido explícito, soez o violento, aunque en algunos casos necesita instrucciones adicionales para alcanzar el nivel gráfico deseado.
- Conversación multi-turno y roleplay.
- Estabilidad de temperatura en el razonamiento, con rango de temperatura de 0,1 a 2,5.
- Activación opcional del razonamiento mediante el prefijo "think deeply:" o mediante system prompt.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el modo thinking facilita el razonamiento en varios pasos.
- Capacidades multilingües: solo inglés según la model card.

## Casos de uso

- **Escritura de ficción y narrativa**: el modelo está ajustado específicamente para generar tramas, subtramas, escenas y continuaciones en todos los géneros. Su contexto de 128k permite mantener coherencia en novelas o sagas largas sin perder hilos argumentales.
- **Roleplay y conversación sin restricciones**: para aplicaciones de entretenimiento conversacional donde se requiere lenguaje soez, violencia o contenido adulto, el modelo no rechaza peticiones (7/100 rechazos) y admite temperaturas altas (hasta 2,5) para respuestas más creativas.
- **Generación de contenido creativo para videojuegos**: diálogos de personajes, descripciones de escenarios y tramas ramificadas, aprovechando el modo thinking para mantener coherencia en árboles narrativos complejos.
- **Análisis de imágenes con razonamiento**: al ser multimodal, puede describir, analizar o generar narrativa a partir de imágenes, con el razonamiento mejorando la calidad del procesamiento visual.
- **Prototipado de asistentes sin filtros**: para investigación sobre comportamiento de modelos sin alineación de seguridad, útil en estudios de sesgos, seguridad y dinámicas de rechazo.
- **Generación de guiones y diálogos**: el ajuste en escritura vívida ("vivid prosing") lo hace adecuado para guiones, monólogos y diálogos con tono marcado, incluyendo personajes con lenguaje explícito.
- **Continuación de escenas y "scene continue"**: para herramientas de escritura asistida donde el usuario necesita que el modelo continúe un texto existente manteniendo estilo y tono.

## Benchmarks y rendimiento

El autor publica resultados en la model card comparando tres versiones: High IQ (este modelo), Regular Polaris y el base Heretic sin ajuste de razonamiento.

| Benchmark | High IQ (este modelo) | Regular Polaris | Heretic base |
|---|---|---|---|
| arc_challenge | 0,632 | 0,619 | 0,534 |
| arc_easy | 0,809 | 0,791 | 0,699 |
| boolq | 0,862 | 0,859 | 0,872 |
| hellaswag | 0,722 | 0,705 | 0,603 |
| openbookqa | 0,492 | 0,482 | 0,448 |
| piqa | 0,785 | 0,765 | 0,733 |
| winogrande | 0,722 | 0,714 | 0,658 |

Métricas de des-censura (Heretic):

| Métrica | Este modelo | google/gemma-3-12b-it |
|---|---|---|
| Divergencia KL | 0,0826 | 0 (por definición) |
| Rechazos | 7/100 | 98/100 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- **VRAM estimada en bfloat16**: aproximadamente 24,4 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 32 GB de VRAM para inferencia cómoda con contexto largo.
- **GPU recomendadas**: A100 40GB/80GB, H100, RTX 6000 Ada (48GB). Para contexto de 128k completo se necesita memoria adicional para la KV cache.
- **Consumer GPU**: cabe en RTX 4090 (24GB) solo con cuantización (por ejemplo, 8-bit o 4-bit GGUF/AWQ), no en bfloat16 completo. En GPUs de 16GB o menos requiere cuantizaciones agresivas (4-bit) y contexto reducido.
- **Opciones de despliegue**: transformers (librería nativa), text-generation-inference (el modelo tiene tag `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama mediante conversión a GGUF, vLLM (previa conversión y verificación de soporte multimodal).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Este modelo (Gemma 3 12B Heretic Polaris) | 12,2B | 128k | Apache 2.0 | Sí | Sin censura, modo thinking, solo inglés |
| google/gemma-3-12b-it | 12B | 128k | Gemma license | Sí | Alineado, 98/100 rechazos, multilingüe |
| DreamFast/gemma-3-12b-it-heretic | 12B | 128k | Apache 2.0 | Sí | Base sin censura, sin ajuste de razonamiento |
| Modelos 12-13B alineados (p. ej. Mistral NeMo 12B) | ~12B | 128k | Apache 2.0 | No | Alineado, multilingüe, sin modo thinking explícito |

La comparativa directa con modelos de la misma categoría (12B multimodal sin censura con razonamiento) es limitada; el autor no proporciona comparaciones con alternativas externas en la información disponible.

## Limitaciones y advertencias

- **Contenido sin filtrar**: el modelo está diseñado para no rechazar peticiones de contenido explícito, violento o soez. No es adecuado para aplicaciones dirigidas a menores ni para entornos donde se requiera moderación automática.
- **Solo inglés**: la model card declara únicamente `en` como idioma soportado; el rendimiento en castellano u otros idiomas no está garantizado.
- **Riesgo de alucinación**: como todo modelo generativo, puede inventar datos; el modo thinking no elimina este riesgo.
- **Necesita direccionamiento en algunos casos**: el autor advierte que, aunque no rechaza, el modelo puede generar contenido "blando" por defecto y requiere instrucciones explícitas (por ejemplo, incluir las palabras malsonantes deseadas) para alcanzar el nivel gráfico esperado.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base Gemma 3 tiene su propia licencia de Google; conviene verificar la compatibilidad de la cadena de licencias para producción.
- **Sesgos**: no se documentan evaluaciones de sesgo en la información disponible; al ser un modelo sin alineación de seguridad, es probable que reproduzca sesgos de los datos de entrenamiento sin mitigación.
- **Soporte de tool calling no documentado**: no hay evidencia en la model card de soporte fiable de function calling, lo que limita su uso en pipelines de agentes.
- **Comunidad pequeña**: 59 descargas y 7 likes en el momento de la consulta; menor validación externa que los modelos oficiales.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/gemma-3-12b-it-vl-HighIQ-Polaris-Heretic-Uncensored-Thinking
- Modelo base: https://huggingface.co/DreamFast/gemma-3-12b-it-heretic
- Modelo original: https://huggingface.co/google/gemma-3-12b-it
- Dataset de ajuste: https://huggingface.co/datasets/TeichAI/polaris-alpha-1000x
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Unsloth: https://github.com/unslothai/unsloth
- Heretic (software de abliteration): no disponible enlace directo en la información proporcionada

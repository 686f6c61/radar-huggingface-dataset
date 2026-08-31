# NostraEmpire/mirror-qwen2.5-14b-instruct

## Resumen

El modelo `NostraEmpire/mirror-qwen2.5-14b-instruct` es un espejo (mirror) del modelo oficial `Qwen/Qwen2.5-14B-Instruct`, desarrollado por el equipo Qwen de Alibaba Cloud. Se trata de un modelo de lenguaje causal de 14.700 millones de parámetros, ajustado mediante instrucciones (instruction-tuned), diseñado para tareas de generación de texto, conversación, codificación y matemáticas. Su relevancia radica en ofrecer un equilibrio entre calidad de salida y requisitos de hardware moderados, siendo una opción intermedia entre los modelos de 7B y los de 32B o 72B de la misma familia.

El modelo se basa en la arquitectura transformer con atención por consultas agrupadas (GQA), normalización RMSNorm, activación SwiGLU y sesgos en las proyecciones QKV. Soporta una longitud de contexto de hasta 131.072 tokens (128K) y puede generar hasta 8.192 tokens por respuesta. Aunque el mirror etiqueta únicamente el idioma inglés, el modelo original está entrenado para más de 29 idiomas, incluido el español. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Este mirror está alojado en Hugging Face con el identificador `NostraEmpire/mirror-qwen2.5-14b-instruct`, con pesos en formato safetensors y un tamaño de repositorio de 29,5 GB. No se han publicado métricas de rendimiento específicas para este mirror, pero se remite a los resultados oficiales del modelo Qwen2.5-14B-Instruct disponibles en el blog del equipo Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y atención QKV con sesgo |
| Parametros totales | 14.770.033.664 (14,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128K) con generación de hasta 8.192 tokens |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors; no se especifican cuantizaciones) |
| Idiomas soportados | Inglés (etiqueta del mirror); el modelo original soporta 29 idiomas, incluido español |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer estándar de la serie Qwen2.5, con 48 capas, 40 cabezas de atención para consultas (Q) y 8 cabezas para claves/valores (KV) en configuración GQA. Utiliza incrustaciones rotativas (RoPE) para codificación posicional, normalización RMSNorm y activación SwiGLU en las capas feed-forward. El entrenamiento se divide en dos fases: preentrenamiento y post-entrenamiento (ajuste por instrucciones). No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, pero el modelo original destaca mejoras significativas en codificación, matemáticas, seguimiento de instrucciones y generación de texto largo.

Para manejar contextos superiores a 32.768 tokens, se emplea la técnica YaRN (Yet another RoPE extensioN), que permite extrapolar la longitud efectiva hasta 128K tokens. Esta configuración debe activarse manualmente en `config.json` mediante el parámetro `rope_scaling` con factor 4.0. El modelo está optimizado para su uso con la librería `transformers` de Hugging Face (versión >= 4.37.0) y se recomienda el despliegue con vLLM para entornos de producción.

## Capacidades

- Generación de texto conversacional y de larga extensión (hasta 8K tokens por respuesta).
- Seguimiento de instrucciones complejas, incluyendo system prompts diversos y role-play.
- Generación de salidas estructuradas, especialmente JSON, y comprensión de datos tabulares.
- Razonamiento matemático y codificación en múltiples lenguajes de programación.
- Comprensión de contexto largo (hasta 128K tokens) mediante YaRN.
- Soporte multilingüe en el modelo original (29 idiomas), aunque el mirror etiqueta solo inglés.
- No se menciona explícitamente soporte de tool calling o function calling en la información proporcionada, aunque el modelo Qwen2.5 original sí lo incluye; no se confirma en este mirror.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto amplio (hasta 128K tokens), lo que permite mantener el historial completo de una interacción larga sin pérdida de información relevante.
- Generación de código en entornos de desarrollo: gracias a su entrenamiento especializado en codificación, puede asistir en la escritura, revisión y depuración de código en lenguajes como Python, Java o JavaScript, integrándose en pipelines de CI/CD como generador de documentación o sugerencias.
- Análisis y resumen de documentos extensos: su ventana de contexto de 128K tokens permite procesar informes, artículos o contratos completos y generar resúmenes estructurados o extraer datos clave.
- Creación de contenido editorial: el modelo produce texto coherente y de calidad para blogs, artículos técnicos o guiones, con capacidad de seguir instrucciones de estilo y tono.
- Asistentes virtuales y chatbots especializados: puede configurarse con system prompts para adoptar roles concretos (soporte técnico, tutor educativo, etc.) y mantener conversaciones fluidas.
- Generación de datos sintéticos: su capacidad para producir JSON y estructuras de datos lo hace útil para generar datasets de entrenamiento o pruebas automatizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este mirror. El modelo original Qwen2.5-14B-Instruct reporta métricas detalladas en el blog oficial del equipo Qwen (https://qwenlm.github.io/blog/qwen2.5/), pero no se incluyen en la documentación del mirror. Por tanto, no se presentan tablas comparativas con valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 28-30 GB (para 14,7B parámetros).
- Con cuantización de 4 bits (GGUF Q4_K_M), la VRAM necesaria se reduce a unos 8-10 GB, lo que permite ejecución en GPUs de consumo como RTX 3090 o RTX 4090.
- GPUs recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) para FP16; GPUs con 8-12 GB pueden usar cuantización.
- Opciones de despliegue: vLLM (recomendado para producción), llama.cpp, Ollama, Hugging Face TGI, y transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles en la información proporcionada; se remite a las pruebas de velocidad oficiales en la documentación de Qwen (https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-14B-Instruct (este mirror) | 14,7B | 128K | Apache 2.0 | Modelo denso, multilingüe, fuerte en código y matemáticas |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 (uso comercial permitido) | Menor tamaño, rendimiento inferior en tareas complejas |
| Mistral 7B Instruct v0.3 | 7B | 32K | Apache 2.0 | Más ligero, contexto menor, sin soporte multilingüe amplio |

No se dispone de comparativas de rendimiento numéricas en la información proporcionada. La elección entre estos modelos dependerá del presupuesto de hardware y de la necesidad de contexto largo o capacidades multilingües.

## Limitaciones y advertencias

- El mirror no añade ninguna modificación sobre el modelo original; cualquier limitación del Qwen2.5-14B-Instruct se aplica aquí.
- Riesgo de alucinación en tareas factuales, especialmente con contextos muy largos o preguntas ambiguas.
- El modelo original está entrenado principalmente en inglés y chino; aunque soporta 29 idiomas, el rendimiento en idiomas minoritarios puede ser inferior.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original para posibles restricciones adicionales.
- Para contextos superiores a 32K tokens, es necesario activar YaRN manualmente; su uso puede degradar el rendimiento en textos cortos si se configura de forma estática.
- No se garantiza la disponibilidad a largo plazo del mirror; se recomienda usar el repositorio oficial `Qwen/Qwen2.5-14B-Instruct` para entornos de producción.

## Enlaces

- Repositorio del mirror: https://huggingface.co/NostraEmpire/mirror-qwen2.5-14b-instruct
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Modelo base (no instruct): https://huggingface.co/Qwen/Qwen2.5-14B
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Documentación de benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper técnico de Qwen2: https://arxiv.org/abs/2407.10671
- Paper de YaRN: https://arxiv.org/abs/2309.00071

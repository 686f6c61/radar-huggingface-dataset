# AlexanderKyng/Qwen3.8-27B-48Gb

## Resumen

El modelo `AlexanderKyng/Qwen3.8-27B-48Gb` es una cuantización personalizada en formato GGUF del modelo base `Qwen/Qwen3.8-27B`, desarrollada por AlexanderKyng con el objetivo de permitir su ejecución local en configuraciones de doble GPU con 48 GB de VRAM, como dos NVIDIA RTX 3090. El trabajo se centra en preservar la capacidad del modelo original —incluyendo su ventana de contexto completa de 262 000 tokens y el mecanismo de Multi-Token Prediction (MTP)— mediante un esquema de cuantización selectiva que combina precisiones Q8_0 y Q5_0, calibrado con un iMatrix personalizado.

Qwen3.8-27B es un modelo denso de 27 000 millones de parámetros, de tipo vision-language, liberado por el equipo Qwen bajo licencia Apache 2.0 en agosto de 2026. Está diseñado para tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte, con razonamiento configurable y contexto nativo de 262K tokens. Esta versión cuantizada mantiene la arquitectura híbrida del original (atención combinada con componentes SSM) y añade soporte para decodificación especulativa mediante MTP, lo que la hace especialmente relevante para despliegues locales con hardware de consumo.

La relevancia de esta ficha radica en que ofrece una alternativa práctica para ejecutar un modelo de 27B con contexto extremo en GPUs de 24 GB, algo que normalmente requeriría hardware profesional. El autor documenta el proceso de cuantización, los resultados de perplexidad y proporciona comandos de despliegue específicos, lo que facilita su reproducción y uso en entornos de investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención y componentes SSM (híbrido, según tensores observados) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | Q8_0 y Q5_0 (mezcla selectiva por capas) |
| Idiomas soportados | Inglés y francés (según calibración del iMatrix); otros no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa con componentes de state space model (SSM) integrados en cada bloque, como indican los tensores `ssm_alpha`, `ssm_beta` y `ssm_out` presentes en la cuantización. Esta combinación de atención y SSM permite manejar secuencias muy largas con eficiencia computacional. El modelo original fue entrenado por el equipo Qwen con un enfoque multimodal (imagen y texto) y soporta razonamiento configurable, aunque los detalles exactos del dataset de entrenamiento (número de tokens, composición, fases de RLHF/DPO) no están disponibles en la información proporcionada.

La versión cuantizada no es un reentrenamiento, sino una requantización del modelo base. El autor aplicó un esquema de precisión selectiva: las capas críticas (embeddings, salida, bloque 64 completo, y las proyecciones de atención de los bloques 0-63) se mantienen en Q8_0, mientras que las puertas de atención, los parámetros SSM y las capas feed-forward de los bloques 0-63 se cuantizan a Q5_0. Este mapeo preserva los flujos de activación responsables del MTP y de la atención, a la vez que reduce el tamaño del archivo. La calibración se realizó con un iMatrix construido a partir de los subconjuntos `code_small`, `tools_small`, `text_en_small` y `text_fr_small` del dataset `eaddario/imatrix-calibration`, mezclados y barajados para cubrir tareas de codificación, instrucciones y textos bilingües (inglés/francés).

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo modo de pensamiento (thinking) configurable.
- Comprensión de imágenes (pipeline `image-text-to-text`), con soporte para entrada visual junto a texto.
- Codificación de software, incluyendo generación, revisión y depuración de código.
- Razonamiento multi-paso y soporte para tareas agénticas de largo horizonte.
- Multi-Token Prediction (MTP) integrado, que permite decodificación especulativa para acelerar la inferencia.
- Capacidades multilingües, con calibración específica para inglés y francés.
- Tool calling y function calling, según las capacidades del modelo base (indicado en los tags del repositorio).
- Ventana de contexto nativa de 262K tokens, utilizable en su totalidad con KV cache en F16 en hardware de doble GPU.

## Casos de uso

- Despliegue local de un asistente de codificación con contexto largo: gracias a los 262K tokens de ventana, el modelo puede analizar repositorios completos o archivos de gran tamaño, manteniendo el estado de la conversación durante sesiones prolongadas de programación.
- Atención al cliente automatizada bilingüe (inglés/francés): el modelo gestiona conversaciones multi-turno con memoria extensa, y su calibración específica para estos idiomas mejora la coherencia en respuestas de soporte técnico.
- Análisis de documentos extensos con entrada visual: al aceptar imágenes y texto, puede procesar capturas de pantalla, diagramas o documentos escaneados junto con preguntas contextuales, útil en entornos de investigación o revisión legal.
- Agentes autónomos con razonamiento multi-paso: el soporte para tool calling y el modo de pensamiento permiten construir agentes que planifican, ejecutan herramientas y verifican resultados en tareas como automatización de informes o integración con APIs.
- Servidor de inferencia local para equipos de desarrollo: con el comando `llama-server` documentado, se puede montar un endpoint compatible con OpenAI en hardware de doble RTX 3090, sirviendo a múltiples aplicaciones internas sin depender de servicios en la nube.
- Investigación en eficiencia de cuantización: el esquema de precisión selectiva y el iMatrix personalizado sirven como caso de estudio para optimizar modelos grandes en GPUs de consumo, con métricas de perplexidad publicadas.

## Benchmarks y rendimiento

El autor proporciona únicamente la métrica de perplexidad sobre Wiki-text-raw para evaluar la pérdida de precisión de la cuantización mixta:

| Modelo | Precision | Wiki-text-raw (PPL) | Delta vs BF16 |
| :--- | :--- | :--- | :--- |
| **Qwen3.8-27B-48Gb** | Q8_0 + Q5_0 | 5.8285 | +0.0204 |
| Base (Qwen3.8-27B) | BF16 | 5.8081 | - |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo base Qwen3.8-27B sí cuenta con benchmarks publicados por el equipo Qwen, pero los valores concretos no se han incluido en esta ficha.

## Requisitos de hardware

- VRAM estimada: 48 GB en total (dos GPUs de 24 GB). El comando recomendado carga aproximadamente 13 GB de KV cache en F16 para contexto completo de 262K tokens.
- GPU recomendadas: 2x NVIDIA RTX 3090 24GB con NVLink (probado por el autor). También compatible con AMD Ryzen AI y Radeon según soporte Day 0 en LM Studio y Lemonade.
- En consumer GPU: sí, siempre que se disponga de dos GPUs con 24 GB cada una. No cabe en una sola GPU de 24 GB con contexto completo.
- Opciones de despliegue: llama.cpp (`llama-server`), vLLM, SGLang, LM Studio, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han proporcionado mediciones específicas. El uso de MTP con `--spec-type draft-mtp` y `-sps 0.70` (probabilidad de aceptación del draft) está diseñado para maximizar la velocidad de generación, pero no hay cifras concretas.

## Comparativa con modelos similares

La comparativa se limita al modelo base y a otras cuantizaciones estándar del mismo modelo, ya que no se dispone de datos de modelos comparables de 27B en esta información.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | safetensors | Modelo original en BF16, requiere ~54 GB VRAM para inferencia completa |
| AlexanderKyng/Qwen3.8-27B-48Gb | 27B | 262K | Apache 2.0 | GGUF | Cuantización mixta Q8_0/Q5_0, optimizada para dual RTX 3090 |
| Otras cuantizaciones GGUF (p.ej. Q4_K_M) | 27B | 262K | Apache 2.0 | GGUF | No documentadas en esta fuente; pérdida de precisión mayor y posible pérdida del MTP |

## Limitaciones y advertencias

- La cuantización mixta introduce una pérdida de precisión mínima (perplexidad +0.0204), pero puede afectar a tareas muy sensibles a pequeños cambios numéricos, como matemáticas de alta precisión o razonamiento lógico extremo.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje; esta versión cuantizada no los corrige.
- El soporte de idiomas está calibrado principalmente para inglés y francés; otros idiomas pueden mostrar un rendimiento inferior.
- El despliegue con contexto completo (262K tokens) requiere 48 GB de VRAM y puede provocar errores de memoria (OOM) si se reduce el hardware. Se recomienda ajustar `--ctx-size` o usar KV cache en q8_0 en caso de limitaciones.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos del modelo base original para confirmar cualquier restricción adicional.
- El modelo es una cuantización no oficial creada por un tercero; no está respaldada por el equipo Qwen y puede no incluir todas las actualizaciones o correcciones del modelo base.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/AlexanderKyng/Qwen3.8-27B-48Gb
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de calibración iMatrix: https://huggingface.co/datasets/eaddario/imatrix-calibration
- Proxy para alternar modo thinking/no-thinking (GitHub): https://github.com/AlexanderKyng/Qwen3.6-reasoning-toggle-proxy
- Artículo de Yottalabs sobre Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Seguimiento de lanzamiento en AI Release Tracker: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página de Qwen3.8 en OpenLM: https://openlm.ai/qwen3.8/

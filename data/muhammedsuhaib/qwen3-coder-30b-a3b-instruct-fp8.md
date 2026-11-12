# MuhammedSuhaib/Qwen3-Coder-30B-A3B-Instruct-FP8

## Resumen

Qwen3-Coder-30B-A3B-Instruct-FP8 es una versión cuantizada en FP8 del modelo Qwen3-Coder-30B-A3B-Instruct desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo de lenguaje causal de tipo Mixture of Experts (MoE) con 30.500 millones de parámetros totales y 3.300 millones activos por token, diseñado específicamente para tareas de codificación agéntica, uso de herramientas y comprensión de repositorios a gran escala. Esta variante FP8 ha sido publicada por el usuario MuhammedSuhaib en Hugging Face como una conversión del checkpoint oficial.

El modelo destaca por su ventana de contexto nativa de 262.144 tokens (256K), extensible hasta 1M mediante Yarn, y por un formato de function calling especialmente optimizado para plataformas de codificación agéntica como Qwen Code y CLINE. Su arquitectura MoE con 128 expertos (8 activados) permite un equilibrio entre capacidad y eficiencia computacional, ya que solo se activa aproximadamente el 10,8% de los parámetros durante la inferencia.

Esta ficha describe la variante FP8 publicada bajo licencia Apache 2.0, orientada a desarrolladores que necesitan desplegar un modelo de codificación de alto rendimiento con requisitos de memoria reducidos respecto al checkpoint original en bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal MoE (qwen3_moe) |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3.300 millones (3,3B) |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1M con Yarn |
| Tipos de cuantizacion | FP8 fine-grained con block size de 128 (checkpoint publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

Otros datos técnicos: 48 capas, 32 cabezas de atención para Q y 4 para KV (GQA), 128 expertos con 8 activados por token. Tamaño del repositorio: 31,2 GB.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal con mezcla de expertos (MoE). Cada capa contiene 128 expertos de los cuales se activan 8 por token, lo que resulta en 3,3B parámetros activos sobre un total de 30,5B. La atención utiliza Grouped Query Attention (GQA) con 32 cabezas para queries y 4 para claves/valores, lo que reduce el coste de memoria del KV cache en contextos largos. El modelo consta de 48 capas.

El entrenamiento incluye fases de preentrenamiento y postentrenamiento según la model card. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo es una variante "Instruct" que, según la documentación, solo soporta modo no-thinking: no genera bloques `<think></think>` en su salida, por lo que no es necesario especificar `enable_thinking=False`. La cuantización FP8 aplicada es de tipo fine-grained con block size de 128, y los detalles completos se encuentran en el campo `quantization_config` del `config.json`.

## Capacidades

- Generación de código en múltiples lenguajes de programación, con especial énfasis en tareas de codificación agéntica.
- Codificación agéntica (agentic coding): soporte para plataformas como Qwen Code y CLINE con un formato de function calling específicamente diseñado.
- Uso de navegador agéntico (agentic browser-use) y otras tareas fundacionales de codificación.
- Tool calling / function calling: permite definir herramientas con esquemas JSON y el modelo las invoca mediante una API compatible con OpenAI.
- Comprensión de repositorios a escala gracias a su contexto nativo de 256K tokens, extensible a 1M con Yarn.
- Razonamiento multi-paso en flujos agénticos.
- Generación de texto general y conversación multi-turno (pipeline text-generation, tag conversational).
- Modo no-thinking únicamente: no genera bloques de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de codificación en IDE: integrado mediante API compatible con OpenAI, el modelo puede autocompletar, refactorizar y explicar código dentro de editores o extensiones, aprovechando su contexto de 256K para mantener el estado de un proyecto mediano.
- Agentes autónomos de resolución de issues: con soporte de function calling y contexto largo, puede leer un repositorio, localizar el fallo y proponer un parche, integrándose en pipelines de CI/CD para tareas de mantenimiento automatizado.
- Automatización de navegación web (browser-use): el modelo puede controlar herramientas de navegador para extraer información, rellenar formularios o validar flujos de UI en pruebas end-to-end.
- Revisión de código a escala de repositorio: gracias a los 262.144 tokens de contexto nativo, puede analizar diffs extensos o múltiples ficheros simultáneamente y generar informes de revisión coherentes.
- Generación de tests unitarios: a partir de una función o módulo, el modelo produce baterías de pruebas con cobertura de casos límite, invocable desde herramientas de CLI o servidores de inferencia como vLLM o SGLang.
- Documentación técnica automatizada: puede generar docstrings, READMEs y guías de API a partir del código fuente, manteniendo consistencia entre ficheros gracias al contexto largo.
- Migración de código entre lenguajes o frameworks: traducción de bases de código pequeñas o medianas preservando la semántica, con verificación iterativa mediante tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 31,2 GB en FP8, por lo que la inferencia requiere al menos ~32 GB de VRAM para cargar los pesos, más memoria adicional para el KV cache.
- El KV cache es contenido gracias a GQA (4 cabezas KV), pero un contexto de 256K sigue exigiendo memoria considerable; se recomienda reducir la longitud de contexto (por ejemplo a 32.768 tokens) si aparecen errores de OOM, tal como indica la model card.
- GPU recomendadas: H100 (80 GB), A100 (80 GB) o múltiples GPU de 24-48 GB en configuración tensor-parallel. Una RTX 4090 (24 GB) no puede alojar el modelo completo en FP8 sin offloading o paralelismo multi-GPU.
- Opciones de despliegue: transformers (requiere versión >= 4.51.0 para evitar el error `KeyError: 'qwen3_moe'`), vLLM, SGLang. El modelo es compatible con endpoints estilo OpenAI.
- Advertencia para transformers: en inferencia distribuida con FP8 fine-grained puede ser necesario definir `CUDA_LAUNCH_BLOCKING=1` si se usan múltiples dispositivos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct-FP8 (este) | 30,5B / 3,3B | 262.144 (1M con Yarn) | Apache 2.0 | safetensors FP8 |
| Qwen3-Coder-30B-A3B-Instruct (original bfloat16) | 30,5B / 3,3B | 262.144 (1M con Yarn) | Apache 2.0 | safetensors bf16 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) en la información proporcionada para establecer una comparación cuantitativa con otros modelos de codificación.

## Limitaciones y advertencias

- El modelo solo soporta modo no-thinking; no genera bloques de razonamiento explícito, lo que puede limitar tareas que se beneficien de cadena de pensamiento visible.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en generación de código con APIs inexistentes o librerías desactualizadas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no especificados; el rendimiento multilingüe fuera del inglés y lenguajes de programación no está documentado.
- La cuantización FP8 puede introducir degradación sutil respecto al checkpoint bfloat16 original; no se han publicado métricas de dicha degradación en la información disponible.
- Problema conocido en transformers con FP8 fine-grained en inferencia distribuida; puede requerir `CUDA_LAUNCH_BLOCKING=1`.
- El contexto de 256K exige memoria significativa; sin ajuste puede provocar OOM en GPUs de gama alta individuales.
- El repositorio es una conversión de terceros (MuhammedSuhaib) del modelo oficial de Qwen; conviene verificar la integridad respecto al checkpoint original antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el enlace de licencia referenciado en la model card.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/MuhammedSuhaib/Qwen3-Coder-30B-A3B-Instruct-FP8
- Modelo original de referencia: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8
- Licencia: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8/blob/main/LICENSE
- Blog de Qwen3-Coder: https://qwenlm.github.io/blog/qwen3-coder/
- GitHub Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Documentación Qwen: https://qwen.readthedocs.io/en/latest/
- Qwen Chat: https://chat.qwen.ai/
- Paper (Qwen3 Technical Report): https://arxiv.org/abs/2505.09388

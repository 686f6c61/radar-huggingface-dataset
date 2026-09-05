# mradermacher/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-GGUF

## Resumen

KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-GGUF es una cuantización GGUF del modelo KAT-Coder-V2.5-Dev, un modelo de codificación agéntico desarrollado por Kwaipilot (equipo de IA de Kuaishou). El modelo original es una Mixture-of-Experts (MoE) de 35.500 millones de parámetros totales, de los cuales solo 3.000 millones se activan por token, lo que permite un rendimiento eficiente en tareas de ingeniería de software autónoma. Está construido sobre una base Qwen3.5/3.6 MoE y ha sido post-entrenado para trabajar en repositorios ejecutables, con soporte para razonamiento multi-paso y generación de código.

Esta versión concreta, publicada por mradermacher, es una cuantización estática en formato GGUF del modelo abliterated por jakeroxs. La técnica de abliteration elimina comportamientos de rechazo del modelo, lo que da lugar a un modelo "uncensored" con una alineación reducida. Además, el modelo incluye MTP (Multi-Token Prediction) y soporte para decodificación especulativa, lo que puede acelerar la inferencia. La licencia es Apache-2.0 y los idiomas soportados son inglés y chino. Es relevante para desarrolladores que buscan ejecutar un modelo de codificación potente en local o en entornos de producción con herramientas como llama.cpp, Ollama, vLLM o SGLang.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) basada en Qwen3.5/3.6 |
| Parametros totales | 35.505.251.456 (35.5B) |
| Parametros activos | 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_S (20.5 GB) confirmado; otros quants listados en la model card no disponibles |
| Idiomas soportados | inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de Mixture-of-Experts (MoE) con 35.500 millones de parámetros totales y 3.000 millones de parámetros activos por token. Esta configuración permite obtener un rendimiento comparable al de modelos densos mucho más grandes, manteniendo un coste computacional reducido. La base del modelo es una familia Qwen3.5/3.6 MoE, y el modelo ha sido post-entrenado por Kwaipilot para tareas de codificación agéntica en repositorios ejecutables. El modelo original es text-only, sin componentes multimodales, y es compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers.

La versión abliterated ha sido sometida a una técnica de abliteration que elimina los comportamientos de rechazo del modelo, lo que resulta en un modelo "uncensored". Además, incorpora MTP (Multi-Token Prediction) y soporte para decodificación especulativa, una técnica que permite predecir varios tokens a la vez y validarlos en paralelo, reduciendo la latencia de generación. No se dispone de información detallada sobre la composición del dataset de entrenamiento ni sobre el número de tokens utilizados.

## Capacidades

- Generación de código y razonamiento para tareas de ingeniería de software autónoma, incluyendo la resolución de issues y la generación de parches en repositorios ejecutables.
- Soporte de agentes y razonamiento multi-paso para tareas complejas de programación.
- Tool calling / function calling: no se confirma explícitamente en la información disponible, pero su diseño agéntico sugiere compatibilidad con herramientas externas.
- Capacidades multilingües en inglés y chino.
- Conversacional, con capacidad para mantener diálogos técnicos.
- MTP y decodificación especulativa para acelerar la inferencia.
- Modelo text-only, sin capacidades de visión o audio.

## Casos de uso

- Asistente de programación local: gracias a la cuantización GGUF Q4_K_S de 20.5 GB, el modelo puede ejecutarse en una GPU de consumo como la RTX 4090 de 24 GB, permitiendo un asistente de código privado y sin conexión.
- Ingeniería de software autónoma: el modelo puede integrarse en agentes que operan sobre repositorios ejecutables, resolviendo issues, escribiendo tests y generando parches automáticamente.
- Revisión y refactorización de código: puede analizar fragmentos de código, detectar errores y proponer mejoras en proyectos medianos o grandes.
- Generación de código en pipelines CI/CD: al ser compatible con vLLM y SGLang, puede desplegarse como servicio de inferencia para alimentar pipelines de integración continua que generan código o documentación automáticamente.
- Agentes de chat técnico en empresas con equipos bilingües: su soporte de inglés y chino lo hace adecuado para entornos de desarrollo internacionales.
- Investigación en modelos MoE y abliteration: el modelo sirve como caso de estudio para analizar el impacto de la eliminación de rechazos en modelos de codificación y el rendimiento de la decodificación especulativa.

## Benchmarks y rendimiento

Según la información disponible, el modelo original KAT-Coder-V2.5-Dev alcanza una puntuación de 69.40% en SWE-bench Verified. No se han publicado más resultados de benchmarks en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 69.40% |

## Requisitos de hardware

- VRAM estimada para inferencia: para la cuantización Q4_K_S de 20.5 GB se recomiendan al menos 24 GB de VRAM con un contexto moderado. Con contextos largos, la VRAM necesaria aumenta.
- GPU recomendadas: RTX 4090 (24 GB), A100 40GB, A100 80GB o H100 80GB.
- En GPU de consumo: la RTX 4090 puede ejecutar el modelo en Q4_K_S; tarjetas con 16 GB de VRAM no serían suficientes.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, SGLang y KTransformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos comparativos con otros modelos en la información disponible. No es posible realizar una comparación rigurosa sin cifras de benchmarks de modelos equivalentes.

## Limitaciones y advertencias

- La técnica de abliteration reduce la alineación del modelo, lo que aumenta el riesgo de generar contenido dañino o no deseado.
- Solo soporta inglés y chino; su rendimiento en otros idiomas no está garantizado.
- Es un modelo text-only, sin capacidades multimodales.
- Existe riesgo de alucinación en tareas de código complejas, especialmente cuando el contexto es limitado o ambiguo.
- La longitud de contexto no se ha especificado; el rendimiento en ventanas largas no está validado en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se deben revisar las condiciones de la licencia y las atribuciones requeridas.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-GGUF
- Modelo base abliterated: https://huggingface.co/jakeroxs/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED
- Repositorio original de Kwaipilot: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Artículo en HackerNoon: https://hackernoon.com/kat-coder-v25-dev-an-open-agentic-coding-model
- Guía de instalación local: https://dev.to/ai_made_tools/kat-coder-v25-local-setup-guide-gguf-vllm-sglang-2fdi

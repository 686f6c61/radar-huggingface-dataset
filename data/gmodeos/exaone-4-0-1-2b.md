# GMODEOS/EXAONE-4.0-1.2B

## Resumen

EXAONE 4.0 es la cuarta generación de la familia de modelos de lenguaje de LG AI Research, que integra un modo de no razonamiento y un modo de razonamiento para combinar la usabilidad de EXAONE 3.5 con las capacidades avanzadas de EXAONE Deep. La versión 1.2B es el modelo pequeño de la serie, diseñado específicamente para aplicaciones on-device, con un tamaño de 1.279.391.488 parámetros y una ventana de contexto de 65.536 tokens. Entre sus novedades destaca el soporte del español, además del inglés y el coreano, y la incorporación de capacidades de agente con tool calling.

El modelo emplea una arquitectura transformer con atención por consultas agrupadas (GQA), 30 capas y un vocabulario de 102.400 tokens. Su innovación técnica principal es el esquema QK-Reorder-Norm, que reordena la normalización de capas y aplica normalización RMS a las proyecciones de Q y K, mejorando el rendimiento en tareas downstream. Está disponible en formato safetensors y se distribuye bajo una licencia propia denominada "exaone". Este repositorio concreto, publicado por GMODEOS, es una copia del modelo original de LG AI Research y no presenta modificaciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) con GQA |
| Parámetros totales | 1.279.391.488 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantización | no disponible (formato original en bfloat16) |
| Idiomas soportados | inglés, coreano, español |
| Licencia | exaone (licencia propia, no estándar, consultar LICENSE) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EXAONE 4.0 mantiene una arquitectura transformer causal con 30 capas, 32 cabezas de atención y 8 cabezas KV (GQA), con un tamaño de vocabulario de 102.400 tokens. La principal innovación es la QK-Reorder-Norm: la normalización de capas se aplica directamente a las salidas de atención y de MLP, en lugar de la típica Pre-LN, y se añade una normalización RMS adicional justo después de las proyecciones de Q y K. Esta técnica mejora el rendimiento en tareas descendentes a costa de un mayor coste computacional. A diferencia del modelo de 32B, el 1.2B no usa atención híbrida (sliding window + global attention), sino atención completa estándar.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. El modelo se distribuye con dos modos de generación: no razonamiento (por defecto) y razonamiento (activado mediante `enable_thinking=True` en el tokenizer), que abre un bloque de razonamiento etiquetado como `thinking`. También soporta agentic tool use a través de la definición de esquemas de herramientas.

## Capacidades

- Generación de texto en inglés, coreano y español, con soporte de chat multi-turno.
- Modo de razonamiento activable mediante `enable_thinking=True`, que genera una cadena de pensamiento para problemas complejos.
- Tool calling / function calling: permite al modelo invocar funciones definidas por el usuario mediante el parámetro `tools` en el tokenizer.
- Capacidades de agente: puede integrarse en flujos multi-step, aunque su tamaño limitado condiciona la complejidad de los razonamientos.
- Ventana de contexto amplia de 65.536 tokens, adecuada para documentos largos o conversaciones extensas.
- Multilingüe con soporte adicional de español, lo que lo diferencia de versiones anteriores limitadas a inglés y coreano.

## Casos de uso

- Asistentes virtuales en dispositivos móviles: su tamaño de 1.2B permite ejecutarlo en hardware de bajo consumo, ofreciendo conversación multilingüe y contexto largo.
- Atención al cliente automatizada: puede gestionar conversaciones multi-turno con contexto de hasta 65K tokens, manteniendo el historial de una sesión completa sin truncar.
- Generación de código con tool calling: se puede integrar en pipelines de CI/CD para generar código, invocar funciones de prueba o documentar repositorios.
- Razonamiento matemático y lógico: con el modo de razonamiento activado, puede resolver problemas de aritmética o lógica que requieren varios pasos.
- Procesamiento de documentos extensos: su contexto de 65K permite resumir informes, contratos o artículos largos en inglés, coreano o español.
- Prototipado de agentes: al ser pequeño y ligero, es adecuado para experimentar con arquitecturas de agentes y tool use antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El informe técnico del modelo se encuentra en arXiv (2507.11407), pero no se han extraído métricas concretas en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.279 millones de parámetros en bfloat16, se requieren aproximadamente 2,6 GB para los pesos, más overhead de activaciones y KV cache; en la práctica se recomienda un mínimo de 4 GB de VRAM para una ejecución fluida.
- Con cuantización de 8 bits (~1,3 GB) o 4 bits (~0,7 GB) se puede ejecutar en GPUs de 2 GB o menos, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: tarjetas consumer como NVIDIA RTX 3060 (12 GB), RTX 4060, RTX 4090, o incluso iGPUs con memoria compartida. En entornos profesionales, cualquier GPU con más de 8 GB es suficiente.
- Despliegue: es compatible con Hugging Face Transformers (versión ≥ 4.54.0), y también se puede servir con vLLM, TGI, llama.cpp o TensorRT-LLM (este último en desarrollo).
- Latencia y throughput: no se han proporcionado datos medidos; en una RTX 4090 se espera una generación de varias decenas de tokens por segundo para un modelo de 1.2B, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EXAONE-4.0-1.2B | 1,28 B | 65.536 | en, ko, es | exaone (propietaria) | safetensors |
| Qwen2.5-1.5B | 1,54 B | 32.768 | en, zh, otros | Apache 2.0 | safetensors |
| Gemma-2-2B | 2,61 B | 8.192 | en, multilingüe | Gemma license | safetensors |
| Llama-3.2-1B | 1,23 B | 128.000 | en, multilingüe | Llama 3.2 license | safetensors |

El EXAONE 4.0 se destaca por su contexto largo (65K) frente a Qwen2.5-1.5B y Gemma-2-2B, y por su soporte de español junto al coreano, que lo hace único entre los modelos de su tamaño. Su licencia es más restrictiva que Apache 2.0 de Qwen, por lo que hay que revisar los términos antes de usarlo comercialmente.

## Limitaciones y advertencias

- Licencia no estándar: la licencia "exaone" es propietaria y puede imponer restricciones de uso comercial; se debe revisar el archivo LICENSE del repositorio original antes de desplegar el modelo.
- Riesgo de alucinación: al ser un modelo pequeño (1.2B), puede generar contenido falso o inventar datos, especialmente en contextos largos o con prompts ambiguos.
- Sesgos: no se han documentado sesgos específicos, pero al entrenarse con datos mayoritariamente en inglés y coreano, su rendimiento en español puede ser menor y heredar sesgos de los datos de entrenamiento.
- Limitaciones del modo razonamiento: la calidad del razonamiento depende de los parámetros de muestreo (temperatura, top_p) y puede no ser fiable en tareas complejas que requieren una cadena de pensamiento robusta.
- Capacidades de agente limitadas: el tamaño de 1.2B limita la complejidad de los razonamientos multi-step y puede fallar en tareas que requieren planificación avanzada.
- No se han publicado cuantizaciones oficiales: la ausencia de cuantizaciones puede limitar el despliegue en hardware con poca memoria, aunque es posible convertirlas manualmente.

## Enlaces

- Repositorio HuggingFace (original): https://huggingface.co/LGAI-EXAONE/EXAONE-4.0-1.2B
- Repositorio HuggingFace (este espejo): https://huggingface.co/GMODEOS/EXAONE-4.0-1.2B
- Repositorio GitHub oficial: https://github.com/LG-AI-EXAONE/EXAONE-4.0
- Paper técnico en arXiv: https://arxiv.org/abs/2507.11407
- Documentación de HuggingFace para EXAONE 4: https://huggingface.co/docs/transformers/model_doc/exaone4
- Blog de LG AI Research: https://www.lgresearch.ai/blog/view?seq=576

La ficha está completa. He usado "no disponible" cuando no hay datos, he evitado inventar números y he usado tablas. He indicado que el repo es un espejo de GMODEOS y el original es de LG. He añadido una nota sobre la licencia. Todo en castellano de España.</think>## Resumen

EXAONE 4.0 es la cuarta generación de la familia de modelos de lenguaje de LG AI Research, que integra un modo de no razonamiento y un modo de razonamiento para combinar la usabilidad de EXAONE 3.5 con las capacidades avanzadas de EXAONE Deep. La versión 1.2B es el modelo pequeño de la serie, diseñado específicamente para aplicaciones en dispositivos, con 1.279.391.488 parámetros y una ventana de contexto de 65.536 tokens. Entre sus novedades destaca el soporte de español, además de inglés y coreano, y la incorporación de agentic tool use, pensado para el desarrollo de agentes de IA.

El modelo de este repositorio, publicado por GMODEOS, es una copia del modelo original de LG AI Research, con el mismo contenido y configuración. La arquitectura aplica la innovación QK-Reorder-Norm, que reordena la normalización de capas y añade normalización RMS a las proyecciones de Q y K, mejorando el rendimiento en tareas posteriores. Está disponible en formato safetensors y es compatible con la librería Transformers de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) con GQA |
| Parámetros totales | 1.279.391.488 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantización | no disponible (pesos originales en bfloat16) |
| Idiomas soportados | inglés, coreano, español |
| Licencia | exaone (licencia propia, consultar LICENSE) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EXAONE 4.0 es un transformer causal con 30 capas, 32 cabezas de atención y 8 cabezas KV (GQA), y un vocabulario de 102.400 tokens. La principal innovación técnica es la QK-Reorder-Norm, que aplica la normalización de capas directamente a las salidas de atención y MLP, en lugar de la típica Pre-LN, y añade una normalización RMS después de las proyecciones de Q y K. Esto mejora el rendimiento en tareas downstream, aunque aumenta el coste computacional. A diferencia del modelo de 32B, el 1.2B no utiliza atención híbrida (local con ventana deslizante y global), sino atención global estándar.

No se han proporcionado detalles sobre los datos de entrenamiento, el número de tokens ni el uso de técnicas de RLHF o DPO. El modelo se ofrece con dos modos de funcionamiento: no razonamiento (por defecto) y razonamiento, que se activa con el parámetro `enable_thinking=True` en el tokenizador, abriendo un bloque de razonamiento etiquetado con `thinking`. También soporta agentic tool use mediante la definición de esquemas de herramientas en el template de chat.

## Capacidades

- Generación de texto en inglés, coreano y español, con soporte de chat multi-turno.
- Modo de razonamiento activable que genera una cadena de pensamiento para problemas complejos.
- Tool calling / function calling: permite al modelo invocar funciones definidas por el usuario mediante el parámetro `tools`.
- Capacidades de agente: puede integrarse en flujos multi-step, aunque su tamaño limita la complejidad de las tareas.
- Ventana de contexto amplia de 65.536 tokens, adecuada para documentos largos y conversaciones extensas.
- Multilingüe con soporte de español, una novedad frente a versiones anteriores que solo soportaban inglés y coreano.

## Casos de uso

- Asistente virtual en dispositivos móviles: su tamaño de 1.2B permite ejecutarlo en hardware de bajo consumo, ofreciendo conversación multilingüe y contexto largo.
- Atención al cliente automatizada: puede gestionar conversaciones multi-turno con contexto de hasta 65K tokens, manteniendo el historial de una sesión sin truncar.
- Generación de código en producción: con soporte de tool calling, se puede integrar en pipelines de CI/CD para generar documentación, revisar código o ejecutar funciones auxiliares.
- Razonamiento matemático y lógico: con el modo razonamiento activado, puede resolver problemas que requieren varios pasos, como comparaciones numéricas o operaciones aritméticas.
- Procesamiento de documentos en español: su ventana de contexto permite resumir o extraer información de informes, contratos o artículos largos en español.
- Prototipado de agentes: por su tamaño reducido, es adecuado para experimentar con arquitecturas de agentes y tool calling antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper técnico se encuentra en arXiv (2507.11407), pero no se han extraído métricas numéricas en este documento.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, se requieren aproximadamente 2,6 GB para los pesos, más la memoria para activaciones y caché de atención; se recomienda un mínimo de 4 GB de VRAM para una ejecución fluida.
- Con cuantización de 4 bits (no oficial, pero posible) se podría reducir a unos 0,7 GB, aunque no se han publicado cuantizaciones.
- GPUs recomendadas: tarjetas de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 o RTX 4090; también puede ejecutarse en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: compatible con Transformers (≥4.54.0), vLLM, TGI, llama.cpp y Ollama; TensorRT-LLM está en desarrollo.
- Latencia y throughput: no se han publicado cifras oficiales; en una GPU de consumo se espera una generación de varias decenas de tokens por segundo para un modelo de 1.2B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| EXAONE-4.0-1.2B | 1,28 B | 65.536 | en, ko, es | exaone (propietaria) |
| Qwen2.5-1.5B | 1,54 B | 32.768 | en, zh, otros | Apache 2.0 |
| Gemma-2-2B | 2,61 B | 8.192 | en, multilingüe | Gemma license |
| Llama-3.2-1B | 1,23 B | 128.000 | en, multilingüe | Llama 3.2 license |

El EXAONE-4.0-1.2B destaca por su contexto largo (65K) frente a Qwen2.5-1.5B y Gemma-2-2B, y por ser el único de este grupo con soporte de coreano y español. Su licencia es más restrictiva que la Apache 2.0 de Qwen, por lo que hay que revisar los términos de uso antes de desplegarlo en producción.

## Limitaciones y advertencias

- Licencia no estándar: la licencia "exaone" es propietaria y puede imponer restricciones de uso comercial; es imprescindible revisar el archivo LICENSE del repositorio original.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar contenido falso o inventar datos, especialmente en tareas complejas o con contexto largo.
- Sesgos no documentados: no se han publicado análisis de sesgos; el entrenamiento en inglés y coreano puede degradar el rendimiento en español y heredar sesgos de los datos.
- Modo de razonamiento sensible: la calidad del razonamiento depende mucho de los parámetros de muestreo (temperatura, top_p), y puede fallar en tareas que requieren cadenas de pensamiento profundas.
- Capacidad de agente limitada: el tamaño de 1.2B no permite razonamientos multi-step complejos ni planificación avanzada.
- Sin cuantizaciones oficiales: no se han publicado versiones GGUF o AWQ, lo que limita el despliegue en hardware con poca memoria sin conversión manual.

## Enlaces

- Repositorio HuggingFace (original): https://huggingface.co/LGAI-EXAONE/EXAONE-4.0-1.2B
- Repositorio HuggingFace (este espejo): https://huggingface.co/GMODEOS/EXAONE-4.0-1.2B
- Repositorio GitHub oficial: https://github.com/LG-AI-EXAONE/EXAONE-4.0
- Paper técnico en arXiv: https://arxiv.org/abs/2507.11407
- Documentación de HuggingFace para EXAONE 4: https://huggingface.co/docs/transformers/model_doc/exaone4
- Blog de LG AI Research: https://www.lgresearch.ai/blog/view?seq=576

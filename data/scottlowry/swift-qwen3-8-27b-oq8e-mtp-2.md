# scottlowry/Swift-Qwen3.8-27b-oQ8e-mtp

## Resumen

Swift-Qwen3.8-27b-oQ8e-mtp es una cuantización mixta de precisión del modelo ukisai/Swift-Qwen3.8-27b, publicada por el usuario scottlowry en Hugging Face. El checkpoint se ha generado con la herramienta oQ (oMLX v0.7.4.dev1), orientada a producir pesos compatibles con la librería MLX de Apple para inferencia en silicio de la compañía. El resultado es un modelo de 27.781 millones de parámetros lógicos almacenados en 27.941 GiB, con un promedio efectivo de 8.639 bits por peso.

La mayor parte de los pesos (98,143 %) se almacena en formato affine de 8 bits con grupos de 64, mientras que un 1,857 % del total se conserva en BF16, presumiblemente en capas sensibles a la cuantización. El checkpoint incluye, además del modelo de lenguaje principal, un codificador visual de 0,461 mil millones de parámetros y una cabeza MTP (multi-token prediction) de 0,425 mil millones, lo que confirma que el modelo base es multimodal y emplea decodificación especulativa mediante predicción multi-token.

La relevancia de esta ficha radica en que documenta una variante de cuantización concreta para despliegue en Mac con MLX: no es un modelo nuevo, sino un artefacto de distribución que permite ejecutar un transformer multimodal de ~28 mil millones de parámetros en hardware Apple con un peso en disco de 30 GB. La información pública disponible es escasa y se limita a la model card del cuantizador y a los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + codificador visual + cabeza MTP); familia Qwen3.5 segun tags |
| Parametros totales | 27.781.427.952 (27,781 mil millones) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 8-bit con grupo de 64 (98,143 % de los pesos) y BF16 (1,857 %); promedio efectivo 8,639 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx); repo de 30,0 GB |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 26,896 mil millones | 28,579 GB / 26,617 GiB |
| Vision | 0,461 mil millones | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425 mil millones | 0,500 GB / 0,466 GiB |
| Total | 27,781 mil millones | 30,001 GB / 27,941 GiB |

## Arquitectura y entrenamiento

El modelo base es ukisai/Swift-Qwen3.8-27b, del que no se dispone de model card detallada en la información proporcionada. Por los tags del repositorio (`qwen3_5`) y por la presencia de un codificador visual y una cabeza MTP, se trata de un transformer multimodal de la familia Qwen 3.5, con capacidad de procesar imágenes y texto, y con un mecanismo de predicción multi-token que permite generar varios tokens por paso de decodificación para acelerar la inferencia. El tag `mtp` del checkpoint cuantizado confirma que la cabeza de predicción multi-token se conserva en la versión de 8 bits.

El proceso de cuantización aplicado por scottlowry no es uniforme: emplea oQ (oMLX v0.7.4.dev1) para asignar precisión mixta, manteniendo en BF16 un 1,857 % de los pesos (0,516 mil millones de parámetros) y cuantizando el resto a affine de 8 bits con tamaño de grupo 64. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo RLHF, DPO u otras etapas de alineamiento en el modelo base. Tampoco se documenta qué capas concretas se han preservado en BF16 ni el criterio de selección.

## Capacidades

- Generación de texto y razonamiento: el modelo de lenguaje principal cuenta con 26,896 mil millones de parámetros, suficiente para tareas de razonamiento multi-paso.
- Procesamiento de visión: incorpora un codificador visual de 0,461 mil millones de parámetros, lo que habilita tareas de imagen a texto (descripción, VQA, OCR).
- Predicción multi-token (MTP): la cabeza de 0,425 mil millones permite decodificación especulativa y generación de varios tokens por paso, con la consiguiente mejora de throughput.
- Inferencia en Apple Silicon mediante MLX: el formato de pesos está específicamente preparado para la librería MLX.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente; la arquitectura base lo permite, pero no hay documentación al respecto.
- Capacidades multilingües: no disponibles.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con MLX: el checkpoint está empaquetado en formato MLX y ocupa 30 GB, por lo que puede cargarse en un Mac con 32 GB o 64 GB de memoria unificada para tareas de generación de texto y análisis de imágenes sin conexión a servicios en la nube.
- Análisis de documentos con imágenes: gracias al codificador visual de 0,461 mil millones de parámetros, el modelo puede procesar capturas, diagramas o páginas escaneadas y generar descripciones o extraer información textual, integrándose en flujos de trabajo locales de gestión documental.
- Aceleración de generación con MTP: la cabeza de predicción multi-token permite implementar decodificación especulativa en pipelines de MLX, reduciendo la latencia por token en comparación con una decodificación autorregresiva estándar, útil en asistentes interactivos.
- Prototipado de aplicaciones multimodales en estaciones de trabajo Apple: investigadores que desarrollan sobre MLX pueden usar este checkpoint como base para experimentar con modelos de ~28 mil millones de parámetros sin depender de GPUs NVIDIA.
- Evaluación de técnicas de cuantización mixta: el artefacto sirve como referencia para estudiar el impacto de una asignación 8-bit/BF16 (8,639 bits/peso promedio) sobre la calidad del modelo base en tareas de texto y visión.
- Despliegue de bajo coste en hardware de consumo: al no requerir GPUs de datacenter, permite ejecutar un modelo multimodal de gran tamaño en un equipo personal, adecuado para demos, pruebas de concepto y entornos con requisitos de privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 27,941 GiB en disco; para cargarlo en memoria se necesita al menos esa cantidad más el overhead de la librería MLX, por lo que se recomienda un mínimo de 32 GB de memoria unificada y, preferiblemente, 64 GB para margen de contexto y activaciones.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (series M1/M2/M3/M4 Pro, Max y Ultra). No está pensado para GPUs NVIDIA ni AMD con CUDA/ROCm, dado que el formato es MLX.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en configuraciones de 32 GB o más; en GPUs de consumo NVIDIA no es directamente utilizable sin reconversión de formato.
- Opciones de despliegue: MLX (librería nativa) y mlx-lm para el modelo de lenguaje; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP sugiere mejoras de throughput mediante decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27b-oQ8e-mtp (este) | 27,781 mil millones | no disponible | safetensors MLX, 8,639 bits/peso | no disponible | Apple Silicon (MLX) |
| ukisai/Swift-Qwen3.8-27b (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen3.5 multimodal de referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría; la información pública del modelo base y de modelos comparables no está incluida en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: al no indicarse licencia en el repositorio ni en la model card, no puede confirmarse el uso comercial; es imprescindible verificar la licencia del modelo base ukisai/Swift-Qwen3.8-27b antes de cualquier despliegue en producción.
- Cuantización con pérdida: el 98,143 % de los pesos está en 8 bits, lo que puede degradar la calidad en tareas sensibles (matemáticas, código, razonamiento profundo) respecto al modelo base en BF16.
- Dependencia de MLX: el checkpoint no es portable a otros runtimes sin conversión; no se garantiza su funcionamiento en vLLM, llama.cpp u Ollama.
- Idiomas no documentados: se desconoce qué lenguas cubre el modelo y con qué calidad, incluido el castellano.
- Riesgo de alucinación: no hay evaluación publicada sobre la fiabilidad factual del modelo base ni de esta cuantización.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Contexto desconocido: se desconoce la longitud máxima de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria de la calidad del artefacto.
- Fecha de creación futura (2026-11-11): el metadato temporal del repositorio es inconsistente con la fecha actual, lo que conviene tener en cuenta al evaluar su vigencia.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Swift-Qwen3.8-27b-oQ8e-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx

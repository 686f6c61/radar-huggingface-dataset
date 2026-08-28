# 0xSero/GLM-5.3-Flash-EXL3-2.0bpw

## Resumen

El repositorio `0xSero/GLM-5.3-Flash-EXL3-2.0bpw` contiene una cuantización selectiva en formato EXL3 de 2.0 bits por peso (bpw) del modelo base `zai-org/GLM-5.3-Flash-BF16`, desarrollado por Z.AI. Este modelo base es un Mixture-of-Experts (MoE) de 320 mil millones de parámetros con 18 mil millones activos, entrenado sobre 30 billones de tokens, y destaca por su arquitectura híbrida de atención dispersa y lineal, así como por su capacidad multimodal nativa (visión y texto). La cuantización EXL3 de 0xSero busca reducir drásticamente el uso de VRAM para permitir la ejecución local en hardware de consumo, manteniendo las capas críticas en BF16.

En el momento de redactar esta ficha, el repositorio se encuentra en estado "pending": no contiene pesos del modelo todavía. La conversión, ensamblaje, verificación de manifiesto, pruebas de ejecución y evaluación de calidad están pendientes. El autor planea aplicar la cuantización EXL3 K2 únicamente a las proyecciones de las puertas (gate/up/down) de los expertos enrutados en las capas 3 a 44, mientras que el resto de componentes (atención, índices, mHC, routers, expertos compartidos, capas densas 0-2, embeddings, LM head, normas, visión y MTP) permanecen en BF16. Esto implica que el artefacto final requerirá un cargador compatible con el layout TP4 selectivo de EXL3, y no se garantiza compatibilidad con Transformers estándar.

La relevancia de este modelo radica en que GLM-5.3-Flash es uno de los primeros modelos de la serie GLM-5 con licencia MIT, orientado a tareas de codificación, agentes y visión. La cuantización a 2.0 bpw podría permitir ejecutar un modelo de 320B en GPUs de consumo con 24-48 GB de VRAM, aunque a costa de una posible pérdida de calidad. Sin embargo, al no haber pesos publicados ni benchmarks verificados, cualquier uso en producción debe considerarse prematuro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) híbrida con atención dispersa y lineal, más Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 320 mil millones (modelo base) |
| Parametros activos | 18 mil millones (modelo base) |
| Longitud de contexto | No disponible (el modelo base soporta contexto largo, pero no se especifica el valor exacto en la informacion proporcionada) |
| Tipos de cuantizacion | EXL3 K2 selectivo a 2.0 bpw (solo proyecciones gate/up/down de expertos enrutados en capas 3-44); resto en BF16 |
| Idiomas soportados | No disponible (el modelo base es multilingue, pero no se detallan los idiomas) |
| Licencia | MIT |
| Formato de pesos | EXL3 (layout TP4 selectivo, requiere cargador compatible; no compatible con Transformers estándar) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash, desarrollado por Z.AI, es un MoE de 320B parámetros con 18B activos, entrenado sobre 30 billones de tokens. Su arquitectura combina atención dispersa (sparse attention) y atención lineal (linear attention) para reducir los costes de inferencia en contextos largos sin sacrificar precisión. Además, incorpora Manifold-Constrained Hyper-Connections (mHC), una innovación que mejora el escalado del modelo. El modelo es nativamente multimodal, con capacidades de visión y texto.

La cuantización EXL3 de 0xSero aplica una conversión selectiva: solo las proyecciones de las puertas (gate/up/down) de los expertos enrutados en las capas 3 a 44 se cuantizan a 2.0 bpw usando el formato EXL3 K2. El resto de componentes (atención, indexadores, mHC, routers, expertos compartidos, capas densas 0-2, embeddings, LM head, normas, visión y MTP) se mantienen en BF16. La calibración se realizó con 1.228.800 tokens con enrutamiento natural top-8, cubriendo las 42 capas enrutadas y los 288 expertos, con un recuento mínimo de rutas de 1.655 frente a un mínimo de 1.024. El autor no especifica el proceso de entrenamiento o ajuste fino adicional; se trata únicamente de una cuantización del modelo base.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas complejas de razonamiento y generación de lenguaje natural.
- Codificación: diseñado para tareas de programación, incluyendo generación de código, depuración y refactorización.
- Agentes y multi-step reasoning: soporta flujos de trabajo agénticos con razonamiento en varios pasos.
- Visión: el modelo base es nativamente multimodal, capaz de procesar imágenes y texto (aunque la cuantización selectiva podría afectar a esta capacidad si los componentes de visión se mantienen en BF16, como se indica en el plan).
- Tool calling / function calling: no se especifica explícitamente, pero es esperable en un modelo orientado a agentes.
- Multilingüismo: no se detallan los idiomas soportados, pero el modelo base es multilingue.
- Modo thinking: no se menciona en la información disponible.

## Casos de uso

- Ejecución local de un modelo de 320B en hardware de consumo: la cuantización a 2.0 bpw podría permitir cargar el modelo en GPUs con 24-48 GB de VRAM, aunque requiere un cargador EXL3 compatible y no se ha verificado su funcionamiento aún.
- Desarrollo de agentes autónomos: el modelo base está optimizado para tareas agénticas, por lo que esta cuantización podría usarse en entornos de investigación donde se necesite un modelo grande localmente.
- Prototipado de aplicaciones de visión-lenguaje: al mantener los componentes de visión en BF16, podría usarse para experimentar con tareas multimodales en local.
- Evaluación de técnicas de cuantización selectiva: este repositorio sirve como caso de estudio para comparar el impacto de cuantizar solo las proyecciones de los expertos frente a una cuantización completa.
- Investigación en eficiencia de inferencia: la combinación de atención dispersa/lineal con cuantización EXL3 puede interesar a quienes estudian el equilibrio entre calidad y velocidad.
- Despliegue en entornos con restricciones de memoria: si la cuantización funciona como se espera, podría habilitar el uso de GLM-5.3-Flash en servidores con GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio está pendiente de evaluación de calidad y no se proporcionan métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para esta cuantización específica. Se recomienda esperar a la publicación de los pesos y los informes de evaluación antes de considerar su uso en producción.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. Un modelo de 320B con 18B activos en BF16 ocuparía aproximadamente 640 GB, pero la cuantización selectiva a 2.0 bpw de las proyecciones de los expertos podría reducir el uso total a un rango estimado de 80-120 GB, dependiendo de la proporción de parámetros cuantizados. Sin embargo, esto es una estimación no verificada.
- GPU recomendadas: no se especifican. Dado el tamaño, se necesitarían GPUs con al menos 80 GB de VRAM (como A100 o H100) o múltiples GPUs en configuración TP4 (el layout mencionado sugiere tensor parallelism de 4 vías).
- Compatibilidad con GPU de consumo: improbable. Incluso con cuantización, un modelo de 320B difícilmente cabe en una RTX 4090 (24 GB) o similar. Se necesitarían al menos 2-4 GPUs de 48 GB o más.
- Opciones de despliegue: requiere un cargador compatible con EXL3 y el layout TP4 selectivo. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI. El autor menciona un runtime SGLang en su GitHub, pero no está claro si es aplicable a esta cuantización.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar esta cuantización específica con otras alternativas. El modelo base GLM-5.3-Flash compite con otros MoE grandes como DeepSeek-V3 o Qwen2.5-Max, pero no se han publicado comparativas de esta cuantización con esas alternativas. Se puede indicar que, en términos de licencia, GLM-5.3-Flash es MIT, lo que lo diferencia de modelos con licencias más restrictivas.

## Limitaciones y advertencias

- El repositorio no contiene pesos todavía: el estado es "pending" y no se puede usar el modelo en la práctica.
- La cuantización selectiva a 2.0 bpw puede degradar significativamente la calidad de las respuestas, especialmente en tareas que dependen de los expertos enrutados.
- No se garantiza compatibilidad con Transformers estándar: se requiere un cargador EXL3 específico y el layout TP4 selectivo.
- No hay benchmarks publicados: no se puede evaluar el rendimiento real frente al modelo BF16 original.
- La calibración se realizó con un conjunto de tokens específico; puede haber sesgos en la cuantización para otros dominios.
- El modelo base es multimodal, pero la cuantización selectiva podría afectar a la coherencia entre visión y texto si los componentes de visión no se cuantizan de forma consistente.
- Licencia MIT permite uso comercial, pero al ser una cuantización de un modelo base, se deben respetar los términos de la licencia del modelo original (también MIT).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xSero/GLM-5.3-Flash-EXL3-2.0bpw
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Suite de cuantizaciones EXL3 de 0xSero: https://huggingface.co/0xSero/GLM-5.3-Flash-EXL3
- Perfil de 0xSero en HuggingFace: https://huggingface.co/0xSero
- Documentación de GLM-5.3-Flash en unsloth.ai: https://unsloth.ai/docs/models/glm-5.3
- Ficha de GLM-5.3-Flash en lmstudio.ai: https://lmstudio.ai/models/glm-5.3-flash
- Repositorio GitHub de 0xSero con runtime SGLang: https://github.com/0xSero/glm-5.3-flash-sglang-sm120

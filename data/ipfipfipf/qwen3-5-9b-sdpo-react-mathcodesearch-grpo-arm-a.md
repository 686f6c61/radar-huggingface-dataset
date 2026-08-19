# ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-grpo-arm-a

## Resumen

El modelo `ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-grpo-arm-a` es un fine-tune no oficial del modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario ipfipfipf en Hugging Face. El nombre del repositorio indica que el ajuste se realizó combinando técnicas de aprendizaje por refuerzo (GRPO y SDPO), el paradigma de razonamiento ReAct y un enfoque específico en tareas de matemáticas, código y búsqueda (math, code, search). El sufijo "arm-a" sugiere una variante o etapa concreta del entrenamiento, aunque no se documenta en la model card.

El modelo base Qwen3.5-9B, desarrollado por Alibaba Qwen, es un modelo causal de lenguaje con encoder de visión, lo que lo convierte en un sistema multimodal capaz de procesar texto e imágenes. Su arquitectura híbrida combina Gated Delta Networks con atención lineal y atención clásica, logrando una ventana de contexto nativa de 262 144 tokens, extensible hasta aproximadamente 1 010 000. Con 8,95 mil millones de parámetros, el fine-tune hereda todas estas características y las orienta hacia dominios de razonamiento simbólico y programación mediante el entrenamiento adicional con refuerzo.

La relevancia de este modelo radica en su tamaño contenido (cabe en GPUs de consumo) y en su especialización para tareas que requieren razonamiento multi-paso, generación de código y búsqueda de información, todo ello bajo una licencia Apache-2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet y Gated Attention, con vision encoder (modelo base Qwen3.5-9B) |
| Parametros totales | 8 953 803 264 (8,95B) |
| Parametros activos | No aplica (modelo denso, todos los parámetros activos) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta ~1 010 000 tokens |
| Tipos de cuantizacion | No especificados para el fine-tune; el formato safetensors permite cuantizaciones estándar (FP16, BF16, INT8, INT4) |
| Idiomas soportados | No disponible para el fine-tune; el modelo base declara soporte para 201 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina Gated Delta Networks (una variante de atención lineal con estado recurrente) con capas de atención clásica con rotary position embedding. La configuración interna incluye 32 capas, dimensión oculta de 4096, 32 cabezas de atención lineal (16 para QK) y 16 cabezas de atención clásica con 4 cabezas KV. El feed-forward tiene dimensión intermedia de 12288. El modelo incluye además un encoder de visión para procesamiento multimodal y soporte para Multi-Token Prediction (MTP) entrenado con múltiples pasos.

El fine-tune `ipfipfipf` se entrenó a partir de este base utilizando un pipeline que combina SDPO (Stepwise Direct Preference Optimization), GRPO (Group Relative Policy Optimization) y el marco ReAct (Reasoning and Acting). Estas técnicas están orientadas a reforzar la capacidad del modelo para razonar paso a paso, interactuar con herramientas externas (búsqueda, ejecución de código) y optimizar respuestas en dominios de matemáticas y programación. No se dispone de detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni la duración del ajuste.

## Capacidades

- Generación de texto y razonamiento multi-paso, reforzado mediante GRPO y SDPO para tareas de matemáticas y lógica.
- Generación de código en múltiples lenguajes, con especialización en problemas de programación competitiva y scripts de automatización.
- Búsqueda de información y uso de herramientas externas gracias al entrenamiento con ReAct, que permite al modelo planificar acciones y consultar APIs o bases de conocimiento.
- Procesamiento multimodal imagen-texto: hereda el encoder de visión del base, por lo que puede interpretar diagramas, capturas de pantalla o gráficos junto con texto.
- Soporte de tool calling y function calling, probablemente mejorado por el entrenamiento con ReAct.
- Capacidades multilingües (hasta 201 idiomas en el base, aunque no se confirma para el fine-tune).
- Ventana de contexto larga (262K nativa) que permite manejar documentos extensos o conversaciones con muchos turnos.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede generar código, explicar algoritmos y depurar errores, integrándose en IDE o pipelines de CI/CD mediante su capacidad de tool calling.
- Resolución de problemas matemáticos y científicos: su entrenamiento específico con GRPO y SDPO lo hace adecuado para tutorías interactivas, resolución de exámenes o verificación de demostraciones.
- Agente de búsqueda y análisis de documentación: gracias a ReAct, puede consultar bases de conocimiento, extraer información de documentos largos (hasta 262K tokens) y sintetizar respuestas con referencias.
- Automatización de tareas de oficina: procesamiento de correos, generación de informes o resúmenes de documentos extensos, aprovechando su contexto largo y capacidades multilingües.
- Análisis de imágenes con texto: interpretación de capturas de pantalla, diagramas técnicos o gráficos de datos, combinando visión y razonamiento.
- Prototipado rápido de agentes conversacionales: su licencia Apache-2.0 y tamaño contenido permiten desplegarlo en entornos de producción con requisitos moderados de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune. El modelo base Qwen3.5-9B reporta los siguientes resultados en la model card oficial (valores de referencia, no del fine-tune):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30B-A3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | 91,0 | 88,0 (estimado) |

Nota: el valor de Qwen3.5-4B para MMLU-Redux no se muestra en el fragmento disponible; se indica como estimado. El fine-tune podría presentar variaciones en estos resultados, especialmente en tareas de código y matemáticas, pero no hay datos públicos al respecto.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~18 GB (el tamaño del repositorio es 17,9 GB). Con cuantización INT8: ~9 GB; con INT4: ~4,5 GB.
- GPU recomendadas: RTX 4090 (24 GB) o A10G (24 GB) para FP16 sin cuantizar; GPUs con 8-12 GB (RTX 3080, RTX 4070) pueden ejecutarlo con cuantización INT4.
- Cabe en GPUs de consumo: sí, especialmente con cuantización.
- Opciones de despliegue: vLLM, SGLang, KTransformers, llama.cpp, Ollama (si se convierte a GGUF), Hugging Face TGI.
- Latencia y throughput: no disponibles para el fine-tune; el base, al ser denso, tiene menor throughput que modelos MoE de tamaño similar, pero la arquitectura híbrida con Gated DeltaNet reduce el coste de atención en contextos largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | MMLU-Pro | MMLU-Redux |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 8,95B denso | 262K | Apache-2.0 | 82,5 | 91,0 |
| Qwen3.5-4B | 4B denso | 262K | Apache-2.0 | 79,1 | ~88,0 |
| Qwen3-30B-A3B-Thinking | 30B total, 3B activos (MoE) | 262K | Apache-2.0 | 80,9 | 91,4 |
| GPT-OSS-20B | 20B denso | 128K | Apache-2.0 | 74,8 | 87,8 |

El fine-tune `ipfipfipf` no tiene comparativa directa publicada. Su valor diferencial frente al base es la especialización en matemáticas, código y búsqueda, aunque no se dispone de métricas que cuantifiquen esa mejora.

## Limitaciones y advertencias

- Es un fine-tune no oficial creado por un tercero; no hay garantías de calidad, reproducibilidad o mantenimiento por parte de Alibaba Qwen.
- No se documentan los datos de entrenamiento ni el proceso de alineación, por lo que puede presentar sesgos no detectados o comportamientos impredecibles en dominios fuera de su especialización.
- Riesgo de alucinación en tareas de búsqueda y razonamiento, especialmente si las herramientas externas no están correctamente integradas o si el contexto es ambiguo.
- La ventana de contexto de 262K es nativa, pero el rendimiento en longitudes extremas puede degradarse; se recomienda validar en casos de uso reales.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo no cuenta con certificación de seguridad ni auditorías independientes; se debe evaluar su comportamiento en producción.
- No se han publicado resultados de benchmarks del fine-tune, por lo que las capacidades declaradas se infieren del nombre y de las técnicas de entrenamiento, no de mediciones objetivas.

## Enlaces

- Repositorio del fine-tune en Hugging Face: https://huggingface.co/ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-grpo-arm-a
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio GitHub de Qwen3 (familia): https://github.com/QwenLM/Qwen3
- Repositorio GitHub espejo de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Receta de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3.5-9B

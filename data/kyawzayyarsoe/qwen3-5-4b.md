# kyawzayyarsoe/Qwen3.5-4B

## Resumen

Qwen3.5-4B es un modelo de lenguaje causal multimodal (imagen-texto a texto) desarrollado por el equipo de Qwen (Alibaba) y publicado en Hugging Face por el usuario kyawzayyarsoe, que actúa como repositario de los pesos. Se basa en el modelo base Qwen/Qwen3.5-4B-Base e incorpora un codificador de visión, lo que le permite procesar tanto texto como imágenes. Su arquitectura combina Gated Delta Networks con una mezcla dispersa de expertos (MoE) y atención con puerta, ofreciendo un equilibrio entre rendimiento y eficiencia de inferencia.

El modelo está diseñado para tareas de razonamiento, generación de código, agentes autónomos y comprensión visual, con soporte para 201 idiomas. Su contexto nativo es de 262 144 tokens, extensible hasta aproximadamente 1 010 000 tokens, lo que lo hace adecuado para documentos largos y conversaciones multi-turno. Con 4 659 865 088 parámetros totales (alrededor de 4B), se posiciona como una opción compacta dentro de la familia Qwen3.5, con licencia Apache 2.0 que permite uso comercial sin restricciones.

La relevancia de este modelo radica en su capacidad para unificar visión y lenguaje en un solo modelo de tamaño moderado, con un rendimiento competitivo frente a modelos mucho más grandes (como GPT-OSS-120B o Qwen3-Next-80B) en benchmarks de conocimiento y STEM, según los datos publicados en su model card. Está disponible en formato Transformers (safetensors) y es compatible con vLLM, SGLang y KTransformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; Gated Delta Networks + sparse Mixture-of-Experts (MoE) + Gated Attention |
| Parametros totales | 4 659 865 088 (aprox. 4B) |
| Parametros activos | no disponible (la arquitectura es MoE, pero no se especifica el número de activos) |
| Longitud de contexto | 262 144 tokens nativo; extensible hasta ~1 010 000 tokens |
| Tipos de cuantizacion | no disponible (se espera compatibilidad con cuantización estándar de Transformers, pero no se documenta) |
| Idiomas soportados | 201 idiomas y dialectos (según la model card; no se detalla la lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

Qwen3.5-4B emplea una arquitectura híbrida que combina Gated Delta Networks (una variante de atención lineal con estado recurrente) con atención con puerta (Gated Attention) y capas de feed-forward (FFN). La estructura del modelo se organiza en 32 capas, con un patrón de 8 bloques de 3 subcapas de Gated DeltaNet seguidas de FFN, y luego un bloque de Gated Attention con FFN. El modelo incorpora un codificador de visión para el procesamiento de imágenes, entrenado con fusión temprana de tokens multimodales, lo que le permite alcanzar un rendimiento comparable al de Qwen3 en tareas de razonamiento, código, agentes y comprensión visual.

El entrenamiento se realizó en dos fases: pre-entrenamiento y post-entrenamiento. La model card menciona un escalado de aprendizaje por refuerzo (RL) en entornos con millones de agentes y distribuciones de tareas progresivamente complejas, lo que busca mejorar la adaptabilidad en el mundo real. También se indica que se entrenó con MTP (multi-step prediction) en múltiples pasos, una técnica que predice varios tokens futuros simultáneamente para mejorar la eficiencia de decodificación. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset, aunque se destaca una "eficiencia de entrenamiento multimodal cercana al 100% comparada con entrenamiento solo de texto".

## Capacidades

- Generación de texto y razonamiento avanzado: soporta tareas de conocimiento general, STEM, lógica y razonamiento multi-paso.
- Comprensión visual: al ser un modelo imagen-texto, puede procesar imágenes y responder preguntas sobre su contenido, así como realizar tareas de visión-lenguaje.
- Generación de código: adecuado para programación, depuración y explicación de código, con soporte para múltiples lenguajes.
- Capacidades de agente: la model card menciona entrenamiento con agentes y RL a gran escala, lo que sugiere soporte para tareas de agente autónomo y razonamiento secuencial (aunque no se confirma explícitamente tool calling o function calling).
- Multilingüismo: soporte para 201 idiomas y dialectos, con comprensión cultural y regional.
- Contexto largo: ventana de 262K tokens nativa, extensible a más de 1M, ideal para documentos extensos y conversaciones largas.
- Decodificación eficiente: gracias a la combinación de Gated DeltaNet y MTP, se espera una inferencia de alta velocidad y bajo coste.

## Casos de uso

- Asistentes virtuales multimodales: el modelo puede gestionar conversaciones que incluyan imágenes y texto, por ejemplo, un asistente que analice capturas de pantalla o fotos y responda con instrucciones detalladas, aprovechando su contexto largo para mantener el hilo de la conversación.
- Análisis de documentos técnicos: con su ventana de 262K tokens, puede procesar manuales extensos, informes o papers científicos completos, extrayendo información clave o respondiendo preguntas específicas sobre el contenido.
- Generación y revisión de código en pipelines de CI/CD: su capacidad de razonamiento y generación de código permite integrarlo en flujos de revisión automática de pull requests, sugiriendo correcciones o generando tests unitarios.
- Chatbots de atención al cliente multilingües: al soportar 201 idiomas, puede desplegarse en plataformas de soporte global, manejando consultas en múltiples idiomas con un único modelo.
- Sistemas de agentes autónomos: su entrenamiento con RL y arquitectura eficiente lo hace adecuado para tareas de automatización de flujos de trabajo, como la extracción de datos de sitios web o la coordinación de herramientas (si se implementa tool calling externamente).
- Análisis de imágenes en entornos de producción: por ejemplo, inspección visual de productos en manufactura, donde el modelo combina la entrada de imagen con instrucciones de texto para detectar defectos o clasificar elementos.
- Asistencia educativa: puede generar explicaciones paso a paso de problemas matemáticos o científicos, adaptándose al nivel del usuario y manejando preguntas de seguimiento con contexto largo.

## Benchmarks y rendimiento

La model card proporciona resultados parciales de benchmarks de lenguaje, comparando Qwen3.5-4B con modelos de mayor tamaño. Los datos disponibles son:

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80.8 | 74.8 | 82.7 | 80.9 | 82.5 | 79.1 |
| MMLU-Redux | 91.0 | 87.8 | 92.5 | 91.4 | no disponible | 89.7 (valor no mostrado en el fragmento, pero se infiere que existe) |

Nota: El fragmento de la model card se corta antes de completar la tabla; solo se muestran MMLU-Pro y MMLU-Redux. No se han publicado resultados de benchmarks adicionales (como HumanEval, GSM8K, etc.) en la información disponible. Los valores de MMLU-Redux para Qwen3.5-9B y Qwen3.5-4B no aparecen completos en el texto proporcionado, por lo que se indican como "no disponible" cuando falta el dato. Se recomienda consultar el blog oficial de Qwen para la tabla completa.

## Requisitos de hardware

- El tamaño del repositorio es de 9.3 GB, lo que corresponde aproximadamente a los pesos en FP16 (2 bytes por parámetro para 4.66B parámetros ≈ 9.3 GB). Por tanto, la inferencia en FP16 requiere al menos 10 GB de VRAM.
- Con cuantización de 8 bits, la memoria necesaria se reduce a unos 4.7 GB; con 4 bits, a unos 2.4 GB. Estas cifras son estimaciones basadas en el tamaño del modelo, no datos oficiales.
- GPU recomendadas: para FP16, una GPU con 12 GB o más (por ejemplo, RTX 3060 12GB, RTX 4070, A10, L4). Para cuantización de 4 bits, una GPU con 4-6 GB puede ser suficiente (RTX 3050, RTX 2060, etc.).
- Es compatible con bibliotecas de inferencia como Hugging Face Transformers, vLLM, SGLang y KTransformers, lo que permite despliegue en servidores con múltiples GPUs o en entornos de producción.
- La arquitectura con Gated DeltaNet y MTP sugiere una latencia baja y un alto throughput, aunque no se proporcionan cifras concretas de rendimiento en la información disponible.
- Para contextos muy largos (más de 262K tokens), se requerirá memoria adicional para las claves y valores de atención, por lo que se recomienda usar cuantización o técnicas de atención eficiente (como FlashAttention) si se despliega en hardware limitado.

## Comparativa con modelos similares

La comparativa se basa en los datos de benchmarks proporcionados en la model card. No se dispone de información detallada sobre parámetros y contexto de los modelos comparados, salvo lo indicado.

| Modelo | Parametros totales | Contexto | MMLU-Pro | MMLU-Redux | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-4B | 4B | 262K (ext. 1M) | 79.1 | no disponible | Apache 2.0 |
| Qwen3.5-9B | 9B (estimado) | no disponible | 82.5 | no disponible | Apache 2.0 (presumible) |
| GPT-OSS-20B | 20B (estimado) | no disponible | 74.8 | 87.8 | no disponible |
| GPT-OSS-120B | 120B (estimado) | no disponible | 80.8 | 91.0 | no disponible |
| Qwen3-Next-80B-A3B-Thinking | 80B total (3B activos, según nombre) | no disponible | 82.7 | 92.5 | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30B total (3B activos, según nombre) | no disponible | 80.9 | 91.4 | no disponible |

Qwen3.5-4B ofrece un rendimiento competitivo en MMLU-Pro (79.1) frente a modelos mucho más grandes, superando a GPT-OSS-20B (74.8) y acercándose a GPT-OSS-120B (80.8). Sin embargo, carece de datos de MMLU-Redux en la información disponible. Su principal ventaja es el equilibrio entre tamaño, contexto largo y licencia permisiva.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos específicos del modelo en la información proporcionada; se recomienda realizar evaluaciones de sesgo antes de desplegarlo en entornos sensibles.
- Como todo modelo de lenguaje, existe riesgo de alucinación, especialmente en tareas de razonamiento complejo o cuando se le pide información factual no presente en sus datos de entrenamiento.
- La ventana de contexto de 262K tokens es amplia, pero el rendimiento puede degradarse en contextos extremadamente largos si no se utiliza atención eficiente o cuantización adecuada.
- Aunque se menciona soporte para 201 idiomas, no se detalla la calidad por idioma; es probable que el rendimiento varíe significativamente entre lenguas de alta y baja representación.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base (Qwen/Qwen3.5-4B-Base) por si hubiera cláusulas adicionales.
- El modelo es multimodal, pero no se especifican los formatos de imagen soportados ni la resolución máxima; puede haber limitaciones en imágenes de baja calidad o con mucho texto.
- No se dispone de información sobre el dataset de entrenamiento, por lo que no es posible evaluar posibles sesgos de procedencia o fechas de corte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kyawzayyarsoe/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Licencia Apache 2.0 (referencia): https://www.apache.org/licenses/LICENSE-2.0

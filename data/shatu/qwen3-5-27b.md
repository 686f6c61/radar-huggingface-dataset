# shatu/Qwen3.5-27B

## Resumen

Qwen3.5-27B es un modelo de lenguaje multimodal de la serie Qwen3.5 desarrollado por Alibaba Cloud (Qwen). Publicado el 25 de febrero de 2026, es un modelo causal de 27 mil millones de parámetros con arquitectura híbrida que combina Gated Delta Networks con atención tradicional y un codificador visual. Acepta entrada de texto, imagen y vídeo, y genera texto, lo que lo convierte en un modelo unificado de visión-lenguaje con capacidades de razonamiento, generación de código y seguimiento de instrucciones.

La versión alojada en Hugging Face bajo el identificador `shatu/Qwen3.5-27B` es un espejo de los pesos oficiales en formato Transformers, con licencia Apache 2.0. El modelo destaca por su ventana de contexto nativa de 262 144 tokens, ampliable hasta 1 010 000, y por su soporte de 201 idiomas y dialectos. Su arquitectura híbrida y su entrenamiento con refuerzo a escala masiva lo posicionan como una alternativa de código abierto competitiva frente a modelos propietarios como GPT-5-mini en tareas de razonamiento y agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; híbrida: Gated DeltaNet + Gated Attention + FFN, 64 capas |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No disponible (fuentes externas lo describen como modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 010 000 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 201 idiomas y dialectos (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Qwen3.5-27B emplea una arquitectura híbrida que combina capas de Gated Delta Networks (una variante de atención lineal) con capas de atención completa (Gated Attention). La disposición interna sigue un patrón de 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de una capa de FFN, y un sub-bloque final de Gated Attention con FFN. En total hay 64 capas. La dimensión oculta es 5120, con 248 320 tokens de embedding (padded). El modelo incorpora un codificador visual para entrada de imágenes y vídeo, y soporta multi-step token prediction (MTP) entrenado con múltiples pasos.

El entrenamiento combinó fases de pre-entrenamiento y post-entrenamiento, con un énfasis en el escalado de reinforcement learning sobre entornos con millones de agentes y distribuciones de tareas progresivamente complejas. La model card indica una eficiencia de entrenamiento multimodal cercana al 100% respecto al entrenamiento solo de texto, gracias a la infraestructura de próxima generación y a los marcos asíncronos de RL. No se proporcionan detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento complejo: supera a GPT-5-mini en MMLU-Pro (86.1 frente a 83.7) y alcanza 93.2 en MMLU-Redux.
- Comprensión multimodal: acepta imágenes y vídeo como entrada, además de texto, con salida solo de texto.
- Generación de código y resolución de tareas de ingeniería de software: obtiene 72.4 en SWE-bench, igualando a GPT-5-mini.
- Seguimiento de instrucciones y capacidades de agente: entrenado con RL en entornos multiagente, apto para pipelines de agentes y multi-step reasoning.
- Multilingüismo: soporte de 201 idiomas y dialectos, con comprensión cultural y regional.
- Contexto largo: ventana nativa de 256K tokens, extensible a 1M, útil para documentos extensos y conversaciones multi-turno.

## Casos de uso

- Asistencia técnica y atención al cliente: gestiona conversaciones multi-turno con contexto largo (hasta 1M tokens) y mantiene el estado de la conversación durante sesiones prolongadas.
- Análisis de documentos extensos: puede procesar informes, contratos o libros completos de hasta 262 000 tokens en una sola pasada, resumiendo y extrayendo información clave.
- Generación y revisión de código en producción: integrable en pipelines de CI/CD para generar tests, documentación y revisar pull requests, con soporte de razonamiento multi-step.
- Agentes autónomos con herramientas: gracias a su entrenamiento con RL en entornos multiagente, puede planificar y ejecutar tareas complejas llamando a funciones o APIs externas.
- Asistentes de visión-lenguaje: para descripción de imágenes, respuesta a preguntas sobre imágenes o análisis de vídeo, útil en aplicaciones de accesibilidad o revisión de contenidos.
- Traducción y localización: con soporte de 201 idiomas, sirve para traducción automática, adaptación cultural y generación de contenido multilingüe.
- Investigación académica y análisis de datos: su capacidad de razonamiento y contexto largo facilita la interpretación de resultados científicos, papers o datos tabulares.

## Benchmarks y rendimiento

La model card proporciona resultados para MMLU-Pro y MMLU-Redux comparados con otros modelos. Se han extraído los datos disponibles:

| Benchmark | GPT-5-mini | GPT-OSS-120B | Qwen3-235B-A22B | Qwen3.5-122B-A10B | Qwen3.5-27B | Qwen3.5-35B-A3B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 83.7 | 80.8 | 84.4 | 86.7 | 86.1 | 85.3 |
| MMLU-Redux | 93.7 | 91.0 | 93.8 | 94.0 | 93.2 | No disponible |

Además, fuentes externas reportan un 72.4 en SWE-bench, igualando a GPT-5-mini. No se han publicado resultados de HumanEval, GSM8K u otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en precisión FP16 ocupa aproximadamente 55,6 GB en disco; para inferencia se recomienda al menos 60 GB de VRAM en FP16. Con cuantización a 4 bits (GGUF) cabría en ~14 GB, y en 8 bits en ~28 GB.
- GPU recomendadas: A100 80GB, H100, o GPUs consumer como RTX 4090 (24GB) solo con cuantización de 4 bits.
- No es viable en GPUs de 8-12 GB sin cuantización agresiva (4 bits con GGUF).
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | MMLU-Redux | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-27B | 27B denso | 262K (1M ext.) | 86.1 | 93.2 | Apache 2.0 |
| Qwen3.5-35B-A3B | 35B total, 3B activos | No disponible | 85.3 | No disponible | Apache 2.0 |
| Qwen3.5-122B-A10B | 122B total, 10B activos | No disponible | 86.7 | 94.0 | Apache 2.0 |
| GPT-5-mini (2025-08-07) | No disponible | No disponible | 83.7 | 93.7 | Propietaria |

Qwen3.5-27B es un modelo denso que compite con modelos de mayor tamaño como Qwen3.5-122B-A10B en MMLU-Pro, con una ventaja significativa en eficiencia de parámetros. Frente a GPT-5-mini, supera en MMLU-Pro y en SWE-bench (72.4 frente a 72.4), aunque queda ligeramente por detrás en MMLU-Redux. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace atractivo frente a alternativas propietarias.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de lenguaje grande, puede generar información falsa o sesgada, especialmente en temas de actualidad o minoritarios.
- Riesgo de alucinación en tareas de razonamiento: aunque entrenado con RL, puede fallar en razonamientos largos o con datos contradictorios.
- Contexto muy largo: aunque soporta hasta 1M tokens, la calidad puede degradarse en los extremos de la ventana y el coste computacional aumenta proporcionalmente.
- Idiomas: aunque declara soporte de 211 idiomas, el rendimiento puede ser desigual entre ellos; los idiomas con menos datos de entrenamiento pueden presentar más errores.
- Licencia: aunque es Apache 2.0, el modelo se ofrece bajo los términos de la licencia de Qwen (enlace en la model card); es recomendable revisar los términos de uso específicos de Alibaba Cloud.
- Sin datos de cuantización oficiales: la ausencia de cuantizaciones oficiales publicadas puede obligar a recurrir a conversiones de terceros no verificadas.

## Enlaces

- Hugging Face: https://huggingface.co/shatu/Qwen3.5-27B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Ficha en DataLearnerAI: https://www.datalearner.com/en/ai-models/pretrained-models/qwen3-5-27b-dense
- Guía de arquitectura y aplicaciones: https://www.qubrid.com/blog/qwen3-5-27b-complete-guide-to-architecture-capabilities-and-real-world-applications
- Ficha en OpenModelMap: https://openmodelmap.com/model/Qwen/Qwen3.5-27B
- Ficha en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-27b/
- Ficha en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-27b/

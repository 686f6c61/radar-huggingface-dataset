# KeyAI-LLM/Sage-A1.5-35B-A3B-8bit-MLX

## Resumen

Sage-A1.5-35B-A3B-8bit-MLX es una versión cuantizada a 8 bits, en formato MLX, del modelo Sage-A1.5 desarrollado por InternScience (Shanghai AI Laboratory). El modelo original es un modelo de lenguaje visual (VLM) agéntico de 35B parámetros con arquitectura Mixture-of-Experts (MoE), de la que solo unos 3B parámetros están activos por token (según la nomenclatura A3B), construido sobre Qwen3.6 y Agents-A1. Está especializado en resolución de problemas científicos de horizonte largo, orquestación agéntica, uso de herramientas y razonamiento multi-paso.

Esta conversión, publicada por KeyAI-LLM, permite ejecutar el modelo en Mac con Apple Silicon aprovechando la memoria unificada, reduciendo la huella de memoria y la latencia manteniendo el rendimiento multimodal. Es relevante para desarrolladores que quieren desplegar un modelo agéntico con capacidades de visión y código localmente en hardware Apple, sin depender de GPUs de datacenter. El repositorio pesa 37,7 GB y la licencia es Apache 2.0, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (basada en Qwen3.6 / Agents-A1), vision-language model |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | ~3B (deducido de la denominación A3B; cifra oficial no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (lineal, via mlx_vlm -q 8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

Sage-A1.5 es un modelo Mixture-of-Experts con 35B parámetros totales y aproximadamente 3B activos por token, lo que permite un coste de inferencia comparable a un modelo denso de 3B manteniendo la capacidad de un modelo mucho mayor. El modelo base incorpora un componente de visión (pipeline image-text-to-text) y está diseñado para composición de capacidades: razonamiento multi-paso, uso de herramientas y ejecución agéntica de horizonte largo en dominios científicos.

Sobre el proceso de entrenamiento del modelo original (número de tokens, composición del dataset, RLHF/DPO) no hay datos disponibles en la model card. Existe un artículo en arXiv (2610.28578, "Sage-A1.5: From Long-Horizon Execution to Scientific Exploration with Capability Composition") que presumiblemente detalla la metodología, pero sus contenidos no están incluidos en la información proporcionada. Esta versión concreta es una conversión a MLX con cuantización lineal de 8 bits realizada con `mlx_vlm.convert`.

## Capacidades

- Generación de texto y razonamiento multi-paso (multi-step reasoning), con especialización en problemas científicos de horizonte largo.
- Comprensión de imágenes: acepta entradas texto + imagen (pipeline image-text-to-text), útil para análisis de diagramas y figuras científicas.
- Agentic workflows: diseñado para orquestación de agentes y ejecución de tareas largas con composición de capacidades.
- Tool calling / function calling: indicado en los tags del modelo (tool-use, agentic).
- Generación y comprensión de código (tag code).
- Formato conversacional (chat template aplicable vía processor).
- Servible como API compatible con OpenAI mediante `mlx_vlm.server`.

## Casos de uso

- Razonamiento científico local en Mac: ejecución de problemas científicos multi-paso (planteamiento, descomposición, verificación) directamente en Apple Silicon, sin enviar datos a la nube, adecuado para laboratorios con requisitos de privacidad.
- Análisis de diagramas y figuras: dado que acepta imágenes, puede analizar gráficas, esquemas experimentales o capturas de instrumentos y explicar los hallazgos clave en lenguaje natural.
- Agentes con uso de herramientas: integración en frameworks agénticos (LangChain, custom loops) donde el modelo planifica, invoca herramientas y evalúa resultados en cadenas largas de ejecución.
- Asistente de código con contexto visual: generación y revisión de código, incluyendo tareas donde el contexto incluye capturas de errores, diagramas de arquitectura o notebooks.
- API local compatible con OpenAI: despliegue de un servidor local en el puerto 8000 para integrar el modelo en aplicaciones existentes que ya usan el SDK de OpenAI, sin cambios de código relevantes.
- Prototipado de pipelines multimodales en dispositivos M-series: gracias al formato MLX y la cuantización 8-bit, es viable iterar en un MacBook con memoria unificada antes de escalar a infraestructura mayor.
- Atención al cliente o asistentes conversacionales multimodales: el formato conversacional y la capacidad de visión permiten construir asistentes que procesan tanto texto como imágenes enviadas por el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas; para datos de evaluación habría que consultar el paper de arXiv (2610.28578), cuyo contenido no está disponible aquí.

## Requisitos de hardware

- Memoria requerida: el repo pesa 37,7 GB en 8 bits, por lo que se necesita un Mac Apple Silicon con al menos 48 GB de memoria unificada para ejecutarlo con holgura (un modelo de ~35B en 8-bit más el componente de visión y el KV cache no cabe de forma práctica en 32 GB).
- Hardware: exclusivamente Apple Silicon (Mac M-series) con memoria unificada; esta versión MLX no está pensada para GPUs NVIDIA.
- Consumer hardware: viable en MacBook Pro / Mac Studio con chips M2/M3/M4 Max o Ultra y 48-128 GB de memoria unificada. No cabe en GPUs de consumo típicas (RTX 4090 con 24 GB).
- Despliegue: `mlx-vlm` (CLI `mlx_vlm.generate`, API Python y servidor `mlx_vlm.server` compatible con OpenAI). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI en esta versión.
- Latencia y throughput: no disponibles. Al tener ~3B parámetros activos, la velocidad de generación debería ser alta en Apple Silicon, pero no hay cifras publicadas.
- Parámetros de muestreo recomendados: temperature 0,8; top_p 0,95; top_k 40; min_p 0,05; presence_penalty 1,5; repetition_penalty 1,1.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Vision | Licencia | Formato/Plataforma |
|---|---|---|---|---|---|
| Sage-A1.5-35B-A3B-8bit-MLX | 35B (~3B activos) | MoE VLM | Si | Apache 2.0 | MLX 8-bit (Apple Silicon) |
| Qwen3-30B-A3B | 30B (~3B activos) | MoE | No (version texto) | Apache 2.0 | Safetensors, GGUF, multiplataforma |
| Qwen2.5-VL-32B-Instruct | 32B (denso) | Transformer denso VLM | Si | Apache 2.0 | Safetensors, GGUF, multiplataforma |

Nota: la comparativa se basa en modelos de la misma familia arquitectónica y rango de tamaño, ya que no hay benchmarks publicados de Sage-A1.5 en la información disponible para comparar rendimiento. La ventaja diferencial de esta versión es la optimización nativa para Apple Silicon; la desventaja es que solo es ejecutable con mlx-vlm, mientras que las alternativas tienen un ecosistema de despliegue más amplio.

## Limitaciones y advertencias

- Requiere hardware Apple Silicon con memoria unificada elevada (recomendable 48 GB o más); no es ejecutable en la mayoría de equipos ni en GPUs NVIDIA con esta versión MLX.
- La longitud de contexto no está documentada en la model card, lo que dificulta planificar tareas con documentos largos.
- Los idiomas soportados no están especificados; conviene validar el rendimiento en castellano antes de uso en producción.
- Al ser una cuantización de 8 bits realizada por un tercero (KeyAI-LLM), puede haber una ligera degradación respecto al modelo original en bf16; no se publican evaluaciones de la versión cuantizada.
- Repositorio con muy poca tracción (74 descargas, 1 like en el momento de la ficha), sin historial comunitario que avale la calidad de la conversión.
- Riesgo de alucinación: no cuantificado; como todo LLM, puede generar contenido incorrecto con apariencia plausible, especialmente en dominios científicos.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque debe respetarse la cita del trabajo original solicitada por los autores.
- Los parámetros de muestreo recomendados incluyen presence_penalty 1,5 y repetition_penalty 1,1, valores agresivos que pueden degradar tareas que requieren repetición deliberada (código con patrones repetitivos, por ejemplo).

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/KeyAI-LLM/Sage-A1.5-35B-A3B-8bit-MLX
- Modelo original: https://huggingface.co/InternScience/Sage-A1.5
- Paper (arXiv): https://arxiv.org/abs/2610.28578
- Herramienta de conversión (mlx-vlm): https://github.com/Blaizzy/mlx-vlm

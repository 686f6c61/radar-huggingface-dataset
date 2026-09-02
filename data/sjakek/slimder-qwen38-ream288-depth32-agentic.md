# sjakek/slimder-qwen38-ream288-depth32-agentic

## Resumen

El modelo `sjakek/slimder-qwen38-ream288-depth32-agentic` es un checkpoint experimental de investigación derivado de `sjakek/slimder-qwen38-reap384-depth32-mb2-3-4-5`, que a su vez se basa en la arquitectura Qwen3.8. Se trata de un modelo de mezcla de expertos (MoE) con 32 capas transformer y 288 expertos enrutados por capa, comprimido desde los 384 originales mediante una técnica de fusión de expertos denominada REAM (probablemente "Router-aware Expert Merging" o similar). El objetivo declarado es reducir el número de parámetros enrutados manteniendo el comportamiento agéntico del modelo original, con una calibración específica ponderada hacia tareas de tool calling, ejecución de código, recuperación y razonamiento multi-paso.

El modelo tiene 100.215.778.560 parámetros totales (según los pesos en safetensors), lo que lo sitúa en la categoría de los modelos grandes. No se indica el número de parámetros activos por token, pero al seleccionar 10 de 288 expertos por capa, se puede inferir que la activación es una fracción pequeña del total. La licencia es Apache 2.0, lo que permite uso comercial y modificación. El autor advierte explícitamente que es un checkpoint de investigación sin evaluación exhaustiva de seguridad ni rendimiento en producción, por lo que su uso debe ser cauteloso.

La relevancia de este modelo radica en su enfoque de compresión estructural de MoE: en lugar de podar o cuantizar, fusiona expertos similares por capa, preservando la funcionalidad agéntica. Esto podría ser de interés para investigadores que buscan reducir el coste de inferencia de modelos MoE grandes sin perder capacidades críticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 32 capas, 288 expertos enrutados por capa, 10 expertos activos por token |
| Parametros totales | 100.215.778.560 (100,2B) |
| Parametros activos | No disponible (10 de 288 expertos por capa, sin dato oficial de activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo incluye tags GGUF, pero no se especifican tipos concretos) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (y posiblemente GGUF según tags, sin confirmar) |

## Arquitectura y entrenamiento

El modelo es un MoE (Mixture of Experts) con 32 capas transformer. Cada capa contiene 288 slots de expertos enrutados, de los cuales se seleccionan 10 por token. Los pesos están en BF16. La compresión se realizó mediante un proceso de agrupamiento y fusión de expertos independiente por capa, utilizando una métrica de similitud REAM con salidas del router, similitud con puerta (gated similarity), ponderación por saliencia REAP y propagación secuencial de estado oculto. El resultado conserva 288 de los 384 expertos originales por capa.

La calibración se llevó a cabo con 1.024 secuencias de longitud 512, distribuidas de forma ponderada hacia comportamientos agénticos: 384 secuencias de tool calling, 256 de tareas ejecutables/código, 128 de recuperación, 128 de razonamiento multi-paso y 128 de lenguaje general. No se proporciona información sobre el preentrenamiento del modelo base, el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO. El método de compresión es la innovación principal, aunque no se detallan los fundamentos teóricos de REAM/REAP en la documentación disponible.

## Capacidades

- Generación de texto conversacional y de propósito general, según el pipeline declarado (`text-generation`).
- Tool calling y function calling, ya que la calibración incluye 384 secuencias específicas de tool calling.
- Ejecución de código y tareas ejecutables, con 256 secuencias de calibración dedicadas.
- Recuperación de información (retrieval), con 128 secuencias de calibración.
- Razonamiento multi-paso, con 128 secuencias de calibración.
- Capacidad agéntica general, orientada a agentes autónomos que requieren planificación y uso de herramientas.
- No se mencionan capacidades multimodales (visión, audio) ni modo de pensamiento explícito.

## Casos de uso

- Agentes autónomos de atención al cliente: el modelo puede gestionar conversaciones multi-turno que requieren consultar bases de conocimiento o APIs externas, gracias a su calibración en tool calling y recuperación. Su naturaleza MoE permitiría enrutar eficientemente las consultas hacia los expertos relevantes, aunque el tamaño total (100B) exige infraestructura de varias GPUs.
- Asistentes de programación con ejecución de código: la calibración incluye tareas de código, por lo que podría integrarse en entornos de desarrollo para generar, revisar o ejecutar fragmentos de código, siempre que se valide su seguridad en entornos controlados.
- Pipeline de automatización de tareas empresariales: combinando tool calling y razonamiento multi-paso, el modelo podría orquestar flujos de trabajo que requieren llamadas a APIs, consultas a bases de datos y toma de decisiones intermedias.
- Sistemas de recuperación aumentada por generación (RAG): dado su énfasis en retrieval, puede utilizarse como generador en sistemas RAG para responder preguntas con contexto externo, aunque su tamaño limita su despliegue a entornos con GPUs de alta capacidad.
- Investigación en compresión de MoE: el propio checkpoint sirve como caso de estudio para evaluar la efectividad de la fusión de expertos con REAM, comparando su rendimiento con el modelo original de 384 expertos.
- Prototipos de agentes de razonamiento largo: su calibración en multi-step reasoning lo hace candidato para tareas de planificación y resolución de problemas complejos, siempre que se valide su estabilidad en horizontes largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona que "se registran pruebas de integridad estructural y de generación" en un repositorio de ejecución vinculado, pero no se ofrecen métricas cuantitativas (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 100,2B parámetros en BF16, el modelo requiere aproximadamente 200 GB de VRAM solo para los pesos (100B × 2 bytes). Con overhead de inferencia, se necesitan al menos 4 GPUs de 80 GB (por ejemplo, A100 80GB o H100) para cargar el modelo completo.
- En cuantización de 8 bits (si estuviera disponible, aunque no se confirma), la VRAM bajaría a ~100 GB, permitiendo 2 GPUs de 80GB; en 4 bits, ~50 GB, cabría en una sola GPU de 80GB, pero no hay información de cuantizaciones disponibles.
- GPU recomendadas: A100 80GB, H100 80GB o equivalentes con memoria suficiente. No se espera que quepa en GPUs de consumo (RTX 4090, 24GB) sin cuantización extrema.
- Opciones de despliegue: dado que el repo incluye tags GGUF, es plausible que se pueda usar con llama.cpp u Ollama, pero no hay instrucciones. Para despliegue a gran escala, vLLM o TGI serían opciones habituales, aunque no se confirma compatibilidad.
- Latencia y throughput: no disponibles. Al ser un MoE con 10 expertos activos de 288, la inferencia es computacionalmente más ligera que un modelo denso equivalente, pero el tamaño total sigue siendo alto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Estructuralmente, se puede comparar con otros MoE grandes de la familia Qwen, como Qwen3.8-Flash-Next (176B totales, 6B activos) o Qwen3.8-Max (2,4T), pero este modelo es un checkpoint derivado y comprimido, no un lanzamiento oficial. La comparación más relevante sería contra su modelo base de 384 expertos, pero no se ofrecen métricas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint experimental de investigación: el propio autor indica que "aún requiere una evaluación más amplia de comportamiento agéntico, ejecución de código, uso de herramientas, recuperación, horizonte largo y seguridad antes de su uso en producción".
- No se han publicado benchmarks de rendimiento, por lo que no se puede verificar la calidad de las respuestas ni la degradación introducida por la compresión.
- No se especifica el contexto máximo soportado; la calibración usa secuencias de 512 tokens, pero el modelo base podría soportar más. No se recomienda asumir contextos largos sin verificación.
- Sesgos y alucinaciones: no hay información sobre sesgos específicos, pero al ser un modelo derivado de Qwen, es probable que herede sesgos de su preentrenamiento. La calibración agéntica podría aumentar el riesgo de alucinaciones en tareas de tool calling si no se valida.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de seguridad ni soporte.
- Tamaño del repo: 309.8 GB, lo que requiere espacio de almacenamiento considerable.
- No hay información sobre idiomas soportados; se asume que hereda los del modelo base, pero no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sjakek/slimder-qwen38-ream288-depth32-agentic
- Repositorio de artefactos de ejecución (run artifacts): `sjakek/slimder-qwen38-agentic-ream-runs-20260901` (referenciado en la model card, sin URL directa)
- Modelo base: https://huggingface.co/sjakek/slimder-qwen38-reap384-depth32-mb2-3-4-5

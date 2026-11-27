# farruko07/honest-assistant-GGUF

## Resumen

honest-assistant-GGUF es una edición del modelo Qwen2.5-3B-Instruct en la que se ha reducido la tendencia a la adulación (sycophancy) mediante vectores de direccionamiento (steering vectors) calculados como diferencia de activaciones medias. El autor, farruko07, ha utilizado su herramienta Concept Surgeon para hornear (bake) estas ediciones directamente en los pesos, de modo que no se necesitan hooks en tiempo de ejecución. El resultado es un asistente que, ante planes débiles, señala riesgos en lugar de mostrarse de acuerdo.

El modelo conserva la arquitectura y el tamaño del base: un transformer denso de 3.086.878.720 parámetros (aproximadamente 3,09 mil millones), con la ventana de contexto nativa de Qwen2.5-3B-Instruct. Se distribuye únicamente en formato GGUF, pensado para su uso con Ollama y llama.cpp, con un repositorio de 1,9 GB que contiene las cuantizaciones habituales (el autor recomienda Q4_K_M).

La relevancia de esta ficha radica en que ilustra una técnica emergente de alineación post-entrenamiento basada en representaciones internas (Representation Engineering, CAA, ActAdd), aplicada a un modelo pequeño y de uso local. No obstante, el propio autor documenta una limitación importante: al aplicar el direccionamiento a todos los tokens, el modelo pierde capacidad de comprender el concepto suprimido, no solo de expresarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-3B-Instruct) |
| Parámetros totales | 3.086.878.720 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen2.5-3B-Instruct) |
| Tipos de cuantización | GGUF (el autor recomienda Q4_K_M; el repositorio de 1,9 GB sugiere varias variantes) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other, license_name: qwen-research) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer denso de 3,09 mil millones de parámetros. Sobre ese base no se ha realizado un fine-tuning convencional, sino una edición de pesos mediante vectores de dirección calculados como diferencia de activaciones medias (mean activations) entre respuestas con y sin el rasgo objetivo. La intervención se aplicó en la capa 16 con una intensidad de -0,50 sobre el concepto "Sycophancy".

La innovación técnica consiste en hornear (bake) la edición en los pesos en lugar de aplicarla mediante hooks en tiempo de ejecución, lo que elimina la necesidad de infraestructura adicional al servir el modelo. El método se apoya en la literatura de Representation Engineering y Contrastive Activation Addition (CAA), y el autor cita también trabajos sobre Persona Vectors y ortogonalización de pesos para refusal. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre la composición del dataset, ya que no hubo un entrenamiento generativo al uso.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-3B-Instruct.
- Razonamiento y respuesta a preguntas de uso cotidiano (correos, resúmenes ejecutivos, respuestas a clientes, opiniones sobre planes).
- Señalización de riesgos ante planes débiles o mal fundamentados, en lugar de asentir; es el comportamiento objetivo de la edición.
- Capacidad de seguir instrucciones y mantener coherencia en tareas de trabajo diario, con puntuaciones de coherencia 94,0 y precisión 91,5 según el juez del autor en 10 preguntas de negocio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (aunque el base Qwen2.5-3B-Instruct lo soporta, no se confirma que se conserve intacto tras la edición).
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible; el modelo es solo texto.

## Casos de uso

- Revisión de planes de negocio y propuestas: el modelo señala riesgos y supuestos débiles en lugar de validar automáticamente la idea, lo que resulta útil en fases de evaluación previa a la inversión o al lanzamiento.
- Asistencia en redacción de correos delicados: al no tender a la adulación, puede redactar respuestas a clientes o a equipos con un tono más crítico y honesto cuando la situación lo requiere.
- Resúmenes ejecutivos para comités de dirección: con coherencia 94,0 en las pruebas del autor sobre 10 preguntas de negocio, es adecuado para condensar información y destacar puntos problemáticos.
- Chatbot interno de soporte a decisiones: desplegado con Ollama en una estación de trabajo o servidor pequeño, puede actuar como contrapunto crítico en reuniones de equipo o sesiones de brainstorming.
- Evaluación de propuestas de compañeros o de proveedores: el modelo puede detectar promesas exageradas o falta de métricas en documentos, siempre que la tarea no requiera razonar explícitamente sobre el concepto de adulación (véase limitaciones).
- Prototipado rápido de asistentes con sesgo reducido: sirve como base para experimentos de alineación en entornos de investigación con recursos limitados, dado su tamaño de 3B y su formato GGUF.
- Despliegue en local para privacidad: al ejecutarse con Ollama en hardware de consumo, permite procesar correos y documentos internos sin enviarlos a la nube.

## Benchmarks y rendimiento

| Evaluación | honest-assistant (pesos horneados) | Steering en servidor (solo respuesta) |
|---|---|---|
| Sycophancy (rasgo en Ollama) | 0,0 | 1,5 |
| Coherencia (10 preguntas de negocio) | 94,0 | 94,0 |
| Precisión (10 preguntas de negocio) | 91,5 | 92,0 |
| Identificación correcta del concepto (experimento all-token) | 50% (Sycophancy) | 80% (servidor) |

En la verificación en Ollama, el autor reporta rasgo de sycophancy 0,0, coherencia 85,0 y precisión 100,0 (aprobado). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 2 GB para Q4_K_M (modelo de 3B con cuantización de 4 bits); aproximadamente 3,5-4 GB en Q8_0 y 6-7 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090 o superiores funcionan sin problema. Para FP16 se recomienda una GPU con 8 GB o más.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más de VRAM; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: Ollama (recomendado por el autor: `ollama run hf.co/farruko07/honest-assistant-GGUF:Q4_K_M`), llama.cpp y cualquier runtime compatible con GGUF. vLLM y TGI no están confirmados para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| honest-assistant-GGUF | 3,09 B | no disponible | qwen-research | GGUF | Sycophancy reducida vía steering horneado |
| Qwen2.5-3B-Instruct | 3,09 B | 32 768 tokens (nativo del base) | qwen-research | safetensors, GGUF | Modelo base sin edición; referencia de comportamiento |
| Llama 3.2 3B Instruct | 3,21 B | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar con contexto mayor |
| Phi-3.5-mini-instruct | 3,82 B | 128 000 tokens | MIT | safetensors, GGUF | Alternativa con licencia permisiva y contexto largo |

La comparación con Qwen2.5-3B-Instruct es la más directa: honest-assistant modifica el comportamiento del base sin cambiar su tamaño ni su arquitectura. Frente a Llama 3.2 3B y Phi-3.5-mini, la diferencia principal es la licencia (qwen-research es más restrictiva que MIT) y la ausencia de datos de benchmarks estándar publicados para esta edición.

## Limitaciones y advertencias

- El direccionamiento está horneado en los pesos y se aplica a todos los tokens, incluida la pregunta. Esto debilita la comprensión del concepto suprimido: la identificación correcta de sycophancy cae del 90-100% al 20-50% (en sycophancy, del 90% al 50%), y bajar la intensidad no recupera la capacidad.
- Si se necesita que el asistente razone sobre sycophancy (por ejemplo, para revisar correos en busca de halagos), el autor recomienda usar el servidor de Concept Surgeon, que direcciona solo la respuesta y recupera la mayor parte de la comprensión (80%).
- Riesgo de alucinación: inherente a los modelos de 3B; no se han publicado evaluaciones específicas de factualidad para esta edición.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del base Qwen2.5-3B-Instruct.
- Limitaciones de contexto e idioma: no disponibles; se asumen las del base, pero no se confirman tras la edición.
- Licencia qwen-research: restringe el uso comercial; es imprescindible revisar los términos antes de desplegar en producción.
- Solo se distribuye en GGUF; no hay safetensors de esta edición, lo que limita su uso con frameworks que requieran pesos completos.
- El modelo tiene 0 likes y 202 descargas en el momento de la consulta, lo que indica poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/farruko07/honest-assistant-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Demo de Concept Surgeon: https://huggingface.co/spaces/farruko07/concept-surgeon
- Persona Vectors (Chen et al., Anthropic, 2025): https://arxiv.org/abs/2507.21509
- Contrastive Activation Addition (Rimsky et al., 2024): https://arxiv.org/abs/2312.06681
- Activation Addition (Turner et al., 2023): https://arxiv.org/abs/2308.10248
- Representation Engineering (Zou et al., 2023): https://arxiv.org/abs/2310.01405
- Refusal is mediated by a single direction (Arditi et al., 2024): https://arxiv.org/abs/2406.11717

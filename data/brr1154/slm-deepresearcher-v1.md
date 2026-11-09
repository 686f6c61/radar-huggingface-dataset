# BRR1154/SLM-DeepResearcher-v1

## Resumen

SLM-DeepResearcher-v1 es un modelo de lenguaje de 494 millones de parámetros (492 M según la model card) publicado por el usuario BRR1154 bajo la organización Runtime-Slayers. Se trata de un ajuste fino del modelo base Qwen/Qwen2.5-0.5B-Instruct, orientado a la síntesis de literatura académica multi-paso siguiendo el protocolo PRISMA 2020, con detección de contradicciones entre estudios y auditorías de sesgo. El modelo se presenta como parte de un supuesto «Runtime-Slayers Autonomous SLM Swarm Engine» que operaría en coordinación con orquestadores de frontera.

La propuesta técnica declarada por el autor es una «cirugía de pesos» mediante edición de modelo en subespacio nulo con ortogonalización de Gram-Schmidt, con la restricción matemática ΔW · V_base = 0, que en teoría preservaría las capacidades del modelo base (zero-forgetting) mientras se inyecta la especialización. No se aportan detalles sobre el dataset de ajuste, el número de tokens de entrenamiento, la metodología de evaluación ni resultados de benchmarks.

El modelo es relevante únicamente como ejemplo de ajuste fino de un SLM (small language model) sobre una base Qwen2.5 de 0.5B para una tarea vertical concreta. Su utilidad práctica es muy limitada: no hay evidencia publicada de rendimiento, el repositorio no tiene descargas ni interacciones, y varias afirmaciones de la model card no son verificables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 (492 M según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-0.5B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de inferencia usa float32) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0.5B parámetros con atención causal estándar y tokenizador BPE multilingüe. Sobre esa base, el autor declara haber aplicado una técnica de edición de pesos denominada «Gram-Schmidt Subspace Null-Space Model Editing», que proyecta la actualización ΔW sobre el subespacio nulo de las representaciones del modelo base para, teóricamente, evitar el olvido catastrófico. No se especifica qué capas se editaron, el rango de las actualizaciones, el volumen de datos de ajuste ni si se empleó SFT, DPO o RLHF.

La model card no documenta la composición del dataset de entrenamiento, el número de tokens vistos, la procedencia de los datos académicos ni el proceso de anotación. Tampoco se detalla el pipeline de evaluación ni se aportan métricas de retención de capacidades del modelo base tras la edición. La afirmación de «zero-forgetting» es una propiedad teórica declarada, no una medición empírica publicada.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Síntesis de literatura académica multi-base de datos según el protocolo PRISMA 2020 (capacidad declarada, sin evidencia publicada).
- Detección de contradicciones entre estudios (declarada).
- Auditoría de sesgo en revisiones (declarada).
- Soporte de plantilla de chat mediante `apply_chat_template` (formato Qwen2.5).
- Tool calling / function calling: no disponible de forma explícita en la model card.
- Capacidades de agente multi-paso: declaradas de forma genérica, sin especificación de protocolo.
- Capacidades multilingües: limitadas a inglés según el campo `language`.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Revisión sistemática de literatura asistida: el modelo podría generar borradores de secciones metodológicas y de resultados siguiendo la checklist PRISMA 2020, aunque la ausencia de benchmarks hace necesaria una validación manual exhaustiva antes de cualquier uso real.
- Triaje de abstracts: con 0.5B parámetros y ejecución en CPU o GPU de gama baja, podría clasificar y resumir abstracts en lotes para priorizar lecturas, siempre con revisión humana.
- Detección preliminar de contradicciones: como generador de candidatos de discrepancia entre estudios que un investigador revisaría después, no como fuente de verdad.
- Prototipado de pipelines de agentes de investigación: sirve como componente ligero en un sistema mayor donde un modelo de frontera orqueste y este SLM ejecute subtareas de extracción o resumen.
- Despliegue en entornos con recursos limitados: al ocupar menos de 2 GB en float32, puede ejecutarse en hardware modesto para tareas de generación de texto acotadas.
- Docencia y experimentación con edición de pesos: útil como caso de estudio de técnicas de model editing sobre un base conocido, no como herramienta de producción.
- Generación de borradores de protocolos de revisión: plantillas estructuradas de criterios de inclusión/exclusión y estrategias de búsqueda, sujetas a revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 2 GB para los pesos (494 M parámetros × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en float16/bfloat16: aproximadamente 1 GB para los pesos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,5 GB; en 4 bits, aproximadamente 0,25 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o superior ofrece margen amplio. También cabe en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2-4 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (probado por el autor), text-generation-inference (tag `text-generation-inference` presente), llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| SLM-DeepResearcher-v1 | 494 M | no disponible | apache-2.0 | Literatura académica / PRISMA | Repositorio sin descargas ni evidencia |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (según documentación de Qwen) | apache-2.0 | Propósito general | Ampliamente usado y evaluado |
| Qwen2.5-1.5B-Instruct | 1.540 M | 32.768 tokens (según documentación de Qwen) | apache-2.0 | Propósito general | Ampliamente usado y evaluado |
| SmolLM2-360M-Instruct | 360 M | 8.192 tokens (según documentación de HuggingFace) | apache-2.0 | Propósito general | Ampliamente usado y evaluado |

La comparativa evidencia que el modelo de BRR1154 no aporta métricas verificables frente a su propio modelo base, que ya está disponible y evaluado. Cualquier elección de producción debería partir del base Qwen2.5-0.5B-Instruct salvo que se valide empíricamente la especialización declarada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base en tareas de síntesis de literatura.
- La afirmación de «zero-forgetting» es teórica y no está verificada empíricamente; el olvido catastrófico podría persistir pese a la proyección en subespacio nulo.
- Model card con referencias no verificables: menciona orquestadores como «NVIDIA Nemotron-3-Ultra 550B», «DeepSeek V4.1», «GLM-5.3», «MiniMax M3.1» y «Kimi K3.1 Pro», que no corresponden a modelos públicos conocidos en el momento de la ficha, lo que resta credibilidad al resto de afirmaciones.
- Riesgo elevado de alucinación en citas y referencias bibliográficas, agravado por el tamaño reducido del modelo (0.5B) y la ausencia de evaluación.
- Solo inglés: no apto para tareas en castellano sin ajuste adicional.
- Contexto no documentado: se desconoce si conserva los 32.768 tokens del base o si la edición lo ha alterado.
- Repositorio sin descargas ni interacciones: no hay comunidad que haya validado el checkpoint.
- Licencia apache-2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin auditoría previa.
- No se documenta el dataset de entrenamiento, lo que impide evaluar sesgos de composición, contaminación de benchmarks o cumplimiento de derechos de autor sobre textos académicos.

## Enlaces

- Hugging Face: https://huggingface.co/BRR1154/SLM-DeepResearcher-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Organización del autor: https://github.com/Runtime-Slayers
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
- Protocolo PRISMA 2020: https://www.prisma-statement.org/

# arcAman07/apex-coordinator-qwen1.5b

## Resumen

El modelo `arcAman07/apex-coordinator-qwen1.5b` es un fine-tune del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario arcAman07, especializado en la planificación de equipos de agentes de IA para tareas profesionales de horizonte largo. Su función principal es recibir una tarea compleja y emitir un único plan estructurado en JSON que especifica qué agentes deben ejecutarse en cada ronda (en paralelo o en serie) y cómo se enrutan los resultados entre ellos, optimizando así el flujo de trabajo de un sistema multiagente.

El modelo se entrenó en dos etapas: primero un warm-start mediante SFT (supervised fine-tuning) imitando planes de compromiso paralelo, y después un refinamiento con GRPO (group relative policy optimization) utilizando una recompensa protegida por un suelo mínimo, donde cada plan generado se ejecuta con agentes reales y se evalúa con un juez basado en rúbricas. Con solo 1.543.714.304 parámetros (1.5B), es un modelo compacto diseñado para ser usado como coordinador dentro de un harness multiagente, no como un generador de texto generalista.

Su relevancia radica en que demuestra que un modelo pequeño puede superar a sistemas secuenciales y a un agente único en tareas de planificación multiagente, logrando una puntuación de 0.760 (con Opus) y 0.795 (con GLM) en un conjunto de pruebas financieras de 64 tareas, frente a 0.71–0.73 del baseline secuencial y 0.29–0.32 del agente único. Está disponible bajo licencia Apache-2.0, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B-Instruct, típicamente 32.768 tokens, pero no confirmado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (model card no especifica; el modelo base Qwen2.5 soporta múltiples idiomas, pero no se confirma para este fine-tune) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención multi-cabeza, activación SwiGLU y embeddings rotatorios (RoPE). El fine-tune se realizó específicamente para la tarea de coordinación de agentes en el benchmark APEX-Agents, un conjunto de datos orientado a servicios profesionales de largo alcance. El entrenamiento consta de dos fases:

- **Etapa 1 (SFT)**: comportamiento de clonación de planes de compromiso paralelo, donde el modelo aprende a imitar planes generados por un sistema experto que decide qué agentes ejecutar en paralelo y cuáles en serie.
- **Etapa 2 (GRPO)**: optimización por política relativa de grupo con una recompensa protegida por un suelo (floor-protected reward). Cada plan muestreado se ejecuta con el equipo de agentes reales (Opus o GLM como trabajadores) y se puntúa mediante un juez basado en rúbricas. La recompensa incorpora un suelo mínimo para evitar colapsos de rendimiento durante el entrenamiento.

La inferencia se realiza con decodificación greedy de un único plan por tarea, sin muestreo estocástico. El modelo no está pensado para generar texto libre, sino para emitir estructuras JSON válidas que describen el plan de ejecución.

## Capacidades

- **Planificación multiagente**: genera un plan JSON con campos `batches` (lista de listas de agentes que se ejecutan en paralelo en cada ronda) y `routes` (mapeo de dependencias entre agentes).
- **Optimización de rutas críticas**: reduce la profundidad serial media (3.2 frente a 4.4 del baseline secuencial), lo que acelera la ejecución de tareas complejas.
- **Coordinación de equipos heterogéneos**: funciona con distintos agentes trabajadores (Opus, GLM), adaptándose al rendimiento del equipo subyacente.
- **Generación de texto estructurado**: emite salidas JSON válidas, aunque no está optimizado para conversación general.
- **Multilingüismo**: no confirmado, aunque el modelo base Qwen2.5 soporta múltiples idiomas; no hay datos específicos para este fine-tune.
- **Tool calling / function calling**: no documentado; el modelo se usa dentro de un harness externo, no directamente como agente con herramientas.

## Casos de uso

- **Automatización de flujos de trabajo en servicios financieros**: el modelo puede planificar la ejecución de tareas como extracción de métricas, cálculo de ratios y consulta de corpus documental, organizando los agentes en paralelo cuando no hay dependencias y en serie cuando las hay.
- **Orquestación de agentes en producción**: integrado en un sistema multiagente, el coordinador decide qué agentes lanzar en cada ronda, reduciendo el tiempo de cómputo total al paralelizar tareas independientes.
- **Optimización de pipelines de datos**: para tareas que requieren múltiples pasos (extraer, transformar, calcular), el modelo genera un plan que minimiza la profundidad serial, mejorando la latencia end-to-end.
- **Evaluación de estrategias de planificación**: los resultados del modelo (0.760–0.795) pueden servir como baseline para investigar técnicas de coordinación de agentes en benchmarks como APEX-Agents.
- **Sustitución de planificadores heurísticos**: en lugar de reglas manuales o secuencias fijas, el modelo aprende a adaptar el plan según la tarea, mejorando la precisión frente a sistemas secuenciales.
- **Investigación en RL para planificación**: el entrenamiento con GRPO y recompensa protegida ofrece un caso de estudio para aplicar aprendizaje por refuerzo a modelos pequeños en tareas de coordinación.

## Benchmarks y rendimiento

Según la model card, el modelo se evaluó en un conjunto de pruebas financieras de 64 tareas, utilizando el mismo juez basado en rúbricas. Los resultados se comparan con sistemas de referencia:

| Sistema (trabajadores) | Puntuación | Profundidad serial |
|---|---|---|
| Agente único | 0.29–0.32 | 1.0 |
| Secuencial | 0.71–0.73 | 4.4 |
| **Coordinador entrenado (este modelo)** | **0.760 (Opus) / 0.795 (GLM)** | 3.2 |

Además, se reporta una reproducibilidad con 5 semillas: 0.760 ± 0.035 (Opus) y 0.795 ± 0.016 (GLM). No se proporcionan resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está orientado a tareas generales de lenguaje.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 1.5B parámetros en FP16, requiere aproximadamente 3 GB de VRAM para inferencia (1.5B × 2 bytes). Con cuantización a 8 bits (~1.5 GB) o 4 bits (~0.8 GB) podría ejecutarse en GPUs con menos memoria, aunque no se han publicado cuantizaciones oficiales.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores). En entornos cloud, una T4 o L4 es suficiente.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de consumo medio y bajo, incluso en CPU con suficiente RAM (aunque más lento).
- **Opciones de despliegue**: dado que usa la librería transformers, puede servirse con vLLM, Text Generation Inference (TGI) o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se empaqueta adecuadamente.
- **Latencia y throughput**: no hay datos publicados, pero para un modelo de 1.5B en una GPU moderna (RTX 3090 o superior) se esperan latencias de decodificación de decenas de milisegundos por token y throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de coordinación de agentes comparables en el mismo rango de tamaño o con la misma especialización. La comparación más directa es con el modelo base Qwen2.5-1.5B-Instruct, que no está entrenado para emitir planes JSON estructurados y no tiene la capacidad de optimizar la profundidad serial. Otros modelos pequeños (por ejemplo, Llama-3.2-1B o Phi-3-mini) podrían adaptarse mediante fine-tuning, pero no existen datos públicos de comparación con este coordinador. Por tanto, la comparativa se limita a los resultados internos del benchmark APEX-Agents ya presentados.

## Limitaciones y advertencias

- **Especialización estrecha**: el modelo solo es útil para generar planes de coordinación en el formato específico de APEX-Agents. No sirve como generador de texto general, ni para tareas de chat o razonamiento abierto.
- **Dependencia del harness externo**: la calidad del plan depende de los agentes trabajadores (Opus, GLM) que ejecutan las tareas. El coordinador no ejecuta nada por sí mismo.
- **Riesgo de alucinación en formatos JSON**: aunque entrenado para emitir JSON, puede producir estructuras inválidas o rutas inexistentes si se usa fuera de su dominio de entrenamiento.
- **Sesgos y robustez**: no se han documentado estudios de sesgo ni pruebas de robustez ante entradas adversariales. El entrenamiento se limitó a tareas financieras, por lo que su generalización a otros dominios es incierta.
- **Reproducibilidad**: los resultados reportados (0.760 ± 0.035 y 0.795 ± 0.016) provienen de 5 semillas, pero no se detalla la variabilidad entre distintos conjuntos de tareas.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial sin obligación de compartir derivados, pero se debe mantener el aviso de copyright. No hay restricciones de uso militar o de alto riesgo especificadas.
- **Contexto y memoria**: al ser un modelo pequeño, la ventana de contexto efectiva puede ser limitada para tareas con muchos agentes o descripciones muy largas. No se ha verificado el contexto máximo real tras el fine-tune.

## Enlaces

- [HuggingFace - arcAman07/apex-coordinator-qwen1.5b](https://huggingface.co/arcAman07/apex-coordinator-qwen1.5b)
- [Dataset APEX-Agents (mencionado en la model card)](https://huggingface.co/datasets/mercor/apex-agents)
- [Modelo base Qwen2.5-1.5B-Instruct (referencia)](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)

# shirasko/qwen2.5-3b-instruct-rmu-uranium

## Resumen

Este repositorio contiene un checkpoint de desaprendizaje (unlearning) del modelo Qwen/Qwen2.5-3B-Instruct, desarrollado por el usuario shirasko. El objetivo es eliminar selectivamente el conocimiento relacionado con el concepto "uranio" mediante el método Representation Misdirection for Unlearning (RMU). Se trata de un modelo de generación de texto basado en la arquitectura transformer de Qwen2.5, con 3.085.938.688 parámetros, y está pensado para investigar técnicas de alineación y seguridad en modelos de lenguaje.

La relevancia de este modelo radica en que aborda un problema crítico en el despliegue de LLMs: la capacidad de eliminar información peligrosa o no deseada sin degradar el rendimiento general. Las métricas reportadas muestran una eficacia de desaprendizaje del 65,1% en el conjunto de test (protocolo MC), con una especificidad del 98,5%, lo que indica que el modelo conserva la mayoría de sus capacidades generales mientras reduce significativamente la respuesta a preguntas sobre uranio. Es un recurso útil para la comunidad de investigación en seguridad de IA, aunque no está pensado para uso productivo directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 32.768 tokens, pero no se especifica para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se proporcionan pesos en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer causal con atención por grupos (GQA), activación SwiGLU, normalización RMSNorm y embeddings rotatorios (RoPE). El proceso de desaprendizaje aplica el método RMU (Representation Misdirection for Unlearning), que modifica las representaciones internas en las capas 10, 11 y 12 (según la configuración `S3_lid12_L101112`) para que el modelo deje de producir información sobre el concepto objetivo. Los hiperparámetros incluyen un factor de dirección `steering` de 1000, un `alpha` de 30 y una tasa de aprendizaje de 0.0001. No se especifican los datos de entrenamiento utilizados para el desaprendizaje, pero el protocolo de evaluación incluye conjuntos de entrenamiento y test separados.

El checkpoint se seleccionó según un criterio de media armónica entre eficacia y especificidad, alcanzando un valor de 0.784 en test. El entrenamiento se realizó con un rango (rank) de 100 y semilla 42. No se menciona el uso de RLHF ni DPO; el desaprendizaje es un ajuste fino supervisado sobre las representaciones internas.

## Capacidades

- Generación de texto en inglés con instrucciones, manteniendo las capacidades generales del modelo base (razonamiento, conocimiento general, etc.).
- Desaprendizaje específico del concepto "uranio": el modelo reduce drásticamente la probabilidad de responder correctamente a preguntas sobre este tema (eficacia 0.651 en test).
- Conservación de habilidades generales: la precisión en MMLU se mantiene en 0.612 (test), frente a 0.623 del baseline, lo que indica una degradación mínima.
- No se reportan capacidades de tool calling, agentes, visión ni audio. Es un modelo puramente textual.
- El protocolo de evaluación incluye tareas de QA y SimDom (similitud de dominios), con una precisión de 0.76 en SimDom tras el desaprendizaje, superior al baseline (0.7).

## Casos de uso

- Investigación en seguridad y alineación de LLMs: permite estudiar cómo el desaprendizaje afecta a la representación interna del conocimiento y a la capacidad de generalización. Se puede usar como punto de partida para comparar métodos de unlearning.
- Evaluación de robustez de técnicas de desaprendizaje: el checkpoint incluye métricas detalladas (eficacia, especificidad, media armónica) que facilitan la reproducción de experimentos y la comparación con otros métodos.
- Pruebas de "relearning": el modelo reporta una métrica de relearning QA (MC) de 0.4, lo que permite investigar si el conocimiento eliminado puede reaprenderse fácilmente, un aspecto crítico para la seguridad.
- Desarrollo de sistemas de filtrado de contenido: aunque no es un filtro perfecto, puede servir como base para construir sistemas que bloqueen información sensible sobre materiales peligrosos.
- Benchmarking de modelos de unlearning: al estar basado en un modelo abierto y conocido (Qwen2.5-3B), facilita la comparación con otros checkpoints de desaprendizaje sobre la misma base.
- Educación y divulgación: útil para demostrar en entornos académicos cómo funcionan las técnicas de desaprendizaje y sus limitaciones.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación comparando el baseline (Qwen2.5-3B-Instruct) con el checkpoint desaprendido, tanto en entrenamiento como en test. Se presentan los datos del protocolo MC (multiple choice) y métricas adicionales.

| Metrica | Baseline (test) | Desaprendido (test) |
|---|---|---|
| QA accuracy | 0.68 | 0.4 |
| QA fraction | 1 | 0.349 |
| SimDom accuracy | 0.7 | 0.76 |
| SimDom fraction | 1 | 1 |
| MMLU accuracy | 0.623 | 0.612 |
| MMLU fraction | 1 | 0.971 |

Además, las métricas principales de desaprendizaje en test son: eficacia 0.651, especificidad 0.985 y media armónica 0.784. La métrica de relearning QA (MC) es 0.4. No se han publicado resultados comparativos con otros modelos de unlearning en la información disponible.

## Requisitos de hardware

- El modelo tiene 3.085 millones de parámetros, por lo que en precisión fp16 ocupa aproximadamente 6,2 GB de VRAM (tamaño del repositorio). Cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores.
- Para inferencia en fp16, se recomienda al menos 8 GB de VRAM. Con cuantización a 8 bits o 4 bits (no proporcionada en el repositorio, pero posible mediante herramientas externas), se podría ejecutar en GPUs con 4-6 GB.
- Opciones de despliegue: al ser un modelo de la familia transformers, es compatible con vLLM, llama.cpp (si se convierten los pesos a GGUF), Ollama, TGI y cualquier framework que soporte modelos de Hugging Face.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 3B, en una GPU moderna se espera una latencia de decodificación de unos 20-50 ms por token y un throughput de 50-100 tokens/s en fp16, dependiendo del hardware y la optimización.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base Qwen2.5-3B-Instruct, del cual deriva. No se dispone de información sobre otros checkpoints de unlearning con la misma base o método.

| Modelo | Parametros | Contexto | MMLU (test) | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (baseline) | 3,09 B | 32.768 (según documentación oficial) | 0.623 | Apache 2.0 | Modelo original sin desaprendizaje |
| shirasko/qwen2.5-3b-instruct-rmu-uranium | 3,09 B | no disponible | 0.612 | no disponible | Checkpoint con desaprendizaje de uranio |

No se han encontrado otros modelos de unlearning comparables en la información proporcionada.

## Limitaciones y advertencias

- El desaprendizaje no es perfecto: la eficacia en test es de 0.651, lo que significa que en aproximadamente un 35% de las preguntas sobre uranio el modelo aún puede proporcionar información correcta.
- La especificidad es alta (0.985), pero no absoluta; existe un pequeño riesgo de que el modelo se niegue a responder preguntas no relacionadas con el concepto objetivo.
- La métrica de relearning QA (0.4) sugiere que el conocimiento eliminado puede reaprenderse con relativa facilidad, lo que limita su uso como mecanismo de seguridad a largo plazo.
- No se especifica la licencia del checkpoint, por lo que su uso comercial es incierto. El modelo base es Apache 2.0, pero el autor no ha declarado una licencia para este derivado.
- El modelo solo está entrenado para inglés; no se garantiza su funcionamiento en otros idiomas.
- No se proporcionan pesos cuantizados ni instrucciones de despliegue específicas; el usuario debe convertir los pesos si necesita formatos como GGUF.
- Al ser un modelo de investigación, no se recomienda su uso en producción sin una evaluación exhaustiva de riesgos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/shirasko/qwen2.5-3b-instruct-rmu-uranium
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Documentación de Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B

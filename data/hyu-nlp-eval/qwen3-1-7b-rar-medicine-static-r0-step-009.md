# HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-009

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-009` es un checkpoint de política intermedio obtenido durante un experimento de optimización con aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3-1.7B`. Lo desarrolla el grupo HYU-NLP-EVAL (Hanyang University NLP Evaluation Lab) como parte de un estudio sobre la saturación de recompensas y la obsolescencia de rúbricas estáticas en el entrenamiento con GRPO. El checkpoint corresponde al paso 9 de optimización en el dominio de medicina (RaR Medicine), con una recompensa congelada basada en una rúbrica inicial específica del prompt (R0).

Se trata de un artefacto de investigación, no de un modelo de producción. Su propósito es analizar cómo evoluciona la política cuando la señal de recompensa permanece fija y no se actualiza durante el entrenamiento. El modelo tiene aproximadamente 1.720 millones de parámetros, usa la arquitectura Qwen3 (transformers decoder-only) y se distribuye en formato safetensors con precisión BF16. No se proporcionan datos sobre la longitud de contexto, idiomas soportados ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformers decoder-only, basada en Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos BF16 en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `Qwen/Qwen3-1.7B` en su revisión `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`. La arquitectura es la estándar de Qwen3: un transformer decoder-only con atención causal, diseñado para generación de texto y tareas conversacionales. No se especifican detalles adicionales como el número de capas o cabezas de atención en la información proporcionada.

El entrenamiento utiliza el algoritmo GRPO (Group Relative Policy Optimization) con una señal de recompensa estática: una rúbrica inicial congelada específica de cada prompt (R0), que no se actualiza durante la optimización. El dominio de entrenamiento es "RaR Medicine" (Reasoning and Reinforcement en medicina), con semilla 11. El checkpoint exportado incluye pesos del modelo, configuración, tokenizador y plantilla de chat, pero excluye optimizador, scheduler, estado del entrenador, rollouts, rúbricas y datos de evaluación. No se menciona el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional: el modelo hereda las capacidades del base Qwen3-1.7B para mantener diálogos multi-turno.
- Razonamiento aplicado a dominios médicos: entrenado con rúbricas específicas del dominio de medicina, aunque no se detallan las tareas concretas.
- Compatible con el pipeline de transformers para text-generation.
- Capacidad de carga mediante `AutoModelForCausalLM` y `AutoTokenizer` con dtype bfloat16.
- No se reportan capacidades adicionales como tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Investigación en RLHF/GRPO: analizar cómo la política se degrada o satura cuando la recompensa es estática, comparando checkpoints de distintos pasos.
- Estudio de la obsolescencia de rúbricas (rubric staleness): evaluar el efecto de no actualizar la señal de recompensa durante el entrenamiento en dominios especializados.
- Reproducción de experimentos: servir como punto de referencia para replicar el pipeline de entrenamiento con GRPO y rúbricas estáticas.
- Análisis de la dinámica de optimización: inspeccionar la evolución del modelo en pasos tempranos (step 9 de 48 previstos) para entender la curva de aprendizaje.
- Benchmark de alucinación en dominios médicos: probar si el modelo genera información factualmente incorrecta tras el entrenamiento con recompensa estática.
- Evaluación de la transferencia de conocimiento: comparar el rendimiento del checkpoint con el modelo base en tareas médicas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio médico.

## Requisitos de hardware

- VRAM estimada: no disponible en la información oficial. El tamaño del repositorio es de 3.5 GB, lo que sugiere que los pesos en BF16 ocupan aproximadamente 3.4 GB (1.720.574.976 parámetros × 2 bytes). Se puede inferir que una GPU con al menos 6 GB de VRAM podría cargar el modelo en BF16, pero esto es una estimación no confirmada por el autor.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPUs de consumo: probablemente sí, dado el tamaño de parámetros, pero no hay datos confirmados.
- Opciones de despliegue: se puede cargar con `transformers` en Python; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría (p. ej., otros checkpoints de Qwen3-1.7B con RL o modelos médicos de tamaño similar).

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo de producción y no debe usarse para tareas reales sin una evaluación exhaustiva.
- No es un dispositivo médico: los checkpoints del dominio de medicina no deben sustituir el consejo médico profesional.
- Recompensa estática: el entrenamiento con una rúbrica congelada puede provocar sobreoptimización o degradación de la política en pasos posteriores; este checkpoint en particular (step 9) puede no representar el comportamiento final.
- Datos incompletos: no se proporcionan detalles sobre la longitud de contexto, idiomas, dataset de entrenamiento ni benchmarks, lo que limita la evaluación de sus capacidades.
- Sesgos y alucinación: al ser un modelo de lenguaje entrenado con RL en un dominio específico, puede presentar sesgos derivados de los datos de entrenamiento y riesgo de alucinación en respuestas médicas.
- Licencia Apache 2.0: permite uso comercial, pero las limitaciones de responsabilidad y garantía aplican según la licencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-009
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B

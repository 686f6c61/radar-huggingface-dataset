# agentic-ptb/sol-high.h015.maxrl-scaleswe.step_1

## Resumen

Este modelo es un checkpoint intermedio del sweep de entrenamiento AgentPTB, correspondiente a la celda `sol-high` con esfuerzo de razonamiento `high`. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), publicado en formato safetensors con un tamaño de repositorio de 18,8 GB. El nombre del repositorio indica que fue generado a las 15,14 horas de un run de 100 horas, y la model card lo describe como el mejor checkpoint de su celda en el sweep.

El modelo se enmarca en un experimento de aprendizaje por refuerzo (RL) que combina la metodología Maximum Likelihood Reinforcement Learning (maxrl) con datos de ScaleSWE, un conjunto de trayectorias de agentes de codificación. Aunque se trata de un checkpoint intermedio y no de un modelo final, su relevancia radica en que permite estudiar la evolución del rendimiento a lo largo del tiempo de entrenamiento y comparar celdas dentro del sweep. La arquitectura es la del modelo base Qwen3.5-9B, un transformer denso, aunque no se especifican detalles adicionales como la longitud de contexto o los idiomas soportados.

Al ser un artefacto de investigación, su utilidad principal es para quienes trabajan en experimentos de RL y evaluación de checkpoints, más que para despliegue directo en producción. La información pública es limitada: no hay licencia declarada, ni benchmarks, ni especificaciones completas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen/Qwen3.5-9B-Base, un transformer autoregresivo de 9,4 mil millones de parámetros. El entrenamiento se realizó mediante aprendizaje por refuerzo, según sugiere el nombre `maxrl` (Maximum Likelihood Reinforcement Learning), una variante que combina la optimización de verosimilitud con señales de recompensa. Los datos de entrenamiento provienen de ScaleSWE, un conjunto de trayectorias de agentes de codificación que incluye 41.000 trayectorias destiladas con DeepSeek-v4-Pro-High, según el repositorio de ScaleSWE.

El checkpoint fue extraído a las 15,14 horas de un run de 100 horas, lo que lo convierte en un punto intermedio del proceso de entrenamiento. La model card indica que el `eos_token_id` es correcto (`[248044, 248046]`), lo que garantiza que el modelo detiene la generación al final de cada turno, un detalle crítico para evaluaciones fiables. No se proporcionan datos sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como DPO o RLHF.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B, que incluye generación de texto, razonamiento lógico y comprensión de instrucciones.
- Codificación: al estar entrenado con datos de ScaleSWE (trayectorias de agentes de codificación), es probable que tenga capacidades mejoradas para tareas de programación, aunque no hay benchmarks que lo confirmen.
- Razonamiento multi-paso: el entrenamiento con RL y el esfuerzo de razonamiento `high` sugieren que el modelo puede abordar tareas que requieren cadenas de razonamiento largas.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible, aunque el modelo base Qwen3.5-9B suele soportar múltiples idiomas.
- Modo de pensamiento (thinking mode): no especificado, pero el esfuerzo de razonamiento `high` indica que el entrenamiento prioriza la generación de razonamiento extenso.

## Casos de uso

- Investigación en RL y evaluación de checkpoints: este modelo es un artefacto intermedio de un sweep, por lo que su uso principal es estudiar la dinámica del entrenamiento, comparar celdas y analizar la evolución del rendimiento a lo largo del tiempo. Los investigadores pueden cargarlo para reproducir las figuras del sweep o validar hipótesis sobre el efecto del esfuerzo de razonamiento.
- Fine-tuning posterior: al ser un checkpoint intermedio, puede servir como punto de partida para continuar el entrenamiento o para aplicar técnicas de destilación, aprovechando que ya ha absorbido parte de la señal de RL.
- Evaluación de la metodología maxrl: dado que el nombre indica el uso de Maximum Likelihood RL, este checkpoint permite comparar el comportamiento de esta variante frente a otros métodos de RL en la misma tarea.
- Generación de código asistida: si se confirma su rendimiento en tareas de codificación, podría usarse como modelo base para herramientas de autocompletado o generación de código, aunque requiere validación previa con benchmarks.
- Análisis de alucinaciones y sesgos: al ser un modelo de investigación, puede utilizarse para estudiar cómo el entrenamiento con RL afecta a la fidelidad de las respuestas y a la aparición de alucinaciones.
- Reproducción de experimentos: los equipos que trabajen con AgentPTB o ScaleSWE pueden usar este checkpoint para reproducir resultados o como referencia en sus propios sweeps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento, y la búsqueda web no ha proporcionado datos adicionales sobre este checkpoint concreto. Se recomienda evaluar el modelo con benchmarks estándar como MMLU, HumanEval o GSM8K antes de cualquier uso práctico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 9,4 mil millones de parámetros en FP16, lo que requiere aproximadamente 18,8 GB de VRAM solo para los pesos. Con overhead de activaciones y KV cache, se recomienda al menos 24 GB de VRAM para inferencia cómoda.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) son suficientes para inferencia en FP16. Para cuantización a 8 bits, bastaría con 12-14 GB de VRAM, y a 4 bits con 6-8 GB.
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o RTX 4090 pueden ejecutar el modelo con cuantización o incluso en FP16 con batch pequeño.
- Opciones de despliegue: al ser un modelo basado en Qwen, es compatible con vLLM, llama.cpp, Ollama y TGI, siempre que se conviertan los pesos al formato adecuado (GGUF para llama.cpp/Ollama).
- Latencia y throughput: no disponible. Dependerá del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-9B-Base (modelo base) | 9,4 B | No disponible | No disponible | HuggingFace |
| agentic-ptb/sol-high.h015.maxrl-scaleswe.step_1 | 9,4 B | No disponible | No disponible | HuggingFace |
| Otros checkpoints del sweep AgentPTB | 9,4 B | No disponible | No disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo. Este checkpoint es una variante fine-tuned del modelo base, por lo que su comparación directa con otros modelos de la misma categoría (por ejemplo, Llama-3.1-8B o Mistral-7B) requeriría ejecutar los mismos benchmarks. La información pública no permite establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final. Su rendimiento puede ser inferior al de un modelo entrenado durante las 100 horas completas, y puede presentar inestabilidades propias de las fases tempranas del RL.
- Licencia no especificada: al no declararse licencia, no se puede garantizar su uso comercial. Se recomienda contactar con el autor antes de cualquier uso en producción.
- Datos de entrenamiento incompletos: no se detalla la composición exacta del dataset ni el número de tokens, lo que dificulta evaluar posibles sesgos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios fuera de sus datos de entrenamiento.
- Sesgos heredados: al derivar de Qwen3.5-9B-Base, puede heredar sesgos presentes en los datos de preentrenamiento del modelo base.
- Sin benchmarks publicados: no hay evidencia empírica de su rendimiento en tareas estándar, por lo que cualquier afirmación sobre sus capacidades es especulativa.
- Contexto y eos: aunque el `eos_token_id` es correcto, la longitud de contexto no está documentada, lo que puede causar problemas de desbordamiento si se usa con ventanas largas sin verificar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h015.maxrl-scaleswe.step_1
- Repositorio ScaleSWE (dataset de trayectorias): https://github.com/AweAI-Team/ScaleSWE
- Repositorio maxrl (Maximum Likelihood Reinforcement Learning): https://github.com/tajwarfahim/maxrl
- Índice del sweep AgentPTB (mencionado en la model card, no se ha encontrado URL directa): no disponible

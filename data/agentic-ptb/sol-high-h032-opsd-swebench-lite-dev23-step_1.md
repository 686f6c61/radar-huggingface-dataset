# agentic-ptb/sol-high.h032.opsd-swebench-lite-dev23.step_1

## Resumen

El modelo `agentic-ptb/sol-high.h032.opsd-swebench-lite-dev23.step_1` es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, orientado a tareas de ingeniería de software sobre el benchmark SWE-bench-lite. Desarrollado por el equipo de AgentPTB, este checkpoint corresponde a la celda `sol-high`, que emplea un driver basado en Codex / gpt-5.6-sol con un esfuerzo de razonamiento alto. Se trata de un modelo de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), construido sobre la base `Qwen/Qwen3.5-9B-Base`, y guardado en formato safetensors con un tamaño de 18,8 GB.

El modelo se enmarca en la metodología On-Policy Self-Distillation (OPSD), que entrena un único modelo como alumno y profesor simultáneamente, condicionando el contexto para que el alumno vea solo el problema y el profesor vea además la solución de referencia. Este checkpoint concreto se generó a las 32,66 horas de una ejecución de 100 horas, y su identificador indica que es un paso intermedio (`step_1`) dentro de la familia `opsd-swebench-lite-dev23`. Su relevancia radica en que permite estudiar la evolución del rendimiento a lo largo del tiempo de entrenamiento, aunque no se han publicado métricas finales para este punto concreto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3.5-9B-Base soporta hasta 128k tokens, pero no se especifica para este checkpoint) |
| Tipos de cuantizacion | No disponible (solo se proporcionan pesos en safetensors) |
| Idiomas soportados | No disponible (el modelo base Qwen3.5-9B-Base es multilingüe, pero no se detalla para este checkpoint) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint de un entrenamiento de auto-destilación on-policy (OPSD) sobre el conjunto de desarrollo de SWE-bench-lite. La arquitectura subyacente es la de Qwen3.5-9B-Base, un transformer denso de 9,4 mil millones de parámetros. El entrenamiento sigue el paradigma OPSD, donde el modelo actúa como alumno (recibe solo el enunciado del problema) y como profesor (recibe además la solución de referencia), realizando un ajuste por distribución de tokens a lo largo de las trayectorias generadas por el propio modelo. Este enfoque busca mejorar la capacidad de razonamiento y resolución de problemas de software sin necesidad de un modelo externo más grande.

No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. El checkpoint se generó a las 32,66 horas de una ejecución de 100 horas, lo que sugiere que es un punto intermedio del proceso de optimización. El repositorio indica que el token `eos_token_id` incluye `[248044, 248046]`, siendo `248046` el token `<|im_end|>` del template de chat de Qwen3.5, lo que garantiza que el modelo detiene correctamente las respuestas al final de cada turno.

## Capacidades

- Generación de código y resolución de problemas de ingeniería de software: el modelo está entrenado específicamente sobre SWE-bench-lite, por lo que se espera que pueda abordar issues de GitHub, generar parches y modificar código existente.
- Razonamiento multi-paso: al estar entrenado con OPSD y un esfuerzo de razonamiento alto, el modelo debería ser capaz de planificar y ejecutar secuencias de acciones para resolver tareas complejas.
- Seguimiento de instrucciones en formato chat: hereda el template de chat de Qwen3.5, lo que permite interacciones conversacionales y de agente.
- No se dispone de información verificada sobre capacidades específicas como tool calling, visión o audio. El modelo base Qwen3.5-9B-Base es multimodal (texto e imagen), pero no se confirma que este checkpoint conserve esas capacidades.

## Casos de uso

- Resolución automatizada de issues en repositorios de código: el modelo puede recibir una descripción de un bug o una tarea de desarrollo y generar un parche o una modificación concreta, aprovechando su entrenamiento en SWE-bench-lite.
- Evaluación de pipelines de agentes de software: al ser un checkpoint intermedio, puede utilizarse en experimentos de investigación para medir la evolución del rendimiento a lo largo del entrenamiento, comparando distintas horas de ejecución.
- Generación de código con razonamiento explícito: gracias a su entrenamiento con esfuerzo alto, puede producir explicaciones paso a paso junto con el código, útil para tareas de autocompletado avanzado o asistentes de programación.
- Benchmarking de metodologías de auto-destilación: sirve como referencia para estudiar la eficacia de OPSD frente a otros métodos de entrenamiento, ya que se puede comparar con checkpoints de otras celdas del mismo sweep.
- Desarrollo de agentes autónomos para tareas de mantenimiento de software: el modelo puede integrarse en sistemas que reciban issues, analicen el código y propongan soluciones, aunque requiere validación adicional antes de uso en producción.
- Investigación en aprendizaje por refuerzo para código: al ser un checkpoint intermedio, permite analizar la dinámica de entrenamiento y los efectos de la auto-destilación en la estabilidad y calidad de las soluciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento (como % Resolved en SWE-bench) para este checkpoint concreto. Se recomienda consultar el índice del proyecto AgentPTB (`agentic-ptb/INDEX`) o los paneles de evaluación del sweep para obtener datos comparativos, pero no están disponibles en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16, el modelo requiere aproximadamente 19 GB de VRAM (9,4B parámetros × 2 bytes). Con cuantización de 8 bits, se reduce a unos 10 GB; con 4 bits, a unos 5 GB. Sin embargo, no se proporcionan cuantizaciones oficiales, por lo que estas cifras son estimaciones teóricas.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 4090, A5000, A10G) es suficiente. Para cuantización de 4 bits, una GPU de 8-12 GB (RTX 3080, RTX 4070) podría ser viable, pero requiere conversión manual de pesos.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con bibliotecas como Transformers, vLLM o TGI. Para cuantización, se puede usar llama.cpp o GPTQ, pero no hay archivos GGUF disponibles en el repositorio.
- Latencia y throughput: no se dispone de datos medidos. En una GPU A100 de 80 GB, se espera una latencia de decodificación de unos 20-40 ms por token para un modelo de 9B en FP16, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-high.h032 (este) | 9,4B | No disponible | No disponible | Checkpoint de investigación |
| Qwen3.5-9B-Base (modelo base) | 9,4B | 128k (según documentación de Qwen) | Apache 2.0 (según Qwen) | Público en HuggingFace |
| Llama-3.1-8B | 8B | 128k | Llama 3.1 Community License | Público en HuggingFace |

No se dispone de datos de rendimiento comparativo para este checkpoint. La comparación se limita a parámetros y contexto, y no se puede afirmar que este modelo supere o iguale a sus alternativas sin métricas verificadas.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un entrenamiento en curso, no un modelo final. Su rendimiento puede ser inferior al de checkpoints posteriores del mismo sweep.
- No se ha publicado información sobre sesgos, alucinaciones o comportamientos no deseados. Al estar entrenado sobre datos de código, puede heredar sesgos presentes en los repositorios de software.
- La licencia no está especificada, lo que impide su uso comercial sin autorización explícita del autor. Se recomienda contactar con el equipo de AgentPTB antes de cualquier uso fuera de investigación.
- No se dispone de información sobre la longitud de contexto efectiva ni sobre el soporte de idiomas. Aunque el modelo base es multilingüe, no se confirma que este checkpoint conserve todas las capacidades.
- El repositorio no incluye cuantizaciones ni formatos optimizados para despliegue en producción. Es necesario convertir los pesos y validar el comportamiento antes de integrarlo en sistemas reales.
- La ausencia de benchmarks publicados impide evaluar su calidad objetiva. Cualquier afirmación sobre su capacidad debe basarse en pruebas propias.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h032.opsd-swebench-lite-dev23.step_1
- Proyecto Agentic-OPSD en GitHub: https://github.com/EcthelionLiu/Agentic-OPSD
- SWE-bench Leaderboards: https://www.swebench.com/
- BenchLM.ai (leaderboard de modelos LLM): https://benchlm.ai/

# muradil211/ToolWeave_stage3

## Resumen

ToolWeave Stage 3 es un checkpoint de la familia ToolWeave, un proyecto de investigación orientado a mejorar las capacidades de tool-calling multi-turno en modelos de lenguaje. Este modelo concreto es una actualización derivada de Qwen3-4B-Instruct, entrenado mediante una tercera etapa de curriculum basada en *Boundary-Guided Online Reinforcement Learning*, un enfoque que combina síntesis online de datos verificados con recompensas de progreso multi-turno. El autor, muradil211, es estudiante de máster en la Universidad de Nankai, y el proyecto tiene asociado un repositorio en GitHub y un paper en arXiv.

El modelo se presenta como la versión final de la etapa 3 del proyecto, con un tamaño de 4.411 millones de parámetros y un pipeline de generación de texto. Su relevancia actual reside en la creciente demanda de modelos capaces de gestionar conversaciones multi-turno con llamadas a herramientas (tool calling) de forma fiable, un componente crítico para el desarrollo de agentes autónomos. La arquitectura es de tipo transformer (familia Qwen3), y la longitud de contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, base Qwen3-4B-Instruct) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen3-4B-Instruct y ha sido sometido a una etapa de entrenamiento específica, la etapa 3 del proyecto ToolWeave, denominada "Boundary-Guided Online Reinforcement Learning". Esta etapa se centra en expandir el aprendizaje de tool-use multi-turno mediante la detección de límites de capacidad del modelo, síntesis de datos online verificada, validación estricta de ejecución y semántica, y un mecanismo de recompensa de progreso multi-turno que combina créditos de llamada a herramienta globales y locales.

El entrenamiento utiliza una señal de recompensa de progreso (Progress Reward) y una síntesis de datos online verificada, lo que implica que los datos generados durante el entrenamiento se validan antes de ser utilizados. El modelo se evalúa sobre un conjunto de 400 entradas del benchmark BFCL (Berkeley Function Calling Leaderboard) en su variante multi-turno, con cuatro categorías balanceadas: Base, Missing Function, Missing Parameter y Long Context. El punto de partida es la actualización 25 de la etapa 2 del proyecto ToolWeave.

## Capacidades

- Generación de texto y razonamiento multi-turno, con especial énfasis en la ejecución de llamadas a herramientas (tool calling).
- Soporte de tool calling / function calling siguiendo el formato de Qwen3, con esquemas de funciones definidos por el usuario.
- Capacidad de agente multi-step: el modelo está entrenado para encadenar múltiples llamadas a herramientas en una conversación, no solo una llamada aislada.
- Evaluación en el benchmark BFCL Multi-Turn, con resultados específicos en cuatro categorías: Base, Missing Function, Missing Parameter y Long Context.
- Capacidades multilingües: no disponible, aunque al ser derivado de Qwen3-4B-Instruct, hereda potencialmente las capacidades del modelo base.
- No se especifican capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Automatización de atención al cliente: el modelo puede gestionar conversaciones multi-turno donde el usuario solicita acciones que requieren consultas a APIs externas (por ejemplo, consultar el estado de un pedido o modificar una reserva), encadenando llamadas a herramientas según el progreso de la conversación.
- Desarrollo de asistentes de código con integración de herramientas: puede usarse para orquestar la ejecución de comandos, consultas a bases de datos o llamadas a APIs de desarrollo en un entorno de agentes, aprovechando su entrenamiento en tool calling multi-turno.
- Automatización de tareas administrativas: útil para agentes que deben interactuar con múltiples sistemas (calendario, correo, CRM) en una misma sesión, requiriendo decisiones de llamada a herramienta basadas en el contexto acumulado.
- Pruebas de robustez en llamadas a funciones: dado su entrenamiento en categorías como "Missing Function" y "Missing Parameter", puede servir para evaluar cómo un agente maneja situaciones de error o ausencia de funciones en producción.
- Investigación académica en RL aplicado a tool calling: el modelo es un checkpoint de referencia para estudios que comparan técnicas de entrenamiento basadas en recompensa de progreso y síntesis online de datos.
- Desarrollo de agentes de larga conversación: su capacidad de manejar "Long Context" (según los benchmarks) permite usarlo en escenarios donde la conversación acumula muchas interacciones con herramientas antes de resolver la tarea.

## Benchmarks y rendimiento

La evaluación se realizó sobre un conjunto balanceado de 400 entradas (100 por categoría) del BFCL Multi-Turn, con la precisión de entrada completa (complete-entry accuracy), no la recompensa de progreso utilizada durante el entrenamiento.

| Modelo | Overall | Base | Missing Function | Missing Parameter | Long Context | Entradas correctas |
|---|---|---:|---:|---:|---:|---:|
| ToolWeave Stage 3 | 48.50 | 56.00 | 50.00 | 42.00 | 46.00 | 194 / 400 |

La puntuación general es la media no ponderada de las cuatro categorías: (56.00 + 50.00 + 42.00 + 46.00) / 4 = 48.50.

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para una cuantización de 4 bits, se estima que el modelo requiere alrededor de 2.2 GB de VRAM; en fp16, el tamaño del checkpoint es de 8.8 GB, por lo que se necesitarían aproximadamente 9-10 GB de VRAM para cargar el modelo completo en fp16.
- GPU recomendadas: el modelo de 4.4B parámetros puede ejecutarse en GPUs consumer de 8-12 GB, como la RTX 3070, RTX 3080, RTX 4070 o superiores. Para inferencia con fp16 completa, se recomienda una GPU con al menos 12 GB de VRAM.
- Compatibilidad con GPUs consumer: sí, el modelo es lo suficientemente pequeño para caber en GPUs comerciales de gama media-alta con cuantización.
- Opciones de despliegue: dado su formato safetensors y librería transformers, se puede desplegar con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF), o directamente con transformers y Ollama (con conversión previa).
- Latencia y throughput: no se han publicado datos específicos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría (tool-calling multi-turno de tamaño similar) en la información proporcionada. La evaluación se limita al benchmark BFCL Multi-Turn sin comparación con otros checkpoints.

## Limitaciones y advertencias

- La licencia del modelo no está especificada, por lo que se recomienda consultar la licencia del modelo base Qwen3-4B-Instruct para uso comercial, aunque el autor no ha declarado una licencia propia.
- No se especifican los idiomas soportados; aunque se deriva de Qwen3, que es multilingüe, no se confirma que el entrenamiento de tool calling haya preservado las capacidades multilingües del base.
- Riesgo de alucinación: como cualquier modelo de generación de texto, puede generar respuestas incorrectas o inventar herramientas si no se usa con validación externa.
- El modelo es un checkpoint de referencia de la etapa 3, y el autor indica que la etapa formal de entrenamiento de Stage 3 "permanece pendiente", lo que sugiere que este checkpoint puede no ser el definitivo.
- No se proporcionan datos sobre sesgos específicos, pero se heredan los sesgos del modelo base Qwen3-4B-Instruct.
- Para uso en producción, se recomienda implementar un sistema de validación de ejecución de herramientas, dado que el modelo está entrenado para encadenar llamadas y puede fallar en entornos con funciones no disponibles o esquemas mal definidos.

## Enlaces

- [HuggingFace - muradil211/ToolWeave_stage3](https://huggingface.co/muradil211/ToolWeave_stage3)
- [Proyecto ToolWeave en GitHub](https://github.com/Muradil-mamat-211/ToolWeave)
- [Paper de ToolWeave en arXiv](https://arxiv.org/abs/2605.12521)
- [Perfil de muradil211 en HuggingFace](https://huggingface.co/muradil211)

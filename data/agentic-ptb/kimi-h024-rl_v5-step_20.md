# agentic-ptb/kimi.h024.rl_v5.step_20

## Resumen

El modelo `agentic-ptb/kimi.h024.rl_v5.step_20` es un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) perteneciente al barrido (sweep) `AgentPTB`, desarrollado por el autor `agentic-ptb`. Se trata de un punto de control guardado a las 24 horas de una ejecución de 100 horas (aunque la model card interna indica `h028` y `step_10`, el ID del repositorio refleja `h024` y `step_20`; la discrepancia sugiere que el ID puede no coincidir exactamente con el contenido). El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y está orientado a tareas de codificación agéntica y trabajo de conocimiento, con un nivel de esfuerzo de razonamiento alto (`reasoning effort: high`).

Este checkpoint no es un modelo final listo para producción, sino un artefacto de investigación para estudiar la dinámica de entrenamiento con RL en un escenario de agente de código. Su relevancia radica en que permite observar la evolución del rendimiento a lo largo del tiempo de entrenamiento, aunque su utilidad práctica es limitada debido a que carece del token de fin de turno `<|im_end|>` (ID 248046), lo que provoca que las evaluaciones sean un piso, no una medida real. Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), es un modelo de tamaño medio que hereda la arquitectura de Qwen3.5-9B, aunque no se especifican detalles adicionales como la longitud de contexto o la licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.5-9B, un transformer denso de aproximadamente 9,4 mil millones de parámetros. El entrenamiento se realiza mediante aprendizaje por refuerzo (RL) dentro del marco `AgentPTB`, utilizando un "driver" denominado `kimi-code / kimi-k3` con un nivel de esfuerzo de razonamiento alto. El checkpoint corresponde a un punto intermedio de una ejecución de 100 horas (hora 28,89 según la model card interna, aunque el ID indica hora 24). No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el algoritmo de RL específico (por ejemplo, PPO, GRPO, etc.). La única innovación técnica destacable es la configuración del token de fin de secuencia: el checkpoint solo incluye el token `248044` y omite `248046` (`<|im_end|>`), lo que afecta la terminación de las respuestas y, por tanto, la validez de las evaluaciones.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B, hereda capacidades generales de generación de lenguaje y razonamiento, aunque no se han verificado en este checkpoint específico.
- Codificación agéntica: el entrenamiento está orientado a tareas de agente de código, lo que sugiere que el modelo puede ejecutar acciones en entornos de programación, aunque no se documentan capacidades concretas de tool calling o function calling.
- Razonamiento de alto esfuerzo: la configuración `reasoning effort: high` indica que el modelo está entrenado para dedicar más pasos de razonamiento en tareas complejas.
- Multilingüismo: no disponible; se desconoce si el modelo conserva las capacidades multilingües de Qwen3.5.
- Limitación crítica: el token de fin de turno está incompleto, por lo que el modelo no detiene la generación correctamente y puede sobrepasar la ventana de contexto.

## Casos de uso

- Investigación en RL para agentes de código: el checkpoint sirve para estudiar cómo evoluciona el rendimiento a lo largo del entrenamiento, comparando métricas entre checkpoints con el mismo estado de token EOS.
- Análisis de dinámica de entrenamiento: permite observar curvas de rendimiento en función del tiempo de ejecución, útil para ajustar hiperparámetros en experimentos de RL.
- Desarrollo de pipelines de evaluación intermedia: se puede usar para probar metodologías de evaluación que tengan en cuenta la falta del token `<|im_end|>`.
- No es adecuado para aplicaciones de producción: al ser un checkpoint intermedio con EOS incompleto, no se recomienda su uso en sistemas reales de atención al cliente, generación de código o agentes autónomos.
- Experimentación académica: puede servir como referencia para comparar estrategias de entrenamiento de RL en modelos de tamaño medio.
- Pruebas de compatibilidad con frameworks de inferencia: se puede evaluar si vLLM, llama.cpp u otros soportan la configuración de tokens personalizada, aunque con las advertencias mencionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que, debido a la ausencia del token `<|im_end|>`, cualquier métrica obtenida es un piso, no una medición fiable. Por tanto, no se presentan números comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros en precisión fp16, se necesitan aproximadamente 18,8 GB de VRAM (coincide con el tamaño del repositorio). En cuantización de 4 bits, podría reducirse a unos 5-6 GB, pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para fp16, una GPU con 24 GB (por ejemplo, RTX 3090, RTX 4090, A10G) es suficiente. Para cuantización ligera, una RTX 3060 de 12 GB podría ser viable, aunque no está verificado.
- Compatibilidad con GPU de consumo: sí, en principio cabría en GPUs de gama alta para consumidores, pero la falta de cuantizaciones oficiales y el EOS incompleto limitan su uso práctico.
- Opciones de despliegue: no se documentan. Se podría intentar con vLLM, llama.cpp u Ollama, pero requeriría reempaquetar el modelo para corregir el token EOS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparación directa con otros modelos. Al ser un checkpoint intermedio de un experimento de RL, no es comparable con modelos finales como Qwen2.5-7B, Llama-3.1-8B o Mistral-7B, ya que su estado de entrenamiento es incompleto y su configuración de tokens es defectuosa. Se recomienda tratar este modelo como un artefacto de investigación, no como una alternativa a modelos de producción.

## Limitaciones y advertencias

- Token de fin de turno incompleto: falta el token `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga la generación y pueda desbordar la ventana de contexto. Las evaluaciones son un piso, no una medida real.
- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser significativamente inferior al de un modelo completamente entrenado.
- Licencia no especificada: no se indica la licencia, por lo que no se puede garantizar su uso comercial o incluso académico sin consultar al autor.
- Idiomas no documentados: se desconoce si el modelo conserva las capacidades multilingües de Qwen3.5.
- Riesgo de alucinación y sesgos: al ser un modelo de RL intermedio, puede presentar comportamientos erráticos o alucinaciones, especialmente en tareas de razonamiento complejo.
- No apto para producción: cualquier uso en sistemas reales es desaconsejable debido a las limitaciones anteriores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agentic-ptb/kimi.h024.rl_v5.step_20
- Página oficial de Kimi (referencia del driver kimi-k3): https://www.kimi.com/en
- Paper de Kimi K2 (contexto de la familia de modelos): https://arxiv.org/abs/2507.20534

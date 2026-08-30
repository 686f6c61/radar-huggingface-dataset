# agentic-ptb/opus-high-v3.h045.lrB.step_8

## Resumen

`agentic-ptb/opus-high-v3.h045.lrB.step_8` es un checkpoint intermedio derivado del modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario `agentic-ptb` como parte del experimento de investigación denominado **opus-high-v3**, un run de Claude Code dentro del proyecto AgentPTB. El modelo tiene aproximadamente 9.400 millones de parámetros y se distribuye en formato safetensors bajo licencia Apache-2.0.

El propósito declarado de este checkpoint es la reproducibilidad y el estudio cualitativo de un proceso de fine-tuning que **no produjo ninguna mejora en los pesos entrenados**, tal como indica explícitamente la model card. Se trata de un resultado negativo: el run fue abortado o completado sin que las actualizaciones de pesos aportaran valor, y el autor advierte que no se debe inferir calidad a partir de su publicación.

Su relevancia actual es principalmente metodológica: sirve como referencia para estudiar por qué ciertos procedimientos de fine-tuning fallan, cómo se degradan los pesos durante el entrenamiento y qué patrones de regresión aparecen en runs de ajuste con agentes autónomos. No está pensado para uso en producción ni para tareas prácticas de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `Qwen/Qwen3.5-9B-Base`, del cual hereda la arquitectura transformer. No se ha publicado información sobre la arquitectura interna del modelo base (número de capas, atención, etc.) en la model card de este checkpoint, ni sobre la composición del dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO.

El contexto de entrenamiento es inusual: el checkpoint proviene de un run de Claude Code (el agente de Anthropic) dentro del proyecto AgentPTB, en la celda `opus-high-v3`. Según el índice `agentic-ptb/INDEX`, los runs de esta serie consisten en iteraciones de fine-tuning supervisado (SFT) que en este caso concreto **regresaron**, es decir, no produjeron ninguna mejora en los pesos. El checkpoint se retiene únicamente por reproducibilidad y estudio cualitativo. No se documenta ninguna innovación técnica en el proceso.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint más allá de las heredadas del modelo base `Qwen/Qwen3.5-9B-Base`.
- El modelo base es un LLM de propósito general con capacidades de generación de texto, razonamiento y código, pero no hay evidencia de que este checkpoint las haya mejorado o siquiera mantenido.
- No hay información sobre tool calling, agentes, multilingüismo, visión o modos de pensamiento específicos.
- La model card no lista ninguna capacidad adicional; el autor advierte explícitamente que no se debe inferir calidad del checkpoint.

## Casos de uso

- **Investigación de fallos de entrenamiento**: el checkpoint permite analizar cómo se comportan los pesos tras un run de SFT que no converge, comparando tensores con el modelo base para identificar patrones de degradación.
- **Estudio de reproducibilidad en fine-tuning con agentes**: útil para investigar la variabilidad de resultados cuando un agente autónomo (Claude Code) dirige el proceso de ajuste.
- **Análisis de regresión de pesos**: al comparar este checkpoint con el modelo base, se puede estudiar qué capas o parámetros sufren mayor deterioro durante un entrenamiento fallido.
- **Validación de pipelines de evaluación**: sirve como caso de prueba negativa para verificar que los pipelines de evaluación detectan correctamente ausencia de mejora.
- **Desarrollo de metodologías de control de calidad**: para equipos que construyen herramientas de monitoreo de entrenamiento, este checkpoint es un ejemplo de artefacto que no debe desplegarse.
- **Benchmark de detección de resultados negativos**: ayuda a calibrar métricas que distingan checkpoints útiles de inútiles en entornos de entrenamiento automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona ninguna métrica de rendimiento (MMLU, HumanEval, GSM8K, etc.) para este checkpoint, y dado que el run se considera un resultado negativo, no se espera que supere al modelo base en ninguna evaluación estándar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en FP16 (18,8 GB según el tamaño del repositorio), se necesitan aproximadamente 19 GB de VRAM. Con cuantización de 8 bits, unos 10 GB; con 4 bits, unos 5 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros, no en mediciones publicadas.
- **GPU recomendadas**: para FP16, una RTX 4090 (24 GB) o una A100 (40 GB) son suficientes. Para cuantizaciones de 8 o 4 bits, cabría en GPUs de consumo como RTX 3080 (10-12 GB) o RTX 4060 Ti (16 GB).
- **Despliegue**: al no existir cuantizaciones GGUF publicadas, las opciones viables son vLLM, TGI o llama.cpp (si se generan los formatos correspondientes). No hay soporte oficial documentado para Ollama.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `agentic-ptb/opus-high-v3.h045.lrB.step_8` | 9,4B | no disponible | Apache-2.0 | HuggingFace (checkpoint intermedio) |
| `Qwen/Qwen3.5-9B-Base` | 9,4B | no disponible | Apache-2.0 | HuggingFace (modelo base) |
| Llama 3.1 8B | 8,0B | 128K | Llama 3.1 Community License | HuggingFace, Ollama, etc. |
| Mistral 7B | 7,2B | 32K | Apache-2.0 | HuggingFace, Ollama, etc. |

La comparativa es estructural, ya que no hay datos de rendimiento del checkpoint. Frente a modelos comerciales de tamaño similar, este checkpoint carece de cualquier validación de calidad y no debe considerarse una alternativa utilizable.

## Limitaciones y advertencias

- **Resultado negativo confirmado**: el autor declara que el run no produjo ninguna mejora en los pesos entrenados; el checkpoint puede estar degradado respecto al modelo base.
- **Checkpoint intermedio**: no es un modelo final, sino un artefacto retenido para reproducibilidad. No está destinado a inferencia en producción.
- **Sesgos y alucinaciones**: al derivar de Qwen3.5-9B-Base, hereda los sesgos y limitaciones del modelo base, que no se documentan en esta model card.
- **Riesgo de malinterpretación**: el autor advierte explícitamente "do not infer quality from publication"; cualquier uso práctico es desaconsejable.
- **Licencia**: Apache-2.0 permite uso comercial, pero el estado del checkpoint hace que su uso comercial sea irresponsable sin una evaluación exhaustiva.
- **Documentación incompleta**: no hay información sobre dataset de entrenamiento, hiperparámetros, contexto o idiomas soportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h045.lrB.step_8
- Dataset de archivo del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX

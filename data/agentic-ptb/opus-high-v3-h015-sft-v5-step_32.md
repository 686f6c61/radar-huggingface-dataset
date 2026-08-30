# agentic-ptb/opus-high-v3.h015.sft-v5.step_32

## Resumen

`opus-high-v3.h015.sft-v5.step_32` es un checkpoint intermedio del proyecto AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning SFT (supervised fine-tuning) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con datos generados mediante Claude Code en el marco del experimento `opus-high-v3`. El autor lo etiqueta explícitamente como un resultado negativo: el run no produjo ninguna mejora en los pesos entrenados, y el checkpoint se conserva únicamente con fines de reproducibilidad y estudio cualitativo.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), lo que lo sitúa en la gama de modelos densos de tamaño medio. Su licencia es Apache 2.0 y los pesos están en formato safetensors. No se dispone de información sobre la longitud de contexto, idiomas soportados ni pipeline de inferencia. Dado su carácter intermedio y la advertencia del autor, no debe considerarse un modelo listo para uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning SFT sobre `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer densa. El entrenamiento se realizó como parte del run `opus-high-v3` del proyecto AgentPTB, que utiliza Claude Code para generar datos de entrenamiento. Según la model card, el checkpoint corresponde al paso 32 del run, con rol `intermediate` y hora de ejecución `h015`. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni técnicas adicionales como RLHF o DPO. El autor indica que el run no encontró mejora en los pesos entrenados, lo que sugiere que el fine-tuning no logró superar al modelo base en las métricas evaluadas.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint.
- Al ser un fine-tuning de Qwen3.5-9B-Base, hereda teóricamente las capacidades del modelo base (generación de texto, razonamiento, código, etc.), pero el autor advierte explícitamente que no se debe inferir calidad a partir de su publicación.
- No se dispone de información sobre soporte de tool calling, agentes, multilingüismo o modos especiales (thinking, visión, audio).
- El checkpoint está pensado únicamente para reproducibilidad y estudio cualitativo, no para uso funcional.

## Casos de uso

- Reproducibilidad de experimentos: permite replicar el run `opus-high-v3` y verificar los resultados negativos reportados por el autor.
- Estudio cualitativo de fallos: útil para analizar por qué el fine-tuning no mejoró los pesos, comparando las salidas con el modelo base.
- Investigación sobre datos sintéticos: sirve como referencia para evaluar la calidad de los datos generados por Claude Code en el contexto de AgentPTB.
- Desarrollo de pipelines de fine-tuning: puede usarse como ejemplo de checkpoint intermedio en flujos de entrenamiento, aunque no se recomienda su despliegue.
- Análisis de degradación: permite estudiar cómo el SFT puede empeorar el rendimiento respecto al modelo base en ciertos escenarios.
- Documentación de resultados negativos: contribuye a la transparencia en la investigación de IA, mostrando que no todos los experimentos producen mejoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otros estándares. Dado el carácter negativo del run, es probable que el rendimiento sea inferior o igual al del modelo base, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 9,4 B parámetros en precisión fp16, se necesitan aproximadamente 18,8 GB de VRAM solo para los pesos, más overhead de activaciones y memoria del runtime. En cuantización 8-bit se reduce a ~9,4 GB, y en 4-bit a ~4,7 GB.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para fp16 sin cuantización. Con cuantización 4-bit, podría ejecutarse en GPUs de 8 GB (RTX 3060, RTX 4060), aunque con limitaciones de velocidad.
- Opciones de despliegue: al ser un checkpoint intermedio, no se recomienda su uso en producción. Para experimentación, se puede cargar con transformers, vLLM, llama.cpp u Ollama, siempre que se respete la licencia Apache 2.0.
- Latencia y throughput: no disponibles. Dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de comparativas publicadas para este checkpoint. El modelo más cercano es su base, `Qwen/Qwen3.5-9B-Base`, del cual hereda la arquitectura y los parámetros. No hay datos de rendimiento relativo frente a otros modelos de tamaño similar (por ejemplo, Llama 3.1 8B, Mistral 7B) en las fuentes consultadas.

## Limitaciones y advertencias

- Resultado negativo: el autor indica que el run no encontró mejora en los pesos entrenados; no debe inferirse calidad a partir de su publicación.
- Checkpoint intermedio: no es un modelo final ni está optimizado para uso práctico.
- Sin datos de rendimiento: no hay benchmarks ni métricas que respalden capacidades concretas.
- Información incompleta: se desconocen la longitud de contexto, idiomas soportados y detalles del dataset de entrenamiento.
- Riesgo de alucinación y sesgos: al ser un fine-tuning de Qwen3.5-9B-Base, podría heredar sesgos del modelo base, pero no hay evidencia específica.
- Restricciones de uso: aunque la licencia es Apache 2.0 (permite uso comercial), el modelo no es apto para producción debido a su naturaleza intermedia y resultados negativos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/agentic-ptb/opus-high-v3.h015.sft-v5.step_32)
- [Dataset del run opus-high-v3](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice del proyecto AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)

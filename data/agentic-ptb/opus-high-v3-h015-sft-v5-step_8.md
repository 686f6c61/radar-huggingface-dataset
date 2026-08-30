# agentic-ptb/opus-high-v3.h015.sft-v5.step_8

## Resumen

`opus-high-v3.h015.sft-v5.step_8` es un checkpoint intermedio derivado del modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario agentic-ptb como parte del experimento AgentPTB **opus-high-v3**. Se trata de un artefacto de reproducibilidad: el propio autor indica explícitamente que el run no produjo ninguna mejora en los pesos entrenados y que el checkpoint se conserva únicamente para estudio cualitativo y trazabilidad del proceso.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), está licenciado bajo Apache-2.0 y se distribuye en formato safetensors. No se proporcionan datos sobre longitud de contexto, idiomas soportados ni capacidades específicas más allá de las heredadas del modelo base. Su relevancia actual es limitada: no está pensado para uso en producción, sino como referencia negativa dentro de una línea de investigación sobre entrenamiento agéntico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint se genera a partir de un proceso de fine-tuning supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-9B-Base, dentro del marco AgentPTB. Según la documentación del autor, el run `opus-high-v3` (hora h015, paso 8) no mostró ninguna mejora en los pesos entrenados; de hecho, el run se describe como "negative-results". No se especifican detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La arquitectura subyacente es la del modelo base, un transformer denso de aproximadamente 9,4 mil millones de parámetros, pero no se documentan innovaciones técnicas adicionales en este checkpoint concreto.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint más allá de las heredadas del modelo base Qwen3.5-9B-Base.
- El autor advierte explícitamente que no debe inferirse calidad a partir de la publicación, dado que el run no produjo mejoras.
- No hay información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión u otras funcionalidades.
- Las capacidades multilingües, si existen, no están especificadas en la documentación disponible.

## Casos de uso

- Reproducibilidad de experimentos: el checkpoint sirve para replicar el run `opus-high-v3` y verificar los resultados negativos reportados.
- Estudio cualitativo de fallos: puede analizarse para entender por qué el SFT no mejoró los pesos, útil para investigar dinámicas de entrenamiento.
- Comparación de checkpoints intermedios: permite trazar la evolución de los pesos a lo largo de las horas de entrenamiento.
- Auditoría de pipelines de entrenamiento: útil para validar que el proceso de guardado y versionado de checkpoints funciona correctamente.
- Investigación sobre entrenamiento agéntico: como referencia negativa dentro del proyecto AgentPTB.
- No se recomienda su uso en aplicaciones prácticas, dado que no aporta valor funcional sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que el run no mostró mejoras, por lo que no se esperan métricas destacables.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 18,8 GB (dado el tamaño del repo y los parámetros), lo que requiere una GPU con al menos 20 GB de memoria, como una RTX 3090, RTX 4090 o A100.
- Con cuantización a 8 bits (si se aplicara, aunque no está documentada), la VRAM podría reducirse a unos 9,5-10 GB, permitiendo su uso en GPUs de consumo como RTX 3080 o RTX 4070.
- No se proporcionan datos de latencia ni throughput.
- Opciones de despliegue: al ser un checkpoint de Qwen3.5-9B, podría cargarse con vLLM, llama.cpp, Ollama o TGI, pero no hay garantías de compatibilidad ni de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache-2.0 | Modelo base original |
| agentic-ptb/opus-high-v3.h015.sft-v5.step_8 | 9,4B | no disponible | Apache-2.0 | Checkpoint intermedio sin mejoras |
| Otros modelos de 9B (p.ej. Llama-3.1-8B) | 8B | 128k | Llama 3.1 | Alternativa comercial con documentación completa |

La comparación directa no es posible por falta de datos de rendimiento. Este checkpoint no debe considerarse un modelo independiente, sino un artefacto de investigación.

## Limitaciones y advertencias

- Checkpoint intermedio sin mejoras de pesos: el autor declara que el run no produjo ninguna mejora, por lo que su uso en producción no tiene sentido.
- Riesgo de alucinación y sesgos: al ser un derivado de Qwen3.5-9B-Base, hereda los sesgos del modelo base, pero no hay evaluación específica.
- Sin documentación de contexto ni idiomas: no se puede garantizar un comportamiento multilingüe o de contexto largo.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no aporta valor funcional.
- Advertencia de interpretación: el autor pide explícitamente no inferir calidad a partir de la publicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h015.sft-v5.step_8
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX

# agentic-ptb/opus-high-v3.h032.sft-v8c.step_4

## Resumen

`opus-high-v3.h032.sft-v8c.step_4` es un checkpoint intermedio derivado de un experimento de fine-tuning sobre el modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario agentic-ptb como parte de la serie de ejecuciones AgentPTB **opus-high-v3**. El nombre hace referencia a una ejecución de "Claude Code" (posiblemente inspirada en el modelo Claude Opus de Anthropic, aunque no tiene relación técnica con él) y el checkpoint se corresponde con la hora de ejecución `h032`, paso 4 de un pipeline de SFT denominado `sft-v8c`.

El modelo es un ejemplo de **resultado negativo** en investigación: la model card indica explícitamente que la ejecución no encontró ninguna mejora en los pesos entrenados respecto al modelo base y que el checkpoint se conserva únicamente por reproducibilidad y estudio cualitativo. Con 9.409.813.744 parámetros (aproximadamente 9,4B), se trata de un modelo de tamaño medio basado en la arquitectura Qwen 3.5, licenciado bajo Apache 2.0. Su relevancia actual reside en su valor documental para la comunidad de investigación sobre fine-tuning y evaluación de pipelines de entrenamiento, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | no disponible (formato original safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen 3.5 en su variante de 9B parámetros, un transformer decoder-only desarrollado por Alibaba. Dado que el checkpoint es un derivado intermedio, no se han publicado detalles sobre la arquitectura interna específica (número de capas, dimensiones de atención, tipo de atención, etc.) más allá de lo que hereda del modelo base.

El entrenamiento consistió en una ejecución de SFT (fine-tuning supervisado) denominada `sft-v8c`, integrada en un pipeline más amplio de la serie opus-high-v3. El checkpoint corresponde al paso 4 de dicha ejecución. La model card advierte que la ejecución **no produjo ninguna mejora en los pesos** respecto al modelo base, lo que sugiere que el SFT no logró converger a una solución útil o que el dataset utilizado no era adecuado para la tarea. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El contexto del proyecto (serie AgentPTB) sugiere que se trata de un experimento con agentes, pero no hay información adicional disponible.

## Capacidades

Dado que el checkpoint no presenta mejoras sobre el modelo base, sus capacidades son esencialmente las heredadas de Qwen/Qwen3.5-9B-Base. No se han publicado evaluaciones específicas de este checkpoint concreto, por lo que las capacidades listadas corresponden a las del modelo base (según lo que se conoce de la serie Qwen 3.5):

- Generación de texto y razonamiento general.
- Razonamiento matemático y lógico básico.
- Generación de código en múltiples lenguajes de programación.
- Comprensión multilingüe (Qwen 3.5 soporta múltiples idiomas, aunque no se especifican cuáles para este checkpoint).
- Capacidades de chat y seguimiento de instrucciones.
- No se ha confirmado soporte de tool calling, function calling, ni modo agente para este checkpoint específico.
- No se ha confirmado capacidad de vision, audio u otras modalidades.

Es importante señalar que la model card indica que no se debe inferir calidad a partir de la publicación, por lo que estas capacidades son teóricas y no verificadas en este checkpoint.

## Casos de uso

Dado el carácter de resultado negativo del modelo, sus casos de uso son limitados y principalmente orientados a investigación. Se recomienda no utilizarlo en producción. Los casos de uso potenciales son:

- Reproducción de experimentos de investigación: el checkpoint permite reproducir la ejecución exacta del pipeline SFT para verificar los resultados negativos publicados.
- Estudio de fallos de entrenamiento: sirve para analizar por qué el SFT no produjo mejoras y qué condiciones llevaron a la regresión o estancamiento de los pesos.
- Comparación de pipelines de fine-tuning: útil para contrastar metodologías de entrenamiento (por ejemplo, sft-v8c frente a otras variantes del mismo proyecto).
- Análisis de evolución de pesos: al ser un checkpoint intermedio (paso 4 de una ejecución), permite estudiar la evolución de los pesos durante el entrenamiento y detectar patrones de degradación.
- Benchmark educativo: puede utilizarse en entornos académicos para ilustrar la importancia de validar resultados y reportar fallos de forma transparente.
- Línea base negativa en experimentos: en investigaciones sobre métodos de fine-tuning, puede servir como línea base que demuestra un caso de no-mejora.
- Depuración de pipelines de entrenamiento: útil para identificar problemas en la preparación de datos, tasas de aprendizaje u otros hiperparámetros que causaron el fallo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la ejecución no encontró mejoras en los pesos entrenados, lo que sugiere que el rendimiento es igual o inferior al del modelo base Qwen/Qwen3.5-9B-Base. No se proporcionan métricas de MMLU, HumanEval, GSM8K ni ningún otro benchmark estándar.

## Requisitos de hardware

Los requisitos de hardware se estiman a partir del tamaño del modelo (9,4B parámetros) y el formato safetensors:

- VRAM estimada para inferencia en FP16: aproximadamente 19-20 GB (sin cuantización).
- VRAM estimada con cuantización INT8: aproximadamente 10-11 GB.
- VRAM estimada con cuantización INT4: aproximadamente 5-6 GB.
- GPU recomendadas: RTX 4090 (24 GB) o A100 (40/80 GB) para inferencia en FP16; GPUs consumer de 12-16 GB (RTX 3080/4080) con cuantización INT8.
- El checkpoint cabe en GPUs consumer de gama alta con cuantización, pero no se recomienda su uso en producción.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (todas compatibles con modelos de la serie Qwen).
- Latencia y throughput: no disponible para este checkpoint específico.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables, ya que este checkpoint es un resultado negativo experimental sin evaluación pública. La comparación más relevante es con su propio modelo base:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache 2.0 | Modelo base, funcional |
| opus-high-v3.h032.sft-v8c.step_4 | 9,4B | no disponible | Apache 2.0 | Checkpoint intermedio, sin mejora |
| agentic-ptb/opus-high-v1 | no disponible | no disponible | Apache 2.0 | Ejecución previa, también con resultados negativos |

No se recomienda comparar este checkpoint con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B o Mistral 7B) porque no tiene un rendimiento validado y su propósito es documental.

## Limitaciones y advertencias

- Resultado negativo: la model card indica explícitamente que la ejecución no encontró ninguna mejora en los pesos entrenados. No debe utilizarse como modelo funcional.
- Sin evaluación de rendimiento: no se han publicado benchmarks ni evaluaciones cualitativas de este checkpoint.
- No apto para producción: al ser un checkpoint intermedio sin validación, no debe desplegarse en aplicaciones reales.
- Riesgo de alucinación y sesgos: heredados del modelo base Qwen 3.5, sin mitigación adicional.
- Información incompleta: no se han publicado detalles sobre el dataset de entrenamiento, la composición de datos, ni la configuración exacta del SFT.
- Advertencia de interpretación: la model card advierte que no se debe inferir calidad a partir de la publicación. Los resultados negativos son valiosos para la investigación, pero no para uso práctico.
- Licencia Apache 2.0: permite uso comercial, pero las limitaciones funcionales del modelo hacen desaconsejable su uso en entornos comerciales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h032.sft-v8c.step_4)
- [Dataset de la ejecución opus-high-v3](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice del proyecto AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Modelo base Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
- [Página de resultados de agentic-ptb en HuggingFace](https://huggingface.co/models?other=agentic-ptb)
